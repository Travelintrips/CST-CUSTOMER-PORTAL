/**
 * DEV only: select a dedicated direct-login Customer Invoice writer by the
 * company stored on the Invoice, never by HTTP input.
 * No role grants or financial mutations. The original owner keeps one client.
 */
import pg from "pg";
import { readFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";

const { Client } = pg;
export const DEV_CUSTOMER_INVOICE_PROJECT_REF = "xssrfshdrtdfupgqwfdw";
export const DEV_CUSTOMER_INVOICE_CA_FILE =
  "/opt/cst-dev-finance-tls/supabase-root-2021.crt";
export const DEV_CUSTOMER_INVOICE_CA_SHA256 =
  "700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7";
export const DEV_CUSTOMER_INVOICE_COMPANIES = Object.freeze({
  1: {
    role:"bizportal_customer_invoice_cst_writer_dev",
    env:"CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV",
  },
  3: {
    role:"bizportal_customer_invoice_diva_writer_dev",
    env:"CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV",
  },
});
const REF=DEV_CUSTOMER_INVOICE_PROJECT_REF;
const DIRECT_HOST="db."+REF+".supabase.co";
const POOLER_HOST=/^aws-[0-9]+-ap-southeast-[12]\.pooler\.supabase\.com$/;
function blocked() {
  return Object.assign(new Error("Koneksi penulis Invoice DEV per perusahaan belum terverifikasi."),{statusCode:503});
}
export function isDevInvoiceScopedWriterRequested(env=process.env) {
  return env.APP_ENV==="development" && env.NODE_ENV==="development"
    && env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV==="true"
    && env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV==="true"
    && env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV==="true";
}
export function parseDevInvoiceScopedWriterDsn(raw,companyId) {
  const rule=DEV_CUSTOMER_INVOICE_COMPANIES[Number(companyId)];
  if (!rule || typeof raw!=="string" || !raw.trim()) throw blocked();
  let u;
  try {u=new URL(raw);} catch {throw blocked();}
  if (!["postgresql:","postgres:"].includes(u.protocol)
      || u.hash || u.port!=="5432" || u.pathname!=="/postgres"
      || !u.password || u.password.length<8) throw blocked();
  const isDirect=u.hostname===DIRECT_HOST && u.username===rule.role;
  const isPooler=POOLER_HOST.test(u.hostname)
      && u.username===rule.role+"."+REF;
  if (!isDirect && !isPooler) throw blocked();
  const entries=[...u.searchParams.keys()];
  if (entries.length!==2 ||
      new Set(entries).size!==2 ||
      entries.some(k=>!["sslmode","sslrootcert"].includes(k)) ||
      u.searchParams.get("sslmode")!=="verify-full" ||
      u.searchParams.get("sslrootcert")!==DEV_CUSTOMER_INVOICE_CA_FILE)
    throw blocked();
  return {companyId:Number(companyId),role:rule.role,connectionString:raw};
}

export async function readPinnedDevInvoiceCa() {
  try {
    if (await realpath(DEV_CUSTOMER_INVOICE_CA_FILE)!==DEV_CUSTOMER_INVOICE_CA_FILE)
      throw blocked();
    const bytes=await readFile(DEV_CUSTOMER_INVOICE_CA_FILE);
    if (createHash("sha256").update(bytes).digest("hex")!==DEV_CUSTOMER_INVOICE_CA_SHA256)
      throw blocked();
    return bytes.toString("utf8");
  }catch{throw blocked();}
}
/** Returns a direct PG Client. The caller must close it in finally. */
export async function openDevCompanyInvoiceWriter({
  invoiceId,portalUser,lookupCompany,env=process.env,
  ClientCtor=Client,readCa=readPinnedDevInvoiceCa,
}) {
  if (!isDevInvoiceScopedWriterRequested(env)
      || portalUser?.role!=="admin" ||
      !Number.isSafeInteger(Number(portalUser.id)) || Number(portalUser.id)<=0 ||
      !Number.isSafeInteger(Number(invoiceId)) || Number(invoiceId)<=0 ||
      typeof lookupCompany!=="function") throw blocked();
  let result;
  try {
    result=await lookupCompany(
      "select company_id from public.sales_documents where id=$1 and company_id in (1,3) limit 2",
      [Number(invoiceId)]);
  } catch {throw blocked();}
  if (result?.rows?.length!==1) throw blocked();
  const companyId=Number(result.rows[0].company_id);
  const config=DEV_CUSTOMER_INVOICE_COMPANIES[companyId];
  if (!config) throw blocked();
  const parsed=parseDevInvoiceScopedWriterDsn(env[config.env],companyId);
  const ca=await readCa();
  if(typeof ca!=="string" || !ca.includes("BEGIN CERTIFICATE")) throw blocked();
  const client=new ClientCtor({
    connectionString:parsed.connectionString,
    ssl:{rejectUnauthorized:true,ca},
    connectionTimeoutMillis:6000,
    application_name:"cst_customer_invoice_scoped_dev",
  });
  try {
    await client.connect();
  }catch {
    try{await client.end();}catch{}
    throw blocked();
  }
  return {client,companyId};
}
