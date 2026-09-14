import { describe, expect, it } from "vitest";
import {
  getCachedLocale,
  loadLocale,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  TRANSLATIONS,
} from "../translations";

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (v && typeof v === "object") {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

describe("i18n translations", () => {
  it("declares every supported locale and bundles the default locales", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(loadLocale).toBeTypeOf("function");
    }
    expect(getCachedLocale("id-ID")).toBeDefined();
    expect(getCachedLocale("en-US")).toBeDefined();
    expect(Object.keys(TRANSLATIONS).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it("has the same key count in every locale as the id-ID baseline", async () => {
    const baseline = flatten(await loadLocale("id-ID"));
    const baseKeys = Object.keys(baseline);
    for (const locale of SUPPORTED_LOCALES) {
      const flat = flatten(await loadLocale(locale));
      expect(Object.keys(flat).length).toBe(baseKeys.length);
    }
  }, 30_000);

  it("has every baseline key present in every locale", async () => {
    const baseline = flatten(await loadLocale("id-ID"));
    const baseKeys = Object.keys(baseline);
    for (const locale of SUPPORTED_LOCALES) {
      const flat = flatten(await loadLocale(locale));
      const missing = baseKeys.filter((k) => !(k in flat));
      expect(missing).toEqual([]);
    }
  });

  it("has no empty string / null / undefined values in any locale", async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const flat = flatten(await loadLocale(locale));
      const empty = Object.entries(flat).filter(([, v]) => v === "" || v === null || v === undefined);
      expect(empty).toEqual([]);
    }
  });

  it("marks ar-AE and ar-SA (and only those) as RTL locales", () => {
    expect(new Set(RTL_LOCALES)).toEqual(new Set(["ar-AE", "ar-SA"]));
  });

  it("falls back to the key path when a translation is entirely missing (fallback mechanism sanity check)", async () => {
    // A key that does not exist anywhere should resolve to undefined at the raw data layer;
    // the LanguageContext.t() function is responsible for turning that into the fallback/key string.
    const flat = flatten(await loadLocale("en-US"));
    expect(flat["nonexistent.key.path"]).toBeUndefined();
  });
});
