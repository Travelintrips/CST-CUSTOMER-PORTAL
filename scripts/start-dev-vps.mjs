import { loadSecrets } from "../server/secret-bootstrap.mjs";

function abort(message) {
  console.error("[customer-portal-dev-vps] " + message);
  process.exit(1);
}

const devProjectRef = "xssrfshdrtdfupgqwfdw";
if (process.env.APP_ENV !== "development" || process.env.NODE_ENV === "production") {
  abort("Unsafe runtime environment: DEV only.");
}
if (process.env.DEV_VPS_LOCAL_ENV === "1") {
  // VPS-local, root-protected DEV configuration. Never fall back to PROD keys.
  for (const key of ["SESSION_SECRET", "SUPABASE_DATABASE_URL_DEV", "SUPABASE_URL_DEV", "SUPABASE_SERVICE_ROLE_KEY_DEV", "SUPABASE_STORAGE_BUCKET_DEV"]) {
    if (!process.env[key]) abort("Missing required DEV-only configuration: " + key);
  }
} else {
  if (!process.env.GCP_SECRET_MANAGER_BOOTSTRAP_JSON) {
    abort("Missing DEV Secret Manager bootstrap; refusing to start.");
  }
  try { await loadSecrets(process.env); }
  catch (error) { abort("DEV Secret Manager unavailable: " + error.message); }
}
const db = process.env.SUPABASE_DATABASE_URL_DEV || "";
const url = process.env.SUPABASE_URL_DEV || "";
let parsedDb, parsedUrl;
try {
  parsedDb = new URL(db);
  parsedUrl = new URL(url);
} catch {
  abort("Invalid DEV database or Supabase URL.");
}
if (!["postgres:", "postgresql:"].includes(parsedDb.protocol) ||
    parsedDb.username.split(".").at(-1) !== devProjectRef ||
    parsedUrl.hostname !== devProjectRef + ".supabase.co" ||
    parsedUrl.protocol !== "https:") {
  abort("DEV database identity mismatch: refusing to connect.");
}
if (String(process.env.SESSION_SECRET || "").length < 32) abort("SESSION_SECRET is too short.");
if (process.env.SUPABASE_STORAGE_BUCKET_DEV !== "private-uploads") abort("DEV storage bucket mismatch.");
process.env.SUPABASE_DATABASE_URL = db;
delete process.env.SUPABASE_PG_URL;
process.env.SUPABASE_URL = url;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
process.env.SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_DEV;
process.env.CUSTOMER_PORTAL_DEV_VPS_SERVE_STATIC = "1";
await import("../server/index.mjs");
