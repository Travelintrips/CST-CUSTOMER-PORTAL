/**
 * DEV financial release preflight. SQL intentionally read-only.
 * Tests existing canonical accounting configuration, NEVER chooses a tax rate
 * or modifies default_sales_tax_id. Existing posting owner remains authoritative.
 */
export const CANONICAL_INVOICE_TAX_PREFLIGHT_SQL = `
select
  s.company_id,
  s.default_sales_tax_id,
  s.ppn_output_account_id,
  t.company_id as tax_company_id,
  t.account_id as tax_account_id,
  t.kind::text as tax_kind,
  t.cut_type::text as tax_cut_type,
  t.is_active as tax_active,
  p.company_id as ppn_company_id,
  p.type::text as ppn_type,
  p.status as ppn_status,
  p.is_active as ppn_active,
  p.is_postable as ppn_postable
from public.accounting_settings s
left join public.accounting_taxes t on t.id=s.default_sales_tax_id
left join public.chart_of_accounts p on p.id=s.ppn_output_account_id
where s.company_id=any($1::int[])
order by s.company_id
`;

export function checkCanonicalInvoiceTaxReadiness(rows, expectedCompanies=[1,3]) {
  if(!Array.isArray(rows))throw Error("INVALID_TAX_CONFIGURATION_RESULTS");
  const issues=[];
  const companies=[...new Set(expectedCompanies)];
  for(const companyId of companies) {
    const selected=rows.filter(row=>Number(row.company_id)===companyId);
    if(selected.length!==1) {issues.push({companyId,reason:"MISSING_OR_DUPLICATE_SETTINGS"});continue;}
    const r=selected[0];
    if(Number(r.tax_company_id)!==companyId ||
       Number(r.ppn_company_id)!==companyId ||
       Number(r.tax_account_id)!==Number(r.ppn_output_account_id) ||
       !Number.isSafeInteger(Number(r.default_sales_tax_id)) ||
       r.tax_kind!=="sale" || r.tax_cut_type!=="self_borne" ||
       r.tax_active!==true || r.ppn_type!=="liability" ||
       r.ppn_status!=="ACTIVE" || r.ppn_active!==true ||
       r.ppn_postable!==true) {
      issues.push({companyId,reason:"TAX_ACCOUNT_COMPANY_SCOPE_INVALID"});
    }
  }
  return {go:issues.length===0,issues,checkedCompanyIds:companies};
}
