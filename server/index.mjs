import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { serveStatic } from "./static-server.mjs";
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
import {
  handleAdminApprovals,
  handleAdminCompanyRequests,
  handleAdminCustomerStats,
  handleAdminCustomers,
  handleAdminNotifications,
  handleOnboardingComplete,
  handleDocumentUpload,
  handleKtpOcr,
  handleOnboardingStatus,
  handleOrganizationMutation,
  handleServiceOperations,
  handleVerification,
} from "./admin-portal.mjs";
import { checkStorageReadiness, uploadPaymentProof } from "./storage.mjs";
import { handleMarketplaceRoute } from "./marketplace-service.mjs";
import {
  handleAdminInvoices,
  handleAdminPayments,
  handleCustomerInvoices,
  handleCustomerPayments,
} from "./billing-operations.mjs";
import { handleFreightRoute } from "./freight-operations.mjs";
import { handleToolRoute } from "./tool-operations.mjs";
import {
  handleCapabilities,
  handleEmailOtpRequest,
  handleEmailOtpVerify,
  handleSignup,
  handleGoogleCallback,
  handleGoogleStart,
  handleWaLogin,
  handleWaOtpRequest,
  handleWaOtpVerify,
  handleWaRegister,
  handleWaTrustedLogin,
} from "./auth-providers.mjs";
import {
  handleAdminVendorRoutes,
  handleVendorInvitationRoute,
  handleVendorPortalRoutes,
} from "./vendor-portal.mjs";
import { handleAdminCatalog } from "./admin-catalog.mjs";
import { handleAdminFeatured } from "./admin-featured.mjs";
import { handleAdminVendorCatalog } from "./admin-vendor-catalog.mjs";
import { handleAdminLegacy, handlePortalContent } from "./admin-legacy.mjs";
import {
  handleAdminReply,
  handleChat,
  handleQuickOrder,
  handleQuickProductOrder,
  handleSession,
  handleSessionByOrder,
  handleUpload,
} from "./ai-agent.mjs";

const PORT = Number(process.env.PORT ?? process.env.CUSTOMER_PORTAL_API_PORT ?? 18444);
const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = APP_ENV === "production" || process.env.NODE_ENV === "production";
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_MULTIPART_BODY_BYTES = 6 * 1024 * 1024;
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DEFAULT_PUBLIC_ASSET_ORIGIN = "https://xssrfshdrtdfupgqwfdw.supabase.co";
const PUBLIC_ASSET_URL_PREFIX = "/storage/v1/object/public/public-assets/";
const LEGACY_PORTAL_BUCKET_URL_PREFIX = "/storage/v1/object/public/portal-assets/";


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

function publicAssetOrigin() {
  const configured = (
    IS_PRODUCTION
      ? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
      : process.env.SUPABASE_URL_DEV
        ?? process.env.VITE_SUPABASE_URL_DEV
        ?? process.env.SUPABASE_URL
        ?? process.env.VITE_SUPABASE_URL
  )?.trim();
  return (configured || DEFAULT_PUBLIC_ASSET_ORIGIN).replace(/\/+$/, "");
}

function canonicalPublicAssetUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();

  if (trimmed.startsWith("/api/storage/public-objects/portal-assets/")) {
    const objectKey = trimmed.slice("/api/storage/public-objects/".length);
    if (!objectKey || objectKey.split(/[?#]/, 1)[0].split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) {
      return null;
    }
    return `${publicAssetOrigin()}/storage/v1/object/public/public-assets/${objectKey}`;
  }

  if (trimmed.startsWith("portal-assets/")) {
    const objectKey = trimmed.split(/[?#]/, 1)[0];
    if (objectKey.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) return null;
    return `${publicAssetOrigin()}/storage/v1/object/public/public-assets/${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith(LEGACY_PORTAL_BUCKET_URL_PREFIX)) {
      const objectKey = parsed.pathname.slice(LEGACY_PORTAL_BUCKET_URL_PREFIX.length);
      if (!objectKey || objectKey.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) return null;
      return `${publicAssetOrigin()}/storage/v1/object/public/public-assets/portal-assets/${objectKey}${parsed.search}${parsed.hash}`;
    }
    if (parsed.pathname.includes(PUBLIC_ASSET_URL_PREFIX)) return trimmed;
  } catch {
    return trimmed.startsWith("/") ? null : trimmed;
  }

  return trimmed;
}

function forwardedValue(request, name) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();
}

function requestOrigin(request) {
  const protocol = forwardedValue(request, "x-forwarded-proto")
    ?? (IS_PRODUCTION ? "https" : "http");
  const host = forwardedValue(request, "x-forwarded-host")
    ?? request.headers.host
    ?? "localhost";
  return `${protocol}://${host}`;
}

function allowedOrigins(request) {
  const configured = (process.env.PORTAL_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const sameOrigin = requestOrigin(request);
  if (IS_PRODUCTION) return new Set([...configured, sameOrigin]);

  const previewDomain = process.env.REPLIT_DEV_DOMAIN?.trim();
  if (previewDomain) {
    configured.push(`https://${previewDomain}`, `https://${previewDomain}:3000`);
  }
  configured.push(
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    sameOrigin,
  );
  return new Set(configured);
}

function isAllowedOrigin(request, origin) {
  return Boolean(origin) && allowedOrigins(request).has(origin.replace(/\/+$/, ""));
}

function corsHeaders(request) {
  const origin = request.headers.origin;
  return origin && isAllowedOrigin(request, origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
      }
    : {};
}

function enforceRequestPolicy(request) {
  const origin = request.headers.origin;
  if (origin && !isAllowedOrigin(request, origin)) {
    const error = new Error("Origin is not allowed.");
    error.statusCode = 403;
    throw error;
  }

  if (!IS_PRODUCTION || !MUTATION_METHODS.has(request.method ?? "")) return;

  const fetchSite = request.headers["sec-fetch-site"];
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) {
    const error = new Error("Cross-site mutation is not allowed.");
    error.statusCode = 403;
    throw error;
  }
}

async function readRawBody(request, limit = MAX_BODY_BYTES) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > limit) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
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

async function readMultipartForm(request) {
  const contentType = request.headers["content-type"];
  if (!contentType?.startsWith("multipart/form-data")) {
    const error = new Error("Request harus menggunakan multipart/form-data.");
    error.statusCode = 400;
    throw error;
  }
  const rawBody = await readRawBody(request, MAX_MULTIPART_BODY_BYTES);
  try {
    const form = await new Request("http://portal.local/upload", {
      method: "POST",
      headers: { "content-type": contentType },
      body: rawBody,
    }).formData();
    return {
      file: form.get("file"),
      docType: form.get("docType") ?? form.get("documentType"),
    };
  } catch {
    const error = new Error("Multipart document request tidak valid.");
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
    `select id, name, email, phone, company, role, customer_type, account_status, created_at
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
  if (!user || !["active", null, undefined].includes(user.account_status)) {
    sendError(response, 401, "Session is no longer valid.");
    return null;
  }
  return user;
}

async function requireAdmin(request, response) {
  const user = await requireUser(request, response);
  if (!user) return null;
  if (user.role !== "admin") {
    sendError(response, 403, "Admin authorization required.");
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
      company: user.company ?? null,
      role: user.role,
      customerType: user.customer_type ?? null,
    },
  };
}

function bootstrapResponse(user, requestedReturnTo, customerContext) {
  const onboardingStatus = user.account_status ?? "active";
  const onboardingComplete = onboardingStatus === "active";
  const organizationBlocked = ["company_pending", "company_unresolved", "legacy_unresolved"]
    .includes(customerContext?.status);
  const defaultDestination = user.role === "admin"
    ? "/admin"
    : user.role === "vendor"
      ? "/vendor-dashboard"
      : "/dashboard";
  const allowedDestination = onboardingComplete && !organizationBlocked
    ? safeReturnTo(requestedReturnTo) ?? defaultDestination
    : "/onboarding";

  return {
    authenticated: true,
    user: normalizeUser(user),
    role: user.role,
    onboardingComplete,
    onboardingStatus,
    customerType: user.customer_type ?? null,
    customerContext: customerContext ?? {
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

async function handleReadiness(response) {
  try {
    await checkDatabase();
    const storage = await checkStorageReadiness();
    sendJson(response, 200, {
      status: "ready",
      service: "customer-portal",
      appEnv: APP_ENV,
      database: "connected",
      databaseEnvironment,
      storage: storage.private ? "private" : "unavailable",
      storageBucket: storage.bucket,
    });
  } catch {
    sendJson(response, 503, {
      status: "not_ready",
      service: "customer-portal",
      appEnv: APP_ENV,
      database: "unavailable",
      databaseEnvironment,
      storage: "unavailable",
    });
  }
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

  const devRole = role;
  const devEmail = `dev-${devRole}@dev.local`;
  const devName = `Dev ${devRole.charAt(0).toUpperCase()}${devRole.slice(1)}`;
  let result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where email = $1
        and account_status not in ('suspended', 'blocked', 'deleted')
      limit 1`,
    [devEmail],
  );
  if (!result.rows[0]) {
    result = await query(
      `insert into public.portal_customers (name, email, password_hash, role)
       values ($1, $2, $3, $4)
       returning id, name, email, phone, company, role, customer_type, account_status`,
      [devName, devEmail, "", devRole],
    );
  }
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
     !["active", null, undefined].includes(user.account_status) ||
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
  const services = await query(
    `select service_id
       from public.portal_customer_services
      where customer_id = $1
      order by service_id`,
    [user.id],
  );
  sendJson(response, 200, {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    company: user.company ?? null,
    role: user.role,
    serviceIds: services.rows.map((row) => Number(row.service_id)),
    createdAt: user.created_at ?? null,
  });
}

async function handleBootstrap(request, response, url) {
  const user = await requireUser(request, response);
  if (!user) return;
  const customerContext = await getPortalOrganizationContext(user);
  sendJson(response, 200, bootstrapResponse(user, url.searchParams.get("returnTo"), customerContext));
}

async function getAccessibleCompanyIds(user) {
  const result = await query(
    `select company_id
       from public.portal_company_members
      where portal_customer_id = $1
        and is_active = true`,
    [user.id],
  );
  return result.rows
    .map((row) => Number(row.company_id))
    .filter((companyId) => Number.isInteger(companyId));
}

function portalOwnerPredicate(alias, emailColumn) {
  return `(
    ${alias}.portal_customer_id = $1
    or lower(${alias}.${emailColumn}) = lower($2)
    or ${alias}.company_id = any($3::int[])
  )`;
}

async function getPortalOrganizationContext(user) {
  const [membershipResult, requestResult] = await Promise.all([
    query(
      `select m.company_id, m.buyer_role, m.department, m.cost_center,
              m.approval_level, m.spending_limit,
              c.name, c.legal_name, c.company_name, c.code, c.company_code
         from public.portal_company_members m
         join public.companies c on c.id = m.company_id
        where m.portal_customer_id = $1
          and m.is_active = true
        order by m.created_at desc`,
      [user.id],
    ),
    query(
      `select requested_company_name, requested_registration_number, status,
              matched_company_id, created_at
         from public.portal_company_requests
        where portal_customer_id = $1
          and status in ('pending', 'submitted', 'in_review')
        order by created_at desc
        limit 1`,
      [user.id],
    ),
  ]);

  const membership = membershipResult.rows[0] ?? null;
  const pendingRequest = requestResult.rows[0] ?? null;
  const customerType = user.customer_type === "company" ? "company" : "individual";
  const company = membership
    ? {
        id: Number(membership.company_id),
        name: membership.company_name ?? membership.legal_name ?? membership.name,
        code: membership.company_code ?? membership.code ?? null,
      }
    : null;
  const status = membership
    ? "company_mapped"
    : pendingRequest
      ? "company_pending"
      : customerType === "individual"
        ? "individual"
        : "company_unresolved";

  return {
    status,
    customerType,
    companyId: company?.id ?? null,
    company,
    activeMemberships: membershipResult.rows.map((row) => ({
      companyId: Number(row.company_id),
      buyerRole: row.buyer_role,
      department: row.department ?? null,
      costCenter: row.cost_center ?? null,
      approvalLevel: row.approval_level ?? null,
      spendingLimit: row.spending_limit ?? null,
    })),
    pendingRequest: pendingRequest
      ? {
          requestedCompanyName: pendingRequest.requested_company_name,
          requestedRegistrationNumber: pendingRequest.requested_registration_number ?? null,
          status: pendingRequest.status,
          matchedCompanyId: pendingRequest.matched_company_id ?? null,
          createdAt: pendingRequest.created_at,
        }
      : null,
  };
}

async function handleOrganization(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;
  sendJson(response, 200, await getPortalOrganizationContext(user));
}

async function handleOrganizationCompanies(request, response, url) {
  const user = await requireUser(request, response);
  if (!user) return;
  const search = (url.searchParams.get("search") ?? "").trim();
  const result = await query(
    `select id, coalesce(company_name, legal_name, name) as name,
            coalesce(company_code, code) as code
       from public.companies
      where coalesce(is_active, true) = true
        and ($1 = '' or coalesce(company_name, legal_name, name) ilike '%' || $1 || '%'
             or coalesce(company_code, code) ilike '%' || $1 || '%')
      order by coalesce(company_name, legal_name, name)
      limit 50`,
    [search],
  );
  sendJson(response, 200, result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    code: row.code ?? null,
  })));
}

