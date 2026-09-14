import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Globe, AlertCircle, Loader2, MapPin, FileText, Package,
  Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface PpjkOrder {
  orderNumber: string;
  tradeType: string;
  status: string;
  customsStatus: string | null;
  commodity: string | null;
  hsCode: string | null;
  origin: string | null;
  destination: string | null;
  portOfEntry: string | null;
  kantorPabean: string | null;
  jenisPelayanan: string | null;
  nomorAju: string | null;
  nomorPib: string | null;
  nomorPeb: string | null;
  nomorSppb: string | null;
  tanggalAju: string | null;
  grossWeight: string | null;
  cbm: string | null;
  koli: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TimelineEntry {
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  changedBy: string;
  notes: string | null;
  createdAt: string;
}

/* ── Status visual config (colors only — labels via i18n) ─────────────────── */
const STATUS_VISUAL: Record<string, { labelKey: string; color: string; dot: string }> = {
  draft:      { labelKey: "ppjkTrack.statusDraft",      color: "bg-slate-800/80 border-slate-600 text-slate-300",        dot: "bg-slate-400" },
  confirmed:  { labelKey: "ppjkTrack.statusConfirmed",  color: "bg-teal-900/60 border-teal-700 text-teal-300",           dot: "bg-teal-400" },
  processing: { labelKey: "ppjkTrack.statusProcessing", color: "bg-blue-900/60 border-blue-700 text-blue-300",           dot: "bg-blue-400" },
  submitted:  { labelKey: "ppjkTrack.statusSubmitted",  color: "bg-indigo-900/60 border-indigo-700 text-indigo-300",     dot: "bg-indigo-400" },
  examining:  { labelKey: "ppjkTrack.statusExamining",  color: "bg-amber-900/60 border-amber-700 text-amber-300",        dot: "bg-amber-400" },
  approved:   { labelKey: "ppjkTrack.statusApproved",   color: "bg-green-900/60 border-green-700 text-green-300",        dot: "bg-green-400" },
  completed:  { labelKey: "ppjkTrack.statusCompleted",  color: "bg-emerald-900/60 border-emerald-700 text-emerald-300",  dot: "bg-emerald-400" },
  cancelled:  { labelKey: "ppjkTrack.statusCancelled",  color: "bg-red-900/60 border-red-700 text-red-300",              dot: "bg-red-400" },
  on_hold:    { labelKey: "ppjkTrack.statusOnHold",     color: "bg-orange-900/60 border-orange-700 text-orange-300",     dot: "bg-orange-500" },
};

const CUSTOMS_STATUS_KEYS: Record<string, string> = {
  pending:      "ppjkTrack.customsPending",
  aju_filed:    "ppjkTrack.customsAjuFiled",
  jalur_hijau:  "ppjkTrack.customsJalurHijau",
  jalur_merah:  "ppjkTrack.customsJalurMerah",
  jalur_kuning: "ppjkTrack.customsJalurKuning",
  sppb_issued:  "ppjkTrack.customsSppbIssued",
  paid:         "ppjkTrack.customsPaid",
  released:     "ppjkTrack.customsReleased",
};

const ACTION_LABEL_KEYS: Record<string, string> = {
  created:                  "ppjkTrack.actionCreated",
  status_changed:           "ppjkTrack.actionStatusChanged",
  customs_status_changed:   "ppjkTrack.actionCustomsStatusChanged",
  document_uploaded:        "ppjkTrack.actionDocumentUploaded",
  note_added:               "ppjkTrack.actionNoteAdded",
  updated:                  "ppjkTrack.actionUpdated",
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(s: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(s));
}

function fmtDateShort(s: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(s));
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
      <span className="text-white/40 shrink-0">{label}</span>
      <span className="text-white/90 font-medium text-right break-all">{value}</span>
    </div>
  );
}

/* ── Status steps (ordered timeline) ─────────────────────────────────────── */
const ORDERED_STATUSES = [
  "draft", "confirmed", "processing", "submitted", "examining", "approved", "completed",
];

