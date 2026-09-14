import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plane, CheckCircle2, XCircle, AlertCircle, Loader2,
  ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── helpers ─────────────────────────────────────────────────────── */
const IDR = (n: number | string | null | undefined) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n));
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-white/10 last:border-0">
      <span className="text-sm text-white/60 min-w-[160px] shrink-0">{label}</span>
      <span className="text-sm text-white font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function AirFreightApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [declineMode,   setDeclineMode]   = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [done, setDone] = useState<"approved" | "declined" | null>(null);
  const [doneMsg, setDoneMsg] = useState("");
  const [err,  setErr]  = useState<string | null>(null);

  const { data: order, isLoading, error: loadError } = useQuery({
    queryKey: ["af-approval", token],
    queryFn: async () => {
      const r = await fetch(`/api/air-freight/approval/${token}`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? t("af.loadError", "Gagal memuat data"));
      return body as Record<string, unknown>;
    },
    enabled: !!token,
    retry: false,
  });
  const approvedOrderNumber = typeof order?.order_number === "string" || typeof order?.order_number === "number"
    ? String(order.order_number)
    : null;

  const approveMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/air-freight/approval/${token}/approve`, { method: "POST" });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? t("af.processError", "Gagal memproses"));
      return body as { message: string };
    },
    onSuccess: (data) => { setDone("approved"); setDoneMsg(data.message); setErr(null); },
    onError: (e: Error) => setErr(e.message),
  });

  const declineMut = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/air-freight/approval/${token}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason || undefined }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? t("af.processError", "Gagal memproses"));
      return body as { message: string };
    },
    onSuccess: (data) => { setDone("declined"); setDoneMsg(data.message); setErr(null); },
    onError: (e: Error) => setErr(e.message),
  });

  /* ── Done screen ─────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          {done === "approved" ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          ) : (
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
          )}
          <h1 className="text-xl font-bold text-white">
            {done === "approved"
              ? t("af.approvedTitle", "Penawaran Disetujui!")
              : t("af.declinedTitle", "Penawaran Ditolak")}
          </h1>
          <p className="text-sm text-white/70">{doneMsg}</p>
          {done === "approved" && approvedOrderNumber && (
            <Button
              className="w-full bg-sky-600 hover:bg-sky-700"
              onClick={() => setLocation(`/air-freight/track/${approvedOrderNumber}`)}
            >
              {t("af.viewTrackingBtn", "Lihat Status Pengiriman")}
            </Button>
          )}
          <button
            className="text-xs text-white/40 hover:text-white/70 underline"
            onClick={() => setLocation("/")}
          >
            {t("af.backHome", "Kembali ke Beranda")}
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading / error ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">{t("af.loadingQuote", "Memuat data penawaran…")}</p>
        </div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">{t("af.invalidLink", "Link Tidak Valid")}</h1>
          <p className="text-sm text-white/60">
            {(loadError as Error)?.message ?? t("af.invalidLinkDesc", "Link penawaran tidak ditemukan atau sudah kedaluwarsa.")}
          </p>
        </div>
      </div>
    );
  }

  const o = order as Record<string, unknown>;
  const alreadyApproved  = o.status === "approved";
  const alreadyDeclined  = o.status === "quote_declined";
  const canAct           = o.status === "quoted";
  const breakdown        = (o.final_breakdown as Record<string, unknown>) ?? {};
  const selisih          = Number(o.grand_total ?? 0) - Number(o.estimated_price_idr ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="text-center space-y-1 pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-sky-900/60 border border-sky-700 flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">{t("af.pageTitle", "Penawaran Harga Final")}</h1>
          <p className="text-sm text-white/50">Air Freight Order #{o.order_number as string}</p>
          {alreadyApproved && (
            <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-600">
              {t("af.alreadyApproved", "Sudah Disetujui")}
            </Badge>
          )}
          {alreadyDeclined && (
            <Badge className="bg-red-900/40 text-red-300 border-red-600">
              {t("af.alreadyDeclined", "Sudah Ditolak")}
            </Badge>
          )}
        </div>

        {/* Order info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-0">
          <Row label={t("af.customerLabel", "Pelanggan")}  value={o.customer_name as string} />
          <Row label={t("af.routeLabel", "Rute")}          value={`${o.origin_airport} → ${o.destination_airport}`} />
          <Row label={t("af.commodityLabel", "Komoditi")}  value={o.commodity as string} />
          <Row label={t("af.chargeableLabel", "Chargeable")} value={`${Number(o.chargeable_weight ?? 0).toLocaleString("id-ID")} kg`} />
          <Row label={t("af.airlineLabel", "Airline")}     value={(o.airline as string) ?? "—"} />
          <Row label={t("af.flightNoLabel", "Flight No.")} value={(o.flight_number as string) ?? "—"} />
          <Row label="ETD"                                  value={(o.etd as string) ?? "—"} />
          <Row label="ETA"                                  value={(o.eta as string) ?? "—"} />
          {o.transit_days != null && (
            <Row label={t("af.transitDaysLabel", "Transit Days")} value={`${o.transit_days} ${t("af.days", "hari")}`} />
          )}
          {typeof o.admin_notes === "string" && o.admin_notes.length > 0 && (
            <Row label={t("af.adminNotesLabel", "Catatan Admin")} value={o.admin_notes as string} />
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-0">
          {Number(o.estimated_price_idr) > 0 && (
            <Row label={t("af.estimatedPrice", "Estimasi Awal")} value={IDR(o.estimated_price_idr as number)} />
          )}
          <Row label={t("af.finalPrice", "Harga Final")}         value={IDR(o.final_price_idr as number)} />
          {Number(o.markup_amount) > 0 && (
            <Row label={t("af.markup", "Markup")}                value={IDR(o.markup_amount as number)} />
          )}
          {Number(o.ppn_amount) > 0 && (
            <Row label={t("af.ppn", "PPN (11%)")}                value={IDR(o.ppn_amount as number)} />
          )}
          <div className="flex gap-3 py-3 border-t border-white/10 mt-2">
            <span className="text-base font-bold text-white min-w-[160px]">{t("af.totalBill", "Total Tagihan")}</span>
            <span className="text-base font-bold text-emerald-400">{IDR(o.grand_total as number)}</span>
          </div>
          {selisih !== 0 && Number(o.estimated_price_idr) > 0 && (
            <p className={`text-xs ${selisih > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {selisih > 0 ? "▲" : "▼"} {IDR(Math.abs(selisih))} {t("af.fromEstimate", "dari estimasi awal")}
            </p>
          )}
        </div>

        {/* Breakdown toggle */}
        {Object.keys(breakdown).length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-3 text-sm text-white/80 font-medium"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              {t("af.costBreakdown", "Rincian Biaya")}
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showBreakdown && (
              <div className="px-5 pb-4 space-y-0 border-t border-white/10">
                {Object.entries(breakdown).map(([k, v]) => (
                  <Row key={k} label={k.replace(/_/g, " ")} value={
                    typeof v === "number" ? IDR(v) : String(v)
                  } />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {err && (
          <Alert className="border-red-600/40 bg-red-950/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 text-sm">{err}</AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        {canAct && !declineMode && (
          <div className="space-y-3 pt-2">
            <Button
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => approveMut.mutate()}
              disabled={approveMut.isPending}
            >
              {approveMut.isPending
                ? <RefreshCw className="w-5 h-5 animate-spin" />
                : <CheckCircle2 className="w-5 h-5" />}
              {t("af.approveBtn", "Setujui Penawaran")}
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-white/20 text-white/70 hover:bg-white/10 gap-2"
              onClick={() => setDeclineMode(true)}
            >
              <XCircle className="w-4 h-4" /> {t("af.declineBtn", "Tolak Penawaran")}
            </Button>
          </div>
        )}

        {canAct && declineMode && (
          <div className="space-y-3 bg-red-950/30 border border-red-600/30 rounded-2xl p-5">
            <p className="text-sm text-white font-medium">{t("af.declineReasonLabel", "Alasan Penolakan (opsional)")}</p>
            <Textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder={t("af.declineReasonPlaceholder", "Misal: Harga terlalu tinggi, jadwal tidak cocok, dsb.")}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
                onClick={() => { setDeclineMode(false); setDeclineReason(""); }}
              >
                {t("af.cancelBtn", "Batal")}
              </Button>
              <Button
                className="flex-1 bg-red-700 hover:bg-red-800 gap-2"
                onClick={() => declineMut.mutate()}
                disabled={declineMut.isPending}
              >
                {declineMut.isPending
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <XCircle className="w-4 h-4" />}
                {t("af.confirmDeclineBtn", "Konfirmasi Tolak")}
              </Button>
            </div>
          </div>
        )}

        {!canAct && !alreadyApproved && !alreadyDeclined && (
          <Alert className="border-amber-600/40 bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-sm">
              {t("af.notAvailable", "Order ini dalam status")} <strong>{o.status as string}</strong> — {t("af.notAvailableDesc", "penawaran belum tersedia untuk di-review.")}
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-center text-white/30 pb-4">
          {t("af.helpNote", "Butuh bantuan? Hubungi tim kami via WhatsApp.")}
        </p>
      </div>
    </div>
  );
}
