/**
 * DEV-only dual-auth Customer Invoice attestation.
 *
 * Portal controls its signed Invoice challenge; BizPortal independently
 * authenticates its own signed Super Admin session and returns an Ed25519
 * assertion over the challenge. Customer Portal pins ONLY BizPortal's public
 * key, never its session secret or password.
 *
 * No filesystem, DB pool, HTTP callback or PROD access in this module.
 */
import {
  createHmac, createHash, createPublicKey, randomBytes, timingSafeEqual, verify,
} from "node:crypto";

const CHALLENGE_DOMAIN="CST_PORTAL_CUSTOMER_INVOICE_CHALLENGE_V1\n";
const PROOF_DOMAIN="CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n";
const TTL=90_000;

export function isDualSuperAdminProofRequired() {
  return process.env.APP_ENV?.trim().toLowerCase()==="development" &&
    process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV==="true" &&
    process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV==="true";
}

function portalKey() {
  const secret=process.env.SESSION_SECRET;
  if(typeof secret!=="string"||secret.trim().length<32)
    throw Error("DEV_PORTAL_ATTESTATION_SIGNING_UNAVAILABLE");
  return secret;
}

function strictDecode(token,maxLength) {
  if(typeof token!=="string"||token.length<60||token.length>maxLength ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return null;
  const parts=token.split(".");
  if(parts.length!==2)return null;
  let parsed;
  try {
    const decoded=Buffer.from(parts[0],"base64url").toString("utf8");
    if(Buffer.from(decoded,"utf8").toString("base64url")!==parts[0])return null;
    parsed=JSON.parse(decoded);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return null;
  }catch{return null;}
  return {body:parts[0],signature:parts[1],claims:parsed};
}
function equal(a,b) {
  const x=Buffer.from(a,"utf8"),y=Buffer.from(b,"utf8");
  return x.length===y.length && timingSafeEqual(x,y);
}
function emailOf(user) {
  return typeof user?.email==="string"?user.email.trim().toLowerCase():"";
}
function validateContext(ctx) {
  if(![1,3].includes(Number(ctx?.companyId)) ||
      !Number.isSafeInteger(Number(ctx?.invoiceId)) ||
      Number(ctx.invoiceId)<1 ||
      !Number.isSafeInteger(Number(ctx?.portalUser?.id)) ||
      Number(ctx.portalUser.id)<1 ||
      ctx.portalUser.role!=="admin" ||
      !emailOf(ctx.portalUser) ||
      emailOf(ctx.portalUser).length>320) {
    throw Error("DEV_PORTAL_ATTESTATION_CONTEXT_INVALID");
  }
}

// Canonical fixed-cent source amount; no JS floating-point rounding ambiguity.
// Read only from a database-owned sales_documents row, never from HTTP body.
function invoiceSnapshot(ctx) {
  const v=ctx?.invoiceSnapshot;
  if(!v)return null;
  const documentNumber=v.documentNumber;
  const raw=String(v.grandTotal??"").trim();
  if(typeof documentNumber!=="string" || documentNumber.length<1 ||
     documentNumber.length>90 || !/^[a-zA-Z0-9_./-]+$/.test(documentNumber) ||
     !/^[0-9]{1,12}(?:\.[0-9]{1,2})?$/.test(raw)) {
    throw Error("DEV_INVOICE_SNAPSHOT_INVALID");
  }
  const [whole,fraction=""]=raw.split(".");
  return {documentNumber,amountCents:
    (BigInt(whole)*100n+BigInt((fraction+"00").slice(0,2))).toString()};
}

/** Only server-generated for a signed, DB-checked Portal admin and real Invoice. */
export function mintPortalInvoiceChallenge(ctx) {
  if(!isDualSuperAdminProofRequired())throw Error("DEV_PORTAL_ATTESTATION_NOT_ENABLED");
  validateContext(ctx);
  const now=Date.now();
  const claims={
    v:1,purpose:"cst-portal-invoice-challenge",
    invoiceId:Number(ctx.invoiceId),companyId:Number(ctx.companyId),
    portalUserId:Number(ctx.portalUser.id),portalEmail:emailOf(ctx.portalUser),
    iat:now,exp:now+TTL,nonce:randomBytes(16).toString("hex"),
  };
  const snapshot=invoiceSnapshot(ctx);
  if(snapshot)Object.assign(claims,snapshot);
  const body=Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature=createHmac("sha256",portalKey())
    .update(CHALLENGE_DOMAIN+body).digest("base64url");
  return body+"."+signature;
}

function verifyChallenge(challenge,ctx) {
  const t=strictDecode(challenge,1600);
  if(!t||t.signature.length!==43)return false;
  const signed=createHmac("sha256",portalKey())
    .update(CHALLENGE_DOMAIN+t.body).digest("base64url");
  if(!equal(t.signature,signed))return false;
  const c=t.claims,now=Date.now();
  return c.v===1&&c.purpose==="cst-portal-invoice-challenge" &&
    c.invoiceId===Number(ctx.invoiceId)&&c.companyId===Number(ctx.companyId)&&
    c.portalUserId===Number(ctx.portalUser.id)&&
    c.portalEmail===emailOf(ctx.portalUser)&&
    typeof c.nonce==="string"&&/^[a-f0-9]{32}$/.test(c.nonce)&&
    Number.isSafeInteger(c.iat)&&Number.isSafeInteger(c.exp)&&
    c.iat<=now+5000&&c.exp>now&&c.exp-c.iat===TTL&&
    (!(c.documentNumber!=null||c.amountCents!=null) ||
      (typeof c.documentNumber==="string" &&
       /^[a-zA-Z0-9_./-]{1,90}$/.test(c.documentNumber) &&
       typeof c.amountCents==="string" && /^[0-9]{1,15}$/.test(c.amountCents) &&
       (!ctx.invoiceSnapshot || (() => {
         try {
           const snapshot=invoiceSnapshot(ctx);
           return snapshot.documentNumber===c.documentNumber &&
             snapshot.amountCents===c.amountCents;
         } catch {return false;}
       })())));
}

// Enables the network-received proof to be checked without trusting an
// unauthenticated HTTP caller for issuer identity or tenant. The challenge
// itself must be authenticated by the original Portal HMAC, not just decoded.
export function inspectSignedPortalInvoiceChallenge(challenge) {
  const token=strictDecode(challenge,1600);
  if(!token)return null;
  const c=token.claims;
  if(!Number.isSafeInteger(c.portalUserId) || c.portalUserId<1 ||
     typeof c.portalEmail!=="string" ||
     c.portalEmail!==c.portalEmail.trim().toLowerCase() ||
     !Number.isSafeInteger(c.invoiceId) || c.invoiceId<1 ||
     ![1,3].includes(c.companyId)) return null;
  const portalUser={id:c.portalUserId,email:c.portalEmail,role:"admin"};
  try {
    if(!verifyChallenge(challenge,{portalUser,invoiceId:c.invoiceId,companyId:c.companyId}))return null;
  }catch{return null;}
  return {portalUser,invoiceId:c.invoiceId,companyId:c.companyId,expiresAt:c.exp,
    documentNumber:c.documentNumber??null,amountCents:c.amountCents??null};
}

function verifierKey() {
  const raw=(process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV??"").trim();
  if(raw.length<50||raw.length>200||!/^[A-Za-z0-9+/]+={0,2}$/.test(raw))
    throw Error("DEV_BIZPORTAL_ATTEST_PUBLIC_KEY_NOT_PINNED");
  const key=createPublicKey({key:Buffer.from(raw,"base64"),format:"der",type:"spki"});
  if(key.asymmetricKeyType!=="ed25519")throw Error("DEV_BIZPORTAL_ATTEST_WRONG_KEY_TYPE");
  return key;
}

/** Called by the Portal original mark_invoiced handler AFTER invoice FOR UPDATE
 * lock and after reading the existing canonical BizPortal actor from database.
 * Verify both app sessions and exact source/tenant/nonce binding.
 */
export function verifyIndependentBizPortalSuperAdminProof({
  challenge,proof,portalUser,invoiceId,companyId,canonicalActorId,invoiceSnapshot,
}) {
  if(!isDualSuperAdminProofRequired() ||
      process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV!=="true")
    throw Error("DEV_BIZPORTAL_ATTESTATION_NOT_ENABLED");
  const ctx={portalUser,invoiceId,companyId,invoiceSnapshot};
  validateContext(ctx);
  if(!verifyChallenge(challenge,ctx))return false;
  const token=strictDecode(proof,1700);
  if(!token||token.signature.length!==86)return false;
  const c=token.claims,now=Date.now();
  if(c.v!==1||c.purpose!=="cst-customer-invoice-owner"||
     c.aud!=="CST_CUSTOMER_PORTAL_DEV"||
     typeof c.actorId!=="string"||c.actorId.length<1||c.actorId.length>256||
     (canonicalActorId!=null && c.actorId!==canonicalActorId)||
     typeof c.email!=="string"||c.email.length<3||c.email.length>320||
     c.email!==c.email.trim().toLowerCase()||!c.email.includes("@")||
     c.invoiceId!==Number(invoiceId)||
     c.companyId!==Number(companyId)||
     c.challengeDigest!==createHash("sha256").update(challenge,"utf8").digest("hex")||
     typeof c.nonce!=="string"||!/^[a-f0-9]{32}$/.test(c.nonce)||
     !Number.isSafeInteger(c.iat)||!Number.isSafeInteger(c.exp)||
     c.iat>now+5000||c.exp<=now||c.exp-c.iat!==60_000)return false;
  try {
    if(!verify(null,Buffer.from(PROOF_DOMAIN+token.body),
      verifierKey(),Buffer.from(token.signature,"base64url")))return false;
    // These claims are now trusted because the signature, Portal challenge,
    // tenant, Invoice and nonce/expiry were verified above. The caller MUST
    // still lock and check the active canonical Super Admin row in PostgreSQL.
    return {actorId:c.actorId,email:c.email};
  }catch{return false;}
}
