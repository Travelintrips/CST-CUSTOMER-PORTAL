import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isDevInvoiceScopedWriterRequested } from "../server/dev-customer-invoice-scoped-client.mjs";

const route = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
const devReady = {
  APP_ENV: "development",
  NODE_ENV: "development",
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "true",
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: "true",
  CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV: "true",
};

describe("CST-DEV HTTP Invoice action release gate", () => {
  it("wires the company-scoped writer readiness check before the trusted Accounting owner and handler", () => {
    const start = route.indexOf('const adminInvoiceActionMatch = pathname.match');
    const gate = route.indexOf('!isDevInvoiceScopedWriterRequested(process.env)', start);
    const owner = route.indexOf('postSalesInvoiceWithClient = await loadDevOriginalAccountingOwner()', start);
    const handler = route.indexOf('await handleAdminInvoices({', start);
    const stop = route.indexOf('const adminInvoiceMatch = pathname.match', start);
    expect(start).toBeGreaterThan(0);
    expect(start).toBeLessThan(gate);
    expect(gate).toBeLessThan(owner);
    expect(owner).toBeLessThan(handler);
    expect(handler).toBeLessThan(stop);
    expect(route.slice(start,stop)).toContain('sendError(response, 503, "Invoice DEV menunggu');
  });
  it("denies incomplete or missing financial flags", () => {
    expect(isDevInvoiceScopedWriterRequested({...devReady,
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false"})).toBe(false);
    expect(isDevInvoiceScopedWriterRequested({...devReady,
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false"})).toBe(false);
    expect(isDevInvoiceScopedWriterRequested({...devReady,
      CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false"})).toBe(true);
    expect(isDevInvoiceScopedWriterRequested({
      APP_ENV:"development",NODE_ENV:"development"})).toBe(false);
  });
  it("permits the handler route when atomic posting and posted-AR evidence are enabled", () => {
    expect(isDevInvoiceScopedWriterRequested(devReady)).toBe(true);
  });
  it("does not treat PROD runtime as an authorized DEV writer", () => {
    expect(isDevInvoiceScopedWriterRequested({...devReady,APP_ENV:"production"})).toBe(false);
    expect(isDevInvoiceScopedWriterRequested({...devReady,NODE_ENV:"production"})).toBe(false);
  });
});
