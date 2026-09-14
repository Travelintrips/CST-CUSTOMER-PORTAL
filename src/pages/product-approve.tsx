import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Package, CheckCircle2, XCircle, MapPin, Calendar, Loader2, User, Tag } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ApproveItem {
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface ApproveData {
  orderNumber: string;
  customerName: string;
  status: string;
  orderType: string;
  items: ApproveItem[];
  vendorName: string | null;
  quotedPrice: number | null;
  readyDate: string | null;
  pickupLocation: string | null;
  notes: string | null;
  createdAt: string;
  canApprove: boolean;
  alreadyActed: boolean;
  actionLabel: string | null;
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ProductApprovePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ApproveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/api/portal-product/product-approve/${token}`)
      .then(r => r.json())
      .then((d: ApproveData & { error?: string }) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAction(action: "approve" | "reject") {
    if (!token) return;
    setActing(true);
    try {
      const r = await fetch(`${BASE}/api/portal-product/orders/${token}/customer-product-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = await r.json() as { success?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error ?? "Gagal memproses");
      setDone(action === "approve" ? "approved" : "rejected");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Link Tidak Valid</h2>
          <p className="text-gray-500 text-sm">{error ?? "Link tidak ditemukan atau sudah kadaluarsa."}</p>
        </div>
      </div>
    );
  }

  if (done === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">Produk Disetujui!</h2>
          <p className="text-gray-600 text-sm mb-4">
            No. Pesanan: <strong className="font-mono">{data.orderNumber}</strong>
          </p>
          <p className="text-gray-500 text-sm">Tim kami akan menghubungi Anda untuk memilih layanan pengiriman.</p>
        </div>
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Produk Ditolak</h2>
          <p className="text-gray-500 text-sm">Tim kami akan meninjau ulang dan menghubungi Anda segera.</p>
        </div>
      </div>
    );
  }

  if (data.alreadyActed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">ℹ️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Sudah Ditindaklanjuti</h2>
          <p className="text-gray-500 text-sm">{data.actionLabel ?? "Produk ini sudah disetujui atau ditolak sebelumnya."}</p>
        </div>
      </div>
    );
  }

  const totalProduct = data.items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Persetujuan Produk</p>
              <p className="font-mono font-bold text-lg text-gray-800">{data.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{data.customerName}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{fmtDate(data.createdAt)}</p>
        </div>

        {(data.vendorName || data.readyDate || data.pickupLocation || data.quotedPrice) && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Info Vendor &amp; Produk</p>
            {data.vendorName && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Tag className="w-4 h-4 shrink-0" />
                <span><strong>Vendor:</strong> {data.vendorName}</span>
              </div>
            )}
            {data.quotedPrice != null && data.quotedPrice > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Package className="w-4 h-4 shrink-0" />
                <span><strong>Harga Penawaran:</strong> {idr(data.quotedPrice)}</span>
              </div>
            )}
            {data.readyDate && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Calendar className="w-4 h-4 shrink-0" />
                <span><strong>Estimasi Siap:</strong> {data.readyDate}</span>
              </div>
            )}
            {data.pickupLocation && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <MapPin className="w-4 h-4 shrink-0" />
                <span><strong>Lokasi Ambil:</strong> {data.pickupLocation}</span>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Detail Produk</p>
          <div className="space-y-3">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.qty} {item.unit} × {idr(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-sm text-gray-700 shrink-0">{idr(item.subtotal)}</p>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
              <p className="font-semibold text-sm">Total Produk</p>
              <p className="font-bold text-base text-blue-600">{idr(totalProduct)}</p>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Catatan</p>
            <p className="text-sm text-gray-700">{data.notes}</p>
          </div>
        )}

        {data.canApprove && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={acting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {acting
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <CheckCircle2 className="w-5 h-5" />}
              Setujui Produk
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={acting}
              className="w-full py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {acting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <XCircle className="w-4 h-4" />}
              Tolak &amp; Minta Revisi
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          B2B Marketplace and Logistic · Hubungi kami jika ada pertanyaan
        </p>
      </div>
    </div>
  );
}
