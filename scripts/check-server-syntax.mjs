#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const files = [];

function collectRuntime(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) collectRuntime(path);
    else if (stat.isFile() && path.endsWith(".mjs")) files.push(path);
  }
}

// All production server modules are syntax-critical.
collectRuntime(join(root, "server"));

// Only scripts that are executed by build/start/production verification are
// syntax-critical for deploy. Legacy one-off maintenance scripts must not
// block an otherwise valid production release.
for (const name of [
  "ensure-esbuild-executable.mjs",
  "validate-translations.mjs",
  "validate-seo-contract.mjs",
  "build-vite.mjs",
  "prerender.mjs",
  "prepare-hostinger.mjs",
  "portal-production-smoke.mjs",
]) {
  files.push(join(root, "scripts", name));
}

files.push(join(root, "index.js"));

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(`[server-syntax] FAIL ${relative(root, file)}\n`);
    process.stderr.write(result.stderr || result.stdout || "Unknown syntax error\n");
    process.exit(result.status || 1);
  }
}

console.log(`[server-syntax] PASS ${files.length} production runtime/build files`);
