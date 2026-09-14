import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import TokenErrorPage, { httpStatusToTokenErrorType, type TokenErrorType } from "@/components/TokenErrorPage";

type PriceItem = {
  name: string;
  category: string;
  subtotal: number;
  unitPrice: number | null;
  qty: number | null;
  unit: string | null;
};

type QuoteData = {
  token: string;
  status: string;
  isExpired: boolean;
  isResponded: boolean;
  rfqNumber: string;
  serviceType: string | null;
  origin: string | null;
  destination: string | null;
  cargoDetail: string | null;
  finalCustomerPrice: number | null;
  displaySubtotal: number | null;
  displayTax: number | null;
  displayTotal: number | null;
  priceItems: PriceItem[];
  etaFinal: string | null;
  termsConditions: string | null;
  quoteNotes: string | null;
  validUntil: string | null;
  quotationPdfUrl?: string | null;
  quotationNumber?: string | null;
};

const idr = (n: number | null | undefined) =>
  n == null ? "—" : `Rp ${Math.round(n).toLocaleString("id-ID")}`;

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

export default function CustomerQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenErrorType, setTokenErrorType] = useState<TokenErrorType | null>(null);
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState<"approve" | "revise" | "reject" | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string; action?: "approve" | "revise" | "reject" } | null>(null);

  const countdown = useCountdown(data?.validUntil);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/customer-quote/${token}`)
      .then(async (r) => {
        const d = await r.json() as QuoteData & { error?: string };
        if (!r.ok) {
          if ([404, 409, 410, 403].includes(r.status)) {
            setTokenErrorType(httpStatusToTokenErrorType(r.status));
            setError(d.error ?? null);
          } else {
            setError(d.error ?? "Terjadi kesalahan");
          }
          return;
        }
        setData(d);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!action) return;
    if (action === "revise" && !revisionNotes.trim()) {
      alert("Catatan revisi wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/customer-quote/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: action, revisionNotes, rejectionReason }),
      });
      const d = await res.json() as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Gagal mengirim respons");
      setSubmitResult({ ok: true, message: d.message ?? "Berhasil", action });
    } catch (e: unknown) {
      setSubmitResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
      setAction(null);
    }
  };

  if (loading) return <Loader />;
  if (tokenErrorType) return <TokenErrorPage type={tokenErrorType} message={error} />;
  if (error) return <ErrorPage message={error} />;
  if (!data) return <ErrorPage message="Data tidak ditemukan" />;

  if (submitResult?.ok) {
    const doneAction = submitResult.action;
    const emoji = doneAction === "approve" ? "✅" : doneAction === "revise" ? "🔄" : "❌";
    return (
      <SuccessPage
        emoji={emoji}
        title={doneAction === "approve" ? "Penawaran Disetujui!" : doneAction === "revise" ? "Revisi Terkirim" : "Penolakan Dicatat"}
        message={submitResult.message}
      />
    );
  }

  if (data.isExpired) {
    return <ErrorPage message="Link penawaran ini sudah kadaluarsa. Silakan hubungi tim kami." />;
  }

  if (data.isResponded) {
    const statusMap: Record<string, string> = {
      approved: "Anda sudah menyetujui penawaran ini.",
      revision_requested: "Anda sudah mengirimkan permintaan revisi.",
      rejected: "Anda sudah menolak penawaran ini.",
    };
    return <ErrorPage message={statusMap[data.status] ?? "Penawaran ini sudah dijawab."} type="info" />;
  }

  const countdownExpired = countdown !== null && countdown <= 0;
  const countdownUrgent = countdown !== null && countdown > 0 && countdown < 86400000; // < 1 day

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Penawaran Harga</h1>
              <p className="text-sm text-slate-500">
                {data.quotationNumber ? `No: ${data.quotationNumber}` : `Ref: ${data.rfqNumber}`}
              </p>
            </div>
          </div>
          {data.quoteNotes && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              {data.quoteNotes}
            </div>
          )}
          {/* PDF Download */}
          {data.quotationPdfUrl && (
            <a
              href={data.quotationPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              📄 Unduh Surat Penawaran (PDF)
            </a>
          )}
        </div>

        {/* Validity Countdown */}
        {data.validUntil && countdown !== null && (
          <div className={`rounded-2xl p-4 ${countdownExpired ? "bg-red-50 border border-red-300" : countdownUrgent ? "bg-orange-50 border border-orange-300" : "bg-green-50 border border-green-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${countdownExpired ? "text-red-700" : countdownUrgent ? "text-orange-800" : "text-green-800"}`}>
                {countdownExpired ? "⛔ Penawaran sudah kadaluarsa" : "⏰ Penawaran berlaku"}
              </span>
              <span className={`font-mono font-bold text-lg ${countdownExpired ? "text-red-700" : countdownUrgent ? "text-orange-700" : "text-green-700"}`}>
                {countdownExpired ? "EXPIRED" : formatCountdown(countdown)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Berlaku hingga: {new Date(data.validUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            {!countdownExpired && (
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${countdownUrgent ? "bg-orange-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(100, (countdown / (7 * 24 * 3600000)) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Detail — hanya tampil jika ada minimal satu field yang terisi */}
        {(data.serviceType || data.origin || data.destination || data.cargoDetail) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Detail Pengiriman</h2>
            <div className="space-y-3">
              <Row label="Layanan" value={data.serviceType} />
              <Row label="Asal" value={data.origin} />
              <Row label="Tujuan" value={data.destination} />
              <Row label="Kargo" value={data.cargoDetail} />
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Detail Penawaran</h2>
          <div className="space-y-3">
            {/* Line items (if any) */}
            {data.priceItems && data.priceItems.length > 0 && (
              <div className="rounded-xl border border-slate-100 overflow-hidden mb-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs">
                      <th className="text-left px-3 py-2 font-medium">Item / Layanan</th>
                      <th className="text-right px-3 py-2 font-medium">Qty</th>
                      <th className="text-right px-3 py-2 font-medium">Satuan</th>
                      <th className="text-right px-3 py-2 font-medium">Harga Jual</th>
                      <th className="text-right px-3 py-2 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.priceItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-slate-700">{item.name}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{item.qty ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-slate-400 text-xs">{item.unit ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-slate-500">{item.unitPrice != null ? idr(item.unitPrice) : "—"}</td>
                        <td className="px-3 py-2 text-right text-slate-700 font-medium">{idr(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Price breakdown */}
            {data.displayTax != null && data.displayTotal != null ? (
              <div className="space-y-2">
                {data.displaySubtotal != null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Jumlah Pemesanan</span>
                    <span className="text-slate-700 font-medium">{idr(data.displaySubtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">PPN 11%</span>
                  <span className="text-slate-700 font-medium">{idr(data.displayTax)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Total Penawaran</span>
                  <span className="text-2xl font-bold text-blue-700">{idr(data.displayTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Harga Final</span>
                <span className="text-2xl font-bold text-blue-700">{idr(data.finalCustomerPrice)}</span>
              </div>
            )}

            {data.etaFinal && <Row label="Estimasi Waktu" value={data.etaFinal} />}
            {data.validUntil && (
              <Row label="Berlaku Hingga" value={new Date(data.validUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
            )}
          </div>
        </div>

        {data.termsConditions && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Syarat &amp; Ketentuan</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{data.termsConditions}</p>
          </div>
        )}

        {/* Actions */}
        {!action ? (
          <div className="space-y-3">
            <button
              onClick={() => { setAction("approve"); setConfirmOpen(true); }}
              className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors active:scale-95"
            >
              ✅ Setuju &amp; Konfirmasi
            </button>
            <button
              onClick={() => setAction("revise")}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors active:scale-95"
            >
              🔄 Minta Revisi
            </button>
            <button
              onClick={() => setAction("reject")}
              className="w-full py-3.5 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors active:scale-95"
            >
              ❌ Tolak Penawaran
            </button>
          </div>
        ) : action === "revise" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Catatan Revisi</h2>
            <p className="text-sm text-slate-500">Tuliskan hal yang ingin direvisi. Tim kami akan segera menindaklanjuti.</p>
            <textarea
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              rows={4}
              required
              placeholder="Contoh: Mohon review harga karena budget terbatas, atau ETA terlalu lama..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setAction(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !revisionNotes.trim()}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-sm font-semibold"
              >
                {submitting ? "Mengirim..." : "Kirim Revisi"}
              </button>
            </div>
          </div>
        ) : action === "reject" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Tolak Penawaran</h2>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Alasan penolakan (opsional)..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setAction(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white text-sm font-semibold"
              >
                {submitting ? "Mengirim..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        ) : null}

        {/* Approve confirmation modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Persetujuan</h2>
              <p className="text-sm text-slate-600 mb-1">Anda akan menyetujui penawaran berikut:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm mb-4">
                <p className="font-semibold text-green-800">{data.quotationNumber ?? data.rfqNumber}</p>
                {(data.origin || data.destination) && (
                  <p className="text-green-700">{data.origin || "—"} → {data.destination || "—"}</p>
                )}
                <p className="text-lg font-bold text-green-700 mt-1">{idr(data.displayTotal ?? data.finalCustomerPrice)}</p>
              </div>
              <p className="text-xs text-slate-400 mb-4">Dengan menekan Setuju, Anda menyetujui penawaran dan syarat yang berlaku.</p>
              <div className="flex gap-2">
                <button onClick={() => { setConfirmOpen(false); setAction(null); }} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm">
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                >
                  {submitting ? "Mengirim..." : "✅ Setuju"}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
Pertanyaan? Hubungi tim kami.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value || "—"}</span>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Memuat penawaran...</span>
      </div>
    </div>
  );
}

function ErrorPage({ message, type = "error" }: { message: string; type?: "error" | "info" }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{type === "info" ? "ℹ️" : "⚠️"}</div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function SuccessPage({ emoji, title, message }: { emoji: string; title: string; message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
