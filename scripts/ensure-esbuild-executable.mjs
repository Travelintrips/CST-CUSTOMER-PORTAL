#!/usr/bin/env node
import path from "node:path";
import { access, chmod, readdir } from "node:fs/promises";
import { constants } from "node:fs";

const pnpmDir = path.resolve(process.cwd(), "node_modules", ".pnpm");

let entries;
try {
  entries = await readdir(pnpmDir, { withFileTypes: true });
} catch (error) {
  console.error("[hostinger] pnpm store is missing:", pnpmDir);
  throw error;
}

const candidates = [];
for (const entry of entries) {
  if (!entry.isDirectory() || !entry.name.startsWith("@esbuild+")) continue;
  const packageRoot = path.join(pnpmDir, entry.name, "node_modules", "@esbuild");
  let platforms = [];
  try {
    platforms = await readdir(packageRoot, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const platform of platforms) {
    if (!platform.isDirectory()) continue;
    candidates.push(path.join(packageRoot, platform.name, "bin", "esbuild"));
  }
}

if (!candidates.length) {
  throw new Error("No @esbuild platform binary was found under node_modules/.pnpm.");
}

let fixed = 0;
for (const binary of candidates) {
  try {
    await chmod(binary, 0o755);
    await access(binary, constants.X_OK);
    fixed += 1;
  } catch {
    // Some candidates can be for platforms that are not materialized locally.
  }
}

if (!fixed) {
  throw new Error("Found esbuild package entries but could not make any platform binary executable.");
}

console.log(`[hostinger] esbuild executable permission verified on ${fixed} binary/binaries.`);
