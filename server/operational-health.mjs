import crypto from "node:crypto";
import { pool, query } from "./db.mjs";
import { authCapabilities } from "./auth-providers.mjs";
import { getMarketplaceWhatsAppQueueStats } from "./whatsapp-service.mjs";

const INSTANCE_ID = `${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const RELEASE_ID = () => process.env.PORTAL_RELEASE_ID ?? "local-development";
const PUBLIC_ORIGIN = () => {
  const configured = String(process.env.PORTAL_PUBLIC_ORIGIN ?? "").trim();
  if (configured) {
    try { return new URL(configured).origin; } catch {}
  }
  return "https://cstlogistic.co.id";
};

let healthTimer = null;
let publicProbeTimer = null;
let recoveryTimer = null;
let cleanupTimer = null;

async function insertCheck({ checkName, status, durationMs, details = {} }) {
  await query(
    `insert into public.portal_operational_checks
      (check_name,status,release_id,instance_id,duration_ms,details,created_at)
     values ($1,$2,$3,$4,$5,$6::jsonb,now())`,
    [
      checkName,
      status,
      RELEASE_ID(),
      INSTANCE_ID,
      Math.max(0, Math.round(durationMs)),
      JSON.stringify(details),
    ],
  );
}

function poolSnapshot() {
  return {
    total: Number(pool.totalCount ?? 0),
    idle: Number(pool.idleCount ?? 0),
    waiting: Number(pool.waitingCount ?? 0),
    max: Number(pool.options?.max ?? 0),
  };
}

export async function runOperationalHealthCheck() {
  const started = Date.now();
  const details = { database: "unknown", auth: null, whatsapp: null, pool: poolSnapshot() };
  let status = "healthy";
  try {
    await query("select 1 as ok");
    details.database = "connected";

    const schema = await query(
      `select
         to_regclass('public.portal_customers') is not null as portal_customers,
         to_regclass('public.portal_customer_profiles') is not null as portal_customer_profiles,
         to_regclass('public.vendor_profiles') is not null as vendor_profiles,
         to_regclass('public.portal_password_reset_tokens') is not null as password_reset_tokens,
         to_regclass('public.portal_operational_checks') is not null as operational_checks`,
    );
    details.schema = schema.rows[0] ?? {};

    const caps = await authCapabilities();
    details.auth = {
      google: Boolean(caps.google),
      emailOtp: Boolean(caps.emailOtp),
      whatsapp: Boolean(caps.whatsapp),
      password: Boolean(caps.password),
    };
    if (!details.auth.google || !details.auth.emailOtp || !details.auth.password) status = "degraded";

    const queue = await getMarketplaceWhatsAppQueueStats();
    details.whatsapp = {
      configured: Boolean(queue.configured),
      workerEnabled: Boolean(queue.workerEnabled),
      pending: Number(queue.pending ?? 0),
      retrying: Number(queue.retrying ?? 0),
      stuckOver10m: Number(queue.stuckOver10m ?? 0),
    };
    if (details.whatsapp.stuckOver10m > 0) status = "degraded";

    details.pool = poolSnapshot();
    if (details.pool.waiting > 0) status = "degraded";
  } catch (error) {
    status = "failed";
    details.error = String(error?.code ?? error?.message ?? "operational_check_failed").slice(0, 500);
    details.pool = poolSnapshot();
  }

  const durationMs = Date.now() - started;
  try {
    await insertCheck({ checkName: "runtime_health", status, durationMs, details });
  } catch (recordError) {
    console.error("[customer-portal-api] operational check record failed", recordError?.message ?? recordError);
  }
  if (status !== "healthy") {
    console.warn("[customer-portal-api] operational health", { status, ...details, durationMs });
  }
  return { status, durationMs, details, releaseId: RELEASE_ID(), instanceId: INSTANCE_ID };
}

async function fetchProbe(path) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(new URL(path, PUBLIC_ORIGIN()), {
      method: "GET",
      headers: { "User-Agent": "CST-Customer-Portal-Operational-Probe/1.0" },
      signal: controller.signal,
      redirect: "manual",
    });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch {}
    return { path, statusCode: response.status, ok: response.ok, body, durationMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runPublicProductionProbe() {
  const started = Date.now();
  let status = "healthy";
  const details = { origin: PUBLIC_ORIGIN(), probes: [] };
  try {
    for (const path of ["/api/healthz", "/api/readyz", "/api/portal/auth/capabilities"]) {
      const probe = await fetchProbe(path);
      details.probes.push({
        path: probe.path,
        statusCode: probe.statusCode,
        durationMs: probe.durationMs,
      });
      if (!probe.ok) status = "failed";
      if (path === "/api/readyz" && probe.body?.status !== "ready") status = "failed";
      if (path === "/api/portal/auth/capabilities") {
        const required = ["google", "emailOtp", "password"];
        if (required.some((key) => probe.body?.[key] !== true)) status = "degraded";
      }
    }
  } catch (error) {
    status = "failed";
    details.error = String(error?.name === "AbortError" ? "probe_timeout" : error?.message ?? error).slice(0, 500);
  }
  const durationMs = Date.now() - started;
  try {
    await insertCheck({ checkName: "public_production_probe", status, durationMs, details });
  } catch (recordError) {
    console.error("[customer-portal-api] public probe record failed", recordError?.message ?? recordError);
  }
  if (status !== "healthy") {
    console.warn("[customer-portal-api] public production probe", { status, details, durationMs });
  }
  return { status, durationMs, details, releaseId: RELEASE_ID() };
}

export async function runRecoveryDrill() {
  const runToken = crypto.randomUUID();
  const started = Date.now();
  const client = await pool.connect();
  let transactionVerified = false;
  let rollbackVerified = false;
  let walLsn = null;
  let failure = null;
  try {
    await client.query("begin");
    const wal = await client.query("select pg_current_wal_lsn()::text as lsn");
    walLsn = wal.rows[0]?.lsn ?? null;

    await client.query(
      `insert into public.portal_recovery_drill_scratch(run_token,payload)
       values ($1,$2::jsonb)`,
      [runToken, JSON.stringify({ phase: "inserted", releaseId: RELEASE_ID() })],
    );
    const inserted = await client.query(
      "select payload from public.portal_recovery_drill_scratch where run_token=$1 for update",
      [runToken],
    );
    if (!inserted.rows[0]) throw new Error("recovery drill insert verification failed");

    await client.query(
      `update public.portal_recovery_drill_scratch
          set payload=$2::jsonb
        where run_token=$1`,
      [runToken, JSON.stringify({ phase: "updated", releaseId: RELEASE_ID() })],
    );
    const updated = await client.query(
      "select payload from public.portal_recovery_drill_scratch where run_token=$1",
      [runToken],
    );
    transactionVerified = updated.rows[0]?.payload?.phase === "updated";
    if (!transactionVerified) throw new Error("recovery drill update verification failed");

    await client.query("rollback");
  } catch (error) {
    failure = error;
    try { await client.query("rollback"); } catch {}
  } finally {
    client.release();
  }

  try {
    const residue = await query(
      "select count(*)::int as count from public.portal_recovery_drill_scratch where run_token=$1",
      [runToken],
    );
    rollbackVerified = Number(residue.rows[0]?.count ?? 0) === 0;
  } catch (error) {
    failure ??= error;
  }

  const passed = !failure && transactionVerified && rollbackVerified;
  const durationMs = Date.now() - started;
  const details = {
    drillType: "transactional_rollback_rehearsal",
    transactionVerified,
    rollbackVerified,
    walLsn,
    error: failure ? String(failure?.code ?? failure?.message ?? failure).slice(0, 500) : null,
  };

  await query(
    `insert into public.portal_recovery_drill_runs
      (run_token,status,release_id,duration_ms,details,created_at)
     values ($1,$2,$3,$4,$5::jsonb,now())`,
    [runToken, passed ? "passed" : "failed", RELEASE_ID(), durationMs, JSON.stringify(details)],
  );

  if (!passed) console.error("[customer-portal-api] recovery drill failed", details);
  else console.info("[customer-portal-api] recovery drill passed", { durationMs, walLsn });

  return { status: passed ? "passed" : "failed", runToken, durationMs, details, releaseId: RELEASE_ID() };
}

export async function getOperationalSummary() {
  const [checks, drills, queue] = await Promise.all([
    query(
      `select check_name,status,release_id,instance_id,duration_ms,details,created_at
         from public.portal_operational_checks
        order by created_at desc
        limit 30`,
    ),
    query(
      `select run_token,status,release_id,duration_ms,details,created_at
         from public.portal_recovery_drill_runs
        order by created_at desc
        limit 10`,
    ),
    getMarketplaceWhatsAppQueueStats(),
  ]);

  return {
    releaseId: RELEASE_ID(),
    instanceId: INSTANCE_ID,
    pool: poolSnapshot(),
    latestChecks: checks.rows,
    recoveryDrills: drills.rows,
    whatsappQueue: queue,
    generatedAt: new Date().toISOString(),
  };
}

async function cleanupOperationalHistory() {
  await query("delete from public.portal_operational_checks where created_at < now() - interval '30 days'");
  await query("delete from public.portal_recovery_drill_runs where created_at < now() - interval '180 days'");
}

export function startOperationalMonitoring() {
  if (process.env.CUSTOMER_PORTAL_OPERATIONS_MONITOR_ENABLED === "false") return;
  if (healthTimer || publicProbeTimer || recoveryTimer || cleanupTimer) return;

  healthTimer = setInterval(() => void runOperationalHealthCheck(), 5 * 60_000);
  publicProbeTimer = setInterval(() => void runPublicProductionProbe(), 15 * 60_000);
  recoveryTimer = setInterval(() => void runRecoveryDrill(), 7 * 24 * 60 * 60_000);
  cleanupTimer = setInterval(() => void cleanupOperationalHistory(), 24 * 60 * 60_000);

  healthTimer.unref?.();
  publicProbeTimer.unref?.();
  recoveryTimer.unref?.();
  cleanupTimer.unref?.();

  setTimeout(() => void runOperationalHealthCheck(), 20_000).unref?.();
  setTimeout(() => void runPublicProductionProbe(), 45_000).unref?.();
}

export function stopOperationalMonitoring() {
  for (const timer of [healthTimer, publicProbeTimer, recoveryTimer, cleanupTimer]) {
    if (timer) clearInterval(timer);
  }
  healthTimer = null;
  publicProbeTimer = null;
  recoveryTimer = null;
  cleanupTimer = null;
}
