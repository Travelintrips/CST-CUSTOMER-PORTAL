import { randomBytes } from "node:crypto";
import { pool, query } from "./db.mjs";
import {
  bestEffortNotificationWrite,
  notifyAdmins,
  notifyRfqCustomer,
} from "./notification-service.mjs";
import { handleAdminOperations, handlePortalOperations } from "./marketplace-operations.mjs";
import { uploadMarketplacePod, signedMarketplacePodUrl } from "./storage.mjs";

const RFQ_TERMINAL = new Set(["awarded", "cancelled", "expired"]);
const QUOTE_TERMINAL = new Set(["selected", "rejected", "expired", "withdrawn"]);
const PO_TERMINAL = new Set(["completed", "closed", "cancelled", "vendor_rejected"]);
const CUSTOMER_FACING_SELLER_NAME = "PT Cahaya Sejati Teknologi";

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function integer(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) fail(400, `${label} tidak valid.`);
  return parsed;
}

function decimal(value, label, { positive = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive ? parsed <= 0 : parsed < 0)) {
    fail(400, `${label} tidak valid.`);
  }
  return parsed;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const PAYMENT_TERM_LABELS = {
  prepaid: "Bayar penuh sebelum barang diserahkan/dikirim",
  dp_after_receipt: "DP sebelum serah/kirim, pelunasan setelah barang diterima",
  net_7: "NET 7 hari setelah penerimaan",
  net_14: "NET 14 hari setelah penerimaan",
  net_30: "NET 30 hari setelah penerimaan",
};

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

function paymentTermLabel(code, dpPercent = null) {
  if (code === "dp_after_receipt") {
    const percent = normalizeDpPercent(dpPercent);
    return percent
      ? `DP ${percent}% sebelum serah/kirim, pelunasan setelah barang diterima`
      : PAYMENT_TERM_LABELS.dp_after_receipt;
  }
  return PAYMENT_TERM_LABELS[code] ?? null;
}

async function paymentTotalsForPo(db, po) {
  const manual = (await db(
    `select coalesce(sum(ocr_amount),0) as paid_amount
       from public.mkt_po_payment_proofs
      where po_id=$1 and review_status='approved'`,
    [po.id],
  )).rows[0] ?? {};
  const gateway = (await db(
    `select coalesce(sum(amount),0) as paid_amount
       from public.mkt_gateway_payments
      where ref_kind='purchase'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
        and status='paid'::payment_status`,
    [po.id],
  )).rows[0] ?? {};
  const totalAmount = Number(po.grand_total ?? 0);
  const receivedAmount = Number(manual.paid_amount ?? 0) + Number(gateway.paid_amount ?? 0);
  return {
    totalAmount,
    receivedAmount,
    remainingAmount: Math.max(totalAmount - receivedAmount, 0),
  };
}

function requiredBeforeHandover(po, totals) {
  const code = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
  if (code === "prepaid") return totals.totalAmount;
  if (code === "dp_after_receipt") {
    const percent = normalizeDpPercent(po.payment_dp_percent);
    return percent ? Number((totals.totalAmount * percent / 100).toFixed(2)) : totals.totalAmount;
  }
  return 0;
}

function token() {
  return randomBytes(24).toString("hex");
}

function actor(user, actorType = "customer") {
  return {
    actorType,
    actorId: user?.id == null ? null : String(user.id),
    actorName: user?.name ?? user?.email ?? actorType,
  };
}

async function accessibleCompanyIds(user) {
  const result = await query(
    `select company_id
       from public.portal_company_members
      where portal_customer_id = $1 and is_active = true and company_id is not null`,
    [user.id],
  );
  return result.rows.map((row) => Number(row.company_id)).filter(Number.isInteger);
}

function ownerSql(alias = "r") {
  return `(
    ${alias}.portal_customer_id = $1
    or lower(coalesce(${alias}.buyer_email, '')) = lower($2)
    or ${alias}.company_id = any($3::int[])
  )`;
}

async function loadOwnedRfq(rfqId, user, { client = query, forUpdate = false } = {}) {
  const companyIds = await accessibleCompanyIds(user);
  const result = await client(
    `select r.*
       from public.mkt_rfqs r
      where r.id = $4 and ${ownerSql("r")}
      limit 1${forUpdate ? " for update" : ""}`,
    [user.id, user.email, companyIds, rfqId],
  );
  if (!result.rows[0]) fail(404, "RFQ tidak ditemukan.");
  return result.rows[0];
}

async function loadAdminRfq(rfqId, { client = query, forUpdate = false } = {}) {
  const result = await client(
    `select r.* from public.mkt_rfqs r where r.id = $1 limit 1${forUpdate ? " for update" : ""}`,
    [rfqId],
  );
  if (!result.rows[0]) fail(404, "RFQ tidak ditemukan.");
  return result.rows[0];
}

function mapRfq(row) {
  return {
    id: Number(row.id),
    rfq_number: row.rfq_number,
    status: row.status,
    approval_status: row.approval_status ?? "none",
    buyer_name: row.buyer_name,
    buyer_email: row.buyer_email,
    buyer_company: row.buyer_company,
    notes: row.notes,
    required_delivery_date: row.required_delivery_date,
    delivery_address: row.delivery_address,
    destination_place_id: row.destination_place_id,
    destination_lat: row.destination_lat,
    destination_lng: row.destination_lng,
    created_at: row.created_at,
    updated_at: row.updated_at,
    winner_selected_at: row.winner_selected_at,
    proposed_quote_id: row.proposed_quote_id,
    winning_quote_id: row.winning_quote_id,
    company_id: row.company_id,
    portal_customer_id: row.portal_customer_id,
    quote_count: Number(row.quote_count ?? 0),
    line_count: Number(row.line_count ?? 0),
  };
}

async function writeEvent(db, data, key = null) {
  const event = {
    rfqId: data.rfqId ?? null,
    quoteId: data.quoteId ?? null,
    poId: data.poId ?? null,
    ...actor(data.user, data.actorType ?? "admin"),
  };
  const activity = await db(
    `insert into public.activity_logs
       (rfq_id, actor_type, actor_id, actor_name, action, old_value, new_value,
        description, mkt_rfq_id, mkt_vendor_quote_id, mkt_purchase_order_id, deduplication_key)
     values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$1,$9,$10,$11)
     on conflict (deduplication_key) where deduplication_key is not null do nothing
     returning id`,
    [
      event.rfqId,
      event.actorType,
      event.actorId,
      event.actorName,
      data.action,
      JSON.stringify(data.oldValue ?? null),
      JSON.stringify(data.newValue ?? null),
      data.description ?? data.action,
      event.quoteId,
      event.poId,
      key,
    ],
  );
  if (!activity.rowCount) return false;
  if (event.rfqId) {
    await db(
      `insert into public.rfq_activity_logs
         (rfq_id, actor_type, actor_id, actor_name, action, description)
       values ($1,$2,$3,$4,$5,$6)`,
      [event.rfqId, event.actorType, event.actorId, event.actorName, data.action, data.description ?? data.action],
    );
  }
  return true;
}

async function queueEvent(db, {
  eventType, recipientType, recipientId = null, recipientPhone = null,
  rfqId = null, quoteId = null, poId = null, payload = {}, key,
}) {
  // mkt_notification_queue is the durable WhatsApp delivery queue.
  // In-app notifications are written separately via notification-service.
  await bestEffortNotificationWrite(db, () => db(
    `insert into public.mkt_notification_queue
       (event_type, channel, recipient_type, recipient_id, recipient_phone,
        rfq_id, vendor_quote_id, purchase_order_id, payload_json, deduplication_key)
     values ($1,'whatsapp',$2,$3,$4,$5,$6,$7,$8::jsonb,$9)
     on conflict do nothing`,
    [eventType, recipientType, recipientId, recipientPhone, rfqId, quoteId, poId, JSON.stringify(payload), `${key}:whatsapp`],
  ));
}

async function customerNotification(db, rfq, eventKey, type, title, message, payload = {}) {
  return notifyRfqCustomer(db, rfq, {
    eventKey,
    type,
    title,
    message,
    resourceType: payload.poId ? "purchase_order" : "rfq",
    resourceId: payload.poId ?? rfq.id,
    link: payload.poId
      ? `/marketplace/my-purchase-orders/${Number(payload.poId)}`
      : `/marketplace/my-rfqs/${Number(rfq.id)}`,
    payload,
  });
}

async function vendorNotification(db, vendorId, type, title, message, payload = {}) {
  const recipient = (await db(
    `select pc.id
       from public.portal_customers pc
       join public.suppliers s
         on lower(pc.email) = lower(s.contact_email)
      where s.id=$1 and pc.role='vendor'
      limit 1`,
    [vendorId],
  )).rows[0];
  // Marketplace suppliers can exist before a vendor portal account is
  // registered. The notification queue remains the durable delivery path;
  // do not insert a supplier ID into vendor_notifications, whose FK is to
  // portal_customers.
  if (!recipient) return;
  await db(
    `insert into public.vendor_notifications
       (vendor_id, type, title, message, payload)
      select $1,$2,$3,$4,$5::jsonb
       where not exists (
         select 1 from public.vendor_notifications
          where vendor_id=$1 and type=$2 and payload=$5::jsonb
       )`,
    [recipient.id, type, title, message, JSON.stringify(payload)],
  );
}

async function withTransaction(work) {
  const client = await pool.connect();
  const db = (text, values) => client.query(text, values);
  try {
    await client.query("begin");
    const result = await work(db);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function rfqLines(db, rfqId) {
  const result = await db(
    `select id, rfq_id, vendor_catalog_item_id, item_name, item_description,
            item_unit, requested_qty, target_price_per_unit, notes, sort_order
       from public.mkt_rfq_lines where rfq_id = $1 order by sort_order, id`,
    [rfqId],
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    rfqId: Number(row.rfq_id),
    itemName: row.item_name,
    itemDescription: row.item_description,
    itemUnit: row.item_unit,
    requestedQty: row.requested_qty,
    targetPricePerUnit: row.target_price_per_unit,
    notes: row.notes,
    sortOrder: row.sort_order,
  }));
}

