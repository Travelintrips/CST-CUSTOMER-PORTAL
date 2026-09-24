import { describe, expect, it } from "vitest";

// @ts-ignore Server ESM module intentionally tested from Vitest.
import {
  buildPaylabsSignaturePayload,
  formatPaylabsTimestamp,
  isTrustedPaylabsPaymentUrl,
  mapPaylabsStatus,
  normalizePaylabsPem,
  resolvePaylabsWebhookStatus,
} from "../../../server/paylabs-service.mjs";

describe("Paylabs marketplace payment contract", () => {
  it("formats the Paylabs timestamp as WIB wall-clock", () => {
    expect(formatPaylabsTimestamp(0)).toBe("1970-01-01T07:00:00+07:00");
  });

  it("builds the deterministic signature payload contract", () => {
    const payload = buildPaylabsSignaturePayload(
      "POST",
      "/payment/v2.1/h5/createLink",
      '{"merchantId":"010613"}',
      "2026-09-24T22:30:00+07:00",
    );
    expect(payload).toMatch(/^POST:\/payment\/v2\.1\/h5\/createLink:[a-f0-9]{64}:2026-09-24T22:30:00\+07:00$/);
  });

  it("keeps paid terminal and prevents unknown callbacks from reopening terminal states", () => {
    expect(resolvePaylabsWebhookStatus("paid", "FAILED")).toBe("paid");
    expect(resolvePaylabsWebhookStatus("expired", "UNKNOWN")).toBe("expired");
    expect(resolvePaylabsWebhookStatus("failed", "PAID")).toBe("paid");
    expect(resolvePaylabsWebhookStatus("pending", "PAID")).toBe("paid");
  });

  it("maps supported provider statuses", () => {
    expect(mapPaylabsStatus("02")).toBe("paid");
    expect(mapPaylabsStatus("EXPIRED")).toBe("expired");
    expect(mapPaylabsStatus("CANCELLED")).toBe("cancelled");
    expect(mapPaylabsStatus("FAILED")).toBe("failed");
  });

  it("allows only HTTPS Paylabs payment URLs", () => {
    expect(isTrustedPaylabsPaymentUrl("https://pay.paylabs.co.id/payment/abc")).toBe(true);
    expect(isTrustedPaylabsPaymentUrl("https://sit-pay.paylabs.co.id/payment/abc")).toBe(true);
    expect(isTrustedPaylabsPaymentUrl("http://pay.paylabs.co.id/payment/abc")).toBe(false);
    expect(isTrustedPaylabsPaymentUrl("https://paylabs.co.id.evil.example/payment/abc")).toBe(false);
    expect(isTrustedPaylabsPaymentUrl("javascript:alert(1)")).toBe(false);
  });

  it("normalizes escaped-newline PEM values without exposing them", () => {
    const pem = "-----BEGIN PUBLIC KEY-----\\nQUJDRA==\\n-----END PUBLIC KEY-----";
    expect(normalizePaylabsPem(pem)).toContain("\n");
    expect(normalizePaylabsPem(pem)).toContain("BEGIN PUBLIC KEY");
  });
});
