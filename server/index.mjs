import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  checkDatabase,
  closeDatabase,
  databaseConnectionSource,
  databaseEnvironment,
  query,
} from "./db.mjs";
import {
  clearSessionCookies,
  createSession,
  getSession,
  sessionCookies,
  verifySession,
} from "./session.mjs";

const PORT = Number(process.env.CUSTOMER_PORTAL_API_PORT ?? 18444);
const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = APP_ENV === "production" || process.env.NODE_ENV === "production";
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function sendJson(response, status, value, headers = {}) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(body);
}

function sendEmpty(response, status, headers = {}) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end();
}

function sendError(response, status, message) {
  sendJson(response, status, { message });
}

async function readJson(request) {
  const chunks = [];
  let length = 0;

  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function safeReturnTo(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    role: row.role,
    customerType: row.customer_type ?? null,
  };
}

async function findPortalUser(id) {
  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where id = $1
      limit 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function requireUser(request, response) {
  const session = getSession(request);
  if (!session) {
    sendError(response, 401, "Authentication required.");
    return null;
  }

  const user = await findPortalUser(session.id);
  if (!user || ["suspended", "blocked", "deleted"].includes(user.account_status)) {
    sendError(response, 401, "Session is no longer valid.");
    return null;
  }
  return user;
}

function authResponse(user, token) {
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
    },
  };
}

function bootstrapResponse(user, requestedReturnTo) {
  const onboardingStatus = user.account_status ?? "active";
  const onboardingComplete = onboardingStatus === "active";
  const allowedDestination = onboardingComplete ? safeReturnTo(requestedReturnTo) ?? "/" : "/onboarding";

  return {
    authenticated: true,
    user: normalizeUser(user),
    role: user.role,
    onboardingComplete,
    onboardingStatus,
    customerType: user.customer_type ?? null,
    customerContext: {
      status: onboardingStatus,
      companyId: null,
      company: user.company ? { name: user.company } : null,
      activeMemberships: [],
      pendingRequest: null,
    },
    vendorApprovalStatus: user.role === "vendor" ? "pending" : null,
    allowedDestination,
    safeReturnTo: safeReturnTo(requestedReturnTo),
  };
}

async function handleHealth(response) {
  try {
    await checkDatabase();
    sendJson(response, 200, {
      status: "ok",
      service: "customer-portal-api",
      appEnv: APP_ENV,
      database: "connected",
      databaseEnvironment,
      databaseConnectionSource,
    });
  } catch {
    sendJson(response, 503, {
      status: "degraded",
      service: "customer-portal-api",
      appEnv: APP_ENV,
      database: "unavailable",
      databaseEnvironment,
      databaseConnectionSource,
    });
  }
}

async function handleCapabilities(response) {
  sendJson(response, 200, {
    google: false,
    emailOtp: false,
    whatsappOtp: false,
    devLogin: !IS_PRODUCTION,
  });
}

async function handleDevLogin(request, response) {
  if (IS_PRODUCTION) {
    sendError(response, 404, "Development login is disabled in production.");
    return;
  }

  const body = await readJson(request);
  const role = body.role;
  if (!["customer", "admin", "vendor"].includes(role)) {
    sendError(response, 400, "Unsupported development role.");
    return;
  }

  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where role = $1
        and account_status not in ('suspended', 'blocked', 'deleted')
      order by id
      limit 1`,
    [role],
  );
  const user = result.rows[0];
  if (!user) {
    sendError(response, 404, `No development ${role} account is available.`);
    return;
  }

  const token = createSession(user);
  sendJson(response, 200, {
    token,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }, { "Set-Cookie": sessionCookies(token) });
}

async function handleLogin(request, response) {
  const body = await readJson(request);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    sendError(response, 400, "Email and password are required.");
    return;
  }

  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status, password_hash
       from public.portal_customers
      where lower(email) = $1
      limit 1`,
    [email],
  );
  const user = result.rows[0];
  if (
    !user ||
    ["suspended", "blocked", "deleted"].includes(user.account_status) ||
    !user.password_hash ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    sendError(response, 401, "Email or password is incorrect.");
    return;
  }

  const token = createSession(user);
  sendJson(response, 200, authResponse(user, token), {
    "Set-Cookie": sessionCookies(token),
  });
}

