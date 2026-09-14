import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.SUPABASE_DATABASE_URL_DEV ??
  process.env.SUPABASE_PG_URL ??
  process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Customer Portal API requires SUPABASE_DATABASE_URL_DEV, SUPABASE_PG_URL, or SUPABASE_DATABASE_URL.",
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