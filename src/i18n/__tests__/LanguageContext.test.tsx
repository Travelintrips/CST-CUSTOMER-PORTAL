import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../LanguageContext";

function setNavigatorLanguage(lang: string) {
  Object.defineProperty(window.navigator, "language", {
    value: lang,
    configurable: true,
  });
}

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = "";
    document.documentElement.lang = "";
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("persists the selected language to localStorage under app_language", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => {
      result.current.setLanguage("ja-JP");
    });
    expect(localStorage.getItem("app_language")).toBe("ja-JP");
    expect(result.current.locale).toBe("ja-JP");
  });

  it("activates RTL direction for ar-AE / ar-SA and LTR otherwise", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => {
      result.current.setLanguage("ar-AE");
    });
    expect(document.documentElement.dir).toBe("rtl");

    act(() => {
      result.current.setLanguage("en-US");
    });
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("falls back to id-ID when an unsupported/invalid locale is requested", () => {
    setNavigatorLanguage("xx-ZZ");
    localStorage.setItem("app_language", "not-a-real-locale");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    // getInitialLocale ignores the stored value because it isn't in SUPPORTED_LOCALES,
    // and navigator.language ("xx-ZZ") has no match either, so it must default to id-ID.
    expect(result.current.locale).toBe("id-ID");
  });

  it("resolves nested translation keys via t()", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    act(() => {
      result.current.setLanguage("en-US");
    });
    expect(result.current.t("nav.home")).not.toBe("nav.home");
  });

  it("falls back to the raw key (or provided fallback) for a nonexistent key", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.t("does.not.exist")).toBe("does.not.exist");
    expect(result.current.t("does.not.exist", "Fallback Text")).toBe("Fallback Text");
  });
});
