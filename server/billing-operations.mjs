import { pool, query } from "./db.mjs";
import { signedPaymentProofUrl } from "./storage.mjs";
import { openDevCompanyInvoiceWriter } from "./dev-customer-invoice-scoped-client.mjs";
import {
  invoiceReviewSnapshotRequired,readInvoiceOwnerReviewSnapshot,invoiceOwnerReviewDigest,
} from "./dev-invoice-owner-review-snapshot.mjs";
import {assertInvoiceReviewChallengeMatchesSource} from "./dev-bizportal-invoice-attestation.mjs";
import {lockInvoiceTaxSourceRows} from "./dev-invoice-tax-source-rowlock.mjs";

import { requireDirectCompanyInvoiceWriterSession } from "./dev-customer-invoice-writer-session-guard.mjs";
import {
  bestEffortNotificationWrite,
  notifyAdmins,
  notifyPortalCustomers,
} from "./notification-service.mjs";

const INVOICEABLE_STATUSES = new Set(["confirmed", "done", "completed"]);
const PAYMENT_STATUSES = new Set(["pending"]);
const ADMIN_PAYMENT_STATUSES = new Set(["paid", "failed", "expired", "cancelled"]);
const PAYMENT_TRANSITIONS = {
  pending: new Set(["paid", "failed", "expired", "cancelled"]),
  paid: new Set(),
  failed: new Set(),
  expired: new Set(),
  cancelled: new Set(),
};

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
  return Math.round(parsed * 100) / 100;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function idempotencyKey(request, body) {
  return text(request.headers["idempotency-key"]) ?? text(body?.idempotencyKey);
}

async function withTransaction(work, {verifyCustomerInvoiceAr = false, connect = null} = {}) {
  const client = connect ? await connect() : await pool.connect();
  try {
    await client.query("begin");
    // The owner receives the same in-process PostgreSQL client. This is
    // not an HTTP call or a separate pool connection, so commit/rollback
    // of Sales Invoice, journal and AR remains one transaction boundary.
    const result = await work((sql, values) => client.query(sql, values), client);
    if (verifyCustomerInvoiceAr &&
        process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true" &&
        process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV === "true" &&
        process.env.APP_ENV?.trim().toLowerCase() === "development") {
      // The existing CST-DEV AR source/lines/journal constraint triggers are
      // DEFERRABLE INITIALLY DEFERRED. Flushing them here proves the *actual*
      // pre-commit financial invariants before acknowledging Invoice success.
      // Any trigger error still causes withTransaction() to ROLLBACK. Never
      // run the flush for the legacy feature-OFF path or production.
      await client.query(
        "set constraints customer_ar_journal_source_dev, " +
        "customer_ar_journal_lines_dev, customer_ar_sales_source_dev immediate",
      );
      // These original deferred triggers are projections. They do not
      // necessarily raise when the source is absent. Require the actual
      // company-scoped persisted AR projection BEFORE COMMIT, backed by the
      // exact posted journal (and never by a free-form caller flag).
      const companyId = Number(result?.companyId);
      const invoiceId = Number(result?.id);
      if (![1,3].includes(companyId) ||
          !Number.isSafeInteger(invoiceId) || invoiceId <= 0) {
        fail(422, "Invoice tanpa identitas perusahaan untuk verifikasi AR.");
      }
      const arResult = await client.query(
        `select a.gl_entry_id,a.gross_amount,a.paid_amount,a.outstanding_amount
           from public.ar_subledger a
           join public.accounting_entries e
             on e.id=a.gl_entry_id and e.company_id=a.company_id
            and e.source='sales_invoice' and e.source_id=a.invoice_id
            and e.status='posted' and not e.is_voided and not e.is_reversed
          where a.company_id=$1 and a.invoice_id=$2
            and a.invoice_number=$3
            and a.notes='bizportal:customer-ar-source:v1'
            and a.status <> 'STALE'
          limit 2`,
        [companyId, invoiceId, result.invoiceNumber],
      );
      const ar = arResult.rows[0];
      const cents = (value) => Math.round(Number(value) * 100);
      if (arResult.rows.length !== 1 || !ar?.gl_entry_id ||
          cents(ar.gross_amount) !== cents(result.grandTotal) ||
          cents(ar.paid_amount) !== cents(result.amountPaid) ||
          cents(ar.outstanding_amount) !== cents(result.outstanding)) {
        fail(422, "AR setelah constraint trigger belum cocok dengan Invoice dan jurnal.");
      }
    }
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    if (connect) {
      // A failed socket close after COMMIT must not report a committed
      // financial transaction as failed; the replay gate remains canonical.
      try { await client.end(); } catch {}
    } else client.release();
  }
}

async function accessibleCompanyIds(user, db = query) {
  const result = await db(
    `select company_id
       from public.portal_company_members
      where portal_customer_id = $1
        and is_active = true
        and company_id is not null`,
    [user.id],
  );
  return result.rows.map((row) => Number(row.company_id)).filter(Number.isInteger);
}

