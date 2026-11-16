// DEV-only, Admin-authorized dispatch for one pre-existing vendor invitation.
// No scheduler entrypoint, no Fleet/Tenant token fallback, and no automatic retry.
import { query, databaseEnvironment, databaseConnectionSource } from "./db.mjs";
import { buildDevVendorQuoteShare } from "./vendor-quote-share.mjs";
import { customerPortalFonnteConfigured } from "./fonnte-config.mjs";
import { normalizeWhatsAppPhone, sendFonnteMessage } from "./whatsapp-service.mjs";

const DEV_ORIGIN = "https://portaldev.72.61.210.205.sslip.io";
const error = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const fail = (statusCode, message) => { throw error(statusCode, message); };
const positiveId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
// Match the database selector exactly. "development" with NODE_ENV=production
// or a fallback PROD connection must never enable external WA delivery.
function assertDevEnvironment(env) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production"
    || databaseEnvironment !== "development"
    || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(404, "Kirim WA vendor hanya tersedia untuk database DEV khusus.");
  }
}

export const DEV_VENDOR_INVITE_SELECT_SQL = [
  "select n.id as queue_id, n.status as queue_status, n.event_type, n.channel,",
  "n.recipient_type, n.recipient_id, n.recipient_phone as queued_phone,",
  "n.attempt_count, n.sent_at, n.rfq_id as queue_rfq_id,",
  "n.vendor_quote_id as queue_quote_id,",
  "v.id, v.rfq_id, v.vendor_id, v.status, v.token, v.valid_until,",
  "(v.valid_until > now()) as invite_not_expired,",
  "r.rfq_number, r.company_id as rfq_company_id,",
  "s.name as supplier_name, s.is_active as supplier_active,",
  "s.is_verified as supplier_verified, s.company_id as supplier_company_id,",
  "s.phone as supplier_phone, s.contact_person",
  "from public.mkt_notification_queue n",
  "join public.mkt_vendor_quotes v on v.id=n.vendor_quote_id and v.rfq_id=n.rfq_id",
  "join public.mkt_rfqs r on r.id=v.rfq_id",
  "join public.suppliers s on s.id=v.vendor_id",
  "where n.id=$1 and n.rfq_id=$2 and n.vendor_quote_id=$3",
  "and n.recipient_id=v.vendor_id",
  "limit 1",
].join(" ");

function validateInvite(row, { queueId, rfqId, quoteId, env }) {
  assertDevEnvironment(env);
  if (![queueId, rfqId, quoteId].every(positiveId)) fail(400, "ID undangan harus valid.");
  if (!row || Number(row.queue_id) !== Number(queueId)) fail(404, "Antrean undangan tidak ditemukan.");
  if (row.channel !== "whatsapp" || row.event_type !== "rfq_vendor_invited"
    || row.recipient_type !== "vendor" || Number(row.recipient_id) !== Number(row.vendor_id)) {
    fail(409, "Antrean bukan undangan WhatsApp vendor yang tepat.");
  }
  if (row.supplier_verified !== true
    || !positiveId(row.supplier_company_id) || !positiveId(row.rfq_company_id)
    || Number(row.supplier_company_id) !== Number(row.rfq_company_id)) {
    fail(409, "Identitas dan perusahaan supplier belum cocok.");
  }
  if (row.status !== "invited") fail(409, "Quote tidak lagi menunggu undangan.");
  const share = buildDevVendorQuoteShare({ row, rfqId, quoteId, env });
  const phone = normalizeWhatsAppPhone(row.supplier_phone);
  if (!/^628\d{8,12}$/.test(phone ?? "")) fail(409, "Nomor PIC vendor tidak valid.");
  if (row.queued_phone && normalizeWhatsAppPhone(row.queued_phone) !== phone) {
    fail(409, "Nomor antrean berbeda dari nomor supplier. Perlu verifikasi.");
  }
  return { share, phone };
}

async function loadInvite({ queueId, rfqId, quoteId, db = query }) {
  const data = await db(DEV_VENDOR_INVITE_SELECT_SQL, [queueId, rfqId, quoteId]);
  return data.rows?.[0] ?? null;
}

export async function getDevVendorWhatsAppReadiness({
  queueId, rfqId, quoteId, env = process.env, db = query,
  isConfigured = customerPortalFonnteConfigured,
} = {}) {
  assertDevEnvironment(env);
  if (![queueId, rfqId, quoteId].every(positiveId)) fail(400, "ID undangan harus valid.");
  const row = await loadInvite({ queueId, rfqId, quoteId, db });
  const { share } = validateInvite(row, { queueId, rfqId, quoteId, env });
  const configured = Boolean(await isConfigured());
  const enabled = env.CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED === "true";
  const pending = row.queue_status === "pending"
    && Number(row.attempt_count ?? 0) === 0 && row.sent_at == null;
  return {
    queueId: Number(row.queue_id),
    quoteId: Number(share.quoteId),
    recipientLast4: share.recipientPhoneLast4,
    queueStatus: row.queue_status,
    senderConfigured: configured,
    enabled,
    ready: configured && enabled && pending,
    reason: !configured ? "Pengirim WhatsApp khusus Customer Portal DEV belum dikonfigurasi."
      : !enabled ? "Pengiriman WA vendor DEV masih dinonaktifkan."
      : !pending ? "Antrean sudah pernah diproses; tidak boleh mengirim ulang."
      : null,
  };
}

