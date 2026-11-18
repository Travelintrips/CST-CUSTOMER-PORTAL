/**
 * Root-only, stdin-only delivery of a verified CST Invoice DEV bundle
 * into the container's private tmpfs. No host bind, no env/password argv,
 * no network or database access, and no persistent plaintext.
 */
import { createHash, randomBytes } from "node:crypto";
import { constants as flags } from "node:fs";
import { promises as fs } from "node:fs";
import { posix as path } from "node:path";
import { parseDevInvoiceScopedWriterDsn } from "../server/dev-customer-invoice-scoped-client.mjs";
import {
  validateDevCustomerInvoiceSecretPayload,
} from "../server/dev-customer-invoice-writer-secret.mjs";

const DIRECTORY="/run/credentials/cst-customer-portal-dev.service";
const CREDENTIAL_NAME="customer-invoice-writers-dev.json";
const DESTINATION=path.join(DIRECTORY,CREDENTIAL_NAME);
const EXPECTED_CA="/opt/cst-dev-finance-tls/supabase-root-2021.crt";
const EXPECTED_CA_SHA="700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7";
const APP_UID=21110;
const APP_GID=21110;
const TMPFS_MAGIC=0x01021994;
function stop() {
  return Object.assign(new Error("INVOICE_DEV_TMPFS_CREDENTIAL_INJECTION_REFUSED"),{code:503});
}
async function validateDirectory() {
  const [info,real,statfs] = await Promise.all([
    fs.lstat(DIRECTORY),fs.realpath(DIRECTORY),fs.statfs(DIRECTORY),
  ]);
  if(real!==DIRECTORY || !info.isDirectory() || info.isSymbolicLink()
    || info.uid!==APP_UID || info.gid!==APP_GID || (info.mode & 0o777)!==0o700
    || statfs.type!==TMPFS_MAGIC)throw stop();
}
async function readBoundedStdin() {
  const chunks=[];
  let total=0;
  for await(const chunk of process.stdin) {
    total+=chunk.length;
    if(total>16_384)throw stop();
    chunks.push(chunk);
  }
  if(total<80)throw stop();
  return Buffer.concat(chunks,total);
}
async function verifyCredential(raw) {
  const parsed=validateDevCustomerInvoiceSecretPayload(raw.toString("utf8"));
  parseDevInvoiceScopedWriterDsn(parsed.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV,1);
  parseDevInvoiceScopedWriterDsn(parsed.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV,3);
  const capath=await fs.realpath(EXPECTED_CA);
  if(capath!==EXPECTED_CA)throw stop();
  const ca=await fs.readFile(EXPECTED_CA);
  if(createHash("sha256").update(ca).digest("hex")!==EXPECTED_CA_SHA)throw stop();
  ca.fill(0);
}
async function writePrivateCredential(raw){
  const suffix=randomBytes(12).toString("hex");
  const temp=path.join(DIRECTORY,".invoice-"+suffix+".tmp");
  const handle=await fs.open(temp,flags.O_WRONLY|flags.O_CREAT|flags.O_EXCL|flags.O_NOFOLLOW,0o600);
  try{
    await handle.writeFile(raw);
    // The unique Invoice application UID owns its own private Docker tmpfs.
    // No CAP_CHOWN or privileged root process is needed inside the container.
    await handle.chmod(0o400);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    const current=await fs.lstat(DESTINATION).catch(e=>e.code==="ENOENT"?null:Promise.reject(e));
    if(current && (!current.isFile() || current.isSymbolicLink()
      || current.uid!==APP_UID || current.gid!==APP_GID
      || (current.mode & 0o777)!==0o400))throw stop();
    await fs.rename(temp,DESTINATION);
  }finally{
    await fs.rm(temp,{force:true}).catch(()=>{});
  }
  const final=await fs.lstat(DESTINATION);
  if(!final.isFile() || final.uid!==APP_UID || final.gid!==APP_GID
    || (final.mode & 0o777)!==0o400 || final.size!==raw.length)throw stop();
}
async function main(){
  if(process.getuid?.()!==APP_UID || process.getgid?.()!==APP_GID
    || process.env.APP_ENV!=="development"
    || process.env.NODE_ENV==="production")throw stop();
  await validateDirectory();
  const raw=await readBoundedStdin();
  try {
    await verifyCredential(raw);
    await writePrivateCredential(raw);
  }finally{raw.fill(0)}
  console.log("INVOICE_DEV_DOCKER_PRIVATE_TMPFS_CREDENTIAL_INSTALLED_PASS");
  console.log("HOST_RUNNER_GID_NOT_USED_NO_PLAINTEXT_BIND_MOUNT");
}
main().catch(()=>{console.error("INVOICE_DEV_PRIVATE_TMPFS_INJECTION_REJECTED");process.exitCode=1});
