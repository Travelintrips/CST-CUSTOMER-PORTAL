import { describe, expect, it, vi } from "vitest";
import {
  CST_GATEWAY_URL,
  DEV_PORTAL_DEVICE_ID,
  resolveDevCustomerPortalGatewayToken,
  evaluateDevPortalGatewayDevice,
  verifyDevCustomerPortalGatewaySender,
  buildDevGatewayIdempotencyKey,
  sendDevCustomerPortalGatewayMessage,
} from "../server/dev-vendor-wa-gateway.mjs";

const token = "synthetic-customer-portal-only-token";
const device = { deviceId: "customer-portal-dev", companyId: "1",
  name: "Customer Portal DEV", enabled: true, status: "ONLINE", phoneNumber: "6281111111111" };
const verified = { expectedPhone: "081111111111", deviceId: "customer-portal-dev" };
const fakeUuid = "123e4567-e89b-12d3-a456-426614174000";

describe("CST WA Gateway DEV sender isolation (no live messages)", () => {
  it("resolves only the app-specific DEV token; no Fleet, Tenant or Fonnte fallback", () => {
    expect(resolveDevCustomerPortalGatewayToken({
      CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV: token,
      FONNTE_TOKEN: "wrong",
    })).toBe(token);
    expect(resolveDevCustomerPortalGatewayToken({
      GATEWAY_API_TOKEN: "Fleet secret",
      CUSTOMER_PORTAL_FONNTE_TOKEN: "Fonnte",
      WATI_API_TOKEN: "legacy",
    })).toBe("");
  });

  it("requires exactly one enabled online Customer Portal DEV device", () => {
    expect(evaluateDevPortalGatewayDevice({
      devices: [device], ...verified,
    })).toEqual({ matched: true, reason: null });
    expect(evaluateDevPortalGatewayDevice({
      devices: [device, { ...device, deviceId: "tenant-pos" }], ...verified,
    }).matched).toBe(false);
    expect(evaluateDevPortalGatewayDevice({
      devices: [{ ...device, deviceId: "tenant-pos" }], ...verified,
    }).matched).toBe(false);
    expect(evaluateDevPortalGatewayDevice({
      devices: [{ ...device, deviceId: "ai-core" }], ...verified,
    }).matched).toBe(false);
  });

  it("fails closed for wrong company, phone, offline or disabled", () => {
    for (const variation of [
      { ...device, companyId: "sky" },
      { ...device, phoneNumber: "6282222222222" },
      { ...device, status: "QR_REQUIRED" },
      { ...device, status: "OFFLINE" },
      { ...device, enabled: false },
    ]) {
      expect(evaluateDevPortalGatewayDevice({
        devices: [variation], ...verified,
      }).matched).toBe(false);
    }
    expect(evaluateDevPortalGatewayDevice({
      devices: [device], expectedPhone: null,
    }).matched).toBe(false);
  });

  it("performs only the official GET /v1/devices with the pinned token", async () => {
    const fetchFn = vi.fn(async (_url: string, _opts: Record<string, any>) => ({
      ok: true, json: async () => ({ devices: [device] }),
    }));
    const response = await verifyDevCustomerPortalGatewaySender({
      gatewayToken: token, ...verified, fetchFn,
    });
    expect(response).toEqual({ matched: true, reason: null });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe(CST_GATEWAY_URL + "/v1/devices");
    expect(fetchFn.mock.calls[0][1]).toMatchObject({
      method: "GET", headers: { Authorization: "Bearer " + token },
      cache: "no-store",
    });
    expect(JSON.stringify(response)).not.toContain(token);
  });

  it("never contacts the gateway for a missing token or invalid device", async () => {
    const fetchFn = vi.fn();
    for (const args of [
      { gatewayToken: "", ...verified },
      { gatewayToken: token, expectedPhone: "", deviceId: DEV_PORTAL_DEVICE_ID },
      { gatewayToken: token, expectedPhone: verified.expectedPhone, deviceId: "tenant-pos" },
    ]) {
      expect((await verifyDevCustomerPortalGatewaySender({
        ...args, fetchFn,
      })).matched).toBe(false);
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("rejects gateway HTTP denial or transport failure without revealing internals", async () => {
    const denied = await verifyDevCustomerPortalGatewaySender({
      gatewayToken: token, ...verified,
      fetchFn: async () => ({ ok: false, status: 403, json: async () => ({ error: "FORBIDDEN" }) }),
    });
    expect(denied.matched).toBe(false);
    const down = await verifyDevCustomerPortalGatewaySender({
      gatewayToken: token, ...verified,
      fetchFn: async () => { throw Error("secret-connection-path"); },
    });
    expect(down.matched).toBe(false);
    expect(JSON.stringify(down)).not.toContain("secret-connection-path");
  });

  it("builds the same key for one existing quote regardless of replay", () => {
    const ids = { queueId: 93, rfqId: 23, quoteId: 18 };
    expect(buildDevGatewayIdempotencyKey(ids))
      .toBe("cst-customer-portal-dev:queue:93:rfq:23:quote:18");
    expect(buildDevGatewayIdempotencyKey(ids))
      .toBe(buildDevGatewayIdempotencyKey({ ...ids }));
    expect(() => buildDevGatewayIdempotencyKey({ ...ids, queueId: -1 })).toThrow();
  });

  it("queues one message using the dedicated device, token and idempotency header", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true, status: 202, json: async () => ({ status: "queued", messageId: fakeUuid }),
    }));
    const key = buildDevGatewayIdempotencyKey({ queueId: 93, rfqId: 23, quoteId: 18 });
    const result = await sendDevCustomerPortalGatewayMessage({
      gatewayToken: token, phone: "081234567890",
      deviceId: DEV_PORTAL_DEVICE_ID, message: "Synthetic vendor invite",
      idempotencyKey: key, fetchFn,
    });
    expect(result).toEqual({ status: "queued", messageId: fakeUuid });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe(CST_GATEWAY_URL + "/v1/messages");
    const args = fetchFn.mock.calls[0][1] as any;
    expect(args.method).toBe("POST");
    expect(args.headers).toMatchObject({
      Authorization: "Bearer " + token,
      "Idempotency-Key": key, "Content-Type": "application/json",
    });
    expect(JSON.parse(args.body)).toMatchObject({
      type: "text", text: "Synthetic vendor invite",
      to: "6281234567890", deviceId: DEV_PORTAL_DEVICE_ID, clientMessageId: key,
    });
    expect(JSON.stringify(result)).not.toContain(token);
  });

  it("accepts provider duplicate as acknowledged but never claims delivery", async () => {
    const result = await sendDevCustomerPortalGatewayMessage({
      gatewayToken: token, deviceId: DEV_PORTAL_DEVICE_ID,
      phone: "6281234567890", message: "Synthetic",
      idempotencyKey: buildDevGatewayIdempotencyKey({ queueId: 93, rfqId: 23, quoteId: 18 }),
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({
        status: "duplicate", messageId: fakeUuid,
      }) }),
    });
    expect(result.status).toBe("duplicate");
    expect(result).not.toHaveProperty("delivered");
    expect(result).not.toHaveProperty("sent");
  });

  it("rejects malformed/missing gateway acknowledgement or provider errors", async () => {
    const opts = { gatewayToken: token, deviceId: DEV_PORTAL_DEVICE_ID,
      phone: "081234567890", message: "Synthetic",
      idempotencyKey: buildDevGatewayIdempotencyKey({ queueId: 93, rfqId: 23, quoteId: 18 }) };
    for (const payload of [
      { status: "queued" }, { status: true, messageId: fakeUuid },
      { status: "delivered", messageId: fakeUuid },
      { status: "queued", messageId: "invalid" },
    ]) {
      await expect(sendDevCustomerPortalGatewayMessage({
        ...opts, fetchFn: async () => ({ ok: true, status: 202, json: async () => payload }),
      })).rejects.toThrow(/tidak memastikan/);
    }
    await expect(sendDevCustomerPortalGatewayMessage({
      ...opts, fetchFn: async () => ({
        ok: false, status: 429, json: async () => ({ status: "queued", messageId: fakeUuid }),
      }),
    })).rejects.toThrow(/tidak memastikan/);
  });

  it("rejects unintended Fleet/Tenant device and no token before network access", async () => {
    const fetchFn = vi.fn();
    const opts = { gatewayToken: token, phone: "081234567890",
      message: "Synthetic", idempotencyKey: "cst-customer-portal-dev:queue:93:rfq:23:quote:18",
      fetchFn };
    await expect(sendDevCustomerPortalGatewayMessage({
      ...opts, deviceId: "tenant-pos",
    })).rejects.toThrow(/perangkat/);
    await expect(sendDevCustomerPortalGatewayMessage({
      ...opts, gatewayToken: "", deviceId: DEV_PORTAL_DEVICE_ID,
    })).rejects.toThrow(/Kredensial/);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
