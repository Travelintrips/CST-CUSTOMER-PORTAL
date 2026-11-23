// @ts-nocheck — isolated real handler with mocked DB and notifications.
// No network, customer credentials, or active financial mutation.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  row: null,
  sql: [],
  connect: vi.fn(),
  globalQuery: vi.fn(),
  scopedOpen: vi.fn(),
  release: vi.fn(),
  end: vi.fn(),
  notifyAdmins: vi.fn(),
  notifyPortalCustomers: vi.fn(),
  sendJson: vi.fn(),
  sendError: vi.fn(),
  verification: vi.fn(),
}));
vi.mock("../server/db.mjs", () => ({
  pool: { connect: m.connect },
  query: m.globalQuery,
}));
vi.mock("../server/dev-customer-invoice-scoped-client.mjs", () => ({
  openDevCompanyInvoiceWriter: m.scopedOpen,
}));
vi.mock("../server/storage.mjs", () => ({ signedPaymentProofUrl: vi.fn() }));
vi.mock("../server/notification-service.mjs", () => ({
  bestEffortNotificationWrite: vi.fn(async (_q, work) => work()),
  notifyAdmins: m.notifyAdmins,
  notifyPortalCustomers: m.notifyPortalCustomers,
}));
import { handleAdminInvoices, handleAutomaticInvoiceRun } from "../server/billing-operations.mjs";

const original = Object.fromEntries(
  ["APP_ENV", "NODE_ENV", "CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
   "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
   "CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV",
   "CUSTOMER_PORTAL_AUTO_INVOICE_DEV",
   "CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV"].map(k => [k, process.env[k]])
);
const qa108 = () => ({
  id: 108, company_id: 1, customer_id: 33,
  doc_number: "QA-CST-DEV-OWNER-20261120-001",
  status: "confirmed", invoice_status: "to_invoice",
  grand_total: "111.00", total_amount: "100.00",
  tax_amount: "11.00", amount_paid: "0", payment_status: "unpaid",
  invoice_number: null, invoice_date: null, due_date: null,
  customer_name: "INTERNAL QA CST DEV — NO REAL CUSTOMER",
});
const sqlMock = async (statement) => {
  const q = String(statement).toLowerCase().trim();
  m.sql.push(q);
  if (q === "begin" || q === "rollback" || q === "commit") return { rows: [] };
  if (q.startsWith("select") && q.includes("from public.sales_documents") && q.includes("for update"))
    return { rows: [m.row] };
  if (q.startsWith("update") || q.startsWith("insert") || q.startsWith("delete"))
    throw Error("MOCK_FINANCIAL_MUTATION_ATTEMPT");
  throw Error("MOCK_UNEXPECTED_SQL");
};
const call = (invoiceId = 108, action = "mark_invoiced") => handleAdminInvoices({
  request: { method: "POST", body: { action } },
  response: {},
  user: { id: 501, role: "admin", email: "qa-owner@example.invalid", name: "QA Owner" },
  sendJson: m.sendJson, sendError: m.sendError, invoiceId,
  postSalesInvoiceWithClient: vi.fn(),
  verifySignedBizPortalProof: m.verification,
});
const assertNoWrites = () => {
  expect(m.sql[0]).toBe("begin");
  expect(m.sql).toContain("rollback");
  expect(m.sql).not.toContain("commit");
  expect(m.sql.filter(q => q.startsWith("update") || q.startsWith("insert") || q.startsWith("delete"))).toEqual([]);
  expect(m.notifyAdmins).not.toHaveBeenCalled();
  expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
  expect(m.sendJson).not.toHaveBeenCalled();
  expect(m.release).toHaveBeenCalledTimes(1);
};