async function handlePortalOrderFeed(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;
  const companyIds = await getAccessibleCompanyIds(user);
  const params = [user.id, user.email, companyIds];
  const [crmResult, logisticResult, productResult, rfqResult] = await Promise.all([
    query(
      `select o.id, coalesce(o.id::text, '') as doc_number, o.status,
              coalesce(o.grand_total, o.total_amount, o.total, 0) as grand_total,
              o.created_at
         from public.orders o
        where (
          lower(o.customer_email) = lower($1)
          or lower(o.email) = lower($1)
          or o.company_id = any($2::int[])
        )
        order by o.created_at desc
        limit 100`,
      [user.email, companyIds],
    ),
    query(
      `select l.id, l.order_number, l.status, l.grand_total, l.created_at,
              l.shipment_type, l.origin, l.destination
         from public.logistic_orders l
        where ${portalOwnerPredicate("l", "email")}
        order by l.created_at desc
        limit 100`,
      params,
    ),
    query(
      `select p.id, p.order_number, p.status, p.grand_total, p.created_at,
              p.tracking_token
         from public.portal_product_orders p
        where ${portalOwnerPredicate("p", "email")}
        order by p.created_at desc
        limit 100`,
      params,
    ),
    query(
      `select r.id as rfq_id, r.rfq_number, r.status as rfq_status,
              r.approval_status, r.created_at
         from public.mkt_rfqs r
        where ${portalOwnerPredicate("r", "buyer_email")}
        order by r.created_at desc
        limit 100`,
      params,
    ),
  ]);

  sendJson(response, 200, {
    crmOrders: crmResult.rows.map((row) => ({
      id: Number(row.id),
      docNumber: row.doc_number,
      status: row.status,
      grandTotal: Number(row.grand_total ?? 0),
      createdAt: row.created_at,
    })),
    logisticOrders: logisticResult.rows.map((row) => ({
      id: Number(row.id),
      orderNumber: row.order_number,
      status: row.status,
      grandTotal: Number(row.grand_total ?? 0),
      createdAt: row.created_at,
      shipmentType: row.shipment_type ?? null,
      origin: row.origin ?? null,
      destination: row.destination ?? null,
    })),
    productOrders: productResult.rows.map((row) => ({
      id: Number(row.id),
      orderNumber: row.order_number,
      status: row.status,
      grandTotal: Number(row.grand_total ?? 0),
      createdAt: row.created_at,
      trackingToken: row.tracking_token ?? null,
    })),
    marketplaceRfqs: rfqResult.rows.map((row) => ({
      rfqId: Number(row.rfq_id),
      rfqNumber: row.rfq_number,
      rfqStatus: row.rfq_status,
      approvalStatus: row.approval_status,
      createdAt: row.created_at,
    })),
  });
}

function mapPortalOrder(row) {
  return {
    id: Number(row.id),
    docNumber: row.doc_number ?? String(row.id),
    status: row.status,
    grandTotal: Number(row.grand_total ?? 0),
    createdAt: row.created_at,
    items: row.items ?? row.line_items ?? null,
  };
}

function mapPortalLogisticOrder(row) {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    status: row.status,
    grandTotal: Number(row.grand_total ?? 0),
    createdAt: row.created_at,
    shipmentType: row.shipment_type ?? "",
    origin: row.origin ?? "",
    destination: row.destination ?? "",
  };
}

function mapPortalProductOrder(row) {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    status: row.status,
    grandTotal: Number(row.grand_total ?? 0),
    createdAt: row.created_at,
    trackingToken: row.tracking_token ?? null,
  };
}

function mapPortalServiceOrder(row) {
  return {
    id: Number(row.id),
    orderNumber: row.request_number,
    serviceType: row.trade_type ?? row.request_type ?? "service-request",
    status: row.status,
    grandTotal: Number(row.total_quoted_price ?? row.total_estimated_price ?? 0),
    createdAt: row.created_at,
    subtitle: row.package_name_snapshot ?? row.request_type ?? "Service request",
  };
}

