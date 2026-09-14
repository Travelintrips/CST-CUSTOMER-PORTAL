import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders, getPortalRole, isAuthenticated } from "@/lib/auth";
import { useGetPortalMe, useCreateLogisticOrder } from "@shared/api-client-react";
import {
  FileCheck, ArrowLeft, ChevronRight, Upload,
  AlertTriangle, Check, Loader2, Trash2,
  ClipboardList, FileText, Package, Users, Calculator,
  TrendingUp, Info,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

/* ─── Types ──────────────────────────────────────────────────────── */
type ServiceType = "pib_peb" | "handling_clearance" | "undername";
type Jalur = "Hijau" | "Merah";
type Arah = "Impor" | "Ekspor";

interface UploadedDoc {
  label: string;
  name: string;
  objectPath: string;
  uploading: boolean;
  error?: string;
}

/* ─── Service Options ─────────────────────────────────────────────── */
function getServiceOptions(t: (key: string, fallback?: string) => string): {
  key: ServiceType;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  badge: string;
}[] {
  return [
    {
      key: "pib_peb",
      icon: <FileText className="h-6 w-6" />,
      title: t("customClearance.svc1Title", "Pembuatan Dokumen PIB / PEB"),
      desc: t("customClearance.svc1Desc", "Pengurusan & pembuatan dokumen Pemberitahuan Impor Barang (PIB) atau Pemberitahuan Ekspor Barang (PEB) secara lengkap dan akurat"),
      color: "border-blue-300 bg-blue-50 text-blue-800",
      badge: t("customClearance.svc1Badge", "1–2 hari kerja"),
    },
    {
      key: "handling_clearance",
      icon: <ClipboardList className="h-6 w-6" />,
      title: t("customClearance.svc2Title", "Handling Clearance"),
      desc: t("customClearance.svc2Desc", "Penanganan fisik proses bea cukai di pelabuhan: koordinasi pemeriksaan, pembayaran bea masuk & pajak, hingga pengeluaran barang dari area pabean"),
      color: "border-teal-300 bg-teal-50 text-teal-800",
      badge: t("customClearance.svc2Badge", "1–3 hari kerja"),
    },
    {
      key: "undername",
      icon: <Users className="h-6 w-6" />,
      title: t("customClearance.svc3Title", "Undername Impor / Ekspor"),
      desc: t("customClearance.svc3Desc", "Layanan impor atau ekspor menggunakan nama & izin perusahaan kami (API/NIK) — solusi bagi perusahaan yang belum memiliki izin importir/eksportir resmi"),
      color: "border-orange-300 bg-orange-50 text-orange-800",
      badge: t("customClearance.svc3Badge", "Sesuai kebutuhan"),
    },
  ];
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

  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "webp", "gif", "doc", "docx"];

  function validateFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
      return t("customClearance.fileFormatError", `Format tidak didukung (${ext || "unknown"}). Gunakan PDF, JPG, PNG, DOC, atau DOCX.`).replace("{ext}", ext || "unknown");
    }
    if (file.size > MAX_SIZE_BYTES) {
      return t("customClearance.fileSizeError", `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks 10 MB.`).replace("{size}", (file.size / 1024 / 1024).toFixed(1));
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

    const authHeaders = getAuthHeaders() as Record<string, string>;
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/portal/order-upload");
    xhr.withCredentials = true; // C1: send cookie session alongside legacy Bearer
    Object.entries(authHeaders).forEach(([k, v]) => xhr.setRequestHeader(k, v));

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
          onChange({ label, name: file.name, objectPath: "", uploading: false, error: t("customClearance.serverResponseInvalid", "Respons server tidak valid") });
        }
      } else {
        let msg = t("customClearance.uploadFailed", "Upload gagal");
        try { msg = (JSON.parse(xhr.responseText) as { message?: string }).message ?? msg; } catch { /* noop */ }
        onChange({ label, name: file.name, objectPath: "", uploading: false, error: msg });
      }
    };

    xhr.onerror = () => {
      setUploadProgress(null);
      onChange({ label, name: file.name, objectPath: "", uploading: false, error: t("customClearance.connectionFailed", "Koneksi gagal saat upload") });
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
          accept="application/pdf,image/*,.doc,.docx"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
        />

        {/* Drag overlay hint */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/5 pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-6 w-6 text-primary animate-bounce" />
              <p className="text-xs font-semibold text-primary">{t("customClearance.dropHere", "Lepas untuk upload")}</p>
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
                {isDragging ? "..." : t("customClearance.dropHint", "Klik atau drop file di sini")}
              </p>
            )}
            {value?.error && <p className="text-[10px] text-red-500 mt-0.5">{value.error}</p>}
            {value?.uploading && uploadProgress !== null && (
              <p className="text-[10px] text-primary mt-0.5">{uploadProgress}%</p>
            )}
            {uploaded && !value?.uploading && (
              <p className="text-[10px] text-emerald-600 mt-0.5">{t("customClearance.uploadSuccess", "Upload berhasil ✓")}</p>
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

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function CustomClearance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const search = useSearch();
  const { t } = useLanguage();
  const SERVICE_OPTIONS = getServiceOptions(t);
  const isVendor = getPortalRole() === "vendor";

  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  function toggleService(key: ServiceType) {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  useEffect(() => {
    const params = new URLSearchParams(search);
    const svc = params.get("service") as ServiceType | null;
    if (svc && (["pib_peb", "handling_clearance", "undername"] as string[]).includes(svc)) {
      setSelectedServices([svc]);
      setTimeout(() => {
        detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  /* ── PIB/PEB state ───────────────────────────────────────────── */
  const [pibPebArah, setPibPebArah] = useState<Arah>("Impor");
  const [pibPebJenisBarang, setPibPebJenisBarang] = useState("");
  const [pibPebHsCode, setPibPebHsCode] = useState("");
  const [pibPebNilai, setPibPebNilai] = useState("");
  const [pibPebMataUang, setPibPebMataUang] = useState("USD");
  const [pibPebKurs, setPibPebKurs] = useState("");
  const [pibPebBMRate, setPibPebBMRate] = useState("5");
  const [pibPebBerat, setPibPebBerat] = useState("");
  const [pibPebPelabuhan, setPibPebPelabuhan] = useState("Tanjung Priok");
  const [pibPebNegara, setPibPebNegara] = useState("");
  const [pibPebCatatan, setPibPebCatatan] = useState("");

  /* ── Handling Clearance state ─────────────────────────────────── */
  const [hcArah, setHcArah] = useState<Arah>("Impor");
  const [hcJenisBarang, setHcJenisBarang] = useState("");
  const [hcNomPIBPEB, setHcNomPIBPEB] = useState("");
  const [hcJalur, setHcJalur] = useState<Jalur | "">("");
  const [hcPelabuhan, setHcPelabuhan] = useState("Tanjung Priok");
  const [hcCatatan, setHcCatatan] = useState("");

  /* ── Undername state ──────────────────────────────────────────── */
  const [unArah, setUnArah] = useState<Arah>("Impor");
  const [unJenisBarang, setUnJenisBarang] = useState("");
  const [unHsCode, setUnHsCode] = useState("");
  const [unNilaiAngka, setUnNilaiAngka] = useState("");
  const [unMataUang, setUnMataUang] = useState("USD");
  const [unKurs, setUnKurs] = useState("");
  const [unBMRate, setUnBMRate] = useState("5");
  const [unBerat, setUnBerat] = useState("");
  const [unNegara, setUnNegara] = useState("");
  const [unPelabuhan, setUnPelabuhan] = useState("Tanjung Priok");
  const [unAlasan, setUnAlasan] = useState("");

  /* ── PIB/PEB Estimator (memoized) ─────────────────────────────── */
  const pibEstimasi = useMemo(() => {
    const nilaiNum = parseFloat(pibPebNilai.replace(/,/g, "")) || 0;
    const kurs = pibPebMataUang === "IDR" ? 1 : parseFloat(pibPebKurs);
    if (!Number.isFinite(kurs) || kurs <= 0) return null;
    const cifIdr = nilaiNum * kurs;
    if (cifIdr <= 0) return null;

    const bmPct = parseFloat(pibPebBMRate) || 0;

    if (pibPebArah === "Impor") {
      const beaMasuk = cifIdr * bmPct / 100;
      const dasarPPN = cifIdr + beaMasuk;
      const ppn = dasarPPN * 0.11;
      const pph22 = cifIdr * 0.025; // dengan API: 2.5%
      const JASA_MIN = 2_500_000;
      const jasa = Math.max(cifIdr * 0.015, JASA_MIN);
      const totalPajak = beaMasuk + ppn + pph22;
      const grandTotal = totalPajak + jasa;
      return { cifIdr, beaMasuk, ppn, pph22, jasa, totalPajak, grandTotal, arah: "Impor" as const };
    } else {
      const JASA_MIN = 1_500_000;
      const jasa = Math.max(cifIdr * 0.01, JASA_MIN);
      return { cifIdr, beaMasuk: 0, ppn: 0, pph22: 0, jasa, totalPajak: 0, grandTotal: jasa, arah: "Ekspor" as const };
    }
  }, [pibPebNilai, pibPebMataUang, pibPebKurs, pibPebBMRate, pibPebArah]);

  /* ── Undername Estimator (memoized) ───────────────────────────── */
  const unEstimasi = useMemo(() => {
    const nilaiNum = parseFloat(unNilaiAngka.replace(/,/g, "")) || 0;
    const kurs = unMataUang === "IDR" ? 1 : parseFloat(unKurs);
    if (!Number.isFinite(kurs) || kurs <= 0) return null;
    const cifIdr = nilaiNum * kurs;
    if (cifIdr <= 0) return null;

    const bmPct = parseFloat(unBMRate) || 0;

    if (unArah === "Impor") {
      const beaMasuk = cifIdr * bmPct / 100;
      const dasarPPN = cifIdr + beaMasuk;
      const ppn = dasarPPN * 0.11;
      const pph22 = cifIdr * 0.075;
      const JASA_MIN = 5_000_000;
      const jasa = Math.max(cifIdr * 0.02, JASA_MIN);
      const totalPajak = beaMasuk + ppn + pph22;
      const grandTotal = totalPajak + jasa;
      return { cifIdr, beaMasuk, ppn, pph22, jasa, totalPajak, grandTotal, arah: "Impor" as const };
    } else {
      const JASA_MIN = 3_000_000;
      const jasa = Math.max(cifIdr * 0.015, JASA_MIN);
      return { cifIdr, beaMasuk: 0, ppn: 0, pph22: 0, jasa, totalPajak: 0, grandTotal: jasa, arah: "Ekspor" as const };
    }
  }, [unNilaiAngka, unMataUang, unKurs, unBMRate, unArah]);

  /* ── Handling Clearance Estimator (flat fee by arah + jalur) ──── */
  const hcEstimasi = useMemo(() => {
    // Tarif jasa handling clearance (flat per shipment)
    // Impor Jalur Merah (pemeriksaan fisik): lebih tinggi karena koordinasi intensif
    const fee =
      hcArah === "Ekspor" ? 2_500_000
      : hcJalur === "Merah" ? 6_000_000
      : 3_500_000; // Impor Jalur Hijau / belum diketahui
    return { fee, arah: hcArah, jalur: hcJalur };
  }, [hcArah, hcJalur]);

  /* ── Docs ─────────────────────────────────────────────────────── */
  const [docAWBBL, setDocAWBBL] = useState<UploadedDoc | null>(null);
  const [docInvoice, setDocInvoice] = useState<UploadedDoc | null>(null);
  const [docPackingList, setDocPackingList] = useState<UploadedDoc | null>(null);
  const [docCOO, setDocCOO] = useState<UploadedDoc | null>(null);
  const [docLS, setDocLS] = useState<UploadedDoc | null>(null);
  const [docNPWP, setDocNPWP] = useState<UploadedDoc | null>(null);
  const [docNIB, setDocNIB] = useState<UploadedDoc | null>(null);
  const [docPIBPEB, setDocPIBPEB] = useState<UploadedDoc | null>(null);
  const [docLainnya, setDocLainnya] = useState<UploadedDoc | null>(null);

  /* ── Customer info ────────────────────────────────────────────── */
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

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

  /* ── Validation ───────────────────────────────────────────────── */
  function missingFields(): string[] {
    const m: string[] = [];
    if (selectedServices.length === 0) { m.push(t("customClearance.missingService", "Jenis layanan")); return m; }
    if (selectedServices.includes("pib_peb")) {
      if (!pibPebJenisBarang.trim()) m.push("Jenis/Nama Barang (PIB/PEB)");
      if (!pibPebNilai.trim()) m.push(`Nilai ${pibPebArah === "Impor" ? "CIF" : "FOB"}`);
      if (pibPebMataUang !== "IDR" && (!pibPebKurs.trim() || Number(pibPebKurs) <= 0)) m.push("Kurs valuta PIB/PEB");
    }
    if (selectedServices.includes("handling_clearance")) {
      if (!hcJenisBarang.trim()) m.push("Jenis/Nama Barang (Handling)");
    }
    if (selectedServices.includes("undername")) {
      if (!unJenisBarang.trim()) m.push("Jenis/Nama Barang (Undername)");
      if (unMataUang !== "IDR" && (!unKurs.trim() || Number(unKurs) <= 0)) m.push("Kurs valuta Undername");
      if (!unNilaiAngka.trim()) m.push("Nilai CIF/FOB (Undername)");
      if (!unNegara.trim()) m.push("Negara Asal/Tujuan (Undername)");
    }
    if (!customerName) m.push(t("customClearance.picName", "Nama PIC"));
    if (!customerEmail) m.push("Email");
    if (!customerPhone) m.push("Telepon / WhatsApp");
    return m;
  }

  /* ── Submit ───────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (isVendor) {
      toast({
        title: t("customClearance.vendorInfoOnly", "Halaman informasi layanan"),
        description: t(
          "customClearance.vendorInfoOnlyDesc",
          "Pengajuan Custom Clearance hanya tersedia untuk akun Customer.",
        ),
        variant: "destructive",
      });
      return;
    }
    const missing = missingFields();
    if (missing.length > 0) {
      toast({ title: `Lengkapi: ${missing.join(", ")}`, variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const svcLabels = selectedServices
      .map((s) => SERVICE_OPTIONS.find((o) => o.key === s)?.title ?? s)
      .join(" + ");

    const docs = [docAWBBL, docInvoice, docPackingList, docCOO, docLS, docNPWP, docNIB, docPIBPEB, docLainnya]
      .filter(Boolean)
      .map((d) => `${d!.label}: ${d!.objectPath}`)
      .join("\n");

    const detailParts: string[] = [];

    if (selectedServices.includes("pib_peb")) {
      detailParts.push(`[Pembuatan Dokumen PIB/PEB — ${pibPebArah}]\n${JSON.stringify({
        arah: pibPebArah,
        jenis_barang: pibPebJenisBarang,
        hs_code: pibPebHsCode,
        nilai: `${pibPebNilai} ${pibPebMataUang}`,
        berat_kg: pibPebBerat,
        pelabuhan: pibPebPelabuhan,
        negara: pibPebNegara,
        catatan: pibPebCatatan,
      })}`);
    }
    if (selectedServices.includes("handling_clearance")) {
      detailParts.push(`[Handling Clearance — ${hcArah}]\n${JSON.stringify({
        arah: hcArah,
        jenis_barang: hcJenisBarang,
        nomor_pib_peb: hcNomPIBPEB,
        jalur: hcJalur || "Belum diketahui",
        pelabuhan: hcPelabuhan,
        catatan: hcCatatan,
      })}`);
    }
    if (selectedServices.includes("undername")) {
      const estimRow = unEstimasi
        ? `estimasi_total_idr: Rp ${unEstimasi.grandTotal.toLocaleString("id-ID")}`
        : "";
      detailParts.push(`[Undername ${unArah}]\n${JSON.stringify({
        arah: unArah,
        jenis_barang: unJenisBarang,
        hs_code: unHsCode,
        nilai_cif_fob: `${unNilaiAngka} ${unMataUang}`,
        kurs: unMataUang !== "IDR" ? `Rp ${unKurs}/1 ${unMataUang}` : "IDR",
        tarif_bm_pct: `${unBMRate}%`,
        berat_kg: unBerat,
        negara: unNegara,
        pelabuhan: unPelabuhan,
        alasan: unAlasan,
        estimasi: estimRow,
      })}`);
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

    // Resolve per-service estimated totals
    const serviceEstimates: Record<string, number> = {
      pib_peb:           pibEstimasi?.grandTotal ?? 0,
      handling_clearance: hcEstimasi.fee,
      undername:         unEstimasi?.grandTotal ?? 0,
    };

    const orderItems = selectedServices.map((s) => {
      const opt = SERVICE_OPTIONS.find((o) => o.key === s);
      return {
        name: `Custom Clearance — ${opt?.title ?? s}`,
        quantity: 1,
        unitPrice: serviceEstimates[s] ?? 0,
      };
    });

    const subtotalEst = orderItems.reduce((sum, it) => sum + it.unitPrice, 0);

    createOrder.mutate({ data: {
      companyName: companyName || "—",
      customerName,
      email: customerEmail,
      phone: customerPhone,
      shipmentType: "Custom Clearance Proses",
      origin: "Pelabuhan",
      destination: "—",
      notes: fullNotes || null,
      subtotal: subtotalEst,
      tax: 0,
      grandTotal: subtotalEst,
      items: orderItems.map((it) => ({
        category: "Custom Clearance",
        serviceName: it.name,
        calculatorType: "manual",
        inputData: {},
        calculationResult: { unitPrice: it.unitPrice, quantity: 1 },
        subtotal: it.unitPrice,
      })),
    }}, {
      onSuccess: (data: unknown) => {
        localStorage.setItem("last_order", JSON.stringify(data));
        toast({ title: t("customClearance.successMsg", "Permohonan Custom Clearance berhasil dikirim! Tim kami akan segera menghubungi Anda.") });
        setLocation("/logistic-order-success");
      },
      onError: (err: unknown) => {
        toast({ title: t("customClearance.errorMsg", "Gagal mengirim permohonan"), description: String(err), variant: "destructive" });
      },
      onSettled: () => setSubmitting(false),
    });
  }

  const PELABUHAN_OPTIONS = [
    "Tanjung Priok", "Tanjung Perak", "Belawan", "Makassar",
    "Soekarno-Hatta (Bandara)", "Halim Perdanakusuma",
    "Juanda (Bandara)", "Ngurah Rai (Bandara)", "Lainnya",
  ];

  const MATA_UANG = ["USD", "EUR", "SGD", "JPY", "CNY", "IDR"];

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#F7F9FC 0%,#F0F4F9 100%)" }}>
      <PageSeo path="/custom-clearance" />

      {/* Top bar */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #0A2444 0%, #0B3D6B 45%, #0D5FA0 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 2px 20px rgba(10,36,68,0.28), 0 1px 4px rgba(10,36,68,0.18)",
        }}
      >
        <div className="h-[2.5px] w-full" style={{ background: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 40%, rgba(251,191,36,0.3) 80%, transparent 100%)" }} />
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setLocation("/jasa")}
            className="flex items-center gap-1.5 text-sm font-medium transition-all duration-150 rounded-lg px-2.5 py-1.5"
            style={{ color: "rgba(255,255,255,0.72)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
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
              <ClipboardList className="h-4 w-4" style={{ color: "#FBBF24" }} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ color: "rgba(255,255,255,0.97)" }}>{t("customClearance.headerTitle", "Custom Clearance Proses")}</p>
              <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.48)", letterSpacing: "0.05em" }}>{t("customClearance.headerSubtitle", "Pengurusan Kepabeanan Resmi — PPJK Bersertifikat")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 pb-24">

        {/* Info Banner */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <Package className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">{t("customClearance.infoBannerTitle", "Layanan Kepabeanan Lengkap oleh PPJK Resmi")}</p>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              {t("customClearance.infoBannerDesc", "Kami menangani seluruh proses kepabeanan: pembuatan dokumen PIB/PEB, penanganan fisik di pelabuhan, hingga layanan undername bagi perusahaan yang belum memiliki izin importir/eksportir sendiri.")}
            </p>
          </div>
        </div>

        {/* ── Step 1: Pilih Layanan ─────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <h2 className="font-semibold text-base flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">1</div>
            {t("customClearance.step1Title", "Pilih Jenis Layanan")}
          </h2>
          <p className="text-xs text-muted-foreground -mt-1">{t("customClearance.step1Subtitle", "Pilih satu atau lebih layanan yang Anda butuhkan")}</p>

          <div className="space-y-3">
            {SERVICE_OPTIONS.map((opt) => {
              const isSelected = selectedServices.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    toggleService(opt.key);
                    if (!selectedServices.includes(opt.key)) {
                      setTimeout(() => {
                        detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }
                  }}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all flex items-start gap-3 relative ${
                    isSelected
                      ? opt.color + " ring-2 ring-offset-1 ring-orange-400"
                      : "border-border hover:border-orange-200 bg-white"
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Icon */}
                  <span className={`shrink-0 mt-0.5 ${isSelected ? "" : "text-muted-foreground"}`}>{opt.icon}</span>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{opt.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isSelected ? "bg-white/60 border-current" : "bg-muted/50 border-border text-muted-foreground"
                      }`}>{opt.badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedServices.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">{t("customClearance.selectedLabel", "Dipilih:")}</span>
              {selectedServices.map((s) => (
                <span key={s} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                  {SERVICE_OPTIONS.find((o) => o.key === s)?.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Step 2: Detail per Layanan ────────────────────────────── */}
        {selectedServices.length > 0 && (
          <div ref={detailSectionRef} className="space-y-4">

            {/* ─── Pembuatan Dokumen PIB / PEB ─────────────────────── */}
            {selectedServices.includes("pib_peb") && (
              <div className="rounded-2xl border border-border bg-white p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-base text-blue-900">{t("customClearance.svc1Title", "Pembuatan Dokumen PIB / PEB")}</h3>
                </div>

                {/* Arah */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t("customClearance.activityType", "Jenis Kegiatan")} <span className="text-red-500">*</span></Label>
                  <div className="flex gap-3">
                    {(["Impor", "Ekspor"] as Arah[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setPibPebArah(a)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          pibPebArah === a
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-border bg-white text-muted-foreground hover:border-blue-300"
                        }`}
                      >
                        {a === "Impor" ? `🚢 ${t("customClearance.importActivity", "Impor (PIB)")}` : `✈️ ${t("customClearance.exportActivity", "Ekspor (PEB)")}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.goodsType", "Jenis / Nama Barang")} <span className="text-red-500">*</span></Label>
                    <Input
                      value={pibPebJenisBarang}
                      onChange={(e) => setPibPebJenisBarang(e.target.value)}
                      placeholder={t("customClearance.phGoods1")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.hsCode", "HS Code (jika sudah diketahui)")}</Label>
                    <Input
                      value={pibPebHsCode}
                      onChange={(e) => setPibPebHsCode(e.target.value)}
                      placeholder={t("customClearance.phHsCode")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      {pibPebArah === "Impor" ? t("customClearance.cifValue", "Nilai CIF") : t("customClearance.fobValue", "Nilai FOB")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={pibPebNilai}
                        onChange={(e) => setPibPebNilai(e.target.value)}
                        placeholder={t("customClearance.phValueNumber")}
                        type="number"
                        min="0"
                        className="flex-1"
                      />
                      <select
                        value={pibPebMataUang}
                        onChange={(e) => setPibPebMataUang(e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {MATA_UANG.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  {pibPebMataUang !== "IDR" && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">{t("customClearance.labelExchangeRate").replace("{currency}", pibPebMataUang)}</Label>
                      <Input
                        value={pibPebKurs}
                        onChange={(e) => setPibPebKurs(e.target.value)}
                        type="number"
                        min="0"
                        placeholder={t("customClearance.phExchangeRate")}
                      />
                    </div>
                  )}
                  {pibPebArah === "Impor" && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">{t("customClearance.importDutyRate", "Tarif Bea Masuk (%)")}</Label>
                      <select
                        value={pibPebBMRate}
                        onChange={(e) => setPibPebBMRate(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="0">{t("customClearance.freeRate", "0% — Bebas BM (ASEAN / FTA)")}</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                        <option value="25">25%</option>
                        <option value="30">30%</option>
                        <option value="40">40%</option>
                        <option value="50">50%</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.goodsWeight", "Berat Barang (kg)")}</Label>
                    <Input
                      value={pibPebBerat}
                      onChange={(e) => setPibPebBerat(e.target.value)}
                      placeholder={t("customClearance.phWeight")}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{pibPebArah === "Impor" ? t("customClearance.destinationPort", "Pelabuhan Tujuan") : t("customClearance.loadingPort", "Pelabuhan Muat")}</Label>
                    <select
                      value={pibPebPelabuhan}
                      onChange={(e) => setPibPebPelabuhan(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PELABUHAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{pibPebArah === "Impor" ? t("customClearance.originCountry", "Negara Asal") : t("customClearance.destinationCountry", "Negara Tujuan")}</Label>
                    <Input
                      value={pibPebNegara}
                      onChange={(e) => setPibPebNegara(e.target.value)}
                      placeholder={t("customClearance.phCountry1")}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.specialInstructions", "Catatan / Instruksi Khusus")}</Label>
                    <Textarea
                      value={pibPebCatatan}
                      onChange={(e) => setPibPebCatatan(e.target.value)}
                      rows={2}
                      placeholder={t("customClearance.phSpecialNotesPib")}
                    />
                  </div>
                </div>

                {/* ── Estimator Bea Masuk + Pajak ─────────────────── */}
                {pibEstimasi ? (
                  <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-200 bg-blue-100/60">
                      <Calculator className="h-4 w-4 text-blue-700" />
                      <span className="font-bold text-sm text-blue-900">{t("customClearance.estimatedCost", "Estimasi Biaya")} — {pibEstimasi.arah}</span>
                      <span className="ml-auto text-[10px] text-blue-600 font-medium">{t("customClearance.indicativeNote", "*indikatif")}</span>
                    </div>

                    <div className="px-4 py-4 space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("customClearance.valueCifLabel").replace("{type}", pibEstimasi.arah === "Impor" ? "CIF" : "FOB")}</span>
                        <span className="font-semibold text-foreground">
                          Rp {Math.round(pibEstimasi.cifIdr).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {pibEstimasi.arah === "Impor" && (
                        <>
                          <div className="flex justify-between text-xs border-t border-blue-200 pt-2">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.beaMasuk", "Bea Masuk")}
                              <span className="text-[10px] bg-blue-200/70 text-blue-700 px-1.5 py-0.5 rounded-full">{pibPebBMRate}%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(pibEstimasi.beaMasuk).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.ppnImpor", "PPN Impor")}
                              <span className="text-[10px] bg-blue-200/70 text-blue-700 px-1.5 py-0.5 rounded-full">11%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(pibEstimasi.ppn).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.pphPasal22Api", "PPh Pasal 22 (dengan API)")}
                              <span className="text-[10px] bg-blue-200/70 text-blue-700 px-1.5 py-0.5 rounded-full">2.5%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(pibEstimasi.pph22).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-blue-200 pt-2">
                            <span className="text-muted-foreground font-semibold">{t("customClearance.subTotalPajak", "Sub-Total Pajak & Bea")}</span>
                            <span className="font-semibold text-blue-800">Rp {Math.round(pibEstimasi.totalPajak).toLocaleString("id-ID")}</span>
                          </div>
                        </>
                      )}

                      <div className={`flex justify-between text-xs ${pibEstimasi.arah === "Ekspor" ? "border-t border-blue-200 pt-2" : ""}`}>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {t("customClearance.serviceDocFee", "Jasa Pembuatan Dokumen PIB/PEB")}
                          <span className="text-[10px] bg-blue-200/70 text-blue-700 px-1.5 py-0.5 rounded-full">
                            {pibEstimasi.arah === "Impor" ? "1.5% (min. Rp 2.5jt)" : "1% (min. Rp 1.5jt)"}
                          </span>
                        </span>
                        <span className="font-medium">Rp {Math.round(pibEstimasi.jasa).toLocaleString("id-ID")}</span>
                      </div>

                      <div className="mt-1 rounded-xl bg-blue-600 px-4 py-3 flex justify-between items-center">
                        <span className="text-white text-sm font-bold">{t("customClearance.estimatedLabel", "Total Estimasi")}</span>
                        <span className="text-white text-base font-black">
                          Rp {Math.round(pibEstimasi.grandTotal).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1">
                        <Info className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-700 leading-relaxed">
                          {t("customClearance.pibPebProcessNote", "Tarif BM, PPN, & PPh final ditentukan Bea Cukai berdasarkan HS Code & keputusan DJBC. PPh 2.5% berlaku bagi importir ber-API. Estimasi jasa belum termasuk biaya pengeluaran pelabuhan.")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : pibPebNilai && parseFloat(pibPebNilai) > 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("customClearance.calculating", "Menghitung estimasi...")}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Calculator className="h-3.5 w-3.5" />
                    {t("customClearance.enterValueToCalc", "Isi nilai {type} di atas untuk melihat estimasi Bea Masuk & pajak impor.").replace("{type}", pibPebArah === "Impor" ? "CIF" : "FOB")}
                  </div>
                )}

                {/* Dokumen PIB/PEB */}
                <div className="space-y-3 pt-1 border-t border-border">
                  <p className="text-xs font-semibold flex items-center gap-1.5 pt-1">
                    <FileText className="h-3.5 w-3.5" /> {t("customClearance.uploadDocs", "Upload Dokumen Pendukung")}
                  </p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("customClearance.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="AWB / Bill of Lading" value={docAWBBL} onChange={setDocAWBBL} t={t} />
                    <DocUploader label="Commercial Invoice" value={docInvoice} onChange={setDocInvoice} t={t} />
                    <DocUploader label="Packing List" value={docPackingList} onChange={setDocPackingList} t={t} />
                    <DocUploader label="COO / Sertifikat Asal Barang" value={docCOO} onChange={setDocCOO} t={t} />
                    <DocUploader label="LS / Surat Persetujuan LarTas" value={docLS} onChange={setDocLS} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    {t("customClearance.pibPebProcessNote", "Tim PPJK kami akan memproses pembuatan dokumen PIB/PEB setelah seluruh data dan dokumen diterima lengkap. Biaya jasa akan dikonfirmasi oleh tim dalam 1×24 jam kerja.")}
                  </p>
                </div>
              </div>
            )}

            {/* ─── Handling Clearance ──────────────────────────────── */}
            {selectedServices.includes("handling_clearance") && (
              <div className="rounded-2xl border border-border bg-white p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  <h3 className="font-semibold text-base text-teal-900">{t("customClearance.svc2Title", "Handling Clearance")}</h3>
                </div>

                {/* Arah */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t("customClearance.activityType", "Jenis Kegiatan")} <span className="text-red-500">*</span></Label>
                  <div className="flex gap-3">
                    {(["Impor", "Ekspor"] as Arah[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setHcArah(a)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          hcArah === a
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-border bg-white text-muted-foreground hover:border-teal-300"
                        }`}
                      >
                        {a === "Impor" ? `🚢 ${t("customClearance.clearanceImport", "Clearance Impor")}` : `✈️ ${t("customClearance.clearanceExport", "Clearance Ekspor")}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.goodsType", "Jenis / Nama Barang")} <span className="text-red-500">*</span></Label>
                    <Input
                      value={hcJenisBarang}
                      onChange={(e) => setHcJenisBarang(e.target.value)}
                      placeholder={t("customClearance.phGoods2")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.pibPebDocNum", "Nomor PIB / PEB (jika sudah ada)")}</Label>
                    <Input
                      value={hcNomPIBPEB}
                      onChange={(e) => setHcNomPIBPEB(e.target.value)}
                      placeholder={t("customClearance.phPibPebDocNum")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.customsLane", "Jalur Bea Cukai")}</Label>
                    <select
                      value={hcJalur}
                      onChange={(e) => setHcJalur(e.target.value as Jalur | "")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">{t("customClearance.laneUnknown", "Belum diketahui")}</option>
                      <option value="Hijau">{t("customClearance.laneGreen", "Jalur Hijau — tanpa pemeriksaan fisik")}</option>
                      <option value="Merah">{t("customClearance.laneRed", "Jalur Merah — dengan pemeriksaan fisik")}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.portAirport", "Pelabuhan / Bandara")}</Label>
                    <select
                      value={hcPelabuhan}
                      onChange={(e) => setHcPelabuhan(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PELABUHAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.specialInstructions", "Catatan / Instruksi Khusus")}</Label>
                    <Input
                      value={hcCatatan}
                      onChange={(e) => setHcCatatan(e.target.value)}
                      placeholder={t("customClearance.phSpecialNotesHc")}
                    />
                  </div>
                </div>

                {/* Dokumen Handling */}
                <div className="space-y-3 pt-1 border-t border-border">
                  <p className="text-xs font-semibold flex items-center gap-1.5 pt-1">
                    <FileText className="h-3.5 w-3.5" /> {t("customClearance.uploadDocs", "Upload Dokumen Pendukung")}
                  </p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("customClearance.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="Dokumen PIB / PEB" value={docPIBPEB} onChange={setDocPIBPEB} t={t} />
                    <DocUploader label="AWB / Bill of Lading" value={docAWBBL} onChange={setDocAWBBL} t={t} />
                    <DocUploader label="Invoice & Packing List" value={docInvoice} onChange={setDocInvoice} t={t} />
                    <DocUploader label="LS / Surat Persetujuan (jika ada)" value={docLS} onChange={setDocLS} t={t} />
                  </div>
                </div>

                <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-700">
                    {t("customClearance.handlingServiceDesc", "Layanan ini mencakup: koordinasi dengan pihak bea cukai, pembayaran bea masuk & pajak impor, koordinasi pemeriksaan fisik (jalur merah), serta pengeluaran barang hingga ke gudang Anda.")}
                  </p>
                </div>

                {/* ── Estimasi biaya handling clearance ── */}
                <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 space-y-2">
                  <p className="text-xs font-bold text-teal-800 uppercase tracking-wide">{t("customClearance.estimatedCost", "Estimasi Biaya")} — {t("customClearance.svc2Title", "Handling Clearance")} {hcEstimasi.arah === "Impor" ? t("customClearance.hcArahImpor") : t("customClearance.hcArahEkspor")}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-teal-700">
                      Jasa Handling
                      {hcEstimasi.jalur ? ` (Jalur ${hcEstimasi.jalur})` : ""}
                    </span>
                    <span className="font-semibold text-teal-900">Rp {hcEstimasi.fee.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-teal-200 pt-2 text-sm font-bold">
                    <span className="text-teal-800">{t("customClearance.estimatedLabel", "Total Estimasi")}</span>
                    <span className="text-teal-900 text-base">Rp {hcEstimasi.fee.toLocaleString("id-ID")}</span>
                  </div>
                  <p className="text-[11px] text-teal-600">{t("customClearance.hcFeeNote")}</p>
                </div>
              </div>
            )}

            {/* ─── Undername Impor / Ekspor ─────────────────────────── */}
            {selectedServices.includes("undername") && (
              <div className="rounded-2xl border border-border bg-white p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-base text-orange-900">{t("customClearance.svc3Title", "Undername Impor / Ekspor")}</h3>
                </div>

                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-800">
                    {t("customClearance.underNameInfoDesc", "Layanan Undername — Kami menyediakan fasilitas impor/ekspor menggunakan API (Angka Pengenal Importir) / NIK resmi perusahaan kami. Cocok untuk perusahaan yang belum memiliki izin importir/eksportir sendiri.")}
                  </p>
                </div>

                {/* Arah */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t("customClearance.underNameType", "Jenis Undername")} <span className="text-red-500">*</span></Label>
                  <div className="flex gap-3">
                    {(["Impor", "Ekspor"] as Arah[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setUnArah(a)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          unArah === a
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-border bg-white text-muted-foreground hover:border-orange-300"
                        }`}
                      >
                        {a === "Impor" ? `🚢 ${t("customClearance.underNameImport", "Undername Impor")}` : `✈️ ${t("customClearance.underNameExport", "Undername Ekspor")}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.goodsType", "Jenis / Nama Barang")} <span className="text-red-500">*</span></Label>
                    <Input
                      value={unJenisBarang}
                      onChange={(e) => setUnJenisBarang(e.target.value)}
                      placeholder={t("customClearance.phGoods3")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.hsCode", "HS Code (jika sudah diketahui)")}</Label>
                    <Input
                      value={unHsCode}
                      onChange={(e) => setUnHsCode(e.target.value)}
                      placeholder={t("customClearance.phHsCode")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      {unArah === "Impor" ? t("customClearance.cifValue", "Nilai CIF") : t("customClearance.fobValue", "Nilai FOB")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={unNilaiAngka}
                        onChange={(e) => setUnNilaiAngka(e.target.value)}
                        placeholder={t("customClearance.phValueNumber2")}
                        type="number"
                        min="0"
                        className="flex-1"
                      />
                      <select
                        value={unMataUang}
                        onChange={(e) => setUnMataUang(e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {["USD","EUR","SGD","JPY","CNY","IDR"].map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  {unMataUang !== "IDR" && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">{t("customClearance.labelExchangeRate").replace("{currency}", unMataUang)}</Label>
                      <Input
                        value={unKurs}
                        onChange={(e) => setUnKurs(e.target.value)}
                        type="number"
                        min="0"
                        placeholder={t("customClearance.phExchangeRate")}
                      />
                    </div>
                  )}
                  {unArah === "Impor" && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">{t("customClearance.importDutyRate", "Tarif Bea Masuk (%)")}</Label>
                      <select
                        value={unBMRate}
                        onChange={(e) => setUnBMRate(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="0">{t("customClearance.freeRate", "0% — Bebas BM (ASEAN / FTA)")}</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                        <option value="25">25%</option>
                        <option value="30">30%</option>
                        <option value="40">40%</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.goodsWeight", "Berat Barang (kg)")}</Label>
                    <Input
                      value={unBerat}
                      onChange={(e) => setUnBerat(e.target.value)}
                      placeholder={t("customClearance.phWeight2")}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{unArah === "Impor" ? t("customClearance.originCountry", "Negara Asal") : t("customClearance.destinationCountry", "Negara Tujuan")} <span className="text-red-500">*</span></Label>
                    <Input
                      value={unNegara}
                      onChange={(e) => setUnNegara(e.target.value)}
                      placeholder={t("customClearance.phCountry2")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{unArah === "Impor" ? t("customClearance.destinationPort", "Pelabuhan Tujuan") : t("customClearance.loadingPort", "Pelabuhan Muat")}</Label>
                    <select
                      value={unPelabuhan}
                      onChange={(e) => setUnPelabuhan(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PELABUHAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">{t("customClearance.underNameReason", "Alasan Menggunakan Undername")}</Label>
                    <Textarea
                      value={unAlasan}
                      onChange={(e) => setUnAlasan(e.target.value)}
                      rows={2}
                      placeholder={t("customClearance.phSpecialNotesUn")}
                    />
                  </div>
                </div>

                {/* ── Estimator Biaya ─────────────────────────────── */}
                {unEstimasi ? (
                  <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-200 bg-orange-100/60">
                      <Calculator className="h-4 w-4 text-orange-700" />
                      <span className="font-bold text-sm text-orange-900">{t("customClearance.estimatedCost", "Estimasi Biaya")} Undername {unEstimasi.arah}</span>
                      <span className="ml-auto text-[10px] text-orange-600 font-medium">{t("customClearance.indicativeNote", "*indikatif")}</span>
                    </div>

                    <div className="px-4 py-4 space-y-2.5">
                      {/* Nilai CIF/FOB */}
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("customClearance.valueCifLabel").replace("{type}", unEstimasi.arah === "Impor" ? "CIF" : "FOB")}</span>
                        <span className="font-semibold text-foreground">
                          Rp {Math.round(unEstimasi.cifIdr).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {unEstimasi.arah === "Impor" && (
                        <>
                          <div className="flex justify-between text-xs border-t border-orange-200 pt-2">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.beaMasuk", "Bea Masuk")}
                              <span className="text-[10px] bg-orange-200/70 text-orange-700 px-1.5 py-0.5 rounded-full">{unBMRate}%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(unEstimasi.beaMasuk).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.ppnImpor", "PPN Impor")}
                              <span className="text-[10px] bg-orange-200/70 text-orange-700 px-1.5 py-0.5 rounded-full">11%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(unEstimasi.ppn).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              {t("customClearance.pphPasal22NonApi", "PPh Pasal 22 (tanpa API)")}
                              <span className="text-[10px] bg-orange-200/70 text-orange-700 px-1.5 py-0.5 rounded-full">7.5%</span>
                            </span>
                            <span className="font-medium">Rp {Math.round(unEstimasi.pph22).toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-orange-200 pt-2">
                            <span className="text-muted-foreground font-semibold">{t("customClearance.subTotalPajak", "Sub-Total Pajak & Bea")}</span>
                            <span className="font-semibold text-orange-800">Rp {Math.round(unEstimasi.totalPajak).toLocaleString("id-ID")}</span>
                          </div>
                        </>
                      )}

                      <div className={`flex justify-between text-xs ${unEstimasi.arah === "Ekspor" ? "border-t border-orange-200 pt-2" : ""}`}>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {t("customClearance.serviceUndernameFee", "Jasa Undername {direction}").replace("{direction}", unEstimasi.arah)}
                          <span className="text-[10px] bg-orange-200/70 text-orange-700 px-1.5 py-0.5 rounded-full">
                            {unEstimasi.arah === "Impor" ? "2%" : "1.5%"} (min. Rp {unEstimasi.arah === "Impor" ? "5" : "3"}jt)
                          </span>
                        </span>
                        <span className="font-medium">Rp {Math.round(unEstimasi.jasa).toLocaleString("id-ID")}</span>
                      </div>

                      {/* Grand Total */}
                      <div className="mt-1 rounded-xl bg-orange-600 px-4 py-3 flex justify-between items-center">
                        <span className="text-white text-sm font-bold">{t("customClearance.estimatedLabel", "Total Estimasi")}</span>
                        <span className="text-white text-base font-black">
                          Rp {Math.round(unEstimasi.grandTotal).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 pt-1">
                        <Info className="h-3 w-3 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-700 leading-relaxed">
                          {t("customClearance.underNameServiceNote", "Tarif BM, PPN, PPh final ditentukan oleh Bea Cukai berdasarkan HS Code dan keputusan DJBC. Jasa undername belum termasuk biaya trucking, gudang, dan pengeluaran pelabuhan.")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : unNilaiAngka && parseFloat(unNilaiAngka) > 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/50 px-4 py-3 text-xs text-orange-700 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("customClearance.calculating", "Menghitung estimasi...")}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Calculator className="h-3.5 w-3.5" />
                    {t("customClearance.enterValueToCalc", "Isi nilai {type} di atas untuk melihat estimasi Bea Masuk & pajak impor.").replace("{type}", unArah === "Impor" ? "CIF" : "FOB")}
                  </div>
                )}

                {/* Dokumen Undername */}
                <div className="space-y-3 pt-1 border-t border-border">
                  <p className="text-xs font-semibold flex items-center gap-1.5 pt-1">
                    <FileText className="h-3.5 w-3.5" /> {t("customClearance.uploadDocsCompany", "Dokumen Perusahaan Anda")}
                  </p>
                  {!isAuthenticated() && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("customClearance.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DocUploader label="NPWP Perusahaan" required value={docNPWP} onChange={setDocNPWP} t={t} />
                    <DocUploader label="NIB / Akta Perusahaan" required value={docNIB} onChange={setDocNIB} t={t} />
                    <DocUploader label="Commercial Invoice" value={docInvoice} onChange={setDocInvoice} t={t} />
                    <DocUploader label="Packing List" value={docPackingList} onChange={setDocPackingList} t={t} />
                    <DocUploader label="AWB / Bill of Lading" value={docAWBBL} onChange={setDocAWBBL} t={t} />
                    <DocUploader label="Dokumen Lainnya" value={docLainnya} onChange={setDocLainnya} t={t} />
                  </div>
                </div>

                <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 flex items-start gap-2.5">
                  <FileCheck className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    {t("customClearance.underNameServiceNote", "Biaya jasa undername mencakup: penggunaan API/NIK, pengurusan dokumen, dan handling kepabeanan. Akan dikonfirmasi tim kami berdasarkan jenis barang dan nilai transaksi.")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Data Pemesan ─────────────────────────────────── */}
        {selectedServices.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">3</div>
              {t("customClearance.step3Title", "Data Pemesan / PIC")}
            </h2>
            {portalUser && (
              <div className="flex items-start gap-2 text-xs text-sky-700 bg-sky-50 rounded-xl px-3 py-2.5 border border-sky-200">
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sky-500" />
                <span>{t("customClearance.profileAutoFilled", "Data diambil dari profil akun Anda.")}</span>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("customClearance.picName", "Nama PIC")} <span className="text-red-500">*</span></Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("customClearance.fullNamePlaceholder", "Nama lengkap")}
                  readOnly={!!portalUser?.name}
                  className={portalUser?.name ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("customClearance.companyNameLabel", "Nama Perusahaan")}</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("customClearance.companyPlaceholder", "PT. ...")}
                  readOnly={!!portalUser?.company}
                  className={portalUser?.company ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("customClearance.emailLabel")} <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t("customClearance.emailPlaceholder", "email@perusahaan.com")}
                  readOnly={!!portalUser?.email}
                  className={portalUser?.email ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("customClearance.phoneLabel")} <span className="text-red-500">*</span></Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t("customClearance.phonePlaceholder", "+62 8xx xxxx xxxx")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("customClearance.additionalNotes", "Catatan Tambahan")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("customClearance.additionalNotesPlaceholder", "Informasi tambahan untuk tim kami (opsional)")}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* ── Step 4: Ringkasan & Submit ───────────────────────────── */}
        {selectedServices.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">4</div>
              {t("customClearance.step4Title", "Ringkasan & Kirim Permohonan")}
            </h2>

            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-muted-foreground shrink-0">{t("customClearance.serviceSelected", "Layanan dipilih")}</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {selectedServices.map((s) => (
                    <Badge key={s} variant="secondary">
                      {SERVICE_OPTIONS.find((o) => o.key === s)?.title}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedServices.includes("pib_peb") && pibPebJenisBarang && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("customClearance.goodsInfo", "PIB/PEB — Barang")}</span>
                  <span className="font-medium">{pibPebJenisBarang} ({pibPebArah})</span>
                </div>
              )}
              {selectedServices.includes("handling_clearance") && hcJalur && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("customClearance.handlingLaneLabel")}</span>
                  <Badge className={hcJalur === "Hijau" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                    Jalur {hcJalur}
                  </Badge>
                </div>
              )}
              {selectedServices.includes("undername") && unNegara && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("customClearance.undernamCountryLabel")}</span>
                  <span className="font-medium">{unNegara} ({unArah})</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-muted-foreground text-xs">
                <span>{t("customClearance.estimatedCost", "Estimasi Biaya")}</span>
                <span>{t("customClearance.confirmedWithinHours", "Dikonfirmasi dalam 1×24 jam kerja")}</span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                {t("customClearance.costNote", "Biaya jasa bersifat indikatif dan akan dikonfirmasi oleh tim PPJK kami setelah verifikasi dokumen dan jenis barang. Tim kami akan menghubungi Anda dalam 1×24 jam kerja.")}
              </span>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || isVendor}
            >
              {isVendor ? (
                <><Info className="h-4 w-4" /> {t("customClearance.vendorInfoOnly", "Informasi untuk Vendor")}</>
              ) : submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("customClearance.submitting", "Mengirim Permohonan...")}</>
              ) : (
                <><ChevronRight className="h-4 w-4" /> {t("customClearance.submitBtn", "Kirim Permohonan Custom Clearance")}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
