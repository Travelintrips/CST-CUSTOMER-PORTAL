import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { AdminToolbar } from "@/components/AdminToolbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackToTopButton } from "@/components/BackToTopButton";
import { CartDrawer } from "@/components/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ChatWidget } from "@/components/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import {
  fetchPortalAuthBootstrap,
  getCachedPortalAuthBootstrap,
  isAuthenticated,
  type PortalAuthBootstrap,
} from "@/lib/auth";

// ── Lazy-loaded pages (each becomes its own JS chunk) ────────────────────────
const Home                      = lazy(() => import("@/pages/home"));
const Services                  = lazy(() => import("@/pages/services"));
const Products                  = lazy(() => import("@/pages/products"));
const Marketplace               = lazy(() => import("@/pages/marketplace"));
const Jasa                      = lazy(() => import("@/pages/jasa"));
const JasaDetail                = lazy(() => import("@/pages/jasa-detail"));
const VendorProfil              = lazy(() => import("@/pages/vendor-profil"));
const Login                     = lazy(() => import("@/pages/login"));
const Register                  = lazy(() => import("@/pages/register"));
const Dashboard                 = lazy(() => import("@/pages/dashboard"));
const VendorDashboard           = lazy(() => import("@/pages/vendor-dashboard"));
const Orders                    = lazy(() => import("@/pages/orders"));
const Admin                     = lazy(() => import("@/pages/admin"));
const LogisticBook              = lazy(() => import("@/pages/logistic-book"));
const LogisticOrderSuccess      = lazy(() => import("@/pages/logistic-order-success"));
const LogisticTrack             = lazy(() => import("@/pages/logistic-track"));
const LogisticAdmin             = lazy(() => import("@/pages/logistic-admin"));
const LogisticAdminOrderDetail  = lazy(() => import("@/pages/logistic-admin-order-detail"));
const FreightForwarding         = lazy(() => import("@/pages/freight-forwarding"));
const Pabean                    = lazy(() => import("@/pages/pabean"));
const CustomClearance           = lazy(() => import("@/pages/custom-clearance"));
const Calculator                = lazy(() => import("@/pages/calculator"));
const ImportTariffCalculator    = lazy(() => import("@/pages/import-tariff-calculator"));
const LogisticCostCalculator    = lazy(() => import("@/pages/calculator")); // alias: /kalkulator-biaya-logistik
const ResetPassword             = lazy(() => import("@/pages/reset-password"));
const ProductOrder              = lazy(() => import("@/pages/product-order"));
const VendorResponsePage        = lazy(() => import("@/pages/vendor-response"));
const VendorProductApprovalPage = lazy(() => import("@/pages/vendor-product-approval"));
const ApprovePage               = lazy(() => import("@/pages/approve"));
const ConfirmPage               = lazy(() => import("@/pages/confirm"));
const VendorQuoteFormPage       = lazy(() => import("@/pages/vendor-quote-form"));
const VendorConfirmPage         = lazy(() => import("@/pages/vendor-confirm"));
const VendorFormPage            = lazy(() => import("@/pages/vendor-form"));
const ChooseOptionPage          = lazy(() => import("@/pages/choose-option"));
const OnboardingPage            = lazy(() => import("@/pages/onboarding"));
const PendingApprovalPage       = lazy(() => import("@/pages/pending-approval"));
// Mini form: standalone + lightweight — preload its own tiny chunk immediately
const VendorMiniFormPage        = lazy(() => import("@/pages/vendor-mini-form"));
const CustomerMiniFormPage      = lazy(() => import("@/pages/customer-mini-form"));
const AdminMiniFormPage         = lazy(() => import("@/pages/admin-mini-form"));
const CustomerApprovalPage      = lazy(() => import("@/pages/customer-approval"));
const OpConfirmPage             = lazy(() => import("@/pages/op-confirm"));
const CustomerQuotePage         = lazy(() => import("@/pages/customer-quote"));
const OrderTaskPage             = lazy(() => import("@/pages/order-task"));
const CustomerOrderPage         = lazy(() => import("@/pages/customer-order"));
const AdminActionPage           = lazy(() => import("@/pages/admin-action"));
const VendorFulfillmentPage     = lazy(() => import("@/pages/vendor-fulfillment"));
const ShortLinkRedirect         = lazy(() => import("@/pages/short-link-redirect"));
const FulfillmentFormPage       = lazy(() => import("@/pages/fulfillment-form"));
const PrivacyPolicy             = lazy(() => import("@/pages/privacy-policy"));
const Contact                   = lazy(() => import("@/pages/contact"));
const ShipmentTimeline          = lazy(() => import("@/pages/shipment-timeline"));
const AdminReview               = lazy(() => import("@/pages/admin-review"));
const VendorJobPage             = lazy(() => import("@/pages/vendor-job"));
const OrderTrackPage            = lazy(() => import("@/pages/order-track"));
const CustomerInvoicePage       = lazy(() => import("@/pages/customer-invoice"));
const AccountSecurity           = lazy(() => import("@/pages/account-security"));
const VendorPoAcceptPage        = lazy(() => import("@/pages/vendor-po-accept"));
const CustomerFeedbackPage      = lazy(() => import("@/pages/customer-feedback"));
const PurchaseRequestFormPage   = lazy(() => import("@/pages/purchase-request-form"));
const VendorInvoiceFormPage     = lazy(() => import("@/pages/vendor-invoice-form"));
const GoodsReceiptFormPage      = lazy(() => import("@/pages/goods-receipt-form"));
const DriverProgressPage        = lazy(() => import("@/pages/driver-progress"));
const PaymentProofPage          = lazy(() => import("@/pages/payment-proof"));
const ProductOrderTrackPage     = lazy(() => import("@/pages/product-order-track"));
const CatalogPage               = lazy(() => import("@/pages/catalog"));
const MarketplaceDetail         = lazy(() => import("@/pages/marketplace-detail"));
const JasaVendorDetail          = lazy(() => import("@/pages/jasa-vendor-detail"));
const JasaKategori              = lazy(() => import("@/pages/jasa-kategori"));
const EscrowConfirmPage         = lazy(() => import("@/pages/escrow-confirm"));
const ProductApprovePage        = lazy(() => import("@/pages/product-approve"));
const ShipmentSelectionPage     = lazy(() => import("@/pages/shipment-selection"));
const TruckingPage              = lazy(() => import("@/pages/trucking"));
const PortalDokumenPage         = lazy(() => import("@/pages/portal-dokumen"));
const PortalInvoicePage         = lazy(() => import("@/pages/portal-invoice"));
const CompanyProfilePage        = lazy(() => import("@/pages/company-profile"));
const CompanyVerificationPage   = lazy(() => import("@/pages/company-verification"));
const AirFreightBookingPage     = lazy(() => import("@/pages/air-freight-booking"));
const AirFreightApprovalPage    = lazy(() => import("@/pages/air-freight-approval"));
const AirFreightTrackPage       = lazy(() => import("@/pages/air-freight-track"));
const OceanFreightBookingPage   = lazy(() => import("@/pages/ocean-freight-booking"));
const OceanFreightApprovalPage  = lazy(() => import("@/pages/ocean-freight-approval"));
const OceanFreightTrackPage     = lazy(() => import("@/pages/ocean-freight-track"));
const OceanFreightPage          = lazy(() => import("@/pages/ocean-freight"));
const OceanFreightVendorForm    = lazy(() => import("@/pages/ocean-freight-vendor-form"));
const OceanFreightQuotePage     = lazy(() => import("@/pages/ocean-freight-quote"));
const VendorTrackingFormPage    = lazy(() => import("@/pages/vendor-tracking-form"));
const CustomerDataFormPage      = lazy(() => import("@/pages/customer-data-form"));
const ServiceCartPage           = lazy(() => import("@/pages/service-cart"));
const ServiceRequestTrackPage   = lazy(() => import("@/pages/service-request-track"));
const PpjkTrackPage             = lazy(() => import("@/pages/ppjk-track"));
const NotFound                  = lazy(() => import("@/pages/not-found"));
// Marketplace Phase 2F
const MktMyRfqsPage             = lazy(() => import("@/pages/mkt-my-rfqs"));
const MktRfqDetailPage          = lazy(() => import("@/pages/mkt-rfq-detail"));
const MktPendingApprovalsPage   = lazy(() => import("@/pages/mkt-pending-approvals"));
const MktMyPurchaseOrdersPage   = lazy(() => import("@/pages/mkt-my-purchase-orders"));
const MktPoDetailPage           = lazy(() => import("@/pages/mkt-po-detail"));
const MktVendorQuotePage        = lazy(() => import("@/pages/mkt-vendor-quote"));
// Marketplace Phase 2G — Vendor PO confirmation portal
const MktVendorPoPage           = lazy(() => import("@/pages/mkt-vendor-po"));
// Vendor invitation landing page (public)
const VendorRegisterPage        = lazy(() => import("@/pages/vendor-register"));
// Translation Hub — real-time AI translation for customers, vendors & staff
const TranslationHub            = lazy(() => import("@/pages/translation-hub"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Portal data is not a live stream. Reuse results during navigation
      // instead of refetching every time a page remounts.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Redirect bizportal subdomain to main domain /bizportal/
if (typeof window !== "undefined" && window.location.hostname === "bizportal.cstlogistic.co.id") {
  window.location.replace("https://cstlogistic.co.id/bizportal/");
}

// Routes that show NO navbar/footer shell
const LOGISTIC_ROUTES = ["/book", "/logistic-order", "/logistic-order-success", "/logistic-admin", "/order-produk"];
const NO_SHELL_PREFIXES = [
  "/jasa/", "/services/", "/vendor-response", "/vendor-product-approval",
  "/approve", "/confirm", "/vendor-quote", "/vendor-confirm", "/vendor-form",
  "/vendor-mini-form", "/customer-mini-form", "/admin-mini-form",
  "/choose-option", "/onboarding", "/pending-approval",
  "/mkt-vendor-quote",
  "/mkt-vendor-po",
  "/customer-quote", "/order-task", "/customer-order", "/admin-action",
  "/vendor-fulfillment", "/vendor-job", "/order-track",
  "/customer-approval", "/op-confirm", "/customer-invoice",
  "/vendor-po-accept",
  "/customer-feedback", "/purchase-request", "/vendor-invoice", "/goods-receipt",
  "/driver-progress",
  "/payment-proof",
  "/track-produk",
  "/product-approve",
  "/shipment-selection",
  "/escrow-confirm",
  "/air-freight/approval",
  "/air-freight/track",
  "/ocean-freight/approval",
  "/ocean-freight/track",
  "/ocean-freight-booking",
  "/ocean-freight-vendor-form",
  "/ocean-freight-quote",
  "/q/",
  "/vendor-tracking",
  "/customer-data-form",
  "/ppjk-track",
];

// Routes that should skip the Supabase auth check entirely (public/standalone pages)
const NO_AUTH_CHECK_PREFIXES = [
  "/vendor-mini-form", "/customer-mini-form", "/admin-mini-form",
  "/vendor-form", "/vendor-response", "/vendor-product-approval",
  "/vendor-quote", "/vendor-confirm", "/vendor-fulfillment", "/vendor-job",
  "/approve", "/confirm", "/customer-quote", "/order-task", "/customer-order",
  "/admin-action", "/admin-review", "/order-track", "/fulfillment", "/q/",
  "/mkt-vendor-quote",
  "/mkt-vendor-po",
  "/privacy-policy", "/contact",
  "/customer-approval", "/op-confirm", "/customer-invoice",
  "/vendor-po-accept",
  "/customer-feedback", "/purchase-request", "/vendor-invoice", "/goods-receipt",
  "/driver-progress",
  "/payment-proof",
  "/track-produk",
  "/product-approve",
  "/shipment-selection",
  "/escrow-confirm",
  "/ocean-freight-booking",
  "/ocean-freight/approval",
  "/ocean-freight/track",
  "/ocean-freight-vendor-form",
  "/ocean-freight-quote",
  "/vendor-tracking",
  "/customer-data-form",
  "/ppjk-track",
  "/vendor-register",
];

const BASE_PREFIX = import.meta.env.BASE_URL.replace(/\/$/, "");

function currentPortalPath() {
  return window.location.pathname.replace(BASE_PREFIX, "") || "/";
}

function isNoAuthRoute(path: string) {
  return NO_AUTH_CHECK_PREFIXES.some((p) => path.startsWith(p));
}

function redirectFromBootstrap(
  bootstrap: PortalAuthBootstrap,
  setLocation: (path: string) => void,
) {
  setLocation(bootstrap.allowedDestination);
}

function OAuthRedirectHandler() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const path = currentPortalPath();
    // Skip auth check entirely for public standalone pages
    if (isNoAuthRoute(path)) return;
    let disposed = false;

    // The backend Google flow sets the portal_session_hint cookie rather than
    // a Supabase session. Resolve that cookie session after returning to /login.
    const resolvePostAuth = () => {
      const savedReturnTo = sessionStorage.getItem("oauth_return_to");
      sessionStorage.removeItem("oauth_return_to");
      return fetchPortalAuthBootstrap(savedReturnTo).then((bootstrap) => {
        if (!disposed && bootstrap) redirectFromBootstrap(bootstrap, setLocation);
      });
    };

    // `/login` is also a session recovery boundary. Do not require the
    // readable hint first: older valid HttpOnly sessions can predate the hint
    // cookie, and the canonical bootstrap endpoint is the authority.
    if (path === "/login" || (path === "/" && isAuthenticated())) {
      void resolvePostAuth();
    }

    if (!supabase) {
      return () => { disposed = true; };
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      if (path !== "/" && path !== "/login") return;
      await resolvePostAuth();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        const p = currentPortalPath();
        if (p !== "/" && p !== "/login") return;
        await resolvePostAuth();
      }
    });
    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, [setLocation]);
  return null;
}

