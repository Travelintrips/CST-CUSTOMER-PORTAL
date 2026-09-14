import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Ship, MapPin, Search, Loader2, Package, Anchor, CheckCircle2,
  Navigation, Clock, XCircle, ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const IDR = (n: any) =>
  n == null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n));

const TRACKING_STEPS: Array<{ key: string; label: string; icon: any }> = [
  { key: "booked",                     label: "Booking Confirmed",      icon: CheckCircle2 },
  { key: "container_empty_released",   label: "Container Released",     icon: Package },
  { key: "stuffed",                    label: "Cargo Stuffed",          icon: Package },
  { key: "gate_in",                    label: "Gate In",                icon: Navigation },
  { key: "sailed",                     label: "Vessel Sailed",          icon: Ship },
  { key: "transshipment",              label: "Transshipment",          icon: Anchor },
  { key: "arrived",                    label: "Vessel Arrived",         icon: MapPin },
  { key: "customs_clearance",          label: "Customs Clearance",      icon: Clock },
  { key: "delivered",                  label: "Delivered",              icon: CheckCircle2 },
  { key: "completed",                  label: "Completed",              icon: CheckCircle2 },
];

const STATUS_LABEL: Record<string, string> = {
  draft:"Draft", estimated:"Estimasi", waiting_rate:"Menunggu Rate",
  rate_requested:"Rate Diminta", rate_received:"Rate Diterima",
  quoted:"Quoted", approved:"Disetujui", booked:"Booked",
  sailed:"Berlayar", arrived:"Tiba", completed:"Selesai",
  cancelled:"Dibatalkan", quote_declined:"Penawaran Ditolak",
};
const STATUS_COLOR: Record<string, string> = {
  booked:"bg-emerald-900 text-emerald-300", sailed:"bg-sky-900 text-sky-300",
  arrived:"bg-indigo-900 text-indigo-300", completed:"bg-green-900 text-green-400",
  cancelled:"bg-red-900 text-red-300",
};

function getTrackingProgress(trackingStatus: string): number {
  const idx = TRACKING_STEPS.findIndex(s => s.key === trackingStatus);
  return idx < 0 ? 0 : idx;
}

export default function OceanFreightTrackPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [, params] = useRoute("/ocean-freight/track/:orderNumber");
  const urlOrderNumber = params?.orderNumber ?? "";

  const [inputOrderNumber, setInputOrderNumber] = useState(urlOrderNumber);
  const [queryOrderNumber, setQueryOrderNumber] = useState(urlOrderNumber);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["ocean-freight-track", queryOrderNumber],
    queryFn: async () => {
      const r = await fetch(`/api/ocean-freight/track/${encodeURIComponent(queryOrderNumber)}`);
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? "Order tidak ditemukan"); }
      return r.json();
    },
    enabled: !!queryOrderNumber,
    retry: false,
    refetchInterval: 60000,
  });

  function handleSearch() {
    if (inputOrderNumber.trim()) {
      setQueryOrderNumber(inputOrderNumber.trim());
      navigate(`/ocean-freight/track/${encodeURIComponent(inputOrderNumber.trim())}`);
    }
  }

  const currentStep = order?.tracking_status ? getTrackingProgress(order.tracking_status) : -1;

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : navigate("/jasa")}
            className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white/60 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("oct.back", "Kembali")}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t("oct.pageTitle", "Tracking Ocean Freight")}</h1>
              <p className="text-gray-400 text-sm">{t("oct.pageSubtitle", "Lacak status pengiriman Anda")}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            value={inputOrderNumber}
            onChange={(e) => setInputOrderNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("oct.searchPlaceholder", "Masukkan nomor order (OCF/YYMM/XXXX)")}
            className="bg-gray-800 border-gray-600 text-white"
          />
          <Button onClick={handleSearch} disabled={isLoading || !inputOrderNumber.trim()} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-center">
            <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm">{(error as Error).message}</p>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-bold font-mono">{order.order_number}</p>
                  <p className="text-gray-400 text-sm">{order.customer_name}</p>
                </div>
                <Badge className={`${STATUS_COLOR[order.status] ?? "bg-gray-800 text-gray-300"} text-xs`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">{t("oct.routeLabel", "Rute")}</p>
                  <p className="text-gray-300">{order.origin_port}</p>
                  <p className="text-gray-400">→ {order.destination_port}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{t("oct.cargoLabel", "Muatan")}</p>
                  <p className="text-gray-300">{order.shipment_type}{order.container_type ? ` / ${order.container_type}` : ""}{order.container_qty > 1 ? ` × ${order.container_qty}` : ""}</p>
                  {order.total_cbm && <p className="text-gray-400">{order.total_cbm} CBM</p>}
                </div>
                {order.carrier && <div>
                  <p className="text-gray-500 text-xs">Carrier</p>
                  <p className="text-gray-300">{order.carrier}</p>
                </div>}
                {order.vessel_name && <div>
                  <p className="text-gray-500 text-xs">{t("oct.vesselVoyage", "Vessel / Voyage")}</p>
                  <p className="text-gray-300">{order.vessel_name} / {order.voyage ?? "-"}</p>
                </div>}
                {order.etd && <div>
                  <p className="text-gray-500 text-xs">ETD</p>
                  <p className="text-gray-300">{order.etd}</p>
                </div>}
                {order.eta && <div>
                  <p className="text-gray-500 text-xs">ETA</p>
                  <p className="text-gray-300">{order.eta}</p>
                </div>}
                {order.booking_number && <div>
                  <p className="text-gray-500 text-xs">Booking No.</p>
                  <p className="text-gray-300 font-mono text-sm">{order.booking_number}</p>
                </div>}
                {order.bl_number && <div>
                  <p className="text-gray-500 text-xs">B/L No.</p>
                  <p className="text-gray-300 font-mono text-sm">{order.bl_number}</p>
                </div>}
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.tracking_status ? (
              <div className="bg-gray-900 rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" /> {t("oct.trackingStatus", "Status Pengiriman")}
                </h3>
                <div className="space-y-3">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent   = idx === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? "bg-blue-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" : isCompleted ? "bg-green-700" : "bg-gray-800 border border-gray-700"}`}>
                            <Icon className={`h-4 w-4 ${isCurrent ? "text-white" : isCompleted ? "text-green-300" : "text-gray-600"}`} />
                          </div>
                          {idx < TRACKING_STEPS.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-1 h-4 ${isCompleted ? "bg-green-700" : "bg-gray-700"}`} />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className={`text-sm font-medium ${isCurrent ? "text-white" : isCompleted ? "text-green-300" : "text-gray-600"}`}>
                            {step.label}
                            {isCurrent && <span className="ml-2 text-xs text-blue-400">● {t("oct.currentStep", "Terkini")}</span>}
                          </p>
                          {isCurrent && order.tracking_notes && (
                            <p className="text-gray-400 text-xs mt-0.5">{order.tracking_notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-5 text-center">
                <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  {["waiting_rate","rate_requested","rate_received"].includes(order.status)
                    ? "Kami sedang memproses penawaran untuk order Anda."
                    : order.status === "quoted"
                    ? "Silakan cek email/WhatsApp Anda untuk konfirmasi penawaran."
                    : order.status === "approved"
                    ? "Booking sedang diproses."
                    : "Informasi tracking belum tersedia."}
                </p>
              </div>
            )}

            <Button variant="outline" onClick={() => refetch()} className="w-full border-gray-600 text-gray-300">
              <Search className="h-4 w-4 mr-2" /> {t("oct.refreshBtn", "Refresh Status")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
