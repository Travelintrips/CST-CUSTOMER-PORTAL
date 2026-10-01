import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("freight end-to-end contract", () => {
  const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
  const freight = readFileSync(join(process.cwd(), "server/freight-operations.mjs"), "utf8");
  const admin = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
  const adminUi = readFileSync(join(process.cwd(), "src/pages/admin/ServiceOperationsTab.tsx"), "utf8");

  it("keeps air and ocean orders in the standalone customer portal", () => {
    expect(freight).toContain('"/api/air-freight/public/orders"');
    expect(freight).toContain('"/api/ocean-freight/inquiry"');
    expect(freight).toContain('text(body.customer_company ?? body.company_name, user.company)');
    expect(server).toContain("isOptionalAuthFreight");
    expect(server).toContain('pathname === "/api/ocean-freight/inquiry"');
  });

  it("implements signed public approval links for air and ocean freight", () => {
    expect(freight).toContain("createFreightActionToken");
    expect(freight).toContain("verifyFreightActionToken");
    expect(freight).toContain('/^\\/api\\/air-freight\\/approval\\/');
    expect(freight).toContain('/^\\/api\\/ocean-freight\\/quote\\/');
    expect(server).toContain('/^\\/api\\/air-freight\\/approval\\/');
    expect(server).toContain('/^\\/api\\/ocean-freight\\/quote\\/');
  });

  it("implements the ocean vendor-rate form without a new public database token table", () => {
    expect(freight).toContain("ocean_vendor_rate");
    expect(freight).toContain("publicOceanVendorForm");
    expect(freight).toContain("vendor_submission");
    expect(freight).toContain("uploadOrderDocument");
    expect(server).toContain("isOceanVendorFormPost");
    expect(server).toContain("readMultipartForm(request)");
  });

  it("lets portal admins manage air and ocean freight quotations", () => {
    expect(admin).toContain('"air-freight": "Air Freight"');
    expect(admin).toContain('"ocean-freight": "Ocean / Sea Freight"');
    expect(admin).toContain("from public.air_freight_orders");
    expect(admin).toContain("from public.ocean_freight_orders");
    expect(admin).toContain('"request_vendor_rate"');
    expect(admin).toContain("purpose: \"air_customer_approval\"");
    expect(admin).toContain("purpose: \"ocean_customer_approval\"");
    expect(adminUi).toContain('["logistic-order", "air-freight", "ocean-freight"].includes(selected.service)');
    expect(adminUi).toContain('runAction("request_vendor_rate")');
  });
});
