// DEV-only status reconciliation of an already-queued, Admin-approved vendor invitation.
// Never sends or retries WhatsApp; requires the existing scoped customer-portal token.
import { query, databaseEnvironment, databaseConnectionSource } from "./db.mjs";
import { CST_GATEWAY_URL, resolveDevCustomerPortalGatewayToken } from "./dev-vendor-wa-gateway.mjs";

const fail = (code, message) => { throw Object.assign(new Error(message), { statusCode: code }); };
const positive = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const uuid = (value) => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(value ?? ""));

export const DEV_VENDOR_GATEWAY_STATUS_SELECT_SQL = [
  "select n.id as queue_id, n.status as queue_status, n.attempt_count,",
  "n.payload_json, n.sent_at, n.rfq_id, n.vendor_quote_id, n.recipient_id,",
  "n.channel, n.event_type, n.recipient_type,",
  "q.vendor_id, q.rfq_id as quote_rfq_id,",
  "r.company_id as rfq_company_id, s.company_id as supplier_company_id",
  "from public.mkt_notification_queue n",
  "join public.mkt_vendor_quotes q on q.id=n.vendor_quote_id",
  "join public.mkt_rfqs r on r.id=q.rfq_id",
  "join public.suppliers s on s.id=q.vendor_id",
  "where n.id=$1 and n.rfq_id=$2 and n.vendor_quote_id=$3",
  "and n.recipient_id=q.vendor_id limit 1",
].join(" ");

export const DEV_VENDOR_GATEWAY_SYNC_SENT_SQL = [
  "update public.mkt_notification_queue",
  "set status='sent', sent_at=coalesce(sent_at,$3::timestamptz),",
  "payload_json=jsonb_set(coalesce(payload_json,'{}'::jsonb),'{gateway_delivery}',",
  "coalesce(payload_json->'gateway_delivery','{}'::jsonb) ||",
  "jsonb_strip_nulls(jsonb_build_object(",
  "'provider_status',case",
  "when payload_json->'gateway_delivery'->>'provider_status'='read' or $4::text='read' then 'read'",
  "when payload_json->'gateway_delivery'->>'provider_status'='delivered' or $4::text='delivered' then 'delivered'",
  "else 'sent' end,",
  "'provider_sent_at',$3::timestamptz,",
  "'provider_delivered_at',$5::timestamptz,",
  "'provider_read_at',$6::timestamptz,",
  "'last_checked_at',now())),true),",
  "updated_at=now()",
  "where id=$1 and status in ('queued','sent') and attempt_count=1",
  "and payload_json->'gateway_delivery'->>'message_id'=$2",
  "returning id,status,sent_at,payload_json->'gateway_delivery' as gateway_delivery",
].join(" ");

export const DEV_VENDOR_GATEWAY_SYNC_FAILED_SQL = [
  "update public.mkt_notification_queue",
  "set status='exhausted', next_retry_at=null,",
  "last_error='WA Gateway melaporkan gagal. Perlu pemeriksaan manual; tidak boleh retry otomatis.',",
  "payload_json=jsonb_set(coalesce(payload_json,'{}'::jsonb),'{gateway_delivery}',",
  "coalesce(payload_json->'gateway_delivery','{}'::jsonb) ||",
  "jsonb_build_object('provider_status','failed','last_checked_at',now()),true),",
  "updated_at=now()",
  "where id=$1 and status='queued' and attempt_count=1",
  "and payload_json->'gateway_delivery'->>'message_id'=$2",
  "returning id,status",
].join(" ");

const dateOrNull = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// Read-only Admin state: remains available after quote OPENED, SUBMITTED or SELECTED.
// Sender readiness is intentionally unrelated to an already-dispatched message.
export async function getDevVendorWhatsAppSyncState({
  queueId, rfqId, quoteId, env = process.env, db = query,
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production"
    || databaseEnvironment !== "development"
    || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(404, "Status WA vendor hanya tersedia di Customer Portal DEV.");
  }
  if (![queueId, rfqId, quoteId].every(positive)) fail(400, "ID undangan tidak valid.");
  const result = await db(DEV_VENDOR_GATEWAY_STATUS_SELECT_SQL,
    [Number(queueId), Number(rfqId), Number(quoteId)]);
  const row = result.rows?.[0];
  if (!row) fail(404, "Antrean undangan vendor tidak ditemukan.");
  if (row.channel !== "whatsapp" || row.event_type !== "rfq_vendor_invited"
    || row.recipient_type !== "vendor"
    || Number(row.recipient_id) !== Number(row.vendor_id)
    || Number(row.rfq_id) !== Number(row.quote_rfq_id)
    || Number(row.rfq_company_id) !== 1
    || Number(row.supplier_company_id) !== 1) {
    fail(409, "Identitas antrean undangan tidak cocok.");
  }
  const receipt = row.payload_json?.gateway_delivery;
  const canSync = ["queued", "sent"].includes(row.queue_status)
    && Number(row.attempt_count) === 1
    && receipt?.provider === "cst-wa-gateway"
    && uuid(receipt.message_id);
  return {
    queueId: Number(queueId), quoteId: Number(quoteId),
    queueStatus: row.queue_status,
    providerStatus: typeof receipt?.provider_status === "string" ? receipt.provider_status : null,
    canSync: Boolean(canSync),
  };
}

