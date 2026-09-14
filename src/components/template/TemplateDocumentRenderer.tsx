import type { RequiredDocument, UploadedDocumentRef } from "@shared/product-templates";
import { useLanguage } from "@/i18n/LanguageContext";

const IC = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-500";

interface Props {
  documents: RequiredDocument[];
  values: UploadedDocumentRef[];
  onChange: (docs: UploadedDocumentRef[]) => void;
  readOnly?: boolean;
  accentColor?: string;
}

export function TemplateDocumentRenderer({ documents, values, onChange, readOnly, accentColor = "indigo" }: Props) {
  const { t } = useLanguage();
  if (!documents.length) return null;

  function getRef(key: string) {
    return values.find((d) => d.key === key)?.reference ?? "";
  }

  function setRef(key: string, label: string, reference: string) {
    const docs = values.filter((d) => d.key !== key);
    if (reference.trim()) docs.push({ key, label, reference: reference.trim() });
    onChange(docs);
  }

  const ringColor = accentColor === "emerald" ? "focus:ring-emerald-400" : accentColor === "violet" ? "focus:ring-violet-400" : "focus:ring-indigo-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{t("tmpl.requiredDocs", "📄 Dokumen Wajib")}</h2>
      <p className="text-xs text-slate-400 mb-4">{t("tmpl.requiredDocsHint", "Masukkan nomor/referensi dokumen. Dokumen asli diserahkan saat pengiriman.")}</p>
      <div className="space-y-4">
        {documents.map((doc) => {
          const ref = getRef(doc.key);
          return (
            <div key={doc.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {doc.label}
                {doc.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {readOnly ? (
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 min-h-[36px]">
                  {ref || <span className="text-slate-400 italic">{t("tmpl.notFilled", "Tidak diisi")}</span>}
                </div>
              ) : (
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => setRef(doc.key, doc.label, e.target.value)}
                  placeholder={t("tmpl.docRefPh", "No. / Referensi dokumen...")}
                  required={doc.required}
                  className={IC.replace("focus:ring-indigo-400", ringColor)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
