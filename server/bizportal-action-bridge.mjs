import { createHash, createPublicKey, verify as verifySignature } from "node:crypto";
import { query } from "./db.mjs";
import { handleMarketplaceRoute } from "./marketplace-service.mjs";

// Only the public verification key is bundled. The matching private signing
// key must be installed independently in the trusted BizPortal DEV runtime.
const DEV_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA6YkrXfe6QFAtDqTLmq4dcDmeT9O99iW4x//v49wZ3Ko=
-----END PUBLIC KEY-----`;
const PUBLIC_KEY = createPublicKey(DEV_PUBLIC_KEY);
const REQUEST_MAX_BYTES = 16_384;
const CLOCK_SKEW_MS = 120_000;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

const RFQ_ACTION = /^\/api\/mkt\/admin\/rfqs\/([1-9][0-9]{0,9})\/(invite-vendor|approve-and-invite|send-to-customer)$/;
const PO_ACTION = /^\/api\/mkt\/admin\/purchase-orders\/([1-9][0-9]{0,9})\/(issue|production|ready-to-ship|in-transit|delivered|complete|close)$/;

function bridgeEnabled() {
  return process.env.APP_ENV === "development"
    && process.env.NODE_ENV !== "production"
    && process.env.PORTAL_BIZPORTAL_BRIDGE_ENABLED === "true";
}

export function signatureMessage(timestamp, requestId, rawBody) {
  return `${timestamp}\n${requestId}\n${createHash("sha256").update(rawBody).digest("hex")}`;
}

export function verifyBridgeRequest({ timestamp, requestId, signature, rawBody, now = Date.now() }) {
  if (typeof timestamp !== "string" || !/^[0-9]{13}$/.test(timestamp)
    || Math.abs(now - Number(timestamp)) > CLOCK_SKEW_MS
    || !UUID.test(String(requestId))
    || typeof signature !== "string" || !/^[A-Za-z0-9_-]{80,100}$/.test(signature)
    || rawBody.length > REQUEST_MAX_BYTES) return false;
  try {
    return verifySignature(
      null,
      Buffer.from(signatureMessage(timestamp, requestId, rawBody)),
      PUBLIC_KEY,
      Buffer.from(signature, "base64url"),
    );
  } catch {
    return false;
  }
}

function sanitizeAction(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const path = typeof value.path === "string" ? value.path : "";
  const match = RFQ_ACTION.exec(path) ?? PO_ACTION.exec(path);
  if (!match) return null;
  if (!UUID.test(String(value.actorUserId))) return null;
  if (typeof value.actorEmail !== "string" || value.actorEmail.length > 254
    || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.actorEmail)) return null;
  if (!value.body || typeof value.body !== "object" || Array.isArray(value.body)) return null;
  if (JSON.stringify(value.body).length > 8_192) return null;

  const body = value.body;
  if (match[2] === "invite-vendor") {
    if (!Number.isSafeInteger(body.vendorId) || body.vendorId <= 0
      || (body.notes !== undefined && (typeof body.notes !== "string" || body.notes.length > 2000))) return null;
  }
  if (match[2] === "approve-and-invite") {
    if (!Array.isArray(body.vendorIds) || body.vendorIds.length < 1 || body.vendorIds.length > 20
      || !body.vendorIds.every((id) => Number.isSafeInteger(id) && id > 0)) return null;
  }
  if (match[2] === "send-to-customer"
    && (!Number.isSafeInteger(body.quoteId) || body.quoteId <= 0)) return null;

  return {
    path,
    entityType: RFQ_ACTION.test(path) ? "rfq" : "po",
    entityId: Number(match[1]),
    actorUserId: String(value.actorUserId).toLowerCase(),
    actorEmail: value.actorEmail.trim().toLowerCase(),
    body,
  };
}

async function bodyBuffer(request) {
  const blocks = [];
  let bytes = 0;
  for await (const chunk of request) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += data.length;
    if (bytes > REQUEST_MAX_BYTES) return null;
    blocks.push(data);
  }
  return Buffer.concat(blocks);
}

function respond(sendJson, response, status, payload) {
  return sendJson(response, status, payload);
}

export async function handleBizPortalActionBridge({ request, response, sendJson, verifyRequest = verifyBridgeRequest }) {
  if (!bridgeEnabled()) {
    respond(sendJson, response, 404, { error: "Not found" });
    return;
  }
  if (request.method !== "POST") {
    respond(sendJson, response, 405, { error: "Method not allowed" });
    return;
  }
  const rawBody = await bodyBuffer(request);
  if (!rawBody) {
    respond(sendJson, response, 413, { error: "Payload too large" });
    return;
  }
  const requestId = String(request.headers["x-cst-bridge-request-id"] ?? "").toLowerCase();
  const timestamp = request.headers["x-cst-bridge-timestamp"];
  const signature = request.headers["x-cst-bridge-signature"];
  if (!verifyRequest({ timestamp, requestId, signature, rawBody })) {
    respond(sendJson, response, 401, { error: "Bridge signature invalid" });
    return;
  }

  let parsed;
  try { parsed = JSON.parse(rawBody.toString("utf8")); }
  catch { respond(sendJson, response, 400, { error: "Invalid JSON" }); return; }
  const action = sanitizeAction(parsed);
  if (!action) {
    respond(sendJson, response, 422, { error: "Unsupported action" });
    return;
  }

  // The signed envelope is not sufficient by itself. Revalidate that this is
  // an active BizPortal admin in the same CST-DEV database.
  const actorResult = await query(
    `select id,email,role from public.users
      where id=$1 and lower(email)=lower($2)
        and lower(role) in ('admin','owner','super_admin')
        and is_active is distinct from false
        and coalesce(lower(status),'active') not in ('inactive','disabled','suspended','deleted')
      limit 1`,
    [action.actorUserId, action.actorEmail],
  );
  if (!actorResult.rows[0]) {
    respond(sendJson, response, 403, { error: "BizPortal admin not authorized" });
    return;
  }
  const entity = action.entityType === "rfq"
    ? await query("select id from public.mkt_rfqs where id=$1 and company_id is null limit 1", [action.entityId])
    : await query(`select p.id from public.mkt_purchase_orders p join public.mkt_rfqs r on r.id=p.rfq_id
        where p.id=$1 and p.company_id is null and r.company_id is null limit 1`, [action.entityId]);
  if (!entity.rows[0]) {
    respond(sendJson, response, 404, { error: "Marketplace resource unavailable" });
    return;
  }

  // Customer Portal remains the single canonical writer. Never use caller-
  // supplied Portal session claims. The DEV service operator is a fixed,
  // database-validated admin and the actual BizPortal actor is audited below.
  const admin = await query(
    `select * from public.portal_customers
      where email='dev-admin@dev.local' and role='admin' and account_status='active' limit 1`,
  );
  if (!admin.rows[0]) {
    respond(sendJson, response, 503, { error: "Canonical operator unavailable" });
    return;
  }

  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const inserted = await query(
    `insert into portal_bridge_private.marketplace_action_receipts
      (action_id,actor_user_id,actor_email,action_path,payload_sha256,status)
      values ($1,$2,$3,$4,$5,'processing')
      on conflict (action_id) do nothing returning action_id`,
    [requestId,action.actorUserId,action.actorEmail,action.path,payloadHash],
  );
  if (!inserted.rowCount) {
    const existing = (await query(
      `select action_path,payload_sha256,status,result_code,result_payload
        from portal_bridge_private.marketplace_action_receipts where action_id=$1`,
      [requestId],
    )).rows[0];
    if (!existing || existing.action_path !== action.path || existing.payload_sha256 !== payloadHash) {
      respond(sendJson,response,409,{error:"Request ID reused with different payload"});
    } else if (existing.status === "processing") {
      respond(sendJson,response,409,{error:"Action already processing; inspect receipt"});
    } else {
      respond(sendJson,response,existing.result_code,existing.result_payload);
    }
    return;
  }

  const delegatedRequest = Object.create(request);
  delegatedRequest.method = "POST";
  delegatedRequest.url = action.path;
  delegatedRequest.headers = {
    "content-type": "application/json",
    "idempotency-key": requestId,
  };
  let result = null;
  try {
    const delegatedResponse = {};
    const accepted = await handleMarketplaceRoute({
      request: delegatedRequest,
      response: delegatedResponse,
      url: new URL(action.path, "http://customer-portal-dev.internal"),
      body: action.body,
      user: admin.rows[0],
      isAdmin: true,
      sendJson: (_response, status, value) => {
        result = { status, value };
      },
    });
    if (!accepted || !result) result = { status: 404, value: { error: "Canonical action not available" } };
  } catch (error) {
    const status = Number(error?.statusCode) || 503;
    result = {
      status: status >= 400 && status < 500 ? status : 503,
      value: { error: status >= 500 ? "Canonical action failed" : String(error?.message ?? "Action rejected").slice(0, 200) },
    };
  }

  await query(
    `update portal_bridge_private.marketplace_action_receipts
        set status=$2, result_code=$3, result_payload=$4::jsonb, finished_at=now()
      where action_id=$1 and status='processing'`,
    [requestId, result.status < 400 ? "completed" : "failed", result.status, JSON.stringify(result.value)],
  );
  respond(sendJson, response, result.status, result.value);
}
