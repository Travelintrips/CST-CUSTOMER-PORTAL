import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { persistPodWithCommitReconciliation } from "../server/marketplace-pod-commit-safety.mjs";

const path = "marketplace-pod/po-11/shipment-21/pr186-temporary.png";
const otherPath = "marketplace-pod/po-11/shipment-21/pr186-committed-other.png";

function args(overrides: Record<string, any> = {}) {
  return {
    path,
    persist: vi.fn(async (_mark: () => void) => ({ alreadyProcessed: false })),
    discard: vi.fn(async () => {}),
    readStoredReference: vi.fn(async () => null),
    reportUncertain: vi.fn(),
    ...overrides,
  };
}

describe("POD staged-object cleanup when PostgreSQL COMMIT is uncertain", () => {
  it("deletes staged POD after a known pre-COMMIT failure", async () => {
    const failure = Error("RLS denied before COMMIT");
    const x = args({ persist: vi.fn(async () => { throw failure; }) });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toBe(failure);
    expect(x.discard).toHaveBeenCalledOnce();
    expect(x.readStoredReference).not.toHaveBeenCalled();
  });

  it("does not delete a file referenced by a committed event after lost COMMIT ack", async () => {
    const failure = Error("connection dropped after commit");
    const x = args({
      persist: vi.fn(async (mark: () => void) => { mark(); throw failure; }),
      readStoredReference: vi.fn(async () => ({ attachment_object_path: path })),
    });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toBe(failure);
    expect(x.readStoredReference).toHaveBeenCalledOnce();
    expect(x.discard).not.toHaveBeenCalled();
    expect(x.reportUncertain).toHaveBeenCalledWith("commit_outcome_unconfirmed");
  });

  it("conservatively preserves file if DB readback sees no committed row yet", async () => {
    const x = args({ persist: vi.fn(async (mark: () => void) => {
      mark();
      throw Error("COMMIT ack lost");
    }) });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toThrow("COMMIT ack lost");
    expect(x.discard).not.toHaveBeenCalled();
    expect(x.reportUncertain).toHaveBeenCalledWith("commit_outcome_unconfirmed");
  });

  it("only deletes the losing staged object if the unique key committed a DIFFERENT path", async () => {
    const x = args({
      persist: vi.fn(async (mark: () => void) => {
        mark();
        throw Error("COMMIT ack lost");
      }),
      readStoredReference: vi.fn(async () => ({ attachment_object_path: otherPath })),
    });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toThrow("COMMIT ack lost");
    expect(x.discard).toHaveBeenCalledOnce();
    expect(x.reportUncertain).not.toHaveBeenCalled();
  });

  it("never deletes the object when reconciliation DB is unavailable", async () => {
    const x = args({
      persist: vi.fn(async (mark: () => void) => { mark(); throw Error("COMMIT ack lost"); }),
      readStoredReference: vi.fn(async () => { throw Error("DB unavailable"); }),
    });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toThrow("COMMIT ack lost");
    expect(x.discard).not.toHaveBeenCalled();
    expect(x.reportUncertain).toHaveBeenCalledWith("commit_readback_unavailable");
  });

  it("cleans staged duplicate only after a confirmed replay success", async () => {
    const x = args({ persist: vi.fn(async () => ({ alreadyProcessed: true })) });
    await expect(persistPodWithCommitReconciliation(x)).resolves.toEqual({ alreadyProcessed: true });
    expect(x.discard).toHaveBeenCalledOnce();
  });

  it("keeps the newly committed file on a confirmed successful creation", async () => {
    const x = args();
    await expect(persistPodWithCommitReconciliation(x)).resolves.toEqual({ alreadyProcessed: false });
    expect(x.discard).not.toHaveBeenCalled();
  });

  it("does not mask the original DB error if object cleanup itself fails", async () => {
    const failure = Error("permission denied before commit");
    const x = args({
      persist: vi.fn(async () => { throw failure; }),
      discard: vi.fn(async () => { throw Error("storage temporarily offline"); }),
    });
    await expect(persistPodWithCommitReconciliation(x)).rejects.toBe(failure);
    expect(x.reportUncertain).toHaveBeenCalledWith("cleanup_failed");
  });

  it("sets the uncertainty marker immediately before PostgreSQL COMMIT", () => {
    const src = readFileSync(resolve(process.cwd(),"server/marketplace-operations.mjs"),"utf8");
    const a=src.indexOf("async function withTransaction(");
    const b=src.indexOf("async function loadPo(",a);
    expect(a).toBeGreaterThan(0);
    const fragment=src.slice(a,b);
    expect(fragment.indexOf("beforeCommit?.();")).toBeLessThan(fragment.indexOf('await client.query("commit");'));
    expect(fragment.indexOf("beforeCommit?.();")).toBeGreaterThan(fragment.indexOf("await work(db)"));
    const pod=src.slice(src.indexOf("async function submitPod("), src.indexOf("function mapPod("));
    expect(pod).toContain("persist: (beforeCommit) => withTransaction(");
    expect(pod).toContain("readStoredReference: async () =>");
    expect(pod).toContain("idempotency_key=$2 limit 1");
  });
});
