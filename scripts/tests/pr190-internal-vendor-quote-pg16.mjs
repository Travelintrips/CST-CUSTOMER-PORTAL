import assert from "node:assert/strict";
import pg from "pg";
import { submitInternalVendorQuote } from "../../server/vendor-quote-submission.mjs";

const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE ?? "postgres",
  max: 3,
  connectionTimeoutMillis: 5000,
});
const env = {
  APP_ENV: "development",
  NODE_ENV: "test",
  CST_INTERNAL_VENDOR_QUOTE_DEV: "true",
  CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "1",
};
const admin = {
  id: 19, email: "admin@cst.test", name: "QA Admin",
  role: "admin", account_status: "active", auth_version: 0,
};
const body = {
  intent: "submit_internal_vendor_quote",
  confirmed: true,
  reason: "Admin records internal CST quotation for isolated PostgreSQL DEV test",
  quotationDate: "2026-11-17",
  paymentTerms: "NET 30",
  notes: "Disposable PostgreSQL test only",
  lines: [{
    rfqLineId: 231, offeredUnitPrice: 100, offeredQty: 1,
    leadTimeDays: 2, stockStatus: "available", currency: "IDR",
    minimumOrderQty: 1, validUntil: "2099-11-23",
  }],
};
const now = new Date("2026-11-17T00:00:00Z");
const db = (client) => (sql, values = []) => client.query(sql, values);

async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(db(client));
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function auditWriter(db) {
  return async (data, key) => {
    const result = await db(
      `insert into public.activity_logs
         (rfq_id,actor_type,actor_id,actor_name,action,old_value,new_value,
          description,mkt_rfq_id,mkt_vendor_quote_id,mkt_purchase_order_id,deduplication_key)
       values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$1,$9,$10,$11)
       on conflict (deduplication_key) where deduplication_key is not null do nothing
       returning id`,
      [data.rfqId,data.actorType,data.actorId,data.actorName,data.action,
       JSON.stringify(data.oldValue??null),JSON.stringify(data.newValue??null),
       data.description??data.action,data.quoteId??null,data.poId??null,key],
    );
    if (result.rowCount && data.rfqId) {
      await db(
        `insert into public.rfq_activity_logs
           (rfq_id,actor_type,actor_id,actor_name,action,description)
         values ($1,$2,$3,$4,$5,$6)`,
        [data.rfqId,data.actorType,data.actorId,data.actorName,data.action,data.description??data.action],
      );
    }
  };
}

