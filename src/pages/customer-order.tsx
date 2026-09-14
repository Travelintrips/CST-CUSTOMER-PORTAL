import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type TimelineItem = {
  id: number;
  status: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  createdAt: string;
};

type OrderData = {
  orderNumber: string;
  serviceType: string;
  origin: string;
  destination: string;
  status: string;
  etaFinal: string | null;
  createdAt: string;
  productPrice: number | null;
  truckPrice: number | null;
  truckSource: string | null;
  totalPrice: number | null;
  timeline: TimelineItem[];
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  order_confirmed:    "orderTask.statusOrderConfirmed",
  assigned_to_vendor: "orderTask.statusAssignedToVendor",
  waiting_pickup:     "orderTask.statusWaitingPickup",
  picked_up:          "orderTask.statusPickedUp",
  in_progress:        "orderTask.statusInProgress",
  delivered:          "orderTask.statusDelivered",
  pod_uploaded:       "orderTask.statusPodUploaded",
  invoice_created:    "orderTask.statusInvoiceCreated",
  payment_pending:    "orderTask.statusPaymentPending",
  paid:               "orderTask.statusPaid",
  completed:          "orderTask.statusCompleted",
  cancelled:          "orderTask.statusCancelled",
};

const STATUS_ICONS: Record<string, string> = {
  order_confirmed:    "✅",
  assigned_to_vendor: "🏷️",
  waiting_pickup:     "⏳",
  picked_up:          "📦",
  in_progress:        "🚚",
  delivered:          "📍",
  pod_uploaded:       "📄",
  invoice_created:    "🧾",
  payment_pending:    "💳",
  paid:               "💚",
  completed:          "🎉",
  cancelled:          "❌",
};

const STATUS_COLORS: Record<string, string> = {
  order_confirmed:    "text-green-700 bg-green-50",
  assigned_to_vendor: "text-blue-700 bg-blue-50",
  waiting_pickup:     "text-amber-700 bg-amber-50",
  picked_up:          "text-blue-700 bg-blue-50",
  in_progress:        "text-indigo-700 bg-indigo-50",
  delivered:          "text-teal-700 bg-teal-50",
  pod_uploaded:       "text-teal-700 bg-teal-50",
  invoice_created:    "text-slate-700 bg-slate-50",
  payment_pending:    "text-orange-700 bg-orange-50",
  paid:               "text-green-700 bg-green-50",
  completed:          "text-green-700 bg-green-50",
  cancelled:          "text-red-700 bg-red-50",
};

const PROGRESS_STEP_KEYS = [
  { key: "order_confirmed", labelKey: "customerOrder.progressConfirm" },
  { key: "picked_up",       labelKey: "customerOrder.progressPickup" },
  { key: "in_progress",     labelKey: "customerOrder.progressJourney" },
  { key: "delivered",       labelKey: "customerOrder.progressDelivered" },
  { key: "completed",       labelKey: "customerOrder.progressCompleted" },
];

