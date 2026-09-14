import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plane, AlertCircle, CheckCircle2, Package, Clock, MapPin, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IDR = (n: number | string | null | undefined) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n));
};

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)); }
  catch { return d; }
};

const TRACKING_META: Record<string, { label: string; color: string }> = {
  waiting_rate:      { label: "Menunggu Rate",            color: "bg-yellow-900/50 border-yellow-700 text-yellow-300" },
  rate_requested:    { label: "Rate Diminta ke Vendor",   color: "bg-orange-900/50 border-orange-700 text-orange-300" },
  rate_received:     { label: "Rate Diterima",            color: "bg-purple-900/50 border-purple-700 text-purple-300" },
  quoted:            { label: "Penawaran Terkirim",       color: "bg-cyan-900/50 border-cyan-700 text-cyan-300" },
  approved:          { label: "Disetujui Customer",       color: "bg-teal-900/50 border-teal-700 text-teal-300" },
  booked:            { label: "Booking Dikonfirmasi",     color: "bg-sky-900/50 border-sky-700 text-sky-300" },
  cargo_received:    { label: "Cargo Diterima di Gudang", color: "bg-blue-900/50 border-blue-700 text-blue-300" },
  departed:          { label: "Pesawat Berangkat",        color: "bg-indigo-900/50 border-indigo-700 text-indigo-300" },
  in_transit:        { label: "In Transit",               color: "bg-violet-900/50 border-violet-700 text-violet-300" },
  arrived:           { label: "Tiba di Bandara Tujuan",  color: "bg-orange-900/50 border-orange-700 text-orange-300" },
  customs_clearance: { label: "Customs Clearance",       color: "bg-amber-900/50 border-amber-700 text-amber-300" },
  out_for_delivery:  { label: "Dalam Pengiriman",        color: "bg-lime-900/50 border-lime-700 text-lime-300" },
  delivered:         { label: "Terkirim ke Penerima",    color: "bg-emerald-900/50 border-emerald-700 text-emerald-300" },
  completed:         { label: "Selesai",                 color: "bg-green-900/50 border-green-700 text-green-300" },
  cancelled:         { label: "Dibatalkan",              color: "bg-gray-900/50 border-gray-700 text-gray-300" },
};

export default function AirFreightTrackPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["af-track-public", orderNumber],
    queryFn: async () => {
      const r = await fetch(`/api/air-freight/public/track/${orderNumber}`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? "Gagal memuat tracking");
      return body as { order: Record<string, any>; events: any[] };
    },
    enabled: !!orderNumber,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Memuat tracking…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white/5 border border-red-500/30 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Order Tidak Ditemukan</h1>
          <p className="text-sm text-white/60">{(error as Error)?.message ?? "Nomor order tidak valid"}</p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setLocation("/")}>Kembali</Button>
        </div>
      </div>
    );
  }

  const { order, events } = data;
  const meta = TRACKING_META[order.status] ?? TRACKING_META[order.tracking_status ?? ""] ?? { label: order.status, color: "bg-slate-800 border-slate-600 text-slate-300" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-900/60 border border-sky-700 flex items-center justify-center">
            <Plane className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Air Freight Tracking</h1>
          <p className="text-sm font-mono text-white/60">{order.order_number}</p>
          <Badge className={`text-xs border ${meta.color}`}>{meta.label}</Badge>
        </div>

        {/* Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Pelanggan</span>
            <span className="text-white font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Rute</span>
            <span className="text-white font-medium">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
              {order.origin_airport} → {order.destination_airport}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Komoditi</span>
            <span className="text-white">{order.commodity ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Chargeable</span>
            <span className="text-white font-medium">
              <Weight className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
              {Number(order.chargeable_weight ?? 0).toLocaleString("id-ID")} kg
            </span>
          </div>
          {order.airline && (
            <div className="flex justify-between">
              <span className="text-white/50">Airline</span>
              <span className="text-white">{order.airline}</span>
            </div>
          )}
          {order.flight_number && (
            <div className="flex justify-between">
              <span className="text-white/50">Flight No.</span>
              <span className="text-white font-mono">{order.flight_number}</span>
            </div>
          )}
          {order.mawb && (
            <div className="flex justify-between">
              <span className="text-white/50">MAWB</span>
              <span className="text-white font-mono">{order.mawb}</span>
            </div>
          )}
          {order.hawb && (
            <div className="flex justify-between">
              <span className="text-white/50">HAWB</span>
              <span className="text-white font-mono">{order.hawb}</span>
            </div>
          )}
          {order.booking_number && (
            <div className="flex justify-between">
              <span className="text-white/50">Booking No.</span>
              <span className="text-white font-mono">{order.booking_number}</span>
            </div>
          )}
          {order.etd && (
            <div className="flex justify-between">
              <span className="text-white/50">ETD</span>
              <span className="text-white">{order.etd}</span>
            </div>
          )}
          {order.eta && (
            <div className="flex justify-between">
              <span className="text-white/50">ETA</span>
              <span className="text-white">{order.eta}</span>
            </div>
          )}
          {order.grand_total && (
            <div className="flex justify-between border-t border-white/10 pt-2.5 mt-1">
              <span className="text-white/50">Total Biaya</span>
              <span className="text-emerald-400 font-bold">{IDR(order.grand_total)}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        {events && events.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Timeline Pengiriman
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {[...events].reverse().map((ev: any, i) => (
                  <div key={i} className="flex gap-3 items-start pl-1">
                    <div className="w-6 h-6 rounded-full bg-sky-900/70 border border-sky-600 flex items-center justify-center shrink-0 mt-0.5 z-10">
                      <div className="w-2 h-2 rounded-full bg-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {(TRACKING_META[ev.event_type]?.label) ?? ev.event_type?.replace(/_/g, " ")}
                      </p>
                      {ev.note && <p className="text-xs text-white/50 mt-0.5">{ev.note}</p>}
                      <p className="text-xs text-white/30">{fmtDate(ev.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {events && events.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <Package className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">Belum ada update tracking</p>
          </div>
        )}

        <div className="pb-6">
          <Button variant="outline" className="w-full border-white/20 text-white/70 hover:bg-white/10"
                  onClick={() => setLocation("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}

function Weight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M3 12h18"/></svg>;
}
