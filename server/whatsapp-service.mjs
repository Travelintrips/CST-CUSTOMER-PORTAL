import { pool, query } from "./db.mjs";
import { resolveCustomerPortalFonnteToken } from "./fonnte-config.mjs";

const clean = (v) => typeof v === "string" ? v.trim() : "";
export function normalizeWhatsAppPhone(value) {
  const raw = clean(value).replace(/[^0-9]/g, "");
  if (!raw) return null;
  if (raw.startsWith("62")) return raw;
  if (raw.startsWith("0")) return `62${raw.slice(1)}`;
  if (raw.startsWith("8")) return `62${raw}`;
  return raw;
}

export async function sendFonnteMessage({ phone, message }) {
  const target = normalizeWhatsAppPhone(phone), body = clean(message);
  const token = await resolveCustomerPortalFonnteToken();
  if (!target || !body) throw new Error("Nomor WhatsApp dan pesan wajib tersedia.");
  if (!token) throw new Error("CUSTOMER_PORTAL_FONNTE_TOKEN belum dikonfigurasi.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const form = new URLSearchParams({ target, message: body });
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: form,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.status !== true) throw new Error(clean(payload?.reason) || `Fonnte HTTP ${response.status}`);
    return payload;
  } finally { clearTimeout(timeout); }
}

function marketplaceMessage(row) {
  const ref = row.purchase_order_id ? `PO #${row.purchase_order_id}`
    : row.vendor_quote_id ? `Quotation #${row.vendor_quote_id}`
      : row.rfq_id ? `RFQ #${row.rfq_id}` : "Customer Portal";
  const labels = {
    rfq_vendor_invited: "Anda mendapat undangan RFQ baru.",
    vendor_quote_submitted: "Vendor telah mengirim quotation baru.",
    po_created: "Purchase Order baru telah dibuat.",
    po_accepted: "Purchase Order telah diterima vendor.",
    po_rejected: "Purchase Order ditolak vendor.",
  };
  return `CST Customer Portal\n${labels[row.event_type] ?? String(row.event_type).replaceAll("_", " ")}\n${ref}`;
}

async function resolvePhone(db, row) {
  if (row.recipient_type === "admin") return normalizeWhatsAppPhone(process.env.FONNTE_ADMIN_WA);
  if (row.recipient_phone) return normalizeWhatsAppPhone(row.recipient_phone);
  if (row.recipient_type === "vendor" && row.recipient_id) {
    const result = await db("select phone from public.suppliers where id=$1 limit 1", [row.recipient_id]);
    return normalizeWhatsAppPhone(result.rows[0]?.phone);
  }
  if (row.recipient_type === "customer" && row.recipient_id) {
    const result = await db("select phone from public.portal_customers where id=$1 limit 1", [row.recipient_id]);
    return normalizeWhatsAppPhone(result.rows[0]?.phone);
  }
  return null;
}

export async function getMarketplaceWhatsAppQueueStats() {
  const result = await query(
    `select
       count(*) filter (where channel='whatsapp' and status='pending')::int as pending,
       count(*) filter (where channel='whatsapp' and status='sending')::int as sending,
       count(*) filter (where channel='whatsapp' and status in ('failed','retrying'))::int as retrying,
       count(*) filter (where channel='whatsapp' and status='exhausted')::int as exhausted,
       count(*) filter (where channel='whatsapp' and status='sent')::int as sent,
       count(*) filter (
         where channel='whatsapp'
           and status in ('pending','sending','failed','retrying')
           and created_at < now() - interval '10 minutes'
       )::int as stuck_over_10m,
       min(created_at) filter (
         where channel='whatsapp'
           and status in ('pending','sending','failed','retrying')
       ) as oldest_actionable,
       max(sent_at) filter (where channel='whatsapp' and status='sent') as last_sent_at,
       max(updated_at) filter (where channel='whatsapp') as last_queue_update_at
     from public.mkt_notification_queue`,
  );
  const row = result.rows[0] ?? {};
  const configured = Boolean(await resolveCustomerPortalFonnteToken());
  const workerEnabled = process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED !== "false";
  return {
    configured,
    workerEnabled,
    pending: Number(row.pending ?? 0),
    sending: Number(row.sending ?? 0),
    retrying: Number(row.retrying ?? 0),
    exhausted: Number(row.exhausted ?? 0),
    sent: Number(row.sent ?? 0),
    stuckOver10m: Number(row.stuck_over_10m ?? 0),
    oldestActionable: row.oldest_actionable ?? null,
    lastSentAt: row.last_sent_at ?? null,
    lastQueueUpdateAt: row.last_queue_update_at ?? null,
  };
}

