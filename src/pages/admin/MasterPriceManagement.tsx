/**
 * Master Price Management — Phase 1
 * Menu baru di Customer Portal Admin → Marketplace → Master Price Management
 */

import { useState, useEffect, useCallback, useRef } from "react";
// C1: auth via cookie
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, TrendingUp, Package, Clock, AlertCircle, Upload,
  Download, RefreshCw, Pencil, CheckCircle, XCircle, History,
  BarChart2, ChevronLeft, ChevronRight, Loader2, Settings,
  Building2, Globe, Search, X, FileSpreadsheet,
} from "lucide-react";

// ── types ────────────────────────────────────────────────────────────────────

interface PriceItem {
  id: number;
  name: string;
  supplierName: string;
  supplierId: number;
  category: string | null;
  isInternal: boolean;
  status: string;
  isPublished: boolean;
  priceBase: number | null;
  markupPct: number;
  priceSell: number | null;
  currency: string;
  updatedAt: string | null;
}

interface Stats {
  totalInternal: number;
  totalExternal: number;
  withoutPrice: number;
  pendingApproval: number;
  updatedToday: number;
  lastImport: string | null;
}

interface HistoryRow {
  id: number;
  catalogItemId: number;
  itemName: string | null;
  vendorName: string | null;
  vendorType: string;
  priceBaseOld: number | null;
  priceBaseNew: number | null;
  markupOld: number | null;
  markupNew: number | null;
  priceSellOld: number | null;
  priceSellNew: number | null;
  currency: string;
  reason: string | null;
  changedBy: string;
  changedAt: string;
  approvalStatus: string;
  approvedBy: string | null;
  approvedAt: string | null;
  effectiveAt: string | null;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const BASE = "/api/portal/admin/master-price";

const fmt = (n: number | null | undefined, currency = "IDR") => {
  if (n == null) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
};

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
};

