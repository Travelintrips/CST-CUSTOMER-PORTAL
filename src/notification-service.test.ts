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

function fakeDb(options: {
  admins?: number[];
  companyAdmins?: Record<number, number[]>;
  failInsert?: boolean;
  failRecipientLookup?: boolean;
} = {}) {
  const records: FakeRecord[] = [];
  const calls: string[] = [];
  const admins = options.admins ?? [101, 102];

  const db = async (sql: string, values: unknown[] = []) => {
    calls.push(sql);
    if (sql.startsWith("savepoint") || sql.startsWith("release savepoint") || sql.startsWith("rollback to savepoint")) {
      return { rows: [], rowCount: 0 };
    }
    if (sql.includes("join public.users u") && sql.includes("from public.portal_customers pc")) {
      if (options.failRecipientLookup) throw new Error("Scoped company source unavailable");
      const company = Number(values[0]);
      return { rows: (options.companyAdmins?.[company] ?? []).map((id) => ({ id })) };
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

  it("sends an issued Invoice only to the authorized Portal issuer without scanning all admins", async () => {
    const { db, records, calls } = fakeDb({ admins: [101, 102, 103] });
    const result = await notifyAdmins(db, {
      explicitAdminIds: [101, 101],
      eventKey: "sales-invoice:201:invoiced",
      type: "sales_invoice_issued",
      title: "Invoice diterbitkan",
      message: "Invoice 201 diterbitkan.",
      resourceType: "invoice",
      resourceId: 201,
      payload: { invoiceId: 201 },
    });
    expect(result).toBe(true);
    expect(records.map((r) => r.recipientId)).toEqual([101]);
    expect(records[0].payload).toMatchObject({ audience: "admin", invoiceId: 201 });
    expect(calls.some((sql) => sql.includes("from public.portal_customers"))).toBe(false);
  });

  it.each([
    { company: 1, recipients: [101] },
    { company: 3, recipients: [101, 103] },
  ])("limits company $company payment notifications to authorized Owner/staff", async ({company, recipients}) => {
    const {db, records, calls} = fakeDb({
      admins: [101, 102, 103, 104],
      companyAdmins: {1:[101],3:[101, 103]},
    });
    const posted = await notifyAdmins(db, {
      scopeCompanyId: company,
      eventKey: "sales-payment:500:submitted",
      type: "sales_payment_submitted",
      title: "Payment customer masuk",
      message: "Customer mengajukan pembayaran.",
      resourceType: "payment",
      resourceId: 500,
      payload: {paymentId:500,invoiceId:201},
    });
    expect(posted).toBe(true);
    expect(records.map((r)=>r.recipientId)).toEqual(recipients);
    expect(records.every(r=>r.payload.audience==="admin" && r.payload.invoiceId===201)).toBe(true);
    const source = calls.find((sql)=>sql.includes("join public.users u"));
    expect(source).toContain("u.role = 'super_admin'");
    expect(source).toContain("u.system_role = 'super_admin'");
    expect(source).toContain("u.company_id = $1");
    expect(source).toContain("pcm.is_active = true");
    expect(calls.some((sql)=>sql.includes("select id") && sql.includes("role = 'admin'"))).toBe(false);
    expect(records.every((r)=>r.recipientId!==102 && r.recipientId!==104)).toBe(true);
  });

  it("scopes payment status updates to the same authorized company Admins", async () => {
    const {db, records} = fakeDb({admins:[101,102,103],companyAdmins:{1:[101]}});
    const result = await notifyAdmins(db,{
      scopeCompanyId:1,
      eventKey:"sales-payment:500:paid",
      type:"sales_payment_status_changed",
      title:"Status payment berubah",
      message:"Pembayaran telah dikonfirmasi",
      resourceType:"payment",
      resourceId:500,
      payload:{paymentId:500,invoiceId:201,paymentStatus:"paid"},
    });
    expect(result).toBe(true);
    expect(records.map(r=>r.recipientId)).toEqual([101]);
    expect(records[0].payload.paymentStatus).toBe("paid");
  });

  it.each([0,4,null,NaN])("denies unknown payment company %s with no global Admin fallback",async(company)=>{
    const {db,records,calls} = fakeDb({admins:[101,102,103],companyAdmins:{1:[101]}});
    const accepted = await notifyAdmins(db,{
      scopeCompanyId:company,
      eventKey:"sales-payment:500:paid",
      type:"sales_payment_status_changed",
      title:"Status",
      message:"No company scope",
      resourceType:"payment",resourceId:500,
    });
    expect(accepted).toBe(false);
    expect(records).toHaveLength(0);
    expect(calls.every((s)=>!s.includes("from public.portal_customers"))).toBe(true);
  });

  it("does not broaden recipients when scoped Owner or company grants are unavailable",async()=>{
    for(const options of [
      {admins:[101,102],companyAdmins:{1:[]}},
      {admins:[101,102],failRecipientLookup:true},
      {admins:[101,102],companyAdmins:{1:Array.from({length:33},(_,i)=>i+1)}},
    ]){
      const {db,records,calls}=fakeDb(options);
      const result=await notifyAdmins(db,{
        scopeCompanyId:1,
        eventKey:"sales-payment:100:submitted",
        type:"sales_payment_submitted",
        title:"Payment masuk",
        message:"Uji tidak ada penerima",
        resourceType:"payment",resourceId:100,
      });
      expect(result).toBe(false);
      expect(records).toHaveLength(0);
      expect(calls.some(sql=>sql.includes("select id") && sql.includes("role = 'admin'"))).toBe(false);
    }
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