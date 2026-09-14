import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LOGISTICS_SUBCATEGORIES as SUBCATEGORIES, LOGISTICS_UNITS as UNITS } from "@shared/logistics-constants";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useListLogisticOrders, useGetLogisticOrderSummary,
  useUpdateLogisticOrderStatus,
  getListLogisticOrdersQueryKey, getGetLogisticOrderSummaryQueryKey,
} from "@shared/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_COLORS, SHIPMENT_TYPES, OrderStatus } from "@/lib/services-data";
import {
  Package, Ship, TrendingUp, Search, LogOut, Filter, ChevronRight,
  Plus, Pencil, Trash2, Wrench, ToggleLeft, ToggleRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { fetchAndStoreProfile } from "@/lib/auth";
import { useLanguage } from "@/i18n/LanguageContext";
import { staticAsset } from "@/lib/staticAssets";

// Security: all admin API calls attach the Supabase Bearer token obtained from the
// current session. No shared secret or hardcoded password is embedded in this bundle.
// The API verifies the token server-side and checks that the caller's email is on the
// PORTAL_ADMIN_EMAILS allowlist before authorising any logistic-admin action.
const adminFetch = async (url: string, opts: RequestInit = {}) => {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  return fetch(url.replace("/api/portal/admin/services", "/api/portal/logistic-admin/services"), {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
};

interface JasaItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  subcategory: string | null;
  unit: string;
  description: string | null;
  isActive: boolean;
}

interface JasaForm {
  name: string;
  sku: string;
  price: string;
  subcategory: string;
  unit: string;
  description: string;
}

const emptyJasaForm = (): JasaForm => ({
  name: "", sku: "", price: "0", subcategory: "", unit: "pcs", description: "",
});

function JasaManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<JasaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<JasaForm>(emptyJasaForm());
  const [deleteTarget, setDeleteTarget] = useState<JasaItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [dbSubcats, setDbSubcats] = useState<string[]>([...SUBCATEGORIES]);

  useEffect(() => {
    void fetch("/api/portal/logistics-subcategories")
      .then((r) => r.ok ? r.json() : [...SUBCATEGORIES])
      .then((data: string[]) => setDbSubcats(data))
      .catch(() => { /* keep fallback */ });
  }, []);

  // Gabung DB subcategories + yang sudah ada di items (jika ada custom)
  const allSubcats = Array.from(new Set([
    ...dbSubcats,
    ...items.map((i) => i.subcategory).filter((s): s is string => !!s),
  ])).sort();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const r = await adminFetch("/api/portal/admin/services");
      setItems(await r.json());
    } catch {
      toast({ title: t("logisticAdmin.jasa.loadError", "Gagal memuat data jasa"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const setF = <K extends keyof JasaForm>(k: K, v: JasaForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyJasaForm());
    setDialogOpen(true);
  };

  const openEdit = (item: JasaItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      price: String(item.price),
      subcategory: item.subcategory ?? "",
      unit: item.unit,
      description: item.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast({ title: t("logisticAdmin.jasa.nameRequired", "Nama wajib diisi"), variant: "destructive" }); return; }
    if (!form.sku.trim()) { toast({ title: t("logisticAdmin.jasa.skuRequired", "SKU wajib diisi"), variant: "destructive" }); return; }
    setSaving(true);
    try {
      const body = JSON.stringify({
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price) || 0,
        subcategory: form.subcategory || null,
        unit: form.unit,
        description: form.description || null,
      });
      if (editingId) {
        await adminFetch(`/api/portal/admin/services/${editingId}`, { method: "PUT", body });
        toast({ title: t("logisticAdmin.jasa.updated", "Jasa diperbarui") });
      } else {
        await adminFetch("/api/portal/admin/services", { method: "POST", body });
        toast({ title: t("logisticAdmin.jasa.added", "Jasa ditambahkan") });
      }
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast({ title: t("logisticAdmin.jasa.saveError", "Gagal menyimpan"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: JasaItem) => {
    try {
      await adminFetch(`/api/portal/admin/services/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      toast({ title: item.isActive ? t("logisticAdmin.jasa.deactivated", "Jasa dinonaktifkan") : t("logisticAdmin.jasa.activated", "Jasa diaktifkan") });
      fetchItems();
    } catch {
      toast({ title: t("logisticAdmin.jasa.statusError", "Gagal mengubah status"), variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminFetch(`/api/portal/admin/services/${deleteTarget.id}`, { method: "DELETE" });
      toast({ title: t("logisticAdmin.jasa.deleted", "Jasa dihapus") });
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast({ title: t("logisticAdmin.jasa.deleteError", "Gagal menghapus"), variant: "destructive" });
    }
  };

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">{t("logisticAdmin.jasa.listTitle", "Daftar Jasa")} ({items.length})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("logisticAdmin.jasa.listSubtitle", "Jasa yang tampil di selector produk customer portal")}</p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> {t("logisticAdmin.jasa.addBtn", "Tambah Jasa")}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground text-sm">{t("logisticAdmin.loading", "Memuat data...")}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <Wrench className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-foreground">{t("logisticAdmin.jasa.empty", "Belum ada jasa")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("logisticAdmin.jasa.emptyHint", "Klik \"Tambah Jasa\" untuk menambahkan jasa baru")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    t("logisticAdmin.col.serviceName", "Nama Jasa"),
                    "SKU",
                    t("logisticAdmin.col.category", "Kategori"),
                    t("logisticAdmin.col.unit", "Satuan"),
                    t("logisticAdmin.col.price", "Harga"),
                    t("logisticAdmin.col.status", "Status"),
                    "",
                  ].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-3.5 w-3.5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground max-w-[220px] truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3">
                      {item.subcategory ? (
                        <Badge variant="secondary" className="text-xs">{item.subcategory}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.unit}</td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {item.price > 0 ? idr(item.price) : <span className="text-amber-600 text-xs">{t("logisticAdmin.jasa.nego", "Nego")}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          item.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {item.isActive
                          ? <><ToggleRight className="h-3.5 w-3.5" /> {t("logisticAdmin.jasa.active", "Aktif")}</>
                          : <><ToggleLeft className="h-3.5 w-3.5" /> {t("logisticAdmin.jasa.inactive", "Nonaktif")}</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("logisticAdmin.jasa.editTitle", "Edit Jasa") : t("logisticAdmin.jasa.addTitle", "Tambah Jasa Baru")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("logisticAdmin.jasa.form.nameLabel", "Nama Jasa *")}</Label>
                <Input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder={t("logisticAdmin.jasa.form.namePlaceholder", "cth: Jasa Trucking")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("logisticAdmin.jasa.form.skuLabel", "SKU / Kode *")}</Label>
                <Input value={form.sku} onChange={(e) => setF("sku", e.target.value)} placeholder="SVC-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("logisticAdmin.jasa.form.priceLabel", "Harga (0 = Nego)")}</Label>
                <Input type="number" value={form.price} onChange={(e) => setF("price", e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("logisticAdmin.jasa.form.unitLabel", "Satuan")}</Label>
                <Select value={form.unit} onValueChange={(v) => setF("unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                {t("logisticAdmin.jasa.form.categoryLabel", "Jenis / Kategori")}
                <span className="ml-1 text-xs text-muted-foreground">{t("logisticAdmin.jasa.form.categoryHint", "(bebas ketik atau pilih)")}</span>
              </Label>
              <datalist id="admin-subcat-list">
                {allSubcats.map((s) => <option key={s} value={s} />)}
              </datalist>
              <Input
                list="admin-subcat-list"
                value={form.subcategory}
                onChange={(e) => setF("subcategory", e.target.value)}
                placeholder={t("logisticAdmin.jasa.form.categoryPlaceholder", "cth: Trucking, Udara, Pabean…")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("logisticAdmin.jasa.form.descLabel", "Deskripsi")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setF("description", e.target.value)}
                placeholder={t("logisticAdmin.jasa.form.descPlaceholder", "Deskripsi singkat jasa (opsional)")}
                className="min-h-[70px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("logisticAdmin.cancel", "Batal")}</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? t("logisticAdmin.saving", "Menyimpan…") : editingId ? t("logisticAdmin.jasa.saveChanges", "Simpan Perubahan") : t("logisticAdmin.jasa.addBtn", "Tambah Jasa")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("logisticAdmin.jasa.deleteTitle", "Hapus Jasa?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("logisticAdmin.jasa.deleteDesc1", "Jasa")} <strong>{deleteTarget?.name}</strong> {t("logisticAdmin.jasa.deleteDesc2", "akan dihapus permanen dan tidak akan muncul lagi di pilihan pengiriman. Tindakan ini tidak bisa dibatalkan.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("logisticAdmin.cancel", "Batal")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              {t("logisticAdmin.jasa.confirmDelete", "Ya, Hapus")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "jasa">("orders");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateStatus = useUpdateLogisticOrderStatus();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    if (!supabase) { setLocation("/login"); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLocation("/login"); return; }
      const profile = await fetchAndStoreProfile();
      if (!profile || profile.role !== "admin") {
        setLocation("/dashboard");
        return;
      }
      setAuthed(true);
      setChecking(false);
    });
  }, [setLocation]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Real-time: order baru masuk → refresh daftar & summary otomatis + badge counter
  useEffect(() => {
    if (!authed) return;
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("new_logistic_order", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: getListLogisticOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLogisticOrderSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["listPortalLogisticOrders"] });
        // Increment badge hanya saat tab orders tidak aktif / halaman di background
        setNewOrderCount((n) => n + 1);
        toast({ title: `${t("logisticAdmin.newOrder", "Order baru masuk")}: ${data.orderNumber ?? ""}`, description: `${data.customerName ?? ""} — ${data.shipmentType ?? ""}` });
      } catch { }
    });
    return () => es.close();
  }, [authed, queryClient, toast, t]);

  const params = {
    status: statusFilter || undefined,
    shipmentType: typeFilter || undefined,
    search: debouncedSearch || undefined,
  };

  const { data: orders = [], isLoading } = useListLogisticOrders(params, {
    query: { enabled: authed, queryKey: getListLogisticOrdersQueryKey(params) },
  });

  const { data: summary } = useGetLogisticOrderSummary({
    query: { enabled: authed, queryKey: getGetLogisticOrderSummaryQueryKey() },
  });

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    setLocation("/");
  }

  function handleInlineStatusChange(orderId: number, status: string) {
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `${t("logisticAdmin.statusUpdated", "Status diperbarui")}: ${status}` });
          queryClient.invalidateQueries({ queryKey: getListLogisticOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetLogisticOrderSummaryQueryKey() });
          // Invalidate customer-facing portal orders (orders.tsx uses different hook/key)
          queryClient.invalidateQueries({ queryKey: ["listPortalLogisticOrders"] });
        },
        onError: () => toast({ title: t("logisticAdmin.statusUpdateError", "Gagal memperbarui status"), variant: "destructive" }),
      }
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">{t("logisticAdmin.checkingSession", "Memeriksa sesi...")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm text-foreground">{t("logisticAdmin.nav.title", "Admin Dashboard")}</span>
            </div>
            {/* Tab nav */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => { setActiveTab("orders"); setNewOrderCount(0); }}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "orders" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Package className="h-3.5 w-3.5 inline mr-1" />
                {t("logisticAdmin.nav.orders", "Pesanan")}
                {newOrderCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {newOrderCount > 99 ? "99+" : newOrderCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("jasa")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "jasa" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Wrench className="h-3.5 w-3.5 inline mr-1" />
                {t("logisticAdmin.nav.manageServices", "Kelola Jasa")}
              </button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 mr-1" /> {t("logisticAdmin.logout", "Logout")}
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── TAB: KELOLA JASA ── */}
        {activeTab === "jasa" && <JasaManager />}

        {/* ── TAB: PESANAN ── */}
        {activeTab === "orders" && (
          <>
            {/* Summary Stats */}
            {summary && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary-foreground/60 mb-1">{t("logisticAdmin.summary.totalOrders", "Total Pesanan")}</p>
                      <p className="text-4xl font-bold">{summary.totalOrders}</p>
                    </div>
                    <img src={staticAsset("images/logo.png")} alt="" className="w-10 h-auto object-contain opacity-25" />
                  </div>
                  <div className="bg-accent text-accent-foreground rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-accent-foreground/70 mb-1">{t("logisticAdmin.summary.estimatedRevenue", "Estimasi Revenue")}</p>
                      <p className="text-xl font-bold leading-tight">{formatCurrency(summary.totalEstimatedRevenue)}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 opacity-20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: "New Order", value: summary.newOrders, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", num: "text-blue-800" },
                    { label: "Under Review", value: summary.underReviewOrders, bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", num: "text-yellow-800" },
                    { label: "Quotation Sent", value: summary.quotationSentOrders, bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", num: "text-purple-800" },
                    { label: "Confirmed", value: summary.confirmedOrders, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", num: "text-emerald-800" },
                    { label: "In Progress", value: summary.inProgressOrders, bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", num: "text-orange-800" },
                    { label: "Completed", value: summary.completedOrders, bg: "bg-green-50", border: "border-green-200", text: "text-green-700", num: "text-green-800" },
                    { label: "Cancelled", value: summary.cancelledOrders, bg: "bg-red-50", border: "border-red-200", text: "text-red-700", num: "text-red-800" },
                  ].map(({ label, value, bg, border, text, num }) => (
                    <button
                      key={label}
                      onClick={() => setStatusFilter(statusFilter === label ? "" : label)}
                      className={`${bg} border ${border} rounded-lg p-3 text-left transition-all hover:shadow-sm ${statusFilter === label ? "ring-2 ring-offset-1 ring-current" : ""}`}
                    >
                      <p className={`text-2xl font-bold ${num}`}>{value}</p>
                      <p className={`text-xs font-medium mt-0.5 ${text} leading-tight`}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("logisticAdmin.orders.searchPlaceholder", "Cari nama perusahaan, PIC, atau nomor order...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "_all" ? "" : v)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    <SelectValue placeholder={t("logisticAdmin.orders.allStatuses", "Semua Status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">{t("logisticAdmin.orders.allStatuses", "Semua Status")}</SelectItem>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === "_all" ? "" : v)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t("logisticAdmin.orders.allTypes", "Semua Tipe")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">{t("logisticAdmin.orders.allTypes", "Semua Tipe")}</SelectItem>
                    {SHIPMENT_TYPES.map(({ type }) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-foreground text-sm">{t("logisticAdmin.orders.listTitle", "Daftar Pesanan")} ({orders.length})</h2>
              </div>

              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground text-sm">{t("logisticAdmin.loading", "Memuat data...")}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <img src={staticAsset("images/logo.png")} alt="" className="w-10 h-auto mx-auto mb-3 object-contain opacity-35" />
                  <p className="font-medium text-foreground">{t("logisticAdmin.orders.empty", "Tidak ada pesanan")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("logisticAdmin.orders.emptyHint", "Belum ada pesanan masuk")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {[
                          "Order #",
                          t("logisticAdmin.col.company", "Perusahaan"),
                          "PIC",
                          t("logisticAdmin.col.type", "Tipe"),
                          "Route",
                          t("logisticAdmin.col.total", "Total"),
                          t("logisticAdmin.col.status", "Status"),
                          t("logisticAdmin.col.date", "Tanggal"),
                          "",
                        ].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order: any) => (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-foreground">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{order.companyName}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{order.shipmentType}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{order.origin} → {order.destination}</td>
                          <td className="px-4 py-3 text-sm font-bold text-accent">{formatCurrency(order.grandTotal)}</td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleInlineStatusChange(order.id, val)}
                            >
                              <SelectTrigger className={`h-7 text-xs border-0 px-2 font-medium w-36 ${STATUS_COLORS[order.status as OrderStatus] || "bg-gray-100 text-gray-800"}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-3 cursor-pointer" onClick={() => setLocation(`/logistic-admin/orders/${order.id}`)}>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
