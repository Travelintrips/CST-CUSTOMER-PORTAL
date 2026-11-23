// @ts-nocheck: isolated no DB/financial writes.
import {describe,it,expect} from "vitest";
import {
 buildInvoiceOwnerReviewSnapshot,invoiceOwnerReviewDigest,
 assertSameInvoiceReviewDigest,readInvoiceOwnerReviewSnapshot,
 invoiceReviewSnapshotRequired,
} from "../server/dev-invoice-owner-review-snapshot.mjs";

const row=(company=1)=>({
 id:77,company_id:company,doc_number:"SO-QA-77",customer_name:"QA Test Client",
 total_amount:"100.00",tax_amount:"11.00",grand_total:"111.00",
 tax_rate_id:company===1?1:9,selected_tax_id:company===1?1:9,
 tax_company_id:company,selected_tax_rate:"11.000",
 selected_tax_account_id:company===1?49109:49199,
 ppn_output_account_id:company===1?49109:49199,
 selected_tax_active:true,tax_treatment:"taxable",
 status:"confirmed",invoice_status:"to_invoice",cancelled_at:null,
});
describe("snapshot of persisted Invoice + canonical tax authority",()=>{
 it.each([1,3])("binds original CST/Diva company %i amount, customer, tax and journal mapping",company=>{
   const snapshot=buildInvoiceOwnerReviewSnapshot(row(company));
   expect(snapshot).toMatchObject({
     companyId:company,invoiceId:77,documentNumber:"SO-QA-77",
     customerName:"QA Test Client",subtotal:"100.00",ppn:"11.00",
     total:"111.00",ppnRatePercent:"11.000",
     taxAccountId:company===1?49109:49199,
   });
   const digest=invoiceOwnerReviewDigest(snapshot);
   expect(digest).toMatch(/^[a-f0-9]{64}$/);
   expect(assertSameInvoiceReviewDigest(digest,invoiceOwnerReviewDigest({...snapshot}))).toBe(true);
 });
 it.each([
   ["changed total",{grand_total:"121.00"}],
   ["wrong tax company",{tax_company_id:3}],
   ["wrong output PPN account",{ppn_output_account_id:1234}],
   ["cancelled invoice",{cancelled_at:"2026-11-19"}],
   ["wrong tax id",{selected_tax_id:9}],
   ["inactive tax",{selected_tax_active:false}],
   ["negative tax",{tax_amount:"-1.00"}],
   ["missing amount",{tax_amount:null}],
   ["unknown company",{company_id:9}],
   ["excess decimals",{grand_total:"111.00001"}],
   ["noninvoiceable status",{status:"draft"}],
 ])("fails closed on %s",(_name,change)=>{
   expect(()=>buildInvoiceOwnerReviewSnapshot({...row(1),...change})).toThrow();
 });
 it.each(["customer_name","total_amount","tax_amount","grand_total","selected_tax_rate","selected_tax_account_id","doc_number"])(
   "changing %s changes HMAC-bound review digest",field=>{
     const base=row(1),altered={...base,[field]:({
       customer_name:"DIFFERENT CUSTOMER",total_amount:"101.00",
       tax_amount:"12.00",grand_total:"112.00",
       selected_tax_rate:"12.000",selected_tax_account_id:49110,
       doc_number:"SO-QA-78",
     })[field]};
     // A mismatch either changes the digest or invalidates the underlying
     // accounting invariant outright; never swallow a failing assertion.
     const oldDigest=invoiceOwnerReviewDigest(buildInvoiceOwnerReviewSnapshot(base));
     let next=null;
     try {next=buildInvoiceOwnerReviewSnapshot(altered);}
     catch {}
     if(!next) expect(()=>buildInvoiceOwnerReviewSnapshot(altered)).toThrow();
     else {
       const newDigest=invoiceOwnerReviewDigest(next);
       expect(newDigest).not.toBe(oldDigest);
       expect(()=>assertSameInvoiceReviewDigest(oldDigest,newDigest)).toThrow();
     }
   });
 it("fetches source through the caller-provided transaction, never a privileged secondary pool",async()=>{
   const commands=[];
   const db=async(q,args)=>{commands.push([q,args]);return {rows:[row(1)]}};
   const snapshot=await readInvoiceOwnerReviewSnapshot(db,77);
   expect(snapshot.invoiceId).toBe(77);
   expect(commands).toHaveLength(1);
   expect(commands[0][0]).toContain("public.accounting_taxes");
   expect(commands[0][1]).toEqual([77]);
 });
 it("requires the dedicated exact DEV flags and refuses default-OFF or production",()=>{
   const env={APP_ENV:"development",
     CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
     CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
     CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"true",
     CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV:"true"};
   expect(invoiceReviewSnapshotRequired(env)).toBe(true);
   // Source/tax snapshot remains mandatory even when the old per-invoice
   // second-application approval gate is disabled.
   expect(invoiceReviewSnapshotRequired({...env,CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false"})).toBe(true);
   expect(invoiceReviewSnapshotRequired({...env,APP_ENV:"production"})).toBe(false);
   expect(invoiceReviewSnapshotRequired({...env,CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV:"false"})).toBe(false);
 });
});
