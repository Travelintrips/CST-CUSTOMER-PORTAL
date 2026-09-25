import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("customer document center", () => {
  it("aggregates only customer-owned operational documents", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    expect(server).toContain('pathname === "/api/portal/me/documents"');
    expect(server).toContain("customer_service_request_documents");
    expect(server).toContain("payment_proof_url is not null");
    expect(server).toContain("trucking_booking_stops");
    expect(server).toContain("trucking_payments");
    expect(server).toContain("portal_customer_id=$1");
    expect(server).toContain("company_id=any($2::int[])");
    expect(server).toContain("signedDocumentUrl(path)");
    expect(server).toContain(".filter((item) => Boolean(item.url))");
  });

  it("renders real operational files instead of placeholder document labels", () => {
    const page = readFileSync(join(process.cwd(), "src/pages/portal-dokumen.tsx"), "utf8");

    expect(page).toContain("/api/portal/me/documents");
    expect(page).toContain("Dokumen Operasional");
    expect(page).toContain("File akan muncul otomatis setelah dokumen, bukti pembayaran, atau POD tersedia.");
    expect(page).toContain('doc.type === "pod"');
    expect(page).toContain('doc.type === "payment_proof"');
    expect(page).not.toContain('["Bill of Lading", "Packing List", "Customs Declaration", "Certificate of Origin", "POD"]');
  });

  it("deep-links document-center invoices to the selected invoice detail", () => {
    const documents = readFileSync(join(process.cwd(), "src/pages/portal-dokumen.tsx"), "utf8");
    const invoices = readFileSync(join(process.cwd(), "src/pages/portal-invoice.tsx"), "utf8");

    expect(documents).toContain('/portal-invoice?invoice=');
    expect(invoices).toContain('new URLSearchParams(search).get("invoice")');
    expect(invoices).toContain("void openDetail(requestedInvoiceId)");
  });
});
