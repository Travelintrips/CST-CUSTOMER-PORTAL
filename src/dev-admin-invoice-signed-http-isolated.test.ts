// @ts-nocheck -- Isolated HTTP harness, real session and Billing handler; no real DB.
import http from "node:http";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  connect: vi.fn(), query: vi.fn(), release: vi.fn(),
  gl: null as null | Record<string,unknown>, proof: [101] as number[],
  poster: vi.fn(), notifications: vi.fn(),
  sql: [] as string[], commits: 0, rollbacks: 0,
}));
vi.mock("../server/db.mjs", () => ({
  pool: { connect: m.connect }, query: vi.fn(),
}));
vi.mock("../server/storage.mjs", () => ({ signedPaymentProofUrl: vi.fn() }));
vi.mock("../server/dev-original-accounting-owner-loader.mjs", () => ({
  loadDevOriginalAccountingOwner: vi.fn(async () => null),
}));
vi.mock("../server/notification-service.mjs", () => ({
  bestEffortNotificationWrite: vi.fn(async (_db, work) => work()),
  notifyAdmins: m.notifications,
  notifyPortalCustomers: m.notifications,
}));

import { createSession, getSession } from "../server/session.mjs";
import { handleAdminInvoices } from "../server/billing-operations.mjs";

const sessionSecret = process.env.SESSION_SECRET;
const original = {
  APP_ENV: process.env.APP_ENV,
  NODE_ENV: process.env.NODE_ENV,
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV,
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV,
};
const user = (role: string, overrides = {}) => ({
  id: role === "admin" ? 11 : 12, email: role + "@qa.invalid",
  name: "Synthetic " + role, role, auth_version: 2, account_status: "active",
  ...overrides,
});
const users = new Map([[11,user("admin")],[12,user("customer")]]);
const invoice = (issued = false) => ({
  id: 101, doc_number: "QA-101", kind:"order",
  status:"confirmed", invoice_status:issued?"invoiced":"to_invoice",
  company_id:1, customer_id:12, customer_name:"Synthetic Invoice Customer",
  total_amount:"100.00",grand_total:"100.00",amount_paid:"0.00",
  payment_status:"unpaid", invoice_number:issued?"INV-QA-101":null,
  invoice_date:issued?"2026-11-18":null, due_date:issued?"2026-12-18":null,
  notes:null,
});
const gl = () => ({
  id:22,company_id:1,source:"sales_invoice",source_id:101,
  status:"posted",total_debit:"100",total_credit:"100",
  is_voided:false,is_reversed:false,journal_company:1,
  source_count:1,line_count:2,lines_debit:"100",lines_credit:"100",
});
async function mockedSql(statement) {
  const q=String(statement).toLowerCase().trim();
  m.sql.push(q);
  if(q==="begin") return {rows:[]};
  if(q==="commit"){m.commits++;return {rows:[]};}
  if(q==="rollback"){m.rollbacks++;return {rows:[]};}
  if(q.includes("from public.portal_company_members")) return {rows:[{company_id:1}]};
  if(q.includes("from public.sales_documents")) return {rows:[invoice()]};
  if(q.startsWith("update public.sales_documents")) return {rows:[invoice(true)]};
  if(q.includes("from public.accounting_entries e")) return {rows:m.gl?[m.gl]:[]};
  if(q.includes("from public.bizportal_customer_ar_source_evidence_dev"))
    return {rows:m.proof.map((id)=>({invoice_id:id}))};
  if(q.includes("from public.portal_customers")) return {rows:[]};
  if(q.includes("into public.activity_logs")) return {rows:[]};
  throw new Error("UNEXPECTED_HTTP_QA_SQL:" + q.slice(0,100));
}

let server; let origin;
function sendJson(res,status,payload){
  res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});
  res.end(JSON.stringify(payload));
}
async function handle(req,res){
  if(req.method!=="POST" || req.url!=="/api/portal/admin/invoices/101/action"){
    sendJson(res,404,{message:"Not found"});return;
  }
  const session=getSession(req);
  if(!session){sendJson(res,401,{message:"Authentication required."});return;}
  const current=users.get(Number(session.id));
  if(!current || current.account_status!=="active"
    || String(session.email).toLowerCase()!==current.email.toLowerCase()
    || session.role!==current.role
    || Number(session.authVersion??0)!==Number(current.auth_version??0)){
    sendJson(res,401,{message:"Session is no longer valid."});return;
  }
  if(current.role!=="admin"){sendJson(res,403,{message:"Admin authorization required."});return;}
  try{
    let raw="";for await(const chunk of req)raw+=chunk.toString();
    const body=JSON.parse(raw||"{}");
    await handleAdminInvoices({
      request:{method:"POST",body},response:res,user:current,
      sendJson,sendError:(response,status,message)=>sendJson(response,status,{message}),
      invoiceId:101,postSalesInvoiceWithClient:m.poster,
    });
  }catch(e){sendJson(res,e.statusCode||500,{message:e.message});}
}
const action=(token?:string,body={action:"mark_invoiced"}) =>
  fetch(origin+"/api/portal/admin/invoices/101/action",{
    method:"POST",headers:{
      "content-type":"application/json",
      ...(token?{authorization:"Bearer "+token}:{}),
    },body:JSON.stringify(body),
  });
