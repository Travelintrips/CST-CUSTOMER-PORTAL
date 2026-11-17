import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getDevVendorWhatsAppReadiness,
  sendOneDevVendorWhatsAppInvite as sendInviteService,
} from "../server/dev-vendor-wa-invite.mjs";
import { verifyDevVendorWaSender } from "../server/dev-vendor-wa-sender.mjs";
import { sendFonnteMessageWithToken } from "../server/whatsapp-service.mjs";

// All test sends use an explicitly synthetic token and an in-memory fake.
function sendOneDevVendorWhatsAppInvite(input: Record<string, unknown>) {
  return sendInviteService({
    resolveSenderToken: async () => "synthetic-pinned-fonnte-token-A",
    ...input,
  });
}

const dev = { APP_ENV: "development", CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "true", CUSTOMER_PORTAL_DEV_WA_SENDER_PHONE: "6281111111111" };
const off = { ...dev, CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "false" };
const verifiedDevSender = async () => ({ matched: true, reason: null });
const ids = { queueId: 93, rfqId: 23, quoteId: 18 };
const contact = { ...ids, recipientLast4: "7890", confirmedRecipient: true };
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
  const sqlCalls: string[] = [];
  const db = vi.fn(async (sql: string, _params: unknown[]) => {
    sqlCalls.push(sql);
    if (sql.startsWith("select")) return { rows: [data] };
    if (sql.includes("set status='sending'")) {
      if (data.queue_status !== "pending" || data.attempt_count !== 0) return { rows: [] };
      data.queue_status = "sending";
      data.attempt_count = 1;
      return { rows: [{ id: 93 }] };
    }
    if (sql.includes("set status='sent'")) {
      if (data.queue_status !== "sending") return { rows: [] };
      data.queue_status = "sent";
      data.sent_at = "synthetic";
      return { rows: [{ id: 93 }] };
    }
    if (sql.includes("set status='exhausted'")) {
      data.queue_status = "exhausted";
      return { rows: [] };
    }
    throw Error("Unexpected SQL in synthetic fake: " + sql.slice(0, 35));
  });
  return { data, db, sqlCalls };
}

