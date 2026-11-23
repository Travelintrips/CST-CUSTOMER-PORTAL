import { describe, expect, it } from "vitest";
import {
  isAutomaticInvoiceDevEnabled,
  isAutomaticInvoiceCompanyAllowed,
} from "../server/dev-auto-invoice-policy.mjs";

const ready = {
  APP_ENV: "development",
  NODE_ENV: "development",
  CUSTOMER_PORTAL_AUTO_INVOICE_DEV: "true",
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "true",
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: "true",
  CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV: "true",
};

describe("DEV automatic invoice policy", () => {
  it("requires OTP-authenticated Admin workflow plus every financial safety gate", () => {
    expect(isAutomaticInvoiceDevEnabled(ready)).toBe(true);
    expect(isAutomaticInvoiceDevEnabled({
      ...ready, CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV: "false",
    })).toBe(true);
    for (const key of Object.keys(ready)) {
      if (key === "APP_ENV" || key === "NODE_ENV") continue;
      expect(isAutomaticInvoiceDevEnabled({ ...ready, [key]: "false" })).toBe(false);
    }
  });

  it("is always disabled outside development", () => {
    expect(isAutomaticInvoiceDevEnabled({ ...ready, APP_ENV: "production" })).toBe(false);
    expect(isAutomaticInvoiceDevEnabled({ ...ready, NODE_ENV: "production" })).toBe(false);
  });

  it("does not enable automatic processing for Diva during the CST pilot", () => {
    expect(isAutomaticInvoiceCompanyAllowed(1)).toBe(true);
    expect(isAutomaticInvoiceCompanyAllowed(3)).toBe(false);
    expect(isAutomaticInvoiceCompanyAllowed(null)).toBe(false);
  });
});
