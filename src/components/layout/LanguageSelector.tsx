import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";


const LANGUAGES = [
  { code: "id-ID", flag: "🇮🇩", language: "Bahasa Indonesia", country: "Indonesia", label: "ID" },
  { code: "en-US", flag: "🇺🇸", language: "English", country: "United States", label: "EN" },
  { code: "en-GB", flag: "🇬🇧", language: "English", country: "United Kingdom", label: "EN" },
  { code: "ms-MY", flag: "🇲🇾", language: "Bahasa Melayu", country: "Malaysia", label: "MY" },
  { code: "en-SG", flag: "🇸🇬", language: "English", country: "Singapore", label: "SG" },
  { code: "zh-CN", flag: "🇨🇳", language: "中文（简体）", country: "China", label: "CN" },
  { code: "zh-TW", flag: "🇹🇼", language: "中文（繁體）", country: "Taiwan", label: "TW" },
  { code: "ja-JP", flag: "🇯🇵", language: "日本語", country: "Japan", label: "JP" },
  { code: "ko-KR", flag: "🇰🇷", language: "한국어", country: "South Korea", label: "KR" },
  { code: "de-DE", flag: "🇩🇪", language: "Deutsch", country: "Germany", label: "DE" },
  { code: "fr-FR", flag: "🇫🇷", language: "Français", country: "France", label: "FR" },
  { code: "nl-NL", flag: "🇳🇱", language: "Nederlands", country: "Netherlands", label: "NL" },
  { code: "es-ES", flag: "🇪🇸", language: "Español", country: "Spain", label: "ES" },
  { code: "it-IT", flag: "🇮🇹", language: "Italiano", country: "Italy", label: "IT" },
  { code: "hi-IN", flag: "🇮🇳", language: "हिन्दी", country: "India", label: "HI" },
  { code: "ar-AE", flag: "🇦🇪", language: "العربية", country: "UAE", label: "AR" },
  { code: "ar-SA", flag: "🇸🇦", language: "العربية", country: "Saudi Arabia", label: "AR" },
  { code: "en-AU", flag: "🇦🇺", language: "English", country: "Australia", label: "AU" },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { locale, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  function selectLocale(code: string) {
    setLanguage(code);
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-[14px] px-2.5 py-[7px] text-[13px] font-medium transition-all duration-200 select-none ${
          open
            ? "bg-slate-100 text-slate-900"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("langSelector.ariaLabel", "Select language")}
        title={current.language}
      >
        <Globe className="h-[15px] w-[15px] shrink-0" />
        {!compact && (
          <span className="font-semibold tracking-wide text-[12px]">
            {current.label}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl overflow-hidden"
          role="listbox"
          aria-label={t("langSelector.ariaLabel", "Select language")}
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
          }}
        >
          <div className="max-h-72 overflow-y-auto py-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={locale === lang.code}
                onClick={() => selectLocale(lang.code)}
                className={`flex w-full items-center gap-3 px-3.5 py-2 text-left text-[13px] transition-colors ${
                  locale === lang.code
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-base leading-none shrink-0">{lang.flag}</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-[12px] leading-tight">{lang.language}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{lang.country}</span>
                </div>
                {locale === lang.code && (
                  <Check className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
