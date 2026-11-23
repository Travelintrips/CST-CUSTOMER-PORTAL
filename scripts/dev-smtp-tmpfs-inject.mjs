/**
 * Installs an SMTP App Password received only on stdin into the private
 * Customer Portal DEV tmpfs. No argv, environment, disk or log secret.
 */
import { createHash, randomBytes } from "node:crypto";
import { constants as flags, promises as fs } from "node:fs";
import { join } from "node:path";

const DIRECTORY="/run/credentials/cst-customer-portal-dev.service";
const DESTINATION=join(DIRECTORY,"hostinger-smtp-pass");
const APP_UID=21110;
const APP_GID=21110;
const TMPFS_MAGIC=0x01021994;

function stop(){
  return Object.assign(new Error("DEV_SMTP_TMPFS_CREDENTIAL_INJECTION_REFUSED"),{code:503});
}
async function validateDirectory(){
  const [info,real,statfs]=await Promise.all([
    fs.lstat(DIRECTORY),fs.realpath(DIRECTORY),fs.statfs(DIRECTORY),
  ]);
  if(real!==DIRECTORY || !info.isDirectory() || info.isSymbolicLink()
    || info.uid!==APP_UID || info.gid!==APP_GID
    || (info.mode & 0o777)!==0o700 || Number(statfs.type)!==TMPFS_MAGIC)throw stop();
}
async function readPassword(){
  const chunks=[];let total=0;
  for await(const chunk of process.stdin){
    total+=chunk.length;
    if(total>512)throw stop();
    chunks.push(chunk);
  }
  if(total<8)throw stop();
  const raw=Buffer.concat(chunks,total);
  if(!/^[\x21-\x7e]{8,512}$/.test(raw.toString("utf8"))){raw.fill(0);throw stop();}
  return raw;
}
async function install(raw){
  const suffix=randomBytes(12).toString("hex");
  const temp=join(DIRECTORY,".smtp-"+suffix+".tmp");
  const handle=await fs.open(temp,flags.O_WRONLY|flags.O_CREAT|flags.O_EXCL|flags.O_NOFOLLOW,0o400);
  try{
    await handle.writeFile(raw);
    await handle.chmod(0o400);
    await handle.sync();
  }finally{await handle.close();}
  try{
    const current=await fs.lstat(DESTINATION).catch(e=>e.code==="ENOENT"?null:Promise.reject(e));
    if(current && (!current.isFile() || current.isSymbolicLink()
      || current.uid!==APP_UID || current.gid!==APP_GID
      || (current.mode & 0o777)!==0o400))throw stop();
    await fs.rename(temp,DESTINATION);
  }finally{await fs.rm(temp,{force:true}).catch(()=>{});}
  const final=await fs.lstat(DESTINATION);
  if(!final.isFile() || final.isSymbolicLink()
    || final.uid!==APP_UID || final.gid!==APP_GID
    || (final.mode & 0o777)!==0o400 || final.size!==raw.length)throw stop();
}

async function main(){
  if(process.getuid?.()!==APP_UID || process.getgid?.()!==APP_GID
    || process.env.APP_ENV!=="development" || process.env.NODE_ENV==="production"
    || process.env.CREDENTIALS_DIRECTORY!==DIRECTORY)throw stop();
  await validateDirectory();
  const raw=await readPassword();
  try{await install(raw);}
  finally{raw.fill(0);}
  console.log("DEV_SMTP_PRIVATE_TMPFS_CREDENTIAL_INSTALLED_PASS");
}
main().catch(()=>{console.error("DEV_SMTP_PRIVATE_TMPFS_INJECTION_REJECTED");process.exitCode=1;});
