import { useState, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

type LineItem = { id: string; name: string; qty: string; unit: string; estimatedCost: string; notes: string };
type FormData = { token: string; formType: string; refNumber: string | null; title: string | null; notes: string | null; targetName: string | null; status: string };

const newLine = (): LineItem => ({
  id: crypto.randomUUID(), name: "", qty: "1", unit: "pcs", estimatedCost: "", notes: "",
});

const fmtIDR = (n: number) => n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
function ErrorState({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("pr.invalidLink", "Link Tidak Valid")}</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
function SuccessState({ refNumber }: { refNumber?: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("pr.successTitle", "Permintaan Terkirim!")}</h2>
        {refNumber && <p className="text-xs text-slate-400 mb-2">Ref: {refNumber}</p>}
        <p className="text-sm text-slate-500">{t("pr.successDesc", "Permintaan pembelian Anda telah kami terima dan akan diproses oleh tim purchasing.")}</p>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

export default function PurchaseRequestFormPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [requesterName, setRequesterName] = useState("");
  const [department, setDepartment] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([newLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError(t("pr.tokenMissing", "Token tidak ditemukan")); setLoading(false); return; }
    fetch(`/api/purchase-mini/${token}`)
      .then(async r => {
        const d = await r.json() as FormData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("pr.loadError", "Terjadi kesalahan"));
        setFormData(d);
        if (d.targetName) setRequesterName(d.targetName);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter(l => l.name.trim());
    if (!requesterName.trim()) { setSubmitError(t("pr.requesterRequired", "Nama pengaju wajib diisi")); return; }
    if (validLines.length === 0) { setSubmitError(t("pr.itemRequired", "Minimal 1 item kebutuhan wajib diisi")); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/purchase-mini/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterName, department, requiredDate, notes, items: validLines }),
      });
      const d = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? t("pr.submitError", "Gagal mengirim"));
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (submitted) return <SuccessState refNumber={formData?.refNumber} />;
  if (formData?.status === "submitted") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("pr.alreadySubmitted", "Sudah Disubmit")}</h2>
        <p className="text-sm text-slate-500">{t("pr.alreadySubmittedDesc", "Permintaan ini sudah pernah dikirim.")}</p>
      </div>
    </div>
  );

  const totalEstimate = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.estimatedCost) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">🛒</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{formData?.title ?? t("pr.pageTitle", "Permintaan Pembelian")}</h1>
              {formData?.refNumber && <p className="text-xs text-sky-600 font-medium mt-0.5">Ref: {formData.refNumber}</p>}
            </div>
          </div>
          {formData?.notes && (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 whitespace-pre-line">{formData.notes}</p>
          )}
        </div>

        {/* Status */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3 mb-4 text-sm text-sky-700 font-medium">
          📋 {t("pr.statusLabel", "Status: Menunggu Pengajuan")}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identitas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              {t("pr.requesterInfo", "Informasi Pengaju")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("pr.requesterName", "Nama Pengaju")} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={requesterName} onChange={e => setRequesterName(e.target.value)} required
                  placeholder={t("pr.requesterNamePh", "Nama lengkap")} className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("pr.department", "Departemen / Divisi")}
                </label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder={t("pr.departmentPh", "Contoh: Operations, Finance")} className={INPUT} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("pr.requiredDate", "Tanggal Dibutuhkan")}
                </label>
                <input type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>

          {/* Daftar kebutuhan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t("pr.itemListTitle", "Daftar Kebutuhan")} <span className="text-red-500">*</span>
              </h2>
              <button type="button" onClick={() => setLines(p => [...p, newLine()])}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium border border-sky-200 rounded-lg px-3 py-1.5 hover:bg-sky-50 transition-colors">
                + {t("pr.addItem", "Tambah Item")}
              </button>
            </div>
            <div className="space-y-4">
              {lines.map((line, i) => (
                <div key={line.id} className="border border-slate-100 rounded-xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500">{t("pr.item", "Item")} {i + 1}</span>
                    {lines.length > 1 && (
                      <button type="button" onClick={() => setLines(p => p.filter(l => l.id !== line.id))}
                        className="text-xs text-red-400 hover:text-red-600">{t("pr.delete", "Hapus")}</button>
                    )}
                  </div>
                  <input type="text" value={line.name} onChange={e => updateLine(line.id, "name", e.target.value)}
                    placeholder={t("pr.itemNamePh", "Nama barang / layanan")} className={INPUT} />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t("pr.qty", "Qty")}</label>
                      <input type="number" min="1" value={line.qty} onChange={e => updateLine(line.id, "qty", e.target.value)} className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t("pr.unit", "Satuan")}</label>
                      <input type="text" value={line.unit} onChange={e => updateLine(line.id, "unit", e.target.value)} placeholder="pcs" className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t("pr.estimatedPrice", "Est. Harga")}</label>
                      <input type="number" min="0" value={line.estimatedCost} onChange={e => updateLine(line.id, "estimatedCost", e.target.value)}
                        placeholder="0" className={INPUT} />
                    </div>
                  </div>
                  <input type="text" value={line.notes} onChange={e => updateLine(line.id, "notes", e.target.value)}
                    placeholder={t("pr.specNotesPh", "Spesifikasi / keterangan (opsional)")} className={INPUT} />
                </div>
              ))}
            </div>

            {/* Estimasi total */}
            {totalEstimate > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{t("pr.subtotalEstimate", "Subtotal Estimasi (belum PPN)")}</span>
                  <span>{fmtIDR(totalEstimate)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t("pr.ppn", "PPN 11%")}</span>
                  <span>{fmtIDR(totalEstimate * 0.11)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-sky-700 pt-1.5 border-t border-slate-200">
                  <span>{t("pr.totalEstimate", "Total Estimasi (termasuk PPN)")}</span>
                  <span>{fmtIDR(totalEstimate * 1.11)}</span>
                </div>
                <p className="text-xs text-slate-400">* {t("pr.estimateNote", "Harga estimasi, belum final")}</p>
              </div>
            )}
          </div>

          {/* Catatan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t("pr.additionalNotes", "Catatan Tambahan")}
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder={t("pr.additionalNotesPh", "Alasan pembelian, urgensi, atau informasi lain...")} className={`${INPUT} resize-none`} />
          </div>

          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{submitError}</div>}

          <button type="submit" disabled={submitting}
            className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {submitting ? t("pr.submitting", "Mengirim...") : t("pr.submitBtn", "Kirim Permintaan Pembelian")}
          </button>
        </form>
      </div>
    </div>
  );
}
