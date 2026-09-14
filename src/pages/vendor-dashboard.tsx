import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isAuthenticated, removeAuthToken, getAuthHeaders } from "@/lib/auth";
import { resolveImageUrl } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck, FileText, CheckCircle2, Clock, AlertCircle,
  Building2, Phone, Mail, Package, LogOut, Send, Pencil, X,
  ChevronDown, ChevronUp, RefreshCw, ImagePlus, Trash2, Star,
  ShoppingBag, Wrench, ImageOff, Camera, Bell, User, Link2,
  ShieldCheck, ShieldAlert, Inbox, Upload, Ban,
  Plus, Eye, EyeOff, Archive, Video,
} from "lucide-react";

interface VendorProfile {
  portalCustomer: {
    id: number; name: string; email: string; phone: string | null; company: string | null; role: string;
  };
  supplier: {
    id: number; name: string; phone: string | null; contactEmail: string | null;
    serviceType: string | null; isActive: boolean;
  } | null;
  rfqs: {
    id: number; rfqNumber: string; orderId: number; status: string;
    orderNumber: string; origin: string; destination: string;
    shipmentType: string; commodity: string | null; createdAt: string;
  }[];
  quotes: {
    id: number; rfqId: number; orderId: number; orderNumber: string;
    rfqNumber: string; vendorPrice: number; sellingPrice: number | null;
    estimatedPickup: string | null; estimatedDelivery: string | null;
    vendorNotes: string | null; quoteStatus: string; replySource: string | null;
    createdAt: string;
  }[];
  marketplaceRfqs: MarketplaceRfq[];
  marketplaceOrders: MarketplaceOrder[];
}

interface QuoteFormState {
  vendorPrice: string;
  estimatedPickup: string;
  estimatedDelivery: string;
  estimatedDays: string;
  vendorNotes: string;
}

const emptyForm = (): QuoteFormState => ({
  vendorPrice: "", estimatedPickup: "", estimatedDelivery: "", estimatedDays: "", vendorNotes: "",
});

function fmt(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

const RFQ_STATUS: Record<string, { label: string; cls: string }> = {
  open:    { label: "Open",    cls: "bg-yellow-100 text-yellow-800" },
  closed:  { label: "Closed",  cls: "bg-gray-100 text-gray-700" },
  awarded: { label: "Awarded", cls: "bg-green-100 text-green-800" },
};

const QUOTE_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Menunggu", cls: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Dipilih",  cls: "bg-green-100 text-green-800" },
  rejected: { label: "Ditolak",  cls: "bg-red-100 text-red-800" },
};

// ── New types for added sections ───────────────────────────────────────────────
interface VendorProfileDetail {
  id: number; customerId: number; companyName: string | null; legalName: string | null;
  email: string | null; phone: string | null; nib: string | null; npwp: string | null;
  picName: string | null; picPhone: string | null; picEmail: string | null;
  serviceType: string | null; address: string | null; fullAddress: string | null;
  city: string | null; province: string | null; postalCode: string | null;
  bankName: string | null; bankAccountNumber: string | null; bankAccountName: string | null;
  bankAccountNumberMasked?: string | null;
  verificationStatus: string | null; supplierId: number | null; approvedAt: string | null; updatedAt: string | null;
}

type VendorProfileForm = {
  picName: string; phone: string; email: string; fullAddress: string;
  province: string; city: string; postalCode: string;
  bankName: string; bankAccountName: string; bankAccountNumber: string;
};

interface SubmissionLink {
  token: string; url: string; expiresAt: string | null; isActive: boolean;
}

interface CatalogSubmission {
  id: number; submissionLinkId: number; vendorName: string | null;
  productName: string | null; description: string | null; priceEstimate: number | null;
  status: string; reviewNotes: string | null; createdAt: string; reviewedAt: string | null;
}

interface VendorNotif {
  id: number; vendorId: number; type: string; title: string; message: string;
  payload: Record<string, unknown>; isRead: boolean; createdAt: string; readAt: string | null;
}

interface MarketplaceRfq {
  id: number;
  rfqNumber: string;
  rfqStatus: string;
  quoteId: number;
  quoteStatus: string;
  quoteUrl: string;
  validUntil: string | null;
  submittedAt: string | null;
  buyerName: string;
  buyerCompany: string | null;
  requiredDeliveryDate: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  lineCount: number;
  createdAt: string;
}

interface MarketplaceOrder {
  id: number;
  poNumber: string;
  status: string;
  grandTotal: number;
  currency: string;
  poUrl: string;
  createdAt: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface CatalogImage {
  id: number;
  fileUrl: string;
  isPrimary: boolean;
  mediaType: string;
  imageSource: string;
}

/** Canonical media asset entry stored in vendor_catalog_items.media_assets JSONB */
interface MediaAssetEntry {
  url: string;
  type?: string;        // "image" | "video" | "pdf" | "document" | "certificate" | "brochure"
  isPrimary?: boolean;
  sortOrder?: number;
  title?: string | null;
  objectPath?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  visibility?: string;  // "public" | "private" | "internal"
}

interface CatalogItem {
  id: number;
  name: string;
  templateKind: string | null;
  kategori: string | null;
  categoryKey: string | null;
  isActive: boolean;
  isPublished: boolean;
  status: string;
  description: string | null;
  moq: string | null;
  origin: string | null;
  hsCode: string | null;
  priceSell: string | null;
  unit: string | null;
  mediaCount: number;
  images: CatalogImage[];       // legacy (now always [])
  mediaAssets: MediaAssetEntry[]; // canonical source
}

interface VendorCatalog {
  supplierId: number;
  supplierName: string;
  items: CatalogItem[];
}

// ── Vendor Etalase Section (photo overview — quick upload for dashboard tab) ──
function VendorEtalaseSection() {
  const qc = useQueryClient();
  const { t } = useLanguage();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const { data, isLoading, error } = useQuery<VendorCatalog>({
    queryKey: ["vendor-catalog"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/catalog", { credentials: "include" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { message?: string };
        throw new Error(j.message ?? "Gagal memuat katalog");
      }
      return r.json() as Promise<VendorCatalog>;
    },
    staleTime: 30_000,
  });

