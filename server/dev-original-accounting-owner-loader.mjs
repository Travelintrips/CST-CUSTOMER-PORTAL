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
import { databaseEnvironment, databaseConnectionSource } from "./db.mjs";

export const DEV_ACCOUNTING_OWNER_FILE =
  "/opt/cst-customer-invoice-owner-bundle-dev/portalInvoiceOwner.mjs";
export const DEV_ACCOUNTING_OWNER_SHA256 =
  "6b98c9b5bd11908652b8bfa6f85b635282e709351a3ea01a24d4189873ed59f4";

export function originalOwnerGateEnabled(env = process.env) {
  return env.APP_ENV?.trim().toLowerCase() === "development"
    && env.NODE_ENV === "development"
    && env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true"
    && env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV === "true";
}

export function isReviewedOriginalOwnerBundle(bytes) {
  return createHash("sha256").update(bytes).digest("hex") === DEV_ACCOUNTING_OWNER_SHA256;
}

export async function loadDevOriginalAccountingOwner() {
  if (!originalOwnerGateEnabled()) return null;
  // db.mjs can fall back to a PROD connection in DEV when its named DEV URL
  // is absent. Refuse all implicit or generic database sources.
  if (databaseEnvironment !== "development"
      || databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV") return null;
  try {
    const actualPath = await realpath(DEV_ACCOUNTING_OWNER_FILE);
    // No symlink, remote import, or env/HTTP-controlled path.
    if (actualPath !== DEV_ACCOUNTING_OWNER_FILE) return null;
    const bytes = await readFile(actualPath);
    if (!isReviewedOriginalOwnerBundle(bytes)) return null;
    const module = await import(pathToFileURL(actualPath).href);
    return typeof module.postCustomerInvoiceWithOriginalOwner === "function"
      ? module.postCustomerInvoiceWithOriginalOwner
      : null;
  } catch {
    // The invoice transaction must fail HTTP503 rather than silently issue an
    // unposted invoice or leak filesystem/database details to the caller.
    return null;
  }
}
