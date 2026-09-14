import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { usePushNotification } from "@/hooks/usePushNotification";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";

type ProgressEntry = {
  id: number;
  status: string;
  notes: string | null;
  photo_url?: string | null;
  updated_by: string;
  is_public: boolean;
  created_at: string;
};

type OperationalDetails = {
  driverName?: string | null;
  driverPhone?: string | null;
  vehiclePlate?: string | null;
  vehicleType?: string | null;
  pickupTime?: string | null;
  carrier?: string | null;
  schedule?: string | null;
  etd?: string | null;
  eta?: string | null;
  awbBlNumber?: string | null;
} | null;

type OrderItem = {
  name: string;
  category?: string | null;
  subtotal: number;
  unitPrice?: number | null;
  qty?: number | null;
  unit?: string | null;
};

type PodFile = {
  url: string;
  type: string;
  name: string;
};

type DriverPhoto = {
  url: string;
  photoType: string;
  takenAt: string;
};

type GpsPoint = {
  lat: number;
  lng: number;
  updatedAt: string;
};

type AutoInvoice = {
  docNumber: string;
  invoiceStatus: string;
  grandTotal: number | null;
  pdfUrl: string | null;
  confirmedAt: string | null;
};

type TrackData = {
  order: {
    orderNumber: string;
    shipmentType: string;
    origin: string;
    destination: string;
    commodity?: string | null;
    grossWeight?: string | null;
    status: string;
    jobStatus?: string | null;
    customerName: string;
    createdAt: string;
    etd?: string | null;
    eta?: string | null;
  };
  vendor?: { name: string } | null;
  progress: ProgressEntry[];
  operational: OperationalDetails;
  items?: OrderItem[];
  pricing?: {
    subtotal: number | null;
    tax: number | null;
    grandTotal: number | null;
  } | null;
  podFiles?: PodFile[];
  driverPhotos?: DriverPhoto[];
  autoInvoice?: AutoInvoice | null;
  liveLocation?: GpsPoint | null;
  gpsTrail?: GpsPoint[];
};

const ALL_STEPS = [
  { key: "Order Received",    label: "Order Diterima",          labelKey: "trackingSteps.orderReceived", icon: "📋" },
  { key: "Admin Review",      label: "Ditinjau Admin",          labelKey: "trackingSteps.adminReview", icon: "🔍" },
  { key: "RFQ Sent",          label: "RFQ ke Vendor",           labelKey: "trackingSteps.rfqSent", icon: "📤" },
  { key: "Quote Received",    label: "Penawaran Masuk",         labelKey: "trackingSteps.quoteReceived", icon: "💬" },
  { key: "Customer Approval", label: "Menunggu Persetujuan",    labelKey: "trackingSteps.customerApproval", icon: "✋" },
  { key: "Vendor Confirmed",  label: "Vendor Dikonfirmasi",     labelKey: "trackingSteps.vendorConfirmed", icon: "🤝" },
  { key: "In Progress",       label: "Sedang Diproses",         labelKey: "trackingSteps.inProgress", icon: "🔄" },
  { key: "Pickup",            label: "Penjemputan",             labelKey: "trackingSteps.pickup", icon: "🚚" },
  { key: "In Transit",        label: "Dalam Perjalanan",        labelKey: "trackingSteps.inTransit", icon: "🛣️" },
  { key: "Arrived",           label: "Tiba di Tujuan",          labelKey: "trackingSteps.arrived", icon: "📍" },
  { key: "Delivered",         label: "Terkirim",                labelKey: "trackingSteps.delivered", icon: "✅" },
  { key: "POD Uploaded",      label: "Bukti Pengiriman",        labelKey: "trackingSteps.podUploaded", icon: "📄" },
  { key: "Invoice Issued",    label: "Invoice Diterbitkan",     labelKey: "trackingSteps.invoiceIssued", icon: "🧾" },
  { key: "Payment Received",  label: "Pembayaran Diterima",     labelKey: "trackingSteps.paymentReceived", icon: "💳" },
  { key: "Completed",         label: "Selesai",                 labelKey: "trackingSteps.completed", icon: "🎉" },
];

