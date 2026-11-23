import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CompanyRequestsTab } from "./pages/admin/CompanyRequestsTab";
import { requestBizPortalCompanySelfApprovalProof } from "./lib/bizportal-company-self-approval-proof";
vi.mock("./lib/bizportal-company-self-approval-proof",()=>({
  requestBizPortalCompanySelfApprovalProof:vi.fn(async()=>({
    selfApprovalChallenge:"test-portal-challenge",selfApprovalProof:"signed-bizportal-self-proof",
  })),
}));

vi.mock("@/lib/auth", () => ({
  getAuthHeaders: () => ({ "X-DEV-Test": "admin-test" }),
}));

const request = {
  id: 17,
  customerId: 30,
  customerName: "Buyer Tester",
  customerEmail: "buyer@example.invalid",
  requestedCompanyName: "PT Cahaya Sejati Teknologi",
  requestedRegistrationNumber: "DEV-CST-ONLY",
  status: "pending",
  matchedCompanyId: null,
  matchedCompanyName: null,
  reviewNote: null,
  reviewedBy: null,
  reviewedAt: null,
  createdAt: "2026-11-15T01:00:00Z",
};
const companies = [
  { id: 1, name: "PT Cahaya Sejati Teknologi", code: "CST" },
  { id: 2, name: "PT Wangsamas", code: "WGS" },
];
function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = String(input);
  if (url === "/api/portal/admin/company-requests") {
    return response({ items: [request], total: 1 });
  }
  if (url.startsWith("/api/portal/organization/companies?")) {
    return response(companies);
  }
  if (url === "/api/portal/admin/company-requests/17" && init?.method === "PATCH") {
    return response({ id: 17, status: "approved", matchedCompanyId: 1 });
  }
  throw Error("Unexpected request in test: " + url);
});

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Existing Admin company-affiliation review UI", () => {
  it("reuses the guarded Admin list and displays an unapproved company request", async () => {
    render(<CompanyRequestsTab />);
    expect(await screen.findByText("PT Cahaya Sejati Teknologi")).toBeTruthy();
    expect(screen.getByText(/Buyer Tester/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/admin/company-requests",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("requires a canonical company and explicit authority verification before approval", async () => {
    render(<CompanyRequestsTab />);
    fireEvent.click(await screen.findByRole("button", { name: "Tinjau afiliasi" }));
    await screen.findByRole("option", { name: "PT Cahaya Sejati Teknologi (CST)" });
    const approve = screen.getByRole("button", { name: "Setujui afiliasi" }) as HTMLButtonElement;
    expect(approve.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Pilih perusahaan terverifikasi"), { target: { value: "1" } });
    expect(approve.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(/Saya sudah memeriksa kewenangan customer/));
    expect(approve.disabled).toBe(false);
    fireEvent.click(approve);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/admin/company-requests/17",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ status: "approved", matchedCompanyId: 1, reviewNote: null }),
      }),
    ));
  });

  it("requests a distinct signed Super Admin proof only for the eligible applicant",async()=>{
    fetchMock.mockImplementationOnce(async()=>response({
      items:[{...request,customerId:9,canSelfApproveAsSuperAdmin:true}],total:1,
    }));
    render(<CompanyRequestsTab />);
    fireEvent.click(await screen.findByRole("button",{name:"Tinjau afiliasi"}));
    await screen.findByRole("option",{name:"PT Cahaya Sejati Teknologi (CST)"});
    const button=screen.getByRole("button",{name:"Verifikasi Super Admin & setujui"});
    fireEvent.change(screen.getByLabelText("Pilih perusahaan terverifikasi"),{target:{value:"1"}});
    fireEvent.click(screen.getByLabelText(/Saya sudah memeriksa kewenangan customer/));
    fireEvent.click(button);
    await waitFor(()=>expect(requestBizPortalCompanySelfApprovalProof).toHaveBeenCalledWith(
      17,1,{"X-DEV-Test":"admin-test"},
    ));
    await waitFor(()=>expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/admin/company-requests/17",expect.objectContaining({
        method:"PATCH",
        body:JSON.stringify({
          status:"approved",matchedCompanyId:1,reviewNote:null,
          selfApprovalChallenge:"test-portal-challenge",
          selfApprovalProof:"signed-bizportal-self-proof",
        }),
      }),
    ));
  });
  it("clears earlier approval when the canonical-company search is changed", async () => {
    render(<CompanyRequestsTab />);
    fireEvent.click(await screen.findByRole("button", { name: "Tinjau afiliasi" }));
    await screen.findByRole("option", { name: "PT Cahaya Sejati Teknologi (CST)" });
    fireEvent.change(screen.getByLabelText("Pilih perusahaan terverifikasi"), { target: { value: "1" } });
    fireEvent.click(screen.getByLabelText(/Saya sudah memeriksa kewenangan customer/));
    const approve = screen.getByRole("button", { name: "Setujui afiliasi" }) as HTMLButtonElement;
    expect(approve.disabled).toBe(false);
    fireEvent.change(screen.getByLabelText("Cari perusahaan kanonis"), { target: { value: "Wangsamas" } });
    expect(approve.disabled).toBe(true);
    expect(fetchMock.mock.calls.filter(call => String(call[0]).endsWith("/17"))).toHaveLength(0);
  });

  it("requires an explicit reason before calling existing Admin rejection API", async () => {
    render(<CompanyRequestsTab />);
    fireEvent.click(await screen.findByRole("button", { name: "Tinjau afiliasi" }));
    const reject = screen.getByRole("button", { name: "Tolak" }) as HTMLButtonElement;
    expect(reject.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Catatan Admin/), {
      target: { value: "Tidak ada bukti kewenangan untuk perusahaan ini" },
    });
    expect(reject.disabled).toBe(false);
    fireEvent.click(reject);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/portal/admin/company-requests/17",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
          matchedCompanyId: null,
          reviewNote: "Tidak ada bukti kewenangan untuk perusahaan ini",
        }),
      }),
    ));
  });

  it("shows unauthorized response instead of requesting or approving company", async () => {
    fetchMock.mockImplementationOnce(async () => response({ error: "Unauthorized" }, 401));
    render(<CompanyRequestsTab />);
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Sesi Admin tidak berwenang membaca persetujuan perusahaan.",
    );
    expect(screen.queryByRole("button", { name: "Tinjau afiliasi" })).toBeNull();
  });

  it("adds the existing review tab to desktop, mobile, and the Admin content area", () => {
    const shell = readFileSync(join(process.cwd(), "src/pages/admin.tsx"), "utf8");
    expect(shell).toContain('value: "company-requests", icon: Building2');
    expect(shell).toContain('<TabsTrigger value="company-requests"');
    expect(shell).toContain('<TabsContent value="company-requests">');
    expect(shell).toContain("<CardContent><CompanyRequestsTab /></CardContent>");
  });
});
