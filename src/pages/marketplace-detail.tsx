import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProductTranslation } from "@/hooks/useProductTranslation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Building2, Package, Truck, MapPin, Clock,
  Tag, Box, FileText, CheckCircle2, AlertCircle, Info,
  MessageSquare, Loader2, Calendar, Images, Play, Link2,
  Share2, Copy, Check, Layers, Globe, Navigation, Weight,
  Anchor, Wind, ClipboardList, Star, Mountain, Leaf,
  Award, TrendingUp, ChevronRight, Users, Timer, Eye, Shield, Zap,
} from "lucide-react";
import type { ProductMediaItem, MarketplaceItem } from "@/lib/catalogFilters";
import { resolveImageUrl } from "@/lib/utils";
import { GooglePlacesAutocomplete, type SelectedGooglePlace } from "@/components/ui/google-places-autocomplete";
import { getAuthHeaders, isAuthenticated } from "@/lib/auth";
import {
  RfqCustomerContextCompletion,
  type RfqCustomerContext,
} from "@/components/RfqCustomerContextCompletion";
// C1: auth via cookie (credentials: "include")

// ── Extended types for new sections ──────────────────────────────────────────
interface CatalogItemSummary {
  id: number;
  vendorId: number;
  vendorName: string | null;
  templateKind: string | null;
  categoryKey: string | null;
  serviceType: string | null;
  name: string;
  description: string | null;
  priceSell: number | null;
  currency: string;
  unit: string | null;
  stockStatus: string | null;
  leadTime: string | null;
  location: string | null;
  origin: string | null;
  primaryImageUrl: string | null;
}

interface VendorPublicProfile {
  vendor: {
    id: number;
    name: string;
    logo: string | null;
    location: string | null;
    serviceType: string | null;
    country: string | null;
    createdAt: string | null;
  };
  performance: {
    totalOrders: number;
    completedOrders: number;
    ontimePercentage: number | null;
    avgResponseHours: number | null;
    averageResponseMinutes: number | null;
    customerRating: number | null;
    vendorGrade: string | null;
    score: number | null;
    lastCalculatedAt: string | null;
  } | null;
  productCount: number;
  serviceCount: number;
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatPrice(n: number, currency?: string | null): string {
  const cur = (currency || "IDR").toUpperCase();
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n);
}

type RfqSubmitErrorPayload = {
  error?: unknown;
  message?: unknown;
  reqId?: unknown;
};

function mapRfqSubmitError(status: number, payload: RfqSubmitErrorPayload): string {
  const serverMessage =
    typeof payload.error === "string"
      ? payload.error
      : typeof payload.message === "string"
        ? payload.message
        : "";

  if (status === 422) {
    return serverMessage || "Konteks organisasi belum siap untuk membuat RFQ.";
  }
  if (status === 400) {
    return serverMessage || "Periksa kembali data RFQ yang diisi.";
  }
  if (status === 409) {
    return serverMessage || "Permintaan RFQ yang sama sedang diproses.";
  }
  if (status >= 500) {
    const requestId = typeof payload.reqId === "string" ? payload.reqId : "";
    return requestId
      ? `Terjadi kesalahan server. Kode referensi: ${requestId}`
      : "Terjadi kesalahan server. Silakan coba lagi.";
  }
  return serverMessage || "Gagal mengirim RFQ.";
}

