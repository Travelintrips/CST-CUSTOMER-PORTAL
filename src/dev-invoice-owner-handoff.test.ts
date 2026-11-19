// @ts-nocheck
import {afterEach,beforeEach,describe,expect,it} from "vitest";
import {
 createInvoiceOwnerHandoff,submitInvoiceOwnerHandoff,takeInvoiceOwnerHandoff,
 isInvoiceOwnerHandoffEnabled,isTrustedInvoiceOwnerHandoffPost,
 resetInvoiceOwnerHandoffsForQa
} from "../server/dev-invoice-owner-handoff.mjs";
const enabled={APP_ENV:"development",CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"true",
 CUSTOMER_PORTAL_INVOICE_CROSS_DEVICE_HANDOFF_DEV:"true"};
const issuer={id:11,email:"staff.cst@example.invalid",role:"admin"};
const now=1_000_000;
const claim=()=>createInvoiceOwnerHandoff({issuer,invoiceId:77,companyId:1,
 challenge:"signed-issuer.challenge."+"x".repeat(80),
 bizportalOrigin:"https://bizportal-dev.example.invalid",env:enabled,now});
const proof="signed-owner-proof."+"y".repeat(100);
const verify=({portalUser,invoiceId,companyId,challenge,proof:p})=>
 portalUser.id===11&&portalUser.email===issuer.email&&
 invoiceId===77&&companyId===1&&challenge.includes("signed-issuer")&&p===proof
 ?{actorId:"owner-global",email:"owner@example.invalid"}:false;
beforeEach(()=>resetInvoiceOwnerHandoffsForQa());
afterEach(()=>resetInvoiceOwnerHandoffsForQa());
describe("DEV-only cross-device Owner OTP handoff, volatile fail-closed",()=>{
 it("requires ALL finance and independent Owner flags",()=>{
   for(const k of Object.keys(enabled)) {
     expect(isInvoiceOwnerHandoffEnabled({...enabled,[k]:"false"})).toBe(false);
   }
   expect(isInvoiceOwnerHandoffEnabled(enabled)).toBe(true);
 });
 it("opens only the exact cross-site/same-site BizPortal form POST and never a cookie mutation",()=>{
   const x=claim();
   const url="/api/portal/dev/invoice-owner-handoff/"+x.ticket;
   const env={...enabled,CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV:"https://bizportal-dev.example.invalid"};
   const req={method:"POST",url,headers:{origin:env.CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV,
      "sec-fetch-site":"same-site","content-type":"application/x-www-form-urlencoded"}};
   expect(isTrustedInvoiceOwnerHandoffPost(req,env)).toBe(true);
   expect(isTrustedInvoiceOwnerHandoffPost({...req,headers:{...req.headers,"sec-fetch-site":"cross-site"}},env)).toBe(true);
   for(const override of [
     {origin:"https://evil.invalid"},
     {cookie:"portal_session=evil"},
     {"sec-fetch-site":"none"},
     {"content-type":"application/json"},
   ])expect(isTrustedInvoiceOwnerHandoffPost({...req,headers:{...req.headers,...override}},env)).toBe(false);
   expect(isTrustedInvoiceOwnerHandoffPost({...req,url:"/api/portal/admin/invoices/77/action"},env)).toBe(false);
   expect(isTrustedInvoiceOwnerHandoffPost({...req,method:"GET"},env)).toBe(false);
   expect(isTrustedInvoiceOwnerHandoffPost({...req,url:url+"/other"},env)).toBe(false);
 });
 it("creates an HTTPS link with only signed challenge and unguessable ticket",()=>{
   const x=claim();expect(x.ticket).toMatch(/^[\w-]{43}$/);
   expect(x.approvalUrl).toMatch(/^https:\/\/bizportal-dev.example.invalid\/api\/auth\/dev\/customer-invoice-attestation\?/);
   expect(x.approvalUrl).not.toContain("signed-owner-proof");
 });
 it("keeps proof invisible to everyone until valid Owner signature accepted",()=>{
   const x=claim();
   expect(takeInvoiceOwnerHandoff({ticket:x.ticket,issuer,invoiceId:77,now,env:enabled}))
     .toEqual({ready:false});
   expect(()=>submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify:()=>false,now,env:enabled})).toThrow();
   expect(submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify,now,env:enabled})).toEqual({accepted:true});
   expect(takeInvoiceOwnerHandoff({ticket:x.ticket,issuer,invoiceId:77,now,env:enabled}))
     .toEqual({ready:true,bizportalInvoiceChallenge:"signed-issuer.challenge."+"x".repeat(80),bizportalInvoiceProof:proof});
   expect(()=>takeInvoiceOwnerHandoff({ticket:x.ticket,issuer,invoiceId:77,now,env:enabled})).toThrow();
 });
 it("denies another Admin or another Invoice",()=>{
   const x=claim();submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify,now,env:enabled});
   for(const [user,id] of [[{...issuer,id:12},77],[{...issuer,email:"evil@example.invalid"},77],[issuer,78]]) {
     expect(()=>takeInvoiceOwnerHandoff({ticket:x.ticket,issuer:user,invoiceId:id,now,env:enabled})).toThrow();
   }
   expect(takeInvoiceOwnerHandoff({ticket:x.ticket,issuer,invoiceId:77,now,env:enabled}).ready).toBe(true);
 });
 it("rejects ticket replay, altered ticket, missing signature or expired handoff",()=>{
   const x=claim();
   expect(()=>submitInvoiceOwnerHandoff({ticket:x.ticket+"a",proof,verify,now,env:enabled})).toThrow();
   expect(()=>submitInvoiceOwnerHandoff({ticket:x.ticket,proof:"invalid",verify,now,env:enabled})).toThrow();
   submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify,now,env:enabled});
   expect(()=>submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify,now,env:enabled})).toThrow();
   const y=claim();
   expect(()=>takeInvoiceOwnerHandoff({ticket:y.ticket,issuer,invoiceId:77,now:now+80_001,env:enabled})).toThrow();
 });
 it("never accepts HTTP or untrusted BizPortal origins",()=>{
   for(const origin of ["http://evil.invalid","https://evil.invalid/path","javascript:bad","https://owner:pass@evil.invalid"]) {
     expect(()=>createInvoiceOwnerHandoff({issuer,invoiceId:77,companyId:1,
      challenge:"x".repeat(80),bizportalOrigin:origin,env:enabled,now})).toThrow();
   }
 });
 it("lost process state always fails closed",()=>{
   const x=claim();resetInvoiceOwnerHandoffsForQa();
   expect(()=>submitInvoiceOwnerHandoff({ticket:x.ticket,proof,verify,now,env:enabled})).toThrow();
 });
 it("cannot operate on PROD even when all feature flags are accidentally set",()=>{
   expect(()=>createInvoiceOwnerHandoff({issuer,invoiceId:77,companyId:1,
     challenge:"x".repeat(80),bizportalOrigin:"https://valid.example.invalid",
     env:{...enabled,APP_ENV:"production"},now})).toThrow();
 });
});
