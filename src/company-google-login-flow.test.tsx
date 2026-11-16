// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const auth = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  logout: vi.fn(),
  profile: vi.fn(),
  persistCookie: vi.fn(),
  saveTrustedDevice: vi.fn(),
  loadTrustedDevice: vi.fn(),
  clearTrustedDevice: vi.fn(),
  clearTrustedDeviceAsync: vi.fn(),
}));
const nav = vi.hoisted(() => ({ go: vi.fn() }));
const gis = vi.hoisted(() => ({ initialize: vi.fn(), renderButton: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  fetchPortalAuthBootstrap: auth.bootstrap,
  logout: auth.logout,
  setPortalProfile: auth.profile,
  persistAuthCookie: auth.persistCookie,
  saveTrustedDevice: auth.saveTrustedDevice,
  loadTrustedDevice: auth.loadTrustedDevice,
  clearTrustedDevice: auth.clearTrustedDevice,
  REMEMBER_DAYS: 30,
}));
vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({ t: (_key: string, fallback?: string) => fallback || _key }),
}));
vi.mock("@/lib/staticAssets", () => ({
  CUSTOMER_ASSETS: { warehouse: "/warehouse.png", logo: "/logo.png" },
}));
vi.mock("wouter", async () => {
  return {
    Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
      React.createElement("a", { href }, children),
    useLocation: () => ["/login", nav.go],
  };
});

import Login from "./pages/login";

const account = (role: string, customerType: string | null, allowedDestination: string) => ({
  authenticated: true as const,
  role,
  customerType,
  user: { id: 10, role, customerType, name: "Existing User", email: "existing@example.test", company: null, phone: null },
  onboardingComplete: true,
  onboardingStatus: "active",
  allowedDestination,
  customerContext: { status: "company_unresolved", company: null, companyId: null, activeMemberships: [], pendingRequest: null },
  profileCompletion: { ktpAddress: null, companyAddress: null, hasKtpAddress: false, hasCompanyAddress: false, needsCustomerType: false },
  vendorApprovalStatus: null, vendorExisting: false, customerExisting: true,
  safeReturnTo: null,
});

const search = "/login?returnTo=%2Fonboarding&portal=1&role=customer&customerType=company&company=OT+SKY";

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", search);
  const script = document.createElement("script");
  script.id = "google-identity-services";
  document.head.appendChild(script);
  (window as any).google = { accounts: { id: {
    initialize: gis.initialize,
    renderButton: gis.renderButton.mockImplementation((el: Element) => {
      el.textContent = "GOOGLE_READY";
    }),
  } } };
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).includes("auth/capabilities")) {
      return { ok: true, json: async () => ({
        google: true, googleClientId: "configured-gis-client",
        emailOtp: false, whatsapp: false, password: true,
      }) };
    }
    throw new Error("UNEXPECTED_NETWORK_REQUEST");
  }));
  auth.logout.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  document.getElementById("google-identity-services")?.remove();
  delete (window as any).google;
  vi.unstubAllGlobals();
});

describe("DEV customer-company Google registration login boundary", () => {
  it("renders the EXISTING GIS button after anonymous session resolution", async () => {
    auth.bootstrap.mockResolvedValue(null);
    render(<Login />);
    expect(await screen.findByText("GOOGLE_READY")).toBeTruthy();
    expect(screen.getByText(/Pendaftaran Customer Perusahaan: OT SKY/)).toBeTruthy();
    expect(gis.renderButton).toHaveBeenCalledOnce();
    expect(nav.go).not.toHaveBeenCalled();
  });

  it("never silently redirects an existing Admin session to the Admin home", async () => {
    auth.bootstrap.mockResolvedValue(account("admin", null, "/admin"));
    render(<Login />);
    expect(await screen.findByText(/Browser masih masuk sebagai akun Admin/)).toBeTruthy();
    expect(screen.getByText("Keluar dan pilih akun Google customer")).toBeTruthy();
    expect(gis.renderButton).not.toHaveBeenCalled();
    expect(nav.go).not.toHaveBeenCalled();
  });

  it("never silently promotes an existing personal customer to a corporate account", async () => {
    auth.bootstrap.mockResolvedValue(account("customer", "individual", "/dashboard"));
    render(<Login />);
    expect(await screen.findByText(/Customer Perorangan/)).toBeTruthy();
    expect(gis.renderButton).not.toHaveBeenCalled();
    expect(nav.go).not.toHaveBeenCalled();
  });

  it("requires an explicit logout before the Google selector becomes available", async () => {
    auth.bootstrap.mockResolvedValueOnce(account("admin", null, "/admin")).mockResolvedValueOnce(null);
    render(<Login />);
    fireEvent.click(await screen.findByText("Keluar dan pilih akun Google customer"));
    await waitFor(() => expect(auth.logout).toHaveBeenCalledOnce());
    expect(await screen.findByText("GOOGLE_READY")).toBeTruthy();
    expect(screen.getByText(/Pendaftaran Customer Perusahaan: OT SKY/)).toBeTruthy();
  });
});