export default function CustomerOrderPage() {
  const { token } = useParams<{ token: string }>();
  const { t, locale } = useLanguage();
  const [data, setData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function getStatusMeta(status: string) {
    return {
      label: t(STATUS_LABEL_KEYS[status] as Parameters<typeof t>[0], status),
      icon:  STATUS_ICONS[status]  ?? "📋",
      color: STATUS_COLORS[status] ?? "text-slate-700 bg-slate-50",
    };
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleString(locale, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function fmtDateLong(s: string) {
    return new Date(s).toLocaleDateString(locale, {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  function fmtCurrency(n: number) {
    return n.toLocaleString(locale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
  }

  useEffect(() => {
    if (!token) return;
    fetch(`/api/customer-order/${token}`)
      .then(async (r) => {
        const d = await r.json() as OrderData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("common.error", "Terjadi kesalahan"));
        setData(d);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{t("customerOrder.loading", "Memuat status order...")}</span>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-sm text-slate-600">{error ?? t("customerOrder.notFound", "Data tidak ditemukan")}</p>
      </div>
    </div>
  );

  const statusMeta = getStatusMeta(data.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back", "Kembali")}
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-xl">
              {statusMeta.icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{data.orderNumber}</h1>
              <p className="text-sm text-slate-500">{data.serviceType}</p>
            </div>
          </div>

          {/* Current status banner */}
          <div className={`rounded-xl px-4 py-3 mb-4 ${statusMeta.color}`}>
            <p className="text-sm font-semibold">{statusMeta.icon} {statusMeta.label}</p>
            {data.etaFinal && (
              <p className="text-xs mt-0.5 opacity-75">{t("customerOrder.estimatedArrival", "Estimasi")}: {data.etaFinal}</p>
            )}
          </div>

          <div className="space-y-2">
            <InfoRow label={t("customerOrder.origin", "Asal")} value={data.origin} />
            <InfoRow label={t("customerOrder.destination", "Tujuan")} value={data.destination} />
            <InfoRow
              label={t("customerOrder.orderDate", "Tanggal Order")}
              value={fmtDateLong(data.createdAt)}
            />
          </div>
        </div>

        {/* Visual progress */}
        <ProgressBar status={data.status} />

        {/* Price summary card */}
        {(data.productPrice != null || data.truckPrice != null || data.totalPrice != null) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-3">💰 {t("customerOrder.priceSummary", "Ringkasan Harga")}</h2>
            <div className="space-y-2 text-sm">
              {data.productPrice != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("customerOrder.productService", "Produk / Jasa")}</span>
                  <span className="font-medium text-slate-800">{fmtCurrency(data.productPrice)}</span>
                </div>
              )}
              {data.truckPrice != null && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    {t("customerOrder.truck", "Truk")}
                    {data.truckSource && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        data.truckSource === "internal"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {data.truckSource === "internal"
                          ? t("customerOrder.internal", "Internal")
                          : t("customerOrder.external", "Eksternal")}
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-slate-800">{fmtCurrency(data.truckPrice)}</span>
                </div>
              )}
              {data.totalPrice != null && (
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">{t("customerOrder.total", "Total")}</span>
                  <span className="font-bold text-teal-700 text-base">{fmtCurrency(data.totalPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {data.timeline.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">📅 {t("customerOrder.journeyHistory", "Riwayat Perjalanan")}</h2>
            <div className="relative pl-5">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-5">
                {data.timeline.map((item, idx) => {
                  const m = item.status ? getStatusMeta(item.status) : null;
                  const isFirst = idx === 0;
                  return (
                    <div key={item.id} className="relative">
                      <div className={`absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-white ${isFirst ? "bg-teal-500" : "bg-slate-300"}`} />
                      <div>
                        {m && (
                          <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${m.color}`}>
                            {m.icon} {m.label}
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-sm text-slate-700 mt-1">{item.notes}</p>
                        )}
                        {item.attachmentUrl && (
                          <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline mt-1 block">
                            📎 {t("customerOrder.viewDocument", "Lihat Dokumen")}
                          </a>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{fmtDate(item.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center text-slate-400 text-sm">
            {t("customerOrder.noHistory", "Belum ada riwayat perjalanan.")}
          </div>
        )}

      </div>
    </div>
  );
}

function ProgressBar({ status }: { status: string }) {
  const { t } = useLanguage();
  const stepKeys = PROGRESS_STEP_KEYS.map(s => s.key);
  const currentIdx = stepKeys.indexOf(status);
  const activeIdx = currentIdx >= 0 ? currentIdx : (status === "cancelled" ? -1 : 0);

  if (status === "cancelled") return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between">
        {PROGRESS_STEP_KEYS.map((step, idx) => (
          <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              idx <= activeIdx ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {idx < activeIdx ? "✓" : idx + 1}
            </div>
            <span className={`text-xs text-center ${idx <= activeIdx ? "text-teal-700 font-medium" : "text-slate-400"}`}>
              {t(step.labelKey as Parameters<typeof t>[0], step.key)}
            </span>
            {idx < PROGRESS_STEP_KEYS.length - 1 && (
              <div className={`absolute h-0.5 w-full ${idx < activeIdx ? "bg-teal-400" : "bg-slate-100"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