async function seedBase(client) {
  await client.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE TYPE public.mkt_rfq_status AS ENUM
      ('draft','submitted','quoting','quoted','awarded','cancelled','expired','customer_review');
    CREATE TYPE public.mkt_quote_status AS ENUM
      ('invited','opened','submitted','selected','rejected','expired','withdrawn','requote_requested');
    CREATE TYPE public.mkt_stock_status AS ENUM ('available','limited','backorder','unavailable');
    CREATE TABLE public.companies(id integer PRIMARY KEY,company_name text NOT NULL,is_active boolean NOT NULL);
    CREATE TABLE public.portal_customers(
      id integer PRIMARY KEY,email text NOT NULL,role text NOT NULL,
      account_status text NOT NULL,auth_version integer NOT NULL,customer_type text
    );
    CREATE TABLE public.portal_company_members(
      id integer PRIMARY KEY,portal_customer_id integer NOT NULL,company_id integer NOT NULL,is_active boolean NOT NULL
    );
    CREATE TABLE public.portal_company_requests(
      id integer PRIMARY KEY,portal_customer_id integer NOT NULL,requested_company_name text NOT NULL,matched_company_id integer,
      status text NOT NULL,reviewed_by integer,reviewed_at timestamptz
    );
    CREATE TABLE public.suppliers(
      id integer PRIMARY KEY,name text NOT NULL,company_id integer,
      is_internal_vendor boolean NOT NULL,is_active boolean NOT NULL
    );
    CREATE TABLE public.mkt_rfqs(
      id integer PRIMARY KEY,rfq_number text NOT NULL,company_id integer,portal_customer_id integer,
      status public.mkt_rfq_status NOT NULL,approval_status text NOT NULL,quote_count integer NOT NULL DEFAULT 0,updated_at timestamp NOT NULL DEFAULT now()
    );
    CREATE TABLE public.mkt_vendor_quotes(
      id integer PRIMARY KEY,rfq_id integer NOT NULL,vendor_id integer NOT NULL,
      token text NOT NULL,token_hash text,status public.mkt_quote_status NOT NULL,
      valid_until timestamp,requote_round integer NOT NULL DEFAULT 1,
      notes text,payment_terms text,payment_term_code text,payment_dp_percent numeric,
      quotation_date date,quotation_number text,submitted_at timestamp,updated_at timestamp
    );
    CREATE TABLE public.mkt_rfq_lines(id integer PRIMARY KEY,rfq_id integer NOT NULL);
    CREATE TABLE public.mkt_vendor_quote_lines(
      id serial PRIMARY KEY,quote_id integer NOT NULL,rfq_line_id integer NOT NULL,
      vendor_catalog_item_id integer,offered_unit_price numeric NOT NULL,offered_qty numeric NOT NULL,
      subtotal numeric NOT NULL,lead_time_days integer,stock_status public.mkt_stock_status,
      notes text,currency text,minimum_order_qty numeric,valid_until date,updated_at timestamp
    );
    CREATE TABLE public.activity_logs(
      id serial PRIMARY KEY,rfq_id integer,actor_type text,actor_id text,actor_name text,
      action text,old_value jsonb,new_value jsonb,description text,mkt_rfq_id integer,
      mkt_vendor_quote_id integer,mkt_purchase_order_id integer,deduplication_key text
    );
    CREATE UNIQUE INDEX activity_logs_dedupe
      ON public.activity_logs(deduplication_key) WHERE deduplication_key IS NOT NULL;
    CREATE TABLE public.rfq_activity_logs(
      id serial PRIMARY KEY,rfq_id integer,actor_type text,actor_id text,actor_name text,
      action text,description text
    );
  `);
  await client.query(`
    INSERT INTO companies VALUES (1,'PT Cahaya Sejati Teknologi',true),(3,'PT Diva Servis',true);
    INSERT INTO portal_customers VALUES
      (19,'admin@cst.test','admin','active',0,NULL),
      (31,'buyer@cst.test','customer','active',0,'company'),
      (32,'unapproved@cst.test','customer','active',0,'company'),
      (20,'stale@cst.test','customer','active',0,NULL);
    INSERT INTO portal_company_members VALUES (1,31,1,true);
    INSERT INTO portal_company_requests VALUES (1,31,'PT CST',1,'approved',19,now());
    INSERT INTO suppliers VALUES
      (24,'CST Internal Services',1,true,true),
      (25,'External Supplier',1,false,true),
      (26,'Diva Internal Services',3,true,true);
    INSERT INTO mkt_rfqs VALUES
      (23,'RFQ-CST-23',1,31,'quoting','approved',0),
      (24,'RFQ-EXTERNAL-24',1,31,'quoting','approved',0),
      (25,'RFQ-CROSS-COMPANY-25',1,31,'quoting','approved',0),
      (26,'RFQ-UNAPPROVED-26',1,32,'quoting','approved',0),
      (27,'RFQ-EXPIRED-27',1,31,'quoting','approved',0),
      (28,'RFQ-LINE-MISMATCH-28',1,31,'quoting','approved',0),
      (29,'RFQ-ROLLBACK-29',1,31,'quoting','approved',0);
    INSERT INTO mkt_rfq_lines VALUES (231,23),(241,24),(251,25),(261,26),(271,27),(281,28),(291,29);
    INSERT INTO mkt_vendor_quotes
      (id,rfq_id,vendor_id,token,token_hash,status,valid_until,requote_round)
    VALUES
      (18,23,24,'DO_NOT_READ_VENDOR_TOKEN','dummy-hash','invited',now()+interval '6 days',1),
      (19,24,25,'external-token','external-hash','invited',now()+interval '6 days',1),
      (20,25,26,'cross-token','cross-hash','invited',now()+interval '6 days',1),
      (21,26,24,'unapproved-token','unapproved-hash','invited',now()+interval '6 days',1),
      (22,27,24,'expired-token','expired-hash','invited',now()-interval '1 day',1),
      (23,28,24,'line-token','line-hash','invited',now()+interval '6 days',1),
      (24,29,24,'rollback-token','rollback-hash','invited',now()+interval '6 days',1);
  `);
}

async function run() {
  const client = await pool.connect();
  try {
    await seedBase(client);
    const first = await transaction((tx) => submitInternalVendorQuote({
      db: tx, admin, rfqId: 23, quoteId: 18, body, env, now, writeEvent: auditWriter(tx),
    }));
    assert.deepEqual(first, {
      rfqId: 23, quoteId: 18, status: "submitted",
      alreadySubmitted: false, actorType: "admin",
    });
    const persisted = (await client.query(
      `select q.status::text as quote_status,q.payment_term_code,q.payment_terms,
              to_char(q.quotation_date,'YYYY-MM-DD') as quotation_date,r.status::text as rfq_status,r.quote_count,
              (select count(*) from mkt_vendor_quote_lines l where l.quote_id=q.id) as line_count
         from mkt_vendor_quotes q join mkt_rfqs r on r.id=q.rfq_id where q.id=18`,
    )).rows[0];
    assert.deepEqual({
      quote_status:persisted.quote_status,payment_term_code:persisted.payment_term_code,
      payment_terms:persisted.payment_terms,quotation_date:persisted.quotation_date,
      rfq_status:persisted.rfq_status,quote_count:persisted.quote_count,line_count:Number(persisted.line_count),
    },{
      quote_status:"submitted",payment_term_code:"net_30",
      payment_terms:"NET 30 hari setelah penerimaan",quotation_date:"2026-11-17",
      rfq_status:"quoted",quote_count:1,line_count:1,
    });
    const audit = (await client.query(
      "select actor_type,actor_id,action,description from activity_logs where mkt_vendor_quote_id=18",
    )).rows[0];
    assert.deepEqual(audit,{
      actor_type:"admin",actor_id:"19",action:"admin_internal_vendor_quote_submitted",
      description:body.reason,
    });
    assert.equal((await client.query("select count(*) from rfq_activity_logs where rfq_id=23")).rows[0].count,"1");

    const replay = await transaction((tx) => submitInternalVendorQuote({
      db:tx,admin,rfqId:23,quoteId:18,body,env,now,writeEvent:auditWriter(tx),
    }));
    assert.equal(replay.alreadySubmitted,true);
    assert.equal((await client.query("select count(*) from mkt_vendor_quote_lines where quote_id=18")).rows[0].count,"1");
    assert.equal((await client.query("select count(*) from activity_logs where mkt_vendor_quote_id=18")).rows[0].count,"1");

    // Reproduce the competing Admin path: it locks RFQ first and then advances
    // the already-submitted quote. An identical internal replay must stay
    // read-only and complete while this RFQ lock is held.
    const blocker = await pool.connect();
    await blocker.query("BEGIN");
    await blocker.query("select id from mkt_rfqs where id=23 for update");
    const concurrentReplay = transaction((tx) => submitInternalVendorQuote({
      db:tx,admin,rfqId:23,quoteId:18,body,env,now,writeEvent:auditWriter(tx),
    }));
    const outcome = await Promise.race([
      concurrentReplay.then(value => ({ type:"done", value }), error => ({ type:"error", error })),
      new Promise(resolve => setTimeout(() => resolve({ type:"timeout" }), 1500)),
    ]);
    if (outcome.type !== "done") {
      await blocker.query("ROLLBACK");
      blocker.release();
      await concurrentReplay.catch(() => {});
      if (outcome.type === "error") throw outcome.error;
      throw new Error("Read-only replay blocked behind an RFQ-first Admin transition.");
    }
    assert.equal(outcome.value.alreadySubmitted,true);
    await blocker.query("update mkt_vendor_quotes set status='selected',valid_until=now()-interval '1 day' where id=18");
    await blocker.query("update mkt_rfqs set status='customer_review',approval_status='pending' where id=23");
    await blocker.query("COMMIT");
    blocker.release();

    const selectedReplay = await transaction((tx) => submitInternalVendorQuote({
      db:tx,admin,rfqId:23,quoteId:18,body,env,now:new Date("2026-12-01T00:00:00Z"),writeEvent:auditWriter(tx),
    }));
    assert.equal(selectedReplay.alreadySubmitted,true);
    assert.equal(selectedReplay.status,"selected");

    await assert.rejects(
      transaction((tx) => submitInternalVendorQuote({
        db:tx,admin,rfqId:23,quoteId:18,
        body:{...body,lines:[{...body.lines[0],offeredUnitPrice:101}]},
        env,now,writeEvent:auditWriter(tx),
      })),
      (error) => error.statusCode === 409,
    );
    await client.query("update mkt_rfqs set status='quoting',approval_status='approved' where id=23");
    await client.query("update mkt_vendor_quotes set status='invited',valid_until=now()+interval '6 days' where id=18");

    const denyCases = [
      { quoteId:19, rfqId:24, expected:403, label:"external vendor" },
      { quoteId:20, rfqId:25, expected:403, label:"cross-company vendor" },
      { quoteId:21, rfqId:26, expected:409, label:"buyer without approved membership" },
      { quoteId:22, rfqId:27, expected:410, label:"expired invitation" },
      { quoteId:23, rfqId:28, expected:403, label:"RFQ line mismatch" },
    ];
    for (const item of denyCases) {
      try {
        await transaction((tx) => submitInternalVendorQuote({
          db:tx,admin,rfqId:item.rfqId,quoteId:item.quoteId,body,env,now,
          writeEvent:auditWriter(tx),
        }));
        throw new Error("Expected denial: " + item.label);
      } catch (error) {
        assert.equal(error.statusCode,item.expected,item.label);
      }
    }
    await assert.rejects(
      transaction((tx) => submitInternalVendorQuote({
        db:tx,admin:{...admin,id:20},rfqId:23,quoteId:18,body,env,now,writeEvent:auditWriter(tx),
      })),
      (error) => error.statusCode === 403,
    );

    const rollbackBody = {
      ...body,
      reason:"Admin rollback test with valid internal vendor",
      lines:[{...body.lines[0],rfqLineId:291}],
    };
    await assert.rejects(
      transaction((tx) => submitInternalVendorQuote({
        db:tx,admin,rfqId:29,quoteId:24,body:rollbackBody,env,now,
        writeEvent:async()=>{throw new Error("synthetic audit failure");},
      })),
      /synthetic audit failure/,
    );
    assert.equal((await client.query("select status::text from mkt_vendor_quotes where id=24")).rows[0].status,"invited");
    assert.equal((await client.query("select count(*) from mkt_vendor_quote_lines where quote_id=24")).rows[0].count,"0");
    assert.equal((await client.query("select count(*) from activity_logs where mkt_vendor_quote_id=24")).rows[0].count,"0");

    // A different, already-submitted quote for the SAME RFQ may be selected
    // by Admin while the internal quote is still invited. In the old
    // quote-first implementation, internal submission and Admin bulk reject
    // could deadlock (Admin holds RFQ -> waits for invited quote; internal
    // holds invited quote -> waits for RFQ). Test the real PostgreSQL locks.
    await client.query(`
      insert into mkt_vendor_quotes
        (id,rfq_id,vendor_id,token,token_hash,status,valid_until,requote_round)
      values (30,23,25,'second-disposable-quote','second-hash','submitted',
              now()+interval '6 days',1)
    `);
    await client.query(`
      insert into mkt_vendor_quote_lines
        (quote_id,rfq_line_id,offered_unit_price,offered_qty,subtotal)
      values (30,231,150,1,150)
    `);
    const selectingAdmin = await pool.connect();
    let internalAttempt = null;
    let selectingOpen = false;
    try {
      await selectingAdmin.query("BEGIN");
      selectingOpen = true;
      await selectingAdmin.query("SET LOCAL lock_timeout='2000ms'");
      await selectingAdmin.query("SELECT id FROM mkt_rfqs WHERE id=23 FOR UPDATE");
      internalAttempt = transaction((tx) => submitInternalVendorQuote({
        db:tx,admin,rfqId:23,quoteId:18,body,env,now,writeEvent:auditWriter(tx),
      })).then(
        value => ({ kind:"completed", value }),
        error => ({ kind:"rejected", error }),
      );
      // Give the competing writer time to reach the locked RFQ, but do not
      // let it acquire a lock on the invited quote before the Admin can
      // reject it as part of selecting the other submitted quote.
      await new Promise(resolve => setTimeout(resolve, 250));
      await selectingAdmin.query(
        "SELECT id FROM mkt_vendor_quotes WHERE id=30 AND rfq_id=23 AND status='submitted' FOR UPDATE",
      );
      await selectingAdmin.query(
        "UPDATE mkt_vendor_quotes SET status='selected' WHERE id=30",
      );
      await selectingAdmin.query(
        "UPDATE mkt_vendor_quotes SET status='rejected' WHERE rfq_id=23 AND id<>30 AND status NOT IN ('rejected','expired','withdrawn')",
      );
      await selectingAdmin.query(
        "UPDATE mkt_rfqs SET status='customer_review',approval_status='pending' WHERE id=23",
      );
      await selectingAdmin.query("COMMIT");
      selectingOpen = false;
      const result = await Promise.race([
        internalAttempt,
        new Promise(resolve => setTimeout(() => resolve({kind:"timeout"}), 2500)),
      ]);
      assert.equal(result.kind,"rejected","Internal submission must lose cleanly to the Admin quote selection");
      assert.equal(result.error?.statusCode,409,"Internal submission must reject after the other quote is selected");
    } finally {
      if (selectingOpen) await selectingAdmin.query("ROLLBACK").catch(()=>{});
      selectingAdmin.release();
      if (internalAttempt) await internalAttempt.catch(()=>{});
    }
    assert.equal((await client.query("select status::text from mkt_vendor_quotes where id=18")).rows[0].status,"rejected");
    assert.equal((await client.query("select status::text from mkt_vendor_quotes where id=30")).rows[0].status,"selected");
    assert.equal((await client.query("select count(*) from mkt_vendor_quote_lines where quote_id=18")).rows[0].count,"1");

    assert.equal((await client.query("select count(*) from mkt_vendor_quotes where token='DO_NOT_READ_VENDOR_TOKEN'")).rows[0].count,"1");
    console.log("PR190_PG16_INTERNAL_QUOTE_SUBMIT_PASS");
    console.log("create + audit + replay + customer-review replay + cross-company denials + expiry + line-scope + rollback: PASS");
  } finally {
    client.release();
    await pool.end();
  }
}
await run();
