/**
 * Private DEV: resolve only the exact reviewed Accounting owner ESM bundle.
 *
 * The original Canonical Posting Engine lives in bizportal/bizportal-app. This
 * helper never loads a user URL, another service, a global DB pool, or an
 * unreviewed local module. The full bundle is staged separately by release
 * engineering after its own review and E2E tests. Missing/mismatched packages
 * fail closed, leaving invoice issuance inside its rollback boundary.
 */
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { databaseEnvironment, databaseConnectionSource } from "./db.mjs";

export const DEV_ACCOUNTING_OWNER_DIR =
  "/opt/cst-customer-invoice-owner-bundle-dev";
export const DEV_ACCOUNTING_OWNER_FILE =
  path.join(DEV_ACCOUNTING_OWNER_DIR, "portalInvoiceAdapter.mjs");
export const DEV_ACCOUNTING_OWNER_SHA256 =
  "2299c63f802e964dd031f1b5f40005fe9ec6d14eff71761f56b0b4f43bbfeff3";
// All Pino worker modules are part of the SAME reviewed release, not optional.
export const DEV_ACCOUNTING_OWNER_HASHES = Object.freeze({
  "portalInvoiceAdapter.mjs": DEV_ACCOUNTING_OWNER_SHA256,
  "pino-file.mjs": "bbc4281497fe72cf43c497927570f930aaed27f73481e652ccfef6a5d1e102f2",
  "pino-pretty.mjs": "db4343e9a60574d43281e8e6731ec71a1317c53737c5cfc11049cd565ceae8ea",
  "pino-worker.mjs": "b1905ab6d4843945437af840160a682b9d86c3bee9ae7cb96f21032a98652297",
  "thread-stream-worker.mjs": "8d292b213919ff58dce983d0a34f68f3224345411fea8af1b64b11ec8cbeb249",
});

export function originalOwnerGateEnabled(env = process.env) {
  return env.APP_ENV?.trim().toLowerCase() === "development"
    && env.NODE_ENV === "development"
    && env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true"
    && env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV === "true";
}

export function isReviewedOriginalOwnerBundle(bytes, expectedHash = DEV_ACCOUNTING_OWNER_SHA256) {
  return createHash("sha256").update(bytes).digest("hex") === expectedHash;
}

// DEV must never silently use a PROD Supabase project through an incorrect
// value in the explicitly named DEV environment variable. Pooler usernames
// contain the project ref; direct database hosts contain the same ref.
export function isExpectedDevDatabaseUrl(raw = process.env.SUPABASE_DATABASE_URL_DEV) {
  if (typeof raw !== "string" || !raw.trim()) return false;
  try {
    const url = new URL(raw);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) return false;
    const ref = "xssrfshdrtdfupgqwfdw";
    return url.hostname.includes(ref)
      || decodeURIComponent(url.username).includes(ref);
  } catch {
    return false;
  }
}

export async function loadDevOriginalAccountingOwner() {
  if (!originalOwnerGateEnabled()) return null;
  // db.mjs can fall back to a PROD connection in DEV when its named DEV URL
  // is absent. Refuse all implicit or generic database sources.
  if (databaseEnvironment !== "development"
      || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") return null;
  if (!isExpectedDevDatabaseUrl()) return null;
  try {
    for (const [name, expectedHash] of Object.entries(DEV_ACCOUNTING_OWNER_HASHES)) {
      const intended = path.join(DEV_ACCOUNTING_OWNER_DIR, name);
      const actualPath = await realpath(intended);
      // Refuse any symlink or substituted worker even when the main ESM
      // passes its digest: Pino runs separate Node worker modules.
      if (actualPath !== intended) return null;
      if (!isReviewedOriginalOwnerBundle(await readFile(actualPath), expectedHash)) return null;
    }
    const module = await import(pathToFileURL(DEV_ACCOUNTING_OWNER_FILE).href);
    return typeof module.postCustomerInvoiceWithOriginalOwner === "function"
      ? module.postCustomerInvoiceWithOriginalOwner
      : null;
  } catch {
    // The invoice transaction must fail HTTP503 rather than silently issue an
    // unposted invoice or leak filesystem/database details to the caller.
    return null;
  }
}
