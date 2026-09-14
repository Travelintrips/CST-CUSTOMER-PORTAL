/**
 * admin.tsx — thin shell
 * Imports all modular tab components and renders the AdminPage layout
 * (sidebar navigation + Tabs content area).
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { isAuthenticated, isPortalAdmin, getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import {
  Shield, FileText, Box, Settings, Tag, Truck, Loader2, Wrench,
  Building2, Store, Package, Users, BarChart2, ClipboardList, Ship,
  UserCheck, MessageCircle, UserPlus, Layers, Link2, ShoppingCart,
  CreditCard, DollarSign, BookOpen, Receipt, Wallet, ArrowUpRight, Inbox,
  LayoutDashboard, PackageCheck, Mail, Image as ImageIcon, X, Menu,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Module imports ────────────────────────────────────────────────────────────
import { ContentTab }                                    from "@/pages/admin/ContentTab";
import { ServicesTab, ProductsTab }                      from "@/pages/admin/CatalogManagement";
import { VehicleImagesTab }                              from "@/pages/admin/VehicleFleet";
import { PayLabsSettingTab, ClaimAdminTab }              from "@/pages/admin/PaymentsSettings";
import { ApprovalsTab, CustomersTab, WaLogsTab }         from "@/pages/admin/UserOperations";
import { DeliveryVendorsTab, PricingTab }                from "@/pages/admin/LogisticsSettings";
import { PortalProductTemplateEngine }                   from "@/pages/admin/ProductTemplates";
import { MiniFormTab }                                   from "@/pages/admin/MiniFormSystem";
import { VendorMarketplaceTab, VendorInvitationsTab, VendorCatalogTab } from "@/pages/admin/VendorSystems";
import { FixJasaNamesTool, ProdukUnggulanTab }           from "@/pages/admin/PromoManagement";
import { MasterPriceManagement }                         from "@/pages/admin/MasterPriceManagement";
import { ServiceOperationsTab }                           from "@/pages/admin/ServiceOperationsTab";
import { MarketplaceOperationsTab }                       from "@/pages/admin/MarketplaceOperations";

// ── Types ─────────────────────────────────────────────────────────────────────
type ErpStats = {
  portalOrdersThisMonth: number;
  activeCustomers: number;
  pendingRfqs: number;
  salesRevenueThisMonth: number;
  activeFreightShipments: number;
  inTransitShipments: number;
};

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [erpStats, setErpStats] = useState<ErpStats | null>(null);
  const [erpStatsLoading, setErpStatsLoading] = useState(false);
  const [erpStatsLastUpdated, setErpStatsLastUpdated] = useState<Date | null>(null);
  const erpDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const erpPendingEventRef = useRef<string | null>(null);

  const [pendingVendorApprovals, setPendingVendorApprovals] = useState(0);
  const [pendingPortalWorkload, setPendingPortalWorkload] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const query = new URLSearchParams(location.split("?")[1] ?? "");
    return isPortalAdmin() ? (query.get("tab") ?? "service-operations") : "claim";
  });

  useEffect(() => {
    if (!isPortalAdmin()) return;
    let cancelled = false;
    const loadPendingCount = async () => {
      try {
        const [res, workloadRes] = await Promise.all([
          fetch("/api/portal/admin/vendor-invitations", { headers: getAuthHeaders(), credentials: "include", cache: "no-store" }),
          fetch("/api/portal/admin/service-operations?limit=1&offset=0", { headers: getAuthHeaders(), credentials: "include", cache: "no-store" }),
        ]);
        if (res.ok) {
          const data = await res.json();
          const items: any[] = Array.isArray(data) ? data : (data.items ?? []);
          const count = items.filter(inv => inv.status === "accepted" && !inv.supplier_id).length;
          if (!cancelled) setPendingVendorApprovals(count);
        }
        if (workloadRes.ok) {
          const workload = await workloadRes.json();
          const count = (workload.summary ?? []).reduce((sum: number, item: { pending?: number }) => sum + Number(item.pending ?? 0), 0);
          if (!cancelled) setPendingPortalWorkload(count);
        }
      } catch { /* silent */ }
    };
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function fetchErpStats(fromEvent?: string) {
    if (!isPortalAdmin()) return;
    setErpStatsLoading(true);
    fetch("/api/portal/admin/erp-stats", { headers: getAuthHeaders(), credentials: "include" })
      .then((r) => r.ok ? r.json() as Promise<ErpStats> : null)
      .then((d) => {
        if (d) {
          setErpStats(d);
          setErpStatsLastUpdated(new Date());
          if (fromEvent) {
            const messages: Record<string, { title: string; description: string }> = {
              new_logistic_order:            { title: t("adminPage.erpEvent.newOrder", "Order baru masuk"),        description: t("adminPage.erpEvent.statsUpdated", "Statistik portal diperbarui otomatis.") },
              logistic_order_status_changed: { title: t("adminPage.erpEvent.statusChanged", "Status order berubah"),    description: t("adminPage.erpEvent.freightUpdated", "Statistik freight diperbarui otomatis.") },
              vendor_quote_received:         { title: t("adminPage.erpEvent.quoteReceived", "Quote vendor diterima"),   description: t("adminPage.erpEvent.rfqUpdated", "Data RFQ diperbarui otomatis.") },
            };
            const msg = messages[fromEvent] ?? { title: t("adminPage.erpEvent.statsRefreshed", "Statistik diperbarui"), description: t("adminPage.erpEvent.latestLoaded", "Data ERP terbaru telah dimuat.") };
            toast({ title: msg.title, description: msg.description });
          }
        }
      })
      .catch(() => {})
      .finally(() => setErpStatsLoading(false));
  }

  function scheduleFetchErpStats(eventName: string) {
    erpPendingEventRef.current = eventName;
    if (erpDebounceRef.current) clearTimeout(erpDebounceRef.current);
    erpDebounceRef.current = setTimeout(() => {
      fetchErpStats(erpPendingEventRef.current ?? undefined);
      erpPendingEventRef.current = null;
    }, 2000);
  }

  useEffect(() => {
    if (!isAuthenticated()) { setLocation("/login"); return; }
    if (!isPortalAdmin()) { setLocation("/dashboard"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchErpStats();
    if (!isPortalAdmin()) return;
    const es = new EventSource("/api/ecommerce/events");
    const STAT_EVENTS = ["new_logistic_order", "logistic_order_status_changed", "vendor_quote_received"];
    STAT_EVENTS.forEach((ev) => { es.addEventListener(ev, () => scheduleFetchErpStats(ev)); });
    return () => { es.close(); if (erpDebounceRef.current) clearTimeout(erpDebounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated()) return null;

  const isAdmin = isPortalAdmin();

  // ── Reusable sidebar button style ──────────────────────────────────────────
  const sidebarBtnCls = (value: string) => [
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
    activeTab === value
      ? "bg-amber-500/15 text-amber-400 font-semibold ring-1 ring-inset ring-amber-500/30"
      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
  ].join(" ");

  const TABS_TRIGGER_CLS =
    "justify-start gap-3 px-3 py-2.5 rounded-lg text-slate-400 " +
    "data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 data-[state=active]:font-semibold " +
    "data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-amber-500/30 " +
    "hover:bg-slate-800 hover:text-slate-200 transition-all focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-amber-400/50 text-sm font-medium w-full text-left";

  return (
    <div className="min-h-screen bg-slate-50 pb-12 selection:bg-amber-200 selection:text-amber-900">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-50 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900" />
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
        <div className="container relative mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-3 md:p-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40">
              <Shield className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{t("adminPage.header.title", "Admin Panel")}</h1>
              <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 tracking-wide">
                <span className="hidden sm:inline">PT. Cahaya Sejati Teknologi <span className="mx-2 text-slate-700">|</span> </span>COMMAND CENTER
              </p>
            </div>
            {isAdmin && (
              <div className="ml-auto flex items-center gap-2 md:gap-3 bg-slate-900/80 border border-slate-700/50 py-1.5 px-3 rounded-full shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-amber-500 uppercase">System Active</span>
              </div>
            )}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 transition-colors"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t("adminPage.nav.openMenu", "Buka menu navigasi")}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar Sheet ───────────────────────────────────────────── */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" aria-label={t("adminPage.nav.menuAriaLabel", "Menu navigasi admin")} className="p-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col [&>button]:hidden">
          <div className="px-4 pt-5 pb-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 p-2 rounded-lg">
                <Shield className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{t("adminPage.nav.commandCenter", "Command Center")}</p>
            </div>
            <SheetClose className="text-slate-500 hover:text-white transition-colors p-1 rounded">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700">
            {isAdmin && (
              <>
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">Operations</p>
                <button type="button" aria-current={activeTab === "service-operations" ? "page" : undefined}
                  onClick={() => { setActiveTab("service-operations"); setMobileNavOpen(false); }}
                  className={sidebarBtnCls("service-operations")}>
                  <Inbox className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="flex-1">Semua Layanan</span>
                  {pendingPortalWorkload > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">{pendingPortalWorkload}</span>
                  )}
                </button>
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionWebsite", "Website & Konten")}</p>
                {[
                  { value: "content",         icon: FileText,   label: t("adminPage.nav.websiteContent", "Konten Website") },
                  { value: "services",        icon: Settings,   label: t("adminPage.nav.manageServices", "Kelola Layanan") },
                  { value: "products",        icon: Box,        label: t("adminPage.nav.manageProducts", "Kelola Produk") },
                  { value: "couriers",        icon: Truck,      label: t("adminPage.nav.couriers", "Kurir") },
                  { value: "pricing",         icon: Tag,        label: t("adminPage.nav.managePricing", "Kelola Harga") },
                  { value: "armada-trucking", icon: ImageIcon,  label: t("adminPage.nav.truckingFleet", "Armada Trucking") },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button" aria-current={activeTab === value ? "page" : undefined}
                    onClick={() => { setActiveTab(value); setMobileNavOpen(false); }}
                    className={sidebarBtnCls(value)}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />{label}
                  </button>
                ))}

                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionMarketplace", "Marketplace")}</p>
                {[
                  { value: "vendor-catalog",    icon: Package,      label: t("adminPage.nav.vendorCatalog", "Katalog Vendor") },
                  { value: "marketplace-operations", icon: PackageCheck, label: "Marketplace Operations" },
                  { value: "produk-unggulan",   icon: Store,        label: t("adminPage.nav.featuredProducts", "Produk Unggulan") },
                  { value: "mini-forms",        icon: Link2,        label: t("adminPage.nav.miniForms", "Mini Form") },
                  { value: "product-templates", icon: Layers,       label: t("adminPage.nav.productTemplates", "Product Templates") },
                  { value: "vendor-marketplace",icon: ShoppingCart, label: t("adminPage.nav.vendorMarketplace", "Vendor Marketplace") },
                  { value: "master-price",      icon: DollarSign,   label: t("adminPage.nav.masterPrice", "Master Price") },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button" aria-current={activeTab === value ? "page" : undefined}
                    onClick={() => { setActiveTab(value); setMobileNavOpen(false); }}
                    className={sidebarBtnCls(value)}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />{label}
                  </button>
                ))}

                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionVendorUsers", "Vendor & Pengguna")}</p>
                <button type="button" aria-current={activeTab === "vendor-invitations" ? "page" : undefined}
                  onClick={() => { setActiveTab("vendor-invitations"); setMobileNavOpen(false); }}
                  className={sidebarBtnCls("vendor-invitations")}>
                  <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="flex-1">{t("adminPage.nav.inviteVendor", "Undang Vendor")}</span>
                  {pendingVendorApprovals > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">{pendingVendorApprovals}</span>
                  )}
                </button>
                {[
                  { value: "approvals", icon: UserCheck,     label: t("adminPage.nav.approvals", "Approvals") },
                  { value: "customers", icon: Users,         label: t("adminPage.nav.customers", "Pelanggan") },
                  { value: "wa-logs",   icon: MessageCircle, label: t("adminPage.nav.whatsapp", "WhatsApp") },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button" aria-current={activeTab === value ? "page" : undefined}
                    onClick={() => { setActiveTab(value); setMobileNavOpen(false); }}
                    className={sidebarBtnCls(value)}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />{label}
                  </button>
                ))}

                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionSystem", "Sistem")}</p>
                {[
                  { value: "bizportal-erp",   icon: Building2,  label: t("adminPage.nav.bizportalErp", "BizPortal ERP") },
                  { value: "paylabs-setting", icon: CreditCard, label: t("adminPage.nav.paylabsSetting", "Paylabs Setting") },
                  { value: "utilities",       icon: Wrench,     label: t("adminPage.nav.utilities", "Utilitas") },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button" aria-current={activeTab === value ? "page" : undefined}
                    onClick={() => { setActiveTab(value); setMobileNavOpen(false); }}
                    className={sidebarBtnCls(value)}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />{label}
                  </button>
                ))}
              </>
            )}
            <div className="mt-auto pt-4 border-t border-slate-800/80 mx-2 mb-2">
              <button type="button" aria-current={activeTab === "claim" ? "page" : undefined}
                onClick={() => { setActiveTab("claim"); setMobileNavOpen(false); }}
                className={sidebarBtnCls("claim")}>
                <Shield className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.adminActivation", "Aktivasi Admin")}
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* ── Sidebar + Content layout ───────────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-88px)]">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setMobileNavOpen(false); }} orientation="vertical" className="flex w-full">

          {/* ── Desktop sidebar ────────────────────────────────────────────── */}
          <div className="hidden md:flex md:flex-col w-56 lg:w-60 shrink-0 bg-slate-900 border-r border-slate-800 sticky top-0 h-screen overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="px-4 pt-5 pb-3 border-b border-slate-800/80">
              <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">{t("adminPage.nav.commandCenter", "Command Center")}</p>
            </div>

            <TabsList className="flex flex-col h-auto bg-transparent p-2 gap-0.5 items-stretch flex-1">
              {isAdmin && (
                <>
                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">Operations</p>
                  <TabsTrigger value="service-operations" className={TABS_TRIGGER_CLS}>
                    <Inbox className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="flex-1 text-left">Semua Layanan</span>
                    {pendingPortalWorkload > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">{pendingPortalWorkload}</span>
                    )}
                  </TabsTrigger>
                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionWebsite", "Website & Konten")}</p>
                  <TabsTrigger value="content"          className={TABS_TRIGGER_CLS}><FileText  className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.websiteContent", "Konten Website")}</TabsTrigger>
                  <TabsTrigger value="services"         className={TABS_TRIGGER_CLS}><Settings  className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.manageServices", "Kelola Layanan")}</TabsTrigger>
                  <TabsTrigger value="products"         className={TABS_TRIGGER_CLS}><Box       className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.manageProducts", "Kelola Produk")}</TabsTrigger>
                  <TabsTrigger value="couriers"         className={TABS_TRIGGER_CLS}><Truck     className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.couriers", "Kurir")}</TabsTrigger>
                  <TabsTrigger value="pricing"          className={TABS_TRIGGER_CLS}><Tag       className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.managePricing", "Kelola Harga")}</TabsTrigger>
                  <TabsTrigger value="armada-trucking"  className={TABS_TRIGGER_CLS}><ImageIcon className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.truckingFleet", "Armada Trucking")}</TabsTrigger>

                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionMarketplace", "Marketplace")}</p>
                  <TabsTrigger value="vendor-catalog"     className={TABS_TRIGGER_CLS}><Package      className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.vendorCatalog", "Katalog Vendor")}</TabsTrigger>
                  <TabsTrigger value="marketplace-operations" className={TABS_TRIGGER_CLS}><PackageCheck className="h-4 w-4 shrink-0" strokeWidth={2} />Marketplace Operations</TabsTrigger>
                  <TabsTrigger value="produk-unggulan"    className={TABS_TRIGGER_CLS}><Store        className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.featuredProducts", "Produk Unggulan")}</TabsTrigger>
                  <TabsTrigger value="mini-forms"         className={TABS_TRIGGER_CLS}><Link2        className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.miniForms", "Mini Form")}</TabsTrigger>
                  <TabsTrigger value="product-templates"  className={TABS_TRIGGER_CLS}><Layers       className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.productTemplates", "Product Templates")}</TabsTrigger>
                  <TabsTrigger value="vendor-marketplace" className={TABS_TRIGGER_CLS}><ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.vendorMarketplace", "Vendor Marketplace")}</TabsTrigger>
                  <TabsTrigger value="master-price"       className={TABS_TRIGGER_CLS}><DollarSign   className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.masterPrice", "Master Price")}</TabsTrigger>

                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionVendorUsers", "Vendor & Pengguna")}</p>
                  <TabsTrigger value="vendor-invitations" className={TABS_TRIGGER_CLS}>
                    <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="flex-1">{t("adminPage.nav.inviteVendor", "Undang Vendor")}</span>
                    {pendingVendorApprovals > 0 && (
                      <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">{pendingVendorApprovals}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approvals" className={TABS_TRIGGER_CLS}><UserCheck     className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.approvals", "Approvals")}</TabsTrigger>
                  <TabsTrigger value="customers" className={TABS_TRIGGER_CLS}><Users         className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.customers", "Pelanggan")}</TabsTrigger>
                  <TabsTrigger value="wa-logs"   className={TABS_TRIGGER_CLS}><MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.whatsapp", "WhatsApp")}</TabsTrigger>

                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest text-slate-600 uppercase select-none">{t("adminPage.nav.sectionSystem", "Sistem")}</p>
                  <TabsTrigger value="bizportal-erp"   className={TABS_TRIGGER_CLS}><Building2  className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.bizportalErp", "BizPortal ERP")}</TabsTrigger>
                  <TabsTrigger value="paylabs-setting" className={TABS_TRIGGER_CLS}><CreditCard className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.paylabsSetting", "Paylabs Setting")}</TabsTrigger>
                  <TabsTrigger value="utilities"       className={TABS_TRIGGER_CLS}><Wrench     className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.utilities", "Utilitas")}</TabsTrigger>
                </>
              )}

              <div className="mt-auto pt-4 border-t border-slate-800/80 mx-2 mb-2">
                <TabsTrigger value="claim" className={TABS_TRIGGER_CLS}>
                  <Shield className="h-4 w-4 shrink-0" strokeWidth={2} />{t("adminPage.nav.adminActivation", "Aktivasi Admin")}
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* ── Main content area ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-7xl">

              {isAdmin && (
                <>
                  <TabsContent value="service-operations">
                    <ServiceOperationsTab />
                  </TabsContent>
                  <TabsContent value="content">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adminPage.tab.websiteContent.title", "Konten Website")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.websiteContent.desc", "Edit teks yang tampil di berbagai bagian website publik.")}</CardDescription>
                      </CardHeader>
                      <CardContent><ContentTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="services">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adminPage.tab.services.title", "Kelola Layanan")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.services.desc", "Edit nama, deskripsi, harga, dan gambar untuk setiap layanan.")}</CardDescription>
                      </CardHeader>
                      <CardContent><ServicesTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="products">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adminPage.tab.products.title", "Kelola Produk")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.products.desc", "Edit nama, deskripsi, harga, dan gambar untuk setiap produk.")}</CardDescription>
                      </CardHeader>
                      <CardContent><ProductsTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="couriers">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adminPage.tab.couriers.title", "Vendor Kurir & Pengiriman")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.couriers.desc", "Kelola daftar kurir yang ditampilkan ke pelanggan saat memilih pengiriman produk.")}</CardDescription>
                      </CardHeader>
                      <CardContent><DeliveryVendorsTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("adminPage.tab.pricing.title", "Kelola Harga Trucking & Freight")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.pricing.desc", "Atur tarif trucking dan tarif freight internasional.")}</CardDescription>
                      </CardHeader>
                      <CardContent><PricingTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="mini-forms">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.miniForms.title", "Mini Form")}
                        </CardTitle>
                        <CardDescription>{t("adminPage.tab.miniForms.desc", "Buat dan kelola link form dinamis. Bagikan ke penerima — mereka cukup membuka link dan mengisi form tanpa perlu login.")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="vendor">
                          <TabsList className="mb-4">
                            <TabsTrigger value="vendor">🚛 {t("adminPage.tab.miniForms.vendor", "Vendor")}</TabsTrigger>
                            <TabsTrigger value="customer">👤 {t("adminPage.tab.miniForms.customer", "Customer")}</TabsTrigger>
                            <TabsTrigger value="admin">🔐 {t("adminPage.tab.miniForms.internal", "Internal")}</TabsTrigger>
                          </TabsList>
                          <TabsContent value="vendor"><MiniFormTab formTarget="vendor" /></TabsContent>
                          <TabsContent value="customer"><MiniFormTab formTarget="customer" /></TabsContent>
                          <TabsContent value="admin"><MiniFormTab formTarget="admin" /></TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="product-templates">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.productTemplates.title", "Product Template Engine")}
                        </CardTitle>
                        <CardDescription>{t("adminPage.tab.productTemplates.desc", "Referensi template komoditas multi-jenis — custom fields, dokumen wajib, checklist operasional, dan instruksi pengemasan per kategori barang.")}</CardDescription>
                      </CardHeader>
                      <CardContent><PortalProductTemplateEngine /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bizportal-erp">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold">{t("adminPage.erp.title", "BizPortal ERP")}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{t("adminPage.erp.subtitle", "Akses cepat ke semua modul ERP internal. Klik modul untuk membuka BizPortal.")}</p>
                        </div>
                        <a href="/bizportal/" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                          <Building2 className="h-4 w-4" />{t("adminPage.erp.openBizPortal", "Buka BizPortal")}<ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adminPage.erp.realtimeStats", "Statistik Real-time")}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {erpStatsLastUpdated && (
                            <span className="text-[11px] text-muted-foreground">
                              {t("adminPage.erp.updatedAt", "Diperbarui")} {erpStatsLastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          )}
                          <button onClick={() => fetchErpStats()} disabled={erpStatsLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                            <Loader2 className={`h-3.5 w-3.5 ${erpStatsLoading ? "animate-spin" : ""}`} />{t("adminPage.erp.refresh", "Refresh")}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { label: t("adminPage.erp.stat.portalOrders", "Order Portal (bulan ini)"), value: erpStats?.portalOrdersThisMonth,    icon: ClipboardList, color: "text-blue-600",   bg: "bg-blue-50",   href: "/bizportal/logistics/portal-orders" },
                          { label: t("adminPage.erp.stat.activeFreight", "Freight Aktif"),            value: erpStats?.activeFreightShipments,   icon: Ship,          color: "text-indigo-600", bg: "bg-indigo-50", href: "/bizportal/logistics/freight" },
                          { label: t("adminPage.erp.stat.inTransit", "Dalam Pengiriman"),             value: erpStats?.inTransitShipments,       icon: Truck,         color: "text-cyan-600",   bg: "bg-cyan-50",   href: "/bizportal/logistics/freight" },
                          { label: t("adminPage.erp.stat.pendingRfq", "RFQ Pending"),                 value: erpStats?.pendingRfqs,              icon: FileText,      color: "text-orange-600", bg: "bg-orange-50", href: "/bizportal/logistics/rfq" },
                          { label: t("adminPage.erp.stat.monthlyRevenue", "Revenue Bulan Ini"),        value: erpStats?.salesRevenueThisMonth,    icon: BarChart2,     color: "text-green-600",  bg: "bg-green-50",  href: "/bizportal/reports/sales", isRupiah: true },
                          { label: t("adminPage.erp.stat.portalCustomers", "Pelanggan Portal"),        value: erpStats?.activeCustomers,          icon: Users,         color: "text-purple-600", bg: "bg-purple-50", href: "/bizportal/portal/customers" },
                        ].map(({ label, value, isRupiah, icon: Icon, color, bg, href }) => (
                          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                            className="flex flex-col gap-2 p-4 rounded-xl border bg-white hover:shadow-md transition-all group">
                            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <div>
                              {erpStatsLoading ? (
                                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                              ) : (
                                <p className="text-xl font-bold text-gray-900">
                                  {value === undefined ? "—" : isRupiah
                                    ? new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)
                                    : value.toLocaleString("id-ID")}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {[
                        { label: t("adminPage.erp.section.dashboard", "Dashboard & Utama"),  color: "bg-slate-50 border-slate-200",   iconColor: "text-slate-600",  items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/bizportal/dashboard" }, { icon: ClipboardList, label: "Approvals", path: "/bizportal/approvals" }, { icon: Building2, label: "Holding / Grup", path: "/bizportal/holding" }] },
                        { label: t("adminPage.erp.section.logistics", "Logistik"),           color: "bg-blue-50 border-blue-200",     iconColor: "text-blue-600",   items: [{ icon: Ship, label: "Freight Shipments", path: "/bizportal/logistics/freight" }, { icon: ClipboardList, label: "Portal Orders", path: "/bizportal/logistics/portal-orders" }, { icon: Truck, label: "Drivers", path: "/bizportal/logistics/drivers" }, { icon: FileText, label: "RFQ Logistik", path: "/bizportal/logistics/rfq" }, { icon: Tag, label: "Quote Requests", path: "/bizportal/logistics/quote-requests" }, { icon: BarChart2, label: "Margin Rules", path: "/bizportal/logistics/margin-rules" }] },
                        { label: t("adminPage.erp.section.sales", "Sales"),                  color: "bg-green-50 border-green-200",   iconColor: "text-green-600",  items: [{ icon: FileText, label: "Quotations", path: "/bizportal/sales/quotations" }, { icon: ShoppingCart, label: "Sales Orders", path: "/bizportal/sales/orders" }, { icon: Receipt, label: "Invoices", path: "/bizportal/sales/documents" }, { icon: Users, label: t("adminPage.erp.portalCustomers", "Pelanggan Portal"), path: "/bizportal/portal/customers" }, { icon: Store, label: "E-commerce", path: "/bizportal/ecommerce" }, { icon: Package, label: "Portal Product Orders", path: "/bizportal/portal-product-orders" }] },
                        { label: t("adminPage.erp.section.purchase", "Purchase"),            color: "bg-orange-50 border-orange-200", iconColor: "text-orange-600", items: [{ icon: ClipboardList, label: "Purchase Requests", path: "/bizportal/purchase/pr" }, { icon: FileText, label: "RFQ Purchase", path: "/bizportal/purchase/rfq" }, { icon: ShoppingCart, label: "Purchase Orders", path: "/bizportal/purchase/orders" }, { icon: PackageCheck, label: "Goods Receipt", path: "/bizportal/purchase/gr" }, { icon: Users, label: "Vendors", path: "/bizportal/purchase/vendors" }, { icon: Receipt, label: "Bills", path: "/bizportal/purchase/bills" }] },
                        { label: t("adminPage.erp.section.accounting", "Accounting"),        color: "bg-purple-50 border-purple-200", iconColor: "text-purple-600", items: [{ icon: BookOpen, label: "Chart of Accounts", path: "/bizportal/accounting/accounts" }, { icon: FileText, label: "Journal Entries", path: "/bizportal/accounting/entries" }, { icon: Wallet, label: "Payments", path: "/bizportal/accounting/payments" }, { icon: BarChart2, label: "Trial Balance", path: "/bizportal/accounting/reports/trial-balance" }, { icon: BarChart2, label: "Profit & Loss", path: "/bizportal/accounting/reports/profit-loss" }, { icon: BarChart2, label: "Balance Sheet", path: "/bizportal/accounting/reports/balance-sheet" }] },
                        { label: t("adminPage.erp.section.expensesReports", "Expenses & Reports"), color: "bg-rose-50 border-rose-200",     iconColor: "text-rose-600",   items: [{ icon: Receipt, label: "Expense", path: "/bizportal/expense" }, { icon: BarChart2, label: t("adminPage.erp.salesReport", "Laporan Sales"), path: "/bizportal/reports/sales" }, { icon: BarChart2, label: t("adminPage.erp.purchaseReport", "Laporan Purchase"), path: "/bizportal/reports/purchase" }, { icon: BarChart2, label: "AR Aging", path: "/bizportal/reports/ar-aging" }, { icon: BarChart2, label: "AP Aging", path: "/bizportal/reports/ap-aging" }, { icon: ClipboardList, label: "Audit Log", path: "/bizportal/reports/audit-log" }] },
                        { label: t("adminPage.erp.section.others", "Lainnya"),               color: "bg-amber-50 border-amber-200",   iconColor: "text-amber-600",  items: [{ icon: Mail, label: "Correspondences", path: "/bizportal/correspondences" }, { icon: Package, label: "Trading", path: "/bizportal/trading" }, { icon: Store, label: t("adminPage.erp.unifiedCatalog", "Katalog Terpadu"), path: "/bizportal/katalog-terpadu" }, { icon: Settings, label: "Org & HR", path: "/bizportal/org" }] },
                      ].map((section) => (
                        <div key={section.label} className={`rounded-xl border p-4 ${section.color}`}>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{section.label}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {section.items.map(({ icon: Icon, label, path }) => (
                              <a key={path} href={path} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white border border-white/80 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
                                <Icon className={`h-5 w-5 ${section.iconColor} group-hover:scale-110 transition-transform`} />
                                <span className="text-xs text-center font-medium text-gray-700 leading-tight">{label}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="approvals">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.approvals.title", "Approval Vendor & Pelanggan")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.approvals.desc", "Tinjau dan setujui atau tolak permohonan akun vendor, driver, dan employee yang mendaftar melalui portal.")}</CardDescription>
                      </CardHeader>
                      <CardContent><ApprovalsTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="customers">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.customers.title", "Data Pelanggan Portal")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.customers.desc", "Daftar semua akun yang terdaftar di portal — customer, vendor, driver, dan admin.")}</CardDescription>
                      </CardHeader>
                      <CardContent><CustomersTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="wa-logs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.waLogs.title", "Log Notifikasi WhatsApp")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.waLogs.desc", "Pantau status pengiriman notifikasi WhatsApp — terkirim, gagal, atau deduplikasi — dan kirim ulang pesan yang gagal secara manual.")}</CardDescription>
                      </CardHeader>
                      <CardContent><WaLogsTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="paylabs-setting">
                    <PayLabsSettingTab />
                  </TabsContent>

                  <TabsContent value="utilities">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-amber-500" />{t("adminPage.tab.utilities.title", "Utilitas Admin")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.utilities.desc", "Alat pembersihan dan perbaikan data — jalankan hanya jika diperlukan.")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="max-w-2xl">
                          <h3 className="text-sm font-semibold mb-3">{t("adminPage.tab.utilities.fixJasaNames", "Perbaiki Nama Produk \"Jasa\"")}</h3>
                          <FixJasaNamesTool />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="vendor-invitations">
                    <VendorInvitationsTab />
                  </TabsContent>

                  <TabsContent value="vendor-catalog">
                    <VendorCatalogTab />
                  </TabsContent>
                  <TabsContent value="marketplace-operations">
                    <MarketplaceOperationsTab />
                  </TabsContent>

                  <TabsContent value="vendor-marketplace">
                    <VendorMarketplaceTab />
                  </TabsContent>

                  <TabsContent value="produk-unggulan">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-indigo-500" />{t("adminPage.tab.featuredProducts.title", "Produk Unggulan")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.featuredProducts.desc", "Kelola pengajuan, produk aktif, paket promosi, riwayat, dan verifikasi pembayaran produk unggulan vendor di marketplace.")}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ProdukUnggulanTab getAuthHeaders={getAuthHeaders} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="armada-trucking">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-orange-500" />{t("adminPage.tab.truckingFleet.title", "Gambar & Urutan Armada Trucking")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.truckingFleet.desc", "Upload gambar dan atur urutan tampil kendaraan di halaman Trucking.")}</CardDescription>
                      </CardHeader>
                      <CardContent><VehicleImagesTab /></CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="master-price">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-600" />{t("adminPage.tab.masterPrice.title", "Master Price Management")}</CardTitle>
                        <CardDescription>{t("adminPage.tab.masterPrice.desc", "Kelola harga produk marketplace secara terpusat — update satu-satu, bulk, import Excel/CSV, riwayat perubahan, dan approval harga.")}</CardDescription>
                      </CardHeader>
                      <CardContent><MasterPriceManagement /></CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}

              <TabsContent value="claim">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("adminPage.tab.claim.title", "Aktivasi Admin")}</CardTitle>
                    <CardDescription>{t("adminPage.tab.claim.desc", "Aktifkan hak akses admin menggunakan kunci rahasia.")}</CardDescription>
                  </CardHeader>
                  <CardContent><ClaimAdminTab /></CardContent>
                </Card>
              </TabsContent>

            </div> {/* /p-6 inner content wrapper */}
          </div>   {/* /flex-1 content area */}
        </Tabs>
      </div>       {/* /flex min-h sidebar+content */}
    </div>
  );
}