async function quoteDetail(db, quoteId) {
  const result = await db(
    `select q.*, s.name as vendor_name, s.phone as vendor_phone, s.contact_email as vendor_email,
            coalesce(s.is_internal_vendor, false) as is_internal_vendor
       from public.mkt_vendor_quotes q
       left join public.suppliers s on s.id = q.vendor_id
      where q.id = $1`,
    [quoteId],
  );
  const quote = result.rows[0];
  if (!quote) return null;
  const lines = await db(
    `select ql.*, rl.item_name, rl.requested_qty, rl.item_unit
       from public.mkt_vendor_quote_lines ql
       join public.mkt_rfq_lines rl on rl.id = ql.rfq_line_id
      where ql.quote_id = $1 order by rl.sort_order, ql.id`,
    [quoteId],
  );
  const mappedLines = lines.rows.map((row) => ({
    rfqLineId: Number(row.rfq_line_id),
    itemName: row.item_name,
    requestedQty: row.requested_qty,
    offeredQty: row.offered_qty,
    vendorUnitPrice: row.offered_unit_price,
    dealUnitPrice: row.negotiated_unit_price ?? row.offered_unit_price,
    dealSubtotal: row.negotiated_subtotal ?? row.subtotal,
    offeredUnitPrice: row.offered_unit_price,
    subtotal: row.subtotal,
    currency: row.currency,
    leadTimeDays: row.lead_time_days,
    stockStatus: row.stock_status,
    notes: row.notes,
    unit: row.item_unit,
  }));
  const total = mappedLines.reduce((sum, row) => sum + Number(row.dealSubtotal ?? 0), 0);
  return {
    id: Number(quote.id),
    rfqId: Number(quote.rfq_id),
    vendorId: Number(quote.vendor_id),
    vendorName: quote.vendor_name,
    vendorPhone: quote.vendor_phone,
    vendorEmail: quote.vendor_email,
    isInternalVendor: Boolean(quote.is_internal_vendor),
    status: quote.status,
    validUntil: quote.valid_until,
    openedAt: quote.opened_at,
    submittedAt: quote.submitted_at,
    quotationNumber: quote.quotation_number,
    quotationDate: quote.quotation_date,
    paymentTerms: quote.payment_terms,
    incoterm: quote.incoterm,
    deliveryLocation: quote.delivery_location,
    notes: quote.notes,
    negotiatedNotes: quote.negotiated_notes,
    requoteNotes: quote.requote_notes,
    requoteDeadline: quote.requote_deadline,
    requoteRound: quote.requote_round,
    updatedAt: quote.updated_at,
    grandTotal: total,
    lines: mappedLines,
  };
}

