/**
 * One-shot CST-DEV Customer Invoice writer credential issuance.
 * No credential is echoed or committed. Production/Finance never touched.
 * Use only with dedicated, exact-SHA-pinned GitHub Workload Identity.
 */
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const REF="xssrfshdrtdfupgqwfdw";
const GCP_SECRET="projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies";
const BRANCH="refs/heads/test/dev-customer-invoice-keyless-bootstrap-once-20261119";
const REPO="Travelintrips/CST-CUSTOMER-PORTAL";
const REPO_ID="1369747600";
const WORKFLOW_REF=REPO+"/.github/workflows/dev-invoice-issue-once.yml@"+BRANCH;
const CERT_SHA="38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334";
const CERT="scripts/dev-invoice-envelope-recipient.pem";
const MODE=process.argv[2] || "dry-run";

function die(message){throw new Error("STOP_CST_DEV_INVOICE_ISSUER_"+message)}
function guardEnv(env=process.env) {
 if (!["dry-run","issue"].includes(MODE))die("INVALID_MODE");
 if(env.GITHUB_REPOSITORY!==REPO ||
    env.GITHUB_REPOSITORY_ID!==REPO_ID ||
    env.GITHUB_REF!==BRANCH ||
    env.GITHUB_WORKFLOW_REF!==WORKFLOW_REF ||
    env.GITHUB_EVENT_NAME!=="push" ||
    env.RUNNER_ENVIRONMENT!=="github-hosted") die("UNTRUSTED_GITHUB_WORKFLOW");
 if (!/^[a-f0-9]{40}$/.test(env.GITHUB_SHA || ""))die("INVALID_GITHUB_SHA");
 if(MODE==="issue" && env.GITHUB_RUN_ATTEMPT!=="2")
  die("ONLY_APPROVED_SECOND_RUN_ATTEMPT");
 if(MODE==="issue" && !/^[a-f0-9]{40}$/.test(env.CST_INVOICE_PINNED_BOOTSTRAP_SHA || ""))die("MISSING_PINNED_COMMIT");
 if(MODE==="issue" && env.GITHUB_SHA!==env.CST_INVOICE_PINNED_BOOTSTRAP_SHA)
  die("UNREVIEWED_COMMIT");
 if(MODE==="issue" && !env.CST_INVOICE_ISSUER_ACCESS_TOKEN)
  die("MISSING_KEYLESS_TOKEN");
}
function sha(data){return createHash("sha256").update(data).digest("hex")}
function verifyPublicCert(){
 const data=execFileSync("openssl",["x509","-in",CERT,"-outform","DER"],{
  stdio:["ignore","pipe","pipe"]});
 if(sha(data)!==CERT_SHA)die("VPS_CERT_FINGERPRINT_CHANGED");
}
function buildPayload(){
 const host="aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
 const ca="/opt/cst-dev-finance-tls/supabase-root-2021.crt";
 const credential=role=>{
   const password=randomBytes(48).toString("base64url"); // independent 384-bit
   return "postgresql://"+role+"."+REF+":"+password+"@"+host+
     "?sslmode=verify-full&sslrootcert="+encodeURIComponent(ca);
 };
 const cst=credential("bizportal_customer_invoice_cst_writer_dev");
 const diva=credential("bizportal_customer_invoice_diva_writer_dev");
 assert(cst!==diva);
 return {
  APP_ENV:"development",
  SUPABASE_PROJECT_REF:REF,
  CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV:cst,
  CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV:diva,
 };
}
async function GcpRequest(url,token,{method="GET",body=null}={}){
 const resp=await fetch(url,{
   method,
   headers:{Authorization:"Bearer "+token,
     ...(body?{"Content-Type":"application/json"}:{})},
   body:body?JSON.stringify(body):undefined,
   signal:AbortSignal.timeout(20000),
 });
 // Never log Google responses; they might expose sensitive fields.
 if(!resp.ok)die("GCP_HTTP_"+resp.status);
 return resp.json();
}
async function guardGcpPermission(token){
 const url="https://secretmanager.googleapis.com/v1/"+GCP_SECRET+":testIamPermissions";
 const result=await GcpRequest(url,token,{
  method:"POST",
  body:{permissions:["secretmanager.versions.add","secretmanager.versions.access",
                     "secretmanager.versions.list"]},
 });
 const granted=new Set(result.permissions || []);
 if(!granted.has("secretmanager.versions.add") ||
    !granted.has("secretmanager.versions.list") ||
    granted.has("secretmanager.versions.access"))die("NOT_AN_ISOLATED_ISSUER");
 const foreign=await GcpRequest(
  "https://secretmanager.googleapis.com/v1/projects/653506647312/secrets/bizportal-marketplace-finance-dev-companies:testIamPermissions",
  token,{method:"POST",body:{permissions:["secretmanager.versions.access",
     "secretmanager.versions.add"]}});
 if((foreign.permissions || []).length)die("ISSUER_CAN_ACCESS_FINANCE");
}
async function guardEmptySecret(token){
 const info=await GcpRequest(
  "https://secretmanager.googleapis.com/v1/"+GCP_SECRET+"/versions?pageSize=10",token);
 if((info.versions || []).length>0)die("SECRET_VERSION_ALREADY_EXISTS");
}
async function uploadOnce(token,payload) {
 const encoded=Buffer.from(JSON.stringify(payload),"utf8").toString("base64");
 const out=await GcpRequest(
  "https://secretmanager.googleapis.com/v1/"+GCP_SECRET+":addVersion",
  token,{method:"POST",body:{payload:{data:encoded}}});
 if(out?.name!==GCP_SECRET+"/versions/1")die("UNEXPECTED_VERSION_NUMBER");
 return out.name;
}
async function encryptToArtifact(payload,env,version) {
 const dir=path.join(env.RUNNER_TEMP || "/run","cst-invoice-dev-bootstrap-envelope");
 await fs.mkdir(dir,{recursive:false,mode:0o700});
 const tmp=path.join(dir,".uncommitted.json");
 const ciphertext=path.join(dir,"invoice-envelope.cms");
 let raw=Buffer.from(JSON.stringify(payload),"utf8");
 try {
  await fs.writeFile(tmp,raw,{mode:0o600,flag:"wx"});
  execFileSync("openssl",["cms","-encrypt","-binary","-aes-256-gcm",
   "-in",tmp,"-out",ciphertext,"-outform","DER",CERT],
   {stdio:["ignore","ignore","pipe"]});
 }finally{
  raw.fill(0);
  await fs.rm(tmp,{force:true});
 }
 const digest=sha(await fs.readFile(ciphertext));
 await fs.writeFile(path.join(dir,"invoice-envelope-manifest.json"),
  JSON.stringify({
   source_sha:env.GITHUB_SHA,
   certificate_sha256:CERT_SHA,
   envelope_sha256:digest,
   secret_version:version,
   credential_count:2,
   format:"CMS-AES-256-GCM",
  })+"\n",{mode:0o600,flag:"wx"});
 return dir;
}
async function main(){
 guardEnv();
 verifyPublicCert();
 const env=process.env;
 if(MODE==="issue"){
  await guardGcpPermission(env.CST_INVOICE_ISSUER_ACCESS_TOKEN);
  await guardEmptySecret(env.CST_INVOICE_ISSUER_ACCESS_TOKEN);
  console.log("KEYLESS_ISSUER_FINANCE_ISOLATION_AND_EMPTY_SECRET_PREFLIGHT_PASS");
 }
 const payload=buildPayload();
 const version=MODE==="issue"
  ? await uploadOnce(env.CST_INVOICE_ISSUER_ACCESS_TOKEN,payload)
  : "synthetic-dry-run-no-cloud-write";
 await encryptToArtifact(payload,env,version);
 // Never print verifier, password, DSNs, or the raw secret payload.
 console.log(MODE==="issue"?
  "INVOICE_DEV_ONE_TIME_CREDENTIAL_SECRET_VERSION_1_ISSUED_PASS":
  "INVOICE_DEV_SYNTHETIC_CREDENTIAL_ENVELOPE_DRY_RUN_PASS");
 console.log("TWO_INDEPENDENT_384_BIT_CREDENTIALS_ENCRYPTED_NO_PLAINTEXT_ARTIFACT");
}
try{await main()}catch(e){
 // Avoid error objects or URL previews that could accidentally include secrets.
 console.error(String(e?.message||"UNKNOWN").replace(/postgresql:\/\/\S+/g,"[REDACTED]"));
 process.exitCode=1;
}
