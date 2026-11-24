import { CST_DEV_PROJECT_REF, evaluateCstDevDbaApproval } from "./dev-dba-superadmin-approval-policy.mjs";

// Read-only eligibility check. It does not record an approval or authorize DBA execution.
export async function readCstDevDbaApprovalReadiness({ operation, portalUser, dbQuery, env = process.env }) {
  const denied = evaluateCstDevDbaApproval({
    env, projectRef: CST_DEV_PROJECT_REF, operation,
    portalSession: portalUser, canonicalUser: null,
  });
  // Never probe canonical credentials when the signed Portal method or operation fails.
  if (denied.reason !== "CANONICAL_SUPER_ADMIN_REQUIRED") return denied;

  const found = await dbQuery(
    `select email, role, system_role, status, is_active, company_id
       from public.users
      where lower(btrim(email)) = $1
        and role = 'super_admin' and system_role = 'super_admin'
        and status = 'active' and is_active is true
      limit 2`,
    ["admcst001@gmail.com"],
  );
  // Multiple active canonical identities fail closed.
  if (found?.rows?.length !== 1) {
    return { approvalEligible: false, executionAuthorized: false, reason: "CANONICAL_SUPER_ADMIN_REQUIRED" };
  }
  return evaluateCstDevDbaApproval({
    env, projectRef: CST_DEV_PROJECT_REF, operation,
    portalSession: portalUser, canonicalUser: found.rows[0],
  });
}
