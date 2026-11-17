// DEV-only, Admin-invoked read-only Gateway receipt lookup with a narrowly
// guarded DB status transition. Never enqueue/retry a WhatsApp message here.
import { query, databaseEnvironment, databaseConnectionSource } from "./db.mjs";
import { CST_GATEWAY_URL, resolveDevCustomerPortalGatewayToken } from "./dev-vendor-wa-gateway.mjs";

const fail = (statusCode, message) => {
  throw Object.assign(new Error(message), { statusCode });
};
const positiveId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const validMessageId = (value) => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(value ?? ""));
const dateValid = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));

export const DEV_VENDOR_GATEWAY_RECEIPT_SELECT_SQL = [
  "select n.id as queue_id, n.status as queue_status, n.attempt_count, n.sent_at,",
  "n.event_type, n.channel, n.recipient_type, n.recipient_id,",
  "n.payload_json #>> '{gateway_delivery,message_id}' as gateway_message_id,",
  "n.payload_json #>> '{gateway_delivery,device_id}' as gateway_device_id,",
  "v.vendor_id, r.company_id as rfq_company_id, s.company_id as supplier_company_id",
  "from public.mkt_notification_queue n",
  "join public.mkt_vendor_quotes v on v.id=n.vendor_quote_id and v.rfq_id=n.rfq_id",
  "join public.mkt_rfqs r on r.id=n.rfq_id",
  "join public.suppliers s on s.id=v.vendor_id",
  "where n.id=$1 and n.rfq_id=$2 and n.vendor_quote_id=$3 limit 1",
].join(" ");

export const DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL = `
update public.mkt_notification_queue
   set status='sent',
       sent_at=$3::timestamptz,
       payload_json=jsonb_set(
         coalesce(payload_json,'{}'::jsonb),'{gateway_delivery}',
         coalesce(payload_json->'gateway_delivery','{}'::jsonb) ||
           jsonb_build_object(
             'provider_status',$4::text,
             'provider_sent_at',$3::timestamptz,
             'provider_delivered_at',$5::timestamptz,
             'provider_read_at',$6::timestamptz,
             'receipt_synced_at',now()
           ),true),
       last_error=null,
       next_retry_at=null,
       updated_at=now()
 where id=$1 and status='queued' and attempt_count=1 and sent_at is null
   and payload_json #>> '{gateway_delivery,message_id}'=$2
 returning id,status,attempt_count,sent_at
`;


/**
 * Read-only queue snapshot for the Admin card. This is independent of quote
 * invitation eligibility: vendors can open/submit a quote AFTER the gateway
 * accepted the invitation but BEFORE Admin synchronizes provider SENT.
 *
 * It never checks the invitation token/status and never authorizes sending.
 */
export async function getDevVendorWaGatewayQueueSnapshot({
  queueId, rfqId, quoteId, env = process.env, db = query,
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production"
    || databaseEnvironment !== "development"
    || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(404, "Status WhatsApp hanya tersedia di Customer Portal DEV.");
  }
  if (![queueId, rfqId, quoteId].every(positiveId)) {
    fail(400, "ID antrean, RFQ atau Quote tidak valid.");
  }
  const result = await db(DEV_VENDOR_GATEWAY_RECEIPT_SELECT_SQL, [queueId, rfqId, quoteId]);
  const row = result.rows?.[0];
  if (!row || Number(row.queue_id) !== Number(queueId)) fail(404, "Antrean WhatsApp tidak ditemukan.");
  if (row.event_type !== "rfq_vendor_invited" || row.channel !== "whatsapp"
    || row.recipient_type !== "vendor"
    || Number(row.recipient_id) !== Number(row.vendor_id)
    || Number(row.rfq_company_id) !== 1 || Number(row.supplier_company_id) !== 1) {
    fail(409, "Binding antrean vendor tidak cocok.");
  }
  const deviceId = String(env.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV ?? "").trim();
  if (row.gateway_device_id && row.gateway_device_id !== deviceId) {
    fail(409, "Bukti perangkat Gateway tidak sesuai.");
  }
  const canSync = row.queue_status === "queued"
    && Number(row.attempt_count) === 1
    && row.sent_at == null
    && validMessageId(row.gateway_message_id);
  return {
    queueId: Number(queueId),
    quoteId: Number(quoteId),
    queueStatus: String(row.queue_status),
    canSync,
  };
}