async function handleCreateProductOrder(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;
  const body = await readJson(request);
  const items = Array.isArray(body.items) ? body.items : [];
  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const shippingAddress = String(body.shippingAddress ?? "").trim();
  const idempotencyKey = String(body.idempotencyKey ?? "").trim();
  if (!customerName || !phone || items.length === 0 || !idempotencyKey) {
    sendError(response, 400, "Data pesanan produk belum lengkap.");
    return;
  }
  const productIds = [...new Set(items.map((item) => Number(item?.productId)).filter(Number.isInteger))];
  if (productIds.length !== items.length) {
    sendError(response, 400, "Item produk tidak valid.");
    return;
  }
  const products = await query(
    `select id, name, price, unit, weight_kg, length_cm, width_cm, height_cm, goods_type
       from public.products where is_active = true and id = any($1::int[])`,
    [productIds],
  );
  const productMap = new Map(products.rows.map((row) => [Number(row.id), row]));
  if (productMap.size !== productIds.length) {
    sendError(response, 400, "Satu atau lebih produk tidak tersedia.");
    return;
  }
  const canonicalItems = items.map((item) => {
    const product = productMap.get(Number(item.productId));
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 100000) throw Object.assign(new Error("Jumlah produk tidak valid."), { statusCode: 400 });
    const unitPrice = Number(product.price ?? 0);
    return { product, qty, unitPrice, subtotal: unitPrice * qty };
  });
  const subtotal = canonicalItems.reduce((sum, item) => sum + item.subtotal, 0);
  const serviceCost = Math.max(0, Number(body.selectedService?.estimatedCost ?? 0) || 0);
  const taxRate = 11;
  const taxAmount = Math.round((subtotal + serviceCost) * taxRate / 100);
  const grandTotal = subtotal + serviceCost + taxAmount;
  const companyIds = await getAccessibleCompanyIds(user);
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);
    const replay = await client.query(
      `select order_number from public.portal_product_orders
        where idempotency_key = $1 and portal_customer_id = $2 limit 1`,
      [idempotencyKey, user.id],
    );
    if (replay.rows[0]) {
      await client.query("commit");
      sendJson(response, 200, { orderNumber: replay.rows[0].order_number, alreadyProcessed: true });
      return;
    }
    const orderNumber = `CPO-${new Date().toISOString().slice(2,10).replaceAll("-", "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const order = await client.query(
      `insert into public.portal_product_orders (
         order_number, customer_name, email, phone, shipping_address, notes,
         subtotal, tax_amount, tax_rate, tax_treatment, grand_total, status,
         product_category, template_id, template_version, custom_field_values,
         uploaded_documents, checklist_status, packaging_notes, conditional_flags,
         shipping_method, order_type, shipment_cost, product_price,
         portal_customer_id, company_id, idempotency_key
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,'exclusive',$10,'New Order',
         $11,$12,$13,$14::jsonb,$15::jsonb,$16::jsonb,$17,$18::jsonb,
         $19,$20,$21,$22,$23,$24,$25
       ) returning id, order_number`,
      [
        orderNumber, customerName, user.email, phone, shippingAddress, body.notes ? String(body.notes) : null,
        subtotal, taxAmount, taxRate, grandTotal,
        body.productCategory ?? null, body.templateId ?? null, body.templateVersion ?? null,
        JSON.stringify(body.customFieldValues ?? {}), JSON.stringify(body.uploadedDocuments ?? []),
        JSON.stringify(body.checklistStatus ?? {}), body.packagingNotes ?? null,
        JSON.stringify(body.conditionalFlags ?? {}), body.shippingMethod ?? null, body.orderType ?? "standard",
        serviceCost, subtotal, user.id, companyIds[0] ?? null, idempotencyKey,
      ],
    );
    for (const item of canonicalItems) {
      await client.query(
        `insert into public.portal_product_order_items (
           order_id, product_id, product_name, product_sku, unit, unit_price, qty, subtotal,
           weight_kg, length_cm, width_cm, height_cm, goods_type, product_scope, service_scope
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'customer_portal',$14)`,
        [
          order.rows[0].id, item.product.id, item.product.name, null, item.product.unit,
          item.unitPrice, item.qty, item.subtotal, item.product.weight_kg, item.product.length_cm,
          item.product.width_cm, item.product.height_cm, item.product.goods_type,
          body.selectedService?.serviceId ?? null,
        ],
      );
    }
    await client.query("commit");
    sendJson(response, 201, { orderNumber: order.rows[0].order_number });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function handlePortalCompatOrders(request, response, kind) {
  const user = await requireUser(request, response);
  if (!user) return;
  const companyIds = await getAccessibleCompanyIds(user);
  const params = [user.id, user.email, companyIds];

  if (kind === "orders") {
    if (request.method === "PATCH") {
      const id = Number(new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname.split("/").at(-2));
      if (!Number.isInteger(id) || id <= 0) {
        sendError(response, 400, "Order tidak valid.");
        return;
      }
      const updated = await query(
        `update public.orders
            set status = 'cancelled'
          where id = $1
            and status = 'draft'
            and (
              lower(coalesce(customer_email, '')) = lower($2)
              or lower(coalesce(email, '')) = lower($2)
              or company_id = any($3::int[])
            )
          returning id, coalesce(id::text, '') as doc_number, status,
                    coalesce(grand_total, total_amount, total, 0) as grand_total,
                    created_at, items, line_items`,
        [id, user.email, companyIds],
      );
      if (!updated.rows[0]) {
        sendError(response, 404, "Order tidak ditemukan atau tidak dapat dibatalkan.");
        return;
      }
      sendJson(response, 200, mapPortalOrder(updated.rows[0]));
      return;
    }
    if (request.method !== "GET") {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }
    const result = await query(
      `select id, coalesce(id::text, '') as doc_number, status,
              coalesce(grand_total, total_amount, total, 0) as grand_total,
              created_at, items, line_items
         from public.orders
        where (
          lower(coalesce(customer_email, '')) = lower($1)
          or lower(coalesce(email, '')) = lower($1)
          or company_id = any($2::int[])
        )
        order by created_at desc
        limit 100`,
      [user.email, companyIds],
    );
    sendJson(response, 200, result.rows.map(mapPortalOrder));
    return;
  }

  if (kind === "logistic-orders") {
    if (request.method === "PATCH") {
      const id = Number(new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname.split("/").at(-2));
      if (!Number.isInteger(id) || id <= 0) {
        sendError(response, 400, "Logistic order tidak valid.");
        return;
      }
      const updated = await query(
        `update public.logistic_orders
            set status = 'Cancelled', updated_at = now()
          where id = $4
            and status in ('Order Received', 'New Order', 'draft')
            and (
              portal_customer_id = $1
              or lower(coalesce(email, '')) = lower($2)
              or company_id = any($3::int[])
            )
          returning id, order_number, status, grand_total, created_at,
                    shipment_type, origin, destination`,
        params.concat(id),
      );
      if (!updated.rows[0]) {
        sendError(response, 404, "Logistic order tidak ditemukan atau tidak dapat dibatalkan.");
        return;
      }
      sendJson(response, 200, mapPortalLogisticOrder(updated.rows[0]));
      return;
    }
    if (request.method !== "GET") {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }
    const result = await query(
      `select id, order_number, status, grand_total, created_at,
              shipment_type, origin, destination
         from public.logistic_orders
        where (
          portal_customer_id = $1
          or lower(coalesce(email, '')) = lower($2)
          or company_id = any($3::int[])
        )
        order by created_at desc
        limit 100`,
      [user.id, null, companyIds],
    );
    sendJson(response, 200, result.rows.map(mapPortalLogisticOrder));
    return;
  }

  if (kind === "product-orders") {
    if (request.method !== "GET") {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }
    const result = await query(
      `select id, order_number, status, grand_total, created_at, tracking_token
         from public.portal_product_orders
        where (
          portal_customer_id = $1
          or lower(coalesce(email, '')) = lower($2)
          or company_id = any($3::int[])
        )
        order by created_at desc
        limit 100`,
      params,
    );
    sendJson(response, 200, result.rows.map(mapPortalProductOrder));
    return;
  }

  if (kind === "service-orders") {
    if (request.method !== "GET") {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }
    const result = await query(
      `select id, request_number, request_type, trade_type, status,
              total_estimated_price, total_quoted_price, package_name_snapshot, created_at
         from public.customer_service_requests
        where (
          portal_customer_id = $1
          or customer_id = $1
          or lower(coalesce(customer_email, '')) = lower($2)
          or company_id = any($3::int[])
        )
        order by created_at desc
        limit 100`,
      params,
    );
    sendJson(response, 200, result.rows.map(mapPortalServiceOrder));
    return;
  }

  sendError(response, 404, "Portal order route not found.");
}

async function handlePortalDashboardStats(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;
  const companyIds = await getAccessibleCompanyIds(user);
  const params = [user.id, user.email, companyIds];
  const [logistic, product, service, invoices] = await Promise.all([
    query(
      `select count(*)::int as total,
              count(*) filter (where status not in ('Completed','Cancelled','completed','cancelled','delivered'))::int as active,
              count(*) filter (where status in ('Completed','completed','delivered','done'))::int as completed
         from public.logistic_orders
        where portal_customer_id = $1
           or lower(coalesce(email, '')) = lower($2)
           or company_id = any($3::int[])`,
      params,
    ),
    query(
      `select count(*)::int as total,
              count(*) filter (where status not in ('Completed','Cancelled','completed','cancelled','delivered'))::int as active,
              count(*) filter (where status in ('Completed','completed','delivered','done'))::int as completed
         from public.portal_product_orders
        where portal_customer_id = $1
           or lower(coalesce(email, '')) = lower($2)
           or company_id = any($3::int[])`,
      params,
    ),
    query(
      `select count(*)::int as total,
              count(*) filter (where status not in ('completed','cancelled','done','rejected'))::int as active,
              count(*) filter (where status in ('completed','done'))::int as completed
         from public.customer_service_requests
        where portal_customer_id = $1
           or customer_id = $1
           or lower(coalesce(customer_email, '')) = lower($2)
           or company_id = any($3::int[])`,
      params,
    ),
    query(
      `select count(*) filter (where payment_status <> 'paid')::int as outstanding_count,
              coalesce(sum(greatest(grand_total - amount_paid, 0))
                filter (where payment_status <> 'paid'), 0) as outstanding_amount
         from public.sales_documents
        where invoice_status = 'invoiced'
          and (customer_id = $1 or company_id = any($2::int[]))`,
      [user.id, companyIds],
    ),
  ]);
  const rows = [logistic.rows[0], product.rows[0], service.rows[0]];
  sendJson(response, 200, {
    totalOrders: rows.reduce((sum, row) => sum + Number(row?.total ?? 0), 0),
    activeOrders: rows.reduce((sum, row) => sum + Number(row?.active ?? 0), 0),
    completedOrders: rows.reduce((sum, row) => sum + Number(row?.completed ?? 0), 0),
    invoiceOutstandingCount: Number(invoices.rows[0]?.outstanding_count ?? 0),
    invoiceOutstandingAmount: Number(invoices.rows[0]?.outstanding_amount ?? 0),
    trackingActive: Number(logistic.rows[0]?.active ?? 0),
  });
}

function serviceItemResponse(row) {
  return {
    id: Number(row.id),
    itemType: row.item_type,
    serviceCategory: row.service_category ?? null,
    sequenceNo: Number(row.sequence_no ?? 1),
    title: row.title,
    description: row.description ?? "",
    formData: row.form_data ?? {},
    requiredDocuments: row.required_documents ?? [],
    isRequired: Boolean(row.is_required),
    status: row.status,
    estimatedPrice: row.estimated_price == null ? null : Number(row.estimated_price),
    quotedPrice: row.quoted_price == null ? null : Number(row.quoted_price),
  };
}

async function getOwnedServiceRequest(user, requestId) {
  const companyIds = await getAccessibleCompanyIds(user);
  const result = await query(
    `select id, request_number, request_type, trade_type, order_mode,
            package_id, package_name_snapshot, pricing_mode, status,
            customer_name, customer_email, customer_phone, customer_company,
            notes, admin_notes, created_at, updated_at, submitted_at
       from public.customer_service_requests
      where id = $1
        and (
          portal_customer_id = $2
          or customer_id = $2
          or company_id = any($3::int[])
          or lower(customer_email) = lower($4)
        )
      limit 1`,
    [requestId, user.id, companyIds, user.email],
  );
  return result.rows[0] ?? null;
}

async function getServiceRequestItems(requestId) {
  const result = await query(
    `select id, item_type, service_category, sequence_no, title, description,
            form_data, required_documents, is_required, status,
            estimated_price, quoted_price
       from public.customer_service_request_items
      where request_id = $1
      order by sequence_no, id`,
    [requestId],
  );
  return result.rows.map(serviceItemResponse);
}

function serviceRequestResponse(row, items = []) {
  return {
    id: Number(row.id),
    requestNumber: row.request_number,
    requestType: row.request_type,
    tradeType: row.trade_type,
    orderMode: row.order_mode,
    packageId: row.package_id == null ? null : Number(row.package_id),
    packageName: row.package_name_snapshot ?? null,
    pricingMode: row.pricing_mode,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? "",
    customerCompany: row.customer_company ?? "",
    notes: row.notes ?? "",
    adminNotes: row.admin_notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    submittedAt: row.submitted_at ?? null,
    items,
  };
}

async function handleCustomerServiceRoutes(request, response, url, user, body = {}) {
  const pathMatch = url.pathname.match(/^\/api\/customer-service-requests\/(\d+)(?:\/(items|submit))?(?:\/(\d+))?$/);
  const trackMatch = url.pathname.match(/^\/api\/customer-service-requests\/by-number\/([^/]+)$/);
  const packageApplyMatch = url.pathname.match(/^\/api\/service-packages\/(\d+)\/apply\/(\d+)$/);
  const requestId = pathMatch ? Number(pathMatch[1]) : null;

  if (request.method === "GET" && trackMatch) {
    const requestNumber = decodeURIComponent(trackMatch[1]);
    const companyIds = await getAccessibleCompanyIds(user);
    const result = await query(
      `select id, request_number, trade_type, status, notes, admin_notes,
              created_at, updated_at
         from public.customer_service_requests
        where request_number = $1
          and (
            portal_customer_id = $2
            or customer_id = $2
            or company_id = any($3::int[])
            or lower(customer_email) = lower($4)
          )
        limit 1`,
      [requestNumber, user.id, companyIds, user.email],
    );
    const row = result.rows[0];
    if (!row) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    const items = await getServiceRequestItems(row.id);
    const documents = await query(
      `select id, file_name, document_type, verification_status
         from public.customer_service_request_documents
        where request_id = $1
        order by created_at, id`,
      [row.id],
    );
    sendJson(response, 200, {
      requestNumber: row.request_number,
      tradeType: row.trade_type,
      status: row.status,
      notes: row.notes ?? null,
      adminNotes: row.admin_notes ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
      })),
      documents: documents.rows.map((document) => ({
        id: Number(document.id),
        fileName: document.file_name ?? null,
        documentType: document.document_type,
        verificationStatus: document.verification_status ?? "pending",
      })),
    });
    return true;
  }

  if (request.method === "GET" && pathMatch && !pathMatch[2]) {
    const row = await getOwnedServiceRequest(user, requestId);
    if (!row) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    sendJson(response, 200, serviceRequestResponse(row, await getServiceRequestItems(row.id)));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/customer-service-requests") {
    const customerName = String(body.customerName ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
    const tradeType = String(body.tradeType ?? "").trim().toUpperCase();
    const orderMode = String(body.orderMode ?? "ITEM_MANDIRI").trim().toUpperCase();
    if (!customerName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      sendError(response, 400, "Nama dan email customer wajib diisi.");
      return true;
    }
    if (!["EXPORT", "IMPORT", "DOMESTIC"].includes(tradeType)) {
      sendError(response, 400, "Trade type tidak valid.");
      return true;
    }
    if (!["ITEM_MANDIRI", "PAKET_BORONGAN"].includes(orderMode)) {
      sendError(response, 400, "Order mode tidak valid.");
      return true;
    }
    const companyIds = await getAccessibleCompanyIds(user);
    const result = await query(
      `insert into public.customer_service_requests (
         id, request_number, customer_id, customer_name, customer_email,
         customer_phone, customer_company, request_type, trade_type, order_mode,
         pricing_mode, status, notes, portal_customer_id, company_id
       ) values (
         nextval('public.customer_service_requests_id_seq'),
         concat('CSR-', to_char(clock_timestamp(), 'YYMMDD'), '-',
                lpad(currval('public.customer_service_requests_id_seq')::text, 6, '0')),
         $1, $2, $3, $4, $5, 'service', $6, $7, $8, 'draft', $9, $1, $10
       )
       returning id, request_number`,
      [
        user.id,
        customerName,
        customerEmail,
        body.customerPhone ? String(body.customerPhone).trim() : null,
        body.customerCompany ? String(body.customerCompany).trim() : null,
        tradeType,
        orderMode,
        body.pricingMode ? String(body.pricingMode).trim().toUpperCase() : "PER_ITEM",
        body.notes ? String(body.notes).trim() : null,
        companyIds[0] ?? null,
      ],
    );
    sendJson(response, 201, {
      id: Number(result.rows[0].id),
      requestNumber: result.rows[0].request_number,
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/service-packages") {
    const tradeType = String(url.searchParams.get("tradeType") ?? "").trim().toUpperCase();
    const result = await query(
      `select p.id, p.package_code, p.package_name, p.package_type,
              p.trade_type, p.description, p.pricing_mode, p.icon_emoji,
              i.id as item_id, i.item_type, i.item_title, i.is_required,
              i.sequence_no, i.required_documents, i.description as item_description
         from public.service_packages p
         left join public.service_package_items i on i.package_id = p.id
        where p.is_active = true
          and ($1 = '' or upper(p.trade_type) = $1)
        order by p.sort_order, p.id, i.sequence_no, i.id`,
      [tradeType],
    );
    const packages = new Map();
    for (const row of result.rows) {
      if (!packages.has(row.id)) {
        packages.set(row.id, {
          id: Number(row.id),
          packageCode: row.package_code,
          packageName: row.package_name,
          packageType: row.package_type,
          tradeType: row.trade_type,
          description: row.description ?? null,
          pricingMode: row.pricing_mode,
          iconEmoji: row.icon_emoji ?? "📦",
          items: [],
        });
      }
      if (row.item_id) {
        packages.get(row.id).items.push({
          id: Number(row.item_id),
          itemType: row.item_type,
          itemTitle: row.item_title,
          isRequired: Boolean(row.is_required),
          sequenceNo: Number(row.sequence_no ?? 1),
          requiredDocuments: row.required_documents ?? [],
          description: row.item_description ?? null,
        });
      }
    }
    sendJson(response, 200, [...packages.values()]);
    return true;
  }

  if (request.method === "POST" && packageApplyMatch) {
    const packageId = Number(packageApplyMatch[1]);
    const targetRequestId = Number(packageApplyMatch[2]);
    const serviceRequest = await getOwnedServiceRequest(user, targetRequestId);
    if (!serviceRequest) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    if (!["draft", "revision_requested"].includes(serviceRequest.status)) {
      sendError(response, 409, "Service request sudah tidak dapat diubah.");
      return true;
    }
    const packageResult = await query(
      `select id, package_name, trade_type
         from public.service_packages
        where id = $1 and is_active = true
        limit 1`,
      [packageId],
    );
    const packageRow = packageResult.rows[0];
    if (!packageRow || String(packageRow.trade_type).toUpperCase() !== String(serviceRequest.trade_type).toUpperCase()) {
      sendError(response, 400, "Paket tidak sesuai dengan trade type.");
      return true;
    }
    await query(
      `update public.customer_service_requests
          set package_id = $1, package_name_snapshot = $2,
              order_mode = 'PAKET_BORONGAN', updated_at = now()
        where id = $3`,
      [packageId, packageRow.package_name, targetRequestId],
    );
    const packageItems = await query(
      `select item_type, service_category, item_title, is_required,
              sequence_no, required_documents, description
         from public.service_package_items
        where package_id = $1
        order by sequence_no, id`,
      [packageId],
    );
    for (const item of packageItems.rows) {
      await query(
        `insert into public.customer_service_request_items (
           request_id, item_type, service_category, sequence_no, title,
           description, required_documents, is_required
         )
         select $1, $2, $3, $4, $5, $6, $7::jsonb, $8
          where not exists (
            select 1 from public.customer_service_request_items
             where request_id = $1 and item_type = $2 and title = $5
          )`,
        [
          targetRequestId,
          item.item_type,
          item.service_category,
          item.sequence_no,
          item.item_title,
          item.description,
          JSON.stringify(item.required_documents ?? []),
          Boolean(item.is_required),
        ],
      );
    }
    sendJson(response, 200, { items: await getServiceRequestItems(targetRequestId) });
    return true;
  }

  if (pathMatch && pathMatch[2] === "submit" && request.method === "POST") {
    const serviceRequest = await getOwnedServiceRequest(user, requestId);
    if (!serviceRequest) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    const items = await getServiceRequestItems(requestId);
    if (!items.length) {
      sendError(response, 400, "Tambahkan minimal satu item layanan.");
      return true;
    }
    if (!["draft", "revision_requested"].includes(serviceRequest.status)) {
      sendError(response, 409, "Service request sudah dikirim.");
      return true;
    }
    await query(
      `update public.customer_service_requests
          set status = 'submitted', submitted_at = now(), updated_at = now()
        where id = $1`,
      [requestId],
    );
    sendJson(response, 200, { ok: true, requestNumber: serviceRequest.request_number });
    return true;
  }

  if (pathMatch && pathMatch[2] === "items" && request.method === "POST") {
    const serviceRequest = await getOwnedServiceRequest(user, requestId);
    if (!serviceRequest) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    if (!["draft", "revision_requested"].includes(serviceRequest.status)) {
      sendError(response, 409, "Service request sudah tidak dapat diubah.");
      return true;
    }
    const itemType = String(body.itemType ?? "").trim();
    const title = String(body.title ?? "").trim();
    if (!itemType || !title) {
      sendError(response, 400, "Jenis dan judul item wajib diisi.");
      return true;
    }
    const result = await query(
      `insert into public.customer_service_request_items (
         request_id, item_type, title, description, form_data,
         required_documents, is_required, sequence_no
       ) values (
         $1, $2, $3, $4, $5::jsonb, $6::jsonb, false,
         coalesce((select max(sequence_no) + 1 from public.customer_service_request_items where request_id = $1), 1)
       )
       returning id, item_type, service_category, sequence_no, title, description,
                 form_data, required_documents, is_required, status,
                 estimated_price, quoted_price`,
      [
        requestId,
        itemType,
        title,
        body.description ? String(body.description) : null,
        JSON.stringify(body.formData ?? {}),
        JSON.stringify(body.requiredDocuments ?? []),
      ],
    );
    sendJson(response, 201, serviceItemResponse(result.rows[0]));
    return true;
  }

  if (pathMatch && pathMatch[2] === "items" && pathMatch[3]) {
    const itemId = Number(pathMatch[3]);
    const serviceRequest = await getOwnedServiceRequest(user, requestId);
    if (!serviceRequest) {
      sendError(response, 404, "Service request tidak ditemukan.");
      return true;
    }
    if (!["draft", "revision_requested"].includes(serviceRequest.status)) {
      sendError(response, 409, "Service request sudah tidak dapat diubah.");
      return true;
    }
    if (request.method === "DELETE") {
      await query(
        `delete from public.customer_service_request_items
          where id = $1 and request_id = $2 and is_required = false`,
        [itemId, requestId],
      );
      sendEmpty(response, 204);
      return true;
    }
    if (request.method === "PUT") {
      const result = await query(
        `update public.customer_service_request_items
            set item_type = $1, title = $2, description = $3,
                form_data = $4::jsonb, required_documents = $5::jsonb,
                updated_at = now()
          where id = $6 and request_id = $7
          returning id, item_type, service_category, sequence_no, title, description,
                    form_data, required_documents, is_required, status,
                    estimated_price, quoted_price`,
        [
          String(body.itemType ?? "").trim(),
          String(body.title ?? "").trim(),
          body.description ? String(body.description) : null,
          JSON.stringify(body.formData ?? {}),
          JSON.stringify(body.requiredDocuments ?? []),
          itemId,
          requestId,
        ],
      );
      if (!result.rows[0]) {
        sendError(response, 404, "Item layanan tidak ditemukan.");
        return true;
      }
      sendJson(response, 200, serviceItemResponse(result.rows[0]));
      return true;
    }
  }

  return false;
}

async function handlePublicCalculatorQuote(request, response, body = {}) {
  const customerName = String(body.customerName ?? body.name ?? "").trim();
  const customerEmail = String(body.customerEmail ?? body.email ?? "").trim().toLowerCase();
  const customerPhone = String(body.customerPhone ?? body.whatsapp ?? "").trim() || null;
  const service = String(body.service ?? "").trim();
  const tradeType = service === "customs"
    ? "IMPORT"
    : ["domestic", "warehousing"].includes(service)
      ? "DOMESTIC"
      : "EXPORT";
  if (!customerName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
    sendError(response, 400, "Nama dan email customer wajib diisi.");
    return;
  }
  if (!service) {
    sendError(response, 400, "Jenis layanan wajib diisi.");
    return;
  }

  const notes = JSON.stringify({
    source: "customer_portal_calculator",
    service,
    origin: body.origin ?? null,
    destination: body.destination ?? null,
    cargoDesc: body.cargoDesc ?? null,
    cargoValue: body.cargoValue ?? null,
    incoterms: body.incoterms ?? null,
    insurance: Boolean(body.insurance),
    result: body.result ?? null,
    extraData: body.extraData ?? null,
    notes: body.notes ?? null,
  }).slice(0, 12000);
  const result = await query(
    `insert into public.customer_service_requests (
       id, request_number, customer_id, customer_name, customer_email,
       customer_phone, request_type, trade_type, order_mode,
       pricing_mode, status, notes
     ) values (
       nextval('public.customer_service_requests_id_seq'),
       concat('CSR-', to_char(clock_timestamp(), 'YYMMDD'), '-',
              lpad(currval('public.customer_service_requests_id_seq')::text, 6, '0')),
       null, $1, $2, $3, 'service', $4, 'ITEM_MANDIRI',
       'PER_ITEM', 'draft', $5
     )
     returning id, request_number`,
    [customerName, customerEmail, customerPhone, tradeType, notes],
  );
  sendJson(response, 201, {
    ok: true,
    id: Number(result.rows[0].id),
    requestNumber: result.rows[0].request_number,
  });
}

async function handleServiceProfile(request, response, url, user, body = {}) {
  const email = String(url.searchParams.get("email") ?? body.email ?? user.email).trim().toLowerCase();
  if (!email || (email !== user.email && user.role !== "admin")) {
    sendError(response, 403, "Profile hanya dapat diakses oleh pemiliknya.");
    return;
  }
  if (request.method === "GET") {
    const result = await query(
      `select company_name, npwp, nib, company_address, pic_name, pic_whatsapp,
              pic_email, legal_doc_url, ktp_pic_url, surat_kuasa_url,
              api_nik_izin_url, additional_notes, profile_status, is_verified
         from public.portal_customer_profiles
        where customer_id = $1 or lower(coalesce(pic_email, guest_email, '')) = $2
        order by customer_id = $1 desc, updated_at desc nulls last
        limit 1`,
      [user.id, email],
    );
    const row = result.rows[0];
    if (!row) {
      sendJson(response, 200, {});
      return;
    }
    sendJson(response, 200, {
      companyName: row.company_name ?? "",
      npwp: row.npwp ?? "",
      nib: row.nib ?? "",
      companyAddress: row.company_address ?? "",
      picName: row.pic_name ?? "",
      picWhatsapp: row.pic_whatsapp ?? "",
      picEmail: row.pic_email ?? email,
      legalDocUrl: row.legal_doc_url ?? "",
      ktpPicUrl: row.ktp_pic_url ?? "",
      suratKuasaUrl: row.surat_kuasa_url ?? "",
      apiNikIzinUrl: row.api_nik_izin_url ?? "",
      additionalNotes: row.additional_notes ?? "",
      profileStatus: row.profile_status ?? "draft",
      isVerified: Boolean(row.is_verified),
    });
    return;
  }
  if (request.method === "PUT") {
    const values = [
      body.companyName ?? null, body.npwp ?? null, body.nib ?? null,
      body.companyAddress ?? null, body.picName ?? null, body.picWhatsapp ?? null,
      body.picEmail ?? email, body.legalDocUrl ?? null, body.ktpPicUrl ?? null,
      body.suratKuasaUrl ?? null, body.apiNikIzinUrl ?? null,
      body.additionalNotes ?? null, user.id,
    ];
    const existing = await query(
      `select id
         from public.portal_customer_profiles
        where customer_id = $1
        order by updated_at desc nulls last, id desc
        limit 1`,
      [user.id],
    );
    if (existing.rows[0]) {
      await query(
        `update public.portal_customer_profiles
            set company_name = $1, npwp = $2, nib = $3, company_address = $4,
                pic_name = $5, pic_whatsapp = $6, pic_email = $7,
                legal_doc_url = $8, ktp_pic_url = $9, surat_kuasa_url = $10,
                api_nik_izin_url = $11, additional_notes = $12, updated_at = now()
          where id = $13`,
        values,
      );
    } else {
      await query(
        `insert into public.portal_customer_profiles (
           customer_id, company_name, npwp, nib, company_address, pic_name,
           pic_whatsapp, pic_email, legal_doc_url, ktp_pic_url, surat_kuasa_url,
           api_nik_izin_url, additional_notes, profile_status, updated_at
         ) values ($13, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft', now())`,
        values,
      );
    }
    sendJson(response, 200, { ok: true });
    return;
  }
  sendError(response, 405, "Method tidak didukung.");
}

