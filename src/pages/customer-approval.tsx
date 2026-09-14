import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import TokenErrorPage, { httpStatusToTokenErrorType, type TokenErrorType } from "@/components/TokenErrorPage";
import { useLanguage } from "@/i18n/LanguageContext";

type OfferItem = { label: string; value: string };

type PriceItem = {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
};

type TemplateField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  unit?: string;
};

type ServiceField = {
  key?: string;
  label: string;
  type?: string;
  required?: boolean;
  unit?: string;
  isUpload?: boolean;
  isInternal?: boolean;
};

type TemplateSnapshot = {
  name?: string;
  categoryKey?: string;
  templateKind?: string;
  customFields?: TemplateField[];
  fields?: ServiceField[];
  quotationFields?: ServiceField[];
  operationalFields?: ServiceField[];
  requiredDocuments?: string[];
  checklist?: string[];
  [key: string]: unknown;
};

type ApprovalMeta = {
  token: string;
  orderNumber: string | null;
  customerName: string | null;
  offerSummary: Record<string, unknown> | OfferItem[] | null;
  sellingPrice: string | null;
  currency: string | null;
  termsNotes: string | null;
  status: string;
  soNumber: string | null;
  priceItems?: PriceItem[] | null;
  subtotal?: number | null;
  taxRate?: number | null;
  taxAmount?: number | null;
  grandTotal?: number | null;
  categoryKey?: string | null;
  templateId?: string | null;
  templateVersion?: string | null;
  templateSnapshot?: TemplateSnapshot | null;
  requiredDocuments?: string[] | null;
  checklist?: string[] | null;
  vendorFormData?: Record<string, unknown> | null;
};

const INTERNAL_FIELD_KEYS = new Set([
  "priceBase", "vendorCost", "margin", "basicPrice", "internalCost",
  "markup", "profit", "sellingPrice", "vendorPrice", "costPrice",
  "marginPct", "markupPct", "profitMarginPct", "hargaDasar", "hargaJual",
]);

function formatSpecValue(v: unknown, unit?: string): string | null {
  if (v === null || v === undefined || v === "" || v === "-" || v === "—") return null;
  if (Array.isArray(v)) {
    const joined = (v as unknown[]).filter(Boolean).map(String).join(", ");
    return joined || null;
  }
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  const str = String(v).trim();
  if (!str || str === "-" || str === "—") return null;
  if (str.startsWith("http") || str.startsWith("/upload") || str.startsWith("/replit") || str.startsWith("blob:")) {
    return "Dokumen terunggah ✓";
  }
  return unit ? `${str} ${unit}` : str;
}

function getSpecValue(
  fieldKey: string,
  unit: string | undefined,
  offerSummary: Record<string, unknown> | null,
  vendorFormData: Record<string, unknown> | null,
): string | null {
  if (INTERNAL_FIELD_KEYS.has(fieldKey)) return null;

  const specs = offerSummary?.specifications;
  if (specs && typeof specs === "object" && !Array.isArray(specs)) {
    const v = (specs as Record<string, unknown>)[fieldKey];
    const r = formatSpecValue(v, unit);
    if (r) return r;
  }

  const pspecs = offerSummary?.productSpecifications;
  if (pspecs && typeof pspecs === "object" && !Array.isArray(pspecs)) {
    const v = (pspecs as Record<string, unknown>)[fieldKey];
    const r = formatSpecValue(v, unit);
    if (r) return r;
  }

  if (offerSummary) {
    const v = offerSummary[fieldKey];
    const r = formatSpecValue(v, unit);
    if (r) return r;
  }

  const cfv = vendorFormData?.customFieldValues;
  if (cfv && typeof cfv === "object" && !Array.isArray(cfv)) {
    const v = (cfv as Record<string, unknown>)[fieldKey];
    const r = formatSpecValue(v, unit);
    if (r) return r;
  }

  if (vendorFormData) {
    const v = vendorFormData[fieldKey];
    const r = formatSpecValue(v, unit);
    if (r) return r;
  }

  return null;
}

const fmt = (n: string | number | null, cur: string | null) => {
  if (n === null || n === undefined || n === "") return "—";
  return `${cur ?? "IDR"} ${Number(n).toLocaleString("id-ID")}`;
};

const fmtNum = (n: number, cur: string | null) =>
  `${cur ?? "IDR"} ${n.toLocaleString("id-ID")}`;