export async function syncDevVendorWhatsAppStatus({
  queueId, rfqId, quoteId, env = process.env, db = query,
  fetchFn = fetch, resolveToken = resolveDevCustomerPortalGatewayToken,
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production"
    || databaseEnvironment !== "development"
    || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(404, "Sinkronisasi status WA hanya tersedia di Customer Portal DEV.");
  }
  if (![queueId, rfqId, quoteId].every(positive)) fail(400, "ID undangan tidak valid.");
  const result = await db(DEV_VENDOR_GATEWAY_STATUS_SELECT_SQL,
    [Number(queueId), Number(rfqId), Number(quoteId)]);
  const row = result.rows?.[0];
  if (!row) fail(404, "Antrean undangan vendor tidak ditemukan.");
  if (row.channel !== "whatsapp" || row.event_type !== "rfq_vendor_invited"
    || row.recipient_type !== "vendor"
    || Number(row.recipient_id) !== Number(row.vendor_id)
    || Number(row.rfq_id) !== Number(row.quote_rfq_id)
    || Number(row.rfq_company_id) !== 1
    || Number(row.supplier_company_id) !== 1) {
    fail(409, "Identitas antrean undangan tidak cocok.");
  }
  if (!["queued", "sent"].includes(row.queue_status)
    || Number(row.attempt_count) !== 1) {
    fail(409, "Antrean ini tidak sedang menunggu bukti pengiriman Gateway.");
  }
  const gatewayMessageId = row.payload_json?.gateway_delivery?.message_id;
  if (!uuid(gatewayMessageId)
    || row.payload_json?.gateway_delivery?.provider !== "cst-wa-gateway") {
    fail(409, "ID pesan Gateway tidak valid.");
  }
  const token = String(await resolveToken(env) ?? "").trim();
  if (!token || env.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV !== "ai-core"
    || String(env.CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV ?? "").slice(-4) !== "6556") {
    fail(409, "Identitas pengirim Customer Portal DEV belum cocok.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let provider;
  try {
    const response = await fetchFn(CST_GATEWAY_URL + "/v1/messages/" + encodeURIComponent(gatewayMessageId), {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      method: "GET", cache: "no-store", signal: controller.signal,
    });
    if (!response.ok) fail(502, "Status pesan WA Gateway belum bisa diverifikasi.");
    provider = await response.json().catch(() => null);
  } catch (problem) {
    if (problem?.statusCode) throw problem;
    fail(502, "Pemeriksaan status WA Gateway gagal; jangan mengirim ulang.");
  } finally {
    clearTimeout(timeout);
  }
  if (provider?.messageId !== gatewayMessageId
    || provider?.clientId !== "customer-portal"
    || provider?.companyId !== "1"
    || provider?.deviceId !== "ai-core") {
    fail(409, "Identitas bukti pengiriman WA Gateway tidak cocok.");
  }
  const providerStatus = String(provider.status ?? "").toLowerCase();
  if (!["sent", "delivered", "read", "failed"].includes(providerStatus)) {
    return { queueId: Number(queueId), quoteId: Number(quoteId),
      queueStatus: row.queue_status, providerStatus, updated: false };
  }
  let updated;
  if (providerStatus === "failed") {
    updated = await db(DEV_VENDOR_GATEWAY_SYNC_FAILED_SQL, [Number(queueId), gatewayMessageId]);
  } else {
    const sentAt = dateOrNull(provider.sentAt);
    if (!sentAt) fail(502, "Bukti timestamp pengiriman belum tersedia; tidak mengubah antrean.");
    updated = await db(DEV_VENDOR_GATEWAY_SYNC_SENT_SQL, [
      Number(queueId), gatewayMessageId, sentAt, providerStatus,
      dateOrNull(provider.deliveredAt), dateOrNull(provider.readAt),
    ]);
  }
  if (!updated.rows?.length) fail(409, "Status antrean berubah saat sinkronisasi; muat ulang.");
  return { queueId: Number(queueId), quoteId: Number(quoteId),
    queueStatus: updated.rows[0].status, providerStatus,
    updated: true };
}
