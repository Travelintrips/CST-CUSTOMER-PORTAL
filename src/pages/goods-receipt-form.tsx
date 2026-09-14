import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

type Item = { id?: string; name: string; unit: string; qtyOrdered: number; unitCost: number };
type Payload = { items?: Item[]; poNumber?: string; vendorName?: string; currency?: string };
type FormData = {
  token: string; formType: string; refNumber: string | null; title: string | null;
  notes: string | null; targetName: string | null; status: string;
  currency: string | null; payload: Payload;
};

const fmtNum = (n: number, cur?: string | null) =>
  n.toLocaleString("id-ID", { style: "currency", currency: cur ?? "IDR", maximumFractionDigits: 0 });

function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
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
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("gr.invalidLink", "Link Tidak Valid")}</h2>
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
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("gr.successTitle", "Penerimaan Dikonfirmasi!")}</h2>
        {refNumber && <p className="text-xs text-slate-400 mb-2">Ref PO: {refNumber}</p>}
        <p className="text-sm text-slate-500">{t("gr.successDesc", "Data penerimaan barang/jasa telah dicatat oleh sistem.")}</p>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400";

export default function GoodsReceiptFormPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [receivedQtys, setReceivedQtys] = useState<Record<number, string>>({});
  const [rejectedQtys, setRejectedQtys] = useState<Record<number, string>>({});
  const [deliveryNote, setDeliveryNote] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError(t("gr.tokenMissing", "Token tidak ditemukan")); setLoading(false); return; }
    fetch(`/api/purchase-mini/${token}`)
      .then(async r => {
        const d = await r.json() as FormData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("gr.loadError", "Terjadi kesalahan"));
        setFormData(d);
        if (d.targetName) setReceiverName(d.targetName);
        const items = d.payload?.items ?? [];
        const qtyMap: Record<number, string> = {};
        items.forEach((item, i) => { qtyMap[i] = String(item.qtyOrdered ?? 0); });
        setReceivedQtys(qtyMap);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) { setSubmitError(t("gr.receiverRequired", "Nama penerima wajib diisi")); return; }
    const items = formData?.payload?.items ?? [];
    const receiptLines = items.map((item, i) => ({
      name: item.name,
      unit: item.unit,
      qtyOrdered: item.qtyOrdered,
      qtyReceived: Number(receivedQtys[i]) || 0,
      qtyRejected: Number(rejectedQtys[i]) || 0,
      unitCost: item.unitCost,
    }));

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/purchase-mini/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverName, deliveryNote, notes, receiptLines }),
      });
      const d = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? t("gr.submitError", "Gagal mengirim"));
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
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("gr.alreadyConfirmed", "Sudah Dikonfirmasi")}</h2>
        <p className="text-sm text-slate-500">{t("gr.alreadyConfirmedDesc", "Penerimaan barang/jasa untuk PO ini sudah dikonfirmasi.")}</p>
      </div>
    </div>
  );

  const items = formData?.payload?.items ?? [];
  const cur = formData?.currency;
  const subtotal = items.reduce((s, item, i) => s + (Number(receivedQtys[i]) || 0) * (item.unitCost || 0), 0);
  const ppn = Math.round(subtotal * 0.11 * 100) / 100;
  const total = subtotal + ppn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">📦</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{formData?.title ?? t("gr.pageTitle", "Konfirmasi Penerimaan")}</h1>
              {formData?.refNumber && <p className="text-xs text-teal-600 font-medium mt-0.5">PO: {formData.refNumber}</p>}
            </div>
          </div>
          {formData?.payload?.vendorName && (
            <p className="text-sm text-slate-600 mt-1">{t("gr.vendorLabel", "Vendor:")} <span className="font-medium">{formData.payload.vendorName}</span></p>
          )}
          {formData?.notes && (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{formData.notes}</p>
          )}
        </div>

        {/* Status */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-3 text-sm text-teal-700 font-medium">
          🚚 {t("gr.statusLabel", "Status PO: Menunggu Konfirmasi Penerimaan")}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item penerimaan */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                {t("gr.itemsTitle", "Rincian Harga Dasar & Penerimaan")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-2 text-xs text-slate-500">{t("gr.colItem", "Item")}</th>
                      <th className="text-center py-2 px-1 text-xs text-slate-500">{t("gr.colUnit", "Sat.")}</th>
                      <th className="text-right py-2 px-2 text-xs text-slate-500">{t("gr.colBasePrice", "Harga Dasar")}</th>
                      <th className="text-center py-2 px-1 text-xs text-slate-500">{t("gr.colOrdered", "Dipesan")}</th>
                      <th className="text-center py-2 pl-1 text-xs text-slate-500 font-semibold text-teal-700">{t("gr.colReceived", "Diterima")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2.5 pr-2 text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-1 text-center text-slate-500">{item.unit}</td>
                        <td className="py-2.5 px-2 text-right text-slate-600">{fmtNum(item.unitCost, cur)}</td>
                        <td className="py-2.5 px-1 text-center text-slate-600">{item.qtyOrdered}</td>
                        <td className="py-2.5 pl-1">
                          <input type="number" min="0" max={item.qtyOrdered} step="any"
                            value={receivedQtys[i] ?? ""}
                            onChange={e => setReceivedQtys(p => ({ ...p, [i]: e.target.value }))}
                            className="w-20 rounded-lg border border-teal-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {subtotal > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{t("gr.subtotal", "Subtotal (Harga Dasar, belum PPN)")}</span>
                    <span>{fmtNum(subtotal, cur)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t("gr.ppn", "PPN 11%")}</span>
                    <span>{fmtNum(ppn, cur)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-teal-700 pt-1.5 border-t border-slate-200">
                    <span>{t("gr.total", "Total (termasuk PPN)")}</span>
                    <span>{fmtNum(total, cur)}</span>
                  </div>
                  <p className="text-xs text-slate-400">* {t("gr.basePriceNote", "Berdasarkan Harga Dasar (belum termasuk margin)")}</p>
                </div>
              )}
            </div>
          )}

          {/* Form penerima */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              {t("gr.receiverInfo", "Informasi Penerimaan")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("gr.receiverName", "Nama Penerima")} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} required
                placeholder={t("gr.receiverNamePh", "Nama lengkap")} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("gr.deliveryNote", "Nomor Surat Jalan / Delivery Note")}
              </label>
              <input type="text" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)}
                placeholder="SJ-XXXXXX" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("gr.notes", "Catatan")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder={t("gr.notesPh", "Kondisi barang, catatan khusus...")} className={`${INPUT} resize-none`} />
            </div>
          </div>

          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{submitError}</div>}

          <button type="submit" disabled={submitting}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {submitting ? t("gr.submitting", "Menyimpan...") : t("gr.submitBtn", "Konfirmasi Penerimaan")}
          </button>
        </form>
      </div>
    </div>
  );
}
