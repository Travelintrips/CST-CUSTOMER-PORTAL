import { useState, useEffect, useCallback } from "react";
import { COMPANY_CONFIG } from "@/config/company";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";
import {
  Plane, Ship, Layers, ClipboardList, FileText, Truck,
  MapPin, Package, Building2, Globe, Search, ChevronRight,
  ArrowRight, Clock, Users, Warehouse, Plus, X,
  MessageSquare, PhoneCall, BookOpen, Calculator, FileCheck,
  ShieldCheck, CheckCircle2, Network,
} from "lucide-react";
import { useListPortalServices } from "@shared/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resolveImageUrl } from "@/lib/utils";
import { getServiceFallbackImage } from "@/lib/categoryImages";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateServiceName } from "@/i18n/serviceData";
import {
  type ServiceHubItem,
  type CanonicalPortalService,
  CATEGORY_PLACEHOLDER,
  SERVICE_PHOTOS,
  CAT_PHOTOS,
  formatIDR,
  normalizeCanonicalService,
  canonicalServiceTarget,
} from "@/lib/jasa-shared";
import PageSeo from "@/components/PageSeo";

import { staticAsset, CUSTOMER_ASSETS } from "@/lib/staticAssets";

const BUNDLE_PHOTOS: Record<string, string> = {
  "Full Forwarding":         staticAsset("images/air-freight.png"),
  "Sea Freight Bundle":      staticAsset("images/sea-freight.png"),
  "Warehousing+Distribusi":  staticAsset("images/banner-trucking-container.png"),
};

interface SubService {
  serviceCode: string;
  title: string;
  titleId: string;
  titleKey?: string;
  desc: string;
  descKey?: string;
  href?: string;
  icon: React.ElementType;
  eta: string;
  categoryKeys: string[];
  subItems?: string[];
  subItemKeys?: string[];
}

type ResolvedServiceCard = Omit<SubService, "href"> & {
  href: string;
  master: CanonicalPortalService;
};

interface MainCategory {
  id: string;
  title: string;
  titleKey?: string;
  subtitle: string;
  subtitleKey?: string;
  icon: React.ElementType;
  gradient: string;
  lightBg: string;
  textColor: string;
  badgeCls: string;
  accentColor: string;
  services: SubService[];
}

