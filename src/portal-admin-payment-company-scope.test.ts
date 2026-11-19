// @ts-nocheck — isolated original Portal handler security regression.
// No DB credentials/production sessions; all SQL statements are mocked.
import {beforeEach,describe,expect,it,vi} from "vitest";

const m=vi.hoisted(()=>({
  connect:vi.fn(),query:vi.fn(),sendJson:vi.fn(),notifyAdmins:vi.fn(),
  state:null,sql:[],commits:0,rollbacks:0,
}));
vi.mock("../server/db.mjs",()=>({
  pool:{connect:m.connect},query:m.query,
}));
vi.mock("../server/storage.mjs",()=>({signedPaymentProofUrl:vi.fn()}));
vi.mock("../server/dev-customer-invoice-scoped-client.mjs",()=>({
  openDevCompanyInvoiceWriter:vi.fn(),
}));
vi.mock("../server/notification-service.mjs",()=>({
  bestEffortNotificationWrite:vi.fn(async(_db,work)=>work()),
  notifyAdmins:m.notifyAdmins,
  notifyPortalCustomers:vi.fn(async()=>true),
}));

import {handleAdminPayments} from "../server/billing-operations.mjs";

const user=(id=501,email="owner@example.invalid")=>({
  id,role:"admin",name:"QA Portal Admin",email,
});
const payment=(companyId=1)=>({
  id:7001,ref_kind:"sales",ref_id:201,ref_doc_number:"SO-QA-201",
  amount:"40.00",status:"pending",company_id:companyId,
  provider:"paylabs",provider_order_id:null,
  provider_merchant_trade_no:"QA-PAY-7001",payment_method:"bank",
  payment_url:null,expired_at:null,paid_at:null,
  created_at:"2026-11-19",updated_at:"2026-11-19",
});
const invoice=(companyId=1)=>({
  id:201,doc_number:"SO-QA-201",kind:"order",
  status:"confirmed",invoice_status:"invoiced",payment_status:"unpaid",
  amount_paid:"0.00",customer_id:12,customer_name:"Synthetic Customer",
  total_amount:"100.00",grand_total:"111.00",
  company_id:companyId,due_date:"2026-12-19",
  invoice_number:"INV-SO-QA-201",invoice_date:"2026-11-19",
  created_at:"2026-11-19",updated_at:"2026-11-19",
  notes:null,proof_url:null,payment_proof_token:null,
  proof_uploaded_at:null,proof_remarks:null,
});
function setup(overrides={}) {
  const f={
    companyId:1,actorRole:"super_admin",actorCompanyId:null,
    systemRole:"super_admin",membership:[55],principalCount:1,
    status:"pending",invoiceStatus:"invoiced",paymentCompanyId:1,
    paymentAmount:"40.00",paidAmount:"0.00",...overrides,
  };
  m.state=f;m.sql=[];m.commits=0;m.rollbacks=0;
  m.notifyAdmins.mockReset().mockResolvedValue(true);
  const db=async(statement,params=[])=>{
    const sql=String(statement).toLowerCase().trim();
    m.sql.push({sql,params});
    if(sql==="begin")return {rows:[]};
    if(sql==="commit"){m.commits++;return {rows:[]}}
    if(sql==="rollback"){m.rollbacks++;return {rows:[]}}
    if(sql.includes("from public.portal_customers pc") && sql.includes("join public.users u")){
      return {rows:Array.from({length:f.principalCount},(_,n)=>({
        id:"qa-bizportal-user-"+n,role:f.actorRole,
        system_role:f.systemRole,company_id:f.actorCompanyId,
      }))};
    }
    if(sql.includes("from public.portal_company_members") && sql.includes("for share"))
      return {rows:f.membership.map(id=>({id}))};
    if(sql.includes("from public.payments p") && sql.includes("where p.id"))
      return {rows:[{...payment(f.paymentCompanyId),
        amount:f.paymentAmount,status:f.status}]};
    if(sql.includes("from public.sales_documents") && sql.includes("for update"))
      return {rows:[{...invoice(f.companyId),
        invoice_status:f.invoiceStatus,amount_paid:f.paidAmount}]};
    if(sql.includes("from public.payments p") && sql.includes("join public.sales_documents s")){
      const allowed=params[0]??[];
      return {rows:[1,3].filter(c=>allowed.includes(c)).map(c=>({
        ...payment(c),id:7000+c,ref_id:200+c,
        invoice_number:"INV-QA-"+c,customer_name:"Company QA "+c,
        document_payment_status:"unpaid",
      }))};
    }
    if(sql.startsWith("update public.payments")){
      f.status=params[1];
      return {rows:[{...payment(f.paymentCompanyId),status:f.status}]};
    }
    if(sql.includes("coalesce(sum(amount) filter"))
      return {rows:[{amount_paid:f.paymentAmount}]};
    if(sql.startsWith("update public.sales_documents")){
      f.paidAmount=String(params[1]);
      return {rows:[],rowCount:1};
    }
    if(sql.includes("insert into public.activity_logs"))return {rows:[]};
    // Existing best-effort customer inbox recipient lookup is still
    // executed; there is no external notification dispatch in this test.
    if(sql.includes("from public.portal_customers") && sql.includes("union")
       && sql.includes("portal_company_members pcm"))return {rows:[{id:12}]};
    throw Error("Unexpected SQL in security regression: "+sql.slice(0,220));
  };
  const client={query:db,release:vi.fn()};
  m.connect.mockReset().mockResolvedValue(client);
  m.query.mockReset().mockImplementation(db);
}
const updates=()=>m.sql.filter(x=>x.sql.startsWith("update")||x.sql.startsWith("insert"));
async function act(requestUser=user(),status="paid",paymentId=7001){
  m.sendJson.mockReset();
  const sendError=(_res,code,message)=>{throw Object.assign(new Error(message),{statusCode:code});};
  await handleAdminPayments({
    request:{method:"POST",body:{status},headers:{}},
    response:{},user:requestUser,paymentId,
    sendJson:m.sendJson,sendError,
  });
  return m.sendJson.mock.calls[0];
}
async function list(requestUser=user()){
  m.sendJson.mockReset();
  const sendError=(_res,code,message)=>{throw Object.assign(new Error(message),{statusCode:code});};
  await handleAdminPayments({
    request:{method:"GET",body:{},headers:{}},
    response:{},user:requestUser,paymentId:null,
    sendJson:m.sendJson,sendError,
  });
  return m.sendJson.mock.calls[0];
}

