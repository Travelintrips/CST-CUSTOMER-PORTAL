describe("logistic production-ready payment fallback", () => {
  it("exposes Paylabs readiness, canonical CST bank transfer, and admin proof verification", () => {
    const payments = readFileSync(join(process.cwd(), "server/paylabs-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const customer = readFileSync(join(process.cwd(), "src/pages/logistic-order-success.tsx"), "utf8");
    const adminApi = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const adminUi = readFileSync(join(process.cwd(), "src/pages/admin/ServiceOperationsTab.tsx"), "utf8");

    expect(payments).toContain("getLogisticPaylabsState");
    expect(server).toContain("logisticManualPaymentAccount");
    expect(server).toContain("company_bank_accounts");
    expect(server).toContain("paylabs,");
    expect(server).toContain("manualPaymentAccount,");
    expect(server).toContain("Quotation harus disetujui sebelum mengunggah bukti pembayaran");
    expect(server).toContain("status='expired'::payment_status");

    expect(customer).toContain("const quoteReadyForPayment");
    expect(customer).toContain("const paylabsConfigured");
    expect(customer).toContain("manualTransferAvailable");
    expect(customer).toContain("Rekening tujuan");
    expect(customer).toContain("Paylabs belum tersedia untuk transaksi ini");
    expect(customer).toContain("Metode pembayaran belum tersedia");

    expect(adminApi).toContain('"verify_payment"');
    expect(adminApi).toContain('"reject_payment"');
    expect(adminApi).toContain("payment_proof_signed_url");
    expect(adminUi).toContain("Verifikasi Pembayaran Manual");
    expect(adminUi).toContain("Lihat Bukti Pembayaran");
    expect(adminUi).toContain("Verifikasi Pembayaran");
    expect(adminUi).toContain("Tolak Bukti");
  });
});

describe("logistic Paylabs settlement", () => {
  it("creates hosted Paylabs payments only after quote approval and settles by webhook", () => {
    const payments = readFileSync(join(process.cwd(), "server/paylabs-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const customer = readFileSync(join(process.cwd(), "src/pages/logistic-order-success.tsx"), "utf8");
    const env = readFileSync(join(process.cwd(), ".env.example"), "utf8");

    expect(payments).toContain("createLogisticPaylabsLink");
    expect(payments).toContain("ref_kind='logistic'::payment_ref_kind");
    expect(payments).toContain('payment.ref_kind === "logistic"');
    expect(payments).toContain('customer_quote_status !== "approved"');
    expect(payments).toContain("LOGISTIC_PROVIDER_COMPANY_ID ?? 1");
    expect(payments).toContain("payment_status='paid'");
    expect(payments).toContain("PAYLABS_GATEWAY");
    expect(payments).toContain("PAYLABS_SANDBOX_MODE");

    expect(server).toContain("createLogisticPaylabsLink");
    expect(server).toContain('orderNumberMatch?.[2] === "create-paylabs-link"');
    expect(server).toContain('row.customer_quote_status !== "approved"');

    expect(customer).toContain('order.paymentStatus !== "paid"');
    expect(customer).toContain("Pembayaran telah diterima");
    expect(customer).toContain("window.setInterval(async () =>");

    expect(env).toContain("LOGISTIC_PROVIDER_COMPANY_ID=1");
    expect(env).toContain("PAYLABS_SANDBOX_MODE=false");
  });
});

describe("logistic quotation approval lifecycle", () => {
  it("requires admin quotation before customer approval and payment", () => {
    const adminApi = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const adminUi = readFileSync(join(process.cwd(), "src/pages/admin/ServiceOperationsTab.tsx"), "utf8");
    const customerUi = readFileSync(join(process.cwd(), "src/pages/logistic-order-success.tsx"), "utf8");

    expect(adminApi).toContain('"send_quote"');
    expect(adminApi).toContain("customer_quote_status='pending_customer_approval'");
    expect(adminApi).toContain('.filter((action) => action !== "approve")');
    expect(adminUi).toContain("Quotation Customer");
    expect(adminUi).toContain("Kirim Quotation ke Customer");

    expect(server).toContain("quote-response");
    expect(server).toContain('customer_quote_status=$1');
    expect(server).toContain('approved ? "approved" : "revision_requested"');

    expect(customerUi).toContain("Setujui Quotation");
    expect(customerUi).toContain("Minta Revisi");
    expect(customerUi).toContain('order.customerQuoteStatus === "pending_customer_approval"');
    expect(customerUi).toContain('quoteReadyForPayment');
  });
});

describe("persistent customs and PPJK success flow", () => {
  it("keeps the canonical order number in the success URL and reloads from the API", () => {
    const customs = readFileSync(join(process.cwd(), "src/pages/custom-clearance.tsx"), "utf8");
    const ppjk = readFileSync(join(process.cwd(), "src/pages/pabean.tsx"), "utf8");
    const success = readFileSync(join(process.cwd(), "src/pages/logistic-order-success.tsx"), "utf8");

    expect(customs).toContain("/logistic-order-success?order=");
    expect(ppjk).toContain("/logistic-order-success?order=");
    expect(success).toContain('new URLSearchParams(search).get("order")');
    expect(success).toContain("/api/logistic/orders/");
    expect(success).toContain("Menunggu quotation CST");
  });
});

describe("unified customer order visibility", () => {
  it("includes trucking, air freight, and sea freight in orders and dashboard stats", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const orders = readFileSync(join(process.cwd(), "src/pages/orders.tsx"), "utf8");

    expect(server).toContain("airFreightOrders:");
    expect(server).toContain("oceanFreightOrders:");
    expect(server).toContain("from public.air_freight_orders");
    expect(server).toContain("from public.ocean_freight_orders");
    expect(server).toContain("from public.trucking_booking_requests");

    expect(orders).toContain("airFreightOrdersMapped");
    expect(orders).toContain("oceanFreightOrdersMapped");
    expect(orders).toContain('/air-freight/track/');
    expect(orders).toContain('/ocean-freight/track/');
    expect(orders).toContain('"air-freight": "Air Freight"');
    expect(orders).toContain('"ocean-freight": "Sea Freight"');
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(
  join(process.cwd(), "server/index.mjs"),
  "utf8",
);

describe("standalone Customer Portal API boundary", () => {
  it("does not proxy unknown API routes to a legacy upstream", () => {
    expect(serverSource).not.toContain("CUSTOMER_PORTAL_API_UPSTREAM_URL");
    expect(serverSource).not.toContain("VITE_API_SERVER_URL");
    expect(serverSource).not.toContain("proxyToUpstream");
    expect(serverSource).not.toContain("UPSTREAM_API_URL");
    expect(serverSource).toContain("CUSTOMER_PORTAL_LOCAL_ENDPOINT_NOT_FOUND");
  });

  it("pins the development browser proxy to the standalone Customer Portal API", () => {
    const viteSource = readFileSync(join(process.cwd(), "vite.config.ts"), "utf8");
    const replitSource = readFileSync(join(process.cwd(), ".replit"), "utf8");
    const launcherSource = readFileSync(join(process.cwd(), "start-dev.sh"), "utf8");
    expect(viteSource).toContain("CUSTOMER_PORTAL_API_URL_DEV");
    expect(viteSource).toContain("127.0.0.1");
    expect(viteSource).not.toContain("process.env.VITE_API_SERVER_URL_DEV");
    expect(viteSource).not.toContain("process.env.API_SERVER_URL_DEV");
    expect(launcherSource).toContain("unset CUSTOMER_PORTAL_API_UPSTREAM_URL");
    expect(launcherSource).toContain('CUSTOMER_PORTAL_API_URL_DEV="http://127.0.0.1:18444"');
    expect(launcherSource).not.toContain("VITE_API_SERVER_URL");
    expect(replitSource).not.toContain('VITE_API_SERVER_URL = "https://cstlogistic.co.id"');
    expect(replitSource).not.toContain("VITE_API_SERVER_URL");
    expect(replitSource).toContain("localPort = 18444");
    expect(viteSource).not.toContain("../logistic-order");
    expect(viteSource).not.toContain("../mockup-sandbox");
    expect(viteSource).not.toContain("/wa-gateway");
  });

  it("uses a portal-specific Secret Manager bundle and standalone build", () => {
    const bootstrap = readFileSync(join(process.cwd(), "server/secret-bootstrap.mjs"), "utf8");
    const packageSource = readFileSync(join(process.cwd(), "package.json"), "utf8");
    expect(bootstrap).toContain('DEFAULT_BUNDLE_PREFIX = "customer-portal"');
    expect(bootstrap).not.toContain('DEFAULT_BUNDLE_PREFIX = "cst-super-app"');
    expect(packageSource).toContain('"build:portal"');
    expect(packageSource).not.toContain('"build:workspace"');
  });

  it("keeps vendor PO confirmation on the standalone marketplace API", () => {
    const vendorPoSource = readFileSync(join(process.cwd(), "src/pages/vendor-po-accept.tsx"), "utf8");
    expect(vendorPoSource).toContain("/mkt/vendor-po/");
    expect(vendorPoSource).toContain("/accept");
    expect(vendorPoSource).not.toContain("/purchase/vendor-accept/");
  });

  it("serves payment proof links from the standalone Customer Portal API", () => {
    const serverSource = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(serverSource).toContain("paymentProofMatch");
    expect(serverSource).toContain("payment_proof_token = $1");
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

  it("sends an idempotency key when a customer selects a PO shipment", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/mkt-po-detail.tsx"), "utf8");
    expect(page).toContain('const [shipmentRequestKey] = useState(() => crypto.randomUUID())');
    expect(page).toContain('"Idempotency-Key": `customer-po-shipment:${poId}:${shipmentRequestKey}`');
  });

  it("optimizes multi-stop trucking routes inside the standalone portal", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const maps = readFileSync(join(process.cwd(), "server/google-maps-service.mjs"), "utf8");
    const preview = readFileSync(join(process.cwd(), "src/components/ui/route-map-preview.tsx"), "utf8");
    expect(page).toContain("/api/places/optimize-route");
    expect(page).toContain('routeMode');
    expect(page).toContain("Optimalkan Rute");
    expect(maps).toContain('pathname === "/api/places/optimize-route"');
    expect(maps).toContain("optimizeDeliveryRoute");
    expect(maps).toContain("distanceFromPreviousKm");
    expect(preview).toContain("waypoints");
    expect(preview).toContain("waypointQuery");
  });

  it("keeps passenger vehicle content free of cargo-only services", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    expect(page).toContain("Perjalanan dalam kota");
    expect(page).toContain("Perjalanan rombongan kecil");
    expect(page).toContain("Kalkulator Tarif Perjalanan");
    expect(page).toContain("Identitas pemesan menggunakan akun yang sedang login");
    expect(page).toContain('["Tol (actual cost)", "Parkir (actual cost)", "Multi-destination"]');
    expect(page).toContain("Rute & tracking perjalanan");
    expect(page).toContain("isPassengerVehicle ? \"Cek Tarif Perjalanan\"");
  });

  it("removes cargo-only messaging from passenger vehicles", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    expect(page).toContain("Tol & parkir sesuai biaya aktual");
    expect(page).toContain("Cek Tarif Perjalanan");
    expect(page).toContain("Pesan Mobil");
    expect(page).toContain('isPassengerVehicle ? (["dasar"] as const)');
  });

  it("separates passenger-car and cargo trucking calculator flows", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(page).toContain('PASSENGER_VEHICLE_IDS = new Set(["mobil", "mobil-xl"])');
    expect(page).toContain("Layanan Mobil Penumpang");
    expect(page).toContain('key === "tol" || key === "parkir"');
    expect(page).toContain("isPassengerVehicle ? undefined");
    expect(server).toContain('PASSENGER_TRUCKING_VEHICLE_IDS = new Set(["mobil", "mobil-xl"])');
    expect(server).toContain('serviceMode: "passenger"');
    expect(server).toContain("include_parking");
    expect(server).toContain("isPassengerVehicle ? null : (body.beratKg ?? null)");
    expect(page).toContain("!isPassengerVehicle && (");
    expect(page).toContain("picPickup:            isPassengerVehicle ? undefined : picPickup");
    expect(page).toContain("picPenerima:          isPassengerVehicle ? undefined : picPenerima");
    expect(server).toContain('const required = isPassengerVehicle');
    expect(server).toContain('fallbackName: passengerContactName');
    expect(server).toContain('fallbackPhone: passengerContactPhone');
    expect(server).toContain('isPassengerVehicle ? passengerContactName : String(body.picPickup)');
    expect(server).toContain('isPassengerVehicle ? passengerContactName : String(body.picPenerima)');
  });

  it("uses passenger-specific lifecycle copy after booking", () => {
    const customer = readFileSync(join(process.cwd(), "src/pages/trucking-order.tsx"), "utf8");
    const admin = readFileSync(join(process.cwd(), "src/pages/admin-trucking.tsx"), "utf8");
    const driver = readFileSync(join(process.cwd(), "src/pages/trucking-driver.tsx"), "utf8");
    expect(customer).toContain("Booking Mobil Penumpang");
    expect(customer).toContain("Mobil & Driver");
    expect(customer).toContain("Drop-off selesai");
    expect(customer).toContain("!isPassenger && stop.podUrl");
    expect(admin).toContain("Assignment Mobil & Driver");
    expect(admin).toContain("Tujuan & Drop-off");
    expect(admin).toContain("!isPassenger && s.podUrl");
    expect(driver).toContain("DRIVER PERJALANAN");
    expect(driver).toContain("Penumpang Sudah Dijemput");
    expect(driver).toContain("Konfirmasi Drop-off Selesai");
  });

  it("implements trucking end-to-end lifecycle inside the standalone portal", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const lifecycle = readFileSync(join(process.cwd(), "server/trucking-lifecycle.mjs"), "utf8");
    const payments = readFileSync(join(process.cwd(), "server/paylabs-service.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    const app = readFileSync(join(process.cwd(), "src/App.tsx"), "utf8");
    const customer = readFileSync(join(process.cwd(), "src/pages/trucking-order.tsx"), "utf8");
    const admin = readFileSync(join(process.cwd(), "src/pages/admin-trucking.tsx"), "utf8");
    const driver = readFileSync(join(process.cwd(), "src/pages/trucking-driver.tsx"), "utf8");

    expect(server).toContain("/api/portal/trucking/orders/");
    expect(server).toContain("/api/portal/admin/trucking");
    expect(server).toContain("/api/trucking/driver/");
    expect(lifecycle).toContain("waiting_customer_approval");
    expect(lifecycle).toContain("waiting_payment");
    expect(lifecycle).toContain("vehicle_assigned");
    expect(lifecycle).toContain("driver_to_pickup");
    expect(lifecycle).toContain("picked_up");
    expect(lifecycle).toContain("in_transit");
    expect(lifecycle).toContain("balance_due");
    expect(lifecycle).toContain("completed");
    expect(lifecycle).toContain("trucking_booking_stops");
    expect(lifecycle).toContain("trucking_status_events");
    expect(lifecycle).toContain("trucking_payments");
    expect(lifecycle).toContain('serviceMode !== "passenger" && !stop.pod_path');
    expect(lifecycle).toContain("totals.remainingAmount <= 0.005");
    expect(payments).toContain("createTruckingPaylabsLink");
    expect(payments).toContain("ref_kind='trucking'::payment_ref_kind");
    expect(storage).toContain("uploadTruckingPaymentProof");
    expect(storage).toContain("uploadTruckingPod");
    expect(app).toContain('/trucking/orders/:bookingNumber');
    expect(app).toContain('/trucking/driver/:token');
    expect(app).toContain('/admin/trucking/:bookingNumber');
    expect(customer).toContain("Setujui & Lanjut Pembayaran");
    expect(customer).toContain("Bayar via Paylabs");
    expect(customer).toContain("Upload Bukti");
    expect(admin).toContain("Kirim Harga ke Customer");
    expect(admin).toContain("Assign Armada");
    expect(driver).toContain("Berangkat ke Pickup");
    expect(driver).toContain("Konfirmasi Drop-off Selesai");
  });

  it("uses CST provider banking for trucking payments without customer-company leakage", () => {
    const lifecycle = readFileSync(join(process.cwd(), "server/trucking-lifecycle.mjs"), "utf8");
    const payments = readFileSync(join(process.cwd(), "server/paylabs-service.mjs"), "utf8");
    const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");
    expect(lifecycle).toContain("TRUCKING_PROVIDER_COMPANY_ID");
    expect(lifecycle).toContain("company_bank_accounts");
    expect(lifecycle).toContain("manualPaymentAccount");
    expect(payments).toContain("const providerCompanyId = Number(process.env.TRUCKING_PROVIDER_COMPANY_ID ?? 1)");
    expect(payments).toContain("providerCompanyId,");
    expect(envExample).toContain("TRUCKING_PROVIDER_COMPANY_ID=1");
  });

  it("guards trucking booking and payment idempotency", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/trucking.tsx"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const lifecycle = readFileSync(join(process.cwd(), "server/trucking-lifecycle.mjs"), "utf8");
    const payments = readFileSync(join(process.cwd(), "server/paylabs-service.mjs"), "utf8");

    expect(page).toContain("bookingRequestKey");
    expect(page).toContain("idempotencyKey:");
    expect(server).toContain("on conflict (idempotency_key)");
    expect(lifecycle).toContain("Masih ada bukti pembayaran yang menunggu verifikasi.");
    expect(lifecycle).toContain("status='expired'::payment_status");
    expect(payments).toContain("Pembayaran diselesaikan melalui Paylabs; bukti transfer trucking manual tidak diproses.");
  });

  it("keeps trucking fulfillment and proof files private", () => {
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(storage).toContain("trucking-payment-proofs/booking-");
    expect(storage).toContain("trucking-pod/booking-");
    expect(storage).toContain("signedTruckingPaymentProofUrl");
    expect(storage).toContain("signedTruckingPodUrl");
    expect(storage).toContain("ensurePrivateBucket(storage)");
  });

  it("keeps trucking customer reads ownership scoped and driver fulfillment token scoped", () => {
    const lifecycle = readFileSync(join(process.cwd(), "server/trucking-lifecycle.mjs"), "utf8");
    expect(lifecycle).toContain("assertOwner(booking, user, companyIds)");
    expect(lifecycle).toContain("where driver_token=$1");
    expect(lifecycle).toContain("Tujuan harus diselesaikan sesuai urutan rute.");
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

  it("keeps uploaded payment proofs private and returns token-scoped signed URLs", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(server).toContain("signedPaymentProofUrl({ token, path: invoice.proof_url })");
    expect(storage).toContain("export async function signedPaymentProofUrl");
    expect(storage).toContain("payment-proofs/${tokenHash}/");
    expect(storage).toContain("createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS)");
  });

  it("reports storage readiness separately from database readiness", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(server).toContain('storageReason: "database_unavailable"');
    expect(server).toContain('database: "connected"');
    expect(server).toContain("storageReason: error?.code ?? \"storage_unavailable\"");
    expect(storage).toContain('error.code = "STORAGE_NOT_CONFIGURED"');
    expect(storage).toContain('error.code = existing.error ? "STORAGE_BUCKET_UNAVAILABLE" : "STORAGE_BUCKET_MISSING"');
    expect(storage).toContain('error.code = "STORAGE_BUCKET_NOT_PRIVATE"');
  });

  it("exposes a commit-specific production release marker", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/production-verify.yml"), "utf8");
    const hostinger = readFileSync(join(process.cwd(), "scripts/prepare-hostinger.mjs"), "utf8");
    expect(server).toContain('releaseId: process.env.PORTAL_RELEASE_ID ?? "local-development"');
    expect(hostinger).toContain("process.env.GITHUB_SHA");
    expect(hostinger).toContain('process.env.PORTAL_RELEASE_ID ||= ${JSON.stringify(releaseId)}');
    expect(workflow).toContain('expected_sha="${GITHUB_SHA}"');
    expect(workflow).toContain('release_id="$(printf');
    expect(workflow).toContain('if [ "$release_id" = "$expected_sha" ]; then');
  });

  it("preserves vendor featured payment references and signs private proof paths", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const vendorPortal = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(server).toContain('paymentReference: form.get("paymentReference")');
    expect(vendorPortal).toContain("signedVendorFeaturedPaymentProofUrl");
    expect(storage).toContain("vendor-featured-payment-proofs/vendor-");
    expect(storage).toContain("request-");
  });

  it("scopes logistic-order payment proof paths to their portal customer", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("async function logisticOrderResponse");
    expect(server).toContain("customers/${Number(row.portal_customer_id)}/");
    expect(server).toContain("customers/${Number(user.id)}/");
    expect(server).toContain("paymentProofUrl = await signedDocumentUrl(row.payment_proof_url)");
    expect(server).not.toContain("paymentProofUrl: row.payment_proof_url ?? null");
  });

  it("does not persist browser-calculated logistic-order totals", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("const authoritativeSubtotal = 0");
    expect(server).toContain("const authoritativeTax = 0");
    expect(server).toContain("const authoritativeGrandTotal = 0");
    expect(server).toContain("Email order harus menggunakan email akun");
    expect(server).not.toContain("body.subtotal ?? 0");
    expect(server).not.toContain("body.grandTotal ?? 0");
    expect(server).not.toContain("await await logisticOrderResponse");
  });

  it("scopes and signs private customer profile documents", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("const profileDocumentUrl = async (path)");
    expect(server).toContain("customers/${Number(user.id)}/");
    expect(server).toContain("legalDocUrl: await profileDocumentUrl(row.legal_doc_url)");
    expect(server).toContain('for (const field of ["legalDocUrl", "ktpPicUrl", "suratKuasaUrl", "apiNikIzinUrl"])');
    expect(server).toContain("Object path dokumen profil tidak valid.");
  });

  it("protects required service-request items from customer mutation", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("request_id = $2 and is_required = false");
    expect(server).toContain("request_id = $7 and is_required = false");
    expect(server).toContain("Item wajib tidak dapat dihapus");
    expect(server).toContain("Jenis dan judul item wajib diisi.");
  });

  it("uses Supabase Storage only for persisted portal uploads", () => {
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(storage).toContain('from "@supabase/supabase-js"');
    expect(storage).toContain(".storage.from(storage.bucket).upload");
    expect(storage).not.toContain("@replit/object-storage");
    expect(storage).not.toContain("REPLIT_OBJECT_STORAGE");
    expect(storage).not.toContain("createWriteStream(");
    expect(storage).not.toContain("writeFileSync(");
  });

  it("does not expose sensitive tracking links to public phone verification", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("const isAuthenticatedOwner = Boolean(sessionRow);");
    expect(server).toContain("photoUrl: isAuthenticatedOwner ? (item.photo_url ?? null) : null");
    expect(server).toContain("token: isAuthenticatedOwner ? item.payment_proof_token : null");
  });

  it("keeps Fonnte device status admin-only and server-side", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const admin = readFileSync(join(process.cwd(), "src/pages/admin/FonnteStatusTab.tsx"), "utf8");
    expect(server).toContain('/api/portal/admin/fonnte/status');
    expect(server).toContain('process.env.FONNTE_TOKEN');
    expect(server).toContain('https://api.fonnte.com/device');
    expect(admin).not.toContain('FONNTE_TOKEN');
  });

  it("keeps unknown API routes fail-closed in every environment", () => {
    expect(serverSource).not.toContain("Development preview traffic may proxy");
    expect(serverSource).toContain('"Customer Portal API route not found."');
  });

  it("labels Fonnte messages as requested total and exposes the status tab in desktop admin", () => {
    const panel = readFileSync(join(process.cwd(), "src/pages/admin/FonnteStatusTab.tsx"), "utf8");
    const admin = readFileSync(join(process.cwd(), "src/pages/admin.tsx"), "utf8");
    expect(panel).toContain("Total Pesan Diminta");
    expect(panel).not.toContain('["Total Pesan",');
    expect(admin).toContain('TabsTrigger value="fonnte-status"');
  });

  it("keeps the desktop admin menu compact and independently scrollable", () => {
    const admin = readFileSync(join(process.cwd(), "src/pages/admin.tsx"), "utf8");
    expect(admin).toContain("h-[calc(100vh-88px)] overflow-y-auto overscroll-contain");
    expect(admin).toContain("text-xs lg:text-[13px]");
    expect(admin).toContain("py-1.5 rounded-md");
  });

  it("implements standalone Fonnte retry instead of returning 501", () => {
    const legacy = readFileSync(join(process.cwd(), "server/admin-legacy.mjs"), "utf8");
    const whatsapp = readFileSync(join(process.cwd(), "server/whatsapp-service.mjs"), "utf8");
    expect(legacy).toContain("retryWhatsAppLog");
    expect(legacy).not.toContain("Retry WhatsApp belum tersedia pada API standalone.");
    expect(whatsapp).toContain("https://api.fonnte.com/send");
    expect(whatsapp).toContain("FONNTE_TOKEN");
  });

  it("does not render a literal newline escape in the desktop Fonnte navigation", () => {
    const admin = readFileSync(join(process.cwd(), "src/pages/admin.tsx"), "utf8");
    expect(admin).not.toContain('</TabsTrigger>\\\\n                  <TabsTrigger value="fonnte-status"');
  });

  it("minimizes unauthenticated generic logistics tracking", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("const trackingBase = isAuthenticatedOwner");
    expect(server).toContain("grandTotal: isAuthenticatedOwner");
    expect(server).toContain("paymentProofUrl");
  });

  it("uses canonical vendor verification status during bootstrap", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("select verification_status from public.vendor_profiles");
    expect(server).toContain("vendorApprovalStatus,");
    expect(server).not.toContain('vendorApprovalStatus: user.role === "vendor" ? "pending" : null');
  });

  it("rate limits anonymous public quote creation", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain("allowPublicQuote(request)");
    expect(server).toContain('sendError(response, 429, "Terlalu banyak permintaan quotation.');
  });

  it("implements standalone master price CSV import", () => {
    const legacy = readFileSync(join(process.cwd(), "server/admin-legacy.mjs"), "utf8");
    expect(legacy).not.toContain("Import master price belum tersedia pada API standalone.");
    expect(legacy).toContain("CSV import");
    expect(legacy).toContain("pendingApproval");
  });

  it("stores AI chat uploads in private Supabase document storage", () => {
    const ai = readFileSync(join(process.cwd(), "server/ai-agent.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(ai).toContain("uploadAiChatDocument");
    expect(ai).not.toContain("Upload dokumen belum tersedia pada Customer Portal API lokal.");
    expect(storage).toContain("ai-chat-documents/");
    expect(storage).toContain("ensurePrivateBucket(storage)");
  });

  it("queues marketplace notifications for internal UI and WhatsApp with channel-scoped deduplication", () => {
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    expect(marketplace).toContain('for (const channel of ["internal", "whatsapp"])');
    expect(marketplace).toContain('${key}:${channel}');
  });

  it("only processes fresh opt-in WhatsApp queue rows and never drains historical internal notifications", () => {
    const whatsapp = readFileSync(join(process.cwd(), "server/whatsapp-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(whatsapp).toContain("where channel='whatsapp'");
    expect(whatsapp).toContain("created_at >= $1");
    expect(whatsapp).not.toContain("where q.channel = 'internal'");
    expect(server).toContain('IS_PRODUCTION && process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED !== "false"');
  });

  it("supports owned vendor catalog image uploads through standalone API", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
    expect(vendor).toContain("catalogImageMatch");
    expect(vendor).toContain("uploadVendorCatalogImage");
    expect(vendor).toContain("vendor_id=$2");
    expect(storage).toContain("vendor-catalog/vendor-");
    expect(storage).toContain("image/webp");
    expect(storage).toContain("const storage=publicAssetStorage()");
    expect(storage).not.toContain("ensurePublicBucket(storage)");
    expect(storage).not.toContain("storage.publicBucket");
  });

  it("supports standalone vendor product CRUD for external and internal vendors", () => {
    const vendor = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const admin = readFileSync(join(process.cwd(), "server/admin-vendor-catalog.mjs"), "utf8");
    const wizard = readFileSync(join(process.cwd(), "src/components/catalog/AddVendorProductWizard.tsx"), "utf8");
    expect(vendor).toContain('url.pathname === "/api/portal/vendor/catalog" && request.method === "POST"');
    expect(vendor).toContain("pending_review");
    expect(vendor).toContain("vendor_id=$11");
    expect(vendor).toContain("media-assets");
    expect(admin).toContain('request.method === "POST" && pathname === "/api/portal/admin/vendor-catalog-items"');
    expect(admin).toContain("is_internal_vendor");
    expect(wizard).toContain("is_internal_vendor:");
  });

  it("accepts the vendor media UI limit through the multipart parser", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const wizard = readFileSync(join(process.cwd(), "src/components/catalog/AddVendorProductWizard.tsx"), "utf8");
    expect(wizard).toContain("const MAX_SIZE = 20 * 1024 * 1024");
    expect(server).toContain("const MAX_MULTIPART_BODY_BYTES = 21 * 1024 * 1024");
    expect(server).not.toContain("const MAX_MULTIPART_BODY_BYTES = 6 * 1024 * 1024");
  });

  it("resolves historical marketplace vendor routing from canonical quote and RFQ data", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const assignment = readFileSync(join(process.cwd(), "src/components/admin/MarketplaceVendorAssignment.tsx"), "utf8");
    expect(adminPortal).toContain("/vendor-routing$");
    expect(adminPortal).toContain("from public.mkt_vendor_quotes q");
    expect(adminPortal).toContain("join public.vendor_catalog_items vci on vci.id = rl.vendor_catalog_item_id");
    expect(adminPortal).toContain("historical_name_match");
    expect(assignment).toContain("/api/mkt/admin/rfqs/${rfqId}/approve-and-invite");
    expect(assignment).toContain("vendorIds: [routing.vendorId]");
    expect(marketplace).toContain('if (rfq.status !== "quoting")');
  });
  it("serves every public marketplace-detail dependency from the standalone API", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain('pathname === "/api/portal/company"');
    expect(server).toContain("public-profile$");
    expect(server).toContain("(related|similar|same-province)");
    expect(server).toContain("handleMarketplaceRecommendations");
    expect(server).toContain("handleVendorPublicProfile");
    expect(server).toContain("handlePortalCompany");
  });

  it("does not hardcode DEV Supabase branding assets in production HTML", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
    expect(html).not.toContain("xssrfshdrtdfupgqwfdw.supabase.co");
    expect(html).toContain("%VITE_SUPABASE_URL%");
    expect(html).not.toContain('rel="preload" as="image"');
  });

  it("keeps public portal branding independent from internal company_settings name", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(server).toContain('process.env.PORTAL_PUBLIC_COMPANY_NAME?.trim() || "B2B Marketplace and Logistic"');
    expect(server).not.toContain('name: row.company_name ?? "PT Cahaya Sejati Teknologi"');
  });

  it("routes marketplace vendor-routing through the admin service-operations gateway", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    expect(server).toContain("(?:\\/actions|\\/vendor-routing)?$");
    expect(adminPortal).toContain("/vendor-routing$");
    expect(adminPortal).toContain("loadMarketplaceVendorRouting");
  });

  it("uses canonical marketplace admin endpoints for deal pricing", () => {
    const editor = readFileSync(join(process.cwd(), "src/components/admin/MarketplaceDealPriceEditor.tsx"), "utf8");
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    expect(editor).toContain("/api/mkt/admin/rfqs/${rfqId}/vendor-quotes");
    expect(editor).toContain("/api/mkt/admin/rfqs/${rfqId}/quotes/${quoteId}/deal-price");
    expect(editor).toContain("/api/mkt/admin/rfqs/${rfqId}/quotes/${selectedQuote.quote_id}/deal-price");
    expect(editor).not.toContain("/api/portal/admin/service-operations/marketplace/${rfqId}/deal-price");
    expect(marketplace).toContain("vendor-quotes$");
    expect(marketplace).toContain("quotes\\/(\\d+)\\/deal-price$");
  });

  it("uses projected customer phone for contact action and normalizes Indonesian WhatsApp numbers", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const operations = readFileSync(join(process.cwd(), "src/pages/admin/ServiceOperationsTab.tsx"), "utf8");
    expect(adminPortal).toContain('row.phone ?? row.customer_phone ?? row.buyer_phone');
    expect(adminPortal).toContain('if (phone.startsWith("0")) phone = `62${phone.slice(1)}`');
    expect(adminPortal).toContain('else if (phone.startsWith("8")) phone = `62${phone}`');
    expect(adminPortal).toContain('contactUrl: `https://wa.me/${phone}`');
    expect(operations).toContain('payload.message ?? payload.error ?? "Action gagal dijalankan"');
  });

  it("does not crash purchase-order detail when ProtectedRoute does not forward params", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/mkt-po-detail.tsx"), "utf8");
    expect(page).toContain('params?: { poId?: string }');
    expect(page).toContain('const [location, setLocation] = useLocation()');
    expect(page).toContain('location.split("/").filter(Boolean).at(-1)');
    expect(page).toContain('Number(params?.poId ?? routePoId)');
    expect(page).not.toContain('Number(params.poId)');
  });

  it("keeps marketplace approval notifications and PO pricing visible across roles", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const vendorApi = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const navbar = readFileSync(join(process.cwd(), "src/components/layout/Navbar.tsx"), "utf8");
    const dashboard = readFileSync(join(process.cwd(), "src/pages/dashboard.tsx"), "utf8");
    const vendorDashboard = readFileSync(join(process.cwd(), "src/pages/vendor-dashboard.tsx"), "utf8");

    expect(server).toContain('user.role === "admin" ? "admin" : "customer"');
    expect(navbar).toContain('role === "customer" || role === "admin"');
    expect(marketplace).toContain('"Purchase Order baru"');
    expect(marketplace).toContain("recipientPhone: vendorContact.phone ?? null");
    expect(marketplace).toContain("purchase_order_grand_total");
    expect(dashboard).toContain("Number(o.grandTotal ?? 0)");
    expect(dashboard).toContain("/marketplace/my-purchase-orders/${o.poId}");
    expect(vendorApi).toContain("p.currency_snapshot");
    expect(vendorApi).toContain('currency: row.currency_snapshot || "IDR"');
    expect(vendorDashboard).toContain('currency: order.currency || "IDR"');
  });

  it("redacts external vendor identity from every customer-facing marketplace projection", () => {
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const poPage = readFileSync(join(process.cwd(), "src/pages/mkt-po-detail.tsx"), "utf8");
    const rfqPage = readFileSync(join(process.cwd(), "src/pages/mkt-rfq-detail.tsx"), "utf8");
    const detailPage = readFileSync(join(process.cwd(), "src/pages/marketplace-detail.tsx"), "utf8");

    expect(marketplace).toContain("CUSTOMER_FACING_SELLER_NAME");
    expect(marketplace).toContain("customerView: true");
    expect(marketplace).toContain("redactVendor ? null : row.vendor_phone");
    expect(marketplace).toContain("vendorId: null");
    expect(marketplace).toContain("vendorPhone: null");
    expect(marketplace).toContain("vendorEmail: null");
    expect(marketplace).toContain("quotationNumber: null");
    expect(server).toContain("PUBLIC_MARKETPLACE_SELLER_NAME");
    expect(server).toContain("isInternalVendor ? Number(row.vendor_id ?? 0) : 0");
    expect(server).toContain("if (!Boolean(vendor.is_internal_vendor))");
    expect(server).toContain("vendorId: isInternalVendor ? (row.vendor_id ?? null) : null");
    expect(server).toContain("documents: isInternalVendor ? parseJson(row.documents, []) : []");
    expect(marketplace).toContain('event.actor_type === "vendor"');
    expect(marketplace).toContain("result.rows[0].is_internal_vendor ? line.notes : null");
    expect(poPage).toContain("Seluruh komunikasi, pembayaran, dan layanan transaksi ini dikelola melalui PT Cahaya Sejati Teknologi (CST).");
    expect(rfqPage).toContain("Seluruh komunikasi dan transaksi dikelola melalui PT Cahaya Sejati Teknologi (CST).");
    expect(detailPage).toContain("external vendor identity stays private");
    expect(detailPage).toContain("COMPANY_CONFIG.legalName");
  });

  it("uses the full legal entity name for customer-facing seller identity", () => {
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const company = readFileSync(join(process.cwd(), "src/config/company.ts"), "utf8");
    const detail = readFileSync(join(process.cwd(), "src/pages/marketplace-detail.tsx"), "utf8");

    expect(marketplace).toContain('const CUSTOMER_FACING_SELLER_NAME = "PT Cahaya Sejati Teknologi"');
    expect(server).toContain('const PUBLIC_MARKETPLACE_SELLER_NAME = "PT Cahaya Sejati Teknologi"');
    expect(company).toContain('legalName: "PT Cahaya Sejati Teknologi"');
    expect(detail).toContain("PT Cahaya Sejati Teknologi (CST)");
  });

  it("fills admin marketplace operation panels with RFQ transaction information", () => {
    const marketplace = readFileSync(join(process.cwd(), "server/marketplace-service.mjs"), "utf8");
    const operations = readFileSync(join(process.cwd(), "src/pages/admin/MarketplaceOperations.tsx"), "utf8");

    expect(marketplace).toContain("buyer_email, buyer_phone");
    expect(marketplace).toContain("delivery_address, required_delivery_date");
    expect(marketplace).toContain("proposed_quote_id, winning_quote_id");
    expect(marketplace).toContain("po.currency_snapshot");
    expect(marketplace).toContain("negotiatedNotes: quote.negotiated_notes");

    expect(operations).toContain("Informasi customer");
    expect(operations).toContain("Ringkasan transaksi");
    expect(operations).toContain("Purchase Order");
    expect(operations).toContain("Customer sudah menyetujui · PO telah dibuat");
    expect(operations).toContain("setDealNotes(result.negotiatedNotes ?? result.notes ??");
  });

  it("fills generic admin service detail with canonical marketplace customer and fulfillment data", () => {
    const admin = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const operations = readFileSync(join(process.cwd(), "src/pages/admin/ServiceOperationsTab.tsx"), "utf8");

    expect(admin).toContain("coalesce(r.buyer_phone, c.phone) as buyer_phone");
    expect(admin).toContain("coalesce(r.buyer_company, p.company_name, c.company) as buyer_company");
    expect(admin).toContain("c.customer_type");
    expect(admin).toContain("from public.rfq_activity_logs");
    expect(admin).toContain("from public.mkt_purchase_orders");
    expect(admin).toContain("from public.mkt_po_shipments");
    expect(admin).toContain("from public.mkt_po_shipment_events");
    expect(admin).toContain("from public.mkt_po_goods_receipts");
    expect(admin).toContain('display: po ?');
    expect(admin).toContain('"Belum ada shipment"');

    expect(operations).toContain('selected.record["buyer_phone"]');
    expect(operations).toContain('"Personal / Individual"');
    expect(operations).toContain('["Email"');
    expect(operations).toContain('selected.record["rfq_number"]');
    expect(operations).toContain("fulfillment.display");
    expect(operations).toContain("tracking.display");
  });

  it("lets customers confirm goods receipt and only completes a PO after every shipment is fully received", () => {
    const operations = readFileSync(join(process.cwd(), "server/marketplace-operations.mjs"), "utf8");
    const poPage = readFileSync(join(process.cwd(), "src/pages/mkt-po-detail.tsx"), "utf8");

    expect(operations).toContain('request.method === "POST" && goods');
    expect(operations).toContain("Konfirmasi penerimaan hanya dapat dilakukan setelah POD tersedia.");
    expect(operations).toContain("Qty goods receipt melebihi sisa qty shipment.");
    expect(operations).toContain("all_shipments_delivered");
    expect(operations).toContain("all_shipments_have_pod");
    expect(operations).toContain("all_shipment_items_accepted");
    expect(operations).toContain("all_po_qty_allocated");
    expect(operations).not.toContain("select exists(\n       select 1 from public.mkt_po_shipments s");
    expect(poPage).toContain("Konfirmasi Barang Diterima");
    expect(poPage).toContain("Diterima Lengkap");
    expect(poPage).toContain("Diterima Sebagian");
    expect(poPage).toContain("Ada Masalah / Ditolak");
    expect(poPage).not.toContain("Backend GAP:");
  });

  it("keeps PO status synchronized with the shipment lifecycle", () => {
    const operations = readFileSync(join(process.cwd(), "server/marketplace-operations.mjs"), "utf8");
    expect(operations).toContain("async function syncPoStatusFromShipments");
    expect(operations).toContain('target = "in_transit"');
    expect(operations).toContain('target = "partially_delivered"');
    expect(operations).toContain('target = "delivered"');
    expect(operations).toContain('target = "rejected_goods"');
    expect(operations).toContain("source: \"shipment_lifecycle\"");
    expect(operations).toContain("await syncPoStatusFromShipments(db, shipment.po_id, user, isAdmin)");
  });

  it("uses the canonical service catalog for all customer service cards", () => {
    const jasa = readFileSync(join(process.cwd(), "src/pages/jasa.tsx"), "utf8");
    const category = readFileSync(join(process.cwd(), "src/pages/jasa-kategori.tsx"), "utf8");
    const shared = readFileSync(join(process.cwd(), "src/lib/jasa-shared.ts"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    for (const code of [
      "sea_freight", "air_freight", "trucking", "customs_clearance", "ppjk_consulting",
      "handling", "port_charges", "storage_demurrage", "emkl", "cargo_insurance",
    ]) {
      expect(jasa).toContain(`serviceCode: "${code}"`);
    }
    expect(jasa).toContain("normalizeCanonicalService");
    expect(jasa).toContain("canonicalByCode");
    expect(jasa).toContain("serviceCardsForCategory");
    expect(jasa).toContain("presentedServiceCodes");
    expect(jasa).toContain('cat.id === "additional"');
    expect(jasa).toContain("!presentedServiceCodes.has(master.code)");
    expect(jasa).not.toContain("const legacyItems:");
    expect(category).toContain("const serviceCards =");
    expect(category).not.toContain("const legacyItems:");
    expect(shared).toContain("CANONICAL_SERVICE_ROUTES");
    expect(shared).toContain('sea_freight: "/ocean-freight-booking"');
    expect(shared).toContain('customs_clearance: "/custom-clearance"');

    expect(server).toContain('const requestedKind = (url.searchParams.get("kind") ?? "product")');
    expect(server).toContain('const kind = requestedKind === "service" ? "service" : "product"');
    expect(server).toContain("where ($1::text is null or type = $1)");
    expect(server).toContain("requirePublishedStatus: false, type: null");
  });

});
