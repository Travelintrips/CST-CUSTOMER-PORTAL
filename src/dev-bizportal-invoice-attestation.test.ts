// @ts-nocheck
import {beforeEach, afterEach, describe, expect, it} from "vitest";
import {
  createHash, createPrivateKey, createPublicKey, hkdfSync, sign,
} from "node:crypto";
import {
  mintPortalInvoiceChallenge, verifyIndependentBizPortalSuperAdminProof,
  assertInvoiceReviewChallengeMatchesSource,
} from "../server/dev-bizportal-invoice-attestation.mjs";

const SECRET="fixture-independent-bizportal-session-signing-secret-32-plus";
const KEYS=[
 "APP_ENV","SESSION_SECRET","CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
 "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
 "CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV",
 "CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV",
];
const original=Object.fromEntries(KEYS.map(key=>[key,process.env[key]]));
const prefix=Buffer.from("302e020100300506032b657004220420","hex");
const seed=hkdfSync("sha256",Buffer.from(SECRET),
  Buffer.from("CST_BIZPORTAL_DEV_SESSION_DERIVED_KEY_V1"),
  Buffer.from("CUSTOMER_INVOICE_ED25519_ATTESTATION_V1"),32);
const privateKey=createPrivateKey({key:Buffer.concat([prefix,Buffer.from(seed)]),
  format:"der",type:"pkcs8"});
