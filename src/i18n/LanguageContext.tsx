// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { SUPPORTED_LOCALES, RTL_LOCALES, loadLocale, getCachedLocale, type SupportedLocale } from "./translations";

const STORAGE_KEY = "app_language";
const CACHE_PREFIX = "trs_cache_v1_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolve(obj: Record<string, unknown>, keys: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Unflatten { "a.b.c": "val" } → { a: { b: { c: "val" } } } */
function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split(".");
    let cur: Record<string, unknown> = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return root;
}

/** Deep merge: base is overridden by overlay where overlay has values */
function deepMerge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    if (v !== undefined && v !== null) {
      if (typeof v === "object" && typeof base[k] === "object" && base[k] !== null) {
        out[k] = deepMerge(base[k] as Record<string, unknown>, v as Record<string, unknown>);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

// ── localStorage cache ────────────────────────────────────────────────────────

function readCache(locale: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${locale}`);
    if (!raw) return null;
    const { data, fetchedAt } = JSON.parse(raw) as { data: Record<string, string>; fetchedAt: number };
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return unflatten(data);
  } catch {
    return null;
  }
}

function writeCache(locale: string, flat: Record<string, string>) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${locale}`,
      JSON.stringify({ data: flat, fetchedAt: Date.now() })
    );
  } catch {}
}

// ── Locale init ───────────────────────────────────────────────────────────────

function getInitialLocale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) return stored;
  } catch {}
  const browser = navigator.language;
  const exact = SUPPORTED_LOCALES.find((l) => l === browser);
  if (exact) return exact;
  const partial = SUPPORTED_LOCALES.find((l) => l.split("-")[0] === browser.split("-")[0]);
  return partial ?? "id-ID";
}

function applyDocumentLocale(locale: string) {
  const isRTL = RTL_LOCALES.includes(locale);
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = locale;
}

/** Build the effective translations object for a locale (sync, uses cache). */
function buildLocaleDict(locale: string, remote?: Record<string, unknown> | null) {
  const bundled = (getCachedLocale(locale) ??
    getCachedLocale("en-US") ??
    getCachedLocale("id-ID") ??
    {}) as Record<string, unknown>;
  if (!remote || Object.keys(remote).length === 0) return bundled;
  return deepMerge(bundled, remote);
}

// ── Fetch from API ────────────────────────────────────────────────────────────

async function fetchRemoteTranslations(locale: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`/api/translations/customer-portal/${encodeURIComponent(locale)}`, {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = await res.json() as Record<string, string>;
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  locale: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(getInitialLocale);
  const [dict, setDict] = useState<Record<string, unknown>>(
    () => buildLocaleDict(getInitialLocale(), readCache(getInitialLocale()))
  );

  // Load locale bundle + remote translations whenever locale changes
  useEffect(() => {
    applyDocumentLocale(locale);
    let cancelled = false;

    const lsCache = readCache(locale);

    // If locale is already in JS bundle cache, apply immediately
    if (getCachedLocale(locale)) {
      setDict(buildLocaleDict(locale, lsCache && Object.keys(lsCache).length > 0 ? lsCache : null));
      if (lsCache && Object.keys(lsCache).length > 0) return; // ls cache fresh, skip API
    }

    // Load bundle + remote in parallel
    Promise.all([
      loadLocale(locale),
      lsCache && Object.keys(lsCache).length > 0
        ? Promise.resolve(null)
        : fetchRemoteTranslations(locale),
    ]).then(([, flat]) => {
      if (cancelled) return;
      if (flat) {
        writeCache(locale, flat);
        setDict(buildLocaleDict(locale, unflatten(flat)));
      } else {
        setDict(buildLocaleDict(locale, lsCache));
      }
    });

    return () => { cancelled = true; };
  }, [locale]);

  const setLanguage = useCallback((code: string) => {
    setLocaleState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
    applyDocumentLocale(code);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");

      // 1. Current locale dict (merged remote + bundled)
      const fromDict = resolve(dict, keys);
      if (fromDict !== undefined) return fromDict;

      // 2. en-US bundled fallback (use _cache locale file, not inline TRANSLATIONS)
      const enDict = getCachedLocale("en-US") as Record<string, unknown> | undefined;
      if (enDict) {
        const fromEn = resolve(enDict, keys);
        if (fromEn !== undefined) return fromEn;
      }

      // 3. id-ID bundled fallback (use _cache locale file, not inline TRANSLATIONS)
      const idDict = getCachedLocale("id-ID") as Record<string, unknown> | undefined;
      if (idDict) {
        const fromId = resolve(idDict, keys);
        if (fromId !== undefined) return fromId;
      }

      return fallback ?? key;
    },
    [dict]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const DEFAULT_CTX: LanguageContextValue = {
  locale: "id-ID",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback ?? key,
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useLanguage] called outside <LanguageProvider> — using defaults");
    }
    return DEFAULT_CTX;
  }
  return ctx;
}
