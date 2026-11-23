/**
 * DEV-only, purpose-separated CST company self-affiliation attestation.
 * A Portal Admin's signed session alone is NOT sufficient for self-approval.
 * The same canonical Super Admin must explicitly approve a fresh BizPortal
 * signed-session challenge. Never reuse a financial Invoice proof here.
 */
import {
  createHash,createHmac,createPublicKey,randomBytes,timingSafeEqual,verify,
} from "node:crypto";

const CHALLENGE_DOMAIN="CST_PORTAL_COMPANY_SELF_APPROVAL_CHALLENGE_V1\n";
const PROOF_DOMAIN="CST_BIZPORTAL_COMPANY_SELF_APPROVAL_DEV_V1\n";
const TTL=90_000;
const normal=v=>typeof v==="string"?v.trim().toLowerCase():"";
const fail=()=>Object.assign(new Error(
  "Persetujuan mandiri memerlukan verifikasi Super Admin BizPortal yang masih berlaku."
),{statusCode:403});

export function isDevCompanySelfApprovalEnabled(env=process.env) {
  return env.APP_ENV?.trim().toLowerCase()==="development" &&
    env.CUSTOMER_PORTAL_COMPANY_SELF_APPROVAL_DEV==="true" &&
    env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV==="true";
}
function decode(token,maxLength) {
  if(typeof token!=="string"||token.length<60||token.length>maxLength||
     !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return null;
  const [part,signature]=token.split(".");
  if(!part||!signature)return null;
  try {
    const raw=Buffer.from(part,"base64url").toString("utf8");
    if(Buffer.from(raw).toString("base64url")!==part)return null;
    const claims=JSON.parse(raw);
    if(!claims||typeof claims!=="object"||Array.isArray(claims))return null;
    return {part,signature,claims};
  }catch{return null;}
}
function constantEqual(a,b) {
  const x=Buffer.from(a),y=Buffer.from(b);
  return x.length===y.length&&timingSafeEqual(x,y);
}
function sessionSecret() {
  const s=process.env.SESSION_SECRET;
  if(typeof s!=="string"||s.length<32)throw fail();
  return s;
}
function contextValid(ctx) {
  return isDevCompanySelfApprovalEnabled() &&
    Number(ctx?.companyId)===1 &&
    Number.isSafeInteger(Number(ctx?.requestId))&&Number(ctx.requestId)>0 &&
    Number.isSafeInteger(Number(ctx?.applicantId))&&Number(ctx.applicantId)>0 &&
    ctx?.portalUser?.role==="admin" &&
    Number(ctx.portalUser.id)===Number(ctx.applicantId) &&
    normal(ctx.portalUser.email).includes("@") &&
    normal(ctx.portalUser.email).length<=320;
}
export function mintDevCompanySelfApprovalChallenge(ctx) {
  if(!contextValid(ctx))throw fail();
  const now=Date.now();
  const claims={
    v:1,purpose:"cst-portal-company-self-approval",requestId:Number(ctx.requestId),
    companyId:1,applicantId:Number(ctx.applicantId),
    portalUserId:Number(ctx.portalUser.id),portalEmail:normal(ctx.portalUser.email),
    nonce:randomBytes(16).toString("hex"),iat:now,exp:now+TTL,
  };
  const part=Buffer.from(JSON.stringify(claims)).toString("base64url");
  const sig=createHmac("sha256",sessionSecret())
    .update(CHALLENGE_DOMAIN+part).digest("base64url");
  return part+"."+sig;
}
function validChallenge(challenge,ctx) {
  const token=decode(challenge,1600);
  if(!token||token.signature.length!==43||!contextValid(ctx))return false;
  const expected=createHmac("sha256",sessionSecret())
    .update(CHALLENGE_DOMAIN+token.part).digest("base64url");
  if(!constantEqual(expected,token.signature))return false;
  const c=token.claims,now=Date.now();
  return c.v===1&&c.purpose==="cst-portal-company-self-approval"&&
    c.companyId===1&&c.requestId===Number(ctx.requestId)&&
    c.applicantId===Number(ctx.applicantId)&&
    c.portalUserId===Number(ctx.portalUser.id)&&
    c.portalEmail===normal(ctx.portalUser.email)&&
    typeof c.nonce==="string"&&/^[a-f0-9]{32}$/.test(c.nonce)&&
    Number.isSafeInteger(c.iat)&&Number.isSafeInteger(c.exp)&&
    c.iat<=now+5000&&c.exp>now&&c.exp-c.iat===TTL;
}
function verifier() {
  const raw=(process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV??"").trim();
  if(raw.length<50||raw.length>200||!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))
    throw fail();
  const key=createPublicKey({key:Buffer.from(raw,"base64"),format:"der",type:"spki"});
  if(key.asymmetricKeyType!=="ed25519")throw fail();
  return key;
}
export function trustedDevBizPortalOrigin(env=process.env) {
  if(!isDevCompanySelfApprovalEnabled(env))throw fail();
  const raw=(env.CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV??"").trim();
  let u;
  try{u=new URL(raw);}catch{throw fail();}
  if(u.origin!==raw||u.username||u.password||
     !(u.protocol==="https:"||(u.protocol==="http:"&&u.hostname==="127.0.0.1")))
    throw fail();
  return raw;
}
/** Return a trusted identity only after both signatures and exact context match. */
export function verifyDevCompanySelfApproval({challenge,proof,...ctx}) {
  if(!validChallenge(challenge,ctx))return false;
  const token=decode(proof,1700);
  if(!token||token.signature.length!==86)return false;
  const c=token.claims,now=Date.now();
  if(c.v!==1||c.purpose!=="cst-company-affiliation-self-approval"||
     c.aud!=="CST_CUSTOMER_PORTAL_DEV"||
     typeof c.actorId!=="string"||c.actorId.length<1||c.actorId.length>256||
     typeof c.email!=="string"||c.email!==normal(ctx.portalUser.email)||
     c.companyId!==1||c.requestId!==Number(ctx.requestId)||
     c.applicantId!==Number(ctx.applicantId)||
     c.portalUserId!==Number(ctx.portalUser.id)||
     c.challengeDigest!==createHash("sha256").update(challenge).digest("hex")||
     typeof c.nonce!=="string"||!/^[a-f0-9]{32}$/.test(c.nonce)||
     !Number.isSafeInteger(c.iat)||!Number.isSafeInteger(c.exp)||
     c.iat>now+5000||c.exp<=now||c.exp-c.iat!==60_000)return false;
  try {
    if(!verify(null,Buffer.from(PROOF_DOMAIN+token.part),
        verifier(),Buffer.from(token.signature,"base64url")))return false;
  }catch{return false;}
  return {
    actorId:c.actorId,email:c.email,
    proofFingerprint:createHash("sha256").update(proof,"utf8").digest("hex").slice(0,24),
  };
}
