/**
 * DEV-only release safety gate for original Customer Invoice posting.
 * The existing canonical owner still writes the GL; this module does not
 * authorize a person or grant any SQL privileges.
 */
export const DEV_CUSTOMER_INVOICE_WRITER_ROLES = Object.freeze({
  1: "bizportal_customer_invoice_cst_writer_dev",
  3: "bizportal_customer_invoice_diva_writer_dev",
});

export const DEV_CUSTOMER_INVOICE_WRITER_ATTESTATION_SQL = `
select current_user::text as db_role,
       session_user::text as session_role,
       (select rolbypassrls from pg_roles where rolname=current_user) as bypass_rls,
       row_security_active('public.sales_documents'::regclass) as invoice_rls,
       row_security_active('public.accounting_entries'::regclass) as gl_rls,
       row_security_active('public.accounting_entry_lines'::regclass) as lines_rls,
       row_security_active('public.ar_subledger'::regclass) as ar_rls,
       row_security_active('public.transaction_taxes'::regclass) as taxes_rls,
       row_security_active('public.audit_accounting_events'::regclass) as audit_rls,
       row_security_active('public.financial_outbox_events'::regclass) as outbox_rls
`;

const REQUIRED_RLS = [
  "invoice_rls", "gl_rls", "lines_rls", "ar_rls",
  "taxes_rls", "audit_rls", "outbox_rls",
];
function blocked() {
  return Object.assign(
    new Error("Identitas database Invoice DEV belum memiliki isolasi perusahaan."),
    {statusCode:503},
  );
}

export function isDirectCompanyInvoiceWriterSession(row,companyId) {
  const expected=DEV_CUSTOMER_INVOICE_WRITER_ROLES[Number(companyId)];
  return Boolean(expected && row
    && row.db_role===expected
    && row.session_role===expected
    && row.bypass_rls===false
    && REQUIRED_RLS.every(field=>row[field]===true));
}

export async function requireDirectCompanyInvoiceWriterSession(client,companyId) {
  if (process.env.APP_ENV?.trim().toLowerCase()!=="development" ||
      !DEV_CUSTOMER_INVOICE_WRITER_ROLES[Number(companyId)] ||
      typeof client?.query!=="function") throw blocked();
  let result;
  try {
    result=await client.query(DEV_CUSTOMER_INVOICE_WRITER_ATTESTATION_SQL);
  } catch {
    // Missing tables, missing metadata grants, or an unavailable connection
    // must never fall back to a privileged service role.
    throw blocked();
  }
  if (result?.rows?.length!==1 ||
      !isDirectCompanyInvoiceWriterSession(result.rows[0],companyId))
    throw blocked();
  return true;
}
