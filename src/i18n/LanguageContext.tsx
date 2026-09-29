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



function flattenStrings(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[full] = value;
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenStrings(value as Record<string, unknown>, full, out);
    }
  }
  return out;
}

const legacyTextSource = new WeakMap<Text, string>();
const legacyAttrSource = new WeakMap<Element, Map<string, string>>();

const LEGACY_LITERAL_KEY_ALIASES: Record<string, string> = {
  "Daftar sebagai": "registerPage.roleLabel",
  "Membeli atau meminta layanan": "registerPage.roleCustomerDesc",
  "Menawarkan jasa atau produk": "registerPage.roleVendorDesc",
  "Tipe customer": "onboarding.accountType.title",
  "Tipe Customer": "onboarding.accountType.title",
  "Pilih metode registrasi": "registerPage.title",
  "Belum tersedia": "dashboard.notProvided",
  "Kode OTP dikirim ke": "registerPage.otpSentTo",
  "Ganti email / kirim ulang": "registerPage.resendOtp",
  "Minimal 8 karakter": "login.password",
  "Memuat perusahaan…": "common.loading",
  "Perusahaan tidak ditemukan.": "tracking.notFound",
  "Pilih dari daftar": "common.confirm",
  "Nama perusahaan": "onboarding.vendor.companyName",
  "Cari perusahaan canonical": "navbar.searchPlaceholder",
  "Perusahaan saya belum terdaftar": "dashboard.notProvided",
  "Simpan pilihan": "common.save",
  "Memuat konteks customer…": "common.loading",
  "Produk Terkait": "products.title",
  "Menerjemahkan…": "common.loading",
  "Penyedia": "mktVendorQuote.vendorLabel",
  "Tambah Alamat Pengantaran": "productOrder.trucking.deliveryAddress",
  "Urutan Rute Pengantaran": "tracking.route",
  "Optimalkan": "trucking.toastRouteOptimized",
  "Lihat Status & Pembayaran": "portalInvoice.title",
  "Riwayat Lokasi Driver": "logisticTrack.pageTitle",
  "Lihat Gambar": "tracking.clickToView",
  "Buka Original": "tracking.clickToView",
  "Diverifikasi": "customerApproval.approvalApproved",
  "Dokumen Operasional": "portalDokumen.logisticDocsTitle",
  "Buka": "portalDokumen.detailBtn",
  "Tidak ada dokumen operasional yang cocok dengan pencarian.": "portalDokumen.noMatchDocs",
  "Belum ada dokumen operasional": "portalDokumen.emptyTitle",
  "Detail invoice": "portalInvoice.title",
  "Total invoice": "paymentProof.totalBill",
  "Sudah dibayar": "tracking.paymentReceived",
  "Sisa pembayaran": "portalInvoice.totalUnpaid",
  "Riwayat payment": "portalInvoice.subtitle",
  "Perbarui": "common.retry",
  "Memuat timeline...": "common.loading",
  "Status Order": "productOrderTrack.status",
  "Tracking Driver": "logisticTrack.pageTitle",
  "Pilih mode pengiriman": "productOrder.serviceCatalog.title",
  "Sisa Tagihan": "portalInvoice.totalUnpaid",
  "Nominal pembayaran kali ini": "paymentProof.totalBill",
  "Lanjutkan Pembayaran Paylabs": "paymentProof.payNow",
  "Metode Paylabs": "productOrder.payment.gateway.label",
  "Baca Nominal Bukti": "onboarding.ocr.reading",
  "Membaca nominal dari bukti pembayaran…": "common.loading",
  "Konfirmasi penerimaan barang": "common.confirm",
  "Lihat POD": "tracking.clickToView",
  "Coba Lagi": "common.retry",
  "Grand Total": "mktVendorPo.grandTotal",
  "Total Tagihan": "paymentProof.totalBill",
};

function buildLegacyLiteralMap(dict: Record<string, unknown>) {
  const current = flattenStrings(dict);
  const sources = [
    getCachedLocale("id-ID") as Record<string, unknown> | undefined,
    getCachedLocale("en-US") as Record<string, unknown> | undefined,
  ].filter(Boolean) as Record<string, unknown>[];

  const map = new Map<string, string>();
  for (const source of sources) {
    const flat = flattenStrings(source);
    for (const [key, sourceValue] of Object.entries(flat)) {
      const target = current[key];
      if (!target || !sourceValue) continue;
      const normalized = sourceValue.trim();
      if (normalized.length < 2) continue;
      if (!map.has(normalized)) map.set(normalized, target);
    }
  }

  for (const [literal, key] of Object.entries(LEGACY_LITERAL_KEY_ALIASES)) {
    const target = resolve(dict, key.split("."));
    if (target) map.set(literal, target);
  }
  return map;
}

function translateLegacyNode(root: Node, literalMap: Map<string, string>) {
  const skip = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"]);

  const translateText = (node: Text) => {
    const parent = node.parentElement;
    if (!parent || skip.has(parent.tagName)) return;
    const original = legacyTextSource.get(node) ?? node.nodeValue ?? "";
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = literalMap.get(trimmed);
    if (!translated) {
      if (legacyTextSource.has(node) && node.nodeValue !== original) node.nodeValue = original;
      return;
    }
    if (!legacyTextSource.has(node)) legacyTextSource.set(node, original);
    const next = original.replace(trimmed, translated);
    if (node.nodeValue !== next) node.nodeValue = next;
  };

  const translateElement = (el: Element) => {
    if (skip.has(el.tagName)) return;
    const attrs = ["placeholder", "title", "aria-label"];
    let stored = legacyAttrSource.get(el);
    for (const attr of attrs) {
      if (!el.hasAttribute(attr)) continue;
      const currentValue = el.getAttribute(attr) ?? "";
      const original = stored?.get(attr) ?? currentValue;
      const translated = literalMap.get(original.trim());
      if (!translated) {
        if (stored?.has(attr) && currentValue !== original) el.setAttribute(attr, original);
        continue;
      }
      if (!stored) {
        stored = new Map<string, string>();
        legacyAttrSource.set(el, stored);
      }
      if (!stored.has(attr)) stored.set(attr, original);
      if (currentValue !== translated) el.setAttribute(attr, translated);
    }
  };

  if (root.nodeType === Node.TEXT_NODE) translateText(root as Text);
  if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateText(node as Text);
    else translateElement(node as Element);
    node = walker.nextNode();
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
    const next = SUPPORTED_LOCALES.includes(code as SupportedLocale) ? code : "id-ID";
    setLocaleState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    applyDocumentLocale(next);
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


  // Transitional bridge for legacy UI literals. It translates only exact strings
  // that already exist in the canonical locale dictionaries, so dynamic business
  // data (names, order numbers, addresses, amounts) is left untouched.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const literalMap = buildLegacyLiteralMap(dict);
    translateLegacyNode(document.body, literalMap);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateLegacyNode(mutation.target, literalMap);
          continue;
        }
        if (mutation.type === "attributes") {
          translateLegacyNode(mutation.target, literalMap);
          continue;
        }
        mutation.addedNodes.forEach((node) => translateLegacyNode(node, literalMap));
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });
    return () => observer.disconnect();
  }, [dict, locale]);

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
