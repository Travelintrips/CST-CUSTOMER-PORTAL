import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "wouter";

type FieldDef = {
  key: string; label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  options?: string[]; required?: boolean; placeholder?: string;
  isUpload?: boolean;
};

type ConfMeta = {
  token: string;
  orderNumber: string | null;
  vendorName: string | null;
  serviceType: string;
  instruction: string | null;
  status: string;
  schema: { label: string; emoji: string; fields: FieldDef[] } | null;
};

function Spinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

function SuccessState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Data Operasional Terkirim!</h2>
        <p className="text-sm text-slate-500">
          Terima kasih! Data operasional Anda telah kami terima. Tim kami akan memproses lebih lanjut.
        </p>
      </div>
    </div>
  );
}

function AlreadySubmitted() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Sudah Dikirim</h2>
        <p className="text-sm text-slate-500">Data operasional sudah pernah dikirim sebelumnya.</p>
      </div>
    </div>
  );
}

const INPUT_CLS = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const UPLOAD_KEYS = new Set(["foto_barang", "packing_list_doc", "invoice_vendor_doc", "pod_doc"]);

const UPLOAD_LABELS: Record<string, string> = {
  foto_barang: "📷 Foto Barang",
  packing_list_doc: "📄 Packing List",
  invoice_vendor_doc: "🧾 Invoice Vendor",
  pod_doc: "✅ Proof of Delivery",
};

function UploadField({ fieldKey, token, value, onChange }: {
  fieldKey: string;
  token: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/vendor-form/upload/${token}`, { method: "POST", body: fd });
      const data = await res.json() as { objectPath?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload gagal");
      onChange(data.objectPath ?? "");
    } catch (e: unknown) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-green-700 flex-1 truncate font-medium">File terupload</span>
          <button
            type="button"
            onClick={() => { onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
          >Hapus</button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 px-4 py-3 text-sm text-slate-500 hover:text-indigo-600 transition-colors text-center"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Mengupload...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Klik untuk upload file
            </span>
          )}
        </button>
      )}
      {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

export default function OpConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<ConfMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError("Token tidak ditemukan"); setLoading(false); return; }
    const ctrl = new AbortController();
    fetch(`/api/vendor-form/op-confirm/${token}`, { signal: ctrl.signal })
      .then(async r => {
        const data = await r.json() as ConfMeta & { error?: string };
        if (!r.ok) throw new Error(data.error ?? "Terjadi kesalahan");
        setMeta(data);
      })
      .catch((e: Error) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [token]);

  const handleChange = useCallback((key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta?.schema) return;

    const missing = meta.schema.fields
      .filter(f => f.required && !UPLOAD_KEYS.has(f.key) && !values[f.key]?.trim())
      .map(f => f.label);
    if (missing.length) { setSubmitError(`Field wajib: ${missing.join(", ")}`); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/vendor-form/op-confirm/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: values }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim data");
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (submitted) return <SuccessState />;
  if (!meta) return <ErrorState message="Link tidak ditemukan" />;
  if (meta.status === "submitted") return <AlreadySubmitted />;

  const { schema } = meta;

  // Pisahkan upload fields dari regular fields
  const regularFields = schema?.fields.filter(f => !f.isUpload && !UPLOAD_KEYS.has(f.key)) ?? [];
  const uploadFields = schema?.fields.filter(f => f.isUpload || UPLOAD_KEYS.has(f.key)) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{schema?.emoji ?? "🚚"}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Data Operasional</h1>
              {meta.vendorName && <p className="text-sm text-slate-500">Vendor: {meta.vendorName}</p>}
              {meta.orderNumber && <p className="text-xs text-slate-400">Order: {meta.orderNumber}</p>}
            </div>
          </div>
          {meta.instruction && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
              <span className="font-medium block mb-1 text-xs text-amber-700 uppercase tracking-wide">Instruksi Admin</span>
              {meta.instruction}
            </div>
          )}
        </div>

        {!schema?.fields.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-400 text-sm">
            Tidak ada field operasional yang perlu diisi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Regular fields */}
            {regularFields.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  {schema!.emoji} Detail Operasional {schema!.label}
                </h2>
                <div className="space-y-4">
                  {regularFields.map(field => (
                    <FormField key={field.key} label={field.label} required={field.required}>
                      {field.type === "select" ? (
                        <select
                          value={values[field.key] ?? ""}
                          onChange={e => handleChange(field.key, e.target.value)}
                          required={field.required}
                          className={`${INPUT_CLS} bg-white`}
                        >
                          <option value="">— Pilih —</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={values[field.key] ?? ""}
                          onChange={e => handleChange(field.key, e.target.value)}
                          required={field.required}
                          placeholder={field.placeholder}
                          rows={3}
                          className={`${INPUT_CLS} resize-none`}
                        />
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          value={values[field.key] ?? ""}
                          onChange={e => handleChange(field.key, e.target.value)}
                          required={field.required}
                          placeholder={field.placeholder ?? ""}
                          className={INPUT_CLS}
                        />
                      )}
                    </FormField>
                  ))}
                </div>
              </div>
            )}

            {/* Upload dokumen */}
            {uploadFields.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">📎 Upload Dokumen</h2>
                <p className="text-xs text-slate-400 mb-4">PDF, gambar, atau dokumen Office (maks. 10 MB per file)</p>
                <div className="space-y-4">
                  {uploadFields.map(field => (
                    <FormField key={field.key} label={UPLOAD_LABELS[field.key] ?? field.label} required={field.required}>
                      <UploadField
                        fieldKey={field.key}
                        token={token ?? ""}
                        value={values[field.key] ?? ""}
                        onChange={val => handleChange(field.key, val)}
                      />
                    </FormField>
                  ))}
                </div>
              </div>
            )}

            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{submitError}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 text-sm transition-colors active:scale-95"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mengirim...
                </span>
              ) : "Kirim Data Operasional"}
            </button>
            <p className="text-center text-xs text-slate-400 pb-4">
              Data ini akan digunakan untuk koordinasi operasional order Anda.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
