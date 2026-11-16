/**
 * DEV-only authorization boundary for a future Admin-as-internal-vendor
 * quotation action. This module deliberately performs NO SQL, sends NO WA,
 * reads NO vendor tokens and does NOT implement a second quote writer.
 *
 * Call only after the existing signed requireAdmin middleware and after the
 * canonical database transaction has locked and reloaded the quote/RFQ/vendor.
 */
const integerId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

function deny(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}

export function internalVendorQuoteDevEnabled(env = process.env) {
  return env.APP_ENV === "development" &&
    env.NODE_ENV !== "production" &&
    env.CST_INTERNAL_VENDOR_QUOTE_DEV === "true";
}

export function allowedInternalVendorCompanies(env = process.env) {
  const raw = String(env.CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV ?? "");
  // Fail closed on missing, invalid, wildcard, or partially parsed values.
  if (!/^[1-9]\d*(?:,[1-9]\d*)*$/.test(raw)) return new Set();
  const ids = raw.split(",").map(integerId);
  if (ids.some((id) => id === null)) return new Set();
  return new Set(ids);
}

/**
 * @param {object} context
 * @param {object} context.admin  Signed, DB-refreshed portal admin identity
 * @param {object} context.rfq  Locked canonical RFQ row
 * @param {object} context.quote  Locked canonical vendor quotation row
 * @param {object} context.supplier  Canonical supplier linked to the quote
 * @param {boolean} context.approvedBuyerCompany  Fresh Admin-reviewed company approval
 * @param {string} context.intent  Explicit Admin decision
 * @param {boolean} context.confirmed  Explicit Admin acknowledgement
 * @param {string} context.reason  Audit explanation for internal representation
 */
export function authorizeInternalVendorQuotation({
  admin, rfq, quote, supplier, approvedBuyerCompany,
  intent, confirmed, reason, env = process.env, now = new Date(),
}) {
  if (!internalVendorQuoteDevEnabled(env)) deny(404, "Aksi quotation internal DEV tidak tersedia.");
  const adminId = integerId(admin?.id);
  if (!adminId || admin?.role !== "admin" || admin?.account_status !== "active") {
    deny(403, "Hanya Admin aktif yang berwenang dapat mewakili vendor internal.");
  }
  const rfqId = integerId(rfq?.id);
  const quoteId = integerId(quote?.id);
  const vendorId = integerId(supplier?.id);
  const companyId = integerId(rfq?.company_id);
  if (!rfqId || !quoteId || !vendorId || !companyId ||
      integerId(quote?.rfq_id) !== rfqId ||
      integerId(quote?.vendor_id) !== vendorId) {
    deny(404, "Relasi RFQ, quotation, dan vendor tidak cocok.");
  }
  if (!allowedInternalVendorCompanies(env).has(companyId)) {
    deny(403, "Perusahaan tidak diizinkan untuk quotation internal DEV.");
  }
  if (supplier?.is_active !== true || supplier?.is_internal_vendor !== true ||
      integerId(supplier?.company_id) !== companyId) {
    deny(403, "Vendor bukan entitas internal aktif perusahaan tersebut.");
  }
  if (approvedBuyerCompany !== true || integerId(rfq?.portal_customer_id) === null) {
    deny(409, "Afiliasi perusahaan buyer belum disetujui Admin.");
  }
  if (!["quoting", "quoted"].includes(rfq?.status)) {
    deny(409, "RFQ belum berada pada tahap quotation yang sah.");
  }
  if (!["invited", "opened", "requote_requested"].includes(quote?.status)) {
    deny(409, "Quotation tidak berada pada tahap yang bisa diajukan.");
  }
  const expiry = quote?.valid_until ? new Date(quote.valid_until) : null;
  if (expiry && (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= new Date(now).getTime())) {
    deny(410, "Undangan vendor telah kedaluwarsa.");
  }
  const auditReason = typeof reason === "string" ? reason.trim() : "";
  if (intent !== "submit_internal_vendor_quote" || confirmed !== true ||
      auditReason.length < 8 || auditReason.length > 500) {
    deny(400, "Konfirmasi dan alasan penyerahan quotation internal wajib diisi.");
  }

  // Not a vendor impersonation: downstream canonical writer must persist this
  // real Admin actor and preserve normal customer PO approval; no auto-PO.
  return Object.freeze({
    actorType: "admin",
    actorId: String(adminId),
    actorName: "Internal vendor Admin #" + adminId,
    auditAction: "admin_internal_vendor_quote_submitted",
    companyId,
    vendorId,
    rfqId,
    quoteId,
    auditReason,
  });
}