async function handleSetCookie(request, response) {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const session = verifySession(token);
  if (!session) {
    sendError(response, 401, "Invalid session token.");
    return;
  }
  sendEmpty(response, 204, { "Set-Cookie": sessionCookies(token) });
}

async function handleAuthMe(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;
  sendJson(response, 200, {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
  });
}

async function handleBootstrap(request, response, url) {
  const user = await requireUser(request, response);
  if (!user) return;
  sendJson(response, 200, bootstrapResponse(user, url.searchParams.get("returnTo")));
}

async function handleNotifications(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;

  const result = await query(
    `select id, type, title, message, payload, is_read, created_at
       from public.portal_customer_notifications
      where portal_customer_id = $1
      order by created_at desc
      limit 50`,
    [user.id],
  );
  const items = result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    payload: row.payload ?? {},
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
  sendJson(response, 200, {
    items,
    unreadCount: items.filter((item) => !item.isRead).length,
  });
}

async function handleMarkNotificationRead(request, response, user, id) {
  if (!Number.isInteger(id)) {
    sendError(response, 400, "Invalid notification id.");
    return;
  }
  await query(
    `update public.portal_customer_notifications
        set is_read = true, read_at = now()
      where id = $1 and portal_customer_id = $2`,
    [id, user.id],
  );
  sendEmpty(response, 204);
}

async function handleMarkAllNotificationsRead(response, user) {
  await query(
    `update public.portal_customer_notifications
        set is_read = true, read_at = now()
      where portal_customer_id = $1 and is_read = false`,
    [user.id],
  );
  sendEmpty(response, 204);
}

async function handleNotificationEvents(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.write(`event: connected\ndata: ${JSON.stringify({ service: "customer-portal-api" })}\n\n`);
  const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), 20_000);
  request.on("close", () => clearInterval(heartbeat));
}

function handlePublicEvents(request, response) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.write(`event: connected\ndata: ${JSON.stringify({ service: "customer-portal-api" })}\n\n`);
  const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), 20_000);
  request.on("close", () => clearInterval(heartbeat));
}

function handleUsdIdrRate(response) {
  sendJson(response, 200, { rate: 16_300, source: "customer-portal-default" });
}

