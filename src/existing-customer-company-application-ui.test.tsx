// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExistingCustomerCompanyApplication } from "./components/ExistingCustomerCompanyApplication";

const responses = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
});

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/company-profile?company=SKY");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("existing Google customer -> company application UX", () => {
  it("reuses stored KTP, uploads only legalitas and creates a pending request by an explicit click", async () => {
    const requestLog: Array<{ url: string; method: string; body?: unknown }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      requestLog.push({ url, method, body: init?.body });
      if (url === "/api/portal/organization" && method === "GET") {
        return responses({ status: "individual" });
      }
      if (url === "/api/portal/onboarding/upload-doc" && method === "POST") {
        const form = init?.body as FormData;
        expect(form.get("docType")).toBe("legalitas");
        expect(form.get("file")).toBeInstanceOf(File);
        return responses({ storagePath: "customers/31/unassigned/documents/legalitas.pdf" });
      }
      if (url === "/api/portal/organization" && method === "PATCH") {
        const application = JSON.parse(String(init?.body));
        expect(application).toMatchObject({
          existingCustomerCompanyApplication: true,
          requestedCompanyName: "SKY",
          requestedRegistrationNumber: "1234567890123",
          companyAddress: "Registered office address in Indonesia",
        });
        expect(application).not.toHaveProperty("ktpUrl");
        expect(application).not.toHaveProperty("companyId");
        expect(application).not.toHaveProperty("legalDocumentPath");
        return responses({
          context: {
            status: "company_pending",
            pendingRequest: { requestedCompanyName: "SKY", status: "pending" },
          },
        });
      }
      throw Error("UNEXPECTED_REQUEST " + method + " " + url);
    }));
    render(<ExistingCustomerCompanyApplication role="customer" customerType="individual" />);
    expect(await screen.findByLabelText("Nama perusahaan yang sah")).toBeTruthy();
    expect((screen.getByLabelText("Nama perusahaan yang sah") as HTMLInputElement).value).toBe("SKY");
    fireEvent.change(screen.getByLabelText("NIB atau NPWP perusahaan"), { target: { value: "1234567890123" } });
    fireEvent.change(screen.getByLabelText("Alamat perusahaan"), {
      target: { value: "Registered office address in Indonesia" },
    });
    const file = new File(["legal proof"], "legalitas.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Dokumen legalitas perusahaan"), { target: { files: [file] } });
    const submit = screen.getByRole("button", { name: "Ajukan perusahaan untuk persetujuan Admin" });
    fireEvent.submit(submit.closest("form")!);
    expect(await screen.findByText("Pengajuan perusahaan menunggu persetujuan")).toBeTruthy();
    expect(requestLog.filter((call) => call.method === "POST")).toHaveLength(1);
    expect(requestLog.filter((call) => call.method === "PATCH")).toHaveLength(1);
    expect(requestLog.some((call) => call.url.includes("ktp"))).toBe(false);
  });

  it("does not expose application for Admin or approved company customers", async () => {
    const get = vi.fn();
    vi.stubGlobal("fetch", get);
    const { rerender } = render(<ExistingCustomerCompanyApplication role="admin" customerType="individual" />);
    expect(screen.queryByText("Ajukan Customer Perusahaan dari akun ini")).toBeNull();
    rerender(<ExistingCustomerCompanyApplication role="vendor" customerType="individual" />);
    expect(screen.queryByText("Ajukan Customer Perusahaan dari akun ini")).toBeNull();
    await waitFor(() => expect(get).not.toHaveBeenCalled());
  });

  it("shows pending status without another application form", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => responses({
      status: "company_pending",
      pendingRequest: { requestedCompanyName: "SKY", status: "pending" },
    })));
    render(<ExistingCustomerCompanyApplication role="customer" customerType="company" />);
    expect(await screen.findByText("Pengajuan perusahaan menunggu persetujuan")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Ajukan perusahaan untuk persetujuan Admin" })).toBeNull();
  });
});
