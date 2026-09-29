// Build-time i18n validator.
// Reads locale FILES directly (src/i18n/locales/*.ts), not the inline TRANSLATIONS
// object in translations.ts — that object only contains id-ID and en-US eagerly.
// Fails the process (non-zero exit) if any locale has missing keys,
// extra/duplicate keys, or empty values compared to the id-ID baseline.
// Run via `pnpm run validate:i18n` or as part of `build`.

import { transformSync, buildSync } from "esbuild";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");
const translationsPath = path.join(__dirname, "..", "src", "i18n", "translations.ts");
const require = createRequire(import.meta.url);

let src = readFileSync(translationsPath, "utf8");

// Strip type-only imports (not needed at runtime).
src = src.replace(/^import type .+$/gm, "");
src = src.replace(/^export type \{[^}]*\} from .+$/gm, "");

// Replace static relative imports with empty object stubs.
// e.g. `import idID from "./locales/id-ID"` → `const idID = {};`
src = src.replace(/^import\s+(\w+)\s+from\s+["']\.\/locales\/[^"']+["']\s*;?\s*$/gm, "const $1 = {};");

// Replace dynamic relative imports (in loadLocale switch) with no-op stubs.
src = src.replace(/import\(["']\.\/locales\/[^"']+["']\)/g, "Promise.resolve({ default: {} })");

const { code } = transformSync(src, { loader: "ts", format: "esm" });

const dataUrl = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const mod = await import(dataUrl);
const { TRANSLATIONS, SUPPORTED_LOCALES } = mod;
/** Load a locale .ts file via esbuild → tmp CJS → require */
function loadLocale(fname) {
  const entry = path.join(localesDir, fname);
  const result = buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0]?.text;
  if (!code) throw new Error(`Failed to compile locale ${fname}`);
  const tmpFile = `/tmp/vt_${fname.replace(".ts", ".cjs")}`;
  require("fs").writeFileSync(tmpFile, code);
  delete require.cache[require.resolve(tmpFile)];
  const mod = require(tmpFile);
  return mod.default ?? mod;
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const k of Object.keys(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

// Discover locale files (skip types.ts)
const localeFiles = readdirSync(localesDir)
  .filter((f) => f.endsWith(".ts") && f !== "types.ts")
  .sort();

const locales = localeFiles.map((f) => f.replace(".ts", ""));

// Also read SUPPORTED_LOCALES from translations.ts to ensure parity
const transSrc = readFileSync(
  path.join(__dirname, "..", "src", "i18n", "translations.ts"),
  "utf8"
);
const supportedMatch = transSrc.match(/SUPPORTED_LOCALES[^=]*=\s*\[([^\]]+)\]/s);
const supportedLocales = supportedMatch
  ? supportedMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) ?? []
  : [];

let hasError = false;
const errors = [];
const report = [];

// 1. Every SUPPORTED_LOCALE must have a locale file
for (const locale of supportedLocales) {
  if (!locales.includes(locale)) {
    errors.push(`SUPPORTED_LOCALES includes "${locale}" but src/i18n/locales/${locale}.ts does not exist`);
    hasError = true;
  }
}
// Every locale file must be in SUPPORTED_LOCALES
for (const locale of locales) {
  if (supportedLocales.length > 0 && !supportedLocales.includes(locale)) {
    errors.push(`src/i18n/locales/${locale}.ts exists but is not listed in SUPPORTED_LOCALES`);
    hasError = true;
  }
}

// 2. Load baseline (id-ID)
const baselineObj = loadLocale("id-ID.ts");
const baseline = flatten(baselineObj);
const baseKeys = Object.keys(baseline);

