import { describe, expect, it } from "vitest";
import {
  notifyAdmins,
  notifyPortalCustomers,
  resourcePayload,
} from "../server/notification-service.mjs";

type FakeRecord = {
  recipientId: number;
  eventKey: string;
  payload: Record<string, unknown>;
};

function fakeDb(options: { admins?: number[]; failInsert?: boolean } = {}) {
  const records: FakeRecord[] = [];
  const calls: string[] = [];
  const admins = options.admins ?? [101, 102];

  const db = async (sql: string, values: unknown[] = []) => {
    calls.push(sql);
    if (sql.startsWith("savepoint") || sql.startsWith("release savepoint") || sql.startsWith("rollback to savepoint")) {
      return { rows: [], rowCount: 0 };
    }
    if (sql.includes("select id") && sql.includes("role = 'admin'")) {
      return { rows: admins.map((id) => ({ id })) };
    }
    if (sql.includes("insert into public.portal_customer_notifications")) {
      if (options.failInsert) throw new Error("notification provider unavailable");
      const [recipientId, eventKey, , , , rawPayload] = values;
      const payload = JSON.parse(String(rawPayload));
      if (!records.some((record) => record.recipientId === Number(recipientId) && record.eventKey === eventKey)) {
        records.push({ recipientId: Number(recipientId), eventKey: String(eventKey), payload });
      }
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  };

  return { db, records, calls };
}

describe("portal notification contract", () => {
  it("normalizes link/resource fields for customer notifications", async () => {
    const { db, records } = fakeDb();

    await notifyPortalCustomers(db, {
      customerIds: [7],
      eventKey: "po:12:created",
      type: "purchase_order_created",
      title: "PO dibuat",
      message: "PO siap.",
      resourceType: "purchase_order",
      resourceId: 12,
      link: "/marketplace/my-purchase-orders/12",
      payload: { poId: 12 },
    });

    expect(records).toHaveLength(1);
    expect(records[0].payload).toMatchObject({
      audience: "customer",
      resourceType: "purchase_order",
      resourceId: 12,
      link: "/marketplace/my-purchase-orders/12",
      url: "/marketplace/my-purchase-orders/12",
    });
  });

  it("scopes admin notifications to admin recipients and keeps them deduplicated", async () => {
    const { db, records } = fakeDb();
    const input = {
      eventKey: "invoice:33:issued",
      type: "sales_invoice_issued",
      title: "Invoice diterbitkan",
      message: "Invoice siap.",
      resourceType: "invoice",
      resourceId: 33,
      payload: { invoiceId: 33 },
    };

    await notifyAdmins(db, input);
    await notifyAdmins(db, input);

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.recipientId)).toEqual([101, 102]);
    expect(records.every((record) => record.payload.audience === "admin")).toBe(true);
    expect(records.every((record) => record.payload.resourceType === "invoice")).toBe(true);
  });

  it("fails closed when notification storage/provider fails without throwing", async () => {
    const { db, calls } = fakeDb({ failInsert: true });

    await expect(notifyPortalCustomers(db, {
      customerIds: [7],
      eventKey: "shipment:8:arrived",
      type: "shipment_arrived",
      title: "Shipment tiba",
      message: "Shipment tiba.",
      resourceType: "shipment",
      resourceId: 8,
      link: "/marketplace/my-purchase-orders/12",
    })).resolves.toBe(false);

    expect(calls.some((call) => call.startsWith("rollback to savepoint"))).toBe(true);
  });

  it("does not create an unsafe external provider payload", () => {
    expect(resourcePayload({
      audience: "customer",
      resourceType: "shipment",
      resourceId: 8,
      link: "/marketplace/my-purchase-orders/12",
      payload: { provider: "internal" },
    })).toEqual(expect.objectContaining({
      audience: "customer",
      provider: "internal",
      link: "/marketplace/my-purchase-orders/12",
    }));
  });
});