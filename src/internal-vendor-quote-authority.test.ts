import { describe, expect, it } from "vitest";
import {
  allowedInternalVendorCompanies,
  authorizeInternalVendorQuotation as authorize,
  internalVendorQuoteDevEnabled,
} from "../server/internal-vendor-quote-authority.mjs";

const env = {
  APP_ENV: "development",
  NODE_ENV: "test",
  CST_INTERNAL_VENDOR_QUOTE_DEV: "true",
  CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "1",
};
const base = {
  env,
  admin: { id: 19, role: "admin", account_status: "active" },
  rfq: { id: 23, company_id: 1, portal_customer_id: 31, status: "quoting" },
  quote: { id: 18, rfq_id: 23, vendor_id: 24, status: "invited", valid_until: "2099-11-23T00:00:00Z" },
  supplier: { id: 24, company_id: 1, is_internal_vendor: true, is_active: true },
  approvedBuyerCompany: true,
  intent: "submit_internal_vendor_quote",
  confirmed: true,
  reason: "Admin explicitly represents CST internal vendor in DEV",
  now: new Date("2026-11-17T00:00:00Z"),
};
const call = (overrides = {}) => authorize({ ...base, ...overrides });
const reject = (overrides, statusCode) =>
  expect(() => call(overrides)).toThrow(expect.objectContaining({ statusCode }));

describe("DEV-only internal vendor quotation authorization; no writer installed", () => {
  it("passes the approved CST internal vendor with explicit Admin acknowledgement", () => {
    expect(call()).toEqual({
      actorType: "admin", actorId: "19", actorName: "Internal vendor Admin #19",
      auditAction: "admin_internal_vendor_quote_submitted", rfqId: 23,
      quoteId: 18, vendorId: 24, companyId: 1,
      auditReason: base.reason,
    });
    expect(Object.isFrozen(call())).toBe(true);
  });
  it("fails closed in PROD, disabled flag and NODE_ENV production", () => {
    expect(internalVendorQuoteDevEnabled({ ...env, APP_ENV: "production" })).toBe(false);
    expect(internalVendorQuoteDevEnabled({ ...env, NODE_ENV: "production" })).toBe(false);
    expect(internalVendorQuoteDevEnabled({ ...env, CST_INTERNAL_VENDOR_QUOTE_DEV: "false" })).toBe(false);
    reject({ env: { ...env, APP_ENV: "production" } }, 404);
    reject({ env: { ...env, CST_INTERNAL_VENDOR_QUOTE_DEV: "false" } }, 404);
  });
  it("denies unsigned/non-Admin, inactive Admin and missing actor id", () => {
    for (const admin of [
      { ...base.admin, role: "customer" },
      { ...base.admin, role: "vendor" },
      { ...base.admin, account_status: "disabled" },
      { ...base.admin, id: null },
    ]) reject({ admin }, 403);
  });
  it("company allowlist refuses missing, wildcard, malformed and swapped company", () => {
    for (const value of ["", "*", "1,foo", "1,0", "01", "1, 3", "1;3"]) {
      expect(allowedInternalVendorCompanies({
        ...env, CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: value,
      }).size).toBe(0);
      reject({ env: { ...env, CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: value } }, 403);
    }
    reject({ env: { ...env, CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "3" } }, 403);
    expect([...allowedInternalVendorCompanies(env)]).toEqual([1]);
  });
  it("denies external supplier, inactive supplier and cross-company vendor", () => {
    reject({ supplier: { ...base.supplier, is_internal_vendor: false } }, 403);
    reject({ supplier: { ...base.supplier, is_active: false } }, 403);
    reject({ supplier: { ...base.supplier, company_id: 3 } }, 403);
  });
  it("requires a new Admin-reviewed company membership for the buyer", () => {
    reject({ approvedBuyerCompany: false }, 409);
    reject({ rfq: { ...base.rfq, portal_customer_id: null } }, 409);
  });
  it("never accepts unmatched quote, rfq or vendor identifiers", () => {
    reject({ rfq: { ...base.rfq, id: 22 } }, 404);
    reject({ quote: { ...base.quote, rfq_id: 22 } }, 404);
    reject({ quote: { ...base.quote, vendor_id: 25 } }, 404);
    reject({ supplier: { ...base.supplier, id: 25 } }, 404);
  });
  it("requires the RFQ to be quoting / quoted, not terminal or unsubmitted", () => {
    for (const status of ["draft", "submitted", "customer_review", "awarded", "cancelled"]) {
      reject({ rfq: { ...base.rfq, status } }, 409);
    }
    expect(call({ rfq: { ...base.rfq, status: "quoted" } }).rfqId).toBe(23);
  });
  it("rejects quotation already submitted, selected or withdrawn", () => {
    for (const status of ["submitted", "selected", "rejected", "withdrawn"]) {
      reject({ quote: { ...base.quote, status } }, 409);
    }
    expect(call({ quote: { ...base.quote, status: "opened" } }).quoteId).toBe(18);
  });
  it("rejects expired and malformed vendor invitation", () => {
    reject({ quote: { ...base.quote, valid_until: "2026-11-16T00:00:00Z" } }, 410);
    reject({ quote: { ...base.quote, valid_until: "not-a-date" } }, 410);
  });
  it("requires explicit intentional Admin action and meaningful reason", () => {
    reject({ confirmed: false }, 400);
    reject({ intent: "submit_vendor_quote" }, 400);
    reject({ reason: "test" }, 400);
    reject({ reason: "x".repeat(501) }, 400);
  });
  it("returns Admin attribution and never the vendor capability token", () => {
    const quote = { ...base.quote, token: "DO_NOT_EXPORT_VENDOR_TOKEN" };
    const result = call({ quote });
    expect(result.actorType).toBe("admin");
    expect(JSON.stringify(result)).not.toContain("DO_NOT_EXPORT_VENDOR_TOKEN");
    expect(result.auditAction).toBe("admin_internal_vendor_quote_submitted");
  });
});
