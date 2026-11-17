// @ts-nocheck — the imported JS service is deliberately tested with mocked IO.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  glRow:null,
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
async function sqlMock(statement){
  const q=String(statement).toLowerCase().trim();
  m.sql.push(q);
  if(q==="begin"||q==="commit"||q==="rollback")return {rows:[]};
  if(q.includes("from public.sales_documents"))return {rows:[base()]};
  if(q.startsWith("update public.sales_documents"))return {rows:[issued()]};
  if(q.includes("from public.accounting_entries e")){
    return {rows: m.glRow ? [m.glRow] : []};
  }
  if(q.includes("from public.bizportal_customer_ar_source_evidence_dev")){
    if(m.viewUnavailable)throw Object.assign(new Error("view missing"),{code:"42P01"});
    return {rows:m.proof.map(id=>({invoice_id:id}))};
  }
  if(q.includes("from public.portal_customers"))return {rows:[]};
  if(q.includes("into public.activity_logs"))return {rows:[]};
  throw Error("UNEXPECTED_SQL_IN_TEST");
}
const perform=(posting=null)=>handleAdminInvoices({
  request:{method:"POST",body:{action:"mark_invoiced"}},
  response:{},
  user:{id:1,role:"admin",name:"DEV QA"},
  sendJson:m.sendJson,
  sendError:vi.fn(),
  invoiceId:101,
  postSalesInvoiceWithClient:posting,
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
  delete process.env[bridge];
  m.query.mockImplementation(sqlMock);
  m.connect.mockResolvedValue({query:m.query,release:m.release});
  m.notifyAdmins.mockResolvedValue(undefined);
  m.notifyPortalCustomers.mockResolvedValue(undefined);
  process.env.APP_ENV="development";
  process.env[flag]="true";
});
afterEach(()=>{
  if(originalFlag===undefined)delete process.env[flag];else process.env[flag]=originalFlag;
  if(originalEnv===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=originalEnv;
  if(originalBridge===undefined)delete process.env[bridge];else process.env[bridge]=originalBridge;
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
    m.poster.mockResolvedValue({posted:true,entryId:22});
    m.glRow=validGl();
    m.proof=[101];
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
