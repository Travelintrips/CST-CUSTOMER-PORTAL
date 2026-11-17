import assert from "node:assert/strict";
import pg from "pg";
import { loadInternalVendorPoAcceptance } from "../../server/internal-vendor-po-accept.mjs";
import { acceptVendorPurchaseOrder } from "../../server/vendor-po-acceptance.mjs";

const pool = new pg.Pool({
  host: process.env.PGHOST, port: 5432, user: "postgres",
  password: process.env.PGPASSWORD, database: "postgres", max: 4,
});
const env = {
  APP_ENV: "development", NODE_ENV: "test",
  CST_INTERNAL_VENDOR_PO_ACCEPT_DEV: "true",
  CST_INTERNAL_VENDOR_PO_IDS_DEV: "14,16",
  CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "1",
};
const admin = { id: 11, name: "QA Admin" };
const decision = { intent: "accept_internal_vendor_po_dev", confirmed: true,
  reason: "TEST DEV: isolated PostgreSQL canonical vendor PO acceptance" };
const runTx = async fn => {
  const client = await pool.connect();
  const db = (sql, values=[]) => client.query(sql,values);
  try {
    await db("begin");
    const result = await fn(db);
    await db("commit");
    return result;
  } catch (error) {
    await db("rollback");
    throw error;
  } finally { client.release(); }
};
const sql = [
 "drop schema public cascade;",
 "create schema public;",
 "create type public.mkt_po_status as enum ('issued','vendor_accepted','completed');",
 "create table public.portal_customers(id integer primary key,role text,customer_type text,account_status text);",
 "create table public.companies(id integer primary key,company_name text,is_active boolean);",
 "create table public.portal_company_members(id integer primary key,portal_customer_id integer,company_id integer,is_active boolean);",
 "create table public.portal_company_requests(id integer primary key,portal_customer_id integer,matched_company_id integer,status text,reviewed_by integer,reviewed_at timestamptz);",
 "create table public.suppliers(id integer primary key,name text,company_id integer,is_internal_vendor boolean,is_active boolean);",
 "create table public.mkt_rfqs(id integer primary key,rfq_number text,status text,approval_status text,company_id integer,portal_customer_id integer,winning_quote_id integer,buyer_email text);",
 "create table public.mkt_vendor_quotes(id integer primary key,rfq_id integer,vendor_id integer,status text,notes text);",
 "create table public.mkt_purchase_orders(id integer primary key,po_number text,rfq_id integer,quote_id integer,vendor_id integer,company_id integer,status public.mkt_po_status,confirmed_at timestamp,payment_status text,grand_total numeric,updated_at timestamp default now());",
 "create table public.activity_logs(id serial primary key,rfq_id integer,po_id integer,actor_type text,actor_id text,action text,description text,deduplication_key text);",
 "create unique index event_dedupe on public.activity_logs(deduplication_key) where deduplication_key is not null;",
 "create table public.portal_customer_notifications(id serial primary key,portal_customer_id integer,event_key text,type text,message text,payload jsonb,unique(portal_customer_id,event_key));",
 "insert into public.portal_customers values (11,'admin',null,'active'),(31,'customer','company','active');",
 "insert into public.companies values (1,'CST',true),(3,'Diva',true);",
 "insert into public.portal_company_members values (1,31,1,true);",
 "insert into public.portal_company_requests values (1,31,1,'approved',11,now());",
 "insert into public.suppliers values (24,'CST Internal',1,true,true);",
 "insert into public.mkt_rfqs values (23,'TEST-RFQ-23','awarded','approved',1,31,18,'buyer@example.test'),(25,'TEST-RFQ-25','awarded','approved',1,31,20,'buyer@example.test');",
 "insert into public.mkt_vendor_quotes values (18,23,24,'selected','TEST DEV ONLY - synthetic'),(20,25,24,'selected','TEST DEV ONLY - synthetic');",
 "insert into public.mkt_purchase_orders(id,po_number,rfq_id,quote_id,vendor_id,company_id,status,payment_status,grand_total) values (14,'PO-TEST-14',23,18,24,1,'issued','unpaid',100000),(16,'PO-TEST-16',25,20,24,1,'issued','unpaid',100000);"
].join("\n");

let outbound=0;
const writeEvent = async (db,data,key) => {
  await db("insert into public.activity_logs(rfq_id,po_id,actor_type,actor_id,action,description,deduplication_key) values($1,$2,$3,$4,$5,$6,$7) on conflict (deduplication_key) where deduplication_key is not null do nothing",
    [data.rfqId,data.poId,data.actorType,data.actorId,data.action,data.description,key]);
};
const queueEvent = async () => {
  outbound++;
  throw Error("Admin QA must never enqueue outward WhatsApp");
};
const customerNotification = async (db,rfq,eventKey,type,_title,message,payload) => {
  await db("insert into public.portal_customer_notifications(portal_customer_id,event_key,type,message,payload) values($1,$2,$3,$4,$5::jsonb) on conflict (portal_customer_id,event_key) do nothing",
    [rfq.portal_customer_id,eventKey,type,message,JSON.stringify(payload)]);
};
const accept = (poId,body=decision) => runTx(async db => {
  const { po,authorization } = await loadInternalVendorPoAcceptance({
    db,admin,poId,env,decision:body,forUpdate:true,
  });
  return acceptVendorPurchaseOrder({
    db,po:{...po,vendor_name:po.supplier_name},
    adminActor:{id:authorization.adminId,name:authorization.adminName,reason:authorization.auditReason},
    writeEvent,queueEvent,customerNotification,
  });
});
const state = async id => (await pool.query(
  "select po.status,po.confirmed_at is not null as confirmed,"+
  "(select count(*)::int from public.activity_logs a where a.po_id=po.id) audits,"+
  "(select count(*)::int from public.portal_customer_notifications n where n.event_key='po:'||po.id||':vendor_accepted:customer') in_app "+
  "from public.mkt_purchase_orders po where po.id=$1",[id])).rows[0];

try {
  await pool.query(sql);
  assert.deepEqual(await state(14),{status:"issued",confirmed:false,audits:0,in_app:0});
  const first=await accept(14);
  assert.deepEqual(first,{status:"vendor_accepted",poNumber:"PO-TEST-14",alreadyProcessed:false});
  assert.deepEqual(await state(14),{status:"vendor_accepted",confirmed:true,audits:1,in_app:1});
  assert.equal((await accept(14)).alreadyProcessed,true);
  assert.deepEqual(await state(14),{status:"vendor_accepted",confirmed:true,audits:1,in_app:1});
  assert.equal(outbound,0);
  await assert.rejects(accept(16,{...decision,confirmed:false}),e=>e.statusCode===400);
  assert.equal((await state(16)).status,"issued");
  const race=await Promise.all([accept(16),accept(16)]);
  assert.equal(race.filter(x=>!x.alreadyProcessed).length,1);
  assert.equal(race.filter(x=>x.alreadyProcessed).length,1);
  assert.deepEqual(await state(16),{status:"vendor_accepted",confirmed:true,audits:1,in_app:1});
  assert.equal(outbound,0);
  await pool.query("delete from public.portal_company_requests where id=1");
  await assert.rejects(accept(14),e=>e.statusCode===409);
  assert.equal((await state(14)).audits,1);
  console.log("DISPOSABLE_POSTGRES16_INTERNAL_VENDOR_PO_ACCEPT_PASS (14 checks, no outbound/no shared data)");
} finally {
  await pool.end();
}
