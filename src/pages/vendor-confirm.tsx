// [TRUCKING-FIX] Halaman konfirmasi vendor: YES/NO + editable price untuk trucking order
import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Truck, MapPin, Package, DollarSign, Pencil, X } from "lucide-react";

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function formatTanggal(iso: string | null): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  const month = BULAN[parseInt(m, 10) - 1] ?? m;
  return `${parseInt(d, 10)} ${month} ${y}`;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) { return `${BASE}${path}`; }

function fmt(n: number) {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function parseRupiah(raw: string): number {
  return Number(raw.replace(/[^0-9]/g, ""));
}

interface VendorConfirmData {
  orderId: number;
  orderNumber: string;
  rfqNumber: string;
  origin: string;
  destination: string;
  commodity: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  truckType: string | null;
  basePrice: number;
  vendorName: string;
  confirmStatus: string;
}

export default function VendorConfirmPage() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId") ?? "";
  const token = params.get("token") ?? "";

  const [data, setData] = useState<VendorConfirmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"vendor_confirmed" | "vendor_rejected" | null>(null);
  const [confirmedPrice, setConfirmedPrice] = useState<number>(0);

  // Price editing state
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    if (!orderId || !token) {
      setError("Link konfirmasi tidak valid.");
      setLoading(false);
      return;
    }
    fetch(apiUrl(`/api/logistic/orders/vendor-confirm-page?orderId=${orderId}&token=${encodeURIComponent(token)}`))
      .then((r) => r.json())
      .then((d) => {
        if (d.message) { setError(d.message); return; }
        setData(d as VendorConfirmData);
        setPriceInput(String(Math.round((d as VendorConfirmData).basePrice)));
        if (d.confirmStatus === "vendor_confirmed") setDone("vendor_confirmed");
        else if (d.confirmStatus === "vendor_rejected") setDone("vendor_rejected");
      })
      .catch(() => setError("Gagal memuat data. Periksa koneksi internet Anda."))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  function handlePriceChange(val: string) {
    // Hanya angka
    const digits = val.replace(/[^0-9]/g, "");
    setPriceInput(digits);
  }

  function currentPrice(): number {
    const parsed = parseRupiah(priceInput);
    return parsed > 0 ? parsed : (data?.basePrice ?? 0);
  }

  async function handleAction(action: "accept" | "reject") {
    if (!orderId || !token || submitting) return;
    setSubmitting(true);
    const price = currentPrice();
    try {
      const body: Record<string, unknown> = { orderId: Number(orderId), token, action };
      if (action === "accept") body.vendorPrice = price;
      const res = await fetch(apiUrl("/api/logistic/orders/vendor-confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) { alert(json.message ?? "Terjadi kesalahan"); return; }
      setConfirmedPrice(price);
      setDone(action === "accept" ? "vendor_confirmed" : "vendor_rejected");
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

  if (done === "vendor_confirmed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Terima Kasih!</h2>
          <p className="text-sm text-slate-500 mb-4">
            Anda telah <strong>menerima</strong> order <strong>{data.orderNumber}</strong>.<br />
            Tim kami akan segera menindaklanjuti.
          </p>
          <div className="bg-green-50 rounded-xl p-4 text-green-800 font-semibold">
            {fmt(confirmedPrice || data.basePrice)}
          </div>
        </div>
      </div>
    );
  }

  if (done === "vendor_rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-9 w-9 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Order Ditolak</h2>
          <p className="text-sm text-slate-500">
            Anda telah menolak order <strong>{data.orderNumber}</strong>.<br />
            Kami akan mencari armada lain.
          </p>
        </div>
      </div>
    );
  }

  const displayPrice = currentPrice();
  const priceChanged = displayPrice !== data.basePrice;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Request Konfirmasi Trucking</p>
            <p className="font-bold text-slate-800">{data.rfqNumber}</p>
            <p className="text-xs text-slate-400">Order: {data.orderNumber}</p>
          </div>
        </div>

        {/* Detail Order */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Detail Pengiriman</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Rute</p>
                <p className="font-medium text-slate-700">{data.origin} → {data.destination}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Jadwal Pickup</p>
                <p className="font-medium text-slate-700">
                  {formatTanggal(data.pickupDate)}{data.pickupTime ? ` Pukul ${data.pickupTime} WIB` : ""}
                </p>
              </div>
            </div>
            {data.truckType && (
              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Tipe Unit</p>
                  <p className="font-medium text-slate-700">{data.truckType}</p>
                </div>
              </div>
            )}
            {data.commodity && (
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Komoditi</p>
                  <p className="font-medium text-slate-700">{data.commodity}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Harga Dasar — editable */}
        <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 opacity-80" />
            <p className="text-sm opacity-80">Harga Penawaran Anda</p>
          </div>

          {editingPrice ? (
            <div className="flex items-center gap-2 justify-center mt-1">
              <span className="text-xl font-bold opacity-90">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-40 text-center text-2xl font-bold bg-white/20 border-b-2 border-white rounded-lg px-3 py-1 placeholder-white/60 outline-none focus:bg-white/30 text-white"
                placeholder="0"
                autoFocus
              />
              <button
                onClick={() => setEditingPrice(false)}
                className="ml-1 p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
                title="Selesai edit"
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{fmt(displayPrice)}</p>
              <button
                onClick={() => setEditingPrice(true)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
                title="Ubah harga"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}

          {priceChanged && !editingPrice && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="text-xs opacity-70 line-through">{fmt(data.basePrice)}</p>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-medium">Harga diubah</span>
              <button
                onClick={() => { setPriceInput(String(Math.round(data.basePrice))); }}
                className="text-xs opacity-70 hover:opacity-100 underline"
              >
                reset
              </button>
            </div>
          )}

          {!priceChanged && !editingPrice && (
            <p className="text-xs opacity-70 mt-1 text-center">Ketuk ✏️ untuk mengubah harga</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <p className="text-sm text-slate-600 text-center font-medium">
            Apakah Anda dapat melayani order ini?
          </p>
          <button
            onClick={() => handleAction("accept")}
            disabled={submitting || editingPrice}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold rounded-xl py-4 text-base transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            ✅ TERIMA{priceChanged ? ` (${fmt(displayPrice)})` : " JADWAL & HARGA"}
          </button>
          {editingPrice && (
            <p className="text-xs text-center text-amber-600">Selesaikan edit harga terlebih dahulu ✓</p>
          )}
          <button
            onClick={() => handleAction("reject")}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 active:scale-95 font-bold rounded-xl py-4 text-base transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertCircle className="h-5 w-5" />}
            ❌ TOLAK
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center pb-6">
          Batas konfirmasi: 24 jam dari pengiriman WA.
        </p>
      </div>
    </div>
  );
}
