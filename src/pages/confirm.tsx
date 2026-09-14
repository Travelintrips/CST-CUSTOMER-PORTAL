import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Truck, MapPin, Package, User, Phone, ThumbsUp, ThumbsDown, ArrowRight, FileText, Calendar, Clock, Weight, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) { return `${BASE}${path}`; }

function fmt(n: number) {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function formatTanggal(iso: string | null): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  const month = BULAN[parseInt(m, 10) - 1] ?? m;
  return `${parseInt(d, 10)} ${month} ${y}`;
}

function getTokenFromUrl(): string {
  const pathname = window.location.pathname;
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const match = relative.match(/^\/confirm\/([^/]+)/);
  return match?.[1] ?? "";
}

interface ConfirmData {
  orderId: number;
  orderNumber: string;
  shipmentType: string;
  origin: string;
  destination: string;
  commodity: string | null;
  customerName: string;
  phone: string | null;
  finalSellingPrice: number;
  estimatedPickup: string | null;
  estimatedDelivery: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  truckType: string | null;
  vendorName: string | null;
  customerConfirmStatus: string;
  weight?: number | null;
  volume?: number | null;
  notes?: string | null;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  const { t } = useLanguage();
  const token = getTokenFromUrl();
  const [data, setData] = useState<ConfirmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"confirmed" | "rejected" | null>(null);
  const [salesOrderNumber, setSalesOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Link konfirmasi tidak valid.");
      setLoading(false);
      return;
    }
    fetch(apiUrl(`/api/logistic/orders/confirm-form/${token}`))
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); }
        else {
          setData(d as ConfirmData);
          if (d.customerConfirmStatus === "confirmed") setDone("confirmed");
          else if (d.customerConfirmStatus === "rejected") setDone("rejected");
        }
      })
      .catch(() => setError("Gagal memuat data. Coba lagi."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAction(action: "confirmed" | "rejected") {
    if (!token || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl(`/api/logistic/orders/confirm/${token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json() as { message?: string; salesOrderNumber?: string };
      if (!res.ok) { alert(json.message ?? t("confirmPage.errorMsg")); return; }
      if (json.salesOrderNumber) setSalesOrderNumber(json.salesOrderNumber);
      setDone(action);
    } catch {
      alert("Gagal mengirim konfirmasi. Periksa koneksi internet Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Link Tidak Valid</h2>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (done === "confirmed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Diterima!</h2>
          <p className="text-sm text-slate-500 mb-4">
            Terima kasih, <strong>{data.customerName}</strong>. Anda telah menyetujui penawaran harga untuk order <strong>{data.orderNumber}</strong>.
          </p>

          {/* Nomor Sales Order */}
          {salesOrderNumber && (
            <div className="bg-blue-600 rounded-2xl p-4 mb-3 text-white text-center">
              <p className="text-xs opacity-80 mb-1 flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" /> Nomor Sales Order Anda
              </p>
              <p className="text-2xl font-bold tracking-wide">{salesOrderNumber}</p>
              <p className="text-xs opacity-70 mt-1">Catat nomor ini sebagai referensi pemesanan Anda</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-slate-500 mb-0.5">Total yang Disetujui</p>
            <p className="text-lg font-bold text-green-700">{fmt(data.finalSellingPrice)}</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 text-left mb-4">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Tim kami akan menghubungi Anda dalam waktu dekat untuk konfirmasi jadwal pengiriman.
            </p>
          </div>
          <p className="text-xs text-slate-400">Screenshot halaman ini sebagai bukti konfirmasi Anda.</p>
        </div>
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-9 w-9 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Penawaran Ditolak</h2>
          <p className="text-sm text-slate-500 mb-2">
            Penawaran untuk order <strong>{data.orderNumber}</strong> telah ditolak.
          </p>
          <p className="text-xs text-slate-400">Tim kami akan menghubungi Anda untuk mendiskusikan alternatif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Konfirmasi Penawaran</p>
            <p className="font-bold text-slate-800">{data.orderNumber}</p>
          </div>
        </div>

        {/* Detail Order */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Detail Order</h3>

          <div className="space-y-3">
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label={t("confirmPage.customerName")}
              value={data.customerName}
            />
            {data.phone && (
              <DetailRow
                icon={<Phone className="h-4 w-4" />}
                label="No. Telepon"
                value={
                  <a href={`tel:${data.phone}`} className="text-blue-600 hover:underline">
                    {data.phone}
                  </a>
                }
              />
            )}
            <DetailRow
              icon={<Truck className="h-4 w-4" />}
              label="Jenis Pengiriman"
              value={data.shipmentType}
            />
            {data.truckType && (
              <DetailRow
                icon={<Truck className="h-4 w-4" />}
                label="Tipe Unit"
                value={data.truckType}
              />
            )}
          </div>

          {/* Rute: Origin → Destination */}
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Rute Pengiriman
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-slate-200">
                <p className="text-xs text-slate-400 mb-0.5">Asal</p>
                <p className="text-sm font-semibold text-slate-700">{data.origin}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-slate-200">
                <p className="text-xs text-slate-400 mb-0.5">Tujuan</p>
                <p className="text-sm font-semibold text-slate-700">{data.destination}</p>
              </div>
            </div>
          </div>

          {/* Commodity + weight/volume */}
          {(data.commodity || data.weight || data.volume) && (
            <div className="space-y-2">
              {data.commodity && (
                <DetailRow
                  icon={<Package className="h-4 w-4" />}
                  label="Komoditi / Muatan"
                  value={data.commodity}
                />
              )}
              {(data.weight || data.volume) && (
                <div className="flex gap-3">
                  {data.weight && (
                    <div className="flex-1 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Weight className="h-3 w-3" /> Berat</p>
                      <p className="text-sm font-medium text-slate-700">{data.weight.toLocaleString("id-ID")} kg</p>
                    </div>
                  )}
                  {data.volume && (
                    <div className="flex-1 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">Volume</p>
                      <p className="text-sm font-medium text-slate-700">{data.volume.toLocaleString("id-ID")} m³</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <DetailRow
              icon={<FileText className="h-4 w-4" />}
              label="Catatan"
              value={data.notes}
            />
          )}
        </div>

        {/* Jadwal Pickup (trucking) ATAU Estimasi (non-trucking) */}
        {(data.pickupDate || data.truckType) ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Jadwal Pickup</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {data.pickupDate && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal Pickup</p>
                  <p className="font-semibold text-slate-700">{formatTanggal(data.pickupDate)}</p>
                </div>
              )}
              {data.pickupTime && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Jam Pickup</p>
                  <p className="font-semibold text-slate-700">{data.pickupTime} WIB</p>
                </div>
              )}
            </div>
          </div>
        ) : (data.estimatedPickup || data.estimatedDelivery) ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Estimasi</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {data.estimatedPickup && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Pickup</p>
                  <p className="font-semibold text-slate-700">{data.estimatedPickup}</p>
                </div>
              )}
              {data.estimatedDelivery && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Delivery</p>
                  <p className="font-semibold text-slate-700">{data.estimatedDelivery}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Harga */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white text-center shadow-md">
          <p className="text-sm opacity-80 mb-1">Total Harga Penawaran</p>
          <p className="text-3xl font-bold">{fmt(data.finalSellingPrice)}</p>
          {data.vendorName && (
            <p className="text-xs opacity-70 mt-1">Dilayani oleh {data.vendorName}</p>
          )}
        </div>

        {/* Keterangan Sales Order + Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-sm text-slate-700 font-medium text-center">
            Apakah Anda menyetujui penawaran harga di atas?
          </p>

          {/* Keterangan Sales Order */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Dengan menekan <strong>"Ya, Saya Setuju"</strong>, penawaran ini akan dikonfirmasi dan{" "}
              <strong>Sales Order akan otomatis dibuat</strong> oleh sistem kami. Tim akan segera menghubungi Anda.
            </p>
          </div>

          <button
            onClick={() => handleAction("confirmed")}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold rounded-xl py-3 transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
            Ya, Saya Setuju
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 active:scale-95 font-medium rounded-xl py-3 transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
            Tidak, Tolak Penawaran
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Konfirmasi ini bersifat mengikat. Pastikan detail order di atas sudah sesuai sebelum menyetujui.
        </p>
      </div>
    </div>
  );
}
