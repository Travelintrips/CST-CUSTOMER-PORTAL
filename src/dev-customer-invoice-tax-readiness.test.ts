import {describe,it,expect} from "vitest";
import {CANONICAL_INVOICE_TAX_PREFLIGHT_SQL,checkCanonicalInvoiceTaxReadiness} from "../scripts/dev-customer-invoice-tax-readiness.mjs";

const c=(companyId,taxId,overrides={})=>({
 company_id:companyId,default_sales_tax_id:taxId,
 ppn_output_account_id:companyId===1?49109:49199,
 tax_company_id:companyId,tax_account_id:companyId===1?49109:49199,
 tax_kind:"sale",tax_cut_type:"self_borne",tax_active:true,
 ppn_company_id:companyId,ppn_type:"liability",ppn_status:"ACTIVE",
 ppn_active:true,ppn_postable:true,...overrides,
});
describe("existing canonical tax mapping GO/NO-GO before Customer Invoice DEV activation",()=>{
 it("is read-only and selects only explicit company IDs",()=>{
   expect(CANONICAL_INVOICE_TAX_PREFLIGHT_SQL).toContain("where s.company_id=any($1::int[])");
   expect(CANONICAL_INVOICE_TAX_PREFLIGHT_SQL).not.toMatch(/\b(insert|update|delete|alter|drop|truncate)\b/i);
 });
 it("accepts configured same-company output tax settings without guessing a tax rate",()=>{
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1),c(3,9)])).toMatchObject({go:true,issues:[]});
 });
 it("blocks current Diva wrong-company default mapping",()=>{
   const report=checkCanonicalInvoiceTaxReadiness([
     c(1,1),c(3,1,{tax_company_id:1,tax_account_id:49109})
   ]);
   expect(report.go).toBe(false);
   expect(report.issues).toEqual([{companyId:3,reason:"TAX_ACCOUNT_COMPANY_SCOPE_INVALID"}]);
 });
 it("blocks missing, duplicate or inactive tax configuration",()=>{
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1)])).toMatchObject({go:false});
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1),c(1,1),c(3,9)])).toMatchObject({go:false});
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1),c(3,9,{ppn_active:false})])).toMatchObject({go:false});
 });
 it("blocks wrong output account or wrong kind",()=>{
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1),c(3,9,{tax_account_id:49109})]).go).toBe(false);
   expect(checkCanonicalInvoiceTaxReadiness([c(1,1),c(3,9,{tax_kind:"purchase"})]).go).toBe(false);
 });
});