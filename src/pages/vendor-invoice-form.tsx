import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

type Item = { name: string; unit: string; qty: number; unitCost: number; subtotal: number };
type Payload = { items?: Item[]; poNumber?: string; vendorName?: string; currency?: string; totalAmount?: number; taxAmount?: number; grandTotal?: number };
type FormData = {
  token: string; formType: string; refNumber: string | null; title: string | null;
  notes: string | null; targetName: string | null; status: string;
  currency: string | null; payload: Payload;
};

const fmtNum = (n: number, cur?: string | null) =>
  n.toLocaleString("id-ID", { style: "currency", currency: cur ?? "IDR", maximumFractionDigits: 0 });

function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

export default function VendorInvoiceFormPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [vendorInvoiceRef, setVendorInvoiceRef] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError(t("vendorInvoice.tokenNotFound", "Token tidak ditemukan")); setLoading(false); return; }
    fetch(`/api/purchase-mini/${token}`)
      .then(async r => {
        const d = await r.json() as FormData & { error?: string };
        if (!r.ok) throw new Error(d.error ?? t("vendorInvoice.errorGeneral", "Terjadi kesalahan"));
        setFormData(d);
        if (d.targetName) setAccountHolder(d.targetName);
        if (d.payload?.grandTotal) setInvoiceAmount(String(d.payload.grandTotal));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorInvoiceRef.trim()) { setSubmitError(t("vendorInvoice.errorInvoiceRef", "Nomor invoice wajib diisi")); return; }
    if (!invoiceAmount || Number(invoiceAmount) <= 0) { setSubmitError(t("vendorInvoice.errorAmount", "Jumlah invoice wajib diisi")); return; }
    if (!bankAccount.trim()) { setSubmitError(t("vendorInvoice.errorBankAccount", "Nomor rekening wajib diisi")); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/purchase-mini/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorInvoiceRef, invoiceDate, invoiceAmount: Number(invoiceAmount), bankName, bankAccount, accountHolder, notes }),
      });
      const d = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? t("vendorInvoice.errorFailed", "Gagal mengirim"));
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("vendorInvoice.linkInvalid", "Link Tidak Valid")}</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t("vendorInvoice.successTitle", "Invoice Terkirim!")}</h2>
        {formData?.refNumber && <p className="text-xs text-slate-400 mb-2">{t("vendorInvoice.successRefLabel", "Ref PO:")} {formData.refNumber}</p>}
        <p className="text-sm text-slate-500">{t("vendorInvoice.successDesc", "Invoice Anda telah kami terima. Tim keuangan akan memproses pembayaran sesuai syarat yang disepakati.")}</p>
      </div>
    </div>
  );

  if (formData?.status === "submitted") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("vendorInvoice.alreadySubmittedTitle", "Invoice Sudah Dikirim")}</h2>
        <p className="text-sm text-slate-500">{t("vendorInvoice.alreadySubmittedDesc", "Invoice untuk PO ini sudah pernah dikirim.")}</p>
      </div>
    </div>
  );

  const items = formData?.payload?.items ?? [];
  const cur = formData?.currency;
  const poSubtotal = formData?.payload?.totalAmount ?? items.reduce((s, it) => s + it.subtotal, 0);
  const poPPN = formData?.payload?.taxAmount ?? Math.round(poSubtotal * 0.11 * 100) / 100;
  const poTotal = formData?.payload?.grandTotal ?? poSubtotal + poPPN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">🧾</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{formData?.title ?? t("vendorInvoice.invoiceTitle", "Pengiriman Invoice")}</h1>
              {formData?.refNumber && <p className="text-xs text-purple-600 font-medium mt-0.5">PO: {formData.refNumber}</p>}
            </div>
          </div>
          {formData?.targetName && (
            <p className="text-sm text-slate-600 mt-1">{t("vendorInvoice.vendorLabel", "Vendor:")} <span className="font-medium">{formData.targetName}</span></p>
          )}
          {formData?.notes && (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{formData.notes}</p>
          )}
        </div>

        {/* Status */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 text-sm text-purple-700 font-medium">
          💳 {t("vendorInvoice.statusWaiting", "Status PO: Menunggu Invoice dari Vendor")}
        </div>

        {/* Ringkasan PO */}
        {(items.length > 0 || poTotal > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("vendorInvoice.poBreakdownTitle", "Rincian Harga Dasar PO")}</p>
            {items.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-2 text-xs text-slate-500">{t("vendorInvoice.descCol", "Deskripsi")}</th>
                      <th className="text-center py-2 px-1 text-xs text-slate-500">{t("vendorInvoice.qtyCol", "Qty")}</th>
                      <th className="text-center py-2 px-1 text-xs text-slate-500">{t("vendorInvoice.unitCol", "Sat.")}</th>
                      <th className="text-right py-2 px-2 text-xs text-slate-500">{t("vendorInvoice.basePriceCol", "Harga Dasar")}</th>
                      <th className="text-right py-2 pl-2 text-xs text-slate-500">{t("vendorInvoice.subtotalCol", "Subtotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 pr-2 text-slate-800">{item.name}</td>
                        <td className="py-2 px-1 text-center text-slate-600">{item.qty}</td>
                        <td className="py-2 px-1 text-center text-slate-500">{item.unit}</td>
                        <td className="py-2 px-2 text-right text-slate-600">{fmtNum(item.unitCost, cur)}</td>
                        <td className="py-2 pl-2 text-right font-medium text-slate-800">{fmtNum(item.subtotal, cur)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t("vendorInvoice.subtotalLabel", "Subtotal (Harga Dasar, belum PPN)")}</span>
                <span>{fmtNum(poSubtotal, cur)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t("vendorInvoice.ppnLabel", "PPN 11% (nominal)")}</span>
                <span>{fmtNum(poPPN, cur)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-purple-700 pt-1.5 border-t border-slate-200">
                <span>{t("vendorInvoice.totalLabel", "Total (termasuk PPN 11%)")}</span>
                <span>{fmtNum(poTotal, cur)}</span>
              </div>
              <p className="text-xs text-amber-600">{t("vendorInvoice.basePriceWarning", "⚠ Harga di atas adalah HARGA DASAR (belum termasuk margin). Invoice Anda harus sesuai dengan nilai ini.")}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data invoice */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("vendorInvoice.invoiceDataTitle", "Data Invoice Vendor")}</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.invoiceNumberLabel", "Nomor Invoice")} <span className="text-red-500">*</span></label>
              <input type="text" value={vendorInvoiceRef} onChange={e => setVendorInvoiceRef(e.target.value)} required placeholder="INV-XXXXXX" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.invoiceDateLabel", "Tanggal Invoice")}</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.invoiceAmountLabel", "Jumlah Invoice (termasuk PPN)")} <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} required placeholder="0" className={INPUT} />
              {invoiceAmount && Number(invoiceAmount) > 0 && (
                <p className="text-xs text-slate-400 mt-1">{fmtNum(Number(invoiceAmount), cur)}</p>
              )}
            </div>
          </div>

          {/* Info bank */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("vendorInvoice.bankInfoTitle", "Informasi Rekening Bank")}</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.bankNameLabel", "Nama Bank")}</label>
              <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder={t("vendorInvoice.bankNamePh", "BCA, Mandiri, BNI, dll.")} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.bankAccountLabel", "Nomor Rekening")} <span className="text-red-500">*</span></label>
              <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} required placeholder="1234567890" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.accountHolderLabel", "Nama Pemilik Rekening")}</label>
              <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder={t("vendorInvoice.accountHolderPh", "Nama sesuai rekening")} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("vendorInvoice.notesLabel", "Catatan")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder={t("vendorInvoice.notesPh", "Syarat pembayaran, catatan lain...")} className={`${INPUT} resize-none`} />
            </div>
          </div>

          {submitError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{submitError}</div>}

          <button type="submit" disabled={submitting}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {submitting ? t("vendorInvoice.submitting", "Mengirim...") : t("vendorInvoice.submit", "Kirim Invoice")}
          </button>
        </form>
      </div>
    </div>
  );
}