// 3. Check each locale against baseline
for (const locale of locales) {
  if (locale === "id-ID") {
    report.push(`[id-ID] ${baseKeys.length} keys (baseline)`);
    continue;
  }

  const flat = flatten(loadLocale(`${locale}.ts`));
  const keys = Object.keys(flat);
  const keySet = new Set(keys);

  // Missing keys vs baseline
  const missing = baseKeys.filter((k) => !keySet.has(k));
  if (missing.length) {
    hasError = true;
    errors.push(
      `[${locale}] missing ${missing.length} key(s): ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? ", ..." : ""}`
    );
  }

  // Extra keys not in baseline
  const extra = keys.filter((k) => !new Set(baseKeys).has(k));
  if (extra.length) {
    hasError = true;
    errors.push(
      `[${locale}] has ${extra.length} extra key(s) not in id-ID baseline: ${extra.slice(0, 10).join(", ")}${extra.length > 10 ? ", ..." : ""}`
    );
  }

  // Empty / null / undefined values
  const empty = Object.entries(flat).filter(([, v]) => v === "" || v === null || v === undefined);
  if (empty.length) {
    hasError = true;
    errors.push(
      `[${locale}] has ${empty.length} empty value(s): ${empty.map(([k]) => k).slice(0, 10).join(", ")}`
    );
  }

  // Note: duplicate values (non-fatal)
  const byValue = {};
  for (const [k, v] of Object.entries(flat)) {
    if (typeof v !== "string" || v.length < 4) continue;
    (byValue[v] ??= []).push(k);
  }
  const suspiciousDuplicates = Object.entries(byValue).filter(([, ks]) => ks.length >= 4);
  if (suspiciousDuplicates.length) {
    report.push(`[${locale}] note: ${suspiciousDuplicates.length} value(s) reused 4+ times (review, not fatal)`);
  }

  report.push(`[${locale}] ${keys.length} keys OK`);
}


const repoRoot = path.join(__dirname, "..");
const criticalPages = [
  "src/pages/mkt-po-detail.tsx",
  "src/pages/mkt-rfq-detail.tsx",
  "src/pages/product-order-track.tsx",
  "src/pages/shipment-timeline.tsx",
  "src/pages/customer-invoice.tsx",
  "src/pages/air-freight-track.tsx",
];

for (const rel of criticalPages) {
  const page = readFileSync(path.join(repoRoot, rel), "utf8");
  if (!page.includes("useLanguage")) {
    errors.push(`[${rel}] critical customer page is not connected to LanguageContext`);
    hasError = true;
  }
  const fixedLocale = /(?:toLocaleString|toLocaleDateString|Intl\.NumberFormat)\(\s*["']id-ID["']/;
  if (fixedLocale.test(page)) {
    errors.push(`[${rel}] still hardcodes id-ID formatting instead of the selected locale`);
    hasError = true;
  }
  if (/\}\s*<(?:p|span|CardTitle|Button)>/.test(page)) {
    errors.push(`[${rel}] contains suspicious localized JSX closing markup`);
    hasError = true;
  }
}

const languageContext = readFileSync(path.join(repoRoot, "src/i18n/LanguageContext.tsx"), "utf8");
if (!languageContext.includes("SUPPORTED_LOCALES.includes(code as SupportedLocale)")) {
  errors.push("[LanguageContext] setLanguage must reject unsupported locale codes");
  hasError = true;
}
if (!languageContext.includes("translateLegacyNode")) {
  errors.push("[LanguageContext] legacy exact-match translation bridge is missing");
  hasError = true;
}

const indonesianLeakageMarkers = [
  "{n} item dengan harga",
  "klik bar untuk detail item",
  "Perbandingan Harga Vendor",
];
for (const locale of locales) {
  if (locale === "id-ID") continue;
  const source = readFileSync(path.join(localesDir, `${locale}.ts`), "utf8");
  for (const marker of indonesianLeakageMarkers) {
    if (source.includes(marker)) {
      errors.push(`[${locale}] Indonesian leakage remains: ${marker}`);
      hasError = true;
    }
  }
}

console.log("=== i18n validation report ===");
for (const line of report) console.log(line);

if (hasError) {
  console.error("\n=== i18n validation FAILED ===");
  for (const err of errors) console.error("  - " + err);
  process.exit(1);
}

console.log("\n=== i18n validation PASSED — all locales match id-ID baseline ===");
