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
    expect(onboarding).toContain("NIB / NPWP wajib diisi untuk perusahaan baru.");
    expect(onboarding).not.toContain(">Perusahaan saya belum terdaftar<");
  });

  it("does not rewrite the new-company CTA to a generic unavailable label", () => {
    expect(languageContext).not.toContain('"Perusahaan saya belum terdaftar": "dashboard.notProvided"');
  });

  it("locks onboarding to the registration role without presenting unrelated public roles", () => {
    expect(onboarding).toContain('registeredRole ? item.value === registeredRole : ["customer", "vendor"].includes(item.value)');
    expect(onboarding).toContain("Tipe akun dikunci sesuai pilihan saat pendaftaran");
  });

  it("requires identity and legal documents at both UI and server boundaries", () => {
    expect(onboarding).toContain("KTP wajib diunggah untuk melanjutkan pendaftaran.");
    expect(onboarding).toContain("Dokumen legalitas vendor wajib diunggah.");
    expect(adminPortal).toContain("KTP wajib diunggah untuk menyelesaikan pendaftaran.");
    expect(adminPortal).toContain("Nama perusahaan dan NIB / NPWP wajib diisi untuk perusahaan baru.");
    expect(adminPortal).toContain("Nama perusahaan, NIB, jenis layanan, dan dokumen legalitas vendor wajib diisi.");
  });
});
