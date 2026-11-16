import { authorizeInternalVendorQuotation, internalVendorQuoteDevEnabled } from "./internal-vendor-quote-authority.mjs";

function fail(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}
function integer(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) fail(400, label + " tidak valid.");
  return parsed;
}
function decimal(value, label, { positive = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive ? parsed <= 0 : parsed < 0)) {
    fail(400, label + " tidak valid.");
  }
  return parsed;
}
function text(value, fallback = null, max = 2000) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : fallback;
}
function dateOnly(value, label) {
  const valueText = typeof value === "string" ? value.trim() : "";
  if (!valueText) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valueText)) fail(400, label + " tidak valid.");
  const date = new Date(valueText + "T00:00:00.000Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== valueText) {
    fail(400, label + " tidak valid.");
  }
  return valueText;
}
function normalizePaymentTerm(value) {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return null;
  if (normalized === "dp_after_receipt" || normalized.startsWith("dp ") || normalized.includes("down payment") || normalized.includes("uang muka")) return "dp_after_receipt";
  if (["prepaid", "prepayment", "cash before delivery"].includes(normalized) || normalized.includes("bayar penuh sebelum")) return "prepaid";
  if (/^net[ _-]?7(?:\s*hari)?$/.test(normalized) || normalized.includes("7 hari")) return "net_7";
  if (/^net[ _-]?14(?:\s*hari)?$/.test(normalized) || normalized.includes("14 hari")) return "net_14";
  if (/^net[ _-]?30(?:\s*hari)?$/.test(normalized) || normalized.includes("30 hari")) return "net_30";
  if (normalized.includes("bayar sebelum")) return "prepaid";
  return null;
}
function normalizeDpPercent(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 100
    ? Number(parsed.toFixed(2))
    : null;
}
function dpPercentFromTerm(value) {
  const match = String(value ?? "").match(/(?:dp|down payment|uang muka)\s*([0-9]+(?:[.,][0-9]+)?)\s*%/i);
  return match ? normalizeDpPercent(String(match[1]).replace(",", ".")) : null;
}
const PAYMENT_TERM_LABELS = {
  prepaid: "Bayar penuh sebelum barang diserahkan/dikirim",
  dp_after_receipt: "DP sebelum serah/kirim, pelunasan setelah barang diterima",
  net_7: "NET 7 hari setelah penerimaan",
  net_14: "NET 14 hari setelah penerimaan",
  net_30: "NET 30 hari setelah penerimaan",
};
function paymentTermLabel(code, dpPercent = null) {
  if (code === "dp_after_receipt") {
    const percent = normalizeDpPercent(dpPercent);
    return percent
      ? "DP " + percent + "% sebelum serah/kirim, pelunasan setelah barang diterima"
      : PAYMENT_TERM_LABELS.dp_after_receipt;
  }
  return PAYMENT_TERM_LABELS[code] ?? null;
}
const STOCK_STATUSES = new Set(["available", "limited", "backorder", "unavailable"]);

export function normalizeVendorQuoteSubmission(body, { requirePaymentTerms = true } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail(400, "Data quotation tidak valid.");
  const rawLines = Array.isArray(body.lines) ? body.lines : [];
  if (!rawLines.length || rawLines.length > 100) fail(400, "Line quotation wajib diisi.");
  const seen = new Set();
  const lines = rawLines.map((line) => {
    if (!line || typeof line !== "object" || Array.isArray(line)) fail(400, "Line quotation tidak valid.");
    const rfqLineId = integer(line.rfqLineId, "RFQ line");
    if (seen.has(rfqLineId)) fail(400, "RFQ line duplikat.");
    seen.add(rfqLineId);
    const stockStatus = text(line.stockStatus, "available", 30);
    if (!STOCK_STATUSES.has(stockStatus)) fail(400, "Status stok tidak valid.");
    const currency = text(line.currency, "IDR", 8).toUpperCase();
    if (currency !== "IDR") fail(400, "Mata uang quotation harus IDR.");
    return {
      rfqLineId,
      vendorCatalogItemId: line.vendorCatalogItemId == null ? null : integer(line.vendorCatalogItemId, "Produk vendor"),
      offeredUnitPrice: decimal(line.offeredUnitPrice, "Harga", { positive: true }),
      offeredQty: decimal(line.offeredQty, "Qty", { positive: true }),
      leadTimeDays: line.leadTimeDays == null ? null : integer(line.leadTimeDays, "Lead time"),
      stockStatus,
      notes: text(line.notes, null, 1000),
      currency,
      minimumOrderQty: line.minimumOrderQty == null ? null : decimal(line.minimumOrderQty, "MOQ"),
      validUntil: dateOnly(line.validUntil, "Masa berlaku line"),
    };
  });
  const paymentTermCode = normalizePaymentTerm(body.paymentTerms);
  const paymentDpPercent = paymentTermCode === "dp_after_receipt"
    ? normalizeDpPercent(body.paymentDpPercent) ?? dpPercentFromTerm(body.paymentTerms)
    : null;
  if (requirePaymentTerms && !paymentTermCode) fail(400, "Syarat pembayaran wajib dipilih.");
  if (requirePaymentTerms && paymentTermCode === "dp_after_receipt" && !paymentDpPercent) {
    fail(400, "Persentase DP wajib diisi antara 0 dan 100 persen.");
  }
  const quotationDate = dateOnly(body.quotationDate, "Tanggal quotation");
  const paymentTermsValue = paymentTermCode
    ? paymentTermLabel(paymentTermCode, paymentDpPercent)
    : text(body.paymentTerms, null, 200);
  return {
    lines,
    paymentTermCode,
    paymentDpPercent,
    paymentTermsValue,
    quotationDate,
    notes: text(body.notes, null, 2000),
  };
}

