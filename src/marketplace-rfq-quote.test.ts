import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  marketplaceQuoteDevEnabled,
  submitMarketplaceCatalogQuote,
} from "../server/marketplace-rfq-quote.mjs";

const ENV = { APP_ENV: "development", CST_MARKETPLACE_RFQ_QUOTE_DEV: "true" };
const user = { id: 31, email: "qa-approved@example.invalid", name: "QA Buyer" };
const body = {
  buyer_name: "QA Corporate Buyer", guest_contact: "081234567890",
  qty: 2, unit: "pcs", destination: "CI-only delivery location",
  includePpn: true,
};
const key = "ci-rfq-contract-20261116-01";

function fixture(options: {
  approved?: boolean; customerType?: string; companyId?: number;
  approvalLevel?: number; pipeline?: string; catalog?: boolean;
  ownerEmail?: string;
} = {}) {
  const queries: Array<{ text: string; params: any[] }> = [];
  const audits: any[] = [];
  const state: any = { ledger: null, headers: 0, lines: 0, legacy: 0, legacyItems: 0 };
  const companyId = options.companyId ?? 1;
  const db = async (text: string, params: any[] = []) => {
    queries.push({ text, params });
    const n = text.replace(/\s+/g, " ").toLowerCase();
    if (n.includes("pg_advisory_xact_lock")) return { rows: [{ pg_advisory_xact_lock: null }] };
    if (n.includes("from public.portal_customers")) return { rows: [{
      id: user.id, email: options.ownerEmail ?? user.email,
      customer_type: options.customerType ?? "company", account_status: "active",
    }] };
    if (n.includes("from public.portal_company_members")) return { rows:
      options.approved === false ? [] : [{
        company_id: companyId, company_name: companyId === 1 ? "PT CST" : "PT Diva",
        buyer_role: "Purchasing", department: "Procurement", cost_center: "C1",
        approval_level: options.approvalLevel ?? null,
      }],
    };
    if (n.includes("from public.app_config")) return { rows: [{ value: options.pipeline ?? "true" }] };
    if (n.includes("from public.vendor_catalog_items")) return { rows: options.catalog === false ? [] : [{
      id: 77, vendor_id: 9, name: "CI Test Product", description: "Synthetic",
      unit: "pcs", price_sell: "12500.00", currency: "IDR",
      category_key: "product", service_type: null, kategori: "test",
      template_id: null, template_version: null, template_snapshot: {},
      spec_values: {},
    }] };
    if (n.includes("from public.mkt_dual_write_log l")) {
      return { rows: state.ledger ? [{
        ...state.ledger,
        catalog_item_id: 77,
        buyer_email: user.email,
        portal_customer_id: user.id,
        company_id: state.ledger.company_id,
      }] : [] };
    }
    if (n.includes("insert into public.mkt_dual_write_log")) {
      state.ledger = { id: 810, status: "pending", company_id: companyId };
      return { rows: [{ id: 810 }] };
    }
    if (n.includes("insert into public.mkt_rfqs")) {
      state.headers++;
      state.headerParams = params;
      return { rows: [{ id: 811 }] };
    }
    if (n.includes("update public.mkt_rfqs")) return { rows: [{ rfq_number: "MKT-RFQ-202611-0811" }] };
    if (n.includes("insert into public.mkt_rfq_lines")) {
      state.lines++;
      return { rows: [{ id: 812 }] };
    }
    if (n.includes("insert into public.portal_product_orders")) {
      state.legacy++;
      state.legacyParams = params;
      return { rows: [{ id: 813 }] };
    }
    if (n.includes("update public.portal_product_orders")) return { rows: [{ order_number: "MCT-261116-000813" }] };
    if (n.includes("insert into public.portal_product_order_items")) {
      state.legacyItems++;
      return { rows: [{ id: 814 }] };
    }
    if (n.includes("update public.mkt_dual_write_log")) {
      state.ledger = {
        ...state.ledger, status: "linked",
        mkt_rfq_id: 811, mkt_rfq_number: "MKT-RFQ-202611-0811",
        portal_order_id: 813, portal_order_number: "MCT-261116-000813",
      };
      return { rows: [] };
    }
    throw new Error("UNHANDLED_TEST_SQL: " + n.slice(0, 85));
  };
  const withTransaction = async (work: (db: typeof db) => Promise<any>) => {
    const snapshot = structuredClone(state);
    try { return await work(db); }
    catch (e) { for (const k of Object.keys(state)) delete state[k]; Object.assign(state, snapshot); throw e; }
  };
  const writeEvent = async (_db: any, data: any, dedupe: string) => {
    audits.push({ data, dedupe }); return true;
  };
  const call = (override: any = {}) => submitMarketplaceCatalogQuote({
    catalogItemId: 77, user, body, idempotencyKey: key, env: ENV, ...override,
  }, { withTransaction, writeEvent });
  return { call, state, queries, audits };
}

