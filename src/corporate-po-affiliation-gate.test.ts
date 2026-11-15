import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertDevCorporatePoAffiliation,
  corporatePoApprovalGateDevEnabled,
  stageDevExistingCompanyApproval,
} from "../server/corporate-po-affiliation-gate.mjs";

const on = { APP_ENV: "development", CST_CORPORATE_PO_APPROVAL_GATE_DEV: "true" };
const off = { APP_ENV: "development", CST_CORPORATE_PO_APPROVAL_GATE_DEV: "false" };

function mockDb(type, approval = false) {
  return vi.fn(async (query, args) => {
    if (query.includes("from public.portal_customers")) {
      expect(args).toEqual([30]);
      return { rows: type ? [{ customer_type: type }] : [] };
    }
    if (query.includes("from public.portal_company_members")) {
      expect(args).toEqual([30, 2]);
      expect(query).toContain("request.status='approved'");
      expect(query).toContain("request.reviewed_by is not null");
      expect(query).toContain("request.reviewed_at is not null");
      expect(query).toContain("member.is_active=true");
      expect(query).toContain("coalesce(company.is_active,true)=true");
      return { rows: approval ? [{ "?column?": 1 }] : [] };
    }
    throw new Error("UNEXPECTED_QUERY");
  });
}

describe("DEV corporate PO financial affiliation preflight", () => {
  it("stays OFF in PROD and when flag is not enabled", async () => {
    for (const env of [off, { APP_ENV:"production", CST_CORPORATE_PO_APPROVAL_GATE_DEV:"true" }, {}]) {
      expect(corporatePoApprovalGateDevEnabled(env)).toBe(false);
      const db=vi.fn();
      expect(await assertDevCorporatePoAffiliation(db,{portal_customer_id:30, company_id:2},env)).toEqual({enabled:false});
      expect(db).not.toHaveBeenCalled();
    }
  });
  it("preserves the verified individual PO path without company affiliation", async () => {
    const db=mockDb("individual");
    expect(await assertDevCorporatePoAffiliation(db,{portal_customer_id:30,company_id:null},on))
      .toEqual({enabled:true,type:"individual",verified:true});
    expect(db).toHaveBeenCalledTimes(1);
  });
  it("rejects user-selected membership lacking recorded Admin approval", async () => {
    const db=mockDb("company",false);
    await expect(assertDevCorporatePoAffiliation(db,{portal_customer_id:30,company_id:2},on))
      .rejects.toMatchObject({statusCode:409});
    expect(db).toHaveBeenCalledTimes(2);
  });
  it("accepts only matching active membership plus Admin-approved request", async () => {
    const db=mockDb("company",true);
    expect(await assertDevCorporatePoAffiliation(db,{portal_customer_id:30,company_id:2},on))
      .toEqual({enabled:true,type:"company",verified:true});
    expect(db).toHaveBeenCalledTimes(2);
  });
  it("rejects company without selected ID before any membership query", async () => {
    const db=mockDb("company");
    await expect(assertDevCorporatePoAffiliation(db,{portal_customer_id:30,company_id:null},on))
      .rejects.toMatchObject({statusCode:409});
    expect(db).toHaveBeenCalledTimes(1);
  });
  it("rejects individual attempting to use a company ID", async () => {
    const db=mockDb("individual");
    await expect(assertDevCorporatePoAffiliation(db,{portal_customer_id:30,company_id:2},on))
      .rejects.toMatchObject({statusCode:409});
    expect(db).toHaveBeenCalledTimes(1);
  });
  it("fails closed on missing or ambiguous customer identity", async () => {
    const db=vi.fn();
    await expect(assertDevCorporatePoAffiliation(db,{portal_customer_id:null,company_id:2},on))
      .rejects.toMatchObject({statusCode:409});
    expect(db).not.toHaveBeenCalled();
    const missing=mockDb(null);
    await expect(assertDevCorporatePoAffiliation(missing,{portal_customer_id:30,company_id:2},on))
      .rejects.toMatchObject({statusCode:409});
  });
  it("places the preflight before any new PO insert but after legacy replay lookup", () => {
    const service=readFileSync(join(process.cwd(),"server/marketplace-service.mjs"),"utf8");
    const begin=service.indexOf("async function createPo(db, rfq, quote, user) {");
    const end=service.indexOf("async function transitionRfq(",begin);
    const scope=service.slice(begin,end);
    expect(scope.indexOf("select id from public.mkt_purchase_orders")).toBeGreaterThan(-1);
    expect(scope.indexOf("assertDevCorporatePoAffiliation(db, rfq)")).toBeGreaterThan(-1);
    expect(scope.indexOf("assertDevCorporatePoAffiliation(db, rfq)"))
      .toBeLessThan(scope.indexOf("insert into public.mkt_purchase_orders"));
  });
});