describe("DEV WhatsApp single existing vendor invite (fake sender / fake database)", () => {
  it("shows missing sender without claiming a queue or sending", async () => {
    const h = harness();
    const readiness = await getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db, isConfigured: async () => false,
    });
    expect(readiness).toMatchObject({
      queueId: 93, quoteId: 18, recipientLast4: "7890",
      senderConfigured: false, ready: false, queueStatus: "pending",
    });
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
    expect(readiness).not.toHaveProperty("token");
    expect(readiness).not.toHaveProperty("phone");
  });

  it("requires a separate DEV-only opt-in even when provider configured", async () => {
    const h = harness();
    const readiness = await getDevVendorWhatsAppReadiness({
      ...ids, env: off, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender,
    });
    expect(readiness.enabled).toBe(false);
    expect(readiness.ready).toBe(false);
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: off, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender,
      send: vi.fn(),
    })).rejects.toThrow(/dinonaktifkan/);
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
  });

  it("refuses PROD, wrong queue, missing PIC, mismatched company and wrong confirmation", async () => {
    const h = harness();
    const opts = { ...contact, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send: vi.fn() };
    await expect(sendOneDevVendorWhatsAppInvite({ ...opts, env: { APP_ENV: "production" } })).rejects.toThrow(/DEV/);
    await expect(sendOneDevVendorWhatsAppInvite({ ...opts, queueId: 94 })).rejects.toThrow(/tidak ditemukan/);
    await expect(sendOneDevVendorWhatsAppInvite({ ...opts, recipientLast4: "9999" })).rejects.toThrow(/tidak cocok/);
    await expect(sendOneDevVendorWhatsAppInvite({ ...opts, confirmedRecipient: false })).rejects.toThrow(/Konfirmasi/);
    const noPic = harness({ contact_person: "" });
    await expect(getDevVendorWhatsAppReadiness({ ...ids, env: dev, db: noPic.db, isConfigured: async () => true, verifySender: verifiedDevSender })).rejects.toThrow(/PIC/);
    const wrongCompany = harness({ supplier_company_id: 2 });
    await expect(getDevVendorWhatsAppReadiness({ ...ids, env: dev, db: wrongCompany.db, isConfigured: async () => true, verifySender: verifiedDevSender })).rejects.toThrow(/perusahaan/);
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
  });

  it("uses exactly the existing token and submits one provider request, not another quote", async () => {
    const h = harness();
    const send = vi.fn(async () => ({ status: true }));
    const result = await sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    });
    expect(result).toEqual({ queueId: 93, quoteId: 18, status: "provider_accepted" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].phone).toBe("6281234567890");
    expect(send.mock.calls[0][0].message).toContain("/mkt-vendor-quote/" + "x".repeat(48));
    expect(send.mock.calls[0][0].message).toContain("RFQ-SYNTHETIC");
    expect(h.data.queue_status).toBe("sent");
    expect(h.sqlCalls.filter((sql) => sql.includes("set status='sending'"))).toHaveLength(1);
    expect(h.sqlCalls.every((sql) => !/insert into/i.test(sql))).toBe(true);
    expect(JSON.stringify(result)).not.toContain("x".repeat(48));
  });

  it("allows only one claimant under two simultaneous requests", async () => {
    const h = harness();
    const send = vi.fn(async () => ({ status: true }));
    const attempt = () => sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    });
    const outcomes = await Promise.allSettled([attempt(), attempt()]);
    expect(outcomes.filter((entry) => entry.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter((entry) => entry.status === "rejected")).toHaveLength(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("fails closed after uncertain provider outcome and does not auto-retry", async () => {
    const h = harness();
    const send = vi.fn(async () => { throw Error("simulated timeout"); });
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    })).rejects.toThrow(/tidak terkonfirmasi/);
    expect(h.data.queue_status).toBe("exhausted");
    expect(send).toHaveBeenCalledTimes(1);
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    })).rejects.toThrow(/sudah pernah diproses/);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects APP_ENV=development combined with NODE_ENV=production (PROD DB selector)", async () => {
    const h = harness();
    const send = vi.fn();
    const mixed = { ...dev, NODE_ENV: "production" };
    await expect(getDevVendorWhatsAppReadiness({
      ...ids, env: mixed, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender,
    })).rejects.toThrow(/database DEV khusus/);
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: mixed, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    })).rejects.toThrow(/database DEV khusus/);
    expect(h.db).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("blocks a changed supplier number after Admin confirmed the previous snapshot", async () => {
    const h = harness();
    const send = vi.fn();
    let reads = 0;
    const changingDb = async (sql: string, params: unknown[]) => {
      if (sql.startsWith("select")) {
        reads += 1;
        if (reads === 2) {
          return { rows: [{ ...h.data, supplier_phone: "081234561111" }] };
        }
      }
      return h.db(sql, params);
    };
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: changingDb, isConfigured: async () => true, verifySender: verifiedDevSender, send,
    })).rejects.toThrow(/Nomor PIC vendor berubah/);
    expect(reads).toBe(2);
    expect(send).not.toHaveBeenCalled();
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
    expect(h.data.queue_status).toBe("pending");
  });

  it("rejects missing supplier company instead of treating null as company zero", async () => {
    const h = harness({ supplier_company_id: null, rfq_company_id: null });
    await expect(getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db, isConfigured: async () => true, verifySender: verifiedDevSender,
    })).rejects.toThrow(/perusahaan/);
  });

  it("rejects an unknown or mismatching sender without claiming the queue", async () => {
    const h = harness();
    const send = vi.fn();
    const untrustedSender = vi.fn(async () => ({
      matched: false,
      reason: "Nomor pengirim Fonnte tidak cocok dengan akun Customer Portal DEV.",
    }));
    const readiness = await getDevVendorWhatsAppReadiness({
      ...ids, env: dev, db: h.db,
      isConfigured: async () => true, verifySender: untrustedSender,
    });
    expect(readiness.senderConfigured).toBe(true);
    expect(readiness.senderIdentityVerified).toBe(false);
    expect(readiness.ready).toBe(false);
    expect(readiness.reason).toMatch(/tidak cocok/);
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, isConfigured: async () => true,
      verifySender: untrustedSender, send,
    })).rejects.toThrow(/tidak cocok/);
    expect(send).not.toHaveBeenCalled();
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
    expect(h.data.queue_status).toBe("pending");
  });

  it("pins the SAME sender token to Fonnte /device and /send even when configured token rotates", async () => {
    const h = harness();
    const resolveSenderToken = vi.fn(async () => "synthetic-token-A");
    const resolveAgain = vi.fn(async () => "synthetic-FLEET-token-B");
    const fetchFn = vi.fn(async (url: string, options: { headers: { Authorization: string } }) => {
      if (url === "https://api.fonnte.com/device") {
        return {
          ok: true, status: 200, json: async () => ({
            status: true, device: dev.CUSTOMER_PORTAL_DEV_WA_SENDER_PHONE,
            device_status: "connect",
          }),
        };
      }
      if (url === "https://api.fonnte.com/send") {
        return { ok: true, status: 200, json: async () => ({ status: true }) };
      }
      throw Error("Unexpected provider path");
    });
    const result = await sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db, resolveSenderToken,
      verifySender: ({ expectedPhone, senderToken }: {expectedPhone: string; senderToken: string}) =>
        verifyDevVendorWaSender({
          expectedPhone, senderToken, resolveToken: resolveAgain, fetchFn,
        }),
      send: ({ phone, message, token }: {phone: string; message: string; token: string}) =>
        sendFonnteMessageWithToken({ phone, message, token, fetchFn }),
    });
    expect(result).toEqual({ queueId: 93, quoteId: 18, status: "provider_accepted" });
    expect(resolveSenderToken).toHaveBeenCalledTimes(1);
    expect(resolveAgain).not.toHaveBeenCalled();
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn.mock.calls.map(([, options]) => options.headers.Authorization))
      .toEqual(["synthetic-token-A", "synthetic-token-A"]);
    expect(JSON.stringify(result)).not.toContain("synthetic-token-A");
    expect(h.data.queue_status).toBe("sent");
  });

  it("never claims a pending queue if the one pinned sender token is missing", async () => {
    const h = harness();
    const send = vi.fn();
    const verifySender = vi.fn();
    await expect(sendOneDevVendorWhatsAppInvite({
      ...contact, env: dev, db: h.db,
      resolveSenderToken: async () => "",
      verifySender, send,
    })).rejects.toThrow(/belum dikonfigurasi/);
    expect(verifySender).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(h.sqlCalls.every((sql) => sql.startsWith("select"))).toBe(true);
    expect(h.data.queue_status).toBe("pending");
  });

  it("restricts route to Admin, POST, exact IDs and an existing queue", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const admin = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
    expect(index).toContain("vendor-routing(?:\\/(?:invite-link|whatsapp-readiness|send-whatsapp))?");
    expect(index).toContain("await requireAdmin(request, response)");
    expect(admin).toContain('request.method === "POST" && vendorWaSendMatch');
    expect(admin).toContain('ctx.body?.confirmedRecipient === true');
    expect(admin).toContain("limit 2");
    expect(admin).toContain("process.env.APP_ENV !== \"development\"");
    expect(admin).toContain('const vendorShareSupported = process.env.APP_ENV === "development"');
    expect(admin).toContain('databaseConnectionSource === "SUPABASE_DATABASE_URL_DEV"');
  });
});