function logisticItemResponse(row) {
  return {
    id: Number(row.id),
    orderId: Number(row.order_id),
    category: row.category,
    serviceName: row.service_name,
    calculatorType: row.calculator_type,
    inputData: row.input_data ?? {},
    calculationResult: row.calculation_result ?? {},
    subtotal: Number(row.subtotal ?? 0),
    createdAt: row.created_at,
    itemSource: row.item_source ?? null,
    vendorCatalogItemId: row.vendor_catalog_item_id == null ? null : Number(row.vendor_catalog_item_id),
    vendorId: row.vendor_id == null ? null : Number(row.vendor_id),
    serviceType: row.service_type ?? null,
    priceSnapshot: row.price_snapshot ?? null,
    calculationInput: row.calculation_input ?? null,
    templateSnapshot: null,
  };
}

async function getLogisticItems(orderId) {
  const result = await query(
    `select id, order_id, category, service_name, calculator_type,
            input_data, calculation_result, subtotal, created_at, item_source,
            vendor_catalog_item_id, vendor_id, service_type, price_snapshot,
            calculation_input
       from public.logistic_order_items
      where order_id = $1
      order by id`,
    [orderId],
  );
  return result.rows.map(logisticItemResponse);
}

function logisticOrderResponse(row, items = []) {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    companyName: row.company_name,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    shipmentType: row.shipment_type,
    origin: row.origin,
    destination: row.destination,
    commodity: row.commodity ?? null,
    cargoDescription: row.cargo_description ?? null,
    grossWeight: row.gross_weight == null ? null : Number(row.gross_weight),
    volumeCbm: row.volume_cbm == null ? null : Number(row.volume_cbm),
    jumlahKoli: row.jumlah_koli == null ? null : Number(row.jumlah_koli),
    requiredDate: row.required_date ?? null,
    notes: row.notes ?? null,
    paymentType: row.payment_type ?? null,
    paymentMethod: row.payment_method ?? null,
    namaPenerima: row.nama_penerima ?? null,
    nomorPenerima: row.nomor_penerima ?? null,
    jamOrder: row.jam_order ?? null,
    source: row.source,
    subtotal: Number(row.subtotal ?? 0),
    tax: Number(row.tax ?? 0),
    grandTotal: Number(row.grand_total ?? 0),
    status: row.status,
    approvedQuoteId: row.approved_quote_id == null ? null : Number(row.approved_quote_id),
    adminApprovalStatus: row.admin_approval_status ?? null,
    approvedAt: row.approved_at ?? null,
    approvedVendorId: row.approved_vendor_id == null ? null : Number(row.approved_vendor_id),
    finalSellingPrice: row.final_selling_price == null ? null : Number(row.final_selling_price),
    quotationSentAt: row.quotation_sent_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    transportMode: row.transport_mode ?? null,
    originDistrict: row.origin_district ?? null,
    destDistrict: row.dest_district ?? null,
    pickupDate: row.pickup_date ?? null,
    pickupTime: row.pickup_time ?? null,
    truckType: row.truck_type ?? null,
    originPort: row.origin_port ?? null,
    destPort: row.dest_port ?? null,
    weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
    incoterm: row.incoterm ?? null,
    etd: row.etd ?? null,
    eta: row.eta ?? null,
    paymentStatus: row.payment_status ?? null,
    paymentProofUrl: row.payment_proof_url ?? null,
    items,
  };
}

