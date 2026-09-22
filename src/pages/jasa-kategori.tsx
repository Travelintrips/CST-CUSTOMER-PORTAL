import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  Ship, Plane, Truck, ClipboardList, FileCheck, BookOpen,
  ChevronRight, Search, SlidersHorizontal, ArrowUpDown,
  ArrowUp, ArrowDown, Building2, Clock, Star, Filter, X,
  Package, Warehouse, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resolveImageUrl } from "@/lib/utils";
import { staticAsset } from "@/lib/staticAssets";
import { getServiceFallbackImage } from "@/lib/categoryImages";
import { useListPortalServices } from "@shared/api-client-react";
import { useLanguage } from "@/i18n/LanguageContext";
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

interface SubService {
  serviceCode: string;
  title: string;
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

interface CategoryDef {
  id: string;
  title: string;
  titleKey?: string;
  subtitle: string;
  subtitleKey?: string;
  icon: React.ElementType;
  gradient: string;
  lightBg: string;
  textColor: string;
  accentColor: string;
  services: SubService[];
}

const CATEGORIES: CategoryDef[] = [
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
      { serviceCode: "sea_freight", title: "Sea Freight", desc: "Pengiriman kargo via laut FCL & LCL.", href: "/ocean-freight-booking", icon: Ship, eta: "7–30 hari", categoryKeys: ["sea_freight"] },
      { serviceCode: "air_freight", title: "Air Freight", desc: "Pengiriman kargo ekspres via udara.", href: "/air-freight-booking", icon: Plane, eta: "1–3 hari", categoryKeys: ["air_freight"] },
      { serviceCode: "trucking", title: "Domestik", desc: "Distribusi kargo antar kota dan antar pulau.", href: "/trucking", icon: Truck, eta: "1–5 hari", categoryKeys: ["trucking"] },
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
      { serviceCode: "customs_clearance", title: "Custom Clearance Proses", desc: "Pengurusan proses kepabeanan impor dan ekspor.", href: "/custom-clearance", icon: FileCheck, eta: "1–3 hari kerja", categoryKeys: ["ppjk"] },
      { serviceCode: "ppjk_consulting", title: "Konsultan Pabean", desc: "Konsultasi dan pendampingan prosedur kepabeanan.", href: "/pabean", icon: BookOpen, eta: "Sesuai kebutuhan", categoryKeys: ["ppjk"] },
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
      { serviceCode: "handling", title: "Handling", desc: "Penanganan kargo di titik operasional.", icon: Package, eta: "Sesuai kebutuhan", categoryKeys: ["handling"] },
      { serviceCode: "port_charges", title: "Port Charges", desc: "Pengelolaan biaya operasional pelabuhan.", icon: Building2, eta: "Sesuai kebutuhan", categoryKeys: ["additional", "document"] },
      { serviceCode: "storage_demurrage", title: "Storage / Demurrage", desc: "Penyimpanan dan kebutuhan storage/demurrage.", icon: Warehouse, eta: "Sesuai kebutuhan", categoryKeys: ["storage", "handling"] },
      { serviceCode: "emkl", title: "EMKL", desc: "Ekspedisi Muatan Kapal Laut dan koordinasi operasional.", icon: Ship, eta: "Sesuai kebutuhan", categoryKeys: ["sea_freight", "exim_service"] },
      { serviceCode: "cargo_insurance", title: "Asuransi Kargo", desc: "Proteksi risiko kargo selama pengiriman.", icon: ShieldCheck, eta: "Sesuai kebutuhan", categoryKeys: ["additional"] },
    ],
  },
]

type SortMode = "default" | "price_asc" | "price_desc";

// ── Vendor Item Card ───────────────────────────────────────────────────────────

