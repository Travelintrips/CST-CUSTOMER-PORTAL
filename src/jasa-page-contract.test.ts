import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("jasa service hub contract", () => {
  it("hides additional logistics services from the customer-facing hub", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");
    const category = readFileSync(join(process.cwd(), "src/pages/jasa-kategori.tsx"), "utf8");

    expect(page).toContain('const VISIBLE_MAIN_CATEGORIES = MAIN_CATEGORIES.filter((category) => category.id !== "additional")');
    expect(page).toContain("{VISIBLE_MAIN_CATEGORIES.map((cat) => {");
    expect(page).toContain("String(VISIBLE_MAIN_CATEGORIES.length)");
    expect(category).toContain('if (categoryId === "additional")');
    expect(category).toContain('setLocation("/jasa")');
  });

  it("routes additional logistics services into quotation requests", () => {
    const shared = readFileSync(join(process.cwd(), "src/lib/jasa-shared.ts"), "utf8");
    const cart = readFileSync(join(process.cwd(), "src/pages/service-cart.tsx"), "utf8");

    expect(shared).toContain('handling: "/service-cart?service=handling"');
    expect(shared).toContain('port_charges: "/service-cart?service=port_charges"');
    expect(shared).toContain('storage_demurrage: "/service-cart?service=storage_demurrage"');
    expect(shared).toContain('emkl: "/service-cart?service=emkl"');
    expect(shared).toContain('cargo_insurance: "/service-cart?service=insurance"');

    expect(cart).toContain('| "port_charges" | "storage_demurrage" | "emkl"');
    expect(cart).toContain('title: "Port Charges"');
    expect(cart).toContain('title: "Storage / Demurrage"');
    expect(cart).toContain('title: "EMKL"');
    expect(cart).toContain('function PortChargesForm');
    expect(cart).toContain('function StorageDemurrageForm');
    expect(cart).toContain('function EmklForm');
    expect(cart).toContain('new URLSearchParams(window.location.search).get("service")');
    expect(cart).toContain("form layanan akan dibuka otomatis");
  });

  it("routes public navigation directly to the jasa hub", () => {
    const home = readFileSync(join(process.cwd(), "src/pages/home.tsx"), "utf8");
    const mobile = readFileSync(join(process.cwd(), "src/components/layout/MobileBottomNav.tsx"), "utf8");
    const verify = readFileSync(join(process.cwd(), ".github/workflows/production-verify.yml"), "utf8");

    expect(home).not.toContain('href: "/services"');
    expect(home).toContain('href: "/jasa"');
    expect(mobile).toContain('{ href: "/jasa",        icon: Ship,        label: "Layanan"');
    expect(verify).toContain('test "$url_count" = "15"');
    expect(verify).toContain("Public sitemap is live with 15 canonical URLs and /jasa as the service hub.");
  });

  it("keeps /jasa as the canonical service hub", () => {
    const app = readFileSync(join(process.cwd(), "src/App.tsx"), "utf8");
    const seo = readFileSync(join(process.cwd(), "src/config/seo.ts"), "utf8");
    const sitemap = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");

    expect(app).toContain('<Route path="/services">{() => { setLocation("/jasa"); return null; }}</Route>');
    expect(seo).toContain('canonical: `${BASE_URL}/jasa`');
    expect(seo).toContain('"/services": {');
    expect(seo).toContain("noindex: true");
    expect(sitemap).toContain("https://cstlogistic.co.id/jasa");
    expect(sitemap).not.toContain("https://cstlogistic.co.id/services</loc>");
  });

  it("does not publish unsupported marketing statistics on the jasa hero", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");

    expect(page).not.toContain('val: "500+"');
    expect(page).not.toContain('val: "50+"');
    expect(page).not.toContain('val: "10+"');
    expect(page).not.toContain("Rating 4.9 / 5.0");
    expect(page).not.toContain("98.5% ketepatan waktu");
    expect(page).toContain("Layanan Aktif");
    expect(page).toContain("Kategori Utama");
    expect(page).toContain("Penawaran Vendor");
  });

  it("keeps passenger and cargo trucking represented in the service master copy", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260925223000_align_jasa_trucking_service_catalog.sql"),
      "utf8",
    );

    expect(page).toContain("Transportasi & Distribusi Domestik");
    expect(page).toContain("Transportasi penumpang serta distribusi barang domestik");
    expect(migration).toContain("where service_code='trucking'");
    expect(migration).toContain("mobil penumpang hingga armada kargo");
  });

  it("uses route-specific prerendered static content", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
    const prerender = readFileSync(join(process.cwd(), "scripts/prerender.mjs"), "utf8");

    expect(html).toContain("<!-- SEO:STATIC:START -->");
    expect(html).toContain("© 2026 PT Cahaya Sejati Teknologi");
    expect(prerender).toContain("function buildStaticBody");
    expect(prerender).toContain("replaceMarker(html,     'SEO:STATIC'");
    expect(prerender).toContain("Transportasi Penumpang & Distribusi Barang Domestik");
  });

  it("keeps core CST services visible if catalog APIs degrade", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");

    expect(page).toContain('table: "service_catalog"');
    expect(page).toContain("if (!master && !presentation.href) return null");
    expect(page).toContain("master?.name ?? presentation.title");
    expect(page).toContain("Sebagian data katalog sedang tidak tersedia");
  });

  it("falls back to a second known asset if a bundle image fails", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");
    expect(page).toContain("primary: CUSTOMER_ASSETS.warehouse");
    expect(page).toContain("fallback: CUSTOMER_ASSETS.portOperations");
    expect(page).toContain('image.dataset.fallbackApplied === "true"');
    expect(page).toContain("image.src = photo.fallback");
  });

  it("uses stable service codes for service-card images", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");
    const shared = readFileSync(join(process.cwd(), "src/lib/jasa-shared.ts"), "utf8");
    expect(page).toContain("SERVICE_PHOTOS[svc.serviceCode] ?? SERVICE_PHOTOS[svc.title]");
    expect(shared).toContain('trucking:           image("banner-trucking-container.png")');
    expect(shared).toContain('"Transportasi & Distribusi Domestik": image("banner-trucking-container.png")');
  });

  it("uses stable photo keys for localized bulk-package titles", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");

    expect(page).toContain('photoKey: "Warehousing+Distribusi"');
    expect(page).toContain("const photo = BUNDLE_PHOTOS[photoKey]");
    expect(page).not.toContain("const photo = BUNDLE_PHOTOS[title]");
  });
});