function sameNumber(a, b) {
  if (a == null || b == null) return a == null && b == null;
  return Number(a) === Number(b);
}
function persistedDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return [
      String(value.getFullYear()).padStart(4, "0"),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }
  return String(value).slice(0, 10);
}

export async function matchesVendorQuoteSubmission(db, quote, submission) {
  const result = await db(
    `select rfq_line_id, vendor_catalog_item_id, offered_unit_price, offered_qty,
            lead_time_days, stock_status, notes, currency, minimum_order_qty, valid_until
       from public.mkt_vendor_quote_lines where quote_id=$1 order by rfq_line_id`,
    [quote.id],
  );
  const existing = result.rows.map((row) => ({
    rfqLineId: Number(row.rfq_line_id),
    vendorCatalogItemId: row.vendor_catalog_item_id == null ? null : Number(row.vendor_catalog_item_id),
    offeredUnitPrice: Number(row.offered_unit_price),
    offeredQty: Number(row.offered_qty),
    leadTimeDays: row.lead_time_days == null ? null : Number(row.lead_time_days),
    stockStatus: row.stock_status ?? "available",
    notes: row.notes ?? null,
    currency: String(row.currency ?? "IDR").toUpperCase(),
    minimumOrderQty: row.minimum_order_qty == null ? null : Number(row.minimum_order_qty),
    validUntil: persistedDate(row.valid_until),
  }));
  const expected = [...submission.lines].sort((a, b) => a.rfqLineId - b.rfqLineId);
  if (existing.length !== expected.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    const a = existing[i], b = expected[i];
    if (a.rfqLineId !== b.rfqLineId ||
        a.vendorCatalogItemId !== b.vendorCatalogItemId ||
        !sameNumber(a.offeredUnitPrice, b.offeredUnitPrice) ||
        !sameNumber(a.offeredQty, b.offeredQty) ||
        !sameNumber(a.leadTimeDays, b.leadTimeDays) ||
        a.stockStatus !== b.stockStatus ||
        a.notes !== b.notes ||
        a.currency !== b.currency ||
        !sameNumber(a.minimumOrderQty, b.minimumOrderQty) ||
        a.validUntil !== b.validUntil) return false;
  }
  return String(quote.notes ?? "") === String(submission.notes ?? "") &&
    String(quote.payment_terms ?? "") === String(submission.paymentTermsValue ?? "") &&
    String(quote.payment_term_code ?? "") === String(submission.paymentTermCode ?? "") &&
    sameNumber(quote.payment_dp_percent, submission.paymentDpPercent) &&
    persistedDate(quote.quotation_date) === submission.quotationDate;
}

/**
 * The single persistence path used by both the public vendor-token writer and
 * the audited DEV internal-vendor Admin action.
 */
