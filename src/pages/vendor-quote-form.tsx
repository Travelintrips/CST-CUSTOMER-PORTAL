import { useState, useEffect } from "react";
import { Truck, MapPin, Package, Weight, CheckCircle2, AlertCircle, Loader2, CalendarDays, ClipboardList, DollarSign, FileText, ShoppingCart, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
function apiUrl(path: string) {
  return `${BASE}${path}`;
}

const fmtRp = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

interface OrderItem {
  serviceName: string;
  category: string;
}

interface RfqItem {
  orderItemId: number;
  productName: string;
  quantity: number;
  unit: string;
  sellingUnitPrice: number | null;
  sellingSubtotal: number | null;
  vendorUnitPrice: number | null;
  vendorSubtotal: number | null;
  ppnRate: number;
  ppnAmount: number | null;
  vendorGrandTotal: number | null;
}

interface RfqSummary {
  totalQuantity: number;
  vendorSubtotal: number;
  ppnRate: number;
  ppnAmount: number;
  vendorGrandTotal: number;
}

interface RfqFormData {
  rfqNumber: string;
  orderNumber: string;
  vendorName: string;
  shipmentType: string;
  origin: string;
  destination: string;
  commodity: string | null;
  cargoDescription: string | null;
  grossWeight: number | null;
  volumeCbm: number | null;
  requiredDate: string | null;
  vehicleType: string | null;
  vendorBasePrice: number | null;
  alreadySubmitted: boolean;
  orderItems?: OrderItem[] | null;
  items?: RfqItem[] | null;
  summary?: RfqSummary | null;
  createdAt?: string | null;
  jamOrder?: string | null;
  isTrucking?: boolean;
}

export default function VendorQuoteFormPage() {
  const { t } = useLanguage();
  const params = new URLSearchParams(window.location.search);
  const rfqNumber = params.get("rfq") ?? "";
  const vendorId = params.get("v") ?? "";
  const token = params.get("token") ?? "";

  const [data, setData] = useState<RfqFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vendorPrice, setVendorPrice] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [estimatedPickup, setEstimatedPickup] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Build optional row labels from translations
  const fmt = (labelKey: string, labelFallback: string, value: string | null | undefined) => {
    if (!value) return null;
    return { label: t(labelKey, labelFallback), value };
  };

  useEffect(() => {
    if (!rfqNumber || !vendorId) {
      setError(t("vendorQuote.errorLinkInvalid", "Link tidak valid. Parameter rfq dan v diperlukan."));
      setLoading(false);
      return;
    }
    if (!token) {
      setError(t("vendorQuote.errorTokenMissing", "Link tidak valid. Token tidak ditemukan."));
      setLoading(false);
      return;
    }
    fetch(apiUrl(`/api/logistic/orders/rfq-form?rfq=${encodeURIComponent(rfqNumber)}&v=${encodeURIComponent(vendorId)}&token=${encodeURIComponent(token)}`))
      .then((r) => r.ok ? r.json() : r.json().then((e: { message: string }) => Promise.reject(e.message)))
      .then((d: RfqFormData) => {
        setData(d);
        const firstItem = d.items?.[0];
        if (firstItem?.vendorUnitPrice != null) {
          setVendorPrice(String(Math.round(firstItem.vendorUnitPrice)));
        } else if (d.vendorBasePrice != null) {
          setVendorPrice(String(Math.round(d.vendorBasePrice)));
        }
        if (d.alreadySubmitted) setSuccess(true);
      })
      .catch((msg: unknown) => setError(typeof msg === "string" ? msg : t("vendorQuote.errorLoadFailed", "Gagal memuat data RFQ")))
      .finally(() => setLoading(false));
  }, [rfqNumber, vendorId, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(vendorPrice.replace(/[^\d.]/g, ""));
    if (isNaN(price) || price <= 0) {
      setSubmitError(t("vendorQuote.errorInvalidPrice", "Harga penawaran tidak valid"));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, unknown> = {
        rfqNumber,
        vendorId: parseInt(vendorId, 10),
        vendorPrice: price,
        token,
      };
      body.currency = currency;
      if (estimatedPickup) body.estimatedPickup = estimatedPickup;
      if (estimatedDelivery) body.estimatedDelivery = estimatedDelivery;
      if (estimatedDays) body.estimatedDays = parseInt(estimatedDays, 10);
      if (notes.trim()) body.notes = notes.trim();

      const r = await fetch(apiUrl("/api/logistic/orders/vendor-quote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json() as { message?: string };
        throw new Error(e.message ?? t("vendorQuote.errorSubmitFailed", "Gagal mengirim penawaran"));
      }
      setSuccess(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : t("vendorQuote.errorSubmitFailed", "Gagal mengirim penawaran"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">{t("vendorQuote.loading", "Memuat data RFQ...")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="font-semibold text-white">{t("vendorQuote.notFoundTitle", "RFQ Tidak Ditemukan")}</h2>
          <p className="text-sm text-slate-400">{error ?? t("vendorQuote.notFoundDesc", "Link tidak valid atau sudah kedaluwarsa.")}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">{t("vendorQuote.successTitle", "Penawaran Terkirim!")}</h2>
            <p className="text-sm text-slate-400 mt-1">{t("vendorQuote.successDesc", "Tim admin akan segera memproses penawaran Anda")}</p>
          </div>
          <div className="bg-slate-700 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">{t("vendorQuote.rfqNoLabel", "No. RFQ")}</span>
              <span className="font-mono text-white font-medium">{data.rfqNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("vendorQuote.orderNoLabel", "No. Order")}</span>
              <span className="font-mono text-white font-medium">{data.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("vendorQuote.vendorLabel", "Vendor")}</span>
              <span className="text-white font-medium">{data.vendorName}</span>
            </div>
            {vendorPrice && (
              <div className="flex justify-between border-t border-slate-600 pt-2 mt-2">
                <span className="text-slate-400">{t("vendorQuote.offeredPrice", "Harga Ditawarkan")}</span>
                <span className="text-green-400 font-bold">
                  Rp {Math.round(parseFloat(vendorPrice.replace(/[^\d.]/g, ""))).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">{t("vendorQuote.thankYou", "Terima kasih atas partisipasi Anda")}</p>
        </div>
      </div>
    );
  }

  const optionalRows = [
    fmt("vendorQuote.vehicleTypeLabel", "Tipe Kendaraan", data.vehicleType),
    fmt("vendorQuote.commodityLabel", "Komoditi", data.commodity),
    fmt("vendorQuote.cargoDescLabel", "Deskripsi Muatan", data.cargoDescription),
    fmt("vendorQuote.weightLabel", "Berat", data.grossWeight ? `${data.grossWeight.toLocaleString("id-ID")} kg` : null),
    fmt("vendorQuote.volumeLabel", "Volume", data.volumeCbm ? `${data.volumeCbm} CBM` : null),
    fmt("vendorQuote.requiredDateLabel", "Tgl Butuh", data.requiredDate),
  ].filter(Boolean) as { label: string; value: string }[];

  const productItems = (data.items ?? []).filter((it) => it.sellingUnitPrice != null && it.sellingUnitPrice > 0);
  const isProductOrder = productItems.length > 0;

  const unitPriceNum = parseFloat(vendorPrice.replace(/[^\d.]/g, "")) || 0;
  const firstItem = data.items?.[0];
  const previewQty = firstItem?.quantity ?? 1;
  const previewUnit = firstItem?.unit ?? "Unit";
  const previewSubtotal = Math.round(unitPriceNum * previewQty);
  const previewPpn = Math.round(previewSubtotal * 0.11);
  const previewGrandTotal = previewSubtotal + previewPpn;

  return (
    <div className="min-h-screen bg-slate-900 pb-10">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">{t("vendorQuote.formVendorLabel", "Form Penawaran Vendor")}</p>
            <p className="font-mono text-sm font-semibold text-white leading-tight">{data.rfqNumber}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400">{t("vendorQuote.vendorLabel", "Vendor")}</p>
            <p className="text-sm font-semibold text-blue-400 max-w-[140px] truncate">{data.vendorName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Detail Order */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5" /> {t("vendorQuote.requestDetailTitle", "Detail Permintaan")}
          </h3>
          <div className="space-y-2.5">
            {/* No. Order */}
            <div className="flex items-start gap-3">
              <div className="w-4 mt-0.5 flex-shrink-0 text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("vendorQuote.orderNoCol", "No. Order")}</p>
                <p className="text-sm text-white font-mono font-medium">{data.orderNumber || data.rfqNumber}</p>
              </div>
            </div>

            {/* Jenis Layanan */}
            <div className="flex items-start gap-3">
              <div className="w-4 mt-0.5 flex-shrink-0 text-slate-500">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">{t("vendorQuote.serviceTypeLabel", "Jenis Layanan")}</p>
                <p className="text-sm text-white font-medium">{data.shipmentType || "—"}</p>
                {!isProductOrder && data.orderItems && data.orderItems.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {data.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ShoppingCart className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-blue-300">{item.serviceName || item.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tanggal & Jam Order — trucking only */}
            {data.isTrucking && (data.createdAt || data.jamOrder) && (
              <div className="flex items-start gap-3">
                <div className="w-4 mt-0.5 flex-shrink-0 text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t("vendorQuote.orderDateLabel", "Tanggal & Jam Order")}</p>
                  <p className="text-sm text-white font-medium">
                    {data.createdAt
                      ? new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "long", year: "numeric" }).format(new Date(data.createdAt))
                      : ""}
                    {data.jamOrder ? ` · ${data.jamOrder}` : data.createdAt
                      ? ` · ${new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(data.createdAt)).replace(":", ".")}`
                      : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Rute */}
            <div className="flex items-start gap-3">
              <div className="w-4 mt-0.5 flex-shrink-0 text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("vendorQuote.routeLabel", "Rute")}</p>
                <p className="text-sm text-white font-medium">
                  {(data.origin || data.destination)
                    ? `${data.origin || "—"} → ${data.destination || "—"}`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Optional rows */}
            {optionalRows.map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-4 mt-0.5 flex-shrink-0 text-slate-500">
                  {label === t("vendorQuote.vehicleTypeLabel", "Tipe Kendaraan") && <Truck className="w-4 h-4" />}
                  {label === t("vendorQuote.commodityLabel", "Komoditi") && <Package className="w-4 h-4" />}
                  {label === t("vendorQuote.cargoDescLabel", "Deskripsi Muatan") && <FileText className="w-4 h-4" />}
                  {(label === t("vendorQuote.weightLabel", "Berat") || label === t("vendorQuote.volumeLabel", "Volume")) && <Weight className="w-4 h-4" />}
                  {label === t("vendorQuote.requiredDateLabel", "Tgl Butuh") && <CalendarDays className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm text-white font-medium">{value}</p>
                </div>
              </div>
            ))}

            {/* Harga referensi — non-product only */}
            {!isProductOrder && data.vendorBasePrice != null && (
              <div className="flex items-start gap-3 mt-1 pt-2.5 border-t border-slate-700">
                <div className="w-4 mt-0.5 flex-shrink-0 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t("vendorQuote.vendorPriceRefLabel", "Harga Referensi Vendor")}</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {fmtRp(Math.round(data.vendorBasePrice))}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{t("vendorQuote.vendorPriceRefNote", "Berdasarkan katalog vendor — dapat disesuaikan")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Produk — product orders only */}
        {isProductOrder && (
          <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5" /> {t("vendorQuote.productDetailTitle", "Detail Produk")}
            </h3>

            {productItems.map((item, idx) => (
              <div key={idx} className="space-y-2">
                {idx > 0 && <div className="border-t border-slate-700 pt-4" />}
                <p className="text-sm font-semibold text-white">{item.productName}</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("vendorQuote.qtyLabel", "Qty")}</span>
                    <span className="text-white font-medium">{item.quantity} {item.unit}</span>
                  </div>
                  {item.sellingUnitPrice != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("vendorQuote.sellingUnitPriceLabel", "Harga Jual/Unit")}</span>
                      <span className="text-slate-300">{fmtRp(item.sellingUnitPrice)}</span>
                    </div>
                  )}
                  {item.sellingSubtotal != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t("vendorQuote.totalSellingLabel", "Total Harga Jual")}</span>
                      <span className="text-slate-300">{fmtRp(item.sellingSubtotal)}</span>
                    </div>
                  )}
                  {item.vendorUnitPrice != null && (
                    <>
                      <div className="border-t border-slate-700 my-1" />
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t("vendorQuote.vendorBasePriceLabel", "Harga Dasar Vendor/Unit")}</span>
                        <span className="text-emerald-400 font-medium">{fmtRp(item.vendorUnitPrice)}</span>
                      </div>
                      {item.vendorSubtotal != null && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t("vendorQuote.vendorSubtotalItemLabel", "Subtotal Vendor")}</span>
                          <span className="text-emerald-400">{fmtRp(item.vendorSubtotal)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Ringkasan */}
            {data.summary && data.summary.vendorSubtotal > 0 && (
              <div className="border-t border-slate-700 pt-3 mt-2 space-y-1.5 text-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("vendorQuote.summaryTitle", "Ringkasan")}</p>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("vendorQuote.vendorSubtotalLabel", "Subtotal Vendor")}</span>
                  <span className="text-white">{fmtRp(data.summary.vendorSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t("vendorQuote.ppnLabel", "PPN 11%")}</span>
                  <span className="text-white">{fmtRp(data.summary.ppnAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1.5 mt-1">
                  <span className="font-semibold text-white">{t("vendorQuote.grandTotalLabel", "Grand Total Vendor")}</span>
                  <span className="font-bold text-emerald-400">{fmtRp(data.summary.vendorGrandTotal)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t("vendorQuote.basePriceNote", "*Harga dasar belum termasuk margin. PPN dihitung dari subtotal vendor.")}</p>
              </div>
            )}
          </div>
        )}

        {/* Form Penawaran */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isProductOrder ? t("vendorQuote.formTitleNew", "Ajukan Harga Baru") : t("vendorQuote.formTitleOffer", "Isi Penawaran Anda")}
          </h3>

          {/* Harga input */}
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {isProductOrder ? t("vendorQuote.newUnitPrice", "Harga Satuan Baru") : t("vendorQuote.basePriceOffer", "Harga Dasar Penawaran")} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-400">{currency}</span>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-14 pr-4 py-3 text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                  value={vendorPrice}
                  onChange={(e) => setVendorPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
              {isProductOrder && (
                <p className="text-xs text-slate-500 mt-1 ml-1">per {previewUnit}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t("vendorQuote.currencyLabel", "Mata Uang")}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-2 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["IDR","USD","SGD","EUR","CNY"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Preview kalkulasi realtime untuk produk */}
          {isProductOrder && unitPriceNum > 0 && (
            <div className="bg-slate-700/60 rounded-xl p-3 space-y-1.5 text-sm border border-slate-600">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("vendorQuote.previewTitle", "Preview Kalkulasi")}</p>
              <div className="flex justify-between">
                <span className="text-slate-400">{t("vendorQuote.previewNewPrice", "Harga Satuan Baru")}</span>
                <span className="text-white">{fmtRp(unitPriceNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t("vendorQuote.previewQtyLabel", "Qty")}</span>
                <span className="text-white">{previewQty} {previewUnit}</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1.5">
                <span className="text-slate-400">{t("vendorQuote.previewSubtotal", "Subtotal Baru")}</span>
                <span className="text-white">{fmtRp(previewSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t("vendorQuote.previewPPN", "PPN 11%")}</span>
                <span className="text-white">{fmtRp(previewPpn)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1.5">
                <span className="font-semibold text-white">{t("vendorQuote.previewGrandTotal", "Grand Total Baru")}</span>
                <span className="font-bold text-emerald-400">{fmtRp(previewGrandTotal)}</span>
              </div>
            </div>
          )}

          {/* Non-product: price info */}
          {!isProductOrder && vendorPrice && !isNaN(parseFloat(vendorPrice)) && parseFloat(vendorPrice) > 0 && (
            <p className="text-xs text-slate-400 -mt-2 ml-1">
              = {currency} {Math.round(parseFloat(vendorPrice)).toLocaleString("id-ID")} <span className="text-slate-500">{t("vendorQuote.excVatNote", "(belum termasuk PPN — harga dasar untuk admin)")}</span>
            </p>
          )}

          {/* ETA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t("vendorQuote.pickupLabel", "Est. Pickup")}</label>
              <input
                type="date"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={estimatedPickup}
                onChange={(e) => setEstimatedPickup(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t("vendorQuote.arrivalLabel", "Est. Tiba")}</label>
              <input
                type="date"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t("vendorQuote.daysLabel", "Estimasi Hari Pengiriman")}</label>
            <input
              type="number"
              min={1}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder={t("vendorQuote.daysPh", "misal: 3")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t("vendorQuote.notesLabel", "Catatan Tambahan")}</label>
            <textarea
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("vendorQuote.notesPh", "Syarat & kondisi, catatan khusus, dll...")}
            />
          </div>

          {submitError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !vendorPrice}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-900/40"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("vendorQuote.submitting", "Mengirim...")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {isProductOrder ? t("vendorQuote.submitNew", "Kirim Penawaran Harga") : t("vendorQuote.submitOffer", "Kirim Penawaran")}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pb-4">
          {t("vendorQuote.formNote", "Form ini hanya untuk vendor yang mendapat undangan RFQ")}
        </p>
      </div>
    </div>
  );
}
