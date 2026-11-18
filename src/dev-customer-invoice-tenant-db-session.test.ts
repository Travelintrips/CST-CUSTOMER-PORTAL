// @ts-nocheck — real module, synthetic database metadata, no live DB.
import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {assertDevCustomerInvoiceTenantDbSession} from "../server/dev-customer-invoice-tenant-db-session.mjs";

const flags=[
  "APP_ENV","CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
  "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
];
const prev=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
const roleFor=(companyId)=>companyId===1
  ?"bizportal_finance_cst_login_dev":"bizportal_finance_diva_login_dev";
const good=(companyId=1)=>({
  active_role:roleFor(companyId),login_role:roleFor(companyId),
  bypassrls:false,superuser:false,
  users_rls:true,sales_rls:true,journal_rls:true,lines_rls:true,
  ar_rls:true,audit_rls:true,outbox_rls:true,ppn_rls:true,
});
const reader=(row)=>vi.fn(async(statement,params)=>{
  expect(statement.trim().toLowerCase().startsWith("select")).toBe(true);
  expect(params).toEqual([]);
  return {rows:[row]};
});
beforeEach(()=>{
  process.env.APP_ENV="development";
  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV="true";
  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV="true";
});
afterEach(()=>{for(const k of flags){
  if(prev[k]===undefined)delete process.env[k];
  else process.env[k]=prev[k];
}});
describe("CST/Diva real-session tenant-bound Accounting gate — DEV only",()=>{
  it.each([1,3])("accepts company %i only as the exact LOGIN session with full RLS",async company=>{
    const q=reader(good(company));
    await expect(assertDevCustomerInvoiceTenantDbSession(q,company)).resolves.toBe(true);
    expect(q).toHaveBeenCalledTimes(1);
  });
  it("rejects BYPASSRLS postgres (current live Portal login) regardless of company proof",async()=>{
    const q=reader({...good(),active_role:"postgres",login_role:"postgres",bypassrls:true});
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({statusCode:503,code:"DEV_SALES_POSTING_TENANT_ROLE_UNAVAILABLE"});
  });
  it("rejects privilege escalation through SET ROLE when SESSION_USER differs",async()=>{
    const q=reader({...good(),login_role:"postgres"});
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({statusCode:503});
  });
  it.each([1,3])("rejects company %i if session uses the OTHER company's role",async company=>{
    const other=company===1?3:1;
    const q=reader(good(other));
    await expect(assertDevCustomerInvoiceTenantDbSession(q,company))
      .rejects.toMatchObject({statusCode:503});
  });
  it.each(["users_rls","sales_rls","journal_rls","lines_rls",
    "ar_rls","audit_rls","outbox_rls","ppn_rls"])(
    "rejects disabled RLS on %s before posting",async key=>{
      const q=reader({...good(),[key]:false});
      await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
        .rejects.toMatchObject({statusCode:503});
    });
  it.each([
    {superuser:true},{bypassrls:true},
    {active_role:"unknown"},
    {login_role:"unknown"},
  ])("rejects privileged or unmapped sessions",async changes=>{
    const q=reader({...good(),...changes});
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({statusCode:503});
  });
  it("rejects unknown company IDs without any DB lookup",async()=>{
    const q=reader(good());
    await expect(assertDevCustomerInvoiceTenantDbSession(q,2))
      .rejects.toMatchObject({statusCode:503});
    expect(q).not.toHaveBeenCalled();
  });
  it("fails closed on SQL failure without leaking backend details",async()=>{
    const q=vi.fn().mockRejectedValue(new Error("SQL: secret DSN must never surface"));
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({
        statusCode:503,message:"Koneksi posting Accounting berdasarkan perusahaan belum siap.",
      });
  });
  it.each(["production","preview"])("rejects environment %s",async env=>{
    process.env.APP_ENV=env;
    const q=reader(good());
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({statusCode:503});
    expect(q).not.toHaveBeenCalled();
  });
  it.each([
    "CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
    "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
  ])("rejects when %s is OFF",async flag=>{
    process.env[flag]="false";
    const q=reader(good());
    await expect(assertDevCustomerInvoiceTenantDbSession(q,1))
      .rejects.toMatchObject({statusCode:503});
    expect(q).not.toHaveBeenCalled();
  });
});