export async function persistVendorQuoteSubmission(db, {
  quote, rfq, submission, submit = true, actor, writeEvent,
}) {
  const rfqLineRows = await db(
    "select id from public.mkt_rfq_lines where rfq_id=$1 order by id for share",
    [rfq.id],
  );
  const allowedLineIds = new Set(rfqLineRows.rows.map((row) => Number(row.id)));
  for (const line of submission.lines) {
    if (!allowedLineIds.has(line.rfqLineId)) fail(403, "RFQ line bukan bagian dari quotation ini.");
    if (line.vendorCatalogItemId != null) {
      const catalogItem = (await db(
        "select id from public.vendor_catalog_items where id=$1 and vendor_id=$2 and is_active=true for share",
        [line.vendorCatalogItemId, quote.vendor_id],
      )).rows[0];
      if (!catalogItem) fail(403, "Produk quotation bukan milik vendor terkait.");
    }
  }
  for (const line of submission.lines) {
    const existing = (await db(
      "select id from public.mkt_vendor_quote_lines where quote_id=$1 and rfq_line_id=$2 limit 1",
      [quote.id, line.rfqLineId],
    )).rows[0];
    const values = [
      line.offeredUnitPrice, line.offeredQty, line.leadTimeDays, line.stockStatus,
      line.notes, line.currency, line.minimumOrderQty, line.validUntil,
    ];
    if (existing) {
      await db(
        `update public.mkt_vendor_quote_lines
            set offered_unit_price=$1, offered_qty=$2, subtotal=$1*$2, lead_time_days=$3,
                stock_status=$4::mkt_stock_status, notes=$5, currency=$6,
                minimum_order_qty=$7, valid_until=$8, updated_at=now()
          where id=$9`,
        [...values, existing.id],
      );
    } else {
      await db(
        `insert into public.mkt_vendor_quote_lines
           (quote_id, rfq_line_id, vendor_catalog_item_id, offered_unit_price, offered_qty,
            subtotal, lead_time_days, stock_status, notes, currency, minimum_order_qty, valid_until)
          values ($1,$2,$3,$4,$5,($4::numeric)*($5::numeric),$6,$7::mkt_stock_status,$8,$9,$10,$11)`,
        [quote.id, line.rfqLineId, line.vendorCatalogItemId, ...values],
      );
    }
  }
  const updatedQuote = await db(
    `update public.mkt_vendor_quotes
        set notes=$1, payment_terms=$2, payment_term_code=$3, payment_dp_percent=$4,
            quotation_date=$5,
            quotation_number=coalesce(quotation_number,'QT-'||rfq_id::text||'-'||vendor_id::text),
            status=case when $6 then 'submitted'::mkt_quote_status else status end,
            submitted_at=case when $6 then now() else submitted_at end,
            updated_at=now()
      where id=$7 and status in ('invited','opened','requote_requested')
      returning id`,
    [
      submission.notes, submission.paymentTermsValue, submission.paymentTermCode,
      submission.paymentDpPercent, submission.quotationDate, submit, quote.id,
    ],
  );
  if (!updatedQuote.rowCount) fail(409, "Quotation berubah atau sudah diproses.");
  if (!submit) return { status: quote.status, alreadySubmitted: false };
  const updatedRfq = await db(
    `update public.mkt_rfqs
        set status=case when status in ('submitted','quoting') then 'quoted'::mkt_rfq_status else status end,
            quote_count=(select count(*) from public.mkt_vendor_quotes where rfq_id=$1 and status='submitted'),
            updated_at=now()
      where id=$1 and status not in ('awarded','cancelled','expired')
      returning id`,
    [rfq.id],
  );
  if (!updatedRfq.rowCount) fail(409, "RFQ sudah tidak menerima quotation.");
  if (typeof writeEvent === "function") {
    await writeEvent({
      rfqId: rfq.id,
      quoteId: quote.id,
      user: actor?.user ?? null,
      actorType: actor?.actorType ?? "admin",
      actorId: actor?.actorId ?? null,
      actorName: actor?.actorName ?? null,
      action: actor?.action ?? "vendor_quote_submitted",
      oldValue: { rfqStatus: rfq.status, quoteStatus: quote.status },
      newValue: { rfqStatus: "quoted", quoteStatus: "submitted" },
      description: actor?.description ?? "Quotation dikirim",
    }, `quote-submitted:${quote.id}:${quote.requote_round ?? 0}`);
  }
  return { status: "submitted", alreadySubmitted: false };
}

