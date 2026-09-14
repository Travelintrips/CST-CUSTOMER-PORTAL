import { useState, useEffect, useCallback, useRef } from "react";

import { useParams } from "wouter";
import type { ProductTemplate, DynamicFormValues } from "@shared/product-templates";
import {
  TemplateFieldRenderer,
  TemplateDocumentRenderer,
  TemplateChecklistRenderer,
  TemplateInstructionRenderer,
  TemplatePriceBreakdown,
} from "@/components/template";
import { useLanguage } from "@/i18n/LanguageContext";

type FieldDef = {
  key: string; label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  options?: string[]; required?: boolean; placeholder?: string;
  section?: "quotation" | "operational" | "both";
  isUpload?: boolean;
};

type ServiceSchema = { label: string; emoji: string; fields: FieldDef[] };

type OrderContextItem = {
  serviceName: string;
  sku?: string | null;
  qty: string | null;
  unit: string | null;
  unitPrice?: string | null;
  subtotal: string | null;
  category?: string | null;
};

type OrderContext = {
  customerName: string | null;
  requiredDate: string | null;
  adminNotes: string | null;
  origin?: string | null;
  destination?: string | null;
  shipmentType?: string | null;
  items: OrderContextItem[];
};

type ServiceTemplateInfo = {
  serviceType: string;
  label: string;
  emoji: string;
  fields: FieldDef[];
  requiredDocuments: Array<{ key: string; label: string; required: boolean }>;
  checklist: Array<{ key: string; label: string }>;
  version: string;
  source: string;
};

