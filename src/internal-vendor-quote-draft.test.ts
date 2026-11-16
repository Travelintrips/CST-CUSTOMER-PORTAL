import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadInternalVendorQuoteDraft } from "../server/internal-vendor-quote-draft.mjs";

const env = {
  APP_ENV: "development",
  NODE_ENV: "test",
  CST_INTERNAL_VENDOR_QUOTE_DEV: "true",
  CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV: "1",
};
const admin = {
  id: 19, role: "admin", account_status: "active",
  email: "admin@example.invalid", auth_version: 3,
};
const row = {
  id: 18, rfq_id: 23, vendor_id: 24, status: "invited",
  valid_until: "2099-01-01", company_id: 1, rfq_status: "quoting",
  approval_status: "approved", portal_customer_id: 31,
  supplier_name: "Synthetic internal supplier", supplier_company_id: 1,
  is_active: true, is_internal_vendor: true,
};
const buyer = { id: 31, role: "customer", customer_type: "company", account_status: "active" };
function fixture(overrides: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const db = async (sql: string) => {
    calls.push(sql);
    if (sql.includes("auth_version from public.portal_customers")) {
      return { rows: [{ ...admin, ...(overrides.actor as object ?? {}) }] };
    }
    if (sql.includes("from public.mkt_vendor_quotes q")) {
      return { rows: [{ ...row, ...(overrides.row as object ?? {}) }] };
    }
    if (sql.includes("customer_type,account_status from public.portal_customers")) {
      return { rows: [{ ...buyer, ...(overrides.buyer as object ?? {}) }] };
    }
    if (sql.includes("from public.portal_company_members m")) {
      return { rows: overrides.membership === false ? [] : [{ company_id: 1 }] };
    }
    if (sql.includes("from public.mkt_rfq_lines")) {
      return { rows: [{ id: 99, item_name: "Test item", item_unit: "pcs", requested_qty: 2 }] };
    }
    throw Error("Unknown query: " + sql.slice(0, 60));
  };
  return { calls, db };
}
function run(overrides: Record<string, unknown> = {}) {
  const f = fixture(overrides);
  const promise = loadInternalVendorQuoteDraft({
    db: f.db, admin: { ...admin, ...(overrides.admin as object ?? {}) },
    env: { ...env, ...(overrides.env as object ?? {}) },
    rfqId: 23, quoteId: 18,
    now: new Date("2026-11-17T00:00:00Z"),
  });
  return { ...f, promise };
}
describe("DEV-only Admin internal quotation read-only preflight", () => {
  it("returns RFQ lines with no price defaults, tokens or contacts", async () => {
    const f = run();
    const result = await f.promise;
    expect(result).toMatchObject({
      rfqId: 23, quoteId: 18,
      lines: [{ rfqLineId: 99, itemName: "Test item", requestedQty: 2 }],
    });
    expect(JSON.stringify(result)).not.toMatch(/token|phone|email|offeredUnitPrice/i);
    expect(f.calls.every(x => x.trim().toLowerCase().startsWith("select"))).toBe(true);
  });
  it("fails closed with flag off and in production before any DB access", async () => {
    for (const e of [
      { CST_INTERNAL_VENDOR_QUOTE_DEV: "false" },
      { APP_ENV: "production" },
      { NODE_ENV: "production" },
    ]) {
      const f = run({ env: e });
      await expect(f.promise).rejects.toMatchObject({ statusCode: 404 });
      expect(f.calls).toHaveLength(0);
    }
  });
  it("enforces signed admin identity, auth-version and role", async () => {
    for (const opts of [
      { admin: { role: "customer" } },
      { actor: { auth_version: 9 } },
      { actor: { account_status: "disabled" } },
      { actor: { email: "someoneelse@example.invalid" } },
    ]) await expect(run(opts).promise).rejects.toMatchObject({ statusCode: 403 });
  });
  it("blocks external, inactive and wrong-company suppliers", async () => {
    for (const record of [
      { is_internal_vendor: false },
      { is_active: false },
      { supplier_company_id: 3 },
      { company_id: 3 },
    ]) await expect(run({ row: record }).promise).rejects.toMatchObject({ statusCode: 404 });
  });
  it("blocks unapproved buyer, expired invitations and completed quotes", async () => {
    await expect(run({ membership: false }).promise).rejects.toMatchObject({ statusCode: 409 });
    await expect(run({ row: { valid_until: "2020-01-01" } }).promise).rejects.toMatchObject({ statusCode: 410 });
    await expect(run({ row: { status: "submitted" } }).promise).rejects.toMatchObject({ statusCode: 409 });
  });
  it("shares only the existing POST canonical writer and shows no auto-created prices", () => {
    const route = readFileSync(resolve(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const ui = readFileSync(resolve(process.cwd(), "src/components/admin/InternalVendorQuoteDevForm.tsx"), "utf8");
    expect(route).toContain("loadInternalVendorQuoteDraft");
    expect(route).toContain("submitInternalVendorQuote");
    expect(ui).toContain("intent: \"submit_internal_vendor_quote\"");
    expect(ui).toContain('offeredUnitPrice: ""');
    expect(ui).toContain("getAuthHeaders()");
    expect(ui).not.toContain("vendorToken");
    expect(ui).not.toContain("whatsapp");
  });
});
