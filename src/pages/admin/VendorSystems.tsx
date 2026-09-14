/**
 * VendorSystems.tsx
 * VendorMarketplaceTab, VendorInvitationsTab, VendorCatalogTab
 */

import { useState, useEffect, useRef, Fragment } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { resolveImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatalogMediaAssetsDialog } from "@/components/catalog/CatalogMediaAssetsDialog";
import { AddVendorProductWizard } from "@/components/catalog/AddVendorProductWizard";
import {
  Loader2, RefreshCw, Search, Building2, BadgeCheck, Globe,
  Eye, X, Plus, Pencil, Star, Trash2, Upload, Image as ImageIcon,
  UserPlus, CheckCircle, Send, ClipboardCopy,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type SupplierRow = {
  id: number;
  name: string;
  phone: string | null;
  email?: string | null;
  status: string;
  is_active: boolean;
  is_verified: boolean;
  marketplace_status: "draft" | "published" | "unpublished";
  is_premium: boolean;
  created_at: string;
  published_items: number;
  total_items: number;
};

type VendorInvProduct = { name: string; description: string; category?: string | null; mediaUrls: string[] };

type VendorInv = {
  id: number;
  vendor_name: string;
  phone: string | null;
  email: string | null;
  service_type: string | null;
  notes: string | null;
  token: string;
  status: string;
  valid_until: string;
  sent_via_wa: boolean;
  created_at: string;
  rejection_reason?: string | null;
  rejected_at?: string | null;
  documents?: { docType: string; url: string | null; fileName: string }[] | null;
  category?: string | null;
  category_label?: string | null;
  products?: VendorInvProduct[] | null;
  vendor_message?: string | null;
  contact_name?: string | null;
  company_name?: string | null;
  accepted_at?: string | null;
  supplier_id?: number | null;
  approved_at?: string | null;
};

type VendorCatalogMediaItem = { id: number; file_url: string; is_primary: boolean };
type VendorMediaAsset = {
  id?: string; url: string; type?: string; mimeType?: string; title?: string; name?: string;
  isPrimary?: boolean; isCover?: boolean; visibility?: string; sortOrder?: number;
  objectPath?: string; sizeBytes?: number;
};

type VendorCatalogItem = {
  id: number;
  vendor_id: number;
  vendor_name: string | null;
  name: string;
  description: string | null;
  kategori: string | null;
  type: string;
  template_kind: string | null;
  status: string;
  is_published: boolean;
  is_active: boolean;
  is_internal_vendor: boolean;
  price_base: string | null;
  markup_pct: string | null;
  price_sell: string | null;
  currency: string | null;
  created_at: string;
  supplier_service_type: string | null;
  contact_email: string | null;
  phone: string | null;
  media: VendorCatalogMediaItem[];
  media_assets: VendorMediaAsset[];
  documents: { key: string; label: string; required?: boolean; url?: string; reference?: string; fileUrl?: string }[];
};

type EditCatalogForm = { name: string; description: string; price_base: string; markup_pct: string; kategori: string; template_kind: "product" | "service" };

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPE_LABEL: Record<string, string> = {
  npwp: "NPWP", siup_nib: "NIB", akta: "Akta Pendirian", ktp_pic: "KTP PIC", other: "Lainnya",
};
const VENDOR_INV_REQUIRED_DOC_TYPES = ["npwp", "siup_nib", "ktp_pic"];
const VENDOR_INV_SERVICE_OPTIONS = [
  { value: "", label: "— Pilih tipe layanan —" },
  { value: "marketplace", label: "Marketplace B2B" },
  { value: "sea_freight", label: "Sea Freight (FCL/LCL)" },
  { value: "air_freight", label: "Air Freight" },
  { value: "trucking", label: "Trucking / Darat" },
  { value: "ppjk", label: "PPJK / Custom Clearance" },
  { value: "warehousing", label: "Pergudangan" },
  { value: "other", label: "Lainnya" },
];

// ── VendorMarketplaceTab ───────────────────────────────────────────────────────

export function VendorMarketplaceTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "unpublished">("all");
  const [saving, setSaving] = useState<number | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/suppliers", { headers: getAuthHeaders(), credentials: "include" });
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: t("vendorSystems.errorLoadSupplier", "Gagal memuat data supplier"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMarketplace = async (
    id: number,
    patch: { isVerified?: boolean; marketplaceStatus?: "draft" | "published" | "unpublished" },
  ) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/portal/admin/suppliers/${id}/marketplace`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || t("vendorSystems.errorUpdate", "Gagal update"));
      }
      setSuppliers(prev => prev.map(s => s.id === id ? {
        ...s,
        ...(patch.isVerified       !== undefined ? { is_verified:       patch.isVerified }       : {}),
        ...(patch.marketplaceStatus !== undefined ? { marketplace_status: patch.marketplaceStatus } : {}),
      } : s));
      toast({ title: t("vendorSystems.updateSuccess", "Berhasil diperbarui") });
    } catch (e: any) {
      toast({ title: e.message || t("vendorSystems.errorUpdate", "Gagal update"), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const filtered = suppliers.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "all" || s.marketplace_status === filterStatus;
    return matchSearch && matchFilter;
  });

  const statusColor = (ms: string) => {
    if (ms === "published")   return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (ms === "unpublished") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };
  const statusLabel = (ms: string) => {
    if (ms === "published")   return "Published";
    if (ms === "unpublished") return "Unpublished";
    return "Draft";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-500" />
          {t("vendorSystems.marketplaceTitle", "Vendor Marketplace")}
        </CardTitle>
        <CardDescription>
          {t("vendorSystems.marketplaceDesc", "Kelola verifikasi vendor dan status publish ke marketplace publik. Produk vendor hanya tampil di marketplace jika vendor sudah")} <strong>Verified</strong> {t("vendorSystems.and", "dan")} <strong>Published</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder={t("vendorSystems.searchPlaceholder", "Cari nama atau email vendor...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "published", "draft", "unpublished"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterStatus === f
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {f === "all" ? t("vendorSystems.filterAll", "Semua") : f === "published" ? "Published" : f === "draft" ? "Draft" : "Unpublished"}
              </button>
            ))}
          </div>
          <button
            onClick={fetchSuppliers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("vendorSystems.refresh", "Refresh")}
          </button>
        </div>

        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Published: {suppliers.filter(s => s.marketplace_status === "published").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            Draft: {suppliers.filter(s => s.marketplace_status === "draft").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            Unpublished: {suppliers.filter(s => s.marketplace_status === "unpublished").length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("vendorSystems.loading", "Memuat data...")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("vendorSystems.noVendor", "Tidak ada vendor ditemukan")}</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">{t("vendorSystems.colVendor", "Vendor")}</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">{t("vendorSystems.colProducts", "Produk")}</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Verified</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">{t("vendorSystems.colMarketplaceStatus", "Status Marketplace")}</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">{t("vendorSystems.colAction", "Aksi")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      {s.email && <p className="text-xs text-slate-400 mt-0.5">{s.email}</p>}
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                        s.is_active ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="font-semibold text-slate-800">{s.published_items}</span>
                      <span className="text-slate-400"> / {s.total_items}</span>
                      <p className="text-xs text-slate-400">published</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        disabled={saving === s.id}
                        onClick={() => updateMarketplace(s.id, { isVerified: !s.is_verified })}
                        title={s.is_verified ? t("vendorSystems.revokeVerification", "Klik untuk cabut verifikasi") : t("vendorSystems.verify", "Klik untuk verifikasi")}
                        className="inline-flex items-center justify-center"
                      >
                        {saving === s.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : s.is_verified ? (
                          <BadgeCheck className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <BadgeCheck className="h-6 w-6 text-slate-200" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${statusColor(s.marketplace_status)}`}>
                        {statusLabel(s.marketplace_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.marketplace_status !== "published" ? (
                          <Button
                            size="sm"
                            disabled={saving === s.id}
                            onClick={() => updateMarketplace(s.id, { marketplaceStatus: "published", isVerified: true })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3"
                          >
                            {saving === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                              <><Globe className="h-3 w-3 mr-1" />{t("vendorSystems.publish", "Publish")}</>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={saving === s.id}
                            onClick={() => updateMarketplace(s.id, { marketplaceStatus: "unpublished" })}
                            className="text-xs h-7 px-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            {saving === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t("vendorSystems.unpublish", "Unpublish")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── VendorInvitationsTab ───────────────────────────────────────────────────────

export function VendorInvitationsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [list, setList] = useState<VendorInv[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [vendorName, setVendorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");
  const [sendWa, setSendWa] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [lastToken, setLastToken] = useState<string | null>(null);
  const [lastVendorName, setLastVendorName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [detailInv, setDetailInv] = useState<VendorInv | null>(null);

  const portalOrigin = window.location.origin;
  const inviteLink = (token: string) => `${portalOrigin}/vendor-register?token=${token}`;

  const loadList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/portal/admin/vendor-invitations", {
        credentials: "include", headers: getAuthHeaders(),
      });
      if (res.ok) setList(await res.json());
    } catch { /* ignore */ } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadList(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!vendorName.trim()) { toast({ title: t("vendorSystems.vendorNameRequired", "Nama vendor harus diisi"), variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/admin/vendor-invitations", {
        method: "POST", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_name: vendorName, phone: phone || undefined, email: email || undefined,
          service_type: serviceType || undefined, notes: notes || undefined, send_wa: sendWa && !!phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? t("vendorSystems.errorGeneric", "Gagal"));
      setLastToken(data.token);
      setLastVendorName(vendorName);
      setCopied(false);
      toast({
        title: t("vendorSystems.inviteCreated", "Undangan berhasil dibuat!"),
        description: data.sent_via_wa ? t("vendorSystems.inviteSentWa", "Link sudah dikirim via WhatsApp.") : t("vendorSystems.inviteCopyManual", "Salin link dan kirim manual ke vendor."),
      });
      setVendorName(""); setPhone(""); setEmail(""); setServiceType(""); setNotes(""); setSendWa(true);
      loadList();
    } catch (e: any) {
      toast({ title: t("vendorSystems.errorCreateInvite", "Gagal membuat undangan"), description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(inviteLink(token)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: t("vendorSystems.linkCopied", "Link disalin!") });
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${t("vendorSystems.revokeInviteConfirm", "Cabut undangan untuk")} "${name}"?`)) return;
    await fetch(`/api/portal/admin/vendor-invitations/${id}`, {
      method: "DELETE", credentials: "include", headers: getAuthHeaders(),
    });
    setList(prev => prev.filter(v => v.id !== id));
    toast({ title: t("vendorSystems.inviteRevoked", "Undangan dicabut") });
  };

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/portal/admin/vendor-invitations/${id}/approve`, {
        method: "POST", credentials: "include", headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: t("vendorSystems.errorApproveVendor", "Gagal menyetujui vendor"), description: data?.message ?? t("vendorSystems.tryAgain", "Coba lagi"), variant: "destructive" });
        return;
      }
      setList(prev => prev.map(v => v.id === id ? { ...v, supplier_id: data.supplier_id, approved_at: new Date().toISOString() } : v));
      toast({ title: t("vendorSystems.vendorApproved", "Vendor disetujui & diaktifkan"), description: `Supplier ID #${data.supplier_id} ${t("vendorSystems.createdInErp", "dibuat di ERP")}` });
    } finally { setApprovingId(null); }
  };

  const docCompleteness = (inv: VendorInv) => {
    const docs = Array.isArray(inv.documents) ? inv.documents : [];
    const uploadedTypes = new Set(docs.map(d => d.docType));
    const missing = VENDOR_INV_REQUIRED_DOC_TYPES.filter(t => !uploadedTypes.has(t));
    return { uploadedTypes, missing, complete: missing.length === 0 };
  };

  const statusBadge = (inv: VendorInv) => {
    if (inv.status === "accepted") return <Badge className="bg-green-100 text-green-700">{t("vendorSystems.statusAccepted", "Diterima")}</Badge>;
    if (inv.status === "rejected") return <Badge className="bg-red-100 text-red-700">{t("vendorSystems.statusRejected", "Ditolak")}</Badge>;
    const expired = new Date(inv.valid_until) < new Date();
    if (expired) return <Badge variant="outline" className="text-slate-400">{t("vendorSystems.statusExpired", "Kadaluarsa")}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700">{t("vendorSystems.statusPending", "Menunggu")}</Badge>;
  };

  const inviteFilterStatus = (inv: VendorInv): "pending" | "accepted" | "active" | "rejected" | "expired" => {
    if (inv.status === "accepted") return inv.supplier_id ? "active" : "accepted";
    if (inv.status === "rejected") return "rejected";
    if (new Date(inv.valid_until) < new Date()) return "expired";
    return "pending";
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "active" | "rejected" | "expired">("all");

  const filteredList = list.filter(inv => {
    if (statusFilter !== "all" && inviteFilterStatus(inv) !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const haystack = [inv.vendor_name, inv.company_name, inv.phone, inv.email, inv.category_label].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-indigo-500" />
            {t("vendorSystems.createInviteTitle", "Buat Undangan Vendor Baru")}
          </CardTitle>
          <CardDescription>{t("vendorSystems.createInviteDesc", "Setiap vendor mendapat link unik yang berbeda. Link berlaku 30 hari.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label>{t("vendorSystems.labelVendorName", "Nama Vendor / Perusahaan")} <span className="text-red-500">*</span></Label>
              <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="PT. Maju Jaya Logistics" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vendorSystems.labelWhatsapp", "No. WhatsApp")}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="628123456789" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vendorSystems.labelEmail", "Email")}</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendor@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vendorSystems.labelServiceType", "Tipe Layanan")}</Label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {VENDOR_INV_SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("vendorSystems.labelNotes", "Catatan (opsional)")}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder={t("vendorSystems.notesPlaceholder", "Informasi tambahan untuk vendor...")} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={sendWa}
                  onChange={e => setSendWa(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                {t("vendorSystems.sendViaWa", "Kirim otomatis via WhatsApp (jika ada No. WA)")}
              </label>
            </div>
          </div>

          {vendorName.trim() && (
            <div className="mt-5 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("vendorSystems.previewTitle", "Preview sebelum dikirim")}</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{t("vendorSystems.previewLinkFormat", "Format link undangan yang akan dibuat:")}</p>
                <code className="block text-xs bg-white border border-slate-200 rounded px-3 py-2 text-indigo-700 break-all">
                  {portalOrigin}/vendor-register?token=<span className="text-slate-400 italic">[token-unik-64-karakter]</span>
                </code>
              </div>
              {sendWa && phone && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">{t("vendorSystems.previewWaMessage", "Preview pesan WhatsApp yang akan dikirim ke")} <span className="font-medium">{phone}</span>:</p>
                  <pre className="text-xs bg-white border border-slate-200 rounded px-3 py-2 whitespace-pre-wrap text-slate-700 font-sans leading-relaxed">
{`Halo *${vendorName.trim()}*! 👋

Anda mendapat undangan dari *CST Logistic* untuk bergabung sebagai mitra vendor di platform B2B kami.

Klik link berikut untuk mendaftar:
${portalOrigin}/vendor-register?token=[token-unik]

Link berlaku hingga 30 hari ke depan.

Terima kasih 🙏`}
                  </pre>
                </div>
              )}
              {sendWa && !phone && (
                <p className="text-xs text-amber-600">⚠ {t("vendorSystems.fillWaWarning", "Isi No. WhatsApp agar pesan bisa dikirim otomatis, atau salin link manual setelah undangan dibuat.")}</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleCreate} disabled={submitting || !vendorName.trim()} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? t("vendorSystems.creating", "Membuat...") : t("vendorSystems.createInvite", "Buat Undangan")}
            </Button>
          </div>

          {lastToken && (
            <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-indigo-800">
                ✅ {t("vendorSystems.inviteLinkFor", "Link undangan untuk")} <span className="font-bold">{lastVendorName}</span>
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white border border-indigo-200 rounded px-2 py-1.5 break-all text-indigo-700">
                  {inviteLink(lastToken)}
                </code>
                <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => handleCopy(lastToken)}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                  {copied ? t("vendorSystems.copied", "Tersalin!") : t("vendorSystems.copy", "Salin")}
                </Button>
              </div>
              <p className="text-xs text-indigo-600">{t("vendorSystems.shareLinkHint", "Bagikan link ini ke vendor. Setiap vendor memiliki link unik yang berbeda.")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t("vendorSystems.inviteListTitle", "Daftar Undangan Terkirim")}</span>
            <Button size="sm" variant="ghost" onClick={loadList} disabled={loadingList}>
              <RefreshCw className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`} />
            </Button>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t("vendorSystems.searchInvitePlaceholder", "Cari nama vendor, kontak, atau kategori...")}
              className="sm:max-w-xs h-8 text-sm"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="sm:w-48 h-8 text-sm">
                <SelectValue placeholder={t("vendorSystems.allStatuses", "Semua status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("vendorSystems.allStatuses", "Semua status")}</SelectItem>
                <SelectItem value="pending">{t("vendorSystems.statusPending", "Menunggu")}</SelectItem>
                <SelectItem value="accepted">{t("vendorSystems.statusAcceptedNotActive", "Diterima (belum aktif)")}</SelectItem>
                <SelectItem value="active">{t("vendorSystems.statusActiveSupplier", "Supplier aktif")}</SelectItem>
                <SelectItem value="rejected">{t("vendorSystems.statusRejected", "Ditolak")}</SelectItem>
                <SelectItem value="expired">{t("vendorSystems.statusExpired", "Kadaluarsa")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.loading", "Memuat...")}</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.noInvites", "Belum ada undangan yang dibuat.")}</p>
          ) : filteredList.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.noInvitesFilter", "Tidak ada undangan yang cocok dengan filter.")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr>
                    <th className="text-left pb-2 pr-4">{t("vendorSystems.colVendor", "Vendor")}</th>
                    <th className="text-left pb-2 pr-4">{t("vendorSystems.colContact", "Kontak")}</th>
                    <th className="text-left pb-2 pr-4">{t("vendorSystems.colService", "Layanan")}</th>
                    <th className="text-left pb-2 pr-4">{t("vendorSystems.colStatus", "Status")}</th>
                    <th className="text-left pb-2 pr-4">WA</th>
                    <th className="text-left pb-2 pr-4">{t("vendorSystems.colCreated", "Dibuat")}</th>
                    <th className="text-left pb-2">{t("vendorSystems.colAction", "Aksi")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(inv => {
                    const hasDocs = Array.isArray(inv.documents) && inv.documents.length > 0;
                    const hasNotes = !!inv.notes?.trim();
                    const hasProducts = Array.isArray(inv.products) && inv.products.length > 0;
                    const hasStructured = !!inv.category_label || hasProducts || !!inv.vendor_message;
                    const hasDetail = hasDocs || hasNotes || hasStructured;
                    const { missing: missingDocs } = docCompleteness(inv);
                    return (
                      <Fragment key={inv.id}>
                        <tr className={inv.rejection_reason || hasDetail ? "" : "border-b last:border-0"}>
                          <td className="py-2 pr-4 font-medium">
                            {inv.vendor_name}
                            {inv.category_label && (
                              <div className="mt-0.5"><Badge variant="outline" className="text-[10px]">{inv.category_label}</Badge></div>
                            )}
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground">
                            {inv.phone && <div>{inv.phone}</div>}
                            {inv.email && <div>{inv.email}</div>}
                          </td>
                          <td className="py-2 pr-4 text-xs">{inv.service_type ?? "—"}</td>
                          <td className="py-2 pr-4">
                            {statusBadge(inv)}
                            {inv.status !== "pending" || hasDocs ? (
                              <div className="mt-1">
                                {missingDocs.length === 0
                                  ? <Badge className="bg-green-50 text-green-600 border border-green-200 text-[10px]">{t("vendorSystems.docsComplete", "Dokumen lengkap")}</Badge>
                                  : <Badge className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px]">
                                      {hasDocs ? `${t("vendorSystems.missingDocs", "Kurang")} ${missingDocs.length} ${t("vendorSystems.docUnit", "dok.")}` : t("vendorSystems.noDocs", "Belum ada dokumen")}
                                    </Badge>}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-2 pr-4">
                            {inv.sent_via_wa
                              ? <Badge className="bg-green-100 text-green-700 text-xs">{t("vendorSystems.waSent", "Terkirim")}</Badge>
                              : <Badge variant="outline" className="text-xs">{t("vendorSystems.waNotSent", "Belum")}</Badge>}
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(inv.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-2">
                            <div className="flex items-center gap-1">
                              {hasDetail && (
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setDetailInv(inv)} title={t("vendorSystems.viewDetail", "Lihat detail pendaftaran")}>
                                  <Eye className="h-3.5 w-3.5" /> {t("vendorSystems.detail", "Detail")}
                                </Button>
                              )}
                              {inv.status === "accepted" && (
                                inv.supplier_id ? (
                                  <div className="flex flex-col items-start gap-0.5">
                                    <Badge className="bg-green-100 text-green-700 text-xs">{t("vendorSystems.activeSupplier", "Supplier aktif")} #{inv.supplier_id}</Badge>
                                    {inv.approved_at && (
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {t("vendorSystems.approvedOn", "Disetujui")} {new Date(inv.approved_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <Button size="sm" variant="default" className="h-7 px-2 text-xs gap-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(inv.id)} disabled={approvingId === inv.id} title={t("vendorSystems.approveActivate", "Setujui & aktifkan sebagai supplier ERP")}>
                                    {approvingId === inv.id ? t("vendorSystems.processing", "Memproses...") : t("vendorSystems.approveActivateBtn", "Setujui & Aktifkan")}
                                  </Button>
                                )
                              )}
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handleCopy(inv.token)} title={t("vendorSystems.copyInviteLink", "Salin link undangan")}>
                                <ClipboardCopy className="h-3.5 w-3.5" /> {t("vendorSystems.copyLink", "Salin Link")}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(inv.id, inv.vendor_name)} title={t("vendorSystems.revokeInvite", "Cabut undangan")}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {inv.rejection_reason && (
                          <tr className="border-b last:border-0">
                            <td colSpan={7} className="pb-2 pt-0">
                              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                <span className="font-semibold">{t("vendorSystems.rejectionReason", "Alasan tidak setuju")}</span>
                                {inv.rejected_at && (
                                  <span className="text-red-400 font-normal">
                                    {" "}· {new Date(inv.rejected_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                )}
                                <div className="mt-0.5 text-red-600 whitespace-pre-line">{inv.rejection_reason}</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!detailInv} onOpenChange={(o) => !o && setDetailInv(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailInv && (() => {
            const inv = detailInv;
            const { missing: missingDocs } = docCompleteness(inv);
            const docs = Array.isArray(inv.documents) ? inv.documents : [];
            const products = Array.isArray(inv.products) ? inv.products : [];
            return (
              <>
                <DialogHeader><DialogTitle>{t("vendorSystems.detailModalTitle", "Detail Pendaftaran Vendor")}</DialogTitle></DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{inv.company_name || inv.vendor_name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {statusBadge(inv)}
                      {inv.category_label && <Badge variant="outline">{inv.category_label}</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {inv.contact_name && <div><span className="text-slate-400">{t("vendorSystems.contact", "Kontak")}</span><div className="text-slate-700">{inv.contact_name}</div></div>}
                    {inv.phone && <div><span className="text-slate-400">{t("vendorSystems.waNumber", "No. WA")}</span><div className="text-slate-700">{inv.phone}</div></div>}
                    {inv.email && <div><span className="text-slate-400">{t("vendorSystems.labelEmail", "Email")}</span><div className="text-slate-700">{inv.email}</div></div>}
                    {inv.accepted_at && (
                      <div><span className="text-slate-400">{t("vendorSystems.accepted", "Diterima")}</span><div className="text-slate-700">{new Date(inv.accepted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div></div>
                    )}
                  </div>
                  {inv.vendor_message && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">{t("vendorSystems.vendorMessage", "Pesan dari vendor")}</p>
                      <p className="text-xs text-slate-600 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-2.5">{inv.vendor_message}</p>
                    </div>
                  )}
                  {inv.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">{t("vendorSystems.notes", "Catatan")}</p>
                      <p className="text-xs text-slate-600 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-2.5">{inv.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">
                      {t("vendorSystems.offeredProducts", "Produk / Jasa ditawarkan")} {products.length > 0 && `(${products.length})`}
                    </p>
                    {products.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{t("vendorSystems.noProductsFilled", "Belum ada produk/jasa yang diisi vendor.")}</p>
                    ) : (
                      <div className="space-y-2">
                        {products.map((p, i) => (
                          <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800">{p.name || t("vendorSystems.noName", "(tanpa nama)")}</p>
                              {p.category && <Badge variant="outline" className="text-[10px] shrink-0">{p.category}</Badge>}
                            </div>
                            {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                            {p.mediaUrls?.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {p.mediaUrls.map((u, j) => (
                                  <a key={j} href={u} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[11px] inline-flex items-center gap-0.5">
                                    <ImageIcon className="h-3 w-3" /> {t("vendorSystems.media", "Media")} {j + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">{t("vendorSystems.legalDocs", "Dokumen legalitas")}</p>
                    <div className="space-y-1.5">
                      {["npwp", "siup_nib", "akta", "ktp_pic"].map((docType) => {
                        const doc = docs.find(d => d.docType === docType);
                        const required = VENDOR_INV_REQUIRED_DOC_TYPES.includes(docType);
                        return (
                          <div key={docType} className="flex items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">
                            <span className="text-slate-600">
                              {DOC_TYPE_LABEL[docType]} {required && <span className="text-red-400">*</span>}
                            </span>
                            {doc ? (
                              doc.url ? (
                                <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                                  <Eye className="h-3.5 w-3.5" /> {t("vendorSystems.viewDocument", "Lihat dokumen")}
                                </a>
                              ) : (
                                <Badge className="bg-green-50 text-green-600 border border-green-200 text-[10px]">{t("vendorSystems.docSaved", "Tersimpan (aman)")}</Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="text-slate-400 text-[10px]">{t("vendorSystems.docNotUploaded", "Belum diunggah")}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {missingDocs.length > 0 && (
                      <p className="text-[11px] text-amber-600 mt-1.5">
                        {t("vendorSystems.missingMandatoryDocs", "Dokumen wajib belum lengkap:")} {missingDocs.map(t => DOC_TYPE_LABEL[t]).join(", ")}.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {t("vendorSystems.docLinkNote", "Link dokumen bersifat sementara (5 menit) dan hanya dapat diakses oleh admin yang login.")}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDetailInv(null)}>{t("vendorSystems.close", "Tutup")}</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── VendorCatalogTab ───────────────────────────────────────────────────────────

export function VendorCatalogTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [items, setItems] = useState<VendorCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [deletingMedia, setDeletingMedia] = useState<Record<number, boolean>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [editTarget, setEditTarget] = useState<VendorCatalogItem | null>(null);
  const [editForm, setEditForm] = useState<EditCatalogForm>({ name: "", description: "", price_base: "", markup_pct: "0", kategori: "", template_kind: "product" });
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mediaAssetsTarget, setMediaAssetsTarget] = useState<VendorCatalogItem | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/admin/vendor-catalog-items", {
        credentials: "include", headers: getAuthHeaders(),
      });
      const data = await res.json();
      setItems((Array.isArray(data) ? data : []).map((d: any) => ({
        ...d,
        is_internal_vendor: d.is_internal_vendor === true,
        media:        Array.isArray(d.media)        ? d.media        : [],
        media_assets: Array.isArray(d.media_assets) ? d.media_assets : [],
        documents:    Array.isArray(d.documents)    ? d.documents    : [],
      })));
    } catch {
      toast({ title: t("vendorSystems.errorLoadCatalog", "Gagal memuat katalog vendor"), variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (item: VendorCatalogItem) => {
    setEditTarget(item);
    setEditForm({
      name: item.name,
      description: item.description ?? "",
      price_base: item.price_base != null ? String(parseFloat(String(item.price_base)) || 0) : "",
      markup_pct: item.markup_pct != null ? String(parseFloat(String(item.markup_pct)) || 0) : "0",
      kategori: item.kategori ?? "",
      template_kind: item.template_kind === "service" || item.type === "service" ? "service" : "product",
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) { toast({ title: t("vendorSystems.productNameRequired", "Nama produk harus diisi"), variant: "destructive" }); return; }
    setSaving(true);
    try {
      const base = parseFloat(editForm.price_base) || 0;
      const isInternal = editTarget.is_internal_vendor;
      const markup = isInternal ? 0 : (parseFloat(editForm.markup_pct) || 0);
      const r = await fetch(`/api/portal/admin/vendor-catalog-items/${editTarget.id}`, {
        method: "PUT", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          price_base: base || null,
          markup_pct: markup,
          kategori: editForm.kategori.trim() || null,
          template_kind: editForm.template_kind,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const serverResp = await r.json() as { ok: boolean; price_sell: number | null; effective_markup?: number };
      const effectiveMarkup = serverResp.effective_markup ?? markup;
      const sell = serverResp.price_sell;
      setItems(prev => prev.map(i => i.id === editTarget.id
        ? {
            ...i,
            name: editForm.name.trim(),
            description: editForm.description.trim() || null,
            price_base: base ? String(base) : null,
            markup_pct: String(effectiveMarkup),
            price_sell: sell != null ? String(sell) : null,
            kategori: editForm.kategori.trim() || null,
            type: editForm.template_kind,
            template_kind: editForm.template_kind,
          }
        : i
      ));
      toast({ title: t("vendorSystems.productUpdated", "Produk berhasil diperbarui") });
      setEditTarget(null);
    } catch (e) {
      toast({ title: t("vendorSystems.errorSave", "Gagal menyimpan"), description: String(e), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const togglePublish = async (item: VendorCatalogItem) => {
    setBusyId(item.id);
    try {
      await fetch(`/api/portal/admin/vendor-catalog-items/${item.id}`, {
        method: "PATCH", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !item.is_published }),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_published: !i.is_published, status: !i.is_published ? "published" : "draft" } : i));
    } finally { setBusyId(null); }
  };

  const handleDelete = async (item: VendorCatalogItem) => {
    if (!confirm(`${t("vendorSystems.deleteProductConfirm", "Hapus produk")} "${item.name}" ${t("vendorSystems.fromCatalog", "dari katalog?")}`)) return;
    setBusyId(item.id);
    try {
      await fetch(`/api/portal/admin/vendor-catalog-items/${item.id}`, { method: "DELETE", credentials: "include", headers: getAuthHeaders() });
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast({ title: t("vendorSystems.productDeleted", "Produk dihapus dari katalog") });
    } finally { setBusyId(null); }
  };

  const handleUploadMedia = async (itemId: number, file: File) => {
    setUploading(p => ({ ...p, [itemId]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/portal/admin/vendor-catalog-items/${itemId}/media`, {
        method: "POST", headers: getAuthHeaders(), credentials: "include", body: fd,
      });
      const j = await r.json() as { media?: VendorCatalogMediaItem; error?: string };
      if (!r.ok) throw new Error(j.error ?? t("vendorSystems.uploadFailed", "Upload gagal"));
      if (j.media) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, media: [...i.media, j.media!] } : i));
      }
      toast({ title: t("vendorSystems.photoUploaded", "Foto berhasil diunggah") });
    } catch (e: unknown) {
      toast({ title: t("vendorSystems.uploadFailed", "Upload gagal"), description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setUploading(p => ({ ...p, [itemId]: false }));
      if (fileInputRefs.current[itemId]) fileInputRefs.current[itemId]!.value = "";
    }
  };

  const handleDeleteMedia = async (mediaId: number, itemId: number) => {
    setDeletingMedia(p => ({ ...p, [mediaId]: true }));
    try {
      const r = await fetch(`/api/portal/admin/vendor-catalog-items/media/${mediaId}`, {
        method: "DELETE", credentials: "include", headers: getAuthHeaders(),
      });
      if (!r.ok) throw new Error(t("vendorSystems.errorDeletePhoto", "Gagal menghapus foto"));
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, media: i.media.filter(m => m.id !== mediaId) } : i));
    } catch {
      toast({ title: t("vendorSystems.errorDeletePhoto", "Gagal hapus foto"), variant: "destructive" });
    } finally { setDeletingMedia(p => ({ ...p, [mediaId]: false })); }
  };

  const filteredItems = items.filter(i => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.vendor_name ?? "").toLowerCase().includes(q) || (i.kategori ?? "").toLowerCase().includes(q);
  });

  const vendorGroups = filteredItems.reduce<Record<string, VendorCatalogItem[]>>((acc, item) => {
    const key = item.vendor_name ?? `vendor-${item.vendor_id}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t("vendorSystems.editProduct", "Edit Produk")}
              {editTarget?.is_internal_vendor && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-300 uppercase tracking-wide">
                  🏢 Internal Company
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {editTarget?.is_internal_vendor && (
              <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                {t("vendorSystems.internalVendorNote", "Vendor ini adalah perusahaan internal. Markup platform tidak berlaku — harga customer sama dengan harga dasar.")}
              </div>
            )}
            <div>
              <Label className="text-xs font-medium">{t("vendorSystems.productName", "Nama Produk")}</Label>
              <input className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder={t("vendorSystems.productNamePlaceholder", "Nama produk...")} />
            </div>
            <div>
              <Label className="text-xs font-medium">{t("vendorSystems.description", "Deskripsi")}</Label>
              <textarea className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" rows={3} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder={t("vendorSystems.shortDescPlaceholder", "Deskripsi singkat...")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">{t("vendorSystems.basePrice", "Harga Dasar (Rp)")}</Label>
                <input type="number" min={0} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={editForm.price_base} onChange={e => setEditForm(p => ({ ...p, price_base: e.target.value }))} placeholder={t("vendorSystems.basePricePlaceholder", "Misal: 40000")} />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("vendorSystems.platformMarkup", "Markup Platform (%)")}
                  {editTarget?.is_internal_vendor && <span className="ml-1 text-violet-600 normal-case font-normal">({t("vendorSystems.disabled", "dinonaktifkan")})</span>}
                </Label>
                <input type="number" min={0} max={100} step={0.5} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  value={editTarget?.is_internal_vendor ? "0" : editForm.markup_pct}
                  onChange={e => { if (editTarget?.is_internal_vendor) return; setEditForm(p => ({ ...p, markup_pct: e.target.value })); }}
                  disabled={editTarget?.is_internal_vendor}
                  placeholder={t("vendorSystems.markupPlaceholder", "Misal: 12.5")}
                />
              </div>
            </div>
            {(() => {
              const base = parseFloat(editForm.price_base) || 0;
              const isInternal = editTarget?.is_internal_vendor ?? false;
              const markup = isInternal ? 0 : (parseFloat(editForm.markup_pct) || 0);
              const sell = base > 0 ? Math.ceil(base * (1 + markup / 100)) : null;
              const profit = sell != null ? sell - base : null;
              return base > 0 ? (
                <div className={`rounded-md border px-3 py-2.5 text-sm ${isInternal ? "bg-violet-50 border-violet-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">{t("vendorSystems.customerPrice", "Harga Customer")}</span>
                    <span className={`font-bold text-base ${isInternal ? "text-violet-700" : "text-emerald-700"}`}>
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(sell ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground text-xs">{t("vendorSystems.platformProfit", "Keuntungan Platform")}</span>
                    <span className={`text-xs font-medium ${isInternal ? "text-violet-500" : "text-emerald-600"}`}>
                      {isInternal
                        ? `Rp0 (${t("vendorSystems.internalNoMarkup", "Internal — tidak ada markup")})`
                        : `${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(profit ?? 0)}${markup > 0 ? ` (${markup}%)` : ""}`
                      }
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
            <div>
              <Label className="text-xs font-medium">{t("vendorSystems.category", "Kategori")}</Label>
              <input className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={editForm.kategori} onChange={e => setEditForm(p => ({ ...p, kategori: e.target.value }))} placeholder={t("vendorSystems.categoryPlaceholder", "Misal: commodity")} />
            </div>
            <div>
              <Label className="text-xs font-medium">Tipe Marketplace</Label>
              <Select value={editForm.template_kind} onValueChange={(value) => setEditForm(p => ({ ...p, template_kind: value as "product" | "service" }))}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>{t("vendorSystems.cancel", "Batal")}</Button>
            <Button size="sm" onClick={() => void handleSaveEdit()} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null} {t("vendorSystems.save", "Simpan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{t("vendorSystems.catalogTitle", "Katalog Produk Vendor")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {t("vendorSystems.catalogDesc", "Semua produk marketplace. Admin dapat edit detail, upload/hapus foto, dan mengatur status publish.")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => void loadItems()} className="gap-1.5 text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> {t("vendorSystems.refresh", "Refresh")}
              </Button>
              <Button size="sm" onClick={() => setShowAddWizard(true)} className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-3.5 w-3.5" /> {t("vendorSystems.addProduct", "Tambah Produk")}
              </Button>
            </div>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={t("vendorSystems.catalogSearchPlaceholder", "Cari nama produk, vendor, kategori...")}
              className="pl-8 text-sm h-8 flex w-full rounded-md border border-input bg-background px-3 py-1"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.loading", "Memuat...")}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.noCatalogProducts", "Belum ada produk vendor di katalog.")}</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("vendorSystems.noMatchingProducts", "Tidak ada produk yang cocok dengan pencarian.")}</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(vendorGroups).map(([vendorName, vendorItems]) => (
                <div key={vendorName}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">{vendorName}</span>
                    <Badge variant="outline" className="text-[10px]">{vendorItems.length} {t("vendorSystems.productUnit", "produk")}</Badge>
                    {vendorItems[0]?.is_internal_vendor && (
                      <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-300 uppercase tracking-wide">
                        🏢 Internal Company
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="py-2 pr-2 w-6"></th>
                          <th className="py-2 pr-4">{t("vendorSystems.colProduct", "Produk")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colCategory", "Kategori")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colSellPrice", "Harga Jual")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colMarkup", "Markup")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colPhoto", "Foto")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colStatus", "Status")}</th>
                          <th className="py-2 pr-4">{t("vendorSystems.colCreated", "Dibuat")}</th>
                          <th className="py-2">{t("vendorSystems.colAction", "Aksi")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorItems.map(item => {
                          const isExpanded = !!expanded[item.id];
                          const isUploading = !!uploading[item.id];
                          return (
                            <Fragment key={item.id}>
                              <tr className="border-b hover:bg-slate-50/50">
                                <td className="py-2 pr-2">
                                  <button onClick={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))} className="text-slate-400 hover:text-slate-700 transition-colors" title={isExpanded ? t("vendorSystems.closePhotos", "Tutup foto") : t("vendorSystems.managePhotos", "Kelola foto")}>
                                    <ImageIcon className="h-4 w-4" />
                                  </button>
                                </td>
                                <td className="py-2 pr-4">
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>}
                                </td>
                                <td className="py-2 pr-4"><Badge variant="outline" className="text-xs">{item.kategori ?? "-"}</Badge></td>
                                <td className="py-2 pr-4 whitespace-nowrap">
                                  {item.price_sell != null && parseFloat(String(item.price_sell)) > 0 ? (
                                    <span className="text-xs font-semibold text-emerald-700">
                                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(parseFloat(String(item.price_sell)))}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">{t("vendorSystems.notSet", "Belum diset")}</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4 whitespace-nowrap">
                                  {item.is_internal_vendor ? (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">{t("vendorSystems.internal", "Internal")}</span>
                                  ) : item.markup_pct != null && parseFloat(String(item.markup_pct)) > 0 ? (
                                    <span className="text-xs text-slate-600">{parseFloat(String(item.markup_pct))}%</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">0%</span>
                                  )}
                                </td>
                                <td className="py-2 pr-4">
                                  <button onClick={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-slate-800 transition-colors">
                                    <ImageIcon className="h-3.5 w-3.5" />{item.media.length} {t("vendorSystems.photoUnit", "foto")}
                                  </button>
                                </td>
                                <td className="py-2 pr-4">
                                  {item.is_published
                                    ? <Badge className="bg-green-100 text-green-700 text-xs">Published</Badge>
                                    : <Badge variant="outline" className="text-xs">Draft</Badge>}
                                </td>
                                <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td className="py-2">
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => openEdit(item)} title={t("vendorSystems.editProductDetail", "Edit detail produk")}>
                                      <Pencil className="h-3 w-3" /> {t("vendorSystems.edit", "Edit")}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setMediaAssetsTarget(item)} title={t("vendorSystems.manageMedia", "Kelola media")}>
                                      <ImageIcon className="h-3 w-3" /> {t("vendorSystems.media", "Media")}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={busyId === item.id} onClick={() => togglePublish(item)}>
                                      {item.is_published ? t("vendorSystems.hide", "Sembunyikan") : t("vendorSystems.publish", "Publish")}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-700" disabled={busyId === item.id} onClick={() => handleDelete(item)}>
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr key={`${item.id}-photos`} className="bg-slate-50/70 border-b">
                                  <td colSpan={9} className="px-4 py-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                                      <span className="text-xs font-semibold text-slate-600">{t("vendorSystems.productPhotos", "Foto Produk")} — {item.name}</span>
                                      <span className="text-xs text-muted-foreground">({item.media.length} {t("vendorSystems.photoUnit", "foto")})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {item.media.map(img => (
                                        <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/50 bg-slate-100 shrink-0">
                                          <img src={resolveImageUrl(img.file_url) ?? img.file_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                          {img.is_primary && (
                                            <div className="absolute top-1 left-1 bg-amber-400 rounded-full p-0.5">
                                              <Star className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                          )}
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                              onClick={() => void handleDeleteMedia(img.id, item.id)}
                                              disabled={!!deletingMedia[img.id]}
                                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                                              title={t("vendorSystems.deletePhoto", "Hapus foto")}
                                            >
                                              {deletingMedia[img.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => fileInputRefs.current[item.id]?.click()}
                                        disabled={isUploading}
                                        className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 shrink-0"
                                        title={t("vendorSystems.uploadNewPhoto", "Upload foto baru")}
                                      >
                                        {isUploading
                                          ? <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                                          : <><Upload className="h-4 w-4 text-slate-400" /><span className="text-[10px] text-slate-400 text-center leading-tight">{t("vendorSystems.uploadPhoto", "Upload Foto")}</span></>}
                                      </button>
                                      <input
                                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleUploadMedia(item.id, file); }}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CatalogMediaAssetsDialog
        item={mediaAssetsTarget as unknown as { id: number; name: string; media_assets?: unknown[]; documents?: any[] | null } | null}
        open={!!mediaAssetsTarget}
        onClose={() => setMediaAssetsTarget(null)}
        onSaved={(assets) => {
          setItems(prev => prev.map(i => (
            mediaAssetsTarget && i.id === mediaAssetsTarget.id
              ? { ...i, media_assets: assets as unknown as VendorMediaAsset[] }
              : i
          )));
          setMediaAssetsTarget(null);
        }}
      />

      <AddVendorProductWizard
        open={showAddWizard}
        onClose={() => setShowAddWizard(false)}
        onCreated={() => { void loadItems(); }}
      />
    </div>
  );
}
