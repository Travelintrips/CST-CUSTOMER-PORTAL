import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  upload: vi.fn(),
  discard: vi.fn(),
  calls: [] as string[],
}));

vi.mock("../server/db.mjs", () => ({
  pool: { connect: m.connect },
  query: m.query,
}));

vi.mock("../server/storage.mjs", () => ({
  uploadMarketplacePod: m.upload,
  deleteMarketplacePod: m.discard,
  signedMarketplacePodUrl: vi.fn(),
  uploadMarketplacePaymentProof: vi.fn(),
  signedMarketplacePaymentProofUrl: vi.fn(),
  deleteMarketplacePaymentProof: vi.fn(),
}));

vi.mock("../server/notification-service.mjs", () => ({
  bestEffortNotificationWrite: vi.fn(),
  marketplaceNotificationDetails: vi.fn(),
  notifyAdmins: vi.fn(),
  notifyPortalCustomers: vi.fn(),
}));

vi.mock("../server/marketplace-payment-ocr.mjs", () => ({ extractPaymentAmountFromFile: vi.fn() }));
vi.mock("../server/paylabs-service.mjs", () => ({
  createMarketplacePaylabsLink: vi.fn(),
  getMarketplacePaylabsState: vi.fn(),
}));
vi.mock("../server/whatsapp-service.mjs", () => ({ getMarketplaceWhatsAppQueueStats: vi.fn() }));

import { handleAdminOperations } from "../server/marketplace-operations.mjs";

const staged = "marketplace-pod/po-11/shipment-21/synthetic-ci-file.png";
const body = { file: { arrayBuffer: async () => new ArrayBuffer(3) } };
const request = { method: "POST", headers: { "idempotency-key": "pr186-synthetic-ci-request" } };
const user = { id: 7, role: "super_admin", name: "Test Admin" };

const queryResponse = (sql: string) => {
  if (sql.includes("from public.mkt_po_shipments s")) return { rows: [{ id: 21, po_id: 11, shipment_status: "arrived" }] };
  if (sql.includes("from public.mkt_po_shipment_events")) return { rows: [] };
  throw new Error("UNEXPECTED_PREFLIGHT_QUERY");
};

function setupTx({ scenario }: { scenario: "denied-po" | "concurrent-replay" | "changed-state" }) {
  const client = {
    query: vi.fn(async (sql: string) => {
      const q = sql.toLowerCase();
      if (q === "begin read write" || q === "rollback" || q === "commit") { m.calls.push(q); return { rows: [] }; }
      if (q.includes("from public.mkt_purchase_orders po") && q.includes("for update of po")) {
        m.calls.push("lock-po");
        return { rows: scenario === "denied-po" ? [] : [{ id: 11 }] };
      }
      if (q.includes("from public.mkt_po_shipments s") && q.includes("for update of s")) {
        m.calls.push("lock-shipment");
        return { rows: [{ id: 21, po_id: 11, shipment_status: scenario === "changed-state" ? "cancelled" : "arrived" }] };
      }
      if (q.includes("from public.mkt_po_shipments s")) return queryResponse(sql);
      if (q.includes("from public.mkt_po_shipment_events")) {
        m.calls.push("check-replay-under-lock");
        return { rows: scenario === "concurrent-replay" ? [{
          id: 99, attachment_object_path: "marketplace-pod/po-11/shipment-21/original.png", created_at: new Date(),
        }] : [] };
      }
      throw new Error("UNEXPECTED_TX_QUERY " + q.slice(0, 80));
    }),
    release: vi.fn(),
  };
  m.connect.mockResolvedValue(client);
  return client;
}

async function post() {
  const sendJson = vi.fn();
  const response = {};
  const result = await handleAdminOperations({
    request, response, pathname: "/api/mkt/admin/shipments/21/pod",
    body, user, sendJson,
  });
  return { result, sendJson };
}

describe("POD storage staging outside cross-service PO lock", () => {
  beforeEach(() => {
    m.calls.length = 0;
    for (const fn of [m.query, m.connect, m.upload, m.discard]) fn.mockReset();
    m.query.mockImplementation(async (q: string) => { m.calls.push("preflight"); return queryResponse(q); });
    m.upload.mockImplementation(async () => { m.calls.push("remote-storage-upload"); return { path: staged }; });
    m.discard.mockImplementation(async () => { m.calls.push("delete-unused-pod"); });
  });

  it("stages outside the transaction and deletes the object when tenant-scoped PO lock fails", async () => {
    const client = setupTx({ scenario: "denied-po" });
    await expect(post()).rejects.toMatchObject({ statusCode: 404 });
    expect(m.calls.indexOf("remote-storage-upload")).toBeLessThan(m.calls.indexOf("lock-po"));
    expect(m.calls).toContain("rollback");
    expect(m.discard).toHaveBeenCalledWith({ poId: 11, shipmentId: 21, path: staged });
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("deletes only the second staged object on a concurrent idempotent replay", async () => {
    setupTx({ scenario: "concurrent-replay" });
    const { result, sendJson } = await post();
    expect(result).toBe(true);
    expect(sendJson).toHaveBeenCalledWith(expect.anything(), 200, expect.objectContaining({
      data: expect.objectContaining({ alreadyProcessed: true }),
    }));
    expect(m.calls.indexOf("remote-storage-upload")).toBeLessThan(m.calls.indexOf("lock-po"));
    expect(m.calls.indexOf("lock-po")).toBeLessThan(m.calls.indexOf("lock-shipment"));
    expect(m.discard).toHaveBeenCalledOnce();
  });

  it("cleans the staged file if status changes while upload is in flight", async () => {
    setupTx({ scenario: "changed-state" });
    await expect(post()).rejects.toMatchObject({ statusCode: 409 });
    expect(m.discard).toHaveBeenCalledOnce();
  });
});