async function getOwnedLogisticOrder(user, orderNumber) {
  const companyIds = await getAccessibleCompanyIds(user);
  const result = await query(
    `select *
       from public.logistic_orders
      where order_number = $1
        and (
          portal_customer_id = $2
          or lower(email) = lower($3)
          or company_id = any($4::int[])
        )
      limit 1`,
    [orderNumber, user.id, user.email, companyIds],
  );
  return result.rows[0] ?? null;
}

const TRUCKING_VEHICLE_RATE_KEYS = {
  mobil: "pickup",
  "mobil-xl": "pickup",
  van: "blindVan",
  "pickup-kecil": "pickup",
  "box-kecil": "CDE",
  engkel: "CDE",
  "double-engkel": "CDD",
  "cdd-long": "CDD",
  fuso: "Fuso",
  tronton: "Wingbox",
  "truk-trailer": "Trailer 40FT",
};

async function handleTruckingEstimate(request, response, body) {
  if (request.method !== "POST") { sendError(response, 405, "Method tidak didukung."); return; }
  const vehicleType = String(body.vehicle_type ?? "").trim();
  const canonicalVehicle = TRUCKING_VEHICLE_RATE_KEYS[vehicleType];
  if (!canonicalVehicle) {
    sendError(response, 422, "Tarif canonical untuk jenis kendaraan ini belum dikonfigurasi.");
    return;
  }
  const result = await query(
    `select rs.rate_key, rs.value_amount
       from public.logistics_rate_cards rc
       join public.logistics_service_rates rs on rs.rate_card_id = rc.id
      where rc.is_active = true
        and rc.service_type::text = 'trucking'
        and (rc.valid_from is null or rc.valid_from <= now())
        and (rc.valid_to is null or rc.valid_to >= now())
        and (
          (rs.rate_key in ('vehicleRate','ratePerVehicle') and lower(regexp_replace(coalesce(rs.vehicle_type,''), '[^a-z0-9]', '', 'g')) = lower(regexp_replace($1, '[^a-z0-9]', '', 'g')))
          or rs.rate_key in ('loadingFee','unloadingFee','overnightFee')
        )
      order by rc.updated_at desc nulls last, rc.id desc, rs.id desc`,
    [canonicalVehicle],
  );
  const rates = new Map(result.rows.map((row) => [row.rate_key, Number(row.value_amount)]));
  const base = rates.get("vehicleRate") ?? rates.get("ratePerVehicle");
  if (!Number.isFinite(base)) {
    sendError(response, 503, "Tarif canonical trucking belum dikonfigurasi.");
    return;
  }
  const loading = body.with_loading_helper ? Number(rates.get("loadingFee") ?? 0) : 0;
  const unloading = body.with_unloading_helper ? Number(rates.get("unloadingFee") ?? 0) : 0;
  const overnight = Math.max(0, Number(body.overnight_nights) || 0) * Number(rates.get("overnightFee") ?? 0);
  const total = base + loading + unloading + overnight;
  const estimate = {
    vehicle_type: vehicleType, distance_km: 0, distance_source: "unknown",
    price_per_km: 0, minimum_charge: base, base_price: base, base_after_minimum: base,
    surcharge_breakdown: { out_of_city: 0, inter_province: 0, inter_island: 0, total: 0 },
    extras_breakdown: { loading_helper: loading, unloading_helper: unloading, toll: 0, ferry: 0, waiting: 0, multidrop: 0, overnight, urgent: 0, insurance: 0, total: loading + unloading + overnight },
    total_estimate: total,
  };
  sendJson(response, 200, { has_data: true, cheapest: { vendor_id: 0, vendor_name: "CST Canonical Rate", pricing_id: 0, estimate }, candidates: [] });
}

