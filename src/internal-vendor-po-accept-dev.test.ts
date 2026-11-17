import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  internalVendorPoAcceptanceDevEnabled,
  internalVendorPoTestAllowlist,
  authorizeInternalVendorPoAcceptance,
  loadInternalVendorPoAcceptance,
} from "../server/internal-vendor-po-accept.mjs";
import { acceptVendorPurchaseOrder } from "../server/vendor-po-acceptance.mjs";

const env = {
  APP_ENV: "development",
  NODE_ENV: "test",
  CST_INTERNAL_VENDOR_PO_ACCEPT_DEV: "true",
  CST_INTERNAL_VENDOR_PO_IDS_DEV: "14",
  CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "1",
};
const admin = { id: 11, role: "admin", account_status: "active", name: "QA Admin" };
const po = {
  id: 14, po_number: "PO-TEST-00014", status: "issued",
  rfq_id: 23, quote_id: 18, vendor_id: 24, company_id: 1,
  confirmed_at: null, grand_total: "100000.00", payment_status: "unpaid",
  rfq_number: "RFQ-TEST-23", portal_customer_id: 31,
  buyer_email: "buyer@example.test", vendor_name: "CST Internal",
};
const rfq = {
  id: 23, company_id: 1, portal_customer_id: 31,
  winning_quote_id: 18, approval_status: "approved", status: "awarded",
};
const quote = {
  id: 18, rfq_id: 23, vendor_id: 24,
  status: "selected", notes: "TEST DEV ONLY - synthetic quotation",
};
const supplier = {
  id: 24, name: "CST Internal", company_id: 1,
  is_internal_vendor: true, is_active: true,
};
const decision = {
  intent: "accept_internal_vendor_po_dev",
  confirmed: true,
  reason: "TEST DEV: Owner-authorized internal supplier PO lifecycle simulation",
};
const base = {
  admin, po, rfq, quote, supplier,
  approvedBuyerCompany: true, env,
  ...decision, requireDecision: true,
};
const check = (overrides = {}) => authorizeInternalVendorPoAcceptance({ ...base, ...overrides });
const errorCode = async (value: () => unknown) => {
  try { await value(); return null; }
  catch (err) { return (err as { statusCode?: number }).statusCode; }
};

function fakeDb(record = {}, settings = {}) {
  const state = {
    ...po, rfq_identity: rfq.id, rfq_status: rfq.status,
    approval_status: rfq.approval_status,
    rfq_company_id: rfq.company_id, winning_quote_id: rfq.winning_quote_id,
    quote_identity: quote.id, quote_status: quote.status,
    quote_rfq_id: quote.rfq_id, quote_vendor_id: quote.vendor_id,
    quote_notes: quote.notes, supplier_identity: supplier.id,
    supplier_name: supplier.name, supplier_company_id: supplier.company_id,
    is_internal_vendor: supplier.is_internal_vendor,
    supplier_active: supplier.is_active,
    ...record,
  };
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  const db = vi.fn(async (sql: string, values: unknown[] = []) => {
    calls.push({ sql, values });
    if (sql.includes("from public.portal_customers where id=$1") && sql.includes("id,role,account_status")) {
      return { rows: (settings as any).noAdmin ? [] : [admin], rowCount: 1 };
    }
    if (sql.includes("from public.mkt_purchase_orders po")) return { rows: [state], rowCount: 1 };
    if (sql.includes("id,role,customer_type,account_status")) {
      return { rows: [{ id: 31, role: "customer", customer_type: "company", account_status: "active" }], rowCount: 1 };
    }
    if (sql.includes("from public.portal_company_members m")) {
      return { rows: (settings as any).noMembership ? [] : [{ company_id: 1 }], rowCount: 1 };
    }
    throw new Error("Unexpected SQL in test: " + sql.slice(0, 90));
  });
  return { db, calls };
}

function writerFixture(overrides = {}) {
  const calls: Array<{ sql: string; values: unknown[] }> = [];
  const db = vi.fn(async (sql: string, values: unknown[] = []) => {
    calls.push({ sql, values });
    if (sql.includes("update public.mkt_purchase_orders")) return { rowCount: 1, rows: [{ id: 14 }] };
    return { rowCount: 0, rows: [] };
  });
  const writeEvent = vi.fn(async () => true);
  const queueEvent = vi.fn(async () => true);
  const customerNotification = vi.fn(async () => true);
  return {
    db, calls, writeEvent, queueEvent, customerNotification,
    po: { ...po, ...overrides },
  };
}