beforeAll(async()=>{
  process.env.APP_ENV="development";
  process.env.NODE_ENV="test";
  process.env.SESSION_SECRET="synthetic-only-32-character-session-secret";
  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV="true";
  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV="true";
  // Prevent the harness accidentally masking a changed production route/role.
  const index=readFileSync("server/index.mjs","utf8");
  expect(index).toContain('user.role !== "admin"');
  expect(index).toContain('await handleAdminInvoices({');
  expect(index).toContain('Number(adminInvoiceActionMatch[1])');
  server=http.createServer((req,res)=>{void handle(req,res);});
  await new Promise((resolve)=>server.listen(0,"127.0.0.1",resolve));
  origin="http://127.0.0.1:"+server.address().port;
});
afterAll(async()=>{
  if(server?.listening) await new Promise((resolve)=>server.close(resolve));
  for(const [k,v] of Object.entries(original)){if(v===undefined)delete process.env[k];else process.env[k]=v;}
  if(sessionSecret===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=sessionSecret;
});
beforeEach(()=>{
  vi.clearAllMocks();
  m.sql=[];m.commits=0;m.rollbacks=0;m.gl=gl();m.proof=[101];
  m.query.mockImplementation(mockedSql);
  m.connect.mockResolvedValue({query:m.query,release:m.release});
  m.poster.mockResolvedValue({posted:true,entryId:22});
  m.notifications.mockResolvedValue(undefined);
});
describe("isolated HTTP: existing signed Portal session → existing Invoice handler",()=>{
  it("rejects anonymous and tampered JWTs before any DB write",async()=>{
    expect((await action()).status).toBe(401);
    const valid=createSession(user("admin"));
    expect((await action(valid+"tampered")).status).toBe(401);
    expect(m.sql).toEqual([]);expect(m.poster).not.toHaveBeenCalled();
  });
  it("rejects a real signed customer JWT as 403",async()=>{
    expect((await action(createSession(user("customer")))).status).toBe(403);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.sql).toEqual([]);
  });
  it("rejects signed session claims that no longer match the current user",async()=>{
    const stale=createSession(user("admin",{auth_version:1}));
    expect((await action(stale)).status).toBe(401);
    expect(m.sql).toEqual([]);
  });
  it("allows signed Admin through original Invoice handler; requires GL/AR before COMMIT",async()=>{
    const r=await action(createSession(user("admin")));
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({invoiceStatus:"invoiced",id:101});
    expect(m.poster).toHaveBeenCalledTimes(1);
    expect(m.commits).toBe(1);expect(m.rollbacks).toBe(0);
    expect(m.sql.findIndex(x=>x.includes("from public.accounting_entries e")))
      .toBeGreaterThan(m.sql.findIndex(x=>x.startsWith("update public.sales_documents")));
    expect(m.sql.findIndex(x=>x.includes("from public.bizportal_customer_ar_source_evidence_dev")))
      .toBeGreaterThan(m.sql.findIndex(x=>x.includes("from public.accounting_entries e")));
  });
  it("rolls back with 422 if original Accounting denies posting; no outbound notifications",async()=>{
    m.poster.mockResolvedValue({posted:false});
    expect((await action(createSession(user("admin")))).status).toBe(422);
    expect(m.commits).toBe(0);expect(m.rollbacks).toBe(1);
    expect(m.notifications).not.toHaveBeenCalled();
  });
  it("rejects an otherwise signed Admin without company membership",async()=>{
    m.query.mockImplementation(async (sql,values)=>{
      if(String(sql).includes("from public.portal_company_members")) return {rows:[]};
      return mockedSql(sql,values);
    });
    expect((await action(createSession(user("admin")))).status).toBe(403);
    expect(m.poster).not.toHaveBeenCalled();
    expect(m.rollbacks).toBe(1);
    expect(m.commits).toBe(0);
    expect(m.notifications).not.toHaveBeenCalled();
  });
  it("rejects missing AR evidence after returned posted GL, leaving no COMMIT",async()=>{
    m.proof=[];
    expect((await action(createSession(user("admin")))).status).toBe(422);
    expect(m.commits).toBe(0);expect(m.rollbacks).toBe(1);
    expect(m.notifications).not.toHaveBeenCalled();
  });
});