// ── Route guard: redirect to /login if not authenticated ────────────────────
function ProtectedRoute({ component: Comp, adminOnly = false }: { component: ComponentType; adminOnly?: boolean }) {
  const [location, navigate] = useLocation();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let disposed = false;
    setAuthorized(false);

    (async () => {
      const bootstrap = getCachedPortalAuthBootstrap() ?? await fetchPortalAuthBootstrap();
      if (disposed) return;
      if (!bootstrap) {
        navigate("/login");
        return;
      }

      const role = bootstrap.role;
      if (adminOnly) {
        if (role !== "admin") navigate("/dashboard");
        else setAuthorized(true);
        return;
      }
      const isAdminPath = location === "/admin" || location.startsWith("/admin/");
      if (role === "admin") {
        if (!isAdminPath) navigate("/admin");
        else setAuthorized(true);
        return;
      }

      if (
        (bootstrap.allowedDestination === "/onboarding" || bootstrap.allowedDestination === "/pending-approval")
        && location !== bootstrap.allowedDestination
      ) {
        navigate(bootstrap.allowedDestination);
        return;
      }
      if (role === "vendor" && location === "/dashboard") {
        navigate("/vendor-dashboard");
        return;
      }
      if (role !== "vendor" && location === "/vendor-dashboard") {
        navigate("/dashboard");
        return;
      }
      if (!disposed) setAuthorized(true);
    })();

    return () => { disposed = true; };
  }, [location, navigate]);

  if (!authorized) return <PageFallback />;
  return <Comp />;
}

