import { describe, expect, it } from "vitest";
import { resolveImageUrl } from "@/lib/utils";

const SUPABASE_ROOT =
  "https://xssrfshdrtdfupgqwfdw.supabase.co/storage/v1/object/public/public-assets/portal-assets/static/customer-portal/images/";

describe("resolveImageUrl", () => {
  it.each([
    ["/images/foo.webp", "foo.webp"],
    ["/images/foo.png", "foo.png"],
    ["/portal/images/nested/foo.jpg", "nested/foo.jpg"],
    ["/portal/images/foo.webp", "foo.webp"],
    ["/api/storage/public-objects/portal/images/foo.webp", "foo.webp"],
    ["/api/storage/public-objects/images/foo.webp", "foo.webp"],
  ])("normalizes legacy path %s", (input, relative) => {
    expect(resolveImageUrl(input)).toBe(`${SUPABASE_ROOT}${relative}`);
  });

  it("keeps published PNG branding references on PNG", () => {
    expect(resolveImageUrl("/portal/images/logo.png")).toBe(`${SUPABASE_ROOT}logo.png`);
    expect(resolveImageUrl("/portal/images/logo-baru.png")).toBe(`${SUPABASE_ROOT}logo-baru.png`);
  });

  it("keeps canonical storage URLs unchanged", () => {
    const canonical = `${SUPABASE_ROOT}foo.webp`;
    expect(resolveImageUrl(canonical)).toBe(canonical);
  });

  it("keeps an absolute Supabase public CDN URL unchanged", () => {
    const canonical =
      "https://example.supabase.co/storage/v1/object/public/public-assets/portal-assets/static/customer-portal/images/logo-baru.png";
    expect(resolveImageUrl(canonical)).toBe(canonical);
  });

  it("resolves a legacy API public-object path to Supabase Storage", () => {
    expect(resolveImageUrl("/api/storage/public-objects/portal-assets/static/customer-portal/images/logo-baru.png"))
      .toBe(`${SUPABASE_ROOT}logo-baru.png`);
  });

  it("rejects a legacy bare object UUID before the browser requests it", () => {
    expect(
      resolveImageUrl(
        "/api/storage/public-objects/portal-assetsshared database model674887-3d77-4679-8725-bb8866fe53de",
      ),
    ).toBeNull();
  });

  it("rejects a legacy UUID because it has no Supabase object key", () => {
    const legacy =
      "/api/storage/public-objects/portal-assets/de648c66-00ae-46c4-8bc2-fbd7a7368b3c";
    expect(resolveImageUrl(legacy, { allowLegacyObjectId: true })).toBeNull();
  });

  it("rejects UUID-only legacy object paths", () => {
    const legacy =
      "/api/storage/public-objects/portal-assets/de648c66-00ae-46c4-8bc2-fbd7a7368b3c";
    expect(resolveImageUrl(legacy)).toBeNull();
  });

  it("maps an uploaded UUID asset to Supabase Storage when it has an extension", () => {
    const uploaded =
      "/api/storage/public-objects/portal-assets/7e07e12c-173a-45fe-a701-309013b788ef.webp";
    expect(resolveImageUrl(uploaded)).toBe(
      `${SUPABASE_ROOT.replace(/static\/customer-portal\/images\/$/, "")}7e07e12c-173a-45fe-a701-309013b788ef.webp`,
    );
  });

  it("keeps valid external URLs unchanged", () => {
    const external = "https://external-valid.example/image.webp";
    expect(resolveImageUrl(external)).toBe(external);
  });

  it.each(["/images/../secret.webp", "/images/foo\\bar.webp", "/images/", "../foo.webp"])(
    "rejects unsafe or empty legacy path %s",
    (input) => {
      expect(resolveImageUrl(input)).toBeNull();
    },
  );

  it("does not corrupt a PNG branding asset into WebP", () => {
    expect(resolveImageUrl("/images/logo-baru.png")).not.toContain(".webp");
  });
});