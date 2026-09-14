import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { supabase } from "@/lib/supabase";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/EditableText";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Store, Search, SlidersHorizontal, X, Building2, Package, Truck,
  Tag, MapPin, Clock, ChevronRight, Filter, RefreshCw, GitCompareArrows,
  BarChart2, ChevronDown, ChevronUp, TrendingUp, Camera, Loader2,
  MessageSquare, Share2, ArrowUpRight, BadgeCheck, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LabelList,
} from "recharts";
import type { MarketplaceItem, FilterFieldDef, ActiveFilters, ServiceCategoryOption } from "@/lib/catalogFilters";
import { buildCatalogFilters, matchVendorCatalog } from "@/lib/catalogFilters";
import { CompareTray, CompareModal } from "@/components/VendorComparison";
import PageSeo from "@/components/PageSeo";
import { CUSTOMER_ASSETS, staticAsset } from "@/lib/staticAssets";
import { resolveImageUrl } from "@/lib/utils";

// ── Featured product display data (from the existing public featured endpoint)
interface FeaturedMarketplaceProduct {
  id: number;
  vendorId: number;
  vendorName: string | null;
  name: string;
  isFeatured: true;
}

// ── Category accent colors + labels — used only by product cards (not hero tiles) ──
const CATEGORY_PLACEHOLDER: Record<string, { label: string; accent: string }> = {
  coffee:           { label: "Kopi",           accent: "#3d1c00" },
  coal:             { label: "Batubara",        accent: "#1a1a1a" },
  iron_steel:       { label: "Besi & Baja",    accent: "#1a2840" },
  palm_oil:         { label: "Sawit",           accent: "#1a3a0a" },
  nickel:           { label: "Nikel",           accent: "#2a2a2a" },
  copper:           { label: "Tembaga",         accent: "#5a2000" },
  rice:             { label: "Beras",           accent: "#4a4030" },
  sugar:            { label: "Gula",            accent: "#6b0f3a" },
  seafood:          { label: "Seafood",         accent: "#003d52" },
  cashew_nut:       { label: "Kacang Mete",     accent: "#5a3800" },
  fresh_pineapple:  { label: "Nanas Segar",     accent: "#3a5a00" },
  canned_pineapple: { label: "Nanas Kalengan",  accent: "#5a4a00" },
  rubber:           { label: "Karet",           accent: "#0f2e10" },
  live_fish:        { label: "Ikan Hidup",      accent: "#002b4a" },
  bird_nest:        { label: "Sarang Walet",    accent: "#3d2000" },
  frozen_food:      { label: "Frozen Food",     accent: "#001a4a" },
  furniture:        { label: "Furniture",       accent: "#3d1c00" },
  chemical:         { label: "Kimia",           accent: "#1a0040" },
  textile:          { label: "Tekstil",         accent: "#3d0020" },
  trucking:         { label: "Trucking",        accent: "#0a1a30" },
  sea_freight:      { label: "Sea Freight",     accent: "#001a30" },
  air_freight:      { label: "Air Freight",     accent: "#000820" },
  ppjk:             { label: "PPJK",            accent: "#0a1020" },
  handling:         { label: "Handling",        accent: "#0a1a0a" },
  document:         { label: "Dokumen",         accent: "#0a1a30" },
  exim_service:     { label: "Exim Service",    accent: "#001030" },
};

// ── Category emoji map ───────────────────────────────────────────────────────
const CATEGORY_EMOJIS: Record<string, string> = {
  all: "🏪", coffee: "☕", coal: "⛏️", iron_steel: "🔩", palm_oil: "🌴",
  nickel: "🪨", copper: "🔶", rice: "🌾", sugar: "🍬", seafood: "🐟",
  cashew_nut: "🥜", fresh_pineapple: "🍍", canned_pineapple: "🍍",
  fresh_vegetable: "🥦", peanut: "🥜", rubber: "🌿", live_fish: "🐠",
  bird_nest: "🪺", frozen_food: "🧊", furniture: "🪑", chemical: "⚗️",
  textile: "🧵", trucking: "🚛", sea_freight: "🚢", air_freight: "✈️",
  ppjk: "📋", handling: "🏗️", document: "📄", exim_service: "🌐",
};

// ── Category keys (labels resolved via t() inside the component) ─────────────
const PRODUCT_CAT_KEYS = [
  "all",
  "coffee", "coal", "iron_steel", "palm_oil", "nickel", "copper",
  "rice", "sugar", "seafood", "cashew_nut", "fresh_pineapple", "canned_pineapple",
  "fresh_vegetable", "peanut", "rubber", "live_fish", "bird_nest",
  "frozen_food", "furniture", "chemical", "textile",
] as const;


// ── Currency formatter ────────────────────────────────────────────────────────
function formatPrice(price: number, currency: string): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price);
  }
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

