import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package, Wrench, Search, Send, X, Store, ChevronRight, Tag,
  Building2, AlertCircle, BarChart2, LayoutGrid, TrendingDown, Crown, ArrowUpDown,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

const idr = (n: number) =>
  n > 0
    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
    : "Hubungi Kami";

const idrShort = (n: number) => {
  if (n <= 0) return "–";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

interface CatalogItem {
  id: number;
  vendorId: number;
  vendorName: string;
  vendorLogo: string | null;
  type: string;
  name: string;
  description: string | null;
  unit: string | null;
  kategori: string | null;
  subcategory: string | null;
  sellPrice: number;
}

interface CompareVendor {
  id: number;
  vendorId: number;
  vendorName: string;
  vendorLogo: string | null;
  sellPrice: number;
  unit: string | null;
  description: string | null;
}

interface CompareGroup {
  itemName: string;
  type: string;
  kategori: string | null;
  vendors: CompareVendor[];
  minPrice: number;
  maxPrice: number;
  vendorCount: number;
}

interface ProductTemplate {
  id: number;
  categoryKey: string;
  label: string;
  icon: string | null;
  description: string | null;
  customFields: { key: string; label: string; type: string; required?: boolean }[];
  requiredDocuments: { key: string; label: string; required?: boolean }[];
  checklist: { label: string }[];
  packagingInstructions: string | null;
}

interface ServiceTemplate {
  id: number;
  serviceType: string;
  label: string;
  emoji: string;
  description: string | null;
  fields: { key: string; label: string; type: string; required?: boolean }[];
  requiredDocuments: { key: string; label: string; required?: boolean }[];
  checklist: { label: string }[];
}

type Tab = "etalase" | "product-template" | "service-template";

// ── Inquiry Modal ─────────────────────────────────────────────────────────────
function InquiryModal({
  item,
  onClose,
}: {
  item: { name: string; vendorName?: string; kategori?: string | null; type?: string; templateType?: "product" | "service" };
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", quantity: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim()) { setError(t("catalog.inquiry.nameWhatsappRequired", "Nama dan WhatsApp wajib diisi")); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/portal/catalog-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, whatsapp: form.whatsapp,
          itemName: item.name, itemType: item.type ?? (item.templateType === "service" ? "service" : "product"),
          vendorName: item.vendorName, kategori: item.kategori,
          quantity: form.quantity, notes: form.notes,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? t("catalog.inquiry.sendFailed", "Gagal"));
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? t("catalog.inquiry.sendError", "Gagal mengirim"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-[15px]">{t("catalog.inquiry.title", "Minta Penawaran")}</p>
            <p className="text-sky-100 text-sm mt-0.5 line-clamp-1">{item.name}{item.vendorName ? ` — ${item.vendorName}` : ""}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white mt-0.5"><X className="h-5 w-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <Send className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-800">{t("catalog.inquiry.sentTitle", "Permintaan Terkirim!")}</p>
            <p className="text-sm text-slate-500">{t("catalog.inquiry.sentDesc", "Tim kami akan menghubungi Anda via WhatsApp segera.")}</p>
            <button onClick={onClose} className="mt-2 px-5 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">{t("catalog.inquiry.closeBtn", "Tutup")}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("catalog.inquiry.fullName", "Nama Lengkap *")}</label>
              <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder={t("catalog.inquiry.namePlaceholder", "Nama Anda")} value={form.name} onChange={set("name")} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("catalog.inquiry.whatsapp", "WhatsApp *")}</label>
              <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="08xx-xxxx-xxxx" value={form.whatsapp} onChange={set("whatsapp")} type="tel" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("catalog.inquiry.email", "Email (opsional)")}</label>
              <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="email@domain.com" value={form.email} onChange={set("email")} type="email" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("catalog.inquiry.quantity", "Jumlah / Qty")}</label>
              <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder={t("catalog.inquiry.quantityPlaceholder", "cth: 100 pcs")} value={form.quantity} onChange={set("quantity")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("catalog.inquiry.notes", "Catatan")}</label>
              <textarea className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" rows={2} placeholder={t("catalog.inquiry.notesPlaceholder", "Kebutuhan spesifik, spesifikasi, dll.")} value={form.notes} onChange={set("notes")} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? t("catalog.inquiry.sending", "Mengirim...") : t("catalog.inquiry.submitBtn", "Kirim Permintaan")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Price Bar Visual ──────────────────────────────────────────────────────────