async function poDetail(db, poId, { customerView = false } = {}) {
  const result = await db(
    `select po.*, r.rfq_number, r.status as rfq_status, r.buyer_name, r.buyer_email,
            r.buyer_company, r.notes as rfq_notes, s.name as vendor_name,
            s.phone as vendor_phone, s.contact_email as vendor_email,
            coalesce(s.is_internal_vendor, false) as is_internal_vendor
       from public.mkt_purchase_orders po
       join public.mkt_rfqs r on r.id = po.rfq_id
       left join public.suppliers s on s.id = po.vendor_id
      where po.id = $1`,
    [poId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const lines = await db(
    `select id, item_name, qty, unit, unit_price, subtotal, notes
       from public.mkt_purchase_order_lines where po_id = $1 order by id`,
    [poId],
  );
  const isInternalVendor = Boolean(row.is_internal_vendor);
  const redactVendor = customerView && !isInternalVendor;
  const paymentTotals = await paymentTotalsForPo(db, row);
  const handoverRequiredAmount = requiredBeforeHandover(row, paymentTotals);
  const handoverRemaining = Math.max(handoverRequiredAmount - paymentTotals.receivedAmount, 0);
  return {
    id: Number(row.id),
    poNumber: row.po_number,
    rfqId: Number(row.rfq_id),
    quoteId: row.quote_id == null ? null : Number(row.quote_id),
    status: row.status,
    grandTotal: row.grand_total,
    taxAmount: row.tax_amount,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
    updatedAt: row.updated_at,
    vendorNameSnapshot: redactVendor ? CUSTOMER_FACING_SELLER_NAME : row.vendor_name_snapshot,
    vendorAddressSnapshot: redactVendor ? null : row.vendor_address_snapshot,
    paymentTermsSnapshot: row.payment_terms_snapshot,
    paymentTermCode: row.payment_term_code ?? normalizePaymentTerm(row.payment_terms_snapshot),
    paymentDpPercent: row.payment_dp_percent == null ? null : Number(row.payment_dp_percent),
    paymentStatus: paymentTotals.remainingAmount <= 0.005
      ? "paid"
      : paymentTotals.receivedAmount > 0
        ? "partially_paid"
        : row.payment_status ?? "unpaid",
    paymentPaidAmount: paymentTotals.receivedAmount,
    paymentRemainingAmount: paymentTotals.remainingAmount,
    paymentRequiredBeforeHandoverAmount: handoverRequiredAmount,
    paymentRequiredBeforeHandoverRemaining: handoverRemaining,
    paymentHandoverSatisfied: handoverRemaining <= 0.005,
    paymentDueAt: row.payment_due_at ?? null,
    paymentProofUploadedAt: row.payment_proof_uploaded_at ?? null,
    paymentVerifiedAt: row.payment_verified_at ?? null,
    paymentRejectionReason: row.payment_rejection_reason ?? null,
    incotermSnapshot: row.incoterm_snapshot,
    quotationNumberSnapshot: redactVendor ? null : row.quotation_number_snapshot,
    quotationDateSnapshot: redactVendor ? null : row.quotation_date_snapshot,
    currencySnapshot: row.currency_snapshot,
    leadTimeDaysSnapshot: row.lead_time_days_snapshot,
    expectedCompletionDate: row.expected_completion_date,
    actualCompletionDate: row.actual_completion_date,
    vendorTokenExpiresAt: redactVendor ? null : row.vendor_token_expires_at,
    revisionNotes: redactVendor ? null : row.revision_notes,
    rfqNumber: row.rfq_number,
    rfqStatus: row.rfq_status,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerCompany: row.buyer_company,
    rfqNotes: row.rfq_notes,
    vendorName: redactVendor ? CUSTOMER_FACING_SELLER_NAME : row.vendor_name,
    vendorPhone: redactVendor ? null : row.vendor_phone,
    vendorEmail: redactVendor ? null : row.vendor_email,
    isInternalVendor,
    lines: lines.rows.map((line, index) => ({
      id: Number(line.id),
      lineNumber: index + 1,
      itemName: line.item_name,
      qty: line.qty,
      unit: line.unit,
      unitPrice: line.unit_price,
      subtotal: line.subtotal,
      notes: redactVendor ? null : line.notes,
    })),
  };
}

async function createPo(db, rfq, quote, user) {
  const existing = await db("select id from public.mkt_purchase_orders where rfq_id = $1 for update", [rfq.id]);
  if (existing.rows[0]) return Number(existing.rows[0].id);
  const details = await quoteDetail(db, quote.id);
  if (!details || !details.lines.length) fail(409, "Quotation belum memiliki line yang valid.");
  const vendor = (await db("select id, name, address from public.suppliers where id = $1", [quote.vendor_id])).rows[0];
  if (!vendor) fail(409, "Vendor quotation tidak ditemukan.");
  const total = details.lines.reduce((sum, line) => sum + Number(line.dealSubtotal ?? 0), 0);
  const paymentTermCode = quote.payment_term_code ?? normalizePaymentTerm(quote.payment_terms);
  if (!paymentTermCode) fail(409, "Quotation belum memiliki syarat pembayaran yang valid.");
  const paymentDpPercent = paymentTermCode === "dp_after_receipt"
    ? (normalizeDpPercent(quote.payment_dp_percent) ?? dpPercentFromTerm(quote.payment_terms))
    : null;
  if (paymentTermCode === "dp_after_receipt" && !paymentDpPercent) {
    fail(409, "Quotation DP belum memiliki persentase DP yang valid.");
  }
  const paymentTermsSnapshot = paymentTermLabel(paymentTermCode, paymentDpPercent);
  const inserted = await db(
    `insert into public.mkt_purchase_orders
       (po_number, rfq_id, quote_id, company_id, vendor_id, status, total_amount,
        tax_amount, grand_total, created_by, vendor_name_snapshot, vendor_address_snapshot,
        payment_terms_snapshot, payment_term_code, payment_dp_percent, payment_status,
        incoterm_snapshot, quotation_number_snapshot,
        quotation_date_snapshot, currency_snapshot, lead_time_days_snapshot,
        vendor_token, vendor_token_expires_at, expected_completion_date)
     values (
       'PENDING-' || $1::text, $2, $3, $4, $5, 'issued'::mkt_po_status, $6, 0, $6,
       $7, $8, $9, $10, $11, $12, 'unpaid', $13, $14, $15, 'IDR', $16, $17, now() + interval '14 days',
        case when $16::int is null then null else current_date + $16::int end
     )
     returning id`,
    [
      rfq.id,
      rfq.id,
      quote.id,
      rfq.company_id,
      quote.vendor_id,
      total,
      user?.email ?? "customer-approval",
      vendor.name,
      vendor.address,
      paymentTermsSnapshot,
      paymentTermCode,
      paymentDpPercent,
      quote.incoterm,
      quote.quotation_number,
      quote.quotation_date,
      details.lines.reduce((max, line) => Math.max(max, Number(line.leadTimeDays ?? 0)), 0) || null,
      token(),
    ],
  );
  const poId = Number(inserted.rows[0].id);
  await db("update public.mkt_purchase_orders set po_number = 'PO-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(id::text, 5, '0') where id = $1", [poId]);
  for (const line of details.lines) {
    await db(
      `insert into public.mkt_purchase_order_lines (po_id, item_name, qty, unit, unit_price, subtotal, notes)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [poId, line.itemName, line.offeredQty, null, line.dealUnitPrice, line.dealSubtotal, line.notes],
    );
  }
  return poId;
}

async function transitionRfq(db, rfq, status, user, description, data = {}) {
  if (RFQ_TERMINAL.has(String(rfq.status)) && rfq.status !== status) fail(409, "RFQ sudah berada pada status terminal.");
  const updated = await db(
    `update public.mkt_rfqs set status = $1::mkt_rfq_status, updated_at = now() where id = $2 and status = $3::mkt_rfq_status returning *`,
    [status, rfq.id, rfq.status],
  );
  if (!updated.rowCount) fail(409, "RFQ berubah oleh proses lain. Muat ulang lalu coba lagi.");
  await writeEvent(db, { rfqId: rfq.id, user, action: `rfq_${status}`, oldValue: { status: rfq.status }, newValue: { status }, description, ...data }, data.idempotencyKey ?? null);
  return updated.rows[0];
}

async function portalRfqs(request, response, url, user, rfqId = null) {
  const companyIds = await accessibleCompanyIds(user);
  if (rfqId) {
    const result = await query(
      `select r.* from public.mkt_rfqs r where r.id=$4 and ${ownerSql("r")} limit 1`,
      [user.id, user.email, companyIds, rfqId],
    );
    if (!result.rows[0]) fail(404, "RFQ tidak ditemukan.");
    const row = result.rows[0];
    const [lines, approvals] = await Promise.all([
      rfqLines(query, row.id),
      query(`select id, approver_level, status, requested_at, responded_at, response_notes from public.mkt_rfq_approvals where rfq_id=$1 order by requested_at desc`, [row.id]),
    ]);
    response._sendJson(200, { ok: true, data: { ...mapRfq(row), lines, pendingApproval: approvals.rows.find((item) => item.status === "pending") ?? null, approvals: approvals.rows } });
    return;
  }
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 200);
  const result = await query(
    `select r.*, a.id as pending_approval_id, a.approver_level, a.status as pending_approval_status,
            a.requested_at, a.response_notes,
            po.id as purchase_order_id, po.grand_total as purchase_order_grand_total
       from public.mkt_rfqs r
       left join lateral (
         select id, approver_level, status, requested_at, response_notes
           from public.mkt_rfq_approvals where rfq_id=r.id order by requested_at desc limit 1
       ) a on true
       left join lateral (
         select id, grand_total
           from public.mkt_purchase_orders
          where rfq_id=r.id
          order by id desc
          limit 1
       ) po on true
      where ${ownerSql("r")} order by r.created_at desc limit $4`,
    [user.id, user.email, companyIds, limit],
  );
  response._sendJson(200, {
    ok: true,
    data: result.rows.map((row) => ({
      rfqId: Number(row.id),
      rfqNumber: row.rfq_number,
      rfqStatus: row.status,
      approvalStatus: row.approval_status ?? "none",
      approvalRequestedAt: row.approval_requested_at,
      approvalResolvedAt: row.approval_resolved_at,
      buyerName: row.buyer_name,
      buyerEmail: row.buyer_email,
      buyerCompany: row.buyer_company,
      buyerApprovalLevel: row.buyer_approval_level,
      notes: row.notes,
      requiredDeliveryDate: row.required_delivery_date,
      createdAt: row.created_at,
      poId: row.purchase_order_id == null ? null : Number(row.purchase_order_id),
      grandTotal: row.purchase_order_grand_total == null ? 0 : Number(row.purchase_order_grand_total),
      pendingApproval: row.pending_approval_id ? {
        id: Number(row.pending_approval_id), approverLevel: row.approver_level,
        status: row.pending_approval_status, requestedAt: row.requested_at, responseNotes: row.response_notes,
      } : null,
    })),
    count: result.rowCount,
  });
}

async function portalQuotation(request, response, user, rfqId) {
  if (request.method !== "GET") return false;
  const rfq = await loadOwnedRfq(rfqId, user);
  const quoteId = rfq.winning_quote_id ?? rfq.proposed_quote_id;
  if (!quoteId) fail(404, "Quotation RFQ belum tersedia.");
  const details = await quoteDetail(query, quoteId);
  if (!details || details.rfqId !== Number(rfq.id)) fail(404, "Quotation RFQ tidak ditemukan.");
  if (details.isInternalVendor) {
    response._sendJson(200, { ok: true, data: details });
    return;
  }
  response._sendJson(200, {
    ok: true,
    data: {
      id: details.id,
      rfqId: details.rfqId,
      vendorId: null,
      vendorName: CUSTOMER_FACING_SELLER_NAME,
      vendorPhone: null,
      vendorEmail: null,
      isInternalVendor: false,
      status: details.status,
      validUntil: details.validUntil,
      openedAt: details.openedAt,
      submittedAt: details.submittedAt,
      quotationNumber: null,
      quotationDate: null,
      paymentTerms: details.paymentTerms,
      incoterm: details.incoterm,
      deliveryLocation: details.deliveryLocation,
      notes: null,
      updatedAt: details.updatedAt,
      grandTotal: details.grandTotal,
      lines: details.lines.map((line) => ({
        rfqLineId: line.rfqLineId,
        itemName: line.itemName,
        requestedQty: line.requestedQty,
        offeredQty: line.offeredQty,
        dealUnitPrice: line.dealUnitPrice,
        dealSubtotal: line.dealSubtotal,
        currency: line.currency,
        leadTimeDays: line.leadTimeDays,
        stockStatus: line.stockStatus,
        unit: line.unit,
        notes: null,
      })),
    },
  });
  return true;
}

async function submitRfq(user, rfqId, action) {
  return withTransaction(async (db) => {
    const rfq = await loadOwnedRfq(rfqId, user, { client: db, forUpdate: true });
    const lines = await rfqLines(db, rfq.id);
    if (!lines.length) fail(409, "RFQ harus memiliki minimal satu item.");
    if (action === "cancel") {
      if (!["draft", "submitted"].includes(rfq.status)) fail(409, "RFQ tidak dapat dibatalkan pada status ini.");
      await db("update public.mkt_rfqs set status='cancelled', approval_status='none', updated_at=now() where id=$1", [rfq.id]);
      await writeEvent(db, { rfqId: rfq.id, user, actorType: "customer", action: "rfq_cancelled", oldValue: { status: rfq.status }, newValue: { status: "cancelled" }, description: "RFQ dibatalkan customer" });
      return { status: "cancelled" };
    }
    if (rfq.status !== "draft") fail(409, "RFQ hanya dapat dikirim dari status draft.");
    await transitionRfq(db, rfq, "submitted", user, "RFQ dikirim customer", { actorType: "customer" });
    await notifyAdmins(db, {
      eventKey: `rfq-${rfq.id}-submitted`,
      type: "rfq_submitted",
      title: "RFQ baru masuk",
      message: `RFQ ${rfq.rfq_number ?? rfq.id} dikirim customer dan perlu diproses.`,
      resourceType: "rfq",
      resourceId: rfq.id,
      link: `/admin?tab=service-operations`,
      payload: { rfqId: Number(rfq.id), rfqNumber: rfq.rfq_number },
    });
    return { status: "submitted" };
  });
}

async function customerDecision(user, rfqId, approved, reason = null, idempotencyKey = null) {
  return withTransaction(async (db) => {
    const rfq = await loadOwnedRfq(rfqId, user, { client: db, forUpdate: true });
    if (approved && rfq.status === "awarded" && rfq.winning_quote_id) {
      const existingPo = (await db(
        `select id, po_number, vendor_id
           from public.mkt_purchase_orders
          where rfq_id=$1
          order by id desc limit 1`,
        [rfq.id],
      )).rows[0];
      if (existingPo) {
        return {
          status: "awarded",
          poId: Number(existingPo.id),
          poNumber: existingPo.po_number,
          vendorName: existingPo.vendor_id,
          alreadyProcessed: true,
        };
      }
    }
    if (!approved && rfq.status === "quoted" && rfq.approval_status === "rejected" && !rfq.proposed_quote_id) {
      return { status: "quoted", rejected: true, alreadyProcessed: true };
    }
    if (rfq.status !== "customer_review" || !rfq.proposed_quote_id) fail(409, "RFQ belum menunggu keputusan customer.");
    const quote = (await db("select * from public.mkt_vendor_quotes where id=$1 and rfq_id=$2 for update", [rfq.proposed_quote_id, rfq.id])).rows[0];
    if (!quote) fail(409, "Quotation yang diajukan tidak ditemukan.");
    if (!approved) {
      await db("update public.mkt_rfqs set status='quoted', approval_status='rejected', approval_resolved_at=now(), proposed_quote_id=null, updated_at=now() where id=$1", [rfq.id]);
      await db("update public.mkt_vendor_quotes set status='requote_requested', requote_notes=$1, requote_round=requote_round+1, updated_at=now() where id=$1", [reason]);
      await writeEvent(
        db,
        {
          rfqId: rfq.id,
          quoteId: quote.id,
          user,
          actorType: "customer",
          action: "customer_rejected_quote",
          oldValue: { status: rfq.status },
          newValue: { status: "quoted", approvalStatus: "rejected" },
          description: reason || "Quotation ditolak customer",
        },
        `rfq:${rfq.id}:customer-reject:${quote.id}:${idempotencyKey ?? quote.requote_round}`,
      );
      await customerNotification(db, rfq, `rfq-${rfq.id}-customer-rejected-${quote.id}`, "rfq_quote_rejected", "Quotation ditolak", reason || "Quotation ditolak dan dikembalikan untuk evaluasi.");
      await notifyAdmins(db, {
        eventKey: `rfq-${rfq.id}-customer-rejected-${quote.id}`,
        type: "rfq_quote_rejected",
        title: "Quotation ditolak customer",
        message: `Quotation untuk RFQ ${rfq.rfq_number ?? rfq.id} ditolak customer.`,
        resourceType: "rfq",
        resourceId: rfq.id,
        link: `/admin?tab=service-operations`,
        payload: { rfqId: Number(rfq.id), quoteId: Number(quote.id), reason: reason ?? null },
      });
      await vendorNotification(db, quote.vendor_id, "quote_rejected", "Quotation perlu dievaluasi", "Quotation Anda belum disetujui customer.", { rfqId: rfq.id, quoteId: quote.id });
      return { status: "quoted", rejected: true };
    }
    const poId = await createPo(db, rfq, quote, user);
    await db("update public.mkt_vendor_quotes set status='selected', updated_at=now() where id=$1 and status in ('submitted','selected')", [quote.id]);
    await db("update public.mkt_vendor_quotes set status='rejected', updated_at=now() where rfq_id=$1 and id<>$2 and status not in ('rejected','expired','withdrawn')", [rfq.id, quote.id]);
    await db("update public.mkt_rfqs set status='awarded', approval_status='approved', approval_resolved_at=now(), winning_quote_id=$1, winner_selected_at=now(), winner_selected_by=$2, updated_at=now() where id=$3 and status='customer_review'", [quote.id, String(user.id), rfq.id]);
    await writeEvent(db, { rfqId: rfq.id, quoteId: quote.id, poId, user, actorType: "customer", action: "customer_approved_quote", oldValue: { status: rfq.status }, newValue: { status: "awarded", poId }, description: "Quotation disetujui customer dan PO dibuat" }, `rfq:${rfq.id}:customer-approve`);
    await customerNotification(db, rfq, `rfq-${rfq.id}-po-created`, "purchase_order_created", "Purchase Order dibuat", "Quotation disetujui dan Purchase Order telah dibuat.", { quoteId: quote.id, poId });
    await notifyAdmins(db, {
      eventKey: `rfq-${rfq.id}-po-created`,
      type: "purchase_order_created",
      title: "Purchase Order dibuat",
      message: `PO untuk RFQ ${rfq.rfq_number ?? rfq.id} berhasil dibuat.`,
      resourceType: "purchase_order",
      resourceId: poId,
      link: `/admin?tab=service-operations`,
      payload: { rfqId: Number(rfq.id), quoteId: Number(quote.id), poId: Number(poId) },
    });
    const poRow = (await db("select po_number from public.mkt_purchase_orders where id=$1", [poId])).rows[0];
    const vendorContact = (await db("select phone from public.suppliers where id=$1", [quote.vendor_id])).rows[0] ?? {};
    await vendorNotification(
      db,
      quote.vendor_id,
      "purchase_order_created",
      "Purchase Order baru",
      `PO ${poRow.po_number} untuk RFQ ${rfq.rfq_number ?? rfq.id} telah dibuat setelah customer menyetujui quotation.`,
      { rfqId: Number(rfq.id), quoteId: Number(quote.id), poId: Number(poId) },
    );
    await queueEvent(db, {
      eventType: "po_created",
      recipientType: "vendor",
      recipientId: quote.vendor_id,
      recipientPhone: vendorContact.phone ?? null,
      rfqId: rfq.id,
      quoteId: quote.id,
      poId,
      payload: { rfqId: rfq.id, quoteId: quote.id, poId, poNumber: poRow.po_number },
      key: `po-created:${poId}`,
    });
    return { status: "awarded", poId, poNumber: poRow.po_number, vendorName: quote.vendor_id };
  });
}

async function handlePortalAction(request, response, user, pathname, body) {
  const submit = pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)\/(submit|cancel)$/);
  if (request.method === "POST" && submit) {
    const data = await submitRfq(user, integer(submit[1], "RFQ"), submit[2]);
    response._sendJson(200, { ok: true, data });
    return true;
  }
  const decision = pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)\/customer-(approve|reject)$/);
  if (request.method === "POST" && decision) {
    const data = await customerDecision(
      user,
      integer(decision[1], "RFQ"),
      decision[2] === "approve",
      text(body.reason),
      text(request.headers["idempotency-key"]),
    );
    response._sendJson(200, { ok: true, data: { ...data, poId: data.poId, poNumber: data.poNumber, vendorName: data.vendorName } });
    return true;
  }
  if (request.method === "GET" && pathname === "/api/mkt/portal/rfqs/pending-approvals") {
    const companyIds = await accessibleCompanyIds(user);
    const result = await query(
      `select r.id, r.rfq_number, r.buyer_name, r.buyer_company, r.status, r.approval_status,
              r.proposed_quote_id, r.created_at, a.id as approval_id, a.approver_level
         from public.mkt_rfqs r join public.mkt_rfq_approvals a on a.rfq_id=r.id and a.status='pending'
        where ${ownerSql("r")} order by a.requested_at desc`,
      [user.id, user.email, companyIds],
    );
    response._sendJson(200, { ok: true, data: result.rows });
    return true;
  }
  const approval = pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)\/(approve|reject)$/);
  if (request.method === "POST" && approval) {
    const rfqId = integer(approval[1], "RFQ");
    const companyIds = await accessibleCompanyIds(user);
    const member = (await query(
      `select m.* from public.portal_company_members m where m.portal_customer_id=$1 and m.is_active=true and m.company_id=any($2::int[]) limit 1`,
      [user.id, companyIds],
    )).rows[0];
    if (!member) fail(403, "Anda tidak memiliki hak approval perusahaan.");
    await withTransaction(async (db) => {
      const rfq = await loadOwnedRfq(rfqId, user, { client: db, forUpdate: true });
      const approvalRow = (await db("select * from public.mkt_rfq_approvals where rfq_id=$1 and status='pending' order by requested_at desc limit 1 for update", [rfq.id])).rows[0];
      if (!approvalRow) fail(409, "Tidak ada approval pending.");
      const status = approval[2] === "approve" ? "approved" : "rejected";
      await db("update public.mkt_rfq_approvals set status=$1, responded_at=now(), response_notes=$2, responder_member_id=$3 where id=$4", [status, text(body.notes), member.id, approvalRow.id]);
      await db("update public.mkt_rfqs set approval_status=$1, approval_resolved_at=now(), updated_at=now() where id=$2", [status, rfq.id]);
      await writeEvent(db, { rfqId: rfq.id, user, actorType: "customer_approver", action: `rfq_approval_${status}`, oldValue: { approvalStatus: "pending" }, newValue: { approvalStatus: status }, description: text(body.notes) || `Approval ${status}` });
    });
    response._sendJson(200, { ok: true, status: approval[2] === "approve" ? "approved" : "rejected" });
    return true;
  }
  return false;
}

async function handleVendorQuote(request, response, pathname, body) {
  const match = pathname.match(/^\/api\/vendor-quote\/([^/]+)(?:\/(save|submit))?$/);
  if (!match || match[1].length > 200) return false;
  const tokenValue = match[1];
  const loadQuote = async (db, forUpdate = false) => (await db(
    `select q.*, r.rfq_number, r.status as rfq_status, r.buyer_name, r.buyer_company,
            r.notes as rfq_notes, r.delivery_address, r.required_delivery_date,
            r.destination_place_id, r.destination_lat, r.destination_lng,
            s.id as supplier_id, s.name as supplier_name, s.phone as supplier_phone, s.contact_email as supplier_email
       from public.mkt_vendor_quotes q join public.mkt_rfqs r on r.id=q.rfq_id
       left join public.suppliers s on s.id=q.vendor_id
      where q.token=$1 or q.token_hash=encode(sha256(convert_to($1,'UTF8')),'hex')
      limit 1${forUpdate ? " for update of q" : ""}`,
    [tokenValue],
  )).rows[0];
  const quote = await loadQuote(query);
  if (!quote) fail(404, "Link quotation tidak ditemukan.");
  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();
  if (isExpired && !["submitted", "selected"].includes(quote.status)) fail(410, "Link quotation sudah kedaluwarsa.");
  if (request.method === "GET") {
    if (quote.status === "invited") await query("update public.mkt_vendor_quotes set status='opened', opened_at=coalesce(opened_at,now()), updated_at=now() where id=$1 and status='invited'", [quote.id]);
    const lines = await rfqLines(query, quote.rfq_id);
    const details = await quoteDetail(query, quote.id);
    response._sendJson(200, { ok: true, data: {
      quote: { ...details, id: Number(quote.id), rfqId: Number(quote.rfq_id), vendorId: Number(quote.vendor_id), status: quote.status === "invited" ? "opened" : quote.status, validUntil: quote.valid_until, openedAt: quote.opened_at, submittedAt: quote.submitted_at, quotationNumber: quote.quotation_number, quotationDate: quote.quotation_date, paymentTerms: quote.payment_terms, paymentTermCode: quote.payment_term_code ?? normalizePaymentTerm(quote.payment_terms), paymentDpPercent: quote.payment_dp_percent == null ? null : Number(quote.payment_dp_percent), incoterm: quote.incoterm, deliveryLocation: quote.delivery_location, notes: quote.notes, requoteNotes: quote.requote_notes, requoteDeadline: quote.requote_deadline, requoteRound: quote.requote_round },
      vendor: { id: Number(quote.supplier_id), name: quote.supplier_name, phone: quote.supplier_phone, email: quote.supplier_email },
      rfq: { id: Number(quote.rfq_id), rfqNumber: quote.rfq_number, status: quote.rfq_status, buyerName: quote.buyer_name, buyerCompany: quote.buyer_company, notes: quote.rfq_notes, deliveryAddress: quote.delivery_address, destinationPlaceId: quote.destination_place_id, destinationLat: quote.destination_lat, destinationLng: quote.destination_lng, requiredDeliveryDate: quote.required_delivery_date, createdAt: quote.created_at },
      rfqLines: lines, quoteLines: details?.lines ?? [], meta: { canEdit: ["invited", "opened", "requote_requested"].includes(quote.status), canSubmit: ["invited", "opened", "requote_requested"].includes(quote.status), allowedCurrencies: ["IDR"] },
    }});
    return true;
  }
  if (request.method !== "POST" || !match[2]) return false;
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length) fail(400, "Line quotation wajib diisi.");
  const requestedPaymentTerm = normalizePaymentTerm(body.paymentTerms);
  const requestedDpPercent = requestedPaymentTerm === "dp_after_receipt"
    ? (normalizeDpPercent(body.paymentDpPercent) ?? dpPercentFromTerm(body.paymentTerms))
    : null;
  if (match[2] === "submit" && !requestedPaymentTerm) {
    fail(400, "Syarat pembayaran wajib dipilih sebelum quotation dikirim.");
  }
  if (match[2] === "submit" && requestedPaymentTerm === "dp_after_receipt" && !requestedDpPercent) {
    fail(400, "Persentase DP wajib diisi antara 0 dan 100 persen.");
  }
  let resultingStatus = quote.status;
  await withTransaction(async (db) => {
    const lockedQuote = await loadQuote(db, true);
    if (!lockedQuote) fail(404, "Link quotation tidak ditemukan.");
    const lockedExpired = lockedQuote.valid_until && new Date(lockedQuote.valid_until) < new Date();
    if (lockedExpired && !["submitted", "selected"].includes(lockedQuote.status)) fail(410, "Link quotation sudah kedaluwarsa.");
    const rfqLineIds = new Set((await db(
      `select id from public.mkt_rfq_lines where rfq_id=$1`,
      [lockedQuote.rfq_id],
    )).rows.map((row) => Number(row.id)));
    for (const line of lines) {
      const rfqLineId = integer(line.rfqLineId, "RFQ line");
      if (!rfqLineIds.has(rfqLineId)) fail(403, "RFQ line bukan bagian dari quotation ini.");
    }
    if (["submitted", "selected"].includes(lockedQuote.status)) {
      resultingStatus = lockedQuote.status;
      return;
    }
    if (!["invited", "opened", "requote_requested"].includes(lockedQuote.status)) {
      fail(409, "Quotation tidak dapat diedit pada status ini.");
    }
    for (const line of lines) {
      const rfqLineId = integer(line.rfqLineId, "RFQ line");
      const price = decimal(line.offeredUnitPrice, "Harga", { positive: true });
      const qty = decimal(line.offeredQty, "Qty", { positive: true });
      const validUntil = text(line.validUntil);
      const existingLine = (await db(
        "select id from public.mkt_vendor_quote_lines where quote_id=$1 and rfq_line_id=$2 limit 1",
         [lockedQuote.id, rfqLineId],
      )).rows[0];
      const lineValues = [
        price,
        qty,
        line.leadTimeDays == null ? null : integer(line.leadTimeDays, "Lead time"),
        text(line.stockStatus, "available"),
        text(line.notes),
        text(line.currency, "IDR"),
        line.minimumOrderQty == null ? null : decimal(line.minimumOrderQty, "MOQ"),
        validUntil,
      ];
      if (existingLine) {
        await db(
          `update public.mkt_vendor_quote_lines
              set offered_unit_price=$1, offered_qty=$2, subtotal=$1*$2, lead_time_days=$3,
                  stock_status=$4::mkt_stock_status, notes=$5, currency=$6,
                  minimum_order_qty=$7, valid_until=$8, updated_at=now()
            where id=$9`,
           [...lineValues, existingLine.id],
        );
      } else {
        await db(
          `insert into public.mkt_vendor_quote_lines
             (quote_id, rfq_line_id, vendor_catalog_item_id, offered_unit_price, offered_qty,
              subtotal, lead_time_days, stock_status, notes, currency, minimum_order_qty, valid_until)
            values ($1,$2,$3,$4,$5,($4::numeric)*($5::numeric),$6,$7::mkt_stock_status,$8,$9,$10,$11)`,
           [lockedQuote.id, rfqLineId, line.vendorCatalogItemId ?? null, ...lineValues],
        );
      }
    }
    await db(
      `update public.mkt_vendor_quotes
          set notes=$1,
              payment_terms=$2,
              payment_term_code=$3,
              payment_dp_percent=$4,
              quotation_date=$5,
              quotation_number=coalesce(quotation_number,'QT-'||rfq_id::text||'-'||vendor_id::text),
              status=case when $6 then 'submitted'::mkt_quote_status else status end,
              submitted_at=case when $6 then now() else submitted_at end,
              updated_at=now()
        where id=$7`,
       [
         text(body.notes),
         requestedPaymentTerm ? paymentTermLabel(requestedPaymentTerm, requestedDpPercent) : text(body.paymentTerms),
         requestedPaymentTerm,
         requestedDpPercent,
         text(body.quotationDate),
         match[2] === "submit",
         lockedQuote.id,
       ],
    );
    resultingStatus = match[2] === "submit" ? "submitted" : lockedQuote.status;
    if (match[2] === "submit") {
      const updatedRfq = await db(
        `update public.mkt_rfqs
            set status=case when status in ('submitted','quoting') then 'quoted'::mkt_rfq_status else status end,
                quote_count=(select count(*) from public.mkt_vendor_quotes where rfq_id=$1 and status='submitted'),
                updated_at=now()
          where id=$1 and status not in ('awarded','cancelled','expired')
          returning id`,
        [lockedQuote.rfq_id],
      );
      if (!updatedRfq.rowCount) fail(409, "RFQ sudah tidak menerima quotation.");
      await writeEvent(db, { rfqId: lockedQuote.rfq_id, quoteId: lockedQuote.id, actorType: "vendor", actorId: String(lockedQuote.vendor_id), actorName: lockedQuote.supplier_name, action: "vendor_quote_submitted", description: "Vendor mengirim quotation" }, `quote-submitted:${lockedQuote.id}:${lockedQuote.requote_round ?? 0}`);
      await queueEvent(db, { eventType: "vendor_quote_submitted", recipientType: "admin", rfqId: lockedQuote.rfq_id, quoteId: lockedQuote.id, payload: { rfqId: lockedQuote.rfq_id, quoteId: lockedQuote.id }, key: `quote-submitted:${lockedQuote.id}:${lockedQuote.requote_round ?? 0}` });
      await notifyAdmins(db, {
        eventKey: `quote-submitted:${lockedQuote.id}:${lockedQuote.requote_round ?? 0}`,
        type: "vendor_quote_submitted",
        title: "Quotation vendor masuk",
        message: `Vendor mengirim quotation untuk RFQ ${lockedQuote.rfq_number ?? lockedQuote.rfq_id}.`,
        resourceType: "rfq",
        resourceId: lockedQuote.rfq_id,
        link: `/admin?tab=service-operations`,
        payload: { rfqId: Number(lockedQuote.rfq_id), quoteId: Number(lockedQuote.id) },
      });
    }
  });
  response._sendJson(200, { ok: true, data: { quoteId: Number(quote.id), status: resultingStatus } });
  return true;
}

async function inviteVendorsToExistingRfq(db, rfqId, vendorIds) {
  for (const vendorId of vendorIds) {
    const vendor = (await db("select id, name, phone, is_active from public.suppliers where id=$1", [vendorId])).rows[0];
    if (!vendor || vendor.is_active === false) continue;
    const quote = await db(
      `insert into public.mkt_vendor_quotes (rfq_id,vendor_id,token,token_hash,valid_until,status)
       values ($1,$2,$3,encode(sha256(convert_to($3,'UTF8')),'hex'),now()+interval '7 days','invited')
       on conflict (rfq_id,vendor_id) do update set updated_at=now() returning id`,
      [rfqId, vendorId, token()],
    );
    await queueEvent(db, { eventType: "rfq_vendor_invited", recipientType: "vendor", recipientId: vendorId, recipientPhone: vendor.phone, rfqId, quoteId: quote.rows[0].id, payload: { rfqId, quoteId: quote.rows[0].id, vendorId }, key: `rfq:${rfqId}:vendor:${vendorId}:invited` });
    await vendorNotification(db, vendorId, "rfq_invitation", "Undangan quotation baru", `Anda diundang untuk memberi quotation RFQ #${rfqId}.`, { rfqId, quoteId: quote.rows[0].id });
  }
}

async function handleAdminMarketplace(request, response, pathname, body, user) {
  const rfqList = pathname === "/api/mkt/admin/rfqs";
  if (request.method === "GET" && rfqList) {
    const rows = await query(`
      select id, rfq_number, status, approval_status,
             buyer_name, buyer_company, buyer_email, buyer_phone,
             delivery_address, required_delivery_date, notes,
             proposed_quote_id, winning_quote_id,
             quote_count, line_count, created_at
        from public.mkt_rfqs
       order by created_at desc
       limit 500
    `);
    response._sendJson(200, { ok: true, data: rows.rows.map((r) => ({
      rfqId: Number(r.id),
      rfqNumber: r.rfq_number,
      rfqStatus: r.status,
      approvalStatus: r.approval_status,
      buyerName: r.buyer_name,
      buyerCompany: r.buyer_company,
      buyerEmail: r.buyer_email,
      buyerPhone: r.buyer_phone,
      deliveryAddress: r.delivery_address,
      requiredDeliveryDate: r.required_delivery_date,
      notes: r.notes,
      proposedQuoteId: r.proposed_quote_id == null ? null : Number(r.proposed_quote_id),
      winningQuoteId: r.winning_quote_id == null ? null : Number(r.winning_quote_id),
      quoteCount: r.quote_count,
      lineCount: r.line_count,
      createdAt: r.created_at,
    })) });
    return true;
  }
  if (request.method === "GET" && pathname === "/api/mkt/admin/purchase-orders") {
    const limit = Math.min(Math.max(Number(new URL(request.url ?? "/", "http://portal.local").searchParams.get("limit") ?? 200), 1), 500);
    const result = await query(
      `select po.id, po.po_number, po.rfq_id, po.quote_id, po.vendor_id, po.status,
              po.total_amount, po.tax_amount, po.grand_total, po.currency_snapshot, po.confirmed_at,
              po.payment_terms_snapshot, po.payment_term_code, po.payment_dp_percent, po.payment_status, po.payment_due_at,
              po.payment_proof_uploaded_at, po.payment_verified_at, po.created_at,
              r.rfq_number, s.name as vendor_name
         from public.mkt_purchase_orders po
         join public.mkt_rfqs r on r.id=po.rfq_id
         left join public.suppliers s on s.id=po.vendor_id
        order by po.created_at desc limit $1`,
      [limit],
    );
    response._sendJson(200, { ok: true, data: result.rows.map((row) => ({
      id: Number(row.id),
      poNumber: row.po_number,
      rfqId: Number(row.rfq_id),
      quoteId: row.quote_id == null ? null : Number(row.quote_id),
      vendorId: row.vendor_id == null ? null : Number(row.vendor_id),
      status: row.status,
      confirmedAt: row.confirmed_at,
      paymentTerms: row.payment_terms_snapshot,
      paymentTermCode: row.payment_term_code ?? normalizePaymentTerm(row.payment_terms_snapshot),
      paymentDpPercent: row.payment_dp_percent == null ? null : Number(row.payment_dp_percent),
      paymentStatus: row.payment_status ?? "unpaid",
      paymentDueAt: row.payment_due_at,
      paymentProofUploadedAt: row.payment_proof_uploaded_at,
      paymentVerifiedAt: row.payment_verified_at,
      totalAmount: row.total_amount,
      taxAmount: row.tax_amount,
      grandTotal: row.grand_total,
      currency: row.currency_snapshot || "IDR",
      vendorName: row.vendor_name,
      vendorNameSnapshot: row.vendor_name,
      rfqNumber: row.rfq_number,
      createdAt: row.created_at,
    })) });
    return true;
  }
  const quotes = pathname.match(/^\/api\/mkt\/admin\/rfqs\/(\d+)\/vendor-quotes$/);
  if (request.method === "GET" && quotes) {
    const result = await query(`select q.id, q.vendor_id, q.status, q.updated_at, s.name as vendor_name, coalesce(sum(ql.negotiated_subtotal),sum(ql.subtotal),0) as deal_total from public.mkt_vendor_quotes q left join public.suppliers s on s.id=q.vendor_id left join public.mkt_vendor_quote_lines ql on ql.quote_id=q.id where q.rfq_id=$1 group by q.id,s.name order by q.created_at desc`, [integer(quotes[1], "RFQ")]);
    response._sendJson(200, { ok: true, data: result.rows.map((r) => ({ id: Number(r.id), quoteId: Number(r.id), vendorId: Number(r.vendor_id), vendorName: r.vendor_name, status: r.status, updatedAt: r.updated_at, dealTotal: Number(r.deal_total) })) });
    return true;
  }
  const deal = pathname.match(/^\/api\/mkt\/admin\/rfqs\/(\d+)\/quotes\/(\d+)\/deal-price$/);
  if (deal) {
    const rfqId = integer(deal[1], "RFQ");
    const quoteId = integer(deal[2], "Quotation");
    if (request.method === "GET") {
      const details = await quoteDetail(query, quoteId);
      if (!details || details.rfqId !== rfqId) fail(404, "Quotation tidak ditemukan.");
      response._sendJson(200, { ok: true, data: { ...details, quoteId, lines: details.lines.map((line) => ({ ...line, unit: null })) } });
      return true;
    }
    if (request.method === "PUT") {
      await withTransaction(async (db) => {
        const q = (await db("select * from public.mkt_vendor_quotes where id=$1 and rfq_id=$2 for update", [quoteId, rfqId])).rows[0];
        if (!q) fail(404, "Quotation tidak ditemukan.");
         if (body.expectedUpdatedAt && q.updated_at && new Date(body.expectedUpdatedAt).getTime() !== new Date(q.updated_at).getTime()) {
           fail(409, "Quotation berubah oleh proses lain. Muat ulang lalu coba lagi.");
         }
        for (const line of Array.isArray(body.lines) ? body.lines : []) {
          const price = decimal(line.dealUnitPrice, "Harga deal", { positive: true });
          await db("update public.mkt_vendor_quote_lines set negotiated_unit_price=$1, negotiated_subtotal=$1*offered_qty, updated_at=now() where quote_id=$2 and rfq_line_id=$3", [price, quoteId, integer(line.rfqLineId, "RFQ line")]);
        }
        await db("update public.mkt_vendor_quotes set negotiated_by=$1, negotiated_at=now(), negotiated_notes=$2, updated_at=now() where id=$3", [user.email, text(body.dealNotes), quoteId]);
        await writeEvent(db, { rfqId, quoteId, user, action: "deal_price_updated", description: "Harga deal quotation diperbarui" });
      });
      response._sendJson(200, { ok: true });
      return true;
    }
  }
  const inviteVendor = pathname.match(/^\/api\/mkt\/admin\/rfqs\/(\d+)\/invite-vendor$/);
  if (request.method === "POST" && inviteVendor) {
    const rfqId = integer(inviteVendor[1], "RFQ");
    const vendorId = integer(body.vendorId, "Vendor");
    await withTransaction(async (db) => {
      const rfq = await loadAdminRfq(rfqId, { client: db, forUpdate: true });
      if (!["quoting", "quoted"].includes(rfq.status)) fail(409, "RFQ harus disetujui sebelum mengundang vendor.");
      await inviteVendorsToExistingRfq(db, rfqId, [vendorId]);
    });
    response._sendJson(200, { ok: true });
    return true;
  }
  const approveInvite = pathname.match(/^\/api\/mkt\/admin\/rfqs\/(\d+)\/approve-and-invite$/);
  if (request.method === "POST" && approveInvite) {
    const rfqId = integer(approveInvite[1], "RFQ");
    const vendorIds = Array.isArray(body.vendorIds) ? body.vendorIds.map((id) => integer(id, "Vendor")) : [];
    if (!vendorIds.length) fail(400, "Minimal satu vendor wajib dipilih.");
    await withTransaction(async (db) => {
      const rfq = await loadAdminRfq(rfqId, { client: db, forUpdate: true });
      if (RFQ_TERMINAL.has(rfq.status)) fail(409, "RFQ sudah terminal.");
      if (rfq.status !== "quoting") {
        await transitionRfq(db, rfq, "quoting", user, "RFQ diarahkan ke vendor");
      }
      await inviteVendorsToExistingRfq(db, rfqId, vendorIds);
    });
    response._sendJson(200, { ok: true });
    return true;
  }
  const sendCustomer = pathname.match(/^\/api\/mkt\/admin\/rfqs\/(\d+)\/send-to-customer$/);
  if (request.method === "POST" && sendCustomer) {
    const rfqId = integer(sendCustomer[1], "RFQ");
    const quoteId = integer(body.quoteId, "Quotation");
    await withTransaction(async (db) => {
      const rfq = await loadAdminRfq(rfqId, { client: db, forUpdate: true });
        if (rfq.status === "customer_review" && Number(rfq.proposed_quote_id) === quoteId) {
          return;
        }
      const quote = (await db("select * from public.mkt_vendor_quotes where id=$1 and rfq_id=$2 and status='submitted' for update", [quoteId, rfqId])).rows[0];
      if (!quote) fail(409, "Quotation submitted tidak ditemukan.");
      await db("update public.mkt_vendor_quotes set status='selected', updated_at=now() where id=$1", [quoteId]);
      await db("update public.mkt_vendor_quotes set status='rejected', updated_at=now() where rfq_id=$1 and id<>$2 and status not in ('rejected','expired','withdrawn')", [rfqId, quoteId]);
       const updated = await db("update public.mkt_rfqs set status='customer_review', approval_status='pending', approval_requested_at=now(), proposed_quote_id=$1, updated_at=now() where id=$2 and status in ('quoted','quoting') returning id", [quoteId, rfqId]);
       if (!updated.rowCount) fail(409, "RFQ sudah tidak tersedia untuk dikirim ke customer.");
      await writeEvent(db, { rfqId, quoteId, user, action: "quote_sent_to_customer", oldValue: { status: rfq.status }, newValue: { status: "customer_review" }, description: text(body.notes) || "Quotation dikirim ke customer" });
      await customerNotification(db, rfq, `rfq-${rfqId}-customer-review-${quoteId}`, "rfq_customer_review", "Quotation menunggu persetujuan", "Quotation vendor siap ditinjau dan disetujui.", { quoteId });
       await notifyAdmins(db, {
         eventKey: `rfq-${rfqId}-customer-review-${quoteId}`,
         type: "rfq_customer_review",
         title: "Quotation dikirim ke customer",
         message: `Quotation RFQ ${rfq.rfq_number ?? rfqId} menunggu keputusan customer.`,
         resourceType: "rfq",
         resourceId: rfqId,
         link: `/admin?tab=service-operations`,
         payload: { rfqId, quoteId },
       });
    });
    response._sendJson(200, { ok: true, status: "customer_review" });
    return true;
  }
  return false;
}

async function handlePortalPurchaseOrders(request, response, pathname, user) {
  const list = pathname === "/api/mkt/portal/purchase-orders";
  const detailMatch = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)$/);
  const itemsMatch = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/items$/);
  const activityMatch = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/activity-log$/);
  const fromRfq = pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)\/purchase-order$/);
  if (request.method !== "GET" || (!list && !detailMatch && !itemsMatch && !activityMatch && !fromRfq)) return false;
  const companyIds = await accessibleCompanyIds(user);
  const targetMatch = fromRfq ?? detailMatch ?? itemsMatch ?? activityMatch;
  const where = list ? `(${ownerSql("r")})` : `${ownerSql("r")} and ${fromRfq ? "r.id=$4" : "po.id=$4"}`;
  const values = list ? [user.id, user.email, companyIds] : [user.id, user.email, companyIds, integer(targetMatch[1], "PO/RFQ")];
  const result = await query(
    `select po.id, coalesce(s.is_internal_vendor, false) as is_internal_vendor
       from public.mkt_purchase_orders po
       join public.mkt_rfqs r on r.id=po.rfq_id
       left join public.suppliers s on s.id=po.vendor_id
      where ${where}
      order by po.created_at desc`,
    values,
  );
  if (!result.rows.length) fail(404, "Purchase Order tidak ditemukan.");
  if (itemsMatch) {
    const lines = await query(
      `select id, item_name, qty, unit, unit_price, subtotal, notes
         from public.mkt_purchase_order_lines
        where po_id=$1 order by id`,
      [result.rows[0].id],
    );
    response._sendJson(200, { ok: true, count: lines.rowCount, data: lines.rows.map((line, index) => ({
      id: Number(line.id),
      lineNumber: index + 1,
      itemName: line.item_name,
      description: null,
      qty: line.qty,
      unit: line.unit,
      unitPrice: line.unit_price,
      subtotal: line.subtotal,
      notes: result.rows[0].is_internal_vendor ? line.notes : null,
      createdAt: null,
    })) });
    return true;
  }
  if (activityMatch) {
    const events = await query(
      `select al.id, al.action, al.old_value, al.new_value, al.description,
              al.actor_type, al.actor_name, al.created_at
         from public.activity_logs al
        where al.mkt_purchase_order_id=$1
        order by al.created_at asc, al.id asc`,
      [result.rows[0].id],
    );
    response._sendJson(200, { ok: true, data: events.rows.map((event) => ({
      id: Number(event.id),
      action: event.action,
      statusFrom: event.old_value?.status ?? null,
      statusTo: event.new_value?.status ?? null,
      message: event.description,
      actorRole: event.actor_type,
      actorName: !result.rows[0].is_internal_vendor && event.actor_type === "vendor"
        ? CUSTOMER_FACING_SELLER_NAME
        : event.actor_name,
      createdAt: event.created_at,
    })) });
    return true;
  }
  if (list) {
    const data = [];
    for (const row of result.rows) data.push(await poDetail(query, row.id, { customerView: true }));
    response._sendJson(200, { ok: true, data });
  } else {
    response._sendJson(200, { ok: true, data: await poDetail(query, result.rows[0].id, { customerView: true }) });
  }
  return true;
}


