// @ts-nocheck — isolated Node/crypto/HTTP approval handoff, no live DB or secrets.
import {beforeEach,afterEach,describe,it,expect} from "vitest";
import {createHash,createPrivateKey,createPublicKey,hkdfSync,sign} from "node:crypto";
import {mintPortalInvoiceChallenge} from "../server/dev-bizportal-invoice-attestation.mjs";
import {
 receiveDevRemoteOwnerProof,readDevRemoteOwnerProof,
 resetDevRemoteOwnerReceiptsForTest,isDevRemoteInvoiceOwnerEnabled,
} from "../server/dev-invoice-owner-receipt.mjs";

const keys=[
 "APP_ENV","SESSION_SECRET","CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
 "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
 "CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV",
 "CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV","CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV",
];
const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const issuer={id:46,role:"admin",email:"staff-issuer@example.invalid"};
const owner={id:"qa-canonical-owner",email:"owner-super@example.invalid"};
const seed=hkdfSync("sha256",Buffer.from("qa-bizportal-otp-signer-secret-very-long-123"),
 Buffer.from("CST_BIZPORTAL_DEV_SESSION_DERIVED_KEY_V1"),
 Buffer.from("CUSTOMER_INVOICE_ED25519_ATTESTATION_V1"),32);
const key=createPrivateKey({key:Buffer.concat([
 Buffer.from("302e020100300506032b657004220420","hex"),Buffer.from(seed)]),
 format:"der",type:"pkcs8"});
const spki=createPublicKey(key).export({format:"der",type:"spki"}).toString("base64");
function fresh(companyId=1,invoiceId=77) {
 const challenge=mintPortalInvoiceChallenge({portalUser:issuer,companyId,invoiceId,
   invoiceSnapshot:{documentNumber:"SO-QA-77",grandTotal:"123.45"}});
 const now=Date.now();
 const claims={v:1,purpose:"cst-customer-invoice-owner",aud:"CST_CUSTOMER_PORTAL_DEV",
  actorId:owner.id,email:owner.email,invoiceId,companyId,
  challengeDigest:createHash("sha256").update(challenge).digest("hex"),
  nonce:"c".repeat(32),iat:now,exp:now+60_000};
 const body=Buffer.from(JSON.stringify(claims)).toString("base64url");
 const signature=sign(null,Buffer.from("CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"+body),key).toString("base64url");
 return {challenge,proof:body+"."+signature};
}
beforeEach(()=>{
 resetDevRemoteOwnerReceiptsForTest();
 process.env.APP_ENV="development";
 process.env.SESSION_SECRET="qa-portal-issuer-signing-secret-over-32-chars";
 process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV="true";
 process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV="true";
 process.env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV="true";
 process.env.CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV="true";
 process.env.CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV=spki;
});
afterEach(()=>{
 resetDevRemoteOwnerReceiptsForTest();
 for(const k of keys) original[k]===undefined?delete process.env[k]:process.env[k]=original[k];
});
describe("single Owner OTP remote receipt: signed-only, issuer-bound and expiring",()=>{
 it.each([1,3])("accepts signed Owner receipt and delivers only to the same Portal issuer for company %i",(companyId)=>{
  const evidence=fresh(companyId);
  expect(owner.email).not.toBe(issuer.email);
  expect(readDevRemoteOwnerProof({...evidence,portalUser:issuer,invoiceId:77})).toEqual({approved:false});
  expect(receiveDevRemoteOwnerProof(evidence)).toEqual({accepted:true});
  expect(readDevRemoteOwnerProof({...evidence,portalUser:issuer,invoiceId:77}))
   .toEqual({approved:true,proof:evidence.proof});
 });
 it("rejects a different Portal user, invoice, or tenant",( )=>{
  const e=fresh();
  receiveDevRemoteOwnerProof(e);
  for(const patch of [
   {portalUser:{...issuer,id:47},invoiceId:77},
   {portalUser:{...issuer,email:"other-issuer@example.invalid"},invoiceId:77},
   {portalUser:issuer,invoiceId:78},
   {portalUser:{...issuer,role:"customer"},invoiceId:77},
  ])expect(()=>readDevRemoteOwnerProof({...e,...patch})).toThrow();
 });
 it("rejects an invalid, unsigned, or tampered approval and HMAC challenge",()=>{
  const e=fresh();
  for(const item of [
   {challenge:"a.b",proof:e.proof},
   {challenge:e.challenge,proof:"fake-proof"},
   {challenge:e.challenge.slice(0,-3)+"xxx",proof:e.proof},
   {challenge:e.challenge,proof:e.proof.slice(0,-3)+"xxx"},
  ])expect(()=>receiveDevRemoteOwnerProof(item)).toThrow();
  expect(readDevRemoteOwnerProof({...e,portalUser:issuer,invoiceId:77})).toEqual({approved:false});
 });
 it("does not let second approver overwrite a received signed receipt",()=>{
  const e=fresh();
  receiveDevRemoteOwnerProof(e);
  const other=fresh();
  // Fresh challenge is distinct; same signed challenge with a new valid
  // nonce/Owner proof cannot overwrite the first Owner's signature.
  const claims=JSON.parse(Buffer.from(e.proof.split(".")[0],"base64url").toString());
  claims.nonce="d".repeat(32);
  const body=Buffer.from(JSON.stringify(claims)).toString("base64url");
  const sig=sign(null,Buffer.from("CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"+body),key).toString("base64url");
  expect(receiveDevRemoteOwnerProof({challenge:e.challenge,proof:body+"."+sig}))
    .toEqual({accepted:true}); // idempotent same Owner
  expect(readDevRemoteOwnerProof({...e,portalUser:issuer,invoiceId:77}).proof).toBe(e.proof);
  claims.actorId="another-owner";
  claims.email="other.owner@example.invalid";
  const otherBody=Buffer.from(JSON.stringify(claims)).toString("base64url");
  const otherSig=sign(null,Buffer.from("CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"+otherBody),key).toString("base64url");
  expect(()=>receiveDevRemoteOwnerProof({challenge:e.challenge,proof:otherBody+"."+otherSig}))
    .toThrow();
  expect(readDevRemoteOwnerProof({...other,portalUser:issuer,invoiceId:77})).toEqual({approved:false});
 });
 it("blocks all receipt exchange when DEV flag is OFF or on PROD",()=>{
  const e=fresh();
  delete process.env.CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV;
  expect(isDevRemoteInvoiceOwnerEnabled()).toBe(false);
  expect(()=>receiveDevRemoteOwnerProof(e)).toThrow();
  expect(()=>readDevRemoteOwnerProof({...e,portalUser:issuer,invoiceId:77})).toThrow();
  process.env.CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV="true";
  process.env.APP_ENV="production";
  expect(()=>receiveDevRemoteOwnerProof(e)).toThrow();
 });
 it("never accepts an expired signed Portal challenge",()=>{
  const e=fresh();
  const now=Date.now;
  try {
    Date.now=()=>now()+120000;
    expect(()=>receiveDevRemoteOwnerProof(e)).toThrow();
  }finally{Date.now=now;}
 });
});
