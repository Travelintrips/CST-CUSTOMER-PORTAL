import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Ship, CheckCircle2, XCircle, Loader2, MapPin, Package, DollarSign, ArrowLeft,
} from "lucide-react";

const IDR = (n: any) =>
  n == null ? "-" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n));

const fmtDate = (d: any) => {
  if (!d) return "-";
  try { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d)); }
  catch { return d; }
};

export default function OceanFreightApprovalPage() {
  const [, params] = useRoute("/ocean-freight/approval/:token");
  const token = params?.token ?? "";

  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [done, setDone] = useState<"approved" | "declined" | null>(null);
  const [doneMsg, setDoneMsg] = useState("");

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["ocean-freight-quote", token],
    queryFn: async () => {
      const r = await fetch(`/api/ocean-freight/quote/${token}`);
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? "Gagal memuat quote"); }
      return r.json();
    },
    enabled: !!token,
    retry: false,
  });

  const approveMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/ocean-freight/quote/${token}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: (d) => { setDone("approved"); setDoneMsg(d.message); },
  });

  const declineMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/ocean-freight/quote/${token}/decline`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: declineReason }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    },
    onSuccess: (d) => { setDone("declined"); setDoneMsg(d.message); },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <XCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-white text-xl font-bold">Quote Tidak Ditemukan</h2>
        <p className="text-gray-400">{(error as Error)?.message ?? "Link tidak valid atau sudah kadaluarsa."}</p>
      </div>
    </div>
  );

  if (done === "approved") return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Penawaran Disetujui!</h2>
        <p className="text-gray-400">{doneMsg}</p>
        <div className="bg-gray-800/60 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Nomor Order</p>
          <p className="text-white font-mono text-lg font-bold">{order.order_number}</p>
        </div>
        <p className="text-gray-500 text-sm">Simpan nomor order ini untuk melacak status pengiriman Anda.</p>
        <a href={`/ocean-freight/track/${order.order_number}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
          <MapPin className="h-4 w-4" /> Tracking Order
        </a>
      </div>
    </div>
  );

  if (done === "declined") return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">Penawaran Ditolak</h2>
        <p className="text-gray-400">{doneMsg}</p>
      </div>
    </div>
  );

  const isProcessed = !["quoted"].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white/60 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Konfirmasi Penawaran</h1>
              <p className="text-gray-400 text-sm font-mono">{order.order_number}</p>
            </div>
          </div>
        </div>

        {isProcessed && (
          <div className={`rounded-xl p-4 text-sm ${order.status === "approved" ? "bg-green-900/20 border border-green-700 text-green-300" : order.status === "quote_declined" ? "bg-red-900/20 border border-red-700 text-red-300" : "bg-gray-800 text-gray-300"}`}>
            {order.status === "approved" ? "✓ Penawaran ini sudah disetujui." : order.status === "quote_declined" ? "✗ Penawaran ini sudah ditolak." : `Status: ${order.status}`}
          </div>
        )}

        {/* Order Info */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-700 pb-3">
            <Package className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Detail Pengiriman</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Origin Port</p>
              <p className="text-white">{order.origin_port}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Destination Port</p>
              <p className="text-white">{order.destination_port}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Jenis Muatan</p>
              <p className="text-white">{order.shipment_type}{order.container_type ? ` / ${order.container_type}` : ""}{order.container_qty > 1 ? ` × ${order.container_qty}` : ""}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Service Mode</p>
              <p className="text-white">{order.service_mode?.replace(/_/g, " ") ?? "-"}</p>
            </div>
            {order.carrier && <div>
              <p className="text-gray-500 text-xs">Carrier</p>
              <p className="text-white">{order.carrier}</p>
            </div>}
            {order.vessel_name && <div>
              <p className="text-gray-500 text-xs">Vessel / Voyage</p>
              <p className="text-white">{order.vessel_name} / {order.voyage ?? "-"}</p>
            </div>}
            {order.etd && <div>
              <p className="text-gray-500 text-xs">ETD</p>
              <p className="text-white">{order.etd}</p>
            </div>}
            {order.eta && <div>
              <p className="text-gray-500 text-xs">ETA</p>
              <p className="text-white">{order.eta}</p>
            </div>}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-700 pb-3">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Rincian Harga</h3>
          </div>
          <div className="space-y-2 text-sm">
            {order.final_price && (
              <div className="flex justify-between text-gray-300">
                <span>Harga Dasar</span>
                <span>{order.currency !== "IDR" ? `${order.currency} ${Number(order.final_price).toLocaleString("id-ID")}` : IDR(order.final_price)}</span>
              </div>
            )}
            {Number(order.markup_amount ?? 0) > 0 && (
              <div className="flex justify-between text-gray-300"><span>Biaya Layanan</span><span>{IDR(order.markup_amount)}</span></div>
            )}
            {Number(order.ppn_amount ?? 0) > 0 && (
              <div className="flex justify-between text-gray-300"><span>PPN ({order.ppn_pct}%)</span><span>{IDR(order.ppn_amount)}</span></div>
            )}
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2">
              <span>Total</span>
              <span className="text-green-400">{IDR(order.grand_total)}</span>
            </div>
          </div>
          {order.quote_sent_at && <p className="text-gray-500 text-xs">Dikirim: {fmtDate(order.quote_sent_at)}</p>}
        </div>

        {/* Actions */}
        {!isProcessed && (
          <div className="space-y-3">
            {!showDeclineForm ? (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-red-700 text-red-400 hover:bg-red-900/20" onClick={() => setShowDeclineForm(true)}>
                  <XCircle className="h-4 w-4 mr-2" /> Tolak Penawaran
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
                  {approveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Setujui
                </Button>
              </div>
            ) : (
              <div className="space-y-3 bg-gray-900 rounded-xl p-4">
                <p className="text-gray-300 text-sm font-medium">Alasan Penolakan (opsional)</p>
                <Textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Jelaskan alasan penolakan..." className="bg-gray-800 border-gray-600 text-white text-sm" rows={3} />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-gray-600 text-gray-300" onClick={() => setShowDeclineForm(false)}>Batal</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => declineMut.mutate()} disabled={declineMut.isPending}>
                    {declineMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Konfirmasi Tolak
                  </Button>
                </div>
              </div>
            )}
            <p className="text-gray-500 text-xs text-center">
              Dengan menyetujui, Anda menyatakan setuju dengan harga dan ketentuan yang diberikan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
