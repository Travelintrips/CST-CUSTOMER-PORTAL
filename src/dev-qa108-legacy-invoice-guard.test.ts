import { describe, expect, it } from "vitest";
import { mustDenyQa108LegacyInvoice } from "../server/dev-qa108-legacy-invoice-guard.mjs";

const qa = { id: 108, company_id: 1, doc_number: "QA-CST-DEV-OWNER-20261120-001" };

describe("DEV Customer Portal QA108 cannot use unposted legacy invoice action", () => {
  it("blocks exact synthetic QA order even when every feature flag is ON", () => {
    expect(mustDenyQa108LegacyInvoice(qa, {
      APP_ENV: "development",
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "true",
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: "true",
      CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV: "true",
    })).toBe(true);
  });
  it("blocks when feature flags are OFF or absent", () => {
    expect(mustDenyQa108LegacyInvoice(qa, { APP_ENV: "development" })).toBe(true);
    expect(mustDenyQa108LegacyInvoice(qa, { APP_ENV: "development", CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "false" })).toBe(true);
  });
  it("does not affect other order IDs, companies, references or PROD", () => {
    for (const alternate of [
      { ...qa, id: 109 },
      { ...qa, company_id: 3 },
      { ...qa, doc_number: "OTHER" },
    ]) expect(mustDenyQa108LegacyInvoice(alternate, { APP_ENV: "development" })).toBe(false);
    expect(mustDenyQa108LegacyInvoice(qa, { APP_ENV: "production" })).toBe(false);
    expect(mustDenyQa108LegacyInvoice(null, { APP_ENV: "development" })).toBe(false);
  });
});
