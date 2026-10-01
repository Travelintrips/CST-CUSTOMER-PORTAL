import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import { useGetPortalMe, useCreateLogisticOrder } from "@shared/api-client-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { resolveImageUrl } from "@/lib/utils";
import {
  FileCheck, ArrowLeft, ChevronRight, Upload, FileText,
  AlertTriangle, Check, Loader2, Trash2, Calculator,
  BookOpen, ImagePlus, X,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

/* ─── Types ──────────────────────────────────────────────────────── */
type ServiceType = "konsultasi_reg_impor" | "konsultasi_reg_ekspor" | "konsultasi_perijinan" | "konsultasi_pajak";

interface UploadedDoc {
  label: string;
  name: string;
  objectPath: string;
  uploading: boolean;
  error?: string;
}

/* ─── DocUploader ─────────────────────────────────────────────────── */
function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx"].includes(ext)) return "📊";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "🖼️";
  return "📎";
}

function DocUploader({
  label, required, value, onChange, t,
}: {
  label: string;
  required?: boolean;
  value: UploadedDoc | null;
  onChange: (doc: UploadedDoc | null) => void;
  t: (key: string, fallback?: string) => string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!value) {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); }
      setPreviewUrl(null);
      setIsImage(false);
      setUploadProgress(null);
    }
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg", "image/png",
  ];
  const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"];

  function validateFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
      return t("pabean.fileFormatError", `Format tidak didukung (.${ext}). Gunakan PDF, JPG, atau PNG.`).replace("{ext}", ext || "unknown");
    }
    if (file.size > MAX_SIZE_BYTES) {
      return t("pabean.fileSizeError", `Ukuran file terlalu besar. Maks 5 MB.`).replace("{size}", (file.size / 1024 / 1024).toFixed(1));
    }
    return null;
  }

  function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      onChange({ label, name: file.name, objectPath: "", uploading: false, error: validationError });
      return;
    }
    const img = file.type.startsWith("image/");
    setIsImage(img);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(img ? URL.createObjectURL(file) : null);
    setUploadProgress(0);
    onChange({ label, name: file.name, objectPath: "", uploading: true });

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", "/api/portal/order-upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const { objectPath } = JSON.parse(xhr.responseText) as { objectPath: string };
          onChange({ label, name: file.name, objectPath, uploading: false });
        } catch {
          onChange({ label, name: file.name, objectPath: "", uploading: false, error: t("pabean.serverResponseInvalid", "Respons server tidak valid") });
        }
      } else {
        let msg = t("pabean.uploadFailed", "Upload gagal");
        try { msg = (JSON.parse(xhr.responseText) as { message?: string }).message ?? msg; } catch { /* noop */ }
        onChange({ label, name: file.name, objectPath: "", uploading: false, error: msg });
      }
    };

    xhr.onerror = () => {
      setUploadProgress(null);
      onChange({ label, name: file.name, objectPath: "", uploading: false, error: t("pabean.connectionFailed", "Koneksi gagal saat upload") });
    };

    xhr.send(form);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const uploaded = !!value?.objectPath;
  const hasError = !!value?.error;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-semibold">{label}</Label>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-150 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
            : uploaded
            ? "border-emerald-400 bg-emerald-50"
            : hasError
            ? "border-red-300 bg-red-50"
            : "border-border hover:border-primary/50 bg-muted/30"
        }`}
      >
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
        />

        {/* Drag overlay hint */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-6 w-6 text-primary animate-bounce" />
              <p className="text-xs font-semibold text-primary">{t("pabean.dropHere", "Lepas untuk upload")}</p>
            </div>
          </div>
        )}

        {/* Image preview strip */}
        {!isDragging && isImage && previewUrl && (
          <div className="w-full h-28 bg-slate-100 overflow-hidden">
            <img
              src={previewUrl}
              alt={value?.name ?? "preview"}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="px-4 py-3 flex items-center gap-3">
          {value?.uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          ) : uploaded ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {value?.name ? (
              <div className="flex items-center gap-1.5 min-w-0">
                {!isImage && (
                  <span className="text-base leading-none shrink-0">{getFileIcon(value.name)}</span>
                )}
                <p className={`text-xs font-medium truncate ${uploaded ? "text-emerald-700" : hasError ? "text-red-600" : "text-foreground"}`}>
                  {value.name}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isDragging ? "..." : t("pabean.dropHint", "Klik atau drop file di sini")}
              </p>
            )}
            {value?.error && <p className="text-[10px] text-red-500 mt-0.5">{value.error}</p>}
            {value?.uploading && uploadProgress !== null && (
              <p className="text-[10px] text-primary mt-0.5">{uploadProgress}% {t("pabean.uploadingProgress", "Mengupload...")}</p>
            )}
            {uploaded && !value?.uploading && (
              <p className="text-[10px] text-emerald-600 mt-0.5">{t("pabean.uploadSuccess", "Upload berhasil ✓")}</p>
            )}
          </div>

          {value && !value.uploading && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="text-muted-foreground hover:text-destructive ml-1 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {value?.uploading && uploadProgress !== null && (
          <div className="px-3 pb-3 -mt-1">
            <div className="w-full h-1.5 bg-primary/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Service Options (i18n-aware) ───────────────────────────────── */
function getServiceOptions(t: (key: string, fallback?: string) => string) {
  return [
    {
      key: "konsultasi_reg_impor" as ServiceType,
      icon: <BookOpen className="h-6 w-6" />,
      title: t("pabean.svc1Title", "Konsultasi Regulasi Impor"),
      desc: t("pabean.svc1Desc", "Konsultasi mendalam mengenai regulasi dan ketentuan kepabeanan untuk kegiatan impor barang"),
      color: "border-blue-300 bg-blue-50 text-blue-800",
    },
    {
      key: "konsultasi_reg_ekspor" as ServiceType,
      icon: <BookOpen className="h-6 w-6" />,
      title: t("pabean.svc2Title", "Konsultasi Regulasi Ekspor"),
      desc: t("pabean.svc2Desc", "Konsultasi mendalam mengenai regulasi dan ketentuan kepabeanan untuk kegiatan ekspor barang"),
      color: "border-teal-300 bg-teal-50 text-teal-800",
    },
    {
      key: "konsultasi_perijinan" as ServiceType,
      icon: <FileCheck className="h-6 w-6" />,
      title: t("pabean.svc3Title", "Konsultasi Perijinan Impor/Ekspor"),
      desc: t("pabean.svc3Desc", "Konsultasi proses perijinan, NIB, API, dan dokumen legalitas untuk kegiatan impor/ekspor"),
      color: "border-indigo-300 bg-indigo-50 text-indigo-800",
    },
    {
      key: "konsultasi_pajak" as ServiceType,
      icon: <Calculator className="h-6 w-6" />,
      title: t("pabean.svc4Title", "Konsultasi Perpajakan dalam Rangka Impor"),
      desc: t("pabean.svc4Desc", "Konsultasi PPN impor, PPh pasal 22, Bea Masuk, dan kewajiban perpajakan terkait importasi"),
      color: "border-amber-300 bg-amber-50 text-amber-800",
    },
  ];
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Pabean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // --- edit mode ---
  const { editMode, content, updateField, uploadImage } = useEditMode();
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const logoFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // i18n-aware service options
  const SERVICE_OPTIONS = getServiceOptions(t);

  async function handleServiceLogoUpload(key: string, file: File) {
    setUploadingLogo(key);
    try {
      const path = await uploadImage(file);
      updateField(`pabean_logo_${key}`, path);
    } catch {
      toast({ title: t("pabean.uploadFailed", "Gagal upload logo"), variant: "destructive" });
    } finally {
      setUploadingLogo(null);
    }
  }

  // --- global state ---
  const search = useSearch();
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  function toggleService(key: ServiceType) {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  // ── Read ?service= param from jasa page shortcut ─────────────────
  useEffect(() => {
    const params = new URLSearchParams(search);
    const svc = params.get("service") as ServiceType | null;
    if (svc && (["konsultasi_reg_impor", "konsultasi_reg_ekspor", "konsultasi_perijinan", "konsultasi_pajak"] as string[]).includes(svc)) {
      setSelectedServices([svc]);
      setTimeout(() => {
        detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  // --- customer info ---
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // --- Konsultasi textarea states ---
  const [konsultasiRegImpor, setKonsultasiRegImpor] = useState("");
  const [konsultasiRegEkspor, setKonsultasiRegEkspor] = useState("");
  const [konsultasiPerijinan, setKonsultasiPerijinan] = useState("");
  const [konsultasiPajak, setKonsultasiPajak] = useState("");

  // --- Docs ---
  const [docNIB, setDocNIB] = useState<UploadedDoc | null>(null);
  const [docNPWP, setDocNPWP] = useState<UploadedDoc | null>(null);
  const [docAWBBL, setDocAWBBL] = useState<UploadedDoc | null>(null);
  const [docInvoice, setDocInvoice] = useState<UploadedDoc | null>(null);
  const [docPackingList, setDocPackingList] = useState<UploadedDoc | null>(null);
  const [docCOO, setDocCOO] = useState<UploadedDoc | null>(null);
  const [docPerijinan, setDocPerijinan] = useState<UploadedDoc | null>(null);
  const [docLainnya, setDocLainnya] = useState<UploadedDoc | null>(null);

  // --- Portal user auto-fill ---
  const { data: portalUser } = useGetPortalMe({
    query: { queryKey: ["portalMe"], enabled: isAuthenticated() },
  });
  const createOrder = useCreateLogisticOrder();

  useEffect(() => {
    if (portalUser) {
      if (portalUser.name) setCustomerName(portalUser.name);
      if (portalUser.email) setCustomerEmail(portalUser.email);
      if (portalUser.company) setCompanyName(portalUser.company);
      if (portalUser.phone) setCustomerPhone(portalUser.phone);
    }
  }, [portalUser]);

  /* ── Estimated total — semua konsultasi dikonfirmasi oleh tim ─── */
  function estimatedTotal(): number {
    return 0;
  }

  /* ── Validation ───────────────────────────────────────────────── */
  function missingFields(): string[] {
    const m: string[] = [];
    if (selectedServices.length === 0) { m.push(t("pabean.missingService", "Jenis layanan")); return m; }
    if (selectedServices.includes("konsultasi_reg_impor") && !konsultasiRegImpor.trim()) m.push(SERVICE_OPTIONS[0].title);
    if (selectedServices.includes("konsultasi_reg_ekspor") && !konsultasiRegEkspor.trim()) m.push(SERVICE_OPTIONS[1].title);
    if (selectedServices.includes("konsultasi_perijinan") && !konsultasiPerijinan.trim()) m.push(SERVICE_OPTIONS[2].title);
    if (selectedServices.includes("konsultasi_pajak") && !konsultasiPajak.trim()) m.push(SERVICE_OPTIONS[3].title);
    if (!customerName) m.push(t("pabean.picName", "Nama PIC"));
    if (!customerEmail) m.push("Email");
    if (!customerPhone) m.push("Telepon / WhatsApp");
    return m;
  }

  /* ── Submit ───────────────────────────────────────────────────── */
  async function handleSubmit() {
    const missing = missingFields();
    if (missing.length > 0) {
      toast({ title: `Lengkapi: ${missing.join(", ")}`, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    {
      const svcLabels = selectedServices
        .map((s) => SERVICE_OPTIONS.find((o) => o.key === s)?.title ?? s)
        .join(" + ");

      const docs = [docNIB, docNPWP, docAWBBL, docInvoice, docPackingList, docCOO, docPerijinan, docLainnya]
        .filter(Boolean)
        .map((d) => `${d!.label}: ${d!.objectPath}`)
        .join("\n");

      const detailParts: string[] = [];
      if (selectedServices.includes("konsultasi_reg_impor")) {
        detailParts.push(`[${SERVICE_OPTIONS[0].title}]\n${JSON.stringify({ detail: konsultasiRegImpor })}`);
      }
      if (selectedServices.includes("konsultasi_reg_ekspor")) {
        detailParts.push(`[${SERVICE_OPTIONS[1].title}]\n${JSON.stringify({ detail: konsultasiRegEkspor })}`);
      }
      if (selectedServices.includes("konsultasi_perijinan")) {
        detailParts.push(`[${SERVICE_OPTIONS[2].title}]\n${JSON.stringify({ detail: konsultasiPerijinan })}`);
      }
      if (selectedServices.includes("konsultasi_pajak")) {
        detailParts.push(`[${SERVICE_OPTIONS[3].title}]\n${JSON.stringify({ detail: konsultasiPajak })}`);
      }
      const contactLines = [
        `PIC: ${customerName}`,
        companyName ? `Perusahaan: ${companyName}` : null,
        `Email: ${customerEmail}`,
        `Telepon: ${customerPhone}`,
      ].filter(Boolean).join("\n");

      const fullNotes = [
        notes || null,
        `[KONTAK PEMESAN]\n${contactLines}`,
        ...detailParts,
        docs ? `[DOKUMEN]\n${docs}` : null,
      ].filter(Boolean).join("\n\n");

      const orderItems = selectedServices.map((s) => {
        const opt = SERVICE_OPTIONS.find((o) => o.key === s);
        return {
          name: `Konsultan PPJK — ${opt?.title ?? s}`,
          quantity: 1,
          unitPrice: 0,
        };
      });

      const finalItems = orderItems.length > 0 ? orderItems : [{
        name: `Pengurusan Pabean PPJK — ${svcLabels}`,
        quantity: 1,
        unitPrice: estimatedTotal(),
      }];
      const tot = estimatedTotal();

      createOrder.mutate({ data: {
        companyName: companyName || "—",
        customerName,
        email: customerEmail,
        phone: customerPhone,
        shipmentType: "Pengurusan Pabean / PPJK",
        origin: "—",
        destination: "—",
        notes: fullNotes || null,
        subtotal: tot,
        tax: 0,
        grandTotal: tot,
        items: finalItems.map((it) => ({
          category: "Pabean & PPJK",
          serviceName: it.name,
          calculatorType: "manual",
          inputData: {},
          calculationResult: { unitPrice: it.unitPrice, quantity: it.quantity },
          subtotal: it.unitPrice * it.quantity,
        })),
      }}, {
        onSuccess: (data: unknown) => {
          localStorage.setItem("last_order", JSON.stringify(data));
          toast({ title: t("pabean.successMsg", "Permohonan PPJK berhasil dikirim! Tim kami akan segera menghubungi Anda.") });
          const orderNumber = (data as { orderNumber?: string })?.orderNumber;
        setLocation(orderNumber ? `/logistic-order-success?order=${encodeURIComponent(orderNumber)}` : "/logistic-order-success");
        },
        onError: (err: unknown) => {
          toast({ title: t("pabean.errorMsg", "Gagal mengirim permohonan"), description: String(err), variant: "destructive" });
        },
        onSettled: () => setSubmitting(false),
      });
    }
  }

  const fmtIDR = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  /* ── SECTION: Header ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#EEF2F9 0%,#F5F7FC 50%,#EBF0F8 100%)" }}>
      <PageSeo path="/pabean" />
      {/* Top bar — premium */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #0A2444 0%, #0B3D6B 45%, #0D5FA0 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 2px 20px rgba(10,36,68,0.28), 0 1px 4px rgba(10,36,68,0.18)",
        }}
      >
        {/* Top accent line */}
        <div className="h-[2.5px] w-full" style={{ background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 40%, rgba(251,191,36,0.3) 80%, transparent 100%)" }} />
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setLocation("/jasa")}
            className="flex items-center gap-1.5 text-sm font-medium transition-all duration-150 rounded-lg px-2.5 py-1.5"
            style={{
              color: "rgba(255,255,255,0.72)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.96)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
          >
            <ArrowLeft className="h-4 w-4" /> {t("register.back", "Kembali")}
          </button>
          <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.18)" }} />
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.28) 0%, rgba(245,158,11,0.12) 100%)", border: "1px solid rgba(245,158,11,0.40)" }}
            >
              <FileCheck className="h-4.5 w-4.5" style={{ color: "#FBBF24" }} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: "rgba(255,255,255,0.97)" }}>{t("pabean.headerTitle", "Pengurusan Pabean / PPJK")}</p>
              <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.48)", letterSpacing: "0.05em" }}>{t("pabean.headerSubtitle", "Layanan Kepabeanan")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 pb-24">

        {/* ── Step 1: Pilih Layanan ────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-5"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <style>{`
            .svc-card { transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease, background 0.22s ease; }
            .svc-card:hover:not(.svc-selected) {
              transform: translateY(-2px);
              box-shadow: 0 8px 28px rgba(245,158,11,0.14), 0 2px 8px rgba(0,0,0,0.07) !important;
              border-color: rgba(245,158,11,0.45) !important;
            }
            .svc-card.svc-selected {
              transform: translateY(-1px);
            }
            .svc-check { transition: all 0.18s cubic-bezier(.34,1.56,.64,1); }
            .svc-check.checked { transform: scale(1.08); }
          `}</style>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#fff", boxShadow: "0 2px 8px rgba(245,158,11,0.35)" }}
              >1</div>
              <h2 className="font-bold text-[15px] text-slate-900 tracking-tight">{t("pabean.step1Title", "Pilih Jenis Layanan Konsultan PPJK")}</h2>
            </div>
            <p className="text-xs text-slate-400 ml-10">{t("pabean.step1Subtitle", "Pilih satu atau lebih layanan yang dibutuhkan")}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {SERVICE_OPTIONS.map((opt) => {
              const isSelected = selectedServices.includes(opt.key);
              const logoKey = `pabean_logo_${opt.key}`;
              const rawLogo = content[logoKey];
              const logoSrc = rawLogo
                ? (rawLogo.startsWith("/") ? (resolveImageUrl(rawLogo) ?? rawLogo) : rawLogo)
                : null;
              const isUploading = uploadingLogo === opt.key;
              return (
                <div key={opt.key} className="relative">
                  <button
                    onClick={() => {
                      toggleService(opt.key);
                      if (!selectedServices.includes(opt.key)) {
                        setTimeout(() => {
                          detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 50);
                      }
                    }}
                    className={`svc-card w-full rounded-2xl p-4 text-left flex flex-col gap-3 relative ${isSelected ? "svc-selected" : ""}`}
                    style={isSelected ? {
                      background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FDE68A33 100%)",
                      border: "2px solid #F59E0B",
                      boxShadow: "0 4px 20px rgba(245,158,11,0.18), 0 1px 4px rgba(245,158,11,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
                    } : {
                      background: "rgba(255,255,255,0.9)",
                      border: "1.5px solid rgba(226,232,240,0.9)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Premium checkmark top-right */}
                    <div
                      className={`svc-check absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "checked" : ""}`}
                      style={isSelected ? {
                        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                        boxShadow: "0 2px 8px rgba(245,158,11,0.45)",
                        border: "none",
                      } : {
                        background: "rgba(255,255,255,0.9)",
                        border: "2px solid #CBD5E1",
                      }}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>

                    {/* Icon badge + title row */}
                    <div className="flex items-start gap-3 pr-7">
                      <div className="relative shrink-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={isSelected ? {
                            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                            boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
                          } : {
                            background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                            border: "1px solid rgba(226,232,240,0.8)",
                          }}
                        >
                          {logoSrc ? (
                            <img src={logoSrc} alt={opt.title} className="h-5 w-5 object-contain rounded" />
                          ) : isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                          ) : (
                            <span style={{ color: isSelected ? "#fff" : "#64748B" }}>{opt.icon}</span>
                          )}
                        </div>
                        {/* Edit mode overlay on icon */}
                        {editMode && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); logoFileRefs.current[opt.key]?.click(); }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            title={t("pabean.uploadLogoTitle")}
                          >
                            <ImagePlus className="h-3.5 w-3.5 text-white" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p
                          className="font-semibold text-[13.5px] leading-snug mb-1"
                          style={{ color: isSelected ? "#92400E" : "#1E293B" }}
                        >
                          {opt.title}
                        </p>
                        <p className="text-[11.5px] leading-relaxed" style={{ color: isSelected ? "#B45309" : "#94A3B8" }}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={(el) => { logoFileRefs.current[opt.key] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleServiceLogoUpload(opt.key, f);
                      e.target.value = "";
                    }}
                  />

                  {/* Edit mode: remove logo button */}
                  {editMode && logoSrc && (
                    <button
                      type="button"
                      onClick={() => updateField(logoKey, "")}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors z-10"
                      title={t("pabean.removeLogoTitle")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* Edit mode badge */}
                  {editMode && (
                    <div className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded pointer-events-none">
                      {t("pabean.hoverUploadHint")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {selectedServices.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-400">{t("pabean.selectedLabel", "Terpilih:")}</span>
              {selectedServices.map((s) => (
                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
                  {SERVICE_OPTIONS.find((o) => o.key === s)?.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Step 2: Detail Layanan ───────────────────────────────── */}
        {selectedServices.length > 0 && (
          <div
            ref={detailSectionRef}
            className="rounded-2xl p-5 space-y-6"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226,232,240,0.8)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", color: "#fff", boxShadow: "0 2px 8px rgba(59,130,246,0.35)" }}
              >2</div>
              <h2 className="font-bold text-[15px] text-slate-900 tracking-tight">{t("pabean.step2Title", "Detail Layanan Terpilih")}</h2>
            </div>

            {/* ─ Konsultasi Regulasi Impor ─────────────────────────── */}
            {selectedServices.includes("konsultasi_reg_impor") && (
              <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                <div className="flex items-center gap-2 pb-1 border-b border-blue-200">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">{SERVICE_OPTIONS[0].title}</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("pabean.consultDetail", "Hal yang ingin dikonsultasikan *")}</Label>
                  <Textarea
                    value={konsultasiRegImpor}
                    onChange={(e) => setKonsultasiRegImpor(e.target.value)}
                    rows={4}
                    placeholder={t("pabean.svc1ConsultPlaceholder", "Jelaskan secara singkat permasalahan atau pertanyaan seputar regulasi impor yang ingin Anda konsultasikan...")}
                  />
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start gap-2.5">
                  <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">{t("pabean.consultConfirm", "Tarif konsultasi akan dikonfirmasi oleh tim PPJK kami. Tim akan menghubungi Anda segera setelah pengajuan.")}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {t("pabean.uploadOptional", "Upload Dokumen Terkait (Opsional)")}</p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("pabean.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="NIB" value={docNIB} onChange={setDocNIB} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>
              </div>
            )}

            {/* ─ Konsultasi Regulasi Ekspor ─────────────────────────── */}
            {selectedServices.includes("konsultasi_reg_ekspor") && (
              <div className="space-y-4 rounded-xl border border-teal-200 bg-teal-50/30 p-4">
                <div className="flex items-center gap-2 pb-1 border-b border-teal-200">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-800">{SERVICE_OPTIONS[1].title}</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("pabean.consultDetail", "Hal yang ingin dikonsultasikan *")}</Label>
                  <Textarea
                    value={konsultasiRegEkspor}
                    onChange={(e) => setKonsultasiRegEkspor(e.target.value)}
                    rows={4}
                    placeholder={t("pabean.svc2ConsultPlaceholder", "Jelaskan secara singkat permasalahan atau pertanyaan seputar regulasi ekspor yang ingin Anda konsultasikan...")}
                  />
                </div>
                <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 flex items-start gap-2.5">
                  <BookOpen className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-700">{t("pabean.consultConfirm", "Tarif konsultasi akan dikonfirmasi oleh tim PPJK kami. Tim akan menghubungi Anda segera setelah pengajuan.")}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {t("pabean.uploadOptional", "Upload Dokumen Terkait (Opsional)")}</p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("pabean.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="NIB" value={docNIB} onChange={setDocNIB} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>
              </div>
            )}

            {/* ─ Konsultasi Perijinan Impor/Ekspor ─────────────────── */}
            {selectedServices.includes("konsultasi_perijinan") && (
              <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4">
                <div className="flex items-center gap-2 pb-1 border-b border-indigo-200">
                  <FileCheck className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-800">{SERVICE_OPTIONS[2].title}</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("pabean.perijinanConsultDetail", "Jenis perijinan / hal yang ingin dikonsultasikan *")}</Label>
                  <Textarea
                    value={konsultasiPerijinan}
                    onChange={(e) => setKonsultasiPerijinan(e.target.value)}
                    rows={4}
                    placeholder={t("pabean.svc3ConsultPlaceholder", "Contoh: proses pengurusan API-U, NIB bidang impor, atau syarat perijinan ekspor produk tertentu...")}
                  />
                </div>
                <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 flex items-start gap-2.5">
                  <FileCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700">{t("pabean.consultConfirm", "Tarif konsultasi akan dikonfirmasi oleh tim PPJK kami. Tim akan menghubungi Anda segera setelah pengajuan.")}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {t("pabean.uploadOptional", "Upload Dokumen Terkait (Opsional)")}</p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("pabean.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="NIB" value={docNIB} onChange={setDocNIB} t={t} />
                    <DocUploader label="NPWP" value={docNPWP} onChange={setDocNPWP} t={t} />
                    <DocUploader label="Dokumen Perijinan" value={docPerijinan} onChange={setDocPerijinan} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>
              </div>
            )}

            {/* ─ Konsultasi Perpajakan dalam Rangka Impor ──────────── */}
            {selectedServices.includes("konsultasi_pajak") && (
              <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                <div className="flex items-center gap-2 pb-1 border-b border-amber-200">
                  <Calculator className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">{SERVICE_OPTIONS[3].title}</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("pabean.consultDetail", "Hal yang ingin dikonsultasikan *")}</Label>
                  <Textarea
                    value={konsultasiPajak}
                    onChange={(e) => setKonsultasiPajak(e.target.value)}
                    rows={4}
                    placeholder={t("pabean.svc4ConsultPlaceholder", "Contoh: perhitungan PPN impor, tarif PPh pasal 22, HS Code dan Bea Masuk, atau fasilitas fiskal KITE/KAHA...")}
                  />
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
                  <Calculator className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{t("pabean.consultConfirm", "Tarif konsultasi akan dikonfirmasi oleh tim PPJK kami. Tim akan menghubungi Anda segera setelah pengajuan.")}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {t("pabean.uploadOptional", "Upload Dokumen Terkait (Opsional)")}</p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("pabean.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="Invoice" value={docInvoice} onChange={setDocInvoice} t={t} />
                    <DocUploader label="PIB / Dok Impor" value={docAWBBL} onChange={setDocAWBBL} t={t} />
                    <DocUploader label="NPWP" value={docNPWP} onChange={setDocNPWP} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Step 3: Data Pemesan ─────────────────────────────────── */}
        {selectedServices.length > 0 && (
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226,232,240,0.8)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#fff", boxShadow: "0 2px 8px rgba(16,185,129,0.35)" }}
              >3</div>
              <h2 className="font-bold text-[15px] text-slate-900 tracking-tight">{t("pabean.step3Title", "Data Pemesan")}</h2>
            </div>
            {portalUser && (
              <div className="flex items-start gap-2 text-xs text-sky-700 bg-sky-50 rounded-xl px-3 py-2.5 border border-sky-200">
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sky-500" />
                <span>{t("pabean.profileAutoFilled", "Data diambil dari profil akun Anda. Hanya nomor telepon yang dapat diubah.")}</span>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("pabean.picName", "Nama PIC")} <span className="text-red-500">*</span></Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("pabean.fullNamePlaceholder", "Nama lengkap")}
                  readOnly={!!portalUser?.name}
                  className={portalUser?.name ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("pabean.companyNameLabel", "Nama Perusahaan")}</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("pabean.companyPlaceholder", "PT. ...")}
                  readOnly={!!portalUser?.company}
                  className={portalUser?.company ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("pabean.emailLabel")} <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t("pabean.emailPlaceholder", "email@perusahaan.com")}
                  readOnly={!!portalUser?.email}
                  className={portalUser?.email ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("pabean.phoneLabel")} <span className="text-red-500">*</span></Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t("pabean.phonePlaceholder", "+62 8xx xxxx xxxx")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("pabean.additionalNotes", "Catatan Tambahan")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("pabean.additionalNotesPlaceholder", "Informasi tambahan untuk tim kami (opsional)")}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* ── Summary & Submit ─────────────────────────────────────── */}
        {selectedServices.length > 0 && (
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226,232,240,0.8)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)", color: "#fff", boxShadow: "0 2px 8px rgba(139,92,246,0.35)" }}
              >4</div>
              <h2 className="font-bold text-[15px] text-slate-900 tracking-tight">{t("pabean.step4Title", "Ringkasan & Kirim")}</h2>
            </div>

            {/* Summary row */}
            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-muted-foreground shrink-0">{t("pabean.serviceLabel", "Layanan")}</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {selectedServices.map((s) => (
                    <Badge key={s} variant="secondary">
                      {SERVICE_OPTIONS.find((o) => o.key === s)?.title}
                    </Badge>
                  ))}
                </div>
              </div>
              {estimatedTotal() > 0 ? (
                <div className="flex justify-between font-bold text-primary border-t pt-2">
                  <span>{t("pabean.estimatedCost", "Estimasi Biaya")}</span>
                  <span>{fmtIDR(estimatedTotal())}</span>
                </div>
              ) : (
                <div className="flex justify-between border-t pt-2 text-muted-foreground text-xs">
                  <span>{t("pabean.estimatedCost", "Estimasi Biaya")}</span>
                  <span>{t("pabean.confirmedAfterDoc", "Dikonfirmasi setelah pengecekan dokumen")}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{t("pabean.costNote", "Estimasi biaya bersifat indikatif. Biaya final akan dikonfirmasi oleh tim PPJK kami setelah verifikasi dokumen. Tim kami akan menghubungi Anda dalam 1×24 jam kerja.")}</span>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("pabean.submitting", "Mengirim...")}</>
              ) : (
                <><ChevronRight className="h-4 w-4" /> {t("pabean.submitBtn", "Kirim Permohonan PPJK")}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
