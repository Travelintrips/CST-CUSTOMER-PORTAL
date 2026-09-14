import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, AlertCircle, Clock, Loader2, Building2, Upload, FileText,
  X, Camera, Plus, Trash2, Package, Image as ImageIcon, Video, ChevronDown, ChevronUp,
  ScrollText, ThumbsUp, ThumbsDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type InviteInfo = {
  vendor_name: string;
  service_type: string | null;
  notes: string | null;
  valid_until: string;
};

type DocSlotKey = "npwp" | "siup_nib" | "akta" | "ktp_pic" | "other";

type UploadedDoc = {
  docType: DocSlotKey;
  url: string;
  fileName: string;
};

type ProductMedia = {
  url: string;
  fileName: string;
  mediaType: "photo" | "video";
};

type ProductItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  media: ProductMedia[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_LABEL: Record<string, string> = {
  marketplace:  "Marketplace B2B",
  sea_freight:  "Sea Freight (FCL/LCL)",
  air_freight:  "Air Freight",
  trucking:     "Trucking / Darat",
  ppjk:         "PPJK / Custom Clearance",
  warehousing:  "Pergudangan",
  other:        "Lainnya",
};

const MARKETPLACE_PRODUCT_CATEGORIES = [
  "Elektronik",
  "Fashion & Tekstil",
  "Makanan & Minuman",
  "Kesehatan & Kecantikan",
  "Rumah Tangga & Furnitur",
  "Otomotif & Sparepart",
  "Bahan Baku & Industri",
  "Alat Tulis & Kantor",
  "Lainnya",
];

const DOC_SLOTS: { key: DocSlotKey; label: string; required: boolean }[] = [
  { key: "npwp",     label: "NPWP Perusahaan",              required: true },
  { key: "siup_nib", label: "NIB",                          required: true },
  { key: "akta",     label: "Akta Pendirian Perusahaan",    required: false },
  { key: "ktp_pic",  label: "KTP PIC / Penanggung Jawab",  required: true },
];

const VENDOR_TERMS_TEXT = `Selamat datang di B&B Marketplace & Logistics Solutions ("Platform"), yang dikelola oleh PT Cahaya Sejati Teknologi ("Perusahaan"). Dengan mendaftar sebagai Vendor, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut.

1. Definisi
Platform adalah sistem digital B&B Marketplace & Logistics Solutions yang menyediakan layanan marketplace B2B, logistik, pengiriman, dan layanan pendukung perdagangan.
Vendor adalah perusahaan atau pelaku usaha yang telah terdaftar dan disetujui oleh PT Cahaya Sejati Teknologi untuk menjual produk atau menawarkan jasa melalui Platform.
Pembeli adalah pengguna yang melakukan pembelian produk atau jasa melalui Platform.

2. Persyaratan Menjadi Vendor
Vendor wajib memenuhi persyaratan berikut:
- Memiliki badan usaha yang sah sesuai peraturan perundang-undangan yang berlaku.
- Memiliki dokumen legalitas usaha yang masih berlaku, seperti: NIB (Nomor Induk Berusaha), NPWP, Akta Pendirian (jika diperlukan), Identitas Penanggung Jawab, dan dokumen pendukung lainnya sesuai jenis usaha.
- Memiliki rekening bank atas nama perusahaan atau pemilik usaha.
- Bersedia menjalani proses verifikasi oleh PT Cahaya Sejati Teknologi.
Perusahaan berhak menolak atau membatalkan pendaftaran Vendor apabila ditemukan data yang tidak benar.

3. Kewajiban Vendor
Vendor wajib:
- Menyediakan informasi produk atau jasa secara lengkap, benar, dan tidak menyesatkan.
- Menjamin bahwa seluruh produk yang dijual adalah legal dan tidak melanggar hukum.
- Menjaga kualitas produk sesuai spesifikasi yang ditampilkan.
- Memperbarui stok dan harga secara berkala.
- Memproses pesanan sesuai waktu yang telah ditentukan.
- Memberikan pelayanan yang profesional kepada Pembeli.
- Menjaga kerahasiaan akun dan data akses Platform.

4. Larangan
Vendor dilarang:
- Menjual barang ilegal.
- Menjual barang palsu atau melanggar hak kekayaan intelektual.
- Menjual barang berbahaya yang dilarang oleh hukum.
- Memberikan informasi palsu mengenai produk.
- Melakukan manipulasi harga atau transaksi.
- Menghubungi Pembeli untuk mengalihkan transaksi di luar Platform tanpa persetujuan Perusahaan.
- Menyalahgunakan data pelanggan.

5. Kualitas Produk dan Layanan
Vendor bertanggung jawab penuh terhadap keaslian produk, kualitas produk, keamanan produk, garansi (apabila disediakan), dan kepatuhan terhadap standar nasional maupun internasional yang berlaku. Seluruh klaim terkait produk menjadi tanggung jawab Vendor.

6. Harga dan Pembayaran
Vendor wajib menampilkan harga yang jelas, tidak mengenakan biaya tersembunyi, dan mematuhi mekanisme pembayaran yang berlaku pada Platform. PT Cahaya Sejati Teknologi berhak mengenakan biaya layanan (Service Fee) sesuai kebijakan yang berlaku.

7. Pengiriman dan Logistik
Vendor wajib menyiapkan barang sesuai jadwal, memberikan informasi pengiriman yang benar, memastikan kemasan sesuai standar keamanan, dan mematuhi prosedur ekspor-impor apabila berlaku. Apabila menggunakan layanan logistik yang disediakan Platform, Vendor wajib mengikuti seluruh prosedur operasional yang ditetapkan.

8. Kepatuhan Hukum
Vendor wajib mematuhi seluruh peraturan yang berlaku, termasuk namun tidak terbatas pada peraturan perdagangan, perpajakan, ekspor-impor, kepabeanan, perlindungan konsumen, dan Hak Kekayaan Intelektual (HKI).

9. Hak PT Cahaya Sejati Teknologi
Perusahaan berhak melakukan verifikasi terhadap Vendor, meminta dokumen tambahan, menolak produk yang tidak memenuhi standar, menangguhkan akun Vendor, menghapus produk yang melanggar kebijakan, dan menonaktifkan akun Vendor apabila terjadi pelanggaran.

10. Penangguhan dan Pengakhiran Akun
Akun Vendor dapat ditangguhkan atau dihentikan apabila memberikan data palsu, melakukan penipuan, melakukan pelanggaran hukum, mendapatkan banyak keluhan yang terbukti, atau melanggar ketentuan Platform.

11. Kekayaan Intelektual
Vendor menjamin bahwa produk yang dijual tidak melanggar hak cipta, merek dagang, paten, atau hak kekayaan intelektual pihak lain. Vendor bertanggung jawab penuh atas seluruh tuntutan hukum yang timbul.

12. Perlindungan Data
Vendor wajib menjaga kerahasiaan seluruh data pelanggan yang diperoleh melalui Platform. Vendor dilarang menjual, menyebarkan, atau menggunakan data pelanggan tanpa persetujuan.

13. Pembatasan Tanggung Jawab
PT Cahaya Sejati Teknologi bertindak sebagai penyedia Platform dan tidak bertanggung jawab atas sengketa kualitas produk, kerusakan produk akibat Vendor, kesalahan informasi yang diberikan Vendor, maupun kerugian akibat kelalaian Vendor.

14. Ganti Rugi (Indemnity)
Vendor bersedia membebaskan PT Cahaya Sejati Teknologi dari segala tuntutan, kerugian, biaya, maupun klaim yang timbul akibat pelanggaran hukum oleh Vendor, produk cacat, pelanggaran hak pihak ketiga, atau informasi yang tidak benar.

15. Perubahan Ketentuan
PT Cahaya Sejati Teknologi berhak mengubah syarat dan ketentuan sewaktu-waktu. Perubahan akan diumumkan melalui Platform dan berlaku sejak tanggal ditetapkan.

16. Hukum yang Berlaku
Syarat dan ketentuan ini diatur berdasarkan hukum Republik Indonesia. Segala sengketa akan diselesaikan terlebih dahulu melalui musyawarah. Apabila tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri yang berwenang sesuai domisili hukum PT Cahaya Sejati Teknologi.

17. Persetujuan
Dengan mendaftar sebagai Vendor di B&B Marketplace & Logistics Solutions, Vendor menyatakan telah membaca seluruh Syarat dan Ketentuan, memahami seluruh hak dan kewajiban, menyetujui seluruh ketentuan tanpa paksaan dari pihak mana pun, dan bersedia mematuhi seluruh kebijakan yang berlaku pada Platform.`;

const DOC_UPLOAD_ACCEPT  = "image/jpeg,image/png,image/webp,application/pdf";
const DOC_UPLOAD_MAX_MB  = 10;
const MEDIA_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime";
const MEDIA_UPLOAD_MAX_MB = 50;
const MAX_PRODUCTS        = 10;
const MAX_MEDIA_PER_PRODUCT = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

function isVideo(mimeOrName: string) {
  return /video|\.mp4$|\.mov$|\.avi$|\.webm$/i.test(mimeOrName);
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VendorRegisterPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  // Status
  const [status, setStatus]   = useState<"loading" | "valid" | "error" | "done">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [invite, setInvite]   = useState<InviteInfo | null>(null);
  // "marketplace" (or no invite yet loaded / no service_type set — back-compat
  // for legacy invitations created before service_type existed) shows a
  // product catalog; any other service_type is a service capability, not a
  // product listing.
  const isMarketplaceInvite = !invite?.service_type || invite.service_type === "marketplace";

  // Contact form
  const [contactName, setContactName] = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage]         = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Legal documents
  const [docs, setDocs]               = useState<Partial<Record<DocSlotKey, UploadedDoc>>>({});
  const [uploadingSlot, setUploadingSlot] = useState<DocSlotKey | null>(null);
  const [uploadError, setUploadError] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Partial<Record<DocSlotKey, HTMLInputElement | null>>>({});

  // Products
  const [products, setProducts] = useState<ProductItem[]>([
    { id: uid(), name: "", description: "", category: "", media: [] },
  ]);
  const [uploadingMedia, setUploadingMedia] = useState<Record<string, boolean>>({});
  const [mediaUploadError, setMediaUploadError] = useState<Record<string, string>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({ });

  // Terms & conditions
  const [termsAgree, setTermsAgree] = useState<"yes" | "no" | null>(null);
  const [disagreeReason, setDisagreeReason] = useState("");
  const [termsError, setTermsError] = useState("");
  const [reasonSubmitting, setReasonSubmitting] = useState(false);
  const [reasonSent, setReasonSent] = useState(false);
  const [reasonError, setReasonError] = useState("");

  useEffect(() => {
    // Expand first product by default
    setExpandedProducts((prev) => ({ ...prev, [products[0].id]: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch invite ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Link undangan tidak valid. Pastikan Anda menggunakan link yang dikirimkan oleh admin.");
      return;
    }
    fetch(`/api/portal/vendor-invite/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message ?? "Link tidak valid");
        setInvite(data);
        setCompanyName(data.vendor_name ?? "");
        setStatus("valid");
      })
      .catch((e) => {
        setStatus("error");
        setErrorMsg(e.message ?? "Terjadi kesalahan. Coba lagi nanti.");
      });
  }, [token]);

  // ── Legal doc upload ───────────────────────────────────────────────────────
  const handleFileSelected = async (slot: DocSlotKey, file: File | undefined) => {
    if (!file) return;
    setUploadError((prev) => ({ ...prev, [slot]: "" }));
    if (file.size > DOC_UPLOAD_MAX_MB * 1024 * 1024) {
      setUploadError((prev) => ({ ...prev, [slot]: `Ukuran file melebihi ${DOC_UPLOAD_MAX_MB}MB.` }));
      return;
    }
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", slot);
      const res  = await fetch(`/api/portal/vendor-invite/${encodeURIComponent(token)}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal upload file");
      setDocs((prev) => ({ ...prev, [slot]: { docType: slot, url: data.url, fileName: data.fileName || file.name } }));
    } catch (e: any) {
      setUploadError((prev) => ({ ...prev, [slot]: e.message ?? "Gagal upload file. Coba lagi." }));
    } finally {
      setUploadingSlot(null);
    }
  };

  const removeDoc = (slot: DocSlotKey) => {
    setDocs((prev) => { const n = { ...prev }; delete n[slot]; return n; });
    const el = fileInputRefs.current[slot];
    if (el) el.value = "";
  };

  // ── Product media upload ───────────────────────────────────────────────────
  const handleMediaSelected = async (productId: string, file: File | undefined) => {
    if (!file) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.media.length >= MAX_MEDIA_PER_PRODUCT) {
      setMediaUploadError((prev) => ({ ...prev, [productId]: `Maksimal ${MAX_MEDIA_PER_PRODUCT} file per produk.` }));
      return;
    }
    if (file.size > MEDIA_UPLOAD_MAX_MB * 1024 * 1024) {
      setMediaUploadError((prev) => ({ ...prev, [productId]: `Ukuran file melebihi ${MEDIA_UPLOAD_MAX_MB}MB.` }));
      return;
    }
    setMediaUploadError((prev) => ({ ...prev, [productId]: "" }));
    setUploadingMedia((prev) => ({ ...prev, [productId]: true }));
    try {
      const docType = isVideo(file.type || file.name) ? "product_video" : "product_photo";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", docType);
      const res  = await fetch(`/api/portal/vendor-invite/${encodeURIComponent(token)}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal upload");
      const mediaType: "photo" | "video" = docType === "product_video" ? "video" : "photo";
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, media: [...p.media, { url: data.url, fileName: data.fileName || file.name, mediaType }] }
            : p
        )
      );
    } catch (e: any) {
      setMediaUploadError((prev) => ({ ...prev, [productId]: e.message ?? "Gagal upload. Coba lagi." }));
    } finally {
      setUploadingMedia((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeMedia = (productId: string, mediaIdx: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, media: p.media.filter((_, i) => i !== mediaIdx) }
          : p
      )
    );
  };

  const addProduct = () => {
    if (products.length >= MAX_PRODUCTS) return;
    const id = uid();
    setProducts((prev) => [...prev, { id, name: "", description: "", category: "", media: [] }]);
    setExpandedProducts((prev) => ({ ...prev, [id]: true }));
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateProduct = (productId: string, field: "name" | "description" | "category", value: string) => {
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, [field]: value } : p));
  };

  const toggleProduct = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // ── Send disagreement reason to admin ───────────────────────────────────────
  const handleSendReason = async () => {
    setReasonError("");
    if (!disagreeReason.trim()) {
      setReasonError("Isi alasan Anda tidak menyetujui terlebih dahulu.");
      return;
    }
    setReasonSubmitting(true);
    try {
      const res = await fetch(`/api/portal/vendor-invite/${encodeURIComponent(token)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disagreeReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal mengirim alasan");
      setReasonSent(true);
    } catch (e: any) {
      setReasonError(e.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setReasonSubmitting(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError("");
    setTermsError("");
    if (termsAgree !== "yes") {
      setTermsError("Anda harus menyetujui Syarat dan Ketentuan Vendor untuk melanjutkan.");
      return;
    }
    if (!contactName.trim()) { setSubmitError("Nama kontak harus diisi"); return; }
    if (!phone.trim() && !email.trim()) { setSubmitError("Isi setidaknya No. WhatsApp atau Email"); return; }
    const missingRequired = DOC_SLOTS.filter((s) => s.required && !docs[s.key]);
    if (missingRequired.length > 0) {
      setSubmitError(`Dokumen wajib belum diunggah: ${missingRequired.map((s) => s.label).join(", ")}`);
      return;
    }
    const filledProducts = products.filter((p) => p.name.trim() || p.media.length > 0);
    if (isMarketplaceInvite) {
      const missingCategory = filledProducts.filter((p) => !p.category.trim());
      if (missingCategory.length > 0) {
        setSubmitError("Pilih kategori untuk setiap produk yang diisi");
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/vendor-invite/${encodeURIComponent(token)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: contactName,
          phone,
          email,
          company_name: companyName,
          message,
          products: filledProducts.map((p) => ({
            name:       p.name.trim(),
            description: p.description.trim(),
            category:   p.category.trim(),
            mediaUrls:  p.media.map((m) => m.url),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal mengirim");
      setStatus("done");
    } catch (e: any) {
      setSubmitError(e.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm">{t("vendor.register.validating")}</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{t("vendor.register.linkInvalid")}</h1>
          <p className="text-sm text-slate-500">{errorMsg}</p>
          <p className="text-xs text-slate-400">
            {t("vendor.register.linkInvalidHint")}
          </p>
          <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
            {t("vendor.register.backToHome")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{t("vendor.register.successTitle")}</h1>
          <p className="text-sm text-slate-600">
            Terima kasih, <span className="font-semibold">{contactName}</span>!{" "}
            {t("vendor.register.successMsg")}
          </p>
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">
            {t("vendor.register.successHint")}
          </div>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setLocation("/")}>
            {t("vendor.register.goHome")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  const validUntil = invite
    ? new Date(invite.valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-0.5">{t("vendor.register.invitationLabel")}</p>
              <h1 className="text-lg font-bold text-slate-800">Selamat datang, {invite?.vendor_name}!</h1>
              <p className="text-sm text-slate-500 mt-1">
                Anda diundang oleh <span className="font-medium text-slate-700">CST Logistic</span> untuk bergabung sebagai mitra vendor di platform B2B kami.
              </p>
            </div>
          </div>
          {invite?.service_type && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <span className="font-medium">{t("vendor.register.serviceTypeLabel")}</span>
              <span>{SERVICE_LABEL[invite.service_type] ?? invite.service_type}</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("vendor.register.validUntil")} <span className="text-slate-600 font-medium">{validUntil}</span></span>
          </div>
        </div>

        {/* ── Contact form ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <h2 className="font-semibold text-slate-800">{t("vendor.register.contactFormTitle")}</h2>

          <div className="space-y-1.5">
            <Label>{t("vendor.register.companyName")}</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="PT. Nama Perusahaan Anda" />
          </div>

          <div className="space-y-1.5">
            <Label>{t("vendor.register.contactName")} <span className="text-red-500">*</span></Label>
            <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nama lengkap Anda" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("vendor.register.whatsapp")}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="628123456789" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("vendor.register.email")}</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="anda@email.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("vendor.register.messageLabel")}</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Ceritakan sedikit tentang perusahaan Anda atau layanan yang bisa Anda tawarkan…"
            />
          </div>
        </div>

        {/* ── Produk / Layanan ──────────────────────────────────────────────── */}
        {/* Scoped to the invited service type: a "marketplace" invite offers a
            product catalog, everything else (sea/air freight, trucking, ppjk,
            warehousing…) is registering a service capability, not products —
            label + copy adapt so vendors don't list things outside what they
            were invited to join as. */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-500" />
                {isMarketplaceInvite ? "Produk yang Ditawarkan" : "Layanan yang Ditawarkan"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMarketplaceInvite
                  ? "Opsional. Tambahkan foto atau video produk Anda agar tim kami bisa langsung melihatnya."
                  : `Opsional. Jelaskan cakupan layanan ${SERVICE_LABEL[invite?.service_type ?? ""] ?? "yang Anda tawarkan"} sesuai undangan ini — lampirkan foto/dokumen pendukung bila ada.`}
              </p>
            </div>
            {products.length < MAX_PRODUCTS && (
              <button
                type="button"
                onClick={addProduct}
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> {isMarketplaceInvite ? "Tambah Produk" : "Tambah Layanan"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {products.map((prod, idx) => {
              const isExpanded = expandedProducts[prod.id] ?? false;
              const isUploading = uploadingMedia[prod.id];
              const mediaErr = mediaUploadError[prod.id];
              const hasContent = prod.name || prod.description || prod.media.length > 0;

              return (
                <div key={prod.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  {/* Product header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer select-none"
                    onClick={() => toggleProduct(prod.id)}
                  >
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                      {prod.name.trim() || `Produk ${idx + 1}`}
                    </span>
                    {prod.media.length > 0 && (
                      <span className="text-xs text-slate-400 shrink-0">{prod.media.length} media</span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeProduct(prod.id); }}
                        className="text-slate-300 hover:text-red-500 shrink-0 transition-colors"
                        title="Hapus produk ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Product body */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{isMarketplaceInvite ? "Nama Produk" : "Nama Layanan"}</Label>
                        <Input
                          value={prod.name}
                          onChange={(e) => updateProduct(prod.id, "name", e.target.value)}
                          placeholder={isMarketplaceInvite ? "Contoh: Kopi Arabica Grade A, Beras Premium..." : "Contoh: Jasa Freight FCL, Trucking Jabodetabek..."}
                          className="text-sm"
                        />
                      </div>

                      {isMarketplaceInvite && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t("vendor.register.productCategory")}</Label>
                          <select
                            value={prod.category}
                            onChange={(e) => updateProduct(prod.id, "category", e.target.value)}
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                          >
                            <option value="">— Pilih kategori —</option>
                            {MARKETPLACE_PRODUCT_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("vendor.register.shortDescription")}</Label>
                        <Textarea
                          value={prod.description}
                          onChange={(e) => updateProduct(prod.id, "description", e.target.value)}
                          placeholder={isMarketplaceInvite ? "Spesifikasi, harga kisaran, kapasitas, atau informasi lain yang relevan…" : "Cakupan rute/wilayah, kapasitas, tarif, atau informasi lain yang relevan…"}
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      {/* Media grid */}
                      <div className="space-y-2">
                        <Label className="text-xs">
                          Foto / Video <span className="text-slate-400 font-normal">(maks. {MAX_MEDIA_PER_PRODUCT} file, hingga {MEDIA_UPLOAD_MAX_MB}MB per file)</span>
                        </Label>

                        <div className="grid grid-cols-3 gap-2">
                          {prod.media.map((m, mIdx) => (
                            <div key={mIdx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                              {m.mediaType === "video" ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                  <Video className="h-6 w-6 text-slate-400" />
                                  <span className="text-[10px] text-slate-400 text-center truncate w-full">{m.fileName}</span>
                                </div>
                              ) : (
                                <img
                                  src={resolveImageUrl(m.url) ?? m.url}
                                  alt={m.fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                                      `<div class="w-full h-full flex items-center justify-center"><span class="text-slate-400 text-xs text-center px-1">${m.fileName}</span></div>`;
                                  }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => removeMedia(prod.id, mIdx)}
                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Hapus"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}

                          {prod.media.length < MAX_MEDIA_PER_PRODUCT && (
                            isUploading ? (
                              <div className="aspect-square rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                              </div>
                            ) : (
                              <label className="aspect-square rounded-lg border border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group">
                                <div className="flex gap-1 text-indigo-400 group-hover:text-indigo-500">
                                  <ImageIcon className="h-4 w-4" />
                                  <Video className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] text-indigo-400 group-hover:text-indigo-500">{t("vendor.register.addMedia")}</span>
                                <input
                                  type="file"
                                  accept={MEDIA_UPLOAD_ACCEPT}
                                  className="hidden"
                                  onChange={(e) => handleMediaSelected(prod.id, e.target.files?.[0])}
                                />
                              </label>
                            )
                          )}
                        </div>

                        {/* Camera capture button (for mobile) */}
                        {!isUploading && prod.media.length < MAX_MEDIA_PER_PRODUCT && (
                          <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs text-slate-500 cursor-pointer transition-colors w-full">
                            <Camera className="h-3.5 w-3.5" /> {t("vendor.register.takePhoto")}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleMediaSelected(prod.id, e.target.files?.[0])}
                            />
                          </label>
                        )}

                        {mediaErr && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {mediaErr}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {products.length < MAX_PRODUCTS && (
            <button
              type="button"
              onClick={addProduct}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> {t("vendor.register.addMoreProduct")}
            </button>
          )}
        </div>

        {/* ── Dokumen Pendukung ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800">Dokumen Pendukung</h2>
            <p className="text-xs text-slate-400 mt-0.5">Format JPG, PNG, atau PDF, maksimal {DOC_UPLOAD_MAX_MB}MB per file.</p>
          </div>

          {DOC_SLOTS.map((slot) => {
            const uploaded  = docs[slot.key];
            const isUploading = uploadingSlot === slot.key;
            const err       = uploadError[slot.key];
            return (
              <div key={slot.key} className="space-y-1.5">
                <Label>
                  {slot.label} {slot.required && <span className="text-red-500">*</span>}
                </Label>

                {uploaded ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 truncate">{uploaded.fileName}</span>
                    </div>
                    <button type="button" onClick={() => removeDoc(slot.key)} className="text-slate-400 hover:text-red-500 shrink-0" aria-label={`Hapus ${slot.label}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : isUploading ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah…
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-3 text-sm text-slate-500 cursor-pointer transition-colors">
                      <Camera className="h-4 w-4" /> Ambil Foto
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelected(slot.key, e.target.files?.[0])} />
                    </label>
                    <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-3 text-sm text-slate-500 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" /> Pilih File
                      <input
                        ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                        type="file"
                        accept={DOC_UPLOAD_ACCEPT}
                        className="hidden"
                        onChange={(e) => handleFileSelected(slot.key, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                )}

                {err && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {err}
                  </p>
                )}
              </div>
            );
          })}

          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
            </p>
          )}
        </div>

        {/* ── Syarat dan Ketentuan Vendor ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-indigo-500" />
              Syarat dan Ketentuan Vendor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              B&amp;B Marketplace &amp; Logistics Solutions — PT Cahaya Sejati Teknologi
            </p>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
            {VENDOR_TERMS_TEXT}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setTermsAgree("yes"); setTermsError(""); setReasonSent(false); setReasonError(""); }}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                termsAgree === "yes"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ThumbsUp className="h-4 w-4" /> Setuju
            </button>
            <button
              type="button"
              onClick={() => { setTermsAgree("no"); setTermsError(""); }}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                termsAgree === "no"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ThumbsDown className="h-4 w-4" /> Tidak Setuju
            </button>
          </div>

          {termsAgree === "no" && (
            <div className="space-y-1.5">
              <Label>{t("vendor.register.disagreeReason")}</Label>
              {reasonSent ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2">
                  <ThumbsDown className="h-4 w-4 mt-0.5 shrink-0" />
                  Alasan Anda telah terkirim ke admin. Terima kasih atas masukannya.
                </div>
              ) : (
                <>
                  <Textarea
                    value={disagreeReason}
                    onChange={(e) => setDisagreeReason(e.target.value)}
                    rows={3}
                    placeholder="Ceritakan alasan Anda tidak menyetujui Syarat dan Ketentuan ini…"
                  />
                  {reasonError && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {reasonError}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendReason}
                    disabled={reasonSubmitting}
                    className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {reasonSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim…</> : "Kirim Alasan"}
                  </Button>
                </>
              )}
              <p className="text-xs text-slate-400">
                Anda perlu menyetujui Syarat dan Ketentuan untuk dapat melanjutkan pendaftaran sebagai mitra vendor.
              </p>
            </div>
          )}

          {termsError && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> {termsError}
            </p>
          )}

          {termsAgree === "yes" && (
            <>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim…</> : "Konfirmasi Bergabung sebagai Mitra"}
              </Button>
              <p className="text-xs text-center text-slate-400">
                Dengan mengklik tombol di atas, Anda menyetujui bahwa data ini akan digunakan untuk proses verifikasi mitra CST Logistic.
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
