#!/usr/bin/env node

/**
 * Disposable development-only notification lifecycle E2E.
 *
 * The fixture rows are created in the configured development database, all
 * business transitions are exercised through the API, and cleanup runs in a
 * finally block. Production hosts/databases are rejected before any write.
 */

import { closeDatabase, databaseConnectionSource, databaseEnvironment, pool, query } from "../server/db.mjs";

const API_PORT = "3000";
const PRODUCTION_HOSTS = new Set(["cstlogistic.co.id", "www.cstlogistic.co.id"]);

function fail(message) {
  throw new Error(`[notification-lifecycle-e2e] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function previewApiUrl() {
  const configured = process.env.PORTAL_E2E_BASE_URL?.trim();
  const domain = process.env.REPLIT_DEV_DOMAIN?.trim();
  const raw = configured || (domain ? `https://${domain}:${API_PORT}` : "");
  if (!raw) fail("REPLIT_DEV_DOMAIN is required.");

  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("PORTAL_E2E_BASE_URL must be an absolute URL.");
  }
  if (url.protocol !== "https:") fail("E2E target must use HTTPS.");
  if (url.port !== API_PORT) fail(`E2E target must use public API port ${API_PORT}.`);
  if (PRODUCTION_HOSTS.has(url.hostname)) fail("Production API target is not allowed.");
  if (!url.hostname.endsWith(".replit.dev") && !url.hostname.endsWith(".sisko.replit.dev")) {
    fail("E2E target must be a Replit development preview host.");
  }
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url;
}

function setCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

class CookieJar {
  #cookies = new Map();

  store(headers) {
    for (const header of setCookieHeaders(headers)) {
      const pair = header.split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator > 0) this.#cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }

  header() {
    return [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

class PortalClient {
  constructor(baseUrl, label) {
    this.baseUrl = baseUrl;
    this.label = label;
    this.cookies = new CookieJar();
  }

  async request(path, options = {}) {
    const { expected = [200], body, headers = {}, ...fetchOptions } = options;
    const requestHeaders = { Accept: "application/json", ...headers };
    const cookie = this.cookies.header();
    if (cookie) requestHeaders.Cookie = cookie;
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

    let response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        ...fetchOptions,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
      });
    } catch (error) {
      fail(`${this.label} ${fetchOptions.method ?? "GET"} ${path} failed: ${error.message}`);
    }
    this.cookies.store(response.headers);
    assert(response.url.startsWith(this.baseUrl.origin), `${this.label} left the development origin.`);
    assert(expected.includes(response.status), `${this.label} ${path} returned ${response.status}; expected ${expected.join(" or ")}.`);

    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      fail(`${this.label} ${path} returned non-JSON.`);
    }
  }

  async devLogin(role) {
    const data = await this.request("/api/portal/auth/dev-login", {
      method: "POST",
      body: { role },
    });
    assert(data?.profile?.id, `${this.label} dev login returned no profile.`);
    return data.profile;
  }
}

function jsonPayload(row) {
  return row?.payload && typeof row.payload === "object" ? row.payload : {};
}

async function fixtureNotifications({ eventKeys, customerId, adminId }) {
  if (!eventKeys.length) return [];
  const result = await query(
    `select id, portal_customer_id, event_key, type, payload, is_read, read_at
       from public.portal_customer_notifications
      where event_key = any($1::text[])
        and portal_customer_id = any($2::int[])
      order by id`,
    [eventKeys, [customerId, adminId]],
  );
  return result.rows.map((row) => ({ ...row, payload: jsonPayload(row) }));
}

function notificationFor(rows, { eventKey, recipientId, audience, type, resourceType, resourceId, link }) {
  const row = rows.find((item) => item.event_key === eventKey && Number(item.portal_customer_id) === Number(recipientId));
  assert(row, `missing ${audience} notification ${eventKey}`);
  const payload = row.payload;
  assert(payload.audience === audience, `${eventKey} has audience ${payload.audience}, expected ${audience}.`);
  assert(payload.resourceType === resourceType, `${eventKey} has resourceType ${payload.resourceType}, expected ${resourceType}.`);
  assert(Number(payload.resourceId) === Number(resourceId), `${eventKey} has resourceId ${payload.resourceId}, expected ${resourceId}.`);
  assert(payload.link === link, `${eventKey} has link ${payload.link}, expected ${link}.`);
  assert(payload.url === link, `${eventKey} has url ${payload.url}, expected ${link}.`);
  assert(row.type === type, `${eventKey} has type ${row.type}, expected ${type}.`);
  assert(row.is_read === false, `${eventKey} should initially be unread.`);
  return row;
}