export default function CustomerApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [meta, setMeta] = useState<ApprovalMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenErrorType, setTokenErrorType] = useState<TokenErrorType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ action: "approved" | "rejected"; soNumber?: string | null } | null>(null);
  const [notes, setNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!token) { setError(t("customerApproval.tokenNotFound", "Token tidak ditemukan")); setLoading(false); return; }
    const ctrl = new AbortController();
    fetch(`/api/vendor-form/customer-approval/${token}`, { signal: ctrl.signal })
      .then(async r => {
        const data = await r.json() as ApprovalMeta & { error?: string };
        if (!r.ok) {
          if ([404, 409, 410, 403].includes(r.status)) {
            setTokenErrorType(httpStatusToTokenErrorType(r.status));
            setError(data.error ?? null);
          } else {
            setError(data.error ?? t("customerApproval.tokenNotFound", "Terjadi kesalahan"));
          }
          return;
        }
        setMeta(data);
      })
      .catch((e: Error) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [token]);

  const handleAction = async (action: "approve" | "reject") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendor-form/customer-approval/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes.trim() || undefined }),
      });
      const data = await res.json() as { success?: boolean; error?: string; status?: string; soNumber?: string };
      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error ?? t("customerApproval.alreadyResponded", "Sudah direspons"));
          return;
        }
        throw new Error(data.error ?? t("customerApproval.submitting", "Gagal mengirim respons"));
      }
      setDone({ action: action === "approve" ? "approved" : "rejected", soNumber: data.soNumber });
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (done) {
    const isApproved = done.action === "approved";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isApproved ? "bg-green-100" : "bg-orange-100"}`}>
            {isApproved ? (
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isApproved ? t("customerApproval.approvedTitle", "Penawaran Disetujui!") : t("customerApproval.rejectedTitle", "Penawaran Ditolak")}
          </h2>
          {isApproved && done.soNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 my-4">
              <p className="text-xs text-green-600 font-medium">{t("customerApproval.approvedSoCreated", "Sales Order Dibuat")}</p>
              <p className="text-lg font-bold text-green-700 font-mono">{done.soNumber}</p>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-2">
            {isApproved
              ? t("customerApproval.approvedDesc", "Terima kasih! Tim kami akan segera memproses order Anda dan menghubungi Anda lebih lanjut.")
              : t("customerApproval.rejectedDesc", "Kami telah mencatat penolakan Anda. Tim kami akan segera menghubungi Anda untuk mendiskusikan opsi lain.")}
          </p>
        </div>
      </div>
    );
  }

  if (tokenErrorType) return <TokenErrorPage type={tokenErrorType} message={error} />;

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("customerApproval.linkInvalid", "Link Tidak Valid")}</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    </div>
  );

  if (!meta) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("customerApproval.offerNotFound", "Penawaran tidak ditemukan")}</h2>
      </div>
    </div>
  );

  if (meta.status !== "pending") {
    const isApproved = meta.status === "approved";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("customerApproval.alreadyRespondedTitle", "Sudah Direspons")}</h2>
          <p className="text-sm text-slate-500">
            {t("customerApproval.alreadyRespondedDesc", "Penawaran ini sudah")}{" "}
            {isApproved ? t("customerApproval.alreadyApproved", "disetujui") : t("customerApproval.alreadyRejected", "ditolak")}{" "}
            {t("customerApproval.alreadyRespondedSuffix", "sebelumnya.")}
          </p>
          {meta.soNumber && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mt-4">
              <p className="text-xs text-green-600">{t("customerApproval.salesOrderLabel", "Sales Order")}</p>
              <p className="font-bold text-green-700 font-mono">{meta.soNumber}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const summary = Array.isArray(meta.offerSummary)
    ? meta.offerSummary as OfferItem[]
    : meta.offerSummary
      ? Object.entries(meta.offerSummary).map(([k, v]) => ({ label: k, value: String(v) }))
      : [];

  const tSnap = meta.templateSnapshot ?? null;
  const requiredDocs = meta.requiredDocuments ?? tSnap?.requiredDocuments ?? [];
  const checklist = meta.checklist ?? tSnap?.checklist ?? [];

  const isServiceTemplate = tSnap?.templateKind === "service";
  const productSpecFields: TemplateField[] = (!isServiceTemplate && tSnap?.customFields) ? tSnap.customFields : [];
  const serviceSpecFields: ServiceField[] = isServiceTemplate
    ? [...(tSnap?.quotationFields ?? tSnap?.fields ?? [])].filter(f => !f.isInternal && !f.isUpload)
    : [];

  const offerSummaryFlat = Array.isArray(meta.offerSummary)
    ? null
    : (meta.offerSummary as Record<string, unknown> | null);
  const vendorFormData = meta.vendorFormData ?? null;

  const productSpecRows = productSpecFields
    .filter(f => !INTERNAL_FIELD_KEYS.has(f.key))
    .map(f => ({ field: f, value: getSpecValue(f.key, f.unit, offerSummaryFlat, vendorFormData) }))
    .filter(r => r.value !== null);

  const serviceSpecRows = serviceSpecFields
    .filter(f => f.key && !INTERNAL_FIELD_KEYS.has(f.key!))
    .map(f => ({ field: f, value: getSpecValue(f.key!, f.unit, offerSummaryFlat, vendorFormData) }))
    .filter(r => r.value !== null);

  const hasSpecRows = productSpecRows.length > 0 || serviceSpecRows.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📄</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{t("customerApproval.headerTitle", "Konfirmasi Penawaran")}</h1>
              {meta.orderNumber && <p className="text-sm text-slate-500">{t("customerApproval.orderLabel", "Order:")} {meta.orderNumber}</p>}
            </div>
          </div>
          {meta.customerName && (
            <p className="mt-2 text-sm text-slate-600">{t("customerApproval.forLabel", "Untuk:")} <span className="font-medium">{meta.customerName}</span></p>
          )}
          {tSnap?.name && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1">
              <span className="text-xs font-medium text-indigo-700">📦 {tSnap.name}</span>
              {meta.templateVersion && <span className="text-xs text-indigo-400">v{meta.templateVersion}</span>}
            </div>
          )}
        </div>

        {/* Spesifikasi */}
        {hasSpecRows && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {isServiceTemplate
                ? t("customerApproval.specServiceTitle", "Detail Layanan")
                : t("customerApproval.specProductTitle", "Spesifikasi Produk")}
            </p>
            <div className="space-y-2">
              {productSpecRows.map(({ field, value }, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-slate-50 py-1.5 gap-4">
                  <span className="text-slate-500 flex-shrink-0">
                    {field.label}
                    {field.unit && <span className="text-slate-400 ml-1">({field.unit})</span>}
                  </span>
                  <span className="font-medium text-slate-700 text-right">{value}</span>
                </div>
              ))}
              {serviceSpecRows.map(({ field, value }, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-slate-50 py-1.5 gap-4">
                  <span className="text-slate-500 flex-shrink-0">
                    {field.label}
                    {field.unit && <span className="text-slate-400 ml-1">({field.unit})</span>}
                  </span>
                  <span className="font-medium text-slate-700 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dokumen Wajib */}
        {requiredDocs && requiredDocs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
              {t("customerApproval.requiredDocsTitle", "📋 Dokumen Wajib")}
            </p>
            <ul className="space-y-1.5">
              {requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-0.5 text-amber-500">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-600">
              {t("customerApproval.requiredDocsNote", "Harap siapkan dokumen di atas sebelum pengiriman dilaksanakan.")}
            </p>
          </div>
        )}

        {/* Checklist */}
        {checklist && checklist.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
              {t("customerApproval.checklistTitle", "✅ Checklist")}
            </p>
            <ul className="space-y-1.5">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
                  <span className="mt-0.5 text-blue-400">☐</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rincian harga */}
        {meta.priceItems && meta.priceItems.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              {t("customerApproval.priceBreakdownTitle", "Rincian Harga Jual")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-2 text-xs font-semibold text-slate-500">{t("customerApproval.descCol", "Deskripsi")}</th>
                    <th className="text-center py-2 px-2 text-xs font-semibold text-slate-500">{t("customerApproval.qtyCol", "Qty")}</th>
                    <th className="text-center py-2 px-2 text-xs font-semibold text-slate-500">{t("customerApproval.unitCol", "Sat.")}</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500">{t("customerApproval.unitPriceCol", "Harga Satuan")}</th>
                    <th className="text-right py-2 pl-2 text-xs font-semibold text-slate-500">{t("customerApproval.subtotalCol", "Subtotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.priceItems.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 pr-2 text-slate-800">{item.description}</td>
                      <td className="py-2 px-2 text-center text-slate-600">{item.qty}</td>
                      <td className="py-2 px-2 text-center text-slate-500">{item.unit || "—"}</td>
                      <td className="py-2 px-2 text-right text-slate-700">{fmtNum(item.unitPrice, meta.currency)}</td>
                      <td className="py-2 pl-2 text-right font-medium text-slate-800">{fmtNum(item.subtotal, meta.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t("customerApproval.subtotalLabel", "Subtotal (belum PPN)")}</span>
                <span>{fmtNum(meta.subtotal ?? 0, meta.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>PPN {meta.taxRate ?? 11}% <span className="text-xs text-slate-400">(nominal)</span></span>
                <span>{fmtNum(meta.taxAmount ?? 0, meta.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-indigo-700 pt-1.5 border-t border-slate-200">
                <span>{t("customerApproval.totalLabel", "Total (sudah termasuk PPN)")}</span>
                <span>{fmtNum(meta.grandTotal ?? Number(meta.sellingPrice ?? 0), meta.currency)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-indigo-600 font-medium">
              {t("customerApproval.priceNote", "* Harga di atas adalah HARGA JUAL (sudah termasuk PPN)")} {meta.taxRate ?? 11}%
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t("customerApproval.totalPriceTitle", "Total Harga Jual")}
            </p>
            <p className="text-3xl font-bold text-indigo-700">{fmt(meta.sellingPrice, meta.currency)}</p>
            <PriceBreakdown
              grandTotal={meta.grandTotal ?? (meta.sellingPrice ? Number(meta.sellingPrice) : null)}
              subtotal={meta.subtotal}
              taxRate={meta.taxRate ?? 11}
              taxAmount={meta.taxAmount}
              currency={meta.currency ?? "IDR"}
              grandTotalLabel={t("customerApproval.grandTotalLabel", "Grand Total (termasuk PPN)")}
              className="mt-3"
            />
          </div>
        )}

        {/* Detail penawaran */}
        {summary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {t("customerApproval.offerSummaryTitle", "Ringkasan Layanan")}
            </p>
            <div className="space-y-2">
              {summary.map((item, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-slate-50 py-1.5">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-800 text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        {meta.termsNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
              {t("customerApproval.termsTitle", "Terms & Conditions")}
            </p>
            <p className="text-sm text-amber-900 whitespace-pre-line">{meta.termsNotes}</p>
          </div>
        )}

        {/* Reject form */}
        {showRejectForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <p className="text-sm font-medium text-slate-700">
              {t("customerApproval.rejectReasonLabel", "Alasan Penolakan")} <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-slate-400">
              {t("customerApproval.rejectReasonHint", "Wajib diisi — jelaskan alasan penolakan atau permintaan revisi Anda.")}
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none ${notes.trim() ? "border-slate-200" : "border-red-300 bg-red-50"}`}
              placeholder={t("customerApproval.rejectReasonPh", "Contoh: Harga terlalu tinggi, mohon revisi menjadi Rp X...")}
            />
            {!notes.trim() && (
              <p className="text-xs text-red-500">
                {t("customerApproval.rejectReasonRequired", "⚠️ Alasan penolakan harus diisi sebelum konfirmasi.")}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowRejectForm(false); setNotes(""); }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {t("customerApproval.cancelBtn", "Batal")}
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={submitting || !notes.trim()}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm"
              >
                {submitting ? t("customerApproval.submitting", "Mengirim...") : t("customerApproval.confirmRejectBtn", "Konfirmasi Tolak")}
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showRejectForm && (
          <div className="space-y-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={submitting}
              className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold py-4 text-base transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t("customerApproval.processing", "Memproses...")}</>
              ) : (
                t("customerApproval.approveBtn", "✅ Saya Setuju dengan Penawaran Ini")
              )}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              className="w-full rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium py-3 text-sm transition-colors"
            >
              {t("customerApproval.rejectBtn", "❌ Tolak Penawaran")}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          {t("customerApproval.agreementNote", "Dengan mengklik \"Setuju\", Anda menyetujui penawaran dan syarat yang tertera di atas.")}
        </p>
      </div>
    </div>
  );
}
