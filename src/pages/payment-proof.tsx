import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { ArrowLeft } from "lucide-react";

type InvoiceInfo = {
  docNumber: string;
  invoiceNumber: string | null;
  customerName: string | null;
  grandTotal: number;
  paymentStatus: string;
  proofUrl: string | null;
  proofRemarks: string | null;
  proofUploadedAt: string | null;
  dueDate: string | null;
};

function fmtIdr(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export default function PaymentProofPage() {
  const { token } = useParams<{ token: string }>();

  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { setError("Token tidak valid."); setLoading(false); return; }
    fetch(`/api/payment-proof/${token}`)
      .then(async (r) => {
        const d = await r.json() as { ok?: boolean; invoice?: InvoiceInfo; error?: string };
        if (!r.ok || !d.ok) throw new Error(d.error ?? "Link tidak ditemukan.");
        setInvoice(d.invoice!);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Terjadi kesalahan."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setSubmitError("Pilih file terlebih dahulu."); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (remarks.trim()) fd.append("remarks", remarks.trim());
      const r = await fetch(`/api/payment-proof/${token}/upload`, { method: "POST", body: fd });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) throw new Error(d.error ?? "Upload gagal.");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Link Tidak Valid</h1>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted || invoice?.proofUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Bukti Pembayaran Diterima</h1>
          <p className="text-slate-500 text-sm mb-4">
            Terima kasih, <strong>{invoice?.customerName ?? "Customer"}</strong>. Bukti pembayaran Anda telah kami terima dan sedang diverifikasi.
          </p>
          {invoice && (
            <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium">{invoice.invoiceNumber ?? invoice.docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-green-600">{fmtIdr(invoice.grandTotal)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </button>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💳</div>
          <h1 className="text-xl font-bold text-slate-800">Upload Bukti Pembayaran</h1>
          {invoice?.customerName && (
            <p className="text-slate-500 text-sm mt-1">Halo, <strong>{invoice.customerName}</strong></p>
          )}
        </div>

        {/* Invoice info */}
        {invoice && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice</span>
              <span className="font-semibold text-slate-800">{invoice.invoiceNumber ?? invoice.docNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Tagihan</span>
              <span className="font-bold text-blue-700">{fmtIdr(invoice.grandTotal)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-slate-500">Jatuh Tempo</span>
                <span className="text-slate-700">{new Date(invoice.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            )}
          </div>
        )}

        {/* Upload form */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File Bukti Pembayaran <span className="text-red-500">*</span>
            </label>
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div>
                  <p className="text-sm font-medium text-blue-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                  <p className="text-xs text-blue-500 mt-2">Klik untuk ganti file</p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">📎</p>
                  <p className="text-sm text-slate-600 font-medium">Klik untuk pilih file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — maks. 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setSubmitError(null);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan <span className="text-slate-400">(opsional)</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Contoh: Transfer via BCA, 25 Juni 2026"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengunggah...
              </span>
            ) : (
              "Kirim Bukti Pembayaran"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
