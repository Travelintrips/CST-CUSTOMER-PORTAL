import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  canPollDevVendorWaStatus,
  DEV_VENDOR_QUEUED_STATUS_SELECT_SQL,
  pollDevVendorWaStatus,
  startDevVendorWaStatusPoller,
  stopDevVendorWaStatusPoller,
} from "../server/dev-vendor-wa-status-poller.mjs";

const dev = {
  APP_ENV: "development", NODE_ENV: "test",
  CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "true",
  CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV: "ai-core",
  CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV: "628111116556",
  CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV: "synthetic-client-only",
};
const candidates = [
  { queue_id: 95, rfq_id: 24, vendor_quote_id: 19 },
  { queue_id: 96, rfq_id: 25, vendor_quote_id: 20 },
];

afterEach(async () => {
  await stopDevVendorWaStatusPoller();
  vi.useRealTimers();
});

describe("DEV-only automatic receipt polling uses existing PR #201 service", () => {
  it("fails closed for PROD, mixed mode, no client token, wrong sender or disabled flag", async () => {
    const db = vi.fn(), sync = vi.fn();
    for (const env of [
      { ...dev, APP_ENV: "production" },
      { ...dev, NODE_ENV: "production" },
      { ...dev, CUSTOMER_PORTAL_DEV_VENDOR_WA_ENABLED: "false" },
      { ...dev, CUSTOMER_PORTAL_WA_GATEWAY_DEVICE_ID_DEV: "tenant-pos" },
      { ...dev, CUSTOMER_PORTAL_WA_GATEWAY_SENDER_PHONE_DEV: "628111115357" },
      { ...dev, CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV: "" },
    ]) {
      expect(canPollDevVendorWaStatus(env)).toBe(false);
      expect(await pollDevVendorWaStatus({ env, db, sync })).toEqual({ skipped: "dev_only_guard" });
    }
    expect(db).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
    expect(canPollDevVendorWaStatus(dev)).toBe(true);
  });

  it("reads a bounded batch and uses only the EXISTING status reconciler without WA POST", async () => {
    const db = vi.fn(async (sql: string, values: unknown[]) => {
      expect(sql).toBe(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL);
      expect(values).toEqual([8, 0]);
      return { rows: candidates };
    });
    const sync = vi.fn(async () => ({ updated: true, providerStatus: "sent" }));
    const result = await pollDevVendorWaStatus({ env: dev, db, sync });
    expect(result).toEqual({ checked: 2, updated: 2, deferred: 0, errors: 0, nextCursor: 96 });
    expect(sync).toHaveBeenCalledTimes(2);
    expect(sync).toHaveBeenNthCalledWith(1, {
      queueId: 95, rfqId: 24, quoteId: 19, env: dev,
    });
    expect(sync).toHaveBeenNthCalledWith(2, {
      queueId: 96, rfqId: 25, quoteId: 20, env: dev,
    });
    expect(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL).toContain("n.status='queued'");
    expect(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL).toContain("n.attempt_count=1");
    expect(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL).toContain("n.sent_at is null");
    expect(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL).toContain("r.company_id=1");
    expect(DEV_VENDOR_QUEUED_STATUS_SELECT_SQL).not.toMatch(/insert|update|delete/i);
  });

  it("provider still queued, concurrent CAS loser, or transport errors never retry WhatsApp", async () => {
    const db = vi.fn(async () => ({ rows: candidates }));
    const sync = vi.fn()
      .mockResolvedValueOnce({ updated: false, providerStatus: "queued" })
      .mockRejectedValueOnce(Object.assign(Error("synthetic provider refused"), { statusCode: 502 }));
    const result = await pollDevVendorWaStatus({ env: dev, db, sync });
    expect(result).toEqual({ checked: 2, updated: 0, deferred: 1, errors: 1, nextCursor: 96 });
    expect(db).toHaveBeenCalledTimes(1);
    expect(sync).toHaveBeenCalledTimes(2);
  });

  it("ignores invalid identifiers without calling provider", async () => {
    const db = vi.fn(async () => ({ rows: [{ queue_id: 0, rfq_id: 24, vendor_quote_id: 19 }] }));
    const sync = vi.fn();
    expect(await pollDevVendorWaStatus({ env: dev, db, sync }))
      .toEqual({ checked: 1, updated: 0, deferred: 1, errors: 0, nextCursor: 0 });
    expect(sync).not.toHaveBeenCalled();
  });

  it("stops immediately when no queued candidates exist, and enforces max batch 8", async () => {
    const db = vi.fn(async () => ({ rows: [] }));
    const sync = vi.fn();
    expect(await pollDevVendorWaStatus({ env: dev, db, sync, max: 1000 }))
      .toEqual({ checked: 0, updated: 0, deferred: 0, errors: 0, nextCursor: 0 });
    expect(db.mock.calls[0][1]).toEqual([8, 0]);
    expect(sync).not.toHaveBeenCalled();
  });

  it("rotates the cursor so eight stuck old queues cannot starve a ninth", async () => {
    const nine = Array.from({ length: 9 }, (_, i) => ({
      queue_id: i + 100, rfq_id: 25, vendor_quote_id: 20,
    }));
    const db = vi.fn(async (_sql: string, params: unknown[]) => ({
      rows: nine.filter(x => x.queue_id > Number(params[1])).slice(0, Number(params[0])),
    }));
    const sync = vi.fn(async () => ({ updated: false, providerStatus: "queued" }));
    const first = await pollDevVendorWaStatus({ env: dev, db, sync, cursor: 0 });
    expect(first).toEqual({ checked: 8, updated: 0, deferred: 8, errors: 0, nextCursor: 107 });
    const second = await pollDevVendorWaStatus({ env: dev, db, sync, cursor: first.nextCursor });
    expect(second).toEqual({ checked: 1, updated: 0, deferred: 1, errors: 0, nextCursor: 108 });
    expect(sync).toHaveBeenCalledTimes(9);
    expect(sync.mock.calls[8][0]).toMatchObject({ queueId: 108 });
    await pollDevVendorWaStatus({ env: dev, db, sync, cursor: second.nextCursor });
    expect(db.mock.calls.slice(-2).map(c => c[1])).toEqual([[8, 108], [8, 0]]);
  });

  it("stops before touching the next candidate when shutdown starts mid-batch", async () => {
    let stopped = false;
    const db = vi.fn(async () => ({ rows: candidates }));
    const sync = vi.fn(async () => { stopped = true; return { updated: true }; });
    const result = await pollDevVendorWaStatus({
      env: dev, db, sync, shouldStop: () => stopped,
    });
    expect(result).toEqual({ checked: 2, updated: 1, deferred: 1, errors: 0, nextCursor: 95 });
    expect(sync).toHaveBeenCalledTimes(1);
  });

  it("waits for an active provider check during shutdown, then schedules nothing else", async () => {
    vi.useFakeTimers();
    let release: (() => void) | undefined;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const runner = vi.fn(async () => {
      await gate;
      return { checked: 1, updated: 0, deferred: 0, errors: 0, nextCursor: 95 };
    });
    expect(startDevVendorWaStatusPoller({ env: dev, runner })).toBe(true);
    await vi.advanceTimersByTimeAsync(12_010);
    expect(runner).toHaveBeenCalledTimes(1);
    let stopped = false;
    const closing = stopDevVendorWaStatusPoller().then(() => { stopped = true; });
    await Promise.resolve();
    expect(stopped).toBe(false);
    release?.();
    await closing;
    expect(stopped).toBe(true);
    await vi.advanceTimersByTimeAsync(360_000);
    expect(runner).toHaveBeenCalledTimes(1);
  });

  it("runs a bounded periodic check after DEV readiness, stops at shutdown, never starts in PROD", async () => {
    vi.useFakeTimers();
    const runner = vi.fn(async () => ({ checked: 0, updated: 0, deferred: 0, errors: 0 }));
    expect(startDevVendorWaStatusPoller({ env: { ...dev, NODE_ENV: "production" }, runner })).toBe(false);
    expect(startDevVendorWaStatusPoller({ env: dev, runner })).toBe(true);
    expect(startDevVendorWaStatusPoller({ env: dev, runner })).toBe(false);
    expect(runner).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(12_010);
    expect(runner).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(119_000);
    expect(runner).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_100);
    expect(runner).toHaveBeenCalledTimes(2);
    await stopDevVendorWaStatusPoller();
    await vi.advanceTimersByTimeAsync(240_000);
    expect(runner).toHaveBeenCalledTimes(2);
  });

  it("has no new outbound worker or send route, and is wired into DEV lifecycle only", () => {
    const poller = readFileSync(resolve(process.cwd(), "server/dev-vendor-wa-status-poller.mjs"), "utf8");
    const index = readFileSync(resolve(process.cwd(), "server/index.mjs"), "utf8");
    expect(index).toContain("startDevVendorWaStatusPoller();");
    expect(index).toContain("stopDevVendorWaStatusPoller();");
    expect(index).toContain("} else {\n        // Read provider receipts for queued DEV invites");
    expect(poller).toContain('databaseConnectionSource === "SUPABASE_DATABASE_URL_DEV"');
    expect(poller).toContain('syncDevVendorWhatsAppStatus');
    expect(poller).not.toContain('/v1/messages');
    expect(poller).not.toContain('POST');
    expect(poller).not.toContain('sendDevCustomerPortalGatewayMessage');
  });
});