const VENDOR_SHIPMENT_EVENT_STATUS = {
  packing: "packing",
  loaded: "loading",
  ready_to_ship: "ready_to_ship",
  ready_for_pickup: "ready_to_ship",
  departed: "in_transit",
  arrived: "arrived",
  handed_over: "arrived",
};

const VENDOR_SHIPMENT_TRANSITIONS = {
  planned: new Set(["packing"]),
  packing: new Set(["loading", "ready_to_ship"]),
  loading: new Set(["ready_to_ship", "in_transit"]),
  ready_to_ship: new Set(["in_transit", "arrived"]),
  in_transit: new Set(["arrived"]),
  arrived: new Set(),
};

function requestIdempotencyKey(request, body = {}) {
  return text(request.headers["idempotency-key"]) ?? text(body.idempotencyKey);
}

async function vendorPoByToken(db, vendorToken, { forUpdate = false } = {}) {
  const row = (await db(
    `select po.*, r.id as rfq_id, r.rfq_number, r.portal_customer_id, r.buyer_email,
            r.buyer_name, r.delivery_address, s.name as vendor_name
       from public.mkt_purchase_orders po
       join public.mkt_rfqs r on r.id=po.rfq_id
       join public.suppliers s on s.id=po.vendor_id
      where po.vendor_token=$1
      limit 1${forUpdate ? " for update of po" : ""}`,
    [vendorToken],
  )).rows[0];
  if (!row) fail(404, "Link PO tidak ditemukan.");
  if (row.vendor_token_expires_at && new Date(row.vendor_token_expires_at) < new Date()) {
    fail(410, "Link PO sudah kedaluwarsa.");
  }
  return row;
}

