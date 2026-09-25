#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
const seoConfig = readFileSync(resolve(root, "src/config/seo.ts"), "utf8");
const prerender = readFileSync(resolve(root, "scripts/prerender.mjs"), "utf8");

const locs = [...sitemap.matchAll(/<loc>https:\/\/cstlogistic\.co\.id([^<]*)<\/loc>/g)]
  .map((match) => match[1] || "/");

const unique = new Set(locs);
if (locs.length !== unique.size) {
  throw new Error(`Duplicate sitemap URL detected: ${locs.length} entries, ${unique.size} unique`);
}

const expectedOriginCount = (sitemap.match(/<loc>/g) ?? []).length;
if (expectedOriginCount !== locs.length) {
  throw new Error("Sitemap contains a URL outside https://cstlogistic.co.id");
}

const missingSeo = [];
const missingPrerender = [];

for (const path of locs) {
  const routeKey = JSON.stringify(path);
  if (!seoConfig.includes(`${routeKey}: {`)) missingSeo.push(path);
  if (!prerender.includes(`${routeKey}: {`)) missingPrerender.push(path);
}

if (missingSeo.length || missingPrerender.length) {
  if (missingSeo.length) {
    console.error("Missing src/config/seo.ts routes:", missingSeo.join(", "));
  }
  if (missingPrerender.length) {
    console.error("Missing scripts/prerender.mjs routes:", missingPrerender.join(", "));
  }
  process.exit(1);
}

console.log(`SEO contract OK: ${locs.length} sitemap URLs have runtime SEO + prerender metadata.`);
