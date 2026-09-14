import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { CheckCircle2, XCircle, FileText, AlertCircle, Package, User, ShoppingBag, DollarSign, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) {
  return `${BASE}${path}`;
}

interface ProductItem {
  productName: string;
  productSku: string | null;
  qty: number;
  unit: string | null;
  unitPrice: number;
  subtotal: number;
}

interface ProductOrderVendorInfo {
  orderNumber: string;
  customerName: string;
  shippingAddress: string;
  notes: string | null;
  grandTotal: number;
  items: ProductItem[];
  alreadySubmitted: boolean;
}

function formatRupiah(n: number) {
  return n.toLocaleString("id-ID");
}

export default function VendorProductApprovalPage() {
  const { t } = useLanguage();
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber ?? "";
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const vrToken = searchParams.get("t") ?? "";

  const [order, setOrder] = useState<ProductOrderVendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [status, setStatus] = useState<"SETUJU" | "TOLAK" | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); setNotFound(true); return; }
    setLoading(true);
    setNetworkError(null);
    const qs = vrToken ? `?t=${encodeURIComponent(vrToken)}` : "";
    fetch(apiUrl(`/api/portal-product/vendor-access/${orderNumber}${qs}`))
      .then(async (r) => {
        if (r.status === 403 || r.status === 404) { setNotFound(true); return; }
        const data: ProductOrderVendorInfo = await r.json();
        setOrder(data);
        if (data.alreadySubmitted) setSubmitted(true);
      })
      .catch(() => setNetworkError(t("vendorProductApproval.networkError", "Gagal memuat data. Periksa koneksi internet Anda.")))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  async function handleSubmit() {
    if (!status) { setError(t("vendorProductApproval.selectStatusError", "Pilih SETUJU atau TOLAK terlebih dahulu.")); return; }
    setError(null);
    setSubmitting(true);
    try {
      const qs = vrToken ? `?t=${encodeURIComponent(vrToken)}` : "";
      const res = await fetch(apiUrl(`/api/portal-product/vendor-response/${orderNumber}${qs}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName: vendorName.trim() || null,
          vendorPhone: vendorPhone.trim() || null,
          status,
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : null,
          notes: notes.trim() || null,
          token: vrToken || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("vendorProductApproval.submitError", "Terjadi kesalahan. Coba lagi."));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t("vendorProductApproval.connectionError", "Koneksi gagal. Periksa internet Anda dan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">{t("vendorProductApproval.loadingOrder", "Memuat data order...")}</p>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-sm">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto" />
          <h2 className="text-white text-xl font-bold">{t("vendorProductApproval.loadFailed", "Gagal Memuat")}</h2>
          <p className="text-slate-400 text-sm">{networkError}</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-white text-xl font-bold">{t("vendorProductApproval.orderNotFound", "Order Tidak Ditemukan")}</h2>
          <p className="text-slate-400 text-sm">
            {t("vendorProductApproval.orderNotFoundDesc", "No. order")} <span className="font-mono text-blue-400">{orderNumber}</span> {t("vendorProductApproval.orderNotFoundSuffix", "tidak ditemukan atau link tidak valid.")}
          </p>
          <p className="text-slate-500 text-xs">{t("vendorProductApproval.checkLink", "Pastikan link yang digunakan benar, atau hubungi admin.")}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">CST LOGISTICS</p>
              <p className="text-white text-sm font-bold">{t("vendorProductApproval.vendorResponse", "Vendor Response")}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${status === "TOLAK" ? "bg-red-500/20" : "bg-green-500/20"}`}>
            {status === "TOLAK"
              ? <XCircle className="w-10 h-10 text-red-400" />
              : <CheckCircle2 className="w-10 h-10 text-green-400" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-white text-2xl font-bold">{t("vendorProductApproval.responseSent", "Response Terkirim!")}</h2>
            <p className="text-slate-400 text-sm">
              {t("vendorProductApproval.responseSentDesc", "Response Anda untuk order")} <span className="font-mono text-blue-400">{orderNumber}</span> {t("vendorProductApproval.responseSentSuffix", "telah dikirim ke admin.")}
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 w-full max-w-sm text-left space-y-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{t("vendorProductApproval.summary", "Ringkasan")}</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{t("vendorProductApproval.orderNo", "No. Order")}</span>
                <span className="text-white text-sm font-mono font-bold">{orderNumber}</span>
              </div>
              {status && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorProductApproval.statusLabel", "Status")}</span>
                  <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${status === "SETUJU" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {status === "SETUJU" ? "✅ SETUJU" : "❌ TOLAK"}
                  </span>
                </div>
              )}
              {quotedPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{t("vendorProductApproval.quotedPrice", "Harga Penawaran")}</span>
                  <span className="text-emerald-400 text-sm font-bold">Rp {formatRupiah(parseFloat(quotedPrice))}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-500 text-xs">{t("vendorProductApproval.adminWillContact", "Admin akan menghubungi Anda segera. Terima kasih! 🙏")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">CST LOGISTICS</p>
            <p className="text-white text-sm font-bold truncate">{t("vendorProductApproval.confirmOrderTitle", "Konfirmasi Order Produk")}</p>
          </div>
          <div className="ml-auto">
            <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
              {orderNumber}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-5 pb-10">

        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-blue-600/10 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t("vendorProductApproval.orderDetail", "Detail Order")}</span>
          </div>
          <div className="px-4 py-3 space-y-0">
            <div className="flex items-start gap-3 py-2.5 border-b border-white/10">
              <User className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{t("vendorProductApproval.customer", "Pelanggan")}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{order?.customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2.5 border-b border-white/10 last:border-0">
              <FileText className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{t("vendorProductApproval.shippingAddress", "Alamat Pengiriman")}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{order?.shippingAddress}</p>
              </div>
            </div>
            {order?.notes && (
              <div className="flex items-start gap-3 py-2.5 border-b border-white/10 last:border-0">
                <FileText className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{t("vendorProductApproval.customerNotes", "Catatan Customer")}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-slate-700/50 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">{t("vendorProductApproval.productList", "Daftar Produk")}</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            {order?.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{item.productName}</p>
                  <p className="text-slate-400 text-xs">{item.qty} {item.unit ?? "pcs"} × Rp {formatRupiah(item.unitPrice)}</p>
                </div>
                <span className="text-emerald-300 text-sm font-bold ml-3 shrink-0">Rp {formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-600">
              <span className="text-slate-300 text-sm font-bold">{t("vendorProductApproval.total", "Total")}</span>
              <span className="text-white text-base font-bold">Rp {formatRupiah(order?.grandTotal ?? 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="bg-slate-700/50 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">{t("vendorProductApproval.responseFormTitle", "Form Response Vendor")}</span>
          </div>
          <div className="px-4 py-5 space-y-5">

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><User className="w-3.5 h-3.5" /></span>
                {t("vendorProductApproval.vendorName", "Nama Perusahaan / Vendor")}
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder={t("vendorProductApproval.vendorNamePlaceholder", "Contoh: PT Wangsamas Logistics")}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><Phone className="w-3.5 h-3.5" /></span>
                {t("vendorProductApproval.vendorPhone", "No. HP / WhatsApp Vendor")} <span className="text-slate-500 normal-case font-normal">({t("vendorProductApproval.optional", "opsional")})</span>
              </label>
              <input
                type="tel"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder={t("vendorProductApproval.vendorPhonePlaceholder", "Contoh: 08123456789")}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p className="text-xs text-slate-500">{t("vendorProductApproval.vendorPhoneHint", "Digunakan untuk mengirim konfirmasi WA ke Anda")}</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                {t("vendorProductApproval.confirmOrder", "Konfirmasi Order")}<span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStatus("SETUJU")}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    status === "SETUJU"
                      ? "border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10"
                      : "border-slate-600 bg-slate-800 text-slate-400 hover:border-green-500/50 hover:text-green-400/70"
                  }`}
                >
                  <CheckCircle2 className={`w-7 h-7 ${status === "SETUJU" ? "text-green-400" : "text-slate-500"}`} />
                  ✅ SETUJU
                  <span className="text-xs font-normal opacity-70">{t("vendorProductApproval.canFulfill", "Bisa memenuhi order")}</span>
                </button>
                <button
                  onClick={() => setStatus("TOLAK")}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    status === "TOLAK"
                      ? "border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                      : "border-slate-600 bg-slate-800 text-slate-400 hover:border-red-500/50 hover:text-red-400/70"
                  }`}
                >
                  <XCircle className={`w-7 h-7 ${status === "TOLAK" ? "text-red-400" : "text-slate-500"}`} />
                  ❌ TOLAK
                  <span className="text-xs font-normal opacity-70">{t("vendorProductApproval.cannotFulfill", "Tidak bisa memenuhi")}</span>
                </button>
              </div>
            </div>

            {status === "SETUJU" && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span className="text-blue-400"><DollarSign className="w-3.5 h-3.5" /></span>
                  {t("vendorProductApproval.quotedPrice", "Harga Penawaran")}
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
            )}

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span className="text-blue-400"><FileText className="w-3.5 h-3.5" /></span>
                {t("vendorProductApproval.notes", "Catatan")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("vendorProductApproval.notesPlaceholder", "Tambahkan catatan jika ada...")}
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

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
                  {t("vendorProductApproval.sending", "Mengirim...")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t("vendorProductApproval.submitResponse", "Kirim Response")}
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              {t("vendorProductApproval.responseNote", "Response Anda akan langsung diterima oleh tim admin.")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
