import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { lockShipmentWithPoFirst } from "../server/marketplace-shipment-po-lock.mjs";

const params = (overrides: Record<string, any> = {}) => {
  const calls: string[] = [];
  const readShipment = vi.fn(async () => { calls.push("unlocked shipment lookup"); return { id: 21, po_id: 11 }; });
  const lockPo = vi.fn(async (poId: number) => { calls.push("PO FOR UPDATE"); return { id: poId }; });
  const lockShipment = vi.fn(async () => { calls.push("Shipment FOR UPDATE"); return { id: 21, po_id: 11 }; });
  return { shipmentId: 21, readShipment, lockPo, lockShipment, calls, ...overrides };
};

describe("cross-service Customer Portal PO -> Shipment lock order", () => {
  it("reads shipment only to locate PO, then locks PO before Shipment", async () => {
    const p = params();
    const result = await lockShipmentWithPoFirst(p);
    expect(result).toEqual({ po: { id: 11 }, shipment: { id: 21, po_id: 11 } });
    expect(p.calls).toEqual(["unlocked shipment lookup", "PO FOR UPDATE", "Shipment FOR UPDATE"]);
    expect(p.lockPo).toHaveBeenCalledWith(11);
    expect(p.lockShipment).toHaveBeenCalledWith(21);
  });

  it("rejects a changed shipment-to-PO binding after obtaining the PO lock", async () => {
    const p = params({ lockShipment: vi.fn(async () => ({ id: 21, po_id: 12 })) });
    await expect(lockShipmentWithPoFirst(p)).rejects.toMatchObject({ statusCode: 409 });
    expect(p.lockPo).toHaveBeenCalledWith(11);
  });

  it("does not lock Shipment if the authorized PO lookup fails", async () => {
    const p = params({ lockPo: vi.fn(async () => { throw Object.assign(new Error("Denied"), { statusCode: 404 }); }) });
    await expect(lockShipmentWithPoFirst(p)).rejects.toMatchObject({ statusCode: 404 });
    expect(p.lockShipment).not.toHaveBeenCalled();
  });

  it("refuses missing or invalid PO references before locking", async () => {
    const p = params({ readShipment: vi.fn(async () => ({ id: 21, po_id: null })) });
    await expect(lockShipmentWithPoFirst(p)).rejects.toMatchObject({ statusCode: 409 });
    expect(p.lockPo).not.toHaveBeenCalled();
    expect(p.lockShipment).not.toHaveBeenCalled();
  });

  it("wires the common lock helper into event, POD and Goods Receipt canonical writers", () => {
    const source = readFileSync(resolve(process.cwd(), "server/marketplace-operations.mjs"), "utf8");
    for (const [name, next] of [
      ["async function appendShipmentEvent(", "function mapEvent("],
      ["async function submitPod(", "function mapPod("],
      ["async function createGoodsReceipt(", "async function maybeCompletePo("],
    ]) {
      const start = source.indexOf(name);
      const end = source.indexOf(next, start + 1);
      expect(start).toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(start);
      const body = source.slice(start, end);
      expect(body).toContain("await lockPoThenShipment(db, shipmentId, user, isAdmin)");
      expect(body).not.toContain("loadShipment(shipmentId, user, { client: db, forUpdate: true");
    }
  });
});
