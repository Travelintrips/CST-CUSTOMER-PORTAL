import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";

function apiUrl(path: string) {
  return path;
}

const idr = (n: number | null | undefined) =>
  n == null ? "—" : `Rp ${Math.round(Number(n)).toLocaleString("id-ID")}`;

const STATUS_LABEL: Record<string, string> = {
  waiting_response: "Menunggu",
  accepted_basic_price: "Terima Harga",
  counter_offer: "Counter Offer",
  rejected: "Tolak",
  expired: "Kadaluarsa",
  selected: "Dipilih",
  not_selected: "Tidak Dipilih",
  late_response: "Terlambat",
};

interface OrderItem {
  id?: number | null;
  serviceName: string;
  category: string;
  calculatorType: string;
  qty: number;
  unit: string;
  sellingUnitPrice: number | null;
  sellingSubtotal: number | null;
  vendorUnitPrice: number | null;
  vendorSubtotal: number | null;
  ppnAmount: number | null;
  vendorGrandTotal: number | null;
}

interface VendorItemOffer {
  id: number;
  orderItemId: number | null;
  serviceName: string;
  offeredPrice: number | null;
  currency: string;
  scheduleEtd: string | null;
  scheduleEta: string | null;
  leadTimeDays: number | null;
  validityDate: string | null;
  terms: string | null;
  notes: string | null;
  attachmentUrl: string | null;
}

interface FormData {
  rfqNumber: string;
  vendorName: string;
  orderType?: string;
  serviceType: string;
  origin: string;
  destination: string;
  commodity: string | null;
  cargoDescription: string | null;
  grossWeight: number | null;
  volumeCbm: number | null;
  requiredDate: string | null;
  basicPrice: number | null;
  responseDeadline: string | null;
  alreadySubmitted: boolean;
  currentStatus: string;
  currentOfferedPrice: number | null;
  currentEta: string | null;
  currentNotes: string | null;
  orderItems?: OrderItem[] | null;
  templateSnapshot?: Record<string, unknown> | null;
  currentCurrency?: string;
  currentValidityDate?: string | null;
  currentTerms?: string | null;
  currentItemOffers?: VendorItemOffer[];
}

