import crypto from "node:crypto";
import { createDedicatedDatabaseClient } from "./db.mjs";

const INSTANCE_ID = `${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const LOCK_NAMESPACE = 1129534544;
const LOCK_KEY = 1112821319;
const RETRY_MS = Math.max(5_000, Number(process.env.CUSTOMER_PORTAL_BACKGROUND_LEADER_RETRY_MS ?? 15_000));

let activeClient = null;
let retryTimer = null;
let stopped = true;
let leader = false;
let acquireCallback = null;
let lostCallback = null;

function scheduleRetry() {
  if (stopped || retryTimer || activeClient) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void attemptLeadership();
  }, RETRY_MS);
  retryTimer.unref?.();
}

async function notifyLost(reason) {
  if (!leader) return;
  leader = false;
  console.warn("[customer-portal-api] background leadership lost", { instanceId: INSTANCE_ID, reason });
  try {
    await lostCallback?.(reason);
  } catch (error) {
    console.error("[customer-portal-api] background leader loss handler failed", error?.message ?? error);
  }
}

async function disposeClient(client) {
  if (!client) return;
  try {
    client.removeAllListeners("error");
    await client.end();
  } catch {}
}

async function attemptLeadership() {
  if (stopped || activeClient) return;

  const client = createDedicatedDatabaseClient();
  activeClient = client;

  client.on("error", (error) => {
    if (activeClient !== client) return;
    activeClient = null;
    void notifyLost(error?.code ?? error?.message ?? "database_connection_error")
      .finally(() => scheduleRetry());
  });

  try {
    await client.connect();
    const result = await client.query(
      "select pg_try_advisory_lock($1::int,$2::int) as acquired",
      [LOCK_NAMESPACE, LOCK_KEY],
    );
    const acquired = result.rows[0]?.acquired === true;

    if (!acquired) {
      activeClient = null;
      await disposeClient(client);
      scheduleRetry();
      return;
    }

    leader = true;
    console.info("[customer-portal-api] background leadership acquired", { instanceId: INSTANCE_ID });
    await acquireCallback?.();
  } catch (error) {
    if (activeClient === client) activeClient = null;
    await disposeClient(client);
    console.warn("[customer-portal-api] background leadership attempt failed", {
      instanceId: INSTANCE_ID,
      error: error?.code ?? error?.message ?? error,
    });
    scheduleRetry();
  }
}

export function startBackgroundLeadership({ onAcquired, onLost } = {}) {
  acquireCallback = onAcquired ?? null;
  lostCallback = onLost ?? null;
  if (!stopped) return;
  stopped = false;
  void attemptLeadership();
}

export async function stopBackgroundLeadership() {
  stopped = true;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  const client = activeClient;
  activeClient = null;
  await notifyLost("shutdown");

  if (client) {
    try {
      await client.query("select pg_advisory_unlock($1::int,$2::int)", [LOCK_NAMESPACE, LOCK_KEY]);
    } catch {}
    await disposeClient(client);
  }
}

export function backgroundLeadershipSnapshot() {
  return { instanceId: INSTANCE_ID, leader };
}
