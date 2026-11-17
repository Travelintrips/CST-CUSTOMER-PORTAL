import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  reconcileOneDevVendorWaGatewayReceipt,
  DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL,
} from "../server/dev-vendor-wa-receipt.mjs";
import { CST_GATEWAY_URL } from "../server/dev-vendor-wa-gateway.mjs";

const env = {
  APP_ENV: "development", NODE_ENV: "test",
  CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV: "ai-core",
};
const messageId = "c1e4fd57-90ea-4ee3-99fe-933e0f2c0c08";
const token = "synthetic-customer-portal-only-token";
const sentAt = "2026-11-17T09:49:45.769Z";
const receipt = {
  messageId, clientId: "customer-portal", companyId: "1", deviceId: "ai-core",
  status: "sent", sentAt, deliveredAt: null, readAt: null,
};
const initial = {
  queue_id: 96, queue_status: "queued", attempt_count: 1, sent_at: null,
  event_type: "rfq_vendor_invited", channel: "whatsapp",
  recipient_type: "vendor", recipient_id: 39, vendor_id: 39,
  rfq_company_id: 1, supplier_company_id: 1,
  gateway_message_id: messageId, gateway_device_id: null,
};

function makeDb(overrides: Record<string, unknown> = {}) {
  const row = { ...initial, ...overrides };
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  const db = vi.fn(async (sql: string, values: unknown[]) => {
    calls.push({ sql, values });
    if (/^select/i.test(sql)) return { rows: [row] };
    if (sql === DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL) {
      if (row.queue_status !== "queued" || row.sent_at != null
        || row.gateway_message_id !== values[1]) return { rows: [] };
      row.queue_status = "sent";
      row.sent_at = values[2];
      return { rows: [{ id: 96, status: "sent", attempt_count: 1, sent_at: values[2] }] };
    }
    throw Error("unexpected test DB operation");
  });
  return { db, calls, row };
}
function params(h: ReturnType<typeof makeDb>, overrides: Record<string, unknown> = {}) {
  return {
    queueId: 96, rfqId: 25, quoteId: 20, env, db: h.db,
    resolveToken: async () => token,
    fetchFn: vi.fn(async () => ({ ok: true, json: async () => ({ ...receipt }) })),
    ...overrides,
  };
}

