import { describe, expect, it, vi } from "vitest";
import {
  evaluateDevVendorWaSenderProfile,
  verifyDevVendorWaSender,
} from "../server/dev-vendor-wa-sender.mjs";

const expectedPhone = "6281111111111";
const connected = {
  status: true, device_status: "connect",
  device: expectedPhone, name: "CST Customer Portal DEV",
};

describe("Fonnte device identity gate for DEV vendor WhatsApp", () => {
  it("accepts only the specific configured sender number when connected", () => {
    expect(evaluateDevVendorWaSenderProfile({ expectedPhone, profile: connected }))
      .toEqual({ matched: true, reason: null });
  });

  it("rejects another sending device even if its token is valid and connected", () => {
    const result = evaluateDevVendorWaSenderProfile({
      expectedPhone, profile: { ...connected, device: "6282222222222" },
    });
    expect(result.matched).toBe(false);
    expect(result.reason).toMatch(/tidak cocok/);
  });

  it("rejects disconnected, token-invalid and missing expected sender", () => {
    const offline = evaluateDevVendorWaSenderProfile({
      expectedPhone, profile: { ...connected, device_status: "disconnect" },
    });
    expect(offline.matched).toBe(false);
    expect(offline.reason).toMatch(/belum terhubung/);
    expect(evaluateDevVendorWaSenderProfile({
      expectedPhone, profile: { status: false, reason: "token invalid" },
    }).matched).toBe(false);
    expect(evaluateDevVendorWaSenderProfile({
      expectedPhone: undefined, profile: connected,
    }).matched).toBe(false);
  });

  it("checks Fonnte device profile with the dedicated device token, not send API", async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, json: async () => connected }));
    const resolveToken = vi.fn(async () => "synthetic-device-token");
    const result = await verifyDevVendorWaSender({
      expectedPhone, resolveToken, fetchFn,
    });
    expect(result.matched).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe("https://api.fonnte.com/device");
    expect(fetchFn.mock.calls[0][1]).toMatchObject({
      method: "POST", headers: { Authorization: "synthetic-device-token" },
    });
    expect(JSON.stringify(result)).not.toContain("synthetic-device-token");
  });

  it("does not contact Fonnte when the expected sender phone is missing", async () => {
    const fetchFn = vi.fn();
    const resolveToken = vi.fn();
    const result = await verifyDevVendorWaSender({ fetchFn, resolveToken });
    expect(result.matched).toBe(false);
    expect(resolveToken).not.toHaveBeenCalled();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("does not contact Fonnte when there is no authorized device token", async () => {
    const fetchFn = vi.fn();
    const result = await verifyDevVendorWaSender({
      expectedPhone, resolveToken: async () => "", fetchFn,
    });
    expect(result.matched).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("returns a safe failure when Fonnte rejects the profile or network fails", async () => {
    const badResponse = await verifyDevVendorWaSender({
      expectedPhone, resolveToken: async () => "fake",
      fetchFn: async () => ({ ok: false, json: async () => ({ status: false }) }),
    });
    expect(badResponse.matched).toBe(false);
    const offline = await verifyDevVendorWaSender({
      expectedPhone, resolveToken: async () => "fake",
      fetchFn: async () => { throw Error("upstream down"); },
    });
    expect(offline.matched).toBe(false);
    expect(JSON.stringify(offline)).not.toContain("upstream down");
  });
});
