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
  if (!clean(process.env.FONNTE_TOKEN)) return { processed: 0, sent: 0, failed: 0, skipped: "not_configured" };
  const client = await pool.connect();
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const batch = Math.min(50, Math.max(1, Number(limit) || 20));
  let rows = [];
  try {
    await client.query("begin");
    const result = await client.query(
      `select id,event_type,recipient_type,recipient_id,recipient_phone,rfq_id,vendor_quote_id,
              purchase_order_id,payload_json,deduplication_key,created_at
         from public.mkt_notification_queue
        where channel='whatsapp'
          and processed_at is null
          and created_at >= $1
        order by id
        limit $2
        for update skip locked`,
      [cutoff, batch],
    );
    rows = result.rows;
    for (const row of rows) {
      const phone = await resolvePhone((sql, values) => client.query(sql, values), row);
      if (!phone) {
        await client.query("update public.mkt_notification_queue set processed_at=now() where id=$1 and processed_at is null", [row.id]);
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
          ["-", row.event_type, "Nomor penerima WhatsApp tidak tersedia."],
        );
        continue;
      }
      try {
        await sendFonnteMessage({ phone, message: marketplaceMessage(row) });
        await client.query("update public.mkt_notification_queue set processed_at=now() where id=$1 and processed_at is null", [row.id]);
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'sent',null,now())",
          [phone, row.event_type],
        );
      } catch (error) {
        await client.query("update public.mkt_notification_queue set processed_at=now() where id=$1 and processed_at is null", [row.id]);
        await client.query(
          "insert into public.wa_send_logs (phone,message_type,status,error_message,created_at) values ($1,$2,'failed',$3,now())",
          [phone, row.event_type, clean(error?.message) || "Gagal mengirim WhatsApp"],
        );
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally { client.release(); }
  const sent = rows.length ? (await query("select count(*)::int as count from public.wa_send_logs where created_at >= $1 and status='sent'", [cutoff])).rows[0]?.count ?? 0 : 0;
  return { processed: rows.length, sent: Number(sent), failed: Math.max(0, rows.length - Number(sent)) };
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
