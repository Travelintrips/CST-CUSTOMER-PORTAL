/**
 * DEV-only Customer Invoice posting gate, using SAME caller-owned PG client.
 * A BYPASSRLS PostgreSQL role must NEVER act as a tenant-isolated writer.
 * Both existing CST/Diva Finance login roles are currently SELECT-only:
 * this module does not grant permissions, change DB roles or enable writes.
 */
const POSTING_ROLES = Object.freeze({
  1: "bizportal_finance_cst_login_dev",
  3: "bizportal_finance_diva_login_dev",
});

function unavailable() {
  return Object.assign(
    new Error("Koneksi posting Accounting berdasarkan perusahaan belum siap."),
    { statusCode: 503, code: "DEV_SALES_POSTING_TENANT_ROLE_UNAVAILABLE" },
  );
}

const metadataSql = [
  "select current_user::text as active_role,",
  "session_user::text as login_role,",
  "r.rolbypassrls as bypassrls,",
  "r.rolsuper as superuser,",
  "row_security_active('public.users'::regclass) as users_rls,",
  "row_security_active('public.sales_documents'::regclass) as sales_rls,",
  "row_security_active('public.accounting_entries'::regclass) as journal_rls,",
  "row_security_active('public.accounting_entry_lines'::regclass) as lines_rls,",
  "row_security_active('public.ar_subledger'::regclass) as ar_rls,",
  "row_security_active('public.audit_accounting_events'::regclass) as audit_rls,",
  "row_security_active('public.financial_outbox_events'::regclass) as outbox_rls,",
  "row_security_active('public.gl_tax_lines'::regclass) as ppn_rls",
  "from pg_catalog.pg_roles r where r.rolname = current_user",
].join("\n");

/** Necessary—not sufficient—pre-posting DB-isolation attestation.
 * Must run before any write, on both issue and replay, on the same PG client.
 * Actual RLS policy, privilege, trigger, origin and rollback still need proof.
 */
export async function assertDevCustomerInvoiceTenantDbSession(query, companyId) {
  if (process.env.APP_ENV?.trim().toLowerCase() !== "development" ||
      process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV !== "true" ||
      process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true" ||
      typeof query !== "function") {
    throw unavailable();
  }
  const expectedRole = POSTING_ROLES[companyId];
  if (!expectedRole) throw unavailable();

  let rows;
  try {
    const result = await query(metadataSql, []);
    rows = result?.rows;
  } catch {
    // Do not leak SQL, DSN, role metadata or backend errors to the client.
    throw unavailable();
  }
  if (!Array.isArray(rows) || rows.length !== 1) throw unavailable();
  const s = rows[0];
  if (s.active_role !== expectedRole ||
      s.login_role !== expectedRole ||
      s.bypassrls !== false || s.superuser !== false ||
      s.users_rls !== true || s.sales_rls !== true ||
      s.journal_rls !== true || s.lines_rls !== true ||
      s.ar_rls !== true || s.audit_rls !== true ||
      s.outbox_rls !== true || s.ppn_rls !== true) {
    throw unavailable();
  }
  return true;
}
