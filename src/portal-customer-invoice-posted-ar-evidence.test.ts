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
  if(q.includes("from public.bizportal_customer_ar_source_evidence_dev")){
    if(m.viewUnavailable)throw Object.assign(new Error("view missing"),{code:"42P01"});
    return {rows:m.proof.map(id=>({invoice_id:id}))};
  }
  if(q.includes("from public.portal_customers"))return {rows:[]};
  if(q.includes("into public.activity_logs"))return {rows:[]};
  throw Error("UNEXPECTED_SQL_IN_TEST");
}
const perform=()=>handleAdminInvoices({
  request:{method:"POST",body:{action:"mark_invoiced"}},
  response:{},
  user:{id:1,role:"admin",name:"DEV QA"},
  sendJson:m.sendJson,
  sendError:vi.fn(),
  invoiceId:101,
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