const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "forwarding",
    title: "Forwarding",
    titleKey: "servicesMenu.groupForwarding",
    subtitle: "Layanan pengiriman kargo internasional & domestik",
    subtitleKey: "servicesMenu.groupForwardingSubtitle",
    icon: Ship,
    gradient: "from-blue-600 to-sky-500",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700",
    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
    accentColor: "#0369a1",
    services: [
      { serviceCode: "sea_freight", title: "Sea Freight", titleId: "Kargo Laut", desc: "Pengiriman kargo via laut FCL & LCL.", href: "/ocean-freight-booking", icon: Ship, eta: "7–30 hari", categoryKeys: ["sea_freight"] },
      { serviceCode: "air_freight", title: "Air Freight", titleId: "Kargo Udara", desc: "Pengiriman kargo ekspres via udara.", href: "/air-freight-booking", icon: Plane, eta: "1–3 hari", categoryKeys: ["air_freight"] },
      { serviceCode: "trucking", title: "Transportasi & Distribusi Domestik", titleId: "Transportasi & Distribusi Dalam Negeri", desc: "Transportasi penumpang serta distribusi barang domestik dengan pilihan mobil penumpang hingga armada kargo.", href: "/trucking", icon: Truck, eta: "Sesuai rute", categoryKeys: ["trucking"] },
    ],
  },
  {
    id: "ppjk",
    title: "PPJK / Konsultan Pabean",
    titleKey: "servicesMenu.groupPpjk",
    subtitle: "Pengurusan kepabeanan & konsultasi prosedur impor ekspor",
    subtitleKey: "servicesMenu.groupPpjkSubtitle",
    icon: ClipboardList,
    gradient: "from-orange-600 to-amber-500",
    lightBg: "bg-orange-50",
    textColor: "text-orange-700",
    badgeCls: "bg-orange-100 text-orange-700 border-orange-200",
    accentColor: "#b45309",
    services: [
      { serviceCode: "customs_clearance", title: "Custom Clearance Proses", titleId: "Proses Bea Cukai", desc: "Pengurusan proses kepabeanan impor dan ekspor.", href: "/custom-clearance", icon: FileCheck, eta: "1–3 hari kerja", categoryKeys: ["ppjk"] },
      { serviceCode: "ppjk_consulting", title: "Konsultan Pabean", titleId: "Konsultasi Kepabeanan", desc: "Konsultasi dan pendampingan prosedur kepabeanan.", href: "/pabean", icon: BookOpen, eta: "Sesuai kebutuhan", categoryKeys: ["ppjk"] },
    ],
  },
  {
    id: "additional",
    title: "Layanan Logistik Tambahan",
    subtitle: "Handling, pelabuhan, storage, EMKL, dan proteksi kargo",
    icon: Package,
    gradient: "from-emerald-600 to-teal-500",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accentColor: "#047857",
    services: [
      { serviceCode: "handling", title: "Handling", titleId: "Handling", desc: "Penanganan kargo di titik operasional.", icon: Package, eta: "Sesuai kebutuhan", categoryKeys: ["handling"] },
      { serviceCode: "port_charges", title: "Port Charges", titleId: "Port Charges", desc: "Pengelolaan biaya operasional pelabuhan.", icon: Building2, eta: "Sesuai kebutuhan", categoryKeys: ["additional", "document"] },
      { serviceCode: "storage_demurrage", title: "Storage / Demurrage", titleId: "Storage / Demurrage", desc: "Penyimpanan dan kebutuhan storage/demurrage.", icon: Warehouse, eta: "Sesuai kebutuhan", categoryKeys: ["storage", "handling"] },
      { serviceCode: "emkl", title: "EMKL", titleId: "EMKL", desc: "Ekspedisi Muatan Kapal Laut dan koordinasi operasional.", icon: Ship, eta: "Sesuai kebutuhan", categoryKeys: ["sea_freight", "exim_service"] },
      { serviceCode: "cargo_insurance", title: "Asuransi Kargo", titleId: "Asuransi Kargo", desc: "Proteksi risiko kargo selama pengiriman.", icon: ShieldCheck, eta: "Sesuai kebutuhan", categoryKeys: ["additional"] },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const stripJasa = (name: string) => name.replace(/^Jasa\s+/i, "");

// ── Realtime hook ─────────────────────────────────────────────────────────────

function useServicesRealtime(queryKey: string) {
  const qc = useQueryClient();

  const handleChange = useCallback(() => {
    qc.invalidateQueries({ queryKey: [queryKey] });
  }, [qc, queryKey]);

  const handleCatalogChange = useCallback((payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
    const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
    const isService = row["template_kind"] === "service" || row["kind"] === "service" || !!row["service_type"] || !!row["serviceType"];
    if (!isService) return;
    qc.invalidateQueries({ queryKey: [queryKey] });
  }, [qc, queryKey]);

  useEffect(() => {
    if (!supabase) return;
    const ch1 = supabase.channel("portal-services-jasa-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, handleChange)
      .subscribe();
    const ch2 = supabase.channel("portal-services-jasa-catalog-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vendor_catalog_items" }, handleCatalogChange)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vendor_catalog_items" }, handleCatalogChange)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "vendor_catalog_items" }, handleCatalogChange)
      .subscribe();
    return () => {
      supabase!.removeChannel(ch1);
      supabase!.removeChannel(ch2);
    };
  }, [handleChange, handleCatalogChange]);
}

// ── Vendor item card ──────────────────────────────────────────────────────────

function VendorItemCard({ item }: { item: ServiceHubItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { t } = useLanguage();
  const catKey = item.categoryKey ?? item.serviceType ?? "";
  const cat = catKey ? CATEGORY_PLACEHOLDER[catKey] : undefined;
  const src = item.primaryImageUrl
    ? (resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl)
    : (item.imageUrl ? resolveImageUrl(item.imageUrl) : null);
  const fallback = getServiceFallbackImage(item.categories ?? (item.category ? [item.category] : []), item.title);
  const imgSrc = (src && !imgFailed) ? src : fallback;

  return (
    <Link href={item.targetUrl} className="block group">
      <div
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      >
        <div className="relative h-36 overflow-hidden bg-slate-100">
          {(src && !imgFailed) ? (
            <img src={imgSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={() => setImgFailed(true)} loading="lazy" />
          ) : cat ? (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}>
              <span className="text-4xl drop-shadow">{cat.emoji}</span>
            </div>
          ) : (
            <img src={fallback} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-sky-700 shadow-sm">
            {item.source === "vendor_catalog_item" ? t("jasa.vendorBadge") : t("jasa.internalBadge")}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-1 gap-1.5">
          {item.vendorName && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />{item.vendorName}
            </p>
          )}
          <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">{item.title}</h3>
          {item.description && <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>}
          <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              {item.price != null
                ? <span className="text-[13px] font-extrabold text-sky-700">{item.currency === "USD" ? `$${item.price.toLocaleString("en-US")}` : formatIDR(item.price)}</span>
                : <span className="text-[11px] text-slate-400 italic">{t("jasa.priceNego")}</span>
              }
              {item.unit && <span className="text-[10px] text-slate-400 ml-1">/ {item.unit}</span>}
            </div>
            <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">{t("jasa.detail")} <ChevronRight className="h-3 w-3" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Mode = "mandiri" | "borongan";

export default function Jasa() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("mandiri");
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const { locale, t } = useLanguage();
  const qc = useQueryClient();

  useServicesRealtime("listPortalServicesJasa");

  useEffect(() => {
    document.title = `Jasa & Layanan Logistik — ${COMPANY_CONFIG.brandName}`;
    return () => { document.title = COMPANY_CONFIG.brandName; };
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("price_sync", () => {
      qc.invalidateQueries({ queryKey: ["listPortalServicesJasa"] });
      qc.invalidateQueries({ queryKey: ["jasaMarketplace"] });
    });
    return () => es.close();
  }, [qc]);

  const { data: marketplaceRaw, isLoading: mktLoading } = useQuery<unknown[]>({
    queryKey: ["jasaMarketplace"],
    queryFn: async () => {
      const res = await fetch("/api/portal/marketplace?kind=service");
      if (!res.ok) throw new Error("Gagal memuat marketplace");
      return res.json();
    },
    staleTime: 30_000,
  });

  const { data: servicesRaw, isLoading: svcLoading } = useListPortalServices({
    query: { queryKey: ["listPortalServicesJasa"], staleTime: 0, gcTime: 0, refetchOnWindowFocus: true },
  });

  const isLoading = mktLoading || svcLoading;

  const vendorItems: ServiceHubItem[] = (Array.isArray(marketplaceRaw) ? marketplaceRaw : []).map((raw: unknown) => {
    const r = raw as Record<string, unknown>;
    const resolvedLabel = (r["resolvedCategoryLabel"] as string | null) ?? (r["kategori"] as string | null) ?? (r["categoryKey"] as string | null) ?? "";
    return {
      source:         "vendor_catalog_item",
      id:             r["id"] as number,
      title:          r["name"] as string,
      category:       resolvedLabel,
      serviceType:    (r["serviceType"] as string | null) ?? null,
      price:          (r["priceSell"] as number | null) ?? null,
      unit:           (r["unit"] as string | null) ?? null,
      targetUrl:      `/jasa/vendor/${r["id"]}`,
      description:    (r["description"] as string | null) ?? null,
      vendorName:     (r["vendorName"] as string | null) ?? null,
      location:       (r["location"] as string | null) ?? null,
      leadTime:       (r["leadTime"] as string | null) ?? null,
      currency:       (r["currency"] as string) ?? "IDR",
      categoryKey:    (r["categoryKey"] as string | null) ?? null,
      primaryImageUrl:(r["primaryImageUrl"] as string | null) ?? null,
    };
  });

  const canonicalServices: CanonicalPortalService[] = (Array.isArray(servicesRaw) ? servicesRaw : [])
    .map(normalizeCanonicalService)
    .filter((service): service is CanonicalPortalService => Boolean(service?.isActive));
  const canonicalByCode = new Map(canonicalServices.map((service) => [service.code, service]));
  const presentedServiceCodes = new Set(
    MAIN_CATEGORIES.flatMap((category) => category.services.map((service) => service.serviceCode)),
  );

  const dedupById = (items: ServiceHubItem[]) => {
    const seen = new Set<number>();
    return items.filter((i) => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
  };

  // Vendor offers are separate from the canonical CST service master.
  const allItems = dedupById(vendorItems);

  function serviceCardsForCategory(cat: MainCategory) {
    const q = searchQuery.trim().toLowerCase();
    const configured = cat.services
      .map((presentation): ResolvedServiceCard | null => {
        const master = canonicalByCode.get(presentation.serviceCode);
        if (!master) return null;
        return {
          ...presentation,
          title: master.name,
          desc: master.description ?? presentation.desc,
          eta: master.estimatedDays ?? "Sesuai kebutuhan",
          href: presentation.href ?? canonicalServiceTarget(master),
          master,
        };
      })
      .filter((card): card is NonNullable<typeof card> => Boolean(card));

    const automatic = cat.id === "additional"
      ? canonicalServices
          .filter((master) => !presentedServiceCodes.has(master.code))
          .map((master): ResolvedServiceCard => ({
            serviceCode: master.code,
            title: master.name,
            titleId: master.name,
            desc: master.description ?? `Layanan ${master.name}`,
            href: canonicalServiceTarget(master),
            icon: Package,
            eta: master.estimatedDays ?? "Sesuai kebutuhan",
            categoryKeys: [master.category ?? master.code],
            master,
          }))
      : [];

    return [...configured, ...automatic].filter((card) => {
      if (!q) return true;
      const haystack = `${card.title} ${card.desc} ${card.master.category ?? ""} ${card.master.code}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  const matchSearch = (item: ServiceHubItem) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      translateServiceName(item.title, locale).toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  };

  function getItemsForCategory(cat: MainCategory): ServiceHubItem[] {
    return allItems.filter((item) => {
      if (!matchSearch(item)) return false;
      const itemKeys = [item.categoryKey, item.serviceType, ...(item.categories ?? [item.category])].filter(Boolean) as string[];
      return cat.services.some((s) => s.categoryKeys.some((ck) => itemKeys.some((ik) => ik.toLowerCase().includes(ck.toLowerCase()) || ck.toLowerCase().includes(ik.toLowerCase()))));
    });
  }

  const totalVendorOffers = allItems.length;
  const totalVendorItems = allItems.filter(matchSearch).length;
  const totalCanonicalItems = MAIN_CATEGORIES.reduce((sum, cat) => sum + serviceCardsForCategory(cat).length, 0);
  const totalSearchResults = totalVendorItems + totalCanonicalItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageSeo path="/jasa" />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — Full-bleed photo background                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 440,
          transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Background photo */}
        {/* Bg: local fallback behind, Supabase Storage on top */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${CUSTOMER_ASSETS.portOperations}')`,
            transform: "scale(1.04)",
            filter: "brightness(0.45) saturate(1.1)",
          }}
        />

        {/* Gradient overlays — left dark for readability, soft vignette bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Subtle top-left radial glow (brand accent) */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-80px", left: "-80px", width: 460, height: 460,
            background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-12 md:pb-16">

          {/* Back button */}
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
            className="inline-flex items-center gap-2 mb-8 text-[12px] font-semibold px-4 py-2 rounded-full text-white/75 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
          >
            ← {t("jasa.backBtn", "Kembali")}
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-10">

            {/* Left — headline */}
            <div className="flex-1 min-w-0">
              {/* Brand accent line + label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-0.5 w-8 bg-sky-400 rounded-full" />
                <span className="text-sky-400 text-[11px] font-bold uppercase tracking-[0.18em]">CST Logistic · PT Cahaya Sejati Teknologi</span>
              </div>

              <h1 className="text-3xl md:text-[2.6rem] font-black text-white leading-[1.15] mb-4 tracking-tight">
                {t("jasa.heroTitle1", "Solusi Logistik")}{" "}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#38bdf8,#7dd3fc)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  {t("jasa.heroTitleAccent", "Terpercaya")}
                </span>
                <br />{t("jasa.heroTitle2", "untuk Bisnis Anda")}
              </h1>

              <p className="text-white/55 text-[14px] mb-8 leading-relaxed max-w-md">
                {t("jasa.heroSubtitle", "Freight forwarding, kepabeanan, transportasi penumpang, distribusi barang, dan layanan logistik tambahan dalam satu portal.")}
              </p>

              {/* Trust stats */}
              <div className="flex items-center gap-6 mb-9">
                {[
                  { val: String(canonicalServices.length || "—"), label: "Layanan Aktif" },
                  { val: String(MAIN_CATEGORIES.length), label: "Kategori Utama" },
                  { val: String(totalVendorOffers || "—"), label: "Penawaran Vendor" },
                ].map(({ val, label }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {i > 0 && <div className="w-px h-8 bg-white/20" />}
                    <div>
                      <p className="text-[22px] font-black text-white leading-none">{val}</p>
                      <p className="text-white/45 text-[11px] mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode toggle — premium glass style */}
              <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 gap-1 shadow-lg">
                {([
                  ["mandiri", t("jasa.modeIndividual", "Item Mandiri"), t("jasa.modeIndividualSub", "Pilih per layanan")],
                  ["borongan", t("jasa.modeBulk", "Paket Borongan"), t("jasa.modeBulkSub", "Solusi kontrak")],
                ] as const).map(([id, label, sub]) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`flex flex-col items-start px-5 py-3 rounded-xl transition-all duration-200 text-left ${
                      mode === id
                        ? "bg-white text-slate-900 shadow-md"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="text-[13px] font-bold">{label}</span>
                    <span className={`text-[11px] ${mode === id ? "text-slate-500" : "text-white/45"}`}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right — trust badges column */}
            <div className="hidden md:flex flex-col gap-3 shrink-0 w-52">
              {[
                { icon: ShieldCheck, text: "Layanan Kepabeanan", sub: "PPJK, customs clearance & konsultasi" },
                { icon: CheckCircle2, text: "Master Layanan Aktif", sub: "Dikelola dari katalog layanan CST" },
                { icon: Network, text: "Marketplace Vendor", sub: "Penawaran vendor tampil per kategori" },
              ].map(({ icon: Icon, text, sub }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-white text-[12px] font-bold leading-tight">{text}</p>
                    <p className="text-white/45 text-[10px]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Mobile trust badges (hidden on md+) ─────────────────────────── */}
      <div className="md:hidden bg-slate-900 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto scrollbar-none">
          {[
            { icon: ShieldCheck, text: "Kepabeanan", sub: "PPJK & customs clearance" },
            { icon: CheckCircle2, text: "Layanan Aktif", sub: "Katalog CST" },
            { icon: Network, text: "Vendor", sub: "Penawaran marketplace" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div>
                <p className="text-white text-[11px] font-bold leading-tight whitespace-nowrap">{text}</p>
                <p className="text-white/40 text-[10px] whitespace-nowrap">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BODY                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-24">

        {mode === "mandiri" ? (
          <>
            {/* ── Search bar ────────────────────────────────────────────────── */}
            <div
              className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 -mt-6 relative z-10"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                <Input
                  placeholder={t("jasa.searchPlaceholder", "Cari layanan, misal: air freight, trucking, pabean...")}
                  className="pl-10 pr-10 h-11 border-0 bg-slate-50 focus-visible:ring-1 focus-visible:ring-sky-300 rounded-xl text-[14px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-slate-400 mt-2 px-1">
                  {totalSearchResults} {t("jasa.searchResultCount", "layanan ditemukan untuk")} "<span className="font-semibold text-slate-600">{searchQuery}</span>"
                </p>
              )}
            </div>

            {/* ── Category sections ─────────────────────────────────────────── */}
            <div className="space-y-14 mt-10">
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = activeCatId === cat.id;
                const vendorMatches = getItemsForCategory(cat);
                const serviceCards = serviceCardsForCategory(cat);
                const catPhoto = CAT_PHOTOS[cat.id];

                if (!isLoading && serviceCards.length === 0 && vendorMatches.length === 0) return null;

                return (
                  <section key={cat.id}>

                    {/* ── Category banner with real photo ─────────────────── */}
                    <Link href={`/services/${cat.id}`}>
                    <div className="relative h-28 md:h-32 rounded-2xl overflow-hidden mb-6 shadow-md cursor-pointer group/banner">
                      {catPhoto ? (
                        <img
                          src={catPhoto}
                          alt={cat.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-500"
                          style={{ filter: "brightness(0.48) saturate(1.1)" }}
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient}`} />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="relative z-10 h-full flex items-center justify-between px-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                            {(() => { const CatIcon = cat.icon; return <CatIcon className="h-6 w-6 text-white" />; })()}
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight">{cat.titleKey ? t(cat.titleKey) : cat.title}</h2>
                            <p className="text-white/55 text-xs mt-0.5">{cat.subtitleKey ? t(cat.subtitleKey) : cat.subtitle}</p>
                          </div>
                        </div>
                        <span className="shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-white/70 group-hover/banner:text-white group-hover/banner:gap-2.5 transition-all">
                          {t("jasa.viewAll")} <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>

                      {/* Bottom shimmer line */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    </Link>

                    {/* ── Service cards with real photo thumbnails ─────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                      {serviceCards.map((svc) => {
                        const SvcIcon = svc.icon;
                        const photo = SERVICE_PHOTOS[svc.title];

                        return (
                          <Link key={svc.master.code} href={svc.href}>
                            <div
                              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-transparent flex flex-col h-full"
                              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                            >
                              {/* Photo area */}
                              <div className="relative h-44 overflow-hidden bg-slate-900">
                                {photo ? (
                                  <img
                                    src={photo}
                                    alt={svc.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                                    style={{ filter: "brightness(0.7) saturate(1.05)" }}
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-br ${cat.gradient} opacity-80`} />
                                )}

                                {/* Gradient from bottom — text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* ETA badge */}
                                <div className="absolute top-3 right-3">
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />{svc.eta}
                                  </span>
                                </div>

                                {/* Bottom overlay — title */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2.5 shadow-md`}>
                                    <SvcIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <h3 className="text-white font-extrabold text-[15px] leading-tight tracking-tight">{svc.title}</h3>
                                </div>
                              </div>

                              {/* Body */}
                              <div className="p-4 flex flex-col flex-1 gap-3">
                                <p className="text-[12.5px] text-slate-500 leading-relaxed">{svc.desc}</p>

                                {(svc.subItemKeys || svc.subItems) && (svc.subItemKeys || svc.subItems || []).length > 0 && (
                                  <ul className="space-y-1.5 border-t border-slate-100 pt-3 mt-1">
                                    {(svc.subItemKeys ? svc.subItemKeys.map(k => t(k)) : svc.subItems ?? []).map((item) => (
                                      <li key={item} className="flex items-start gap-2 text-[11.5px] text-slate-600">
                                        <ChevronRight className={`h-3 w-3 shrink-0 mt-0.5 ${cat.textColor}`} />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <div className={`flex items-center gap-1.5 text-[12px] font-bold ${cat.textColor} group-hover:gap-3 transition-all mt-auto pt-2 border-t border-slate-100`}>
                                  {t("jasa.mulairequest")} <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* ── Vendor items for this category ────────────────────── */}
                    {isLoading && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                            <div className="h-36 bg-slate-200" />
                            <div className="p-4 space-y-2">
                              <div className="h-3 bg-slate-200 rounded w-2/3" />
                              <div className="h-4 bg-slate-200 rounded w-full" />
                              <div className="h-3 bg-slate-100 rounded w-4/5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isLoading && vendorMatches.length > 0 && (
                      <div>
                        <button
                          onClick={() => setActiveCatId(isActive ? null : cat.id)}
                          className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-slate-800 mb-4 group"
                        >
                          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:border-slate-300 group-hover:shadow-sm transition-all text-[12px]">
                            {isActive ? "▲" : "▼"} {vendorMatches.length} {t("jasa.vendorOffersAvailable")}
                          </span>
                        </button>
                        {isActive && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {vendorMatches.map((item) => (
                              <VendorItemCard key={`${item.source}-${item.id}`} item={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-b border-slate-100 mt-10" />
                  </section>
                );
              })}
            </div>

          </>
        ) : (

          /* ═══════════════════════════════════════════════════════════════ */
          /* PAKET BORONGAN — premium photo tiles                           */
          /* ═══════════════════════════════════════════════════════════════ */
          <div className="mt-8">

            {/* Hero strip */}
            <div className="relative h-52 rounded-3xl overflow-hidden mb-8 shadow-xl">
              <img
                src={CUSTOMER_ASSETS.portOperations}
                alt="Paket Borongan"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(0.35) saturate(1.1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/70 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-center px-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-0.5 w-6 bg-sky-400 rounded-full" />
                  <span className="text-sky-400 text-[11px] font-bold uppercase tracking-widest">{t("jasa.bulkSubLabel")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">{t("jasa.bulkTitle")}</h2>
                <p className="text-white/55 text-sm max-w-md leading-relaxed">
                  {t("jasa.bulkDesc")}
                </p>
              </div>
            </div>

            {/* Feature tiles with photos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { icon: Globe,   title: t("jasa.bulkFullForwardingTitle"), photoKey: "Full Forwarding",   descKey: "jasa.bulkFullForwardingDesc" },
                { icon: Ship,    title: t("jasa.bulkSeaFreightBundleTitle"), photoKey: "Sea Freight Bundle", descKey: "jasa.bulkSeaFreightBundleDesc" },
                { icon: Package, title: t("jasa.bulkWarehouseTitle"), photoKey: "Warehousing+Distribusi", descKey: "jasa.bulkWarehouseDesc" },
              ].map(({ icon: Icon, title, photoKey, descKey }) => {
                const photo = BUNDLE_PHOTOS[photoKey];
                return (
                  <Link key={title} href="/contact">
                  <div className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {/* Photo */}
                    <div className="relative h-36 overflow-hidden">
                      {photo ? (
                        <img
                          src={photo}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          style={{ filter: "brightness(0.45) saturate(1.05)" }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-700 to-sky-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg mb-1.5">
                          <Icon className="h-4.5 w-4.5 text-white" />
                        </div>
                        <p className="text-white font-extrabold text-[13px] leading-tight">{title}</p>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 bg-white flex items-center justify-between gap-2">
                      <p className="text-[12px] text-slate-500 leading-relaxed">{t(descKey)}</p>
                      <ChevronRight className="h-4 w-4 text-sky-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <p className="text-slate-500 text-sm leading-relaxed mb-2">
                {t("jasa.bulkCtaTeamWill")}
              </p>
              <p className="text-xs text-slate-400 mb-6">{t("jasa.bulkCtaFreeConsult")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/service-cart">
                  <Button className="gap-2.5 bg-sky-600 hover:bg-sky-700 shadow-md px-6 h-11 text-[13px] font-bold">
                    <Plus className="h-4 w-4" /> {t("jasa.bulkSubmitBtn")}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="gap-2.5 px-6 h-11 text-[13px] font-semibold border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                    <MessageSquare className="h-4 w-4" /> {t("jasa.bulkConsultBtn")}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
