// @ts-nocheck — DEV-only release preflight with a stub PostgreSQL session.
import {describe,it,expect,vi} from "vitest";
import {
 DEV_CUSTOMER_INVOICE_WRITER_ATTESTATION_SQL,
 DEV_CUSTOMER_INVOICE_WRITER_ROLES,
 isDirectCompanyInvoiceWriterSession,
 requireDirectCompanyInvoiceWriterSession,
} from "../server/dev-customer-invoice-writer-session-guard.mjs";

const session=(company=1,override={})=>{
 const role=DEV_CUSTOMER_INVOICE_WRITER_ROLES[company];
 return {
  db_role:role,session_role:role,bypass_rls:false,
  invoice_rls:true,gl_rls:true,lines_rls:true,ar_rls:true,
  taxes_rls:true,audit_rls:true,outbox_rls:true,
  ...override,
 };
};
const client=(rows)=>({query:vi.fn().mockResolvedValue({rows})});
describe("original Invoice DEV posting refuses unscoped database writers",()=>{
 it("uses read-only PostgreSQL role and effective-RLS introspection",()=>{
  const sql=DEV_CUSTOMER_INVOICE_WRITER_ATTESTATION_SQL;
  expect(sql.toLowerCase()).toContain("row_security_active(");
  expect(sql.toLowerCase()).toContain("rolbypassrls");
  expect(sql).not.toMatch(/\b(insert|update|delete|alter|drop|truncate|set\s+role)\b/i);
 });
 it.each([1,3])("accepts only directly logged-in company %i scoped writer",async company=>{
  expect(isDirectCompanyInvoiceWriterSession(session(company),company)).toBe(true);
  const pg=client([session(company)]);
  const old=process.env.APP_ENV;process.env.APP_ENV="development";
  try{await expect(requireDirectCompanyInvoiceWriterSession(pg,company)).resolves.toBe(true)}
  finally{if(old===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=old}
  expect(pg.query).toHaveBeenCalledTimes(1);
 });
 it.each([
  ["postgres bypass",session(1,{db_role:"postgres",session_role:"postgres",bypass_rls:true})],
  ["wrong company",session(3)],
  ["SET ROLE from global",session(1,{session_role:"postgres"})],
  ["RLS disabled",session(1,{ar_rls:false})],
  ["missing tax RLS",session(1,{taxes_rls:null})],
  ["malformed metadata",null],
 ])("blocks %s rather than guessing permissions",(_label,row)=>{
  expect(isDirectCompanyInvoiceWriterSession(row,1)).toBe(false);
 });
 it("blocks offline/non-DEV environment without asking PostgreSQL",async()=>{
  const pg=client([session()]);
  const old=process.env.APP_ENV;
  process.env.APP_ENV="production";
  try{await expect(requireDirectCompanyInvoiceWriterSession(pg,1))
   .rejects.toMatchObject({statusCode:503})}
  finally{if(old===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=old}
  expect(pg.query).not.toHaveBeenCalled();
 });
 it("blocks missing table/introspection error and never retries privileged role",async()=>{
  const pg={query:vi.fn().mockRejectedValue(new Error("SQL_TABLE_NOT_FOUND"))};
  const old=process.env.APP_ENV;process.env.APP_ENV="development";
  try{await expect(requireDirectCompanyInvoiceWriterSession(pg,1))
   .rejects.toMatchObject({statusCode:503})}
  finally{if(old===undefined)delete process.env.APP_ENV;else process.env.APP_ENV=old}
  expect(pg.query).toHaveBeenCalledTimes(1);
 });
});
