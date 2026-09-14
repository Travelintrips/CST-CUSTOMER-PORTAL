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

export const pool = new Pool({
  connectionString,
  max: Number(process.env.CUSTOMER_PORTAL_DB_POOL_SIZE ?? 8),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

export function query(text, values = []) {
  return pool.query(text, values);
}

export async function checkDatabase() {
  await query("select 1 as ok");
  return true;
}

export async function closeDatabase() {
  await pool.end();
}