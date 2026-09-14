/**
 * AddVendorProductWizard
 * 5-step wizard for creating a new vendor catalog item from Customer Portal Admin.
 * Uses the same API and database tables as BizPortal — no extra sync needed.
 *
 * Step 1 – Pilih Vendor
 * Step 2 – Master Item (search existing or create new)
 * Step 3 – Harga
 * Step 4 – Marketplace Info
 * Step 5 – Media Upload
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { getAuthHeaders } from "@/lib/auth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// C1: auth via cookie
import {
  ChevronRight, ChevronLeft, Building2, Package, DollarSign,
  Globe, Image as ImageIcon, Check, Plus, Loader2, Search,
  Upload, X, Star, AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Supplier {
  id: number;
  name: string;
  status: string;
  is_active: boolean;
  marketplace_status: string | null;
  published_items: number;
  total_items: number;
}

interface MasterItem {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string | null;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "pdf" | "video";
  uploading?: boolean;
  uploaded?: boolean;
  url?: string;
  objectPath?: string;
  isThumbnail?: boolean;
  isDocument?: boolean;
  documentLabel?: string;
  error?: string;
}

interface WizardForm {
  // Step 1
  vendor_id: number | null;
  vendor_name: string;
  // Step 2
  master_item_id: number | null;
  master_item_name: string;
  // Step 3
  name: string;
  description: string;
  kategori: string;
  origin: string;
  hs_code: string;
  tags: string;
  is_published: boolean;
  is_featured: boolean;
  // Step 4
  price_base: string;
  markup_pct: string;
  currency: string;
  moq: string;
  lead_time: string;
  unit: string;
}

const INITIAL_FORM: WizardForm = {
  vendor_id: null, vendor_name: "",
  master_item_id: null, master_item_name: "",
  name: "", description: "", kategori: "", origin: "", hs_code: "", tags: "",
  is_published: false, is_featured: false,
  price_base: "", markup_pct: "0", currency: "IDR", moq: "", lead_time: "", unit: "",
};

const KATEGORI_OPTIONS = [
  "Produk", "Jasa", "Logistik", "Forwarder", "Manufaktur",
  "Pertanian", "Elektronik", "Tekstil", "Kimia", "Konstruksi",
  "Makanan & Minuman", "Kesehatan", "Lainnya",
];

const CURRENCY_OPTIONS = ["IDR", "USD", "SGD", "MYR", "EUR"];

// ── Main Component ────────────────────────────────────────────────────────────

export function AddVendorProductWizard({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<number | null>(null);

  // Step 1 – vendors
  const [vendors, setVendors] = useState<Supplier[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Step 2 – master items
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ name: "", sku: "", description: "", unit: "" });
  const [creatingItem, setCreatingItem] = useState(false);

  // Step 5 – media
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    { id: 1, label: t("addVendorWizard.stepVendor", "Vendor"),   icon: Building2 },
    { id: 2, label: t("addVendorWizard.stepItem", "Item"),       icon: Package },
    { id: 3, label: t("addVendorWizard.stepPrice", "Harga"),     icon: DollarSign },
    { id: 4, label: t("addVendorWizard.stepInfo", "Info"),       icon: Globe },
    { id: 5, label: t("addVendorWizard.stepMedia", "Media"),     icon: ImageIcon },
  ];

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm(INITIAL_FORM);
      setCreatedItemId(null);
      setVendorSearch("");
      setItemSearch("");
      setMediaFiles([]);
      setShowCreateItem(false);
      setNewItemForm({ name: "", sku: "", description: "", unit: "" });
    }
  }, [open]);

  // Load vendors when step 1 is shown
  useEffect(() => {
    if (!open || step !== 1 || vendors.length > 0) return;
    setLoadingVendors(true);
    fetch("/api/portal/admin/suppliers", { credentials: "include" })
      .then(r => r.json())
      .then((data: unknown) => setVendors(Array.isArray(data) ? data as Supplier[] : []))
      .catch(() => toast({ title: t("addVendorWizard.errorLoadVendors", "Gagal memuat vendor"), variant: "destructive" }))
      .finally(() => setLoadingVendors(false));
  }, [open, step]);

  // Load master items when step 2 is shown
  useEffect(() => {
    if (!open || step !== 2 || masterItems.length > 0) return;
    setLoadingItems(true);
    fetch("/api/portal/admin/products", { credentials: "include" })
      .then(r => r.json())
      .then((data: unknown) => setMasterItems(Array.isArray(data) ? data as MasterItem[] : []))
      .catch(() => toast({ title: t("addVendorWizard.errorLoadMasterItems", "Gagal memuat master item"), variant: "destructive" }))
      .finally(() => setLoadingItems(false));
  }, [open, step]);

  const filteredVendors = vendors.filter(v => {
    const q = vendorSearch.toLowerCase();
    return !q || v.name.toLowerCase().includes(q);
  });

  const filteredItems = masterItems.filter(i => {
    const q = itemSearch.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
  });

  const priceSell = (() => {
    const base   = parseFloat(form.price_base) || 0;
    const markup = parseFloat(form.markup_pct) || 0;
    return base > 0 ? Math.ceil(base * (1 + markup / 100)) : 0;
  })();

  // ── Validation per step ───────────────────────────────────────────────────

  function validateStep(s: number): string | null {
    if (s === 1 && !form.vendor_id)            return t("addVendorWizard.validationSelectVendor", "Pilih vendor terlebih dahulu");
    if (s === 4) {
      const base = parseFloat(form.price_base) || 0;
      if (base < 0) return t("addVendorWizard.validationPriceNegative", "Harga beli tidak boleh negatif");
      if (base > 0 && priceSell < base) return t("addVendorWizard.validationSellPriceLow", "Harga jual tidak boleh lebih kecil dari harga beli");
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    if (step < 5) setStep(s => s + 1);
  }

  function back() { if (step > 1) setStep(s => s - 1); }

  // ── Create master item inline ─────────────────────────────────────────────

  const handleCreateMasterItem = async () => {
    if (!newItemForm.name.trim()) {
      toast({ title: t("addVendorWizard.validationItemNameRequired", "Nama item wajib diisi"), variant: "destructive" }); return;
    }
    setCreatingItem(true);
    try {
      const r = await fetch("/api/portal/admin/products", {
        method: "POST", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        newItemForm.name.trim(),
          description: newItemForm.description.trim() || null,
          price:       0,
          unit:        newItemForm.unit.trim() || null,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const created = await r.json() as MasterItem;
      setMasterItems(prev => [created, ...prev]);
      setForm(f => ({ ...f, master_item_id: created.id, master_item_name: created.name, name: f.name || created.name }));
      setShowCreateItem(false);
      setNewItemForm({ name: "", sku: "", description: "", unit: "" });
      toast({ title: t("addVendorWizard.masterItemCreated", "Master item berhasil dibuat") });
    } catch (e) {
      toast({ title: t("addVendorWizard.errorCreateMasterItem", "Gagal membuat master item"), description: String(e), variant: "destructive" });
    } finally {
      setCreatingItem(false);
    }
  };

  // ── Save catalog item (Step 4 submit) ─────────────────────────────────────

  const handleSave = async () => {
    const err = validateStep(step);
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    if (!form.name.trim()) { toast({ title: t("addVendorWizard.validationProductNameRequired", "Nama produk wajib diisi"), variant: "destructive" }); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/portal/admin/vendor-catalog-items", {
        method: "POST", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id:      form.vendor_id,
          master_item_id: form.master_item_id || null,
          name:           form.name.trim(),
          description:    form.description.trim() || null,
          kategori:       form.kategori || null,
          type:           "product",
          price_base:     parseFloat(form.price_base) || 0,
          markup_pct:     parseFloat(form.markup_pct) || 0,
          currency:       form.currency,
          moq:            parseFloat(form.moq) || null,
          lead_time:      form.lead_time.trim() || null,
          origin:         form.origin.trim() || null,
          hs_code:        form.hs_code.trim() || null,
          unit:           form.unit.trim() || null,
          is_published:   form.is_published,
          is_featured:    form.is_featured,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? t("addVendorWizard.errorSaveProduct", "Gagal menyimpan produk"));
      }
      const data = await r.json() as { id: number };
      setCreatedItemId(data.id);
      toast({ title: t("addVendorWizard.productCreated", "Produk berhasil dibuat!") });
      setStep(5); // Go to media step
    } catch (e) {
      toast({ title: t("addVendorWizard.errorSaveProduct", "Gagal menyimpan produk"), description: String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Media upload ──────────────────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const ALLOWED_TYPES = ["image/jpeg","image/png","image/webp","image/gif","application/pdf","video/mp4","video/webm","video/quicktime"];
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: `${t("addVendorWizard.errorFileType", "Tipe file tidak didukung")}: ${file.name}`, description: t("addVendorWizard.errorFileTypeDesc", "Gunakan JPG, PNG, WEBP, PDF, atau MP4"), variant: "destructive" }); return;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: `${t("addVendorWizard.errorFileSize", "File terlalu besar")}: ${file.name}`, description: t("addVendorWizard.errorFileSizeDesc", "Maks 20 MB per file"), variant: "destructive" }); return;
      }
      const type: "image" | "pdf" | "video" = file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "image";
      const preview = type === "image" ? URL.createObjectURL(file) : "";
      setMediaFiles(prev => [...prev, { file, preview, type }]);
    });
  }, [toast, t]);

  const uploadAllMedia = async () => {
    if (!createdItemId || mediaFiles.length === 0) return;
    setUploadingAll(true);
    const uploaded: { url: string; objectPath: string; mimeType: string; sizeBytes: number; isThumbnail?: boolean }[] = [];
    const updated = [...mediaFiles];

    for (let i = 0; i < updated.length; i++) {
      const mf = updated[i];
      if (mf.uploaded) { if (mf.url) uploaded.push({ url: mf.url, objectPath: mf.objectPath ?? "", mimeType: mf.file.type, sizeBytes: mf.file.size, isThumbnail: mf.isThumbnail }); continue; }
      updated[i] = { ...mf, uploading: true, error: undefined };
      setMediaFiles([...updated]);
      try {
        const fd = new FormData();
        fd.append("file", mf.file);
        const r = await fetch(`/api/portal/admin/vendor-catalog-items/${createdItemId}/media-assets/upload`, {
          method: "POST", credentials: "include", headers: getAuthHeaders(), body: fd,
        });
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json() as { url: string; objectPath: string; mimeType: string; sizeBytes: number };
        updated[i] = { ...updated[i], uploading: false, uploaded: true, url: data.url, objectPath: data.objectPath };
        uploaded.push({ ...data, isThumbnail: mf.isThumbnail });
        setMediaFiles([...updated]);
      } catch (e) {
        updated[i] = { ...updated[i], uploading: false, error: String(e) };
        setMediaFiles([...updated]);
      }
    }

    // Save media_assets array
    if (uploaded.length > 0) {
      const assets = uploaded.map((u, idx) => ({
        url:        u.url,
        objectPath: u.objectPath,
        mimeType:   u.mimeType,
        sizeBytes:  u.sizeBytes,
        isThumbnail: idx === 0 || !!u.isThumbnail,
        visibility: "public",
        sortOrder:  idx,
      }));
      await fetch(`/api/portal/admin/vendor-catalog-items/${createdItemId}/media-assets`, {
        method: "PATCH", credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ mediaAssets: assets }),
      }).catch(() => {});
    }
    setUploadingAll(false);
    toast({ title: t("addVendorWizard.mediaUploaded", "Media berhasil diupload!") });
  };

  const handleFinish = () => {
    onCreated();
    onClose();
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  function StepIndicator() {
    return (
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const active  = s.id === step;
          const done    = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                done   ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                active ? "bg-indigo-600 text-white shadow-sm" :
                         "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                {s.label}
              </div>
              {idx < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Step renders ──────────────────────────────────────────────────────────

  function Step1() {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">{t("addVendorWizard.selectVendorTitle", "Pilih Vendor")}</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={vendorSearch}
            onChange={e => setVendorSearch(e.target.value)}
            placeholder={t("addVendorWizard.searchVendorPlaceholder", "Cari nama vendor...")}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {loadingVendors ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("addVendorWizard.loadingVendors", "Memuat vendor...")}
          </div>
        ) : filteredVendors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("addVendorWizard.noVendorFound", "Tidak ada vendor ditemukan.")}</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredVendors.map(v => (
              <button
                key={v.id}
                onClick={() => setForm(f => ({ ...f, vendor_id: v.id, vendor_name: v.name }))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  form.vendor_id === v.id
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Building2 className={`h-4 w-4 shrink-0 ${form.vendor_id === v.id ? "text-indigo-600" : "text-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.total_items} item · {v.published_items} published</div>
                </div>
                {form.vendor_id === v.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
        {form.vendor_id && (
          <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
            <Check className="h-4 w-4" />
            <span className="font-medium">{form.vendor_name}</span> {t("addVendorWizard.vendorSelected", "dipilih")}
          </div>
        )}
      </div>
    );
  }

  function Step2() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{t("addVendorWizard.masterItemTitle", "Master Item")}</h3>
          <Button
            size="sm" variant="outline"
            className="gap-1.5 text-xs h-7"
            onClick={() => setShowCreateItem(p => !p)}
          >
            <Plus className="h-3 w-3" /> {t("addVendorWizard.createNewMasterItem", "Buat Master Item Baru")}
          </Button>
        </div>

        {showCreateItem && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 space-y-2">
            <p className="text-xs font-medium text-indigo-700">{t("addVendorWizard.createNewMasterItem", "Buat Master Item Baru")}</p>
            <Input
              value={newItemForm.name}
              onChange={e => setNewItemForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t("addVendorWizard.itemNamePlaceholder", "Nama item *")}
              className="h-8 text-sm bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newItemForm.unit}
                onChange={e => setNewItemForm(f => ({ ...f, unit: e.target.value }))}
                placeholder={t("addVendorWizard.unitPlaceholder", "Satuan (pcs, kg, ...)")}
                className="h-8 text-sm bg-white"
              />
              <Input
                value={newItemForm.description}
                onChange={e => setNewItemForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t("addVendorWizard.descriptionOptionalPlaceholder", "Deskripsi (opsional)")}
                className="h-8 text-sm bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateMasterItem} disabled={creatingItem} className="gap-1.5 h-7 text-xs">
                {creatingItem ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} {t("addVendorWizard.saveItem", "Simpan Item")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreateItem(false)} className="h-7 text-xs">
                {t("common.cancel", "Batal")}
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={itemSearch}
            onChange={e => setItemSearch(e.target.value)}
            placeholder={t("addVendorWizard.searchItemPlaceholder", "Cari nama atau SKU...")}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {loadingItems ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("addVendorWizard.loadingItems", "Memuat item...")}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <button
              onClick={() => setForm(f => ({ ...f, master_item_id: null, master_item_name: "" }))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                !form.master_item_id ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-muted-foreground text-xs italic">{t("addVendorWizard.noMasterItem", "Tanpa master item (opsional)")}</span>
            </button>
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => setForm(f => ({
                  ...f,
                  master_item_id: item.id,
                  master_item_name: item.name,
                  name: f.name || item.name,
                }))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  form.master_item_id === item.id
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Package className={`h-4 w-4 shrink-0 ${form.master_item_id === item.id ? "text-indigo-600" : "text-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
                </div>
                {form.master_item_id === item.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
              </button>
            ))}
            {filteredItems.length === 0 && itemSearch && (
              <p className="text-sm text-muted-foreground py-2 px-3">{t("addVendorWizard.itemNotFound", "Item tidak ditemukan.")}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  function Step3() {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">{t("addVendorWizard.priceAndOrderTitle", "Harga & Pemesanan")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.purchasePriceLabel", "Harga Beli (Rp)")}</Label>
            <Input
              type="number" min={0}
              value={form.price_base}
              onChange={e => setForm(f => ({ ...f, price_base: e.target.value }))}
              className="mt-1 h-8 text-sm"
              placeholder={t("addVendorWizard.purchasePricePlaceholder", "Harga dasar / HPP")}
            />
          </div>
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.markupLabel", "Markup (%)")}</Label>
            <Input
              type="number" min={0} max={10000} step={0.5}
              value={form.markup_pct}
              onChange={e => setForm(f => ({ ...f, markup_pct: e.target.value }))}
              className="mt-1 h-8 text-sm"
              placeholder="0"
            />
          </div>
        </div>

        {parseFloat(form.price_base) > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t("addVendorWizard.sellPriceLabel", "Harga Jual (Customer)")}</span>
              <span className="font-bold text-emerald-700">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(priceSell)}
              </span>
            </div>
            {parseFloat(form.markup_pct) > 0 && (
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-xs text-muted-foreground">{t("addVendorWizard.platformProfitLabel", "Keuntungan Platform")}</span>
                <span className="text-xs text-emerald-600">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(priceSell - (parseFloat(form.price_base)||0))}
                  {" "}({parseFloat(form.markup_pct)}%)
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.currencyLabel", "Mata Uang")}</Label>
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.moqLabel", "Min. Order (MOQ)")}</Label>
            <Input
              type="number" min={0}
              value={form.moq}
              onChange={e => setForm(f => ({ ...f, moq: e.target.value }))}
              className="mt-1 h-8 text-sm"
              placeholder={t("addVendorWizard.moqPlaceholder", "Misal: 100")}
            />
          </div>
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.unitLabel", "Satuan")}</Label>
            <Input
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="mt-1 h-8 text-sm"
              placeholder={t("addVendorWizard.unitPlaceholder2", "pcs, kg, box...")}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium">{t("addVendorWizard.leadTimeLabel", "Lead Time")}</Label>
          <Input
            value={form.lead_time}
            onChange={e => setForm(f => ({ ...f, lead_time: e.target.value }))}
            className="mt-1 h-8 text-sm"
            placeholder={t("addVendorWizard.leadTimePlaceholder", "Misal: 7-14 hari kerja")}
          />
        </div>
      </div>
    );
  }

  function Step4() {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">{t("addVendorWizard.marketplaceInfoTitle", "Info Marketplace")}</h3>
        <div>
          <Label className="text-xs font-medium">{t("addVendorWizard.productNameLabel", "Nama Produk *")}</Label>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="mt-1 h-8 text-sm"
            placeholder={t("addVendorWizard.productNamePlaceholder", "Nama yang tampil di marketplace...")}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">{t("addVendorWizard.descriptionLabel", "Deskripsi")}</Label>
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="mt-1 text-sm resize-none"
            rows={3}
            placeholder={t("addVendorWizard.descriptionPlaceholder", "Deskripsi produk untuk customer...")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.kategoriLabel", "Kategori")}</Label>
            <Select value={form.kategori || ""} onValueChange={v => setForm(f => ({ ...f, kategori: v }))}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder={t("addVendorWizard.kategoriPlaceholder", "Pilih kategori")} />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">{t("addVendorWizard.originLabel", "Negara Asal")}</Label>
            <Input
              value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
              className="mt-1 h-8 text-sm"
              placeholder={t("addVendorWizard.originPlaceholder", "Indonesia, China, ...")}
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">{t("addVendorWizard.hsCodeLabel", "HS Code")}</Label>
          <Input
            value={form.hs_code}
            onChange={e => setForm(f => ({ ...f, hs_code: e.target.value }))}
            className="mt-1 h-8 text-sm font-mono"
            placeholder={t("addVendorWizard.hsCodePlaceholder", "Misal: 8471.30.10")}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium">{t("addVendorWizard.publishNow", "Publish sekarang")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" /> {t("addVendorWizard.featured", "Featured")}
            </span>
          </label>
        </div>
      </div>
    );
  }

  function Step5() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{t("addVendorWizard.uploadMediaTitle", "Upload Media")}</h3>
          <span className="text-xs text-muted-foreground">{mediaFiles.length} {t("addVendorWizard.filesSelected", "file dipilih")}</span>
        </div>

        {!createdItemId ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {t("addVendorWizard.saveFirstBeforeMedia", "Simpan produk terlebih dahulu sebelum upload media.")}
          </div>
        ) : (
          <>
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">{t("addVendorWizard.dropzoneLabel", "Klik atau drag & drop file di sini")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("addVendorWizard.dropzoneHint", "JPG, PNG, WEBP, PDF, MP4 — maks 20 MB per file")}</p>
              <input
                ref={fileInputRef} type="file" multiple hidden
                accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm"
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                {mediaFiles.map((mf, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border bg-white">
                    {mf.type === "image" && mf.preview ? (
                      <img src={mf.preview} className="h-10 w-10 object-cover rounded" alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center">
                        {mf.type === "pdf" ? <span className="text-xs font-bold text-red-500">PDF</span>
                         : mf.type === "video" ? <span className="text-xs font-bold text-blue-500">VID</span>
                         : <ImageIcon className="h-4 w-4 text-slate-400" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{mf.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(mf.file.size / 1024).toFixed(0)} KB</p>
                      {mf.error && <p className="text-xs text-red-500">{mf.error}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {idx === 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{t("addVendorWizard.thumbnailLabel", "Thumbnail")}</span>
                      )}
                      {mf.uploading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
                      {mf.uploaded && <Check className="h-4 w-4 text-emerald-500" />}
                      {!mf.uploading && !mf.uploaded && (
                        <button
                          onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={uploadAllMedia}
                  disabled={uploadingAll || mediaFiles.every(m => m.uploaded)}
                  className="w-full gap-2"
                  size="sm"
                >
                  {uploadingAll ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> {t("addVendorWizard.uploading", "Mengupload...")}</>
                  ) : mediaFiles.every(m => m.uploaded) ? (
                    <><Check className="h-4 w-4" /> {t("addVendorWizard.allUploaded", "Semua terupload")}</>
                  ) : (
                    <><Upload className="h-4 w-4" /> {t("addVendorWizard.uploadFiles", "Upload")} {mediaFiles.filter(m => !m.uploaded).length} {t("addVendorWizard.fileCount", "File")}</>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-medium mb-1">
            <Check className="h-4 w-4" /> {t("addVendorWizard.productCreated", "Produk berhasil dibuat!")}
          </div>
          <p className="text-xs text-emerald-600">
            {t("addVendorWizard.productCreatedDesc", "Produk langsung tersedia di Katalog Vendor Admin, Marketplace Customer Portal, dan BizPortal Vendor Detail.")}
          </p>
        </div>
      </div>
    );
  }

  // ── Dialog render ─────────────────────────────────────────────────────────

  const isLastDataStep = step === 4;
  const isMediaStep    = step === 5;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-600" />
            {t("addVendorWizard.dialogTitle", "Tambah Produk Vendor")}
          </DialogTitle>
        </DialogHeader>

        {StepIndicator()}

        <div className="min-h-[300px]">
          {step === 1 && Step1()}
          {step === 2 && Step2()}
          {step === 3 && Step3()}
          {step === 4 && Step4()}
          {step === 5 && Step5()}
        </div>

        <DialogFooter className="flex items-center gap-2 mt-2">
          <div className="flex-1">
            {step > 1 && !isMediaStep && (
              <Button variant="ghost" onClick={back} className="gap-1.5 text-sm" size="sm">
                <ChevronLeft className="h-4 w-4" /> {t("common.back", "Kembali")}
              </Button>
            )}
          </div>
          {isMediaStep ? (
            <Button onClick={handleFinish} className="gap-2">
              <Check className="h-4 w-4" /> {t("addVendorWizard.finish", "Selesai")}
            </Button>
          ) : isLastDataStep ? (
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("addVendorWizard.saving", "Menyimpan...")}</> : <><Check className="h-4 w-4" /> {t("addVendorWizard.saveProduct", "Simpan Produk")}</>}
            </Button>
          ) : (
            <Button onClick={next} className="gap-1.5">
              {t("addVendorWizard.next", "Lanjut")} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
