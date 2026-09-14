import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import { resolveImageUrl } from "@/lib/utils";
import { VendorGallery, type GalleryImage } from "@/components/VendorGallery";
import { ContactSupplierModal } from "@/components/ContactSupplierModal";
import {
  ArrowLeft, Building2, MapPin, Package, Wrench, Star,
  CheckCircle2, Clock, Truck, Ship, Plane, FileText,
  ChevronRight, ImageOff, Globe, Mail, Phone, MessageSquare,
  Shield, Award, Zap, BadgeCheck, Info, FileCheck, Users,
  Calendar, TrendingUp, Share2, Bookmark, BookmarkCheck, SendHorizonal,
  CheckCheck, AlertCircle, RefreshCw, Images,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PublicDoc {
  id: number;
  documentType: string | null;
  documentName: string | null;
  documentNumber: string | null;
  fileUrl: string | null;
  verificationStatus: string;
  issuedAt: string | null;
  expiresAt: string | null;
}

interface VendorPublicProfile {
  vendor: {
    id: number;
    name: string;
    logo: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    companyBanner: string | null;
    descriptionPublic: string | null;
    serviceAreas: string[] | null;
    location: string | null;
    serviceType: string | null;
    country: string | null;
    isVerified: boolean;
    isPremium: boolean;
    isFeatured: boolean;
    createdAt: string;
    phone: string | null;
    contactEmail: string | null;
    vision: string | null;
    mission: string | null;
    establishedYear: number | null;
    mainMarket: string | null;
    factoryAddress: string | null;
    officeAddress: string | null;
    warehouseAddress: string | null;
    website: string | null;
  };
  company: {
    companyName: string;
    address: string | null;
    city: string | null;
    province: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    npwp: string | null;
    nib: string | null;
    bentukBadanHukum: string | null;
    tanggalTerdaftar: string | null;
    kegiatanUtama: string | null;
  } | null;
  performance: {
    totalOrders: number | null;
    completedOrders: number | null;
    ontimePercentage: number | null;
    avgResponseHours: number | null;
    averageResponseMinutes: number | null;
    customerRating: number | null;
    vendorGrade: string | null;
    score: number | null;
    rfqInvites: number;
    rfqSubmitted: number;
    rfqSelected: number;
    rfqResponseRate: number | null;
  } | null;
  productCount: number;
  serviceCount: number;
  featuredCount: number;
  legalityDocs: PublicDoc[];
  qaDocs: PublicDoc[];
}

interface CatalogItem {
  id: number;
  vendorId: number;
  vendorName: string | null;
  templateKind: string | null;
  categoryKey: string | null;
  serviceType: string | null;
  name: string;
  description: string | null;
  kategori: string | null;
  priceSell: number | null;
  currency: string;
  unit: string | null;
  moq: number | null;
  stockStatus: string | null;
  leadTime: string | null;
  location: string | null;
  origin: string | null;
  primaryImageUrl: string | null;
  resolvedCategory: string | null;
  resolvedCategoryLabel: string | null;
  isFeatured: boolean;
  hsCode?: string | null;
}

interface RawGalleryImage {
  id: number;
  vendor_catalog_item_id: number | null;
  vendor_id: number | null;
  media_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  sort_order: number;
  is_primary: boolean;
  item_name: string | null;
  template_kind: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(v: number, currency = "IDR") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
  }
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

const SERVICE_ICON: Record<string, React.ReactNode> = {
  trucking:    <Truck className="h-4 w-4" />,
  sea_freight: <Ship className="h-4 w-4" />,
  air_freight: <Plane className="h-4 w-4" />,
  ppjk:        <FileText className="h-4 w-4" />,
  handling:    <Package className="h-4 w-4" />,
  document:    <FileText className="h-4 w-4" />,
};

const STOCK_CONFIG: Record<string, { label: string; cls: string }> = {
  available:    { label: "Tersedia",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  limited:      { label: "Terbatas", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  pre_order:    { label: "Pre-Order", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  out_of_stock: { label: "Habis",    cls: "bg-red-100 text-red-700 border-red-200" },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  commodity_trader: "Commodity Trader",
  freight_forwarder: "Freight Forwarder",
  trucking: "Trucking",
  logistics: "Logistics",
  customs_broker: "Customs Broker",
  warehouse: "Warehouse",
  general: "Vendor",
};

const SERVICE_TYPE_BUSINESS: Record<string, string[]> = {
  commodity_trader: ["Exporter", "Importer", "Trading Company"],
  freight_forwarder: ["Freight Forwarder"],
  trucking: ["Trucking"],
  logistics: ["Logistics Provider"],
  customs_broker: ["Customs Broker"],
  warehouse: ["Warehouse & Logistics"],
  general: [],
};

const LEGALITY_LABEL: Record<string, string> = {
  akta_perusahaan: "Akta Pendirian Perusahaan", akta: "Akta Perusahaan",
  company_deed: "Company Deed", nib: "NIB",
  npwp: "NPWP", sk_kemenkumham: "SK Kemenkumham",
  sk_menkumham: "SK Kemenkumham", export_license: "Export License",
  import_license: "Import License", siup: "SIUP", tdp: "TDP",
  iso: "ISO Certificate", iso_9001: "ISO 9001", iso_14001: "ISO 14001",
  iso_22000: "ISO 22000", halal: "Halal Certificate", halal_certificate: "Halal",
  fda: "FDA Certificate", haccp: "HACCP", gmp: "GMP", bpom: "BPOM",
  other_license: "License", certificate: "Certificate",
};

const QA_LABEL: Record<string, string> = {
  coa: "Certificate of Analysis (COA)", certificate_of_analysis: "COA",
  sgs: "SGS Certificate", sgs_certificate: "SGS",
  inspection: "Inspection Report", inspection_report: "Inspection Report",
  factory_audit: "Factory Audit", factory_audit_report: "Factory Audit Report",
  pre_shipment_inspection: "Pre-Shipment Inspection", psi: "PSI",
  quality_control: "Quality Control Report", qc_report: "QC Report",
  packaging_inspection: "Packaging Inspection",
  shipment_inspection: "Shipment Inspection",
  survey_report: "Survey Report",
};

function docLabel(doc: PublicDoc, map: Record<string, string>) {
  return doc.documentName || map[(doc.documentType ?? "").toLowerCase()] || doc.documentType || "Dokumen";
}

function whatsappUrl(phone: string, name: string) {
  const p = phone.replace(/\D/g, "").replace(/^0/, "62");
  const msg = encodeURIComponent(`Halo ${name}, saya ingin menghubungi tentang produk/layanan Anda.`);
  return `https://wa.me/${p}?text=${msg}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <span className="text-sky-500">{icon}</span>
        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <p className="text-[12px] text-slate-400 italic flex items-center gap-1.5">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />{text}
    </p>
  );
}

// ── Trust Badges ───────────────────────────────────────────────────────────────

interface TrustBadge { key: string; label: string; icon: React.ReactNode; cls: string; }

function computeTrustBadges(profile: VendorPublicProfile): TrustBadge[] {
  const { vendor, performance, legalityDocs } = profile;
  const badges: TrustBadge[] = [];

  if (vendor.isVerified) {
    badges.push({ key: "verified", label: "Verified Supplier", icon: <BadgeCheck className="h-3.5 w-3.5" />, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" });
  }
  if (vendor.isPremium) {
    badges.push({ key: "premium", label: "Premium Supplier", icon: <Award className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-700 border-amber-200" });
  }
  if (performance && (performance.ontimePercentage ?? 0) >= 90) {
    badges.push({ key: "top_response", label: "Top Response", icon: <TrendingUp className="h-3.5 w-3.5" />, cls: "bg-sky-50 text-sky-700 border-sky-200" });
  }
  if (performance && (performance.averageResponseMinutes ?? 0) > 0 && (performance.averageResponseMinutes ?? 999) <= 60) {
    badges.push({ key: "fast_rfq", label: "Fast RFQ", icon: <Zap className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-700 border-violet-200" });
  }
  if (performance && (performance.customerRating ?? 0) >= 4) {
    badges.push({ key: "high_rated", label: "High Rated", icon: <Star className="h-3.5 w-3.5 fill-current" />, cls: "bg-amber-50 text-amber-600 border-amber-200" });
  }
  const hasExportDoc = legalityDocs.some((d) => ["export_license", "iso", "iso_9001", "iso_22000", "haccp", "gmp", "fda"].includes((d.documentType ?? "").toLowerCase()));
  const isExportType = ["commodity_trader", "freight_forwarder"].includes(vendor.serviceType ?? "");
  if (hasExportDoc || isExportType) {
    badges.push({ key: "export_ready", label: "Export Ready", icon: <Globe className="h-3.5 w-3.5" />, cls: "bg-indigo-50 text-indigo-700 border-indigo-200" });
  }

  return badges;
}

// ── Item Card ──────────────────────────────────────────────────────────────────

function ItemCard({ item, onClick }: { item: CatalogItem; onClick: () => void }) {
  const { t } = useLanguage();
  const isService = item.templateKind === "service";
  const stock = item.stockStatus ? STOCK_CONFIG[item.stockStatus] : null;
  const catIcon = item.resolvedCategory ? SERVICE_ICON[item.resolvedCategory] : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group overflow-hidden"
    >
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {item.primaryImageUrl ? (
          <img
            src={resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isService
              ? <div className="text-slate-300">{catIcon ?? <Wrench className="h-10 w-10" />}</div>
              : <ImageOff className="h-10 w-10 text-slate-300" />}
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white">{t("vendor.profil.featured")}</span>
        )}
        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isService ? "bg-sky-100 text-sky-700 border-sky-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
          {isService ? (item.resolvedCategoryLabel ?? "Layanan") : t("vendor.profil.productLabel")}
        </span>
      </div>
      <div className="p-3.5 space-y-2">
        <p className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">{item.name}</p>
        {item.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div>
            {item.priceSell != null
              ? <p className="text-[13px] font-extrabold text-sky-600">{fmtCurrency(item.priceSell, item.currency)}{item.unit ? <span className="text-[11px] font-normal text-slate-400"> / {item.unit}</span> : null}</p>
              : <p className="text-[12px] text-slate-400 italic">{t("vendor.profil.priceNegotiable")}</p>}
          </div>
          {stock && (
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full shrink-0 ${stock.cls}`}>{stock.label}</span>
          )}
        </div>
        {item.location && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />{item.location}
          </p>
        )}
      </div>
      <div className="px-3.5 pb-3 flex items-center justify-between">
        {item.hsCode && (
          <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
            HS {item.hsCode}
          </span>
        )}
        <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-1 group-hover:gap-2 transition-all ml-auto">
          {isService ? "Lihat Detail & Estimasi" : "Lihat Produk"}<ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-36 bg-gradient-to-r from-slate-200 to-slate-300" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-12 pb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-6 bg-slate-200 rounded w-48" />
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 bg-slate-200 rounded-full w-24" />
                <div className="h-5 bg-slate-200 rounded-full w-20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="h-40 bg-slate-200 rounded-2xl" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

// ── InfoRow ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, empty, icon }: {
  label: string;
  value: string | number | null | undefined;
  empty?: string;
  icon?: React.ReactNode;
}) {
  if (!empty && (value == null || value === "")) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      {value != null && value !== "" ? (
        <span className="text-[13px] text-slate-700 font-medium flex items-center gap-1">
          {icon}{String(value)}
        </span>
      ) : (
        <span className="text-[12px] text-slate-400 italic">{empty}</span>
      )}
    </div>
  );
}

