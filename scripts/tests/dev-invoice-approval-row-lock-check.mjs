import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import pg from "pg";

const raw = process.env.DISPOSABLE_APPROVAL_LOCK_URL;
assert(raw, "isolated database URL required");
const url = new URL(raw);
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.pathname, "/invoice_authority_synthetic");
assert.equal(process.env.APP_ENV, "development");

const source = readFileSync("server/billing-operations.mjs", "utf8");
const matches = [...source.matchAll(/\x60(select 1 as approved[\s\S]*?for share of member, approval, reviewer, issuer)\x60/g)];
assert.equal(matches.length, 1, "exact SQL must be uniquely found in Billing source");
const sql = matches[0][1];
const pool = new pg.Pool({connectionString:raw, max:3, connectionTimeoutMillis:2500});
let first, second;
try {
  await pool.query("CREATE TABLE portal_customers(id integer primary key,role text not null,account_status text)");
  await pool.query("CREATE TABLE portal_company_members(id integer primary key,portal_customer_id integer not null,company_id integer not null,is_active boolean not null)");
  await pool.query("CREATE TABLE portal_company_requests(id integer primary key,portal_customer_id integer not null,matched_company_id integer,status text not null,reviewed_by integer,reviewed_at timestamptz)");
  await pool.query("INSERT INTO portal_customers VALUES (11,'admin','active'),(12,'admin','active'),(13,'customer','active')");
  await pool.query("INSERT INTO portal_company_members VALUES (1,11,1,true)");
  await pool.query("INSERT INTO portal_company_requests VALUES (1,11,1,'approved',12,now())");
  first = await pool.connect();
  second = await pool.connect();
  await first.query("BEGIN");
  assert.equal((await first.query(sql,[11,1])).rows.length,1);
  await second.query("BEGIN");
  await second.query("SET LOCAL lock_timeout = '300ms'");
  await assert.rejects(
    ()=>second.query("UPDATE portal_company_members SET is_active=false WHERE id=1"),
    e=>e.code==="55P03",
  );
  await second.query("ROLLBACK");
  await first.query("COMMIT");
  console.log("MEMBERSHIP_REVOCATION_BLOCKED_UNTIL_COMMIT_PASS");
  await second.query("UPDATE portal_company_members SET is_active=false WHERE id=1");
  await first.query("BEGIN");
  assert.equal((await first.query(sql,[11,1])).rows.length,0);
  await first.query("ROLLBACK");
  console.log("REVOKED_MEMBERSHIP_AUTH_DENIED_PASS");
  await second.query("UPDATE portal_company_members SET is_active=true WHERE id=1");
  await second.query("UPDATE portal_customers SET role='customer' WHERE id=12");
  await first.query("BEGIN");
  assert.equal((await first.query(sql,[11,1])).rows.length,0);
  await first.query("ROLLBACK");
  await second.query("UPDATE portal_customers SET role='admin' WHERE id=12");
  console.log("REVOKED_REVIEWER_ROLE_AUTH_DENIED_PASS");
  await first.query("BEGIN");
  assert.equal((await first.query(sql,[11,1])).rows.length,1);
  await second.query("BEGIN");
  await second.query("SET LOCAL lock_timeout = '300ms'");
  await assert.rejects(
    ()=>second.query("UPDATE portal_company_requests SET status='rejected' WHERE id=1"),
    e=>e.code==="55P03",
  );
  await second.query("ROLLBACK");
  await first.query("COMMIT");
  console.log("APPROVAL_REVOCATION_BLOCKED_UNTIL_COMMIT_PASS");
} finally {
  for(const c of [first,second]){
    if(c){await c.query("ROLLBACK").catch(()=>{});c.release();}
  }
  await pool.end();
}
