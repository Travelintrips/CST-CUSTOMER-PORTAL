import path from "node:path";
import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "dist");
const publicDir = path.join(outputDir, "public");
const serverSource = path.join(repoRoot, "server");
const serverOutput = path.join(outputDir, "server");

async function assertDirectory(dir, label) {
  try {
    const info = await stat(dir);
    if (!info.isDirectory()) throw new Error(`${label} is not a directory: ${dir}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("is not a directory")) throw error;
    throw new Error(`${label} is missing: ${dir}`);
  }
}

await assertDirectory(publicDir, "Customer Portal frontend build");
await assertDirectory(serverSource, "Customer Portal server source");

await rm(serverOutput, { recursive: true, force: true });
await cp(serverSource, serverOutput, { recursive: true });

const runtimeEntry = `import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const loader = path.join(runtimeDir, "server", "load-secrets.mjs");
const api = path.join(runtimeDir, "server", "index.mjs");

const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "production",
  APP_ENV: process.env.APP_ENV || "production",
  CUSTOMER_PORTAL_PUBLIC_DIR:
    process.env.CUSTOMER_PORTAL_PUBLIC_DIR || path.join(runtimeDir, "public"),
};

const child = spawn(process.execPath, [loader, process.execPath, api], {
  stdio: "inherit",
  env,
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("[customer-portal] failed to spawn production runtime", error);
  process.exit(1);
});
`;

await writeFile(path.join(outputDir, "index.js"), runtimeEntry, "utf8");
await writeFile(
  path.join(outputDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2) + "\n",
  "utf8",
);

console.log("Prepared Hostinger Customer Portal bundle in ./dist");
