#!/usr/bin/env node

/**
 * Development-only marketplace operations contract test.
 * Run with:
 *   node server/load-secrets.mjs node scripts/marketplace-operations-e2e.mjs
 */

import { createSession } from "../server/session.mjs";
import { pool, query, closeDatabase } from "../server/db.mjs";

const BASE_URL = process.env.PORTAL_OPERATIONS_E2E_BASE_URL ?? "http://127.0.0.1:18444";
const USERS = {
  admin: { id: 1, email: "dev-admin@dev.local", role: "admin" },
  customer: { id: 3, email: "dev-customer@dev.local", role: "customer" },
  otherCustomer: { id: 4, email: "testaudit@example.com", role: "customer" },
  vendor: { id: 2, email: "dev-vendor@dev.local", role: "vendor" },
};

function fail(message) {
  throw new Error(`[marketplace-operations-e2e] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

class Client {
  constructor(user, label) {
    this.label = label;
    this.cookie = user ? `portal_session=${createSession(user)}` : "";
  }

  async request(path, { method = "GET", body, expected = [200], headers = {} } = {}) {
    const requestHeaders = {
      Accept: "application/json",
      ...headers,
    };
    if (this.cookie) requestHeaders.Cookie = this.cookie;
    let requestBody;
    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      fail(`${this.label} ${method} ${path} returned non-JSON.`);
    }
    if (!expected.includes(response.status)) {
      fail(
        `${this.label} ${method} ${path} returned ${response.status}; ` +
        `expected ${expected.join("/")}: ${payload?.message ?? raw}`,
      );
    }
    return payload;
  }
}

async function createFixture({ nonce, customerId }) {
  const client = await pool.connect();
  const fixture = {
    nonce,
    rfqId: null,
    rfqLineId: null,
    quoteId: null,
    quoteToken: `marketplace-operations-e2e-${nonce}`,
    poId: null,
  };
  try {
    await client.query("begin");
    const vendor = (await client.query(
      "select id from public.suppliers order by id limit 1",
    )).rows[0];
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
        `E2E-MARKETPLACE-${nonce}`,
        "Disposable Marketplace Customer",
        "dev-customer@dev.local",
        "E2E Marketplace Company",
        "Development-only destination",
        `Disposable marketplace operations fixture ${nonce}`,
        customerId,
      ],
    );
    fixture.rfqId = Number(rfq.rows[0].id);

    const line = await client.query(
      `insert into public.mkt_rfq_lines
        (rfq_id, item_name, item_unit, requested_qty, notes, sort_order)
       values ($1,'Disposable Marketplace Cargo','box',2,'development fixture',0)
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
      [fixture.rfqId, vendor.id, fixture.quoteToken, `E2E-MKT-QT-${nonce}`],
    );
    fixture.quoteId = Number(quote.rows[0].id);
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
  if (!fixture?.rfqId) return;
  const client = await pool.connect();
  try {
    await client.query("begin");
    const shipmentIds = fixture.poId
      ? (await client.query(
        "select id from public.mkt_po_shipments where po_id=$1",
        [fixture.poId],
      )).rows.map((row) => Number(row.id))
      : [];
    if (shipmentIds.length) {
      const receiptIds = (await client.query(
        "select id from public.mkt_po_goods_receipts where shipment_id=any($1::int[])",
        [shipmentIds],
      )).rows.map((row) => Number(row.id));
      if (receiptIds.length) {
        await client.query(
          "delete from public.mkt_po_goods_receipt_items where goods_receipt_id=any($1::int[])",
          [receiptIds],
        );
      }
      await client.query(
        "delete from public.mkt_po_goods_receipts where shipment_id=any($1::int[])",
        [shipmentIds],
      );
      await client.query(
        "delete from public.mkt_po_shipment_events where shipment_id=any($1::int[])",
        [shipmentIds],
      );
      await client.query(
        "delete from public.mkt_po_shipment_items where shipment_id=any($1::int[])",
        [shipmentIds],
      );
      await client.query(
        "delete from public.mkt_po_shipments where id=any($1::int[])",
        [shipmentIds],
      );
    }
    if (fixture.poId) {
      await client.query("delete from public.mkt_purchase_order_lines where po_id=$1", [fixture.poId]);
      await client.query("delete from public.mkt_purchase_orders where id=$1", [fixture.poId]);
    }
    await client.query(
      `delete from public.portal_customer_notifications
        where payload->>'rfqId'=$1 or payload->>'rfq_id'=$1
           or payload->>'poId'=$2`,
      [String(fixture.rfqId), String(fixture.poId ?? -1)],
    );
    await client.query(
      "delete from public.mkt_notification_queue where rfq_id=$1 or vendor_quote_id=$2 or purchase_order_id=$3",
      [fixture.rfqId, fixture.quoteId ?? -1, fixture.poId ?? -1],
    );
    await client.query(
      "delete from public.activity_logs where mkt_rfq_id=$1 or mkt_vendor_quote_id=$2 or mkt_purchase_order_id=$3",
      [fixture.rfqId, fixture.quoteId ?? -1, fixture.poId ?? -1],
    );
    if (fixture.quoteId) {
      await client.query("delete from public.mkt_vendor_quote_lines where quote_id=$1", [fixture.quoteId]);
      await client.query("delete from public.mkt_vendor_quotes where id=$1", [fixture.quoteId]);
    }
    await client.query("delete from public.mkt_rfq_approvals where rfq_id=$1", [fixture.rfqId]);
    await client.query("delete from public.mkt_rfq_lines where rfq_id=$1", [fixture.rfqId]);
    await client.query("delete from public.mkt_rfqs where id=$1", [fixture.rfqId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error(`[marketplace-operations-e2e] fixture cleanup failed: ${error.message}`);
  } finally {
    client.release();
  }
}

async function main() {
  assert(
    process.env.APP_ENV !== "production" &&
      process.env.NODE_ENV !== "production" &&
      process.env.REPLIT_DEPLOYMENT !== "1",
    "this test is development-only.",
  );

  const admin = new Client(USERS.admin, "admin");
  const customer = new Client(USERS.customer, "customer");
  const otherCustomer = new Client(USERS.otherCustomer, "other-customer");
  const vendor = new Client(USERS.vendor, "vendor");
  const health = await admin.request("/api/healthz");
  assert(health?.databaseEnvironment === "development", "API is not connected to development.");

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let fixture = null;
  let poId = null;
  try {
    const eligible = await query(
      `select po.id
         from public.mkt_purchase_orders po
         join public.mkt_rfqs r on r.id=po.rfq_id
        where po.status::text = any($1::text[])
          and r.portal_customer_id=$2
        order by po.id
        limit 1`,
      [["issued", "vendor_accepted", "production", "ready_to_ship"], USERS.customer.id],
    );
    poId = Number(eligible.rows[0]?.id);
    if (!poId) {
      fixture = await createFixture({ nonce: suffix, customerId: USERS.customer.id });
      const anonymous = new Client(null, "anonymous");
      await customer.request(`/api/mkt/portal/rfqs/${fixture.rfqId}/submit`, { method: "POST" });
      await anonymous.request(`/api/vendor-quote/${fixture.quoteToken}`);
      await anonymous.request(`/api/vendor-quote/${fixture.quoteToken}/submit`, {
        method: "POST",
        body: {
          notes: `Disposable marketplace quote ${suffix}`,
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
      await admin.request(`/api/mkt/admin/rfqs/${fixture.rfqId}/send-to-customer`, {
        method: "POST",
        body: { quoteId: fixture.quoteId, notes: "Disposable marketplace operations fixture" },
      });
      const approval = await customer.request(`/api/mkt/portal/rfqs/${fixture.rfqId}/customer-approve`, {
        method: "POST",
        headers: { "Idempotency-Key": `marketplace-operations-e2e-approve-${suffix}` },
        body: {},
      });
      poId = Number(approval?.data?.poId);
      fixture.poId = poId;
      assert(poId, "fixture customer approval did not create a PO.");
    }

    const lines = (await admin.request(`/api/mkt/admin/purchase-orders/${poId}/lines`)).data;
    assert(Array.isArray(lines) && lines.length > 0, "development PO has no line items.");

  const idempotencyKey = `marketplace-operations-e2e-${suffix}`;
  const shipmentBody = {
    shipmentType: "trucking",
    carrierName: "E2E Carrier",
    trackingNumber: `E2E-${suffix}`,
    items: lines.map((line, index) => ({
      poLineId: line.id,
      lineNumber: index + 1,
      qty: Number(line.qty),
      uom: line.unit,
    })),
  };
  const created = await admin.request(`/api/mkt/admin/purchase-orders/${poId}/shipments`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: shipmentBody,
  });
  const shipment = created.data.shipment;
  assert(shipment?.id && shipment.shipmentStatus === "planned", "shipment was not created as planned.");

  const duplicateShipment = await admin.request(`/api/mkt/admin/purchase-orders/${poId}/shipments`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: shipmentBody,
  });
  assert(
    duplicateShipment.data.alreadyProcessed === true &&
      duplicateShipment.data.shipment.id === shipment.id,
    "shipment idempotency failed.",
  );

  await otherCustomer.request(`/api/mkt/portal/purchase-orders/${poId}/shipments`, { expected: [404] });
  await otherCustomer.request(`/api/mkt/portal/shipments/${shipment.id}/timeline`, { expected: [404] });
  await otherCustomer.request(`/api/mkt/portal/shipments/${shipment.id}/pod`, { expected: [404] });
  await otherCustomer.request(`/api/mkt/portal/shipments/${shipment.id}/goods-receipts`, { expected: [404] });
  await vendor.request(`/api/mkt/portal/purchase-orders/${poId}/shipments`, { expected: [403] });
  const ownerShipments = await customer.request(`/api/mkt/portal/purchase-orders/${poId}/shipments`);
  assert(ownerShipments.data.some((item) => item.id === shipment.id), "owner cannot read shipment.");

  await admin.request(`/api/mkt/admin/shipments/${shipment.id}/events`, {
    method: "POST",
    expected: [409],
    headers: { "Idempotency-Key": `${idempotencyKey}-invalid` },
    body: { eventType: "delivered" },
  });

  const event = (eventType, key, expected = [200]) =>
    admin.request(`/api/mkt/admin/shipments/${shipment.id}/events`, {
      method: "POST",
      expected,
      headers: { "Idempotency-Key": key },
      body: { eventType },
    });

  await event("packing", `${idempotencyKey}-packing`);
  const concurrentLoaded = await Promise.allSettled([
    event("loaded", `${idempotencyKey}-loaded-a`),
    event("loaded", `${idempotencyKey}-loaded-b`),
  ]);
  assert(
    concurrentLoaded.filter((result) => result.status === "fulfilled").length === 1,
    "concurrent transition did not have exactly one winner.",
  );
  assert(
    concurrentLoaded.filter((result) => result.status === "rejected").length === 1 &&
      concurrentLoaded.find((result) => result.status === "rejected")?.reason?.message.includes("409"),
    "stale concurrent transition was not rejected with 409.",
  );
  await event("departed", `${idempotencyKey}-departed`);
  await event("arrived", `${idempotencyKey}-arrived`);

  const podBody = {
    photoUrl: `https://development.invalid/${shipment.shipmentNumber}.pdf`,
    note: "E2E POD",
  };
  const pod = await admin.request(`/api/mkt/admin/shipments/${shipment.id}/pod`, {
    method: "POST",
    headers: { "Idempotency-Key": `${idempotencyKey}-pod` },
    body: podBody,
  });
  assert(pod.data.pod.available === true, "POD was not stored.");
  const duplicatePod = await admin.request(`/api/mkt/admin/shipments/${shipment.id}/pod`, {
    method: "POST",
    headers: { "Idempotency-Key": `${idempotencyKey}-pod` },
    body: podBody,
  });
  assert(duplicatePod.data.alreadyProcessed === true, "POD idempotency failed.");

  const detail = (await admin.request(`/api/mkt/admin/shipments/${shipment.id}`)).data;
  const receiptBody = {
    receiptType: "full",
    inspectionStatus: "passed",
    receivedBy: "E2E Receiver",
    items: detail.items.map((item) => ({
      shipmentItemId: item.id,
      receivedQty: Number(item.qty),
      acceptedQty: Number(item.qty),
      rejectedQty: 0,
      condition: "GOOD",
    })),
  };
  const receipt = await admin.request(`/api/mkt/admin/shipments/${shipment.id}/goods-receipts`, {
    method: "POST",
    headers: { "Idempotency-Key": `${idempotencyKey}-receipt` },
    body: receiptBody,
  });
  assert(receipt.data.receipt?.receiptType === "full", "goods receipt was not stored.");
  const duplicateReceipt = await admin.request(`/api/mkt/admin/shipments/${shipment.id}/goods-receipts`, {
    method: "POST",
    headers: { "Idempotency-Key": `${idempotencyKey}-receipt` },
    body: receiptBody,
  });
  assert(duplicateReceipt.data.alreadyProcessed === true, "goods receipt idempotency failed.");

  const finalPo = (await query(
    "select status from public.mkt_purchase_orders where id=$1",
    [poId],
  )).rows[0];
  assert(finalPo?.status === "completed", `PO did not auto-complete: ${finalPo?.status ?? "missing"}.`);

  const timeline = await customer.request(`/api/mkt/portal/shipments/${shipment.id}/timeline`);
  const customerPod = await customer.request(`/api/mkt/portal/shipments/${shipment.id}/pod`);
  const customerReceipts = await customer.request(`/api/mkt/portal/shipments/${shipment.id}/goods-receipts`);
  assert(timeline.data.some((item) => item.eventType === "pod_submitted"), "timeline is missing POD.");
  assert(customerPod.data.url === podBody.photoUrl, "customer POD response is incorrect.");
  assert(
    customerReceipts.data.some((item) => item.id === receipt.data.receipt.id),
    "customer receipt response is incorrect.",
  );
  const unknownRoute = await admin.request(
    `/api/mkt/admin/shipments/${shipment.id}/not-a-route`,
    { expected: [404] },
  );
  assert(unknownRoute?.service === "customer-portal-api", "unknown marketplace route escaped local 404.");

  console.log(
    `[marketplace-operations-e2e] PASS: shipment, ownership, transition guard, ` +
    `idempotency, concurrent update, POD, goods receipt, auto-complete, and local route boundary.`,
  );
  } finally {
    await cleanupFixture(fixture);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase().catch(() => {}));