// ── DocRow ────────────────────────────────────────────────────────────────────

function DocRow({ doc, labelMap }: { doc: PublicDoc; labelMap: Record<string, string> }) {
  const label = docLabel(doc, labelMap);
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-700">{label}</p>
        {doc.documentNumber && <p className="text-[11px] text-slate-400">{doc.documentNumber}</p>}
        {doc.issuedAt && <p className="text-[11px] text-slate-400">Berlaku: {doc.issuedAt}</p>}
      </div>
      {doc.fileUrl && (
        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
          className="text-[11px] font-semibold text-sky-600 flex items-center gap-0.5 hover:underline shrink-0">
          <FileText className="h-3 w-3" />Lihat
        </a>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

type TabKey = "all" | "product" | "service";

const GRADE_COLOR: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-sky-500", C: "bg-amber-500", D: "bg-red-500",
};

export default function VendorProfilPage() {
  const { t } = useLanguage();
  const { vendorId } = useParams<{ vendorId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tab, setTab] = useState<TabKey>("all");
  const [contactOpen, setContactOpen] = useState(false);

  // Bookmark optimistic state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  const vendorIdNum = useMemo(() => parseInt(vendorId ?? "", 10), [vendorId]);
  const isAuth = isAuthenticated();

  // ── Queries ──────────────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: loadingProfile,
    isError: errorProfile,
    refetch: refetchProfile,
  } = useQuery<VendorPublicProfile>({
    queryKey: ["vendor-public-profile", vendorIdNum],
    queryFn: async () => {
      const r = await fetch(`/api/portal/vendors/${vendorIdNum}/public-profile`);
      if (!r.ok) throw new Error("not_found");
      return r.json();
    },
    enabled: !isNaN(vendorIdNum),
    staleTime: 5 * 60 * 1000,
  });

  const { data: items = [], isLoading: loadingItems } = useQuery<CatalogItem[]>({
    queryKey: ["vendor-catalog-public", vendorIdNum],
    queryFn: async () => {
      const r = await fetch(`/api/portal/marketplace?vendorId=${vendorIdNum}`);
      if (!r.ok) throw new Error("gagal");
      return r.json();
    },
    enabled: !isNaN(vendorIdNum),
    staleTime: 2 * 60 * 1000,
  });

  const { data: bookmarkData } = useQuery<{ bookmarked: boolean }>({
    queryKey: ["vendor-bookmark", vendorIdNum],
    queryFn: async () => {
      const r = await fetch(`/api/portal/vendors/${vendorIdNum}/bookmark`, {
        credentials: "include",
      });
      if (!r.ok) return { bookmarked: false };
      return r.json();
    },
    enabled: !isNaN(vendorIdNum) && isAuth,
    staleTime: 5 * 60 * 1000,
  });

  // Sync bookmark state from server
  useEffect(() => {
    setIsBookmarked(bookmarkData?.bookmarked ?? false);
  }, [bookmarkData]);

  const { data: galleryRaw = [] } = useQuery<RawGalleryImage[]>({
    queryKey: ["vendor-gallery", vendorIdNum],
    queryFn: async () => {
      const r = await fetch(`/api/portal/vendors/${vendorIdNum}/gallery`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !isNaN(vendorIdNum),
    staleTime: 10 * 60 * 1000,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    window.history.length > 1 ? window.history.back() : setLocation("/marketplace");
  }, [setLocation]);

  const handleItemClick = useCallback((item: CatalogItem) => {
    if (item.templateKind === "service") {
      setLocation(`/jasa/vendor/${item.id}`);
    } else {
      setLocation(`/marketplace/${item.id}`);
    }
  }, [setLocation]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: profile?.vendor.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({ title: t("vendor.profil.linkCopied"), description: t("vendor.profil.linkCopiedDesc") });
      });
    }
  }, [profile?.vendor.name, toast]);

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated()) {
      toast({
        title: t("vendor.profil.loginRequired"),
        description: t("vendor.profil.loginRequiredDesc"),
        variant: "destructive",
      });
      return;
    }
    const next = !isBookmarked;
    setIsBookmarked(next); // optimistic
    setIsBookmarkLoading(true);
    try {
      const method = next ? "POST" : "DELETE";
      const r = await fetch(`/api/portal/vendors/${vendorIdNum}/bookmark`, {
        method,
        credentials: "include",
      });
      if (!r.ok) {
        setIsBookmarked(!next); // rollback
        toast({ title: t("vendor.profil.bookmarkFailed"), description: t("vendor.profil.bookmarkFailed"), variant: "destructive" });
      } else {
        toast({
          title: next ? t("vendor.profil.saved") : t("vendor.profil.removed"),
          description: next
            ? t("vendor.profil.bookmarkSaved")
            : t("vendor.profil.bookmarkRemoved"),
        });
      }
    } catch {
      setIsBookmarked(!next); // rollback
      toast({ title: t("vendor.profil.networkError"), description: t("vendor.profil.bookmarkFailed"), variant: "destructive" });
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [isBookmarked, vendorIdNum, toast]);

  // ── Computed — must stay above early returns (Rules of Hooks) ─────────────────

  const { filteredItems, productCount, serviceCount } = useMemo(() => {
    const productCount = items.filter((i) => i.templateKind === "product").length;
    const serviceCount = items.filter((i) => i.templateKind === "service").length;
    const filteredItems = tab === "all" ? items : items.filter((i) => i.templateKind === tab);
    return { filteredItems, productCount, serviceCount };
  }, [items, tab]);

  const galleryImages = useMemo<GalleryImage[]>(() =>
    galleryRaw
      .filter((g) => !!g.file_url)
      .map((g) => ({
        id: g.id,
        fileUrl: g.file_url,
        thumbnailUrl: g.thumbnail_url,
        title: g.title,
        description: g.description,
        itemName: g.item_name,
        templateKind: g.template_kind,
        isPrimary: g.is_primary,
      })),
    [galleryRaw]
  );

  const trustBadges = useMemo(() => (profile ? computeTrustBadges(profile) : []), [profile]);

  // ── Early states ──────────────────────────────────────────────────────────────

  if (loadingProfile) return <ProfileSkeleton />;

  if (errorProfile || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-slate-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-1">{t("vendor.profil.notFound")}</h2>
          <p className="text-[13px] text-slate-500">{t("vendor.profil.notFoundDesc")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />{t("vendor.profil.back")}
          </Button>
          <Button className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white" onClick={() => refetchProfile()}>
            <RefreshCw className="h-4 w-4 mr-2" />{t("vendor.profil.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const { vendor, company, performance, legalityDocs, qaDocs, featuredCount } = profile;
  const perf = performance;

  const typeLabel = vendor.serviceType ? (SERVICE_TYPE_LABELS[vendor.serviceType] ?? vendor.serviceType) : "Vendor";
  const businessTypes = vendor.serviceType ? (SERVICE_TYPE_BUSINESS[vendor.serviceType] ?? []) : [];

  // Contact details
  const vendorPhone = vendor.phone ?? company?.phone ?? null;
  const vendorEmail = vendor.contactEmail ?? company?.email ?? null;
  const vendorWebsite = vendor.website ?? company?.website ?? null;
  const vendorAddress = vendor.officeAddress ?? vendor.location ?? (company ? [company.address, company.city, company.province].filter(Boolean).join(", ") : null) ?? null;

  // Founded year: vendor.establishedYear > company tanggalTerdaftar > vendor createdAt year
  const foundedYear = vendor.establishedYear
    ? String(vendor.establishedYear)
    : company?.tanggalTerdaftar
      ? (company.tanggalTerdaftar.length >= 4 ? company.tanggalTerdaftar.slice(0, 4) : company.tanggalTerdaftar)
      : new Date(vendor.createdAt).getFullYear().toString();

  // Service areas / main markets
  const markets: string[] = vendor.mainMarket
    ? [vendor.mainMarket]
    : Array.isArray(vendor.serviceAreas) && vendor.serviceAreas.length > 0
      ? vendor.serviceAreas
      : [];

  // RFQ stats
  const rfqResponseRate = perf?.rfqResponseRate ?? null;
  const avgResponseTime = perf?.averageResponseMinutes != null && perf.averageResponseMinutes > 0
    ? perf.averageResponseMinutes < 60
      ? `${Math.round(perf.averageResponseMinutes)} menit`
      : `${(perf.averageResponseMinutes / 60).toFixed(1)} jam`
    : null;

  // Shipping methods derived from service type
  const shippingMethods: string[] = (() => {
    const st = vendor.serviceType ?? "";
    const methods: string[] = [];
    if (["freight_forwarder", "logistics", "commodity_trader"].includes(st)) methods.push("Sea Freight", "Air Freight", "Courier");
    if (["trucking", "logistics"].includes(st)) methods.push("Trucking");
    return methods;
  })();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0B3D6B 0%, #1260A8 60%, #1E6ED4 100%)",
        paddingTop: "clamp(20px,3vw,36px)",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 mb-5 text-[12px] font-semibold rounded-lg px-3 py-1.5"
            style={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.20)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />Kembali
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-10">

        {/* ── Vendor card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 md:p-7 mb-4">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-3xl shrink-0 border-2 border-white shadow-md">
              {vendor.logoUrl
                ? <img src={resolveImageUrl(vendor.logoUrl) ?? vendor.logoUrl} alt="" loading="lazy" className="w-full h-full rounded-2xl object-cover" />
                : vendor.logo && vendor.logo.length <= 4
                  ? <span>{vendor.logo}</span>
                  : <Building2 className="h-8 w-8 text-sky-400" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-[20px] md:text-[24px] font-black text-slate-900 leading-tight">{vendor.name}</h1>
                {perf?.vendorGrade && (
                  <span className={`text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full ${GRADE_COLOR[perf.vendorGrade] ?? "bg-slate-500"}`}>
                    Grade {perf.vendorGrade}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 font-medium mb-2">{typeLabel}</p>
              <div className="flex flex-wrap gap-3">
                {vendorAddress && (
                  <span className="text-[12px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />{vendorAddress}
                  </span>
                )}
                {vendor.country && (
                  <span className="text-[12px] text-slate-500 flex items-center gap-1">
                    🌏 {vendor.country}
                  </span>
                )}
              </div>
            </div>

            {/* Share & Bookmark */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-colors"
                title="Bagikan profil"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleBookmark}
                disabled={isBookmarkLoading}
                className={`p-2 rounded-xl border transition-colors ${
                  isBookmarked
                    ? "border-amber-300 text-amber-500 bg-amber-50"
                    : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300"
                } ${isBookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isBookmarked ? "Hapus bookmark" : "Simpan vendor"}
              >
                {isBookmarked
                  ? <BookmarkCheck className="h-4 w-4" />
                  : <Bookmark className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile share/bookmark */}
          <div className="flex sm:hidden gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-500 hover:text-sky-500 hover:border-sky-300 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />Bagikan
            </button>
            <button
              onClick={handleBookmark}
              disabled={isBookmarkLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[12px] font-semibold transition-colors ${
                isBookmarked
                  ? "border-amber-300 text-amber-500 bg-amber-50"
                  : "border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-300"
              }`}
            >
              {isBookmarked
                ? <><BookmarkCheck className="h-3.5 w-3.5" />{t("vendor.profil.bookmarkSavedLabel")}</>
                : <><Bookmark className="h-3.5 w-3.5" />{t("vendor.profil.bookmarkSaveLabel")}</>}
            </button>
          </div>

          {/* Trust badges */}
          {trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {trustBadges.map((b) => (
                <span key={b.key} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${b.cls}`}>
                  {b.icon}{b.label}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-[22px] font-black text-sky-600">{productCount + serviceCount}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Total Katalog</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className="text-[22px] font-black text-emerald-600">{productCount}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Produk</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <p className={`text-[22px] font-black ${featuredCount > 0 ? "text-amber-500" : "text-slate-400"}`}>
                {featuredCount}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{t("vendor.profil.featured")}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              {perf?.customerRating != null && perf.customerRating > 0 ? (
                <p className="text-[22px] font-black text-amber-500 flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  {Number(perf.customerRating).toFixed(1)}
                </p>
              ) : (
                <p className="text-[22px] font-black text-slate-300">—</p>
              )}
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Rating</p>
            </div>
          </div>

          {/* Performance row */}
          {perf && (perf.totalOrders != null || perf.ontimePercentage != null || rfqResponseRate != null || avgResponseTime) && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4">
              {perf.totalOrders != null && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[12px] text-slate-600 font-semibold">
                    {perf.completedOrders ?? 0} / {perf.totalOrders} order selesai
                  </span>
                </div>
              )}
              {perf.ontimePercentage != null && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span className="text-[12px] text-slate-600 font-semibold">
                    {Number(perf.ontimePercentage).toFixed(0)}% on-time
                  </span>
                </div>
              )}
              {rfqResponseRate != null && (
                <div className="flex items-center gap-1.5">
                  <CheckCheck className="h-4 w-4 text-violet-500" />
                  <span className="text-[12px] text-slate-600 font-semibold">
                    {rfqResponseRate}% RFQ response rate
                  </span>
                </div>
              )}
              {avgResponseTime && (
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-[12px] text-slate-600 font-semibold">
                    Respon rata-rata {avgResponseTime}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Company Banner ───────────────────────────────────────────────── */}
        {vendor.companyBanner && (
          <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <img src={resolveImageUrl(vendor.companyBanner) ?? vendor.companyBanner} alt={`${vendor.name} banner`}
              className="w-full h-40 md:h-56 object-cover" />
          </div>
        )}

        {/* ── Company Overview ─────────────────────────────────────────────── */}
        <SectionCard title="Company Overview" icon={<Info className="h-4 w-4" />}>
          {vendor.descriptionPublic ? (
            <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line mb-4">{vendor.descriptionPublic}</p>
          ) : (
            <EmptySection text="Deskripsi perusahaan belum tersedia." />
          )}
          {(vendor.vision || vendor.mission) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              {vendor.vision && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vision</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{vendor.vision}</p>
                </div>
              )}
              {vendor.mission && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mission</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{vendor.mission}</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Company Information ───────────────────────────────────────────── */}
        <SectionCard title="Company Information" icon={<Building2 className="h-4 w-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Company Name" value={company?.companyName ?? vendor.name} />
            {businessTypes.length > 0 && (
              <InfoRow label="Business Type" value={businessTypes.join(", ")} />
            )}
            <InfoRow
              label="Founded Year"
              value={foundedYear}
              icon={<Calendar className="h-3.5 w-3.5 text-slate-400" />}
            />
            {markets.length > 0 && (
              <InfoRow
                label="Main Market"
                value={markets.join(", ")}
                icon={<Globe className="h-3.5 w-3.5 text-slate-400" />}
              />
            )}
            {company?.kegiatanUtama && (
              <InfoRow label="Kegiatan Utama" value={company.kegiatanUtama} />
            )}
            {vendorPhone && (
              <InfoRow
                label="Phone"
                value={vendorPhone}
                icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
              />
            )}

            {/* Website */}
            {vendorWebsite && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</span>
                <a
                  href={vendorWebsite.startsWith("http") ? vendorWebsite : `https://${vendorWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />{vendorWebsite}
                </a>
              </div>
            )}

            {/* Email */}
            {vendorEmail && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                <a
                  href={`mailto:${vendorEmail}`}
                  className="text-[13px] text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />{vendorEmail}
                </a>
              </div>
            )}

            {/* Phone */}
            <InfoRow
              label="Phone"
              value={vendorPhone}
              empty="Belum tersedia"
              icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
            />
            {/* Office Address */}
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Address</span>
              {vendorAddress ? (
                <p className="text-[13px] text-slate-700 font-medium flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />{vendorAddress}
                </p>
              ) : <span className="text-[12px] text-slate-400 italic">Belum tersedia</span>}
            </div>
            {vendor.factoryAddress && (
              <div className="sm:col-span-2 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factory / Production Address</span>
                <p className="text-[13px] text-slate-700 font-medium flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />{vendor.factoryAddress}
                </p>
              </div>
            )}
            {vendor.warehouseAddress && (
              <div className="sm:col-span-2 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warehouse Address</span>
                <p className="text-[13px] text-slate-700 font-medium flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />{vendor.warehouseAddress}
                </p>
              </div>
            )}
          </div>
          {!company && !vendorPhone && !vendorEmail && (
            <EmptySection text="Informasi perusahaan belum tersedia." />
          )}
        </SectionCard>

        {/* ── Company Legality ──────────────────────────────────────────────── */}
        <SectionCard title="Company Legality" icon={<Shield className="h-4 w-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-4">
            {company?.bentukBadanHukum && <InfoRow label="Bentuk Badan Hukum" value={company.bentukBadanHukum} />}
            {company?.nib && <InfoRow label="NIB" value={company.nib} />}
            {company?.npwp && <InfoRow label="NPWP" value={company.npwp} />}
            {company?.tanggalTerdaftar && <InfoRow label="Tanggal Terdaftar" value={company.tanggalTerdaftar} />}
          </div>
          {legalityDocs.length > 0 ? (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen Terverifikasi</p>
              {legalityDocs.map((doc) => (
                <DocRow key={doc.id} doc={doc} labelMap={LEGALITY_LABEL} />
              ))}
            </div>
          ) : (
            !company?.bentukBadanHukum && !company?.nib && !company?.npwp && (
              <EmptySection text="Dokumen legalitas belum tersedia." />
            )
          )}
        </SectionCard>

        {/* ── Quality Assurance ─────────────────────────────────────────────── */}
        <SectionCard title="Quality Assurance" icon={<FileCheck className="h-4 w-4" />}>
          {qaDocs.length > 0 ? (
            <div className="space-y-2">
              {qaDocs.map((doc) => (
                <DocRow key={doc.id} doc={doc} labelMap={QA_LABEL} />
              ))}
            </div>
          ) : (
            <EmptySection text="Dokumen quality assurance belum tersedia." />
          )}
        </SectionCard>

        {/* ── Export Capability ─────────────────────────────────────────────── */}
        {(markets.length > 0 || shippingMethods.length > 0) && (
          <SectionCard title="Export Capability" icon={<Globe className="h-4 w-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {markets.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Export Countries</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {markets.map((m) => (
                      <span key={m} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {shippingMethods.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Method</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {shippingMethods.map((m) => (
                      <span key={m} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── Gallery ───────────────────────────────────────────────────────── */}
        {galleryImages.length > 0 && (
          <SectionCard title="Gallery" icon={<Images className="h-4 w-4" />}>
            <VendorGallery images={galleryImages} />
          </SectionCard>
        )}

        {/* ── Contact Supplier ──────────────────────────────────────────────── */}
        <SectionCard title="Contact Supplier" icon={<SendHorizonal className="h-4 w-4" />}>
          <div className="flex flex-wrap gap-3">
            {/* Contact Form button */}
            <Button
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[13px] gap-2"
              onClick={() => setContactOpen(true)}
            >
              <SendHorizonal className="h-4 w-4" />Contact Supplier
            </Button>

            {/* RFQ */}
            <Button
              variant="outline"
              className="rounded-xl font-bold text-[13px] gap-2 border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600"
              onClick={() => setLocation(`/rfq/new?vendorId=${vendor.id}`)}
            >
              <FileText className="h-4 w-4" />Request Quotation (RFQ)
            </Button>

            {/* WhatsApp */}
            {vendorPhone && (
              <a href={whatsappUrl(vendorPhone, vendor.name)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl font-bold text-[13px] gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <MessageSquare className="h-4 w-4" />WhatsApp
                </Button>
              </a>
            )}

            {/* Email */}
            {vendorEmail && (
              <a href={`mailto:${vendorEmail}?subject=Inquiry - ${vendor.name}`}>
                <Button variant="outline" className="rounded-xl font-bold text-[13px] gap-2">
                  <Mail className="h-4 w-4" />Email
                </Button>
              </a>
            )}

            {/* Phone */}
            {vendorPhone && (
              <a href={`tel:${vendorPhone}`}>
                <Button variant="outline" className="rounded-xl font-bold text-[13px] gap-2">
                  <Phone className="h-4 w-4" />Call
                </Button>
              </a>
            )}
          </div>
        </SectionCard>

        {/* ── Tab filter ─────────────────────────────────────────────────────── */}
        {productCount > 0 && serviceCount > 0 && (
          <div className="flex gap-2 mb-5 mt-2">
            {(([
              { key: "all",     label: `Semua (${items.length})` },
              { key: "product", label: `Produk (${productCount})` },
              { key: "service", label: `Layanan (${serviceCount})` },
            ]) as { key: TabKey; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                  tab === key
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Section title ──────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {tab === "service"
              ? <Wrench className="h-4 w-4 text-sky-500" />
              : tab === "product"
                ? <Package className="h-4 w-4 text-emerald-500" />
                : <Building2 className="h-4 w-4 text-slate-400" />}
            <h2 className="text-[15px] font-black text-slate-800">
              {tab === "service" ? "Layanan Jasa" : tab === "product" ? "Katalog Produk" : "Semua Katalog"}
            </h2>
            <Badge variant="secondary" className="text-[11px]">{filteredItems.length} item</Badge>
          </div>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {loadingItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <ImageOff className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-slate-500">Belum ada katalog tersedia</p>
            <p className="text-[12px] text-slate-400 mt-1">Vendor ini belum menambahkan produk atau layanan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Contact Supplier Modal ─────────────────────────────────────────── */}
      <ContactSupplierModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        vendorId={vendorIdNum}
        vendorName={vendor.name}
      />
    </div>
  );
}