const LEGACY_STATUS_MAP: Record<string, string> = {
  "New Order": "Order Received", "Under Review": "Admin Review", "admin_review": "Admin Review",
  "Pending Vendor": "RFQ Sent", "rfq_sent": "RFQ Sent", "vendor_blasted": "RFQ Sent",
  "Quotation Sent": "Customer Approval", "customer_quoted": "Customer Approval",
  "Customer Approved": "Vendor Confirmed", "order_confirmed": "Vendor Confirmed",
  "assigned_to_vendor": "Vendor Confirmed", "Confirmed": "Vendor Confirmed",
  "in_progress": "In Transit", "waiting_pickup": "Pickup", "picked_up": "Pickup",
  "delivered": "Delivered", "pod_uploaded": "POD Uploaded",
  "invoice_created": "Invoice Issued", "payment_pending": "Payment Received",
  "paid": "Payment Received", "completed": "Completed",
};

const PHOTO_TYPE_TO_STEP: Record<string, string> = {
  pickup: "Pickup",
  cargo: "In Transit",
  general: "In Transit",
  arrival: "Arrived",
  pod: "POD Uploaded",
};

function mapStatusToStep(_jobStatus: string | null | undefined, orderStatus: string): number {
  const canonical = LEGACY_STATUS_MAP[orderStatus] ?? orderStatus;
  const idx = ALL_STEPS.findIndex(s => s.key === canonical);
  return idx >= 0 ? idx : 0;
}

