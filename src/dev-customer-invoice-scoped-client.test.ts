// @ts-nocheck — isolated parser/connection-factory tests, no real DB or credentials.
import {describe,it,expect,vi} from "vitest";
import {
 DEV_CUSTOMER_INVOICE_COMPANIES,
 DEV_CUSTOMER_INVOICE_CA_FILE,
 isDevInvoiceScopedWriterRequested,
 parseDevInvoiceScopedWriterDsn,
 openDevCompanyInvoiceWriter,
} from "../server/dev-customer-invoice-scoped-client.mjs";

const REF="xssrfshdrtdfupgqwfdw";
const url=(company=1,overrides={})=>{
 const role=DEV_CUSTOMER_INVOICE_COMPANIES[company].role;
 const u=new URL("postgresql://"+role+"."+REF+
  ":synthetic-only@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres");
 u.searchParams.set("sslmode","verify-full");
 u.searchParams.set("sslrootcert",DEV_CUSTOMER_INVOICE_CA_FILE);
 for(const [key,value] of Object.entries(overrides)){
  if(value===null)u.searchParams.delete(key);
  else if(key==="hostname"||key==="username"||key==="port"||key==="pathname")u[key]=value;
  else u.searchParams.set(key,String(value));
 }
 return u.toString();
};
const env=(overrides={})=>({
 APP_ENV:"development",NODE_ENV:"development",
 CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"true",
 CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:url(1),
 CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:url(3),
 ...overrides,
});
const admin={id:15,role:"admin",email:"qa@example.invalid"};
const fakeCa="-----BEGIN CERTIFICATE-----\nQA ONLY\n-----END CERTIFICATE-----";
describe("DEV scoped Customer Invoice client, no privileged writer fallback",()=>{
 it("requires DEV, all 3 flags and authenticated Portal Admin",()=>{
  expect(isDevInvoiceScopedWriterRequested(env())).toBe(true);
  for(const key of ["APP_ENV","NODE_ENV",
   "CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
   "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
   "CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV"]){
   const e=env({[key]:key.endsWith("ENV")?"production":"false"});
   expect(isDevInvoiceScopedWriterRequested(e)).toBe(false);
  }
 });
 it.each([1,3])("accepts only exact company %s login with pinned CA path",company=>{
  expect(parseDevInvoiceScopedWriterDsn(url(company),company).role)
   .toBe(DEV_CUSTOMER_INVOICE_COMPANIES[company].role);
 });
 it("accepts exact CST-DEV direct host only with its unsuffixed role",()=>{
  const direct=url(1,{
    hostname:"db."+REF+".supabase.co",
    username:DEV_CUSTOMER_INVOICE_COMPANIES[1].role,
  });
  expect(parseDevInvoiceScopedWriterDsn(direct,1).companyId).toBe(1);
 });
 it.each([
  ["other project",url(1,{hostname:"db.nzdweipzckfszczzqtuw.supabase.co"})],
  ["wrong host",url(1,{hostname:"hostile.example.invalid"})],
  ["postgres role",url(1,{username:"postgres."+REF})],
  ["wrong-company role",url(3)],
  ["transaction pooler port",url(1,{port:"6543"})],
  ["other DB",url(1,{pathname:"/other"})],
  ["TLS weakened",url(1,{sslmode:"require"})],
  ["TLS disabled",url(1,{sslmode:"disable"})],
  ["untrusted CA",url(1,{sslrootcert:"/tmp/unverified.crt"})],
  ["untrusted extra parameter",url(1,{host:"evil.example.invalid"})],
 ])("rejects %s",(_why,value)=>{
  expect(()=>parseDevInvoiceScopedWriterDsn(value,1)).toThrow();
 });
 it("selects company 3 from DB, ignoring any request/body company choice",async()=>{
  const query=vi.fn(async()=>({rows:[{company_id:3}]}));
  const connect=vi.fn(),end=vi.fn();
  let clientOptions;
  class MockClient{
    constructor(value){clientOptions=value}
    async connect(){connect()}
    async end(){end()}
  }
  const selected=await openDevCompanyInvoiceWriter({
    invoiceId:197,portalUser:admin,companyId:1,lookupCompany:query,
    env:env(),ClientCtor:MockClient,readCa:async()=>fakeCa,
  });
  expect(selected.companyId).toBe(3);
  expect(query).toHaveBeenCalledWith(
   expect.stringContaining("from public.sales_documents"),[197]);
  expect(clientOptions.connectionString).toBe(url(3));
  expect(clientOptions.ssl.rejectUnauthorized).toBe(true);
  expect(connect).toHaveBeenCalledTimes(1);
  expect(end).not.toHaveBeenCalled();
  await selected.client.end();
  expect(end).toHaveBeenCalledTimes(1);
 });
 it("does not call lookup or open a client if flags are OFF or Admin missing",async()=>{
  const lookup=vi.fn();
  const common={invoiceId:195,portalUser:admin,lookupCompany:lookup,readCa:async()=>fakeCa};
  await expect(openDevCompanyInvoiceWriter({
    ...common,env:env({CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false"}),
  })).rejects.toMatchObject({statusCode:503});
  await expect(openDevCompanyInvoiceWriter({
    ...common,env:env(),portalUser:{id:3,role:"customer"},
  })).rejects.toMatchObject({statusCode:503});
  expect(lookup).not.toHaveBeenCalled();
 });
 it.each([[0,[]],[2,[{company_id:1},{company_id:3}]],[4,[{company_id:4}]]])
 ("rejects unavailable or ambiguous DB company %i",async(_n,rows)=>{
  await expect(openDevCompanyInvoiceWriter({
    invoiceId:195,portalUser:admin,env:env(),
    lookupCompany:async()=>({rows}),readCa:async()=>fakeCa,
  })).rejects.toMatchObject({statusCode:503});
 });
 it("never substitutes global postgres URL when the selected role DSN is absent",async()=>{
  await expect(openDevCompanyInvoiceWriter({
    invoiceId:195,portalUser:admin,
    lookupCompany:async()=>({rows:[{company_id:1}]}),
    env:env({CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:undefined,
      SUPABASE_DATABASE_URL_DEV:"postgresql://postgres:fake@localhost:5432/postgres"}),
    readCa:async()=>fakeCa,
  })).rejects.toMatchObject({statusCode:503});
 });
 it("rejects duplicate SSL query parameters",()=>{
  expect(()=>parseDevInvoiceScopedWriterDsn(url(1)+"&sslmode=disable",1)).toThrow();
 });
 it("fails closed and closes connection after an independent role login failure",async()=>{
  const closed=vi.fn();
  class MockClient{
    async connect(){throw new Error("synthetic authentication failure")}
    async end(){closed()}
  }
  await expect(openDevCompanyInvoiceWriter({
    invoiceId:195,portalUser:admin,env:env(),
    lookupCompany:async()=>({rows:[{company_id:1}]}),
    readCa:async()=>fakeCa,ClientCtor:MockClient,
  })).rejects.toMatchObject({statusCode:503});
  expect(closed).toHaveBeenCalledTimes(1);
 });
});

// GCP integration belongs to the existing one-client original Invoice path;
// a configured GCP source must never fall back to arbitrary process.env DSNs.
describe("DEV Customer Invoice GCP secret routing, all financial flags gated",()=>{
 const bootstrap="CUSTOMER_PORTAL_INVOICE_GCP_BOOTSTRAP_JSON_DEV";
 it("uses company3 credentials fetched from the exact GCP source",async()=>{
   const options=[];
   class MockClient{
     constructor(o){options.push(o)}
     async connect(){}
     async end(){}
   }
   const secretLoader=vi.fn(async()=>({
     CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:url(1),
     CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:url(3),
   }));
   const chosen=await openDevCompanyInvoiceWriter({
     invoiceId:197,portalUser:admin,
     lookupCompany:async()=>({rows:[{company_id:3}]}),
     env:env({[bootstrap]:"synthetic-dedicated-bootstrap",
       CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:"postgresql://postgres:unsafe@localhost:5432/postgres"}),
     loadWriterSecrets:secretLoader,
     ClientCtor:MockClient,readCa:async()=>fakeCa,
   });
   expect(secretLoader).toHaveBeenCalledTimes(1);
   expect(chosen.companyId).toBe(3);
   expect(options[0].connectionString).toBe(url(3));
   expect(options[0].connectionString).not.toContain("postgres:unsafe");
   await chosen.client.end();
 });
 it("does not fall back to env DSN when dedicated Secret Manager fetch fails",async()=>{
   const connect=vi.fn();
   const secretLoader=vi.fn(async()=>{throw Error("raw-private-GCP-error")});
   class MockClient{async connect(){connect()} async end(){}}
   let error;
   try{
     await openDevCompanyInvoiceWriter({
       invoiceId:195,portalUser:admin,
       lookupCompany:async()=>({rows:[{company_id:1}]}),
       env:env({[bootstrap]:"synthetic-dedicated-bootstrap"}),
       loadWriterSecrets:secretLoader,ClientCtor:MockClient,
       readCa:async()=>fakeCa,
     });
   }catch(e){error=e}
   expect(error.statusCode).toBe(503);
   expect(error.message).not.toContain("raw-private-GCP-error");
   expect(connect).not.toHaveBeenCalled();
 });
 it("never accepts a Diva DSN for a CST invoice from GCP",async()=>{
   const loader=vi.fn(async()=>({
     CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:url(3),
     CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:url(1),
   }));
   await expect(openDevCompanyInvoiceWriter({
     invoiceId:195,portalUser:admin,
     lookupCompany:async()=>({rows:[{company_id:1}]}),
     env:env({[bootstrap]:"synthetic-dedicated-bootstrap"}),
     loadWriterSecrets:loader,readCa:async()=>fakeCa,
   })).rejects.toMatchObject({statusCode:503});
   expect(loader).toHaveBeenCalledTimes(1);
 });
});