describe("DEV Marketplace quote route restored from canonical RFQ ledger", () => {
  it("is strictly OFF outside opted-in development, including PROD", async () => {
    expect(marketplaceQuoteDevEnabled({ ...ENV, APP_ENV: "production" })).toBe(false);
    expect(marketplaceQuoteDevEnabled({ APP_ENV: "development" })).toBe(false);
    const f = fixture();
    await expect(f.call({ env: { APP_ENV: "production", CST_MARKETPLACE_RFQ_QUOTE_DEV: "true" } }))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(f.queries).toHaveLength(0);
  });
  it("requires a verified logged-in customer and logical idempotency key", async () => {
    const f = fixture();
    await expect(f.call({ user: null })).rejects.toMatchObject({ statusCode: 401 });
    await expect(f.call({ idempotencyKey: "" })).rejects.toMatchObject({ statusCode: 400 });
    await expect(f.call({ body: { ...body, company_id: 3 } })).rejects.toMatchObject({ statusCode: 422 });
    expect(f.queries).toHaveLength(0);
  });
  it("creates one audited company-bound RFQ and its legacy link atomically", async () => {
    const f = fixture();
    const result = await f.call();
    expect(result).toMatchObject({
      rfqId: 811, orderNumber: "MCT-261116-000813", newPipeline: true,
      alreadyProcessed: false,
    });
    expect(f.state).toMatchObject({ headers: 1, lines: 1, legacy: 1, legacyItems: 1 });
    expect(f.state.headerParams).toContain(1);
    expect(f.state.headerParams).toContain(31);
    expect(f.state.legacyParams).toContain(1);
    expect(f.state.ledger.status).toBe("linked");
    expect(f.audits).toHaveLength(1);
    expect(f.audits[0].data.newValue.companyId).toBe(1);
    expect(f.audits[0].dedupe).toContain(key);
    expect(f.queries.some(q => q.text.includes("pg_advisory_xact_lock"))).toBe(true);
    expect(f.queries.some(q => q.text.includes("request.reviewed_at is not null") ||
      q.text.includes("r.reviewed_at is not null"))).toBe(true);
  });
  it("replays the same logical request without a duplicate write or audit", async () => {
    const f = fixture();
    await f.call();
    const replay = await f.call();
    expect(replay).toMatchObject({ rfqId: 811, id: 813, alreadyProcessed: true });
    expect(f.state).toMatchObject({ headers: 1, lines: 1, legacy: 1, legacyItems: 1 });
    expect(f.audits).toHaveLength(1);
  });
  it("refuses company without prior Admin approval", async () => {
    const f = fixture({ approved: false });
    await expect(f.call()).rejects.toMatchObject({ statusCode: 409 });
    expect(f.state.headers).toBe(0);
  });
  it("does not bypass higher-level corporate approval", async () => {
    const f = fixture({ approvalLevel: 2 });
    await expect(f.call()).rejects.toMatchObject({ statusCode: 409 });
    expect(f.state.headers).toBe(0);
  });
  it("does not accept company identity from the browser or a mismatched login", async () => {
    const f = fixture({ ownerEmail: "other@example.invalid" });
    await expect(f.call()).rejects.toMatchObject({ statusCode: 401 });
    expect(f.state.headers).toBe(0);
  });
  it("fails closed when the canonical flag or item is unavailable", async () => {
    const pipeline = fixture({ pipeline: "false" });
    await expect(pipeline.call()).rejects.toMatchObject({ statusCode: 503 });
    const catalog = fixture({ catalog: false });
    await expect(catalog.call()).rejects.toMatchObject({ statusCode: 404 });
  });
  it("keeps individual requests company-less", async () => {
    const f = fixture({ customerType: "individual" });
    await f.call();
    expect(f.state.headerParams[1]).toBeNull();
  });
  it("mounts the expected POST route after session auth and before public item reads", () => {
    const source = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const route = source.indexOf("const marketplaceQuoteMatch = pathname.match(");
    const end = source.indexOf("const marketplaceItemMatch =", route);
    const section = source.slice(route, end);
    expect(route).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(route);
    expect(section).toContain("request.method === \"POST\"");
    expect(section.indexOf("requireUser(request, response)")).toBeGreaterThan(0);
    expect(section.indexOf("submitMarketplaceCatalogQuote(")).toBeGreaterThan(section.indexOf("requireUser(request, response)"));
    expect(section).toContain("withTransaction: withMarketplaceTransaction");
  });
});
