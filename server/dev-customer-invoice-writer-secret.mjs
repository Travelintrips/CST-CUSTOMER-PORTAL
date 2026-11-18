/**
 * Optional DEV-only Secret Manager source for two independent Customer
 * Invoice PostgreSQL writer DSNs. Does not grant roles or enable Invoice.
 * This path is deliberately absent/inert in the active DEV runtime.
 */
export const DEV_CUSTOMER_INVOICE_GCP_PROJECT = "secret-504012";
export const DEV_CUSTOMER_INVOICE_SECRET =
  "projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies/versions/latest";
export const DEV_CUSTOMER_INVOICE_SECRET_READER =
  "bizportal-invoice-dev-reader@secret-504012.iam.gserviceaccount.com";
export const DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV =
  "CUSTOMER_PORTAL_INVOICE_GCP_BOOTSTRAP_JSON_DEV";
const EXPECTED_REF = "xssrfshdrtdfupgqwfdw";
const ALLOWED_FIELDS = new Set([
  "APP_ENV",
  "SUPABASE_PROJECT_REF",
  "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV",
  "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV",
]);

function refused() {
  return Object.assign(
    new Error("Kredensial Invoice DEV terpisah belum tersedia atau tidak tervalidasi."),
    { statusCode: 503 },
  );
}

export function hasInvoiceDevGcpBootstrap(env = process.env) {
  return typeof env?.[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV] === "string"
    && env[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV].trim().length > 0;
}

function validateBootstrap(raw) {
  let credentials;
  try { credentials = JSON.parse(raw); } catch { throw refused(); }
  if (!credentials || Array.isArray(credentials)
      || credentials.project_id !== DEV_CUSTOMER_INVOICE_GCP_PROJECT
      || credentials.client_email !== DEV_CUSTOMER_INVOICE_SECRET_READER
      || typeof credentials.private_key !== "string"
      || !credentials.private_key.includes("BEGIN PRIVATE KEY")) {
    throw refused();
  }
  return credentials;
}

export function validateDevCustomerInvoiceSecretPayload(raw) {
  if (typeof raw !== "string" || raw.length > 16_384 || raw.length < 80)
    throw refused();
  let data;
  try { data = JSON.parse(raw); } catch { throw refused(); }
  if (!data || typeof data !== "object" || Array.isArray(data)
      || Object.keys(data).length !== ALLOWED_FIELDS.size
      || Object.keys(data).some((k) => !ALLOWED_FIELDS.has(k))
      || data.APP_ENV !== "development"
      || data.SUPABASE_PROJECT_REF !== EXPECTED_REF) {
    throw refused();
  }
  const cst = data.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV;
  const diva = data.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV;
  if (typeof cst !== "string" || typeof diva !== "string"
      || !cst.startsWith("postgresql://") || !diva.startsWith("postgresql://")
      || cst === diva || cst.length > 4096 || diva.length > 4096) {
    throw refused();
  }
  return {
    CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV: cst,
    CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV: diva,
  };
}

export async function loadDevCustomerInvoiceWriterSecrets({
  env = process.env,
  clientFactory = async (credentials) => {
    // Only the direct GCP path needs the SDK. systemd credentials can be
    // delivered without any Google runtime bootstrap or installed SDK.
    const { SecretManagerServiceClient } = await import("@google-cloud/secret-manager");
    return new SecretManagerServiceClient({ credentials });
  },
} = {}) {
  if (env.APP_ENV !== "development" || env.NODE_ENV !== "development"
      || env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV !== "true"
      || env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV !== "true"
      || env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV !== "true"
      || !hasInvoiceDevGcpBootstrap(env)) throw refused();

  const credentials = validateBootstrap(env[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]);
  let client;
  try {
    client = await clientFactory(credentials);
    if (typeof client?.accessSecretVersion !== "function") throw refused();
    const [version] = await client.accessSecretVersion({
      name: DEV_CUSTOMER_INVOICE_SECRET,
    });
    const bytes = version?.payload?.data;
    if (typeof bytes?.toString !== "function") throw refused();
    return validateDevCustomerInvoiceSecretPayload(bytes.toString("utf8"));
  } catch {
    // No secret values, credentials, GCP raw exceptions or database DSNs
    // are ever placed in thrown errors or logs.
    throw refused();
  } finally {
    try { await client?.close?.(); } catch {}
  }
}
