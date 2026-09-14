import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import TokenErrorPage, { httpStatusToTokenErrorType, type TokenErrorType } from "@/components/TokenErrorPage";

type LineItem = {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
};

type TemplateField = {
  key: string;
  label: string;
  type?: string;
  unit?: string;
  options?: string[];
};

type ServiceField = {
  key?: string;
  label: string;
  type?: string;
  unit?: string;
  isInternal?: boolean;
  isUpload?: boolean;
};

type TemplateSnapshot = {
  name?: string;
  categoryKey?: string;
  templateKind?: string;
  customFields?: TemplateField[];
  fields?: ServiceField[];
  quotationFields?: ServiceField[];
  [key: string]: unknown;
};

type InvoiceData = {
  token: string;
  orderNumber: string | null;
  invoiceNumber: string | null;
  customerName: string | null;
  currency: string | null;
  subtotal: number | null;
  taxRate: number;
  taxAmount: number | null;
  grandTotal: number | null;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string | null;
  dueDate: string | null;
  notes: string | null;
  lineItems: LineItem[];
  acknowledgedAt: string | null;
  status: string;
  categoryKey?: string | null;
  templateId?: string | null;
  templateVersion?: string | null;
  templateSnapshot?: TemplateSnapshot | null;
};

const INTERNAL_KEYS = new Set([
  "priceBase", "vendorCost", "margin", "basicPrice", "internalCost",
  "markup", "profit", "sellingPrice", "vendorPrice", "costPrice",
  "marginPct", "markupPct", "profitMarginPct", "hargaDasar", "hargaJual",
]);

function formatFieldValue(v: unknown, unit?: string): string | null {
  if (v === null || v === undefined || v === "" || v === "-") return null;
  if (Array.isArray(v)) {
    const j = (v as unknown[]).filter(Boolean).map(String).join(", ");
    return j || null;
  }
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  const s = String(v).trim();
  if (!s || s === "-") return null;
  if (s.startsWith("http") || s.startsWith("/upload") || s.startsWith("/replit") || s.startsWith("blob:")) return null;
  return unit ? `${s} ${unit}` : s;
}