function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    auto_approved: { label: "Approved", cls: "bg-green-100 text-green-700" },
    pending:       { label: "Pending",  cls: "bg-amber-100 text-amber-700"  },
    approved:      { label: "Approved", cls: "bg-green-100 text-green-700"  },
    rejected:      { label: "Rejected", cls: "bg-red-100 text-red-700"     },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function MasterPriceManagement() {
  const { toast } = useToast();
  const { t } = useLanguage();

  // ── tabs ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"overview" | "products" | "history" | "approvals" | "settings">("overview");

  // ── stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // ── list ──────────────────────────────────────────────────────────────────
  const [items, setItems] = useState<PriceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const PAGE_SIZE = 50;
  const [loadingList, setLoadingList] = useState(false);

  // filters
  const [vendorType, setVendorType]   = useState("all");
  const [status, setStatus]           = useState("all");
  const [category, setCategory]       = useState("all");
  const [search, setSearch]           = useState("");
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ── history ───────────────────────────────────────────────────────────────
  const [history, setHistory]        = useState<HistoryRow[]>([]);
  const [histTotal, setHistTotal]    = useState(0);
  const [histPage, setHistPage]      = useState(1);
  const [histPages, setHistPages]    = useState(1);
  const [loadingHist, setLoadingHist] = useState(false);
  const [histVendorType, setHistVendorType] = useState("all");
  const [histFrom, setHistFrom]      = useState("");
  const [histTo, setHistTo]          = useState("");

  // ── pending approvals ─────────────────────────────────────────────────────
  const [pending, setPending]             = useState<HistoryRow[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // ── config ────────────────────────────────────────────────────────────────
  const [requireApproval, setRequireApproval] = useState(false);
  const [savingConfig, setSavingConfig]       = useState(false);

  // ── edit modal ────────────────────────────────────────────────────────────
  const [editItem, setEditItem]       = useState<PriceItem | null>(null);
  const [editBase, setEditBase]       = useState("");
  const [editMarkup, setEditMarkup]   = useState("");
  const [editReason, setEditReason]   = useState("");
  const [editEffective, setEditEffective] = useState("");
  const [editEffectiveTime, setEditEffectiveTime] = useState("");
  const [saving, setSaving]           = useState(false);

  // derived preview in edit modal
  const editBaseNum   = parseFloat(editBase)   || 0;
  const editMarkupNum = parseFloat(editMarkup) || 0;
  const editSellPreview = editItem?.isInternal
    ? editBaseNum
    : Math.ceil(editBaseNum * (1 + editMarkupNum / 100));
  const editProfit = editItem?.isInternal ? 0 : (editSellPreview - editBaseNum);

  // ── bulk update modal ─────────────────────────────────────────────────────
  const [showBulk, setShowBulk]       = useState(false);
  const [bulkBase, setBulkBase]       = useState("");
  const [bulkMarkup, setBulkMarkup]   = useState("");
  const [bulkReason, setBulkReason]   = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── import ────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting]     = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // ── categories (for filter) ───────────────────────────────────────────────
  const [categories, setCategories] = useState<string[]>([]);

  // ── load ──────────────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const r = await fetch(`${BASE}/stats`, { credentials: "include", cache: "no-store" });
      if (r.ok) setStats(await r.json());
    } catch { /* silent */ }
    finally { setLoadingStats(false); }
  }, []);

  const loadList = useCallback(async (p = page) => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        page: String(p), limit: String(PAGE_SIZE),
        ...(vendorType !== "all" ? { vendorType } : {}),
        ...(status   !== "all" ? { status }    : {}),
        ...(category !== "all" ? { category }  : {}),
        ...(search.trim()      ? { search }     : {}),
      });
      const r = await fetch(`${BASE}?${params}`, { credentials: "include", cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setItems(data.data);
        setTotal(data.total);
        setPages(data.pages);
        setPage(p);
      }
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  }, [page, vendorType, status, category, search]);

  const loadHistory = useCallback(async (p = histPage) => {
    setLoadingHist(true);
    try {
      const params = new URLSearchParams({
        page: String(p), limit: "50",
        ...(histVendorType !== "all" ? { vendorType: histVendorType } : {}),
        ...(histFrom ? { from: histFrom } : {}),
        ...(histTo   ? { to: histTo }     : {}),
      });
      const r = await fetch(`${BASE}/history?${params}`, { credentials: "include", cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setHistory(d.data);
        setHistTotal(d.total);
        setHistPages(d.pages);
        setHistPage(p);
      }
    } catch { /* silent */ }
    finally { setLoadingHist(false); }
  }, [histPage, histVendorType, histFrom, histTo]);

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const r = await fetch(`${BASE}/pending-approvals`, { credentials: "include", cache: "no-store" });
      if (r.ok) setPending((await r.json()).data ?? []);
    } catch { /* silent */ }
    finally { setLoadingPending(false); }
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/config`, { credentials: "include" });
      if (r.ok) {
        const d = await r.json();
        setRequireApproval(d.require_approval === "true");
      }
    } catch { /* silent */ }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const r = await fetch("/api/marketplace/categories", { cache: "no-store" });
      if (r.ok) setCategories(await r.json());
    } catch { /* silent */ }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
    loadCategories();
    loadConfig();
  }, [loadStats, loadCategories, loadConfig]);

  useEffect(() => { if (tab === "products")  loadList(1);     }, [tab]);
  useEffect(() => { if (tab === "history")   loadHistory(1);  }, [tab]);
  useEffect(() => { if (tab === "approvals") loadPending();   }, [tab]);

  // Re-load list when filters change (debounce search)
  useEffect(() => {
    if (tab !== "products") return;
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => loadList(1), 350);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [vendorType, status, category, search, tab]);

  // ── selection helpers ─────────────────────────────────────────────────────

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(prev =>
      prev.size === items.length ? new Set() : new Set(items.map(i => i.id))
    );
  };

  // ── open edit modal ───────────────────────────────────────────────────────

  const openEdit = (item: PriceItem) => {
    setEditItem(item);
    setEditBase(String(item.priceBase ?? 0));
    setEditMarkup(String(item.markupPct ?? 0));
    setEditReason("");
    setEditEffective("");
    setEditEffectiveTime("");
  };

  // ── save single price ─────────────────────────────────────────────────────

  const saveEdit = async () => {
    if (!editItem) return;
    if (parseFloat(editBase) < 0) {
      toast({ title: "Price Base tidak boleh negatif", variant: "destructive" }); return;
    }
    if (!editItem.isInternal && (parseFloat(editMarkup) < 0 || parseFloat(editMarkup) > 100)) {
      toast({ title: "Markup harus antara 0–100%", variant: "destructive" }); return;
    }

    setSaving(true);
    try {
      let effectiveAt: string | undefined;
      if (editEffective) {
        const dt = new Date(`${editEffective}T${editEffectiveTime || "00:00"}`);
        if (!isNaN(dt.getTime())) effectiveAt = dt.toISOString();
      }

      const r = await fetch(`${BASE}/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceBase: parseFloat(editBase),
          markup: editItem.isInternal ? 0 : parseFloat(editMarkup),
          reason: editReason || undefined,
          effectiveAt,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? d.error ?? "Gagal");

      toast({
        title: d.pendingApproval
          ? "Menunggu persetujuan Manager"
          : d.scheduledAt
          ? `Dijadwalkan ${fmtDate(d.scheduledAt)}`
          : "Harga berhasil diperbarui",
      });
      setEditItem(null);
      loadList(page);
      loadStats();
    } catch (e: any) {
      toast({ title: e.message ?? "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── bulk update ───────────────────────────────────────────────────────────

  const saveBulk = async () => {
    if (selected.size === 0) {
      toast({ title: "Pilih minimal 1 produk", variant: "destructive" }); return;
    }
    setBulkLoading(true);
    try {
      const body: any = { ids: Array.from(selected), reason: bulkReason || "bulk_update" };
      if (bulkBase)   body.priceBase = parseFloat(bulkBase);
      if (bulkMarkup) body.markup    = parseFloat(bulkMarkup);

      const r = await fetch(`${BASE}/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? d.error ?? "Gagal");

      const okCount = (d.results as any[]).filter(x => x.ok).length;
      toast({ title: `${okCount} produk berhasil diperbarui` });
      setShowBulk(false);
      setSelected(new Set());
      setBulkBase(""); setBulkMarkup(""); setBulkReason("");
      loadList(page);
      loadStats();
    } catch (e: any) {
      toast({ title: e.message ?? "Gagal bulk update", variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  // ── import ────────────────────────────────────────────────────────────────

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    setImportResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(`${BASE}/import`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? d.error ?? "Gagal");
      setImportResult(d);
      toast({ title: `Import selesai: ${d.ok} berhasil, ${d.failed} gagal` });
      loadList(1);
      loadStats();
    } catch (e: any) {
      toast({ title: e.message ?? "Gagal import", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  // ── export ────────────────────────────────────────────────────────────────

  const handleExport = (format: "xlsx" | "csv") => {
    const params = new URLSearchParams({
      format,
      ...(vendorType !== "all" ? { vendorType } : {}),
      ...(status    !== "all" ? { status }    : {}),
      ...(category  !== "all" ? { category }  : {}),
    });
    // C1: cookie auth — browser sends session cookie automatically for same-origin window.open
    window.open(`${BASE}/export?${params}`, "_blank");
  };

  // ── approve / reject ──────────────────────────────────────────────────────

  const approveItem = async (histId: number) => {
    try {
      const r = await fetch(`${BASE}/approvals/${histId}/approve`, {
        method: "POST", credentials: "include",
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "Gagal");
      toast({ title: "Harga disetujui dan diterapkan" });
      loadPending();
      loadStats();
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  };

  const rejectItem = async (histId: number) => {
    try {
      const r = await fetch(`${BASE}/approvals/${histId}/reject`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: "Ditolak" }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "Gagal");
      toast({ title: "Perubahan harga ditolak" });
      loadPending();
      loadStats();
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  };

  // ── save config ───────────────────────────────────────────────────────────

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const r = await fetch(`${BASE}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ require_approval: requireApproval }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "Gagal");
      toast({ title: "Konfigurasi disimpan" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  const tabCls = (t: string) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
      tab === t
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <div className="space-y-5">

      {/* Tab nav */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl flex-wrap">
        <button className={tabCls("overview")}  onClick={() => setTab("overview")}>
          <span className="flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5" />{t("mpm.tabDashboard", "Dashboard")}</span>
        </button>
        <button className={tabCls("products")}  onClick={() => setTab("products")}>
          <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />{t("mpm.tabProducts", "Produk")}</span>
        </button>
        <button className={tabCls("history")}   onClick={() => setTab("history")}>
          <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" />{t("mpm.tabHistory", "Riwayat Harga")}</span>
        </button>
        <button className={tabCls("approvals")} onClick={() => setTab("approvals")}>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {t("mpm.tabApprovals", "Approval")}
            {(stats?.pendingApproval ?? 0) > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {stats!.pendingApproval}
              </span>
            )}
          </span>
        </button>
        <button className={tabCls("settings")}  onClick={() => setTab("settings")}>
          <span className="flex items-center gap-1.5"><Settings className="h-3.5 w-3.5" />{t("mpm.tabSettings", "Pengaturan")}</span>
        </button>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {loadingStats ? (
            <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Memuat statistik…</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Internal Products", value: stats?.totalInternal ?? 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "External Products", value: stats?.totalExternal ?? 0, icon: Globe,     color: "text-green-600", bg: "bg-green-50" },
                { label: "Tanpa Harga",       value: stats?.withoutPrice  ?? 0, icon: AlertCircle,color: "text-red-600",   bg: "bg-red-50" },
                { label: "Pending Approval",  value: stats?.pendingApproval ?? 0, icon: Clock,  color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Diperbarui Hari Ini", value: stats?.updatedToday ?? 0, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Last Import",       value: stats?.lastImport ? fmtDate(stats.lastImport) : "—", icon: FileSpreadsheet, color: "text-slate-600", bg: "bg-slate-50", isText: true },
              ].map(({ label, value, icon: Icon, color, bg, isText }) => (
                <Card key={label} className="border border-slate-200 shadow-none">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`${bg} ${color} p-2.5 rounded-xl shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className={`text-2xl font-bold ${color} mt-0.5 ${isText ? "text-base" : ""}`}>
                        {isText ? value : Number(value).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={loadStats} disabled={loadingStats}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingStats ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === "products" && (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Vendor type */}
              <Select value={vendorType} onValueChange={v => setVendorType(v)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Semua Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Vendor</SelectItem>
                  <SelectItem value="internal">🏢 Internal</SelectItem>
                  <SelectItem value="external">🌍 External</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select value={status} onValueChange={v => setStatus(v)}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* Category */}
              <Select value={category} onValueChange={v => setCategory(v)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  className="h-8 pl-7 w-52 text-xs"
                  placeholder="Cari produk / supplier…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 items-center">
              {selected.size > 0 && (
                <Button size="sm" variant="outline" onClick={() => setShowBulk(true)} className="text-xs h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  Update Harga ({selected.size} dipilih)
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                Import Price
              </Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />

              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleExport("xlsx")}>
                <Download className="h-3.5 w-3.5 mr-1" />Excel
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleExport("csv")}>
                <Download className="h-3.5 w-3.5 mr-1" />CSV
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => loadList(page)} disabled={loadingList}>
                <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Import result */}
          {importResult && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Import selesai: {importResult.ok} berhasil, {importResult.failed} gagal dari {importResult.total} baris</p>
              {importResult.results?.filter((r: any) => !r.ok).slice(0, 5).map((r: any) => (
                <p key={r.row} className="text-red-600">Baris {r.row}: {r.error}</p>
              ))}
              <button className="text-slate-400 hover:text-slate-700 mt-1" onClick={() => setImportResult(null)}>
                Tutup
              </button>
            </div>
          )}

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">
                    <Checkbox
                      checked={items.length > 0 && selected.size === items.length}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Produk</th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
                  <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Price Base</th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Markup %</th>
                  <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Selling Price</th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Updated</th>
                  <th className="p-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingList && (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Memuat data…
                  </td></tr>
                )}
                {!loadingList && items.length === 0 && (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400">
                    {t("mpm.noProducts", "Tidak ada produk ditemukan")}
                  </td></tr>
                )}
                {!loadingList && items.map(item => (
                  <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50/70 ${selected.has(item.id) ? "bg-indigo-50/50" : ""}`}>
                    <td className="p-3">
                      <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleOne(item.id)} />
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800 text-xs leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {item.id}</p>
                    </td>
                    <td className="p-3 text-xs text-slate-600">{item.supplierName}</td>
                    <td className="p-3 text-xs text-slate-500">{item.category ?? "—"}</td>
                    <td className="p-3 text-center">
                      {item.isInternal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          🏢 INTERNAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                          🌍 EXTERNAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {item.isPublished ? "Published" : item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs font-mono">{fmt(item.priceBase, item.currency)}</td>
                    <td className="p-3 text-right text-xs text-slate-500">{item.isInternal ? "—" : `${item.markupPct}%`}</td>
                    <td className="p-3 text-right text-xs font-semibold text-slate-800">{fmt(item.priceSell, item.currency)}</td>
                    <td className="p-3 text-center text-[10px] text-slate-400">{fmtDate(item.updatedAt)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        title="Edit harga"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{total.toLocaleString("id-ID")} produk</span>
              <div className="flex items-center gap-1">
                <button onClick={() => loadList(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span>Hal {page} / {pages}</span>
                <button onClick={() => loadList(page + 1)} disabled={page >= pages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {/* History filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={histVendorType} onValueChange={v => setHistVendorType(v)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Semua" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="h-8 text-xs w-36" value={histFrom} onChange={e => setHistFrom(e.target.value)} placeholder="Dari tanggal" />
            <Input type="date" className="h-8 text-xs w-36" value={histTo}   onChange={e => setHistTo(e.target.value)}   placeholder="Sampai tanggal" />
            <Button size="sm" className="h-8 text-xs" onClick={() => loadHistory(1)} disabled={loadingHist}>
              {loadingHist ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Search className="h-3.5 w-3.5 mr-1" />}
              Filter
            </Button>
          </div>

          <div className="text-xs text-slate-500">{histTotal.toLocaleString("id-ID")} riwayat perubahan</div>

          <div className="border border-slate-200 rounded-xl overflow-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Produk","Type","Price Base","Markup","Selling Price","Alasan","Diubah Oleh","Waktu","Status"].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingHist && (
                  <tr><td colSpan={9} className="py-10 text-center text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </td></tr>
                )}
                {!loadingHist && history.length === 0 && (
                  <tr><td colSpan={9} className="py-10 text-center text-slate-400">Belum ada riwayat</td></tr>
                )}
                {!loadingHist && history.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="p-3 text-xs font-medium text-slate-800 max-w-[180px] truncate">{row.itemName ?? "—"}</td>
                    <td className="p-3">
                      {row.vendorType === "internal" ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">INTERNAL</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">EXTERNAL</span>
                      )}
                    </td>
                    <td className="p-3 text-xs font-mono">
                      <span className="text-slate-400 line-through">{fmt(row.priceBaseOld, row.currency)}</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="text-slate-800 font-semibold">{fmt(row.priceBaseNew, row.currency)}</span>
                    </td>
                    <td className="p-3 text-xs">
                      <span className="text-slate-400 line-through">{row.markupOld ?? 0}%</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="font-semibold">{row.markupNew ?? 0}%</span>
                    </td>
                    <td className="p-3 text-xs font-mono">
                      <span className="text-slate-400 line-through">{fmt(row.priceSellOld, row.currency)}</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="font-semibold">{fmt(row.priceSellNew, row.currency)}</span>
                    </td>
                    <td className="p-3 text-xs text-slate-500 max-w-[120px] truncate">{row.reason ?? "—"}</td>
                    <td className="p-3 text-xs text-slate-500">{row.changedBy}</td>
                    <td className="p-3 text-[10px] text-slate-400 whitespace-nowrap">{fmtDate(row.changedAt)}</td>
                    <td className="p-3"><ApprovalBadge status={row.approvalStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {histPages > 1 && (
            <div className="flex items-center justify-end gap-1 text-xs">
              <button onClick={() => loadHistory(histPage - 1)} disabled={histPage <= 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Hal {histPage} / {histPages}</span>
              <button onClick={() => loadHistory(histPage + 1)} disabled={histPage >= histPages} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── APPROVALS ── */}
      {tab === "approvals" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{pending.length} perubahan menunggu persetujuan</p>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={loadPending} disabled={loadingPending}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingPending ? "animate-spin" : ""}`} />Refresh
            </Button>
          </div>

          {loadingPending && <div className="py-8 text-center text-slate-400"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>}
          {!loadingPending && pending.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
              {t("mpm.noPendingApprovals", "Tidak ada perubahan yang menunggu approval")}
            </div>
          )}

          {!loadingPending && pending.map(row => (
            <div key={row.id} className="p-4 border border-amber-200 bg-amber-50/40 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{row.itemName ?? `Produk #${row.catalogItemId}`}</p>
                  <p className="text-xs text-slate-500">
                    Supplier: {row.vendorName ?? "—"} ·
                    {row.vendorType === "internal"
                      ? <span className="text-blue-600 font-semibold"> INTERNAL</span>
                      : <span className="text-green-600 font-semibold"> EXTERNAL</span>}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs mt-2">
                    <div>
                      <span className="text-slate-400">Price Base: </span>
                      <span className="line-through text-slate-400">{fmt(row.priceBaseOld, row.currency)}</span>
                      <span className="mx-1">→</span>
                      <span className="font-semibold">{fmt(row.priceBaseNew, row.currency)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Markup: </span>
                      <span className="line-through text-slate-400">{row.markupOld ?? 0}%</span>
                      <span className="mx-1">→</span>
                      <span className="font-semibold">{row.markupNew ?? 0}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Harga Jual: </span>
                      <span className="line-through text-slate-400">{fmt(row.priceSellOld, row.currency)}</span>
                      <span className="mx-1">→</span>
                      <span className="font-semibold text-green-700">{fmt(row.priceSellNew, row.currency)}</span>
                    </div>
                  </div>
                  {row.effectiveAt && (
                    <p className="text-xs text-indigo-600 mt-1">Berlaku: {fmtDate(row.effectiveAt)}</p>
                  )}
                  {row.reason && <p className="text-xs text-slate-400 mt-1">Alasan: {row.reason}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">Diajukan oleh {row.changedBy} · {fmtDate(row.changedAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => approveItem(row.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs border-red-300 text-red-600 hover:bg-red-50" onClick={() => rejectItem(row.id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "settings" && (
        <div className="max-w-lg space-y-4">
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Price Approval</CardTitle>
              <CardDescription>Jika aktif, setiap perubahan harga memerlukan persetujuan Manager sebelum diterapkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-medium">Require Approval</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {requireApproval
                      ? "Semua perubahan harga butuh persetujuan"
                      : "Perubahan harga langsung diterapkan"}
                  </p>
                </div>
                <button
                  onClick={() => setRequireApproval(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${requireApproval ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${requireApproval ? "translate-x-6" : ""}`} />
                </button>
              </div>
              <Button className="h-8 text-xs" onClick={saveConfig} disabled={savingConfig}>
                {savingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Simpan Konfigurasi
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Template Import</CardTitle>
              <CardDescription>Download template Excel untuk import harga massal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                const csv = "sku,product,supplier,price_base,markup\n1,Contoh Produk,PT Supplier,1000000,15";
                const blob = new Blob([csv], { type: "text/csv" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                a.download = "template-import-price.csv"; a.click();
              }}>
                <Download className="h-3.5 w-3.5 mr-1" />Download Template CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Update Harga</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 py-1">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="font-semibold text-sm text-slate-800 line-clamp-2">{editItem.name}</p>
                <p className="text-xs text-slate-500">{editItem.supplierName}</p>
                <div className="mt-2">
                  {editItem.isInternal ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">🏢 INTERNAL — Markup selalu 0</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">🌍 EXTERNAL</span>
                  )}
                </div>
              </div>

              {/* Price Base */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Price Base ({editItem.currency})</Label>
                <Input
                  type="number" min="0" step="1000"
                  className="h-9 text-sm"
                  value={editBase}
                  onChange={e => setEditBase(e.target.value)}
                />
              </div>

              {/* Markup */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Markup %</Label>
                <Input
                  type="number" min="0" max="100" step="0.5"
                  className={`h-9 text-sm ${editItem.isInternal ? "opacity-50" : ""}`}
                  value={editItem.isInternal ? "0" : editMarkup}
                  onChange={e => !editItem.isInternal && setEditMarkup(e.target.value)}
                  disabled={editItem.isInternal}
                />
                {editItem.isInternal && (
                  <p className="text-[10px] text-blue-600">Internal vendor: markup dikunci ke 0</p>
                )}
              </div>

              {/* Selling Price Preview */}
              <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl text-white space-y-2">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">Preview Harga Jual</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/70">
                    {editItem.isInternal ? (
                      <span>{fmt(editBaseNum, editItem.currency)} → <span className="text-white font-bold">{fmt(editBaseNum, editItem.currency)}</span></span>
                    ) : (
                      <span>{fmt(editBaseNum, editItem.currency)} + {editMarkupNum}% → <span className="text-white font-bold">{fmt(editSellPreview, editItem.currency)}</span></span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2">
                  <span className="text-[10px] text-white/60">Platform Profit</span>
                  <span className="text-xs font-bold text-emerald-300">
                    {editItem.isInternal ? "Rp 0" : fmt(editProfit, editItem.currency)}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alasan (opsional)</Label>
                <Input className="h-9 text-sm" placeholder="Penyesuaian harga Q3, dll." value={editReason} onChange={e => setEditReason(e.target.value)} />
              </div>

              {/* Effective Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Berlaku Mulai (opsional — kosong = sekarang)</Label>
                <div className="flex gap-2">
                  <Input type="date" className="h-9 text-sm flex-1" value={editEffective} onChange={e => setEditEffective(e.target.value)} />
                  <Input type="time" className="h-9 text-sm w-28" value={editEffectiveTime} onChange={e => setEditEffectiveTime(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="h-9 text-sm" onClick={() => setEditItem(null)}>Batal</Button>
            <Button className="h-9 text-sm" onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Simpan Harga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── BULK UPDATE MODAL ── */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Bulk Update Harga ({selected.size} produk)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-xs text-slate-500">Kosongkan field yang tidak ingin diubah.</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Price Base Baru (IDR)</Label>
              <Input type="number" min="0" className="h-9 text-sm" placeholder="Kosong = tidak berubah" value={bulkBase} onChange={e => setBulkBase(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Markup % (hanya untuk External)</Label>
              <Input type="number" min="0" max="100" className="h-9 text-sm" placeholder="Kosong = tidak berubah" value={bulkMarkup} onChange={e => setBulkMarkup(e.target.value)} />
              <p className="text-[10px] text-blue-600">Internal vendor: markup tetap 0</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Alasan</Label>
              <Input className="h-9 text-sm" placeholder="Bulk update Q3 2026" value={bulkReason} onChange={e => setBulkReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-9 text-sm" onClick={() => setShowBulk(false)}>Batal</Button>
            <Button className="h-9 text-sm" onClick={saveBulk} disabled={bulkLoading}>
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Update {selected.size} Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
