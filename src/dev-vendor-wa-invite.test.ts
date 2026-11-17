import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getDevVendorWhatsAppReadiness,
  sendOneDevVendorWhatsAppInvite,
} from "../server/dev-vendor-wa-invite.mjs";
import { buildDevGatewayIdempotencyKey } from "../server/dev-vendor-wa-gateway.mjs";

const dev = {
  APP_ENV: "development", NODE_ENV: "test",
  CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "true",
  CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV: "customer-portal-dev",
  CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV: "6281111111111",
};
const off = { ...dev, CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "false" };
const ids = { queueId: 93, rfqId: 23, quoteId: 18 };
const contact = { ...ids, recipientLast4: "7890", confirmedRecipient: true };
const pinnedToken = "synthetic-customer-portal-gateway-token";
const gatewayMessageId = "123e4567-e89b-12d3-a456-426614174000";
const verifiedSender = vi.fn(async () => ({ matched: true, reason: null }));

function row(overrides: Record<string, unknown> = {}) {
  return {
    queue_id: 93, queue_status: "pending", event_type: "rfq_vendor_invited",
    channel: "whatsapp", recipient_type: "vendor", recipient_id: 24,
    queued_phone: null, attempt_count: 0, sent_at: null,
    id: 18, rfq_id: 23, vendor_id: 24, status: "invited",
    token: "x".repeat(48), valid_until: "2026-11-23T18:19:25Z",
    invite_not_expired: true, rfq_number: "RFQ-SYNTHETIC",
    rfq_company_id: 1, supplier_company_id: 1,
    supplier_name: "Supplier Test", supplier_active: true, supplier_verified: true,
    supplier_phone: "081234567890", contact_person: "PIC Test",
    ...overrides,
  };
}
function harness(overrides: Record<string, unknown> = {}) {
  const data = row(overrides);
  const sqlCalls: Array<{ sql: string; params: unknown[] }> = [];
  const db = vi.fn(async (sql: string, params: unknown[]) => {
    sqlCalls.push({ sql, params });
    if (sql.startsWith("select")) return { rows: [data] };
    if (sql.includes("set status='sending'")) {
      if (data.queue_status !== "pending" || data.attempt_count !== 0) return { rows: [] };
      data.queue_status = "sending";
      data.attempt_count = 1;
      return { rows: [{ id: 93 }] };
    }
    if (sql.includes("set status='queued'")) {
      if (data.queue_status !== "sending") return { rows: [] };
      data.queue_status = "queued";
      (data as any).gatewayMessageId = params[1];
      return { rows: [{ id: 93 }] };
    }
    if (sql.includes("set status='exhausted'")) {
      data.queue_status = "exhausted";
      return { rows: [] };
    }
    throw Error("Unexpected SQL in synthetic fake: " + sql.slice(0, 70));
  });
  return { data, db, sqlCalls };
}
const resolveToken = async () => pinnedToken;
const ack = async () => ({ status: "queued", messageId: gatewayMessageId });
function opts(h: ReturnType<typeof harness>, override: Record<string, any> = {}) {
  return {
    ...contact, env: dev, db: h.db,
    resolveSenderToken: resolveToken, verifySender: verifiedSender,
    send: ack, ...override,
  };
}