// ── Stock Badge ───────────────────────────────────────────────────────────────
function StockBadge({ status }: { status?: string | null }) {
  const { t } = useLanguage();
  if (!status) return null;
  const cfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    in_stock:     { label: t("marketplaceDetail.stockInStock"),  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
    available:    { label: t("marketplaceDetail.stockAvailable"), cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
    "Ready Stock":{ label: "Ready Stock",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
    limited:      { label: t("marketplaceDetail.stockLimited"),  cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: <AlertCircle className="h-3 w-3" /> },
    "Indent":     { label: "Indent",          cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: <AlertCircle className="h-3 w-3" /> },
    "Pre-order":  { label: "Pre-order",       cls: "bg-sky-50 text-sky-700 border-sky-200",          icon: <Info className="h-3 w-3" /> },
    out_of_stock: { label: t("marketplaceDetail.stockOut"),      cls: "bg-red-50 text-red-600 border-red-200",          icon: <AlertCircle className="h-3 w-3" /> },
    on_order:         { label: t("marketplaceDetail.stockOnOrder"), cls: "bg-blue-50 text-blue-700 border-blue-200",  icon: <Info className="h-3 w-3" /> },
    contact_supplier: { label: t("marketplaceDetail.stockOnOrder"), cls: "bg-blue-50 text-blue-700 border-blue-200",  icon: <Info className="h-3 w-3" /> },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}

// ── Image Placeholder ─────────────────────────────────────────────────────────
function ImagePlaceholder({ isProduct }: { isProduct: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-3 ${isProduct ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-sky-50 to-blue-50"}`}>
      {isProduct
        ? <Package className="h-16 w-16 text-emerald-200" />
        : <Truck className="h-16 w-16 text-sky-200" />
      }
      <span className="text-[12px] text-slate-400 font-medium">{t("marketplaceDetail.noPhoto")}</span>
    </div>
  );
}

// ── Media Gallery ─────────────────────────────────────────────────────────────
function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  return null;
}

function MediaGallery({ media, isProduct }: { media: ProductMediaItem[]; isProduct: boolean }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ProductMediaItem | null>(null);

  // Always show gallery section — with placeholder if empty
  const hasMedia = media && media.length > 0;
  const primaryIdx = hasMedia ? media.findIndex((m) => m.isPrimary) : -1;
  const initialSelected = hasMedia ? media[primaryIdx !== -1 ? primaryIdx : 0] : null;
  const current = selected ?? initialSelected;

  function renderMain(m: ProductMediaItem | null) {
    if (!m) return <ImagePlaceholder isProduct={isProduct} />;
    if (m.mediaType === "image" && m.fileUrl) {
      return (
        <img
          src={resolveImageUrl(m.fileUrl) ?? m.fileUrl}
          alt={m.title ?? "foto produk"}
          className="w-full h-full object-contain bg-slate-50"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      );
    }
    if (m.mediaType === "video" && m.fileUrl) {
      return <video src={m.fileUrl} controls className="w-full h-full object-contain bg-slate-900" />;
    }
    if (m.mediaType === "video_link" && m.externalUrl) {
      const ytId = m.externalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1];
      if (ytId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
          <Link2 className="h-10 w-10 text-slate-300" />
          <a href={m.externalUrl} target="_blank" rel="noopener noreferrer"
            className="text-sky-600 hover:underline text-sm font-medium">
            {t("marketplaceDetail.mediaExternalVideo")}
          </a>
        </div>
      );
    }
    return <ImagePlaceholder isProduct={isProduct} />;
  }

  function renderThumb(m: ProductMediaItem) {
    if (m.mediaType === "image" && m.fileUrl) {
      return <img src={resolveImageUrl(m.fileUrl) ?? m.fileUrl} alt="" className="w-full h-full object-cover" loading="lazy" />;
    }
    if (m.mediaType === "video" && m.fileUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-200">
          <Play className="h-5 w-5 text-slate-500 fill-slate-500" />
        </div>
      );
    }
    if (m.mediaType === "video_link" && m.externalUrl) {
      const thumb = getYoutubeThumbnail(m.externalUrl);
      if (thumb) return <img src={thumb} alt="" className="w-full h-full object-cover" />;
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-200">
          <Play className="h-5 w-5 text-slate-500 fill-slate-500" />
        </div>
      );
    }
    return <div className="w-full h-full bg-slate-200" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {hasMedia && (
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" /> {t("marketplaceDetail.mediaTitle")}
            <span className="normal-case font-normal text-slate-400">({media.length})</span>
          </p>
        </div>
      )}

      {/* Main viewer */}
      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
        {renderMain(current)}
      </div>

      {/* Thumbnails */}
      {hasMedia && media.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {media.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                current?.id === m.id ? "border-sky-400 ring-1 ring-sky-200" : "border-transparent hover:border-slate-300"
              }`}
            >
              {renderThumb(m)}
              {(m.mediaType === "video" || m.mediaType === "video_link") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Service Info Card ──────────────────────────────────────────────────────────
// Maps common service-related spec keys → labels + icons
const SERVICE_FIELD_MAP: Array<{ keys: string[]; label: string; icon: React.ReactNode }> = [
  { keys: ["serviceType","service_type","jenis_layanan","jenis"], label: "Jenis Layanan",   icon: <Layers className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["route","rute","lane","lane_rute"],                    label: "Rute",             icon: <Navigation className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["origin_port","pol","port_muat","port_of_loading"],   label: "Port of Loading",  icon: <Anchor className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["dest_port","pod","port_bongkar","port_of_discharge"], label: "Port of Discharge",icon: <Anchor className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["capacity","kapasitas","kapasitas_muat","volume"],     label: "Kapasitas",        icon: <Box className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["coverage","coverage_area","area_layanan","wilayah"],  label: "Coverage Area",    icon: <Globe className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["transit_time","estimasi_waktu","lead_time","tat"],   label: "Estimasi Waktu",   icon: <Clock className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["max_weight","berat_maks","max_cbm"],                  label: "Maks. Muatan",     icon: <Weight className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["vessel_type","tipe_kapal","mode","moda"],             label: "Moda Angkutan",    icon: <Wind className="h-3.5 w-3.5 text-sky-500" /> },
  { keys: ["incoterm","syarat_pengiriman"],                       label: "Incoterm",         icon: <ClipboardList className="h-3.5 w-3.5 text-sky-500" /> },
];

function ServiceInfoCard({ item, translatedSpecValues }: { item: MarketplaceItem; translatedSpecValues?: Record<string, string> | null }) {
  const { t } = useLanguage();
  const specs = item.specValues && typeof item.specValues === "object"
    ? item.specValues as Record<string, unknown>
    : {};

  // Collect rows: top-level serviceType + matching specValues
  const rows: Array<{ label: string; value: string; icon: React.ReactNode }> = [];

  if (item.serviceType) {
    rows.push({ label: t("marketplaceDetail.serviceInfoTitle"), value: item.serviceType, icon: <Layers className="h-3.5 w-3.5 text-sky-500" /> });
  }

  for (const { keys, label, icon } of SERVICE_FIELD_MAP) {
    // Skip jenis_layanan if already added from top-level
    if (item.serviceType && keys.includes("serviceType")) continue;
    for (const k of keys) {
      if (specs[k] !== undefined && specs[k] !== null && String(specs[k]).trim() !== "") {
        // Avoid duplicate label
        if (!rows.find((r) => r.label === label)) {
          const rawVal = String(specs[k]);
          const val = translatedSpecValues?.[k] ?? rawVal;
          rows.push({ label, value: val, icon });
        }
        break;
      }
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sky-200 overflow-hidden">
      <div className="bg-sky-50 px-4 py-2.5 border-b border-sky-200">
        <p className="text-[12px] font-semibold text-sky-700 uppercase tracking-wide flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> {t("marketplaceDetail.serviceInfoTitle")}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <span className="shrink-0">{r.icon}</span>
            <span className="text-[12px] text-slate-500 min-w-[120px] shrink-0">{r.label}</span>
            <span className="text-[13px] font-semibold text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Product Info Card ──────────────────────────────────────────────────────────
const PRODUCT_FIELD_MAP: Array<{ keys: string[]; labelKey: string; icon: React.ReactNode }> = [
  { keys: ["commodity","komoditi","komoditas","product_type"],      labelKey: "marketplaceDetail.fieldCommodity",    icon: <Leaf className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["grade","kualitas","kelas"],                             labelKey: "marketplaceDetail.fieldGrade",        icon: <Star className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["origin","asal","negara_asal","country_of_origin"],     labelKey: "marketplaceDetail.fieldOrigin",       icon: <Mountain className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["size","ukuran","dimensi"],                              labelKey: "marketplaceDetail.fieldSize",         icon: <Layers className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["moisture","kadar_air","water_content"],                 labelKey: "marketplaceDetail.fieldMoisture",     icon: <Info className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["calorific_value","kalori","kcal","ncv","gcv"],          labelKey: "marketplaceDetail.fieldCalorie",      icon: <Info className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["sulfur","kandungan_sulfur","sulphur"],                  labelKey: "Sulfur",                              icon: <Info className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["ash","ash_content","kadar_abu"],                        labelKey: "marketplaceDetail.fieldAsh",          icon: <Info className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["packaging","kemasan","packing"],                        labelKey: "marketplaceDetail.fieldPackaging",    icon: <Package className="h-3.5 w-3.5 text-emerald-500" /> },
  { keys: ["certification","sertifikasi","sertifikat"],             labelKey: "marketplaceDetail.fieldCertification", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
];

function ProductInfoCard({ item, translatedSpecValues }: { item: MarketplaceItem; translatedSpecValues?: Record<string, string> | null }) {
  const { t } = useLanguage();
  const specs = item.specValues && typeof item.specValues === "object"
    ? item.specValues as Record<string, unknown>
    : {};

  const rows: Array<{ labelKey: string; value: string; icon: React.ReactNode }> = [];

  for (const { keys, labelKey, icon } of PRODUCT_FIELD_MAP) {
    // Check top-level item field first (e.g. item.origin)
    const topLevelKey = keys[0] as keyof MarketplaceItem;
    const topLevelVal = item[topLevelKey];
    if (topLevelVal && typeof topLevelVal === "string" && topLevelVal.trim()) {
      if (!rows.find((r) => r.labelKey === labelKey)) {
        // top-level fields use the first matching key for lookup in translatedSpecValues
        const translated = keys.map((k) => translatedSpecValues?.[k]).find(Boolean);
        rows.push({ labelKey, value: translated ?? topLevelVal, icon });
        continue;
      }
    }
    // Then check specValues
    for (const k of keys) {
      if (specs[k] !== undefined && specs[k] !== null && String(specs[k]).trim() !== "") {
        if (!rows.find((r) => r.labelKey === labelKey)) {
          const rawVal = String(specs[k]);
          const val = translatedSpecValues?.[k] ?? rawVal;
          rows.push({ labelKey, value: val, icon });
        }
        break;
      }
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden">
      <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200">
        <p className="text-[12px] font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" /> {t("marketplaceDetail.productInfoTitle")}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <span className="shrink-0">{r.icon}</span>
            <span className="text-[12px] text-slate-500 min-w-[120px] shrink-0">{t(r.labelKey)}</span>
            <span className="text-[13px] font-semibold text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Spec Field Label Translation Map ─────────────────────────────────────────
const SPEC_FIELD_LABEL_KEYS: Record<string, string> = {
  cut:                "marketplaceDetail.fieldSpecCut",
  color:              "marketplaceDetail.fieldSpecColor",
  colour:             "marketplaceDetail.fieldSpecColor",
  species:            "marketplaceDetail.fieldSpecSpecies",
  storage:            "marketplaceDetail.fieldSpecStorage",
  freezing:           "marketplaceDetail.fieldSpecFreezing",
  processing:         "marketplaceDetail.fieldSpecProcessing",
  shelf_life:         "marketplaceDetail.fieldSpecShelfLife",
  net_weight_carton:  "marketplaceDetail.fieldSpecNetWeightCarton",
  net_weight:         "marketplaceDetail.fieldSpecNetWeight",
  gross_weight:       "marketplaceDetail.fieldSpecGrossWeight",
  thickness:          "marketplaceDetail.fieldSpecThickness",
  length:             "marketplaceDetail.fieldSpecLength",
  width:              "marketplaceDetail.fieldSpecWidth",
  height:             "marketplaceDetail.fieldSpecHeight",
};

// ── Spec Table ────────────────────────────────────────────────────────────────
// Shows remaining spec fields that are NOT already highlighted in the info cards
const HIGHLIGHTED_SERVICE_KEYS = new Set([
  "serviceType","service_type","jenis_layanan","jenis",
  "route","rute","lane","lane_rute",
  "origin_port","pol","port_muat","port_of_loading",
  "dest_port","pod","port_bongkar","port_of_discharge",
  "capacity","kapasitas","kapasitas_muat","volume",
  "coverage","coverage_area","area_layanan","wilayah",
  "transit_time","estimasi_waktu","lead_time","tat",
  "max_weight","berat_maks","max_cbm",
  "vessel_type","tipe_kapal","mode","moda",
  "incoterm","syarat_pengiriman",
]);
const HIGHLIGHTED_PRODUCT_KEYS = new Set([
  "commodity","komoditi","komoditas","product_type",
  "grade","kualitas","kelas",
  "origin","asal","negara_asal","country_of_origin",
  "size","ukuran","dimensi",
  "moisture","kadar_air","water_content",
  "calorific_value","kalori","kcal","ncv","gcv",
  "sulfur","kandungan_sulfur","sulphur",
  "ash","ash_content","kadar_abu",
  "packaging","kemasan","packing",
  "certification","sertifikasi","sertifikat",
]);

function SpecTable({ item, translatedSpecValues }: { item: MarketplaceItem; translatedSpecValues?: Record<string, string> | null }) {
  const { t } = useLanguage();
  const isProduct = item.templateKind === "product";
  const highlightedKeys = isProduct ? HIGHLIGHTED_PRODUCT_KEYS : HIGHLIGHTED_SERVICE_KEYS;

  const specs = item.specValues && typeof item.specValues === "object"
    ? item.specValues as Record<string, unknown>
    : {};
  const snapshot = item.templateSnapshot && typeof item.templateSnapshot === "object"
    ? item.templateSnapshot as Record<string, unknown>
    : {};

  const fields: Array<{ key: string; label: string; type: string }> = [];
  if (Array.isArray(snapshot["customFields"])) {
    fields.push(...(snapshot["customFields"] as typeof fields));
  } else if (Array.isArray(snapshot["fields"])) {
    (snapshot["fields"] as typeof fields).forEach((f) => fields.push(f));
  }

  const knownKeys = new Set(fields.map((f) => f.key));
  const extraKeys = Object.keys(specs).filter(
    (k) => !knownKeys.has(k) && !highlightedKeys.has(k) && specs[k] !== null && specs[k] !== undefined && String(specs[k]).trim() !== "",
  );

  const rows: Array<{ label: string; value: string }> = [];

  fields
    .filter((f) =>
      f.type !== "textarea" &&
      !highlightedKeys.has(f.key) &&
      specs[f.key] !== undefined && specs[f.key] !== null &&
      String(specs[f.key]).trim() !== ""
    )
    .forEach((f) => rows.push({
      label: SPEC_FIELD_LABEL_KEYS[f.key] ? t(SPEC_FIELD_LABEL_KEYS[f.key]) : f.label,
      value: translatedSpecValues?.[f.key] ?? String(specs[f.key]),
    }));

  extraKeys.forEach((k) => rows.push({
    label: SPEC_FIELD_LABEL_KEYS[k] ? t(SPEC_FIELD_LABEL_KEYS[k]) : k,
    value: translatedSpecValues?.[k] ?? String(specs[k]),
  }));

  // Textarea fields shown as description
  const textareaRows: Array<{ label: string; value: string }> = [];
  fields
    .filter((f) => f.type === "textarea" && specs[f.key] !== undefined && specs[f.key] !== null && String(specs[f.key]).trim() !== "")
    .forEach((f) => textareaRows.push({
      label: SPEC_FIELD_LABEL_KEYS[f.key] ? t(SPEC_FIELD_LABEL_KEYS[f.key]) : f.label,
      value: translatedSpecValues?.[f.key] ?? String(specs[f.key]),
    }));

  if (rows.length === 0 && textareaRows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
        <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">{t("marketplaceDetail.specsTitle")}</p>
      </div>
      {rows.length > 0 && (
        <div className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-4 px-4 py-2.5">
              <span className="text-[12px] text-slate-500 min-w-[120px] shrink-0">{r.label}</span>
              <span className="text-[13px] font-medium text-slate-800">{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {textareaRows.length > 0 && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {textareaRows.map((r, i) => (
            <div key={i} className="px-4 py-3 space-y-1">
              <p className="text-[12px] font-semibold text-slate-500">{r.label}</p>
              <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Document List ─────────────────────────────────────────────────────────────
// Shows standard document slots (docs, backed by vendor_catalog_items.documents —
// the key/label checklist such as COO/Phytosanitary/Invoice/Packing List) and
// extra attachments (mediaDocs, backed by media_assets PDFs with no documentKey).
//
// For each standard slot, resolves its file with priority:
//   1. a public media_asset whose documentKey matches the slot's key
//   2. legacy docs[].fileUrl
//   3. legacy docs[].reference (older field name used by the publish validator)
// A download/preview link only renders when a URL is actually available —
// never a fake link for an empty slot. Visibility follows: public → shown,
// null/undefined → shown (legacy fail-open, no visibility field ever existed
// on old rows), private/internal → hidden.
function DocumentList({
  docs,
  mediaDocs,
}: {
  docs: unknown;
  mediaDocs?: Array<{ id: string | number; title: string | null; fileUrl: string | null; mimeType: string | null; documentKey?: string | null }>;
}) {
  const { t } = useLanguage();
  const mediaDocsList = mediaDocs ?? [];
  const mediaByKey = new Map<string, { fileUrl: string | null; title: string | null }>();
  for (const m of mediaDocsList) {
    if (m.documentKey) mediaByKey.set(m.documentKey, { fileUrl: m.fileUrl, title: m.title });
  }

  const standardKeys = new Set<string>();
  const templateRows: Array<{ label: string; url: string | null }> = [];
  if (Array.isArray(docs)) {
    for (const d of docs as Array<Record<string, unknown>>) {
      const vis = d["visibility"];
      if (vis !== "public" && vis !== undefined && vis !== null) continue;
      const key = d["key"] != null ? String(d["key"]) : null;
      if (key) standardKeys.add(key);

      const mapped = key ? mediaByKey.get(key) : undefined;
      const url =
        mapped?.fileUrl ??
        (d["fileUrl"] ? String(d["fileUrl"]) : null) ??
        (d["reference"] ? String(d["reference"]) : null) ??
        (d["url"] ? String(d["url"]) : null);

      templateRows.push({
        label: String(d["label"] ?? d["name"] ?? d["title"] ?? "Dokumen"),
        url:   url && url.trim() ? url : null,
      });
    }
  }

  // "Dokumen Tambahan": media assets not mapped to any standard slot above
  // (no documentKey, or a documentKey that no longer matches a live slot).
  const mediaRows = mediaDocsList.filter(d => d.fileUrl && !(d.documentKey && standardKeys.has(d.documentKey)));

  if (templateRows.length === 0 && mediaRows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
        <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> {t("marketplaceDetail.docsTitle")}
          <span className="normal-case font-normal text-slate-400">({templateRows.length + mediaRows.length})</span>
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {templateRows.map((d, i) => (
          <div key={`t-${i}`} className="flex items-center justify-between px-4 py-2.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-[13px] text-slate-700 truncate">{d.label}</span>
              {!d.url && <span className="text-[11px] text-slate-400">({t("marketplaceDetail.docsNotUploaded")})</span>}
            </div>
            {d.url ? (
              <a href={d.url} target="_blank" rel="noopener noreferrer"
                className="text-[12px] text-sky-600 hover:underline font-semibold shrink-0">
                {t("marketplaceDetail.docsDownload")}
              </a>
            ) : null}
          </div>
        ))}
        {mediaRows.map((d, i) => (
          <div key={`m-${i}`} className="flex items-center justify-between px-4 py-2.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-[13px] text-slate-700 truncate">{d.title ?? `${t("marketplaceDetail.docsExtra")} ${i + 1}`}</span>
            </div>
            {d.fileUrl ? (
              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                className="text-[12px] text-sky-600 hover:underline font-semibold shrink-0">
                {t("marketplaceDetail.docsDownload")}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Share Button ──────────────────────────────────────────────────────────────
function ShareButton({ id }: { id: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${window.location.pathname.replace(/\/marketplace\/.*/, "")}/marketplace/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the URL via prompt
      window.prompt("Salin link ini:", url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-sky-600 font-medium transition-colors px-2.5 py-1.5 rounded-lg hover:bg-sky-50"
      title={t("marketplaceDetail.shareCopyLink")}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t("marketplaceDetail.shareCopied") : t("marketplaceDetail.shareCopyLink")}
    </button>
  );
}

// ── Calculator Panel ──────────────────────────────────────────────────────────
interface CalcState {
  qty: number;
  unit: string;
  includePpn: boolean;
}

function PriceCalculator({
  item,
  calc,
  onChange,
}: {
  item: MarketplaceItem;
  calc: CalcState;
  onChange: (c: CalcState) => void;
}) {
  const { t } = useLanguage();
  const moq = Number(item.moq) || 1;
  const priceSell = item.priceSell ?? 0;
  const subtotal = priceSell * calc.qty;
  const ppnAmount = calc.includePpn ? subtotal * 0.11 : 0;
  const grandTotal = subtotal + ppnAmount;
  const hasPriceSell = item.priceSell != null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
      <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">{t("marketplaceDetail.calcTitle")}</p>

      <div className="space-y-1">
        <Label className="text-[12px] text-slate-600">{t("marketplaceDetail.calcQty")}</Label>
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            onClick={() => onChange({ ...calc, qty: Math.max(moq, calc.qty - 1) })}
          >−</button>
          <Input
            type="number"
            min={moq}
            value={calc.qty}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= moq) onChange({ ...calc, qty: v });
            }}
            className="text-center h-8 text-sm font-semibold w-20"
          />
          <button
            className="w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            onClick={() => onChange({ ...calc, qty: calc.qty + 1 })}
          >+</button>
          <span className="text-[13px] text-slate-500">{calc.unit}</span>
        </div>
        {item.moq != null && moq > 1 ? (
          <p className="text-[11px] text-slate-400">MOQ: {moq} {item.unit || "unit"}</p>
        ) : item.moq == null ? (
          <p className="text-[11px] text-slate-400">MOQ: {t("marketplaceDetail.moqNegotiable")}</p>
        ) : null}
      </div>

      {item.unit && (
        <div className="space-y-1">
          <Label className="text-[12px] text-slate-600">{t("marketplaceDetail.calcUnit")}</Label>
          <Input
            value={calc.unit}
            onChange={(e) => onChange({ ...calc, unit: e.target.value })}
            className="h-8 text-sm max-w-[140px]"
          />
        </div>
      )}

      {hasPriceSell && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-slate-700">{t("marketplaceDetail.calcIncludePpn")}</p>
            <p className="text-[11px] text-slate-400">{t("marketplaceDetail.calcPpnDesc")}</p>
          </div>
          <Switch
            checked={calc.includePpn}
            onCheckedChange={(v) => onChange({ ...calc, includePpn: v })}
          />
        </div>
      )}

      {hasPriceSell && (
        <>
          <Separator />
          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between text-slate-600">
              <span>{formatPrice(priceSell, item.currency)} × {calc.qty} {calc.unit}</span>
              <span className="font-medium">{formatPrice(subtotal, item.currency)}</span>
            </div>
            {calc.includePpn && (
              <div className="flex justify-between text-slate-500">
                <span>PPN 11%</span>
                <span>{formatPrice(ppnAmount, item.currency)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-extrabold text-[15px] text-slate-900">
              <span>{t("marketplaceDetail.calcGrandTotal")}</span>
              <span>{formatPrice(grandTotal, item.currency)}</span>
            </div>
          </div>
        </>
      )}

      {!hasPriceSell && (
        <p className="text-[12px] text-slate-400 italic text-center py-2">
          {t("marketplaceDetail.calcPriceConfirmNote")}
        </p>
      )}
    </div>
  );
}

// ── RFQ Dialog (P2) ───────────────────────────────────────────────────────────
interface RfqForm {
  buyerName: string;
  companyName: string;
  email: string;
  guestContact: string;
  destination: string;
  destinationPlace: SelectedGooglePlace | null;
  requiredDate: string;
  notes: string;
}

interface SubmitDialogProps {
  item: MarketplaceItem;
  calc: CalcState;
  onClose: () => void;
}

function SubmitDialog({ item, calc, onClose }: SubmitDialogProps) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const authenticatedCustomer = isAuthenticated();
  const [form, setForm] = useState<RfqForm>({
    buyerName: "", companyName: "", email: "", guestContact: "",
    destination: "", destinationPlace: null, requiredDate: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const idempotencyStorageKey = `customer-portal:marketplace-rfq:${item.id}:pending`;
  // Keep one logical request identity across refreshes and network retries. A
  // key is removed only when the dialog is intentionally closed or the request
  // has definitively succeeded.
  const [submissionIdempotencyKey, setSubmissionIdempotencyKey] = useState<string | null>(null);
  const [customerContext, setCustomerContext] = useState<RfqCustomerContext | null>(null);
  const [contextLoading, setContextLoading] = useState(authenticatedCustomer);
  const [contextError, setContextError] = useState<string | null>(null);
  const contextBlocksSubmit = authenticatedCustomer && (
    contextLoading
    || Boolean(contextError)
    || !customerContext
    || customerContext.status === "legacy_unresolved"
    || customerContext.status === "company_unresolved"
    || customerContext.status === "company_pending"
  );

  useEffect(() => {
    if (!authenticatedCustomer) {
      setContextLoading(false);
      return;
    }

    let disposed = false;
    fetch("/api/portal/organization", {
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then(async (response) => {
        const data = await response.json() as RfqCustomerContext & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Gagal memuat konteks customer.");
        return data;
      })
      .then((data) => {
        if (disposed) return;
        setCustomerContext(data);
        setContextError(null);
      })
      .catch((requestError: unknown) => {
        if (disposed) return;
        setContextError(requestError instanceof Error ? requestError.message : "Gagal memuat konteks customer.");
      })
      .finally(() => {
        if (!disposed) setContextLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [authenticatedCustomer]);

  function validatePhone(phone: string): string | null {
    const normalized = phone.trim().replace(/[\s\-().]/g, "");
    if (!normalized) return t("marketplaceDetail.rfqFieldPhone", "No. WhatsApp") + " " + t("common.required", "wajib diisi");
    if (!/^(\+?62|0)8\d{8,12}$/.test(normalized)) {
      return t("validation.phoneFormat", "Format tidak valid. Contoh: 08123456789 atau 628123456789");
    }
    return null;
  }

  const priceSell = item.priceSell ?? 0;
  const estimatedPrice = priceSell * calc.qty;
  const ppnAmount = calc.includePpn ? estimatedPrice * 0.11 : 0;
  const grandTotal = estimatedPrice + ppnAmount;

  function closeDialog() {
    try { window.sessionStorage.removeItem(idempotencyStorageKey); } catch {}
    onClose();
  }

  function getOrCreateSubmissionKey(): string {
    try {
      const existing = window.sessionStorage.getItem(idempotencyStorageKey);
      if (existing) return existing;
      const key = globalThis.crypto?.randomUUID?.()
        ?? `mkt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(idempotencyStorageKey, key);
      return key;
    } catch {
      return globalThis.crypto?.randomUUID?.()
        ?? `mkt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (authenticatedCustomer) {
      if (contextLoading) {
        setError("Konteks customer masih dimuat. Silakan tunggu sebentar.");
        return;
      }
      if (contextError || !customerContext) {
        setError(contextError ?? "Konteks customer belum tersedia. Silakan muat ulang halaman.");
        return;
      }
      if (customerContext.status === "legacy_unresolved" || customerContext.status === "company_unresolved") {
        setError("Lengkapi jenis akun customer terlebih dahulu.");
        return;
      }
      if (customerContext.status === "company_pending") {
        setError("Perusahaan Anda masih menunggu verifikasi Admin.");
        return;
      }
    }
    const pErr = validatePhone(form.guestContact);
    setPhoneError(pErr);
    if (pErr) return;
    setLoading(true);
    try {
      const idempotencyKey = submissionIdempotencyKey ?? getOrCreateSubmissionKey();
      if (!submissionIdempotencyKey) setSubmissionIdempotencyKey(idempotencyKey);
      const body: Record<string, unknown> = {
        // Backward-compatible legacy fields
        customerName: form.buyerName.trim(),
        email: form.email.trim() || undefined,
        phone: form.guestContact.trim(),
        qty: calc.qty,
        unit: calc.unit,
        notes: form.notes.trim() || undefined,
        includePpn: calc.includePpn,
        buyer_name: form.buyerName.trim(),
        // Authenticated company ownership comes from the canonical context.
        // Only an unauthenticated guest may provide an informational company name.
        company_name: authenticatedCustomer ? undefined : (form.companyName.trim() || undefined),
        guest_contact: form.guestContact.trim(),
        destination: form.destination.trim() || undefined,
        destination_place_id: form.destinationPlace?.placeId,
        destination_lat: form.destinationPlace?.latitude,
        destination_lng: form.destinationPlace?.longitude,
        required_date: form.requiredDate || undefined,
        marketplace_item_id: item.id,
        item_type: item.templateKind ?? "product",
        currency: item.currency ?? "IDR",
        estimated_price: estimatedPrice,
        marketplace_source: "marketplace",
        commission_ready: true,
        urgency: "inquiry",

      };

      const res = await fetch(`/api/portal/marketplace/${item.id}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           "Idempotency-Key": idempotencyKey,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

       const data = (await res.json()) as {
         orderNumber?: string;
         error?: string;
         message?: string;
         reqId?: string;
       };
       if (!res.ok) throw new Error(mapRfqSubmitError(res.status, data));
       try { window.sessionStorage.removeItem(idempotencyStorageKey); } catch {}
       setSubmissionIdempotencyKey(null);
      setSuccess(data.orderNumber ?? "OK");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Dialog open onOpenChange={closeDialog}>
        <DialogContent className="max-w-sm rounded-2xl text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-slate-800 mb-1">
                {t("marketplaceDetail.rfqSuccessTitle")}
              </p>
              <p className="text-[13px] text-slate-500">
                {t("marketplaceDetail.rfqNoLabel")}: <span className="font-mono font-semibold text-slate-800">{success}</span>
              </p>
              <p className="text-[12px] text-slate-400 mt-2">
                {t("marketplaceDetail.rfqSuccessNote")}
              </p>
            </div>
            <Button onClick={closeDialog} className="mt-2 rounded-xl px-8">
              {t("marketplaceDetail.rfqClose")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={closeDialog}>
      <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-sky-600" />
            {t("marketplaceDetail.rfqDialogTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* Item & Price Summary */}
        <div className="bg-slate-50 rounded-xl p-3 text-[12px] space-y-1">
          <p className="font-semibold text-slate-800 text-[13px]">{item.name}</p>
          <p className="text-slate-500">{item.vendorName}</p>
          <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
            <span className="text-slate-600">
              {calc.qty} {calc.unit}
            </span>
            {item.priceSell != null ? (
              <span className="font-bold text-sky-700">
                {formatPrice(grandTotal, item.currency)}
              </span>
            ) : (
              <span className="italic text-slate-400">{t("marketplaceDetail.priceNego")}</span>
            )}
          </div>
          {calc.includePpn && item.priceSell != null && (
            <p className="text-slate-400 text-[11px]">{t("marketplaceDetail.inclPpnNote")}</p>
          )}
        </div>

        {authenticatedCustomer && contextLoading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat konteks customer…
          </div>
        )}

        {authenticatedCustomer && contextError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-600 flex items-start gap-2" role="alert">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {contextError}
          </div>
        )}

        {authenticatedCustomer && customerContext?.status === "company_mapped" && customerContext.company && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[11px] font-semibold text-emerald-700">Perusahaan</p>
            <p className="text-[13px] font-bold text-emerald-900">{customerContext.company.name}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Diambil dari membership canonical Anda</p>
          </div>
        )}

        {authenticatedCustomer && customerContext &&
          (customerContext.status === "legacy_unresolved"
            || customerContext.status === "company_unresolved"
            || customerContext.status === "company_pending") && (
          <RfqCustomerContextCompletion
            context={customerContext}
            onCompleted={setCustomerContext}
            onViewStatus={() => setLocation("/pending-approval")}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[12px]">
              {t("marketplaceDetail.rfqFieldName")} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              placeholder={t("marketplaceDetail.rfqFieldNamePlaceholder")}
              className="h-9 text-sm"
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>

          {!authenticatedCustomer && (
            <div className="space-y-1">
              <Label className="text-[12px]">{t("marketplaceDetail.rfqFieldCompany")}</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder={t("marketplaceDetail.rfqFieldCompanyPlaceholder")}
                className="h-9 text-sm"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-[12px]">
              {t("marketplaceDetail.rfqFieldPhone")} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.guestContact}
              onChange={(e) => {
                setForm({ ...form, guestContact: e.target.value });
                if (phoneError) setPhoneError(validatePhone(e.target.value));
              }}
              placeholder={t("marketplaceDetail.rfqFieldPhonePlaceholder")}
              className={`h-9 text-sm ${phoneError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              required
              aria-describedby={phoneError ? "phone-error" : undefined}
            />
            {phoneError && (
              <p id="phone-error" className="text-[11px] text-red-600 mt-0.5">{phoneError}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-[12px]">{t("marketplaceDetail.rfqFieldEmail")}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("marketplaceDetail.rfqFieldEmailPlaceholder")}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[12px]">{t("marketplaceDetail.rfqFieldDest")}</Label>
            <GooglePlacesAutocomplete
              value={form.destination}
              onChange={(value) => setForm((prev) => ({ ...prev, destination: value }))}
              onPlaceSelected={(destinationPlace) => setForm((prev) => ({ ...prev, destinationPlace }))}
              placeholder="Cari kota, alamat, pelabuhan, bandara..."
              className="h-9 text-sm"
            />
            {form.destinationPlace ? (
              <p className="text-[11px] text-emerald-600">
                Lokasi terverifikasi: {form.destinationPlace.displayName}
              </p>
            ) : form.destination.trim() ? (
              <p className="text-[11px] text-slate-400">Lokasi belum diverifikasi — Anda tetap dapat mengirim alamat ini.</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label className="text-[12px]">{t("marketplaceDetail.rfqFieldDate")}</Label>
            <Input
              type="date"
              value={form.requiredDate}
              onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[12px]">{t("marketplaceDetail.rfqFieldNotes")}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("marketplaceDetail.rfqFieldNotesPlaceholder")}
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full rounded-xl h-11" disabled={loading || contextBlocksSubmit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {contextBlocksSubmit && customerContext?.status === "company_pending"
              ? "Menunggu verifikasi perusahaan"
              : contextBlocksSubmit && !contextLoading && !contextError && customerContext
                && (customerContext.status === "legacy_unresolved" || customerContext.status === "company_unresolved")
                ? "Lengkapi jenis akun terlebih dahulu"
                : t("marketplaceDetail.ctaRfq")}
          </Button>
          <p className="text-center text-[11px] text-slate-400">
            {t("marketplaceDetail.rfqNoteFooter")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Grade Badge ───────────────────────────────────────────────────────────────
function GradeBadge({ grade }: { grade: string | null | undefined }) {
  if (!grade) return null;
  const cfg: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-300",
    B: "bg-sky-100 text-sky-800 border-sky-300",
    C: "bg-amber-100 text-amber-800 border-amber-300",
    D: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg[grade] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      <Award className="h-3 w-3" /> Grade {grade}
    </span>
  );
}

function StarRating({ rating }: { rating: number | null | undefined }) {
  if (rating == null) return null;
  const r = Math.min(5, Math.max(0, rating));
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(r) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
      <span className="ml-1 text-[12px] font-semibold text-slate-700">{r.toFixed(1)}</span>
    </div>
  );
}

// ── Vendor Profile Card ───────────────────────────────────────────────────────
function VendorProfileCard({ vendorId, itemLocation }: { vendorId: number; itemLocation?: string | null }) {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery<VendorPublicProfile>({
    queryKey: ["vendor-public-profile", vendorId],
    queryFn: () => fetch(`/api/portal/vendors/${vendorId}/public-profile`).then((r) => r.ok ? r.json() : Promise.reject(r)),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 animate-pulse">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{t("marketplaceDetail.vendorAbout")}</p>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-[14px] font-semibold text-slate-800">Vendor</span>
        </div>
      </div>
    );
  }

  const { vendor, performance: perf, productCount, serviceCount } = data;
  const memberYear = vendor.createdAt ? new Date(vendor.createdAt).getFullYear() : null;
  const vendorLogoUrl = vendor.logo && /^(?:https?:|\/)/i.test(vendor.logo)
    ? (resolveImageUrl(vendor.logo) ?? vendor.logo)
    : null;

  const responseText = (() => {
    if (!perf) return null;
    const mins = perf.averageResponseMinutes;
    const hrs = perf.avgResponseHours;
    if (mins != null && mins > 0 && mins < 60) return `${Math.round(mins)} ${t("marketplaceDetail.vendorRespMin")}`;
    if (hrs != null && hrs > 0) return `${hrs.toFixed(1)} ${t("marketplaceDetail.vendorRespHour")}`;
    return null;
  })();

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("marketplaceDetail.vendorAbout")}</p>
        <div className="flex items-start gap-2">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-lg overflow-hidden">
            {vendorLogoUrl ? (
              <img src={vendorLogoUrl} alt="" className="w-full h-full object-contain" />
            ) : (
              <span>{vendor.logo ?? "📦"}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">{vendor.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {perf?.vendorGrade && <GradeBadge grade={perf.vendorGrade} />}
              {perf?.customerRating != null && perf.customerRating > 0 && (
                <StarRating rating={perf.customerRating} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {/* Total Orders */}
        {perf && (
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-[18px] font-extrabold text-slate-800">{perf.completedOrders}</p>
            <p className="text-[10px] text-slate-500 font-medium">{t("marketplaceDetail.vendorOrdersDone")}</p>
          </div>
        )}
        {/* On-Time */}
        {perf?.ontimePercentage != null && (
          <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
            <p className="text-[18px] font-extrabold text-emerald-700">{Math.round(perf.ontimePercentage)}%</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center justify-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> On-Time
            </p>
          </div>
        )}
        {/* Response Time */}
        {responseText && (
          <div className="bg-sky-50 rounded-xl p-2.5 text-center">
            <p className="text-[15px] font-extrabold text-sky-700">{responseText}</p>
            <p className="text-[10px] text-sky-600 font-medium flex items-center justify-center gap-0.5">
              <Timer className="h-2.5 w-2.5" /> {t("marketplaceDetail.vendorRespTime", "Resp. Time")}
            </p>
          </div>
        )}
        {/* Products + Services */}
        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
          <p className="text-[15px] font-extrabold text-slate-700">{productCount + serviceCount}</p>
          <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-0.5">
            <Users className="h-2.5 w-2.5" /> {t("marketplaceDetail.vendorPublicItems")}
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 pb-3 space-y-1.5 text-[12px] text-slate-500">
        {(itemLocation ?? vendor.location) && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {itemLocation ?? vendor.location}
          </div>
        )}
        {(productCount > 0 || serviceCount > 0) && (
          <div className="flex items-center gap-1.5">
            <Package className="h-3 w-3 shrink-0 text-emerald-400" />
            {productCount > 0 && <span>{productCount} {t("marketplaceDetail.vendorProducts")}</span>}
            {productCount > 0 && serviceCount > 0 && <span className="text-slate-300">·</span>}
            {serviceCount > 0 && <span>{serviceCount} {t("marketplaceDetail.vendorServices")}</span>}
          </div>
        )}
        {memberYear && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            {t("marketplaceDetail.vendorMemberSince")} {memberYear}
          </div>
        )}
        <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-100 mt-1">
          {t("marketplaceDetail.vendorVerifiedNote")}
        </p>
      </div>
    </div>
  );
}

// ── Item Mini Card ────────────────────────────────────────────────────────────
function ItemMiniCard({ item, onNavigate }: { item: CatalogItemSummary; onNavigate: (id: number) => void }) {
  const isProduct = item.templateKind === "product";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col w-[200px] shrink-0 cursor-pointer"
      onClick={() => onNavigate(item.id)}
    >
      <div className={`h-1 w-full ${isProduct ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-sky-400 to-blue-500"}`} />
      {/* Photo */}
      <div className="relative w-full h-[110px] overflow-hidden bg-slate-100">
        {item.primaryImageUrl ? (
          <img
            src={resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isProduct ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-sky-50 to-blue-50"}`}>
            {isProduct ? <Package className="h-8 w-8 text-emerald-200" /> : <Truck className="h-8 w-8 text-sky-200" />}
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isProduct ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
            {isProduct ? "Produk" : "Jasa"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-2">{item.name}</p>
        {item.vendorName && (
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Building2 className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{item.vendorName}</span>
          </p>
        )}
        <div className="mt-auto pt-1.5 border-t border-slate-100">
          {item.priceSell != null
            ? <p className="text-[13px] font-extrabold text-sky-700">{formatPrice(item.priceSell, item.currency)}{item.unit && <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{item.unit}</span>}</p>
            : <p className="text-[11px] text-slate-400 italic">Harga nego</p>
          }
        </div>
      </div>

      <button
        className="w-full py-2 text-[11px] font-semibold text-sky-600 hover:bg-sky-50 transition-colors border-t border-slate-100 flex items-center justify-center gap-1"
        onClick={(e) => { e.stopPropagation(); onNavigate(item.id); }}
      >
        <Eye className="h-3 w-3" /> Lihat Detail <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Related Items Section ─────────────────────────────────────────────────────
function RelatedItemsSection({ itemId, onNavigate }: { itemId: number; onNavigate: (id: number) => void }) {
  const { data: items = [], isLoading } = useQuery<CatalogItemSummary[]>({
    queryKey: ["marketplace-related", itemId],
    queryFn: () => fetch(`/api/portal/marketplace/${itemId}/related`).then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
    staleTime: 120_000,
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="w-[200px] h-52 bg-slate-100 rounded-2xl shrink-0 animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-500" />
            Item Lain dari Vendor Ini
          </p>
          <p className="text-[12px] text-slate-400 mt-0.5">{items.length} item dari vendor yang sama</p>
        </div>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <ItemMiniCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Similar Items Section ("Customers Also Viewed") ───────────────────────────
function SimilarItemsSection({ itemId, onNavigate }: { itemId: number; onNavigate: (id: number) => void }) {
  const { data: items = [], isLoading } = useQuery<CatalogItemSummary[]>({
    queryKey: ["marketplace-similar", itemId],
    queryFn: () => fetch(`/api/portal/marketplace/${itemId}/similar`).then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
    staleTime: 120_000,
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="w-[200px] h-52 bg-slate-100 rounded-2xl shrink-0 animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <p className="text-[15px] font-extrabold text-slate-800 flex items-center gap-2">
          <Eye className="h-4 w-4 text-purple-500" />
          Customers Also Viewed
        </p>
        <p className="text-[12px] text-slate-400 mt-0.5">Item serupa dari kategori yang sama</p>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <ItemMiniCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Same Province Section ─────────────────────────────────────────────────────
function SameProvinceSection({
  itemId,
  province,
  onNavigate,
}: {
  itemId: number;
  province: string | null;
  onNavigate: (id: number) => void;
}) {
  const { data: items = [], isLoading } = useQuery<CatalogItemSummary[]>({
    queryKey: ["marketplace-same-province", itemId],
    queryFn: () =>
      fetch(`/api/portal/marketplace/${itemId}/same-province`)
        .then((r) => r.json())
        .then((d) => (Array.isArray(d) ? d : [])),
    staleTime: 120_000,
    enabled: !!itemId && !!province,
  });

  if (!province) return null;
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="h-4 w-56 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[200px] h-52 bg-slate-100 rounded-2xl shrink-0 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-extrabold text-slate-800 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            Produk dari {province}
          </p>
          <p className="text-[12px] text-slate-400 mt-0.5">
            {items.length} produk dari vendor lain di provinsi yang sama
          </p>
        </div>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {items.map((item) => (
            <ItemMiniCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Detail Page ──────────────────────────────────────────────────────────
export default function MarketplaceDetailPage() {
  const [, params] = useRoute<{ id: string }>("/marketplace/:id");
  const [, setLocation] = useLocation();
  const { t, locale } = useLanguage();
  const id = params?.id;

  const [calc, setCalc] = useState<CalcState>({ qty: 1, unit: "unit", includePpn: false });
  const [showRfqDialog, setShowRfqDialog] = useState(false);

  const { data: item, isLoading, isError } = useQuery<MarketplaceItem>({
    queryKey: ["marketplace-item", id],
    queryFn: async () => {
      const res = await fetch(`/api/portal/marketplace/${id}`);
      if (!res.ok) throw new Error("Item tidak ditemukan");
      return res.json() as Promise<MarketplaceItem>;
    },
    enabled: !!id,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (item) {
      const moq = Number(item.moq) || 1;
      setCalc({ qty: moq, unit: item.unit || "unit", includePpn: false });
    }
  }, [item?.id]);

  // ── Auto-translation (triggers when locale is non-Indonesian) ──────────────
  const rawSpecValues = item?.specValues && typeof item.specValues === "object"
    ? (item.specValues as Record<string, unknown>)
    : undefined;

  const {
    name: translatedName,
    description: translatedDescription,
    specValues: translatedSpecValues,
    isTranslating,
    isTranslated,
    error: translateError,
    targetLang: translatedToLang,
    retranslate,
  } = useProductTranslation(item?.id, item?.name, item?.description ?? undefined, locale, rawSpecValues);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-[13px] text-slate-500">Memuat detail item…</p>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-[16px] font-semibold text-slate-600">Item tidak ditemukan atau belum dipublikasikan</p>
        <Button variant="outline" onClick={() => setLocation("/marketplace")} className="rounded-xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Marketplace
        </Button>
      </div>
    );
  }

  const isProduct = item.templateKind === "product";
  const hasPriceSell = item.priceSell != null;
  const priceSell = item.priceSell ?? 0;
  const subtotal = priceSell * calc.qty;
  const ppnAmount = calc.includePpn ? subtotal * 0.11 : 0;
  const grandTotal = subtotal + ppnAmount;
  const mediaList = Array.isArray((item as any).media) ? (item as any).media as ProductMediaItem[] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Breadcrumb bar ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-20">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setLocation("/marketplace")}
              className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-sky-600 font-medium transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Marketplace
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] text-slate-700 font-semibold truncate">{item.name}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
            <ShareButton id={String(item.id)} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Item Header card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className={`h-1.5 w-full ${isProduct ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-sky-400 to-blue-500"}`} />
              <div className="p-5 space-y-3">
                {/* Vendor + type */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-500">{item.vendorName ?? "Vendor"}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[11px] gap-1 ${isProduct ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-sky-300 text-sky-700 bg-sky-50"}`}>
                      {isProduct ? <Package className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                      {isProduct ? t("marketplaceDetail.typeProduct") : t("marketplaceDetail.typeService")}
                    </Badge>
                    <StockBadge status={item.stockStatus} />
                  </div>
                </div>

                {/* Name */}
                <h1 className="text-[22px] md:text-[26px] font-extrabold text-slate-900 leading-tight">
                  {isTranslated && translatedName ? translatedName : item.name}
                </h1>

                {/* AI translation indicator */}
                {isTranslating && (
                  <div className="flex items-center gap-1.5 text-[12px] text-sky-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menerjemahkan…</span>
                  </div>
                )}
                {isTranslated && translatedToLang && !isTranslating && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
                      <Globe className="h-3 w-3" />
                      Diterjemahkan AI · {translatedToLang.toUpperCase()}
                    </span>
                    <button
                      onClick={retranslate}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      ↺
                    </button>
                  </div>
                )}
                {translateError && (
                  <p className="text-[11px] text-red-500">{translateError}</p>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                    {isTranslated && translatedDescription ? translatedDescription : item.description}
                  </p>
                )}

                {/* Price */}
                <div className="pt-2 border-t border-slate-100">
                  {hasPriceSell
                    ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[28px] font-extrabold text-sky-700">{formatPrice(priceSell, item.currency)}</span>
                        {item.unit && <span className="text-[13px] text-slate-400">/ {item.unit}</span>}
                        <span className="text-[11px] text-slate-400">{item.currency ?? "IDR"}</span>
                      </div>
                    )
                    : (
                      <p className="text-[16px] font-semibold text-slate-400 italic">{t("marketplaceDetail.priceOnRequest")}</p>
                    )
                  }
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.origin && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <MapPin className="h-3 w-3" /> {t("marketplaceDetail.metaOrigin")}: {item.origin}
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <MapPin className="h-3 w-3" /> {t("marketplaceDetail.metaLocation")}: {item.location}
                    </div>
                  )}
                  {item.leadTime && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <Clock className="h-3 w-3" /> {t("marketplaceDetail.metaLeadTime", "Lead Time")}: {item.leadTime}
                    </div>
                  )}
                  {item.moq != null ? (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <Tag className="h-3 w-3" /> MOQ: {Number(item.moq) || 1} {item.unit || "unit"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <Tag className="h-3 w-3" /> MOQ: {t("marketplaceDetail.moqUponRequest")}
                    </div>
                  )}
                  {(item as any).validityDate && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <Calendar className="h-3 w-3" /> {t("marketplaceDetail.metaValidUntil")}: {new Date((item as any).validityDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                  {item.stockQty != null && (
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <Box className="h-3 w-3" /> {t("marketplaceDetail.metaStock")}: {item.stockQty} {item.unit || "unit"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media Gallery — always shown (shows placeholder if no media) */}
            <MediaGallery media={mediaList} isProduct={isProduct} />

            {/* Specific info cards */}
            {isProduct
              ? <ProductInfoCard item={item} translatedSpecValues={translatedSpecValues} />
              : <ServiceInfoCard item={item} translatedSpecValues={translatedSpecValues} />
            }

            {/* Remaining spec table */}
            <SpecTable item={item} translatedSpecValues={translatedSpecValues} />

            {/* Documents (products only — template docs + uploaded media_assets docs) */}
            <DocumentList docs={(item as any).documents} mediaDocs={(item as any).mediaDocuments} />

          </div>

          {/* ── Right column ─────────────────────────────────────────────────── */}
          <div className="lg:w-80 xl:w-96 shrink-0 space-y-4">

            <PriceCalculator item={item} calc={calc} onChange={setCalc} />

            {/* CTA Buttons */}
            <div className="space-y-2">
              {!item.id ? (
                <Button
                  className="w-full h-11 rounded-xl font-semibold text-[14px]"
                  disabled
                >
                  {t("marketplaceDetail.ctaNotReady")}
                </Button>
              ) : (
                <Button
                  className="w-full h-11 rounded-xl font-semibold text-[14px] gap-2 bg-sky-600 hover:bg-sky-700"
                  onClick={() => setShowRfqDialog(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  {isProduct ? t("marketplaceDetail.ctaRfq") : t("marketplaceDetail.ctaQuote")}
                </Button>
              )}
            </div>

            {/* Estimasi total */}
            {hasPriceSell && (
              <div className="text-center text-[11px] text-slate-400">
                {t("marketplaceDetail.estimasiLabel")}: <span className="font-semibold text-slate-700">{formatPrice(grandTotal, item.currency)}</span>
                {calc.includePpn && ` (${t("marketplaceDetail.inclPpn")})`}
              </div>
            )}

            {/* RFQ Process Info */}
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
              <div className="bg-gradient-to-br from-sky-50 to-slate-50 px-4 py-3 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("marketplaceDetail.rfqHowTitle")}
                </p>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {[
                  { icon: <MessageSquare className="h-4 w-4 text-sky-500 shrink-0" />,   labelKey: "marketplaceDetail.rfqStep1" },
                  { icon: <Shield className="h-4 w-4 text-slate-400 shrink-0" />,         labelKey: "marketplaceDetail.rfqStep2" },
                  { icon: <Clock className="h-4 w-4 text-slate-400 shrink-0" />,          labelKey: "marketplaceDetail.rfqStep3" },
                ].map(({ icon, labelKey }) => (
                  <div key={labelKey} className="flex items-center gap-2.5 text-[13px] text-slate-700 font-medium">
                    {icon}
                    {t(labelKey)}
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Profile Card */}
            <VendorProfileCard vendorId={item.vendorId} itemLocation={item.location} />

            {/* Item ID for reference */}
            <p className="text-center text-[10px] text-slate-300 font-mono">ID: {item.id}</p>

          </div>
        </div>

        {/* ── Related & Similar sections (full-width below) ─────────────────── */}
        <div className="mt-6 space-y-5">
          <RelatedItemsSection
            itemId={item.id}
            onNavigate={(id) => {
              setLocation(`/marketplace/${id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <SimilarItemsSection
            itemId={item.id}
            onNavigate={(id) => {
              setLocation(`/marketplace/${id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <SameProvinceSection
            itemId={item.id}
            province={
              item.location?.includes(",")
                ? item.location.split(",").pop()!.trim()
                : item.location ?? null
            }
            onNavigate={(id) => {
              setLocation(`/marketplace/${id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>

      {/* RFQ Dialog */}
      {showRfqDialog && (
        <SubmitDialog
          item={item}
          calc={calc}
          onClose={() => setShowRfqDialog(false)}
        />
      )}
    </div>
  );
}

// ── Related Items (DEPRECATED) ────────────────────────────────────────────────
// @deprecated — uses legacy /api/marketplace/products/:id/related endpoint.
// Replaced by RelatedItemsSection which uses /api/portal/marketplace/:id/related.
// Render removed from MarketplaceDetailPage (P1). Component kept for backward compat.
type RelatedItemData = {
  id: number;
  name: string;
  vendorName?: string | null;
  templateKind?: string | null;
  priceSell?: number | null;
  unit?: string | null;
  stockStatus?: string | null;
  location?: string | null;
  leadTime?: string | null;
};

function RelatedItemCard({ item, onNavigate }: { item: RelatedItemData; onNavigate: (id: number) => void }) {
  const isProduct = item.templateKind === "product";
  return (
    <button
      onClick={() => onNavigate(item.id)}
      className="group text-left w-full bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col gap-2"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isProduct ? "bg-emerald-50" : "bg-sky-50"}`}>
        {isProduct
          ? <Package className={`h-4 w-4 ${isProduct ? "text-emerald-600" : "text-sky-600"}`} />
          : <Truck className="h-4 w-4 text-sky-600" />}
      </div>
      <p className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
        {item.name}
      </p>
      {item.vendorName && (
        <p className="text-[11px] text-slate-400 truncate">{item.vendorName}</p>
      )}
      {item.priceSell != null && (
        <p className="text-[13px] font-bold text-sky-600">
          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.priceSell)}
          {item.unit ? <span className="text-[11px] font-normal text-slate-400"> /{item.unit}</span> : null}
        </p>
      )}
      {item.leadTime && (
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3 shrink-0" />
          {item.leadTime}
        </div>
      )}
    </button>
  );
}

function RelatedItems({ currentId, onNavigate }: { currentId: number; onNavigate: (id: number) => void }) {
  const { data, isLoading } = useQuery<RelatedItemData[]>({
    queryKey: ["marketplace-related", currentId],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/products/${currentId}/related`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 120_000,
  });

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <div className="bg-slate-50 border-t border-slate-200 mt-4 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-[16px] font-bold text-slate-800 mb-4">Item Terkait</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data!.map((r) => (
              <RelatedItemCard key={r.id} item={r} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
