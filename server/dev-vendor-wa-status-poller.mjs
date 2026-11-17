// Bounded DEV-only Gateway receipt polling; invokes existing PR #201 status service.
// No WhatsApp send, no retry, no legacy worker or PROD database writes.
import { query, databaseEnvironment, databaseConnectionSource } from "./db.mjs";
import { syncDevVendorWhatsAppStatus } from "./dev-vendor-wa-status.mjs";
import { resolveDevCustomerPortalGatewayToken } from "./dev-vendor-wa-gateway.mjs";

export function canPollDevVendorWaStatus(env = process.env) {
  return env.APP_ENV === "development" && env.NODE_ENV !== "production"
    && databaseEnvironment === "development"
    && databaseConnectionSource === "SUPABASE_DATABASE_URL_DEV"
    && env.CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED === "true"
    && env.CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV === "ai-core"
    && String(env.CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV ?? "").endsWith("6556")
    && Boolean(resolveDevCustomerPortalGatewayToken(env));
}

export const DEV_VENDOR_QUEUED_STATUS_SELECT_SQL = `
select n.id as queue_id, n.rfq_id, n.vendor_quote_id
  from public.mkt_notification_queue n
  join public.mkt_vendor_quotes v on v.id=n.vendor_quote_id and v.rfq_id=n.rfq_id
  join public.mkt_rfqs r on r.id=v.rfq_id
  join public.suppliers s on s.id=v.vendor_id
 where n.status='queued' and n.attempt_count=1 and n.sent_at is null
   and n.channel='whatsapp' and n.event_type='rfq_vendor_invited'
   and n.recipient_type='vendor' and n.recipient_id=v.vendor_id
   and r.company_id=1 and s.company_id=r.company_id
   and n.payload_json->'gateway_delivery'->>'provider'='cst-wa-gateway'
   and n.payload_json->'gateway_delivery'->>'message_id' is not null
   and n.id > $2::integer
 order by n.id asc limit $1::integer`;

export async function pollDevVendorWaStatus({
  env = process.env, db = query, sync = syncDevVendorWhatsAppStatus,
  max = 8, cursor = 0, shouldStop = () => false,
} = {}) {
  if (!canPollDevVendorWaStatus(env)) return { skipped: "dev_only_guard" };
  const limit = Math.min(8, Math.max(1, Math.trunc(Number(max)) || 1));
  const afterId = Number.isSafeInteger(Number(cursor)) && Number(cursor) > 0
    ? Number(cursor) : 0;
  let candidates = (await db(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL, [limit, afterId])).rows ?? [];
  if (!candidates.length && afterId > 0 && !shouldStop()) {
    // Wrap to oldest queued ID, preventing stuck old candidates from starving newer ones.
    candidates = (await db(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL, [limit, 0])).rows ?? [];
  }
  let updated = 0, deferred = 0, errors = 0, nextCursor = candidates.length ? afterId : 0;
  for (let i = 0; i < candidates.length; i += 1) {
    if (shouldStop()) {
      deferred += candidates.length - i;
      break;
    }
    const row = candidates[i];
    if (!Number.isSafeInteger(Number(row.queue_id)) || Number(row.queue_id) <= 0
      || ![row.rfq_id, row.vendor_quote_id].every(
        n => Number.isSafeInteger(Number(n)) && Number(n) > 0)) {
      deferred += 1;
      continue;
    }
    nextCursor = Number(row.queue_id);
    try {
      const receipt = await sync({
        queueId: Number(row.queue_id),
        rfqId: Number(row.rfq_id),
        quoteId: Number(row.vendor_quote_id),
        env,
      });
      if (receipt?.updated === true) updated += 1;
      else deferred += 1;
    } catch {
      errors += 1; // No WhatsApp retry; only a later GET receipt check.
    }
  }
  return { checked: candidates.length, updated, deferred, errors, nextCursor };
}

let scheduled = null, active = null, stopping = false, cursor = 0;

export function startDevVendorWaStatusPoller({
  env = process.env, runner = pollDevVendorWaStatus,
} = {}) {
  if (scheduled || active || !canPollDevVendorWaStatus(env)) return false;
  stopping = false;
  cursor = 0;
  const schedule = (delayMs) => {
    if (stopping) return;
    scheduled = setTimeout(() => { scheduled = null; void tick(); }, delayMs);
    scheduled.unref?.();
  };
  const tick = () => {
    if (stopping || active || !canPollDevVendorWaStatus(env)) return;
    const task = (async () => {
      try {
        const result = await runner({ env, cursor, shouldStop: () => stopping });
        if (Number.isSafeInteger(result?.nextCursor)) cursor = result.nextCursor;
        if (result?.updated > 0 || result?.errors > 0) {
          console.info("[customer-portal-api] DEV vendor WA provider receipt", {
            checked: result.checked, updated: result.updated, errors: result.errors,
          });
        }
      } catch {
        console.warn("[customer-portal-api] DEV vendor WA receipt check deferred");
      }
    })();
    active = task;
    void task.finally(() => {
      if (active === task) active = null;
      // Wait 120s AFTER completion, not from startup; max 8 receipts/120s.
      schedule(120_000);
    });
  };
  schedule(12_000);
  return true;
}

export async function stopDevVendorWaStatusPoller() {
  stopping = true;
  if (scheduled) clearTimeout(scheduled);
  scheduled = null;
  // Wait for current GET/DB operation before the pool is closed by shutdown.
  if (active) await active;
}
