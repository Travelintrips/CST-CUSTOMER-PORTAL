// @ts-nocheck — the imported JS service is deliberately tested with mocked IO.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, createPrivateKey, createPublicKey, hkdfSync, sign } from "node:crypto";
import { mintPortalInvoiceChallenge, verifyIndependentBizPortalSuperAdminProof } from "../server/dev-bizportal-invoice-attestation.mjs";

const m=vi.hoisted(()=>({
  sql:[],
  proof:[],
  status:"confirmed",
  invoiceStatus:"to_invoice",
  companyId:1,
  currentInvoiceNumber:null,
  viewUnavailable:false,
  query:vi.fn(),
  connect:vi.fn(),
  release:vi.fn(),
  notifyAdmins:vi.fn(),
  notifyPortalCustomers:vi.fn(),
  sendJson:vi.fn(),
  poster:vi.fn(),
  verifyIndependentOwner:vi.fn(),
  glRow:null,
  bizOwner:[],
  outbox:[],
  audits:[],
  failOutbox:false,
  failAudit:false,
  deferredConstraintFail:false,
  dbScopeOverride:null,
  arProjection:null,
}));
vi.mock("../server/db.mjs",()=>({
  pool:{connect:m.connect},
  query:vi.fn(),
}));
vi.mock("../server/storage.mjs",()=>({
  signedPaymentProofUrl:vi.fn(),
}));
vi.mock("../server/notification-service.mjs",()=>({
  bestEffortNotificationWrite:vi.fn(async (_db,work)=>work()),
  notifyAdmins:m.notifyAdmins,
  notifyPortalCustomers:m.notifyPortalCustomers,
}));

import {handleAdminInvoices} from "../server/billing-operations.mjs";

const flag="CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV";
const originalFlag=process.env[flag],originalEnv=process.env.APP_ENV;
const bridge="CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV";
const attestFlag="CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV";
const originalAttestFlag=process.env[attestFlag];
const originalBridge=process.env[bridge];