describe("admin Invoice payment authorization: current company and identity",()=>{
  beforeEach(()=>setup());

  it.each([1,3])("allows active canonical global Owner on company %i without second OTP",async company=>{
    setup({companyId:company,paymentCompanyId:company});
    const [_,code,res]=await act();
    expect(code).toBe(200);
    expect(res.replayed).toBe(false);
    expect(res.payment.status).toBe("paid");
    expect(m.commits).toBe(1);
    expect(updates().filter(x=>x.sql.startsWith("update"))).toHaveLength(2);
    expect(m.sql.some(x=>x.sql.includes("for share of pc,u"))).toBe(true);
    expect(m.notifyAdmins).toHaveBeenCalled();
  });

  it("allows active authorized staff for own company only, without Owner approval",async()=>{
    setup({companyId:3,paymentCompanyId:3,
      actorRole:"admin",actorCompanyId:3,systemRole:null,membership:[55]});
    expect((await act(user(503,"diva@example.invalid")))[1]).toBe(200);
    expect(m.sql.some(x=>x.sql.includes("from public.portal_company_members"))).toBe(true);
  });

  it.each([
    ["foreign-company staff",{companyId:1,paymentCompanyId:1,actorRole:"admin",actorCompanyId:3,membership:[55]}],
    ["staff without active membership",{companyId:3,paymentCompanyId:3,actorRole:"admin",actorCompanyId:3,membership:[]}],
    ["duplicate BizPortal actor mapping",{principalCount:2}],
    ["no canonical mapping",{principalCount:0}],
    ["unscoped ordinary actor",{actorRole:"admin",actorCompanyId:null}],
    ["invalid Owner system role",{systemRole:null}],
    ["Owner only scoped to different company",{companyId:3,paymentCompanyId:3,actorCompanyId:1}],
  ])("rejects %s before status mutation",async(_reason,overrides)=>{
    setup(overrides);
    await expect(act()).rejects.toMatchObject({statusCode:403});
    expect(updates()).toHaveLength(0);
    expect(m.commits).toBe(0);
    expect(m.rollbacks).toBe(1);
  });

  it("rejects cross-company replay even if payment already marked paid",async()=>{
    setup({companyId:1,paymentCompanyId:1,status:"paid",
      actorRole:"admin",actorCompanyId:3,membership:[55]});
    await expect(act(user(503,"diva@example.invalid"))).rejects.toMatchObject({statusCode:403});
    expect(m.sendJson).not.toHaveBeenCalled();
    expect(updates()).toHaveLength(0);
  });

  it("authorized replay of already paid payment does not double-apply amounts",async()=>{
    setup({status:"paid",paidAmount:"40.00"});
    const [_,status,response]=await act();
    expect(status).toBe(200);
    expect(response.replayed).toBe(true);
    expect(updates()).toHaveLength(0);
  });

  it.each([
    ["unissued Invoice",{invoiceStatus:"to_invoice"},409],
    ["payment company disagrees with source",{companyId:1,paymentCompanyId:3},409],
  ])("fails closed on %s without posting",async(_description,overrides,code)=>{
    setup(overrides);
    await expect(act()).rejects.toMatchObject({statusCode:code});
    expect(updates()).toHaveLength(0);
    expect(m.rollbacks).toBe(1);
  });

  it("rejects invalid Portal user role before returning a replay",async()=>{
    setup({status:"paid"});
    await expect(act({...user(),role:"customer"})).rejects.toMatchObject({statusCode:403});
    expect(updates()).toHaveLength(0);
  });

  it("filters Admin payment list to canonical company scope",async()=>{
    setup({actorRole:"admin",actorCompanyId:3,systemRole:null,membership:[55]});
    const [_,status,response]=await list(user(503,"diva@example.invalid"));
    expect(status).toBe(200);
    expect(response.items.map(x=>x.refId)).toEqual([203]);
    const q=m.sql.find(x=>x.sql.includes("from public.payments p")&&x.sql.includes("join public.sales_documents s"));
    expect(q.params).toEqual([[3]]);
    expect(q.sql).toContain("p.company_id is null or p.company_id=s.company_id");
    expect(m.commits).toBe(1);
  });

  it("global Owner can list CST and Diva, but unrelated Admin cannot list either",async()=>{
    setup();
    expect((await list())[2].items.map(x=>x.refId)).toEqual([201,203]);
    setup({principalCount:0});
    await expect(list(user(504,"unassigned@example.invalid"))).rejects.toMatchObject({statusCode:403});
    expect(m.sendJson).not.toHaveBeenCalled();
    expect(m.rollbacks).toBe(1);
  });
});