describe("DEV internal-vendor PO TEST authorization", () => {
  it("defaults OFF and cannot be enabled in PROD", () => {
    expect(internalVendorPoAcceptanceDevEnabled({})).toBe(false);
    expect(internalVendorPoAcceptanceDevEnabled({ ...env, APP_ENV: "production" })).toBe(false);
    expect(internalVendorPoAcceptanceDevEnabled({ ...env, NODE_ENV: "production" })).toBe(false);
    expect(internalVendorPoAcceptanceDevEnabled(env)).toBe(true);
  });
  it("allows only explicit, exact PO ID list; no wildcard or partial parse", () => {
    for (const ids of ["", "*", "14,", "14,abc", "14, 15", "0", "-14", "14;15"]) {
      expect(internalVendorPoTestAllowlist({ ...env, CST_INTERNAL_VENDOR_PO_IDS_DEV: ids }).size).toBe(0);
    }
    expect([...internalVendorPoTestAllowlist(env)]).toEqual([14]);
  });
  it("accepts only active signed Admin and matching internal company/quote/PO", () => {
    expect(check()).toMatchObject({
      poId: 14, rfqId: 23, quoteId: 18, companyId: 1,
      vendorId: 24, adminId: 11, alreadyProcessed: false,
    });
  });
  it("rejects invalid Admin/session and absence of audit decision", async () => {
    for (const invalid of [
      { admin: { ...admin, role: "customer" } },
      { admin: { ...admin, account_status: "inactive" } },
      { admin: { ...admin, id: null } },
    ]) expect(await errorCode(() => check(invalid))).toBe(403);
    for (const invalid of [
      { confirmed: false },
      { intent: "accept" },
      { reason: "TEST" },
      { reason: "not a TEST DEV audit explanation" },
    ]) expect(await errorCode(() => check(invalid))).toBe(400);
  });
  it("rejects another company, vendor, quote or non-allowlisted PO", async () => {
    const invalid = [
      { po: { ...po, id: 15 } },
      { po: { ...po, company_id: 3 } },
      { po: { ...po, quote_id: 999 } },
      { rfq: { ...rfq, winning_quote_id: 19 } },
      { supplier: { ...supplier, company_id: 2 } },
      { supplier: { ...supplier, is_internal_vendor: false } },
      { supplier: { ...supplier, is_active: false } },
    ];
    for (const changed of invalid) expect(await errorCode(() => check(changed))).toBeTruthy();
  });
  it("rejects commercial PO, missing buyer approval, payment and stale stages", async () => {
    for (const changed of [
      { quote: { ...quote, notes: "regular commercial quote" } },
      { quote: { ...quote, status: "submitted" } },
      { rfq: { ...rfq, status: "customer_review" } },
      { rfq: { ...rfq, approval_status: "pending" } },
      { approvedBuyerCompany: false },
      { po: { ...po, status: "completed" } },
      { po: { ...po, confirmed_at: "2026-11-17" } },
      { po: { ...po, payment_status: "paid" } },
    ]) expect(await errorCode(() => check(changed))).toBeTruthy();
  });
  it("recognizes approved replay as read-only rather than submitting twice", () => {
    expect(check({
      po: { ...po, status: "vendor_accepted", confirmed_at: "2026-11-17T08:00:00Z" },
    }).alreadyProcessed).toBe(true);
  });
  it("GET preflight is SELECT-only and never includes the vendor token", async () => {
    const f = fakeDb();
    const result = await loadInternalVendorPoAcceptance({ db: f.db, admin, poId: 14, env });
    expect(result.data).toMatchObject({ poId: 14, vendorName: supplier.name, status: "issued" });
    expect(result.data).not.toHaveProperty("vendor_token");
    expect(result.data).not.toHaveProperty("vendorToken");
    expect(f.calls.every(({ sql }) => /^select/i.test(sql.trim()))).toBe(true);
    expect(f.calls.some(({ sql }) => sql.includes("po.vendor_token"))).toBe(false);
  });
  it("preflight and POST refuse unapproved company memberships", async () => {
    const f = fakeDb({}, { noMembership: true });
    await expect(loadInternalVendorPoAcceptance({
      db: f.db, admin, poId: 14, env,
    })).rejects.toMatchObject({ statusCode: 409 });
  });
  it("POST requires fresh Admin row and holds PO lock before accepting", async () => {
    const f = fakeDb();
    const result = await loadInternalVendorPoAcceptance({
      db: f.db, admin, poId: 14, env, decision, forUpdate: true,
    });
    expect(result.authorization.adminId).toBe(11);
    expect(f.calls.some(({ sql }) => sql.includes("for update of po"))).toBe(true);
    const missing = fakeDb({}, { noAdmin: true });
    await expect(loadInternalVendorPoAcceptance({
      db: missing.db, admin, poId: 14, env, decision, forUpdate: true,
    })).rejects.toMatchObject({ statusCode: 403 });
  });
  it("feature disabled rejects before touching DB or vendor token", async () => {
    const db = vi.fn();
    await expect(loadInternalVendorPoAcceptance({
      db, admin, poId: 14,
      env: { ...env, CST_INTERNAL_VENDOR_PO_ACCEPT_DEV: "false" },
    })).rejects.toMatchObject({ statusCode: 404 });
    expect(db).not.toHaveBeenCalled();
  });
});