function mapPayment(row) {
  return {
    id: Number(row.id),
    refKind: row.ref_kind,
    refId: Number(row.ref_id),
    refDocNumber: row.ref_doc_number,
    amount: Number(row.amount ?? 0),
    status: row.status,
    provider: row.provider,
    providerOrderId: row.provider_order_id ?? null,
    providerMerchantTradeNo: row.provider_merchant_trade_no,
    paymentMethod: row.payment_method ?? null,
    paymentUrl: row.payment_url ?? null,
    expiredAt: row.expired_at ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function invoiceStatus(row) {
  if (row.payment_status === "paid") return "paid";
  if (row.due_date && new Date(row.due_date).getTime() < Date.now()) return "overdue";
  return row.payment_status === "partial" ? "partial" : "unpaid";
}

function mapInvoice(row) {
  return {
    id: Number(row.id),
    invoiceNumber: row.invoice_number ?? `INV-${row.doc_number}`,
    documentNumber: row.doc_number,
    orderNumber: row.doc_number,
    amount: Number(row.grand_total ?? 0),
    grandTotal: Number(row.grand_total ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    amountPaid: Number(row.amount_paid ?? 0),
    outstanding: Math.max(0, Number(row.grand_total ?? 0) - Number(row.amount_paid ?? 0)),
    status: invoiceStatus(row),
    paymentStatus: row.payment_status,
    invoiceStatus: row.invoice_status,
    documentStatus: row.status,
    customerId: row.customer_id == null ? null : Number(row.customer_id),
    customerName: row.customer_name,
    companyId: row.company_id == null ? null : Number(row.company_id),
    dueDate: row.due_date,
    invoiceDate: row.invoice_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes ?? null,
  };
}

async function invoiceCustomerIds(db, invoice) {
  const result = await db(
    `select id
       from public.portal_customers
      where $1::int is not null and id = $1::int
     union
     select pcm.portal_customer_id as id
       from public.portal_company_members pcm
      where $2::int is not null
        and pcm.company_id = $2::int
        and pcm.is_active = true`,
    [invoice.customer_id, invoice.company_id],
  );
  return result.rows.map((row) => Number(row.id)).filter(Number.isInteger);
}

async function writeBillingActivity(db, { user, action, invoice, oldValue = null, newValue = null, deduplicationKey, description }) {
  await db(
    `insert into public.activity_logs
       (actor_type, actor_id, actor_name, action, old_value, new_value, description, deduplication_key)
     values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
     on conflict (deduplication_key) where deduplication_key is not null do nothing`,
    [
      user.role === "admin" ? "admin" : "customer",
      String(user.id),
      user.name ?? user.email ?? `Portal user ${user.id}`,
      action,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      description,
      deduplicationKey,
    ],
  );
}

async function notifyInvoiceCustomers(db, invoice, { eventKey, type, title, message, payload = {} }) {
  return bestEffortNotificationWrite(db, async () => {
    const customerIds = await invoiceCustomerIds(db, invoice);
    return notifyPortalCustomers(db, {
      customerIds,
      eventKey,
      type,
      title,
      message,
      resourceType: payload.paymentId ? "payment" : "invoice",
      resourceId: payload.paymentId ?? invoice.id,
      link: "/portal-invoice",
      payload: {
        invoiceId: Number(invoice.id),
        invoiceNumber: invoice.invoice_number ?? `INV-${invoice.doc_number}`,
        documentNumber: invoice.doc_number,
        ...payload,
      },
    });
  });
}

async function notifyInvoiceAdmins(db, invoice, {
  eventKey,
  type,
  title,
  message,
  payload = {},
  issuerPortalId = null,
}) {
  return notifyAdmins(db, {
    eventKey,
    type,
    title,
    message,
    // New Invoice: only the company-validated issuing Portal Admin.
    // Payments: resolve canonical active Owner / explicitly scoped staff
    // under company-bound data, never broadcast to all Portal Admins.
    ...(issuerPortalId == null
      ? { scopeCompanyId: invoice?.company_id }
      : { explicitAdminIds: [issuerPortalId] }),
    resourceType: payload.paymentId ? "payment" : "invoice",
    resourceId: payload.paymentId ?? invoice.id,
    link: "/admin?tab=service-operations",
    payload: {
      invoiceId: Number(invoice.id),
      invoiceNumber: invoice.invoice_number ?? `INV-${invoice.doc_number}`,
      documentNumber: invoice.doc_number,
      ...payload,
    },
  });
}

const INVOICE_COLUMNS = `
  id, doc_number, kind, status, invoice_status, payment_status, amount_paid,
  customer_id, customer_name, total_amount, grand_total, company_id, due_date,
  invoice_number, invoice_date, created_at, updated_at, notes,
  proof_url, payment_proof_token, proof_uploaded_at, proof_remarks
`;

async function loadInvoice(id, user, { db = query, admin = false, forUpdate = false } = {}) {
  const documentId = integer(id, "Invoice");
  if (admin) {
    const result = await db(
      `select ${INVOICE_COLUMNS}
         from public.sales_documents
        where id = $1
        limit 1${forUpdate ? " for update" : ""}`,
      [documentId],
    );
    if (!result.rows[0]) fail(404, "Invoice tidak ditemukan.");
    return result.rows[0];
  }

  const companyIds = await accessibleCompanyIds(user, db);
  const result = await db(
    `select ${INVOICE_COLUMNS}
       from public.sales_documents
      where id = $3
        and invoice_status = 'invoiced'
        and (
          customer_id = $1
          or company_id = any($2::int[])
        )
      limit 1${forUpdate ? " for update" : ""}`,
    [user.id, companyIds, documentId],
  );
  if (!result.rows[0]) fail(404, "Invoice tidak ditemukan.");
  return result.rows[0];
}

async function listInvoices(user, { admin = false } = {}) {
  if (admin) {
    const result = await query(
      `select ${INVOICE_COLUMNS}
         from public.sales_documents
        where invoice_status in ('to_invoice', 'invoiced')
        order by created_at desc
        limit 500`,
    );
    return result.rows.map(mapInvoice);
  }

  const companyIds = await accessibleCompanyIds(user);
  const result = await query(
    `select ${INVOICE_COLUMNS}
       from public.sales_documents
      where invoice_status = 'invoiced'
        and (
          customer_id = $1
          or company_id = any($2::int[])
        )
      order by created_at desc
      limit 100`,
    [user.id, companyIds],
  );
  return result.rows.map(mapInvoice);
}

async function paymentsForInvoice(id, db = query) {
  const result = await db(
    `select id, ref_kind, ref_id, ref_doc_number, amount, status, provider,
            provider_order_id, provider_merchant_trade_no, payment_method,
            payment_url, expired_at, paid_at, created_at, updated_at
       from public.payments
      where ref_kind = 'sales' and ref_id = $1
      order by created_at desc, id desc`,
    [id],
  );
  return result.rows.map(mapPayment);
}

async function linesForInvoice(id, db = query) {
  const result = await db(
    `select id, document_id, product_id, name, description, quantity,
            unit_price, subtotal, sales_uom_id, base_qty, meta,
            product_scope, service_scope
       from public.sales_document_lines
      where document_id = $1
      order by id`,
    [id],
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    documentId: Number(row.document_id),
    productId: row.product_id == null ? null : Number(row.product_id),
    name: row.name,
    description: row.description ?? null,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    salesUomId: row.sales_uom_id == null ? null : Number(row.sales_uom_id),
    baseQty: row.base_qty == null ? null : Number(row.base_qty),
    meta: row.meta ?? null,
    productScope: row.product_scope ?? null,
    serviceScope: row.service_scope ?? null,
  }));
}

async function paymentProofForInvoice(row) {
  const token = row.payment_proof_token ?? null;
  return {
    uploaded: Boolean(row.proof_url || row.proof_uploaded_at),
    url: row.proof_url && token ? await signedPaymentProofUrl({ token, path: row.proof_url }) : null,
    token,
    uploadedAt: row.proof_uploaded_at ?? null,
    remarks: row.proof_remarks ?? null,
  };
}

export async function handleCustomerInvoices({ request, response, user, sendJson, sendError, invoiceId = null }) {
  try {
    if (request.method === "GET" && invoiceId == null) {
      sendJson(response, 200, await listInvoices(user));
      return;
    }
    if (request.method === "GET" && invoiceId != null) {
      const row = await loadInvoice(invoiceId, user);
      sendJson(response, 200, {
        ...mapInvoice(row),
        paymentProof: await paymentProofForInvoice(row),
        payments: await paymentsForInvoice(row.id),
        lines: await linesForInvoice(row.id),
      });
      return;
    }
    if (request.method !== "POST" || invoiceId == null) {
      sendError(response, 405, "Method tidak didukung.");
      return;
    }

    const body = request.body ?? {};
    const key = idempotencyKey(request, body);
    if (!key || key.length < 8 || key.length > 160) {
      sendError(response, 400, "Idempotency-Key wajib diisi (8-160 karakter).");
      return;
    }
    const result = await withTransaction(async (db) => {
      await db("select pg_advisory_xact_lock(hashtextextended($1, 0))", [key]);
      const existing = await db(
        `select id, ref_kind, ref_id, ref_doc_number, amount, status, provider,
                provider_order_id, provider_merchant_trade_no, payment_method,
                payment_url, expired_at, paid_at, created_at, updated_at
           from public.payments
          where ref_kind = 'sales'
            and provider_merchant_trade_no = $1
          limit 1`,
        [key],
      );
      if (existing.rows[0]) {
        if (Number(existing.rows[0].ref_id) !== integer(invoiceId, "Invoice")) {
          fail(409, "Idempotency-Key sudah digunakan untuk invoice lain.");
        }
        return { payment: mapPayment(existing.rows[0]), replayed: true };
      }

      const invoice = await loadInvoice(invoiceId, user, { db, forUpdate: true });
      if (!INVOICEABLE_STATUSES.has(invoice.status)) {
        fail(409, "Order belum selesai atau tidak dapat dibayar.");
      }
      const outstanding = Math.max(0, Number(invoice.grand_total) - Number(invoice.amount_paid));
      if (outstanding <= 0 || invoice.payment_status === "paid") {
        fail(409, "Invoice sudah lunas.");
      }
      const reserved = await db(
        `select coalesce(sum(amount), 0) as amount
           from public.payments
          where ref_kind = 'sales'
            and ref_id = $1
            and status = any($2::payment_status[])`,
        [invoice.id, [...PAYMENT_STATUSES]],
      );
      const available = outstanding - Number(reserved.rows[0].amount ?? 0);
      const amount = body.amount == null ? available : decimal(body.amount, "Nominal pembayaran", { positive: true });
      if (amount > available + 0.005) {
        fail(409, "Nominal pembayaran melebihi sisa invoice.");
      }
      const payment = await db(
        `insert into public.payments
          (ref_kind, ref_id, ref_doc_number, amount, status, provider,
           provider_order_id, provider_merchant_trade_no, payment_method, raw)
         values ('sales', $1, $2, $3, 'pending', 'paylabs', $4, $5, $6, $7::jsonb)
         returning id, ref_kind, ref_id, ref_doc_number, amount, status, provider,
                   provider_order_id, provider_merchant_trade_no, payment_method,
                   payment_url, expired_at, paid_at, created_at, updated_at`,
        [
          invoice.id,
          invoice.doc_number,
          amount,
          `portal-${invoice.id}-${key}`,
          key,
          text(body.paymentMethod, "portal_manual"),
          JSON.stringify({ source: "customer_portal", idempotencyKey: key }),
        ],
      );
      await writeBillingActivity(db, {
        user,
        action: "sales_payment_submitted",
        invoice,
        newValue: { paymentId: payment.rows[0].id, amount, status: "pending" },
        deduplicationKey: `sales-payment-submitted:${payment.rows[0].id}`,
        description: `Payment customer untuk invoice ${invoice.invoice_number ?? invoice.doc_number} dibuat.`,
      });
      await notifyInvoiceAdmins(db, invoice, {
        eventKey: `sales-payment:${payment.rows[0].id}:submitted`,
        type: "sales_payment_submitted",
        title: "Payment customer masuk",
        message: `Customer mengajukan payment untuk invoice ${invoice.invoice_number ?? invoice.doc_number}.`,
        payload: { paymentId: payment.rows[0].id, paymentStatus: "pending", amount },
      });
      return { payment: mapPayment(payment.rows[0]), replayed: false };
    });
    sendJson(response, result.replayed ? 200 : 201, result);
  } catch (error) {
    if (error.statusCode) sendError(response, error.statusCode, error.message);
    else throw error;
  }
}

// Reuse the existing CST-DEV AR issuer's exact posted-journal evidence view.
// This is not an accounting writer: it checks the source inside the same
// transaction and refuses to commit an unproven newly issued invoice.
// The opt-in is OFF by default and cannot be used outside development.
async function requirePostedCustomerArEvidence(db, invoice) {
  if (process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true") return;
  if (process.env.APP_ENV?.trim().toLowerCase() !== "development") {
    fail(503, "Verifikasi jurnal Invoice hanya tersedia pada DEV.");
  }
  const companyId = Number(invoice?.company_id);
  if (![1, 3].includes(companyId) ||
      !Number.isSafeInteger(Number(invoice?.id)) ||
      !invoice?.invoice_number?.trim() ||
      !invoice?.invoice_date ||
      !invoice?.due_date) {
    fail(422, "Invoice belum memiliki identitas perusahaan, nomor, dan tanggal yang valid.");
  }
  // The SECURITY INVOKER/BARRIER view already proves exact company,
  // unique invoice number, posted balanced sales journal and receivable,
  // source identity, non-reversed source, and payment bounds.
  // Do not duplicate its accounting logic in Customer Portal.
  const evidence = await db(
    `select invoice_id
       from public.bizportal_customer_ar_source_evidence_dev
      where company_id = $1 and invoice_id = $2
      limit 2`,
    [companyId, invoice.id],
  );
  if (evidence.rows.length !== 1 ||
      Number(evidence.rows[0].invoice_id) !== Number(invoice.id)) {
    fail(422, "Invoice belum dapat diterbitkan: bukti jurnal penjualan posted belum lengkap.");
  }
}

// This is a transaction-bound integration seam to the EXISTING Accounting owner,
// not a journal writer. OFF by default. The owner must be passed by trusted
// server code, never taken from the HTTP request, and must use the exact same
// query transaction for all posting statements (no independent connection,
// background task, outbox, or uncommitted success response).
// The existing Portal admin login is not a BizPortal Super Admin login.
// Before invoking the original Accounting owner, independently reread the
// ACTIVE canonical BizPortal identity in the SAME PostgreSQL transaction.
// Never trust a role/email supplied by an HTTP body or an unverified JWT claim.
// A lock prevents role revocation or deactivation from racing this issuance.
// The Portal Admin who requests issuance is DISTINCT from the BizPortal
// Owner/Super Admin who signs one OTP approval. Both identities are checked
// and row-locked on the SAME dedicated company RLS client until COMMIT.
// A Portal Admin must also have an active, explicit BizPortal company scope;
// a generic Portal Admin role or self-selected customer membership is not enough.
async function requireCanonicalSalesInvoiceIssuer(db, portalUser, companyId) {
  const email = typeof portalUser?.email === "string" ? portalUser.email.trim() : "";
  if (portalUser?.role !== "admin" || !email || ![1, 3].includes(companyId)) {
    fail(403, "Admin penerbit tidak memiliki penugasan perusahaan yang sah.");
  }
  const result = await db(
    `select id, role, system_role, status, is_active, company_id
       from public.users
      where lower(trim(email))=lower(trim($1))
        and status='active'
        and is_active is true
        and (
          (role='admin' and company_id=$2)
          or (role='super_admin' and system_role='super_admin'
              and (company_id is null or company_id=$2))
        )
      limit 2
      for share`,
    [email,companyId],
  );
  if (result.rows.length !== 1 || !result.rows[0].id) {
    fail(403, "Penugasan perusahaan Admin penerbit tidak aktif atau tidak unik.");
  }
  const issuer = result.rows[0];
  if (issuer.status !== "active" || issuer.is_active !== true ||
      !(
        (issuer.role === "admin" && Number(issuer.company_id) === companyId) ||
        (issuer.role === "super_admin" && issuer.system_role === "super_admin" &&
          (issuer.company_id == null || Number(issuer.company_id) === companyId))
      )) {
    fail(403, "Admin penerbit tidak diizinkan untuk perusahaan Invoice ini.");
  }
  return String(issuer.id);
}

// Approval identity comes ONLY from the verified Ed25519 BizPortal proof.
// Never look up or authorize an owner from the Portal issuer email or HTTP
// fields. The canonical active role/tenant must still match the signed actor.
async function requireCanonicalSalesInvoiceOwner(db, verifiedApproval, companyId) {
  const actorId = typeof verifiedApproval?.actorId === "string"
    ? verifiedApproval.actorId.trim() : "";
  const email = typeof verifiedApproval?.email === "string"
    ? verifiedApproval.email.trim().toLowerCase() : "";
  if (!actorId || !email || ![1,3].includes(companyId)) {
    fail(403, "Identitas persetujuan Owner/Super Admin tidak valid.");
  }
  const matches = await db(
    `select id, email, role, system_role, status, is_active, company_id
       from public.users
      where id=$1 and lower(trim(email))=lower(trim($2))
        and role='super_admin'
        and system_role='super_admin'
        and status='active'
        and is_active is true
        and (company_id is null or company_id=$3)
      limit 2
      for share`,
    [actorId, email, companyId],
  );
  if (matches.rows.length !== 1) {
    fail(403, "Identitas Owner/Super Admin tidak aktif, tidak unik, atau lintas perusahaan.");
  }
  const owner = matches.rows[0];
  if (String(owner.id) !== actorId ||
      typeof owner.email !== "string" ||
      owner.email.trim().toLowerCase() !== email ||
      owner.role !== "super_admin" || owner.system_role !== "super_admin" ||
      owner.status !== "active" || owner.is_active !== true ||
      (owner.company_id != null && Number(owner.company_id) !== companyId)) {
    fail(403, "Persetujuan Owner/Super Admin tidak berwenang untuk Invoice.");
  }
  return actorId;
}

async function requireAtomicSalesInvoicePosting(db, invoice, canonicalActorId, postWithClient, transactionClient) {
  if (process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV !== "true") return;
  if (process.env.APP_ENV?.trim().toLowerCase() !== "development" ||
      process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true") {
    fail(503, "Jalur posting Invoice atomik belum diaktifkan secara aman.");
  }
  const companyId = Number(invoice?.company_id);
  const sourceId = Number(invoice?.id);
  const total = Number(invoice?.grand_total);
  if (![1, 3].includes(companyId) || !Number.isSafeInteger(sourceId) || sourceId <= 0 ||
      !Number.isFinite(total) || total <= 0 ||
      !invoice?.invoice_number?.trim() || !invoice?.invoice_date || !invoice?.due_date) {
    fail(422, "Identitas Invoice atau perusahaan untuk posting tidak valid.");
  }
  if (typeof postWithClient !== "function" ||
      !transactionClient || typeof transactionClient.query !== "function") {
    fail(503, "Pemilik posting jurnal Accounting DEV belum tersambung.");
  }
  // Reuse one legitimate company-scoped posting owner; never implement
  // journal INSERT/UPDATE SQL here. It must post inside this db transaction.
  let receipt;
  try {
    receipt = await postWithClient({
      query: db,
      transactionClient,
      companyId,
      source: "sales_invoice",
      sourceId,
      invoice,
      actorId: canonicalActorId,
    });
  } catch (error) {
    // Nonzero PPN is intentionally unsupported by the existing engine v1.
    // Return a clear business rejection rather than a generic HTTP 500.
    // The surrounding transaction still rolls back every invoice mutation.
    if (typeof error?.message === "string" &&
        error.message.startsWith("DEV_SALES_POSTING_TAX_")) {
      // This also covers invalid/missing company tax config under the
      // separately gated DEV PPN candidate. Never expose internal account IDs.
      fail(422, "Posting PPN ditolak: konfigurasi atau perhitungan pajak belum tervalidasi.");
    }
    throw error;
  }
  const entryId = Number(receipt?.entryId);
  if (receipt?.posted !== true || !Number.isSafeInteger(entryId) || entryId <= 0) {
    fail(422, "Jurnal penjualan belum berhasil di-posting.");
  }
  // Treat a returned success from the owner as a claim until verified against
  // the SAME database transaction, with exactly one posted, balanced
  // same-company journal and the configured Sales journal.
  const check = await db(
    `select e.id,e.company_id,e.source::text as source,e.source_id,
            e.status::text as status,e.total_debit,e.total_credit,
            e.is_voided,e.is_reversed,
            j.company_id as journal_company,
            (select count(*)::int from public.accounting_entries x
              where x.source='sales_invoice' and x.source_id=$2 and x.company_id=$3
                and not x.is_voided and not x.is_reversed) as source_count,
            (select count(*)::int from public.accounting_entry_lines l
              where l.entry_id=e.id) as line_count,
            (select coalesce(sum(l.debit),0) from public.accounting_entry_lines l
              where l.entry_id=e.id) as lines_debit,
            (select coalesce(sum(l.credit),0) from public.accounting_entry_lines l
              where l.entry_id=e.id) as lines_credit
       from public.accounting_entries e
       join public.accounting_journals j on j.id=e.journal_id
         and j.company_id=e.company_id and j.is_active
       join public.accounting_settings cfg on cfg.company_id=e.company_id
         and cfg.sales_journal_id=e.journal_id
      where e.id=$1 and e.company_id=$3 and e.source='sales_invoice'
        and e.source_id=$2
      limit 2`,
    [entryId, sourceId, companyId],
  );
  if (check.rows.length !== 1) {
    fail(422, "Jurnal penjualan tidak sesuai dengan Invoice yang diterbitkan.");
  }
  const e = check.rows[0];
  const close = (a,b) => Math.abs(Number(a) - Number(b)) < 0.005;
  if (e.status !== "posted" || e.is_voided || e.is_reversed ||
      Number(e.company_id) !== companyId || Number(e.source_id) !== sourceId ||
      Number(e.journal_company) !== companyId ||
      Number(e.source_count) !== 1 || Number(e.line_count) < 2 ||
      !close(e.total_debit, total) || !close(e.total_credit, total) ||
      !close(e.total_debit, e.lines_debit) ||
      !close(e.total_credit, e.lines_credit)) {
    fail(422, "Jurnal penjualan belum seimbang atau tidak memiliki bukti perusahaan yang sah.");
  }
  return { entryId };
}

// The existing original owner performs ALL GL journal writes. This helper
// stores only audit + outbox evidence inside the caller's same PostgreSQL
// transaction. Never fire-and-forget or use a separate connection before
// the outer COMMIT. Outbox delivery happens separately after COMMIT.
async function requireTransactionalSalesInvoiceEvidence(db, invoice, actorId, entryId) {
  const companyId = Number(invoice?.company_id);
  const sourceId = Number(invoice?.id);
  const amount = Number(invoice?.grand_total);
  if (![1, 3].includes(companyId) || !Number.isSafeInteger(sourceId) ||
      sourceId <= 0 || !Number.isSafeInteger(entryId) || entryId <= 0 ||
      typeof actorId !== "string" || !actorId ||
      !Number.isFinite(amount) || amount <= 0 ||
      !invoice?.invoice_number?.startsWith("INV-")) {
    fail(422, "Bukti audit Invoice tidak memiliki identitas transaksi yang sah.");
  }
  // The Invoice source row is already FOR UPDATE-locked by this transaction,
  // so two issuance requests cannot both enqueue for the same Invoice.
  const key = `sales_invoice:${companyId}:${sourceId}:${entryId}`;
  const priorOutbox = await db(
    `select id, payload from public.financial_outbox_events
      where entry_id=$1 and company_id=$2 and event_type='JOURNAL_CREATED'
      order by id limit 2 for update`,
    [entryId, companyId],
  );
  if (priorOutbox.rows.length > 1) {
    fail(422, "Jurnal memiliki lebih dari satu event Accounting: penerbitan ditolak.");
  }
  if (priorOutbox.rows.length === 1) {
    const previous = priorOutbox.rows[0].payload;
    if (previous?.eventType !== "JOURNAL_CREATED" ||
        previous?.sourceType !== "sales_invoice" ||
        Number(previous?.companyId) !== companyId ||
        Number(previous?.sourceId) !== sourceId ||
        Number(previous?.entryId) !== entryId) {
      fail(422, "Event Accounting tidak sesuai identitas Invoice/perusahaan.");
    }
  } else {
    const payload = {
      eventType: "JOURNAL_CREATED", sourceType: "sales_invoice",
      sourceId, companyId, entryId, amount, actor: actorId,
      ref: invoice.invoice_number, dedupeKey: key,
    };
    const saved = await db(
      `insert into public.financial_outbox_events
         (event_type,payload,status,entry_id,company_id)
       values('JOURNAL_CREATED',$1::jsonb,'pending',$2,$3)
       returning id`,
      [JSON.stringify(payload), entryId, companyId],
    );
    if (saved.rows.length !== 1) {
      fail(503, "Event Accounting belum dapat disimpan secara atomik.");
    }
  }

  const audit = await db(
    `select id from public.audit_accounting_events
      where journal_id=$1 and company_id=$2
        and action='SALES_INVOICE_ISSUED' and correlation_id=$3
      order by id limit 2 for update`,
    [entryId, companyId, key],
  );
  if (audit.rows.length !== 0) {
    // A new Invoice must not acquire a second issuance audit.
    fail(422, "Audit penerbitan Invoice sudah tercatat: duplikasi ditolak.");
  }
  const savedAudit = await db(
    `insert into public.audit_accounting_events
       (journal_id,action,company_id,amount,user_id,actor_type,
        correlation_id,change_reason,after_state)
     values($1,'SALES_INVOICE_ISSUED',$2,$3,$4,'SUPER_ADMIN',$5,
            'ATOMIC_INVOICE_JOURNAL_AR',$6::jsonb)
     returning id`,
    [
      entryId, companyId, amount, actorId, key,
      JSON.stringify({
        source: "sales_invoice", invoiceId: sourceId,
        invoiceNumber: invoice.invoice_number, entryId, companyId,
      }),
    ],
  );
  if (savedAudit.rows.length !== 1) {
    fail(503, "Audit Accounting belum dapat disimpan secara atomik.");
  }
  return { entryId, correlationKey: key };
}

export async function handleAdminInvoices({ request, response, user, sendJson, sendError, invoiceId = null, postSalesInvoiceWithClient = null, verifySignedBizPortalProof = null }) {
  if (request.method === "GET" && invoiceId == null) {
    sendJson(response, 200, { items: await listInvoices(user, { admin: true }) });
    return;
  }
  if (request.method === "GET" && invoiceId != null) {
    const row = await loadInvoice(invoiceId, user, { admin: true });
    sendJson(response, 200, {
      ...mapInvoice(row),
      paymentProof: await paymentProofForInvoice(row),
      payments: await paymentsForInvoice(row.id),
      lines: await linesForInvoice(row.id),
    });
    return;
  }
  if (request.method !== "POST" || invoiceId == null) {
    sendError(response, 405, "Method tidak didukung.");
    return;
  }
  const action = text(request.body?.action);
  if (action !== "mark_invoiced") {
    sendError(response, 400, "Action invoice tidak didukung.");
    return;
  }
  const atomicRequested = process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true";
  let selectedCompanyId = null;
  const connect = atomicRequested ? async () => {
    // The preliminary company selection is DB-derived and read-only;
    // the entire locked Invoice/Accounting transaction uses the chosen role.
    const selected = await openDevCompanyInvoiceWriter({
      invoiceId, portalUser:user, lookupCompany:query,
    });
    selectedCompanyId = selected.companyId;
    return selected.client;
  } : null;
  const result = await withTransaction(async (db, transactionClient) => {
    const row = await loadInvoice(invoiceId, user, { db, admin: true, forUpdate: true });
    let canonicalActorId = null;
    if (process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true") {
      if (selectedCompanyId !== Number(row.company_id)) {
        fail(503, "Identitas perusahaan Invoice berubah selama pemilihan koneksi.");
      }
      // A bypass-RLS/general service DB session is not a tenant writer,
      // even after an independently signed Super Admin approval.
      await requireDirectCompanyInvoiceWriterSession(transactionClient, Number(row.company_id));
      // Protect both the first issuance and replay of an existing Invoice.
      // The Portal account alone is insufficient to grant Accounting rights.
      if (process.env.APP_ENV?.trim().toLowerCase() !== "development" ||
          process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true") {
        fail(503, "Jalur posting Invoice atomik belum diaktifkan secara aman.");
      }
      // The Portal Admin must be active and explicitly scoped to this
      // Invoice's canonical company (Owner may also issue for a global scope).
      // The company's admin assignment is checked even when an Owner signed.
      await requireCanonicalSalesInvoiceIssuer(db, user, Number(row.company_id));
      if(invoiceReviewSnapshotRequired()){
        // Lock company tax settings and the exact accounting tax row in the
        // SAME Invoice transaction. Concurrent editors wait until COMMIT.
        await lockInvoiceTaxSourceRows(db,Number(row.company_id),Number(row.id));
        // Re-read persisted customer/tax/total under the SAME company RLS
        // transaction AFTER row FOR UPDATE; reject any post-consent changes
        // before mutating Sales Invoice, GL, AR, PPN or audit.
        const sourceSnapshot=await readInvoiceOwnerReviewSnapshot(db,Number(row.id));
        assertInvoiceReviewChallengeMatchesSource(
          request.body?.bizportalInvoiceChallenge,
          {portalUser:user,invoiceId:Number(row.id),companyId:Number(row.company_id)},
          invoiceOwnerReviewDigest(sourceSnapshot),
        );
      }
      // Exactly ONE signed approval: independently authenticated BizPortal
      // Owner/Super Admin (not a second reviewer/Admin). The trusted verifier
      // extracts actor identity from the actual Ed25519 signature, not HTTP.
      if (process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV !== "true" ||
          typeof verifySignedBizPortalProof !== "function") {
        fail(503, "Verifikasi sesi Super Admin BizPortal belum terpasang.");
      }
      let verifiedApproval = false;
      try {
        verifiedApproval = await verifySignedBizPortalProof({
          challenge: request.body?.bizportalInvoiceChallenge,
          proof: request.body?.bizportalInvoiceProof,
          portalUser: user,
          invoiceId: Number(row.id),
          companyId: Number(row.company_id),
        });
      } catch {
        fail(403, "Bukti sesi Super Admin BizPortal tidak valid.");
      }
      if (!verifiedApproval || typeof verifiedApproval.actorId !== "string" ||
          typeof verifiedApproval.email !== "string") {
        fail(403, "Sesi Super Admin BizPortal belum diverifikasi secara independen.");
      }
      canonicalActorId = await requireCanonicalSalesInvoiceOwner(
        db, verifiedApproval, Number(row.company_id),
      );
    }
    if (row.invoice_status === "invoiced") {
      await requirePostedCustomerArEvidence(db, row);
      return mapInvoice(row);
    }
    if (!INVOICEABLE_STATUSES.has(row.status)) {
      fail(409, "Hanya order confirmed/done yang dapat diterbitkan invoice.");
    }
    const updated = await db(
      `update public.sales_documents
          set invoice_status = 'invoiced',
              invoice_number = coalesce(invoice_number, 'INV-' || doc_number),
              invoice_date = coalesce(invoice_date, current_date),
              due_date = coalesce(due_date, current_date + coalesce(payment_term_days, 30)),
              updated_at = now()
        where id = $1
        returning ${INVOICE_COLUMNS}`,
      [row.id],
    );
    // DEV atomic bridge: only a trusted, company-scoped EXISTING posting owner
    // may write the journal. Then independently verify the returned journal
    // against persisted source/lines/GL and the existing AR evidence view.
    // All of this occurs BEFORE COMMIT/audit/notifications.
    const postingReceipt = await requireAtomicSalesInvoicePosting(
      db, updated.rows[0], canonicalActorId, postSalesInvoiceWithClient, transactionClient,
    );
    // Gate before COMMIT, audit or any outward notification. If the source
    // journal does not qualify, withTransaction rolls back the status/date
    // update and no customer can receive an unposted Invoice announcement.
    await requirePostedCustomerArEvidence(db, updated.rows[0]);
    if (postingReceipt) {
      // Journal+AR have already been verified in this SAME transaction.
      // A missing/out-of-scope outbox or audit is an issuance failure: rollback.
      await requireTransactionalSalesInvoiceEvidence(
        db, updated.rows[0], canonicalActorId, postingReceipt.entryId,
      );
    }
    const mapped = mapInvoice(updated.rows[0]);
    await writeBillingActivity(db, {
      user,
      action: "sales_invoice_issued",
      invoice: updated.rows[0],
      oldValue: { invoiceStatus: row.invoice_status },
      newValue: { invoiceStatus: "invoiced", invoiceNumber: mapped.invoiceNumber },
      deduplicationKey: `sales-invoice-issued:${row.id}`,
      description: `Invoice ${mapped.invoiceNumber} diterbitkan untuk order ${row.doc_number}.`,
    });
    await notifyInvoiceCustomers(db, updated.rows[0], {
      eventKey: `sales-invoice:${row.id}:invoiced`,
      type: "sales_invoice_issued",
      title: "Invoice diterbitkan",
      message: `Invoice ${mapped.invoiceNumber} sudah tersedia untuk dibayar.`,
      payload: { invoiceStatus: "invoiced" },
    });
      await notifyInvoiceAdmins(db, updated.rows[0], {
        issuerPortalId: user.id,
        eventKey: `sales-invoice:${row.id}:invoiced`,
        type: "sales_invoice_issued",
        title: "Invoice diterbitkan",
        message: `Invoice ${mapped.invoiceNumber} diterbitkan dan menunggu pembayaran customer.`,
        payload: { invoiceStatus: "invoiced" },
      });
    return mapped;
  }, {verifyCustomerInvoiceAr: atomicRequested, connect});
  sendJson(response, 200, result);
}

// Payment approval is an authorized company Admin action, NOT another
// Owner OTP. A generic Portal Admin role cannot authorize another company.
// Row locks protect against revocation during a status transaction.
async function authorizedAdminPaymentCompanies(db,user) {
  const portalId=Number(user?.id);
  const email=typeof user?.email==="string"?user.email.trim():"";
  if(user?.role!=="admin" || !Number.isSafeInteger(portalId) || portalId<=0 || !email)
    fail(403,"Akun Admin pembayaran tidak valid.");
  const matched=await db(
    `select u.id,u.role,u.system_role,u.company_id
       from public.portal_customers pc
       join public.users u on lower(btrim(pc.email))=lower(btrim(u.email))
      where pc.id=$1
        and pc.role='admin'
        and coalesce(pc.account_status,'active')='active'
        and lower(btrim(pc.email))=lower(btrim($2))
        and u.is_active is true and u.status='active'
        and u.role in ('admin','super_admin')
      limit 2 for share of pc,u`,
    [portalId,email],
  );
  if(matched.rows.length!==1 || !matched.rows[0]?.id)
    fail(403,"Identitas Admin pembayaran tidak aktif atau tidak unik.");
  const actor=matched.rows[0],company=actor.company_id==null?null:Number(actor.company_id);
  if(actor.role==='super_admin' && actor.system_role==='super_admin' &&
     (company===null || [1,3].includes(company)))
    return company===null?[1,3]:[company];
  if(actor.role==='admin' && [1,3].includes(company)) {
    const membership=await db(
      `select id from public.portal_company_members
        where portal_customer_id=$1 and company_id=$2 and is_active=true
        limit 2 for share`,
      [portalId,company],
    );
    if(membership.rows.length===1 && membership.rows[0]?.id) return [company];
  }
  fail(403,"Admin tidak memiliki penugasan perusahaan Invoice yang aktif.");
}

// Financial DEV gate: a payment state or replay is not proof that the
// original posted Invoice/AR still agrees. Recheck the original reviewed
// source evidence and AR projection inside the SAME transaction, after
// flushing its existing deferred constraint triggers. Never write a new
// cash, bank or AR journal here; original Accounting remains the owner.
async function requirePostedPaymentArConsistency(db,invoice) {
  if(process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV!=="true" ||
     process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV!=="true")return;
  if(process.env.APP_ENV?.trim().toLowerCase()!=="development")
    fail(503,"Verifikasi Payment dan AR tersedia hanya pada DEV.");
  const companyId=Number(invoice?.company_id),invoiceId=Number(invoice?.id);
  if(![1,3].includes(companyId) ||
     !Number.isSafeInteger(invoiceId) || invoiceId<=0 ||
     invoice?.invoice_status!=="invoiced" ||
     !invoice?.invoice_number?.trim())
    fail(422,"Identitas Invoice untuk pencocokan Payment/AR tidak lengkap.");
  // The original reviewed AR projection is a deferred CONSTRAINT TRIGGER.
  // Fail the parent transaction rather than acknowledging a paid status
  // whose AR has not been projected and validated yet.
  await db("set constraints customer_ar_journal_source_dev, "+
           "customer_ar_journal_lines_dev, customer_ar_sales_source_dev immediate");
  const sums=await db(
    `select coalesce(sum(amount) filter (where status='paid'),0) as paid
       from public.payments
      where ref_kind='sales' and ref_id=$1`,
    [invoiceId],
  );
  const evidence=await db(
    `select invoice_id from public.bizportal_customer_ar_source_evidence_dev
      where company_id=$1 and invoice_id=$2 limit 2`,
    [companyId,invoiceId],
  );
  const arResult=await db(
    `select a.gl_entry_id,a.gross_amount,a.paid_amount,a.outstanding_amount
       from public.ar_subledger a
       join public.accounting_entries e
         on e.id=a.gl_entry_id and e.company_id=a.company_id
        and e.source='sales_invoice' and e.source_id=a.invoice_id
        and e.status='posted' and not e.is_voided and not e.is_reversed
      where a.company_id=$1 and a.invoice_id=$2
        and a.invoice_number=$3
        and a.notes='bizportal:customer-ar-source:v1'
        and a.status <> 'STALE'
      limit 2`,
    [companyId,invoiceId,invoice.invoice_number],
  );
  const cents=(v)=>Math.round(Number(v)*100);
  const gross=cents(invoice.grand_total),paid=cents(invoice.amount_paid);
  const sumPaid=cents(sums.rows[0]?.paid);
  const ar=arResult.rows[0];
  const expectedStatus=paid===gross?"paid":paid>0?"partial":"unpaid";
  if(sums.rows.length!==1 || evidence.rows.length!==1 ||
     Number(evidence.rows[0]?.invoice_id)!==invoiceId ||
     arResult.rows.length!==1 || !ar?.gl_entry_id ||
     !Number.isFinite(gross) || gross<=0 ||
     !Number.isFinite(paid) || paid<0 || paid>gross ||
     !Number.isFinite(sumPaid) || sumPaid!==paid ||
     invoice.payment_status!==expectedStatus ||
     cents(ar.gross_amount)!==gross ||
     cents(ar.paid_amount)!==paid ||
     cents(ar.outstanding_amount)!==gross-paid) {
    fail(422,"Status Payment tidak cocok dengan jurnal sumber dan AR. Transaksi dibatalkan.");
  }
}

export async function handleAdminPayments({ request, response, user, sendJson, sendError, paymentId = null }) {
  if (request.method === "GET" && paymentId == null) {
    const items=await withTransaction(async(db)=>{
      const companies=await authorizedAdminPaymentCompanies(db,user);
      const result=await db(
        `select p.id, p.ref_kind, p.ref_id, p.ref_doc_number, p.amount, p.status, p.provider,
                p.provider_order_id, p.provider_merchant_trade_no, p.payment_method,
                p.payment_url, p.expired_at, p.paid_at, p.created_at, p.updated_at,
                s.invoice_number, s.customer_name, s.payment_status as document_payment_status
           from public.payments p
           join public.sales_documents s on s.id=p.ref_id
          where p.ref_kind='sales' and s.company_id=any($1::int[])
            and (p.company_id is null or p.company_id=s.company_id)
          order by p.created_at desc,p.id desc
          limit 500`,
        [companies],
      );
      return result.rows.map((row)=>({
        ...mapPayment(row),invoiceNumber:row.invoice_number,
        customerName:row.customer_name,documentPaymentStatus:row.document_payment_status,
      }));
    });
    sendJson(response,200,{items});
    return;
  }
  if (request.method !== "POST" || paymentId == null) {
    sendError(response, 405, "Method tidak didukung.");
    return;
  }
  const nextStatus = text(request.body?.status);
  if (!ADMIN_PAYMENT_STATUSES.has(nextStatus)) {
    sendError(response, 400, "Status pembayaran tidak didukung.");
    return;
  }
  const result = await withTransaction(async (db) => {
    const paymentResult=await db(
      `select p.id,p.ref_kind,p.ref_id,p.ref_doc_number,p.amount,p.status,p.provider,
              p.provider_order_id,p.provider_merchant_trade_no,p.payment_method,
              p.payment_url,p.expired_at,p.paid_at,p.created_at,p.updated_at,p.company_id
         from public.payments p
        where p.id=$1 and p.ref_kind='sales'
        for update`,
      [integer(paymentId,"Payment")],
    );
    const payment=paymentResult.rows[0];
    if(!payment) fail(404,"Payment tidak ditemukan.");
    const docResult=await db(
      `select ${INVOICE_COLUMNS}
         from public.sales_documents
        where id=$1
        for update`,
      [payment.ref_id],
    );
    const invoice=docResult.rows[0];
    if(!invoice) fail(409,"Sales document untuk payment tidak ditemukan.");
    const allowedCompanies=await authorizedAdminPaymentCompanies(db,user);
    if(!allowedCompanies.includes(Number(invoice.company_id)))
      fail(403,"Admin tidak berwenang memperbarui pembayaran perusahaan Invoice ini.");
    if(payment.company_id!=null && Number(payment.company_id)!==Number(invoice.company_id))
      fail(409,"Perusahaan sumber Payment tidak cocok dengan Invoice.");
    if(invoice.invoice_status!=='invoiced')
      fail(409,"Payment hanya dapat diproses untuk Invoice yang sudah diterbitkan.");
    // Replay must be checked AFTER authorization, even if already paid.
    if(payment.status===nextStatus) {
      await requirePostedPaymentArConsistency(db,invoice);
      return {payment:mapPayment(payment),invoice:null,replayed:true};
    }
    if(payment.status==='paid' && nextStatus!=='paid')
      fail(409,"Payment paid tidak dapat dibatalkan melalui portal.");
    if(!PAYMENT_TRANSITIONS[payment.status]?.has(nextStatus))
      fail(409,`Payment ${payment.status} tidak dapat diubah menjadi ${nextStatus}.`);
    if (nextStatus === "paid") {
      const paid = Number(invoice.amount_paid) + Number(payment.amount);
      if (paid > Number(invoice.grand_total) + 0.005) fail(409, "Total payment melebihi grand total invoice.");
    }
    const updatedPayment = await db(
      `update public.payments
          set status = $2::payment_status,
              paid_at = case when $2 = 'paid' then coalesce(paid_at, now()) else paid_at end,
              updated_at = now()
        where id = $1
        returning id, ref_kind, ref_id, ref_doc_number, amount, status, provider,
                  provider_order_id, provider_merchant_trade_no, payment_method,
                  payment_url, expired_at, paid_at, created_at, updated_at`,
      [payment.id, nextStatus],
    );
    const totals = await db(
      `select coalesce(sum(amount) filter (where status = 'paid'), 0) as amount_paid
         from public.payments
        where ref_kind = 'sales' and ref_id = $1`,
      [invoice.id],
    );
    const amountPaid = Number(totals.rows[0].amount_paid ?? 0);
    await db(
      `update public.sales_documents
          set amount_paid = $2,
              payment_status = case
                when $2 >= grand_total then 'paid'::sales_payment_status
                when $2 > 0 then 'partial'::sales_payment_status
                else 'unpaid'::sales_payment_status
              end,
              updated_at = now()
        where id = $1`,
      [invoice.id, amountPaid],
    );
    const updatedInvoice = {
      ...invoice,
      amount_paid: amountPaid,
      payment_status: amountPaid >= Number(invoice.grand_total)
        ? "paid"
        : amountPaid > 0 ? "partial" : "unpaid",
    };
    await writeBillingActivity(db, {
      user,
      action: "sales_payment_status_changed",
      invoice,
      oldValue: { paymentId: payment.id, status: payment.status },
      newValue: { paymentId: payment.id, status: nextStatus, amountPaid },
      deduplicationKey: `sales-payment-status:${payment.id}:${nextStatus}`,
      description: `Payment ${payment.id} untuk invoice ${invoice.invoice_number ?? invoice.doc_number} berstatus ${nextStatus}.`,
    });
    await notifyInvoiceCustomers(db, updatedInvoice, {
      eventKey: `sales-payment:${payment.id}:${nextStatus}`,
      type: "sales_payment_status_changed",
      title: nextStatus === "paid" ? "Pembayaran dikonfirmasi" : "Status pembayaran diperbarui",
      message: nextStatus === "paid"
        ? `Pembayaran invoice ${invoice.invoice_number ?? invoice.doc_number} sudah dikonfirmasi.`
        : `Status pembayaran invoice ${invoice.invoice_number ?? invoice.doc_number}: ${nextStatus}.`,
      payload: { paymentId: payment.id, paymentStatus: nextStatus, amountPaid },
    });
      await notifyInvoiceAdmins(db, updatedInvoice, {
        eventKey: `sales-payment:${payment.id}:${nextStatus}`,
        type: "sales_payment_status_changed",
        title: "Status payment berubah",
        message: `Payment ${payment.id} untuk invoice ${invoice.invoice_number ?? invoice.doc_number} berstatus ${nextStatus}.`,
        payload: { paymentId: payment.id, paymentStatus: nextStatus, amountPaid },
      });
    await requirePostedPaymentArConsistency(db,updatedInvoice);
    return {
      payment: mapPayment(updatedPayment.rows[0]),
      invoice: mapInvoice(updatedInvoice),
      replayed: false,
    };
  });
  sendJson(response, 200, result);
}

export async function handleCustomerPayments({ request, response, user, sendJson, sendError }) {
  if (request.method !== "GET") {
    sendError(response, 405, "Method tidak didukung.");
    return;
  }
  const companyIds = await accessibleCompanyIds(user);
  const result = await query(
    `select p.id, p.ref_kind, p.ref_id, p.ref_doc_number, p.amount, p.status, p.provider,
            p.provider_order_id, p.provider_merchant_trade_no, p.payment_method,
            p.payment_url, p.expired_at, p.paid_at, p.created_at, p.updated_at
       from public.payments p
       join public.sales_documents s on s.id = p.ref_id and p.ref_kind = 'sales'
      where s.invoice_status = 'invoiced'
        and (s.customer_id = $1 or s.company_id = any($2::int[]))
      order by p.created_at desc, p.id desc
      limit 200`,
    [user.id, companyIds],
  );
  sendJson(response, 200, { items: result.rows.map(mapPayment) });
}
