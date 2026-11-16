import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

vi.mock("../server/db.mjs", () => ({
  pool: { connect: vi.fn(() => { throw Error("LIVE_DATABASE_NOT_ALLOWED_IN_UNIT_TEST"); }) },
}));
import { handleDevCustomerMarketplaceQuote } from "../server/customer-marketplace-rfq.mjs";

const env = { APP_ENV: "development", CST_CORPORATE_PO_APPROVAL_GATE_DEV: "true" };
const testKey = "cst-test-idempotency-key-00000000001";
const buyer = { id: 31, role: "customer", name: "CST Customer", email: "buyer@example.invalid" };
const body = {
  qty: 2, phone: "081234567890", notes: "Real purpose supplied by customer",
  destination: "Jakarta, Indonesia", required_date: "",
  company_name: "UNTRUSTED_AFFILIATION", estimated_price: 999,
};
function params({ key = testKey, user = buyer, input = body, environment = env,
  databasePool, corporateGuard } = {}) {
  const sendJson = vi.fn();
  const response = {};
  return {
    request: { method: "POST", headers: { "idempotency-key": key } },
    response, user, itemId: 19, body: input, sendJson,
    env: environment, databasePool, corporateGuard,
  };
}

function dbState({ customerType = "company", memberships = [{ company_id: 1, company_name: "PT Cahaya Sejati Teknologi" }],
  status = "active", isPublished = true, moq = null, failAt = null } = {}) {
  let rfq = null;
  let line = null;
  const calls = [];
  const client = {
    query: vi.fn(async (raw, args = []) => {
      const sql = String(raw).replace(/\s+/g, " ").trim().toLowerCase();
      calls.push({ sql, args });
      if (failAt && sql.includes(failAt)) throw Error("SIMULATED_DB_ERROR");
      if (["begin", "commit", "rollback"].includes(sql)) return { rows: [], rowCount: 0 };
      if (sql.includes("from public.portal_customers") && sql.includes("for share")) {
        return { rows: [{ id: 31, role: "customer", account_status: status,
          customer_type: customerType, name: "Canonical CST Buyer",
          email: "canonical@example.invalid", company: "PT Cahaya Sejati Teknologi" }], rowCount: 1 };
      }
      if (sql.includes("from public.vendor_catalog_items")) {
        return isPublished
          ? { rows: [{ id: 19, name: "Published Product", vendor_id: 9,
            description: "Product description", unit: "box", moq, type: "product" }], rowCount: 1 }
          : { rows: [], rowCount: 0 };
      }
      if (sql.includes("from public.portal_company_members m")) {
        return { rows: memberships, rowCount: memberships.length };
      }
      if (sql.startsWith("select r.id,r.portal_customer_id")) {
        return rfq && line
          ? { rows: [{ id: rfq.id, portal_customer_id: rfq.customerId,
            company_id: rfq.companyId, vendor_catalog_item_id: line.itemId,
            requested_qty: line.qty, buyer_phone: rfq.buyerPhone,
            delivery_address: rfq.destination ?? "",
            notes: rfq.notes ?? "", required_date_iso: rfq.requiredDate ?? "" }], rowCount: 1 }
          : { rows: [], rowCount: 0 };
      }
      if (sql.startsWith("insert into public.mkt_rfqs")) {
        rfq = { id: 501, number: args[0], companyId: args[1], vendorId: args[2],
          buyerName: args[3], buyerEmail: args[4], buyerPhone: args[5],
          buyerCompany: args[6], customerId: args[10], buyerRole: args[11],
          requiredDate: args[7], destination: args[8], notes: args[9] };
        return { rows: [{ id: 501 }], rowCount: 1 };
      }
      if (sql.startsWith("insert into public.mkt_rfq_lines")) {
        line = { id: 701, rfqId: args[0], itemId: args[1], name: args[2], qty: args[5] };
        return { rows: [{ id: 701 }], rowCount: 1 };
      }
      throw Error("UNEXPECTED_SQL " + sql.slice(0, 85));
    }),
    release: vi.fn(),
  };
  const databasePool = { connect: vi.fn().mockResolvedValue(client) };
  return { client, calls, databasePool, state: () => ({ rfq, line }) };
}