async function handleServices(response) {
  const result = await query(
    `select id, service_code, service_name, category, description, base_price,
            currency, estimated_days, sla_hours, is_active
       from public.service_catalog
      where is_active = true
      order by category nulls last, service_name`,
  );
  sendJson(response, 200, {
    items: result.rows.map((row) => ({
      id: row.id,
      code: row.service_code,
      name: row.service_name,
      category: row.category,
      description: row.description,
      basePrice: row.base_price,
      currency: row.currency,
      estimatedDays: row.estimated_days,
      slaHours: row.sla_hours,
    })),
  });
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function catalogCategory(row) {
  if (row.category_key) return String(row.category_key).toLowerCase();
  const value = `${row.kategori ?? ""} ${row.subcategory ?? ""} ${row.name ?? ""}`.toLowerCase();
  const aliases = [
    ["coffee", ["coffee", "kopi", "arabica", "gayo"]],
    ["furniture", ["furniture", "kursi", "meja"]],
    ["sea_freight", ["sea freight", "ocean freight", "freight laut", "fcl", "lcl"]],
    ["air_freight", ["air freight", "freight udara", "cargo udara"]],
    ["fresh_vegetable", ["sayuran", "bawang", "cabai"]],
    ["rice", ["beras", "rice"]],
    ["frozen_food", ["frozen"]],
  ];
  return aliases.find(([, terms]) => terms.some((term) => value.includes(term)))?.[0] ?? null;
}

function mediaFromRow(row) {
  const raw = parseJson(row.media_assets, []);
  const assets = Array.isArray(raw) ? raw : [];
  const media = assets
    .filter((asset) => asset && typeof asset.url === "string" && asset.url.trim())
    .map((asset, index) => ({
      id: index + 1,
      vendorCatalogItemId: row.id,
      vendorId: row.vendor_id ?? null,
      mediaType: asset.type === "video" ? "video" : "image",
      fileUrl: asset.url,
      thumbnailUrl: asset.thumbnailUrl ?? null,
      externalUrl: asset.externalUrl ?? null,
      title: asset.title ?? null,
      description: asset.description ?? null,
      sortOrder: Number(asset.sortOrder ?? index),
      isPrimary: Boolean(asset.isPrimary) || index === 0,
      isActive: true,
      visibility: asset.visibility ?? "public",
      originalFilename: asset.originalFilename ?? null,
    }));
  const primary = media.find((asset) => asset.mediaType === "image" && asset.isPrimary)
    ?? media.find((asset) => asset.mediaType === "image")
    ?? null;
  return {
    media,
    primaryImageUrl: primary?.fileUrl ?? null,
    hasVideo: media.some((asset) => asset.mediaType === "video"),
  };
}

function mapCatalogItem(row) {
  const media = mediaFromRow(row);
  return {
    id: row.id,
    vendorId: Number(row.vendor_id ?? 0),
    vendorName: row.vendor_name ?? null,
    templateKind: row.template_kind ?? row.type ?? null,
    categoryKey: catalogCategory(row),
    serviceType: row.service_type ?? null,
    templateId: row.template_id ?? null,
    templateSnapshot: parseJson(row.template_snapshot, null),
    name: row.name,
    description: row.description || null,
    kategori: row.kategori ?? null,
    subcategory: row.subcategory ?? null,
    specValues: parseJson(row.spec_values, null),
    priceSell: row.price_sell == null ? null : Number(row.price_sell),
    currency: row.currency ?? "IDR",
    unit: row.unit ?? null,
    moq: row.moq == null ? null : Number(row.moq),
    stockStatus: row.stock_status ?? null,
    stockQty: row.stock_qty == null ? null : Number(row.stock_qty),
    leadTime: row.lead_time ?? null,
    location: row.location ?? null,
    origin: row.origin ?? null,
    validityDate: row.validity_date ?? null,
    isFeatured: Boolean(row.is_featured),
    documents: parseJson(row.documents, []),
    publishedAt: row.published_at ?? null,
    sortOrder: Number(row.sort_order ?? 0),
    media: media.media,
    primaryImageUrl: media.primaryImageUrl,
    hasVideo: media.hasVideo,
  };
}

async function getPublishedCatalogItems() {
  const result = await query(
    `select id, vendor_id, vendor_name, type, name, description, unit, kategori, subcategory,
            template_kind, category_key, service_type, template_id, template_snapshot,
            spec_values, price_sell, currency, stock_status, stock_qty, moq, lead_time,
            validity_date, location, origin, documents, published_at, sort_order,
            media_assets, is_featured, featured_until
       from public.vendor_catalog_items
      where type = 'product'
        and is_active = true
        and is_published = true
        and status = 'published'
      order by sort_order asc, published_at desc nulls last, id desc`,
  );
  return result.rows;
}

async function handlePublicProducts(response) {
  const result = await query(
    `select id, name, description, price, unit, unit_options, subcategory,
            image_url, media_items, item_type, weight_kg, length_cm, width_cm,
            height_cm, goods_type, currency_code
       from public.products
      where is_active = true and item_type <> 'jasa'
      order by id`,
  );
  sendJson(response, 200, result.rows.map((row) => {
    const mediaItems = parseJson(row.media_items, []);
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      price: Number(row.price ?? 0),
      unit: row.unit ?? "pcs",
      unitOptions: Array.isArray(parseJson(row.unit_options, [])) ? parseJson(row.unit_options, []) : [],
      subcategory: row.subcategory ?? null,
      imageUrl: row.image_url ?? null,
      mediaItems: Array.isArray(mediaItems) ? mediaItems : [],
      categories: [row.subcategory, row.item_type].filter(Boolean),
      weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
      lengthCm: row.length_cm == null ? null : Number(row.length_cm),
      widthCm: row.width_cm == null ? null : Number(row.width_cm),
      heightCm: row.height_cm == null ? null : Number(row.height_cm),
      goodsType: row.goods_type ?? null,
      currencyCode: row.currency_code ?? "IDR",
    };
  }));
}