function bothNotification(rows, args) {
  return {
    customer: notificationFor(rows, {
      ...args,
      recipientId: args.customerId,
      audience: "customer",
      link: args.customerLink,
    }),
    admin: notificationFor(rows, {
      ...args,
      recipientId: args.adminId,
      audience: "admin",
      link: "/admin?tab=service-operations",
    }),
  };
}

async function createFixture({ customerId, nonce }) {
  const client = await pool.connect();
  const fixture = {
    nonce,
    rfqId: null,
    rfqLineId: null,
    quoteId: null,
    quoteToken: `e2e-lifecycle-token-${nonce}`,
    poId: null,
    poLineId: null,
    shipmentId: null,
    shipmentItemId: null,
    invoiceId: null,
    paymentId: null,
  };
  try {
    await client.query("begin");
    const vendorResult = await client.query(
      "select id, name, address from public.suppliers order by id limit 1",
    );
    const vendor = vendorResult.rows[0];
    if (!vendor) fail("development database has no supplier fixture.");

    const rfq = await client.query(
      `insert into public.mkt_rfqs
        (rfq_number, buyer_name, buyer_email, buyer_company, status, priority,
         required_delivery_date, delivery_address, notes, email_verified,
         line_count, portal_customer_id, approval_status)
       values ($1,$2,$3,$4,'draft'::mkt_rfq_status,'normal'::mkt_rfq_priority,
               current_date + 14, $5, $6, true, 1, $7, 'none')
       returning id`,
      [
        `E2E-LIFECYCLE-${nonce}`,
        "Disposable Lifecycle Customer",
        `dev-customer@dev.local`,
        `E2E Disposable Company`,
        "Development-only destination",
        `Disposable notification lifecycle ${nonce}`,
        customerId,
      ],
    );
    fixture.rfqId = Number(rfq.rows[0].id);

    const line = await client.query(
      `insert into public.mkt_rfq_lines
        (rfq_id, item_name, item_unit, requested_qty, notes, sort_order)
       values ($1,'Disposable E2E Cargo','box',2,'development fixture',0)
       returning id`,
      [fixture.rfqId],
    );
    fixture.rfqLineId = Number(line.rows[0].id);

    const quote = await client.query(
      `insert into public.mkt_vendor_quotes
        (rfq_id, vendor_id, token, status, valid_until, quotation_number,
         quotation_date, payment_terms, incoterm, delivery_location, requote_round)
       values ($1,$2,$3,'invited'::mkt_quote_status,now() + interval '7 days',
               $4,current_date,'NET 30','DAP','Development-only destination',1)
       returning id`,
      [fixture.rfqId, vendor.id, fixture.quoteToken, `E2E-QT-${nonce}`],
    );
    fixture.quoteId = Number(quote.rows[0].id);

    const invoice = await client.query(
      `insert into public.sales_documents
        (doc_number, kind, status, invoice_status, payment_status, amount_paid,
         customer_id, customer_name, total_amount, tax_amount, grand_total,
         destination, notes, payment_term_days)
       values ($1,'order'::sales_doc_kind,'done'::sales_doc_status,
               'to_invoice'::sales_invoice_status,'unpaid'::sales_payment_status,
               0,$2,'Disposable Lifecycle Customer',100,0,100,
               'Development-only destination',$3,7)
       returning id`,
      [`E2E-SALES-${nonce}`, customerId, `Disposable invoice ${nonce}`],
    );
    fixture.invoiceId = Number(invoice.rows[0].id);
    await client.query("commit");
    return fixture;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function cleanupFixture(fixture) {
  if (!fixture) return;
  const client = await pool.connect();
  try {
    await client.query("begin");
    const ids = {
      rfqId: fixture.rfqId,
      quoteId: fixture.quoteId,
      poId: fixture.poId,
      shipmentId: fixture.shipmentId,
      invoiceId: fixture.invoiceId,
    };
    await client.query(
      `delete from public.portal_customer_notifications
        where (payload->>'rfqId' = $1 or payload->>'rfq_id' = $1
            or payload->>'poId' = $2 or payload->>'invoiceId' = $3)
           or event_key like $4`,
      [String(ids.rfqId ?? -1), String(ids.poId ?? -1), String(ids.invoiceId ?? -1), `e2e-lifecycle-${fixture.nonce}%`],
    );
    await client.query(
      `delete from public.mkt_notification_queue
        where rfq_id=$1 or vendor_quote_id=$2 or purchase_order_id=$3`,
      [ids.rfqId ?? -1, ids.quoteId ?? -1, ids.poId ?? -1],
    );
    await client.query(
      `delete from public.activity_logs
        where mkt_rfq_id=$1 or mkt_vendor_quote_id=$2 or mkt_purchase_order_id=$3`,
      [ids.rfqId ?? -1, ids.quoteId ?? -1, ids.poId ?? -1],
    );
    if (ids.invoiceId) await client.query("delete from public.payments where ref_kind='sales' and ref_id=$1", [ids.invoiceId]);
    if (ids.invoiceId) await client.query("delete from public.sales_documents where id=$1", [ids.invoiceId]);

    const shipmentIds = ids.poId
      ? (await client.query("select id from public.mkt_po_shipments where po_id=$1", [ids.poId])).rows.map((row) => Number(row.id))
      : [];
    if (shipmentIds.length) {
      const shipmentIdList = shipmentIds;
      const receiptIds = (await client.query(
        "select id from public.mkt_po_goods_receipts where shipment_id=any($1::int[])",
        [shipmentIdList],
      )).rows.map((row) => Number(row.id));
      if (receiptIds.length) await client.query("delete from public.mkt_po_goods_receipt_items where goods_receipt_id=any($1::int[])", [receiptIds]);
      await client.query("delete from public.mkt_po_goods_receipts where shipment_id=any($1::int[])", [shipmentIdList]);
      await client.query("delete from public.mkt_po_shipment_events where shipment_id=any($1::int[])", [shipmentIdList]);
      await client.query("delete from public.mkt_po_shipment_items where shipment_id=any($1::int[])", [shipmentIdList]);
      await client.query("delete from public.mkt_po_shipments where id=any($1::int[])", [shipmentIdList]);
    }
    if (ids.poId) {
      await client.query("delete from public.mkt_purchase_order_lines where po_id=$1", [ids.poId]);
      await client.query("delete from public.mkt_purchase_orders where id=$1", [ids.poId]);
    }
    if (ids.quoteId) await client.query("delete from public.mkt_vendor_quote_lines where quote_id=$1", [ids.quoteId]);
    if (ids.rfqId) await client.query("delete from public.mkt_rfq_approvals where rfq_id=$1", [ids.rfqId]);
    if (ids.quoteId) await client.query("delete from public.mkt_vendor_quotes where id=$1", [ids.quoteId]);
    if (ids.rfqId) await client.query("delete from public.mkt_rfq_lines where rfq_id=$1", [ids.rfqId]);
    if (ids.rfqId) await client.query("delete from public.mkt_rfqs where id=$1", [ids.rfqId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error(`[notification-lifecycle-e2e] cleanup failed: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
}

async function assertRowsForEvent(eventKeys, customerId, adminId, expected) {
  const rows = await fixtureNotifications({ eventKeys, customerId, adminId });
  for (const expectation of expected) notificationFor(rows, expectation);
  return rows;
}

async function main() {
  if (process.env.APP_ENV === "production" || process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1") {
    fail("development-only check refused production environment.");
  }
  if (databaseEnvironment !== "development" || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") {
    fail(`expected SUPABASE_DATABASE_URL_DEV development database, got ${databaseConnectionSource ?? "none"}.`);
  }

  const baseUrl = previewApiUrl();
  const anonymous = new PortalClient(baseUrl, "anonymous");
  const health = await anonymous.request("/api/healthz");
  assert(health?.status === "ok", "development API health is not ok.");
  assert(health?.appEnv === "development", "API is not in development mode.");
  assert(health?.databaseEnvironment === "development", "API is not on development database.");

  const customerClient = new PortalClient(baseUrl, "customer");
  const adminClient = new PortalClient(baseUrl, "admin");
  const customer = await customerClient.devLogin("customer");
  const admin = await adminClient.devLogin("admin");
  const nonce = `${Date.now()}-${process.pid}`;
  let fixture;
  const eventKeys = [];

  try {
    fixture = await createFixture({ customerId: Number(customer.id), nonce });
    const key = (name) => `e2e-lifecycle-${name}-${nonce}`;
    const remember = (value) => {
      eventKeys.push(value);
      return value;
    };

    const rfqSubmittedKey = remember(`rfq-${fixture.rfqId}-submitted`);
    await customerClient.request(`/api/mkt/portal/rfqs/${fixture.rfqId}/submit`, { method: "POST" });
    await assertRowsForEvent([rfqSubmittedKey], customer.id, admin.id, [{
      eventKey: rfqSubmittedKey,
      recipientId: admin.id,
      audience: "admin",
      type: "rfq_submitted",
      resourceType: "rfq",
      resourceId: fixture.rfqId,
      link: "/admin?tab=service-operations",
    }]);

    await anonymous.request(`/api/vendor-quote/${fixture.quoteToken}`);
    const quoteSubmittedKey = remember(`quote-submitted:${fixture.quoteId}:1`);
    await anonymous.request(`/api/vendor-quote/${fixture.quoteToken}/submit`, {
      method: "POST",
      body: {
        notes: `Disposable quote ${nonce}`,
        paymentTerms: "NET 30",
        quotationDate: new Date().toISOString().slice(0, 10),
        lines: [{
          rfqLineId: fixture.rfqLineId,
          offeredUnitPrice: 50,
          offeredQty: 2,
          leadTimeDays: 3,
          stockStatus: "available",
          currency: "IDR",
        }],
      },
    });
    await assertRowsForEvent([quoteSubmittedKey], customer.id, admin.id, [{
      eventKey: quoteSubmittedKey,
      recipientId: admin.id,
      audience: "admin",
      type: "vendor_quote_submitted",
      resourceType: "rfq",
      resourceId: fixture.rfqId,
      link: "/admin?tab=service-operations",
    }]);

    const reviewKey = remember(`rfq-${fixture.rfqId}-customer-review-${fixture.quoteId}`);
    await adminClient.request(`/api/mkt/admin/rfqs/${fixture.rfqId}/send-to-customer`, {
      method: "POST",
      body: { quoteId: fixture.quoteId, notes: "Disposable E2E review" },
    });
    await assertRowsForEvent([reviewKey], customer.id, admin.id, [
      { eventKey: reviewKey, recipientId: customer.id, audience: "customer", type: "rfq_customer_review", resourceType: "rfq", resourceId: fixture.rfqId, link: `/marketplace/my-rfqs/${fixture.rfqId}` },
      { eventKey: reviewKey, recipientId: admin.id, audience: "admin", type: "rfq_customer_review", resourceType: "rfq", resourceId: fixture.rfqId, link: "/admin?tab=service-operations" },
    ]);

    const poKey = remember(`rfq-${fixture.rfqId}-po-created`);
    const approval = await customerClient.request(`/api/mkt/portal/rfqs/${fixture.rfqId}/customer-approve`, {
      method: "POST",
      headers: { "Idempotency-Key": key("approve") },
      body: {},
    });
    fixture.poId = Number(approval?.data?.poId);
    assert(fixture.poId, "customer approval did not return a PO id.");
    await assertRowsForEvent([poKey], customer.id, admin.id, [
      { eventKey: poKey, recipientId: customer.id, audience: "customer", type: "purchase_order_created", resourceType: "purchase_order", resourceId: fixture.poId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
      { eventKey: poKey, recipientId: admin.id, audience: "admin", type: "purchase_order_created", resourceType: "purchase_order", resourceId: fixture.poId, link: "/admin?tab=service-operations" },
    ]);

    const poLine = await query("select id, qty from public.mkt_purchase_order_lines where po_id=$1 limit 1", [fixture.poId]);
    fixture.poLineId = Number(poLine.rows[0]?.id);
    assert(fixture.poLineId, "fixture PO has no line.");

    const shipmentKey = remember(`shipment-created:${fixture.poId}`);
    const shipment = await customerClient.request(`/api/mkt/portal/purchase-orders/${fixture.poId}/shipment-selection`, {
      method: "POST",
      headers: { "Idempotency-Key": key("shipment") },
      body: {
        shipmentType: "trucking",
        carrierName: "Disposable Development Carrier",
        trackingNumber: `E2E-${nonce}`,
        origin: "Development origin",
        destination: "Development destination",
        items: [{ poLineId: fixture.poLineId, qty: Number(poLine.rows[0].qty) }],
      },
    });
    fixture.shipmentId = Number(shipment?.data?.id);
    assert(fixture.shipmentId, "shipment creation did not return an id.");
    const shipmentOwnership = await query(
      `select r.portal_customer_id, r.buyer_email, po.id as po_id, s.id as shipment_id
         from public.mkt_po_shipments s
         join public.mkt_purchase_orders po on po.id=s.po_id
         join public.mkt_rfqs r on r.id=po.rfq_id
        where s.id=$1`,
      [fixture.shipmentId],
    );
    assert(
      Number(shipmentOwnership.rows[0]?.portal_customer_id) === Number(customer.id),
      `shipment ownership lost customer ${customer.id}: ${JSON.stringify(shipmentOwnership.rows[0] ?? null)}`,
    );
    await assertRowsForEvent([shipmentKey], customer.id, admin.id, [
      { eventKey: shipmentKey, recipientId: customer.id, audience: "customer", type: "shipment_created", resourceType: "shipment", resourceId: fixture.shipmentId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
      { eventKey: shipmentKey, recipientId: admin.id, audience: "admin", type: "shipment_created", resourceType: "shipment", resourceId: fixture.shipmentId, link: "/admin?tab=service-operations" },
    ]);

    for (const eventType of ["packing", "loaded", "departed", "arrived"]) {
      const eventKey = remember(`shipment-event:${fixture.shipmentId}:${key(eventType)}`);
      await adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/events`, {
        method: "POST",
        headers: { "Idempotency-Key": key(eventType) },
        body: { eventType, note: `Disposable ${eventType}` },
      });
      await assertRowsForEvent([eventKey], customer.id, admin.id, [
        { eventKey, recipientId: customer.id, audience: "customer", type: `shipment_${eventType}`, resourceType: "shipment", resourceId: fixture.shipmentId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
        { eventKey, recipientId: admin.id, audience: "admin", type: `shipment_${eventType}`, resourceType: "shipment", resourceId: fixture.shipmentId, link: "/admin?tab=service-operations" },
      ]);
    }

    const podKey = remember(`shipment-pod:${fixture.shipmentId}:${key("pod")}`);
    await adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/pod`, {
      method: "POST",
      headers: { "Idempotency-Key": key("pod") },
      body: { photoUrl: `/development-only/${nonce}/pod.jpg`, note: "Disposable POD" },
    });
    await assertRowsForEvent([podKey], customer.id, admin.id, [
      { eventKey: podKey, recipientId: customer.id, audience: "customer", type: "shipment_pod_submitted", resourceType: "shipment", resourceId: fixture.shipmentId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
      { eventKey: podKey, recipientId: admin.id, audience: "admin", type: "shipment_pod_submitted", resourceType: "shipment", resourceId: fixture.shipmentId, link: "/admin?tab=service-operations" },
    ]);

    const shipmentItem = await query("select id, qty from public.mkt_po_shipment_items where shipment_id=$1 limit 1", [fixture.shipmentId]);
    fixture.shipmentItemId = Number(shipmentItem.rows[0]?.id);
    assert(fixture.shipmentItemId, "fixture shipment has no item.");
    const receiptKey = remember(`goods-receipt:${fixture.shipmentId}:${key("receipt")}`);
    await adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/goods-receipts`, {
      method: "POST",
      headers: { "Idempotency-Key": key("receipt") },
      body: {
        receiptType: "full",
        inspectionStatus: "passed",
        receivedBy: "Disposable E2E Admin",
        items: [{ shipmentItemId: fixture.shipmentItemId, receivedQty: Number(shipmentItem.rows[0].qty), acceptedQty: Number(shipmentItem.rows[0].qty), rejectedQty: 0 }],
      },
    });
    await assertRowsForEvent([receiptKey], customer.id, admin.id, [
      { eventKey: receiptKey, recipientId: customer.id, audience: "customer", type: "goods_receipt_created", resourceType: "shipment", resourceId: fixture.shipmentId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
      { eventKey: receiptKey, recipientId: admin.id, audience: "admin", type: "goods_receipt_created", resourceType: "shipment", resourceId: fixture.shipmentId, link: "/admin?tab=service-operations" },
    ]);

    const completedKey = remember(`po:${fixture.poId}:completed`);
    await assertRowsForEvent([completedKey], customer.id, admin.id, [
      { eventKey: completedKey, recipientId: customer.id, audience: "customer", type: "po_completed", resourceType: "purchase_order", resourceId: fixture.poId, link: `/marketplace/my-purchase-orders/${fixture.poId}` },
      { eventKey: completedKey, recipientId: admin.id, audience: "admin", type: "po_completed", resourceType: "purchase_order", resourceId: fixture.poId, link: "/admin?tab=service-operations" },
    ]);

    const invoiceKey = remember(`sales-invoice:${fixture.invoiceId}:invoiced`);
    await adminClient.request(`/api/portal/admin/invoices/${fixture.invoiceId}/action`, {
      method: "POST",
      body: { action: "mark_invoiced" },
    });
    await assertRowsForEvent([invoiceKey], customer.id, admin.id, [
      { eventKey: invoiceKey, recipientId: customer.id, audience: "customer", type: "sales_invoice_issued", resourceType: "invoice", resourceId: fixture.invoiceId, link: "/portal-invoice" },
      { eventKey: invoiceKey, recipientId: admin.id, audience: "admin", type: "sales_invoice_issued", resourceType: "invoice", resourceId: fixture.invoiceId, link: "/admin?tab=service-operations" },
    ]);

    const payment = await customerClient.request(`/api/portal/me/invoices/${fixture.invoiceId}/payments`, {
      method: "POST",
      headers: { "Idempotency-Key": key("payment") },
      body: { amount: 100, paymentMethod: "portal_manual" },
    });
    fixture.paymentId = Number(payment?.payment?.id);
    assert(fixture.paymentId, "payment submission did not return an id.");
    const paymentSubmittedKey = remember(`sales-payment:${fixture.paymentId}:submitted`);
    await assertRowsForEvent([paymentSubmittedKey], customer.id, admin.id, [{
      eventKey: paymentSubmittedKey,
      recipientId: admin.id,
      audience: "admin",
      type: "sales_payment_submitted",
      resourceType: "payment",
      resourceId: fixture.paymentId,
      link: "/admin?tab=service-operations",
    }]);

    const paymentPaidKey = remember(`sales-payment:${fixture.paymentId}:paid`);
    await adminClient.request(`/api/portal/admin/payments/${fixture.paymentId}/status`, {
      method: "POST",
      body: { status: "paid" },
    });
    await assertRowsForEvent([paymentPaidKey], customer.id, admin.id, [
      { eventKey: paymentPaidKey, recipientId: customer.id, audience: "customer", type: "sales_payment_status_changed", resourceType: "payment", resourceId: fixture.paymentId, link: "/portal-invoice" },
      { eventKey: paymentPaidKey, recipientId: admin.id, audience: "admin", type: "sales_payment_status_changed", resourceType: "payment", resourceId: fixture.paymentId, link: "/admin?tab=service-operations" },
    ]);

    const customerInbox = await customerClient.request("/api/portal/notifications");
    const customerItem = (customerInbox?.items ?? []).find((item) => item.eventKey === paymentPaidKey);
    assert(customerItem && customerItem.isRead === false, "customer payment notification did not appear unread.");
    await customerClient.request(`/api/portal/notifications/${customerItem.id}/read`, { method: "POST", expected: [204] });
    const afterCustomerRead = await fixtureNotifications({ eventKeys: [paymentPaidKey], customerId: customer.id, adminId: admin.id });
    assert(afterCustomerRead.find((row) => row.event_key === paymentPaidKey && Number(row.portal_customer_id) === Number(customer.id))?.is_read === true, "customer read mutation did not persist.");

    const adminInbox = await adminClient.request("/api/portal/admin/service-operations/notifications?limit=50");
    const adminItem = (adminInbox?.data ?? []).find((item) => item.event_key === paymentPaidKey);
    assert(adminItem && adminItem.read_at == null, "admin payment notification did not appear unread.");
    await adminClient.request(`/api/portal/admin/service-operations/notifications/${adminItem.id}/read`, { method: "POST", expected: [204] });
    const afterAdminRead = await fixtureNotifications({ eventKeys: [paymentPaidKey], customerId: customer.id, adminId: admin.id });
    assert(afterAdminRead.find((row) => row.event_key === paymentPaidKey && Number(row.portal_customer_id) === Number(admin.id))?.is_read === true, "admin read mutation did not persist.");

    const beforeReplay = await fixtureNotifications({ eventKeys, customerId: customer.id, adminId: admin.id });
    const replayRequests = [
      customerClient.request(`/api/mkt/portal/purchase-orders/${fixture.poId}/shipment-selection`, {
        method: "POST",
        headers: { "Idempotency-Key": key("shipment") },
        body: { shipmentType: "trucking", items: [{ poLineId: fixture.poLineId, qty: Number(poLine.rows[0].qty) }] },
      }),
      ...["packing", "loaded", "departed", "arrived"].map((eventType) => adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/events`, {
        method: "POST",
        headers: { "Idempotency-Key": key(eventType) },
        body: { eventType },
      })),
      adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/pod`, {
        method: "POST",
        headers: { "Idempotency-Key": key("pod") },
        body: { photoUrl: `/development-only/${nonce}/pod.jpg` },
      }),
      adminClient.request(`/api/mkt/admin/shipments/${fixture.shipmentId}/goods-receipts`, {
        method: "POST",
        headers: { "Idempotency-Key": key("receipt") },
        body: { receiptType: "full", items: [{ shipmentItemId: fixture.shipmentItemId, receivedQty: Number(shipmentItem.rows[0].qty), acceptedQty: Number(shipmentItem.rows[0].qty), rejectedQty: 0 }] },
      }),
      adminClient.request(`/api/portal/admin/invoices/${fixture.invoiceId}/action`, { method: "POST", body: { action: "mark_invoiced" } }),
      customerClient.request(`/api/portal/me/invoices/${fixture.invoiceId}/payments`, {
        method: "POST",
        headers: { "Idempotency-Key": key("payment") },
        body: { amount: 100, paymentMethod: "portal_manual" },
      }),
      adminClient.request(`/api/portal/admin/payments/${fixture.paymentId}/status`, { method: "POST", body: { status: "paid" } }),
    ];
    const replayed = await Promise.all(replayRequests);
    assert(replayed[0]?.data?.alreadyProcessed === true, "shipment replay was not idempotent.");
    assert(replayed[1]?.data?.alreadyProcessed === true, "packing replay was not idempotent.");
    assert(replayed[5]?.data?.alreadyProcessed === true, "POD replay was not idempotent.");
    assert(replayed[6]?.data?.alreadyProcessed === true, "goods receipt replay was not idempotent.");
    assert(replayed[8]?.replayed === true, "payment replay was not idempotent.");

    const afterReplay = await fixtureNotifications({ eventKeys, customerId: customer.id, adminId: admin.id });
    assert(afterReplay.length === beforeReplay.length, `replay created duplicate notifications: ${beforeReplay.length} -> ${afterReplay.length}.`);
    assert(new Set(afterReplay.map((row) => `${row.portal_customer_id}:${row.event_key}`)).size === afterReplay.length, "fixture notification recipient/event pairs are not unique.");
    console.log(`[notification-lifecycle-e2e] passed: ${afterReplay.length} scoped notifications across RFQ, quote, PO, shipment/POD/goods receipt, invoice, and payment; read/unread and replay dedup verified.`);
  } finally {
    await cleanupFixture(fixture);
  }
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase().catch(() => {});
  });