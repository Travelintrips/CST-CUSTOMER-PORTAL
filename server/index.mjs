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
import { handleMarketplaceRoute } from "./marketplace-service.mjs";

const PORT = Number(process.env.CUSTOMER_PORTAL_API_PORT ?? 18444);
const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = APP_ENV === "production" || process.env.NODE_ENV === "production";
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_MULTIPART_BODY_BYTES = 6 * 1024 * 1024;
const UPSTREAM_API_URL = (
  process.env.CUSTOMER_PORTAL_API_UPSTREAM_URL ??
  process.env.VITE_API_SERVER_URL ??
  ""
).replace(/\/+$/, "");

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

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

function corsHeaders(request) {
  const origin = request.headers.origin;
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        Vary: "Origin",
      }
    : {};
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

async function proxyToUpstream(request, response) {
  const incomingUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, `${UPSTREAM_API_URL}/`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (HOP_BY_HOP_HEADERS.has(name) || name === "host" || name === "content-length") continue;
    headers.set(name, Array.isArray(value) ? value.join(", ") : value ?? "");
  }

  const body = ["GET", "HEAD"].includes(request.method ?? "GET")
    ? undefined
    : await readRawBody(request);
  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = { ...corsHeaders(request) };
  for (const [name, value] of upstreamResponse.headers) {
    if (HOP_BY_HOP_HEADERS.has(name) || name === "set-cookie") continue;
    responseHeaders[name] = value;
  }
  const setCookies = typeof upstreamResponse.headers.getSetCookie === "function"
    ? upstreamResponse.headers.getSetCookie()
    : [];
  if (setCookies.length) responseHeaders["Set-Cookie"] = setCookies;

  response.writeHead(upstreamResponse.status, responseHeaders);
  response.end(Buffer.from(await upstreamResponse.arrayBuffer()));
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
  for (const [name, value] of Object.entries(corsHeaders(request))) {
    response.setHeader(name, value);
  }

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

  // Public Replit preview traffic reaches this service on external port 3000.
  // Keep the standalone auth/session routes above authoritative, then proxy
  // the rest of the API surface to the development CST API when available.
  if (UPSTREAM_API_URL && pathname.startsWith("/api/")) {
    await proxyToUpstream(request, response);
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