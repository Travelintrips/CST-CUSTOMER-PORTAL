/**
 * sync-locales.cjs
 * Syncs all locale files against the id-ID baseline:
 *  - Missing keys → filled with en-US fallback value
 *  - Extra keys   → removed
 * Run: node scripts/sync-locales.cjs [--dry-run]
 */

const { transformSync } = require("esbuild");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");
const LOCALES_DIR = path.join(__dirname, "..", "src", "i18n", "locales");

const ALL_LOCALES = [
  "id-ID","en-US","en-GB","en-AU","en-SG",
  "zh-CN","zh-TW","ja-JP","ko-KR","ms-MY",
  "de-DE","fr-FR","nl-NL","es-ES","it-IT",
  "hi-IN","ar-AE","ar-SA",
];
const SKIP_LOCALES = new Set(["id-ID", "en-US"]); // These are manually maintained

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadLocale(fname) {
  const src = readFileSync(path.join(LOCALES_DIR, fname), "utf8");
  const { code } = transformSync(src, { loader: "ts", format: "cjs" });
  const tmpFile = `/tmp/sync_locale_${fname.replace(".ts", ".cjs")}`;
  writeFileSync(tmpFile, code);
  delete require.cache[require.resolve(tmpFile)];
  const mod = require(tmpFile);
  return mod.default || mod;
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

function unflatten(flat) {
  const out = {};
  for (const [dotKey, val] of Object.entries(flat)) {
    const parts = dotKey.split(".");
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in cur)) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  return out;
}

/** Serialize a nested JS object to TypeScript source (pretty-printed). */
function serializeTS(obj, indent = 2) {
  const pad = (n) => " ".repeat(n);
  function serialize(val, depth) {
    if (typeof val === "string") {
      // Escape backticks and ${ sequences; use single quotes for simplicity
      const escaped = val
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
      return `'${escaped}'`;
    }
    if (Array.isArray(val)) {
      return JSON.stringify(val);
    }
    if (val && typeof val === "object") {
      const entries = Object.entries(val);
      if (entries.length === 0) return "{}";
      const inner = entries
        .map(([k, v]) => {
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
          return `${pad(depth + indent)}${safeKey}: ${serialize(v, depth + indent)}`;
        })
        .join(",\n");
      return `{\n${inner},\n${pad(depth)}}`;
    }
    return JSON.stringify(val);
  }
  return serialize(obj, 0);
}

function buildLocaleFile(localeCode, nestedObj) {
  return `// @refresh reset
import type { DeepRecord } from "./types";

const locale: DeepRecord = ${serializeTS(nestedObj, 2)};

export default locale;
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log("Loading baselines…");
const idIDObj = loadLocale("id-ID.ts");
const enUSObj  = loadLocale("en-US.ts");
const flatID   = flatten(idIDObj);
const flatEN   = flatten(enUSObj);
const baseKeys = Object.keys(flatID);
console.log(`  id-ID baseline: ${baseKeys.length} keys`);

let totalAdded = 0;
let totalRemoved = 0;

for (const locale of ALL_LOCALES) {
  if (SKIP_LOCALES.has(locale)) continue;

  const fname = `${locale}.ts`;
  const existingObj = loadLocale(fname);
  const flatExisting = flatten(existingObj);
  const existingKeySet = new Set(Object.keys(flatExisting));
  const baseKeySet = new Set(baseKeys);

  const missing = baseKeys.filter((k) => !existingKeySet.has(k));
  const extra   = Object.keys(flatExisting).filter((k) => !baseKeySet.has(k));

  if (missing.length === 0 && extra.length === 0) {
    console.log(`  [${locale}] OK — no changes needed`);
    continue;
  }

  // Build new flat map: start with baseline keys, fill from existing then en-US
  const newFlat = {};
  for (const key of baseKeys) {
    if (existingKeySet.has(key)) {
      newFlat[key] = flatExisting[key];
    } else {
      // Use en-US fallback, then id-ID as last resort
      newFlat[key] = flatEN[key] ?? flatID[key];
    }
  }

  totalAdded   += missing.length;
  totalRemoved += extra.length;

  const newNested = unflatten(newFlat);
  const newContent = buildLocaleFile(locale, newNested);

  if (DRY_RUN) {
    console.log(`  [${locale}] DRY-RUN: would add ${missing.length}, remove ${extra.length}`);
    if (missing.length) console.log(`    first missing: ${missing.slice(0, 5).join(", ")}`);
    if (extra.length)   console.log(`    first extra:   ${extra.slice(0, 5).join(", ")}`);
  } else {
    writeFileSync(path.join(LOCALES_DIR, fname), newContent, "utf8");
    console.log(`  [${locale}] updated: +${missing.length} added, -${extra.length} removed`);
  }
}

console.log(`\nDone. Total: +${totalAdded} added, -${totalRemoved} removed across all locales.`);
if (DRY_RUN) console.log("(dry-run — no files written)");