describe("DEV existing company selection to Admin review", () => {
  const company = { id:2, name:"PT Example Authorized", code:"CST" };
  const createDb = (approved = false) => vi.fn(async (sql,args) => {
    if (sql.includes("select 1") && sql.includes("portal_company_requests")) {
      expect(args).toEqual([30,2]);
      return {rows:approved?[{ok:1}]:[]};
    }
    if (sql.includes("insert into public.portal_company_requests")) {
      expect(args).toEqual([30,company.name]);
      expect(sql).toContain("on conflict (portal_customer_id, lower(requested_company_name))");
      expect(sql).toContain("where status = 'pending'");
      expect(sql).toContain("status='pending'");
      expect(sql).toContain("matched_company_id=null");
      return {rows:[]};
    }
    if (sql.includes("update public.portal_company_members")) {
      expect(args).toEqual([30,2]);
      expect(sql).toContain("is_active=false");
      return {rows:[]};
    }
    throw new Error("UNEXPECTED_DB_QUERY");
  });

  it("does not change existing onboarding behavior when the DEV gate is OFF",async()=>{
    const db=vi.fn();
    expect(await stageDevExistingCompanyApproval(db,30,company,off)).toEqual({enabled:false});
    expect(db).not.toHaveBeenCalled();
  });
  it("uses existing pending request workflow instead of granting self-service membership",async()=>{
    const db=createDb();
    expect(await stageDevExistingCompanyApproval(db,30,company,on))
      .toEqual({enabled:true,status:"company_pending"});
    expect(db).toHaveBeenCalledTimes(3);
    expect(String(db.mock.calls[1][0])).toContain("requested_company_name=excluded.requested_company_name");
  });
  it("returns company_mapped only for an already approved active membership",async()=>{
    const db=createDb(true);
    expect(await stageDevExistingCompanyApproval(db,30,company,on))
      .toEqual({enabled:true,status:"company_mapped"});
    expect(db).toHaveBeenCalledTimes(1);
  });
  it("refuses invalid company identity and does not write",async()=>{
    const db=vi.fn();
    await expect(stageDevExistingCompanyApproval(db,30,{id:2,name:""},on))
      .rejects.toMatchObject({statusCode:409});
    await expect(stageDevExistingCompanyApproval(db,0,company,on))
      .rejects.toMatchObject({statusCode:409});
    expect(db).not.toHaveBeenCalled();
  });
  it("routes BOTH onboarding and organization changes to Admin review when needed",()=>{
    const src=readFileSync(join(process.cwd(),"server/admin-portal.mjs"),"utf8");
    const selection=src.slice(src.indexOf("async function applyOrganizationSelection("),src.indexOf("async function handleOrganizationMutation("));
    expect(selection).toContain("stageDevExistingCompanyApproval(dbQuery, user.id, company)");
    expect(selection).toContain("if (!selectedCompanyPending)");
    expect(selection).toContain("profileStatus = (customerType === \"company\" && requestedCompanyName) || selectedCompanyPending");
    const onboard=src.slice(src.indexOf("async function handleOnboardingComplete("),src.indexOf("async function handleOnboardingStatus("));
    expect(onboard).toContain("stageDevExistingCompanyApproval(");
    expect(onboard).toContain('status: "company_pending"');
    expect(onboard).toContain("profile_status='pending'");
    expect(src).toContain("on conflict (portal_customer_id, lower(requested_company_name))");
    expect(src).toContain('corporatePoApprovalGateDevEnabled() && status === "approved" && matchedCompanyId == null');
  });
});