  async function handleUpload(item: CatalogItem, file: File) {
    const itemId = item.id;
    setUploadError((p) => { const n = { ...p }; delete n[itemId]; return n; });
    setUploading((p) => ({ ...p, [itemId]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`/api/portal/vendor/catalog/${itemId}/media-assets/upload`, {
        method: "POST",
        headers: {},
        body: fd,
      });
      const j = await r.json() as { message?: string; url?: string; objectPath?: string; mimeType?: string; sizeBytes?: number };
      if (!r.ok) throw new Error(j.message ?? "Upload gagal");
      const existing: MediaAssetEntry[] = item.mediaAssets ?? [];
      const hasImgPrimary = existing.some(a => { const t = (a.type ?? "image").toLowerCase(); return (t === "image" || !t) && a.isPrimary; });
      const newAsset: MediaAssetEntry = {
        url: j.url!, type: "image", isPrimary: !hasImgPrimary,
        sortOrder: existing.length, objectPath: j.objectPath,
        mimeType: j.mimeType, sizeBytes: j.sizeBytes, visibility: "public",
      };
      const pr = await fetch(`/api/portal/vendor/catalog/${itemId}/media-assets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaAssets: [...existing, newAsset] }),
      });
      if (!pr.ok) {
        const pj = await pr.json().catch(() => ({})) as { message?: string };
        throw new Error(pj.message ?? "Gagal menyimpan media");
      }
      void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
    } catch (e: unknown) {
      setUploadError((p) => ({ ...p, [itemId]: e instanceof Error ? e.message : "Upload gagal" }));
    } finally {
      setUploading((p) => ({ ...p, [itemId]: false }));
      if (fileInputRefs.current[itemId]) fileInputRefs.current[itemId]!.value = "";
    }
  }

  async function handleDelete(item: CatalogItem, url: string) {
    setDeleting((p) => ({ ...p, [url]: true }));
    try {
      const rest = (item.mediaAssets ?? []).filter(a => a.url !== url);
      if (rest.length > 0 && !rest.some(a => a.isPrimary)) {
        const fi = rest.findIndex(a => { const t = (a.type ?? "image").toLowerCase(); return t === "image" || !t; });
        if (fi >= 0) rest[fi] = { ...rest[fi], isPrimary: true };
      }
      const r = await fetch(`/api/portal/vendor/catalog/${item.id}/media-assets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaAssets: rest }),
      });
      if (r.ok) void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
    } catch { /* silent */ } finally {
      setDeleting((p) => ({ ...p, [url]: false }));
    }
  }

  if (isLoading) return (
    <Card className="border-none shadow-sm">
      <CardContent className="py-10 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
      </CardContent>
    </Card>
  );

  if (error || !data) return null;

  const { items } = data;
  if (items.length === 0) return (
    <Card className="border-none shadow-sm">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4" /> {t("vendorDashboard.etalaseSectionTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-10 text-center">
        <ImageOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{t("vendorDashboard.noItems")}</p>
      </CardContent>
    </Card>
  );

  // null templateKind → treat as "product" (fix: items not silently dropped)
  const products = items.filter(i => i.templateKind !== "service" && i.status !== "archived");
  const services = items.filter(i => i.templateKind === "service" && i.status !== "archived");
  const getImages = (item: CatalogItem) =>
    (item.mediaAssets ?? []).filter(a => { const t = (a.type ?? "image").toLowerCase(); return t === "image" || !t; });

  function renderItems(list: CatalogItem[]) {
    return list.map(item => {
      const isExpanded = expanded[item.id] ?? true;
      const isUploading = !!uploading[item.id];
      const imageAssets = getImages(item);
      const err = uploadError[item.id];
      return (
        <div key={item.id} className="border border-border/50 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            onClick={() => setExpanded(p => ({ ...p, [item.id]: !(p[item.id] ?? true) }))}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.templateKind === "service"
                ? <Wrench className="h-4 w-4 text-sky-500 shrink-0" />
                : <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />}
              <span className="font-semibold text-sm text-slate-800 truncate">{item.name}</span>
              {!item.isPublished && <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">{t("vendorDashboard.statusDraft")}</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{imageAssets.length} {t("vendorDashboard.mediaPhotoLabel")}</span>
              {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </button>
          {isExpanded && (
            <div className="p-4 space-y-3">
              {imageAssets.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {imageAssets.map(asset => (
                    <div key={asset.url} className="relative group aspect-square rounded-xl overflow-hidden border border-border/50 bg-slate-100">
                      <img src={resolveImageUrl(asset.url) ?? asset.url} alt="" className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      {asset.isPrimary && (
                        <div className="absolute top-1 left-1 bg-amber-400 rounded-full p-0.5">
                          <Star className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={() => void handleDelete(item, asset.url)} disabled={!!deleting[asset.url]}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors">
                          {deleting[asset.url] ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => fileInputRefs.current[item.id]?.click()} disabled={isUploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50">
                    {isUploading ? <RefreshCw className="h-5 w-5 text-sky-500 animate-spin" /> : <ImagePlus className="h-5 w-5 text-slate-400" />}
                    <span className="text-[10px] text-slate-400">{isUploading ? t("vendorDashboard.uploadingShort") : t("vendorDashboard.addPhotoBtn")}</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRefs.current[item.id]?.click()} disabled={isUploading}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors disabled:opacity-50">
                  {isUploading ? <RefreshCw className="h-7 w-7 text-sky-400 animate-spin" /> : <ImagePlus className="h-7 w-7 text-slate-300" />}
                  <span className="text-sm font-medium text-slate-500">{isUploading ? t("vendorDashboard.uploadingPhoto") : t("vendorDashboard.uploadFirstPhoto")}</span>
                  <span className="text-xs text-slate-400">{t("vendorDashboard.maxFileHint")}</span>
                </button>
              )}
              {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              {imageAssets.length > 0 && <p className="text-[11px] text-slate-400">{t("vendorDashboard.primaryPhotoHint")}</p>}
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                ref={el => { fileInputRefs.current[item.id] = el; }}
                onChange={e => { const file = e.target.files?.[0]; if (file) void handleUpload(item, file); }} />
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-base"><Camera className="h-4 w-4" /> {t("vendorDashboard.etalaseSectionTitle")}</CardTitle>
        <CardDescription>{t("vendorDashboard.uploadPhotoHint")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-6">
        {products.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-emerald-500" /> {t("vendorDashboard.typeProduct")} ({products.length})
            </p>
            <div className="space-y-2">{renderItems(products)}</div>
          </div>
        )}
        {services.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-sky-500" /> {t("vendorDashboard.typeService")} ({services.length})
            </p>
            <div className="space-y-2">{renderItems(services)}</div>
          </div>
        )}
        {products.length === 0 && services.length === 0 && (
          <div className="py-8 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("vendorDashboard.allItemsArchived")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Vendor Catalog Management Section ─────────────────────────────────────────
interface CatalogItemForm {
  name: string; templateKind: string; description: string; kategori: string;
  priceSell: string; unit: string; moq: string; origin: string; hsCode: string;
}
const emptyCatalogForm = (): CatalogItemForm => ({
  name: "", templateKind: "product", description: "", kategori: "",
  priceSell: "", unit: "", moq: "", origin: "", hsCode: "",
});

function CatalogFormFields({ form, setForm, onSave, onCancel, saving, formError, isAdd }: {
  form: CatalogItemForm;
  setForm: (f: CatalogItemForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  formError: string | null;
  isAdd?: boolean;
}) {
  const { t } = useLanguage();
  const f = (field: keyof CatalogItemForm, val: string) => setForm({ ...form, [field]: val });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border-t border-border/40">
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldNameLabel")} <span className="text-red-500">*</span></label>
        <Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="Cth: Bawang Merah Premium" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldTypeLabel")}</label>
        <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={form.templateKind} onChange={e => f("templateKind", e.target.value)}>
          <option value="product">{t("vendorDashboard.typeProduct")}</option>
          <option value="service">{t("vendorDashboard.typeService")}</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldCategoryLabel")}</label>
        <Input value={form.kategori} onChange={e => f("kategori", e.target.value)} placeholder="Cth: Sayuran, Sembako" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldDescLabel")}</label>
        <Textarea value={form.description} onChange={e => f("description", e.target.value)} placeholder="Deskripsi produk/layanan..." rows={2} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldPriceLabel")}</label>
        <Input value={form.priceSell} onChange={e => f("priceSell", e.target.value)} placeholder="Cth: 50000" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldUnitLabel")}</label>
        <Input value={form.unit} onChange={e => f("unit", e.target.value)} placeholder="Cth: kg, karton, unit" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldMoqLabel")}</label>
        <Input value={form.moq} onChange={e => f("moq", e.target.value)} placeholder="Cth: 100" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldOriginLabel")}</label>
        <Input value={form.origin} onChange={e => f("origin", e.target.value)} placeholder="Cth: Brebes, Jawa Tengah" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("vendorDashboard.fieldHsCodeLabel")}</label>
        <Input value={form.hsCode} onChange={e => f("hsCode", e.target.value)} placeholder="Cth: 0703.10.10" />
      </div>
      {formError && (
        <div className="sm:col-span-2 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {formError}
        </div>
      )}
      <div className="sm:col-span-2 flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving} className="gap-1.5">
          {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> {t("vendorDashboard.savingText")}</> : isAdd ? t("vendorDashboard.addProduct") : t("vendorDashboard.saveChangesBtn")}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>{t("vendorDashboard.cancelBtn")}</Button>
      </div>
    </div>
  );
}

function VendorCatalogManagementSection() {
  const qc = useQueryClient();
  const { t } = useLanguage();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data, isLoading } = useQuery<VendorCatalog>({
    queryKey: ["vendor-catalog"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/catalog", { credentials: "include" });
      if (!r.ok) throw new Error("Gagal memuat katalog");
      return r.json() as Promise<VendorCatalog>;
    },
    staleTime: 30_000,
  });

  // Add
  const [addMode, setAddMode] = useState(false);
  const [addForm, setAddForm] = useState<CatalogItemForm>(emptyCatalogForm());
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  // Edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editForms, setEditForms] = useState<Record<number, CatalogItemForm>>({});
  const [editSaving, setEditSaving] = useState<Record<number, boolean>>({});
  const [editError, setEditError] = useState<Record<number, string | null>>({});
  // Media
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<Record<number, string | null>>({});
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  // Actions
  const [actionId, setActionId] = useState<number | null>(null);

  async function patchMedia(itemId: number, assets: MediaAssetEntry[]) {
    const r = await fetch(`/api/portal/vendor/catalog/${itemId}/media-assets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaAssets: assets }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({})) as { message?: string };
      throw new Error(j.message ?? t("vendorDashboard.mediaSaveError"));
    }
    void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
  }

  async function handleAddItem() {
    if (!addForm.name.trim()) { setAddError(t("vendorDashboard.formNameRequired")); return; }
    setAddSaving(true); setAddError(null);
    try {
      const r = await fetch("/api/portal/vendor/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name.trim(), templateKind: addForm.templateKind || "product",
          description: addForm.description || null, kategori: addForm.kategori || null,
          priceSell: addForm.priceSell || null, unit: addForm.unit || null,
          moq: addForm.moq || null, origin: addForm.origin || null, hsCode: addForm.hsCode || null,
        }),
      });
      const j = await r.json() as { error?: string };
      if (!r.ok) throw new Error(j.error ?? t("vendorDashboard.formAddError"));
      void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
      setAddMode(false); setAddForm(emptyCatalogForm());
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : t("vendorDashboard.formAddError"));
    } finally { setAddSaving(false); }
  }

  async function handleEditItem(id: number) {
    const form = editForms[id];
    if (!form?.name.trim()) { setEditError(p => ({ ...p, [id]: t("vendorDashboard.formEditNameRequired") })); return; }
    setEditSaving(p => ({ ...p, [id]: true })); setEditError(p => ({ ...p, [id]: null }));
    try {
      const r = await fetch(`/api/portal/vendor/catalog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(), templateKind: form.templateKind || null,
          description: form.description || null, kategori: form.kategori || null,
          priceSell: form.priceSell || null, unit: form.unit || null,
          moq: form.moq || null, origin: form.origin || null, hsCode: form.hsCode || null,
        }),
      });
      const j = await r.json() as { error?: string };
      if (!r.ok) throw new Error(j.error ?? t("vendorDashboard.formSaveError"));
      void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
      setEditId(null);
    } catch (e: unknown) {
      setEditError(p => ({ ...p, [id]: e instanceof Error ? e.message : t("vendorDashboard.formSaveError") }));
    } finally { setEditSaving(p => ({ ...p, [id]: false })); }
  }

  async function handleUploadMedia(item: CatalogItem, file: File) {
    setUploadingId(item.id); setUploadError(p => ({ ...p, [item.id]: null }));
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`/api/portal/vendor/catalog/${item.id}/media-assets/upload`, {
        method: "POST", headers: {}, body: fd,
      });
      const j = await r.json() as { message?: string; url?: string; objectPath?: string; mimeType?: string; sizeBytes?: number };
      if (!r.ok) throw new Error(j.message ?? "Upload gagal");
      const mime = j.mimeType ?? file.type;
      const type = mime.startsWith("video/") ? "video" : mime === "application/pdf" ? "pdf" : "image";
      const existing = item.mediaAssets ?? [];
      const hasImgPrimary = existing.some(a => { const t = (a.type ?? "image").toLowerCase(); return (t === "image" || !t) && a.isPrimary; });
      await patchMedia(item.id, [...existing, {
        url: j.url!, type, isPrimary: type === "image" && !hasImgPrimary,
        sortOrder: existing.length, objectPath: j.objectPath, mimeType: mime, sizeBytes: j.sizeBytes, visibility: "public",
      }]);
    } catch (e: unknown) {
      setUploadError(p => ({ ...p, [item.id]: e instanceof Error ? e.message : "Upload gagal" }));
    } finally {
      setUploadingId(null);
      const key = `img-${item.id}`;
      if (fileInputRefs.current[key]) fileInputRefs.current[key]!.value = "";
    }
  }

  async function handleDeleteMedia(item: CatalogItem, url: string) {
    setDeletingUrl(url);
    try {
      const rest = (item.mediaAssets ?? []).filter(a => a.url !== url);
      if (rest.length > 0 && !rest.some(a => a.isPrimary)) {
        const fi = rest.findIndex(a => { const t = (a.type ?? "image").toLowerCase(); return t === "image" || !t; });
        if (fi >= 0) rest[fi] = { ...rest[fi], isPrimary: true };
      }
      await patchMedia(item.id, rest);
    } catch { /* silent */ } finally { setDeletingUrl(null); }
  }

  async function handleSetPrimary(item: CatalogItem, url: string) {
    await patchMedia(item.id, (item.mediaAssets ?? []).map(a => ({ ...a, isPrimary: a.url === url })));
  }

  async function handleAction(id: number, action: "publish" | "unpublish" | "archive") {
    setActionId(id);
    try {
      const r = await fetch(`/api/portal/vendor/catalog/${id}/${action}`, { method: "POST", credentials: "include" });
      if (r.ok) void qc.invalidateQueries({ queryKey: ["vendor-catalog"] });
    } catch { /* silent */ } finally { setActionId(null); }
  }

  const getImages  = (item: CatalogItem) => (item.mediaAssets ?? []).filter(a => { const t = (a.type ?? "image").toLowerCase(); return t === "image" || !t; });
  const getVideos  = (item: CatalogItem) => (item.mediaAssets ?? []).filter(a => (a.type ?? "").toLowerCase() === "video");
  const getDocs    = (item: CatalogItem) => (item.mediaAssets ?? []).filter(a => { const t = (a.type ?? "").toLowerCase(); return t === "pdf" || t === "document" || t === "certificate" || t === "brochure"; });

  const items = data?.items ?? [];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" /> {t("vendorDashboard.manageCatalogTitle")}</CardTitle>
            <CardDescription>{t("vendorDashboard.catalogDesc")}</CardDescription>
          </div>
          {!addMode && (
            <Button size="sm" className="gap-1.5" onClick={() => { setAddMode(true); setAddForm(emptyCatalogForm()); setAddError(null); }}>
              <Plus className="h-3.5 w-3.5" /> {t("vendorDashboard.addProduct")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-3">
        {/* Add form */}
        {addMode && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider px-1">{t("vendorDashboard.newProductLabel")}</p>
            <CatalogFormFields form={addForm} setForm={setAddForm}
              onSave={() => void handleAddItem()} onCancel={() => { setAddMode(false); setAddError(null); }}
              saving={addSaving} formError={addError} isAdd />
          </div>
        )}

        {isLoading && <div className="py-10 text-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" /></div>}

        {!isLoading && items.length === 0 && !addMode && (
          <div className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("vendorDashboard.noProductCTA")}</p>
          </div>
        )}

        {items.map(item => {
          const isExpanded = expandedId === item.id;
          const isEditing  = editId === item.id;
          const isActing   = actionId === item.id;
          const isUploading = uploadingId === item.id;
          const imgAssets  = getImages(item);
          const vidAssets  = getVideos(item);
          const docAssets  = getDocs(item);
          const upErr      = uploadError[item.id];
          const archived   = item.status === "archived";

          const statusMap: Record<string, { label: string; cls: string }> = {
            published: { label: t("vendorDashboard.statusPublished"), cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
            pending_review: { label: "Menunggu persetujuan admin", cls: "bg-blue-100 text-blue-800 border-blue-200" },
            rejected:  { label: "Ditolak — dapat diperbaiki", cls: "bg-red-100 text-red-800 border-red-200" },
            draft:     { label: t("vendorDashboard.statusDraft"),      cls: "bg-amber-100 text-amber-800 border-amber-200" },
            archived:  { label: t("vendorDashboard.statusArchived"),   cls: "bg-gray-100 text-gray-600 border-gray-200" },
          };
          const st = statusMap[item.status ?? (item.isPublished ? "published" : "draft")] ?? statusMap.draft;

          return (
            <div key={item.id} className={`border rounded-xl overflow-hidden ${archived ? "opacity-60" : ""}`}>
              {/* Row header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {item.templateKind === "service"
                    ? <Wrench className="h-4 w-4 text-sky-500 shrink-0" />
                    : <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />}
                  <span className="font-semibold text-sm truncate">{item.name}</span>
                  <span className={`text-[10px] font-semibold border px-1.5 py-0.5 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>
                  {item.kategori && <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{item.kategori}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!archived && item.status === "published" && (
                    item.isPublished ? (
                      <Button size="sm" variant="outline" disabled={isActing}
                        className="h-7 text-xs gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => void handleAction(item.id, "unpublish")}>
                        <EyeOff className="h-3 w-3" /> <span className="hidden sm:inline">{t("vendorDashboard.unpublishBtn")}</span>
                      </Button>
                    ) : null
                  )}
                  {!archived && (
                    <Button size="sm" variant="outline" disabled={isActing}
                      className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm(t("vendorDashboard.archiveConfirm").replace('"{name}"', `"${item.name}"`)))
                          void handleAction(item.id, "archive");
                      }}>
                      <Archive className="h-3 w-3" />
                    </Button>
                  )}
                  {!archived && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => {
                        if (isEditing) { setEditId(null); return; }
                        setEditId(item.id);
                        setEditForms(p => ({ ...p, [item.id]: {
                          name: item.name, templateKind: item.templateKind ?? "product",
                          description: item.description ?? "", kategori: item.kategori ?? "",
                          priceSell: item.priceSell ?? "", unit: item.unit ?? "",
                          moq: item.moq ?? "", origin: item.origin ?? "", hsCode: item.hsCode ?? "",
                        }}));
                      }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <Camera className="h-3 w-3" />
                    <span className="hidden sm:inline text-xs">{imgAssets.length + vidAssets.length + docAssets.length}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Edit form */}
              {isEditing && editForms[item.id] && (
                <CatalogFormFields
                  form={editForms[item.id]} setForm={f => setEditForms(p => ({ ...p, [item.id]: f }))}
                  onSave={() => void handleEditItem(item.id)}
                  onCancel={() => { setEditId(null); setEditError(p => ({ ...p, [item.id]: null })); }}
                  saving={!!editSaving[item.id]} formError={editError[item.id] ?? null}
                />
              )}

              {/* Media panel */}
              {isExpanded && (
                <div className="p-4 border-t border-border/40 space-y-4">
                  {/* Images */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ImagePlus className="h-3 w-3" /> {t("vendorDashboard.mediaPhotoLabel")} ({imgAssets.length})
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {imgAssets.map(asset => (
                        <div key={asset.url} className="relative group aspect-square rounded-xl overflow-hidden border bg-slate-100">
                          <img src={resolveImageUrl(asset.url) ?? asset.url} alt="" className="w-full h-full object-cover"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          {asset.isPrimary && (
                            <div className="absolute top-1 left-1 bg-amber-400 rounded-full p-0.5">
                              <Star className="h-2.5 w-2.5 text-white fill-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100">
                              {!asset.isPrimary && (
                                <button title={t("vendorDashboard.setPrimaryTitle")} onClick={() => void handleSetPrimary(item, asset.url)}
                                  className="bg-amber-400 hover:bg-amber-500 text-white rounded-full p-1">
                                  <Star className="h-2.5 w-2.5" />
                                </button>
                              )}
                              <button title={t("vendorDashboard.deleteTitle")} disabled={deletingUrl === asset.url}
                                onClick={() => void handleDeleteMedia(item, asset.url)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                                {deletingUrl === asset.url ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <Trash2 className="h-2.5 w-2.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!archived && (
                        <label htmlFor={`up-img-${item.id}`}
                          className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer">
                          {isUploading ? <RefreshCw className="h-5 w-5 text-sky-500 animate-spin" /> : <ImagePlus className="h-5 w-5 text-slate-400" />}
                          <span className="text-[10px] text-slate-400">{isUploading ? t("vendorDashboard.uploadingShort") : t("vendorDashboard.mediaPhotoLabel")}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Videos */}
                  {vidAssets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Video className="h-3 w-3" /> Video ({vidAssets.length})
                      </p>
                      {vidAssets.map(asset => (
                        <div key={asset.url} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 text-sm mb-1.5">
                          <Video className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="flex-1 truncate text-xs">{asset.title ?? asset.url.split("/").pop()}</span>
                          <button disabled={deletingUrl === asset.url} onClick={() => void handleDeleteMedia(item, asset.url)} className="text-red-500 hover:text-red-700">
                            {deletingUrl === asset.url ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Docs */}
                  {docAssets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> {t("vendorDashboard.mediaDocumentLabel")} ({docAssets.length})
                      </p>
                      {docAssets.map(asset => (
                        <div key={asset.url} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-50 text-sm mb-1.5">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="flex-1 truncate text-xs">{asset.title ?? asset.url.split("/").pop()}</span>
                          <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><Eye className="h-3.5 w-3.5" /></a>
                          <button disabled={deletingUrl === asset.url} onClick={() => void handleDeleteMedia(item, asset.url)} className="text-red-500 hover:text-red-700">
                            {deletingUrl === asset.url ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload buttons */}
                  {!archived && (
                    <div className="flex flex-wrap gap-2">
                      <label htmlFor={`up-img-${item.id}`}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 text-xs text-slate-500 transition-colors">
                        <ImagePlus className="h-3.5 w-3.5" /> {t("vendorDashboard.mediaPhotoLabel")}
                      </label>
                      <label htmlFor={`up-vid-${item.id}`}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50 text-xs text-slate-500 transition-colors">
                        <Video className="h-3.5 w-3.5" /> {t("vendorDashboard.mediaVideoLabel")}
                      </label>
                      <label htmlFor={`up-doc-${item.id}`}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50 text-xs text-slate-500 transition-colors">
                        <FileText className="h-3.5 w-3.5" /> {t("vendorDashboard.mediaDocumentPdfLabel")}
                      </label>
                      <input id={`up-img-${item.id}`} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                        ref={el => { fileInputRefs.current[`img-${item.id}`] = el; }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) void handleUploadMedia(item, f); e.target.value = ""; }} />
                      <input id={`up-vid-${item.id}`} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) void handleUploadMedia(item, f); e.target.value = ""; }} />
                      <input id={`up-doc-${item.id}`} type="file" accept="application/pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) void handleUploadMedia(item, f); e.target.value = ""; }} />
                    </div>
                  )}

                  {upErr && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{upErr}</p>}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Featured product status class maps (labels resolved via t() inside component) ─
const FEATURED_STATUS_CLS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  approved:  "bg-blue-100 text-blue-800",
  active:    "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-800",
  expired:   "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  unpaid:               { label: "Belum Bayar",         cls: "bg-red-100 text-red-700" },
  pending_verification: { label: "Menunggu Verifikasi", cls: "bg-yellow-100 text-yellow-800" },
  verified:             { label: "Terverifikasi",        cls: "bg-green-100 text-green-800" },
  rejected:             { label: "Ditolak",              cls: "bg-red-100 text-red-700" },
  refunded:             { label: "Direfund",             cls: "bg-purple-100 text-purple-700" },
};

// ── Featured product types ─────────────────────────────────────────────────────
interface FeaturedPackage {
  id: number; code: string; name: string; description: string | null;
  durationDays: number; price: number; currency: string;
  placementType: string | null; priorityWeight: number | null;
  categoryId: number | null; isActive: boolean;
  createdAt: string; updatedAt: string;
}

interface FeaturedRequest {
  id: number; companyId: number | null; vendorId: number; catalogItemId: number;
  packageId: number; status: string; requestedStartAt: string | null;
  requestedEndAt: string | null; approvedStartAt: string | null;
  approvedEndAt: string | null; price: number | null; currency: string | null;
  paymentStatus: string; adminNotes: string | null;
  createdAt: string; updatedAt: string;
}

// ── Vendor Featured Section ───────────────────────────────────────────────────
interface VendorFeaturedSectionProps {
    packages: FeaturedPackage[];
  packagesLoading: boolean;
  requests: FeaturedRequest[];
  requestsLoading: boolean;
  catalog: VendorCatalog | null;
  catalogLoading: boolean;
  onRefreshRequests: () => void;
}

function VendorFeaturedSection({
  packages, packagesLoading, requests, requestsLoading,
  catalog, catalogLoading, onRefreshRequests,
}: VendorFeaturedSectionProps) {
  const qc = useQueryClient();
  const { t } = useLanguage();

  // Apply flow state: step 1 = pick item, step 2 = pick package + confirm
  const [applyItemId, setApplyItemId] = useState<number | null>(null);
  const [applyPackageId, setApplyPackageId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  // Per-request upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<Record<number, string>>({});
  const [paymentRef, setPaymentRef] = useState<Record<number, string>>({});
  const proofInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Per-request cancel state
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Already-requested catalog item IDs (any non-cancelled/rejected status blocks re-apply)
  const activeRequestedItemIds = new Set(
    requests
      .filter((r) => !["cancelled", "rejected", "expired"].includes(r.status))
      .map((r) => r.catalogItemId)
  );

  // Eligible items: active + published + not already featured + not in an active request
  const allItems = catalog?.items ?? [];
  const eligibleItems = allItems.filter(
    (item) => item.isActive && item.isPublished && !activeRequestedItemIds.has(item.id)
  );

  async function handleSubmit() {
    if (!applyItemId || !applyPackageId) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(false);
    try {
      const r = await fetch("/api/portal/vendor/featured-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogItemId: applyItemId,
          packageId: applyPackageId,
          requestedStartAt: new Date().toISOString(),
        }),
      });
      const j = await r.json() as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "Gagal mengajukan");
      setSubmitOk(true);
      setApplyItemId(null);
      setApplyPackageId(null);
      void qc.invalidateQueries({ queryKey: ["vendor-featured-requests"] });
      onRefreshRequests();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Gagal mengajukan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: number) {
    setCancellingId(id);
    try {
      const r = await fetch(`/api/portal/vendor/featured-requests/${id}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error ?? "Gagal membatalkan");
      }
      void qc.invalidateQueries({ queryKey: ["vendor-featured-requests"] });
      onRefreshRequests();
    } catch {
      // silent — toast not available here, error visible via list refresh
    } finally {
      setCancellingId(null);
    }
  }

  async function handleUploadProof(id: number, file: File) {
    setUploadingId(id);
    setUploadError((p) => { const n = { ...p }; delete n[id]; return n; });
    try {
      const fd = new FormData();
      fd.append("file", file);
      const ref = paymentRef[id]?.trim();
      if (ref) fd.append("paymentReference", ref);
      const r = await fetch(`/api/portal/vendor/featured-requests/${id}/payment-proof`, {
        method: "POST",
        headers: {},
        body: fd,
      });
      const j = await r.json().catch(() => ({})) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "Upload gagal");
      void qc.invalidateQueries({ queryKey: ["vendor-featured-requests"] });
      onRefreshRequests();
    } catch (e: unknown) {
      setUploadError((p) => ({ ...p, [id]: e instanceof Error ? e.message : "Upload gagal" }));
    } finally {
      setUploadingId(null);
      if (proofInputRefs.current[id]) proofInputRefs.current[id]!.value = "";
    }
  }

  const isLoading = packagesLoading || requestsLoading || catalogLoading;

  function getFeaturedStatusConfig(status: string): { label: string; cls: string } {
    const labelMap: Record<string, string> = {
      pending:   t("vendorDashboard.featuredStatusPending"),
      approved:  t("vendorDashboard.featuredStatusApproved"),
      active:    t("vendorDashboard.featuredStatusActive"),
      rejected:  t("vendorDashboard.featuredStatusRejected"),
      expired:   t("vendorDashboard.featuredStatusExpired"),
      cancelled: t("vendorDashboard.featuredStatusCancelled"),
    };
    return { label: labelMap[status] ?? status, cls: FEATURED_STATUS_CLS[status] ?? "bg-gray-100 text-gray-700" };
  }

  function getPaymentStatusConfig(status: string): { label: string; cls: string } {
    const labelMap: Record<string, string> = {
      unpaid:               t("vendorDashboard.paymentUnpaid"),
      pending_verification: t("vendorDashboard.paymentPendingVerif"),
      verified:             t("vendorDashboard.paymentVerified"),
      rejected:             t("vendorDashboard.paymentRejected"),
      refunded:             t("vendorDashboard.paymentRefunded"),
    };
    const clsMap: Record<string, string> = {
      unpaid:               "bg-red-100 text-red-700",
      pending_verification: "bg-yellow-100 text-yellow-800",
      verified:             "bg-green-100 text-green-800",
      rejected:             "bg-red-100 text-red-700",
      refunded:             "bg-purple-100 text-purple-700",
    };
    return { label: labelMap[status] ?? status, cls: clsMap[status] ?? "bg-gray-100 text-gray-700" };
  }

  return (
    <div className="container px-4 md:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-400" /> {t("vendorDashboard.featuredTitle")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("vendorDashboard.featuredSubtitle")}
        </p>
      </div>

      {/* ── Apply Flow ── */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-amber-500" /> {t("vendorDashboard.applyFeaturedTitle")}
          </CardTitle>
          <CardDescription>{t("vendorDashboard.promoDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {isLoading ? (
            <div className="py-10 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : eligibleItems.length === 0 && allItems.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("vendorDashboard.noCatalogPublished")}</p>
            </div>
          ) : eligibleItems.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("vendorDashboard.allItemsInProgress")}</p>
            </div>
          ) : (
            <>
              {/* Step 1: pick item */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("vendorDashboard.stepPickProduct")}
                </p>
                <div className="space-y-2">
                  {eligibleItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setApplyItemId(item.id === applyItemId ? null : item.id);
                        setApplyPackageId(null);
                        setSubmitError(null);
                        setSubmitOk(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                        applyItemId === item.id
                          ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                          : "border-border/60 hover:border-amber-300 hover:bg-amber-50/40"
                      }`}
                    >
                      {item.templateKind === "product"
                        ? <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <Wrench className="h-4 w-4 text-sky-500 shrink-0" />}
                      <span className="font-medium text-sm flex-1 truncate">{item.name}</span>
                      {item.kategori && (
                        <span className="text-xs text-muted-foreground shrink-0">{item.kategori}</span>
                      )}
                      {applyItemId === item.id && (
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: pick package */}
              {applyItemId !== null && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("vendorDashboard.stepPickPackage")}
                  </p>
                  {packages.filter((p) => p.isActive).length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("vendorDashboard.noPackageAvailable")}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {packages.filter((p) => p.isActive).map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setApplyPackageId(pkg.id === applyPackageId ? null : pkg.id)}
                          className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-colors ${
                            applyPackageId === pkg.id
                              ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                              : "border-border/60 hover:border-amber-300 hover:bg-amber-50/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm">{pkg.name}</p>
                            {applyPackageId === pkg.id && (
                              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-base font-bold text-amber-600">
                              {fmt(pkg.price)} <span className="text-xs font-normal text-muted-foreground">{pkg.currency}</span>
                            </span>
                            <span className="text-xs text-muted-foreground">· {pkg.durationDays} hari</span>
                          </div>
                          {pkg.placementType && (
                            <span className="text-xs text-muted-foreground capitalize">{pkg.placementType}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Submit */}
              {applyItemId !== null && applyPackageId !== null && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                    <p className="font-medium text-amber-900 mb-1">{t("vendorDashboard.confirmSubmitTitle")}</p>
                    <p className="text-amber-800">
                      <strong>{eligibleItems.find((i) => i.id === applyItemId)?.name}</strong>
                      {" "}{t("vendorDashboard.confirmSubmitWith")}{" "}
                      <strong>{packages.find((p) => p.id === applyPackageId)?.name}</strong>
                      {" "}{t("vendorDashboard.confirmSubmitStart")}
                    </p>
                  </div>
                  {submitError && (
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
                    </div>
                  )}
                  {submitOk && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {t("vendorDashboard.submitOkText")}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button className="gap-2" onClick={() => void handleSubmit()} disabled={submitting}>
                      {submitting
                        ? <><RefreshCw className="h-4 w-4 animate-spin" /> {t("vendorDashboard.sendingText")}</>
                        : <><Star className="h-4 w-4" /> {t("vendorDashboard.applyFeaturedBtn")}</>}
                    </Button>
                    <Button variant="outline" onClick={() => { setApplyItemId(null); setApplyPackageId(null); setSubmitError(null); }} disabled={submitting}>
                      {t("vendorDashboard.cancelBtn")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Request List ── */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> {t("vendorDashboard.featuredStatusTitle")}
              </CardTitle>
              <CardDescription>{t("vendorDashboard.promoHistory")}</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onRefreshRequests}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {t("vendorDashboard.reloadBtn")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {requestsLoading ? (
            <div className="py-10 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center">
              <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("vendorDashboard.noFeaturedSubmissions")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const st = getFeaturedStatusConfig(req.status);
                const ps = getPaymentStatusConfig(req.paymentStatus);
                const catalogItem = allItems.find((i) => i.id === req.catalogItemId);
                const pkg = packages.find((p) => p.id === req.packageId);
                const canUploadProof = req.paymentStatus === "unpaid" || req.status === "approved";
                const canCancel = req.status === "pending";
                const isUploading = uploadingId === req.id;
                const isCancelling = cancellingId === req.id;
                const upErr = uploadError[req.id];

                return (
                  <div key={req.id} className="border border-border/60 rounded-xl p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-semibold text-sm truncate">
                          {catalogItem?.name ?? `Item #${req.catalogItemId}`}
                        </p>
                        {pkg && (
                          <p className="text-xs text-muted-foreground">
                            {t("vendorDashboard.packageLabel")} {pkg.name} · {pkg.durationDays} {t("vendorDashboard.durationDaysUnit")}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t("vendorDashboard.submittedDateLabel")} {new Date(req.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={st.cls} variant="secondary">{st.label}</Badge>
                        <Badge className={ps.cls} variant="secondary">{ps.label}</Badge>
                      </div>
                    </div>

                    {/* Price + period */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {req.price != null && (
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("vendorDashboard.priceHeaderLabel")}</span>
                          <span className="font-semibold">{fmt(req.price)} <span className="text-xs font-normal text-muted-foreground">{req.currency ?? ""}</span></span>
                        </div>
                      )}
                      {req.requestedStartAt && (
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("vendorDashboard.periodSubmitted")}</span>
                          <span className="text-sm">
                            {new Date(req.requestedStartAt).toLocaleDateString("id-ID")}
                            {req.requestedEndAt ? ` – ${new Date(req.requestedEndAt).toLocaleDateString("id-ID")}` : ""}
                          </span>
                        </div>
                      )}
                      {req.approvedStartAt && (
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("vendorDashboard.periodApproved")}</span>
                          <span className="text-sm">
                            {new Date(req.approvedStartAt).toLocaleDateString("id-ID")}
                            {req.approvedEndAt ? ` – ${new Date(req.approvedEndAt).toLocaleDateString("id-ID")}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin notes */}
                    {req.adminNotes && (
                      <p className="text-xs text-muted-foreground bg-gray-50 rounded-lg px-3 py-2 italic">
                        {t("vendorDashboard.adminNoteLabel")} {req.adminNotes}
                      </p>
                    )}

                    {/* Upload payment proof */}
                    {canUploadProof && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("vendorDashboard.uploadProofTitle")}</p>
                        <Input
                          placeholder={t("vendorDashboard.paymentRefPlaceholder")}
                          value={paymentRef[req.id] ?? ""}
                          onChange={(e) => setPaymentRef((p) => ({ ...p, [req.id]: e.target.value }))}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={isUploading}
                            onClick={() => proofInputRefs.current[req.id]?.click()}
                          >
                            {isUploading
                              ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> {t("vendorDashboard.uploadingProgress")}</>
                              : <><Upload className="h-3.5 w-3.5" /> {t("vendorDashboard.chooseFileUpload")}</>}
                          </Button>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            className="hidden"
                            ref={(el) => { proofInputRefs.current[req.id] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUploadProof(req.id, file);
                            }}
                          />
                        </div>
                        {upErr && (
                          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{upErr}</p>
                        )}
                      </div>
                    )}

                    {/* Cancel button */}
                    {canCancel && (
                      <div className="pt-2 border-t border-border/40">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={isCancelling}
                          onClick={() => void handleCancel(req.id)}
                        >
                          {isCancelling
                            ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> {t("vendorDashboard.cancellingText")}</>
                            : <><Ban className="h-3.5 w-3.5" /> {t("vendorDashboard.cancelFeaturedBtn")}</>}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab type ───────────────────────────────────────────────────────────────────
type DashTab = "dashboard" | "profile" | "catalog" | "notifications" | "featured";

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const rfqStatusLabel = (status: string) => ({
    open: t("vendorDashboard.rfqStatusOpen"),
    closed: t("vendorDashboard.rfqStatusClosed"),
    awarded: t("vendorDashboard.rfqStatusAwarded"),
  }[status] ?? status);
  const quoteStatusLabel = (status: string) => ({
    pending: t("vendorDashboard.quoteStatusPending"),
    approved: t("vendorDashboard.quoteStatusApproved"),
    rejected: t("vendorDashboard.quoteStatusRejected"),
  }[status] ?? status);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DashTab>("dashboard");
  const [editingVendorProfile, setEditingVendorProfile] = useState(false);
  const [savingVendorProfile, setSavingVendorProfile] = useState(false);
  const [vendorProfileFormError, setVendorProfileFormError] = useState("");
  const [vendorProfileForm, setVendorProfileForm] = useState<VendorProfileForm>({
    picName: "", phone: "", email: "", fullAddress: "", province: "", city: "",
    postalCode: "", bankName: "", bankAccountName: "", bankAccountNumber: "",
  });

  // Per-RFQ form state: rfqId → form values
  const [openForms, setOpenForms] = useState<Record<number, QuoteFormState>>({});
  // Per-RFQ submission state
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [submitMsg, setSubmitMsg] = useState<Record<number, { ok: boolean; msg: string }>>({});
  // Expand/collapse RFQ cards
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const authed = isAuthenticated();

  const { data: vendorStats } = useQuery<{
    rfqReceived: number; rfqSubmitted: number; fulfillmentPending: number; completedOrders: number;
  }>({
    queryKey: ["portal-vendor-stats"],
    queryFn: async () => {
      const r = await fetch("/api/portal/me/dashboard-stats", { credentials: "include" });
      if (!r.ok) throw new Error("stats");
      return r.json();
    },
    enabled: authed,
    staleTime: 60_000,
  });

  // ── New data queries ─────────────────────────────────────────────────────────
  const { data: vendorProfileDetail, refetch: refetchVendorProfile } = useQuery<{
    vendorProfile: VendorProfileDetail | null; submissionLink: SubmissionLink | null;
  }>({
    queryKey: ["vendor-profile-detail"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/vendor-profile", { credentials: "include" });
      if (!r.ok) return { vendorProfile: null, submissionLink: null };
      return r.json();
    },
    enabled: authed,
    staleTime: 60_000,
  });

  useEffect(() => {
    const vp = vendorProfileDetail?.vendorProfile;
    if (!vp || editingVendorProfile) return;
    setVendorProfileForm({
      picName: vp.picName ?? "",
      phone: vp.picPhone ?? vp.phone ?? "",
      email: vp.picEmail ?? vp.email ?? "",
      fullAddress: vp.fullAddress ?? vp.address ?? "",
      province: vp.province ?? "",
      city: vp.city ?? "",
      postalCode: vp.postalCode ?? "",
      bankName: vp.bankName ?? "",
      bankAccountName: vp.bankAccountName ?? "",
      bankAccountNumber: "",
    });
  }, [vendorProfileDetail, editingVendorProfile]);

  async function saveVendorProfile() {
    setSavingVendorProfile(true);
    setVendorProfileFormError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(vendorProfileForm)
          .filter(([key, value]) => key !== "bankAccountNumber" || value.trim() !== "")
          .map(([key, value]) => [key, value.trim() === "" ? null : value.trim()])
      ) as Record<string, string | null>;
      const currentUpdatedAt = vendorProfileDetail?.vendorProfile?.updatedAt;
      if (currentUpdatedAt) payload.expectedUpdatedAt = new Date(currentUpdatedAt).toISOString();

      const response = await fetch("/api/portal/vendor/profile", {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) throw new Error(body.error ?? body.message ?? "Gagal menyimpan profil");
      setEditingVendorProfile(false);
      await refetchVendorProfile();
    } catch (error) {
      setVendorProfileFormError(error instanceof Error ? error.message : "Gagal menyimpan profil");
    } finally {
      setSavingVendorProfile(false);
    }
  }

  const { data: catalogSubmissionsData } = useQuery<{ submissions: CatalogSubmission[] }>({
    queryKey: ["vendor-catalog-submissions"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/catalog-submissions", { credentials: "include" });
      if (!r.ok) return { submissions: [] };
      return r.json();
    },
    enabled: authed && activeTab === "catalog",
    staleTime: 30_000,
  });

  const { data: notifData, refetch: refetchNotifs } = useQuery<{
    notifications: VendorNotif[]; unreadCount: number;
  }>({
    queryKey: ["vendor-notifications"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/notifications", { credentials: "include" });
      if (!r.ok) return { notifications: [], unreadCount: 0 };
      return r.json();
    },
    enabled: authed,
    staleTime: 30_000,
  });

  const { data: featuredPackages, isLoading: featuredPackagesLoading } = useQuery<FeaturedPackage[]>({
    queryKey: ["vendor-featured-packages"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/featured-packages", { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<FeaturedPackage[]>;
    },
    enabled: authed && activeTab === "featured",
    staleTime: 60_000,
  });

  const { data: featuredRequests, refetch: refetchFeaturedRequests, isLoading: featuredRequestsLoading } = useQuery<FeaturedRequest[]>({
    queryKey: ["vendor-featured-requests"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/featured-requests", { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<FeaturedRequest[]>;
    },
    enabled: authed && activeTab === "featured",
    staleTime: 30_000,
  });

  const { data: featuredCatalog, isLoading: featuredCatalogLoading } = useQuery<VendorCatalog>({
    queryKey: ["vendor-catalog"],
    queryFn: async () => {
      const r = await fetch("/api/portal/vendor/catalog", { credentials: "include" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { message?: string };
        throw new Error(j.message ?? "Gagal memuat katalog");
      }
      return r.json() as Promise<VendorCatalog>;
    },
    enabled: authed && activeTab === "featured",
    staleTime: 30_000,
  });

  async function markAllRead() {
    await fetch("/api/portal/vendor/notifications/read-all", { method: "POST", credentials: "include" }).catch(() => {});
    void refetchNotifs();
  }

  async function markOneRead(id: number) {
    await fetch(`/api/portal/vendor/notifications/${id}/read`, { method: "POST", credentials: "include" }).catch(() => {});
    void refetchNotifs();
  }

  const loadProfile = useCallback(() => {
    if (!authed) { setLocation("/login"); return; }
    setLoading(true);
    fetch("/api/portal/vendor/profile", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) { removeAuthToken(); setLocation("/login"); return; }
        if (r.status === 403) {
          // Do NOT redirect to /dashboard — that page redirects vendors back here → infinite loop.
          // Show an error state instead. This happens when user_profiles.status !== 'active'
          // (i.e. admin has not yet approved the vendor account).
          const j = await r.json().catch(() => ({})) as { message?: string; profileStatus?: string };
          throw new Error(j.message ?? "Akun vendor belum aktif. Menunggu persetujuan admin.");
        }
        if (!r.ok) throw new Error("Gagal memuat profil vendor");
        const data = await r.json() as VendorProfile;
        if (data.portalCustomer.role !== "vendor") { setLocation("/dashboard"); return; }
        setProfile(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function handleLogout() { removeAuthToken(); setLocation("/login"); }

  function toggleForm(rfqId: number, existingQuote?: VendorProfile["quotes"][number]) {
    setOpenForms((prev) => {
      if (prev[rfqId]) {
        const next = { ...prev };
        delete next[rfqId];
        return next;
      }
      return {
        ...prev,
        [rfqId]: existingQuote
          ? {
              vendorPrice: String(existingQuote.vendorPrice),
              estimatedPickup: existingQuote.estimatedPickup ?? "",
              estimatedDelivery: existingQuote.estimatedDelivery ?? "",
              estimatedDays: "",
              vendorNotes: existingQuote.vendorNotes ?? "",
            }
          : emptyForm(),
      };
    });
    setSubmitMsg((prev) => { const n = { ...prev }; delete n[rfqId]; return n; });
  }

  function updateForm(rfqId: number, field: keyof QuoteFormState, val: string) {
    setOpenForms((prev) => ({ ...prev, [rfqId]: { ...prev[rfqId], [field]: val } }));
  }

  async function submitQuote(rfqId: number) {
    const form = openForms[rfqId];
    if (!form) return;
    const price = Number(form.vendorPrice.replace(/\./g, "").replace(",", "."));
    if (!price || price <= 0) {
      setSubmitMsg((p) => ({ ...p, [rfqId]: { ok: false, msg: t("vendorDashboard.quoteFormPriceRequired") } }));
      return;
    }
    setSubmitting((p) => ({ ...p, [rfqId]: true }));
    setSubmitMsg((p) => { const n = { ...p }; delete n[rfqId]; return n; });
    try {
      const r = await fetch("/api/portal/vendor/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfqId,
          vendorPrice: price,
          estimatedPickup: form.estimatedPickup || undefined,
          estimatedDelivery: form.estimatedDelivery || undefined,
          estimatedDays: form.estimatedDays ? Number(form.estimatedDays) : undefined,
          vendorNotes: form.vendorNotes || undefined,
        }),
      });
      const data = await r.json() as { success?: boolean; action?: string; message?: string };
      if (!r.ok || !data.success) throw new Error(data.message ?? t("vendorDashboard.quoteSendError"));
      setSubmitMsg((p) => ({
        ...p,
        [rfqId]: { ok: true, msg: data.action === "updated" ? t("vendorDashboard.quoteUpdatedMsg") : t("vendorDashboard.quoteSentMsg") },
      }));
      setOpenForms((prev) => { const n = { ...prev }; delete n[rfqId]; return n; });
      loadProfile();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("vendorDashboard.quoteSendError");
      setSubmitMsg((p) => ({ ...p, [rfqId]: { ok: false, msg } }));
    } finally {
      setSubmitting((p) => ({ ...p, [rfqId]: false }));
    }
  }

  if (!authed) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("vendorDashboard.loadingDashboard")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="outline" onClick={() => setLocation("/login")}>{t("vendorDashboard.backToLogin")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const { portalCustomer, supplier, rfqs, quotes, marketplaceRfqs = [], marketplaceOrders = [] } = profile;
  const openRfqs = rfqs.filter((r) => r.status === "open");
  const submittedQuotes = quotes.length;
  const approvedQuotes = quotes.filter((q) => q.quoteStatus === "approved").length;
  const quotedRfqIds = new Set(quotes.map((q) => q.rfqId));
  const pendingRfqs = openRfqs.filter((r) => !quotedRfqIds.has(r.id));
  const marketplacePendingRfqs = marketplaceRfqs.filter((rfq) =>
    ["invited", "opened", "requote_requested"].includes(rfq.quoteStatus)
    && !["cancelled", "expired"].includes(rfq.rfqStatus),
  );
  const totalPendingRfqs = pendingRfqs.length + marketplacePendingRfqs.length;

  async function declineMarketplaceRfq(rfq: MarketplaceRfq) {
    if (!window.confirm(`Tolak undangan ${rfq.rfqNumber}?`)) return;
    const response = await fetch(`/api/portal/vendor/marketplace-quotes/${rfq.quoteId}/decline`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { message?: string };
      window.alert(body.message ?? "RFQ tidak dapat ditolak");
      return;
    }
    await loadProfile();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border/60 sticky top-0 z-10">
        <div className="container px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{portalCustomer.name}</p>
              <p className="text-xs text-muted-foreground">{t("vendorDashboard.vendorPortalLabel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadProfile} className="gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> {t("vendorDashboard.logoutBtn")}
            </Button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="container px-4 md:px-6 border-t border-border/40">
          <div className="flex gap-0 overflow-x-auto">
            {(
              [
                { id: "dashboard",     label: t("vendorDashboard.tabDashboard"),   Icon: Truck },
                { id: "profile",       label: t("vendorDashboard.tabProfile"),      Icon: User },
                { id: "catalog",       label: t("vendorDashboard.tabCatalog"),     Icon: Package },
                { id: "notifications", label: t("vendorDashboard.tabNotifications"),  Icon: Bell,
                  badge: (notifData?.unreadCount ?? 0) > 0 ? notifData!.unreadCount : null },
                { id: "featured", label: t("vendorDashboard.tabFeatured"), Icon: Star },
              ] as { id: DashTab; label: string; Icon: React.FC<{ className?: string }>; badge?: number | null }[]
            ).map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {badge ? (
                  <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dashboard tab ─────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
      <div className="container px-4 md:px-6 py-8 space-y-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              {t("vendorDashboard.welcomeMsg").replace("{name}", portalCustomer.name.split(" ")[0])}
            </h1>
            <p className="text-muted-foreground mt-1">{t("vendorDashboard.dashboardSubtitle")}</p>
          </div>
          {totalPendingRfqs > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <p className="text-sm font-medium text-yellow-800">
                {t("vendorDashboard.pendingRfqAlert").replace("{count}", String(totalPendingRfqs))}
              </p>
            </div>
          )}
        </div>

        {/* ── Enterprise Stat Cards ── */}
        {(() => {
          const s = vendorStats;
          // fallback to local data derived from profile
          const rfqReceived  = s?.rfqReceived   ?? (rfqs.length + marketplaceRfqs.length);
          const rfqSubmitted = s?.rfqSubmitted  ?? (quotes.length + marketplaceRfqs.filter((rfq) => ["submitted", "selected"].includes(rfq.quoteStatus)).length);
          const fulfillPend  = s?.fulfillmentPending ?? approvedQuotes;
          const completed    = s?.completedOrders ?? 0;

          const cards = [
            {
              label: t("vendorDashboard.statRfqReceived"),
              value: rfqReceived,
              cls: "border-l-amber-500",
              iconCls: "text-amber-500",
              Icon: FileText,
              sub: t("vendorDashboard.statRfqTenderInvite"),
            },
            {
              label: t("vendorDashboard.statQuotesSent"),
              value: rfqSubmitted,
              cls: "border-l-blue-500",
              iconCls: "text-blue-500",
              Icon: Send,
              sub: t("vendorDashboard.statQuotesSentDesc"),
            },
            {
              label: t("vendorDashboard.statFulfillPending"),
              value: fulfillPend,
              cls: fulfillPend > 0 ? "border-l-orange-500" : "border-l-gray-300",
              iconCls: fulfillPend > 0 ? "text-orange-500" : "text-muted-foreground",
              Icon: Package,
              sub: t("vendorDashboard.statFulfillPendingDesc"),
            },
            {
              label: t("vendorDashboard.statOrdersDone"),
              value: completed,
              cls: "border-l-emerald-500",
              iconCls: "text-emerald-500",
              Icon: CheckCircle2,
              sub: t("vendorDashboard.statOrdersDoneDesc"),
            },
          ];

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cards.map((c) => (
                <Card key={c.label} className={`border-l-4 ${c.cls}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                      <c.Icon className={`h-4 w-4 ${c.iconCls}`} />
                    </div>
                    <div className="text-3xl font-bold">{c.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}

        {/* Supplier link status */}
        {supplier ? (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-900">{t("vendorDashboard.supplierLinkedTitle")}</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    {t("vendorDashboard.supplierLinkedDesc").replace("{name}", supplier.name)}
                    {supplier.serviceType && <> · {supplier.serviceType}</>}
                  </p>
                </div>
                <Badge className={supplier.isActive ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}>
                  {supplier.isActive ? t("vendorDashboard.supplierActiveLabel") : t("vendorDashboard.supplierInactiveLabel")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">{t("vendorDashboard.supplierNotLinkedTitle")}</p>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    {t("vendorDashboard.supplierNotLinkedDesc").replace("{email}", portalCustomer.email)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-primary text-primary-foreground rounded-xl p-5">
            <p className="text-xs text-primary-foreground/60 mb-1">{t("vendorDashboard.miniStatRfqOpen")}</p>
              <p className="text-4xl font-bold">{openRfqs.length + marketplacePendingRfqs.length}</p>
          </div>
          <div className="bg-accent text-accent-foreground rounded-xl p-5">
            <p className="text-xs text-accent-foreground/70 mb-1">{t("vendorDashboard.miniStatQuotesSent")}</p>
            <p className="text-4xl font-bold">{submittedQuotes}</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-green-600 text-white rounded-xl p-5">
            <p className="text-xs text-white/70 mb-1">{t("vendorDashboard.miniStatQuotesChosen")}</p>
            <p className="text-4xl font-bold">{approvedQuotes}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* RFQ list — 3/5 */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t("vendorDashboard.rfqIncomingTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("vendorDashboard.rfqIncomingDesc")}</p>
            </div>

            {rfqs.length === 0 ? (
              <Card className="border-none shadow-sm">
                <CardContent className="py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t("vendorDashboard.noRfqReceived")}</p>
                </CardContent>
              </Card>
            ) : (
              rfqs.map((rfq) => {
                const hasQuoted = quotedRfqIds.has(rfq.id);
                const existingQuote = quotes.find((q) => q.rfqId === rfq.id);
                const st = { label: rfqStatusLabel(rfq.status), cls: RFQ_STATUS[rfq.status]?.cls ?? "bg-gray-100 text-gray-700" };
                const isExpanded = expanded[rfq.id] ?? false;
                const formOpen = !!openForms[rfq.id];
                const isSubmitting = !!submitting[rfq.id];
                const msg = submitMsg[rfq.id];
                const canQuote = rfq.status === "open" && !!supplier;

                return (
                  <Card key={rfq.id} className={`border shadow-sm transition-shadow ${formOpen ? "shadow-md ring-1 ring-primary/20" : ""}`}>
                    <CardContent className="pt-4 pb-4">
                      {/* Row 1: RFQ header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-primary">{rfq.rfqNumber}</span>
                            <Badge className={st.cls} variant="secondary">{st.label}</Badge>
                            {hasQuoted ? (
                              <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {t("vendorDashboard.repliedBadge")}
                              </Badge>
                            ) : rfq.status === "open" ? (
                              <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                                <AlertCircle className="h-2.5 w-2.5 mr-1" /> {t("vendorDashboard.notRepliedBadge")}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="font-semibold text-sm">{rfq.shipmentType}</p>
                          <p className="text-xs text-muted-foreground">{rfq.origin} → {rfq.destination}</p>
                          {rfq.commodity && (
                            <p className="text-xs text-muted-foreground">{t("vendorDashboard.commodityLabel")} {rfq.commodity}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(rfq.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {canQuote && (
                            <Button
                              size="sm"
                              variant={formOpen ? "outline" : hasQuoted ? "outline" : "default"}
                              className="gap-1.5 text-xs h-8"
                              onClick={() => toggleForm(rfq.id, existingQuote)}
                            >
                              {formOpen ? (
                                <><X className="h-3 w-3" /> {t("vendorDashboard.cancelFormBtn")}</>
                              ) : hasQuoted ? (
                                <><Pencil className="h-3 w-3" /> {t("vendorDashboard.reviseQuoteBtn")}</>
                              ) : (
                                <><Send className="h-3 w-3" /> {t("vendorDashboard.sendQuoteBtn")}</>
                              )}
                            </Button>
                          )}
                          {existingQuote && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs h-8 text-muted-foreground"
                              onClick={() => setExpanded((p) => ({ ...p, [rfq.id]: !p[rfq.id] }))}
                            >
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {t("vendorDashboard.detailBtn")}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Existing quote detail (expandable) */}
                      {existingQuote && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("vendorDashboard.yourQuoteSection")}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="text-xs text-muted-foreground">{t("vendorDashboard.priceHeaderLabel")}</span>
                              <p className="font-semibold">{fmt(existingQuote.vendorPrice)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">{t("vendorDashboard.quoteDetailStatusLabel")}</span>
                              <p>
                                <Badge className={QUOTE_STATUS[existingQuote.quoteStatus]?.cls ?? "bg-gray-100"} variant="secondary">
                                  {quoteStatusLabel(existingQuote.quoteStatus)}
                                </Badge>
                              </p>
                            </div>
                            {existingQuote.estimatedPickup && (
                              <div>
                                <span className="text-xs text-muted-foreground">{t("vendorDashboard.estPickup")}</span>
                                <p className="text-sm">{existingQuote.estimatedPickup}</p>
                              </div>
                            )}
                            {existingQuote.estimatedDelivery && (
                              <div>
                                <span className="text-xs text-muted-foreground">{t("vendorDashboard.estDelivery")}</span>
                                <p className="text-sm">{existingQuote.estimatedDelivery}</p>
                              </div>
                            )}
                          </div>
                          {existingQuote.vendorNotes && (
                            <p className="text-xs text-muted-foreground italic mt-1">{existingQuote.vendorNotes}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Via {existingQuote.replySource === "whatsapp" ? "WhatsApp" : existingQuote.replySource === "portal" ? "Portal" : "Manual"} ·{" "}
                            {new Date(existingQuote.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      )}

                      {/* Submit form */}
                      {formOpen && (
                        <div className="mt-4 pt-4 border-t border-primary/20 space-y-4">
                          <p className="text-sm font-semibold text-primary">
                            {hasQuoted ? t("vendorDashboard.quoteReviseTitle") : t("vendorDashboard.quoteSendTitle")}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                {t("vendorDashboard.quotePriceLabel")} <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder={t("vendorDashboard.quotePricePlaceholder")}
                                value={openForms[rfq.id].vendorPrice}
                                onChange={(e) => updateForm(rfq.id, "vendorPrice", e.target.value)}
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                {t("vendorDashboard.etaPickupOptional")}
                              </label>
                              <Input
                                placeholder={t("vendorDashboard.etaPickupPlaceholder")}
                                value={openForms[rfq.id].estimatedPickup}
                                onChange={(e) => updateForm(rfq.id, "estimatedPickup", e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                {t("vendorDashboard.etaDeliveryOptional")}
                              </label>
                              <Input
                                placeholder={t("vendorDashboard.etaDeliveryPlaceholder")}
                                value={openForms[rfq.id].estimatedDelivery}
                                onChange={(e) => updateForm(rfq.id, "estimatedDelivery", e.target.value)}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                {t("vendorDashboard.notesOptional")}
                              </label>
                              <Textarea
                                placeholder={t("vendorDashboard.notesPlaceholder")}
                                value={openForms[rfq.id].vendorNotes}
                                onChange={(e) => updateForm(rfq.id, "vendorNotes", e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>

                          {msg && (
                            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                              {msg.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                              {msg.msg}
                            </div>
                          )}

                          <div className="flex gap-3">
                            <Button
                              className="flex-1 gap-2"
                              onClick={() => void submitQuote(rfq.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting
                                ? <><RefreshCw className="h-4 w-4 animate-spin" /> {t("vendorDashboard.sendingQuote")}</>
                                : <><Send className="h-4 w-4" /> {hasQuoted ? t("vendorDashboard.updateQuoteBtn") : t("vendorDashboard.sendQuoteBtn")}</>}
                            </Button>
                            <Button variant="outline" onClick={() => toggleForm(rfq.id)} disabled={isSubmitting}>
                              {t("vendorDashboard.cancelFormBtn")}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Success message after close */}
                      {!formOpen && msg?.ok && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          {msg.msg}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Marketplace RFQs — separate from the legacy logistics RFQ flow */}
            {marketplaceRfqs.length > 0 && (
              <div className="pt-5 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> RFQ Marketplace
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Undangan dari Customer Portal. Masukkan harga per item melalui formulir penawaran.
                  </p>
                </div>

                {marketplaceRfqs.map((rfq) => {
                  const isActionable = ["invited", "opened", "requote_requested"].includes(rfq.quoteStatus)
                    && !["cancelled", "expired"].includes(rfq.rfqStatus);
                  const quoteStatusLabels: Record<string, string> = {
                    invited: "Menunggu respons",
                    opened: "Sedang diisi",
                    requote_requested: "Diminta revisi",
                    submitted: "Penawaran terkirim",
                    selected: "Terpilih",
                    rejected: "Ditolak",
                    expired: "Kedaluwarsa",
                    withdrawn: "Dibatalkan",
                  };
                  const statusLabel = quoteStatusLabels[rfq.quoteStatus] ?? rfq.quoteStatus;
                  const statusClass = isActionable
                    ? "bg-orange-100 text-orange-800"
                    : rfq.quoteStatus === "selected"
                      ? "bg-green-100 text-green-800"
                      : rfq.quoteStatus === "submitted"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700";

                  return (
                    <Card key={`marketplace-${rfq.quoteId}`} className="border shadow-sm">
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-primary">{rfq.rfqNumber}</span>
                              <Badge className={statusClass} variant="secondary">{statusLabel}</Badge>
                            </div>
                            <p className="font-semibold text-sm mt-1">
                              {rfq.buyerCompany || rfq.buyerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rfq.lineCount} item · diterima {new Date(rfq.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <ShoppingBag className="h-5 w-5 text-primary/70 flex-shrink-0" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {rfq.requiredDeliveryDate && <span>Target kirim: {new Date(rfq.requiredDeliveryDate).toLocaleDateString("id-ID")}</span>}
                          {rfq.deliveryAddress && <span className="truncate" title={rfq.deliveryAddress}>Lokasi: {rfq.deliveryAddress}</span>}
                        </div>
                        {rfq.notes && <p className="text-xs text-muted-foreground italic border-l-2 pl-2">{rfq.notes}</p>}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {isActionable && (
                            <>
                              <Button asChild size="sm" className="gap-2">
                                <a href={rfq.quoteUrl}>
                                  <Send className="h-4 w-4" /> Isi harga & kirim penawaran
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => void declineMarketplaceRfq(rfq)}
                              >
                                Tolak RFQ
                              </Button>
                            </>
                          )}
                          {!isActionable && rfq.quoteStatus === "submitted" && (
                            <Button asChild variant="outline" size="sm" className="gap-2">
                              <a href={rfq.quoteUrl}>Lihat penawaran</a>
                            </Button>
                          )}
                        </div>
                        {rfq.validUntil && (
                          <p className="text-[11px] text-muted-foreground">
                            Batas respons: {new Date(rfq.validUntil).toLocaleString("id-ID")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {marketplaceOrders.length > 0 && (
              <div className="pt-5 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" /> Purchase Order Marketplace
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    PO yang sudah diterbitkan customer. Buka detail untuk menerima, menolak, atau meminta revisi.
                  </p>
                </div>
                {marketplaceOrders.map((order) => {
                  const poStatusLabels: Record<string, string> = {
                    pending: "Menunggu penerbitan",
                    issued: "Menunggu respons vendor",
                    vendor_accepted: "Diterima vendor",
                    revision_requested: "Revisi diminta",
                    vendor_rejected: "Ditolak vendor",
                    production: "Dalam produksi",
                    ready_to_ship: "Siap dikirim",
                    in_transit: "Dalam pengiriman",
                    closed: "Selesai",
                    cancelled: "Dibatalkan",
                  };
                  const canRespond = order.status === "issued" || order.status === "revision_requested";
                  return (
                    <Card key={`marketplace-po-${order.id}`} className="border shadow-sm">
                      <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-primary">{order.poNumber}</span>
                            <Badge
                              variant="secondary"
                              className={canRespond ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-700"}
                            >
                              {poStatusLabels[order.status] ?? order.status}
                            </Badge>
                          </div>
                          <p className="font-semibold text-sm mt-1">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: order.currency,
                              maximumFractionDigits: 0,
                            }).format(order.grandTotal)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Diterbitkan {new Date(order.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <Button asChild size="sm" variant={canRespond ? "default" : "outline"} className="gap-2">
                          <a href={order.poUrl}>
                            {canRespond ? "Tindak lanjuti PO" : "Lihat PO"}
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar — 2/5 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quotes history */}
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4" /> {t("vendorDashboard.quotesSentTitle")}
                </CardTitle>
                <CardDescription>{t("vendorDashboard.quotesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t("vendorDashboard.noQuoteYet")}</p>
                    {openRfqs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("vendorDashboard.sendQuoteCTA")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((q) => {
                      const st = { label: quoteStatusLabel(q.quoteStatus), cls: QUOTE_STATUS[q.quoteStatus]?.cls ?? "bg-gray-100 text-gray-700" };
                      return (
                        <div key={q.id} className="p-3 rounded-lg border border-border/50 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-mono text-xs font-medium text-primary">{q.rfqNumber}</p>
                            <Badge className={st.cls} variant="secondary">{st.label}</Badge>
                          </div>
                          <p className="font-semibold text-sm">{fmt(q.vendorPrice)}</p>
                          <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                            {q.estimatedPickup && <span>{t("vendorDashboard.estPickup")}: {q.estimatedPickup}</span>}
                            {q.estimatedDelivery && <span>{t("vendorDashboard.estDelivery")}: {q.estimatedDelivery}</span>}
                          </div>
                          {q.vendorNotes && <p className="text-xs text-muted-foreground italic">{q.vendorNotes}</p>}
                          <p className="text-xs text-muted-foreground">
                            Via {q.replySource === "whatsapp" ? "WhatsApp" : q.replySource === "portal" ? "Portal" : "Manual"} ·{" "}
                            {new Date(q.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" /> {t("vendorDashboard.profileAccountTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {portalCustomer.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{portalCustomer.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{portalCustomer.email}</span>
                </div>
                {portalCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{portalCustomer.phone}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{t("vendorDashboard.howToTitle")}</p>
                  <p>{t("vendorDashboard.howToStep1")}</p>
                  <p>{t("vendorDashboard.howToStep2")}</p>
                  <p>{t("vendorDashboard.howToStep3")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Etalase & Foto Produk ── */}
        {supplier && (
          <VendorEtalaseSection />
        )}

      </div>
      )} {/* end activeTab === "dashboard" */}

      {/* ── Profile tab ────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="container px-4 md:px-6 py-8 space-y-6 max-w-3xl mx-auto">
          {/* Verification Status Card */}
          {(() => {
            const vp = vendorProfileDetail?.vendorProfile;
            const vs = vp?.verificationStatus ?? "pending";
            const isVerified = vs === "verified";
            return (
              <Card className={`border-l-4 ${isVerified ? "border-l-emerald-500 bg-emerald-50/40" : "border-l-yellow-500 bg-yellow-50/40"}`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    {isVerified
                      ? <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      : <ShieldAlert className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${isVerified ? "text-emerald-900" : "text-yellow-900"}`}>
                          {t("vendorDashboard.verificationTitle")} <span className="capitalize">{vs === "verified" ? t("vendorDashboard.statusVerified") : vs === "pending" ? t("vendorDashboard.statusPendingReview") : vs}</span>
                        </p>
                        {isVerified && vp?.supplierId && (
                          <Badge className="bg-emerald-600 text-white text-xs">Supplier #{vp.supplierId}</Badge>
                        )}
                      </div>
                      {isVerified && vp?.approvedAt && (
                        <p className="text-xs text-emerald-700">
                          {t("vendorDashboard.approvedOn").replace("{date}", new Date(vp.approvedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }))}
                        </p>
                      )}
                      {/* Submission link */}
                      {vendorProfileDetail?.submissionLink && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-start gap-2">
                          <Link2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 text-sm">
                            <p className="font-medium text-emerald-900 mb-0.5">{t("vendorDashboard.catalogLinkTitle")}</p>
                            <a
                              href={vendorProfileDetail.submissionLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline break-all"
                            >
                              {vendorProfileDetail.submissionLink.url}
                            </a>
                            {vendorProfileDetail.submissionLink.expiresAt && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t("vendorDashboard.validUntilLabel").replace("{date}", new Date(vendorProfileDetail.submissionLink.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }))}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Full Vendor Profile */}
          {(() => {
            const vp = vendorProfileDetail?.vendorProfile;
            if (!vp) return (
              <Card className="border-none shadow-sm">
                <CardContent className="py-12 text-center">
                  <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t("vendorDashboard.profileNotAvailable")}</p>
                  <Button size="sm" variant="outline" className="mt-4" onClick={() => void refetchVendorProfile()}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {t("vendorDashboard.reloadBtnLabel")}
                  </Button>
                </CardContent>
              </Card>
            );
            const fields: [string, string | null | undefined][] = [
              [t("vendorDashboard.fieldCompanyName"), vp.companyName],
              ["NIB", vp.nib],
              [t("vendorDashboard.fieldLegalName"), vp.legalName],
              [t("vendorDashboard.fieldNpwp"), vp.npwp],
              [t("vendorDashboard.fieldServiceType"), vp.serviceType],
              [t("vendorDashboard.fieldCompanyEmail"), vp.email],
              [t("vendorDashboard.fieldPhoneNumber"), vp.phone],
            ];
            const picFields: [string, string | null | undefined][] = [
              [t("vendorDashboard.fieldPicName"), vp.picName],
              [t("vendorDashboard.fieldPicPhone"), vp.picPhone],
              [t("vendorDashboard.fieldPicEmail"), vp.picEmail],
            ];
            const addrFields: [string, string | null | undefined][] = [
              [t("vendorDashboard.fieldAddress"), vp.address || vp.fullAddress],
              [t("vendorDashboard.fieldCity"), vp.city],
              [t("vendorDashboard.fieldProvince"), vp.province],
              [t("vendorDashboard.fieldPostalCode"), vp.postalCode],
            ];
            const bankFields: [string, string | null | undefined][] = [
              [t("vendorDashboard.fieldBank"), vp.bankName],
              [t("vendorDashboard.fieldBankAccount"), vp.bankAccountNumberMasked ?? vp.bankAccountNumber],
              [t("vendorDashboard.fieldBankName"), vp.bankAccountName],
            ];
            const Section = ({ title, rows }: { title: string; rows: [string, string | null | undefined][] }) => (
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-border/40 pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {rows.map(([label, val]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
                        <dd className={`text-sm font-medium ${!val ? "text-muted-foreground italic" : ""}`}>{val || "Belum diisi"}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            );
            return (
              <div className="space-y-4">
                <div className="flex justify-end">
                  {!editingVendorProfile ? (
                    <Button size="sm" variant="outline" onClick={() => { setVendorProfileFormError(""); setEditingVendorProfile(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit profil
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingVendorProfile(false)} disabled={savingVendorProfile}>
                        <X className="h-3.5 w-3.5 mr-1.5" /> Batal
                      </Button>
                      <Button size="sm" onClick={() => void saveVendorProfile()} disabled={savingVendorProfile}>
                        {savingVendorProfile ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                        Simpan
                      </Button>
                    </div>
                  )}
                </div>
                {editingVendorProfile && (
                  <Card className="border-none shadow-sm">
                    <CardHeader className="border-b border-border/40 pb-3">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Edit data profil</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        ["picName", "Nama PIC"], ["phone", "Nomor telepon/WhatsApp"], ["email", "Email PIC"],
                        ["fullAddress", "Alamat lengkap"], ["province", "Provinsi"], ["city", "Kota"],
                        ["postalCode", "Kode pos"], ["bankName", "Nama bank"], ["bankAccountName", "Nama pemilik rekening"],
                      ] as [keyof VendorProfileForm, string][]).map(([key, label]) => (
                        <label key={key} className={key === "fullAddress" ? "sm:col-span-2 text-xs font-medium" : "text-xs font-medium"}>
                          {label}
                          {key === "fullAddress" ? (
                            <Textarea className="mt-1" value={vendorProfileForm[key]} onChange={e => setVendorProfileForm(f => ({ ...f, [key]: e.target.value }))} />
                          ) : (
                            <Input className="mt-1" value={vendorProfileForm[key]} onChange={e => setVendorProfileForm(f => ({ ...f, [key]: e.target.value }))} />
                          )}
                        </label>
                      ))}
                      <label className="text-xs font-medium">
                        Nomor rekening
                        <Input className="mt-1" value={vendorProfileForm.bankAccountNumber} placeholder="Isi nomor rekening baru (opsional)" onChange={e => setVendorProfileForm(f => ({ ...f, bankAccountNumber: e.target.value }))} />
                      </label>
                      <p className="sm:col-span-2 text-xs text-muted-foreground">Nomor rekening yang tersimpan ditampilkan dengan masking. Kosongkan jika tidak ingin mengubahnya.</p>
                      {vendorProfileFormError && <p className="sm:col-span-2 text-sm text-red-600">{vendorProfileFormError}</p>}
                    </CardContent>
                  </Card>
                )}
                <Section title={t("vendorDashboard.companyInfoSection")} rows={fields} />
                <Section title={t("vendorDashboard.picContactSection")} rows={picFields} />
                <Section title={t("vendorDashboard.addressSection")} rows={addrFields} />
                <Section title={t("vendorDashboard.bankInfoSection")} rows={bankFields} />
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Catalog tab ────────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className="container px-4 md:px-6 py-8 space-y-6">
          {/* Submissions section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" /> {t("vendorDashboard.catalogSubmissionTitle")}
              </CardTitle>
              <CardDescription>{t("vendorDashboard.submissionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {(() => {
                const subs = catalogSubmissionsData?.submissions ?? [];
                if (subs.length === 0) return (
                  <div className="py-12 text-center">
                    <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t("vendorDashboard.noSubmissions")}</p>
                    {vendorProfileDetail?.submissionLink && (
                      <a href={vendorProfileDetail.submissionLink.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="mt-4">
                          <Link2 className="h-3.5 w-3.5 mr-1.5" /> {t("vendorDashboard.openSubmissionFormBtn")}
                        </Button>
                      </a>
                    )}
                  </div>
                );
                const STATUS_MAP: Record<string, { label: string; cls: string }> = {
                  draft:    { label: t("vendorDashboard.statusDraft"),       cls: "bg-gray-100 text-gray-700" },
                  submitted:{ label: t("vendorDashboard.statusPendingReview"), cls: "bg-yellow-100 text-yellow-800" },
                  approved: { label: t("vendorDashboard.statusVerified"),     cls: "bg-green-100 text-green-800" },
                  rejected: { label: t("vendorDashboard.paymentRejected"),    cls: "bg-red-100 text-red-800" },
                };
                return (
                  <div className="space-y-3">
                    {subs.map((s) => {
                      const st = STATUS_MAP[s.status] ?? { label: s.status, cls: "bg-gray-100 text-gray-700" };
                      return (
                        <div key={s.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/60">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{s.productName ?? "—"}</p>
                            {s.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                            )}
                            {s.reviewNotes && s.status === "rejected" && (
                              <p className="text-xs text-red-600 mt-1 italic">{t("vendorDashboard.submissionRejectionNote")} {s.reviewNotes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {t("vendorDashboard.submittedDateLabel2")} {new Date(s.createdAt).toLocaleDateString("id-ID")}
                              {s.reviewedAt && ` · ${t("vendorDashboard.reviewDateLabel")} ${new Date(s.reviewedAt).toLocaleDateString("id-ID")}`}
                            </p>
                          </div>
                          <Badge className={st.cls} variant="secondary">{st.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Full catalog management (CRUD + media) */}
          {supplier && <VendorCatalogManagementSection />}
        </div>
      )}

      {/* ── Featured tab ───────────────────────────────────────────── */}
      {activeTab === "featured" && (
        <VendorFeaturedSection
          packages={featuredPackages ?? []}
          packagesLoading={featuredPackagesLoading}
          requests={featuredRequests ?? []}
          requestsLoading={featuredRequestsLoading}
          catalog={featuredCatalog ?? null}
          catalogLoading={featuredCatalogLoading}
          onRefreshRequests={() => void refetchFeaturedRequests()}
        />
      )}

      {/* ── Notifications tab ──────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="container px-4 md:px-6 py-8 max-w-2xl mx-auto">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" /> {t("vendorDashboard.notifTitle")}
                  </CardTitle>
                  <CardDescription>{t("vendorDashboard.notifDesc")}</CardDescription>
                </div>
                {(notifData?.unreadCount ?? 0) > 0 && (
                  <Button size="sm" variant="outline" onClick={() => void markAllRead()}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> {t("vendorDashboard.markAllReadBtn")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {(() => {
                const notifs = notifData?.notifications ?? [];
                if (notifs.length === 0) return (
                  <div className="py-12 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t("vendorDashboard.noNotifications")}</p>
                  </div>
                );
                const TYPE_ICON: Record<string, string> = {
                  vendor_approved:  "✅",
                  product_approved: "🎉",
                  product_rejected: "❌",
                };
                return (
                  <div className="divide-y divide-border/50">
                    {notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors ${
                          !n.isRead ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => { if (!n.isRead) void markOneRead(n.id); }}
                      >
                        <span className="text-lg mt-0.5 flex-shrink-0">{TYPE_ICON[n.type] ?? "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold leading-tight ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {new Date(n.createdAt).toLocaleString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
