import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  read: vi.fn(),
}));
vi.mock("../server/db.mjs", () => ({
  pool: { connect: mocks.connect },
  query: mocks.read,
}));
vi.mock("../server/storage.mjs", () => ({
  deleteDocumentObject: vi.fn(),
  documentType: vi.fn(),
  ocrKtp: vi.fn(),
  signedDocumentUrl: vi.fn(),
  uploadDocument: vi.fn(),
}));
vi.mock("../server/freight-operations.mjs", () => ({
  createFreightActionToken: vi.fn(),
}));
import { handleAdminCompanyRequests } from "../server/admin-portal.mjs";

type DbState = {
  requestStatus?: "pending" | "in_review" | "approved" | "rejected" | null;
  companyActive?: boolean;
  failStep?: string;
  profileCount?: number;
  changedCount?: number;
  applicantId?: number;
};
type DbCall = { sql: string; args: unknown[] };

function setup(state: DbState = {}) {
  const history: DbCall[] = [];
  const client = {
    release: vi.fn(),
    query: vi.fn(async (raw: string, args: unknown[] = []) => {
      const sql = String(raw).trim().replace(/\s+/g, " ").toLowerCase();
      history.push({ sql, args });
      if (state.failStep && sql.includes(state.failStep)) throw Error("SIMULATED_DB_ERROR");
      if (sql === "begin" || sql === "commit" || sql === "rollback") return { rows: [], rowCount: 0 };
      if (sql.includes("from public.portal_company_requests") && sql.includes("for update")) {
        if (state.requestStatus === null) return { rows: [], rowCount: 0 };
        return { rows: [{ id: 17, portal_customer_id: state.applicantId ?? 30, status: state.requestStatus ?? "pending" }], rowCount: 1 };
      }
      if (sql.includes("from public.companies")) {
        return state.companyActive === false
          ? { rows: [], rowCount: 0 }
          : { rows: [{ id: 1, name: "PT Cahaya Sejati Teknologi" }], rowCount: 1 };
      }
      if (sql.startsWith("update public.portal_company_requests")) {
        return { rows: state.changedCount === 0 ? [] : [{ id: 17 }], rowCount: state.changedCount ?? 1 };
      }
      if (sql.startsWith("update public.portal_customer_profiles")) {
        return { rows: [], rowCount: state.profileCount ?? 1 };
      }
      return { rows: [], rowCount: 1 };
    }),
  };
  mocks.connect.mockResolvedValue(client);
  return { history, client };
}

