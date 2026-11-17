import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  syncDevVendorWhatsAppStatus,
  DEV_VENDOR_GATEWAY_SYNC_SENT_SQL,
  DEV_VENDOR_GATEWAY_SYNC_FAILED_SQL,
} from "../server/dev-vendor-wa-status.mjs";

const id = "123e4567-e89b-12d3-a456-426614174000";
const env = {
  APP_ENV: "development",
  NODE_ENV: "test",
  CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV: "ai-core",
  CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV: "6287808786556",
};
const ids = { queueId: 95, rfqId: 24, quoteId: 19 };
const token = "synthetic-app-token-never-send";
const provider = {
  messageId: id,
  clientId: "customer-portal",
  companyId: "1",
  deviceId: "ai-core",
  status: "sent",
  sentAt: "2026-11-17T09:48:07.401Z",
};
const validRow = {
  queue_id: 95, rfq_id: 24, vendor_quote_id: 19, quote_rfq_id: 24,
  recipient_id: 38, vendor_id: 38, channel: "whatsapp",
  event_type: "rfq_vendor_invited", recipient_type: "vendor",
  rfq_company_id: 1, supplier_company_id: 1,
  queue_status: "queued", attempt_count: 1, sent_at: null,
  payload_json: { gateway_delivery: { provider: "cst-wa-gateway", message_id: id } },
};
function harness(override: Record<string, any> = {}, receipt: Record<string, any> = provider) {
  const row = { ...validRow, ...override };
  const writes: Array<{ sql: string; params: unknown[] }> = [];
  const db = vi.fn(async (sql: string, params: unknown[]) => {
    if (sql.startsWith("select")) return { rows: [row] };
    writes.push({ sql, params });
    if (sql === DEV_VENDOR_GATEWAY_SYNC_SENT_SQL) {
      return { rows: [{ id: 95, status: "sent", sent_at: receipt.sentAt, gateway_delivery: {} }] };
    }
    if (sql === DEV_VENDOR_GATEWAY_SYNC_FAILED_SQL) return { rows: [{ id: 95, status: "exhausted" }] };
    throw Error("Unexpected status SQL");
  });
  const fetchFn = vi.fn(async () => ({
    ok: true, json: async () => receipt,
  }));
  return { db, fetchFn, writes };
}
function opts(h: ReturnType<typeof harness>) {
  return { ...ids, env, db: h.db, fetchFn: h.fetchFn, resolveToken: () => token };
}

describe("DEV vendor WA queued->provider status reconciliation (never sends)", () => {
  it("marks SENT only after authenticated exact Gateway receipt", async () => {
    const h = harness();
    const result = await syncDevVendorWhatsAppStatus(opts(h));
    expect(result).toEqual({ queueId: 95, quoteId: 19, queueStatus: "sent", providerStatus: "sent", updated: true });
    expect(h.fetchFn).toHaveBeenCalledTimes(1);
    expect(h.fetchFn.mock.calls[0][0]).toContain("/v1/messages/" + id);
    expect(h.fetchFn.mock.calls[0][1]).toMatchObject({
      method: "GET", headers: { Authorization: "Bearer " + token },
    });
    expect(h.writes).toHaveLength(1);
    expect(h.writes[0].sql).toBe(DEV_VENDOR_GATEWAY_SYNC_SENT_SQL);
    expect(h.writes[0].params).toEqual([
      95, id, provider.sentAt, "sent", null, null,
    ]);
    expect(h.writes[0].sql).toContain("payload_json->'gateway_delivery'->>'message_id'=$2");
    expect(JSON.stringify(result)).not.toContain(token);
  });

  it("preserves delivered/read evidence while queue status remains SENT", async () => {
    const h = harness({}, { ...provider, status: "delivered",
      deliveredAt: "2026-11-17T09:48:20.000Z" });
    const result = await syncDevVendorWhatsAppStatus(opts(h));
    expect(result.providerStatus).toBe("delivered");
    expect(h.writes[0].params[4]).toBe("2026-11-17T09:48:20.000Z");
  });

  it("does not falsely mark SENT when Gateway still says queued", async () => {
    const h = harness({}, { ...provider, status: "queued", sentAt: null });
    const result = await syncDevVendorWhatsAppStatus(opts(h));
    expect(result).toMatchObject({ queueStatus: "queued", providerStatus: "queued", updated: false });
    expect(h.writes).toHaveLength(0);
  });

  it("records definitive provider failure as exhausted, not auto-retryable", async () => {
    const h = harness({}, { ...provider, status: "failed", failedAt: provider.sentAt });
    const result = await syncDevVendorWhatsAppStatus(opts(h));
    expect(result).toMatchObject({ queueStatus: "exhausted", updated: true });
    expect(h.writes[0].sql).toBe(DEV_VENDOR_GATEWAY_SYNC_FAILED_SQL);
    expect(h.writes[0].sql).toContain("next_retry_at=null");
  });

  it("rejects Tenant/Fleet token response even for same device", async () => {
    const h = harness({}, { ...provider, clientId: "tenant-pos" });
    await expect(syncDevVendorWhatsAppStatus(opts(h))).rejects.toMatchObject({ statusCode: 409 });
    expect(h.writes).toHaveLength(0);
  });

  it("rejects modified message ID, device, company and missing timestamp", async () => {
    for (const change of [
      { messageId: "456e4567-e89b-12d3-a456-426614174000" },
      { deviceId: "tenant-pos" }, { companyId: "sky" },
      { sentAt: null },
    ]) {
      const h = harness({}, { ...provider, ...change });
      await expect(syncDevVendorWhatsAppStatus(opts(h))).rejects.toMatchObject({
        statusCode: change.sentAt === null ? 502 : 409,
      });
      expect(h.writes).toHaveLength(0);
    }
  });

  it("will not fetch provider or change DB for old pending queue or invalid company", async () => {
    for (const input of [{ queue_status: "pending" }, { supplier_company_id: 2 },
      { attempt_count: 0 }, { payload_json: {} }]) {
      const h = harness(input);
      await expect(syncDevVendorWhatsAppStatus(opts(h))).rejects.toMatchObject({ statusCode: 409 });
      expect(h.fetchFn).not.toHaveBeenCalled();
      expect(h.writes).toHaveLength(0);
    }
  });

  it("never changes a queued row without real provider acknowledgement", async () => {
    const h = harness();
    h.fetchFn.mockImplementation(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(syncDevVendorWhatsAppStatus(opts(h))).rejects.toMatchObject({ statusCode: 502 });
    expect(h.writes).toHaveLength(0);
  });

  it("uses existing Admin-only route for a sync action, not background send", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const admin = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const ui = readFileSync(resolve(process.cwd(), "src/components/admin/MarketplaceVendorAssignment.tsx"), "utf8");
    expect(index).toContain("await requireAdmin(request, response)");
    expect(index).toContain("whatsapp-sync");
    expect(admin).toContain('request.method === "POST" && (vendorWaSendMatch || vendorWaSyncMatch)');
    expect(admin).toContain("syncDevVendorWhatsAppStatus");
    expect(ui).toContain("Periksa Status Pengiriman WA (Tanpa Kirim Ulang)");
  });
});
