// @ts-nocheck — isolated parser/connection-factory tests, no real DB or credentials.
import {describe,it,expect,vi} from "vitest";
import pg from "pg";
import {
 DEV_CUSTOMER_INVOICE_COMPANIES,
 DEV_CUSTOMER_INVOICE_CA_FILE,
 isDevInvoiceScopedWriterRequested,
 parseDevInvoiceScopedWriterDsn,
 resolveDevCstInvoiceDirectIpv6,
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

describe("DEV Invoice systemd credential routes through original company client",()=>{
 const dir="/run/credentials/cst-customer-portal-dev.service";
 it("uses only the DB-derived Diva DSN from systemd, never env DSNs",async()=>{
  const calls=[];
  class FakeClient{
   constructor(options){calls.push(options)}
   async connect(){}
   async end(){}
  }
  const fetchSystemd=vi.fn(async()=>({
   CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:url(1),
   CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:url(3),
  }));
  const fetchGcp=vi.fn();
  const selected=await openDevCompanyInvoiceWriter({
   invoiceId:197,portalUser:admin,
   lookupCompany:async()=>({rows:[{company_id:3}]}),
   env:env({CREDENTIALS_DIRECTORY:dir,
    CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:"postgresql://postgres:unsafe@localhost:5432/postgres"}),
   loadSystemdCredentials:fetchSystemd,
   loadWriterSecrets:fetchGcp,
   ClientCtor:FakeClient,readCa:async()=>fakeCa,
  });
  expect(selected.companyId).toBe(3);
  expect(fetchSystemd).toHaveBeenCalledExactlyOnceWith({env:expect.objectContaining({CREDENTIALS_DIRECTORY:dir})});
  expect(fetchGcp).not.toHaveBeenCalled();
  expect(calls[0].connectionString).toBe(url(3));
  await selected.client.end();
 });
 it("never falls back to old process.env when systemd file is missing",async()=>{
  const fetchSystemd=vi.fn(async()=>{throw Error("raw-systemd-error-PRIVATE")});
  let caught;
  try{
   await openDevCompanyInvoiceWriter({
    invoiceId:195,portalUser:admin,
    lookupCompany:async()=>({rows:[{company_id:1}]}),
    env:env({CREDENTIALS_DIRECTORY:dir}),
    loadSystemdCredentials:fetchSystemd,
    readCa:async()=>fakeCa,
   });
  }catch(e){caught=e}
  expect(caught?.statusCode).toBe(503);
  expect(caught.message).not.toContain("PRIVATE");
  expect(fetchSystemd).toHaveBeenCalledOnce();
 });
 it("refuses competing GCP bootstrap and systemd sources",async()=>{
  const fetchSystemd=vi.fn();
  const fetchGcp=vi.fn();
  await expect(openDevCompanyInvoiceWriter({
   invoiceId:195,portalUser:admin,
   lookupCompany:async()=>({rows:[{company_id:1}]}),
   env:env({CREDENTIALS_DIRECTORY:dir,
    CUSTOMER_PORTAL_INVOICE_GCP_BOOTSTRAP_JSON_DEV:"unexpected-dual-config"}),
   loadSystemdCredentials:fetchSystemd,loadWriterSecrets:fetchGcp,
   readCa:async()=>fakeCa,
  })).rejects.toMatchObject({statusCode:503});
  expect(fetchSystemd).not.toHaveBeenCalled();
  expect(fetchGcp).not.toHaveBeenCalled();
 });
 it("rejects a mismatched CST role returned from systemd",async()=>{
  const fetchSystemd=vi.fn(async()=>({
   CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:url(3),
   CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:url(1),
  }));
  await expect(openDevCompanyInvoiceWriter({
   invoiceId:195,portalUser:admin,
   lookupCompany:async()=>({rows:[{company_id:1}]}),
   env:env({CREDENTIALS_DIRECTORY:dir}),
   loadSystemdCredentials:fetchSystemd,readCa:async()=>fakeCa,
  })).rejects.toMatchObject({statusCode:503});
 });
});


describe("CST-DEV direct IPv6 Invoice writer transport, default OFF",()=>{
 const optIn=env({
   CUSTOMER_PORTAL_DEV_DIRECT_IPV6:"true",
   CUSTOMER_PORTAL_INVOICE_CST_DIRECT_IPV6_DEV:"true",
 });
 it("keeps original V2 URL unchanged when the new opt-in is absent",()=>{
   const parsed=parseDevInvoiceScopedWriterDsn(url(1),1);
   expect(resolveDevCstInvoiceDirectIpv6(parsed,env())).toBe(parsed.connectionString);
 });
 it("rewrites only the pinned CST Session Pooler role to direct IPv6",()=>{
   const input=url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"});
   const parsed=parseDevInvoiceScopedWriterDsn(input,1);
   const direct=resolveDevCstInvoiceDirectIpv6(parsed,optIn);
   const u=new URL(direct);
   expect(u.hostname).toBe("db."+REF+".supabase.co");
   expect(u.username).toBe(DEV_CUSTOMER_INVOICE_COMPANIES[1].role);
   expect(u.port).toBe("5432");
   expect(u.password).toBe(new URL(input).password);
   expect(u.searchParams.get("sslmode")).toBe("verify-full");
   expect(u.searchParams.get("sslrootcert")).toBe(DEV_CUSTOMER_INVOICE_CA_FILE);
   expect(parseDevInvoiceScopedWriterDsn(direct,1).role).toBe(DEV_CUSTOMER_INVOICE_COMPANIES[1].role);
 });
 it.each([
   ["Diva writer",3,url(3,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"}),optIn],
   ["unexpected pooler region",1,url(1),optIn],
   ["missing existing direct flag",1,url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"}),{...optIn,CUSTOMER_PORTAL_DEV_DIRECT_IPV6:"false"}],
   ["production environment",1,url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"}),{...optIn,APP_ENV:"production"}],
   ["invalid opt-in flag",1,url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"}),{...optIn,CUSTOMER_PORTAL_INVOICE_CST_DIRECT_IPV6_DEV:"on"}],
   ["already direct without approved pooler source",1,url(1,{hostname:"db."+REF+".supabase.co",username:DEV_CUSTOMER_INVOICE_COMPANIES[1].role}),optIn],
 ])("fails closed for %s",(_name,company,dsn,e)=>{
   const parsed=parseDevInvoiceScopedWriterDsn(dsn,company);
   expect(()=>resolveDevCstInvoiceDirectIpv6(parsed,e)).toThrow();
 });
 it("uses the pinned CA and explicit verify-full policy in the actual pg Client constructor",async()=>{
   class NoNetworkPgClient extends pg.Client {
     async connect(){}
     async end(){}
   }
   const input=url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"});
   const selected=await openDevCompanyInvoiceWriter({
     invoiceId:108,portalUser:admin,
     env:{...optIn,CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:input},
     lookupCompany:async()=>({rows:[{company_id:1}]}),
     ClientCtor:NoNetworkPgClient,readCa:async()=>fakeCa,
   });
   const runtime=selected.client.connectionParameters;
   expect(runtime.host).toBe("db."+REF+".supabase.co");
   expect(runtime.user).toBe(DEV_CUSTOMER_INVOICE_COMPANIES[1].role);
   expect(runtime.ssl).toMatchObject({
     rejectUnauthorized:true,ca:fakeCa,servername:"db."+REF+".supabase.co",
   });
   expect(runtime.ssl.ca).toBe(fakeCa);
   expect(runtime.database).toBe("postgres");
   expect(runtime.port).toBe(5432);
   await selected.client.end();
 });
 it("selects actual DB company and direct role with a mock client only",async()=>{
   const created=[];
   class FakeClient{
     constructor(options){created.push(options)}
     async connect(){}
     async end(){}
   }
   const input=url(1,{hostname:"aws-1-ap-southeast-2.pooler.supabase.com"});
   const selected=await openDevCompanyInvoiceWriter({
     invoiceId:108,
     portalUser:admin,
     env:{...optIn,CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:input},
     lookupCompany:async()=>({rows:[{company_id:1}]}),
     ClientCtor:FakeClient,readCa:async()=>fakeCa,
   });
   expect(selected.companyId).toBe(1);
   expect(new URL(created[0].connectionString).hostname).toBe("db."+REF+".supabase.co");
   expect(created[0].ssl.rejectUnauthorized).toBe(true);
   await selected.client.end();
 });
});
