import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { requiresInternalVendorAssignment as requires } from "./internal-vendor-quote-readiness";

const quote = { status: "invited", isInternalVendor: true,
  hasVendorPhone: false, hasActiveVendorAccount: false };

describe("DEV internal vendor quotation readiness is read-only", () => {
  it("identifies undeliverable invited internal quotation", () => {
    expect(requires(quote)).toBe(true);
  });
  it("continues to flag an opened or re-quote-required internal quotation", () => {
    expect(requires({ ...quote, status: "opened" })).toBe(true);
    expect(requires({ ...quote, status: "requote_requested" })).toBe(true);
  });
  it("does not flag an internal vendor with a reachable phone or authenticated vendor account", () => {
    expect(requires({ ...quote, hasVendorPhone: true })).toBe(false);
    expect(requires({ ...quote, hasActiveVendorAccount: true })).toBe(false);
  });
  it("does not show the warning for external vendors", () => {
    expect(requires({ ...quote, isInternalVendor: false })).toBe(false);
  });
  it("does not flag a submitted, selected or rejected quotation", () => {
    for (const status of ["submitted", "selected", "rejected"]) {
      expect(requires({ ...quote, status })).toBe(false);
    }
  });
  it("only fetches recipient existence in the existing Admin GET route and exposes no token/phone/email value", () => {
    const src = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const i = src.indexOf('const quotes = pathname.match(');
    const j = src.indexOf("const deal = pathname.match(", i);
    const route = src.slice(i,j);
    expect(route).toContain('request.method === "GET"');
    expect(route).toContain('has_active_vendor_account');
    expect(route).toContain('has_vendor_phone');
    expect(route).toContain('is_internal_vendor');
    expect(route).not.toContain('q.token');
    expect(route).not.toContain('q.token_hash');
    expect(route).not.toContain('recipient_phone:');
  });
});