function mapVendorShipment(row) {
  return {
    id: Number(row.id),
    shipmentNumber: row.shipment_number,
    shipmentStatus: row.shipment_status,
    shipmentType: row.shipment_type,
    carrierName: row.carrier_name,
    trackingNumber: row.tracking_number,
    origin: row.origin,
    destination: row.destination,
    estimatedArrival: row.estimated_arrival,
    actualArrival: row.actual_arrival,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function vendorShipmentDetail(db, po, shipmentId) {
  const shipment = (await db(
    `select * from public.mkt_po_shipments
      where id=$1 and po_id=$2
      limit 1`,
    [integer(shipmentId, "Shipment"), po.id],
  )).rows[0];
  if (!shipment) fail(404, "Shipment tidak ditemukan untuk PO ini.");
  const [events, items] = await Promise.all([
    db(
      `select id,event_type,note,location,attachment_object_path,created_at
         from public.mkt_po_shipment_events
        where shipment_id=$1
        order by event_sequence,id`,
      [shipment.id],
    ),
    db(
      `select si.id,si.po_line_id,si.line_number,si.qty,si.uom,pol.item_name
         from public.mkt_po_shipment_items si
         join public.mkt_purchase_order_lines pol on pol.id=si.po_line_id
        where si.shipment_id=$1
        order by si.line_number,si.id`,
      [shipment.id],
    ),
  ]);
  return {
    ...mapVendorShipment(shipment),
    items: items.rows.map((item) => ({
      id: Number(item.id),
      poLineId: Number(item.po_line_id),
      lineNumber: Number(item.line_number),
      qty: item.qty,
      uom: item.uom,
      itemName: item.item_name,
    })),
    timeline: events.rows.map((event) => ({
      id: Number(event.id),
      eventType: event.event_type,
      note: event.note,
      location: event.location,
      createdAt: event.created_at,
    })),
  };
}

async function vendorShipmentNotification(db, po, eventType, shipmentId, status, message) {
  const key = `vendor-shipment:${shipmentId}:${eventType}:${status}`;
  await queueEvent(db, {
    eventType: `shipment_${eventType}`,
    recipientType: "admin",
    rfqId: po.rfq_id,
    poId: po.id,
    payload: { shipmentId: Number(shipmentId), status },
    key,
  });
  await customerNotification(
    db,
    {
      id: po.rfq_id,
      rfq_number: po.rfq_number,
      portal_customer_id: po.portal_customer_id,
      buyer_email: po.buyer_email,
    },
    key,
    `shipment_${eventType}`,
    "Update pengiriman",
    message,
    { poId: Number(po.id), shipmentId: Number(shipmentId), status },
  );
  await notifyAdmins(db, {
    eventKey: key,
    type: `shipment_${eventType}`,
    title: "Update shipment vendor",
    message,
    resourceType: "shipment",
    resourceId: Number(shipmentId),
    link: "/admin?tab=marketplace-operations",
    payload: { poId: Number(po.id), rfqId: Number(po.rfq_id), shipmentId: Number(shipmentId), status },
  });
}

async function handlePublicVendorPo(request, response, pathname, body) {
  const actionMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)\/(accept|reject|request-revision)$/);
  const shipmentListMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)\/shipments$/);
  const shipmentDetailMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)\/shipments\/(\d+)$/);
  const shipmentEventMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)\/shipments\/(\d+)\/events$/);
  const shipmentPodMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)\/shipments\/(\d+)\/pod$/);
  const baseMatch = pathname.match(/^\/api\/mkt\/vendor-po\/([^/]+)$/);
  const tokenValue =
    actionMatch?.[1] ?? shipmentListMatch?.[1] ?? shipmentDetailMatch?.[1]
    ?? shipmentEventMatch?.[1] ?? shipmentPodMatch?.[1] ?? baseMatch?.[1];
  if (!tokenValue) return false;

  if (request.method === "GET" && baseMatch) {
    const po = await vendorPoByToken(query, tokenValue);
    response._sendJson(200, await poDetail(query, po.id));
    return true;
  }

  if (request.method === "GET" && shipmentListMatch) {
    const po = await vendorPoByToken(query, tokenValue);
    const shipments = await query(
      `select * from public.mkt_po_shipments
        where po_id=$1 and shipment_status <> 'cancelled'
        order by created_at asc,id asc`,
      [po.id],
    );
    response._sendJson(200, { ok: true, data: shipments.rows.map(mapVendorShipment) });
    return true;
  }

  if (request.method === "GET" && shipmentDetailMatch) {
    const po = await vendorPoByToken(query, tokenValue);
    response._sendJson(200, {
      ok: true,
      shipment: await vendorShipmentDetail(query, po, shipmentDetailMatch[2]),
    });
    return true;
  }

  if (request.method === "GET" && shipmentPodMatch) {
    const po = await vendorPoByToken(query, tokenValue);
    const shipmentId = integer(shipmentPodMatch[2], "Shipment");
    const shipment = (await query(
      `select id from public.mkt_po_shipments where id=$1 and po_id=$2 limit 1`,
      [shipmentId, po.id],
    )).rows[0];
    if (!shipment) fail(404, "Shipment tidak ditemukan untuk PO ini.");
    const pod = (await query(
      `select * from public.mkt_po_shipment_events
        where shipment_id=$1 and event_type='pod_submitted'
        order by created_at desc,id desc limit 1`,
      [shipmentId],
    )).rows[0];
    if (!pod) fail(404, "POD belum tersedia.");
    const path = String(pod.attachment_object_path ?? "");
    const url = path.startsWith("marketplace-pod/")
      ? await signedMarketplacePodUrl({ poId: po.id, shipmentId, path })
      : path;
    response._sendJson(200, {
      ok: true,
      data: { available: true, url, uploadedAt: pod.created_at, note: pod.note },
    });
    return true;
  }

  if (request.method === "POST" && shipmentEventMatch) {
    const key = requestIdempotencyKey(request, body);
    if (!key) fail(400, "Idempotency-Key wajib diisi untuk event shipment.");
    const eventType = text(body.eventType);
    const target = VENDOR_SHIPMENT_EVENT_STATUS[eventType];
    if (!target) fail(400, "Event shipment vendor tidak valid.");

    const result = await withTransaction(async (db) => {
      const po = await vendorPoByToken(db, tokenValue, { forUpdate: true });
      if (!po.confirmed_at) fail(409, "Vendor harus menerima PO terlebih dahulu.");
      const shipmentId = integer(shipmentEventMatch[2], "Shipment");
      const shipment = (await db(
        `select * from public.mkt_po_shipments
          where id=$1 and po_id=$2
          for update`,
        [shipmentId, po.id],
      )).rows[0];
      if (!shipment) fail(404, "Shipment tidak ditemukan untuk PO ini.");

      const existing = (await db(
        `select * from public.mkt_po_shipment_events
          where shipment_id=$1 and idempotency_key=$2
          limit 1`,
        [shipment.id, key],
      )).rows[0];
      if (existing) return { alreadyProcessed: true, status: shipment.shipment_status };

      const pickup = shipment.shipment_type === "pickup_self";
      if (pickup && !["packing", "ready_for_pickup", "handed_over"].includes(eventType)) {
        fail(409, "Untuk Ambil sendiri gunakan urutan: siapkan barang → siap diambil → diserahkan.");
      }
      if (!pickup && ["ready_for_pickup", "handed_over"].includes(eventType)) {
        fail(409, "Event pickup hanya berlaku untuk mode Ambil sendiri.");
      }
      if (eventType === "ready_for_pickup") {
        const pickupLocation = text(body.location ?? body.note ?? shipment.origin);
        if (!pickupLocation) fail(400, "Lokasi pengambilan wajib diisi sebelum barang dinyatakan siap.");
        body.location = pickupLocation;
      }

      if (["handed_over", "departed"].includes(eventType)) {
        const paymentTermCode = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
        if (!paymentTermCode) {
          fail(409, "Syarat pembayaran PO belum ditetapkan. Hubungi admin CST sebelum barang diserahkan/dikirim.");
        }
        const totals = await paymentTotalsForPo(db, po);
        const requiredAmount = requiredBeforeHandover(po, totals);
        const shortfall = Math.max(requiredAmount - totals.receivedAmount, 0);
        if (shortfall > 0.005) {
          if (paymentTermCode === "dp_after_receipt") {
            fail(409, `DP minimum belum terpenuhi. Kekurangan sebelum barang boleh diserahkan/dikirim: Rp ${shortfall.toLocaleString("id-ID")}.`);
          }
          fail(409, `Pembayaran customer belum lunas. Kekurangan sebelum barang boleh diserahkan/dikirim: Rp ${shortfall.toLocaleString("id-ID")}.`);
        }
      }

      if (!VENDOR_SHIPMENT_TRANSITIONS[shipment.shipment_status]?.has(target)) {
        fail(409, `Shipment tidak dapat berpindah dari ${shipment.shipment_status} ke ${target}.`);
      }

      const location = text(body.location);
      const updated = (await db(
        `update public.mkt_po_shipments
            set shipment_status=$1,
                origin=case when $2='ready_for_pickup' and $3::text is not null then $3 else origin end,
                destination=case when $2='ready_for_pickup' and $3::text is not null then $3 else destination end,
                actual_departure=case when $1='in_transit' then coalesce(actual_departure,now()) else actual_departure end,
                actual_arrival=case when $1='arrived' then coalesce(actual_arrival,now()) else actual_arrival end,
                updated_at=now()
          where id=$4 and shipment_status=$5
          returning *`,
        [target, eventType, location, shipment.id, shipment.shipment_status],
      )).rows[0];
      if (!updated) fail(409, "Shipment berubah oleh proses lain. Muat ulang lalu coba lagi.");

      const sequence = Number((await db(
        `select coalesce(max(event_sequence),0)+1 as next
           from public.mkt_po_shipment_events where shipment_id=$1`,
        [shipment.id],
      )).rows[0].next);
      await db(
        `insert into public.mkt_po_shipment_events
           (shipment_id,event_sequence,event_type,note,location,actor_type,actor_id,idempotency_key)
         values ($1,$2,$3,$4,$5,'vendor',$6,$7)`,
        [shipment.id, sequence, eventType, text(body.note), location, String(po.vendor_id), key],
      );

      let poStatus = po.status;
      if (target === "packing" && po.status === "vendor_accepted") poStatus = "production";
      if (target === "ready_to_ship" && ["vendor_accepted", "production"].includes(po.status)) poStatus = "ready_to_ship";
      if (target === "in_transit" && ["ready_to_ship", "production"].includes(po.status)) poStatus = "in_transit";
      if (target === "arrived" && po.status === "ready_to_ship" && !pickup) poStatus = "in_transit";
      if (poStatus !== po.status) {
        await db(
          `update public.mkt_purchase_orders
              set status=$1::mkt_po_status, updated_at=now()
            where id=$2`,
          [poStatus, po.id],
        );
      }

      await writeEvent(
        db,
        {
          rfqId: po.rfq_id,
          poId: po.id,
          actorType: "vendor",
          actorId: String(po.vendor_id),
          actorName: po.vendor_name,
          action: `shipment_${eventType}`,
          oldValue: { status: shipment.shipment_status },
          newValue: { status: target, shipmentId: Number(shipment.id) },
          description: text(body.note) || `Vendor memperbarui shipment menjadi ${eventType}.`,
        },
        `vendor-shipment-event:${shipment.id}:${key}`,
      );
      await vendorShipmentNotification(
        db,
        po,
        eventType,
        shipment.id,
        target,
        pickup
          ? `Status pengambilan ${updated.shipment_number} diperbarui: ${eventType.replaceAll("_", " ")}.`
          : `Status pengiriman ${updated.shipment_number} diperbarui: ${eventType.replaceAll("_", " ")}.`,
      );
      return { alreadyProcessed: false, status: target };
    });
    response._sendJson(200, { ok: true, ...result });
    return true;
  }

  if (request.method === "POST" && shipmentPodMatch) {
    const key = requestIdempotencyKey(request, body);
    if (!key) fail(400, "Idempotency-Key wajib diisi untuk POD.");
    const result = await withTransaction(async (db) => {
      const po = await vendorPoByToken(db, tokenValue, { forUpdate: true });
      if (!po.confirmed_at) fail(409, "Vendor harus menerima PO terlebih dahulu.");
      const shipmentId = integer(shipmentPodMatch[2], "Shipment");
      const shipment = (await db(
        `select * from public.mkt_po_shipments
          where id=$1 and po_id=$2
          for update`,
        [shipmentId, po.id],
      )).rows[0];
      if (!shipment) fail(404, "Shipment tidak ditemukan untuk PO ini.");
      if (!["arrived", "delivered", "partially_delivered"].includes(shipment.shipment_status)) {
        fail(409, "POD dapat diunggah setelah barang tiba/diserahkan.");
      }
      const existing = (await db(
        `select * from public.mkt_po_shipment_events
          where shipment_id=$1 and event_type='pod_submitted'
          order by created_at desc,id desc limit 1`,
        [shipment.id],
      )).rows[0];
      if (existing) return { alreadyProcessed: true, podId: Number(existing.id) };
      const file = body?.file;
      if (!file || typeof file.arrayBuffer !== "function") {
        fail(400, "File POD JPG/PNG/PDF wajib diunggah.");
      }
      const uploaded = await uploadMarketplacePod({ poId: po.id, shipmentId: shipment.id, file });
      const sequence = Number((await db(
        `select coalesce(max(event_sequence),0)+1 as next
           from public.mkt_po_shipment_events where shipment_id=$1`,
        [shipment.id],
      )).rows[0].next);
      const pod = (await db(
        `insert into public.mkt_po_shipment_events
           (shipment_id,event_sequence,event_type,note,attachment_object_path,actor_type,actor_id,idempotency_key)
         values ($1,$2,'pod_submitted',$3,$4,'vendor',$5,$6)
         returning *`,
        [shipment.id, sequence, text(body.remarks ?? body.note), uploaded.path, String(po.vendor_id), key],
      )).rows[0];
      await writeEvent(
        db,
        {
          rfqId: po.rfq_id,
          poId: po.id,
          actorType: "vendor",
          actorId: String(po.vendor_id),
          actorName: po.vendor_name,
          action: "shipment_pod_submitted",
          newValue: { shipmentId: Number(shipment.id) },
          description: "Vendor mengunggah bukti serah terima (POD).",
        },
        `vendor-pod:${shipment.id}:${key}`,
      );
      await vendorShipmentNotification(
        db,
        po,
        "pod_submitted",
        shipment.id,
        shipment.shipment_status,
        `Bukti serah terima untuk ${shipment.shipment_number} sudah tersedia. Silakan konfirmasi penerimaan barang.`,
      );
      return { alreadyProcessed: false, podId: Number(pod.id) };
    });
    response._sendJson(200, { ok: true, ...result });
    return true;
  }

  if (request.method !== "POST" || !actionMatch) return false;
  const action = actionMatch[2];
  const result = await withTransaction(async (db) => {
    const locked = await vendorPoByToken(db, tokenValue, { forUpdate: true });

    if (action === "accept") {
      if (locked.confirmed_at) {
        return { status: locked.status, poNumber: locked.po_number, alreadyProcessed: true };
      }
      if (locked.status === "issued") {
        await db(
          `update public.mkt_purchase_orders
              set status='vendor_accepted'::mkt_po_status, confirmed_at=now(), updated_at=now()
            where id=$1 and status='issued'`,
          [locked.id],
        );
        await writeEvent(
          db,
          {
            rfqId: locked.rfq_id,
            poId: locked.id,
            actorType: "vendor",
            actorId: String(locked.vendor_id),
            actorName: locked.vendor_name,
            action: "po_vendor_accepted",
            oldValue: { status: "issued" },
            newValue: { status: "vendor_accepted" },
            description: "Vendor menerima Purchase Order.",
          },
          `po:${locked.id}:vendor_accepted`,
        );
        await queueEvent(db, {
          eventType: "po_vendor_accepted",
          recipientType: "admin",
          rfqId: locked.rfq_id,
          poId: locked.id,
          payload: { poId: locked.id, status: "vendor_accepted" },
          key: `po:${locked.id}:vendor_accepted`,
        });
        await customerNotification(
          db,
          {
            id: locked.rfq_id,
            rfq_number: locked.rfq_number,
            portal_customer_id: locked.portal_customer_id,
            buyer_email: locked.buyer_email,
          },
          `po:${locked.id}:vendor_accepted:customer`,
          "po_vendor_accepted",
          "PO diterima vendor",
          `Vendor telah menerima ${locked.po_number}. Silakan pilih metode pengiriman.`,
          { poId: Number(locked.id), status: "vendor_accepted" },
        );
        return { status: "vendor_accepted", poNumber: locked.po_number, alreadyProcessed: false };
      }
      if (["production", "ready_to_ship", "in_transit"].includes(locked.status)) {
        await db(
          `update public.mkt_purchase_orders
              set confirmed_at=now(), updated_at=now()
            where id=$1 and confirmed_at is null`,
          [locked.id],
        );
        await writeEvent(
          db,
          {
            rfqId: locked.rfq_id,
            poId: locked.id,
            actorType: "vendor",
            actorId: String(locked.vendor_id),
            actorName: locked.vendor_name,
            action: "po_vendor_accepted_legacy",
            oldValue: { status: locked.status, confirmedAt: null },
            newValue: { status: locked.status, confirmedAt: "now" },
            description: "Vendor mengonfirmasi PO yang sudah terlanjur masuk fulfillment.",
          },
          `po:${locked.id}:vendor_accepted_legacy`,
        );
        return { status: locked.status, poNumber: locked.po_number, alreadyProcessed: false };
      }
      fail(409, "PO tidak berada pada tahap yang dapat dikonfirmasi vendor.");
    }

    if (locked.status !== "issued") fail(409, "PO tidak menunggu konfirmasi vendor.");
    const next = action === "reject" ? "vendor_rejected" : "revision_requested";
    const updated = await db(
      `update public.mkt_purchase_orders
          set status=$1::mkt_po_status, revision_notes=$2, updated_at=now()
        where id=$3 and status='issued'
        returning *`,
      [next, text(body.reason ?? body.notes), locked.id],
    );
    if (!updated.rowCount) fail(409, "PO berubah oleh proses lain.");
    await writeEvent(
      db,
      {
        rfqId: locked.rfq_id,
        poId: locked.id,
        actorType: "vendor",
        actorId: String(locked.vendor_id),
        actorName: locked.vendor_name,
        action: `po_${next}`,
        description: text(body.reason ?? body.notes) || `Vendor ${next}`,
      },
      `po:${locked.id}:${next}`,
    );
    await queueEvent(db, {
      eventType: `po_${next}`,
      recipientType: "admin",
      rfqId: locked.rfq_id,
      poId: locked.id,
      payload: { poId: locked.id, status: next },
      key: `po:${locked.id}:${next}`,
    });
    return { status: next, poNumber: locked.po_number, alreadyProcessed: false };
  });
  response._sendJson(200, { ok: true, ...result });
  return true;
}

