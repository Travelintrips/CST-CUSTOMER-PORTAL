import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("marketplace audit hardening contract", () => {
  it("uses the canonical marketplace notification queue state machine", () => {
    const source = read("server/whatsapp-service.mjs");
    expect(source).not.toContain("processed_at");
    expect(source).toContain("status in ('pending','failed','retrying')");
    expect(source).toContain("status='sending'");
    expect(source).toContain("attempt_count");
    expect(source).toContain("max_attempts");
    expect(source).toContain("sent_at=coalesce(sent_at,now())");
    expect(source).toContain("next_retry_at");
    expect(source).toContain("updated_at < now() - interval '10 minutes'");
  });

  it("exposes admin-only WhatsApp queue diagnostics and worker observability", () => {
    const worker = read("server/whatsapp-service.mjs");
    const operations = read("server/marketplace-operations.mjs");
    const server = read("server/index.mjs");
    expect(worker).toContain("getMarketplaceWhatsAppQueueStats");
    expect(worker).toContain("stuck_over_10m");
    expect(operations).toContain("/api/mkt/admin/notification-queue/stats");
    // The single-leader guard uses an idle notification rather than the old
    // `skipped` log phrase; workers must only start after leadership is held.
    expect(server).toContain("WhatsApp worker idle");
    expect(server).toContain("WhatsApp worker cycle");
    expect(server).toContain("startBackgroundLeadership({");
    expect(server).toContain("onAcquired: async () => startBackgroundJobs()");
    expect(server).toContain("onLost: async () => stopBackgroundJobs()");
    const leader = read("server/background-leader.mjs");
    expect(leader).toContain("pg_try_advisory_lock");
    expect(leader).toContain("pg_advisory_unlock");
  });

  it("keeps Marketplace payment/security tables server-only", () => {
    const migration = read("supabase/migrations/20260925110500_harden_marketplace_private_tables.sql");
    for (const table of [
      "mkt_gateway_payments",
      "mkt_notification_queue",
      "mkt_po_payment_proofs",
      "paylabs_configurations",
      "paylabs_payment_methods",
    ]) {
      expect(migration).toContain(`alter table if exists public.${table} enable row level security`);
      expect(migration).toContain(`revoke all on table public.${table} from anon, authenticated`);
      expect(migration).toContain(`grant all on table public.${table} to service_role`);
    }
    expect(migration).toContain("public.payments is intentionally NOT changed");
  });

  it("keeps mkt_notification_queue WhatsApp-only", () => {
    const service = read("server/marketplace-service.mjs");
    const operations = read("server/marketplace-operations.mjs");
    expect(service).not.toContain('for (const channel of ["internal", "whatsapp"])');
    expect(service).toContain("values ($1,'whatsapp'");
    expect(operations).not.toContain("values ($1,'internal'");
  });

  it("blocks admin handover until the required prepaid/DP threshold is satisfied", () => {
    const source = read("server/marketplace-operations.mjs");
    expect(source).toContain("async function assertHandoverPaymentSatisfied");
    expect(source).toContain('["in_transit", "delivered"].includes(target)');
    expect(source).toContain('["departed", "handed_over"].includes(eventType)');
    expect(source).toContain("requiredAmount - totals.receivedAmount");
  });

  it("prevents cumulative shipment allocation from exceeding PO quantities", () => {
    const source = read("server/marketplace-operations.mjs");
    expect(source).toContain("allocatedRows");
    expect(source).toContain("allocatedQty + requestedQty > Number(line.qty)");
    expect(source).toContain("Akumulasi qty shipment melebihi qty PO.");
  });

  it("starts post-receipt due dates only after the whole PO receipt gate is satisfied", () => {
    const source = read("server/marketplace-operations.mjs");
    expect(source).toContain("async function activatePostReceiptPaymentDue");
    expect(source).toContain("all_shipment_items_accepted");
    expect(source).toContain("all_po_qty_allocated");
    expect(source).toContain("await activatePostReceiptPaymentDue(db, shipment.po_id)");
  });

  it("preserves customer identity in RFQ/quotation audit events", () => {
    const source = read("server/marketplace-service.mjs");
    expect(source).toContain('actorType: "customer", action: "customer_approved_quote"');
    expect(source).toContain('actorType: "customer",\n          action: "customer_rejected_quote"');
    expect(source).toContain('"RFQ dikirim customer", { actorType: "customer" }');
  });

  it("isolates marketplace Paylabs rows from the shared payments table", () => {
    for (const file of [
      "server/paylabs-service.mjs",
      "server/marketplace-service.mjs",
      "server/marketplace-operations.mjs",
      "server/admin-portal.mjs",
    ]) {
      const source = read(file);
      expect(source).not.toContain("public.payments");
      expect(source).toContain("public.mkt_gateway_payments");
    }
  });


  it("persists structured payment terms on vendor quotations and consumes them when creating PO", () => {
    const source = read("server/vendor-quote-submission.mjs");
    expect(source).toContain("payment_term_code=$3");
    expect(source).toContain("payment_dp_percent=$4");
    const readPath = read("server/marketplace-service.mjs");
    expect(readPath).toContain("quote.payment_term_code ?? normalizePaymentTerm(quote.payment_terms)");
    expect(readPath).toContain("normalizeDpPercent(quote.payment_dp_percent) ?? dpPercentFromTerm(quote.payment_terms)");
  });

  it("returns vendor quotation dates as calendar strings, preserving save/submit round trips", () => {
    const service = read("server/marketplace-service.mjs");
    const route = service.slice(
      service.indexOf("async function handleVendorQuote"),
      service.indexOf("async function inviteVendorsToExistingRfq"),
    );
    expect(route).toContain("to_char(q.quotation_date,'YYYY-MM-DD') as quotation_date_text");
    expect(route).toContain("quotationDate: quote.quotation_date_text ?? null");
    expect(route).not.toContain("quotationDate: quote.quotation_date, paymentTerms:");
    const vendorUi = read("src/pages/mkt-vendor-quote.tsx");
    expect(vendorUi).toContain("quotationDate: vqd.quote.quotationDate");
  });

  it("checks completed vendor replays without locks and locks RFQ first on new writes", () => {
    const service = read("server/marketplace-service.mjs");
    const route = service.slice(
      service.indexOf("async function handleVendorQuote"),
      service.indexOf("async function inviteVendorsToExistingRfq"),
    );
    const preview = route.indexOf("const preview = await loadQuote(db)");
    const replayCheck = route.indexOf('["submitted", "selected"].includes(preview.status)');
    const rfqLock = route.indexOf("const lockedRfq = await loadAdminRfq(preview.rfq_id");
    const quoteLock = route.indexOf("const lockedQuote = await loadQuote(db, true)");
    expect(preview).toBeGreaterThan(-1);
    expect(replayCheck).toBeGreaterThan(preview);
    expect(rfqLock).toBeGreaterThan(replayCheck);
    expect(quoteLock).toBeGreaterThan(rfqLock);
    expect(route.slice(replayCheck, rfqLock)).toContain("return;");
  });

  it("keeps admin DP messaging aligned with the handover threshold", () => {
    const source = read("src/pages/admin/MarketplaceOperations.tsx");
    expect(source).toContain("!payment.handoverPaymentSatisfied");
    expect(source).toContain("DP minimum sebelum handover");
  });

  it("forwards the selected Paylabs method to the H5 payment request", () => {
    const source = read("server/paylabs-service.mjs");
    expect(source).toContain("paymentType: method.code");
    expect(source).toContain("methods.find((item) => item.code === requestedMethod)");
  });

  it("rejects stale Paylabs callback timestamps before signature processing", () => {
    const source = read("server/paylabs-service.mjs");
    expect(source).toContain("isPaylabsTimestampFresh(timestamp)");
    expect(source).toContain("Stale signature timestamp");
  });
});
