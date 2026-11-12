#!/usr/bin/env node
// DEV-only disposable RFQ -> quotation -> approval -> shared DB read-back.
// No trucking/shipment tests, no production database, no external email recipients.
import { randomUUID } from "node:crypto";
import { createSession } from "../server/session.mjs";
import { pool, query, closeDatabase } from "../server/db.mjs";
const BASE="http://127.0.0.1:18444";
const fail=(msg)=>{throw new Error("[dev-rfq-e2e] "+msg)};
if(process.env.APP_ENV!=="development"||process.env.NODE_ENV==="production")fail("DEV environment required");
if(!String(process.env.SUPABASE_DATABASE_URL_DEV||"").includes("xssrfshdrtdfupgqwfdw"))fail("DEV project identity mismatch");
const id=randomUUID().slice(0,12);
let fixture=null;
let passed=false;
async function api(path,{method="GET",body,user,expected=[200],headers={}}={}){
  const h={Accept:"application/json",...headers};
  if(user)h.Cookie="portal_session="+createSession(user);
  if(body!==undefined)h["Content-Type"]="application/json";
  const res=await fetch(BASE+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
  const raw=await res.text();let data;
  try{data=raw?JSON.parse(raw):null}catch{fail(path+" returned non-JSON status="+res.status)}
  if(!expected.includes(res.status))fail(path+" HTTP "+res.status+" expected "+expected.join(",")+": "+String(data?.message||"").slice(0,100));
  return data;
}
async function cleanup(f){
  if(!f?.rfqId)return;
  const c=await pool.connect();
  try{
    await c.query("begin");
    await c.query("delete from public.portal_customer_notifications where payload->>'rfqId'=$1 or payload->>'rfq_id'=$1 or payload->>'poId'=$2",[String(f.rfqId),String(f.poId||-1)]);
    await c.query("delete from public.mkt_notification_queue where rfq_id=$1 or vendor_quote_id=$2 or purchase_order_id=$3",[f.rfqId,f.quoteId,f.poId||-1]);
    await c.query("delete from public.activity_logs where mkt_rfq_id=$1 or mkt_vendor_quote_id=$2 or mkt_purchase_order_id=$3",[f.rfqId,f.quoteId,f.poId||-1]);
    if(f.poId){
      await c.query("delete from public.mkt_purchase_order_lines where po_id=$1",[f.poId]);
      await c.query("delete from public.mkt_purchase_orders where id=$1",[f.poId]);
    }
    await c.query("delete from public.mkt_vendor_quote_lines where quote_id=$1",[f.quoteId]);
    await c.query("delete from public.mkt_vendor_quotes where id=$1",[f.quoteId]);
    await c.query("delete from public.mkt_rfq_approvals where rfq_id=$1",[f.rfqId]);
    await c.query("delete from public.mkt_rfq_lines where rfq_id=$1",[f.rfqId]);
    await c.query("delete from public.mkt_rfqs where id=$1",[f.rfqId]);
    await c.query("commit");
    console.log("[dev-rfq-e2e] fixture cleanup PASS");
  }catch(e){await c.query("rollback").catch(()=>{});throw new Error("CLEANUP_FAILED: "+e.message)}
  finally{c.release()}
}
try{
 const h=await api("/api/healthz");
 if(h.appEnv!=="development"||h.databaseEnvironment!=="development")fail("Unsafe API environment");
 const users=(await query("select id,email,role from public.portal_customers where email in ('dev-admin@dev.local','dev-customer@dev.local')")).rows;
 const customer=users.find(x=>x.email==="dev-customer@dev.local");
 const admin=users.find(x=>x.email==="dev-admin@dev.local");
 if(!customer||!admin||customer.role!=="customer"||admin.role!=="admin")fail("Missing synthetic DEV actors");
 const vendor=(await query("select id from public.suppliers order by id limit 1")).rows[0];
 if(!vendor)fail("No DEV supplier fixture");
 const client=await pool.connect();
 try{
  await client.query("begin");
  const rfq=(await client.query(`insert into public.mkt_rfqs
     (rfq_number,buyer_name,buyer_email,buyer_company,status,priority,required_delivery_date,delivery_address,notes,email_verified,line_count,portal_customer_id,approval_status)
     values ($1,'DEV E2E Customer','dev-customer@dev.local','DEV E2E Co','draft'::mkt_rfq_status,'normal'::mkt_rfq_priority,current_date+14,'DEV TEST ONLY',$2,true,1,$3,'none') returning id`,
     ["DEV-RFQ-"+id,"DEV-RFQ-PROOF-"+id,customer.id])).rows[0];
  fixture={rfqId:Number(rfq.id),quoteId:null,poId:null};
  const line=(await client.query("insert into public.mkt_rfq_lines (rfq_id,item_name,item_unit,requested_qty,notes,sort_order) values ($1,'Synthetic Cargo','box',2,'DEV ONLY',0) returning id",[fixture.rfqId])).rows[0];
  fixture.lineId=Number(line.id);
  fixture.token="dev-only-"+id;
  const quote=(await client.query(`insert into public.mkt_vendor_quotes
    (rfq_id,vendor_id,token,status,valid_until,quotation_number,quotation_date,payment_terms,incoterm,delivery_location,requote_round)
    values ($1,$2,$3,'invited'::mkt_quote_status,now()+interval '7 days',$4,current_date,'NET 30','DAP','DEV ONLY',1) returning id`,
    [fixture.rfqId,vendor.id,fixture.token,"DEV-QUOTE-"+id])).rows[0];
  fixture.quoteId=Number(quote.id);
  await client.query("commit");
 }catch(e){await client.query("rollback").catch(()=>{});throw e}finally{client.release()}
 await api("/api/mkt/portal/rfqs/"+fixture.rfqId+"/submit",{method:"POST",user:customer});
 await api("/api/vendor-quote/"+fixture.token);
 await api("/api/vendor-quote/"+fixture.token+"/submit",{method:"POST",body:{
   notes:"Synthetic DEV quotation "+id,paymentTerms:"NET 30",quotationDate:new Date().toISOString().slice(0,10),
   lines:[{rfqLineId:fixture.lineId,offeredUnitPrice:50,offeredQty:2,leadTimeDays:3,stockStatus:"available",currency:"IDR"}]
 }});
 await api("/api/mkt/admin/rfqs/"+fixture.rfqId+"/send-to-customer",{method:"POST",user:admin,body:{quoteId:fixture.quoteId,notes:"DEV E2E ONLY"}});
 const approved=await api("/api/mkt/portal/rfqs/"+fixture.rfqId+"/customer-approve",{method:"POST",user:customer,headers:{"Idempotency-Key":"DEV-RFQ-"+id},body:{}});
 fixture.poId=Number(approved?.data?.poId||0);
 if(!fixture.poId)fail("first approval failed to create PO");
 const replay=await api("/api/mkt/portal/rfqs/"+fixture.rfqId+"/customer-approve",{
   method:"POST",user:customer,headers:{"Idempotency-Key":"DEV-RFQ-"+id},body:{}
 });
 if(Number(replay?.data?.poId)!==fixture.poId||replay?.data?.alreadyProcessed!==true)
   fail("customer approval replay created inconsistent PO");
 const poCount=(await query("select count(*)::int as n from public.mkt_purchase_orders where rfq_id=$1",[fixture.rfqId])).rows[0].n;
 if(poCount!==1)fail("duplicate PO after idempotent approval: "+poCount);
 const eventRows=(await query("select event_key,type,portal_customer_id from public.portal_customer_notifications where event_key like $1 order by id",["rfq-"+fixture.rfqId+"-%"])).rows;
 const keys=new Set(eventRows.map(e=>e.event_key));
 if(!keys.has("rfq-"+fixture.rfqId+"-po-created") ||
    !keys.has("rfq-"+fixture.rfqId+"-customer-review-"+fixture.quoteId))
   fail("customer/admin notifications missing after quote approval");
 const delivery=(await query("select id,event_type,status from public.mkt_notification_queue where rfq_id=$1 and event_type='po_created'",[fixture.rfqId])).rows;
 if(delivery.length!==1)fail("po_created vendor queue count should be 1, got "+delivery.length);
 console.log("[dev-rfq-e2e] PASS idempotent approval, single PO, customer/admin notification, single vendor delivery queue");
 const bizportalRfqs=await api("/api/mkt/admin/rfqs",{user:admin});
 if(!Array.isArray(bizportalRfqs?.data)||!bizportalRfqs.data.some(x=>Number(x.rfqId)===fixture.rfqId))fail("BizPortal RFQ list API missing synthetic RFQ");

 if(!fixture.poId)fail("approval did not create purchase order");
 const bizportalPos=await api("/api/mkt/admin/purchase-orders?limit=200",{user:admin});
 if(!Array.isArray(bizportalPos?.data)||!bizportalPos.data.some(x=>Number(x.id)===fixture.poId))fail("BizPortal PO list API missing synthetic PO");

 const records=(await query("select po.id,po.rfq_id from public.mkt_purchase_orders po where po.id=$1 and po.rfq_id=$2",[fixture.poId,fixture.rfqId])).rows;
 if(records.length!==1)fail("shared database/BizPortal read-back missing PO");
 const feed=await api("/api/portal/order-feed",{user:customer});
 if(!Array.isArray(feed?.marketplaceRfqs)||!feed.marketplaceRfqs.some(x=>Number(x.rfqId)===fixture.rfqId))fail("customer order feed missing RFQ");
 console.log("[dev-rfq-e2e] PASS login-derived session, RFQ submit, vendor quotation, admin send, customer approval, PO read-back, BizPortal RFQ/PO list APIs, customer feed");
 passed=true;
}catch(e){console.error("[dev-rfq-e2e] FAIL "+e.message)}
finally{try{await cleanup(fixture)}catch(e){console.error("[dev-rfq-e2e] "+e.message);passed=false}await closeDatabase()}
if(!passed)process.exitCode=1;