function useCountdown(targetIso: string | null | undefined) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return remaining;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "EXPIRED";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${sec}d`;
  return `${m}m ${sec}d`;
}

export default function VendorFormPage() {
  const { t } = useLanguage();
  const { token } = useParams<{ token: string }>();
  const [mode, setMode] = useState<"select" | "accept" | "counter" | "reject" | "done" | null>(null);
  const [unitPrice, setUnitPrice] = useState("");
  const [eta, setEta] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  // Per-item pricing state (Step 11)
  const [itemPrices, setItemPrices] = useState<Record<string, string>>({});
  const [globalCurrency, setGlobalCurrency] = useState("IDR");
  const [validityDate, setValidityDate] = useState("");
  const [termsInput, setTermsInput] = useState("");

  const { data, isLoading, isError, error: qError } = useQuery<FormData>({
    queryKey: ["vendor-form", token],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/logistic/vendor-form/${token}`));
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as any).message || t("vendorForm.failLoadData", "Gagal memuat data"));
      }
      return res.json();
    },
    retry: false,
    enabled: !!token,
  });

  // Initialize per-item pricing from existing item offers (Step 11)
  useEffect(() => {
    if (!data) return;
    if (data.currentCurrency) setGlobalCurrency(data.currentCurrency);
    if (data.currentValidityDate) setValidityDate(data.currentValidityDate);
    if (data.currentTerms) setTermsInput(data.currentTerms);
    if (data.currentItemOffers && data.currentItemOffers.length > 0) {
      const prices: Record<string, string> = {};
      data.currentItemOffers.forEach(offer => {
        const key = offer.orderItemId != null ? String(offer.orderItemId) : offer.serviceName;
        if (offer.offeredPrice != null) prices[key] = String(offer.offeredPrice);
      });
      if (Object.keys(prices).length > 0) setItemPrices(prices);
    }
  }, [data]);

  const countdown = useCountdown(data?.responseDeadline);
  const isExpired = countdown !== null && countdown <= 0;

  const isProductOrder = data?.orderType === "product" || data?.orderType === "service";
  const productItems = (data?.orderItems ?? []).filter(i =>
    i.calculatorType === "product" || i.calculatorType === "service" ||
    (i.category ?? "").toLowerCase().includes("produk") ||
    (i.category ?? "").toLowerCase().includes("product") ||
    (i.category ?? "").toLowerCase().includes("jasa") ||
    (i.category ?? "").toLowerCase().includes("service")
  );

  const totalQty = productItems.reduce((s, i) => s + (i.qty ?? 1), 0);
  const hasVendorPricing = productItems.some(i => i.vendorUnitPrice != null);

  const totalVendorSubtotal = productItems.reduce((s, i) => s + (i.vendorSubtotal ?? 0), 0);
  const totalPpn = productItems.reduce((s, i) => s + (i.ppnAmount ?? 0), 0);
  const totalVendorGrandTotal = totalVendorSubtotal + totalPpn;

  const unitPriceNum = unitPrice ? Number(unitPrice) : 0;
  const previewSubtotal = unitPriceNum > 0 ? unitPriceNum * totalQty : 0;
  const previewPpn = Math.round(previewSubtotal * 0.11);
  const previewGrandTotal = previewSubtotal + previewPpn;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(apiUrl(`/api/logistic/vendor-form/${token}/upload`), {
        method: "POST",
        body: fd,
      });
      const j = await res.json() as { url: string };
      setAttachmentUrl(j.url);
    } catch {
      setError(t("vendorForm.failUploadFile", "Gagal upload file"));
    } finally {
      setUploadingFile(false);
    }
  }

  const allItems = data?.orderItems ?? [];
  const hasItemPricing = allItems.length > 0;

  // Build itemOffers array from per-item price state
  function buildItemOffers() {
    return allItems.map(item => {
      const key = item.id != null ? String(item.id) : item.serviceName;
      const priceVal = itemPrices[key];
      return {
        orderItemId: item.id ?? null,
        serviceName: item.serviceName,
        offeredPrice: priceVal ? Number(priceVal) : null,
        currency: globalCurrency,
        scheduleEta: eta || null,
        leadTimeDays: null,
        validityDate: validityDate || null,
        terms: termsInput || null,
        notes: notes || null,
        attachmentUrl: attachmentUrl || null,
      };
    });
  }

  // Total from per-item prices (subtotal before PPN)
  const itemPricesTotal = allItems.reduce((sum, item) => {
    const key = item.id != null ? String(item.id) : item.serviceName;
    const p = Number(itemPrices[key] || 0);
    return sum + (p * (item.qty || 1));
  }, 0);
  const itemPricesPpn = Math.round(itemPricesTotal * 0.11);
  const itemPricesGrandTotal = itemPricesTotal + itemPricesPpn;

  async function handleSubmit() {
    if (!mode || mode === "select" || mode === "done") return;
    if (isExpired) { setError(t("vendorForm.rfqDeadlineExpired", "Batas waktu RFQ sudah berakhir.")); return; }
    if (mode === "counter") {
      // When per-item pricing is available, require at least one item price
      if (hasItemPricing) {
        const hasAnyPrice = allItems.some(item => {
          const key = item.id != null ? String(item.id) : item.serviceName;
          return !!itemPrices[key];
        });
        if (!hasAnyPrice) { setError(t("vendorForm.enterAtLeastOneItemPrice", "Masukkan harga minimal untuk satu item")); return; }
      } else {
        if (!unitPrice) { setError(t("vendorForm.offerPriceRequired", "Harga penawaran harus diisi")); return; }
        if (isNaN(unitPriceNum) || unitPriceNum <= 0) { setError(t("vendorForm.offerPriceMustBePositive", "Harga penawaran harus lebih dari Rp 0")); return; }
      }
      if (!eta) { setError(t("vendorForm.etaRequired", "Estimasi waktu harus diisi")); return; }
    }
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, unknown> = { action: mode };
      if (mode === "counter") {
        if (hasItemPricing) {
          body.itemOffers = buildItemOffers();
          body.offeredPrice = itemPricesGrandTotal > 0 ? itemPricesGrandTotal : undefined;
        } else {
          body.offeredPrice = isProductOrder && totalQty > 1 ? previewGrandTotal : unitPriceNum;
        }
        body.eta = eta;
        body.notes = notes;
        body.currency = globalCurrency;
        body.validityDate = validityDate || undefined;
        body.terms = termsInput || undefined;
        if (attachmentUrl) body.attachmentUrl = attachmentUrl;
      } else if (mode === "accept") {
        body.eta = eta;
        body.notes = notes;
        body.currency = globalCurrency;
        body.validityDate = validityDate || undefined;
        body.terms = termsInput || undefined;
        if (hasItemPricing) body.itemOffers = buildItemOffers();
      } else {
        body.notes = notes;
      }
      const res = await fetch(apiUrl(`/api/logistic/vendor-form/${token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(j.message || t("vendorForm.failSubmit", "Gagal mengirim"));
      setMode("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("vendorForm.failSubmit", "Gagal mengirim"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-lg font-semibold text-gray-700">{t("vendorForm.invalidToken", "Token tidak valid")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t("vendorForm.loading", "Memuat data...")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = (qError as Error)?.message ?? t("vendorForm.linkInvalid", "Link tidak valid");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="font-semibold text-gray-800 mb-2">{t("vendorForm.linkUnavailable", "Link tidak tersedia")}</p>
          <p className="text-sm text-gray-500">{msg}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (mode === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t("vendorForm.offerSent", "Penawaran Terkirim")}</h2>
          <p className="text-gray-500 text-sm">{t("vendorForm.offerSentDesc", "Penawaran Anda telah berhasil dikirim. Tim kami akan segera menindaklanjuti.")}</p>
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            RFQ: <strong>{data.rfqNumber}</strong>
          </div>
        </div>
      </div>
    );
  }

  const alreadySubmitted = data.alreadySubmitted && data.currentStatus !== "waiting_response";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 py-8">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              RFQ
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{t("vendorForm.rfqLabel", "Permintaan Penawaran Harga")}</p>
              <p className="font-bold text-gray-800">{data.rfqNumber}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {t("vendorForm.greetingPrefix", "Kepada Yth.")} <strong>{data.vendorName}</strong>,<br />
            {data.orderType === "product"
              ? t("vendorForm.requestProductQuote", "Mohon bantu isi penawaran harga untuk kebutuhan pembelian produk di bawah ini.")
              : data.orderType === "service"
              ? t("vendorForm.requestServiceQuote", "Mohon bantu isi penawaran harga untuk kebutuhan layanan di bawah ini.")
              : t("vendorForm.requestLogisticQuote", "Mohon bantu isi penawaran harga untuk kebutuhan layanan logistik di bawah ini.")}
          </p>
        </div>

        {/* Countdown Timer */}
        {data.responseDeadline && countdown !== null && (
          <div className={`rounded-2xl p-4 ${isExpired ? "bg-red-50 border border-red-300" : countdown < 3600000 ? "bg-orange-50 border border-orange-300" : "bg-amber-50 border border-amber-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isExpired ? "text-red-700" : "text-amber-800"}`}>
                {isExpired ? t("vendorForm.timeExpired", "Waktu sudah habis") : t("vendorForm.timeRemaining", "Sisa Waktu")}
              </span>
              <span className={`font-mono font-bold text-lg ${isExpired ? "text-red-700" : countdown < 3600000 ? "text-orange-700" : "text-amber-700"}`}>
                {isExpired ? "EXPIRED" : formatCountdown(countdown)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("vendorForm.deadline", "Deadline:")}: {new Date(data.responseDeadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {!isExpired && (
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${countdown < 3600000 ? "bg-orange-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, (countdown / (7 * 24 * 3600000)) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* RFQ Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-blue-600 mb-4">
            {isProductOrder ? t("vendorForm.productDetail", "Detail Produk") : data.orderType === "service" ? t("vendorForm.serviceDetail", "Detail Layanan") : t("vendorForm.cargoDetail", "Detail Muatan")}
          </h3>

          {isProductOrder && productItems.length > 0 ? (
            <div className="space-y-3">
              {/* Per-item breakdown */}
              {productItems.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800 text-sm">{item.serviceName || item.category || "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t("vendorForm.qty", "Qty")}</span>
                    <span className="font-medium text-gray-700">{item.qty} {item.unit}</span>
                  </div>
                  {item.vendorUnitPrice != null && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t("vendorForm.vendorUnitPrice", "Harga Satuan Vendor")}</span>
                      <span className="font-medium text-blue-700">{idr(item.vendorUnitPrice)}</span>
                    </div>
                  )}
                  {item.vendorSubtotal != null && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal ({item.qty} × {idr(item.vendorUnitPrice)})</span>
                      <span className="font-medium text-gray-700">{idr(item.vendorSubtotal)}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Summary: PPN + Grand Total */}
              {hasVendorPricing && (
                <div className="mt-2 pt-3 border-t border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t("vendorForm.vendorSubtotal", "Subtotal Vendor")}</span>
                    <span>{idr(totalVendorSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t("vendorForm.ppn", "PPN 11%")}</span>
                    <span>{idr(totalPpn)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-blue-700 pt-1 border-t border-blue-100">
                    <span>{t("vendorForm.grandTotalVendor", "Grand Total Vendor")}</span>
                    <span>{idr(totalVendorGrandTotal)}</span>
                  </div>
                  <p className="text-xs text-blue-500">* {t("vendorForm.priceReferenceNote", "Harga referensi dari etalase vendor. Belum termasuk margin & markup.")}</p>
                </div>
              )}

              {/* Harga Dasar label (untuk non-catalog order) */}
              {!hasVendorPricing && data.basicPrice && (
                <div className="flex flex-col gap-1 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      {t("vendorForm.basePrice", "HARGA DASAR")} <span className="text-xs text-gray-400">({t("vendorForm.excludingVat", "belum PPN")})</span>
                    </span>
                    <span className="font-bold text-blue-600 text-base">{idr(data.basicPrice)}</span>
                  </div>
                  <p className="text-xs text-blue-500">* {t("vendorForm.priceReferenceNotePpn", "Harga referensi dari etalase vendor. Belum termasuk margin & PPN.")}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data.orderType === "product" || data.orderType === "service" ? (
                <>
                  {data.orderItems && data.orderItems.length > 0 ? (
                    <div className="space-y-2">
                      {data.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 font-medium">{item.serviceName || item.category || "—"}</span>
                          <span className="text-xs text-gray-400">{item.qty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  ) : data.serviceType ? (
                    <Row label={data.orderType === "product" ? t("vendorForm.product", "Produk") : t("vendorForm.service", "Layanan")} value={data.serviceType} />
                  ) : null}
                  {data.requiredDate && <Row label={t("vendorForm.requiredDate", "Tgl Dibutuhkan")} value={data.requiredDate} />}
                  {data.commodity && <Row label={t("vendorForm.description", "Keterangan")} value={data.commodity} />}
                </>
              ) : (
                <>
                  {data.serviceType && <Row label={t("vendorForm.service", "Layanan")} value={data.serviceType} />}
                  {(data.origin || data.destination) && (
                    <Row label={t("vendorForm.route", "Rute")} value={`${data.origin || "—"} → ${data.destination || "—"}`} />
                  )}
                  {data.commodity && <Row label={t("vendorForm.commodity", "Komoditi")} value={data.commodity} />}
                  {data.cargoDescription && <Row label={t("vendorForm.cargoDescription", "Deskripsi")} value={data.cargoDescription} />}
                  {data.grossWeight && <Row label={t("vendorForm.weight", "Berat")} value={`${data.grossWeight} kg`} />}
                  {data.volumeCbm && <Row label={t("vendorForm.volume", "Volume")} value={`${data.volumeCbm} CBM`} />}
                  {data.requiredDate && <Row label={t("vendorForm.requiredDateShort", "Tgl Butuh")} value={data.requiredDate} />}
                  {data.basicPrice && (
                    <div className="flex flex-col gap-1 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">
                          {t("vendorForm.basePrice", "HARGA DASAR")} <span className="text-xs text-gray-400">({t("vendorForm.excludingVat", "belum PPN")})</span>
                        </span>
                        <span className="font-bold text-blue-600 text-base">{idr(data.basicPrice)}</span>
                      </div>
                      <p className="text-xs text-blue-500">* {t("vendorForm.priceReferenceNotePpn", "Harga referensi dari etalase vendor. Belum termasuk margin & PPN.")}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {data.templateSnapshot && (data.templateSnapshot as any).label && (
            <div className="mt-3 pt-3 border-t border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">📋 {t("vendorForm.productTemplate", "Template Produk")}</p>
              <div className="bg-blue-50 rounded-lg px-3 py-2 space-y-1">
                <p className="text-sm font-medium text-blue-800">{String((data.templateSnapshot as any).label)}</p>
                {Array.isArray((data.templateSnapshot as any).requiredDocuments) &&
                  ((data.templateSnapshot as any).requiredDocuments as any[]).filter((d) => d.required).length > 0 && (
                  <div>
                    <p className="text-xs text-blue-500 mt-1">{t("vendorForm.requiredDocs", "Dokumen wajib:")}</p>
                    <ul className="text-xs text-blue-700 list-disc pl-4 mt-0.5">
                      {((data.templateSnapshot as any).requiredDocuments as any[]).filter((d) => d.required).map((d, i) => (
                        <li key={i}>{d.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expired notice */}
        {isExpired && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">⛔</p>
            <p className="font-bold text-red-700 mb-1">{t("vendorForm.expired", "Waktu Penawaran Berakhir")}</p>
            <p className="text-sm text-red-600">{t("vendorForm.expiredDesc", "Batas waktu untuk merespons RFQ ini sudah habis.")}</p>
          </div>
        )}

        {/* Already submitted notice */}
        {!isExpired && alreadySubmitted && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
            <p className="font-semibold text-amber-800 mb-1">⚡ {t("vendorForm.alreadySubmittedTitle", "Anda sudah mengirim penawaran")}</p>
            <p className="text-amber-700">
              {t("vendorForm.status", "Status:")}: <strong>{STATUS_LABEL[data.currentStatus] ?? data.currentStatus}</strong>
            </p>
            {data.currentOfferedPrice && (
              <p className="text-amber-700">{t("vendorForm.price", "Harga:")}: <strong>{idr(data.currentOfferedPrice)}</strong></p>
            )}
            {data.currentEta && <p className="text-amber-700">ETA: <strong>{data.currentEta}</strong></p>}
            <p className="mt-2 text-amber-600 text-xs">{t("vendorForm.canStillUpdate", "Anda masih bisa memperbarui penawaran.")}</p>
          </div>
        )}

        {/* Action selection */}
        {!isExpired && (mode === "select" || mode === null) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">{t("vendorForm.chooseAction", "Pilih Tindakan")}</h3>
            <div className="space-y-3">
              <ActionButton
                icon="✅"
                label={t("vendorForm.acceptBasePrice", "Terima Harga Dasar")}
                desc={
                  hasVendorPricing && totalVendorGrandTotal > 0
                    ? `${t("vendorForm.agreeWithTotal", "Setuju dengan total")} ${idr(totalVendorGrandTotal)} (${t("vendorForm.includingVat", "termasuk PPN")})`
                    : data.basicPrice
                    ? `${t("vendorForm.agreeWithPrice", "Setuju dengan harga")} ${idr(data.basicPrice)}`
                    : t("vendorForm.agreeWithPriceListed", "Saya setuju dengan harga yang tertera")
                }
                color="green"
                onClick={() => setMode("accept")}
              />
              <ActionButton
                icon="💬"
                label={t("vendorForm.submitNewPrice", "Ajukan Harga Baru")}
                desc={t("vendorForm.submitNewPriceDesc", "Saya ingin memberikan penawaran harga berbeda")}
                color="blue"
                onClick={() => setMode("counter")}
              />
              <ActionButton
                icon="❌"
                label={t("vendorForm.cannotServe", "Tidak Bisa Melayani")}
                desc={t("vendorForm.cannotServeDesc", "Saya tidak dapat memproses permintaan ini")}
                color="red"
                onClick={() => setMode("reject")}
              />
            </div>
          </div>
        )}

        {/* Accept form */}
        {!isExpired && mode === "accept" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setMode("select")} className="text-gray-400 hover:text-gray-600 text-sm">← {t("vendorForm.back", "Kembali")}</button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">✅ {t("vendorForm.acceptBasePrice", "Terima Harga Dasar")}</h3>

            {/* Breakdown for product orders */}
            {isProductOrder && hasVendorPricing && productItems.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 space-y-2">
                {productItems.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-semibold text-green-800">{item.serviceName || item.category}</p>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>{t("vendorForm.qty", "Qty")}</span><span>{item.qty} {item.unit}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>{t("vendorForm.unitPrice", "Harga Satuan")}</span><span>{idr(item.vendorUnitPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Subtotal</span><span>{idr(item.vendorSubtotal)}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-green-200 space-y-1">
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Subtotal</span><span>{idr(totalVendorSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-700">
                    <span>PPN 11%</span><span>{idr(totalPpn)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-green-800">
                    <span>Grand Total</span><span>{idr(totalVendorGrandTotal)}</span>
                  </div>
                </div>
              </div>
            ) : data.basicPrice ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-green-700">{t("vendorForm.youAgreePrice", "Anda menyetujui harga")}</p>
                <p className="text-2xl font-bold text-green-700">{idr(data.basicPrice)}</p>
              </div>
            ) : null}

            <FormField label={t("vendorForm.estimatedTimeOptional", "Estimasi Waktu (opsional)")} placeholder={t("vendorForm.etaPlaceholder", "Contoh: 2-3 hari")} value={eta} onChange={setEta} />
            <FormField label={t("vendorForm.notesOptional", "Catatan (opsional)")} placeholder={t("vendorForm.notesPlaceholder", "Catatan tambahan...")} value={notes} onChange={setNotes} textarea />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <SubmitButton onClick={handleSubmit} loading={submitting} label={t("vendorForm.sendConfirmation", "Kirim Konfirmasi")} color="green" />
          </div>
        )}

        {/* Counter offer form */}
        {!isExpired && mode === "counter" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setMode("select")} className="text-gray-400 hover:text-gray-600 text-sm">← {t("vendorForm.back", "Kembali")}</button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">💬 {t("vendorForm.submitNewPrice", "Ajukan Harga Baru")}</h3>

            {/* Per-item pricing table (Step 11) */}
            {hasItemPricing ? (
              <>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t("vendorForm.currency", "Mata Uang")}</p>
                  <select
                    value={globalCurrency}
                    onChange={e => setGlobalCurrency(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="IDR">IDR — Rupiah</option>
                    <option value="USD">USD — Dollar AS</option>
                    <option value="SGD">SGD — Dollar Singapura</option>
                    <option value="MYR">MYR — Ringgit Malaysia</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t("vendorForm.pricePerItem", "Harga Per Item")} *</p>
                  <div className="space-y-3">
                    {allItems.map((item) => {
                      const key = item.id != null ? String(item.id) : item.serviceName;
                      return (
                        <div key={key} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">{item.serviceName || item.category}</p>
                          <p className="text-xs text-gray-500 mb-2">Qty: {item.qty} {item.unit}</p>
                          <input
                            type="number"
                            min="0"
                            placeholder={`${t("vendorForm.unitPriceCurrency", "Harga satuan")} (${globalCurrency})`}
                            value={itemPrices[key] ?? ""}
                            onChange={e => setItemPrices(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          {itemPrices[key] && Number(itemPrices[key]) > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Subtotal: {idr(Number(itemPrices[key]) * (item.qty || 1))}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {itemPricesTotal > 0 && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between text-blue-700">
                        <span>Subtotal</span><span>{idr(itemPricesTotal)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600 text-xs">
                        <span>PPN 11%</span><span>{idr(itemPricesPpn)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-800 pt-1 border-t border-blue-200">
                        <span>Grand Total</span><span>{idr(itemPricesGrandTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : isProductOrder ? (
              <>
                <FormField
                  label={`${t("vendorForm.unitPrice", "Harga Satuan")} per Unit (IDR) *`}
                  placeholder={t("vendorForm.unitPricePlaceholder", "Contoh: 4800000")}
                  type="number"
                  value={unitPrice}
                  onChange={setUnitPrice}
                />
                {unitPriceNum > 0 && totalQty > 0 && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm space-y-1">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">{t("vendorForm.offerCalculation", "Kalkulasi Penawaran")}</p>
                    <div className="flex justify-between text-blue-700">
                      <span>{totalQty} Unit × {idr(unitPriceNum)}</span>
                      <span>{idr(previewSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 text-xs">
                      <span>PPN 11%</span><span>{idr(previewPpn)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-800 pt-1 border-t border-blue-200">
                      <span>{t("vendorForm.offerGrandTotal", "Grand Total Penawaran")}</span><span>{idr(previewGrandTotal)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <FormField
                label={`${t("vendorForm.offerPrice", "Harga Penawaran")} (IDR) *`}
                placeholder={t("vendorForm.offerPricePlaceholder", "Contoh: 5000000")}
                type="number"
                value={unitPrice}
                onChange={setUnitPrice}
              />
            )}

            <FormField
              label={`${t("vendorForm.etaLabel", "Estimasi Waktu / ETA")} *`}
              placeholder={t("vendorForm.etaLabelPlaceholder", "Contoh: 3-5 hari")}
              value={eta}
              onChange={setEta}
            />
            <FormField
              label={t("vendorForm.validUntilOptional", "Berlaku Sampai (opsional)")}
              placeholder={t("vendorForm.validUntilPlaceholder", "Contoh: 2025-12-31")}
              value={validityDate}
              onChange={setValidityDate}
            />
            <FormField
              label={t("vendorForm.termsOptional", "Syarat & Ketentuan (opsional)")}
              placeholder={t("vendorForm.termsPlaceholder", "Contoh: DP 50%, sisa sebelum pengiriman")}
              value={termsInput}
              onChange={setTermsInput}
              textarea
            />
            <FormField label={t("vendorForm.notesOptional", "Catatan (opsional)")} placeholder={t("vendorForm.notesForAdmin", "Catatan untuk admin...")} value={notes} onChange={setNotes} textarea />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("vendorForm.attachmentOptional", "Lampiran (opsional)")}</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleUpload}
                className="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingFile && <p className="text-xs text-blue-500 mt-1">{t("vendorForm.uploading", "Uploading...")}</p>}
              {attachmentUrl && <p className="text-xs text-green-600 mt-1">✓ {t("vendorForm.fileUploadSuccess", "File berhasil diupload")}</p>}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <SubmitButton onClick={handleSubmit} loading={submitting} label={t("vendorForm.sendOffer", "Kirim Penawaran")} color="blue" />
          </div>
        )}

        {/* Reject form */}
        {!isExpired && mode === "reject" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setMode("select")} className="text-gray-400 hover:text-gray-600 text-sm">← {t("vendorForm.back", "Kembali")}</button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">❌ {t("vendorForm.cannotServeTitle", "Tidak Dapat Melayani")}</h3>
            <FormField label={t("vendorForm.reasonOptional", "Alasan (opsional)")} placeholder={t("vendorForm.reasonPlaceholder", "Contoh: Rute tidak tersedia, kapasitas penuh...")} value={notes} onChange={setNotes} textarea />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <SubmitButton onClick={handleSubmit} loading={submitting} label={t("vendorForm.confirmRejection", "Konfirmasi Penolakan")} color="red" />
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          {t("vendorForm.replyBeforeDeadline", "Harap balas sebelum batas waktu yang ditentukan.")}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, desc, color, onClick }: {
  icon: string; label: string; desc: string;
  color: "green" | "blue" | "red"; onClick: () => void;
}) {
  const bg = { green: "hover:bg-green-50 border-green-100 hover:border-green-300", blue: "hover:bg-blue-50 border-blue-100 hover:border-blue-300", red: "hover:bg-red-50 border-red-100 hover:border-red-300" }[color];
  const tc = { green: "text-green-700", blue: "text-blue-700", red: "text-red-700" }[color];
  return (
    <button onClick={onClick} className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border ${bg} transition-all`}>
      <span className="text-2xl mt-0.5">{icon}</span>
      <div>
        <p className={`font-semibold text-sm ${tc}`}>{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function FormField({ label, placeholder, value, onChange, type, textarea }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  const cls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none";
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea className={cls} rows={3} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input type={type ?? "text"} className={cls} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

function SubmitButton({ onClick, loading, label, color }: {
  onClick: () => void; loading: boolean; label: string;
  color: "green" | "blue" | "red";
}) {
  const { t } = useLanguage();
  const bg = { green: "bg-green-600 hover:bg-green-700", blue: "bg-blue-600 hover:bg-blue-700", red: "bg-red-600 hover:bg-red-700" }[color];
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full ${bg} text-white font-semibold py-3 rounded-xl mt-2 disabled:opacity-50 transition-colors`}
    >
      {loading ? t("vendorForm.sending", "Mengirim...") : label}
    </button>
  );
}
