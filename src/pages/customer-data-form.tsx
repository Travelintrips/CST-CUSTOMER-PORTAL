import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";

interface DataField {
  key: string;
  label: string;
  value: string | null;
  required: boolean;
  missing: boolean;
}

interface CustomerDataFormData {
  token: string;
  orderNumber: string;
  customerName: string;
  shipmentType: string;
  origin: string;
  destination: string;
  alreadySubmitted: boolean;
  submittedAt: string | null;
  customMessage: string | null;
  missingFields: string[];
  fields: DataField[];
}

export default function CustomerDataFormPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError, error: queryError } = useQuery<CustomerDataFormData>({
    queryKey: ["customer-data-form", token],
    queryFn: async () => {
      const r = await fetch(`/api/customer-data/${encodeURIComponent(token ?? "")}`);
      if (!r.ok) {
        const err = await r.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? t("cdf.invalidLink", "Link tidak valid"));
      }
      return r.json();
    },
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const r = await fetch(`/api/customer-data/${encodeURIComponent(token ?? "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldValues: values }),
      });
      const result = await r.json() as { ok?: boolean; message?: string; error?: string };
      if (!r.ok) throw new Error(result.error ?? t("cdf.saveError", "Gagal menyimpan data"));
      return result;
    },
    onSuccess: () => { setSubmitted(true); setError(null); },
    onError: (e: Error) => setError(e.message),
  });

  const handleChange = (key: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = () => {
    if (!data) return;
    const missing = data.fields.filter((f) => f.required && !fieldValues[f.key] && !f.value);
    if (missing.length > 0) {
      setError(`${t("cdf.missingFields", "Harap isi field wajib:")} ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setError(null);
    submitMutation.mutate(fieldValues);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("cdf.loading", "Memuat form...")}</p>
        </div>
      </div>
    );
  }

  // ─── Error / Expired ───────────────────────────────────────────────────────
  if (isError || !data) {
    const msg = (queryError as Error)?.message ?? t("cdf.invalidOrExpired", "Link tidak valid atau sudah kadaluarsa");
    const isExpired = msg.toLowerCase().includes("kadaluarsa") || msg.toLowerCase().includes("expired");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">{isExpired ? "⏰" : "❌"}</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            {isExpired ? t("cdf.expiredTitle", "Link Sudah Kadaluarsa") : t("cdf.invalidTitle", "Link Tidak Valid")}
          </h2>
          <p className="text-gray-500 text-sm">{msg}</p>
          {isExpired && (
            <p className="text-gray-400 text-xs mt-3">
              {t("cdf.expiredHelp", "Hubungi tim B2B Marketplace and Logistic untuk mendapatkan link baru.")}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Already Submitted ─────────────────────────────────────────────────────
  if (data.alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t("cdf.alreadyReceivedTitle", "Data Sudah Diterima")}</h2>
          <p className="text-gray-500 text-sm mb-4">
            {data.alreadySubmitted && !submitted
              ? `${t("cdf.alreadySubmittedPrefix", "Anda sudah mengisi form ini sebelumnya pada")} ${data.submittedAt ? new Date(data.submittedAt).toLocaleString("id-ID") : t("cdf.pastTime", "waktu lalu")}.`
              : t("cdf.savedDesc", "Data Anda berhasil disimpan. Tim B2B Marketplace and Logistic akan segera memprosesnya.")}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm">
            {t("cdf.thankYou", "Terima kasih! Kami akan menghubungi Anda jika ada informasi lebih lanjut.")}
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────
  const missingFields = data.fields.filter((f) => f.missing || (!f.value && f.required));
  const otherFields = data.fields.filter((f) => !f.missing && (f.value || !f.required));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📋</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t("cdf.pageTitle", "Kelengkapan Data Pengiriman")}</h1>
              <p className="text-sm text-gray-500">B2B Marketplace and Logistic</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cdf.orderNo", "No. Order")}</span>
              <span className="font-mono font-semibold text-gray-800">{data.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cdf.customerLabel", "Customer")}</span>
              <span className="text-gray-800">{data.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cdf.serviceLabel", "Layanan")}</span>
              <span className="text-gray-800">{data.shipmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("cdf.routeLabel", "Rute")}</span>
              <span className="text-gray-800 text-right max-w-[180px]">{data.origin} → {data.destination}</span>
            </div>
          </div>
        </div>

        {/* Custom message */}
        {data.customMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm text-amber-800 font-medium mb-1">📌 {t("cdf.adminNote", "Catatan dari Admin:")}</p>
            <p className="text-sm text-amber-700">{data.customMessage}</p>
          </div>
        )}

        {/* Missing Fields (wajib diisi) */}
        {missingFields.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              {t("cdf.missingFieldsTitle", "Data yang Perlu Dilengkapi")}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {t("cdf.requiredNote", "Field dengan tanda")} <span className="text-red-500">*</span> {t("cdf.requiredNoteSuffix", "wajib diisi")}
            </p>
            <div className="space-y-3">
              {missingFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    value={fieldValues[field.key] ?? field.value ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={`${t("cdf.enterPrefix", "Masukkan")} ${field.label.toLowerCase()}...`}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Data (readonly, can edit) */}
        {otherFields.filter((f) => f.value).length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">{t("cdf.existingDataTitle", "Data yang Sudah Ada")}</h2>
            <p className="text-xs text-gray-500 mb-4">{t("cdf.existingDataNote", "Anda bisa mengubah data ini jika ada kesalahan")}</p>
            <div className="space-y-3">
              {otherFields.filter((f) => f.value).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={fieldValues[field.key] ?? field.value ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl px-4 py-3.5 text-sm transition-colors flex items-center justify-center gap-2 shadow"
        >
          {submitMutation.isPending ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              {t("cdf.saving", "Menyimpan...")}
            </>
          ) : (
            t("cdf.submitBtn", "Kirim Data")
          )}
        </button>

        <div className="text-center text-xs text-gray-400 pb-4">
          {t("cdf.footer", "Powered by B2B Marketplace and Logistic · Data Anda aman dan terenkripsi")}
        </div>
      </div>
    </div>
  );
}