export const DEV_VENDOR_INVITE_CLAIM_SQL = [
  "update public.mkt_notification_queue n",
  "set status='sending', attempt_count=1, updated_at=now()",
  "where n.id=$1 and n.rfq_id=$2 and n.vendor_quote_id=$3",
  "and n.recipient_id=$4 and n.channel='whatsapp'",
  "and n.event_type='rfq_vendor_invited' and n.recipient_type='vendor'",
  "and n.status='pending' and coalesce(n.attempt_count,0)=0",
  "and n.sent_at is null",
  "and exists (",
  "select 1 from public.mkt_vendor_quotes v",
  "join public.suppliers s on s.id=v.vendor_id",
  "join public.mkt_rfqs r on r.id=v.rfq_id",
  "where v.id=n.vendor_quote_id and v.rfq_id=n.rfq_id",
  "and v.vendor_id=n.recipient_id and v.status='invited'",
  "and v.valid_until > now() and v.token=$5",
  "and s.is_active=true and s.is_verified=true",
  "and s.company_id=r.company_id",
  "and s.phone=$6 and s.contact_person=$7",
  "and (n.recipient_phone is null or n.recipient_phone=$6)",
  ") returning n.id",
].join(" ");

export async function sendOneDevVendorWhatsAppInvite({
  queueId, rfqId, quoteId, recipientLast4, confirmedRecipient,
  env = process.env, db = query,
  isConfigured = customerPortalFonnteConfigured,
  send = sendFonnteMessage,
} = {}) {
  assertDevEnvironment(env);
  if (!confirmedRecipient || typeof recipientLast4 !== "string") {
    fail(409, "Konfirmasi PIC vendor diperlukan sebelum mengirim.");
  }
  const readiness = await getDevVendorWhatsAppReadiness({
    queueId, rfqId, quoteId, env, db, isConfigured,
  });
  if (!readiness.ready) fail(409, readiness.reason ?? "Antrean belum siap dikirim.");
  if (recipientLast4 !== readiness.recipientLast4) {
    fail(409, "Empat digit nomor PIC tidak cocok.");
  }
  const row = await loadInvite({ queueId, rfqId, quoteId, db });
  const { share, phone } = validateInvite(row, { queueId, rfqId, quoteId, env });
  // The recipient could change after the readiness GET. Confirm again against
  // the exact snapshot used in the SQL claim and in the provider request.
  if (recipientLast4 !== share.recipientPhoneLast4) {
    fail(409, "Nomor PIC vendor berubah setelah konfirmasi. Muat ulang sebelum mengirim.");
  }
  const claim = await db(DEV_VENDOR_INVITE_CLAIM_SQL, [
    Number(queueId), Number(rfqId), Number(quoteId), Number(row.vendor_id),
    row.token, row.supplier_phone, row.contact_person,
  ]);
  if (!claim.rows?.length) fail(409, "Antrean berubah atau sudah diambil. Tidak dikirim ulang.");

  const message = [
    "CST Customer Portal — Undangan Quotation",
    "RFQ: " + share.rfqNumber,
    "Quote #" + share.quoteId,
    "Mohon isi penawaran melalui tautan khusus berikut:",
    DEV_ORIGIN + share.quotePath,
  ].join("\n");
  try {
    // Provider acceptance is not the same as WhatsApp delivery/read receipt.
    await send({ phone, message });
  } catch {
    await db(
      "update public.mkt_notification_queue set status='exhausted', last_error=$2, next_retry_at=null, updated_at=now() where id=$1 and status='sending' and attempt_count=1",
      [Number(queueId), "Pengiriman tidak terkonfirmasi. Periksa pengirim; jangan retry otomatis."],
    );
    fail(502, "Pengiriman tidak terkonfirmasi. Periksa pengirim sebelum mencoba tindakan lain.");
  }
  const marked = await db(
    "update public.mkt_notification_queue set status='sent', sent_at=now(), last_error=null, next_retry_at=null, updated_at=now() where id=$1 and status='sending' and attempt_count=1 returning id",
    [Number(queueId)],
  );
  if (!marked.rows?.length) {
    fail(409, "Provider menerima pesan tetapi status antrean belum tersimpan; jangan kirim ulang.");
  }
  return { queueId: Number(queueId), quoteId: Number(quoteId), status: "provider_accepted" };
}