function StatusStepper({ currentStatus, t }: { currentStatus: string; t: (key: string, fb?: string) => string }) {
  if (currentStatus === "cancelled" || currentStatus === "on_hold") return null;
  const currentIdx = ORDERED_STATUSES.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-1 scrollbar-hide">
      {ORDERED_STATUSES.map((s, i) => {
        const vis = STATUS_VISUAL[s];
        const done = i < currentIdx;
        const active = i === currentIdx;
        const label = t(vis?.labelKey ?? s, s);
        return (
          <div key={s} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                done ? "border-emerald-500 bg-emerald-500/30" :
                active ? "border-sky-400 bg-sky-400/20 ring-2 ring-sky-400/30" :
                "border-white/20 bg-white/5"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                  <div className={`w-2 h-2 rounded-full ${active ? "bg-sky-400" : "bg-white/20"}`} />}
              </div>
              <span className={`text-[9px] text-center max-w-[52px] leading-tight ${
                active ? "text-sky-300 font-semibold" : done ? "text-emerald-400/70" : "text-white/25"
              }`}>
                {label.split("/")[0].trim()}
              </span>
            </div>
            {i < ORDERED_STATUSES.length - 1 && (
              <div className={`h-px w-4 mx-0.5 mt-[-10px] ${done ? "bg-emerald-500/60" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function PpjkTrackPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [, setLocation] = useLocation();
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const { t, locale } = useLanguage();

  // Decode first (in case Wouter passed it already encoded), then re-encode for the API call
  const decodedOrderNumber = orderNumber ? decodeURIComponent(orderNumber) : "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["ppjk-track-public", decodedOrderNumber],
    queryFn: async () => {
      const r = await fetch(`/api/ppjk/public/track/${encodeURIComponent(decodedOrderNumber)}`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? t("ppjkTrack.loadError", "Gagal memuat data tracking"));
      return body as { order: PpjkOrder; timeline: TimelineEntry[] };
    },
    enabled: !!decodedOrderNumber,
    refetchInterval: 30_000,
  });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">{t("ppjkTrack.loading", "Memuat tracking PPJK…")}</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white/5 border border-red-500/30 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">{t("ppjkTrack.notFound", "Order Tidak Ditemukan")}</h1>
          <p className="text-sm text-white/60">{(error as Error)?.message ?? t("ppjkTrack.notFoundDesc", "Nomor order tidak valid atau belum tersedia")}</p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setLocation("/")}
          >
            {t("common.backHome", "Kembali ke Beranda")}
          </Button>
        </div>
      </div>
    );
  }

  const { order, timeline } = data;

  const statusVis = STATUS_VISUAL[order.status] ?? {
    labelKey: order.status,
    color: "bg-slate-800 border-slate-600 text-slate-300",
    dot: "bg-slate-400",
  };
  const statusLabel = t(statusVis.labelKey as Parameters<typeof t>[0], order.status);
  const tradeLabel = order.tradeType === "export"
    ? t("ppjkTrack.export", "Ekspor")
    : t("ppjkTrack.import", "Impor");
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  const visibleTimeline = showAllTimeline ? timeline : timeline.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center">
            <Globe className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t("ppjkTrack.pageTitle", "PPJK / Customs Tracking")}</h1>
            <p className="text-xs font-mono text-white/50 mt-1">{order.orderNumber}</p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className={`text-xs border px-3 py-1 ${statusVis.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusVis.dot} inline-block mr-1.5`} />
              {statusLabel}
            </Badge>
            <Badge className="text-xs border bg-white/5 border-white/15 text-white/60">
              {tradeLabel}
            </Badge>
            {order.jenisPelayanan && (
              <Badge className="text-xs border bg-white/5 border-white/15 text-white/60">
                {order.jenisPelayanan}
              </Badge>
            )}
          </div>
        </div>

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-300 bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-sm">
              <XCircle className="w-4 h-4 shrink-0" />
              {t("ppjkTrack.cancelledNote", "Order dibatalkan — silakan hubungi tim kami.")}
            </div>
          </div>
        )}

        {/* Progress stepper */}
        {!isCancelled && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-3 font-medium uppercase tracking-wide">
              {t("ppjkTrack.progressTitle", "Progres Kepabeanan")}
            </p>
            <StatusStepper currentStatus={order.status} t={t} />
            {order.status === "on_hold" && (
              <div className="mt-3 flex items-center gap-2 text-orange-300 bg-orange-900/20 border border-orange-700/30 rounded-xl p-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {t("ppjkTrack.onHoldNote", "Order sedang ditahan — tim kami akan segera menghubungi Anda.")}
              </div>
            )}
            {isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-emerald-300 bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {t("ppjkTrack.completedNote", "🎉 Proses kepabeanan selesai — barang siap diambil atau dikirim.")}
              </div>
            )}
          </div>
        )}

        {/* Order info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-white/40" />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
              {t("ppjkTrack.cargoInfo", "Informasi Kargo")}
            </span>
          </div>
          <div className="space-y-0">
            <InfoRow label={t("ppjkTrack.commodity", "Komoditi")} value={order.commodity} />
            <InfoRow label={t("ppjkTrack.hsCode", "HS Code")} value={order.hsCode} />
            {order.origin && order.destination && (
              <InfoRow
                label={t("ppjkTrack.route", "Rute")}
                value={
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {order.origin} → {order.destination}
                  </span>
                }
              />
            )}
            <InfoRow label={t("ppjkTrack.portOfEntry", "Pelabuhan Masuk/Keluar")} value={order.portOfEntry} />
            <InfoRow label={t("ppjkTrack.kantorPabean", "Kantor Pabean")} value={order.kantorPabean} />
            <InfoRow label={t("ppjkTrack.grossWeight", "Berat Kotor")} value={order.grossWeight ? `${Number(order.grossWeight).toLocaleString(locale)} kg` : null} />
            <InfoRow label={t("ppjkTrack.cbm", "CBM")} value={order.cbm ? `${Number(order.cbm).toLocaleString(locale)} m³` : null} />
            <InfoRow label={t("ppjkTrack.koli", "Koli")} value={order.koli} />
            <InfoRow label={t("ppjkTrack.submissionDate", "Tgl. Pengajuan")} value={order.createdAt ? fmtDateShort(order.createdAt, locale) : null} />
          </div>
        </div>

        {/* Documents */}
        {(order.nomorAju || order.nomorPib || order.nomorPeb || order.nomorSppb) && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
                {t("ppjkTrack.customsDocsTitle", "Nomor Dokumen Kepabeanan")}
              </span>
            </div>
            <div className="space-y-0">
              <InfoRow label={t("ppjkTrack.nomorAju", "Nomor Aju")} value={order.nomorAju} />
              {order.tanggalAju && <InfoRow label={t("ppjkTrack.tanggalAju", "Tanggal Aju")} value={order.tanggalAju} />}
              <InfoRow label={t("ppjkTrack.nomorPib", "Nomor PIB")} value={order.nomorPib} />
              <InfoRow label={t("ppjkTrack.nomorPeb", "Nomor PEB")} value={order.nomorPeb} />
              {order.nomorSppb && (
                <div className="flex items-start justify-between gap-3 py-2 text-sm">
                  <span className="text-white/40 shrink-0">{t("ppjkTrack.nomorSppb", "Nomor SPPB")}</span>
                  <span className="text-emerald-400 font-bold text-right">{order.nomorSppb}</span>
                </div>
              )}
            </div>
            {order.customsStatus && (
              <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                {t("ppjkTrack.customsStatusLabel", "Status BC:")} <span className="font-medium text-white/80 ml-1">
                  {t((CUSTOMS_STATUS_KEYS[order.customsStatus] ?? order.customsStatus) as Parameters<typeof t>[0], order.customsStatus)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
                {t("ppjkTrack.updateHistory", "Riwayat Update")}
              </span>
            </div>
            <div className="space-y-4">
              {visibleTimeline.map((entry, i) => {
                const toStatusKey = entry.toStatus ? STATUS_VISUAL[entry.toStatus]?.labelKey : null;
                const toStatusLabel = toStatusKey
                  ? t(toStatusKey as Parameters<typeof t>[0], entry.toStatus ?? "")
                  : (entry.toStatus ?? null);
                const actionLabelKey = ACTION_LABEL_KEYS[entry.action];
                const actionLabel = actionLabelKey
                  ? t(actionLabelKey as Parameters<typeof t>[0], entry.action)
                  : entry.action;
                const isFirst = i === 0;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${isFirst ? "bg-sky-400" : "bg-white/25"}`} />
                      {i < visibleTimeline.length - 1 && (
                        <div className="w-px flex-1 bg-white/10 mt-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className={`text-sm font-medium ${isFirst ? "text-white" : "text-white/70"}`}>
                        {actionLabel}
                      </p>
                      {toStatusLabel && (
                        <p className="text-xs text-emerald-400/80 mt-0.5">→ {toStatusLabel}</p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-white/50 mt-1 italic">{entry.notes}</p>
                      )}
                      <p className="text-xs text-white/30 mt-1">{fmtDate(entry.createdAt, locale)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {timeline.length > 5 && (
              <button
                onClick={() => setShowAllTimeline(v => !v)}
                className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mx-auto"
              >
                {showAllTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showAllTimeline
                  ? t("ppjkTrack.collapseTimeline", "Sembunyikan")
                  : t("ppjkTrack.expandTimeline", "Lihat {n} update lainnya").replace("{n}", String(timeline.length - 5))}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-3 pb-4">
          <p className="text-xs text-white/30">
            {t("ppjkTrack.lastUpdated", "Terakhir diperbarui:")} {fmtDate(order.updatedAt, locale)}
          </p>
          <p className="text-xs text-white/25">
            {t("ppjkTrack.autoRefresh", "Halaman diperbarui otomatis setiap 30 detik")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={() => setLocation("/")}
          >
            {t("common.backHome", "Kembali ke Beranda")}
          </Button>
        </div>

      </div>
    </div>
  );
}
