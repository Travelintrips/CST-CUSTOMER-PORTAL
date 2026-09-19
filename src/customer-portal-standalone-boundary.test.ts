import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(
  join(process.cwd(), "server/index.mjs"),
  "utf8",
);

describe("standalone Customer Portal API boundary", () => {
  it("does not proxy unknown API routes to CST-SUPER-APP", () => {
    expect(serverSource).not.toContain("CUSTOMER_PORTAL_API_UPSTREAM_URL");
    expect(serverSource).not.toContain("VITE_API_SERVER_URL");
    expect(serverSource).not.toContain("proxyToUpstream");
    expect(serverSource).not.toContain("UPSTREAM_API_URL");
    expect(serverSource).toContain("CUSTOMER_PORTAL_LOCAL_ENDPOINT_NOT_FOUND");
  });

  it("pins the development browser proxy to the standalone Customer Portal API", () => {
    const viteSource = readFileSync(join(process.cwd(), "vite.config.ts"), "utf8");
    const replitSource = readFileSync(join(process.cwd(), ".replit"), "utf8");
    expect(viteSource).toContain("VITE_API_SERVER_URL_DEV");
    expect(viteSource).toContain("CUSTOMER_PORTAL_API_URL_DEV");
    expect(viteSource).not.toContain("process.env.VITE_API_SERVER_URL ??");
    expect(replitSource).not.toContain('VITE_API_SERVER_URL = "https://cstlogistic.co.id"');
    expect(replitSource).toContain('VITE_API_SERVER_URL_DEV = "http://127.0.0.1:18444"');
  });

  it("keeps vendor PO confirmation on the standalone marketplace API", () => {
    const vendorPoSource = readFileSync(join(process.cwd(), "src/pages/vendor-po-accept.tsx"), "utf8");
    expect(vendorPoSource).toContain("/mkt/vendor-po/");
    expect(vendorPoSource).toContain("/accept");
    expect(vendorPoSource).not.toContain("/purchase/vendor-accept/");
  });

  it("serves payment proof links from the standalone Customer Portal API", () => {
    const serverSource = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(serverSource).toContain("/api\\/payment-proof");
    expect(serverSource).toContain("uploadPaymentProof");
    expect(serverSource).toContain("payment_proof_token");
  });

  it("keeps product ordering reads on standalone catalog and canonical rates", () => {
    const productOrderSource = readFileSync(join(process.cwd(), "src/pages/product-order.tsx"), "utf8");
    expect(productOrderSource).toContain("/api/portal/products");
    expect(productOrderSource).toContain("/api/portal/calculator-rates-v2");
    expect(productOrderSource).not.toContain("/api/portal-product/products");
    expect(productOrderSource).not.toContain("/api/trucking-rates");
    expect(productOrderSource).not.toContain("/api/portal-product/templates");
  });

  it("keeps product order writes local and idempotent", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/product-order.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(page).toContain("/api/portal/product-orders");
    expect(page).not.toContain("/api/portal-product/orders");
    expect(server).toContain("handleCreateProductOrder");
    expect(server).toContain("pg_advisory_xact_lock");
    expect(server).toContain("idempotency_key");
  });

  it("keeps trucking booking writes on the standalone Customer Portal API", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(page).toContain("/api/portal/trucking/bookings");
    expect(page).not.toContain('fetch("/api/trucking/bookings"');
    expect(server).toContain("handleTruckingBooking");
    expect(server).toContain("trucking_booking_requests");
  });

  it("uses canonical standalone trucking estimates without legacy vendor pricing", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(page).toContain("/api/portal/trucking/estimate");
    expect(page).not.toContain("/api/vendor-trucking-pricing/public-estimate");
    expect(server).toContain("TRUCKING_VEHICLE_RATE_KEYS");
    expect(server).toContain("logistics_rate_cards");
  });

  it("keeps vehicle display settings public read-only while mutations stay admin-only", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("isPublicVehicleRead");
    expect(server).toContain('request.method === "GET"');
    expect(server).toContain("isPublicVehicleRead ? null : await requireAdmin");
  });

  it("preserves payment-proof remarks from multipart uploads", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain('remarks: form.get("remarks")');
    expect(server).toContain('String(form.remarks ?? "").trim().slice(0, 500)');
  });

  it("serves vendor dashboard read models from canonical standalone tables", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    expect(vendor).toContain("/api/portal/vendor/catalog-submissions");
    expect(vendor).toContain("/api/portal/vendor/featured-packages");
    expect(vendor).toContain("/api/portal/vendor/featured-requests");
    expect(vendor).toContain("vendor_catalog_submissions");
    expect(vendor).toContain("mkt_featured_product_requests");
  });

  it("guards vendor featured apply and cancel lifecycle locally", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    expect(vendor).toContain("pg_advisory_xact_lock");
    expect(vendor).toContain("is_published = true");
    expect(vendor).toContain("status in ('pending','approved','active')");
    expect(vendor).toContain("featured-requests\\/(\\d+)\\/cancel");
    expect(vendor).toContain("status !== \"pending\"");
  });

  it("guards vendor marketplace decline by supplier ownership and quote state", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    expect(vendor).toContain("marketplace-quotes\\/(\\d+)\\/decline");
    expect(vendor).toContain("q.id = $1 and q.vendor_id = $2");
    expect(vendor).toContain("requote_requested");
    expect(vendor).toContain("vendor_declined_quote");
    expect(vendor).toContain("status = 'withdrawn'");
  });

  it("keeps featured payment proofs private and pending admin verification", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(vendor).toContain("featured-requests\\/(\\d+)\\/payment-proof");
    expect(vendor).toContain("payment_status = 'pending_verification'");
    expect(vendor).toContain("payment_status === \"verified\"");
    expect(storage).toContain("vendor-featured-payment-proofs/vendor-");
    expect(storage).toContain("ensurePrivateBucket(storage)");
  });

  it("prices trucking trip count server-side and never persists synthetic vendor zero", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(page).toContain("jumlah_trip:           jumlahTrip");
    expect(server).toContain("const total = perTrip * tripCount");
    expect(server).toContain("vendor_id: null");
    expect(server).toContain("Number(body.selectedVendorId) > 0");
  });

  it("recomputes trucking booking price from canonical server rates", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("async function calculateCanonicalTruckingEstimate");
    expect(server).toContain("const canonicalPricing = await calculateCanonicalTruckingEstimate");
    expect(server).toContain("canonicalEstimate.total_estimate");
    expect(server).not.toContain("Math.max(0, Number(body.estimasiTotal) || 0)");
  });

  it("never persists client-supplied product-order service prices", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("const serviceCost = 0");
    expect(server).not.toContain("Number(body.selectedService?.estimatedCost");
    expect(server).toContain("selectedServiceId || null");
  });

  it("binds service requests to the logged-in identity and makes submit idempotent", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("Email service request harus menggunakan email akun");
    expect(server).toContain('serviceRequest.status === "submitted"');
    expect(server).toContain("alreadyProcessed: true");
    expect(server).toContain("where id = $1 and status in ('draft','revision_requested')");
  });

  it("persists the onboarding account type as the portal role", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    expect(adminPortal).toContain("set name = $1, phone = $2, role = $3");
    expect(adminPortal).toContain("case when $3 = 'customer' then $4 else null end");
    expect(adminPortal).toContain("[fullName, phone, accountType, customerType, profileCompanyName, ctx.user.id]");
  });

  it("keeps unknown API routes fail-closed in every environment", () => {
    expect(serverSource).not.toContain("Development preview traffic may proxy");
    expect(serverSource).toContain('"Customer Portal API route not found."');
  });
});
