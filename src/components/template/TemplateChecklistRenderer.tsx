import type { ChecklistItem } from "@shared/product-templates";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  checklist: ChecklistItem[];
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
  readOnly?: boolean;
  accentColor?: string;
}

export function TemplateChecklistRenderer({ checklist, values, onChange, readOnly, accentColor = "indigo" }: Props) {
  const { t } = useLanguage();
  if (!checklist.length) return null;

  const checkColor =
    accentColor === "emerald"
      ? "accent-emerald-600"
      : accentColor === "violet"
      ? "accent-violet-600"
      : "accent-indigo-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">{t("tmpl.checklist", "✅ Checklist Persiapan")}</h2>
      <div className="space-y-3">
        {checklist.map((item) => {
          const checked = values[item.key] ?? false;
          return (
            <label key={item.key} className={`flex items-center gap-3 ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !readOnly && onChange(item.key, e.target.checked)}
                disabled={readOnly}
                className={`w-4 h-4 rounded border-slate-300 ${checkColor} focus:ring-2`}
              />
              <span className={`text-sm ${checked ? "text-slate-700" : "text-slate-600"}`}>
                {item.label}
              </span>
              {readOnly && (
                <span className={`ml-auto text-xs font-medium ${checked ? "text-emerald-600" : "text-slate-400"}`}>
                  {checked ? "✓" : "—"}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {!readOnly && (
        <p className="text-xs text-slate-400 mt-3">
          {t("tmpl.checkAllDone", "Centang semua item yang sudah selesai dipersiapkan.")}
        </p>
      )}
    </div>
  );
}
