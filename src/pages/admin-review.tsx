import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Shared types ──────────────────────────────────────────────────────────────

type OrderItemInfo = {
  serviceName: string;
  category: string;
  subtotal: string | null;
  quantity: string | null;
  unit: string | null;
  unitPrice?: string | null;
};

type OrderInfo = {
  id: number;
  orderNumber: string;
  customerName: string;
  orderType: string | null;
  serviceType: string | null;
  origin: string;
  destination: string;
  commodity: string | null;
  status: string;
  items?: OrderItemInfo[];
  grandTotal?: string | null;
  subtotalBeforeTax?: string | null;
  taxAmount?: string | null;
  taxRate?: number | null;
};

type ReviewVendor = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  serviceType: string | null;
  eta: string | null;
  fee: string | null;
  note: string | null;
  isMatching: boolean;
  hasCommodityMatch?: boolean;
};

type RfqSummary = {
  id: number;
  rfqNumber: string;
  status: string;
};

type ReviewData = {
  token: string;
  actionType: string;
  isUsed: boolean;
  usedAt: string | null;
  order: OrderInfo;
  vendors: ReviewVendor[];
  rfqs: RfqSummary[];
};

// ── Compare-vendors types ─────────────────────────────────────────────────────

type VendorQuote = {
  linkId: number;
  vendorId: number;
  vendorName: string;
  status: string;
  basicPrice: number | null;
  offeredPrice: number | null;
  eta: string | null;
  notes: string | null;
  submittedAt: string | null;
};

type CompareData = {
  token: string;
  actionType: "compare_vendors";
  isUsed: boolean;
  usedAt: string | null;
  order: OrderInfo;
  rfq: RfqSummary;
  vendors: VendorQuote[];
};

type CompareResult = {
  ok: boolean;
  vendorName: string;
  sellingPrice: number;
  quoteToken: string | null;
  quoteUrl: string | null;
  forwardVendorUrl: string | null;
};

// ── Confirm-fulfillment types ─────────────────────────────────────────────────

type VendorFulfillmentInfo = {
  id: number;
  serviceType: string;
  status: string;
  stockConfirmed: string | null;
  qtyConfirmed: string | null;
  readyDate: string | null;
  leadTime: string | null;
  warehouseLocation: string | null;
  priceConfirmed: string | null;
  revisedPrice: number | null;
  notes: string | null;
  stockPhotoUrl: string | null;
  invoiceUrl: string | null;
  supportingDocUrl: string | null;
  submittedAt: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  plateNumber?: string | null;
  vehicleType?: string | null;
  pickupTime?: string | null;
  carrierName?: string | null;
  awbBlNumber?: string | null;
  bookingNumber?: string | null;
  flightVessel?: string | null;
  etd?: string | null;
  eta?: string | null;
  customsPicName?: string | null;
  customsDocuments?: string | null;
  customsProcessEta?: string | null;
};

type FulfillmentOrderItem = {
  name: string;
  qty: number;
  unit: string;
  priceBase: number | null;
  subtotal: number | null;
  ppn: number | null;
  total: number | null;
};

type ConfirmFulfillmentData = {
  token: string;
  actionType: "confirm_fulfillment";
  isUsed: boolean;
  usedAt: string | null;
  order: OrderInfo;
  orderItems: FulfillmentOrderItem[];
  vendorFulfillmentLink: VendorFulfillmentInfo | null;
};

// ── Forward-vendor types ──────────────────────────────────────────────────────

type SelectedVendorLink = {
  id: number;
  rfqId: number;
  vendorId: number;
  status: string;
  offeredPrice: number | null;
  basicPrice: number | null;
  eta: string | null;
  notes: string | null;
};

type ForwardVendorData = {
  token: string;
  actionType: "forward_vendor";
  isUsed: boolean;
  usedAt: string | null;
  order: OrderInfo;
  rfq: RfqSummary | null;
  selectedVendor: { id: number; name: string; phone: string | null } | null;
  selectedVendorLink: SelectedVendorLink | null;
};

type ForwardResult = {
  ok: boolean;
  fulfillToken: string;
  fulfillUrl: string;
  vendorName: string;
};

// ── Blast types ───────────────────────────────────────────────────────────────

type BlastResult = {
  vendorId: number;
  vendorName: string;
  sent: boolean;
};

type BlastResponse = {
  ok: boolean;
  rfqId: number;
  rfqNumber: string;
  results: BlastResult[];
  compareUrl: string;
};

// ── Page Content ──────────────────────────────────────────────────────────────

interface AdminReviewContent {
  pageTitle: string;
  pageSubtitle: string;
  deadlineLabel: string;
  vendorSectionTitle: string;
  blastHint: string;
}

interface PageContent {
  admin_review: AdminReviewContent;
}

const DEFAULT_PAGE_CONTENT: PageContent = {
  admin_review: {
    pageTitle: "Review & Blast Vendor",
    pageSubtitle: "Admin Panel",
    deadlineLabel: "Batas Waktu Respon Vendor",
    vendorSectionTitle: "Pilih Vendor",
    blastHint: "Vendor akan menerima WA dengan link form penawaran",
  },
};

function usePageContent(): PageContent {
  const [content, setContent] = useState<PageContent>(DEFAULT_PAGE_CONTENT);
  useEffect(() => {
    fetch("/api/settings/page-content")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.admin_review) {
          setContent((prev) => ({
            ...prev,
            admin_review: { ...prev.admin_review, ...data.admin_review },
          }));
        }
      })
      .catch(() => {});
  }, []);
  return content;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const idr = (n: number | string | null | undefined) =>
  n == null ? "—" : `Rp ${Math.round(Number(n)).toLocaleString("id-ID")}`;

const RFQ_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  admin_review: "Review",
  rfq_sent: "Terkirim",
  vendor_blasted: "Di-blast",
  vendor_selected: "Vendor Dipilih",
  customer_quoted: "Quoted",
  customer_approved: "Disetujui",
  customer_rejected: "Ditolak",
  closed: "Ditutup",
};

