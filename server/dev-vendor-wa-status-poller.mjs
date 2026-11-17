// Bounded DEV-only polling of Gateway receipts for already-queued vendor invites.
// Reuses the existing PR #201 service; it cannot send a WhatsApp message.
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
 order by n.id asc limit $1::integer`;

export async function pollDevVendorWaStatus({
  env = process.env, db = query, sync = syncDevVendorWhatsAppStatus, max = 8,
} = {}) {
  if (!canPollDevVendorWaStatus(env)) return { skipped: "dev_only_guard" };
  const limit = Math.min(8, Math.max(1, Math.trunc(Number(max)) || 1));
  const result = await db(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL, [limit]);
  const candidates = result.rows ?? [];
  let updated = 0, deferred = 0, errors = 0;
  for (const row of candidates) {
    if (![row.queue_id, row.rfq_id, row.vendor_quote_id]
      .every(n => Number.isSafeInteger(Number(n)) && Number(n) > 0)) {
      deferred += 1;
      continue;
    }
    try {
      const receipt = await sync({
        queueId: Number(row.queue_id),
        rfqId: Number(row.rfq_id),
        quoteId: Number(row.vendor_quote_id),
        env,
      });
      if (receipt?.updated === true) updated += 1;
      else deferred += 1; // Gateway still queued; do not send again.
    } catch {
      errors += 1; // Gateway refused, CAS lost, or transient error; no WA retry.
    }
  }
  return { checked: candidates.length, updated, deferred, errors };
}

let timer = null, startup = null, busy = false;

export function startDevVendorWaStatusPoller({ env = process.env, runner = pollDevVendorWaStatus } = {}) {
  if (timer || !canPollDevVendorWaStatus(env)) return false;
  const tick = async () => {
    if (busy || !canPollDevVendorWaStatus(env)) return;
    busy = true;
    try {
      const result = await runner({ env });
      if (result.updated > 0 || result.errors > 0) {
        console.info("[customer-portal-api] DEV vendor WA provider receipt", result);
      }
    } catch {
      console.warn("[customer-portal-api] DEV vendor WA receipt check deferred");
    } finally { busy = false; }
  };
  timer = setInterval(() => void tick(), 120_000);
  timer.unref?.();
  startup = setTimeout(() => { startup = null; void tick(); }, 12_000);
  startup.unref?.();
  return true;
}

export function stopDevVendorWaStatusPoller() {
  if (timer) clearInterval(timer);
  if (startup) clearTimeout(startup);
  timer = null;
  startup = null;
}
