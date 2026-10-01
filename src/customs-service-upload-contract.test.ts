import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("customs service document upload contract", () => {
  const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
  const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");
  const clearance = readFileSync(join(process.cwd(), "src/pages/custom-clearance.tsx"), "utf8");
  const pabean = readFileSync(join(process.cwd(), "src/pages/pabean.tsx"), "utf8");

  it("owns an authenticated private upload route for customs order documents", () => {
    expect(server).toContain('pathname === "/api/portal/order-upload"');
    expect(server).toContain("await requireUser(request, response)");
    expect(server).toContain("uploadOrderDocument");
    expect(server).toContain("objectPath: uploaded.path");
    expect(storage).toContain("export async function uploadOrderDocument");
    expect(storage).toContain("/order-documents/");
    expect(storage).toContain("ensurePrivateBucket(storage)");
  });

  it("keeps both customs forms aligned with private storage constraints", () => {
    for (const source of [clearance, pabean]) {
      expect(source).toContain('xhr.open("POST", "/api/portal/order-upload")');
      expect(source).toContain("const MAX_SIZE_BYTES = 5 * 1024 * 1024");
      expect(source).toContain('accept="application/pdf,image/jpeg,image/png"');
      expect(source).not.toContain(".doc,.docx");
    }
  });

  it("submits both services through the standalone logistic order flow", () => {
    expect(clearance).toContain("useCreateLogisticOrder");
    expect(clearance).toContain('shipmentType: "Custom Clearance Proses"');
    expect(pabean).toContain("useCreateLogisticOrder");
    expect(pabean).toContain('shipmentType: "Pengurusan Pabean / PPJK"');
    expect(clearance).toContain("/logistic-order-success?order=");
    expect(pabean).toContain("/logistic-order-success?order=");
  });
});
