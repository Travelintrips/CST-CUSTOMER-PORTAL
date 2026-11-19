/**
 * DEV signed financial review: lock exact company settings and tax source
 * rows on the original Invoice PostgreSQL client until COMMIT.
 * No secondary pool, privileged fallback, DDL or tax recalculation.
 */
import {invoiceReviewSnapshotRequired} from "./dev-invoice-owner-review-snapshot.mjs";
const deny=(code=409)=>Object.assign(new Error(
  code===503 ? "Penguncian sumber pajak Invoice DEV belum disiapkan." :
    "Sumber pajak Invoice berubah/tidak valid. Persetujuan Owner harus diulang."
),{statusCode:code});
const id=(v)=>Number.isSafeInteger(Number(v))&&Number(v)>0?Number(v):null;

export function invoiceTaxSourceRowlockRequested(env=process.env) {
  return invoiceReviewSnapshotRequired(env) &&
    env.CUSTOMER_PORTAL_INVOICE_TAX_SOURCE_ROWLOCK_DEV==="true";
}

export async function lockInvoiceTaxSourceRows(db,companyId,invoiceId,env=process.env) {
  // Old signed-review-only configuration must not issue until the separate
  // narrow Postgres row-lock RLS policy is reviewed and enabled on CST-DEV.
  if(!invoiceTaxSourceRowlockRequested(env))throw deny(503);
  if(typeof db!=="function" || ![1,3].includes(Number(companyId)) ||
     !id(invoiceId))throw deny();
  const company=Number(companyId),invoice=id(invoiceId);
  // Fixed order: company accounting settings, document row (already FOR
  // UPDATE in original handler), then the exact accounting tax rate.
  const cfg=await db(
    "select company_id,default_sales_tax_id,ppn_output_account_id "+
    "from public.accounting_settings where company_id=$1 for share",
    [company],
  );
  if(cfg?.rows?.length!==1 || Number(cfg.rows[0].company_id)!==company ||
     !id(cfg.rows[0].ppn_output_account_id))throw deny();
  const source=await db(
    "select id,company_id,tax_rate_id from public.sales_documents "+
    "where id=$1 and company_id=$2 limit 2",
    [invoice,company],
  );
  if(source?.rows?.length!==1 || Number(source.rows[0].id)!==invoice ||
     Number(source.rows[0].company_id)!==company)throw deny();
  const taxId=id(source.rows[0].tax_rate_id??cfg.rows[0].default_sales_tax_id);
  if(!taxId)throw deny();
  const tax=await db(
    "select id,company_id,account_id,is_active,rate "+
    "from public.accounting_taxes where id=$1 and company_id=$2 for share",
    [taxId,company],
  );
  if(tax?.rows?.length!==1 || Number(tax.rows[0].id)!==taxId ||
     Number(tax.rows[0].company_id)!==company ||
     tax.rows[0].is_active!==true ||
     Number(tax.rows[0].account_id)!==Number(cfg.rows[0].ppn_output_account_id))throw deny();
  return Object.freeze({companyId:company,invoiceId:invoice,taxId});
}