const guardOk = vi.fn(async (_db, rfq) => {
  expect(rfq).toEqual({ portal_customer_id: 31, company_id: 1 });
  return { enabled: true, verified: true };
});

describe("DEV canonical marketplace RFQ bridge from existing product page", () => {
  it("inserts one company-bound draft RFQ and one catalog line, with canonical identity", async () => {
    const db = dbState();
    const sendJson = vi.fn();
    const input = params({ databasePool: db.databasePool, corporateGuard: guardOk });
    input.sendJson = sendJson;
    await handleDevCustomerMarketplaceQuote(input);
    const { rfq, line } = db.state();
    expect(rfq).toMatchObject({
      companyId: 1, vendorId: 9, buyerName: "Canonical CST Buyer",
      buyerCompany: "PT Cahaya Sejati Teknologi",
      buyerEmail: "canonical@example.invalid", customerId: 31,
      buyerRole: "member",
    });
    expect(line).toMatchObject({ rfqId: 501, itemId: 19, name: "Published Product", qty: 2 });
    expect(sendJson).toHaveBeenCalledWith(input.response, 201, expect.objectContaining({
      rfqId: 501, orderNumber: expect.stringMatching(/^RFQ-[0-9A-F]{24}$/),
      status: "draft", alreadyProcessed: false,
    }));
    expect(db.calls.at(-1).sql).toBe("commit");
    expect(db.client.release).toHaveBeenCalledOnce();
    expect(db.calls.some(c => c.sql.includes("portal_company_members") && c.sql.startsWith("insert"))).toBe(false);
  });

  it("preserves idempotency on retries and rejects changed quantity", async () => {
    const db = dbState();
    const options = { databasePool: db.databasePool, corporateGuard: guardOk };
    const first = params(options);
    await handleDevCustomerMarketplaceQuote(first);
    const second = params(options);
    await handleDevCustomerMarketplaceQuote(second);
    expect(second.sendJson).toHaveBeenCalledWith(second.response, 200,
      expect.objectContaining({ rfqId: 501, alreadyProcessed: true }));
    expect(db.calls.filter(c => c.sql.startsWith("insert into public.mkt_rfqs"))).toHaveLength(1);
    const modified = params({ ...options, input: { ...body, qty: 3 } });
    await expect(handleDevCustomerMarketplaceQuote(modified)).rejects.toMatchObject({ statusCode: 409 });
    expect(db.calls.at(-1).sql).toBe("rollback");
  });

  it("rejects edited contact, destination, date and notes with the same idempotency key", async () => {
    const db = dbState();
    const opts = { databasePool: db.databasePool, corporateGuard: guardOk };
    await handleDevCustomerMarketplaceQuote(params(opts));
    for (const change of [
      { phone: "081234567891" },
      { destination: "Bandung, Indonesia" },
      { notes: "Corrected delivery instructions" },
      { required_date: "2099-01-01" },
    ]) {
      const edited = params({ ...opts, input: { ...body, ...change } });
      await expect(handleDevCustomerMarketplaceQuote(edited))
        .rejects.toMatchObject({ statusCode: 409 });
      expect(edited.sendJson).not.toHaveBeenCalled();
      expect(db.calls.at(-1).sql).toBe("rollback");
    }
    expect(db.calls.filter(c => c.sql.startsWith("insert into public.mkt_rfqs"))).toHaveLength(1);
  });

  it("keeps public is_published catalog items eligible even if denormalized status is stale", async () => {
    const db = dbState();
    await handleDevCustomerMarketplaceQuote(params({
      databasePool: db.databasePool, corporateGuard: guardOk,
    }));
    const select = db.calls.find(c => c.sql.includes("from public.vendor_catalog_items"));
    expect(select).toBeDefined();
    expect(select!.sql).toContain("item.is_active=true");
    expect(select!.sql).toContain("item.is_published=true");
    expect(select!.sql).not.toContain("item.status='published'");
  });

  it("denies an individual without company as a corporate PO bypass", async () => {
    const db = dbState({ customerType: "company", memberships: [] });
    const p = params({ databasePool: db.databasePool, corporateGuard: guardOk });
    await expect(handleDevCustomerMarketplaceQuote(p)).rejects.toMatchObject({ statusCode: 409 });
    expect(db.calls.at(-1).sql).toBe("rollback");
    expect(db.calls.some(c => c.sql.startsWith("insert into public.mkt_rfqs"))).toBe(false);
  });

  it("uses the existing company-approved guard, denies unreviewed company", async () => {
    const db = dbState();
    const guard = vi.fn(async () => {
      const error = new Error("Admin approval required");
      error.statusCode = 409;
      throw error;
    });
    const p = params({ databasePool: db.databasePool, corporateGuard: guard });
    await expect(handleDevCustomerMarketplaceQuote(p)).rejects.toMatchObject({ statusCode: 409 });
    expect(guard).toHaveBeenCalledOnce();
    expect(db.calls.at(-1).sql).toBe("rollback");
  });

  it("denies unpublished product, MOQs, and invalid WhatsApp", async () => {
    const unpublished = dbState({ isPublished: false });
    await expect(handleDevCustomerMarketplaceQuote(params({
      databasePool: unpublished.databasePool, corporateGuard: guardOk,
    }))).rejects.toMatchObject({ statusCode: 404 });
    const moq = dbState({ moq: 10 });
    await expect(handleDevCustomerMarketplaceQuote(params({
      databasePool: moq.databasePool, corporateGuard: guardOk,
    }))).rejects.toMatchObject({ statusCode: 400 });
    const invalidPhone = dbState();
    await expect(handleDevCustomerMarketplaceQuote(params({
      databasePool: invalidPhone.databasePool, corporateGuard: guardOk,
      input: { ...body, phone: "wrong" },
    }))).rejects.toMatchObject({ statusCode: 400 });
    expect(invalidPhone.databasePool.connect).not.toHaveBeenCalled();
  });

  it("denies untrusted buyer and guest roles, plus PROD", async () => {
    const db = dbState();
    const guest = params({
      databasePool: db.databasePool, corporateGuard: guardOk,
      user: { id: 31, role: "admin" },
    });
    await expect(handleDevCustomerMarketplaceQuote(guest)).rejects.toMatchObject({ statusCode: 403 });
    const prod = params({
      databasePool: db.databasePool, corporateGuard: guardOk,
      environment: { APP_ENV: "production", CST_CORPORATE_PO_APPROVAL_GATE_DEV: "true" },
    });
    await expect(handleDevCustomerMarketplaceQuote(prod)).rejects.toMatchObject({ statusCode: 404 });
    expect(db.databasePool.connect).not.toHaveBeenCalled();
  });

  it("rolls back if line insertion fails, with no success response", async () => {
    const db = dbState({ failAt: "insert into public.mkt_rfq_lines" });
    const p = params({ databasePool: db.databasePool, corporateGuard: guardOk });
    await expect(handleDevCustomerMarketplaceQuote(p)).rejects.toThrow("SIMULATED_DB_ERROR");
    expect(db.calls.at(-1).sql).toBe("rollback");
    expect(p.sendJson).not.toHaveBeenCalled();
    expect(db.client.release).toHaveBeenCalledOnce();
  });

  it("requires a signed session route before invoking the handler", () => {
    const router = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const marker = 'const marketplaceQuoteMatch = pathname.match(';
    const route = router.slice(router.indexOf(marker), router.indexOf("const marketplaceItemMatch =", router.indexOf(marker)));
    expect(route).toContain('request.method === "POST"');
    expect(route).toContain('await requireUser(request, response)');
    expect(route).toContain('handleDevCustomerMarketplaceQuote');
  });
});
