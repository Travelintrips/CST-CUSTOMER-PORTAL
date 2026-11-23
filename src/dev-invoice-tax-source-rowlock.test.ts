// @ts-nocheck — fixture only, exercises same DB-client SQL/order; real PG16
// privilege/RLS/race is covered separately by Docker --network none QA.
import {afterEach,describe,expect,it} from "vitest";
import {
  invoiceTaxSourceRowlockRequested,lockInvoiceTaxSourceRows,
} from "../server/dev-invoice-tax-source-rowlock.mjs";

const env={
  APP_ENV:"development",
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
  CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV:"true",
  CUSTOMER_PORTAL_INVOICE_TAX_SOURCE_ROWLOCK_DEV:"true",
};
const ownerRows=(company=1,taxId=company===1?1:9,overrides={})=>[
  [{company_id:company,default_sales_tax_id:taxId,ppn_output_account_id:company===1?49109:49199}],
  [{id:101,company_id:company,tax_rate_id:taxId}],
  [{id:taxId,company_id:company,account_id:company===1?49109:49199,is_active:true,rate:"11.000"}],
].map((rows,i)=>overrides[i]??rows);
const fixture=(company=1,taxId=company===1?1:9,overrides={})=>{
  const commands=[],values=ownerRows(company,taxId,overrides);
  const db=async(sql,args)=>{
    commands.push({sql,args});
    if(commands.length>values.length)throw Error("UNEXPECTED_QUERY");
    return {rows:values[commands.length-1]};
  };
  return {commands,db};
};
describe("DEV original-client financial tax-source lock",()=>{
  it.each([1,3])("locks source settings and original tax for company %i",async company=>{
    const t=fixture(company);
    const receipt=await lockInvoiceTaxSourceRows(t.db,company,101,env);
    expect(receipt).toEqual({companyId:company,invoiceId:101,taxId:company===1?1:9});
    expect(t.commands).toHaveLength(3);
    expect(t.commands[0].sql).toContain("for share");
    expect(t.commands[1].sql).not.toContain("for share");
    expect(t.commands[2].sql).toContain("for share");
    expect(t.commands[0].args).toEqual([company]);
    expect(t.commands[1].args).toEqual([101,company]);
    expect(t.commands[2].args).toEqual([company===1?1:9,company]);
  });
  it("requires every DEV feature flag, including new lock policy opt-in",async()=>{
    expect(invoiceTaxSourceRowlockRequested(env)).toBe(true);
    expect(invoiceTaxSourceRowlockRequested({
      ...env, CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false",
    })).toBe(true);
    for(const key of Object.keys(env)) {
      const e={...env,[key]:key==="APP_ENV"?"production":"false"};
      expect(invoiceTaxSourceRowlockRequested(e)).toBe(false);
      const t=fixture();
      await expect(lockInvoiceTaxSourceRows(t.db,1,101,e)).rejects.toMatchObject({statusCode:503});
    }
  });
  it("rejects cross-company accounting settings/tax row",async()=>{
    const a=fixture(1,1,{0:[{company_id:3,default_sales_tax_id:9,ppn_output_account_id:49199}]});
    await expect(lockInvoiceTaxSourceRows(a.db,1,101,env)).rejects.toMatchObject({statusCode:409});
    const b=fixture(1,1,{2:[{id:1,company_id:3,account_id:49109,is_active:true,rate:"11.000"}]});
    await expect(lockInvoiceTaxSourceRows(b.db,1,101,env)).rejects.toMatchObject({statusCode:409});
  });
  it.each([
    ["missing settings",{0:[]}],
    ["missing source",{1:[]}],
    ["missing tax",{2:[]}],
    ["tax inactive",{2:[{id:1,company_id:1,account_id:49109,is_active:false,rate:"11.000"}]}],
    ["wrong tax account",{2:[{id:1,company_id:1,account_id:999,is_active:true,rate:"11.000"}]}],
    ["wrong source invoice",{1:[{id:102,company_id:1,tax_rate_id:1}]}],
  ])("blocks %s without any financial update",async(_name,overrides)=>{
    const t=fixture(1,1,overrides);
    await expect(lockInvoiceTaxSourceRows(t.db,1,101,env)).rejects.toMatchObject({statusCode:409});
    expect(t.commands.every(x=>/^\s*select\b/i.test(x.sql))).toBe(true);
  });
  it("rejects direct unsupported invoice or company",async()=>{
    const t=fixture();
    await expect(lockInvoiceTaxSourceRows(t.db,4,101,env)).rejects.toMatchObject({statusCode:409});
    await expect(lockInvoiceTaxSourceRows(t.db,1,0,env)).rejects.toMatchObject({statusCode:409});
    expect(t.commands).toHaveLength(0);
  });
});
