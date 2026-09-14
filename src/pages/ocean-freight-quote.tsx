import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Ship, CheckCircle2, XCircle, Loader2, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const IDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STATUS_LABELS: Record<string, { l: string; color: string }> = {
  waiting_rate:   { l: "Menunggu Rate",    color: "bg-yellow-100 text-yellow-700" },
  rate_requested: { l: "RFQ Dikirim",      color: "bg-blue-100 text-blue-700" },
  rate_received:  { l: "Rate Diterima",    color: "bg-purple-100 text-purple-700" },
  quoted:         { l: "Siap Dikonfirmasi", color: "bg-green-100 text-green-700" },
  approved:       { l: "Disetujui",        color: "bg-green-200 text-green-800" },
  booked:         { l: "Booked",           color: "bg-blue-200 text-blue-800" },
  sailed:         { l: "Berlayar",         color: "bg-sky-100 text-sky-700" },
  arrived:        { l: "Tiba",             color: "bg-teal-100 text-teal-700" },
  completed:      { l: "Selesai",          color: "bg-gray-100 text-gray-700" },
  quote_declined: { l: "Ditolak",          color: "bg-red-100 text-red-700" },
  cancelled:      { l: "Dibatalkan",       color: "bg-red-100 text-red-700" },
};

const TRACKING_STEPS = [
  { k: "booked",                   l: "Booked" },
  { k: "container_empty_released", l: "Container Released" },
  { k: "stuffed",                  l: "Stuffed" },
  { k: "gate_in",                  l: "Gate In" },
  { k: "sailed",                   l: "Sailed" },
  { k: "transshipment",            l: "Transshipment" },
  { k: "arrived",                  l: "Arrived" },
  { k: "customs_clearance",        l: "Customs Clearance" },
  { k: "delivered",                l: "Delivered" },
  { k: "completed",                l: "Completed" },
];