describe("DEV quote #18 -> CST WA Gateway, exact queue #93 only", () => {
  it("checks readiness with the dedicated gateway token and device identity", async () => {
    const h = harness();
    const v = vi.fn(async () => ({ matched: true, reason: null }));
    const result = await getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db, resolveSenderToken: resolveToken, verifySender: v,
    });
    expect(result).toMatchObject({
      queueId: 93, quoteId: 18, provider: "cst-wa-gateway",
      recipientLast4: "7890", ready: true, senderIdentityVerified: true,
      queueStatus: "pending",
    });
    expect(v).toHaveBeenCalledWith({
      gatewayToken: pinnedToken,
      expectedPhone: dev.CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV,
      deviceId: dev.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV,
    });
    expect(result).not.toHaveProperty("token");
    expect(result).not.toHaveProperty("phone");
    expect(h.sqlCalls.every(c => c.sql.startsWith("select"))).toBe(true);
  });

  it("fails closed for missing token, incorrect sender or flag OFF", async () => {
    const h = harness();
    const missing = await getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db, resolveSenderToken: async () => "",
      verifySender: verifiedSender,
    });
    expect(missing.ready).toBe(false);
    expect(missing.reason).toMatch(/Token WA Gateway/);
    const wrong = await getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db, resolveSenderToken: resolveToken,
      verifySender: async () => ({ matched: false, reason: "Perangkat Tenant" }),
    });
    expect(wrong.ready).toBe(false);
    expect(wrong.reason).toMatch(/Tenant/);
    const disabled = await getDevVendorWhatsAppReadiness({
      ...ids, env: off, db: h.db, resolveSenderToken: resolveToken,
      verifySender: verifiedSender,
    });
    expect(disabled.ready).toBe(false);
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { env: off })))
      .rejects.toThrow(/dinonaktifkan/);
    expect(h.sqlCalls.every(c => c.sql.startsWith("select"))).toBe(true);
  });

  it("rejects wrong quote, wrong queue, changed supplier and missing PIC", async () => {
    const h = harness();
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { queueId: 94 })))
      .rejects.toThrow(/tidak ditemukan/);
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { recipientLast4: "1111" })))
      .rejects.toThrow(/tidak cocok/);
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { confirmedRecipient: false })))
      .rejects.toThrow(/Konfirmasi/);
    const noPic = harness({ contact_person: "" });
    await expect(getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: noPic.db, resolveSenderToken: resolveToken, verifySender: verifiedSender,
    })).rejects.toThrow(/PIC/);
    const wrongCompany = harness({ supplier_company_id: 2 });
    await expect(getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: wrongCompany.db, resolveSenderToken: resolveToken, verifySender: verifiedSender,
    })).rejects.toThrow(/perusahaan/);
  });

  it("never sends under production or mixed PROD database selector", async () => {
    const h = harness();
    const send = vi.fn();
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, {
      env: { ...dev, NODE_ENV: "production" }, send,
    }))).rejects.toThrow(/database DEV khusus/);
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, {
      env: { ...dev, APP_ENV: "production" }, send,
    }))).rejects.toThrow(/database DEV khusus/);
    expect(send).not.toHaveBeenCalled();
    expect(h.db).not.toHaveBeenCalled();
  });

  it("creates no new quote and persists only Gateway QUEUED, never fake SENT", async () => {
    const h = harness();
    const send = vi.fn(ack);
    const out = await sendOneDevVendorWhatsAppInvite(opts(h, { send }));
    expect(out).toEqual({
      queueId: 93, quoteId: 18, status: "gateway_queued",
      gatewayMessageId,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      gatewayToken: pinnedToken, deviceId: dev.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV,
      phone: "6281234567890",
      idempotencyKey: buildDevGatewayIdempotencyKey(ids),
    });
    expect(send.mock.calls[0][0].message).toContain("/mkt-vendor-quote/" + "x".repeat(48));
    expect(h.data.queue_status).toBe("queued");
    expect(h.data.sent_at).toBeNull();
    expect((h.data as any).gatewayMessageId).toBe(gatewayMessageId);
    expect(h.sqlCalls.every(c => !/insert into/i.test(c.sql))).toBe(true);
    expect(JSON.stringify(out)).not.toContain(pinnedToken);
    expect(JSON.stringify(out)).not.toContain("x".repeat(48));
  });

  it("uses exact one-queue claim under simultaneous requests", async () => {
    const h = harness();
    const send = vi.fn(ack);
    const [a, b] = await Promise.allSettled([
      sendOneDevVendorWhatsAppInvite(opts(h, { send })),
      sendOneDevVendorWhatsAppInvite(opts(h, { send })),
    ]);
    expect([a,b].filter(x => x.status==="fulfilled")).toHaveLength(1);
    expect([a,b].filter(x => x.status==="rejected")).toHaveLength(1);
    expect(send).toHaveBeenCalledTimes(1);
    // Both requests may attempt the atomic UPDATE, but only one receives RETURNING.
    expect(h.sqlCalls.filter(c => c.sql.includes("set status='sending'"))).toHaveLength(2);
    expect(h.sqlCalls.filter(c => c.sql.includes("set status='queued'"))).toHaveLength(1);
  });

  it("does not send after recipient phone changes between readiness and claim", async () => {
    const h = harness();
    const send = vi.fn();
    let reads = 0;
    const changingDb = async (sql: string, params: unknown[]) => {
      if (sql.startsWith("select")) {
        reads += 1;
        if (reads === 2) return { rows: [{ ...h.data, supplier_phone: "081234561111" }] };
      }
      return h.db(sql, params);
    };
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, {
      db: changingDb, send,
    }))).rejects.toThrow(/Nomor PIC vendor berubah/);
    expect(send).not.toHaveBeenCalled();
    expect(h.data.queue_status).toBe("pending");
    expect(h.sqlCalls.every(c => c.sql.startsWith("select"))).toBe(true);
  });

  it("does not auto-retry if Gateway acknowledgement is ambiguous", async () => {
    const h = harness();
    const send = vi.fn(async () => { throw Error("synthetic timeout"); });
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { send })))
      .rejects.toThrow(/Gateway belum pasti/);
    expect(h.data.queue_status).toBe("exhausted");
    expect(send).toHaveBeenCalledTimes(1);
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { send })))
      .rejects.toThrow(/sudah pernah diproses/);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("blocks provider false acceptance without marking sent", async () => {
    const h = harness();
    const send = vi.fn(async () => ({ status: "sent", messageId: gatewayMessageId }));
    await expect(sendOneDevVendorWhatsAppInvite(opts(h, { send })))
      .rejects.toThrow(/Gateway belum pasti/);
    expect(h.data.queue_status).toBe("exhausted");
    expect(h.data.sent_at).toBeNull();
  });

  it("requires server-side Admin auth and DEV-only routing", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const admin = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const service = readFileSync(resolve(process.cwd(), "server/dev-vendor-wa-invite.mjs"), "utf8");
    expect(index).toContain("vendor-routing(?:\\/(?:invite-link|whatsapp-readiness|send-whatsapp))?");
    expect(index).toContain("await requireAdmin(request, response)");
    expect(admin).toContain('request.method === "POST" && vendorWaSendMatch');
    expect(admin).toContain('ctx.body?.confirmedRecipient === true');
    expect(admin).toContain("process.env.NODE_ENV === \"production\"");
    expect(service).toContain("sendDevCustomerPortalGatewayMessage");
    expect(service).not.toContain("Fonnte");
    expect(service).not.toContain("sendFonnte");
    expect(service).not.toContain("WATI_API_TOKEN");
    const ui = readFileSync(resolve(process.cwd(), "src/components/admin/MarketplaceVendorAssignment.tsx"), "utf8");
    expect(ui).toContain("WA Gateway CST:");
    expect(ui).toContain('"queued","sending","sent","exhausted","failed","retrying"');
  });
});
