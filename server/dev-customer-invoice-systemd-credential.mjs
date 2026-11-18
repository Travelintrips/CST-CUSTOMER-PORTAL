/**
 * Dedicated DEV-only systemd LoadCredential adapter. The long-running VPS
 * service can receive a verified, ephemeral keyless-delivered credential
 * without Google service-account keys or process.env PostgreSQL passwords.
 * No OS/shell/GitHub commands or external APIs are called from this module.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { validateDevCustomerInvoiceSecretPayload } from "./dev-customer-invoice-writer-secret.mjs";

export const DEV_CUSTOMER_INVOICE_SYSTEMD_CREDENTIAL_NAME =
  "customer-invoice-writers-dev.json";
const SYSTEMD_CREDENTIALS_PREFIX = "/run/credentials/";

function refused() {
  return Object.assign(
    new Error("Kredensial systemd Invoice DEV belum tersedia atau tidak aman."),
    { statusCode: 503 },
  );
}

export function hasDevCustomerInvoiceSystemdCredentials(env = process.env) {
  return Object.prototype.hasOwnProperty.call(env, "CREDENTIALS_DIRECTORY");
}

export async function loadDevCustomerInvoiceSystemdCredentials({
  env = process.env,
  fileSystem = fs,
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV !== "development"
    || env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV !== "true"
    || env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true"
    || env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV !== "true"
    || !hasDevCustomerInvoiceSystemdCredentials(env)) throw refused();

  const dir = env.CREDENTIALS_DIRECTORY;
  if (typeof dir !== "string" || !dir.startsWith(SYSTEMD_CREDENTIALS_PREFIX)
      || dir.length > 250 || dir.includes("..")
      || path.resolve(dir) !== dir || dir.endsWith("/")) throw refused();
  const filename = path.join(dir, DEV_CUSTOMER_INVOICE_SYSTEMD_CREDENTIAL_NAME);
  try {
    const [realDirectory, directoryInfo, realFile, fileInfo] = await Promise.all([
      fileSystem.realpath(dir),
      fileSystem.lstat(dir),
      fileSystem.realpath(filename),
      fileSystem.lstat(filename),
    ]);
    // systemd mounts credentials read-only and may give a dynamic service
    // account group-read access (0440). World read and group/world write are forbidden.
    if (realDirectory !== dir || realFile !== filename
        || !directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()
        || !fileInfo.isFile() || fileInfo.isSymbolicLink()
        || (fileInfo.mode & 0o027) !== 0
        || fileInfo.size < 80 || fileInfo.size > 16_384) throw refused();
    const payload = await fileSystem.readFile(filename, "utf8");
    return validateDevCustomerInvoiceSecretPayload(payload);
  } catch {
    // Never attach the raw payload, secret DSN, filesystem path detail, or
    // platform errors to API responses/logs.
    throw refused();
  }
}