describe("Customer Portal DEV WA Gateway receipt reconciliation (NO outgoing POST)", () => {
  it("records verified SENT exactly once, retaining original message id and attempt count", async () => {
    const h = makeDb();
    const p = params(h);
    const result = await reconcileOneDevVendorWaGatewayReceipt(p);
    expect(result).toEqual({
      queueId: 96, status: "sent", providerStatus: "sent",
      updated: true, messageId,
    });
    expect(h.row.queue_status).toBe("sent");
    expect(h.row.sent_at).toBe(sentAt);
    expect(h.calls.filter(x => x.sql === DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL)).toHaveLength(1);
    expect(h.calls.at(-1)?.values).toEqual([96, messageId, sentAt, "sent", null, null]);
    expect(p.fetchFn).toHaveBeenCalledTimes(1);
    const [url, options] = (p.fetchFn as any).mock.calls[0] as [string, any];
    expect(url).toBe(CST_GATEWAY_URL + "/v1/messages/" + messageId);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer " + token);
    expect(JSON.stringify(result)).not.toContain(token);
  });

  it("does not mark queued/processing as sent without an actual provider sentAt", async () => {
    for (const status of ["queued", "processing", "retrying"]) {
      const h = makeDb();
      const result = await reconcileOneDevVendorWaGatewayReceipt(params(h, {
        fetchFn: async () => ({ ok: true, json: async () => ({ ...receipt, status, sentAt: null }) }),
      }));
      expect(result).toMatchObject({ updated: false, status: "awaiting_provider_sent", providerStatus: status });
      expect(h.calls.filter(x => x.sql === DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL)).toHaveLength(0);
    }
  });

  it("rejects another application's provider receipt even when message/device are correct", async () => {
    const h = makeDb();
    for (const forged of [
      { ...receipt, clientId: "tenant-pos" },
      { ...receipt, companyId: "sky" },
      { ...receipt, deviceId: "tenant-pos" },
      { ...receipt, messageId: "123e4567-e89b-12d3-a456-426614174000" },
    ]) {
      await expect(reconcileOneDevVendorWaGatewayReceipt(params(h, {
        fetchFn: async () => ({ ok: true, json: async () => forged }),
      }))).rejects.toMatchObject({ statusCode: 409 });
    }
    expect(h.calls.filter(x => x.sql === DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL)).toHaveLength(0);
  });

  it("fails closed on missing dedicated token or device mismatch", async () => {
    const h = makeDb();
    const fetchFn = vi.fn();
    await expect(reconcileOneDevVendorWaGatewayReceipt(params(h, {
      resolveToken: async () => "", fetchFn,
    }))).rejects.toMatchObject({ statusCode: 409 });
    const different = makeDb({ gateway_device_id: "primary-01" });
    await expect(reconcileOneDevVendorWaGatewayReceipt(params(different, { fetchFn })))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("never syncs a missing/wrong-company/non-vendor/never-queued record", async () => {
    const overrides = [
      { rfq_company_id: 2 }, { supplier_company_id: 2 },
      { recipient_id: 88 }, { channel: "email" },
      { queue_status: "pending" }, { attempt_count: 0 },
      { gateway_message_id: null }, { sent_at: sentAt },
    ];
    for (const override of overrides) {
      const h = makeDb(override);
      const fetchFn = vi.fn();
      await expect(reconcileOneDevVendorWaGatewayReceipt(params(h, { fetchFn })))
        .rejects.toMatchObject({ statusCode: 409 });
      expect(fetchFn).not.toHaveBeenCalled();
    }
  });

  it("uses fail-closed response if provider lookup is unavailable", async () => {
    const h = makeDb();
    await expect(reconcileOneDevVendorWaGatewayReceipt(params(h, {
      fetchFn: async () => ({ ok: false }),
    }))).rejects.toMatchObject({ statusCode: 502 });
    await expect(reconcileOneDevVendorWaGatewayReceipt(params(h, {
      fetchFn: async () => { throw Error("transport secret path"); },
    }))).rejects.toMatchObject({ statusCode: 502 });
    expect(h.calls.filter(x => x.sql === DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL)).toHaveLength(0);
  });

  it("returns already_sent without a provider request or DB mutation", async () => {
    const h = makeDb({ queue_status: "sent", sent_at: sentAt });
    const fetchFn = vi.fn();
    const result = await reconcileOneDevVendorWaGatewayReceipt(params(h, { fetchFn }));
    expect(result).toEqual({ queueId: 96, status: "already_sent", updated: false });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(h.calls).toHaveLength(1);
  });

  it("records delivered/read timestamps only when the provider also has sentAt", async () => {
    const h = makeDb();
    await reconcileOneDevVendorWaGatewayReceipt(params(h, {
      fetchFn: async () => ({ ok: true, json: async () => ({
        ...receipt, status: "delivered", deliveredAt: "2026-11-17T09:50:00.000Z",
      }) }),
    }));
    expect(h.calls.at(-1)?.values).toEqual([
      96, messageId, sentAt, "delivered", "2026-11-17T09:50:00.000Z", null,
    ]);
  });

  it("never treats a 202/queued acknowledgement as proof of WhatsApp sent", () => {
    expect(DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL).toContain("where id=$1 and status='queued' and attempt_count=1 and sent_at is null");
    expect(DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL).toContain("gateway_delivery,message_id");
    expect(DEV_VENDOR_GATEWAY_RECEIPT_UPDATE_SQL).toContain("set status='sent'");
  });

  it("sync endpoint is Admin-only and DEV-only, and UI requires an existing queued record", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const admin = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const ui = readFileSync(resolve(process.cwd(), "src/components/admin/MarketplaceVendorAssignment.tsx"), "utf8");
    expect(index).toContain("sync-whatsapp-status");
    expect(index).toContain("await requireAdmin(request, response)");
    expect(admin).toContain("reconcileOneDevVendorWaGatewayReceipt");
    expect(admin).toContain('process.env.APP_ENV !== "development"');
    expect(ui).toContain('waReadiness?.queueStatus === "queued"');
    expect(ui).toContain("Sinkronkan Status WA (Tanpa Kirim Ulang)");
  });
});
