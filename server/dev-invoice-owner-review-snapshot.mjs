/**
 * CST-DEV only: financial source-snapshot for one signed Owner approval.
 * No new financial logic, tax calculation, database writer, grant or tables.
 * Exact persisted amounts/tax mapping are shown and bound to HMAC challenge.
 */
import {createHash,timingSafeEqual} from "node:crypto";

const deny = () => Object.assign(new Error("Ringkasan Invoice tidak konsisten atau berubah. Persetujuan Owner harus diulang."),{statusCode:409});
const trim = (v,max) => typeof v==="string" && v.trim() && v.trim().length<=max && !/[\u0000-\u001F\u007F]/.test(v)
  ? v.trim():null;
const id = v => Number.isSafeInteger(Number(v)) && Number(v)>0 ? Number(v):null;
function cents(v) {
  const str = typeof v==="number" || typeof v==="string" ? String(v).trim() : "";
  if(!/^\d{1,14}(\.\d{1,2})?$/.test(str)) throw deny();
  const [whole,frac=""]=str.split(".");
  const units=BigInt(whole)*100n+BigInt((frac+"00").slice(0,2));
  return {units,display:(units/100n).toString()+"."+(units%100n).toString().padStart(2,"0")};
}
function taxRate(v) {
  const str=typeof v==="number" || typeof v==="string" ? String(v).trim() : "";
  if(!/^\d{1,3}(\.\d{1,3})?$/.test(str)) throw deny();
  const [whole,frac=""]=str.split(".");
  const rate=(Number(whole)*1000)+Number((frac+"000").slice(0,3));
  if(rate>100000)throw deny();
  return (Math.trunc(rate/1000)).toString()+"."+(rate%1000).toString().padStart(3,"0");
}
export function invoiceReviewSnapshotRequired(env=process.env) {
  return env.APP_ENV?.trim().toLowerCase()==="development" &&
    env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV==="true" &&
    env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV==="true";
}
export function buildInvoiceOwnerReviewSnapshot(row) {
  const company=id(row?.company_id), invoice=id(row?.id), taxId=id(row?.selected_tax_id);
  const account=id(row?.selected_tax_account_id),mappedCompany=id(row?.tax_company_id);
  const doc=trim(row?.doc_number,96),customer=trim(row?.customer_name,180);
  const status=String(row?.status??""),invoiceStatus=String(row?.invoice_status??"");
  const treatment=row?.tax_treatment==null ? null : trim(row.tax_treatment,80);
  if(![1,3].includes(company) || !invoice || !doc || !customer ||
     !taxId || !account || mappedCompany!==company ||
     row?.selected_tax_active!==true ||
     Number(row?.ppn_output_account_id)!==account ||
     (row?.tax_rate_id!=null && id(row.tax_rate_id)!==taxId) ||
     (row?.tax_rate_id==null && id(row?.default_sales_tax_id)!==taxId) ||
     !["confirmed","done","completed"].includes(status) ||
     !["to_invoice","invoiced"].includes(invoiceStatus) ||
     (row?.cancelled_at!=null) ||
     (row?.tax_treatment!=null && !treatment)) throw deny();
  const subtotal=cents(row.total_amount),ppn=cents(row.tax_amount),gross=cents(row.grand_total);
  if(gross.units<=0n || subtotal.units+ppn.units!==gross.units)throw deny();
  const rate=taxRate(row.selected_tax_rate);
  // Never infer a replacement tax rate. Keep the canonical document tax and
  // tax account/source IDs so a changed mapping invalidates the approval.
  return Object.freeze({
    schemaVersion:1,companyId:company,
    companyName:company===1?"PT Cahaya Sejati Teknologi":"PT Diva Servis",
    invoiceId:invoice,documentNumber:doc,customerName:customer,
    currency:"IDR",subtotal:subtotal.display,ppn:ppn.display,
    total:gross.display,ppnRatePercent:rate,taxId,taxAccountId:account,
    taxTreatment:treatment,documentStatus:status,invoiceStatus,
  });
}
export function invoiceOwnerReviewDigest(snapshot) {
  if(!snapshot || snapshot.schemaVersion!==1)throw deny();
  return createHash("sha256").update(JSON.stringify(snapshot),"utf8").digest("hex");
}
export function assertSameInvoiceReviewDigest(expected,actual) {
  if(typeof expected!=="string" || !/^[a-f0-9]{64}$/.test(expected) ||
     typeof actual!=="string" || !/^[a-f0-9]{64}$/.test(actual) ||
     !timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(actual,"hex")))throw deny();
  return true;
}
// The same query runs as a read-only Portal preflight and, crucially, on the
// original dedicated RLS PostgreSQL client inside Invoice's locked transaction.
export async function readInvoiceOwnerReviewSnapshot(db,invoiceId) {
  const n=id(invoiceId);
  if(!n || typeof db!=="function")throw deny();
  const sql=[
    "select sd.id,sd.company_id,sd.doc_number,sd.customer_name,",
    "sd.total_amount,sd.tax_amount,sd.grand_total,sd.tax_rate_id,",
    "sd.tax_treatment,sd.status,sd.invoice_status,sd.cancelled_at,",
    "cfg.default_sales_tax_id,cfg.ppn_output_account_id,",
    "tax.id as selected_tax_id,tax.company_id as tax_company_id,",
    "tax.rate as selected_tax_rate,tax.account_id as selected_tax_account_id,",
    "tax.is_active as selected_tax_active",
    "from public.sales_documents sd",
    "join public.accounting_settings cfg on cfg.company_id=sd.company_id",
    "join public.accounting_taxes tax on tax.id=coalesce(sd.tax_rate_id,cfg.default_sales_tax_id)",
    "and tax.company_id=sd.company_id",
    "where sd.id=$1 and sd.company_id in (1,3)",
    "limit 2"
  ].join(" ");
  const result=await db(sql,[n]);
  if(result?.rows?.length!==1)throw deny();
  return buildInvoiceOwnerReviewSnapshot(result.rows[0]);
}
