// @ts-nocheck — synthetic credentials only, no Secret Manager network calls.
import { describe, it, expect, vi } from "vitest";
import {
  DEV_CUSTOMER_INVOICE_SECRET,
  DEV_CUSTOMER_INVOICE_SECRET_READER,
  DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV,
  hasInvoiceDevGcpBootstrap,
  loadDevCustomerInvoiceWriterSecrets,
} from "../server/dev-customer-invoice-writer-secret.mjs";

const REF = "xssrfshdrtdfupgqwfdw";
const makeUrl = (role) =>
  `postgresql://${role}.${REF}:synthetic-placeholder@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=%2Fopt%2Fcst-dev-finance-tls%2Fsupabase-root-2021.crt`;
const EXPECTED = {
  APP_ENV: "development",
  SUPABASE_PROJECT_REF: REF,
  CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV: makeUrl("bizportal_customer_invoice_cst_writer_dev"),
  CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV: makeUrl("bizportal_customer_invoice_diva_writer_dev"),
};
const env = (overrides={})=>({
  APP_ENV:"development", NODE_ENV:"development",
  CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
  CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
  CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"true",
  [DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]:JSON.stringify({
    project_id:"secret-504012",
    client_email:DEV_CUSTOMER_INVOICE_SECRET_READER,
    private_key:"-----BEGIN PRIVATE KEY-----\\nSYNTHETIC_NON_KEY",
  }),
  ...overrides,
});
function fakeClient(payload=EXPECTED) {
  const close = vi.fn(async()=>{});
  const accessSecretVersion = vi.fn(async()=>[{
    payload:{data:Buffer.from(JSON.stringify(payload),"utf8")},
  }]);
  return {close,accessSecretVersion};
}
describe("CST-DEV Customer Invoice dedicated GCP Secret Manager gate",()=>{
 it("is dormant unless a nonempty dedicated Invoice bootstrap is explicitly configured",()=>{
   expect(hasInvoiceDevGcpBootstrap({})).toBe(false);
   expect(hasInvoiceDevGcpBootstrap(env())).toBe(true);
 });
 it("reads only exact dedicated secret and returns both isolated DSNs",async()=>{
   const client=fakeClient();
   const clientFactory=vi.fn(()=>client);
   const val=await loadDevCustomerInvoiceWriterSecrets({env:env(),clientFactory});
   expect(client.accessSecretVersion).toHaveBeenCalledExactlyOnceWith({name:DEV_CUSTOMER_INVOICE_SECRET});
   expect(clientFactory).toHaveBeenCalledWith(expect.objectContaining({
     project_id:"secret-504012",
     client_email:DEV_CUSTOMER_INVOICE_SECRET_READER,
   }));
   expect(val.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV).toBe(EXPECTED.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV);
   expect(val.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV).toBe(EXPECTED.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV);
   expect(client.close).toHaveBeenCalledOnce();
 });
 it.each([
   ["atomic disabled", {CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false"}],
   ["posted AR disabled", {CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false"}],
   ["independent proof disabled", {CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false"}],
   ["outside DEV", {APP_ENV:"production"}],
   ["outside DEV NODE", {NODE_ENV:"production"}],
   ["no dedicated bootstrap", {[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]:undefined}],
   ["wrong reader SA", {[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]:JSON.stringify({
     project_id:"secret-504012",
     client_email:"bizportal-finance-dev-reader@secret-504012.iam.gserviceaccount.com",
     private_key:"-----BEGIN PRIVATE KEY-----\\nFAKE",
   })}],
   ["wrong project", {[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]:JSON.stringify({
     project_id:"cst-super-app",client_email:DEV_CUSTOMER_INVOICE_SECRET_READER,
     private_key:"-----BEGIN PRIVATE KEY-----\\nFAKE",
   })}],
 ])("fails closed before Secret Manager access: %s",async(_why,change)=>{
   const factory=vi.fn();
   await expect(loadDevCustomerInvoiceWriterSecrets({env:env(change),clientFactory:factory}))
     .rejects.toMatchObject({statusCode:503});
   expect(factory).not.toHaveBeenCalled();
 });
 it.each([
  ["wrong environment", {...EXPECTED,APP_ENV:"production"}],
  ["wrong Supabase project", {...EXPECTED,SUPABASE_PROJECT_REF:"nzdweipzckfszczzqtuw"}],
  ["PROD key smuggling", {...EXPECTED,CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_PROD:"fake"}],
  ["same credentials reused", {...EXPECTED,CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:EXPECTED.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV}],
  ["missing Diva DSN", {APP_ENV:"development",SUPABASE_PROJECT_REF:REF,CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:EXPECTED.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV}],
 ])("rejects untrusted or non-isolated Secret Manager payload: %s",async(_reason,payload)=>{
   const client=fakeClient(payload);
   await expect(loadDevCustomerInvoiceWriterSecrets({
     env:env(), clientFactory:()=>client,
   })).rejects.toMatchObject({statusCode:503});
   expect(client.close).toHaveBeenCalledOnce();
 });
 it("does not leak credentials when the API fails",async()=>{
   const rawError="credential-secret-private-token=DO-NOT-LEAK";
   const client={
     close:vi.fn(async()=>{}),
     accessSecretVersion:vi.fn(async()=>{throw Error(rawError)}),
   };
   let received;
   try{await loadDevCustomerInvoiceWriterSecrets({env:env(),clientFactory:()=>client})}
   catch(e){received=e}
   expect(received.statusCode).toBe(503);
   expect(received.message).not.toContain(rawError);
   expect(client.close).toHaveBeenCalledOnce();
 });
 it("rejects missing Secret Manager version and always closes client",async()=>{
   const client={close:vi.fn(async()=>{}),accessSecretVersion:vi.fn(async()=>[{}])};
   await expect(loadDevCustomerInvoiceWriterSecrets({
     env:env(),clientFactory:()=>client,
   })).rejects.toMatchObject({statusCode:503});
   expect(client.close).toHaveBeenCalledOnce();
 });
 it("rejects malformed JSON in dedicated GCP bootstrap",async()=>{
   await expect(loadDevCustomerInvoiceWriterSecrets({
     env:env({[DEV_CUSTOMER_INVOICE_GCP_BOOTSTRAP_ENV]:"{broken"}),
     clientFactory:vi.fn(),
   })).rejects.toMatchObject({statusCode:503});
 });
});
