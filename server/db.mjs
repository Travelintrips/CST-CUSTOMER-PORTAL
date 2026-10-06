import pg from "pg";

const { Pool } = pg;

const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const isProduction =
  APP_ENV === "production" || process.env.NODE_ENV === "production";

const connectionCandidates = isProduction
  ? [
      ["SUPABASE_DATABASE_URL", process.env.SUPABASE_DATABASE_URL],
      ["SUPABASE_PG_URL", process.env.SUPABASE_PG_URL],
    ]
  : [
      ["SUPABASE_DATABASE_URL_DEV", process.env.SUPABASE_DATABASE_URL_DEV],
      ["SUPABASE_PG_URL", process.env.SUPABASE_PG_URL],
      ["SUPABASE_DATABASE_URL", process.env.SUPABASE_DATABASE_URL],
    ];

const selectedConnection = connectionCandidates.find(([, value]) => Boolean(value));
const connectionString = selectedConnection?.[1];
export const databaseEnvironment = isProduction ? "production" : "development";
export const databaseConnectionSource = selectedConnection?.[0] ?? null;

if (!connectionString) {
  throw new Error(
    isProduction
      ? "Customer Portal API production requires SUPABASE_DATABASE_URL or SUPABASE_PG_URL."
      : "Customer Portal API development requires SUPABASE_DATABASE_URL_DEV, SUPABASE_PG_URL, or SUPABASE_DATABASE_URL.",
  );
}

const requestedPoolSize = Math.max(
  1,
  Number(process.env.CUSTOMER_PORTAL_DB_POOL_SIZE ?? 4) || 4,
);
const effectivePoolSize = Math.min(8, requestedPoolSize);

export const pool = new Pool({
  connectionString,
  max: effectivePoolSize,
  min: isProduction ? 1 : 0,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

function isReadOnlySql(sql) {
  return /^\s*(select|show|with\b[^;]*\bselect\b)/i.test(String(sql ?? ""));
}

function isTransientPgError(error) {
  const code = String(error?.code ?? "");
  return ["ECONNRESET", "ETIMEDOUT", "EPIPE", "08000", "08001", "08003", "08006", "08007", "08P01", "57P01", "57P02", "57P03", "53300"].includes(code)
    || /connection|socket|timeout|terminating connection|server closed/i.test(String(error?.message ?? ""));
}

export async function query(text, values = []) {
  const attempts = isReadOnlySql(text) ? 3 : 1;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await pool.query(text, values);
    } catch (error) {
      lastError = error;
      if (!isTransientPgError(error) || attempt >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }
  throw lastError;
}

export async function checkDatabase() {
  await query("select 1 as ok");
  return true;
}

export async function closeDatabase() {
  await pool.end();
}