const VENDOR_LINK_STATUS: Record<string, { label: string; cls: string }> = {
  pending:              { label: "Menunggu",        cls: "bg-amber-100 text-amber-700" },
  waiting_response:     { label: "Menunggu",        cls: "bg-amber-100 text-amber-700" },
  sent:                 { label: "Terkirim",         cls: "bg-blue-100 text-blue-700" },
  responded:            { label: "Masuk ✓",          cls: "bg-emerald-100 text-emerald-700" },
  accepted_basic_price: { label: "Terima Harga ✓",  cls: "bg-emerald-100 text-emerald-700" },
  counter_offer:        { label: "Counter Offer ✓", cls: "bg-blue-100 text-blue-700" },
  selected:             { label: "Dipilih ★",        cls: "bg-indigo-100 text-indigo-700" },
  not_selected:         { label: "Tidak Dipilih",    cls: "bg-slate-100 text-slate-500" },
  rejected:             { label: "Ditolak",          cls: "bg-red-100 text-red-600" },
  expired:              { label: "Kadaluarsa",       cls: "bg-slate-100 text-slate-400" },
  late_response:        { label: "Terlambat",        cls: "bg-orange-100 text-orange-600" },
};

// ── Shared: loading / error / order card ─────────────────────────────────────

function LoadingScreen() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">{t("adminReview.loadingData", "Memuat data…")}</p>
        <p className="text-slate-400 text-xs">{t("adminReview.loadingWait", "Harap tunggu sebentar…")}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center space-y-3">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-lg font-semibold text-slate-800">{t("adminReview.invalidLink", "Link Tidak Valid")}</h2>
        <p className="text-slate-500 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            {t("adminReview.retryBtn", "Coba Lagi")}
          </button>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, label = "Order" }: { order: OrderInfo; label?: string }) {
  const { t } = useLanguage();
  const isProduct = order.orderType === "product";
  const hasRoute = !isProduct && (order.origin || order.destination);
  const serviceLabel = isProduct ? t("adminReview.orderTypeLabel", "Tipe Order") : t("adminReview.serviceLabel", "Layanan");
  const serviceValue = isProduct ? t("adminReview.productLabel", "Produk") : (order.serviceType ?? "—");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{label}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            order.status === "New Order" ? "bg-yellow-400 text-yellow-900"
            : order.status === "Cancelled" ? "bg-red-400 text-red-900"
            : "bg-green-400 text-green-900"
          }`}>
            {order.status}
          </span>
        </div>
        <p className="text-white font-bold text-lg mt-1 font-mono">{order.orderNumber}</p>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Customer</p>
            <p className="font-semibold text-slate-800">{order.customerName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">{serviceLabel}</p>
            <p className="font-semibold text-slate-800">{serviceValue}</p>
          </div>
          {hasRoute && (
            <div className="col-span-2">
              <p className="text-slate-400 text-xs">{t("adminReview.routeLabel", "Rute")}</p>
              <p className="font-semibold text-slate-800">
                {order.origin || "—"} → {order.destination || "—"}
              </p>
            </div>
          )}
          {order.commodity && (
            <div className="col-span-2">
              <p className="text-slate-400 text-xs">{t("adminReview.commodityLabel", "Komoditi")}</p>
              <p className="font-semibold text-slate-800">{order.commodity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VendorRow (blast mode) ────────────────────────────────────────────────────

function VendorRow({
  vendor,
  checked,
  onChange,
}: {
  vendor: ReviewVendor;
  checked: boolean;
  onChange: () => void;
}) {
  const { t } = useLanguage();
  return (
    <label
      className={`flex items-start gap-3.5 px-5 py-3.5 cursor-pointer transition-colors ${
        checked ? "bg-blue-50/60" : "hover:bg-slate-50"
      }`}
    >
      <div className="mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4.5 h-4.5 rounded accent-blue-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 text-sm">{vendor.name}</span>
          {vendor.hasCommodityMatch && (
            <span className="text-[10px] bg-orange-100 text-orange-700 font-medium px-1.5 py-0.5 rounded-full">
              🏷️ {t("adminReview.commodityBadge", "Komoditi")}
            </span>
          )}
          {vendor.isMatching && !vendor.hasCommodityMatch && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-1.5 py-0.5 rounded-full">
              ✓ {t("adminReview.serviceBadge", "Layanan")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {vendor.phone && <span className="text-xs text-slate-500">📱 {vendor.phone}</span>}
          {vendor.serviceType && <span className="text-xs text-slate-400">{vendor.serviceType}</span>}
          {vendor.fee && <span className="text-xs text-slate-400">~{vendor.fee}</span>}
          {vendor.eta && <span className="text-xs text-slate-400">ETA {vendor.eta}</span>}
        </div>
        {vendor.note && (
          <p className="text-xs text-slate-400 mt-0.5 italic">{vendor.note}</p>
        )}
      </div>
    </label>
  );
}

// ── CompareVendorsView ────────────────────────────────────────────────────────

const RESPONDED_STATUSES = new Set([
  "accepted_basic_price", "counter_offer", "rejected",
  "responded", "selected", "not_selected", "late_response",
]);

function CompareVendorsView({ data, token }: { data: CompareData; token: string }) {
  const { t } = useLanguage();
  const { order, rfq, vendors } = data;
  const responded = vendors.filter((v) => RESPONDED_STATUSES.has(v.status));
  const notResponded = vendors.filter((v) => !RESPONDED_STATUSES.has(v.status));
  const cheapest = responded[0] ?? null;

  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(
    cheapest?.linkId ?? null
  );
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [sendToCustomer, setSendToCustomer] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selectedVendor = vendors.find((v) => v.linkId === selectedLinkId) ?? null;
  const effectivePrice = selectedVendor?.offeredPrice ?? selectedVendor?.basicPrice;

  useEffect(() => {
    if (effectivePrice != null) setSellingPrice(String(effectivePrice));
  }, [selectedLinkId]);

  const fillPrice = () => {
    if (effectivePrice != null) setSellingPrice(String(effectivePrice));
  };

  const handleSubmit = async () => {
    if (!selectedLinkId) return;
    setSubmitting(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: selectedLinkId,
          sellingPrice: sellingPrice ? Number(sellingPrice.replace(/\D/g, "")) : undefined,
          quoteNotes: quoteNotes || undefined,
          sendQuoteToCustomer: sendToCustomer,
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Gagal menyimpan pilihan");
      setResult(body as CompareResult);
    } catch (e: unknown) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result screen ───────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-5">
          <div className="text-center space-y-2">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-slate-800">{t("adminReview.vendorSelected", "Vendor Dipilih!")}</h2>
            <p className="text-slate-500 text-sm">
              <strong>{result.vendorName}</strong> {t("adminReview.vendorSelectedDesc", "dipilih sebagai vendor untuk order ini.")}
            </p>
          </div>
          {result.sellingPrice && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">{t("adminReview.sellingPriceLabel", "Harga Jual ke Customer")}</span>
              <span className="font-bold text-slate-800 text-lg">{idr(result.sellingPrice)}</span>
            </div>
          )}
          {result.quoteUrl && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 space-y-2">
              <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">
                📤 {t("adminReview.quoteSentToCustomer", "Penawaran Terkirim ke Customer")}
              </p>
              <p className="text-xs text-slate-500 break-all">{result.quoteUrl}</p>
            </div>
          )}
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 space-y-1">
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">⏳ {t("adminReview.waitingCustomerApproval", "Menunggu Persetujuan Customer")}</p>
            <p className="text-sm text-slate-600">
              {t("adminReview.forwardAfterApproval", "Forward ke vendor akan tersedia setelah customer menyetujui penawaran.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Already used ────────────────────────────────────────────────────────────
  if (data.isUsed && data.usedAt) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">{t("adminReview.compareTitle", "Bandingkan Penawaran")}</h1>
              <p className="text-xs text-slate-400">{t("adminReview.adminPanel", "Admin Panel")}</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">{t("adminReview.linkAlreadyUsed", "Link Sudah Digunakan")}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {t("adminReview.vendorAlreadySelected", "Vendor sudah dipilih sebelumnya pada")}{" "}
                {new Date(data.usedAt).toLocaleString("id-ID")}. {t("adminReview.openBizPortal", "Buka BizPortal untuk detail RFQ")} {rfq.rfqNumber}.
              </p>
            </div>
          </div>
          <QuoteList vendors={vendors} selectedLinkId={null} onSelect={() => {}} disabled />
        </div>
      </div>
    );
  }

  // ── Main compare screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{t("adminReview.compareVendorTitle", "Bandingkan Penawaran Vendor")}</h1>
            <p className="text-xs text-slate-400">{t("adminReview.adminPanel", "Admin Panel")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />

        {/* RFQ Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{t("adminReview.rfqNoLabel", "No. RFQ")}</p>
            <p className="font-mono font-semibold text-slate-800">{rfq.rfqNumber}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            rfq.status === "vendor_selected" ? "bg-indigo-100 text-indigo-700"
            : rfq.status === "customer_quoted" ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700"
          }`}>
            {RFQ_STATUS_LABEL[rfq.status] ?? rfq.status}
          </span>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("adminReview.totalVendors", "Total Vendor"), val: vendors.length, cls: "bg-slate-50" },
            { label: t("adminReview.responded", "Sudah Respon"), val: responded.length, cls: responded.length > 0 ? "bg-emerald-50" : "bg-slate-50" },
            { label: t("adminReview.waiting", "Menunggu"), val: notResponded.length, cls: notResponded.length > 0 ? "bg-amber-50" : "bg-slate-50" },
          ].map((c) => (
            <div key={c.label} className={`${c.cls} rounded-xl p-3 text-center border border-slate-100`}>
              <p className="text-2xl font-bold text-slate-800">{c.val}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Quote list */}
        <QuoteList
          vendors={vendors}
          selectedLinkId={selectedLinkId}
          onSelect={setSelectedLinkId}
          disabled={false}
        />

        {/* Vendors not yet responded */}
        {notResponded.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                ⏳ {t("adminReview.notYetResponded", "Belum Respon")} ({notResponded.length})
              </p>
            </div>
            <div className="divide-y divide-slate-50">
              {notResponded.map((v) => {
                const s = VENDOR_LINK_STATUS[v.status] ?? { label: v.status, cls: "bg-slate-100 text-slate-500" };
                return (
                  <div key={v.linkId} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">{v.vendorName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {responded.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-8 text-center">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-slate-500 text-sm">{t("adminReview.noVendorResponded", "Belum ada vendor yang merespon.")}</p>
            <p className="text-slate-400 text-xs mt-1">{t("adminReview.comeBackLater", "Kembali ke halaman ini setelah vendor mengisi penawaran.")}</p>
          </div>
        )}

        {/* Selling price + options */}
        {responded.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">💰 {t("adminReview.sellingPriceTitle", "Harga Jual ke Customer")}</h2>

            {/* Price suggestion */}
            {effectivePrice != null && (
              <button
                type="button"
                onClick={fillPrice}
                className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-xs text-slate-400">{t("adminReview.selectedVendorPrice", "Harga vendor dipilih")}</p>
                  <p className="font-semibold text-slate-700">{idr(effectivePrice)}</p>
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {t("adminReview.useThisPrice", "Pakai harga ini")}
                </span>
              </button>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("adminReview.sellingPriceRp", "Harga Jual (Rp)")}
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("adminReview.sellingPricePlaceholder", "Contoh: 5000000")}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {sellingPrice && (
                <p className="text-xs text-slate-400 mt-1">{idr(Number(sellingPrice))}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t("adminReview.notesOptional", "Catatan (opsional)")}
              </label>
              <textarea
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={2}
                placeholder={t("adminReview.notesPlaceholder", "Syarat & kondisi, catatan untuk customer…")}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            <label className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              sendToCustomer ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}>
              <input
                type="checkbox"
                checked={sendToCustomer}
                onChange={(e) => setSendToCustomer(e.target.checked)}
                className="accent-emerald-600 w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">📤 {t("adminReview.sendQuoteViaWA", "Kirim penawaran ke customer via WA")}</p>
                <p className="text-xs text-slate-400">
                  {t("adminReview.sendQuoteDesc", "Customer akan menerima link untuk menyetujui / menolak harga")}
                </p>
              </div>
            </label>

            {sendToCustomer && !sellingPrice && (
              <p className="text-xs text-amber-600">⚠️ {t("adminReview.fillPriceFirst", "Isi harga jual terlebih dahulu sebelum mengirim ke customer.")}</p>
            )}
          </div>
        )}

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {err}
          </div>
        )}

        {/* Submit button */}
        {responded.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedLinkId || (sendToCustomer && !sellingPrice)}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
              submitting || !selectedLinkId || (sendToCustomer && !sellingPrice)
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-200"
            }`}
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("adminReview.saving", "Menyimpan…")}
              </>
            ) : (
              <>
                ✅ {t("adminReview.selectVendorBtn", "Pilih Vendor")}{selectedVendor ? ` — ${selectedVendor.vendorName}` : ""}
              </>
            )}
          </button>
        )}

        <p className="text-center text-xs text-slate-400 pb-8">
          {t("adminReview.selectVendorNote", "Memilih vendor akan menandai RFQ sebagai selesai · Vendor lain ditandai tidak dipilih")}
        </p>
      </div>
    </div>
  );
}

function QuoteList({
  vendors,
  selectedLinkId,
  onSelect,
  disabled = false,
}: {
  vendors: VendorQuote[];
  selectedLinkId: number | null;
  onSelect: (id: number) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const responded = vendors.filter((v) => RESPONDED_STATUSES.has(v.status));
  if (responded.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">{t("adminReview.vendorQuotes", "Penawaran Vendor")}</h2>
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          {t("adminReview.cheapestFirst", "Termurah di atas")}
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {responded.map((v, idx) => {
          const price = v.offeredPrice ?? v.basicPrice;
          const isSelected = selectedLinkId === v.linkId;
          const s = VENDOR_LINK_STATUS[v.status] ?? { label: v.status, cls: "bg-slate-100 text-slate-500" };
          return (
            <label
              key={v.linkId}
              className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors ${
                isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"
              } ${disabled ? "cursor-default" : ""}`}
            >
              {!disabled && (
                <div className="mt-1">
                  <input
                    type="radio"
                    name="vendorPick"
                    checked={isSelected}
                    onChange={() => onSelect(v.linkId)}
                    className="accent-indigo-600 w-4 h-4"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {idx === 0 && !disabled && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-semibold px-1.5 py-0.5 rounded-full">
                      {t("adminReview.cheapest", "Termurah")}
                    </span>
                  )}
                  <span className="font-semibold text-slate-800 text-sm">{v.vendorName}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="text-base font-bold text-slate-800">{idr(price)}</span>
                  {v.eta && <span className="text-xs text-slate-500 self-center">ETA {v.eta}</span>}
                </div>
                {v.notes && (
                  <p className="text-xs text-slate-400 mt-1 italic">{v.notes}</p>
                )}
                {v.submittedAt && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t("adminReview.submittedAt", "Masuk")}: {new Date(v.submittedAt).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── ReviewOrderView ───────────────────────────────────────────────────────────

function ReviewOrderView({ data, token }: { data: ReviewData; token: string }) {
  const { t } = useLanguage();
  const { order, vendors = [], rfqs = [] } = data;
  const pc = usePageContent().admin_review;
  const commodityMatched = vendors.filter((v) => v.hasCommodityMatch);
  const serviceMatched   = vendors.filter((v) => v.isMatching && !v.hasCommodityMatch);
  const others           = vendors.filter((v) => !v.isMatching && !v.hasCommodityMatch);
  const latestRfq = rfqs[0] ?? null;

  const autoSelected = [...commodityMatched, ...serviceMatched].map((v) => v.id);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(autoSelected)
  );
  const [deadlineHours, setDeadlineHours] = useState(48);
  const [showAll, setShowAll] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [blasting, setBlasting] = useState(false);
  const [blastResult, setBlastResult] = useState<BlastResponse | null>(null);

  const visibleOthers = showAll ? others : others.slice(0, 5);

  const toggleVendor = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBlast = async () => {
    if (!data || selected.size === 0) return;
    setBlasting(true);
    try {
      const r = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorIds: Array.from(selected), deadlineHours }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Gagal blast");
      setBlastResult(body as BlastResponse);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setBlasting(false);
    }
  };

  if (blastResult) {
    const sentCount = blastResult.results.filter((r) => r.sent).length;
    const failedCount = blastResult.results.filter((r) => !r.sent).length;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-5">
          <div className="text-center space-y-2">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-slate-800">{t("adminReview.rfqSent", "RFQ Terkirim!")}</h2>
            <p className="text-slate-500 text-sm">
              {blastResult.rfqNumber} — {sentCount} {t("adminReview.vendorContacted", "vendor berhasil dihubungi")}
              {failedCount > 0 && `, ${failedCount} ${t("adminReview.failed", "gagal")}`}
            </p>
          </div>
          <div className="space-y-2">
            {blastResult.results.map((r) => (
              <div
                key={r.vendorId}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  r.sent ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
                }`}
              >
                <span>{r.sent ? "✅" : "❌"}</span>
                <span className="font-medium">{r.vendorName}</span>
                <span className="ml-auto text-xs">{r.sent ? t("adminReview.sent", "Terkirim") : t("adminReview.failedShort", "Gagal")}</span>
              </div>
            ))}
          </div>
          {blastResult.compareUrl && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-2">
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">{t("adminReview.nextStep", "Langkah Selanjutnya")}</p>
              <p className="text-sm text-slate-600">
                {t("adminReview.compareAfterBlast", "Setelah vendor mengisi penawaran, bandingkan dan pilih vendor terbaik:")}
              </p>
              <a
                href={blastResult.compareUrl}
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                🔍 {t("adminReview.compareVendorBtn", "Bandingkan Penawaran Vendor")} →
              </a>
            </div>
          )}
          <button
            onClick={() => setBlastResult(null)}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 underline"
          >
            {t("adminReview.backToReview", "Kembali ke halaman review")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{pc.pageTitle}</h1>
            <p className="text-xs text-slate-400">{pc.pageSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <OrderCard order={order} label={t("adminReview.newOrderLabel", "Order Baru")} />

        {latestRfq && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">{t("adminReview.rfqAlreadyCreated", "RFQ sudah pernah dibuat")}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {latestRfq.rfqNumber} — {t("adminReview.statusLabel", "Status")}:{" "}
                <strong>{RFQ_STATUS_LABEL[latestRfq.status] ?? latestRfq.status}</strong>
              </p>
              <p className="text-amber-600 text-xs mt-1">
                {t("adminReview.continueBlastNote", "Melanjutkan blast akan menambah vendor ke RFQ yang sudah ada.")}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ⏰ {pc.deadlineLabel}
          </label>
          <div className="flex items-center gap-3">
            {[24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => setDeadlineHours(h)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  deadlineHours === h
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {h} {t("adminReview.hoursUnit", "jam")}
              </button>
            ))}
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="number"
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                min={1}
                max={168}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-slate-400 text-xs shrink-0">{t("adminReview.hoursUnit", "jam")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">{pc.vendorSectionTitle}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selected.size} {t("adminReview.vendorSelectedCount", "vendor dipilih")} · {vendors.length} {t("adminReview.totalActive", "total aktif")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set(vendors.map((v) => v.id)))}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {t("adminReview.selectAll", "Pilih Semua")}
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-slate-400 hover:underline"
              >
                {t("adminReview.reset", "Reset")}
              </button>
            </div>
          </div>

          {commodityMatched.length > 0 && (
            <div>
              <div className="px-5 py-2 bg-orange-50 border-b border-orange-100">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                  🏷️ {t("adminReview.matchesCommodity", "Sesuai Komoditi")} ({commodityMatched.length})
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {commodityMatched.map((v) => (
                  <VendorRow key={v.id} vendor={v} checked={selected.has(v.id)} onChange={() => toggleVendor(v.id)} />
                ))}
              </div>
            </div>
          )}

          {serviceMatched.length > 0 && (
            <div>
              <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                  ✅ {t("adminReview.matchesService", "Sesuai Layanan")} ({serviceMatched.length})
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {serviceMatched.map((v) => (
                  <VendorRow key={v.id} vendor={v} checked={selected.has(v.id)} onChange={() => toggleVendor(v.id)} />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <button
                onClick={() => setShowOthers((p) => !p)}
                className="w-full px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {t("adminReview.otherVendors", "Vendor Lain")} ({others.length}) — {t("adminReview.notMatchingService", "tidak sesuai tipe layanan")}
                </p>
                <span className="text-xs text-slate-400">{showOthers ? `▲ ${t("adminReview.hide", "Sembunyikan")}` : `▼ ${t("adminReview.show", "Tampilkan")}`}</span>
              </button>
              {showOthers && (
                <>
                  <div className="divide-y divide-slate-50">
                    {(showAll ? others : others.slice(0, 5)).map((v) => (
                      <VendorRow key={v.id} vendor={v} checked={selected.has(v.id)} onChange={() => toggleVendor(v.id)} />
                    ))}
                  </div>
                  {others.length > 5 && (
                    <div className="px-5 py-3 border-t border-slate-100">
                      <button
                        onClick={() => setShowAll((p) => !p)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        {showAll ? `${t("adminReview.showLess", "Tampilkan lebih sedikit")} ▲` : `${t("adminReview.showMoreVendors", "Tampilkan")} ${others.length - 5} ${t("adminReview.moreVendors", "vendor lainnya")} ▼`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {vendors.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              {t("adminReview.noActiveVendors", "Tidak ada vendor aktif dengan nomor HP yang tersimpan.")}
            </div>
          )}
        </div>

        <button
          onClick={handleBlast}
          disabled={blasting || selected.size === 0}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            selected.size === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-200"
          }`}
        >
          {blasting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("adminReview.sending", "Mengirim…")}
            </>
          ) : (
            <>📤 {t("adminReview.blastBtn", "Blast ke")} {selected.size} {t("adminReview.vendorUnit", "Vendor")}</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pb-8">
          {pc.blastHint} · {deadlineHours} {t("adminReview.hoursUnit", "jam")} {t("adminReview.deadlineLabel", "batas waktu")}
        </p>
      </div>
    </div>
  );
}

// ── ConfirmFulfillmentView ────────────────────────────────────────────────────

const STOCK_LABEL: Record<string, string> = {
  all: "Tersedia Semua ✅",
  partial: "Tersedia Sebagian ⚠️",
  none: "Tidak Tersedia ❌",
};

function FulfillmentDetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className="text-sm text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}

function ConfirmFulfillmentView({ data, token }: { data: ConfirmFulfillmentData; token: string }) {
  const { t } = useLanguage();
  const { order, vendorFulfillmentLink: vf, orderItems = [] } = data;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Gagal konfirmasi");
      setDone(true);
    } catch (e: unknown) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-5 text-center">
          <div className="text-5xl">🚀</div>
          <h2 className="text-xl font-bold text-slate-800">{t("adminReview.orderConfirmed", "Order Dikonfirmasi!")}</h2>
          <p className="text-slate-500 text-sm">
            {t("adminReview.orderLabel", "Order")} <strong>{order.orderNumber}</strong> {t("adminReview.nowInProgress", "sekarang berstatus")} <strong>In Progress</strong>.
            {t("adminReview.customerWillGetWA", "Customer akan mendapat notifikasi WhatsApp.")}
          </p>
        </div>
      </div>
    );
  }

  if (data.isUsed && data.usedAt) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader icon="✅" title={t("adminReview.confirmFulfillmentTitle", "Konfirmasi Fulfillment")} />
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">{t("adminReview.alreadyConfirmed", "Sudah Dikonfirmasi")}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {t("adminReview.orderConfirmedAt", "Order ini sudah dikonfirmasi pada")}{" "}
                {new Date(data.usedAt).toLocaleString("id-ID")}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader icon="✅" title={t("adminReview.confirmFulfillmentVendorTitle", "Konfirmasi Fulfillment Vendor")} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />

        {vf ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                📦 {t("adminReview.fulfillmentDataFromVendor", "Data Fulfillment dari Vendor")}
              </p>
              {vf.submittedAt && (
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Dikirim: {new Date(vf.submittedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            {/* Item breakdown */}
            {orderItems.length > 0 && (
              <div className="px-5 py-3 border-b border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("adminReview.itemDetail", "Detail Barang")}</p>
                {orderItems.map((it, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 space-y-1.5">
                    <p className="text-sm font-semibold text-slate-800">{it.name}</p>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{t("adminReview.qty", "Qty")}</span>
                      <span className="font-medium text-slate-700">{it.qty} {it.unit}</span>
                    </div>
                    {it.priceBase != null && (
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t("adminReview.basePrice", "Harga Dasar")}</span>
                        <span className="font-medium text-slate-700">Rp {Math.round(it.priceBase).toLocaleString("id-ID")}/unit</span>
                      </div>
                    )}
                    {it.subtotal != null && (
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t("adminReview.subtotal", "Subtotal")}</span>
                        <span className="font-medium text-slate-700">Rp {it.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    {it.ppn != null && (
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t("adminReview.ppn11", "PPN 11%")}</span>
                        <span className="font-medium text-slate-700">Rp {it.ppn.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    {it.total != null && (
                      <div className="flex justify-between text-xs border-t border-slate-200 pt-1.5 mt-1">
                        <span className="font-semibold text-slate-700">{t("adminReview.total", "Total")}</span>
                        <span className="font-bold text-emerald-700">Rp {it.total.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 space-y-0.5">
              {/* Product fulfillment fields */}
              <FulfillmentDetailRow label={t("adminReview.stockLabel", "Stok")} value={vf.stockConfirmed ? (STOCK_LABEL[vf.stockConfirmed] ?? vf.stockConfirmed) : null} />
              <FulfillmentDetailRow label={t("adminReview.qtyConfirmed", "Qty Konfirmasi")} value={vf.qtyConfirmed} />
              <FulfillmentDetailRow label={t("adminReview.readyToShip", "Siap Kirim")} value={vf.readyDate} />
              <FulfillmentDetailRow label={t("adminReview.leadTime", "Lead Time")} value={vf.leadTime} />
              <FulfillmentDetailRow label={t("adminReview.warehouseLocation", "Lokasi Gudang")} value={vf.warehouseLocation} />
              <FulfillmentDetailRow
                label={t("adminReview.priceLabel", "Harga")}
                value={
                  vf.priceConfirmed === "agree"
                    ? t("adminReview.agreeOriginalPrice", "Setuju harga asal")
                    : vf.priceConfirmed === "revised" && vf.revisedPrice
                    ? `${t("adminReview.revisedPrice", "Revisi")}: Rp ${Math.round(vf.revisedPrice).toLocaleString("id-ID")}`
                    : null
                }
              />
              {/* Trucking fields */}
              <FulfillmentDetailRow label={t("adminReview.driverLabel", "Driver")} value={vf.driverName} />
              <FulfillmentDetailRow label={t("adminReview.driverPhone", "HP Driver")} value={vf.driverPhone} />
              <FulfillmentDetailRow label={t("adminReview.plateNumber", "Plat Nomor")} value={vf.plateNumber} />
              <FulfillmentDetailRow label={t("adminReview.vehicleType", "Kendaraan")} value={vf.vehicleType} />
              <FulfillmentDetailRow label={t("adminReview.estPickup", "Est. Pickup")} value={vf.pickupTime} />
              {/* Freight fields */}
              <FulfillmentDetailRow label={t("adminReview.carrier", "Carrier")} value={vf.carrierName} />
              <FulfillmentDetailRow label={t("adminReview.awbBlNo", "AWB/BL No.")} value={vf.awbBlNumber} />
              <FulfillmentDetailRow label={t("adminReview.bookingNo", "Booking No.")} value={vf.bookingNumber} />
              <FulfillmentDetailRow label={t("adminReview.shipFlight", "Kapal/Flight")} value={vf.flightVessel} />
              <FulfillmentDetailRow label={t("adminReview.etd", "ETD")} value={vf.etd} />
              <FulfillmentDetailRow label={t("adminReview.eta", "ETA")} value={vf.eta} />
              {/* Customs fields */}
              <FulfillmentDetailRow label={t("adminReview.customsPic", "PIC Customs")} value={vf.customsPicName} />
              <FulfillmentDetailRow label={t("adminReview.customsDocs", "Dokumen Customs")} value={vf.customsDocuments} />
              <FulfillmentDetailRow label={t("adminReview.etaCustoms", "ETA Customs")} value={vf.customsProcessEta} />
              <FulfillmentDetailRow label={t("adminReview.notes", "Catatan")} value={vf.notes} />
            </div>
            {(vf.stockPhotoUrl || vf.invoiceUrl || vf.supportingDocUrl) && (
              <div className="px-5 py-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t("adminReview.documentsLabel", "Dokumen")}</p>
                <div className="flex flex-wrap gap-2">
                  {vf.stockPhotoUrl && (
                    <a href={vf.stockPhotoUrl} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-blue-600 underline">📷 {t("adminReview.stockPhoto", "Foto Stok")}</a>
                  )}
                  {vf.invoiceUrl && (
                    <a href={vf.invoiceUrl} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-blue-600 underline">📄 {t("adminReview.invoice", "Invoice")}</a>
                  )}
                  {vf.supportingDocUrl && (
                    <a href={vf.supportingDocUrl} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-blue-600 underline">📎 {t("adminReview.supportingDoc", "Dok. Pendukung")}</a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            ⚠️ {t("adminReview.noFulfillmentData", "Belum ada data fulfillment dari vendor.")}
          </div>
        )}

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {err}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            submitting
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-200"
          }`}
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("adminReview.confirming", "Mengkonfirmasi…")}
            </>
          ) : (
            <>🚀 {t("adminReview.confirmStartShipment", "Konfirmasi & Mulai Pengiriman")}</>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 pb-8">
          {t("adminReview.customerWillGetWAAfterConfirm", "Customer akan mendapat notifikasi WhatsApp setelah dikonfirmasi")}
        </p>
      </div>
    </div>
  );
}

// ── ForwardVendorView ─────────────────────────────────────────────────────────

const SERVICE_TYPE_OPTIONS = [
  "Sea Freight",
  "Air Freight",
  "Land Freight",
  "Custom Clearance",
  "Warehousing",
  "Door to Door",
  "Full Container Load (FCL)",
  "Less Container Load (LCL)",
];

function deriveServiceType(serviceType: string | null, orderType: string | null): { serviceType: string; customService: string } {
  const val = (serviceType ?? "").trim();

  if (!val) {
    return { serviceType: "", customService: "" };
  }

  if (SERVICE_TYPE_OPTIONS.includes(val)) return { serviceType: val, customService: "" };

  const ciMatch = SERVICE_TYPE_OPTIONS.find((o) => o.toLowerCase() === val.toLowerCase());
  if (ciMatch) return { serviceType: ciMatch, customService: "" };

  const lower = val.toLowerCase();
  if (lower.includes("sea") || lower.includes("laut") || lower.includes("kapal"))
    return { serviceType: "Sea Freight", customService: "" };
  if (lower.includes("air") || lower.includes("udara") || lower.includes("pesawat"))
    return { serviceType: "Air Freight", customService: "" };
  if (lower.includes("land") || lower.includes("darat") || lower.includes("truck"))
    return { serviceType: "Land Freight", customService: "" };
  if (lower.includes("custom") || lower.includes("bea") || lower.includes("cukai") || lower.includes("pabean"))
    return { serviceType: "Custom Clearance", customService: "" };
  if (lower.includes("warehouse") || lower.includes("gudang") || lower.includes("storage"))
    return { serviceType: "Warehousing", customService: "" };
  if (lower.includes("door") || lower.includes("d2d") || lower.includes("d-to-d"))
    return { serviceType: "Door to Door", customService: "" };
  if (lower.includes("fcl") || lower.includes("full container"))
    return { serviceType: "Full Container Load (FCL)", customService: "" };
  if (lower.includes("lcl") || lower.includes("less container"))
    return { serviceType: "Less Container Load (LCL)", customService: "" };

  return { serviceType: "__custom__", customService: val };
}

function ForwardVendorView({ data, token }: { data: ForwardVendorData; token: string }) {
  const { t } = useLanguage();
  const { order, rfq, selectedVendor, selectedVendorLink } = data;
  const isProduct = (order.orderType ?? "").toLowerCase() === "product";

  const derived = isProduct
    ? { serviceType: "product_fulfillment", customService: "" }
    : deriveServiceType(order.serviceType, order.orderType);
  const [serviceType, setServiceType] = useState(derived.serviceType);
  const [customService, setCustomService] = useState(derived.customService);
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ForwardResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const effectiveService = isProduct
    ? "product_fulfillment"
    : serviceType === "__custom__" ? customService : serviceType;

  const canSubmit = !!selectedVendor && (isProduct || effectiveService.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin-action/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendor!.id,
          serviceType: effectiveService,
          expiresInHours,
        }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Gagal mengirim tugas");
      setResult(body as ForwardResult);
    } catch (e: unknown) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Already used ────────────────────────────────────────────────────────────
  if (data.isUsed && data.usedAt && !result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader icon="📦" title={t("adminReview.forwardToVendor", "Forward ke Vendor")} />
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">{t("adminReview.linkAlreadyUsed", "Link Sudah Digunakan")}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {t("adminReview.fulfillmentTaskSent", "Tugas fulfillment sudah dikirim ke vendor pada")}{" "}
                {new Date(data.usedAt).toLocaleString("id-ID")}.
              </p>
            </div>
          </div>
          {selectedVendor && (
            <VendorInfoCard vendor={selectedVendor} link={selectedVendorLink} />
          )}
        </div>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full space-y-5">
          <div className="text-center space-y-2">
            <div className="text-5xl">📦</div>
            <h2 className="text-xl font-bold text-slate-800">{t("adminReview.taskSent", "Tugas Terkirim!")}</h2>
            <p className="text-slate-500 text-sm">
              {t("adminReview.fulfillLinkSentViaWA", "Link fulfillment berhasil dikirim ke WA")}{" "}
              <strong>{result.vendorName}</strong>.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("adminReview.orderNoLabel", "No. Order")}</span>
              <span className="font-mono font-semibold text-slate-800 text-sm">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("adminReview.vendorLabel", "Vendor")}</span>
              <span className="font-semibold text-slate-700 text-sm">{result.vendorName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("adminReview.serviceLabel", "Layanan")}</span>
              <span className="text-slate-600 text-sm">{effectiveService}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{t("adminReview.deadlineLabel2", "Batas Waktu")}</span>
              <span className="text-slate-600 text-sm">{expiresInHours} {t("adminReview.hoursUnit", "jam")}</span>
            </div>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-100 p-4 space-y-2">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">
              ✅ {t("adminReview.vendorGotLinkViaWA", "Vendor Sudah Dapat Link via WA")}
            </p>
            <p className="text-xs text-slate-500 break-all">{result.fulfillUrl}</p>
          </div>
          <p className="text-center text-xs text-slate-400">
            {t("adminReview.vendorFillDataViaLink", "Vendor akan mengisi data pengiriman, BL, dan dokumen melalui link tersebut.")}
          </p>
        </div>
      </div>
    );
  }

  // ── No selected vendor ──────────────────────────────────────────────────────
  if (!selectedVendor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader icon="📦" title={t("adminReview.forwardToVendor", "Forward ke Vendor")} />
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">❌</span>
            <div>
              <p className="text-red-800 font-semibold text-sm">{t("adminReview.vendorNotSelected", "Vendor Belum Dipilih")}</p>
              <p className="text-red-700 text-xs mt-0.5">
                {t("adminReview.goBackToSelectVendor", "Kembali ke langkah sebelumnya untuk memilih vendor dari penawaran yang masuk.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main forward screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader icon="📦" title={isProduct ? t("adminReview.sendProductTaskToVendor", "Kirim Tugas Produk ke Vendor") : t("adminReview.forwardTaskToVendor", "Forward Tugas ke Vendor")} />

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <OrderCard order={order} label={t("adminReview.orderLabel", "Order")} />

        {/* RFQ badge */}
        {rfq && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t("adminReview.rfqNoLabel", "No. RFQ")}</p>
              <p className="font-mono font-semibold text-slate-800">{rfq.rfqNumber}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700">
              {t("adminReview.vendorSelectedBadge", "Vendor Dipilih")}
            </span>
          </div>
        )}

        {/* Selected vendor card */}
        <VendorInfoCard vendor={selectedVendor} link={selectedVendorLink} />

        {/* ── PRODUCT ORDER: detail produk + instruksi vendor ── */}
        {isProduct ? (
          <>
            {/* Jenis tugas */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">{t("adminReview.taskType", "Jenis Tugas")}</p>
                <p className="font-bold text-emerald-800">{t("adminReview.productFulfillment", "Pemenuhan Produk / Product Fulfillment")}</p>
              </div>
            </div>

            {/* Detail produk */}
            {(order.items && order.items.length > 0) ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("adminReview.productDetail", "Detail Produk")}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs border-b border-slate-100">
                        <th className="text-left px-4 py-2 font-medium">{t("adminReview.productName", "Nama Produk")}</th>
                        <th className="text-right px-4 py-2 font-medium">{t("adminReview.qty", "Qty")}</th>
                        <th className="text-right px-4 py-2 font-medium">{t("adminReview.unit", "Satuan")}</th>
                        <th className="text-right px-4 py-2 font-medium">{t("adminReview.pricePerUnit", "Harga/Unit")}</th>
                        <th className="text-right px-4 py-2 font-medium">{t("adminReview.subtotal", "Subtotal")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {order.items.map((item, idx) => {
                        const qty = item.quantity != null ? Number(item.quantity) : null;
                        const up = item.unitPrice != null ? Number(item.unitPrice) : null;
                        const subtotal = (up != null && qty != null) ? up * qty
                          : item.subtotal != null ? Number(item.subtotal) : null;
                        return (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-slate-700 font-medium">{item.serviceName || "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{item.quantity ?? "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{item.unit ?? "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-500">{up != null ? idr(up) : "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-700">{subtotal != null ? idr(subtotal) : "—"}</td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Price breakdown — exclusive PPN */}
                {(() => {
                  const _taxRateVal = order.taxRate ?? 11;
                  const _dppFromItems = (order.items ?? []).reduce((s, i) => {
                    const qty = i.quantity != null ? Number(i.quantity) : 1;
                    const up = i.unitPrice != null ? Number(i.unitPrice) : null;
                    return s + (up != null ? up * qty : Number(i.subtotal ?? 0));
                  }, 0);
                  const _dpp = _dppFromItems > 0 ? _dppFromItems : Number(order.subtotalBeforeTax ?? order.grandTotal ?? 0);
                  const _ppn = Math.round(_dpp * _taxRateVal / 100);
                  const _grand = _dpp + _ppn;
                  if (_dpp <= 0) return null;
                  return (
                    <div className="px-5 py-4 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t("adminReview.dppBasePrice", "DPP (Harga Dasar)")}</span>
                        <span className="text-slate-700">{idr(_dpp)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">PPN {_taxRateVal}%</span>
                        <span className="text-slate-700">{idr(_ppn)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                        <span className="text-slate-700">{t("adminReview.grandTotal", "Grand Total")}</span>
                        <span className="text-emerald-700 text-lg">{idr(_grand)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : order.grandTotal && Number(order.grandTotal) > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{t("adminReview.orderValue", "Nilai Order")}</p>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">{t("adminReview.grandTotal", "Grand Total")}</span>
                  <span className="text-emerald-700 text-lg">{idr(order.grandTotal)}</span>
                </div>
              </div>
            ) : null}

            {/* Instruksi vendor */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 px-5 py-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("adminReview.vendorInstructions", "Instruksi untuk Vendor")}</p>
              <ul className="space-y-2">
                {[
                  `✅ ${t("adminReview.instrConfirmStock", "Konfirmasi ketersediaan stok")}`,
                  `💰 ${t("adminReview.instrConfirmPrice", "Konfirmasi harga penawaran")}`,
                  `📅 ${t("adminReview.instrConfirmEta", "Konfirmasi estimasi waktu siap kirim")}`,
                  `📎 ${t("adminReview.instrUploadInvoice", "Upload invoice / dokumen pendukung jika ada")}`,
                ].map((instr, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span>{instr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          /* ── LOGISTICS ORDER: pilihan jenis layanan ── */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">🛳 {t("adminReview.serviceTypeTitle", "Jenis Layanan")}</h2>
            <p className="text-xs text-slate-400 -mt-2">
              {t("adminReview.serviceTypeDesc", "Layanan yang harus dieksekusi vendor untuk order ini")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setServiceType(opt)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    serviceType === opt
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                onClick={() => setServiceType("__custom__")}
                className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  serviceType === "__custom__"
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                ✏️ {t("adminReview.otherService", "Lainnya…")}
              </button>
            </div>

            {serviceType === "__custom__" && (
              <input
                type="text"
                placeholder={t("adminReview.typeServicePlaceholder", "Ketik jenis layanan…")}
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
            )}

            {effectiveService && serviceType !== "__custom__" && (
              <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-blue-600 text-sm">✓</span>
                <span className="text-sm font-medium text-blue-800">{effectiveService}</span>
              </div>
            )}
          </div>
        )}

        {/* Deadline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ⏰ {t("adminReview.dataFillDeadline", "Batas Waktu Pengisian Data")}
          </label>
          <div className="flex items-center gap-3">
            {[24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => setExpiresInHours(h)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  expiresInHours === h
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {h} {t("adminReview.hoursUnit", "jam")}
              </button>
            ))}
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                min={1}
                max={168}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-slate-400 text-xs shrink-0">{t("adminReview.hoursUnit", "jam")}</span>
            </div>
          </div>
        </div>

        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠️ {err}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
            submitting || !canSubmit
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-200"
          }`}
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("adminReview.sending", "Mengirim…")}
            </>
          ) : isProduct ? (
            <>🛒 {t("adminReview.sendProductTaskBtn", "Kirim Tugas Produk ke")} {selectedVendor.name}</>
          ) : (
            <>📤 {t("adminReview.sendTaskBtn", "Kirim Tugas ke")} {selectedVendor.name}</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pb-8">
          {isProduct
            ? t("adminReview.vendorReceiveWAProduct", "Vendor akan menerima WA dengan link form konfirmasi produk")
            : t("adminReview.vendorReceiveWAFulfill", "Vendor akan menerima WA dengan link form pengisian data fulfillment")}
        </p>
      </div>
    </div>
  );
}

function PageHeader({ icon, title }: { icon: string; title: string }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
          <p className="text-xs text-slate-400">{t("adminReview.adminPanel", "Admin Panel")}</p>
        </div>
      </div>
    </div>
  );
}

function VendorInfoCard({
  vendor,
  link,
}: {
  vendor: { id: number; name: string; phone: string | null };
  link: SelectedVendorLink | null;
}) {
  const { t } = useLanguage();
  const price = link?.offeredPrice ?? link?.basicPrice;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
        <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide text-xs">
          ★ {t("adminReview.selectedVendorBadge", "Vendor Terpilih")}
        </span>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800 text-base">{vendor.name}</p>
            {vendor.phone && (
              <p className="text-xs text-slate-500 mt-0.5">📱 {vendor.phone}</p>
            )}
          </div>
          {price != null && (
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400">{t("adminReview.offerPrice", "Harga Penawaran")}</p>
              <p className="font-bold text-slate-800">{idr(price)}</p>
            </div>
          )}
        </div>
        {(link?.eta || link?.notes) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
            {link.eta && (
              <div>
                <p className="text-xs text-slate-400">{t("adminReview.eta", "ETA")}</p>
                <p className="text-sm font-medium text-slate-700">{link.eta}</p>
              </div>
            )}
            {link.notes && (
              <div className="col-span-2">
                <p className="text-xs text-slate-400">{t("adminReview.vendorNotes", "Catatan Vendor")}</p>
                <p className="text-sm text-slate-600 italic">{link.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────

export default function AdminReviewPage() {
  const { t } = useLanguage();
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewData | CompareData | ForwardVendorData | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    fetch(`/api/admin-action/${token}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `Error ${r.status}`);
        }
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => {
        if (e.name === "AbortError") {
          setError(t("adminReview.connectionTimeout", "Koneksi timeout. Server lambat merespons, silakan coba lagi."));
        } else {
          setError(e.message);
        }
      })
      .finally(() => { clearTimeout(timeout); setLoading(false); });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [token, retryCount]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => setRetryCount(c => c + 1)} />;
  if (!data) return null;

  if (data.actionType === "confirm_fulfillment") {
    return <ConfirmFulfillmentView data={data as unknown as ConfirmFulfillmentData} token={token} />;
  }

  if (data.actionType === "compare_vendors") {
    return <CompareVendorsView data={data as CompareData} token={token} />;
  }

  if (data.actionType === "forward_vendor") {
    return <ForwardVendorView data={data as ForwardVendorData} token={token} />;
  }

  return <ReviewOrderView data={data as ReviewData} token={token} />;
}
