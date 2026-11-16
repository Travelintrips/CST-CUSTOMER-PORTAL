import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), read: vi.fn() }));
vi.mock("../server/db.mjs", () => ({
  pool: { connect: mocks.connect }, query: mocks.read,
}));
vi.mock("../server/storage.mjs", () => ({
  deleteDocumentObject: vi.fn(), documentType: vi.fn(),
  ocrKtp: vi.fn(), signedDocumentUrl: vi.fn(), uploadDocument: vi.fn(),
}));
vi.mock("../server/freight-operations.mjs", () => ({
  createFreightActionToken: vi.fn(),
}));
vi.mock("../server/corporate-po-affiliation-gate.mjs", () => ({
  corporatePoApprovalGateDevEnabled: () => true,
  stageDevExistingCompanyApproval: vi.fn(),
}));

import { handleOrganizationMutation } from "../server/admin-portal.mjs";

type State = {
  role?: string; type?: string; accountStatus?: string;
  hasProfile?: boolean; hasKtp?: boolean; hasLegal?: boolean;
  existingPending?: boolean; existingMembership?: boolean;
  failAddressUpdate?: boolean;
};

function setup(opts: State = {}) {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  let requestName: string | null = opts.existingPending ? "Other Company" : null;
  let customerType = opts.type ?? "individual";
  let profileStatus = "active";
  let address = "";
  const client = {
    release: vi.fn(),
    query: vi.fn(async (raw: string, params: unknown[] = []) => {
      const sql = String(raw).trim().replace(/\s+/g, " ").toLowerCase();
      calls.push({ sql, params });
      if (sql === "begin" || sql === "commit" || sql === "rollback"
        || sql.includes("pg_advisory_xact_lock")) return { rows: [], rowCount: 0 };
      if (sql.startsWith("select id from public.portal_customers")) {
        return { rows: [{ id: 31 }], rowCount: 1 };
      }
      if (sql.startsWith("select id, role, account_status, customer_type")) {
        return { rows: [{ id: 31, role: opts.role ?? "customer",
          account_status: opts.accountStatus ?? "active", customer_type: customerType }], rowCount: 1 };
      }
      if (sql.includes("select id, ktp_address, ktp_pic_url")) {
        return opts.hasProfile === false ? { rows: [], rowCount: 0 } :
          { rows: [{ id: 33, ktp_address: opts.hasKtp === false ? null : "Address on valid KTP",
            ktp_pic_url: opts.hasKtp === false ? null : "customers/31/unassigned/documents/ktp.png" }], rowCount: 1 };
      }
      if (sql.includes("select d.file_url")) {
        return opts.hasLegal === false ? { rows: [], rowCount: 0 } :
          { rows: [{ file_url: "customers/31/unassigned/documents/legalitas.pdf" }], rowCount: 1 };
      }
      if (sql.includes("select id from public.portal_company_requests") &&
          sql.includes("for update")) {
        return requestName ? { rows: [{ id: 7 }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }
      if (sql.includes("select id from public.portal_company_members")) {
        return opts.existingMembership ? { rows: [{ id: 8 }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }
      if (sql.startsWith("update public.portal_customers")) {
        customerType = String(params[0]);
        return { rows: [], rowCount: 1 };
      }
      if (sql.startsWith("update public.portal_company_members")) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith("insert into public.portal_company_members")) {
        throw new Error("MUST_NOT_ACTIVATE_MEMBERSHIP");
      }
      if (sql.startsWith("insert into public.portal_company_requests")) {
        requestName = String(params[1]);
        return { rows: [{ id: 7 }], rowCount: 1 };
      }
      if (sql.startsWith("insert into public.portal_customer_profiles")) {
        profileStatus = String(params[2]);
        return { rows: [{ id: 33 }], rowCount: 1 };
      }
      if (sql.startsWith("update public.portal_customer_profiles") && sql.includes("company_address=$1")) {
        if (opts.failAddressUpdate) return { rows: [], rowCount: 0 };
        address = String(params[0]);
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("from public.portal_company_members m")) return { rows: [], rowCount: 0 };
      if (sql.includes("from public.portal_company_requests")) {
        return requestName
          ? { rows: [{ status: "pending", requested_company_name: requestName,
              requested_registration_number: "1234567890123", matched_company_id: null,
              created_at: "2026-11-16T13:00:00Z" }], rowCount: 1 }
          : { rows: [], rowCount: 0 };
      }
      throw Error("UNEXPECTED_SQL " + sql.slice(0, 100));
    }),
  };
  mocks.connect.mockResolvedValue(client);
  return { calls, client, state: () => ({ requestName, customerType, profileStatus, address }) };
}

function input(body: unknown, role = "customer") {
  return {
    request: { method: "PATCH" }, response: {},
    user: { id: 31, role },
    body,
    sendJson: vi.fn(), sendError: vi.fn(),
  };
}
const request = {
  existingCustomerCompanyApplication: true,
  customerType: "company",
  requestedCompanyName: "SKY",
  requestedRegistrationNumber: "1234567890123",
  companyAddress: "Legal office address for SKY",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("APP_ENV", "development");
  vi.stubEnv("CST_CORPORATE_PO_APPROVAL_GATE_DEV", "true");
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("DEV company application from an existing individual customer", () => {
  it("retains customer 31 and KTP while creating only a pending Admin review", async () => {
    const { calls, client, state } = setup();
    const ctx = input(request);
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).not.toHaveBeenCalled();
    expect(ctx.sendJson).toHaveBeenCalledWith(ctx.response, 200, {
      context: expect.objectContaining({ status: "company_pending",
        customerType: "company", companyId: null,
        pendingRequest: expect.objectContaining({ requestedCompanyName: "SKY" }) }),
    });
    expect(state()).toMatchObject({
      requestName: "SKY", customerType: "company", profileStatus: "pending",
      address: "Legal office address for SKY",
    });
    expect(calls.some(({ sql }) => sql.startsWith("insert into public.portal_company_members"))).toBe(false);
    expect(calls.some(({ sql }) => sql.includes("ktp_pic_url="))).toBe(false);
    expect(calls.at(-1)?.sql).toBe("commit");
    expect(client.release).toHaveBeenCalledOnce();
  });

  it("rejects missing company-owned legal document without company changes", async () => {
    const { calls } = setup({ hasLegal: false });
    const ctx = input(request);
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(calls.at(-1)?.sql).toBe("rollback");
    expect(calls.some(({ sql }) => sql.startsWith("update public.portal_customers"))).toBe(false);
  });

  it("rejects missing KTP and original address without identity recreation", async () => {
    const { calls } = setup({ hasKtp: false });
    const ctx = input(request);
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(calls.at(-1)?.sql).toBe("rollback");
  });

  it("rejects Admin and existing corporate accounts", async () => {
    const admin = setup();
    const adminCtx = input(request, "admin");
    await handleOrganizationMutation(adminCtx);
    expect(adminCtx.sendError).toHaveBeenCalledWith(adminCtx.response, 403, expect.any(String));
    expect(admin.calls.at(-1)?.sql).toBe("rollback");

    const existing = setup({ type: "company" });
    const companyCtx = input(request);
    await handleOrganizationMutation(companyCtx);
    expect(companyCtx.sendError).toHaveBeenCalledWith(companyCtx.response, 409, expect.any(String));
    expect(existing.calls.at(-1)?.sql).toBe("rollback");
  });

  it("rejects duplicate pending requests and active memberships", async () => {
    const pending = setup({ existingPending: true });
    const ctx = input(request);
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(pending.calls.at(-1)?.sql).toBe("rollback");
    const membership = setup({ existingMembership: true });
    const second = input(request);
    await handleOrganizationMutation(second);
    expect(second.sendError).toHaveBeenCalledWith(second.response, 409, expect.any(String));
    expect(membership.calls.at(-1)?.sql).toBe("rollback");
  });

  it("rejects external company IDs, incomplete registration and PROD", async () => {
    const existing = setup();
    const ctx = input({ ...request, companyId: 1 });
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 400, expect.any(String));
    expect(existing.calls.at(-1)?.sql).toBe("rollback");

    const incomplete = setup();
    const missingNib = input({ ...request, requestedRegistrationNumber: "" });
    await handleOrganizationMutation(missingNib);
    expect(missingNib.sendError).toHaveBeenCalledWith(missingNib.response, 400, expect.any(String));
    expect(incomplete.calls.at(-1)?.sql).toBe("rollback");

    vi.stubEnv("APP_ENV", "production");
    const prod = setup();
    const blocked = input(request);
    await handleOrganizationMutation(blocked);
    expect(blocked.sendError).toHaveBeenCalledWith(blocked.response, 404, expect.any(String));
    expect(prod.calls.at(-1)?.sql).toBe("rollback");
  });

  it("rolls back the entire pending request if the company address write fails", async () => {
    const { calls } = setup({ failAddressUpdate: true });
    const ctx = input(request);
    await handleOrganizationMutation(ctx);
    expect(ctx.sendError).toHaveBeenCalledWith(ctx.response, 409, expect.any(String));
    expect(calls.some(({ sql }) => sql.startsWith("insert into public.portal_company_requests"))).toBe(true);
    expect(calls.at(-1)?.sql).toBe("rollback");
    expect(ctx.sendJson).not.toHaveBeenCalled();
  });
});
