import type { ProductTemplate, DynamicFormValues } from "@shared/product-templates";
import { isFieldVisible } from "@shared/product-templates";
import { useLanguage } from "@/i18n/LanguageContext";

const IC = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-500";

interface Props {
  template: ProductTemplate;
  values: DynamicFormValues;
  onChange: (next: DynamicFormValues) => void;
  readOnly?: boolean;
  accentColor?: string;
}

export function TemplateFieldRenderer({ template, values, onChange, readOnly, accentColor = "indigo" }: Props) {
  const { t } = useLanguage();
  const customFields = template?.customFields ?? [];
  if (!customFields.length) return null;

  function setField(key: string, val: string | number | boolean) {
    const next: DynamicFormValues = {
      ...values,
      customFieldValues: { ...values.customFieldValues, [key]: val },
    };
    if (val !== "" && val !== null && val !== undefined) {
      next.conditionalFlags = { ...next.conditionalFlags, [key]: val };
    }
    onChange(next);
  }

  const ringColor = accentColor === "emerald" ? "focus:ring-emerald-400" : accentColor === "violet" ? "focus:ring-violet-400" : "focus:ring-indigo-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
        {"📦 "}{t("tmpl.specLabel", "Spesifikasi")} {template.label}
      </h2>
      <div className="space-y-4">
        {customFields.map((field) => {
          if (!isFieldVisible(field.key, template, values)) return null;
          const strVal = String(values.customFieldValues[field.key] ?? "");
          const cls = IC.replace("focus:ring-indigo-400", ringColor);
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
                {field.unit && <span className="text-slate-400 ml-1">({field.unit})</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={strVal}
                  onChange={(e) => setField(field.key, e.target.value)}
                  required={field.required && !readOnly}
                  disabled={readOnly}
                  className={`${cls} bg-white`}
                >
                  <option value="">{t("tmpl.selectOption", "— Pilih —")}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={strVal}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required && !readOnly}
                  disabled={readOnly}
                  rows={3}
                  className={`${cls} resize-none`}
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={strVal}
                  onChange={(e) =>
                    setField(
                      field.key,
                      field.type === "number"
                        ? e.target.value === "" ? "" : Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  placeholder={field.placeholder}
                  required={field.required && !readOnly}
                  disabled={readOnly}
                  className={cls}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
