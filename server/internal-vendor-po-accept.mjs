/**
 * Narrow DEV-only Admin representation of the company's *internal* vendor
 * for an already customer-approved, explicitly synthetic PO.
 *
 * Never read or expose vendor bearer tokens. Only the existing signed Admin
 * session may reach this module. The acceptance writer is shared with the
 * canonical vendor capability endpoint, not reimplemented here.
 */
import { allowedInternalVendorCompanies } from "./internal-vendor-quote-authority.mjs";

const positiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
const deny = (statusCode, message) => {
  throw Object.assign(new Error(message), { statusCode });
};

export function internalVendorPoAcceptanceDevEnabled(env = process.env) {
  return env.APP_ENV === "development"
    && env.NODE_ENV !== "production"
    && env.CST_INTERNAL_VENDOR_PO_ACCEPT_DEV === "true";
}

export function internalVendorPoTestAllowlist(env = process.env) {
  const raw = String(env.CST_INTERNAL_VENDOR_PO_IDS_DEV ?? "");
  if (!/^[1-9]\d*(?:,[1-9]\d*)*$/.test(raw)) return new Set();
  const ids = raw.split(",").map(positiveId);
  if (ids.some((id) => id === null)) return new Set();
  return new Set(ids);
}

export function authorizeInternalVendorPoAcceptance({
  admin, po, rfq, quote, supplier, approvedBuyerCompany,
  env = process.env, intent, confirmed, reason, requireDecision = false,
}) {
  if (!internalVendorPoAcceptanceDevEnabled(env)) {
    deny(404, "Konfirmasi PO vendor internal DEV tidak tersedia.");
  }
  const adminId = positiveId(admin?.id);
  if (!adminId || admin?.role !== "admin" || admin?.account_status !== "active") {
    deny(403, "Hanya Admin aktif yang berwenang mengonfirmasi PO internal DEV.");
  }
  const poId = positiveId(po?.id);
  const rfqId = positiveId(rfq?.id);
  const quoteId = positiveId(quote?.id);
  const vendorId = positiveId(supplier?.id);
  const companyId = positiveId(po?.company_id);
  if (!poId || !rfqId || !quoteId || !vendorId || !companyId ||
      positiveId(po?.rfq_id) !== rfqId || positiveId(po?.quote_id) !== quoteId ||
      positiveId(po?.vendor_id) !== vendorId ||
      positiveId(rfq?.company_id) !== companyId ||
      positiveId(rfq?.winning_quote_id) !== quoteId ||
      positiveId(quote?.rfq_id) !== rfqId ||
      positiveId(quote?.vendor_id) !== vendorId ||
      positiveId(supplier?.company_id) !== companyId) {
    deny(404, "Identitas PO, RFQ, quotation, perusahaan atau vendor tidak cocok.");
  }
  if (!allowedInternalVendorCompanies(env).has(companyId) ||
      !internalVendorPoTestAllowlist(env).has(poId)) {
    deny(404, "PO tidak termasuk cakupan pengujian internal DEV.");
  }
  if (supplier.is_internal_vendor !== true || supplier.is_active !== true) {
    deny(403, "Hanya vendor internal aktif perusahaan yang dapat diwakili.");
  }
  if (rfq.status !== "awarded" || rfq.approval_status !== "approved" ||
      approvedBuyerCompany !== true || !positiveId(rfq.portal_customer_id) ||
      quote.status !== "selected") {
    deny(409, "PO belum memiliki persetujuan customer dan afiliasi perusahaan yang sah.");
  }
  // Do not allow Admin to represent vendor for historical or commercial POs.
  if (!String(quote.notes ?? "").startsWith("TEST DEV ONLY")) {
    deny(403, "Hanya PO dengan quotation bertanda TEST DEV ONLY yang dapat diuji.");
  }
  if (!Number.isFinite(Number(po.grand_total)) || Number(po.grand_total) <= 0 ||
      po.payment_status !== "unpaid") {
    deny(409, "Nilai atau status pembayaran PO tidak sesuai pengujian DEV.");
  }
  const replay = po.status === "vendor_accepted" && po.confirmed_at != null;
  if (!replay && (po.status !== "issued" || po.confirmed_at != null)) {
    deny(409, "PO bukan dalam keadaan menunggu konfirmasi vendor.");
  }
  const auditReason = typeof reason === "string" ? reason.trim() : "";
  if (requireDecision && (intent !== "accept_internal_vendor_po_dev" ||
      confirmed !== true || auditReason.length < 12 || auditReason.length > 500 ||
      !auditReason.startsWith("TEST DEV"))) {
    deny(400, "Konfirmasi dan alasan audit TEST DEV wajib diisi.");
  }
  return Object.freeze({
    poId, rfqId, quoteId, companyId, vendorId, adminId,
    adminName: admin.name ?? admin.email ?? ("Admin #" + adminId),
    auditReason, alreadyProcessed: replay,
  });
}