describe("shared canonical vendor PO acceptance, with no duplicate writer", () => {
  it("Admin TEST path accepts once, logs real Admin, not vendor and enqueues ZERO WA", async () => {
    const f = writerFixture();
    const result = await acceptVendorPurchaseOrder({
      ...f, adminActor: { id: 11, name: "QA Admin", reason: decision.reason },
    });
    expect(result).toMatchObject({ status: "vendor_accepted", alreadyProcessed: false });
    expect(f.calls.filter(c => c.sql.includes("update public.mkt_purchase_orders"))).toHaveLength(1);
    expect(f.writeEvent).toHaveBeenCalledOnce();
    expect(f.writeEvent.mock.calls[0][1]).toMatchObject({
      actorType: "admin", actorId: "11",
      action: "admin_internal_vendor_po_accepted",
      description: decision.reason,
    });
    expect(f.writeEvent.mock.calls[0][2]).toBe("po:14:vendor_accepted");
    expect(f.queueEvent).not.toHaveBeenCalled();
    expect(f.customerNotification).toHaveBeenCalledOnce();
    expect(f.customerNotification.mock.calls[0][6]).toMatchObject({
      poId: 14, testDev: true,
    });
  });
  it("normal vendor route retains existing actor, dedupe and WA enqueue", async () => {
    const f = writerFixture();
    const result = await acceptVendorPurchaseOrder(f);
    expect(result.status).toBe("vendor_accepted");
    expect(f.writeEvent.mock.calls[0][1]).toMatchObject({
      actorType: "vendor", actorId: "24", action: "po_vendor_accepted",
    });
    expect(f.queueEvent).toHaveBeenCalledOnce();
    expect(f.customerNotification).toHaveBeenCalledOnce();
  });
  it("confirmed PO replay never writes events, queue or second notification", async () => {
    const f = writerFixture({ status: "vendor_accepted", confirmed_at: "2026-11-17" });
    const r = await acceptVendorPurchaseOrder({
      ...f, adminActor: { id: 11, name: "QA Admin", reason: decision.reason },
    });
    expect(r).toMatchObject({ status: "vendor_accepted", alreadyProcessed: true });
    expect(f.db).not.toHaveBeenCalled();
    expect(f.writeEvent).not.toHaveBeenCalled();
    expect(f.queueEvent).not.toHaveBeenCalled();
    expect(f.customerNotification).not.toHaveBeenCalled();
  });
  it("legacy real vendor confirmation keeps legacy status without a new WA", async () => {
    const f = writerFixture({ status: "production", confirmed_at: null });
    const r = await acceptVendorPurchaseOrder(f);
    expect(r).toMatchObject({ status: "production", alreadyProcessed: false });
    expect(f.writeEvent.mock.calls[0][1]).toMatchObject({
      action: "po_vendor_accepted_legacy", actorType: "vendor",
    });
    expect(f.queueEvent).not.toHaveBeenCalled();
  });
  it("Admin cannot accept legacy or completed PO", async () => {
    const f = writerFixture({ status: "production" });
    await expect(acceptVendorPurchaseOrder({
      ...f, adminActor: { id: 11, name: "QA Admin", reason: decision.reason },
    })).rejects.toMatchObject({ statusCode: 409 });
    expect(f.db).not.toHaveBeenCalled();
  });
  it("rejects concurrent status change before writing audit", async () => {
    const f = writerFixture();
    f.db.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(acceptVendorPurchaseOrder(f)).rejects.toMatchObject({ statusCode: 409 });
    expect(f.writeEvent).not.toHaveBeenCalled();
    expect(f.customerNotification).not.toHaveBeenCalled();
  });
  it("Admin preflight and canonical vendor POST share one writer", () => {
    const src = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    expect(src).toContain('const internalVendorPo = pathname.match(');
    expect(src).toContain("const accepted = await acceptVendorPurchaseOrder({");
    expect(src).toContain('return acceptVendorPurchaseOrder({');
    expect(src).not.toContain('update public.mkt_purchase_orders\n              set status=\'vendor_accepted\'');
    const ui = readFileSync(join(process.cwd(), "src/pages/admin/MarketplaceOperations.tsx"), "utf8");
    expect(ui).toContain("InternalVendorPoAcceptDevForm");
  });
});