const base=()=>({
  id:101,doc_number:"SO-QA-101",kind:"order",
  status:m.status,invoice_status:m.invoiceStatus,
  company_id:m.companyId,customer_id:12,customer_name:"QA synthetic",
  grand_total:"100.00",total_amount:"100.00",amount_paid:"0",
  payment_status:"unpaid",
  invoice_number:m.currentInvoiceNumber,invoice_date:m.currentInvoiceNumber?"2026-11-17":null,
  due_date:m.currentInvoiceNumber?"2026-12-17":null,
  notes:null,
});
const issued=()=>({
  ...base(),invoice_status:"invoiced",
  invoice_number:"INV-SO-QA-101",invoice_date:"2026-11-17",due_date:"2026-12-17",
});
async function sqlMock(statement,params=[]){
  const q=String(statement).toLowerCase().trim();
  m.sql.push(q);
  if(q==="begin"||q==="commit"||q==="rollback")return {rows:[]};
  if(q.includes("from pg_catalog.pg_roles r")) {
    const role=m.companyId===3
      ?"bizportal_finance_diva_login_dev"
      :"bizportal_finance_cst_login_dev";
    if(m.dbScopeOverride?.simulateSqlError)throw Error("QA_FAKE_DATABASE_ERROR");
    if(m.dbScopeOverride?.noRow)return {rows:[]};
    return {rows:[{
      active_role:role,login_role:role,bypassrls:false,superuser:false,
      users_rls:true,sales_rls:true,journal_rls:true,lines_rls:true,
      ar_rls:true,audit_rls:true,outbox_rls:true,ppn_rls:true,
      ...(m.dbScopeOverride??{}),
    }]};
  }
  if(q.startsWith("set constraints customer_ar_journal_source_dev")) {
    if(m.deferredConstraintFail)throw Error("QA_DEFERRED_AR_CONSTRAINT_VIOLATION");
    return {rows:[]};
  }
  if(q.includes("from public.ar_subledger a"))return {rows:m.arProjection?[m.arProjection]:[]};
  if(q.includes("from public.sales_documents"))return {rows:[base()]};
  if(q.startsWith("update public.sales_documents"))return {rows:[issued()]};
  if(q.includes("from public.users")) {
    // Emulate the WHERE clause of the canonical owner's active Super Admin
    // lookup, ensuring inactive same-email legacy accounts never confer rights.
    if(!q.includes("and role = 'super_admin'") ||
        !q.includes("and system_role = 'super_admin'") ||
        !q.includes("and status = 'active'") ||
        !q.includes("and is_active is true"))throw Error("UNSCOPED_BIZPORTAL_OWNER_LOOKUP");
    return {rows:m.bizOwner.filter(user=>
      user.role==="super_admin" && user.system_role==="super_admin" &&
      user.status==="active" && user.is_active===true).slice(0,2)};
  }
  if(q.includes("from public.accounting_entries e")){
    return {rows: m.glRow ? [m.glRow] : []};
  }
  if(q.includes("from public.financial_outbox_events"))return {rows:m.outbox};
  if(q.includes("into public.financial_outbox_events")){
    if(m.failOutbox)throw Error("QA_OUTBOX_INSERT_FAILED");
    const payload=JSON.parse(params[0]);
    m.outbox.push({id:601,payload});
    return {rows:[{id:601}]};
  }
  if(q.includes("from public.audit_accounting_events"))return {rows:m.audits};
  if(q.includes("into public.audit_accounting_events")){
    if(m.failAudit)throw Error("QA_ACCOUNTING_AUDIT_INSERT_FAILED");
    m.audits.push({id:701});
    return {rows:[{id:701}]};
  }
  if(q.includes("from public.bizportal_customer_ar_source_evidence_dev")){
    if(m.viewUnavailable)throw Object.assign(new Error("view missing"),{code:"42P01"});
    return {rows:m.proof.map(id=>({invoice_id:id}))};
  }
  if(q.includes("from public.portal_customers"))return {rows:[]};
  if(q.includes("into public.activity_logs"))return {rows:[]};
  throw Error("UNEXPECTED_SQL_IN_TEST");
}
const perform=(posting=null,portalUser=null,verifier=m.verifyIndependentOwner)=>handleAdminInvoices({
  request:{method:"POST",body:{action:"mark_invoiced",bizportalInvoiceChallenge:"qa-signed-challenge",bizportalInvoiceProof:"qa-bizportal-proof"}},
  response:{},
  user:portalUser ?? {id:1,role:"admin",name:"DEV QA",email:"qa.owner@example.invalid"},
  sendJson:m.sendJson,
  sendError:vi.fn(),
  invoiceId:101,
  postSalesInvoiceWithClient:posting,
  verifySignedBizPortalProof:verifier,
});
const sqlIndex=(substring)=>m.sql.findIndex(q=>q.includes(substring));
const noOutbound=()=>{
  expect(m.notifyAdmins).not.toHaveBeenCalled();
  expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
  expect(sqlIndex("into public.activity_logs")).toBe(-1);
};