type FormMeta = {
  id: number; serviceType: string; title: string | null; notes: string | null;
  vendorName: string | null; vendorPhone: string | null; vendorContactPerson: string | null;
  schema: ServiceSchema | null; mode: string; orderId: number | null;
  orderNumber: string | null; orderItemId: number | null; phase: string | null;
  alreadySubmitted?: boolean;
  productTemplate?: ProductTemplate | null;
  serviceTemplate?: ServiceTemplateInfo | null;
  orderContext?: OrderContext | null;
  templateMissing?: boolean;
  templateVersion?: string | null;
  templateCategory?: string | null;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className ?? ""}`} />;
}

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" /><Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg mt-2" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-3.5 w-28" />
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-40" /><Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-3.5 w-36" />
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-44" /><Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ── States ────────────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("vendorMiniForm.errorState.title", "Link Tidak Valid")}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function SuccessState({ orderNumber }: { orderNumber?: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("vendorMiniForm.successState.title", "Penawaran Terkirim!")}</h2>
        {orderNumber && <p className="text-xs text-slate-400 mb-2">{t("vendorMiniForm.successState.orderRef", "Order Ref")}: {orderNumber}</p>}
        <p className="text-sm text-slate-500">
          {t("vendorMiniForm.successState.message", "Terima kasih! Penawaran Anda telah kami terima dan akan segera diproses oleh tim kami. Kami akan menghubungi Anda apabila ada pertanyaan lebih lanjut.")}
        </p>
      </div>
    </div>
  );
}

function AlreadySubmittedState() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("vendorMiniForm.alreadySubmitted.title", "Penawaran Sudah Dikirim")}</h2>
        <p className="text-sm text-slate-500">
          {t("vendorMiniForm.alreadySubmitted.message", "Penawaran untuk order ini sudah pernah dikirim melalui link ini. Tim kami sedang memproses penawaran Anda.")}
        </p>
      </div>
    </div>
  );
}

// ── Field component ───────────────────────────────────────────────────────────
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

// ── Types ─────────────────────────────────────────────────────────────────────
type VendorDriver = { id: number; name: string; phone: string | null; vehiclePlate: string | null; vehicleType: string | null };

// ── DriverPicker ──────────────────────────────────────────────────────────────
function DriverPicker({
  token,
  driverName,
  driverPhone,
  plateNumber,
  vehicleType,
  onSelect,
}: {
  token: string;
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  vehicleType: string;
  onSelect: (d: { name: string; phone: string; plate: string; vehicleType: string }) => void;
}) {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<VendorDriver[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/vendor-form/${token}/drivers`)
      .then((r) => r.json())
      .then((d: { drivers?: VendorDriver[] }) => { if (d.drivers) setDrivers(d.drivers); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.vehiclePlate ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (d.phone ?? "").includes(search)
  );

  const handleSelect = useCallback((d: VendorDriver) => {
    onSelect({ name: d.name, phone: d.phone ?? "", plate: d.vehiclePlate ?? "", vehicleType: d.vehicleType ?? "" });
    setSearch("");
    setOpen(false);
  }, [onSelect]);

  const handleSaveNew = async () => {
    if (!newName.trim()) { setSaveError(t("vendorMiniForm.driver.nameRequired", "Nama driver wajib diisi")); return; }
    setSaving(true); setSaveError(null);
    try {
      const r = await fetch(`/api/vendor-form/${token}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim(), vehiclePlate: newPlate.trim(), vehicleType: newVehicleType.trim() }),
      });
      const d = await r.json() as { driver?: VendorDriver; error?: string };
      if (!r.ok) throw new Error(d.error ?? t("vendorMiniForm.driver.saveFailed", "Gagal menyimpan driver"));
      if (d.driver) {
        setDrivers((prev) => [...prev, d.driver!]);
        handleSelect(d.driver!);
      }
      setShowAddForm(false);
      setNewName(""); setNewPhone(""); setNewPlate(""); setNewVehicleType("");
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const selectedLabel = driverName ? `${driverName}${plateNumber ? ` · ${plateNumber}` : ""}` : "";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5" ref={dropRef}>
        <label className="text-sm font-medium text-slate-700">
          {t("vendorMiniForm.driver.selectLabel", "Pilih Driver")} <span className="text-red-500">*</span>
        </label>
        {selectedLabel && !open && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm">
            <div>
              <span className="font-medium text-emerald-800">{driverName}</span>
              {driverPhone && <span className="text-slate-500 ml-2">· {driverPhone}</span>}
              {plateNumber && <span className="text-slate-500 ml-2">· {plateNumber}</span>}
            </div>
            <button type="button" onClick={() => { setOpen(true); setSearch(""); }}
              className="text-xs text-emerald-600 hover:text-emerald-800 underline shrink-0">{t("vendorMiniForm.driver.change", "Ganti")}</button>
          </div>
        )}
        {(!selectedLabel || open) && (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder={drivers.length > 0 ? t("vendorMiniForm.driver.searchPlaceholder", "Cari nama driver atau plat...") : t("vendorMiniForm.driver.noDrivers", "Belum ada driver terdaftar")}
              className={inputCls}
              autoComplete="off"
            />
            {open && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {filtered.length > 0 ? (
                  filtered.map((d) => (
                    <button key={d.id} type="button" onClick={() => handleSelect(d)}
                      className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 border-b border-slate-50 last:border-0">
                      <div className="text-sm font-medium text-slate-800">{d.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex gap-2">
                        {d.phone && <span>📱 {d.phone}</span>}
                        {d.vehiclePlate && <span>🚛 {d.vehiclePlate}</span>}
                        {d.vehicleType && <span>{d.vehicleType}</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-400 text-center">
                    {search ? `"${search}" ${t("vendorMiniForm.driver.notFound", "tidak ditemukan")}` : t("vendorMiniForm.driver.noDrivers", "Belum ada driver terdaftar")}
                  </div>
                )}
                <button type="button"
                  onClick={() => { setOpen(false); setShowAddForm(true); setNewName(search); setSearch(""); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 border-t border-emerald-100 flex items-center gap-2">
                  <span className="text-base">＋</span> {t("vendorMiniForm.driver.addNew", "Tambah driver baru")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-800">➕ {t("vendorMiniForm.driver.addNewTitle", "Tambah Driver Baru")}</p>
          {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">{t("vendorMiniForm.driver.nameLabel", "Nama Driver")} <span className="text-red-500">*</span></label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder={t("vendorMiniForm.driver.namePlaceholder", "Nama lengkap driver")} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">{t("vendorMiniForm.driver.phoneLabel", "No. HP")}</label>
            <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
              placeholder="08xxxxxxxxxx" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{t("vendorMiniForm.driver.plateLabel", "Plat Nomor")}</label>
              <input type="text" value={newPlate} onChange={(e) => setNewPlate(e.target.value)}
                placeholder="B 1234 XYZ" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">{t("vendorMiniForm.driver.vehicleTypeLabel", "Jenis Kendaraan")}</label>
              <input type="text" value={newVehicleType} onChange={(e) => setNewVehicleType(e.target.value)}
                placeholder={t("vendorMiniForm.driver.vehicleTypePlaceholder", "Engkel, CDD, dll")} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleSaveNew} disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? t("vendorMiniForm.driver.saving", "Menyimpan...") : t("vendorMiniForm.driver.saveAndSelect", "Simpan & Pilih")}
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); setSaveError(null); }}
              className="px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 py-2">
              {t("vendorMiniForm.driver.cancel", "Batal")}
            </button>
          </div>
        </div>
      )}

      {driverName && (
        <div className="grid grid-cols-1 gap-3 pt-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorMiniForm.driver.driverPhoneLabel", "No. HP Driver")}</label>
            <input type="text" value={driverPhone}
              onChange={(e) => onSelect({ name: driverName, phone: e.target.value, plate: plateNumber, vehicleType })}
              placeholder="08xxxxxxxxxx" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("vendorMiniForm.driver.plateNumberLabel", "Nomor Plat Kendaraan")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={plateNumber}
              onChange={(e) => onSelect({ name: driverName, phone: driverPhone, plate: e.target.value, vehicleType })}
              placeholder="B 1234 XYZ" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorMiniForm.driver.vehicleTypeFieldLabel", "Tipe Kendaraan")}</label>
            <input type="text" value={vehicleType}
              onChange={(e) => onSelect({ name: driverName, phone: driverPhone, plate: plateNumber, vehicleType: e.target.value })}
              placeholder={t("vendorMiniForm.driver.vehicleTypeLongPlaceholder", "Engkel, Tronton, CDD, dll")} className={inputCls} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VendorMiniFormPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState<Record<string, string>>({});
  const [vendorName, setVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  // Order-based specific price fields
  const [vendorDesc, setVendorDesc] = useState("");
  const [vendorQty, setVendorQty] = useState("1");
  const [vendorUnit, setVendorUnit] = useState("Ls");
  const [vendorUnitPrice, setVendorUnitPrice] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [eta, setEta] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [templateValues, setTemplateValues] = useState<DynamicFormValues>({
    customFieldValues: {},
    uploadedDocuments: [],
    checklistStatus: {},
    packagingNotes: "",
    conditionalFlags: {},
  });
  // Vendor-only fields when productTemplate is active
  const [tplStockStatus, setTplStockStatus] = useState("");
  const [tplHarga, setTplHarga] = useState("");
  const [tplHargaError, setTplHargaError] = useState(false);
  const tplHargaRef = useRef<HTMLDivElement>(null);
  const [tplLeadTime, setTplLeadTime] = useState("");
  const [tplMoq, setTplMoq] = useState("");
  const [tplNotes, setTplNotes] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  type MediaAssetItem = { role: string; objectPath: string; filename: string; mimeType: string; size: number; localPreview?: string };
  const [mediaAssets, setMediaAssets] = useState<MediaAssetItem[]>([]);
  const [mediaUploadingRoles, setMediaUploadingRoles] = useState<Set<string>>(new Set());
  const [mediaErrors, setMediaErrors] = useState<Record<string, string>>({});

  const handleMediaUpload = async (role: string, file: File) => {
    setMediaUploadingRoles(prev => new Set(prev).add(role));
    setMediaErrors(prev => { const n = { ...prev }; delete n[role]; return n; });
    const localPreview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("role", role);
      const res = await fetch(`/api/vendor-form/upload-media/${token}`, { method: "POST", body: fd });
      const data = await res.json() as { objectPath?: string; filename?: string; mimeType?: string; size?: number; role?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? t("vendorMiniForm.upload.failed", "Upload gagal"));
      const item: MediaAssetItem = {
        role,
        objectPath: data.objectPath!,
        filename: data.filename ?? file.name,
        mimeType: data.mimeType ?? file.type,
        size: data.size ?? file.size,
        localPreview,
      };
      setMediaAssets(prev => {
        const isSingle = ["cover", "video", "brochure"].includes(role);
        return isSingle
          ? [...prev.filter(m => m.role !== role), item]
          : [...prev, item];
      });
    } catch (err) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setMediaErrors(prev => ({ ...prev, [role]: (err as Error).message }));
    } finally {
      setMediaUploadingRoles(prev => { const n = new Set(prev); n.delete(role); return n; });
    }
  };

  const handleMediaRemove = (objectPath: string) => {
    setMediaAssets(prev => {
      const item = prev.find(m => m.objectPath === objectPath);
      if (item?.localPreview) URL.revokeObjectURL(item.localPreview);
      return prev.filter(m => m.objectPath !== objectPath);
    });
  };

  useEffect(() => {
    if (!token) { setError(t("vendorMiniForm.tokenNotFound", "Token tidak ditemukan")); setLoading(false); return; }
    const ctrl = new AbortController();
    fetch(`/api/vendor-form/${token}`, { signal: ctrl.signal })
      .then(async (r) => {
        const data = await r.json() as FormMeta & { error?: string };
        if (!r.ok) throw new Error(data.error ?? t("vendorMiniForm.genericError", "Terjadi kesalahan"));
        setMeta(data);
        if (data.vendorName) setVendorName(data.vendorName);
        if (data.vendorPhone) setContactPhone(data.vendorPhone);
        if (data.vendorContactPerson) setContactPerson(data.vendorContactPerson);
      })
      .catch((e: Error) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [token]);

  const handleChange = useCallback((key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow submission when serviceTemplate is available even without schema/productTemplate
    if (!meta?.schema && !meta?.productTemplate && !meta?.serviceTemplate) return;

    // Validate required fields — prefer serviceTemplate fields, fallback to schema
    if (meta?.serviceTemplate && !meta?.productTemplate) {
      const phase = meta.phase ?? "quotation";
      const visibleFields = (meta.serviceTemplate.fields ?? []).filter(f =>
        phase === "operational"
          ? (f.section === "operational" || f.section === "both")
          : (f.section === "quotation" || f.section === "both" || !f.section)
      );
      const missing = visibleFields
        .filter(f => f.required && !f.isUpload && !values[f.key]?.trim())
        .map(f => f.label);
      if (missing.length) { setSubmitError(`${t("vendorMiniForm.validation.requiredFields", "Field wajib belum diisi")}: ${missing.join(", ")}`); return; }
    } else if (meta?.schema) {
      const phase = meta.phase ?? "quotation";
      // Ketika productTemplate ada, field product_name / unit_price / unit
      // dihandle oleh template — tidak perlu divalidasi dari schema umum
      const tplManagedKeys = meta?.productTemplate ? ["product_name", "unit_price", "unit"] : [];
      const missing = meta.schema.fields
        .filter(f =>
          f.required &&
          !f.isUpload &&
          !tplManagedKeys.includes(f.key) &&
          (!f.section || f.section === phase || f.section === "both") &&
          !values[f.key]?.trim()
        )
        .map(f => f.label);
      if (missing.length) { setSubmitError(`${t("vendorMiniForm.validation.requiredFields", "Field wajib belum diisi")}: ${missing.join(", ")}`); return; }
    }

    if (meta?.productTemplate && (!tplHarga || Number(tplHarga) <= 0)) {
      setTplHargaError(true);
      setSubmitError(t("vendorMiniForm.validation.basePriceRequired", "Harga dasar wajib diisi"));
      tplHargaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      tplHargaRef.current?.querySelector("input")?.focus();
      return;
    }
    if (meta?.mode === "order_based" && !meta?.productTemplate && (!vendorUnitPrice || Number(vendorUnitPrice) <= 0)) {
      setSubmitError(t("vendorMiniForm.validation.unitPriceRequired", "Harga satuan dasar wajib diisi")); return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      let attachmentUrl: string | undefined;
      if (attachmentFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", attachmentFile);
        const upRes = await fetch(`/api/vendor-form/upload/${token}`, { method: "POST", body: fd });
        const upData = await upRes.json() as { objectPath?: string; error?: string };
        setUploading(false);
        if (!upRes.ok) throw new Error(upData.error ?? t("vendorMiniForm.upload.fileFailed", "Upload file gagal"));
        attachmentUrl = upData.objectPath;
      }

      const qty = Math.max(1, Number(vendorQty) || 1);
      const unitPrice = meta.productTemplate
        ? (Number(tplHarga) || 0)
        : (Number(vendorUnitPrice) || 0);
      const subtotal = qty * unitPrice;
      const body: Record<string, unknown> = {
        vendorName: vendorName.trim() || null,
        contactPerson: contactPerson.trim() || null,
        contactPhone: contactPhone.trim() || null,
        formData: {
          ...values,
          ...templateValues.customFieldValues,
          ...Object.fromEntries(templateValues.uploadedDocuments.map((d) => [`_doc_${d.key}`, d.reference])),
          ...Object.fromEntries(Object.entries(templateValues.checklistStatus).map(([k, v]) => [`_chk_${k}`, v])),
          ...(templateValues.packagingNotes ? { _packagingNotes: templateValues.packagingNotes } : {}),
          ...(meta.productTemplate ? {
            _stockStatus: tplStockStatus || undefined,
            _hargaDasar: tplHarga || undefined,
            _leadTime: tplLeadTime || undefined,
            _moq: tplMoq || undefined,
            _vendorNotes: tplNotes || undefined,
          } : {}),
          ...(meta.mode === "order_based" && !meta.productTemplate ? {
            _deskripsi: vendorDesc.trim() || undefined,
            _qty: vendorQty,
            _satuan: vendorUnit,
            _hargaSatuan: vendorUnitPrice,
          } : {}),
        },
        attachmentUrl,
        mediaAssets: mediaAssets.length > 0
          ? mediaAssets.map(({ role, objectPath, filename, mimeType, size }) => ({ role, objectPath, filename, mimeType, size }))
          : undefined,
      };
      if (meta.mode === "order_based") {
        body["vendorPrice"] = subtotal > 0 ? subtotal : undefined;
        body["currency"] = currency;
        body["eta"] = tplLeadTime.trim() || eta.trim() || undefined;
        body["validUntil"] = validUntil || undefined;
      } else if (meta.productTemplate) {
        body["vendorPrice"] = unitPrice > 0 ? unitPrice : undefined;
        body["currency"] = currency;
        body["eta"] = tplLeadTime.trim() || undefined;
        body["validUntil"] = validUntil || undefined;
      }
      const res = await fetch(`/api/vendor-form/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? t("vendorMiniForm.submit.failed", "Gagal mengirim data"));
      setSubmitted(true);
    } catch (e: unknown) {
      setUploading(false);
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FormSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (submitted) return <SuccessState orderNumber={meta?.orderNumber} />;
  if (meta?.alreadySubmitted) return <AlreadySubmittedState />;

  // Allow rendering when any of schema, productTemplate, or serviceTemplate is available
  if (!meta?.schema && !meta?.productTemplate && !meta?.serviceTemplate) {
    return <ErrorState message={t("vendorMiniForm.formNotAvailable", "Form tidak tersedia untuk link ini.")} />;
  }

  const schema = meta.schema;
  const isOrderBased = meta.mode === "order_based";
  const hasProductTemplate = !!meta.productTemplate;
  const hasServiceTemplate = !hasProductTemplate && !!meta.serviceTemplate && (meta.serviceTemplate.fields?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Template Missing Warning */}
        {meta.templateMissing && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-3 mb-4 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">{t("vendorMiniForm.templateMissing.title", "Template produk tidak ditemukan")}</p>
              <p className="text-xs mt-0.5">{t("vendorMiniForm.templateMissing.message", "Spesifikasi untuk kategori ini belum tersedia. Hubungi admin untuk memperbarui template.")}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">
              {schema?.emoji ?? meta.serviceTemplate?.emoji ?? "📦"}
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {meta.title ?? `${t("vendorMiniForm.header.formTitle", "Form Penawaran")} ${schema?.label ?? meta.productTemplate?.label ?? meta.serviceTemplate?.label ?? ""}`}
              </h1>
              {meta.vendorName && <p className="text-sm text-slate-500">{t("vendorMiniForm.header.forVendor", "Untuk")}: {meta.vendorName}</p>}
              {meta.orderNumber && (
                <p className="text-xs text-blue-600 font-medium mt-0.5">📦 {t("vendorMiniForm.header.orderRef", "Order Ref")}: {meta.orderNumber}</p>
              )}
            </div>
          </div>
          {(isOrderBased || hasProductTemplate || !!meta.serviceTemplate) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {isOrderBased && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg">
                  <span>📋</span> {t("vendorMiniForm.badge.orderBased", "Form ini terkait dengan order customer spesifik")}
                </span>
              )}
              {hasProductTemplate && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg">
                  <span>🧩</span> {t("vendorMiniForm.badge.spec", "Spesifikasi")}: {meta.productTemplate!.label}
                  {meta.templateVersion && <span className="opacity-60 ml-1">v{meta.templateVersion}</span>}
                </span>
              )}
              {!hasProductTemplate && meta.serviceTemplate && (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg">
                    <span>{meta.serviceTemplate.emoji}</span> {meta.serviceTemplate.label}
                    <span className="opacity-50 ml-1">v{meta.serviceTemplate.version}</span>
                  </span>
                  {hasServiceTemplate && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                      ⚙️ Service Template Runtime Active
                      <span className="opacity-60 ml-0.5 font-normal capitalize">[{meta.serviceTemplate.source}]</span>
                    </span>
                  )}
                </>
              )}
            </div>
          )}
          {meta.notes && (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 whitespace-pre-line">
              {meta.notes}
            </p>
          )}
        </div>

        {/* Order Context Card */}
        {meta.orderContext && (meta.orderContext.customerName || meta.orderContext.items.length > 0 || meta.orderContext.adminNotes) && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
            <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">📋 {t("vendorMiniForm.orderContext.title", "Detail Order Customer")}</h2>
            <div className="space-y-2">
              {meta.orderNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorMiniForm.orderContext.orderNo", "No. Order")}</span>
                  <span className="font-mono font-semibold text-slate-800">{meta.orderNumber}</span>
                </div>
              )}
              {meta.orderContext.customerName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorMiniForm.orderContext.customer", "Customer")}</span>
                  <span className="font-medium text-slate-800">{meta.orderContext.customerName}</span>
                </div>
              )}
              {meta.orderContext.shipmentType && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorMiniForm.orderContext.serviceType", "Jenis Layanan")}</span>
                  <span className="font-medium text-slate-800">{meta.orderContext.shipmentType}</span>
                </div>
              )}
              {(meta.orderContext.origin || meta.orderContext.destination) && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorMiniForm.orderContext.route", "Rute")}</span>
                  <span className="font-medium text-slate-800 text-right">
                    {[meta.orderContext.origin, meta.orderContext.destination].filter(Boolean).join(" → ")}
                  </span>
                </div>
              )}
              {meta.orderContext.requiredDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("vendorMiniForm.orderContext.targetDelivery", "Target Pengiriman")}</span>
                  <span className="font-medium text-slate-800">
                    {(() => {
                      try {
                        const d = new Date(meta.orderContext.requiredDate + "T00:00:00");
                        const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
                        return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
                      } catch { return meta.orderContext!.requiredDate!; }
                    })()}
                  </span>
                </div>
              )}
            </div>

            {meta.orderContext.items.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-blue-600 mb-2">{t("vendorMiniForm.orderContext.itemDetail", "Detail Item")}</p>
                <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs border-b border-slate-100">
                        <th className="text-left px-3 py-2 font-medium">{t("vendorMiniForm.orderContext.colNameSku", "Nama / SKU")}</th>
                        <th className="text-right px-2 py-2 font-medium">{t("vendorMiniForm.orderContext.colQty", "Qty")}</th>
                        <th className="text-right px-2 py-2 font-medium">{t("vendorMiniForm.orderContext.colUnit", "Sat.")}</th>
                        <th className="text-right px-2 py-2 font-medium">{t("vendorMiniForm.orderContext.colBasePrice", "Harga Dasar")}</th>
                        <th className="text-right px-3 py-2 font-medium">{t("vendorMiniForm.orderContext.colSubtotal", "Subtotal")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {meta.orderContext.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-slate-700">
                            <div>{item.serviceName || "—"}</div>
                            {item.sku && <div className="text-xs text-slate-400 font-mono">{item.sku}</div>}
                          </td>
                          <td className="px-2 py-2 text-right text-slate-600">{item.qty ?? "—"}</td>
                          <td className="px-2 py-2 text-right text-slate-500">{item.unit ?? "—"}</td>
                          <td className="px-2 py-2 text-right text-slate-600">
                            {item.unitPrice ? `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-slate-700">
                            {item.subtotal ? `Rp ${Number(item.subtotal).toLocaleString("id-ID")}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {meta.orderContext.adminNotes && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs font-semibold text-blue-600 mb-1">{t("vendorMiniForm.orderContext.adminNotes", "Catatan Admin")}</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{meta.orderContext.adminNotes}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("vendorMiniForm.identity.title", "Identitas Vendor")}</h2>
            <div className="space-y-4">
              <FormField label={t("vendorMiniForm.identity.companyName", "Nama Perusahaan / Vendor")} required>
                <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)}
                  required placeholder={t("vendorMiniForm.identity.companyPlaceholder", "Nama perusahaan Anda")} className={INPUT_CLS} />
              </FormField>
              <FormField label={t("vendorMiniForm.identity.picName", "Nama PIC / Contact Person")}>
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)}
                  placeholder={t("vendorMiniForm.identity.picPlaceholder", "Nama penghubung")} className={INPUT_CLS} />
              </FormField>
              <FormField label={t("vendorMiniForm.identity.phone", "Nomor WhatsApp / Telepon")}>
                <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  placeholder={t("vendorMiniForm.identity.phonePlaceholder", "Contoh: 0812xxxx")} className={INPUT_CLS} />
              </FormField>
            </div>
          </div>

          {/* Order-based: harga penawaran */}
          {isOrderBased && (() => {
            const qty = Math.max(1, Number(vendorQty) || 1);
            const unitPrice = Number(vendorUnitPrice) || 0;
            const subtotal = qty * unitPrice;
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">💰 {t("vendorMiniForm.pricing.title", "Rincian Harga Dasar")}</h2>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  {t("vendorMiniForm.pricing.hint", "Isi")} <strong>{t("vendorMiniForm.pricing.basePrice", "Harga Dasar")}</strong> {t("vendorMiniForm.pricing.hintSuffix", "Anda — belum termasuk margin & PPN. Harga jual ke customer ditentukan oleh admin.")}
                </p>
                <div className="space-y-4">
                  <FormField label={t("vendorMiniForm.pricing.serviceDesc", "Deskripsi Layanan / Produk")}>
                    <input type="text" value={vendorDesc} onChange={e => setVendorDesc(e.target.value)}
                      placeholder={t("vendorMiniForm.pricing.serviceDescPlaceholder", "Contoh: Jasa angkutan laut FCL Jakarta–Singapura")} className={INPUT_CLS} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={t("vendorMiniForm.pricing.qty", "Qty")}>
                      <input type="number" min="1" step="any" value={vendorQty}
                        onChange={e => setVendorQty(e.target.value)}
                        placeholder="1" className={INPUT_CLS} />
                    </FormField>
                    <FormField label={t("vendorMiniForm.pricing.unit", "Satuan")}>
                      <input type="text" value={vendorUnit} onChange={e => setVendorUnit(e.target.value)}
                        placeholder={t("vendorMiniForm.pricing.unitPlaceholder", "Ls / kg / CBM / unit")} className={INPUT_CLS} />
                    </FormField>
                  </div>
                  <FormField label={t("vendorMiniForm.pricing.unitPriceLabel", "Harga Satuan Dasar (belum PPN)")} required>
                    <div className="flex gap-2">
                      <select
                        value={currency} onChange={e => setCurrency(e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-24"
                      >
                        {["IDR", "USD", "SGD", "EUR"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input
                        type="number" min="0" step="any"
                        value={vendorUnitPrice} onChange={e => setVendorUnitPrice(e.target.value)}
                        required placeholder={t("vendorMiniForm.pricing.pricePlaceholder", "Contoh: 5000000")} className={`${INPUT_CLS} flex-1`}
                      />
                    </div>
                  </FormField>

                  <TemplatePriceBreakdown
                    role="vendor"
                    basePrice={unitPrice}
                    qty={qty}
                    unit={vendorUnit || "Ls"}
                    currency={currency}
                    hint={t("vendorMiniForm.pricing.hint", "Isi Harga Dasar Anda — belum termasuk margin & PPN. Harga jual ke customer ditentukan oleh admin.")}
                  />

                  <FormField label={t("vendorMiniForm.pricing.eta", "Estimasi Pengiriman / Lead Time")}>
                    <input type="text" value={eta} onChange={e => setEta(e.target.value)}
                      placeholder={t("vendorMiniForm.pricing.etaPlaceholder", "Contoh: H+2, 3 hari kerja, 15 Jan 2026")} className={INPUT_CLS} />
                  </FormField>
                  <FormField label={t("vendorMiniForm.pricing.validUntil", "Harga Berlaku Sampai")}>
                    <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                      className={INPUT_CLS} />
                  </FormField>
                </div>
              </div>
            );
          })()}

          {/* ── Dynamic service fields ─────────────────────────────────────────
              Priority: serviceTemplate.fields (when USE_SERVICE_TEMPLATE_ENGINE=true
              and serviceTemplate is present in GET response).
              Fallback: SERVICE_SCHEMAS fields (schema.fields) — unchanged behavior.
          ─────────────────────────────────────────────────────────────────── */}
          {!hasProductTemplate && (() => {
            const stpl = meta.serviceTemplate;
            const phase = meta.phase ?? "quotation";

            // Detect if any field in the form is driver_name (enables DriverPicker)
            const allFormFields = stpl?.fields ?? schema?.fields ?? [];
            const hasDriverField = allFormFields.some(f => f.key === "driver_name");
            const DRIVER_SUB_KEYS = ["driver_phone", "plate_number", "vehicle_type"];

            // Shared field renderer — handles all types incl. upload
            const renderField = (field: FieldDef) => {
              // ── Driver fields: render DriverPicker for driver_name ──────────
              if (field.key === "driver_name") {
                return (
                  <DriverPicker
                    key="driver-picker"
                    token={token!}
                    driverName={values["driver_name"] ?? ""}
                    driverPhone={values["driver_phone"] ?? ""}
                    plateNumber={values["plate_number"] ?? ""}
                    vehicleType={values["vehicle_type"] ?? ""}
                    onSelect={(d) => {
                      handleChange("driver_name", d.name);
                      handleChange("driver_phone", d.phone);
                      handleChange("plate_number", d.plate);
                      handleChange("vehicle_type", d.vehicleType);
                    }}
                  />
                );
              }
              // Skip sub-fields handled by DriverPicker
              if (hasDriverField && DRIVER_SUB_KEYS.includes(field.key)) return null;

              if (field.isUpload) {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors">
                        <span>📎</span> {t("vendorMiniForm.upload.chooseFile", "Pilih File")}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch(`/api/vendor-form/upload/${token}`, { method: "POST", body: fd });
                            const data = await res.json() as { objectPath?: string };
                            if (res.ok && data.objectPath) handleChange(field.key, data.objectPath);
                          } catch { /* non-fatal upload error */ }
                        }}
                      />
                      {values[field.key]
                        ? <span className="text-xs text-emerald-600 font-medium">✓ {t("vendorMiniForm.upload.uploaded", "File terupload")}</span>
                        : <span className="text-xs text-slate-400">{t("vendorMiniForm.upload.noFile", "Belum ada file dipilih")}</span>
                      }
                    </label>
                  </FormField>
                );
              }
              if (field.type === "select") {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <select
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className={`${INPUT_CLS} bg-white`}
                    >
                      <option value="">— {t("vendorMiniForm.select.choose", "Pilih")} —</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </FormField>
                );
              }
              if (field.type === "textarea") {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <textarea
                      value={values[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={3}
                      className={`${INPUT_CLS} resize-none`}
                    />
                  </FormField>
                );
              }
              return (
                <FormField key={field.key} label={field.label} required={field.required}>
                  <input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    value={values[field.key] ?? ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder ?? ""}
                    className={INPUT_CLS}
                  />
                </FormField>
              );
            };

            // ── PATH A: serviceTemplate.fields (USE_SERVICE_TEMPLATE_ENGINE=true) ──
            if (stpl && (stpl.fields?.length ?? 0) > 0) {
              // Filter by phase: quotation shows quotation+both, operational shows operational+both
              const fieldsToShow = stpl.fields.filter(f =>
                phase === "operational"
                  ? (f.section === "operational" || f.section === "both")
                  : (f.section === "quotation" || f.section === "both" || !f.section)
              );

              if (fieldsToShow.length === 0) return null;

              return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {stpl.emoji} {t("vendorMiniForm.serviceFields.detail", "Detail")} {stpl.label}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      ⚙️ Template Active
                      <span className="opacity-60 font-normal normal-case ml-0.5">[{stpl.source}]</span>
                    </span>
                  </div>
                  <div className="space-y-4">
                    {fieldsToShow.map(renderField)}
                  </div>
                </div>
              );
            }

            // ── PATH B: SERVICE_SCHEMAS fallback (USE_SERVICE_TEMPLATE_ENGINE=false or null) ──
            if (schema && schema.fields.length > 0) {
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                    {schema.emoji} {t("vendorMiniForm.serviceFields.detail", "Detail")} {schema.label}
                  </h2>
                  <div className="space-y-4">
                    {schema.fields.map(renderField)}
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Vendor penawaran section — hanya tampil saat productTemplate aktif */}
          {hasProductTemplate && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">💰 {t("vendorMiniForm.vendorOffer.title", "Penawaran Vendor")}</h2>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                {t("vendorMiniForm.vendorOffer.hint", "Isi")} <strong>{t("vendorMiniForm.pricing.basePrice", "Harga Dasar")}</strong> {t("vendorMiniForm.vendorOffer.hintSuffix", "dan detail penawaran Anda. Harga jual ke customer ditentukan oleh admin.")}
              </p>
              <div className="space-y-4">
                <div ref={tplHargaRef}>
                  <FormField label={t("vendorMiniForm.vendorOffer.basePriceLabel", "Harga Dasar (Rp, belum PPN)")} required>
                    <div className={`flex gap-2 rounded-lg transition-all ${tplHargaError ? "ring-2 ring-red-400" : ""}`}>
                      <select value={currency} onChange={e => setCurrency(e.target.value)}
                        className={`rounded-lg border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-24 ${tplHargaError ? "border-red-400" : "border-slate-200"}`}>
                        {["IDR","USD","SGD","EUR"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input
                        type="number" min="0" step="any" value={tplHarga}
                        onChange={e => { setTplHarga(e.target.value); if (tplHargaError) setTplHargaError(false); }}
                        required placeholder={t("vendorMiniForm.pricing.pricePlaceholder", "Contoh: 5000000")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${tplHargaError ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-slate-200 focus:ring-indigo-400"}`}
                      />
                    </div>
                    {tplHargaError && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {t("vendorMiniForm.vendorOffer.basePriceError", "Harga dasar wajib diisi dan harus lebih dari 0")}
                      </p>
                    )}
                  </FormField>
                </div>
                <FormField label={t("vendorMiniForm.vendorOffer.stockStatus", "Status Stok")}>
                  <select value={tplStockStatus} onChange={e => setTplStockStatus(e.target.value)}
                    className={`${INPUT_CLS} bg-white`}>
                    <option value="">— {t("vendorMiniForm.select.choose", "Pilih")} —</option>
                    {["Ready Stock","Indent","Pre-order"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FormField>
                <FormField label={t("vendorMiniForm.vendorOffer.leadTime", "Lead Time / Estimasi Pengiriman")}>
                  <input type="text" value={tplLeadTime} onChange={e => setTplLeadTime(e.target.value)}
                    placeholder={t("vendorMiniForm.vendorOffer.leadTimePlaceholder", "Contoh: 7 hari kerja, H+3")} className={INPUT_CLS} />
                </FormField>
                <FormField label={t("vendorMiniForm.vendorOffer.moq", "Minimum Order (MOQ)")}>
                  <input type="text" value={tplMoq} onChange={e => setTplMoq(e.target.value)}
                    placeholder={t("vendorMiniForm.vendorOffer.moqPlaceholder", "Contoh: 100 MT, 1 truk")} className={INPUT_CLS} />
                </FormField>
                <FormField label={t("vendorMiniForm.pricing.validUntil", "Harga Berlaku Sampai")}>
                  <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                    className={INPUT_CLS} />
                </FormField>
                <FormField label={t("vendorMiniForm.vendorOffer.additionalNotes", "Catatan Tambahan")}>
                  <textarea value={tplNotes} onChange={e => setTplNotes(e.target.value)}
                    rows={3} placeholder={t("vendorMiniForm.vendorOffer.notesPlaceholder", "Catatan kondisi, syarat, atau info tambahan...")}
                    className={`${INPUT_CLS} resize-none`} />
                </FormField>
              </div>
            </div>
          )}

          {/* Service Template: Required Documents */}
          {!hasProductTemplate && meta.serviceTemplate && (meta.serviceTemplate.requiredDocuments?.length ?? 0) > 0 && (
            <TemplateDocumentRenderer
              documents={meta.serviceTemplate.requiredDocuments}
              values={templateValues.uploadedDocuments}
              onChange={(docs) => setTemplateValues((v) => ({ ...v, uploadedDocuments: docs }))}
            />
          )}

          {/* Service Template: Checklist */}
          {!hasProductTemplate && meta.serviceTemplate && (meta.serviceTemplate.checklist?.length ?? 0) > 0 && (
            <TemplateChecklistRenderer
              checklist={meta.serviceTemplate.checklist}
              values={templateValues.checklistStatus}
              onChange={(key, checked) =>
                setTemplateValues((v) => ({ ...v, checklistStatus: { ...v.checklistStatus, [key]: checked } }))
              }
            />
          )}

          {/* Attachment upload (optional) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">📎 {t("vendorMiniForm.attachment.title", "Lampiran Dokumen")}</h2>
            <p className="text-xs text-slate-500 mb-3">{t("vendorMiniForm.attachment.hint", "Opsional — sertakan dokumen pendukung (PDF, gambar, atau spreadsheet, maks. 10 MB).")}</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors">
                <span>📂</span> {t("vendorMiniForm.upload.chooseFile", "Pilih File")}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={e => setAttachmentFile(e.target.files?.[0] ?? null)}
              />
              {attachmentFile ? (
                <span className="text-sm text-slate-700 truncate max-w-[200px]">{attachmentFile.name}</span>
              ) : (
                <span className="text-sm text-slate-400">{t("vendorMiniForm.upload.noFile", "Belum ada file dipilih")}</span>
              )}
            </label>
            {attachmentFile && (
              <button type="button" onClick={() => setAttachmentFile(null)}
                className="mt-2 text-xs text-red-500 hover:text-red-700">
                ✕ {t("vendorMiniForm.attachment.remove", "Hapus lampiran")}
              </button>
            )}
          </div>

          {/* ── Media Produk/Jasa ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">📷 {t("vendorMiniForm.media.title", "Media Produk/Jasa")}</h2>
            <p className="text-xs text-slate-500 mb-5">{t("vendorMiniForm.media.hint", "Opsional — unggah foto, video, atau brosur untuk memperkuat penawaran Anda.")}</p>

            {/* Cover Image */}
            {(() => {
              const items = mediaAssets.filter(m => m.role === "cover");
              const busy = mediaUploadingRoles.has("cover");
              const err = mediaErrors["cover"];
              return (
                <div className="mb-5">
                  <p className="text-sm font-medium text-slate-700 mb-1">🖼️ {t("vendorMiniForm.media.coverImage", "Cover Image")} <span className="text-slate-400 font-normal text-xs">({t("vendorMiniForm.media.coverImageHint", "1 foto, maks. 10 MB")})</span></p>
                  {items.length === 0 ? (
                    <label className={`flex items-center gap-3 cursor-pointer w-fit ${busy ? "pointer-events-none opacity-60" : ""}`}>
                      <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm text-slate-600 transition-colors">
                        {busy ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" /> : "📤"} {busy ? t("vendorMiniForm.media.uploading", "Mengupload...") : t("vendorMiniForm.media.chooseCover", "Pilih Foto Cover")}
                      </span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("cover", f); e.target.value = ""; }} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={items[0].localPreview ?? ""} alt="cover" className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm" />
                        <button type="button" onClick={() => handleMediaRemove(items[0].objectPath)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow hover:bg-red-600">✕</button>
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 font-medium truncate max-w-[160px]">{items[0].filename}</p>
                        <p className="text-xs text-green-600 mt-0.5">✓ {t("vendorMiniForm.media.uploaded", "Terupload")}</p>
                      </div>
                    </div>
                  )}
                  {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                </div>
              );
            })()}

            {/* Gallery */}
            {(() => {
              const items = mediaAssets.filter(m => m.role === "gallery");
              const busy = mediaUploadingRoles.has("gallery");
              const err = mediaErrors["gallery"];
              return (
                <div className="mb-5">
                  <p className="text-sm font-medium text-slate-700 mb-1">🖼️ {t("vendorMiniForm.media.gallery", "Gallery Foto")} <span className="text-slate-400 font-normal text-xs">({t("vendorMiniForm.media.galleryHint", "beberapa foto, maks. 10 MB/file")})</span></p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {items.map(item => (
                      <div key={item.objectPath} className="relative">
                        <img src={item.localPreview ?? ""} alt={item.filename} className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                        <button type="button" onClick={() => handleMediaRemove(item.objectPath)}
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shadow hover:bg-red-600">✕</button>
                      </div>
                    ))}
                    <label className={`cursor-pointer flex items-center justify-center w-16 h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-400 text-xl transition-colors ${busy ? "pointer-events-none opacity-60" : ""}`}>
                      {busy ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : "+"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} multiple
                        onChange={e => { Array.from(e.target.files ?? []).forEach(f => handleMediaUpload("gallery", f)); e.target.value = ""; }} />
                    </label>
                  </div>
                  {err && <p className="text-xs text-red-500">{err}</p>}
                </div>
              );
            })()}

            {/* Video */}
            {(() => {
              const items = mediaAssets.filter(m => m.role === "video");
              const busy = mediaUploadingRoles.has("video");
              const err = mediaErrors["video"];
              return (
                <div className="mb-5">
                  <p className="text-sm font-medium text-slate-700 mb-1">🎬 {t("vendorMiniForm.media.video", "Video Profil")} <span className="text-slate-400 font-normal text-xs">({t("vendorMiniForm.media.videoHint", "1 video MP4/MOV/WebM, maks. 50 MB")})</span></p>
                  {items.length === 0 ? (
                    <label className={`flex items-center gap-3 cursor-pointer w-fit ${busy ? "pointer-events-none opacity-60" : ""}`}>
                      <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm text-slate-600 transition-colors">
                        {busy ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" /> : "🎥"} {busy ? t("vendorMiniForm.media.uploading", "Mengupload...") : t("vendorMiniForm.media.chooseVideo", "Pilih Video")}
                      </span>
                      <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo" className="hidden" disabled={busy}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("video", f); e.target.value = ""; }} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 w-fit">
                      <span className="text-xl">🎬</span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">{items[0].filename}</p>
                        <p className="text-xs text-green-600">✓ {t("vendorMiniForm.media.uploaded", "Terupload")} · {(items[0].size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button type="button" onClick={() => handleMediaRemove(items[0].objectPath)}
                        className="text-red-400 hover:text-red-600 ml-2 text-xs">✕ {t("vendorMiniForm.media.remove", "Hapus")}</button>
                    </div>
                  )}
                  {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                </div>
              );
            })()}

            {/* Brochure PDF */}
            {(() => {
              const items = mediaAssets.filter(m => m.role === "brochure");
              const busy = mediaUploadingRoles.has("brochure");
              const err = mediaErrors["brochure"];
              return (
                <div className="mb-5">
                  <p className="text-sm font-medium text-slate-700 mb-1">📄 {t("vendorMiniForm.media.brochure", "Brosur / Katalog PDF")} <span className="text-slate-400 font-normal text-xs">({t("vendorMiniForm.media.brochureHint", "1 PDF, maks. 10 MB")})</span></p>
                  {items.length === 0 ? (
                    <label className={`flex items-center gap-3 cursor-pointer w-fit ${busy ? "pointer-events-none opacity-60" : ""}`}>
                      <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm text-slate-600 transition-colors">
                        {busy ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" /> : "📁"} {busy ? t("vendorMiniForm.media.uploading", "Mengupload...") : t("vendorMiniForm.media.choosePdf", "Pilih PDF")}
                      </span>
                      <input type="file" accept="application/pdf" className="hidden" disabled={busy}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload("brochure", f); e.target.value = ""; }} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-100 w-fit">
                      <span className="text-xl">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">{items[0].filename}</p>
                        <p className="text-xs text-green-600">✓ {t("vendorMiniForm.media.uploaded", "Terupload")}</p>
                      </div>
                      <button type="button" onClick={() => handleMediaRemove(items[0].objectPath)}
                        className="text-red-400 hover:text-red-600 ml-2 text-xs">✕ {t("vendorMiniForm.media.remove", "Hapus")}</button>
                    </div>
                  )}
                  {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                </div>
              );
            })()}

            {/* Certificates */}
            {(() => {
              const items = mediaAssets.filter(m => m.role === "certificate");
              const busy = mediaUploadingRoles.has("certificate");
              const err = mediaErrors["certificate"];
              return (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">🏆 {t("vendorMiniForm.media.certificate", "Sertifikat / Dokumen Pendukung")} <span className="text-slate-400 font-normal text-xs">({t("vendorMiniForm.media.certificateHint", "PDF atau foto, maks. 10 MB/file")})</span></p>
                  {items.length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {items.map(item => (
                        <div key={item.objectPath} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                          <span>{item.mimeType === "application/pdf" ? "📄" : "🖼️"}</span>
                          <span className="text-sm text-slate-700 truncate max-w-[200px] flex-1">{item.filename}</span>
                          <span className="text-xs text-green-600">✓</span>
                          <button type="button" onClick={() => handleMediaRemove(item.objectPath)}
                            className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className={`flex items-center gap-3 cursor-pointer w-fit ${busy ? "pointer-events-none opacity-60" : ""}`}>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm text-slate-600 transition-colors">
                      {busy ? <span className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" /> : "➕"} {busy ? t("vendorMiniForm.media.uploading", "Mengupload...") : t("vendorMiniForm.media.addCertificate", "Tambah Sertifikat")}
                    </span>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" disabled={busy} multiple
                      onChange={e => { Array.from(e.target.files ?? []).forEach(f => handleMediaUpload("certificate", f)); e.target.value = ""; }} />
                  </label>
                  {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                </div>
              );
            })()}

            {mediaAssets.length > 0 && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-4">
                ✓ {mediaAssets.length} {t("vendorMiniForm.media.readyToSend", "file media siap dikirim bersama penawaran")}
              </p>
            )}
          </div>

          {meta.productTemplate && (
            <>
              <TemplateFieldRenderer
                template={meta.productTemplate}
                values={templateValues}
                onChange={setTemplateValues}
                readOnly={submitting}
              />
              <TemplateDocumentRenderer
                documents={meta.productTemplate.requiredDocuments}
                values={templateValues.uploadedDocuments}
                onChange={(docs) => setTemplateValues((v) => ({ ...v, uploadedDocuments: docs }))}
              />
              <TemplateChecklistRenderer
                checklist={meta.productTemplate.checklist}
                values={templateValues.checklistStatus}
                onChange={(key, checked) => setTemplateValues((v) => ({ ...v, checklistStatus: { ...v.checklistStatus, [key]: checked } }))}
              />
              <TemplateInstructionRenderer
                instructions={meta.productTemplate.packagingInstructions}
                notes={templateValues.packagingNotes}
                onNotesChange={(notes) => setTemplateValues((v) => ({ ...v, packagingNotes: notes }))}
              />
            </>
          )}

          {/* Error */}
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={submitting || uploading}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3.5 text-sm transition-colors active:scale-95"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("vendorMiniForm.submit.uploading", "Mengupload file...")}
              </span>
            ) : submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("vendorMiniForm.submit.sending", "Mengirim...")}
              </span>
            ) : (
              isOrderBased ? `✉️ ${t("vendorMiniForm.submit.sendQuote", "Kirim Penawaran")}` : `✉️ ${t("vendorMiniForm.submit.sendData", "Kirim Data")}`
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pb-6">
            {t("vendorMiniForm.footer.privacy", "Data Anda aman dan hanya digunakan untuk keperluan pengadaan.")}
          </p>
        </form>
      </div>
    </div>
  );
}
