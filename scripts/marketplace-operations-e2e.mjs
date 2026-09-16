#!/usr/bin/env node

/**
 * Development-only marketplace operations contract test.
 * Run with:
 *   node server/load-secrets.mjs node scripts/marketplace-operations-e2e.mjs
 */

import { createSession } from "../server/session.mjs";
import { query, closeDatabase } from "../server/db.mjs";

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
    this.cookie = `portal_session=${createSession(user)}`;
  }

  async request(path, { method = "GET", body, expected = [200], headers = {} } = {}) {
    const requestHeaders = {
      Accept: "application/json",
      Cookie: this.cookie,
      ...headers,
    };
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

async function main() {
  assert(
    process.env.APP_ENV !== "production" &&
      process.env.NODE_ENV !== "production" &&
      process.env.REPLIT_DEPLOYMENT !== "1",
    "this test is development-only.",
  );

  const poId = 2;
  const admin = new Client(USERS.admin, "admin");
  const customer = new Client(USERS.customer, "customer");
  const otherCustomer = new Client(USERS.otherCustomer, "other-customer");
  const vendor = new Client(USERS.vendor, "vendor");
  const health = await admin.request("/api/healthz");
  assert(health?.databaseEnvironment === "development", "API is not connected to development.");

  const lines = (await admin.request(`/api/mkt/admin/purchase-orders/${poId}/lines`)).data;
  assert(Array.isArray(lines) && lines.length > 0, "development PO has no line items.");

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase().catch(() => {}));