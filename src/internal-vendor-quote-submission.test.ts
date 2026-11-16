import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  matchesVendorQuoteSubmission,
  normalizeVendorQuoteSubmission,
  persistVendorQuoteSubmission,
  submitInternalVendorQuote,
} from "../server/vendor-quote-submission.mjs";

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
const rfq = {
  id: 23, company_id: 1, portal_customer_id: 31,
  status: "quoting", approval_status: "approved",
};
const quote = {
  id: 18, rfq_id: 23, vendor_id: 24, status: "invited",
  valid_until: "2099-11-23T00:00:00Z", requote_round: 1,
  notes: null, payment_terms: null, payment_term_code: null,
  payment_dp_percent: null, quotation_date: null,
};
const supplier = {
  id: 24, name: "CST Internal Services", company_id: 1,
  is_internal_vendor: true, is_active: true,
};
const body = {
  intent: "submit_internal_vendor_quote",
  confirmed: true,
  reason: "Admin records internal CST quotation for DEV testing",
  quotationDate: "2026-11-17",
  paymentTerms: "NET 30",
  notes: "Internal QA quotation only",
  lines: [{
    rfqLineId: 231,
    offeredUnitPrice: 100,
    offeredQty: 1,
    leadTimeDays: 2,
    stockStatus: "available",
    currency: "IDR",
    minimumOrderQty: 1,
    validUntil: "2099-11-23",
  }],
};

function fixture(overrides = {}) {
  const state = {
    adminRow: { id: 19, email: admin.email, role: "admin", account_status: "active", auth_version: 0 },
    buyer: { id: 31, role: "customer", customer_type: "company", account_status: "active" },
    membership: [{ company_id: 1 }],
    supplier,
    rfq,
    quote,
    rfqLines: [{ id: 231 }],
    existingQuoteLines: [],
    ...overrides,
  };
  const calls = [];
  const db = vi.fn(async (sql, values = []) => {
    calls.push({ sql: String(sql), values });
    const q = String(sql).toLowerCase().replace(/\s+/g, " ").trim();
    if (q.startsWith("select id,rfq_id,vendor_id,status,valid_until")) return { rows: [state.quote], rowCount: 1 };
    if (q.startsWith("select * from public.mkt_rfqs")) return { rows: [state.rfq], rowCount: 1 };
    if (q.startsWith("select id,email,role,account_status,auth_version")) return { rows: [state.adminRow], rowCount: 1 };
    if (q.startsWith("select id,name,company_id,is_internal_vendor,is_active")) return { rows: state.supplier ? [state.supplier] : [], rowCount: state.supplier ? 1 : 0 };
    if (q.startsWith("select id,role,customer_type,account_status")) return { rows: state.buyer ? [state.buyer] : [], rowCount: state.buyer ? 1 : 0 };
    if (q.startsWith("select m.company_id")) return { rows: state.membership, rowCount: state.membership.length };
    if (q.startsWith("select id from public.mkt_rfq_lines")) return { rows: state.rfqLines, rowCount: state.rfqLines.length };
    if (q.startsWith("select id from public.mkt_vendor_quote_lines where quote_id")) return { rows: [], rowCount: 0 };
    if (q.startsWith("select rfq_line_id")) return { rows: state.existingQuoteLines, rowCount: state.existingQuoteLines.length };
    if (q.startsWith("insert into public.mkt_vendor_quote_lines")) return { rows: [{ id: 801 }], rowCount: 1 };
    if (q.startsWith("update public.mkt_vendor_quotes")) return { rows: [{ id: 18 }], rowCount: 1 };
    if (q.startsWith("update public.mkt_rfqs")) return { rows: [{ id: 23 }], rowCount: 1 };
    return { rows: [], rowCount: 1 };
  });
  return { db, calls, state };
}
const run = (f, overrides = {}) => submitInternalVendorQuote({
  db: f.db, admin, rfqId: 23, quoteId: 18, body, env, writeEvent: vi.fn(), ...overrides,
});

