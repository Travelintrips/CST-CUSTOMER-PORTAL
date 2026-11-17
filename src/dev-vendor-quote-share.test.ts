import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildDevVendorQuoteShare } from "../server/vendor-quote-share.mjs";

const row = {
  id: 18,
  rfq_id: 23,
  vendor_id: 24,
  status: "invited",
  token: "a".repeat(64),
  valid_until: "2026-11-23T18:19:25Z",
  invite_not_expired: true,
  supplier_active: true,
  supplier_phone: "081234567890",
  supplier_name: "PT Cahaya Sejati Teknologi",
  contact_person: "Authorized Vendor PIC",
  rfq_number: "RFQ-TEST-SYNTHETIC",
};
const dev = { APP_ENV: "development" };
function share(override = {}, environment = dev) {
  return buildDevVendorQuoteShare({
    row: { ...row, ...override }, rfqId: 23, quoteId: 18, env: environment,
  });
}

describe("DEV-only admin bearer link for existing vendor quotation", () => {
  it("returns a link to the SAME existing quote with masked recipient", () => {
    const s = share();
    expect(s).toMatchObject({
      rfqId: 23, quoteId: 18, rfqNumber: "RFQ-TEST-SYNTHETIC",
      supplierName: "PT Cahaya Sejati Teknologi",
      recipientPhoneLast4: "7890",
      quotePath: "/mkt-vendor-quote/" + "a".repeat(64),
    });
    expect(s).not.toHaveProperty("token");
    expect(s).not.toHaveProperty("recipientPhone");
    expect(s).not.toHaveProperty("waSent");
  });

  it("denies all non-DEV environments", () => {
    expect(() => share({}, { APP_ENV: "production" })).toThrow(/DEV/);
  });

  it("rejects an unmatching RFQ or quote ID", () => {
    expect(() => share({ rfq_id: 24 })).toThrow(/tidak ditemukan/);
    expect(() => share({ id: 19 })).toThrow(/tidak ditemukan/);
  });

  it("denies expired, terminal, inactive or malformed quotes", () => {
    expect(() => share({ invite_not_expired: false })).toThrow(/kedaluwarsa/);
    expect(() => share({ status: "submitted" })).toThrow(/tidak membutuhkan/);
    expect(() => share({ supplier_active: false })).toThrow(/tidak aktif/);
    expect(() => share({ token: "" })).toThrow(/tidak valid/);
  });

  it("requires valid Indonesian mobile and a saved PIC", () => {
    expect(() => share({ supplier_phone: null })).toThrow(/WhatsApp/);
    expect(() => share({ supplier_phone: "xyz" })).toThrow(/WhatsApp/);
    expect(() => share({ contact_person: "" })).toThrow(/PIC/);
  });

  it("routes only through existing Admin authorization and no DB mutation", () => {
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    const handler = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const start = handler.indexOf("const vendorShareMatch = url.pathname.match(");
    const end = handler.indexOf("const detailMatch = url.pathname.match(", start);
    const block = handler.slice(start, end);
    expect(index).toContain("await requireAdmin(request, response)");
    expect(index).toContain("vendor-routing(?:\\/(?:invite-link|whatsapp-readiness|send-whatsapp|whatsapp-sync))?");
    expect(block).toContain('request.method === "GET"');
    expect(block).toContain('process.env.APP_ENV !== "development"');
    expect(block).toContain('buildDevVendorQuoteShare');
    expect(block).toContain('response.setHeader("Cache-Control", "no-store")');
    expect(block).not.toMatch(/\b(update|insert|delete)\s+public\./i);
    expect(block).not.toContain("sendFonnteMessage");
    expect(block).not.toContain("sendGatewayMessage");
  });

  it("shows one manual copy button without pretending WhatsApp was sent", () => {
    const client = readFileSync(resolve(process.cwd(), "src/components/admin/MarketplaceVendorAssignment.tsx"), "utf8");
    expect(client).toContain("Salin Undangan Vendor");
    expect(client).toContain("navigator.clipboard.writeText(message)");
    expect(client).toContain("belum terkirim otomatis");
    expect(client).toContain("Pastikan nomor PIC berakhiran");
    expect(client).toContain('aria-label="Undangan vendor untuk disalin"');
  });
});
