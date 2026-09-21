import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = process.env.CUSTOMER_PORTAL_PUBLIC_DIR
  ? path.resolve(process.env.CUSTOMER_PORTAL_PUBLIC_DIR)
  : path.resolve(SERVER_DIR, "../dist/public");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function safePathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  return decoded;
}

function isInsidePublicDir(candidate) {
  return candidate === PUBLIC_DIR || candidate.startsWith(`${PUBLIC_DIR}${path.sep}`);
}

async function existingFile(candidate) {
  try {
    const details = await stat(candidate);
    if (details.isFile()) return candidate;
    if (details.isDirectory()) {
      const index = path.join(candidate, "index.html");
      const indexDetails = await stat(index);
      return indexDetails.isFile() ? index : null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function serveStatic(request, response, pathname) {
  if (!["GET", "HEAD"].includes(request.method ?? "GET")) return false;

  const decoded = safePathname(pathname);
  if (!decoded) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return true;
  }

  const relative = decoded.replace(/^\/+/, "");
  const requested = path.resolve(PUBLIC_DIR, relative || "index.html");
  if (!isInsidePublicDir(requested)) {
    response.writeHead(404);
    response.end();
    return true;
  }

  let file = await existingFile(requested);
  if (!file && !decoded.startsWith("/assets/")) {
    file = await existingFile(path.join(PUBLIC_DIR, "index.html"));
  }
  if (!file) return false;

  const extension = path.extname(file).toLowerCase();
  const cacheControl = decoded.startsWith("/assets/")
    ? "public, max-age=31536000, immutable"
    : "no-store";
  response.writeHead(200, {
    "Cache-Control": cacheControl,
    "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  if (request.method === "HEAD") {
    response.end();
    return true;
  }
  createReadStream(file).pipe(response);
  return true;
}