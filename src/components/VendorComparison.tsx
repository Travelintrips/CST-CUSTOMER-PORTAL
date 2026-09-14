import { useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  X, ArrowRight, Building2, MapPin, Clock, Tag, Star,
  Package, Truck, CheckCircle2, MinusCircle, AlertCircle,
  Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MarketplaceItem } from "@/lib/catalogFilters";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";

// ── helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price);
  }
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

function getSpecValues(item: MarketplaceItem): Record<string, unknown> {
  if (!item.specValues || typeof item.specValues !== "object") return {};
  return item.specValues as Record<string, unknown>;
}

function getTemplateFields(snapshot: unknown): Array<{ key: string; label: string; type: string }> {
  if (!snapshot || typeof snapshot !== "object") return [];
  const s = snapshot as Record<string, unknown>;
  if (Array.isArray(s["customFields"])) {
    return (s["customFields"] as Array<{ key: string; label: string; type: string }>)
      .filter((f) => f.type !== "textarea" && f.type !== "date");
  }
  if (Array.isArray(s["fields"])) {
    return (s["fields"] as Array<{ key: string; label: string; type: string; section?: string }>)
      .filter((f) => (f.section === "quotation" || f.section === "both") && f.type !== "textarea" && f.type !== "date");
  }
  return [];
}

function collectSpecFields(items: MarketplaceItem[]): Array<{ key: string; label: string }> {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const f of getTemplateFields(item.templateSnapshot)) {
      if (!seen.has(f.key)) seen.set(f.key, f.label);
    }
  }
  return Array.from(seen.entries()).map(([key, label]) => ({ key, label }));
}

const CATEGORY_PLACEHOLDER: Record<string, { emoji: string; from: string; to: string }> = {
  coffee:      { emoji: "☕", from: "#6F4E37", to: "#A0785A" },
  coal:        { emoji: "⛏️", from: "#2d3748", to: "#4a5568" },
  iron_steel:  { emoji: "🏗️", from: "#2b4162", to: "#546a8c" },
  palm_oil:    { emoji: "🌴", from: "#276221", to: "#4a9e41" },
  nickel:      { emoji: "🔩", from: "#4a5568", to: "#718096" },
  copper:      { emoji: "🔶", from: "#b05c1a", to: "#d4813a" },
  rice:        { emoji: "🌾", from: "#7c6d2a", to: "#b8a24a" },
  sugar:       { emoji: "🍬", from: "#c05080", to: "#e07095" },
  seafood:     { emoji: "🐟", from: "#1a6080", to: "#2a8aad" },
  rubber:      { emoji: "🌿", from: "#2d5a1b", to: "#4a8c30" },
  live_fish:   { emoji: "🐠", from: "#0d4f6e", to: "#1a7ba8" },
  bird_nest:   { emoji: "🪺", from: "#7c5a1a", to: "#b8873a" },
  frozen_food: { emoji: "❄️", from: "#1e4a7a", to: "#2e6aaa" },
  trucking:    { emoji: "🚛", from: "#1a3a6c", to: "#2a5aaa" },
  sea_freight: { emoji: "🚢", from: "#0c3057", to: "#1a5080" },
  air_freight: { emoji: "✈️", from: "#1a4060", to: "#2a6090" },
  ppjk:        { emoji: "📋", from: "#3a3060", to: "#5a4a90" },
  handling:    { emoji: "🏭", from: "#2a4a2a", to: "#4a7a4a" },
};

