import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { usePortalSSE } from "@/hooks/usePortalSSE";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface TrackItem {
  productName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

interface TimelineStep {
  status: string;
  label: string;
  icon: string;
  done: boolean;
  current: boolean;
}

interface TrackData {
  orderNumber: string;
  customerName: string;
  shippingAddress: string;
  status: string;
  grandTotal: number;
  productCategory: string | null;
  createdAt: string;
  paymentStatus: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  orderType: string | null;
  productApproveUrl: string | null;
  shipmentSelectionUrl: string | null;
  items: TrackItem[];
  timeline: TimelineStep[];
  isCancelled: boolean;
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface LiveToast {
  id: number;
  message: string;
  type: "status" | "payment";
}

export default function ProductOrderTrackPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const toastIdRef = useRef(0);
  const prevStatusRef = useRef<string | null>(null);
  const prevPaymentRef = useRef<string | null>(null);

  const fetchOrder = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await fetch(`${BASE}/api/portal-product/track/${token}`);
      const d = await r.json() as TrackData & { error?: string };
      if (!r.ok) throw new Error(d.error ?? "Order tidak ditemukan");
      setData(d);
      setError(null);
      prevStatusRef.current = d.status;
      prevPaymentRef.current = d.paymentStatus;
    } catch (e: unknown) {
      if (!silent) setError((e as Error).message);
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchOrder(false); }, [fetchOrder]);

  const addToast = useCallback((message: string, type: LiveToast["type"]) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const orderNumber = data?.orderNumber ?? null;

  const { connected } = usePortalSSE({
    order_status_update: useCallback((raw: unknown) => {
      const d = raw as { orderNumber?: string; status?: string; label?: string; paymentStatus?: string };
      if (!orderNumber || d?.orderNumber !== orderNumber) return;

      if (d.paymentStatus && d.paymentStatus !== prevPaymentRef.current) {
        prevPaymentRef.current = d.paymentStatus;
        addToast("✅ Pembayaran telah dikonfirmasi!", "payment");
        fetchOrder(true);
        return;
      }

      if (d.status && d.status !== prevStatusRef.current) {
        prevStatusRef.current = d.status;
        addToast(`📦 Status diperbarui: ${d.label ?? d.status}`, "status");
        fetchOrder(true);
      }
    }, [orderNumber, fetchOrder, addToast]),

    payment_confirmed: useCallback((raw: unknown) => {
      const d = raw as { orderNumber?: string };
      if (!orderNumber || d?.orderNumber !== orderNumber) return;
      prevPaymentRef.current = "paid";
      addToast("✅ Pembayaran telah dikonfirmasi!", "payment");
      fetchOrder(true);
    }, [orderNumber, fetchOrder, addToast]),
  }, { enabled: !!orderNumber });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm">{error ?? "Link tidak valid atau sudah kadaluarsa."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Live toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`w-full rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300 ${
              toast.type === "payment"
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Nomor Pesanan</p>
                {connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">offline</span>
                )}
                {refreshing && (
                  <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="font-mono font-bold text-lg text-gray-800">{data.orderNumber}</p>
              <p className="text-sm text-gray-500 mt-1">{fmtDate(data.createdAt)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="font-bold text-xl text-blue-600">{idr(data.grandTotal)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Pemesan</p>
            <p className="font-medium text-gray-800">{data.customerName}</p>
            <p className="text-sm text-gray-500 mt-0.5">📍 {data.shippingAddress}</p>
          </div>
        </div>

        {/* Status Banner */}
        {data.isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">❌</p>
            <p className="font-semibold text-red-700">Pesanan Dibatalkan</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">Status Pesanan</p>
            <div className="relative">
              {data.timeline.map((step, idx) => (
                <div key={step.status} className="flex gap-3 relative">
                  {idx < data.timeline.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${step.done ? "bg-blue-400" : "bg-gray-200"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 z-10 border-2 transition-all duration-500 ${
                    step.current
                      ? "bg-blue-500 border-blue-500 text-white shadow-md"
                      : step.done
                        ? "bg-blue-100 border-blue-300 text-blue-600"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {step.icon}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={`font-medium text-sm transition-colors duration-500 ${step.current ? "text-blue-700" : step.done ? "text-gray-700" : "text-gray-400"}`}>
                      {step.label}
                      {step.current && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">
                          SEKARANG
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product-First Action Buttons */}
        {data.orderType === "product_first" && data.status === "Customer Product Approval" && data.productApproveUrl && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-semibold text-sm text-amber-800 mb-1">✍️ Persetujuan Produk Diperlukan</p>
            <p className="text-xs text-amber-600 mb-3">Vendor produk sudah dipilih. Silakan review dan setujui penawaran produk.</p>
            <a
              href={data.productApproveUrl}
              className="block w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm text-center rounded-xl transition-colors"
            >
              Review &amp; Setujui Produk →
            </a>
          </div>
        )}

        {data.orderType === "product_first" && data.status === "Shipment Selection Pending" && data.shipmentSelectionUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="font-semibold text-sm text-blue-800 mb-1">🚚 Pilih Mode Pengiriman</p>
            <p className="text-xs text-blue-600 mb-3">Produk sudah dikonfirmasi. Silakan pilih cara pengiriman yang Anda inginkan.</p>
            <a
              href={data.shipmentSelectionUrl}
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm text-center rounded-xl transition-colors"
            >
              Pilih Mode Pengiriman →
            </a>
          </div>
        )}

        {/* Invoice & Payment */}
        {(data.invoiceUrl || data.paymentStatus) && (
          <div className={`rounded-2xl shadow-sm p-5 transition-all duration-500 ${data.paymentStatus === "paid" ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">
                  {data.paymentStatus === "paid" ? "✅ Pembayaran Diterima" : "💳 Menunggu Pembayaran"}
                </p>
                {data.paidAt && <p className="text-xs text-gray-500 mt-0.5">Dibayar: {fmtDate(data.paidAt)}</p>}
              </div>
              {data.invoiceUrl && data.paymentStatus !== "paid" && (
                <a
                  href={data.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lihat Invoice
                </a>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Detail Pesanan</p>
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
              <p className="font-semibold text-sm">Total</p>
              <p className="font-bold text-base text-blue-600">{idr(data.grandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          {connected
            ? "🟢 Tracking real-time aktif — status diperbarui otomatis"
            : "Hubungi kami jika ada pertanyaan mengenai pesanan Anda."}
        </p>
      </div>
    </div>
  );
}
