import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import pg from "pg";

// Real PostgreSQL 16, real existing canonical RFQ handler and corporate
// approval guard. Isolated GitHub Actions Docker only; no CST-DEV/PROD access.
vi.mock("../server/db.mjs", () => ({
  pool: { connect: () => { throw new Error("LIVE_PORTAL_DB_FORBIDDEN_IN_CI"); } },
}));
import { handleDevCustomerMarketplaceQuote } from "../server/customer-marketplace-rfq.mjs";

const allowed = process.env.CI === "true" &&
  process.env.GITHUB_ACTIONS === "true" &&
  process.env.CST_RFQ_DISPOSABLE_TEST === "true";
const localPg = {
  host: "127.0.0.1", port: 65432, database: "payroll_ci",
  user: "ci_rfq", password: "CI_POSTGRES_DISPOSABLE_ONLY",
  ssl: false, connectionTimeoutMillis: 5000, max: 6,
};
const env = { APP_ENV: "development", CST_CORPORATE_PO_APPROVAL_GATE_DEV: "true" };
const cst = { id: 31, role: "customer", email: "synthetic-cst@example.invalid" };
const diva = { id: 32, role: "customer", email: "synthetic-diva@example.invalid" };
const unapproved = { id: 34, role: "customer", email: "unapproved@example.invalid" };
const details = {
  qty: 2, phone: "081234567890", notes: "CI isolated goods request",
  destination: "Jakarta, Indonesia", required_date: "2099-01-02",
  company_name: "UNTRUSTED-CLIENT-SPOOFED-COMPANY", estimated_price: 1,
};
const owned = [] as string[];
const enumTypes = [] as string[];
let pool: pg.Pool;
const sql = (...lines: string[]) => lines.join(" ");