function VendorItemCard({ item, accentColor }: { item: ServiceHubItem; accentColor: string }) {
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
    <Link href={item.targetUrl} className="block group h-full">
      <div
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      >
        <div className="relative h-40 overflow-hidden bg-slate-100 shrink-0">
          {(src && !imgFailed) ? (
            <img
              src={imgSrc}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImgFailed(true)}
              loading="lazy"
            />
          ) : cat ? (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}>
              <span className="text-5xl drop-shadow">{cat.emoji}</span>
            </div>
          ) : (
            <img src={fallback} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-700 shadow-sm border border-slate-100">
            {item.source === "vendor_catalog_item" ? t("jasa.vendorBadge") : t("jasa.internalBadge")}
          </span>
          {item.leadTime && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />{item.leadTime}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-1.5">
          {item.vendorName && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />{item.vendorName}
            </p>
          )}
          <h3 className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">{item.title}</h3>
          {item.description && (
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
          {item.location && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
              {item.location}
            </p>
          )}
          <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              {item.price != null ? (
                <span className="text-[13px] font-extrabold" style={{ color: accentColor }}>
                  {item.currency === "USD" ? `$${item.price.toLocaleString("en-US")}` : formatIDR(item.price)}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 italic">{t("jasa.priceNego")}</span>
              )}
              {item.unit && <span className="text-[10px] text-slate-400 ml-1">/ {item.unit}</span>}
            </div>
            <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-0.5 group-hover:gap-1.5 transition-all whitespace-nowrap">
              {t("jasa.detail")} <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function JasaKategori() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useLanguage();

  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const CatIcon = cat?.icon ?? Ship;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [activeSubFilter, setActiveSubFilter] = useState<string>("semua");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [categoryId]);

  const { data: marketplaceRaw, isLoading: mktLoading } = useQuery<unknown[]>({
    queryKey: ["jasaKategoriMarketplace"],
    queryFn: async () => {
      const res = await fetch("/api/portal/marketplace?kind=service");
      if (!res.ok) throw new Error("Gagal memuat marketplace");
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: servicesRaw, isLoading: svcLoading } = useListPortalServices({
    query: { queryKey: ["listPortalServicesKategori"], staleTime: 60_000 },
  });

  const isLoading = mktLoading || svcLoading;

  const vendorItems: ServiceHubItem[] = (Array.isArray(marketplaceRaw) ? marketplaceRaw : []).map((raw: unknown) => {
    const r = raw as Record<string, unknown>;
    const resolvedLabel = (r["resolvedCategoryLabel"] as string | null) ?? (r["kategori"] as string | null) ?? (r["categoryKey"] as string | null) ?? "";
    return {
      source: "vendor_catalog_item",
      id: r["id"] as number,
      title: r["name"] as string,
      category: resolvedLabel,
      serviceType: (r["serviceType"] as string | null) ?? null,
      price: (r["priceSell"] as number | null) ?? null,
      unit: (r["unit"] as string | null) ?? null,
      targetUrl: `/jasa/vendor/${r["id"]}`,
      description: (r["description"] as string | null) ?? null,
      vendorName: (r["vendorName"] as string | null) ?? null,
      location: (r["location"] as string | null) ?? null,
      leadTime: (r["leadTime"] as string | null) ?? null,
      currency: (r["currency"] as string) ?? "IDR",
      categoryKey: (r["categoryKey"] as string | null) ?? null,
      primaryImageUrl: (r["primaryImageUrl"] as string | null) ?? null,
    };
  });

  const canonicalServices: CanonicalPortalService[] = (Array.isArray(servicesRaw) ? servicesRaw : [])
    .map(normalizeCanonicalService)
    .filter((service): service is CanonicalPortalService => Boolean(service?.isActive));
  const canonicalByCode = new Map(canonicalServices.map((service) => [service.code, service]));
  const serviceCards = (cat?.services ?? [])
    .map((presentation) => {
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

  // Marketplace/vendor offers are not the CST service master.
  const allItems = vendorItems;

  const categoryKeys = cat?.services.flatMap((s) => s.categoryKeys) ?? [];

  const filteredByCat = allItems.filter((item) => {
    const itemKeys = [item.categoryKey, item.serviceType, ...(item.categories ?? [item.category])].filter(Boolean) as string[];
    return categoryKeys.some((ck) =>
      itemKeys.some((ik) => ik.toLowerCase().includes(ck.toLowerCase()) || ck.toLowerCase().includes(ik.toLowerCase()))
    );
  });

  const subOptions = ["semua", ...Array.from(new Set(filteredByCat.map((i) => i.serviceType ?? i.category).filter(Boolean)))];

  const filtered = filteredByCat.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q) || (item.vendorName ?? "").toLowerCase().includes(q);
    const matchSub = activeSubFilter === "semua" || (item.serviceType ?? item.category) === activeSubFilter;
    return matchSearch && matchSub;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    }
    if (sort === "price_desc") {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return b.price - a.price;
    }
    return 0;
  });

  const heroBg = CAT_PHOTOS[categoryId ?? ""] ?? staticAsset("images/port-operations.webp");

  if (!cat) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 text-lg">{t("jasa.categoryNotFound")}</p>
        <Link href="/jasa">
          <Button variant="outline">← {t("jasa.backToServices")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <img
          src={heroBg}
          alt={cat.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.38) saturate(1.1)" }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-60`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="relative z-10 container px-4 md:px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-white/55 mb-6">
            <Link href="/" className="hover:text-white transition-colors">{t("jasa.breadcrumbHome")}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/jasa" className="hover:text-white transition-colors">{t("jasa.breadcrumbServices")}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">{cat.titleKey ? t(cat.titleKey) : cat.title}</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-2xl border border-white/20`}>
              <CatIcon className="h-7 w-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/15 text-white border-white/25 text-[11px] font-semibold backdrop-blur-sm">
                  {serviceCards.length} {t("jasa.categoryServicesCount")}
                </Badge>
                {filteredByCat.length > 0 && (
                  <Badge className="bg-white/15 text-white border-white/25 text-[11px] backdrop-blur-sm">
                    {filteredByCat.length} {t("jasa.categoryVendorCount")}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight mb-2">
                {cat.titleKey ? t(cat.titleKey) : cat.title}
              </h1>
              <p className="text-white/70 text-sm md:text-base max-w-xl">{cat.subtitleKey ? t(cat.subtitleKey) : cat.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-10 space-y-12">

        {/* ── Sub-service cards ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${cat.gradient}`} />
            <h2 className="text-[18px] font-black text-slate-800">{t("jasa.pickService")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCards.map((svc) => {
              const SvcIcon = svc.icon;
              const photo = SERVICE_PHOTOS[svc.title];
              const displayTitle = svc.title;
              const displayDesc = svc.desc;
              return (
                <Link key={svc.master.code} href={svc.href}>
                  <div
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col h-full"
                    style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                  >
                    {/* Photo */}
                    <div className="relative h-44 overflow-hidden bg-slate-900 shrink-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={displayTitle}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                          style={{ filter: "brightness(0.65) saturate(1.05)" }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${cat.gradient} opacity-80`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* ETA badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />{svc.eta}
                        </span>
                      </div>

                      {/* Bottom overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2.5 shadow-md`}>
                          <SvcIcon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-white font-extrabold text-[15px] leading-tight tracking-tight">{displayTitle}</h3>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <p className="text-[12.5px] text-slate-500 leading-relaxed">{displayDesc}</p>
                      {(svc.subItemKeys ?? svc.subItems) && (svc.subItemKeys ?? svc.subItems ?? []).length > 0 && (
                        <ul className="space-y-1.5 border-t border-slate-100 pt-3 mt-1">
                          {(svc.subItemKeys ? svc.subItemKeys.map((k) => t(k)) : svc.subItems ?? []).map((item) => (
                            <li key={item} className={`flex items-start gap-2 text-[11.5px] ${cat.textColor}`}>
                              <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />{item}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className={`flex items-center gap-1.5 text-[12px] font-bold ${cat.textColor} group-hover:gap-3 transition-all mt-auto pt-2 border-t border-slate-100`}>
                        {t("jasa.mulairequest")} <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Vendor marketplace ──────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${cat.gradient}`} />
              <div>
                <h2 className="text-[18px] font-black text-slate-800">
                  {t("jasa.vendorOffers")}
                  {!isLoading && (
                    <span className="ml-2 text-[13px] font-semibold text-slate-400">({sorted.length})</span>
                  )}
                </h2>
                <p className="text-[12px] text-slate-400">{t("jasa.vendorOffersDesc")}</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all self-start sm:self-auto"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("jasa.filterAndSort")}
              {(sort !== "default" || activeSubFilter !== "semua" || search) && (
                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 space-y-4 shadow-sm">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t("jasa.searchVendorPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 focus:border-sky-400 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("jasa.sortPrice")}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "default" as SortMode, labelKey: "jasa.sortDefault", icon: ArrowUpDown },
                    { id: "price_asc" as SortMode, labelKey: "jasa.sortCheapest", icon: ArrowUp },
                    { id: "price_desc" as SortMode, labelKey: "jasa.sortMostExpensive", icon: ArrowDown },
                  ] as const).map(({ id, labelKey, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSort(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                        sort === id
                          ? "bg-sky-50 border-sky-300 text-sky-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-3 w-3" />{t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-type filter */}
              {subOptions.length > 2 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("jasa.serviceType")}</p>
                  <div className="flex flex-wrap gap-2">
                    {subOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setActiveSubFilter(opt)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all capitalize ${
                          activeSubFilter === opt
                            ? "text-white border-transparent"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        style={activeSubFilter === opt ? { background: cat.accentColor } : {}}
                      >
                        {opt === "semua" ? t("jasa.all") : opt.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              {(sort !== "default" || activeSubFilter !== "semua" || search) && (
                <button
                  onClick={() => { setSort("default"); setActiveSubFilter("semua"); setSearch(""); }}
                  className="text-[12px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> {t("jasa.resetAllFilter")}
                </button>
              )}
            </div>
          )}

          {/* Items grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sorted.map((item) => (
                <VendorItemCard key={`${item.source}-${item.id}`} item={item} accentColor={cat.accentColor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mx-auto mb-4 opacity-30`}>
                <CatIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-[15px] font-semibold text-slate-600 mb-1">
                {search || activeSubFilter !== "semua" ? t("jasa.noResults") : t("jasa.noVendorOffers")}
              </p>
              <p className="text-[13px] text-slate-400">
                {search || activeSubFilter !== "semua"
                  ? t("jasa.tryChangeFilter")
                  : t("jasa.contactUsOffer")}
              </p>
              {(search || activeSubFilter !== "semua") && (
                <button
                  onClick={() => { setSearch(""); setActiveSubFilter("semua"); }}
                  className="mt-4 text-[12px] text-sky-600 hover:text-sky-800 font-semibold"
                >
                  {t("jasa.resetFilter")}
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── CTA strip ───────────────────────────────────────────────────── */}
        <section
          className={`rounded-3xl p-8 md:p-10 bg-gradient-to-br ${cat.gradient} text-white text-center`}
        >
          <Star className="h-8 w-8 mx-auto mb-3 opacity-70" />
          <h3 className="text-xl md:text-2xl font-black mb-2">{t("jasa.notFoundTitle")}</h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            {t("jasa.notFoundDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jasa">
              <Button variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-xl h-11 px-6">
                ← {t("jasa.allServices")}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-slate-900 hover:bg-white/90 rounded-xl h-11 px-6 font-bold">
                {t("jasa.registerAndRequest")}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
