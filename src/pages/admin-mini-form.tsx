import { useState, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import type { ProductTemplate, DynamicFormValues } from "@shared/product-templates";
import {
  TemplateFieldRenderer,
  TemplateDocumentRenderer,
  TemplateChecklistRenderer,
  TemplateInstructionRenderer,
} from "@/components/template";

type FieldDef = {
  key: string; label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  options?: string[]; required?: boolean; placeholder?: string;
  section?: "quotation" | "operational" | "both";
};

type ServiceSchema = { label: string; emoji: string; fields: FieldDef[] };

type FormMeta = {
  id: number; serviceType: string; title: string | null; notes: string | null;
  vendorName: string | null; vendorPhone: string | null; vendorContactPerson: string | null;
  schema: ServiceSchema | null; mode: string; orderId: number | null;
  orderNumber: string | null; orderItemId: number | null; phase: string | null;
  alreadySubmitted?: boolean;
  productTemplate?: ProductTemplate | null;
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className ?? ""}`} />;
}

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" /><Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg mt-2" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-3.5 w-28" />
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-40" /><Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
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

function SuccessState({ orderNumber }: { orderNumber?: string | null }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Data Berhasil Dicatat!</h2>
        {orderNumber && <p className="text-xs text-slate-400 mb-2">Ref: {orderNumber}</p>}
        <p className="text-sm text-slate-500">
          Data Anda telah berhasil diterima dan dicatat oleh sistem.
        </p>
      </div>
    </div>
  );
}

function AlreadySubmittedState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Data Sudah Dikirim</h2>
        <p className="text-sm text-slate-500">
          Data melalui link ini sudah pernah dikirim sebelumnya.
        </p>
      </div>
    </div>
  );
}

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

const INPUT_CLS = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";

export default function AdminMiniFormPage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState<Record<string, string>>({});
  const [staffName, setStaffName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [templateValues, setTemplateValues] = useState<DynamicFormValues>({
    customFieldValues: {},
    uploadedDocuments: [],
    checklistStatus: {},
    packagingNotes: "",
    conditionalFlags: {},
  });

  useEffect(() => {
    if (!token) { setError("Token tidak ditemukan"); setLoading(false); return; }
    const ctrl = new AbortController();
    fetch(`/api/admin-form/${token}`, { signal: ctrl.signal })
      .then(async (r) => {
        const data = await r.json() as FormMeta & { error?: string };
        if (!r.ok) throw new Error(data.error ?? "Terjadi kesalahan");
        setMeta(data);
        if (data.vendorName) setStaffName(data.vendorName);
        if (data.vendorPhone) setContactPhone(data.vendorPhone);
        if (data.vendorContactPerson) setContactPerson(data.vendorContactPerson);
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
      .filter(f => f.required && !values[f.key]?.trim())
      .map(f => f.label);
    if (missing.length) { setSubmitError(`Field wajib belum diisi: ${missing.join(", ")}`); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: Record<string, unknown> = {
        vendorName: staffName.trim() || null,
        contactPerson: contactPerson.trim() || null,
        contactPhone: contactPhone.trim() || null,
        formData: {
          ...values,
          ...templateValues.customFieldValues,
          ...Object.fromEntries(templateValues.uploadedDocuments.map((d) => [`_doc_${d.key}`, d.reference])),
          ...Object.fromEntries(Object.entries(templateValues.checklistStatus).map(([k, v]) => [`_chk_${k}`, v])),
          ...(templateValues.packagingNotes ? { _packagingNotes: templateValues.packagingNotes } : {}),
        },
      };
      const res = await fetch(`/api/admin-form/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  if (loading) return <FormSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (submitted) return <SuccessState orderNumber={meta?.orderNumber} />;
  if (meta?.alreadySubmitted) return <AlreadySubmittedState />;

  if (!meta?.schema) {
    return <ErrorState message="Form tidak tersedia untuk link ini." />;
  }

  const { schema } = meta;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">{schema.emoji}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {meta.title ?? schema.label}
              </h1>
              {meta.vendorName && <p className="text-sm text-slate-500">Untuk: {meta.vendorName}</p>}
              {meta.orderNumber && (
                <p className="text-xs text-violet-600 font-medium mt-0.5">📋 Ref: {meta.orderNumber}</p>
              )}
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg">
            <span>🔐</span> Form Internal — hanya untuk penggunaan staf
          </div>
          {meta.notes && (
            <p className="mt-3 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 whitespace-pre-line">
              {meta.notes}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Data Pengisi</h2>
            <div className="space-y-4">
              <FormField label="Nama Lengkap" required>
                <input type="text" value={staffName} onChange={e => setStaffName(e.target.value)}
                  required placeholder="Nama Anda" className={INPUT_CLS} />
              </FormField>
              <FormField label="Jabatan / Divisi">
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)}
                  placeholder="Contoh: Staff Operasional, Manager Logistik" className={INPUT_CLS} />
              </FormField>
              <FormField label="Nomor HP / WhatsApp">
                <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  placeholder="Contoh: 0812xxxx" className={INPUT_CLS} />
              </FormField>
            </div>
          </div>

          {/* Dynamic fields */}
          {schema.fields.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                {schema.emoji} {schema.label}
              </h2>
              <div className="space-y-4">
                {schema.fields.map(field => (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    {field.type === "select" ? (
                      <select
                        value={values[field.key] ?? ""} onChange={e => handleChange(field.key, e.target.value)}
                        required={field.required}
                        className={`${INPUT_CLS} bg-white`}
                      >
                        <option value="">— Pilih —</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={values[field.key] ?? ""} onChange={e => handleChange(field.key, e.target.value)}
                        required={field.required} placeholder={field.placeholder} rows={3}
                        className={`${INPUT_CLS} resize-none`}
                      />
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        value={values[field.key] ?? ""} onChange={e => handleChange(field.key, e.target.value)}
                        required={field.required} placeholder={field.placeholder ?? ""} className={INPUT_CLS}
                      />
                    )}
                  </FormField>
                ))}
              </div>
            </div>
          )}

          {meta.productTemplate && (
            <>
              <TemplateFieldRenderer
                template={meta.productTemplate}
                values={templateValues}
                onChange={setTemplateValues}
                accentColor="violet"
              />
              <TemplateDocumentRenderer
                documents={meta.productTemplate.requiredDocuments}
                values={templateValues.uploadedDocuments}
                onChange={(docs) => setTemplateValues((v) => ({ ...v, uploadedDocuments: docs }))}
                accentColor="violet"
              />
              <TemplateChecklistRenderer
                checklist={meta.productTemplate.checklist}
                values={templateValues.checklistStatus}
                onChange={(key, checked) => setTemplateValues((v) => ({ ...v, checklistStatus: { ...v.checklistStatus, [key]: checked } }))}
                accentColor="violet"
              />
              <TemplateInstructionRenderer
                instructions={meta.productTemplate.packagingInstructions}
                notes={templateValues.packagingNotes}
                onNotesChange={(notes) => setTemplateValues((v) => ({ ...v, packagingNotes: notes }))}
                accentColor="violet"
              />
            </>
          )}

          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {submitError}
            </div>
          )}

          <button
            type="submit" disabled={submitting}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white font-semibold py-3.5 text-sm transition-colors active:scale-95"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </span>
            ) : "✉️ Kirim Data"}
          </button>

          <p className="text-center text-xs text-slate-400 pb-6">
            Form internal — data dicatat untuk keperluan operasional.
          </p>
        </form>
      </div>
    </div>
  );
}