function PriceBar({ price, min, max }: { price: number; min: number; max: number }) {
  if (price <= 0 || min <= 0 || max <= min) return <div className="h-2 w-24 bg-slate-100 rounded-full" />;
  const pct = Math.max(8, Math.round(((price - min) / (max - min)) * 100));
  return (
    <div className="relative h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${price === min ? "bg-emerald-500" : price === max ? "bg-rose-400" : "bg-amber-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Compare Group Card ────────────────────────────────────────────────────────
function CompareGroupCard({
  group,
  onInquiry,
}: {
  group: CompareGroup;
  onInquiry: (item: { name: string; vendorName?: string; kategori?: string | null; type?: string }) => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  const cheapest = group.vendors.find((v) => v.sellPrice > 0 && v.sellPrice === group.minPrice);
  const savings = group.minPrice > 0 && group.maxPrice > group.minPrice ? group.maxPrice - group.minPrice : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Group header */}
      <div
        className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${group.type === "service" ? "bg-violet-100" : "bg-emerald-100"}`}>
            {group.type === "service"
              ? <Wrench className="h-4 w-4 text-violet-600" />
              : <Package className="h-4 w-4 text-emerald-600" />}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-[15px] leading-snug truncate">{group.itemName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {group.kategori && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" />{group.kategori}
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                {group.vendorCount} {t("catalog.compare.vendorCount", "vendor")}
              </span>
              {savings > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <TrendingDown className="h-3 w-3" />{t("catalog.compare.savingsPrefix", "Hemat s.d.")} {idrShort(savings)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {group.minPrice > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t("catalog.compare.startingFrom", "Mulai dari")}</p>
              <p className="text-emerald-700 font-bold text-sm">{idrShort(group.minPrice)}</p>
            </div>
          )}
          <ArrowUpDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Vendor comparison table */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="text-left px-4 py-2.5 font-semibold">{t("catalog.compare.col.vendor", "Vendor")}</th>
                  <th className="text-right px-4 py-2.5 font-semibold">{t("catalog.compare.col.price", "Harga")}</th>
                  <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">{t("catalog.compare.col.unit", "Satuan")}</th>
                  <th className="px-4 py-2.5 font-semibold hidden lg:table-cell w-28">{t("catalog.compare.col.comparison", "Perbandingan")}</th>
                  <th className="px-4 py-2.5 font-semibold w-36"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {group.vendors.map((v, idx) => {
                  const isCheapest = v.sellPrice > 0 && v.sellPrice === group.minPrice;
                  const isMost = v.sellPrice > 0 && v.sellPrice === group.maxPrice && group.minPrice !== group.maxPrice;
                  return (
                    <tr key={v.id} className={`transition-colors ${isCheapest ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-slate-50/60"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {idx === 0 && v.sellPrice > 0 && (
                            <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800">{v.vendorName}</span>
                          {isCheapest && (
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-none">{t("catalog.compare.cheapestBadge", "TERMURAH")}</span>
                          )}
                        </div>
                        {v.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{v.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${isCheapest ? "text-emerald-700" : isMost ? "text-rose-600" : "text-slate-700"}`}>
                          {idr(v.sellPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-[12px]">
                        {v.unit ?? "–"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <PriceBar price={v.sellPrice} min={group.minPrice} max={group.maxPrice} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onInquiry({ name: group.itemName, vendorName: v.vendorName, kategori: group.kategori, type: group.type })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[12px] font-semibold transition-colors whitespace-nowrap"
                        >
                          <Send className="h-3 w-3" />{t("catalog.requestQuote", "Minta Penawaran")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-50">
            {group.vendors.map((v, idx) => {
              const isCheapest = v.sellPrice > 0 && v.sellPrice === group.minPrice;
              return (
                <div key={v.id} className={`px-4 py-3 space-y-2 ${isCheapest ? "bg-emerald-50/60" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {idx === 0 && v.sellPrice > 0 && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      <span className="font-semibold text-slate-800 text-sm">{v.vendorName}</span>
                      {isCheapest && <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">{t("catalog.compare.cheapestBadge", "TERMURAH")}</span>}
                    </div>
                    <span className={`font-bold text-sm ${isCheapest ? "text-emerald-700" : "text-slate-700"}`}>{idr(v.sellPrice)}{v.unit && v.sellPrice > 0 ? ` / ${v.unit}` : ""}</span>
                  </div>
                  <PriceBar price={v.sellPrice} min={group.minPrice} max={group.maxPrice} />
                  <button
                    onClick={() => onInquiry({ name: group.itemName, vendorName: v.vendorName, kategori: group.kategori, type: group.type })}
                    className="w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3 w-3" />{t("catalog.requestQuote", "Minta Penawaran")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Etalase Tab ───────────────────────────────────────────────────────────────
function EtalaseTab({ onInquiry }: { onInquiry: (item: { name: string; vendorName?: string; kategori?: string | null; type?: string }) => void }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | "product" | "service">("");
  const [mode, setMode] = useState<"browse" | "compare">("browse");
  const [compareSearch, setCompareSearch] = useState("");

  // Browse data
  const { data: items = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["portal-vendor-catalog", filterType],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filterType) p.set("type", filterType);
      const res = await fetch(`/api/portal/vendor-catalog?${p}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Compare data
  const { data: compareData, isLoading: isCompareLoading } = useQuery<{ groups: CompareGroup[]; totalGroups: number }>({
    queryKey: ["portal-vendor-catalog-compare", filterType],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filterType) p.set("type", filterType);
      const res = await fetch(`/api/portal/vendor-catalog/compare?${p}`);
      if (!res.ok) return { groups: [], totalGroups: 0 };
      return res.json();
    },
    enabled: mode === "compare",
  });

  const filtered = useMemo(() =>
    items.filter((i) =>
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.vendorName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (i.kategori ?? "").toLowerCase().includes(search.toLowerCase())
    ), [items, search]);

  const filteredGroups = useMemo(() => {
    if (!compareData?.groups) return [];
    if (!compareSearch) return compareData.groups;
    return compareData.groups.filter((g) =>
      g.itemName.toLowerCase().includes(compareSearch.toLowerCase()) ||
      (g.kategori ?? "").toLowerCase().includes(compareSearch.toLowerCase()) ||
      g.vendors.some((v) => v.vendorName.toLowerCase().includes(compareSearch.toLowerCase()))
    );
  }, [compareData, compareSearch]);

  return (
    <div className="space-y-4">
      {/* Mode + Filter bar */}
      <div className="flex flex-wrap gap-2">
        {/* Mode toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0">
          <button
            onClick={() => setMode("browse")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors ${mode === "browse" ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />{t("catalog.etalase.allItems", "Semua Item")}
          </button>
          <button
            onClick={() => setMode("compare")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors border-l border-slate-200 ${mode === "compare" ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <BarChart2 className="h-3.5 w-3.5" />{t("catalog.etalase.comparePrice", "Bandingkan Harga")}
            {compareData && compareData.totalGroups > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${mode === "compare" ? "bg-white/25 text-white" : "bg-sky-100 text-sky-700"}`}>
                {compareData.totalGroups}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            placeholder={mode === "compare" ? t("catalog.etalase.searchCompare", "Cari nama item, vendor...") : t("catalog.etalase.searchBrowse", "Cari nama, vendor, kategori...")}
            value={mode === "compare" ? compareSearch : search}
            onChange={(e) => mode === "compare" ? setCompareSearch(e.target.value) : setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 shrink-0">
          {(["", "product", "service"] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setFilterType(tp)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border ${filterType === tp ? "bg-sky-500 text-white border-sky-500" : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"}`}
            >
              {tp === "" ? t("catalog.filter.all", "Semua") : tp === "product" ? t("catalog.filter.product", "Produk") : t("catalog.filter.service", "Layanan")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Browse Mode ── */}
      {mode === "browse" && (
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{t("catalog.etalase.empty", "Belum ada item etalase")}</p>
            <p className="text-sm mt-1">{t("catalog.etalase.emptyDesc", "Vendor belum menambahkan produk atau layanan ke katalog")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200 flex flex-col overflow-hidden">
                <div className="p-4 flex-1 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.type === "service" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {item.type === "service" ? <Wrench className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                      {item.type === "service" ? t("catalog.typeService", "Layanan") : t("catalog.typeProduct", "Produk")}
                    </span>
                    {item.kategori && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Tag className="h-3 w-3" />{item.kategori}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-sky-700 transition-colors">{item.name}</p>
                    {item.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.vendorName}</span>
                  </div>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-slate-400">{t("catalog.etalase.startingPrice", "Harga mulai")}</p>
                    <p className={`font-bold text-[15px] ${item.sellPrice > 0 ? "text-sky-700" : "text-slate-400 text-[13px]"}`}>
                      {idr(item.sellPrice)}{item.unit && item.sellPrice > 0 ? ` / ${item.unit}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => onInquiry({ name: item.name, vendorName: item.vendorName, kategori: item.kategori, type: item.type })}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-semibold transition-colors"
                  >
                    {t("catalog.requestQuote", "Minta Penawaran")} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Compare Mode ── */}
      {mode === "compare" && (
        isCompareLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : !filteredGroups.length ? (
          <div className="text-center py-16 text-slate-400">
            <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {(compareData?.totalGroups ?? 0) === 0
                ? t("catalog.compare.noItems", "Belum ada item yang ditawarkan oleh 2 vendor atau lebih")
                : t("catalog.compare.noResults", "Tidak ada item yang cocok dengan pencarian")
              }
            </p>
            <p className="text-sm mt-1">
              {(compareData?.totalGroups ?? 0) === 0
                ? t("catalog.compare.noItemsDesc", "Perbandingan harga tersedia saat minimal 2 vendor menawarkan item yang sama")
                : t("catalog.compare.noResultsDesc", "Coba kata kunci lain")
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/80 rounded-xl px-4 py-2.5 border border-slate-100">
              <BarChart2 className="h-4 w-4 text-sky-500 shrink-0" />
              <span>
                <span className="font-semibold text-slate-700">{filteredGroups.length}</span> {t("catalog.compare.itemsAvailable", "item tersedia untuk dibandingkan.")}{" "}
                {t("catalog.compare.cheapestDesc", "Vendor dengan")} <span className="font-semibold text-emerald-600">{t("catalog.compare.cheapestBadge", "badge TERMURAH")}</span> {t("catalog.compare.cheapestDescEnd", "adalah pilihan harga terbaik.")}
              </span>
            </div>
            {filteredGroups.map((group) => (
              <CompareGroupCard key={group.itemName} group={group} onInquiry={onInquiry} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Product Template Tab ──────────────────────────────────────────────────────
function ProductTemplateTab({ onInquiry }: { onInquiry: (item: { name: string; kategori?: string | null; templateType: "product" }) => void }) {
  const { t } = useLanguage();
  const { data: templates = [], isLoading } = useQuery<ProductTemplate[]>({
    queryKey: ["portal-product-templates"],
    queryFn: async () => {
      const res = await fetch("/api/portal/product-templates");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />)}
    </div>
  );

  if (templates.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
      <p className="font-medium">{t("catalog.productTemplate.empty", "Belum ada template produk")}</p>
      <p className="text-sm mt-1">{t("catalog.productTemplate.emptyDesc", "Admin belum menambahkan template produk")}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((tmpl) => (
        <div key={tmpl.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col overflow-hidden">
          <div className="p-4 flex-1 space-y-3">
            <div className="flex items-start gap-3">
              {tmpl.icon
                ? <span className="text-3xl shrink-0">{tmpl.icon}</span>
                : <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Package className="h-5 w-5 text-emerald-600" /></div>
              }
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-emerald-700 transition-colors">{tmpl.label}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{tmpl.categoryKey}</p>
              </div>
            </div>
            {tmpl.description && <p className="text-sm text-slate-500 line-clamp-2">{tmpl.description}</p>}
            <div className="space-y-1.5">
              {Array.isArray(tmpl.customFields) && tmpl.customFields.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {tmpl.customFields.length} {t("catalog.productTemplate.fields", "field pengisian data")}
                </div>
              )}
              {Array.isArray(tmpl.requiredDocuments) && tmpl.requiredDocuments.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {tmpl.requiredDocuments.length} {t("catalog.template.docsRequired", "dokumen diperlukan")}
                </div>
              )}
              {Array.isArray(tmpl.checklist) && tmpl.checklist.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {tmpl.checklist.length} {t("catalog.template.checklistPoints", "poin checklist")}
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            <button onClick={() => onInquiry({ name: tmpl.label, kategori: tmpl.categoryKey, templateType: "product" })} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />{t("catalog.requestQuote", "Minta Penawaran")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Service Template Tab ──────────────────────────────────────────────────────
function ServiceTemplateTab({ onInquiry }: { onInquiry: (item: { name: string; kategori?: string | null; templateType: "service" }) => void }) {
  const { t } = useLanguage();
  const { data: templates = [], isLoading } = useQuery<ServiceTemplate[]>({
    queryKey: ["portal-service-templates"],
    queryFn: async () => {
      const res = await fetch("/api/portal/service-templates");
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />)}
    </div>
  );

  if (templates.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <Wrench className="h-12 w-12 mx-auto mb-3 opacity-40" />
      <p className="font-medium">{t("catalog.serviceTemplate.empty", "Belum ada template layanan")}</p>
      <p className="text-sm mt-1">{t("catalog.serviceTemplate.emptyDesc", "Admin belum menambahkan template layanan")}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((tmpl) => (
        <div key={tmpl.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex flex-col overflow-hidden">
          <div className="p-4 flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{tmpl.emoji || "📋"}</span>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-violet-700 transition-colors">{tmpl.label}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{tmpl.serviceType}</p>
              </div>
            </div>
            {tmpl.description && <p className="text-sm text-slate-500 line-clamp-2">{tmpl.description}</p>}
            <div className="space-y-1.5">
              {Array.isArray(tmpl.fields) && tmpl.fields.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {tmpl.fields.length} {t("catalog.serviceTemplate.infoRequired", "informasi yang dibutuhkan")}
                </div>
              )}
              {Array.isArray(tmpl.requiredDocuments) && tmpl.requiredDocuments.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {tmpl.requiredDocuments.length} {t("catalog.template.docsRequired", "dokumen diperlukan")}
                </div>
              )}
              {Array.isArray(tmpl.checklist) && tmpl.checklist.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {tmpl.checklist.length} {t("catalog.template.checklistPoints", "poin checklist")}
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            <button onClick={() => onInquiry({ name: tmpl.label, kategori: tmpl.serviceType, templateType: "service" })} className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />{t("catalog.requestQuote", "Minta Penawaran")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("etalase");
  const [inquiry, setInquiry] = useState<{ name: string; vendorName?: string; kategori?: string | null; type?: string; templateType?: "product" | "service" } | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "etalase", label: t("catalog.tabs.etalase", "Etalase Vendor"), icon: Store },
    { key: "product-template", label: t("catalog.tabs.productTemplate", "Template Produk"), icon: Package },
    { key: "service-template", label: t("catalog.tabs.serviceTemplate", "Template Layanan"), icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageSeo path="/catalog" />
      <div className="bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <p className="text-sky-300 text-sm font-semibold uppercase tracking-widest">{t("catalog.hero.eyebrow", "Katalog Kami")}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">{t("catalog.hero.title", "Produk & Layanan Vendor")}</h1>
          <p className="text-sky-100 text-[15px] max-w-xl mx-auto leading-relaxed">
            {t("catalog.hero.descPrefix", "Temukan dan")} <span className="font-semibold text-white">{t("catalog.hero.descHighlight", "bandingkan harga")}</span> {t("catalog.hero.descSuffix", "produk & layanan dari vendor terpercaya kami.")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                tab === key
                  ? "bg-white shadow-sm border-slate-200 text-slate-900"
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {tab === "etalase" && <EtalaseTab onInquiry={(item) => setInquiry(item)} />}
        {tab === "product-template" && <ProductTemplateTab onInquiry={(item) => setInquiry(item)} />}
        {tab === "service-template" && <ServiceTemplateTab onInquiry={(item) => setInquiry(item)} />}
      </div>

      {inquiry && <InquiryModal item={inquiry} onClose={() => setInquiry(null)} />}
    </div>
  );
}