describe("audited Admin-as-internal-vendor quote submit uses canonical quote writer", () => {
  it("submits a company-bound internal quote and records the real Admin actor", async () => {
    const f = fixture();
    const writeEvent = vi.fn();
    const result = await submitInternalVendorQuote({
      db: f.db, admin, rfqId: 23, quoteId: 18, body, env, writeEvent,
    });
    expect(result).toMatchObject({
      rfqId: 23, quoteId: 18, status: "submitted",
      alreadySubmitted: false, actorType: "admin",
    });
    expect(f.calls.some(x => x.sql.startsWith("insert into public.mkt_vendor_quote_lines"))).toBe(true);
    expect(f.calls.some(x => x.sql.startsWith("update public.mkt_vendor_quotes"))).toBe(true);
    expect(f.calls.some(x => x.sql.startsWith("update public.mkt_rfqs"))).toBe(true);
    expect(writeEvent).toHaveBeenCalledOnce();
    expect(writeEvent.mock.calls[0][0]).toMatchObject({
      actorType: "admin", actorId: "19", actorName: "QA Admin",
      action: "admin_internal_vendor_quote_submitted",
      description: body.reason,
    });
    expect(f.calls.some(x => /mkt_notification_queue|vendor_notifications|purchase_orders/.test(x.sql))).toBe(false);
    expect(f.calls.some(x => /token_hash|select .*\btoken\b/.test(x.sql))).toBe(false);
  });

  it("replays the same submitted quote after customer review without another write", async () => {
    const existing = {
      rfq_line_id: 231, vendor_catalog_item_id: null,
      offered_unit_price: "100.00", offered_qty: "1.00", lead_time_days: 2,
      stock_status: "available", notes: null, currency: "IDR",
      minimum_order_qty: "1.00", valid_until: "2099-11-23",
    };
    const f = fixture({
      quote: {
        ...quote, status: "submitted", valid_until: "2026-11-16T00:00:00Z",
        notes: body.notes, payment_terms: "NET 30 hari setelah penerimaan",
        payment_term_code: "net_30", payment_dp_percent: null,
        quotation_date: "2026-11-17",
      },
      rfq: { ...rfq, status: "customer_review", approval_status: "pending" },
      existingQuoteLines: [existing],
    });
    const writeEvent = vi.fn();
    const result = await submitInternalVendorQuote({
      db: f.db, admin, rfqId: 23, quoteId: 18, body, env, writeEvent,
      now: new Date("2026-11-24T00:00:00Z"),
    });
    expect(result).toMatchObject({ status: "submitted", alreadySubmitted: true });
    expect(f.calls.some(x => /insert into|update public\.mkt_vendor_quote_lines|update public\.mkt_vendor_quotes|update public\.mkt_rfqs/.test(x.sql))).toBe(false);
    expect(writeEvent).not.toHaveBeenCalled();
  });

  it("rejects a changed replay payload and does not write", async () => {
    const f = fixture({
      quote: {
        ...quote, status: "submitted", notes: body.notes,
        payment_terms: "NET 30 hari setelah penerimaan", payment_term_code: "net_30",
        quotation_date: "2026-11-17",
      },
      rfq: { ...rfq, status: "quoted" },
      existingQuoteLines: [{
        rfq_line_id: 231, vendor_catalog_item_id: null,
        offered_unit_price: "100.00", offered_qty: "1.00", lead_time_days: 2,
        stock_status: "available", notes: null, currency: "IDR",
        minimum_order_qty: "1.00", valid_until: "2099-11-23",
      }],
    });
    const changed = { ...body, lines: [{ ...body.lines[0], offeredUnitPrice: 101 }] };
    await expect(submitInternalVendorQuote({
      db: f.db, admin, rfqId: 23, quoteId: 18, body: changed, env, writeEvent: vi.fn(),
    })).rejects.toMatchObject({ statusCode: 409 });
    expect(f.calls.some(x => /insert into|update public\.mkt_vendor_quote_lines|update public\.mkt_vendor_quotes|update public\.mkt_rfqs/.test(x.sql))).toBe(false);
  });

  it("fails closed before database access when the DEV flag is absent or production", async () => {
    const f = fixture();
    await expect(run(f, { env: { ...env, CST_INTERNAL_VENDOR_QUOTE_DEV: "false" } }))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(run(f, { env: { ...env, APP_ENV: "production" } }))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(f.db).not.toHaveBeenCalled();
  });

  it("rejects inactive/stale Admin identity", async () => {
    const f = fixture({ adminRow: { ...fixture().state.adminRow, account_status: "disabled" } });
    await expect(run(f)).rejects.toMatchObject({ statusCode: 403 });
    expect(f.calls.some(x => x.sql.startsWith("insert into"))).toBe(false);
  });

  it("rejects an Admin auth-version/email change during the transaction", async () => {
    const f = fixture({ adminRow: { id: 19, email: "changed@cst.test", role: "admin", account_status: "active", auth_version: 0 } });
    await expect(run(f)).rejects.toMatchObject({ statusCode: 403 });
    expect(f.calls.some(x => x.sql.startsWith("insert into"))).toBe(false);
  });

  it("rejects wrong company, external vendor and unapproved buyer membership", async () => {
    const wrongCompany = fixture({ supplier: { ...supplier, company_id: 3 } });
    await expect(run(wrongCompany)).rejects.toMatchObject({ statusCode: 403 });
    const external = fixture({ supplier: { ...supplier, is_internal_vendor: false } });
    await expect(run(external)).rejects.toMatchObject({ statusCode: 403 });
    const unapproved = fixture({ membership: [] });
    await expect(run(unapproved)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rejects an RFQ not approved by the buyer company", async () => {
    const f = fixture({ rfq: { ...rfq, approval_status: "pending" } });
    await expect(run(f)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("rejects expired invitations and RFQ line IDs outside the locked RFQ", async () => {
    const expired = fixture({ quote: { ...quote, valid_until: "2026-11-16T00:00:00Z" } });
    await expect(run(expired)).rejects.toMatchObject({ statusCode: 410 });
    const lineMismatch = fixture({ rfqLines: [{ id: 232 }] });
    await expect(run(lineMismatch)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects invalid payment terms, duplicate lines, and non-IDR offers", () => {
    expect(() => normalizeVendorQuoteSubmission({ ...body, paymentTerms: "unknown" }))
      .toThrow(expect.objectContaining({ statusCode: 400 }));
    expect(() => normalizeVendorQuoteSubmission({
      ...body, lines: [body.lines[0], body.lines[0]],
    })).toThrow(expect.objectContaining({ statusCode: 400 }));
    expect(() => normalizeVendorQuoteSubmission({
      ...body, lines: [{ ...body.lines[0], currency: "USD" }],
    })).toThrow(expect.objectContaining({ statusCode: 400 }));
  });

  it("keeps vendor-token and Admin submissions on the same canonical persistence function", () => {
    const source = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const vendorRoute = source.slice(source.indexOf("async function handleVendorQuote"), source.indexOf("async function inviteVendorsToExistingRfq"));
    const adminRoute = source.slice(source.indexOf("async function handleAdminMarketplace"), source.indexOf("async function handlePortalPurchaseOrders"));
    expect(vendorRoute).toContain("persistVendorQuoteSubmission");
    expect(adminRoute).toContain("submitInternalVendorQuote");
    expect(source).toContain("authorizeInternalVendorQuotation");
  });
});