export async function submitInternalVendorQuote({
  db, admin, rfqId, quoteId, body, env = process.env, now = new Date(), writeEvent,
}) {
  if (!internalVendorQuoteDevEnabled(env)) fail(404, "Aksi quotation internal DEV tidak tersedia.");
  if (typeof db !== "function") fail(503, "Koneksi database tidak tersedia.");
  if (typeof writeEvent !== "function") fail(503, "Audit quotation internal tidak tersedia.");
  const normalizedRfqId = integer(rfqId, "RFQ");
  const normalizedQuoteId = integer(quoteId, "Quotation");
  const submission = normalizeVendorQuoteSubmission(body, { requirePaymentTerms: true });

  // Lock quote first, matching the existing vendor-token submitter; then lock
  // its parent RFQ. This prevents a new quote writer lock-order inversion.
  const quote = (await db(
    "select id,rfq_id,vendor_id,status,valid_until,requote_round,notes,payment_terms,payment_term_code,payment_dp_percent,quotation_date,submitted_at,updated_at from public.mkt_vendor_quotes where id=$1 and rfq_id=$2 for update",
    [normalizedQuoteId, normalizedRfqId],
  )).rows[0];
  if (!quote) fail(404, "Quotation tidak ditemukan.");
  const rfq = (await db(
    "select * from public.mkt_rfqs where id=$1 for update",
    [normalizedRfqId],
  )).rows[0];
  if (!rfq) fail(404, "RFQ tidak ditemukan.");

  const adminRow = (await db(
    "select id,email,role,account_status,auth_version from public.portal_customers where id=$1 for share",
    [admin?.id],
  )).rows[0];
  if (!adminRow || Number(adminRow.id) !== Number(admin.id) ||
      String(adminRow.email ?? "").trim().toLowerCase() !== String(admin?.email ?? "").trim().toLowerCase() ||
      Number(adminRow.auth_version ?? 0) !== Number(admin?.auth_version ?? 0) ||
      adminRow.role !== "admin" || adminRow.account_status !== "active") {
    fail(403, "Sesi Admin tidak aktif atau tidak berwenang.");
  }
  const supplier = (await db(
    "select id,name,company_id,is_internal_vendor,is_active from public.suppliers where id=$1 for share",
    [quote.vendor_id],
  )).rows[0];
  if (!supplier) fail(404, "Vendor tidak ditemukan.");
  const buyer = (await db(
    "select id,role,customer_type,account_status from public.portal_customers where id=$1 for share",
    [rfq.portal_customer_id],
  )).rows[0];
  const approvedMembership = buyer?.role === "customer" &&
    buyer?.customer_type === "company" && buyer?.account_status === "active"
    ? await db(
      `select m.company_id
         from public.portal_company_members m
         join public.portal_company_requests r
           on r.portal_customer_id=m.portal_customer_id
          and r.matched_company_id=m.company_id
          and r.status='approved' and r.reviewed_by is not null and r.reviewed_at is not null
         join public.companies c on c.id=m.company_id and c.is_active=true
        where m.portal_customer_id=$1 and m.company_id=$2 and m.is_active=true
        limit 1 for share of m,r,c`,
      [rfq.portal_customer_id, rfq.company_id],
    )
    : { rows: [] };

  const isReplay = ["submitted", "selected"].includes(quote.status);
  const authorization = authorizeInternalVendorQuotation({
    admin: { ...admin, role: adminRow.role, account_status: adminRow.account_status },
    rfq,
    quote,
    supplier,
    approvedBuyerCompany: approvedMembership.rows.length === 1,
    intent: body.intent,
    confirmed: body.confirmed,
    reason: body.reason,
    allowSubmittedReplay: isReplay,
    env,
    now,
  });
  if (isReplay) {
    if (!await matchesVendorQuoteSubmission(db, quote, submission)) {
      fail(409, "Quotation sudah dikirim dengan isi berbeda.");
    }
    return {
      rfqId: normalizedRfqId, quoteId: normalizedQuoteId, status: quote.status,
      alreadySubmitted: true, actorType: authorization.actorType,
    };
  }

  const saved = await persistVendorQuoteSubmission(db, {
    quote,
    rfq,
    submission,
    submit: true,
    actor: {
      user: admin,
      actorType: "admin",
      actorId: authorization.actorId,
      actorName: admin.name ?? admin.email ?? authorization.actorName,
      action: authorization.auditAction,
      description: authorization.auditReason,
    },
    writeEvent,
  });
  return {
    rfqId: normalizedRfqId, quoteId: normalizedQuoteId, status: saved.status,
    alreadySubmitted: false, actorType: "admin",
  };
}
