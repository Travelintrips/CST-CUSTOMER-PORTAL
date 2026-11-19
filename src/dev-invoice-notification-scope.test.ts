// @ts-nocheck: isolated notification routing QA, no database/WA writes.
import {describe,it,expect} from "vitest";
import {notifyAdmins} from "../server/notification-service.mjs";

const details={
 eventKey:"sales-invoice:201:invoiced",
 type:"sales_invoice_issued",
 title:"Invoice diterbitkan",
 message:"Invoice QA sudah tersedia",
 resourceType:"invoice",
 resourceId:201,
 payload:{invoiceId:201}
};
function makeDb() {
 const queries=[],sent=[];
 const db=async (sql,values=[])=>{
   queries.push({sql,values});
   if(sql.includes("from public.portal_customers")) {
     const scoped=sql.includes("id = any($1::int[])");
     const rows=scoped ? [501,503].filter(id=>values[0].includes(id))
       : [501,503];
     return {rows:rows.map(id=>({id}))};
   }
   if(sql.includes("insert into public.portal_customer_notifications")) {
     sent.push({recipientId:values[0],key:values[1],payload:JSON.parse(values[5])});
     return {rows:[]};
   }
   if(/savepoint|release savepoint|rollback to savepoint/i.test(sql))return {rows:[]};
   throw new Error("UNEXPECTED_DB_QUERY:"+sql);
 };
 return {db,queries,sent};
}
describe("original Portal admin notifier: scoped new Invoice only",()=>{
 it("delivers only to an explicitly selected, verified issuer ID",async()=>{
   const t=makeDb();
   const success=await notifyAdmins(t.db,{...details,recipientIds:[501]});
   expect(success).toBe(true);
   expect(t.sent).toHaveLength(1);
   expect(t.sent[0].recipientId).toBe(501);
   expect(t.sent[0].payload.invoiceId).toBe(201);
   expect(t.queries.find(q=>q.sql.includes("from public.portal_customers")).sql)
     .toContain("id = any($1::int[])");
 });
 it("does not widen a rejected recipient scope to all active Admins",async()=>{
   const t=makeDb();
   expect(await notifyAdmins(t.db,{...details,recipientIds:[]})).toBe(false);
   expect(await notifyAdmins(t.db,{...details,recipientIds:["unverified"]})).toBe(false);
   expect(await notifyAdmins(t.db,{...details,recipientIds:[0]})).toBe(false);
   expect(t.queries).toHaveLength(0);
   expect(t.sent).toHaveLength(0);
 });
 it("preserves untouched generic marketplace/all-admin notifications",async()=>{
   const t=makeDb();
   const success=await notifyAdmins(t.db,{...details,type:"rfq_received",eventKey:"qa-marketplace"});
   expect(success).toBe(true);
   expect(t.sent.map(x=>x.recipientId)).toEqual([501,503]);
   expect(t.queries.find(q=>q.sql.includes("from public.portal_customers")).sql)
     .not.toContain("any($1::int[])");
 });
 it("deduplicates issuer IDs without sending to unrelated Admin",async()=>{
   const t=makeDb();
   expect(await notifyAdmins(t.db,{...details,recipientIds:[501,501]})).toBe(true);
   expect(t.sent.map(x=>x.recipientId)).toEqual([501]);
 });
});
