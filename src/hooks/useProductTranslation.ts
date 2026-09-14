import { useState, useEffect, useCallback, useRef } from "react";

// Map app locale codes → OpenAI translate API lang codes.
// Returns null when no translation is needed (product content is typically English/Indonesian).
function localeToLangCode(locale: string): string | null {
  const l = locale.toLowerCase();
  if (l.startsWith("id")) return null;  // Indonesian — content is often already in ID
  if (l.startsWith("en")) return null;  // English — content is often already in EN
  if (l.startsWith("zh")) return "zh";
  if (l.startsWith("ar")) return "ar";
  if (l.startsWith("ms")) return "ms";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("nl")) return "nl";
  if (l.startsWith("it")) return "it";
  if (l.startsWith("hi")) return "hi";
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("th")) return "th";
  if (l.startsWith("vi")) return "vi";
  return null; // unknown locale → skip
}

async function callTranslate(text: string, targetLang: string): Promise<string> {
  const res = await fetch("/api/ai-translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Translation failed");
  return data.translation as string;
}

async function callTranslateBatch(
  texts: Record<string, string>,
  targetLang: string,
): Promise<Record<string, string>> {
  if (Object.keys(texts).length === 0) return {};
  const res = await fetch("/api/ai-translate/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, targetLang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Batch translation failed");
  return (data.translations ?? {}) as Record<string, string>;
}

interface TranslationState {
  name: string | null;
  description: string | null;
  specValues: Record<string, string> | null;
  isTranslating: boolean;
  isTranslated: boolean;
  error: string | null;
  targetLang: string | null;
}

interface UseProductTranslationResult extends TranslationState {
  retranslate: () => void;
  dismiss: () => void;
}

/**
 * Auto-translates product name + description + spec values when the app locale
 * is not Indonesian or English. Triggers once per item+locale combination.
 */
export function useProductTranslation(
  itemId: number | string | undefined,
  name: string | undefined,
  description: string | undefined,
  locale: string,
  rawSpecValues?: Record<string, unknown>,
): UseProductTranslationResult {
  const [state, setState] = useState<TranslationState>({
    name: null,
    description: null,
    specValues: null,
    isTranslating: false,
    isTranslated: false,
    error: null,
    targetLang: null,
  });

  // Track which item+locale we last translated to avoid duplicate calls
  const lastKeyRef = useRef<string>("");

  const doTranslate = useCallback(
    async (
      itemName: string,
      itemDesc: string | undefined,
      langCode: string,
      specVals?: Record<string, unknown>,
    ) => {
      setState((s) => ({ ...s, isTranslating: true, error: null }));
      try {
        // Build batch of spec values (string values only)
        const specTexts: Record<string, string> = {};
        if (specVals && typeof specVals === "object") {
          for (const [k, v] of Object.entries(specVals)) {
            if (typeof v === "string" && v.trim()) {
              specTexts[k] = v.trim();
            }
          }
        }

        const [translatedName, translatedDesc, translatedSpecBatch] = await Promise.all([
          callTranslate(itemName, langCode),
          itemDesc ? callTranslate(itemDesc, langCode) : Promise.resolve(null),
          Object.keys(specTexts).length > 0
            ? callTranslateBatch(specTexts, langCode)
            : Promise.resolve<Record<string, string>>({}),
        ]);

        setState({
          name: translatedName,
          description: translatedDesc,
          specValues: Object.keys(translatedSpecBatch).length > 0 ? translatedSpecBatch : null,
          isTranslating: false,
          isTranslated: true,
          error: null,
          targetLang: langCode,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          isTranslating: false,
          error: err instanceof Error ? err.message : "Translation failed",
        }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!itemId || !name) return;
    const langCode = localeToLangCode(locale);
    if (!langCode) {
      // Back to Indonesian/English — clear any prior translation
      setState({ name: null, description: null, specValues: null, isTranslating: false, isTranslated: false, error: null, targetLang: null });
      lastKeyRef.current = "";
      return;
    }
    const key = `${itemId}::${langCode}`;
    if (lastKeyRef.current === key) return; // already done
    lastKeyRef.current = key;
    void doTranslate(name, description, langCode, rawSpecValues);
  }, [itemId, name, description, locale, rawSpecValues, doTranslate]);

  const retranslate = useCallback(() => {
    if (!itemId || !name) return;
    const langCode = localeToLangCode(locale);
    if (!langCode) return;
    lastKeyRef.current = ""; // force re-run
    void doTranslate(name, description, langCode, rawSpecValues);
  }, [itemId, name, description, locale, rawSpecValues, doTranslate]);

  const dismiss = useCallback(() => {
    setState({ name: null, description: null, specValues: null, isTranslating: false, isTranslated: false, error: null, targetLang: null });
    lastKeyRef.current = "";
  }, []);

  return { ...state, retranslate, dismiss };
}
