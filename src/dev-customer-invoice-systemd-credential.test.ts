// @ts-nocheck — no real credential files, passwords or PostgreSQL clients.
import {describe,it,expect,vi} from "vitest";
import {
 DEV_CUSTOMER_INVOICE_SYSTEMD_CREDENTIAL_NAME,
 hasDevCustomerInvoiceSystemdCredentials,
 loadDevCustomerInvoiceSystemdCredentials,
} from "../server/dev-customer-invoice-systemd-credential.mjs";

const DIR="/run/credentials/cst-customer-portal-dev.service";
const payload={
 APP_ENV:"development",
 SUPABASE_PROJECT_REF:"xssrfshdrtdfupgqwfdw",
 CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:"postgresql://bizportal_customer_invoice_cst_writer_dev.xssrfshdrtdfupgqwfdw:synthetic-only@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=/opt/cst-dev-finance-tls/supabase-root-2021.crt",
 CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:"postgresql://bizportal_customer_invoice_diva_writer_dev.xssrfshdrtdfupgqwfdw:synthetic-only@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=/opt/cst-dev-finance-tls/supabase-root-2021.crt",
};
const env=(overrides={})=>({
 APP_ENV:"development",NODE_ENV:"development",
 CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"true",
 CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"true",
 CREDENTIALS_DIRECTORY:DIR,
 ...overrides,
});
const full=DIR+"/"+DEV_CUSTOMER_INVOICE_SYSTEMD_CREDENTIAL_NAME;
function fixture({
 mode=0o100440,
 size=JSON.stringify(payload).length,
 realDir=DIR,
 realFile=full,
 raw=JSON.stringify(payload),
 fileIsSym=false,
 directoryIsSym=false,
}={}){
 const lstat=vi.fn(async name=>name===DIR ? {
  isDirectory:()=>true,isSymbolicLink:()=>directoryIsSym,
 } : {isFile:()=>true,isSymbolicLink:()=>fileIsSym,size,mode});
 return {
  realpath:vi.fn(async name=>name===DIR?realDir:realFile),
  lstat,
  readFile:vi.fn(async()=>raw),
 };
}
describe("DEV Invoice systemd LoadCredential source (no persistent SA key)",()=>{
 it("recognizes absent vs explicitly configured CREDENTIALS_DIRECTORY",()=>{
  expect(hasDevCustomerInvoiceSystemdCredentials({})).toBe(false);
  expect(hasDevCustomerInvoiceSystemdCredentials(env())).toBe(true);
  expect(hasDevCustomerInvoiceSystemdCredentials(env({CREDENTIALS_DIRECTORY:""}))).toBe(true);
 });
 it("reads only fixed per-unit credential name and normal group-read-only systemd mode 0440",async()=>{
  const fileSystem=fixture();
  const result=await loadDevCustomerInvoiceSystemdCredentials({env:env(),fileSystem});
  expect(result).toEqual({
   CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:payload.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV,
   CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:payload.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV,
  });
  expect(fileSystem.readFile).toHaveBeenCalledExactlyOnceWith(full,"utf8");
  expect(fileSystem.realpath).toHaveBeenCalledWith(DIR);
  expect(fileSystem.realpath).toHaveBeenCalledWith(full);
 });
 it.each([
  ["PROD env",env({APP_ENV:"production"})],
  ["non-dev NODE",env({NODE_ENV:"production"})],
  ["atomic OFF",env({CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false"})],
  ["AR OFF",env({CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false"})],
  ["proof OFF",env({CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false"})],
  ["empty directory",env({CREDENTIALS_DIRECTORY:""})],
  ["user-provided /tmp path",env({CREDENTIALS_DIRECTORY:"/tmp/credentials/service"})],
  ["directory traversal",env({CREDENTIALS_DIRECTORY:"/run/credentials/../private"})],
  ["trailing slash",env({CREDENTIALS_DIRECTORY:DIR+"/"})],
 ])("refuses %s before file read",async (_title,e)=>{
  const fs=fixture();
  await expect(loadDevCustomerInvoiceSystemdCredentials({
    env:e,fileSystem:fs,
  })).rejects.toMatchObject({statusCode:503});
  expect(fs.readFile).not.toHaveBeenCalled();
 });
 it.each([
  ["symlinked file",{fileIsSym:true}],
  ["symlinked directory",{directoryIsSym:true}],
  ["symlink destination differs",{realFile:"/tmp/other"}],
  ["directory realpath differs",{realDir:"/other"}],
  ["world-readable credential",{mode:0o100444}],
  ["group-writable credential",{mode:0o100460}],
  ["empty credential",{size:0}],
  ["oversized credential",{size:20_000}],
  ["wrong project",{raw:JSON.stringify({...payload,SUPABASE_PROJECT_REF:"nzdweipzckfszczzqtuw"})}],
  ["missing Diva key",{raw:JSON.stringify({...payload,CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:undefined})}],
  ["foreign keys",{raw:JSON.stringify({...payload,GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:"must-not-be-here"})}],
  ["malformed JSON",{raw:"{bad"}],
 ])("fails closed for %s",async(_title,opts)=>{
  const fs=fixture(opts);
  let caught;
  try{
   await loadDevCustomerInvoiceSystemdCredentials({env:env(),fileSystem:fs});
  }catch(e){caught=e}
  expect(caught?.statusCode).toBe(503);
  expect(caught.message).not.toContain("must-not-be-here");
 });
 it("hides raw file-system errors and any secret content",async()=>{
  const fs=fixture();
  fs.readFile.mockRejectedValue(Error("PRIVATE-DSN-CANNOT-EXPOSE"));
  let caught;
  try{await loadDevCustomerInvoiceSystemdCredentials({env:env(),fileSystem:fs})}
  catch(e){caught=e}
  expect(caught.statusCode).toBe(503);
  expect(caught.message).not.toContain("PRIVATE-DSN-CANNOT-EXPOSE");
 });
});
