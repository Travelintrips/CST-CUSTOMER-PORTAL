import path from "node:path";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "dist");
const publicDir = path.join(outputDir, "public");
const serverSource = path.join(repoRoot, "server");
const serverOutput = path.join(outputDir, "server");
const rootPackage = JSON.parse(
  await readFile(path.join(repoRoot, "package.json"), "utf8"),
);

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

let releaseId = process.env.PORTAL_RELEASE_ID || process.env.GITHUB_SHA || "";
if (!releaseId) {
  try {
    releaseId = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    releaseId = "";
  }
}
releaseId ||= "unknown";

await rm(serverOutput, { recursive: true, force: true });
await cp(serverSource, serverOutput, { recursive: true });

const runtimeEntry = `import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSecrets } from "./server/secret-bootstrap.mjs";

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV ||= "production";
process.env.APP_ENV ||= "production";
process.env.CUSTOMER_PORTAL_PUBLIC_DIR ||=
  path.join(runtimeDir, "public");
process.env.PORTAL_RELEASE_ID ||= ${JSON.stringify(releaseId)};

await loadSecrets(process.env);
await import("./server/index.mjs");
`;

await writeFile(path.join(outputDir, "index.js"), runtimeEntry, "utf8");
await writeFile(
  path.join(outputDir, "package.json"),
  JSON.stringify({
    private: true,
    type: "module",
    engines: rootPackage.engines,
    dependencies: rootPackage.dependencies,
  }, null, 2) + "\n",
  "utf8",
);

console.log(`Prepared Hostinger Customer Portal bundle in ./dist (release ${releaseId})`);
