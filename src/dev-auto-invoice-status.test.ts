import { describe, expect, it, vi } from "vitest";
import { readDevAutoInvoiceStatus } from "../server/dev-auto-invoice-status.mjs";
import { readFileSync } from "node:fs";

const env = {
  APP_ENV: "development", NODE_ENV: "development",
  CUSTOMER_PORTAL_AUTO_INVOICE_DEV: "true",
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "true",
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: "true",
  CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV: "true",
};
const user = { id: 11, role: "admin", email: "admcst001@gmail.com", authMethod: "email_otp" };

function fakeDb({ actor = false, invoice = "to_invoice", issuer = true } = {}) {
  const dbQuery = vi.fn(async (sql: string) => {
    expect(sql.trimStart().toLowerCase().startsWith("select")).toBe(true);
    expect(sql.toLowerCase()).not.toMatch(/for update|for share|insert |update |delete |alter |call /);
    if (sql.includes("public.users")) return {rows: issuer ? [{id: "canonical-id"}] : []};
    if (sql.includes("source_actors_dev")) return {rows: [{enabled: actor}]};
    if (sql.includes("sales_documents")) return {rows: [{id:108, invoice_status:invoice, invoice_number:null}]};
    throw new Error("Unexpected SQL");
  });
  return dbQuery;
}

describe("DEV invoice dashboard read-only status", () => {
  it("returns blocked before issuance when the CST AR actor is OFF, without any write", async () => {
    const dbQuery = fakeDb();
    const result = await readDevAutoInvoiceStatus({user, dbQuery, env});
    expect(result).toMatchObject({httpStatus:200,readOnly:true,actorReady:false,blocked:true,invoiced:0});
    expect(dbQuery).toHaveBeenCalledTimes(3);
  });
  it("reports ready but never posts when actor is ON and order is invoiceable", async () => {
    const dbQuery = fakeDb({actor:true});
    const result = await readDevAutoInvoiceStatus({user, dbQuery, env});
    expect(result).toMatchObject({httpStatus:200,readOnly:true,actorReady:true,ready:true,invoiced:0});
    expect(dbQuery).toHaveBeenCalledTimes(3);
  });
  it("does not reissue an already-invoiced document", async () => {
    const result = await readDevAutoInvoiceStatus({user,dbQuery:fakeDb({actor:true,invoice:"invoiced"}),env});
    expect(result.ready).toBe(false);
    expect(result.blocked).toBe(true);
  });
  it("refuses missing signed OTP, unauthorized canonical actor, or PROD without reading financial data", async () => {
    const noOtp = fakeDb();
    expect((await readDevAutoInvoiceStatus({user:{...user,authMethod:"google"},dbQuery:noOtp,env})).httpStatus).toBe(403);
    expect(noOtp).not.toHaveBeenCalled();
    const noIssuer = fakeDb({issuer:false});
    expect((await readDevAutoInvoiceStatus({user,dbQuery:noIssuer,env})).httpStatus).toBe(403);
    expect(noIssuer).toHaveBeenCalledTimes(1);
    const prod = fakeDb();
    expect((await readDevAutoInvoiceStatus({user,dbQuery:prod,env:{...env,APP_ENV:"production"}})).httpStatus).toBe(404);
    expect(prod).not.toHaveBeenCalled();
  });
  it("dashboard polling uses GET-only status, keeping POST issuance separate", () => {
    const admin = readFileSync("src/pages/admin.tsx","utf8");
    const api = readFileSync("server/index.mjs","utf8");
    expect(admin).toContain('fetch("/api/portal/admin/invoices/auto-issue-status", {\n            method: "GET"');
    expect(admin).not.toContain('fetch("/api/portal/admin/invoices/auto-issue-ready"');
    expect(api).toContain('request.method === "GET" && pathname === "/api/portal/admin/invoices/auto-issue-status"');
    expect(api).toContain('request.method === "POST" && pathname === "/api/portal/admin/invoices/auto-issue-ready"');
  });
});
