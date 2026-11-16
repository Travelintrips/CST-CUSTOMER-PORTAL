import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("customer company onboarding contract", () => {
  const onboarding = readFileSync(join(process.cwd(), "src/pages/onboarding.tsx"), "utf8");
  const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
  const languageContext = readFileSync(join(process.cwd(), "src/i18n/LanguageContext.tsx"), "utf8");

  it("clearly separates existing-company membership from new-company registration", () => {
    expect(onboarding).toContain("Pilih membership yang tersedia");
    expect(onboarding).toContain("Ajukan membership / afiliasi baru");
    expect(onboarding).toContain("Data perusahaan yang sedang mendaftar");
    expect(onboarding).toContain("!requestedRegistrationNumber.trim()");
    expect(onboarding).not.toContain(">Perusahaan saya belum terdaftar<");
  });

  it("does not rewrite the new-company CTA to a generic unavailable label", () => {
    expect(languageContext).not.toContain('"Perusahaan saya belum terdaftar": "dashboard.notProvided"');
  });

  it("does not show account-role choices again after registration already fixed the role", () => {
    expect(onboarding).toContain('if (registeredRole === "vendor")');
    expect(onboarding).toContain('if (registeredRole === "customer" && customerType === "company")');
    expect(onboarding).toContain('if (registeredRole === "customer" && customerType === "individual")');
    expect(onboarding).toContain("{!registeredRole && (");
    expect(onboarding).toContain('ACCOUNT_TYPES.filter((item) => ["customer", "vendor"].includes(item.value))');
    expect(onboarding).not.toContain("Driver dan Karyawan bukan pilihan registrasi Customer");
  });


  it("localizes the registration and company onboarding flow through LanguageContext", () => {
    expect(onboarding).toContain('t("onboarding.registration.companyDataTitle"');
    expect(onboarding).toContain('t("onboarding.registration.newCompany"');
    expect(onboarding).toContain('t("onboarding.registration.searchExisting"');
    expect(onboarding).toContain('t("onboarding.registration.ktpUploadRequired"');
    expect(onboarding).toContain('t("onboarding.registration.vendorLegality"');
    expect(onboarding).toContain('t("onboarding.registration.reviewNewPending"');
  });


  it("keeps customer company identity separate from canonical membership", () => {
    expect(adminPortal).toContain("const identityCompanyName");
    expect(adminPortal).toContain("Existing-company membership must leave");
    expect(adminPortal).toContain("when $1 = 'individual' then null");
    expect(adminPortal).toContain("else coalesce(excluded.company_name, portal_customer_profiles.company_name)");
    expect(adminPortal).not.toContain("company?.name ?? (requestedCompanyName || null)");
  });


  it("preserves registered company identity and requires separate company and KTP addresses", () => {
    expect(onboarding).toContain("Identitas perusahaan customer");
    expect(onboarding).toContain("Nama perusahaan mengikuti data saat mendaftar");
    expect(onboarding).toContain("Alamat perusahaan");
    expect(onboarding).toContain("Alamat sesuai KTP");
    expect(onboarding).toContain("companyAddress.trim()");
    expect(adminPortal).toContain("Nama perusahaan customer harus berasal dari data registrasi.");
    expect(adminPortal).toContain("Alamat perusahaan wajib diisi minimal 10 karakter.");
    expect(adminPortal).toContain("ktp_address");
  });


  it("routes Google corporate registration through the configured GIS login, preserving onboarding intent", () => {
    const register = readFileSync(join(process.cwd(), "src/pages/register.tsx"), "utf8");
    const login = readFileSync(join(process.cwd(), "src/pages/login.tsx"), "utf8");
    const provider = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");

    expect(register).toContain('returnTo: "/onboarding"');
    expect(register).toContain('if (role === "customer") query.set("customerType", customerType)');
    expect(register).toContain('query.set("company", company.trim())');
    expect(register).toContain('window.location.assign(`${BASE}/login?${query.toString()}`)');
    expect(register).not.toContain('window.location.assign(`${BASE}/api/login/google?');
    expect(login).toContain('params.get("role")');
    expect(login).toContain('params.get("customerType")');
    expect(login).toContain('params.get("company")');
    expect(login).toContain('/api/portal/auth/google/id-token');
    expect(provider).toContain('googleResolveUser(profile, dbQuery, registration)');
  });

  it("resolves the OAuth cookie session before redirecting onboarding to login", () => {
    expect(onboarding).not.toContain("const authed = isAuthenticated()");
    expect(onboarding).not.toContain('if (!authed) { setLocation("/login"); return; }');
    expect(onboarding).toContain("fetchPortalAuthBootstrap(null, { force: true })");
    expect(onboarding).toContain("setSessionReady(true)");
    expect(onboarding).toContain('setLocation("/login")');
  });


  it("uses a direct save path for existing company membership during onboarding", () => {
    expect(adminPortal).toContain('status: "company_mapped"');
    expect(adminPortal).toContain("Membership / afiliasi yang dipilih tidak ditemukan.");
    expect(adminPortal).toContain("update public.portal_company_members");
    expect(adminPortal).toContain("[portal-onboarding] complete failed");
    expect(adminPortal).toContain("Gagal menyimpan profil di server");
  });

  it("requires identity and legal documents at both UI and server boundaries", () => {
    expect(onboarding).toContain("(!ktpFile && !ktpUrl)");
    expect(onboarding).toContain("!legalityFile && !legalityUrl");
    expect(adminPortal).toContain("KTP wajib diunggah untuk menyelesaikan pendaftaran.");
    expect(adminPortal).toContain("Nama perusahaan dan NIB / NPWP wajib diisi untuk perusahaan baru.");
    expect(adminPortal).toContain("Nama perusahaan, NIB, jenis layanan, dan dokumen legalitas vendor wajib diisi.");
  });
});
