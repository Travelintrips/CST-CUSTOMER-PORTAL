/**
 * DEV-only, backend-controlled loader for the ORIGINAL BizPortal Accounting owner.
 *
 * The distributable owner.mjs is generated from the pinned canonical
 * bizportal/bizportal-app source. It is NOT supplied by an HTTP request,
 * dynamically fetched from a URL, or generated at runtime.
 *
 * Both DEV flags must be enabled explicitly. The file must be a regular,
 * locally installed package whose exact SHA-256 was approved for this
 * release. Otherwise Invoice issuance fails closed before any DB mutation.
 */
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_OWNER_URL = new URL("../.dev-accounting-owner/owner.mjs", import.meta.url);

export async function loadTrustedDevAccountingOwner({
  bundlePath = null,
  expectedSha256 = process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV,
} = {}) {
  if (process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV !== "true") return null;
  if (process.env.APP_ENV?.trim().toLowerCase() !== "development" ||
      process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true") {
    throw new Error("DEV_ACCOUNTING_OWNER_ENV_DENIED");
  }
  const pinned = String(expectedSha256 ?? "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(pinned)) {
    throw new Error("DEV_ACCOUNTING_OWNER_HASH_NOT_PINNED");
  }

  // Delay fileURLToPath until the feature is enabled. Test runners may
  // transform import.meta.url to a virtual module URL; production Node does not.
  const verifiedPath = bundlePath ?? fileURLToPath(DEFAULT_OWNER_URL);
  let bytes;
  try {
    const info = await lstat(verifiedPath);
    // Reject symlinks, directories and unusual/oversized files.
    if (!info.isFile() || info.isSymbolicLink() ||
        info.size < 1 || info.size > 8 * 1024 * 1024) {
      throw new Error("invalid trusted bundle");
    }
    bytes = await readFile(verifiedPath);
  } catch {
    throw new Error("DEV_ACCOUNTING_OWNER_PACKAGE_UNAVAILABLE");
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== pinned) {
    throw new Error("DEV_ACCOUNTING_OWNER_HASH_MISMATCH");
  }

  let loaded;
  try {
    loaded = await import(pathToFileURL(verifiedPath).href);
  } catch {
    throw new Error("DEV_ACCOUNTING_OWNER_IMPORT_FAILED");
  }
  if (typeof loaded.postCustomerPortalSalesInvoiceWithExistingOwner !== "function") {
    throw new Error("DEV_ACCOUNTING_OWNER_EXPORT_INVALID");
  }

  // The actual callback receives ONLY the caller's existing PostgreSQL
  // transaction client from billing-operations.mjs; this loader opens no DB.
  return loaded.postCustomerPortalSalesInvoiceWithExistingOwner;
}