export async function loadInternalVendorPoAcceptance({
  db, admin, poId, env = process.env, decision = null, forUpdate = false,
}) {
  if (!internalVendorPoAcceptanceDevEnabled(env)) {
    deny(404, "Konfirmasi PO vendor internal DEV tidak tersedia.");
  }
  const normalizedId = positiveId(poId);
  if (!normalizedId || !internalVendorPoTestAllowlist(env).has(normalizedId)) {
    deny(404, "PO tidak termasuk cakupan pengujian internal DEV.");
  }
  if (typeof db !== "function" || !positiveId(admin?.id)) {
    deny(403, "Sesi Admin tidak tersedia.");
  }
  const adminRow = (await db(
    "select id,role,account_status from public.portal_customers where id=$1 limit 1 for share",
    [admin.id],
  )).rows[0];
  if (!adminRow || adminRow.role !== "admin" || adminRow.account_status !== "active") {
    deny(403, "Admin aktif tidak ditemukan.");
  }

  const record = (await db(
    `select po.id,po.po_number,po.rfq_id,po.quote_id,po.vendor_id,po.company_id,
            po.status,po.confirmed_at,po.payment_status,po.grand_total,
            r.id as rfq_identity,r.status as rfq_status,
            r.rfq_number,r.buyer_email,
            r.approval_status,r.company_id as rfq_company_id,
            r.portal_customer_id,r.winning_quote_id,
            q.id as quote_identity,q.status as quote_status,
            q.rfq_id as quote_rfq_id,q.vendor_id as quote_vendor_id,
            q.notes as quote_notes,s.id as supplier_identity,
            s.name as supplier_name,s.company_id as supplier_company_id,
            s.is_internal_vendor,s.is_active as supplier_active
       from public.mkt_purchase_orders po
       join public.mkt_rfqs r on r.id=po.rfq_id
       join public.mkt_vendor_quotes q on q.id=po.quote_id
       join public.suppliers s on s.id=po.vendor_id
      where po.id=$1
      limit 1${forUpdate ? " for update of po" : ""}`,
    [normalizedId],
  )).rows[0];
  if (!record) deny(404, "PO tidak ditemukan.");

  const buyer = (await db(
    "select id,role,customer_type,account_status from public.portal_customers where id=$1 for share",
    [record.portal_customer_id],
  )).rows[0];
  const buyerEligible = buyer?.role === "customer" && buyer.customer_type === "company" &&
    buyer.account_status === "active";
  const company = buyerEligible ? (await db(
    `select m.company_id
       from public.portal_company_members m
       join public.portal_company_requests req
         on req.portal_customer_id=m.portal_customer_id
        and req.matched_company_id=m.company_id
        and req.status='approved' and req.reviewed_by is not null
        and req.reviewed_at is not null
       join public.companies c on c.id=m.company_id and c.is_active=true
      where m.portal_customer_id=$1 and m.company_id=$2 and m.is_active=true
      limit 1 for share of m,req,c`,
    [record.portal_customer_id,record.company_id],
  )).rows : [];

  const authorization = authorizeInternalVendorPoAcceptance({
    admin: { ...admin, ...adminRow },
    po: record,
    rfq: {
      id: record.rfq_identity, status: record.rfq_status,
      approval_status: record.approval_status, company_id: record.rfq_company_id,
      portal_customer_id: record.portal_customer_id,
      winning_quote_id: record.winning_quote_id,
    },
    quote: {
      id: record.quote_identity, rfq_id: record.quote_rfq_id,
      vendor_id: record.quote_vendor_id, status: record.quote_status,
      notes: record.quote_notes,
    },
    supplier: {
      id: record.supplier_identity, company_id: record.supplier_company_id,
      is_internal_vendor: record.is_internal_vendor,
      is_active: record.supplier_active,
    },
    approvedBuyerCompany: company.length === 1,
    env,
    intent: decision?.intent, confirmed: decision?.confirmed, reason: decision?.reason,
    requireDecision: decision != null,
  });
  // The token (existing po.vendor_token) is never loaded by this query.
  return {
    po: record, authorization,
    data: {
      poId: authorization.poId,
      poNumber: record.po_number,
      vendorName: record.supplier_name,
      amount: Number(record.grand_total),
      status: record.status,
      alreadyProcessed: authorization.alreadyProcessed,
    },
  };
}
