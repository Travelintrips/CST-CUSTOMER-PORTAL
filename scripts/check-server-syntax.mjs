#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const targets = [join(root, "server"), join(root, "scripts")];
const files = [];

function collect(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) collect(path);
    else if (stat.isFile() && path.endsWith(".mjs")) files.push(path);
  }
}

for (const dir of targets) collect(dir);
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

console.log(`[server-syntax] PASS ${files.length} runtime files`);