function StockIcon({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const s = status.toLowerCase();
  if (s === "available" || s === "ready stock" || s === "tersedia") {
    return <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[12px]"><CheckCircle2 className="h-3.5 w-3.5" />{status}</span>;
  }
  if (s === "limited" || s === "terbatas" || s === "indent" || s === "pre-order") {
    return <span className="flex items-center gap-1 text-amber-600 font-semibold text-[12px]"><AlertCircle className="h-3.5 w-3.5" />{status}</span>;
  }
  return <span className="flex items-center gap-1 text-red-500 font-semibold text-[12px]"><MinusCircle className="h-3.5 w-3.5" />{status}</span>;
}

// ── Rating types ─────────────────────────────────────────────────────────────

interface VendorRatingSummary {
  avg: number;
  count: number;
}

// ── Compare Tray (sticky bottom bar) ────────────────────────────────────────

export function CompareTray({
  compareIds,
  allItems,
  onRemove,
  onClear,
  onOpen,
}: {
  compareIds: number[];
  allItems: MarketplaceItem[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  const { t } = useLanguage();
  if (compareIds.length === 0) return null;
  const MAX = 4;
  const selected = compareIds.map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as MarketplaceItem[];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-sky-400 shadow-2xl print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="shrink-0">
          <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">{t("vendorComparison.compare", "Bandingkan")}</p>
          <p className="text-[12px] text-slate-600 font-medium">{selected.length} {t("vendorComparison.ofMax", "dari maks.")} {MAX} {t("vendorComparison.selected", "dipilih")}</p>
        </div>
        <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-none">
          {selected.map((item) => {
            const catKey = item.categoryKey ?? item.serviceType ?? "";
            const cat = CATEGORY_PLACEHOLDER[catKey];
            return (
              <div key={item.id} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0 max-w-[200px]">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={cat ? { background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` } : { background: "#e2e8f0" }}
                >
                  {cat ? cat.emoji : (item.templateKind === "service" ? "🚚" : "📦")}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{item.vendorName ?? "Vendor"}</p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 2 - selected.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center justify-center w-[120px] h-[56px] rounded-xl border-2 border-dashed border-slate-200 shrink-0">
              <span className="text-[11px] text-slate-300 font-medium">{t("vendorComparison.addItem", "+ Tambah item")}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 shrink-0 ml-auto">
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            {t("vendorComparison.clearAll", "Hapus Semua")}
          </button>
          <Button
            onClick={onOpen}
            disabled={selected.length < 2}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 py-2 text-[13px] font-bold flex items-center gap-2 disabled:opacity-40"
          >
            {t("vendorComparison.compare", "Bandingkan")} ({selected.length})
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── PDF Export ────────────────────────────────────────────────────────────────

function generateComparisonReport(
  items: MarketplaceItem[],
  ratings: Record<number, VendorRatingSummary | null>,
  specFields: Array<{ key: string; label: string }>,
  generatedBy?: string,
) {
  const docNum = `CMP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const now = new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const prices = items.map((i) => i.priceSell).filter((p) => p != null) as number[];
  const minPrice = prices.length > 1 ? Math.min(...prices) : null;

  function fmtP(p: number | null, currency: string) {
    if (p == null) return '<em style="color:#94a3b8">Harga nego</em>'; // PDF report — not translated via t()
    if (currency === "USD") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(p);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
  }

  function ratingHtml(vendorId: number) {
    const r = ratings[vendorId];
    if (!r) return '<em style="color:#94a3b8">—</em>';
    if (r.count === 0) return '<em style="color:#94a3b8">No reviews yet</em>';
    const stars = "★".repeat(Math.round(r.avg)) + "☆".repeat(5 - Math.round(r.avg));
    return `<span style="color:#f59e0b;font-size:14px">${stars}</span> <strong>${r.avg.toFixed(1)}</strong> <span style="color:#64748b;font-size:11px">(${r.count} review)</span>`;
  }

  const colW = Math.floor(100 / (items.length + 1));
  const itemCols = items.map((item) => {
    const isBest = minPrice !== null && item.priceSell === minPrice;
    const catKey = item.categoryKey ?? item.serviceType ?? "";
    const cat = CATEGORY_PLACEHOLDER[catKey];
    const primaryImageUrl = item.primaryImageUrl
      ? (resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl)
      : null;
    const thumb = primaryImageUrl
      ? `<img src="${primaryImageUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" />`
      : `<div style="width:60px;height:60px;border-radius:8px;background:linear-gradient(135deg,${cat ? cat.from : "#64748b"},${cat ? cat.to : "#94a3b8"});display:flex;align-items:center;justify-content:center;font-size:24px">${cat ? cat.emoji : (item.templateKind === "service" ? "🚚" : "📦")}</div>`;

    return `
      <th style="width:${colW}%;border:1px solid #e2e8f0;padding:14px;text-align:left;background:${isBest ? "#f0fdf4" : "#fff"};vertical-align:top">
        <div style="display:flex;gap:10px;align-items:flex-start">
          ${thumb}
          <div>
            <div style="font-size:13px;font-weight:800;color:#1e293b;line-height:1.3">${item.name}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">${item.vendorName ?? "—"}</div>
            ${isBest ? '<div style="margin-top:4px;font-size:10px;background:#16a34a;color:#fff;padding:2px 8px;border-radius:999px;display:inline-block;font-weight:700">💚 Harga Terbaik</div>' : ""}
          </div>
        </div>
      </th>`;
  }).join("");

  function dataRow(label: string, cells: string[]) {
    return `
      <tr>
        <td style="background:#f8fafc;border:1px solid #e2e8f0;padding:10px 14px;font-size:12px;font-weight:600;color:#475569;white-space:nowrap">${label}</td>
        ${cells.map((c) => `<td style="border:1px solid #e2e8f0;padding:10px 14px;font-size:13px;color:#1e293b">${c}</td>`).join("")}
      </tr>`;
  }

  const specRows = specFields.map(({ key, label }) => {
    const hasAny = items.some((item) => {
      const v = getSpecValues(item)[key];
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
    if (!hasAny) return "";
    const cells = items.map((item) => {
      const v = getSpecValues(item)[key];
      return (v !== undefined && v !== null && String(v).trim() !== "")
        ? `<strong>${String(v)}</strong>`
        : '<span style="color:#cbd5e1">—</span>';
    });
    return dataRow(label, cells);
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Comparison Report — ${docNum}</title>
<style>
  @page { size: A4 landscape; margin: 20mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; color: #1e293b; }
  table { border-collapse: collapse; width: 100%; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .logo-area { display: flex; align-items: center; gap: 12px; }
  .logo-box { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #0B3D6B, #1E6ED4); display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .brand { font-size: 18px; font-weight: 900; color: #0B3D6B; }
  .brand small { display: block; font-size: 11px; font-weight: 400; color: #64748b; }
  .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
  .doc-num { font-size: 15px; font-weight: 800; color: #0B3D6B; }
  .section-header { background: linear-gradient(90deg, #0B3D6B, #1E6ED4); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 8px 14px; text-transform: uppercase; }
  @media print { button { display: none; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo-area">
    <div class="logo-box">🚢</div>
    <div class="brand">CST Marketplace<small>Vendor Comparison Report</small></div>
  </div>
  <div class="meta">
    <div class="doc-num">${docNum}</div>
    <div>Generated: ${now}</div>
    ${generatedBy ? `<div>By: ${generatedBy}</div>` : ""}
    <div style="margin-top:8px">
      <button onclick="window.print()" style="cursor:pointer;background:#0B3D6B;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:12px;font-weight:700">
        ⬇ Download PDF
      </button>
    </div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:${colW}%;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;text-align:left;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Atribut</th>
      ${itemCols}
    </tr>
  </thead>
  <tbody>
    <tr><td colspan="${items.length + 1}" class="section-header">Informasi Harga & Ketersediaan</td></tr>
    ${dataRow("Harga", items.map((i) => fmtP(i.priceSell, i.currency)))}
    ${dataRow("Asal / Lokasi", items.map((i) => i.origin ?? i.location ?? "—"))}
    ${dataRow("Stok", items.map((i) => i.stockStatus ?? "—"))}
    ${dataRow("Lead Time", items.map((i) => i.leadTime ?? "—"))}
    ${dataRow("MOQ", items.map((i) => i.moq != null ? `${Number(i.moq).toLocaleString("id-ID")} ${i.unit ?? ""}` : "—"))}
    ${dataRow("Rating", items.map((i) => ratingHtml(i.vendorId)))}
    ${specFields.length > 0 ? `<tr><td colspan="${items.length + 1}" class="section-header">Spesifikasi Teknis</td></tr>${specRows}` : ""}
  </tbody>
</table>

<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center">
  Dokumen ini dibuat secara otomatis oleh sistem CST Marketplace. Data harga dan spesifikasi berlaku pada saat perbandingan dibuat.
  Hubungi vendor langsung untuk konfirmasi harga terkini.
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1100,height=750");
  if (!win) {
    alert("Popup diblokir. Izinkan popup di browser Anda dan coba lagi.");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ── Comparison Modal ─────────────────────────────────────────────────────────

export function CompareModal({
  items,
  onClose,
  onRemove,
  onRequestQuote,
}: {
  items: MarketplaceItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onRequestQuote: (item: MarketplaceItem) => void;
}) {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);
  const [vendorRatings, setVendorRatings] = useState<Record<number, VendorRatingSummary | null>>({});
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // Fetch real ratings for each unique vendor
  useEffect(() => {
    if (items.length === 0) return;

    const uniqueVendorIds = [...new Set(items.map((i) => i.vendorId))];
    setRatingsLoading(true);

    Promise.all(
      uniqueVendorIds.map(async (vendorId) => {
        try {
          const r = await fetch(`/api/portal/vendors/${vendorId}/reviews`);
          if (!r.ok) return [vendorId, null] as const;
          const reviews: Array<{ ratingOverall: string }> = await r.json();
          if (!reviews || reviews.length === 0) {
            return [vendorId, { avg: 0, count: 0 }] as const;
          }
          const avg = reviews.reduce((sum, rv) => sum + Number(rv.ratingOverall), 0) / reviews.length;
          return [vendorId, { avg: Math.round(avg * 10) / 10, count: reviews.length }] as const;
        } catch {
          return [vendorId, null] as const;
        }
      })
    ).then((results) => {
      const map: Record<number, VendorRatingSummary | null> = {};
      for (const [id, summary] of results) map[id] = summary;
      setVendorRatings(map);
      setRatingsLoading(false);
    });
  }, [items]);

  if (items.length === 0) return null;

  const prices = items.map((i) => i.priceSell).filter((p) => p !== null) as number[];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const specFields = collectSpecFields(items);

  function handleExportPdf() {
    generateComparisonReport(items, vendorRatings, specFields);
  }

  // Build rows config
  const FIXED_ROWS: Array<{
    key: string;
    label: string;
    render: (item: MarketplaceItem) => ReactNode;
    highlight?: (item: MarketplaceItem) => string;
  }> = [
    {
      key: "vendor",
      label: "Vendor",
      render: (item) => (
        <div className="flex items-start gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="font-semibold text-slate-800 text-[13px] leading-snug">{item.vendorName ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (item) => (
        item.priceSell != null
          ? <div>
              <span className="text-[15px] font-extrabold text-sky-700">{formatPrice(item.priceSell, item.currency)}</span>
              {item.unit && <span className="text-[11px] text-slate-400 ml-1">/ {item.unit}</span>}
            </div>
          : <span className="text-[12px] text-slate-400 italic">{t("vendorComparison.priceNegotiable", "Harga nego")}</span>
      ),
      highlight: (item) => {
        if (item.priceSell === null) return "";
        if (minPrice !== null && item.priceSell === minPrice && prices.length > 1) return "bg-emerald-50 ring-1 ring-emerald-300";
        return "";
      },
    },
    {
      key: "origin",
      label: "Asal / Lokasi",
      render: (item) => (
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="text-[13px] text-slate-700">{item.origin ?? item.location ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stok",
      render: (item) => <StockIcon status={item.stockStatus} />,
    },
    {
      key: "leadTime",
      label: "Lead Time",
      render: (item) => (
        item.leadTime
          ? <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /><span className="text-[13px] text-slate-700">{item.leadTime}</span></div>
          : <span className="text-slate-400">—</span>
      ),
    },
    {
      key: "moq",
      label: "MOQ",
      render: (item) => (
        item.moq != null
          ? <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-slate-400" /><span className="text-[13px] text-slate-700">{Number(item.moq).toLocaleString("id-ID")} {item.unit ?? ""}</span></div>
          : <span className="text-slate-400">—</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (item) => {
        const r = vendorRatings[item.vendorId];
        if (ratingsLoading && r === undefined) {
          return <Loader2 className="h-3.5 w-3.5 text-slate-300 animate-spin" />;
        }
        if (!r || r.count === 0) {
          return <span className="text-[12px] text-slate-400 italic">{t("vendorComparison.noReviews", "No reviews yet")}</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s <= Math.round(r.avg) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-[13px] font-bold text-slate-700">{r.avg.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({r.count})</span>
          </div>
        );
      },
    },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl p-0">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-700 to-blue-700 rounded-t-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-sky-200 uppercase tracking-widest">{t("vendorComparison.reportTitle", "Vendor Comparison Report")}</p>
              <DialogTitle className="text-[18px] font-extrabold text-white">
                {t("vendorComparison.comparisonTitle", "Perbandingan")} {items.length} Vendor
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold transition-all"
                title={t("vendorComparison.exportPdf", "Export PDF")}
              >
                <Download className="h-4 w-4" />
                {t("vendorComparison.exportPdf", "Export PDF")}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable table area */}
        <div className="overflow-auto flex-1" ref={printRef}>
          <table className="w-full border-collapse min-w-[600px]">

            {/* Item header row */}
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr>
                <th className="w-36 min-w-[120px] bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-left">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t("vendorComparison.attribute", "Atribut")}</span>
                </th>
                {items.map((item) => {
                  const catKey = item.categoryKey ?? item.serviceType ?? "";
                  const cat = CATEGORY_PLACEHOLDER[catKey];
                  return (
                    <th key={item.id} className="border-b border-r border-slate-200 px-4 py-3 text-left min-w-[200px] bg-white">
                      <div className="flex items-start gap-3">
                        {item.primaryImageUrl ? (
                          <img src={resolveImageUrl(item.primaryImageUrl) ?? item.primaryImageUrl} alt={item.name} loading="lazy" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={cat ? { background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` } : {}}
                          >
                            {cat ? cat.emoji : (item.templateKind === "service" ? <Truck className="h-5 w-5 text-white" /> : <Package className="h-5 w-5 text-white" />)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">{item.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.vendorName}</p>
                          {items.length > 2 && (
                            <button
                              onClick={() => onRemove(item.id)}
                              className="mt-1 text-[10px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-0.5"
                            >
                              <X className="h-3 w-3" /> {t("common.remove", "Hapus")}
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {FIXED_ROWS.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[12px] font-semibold text-slate-600 whitespace-nowrap align-top">
                    {row.label}
                  </td>
                  {items.map((item) => {
                    const highlightClass = row.highlight ? row.highlight(item) : "";
                    return (
                      <td key={item.id} className={`border-b border-r border-slate-200 px-4 py-3 align-top ${highlightClass}`}>
                        {row.render(item)}
                        {row.key === "price" && item.priceSell === minPrice && prices.length > 1 && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                              💚 {t("vendorComparison.bestPrice", "Harga Terbaik")}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Dynamic spec rows */}
              {specFields.length > 0 && (
                <tr>
                  <td colSpan={items.length + 1} className="bg-sky-50 border-b border-slate-200 px-4 py-2">
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">{t("vendorComparison.technicalSpec", "Spesifikasi Teknis")}</span>
                  </td>
                </tr>
              )}
              {specFields.map(({ key, label }) => {
                const hasAnyValue = items.some((item) => {
                  const v = getSpecValues(item)[key];
                  return v !== undefined && v !== null && String(v).trim() !== "";
                });
                if (!hasAnyValue) return null;
                return (
                  <tr key={key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-[12px] font-semibold text-slate-600 whitespace-nowrap align-top">
                      {label}
                    </td>
                    {items.map((item) => {
                      const specVals = getSpecValues(item);
                      const val = specVals[key];
                      const hasVal = val !== undefined && val !== null && String(val).trim() !== "";
                      return (
                        <td key={item.id} className="border-b border-r border-slate-200 px-4 py-3 align-top">
                          {hasVal
                            ? <span className="text-[13px] font-semibold text-slate-800">{String(val)}</span>
                            : <span className="text-slate-300 text-[12px]">—</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* CTA row */}
              <tr className="bg-slate-50">
                <td className="border-r border-slate-200 px-4 py-4 text-[12px] font-semibold text-slate-500">{t("vendorComparison.action", "Aksi")}</td>
                {items.map((item) => (
                  <td key={item.id} className="border-r border-slate-200 px-4 py-4">
                    <Button
                      onClick={() => onRequestQuote(item)}
                      className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl w-full text-[12px] font-semibold"
                    >
                      {t("vendorComparison.requestQuote", "Request Quote")}
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <p className="text-[11px] text-slate-400">
            {t("vendorComparison.footerNote", "💡 Klik")} <strong>Export PDF</strong> {t("vendorComparison.footerNoteEnd", "untuk menyimpan laporan perbandingan ini sebagai file PDF profesional. Rating bersumber dari ulasan transaksi yang telah diverifikasi.")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
