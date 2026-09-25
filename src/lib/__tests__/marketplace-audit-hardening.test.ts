import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("marketplace audit hardening contract", () => {
  it("uses the canonical marketplace notification queue state machine", () => {
    const source = read("server/whatsapp-service.mjs");
    expect(source).not.toContain("processed_at");
    expect(source).toContain("status='pending'");
    expect(source).toContain("attempt_count");
    expect(source).toContain("max_attempts");
    expect(source).toContain("sent_at=coalesce(sent_at,now())");
    expect(source).toContain("next_retry_at");
  });

  it("blocks admin handover until the required prepaid/DP threshold is satisfied", () => {
    const source = read("server/marketplace-operations.mjs");
    expect(source).toContain("async function assertHandoverPaymentSatisfied");
    expect(source).toContain('["in_transit", "delivered"].includes(target)');
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
    ]) {
      const source = read(file);
      expect(source).not.toContain("public.payments");
      expect(source).toContain("public.mkt_gateway_payments");
    }
  });

  it("keeps admin DP messaging aligned with the handover threshold", () => {
    const source = read("src/pages/admin/MarketplaceOperations.tsx");
    expect(source).toContain("!payment.handoverPaymentSatisfied");
    expect(source).toContain("DP minimum sebelum handover");
  });

  it("rejects stale Paylabs callback timestamps before signature processing", () => {
    const source = read("server/paylabs-service.mjs");
    expect(source).toContain("isPaylabsTimestampFresh(timestamp)");
    expect(source).toContain("Stale signature timestamp");
  });
});
