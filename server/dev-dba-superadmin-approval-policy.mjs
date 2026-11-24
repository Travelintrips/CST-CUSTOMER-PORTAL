// CST-DEV policy only. Pure validation, not a DBA credential, session or executor.
// Canonical identity must be read independently from public.users by a trusted server.
// The signed Portal OTP session is distinct from PostgreSQL DBA authorization.
export const CST_DEV_PROJECT_REF = "xssrfshdrtdfupgqwfdw";
const APPROVER_EMAIL = "admcst001@gmail.com";
const ALLOWED_OPERATIONS = new Set([
  "invoice108.relock.disposable_qa",
  "invoice108.relock.install_review",
  "invoice108.writer.finite_lease_review",
]);

export function evaluateCstDevDbaApproval({ env = process.env, projectRef, operation, portalSession, canonicalUser }) {
  if (env.APP_ENV !== "development" || env.NODE_ENV !== "development" ||
      projectRef !== CST_DEV_PROJECT_REF) {
    return { approvalEligible: false, executionAuthorized: false, reason: "NOT_CST_DEV" };
  }
  if (!ALLOWED_OPERATIONS.has(operation)) {
    return { approvalEligible: false, executionAuthorized: false, reason: "OPERATION_NOT_ALLOWED" };
  }
  if (portalSession?.role !== "admin" ||
      portalSession?.authMethod !== "email_otp" ||
      String(portalSession?.email ?? "").trim().toLowerCase() !== APPROVER_EMAIL) {
    return { approvalEligible: false, executionAuthorized: false, reason: "SIGNED_PORTAL_OTP_REQUIRED" };
  }
  if (canonicalUser?.role !== "super_admin" ||
      canonicalUser?.system_role !== "super_admin" ||
      canonicalUser?.status !== "active" ||
      canonicalUser?.is_active !== true ||
      String(canonicalUser?.email ?? "").trim().toLowerCase() !== APPROVER_EMAIL ||
      (canonicalUser?.company_id != null && Number(canonicalUser.company_id) !== 1)) {
    return { approvalEligible: false, executionAuthorized: false, reason: "CANONICAL_SUPER_ADMIN_REQUIRED" };
  }
  return { approvalEligible: true, executionAuthorized: false, reason: "DBA_CUSTODIAN_EXECUTION_REQUIRED" };
}
