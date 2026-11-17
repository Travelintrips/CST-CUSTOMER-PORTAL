import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const mocks = vi.hoisted(() => ({
  query: vi.fn(async () => ({ rows: [{ pending: 2, sending: 0, retrying: 0, stuck_over_10m: 1 }] })),
  token: vi.fn(async () => ""),
}));
vi.mock("../server/db.mjs", () => ({ query: mocks.query, pool: {} }));
vi.mock("../server/fonnte-config.mjs", () => ({
  resolveCustomerPortalFonnteToken: mocks.token,
}));

import { getMarketplaceWhatsAppQueueStats } from "../server/whatsapp-service.mjs";

const original = {
  APP_ENV: process.env.APP_ENV,
  NODE_ENV: process.env.NODE_ENV,
  CUSTOMER_PORTAL_WA_WORKER_ENABLED: process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED,
};
afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  mocks.query.mockClear();
  mocks.token.mockClear();
});

describe("Marketplace legacy queue readiness matches actual worker lifecycle", () => {
  it("reports OFF on DEV even when legacy worker flag is unset", async () => {
    process.env.APP_ENV = "development";
    process.env.NODE_ENV = "test";
    delete process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED;
    const status = await getMarketplaceWhatsAppQueueStats();
    expect(status).toMatchObject({
      workerEnabled: false, configured: false, pending: 2,
    });
  });
  it("does not mistake a configured legacy token for a running DEV worker", async () => {
    process.env.APP_ENV = "development";
    process.env.NODE_ENV = "test";
    process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED = "true";
    mocks.token.mockResolvedValueOnce("synthetic-token");
    const status = await getMarketplaceWhatsAppQueueStats();
    expect(status).toMatchObject({ configured: true, workerEnabled: false });
  });
  it("allows worker readiness only in production and when not disabled", async () => {
    process.env.APP_ENV = "production";
    process.env.NODE_ENV = "test";
    delete process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED;
    expect((await getMarketplaceWhatsAppQueueStats()).workerEnabled).toBe(true);
    process.env.CUSTOMER_PORTAL_WA_WORKER_ENABLED = "false";
    expect((await getMarketplaceWhatsAppQueueStats()).workerEnabled).toBe(false);
  });
  it("shows DEV Gateway information without misleading Fonnte configuration notices", () => {
    const source = readFileSync(join(process.cwd(), "src/pages/admin/MarketplaceOperations.tsx"), "utf8");
    expect(source).toContain("Worker WhatsApp otomatis tidak berjalan di DEV");
    expect(source).toContain("CST WA Gateway");
    expect(source).not.toContain("Fonnte belum dikonfigurasi");
    expect(source).not.toContain("FONNTE_TOKEN belum tersedia");
  });
});