async function handleMarketplace(response, url) {
  const search = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const category = (url.searchParams.get("category") ?? "").trim().toLowerCase();
  const rows = await getPublishedCatalogItems();
  const items = rows
    .map(mapCatalogItem)
    .filter((item) => {
      if (category && category !== "all" && item.categoryKey !== category) return false;
      if (!search) return true;
      return `${item.name} ${item.description ?? ""} ${item.kategori ?? ""} ${item.subcategory ?? ""}`
        .toLowerCase()
        .includes(search);
    });
  sendJson(response, 200, items);
}

async function handleMarketplaceFeatured(response, url) {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 6), 1), 24);
  const rows = await getPublishedCatalogItems();
  const items = rows
    .filter((row) => row.is_featured)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      vendorId: Number(row.vendor_id ?? 0),
      vendorName: row.vendor_name ?? null,
      name: row.name,
      isFeatured: true,
    }));
  sendJson(response, 200, items);
}

async function handleMarketplaceStats(response) {
  const result = await query(
    `select count(*)::int as item_count,
            count(distinct vendor_id)::int as vendor_count,
            count(distinct coalesce(category_key, kategori))::int as category_count
       from public.vendor_catalog_items
      where type = 'product'
        and is_active = true
        and is_published = true
        and status = 'published'`,
  );
  const row = result.rows[0] ?? {};
  sendJson(response, 200, {
    itemCount: Number(row.item_count ?? 0),
    vendorCount: Number(row.vendor_count ?? 0),
    categoryCount: Number(row.category_count ?? 0),
  });
}

async function handleMarketplaceCategories(response) {
  const rows = await getPublishedCatalogItems();
  sendJson(response, 200, [...new Set(rows.map(catalogCategory).filter(Boolean))]);
}

async function route(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/api/healthz") {
    await handleHealth(response);
    return;
  }
  if (request.method === "OPTIONS") {
    sendEmpty(response, 204, {
      Allow: "GET,POST,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/auth/capabilities") {
    await handleCapabilities(response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/dev-login") {
    await handleDevLogin(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/login") {
    await handleLogin(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/set-cookie") {
    await handleSetCookie(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/logout") {
    sendEmpty(response, 204, { "Set-Cookie": clearSessionCookies() });
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/auth/me") {
    await handleAuthMe(request, response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/auth/bootstrap") {
    await handleBootstrap(request, response, url);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/notifications") {
    await handleNotifications(request, response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/notifications/events") {
    await handleNotificationEvents(request, response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/ecommerce/events") {
    handlePublicEvents(request, response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/ecommerce/usd-idr-rate") {
    handleUsdIdrRate(response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/notifications/read-all") {
    const user = await requireUser(request, response);
    if (user) await handleMarkAllNotificationsRead(response, user);
    return;
  }
  const notificationMatch = pathname.match(/^\/api\/portal\/notifications\/(\d+)\/read$/);
  if (request.method === "POST" && notificationMatch) {
    const user = await requireUser(request, response);
    if (user) await handleMarkNotificationRead(request, response, user, Number(notificationMatch[1]));
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/services") {
    await handleServices(response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/products") {
    await handlePublicProducts(response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/marketplace") {
    await handleMarketplace(response, url);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/marketplace/featured") {
    await handleMarketplaceFeatured(response, url);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/marketplace/stats") {
    await handleMarketplaceStats(response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/marketplace/categories") {
    await handleMarketplaceCategories(response);
    return;
  }

  sendJson(response, 404, {
    message: "Customer Portal API route not found.",
    service: "customer-portal-api",
  });
}

const server = http.createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("[customer-portal-api] request failed", error?.message ?? error);
    if (!response.headersSent) sendError(response, status, status === 500 ? "Internal server error." : error.message);
    else response.end();
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[customer-portal-api] listening on :${PORT} (${APP_ENV})`);
});

async function shutdown(signal) {
  console.log(`[customer-portal-api] ${signal}, shutting down`);
  server.close();
  await closeDatabase();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));