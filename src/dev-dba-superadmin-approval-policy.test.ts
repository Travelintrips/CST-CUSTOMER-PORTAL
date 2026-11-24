import { describe, expect, it } from "vitest";
import { evaluateCstDevDbaApproval, CST_DEV_PROJECT_REF } from "../server/dev-dba-superadmin-approval-policy.mjs";

const valid = {
  env: { APP_ENV: "development", NODE_ENV: "development" },
  projectRef: CST_DEV_PROJECT_REF,
  operation: "invoice108.relock.disposable_qa",
  portalSession: { role: "admin", authMethod: "email_otp", email: "admcst001@gmail.com" },
  canonicalUser: { role: "super_admin", system_role: "super_admin", status: "active", is_active: true, email: "admcst001@gmail.com", company_id: null },
};
const check = (change = {}) => evaluateCstDevDbaApproval({ ...valid, ...change });

describe("CST-DEV Super Admin DBA approval authority is not DBA execution", () => {
  it("recognizes eligible signed OTP and live canonical Super Admin but never grants execution", () => {
    expect(check()).toEqual({ approvalEligible: true, executionAuthorized: false, reason: "DBA_CUSTODIAN_EXECUTION_REQUIRED" });
  });
  it("does not authorize PROD or a foreign project", () => {
    expect(check({ projectRef: "nzdweipzckfszczzqtuw" }).approvalEligible).toBe(false);
    expect(check({ env: { APP_ENV: "production", NODE_ENV: "production" } }).approvalEligible).toBe(false);
  });
  it("rejects any operation not explicitly reviewed", () => {
    for (const operation of ["invoice108.post", "grant.superuser", "invoice109.relock.install_review", "", "invoice108.actor.enable"]) {
      expect(check({ operation }).approvalEligible).toBe(false);
    }
  });
  it("rejects legacy or non-OTP Portal sessions", () => {
    for (const authMethod of [null, "google", "password", "wa_otp"]) {
      expect(check({ portalSession: { ...valid.portalSession, authMethod } }).approvalEligible).toBe(false);
    }
    expect(check({ portalSession: { ...valid.portalSession, role: "customer" } }).approvalEligible).toBe(false);
  });
  it("rejects inactive, mismatched, or self-asserted canonical authority", () => {
    expect(check({ canonicalUser: { ...valid.canonicalUser, is_active: false } }).approvalEligible).toBe(false);
    expect(check({ canonicalUser: { ...valid.canonicalUser, role: "admin" } }).approvalEligible).toBe(false);
    expect(check({ canonicalUser: { ...valid.canonicalUser, email: "someone@example.invalid" } }).approvalEligible).toBe(false);
  });
  it("prevents cross-company DBA authority", () => {
    expect(check({ canonicalUser: { ...valid.canonicalUser, company_id: 3 } }).approvalEligible).toBe(false);
  });
});