// ── Price Comparison Chart ────────────────────────────────────────────────────
function PriceComparisonChart({
  items,
  onItemClick,
}: {
  items: MarketplaceItem[];
  onItemClick: (id: number) => void;
}) {
  const compact = (n: number) =>
    new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);

  const priced = useMemo(() =>
    items
      .filter((i) => i.priceSell != null)
      .slice(0, 12)
      .map((i) => ({
        id: i.id,
        name: i.name.length > 28 ? i.name.slice(0, 26) + "…" : i.name,
        fullName: i.name,
        price: i.priceSell!,
        unit: i.unit ?? "unit",
        vendor: i.vendorName ?? "",
        currency: i.currency ?? "IDR",
      }))
      .sort((a, b) => b.price - a.price),
  [items]);

  if (priced.length < 2) return null;

  const maxPrice = Math.max(...priced.map((d) => d.price));
  const chartH = Math.max(200, priced.length * 54);

  const COLORS = priced.map((_, i) => {
    const ratio = i / (priced.length - 1);
    if (ratio < 0.25) return "#0ea5e9";
    if (ratio < 0.5)  return "#38bdf8";
    if (ratio < 0.75) return "#7dd3fc";
    return "#bae6fd";
  });

  return (
    <div style={{ width: "100%", height: chartH }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={priced}
          layout="vertical"
          margin={{ top: 4, right: 72, left: 8, bottom: 4 }}
          barSize={22}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            domain={[0, maxPrice * 1.15]}
            tickFormatter={(v: number) => compact(v)}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={148}
            tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(14,165,233,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as typeof priced[0];
              return (
                <div
                  className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px] max-w-[220px]"
                  style={{ pointerEvents: "none" }}
                >
                  <p className="font-bold text-slate-800 mb-0.5 leading-snug">{d.fullName}</p>
                  <p className="text-slate-400 text-[11px]">{d.vendor}</p>
                  <p className="text-sky-700 font-semibold mt-1.5">
                    {d.currency === "USD"
                      ? `USD ${d.price.toLocaleString("en-US")} / ${d.unit}`
                      : `Rp ${d.price.toLocaleString("id-ID")} / ${d.unit}`}
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="price"
            radius={[0, 6, 6, 0]}
            cursor="pointer"
            onClick={(entry: { id: number }) => onItemClick(entry.id)}
          >
            {priced.map((entry, idx) => (
              <Cell key={`cell-${entry.id}`} fill={COLORS[idx]} />
            ))}
            <LabelList
              dataKey="price"
              position="right"
              formatter={(v: number) => compact(v)}
              style={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Stock badge ───────────────────────────────────────────────────────────────
function normalizeStock(raw: string | null): string | null {
  if (!raw) return null;
  const N: Record<string, string> = {
    "ready stock": "available", "ready": "available", "in_stock": "available",
    "indent": "limited",
    "pre-order": "pre_order", "preorder": "pre_order", "pre order": "pre_order",
    "out of stock": "out_of_stock", "kosong": "out_of_stock",
  };
  return N[raw.toLowerCase().trim()] ?? raw;
}

function StockBadge({ status }: { status: string | null }) {
  const { t } = useLanguage();
  const key = normalizeStock(status);
  const MAP: Record<string, { label: string; cls: string }> = {
    available:    { label: t("marketplace.statusAvailable", "Tersedia"),   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    limited:      { label: t("marketplace.statusLimited", "Terbatas"),     cls: "bg-amber-100 text-amber-700 border-amber-200" },
    out_of_stock: { label: t("marketplace.statusOutOfStock", "Habis"),     cls: "bg-red-100 text-red-700 border-red-200" },
    pre_order:    { label: t("marketplace.statusPreOrder", "Pre-Order"),   cls: "bg-sky-100 text-sky-700 border-sky-200" },
    on_order:     { label: t("mktCard.statusOnOrder", "Available on Inquiry"), cls: "bg-sky-100 text-sky-700 border-sky-200" },
  };
  const info = (key ? MAP[key] : null) ?? { label: status ?? "—", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${info.cls}`}>{info.label}</span>;
}

// ── Spec chip summary ─────────────────────────────────────────────────────────
function SpecChips({ specValues, templateSnapshot, limit = 3 }: {
  specValues: unknown;
  templateSnapshot: unknown;
  limit?: number;
}) {
  const specs = specValues && typeof specValues === "object" ? specValues as Record<string, unknown> : {};
  const snapshot = templateSnapshot && typeof templateSnapshot === "object" ? templateSnapshot as Record<string, unknown> : {};

  const fields: Array<{ key: string; label: string }> = [];
  if (Array.isArray(snapshot["customFields"])) {
    for (const f of snapshot["customFields"] as Array<{ key: string; label: string; type: string }>) {
      if (f.type !== "textarea" && f.type !== "date") fields.push({ key: f.key, label: f.label });
    }
  } else if (Array.isArray(snapshot["fields"])) {
    for (const f of snapshot["fields"] as Array<{ key: string; label: string; type: string; section?: string }>) {
      if ((f.section === "quotation" || f.section === "both") && f.type !== "textarea" && f.type !== "date") {
        fields.push({ key: f.key, label: f.label });
      }
    }
  }

  const chips = fields
    .filter((f) => specs[f.key] !== undefined && specs[f.key] !== null && String(specs[f.key]).trim() !== "")
    .slice(0, limit)
    .map((f) => ({ label: f.label, value: String(specs[f.key]) }));

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c) => (
        <span key={c.label} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
          {c.label}: <span className="text-slate-800">{c.value}</span>
        </span>
      ))}
    </div>
  );
}

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({
  item,
  onClick,
  isCompared,
  compareDisabled,
  onToggleCompare,
}: {
  item: MarketplaceItem;
  onClick: () => void;
  isCompared: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: number) => void;
}) {
  const { t } = useLanguage();
  const isProduct = item.templateKind === "product";
  const imageSrc = item.primaryImageUrl
    ? (resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl)
    : null;
  const hasImage = !!imageSrc;
  const daysUntilExpiry = useMemo(() => {
    if (!item.validityDate) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.validityDate); expiry.setHours(0, 0, 0, 0);
    return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [item.validityDate]);

  return (
    <div
      role={isCompared ? undefined : "link"}
      tabIndex={isCompared ? undefined : 0}
      aria-label={isCompared ? undefined : item.name}
      className={`group bg-[#FFFFFF] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isCompared
          ? "border-2 border-[#2563EB] shadow-xl shadow-blue-100/60 ring-4 ring-blue-50"
          : "border border-[#E5E7EB] hover:border-[#2563EB] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-200/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      }`}
      onClick={isCompared ? undefined : onClick}
      onKeyDown={isCompared ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      {/* ── Image area ── */}
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
        {hasImage ? (
          <img
            src={imageSrc!}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
            }}
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
            isProduct
              ? "bg-gradient-to-br from-emerald-50 to-teal-100"
              : "bg-gradient-to-br from-sky-50 to-blue-100"
          }`}>
            {isProduct
              ? <Package className="h-12 w-12 text-emerald-300" />
              : <Truck className="h-12 w-12 text-sky-300" />}
            <span className="text-[11px] text-slate-400 font-medium">{t("mktCard.noPhotoYet", "No photo yet")}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white shadow-md">
              {t("mktCard.topSupplier", "⭐ Top Supplier")}
            </span>
          )}
          {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-md">
              {daysUntilExpiry <= 0 ? "Berakhir hari ini" : `${daysUntilExpiry}h lagi`}
            </span>
          )}
          {item.leadTime && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shadow-sm backdrop-blur-sm">
              <Clock className="h-2.5 w-2.5" /> {item.leadTime}
            </span>
          )}
        </div>

        {/* Video badge */}
        {item.hasVideo && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <svg className="h-2.5 w-2.5 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <span className="text-[9px] text-white font-bold">{t("marketplace.videoBadge")}</span>
          </div>
        )}

        {/* Stock badge bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <StockBadge status={item.stockStatus} />
        </div>
      </div>

      {/* ── Card content ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Supplier row */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-[#E5E7EB]">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="text-[12px] font-semibold text-[#6B7280] truncate flex-1">
            {item.vendorName ?? "Vendor"}
          </span>
          <Building2 className="h-3.5 w-3.5 text-slate-300 shrink-0" />
        </div>

        {/* Product name */}
        <h3 className="text-[15px] font-bold text-[#111827] leading-snug line-clamp-2">
          {item.name}
        </h3>

        {/* Quick info grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {item.origin && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <MapPin className="h-3 w-3 text-[#2563EB] shrink-0" />
              <span className="truncate">{item.origin}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <Tag className="h-3 w-3 text-[#2563EB] shrink-0" />
            <span className="truncate">
              {item.moq != null ? `MOQ: ${item.moq} ${item.unit ?? ""}` : t("mktCard.moqNego", "MOQ: Nego")}
            </span>
          </div>
          {item.leadTime && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <Clock className="h-3 w-3 text-[#2563EB] shrink-0" />
              <span className="truncate">{item.leadTime}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
        </div>

        {/* Spec chips */}
        <SpecChips specValues={item.specValues} templateSnapshot={item.templateSnapshot} limit={2} />

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-[#E5E7EB]">
          {item.priceSell != null ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-black text-[#2563EB]">
                {formatPrice(item.priceSell, item.currency)}
              </span>
              {item.unit && (
                <span className="text-[12px] text-[#6B7280]">/{item.unit}</span>
              )}
            </div>
          ) : (
            <span className="text-[13px] font-semibold text-[#6B7280] italic">
              {t("mktCard.priceOnRequest", "Price on Request")}
            </span>
          )}
        </div>

        {/* CTA row */}
        <div className="flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            aria-label={`Request Quotation — ${item.name}`}
            className="flex-1 h-11 sm:h-9 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-sky-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {t("mktCard.requestQuotation", "Request Quotation")}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (navigator.share) { navigator.share({ title: item.name, url: window.location.origin + `/marketplace/${item.id}` }).catch(() => {}); } }}
            aria-label={t("mktCard.shareProduct", "Bagikan produk")}
            title={t("mktCard.shareProduct", "Bagikan produk")}
            className="h-11 w-11 sm:h-9 sm:w-9 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center shrink-0 transition-all duration-200 text-[#6B7280] hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(item.id); }}
            disabled={!isCompared && compareDisabled}
            aria-label={isCompared ? t("mktCard.removeFromCompare", "Hapus dari perbandingan") : compareDisabled ? t("mktCard.maxCompareItems", "Maks. 4 item") : t("mktCard.compare", "Bandingkan")}
            title={isCompared ? t("mktCard.removeFromCompare", "Hapus dari perbandingan") : compareDisabled ? t("mktCard.maxCompareItems", "Maks. 4 item") : t("mktCard.compare", "Bandingkan")}
            className={`h-11 w-11 sm:h-9 sm:w-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
              isCompared
                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                : compareDisabled
                  ? "bg-slate-100 text-slate-300 border-[#E5E7EB] cursor-not-allowed"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50"
            }`}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Detail Modal ──────────────────────────────────────────────────────────────
function ItemDetailModal({ item, onClose }: { item: MarketplaceItem; onClose: () => void }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const specs = item.specValues && typeof item.specValues === "object" ? item.specValues as Record<string, unknown> : {};
  const snapshot = item.templateSnapshot && typeof item.templateSnapshot === "object" ? item.templateSnapshot as Record<string, unknown> : {};

  const fields: Array<{ key: string; label: string; type: string; section?: string }> = [];
  if (Array.isArray(snapshot["customFields"])) {
    fields.push(...(snapshot["customFields"] as typeof fields));
  } else if (Array.isArray(snapshot["fields"])) {
    (snapshot["fields"] as typeof fields)
      .filter((f) => f.section === "quotation" || f.section === "both")
      .forEach((f) => fields.push(f));
  }

  const filledFields = fields.filter(
    (f) => f.type !== "textarea" && specs[f.key] !== undefined && specs[f.key] !== null && String(specs[f.key]).trim() !== "",
  );

  function handleRequestQuote() {
    onClose();
    if (item.templateKind === "service") {
      setLocation(`/jasa/vendor/${item.id}`);
    } else {
      setLocation(`/marketplace/${item.id}`);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {item.templateKind === "product"
              ? <Package className="h-4 w-4 text-emerald-500" />
              : <Truck className="h-4 w-4 text-sky-500" />
            }
            <DialogTitle className="text-[16px] font-bold text-slate-800 leading-tight">
              {item.name}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[12px] text-slate-500 font-semibold">{item.vendorName ?? "Vendor"}</span>
            <StockBadge status={item.stockStatus} />
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Price block */}
          {item.priceSell != null ? (
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
              <div className="text-[11px] text-sky-600 font-semibold uppercase tracking-wider mb-0.5">{t("mktCard.sellPrice")}</div>
              <div className="text-[20px] font-extrabold text-sky-700">
                {formatPrice(item.priceSell, item.currency)}
                {item.unit && <span className="text-[13px] font-medium text-sky-500 ml-1">/ {item.unit}</span>}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div className="text-[13px] font-semibold text-slate-500 italic">{t("mktCard.priceOnRequestDialog")}</div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{t("mktCard.description")}</div>
              <p className="text-[13px] text-slate-700 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Specs */}
          {filledFields.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("mktCard.specifications")}</div>
              <div className="grid grid-cols-2 gap-2">
                {filledFields.map((f) => (
                  <div key={f.key} className="bg-slate-50 rounded-lg px-3 py-2">
                    <div className="text-[10px] text-slate-400 font-semibold">{f.label}</div>
                    <div className="text-[13px] font-bold text-slate-800 mt-0.5">{String(specs[f.key])}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {item.origin && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span><span className="text-slate-400">{t("mktCard.originLabel")}:</span> {item.origin}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span><span className="text-slate-400">{t("mktCard.locationLabel")}:</span> {item.location}</span>
              </div>
            )}
            {item.leadTime && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span><span className="text-slate-400">{t("mktCard.leadTimeLabel")}:</span> {item.leadTime}</span>
              </div>
            )}
            {item.moq != null ? (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span><span className="text-slate-400">{t("mktCard.moqLabel")}</span> {item.moq} {item.unit ?? ""}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span><span className="text-slate-400">{t("mktCard.moqLabel")}</span> <span className="italic text-slate-400">{t("mktCard.moqOnRequest")}</span></span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Button
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-10 text-[13px] font-semibold"
              onClick={handleRequestQuote}
            >
              {t("marketplace.requestQuoteBtn")}
            </Button>
            <Button variant="outline" className="rounded-xl h-10 text-[13px]" onClick={onClose}>
              {t("marketplace.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Filter Sidebar ─────────────────────────────────────────────────────────────
function FilterSidebar({
  filters,
  active,
  onChange,
  onReset,
  searchQuery,
  onSearchChange,
  isService,
  serviceCategories,
  activeCategory,
  onCategoryChange,
}: {
  filters: FilterFieldDef[];
  active: ActiveFilters;
  onChange: (key: string, value: string | [number | null, number | null] | null) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  isService?: boolean;
  serviceCategories?: ServiceCategoryOption[];
  activeCategory?: string;
  onCategoryChange?: (key: string) => void;
}) {
  const { t } = useLanguage();
  const hasActive = Object.values(active).some((v) => v !== null) || searchQuery.trim() !== "";

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-3 lg:sticky lg:top-[140px] lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain lg:pb-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("marketplace.searchPlaceholder", "Cari produk, vendor, atau HS Code...")}
          className="pl-10 pr-9 rounded-2xl h-11 border-slate-200 bg-white text-[13px] focus:border-sky-300 transition-colors"
        />
        {searchQuery ? (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Reset — always shown, disabled when nothing active */}
      <button
        onClick={onReset}
        disabled={!hasActive}
        className={`flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-200 ${
          hasActive
            ? "text-sky-600 hover:text-sky-800"
            : "text-slate-300 cursor-not-allowed"
        }`}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {t("marketplace.resetFilter")}
      </button>

      {/* ── Kategori Layanan (service only, driven from actual item data) ── */}
      {isService && serviceCategories && serviceCategories.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {t("marketplace.serviceCategory")}
          </div>
          <div className="space-y-0.5">
            {/* "Semua" option */}
            <button
              onClick={() => onCategoryChange?.("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                !activeCategory || activeCategory === "all"
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {t("marketplace.allServices")}
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => onCategoryChange?.(cat.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                  activeCategory === cat.key
                    ? "bg-sky-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter cards (template-derived + standard) */}
      {filters.map((f) => (
        <div key={f.key} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{f.label}</div>
          {f.type === "select" && f.options && (
            <Select
              value={(active[f.key] as string | undefined) ?? ""}
              onValueChange={(v) => onChange(f.key, v === "__all__" ? null : v)}
            >
              <SelectTrigger className="h-8 text-[12px] rounded-lg border-slate-200">
                <SelectValue placeholder={t("mktCard.filterAllOption", "Semua")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("mktCard.filterAllOption", "Semua")}</SelectItem>
                {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {f.type === "number-range" && f.min !== undefined && f.max !== undefined && (
            <div className="space-y-2 px-1">
              <Slider
                min={f.min}
                max={f.max}
                step={f.max > 1000 ? Math.round((f.max - f.min) / 100) : 1}
                value={(() => {
                  const v = active[f.key] as [number | null, number | null] | null;
                  return [v?.[0] ?? f.min!, v?.[1] ?? f.max!];
                })()}
                onValueChange={([a, b]) => onChange(f.key, [a, b])}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{((active[f.key] as [number | null, number | null] | null)?.[0] ?? f.min)?.toLocaleString("id-ID")}</span>
                <span>{((active[f.key] as [number | null, number | null] | null)?.[1] ?? f.max)?.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {isService && (!serviceCategories || serviceCategories.length === 0) && filters.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center text-[12px] text-slate-400">
          <Filter className="h-4 w-4 mx-auto mb-1 opacity-40" />
          {t("marketplace.filterHint")}
        </div>
      )}
      {!isService && filters.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center text-[12px] text-slate-400">
          <Filter className="h-4 w-4 mx-auto mb-1 opacity-40" />
          {t("marketplace.filterHint")}
        </div>
      )}
    </aside>
  );
}

// ── Smart keyword → type/category detection ───────────────────────────────────
const SERVICE_KEYWORD_MAP: Array<{ terms: string[]; category: string }> = [
  { terms: ["trucking", "truck", "truk", "angkutan", "darat"],              category: "trucking"      },
  { terms: ["ppjk", "customs", "kepabeanan", "bea cukai", "pabean"],        category: "ppjk"          },
  { terms: ["sea freight", "seafreight", "fcl", "lcl", "kapal", "laut"],    category: "sea_freight"   },
  { terms: ["air freight", "airfreight", "udara", "pesawat"],               category: "air_freight"   },
  { terms: ["freight", "forwarding", "ekspedisi"],                          category: "sea_freight"   },
  { terms: ["handling", "cargo handling", "bongkar muat"],                  category: "handling"      },
  { terms: ["document", "dokumen", "surat", "perizinan"],                   category: "document"      },
  { terms: ["exim", "ekspor", "impor", "export", "import"],                 category: "exim_service"  },
];

const PRODUCT_KEYWORDS = [
  "kopi", "coffee", "batubara", "coal", "sawit", "palm", "nikel", "nickel",
  "tembaga", "copper", "beras", "rice", "gula", "sugar", "seafood", "ikan",
  "frozen", "furniture", "kimia", "chemical", "tekstil", "textile",
  "besi", "baja", "iron", "steel",
  // Phase 3 — CST product families
  "cashew", "kacang", "mete", "pineapple", "nanas", "tuna", "arabica", "gayo", "slices", "chunks",
];

// @deprecated — keyword detection is service-tab only; service tab removed. Kept for product fallback. (P7)
function detectTypeFromQ(q: string): { tab: "product" | "service"; category: string } | null {
  if (!q.trim()) return null;
  const lower = q.toLowerCase();

  for (const { terms, category } of SERVICE_KEYWORD_MAP) {
    if (terms.some((t) => lower.includes(t))) {
      return { tab: "service", category };
    }
  }
  if (PRODUCT_KEYWORDS.some((k) => lower.includes(k))) {
    return { tab: "product", category: "all" };
  }
  return null;
}

// ── Marketplace Trust Stats (live) ───────────────────────────────────────────
function MarketplaceTrustStats() {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useQuery<{ itemCount: number; vendorCount: number; categoryCount: number }>({
    queryKey: ["marketplace-stats"],
    queryFn: () => fetch("/api/portal/marketplace/stats").then((r) => {
      if (!r.ok) throw new Error("stats error");
      return r.json();
    }),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-5">
            {i > 1 && <div className="w-px h-7 bg-white/20" />}
            <div className="space-y-1">
              <div className="h-6 w-10 bg-white/20 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-white/30 text-[12px]">{t("marketplace.statsUnavailable")}</p>
    );
  }

  const stats = [
    {
      val: data.categoryCount > 0 ? `${data.categoryCount}+` : "—",
      label: t("marketplace.statsCategories"),
    },
    {
      val: data.vendorCount > 0 ? `${data.vendorCount}` : "—",
      label: t("marketplace.statsVendors"),
    },
    { val: data.itemCount > 0 ? `${data.itemCount}+` : "B2B", label: data.itemCount > 0 ? t("marketplace.statsItems") : t("marketplace.statsB2BPlatform") },
  ];

  return (
    <div className="flex items-center gap-6">
      {stats.map(({ val, label }, i) => (
        <div key={i} className="flex items-center gap-5">
          {i > 0 && <div className="w-px h-7 bg-white/20" />}
          <div>
            <p className="text-[20px] font-black text-white leading-none">{val}</p>
            <p className="text-white/45 text-[11px] mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Realtime: vendor_catalog_items (INSERT/UPDATE/DELETE) ────────────────────
// Deteksi service item: templateKind=service, kind=service, serviceType ada, atau category jasa
function isServiceCatalogItem(row: Record<string, unknown>): boolean {
  return row["template_kind"] === "service"
    || row["templateKind"] === "service"
    || row["kind"] === "service"
    || !!row["service_type"]
    || !!row["serviceType"];
}

function useMarketplaceCatalogRealtime() {
  const qc = useQueryClient();

  const handleCatalogChange = useCallback((payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
    const row = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
    const isService = isServiceCatalogItem(row);

    if (import.meta.env.DEV) {
      console.log("[Realtime] vendor_catalog_items changed", payload.eventType, row["id"], isService ? "service" : "product");
    }

    if (isService) {
      // Refetch semua query marketplace tab service
      qc.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey as unknown[];
          return k[0] === "marketplace" && k[1] === "service";
        },
      });
    } else {
      // Refetch semua query marketplace tab product
      qc.invalidateQueries({
        predicate: (q) => {
          const k = q.queryKey as unknown[];
          return k[0] === "marketplace" && k[1] === "product";
        },
      });
    }
  }, [qc]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("marketplace-catalog-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vendor_catalog_items" },
        handleCatalogChange,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "vendor_catalog_items" },
        handleCatalogChange,
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "vendor_catalog_items" },
        handleCatalogChange,
      )
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [handleCatalogChange]);
}

// ── Compact featured-product discovery tiles ───────────────────────────────────
function FeaturedProductsShowcase({
  featuredProducts,
  items,
  onProductClick,
}: {
  featuredProducts: FeaturedMarketplaceProduct[];
  items: MarketplaceItem[];
  onProductClick: (productId: number) => void;
}) {
  const { t } = useLanguage();
  const tiles = featuredProducts.slice(0, 6).map((featured) => {
    const catalogItem = items.find((item) => item.id === featured.id);
    const rawImage = catalogItem?.primaryImageUrl ?? null;
    return {
      id: featured.id,
      label: featured.name,
      imageUrl: rawImage ? (resolveImageUrl(rawImage) ?? rawImage) : null,
      vendorName: featured.vendorName,
      verified: Boolean(featured.vendorId),
    };
  });

  if (!tiles.length) return null;
  return (
    <aside
      className="w-full shrink-0 self-center rounded-[22px] border border-white/15 bg-slate-950/45 p-3 shadow-[0_18px_44px_rgba(2,8,23,0.28)] backdrop-blur-md md:w-[370px] lg:w-[400px]"
      aria-label={t("marketplace.featuredProductsAria", "Featured Products")}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-amber-200">
            <Sparkles className="h-3 w-3 shrink-0" />
            {t("marketplace.featuredProductsBadge", "Featured Products")}
          </div>
          <h2 className="mt-1 text-[16px] font-black tracking-tight text-white">
            {t("marketplace.featuredProductsTitle", "Produk Unggulan")}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.08] px-2 py-1 text-[9px] font-bold text-white/60">
          {tiles.length}/6
        </span>
      </div>

      <div
        className="mt-3 grid grid-cols-3 gap-2"
        aria-label={t("marketplace.featuredProductsSelector", "Select a featured product")}
      >
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => onProductClick(tile.id)}
            aria-label={`${t("marketplace.viewProductDetail", "Lihat Detail Produk")} — ${tile.label}`}
            className="group relative aspect-[1.08] min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-lg hover:shadow-slate-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(125,211,252,0.2),transparent_45%),linear-gradient(135deg,#1e293b,#0f172a)]">
              <Package className="h-8 w-8 text-white/20" />
            </div>
            {tile.imageUrl && (
              <img
                src={tile.imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-2 bottom-2 min-w-0">
              <p className="truncate text-[11px] font-extrabold leading-tight text-white">{tile.label}</p>
              {tile.vendorName && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] font-medium text-white/55">
                  <Building2 className="h-2.5 w-2.5 shrink-0" />
                  {tile.vendorName}
                  {tile.verified && <BadgeCheck className="h-2.5 w-2.5 shrink-0 text-emerald-300" />}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 px-1 text-[9px] font-semibold text-white/40">
        {t("marketplace.featuredProductsHint", "Pilihan produk dari vendor terverifikasi")}
      </p>
    </aside>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { t } = useLanguage();
  const { content, isAdmin, uploadImage } = useEditMode();
  const [, setLocation] = useLocation();
  const search = useSearch(); // e.g. "type=service&category=trucking&q=foo"

  // Redirect trucking category to dedicated /trucking page
  useEffect(() => {
    const sp = new URLSearchParams(search);
    if (sp.get("category") === "trucking") {
      setLocation("/trucking");
    }
  }, [search, setLocation]);

  // Derive tab/category/q from URL search string — reactive to navigation
  // If `type` is explicit in URL → honour it.
  // If only `q` is present → auto-detect tab/category from keyword.
  const { urlTab, urlCategory, urlQ } = useMemo(() => {
    const sp = new URLSearchParams(search);
    const explicitType = sp.get("type");
    const rawQ        = sp.get("q") ?? sp.get("search") ?? "";
    const rawCat      = sp.get("category") ?? "all";

    // Always product tab — service tab removed
    if (explicitType === "product") {
      return {
        urlTab:      "product" as const,
        urlCategory: rawCat,
        urlQ:        rawQ,
      };
    }

    // No explicit type — try to detect from keyword (product only)
    if (rawQ) {
      const detected = detectTypeFromQ(rawQ);
      if (detected && detected.tab === "product") {
        return {
          urlTab:      "product" as const,
          urlCategory: rawCat !== "all" ? rawCat : detected.category,
          urlQ:        rawQ,
        };
      }
    }

    // Fallback: product tab
    return {
      urlTab:      "product" as const,
      urlCategory: rawCat,
      urlQ:        rawQ,
    };
  }, [search]);

  // P5 — Trust stats from API (replaces hardcoded "50+" / "100%")
  const { data: trustStats } = useQuery<{
    totalVendors: number; verifiedVendors: number;
    totalItems: number; totalRfqs: number; avgRating: number | null;
  }>({
    queryKey: ["marketplace-stats"],
    queryFn: () => fetch("/api/portal/marketplace/stats").then((r) => r.json()),
    staleTime: 5 * 60_000,
  });

  const [activeTab, setActiveTab] = useState<"product" | "service">(urlTab);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // ── Search ↔ URL sync (debounced 400 ms so URL updates after user stops typing) ──
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q); // immediate — keeps input responsive
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      if (q.trim()) {
        sp.set("q", q.trim());
      } else {
        sp.delete("q");
        sp.delete("search"); // normalize both aliases out
      }
      const next = `/marketplace?${sp.toString()}`;
      const current = window.location.pathname + window.location.search;
      if (current !== next) setLocation(next);
    }, 400);
  }, [setLocation]);

  // ── Compare state ────────────────────────────────────────────────────────
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const MAX_COMPARE = 4;

  // ── Featured products — reuse the existing canonical Admin Portal selection
  const { data: featuredProducts = [] } = useQuery<FeaturedMarketplaceProduct[]>({
    queryKey: ["marketplace-featured-products"],
    queryFn: () =>
      fetch("/api/portal/marketplace/featured?limit=6").then((r) => {
        if (!r.ok) throw new Error("featured-products error");
        return r.json();
      }),
    staleTime: 2 * 60_000,
    retry: 1,
  });

  // ── Category image customisation (admin only) ─────────────────────────────
  const [customCategoryImgs, setCustomCategoryImgs] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("portal_category_images");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [uploadingCat, setUploadingCat] = useState<string | null>(null);
  const [failedTileLabels, setFailedTileLabels] = useState<Set<string>>(new Set());
  const catImgInputRef = useRef<HTMLInputElement>(null);
  const pendingCatLabelRef = useRef<string | null>(null);

  const handleCatImgChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const label = pendingCatLabelRef.current;
    if (!file || !label) return;
    e.target.value = "";
    setUploadingCat(label);
    try {
      const url = await uploadImage(file);
      setCustomCategoryImgs((prev) => {
        const next = { ...prev, [label]: url };
        try { localStorage.setItem("portal_category_images", JSON.stringify(next)); } catch {}
        return next;
      });
    } catch {
      /* silent — original image stays */
    } finally {
      setUploadingCat(null);
    }
  }, [uploadImage]);

  const handleToggleCompare = useCallback((id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareIds([]);
    setShowCompareModal(false);
  }, []);
  // Realtime: vendor_catalog_items untuk item service dari etalase vendor
  useMarketplaceCatalogRealtime();

  // Sync state whenever URL search params change (navbar links, back/forward)
  useEffect(() => {
    setActiveTab(urlTab);
    setActiveCategory(urlCategory);
    setSearchQuery(urlQ);
    setActiveFilters({});
    setCurrentPage(1);
  }, [urlTab, urlCategory, urlQ]);

  // Fetch active category keys (only categories that have ≥1 published product).
  // Guard: queryFn throws on non-OK so react-query sets data=undefined (→ [] default).
  // select guard covers any stale non-array already in the cache.
  const { data: activeCategoryKeys = [] } = useQuery<string[]>({
    queryKey: ["marketplace-active-categories"],
    queryFn: async () => {
      const r = await fetch("/api/marketplace/categories");
      if (!r.ok) throw new Error(`categories ${r.status}`);
      const body = await r.json();
      return Array.isArray(body) ? body : [];
    },
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60_000,
  });

  // Build translated category list; always show "all", others only if they have products
  const categories = PRODUCT_CAT_KEYS
    .filter((key) => key === "all" || activeCategoryKeys.includes(key))
    .map((key) => ({ key, label: t(`marketplace.cat_${key}`) }));

  function handleCategoryChange(cat: string) {
    const sp = new URLSearchParams(search);
    if (cat === "all") sp.delete("category"); else sp.set("category", cat);
    sp.delete("q");
    setLocation(`/marketplace?${sp.toString()}`);
  }

  // ── Fetch all published items for current tab + category + search ─────────
  // `urlQ` only changes after the 400ms debounce (handleSearchChange writes it
  // to the URL), so using it here — rather than the immediate `searchQuery`
  // state — naturally debounces the server round-trip without extra timers.
  const queryKey = ["marketplace", activeTab, activeCategory, urlQ];
  const { data: items = [], isLoading } = useQuery<MarketplaceItem[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ kind: activeTab });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (urlQ.trim()) params.set("q", urlQ.trim());
      const res = await fetch(`/api/portal/marketplace?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat marketplace");
      return res.json() as Promise<MarketplaceItem[]>;
    },
    // Publication transitions must be reflected without waiting for a
    // client-side cache window to expire.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ── Build filters from fetched items ──────────────────────────────────────
  const filters = useMemo(() => buildCatalogFilters(items, t), [items, t]);

  // Service tab removed — marketplace is product-only

  // ── Apply active filters + search ─────────────────────────────────────────
  const visibleItems = useMemo(() => {
    const merged: ActiveFilters = { ...activeFilters };
    if (searchQuery.trim()) merged["__search"] = searchQuery.trim();
    return items
      .filter((item) => matchVendorCatalog(item, merged));
  }, [items, activeFilters, searchQuery]);

  // ── Compare items (resolved from IDs → actual items) ─────────────────────
  const compareItems = useMemo(
    () => compareIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as MarketplaceItem[],
    [compareIds, items],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | [number | null, number | null] | null) => {
      setActiveFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setActiveFilters({});
    setSearchQuery("");
    setCurrentPage(1);
    // Also clear search from URL so a shared/bookmarked URL stays clean
    const sp = new URLSearchParams(search);
    sp.delete("q");
    sp.delete("search");
    setLocation(`/marketplace?${sp.toString()}`);
  }, [search, setLocation]);

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== null).length + (searchQuery.trim() ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const pagedItems = visibleItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [showPriceChart, setShowPriceChart] = useState(false);

  const pricedItemCount = useMemo(
    () => visibleItems.filter((i) => i.priceSell != null).length,
    [visibleItems],
  );

  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageSeo path="/marketplace" />
      {/* ── DEV DATA badge — hanya tampil di dev/preview, tidak di production ── */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-400/90 text-amber-900 shadow-lg border border-amber-500/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
            DEV DATA
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO — Full-bleed photo background                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 320,
          transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${CUSTOMER_ASSETS.marketplaceHero}')`,
            transform: "scale(1.04)",
            filter: "brightness(0.38) saturate(1.15)",
          }}
        />
        {/* Fallback bg layers: local first (deepest), then Supabase port-operations, then gambar-baru on top */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-0"
          style={{ backgroundImage: `url('${CUSTOMER_ASSETS.portOperations}')`, filter: "brightness(0.38)" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center -z-0"
          style={{ backgroundImage: `url('${CUSTOMER_ASSETS.portOperations}')`, filter: "brightness(0.38)" }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-slate-800/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Radial accent glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-60px", left: "-60px", width: 380, height: 380,
            background: "radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 70%)",
          }}
        />

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">

            {/* Left — headline */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-sky-500/25 flex items-center justify-center backdrop-blur-sm shrink-0 border border-sky-400/30">
                  <Store className="text-sky-400" style={{ width: 18, height: 18 }} />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-px w-6 bg-sky-400" />
                  <EditableText
                     contentKey="mkt_hero_badge"
                     defaultValue={content["mkt_hero_badge"] ?? t("marketplace.vendorBadge", "Vendor Marketplace")}
                     as="span"
                     className="text-sky-400 text-[11px] font-bold uppercase tracking-[0.18em]"
                   />
                </div>
              </div>

              <h1 className="text-3xl md:text-[2.4rem] font-black text-white leading-[1.15] mb-3 tracking-tight">
                <EditableText
                  contentKey="mkt_hero_prefix"
                  defaultValue={content["mkt_hero_prefix"] ?? t("marketplace.vendorPrefix", "Etalase")}
                  as="span"
                />{" "}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg,#38bdf8,#7dd3fc)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  <EditableText
                    contentKey="mkt_hero_highlight"
                    defaultValue={content["mkt_hero_highlight"] ?? t("marketplace.vendorHighlight", "Vendor")}
                    as="span"
                  />
                </span>{" "}
                <EditableText
                  contentKey="mkt_hero_suffix"
                  defaultValue={content["mkt_hero_suffix"] ?? t("marketplace.vendorSuffix", "Terverifikasi")}
                  as="span"
                />
              </h1>
              <EditableText
                contentKey="mkt_hero_desc"
                defaultValue={content["mkt_hero_desc"] ?? t("marketplace.vendorDesc", "Jelajahi produk komoditas dari vendor terverifikasi. Bandingkan spesifikasi, cek ketersediaan, dan ajukan penawaran langsung.")}
                as="p"
                multiline
                className="text-white/55 text-[14px] leading-relaxed max-w-md mb-7"
              />

              {/* Trust stats — live from API */}
              <MarketplaceTrustStats />

              {/* Quick-access commodity chips */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { emoji: "☕", label: "Coffee",   key: "coffee"     },
                  { emoji: "🌴", label: "Palm Oil", key: "palm_oil"   },
                  { emoji: "🐟", label: "Seafood",  key: "seafood"    },
                  { emoji: "⛏️", label: "Coal",     key: "coal"       },
                  { emoji: "🥜", label: "Cashew",   key: "cashew_nut" },
                ].filter(({ key }) => categories.some((c) => c.key === key)).map(({ emoji, label, key }) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white/75 hover:text-white text-[12px] font-medium transition-all duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-1"
                  >
                    <span className="text-[13px]">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Hero CTA */}
              <div className="mt-5">
                <button
                  onClick={() => {
                    const el = document.getElementById("marketplace-grid");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-white text-[14px] font-bold transition-all duration-200 shadow-lg shadow-sky-900/40 hover:shadow-sky-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-500"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t("marketplace.requestQuoteBtn")}
                </button>
              </div>
            </div>

            <FeaturedProductsShowcase
              featuredProducts={featuredProducts}
              items={items}
              onProductClick={(productId) => setLocation(`/marketplace/${productId}`)}
            />

          </div>
        </div>
      </div>

      {/* ── Category chips ────────────────────────────────────────────────── */}
      <div className="sticky top-[76px] z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-2.5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  activeCategory === cat.key
                    ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200/50"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700 hover:shadow-sm"
                }`}
              >
                {CATEGORY_EMOJIS[cat.key] && (
                  <span className="text-[13px] leading-none">{CATEGORY_EMOJIS[cat.key]}</span>
                )}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Price Comparison Chart panel ─────────────────────────────────────── */}
      {!isLoading && pricedItemCount >= 2 && (
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Toggle header */}
            <button
              onClick={() => setShowPriceChart((prev) => !prev)}
              className="w-full flex items-center justify-between py-2.5 text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                  <BarChart2 className="h-3.5 w-3.5 text-sky-600" />
                </div>
                <span className="text-[13px] font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                  {t("marketplace.comparePrices")}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {t("marketplace.priceChartItemCount").replace("{n}", String(pricedItemCount))}
                </span>
                {showPriceChart && (
                  <span className="text-[11px] text-slate-400 italic font-normal hidden sm:inline">
                    · {t("marketplace.priceChartClickHint")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-sky-600 transition-colors">
                <TrendingUp className="h-3.5 w-3.5" />
                {showPriceChart
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
                }
              </div>
            </button>

            {/* Collapsible chart body */}
            {showPriceChart && (
              <div className="pb-5 pt-1">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {t("marketplace.priceChartTitle")}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      {[
                        { color: "#0ea5e9", label: t("marketplace.priceHighest") },
                        { color: "#7dd3fc", label: t("marketplace.priceMid") },
                        { color: "#bae6fd", label: t("marketplace.priceLowest") },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1 mr-2">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[10px] text-slate-500">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <PriceComparisonChart
                    items={visibleItems}
                    onItemClick={(id) => setLocation(`/marketplace/${id}`)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div id="marketplace-grid" className="max-w-7xl mx-auto px-4 py-6">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            aria-label={showMobileFilter ? t("marketplace.closeFilter") : t("marketplace.openFilter")}
            aria-expanded={showMobileFilter}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:border-sky-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("marketplace.filterBtn", "Filter")}
            {activeFilterCount > 0 && (
              <span className="ml-0.5 bg-sky-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
          {isLoading
            ? <span className="text-[12px] text-slate-400 animate-pulse">{t("marketplace.loadingMobile")}</span>
            : <span className="text-[12px] text-slate-500">{visibleItems.length} {t("marketplace.itemFound")}</span>
          }
        </div>

        <div className="flex gap-6">
          {/* ── Filter Sidebar — desktop always, mobile conditional ────────── */}
          <div className={`${showMobileFilter ? "block" : "hidden"} lg:block`}>
            <FilterSidebar
              filters={filters}
              active={activeFilters}
              onChange={handleFilterChange}
              onReset={handleReset}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              isService={false}
              serviceCategories={[]}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* ── Item grid ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Desktop count */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              {isLoading
                ? <span className="text-[13px] text-slate-400 animate-pulse">{t("marketplace.loadingProducts")}</span>
                : <span className="text-[13px] text-slate-500">
                    <span className="font-semibold text-slate-800">{visibleItems.length}</span> {t("marketplace.itemFound")}
                    {items.length !== visibleItems.length && <span className="ml-1">{t("marketplace.itemFoundOf").replace("{n}", String(items.length))}</span>}
                  </span>
              }
              {activeFilterCount > 0 && (
                <button onClick={handleReset} className="text-[12px] text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> {t("marketplace.resetFiltersCount").replace("{n}", String(activeFilterCount))}
                </button>
              )}
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                    {/* Image area */}
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200" style={{ aspectRatio: "4/3" }}>
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-300/60" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Supplier row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-200" />
                        <div className="h-3 bg-slate-200 rounded flex-1" />
                      </div>
                      {/* Title lines */}
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-full" />
                        <div className="h-4 bg-slate-200 rounded w-4/5" />
                      </div>
                      {/* Quick info */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-3 bg-slate-100 rounded" />
                        <div className="h-3 bg-slate-100 rounded" />
                      </div>
                      {/* Price */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="h-6 bg-slate-200 rounded w-1/2" />
                      </div>
                      {/* CTA */}
                      <div className="flex gap-2">
                        <div className="h-9 bg-slate-200 rounded-xl flex-1" />
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && visibleItems.length === 0 && (
              <>
                {activeFilterCount > 0 || searchQuery.trim() ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-[16px] font-semibold text-slate-500">{t("marketplace.noProductsMatch")}</p>
                    <p className="text-[13px] text-slate-400 mt-1 max-w-xs">{t("marketplace.tryChangeFilters")}</p>
                    <button onClick={handleReset} className="mt-4 text-[13px] text-sky-600 font-semibold hover:underline">
                      {t("marketplace.clearAllFilters", "Hapus semua filter")}
                    </button>
                  </div>
                ) : (
                  /* ── Premium "Coming Soon" showcase ──────────────────────── */
                  <div className="space-y-8 pb-8">
                    {/* Banner */}
                    <div
                      className="relative rounded-2xl overflow-hidden p-8 md:p-10"
                      style={{
                        background: "linear-gradient(135deg, #0f172a 0%, #0c2340 50%, #0e3a5c 100%)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      }}
                    >
                      {/* Subtle grid pattern */}
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                          backgroundSize: "32px 32px",
                        }}
                      />
                      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="h-px w-6 bg-sky-400" />
                            <span className="text-sky-400 text-[11px] font-bold uppercase tracking-widest">{t("marketplace.comingSoonHeader")}</span>
                          </div>
                          <h3 className="text-white text-xl md:text-2xl font-extrabold leading-tight mb-2">
                            {t("marketplace.comingSoonTitleLine1")}<br />
                            <span className="text-sky-400">{t("marketplace.comingSoonTitleLine2")}</span>
                          </h3>
                          <p className="text-white/50 text-[13px] leading-relaxed max-w-md">
                            {t("marketplace.comingSoonDesc")}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                          <a
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[13px] font-bold transition-all shadow-lg shadow-sky-500/25"
                          >
                            <Store className="h-4 w-4" /> {t("marketplace.registerAsVendor")}
                          </a>
                          <a
                            href="/jasa"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-semibold transition-all"
                          >
                            {t("marketplace.viewLogistic")}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Category showcase grid — real product photos */}
                    <div>
                      <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4">{t("marketplace.comingSoonCategories")}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {[
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "coffee" },
                          { img: staticAsset("images/products/batubara-coal.png"), catKey: "coal" },
                           { img: staticAsset("images/products/nikel.png"), catKey: "iron_steel" },
                          { img: staticAsset("images/products/sawit-palm-oil.png"), catKey: "palm_oil" },
                          { img: staticAsset("images/products/nikel.png"), catKey: "nickel" },
                           { img: staticAsset("images/products/nikel.png"), catKey: "copper" },
                          { img: staticAsset("images/products/beras-rice.png"), catKey: "rice" },
                           { img: staticAsset("images/products/beras-rice.png"), catKey: "sugar" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "seafood" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "rubber" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "live_fish" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "bird_nest" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "frozen_food" },
                           { img: staticAsset("images/products/kursi-kantor-ergonomis.png"), catKey: "furniture" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "chemical" },
                           { img: staticAsset("images/products/green-bean-arabica.png"), catKey: "textile" },
                        ].map(({ img, catKey }) => {
                          const sub = t(`marketplace.catSub_${catKey}`, catKey);
                          const label = t(`marketplace.cat_${catKey}`);
                           const rawImg = customCategoryImgs[catKey] ?? img;
                           const effectiveImg = resolveImageUrl(rawImg) ?? rawImg;
                          const isUploading = uploadingCat === label;
                          return (
                            <div
                              key={label}
                              className="group relative rounded-2xl overflow-hidden cursor-default h-[140px]"
                            >
                              <img
                                src={effectiveImg}
                                alt={label}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const el = e.currentTarget;
                                  el.style.display = "none";
                                  if (el.parentElement) el.parentElement.style.background = "linear-gradient(145deg,#1a2a3a,#2a4060)";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white font-bold text-[13px] leading-tight drop-shadow">{label}</p>
                                <p className="text-white/60 text-[10px] mt-0.5">{sub}</p>
                                <span className="mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/80 backdrop-blur-sm">{t("marketplace.comingSoon")}</span>
                              </div>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => { pendingCatLabelRef.current = label; catImgInputRef.current?.click(); }}
                                  disabled={isUploading}
                                  className="absolute top-2 right-2 z-10 rounded-lg bg-black/60 hover:bg-black/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-wait"
                                  title={`Ganti foto ${label}`}
                                >
                                  {isUploading
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Camera className="h-3.5 w-3.5" />}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA strip */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                          <Store className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-slate-800">{t("marketplace.areYouVendor")}</p>
                          <p className="text-[12px] text-slate-500">{t("marketplace.vendorCtaDesc")}</p>
                        </div>
                      </div>
                      <a
                        href="/contact"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-bold transition-all shadow-sm"
                      >
                        Hubungi Kami <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Grid */}
            {!isLoading && visibleItems.length > 0 && (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 ${compareIds.length > 0 ? "pb-28" : ""}`}>
                  {pagedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isCompared={compareIds.includes(item.id)}
                      compareDisabled={compareIds.length >= MAX_COMPARE && !compareIds.includes(item.id)}
                      onToggleCompare={handleToggleCompare}
                      onClick={() => {
                        setLocation(`/marketplace/${item.id}`);
                      }}
                    />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      ← Sebelumnya
                    </button>
                    <span className="text-[13px] text-slate-600 font-medium px-3">
                      Halaman <span className="text-sky-700 font-bold">{currentPage}</span> dari {totalPages}
                    </span>
                    <button
                      onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Berikutnya →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Compare Tray (sticky bottom) ──────────────────────────────────── */}
      <CompareTray
        compareIds={compareIds}
        allItems={items}
        onRemove={handleToggleCompare}
        onClear={handleClearCompare}
        onOpen={() => setShowCompareModal(true)}
      />

      {/* ── Compare Modal ─────────────────────────────────────────────────── */}
      {showCompareModal && compareItems.length >= 2 && (
        <CompareModal
          items={compareItems}
          onClose={() => setShowCompareModal(false)}
          onRemove={(id) => {
            handleToggleCompare(id);
            if (compareIds.length <= 2) setShowCompareModal(false);
          }}
          onRequestQuote={(item) => {
            setShowCompareModal(false);
            handleClearCompare();
            setLocation(`/marketplace/${item.id}`);
          }}
        />
      )}

      {/* Hidden file input for category image upload (admin only) */}
      <input
        ref={catImgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCatImgChange}
      />
    </div>
  );
}
