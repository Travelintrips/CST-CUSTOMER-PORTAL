// Admin-only, DEV-only manual sharing of an existing vendor quotation
// bearer link. No message is sent; no quote/token is created or modified.
const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

export function buildDevVendorQuoteShare({ row, rfqId, quoteId, env = process.env }) {
  if (env.APP_ENV !== "development") fail(404, "Berbagi tautan vendor hanya tersedia di DEV.");
  if (!row || Number(row.rfq_id) !== Number(rfqId) || Number(row.id) !== Number(quoteId)) {
    fail(404, "Quotation vendor tidak ditemukan.");
  }
  if (!row.supplier_active) fail(409, "Supplier tidak aktif.");
  if (!["invited", "opened", "requote_requested"].includes(row.status)) {
    fail(409, "Quotation ini tidak membutuhkan undangan baru.");
  }
  if (row.invite_not_expired !== true) fail(410, "Tautan quotation sudah kedaluwarsa.");
  const token = typeof row.token === "string" ? row.token.trim() : "";
  if (!/^[A-Za-z0-9_-]{24,200}$/.test(token)) fail(409, "Token quotation tidak valid.");
  const raw = typeof row.supplier_phone === "string" ? row.supplier_phone.replace(/\D/g, "") : "";
  const phone = raw.startsWith("08") ? "62" + raw.slice(1) : raw.startsWith("8") ? "62" + raw : raw;
  if (!/^628\d{8,12}$/.test(phone)) fail(409, "Kontak WhatsApp vendor belum valid.");
  const pic = typeof row.contact_person === "string" ? row.contact_person.trim() : "";
  if (!pic) fail(409, "PIC vendor belum diisi. Verifikasi kontak sebelum membagikan tautan.");
  return {
    quoteId: Number(row.id),
    rfqId: Number(row.rfq_id),
    rfqNumber: String(row.rfq_number ?? ""),
    supplierName: String(row.supplier_name ?? ""),
    recipientPhoneLast4: phone.slice(-4),
    quotePath: "/mkt-vendor-quote/" + encodeURIComponent(token),
    expiresAt: row.valid_until ?? null,
  };
}
