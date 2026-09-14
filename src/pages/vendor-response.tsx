import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { Truck, CheckCircle2, XCircle, Camera, Clock, User, Phone, CarFront, FileText, AlertCircle, Package, MapPin, Calendar, Weight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) {
  return `${BASE}${path}`;
}

interface OrderInfo {
  orderNumber: string;
  origin: string;
  destination: string;
  commodity: string | null;
  grossWeight: string | null;
  vehicleType: string | null;
  requiredDate: string | null;
  jamOrder: string | null;
  shipmentType: string;
  vendorBasePrice: number | null;
  vendorNameFromDb: string | null;
  alreadySubmitted: boolean;
}

const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
function formatDateID(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr + "T00:00:00+07:00");
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function InfoRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b border-white/10 last:border-0 ${highlight ? "bg-emerald-500/5 -mx-4 px-4 rounded" : ""}`}>
      <span className="text-blue-300 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 break-words ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

function InputField({
  label, icon, type = "text", value, onChange, placeholder, required = false
}: {
  label: string; icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
        <span className="text-blue-400">{icon}</span>
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
    </div>
  );
}

export default function VendorResponsePage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber ?? "";
  const { t } = useLanguage();
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const vendorIdParam = searchParams.get("v") ?? "";
  const vrToken = searchParams.get("t") ?? "";

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [status, setStatus] = useState<"READY" | "NOT_READY" | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [estimatedPickupTime, setEstimatedPickupTime] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [notes, setNotes] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  function loadOrder(externalSignal?: AbortSignal) {
    if (!orderNumber) { setLoading(false); setNotFound(true); return; }
    setLoading(true);
    setNetworkError(null);
    setNotFound(false);

    const localController = new AbortController();
    const signal = externalSignal ?? localController.signal;

    const timeoutId = setTimeout(() => {
      localController.abort();
      if (!signal.aborted) {
        setLoading(false);
        setNetworkError(t("vendorResponse.errorTimeout", "Koneksi timeout (>15 detik). Periksa internet Anda lalu coba lagi."));
      }
    }, 15000);

    if (externalSignal) {
      externalSignal.addEventListener("abort", () => localController.abort(), { once: true });
    }

    const qsParts: string[] = [];
    if (vrToken) qsParts.push(`t=${encodeURIComponent(vrToken)}`);
    if (vendorIdParam) qsParts.push(`v=${encodeURIComponent(vendorIdParam)}`);
    const qs = qsParts.length > 0 ? `?${qsParts.join("&")}` : "";
    fetch(apiUrl(`/api/vendor-response/${orderNumber}${qs}`), { signal })
      .then(async (r) => {
        clearTimeout(timeoutId);
        setNetworkError(null);
        if (r.status === 403 || r.status === 404) { setNotFound(true); return; }
        const data: OrderInfo = await r.json();
        setOrder(data);
        if (data.vehicleType) setVehicleType(data.vehicleType);
        if (data.vendorNameFromDb) setVendorName(data.vendorNameFromDb);
        if (data.alreadySubmitted) {
          setSubmitted(true);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err?.name === "AbortError") return;
        setNetworkError(t("vendorResponse.errorLoadData", "Gagal memuat data. Periksa koneksi internet Anda."));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const controller = new AbortController();
    loadOrder(controller.signal);
    return () => controller.abort();
  }, [orderNumber]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!status) { setError(t("vendorResponse.errorSelectStatus", "Pilih status READY atau NOT READY terlebih dahulu.")); return; }
    if (status === "READY" && !driverName.trim()) { setError(t("vendorResponse.errorDriverRequired", "Nama driver wajib diisi jika status READY.")); return; }
    if (status === "READY" && !plateNumber.trim()) { setError(t("vendorResponse.errorPlateRequired", "Plat nomor wajib diisi jika status READY.")); return; }
    setError(null);
    setSubmitting(true);

    try {
      let unitPhotoUrl: string | null = null;

      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        const photoTokenQs = vrToken ? `?t=${encodeURIComponent(vrToken)}` : "";
        const photoRes = await fetch(apiUrl(`/api/vendor-response/${orderNumber}/photo${photoTokenQs}`), {
          method: "POST",
          body: formData,
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          unitPhotoUrl = photoData.url ?? null;
        }
      }

      const body = {
        vendorName: vendorName.trim() || null,
        status,
        estimatedPickupTime: estimatedPickupTime || null,
        driverName: driverName.trim() || null,
        driverPhone: driverPhone.trim() || null,
        plateNumber: plateNumber.trim() || null,
        vehicleType: vehicleType.trim() || null,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : null,
        notes: notes.trim() || null,
        unitPhotoUrl,
        token: vrToken || undefined,
      };

      const postTokenQs = vrToken ? `?t=${encodeURIComponent(vrToken)}` : "";
      const res = await fetch(apiUrl(`/api/vendor-response/${orderNumber}${postTokenQs}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("vendorResponse.errorGeneral", "Terjadi kesalahan. Coba lagi."));
        return;
      }

      setSubmitted(true);
    } catch {
      setError(t("vendorResponse.errorConnFailed", "Koneksi gagal. Periksa internet Anda dan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">{t("vendorResponse.loading", "Memuat data order...")}</p>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-9 h-9 text-orange-400" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold mb-2">{t("vendorResponse.loadFailed", "Gagal Memuat")}</h2>
            <p className="text-slate-400 text-sm">{networkError}</p>
          </div>
          <button
            onClick={() => loadOrder()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {t("vendorResponse.retry", "Coba Lagi")}
          </button>
          <p className="text-slate-600 text-xs">{t("vendorResponse.orderNo", "No. order:")} <span className="font-mono text-slate-500">{orderNumber}</span></p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-white text-xl font-bold">{t("vendorResponse.notFound", "Order Tidak Ditemukan")}</h2>
          <p className="text-slate-400 text-sm">
            {t("vendorResponse.orderNo", "No. order")} <span className="font-mono text-blue-400">{orderNumber}</span> {t("vendorResponse.notFoundDesc", "tidak ditemukan dalam sistem.")}
          </p>
          <p className="text-slate-500 text-xs">{t("vendorResponse.notFoundHint", "Pastikan link yang Anda gunakan benar, atau hubungi admin.")}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const isReady = status === "READY";
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">CST LOGISTICS</p>
              <p className="text-white text-sm font-bold">{t("vendorResponse.formTitle", "Vendor Response")}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${status ? (isReady ? "bg-green-500/20" : "bg-red-500/20") : "bg-blue-500/20"}`}>
            {status
              ? (isReady
                  ? <CheckCircle2 className="w-10 h-10 text-green-400" />
                  : <XCircle className="w-10 h-10 text-red-400" />)
              : <CheckCircle2 className="w-10 h-10 text-blue-400" />
            }
          </div>

          <div className="space-y-2">
            <h2 className="text-white text-2xl font-bold">
              {status ? t("vendorResponse.successTitle", "Response Terkirim!") : t("vendorResponse.alreadyRespondedTitle", "Sudah Direspon")}
            </h2>
            <p className="text-slate-400 text-sm">
              {status
                ? t("vendorResponse.successDesc", "Response Anda untuk order berikut telah berhasil dikirim ke admin.")
                : t("vendorResponse.alreadyRespondedDesc", "Response untuk order ini telah dikirimkan sebelumnya.")}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 w-full max-w-sm text-left space-y-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{t("vendorResponse.responseSummaryTitle", "Ringkasan Response")}</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{t("vendorResponse.noOrderLabel", "No. Order")}</span>
                <span className="text-white text-sm font-mono font-bold">{orderNumber}</span>
              </div>
              {status && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorResponse.statusLabel", "Status")}</span>
                  <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${isReady ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {isReady ? "✅ READY" : "❌ NOT READY"}
                  </span>
                </div>
              )}
              {quotedPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorResponse.priceLabel", "Harga Penawaran")}</span>
                  <span className="text-emerald-400 text-sm font-bold">Rp {parseFloat(quotedPrice).toLocaleString("id-ID")}</span>
                </div>
              )}
              {driverName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorResponse.driverLabel", "Driver")}</span>
                  <span className="text-white text-sm font-semibold">{driverName}</span>
                </div>
              )}
              {plateNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorResponse.plateLabel", "Plat Nomor")}</span>
                  <span className="text-white text-sm font-mono font-bold">{plateNumber}</span>
                </div>
              )}
              {estimatedPickupTime && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorResponse.pickupLabel", "Est. Pickup")}</span>
                  <span className="text-white text-sm font-semibold">{estimatedPickupTime}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-xs">{t("vendorResponse.adminContact", "Admin akan menghubungi Anda segera. Terima kasih! 🙏")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">CST LOGISTICS</p>
            <p className="text-white text-sm font-bold truncate">{t("vendorResponse.formTitle", "Vendor Response Form")}</p>
          </div>
          <div className="ml-auto">
            <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
              {orderNumber}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-5 pb-10">

        {/* Order Info Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-blue-600/10 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t("vendorResponse.orderDetailTitle", "Detail Order")}</span>
          </div>
          <div className="px-4 py-2">
            <InfoRow icon={<MapPin className="w-4 h-4" />} label={t("vendorResponse.routeLabel", "Rute")} value={`${order?.origin ?? "-"} → ${order?.destination ?? "-"}`} />
            {order?.commodity && (
              <InfoRow icon={<Package className="w-4 h-4" />} label={t("vendorResponse.cargoLabel", "Kategori Barang")} value={order.commodity} />
            )}
            {order?.grossWeight && (
              <InfoRow icon={<Weight className="w-4 h-4" />} label={t("vendorResponse.grossWeightLabel", "Gross Weight")} value={`${parseFloat(order.grossWeight).toLocaleString("id-ID")} KG`} />
            )}
            {order?.vehicleType && (
              <InfoRow icon={<Truck className="w-4 h-4" />} label={t("vendorResponse.vehicleTypeLabel", "Vehicle Type")} value={order.vehicleType} />
            )}
            {order?.vendorBasePrice != null && (
              <InfoRow
                icon={<span className="text-lg leading-none">💰</span>}
                label={t("vendorResponse.vendorPriceRefLabel", "Harga Vendor (Referensi)")}
                value={`Rp ${Math.round(order.vendorBasePrice).toLocaleString("id-ID")}`}
                highlight
              />
            )}
            {(order?.requiredDate || order?.jamOrder) && (
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label={t("vendorResponse.pickupScheduleLabel", "Jadwal Pickup")}
                value={`${formatDateID(order?.requiredDate ?? null)}${order?.jamOrder ? ` | ${order.jamOrder.replace(".", ":")} WIB` : ""}`}
              />
            )}
          </div>
        </div>

        {/* Response Form */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-slate-700/50 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">{t("vendorResponse.formTitle", "Form Response Vendor")}</span>
          </div>

          <div className="px-4 py-5 space-y-5">

            {/* Vendor Name */}
            <InputField
              label={t("vendorResponse.vendorNameLabel", "Nama Perusahaan / Vendor")}
              icon={<User className="w-3.5 h-3.5" />}
              value={vendorName}
              onChange={setVendorName}
              placeholder={t("vendorResponse.vendorNamePh", "Contoh: PT Wangsamas Logistics")}
            />

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                {t("vendorResponse.availabilityLabel", "Status Ketersediaan")}<span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStatus("READY")}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    status === "READY"
                      ? "border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10"
                      : "border-slate-600 bg-slate-800 text-slate-400 hover:border-green-500/50 hover:text-green-400/70"
                  }`}
                >
                  <CheckCircle2 className={`w-7 h-7 ${status === "READY" ? "text-green-400" : "text-slate-500"}`} />
                  ✅ READY
                  <span className="text-xs font-normal opacity-70">{t("vendorResponse.readyCaption", "Siap menjalankan order")}</span>
                </button>
                <button
                  onClick={() => setStatus("NOT_READY")}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    status === "NOT_READY"
                      ? "border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                      : "border-slate-600 bg-slate-800 text-slate-400 hover:border-red-500/50 hover:text-red-400/70"
                  }`}
                >
                  <XCircle className={`w-7 h-7 ${status === "NOT_READY" ? "text-red-400" : "text-slate-500"}`} />
                  ❌ NOT READY
                  <span className="text-xs font-normal opacity-70">{t("vendorResponse.notReadyCaption", "Tidak tersedia saat ini")}</span>
                </button>
              </div>
            </div>

            {/* Fields when READY */}
            {status === "READY" && (
              <div className="space-y-4 pt-1">
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-500 mb-4">{t("vendorResponse.fleetInfo", "Lengkapi informasi armada yang akan digunakan:")}</p>

                  <div className="space-y-4">
                    <InputField
                      label={t("vendorResponse.pickupTimeLabel", "Estimasi Waktu Pickup")}
                      icon={<Clock className="w-3.5 h-3.5" />}
                      value={estimatedPickupTime}
                      onChange={setEstimatedPickupTime}
                      placeholder={t("vendorResponse.pickupTimePh", "Contoh: 20 Mei 2026 09:00 WIB")}
                    />
                    <InputField
                      label={t("vendorResponse.driverNameLabel", "Nama Driver")}
                      icon={<User className="w-3.5 h-3.5" />}
                      value={driverName}
                      onChange={setDriverName}
                      placeholder={t("vendorResponse.driverNamePh", "Nama lengkap driver")}
                      required
                    />
                    <InputField
                      label={t("vendorResponse.driverPhoneLabel", "Nomor HP Driver")}
                      icon={<Phone className="w-3.5 h-3.5" />}
                      type="tel"
                      value={driverPhone}
                      onChange={setDriverPhone}
                      placeholder="08xxxxxxxxxx"
                    />
                    <InputField
                      label={t("vendorResponse.plateNumberLabel", "Plat Nomor Kendaraan")}
                      icon={<CarFront className="w-3.5 h-3.5" />}
                      value={plateNumber}
                      onChange={(v) => setPlateNumber(v.toUpperCase())}
                      placeholder="Contoh: B 1234 XYZ"
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        <span className="text-blue-400">💰</span>
                        {t("vendorResponse.priceOfferLabel", "Harga Penawaran")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                        <input
                          type="number"
                          value={quotedPrice}
                          onChange={(e) => setQuotedPrice(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                    <InputField
                      label={t("vendorResponse.vehicleTypeLabel2", "Jenis Kendaraan")}
                      icon={<Truck className="w-3.5 h-3.5" />}
                      value={vehicleType}
                      onChange={setVehicleType}
                      placeholder={t("vendorResponse.vehicleTypePh", "Contoh: CDD Box, Tronton, Fuso")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><FileText className="w-3.5 h-3.5" /></span>
                {t("vendorResponse.notesLabel", "Catatan / Keterangan")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("vendorResponse.notesPh", "Tambahkan catatan jika ada...")}
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><Camera className="w-3.5 h-3.5" /></span>
                {t("vendorResponse.photoLabel", "Foto Unit Kendaraan")}
                <span className="text-slate-500 normal-case font-normal">{t("vendorResponse.photoOptional", "(opsional)")}</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-600">
                  <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600/80 transition-colors"
                  >
                    {t("vendorResponse.photoRemove", "Hapus")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:text-blue-400 transition-all"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm font-medium">{t("vendorResponse.photoBtn", "Ambil / Pilih Foto")}</span>
                  <span className="text-xs text-slate-500">{t("vendorResponse.photoHint", "JPG, PNG, max 10MB")}</span>
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !status}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                submitting || !status
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("vendorResponse.submitting", "Mengirim...")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t("vendorResponse.submit", "Kirim Response")}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              {t("vendorResponse.submitNote", "Response Anda akan langsung diterima oleh tim admin.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
