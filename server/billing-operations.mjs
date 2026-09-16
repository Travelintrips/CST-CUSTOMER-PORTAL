import { pool, query } from "./db.mjs";

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

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await work((sql, values) => client.query(sql, values));
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
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
  const customerIds = await invoiceCustomerIds(db, invoice);
  for (const customerId of customerIds) {
    await db(
      `insert into public.portal_customer_notifications
         (portal_customer_id, event_key, type, title, message, payload)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       on conflict (portal_customer_id, event_key) do nothing`,
      [
        customerId,
        eventKey,
        type,
        title,
        message,
        JSON.stringify({
          invoiceId: Number(invoice.id),
          invoiceNumber: invoice.invoice_number ?? `INV-${invoice.doc_number}`,
          documentNumber: invoice.doc_number,
          ...payload,
        }),
      ],
    );
  }
}

const INVOICE_COLUMNS = `
  id, doc_number, kind, status, invoice_status, payment_status, amount_paid,
  customer_id, customer_name, total_amount, grand_total, company_id, due_date,
  invoice_number, invoice_date, created_at, updated_at, notes
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
        paymentProof: {
          uploaded: false,
          uploadedAt: null,
          remarks: null,
        },
        payments: await paymentsForInvoice(row.id),
        lines: [],
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
         values ('sales', $1, $2, $3, 'pending', 'unknown', $4, $5, $6, $7::jsonb)
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
      return { payment: mapPayment(payment.rows[0]), replayed: false };
    });
    sendJson(response, result.replayed ? 200 : 201, result);
  } catch (error) {
    if (error.statusCode) sendError(response, error.statusCode, error.message);
    else throw error;
  }
}

export async function handleAdminInvoices({ request, response, user, sendJson, sendError, invoiceId = null }) {
  if (request.method === "GET" && invoiceId == null) {
    sendJson(response, 200, { items: await listInvoices(user, { admin: true }) });
    return;
  }
  if (request.method === "GET" && invoiceId != null) {
    const row = await loadInvoice(invoiceId, user, { admin: true });
    sendJson(response, 200, { ...mapInvoice(row), payments: await paymentsForInvoice(row.id), lines: [] });
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
  const result = await withTransaction(async (db) => {
    const row = await loadInvoice(invoiceId, user, { db, admin: true, forUpdate: true });
    if (row.invoice_status === "invoiced") return mapInvoice(row);
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
    return mapped;
  });
  sendJson(response, 200, result);
}

export async function handleAdminPayments({ request, response, user, sendJson, sendError, paymentId = null }) {
  if (request.method === "GET" && paymentId == null) {
    const result = await query(
      `select p.id, p.ref_kind, p.ref_id, p.ref_doc_number, p.amount, p.status, p.provider,
              p.provider_order_id, p.provider_merchant_trade_no, p.payment_method,
              p.payment_url, p.expired_at, p.paid_at, p.created_at, p.updated_at,
              s.invoice_number, s.customer_name, s.payment_status as document_payment_status
         from public.payments p
         left join public.sales_documents s on s.id = p.ref_id and p.ref_kind = 'sales'
        where p.ref_kind = 'sales'
        order by p.created_at desc, p.id desc
        limit 500`,
    );
    sendJson(response, 200, { items: result.rows.map((row) => ({ ...mapPayment(row), invoiceNumber: row.invoice_number, customerName: row.customer_name, documentPaymentStatus: row.document_payment_status })) });
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
    const paymentResult = await db(
      `select p.id, p.ref_kind, p.ref_id, p.ref_doc_number, p.amount, p.status, p.provider,
              p.provider_order_id, p.provider_merchant_trade_no, p.payment_method,
              p.payment_url, p.expired_at, p.paid_at, p.created_at, p.updated_at
         from public.payments p
        where p.id = $1 and p.ref_kind = 'sales'
        for update`,
      [integer(paymentId, "Payment")],
    );
    const payment = paymentResult.rows[0];
    if (!payment) fail(404, "Payment tidak ditemukan.");
    if (payment.status === nextStatus) return { payment: mapPayment(payment), invoice: null, replayed: true };
    if (payment.status === "paid" && nextStatus !== "paid") {
      fail(409, "Payment paid tidak dapat dibatalkan melalui portal.");
    }
    if (!PAYMENT_TRANSITIONS[payment.status]?.has(nextStatus)) {
      fail(409, `Payment ${payment.status} tidak dapat diubah menjadi ${nextStatus}.`);
    }
    const docResult = await db(
      `select ${INVOICE_COLUMNS}
         from public.sales_documents
        where id = $1
        for update`,
      [payment.ref_id],
    );
    const invoice = docResult.rows[0];
    if (!invoice) fail(409, "Sales document untuk payment tidak ditemukan.");
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