export async function reconcileOneDevVendorWaGatewayReceipt({
  queueId, rfqId, quoteId,
  env = process.env, db = query,
  fetchFn = fetch,
  resolveToken = resolveDevCustomerPortalGatewayToken,
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production"
    || databaseEnvironment !== "development"
    || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(404, "Sinkronisasi status WhatsApp hanya untuk Customer Portal DEV.");
  }
  if (![queueId, rfqId, quoteId].every(positiveId)) fail(400, "ID antrean/RFQ/Quote tidak valid.");
  const result = await db(DEV_VENDOR_GATEWAY_RECEIPT_SELECT_SQL, [queueId, rfqId, quoteId]);
  const row = result.rows?.[0];
  if (!row || Number(row.queue_id) !== Number(queueId)) fail(404, "Antrean WhatsApp tidak ditemukan.");
  if (row.event_type !== "rfq_vendor_invited" || row.channel !== "whatsapp"
    || row.recipient_type !== "vendor"
    || Number(row.recipient_id) !== Number(row.vendor_id)
    || Number(row.rfq_company_id) !== 1 || Number(row.supplier_company_id) !== 1) {
    fail(409, "Binding undangan vendor dan perusahaan tidak sesuai.");
  }
  if (row.queue_status === "sent" && row.sent_at != null) {
    return { queueId: Number(queueId), status: "already_sent", updated: false };
  }
  if (row.queue_status !== "queued" || Number(row.attempt_count) !== 1
    || row.sent_at != null || !validMessageId(row.gateway_message_id)) {
    fail(409, "Antrean belum memiliki ACK Gateway yang siap disinkronkan.");
  }

  const deviceId = String(env.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV ?? "").trim();
  if (!deviceId || (row.gateway_device_id && row.gateway_device_id !== deviceId)) {
    fail(409, "Perangkat Gateway tidak sesuai dengan undangan yang diantrekan.");
  }
  const token = String(await resolveToken(env) ?? "").trim();
  if (!token) fail(409, "Token khusus Customer Portal tidak tersedia.");
  const msgId = String(row.gateway_message_id);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let receipt;
  try {
    const response = await fetchFn(CST_GATEWAY_URL + "/v1/messages/" + encodeURIComponent(msgId), {
      method: "GET",
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) fail(502, "Tidak dapat memeriksa status pesan Gateway.");
    receipt = await response.json();
  } catch (cause) {
    if (cause?.statusCode) throw cause;
    fail(502, "Status Gateway belum dapat dipastikan; tidak ada pesan dikirim ulang.");
  } finally {
    clearTimeout(timeout);
  }
  if (receipt?.messageId !== msgId || receipt?.clientId !== "customer-portal"
    || String(receipt?.companyId) !== "1" || receipt?.deviceId !== deviceId) {
    fail(409, "Bukti status Gateway tidak cocok dengan client atau perangkat.");
  }
  const providerStatus = String(receipt.status ?? "").toLowerCase();
  if (!["sent", "delivered", "read"].includes(providerStatus) || !dateValid(receipt.sentAt)) {
    return { queueId: Number(queueId), status: "awaiting_provider_sent",
      providerStatus: providerStatus || "unknown", updated: false };
  }

  const synced = await db(DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL, [
    Number(queueId), msgId, receipt.sentAt, providerStatus,
    dateValid(receipt.deliveredAt) ? receipt.deliveredAt : null,
    dateValid(receipt.readAt) ? receipt.readAt : null,
  ]);
  if (synced.rows?.length !== 1) fail(409, "Status antrean berubah; tidak menimpa pembaruan lain.");
  return { queueId: Number(queueId), status: "sent", providerStatus,
    updated: true, messageId: msgId };
}
