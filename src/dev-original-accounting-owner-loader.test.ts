import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  DEV_ACCOUNTING_OWNER_FILE,
  DEV_ACCOUNTING_OWNER_SHA256,
  originalOwnerGateEnabled,
  isReviewedOriginalOwnerBundle,
  loadDevOriginalAccountingOwner,
} from "../server/dev-original-accounting-owner-loader.mjs";

const originals = {
  APP_ENV: process.env.APP_ENV, NODE_ENV: process.env.NODE_ENV,
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV,
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV,
};
beforeEach(() => { vi.restoreAllMocks(); });
afterEach(() => {
  for (const [key, value] of Object.entries(originals)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});
describe("DEV Customer Invoice original owner release loader", () => {
  it("refuses PROD and partial flags without trying to import a bundle", () => {
    const good = { APP_ENV:"development", NODE_ENV:"development",
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true" };
    expect(originalOwnerGateEnabled(good)).toBe(true);
    expect(originalOwnerGateEnabled({...good, APP_ENV:"production"})).toBe(false);
    expect(originalOwnerGateEnabled({...good, NODE_ENV:"production"})).toBe(false);
    expect(originalOwnerGateEnabled({...good, NODE_ENV:"test"})).toBe(false);
    expect(originalOwnerGateEnabled({...good, CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false"})).toBe(false);
    expect(originalOwnerGateEnabled({...good, CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false"})).toBe(false);
  });
  it("pins an exact SHA-256 and rejects unreviewed or empty modules", () => {
    expect(DEV_ACCOUNTING_OWNER_SHA256).toMatch(/^[a-f0-9]{64}$/);
    expect(DEV_ACCOUNTING_OWNER_FILE).toBe("/opt/cst-customer-invoice-owner-bundle-dev/portalInvoiceOwner.mjs");
    expect(isReviewedOriginalOwnerBundle(Buffer.from("fake owner"))).toBe(false);
    expect(isReviewedOriginalOwnerBundle(Buffer.alloc(0))).toBe(false);
  });
  it("returns no callback when the approved flags are off", async () => {
    process.env.APP_ENV="development";
    process.env.NODE_ENV="development";
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV="false";
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV="false";
    await expect(loadDevOriginalAccountingOwner()).resolves.toBeNull();
  });
});
