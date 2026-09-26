import { query } from "./db.mjs";

let cached = null;
const CACHE_MS = 60_000;

export async function resolveCustomerPortalFonnteToken(dbQuery = query) {
  const envToken = String(process.env.CUSTOMER_PORTAL_FONNTE_TOKEN ?? "").trim();
  if (envToken) return envToken;

  if (dbQuery === query && cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  let value = "";
  try {
    const result = await dbQuery(
      `select value
         from public.app_config
        where key = 'CUSTOMER_PORTAL_FONNTE_TOKEN'
        limit 1`,
    );
    value = String(result.rows[0]?.value ?? "").trim();
  } catch {
    value = "";
  }

  if (dbQuery === query) {
    cached = { value, expiresAt: Date.now() + CACHE_MS };
  }
  return value;
}

export async function customerPortalFonnteConfigured(dbQuery = query) {
  return Boolean(await resolveCustomerPortalFonnteToken(dbQuery));
}