async function create(name: string, ddl: string) {
  await pool.query(ddl);
  owned.push(name);
}
async function call({ user = cst, body = details, item = 19, key = "ci-company-rfq-a1b2c3d4e5f6",
  environment = env } = {}) {
  const response = {};
  const replies: Array<{ status: number; result: any }> = [];
  await handleDevCustomerMarketplaceQuote({
    request: { method: "POST", headers: { "idempotency-key": key } },
    response, itemId: item, user, body, databasePool: pool, env: environment,
    sendJson: (_reply: unknown, status: number, result: any) => {
      replies.push({ status, result });
    },
  });
  expect(replies).toHaveLength(1);
  return replies[0];
}
async function count(name: string) {
  return Number((await pool.query("select count(*)::int as n from public." + name)).rows[0].n);
}
describe.skipIf(!allowed)("CST company-scoped RFQ E2E on actual disposable PostgreSQL 16", () => {
  beforeAll(async () => {
    if (process.env.APP_ENV !== "development" ||
        process.env.NODE_ENV === "production" || !allowed) {
      throw new Error("CI_RFQ_DEV_ONLY_FAIL_CLOSED");
    }
    // No DSN parsing, no port override and no network-selected credentials.
    pool = new pg.Pool(localPg);
    const state = (await pool.query(sql(
      "select current_database() as db,current_user as actor,",
      "current_setting('server_version_num')::int as version",
    ))).rows[0];
    expect(state.db).toBe("payroll_ci");
    expect(state.actor).toBe("ci_rfq");
    expect(Number(state.version)).toBeGreaterThanOrEqual(160000);
    expect(Number(state.version)).toBeLessThan(170000);
    const existing = await pool.query(
      "select tablename from pg_tables where schemaname='public'");
    if (existing.rows.length !== 0) throw new Error("CI_RFQ_DB_NOT_EMPTY");

    await pool.query("create type public.mkt_rfq_status as enum ('draft','submitted')");
    enumTypes.push("mkt_rfq_status");
    await pool.query("create type public.mkt_rfq_priority as enum ('normal')");
    enumTypes.push("mkt_rfq_priority");
    await create("portal_customers",sql(
      "create table public.portal_customers(id int primary key,",
      "role text not null,account_status text,customer_type text,",
      "name text,email text,company text)"));
    await create("suppliers","create table public.suppliers(id int primary key,is_active boolean)");
    await create("vendor_catalog_items",sql(
      "create table public.vendor_catalog_items(id int primary key,",
      "vendor_id int references public.suppliers(id),name text,description text,",
      "unit text,moq numeric,type text,is_active boolean,is_published boolean,status text)"));
    await create("companies",sql(
      "create table public.companies(id int primary key,is_active boolean,",
      "company_name text,legal_name text,name text)"));
    await create("portal_company_members",sql(
      "create table public.portal_company_members(portal_customer_id int,",
      "company_id int,buyer_role text,is_active boolean)"));
    await create("portal_company_requests",sql(
      "create table public.portal_company_requests(portal_customer_id int,",
      "matched_company_id int,status text,reviewed_by int,reviewed_at timestamptz)"));
    await create("mkt_rfqs",sql(
      "create table public.mkt_rfqs(id serial primary key,rfq_number text unique not null,",
      "company_id int,catalog_vendor_id int,buyer_name text,buyer_email text,",
      "buyer_phone text,buyer_company text,status public.mkt_rfq_status,",
      "priority public.mkt_rfq_priority,required_delivery_date date,",
      "delivery_address text,notes text,email_verified boolean,line_count int,",
      "portal_customer_id int,buyer_role text,approval_status text)"));
    await create("mkt_rfq_lines",sql(
      "create table public.mkt_rfq_lines(id serial primary key,",
      "rfq_id int references public.mkt_rfqs(id),vendor_catalog_item_id int,",
      "item_name text,item_description text,item_unit text,requested_qty numeric,",
      "notes text,sort_order int,constraint ci_qty_limit check(requested_qty <= 100))"));

    await pool.query(sql(
      "insert into public.portal_customers(id,role,account_status,customer_type,name,email,company) values",
      "(31,'customer','active','company','CI CST Buyer','synthetic-cst@example.invalid','CST'),",
      "(32,'customer','active','company','CI Diva Buyer','synthetic-diva@example.invalid','Diva'),",
      "(34,'customer','active','company','CI Pending Buyer','unapproved@example.invalid','CST')"));
    await pool.query("insert into public.companies values(1,true,'PT Cahaya Sejati Teknologi',null,null),(3,true,'PT Diva Servis',null,null)");
    await pool.query("insert into public.portal_company_members values(31,1,'buyer',true),(32,3,'buyer',true),(34,1,'buyer',true)");
    await pool.query(sql(
      "insert into public.portal_company_requests values",
      "(31,1,'approved',99,now()),(32,3,'approved',99,now()),(34,1,'pending',null,null)"));
    await pool.query("insert into public.suppliers values(9,true),(10,false)");
    // Visible catalog item with deliberately stale denormalized status.
    await pool.query(sql(
      "insert into public.vendor_catalog_items values",
      "(19,9,'Synthetic Test Widget','CI product','box',1,'product',true,true,'draft'),",
      "(20,9,'Unpublished Widget','CI private','box',1,'product',true,false,'draft'),",
      "(21,10,'Inactive Supplier Widget','CI private','box',1,'product',true,true,'draft')"));
  }, 30000);

  afterAll(async () => {
    if (!pool) return;
    // Clean only this runner's own tables, no CASCADE, no host database.
    for (const name of [...owned].reverse()) {
      await pool.query('drop table public."' + name + '"').catch(() => {});
    }
    for (const name of [...enumTypes].reverse()) {
      await pool.query('drop type public."' + name + '"').catch(() => {});
    }
    await pool.end();
  }, 30000);

  it("persists an approved CST RFQ and its actual line on real PostgreSQL", async () => {
    const first = await call();
    expect(first.status).toBe(201);
    expect(first.result).toMatchObject({ ok:true, status:"draft", alreadyProcessed:false });
    const rfqId=first.result.rfqId;
    expect(rfqId).toBeGreaterThan(0);
    const row=(await pool.query(sql(
      "select r.company_id,r.portal_customer_id,r.catalog_vendor_id,",
      "r.buyer_name,r.buyer_email,r.buyer_company,",
      "r.status::text as status,to_char(r.required_delivery_date,'YYYY-MM-DD') as delivery_date,",
      "l.vendor_catalog_item_id,l.requested_qty",
      "from public.mkt_rfqs r join public.mkt_rfq_lines l on l.rfq_id=r.id where r.id=$1"
    ),[rfqId])).rows[0];
    expect(row).toMatchObject({
      company_id:1,portal_customer_id:31,catalog_vendor_id:9,
      buyer_name:"CI CST Buyer",buyer_email:"synthetic-cst@example.invalid",
      buyer_company:"PT Cahaya Sejati Teknologi",status:"draft",
      delivery_date:"2099-01-02",vendor_catalog_item_id:19,requested_qty:"2",
    });
    expect(await count("mkt_rfqs")).toBe(1);
    expect(await count("mkt_rfq_lines")).toBe(1);
  });
  it("returns the same RFQ on identical date/contact retry without duplication", async () => {
    const replay = await call();
    expect(replay.status).toBe(200);
    expect(replay.result.alreadyProcessed).toBe(true);
    expect(await count("mkt_rfqs")).toBe(1);
    expect(await count("mkt_rfq_lines")).toBe(1);
  });
  it("rejects edited date, phone, address, notes, or quantity with HTTP 409", async () => {
    for (const changed of [
      {required_date:"2099-01-03"},{phone:"081234567891"},
      {destination:"Bandung, Indonesia"},{notes:"changed text"},{qty:3},
    ]) {
      await expect(call({ body:{...details,...changed} })).rejects.toMatchObject({ statusCode:409 });
    }
    expect(await count("mkt_rfqs")).toBe(1);
  });
  it("creates a Diva RFQ using only approved company-3 membership", async () => {
    const result=await call({user:diva,key:"ci-diva-rfq-b1b2b3b4b5b6",
      body:{...details,company_id:1,buyer_company:"FAKE CST"}});
    expect(result.status).toBe(201);
    const row=(await pool.query("select company_id,portal_customer_id from public.mkt_rfqs where id=$1",
      [result.result.rfqId])).rows[0];
    expect(row).toEqual({company_id:3,portal_customer_id:32});
    expect(await count("mkt_rfqs")).toBe(2);
  });
  it("rejects an unapproved corporate customer before financial commitment", async () => {
    await expect(call({user:unapproved,key:"ci-unapproved-rfq-123456"}))
      .rejects.toMatchObject({statusCode:409});
    expect(await count("mkt_rfqs")).toBe(2);
  });
  it("denies unpublished products and inactive suppliers on actual catalog joins", async () => {
    for (const item of [20,21]) {
      await expect(call({item,key:"ci-unpublished-rfq-"+item+"-12345"}))
        .rejects.toMatchObject({statusCode:404});
    }
    expect(await count("mkt_rfqs")).toBe(2);
  });
  it("rolls back the RFQ header if database rejects its line", async () => {
    await expect(call({body:{...details,qty:101},key:"ci-overlimit-rfq-123456"}))
      .rejects.toMatchObject({code:"23514"});
    expect(await count("mkt_rfqs")).toBe(2);
    expect(await count("mkt_rfq_lines")).toBe(2);
  });
  it("is concurrency-idempotent under actual PostgreSQL unique conflict", async () => {
    const key="ci-concurrent-rfq-1234567890";
    const res=await Promise.all([call({key}),call({key})]);
    expect(res.map(x=>x.status).sort()).toEqual([200,201]);
    expect(res[0].result.rfqId).toBe(res[1].result.rfqId);
    expect(await count("mkt_rfqs")).toBe(3);
    expect(await count("mkt_rfq_lines")).toBe(3);
  });
  it("refuses PROD and unsupported actor before touching the database", async () => {
    await expect(call({environment:{APP_ENV:"production",CST_CORPORATE_PO_APPROVAL_GATE_DEV:"true"}}))
      .rejects.toMatchObject({statusCode:404});
    await expect(call({user:{...cst,role:"admin"}}))
      .rejects.toMatchObject({statusCode:403});
    expect(await count("mkt_rfqs")).toBe(3);
  });
});