const input = (body: unknown) => ({
  request: { method: "PATCH" },
  response: {},
  url: new URL("http://127.0.0.1/api/portal/admin/company-requests/17"),
  body,
  user: { id: 9, role: "admin", email: "reviewer@example.invalid" },
  sendJson: vi.fn(),
  sendError: vi.fn(),
});
const approvedBody = { status: "approved", matchedCompanyId: 1, reviewNote: "Verified authority" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("APP_ENV", "development");
  vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV", "true");
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("existing Admin review endpoint atomically updates company request and membership", () => {
  it("commits approved request, membership and profiles together on one client", async () => {
    const { history, client } = setup();
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).not.toHaveBeenCalled();
    expect(ctx.sendJson).toHaveBeenCalledWith(ctx.response, 200, {
      id: 17, status: "approved", matchedCompanyId: 1,
    });
    expect(history[0].sql).toBe("begin");
    expect(history.at(-1)?.sql).toBe("commit");
    const statements = history.map(entry => entry.sql);
    const request = statements.findIndex(sql => sql.startsWith("update public.portal_company_requests"));
    const member = statements.findIndex(sql => sql.startsWith("insert into public.portal_company_members"));
    const profile = statements.findIndex(sql => sql.startsWith("update public.portal_customer_profiles"));
    expect(request).toBeGreaterThan(0);
    expect(member).toBeGreaterThan(request);
    expect(profile).toBeGreaterThan(member);
    expect(statements[1]).toContain("for update");
    const updated = history[request];
    expect(updated.args).toEqual(["approved", 1, "Verified authority", 9, 17]);
    expect(history[member].sql).toContain("on conflict (portal_customer_id, company_id)");
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("refuses self-approval while DEV Invoice finance gate is enabled", async () => {
    vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV","false");
    vi.stubEnv("CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV","true");
    vi.stubEnv("CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV","true");
    const { history, client } = setup({ applicantId: 9 });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response,403,expect.any(String));
    expect(history.map(entry=>entry.sql)).toEqual([
      "begin",expect.stringContaining("for update"),"rollback",
    ]);
    expect(client.release).toHaveBeenCalledOnce();
    expect(history.some(entry=>entry.sql.startsWith("insert into"))).toBe(false);
  });
  it("allows independent Admin approval using existing flow when invoice flag is ON", async () => {
    vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV","false");
    vi.stubEnv("CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV","true");
    vi.stubEnv("CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV","true");
    const { history } = setup({ applicantId: 30 });
    const ctx=input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).not.toHaveBeenCalled();
    expect(history.some(entry=>entry.sql.startsWith("insert into public.portal_company_members"))).toBe(true);
    expect(history.at(-1)?.sql).toBe("commit");
  });
  it("requires a canonical company on invoice-only finance approval", async()=>{
    vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV","false");
    vi.stubEnv("CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV","true");
    vi.stubEnv("CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV","true");
    setup();
    const ctx=input({status:"approved",matchedCompanyId:null});
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response,400,expect.any(String));
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("does not approve or reassign an already decided request", async () => {
    const { history, client } = setup({ requestStatus: "approved" });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(history.map(entry => entry.sql)).toEqual([
      "begin",
      expect.stringContaining("for update"),
      "rollback",
    ]);
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("does not accept a nonexistent company ID, including nonpositive input", async () => {
    const { history } = setup({ companyActive: false });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 404, expect.any(String));
    expect(history.at(-1)?.sql).toBe("rollback");
    expect(history.some(entry => entry.sql.startsWith("insert into"))).toBe(false);

    const ctxInvalid = input({ status: "approved", matchedCompanyId: -4 });
    await handleAdminCompanyRequests(ctxInvalid);
    expect(ctxInvalid.sendError).toHaveBeenCalledWith(ctxInvalid.response, 400, expect.any(String));
    expect(mocks.connect).toHaveBeenCalledOnce();
  });

  it("rolls back the approval when membership persistence raises a database error", async () => {
    const { history, client } = setup({ failStep: "insert into public.portal_company_members" });
    const ctx = input(approvedBody);
    await expect(handleAdminCompanyRequests(ctx)).rejects.toThrow("SIMULATED_DB_ERROR");
    expect(history.at(-1)?.sql).toBe("rollback");
    expect(history.some(entry => entry.sql === "commit")).toBe(false);
    expect(ctx.sendJson).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("fails closed and rolls back when an active corporate PO gate has no customer profile", async () => {
    const { history } = setup({ profileCount: 0 });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(history.at(-1)?.sql).toBe("rollback");
    expect(history.some(entry => entry.sql === "commit")).toBe(false);
  });

  it("does not break existing corporate review behavior when the DEV gate is OFF", async () => {
    vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV", "false");
    const { history } = setup({ profileCount: 0 });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendJson).toHaveBeenCalledWith(ctx.response, 200, expect.any(Object));
    expect(history.at(-1)?.sql).toBe("commit");
  });

  it("rejects a lost update rather than claiming success on a concurrent decision", async () => {
    const { history } = setup({ changedCount: 0 });
    const ctx = input(approvedBody);
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(history.at(-1)?.sql).toBe("rollback");
    expect(history.some(entry => entry.sql === "commit")).toBe(false);
  });

  it("commits rejection without creating membership", async () => {
    const { history } = setup({ requestStatus: "in_review" });
    const ctx = input({ status: "rejected", matchedCompanyId: null, reviewNote: "Missing authority" });
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendJson).toHaveBeenCalledWith(ctx.response, 200, {
      id: 17, status: "rejected", matchedCompanyId: null,
    });
    expect(history.at(-1)?.sql).toBe("commit");
    expect(history.some(entry => entry.sql.startsWith("insert into public.portal_company_members"))).toBe(false);
    expect(history.some(entry => entry.sql.startsWith("update public.portal_customer_profiles"))).toBe(true);
  });

  it("requires a company when the DEV corporate affiliation gate is enabled", async () => {
    setup();
    const ctx = input({ status: "approved", matchedCompanyId: null });
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 400, expect.any(String));
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("preserves the existing read-only GET route using the shared query method", async () => {
    mocks.read.mockResolvedValueOnce({ rows: [{
      id: 17, portal_customer_id: 30, customer_name: "Buyer",
      customer_email: "buyer@example.invalid",
      requested_company_name: "CST", status: "pending",
    }] });
    const ctx = {
      ...input(null),
      request: { method: "GET" },
      url: new URL("http://127.0.0.1/api/portal/admin/company-requests"),
    };
    await handleAdminCompanyRequests(ctx);
    expect(ctx.sendJson).toHaveBeenCalledWith(ctx.response, 200,
      expect.objectContaining({ total: 1 }));
    expect(mocks.connect).not.toHaveBeenCalled();
  });
});
