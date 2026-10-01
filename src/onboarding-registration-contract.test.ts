import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("customer company onboarding contract", () => {
  const onboarding = readFileSync(join(process.cwd(), "src/pages/onboarding.tsx"), "utf8");
  const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
  const languageContext = readFileSync(join(process.cwd(), "src/i18n/LanguageContext.tsx"), "utf8");

  it("clearly separates existing-company membership from new-company registration", () => {
    expect(onboarding).toContain("Perusahaan sudah terdaftar");
    expect(onboarding).toContain("Daftarkan perusahaan baru");
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

  it("requires identity and legal documents at both UI and server boundaries", () => {
    expect(onboarding).toContain("(!ktpFile && !ktpUrl)");
    expect(onboarding).toContain("!legalityFile && !legalityUrl");
    expect(adminPortal).toContain("KTP wajib diunggah untuk menyelesaikan pendaftaran.");
    expect(adminPortal).toContain("Nama perusahaan dan NIB / NPWP wajib diisi untuk perusahaan baru.");
    expect(adminPortal).toContain("Nama perusahaan, NIB, jenis layanan, dan dokumen legalitas vendor wajib diisi.");
  });
});