function idr(n: number | null | undefined): string {
  if (n == null) return "—";
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

function formatDate(s: string) {
  return new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(s: string) {
  return new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function PhotoGrid({ photos, onOpen }: { photos: DriverPhoto[]; onOpen: (url: string) => void }) {
  if (!photos.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {photos.map((p, i) => (
        <button
          key={i}
          onClick={() => onOpen(p.url)}
          className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          title={`Foto ${p.photoType} — ${new Date(p.takenAt).toLocaleString("id-ID")}`}
        >
          <img
           src={resolveImageUrl(p.url) ?? p.url}
            alt={`Foto ${p.photoType}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <img
         src={resolveImageUrl(url) ?? url}
        alt="Foto driver"
        className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white text-xl transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

function LiveMapSection({ location, trail }: { location: GpsPoint; trail: GpsPoint[] }) {
  const { t } = useLanguage();
  const delta = 0.025;
  const w = location.lng - delta;
  const s = location.lat - delta;
  const e = location.lng + delta;
  const n = location.lat + delta;
  const osmEmbedBase = import.meta.env.VITE_OSM_EMBED_BASE_URL ?? "https://www.openstreetmap.org/export/embed.html";
  const osmEmbed = `${osmEmbedBase}?bbox=${w},${s},${e},${n}&layer=mapnik&marker=${location.lat},${location.lng}`;
  const gmapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  const minsAgo = Math.round((Date.now() - new Date(location.updatedAt).getTime()) / 60000);
  const freshLabel = minsAgo < 1 ? t("orderTrack.justNow", "baru saja") : minsAgo < 60 ? `${minsAgo} ${t("orderTrack.minutesAgo", "mnt lalu")}` : `${Math.round(minsAgo / 60)} ${t("orderTrack.hoursAgo", "jam lalu")}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">📍 {t("orderTrack.driverLocation", "Posisi Driver")}</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            {freshLabel}
          </span>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            {t("orderTrack.openMaps", "Buka Maps")} ↗
          </a>
        </div>
      </div>

      <div className="w-full h-52 border-t border-slate-100">
        <iframe
          title={t("orderTrack.driverLocation", "Posisi Driver")}
          src={osmEmbed}
          className="w-full h-full border-0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {trail.length > 1 && (
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">{trail.length} {t("orderTrack.gpsPoints", "titik GPS tercatat")} · {t("orderTrack.coordinates", "koordinat")}: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
        </div>
      )}
    </div>
  );
}

function PushToggleSimple({ orderNumber }: { orderNumber: string | null }) {
  const { t } = useLanguage();
  const { state, subscribe, unsubscribe } = usePushNotification(orderNumber);
  if (state === "unsupported" || !orderNumber) return null;
  if (state === "denied") {
    return (
      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
        🔕 {t("orderTrack.notificationsBlocked", "Notifikasi diblokir — aktifkan di pengaturan browser")}
      </div>
    );
  }
  if (state === "subscribed") {
    return (
      <button onClick={unsubscribe} className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-blue-700 font-medium px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
        🔔 {t("orderTrack.notificationsActive", "Notifikasi aktif — klik untuk matikan")}
      </button>
    );
  }
  return (
    <button onClick={subscribe} disabled={state === "loading"} className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-slate-600 font-medium px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50">
      {state === "loading" ? `⏳ ${t("orderTrack.enablingNotifications", "Mengaktifkan...")}` : `🔔 ${t("orderTrack.enableNotifications", "Aktifkan notifikasi browser")}`}
    </button>
  );
}

export default function OrderTrackPage() {
  const { t } = useLanguage();
  const { trackToken } = useParams<{ trackToken: string }>();
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  const doFetch = useCallback(() => {
    if (!trackToken) return;
    fetch(`/api/order-track/${trackToken}`)
      .then(async r => {
        const d = await r.json() as TrackData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? "Terjadi kesalahan");
        setData(d);
        setLastUpdated(new Date());
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [trackToken]);

  useEffect(() => {
    doFetch();
    const interval = setInterval(doFetch, 30_000);
    return () => clearInterval(interval);
  }, [doFetch]);

  // SSE — real-time foto driver + posisi GPS
  useEffect(() => {
    if (!trackToken) return;
    const es = new EventSource("/api/sse");
    sseRef.current = es;

    es.addEventListener("driver_photo_uploaded", () => { doFetch(); });
    es.addEventListener("logistic_order_status_changed", () => { doFetch(); });
    es.addEventListener("driver_location_update", () => { doFetch(); });

    return () => {
      es.close();
      sseRef.current = null;
    };
  }, [trackToken, doFetch]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">{t("common.loading", "Memuat tracking...")}</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("orderTrack.invalidLink", "Link Tidak Valid")}</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-400 mt-3">{t("contact.description", "Hubungi tim kami untuk informasi lebih lanjut.")}</p>
      </div>
    </div>
  );

  if (!data) return null;

  const currentStep = mapStatusToStep(data.order.jobStatus, data.order.status);
  const etaDate = data.operational?.eta ?? data.order.eta;
  const etdDate = data.operational?.etd ?? data.order.etd;
  const hasItems = data.items && data.items.length > 0;
  const hasPricing = data.pricing && (data.pricing.subtotal != null || data.pricing.grandTotal != null);
  const hasPod = data.podFiles && data.podFiles.length > 0;

  const photosByStep: Record<string, DriverPhoto[]> = {};
  for (const p of data.driverPhotos ?? []) {
    const stepKey = PHOTO_TYPE_TO_STEP[p.photoType] ?? "In Transit";
    if (!photosByStep[stepKey]) photosByStep[stepKey] = [];
    photosByStep[stepKey].push(p);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-8 px-4">
      {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📦</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800">Tracking Order</h1>
              <p className="text-sm text-slate-500 mt-0.5 font-mono">{data.order.orderNumber}</p>
            </div>
            {/* Current status badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentStep >= ALL_STEPS.length - 1
                ? "bg-green-100 text-green-700"
                : currentStep >= 4
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {ALL_STEPS[currentStep] ? t(ALL_STEPS[currentStep].labelKey, ALL_STEPS[currentStep].label) : data.order.status}
            </div>
          </div>

          <div className="mt-4 bg-slate-50 rounded-xl px-4 py-3 space-y-2">
            <InfoRow label={t("tracking.services", "Layanan")} value={data.order.shipmentType} />
            <InfoRow label={t("orderTrack.route", "Rute")} value={`${data.order.origin} → ${data.order.destination}`} />
            {data.order.commodity && <InfoRow label={t("tracking.ItemCategory", "Komoditi")} value={data.order.commodity} />}
            {data.order.grossWeight && <InfoRow label={t("calculator.weight", "Berat")} value={`${parseFloat(data.order.grossWeight).toLocaleString("id-ID")} kg`} />}
            {data.vendor && <InfoRow label={t("orderTrack.vendor", "Vendor")} value={<span className="text-blue-700">{data.vendor.name}</span>} />}
            <InfoRow label={t("tracking.createdAt", "Tgl Order")} value={formatDateShort(data.order.createdAt)} />
          </div>

          {/* ETA highlight */}
          {(etaDate || etdDate) && (
            <div className="mt-3 flex gap-2">
              {etdDate && (
                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 text-center border border-slate-100">
                  <p className="text-xs text-slate-500 mb-0.5">{t("orderTrack.etd", "ETD (Keberangkatan)")}</p>
                  <p className="text-sm font-bold text-slate-800">{formatDateShort(etdDate)}</p>
                </div>
              )}
              {etaDate && (
                <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2.5 text-center border border-blue-100">
                  <p className="text-xs text-blue-600 mb-0.5">{t("orderTrack.eta", "ETA (Estimasi Tiba)")}</p>
                  <p className="text-sm font-bold text-blue-800">{formatDateShort(etaDate)}</p>
                </div>
              )}
            </div>
          )}

          <PushToggleSimple orderNumber={data.order.orderNumber} />
        </div>

        {/* Order Items */}
        {hasItems && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">🛒 {t("tracking.orderDetails", "Rincian Pesanan")}</h2>
            <div className="divide-y divide-slate-100">
              {data.items!.map((item, i) => (
                <div key={i} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {item.qty != null && (
                        <span className="text-xs text-slate-500">{t("orderTrack.quantity", "Qty")}: {item.qty}{item.unit ? ` ${item.unit}` : ""}</span>
                      )}
                      {item.unitPrice != null && (
                        <span className="text-xs text-slate-500">{t("orderTrack.unitPrice", "Harga Jual")}: {idr(item.unitPrice)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{idr(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {/* Pricing summary */}
            {hasPricing && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                {data.pricing!.subtotal != null && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{t("tracking.subtotal", "Subtotal")}</span>
                    <span>{idr(data.pricing!.subtotal)}</span>
                  </div>
                )}
                {data.pricing!.tax != null && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>PPN 11%</span>
                    <span>{idr(data.pricing!.tax)}</span>
                  </div>
                )}
                {data.pricing!.grandTotal != null && (
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-1 border-t border-slate-200">
                    <span>{t("tracking.total", "Total")}</span>
                    <span className="text-blue-700">{idr(data.pricing!.grandTotal)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-5">{t("orders.status", "Status Pengiriman")}</h2>
          <div className="space-y-0">
            {ALL_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isCurrent = i === currentStep;
              const isPending = i > currentStep;
              const stepPhotos = photosByStep[step.key] ?? [];
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 ${
                      isDone ? "bg-green-500 border-green-500 text-white" :
                      isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" :
                      "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {isDone ? "✓" : step.icon}
                    </div>
                    {i < ALL_STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${isDone ? "bg-green-300" : "bg-slate-100"}`} />
                    )}
                  </div>
                  <div className="pb-5 pt-1.5 min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${isCurrent ? "text-blue-700" : isDone ? "text-green-700" : isPending ? "text-slate-400" : "text-slate-600"}`}>
                      {t(step.labelKey, step.label)}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 font-medium">
                         {t("orderTrack.currentStatus", "Status saat ini")}
                      </span>
                    )}
                    {stepPhotos.length > 0 && (isDone || isCurrent) && (
                      <PhotoGrid photos={stepPhotos} onOpen={setLightboxUrl} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational details */}
        {data.operational && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">🚚 {t("orderTrack.operationalDetails", "Detail Operasional")}</h2>
            <div className="space-y-2">
              <InfoRow label={t("orderTrack.driver", "Driver")} value={data.operational.driverName} />
              <InfoRow label={t("orderTrack.driverPhone", "No. HP Driver")} value={data.operational.driverPhone
                ? <a href={`tel:${data.operational.driverPhone}`} className="text-blue-600">{data.operational.driverPhone}</a>
                : null} />
              <InfoRow label={t("orderTrack.vehiclePlate", "Plat Kendaraan")} value={data.operational.vehiclePlate} />
              <InfoRow label={t("orderTrack.vehicleType", "Jenis Kendaraan")} value={data.operational.vehicleType} />
              <InfoRow label={t("orderTrack.pickupTime", "Waktu Pickup")} value={data.operational.pickupTime} />
              <InfoRow label={t("orderTrack.carrier", "Carrier")} value={data.operational.carrier} />
              <InfoRow label={t("orderTrack.schedule", "Jadwal")} value={data.operational.schedule} />
              <InfoRow label={t("orderTrack.awbBl", "AWB / BL")} value={data.operational.awbBlNumber
                ? <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-slate-700">{data.operational.awbBlNumber}</span>
                : null} />
            </div>
          </div>
        )}

        {/* Live GPS Map */}
        {data.liveLocation && (
          <LiveMapSection location={data.liveLocation} trail={data.gpsTrail ?? []} />
        )}

        {/* POD / Documents */}
        {hasPod && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">📄 {t("orderTrack.pod", "Bukti Pengiriman (POD)")}</h2>
            {/* Photo grid */}
            {data.podFiles!.some(f => f.type === "photo") && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {data.podFiles!.filter(f => f.type === "photo").map((f, i) => (
                  <a key={i} href={resolveImageUrl(f.url) ?? f.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                    <img
                      src={resolveImageUrl(f.url) ?? f.url}
                      alt={f.name}
                      className="w-full h-32 object-cover bg-slate-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <p className="text-xs text-slate-500 px-2 py-1 truncate">{f.name}</p>
                  </a>
                ))}
              </div>
            )}
            {/* Non-photo docs */}
            <div className="space-y-2">
              {data.podFiles!.filter(f => f.type !== "photo").map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xl">
                    {f.type === "invoice" ? "🧾" : f.type === "packing_list" ? "📋" : "📄"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{t("orderTrack.clickToView", "Klik untuk lihat")}</p>
                  </div>
                  <span className="text-slate-400 text-sm">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Auto-Invoice Card */}
        {data.autoInvoice && (
          <div className={`rounded-2xl shadow-sm border p-5 ${
            data.autoInvoice.invoiceStatus === "invoiced"
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🧾</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-slate-800">{t("orderTrack.shippingInvoice", "Invoice Pengiriman")}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    data.autoInvoice.invoiceStatus === "invoiced"
                      ? "bg-green-100 text-green-700"
                      : data.autoInvoice.invoiceStatus === "to_invoice"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {data.autoInvoice.invoiceStatus === "invoiced"
                       ? `✅ ${t("orderTrack.invoiced", "Sudah Ditagih")}`
                      : data.autoInvoice.invoiceStatus === "to_invoice"
                       ? `⏳ ${t("orderTrack.awaitingPayment", "Menunggu Pembayaran")}`
                      : data.autoInvoice.invoiceStatus}
                  </span>
                </div>
                <p className="text-xs font-mono text-blue-700 mt-0.5 font-semibold">{data.autoInvoice.docNumber}</p>
                {data.autoInvoice.grandTotal != null && (
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {t("tracking.total", "Total")}: {idr(data.autoInvoice.grandTotal)}
                  </p>
                )}
              </div>
            </div>
            {data.autoInvoice.pdfUrl && (
              <a
                href={data.autoInvoice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3 text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                 {t("orderTrack.downloadInvoice", "Download Invoice PDF")}
              </a>
            )}
            <p className="mt-2 text-xs text-slate-500 text-center">
              {t("orderTrack.invoiceAutoGenerated", "Invoice digenerate otomatis saat POD diterima")}
            </p>
          </div>
        )}

        {/* Progress timeline */}
        {data.progress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">📅 {t("orderTrack.activityHistory", "Riwayat Aktivitas")}</h2>
            <div className="relative pl-5">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-4">
                {[...data.progress].reverse().map((p, i) => (
                  <div key={p.id} className="relative text-sm">
                    <div className={`absolute -left-[15px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${i === 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                    <p className="font-semibold text-slate-800">{p.status}</p>
                    {p.notes && <p className="text-slate-600 text-xs mt-0.5">{p.notes}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.created_at)}</p>
                    {p.photo_url && (
                      <a href={resolveImageUrl(p.photo_url) ?? p.photo_url} target="_blank" rel="noopener noreferrer" className="mt-1.5 block">
                        <img
                          src={resolveImageUrl(p.photo_url) ?? p.photo_url}
                          alt={t("orderTrack.photo", "Foto")}
                          className="h-24 w-auto max-w-[180px] rounded-lg object-cover border border-slate-200 hover:opacity-90 transition-opacity"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty progress */}
        {data.progress.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center text-slate-400 text-sm">
            <p className="text-2xl mb-2">📡</p>
            <p>{t("orderTrack.noUpdates", "Belum ada update tracking. Mohon tunggu konfirmasi dari tim kami.")}</p>
          </div>
        )}

        {/* Footer refresh info */}
        {lastUpdated && (
          <p className="text-center text-xs text-slate-400">
            {t("orderTrack.updated", "Diperbarui")}: {lastUpdated.toLocaleTimeString("id-ID")} · {t("orderTrack.autoRefresh", "Auto-refresh setiap 30 detik")}
          </p>
        )}

      </div>
    </div>
  );
}