beforeEach(() => {
  vi.clearAllMocks();
  m.sql.length = 0;
  m.row = qa108();
  m.connect.mockResolvedValue({ query: sqlMock, release: m.release });
  m.scopedOpen.mockResolvedValue({ client: {query:sqlMock,end:m.end}, companyId: 1 });
  m.globalQuery.mockResolvedValue({rows:[{company_id:1}]});
  process.env.APP_ENV = "development";
  process.env.NODE_ENV = "development";
  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "false";
  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "false";
  process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV = "false";
  process.env.CUSTOMER_PORTAL_AUTO_INVOICE_DEV = "false";
  process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV = "false";
});
afterEach(() => {
  for (const [k, v] of Object.entries(original)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("Actual DEV Portal handler rejects only the synthetic QA108 legacy Invoice route", () => {
  it("503 financial safeguard: signed Portal Admin cannot issue QA108 with flags OFF", async () => {
    await expect(call()).rejects.toMatchObject({ statusCode: 503 });
    assertNoWrites();
    expect(m.scopedOpen).not.toHaveBeenCalled();
  });
  it("fails closed on replay when QA108 is already marked invoiced", async () => {
    m.row.invoice_status = "invoiced";
    m.row.invoice_number = "INV-FORBIDDEN-SYNTHETIC";
    await expect(call()).rejects.toMatchObject({ statusCode: 503 });
    assertNoWrites();
  });
  it.each([
    ["atomic OFF", "false", "true", "true"],
    ["posted AR OFF", "true", "false", "true"],
    ["Super Admin attestation OFF", "true", "true", "false"],
  ])("QA108 remains blocked when %s", async (_name, atomic, ar, attest) => {
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = atomic;
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = ar;
    process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV = attest;
    await expect(call()).rejects.toMatchObject({statusCode:503});
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.sql.some(q=>q.startsWith("update")||q.startsWith("insert"))).toBe(false);
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
    expect(m.verification).not.toHaveBeenCalled();
  });
  it("automatic run stops read-only when the CST AR source actor is OFF", async () => {
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV = "false";
    process.env.CUSTOMER_PORTAL_AUTO_INVOICE_DEV = "true";
    process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV = "true";
    m.globalQuery.mockImplementation(async (statement) => {
      const q=String(statement).toLowerCase();
      if (q.includes("from public.users")) return { rows: [{
        id:"canonical-super-admin",role:"super_admin",system_role:"super_admin",
        status:"active",is_active:true,company_id:null,
      }] };
      if (q.includes("from public.bizportal_customer_ar_source_actors_dev")) {
        return { rows: [{ enabled:false }] };
      }
      throw Error("UNEXPECTED_READ_QUERY");
    });
    const sendJson=vi.fn();
    await handleAutomaticInvoiceRun({
      request:{method:"POST",body:{}},
      response:{},
      user:{id:501,role:"admin",email:"qa-owner@example.invalid",authMethod:"email_otp"},
      sendJson,
      sendError:m.sendError,
      postSalesInvoiceWithClient:vi.fn(),
    });
    expect(sendJson).toHaveBeenCalledWith({},200,expect.objectContaining({
      enabled:true,companyId:1,scanned:0,invoiced:0,blocked:true,
      results:[expect.objectContaining({invoiceId:108,status:"blocked"})],
    }));
    expect(m.globalQuery).toHaveBeenCalledTimes(2);
    expect(m.scopedOpen).not.toHaveBeenCalled();
    expect(m.sql).toEqual([]);
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
  });

  it("automatic mode skips per-invoice BizPortal proof but still fails closed on the scoped RLS writer guard", async () => {
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV = "false";
    process.env.CUSTOMER_PORTAL_AUTO_INVOICE_DEV = "true";
    process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV = "true";
    await expect(call(108, "auto_issue")).rejects.toThrow("Identitas database Invoice DEV belum memiliki isolasi perusahaan.");
    expect(m.scopedOpen).toHaveBeenCalledTimes(1);
    expect(m.verification).not.toHaveBeenCalled();
    expect(m.sql).toContain("begin");
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.sql.some(q => q.startsWith("update") || q.startsWith("insert") || q.startsWith("delete"))).toBe(false);
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
    expect(m.end).toHaveBeenCalledTimes(1);
  });

  it("automatic mode is blocked when the signed source snapshot guard is OFF", async () => {
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
    process.env.CUSTOMER_PORTAL_AUTO_INVOICE_DEV = "true";
    process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV = "false";
    await expect(call(108, "auto_issue")).rejects.toMatchObject({ statusCode: 503 });
    expect(m.scopedOpen).not.toHaveBeenCalled();
    expect(m.sql).toEqual([]);
    expect(m.verification).not.toHaveBeenCalled();
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
  });

  it("all three flags ON routes QA108 into real scoped-writer RLS proof, not a permanent QA deny", async () => {
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
    process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV = "true";
    // A deliberately missing RLS attestation fails the actual handler.
    // This test does NOT fake a signed approval or issue any invoice.
    await expect(call()).rejects.toMatchObject({statusCode:503});
    expect(m.scopedOpen).toHaveBeenCalledTimes(1);
    expect(m.sql.some(q=>q.includes("row_security_active("))).toBe(true);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.sql.some(q=>q.startsWith("update")||q.startsWith("insert"))).toBe(false);
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
    expect(m.verification).not.toHaveBeenCalled();
    expect(m.end).toHaveBeenCalledTimes(1);
  });
  it("rejects any other new DEV invoice when posted-AR proof is OFF", async () => {
    m.row = {...qa108(), id: 109, doc_number: "OTHER-TEST-ORDER"};
    await expect(call(109)).rejects.toMatchObject({statusCode:503});
    assertNoWrites();
  });
  it("lets a different document reach the EXISTING AR proof path only when enabled", async () => {
    m.row = {...qa108(), id: 109, doc_number: "OTHER-TEST-ORDER"};
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
    await expect(call(109)).rejects.toThrow("MOCK_FINANCIAL_MUTATION_ATTEMPT");
    expect(m.sql.some(q => q.startsWith("update public.sales_documents"))).toBe(true);
    expect(m.sql).toContain("rollback");
    expect(m.sql).not.toContain("commit");
    expect(m.notifyAdmins).not.toHaveBeenCalled();
    expect(m.notifyPortalCustomers).not.toHaveBeenCalled();
  });
});