async function handleTruckingBooking(request, response, user, body) {
  if (request.method !== "POST") { sendError(response, 405, "Method tidak didukung."); return; }
  const required = ["vehicleType","vehicleName","areaPickup","alamatPickup","picPickup","hpPickup","areaDelivery","alamatDelivery","picPenerima","hpPenerima"];
  if (required.some((key) => !String(body[key] ?? "").trim())) {
    sendError(response, 400, "Data booking trucking belum lengkap.");
    return;
  }
  const companyIds = await getAccessibleCompanyIds(user);
  const bookingNumber = `TRK-${new Date().toISOString().slice(2,10).replaceAll("-", "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const result = await query(
    `insert into public.trucking_booking_requests (
       booking_number, customer_id, portal_customer_id, company_id, vehicle_type, vehicle_name,
       area_pickup, alamat_pickup, pic_pickup, hp_pickup, area_delivery, alamat_delivery,
       pic_penerima, hp_penerima, jadwal_type, tanggal_pickup, jam_pickup, jenis_barang,
       berat_kg, jumlah_koli, volume_m3, catatan, jumlah_trip, addons, estimasi_total,
       estimated_distance_km, estimated_price, pricing_breakdown, candidate_vendor_ids,
       selected_vendor_id, source, status
     ) values (
       $1,$2,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
       $22,$23::jsonb,$24,$25,$26,$27::jsonb,$28::jsonb,$29,'customer_portal','pending_review'
     ) returning booking_number, status`,
    [
      bookingNumber, user.id, companyIds[0] ?? null, String(body.vehicleType), String(body.vehicleName),
      String(body.areaPickup), String(body.alamatPickup), String(body.picPickup), String(body.hpPickup),
      String(body.areaDelivery), String(body.alamatDelivery), String(body.picPenerima), String(body.hpPenerima),
      body.jadwalType === "nanti" ? "nanti" : "sekarang", body.tanggalPickup ?? null, body.jamPickup ?? null,
      body.jenisBarang ?? null, body.beratKg ?? null, body.jumlahKoli ?? null, body.volumeM3 ?? null,
      body.catatan ?? null, Math.max(1, Math.min(100, Number(body.jumlahTrip) || 1)),
      JSON.stringify(body.addons ?? {}), Math.max(0, Number(body.estimasiTotal) || 0),
      body.estimatedDistanceKm ?? null, body.estimatedPrice ?? null,
      JSON.stringify(body.pricingBreakdown ?? null), JSON.stringify(body.candidateVendorIds ?? null),
      Number.isInteger(Number(body.selectedVendorId)) ? Number(body.selectedVendorId) : null,
    ],
  );
  sendJson(response, 201, { bookingNumber: result.rows[0].booking_number, status: result.rows[0].status });
}

async function handleCompanyPickupAddress(request, response, user) {
  if (request.method !== "GET") {
    sendError(response, 405, "Method tidak didukung.");
    return;
  }
  const result = await query(
    `select company_name, company_address
       from public.portal_customer_profiles
      where customer_id = $1
      order by updated_at desc nulls last, id desc
      limit 1`,
    [user.id],
  );
  const row = result.rows[0] ?? {};
  sendJson(response, 200, {
    companyName: row.company_name ?? user.company ?? "",
    companyAddress: row.company_address ?? "",
    originCity: "",
    originAirport: "",
    originPort: "",
  });
}

async function handleLogisticCustomerRoutes(request, response, url, user, body = {}) {
  const orderNumberMatch = url.pathname.match(/^\/api\/logistic\/orders\/([^/]+)(?:\/(payment-proof|create-paylabs-link))?$/);
  const trackMatch = url.pathname.match(/^\/api\/logistic\/orders\/track\/([^/]+)$/);

  if (request.method === "POST" && url.pathname === "/api/logistic/orders") {
    const required = ["companyName", "customerName", "email", "phone", "shipmentType", "origin", "destination"];
    if (required.some((field) => !String(body[field] ?? "").trim())) {
      sendError(response, 400, "Data order logistik belum lengkap.");
      return true;
    }
    const companyIds = await getAccessibleCompanyIds(user);
    const items = Array.isArray(body.items) ? body.items : [];
    const result = await query(
      `insert into public.logistic_orders (
         id, order_number, company_name, customer_name, email, phone,
         shipment_type, origin, destination, commodity, cargo_description,
         gross_weight, volume_cbm, jumlah_koli, required_date, notes,
         payment_type, payment_method, nama_penerima, nomor_penerima, jam_order,
         source, subtotal, tax, grand_total, order_type, transport_mode,
         origin_district, dest_district, pickup_date, pickup_time, truck_type,
         origin_port, dest_port, weight_kg, incoterm, etd, eta, sender_name,
         portal_customer_id, company_id
       ) values (
         nextval('public.logistic_orders_id_seq'),
         concat('LOG-', to_char(clock_timestamp(), 'YYMMDD'), '-',
                lpad(currval('public.logistic_orders_id_seq')::text, 6, '0')),
         $1, $2, lower($3), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, 'customer_portal',
          coalesce($20, 0), coalesce($21, 0), coalesce($22, 0),
          coalesce($23, 'shipment'), $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38
       )
       returning *`,
      [
        String(body.companyName).trim(),
        String(body.customerName).trim(),
        String(body.email).trim(),
        String(body.phone).trim(),
        String(body.shipmentType).trim(),
        String(body.origin).trim(),
        String(body.destination).trim(),
        body.commodity ? String(body.commodity) : null,
        body.cargoDescription ? String(body.cargoDescription) : null,
        body.grossWeight ?? null,
        body.volumeCbm ?? null,
        body.jumlahKoli ?? null,
        body.requiredDate ?? null,
        body.notes ? String(body.notes) : null,
        body.paymentType ?? null,
        body.paymentMethod ?? null,
        body.namaPenerima ?? null,
        body.nomorPenerima ?? null,
        body.jamOrder ?? null,
        body.subtotal ?? 0,
        body.tax ?? 0,
        body.grandTotal ?? 0,
        body.orderType ?? "shipment",
        body.transportMode ?? null,
        body.originDistrict ?? null,
        body.destDistrict ?? null,
        body.pickupDate ?? null,
        body.pickupTime ?? null,
        body.truckType ?? null,
        body.originPort ?? null,
        body.destPort ?? null,
        body.weightKg ?? null,
        body.incoterm ?? null,
        body.etd ?? null,
        body.eta ?? null,
        body.senderName ?? null,
        user.id,
        companyIds[0] ?? null,
      ],
    );
    const row = result.rows[0];
    for (const item of items) {
      if (!item || !String(item.category ?? "").trim() || !String(item.serviceName ?? "").trim()) continue;
      await query(
        `insert into public.logistic_order_items (
           order_id, category, service_name, calculator_type, input_data,
           calculation_result, subtotal, item_source, vendor_catalog_item_id,
           vendor_id, service_type, price_snapshot, calculation_input
         ) values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb)`,
        [
          row.id,
          String(item.category),
          String(item.serviceName),
          String(item.calculatorType ?? "manual"),
          JSON.stringify(item.inputData ?? {}),
          JSON.stringify(item.calculationResult ?? {}),
          item.subtotal ?? 0,
          item.itemSource ?? "manual",
          item.vendorCatalogItemId ?? null,
          item.vendorId ?? null,
          item.serviceType ?? null,
          JSON.stringify(item.priceSnapshot ?? null),
          JSON.stringify(item.calculationInput ?? item.templateSnapshot ?? null),
        ],
      );
    }
    sendJson(response, 201, logisticOrderResponse(row, await getLogisticItems(row.id)));
    return true;
  }

  if (request.method === "GET" && orderNumberMatch && !orderNumberMatch[2]) {
    const row = await getOwnedLogisticOrder(user, decodeURIComponent(orderNumberMatch[1]));
    if (!row) {
      sendError(response, 404, "Order logistik tidak ditemukan.");
      return true;
    }
    sendJson(response, 200, logisticOrderResponse(row, await getLogisticItems(row.id)));
    return true;
  }

  if (request.method === "PATCH" && orderNumberMatch?.[2] === "payment-proof") {
    const orderNumber = decodeURIComponent(orderNumberMatch[1]);
    const row = await getOwnedLogisticOrder(user, orderNumber);
    if (!row) {
      sendError(response, 404, "Order logistik tidak ditemukan.");
      return true;
    }
    const proofUrl = String(body.proofUrl ?? "").trim();
    if (!proofUrl || !proofUrl.startsWith("customers/")) {
      sendError(response, 400, "Object path bukti pembayaran tidak valid.");
      return true;
    }
    const updated = await query(
      `update public.logistic_orders
          set payment_proof_url = $1, payment_status = 'proof_submitted', updated_at = now()
        where id = $2
        returning *`,
      [proofUrl, row.id],
    );
    sendJson(response, 200, logisticOrderResponse(updated.rows[0], await getLogisticItems(row.id)));
    return true;
  }

  if (request.method === "POST" && orderNumberMatch?.[2] === "create-paylabs-link") {
    const row = await getOwnedLogisticOrder(user, decodeURIComponent(orderNumberMatch[1]));
    if (!row) {
      sendError(response, 404, "Order logistik tidak ditemukan.");
      return true;
    }
    sendJson(response, 200, {
      paymentUrl: null,
      amount: Number(row.grand_total ?? 0),
      expiredAt: null,
      configured: false,
      reused: false,
      message: "Payment gateway belum dikonfigurasi untuk Customer Portal standalone.",
    });
    return true;
  }

  if (request.method === "GET" && trackMatch) {
    const orderNumber = decodeURIComponent(trackMatch[1]);
    const providedPhone = String(url.searchParams.get("phone") ?? "").replace(/\D/g, "");
    const sessionRow = user ? await getOwnedLogisticOrder(user, orderNumber) : null;
    const result = sessionRow
      ? { rows: [sessionRow] }
      : await query(
        `select * from public.logistic_orders
          where order_number = $1
            and right(regexp_replace(phone, '[^0-9]', '', 'g'), 4) = $2
          limit 1`,
        [orderNumber, providedPhone],
      );
    const row = result.rows[0];
    if (!row) {
      if (!providedPhone) {
        sendJson(response, 403, {
          message: "Verifikasi empat digit terakhir nomor telepon diperlukan.",
          requiresPhoneVerification: true,
        });
      } else {
        sendError(response, 404, "Order tidak ditemukan.");
      }
      return true;
    }
    const [items, updates, progress, invoice] = await Promise.all([
      getLogisticItems(row.id),
      query(
        `select id, status, notes, actor_type, actor_name, created_at
           from public.order_updates
          where order_id = $1 and is_public = true
          order by created_at, id`,
        [row.id],
      ),
      query(
        `select id, status, notes, updated_by, created_at, photo_url
           from public.order_tracking_progress
          where order_id = $1 and is_public = true
          order by created_at, id`,
        [row.id],
      ),
      query(
        `select payment_proof_token, invoice_number, grand_total, due_date,
                payment_status, status, confirmed_at, created_at
           from public.sales_documents
          where logistic_order_id = $1
          order by created_at desc
          limit 20`,
        [row.id],
      ),
    ]);
    sendJson(response, 200, {
      ...logisticOrderResponse(row, items),
      orderNumber: row.order_number,
      driverJob: null,
      rfqQuote: null,
      orderUpdates: updates.rows.map((item) => ({
        id: Number(item.id),
        status: item.status ?? null,
        notes: item.notes ?? null,
        actorType: item.actor_type,
        actorName: item.actor_name ?? null,
        createdAt: item.created_at,
      })),
      progressEvents: progress.rows.map((item) => ({
        id: Number(item.id),
        status: item.status,
        notes: item.notes ?? null,
        updatedBy: item.updated_by,
        createdAt: item.created_at,
        photoUrl: item.photo_url ?? null,
      })),
      podSubmissions: [],
      invoiceLinks: invoice.rows.map((item) => ({
        token: item.payment_proof_token,
        invoiceNumber: item.invoice_number ?? null,
        grandTotal: item.grand_total == null ? null : Number(item.grand_total),
        dueDate: item.due_date ?? null,
        paymentStatus: item.payment_status,
        status: item.status ?? null,
        confirmedAt: item.confirmed_at ?? null,
        createdAt: item.created_at,
      })),
    });
    return true;
  }

  return false;
}

async function handleMarketplaceRfqs(request, response, url) {
  const user = await requireUser(request, response);
  if (!user) return;
  const companyIds = await getAccessibleCompanyIds(user);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 200);
  const result = await query(
    `select r.id as rfq_id, r.rfq_number, r.status as rfq_status,
            r.approval_status, r.approval_requested_at, r.approval_resolved_at,
            r.buyer_name, r.buyer_email, r.buyer_company,
            r.buyer_approval_level, r.notes, r.required_delivery_date,
            r.created_at, a.id as pending_approval_id, a.approver_level,
            a.status as pending_approval_status, a.requested_at,
            a.response_notes
       from public.mkt_rfqs r
       left join lateral (
         select id, approver_level, status, requested_at, response_notes
           from public.mkt_rfq_approvals
          where rfq_id = r.id
          order by requested_at desc
          limit 1
       ) a on true
      where ${portalOwnerPredicate("r", "buyer_email")}
      order by r.created_at desc
      limit $4`,
    [user.id, user.email, companyIds, limit],
  );
  sendJson(response, 200, {
    ok: true,
    data: result.rows.map((row) => ({
      rfqId: Number(row.rfq_id),
      rfqNumber: row.rfq_number,
      rfqStatus: row.rfq_status,
      approvalStatus: row.approval_status,
      approvalRequestedAt: row.approval_requested_at,
      approvalResolvedAt: row.approval_resolved_at,
      buyerName: row.buyer_name,
      buyerEmail: row.buyer_email,
      buyerCompany: row.buyer_company,
      buyerApprovalLevel: row.buyer_approval_level,
      notes: row.notes,
      requiredDeliveryDate: row.required_delivery_date,
      createdAt: row.created_at,
      pendingApproval: row.pending_approval_id
        ? {
            id: Number(row.pending_approval_id),
            approverLevel: row.approver_level,
            status: row.pending_approval_status,
            requestedAt: row.requested_at,
            responseNotes: row.response_notes,
          }
        : null,
    })),
    count: result.rowCount,
  });
}

async function handleMarketplaceRfqDetail(request, response, rfqId) {
  const user = await requireUser(request, response);
  if (!user) return;
  const companyIds = await getAccessibleCompanyIds(user);
  const result = await query(
    `select r.id, r.rfq_number, r.status, r.approval_status, r.buyer_name,
            r.buyer_email, r.buyer_company, r.notes, r.required_delivery_date,
            r.delivery_address, r.destination_place_id, r.destination_lat,
            r.destination_lng, r.created_at, r.winner_selected_at,
            r.proposed_quote_id, a.id as pending_approval_id, a.status as pending_approval_status,
            a.requested_at, a.response_notes
       from public.mkt_rfqs r
       left join lateral (
         select id, status, requested_at, response_notes
           from public.mkt_rfq_approvals
          where rfq_id = r.id
          order by requested_at desc
          limit 1
       ) a on true
      where r.id = $4
        and ${portalOwnerPredicate("r", "buyer_email")}
      limit 1`,
    [user.id, user.email, companyIds, rfqId],
  );
  const row = result.rows[0];
  if (!row) {
    sendError(response, 404, "RFQ not found.");
    return;
  }
  sendJson(response, 200, {
    ok: true,
    data: {
      id: Number(row.id),
      rfq_number: row.rfq_number,
      status: row.status,
      approval_status: row.approval_status,
      buyer_name: row.buyer_name,
      buyer_email: row.buyer_email,
      buyer_company: row.buyer_company,
      notes: row.notes,
      required_delivery_date: row.required_delivery_date,
      delivery_address: row.delivery_address,
      destination_place_id: row.destination_place_id,
      destination_lat: row.destination_lat,
      destination_lng: row.destination_lng,
      created_at: row.created_at,
      winner_selected_at: row.winner_selected_at,
      proposed_quote_id: row.proposed_quote_id,
      pendingApproval: row.pending_approval_id
        ? {
            id: Number(row.pending_approval_id),
            status: row.pending_approval_status,
            requestedAt: row.requested_at,
            responseNotes: row.response_notes,
          }
        : null,
    },
  });
}

async function handleNotifications(request, response) {
  const user = await requireUser(request, response);
  if (!user) return;

  const result = await query(
    `select id, event_key, type, title, message, payload, is_read, created_at
       from public.portal_customer_notifications
      where portal_customer_id = $1
        and coalesce(payload->>'audience', 'customer') = 'customer'
      order by created_at desc
      limit 50`,
    [user.id],
  );
  const items = result.rows.map((row) => ({
    ...(() => {
      const rawPayload = row.payload ?? {};
      const resourceId = rawPayload.resourceId
        ?? rawPayload.poId
        ?? rawPayload.invoiceId
        ?? rawPayload.rfq_id
        ?? null;
      const resourceType = rawPayload.resourceType
        ?? (rawPayload.poId ? "purchase_order" : rawPayload.invoiceId ? "invoice" : rawPayload.rfq_id ? "rfq" : null);
      const link = rawPayload.link
        ?? (resourceType === "purchase_order" && resourceId
          ? `/marketplace/my-purchase-orders/${Number(resourceId)}`
          : resourceType === "rfq" && resourceId
            ? `/marketplace/my-rfqs/${Number(resourceId)}`
            : resourceType === "invoice" ? "/portal-invoice" : null);
      return {
        id: row.id,
        eventKey: row.event_key ?? `${row.type}:${resourceType ?? "notification"}:${resourceId ?? row.id}:${row.id}`,
        type: row.type,
        title: row.title,
        message: row.message,
        payload: {
          ...rawPayload,
          audience: rawPayload.audience ?? "customer",
          resourceType,
          resourceId: resourceId == null ? null : Number(resourceId),
          link,
          url: rawPayload.url ?? link,
        },
        isRead: row.is_read,
        createdAt: row.created_at,
      };
    })(),
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
  // This endpoint is consumed by both the public catalog and the admin
  // catalog. Keep the response as an array, matching /api/portal/products
  // and the generated portal client contract.
  sendJson(response, 200, result.rows.map((row) => ({
    id: row.id,
    code: row.service_code,
    name: row.service_name,
    category: row.category,
    categories: row.category ? [row.category] : [],
    description: row.description,
    price: row.base_price == null ? 0 : Number(row.base_price),
    basePrice: row.base_price == null ? null : Number(row.base_price),
    currency: row.currency,
    estimatedDays: row.estimated_days,
    slaHours: row.sla_hours,
    isActive: row.is_active,
    imageUrl: null,
    mediaItems: [],
  })));
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
    .map((asset) => ({
      asset,
      url: asset && typeof asset.url === "string" ? canonicalPublicAssetUrl(asset.url) : null,
    }))
    .filter(({ asset, url }) => asset && url)
    .map(({ asset, url }, index) => ({
      id: index + 1,
      vendorCatalogItemId: row.id,
      vendorId: row.vendor_id ?? null,
      mediaType: asset.type === "video" ? "video" : "image",
      fileUrl: url,
      thumbnailUrl: canonicalPublicAssetUrl(asset.thumbnailUrl),
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

async function getPublishedCatalogItems({ requirePublishedStatus = true } = {}) {
  const statusClause = requirePublishedStatus ? "and status = 'published'" : "";
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
        ${statusClause}
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
  // Admin activation uses the same public visibility flags as the catalog
  // manager. Do not add a second status gate here: legacy rows can be
  // published through is_published while their denormalized status is stale.
  const rows = await getPublishedCatalogItems({ requirePublishedStatus: false });
  const items = rows
    .filter((row) => row.is_featured)
    .slice(0, limit)
    .map((row) => {
      const media = mediaFromRow(row);
      return {
        id: row.id,
        vendorId: Number(row.vendor_id ?? 0),
        vendorName: row.vendor_name ?? null,
        name: row.name,
        imageUrl: media.primaryImageUrl,
        isFeatured: true,
      };
    });
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
  enforceRequestPolicy(request);
  for (const [name, value] of Object.entries(corsHeaders(request))) {
    response.setHeader(name, value);
  }

  if (request.method === "GET" && pathname === "/api/healthz") {
    await handleHealth(response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/readyz") {
    await handleReadiness(response);
    return;
  }
  if (request.method === "OPTIONS") {
    sendEmpty(response, 204, {
      Allow: "GET,POST,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      ...corsHeaders(request),
    });
    return;
  }
  if (pathname.startsWith("/api/vendor-quote/") || pathname.startsWith("/api/mkt/")) {
    const isPublicMarketplaceRoute =
      pathname.startsWith("/api/vendor-quote/") ||
      pathname.startsWith("/api/mkt/vendor-po/");
    const isMarketplaceAdminRoute = pathname.startsWith("/api/mkt/admin/");
    const user = isPublicMarketplaceRoute
      ? null
      : isMarketplaceAdminRoute
        ? await requireAdmin(request, response)
        : await requireUser(request, response);
    if (!isPublicMarketplaceRoute && !user) return;
    if (isPublicMarketplaceRoute || user) {
      const isMultipart = String(request.headers["content-type"] ?? "").startsWith("multipart/form-data");
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
        ? isMultipart ? await readMultipartForm(request) : await readJson(request)
        : {};
      const handled = await handleMarketplaceRoute({
        request,
        response,
        url,
        body,
        user,
        isAdmin: isMarketplaceAdminRoute,
        sendJson,
      });
      if (handled) return;
      // Public marketplace links must never fall through to the shared API.
      // A malformed or unknown token is still a local 404, not an upstream
      // response that could expose a different token contract.
      if (isPublicMarketplaceRoute) {
        sendJson(response, 404, {
          message: "Marketplace link tidak ditemukan.",
          code: "TOKEN_INVALID",
        });
        return;
      }
      // Every marketplace namespace is owned by the standalone service.
      // An unknown or not-yet-migrated route must fail locally instead of
      // falling through to the shared API (which may be production).
      if (pathname.startsWith("/api/mkt/")) {
        sendJson(response, 404, {
          message: "Marketplace route tidak ditemukan.",
          service: "customer-portal-api",
        });
        return;
      }
    }
  }
  if (request.method === "GET" && pathname === "/api/portal/auth/capabilities") {
    await handleCapabilities(response);
    return;
  }
  if (pathname.startsWith("/api/ai-agent/")) {
    if (request.method === "POST" && pathname === "/api/ai-agent/chat") {
      await handleChat(request, response, await readJson(request));
      return;
    }
    const sessionMatch = pathname.match(/^\/api\/ai-agent\/session\/([^/]+)$/);
    if (request.method === "GET" && sessionMatch) {
      await handleSession(request, response, sessionMatch[1], url);
      return;
    }
    const adminReplyMatch = pathname.match(/^\/api\/ai-agent\/session\/([^/]+)\/admin-reply$/);
    if (request.method === "POST" && adminReplyMatch) {
      const user = await requireAdmin(request, response);
      if (user) await handleAdminReply(
        request,
        response,
        adminReplyMatch[1],
        await readJson(request),
        user,
      );
      return;
    }
    const byOrderMatch = pathname.match(/^\/api\/ai-agent\/session\/by-order\/(\d+)$/);
    if (request.method === "GET" && byOrderMatch) {
      const user = await requireAdmin(request, response);
      if (user) await handleSessionByOrder(response, byOrderMatch[1], user);
      return;
    }
    if (request.method === "POST" && pathname === "/api/ai-agent/quick-order") {
      const user = getSession(request) ? await requireUser(request, response) : null;
      if (getSession(request) && !user) return;
      await handleQuickOrder(request, response, await readJson(request), user);
      return;
    }
    if (request.method === "POST" && pathname === "/api/ai-agent/quick-product-order") {
      const user = getSession(request) ? await requireUser(request, response) : null;
      if (getSession(request) && !user) return;
      await handleQuickProductOrder(request, response, await readJson(request), user);
      return;
    }
    if (request.method === "POST" && pathname === "/api/ai-agent/upload") {
      const form = await readMultipartForm(request);
      await handleUpload(response, form.file, form.docType);
      return;
    }
    sendJson(response, 404, {
      message: "AI agent route tidak ditemukan.",
      service: "customer-portal-api",
    });
    return;
  }
  if (pathname.startsWith("/api/portal/vendor-invite/")) {
    const isMultipart = String(request.headers["content-type"] ?? "").startsWith("multipart/form-data");
    const body = request.method === "POST"
      ? isMultipart ? await readMultipartForm(request) : await readJson(request)
      : {};
    const handled = await handleVendorInvitationRoute({
      request,
      response,
      url,
      body,
      sendJson,
      sendEmpty,
    });
    if (handled) return;
  }
  if (
    pathname === "/api/import-calculator/rates"
    || pathname === "/api/import-calculator/calculate"
    || pathname === "/api/import-calculator/multi-calculate"
    || pathname === "/api/btki/search"
    || pathname === "/api/portal/calculator-rates-v2"
  ) {
    const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
      ? await readJson(request)
      : {};
    const handled = await handleToolRoute({
      request,
      response,
      url,
      body,
      sendJson,
      sendError,
    });
    if (!handled) sendError(response, 404, "Tool route tidak ditemukan.");
    return;
  }
  if (request.method === "GET" && pathname === "/api/login/google") {
    handleGoogleStart(request, response, url);
    return;
  }
  if (request.method === "GET" && pathname === "/api/callback/google") {
    await handleGoogleCallback(request, response, url);
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
  if (request.method === "POST" && pathname === "/api/portal/auth/signup") {
    await handleSignup(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/otp/request") {
    await handleEmailOtpRequest(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/otp/verify") {
    await handleEmailOtpVerify(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/wa-otp/send") {
    await handleWaOtpRequest(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/wa-otp/verify") {
    await handleWaOtpVerify(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/wa-login") {
    await handleWaLogin(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/wa-register") {
    await handleWaRegister(request, response);
    return;
  }
  if (request.method === "POST" && pathname === "/api/portal/auth/wa-trusted-login") {
    await handleWaTrustedLogin(request, response);
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
  if (request.method === "GET" && pathname === "/api/portal/content") {
    await handlePortalContent({
      request,
      response,
      url,
      body: {},
      sendJson,
      sendError,
    });
    return;
  }
  if (pathname.startsWith("/api/portal/admin/vendor-invitations")
      || pathname === "/api/portal/admin/suppliers"
      || pathname.startsWith("/api/portal/admin/suppliers/")) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      const handled = await handleAdminVendorRoutes({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname === "/api/portal/admin/services"
    || /^\/api\/portal\/admin\/services\/\d+$/.test(pathname)
    || pathname === "/api/portal/admin/products"
    || /^\/api\/portal\/admin\/products\/\d+$/.test(pathname)
    || pathname === "/api/portal/admin/product-categories"
  ) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      const handled = await handleAdminCatalog({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname === "/api/portal/admin/vendor-catalog-items"
    || pathname.startsWith("/api/portal/admin/vendor-catalog-items/")
  ) {
    const user = await requireAdmin(request, response);
    if (user) {
      const isMultipart = String(request.headers["content-type"] ?? "").startsWith("multipart/form-data");
      const body = request.method === "POST" && isMultipart
        ? await readMultipartForm(request)
        : ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      const handled = await handleAdminVendorCatalog({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname.startsWith("/api/portal/admin/featured-packages")
    || pathname.startsWith("/api/portal/admin/featured-requests")
    || pathname.startsWith("/api/portal/admin/featured-maintenance/")
    || pathname.startsWith("/api/portal/admin/internal-featured/")
  ) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PATCH", "PUT"].includes(request.method ?? "") ? await readJson(request) : {};
      const handled = await handleAdminFeatured({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname === "/api/settings/vehicle-images"
    || pathname === "/api/settings/vehicle-images/upload"
    || pathname === "/api/settings/vehicle-order"
  ) {
    const user = await requireAdmin(request, response);
    if (user) {
      const isMultipart = String(request.headers["content-type"] ?? "").startsWith("multipart/form-data");
      const body = request.method === "POST" && isMultipart
        ? await readMultipartForm(request)
        : ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      const handled = await handleAdminLegacy({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname === "/api/portal/admin/content"
    || pathname === "/api/portal/admin/upload"
    || pathname === "/api/portal/admin/delivery-vendors"
    || /^\/api\/portal\/admin\/delivery-vendors\/\d+$/.test(pathname)
    || pathname === "/api/portal/admin/trucking-rates"
    || pathname === "/api/portal/admin/freight-rates"
    || pathname.startsWith("/api/portal/admin/vendor-form/")
    || pathname === "/api/portal/admin/master-price"
    || pathname.startsWith("/api/portal/admin/master-price/")
    || pathname === "/api/portal/admin/wa-logs"
    || pathname === "/api/portal/admin/wa-logs/stats"
    || /^\/api\/portal\/admin\/wa-logs\/\d+\/retry$/.test(pathname)
  ) {
    const user = await requireAdmin(request, response);
    if (user) {
      const isMultipart = String(request.headers["content-type"] ?? "").startsWith("multipart/form-data");
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
        ? isMultipart ? await readMultipartForm(request) : await readJson(request)
        : {};
      const handled = await handleAdminLegacy({
        request,
        response,
        url,
        body,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (pathname.startsWith("/api/portal/vendor/")) {
    const user = await requireUser(request, response);
    if (user) {
      const handled = await handleVendorPortalRoutes({
        request,
        response,
        url,
        user,
        sendJson,
        sendError,
        sendEmpty,
      });
      if (handled) return;
    }
  }
  if (
    pathname === "/api/service-packages"
    || pathname.startsWith("/api/service-packages/")
    || pathname === "/api/customer-service-requests"
    || (
      pathname.startsWith("/api/customer-service-requests/")
      && pathname !== "/api/customer-service-requests/public"
    )
  ) {
    const user = await requireUser(request, response);
    if (!user) return;
    const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
      ? await readJson(request)
      : {};
    const handled = await handleCustomerServiceRoutes(request, response, url, user, body);
    if (!handled) sendError(response, 404, "Customer service route tidak ditemukan.");
    return;
  }
  if (pathname === "/api/portal/customer-profile") {
    const user = await requireUser(request, response);
    if (!user) return;
    const body = request.method === "PUT" ? await readJson(request) : {};
    await handleServiceProfile(request, response, url, user, body);
    return;
  }
  if (pathname === "/api/portal/customer-profile/by-email") {
    const user = await requireUser(request, response);
    if (!user) return;
    await handleServiceProfile(request, response, url, user);
    return;
  }
  if (pathname === "/api/portal/trucking/estimate") {
    const body = request.method === "POST" ? await readJson(request) : {};
    await handleTruckingEstimate(request, response, body);
    return;
  }
  if (pathname === "/api/portal/trucking/bookings") {
    const user = await requireUser(request, response);
    if (!user) return;
    const body = request.method === "POST" ? await readJson(request) : {};
    await handleTruckingBooking(request, response, user, body);
    return;
  }
  if (pathname === "/api/settings/company-pickup-address") {
    const user = await requireUser(request, response);
    if (user) await handleCompanyPickupAddress(request, response, user);
    return;
  }
  if (
    pathname === "/api/customer-service-requests/public"
    || pathname === "/api/portal/request-quote"
  ) {
    const body = request.method === "POST" ? await readJson(request) : {};
    if (request.method !== "POST") {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }
    await handlePublicCalculatorQuote(request, response, body);
    return;
  }
  if (
    pathname.startsWith("/api/air-freight/")
    || pathname.startsWith("/api/ocean-freight/")
    || pathname.startsWith("/api/ocean-freight-public/")
  ) {
    const isPublicFreight =
      pathname === "/api/air-freight/public/estimate"
      || pathname === "/api/ocean-freight/calculate"
      || pathname === "/api/ocean-freight/inquiry"
      || pathname === "/api/ocean-freight-public/estimate"
      || pathname === "/api/ocean-freight-public/inquiry";
    const isPublicTracking =
      /^\/api\/air-freight\/public\/track\/[^/]+$/.test(pathname)
      || /^\/api\/ocean-freight\/track\/[^/]+$/.test(pathname);
    const user = isPublicTracking || isPublicFreight
      ? null
      : await requireUser(request, response);
    if (!isPublicTracking && !isPublicFreight && !user) return;
    const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
      ? await readJson(request)
      : {};
    const handled = await handleFreightRoute({
      request,
      response,
      url,
      user,
      body,
      sendJson,
      sendError,
    });
    if (!handled) sendError(response, 404, "Freight route tidak ditemukan.");
    return;
  }
  if (
    pathname === "/api/logistic/orders"
    || pathname.startsWith("/api/logistic/orders/")
  ) {
    const isPublicTrack = /^\/api\/logistic\/orders\/track\/[^/]+$/.test(pathname);
    const user = isPublicTrack
      ? (getSession(request) ? await requireUser(request, response) : null)
      : await requireUser(request, response);
    if (!isPublicTrack && !user) return;
    const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "")
      ? await readJson(request)
      : {};
    const handled = await handleLogisticCustomerRoutes(request, response, url, user, body);
    if (!handled) sendError(response, 404, "Logistic route tidak ditemukan.");
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/onboarding/status") {
    const user = await requireUser(request, response);
    if (user) await handleOnboardingStatus({ request, response, url, user, sendJson, sendError });
    return;
  }
  if (pathname === "/api/portal/onboarding/complete") {
    const user = await requireUser(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleOnboardingComplete({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (pathname === "/api/portal/onboarding/upload-doc" || pathname === "/api/portal/onboarding/ktp-ocr") {
    const user = await requireUser(request, response);
    if (user) {
      const form = request.method === "POST" ? await readMultipartForm(request) : {};
      const context = { request, response, url, user, form, sendJson, sendError };
      if (pathname === "/api/portal/onboarding/ktp-ocr") {
        await handleKtpOcr(context);
      } else {
        await handleDocumentUpload(context);
      }
    }
    return;
  }
  if (pathname === "/api/customer-verification" || pathname.startsWith("/api/customer-verification/")) {
    const user = await requireUser(request, response);
    if (user) {
      const isDocumentMutation =
        /^\/api\/customer-verification\/documents(?:\/\d+)?$/.test(pathname)
        && ["POST", "PUT"].includes(request.method ?? "");
      const form = isDocumentMutation ? await readMultipartForm(request) : undefined;
      await handleVerification({ request, response, url, user, form, sendJson, sendError, sendEmpty });
    }
    return;
  }
  if (pathname === "/api/portal/admin/customers/stats") {
    const user = await requireAdmin(request, response);
    if (user) await handleAdminCustomerStats({ request, response, url, user, sendJson, sendError });
    return;
  }
  const customerInvoicePaymentMatch = pathname.match(/^\/api\/portal\/me\/invoices\/(\d+)\/payments$/);
  if (customerInvoicePaymentMatch && request.method === "POST") {
    const user = await requireUser(request, response);
    if (user) {
      request.body = await readJson(request);
      await handleCustomerInvoices({
        request,
        response,
        user,
        sendJson,
        sendError,
        invoiceId: Number(customerInvoicePaymentMatch[1]),
      });
    }
    return;
  }
  const customerInvoiceMatch = pathname.match(/^\/api\/portal\/me\/invoices\/(\d+)$/);
  if (request.method === "GET" && customerInvoiceMatch) {
    const user = await requireUser(request, response);
    if (user) await handleCustomerInvoices({
      request,
      response,
      user,
      sendJson,
      sendError,
      invoiceId: Number(customerInvoiceMatch[1]),
    });
    return;
  }
  const paymentProofMatch = pathname.match(/^\\/api\\/payment-proof\\/([^/]+)(?:\\/(upload))?$/);
  if (paymentProofMatch) {
    const token = decodeURIComponent(paymentProofMatch[1]);
    const invoiceResult = await query(
      `select id, doc_number, invoice_number, customer_name, grand_total, payment_status,
              proof_url, proof_remarks, proof_uploaded_at, due_date
         from public.sales_documents
        where payment_proof_token = $1
          and invoice_status = 'invoiced'
        limit 1`,
      [token],
    );
    const invoice = invoiceResult.rows[0];
    if (!invoice) {
      sendJson(response, 404, { ok: false, error: "Link pembayaran tidak valid." });
      return;
    }
    if (request.method === "GET" && !paymentProofMatch[2]) {
      sendJson(response, 200, { ok: true, invoice: {
        docNumber: invoice.doc_number,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        grandTotal: Number(invoice.grand_total ?? 0),
        paymentStatus: invoice.payment_status,
        proofUrl: invoice.proof_url,
        proofRemarks: invoice.proof_remarks,
        proofUploadedAt: invoice.proof_uploaded_at,
        dueDate: invoice.due_date,
      }});
      return;
    }
    if (request.method === "POST" && paymentProofMatch[2] === "upload") {
      if (invoice.proof_url || invoice.proof_uploaded_at) {
        sendJson(response, 200, { ok: true, alreadyUploaded: true });
        return;
      }
      const form = await readMultipartForm(request);
      const file = form.file;
      if (!file) { sendJson(response, 400, { ok: false, error: "File bukti pembayaran wajib diunggah." }); return; }
      const uploaded = await uploadPaymentProof({ token, file });
      const updated = await query(
        `update public.sales_documents
            set proof_url = $1, proof_remarks = $2, proof_uploaded_at = now(),
                payment_status = case when payment_status = 'paid' then payment_status else 'proof_submitted' end,
                updated_at = now()
          where id = $3 and proof_url is null
          returning id`,
        [uploaded.path, String(form.remarks ?? "").trim().slice(0, 500) || null, invoice.id],
      );
      sendJson(response, 200, { ok: true, alreadyUploaded: !updated.rowCount });
      return;
    }
    sendJson(response, 405, { ok: false, error: "Method tidak didukung." });
    return;
  }

  if (request.method === "GET" && pathname === "/api/portal/me/invoices") {
    const user = await requireUser(request, response);
    if (user) await handleCustomerInvoices({ request, response, user, sendJson, sendError });
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/me/payments") {
    const user = await requireUser(request, response);
    if (user) await handleCustomerPayments({ request, response, user, sendJson, sendError });
    return;
  }
  const adminInvoiceActionMatch = pathname.match(/^\/api\/portal\/admin\/invoices\/(\d+)\/action$/);
  if (adminInvoiceActionMatch && request.method === "POST") {
    const user = await requireAdmin(request, response);
    if (user) {
      request.body = await readJson(request);
      await handleAdminInvoices({
        request,
        response,
        user,
        sendJson,
        sendError,
        invoiceId: Number(adminInvoiceActionMatch[1]),
      });
    }
    return;
  }
  const adminInvoiceMatch = pathname.match(/^\/api\/portal\/admin\/invoices\/(\d+)$/);
  if (request.method === "GET" && adminInvoiceMatch) {
    const user = await requireAdmin(request, response);
    if (user) await handleAdminInvoices({
      request,
      response,
      user,
      sendJson,
      sendError,
      invoiceId: Number(adminInvoiceMatch[1]),
    });
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/admin/invoices") {
    const user = await requireAdmin(request, response);
    if (user) await handleAdminInvoices({ request, response, user, sendJson, sendError });
    return;
  }
  const adminPaymentStatusMatch = pathname.match(/^\/api\/portal\/admin\/payments\/(\d+)\/status$/);
  if (adminPaymentStatusMatch && request.method === "POST") {
    const user = await requireAdmin(request, response);
    if (user) {
      request.body = await readJson(request);
      await handleAdminPayments({
        request,
        response,
        user,
        sendJson,
        sendError,
        paymentId: Number(adminPaymentStatusMatch[1]),
      });
    }
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/admin/payments") {
    const user = await requireAdmin(request, response);
    if (user) await handleAdminPayments({ request, response, user, sendJson, sendError });
    return;
  }
  if (pathname === "/api/portal/admin/customers" || /^\/api\/portal\/admin\/customers\/\d+$/.test(pathname)) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleAdminCustomers({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (pathname === "/api/portal/admin/approvals" || pathname === "/api/portal/admin/approvals/stats" || /^\/api\/portal\/admin\/approvals\/\d+(?:\/audit)?$/.test(pathname)) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleAdminApprovals({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (pathname === "/api/portal/admin/company-requests" || /^\/api\/portal\/admin\/company-requests\/\d+$/.test(pathname)) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleAdminCompanyRequests({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (pathname === "/api/portal/admin/service-operations" || /^\/api\/portal\/admin\/service-operations\/[^/]+\/\d+(?:\/actions)?$/.test(pathname)) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleServiceOperations({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (pathname === "/api/portal/admin/service-operations/notifications"
      || pathname === "/api/portal/admin/service-operations/notifications/mark-all-read"
      || /^\/api\/portal\/admin\/service-operations\/notifications\/\d+\/read$/.test(pathname)) {
    const user = await requireAdmin(request, response);
    if (user) {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleAdminNotifications({ request, response, url, user, body, sendJson, sendError, sendEmpty });
    }
    return;
  }
  if (pathname === "/api/portal/organization") {
    const user = await requireUser(request, response);
    if (!user) return;
    if (request.method === "GET") {
      await handleOrganization(request, response);
    } else {
      const body = ["POST", "PUT", "PATCH"].includes(request.method ?? "") ? await readJson(request) : {};
      await handleOrganizationMutation({ request, response, url, user, body, sendJson, sendError });
    }
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/me") {
    await handleAuthMe(request, response);
    return;
  }
  if (
    pathname === "/api/portal/orders"
    || /^\/api\/portal\/orders\/\d+\/cancel$/.test(pathname)
  ) {
    await handlePortalCompatOrders(request, response, "orders");
    return;
  }
  if (
    pathname === "/api/portal/logistic-orders"
    || /^\/api\/portal\/logistic-orders\/\d+\/cancel$/.test(pathname)
  ) {
    await handlePortalCompatOrders(request, response, "logistic-orders");
    return;
  }
  if (pathname === "/api/portal/product-orders") {
    if (request.method === "POST") await handleCreateProductOrder(request, response);
    else await handlePortalCompatOrders(request, response, "product-orders");
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/service-orders") {
    await handlePortalCompatOrders(request, response, "service-orders");
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/me/dashboard-stats") {
    await handlePortalDashboardStats(request, response);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/organization/companies") {
    await handleOrganizationCompanies(request, response, url);
    return;
  }
  if (request.method === "GET" && pathname === "/api/portal/order-feed") {
    await handlePortalOrderFeed(request, response);
    return;
  }
  const marketplaceRfqsMatch = pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)$/);
  if (request.method === "GET" && marketplaceRfqsMatch) {
    await handleMarketplaceRfqDetail(request, response, Number(marketplaceRfqsMatch[1]));
    return;
  }
  if (request.method === "GET" && pathname === "/api/mkt/portal/rfqs") {
    await handleMarketplaceRfqs(request, response, url);
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

  if (!pathname.startsWith("/api/") && IS_PRODUCTION) {
    if (await serveStatic(request, response, pathname)) return;
  }

  if (response.writableEnded) return;
  sendJson(response, 404, {
    message: "Customer Portal API route not found.",
    service: "customer-portal-api",
    code: "CUSTOMER_PORTAL_LOCAL_ENDPOINT_NOT_FOUND",
  });
}

const server = http.createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("[customer-portal-api] request failed", error?.stack ?? error?.message ?? error);
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