export async function processMarketplaceWhatsAppQueue({
  limit = 20,
  createdAfter = new Date(Date.now() - 5 * 60_000).toISOString(),
} = {}) {
  if (!(await resolveCustomerPortalFonnteToken())) {
    return { processed: 0, sent: 0, failed: 0, skipped: "not_configured" };
  }

  const cutoff = new Date(createdAfter);
  if (Number.isNaN(cutoff.getTime())) {
    throw new Error("WhatsApp queue cutoff tidak valid.");
  }
  const cutoffIso = cutoff.toISOString();
  const batch = Math.min(50, Math.max(1, Number(limit) || 20));

  await query(
    `update public.mkt_notification_queue
        set status='pending',
            next_retry_at=null,
            last_error=coalesce(last_error,'Recovered after interrupted WhatsApp delivery.'),
            updated_at=now()
      where channel='whatsapp'
        and created_at >= $1
        and status='sending'
        and updated_at < now() - interval '10 minutes'`,
    [cutoffIso],
  );

  const claimed = await query(
    `with next_rows as (
       select id
         from public.mkt_notification_queue
        where channel='whatsapp'
          and created_at >= $1
          and status in ('pending','failed','retrying')
          and (next_retry_at is null or next_retry_at <= now())
        order by created_at,id
        limit $2
        for update skip locked
     )
     update public.mkt_notification_queue q
        set status='sending', updated_at=now()
       from next_rows n
      where q.id=n.id
      returning q.id,q.event_type,q.recipient_type,q.recipient_id,q.recipient_phone,
                q.rfq_id,q.vendor_quote_id,q.purchase_order_id,q.payload_json,
                q.deduplication_key,q.status,q.attempt_count,q.max_attempts,
                q.next_retry_at,q.created_at`,
    [cutoffIso, batch],
  );

  const rows = claimed.rows ?? [];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const attempt = Number(row.attempt_count ?? 0) + 1;
    const maxAttempts = Math.max(1, Number(row.max_attempts ?? 3));
    const phone = await resolvePhone(query, row);

    if (!phone) {
      const errorMessage = "Nomor penerima WhatsApp tidak tersedia.";
      await query(
        `update public.mkt_notification_queue
            set status='exhausted',
                attempt_count=$2,
                last_error=$3,
                next_retry_at=null,
                updated_at=now()
          where id=$1 and status='sending'`,
        [row.id, maxAttempts, errorMessage],
      );
      await query(
        "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
        ["-", row.event_type, errorMessage],
      );
      failed += 1;
      continue;
    }

    try {
      await sendFonnteMessage({ phone, message: marketplaceMessage(row) });
      await query(
        `update public.mkt_notification_queue
            set status='sent',
                attempt_count=$2,
                sent_at=coalesce(sent_at,now()),
                last_error=null,
                next_retry_at=null,
                updated_at=now()
          where id=$1 and status='sending'`,
        [row.id, attempt],
      );
      await query(
        "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'sent',null,now())",
        [phone, row.event_type],
      );
      sent += 1;
    } catch (error) {
      const errorMessage = clean(error?.message) || "Gagal mengirim WhatsApp";
      const exhausted = attempt >= maxAttempts;
      const retryAt = exhausted
        ? null
        : new Date(Date.now() + Math.min(30, 5 * attempt) * 60_000).toISOString();
      await query(
        `update public.mkt_notification_queue
            set status=$2,
                attempt_count=$3,
                last_error=$4,
                next_retry_at=$5,
                updated_at=now()
          where id=$1 and status='sending'`,
        [row.id, exhausted ? "exhausted" : "failed", attempt, errorMessage, retryAt],
      );
      await query(
        "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
        [phone, row.event_type, errorMessage],
      );
      failed += 1;
    }
  }

  return { processed: rows.length, sent, failed, createdAfter: cutoffIso };
}

export async function retryWhatsAppLog(id) {
  const result = await query("select id,phone,message_type,status,invoice_id from public.wa_send_logs where id=$1 limit 1", [id]);
  const row = result.rows[0];
  if (!row) return { found: false };
  if (row.status !== "failed") return { found: true, retryable: false };
  const message = `CST Customer Portal\n${row.message_type || "Notifikasi"}${row.invoice_id ? `\nInvoice #${row.invoice_id}` : ""}`;
  try {
    await sendFonnteMessage({ phone: row.phone, message });
    await query("update public.wa_send_logs set status='sent',error_message=null where id=$1", [id]);
    return { found: true, retryable: true, sent: true };
  } catch (error) {
    await query("update public.wa_send_logs set error_message=$2 where id=$1", [id, clean(error?.message) || "Gagal mengirim WhatsApp"]);
    return { found: true, retryable: true, sent: false, error: clean(error?.message) };
  }
}
