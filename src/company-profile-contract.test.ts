import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("customer profile contract", () => {
  const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
  const page = readFileSync(join(process.cwd(), "src/pages/company-profile.tsx"), "utf8");
  const schemas = readFileSync(join(process.cwd(), "src/shared/api-client-react/generated/api.schemas.ts"), "utf8");

  it("exposes company and KTP addresses separately on the authenticated profile", () => {
    expect(server).toContain("select company_name, company_address, ktp_address, additional_notes");
    expect(server).toContain("ktpAddress: resolvedKtpAddress");
    expect(server).toContain("companyAddress: latestProfile?.company_address ?? null");
    expect(schemas).toContain("address?: string | null");
  });

  it("persists profile edits through the local standalone API", () => {
    expect(server).toContain('request.method === "PUT" && pathname === "/api/portal/me"');
    expect(server).toContain("handlePortalProfileUpdate");
    expect(server).toContain("company_address = nullif($2, '')");
    expect(server).toContain("ktp_address = nullif($3, '')");
    expect(page).toContain("Alamat Perusahaan");
    expect(page).toContain("Alamat sesuai KTP PIC");
    expect(page).toContain('fetch("/api/portal/me"');
  });


  it("uses the customer profile company identity instead of membership naming", () => {
    expect(server).toContain("select company_name, company_address, ktp_address, additional_notes");
    expect(server).toContain("company: latestProfile?.company_name ?? user.company ?? null");
    expect(server).toContain("set company_name = nullif($1, '')");
  });


  it("labels account ownership separately from organization membership", () => {
    expect(page).toContain("Akun perusahaan");
    expect(page).toContain("Membership / Afiliasi");
    expect(page).toContain("Membership / Afiliasi — bukan pemilik akun");
    expect(page).toContain("Ini hanya hubungan membership");
    expect(page).toContain("Nama Perusahaan Pemilik Akun");
    expect(page).toContain('fetch("/api/portal/organization"');
  });

  it("uploads avatars with the same multipart field expected by the server", () => {
    expect(server).toContain('pathname === "/api/portal/me/avatar"');
    expect(server).toContain("handlePortalAvatarUpload");
    expect(server).toContain("uploadPublicAsset");
    expect(page).toContain('fd.append("file", file)');
    expect(schemas).toContain("avatarUrl?: string | null");
  });
});