export default function OceanFreightQuotePage() {
  const params = useParams<{ token: string }>();
  const token  = params.token ?? "";
  const { toast } = useToast();
  const { t } = useLanguage();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [order,      setOrder]      = useState<any>(null);
  const [action,     setAction]     = useState<"idle" | "approving" | "declining">("idle");
  const [done,       setDone]       = useState<"approved" | "declined" | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/ocean-freight/quote/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); } else { setOrder(d); }
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [token]);

  async function handleApprove() {
    setAction("approving");
    try {
      const res = await fetch(`/api/ocean-freight/quote/${token}/approve`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDone("approved");
      setOrder((prev: any) => ({ ...prev, status: "approved" }));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAction("idle");
    }
  }

  async function handleDecline() {
    setAction("declining");
    try {
      const res = await fetch(`/api/ocean-freight/quote/${token}/decline`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDone("declined");
      setOrder((prev: any) => ({ ...prev, status: "quote_declined" }));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAction("idle");
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Tidak Ditemukan</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!order) return null;

  const statusInfo = STATUS_LABELS[order.status] ?? { l: order.status, color: "bg-gray-100 text-gray-700" };
  const finalBreakdown = order.final_breakdown ?? {};
  const trackingIdx = TRACKING_STEPS.findIndex(s => s.k === order.tracking_status);

  return (
    <div className="min-h-screen bg-blue-950 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white/60 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("ocq.back", "Kembali")}
        </button>

        {/* Header */}
        <div className="bg-blue-900 rounded-2xl p-5 flex items-center gap-3">
          <Ship className="w-8 h-8 text-blue-300" />
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">Ocean Freight Quote</h1>
            <p className="text-blue-300 text-xs">No. {order.order_number}</p>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.l}</Badge>
        </div>

        {/* Route Summary */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-800 mb-3">{t("ocq.shipmentDetail", "Detail Pengiriman")}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Rute", `${order.origin_port} → ${order.destination_port}`],
              ["Shipment Type", `${order.shipment_type}${order.container_type ? " - " + order.container_type : ""}`],
              ["Service Mode", order.service_mode?.replace(/_/g, " ")],
              ["Trade Type", order.trade_type],
              ["Komoditi", order.commodity],
              ["Cargo Condition", order.cargo_condition],
              order.incoterm ? ["Incoterm", order.incoterm] : null,
              order.etd_preferred ? ["ETD Preferred", order.etd_preferred] : null,
            ].filter(Boolean).map(([k, v]: any) => (
              <div key={k}>
                <p className="text-gray-400 text-xs">{k}</p>
                <p className="text-gray-800 font-medium capitalize">{v}</p>
              </div>
            ))}
          </div>

          {order.selected_additional_services?.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-400 mb-1">Layanan Tambahan</p>
              <div className="flex flex-wrap gap-1">
                {(order.selected_additional_services as string[]).map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold text-gray-800 mb-3">{t("ocq.priceTitle", "Harga")}</h3>
          {order.estimated_price_idr && (
            <div className="flex justify-between text-sm text-gray-600 pb-2">
              <span>Estimasi Awal</span>
              <span>{IDR(Number(order.estimated_price_idr))}</span>
            </div>
          )}
          {order.grand_total && (
            <>
              <div className="flex justify-between text-base font-bold text-blue-700 py-2 border-t">
                <span>Harga Final</span>
                <span>{IDR(Number(order.grand_total))}</span>
              </div>
              {order.estimated_price_idr && Number(order.grand_total) !== Number(order.estimated_price_idr) && (
                <p className="text-xs text-right text-gray-400">
                  Selisih: {IDR(Math.abs(Number(order.grand_total) - Number(order.estimated_price_idr)))}
                  {Number(order.grand_total) > Number(order.estimated_price_idr) ? " lebih tinggi" : " lebih rendah"}
                </p>
              )}
            </>
          )}

          {/* Breakdown */}
          {order.final_breakdown && Object.keys(order.final_breakdown).length > 0 && (
            <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
              {Object.entries(order.final_breakdown).filter(([k, v]) => v && Number(v) > 0 && !["currency","total_estimate","total_estimate_idr","chargeable_cbm"].includes(k)).map(([k, v]) => (
                <div key={k} className="flex justify-between text-gray-600">
                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                  <span>{IDR(Number(v))}</span>
                </div>
              ))}
            </div>
          )}

          {order.admin_notes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-400 mb-1">Catatan Admin</p>
              <p className="text-sm text-gray-700">{order.admin_notes}</p>
            </div>
          )}
        </div>

        {/* Booking Details (post-booking) */}
        {order.status === "booked" && (order.vessel_name || order.etd) && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-gray-800 mb-3">{t("ocq.bookingDetail", "Detail Booking")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Booking No", order.booking_number],
                ["Carrier", order.carrier],
                ["Vessel", order.vessel_name],
                ["Voyage", order.voyage],
                ["ETD", order.etd],
                ["ETA", order.eta],
                ["B/L No", order.bl_number],
                ["Container No", order.container_number],
              ].filter(([, v]) => v).map(([k, v]: any) => (
                <div key={k}>
                  <p className="text-gray-400 text-xs">{k}</p>
                  <p className="text-gray-800 font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracking Timeline */}
        {order.tracking_status && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t("ocq.trackingStatus", "Status Pengiriman")}
            </h3>
            <div className="space-y-2">
              {TRACKING_STEPS.map((step, idx) => {
                const done = trackingIdx >= idx;
                const current = trackingIdx === idx;
                return (
                  <div key={step.k} className={`flex items-center gap-3 text-sm ${done ? "text-gray-800" : "text-gray-400"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      current ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done && !current ? "✓" : idx + 1}
                    </div>
                    <span className={current ? "font-bold text-blue-700" : ""}>{step.l}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {done === "approved" && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-800">{t("ocq.quoteApproved", "Quote Disetujui")}</p>
            <p className="text-sm text-green-600">{t("ocq.quoteApprovedDesc", "Admin akan menghubungi Anda untuk konfirmasi booking.")}</p>
          </div>
        )}
        {done === "declined" && (
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-red-800">{t("ocq.quoteDeclined", "Quote Ditolak")}</p>
          </div>
        )}

        {order.status === "quoted" && !done && (
          <div className="bg-white rounded-xl shadow p-5 space-y-3">
            <h3 className="font-bold text-gray-800">{t("ocq.confirmQuoteTitle", "Konfirmasi Quote")}</h3>
            <p className="text-sm text-gray-600">{t("ocq.confirmQuoteDesc", "Silakan review harga final di atas, lalu pilih tindakan:")}</p>
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={action !== "idle"}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {action === "approving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction("declining")}
                disabled={action !== "idle"}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" /> Decline
              </Button>
            </div>
            {action === "declining" && (
              <div className="space-y-2">
                <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={2}
                  placeholder={t("ocq.declineReasonPh", "Alasan penolakan (opsional)...")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setAction("idle")} className="flex-1">{t("ocq.cancelBtn", "Batal")}</Button>
                  <Button onClick={handleDecline} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    {t("ocq.confirmDeclineBtn", "Konfirmasi Decline")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {["waiting_rate","rate_requested","rate_received"].includes(order.status) && (
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="font-semibold text-yellow-800">{t("ocq.processingTitle", "Sedang Diproses")}</p>
            <p className="text-sm text-yellow-700">{t("ocq.processingDesc", "Tim kami sedang mendapatkan konfirmasi rate dari shipping line / partner. Kami akan menghubungi Anda segera.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