function SnapSummary({ snap }: { snap: TemplateSnapshot }) {
  const isService = snap.templateKind === "service";
  const productFields: TemplateField[] = (!isService && snap.customFields) ? snap.customFields : [];
  const serviceFields: ServiceField[] = isService
    ? [...(snap.quotationFields ?? snap.fields ?? [])].filter(f => !f.isInternal && !f.isUpload)
    : [];

  const productRows = productFields
    .filter(f => !INTERNAL_KEYS.has(f.key))
    .slice(0, 6);

  const serviceRows = serviceFields
    .filter(f => f.key && !INTERNAL_KEYS.has(f.key!))
    .slice(0, 6);

  if (!snap.name && productRows.length === 0 && serviceRows.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📦</span>
        <div>
          {snap.name && (
            <p className="text-sm font-semibold text-indigo-800">{snap.name}</p>
          )}
          <p className="text-xs text-indigo-400 uppercase tracking-wide">
            {isService ? "Layanan" : "Produk"}
          </p>
        </div>
      </div>
      {(productRows.length > 0 || serviceRows.length > 0) && (
        <div className="space-y-1.5">
          {productRows.map((f, i) => (
            <div key={i} className="flex justify-between text-xs gap-3">
              <span className="text-indigo-600 flex-shrink-0">
                {f.label}{f.unit ? ` (${f.unit})` : ""}
              </span>
              <span className="text-indigo-400 italic text-right">—</span>
            </div>
          ))}
          {serviceRows.map((f, i) => (
            <div key={i} className="flex justify-between text-xs gap-3">
              <span className="text-indigo-600 flex-shrink-0">
                {f.label}{f.unit ? ` (${f.unit})` : ""}
              </span>
              <span className="text-indigo-400 italic text-right">—</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Link Tidak Valid</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

const fmtNum = (n: number | null | undefined, cur: string | null) => {
  if (n == null) return "—";
  return `${cur ?? "IDR"} ${Math.round(n).toLocaleString("id-ID")}`;
};

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const PAYMENT_STATUS: Record<string, { text: string; color: string }> = {
  unpaid:  { text: "Belum Dibayar", color: "bg-red-50 border-red-200 text-red-700" },
  partial: { text: "Dibayar Sebagian", color: "bg-amber-50 border-amber-200 text-amber-700" },
  paid:    { text: "Lunas", color: "bg-green-50 border-green-200 text-green-700" },
};

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.428a.5.5 0 00.623.607l5.684-1.49A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.724.976.996-3.632-.234-.373A9.818 9.818 0 1112 21.818z"/>
    </svg>
  );
}

function buildWaPaymentLink(data: InvoiceData): string {
  const inv = data.invoiceNumber ? `No. Invoice: *${data.invoiceNumber}*` : "";
  const ord = data.orderNumber ? `No. Order: *${data.orderNumber}*` : "";
  const total = data.grandTotal != null
    ? `Total: *${data.currency ?? "IDR"} ${Math.round(data.grandTotal).toLocaleString("id-ID")}*`
    : "";
  const paid = data.amountPaid > 0
    ? `Sudah Dibayar: *${data.currency ?? "IDR"} ${Math.round(data.amountPaid).toLocaleString("id-ID")}*`
    : "";
  const remaining = data.grandTotal != null && data.amountPaid > 0
    ? `Sisa: *${data.currency ?? "IDR"} ${Math.round(Math.max(0, data.grandTotal - data.amountPaid)).toLocaleString("id-ID")}*`
    : "";
  const lines = [inv, ord, total, paid, remaining].filter(Boolean).join("\n");
  const msg = `📄 *Konfirmasi Pembayaran Invoice*\n\n${lines}\n\nSaya telah melakukan pembayaran. Mohon dikonfirmasi. Terima kasih.`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export default function CustomerInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenErrorType, setTokenErrorType] = useState<TokenErrorType | null>(null);
  const [acking, setAcking] = useState(false);
  const [ackDone, setAckDone] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setTokenErrorType("not_found"); setLoading(false); return; }
    const ctrl = new AbortController();
    fetch(`/api/vendor-form/customer-invoice/${token}`, { signal: ctrl.signal })
      .then(async r => {
        const d = await r.json() as InvoiceData & { error?: string };
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
        if (d.acknowledgedAt) setAckDone(true);
      })
      .catch((e: Error) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [token]);

  const handleAck = async () => {
    setAcking(true);
    setAckError(null);
    try {
      const res = await fetch(`/api/vendor-form/customer-invoice/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(d.error ?? "Gagal konfirmasi");
      setAckDone(true);
    } catch (e: unknown) {
      setAckError((e as Error).message);
    } finally {
      setAcking(false);
    }
  };

  if (loading) return <Spinner />;
  if (tokenErrorType) return <TokenErrorPage type={tokenErrorType} message={error} />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="Invoice tidak ditemukan" />;

  const statusInfo = PAYMENT_STATUS[data.paymentStatus] ?? { text: data.paymentStatus, color: "bg-slate-50 border-slate-200 text-slate-700" };
  const remaining = (data.grandTotal ?? 0) - (data.amountPaid ?? 0);
  const isLate = data.dueDate && new Date(data.dueDate) < new Date() && data.paymentStatus !== "paid";
  const tSnap = data.templateSnapshot ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Invoice Pembayaran</h1>
              {data.invoiceNumber && (
                <p className="text-sm font-mono text-blue-600 font-semibold">{data.invoiceNumber}</p>
              )}
            </div>
          </div>
          {data.customerName && (
            <p className="text-sm text-slate-600">Kepada: <span className="font-medium">{data.customerName}</span></p>
          )}
          {data.orderNumber && (
            <p className="text-xs text-slate-400 mt-0.5">No. Order: <span className="font-mono">{data.orderNumber}</span></p>
          )}
        </div>

        {/* Status pembayaran */}
        <div className={`rounded-2xl border px-5 py-3.5 flex items-center justify-between ${statusInfo.color}`}>
          <span className="font-semibold text-sm">{statusInfo.text}</span>
          {isLate && (
            <span className="text-xs font-medium bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
              Melewati Jatuh Tempo
            </span>
          )}
        </div>

        {/* Ringkasan produk/layanan dari templateSnapshot (backward-compatible) */}
        {tSnap && <SnapSummary snap={tSnap} />}

        {/* Rincian item */}
        {data.lineItems && data.lineItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Rincian Tagihan</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-2 text-xs font-semibold text-slate-500">Deskripsi</th>
                    <th className="text-center py-2 px-1 text-xs font-semibold text-slate-500">Qty</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500">Harga Satuan</th>
                    <th className="text-right py-2 pl-2 text-xs font-semibold text-slate-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2.5 pr-2 text-slate-800 font-medium">{item.description}</td>
                      <td className="py-2.5 px-1 text-center text-slate-600">{item.qty} {item.unit || ""}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">{fmtNum(item.unitPrice, data.currency)}</td>
                      <td className="py-2.5 pl-2 text-right font-semibold text-slate-800">{fmtNum(item.subtotal, data.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ringkasan total */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              {data.subtotal != null && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal (belum PPN)</span>
                  <span>{fmtNum(data.subtotal, data.currency)}</span>
                </div>
              )}
              {data.taxAmount != null && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>PPN {data.taxRate}% <span className="text-xs text-slate-400">(nominal)</span></span>
                  <span>{fmtNum(data.taxAmount, data.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-blue-700 pt-1.5 border-t border-slate-200">
                <span>Total (sudah termasuk PPN)</span>
                <span>{fmtNum(data.grandTotal, data.currency)}</span>
              </div>
              {data.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Sudah Dibayar</span>
                    <span>— {fmtNum(data.amountPaid, data.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-red-600 pt-1 border-t border-slate-200">
                    <span>Sisa Tagihan</span>
                    <span>{fmtNum(remaining, data.currency)}</span>
                  </div>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-blue-500 font-medium">* Harga di atas adalah HARGA JUAL (sudah termasuk PPN {data.taxRate}%)</p>
          </div>
        )}

        {/* Jika tidak ada line items, tampilkan ringkasan saja */}
        {(!data.lineItems || data.lineItems.length === 0) && data.grandTotal != null && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Total Tagihan</p>
            <div className="space-y-1.5">
              {data.subtotal != null && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal (belum PPN)</span>
                  <span>{fmtNum(data.subtotal, data.currency)}</span>
                </div>
              )}
              {data.taxAmount != null && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>PPN {data.taxRate}%</span>
                  <span>{fmtNum(data.taxAmount, data.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-blue-700 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{fmtNum(data.grandTotal, data.currency)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-500 font-medium">* Sudah termasuk PPN {data.taxRate}%</p>
          </div>
        )}

        {/* Info pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informasi Pembayaran</p>
          {data.dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Jatuh Tempo</span>
              <span className={`font-medium ${isLate ? "text-red-600" : "text-slate-800"}`}>{fmtDate(data.dueDate)}</span>
            </div>
          )}
          {data.paymentMethod && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Metode Pembayaran</span>
              <span className="font-medium text-slate-800">{data.paymentMethod}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className={`font-semibold ${data.paymentStatus === "paid" ? "text-green-600" : data.paymentStatus === "partial" ? "text-amber-600" : "text-red-600"}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Catatan */}
        {data.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Catatan</p>
            <p className="text-sm text-amber-900 whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        {/* Tombol konfirmasi pembayaran via WA — tampil jika belum lunas */}
        {data.paymentStatus !== "paid" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">💳 Konfirmasi Pembayaran via WhatsApp</p>
            <p className="text-xs text-slate-400 mb-4">
              Setelah melakukan pembayaran, kirimkan konfirmasi ke tim kami via WhatsApp agar segera diproses.
            </p>
            <a
              href={buildWaPaymentLink(data)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-3.5 text-sm transition-colors"
            >
              <WaIcon />
              Kirim Konfirmasi Pembayaran via WhatsApp
            </a>
          </div>
        )}

        {/* Konfirmasi penerimaan invoice */}
        {!ackDone ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-700 mb-1">✉️ Konfirmasi Penerimaan Invoice</p>
            <p className="text-xs text-slate-400 mb-4">
              Klik tombol di bawah untuk mengkonfirmasi bahwa Anda telah menerima dan memeriksa invoice ini.
              Admin akan mendapat notifikasi otomatis.
            </p>
            {ackError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{ackError}</p>
            )}
            <button
              onClick={handleAck}
              disabled={acking}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3.5 text-sm transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              {acking ? (
                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Memproses...</>
              ) : (
                <>✅ Saya Sudah Menerima Invoice Ini</>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-green-700">Invoice Dikonfirmasi</p>
            <p className="text-xs text-green-500 mt-1">
              {data.acknowledgedAt
                ? `Dikonfirmasi pada ${fmtDate(data.acknowledgedAt)}`
                : "Invoice telah Anda konfirmasi."}
            </p>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Hubungi tim kami jika ada pertanyaan mengenai invoice ini.
        </p>
      </div>
    </div>
  );
}