beforeEach(()=>{
  vi.clearAllMocks();
  m.sql.length=0;
  m.proof=[];
  m.status="confirmed";
  m.invoiceStatus="to_invoice";
  m.companyId=1;
  m.currentInvoiceNumber=null;
  m.viewUnavailable=false;
  m.glRow=null;
  m.outbox=[];
  m.audits=[];
  m.failOutbox=false;
  m.failAudit=false;
  m.deferredConstraintFail=false;
  m.dbScopeOverride=null;
  m.arProjection={gl_entry_id:22,gross_amount:"100.00",paid_amount:"0",outstanding_amount:"100.00"};
  m.bizOwner=[{
    id:"qa-existing-bizportal-owner",role:"super_admin",
    system_role:"super_admin",status:"active",is_active:true,company_id:null,
  }];
  delete process.env[bridge];
  m.query.mockImplementation(sqlMock);
  m.connect.mockResolvedValue({query:m.query,release:m.release});
  m.notifyAdmins.mockResolvedValue(undefined);
  m.verifyIndependentOwner.mockResolvedValue(true);
  m.notifyPortalCustomers.mockResolvedValue(undefined);
  process.env.APP_ENV="development";
  process.env[flag]="true";
});
afterEach(()=>{
  if(originalFlag===undefined)delete process.env[flag];else process.env[flag]=originalFlag;
  if(originalEnv===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=originalEnv;
  if(originalBridge===undefined)delete process.env[bridge];else process.env[bridge]=originalBridge;
  if(originalAttestFlag===undefined)delete process.env[attestFlag];else process.env[attestFlag]=originalAttestFlag;
});

describe("DEV Customer Invoice posted AR evidence gate",()=>{
  it("rolls back invoice number/status/date when a posted sales journal is missing",async()=>{
    await expect(perform()).rejects.toMatchObject({statusCode:422});
    expect(sqlIndex("update public.sales_documents")).toBeGreaterThanOrEqual(0);
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev"))
      .toBeGreaterThan(sqlIndex("update public.sales_documents"));
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("reuses security-invoker AR evidence after invoice fields are updated and before notifications",async()=>{
    m.proof=[101];
    await perform();
    expect(m.sql).toContain("commit");
    const proof=sqlIndex("from public.bizportal_customer_ar_source_evidence_dev");
    const audit=sqlIndex("into public.activity_logs");
    expect(proof).toBeGreaterThan(sqlIndex("update public.sales_documents"));
    expect(proof).toBeLessThan(audit);
    expect(m.notifyAdmins).toHaveBeenCalledTimes(1);
    expect(m.notifyPortalCustomers).toHaveBeenCalledTimes(1);
    expect(m.sendJson).toHaveBeenCalledWith({},200,expect.objectContaining({
      id:101,invoiceStatus:"invoiced",invoiceNumber:"INV-SO-QA-101",
    }));
  });
  it("never accepts ambiguous posted AR evidence or a different invoice identity",async()=>{
    for (const found of [[101,101],[999]]) {
      m.sql.length=0;m.proof=found;
      await expect(perform()).rejects.toMatchObject({statusCode:422});
      expect(m.sql).toContain("rollback");
      noOutbound();
    }
  });
  it("does not let replay of an old invoice bypass missing posted journal proof",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    await expect(perform()).rejects.toMatchObject({statusCode:422});
    expect(sqlIndex("update public.sales_documents")).toBe(-1);
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("refuses unsupported company/issuer identity while DEV gate is ON",async()=>{
    m.companyId=2;
    await expect(perform()).rejects.toMatchObject({statusCode:422});
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("fails closed if the AR evidence view is missing (no unproven commit)",async()=>{
    m.viewUnavailable=true;
    await expect(perform()).rejects.toMatchObject({code:"42P01"});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("does not change old invoice behavior while flag is OFF",async()=>{
    delete process.env[flag];
    await perform();
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.sql).toContain("commit");
    expect(m.notifyAdmins).toHaveBeenCalledTimes(1);
  });
  it("rejects a mistaken production activation instead of bypassing the proof gate",async()=>{
    process.env.APP_ENV="production";
    await expect(perform()).rejects.toMatchObject({statusCode:503});
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
});


describe("DEV-only atomic Accounting owner integration seam",()=>{
  const validGl=()=>({
    id:22,company_id:m.companyId,source:"sales_invoice",source_id:101,
    status:"posted",total_debit:"100.00",total_credit:"100.00",
    is_voided:false,is_reversed:false,journal_company:m.companyId,
    source_count:1,line_count:2,lines_debit:"100.00",lines_credit:"100.00",
  });
  beforeEach(()=>{
    process.env[bridge]="true";
    process.env[flag]="true";
    process.env[attestFlag]="true";
    m.poster.mockResolvedValue({posted:true,entryId:22});
    m.glRow=validGl();
    m.proof=[101];
  });
  it("verifies exact non-BYPASSRLS DB login before checking BizPortal identity or writing",async()=>{
    await perform(m.poster);
    const scope=sqlIndex("from pg_catalog.pg_roles r");
    expect(scope).toBeGreaterThan(sqlIndex("from public.sales_documents"));
    expect(scope).toBeLessThan(sqlIndex("from public.users"));
    expect(scope).toBeLessThan(sqlIndex("update public.sales_documents"));
    expect(m.poster).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["BYPASSRLS login",{active_role:"postgres",login_role:"postgres",bypassrls:true}],
    ["wrong company login",{active_role:"bizportal_finance_diva_login_dev",login_role:"bizportal_finance_diva_login_dev"}],
    ["SET ROLE impersonation",{login_role:"postgres"}],
    ["RLS disabled on Invoice",{sales_rls:false}],
    ["RLS disabled on GL",{journal_rls:false}],
    ["RLS disabled on audit",{audit_rls:false}],
    ["metadata lookup failed",{simulateSqlError:true}],
    ["metadata absent",{noRow:true}],
  ])("rejects %s before any Accounting, outbox or notification",async(_label,overrides)=>{
    m.dbScopeOverride=overrides;
    await expect(perform(m.poster)).rejects.toMatchObject({
      statusCode:503,code:"DEV_SALES_POSTING_TENANT_ROLE_UNAVAILABLE",
    });
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("from public.users")).toBe(-1);
    expect(sqlIndex("update public.sales_documents")).toBe(-1);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("protects posted Invoice replay from wrong tenant DB session",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    m.dbScopeOverride={active_role:"postgres",login_role:"postgres",bypassrls:true};
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:503});
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
  });
  it("requires real materialized AR matching the posted company journal before COMMIT",async()=>{
    m.arProjection=null;
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(sqlIndex("from public.ar_subledger a")).toBeGreaterThan(sqlIndex("set constraints customer_ar_journal_source_dev"));
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.sendJson).not.toHaveBeenCalled();
  });
  it("rejects materialized AR with mismatched amounts before COMMIT",async()=>{
    m.arProjection={gl_entry_id:22,gross_amount:"99.00",paid_amount:"0",outstanding_amount:"99.00"};
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
  });
  it("never flushes accounting constraints during legacy payment transactions",async()=>{
    // This branch ensures the transaction helper itself is not globally gated;
    // the actual payment HTTP regression is covered by the full Portal CI.
    delete process.env[bridge];
    await perform();
    expect(sqlIndex("set constraints customer_ar_journal_source_dev")).toBe(-1);
    expect(sqlIndex("from public.ar_subledger a")).toBe(-1);
    expect(m.sql).toContain("commit");
  });
  it("forces original deferred AR constraint triggers before COMMIT under atomic DEV flags",async()=>{
    await perform(m.poster);
    const constraint=sqlIndex("set constraints customer_ar_journal_source_dev");
    expect(constraint).toBeGreaterThan(sqlIndex("into public.audit_accounting_events"));
    expect(constraint).toBeGreaterThan(sqlIndex("into public.activity_logs"));
    expect(constraint).toBeGreaterThan(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev"));
    expect(constraint).toBeLessThan(m.sql.indexOf("commit"));
    expect(sqlIndex("from public.ar_subledger a")).toBeGreaterThan(constraint);
    expect(sqlIndex("from public.ar_subledger a")).toBeLessThan(m.sql.indexOf("commit"));
    expect(m.sql).toContain("commit");
  });
  it("rolls back the entire Invoice if original deferred AR constraint fails",async()=>{
    m.deferredConstraintFail=true;
    await expect(perform(m.poster)).rejects.toThrow("QA_DEFERRED_AR_CONSTRAINT_VIOLATION");
    expect(sqlIndex("set constraints customer_ar_journal_source_dev")).toBeGreaterThan(0);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.sendJson).not.toHaveBeenCalled();
  });
  it("requires independently signed BizPortal proof after checking the DB owner and before posting",async()=>{
    await perform(m.poster);
    expect(m.verifyIndependentOwner).toHaveBeenCalledWith(expect.objectContaining({
      challenge:"qa-signed-challenge",proof:"qa-bizportal-proof",
      companyId:1,invoiceId:101,canonicalActorId:"qa-existing-bizportal-owner",
      portalUser:expect.objectContaining({id:1,role:"admin"}),
    }));
    expect(m.poster).toHaveBeenCalledTimes(1);
    expect(sqlIndex("from public.users")).toBeGreaterThan(0);
    expect(sqlIndex("update public.sales_documents")).toBeGreaterThan(sqlIndex("from public.users"));
  });
  it("refuses to post or replay if independent BizPortal attestation opt-in is OFF",async()=>{
    delete process.env[attestFlag];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:503});
    expect(m.verifyIndependentOwner).not.toHaveBeenCalled();
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("refuses to post when no trusted verification callback is wired",async()=>{
    await expect(perform(m.poster,null,null)).rejects.toMatchObject({statusCode:503});
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("denies invalid signature / wrong company / mismatched identity before posting",async()=>{
    m.verifyIndependentOwner.mockResolvedValue(false);
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("update public.sales_documents")).toBe(-1);
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("does not let a posted Invoice bypass independent BizPortal proof on replay",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    m.verifyIndependentOwner.mockResolvedValue(false);
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:403});
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("records canonical BizPortal actor, not the unrelated Portal user ID",async()=>{
    await perform(m.poster);
    expect(m.poster).toHaveBeenCalledTimes(1);
    expect(m.poster.mock.calls[0][0].actorId).toBe("qa-existing-bizportal-owner");
    expect(sqlIndex("from public.users")).toBeGreaterThan(sqlIndex("from public.sales_documents"));
    expect(sqlIndex("from public.users")).toBeLessThan(sqlIndex("from public.accounting_entries e"));
    expect(m.sql).toContain("commit");
  });
  it.each([
    ["no matching canonical owner", []],
    ["multiple matched identities", [
      {id:"a",role:"super_admin",system_role:"super_admin",status:"active",is_active:true,company_id:null},
      {id:"b",role:"super_admin",system_role:"super_admin",status:"active",is_active:true,company_id:null},
    ]],
    ["ordinary BizPortal admin", [{id:"other",role:"admin",system_role:"admin",status:"active",is_active:true,company_id:null}]],
    ["system role not Super Admin", [{id:"other",role:"super_admin",system_role:null,status:"active",is_active:true,company_id:null}]],
    ["suspended canonical owner", [{id:"other",role:"super_admin",system_role:"super_admin",status:"inactive",is_active:false,company_id:null}]],
    ["wrong company", [{id:"other",role:"super_admin",system_role:"super_admin",status:"active",is_active:true,company_id:3}]],
  ])("rejects %s before Accounting and rolls back",async(_label,matched)=>{
    m.bizOwner=matched;
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("ignores inactive legacy same-email Admin while requiring one active Super Admin and independent signed proof",async()=>{
    m.bizOwner=[
      {id:"dev_legacy_admin",role:"admin",system_role:null,status:"inactive",is_active:false,company_id:null},
      {id:"qa-existing-bizportal-owner",role:"super_admin",system_role:"super_admin",
        status:"active",is_active:true,company_id:null},
    ];
    await perform(m.poster);
    expect(m.poster).toHaveBeenCalledTimes(1);
    expect(m.poster.mock.calls[0][0].actorId).toBe("qa-existing-bizportal-owner");
    expect(m.verifyIndependentOwner).toHaveBeenCalledTimes(1);
    expect(m.sql).toContain("commit");
  });
  it("still rejects two active Super Admin identities sharing one email",async()=>{
    m.bizOwner=[
      {id:"owner_a",role:"super_admin",system_role:"super_admin",
        status:"active",is_active:true,company_id:null},
      {id:"owner_b",role:"super_admin",system_role:"super_admin",
        status:"active",is_active:true,company_id:null},
    ];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.verifyIndependentOwner).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("requires a database-verified Portal email for canonical owner lookup",async()=>{
    await expect(perform(m.poster,{id:1,role:"admin",name:"QA no-email"}))
      .rejects.toMatchObject({statusCode:403});
    expect(sqlIndex("from public.users")).toBe(-1);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("does not let an unauthorized Portal admin replay a posted Invoice",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    m.bizOwner=[];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:403});
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it.each([1,3])("writes one transaction-bound journal outbox and audit for company %i",async companyId=>{
    m.companyId=companyId;
    m.glRow=validGl();
    await perform(m.poster);
    expect(m.outbox).toHaveLength(1);
    expect(m.audits).toHaveLength(1);
    expect(m.outbox[0].payload).toMatchObject({
      eventType:"JOURNAL_CREATED",sourceType:"sales_invoice",
      sourceId:101,entryId:22,companyId,
      amount:100,actor:"qa-existing-bizportal-owner",
      dedupeKey:"sales_invoice:"+companyId+":101:22",
    });
    const journalProof=sqlIndex("from public.bizportal_customer_ar_source_evidence_dev");
    const outboxInsert=sqlIndex("into public.financial_outbox_events");
    const accountingAudit=sqlIndex("into public.audit_accounting_events");
    expect(outboxInsert).toBeGreaterThan(journalProof);
    expect(accountingAudit).toBeGreaterThan(outboxInsert);
    expect(sqlIndex("into public.activity_logs")).toBeGreaterThan(accountingAudit);
    expect(m.sql).toContain("commit");
  });
  it("refuses duplicate prior outbox events before creating a new audit",async()=>{
    m.outbox=[{id:6,payload:{}},{id:7,payload:{}}];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(sqlIndex("into public.financial_outbox_events")).toBe(-1);
    expect(sqlIndex("into public.audit_accounting_events")).toBe(-1);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("rejects a prior outbox event for a different company or source",async()=>{
    m.outbox=[{id:6,payload:{
      eventType:"JOURNAL_CREATED",sourceType:"sales_invoice",
      sourceId:101,entryId:22,companyId:3,
    }}];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("reuses one matching legitimate outbox record without inserting another",async()=>{
    m.outbox=[{id:6,payload:{
      eventType:"JOURNAL_CREATED",sourceType:"sales_invoice",
      sourceId:101,entryId:22,companyId:1,
    }}];
    await perform(m.poster);
    expect(m.outbox).toHaveLength(1);
    expect(sqlIndex("into public.financial_outbox_events")).toBe(-1);
    expect(m.audits).toHaveLength(1);
  });
  it("rejects a second issuance audit rather than duplicating",async()=>{
    m.audits=[{id:701}];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it.each(["outbox","audit"])("rolls back on failed %s persistence with no notifications",async target=>{
    if(target==="outbox")m.failOutbox=true;
    else m.failAudit=true;
    await expect(perform(m.poster)).rejects.toThrow(
      target==="outbox"?"QA_OUTBOX_INSERT_FAILED":"QA_ACCOUNTING_AUDIT_INSERT_FAILED"
    );
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("never posts using a missing/unwired owner; rolls back issuance",async()=>{
    await expect(perform()).rejects.toMatchObject({statusCode:503});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(sqlIndex("from public.accounting_entries e")).toBe(-1);
    noOutbound();
  });
  it("requires the existing posted-AR proof flag before invoking Accounting",async()=>{
    delete process.env[flag];
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:503});
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it("fails closed when the owner rejects or raises an error",async()=>{
    m.poster.mockResolvedValue({posted:false});
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    noOutbound();
    m.sql.length=0;
    m.poster.mockRejectedValueOnce(Error("posting temporarily unavailable"));
    await expect(perform(m.poster)).rejects.toThrow("posting temporarily unavailable");
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
  it.each([
    "DEV_SALES_POSTING_TAX_SETTINGS_NOT_READY",
    "DEV_SALES_POSTING_TAX_NOT_READY",
  ])("returns HTTP422 and complete rollback on controlled %s",async code=>{
    m.poster.mockRejectedValueOnce(Error(code));
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.poster).toHaveBeenCalledTimes(1);
    noOutbound();
  });
  it("returns a controlled HTTP 422 on unsupported atomic PPN, with rollback and no outbound",async()=>{
    m.poster.mockRejectedValueOnce(Error("DEV_SALES_POSTING_TAX_NOT_READY"));
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it.each([1,3])("accepts only a posted balanced company %i journal in the current transaction",async companyId=>{
    m.companyId=companyId;
    m.glRow=validGl();
    await perform(m.poster);
    expect(m.poster).toHaveBeenCalledTimes(1);
    const receipt=m.poster.mock.calls[0][0];
    expect(receipt).toMatchObject({
      companyId,source:"sales_invoice",sourceId:101,
      invoice:expect.objectContaining({invoice_number:"INV-SO-QA-101"}),
    });
    expect(typeof receipt.query).toBe("function");
    expect(receipt.transactionClient).toBeDefined();
    expect(receipt.transactionClient.query).toBe(m.query);
    expect(receipt.transactionClient.release).toBe(m.release);
    const journalCheck=sqlIndex("from public.accounting_entries e");
    expect(journalCheck).toBeGreaterThan(sqlIndex("update public.sales_documents"));
    expect(journalCheck).toBeLessThan(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev"));
    expect(sqlIndex("into public.activity_logs"))
      .toBeGreaterThan(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev"));
    expect(m.sql).toContain("commit");
    expect(m.notifyPortalCustomers).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["wrong tenant",{company_id:3,journal_company:3}],
    ["not posted",{status:"draft"}],
    ["voided",{is_voided:true}],
    ["duplicate source",{source_count:2}],
    ["not balanced",{lines_credit:"99.99"}],
    ["not correct amount",{total_debit:"90.00"}],
    ["insufficient lines",{line_count:1}],
  ])("rolls back when Accounting receipt is %s",async(_label,changes)=>{
    m.glRow={...validGl(),...changes};
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:422});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("replay never invokes Accounting twice and still checks the existing source proof",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    await perform(m.poster);
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("from public.accounting_entries e")).toBe(-1);
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBeGreaterThan(-1);
    expect(m.sql).toContain("commit");
  });
  it("the new bridge OFF retains all previously PASS Invoice behavior",async()=>{
    delete process.env[bridge];
    await perform(m.poster);
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("from public.accounting_entries e")).toBe(-1);
    expect(sqlIndex("from public.users")).toBe(-1);
    expect(sqlIndex("into public.financial_outbox_events")).toBe(-1);
    expect(sqlIndex("into public.audit_accounting_events")).toBe(-1);
    expect(sqlIndex("set constraints customer_ar_journal_source_dev")).toBe(-1);
    expect(m.sql).toContain("commit");
  });
  it("refuses production even with a mock owner attached",async()=>{
    process.env.APP_ENV="production";
    await expect(perform(m.poster)).rejects.toMatchObject({statusCode:503});
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toContain("rollback");
    noOutbound();
  });
});

describe("real Ed25519 authorization chained into Invoice handler transaction", () => {
  const keys=["SESSION_SECRET","CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV"];
  const originals=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  const bizSessionSecret="fixture-independent-bizportal-session-signing-secret-32-plus";
  const keySeed=hkdfSync("sha256",Buffer.from(bizSessionSecret),
    Buffer.from("CST_BIZPORTAL_DEV_SESSION_DERIVED_KEY_V1"),
    Buffer.from("CUSTOMER_INVOICE_ED25519_ATTESTATION_V1"),32);
  const privateKey=createPrivateKey({
    key:Buffer.concat([Buffer.from("302e020100300506032b657004220420","hex"),Buffer.from(keySeed)]),
    format:"der",type:"pkcs8",
  });
  const spki=createPublicKey(privateKey).export({format:"der",type:"spki"}).toString("base64");
  const portalUser={id:1,role:"admin",name:"DEV QA",email:"qa.owner@example.invalid"};
  function proof(companyId,alterations={}) {
    const ctx={portalUser,invoiceId:101,companyId,canonicalActorId:"qa-existing-bizportal-owner"};
    const challenge=mintPortalInvoiceChallenge(ctx);
    const now=Date.now();
    const claims={v:1,purpose:"cst-customer-invoice-owner",aud:"CST_CUSTOMER_PORTAL_DEV",
      actorId:ctx.canonicalActorId,email:portalUser.email,invoiceId:101,companyId,
      challengeDigest:createHash("sha256").update(challenge).digest("hex"),
      nonce:"b".repeat(32),iat:now,exp:now+60_000,...alterations};
    const body=Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signature=sign(null,Buffer.from("CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"+body),
      privateKey).toString("base64url");
    return {challenge,proof:body+"."+signature};
  }
  function issue(companyId,evidence) {
    return handleAdminInvoices({
      request:{method:"POST",body:{action:"mark_invoiced",
        bizportalInvoiceChallenge:evidence.challenge,bizportalInvoiceProof:evidence.proof}},
      response:{},user:portalUser,sendJson:m.sendJson,sendError:vi.fn(),invoiceId:101,
      postSalesInvoiceWithClient:m.poster,
      verifySignedBizPortalProof:verifyIndependentBizPortalSuperAdminProof,
    });
  }
  beforeEach(() => {
    process.env.APP_ENV="development";
    process.env[bridge]="true";
    process.env[flag]="true";
    process.env[attestFlag]="true";
    process.env.SESSION_SECRET="fixture-portal-independent-invoice-secret-longer-than-32";
    process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV=spki;
    m.proof=[101];
    m.poster.mockResolvedValue({posted:true,entryId:22});
    m.glRow={id:22,company_id:1,source:"sales_invoice",source_id:101,
      status:"posted",total_debit:"100.00",total_credit:"100.00",
      is_voided:false,is_reversed:false,journal_company:1,
      source_count:1,line_count:2,lines_debit:"100.00",lines_credit:"100.00"};
  });
  afterEach(() => {
    for(const key of keys) {
      if(originals[key]===undefined) delete process.env[key];
      else process.env[key]=originals[key];
    }
  });
  it.each([1,3])("accepts a real signed proof for company %i before one atomic Invoice commit",async companyId=>{
    m.companyId=companyId;
    m.glRow={...m.glRow,company_id:companyId,journal_company:companyId};
    const evidence=proof(companyId);
    await issue(companyId,evidence);
    expect(m.poster).toHaveBeenCalledTimes(1);
    expect(m.poster.mock.calls[0][0]).toMatchObject({companyId,sourceId:101});
    expect(m.sql).toContain("commit");
    expect(m.sql).not.toContain("rollback");
    expect(m.outbox).toHaveLength(1);
    expect(m.audits).toHaveLength(1);
  });
  it("rejects signed Company 1 proof for a Company 3 Invoice before updates or posting",async()=>{
    m.companyId=3;
    await expect(issue(3,proof(1))).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("update public.sales_documents")).toBe(-1);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    noOutbound();
  });
  it("rejects a validly signed proof with wrong Invoice identity",async()=>{
    await expect(issue(1,proof(1,{invoiceId:102}))).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("update public.sales_documents")).toBe(-1);
    expect(m.sql).not.toContain("commit");
  });
  it("rejects invalid proof even when an Invoice is already marked issued",async()=>{
    m.invoiceStatus="invoiced";
    m.currentInvoiceNumber="INV-SO-QA-101";
    const evidence=proof(1);
    evidence.proof=evidence.proof.slice(0,-3)+"AAA";
    await expect(issue(1,evidence)).rejects.toMatchObject({statusCode:403});
    expect(m.poster).not.toHaveBeenCalled();
    expect(sqlIndex("from public.bizportal_customer_ar_source_evidence_dev")).toBe(-1);
    expect(m.sql).toContain("rollback");
  });
});