async function handleMarketplaceRoute({ request, response, url, body, user, isAdmin = false, sendJson }) {
  response._sendJson = (status, value) => sendJson(response, status, value);
  if (isAdmin && url.pathname.startsWith("/api/mkt/admin/")) {
    if (await handleAdminOperations({ request, response, pathname: url.pathname, body, user, sendJson })) return true;
  }
  if (url.pathname.startsWith("/api/vendor-quote/")) return handleVendorQuote(request, response, url.pathname, body);
  if (url.pathname.startsWith("/api/mkt/vendor-po/")) return handlePublicVendorPo(request, response, url.pathname, body);
  if (isAdmin && url.pathname.startsWith("/api/mkt/admin/")) return handleAdminMarketplace(request, response, url.pathname, body, user);
  if (url.pathname.startsWith("/api/mkt/portal/")) {
    if (!user) fail(401, "Authentication required.");
    if (user.role !== "customer") fail(403, "Customer authorization required.");
    if (await handlePortalOperations({ request, response, pathname: url.pathname, body, user, sendJson })) return true;
    if (await handlePortalAction(request, response, user, url.pathname, body)) return true;
    if (await handlePortalPurchaseOrders(request, response, url.pathname, user)) return true;
    const quotation = url.pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)\/quotation$/);
    if (quotation && await portalQuotation(request, response, user, integer(quotation[1], "RFQ"))) return true;
    const detail = url.pathname.match(/^\/api\/mkt\/portal\/rfqs\/(\d+)$/);
    if (request.method === "GET" && (detail || url.pathname === "/api/mkt/portal/rfqs")) {
      await portalRfqs(request, response, url, user, detail ? integer(detail[1], "RFQ") : null);
      return true;
    }
  }
  return false;
}

export { handleMarketplaceRoute };