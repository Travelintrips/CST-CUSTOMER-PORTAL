import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const IC = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

interface Props {
  instructions: string;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  readOnly?: boolean;
  accentColor?: string;
}

export function TemplateInstructionRenderer({
  instructions,
  notes,
  onNotesChange,
  readOnly,
  accentColor = "indigo",
}: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  if (!instructions) return null;

  const ringColor = accentColor === "emerald" ? "focus:ring-emerald-400" : accentColor === "violet" ? "focus:ring-violet-400" : "focus:ring-indigo-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t("tmpl.packaging", "📦 Handling & Packaging Instructions")}
        </h2>
        <span className="text-slate-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">
            {instructions}
          </div>
          {!readOnly && onNotesChange && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("tmpl.packagingNotes", "Catatan Packaging (opsional)")}
              </label>
              <textarea
                value={notes ?? ""}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder={t("tmpl.packagingNotesPh", "Instruksi khusus packaging...")}
                rows={2}
                className={`${IC.replace("focus:ring-indigo-400", ringColor)} resize-none`}
              />
            </div>
          )}
          {readOnly && notes && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
              <span className="font-medium text-slate-700">{t("tmpl.packagingLabel", "Catatan:")} </span>
              {notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
