import {
  allowedInternalVendorCompanies,
  internalVendorQuoteDevEnabled,
} from "./internal-vendor-quote-authority.mjs";

function deny(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}
function validId(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * Safe read-only preflight for the existing canonical submit-internal route.
 * Always called after requireAdmin; returns no bearer tokens, contacts or prices.
 */
export async function loadInternalVendorQuoteDraft({
  db, admin, rfqId, quoteId, env = process.env, now = new Date(),
}) {
  if (!internalVendorQuoteDevEnabled(env)) deny(404, "Fitur quotation internal DEV belum aktif.");
  const rId = validId(rfqId);
  const qId = validId(quoteId);
  const aId = validId(admin?.id);
  if (!rId || !qId || !aId) deny(404, "Quotation tidak ditemukan.");
  if (admin.role !== "admin" || admin.account_status !== "active") {
    deny(403, "Admin tidak berwenang.");
  }
  const actor = (await db(
    "select id,email,role,account_status,auth_version from public.portal_customers where id=$1",
    [aId],
  )).rows[0];
  if (!actor || actor.role !== "admin" || actor.account_status !== "active" ||
      String(actor.email ?? "").trim().toLowerCase() !== String(admin.email ?? "").trim().toLowerCase() ||
      Number(actor.auth_version ?? 0) !== Number(admin.auth_version ?? 0)) {
    deny(403, "Sesi Admin tidak aktif.");
  }
  const row = (await db(
    `select q.id, q.rfq_id, q.vendor_id, q.status, q.valid_until,
            r.company_id, r.status as rfq_status, r.approval_status,
            r.portal_customer_id, s.name as supplier_name,
            s.company_id as supplier_company_id, s.is_active, s.is_internal_vendor
       from public.mkt_vendor_quotes q
       join public.mkt_rfqs r on r.id=q.rfq_id
       join public.suppliers s on s.id=q.vendor_id
      where q.id=$1 and r.id=$2`,
    [qId, rId],
  )).rows[0];
  if (!row) deny(404, "Quotation tidak ditemukan.");
  const companyId = validId(row.company_id);
  if (!companyId || !allowedInternalVendorCompanies(env).has(companyId) ||
      !row.is_internal_vendor || !row.is_active ||
      validId(row.supplier_company_id) !== companyId) {
    deny(404, "Quotation internal tidak tersedia.");
  }
  if (!["invited", "opened", "requote_requested"].includes(row.status) ||
      !["quoting", "quoted"].includes(row.rfq_status) ||
      row.approval_status !== "approved") {
    deny(409, "Quotation tidak siap diajukan.");
  }
  if (row.valid_until && new Date(row.valid_until).getTime() <= new Date(now).getTime()) {
    deny(410, "Undangan quotation telah kedaluwarsa.");
  }
  const buyer = (await db(
    "select id,role,customer_type,account_status from public.portal_customers where id=$1",
    [row.portal_customer_id],
  )).rows[0];
  if (!buyer || buyer.role !== "customer" || buyer.customer_type !== "company" ||
      buyer.account_status !== "active") {
    deny(409, "Identitas buyer perusahaan belum siap.");
  }
  const approved = (await db(
    `select m.company_id from public.portal_company_members m
       join public.portal_company_requests r
         on r.portal_customer_id=m.portal_customer_id
        and r.matched_company_id=m.company_id
        and r.status='approved' and r.reviewed_by is not null and r.reviewed_at is not null
       join public.companies c on c.id=m.company_id and c.is_active=true
      where m.portal_customer_id=$1 and m.company_id=$2 and m.is_active=true limit 1`,
    [row.portal_customer_id, companyId],
  )).rows[0];
  if (!approved) deny(409, "Afiliasi perusahaan buyer belum disetujui.");
  const lines = (await db(
    `select id, item_name, item_unit, requested_qty
       from public.mkt_rfq_lines where rfq_id=$1 order by sort_order, id limit 101`,
    [rId],
  )).rows;
  if (lines.length < 1 || lines.length > 100) deny(409, "Jumlah baris RFQ tidak valid.");
  return {
    rfqId: rId, quoteId: qId, supplierName: String(row.supplier_name ?? "Vendor internal"),
    expiresAt: row.valid_until,
    lines: lines.map(line => ({
      rfqLineId: Number(line.id), itemName: String(line.item_name ?? ""),
      unit: line.item_unit ?? null, requestedQty: Number(line.requested_qty),
    })),
  };
}
