import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readCstDevDbaApprovalReadiness } from "../server/dev-dba-approval-readiness.mjs";

const env = { APP_ENV: "development", NODE_ENV: "development" };
const portalUser = { id: 11, role: "admin", authMethod: "email_otp", email: "admcst001@gmail.com" };
const canonical = { email: "admcst001@gmail.com", role: "super_admin", system_role: "super_admin", status: "active", is_active: true, company_id: null };
const operation = "invoice108.relock.disposable_qa";
const evaluate = (overrides: Record<string, unknown> = {}) => {
  const dbQuery = vi.fn().mockResolvedValue({ rows: [canonical] });
  return { dbQuery, result: readCstDevDbaApprovalReadiness({ operation, portalUser, env, dbQuery, ...overrides }) };
};

describe("CST-DEV read-only DBA approval readiness", () => {
  it("accepts only a fresh signed OTP Admin and active canonical Super Admin, never permits execution", async () => {
    const { dbQuery, result } = evaluate();
    expect(await result).toEqual({ approvalEligible: true, executionAuthorized: false, reason: "DBA_CUSTODIAN_EXECUTION_REQUIRED" });
    expect(dbQuery).toHaveBeenCalledTimes(1);
    const sql = dbQuery.mock.calls[0][0] as string;
    expect(sql).toContain("select email, role, system_role, status, is_active, company_id");
    expect(sql.toLowerCase()).not.toMatch(/\b(update|insert|delete|alter|grant|drop)\b/);
  });
  it("does not access the DB for foreign project environments or invalid actions", async () => {
    for (const v of [{ env: { APP_ENV: "production", NODE_ENV: "production" } }, { operation: "invoice108.actor.enable" }]) {
      const { dbQuery, result } = evaluate(v);
      expect((await result).approvalEligible).toBe(false);
      expect(dbQuery).not.toHaveBeenCalled();
    }
  });
  it("does not query canonical identity for legacy login", async () => {
    const { dbQuery, result } = evaluate({ portalUser: { ...portalUser, authMethod: "google" } });
    expect((await result).approvalEligible).toBe(false);
    expect(dbQuery).not.toHaveBeenCalled();
  });
  it("rejects missing, duplicate or inactive canonical identity", async () => {
    for (const rows of [[], [canonical, canonical], [{ ...canonical, is_active: false }]]) {
      const { result } = evaluate({ dbQuery: vi.fn().mockResolvedValue({ rows }) });
      expect((await result).approvalEligible).toBe(false);
    }
  });
  it("route uses standard protected Admin session, GET-only and no issued approval", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    expect(index).toContain('request.method === "GET" && pathname === "/api/portal/admin/dba/approval-readiness"');
    expect(index).toContain("readCstDevDbaApprovalReadiness({");
    expect(index).toContain("const user = await requireAdmin(request, response);");
    expect(index).toContain('if (APP_ENV !== "development" || process.env.NODE_ENV !== "development")');
  });
});