const publicKey=(createPublicKey(privateKey).export({format:"der",type:"spki"})).toString("base64");
const user={id:15,role:"admin",email:"same.owner@example.invalid"};
const actorId="qa-canonical-super-admin";
const context=(companyId=1,invoiceId=77)=>({
  portalUser:user,companyId,invoiceId,canonicalActorId:actorId,
});
function createSignedProof(challenge,changes={}){
 const now=Date.now();
 const base={v:1,purpose:"cst-customer-invoice-owner",aud:"CST_CUSTOMER_PORTAL_DEV",
    actorId,email:user.email,invoiceId:77,companyId:1,
    challengeDigest:createHash("sha256").update(challenge).digest("hex"),
    nonce:"a".repeat(32),iat:now,exp:now+60_000,
    ...changes};
 const body=Buffer.from(JSON.stringify(base)).toString("base64url");
 const sig=sign(null,Buffer.from("CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"+body),
  privateKey).toString("base64url");
 return body+"."+sig;
}
beforeEach(()=>{
  process.env.APP_ENV="development";
  process.env.SESSION_SECRET="fixture-portal-independent-invoice-secret-longer-than-32";
  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV="true";
  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV="true";
  process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV="true";
  process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV=publicKey;
});
afterEach(()=>{for(const key of KEYS){
  if(original[key]===undefined)delete process.env[key];
  else process.env[key]=original[key];
}});
describe("signed Portal challenge + independent BizPortal Ed25519 proof",()=>{
  it("maintains an exact 60-second synthetic Owner proof TTL",()=>{
    const challenge=mintPortalInvoiceChallenge(context());
    const [body]=createSignedProof(challenge).split(".");
    const claims=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
    expect(claims.exp-claims.iat).toBe(60_000);
  });
  it("puts only SHA-256 source digest, never customer name or monetary values, inside the signed challenge",()=>{
    process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV="true";
    const ctx={...context(),reviewDigest:"a".repeat(64)};
    const challenge=mintPortalInvoiceChallenge(ctx);
    const claims=JSON.parse(Buffer.from(challenge.split(".")[0],"base64url").toString("utf8"));
    expect(claims.reviewDigest).toBe(ctx.reviewDigest);
    expect(claims).not.toHaveProperty("customerName");
    expect(claims).not.toHaveProperty("subtotal");
    expect(claims).not.toHaveProperty("ppn");
    expect(claims).not.toHaveProperty("total");
    expect(assertInvoiceReviewChallengeMatchesSource(challenge,ctx,ctx.reviewDigest)).toBe(true);
    expect(()=>assertInvoiceReviewChallengeMatchesSource(challenge,ctx,"b".repeat(64))).toThrow();
    delete process.env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV;
  });
  it("accepts only the exact canonical BizPortal owner, Portal user and CST invoice",()=>{
    const ctx=context();
    const challenge=mintPortalInvoiceChallenge(ctx);
    const proof=createSignedProof(challenge);
    expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof})).toEqual({actorId,email:user.email});
  });
  it("accepts Diva company3 only when the proof is for Diva",()=>{
    const ctx=context(3,77);
    const challenge=mintPortalInvoiceChallenge(ctx);
    const proof=createSignedProof(challenge,{companyId:3});
    expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof})).toEqual({actorId,email:user.email});
    expect(verifyIndependentBizPortalSuperAdminProof({...context(1),challenge,proof})).toBe(false);
  });
  it("blocks a second invoice even with valid signed BizPortal proof",()=>{
    const challenge=mintPortalInvoiceChallenge(context());
    const proof=createSignedProof(challenge);
    expect(verifyIndependentBizPortalSuperAdminProof({
      ...context(1,78),challenge,proof
    })).toBe(false);
  });
  it("blocks another Portal account despite the same BizPortal proof",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx);
    const proof=createSignedProof(challenge);
    expect(verifyIndependentBizPortalSuperAdminProof({
      ...ctx,portalUser:{...user,id:16},challenge,proof
    })).toBe(false);
  });
  it("blocks proof replay for a different canonical actor",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx);
    const proof=createSignedProof(challenge);
    expect(verifyIndependentBizPortalSuperAdminProof({
      ...ctx,canonicalActorId:"other",challenge,proof
    })).toBe(false);
  });
  it("fails closed if challenge is unsigned, tampered or missing",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    for(const altered of [undefined,"junk",challenge.slice(0,-4)+"AAAA"]){
      expect(verifyIndependentBizPortalSuperAdminProof({
        ...ctx,challenge:altered,proof
      })).toBe(false);
    }
  });
  it("fails closed on wrong proof issuer and signature tampering",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    for(const altered of [undefined,"bad",proof.slice(0,-3)+"AAA"]){
      expect(verifyIndependentBizPortalSuperAdminProof({
        ...ctx,challenge,proof:altered
      })).toBe(false);
    }
  });
  it("accepts a separately signed Owner identity while retaining the Portal issuer challenge",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx);
    const proof=createSignedProof(challenge,{actorId:"different-owner",email:"owner.approver@example.invalid"});
    expect(verifyIndependentBizPortalSuperAdminProof({
      portalUser:ctx.portalUser,companyId:ctx.companyId,invoiceId:ctx.invoiceId,challenge,proof,
    })).toEqual({actorId:"different-owner",email:"owner.approver@example.invalid"});
    expect(verifyIndependentBizPortalSuperAdminProof({
      portalUser:{...ctx.portalUser,id:999},companyId:ctx.companyId,invoiceId:ctx.invoiceId,challenge,proof,
    })).toBe(false);
  });
  it("rejects a signed proof for another company or malformed approver email",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx);
    for(const data of [{email:"NOT-NORMALIZED@example.invalid"},{companyId:3}]){
      const proof=createSignedProof(challenge,data);
      expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof})).toBe(false);
    }
  });
  it("rejects expired, future and overlong issuer proofs",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),now=Date.now();
    for(const data of [
      {iat:now-120_000,exp:now-60_000},
      {iat:now+60_000,exp:now+120_000},
      {iat:now,exp:now+500_000},
    ]){
      const proof=createSignedProof(challenge,data);
      expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof})).toBe(false);
    }
  });
  it("rejects modified Portal challenge expiry and valid proof of expired challenge",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    const [body,sig]=challenge.split(".");
    const data=JSON.parse(Buffer.from(body,"base64url").toString());
    data.exp=Date.now()-1;
    const changed=Buffer.from(JSON.stringify(data)).toString("base64url")+"."+sig;
    expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge:changed,proof})).toBe(false);
  });
  it("rejects missing or incorrect public-key pin",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    for(const pin of ["","INVALID",Buffer.alloc(44,1).toString("base64")]){
      process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV=pin;
      expect(verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof})).toBe(false);
    }
  });
  it("refuses missing independent-attestation opt-in",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    delete process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV;
    expect(()=>verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof}))
      .toThrow("DEV_BIZPORTAL_ATTESTATION_NOT_ENABLED");
  });
  it("refuses all proof issuance and verification in production",()=>{
    const ctx=context(),challenge=mintPortalInvoiceChallenge(ctx),proof=createSignedProof(challenge);
    process.env.APP_ENV="production";
    expect(()=>mintPortalInvoiceChallenge(ctx)).toThrow("DEV_PORTAL_ATTESTATION_NOT_ENABLED");
    expect(()=>verifyIndependentBizPortalSuperAdminProof({...ctx,challenge,proof}))
      .toThrow("DEV_BIZPORTAL_ATTESTATION_NOT_ENABLED");
  });
});
