import { loadSecrets } from "../server/secret-bootstrap.mjs";

function abort(message) {
  console.error("[customer-portal-dev-vps] " + message);
  process.exit(1);
}

if (process.env.APP_ENV !== "development" || process.env.NODE_ENV === "production") {
  abort("Unsafe runtime environment: DEV only.");
}
if (!process.env.GCP_SECRET_MANAGER_BOOTSTRAP_JSON) {
  abort("Missing DEV Secret Manager bootstrap; refusing to start.");
}
try {
  await loadSecrets(process.env);
} catch (error) {
  abort("DEV Secret Manager unavailable: " + error.message);
}
for (const key of ["SUPABASE_DATABASE_URL_DEV", "SUPABASE_URL_DEV", "SUPABASE_SERVICE_ROLE_KEY_DEV", "SUPABASE_STORAGE_BUCKET_DEV"]) {
  if (!process.env[key]) abort("Missing required DEV-only configuration: " + key);
}
if (process.env.SUPABASE_DATABASE_URL_PROD &&
    process.env.SUPABASE_DATABASE_URL_DEV === process.env.SUPABASE_DATABASE_URL_PROD) {
  abort("DEV and PROD database URLs must not be identical.");
}
process.env.SUPABASE_DATABASE_URL = process.env.SUPABASE_DATABASE_URL_DEV;
process.env.SUPABASE_PG_URL = "";
process.env.SUPABASE_URL = process.env.SUPABASE_URL_DEV;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
process.env.SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_DEV;
await import("../server/index.mjs");
