import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { isPortalAdmin } from "@/lib/auth";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";

interface EditModeContextValue {
  editMode: boolean;
  toggleEditMode: () => void;
  content: Record<string, string>;
  pendingContent: Record<string, string>;
  updateField: (key: string, value: string) => void;
  saveContent: () => Promise<void>;
  discardChanges: () => void;
  isSaving: boolean;
  isDirty: boolean;
  uploadImage: (file: File) => Promise<string>;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

// Paths that do not need CMS content — skip the portal/content fetch for these
const STANDALONE_PREFIXES = [
  "/vendor-mini-form", "/vendor-form", "/vendor-response", "/vendor-product-approval",
  "/vendor-quote", "/vendor-confirm", "/vendor-fulfillment", "/vendor-job",
  "/approve", "/confirm", "/customer-quote", "/order-task", "/customer-order",
  "/admin-action", "/admin-review", "/order-track", "/fulfillment", "/q/",
  "/privacy-policy", "/contact",
];

function isStandalonePath() {
  const path = window.location.pathname;
  return STANDALONE_PREFIXES.some((p) => path.includes(p));
}

// localStorage cache-first (stale-while-revalidate): CMS content (hero_bg,
// hero_title, ...) previously only appeared after the /api/portal/content
// round-trip resolved, so the first paint always showed the local default
// image/text before swapping to the real one. Seeding state from the last
// known-good cache removes that visible flash/delay on every visit after the
// first; the network fetch below still runs and silently refreshes it.
const contentCacheKey = (locale: string) => `portal_content_cache_${locale}`;

function readContentCache(locale: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(contentCacheKey(locale));
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function writeContentCache(locale: string, data: Record<string, string>) {
  try {
    localStorage.setItem(contentCacheKey(locale), JSON.stringify(data));
  } catch {
    /* ignore quota/serialization errors — cache is best-effort */
  }
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const isAdmin = isPortalAdmin();
  const { locale } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(() => readContentCache(locale) ?? {});
  const [pendingContent, setPendingContent] = useState<Record<string, string>>(() => readContentCache(locale) ?? {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Skip CMS fetch for standalone public pages (mini form, vendor form, etc.)
    if (isStandalonePath()) return;
    // Content is scoped per-locale: an admin-authored override in one language
    // must never leak into another (that was the root cause of the language
    // switcher appearing to do nothing). Refetch whenever the active locale
    // changes so content[] only ever contains values for the current language.
    let cancelled = false;
    // Paint immediately from cache (if any) for this locale, then revalidate.
    const cached = readContentCache(locale);
    if (cached) {
      setContent(cached);
      setPendingContent(cached);
    }
    // no-store: this endpoint is served with a public 5-minute Cache-Control
    // for the public site; an admin who just saved content must see the fresh
    // value immediately, not a stale cached response.
    fetch(`/api/portal/content?locale=${encodeURIComponent(locale)}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) return null; // Don't overwrite cache with error body on 4xx/5xx
        return r.json() as Promise<Record<string, string>>;
      })
      .then((data) => {
        if (!data || cancelled) return;
        setContent(data);
        setPendingContent(data);
        writeContentCache(locale, data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      if (prev) setPendingContent(content);
      return !prev;
    });
  }, [content]);

  const updateField = useCallback((key: string, value: string) => {
    setPendingContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isDirty = Object.keys(pendingContent).some(
    (k) => pendingContent[k] !== content[k]
  );

  const saveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      const diff: Record<string, string> = {};
      for (const k of Object.keys(pendingContent)) {
        if (pendingContent[k] !== content[k]) diff[k] = pendingContent[k];
      }
      if (Object.keys(diff).length === 0) return;
      const res = await fetch(`/api/portal/admin/content?locale=${encodeURIComponent(locale)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(diff),
      });
      if (!res.ok) throw new Error(`Gagal menyimpan konten (${res.status})`);
      setContent((prev) => {
        const next = { ...prev, ...diff };
        // Keep the local cache in sync with what was just saved — otherwise a
        // reload of this tab, or opening a new tab, paints from the old
        // cached snapshot until the network revalidation overwrites it,
        // making a just-saved image/text look like it "reverted".
        writeContentCache(locale, next);
        return next;
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, pendingContent, locale]);

  const discardChanges = useCallback(() => {
    setPendingContent(content);
  }, [content]);

  // ── Dynamic favicon update ──────────────────────────────────────────────
  useEffect(() => {
    const faviconUrl = content["site_favicon"];
    if (!faviconUrl) return;
    const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]'];
    selectors.forEach((sel) => {
      const el = document.querySelector<HTMLLinkElement>(sel);
         if (el) {
         el.href = faviconUrl.startsWith("http")
           ? faviconUrl
           : (resolveImageUrl(faviconUrl) ?? faviconUrl);
      }
    });
  }, [content]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/portal/admin/upload", {
      method: "POST",
      credentials: "include", // no Content-Type — browser sets multipart boundary automatically
      body: formData,
    });
    if (!resp.ok) throw new Error("Gagal mengunggah gambar");
    const { url } = await resp.json() as { url: string };
    return url;
  }, []);

  return (
    <EditModeContext.Provider value={{
      editMode: editMode && isAdmin,
      toggleEditMode,
      content: pendingContent,
      pendingContent,
      updateField,
      saveContent,
      discardChanges,
      isSaving,
      isDirty,
      uploadImage,
      isAdmin,
    }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used inside EditModeProvider");
  return ctx;
}
