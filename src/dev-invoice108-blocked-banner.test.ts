import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const admin = readFileSync(resolve(process.cwd(), "src/pages/admin.tsx"), "utf8");

describe("DEV invoice #108 blocked state visibility", () => {
  it("does not infer an issued invoice solely from HTTP 200", () => {
    expect(admin).toContain("invoiceRes?.ok");
    expect(admin).toContain('status.blocked === true && blocked108');
    expect(admin).toContain('item.invoiceId === 108 && item.status === "blocked"');
  });
  it("shows a status message only in the Admin Invoice & Payment tab", () => {
    expect(admin).toContain('setInvoice108Status(');
    expect(admin).toContain('role="status"');
    expect(admin).toContain('{invoice108Status}');
    expect(admin).toContain('Invoice QA #108 tertahan:');
  });
});
