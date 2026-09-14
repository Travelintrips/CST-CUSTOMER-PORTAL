import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated } from "@/lib/auth";
import { useGetPortalMe, useCreateLogisticOrder } from "@shared/api-client-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { resolveImageUrl } from "@/lib/utils";
import {
  Ship, Plane, ArrowLeft, Plus, Trash2, ChevronRight, ChevronLeft,
  Upload, FileText, AlertTriangle, Check, Loader2,
  MapPin, User, Weight, LayoutGrid, ImagePlus,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { staticAsset } from "@/lib/staticAssets";

/* ─── Types ──────────────────────────────────────────────────────── */
type Direction = "Impor" | "Ekspor" | "Domestic";
type Mode = "Sea" | "Air";
type SeaType = "LCL" | "FCL";
type Variant = "D2D" | "D2P" | "P2D" | "P2P";
type GoodsCategory = "Non DG" | "DG";

interface CargoItem {
  id: string;
  grossWeight: string;
  kolli: string;
  length: string;
  width: string;
  height: string;
}

interface UploadedDoc {
  name: string;
  objectPath: string;
  uploading: boolean;
  error?: string;
}

/* ─── Constants ──────────────────────────────────────────────────── */
const VARIANT_LABELS: Record<Variant, string> = {
  D2D: "Door to Door",
  D2P: "Door to Port",
  P2D: "Port to Door",
  P2P: "Port to Port",
};

const VARIANT_DESCS: Record<Variant, string> = {
  D2D: "Pengiriman dari pintu pengirim ke pintu penerima",
  D2P: "Pengiriman dari pintu pengirim ke pelabuhan/bandara tujuan",
  P2D: "Pengiriman dari pelabuhan/bandara asal ke pintu penerima",
  P2P: "Pengiriman antar pelabuhan/bandara",
};

function newItem(): CargoItem {
  return { id: crypto.randomUUID(), grossWeight: "", kolli: "", length: "", width: "", height: "" };
}

/* ─── DocUploader ────────────────────────────────────────────────── */
function DocUploader({
  label, required, hint, accept, value, onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  accept?: string;
  value: UploadedDoc | null;
  onChange: (doc: UploadedDoc | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    onChange({ name: file.name, objectPath: "", uploading: true });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/portal/order-upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? "Upload gagal");
      }
      const { objectPath } = await res.json() as { objectPath: string };
      onChange({ name: file.name, objectPath, uploading: false });
    } catch (err) {
      onChange({ name: file.name, objectPath: "", uploading: false, error: String(err) });
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-semibold">{label}</Label>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <div
        onClick={() => ref.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
          value?.objectPath
            ? "border-emerald-400 bg-emerald-50"
            : value?.error
            ? "border-red-300 bg-red-50"
            : "border-border hover:border-primary/50 bg-muted/30"
        }`}
      >
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept={accept ?? "application/pdf,image/*,.doc,.docx"}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
        />
        {value?.uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : value?.objectPath ? (
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
        ) : (
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {value?.name ? (
            <p className={`text-xs font-medium truncate ${value.objectPath ? "text-emerald-700" : value.error ? "text-red-600" : "text-foreground"}`}>
              {value.name}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Klik untuk upload file</p>
          )}
          {value?.error && <p className="text-[10px] text-red-500">{value.error}</p>}
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="text-muted-foreground hover:text-destructive ml-1 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function FreightForwarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { editMode, content, updateField, uploadImage } = useEditMode();
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const logoFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleDirectionLogoUpload(dirLabel: string, file: File) {
    setUploadingLogo(dirLabel);
    try {
      const path = await uploadImage(file);
      updateField(`ff_direction_logo_${dirLabel}`, path);
    } catch {
      toast({ title: t("freightForwarding.failUploadLogo", "Gagal upload logo"), variant: "destructive" });
    } finally {
      setUploadingLogo(null);
    }
  }

  async function handleModeLogoUpload(modeLabel: string, file: File) {
    setUploadingLogo(`mode_${modeLabel}`);
    try {
      const path = await uploadImage(file);
      updateField(`ff_mode_logo_${modeLabel}`, path);
    } catch {
      toast({ title: t("freightForwarding.failUploadLogo", "Gagal upload logo"), variant: "destructive" });
    } finally {
      setUploadingLogo(null);
    }
  }

  async function handleVariantLogoUpload(variantLabel: string, file: File) {
    setUploadingLogo(`variant_${variantLabel}`);
    try {
      const path = await uploadImage(file);
      updateField(`ff_variant_logo_${variantLabel}`, path);
    } catch {
      toast({ title: t("freightForwarding.failUploadLogo", "Gagal upload logo"), variant: "destructive" });
    } finally {
      setUploadingLogo(null);
    }
  }

  // Navigation state
  const search = useSearch();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [seaType, setSeaType] = useState<SeaType | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);

  // Form state
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [commodity, setCommodity] = useState("");
  const [goodsCategory, setGoodsCategory] = useState<GoodsCategory>("Non DG");
  const [freightPrice, setFreightPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CargoItem[]>([newItem()]);

  // Customer info (pre-filled if logged in)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Documents
  const [docInvoice, setDocInvoice] = useState<UploadedDoc | null>(null);
  const [docPackingList, setDocPackingList] = useState<UploadedDoc | null>(null);
  const [docMsds, setDocMsds] = useState<UploadedDoc | null>(null);
  const [docCoa, setDocCoa] = useState<UploadedDoc | null>(null);
  const [docOther, setDocOther] = useState<UploadedDoc | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // ── Read ?direction= param from jasa page shortcut ────────────────
  useEffect(() => {
    const params = new URLSearchParams(search);
    const dir = params.get("direction") as Direction | null;
    if (dir && (["Impor", "Ekspor", "Domestic"] as string[]).includes(dir)) {
      setDirection(dir);
      setStep(2);
    }
  }, []);

  // ── Load profile → pre-fill read-only fields ──────────────────────
  const authed = isAuthenticated();
  const { data: portalUser } = useGetPortalMe({
    query: { queryKey: ["portalMe"], enabled: authed },
    request: { credentials: "include" },
  });
  const createOrder = useCreateLogisticOrder();

  useEffect(() => {
    if (!portalUser) return;
    setCustomerName((prev) => prev || (portalUser.name ?? ""));
    setCustomerEmail((prev) => prev || (portalUser.email ?? ""));
    setCompanyName((prev) => prev || (portalUser.company ?? ""));
    setCustomerPhone((prev) => prev || (portalUser.phone ?? ""));
  }, [portalUser]);

  const isDG = goodsCategory === "DG";

  // ── Cargo calculations ────────────────────────────────────────────
  const totalGrossWeight = items.reduce((sum, it) => {
    const w = parseFloat(it.grossWeight) || 0;
    return sum + w;
  }, 0);

  const totalVolumeCBM = items.reduce((sum, it) => {
    const l = parseFloat(it.length) || 0;
    const w = parseFloat(it.width) || 0;
    const h = parseFloat(it.height) || 0;
    const k = parseFloat(it.kolli) || 1;
    return sum + (l * w * h * k) / 1_000_000;
  }, 0);

  // Air freight standard: 1 CBM = 167 kg volumetric weight
  const volumetricWeight = totalVolumeCBM * 167;
  const chargeableWeight = Math.max(totalGrossWeight, volumetricWeight);
  const freightPriceNum = parseFloat(freightPrice) || 0;
  // For Air: price per kg × chargeable weight; For Sea: price per CBM × volume
  const estimasiTotal = mode === "Air"
    ? freightPriceNum * chargeableWeight
    : freightPriceNum * totalVolumeCBM;

  function fmtIDR(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }
  function fmtNum(n: number, dec = 3) {
    return n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: dec });
  }

  // Available variants per direction
  function availableVariants(): Variant[] {
    if (direction === "Domestic") return ["D2P", "P2P"];
    return ["D2D", "D2P", "P2D", "P2P"];
  }

  function modeLabel(m: Mode) {
    return m === "Sea" ? "Sea Freight" : "Air Freight";
  }

  function freightLabel() {
    return mode === "Sea"
      ? t("freightForwarding.priceSeaFreight", "Harga Sea Freight")
      : t("freightForwarding.priceAirFreight", "Harga Air Freight");
  }

  // Stepper display
  const STEP_LABELS = [
    t("freightForwarding.stepDirection", "Arah"),
    t("freightForwarding.stepMode", "Mode"),
    t("freightForwarding.stepService", "Layanan"),
    t("freightForwarding.stepFormDocs", "Form & Dokumen"),
  ];

  // Item helpers
  function updateItem(id: string, field: keyof CargoItem, val: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: val } : it));
  }
  function addItem() { setItems((prev) => [...prev, newItem()]); }
  function removeItem(id: string) { setItems((prev) => prev.filter((it) => it.id !== id)); }

  // Validation per step
  function missingFields(): string[] {
    const missing: string[] = [];
    if (!senderName) missing.push(t("freightForwarding.fieldSenderName", "Nama Pengirim"));
    if (!senderAddress) missing.push(t("freightForwarding.fieldSenderAddress", "Alamat Pengirim"));
    if (!receiverName) missing.push(t("freightForwarding.fieldReceiverName", "Nama Penerima"));
    if (!receiverAddress) missing.push(t("freightForwarding.fieldReceiverAddress", "Alamat Penerima"));
    if (!commodity) missing.push(t("freightForwarding.fieldCommodity", "Nama Barang / Komoditi"));
    if (!docInvoice?.objectPath) missing.push(t("freightForwarding.fieldDocInvoice", "Dokumen Invoice"));
    if (!docPackingList?.objectPath) missing.push(t("freightForwarding.fieldDocPackingList", "Dokumen Packing List"));
    if (isDG && !docMsds?.objectPath) missing.push(t("freightForwarding.fieldDocMsds", "Dokumen MSDS/SDS"));
    if (isDG && !docCoa?.objectPath) missing.push(t("freightForwarding.fieldDocCoa", "Dokumen COA"));
    if (!customerName) missing.push(t("freightForwarding.fieldPicName", "Nama PIC"));
    if (!customerEmail) missing.push(t("freightForwarding.fieldEmail", "Email"));
    if (!customerPhone) missing.push(t("freightForwarding.fieldPhone", "Telepon / WhatsApp"));
    if (items.some((it) => !it.grossWeight || !it.kolli)) missing.push(t("freightForwarding.fieldCargoItems", "Berat & Kolli semua item kargo"));
    return missing;
  }

  function canProceed() {
    if (step === 1) return !!direction;
    if (step === 2) return !!mode;
    if (step === 3) return !!variant && (mode !== "Sea" || !!seaType);
    return missingFields().length === 0;
  }

  async function handleSubmit() {
    if (!canProceed()) {
      toast({ title: t("freightForwarding.fillAllRequired", "Lengkapi semua data yang wajib diisi"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    {
      const seaTypeLabel = mode === "Sea" && seaType ? ` (${seaType})` : "";
      const serviceLabel = `Freight Forwarding — ${direction} ${modeLabel(mode!)}${seaTypeLabel} ${VARIANT_LABELS[variant!]}`;
      const docsList = [
        docInvoice ? `Invoice: ${docInvoice.objectPath}` : null,
        docPackingList ? `Packing List: ${docPackingList.objectPath}` : null,
        docMsds ? `MSDS/SDS: ${docMsds.objectPath}` : null,
        docCoa ? `COA: ${docCoa.objectPath}` : null,
        docOther ? `Lainnya: ${docOther.objectPath}` : null,
      ].filter(Boolean).join("\n");

      const ffData = JSON.stringify({
        direction, mode: modeLabel(mode!), ...(mode === "Sea" && seaType ? { seaType } : {}), variant: VARIANT_LABELS[variant!],
        sender: { name: senderName, address: senderAddress },
        receiver: { name: receiverName, address: receiverAddress },
        commodity, goodsCategory,
        cargoItems: items.map((it) => ({
          grossWeight: it.grossWeight, kolli: it.kolli,
          dimensions: `${it.length}x${it.width}x${it.height} cm`,
        })),
        totalGrossWeight: `${fmtNum(totalGrossWeight, 1)} kg`,
        totalVolumeCBM: `${fmtNum(totalVolumeCBM)} CBM`,
        ...(mode === "Air" ? {
          volumetricWeight: `${fmtNum(volumetricWeight, 1)} kg`,
          chargeableWeight: `${fmtNum(chargeableWeight, 1)} kg`,
          estimasiTotal: fmtIDR(estimasiTotal),
        } : {
          estimasiTotal: fmtIDR(estimasiTotal),
        }),
        freightPrice: `${freightPrice} IDR/${mode === "Air" ? "kg" : "CBM"}`,
        documents: { invoice: docInvoice?.objectPath, packingList: docPackingList?.objectPath, msds: docMsds?.objectPath, coa: docCoa?.objectPath, other: docOther?.objectPath },
      });

      const contactLines = [
        `PIC: ${customerName}`,
        companyName ? `Perusahaan: ${companyName}` : null,
        `Email: ${customerEmail}`,
        `Telepon: ${customerPhone}`,
      ].filter(Boolean).join("\n");

      const fullNotes = [
        notes || null,
        `[KONTAK PEMESAN]\n${contactLines}`,
        `[FF DATA]\n${ffData}`,
        docsList ? `[DOKUMEN]\n${docsList}` : null,
      ].filter(Boolean).join("\n\n");

      const itemPrice = estimasiTotal > 0 ? estimasiTotal : (parseFloat(freightPrice) || 0);

      createOrder.mutate({ data: {
        companyName: companyName || "—",
        customerName,
        email: customerEmail,
        phone: customerPhone,
        shipmentType: serviceLabel,
        origin: senderName || senderAddress || "—",
        destination: receiverName || receiverAddress || "—",
        commodity: commodity || null,
        notes: fullNotes || null,
        subtotal: itemPrice,
        tax: 0,
        grandTotal: itemPrice,
        items: [{
          category: "Freight Forwarding",
          serviceName: serviceLabel,
          calculatorType: "manual",
          inputData: {},
          calculationResult: { unitPrice: itemPrice },
          subtotal: itemPrice,
        }],
      }}, {
        onSuccess: (data: unknown) => {
          localStorage.setItem("last_order", JSON.stringify(data));
          toast({ title: t("freightForwarding.orderSuccess", "Pesanan freight forwarding berhasil dikirim!") });
          setLocation("/logistic-order-success");
        },
        onError: (err: unknown) => {
          toast({ title: t("freightForwarding.orderFail", "Gagal mengirim pesanan"), description: String(err), variant: "destructive" });
        },
        onSettled: () => setSubmitting(false),
      });
    }
  }

  /* ── STEP 1: Direction ─────────────────────────────────────────── */
  const DIRECTIONS: { label: Direction; icon: string; desc: string; color: string }[] = [
    { label: "Impor",    icon: "📥", desc: t("freightForwarding.dirImporDesc", "Barang masuk ke Indonesia dari luar negeri"),   color: "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800" },
    { label: "Ekspor",   icon: "📤", desc: t("freightForwarding.dirEksporDesc", "Barang keluar dari Indonesia ke luar negeri"),   color: "border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800" },
    { label: "Domestic", icon: "🗺️", desc: t("freightForwarding.dirDomesticDesc", "Pengiriman kargo antar kota dalam Indonesia"), color: "border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800" },
  ];

  /* ── STEP 2: Mode ─────────────────────────────────────────────── */
  const MODES: { label: Mode; icon: React.ReactNode; desc: string; detail: string; defaultImg: string }[] = [
    {
      label: "Sea",
      icon: <Ship className="h-8 w-8 text-blue-600" />,
      desc: "Sea Freight",
      detail: t("freightForwarding.seaDetail", "Pengiriman via kapal laut. Kapasitas besar, biaya lebih ekonomis."),
      defaultImg: staticAsset("images/sea-freight.png"),
    },
    {
      label: "Air",
      icon: <Plane className="h-8 w-8 text-sky-500" />,
      desc: "Air Freight",
      detail: t("freightForwarding.airDetail", "Pengiriman via pesawat. Lebih cepat, ideal untuk barang sensitif waktu."),
      defaultImg: staticAsset("images/air-freight.png"),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#F4F8FD 0%,#EEF4FA 100%)" }}>
      <PageSeo path="/freight-forwarding" />
      {/* Navbar — premium dark */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(135deg, #0A2444 0%, #0B3D6B 45%, #0D5FA0 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 2px 20px rgba(10,36,68,0.28), 0 1px 4px rgba(10,36,68,0.18)",
        }}
      >
        {/* Accent line — blue */}
        <div className="h-[2.5px] w-full" style={{ background: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 40%, rgba(96,165,250,0.3) 80%, transparent 100%)" }} />
        <div className="max-w-3xl mx-auto px-4 h-[52px] flex items-center gap-3">
          <button
            onClick={() => { if (step === 1) setLocation("/jasa"); else setStep((s) => (s - 1) as typeof step); }}
            className="flex items-center gap-1.5 text-sm font-medium transition-all duration-150 rounded-lg px-2.5 py-1.5"
            style={{
              color: "rgba(255,255,255,0.72)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.96)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? t("freightForwarding.backToServices", "Kembali ke Layanan") : t("freightForwarding.back", "Kembali")}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md"
              style={{ background: "rgba(59,130,246,0.22)", border: "1px solid rgba(96,165,250,0.38)" }}
            >
              <Ship className="w-3.5 h-3.5" style={{ color: "#93C5FD" }} />
            </div>
            <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>Freight Forwarding</span>
          </div>
        </div>
      </nav>

      {/* Stepper */}
      <div className="border-b border-slate-200/70" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center">
            {STEP_LABELS.map((label, idx) => {
              const s = idx + 1;
              const done = step > s;
              const active = step === s;
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded-full font-bold shrink-0 transition-all duration-300"
                      style={{
                        width: "28px", height: "28px", fontSize: "12px",
                        ...(done
                          ? { background: "#10B981", color: "white", boxShadow: "0 2px 8px rgba(16,185,129,0.35)" }
                          : active
                          ? { background: "#0B5CAD", color: "white", boxShadow: "0 2px 10px rgba(11,92,173,0.40)" }
                          : { background: "#F1F5F9", color: "#94A3B8", border: "1.5px solid #E2E8F0" }),
                      }}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : s}
                    </div>
                    <span
                      className="text-xs hidden sm:block transition-colors duration-200"
                      style={{
                        color: active ? "#0F172A" : done ? "#059669" : "#94A3B8",
                        fontWeight: active ? 700 : done ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className="flex-1 mx-2.5 h-[1.5px] rounded-full transition-colors duration-300"
                      style={{ background: done ? "#10B981" : "#E2E8F0" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Step 1: Direction ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">{t("freightForwarding.chooseDirection", "Pilih Arah Pengiriman")}</h2>
              <p className="text-sm text-slate-500 mt-1.5">{t("freightForwarding.chooseDirectionSub", "Tentukan jenis pengiriman yang Anda butuhkan")}</p>
            </div>
            <div className="grid gap-4">
              {DIRECTIONS.map((d) => {
                const logoKey = `ff_direction_logo_${d.label}`;
                const rawLogoPath = content[logoKey];
                const logoSrc = rawLogoPath
                  ? (rawLogoPath.startsWith("/") ? (resolveImageUrl(rawLogoPath) ?? rawLogoPath) : rawLogoPath)
                  : null;
                const isUploading = uploadingLogo === d.label;

                return (
                  <div key={d.label} className="relative">
                    <button
                      onClick={() => { setDirection(d.label); if (!editMode) setStep(2); }}
                      className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        direction === d.label
                          ? `${d.color} shadow-lg scale-[1.015]`
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Logo / emoji area */}
                        <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={d.label}
                              className="w-12 h-12 object-contain rounded-lg"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <span className="text-3xl">{d.icon}</span>
                          )}
                          {/* Edit mode upload overlay */}
                          {editMode && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); logoFileRefs.current[d.label]?.click(); }}
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                              title={t("freightForwarding.uploadLogo", "Upload logo")}
                            >
                              {isUploading
                                ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                                : <ImagePlus className="h-5 w-5 text-white" />}
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base">{d.label}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{d.desc}</p>
                        </div>
                        {direction === d.label && <Check className="h-5 w-5 ml-auto shrink-0 text-current" />}
                        {editMode && logoSrc && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); updateField(logoKey, ""); }}
                            className="ml-auto text-xs text-muted-foreground hover:text-red-500 flex-shrink-0"
                            title={t("freightForwarding.deleteLogo", "Hapus logo")}
                          >
                            {t("freightForwarding.deleteLogo", "Hapus logo")}
                          </button>
                        )}
                      </div>
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={(el) => { logoFileRefs.current[d.label] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDirectionLogoUpload(d.label, file);
                        e.target.value = "";
                      }}
                    />
                    {/* Edit mode badge */}
                    {editMode && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded pointer-events-none">
                        {t("freightForwarding.editHoverUpload", "Edit: hover icon untuk upload logo")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {editMode && (
              <p className="text-xs text-muted-foreground text-center">
                {t("freightForwarding.editModeHint", "Hover pada icon emoji tiap card lalu klik untuk upload gambar logo. Simpan via toolbar Edit Mode.")}
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: Mode ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: "rgba(11,92,173,0.10)", color: "#0B5CAD", letterSpacing: "0.04em" }}
                >
                  {direction}
                </span>
              </div>
              <h2
                className="font-bold text-slate-900 tracking-tight"
                style={{ fontSize: "clamp(20px,4vw,26px)", lineHeight: 1.25 }}
              >
                {t("freightForwarding.chooseMode", "Pilih Moda Pengiriman")}
              </h2>
              <p className="text-slate-400 mt-1.5" style={{ fontSize: "14px" }}>
                {t("freightForwarding.chooseModeSub", "Pilih moda transportasi yang paling sesuai dengan kebutuhan Anda")}
              </p>
            </div>

            {/* Mode cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {MODES.map((m) => {
                const logoKey = `ff_mode_logo_${m.label}`;
                const rawLogoPath = content[logoKey];
                const logoSrc = rawLogoPath
                  ? (rawLogoPath.startsWith("/") ? (resolveImageUrl(rawLogoPath) ?? rawLogoPath) : rawLogoPath)
                  : null;
                const isUploading = uploadingLogo === `mode_${m.label}`;
                const isSelected = mode === m.label;
                return (
                  <div key={m.label} className="relative group">
                    <button
                      onClick={() => { setMode(m.label); if (m.label !== "Sea") setSeaType(null); if (!editMode) setStep(3); }}
                      style={{
                        width: "100%",
                        borderRadius: "20px",
                        border: isSelected ? "2.5px solid #0B5CAD" : "2px solid #E8EDF4",
                        background: isSelected
                          ? "linear-gradient(160deg,#EFF6FF 0%,#F0F7FF 100%)"
                          : "#FFFFFF",
                        boxShadow: isSelected
                          ? "0 8px 32px rgba(11,92,173,0.18), 0 2px 8px rgba(11,92,173,0.10)"
                          : "0 2px 12px rgba(15,23,42,0.06)",
                        transform: isSelected ? "translateY(-2px) scale(1.012)" : "translateY(0) scale(1)",
                        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                        overflow: "hidden",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "block",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(15,23,42,0.12)";
                          (e.currentTarget as HTMLElement).style.borderColor = "#C8D9EE";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.008)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)";
                          (e.currentTarget as HTMLElement).style.borderColor = "#E8EDF4";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                        }
                      }}
                    >
                      {/* Image area */}
                      <div className="relative w-full overflow-hidden" style={{ height: "200px" }}>
                        <img
                          src={logoSrc ?? m.defaultImg}
                          alt={m.desc}
                          className="w-full h-full object-cover"
                          style={{ transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = "none";
                            const fb = el.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                        {/* Icon fallback */}
                        <div className="absolute inset-0 items-center justify-center bg-slate-100" style={{ display: "none" }}>
                          {m.icon}
                        </div>
                        {/* Gradient overlay — richer at bottom */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(to top, rgba(5,15,35,0.72) 0%, rgba(5,15,35,0.18) 45%, transparent 100%)" }}
                        />
                        {/* Mode title on image */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
                          <p
                            className="text-white font-bold"
                            style={{ fontSize: "18px", letterSpacing: "-0.01em", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
                          >
                            {m.desc}
                          </p>
                        </div>
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div
                            className="absolute top-3.5 right-3.5 flex items-center justify-center"
                            style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              background: "#0B5CAD",
                              boxShadow: "0 2px 8px rgba(11,92,173,0.5)",
                            }}
                          >
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                        {/* Edit upload overlay */}
                        {editMode && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); logoFileRefs.current[`mode_${m.label}`]?.click(); }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <ImagePlus className="h-6 w-6 text-white" />}
                            <span className="text-white text-xs mt-1.5">{t("freightForwarding.uploadImage", "Upload gambar")}</span>
                          </button>
                        )}
                      </div>

                      {/* Description area */}
                      <div className="px-4 py-4">
                        <p
                          className="leading-relaxed"
                          style={{ fontSize: "13.5px", color: "#64748B", fontWeight: 400 }}
                        >
                          {m.detail}
                        </p>
                        {/* Select indicator */}
                        <div
                          className="flex items-center gap-1.5 mt-3"
                          style={{ opacity: isSelected ? 1 : 0, transition: "opacity 0.2s" }}
                        >
                          <div
                            className="rounded-full"
                            style={{ width: "6px", height: "6px", background: "#0B5CAD" }}
                          />
                          <span style={{ fontSize: "12px", color: "#0B5CAD", fontWeight: 600 }}>{t("freightForwarding.selected", "Dipilih")}</span>
                        </div>
                        {editMode && logoSrc && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); updateField(logoKey, ""); }}
                            className="text-xs text-slate-400 hover:text-red-500 mt-2"
                          >
                            {t("freightForwarding.deleteImage", "Hapus gambar")}
                          </button>
                        )}
                      </div>
                    </button>

                    <input
                      ref={(el) => { logoFileRefs.current[`mode_${m.label}`] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleModeLogoUpload(m.label, file);
                        e.target.value = "";
                      }}
                    />
                    {editMode && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded pointer-events-none">
                        {t("freightForwarding.editHoverUploadShort", "Edit: hover untuk upload")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Variant ──────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{direction}</Badge>
                <Badge variant="outline">{modeLabel(mode!)}</Badge>
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">{t("freightForwarding.chooseService", "Pilih Jenis Layanan")}</h2>
              <p className="text-sm text-slate-500 mt-1.5">{t("freightForwarding.chooseServiceSub", "Tentukan rute pengiriman dari titik asal ke tujuan")}</p>
            </div>

            {/* ── LCL / FCL selector (Sea Freight only) ─────────── */}
            {mode === "Sea" && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("freightForwarding.containerType", "Tipe Kontainer")}</p>
                <div className="flex gap-2">
                  {(["LCL", "FCL"] as SeaType[]).map((t_) => (
                    <button
                      key={t_}
                      onClick={() => setSeaType(t_)}
                      className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                        seaType === t_
                          ? t_ === "LCL"
                            ? "bg-amber-400 border-amber-400 text-black shadow-sm"
                            : "bg-gray-900 border-gray-900 text-white shadow-sm"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t_}
                    </button>
                  ))}
                </div>
                {seaType && (
                  <p className="text-xs text-muted-foreground">
                    {seaType === "LCL"
                      ? t("freightForwarding.lclDesc", "Less than Container Load — barang digabung bersama kargo lain dalam satu kontainer (cocok untuk muatan kecil)")
                      : t("freightForwarding.fclDesc", "Full Container Load — satu kontainer penuh untuk kargo Anda (cocok untuk muatan besar, lebih efisien)")}
                  </p>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {availableVariants().map((v) => {
                const logoKey = `ff_variant_logo_${v}`;
                const rawLogoPath = content[logoKey];
                const logoSrc = rawLogoPath
                  ? (rawLogoPath.startsWith("/") ? (resolveImageUrl(rawLogoPath) ?? rawLogoPath) : rawLogoPath)
                  : null;
                const isUploading = uploadingLogo === `variant_${v}`;
                return (
                  <div key={v} className="relative">
                    <button
                      onClick={() => {
                        setVariant(v);
                        if (!editMode && (mode !== "Sea" || seaType)) setStep(4);
                      }}
                      className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        variant === v
                          ? "border-[#0B5CAD] bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg scale-[1.015]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={v}
                              className="w-8 h-8 object-contain rounded-lg"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${variant === v ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                              {v}
                            </div>
                          )}
                          {editMode && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); logoFileRefs.current[`variant_${v}`]?.click(); }}
                              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                              title={t("freightForwarding.uploadLogo", "Upload logo")}
                            >
                              {isUploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <ImagePlus className="h-4 w-4 text-white" />}
                            </button>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{VARIANT_LABELS[v]}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{VARIANT_DESCS[v]}</p>
                        </div>
                        {variant === v && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                        {editMode && logoSrc && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); updateField(logoKey, ""); }}
                            className="text-xs text-muted-foreground hover:text-red-500 shrink-0"
                            title={t("freightForwarding.deleteLogo", "Hapus logo")}
                          >
                            {t("freightForwarding.delete", "Hapus")}
                          </button>
                        )}
                      </div>
                    </button>
                    <input
                      ref={(el) => { logoFileRefs.current[`variant_${v}`] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleVariantLogoUpload(v, file);
                        e.target.value = "";
                      }}
                    />
                    {editMode && (
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded pointer-events-none">
                        {t("freightForwarding.editHoverIcon", "Edit: hover icon")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Form ─────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{direction}</Badge>
                <Badge variant="outline">{modeLabel(mode!)}</Badge>
                {mode === "Sea" && seaType && (
                  <Badge className={seaType === "LCL" ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100" : "bg-gray-900 text-white border-gray-900 hover:bg-gray-900"}>
                    {seaType}
                  </Badge>
                )}
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">{VARIANT_LABELS[variant!]}</Badge>
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">{t("freightForwarding.shipmentDataTitle", "Data Pengiriman & Dokumen")}</h2>
              <p className="text-sm text-slate-500 mt-1.5">{t("freightForwarding.shipmentDataSub", "Lengkapi detail pengiriman dan upload dokumen yang diperlukan")}</p>
            </div>

            {/* ── Pengirim ──────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                {t("freightForwarding.senderData", "Data Pengirim")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.senderName", "Nama Pengirim")} <span className="text-red-500">*</span></Label>
                  <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder={t("freightForwarding.senderNamePlaceholder", "Nama perusahaan / perorangan")} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.senderAddressFull", "Alamat Lengkap Pengirim")} <span className="text-red-500">*</span></Label>
                  <Textarea value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder={t("freightForwarding.addressPlaceholder", "Jl. ..., Kota, Negara, Kode Pos")} rows={2} />
                </div>
              </div>
            </div>

            {/* ── Penerima ──────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                {t("freightForwarding.receiverData", "Data Penerima")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.receiverName", "Nama Penerima")} <span className="text-red-500">*</span></Label>
                  <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder={t("freightForwarding.senderNamePlaceholder", "Nama perusahaan / perorangan")} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.receiverAddressFull", "Alamat Lengkap Penerima")} <span className="text-red-500">*</span></Label>
                  <Textarea value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder={t("freightForwarding.addressPlaceholder", "Jl. ..., Kota, Negara, Kode Pos")} rows={2} />
                </div>
              </div>
            </div>

            {/* ── Barang ──────────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </div>
                {t("freightForwarding.goodsData", "Data Barang")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.commodityLabel", "Nama Barang / Komoditi")} <span className="text-red-500">*</span></Label>
                  <Input value={commodity} onChange={(e) => setCommodity(e.target.value)} placeholder={t("freightForwarding.commodityPlaceholder", "Elektronik, Kimia, Tekstil, dll.")} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.goodsCategory", "Kategori Barang")} <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    {(["Non DG", "DG"] as GoodsCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setGoodsCategory(cat)}
                        className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                          goodsCategory === cat
                            ? cat === "DG"
                              ? "border-orange-400 bg-orange-50 text-orange-700"
                              : "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {cat === "DG" ? t("freightForwarding.dgLabel", "⚠️ DG (Dangerous Goods)") : t("freightForwarding.nonDgLabel", "✅ Non DG (Aman)")}
                      </button>
                    ))}
                  </div>
                  {isDG && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-orange-700 bg-orange-50 rounded-xl px-3 py-2.5 border border-orange-200">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{t("freightForwarding.dgWarning", "Barang DG wajib melampirkan dokumen")} <strong>MSDS/SDS</strong> {t("freightForwarding.and", "dan")} <strong>COA</strong>.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Weight className="h-3.5 w-3.5" /> {t("freightForwarding.cargoItemDetail", "Detail Item Kargo")} <span className="text-red-500">*</span>
                  </Label>
                  <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs gap-1 px-2">
                    <Plus className="h-3.5 w-3.5" /> {t("freightForwarding.addItem", "Tambah Item")}
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={it.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">{t("freightForwarding.item", "Item")} {idx + 1}</span>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(it.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px]">{t("freightForwarding.grossWeight", "Berat Kotor (kg)")} <span className="text-red-500">*</span></Label>
                          <Input
                            type="number" min="0" placeholder="0"
                            value={it.grossWeight}
                            onChange={(e) => updateItem(it.id, "grossWeight", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px]">{t("freightForwarding.kolli", "Jumlah Kolli")} <span className="text-red-500">*</span></Label>
                          <Input
                            type="number" min="1" placeholder="1"
                            value={it.kolli}
                            onChange={(e) => updateItem(it.id, "kolli", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-1">
                          <Label className="text-[11px] flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> {t("freightForwarding.dimensions", "Dimensi (cm)")}</Label>
                          <div className="flex gap-1">
                            <Input type="number" min="0" placeholder="P" value={it.length} onChange={(e) => updateItem(it.id, "length", e.target.value)} className="text-center" />
                            <Input type="number" min="0" placeholder="L" value={it.width} onChange={(e) => updateItem(it.id, "width", e.target.value)} className="text-center" />
                            <Input type="number" min="0" placeholder="T" value={it.height} onChange={(e) => updateItem(it.id, "height", e.target.value)} className="text-center" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cargo summary */}
              {(totalGrossWeight > 0 || totalVolumeCBM > 0) && (
                <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">{t("freightForwarding.totalVolume", "Jumlah Volume")}</p>
                    <p className="text-sm font-bold text-sky-900">{fmtNum(totalVolumeCBM)} CBM</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">{t("freightForwarding.totalGrossWeight", "Total Berat Kotor")}</p>
                    <p className="text-sm font-bold text-sky-900">{fmtNum(totalGrossWeight, 1)} kg</p>
                  </div>
                  {mode === "Air" && (
                    <>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">{t("freightForwarding.volumetricWeight", "Berat Volumetrik")}</p>
                        <p className="text-sm font-bold text-sky-900">{fmtNum(volumetricWeight, 1)} kg</p>
                        <p className="text-[10px] text-sky-500">CBM × 167</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Chargeable Weight</p>
                        <p className="text-sm font-bold text-emerald-800">{fmtNum(chargeableWeight, 1)} kg</p>
                        <p className="text-[10px] text-emerald-500">{t("freightForwarding.maxOf", "maks(kotor, vol.)")}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Freight price */}
              <div className="space-y-1">
                <Label className="text-xs">
                  {freightLabel()} (IDR/{mode === "Air" ? "kg" : "CBM"})
                  {" "}<span className="text-muted-foreground font-normal">— {t("freightForwarding.leaveEmptyIfNone", "kosongkan jika belum ada")}</span>
                </Label>
                <Input
                  type="number" min="0" placeholder="0"
                  value={freightPrice}
                  onChange={(e) => setFreightPrice(e.target.value)}
                />
              </div>

              {/* Estimasi total */}
              {freightPriceNum > 0 && (totalGrossWeight > 0 || totalVolumeCBM > 0) && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      {t("freightForwarding.estimatedTotal", "Estimasi Total")} {mode === "Air" ? "Air Freight" : "Sea Freight"}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {mode === "Air"
                        ? `${fmtNum(freightPriceNum, 0)} IDR/kg × ${fmtNum(chargeableWeight, 1)} kg chargeable`
                        : `${fmtNum(freightPriceNum, 0)} IDR/CBM × ${fmtNum(totalVolumeCBM)} CBM`}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-800 shrink-0">{fmtIDR(estimasiTotal)}</p>
                </div>
              )}
            </div>

            {/* ── Dokumen ─────────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                {t("freightForwarding.uploadDocuments", "Upload Dokumen")}
              </h3>
              {!isAuthenticated() && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t("freightForwarding.loginToUpload", "Login terlebih dahulu untuk mengupload dokumen")}
                </div>
              )}
              <DocUploader
                label="Invoice" required
                hint={t("freightForwarding.invoiceHint", "Dokumen invoice / commercial invoice")}
                value={docInvoice}
                onChange={setDocInvoice}
              />
              <DocUploader
                label="Packing List" required
                hint={t("freightForwarding.packingListHint", "Dokumen packing list")}
                value={docPackingList}
                onChange={setDocPackingList}
              />
              {isDG && (
                <>
                  <DocUploader
                    label="MSDS / SDS" required
                    hint={t("freightForwarding.msdsHint", "Material Safety Data Sheet / Safety Data Sheet — wajib untuk barang DG")}
                    value={docMsds}
                    onChange={setDocMsds}
                  />
                  <DocUploader
                    label="COA (Certificate of Analysis)" required
                    hint={t("freightForwarding.coaHint", "Wajib untuk barang DG / kimia")}
                    value={docCoa}
                    onChange={setDocCoa}
                  />
                </>
              )}
              <DocUploader
                label={t("freightForwarding.otherDocs", "Dokumen Lainnya")}
                hint={t("freightForwarding.otherDocsHint", "Dokumen pendukung tambahan (opsional)")}
                value={docOther}
                onChange={setDocOther}
              />
            </div>

            {/* ── Data Pemesan ─────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                  <User className="h-3.5 w-3.5" />
                </div>
                {t("freightForwarding.ordererData", "Data Pemesan")}
              </h3>
              {portalUser && (
                <div className="flex items-start gap-2 text-xs text-sky-700 bg-sky-50 rounded-xl px-3 py-2.5 border border-sky-200">
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sky-500" />
                  <span>{t("freightForwarding.profilePrefill", "Data diambil dari profil akun Anda. Hanya nomor telepon yang dapat diubah.")}</span>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t("freightForwarding.picName", "Nama PIC")} <span className="text-red-500">*</span></Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t("freightForwarding.fullNamePlaceholder", "Nama lengkap")}
                    readOnly={!!portalUser?.name}
                    className={portalUser?.name ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("freightForwarding.companyName", "Nama Perusahaan")}</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PT. ..."
                    readOnly={!!portalUser?.company}
                    className={portalUser?.company ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("freightForwarding.email", "Email")} <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@perusahaan.com"
                    readOnly={!!portalUser?.email}
                    className={portalUser?.email ? "bg-muted/50 text-muted-foreground cursor-default" : ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("freightForwarding.phoneWhatsapp", "Telepon / WhatsApp")} <span className="text-red-500">*</span></Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+62..." />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">{t("freightForwarding.additionalNotes", "Catatan Tambahan")}</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("freightForwarding.additionalNotesPlaceholder", "Instruksi khusus, informasi tambahan, dll.")} rows={2} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Validation summary (step 4 only) ──────────────────── */}
        {step === 4 && missingFields().length > 0 && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {t("freightForwarding.completeBeforeSubmit", "Lengkapi field berikut sebelum mengirim pesanan:")}
            </p>
            <ul className="space-y-0.5 pl-5 list-disc">
              {missingFields().map((f) => (
                <li key={f} className="text-xs text-orange-700">{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className={`flex pt-5 border-t border-slate-200 ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && (
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300" onClick={() => setStep((s) => (s - 1) as typeof step)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> {t("freightForwarding.back", "Kembali")}
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as typeof step)}
              disabled={!canProceed()}
              className="bg-[#0B5CAD] hover:bg-[#0a4f98] text-white font-semibold shadow-sm hover:shadow-md transition-all"
            >
              {t("freightForwarding.continue", "Lanjutkan")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => void handleSubmit()}
              disabled={submitting || !canProceed()}
              className="bg-[#0B5CAD] hover:bg-[#0a4f98] text-white font-semibold gap-2 shadow-sm hover:shadow-md transition-all"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t("freightForwarding.submitOrder", "Kirim Pesanan")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