// Minimal fallback for page transitions
function PageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-7 w-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppShell() {
  const [location, setLocation] = useLocation();
  const isLogisticPage = LOGISTIC_ROUTES.some(
    (p) => location === p || location.startsWith(p + "/") || location.startsWith("/logistic-admin")
  );
  const isNoShellPage = NO_SHELL_PREFIXES.some((p) => location.startsWith(p));
  const isNoAuth = isNoAuthRoute(location);

  const routes = (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/:categoryId" component={JasaKategori} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/products">{() => { setLocation("/marketplace"); return null; }}</Route>
        <Route path="/jasa" component={Jasa} />
        <Route path="/jasa/vendor/:id" component={JasaVendorDetail} />
        <Route path="/vendor/:vendorId" component={VendorProfil} />
        <Route path="/jasa/:id" component={JasaDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
        <Route path="/vendor-dashboard">{() => <ProtectedRoute component={VendorDashboard} />}</Route>
        <Route path="/orders">{() => <ProtectedRoute component={Orders} />}</Route>
        <Route path="/service-request-track">{() => <ProtectedRoute component={ServiceRequestTrackPage} />}</Route>
        <Route path="/admin">{() => <ProtectedRoute component={Admin} />}</Route>
        <Route path="/freight-forwarding" component={FreightForwarding} />
        <Route path="/pabean" component={Pabean} />
        <Route path="/custom-clearance" component={CustomClearance} />
        {/* Compatibility aliases: Logistic Order is owned by Customer Portal. */}
        <Route path="/logistic-order" component={LogisticBook} />
        <Route path="/logistic-order/book" component={LogisticBook} />
        <Route path="/logistic-order/order-success" component={LogisticOrderSuccess} />
        <Route path="/logistic-order/track/:orderNumber" component={LogisticTrack} />
        <Route path="/logistic-order/track" component={LogisticTrack} />
        <Route path="/logistic-order/admin/orders/:id">{() => <ProtectedRoute component={LogisticAdminOrderDetail} adminOnly />}</Route>
        <Route path="/logistic-order/admin">{() => <ProtectedRoute component={LogisticAdmin} adminOnly />}</Route>
        <Route path="/book" component={LogisticBook} />
        <Route path="/logistic-order-success" component={LogisticOrderSuccess} />
        <Route path="/track/:orderNumber" component={LogisticTrack} />
        <Route path="/track" component={LogisticTrack} />
        <Route path="/logistic-admin">{() => <ProtectedRoute component={LogisticAdmin} adminOnly />}</Route>
        <Route path="/logistic-admin/orders/:id">{() => <ProtectedRoute component={LogisticAdminOrderDetail} adminOnly />}</Route>
        <Route path="/calculator" component={Calculator} />
        <Route path="/kalkulator-biaya-logistik" component={LogisticCostCalculator} />
        <Route path="/kalkulator-impor" component={ImportTariffCalculator} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/order-produk" component={ProductOrder} />
        <Route path="/vendor-response/:orderNumber" component={VendorResponsePage} />
        <Route path="/vendor-product-approval/:orderNumber" component={VendorProductApprovalPage} />
        <Route path="/vendor-quote" component={VendorQuoteFormPage} />
        <Route path="/vendor-confirm" component={VendorConfirmPage} />
        <Route path="/vendor-register" component={VendorRegisterPage} />
        <Route path="/vendor-form/:token" component={VendorFormPage} />
        <Route path="/choose-option/:token" component={ChooseOptionPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/pending-approval" component={PendingApprovalPage} />
        <Route path="/vendor-mini-form/:token" component={VendorMiniFormPage} />
        <Route path="/customer-mini-form/:token" component={CustomerMiniFormPage} />
        <Route path="/admin-mini-form/:token" component={AdminMiniFormPage} />
        <Route path="/customer-approval/:token" component={CustomerApprovalPage} />
        <Route path="/op-confirm/:token" component={OpConfirmPage} />
        <Route path="/approve/:orderNumber" component={ApprovePage} />
        <Route path="/confirm/:token" component={ConfirmPage} />
        <Route path="/customer-quote/:token" component={CustomerQuotePage} />
        <Route path="/order-task/:token" component={OrderTaskPage} />
        <Route path="/customer-order/:token" component={CustomerOrderPage} />
        <Route path="/admin-action/:token" component={AdminActionPage} />
        <Route path="/vendor-fulfillment/:token" component={VendorFulfillmentPage} />
        <Route path="/driver-progress/:token" component={DriverProgressPage} />
        <Route path="/q/:code" component={ShortLinkRedirect} />
        <Route path="/s/:code" component={ShortLinkRedirect} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/contact" component={Contact} />
        <Route path="/shipment-timeline" component={ShipmentTimeline} />
        <Route path="/fulfillment/:token" component={FulfillmentFormPage} />
        <Route path="/admin-review/:token" component={AdminReview} />
        <Route path="/vendor-job/:token" component={VendorJobPage} />
        <Route path="/order-track/:trackToken" component={OrderTrackPage} />
        <Route path="/customer-invoice/:token" component={CustomerInvoicePage} />
        <Route path="/account-security">{() => <ProtectedRoute component={AccountSecurity} />}</Route>
        <Route path="/vendor-po-accept/:token" component={VendorPoAcceptPage} />
        <Route path="/customer-feedback/:token" component={CustomerFeedbackPage} />
        <Route path="/purchase-request/:token" component={PurchaseRequestFormPage} />
        <Route path="/vendor-invoice/:token" component={VendorInvoiceFormPage} />
        <Route path="/goods-receipt/:token" component={GoodsReceiptFormPage} />
        <Route path="/payment-proof/:token" component={PaymentProofPage} />
        <Route path="/escrow-confirm/:token" component={EscrowConfirmPage} />
        <Route path="/track-produk/:token" component={ProductOrderTrackPage} />
        <Route path="/catalog" component={CatalogPage} />
        <Route path="/product-approve/:token" component={ProductApprovePage} />
        <Route path="/shipment-selection/:token" component={ShipmentSelectionPage} />
        <Route path="/marketplace/my-rfqs/:rfqId">{() => <ProtectedRoute component={MktRfqDetailPage} />}</Route>
        <Route path="/marketplace/my-rfqs">{() => <ProtectedRoute component={MktMyRfqsPage} />}</Route>
        <Route path="/marketplace/pending-approvals">{() => <ProtectedRoute component={MktPendingApprovalsPage} />}</Route>
        <Route path="/marketplace/my-purchase-orders/:poId">{() => <ProtectedRoute component={MktPoDetailPage} />}</Route>
        <Route path="/marketplace/my-purchase-orders">{() => <ProtectedRoute component={MktMyPurchaseOrdersPage} />}</Route>
        <Route path="/mkt-vendor-quote/:token" component={MktVendorQuotePage} />
        <Route path="/mkt-vendor-po/:token" component={MktVendorPoPage} />
        <Route path="/marketplace/:id" component={MarketplaceDetail} />
        <Route path="/trucking" component={TruckingPage} />
        <Route path="/portal-dokumen">{() => <ProtectedRoute component={PortalDokumenPage} />}</Route>
        <Route path="/portal-invoice">{() => <ProtectedRoute component={PortalInvoicePage} />}</Route>
        <Route path="/company-profile">{() => <ProtectedRoute component={CompanyProfilePage} />}</Route>
        <Route path="/profile/company-verification">{() => <ProtectedRoute component={CompanyVerificationPage} />}</Route>
        <Route path="/air-freight-booking">{() => <ProtectedRoute component={AirFreightBookingPage} />}</Route>
        <Route path="/air-freight/approval/:token" component={AirFreightApprovalPage} />
        <Route path="/air-freight/track/:orderNumber" component={AirFreightTrackPage} />
        <Route path="/ocean-freight-booking">{() => <ProtectedRoute component={OceanFreightBookingPage} />}</Route>
        <Route path="/ocean-freight/approval/:token" component={OceanFreightApprovalPage} />
        <Route path="/ocean-freight/track/:orderNumber" component={OceanFreightTrackPage} />
        <Route path="/ocean-freight" component={OceanFreightPage} />
        <Route path="/ocean-freight-vendor-form/:token" component={OceanFreightVendorForm} />
        <Route path="/ocean-freight-quote/:token" component={OceanFreightQuotePage} />
        <Route path="/vendor-tracking/:token" component={VendorTrackingFormPage} />
        <Route path="/customer-data-form/:token" component={CustomerDataFormPage} />
        <Route path="/ppjk-track/:orderNumber" component={PpjkTrackPage} />
        <Route path="/service-cart">{() => <ProtectedRoute component={ServiceCartPage} />}</Route>
        <Route path="/service-cart/:requestId">{() => <ProtectedRoute component={ServiceCartPage} />}</Route>
        <Route path="/translation-hub" component={TranslationHub} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );

  if (isLogisticPage || isNoShellPage) {
    return <>{routes}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pb-16 di mobile supaya konten tidak tertutup bottom nav */}
      <div className="flex-1 pb-16 lg:pb-0">{routes}</div>
      <Footer />
      {!isNoAuth && (
        <>
          <AdminToolbar />
          <WhatsAppButton />
          <BackToTopButton />
          <ChatWidget />
          <CartDrawer />
        </>
      )}
      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <EditModeProvider>
              <OAuthRedirectHandler />
              <AppShell />
            </EditModeProvider>
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
