import { pool, query } from "./db.mjs";

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
  const target = normalizeWhatsAppPhone(phone), body = clean(message), token = clean(process.env.FONNTE_TOKEN);
  if (!target || !body) throw new Error("Nomor WhatsApp dan pesan wajib tersedia.");
  if (!token) throw new Error("FONNTE_TOKEN belum dikonfigurasi.");
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

export async function processMarketplaceWhatsAppQueue({ limit = 20 } = {}) {
  if (!clean(process.env.FONNTE_TOKEN)) {
    return { processed: 0, sent: 0, failed: 0, skipped: "not_configured" };
  }
  const client = await pool.connect();
  const batch = Math.min(50, Math.max(1, Number(limit) || 20));
  let rows = [];
  let sent = 0;
  let failed = 0;
  try {
    await client.query("begin");
    const result = await client.query(
      `select id,event_type,recipient_type,recipient_id,recipient_phone,rfq_id,vendor_quote_id,
              purchase_order_id,payload_json,deduplication_key,status,attempt_count,max_attempts,
              next_retry_at,created_at
         from public.mkt_notification_queue
        where channel='whatsapp'
          and status='pending'
          and coalesce(next_retry_at,created_at) <= now()
        order by id
        limit $1
        for update skip locked`,
      [batch],
    );
    rows = result.rows;
    for (const row of rows) {
      const attempt = Number(row.attempt_count ?? 0) + 1;
      const maxAttempts = Math.max(1, Number(row.max_attempts ?? 3));
      const phone = await resolvePhone((sql, values) => client.query(sql, values), row);
      if (!phone) {
        const errorMessage = "Nomor penerima WhatsApp tidak tersedia.";
        const exhausted = attempt >= maxAttempts;
        await client.query(
          `update public.mkt_notification_queue
              set status=$2,
                  attempt_count=$3,
                  last_error=$4,
                  next_retry_at=case when $2='pending' then now() + interval '2 minutes' else null end,
                  updated_at=now()
            where id=$1 and status='pending'`,
          [row.id, exhausted ? "exhausted" : "pending", attempt, errorMessage],
        );
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
          ["-", row.event_type, errorMessage],
        );
        failed += 1;
        continue;
      }
      try {
        await sendFonnteMessage({ phone, message: marketplaceMessage(row) });
        await client.query(
          `update public.mkt_notification_queue
              set status='sent',
                  attempt_count=$2,
                  sent_at=coalesce(sent_at,now()),
                  last_error=null,
                  next_retry_at=null,
                  updated_at=now()
            where id=$1 and status='pending'`,
          [row.id, attempt],
        );
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'sent',null,now())",
          [phone, row.event_type],
        );
        sent += 1;
      } catch (error) {
        const errorMessage = clean(error?.message) || "Gagal mengirim WhatsApp";
        const exhausted = attempt >= maxAttempts;
        await client.query(
          `update public.mkt_notification_queue
              set status=$2,
                  attempt_count=$3,
                  last_error=$4,
                  next_retry_at=case when $2='pending' then now() + interval '2 minutes' else null end,
                  updated_at=now()
            where id=$1 and status='pending'`,
          [row.id, exhausted ? "exhausted" : "pending", attempt, errorMessage],
        );
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
          [phone, row.event_type, errorMessage],
        );
        failed += 1;
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
  return { processed: rows.length, sent, failed };
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
