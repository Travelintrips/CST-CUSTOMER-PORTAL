/**
 * Opt-in DEV-only, fail-closed single Owner OTP handoff for a separately
 * authenticated BizPortal device. No financial write, DB grant or new login.
 * Process-local state is intentionally volatile; restart/multi-instance
 * deployment discards pending approvals instead of reusing untrusted proof.
 */
import { createHash, randomBytes } from "node:crypto";
import {
  invoiceReviewSnapshotRequired,invoiceOwnerReviewDigest,
  assertSameInvoiceReviewDigest,
} from "./dev-invoice-owner-review-snapshot.mjs";

const TTL_MS = 80_000;
const MAX_PENDING = 64;
const pending = new Map();
const hash = (v) => createHash("sha256").update(v,"utf8").digest("hex");
const invalid = () => Object.assign(new Error("Persetujuan Invoice DEV tidak tersedia atau kedaluwarsa."),{statusCode:403});
const normalize = (v) => typeof v === "string" ? v.trim().toLowerCase() : "";

export function isInvoiceOwnerHandoffEnabled(env=process.env) {
  return env.APP_ENV?.trim().toLowerCase() === "development" &&
    env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true" &&
    env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV === "true" &&
    env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV === "true" &&
    env.CUSTOMER_PORTAL_INVOICE_CROSS_DEVICE_HANDOFF_DEV === "true" &&
    invoiceReviewSnapshotRequired(env);
}
export function isTrustedInvoiceOwnerHandoffPost(request,env=process.env) {
  if (!isInvoiceOwnerHandoffEnabled(env) || request?.method !== "POST" ||
      request.headers?.cookie ||
      !["cross-site","same-site"].includes(request.headers?.["sec-fetch-site"]) ||
      !String(request.headers?.["content-type"] ?? "").startsWith(
        "application/x-www-form-urlencoded")) return false;
  const origin=String(request.headers.origin??"");
  let approved;
  try {
    approved=new URL(env.CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV);
  }catch{return false;}
  if(approved.origin!==env.CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV ||
     !(approved.protocol==="https:" ||
       (approved.protocol==="http:"&&approved.hostname==="127.0.0.1")) ||
     origin!==approved.origin) return false;
  try {
    const path=new URL(request.url??"/","http://portal.invalid").pathname;
    return /^\/api\/portal\/dev\/invoice-owner-handoff\/[A-Za-z0-9_-]{43}$/.test(path);
  }catch{return false;}
}
function prune(now) {
  for (const [ticket,request] of pending) {
    if (request.expiresAt <= now || request.taken) pending.delete(ticket);
  }
}
export function createInvoiceOwnerHandoff({
  issuer,invoiceId,companyId,challenge,bizportalOrigin,reviewSnapshot,
  now=Date.now(),env=process.env,
}) {
  if (!isInvoiceOwnerHandoffEnabled(env) || issuer?.role!=="admin" ||
      !Number.isSafeInteger(Number(issuer.id)) || Number(issuer.id)<=0 ||
      !normalize(issuer.email) || !Number.isSafeInteger(invoiceId) ||
      invoiceId<1 || ![1,3].includes(companyId) ||
      typeof challenge!=="string" || challenge.length<60 || challenge.length>1600) {
    throw invalid();
  }
  let reviewDigest;
  try {
    reviewDigest=invoiceOwnerReviewDigest(reviewSnapshot);
    if(!reviewSnapshot || reviewSnapshot.companyId!==companyId ||
        reviewSnapshot.invoiceId!==invoiceId)throw invalid();
  }catch{throw invalid();}
  let origin;
  try {
    origin=new URL(bizportalOrigin);
    if(origin.origin!==bizportalOrigin || origin.username || origin.password ||
       !(origin.protocol==="https:" || (origin.protocol==="http:" && origin.hostname==="127.0.0.1")))
      throw invalid();
  }catch{throw invalid();}
  prune(now);
  if(pending.size>=MAX_PENDING)throw Object.assign(new Error("Antrean otorisasi Invoice DEV penuh."),{statusCode:503});
  const ticket=randomBytes(32).toString("base64url");
  pending.set(hash(ticket),{
    issuerId:Number(issuer.id),issuerEmail:normalize(issuer.email),
    invoiceId,companyId,challenge,reviewSnapshot,reviewDigest,
    expiresAt:now+TTL_MS,proof:null,taken:false,
  });
  return {
    ticket,
    approvalUrl:origin.origin+"/api/auth/dev/customer-invoice-attestation?challenge="+
      encodeURIComponent(challenge)+"&handoff="+encodeURIComponent(ticket),
    expiresInSeconds:TTL_MS/1000,
  };
}
// Capability-scoped read-only summary; no customer data in the URL or
// in the signed HMAC challenge (only its digest). The ticket expires in 80s.
export function readInvoiceOwnerHandoffReview({
  ticket,now=Date.now(),env=process.env,
}) {
  if(!isInvoiceOwnerHandoffEnabled(env) || typeof ticket!=="string" ||
     !/^[A-Za-z0-9_-]{43}$/.test(ticket))throw invalid();
  prune(now);
  const row=pending.get(hash(ticket));
  if(!row || row.taken || row.expiresAt<=now)throw invalid();
  assertSameInvoiceReviewDigest(row.reviewDigest,invoiceOwnerReviewDigest(row.reviewSnapshot));
  return {snapshot:row.reviewSnapshot,digest:row.reviewDigest};
}
export function submitInvoiceOwnerHandoff({
  ticket,proof,verify,now=Date.now(),env=process.env,
}) {
  if(!isInvoiceOwnerHandoffEnabled(env)||typeof ticket!=="string"||
     !/^[A-Za-z0-9_-]{43}$/.test(ticket) ||typeof proof!=="string"||
     proof.length<60||proof.length>1700||typeof verify!=="function")throw invalid();
  prune(now);
  const row=pending.get(hash(ticket));
  if(!row || row.taken || row.proof || row.expiresAt<=now)throw invalid();
  // The submitted proof is verified against the signed original issuer,
  // company, Invoice and challenge. Its actor is NOT trusted by HTTP input.
  const actor=verify({
    challenge:row.challenge,proof,
    portalUser:{id:row.issuerId,email:row.issuerEmail,role:"admin"},
    invoiceId:row.invoiceId,companyId:row.companyId,
  });
  if(!actor || typeof actor.actorId!=="string" || typeof actor.email!=="string")
    throw invalid();
  row.proof=proof;
  return {accepted:true};
}
export function takeInvoiceOwnerHandoff({
  ticket,issuer,invoiceId,now=Date.now(),env=process.env,
}) {
  if(!isInvoiceOwnerHandoffEnabled(env)||issuer?.role!=="admin"||
     typeof ticket!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(ticket))throw invalid();
  prune(now);
  const id=hash(ticket),row=pending.get(id);
  if(!row || row.taken || row.expiresAt<=now ||
     row.issuerId!==Number(issuer.id) ||
     row.issuerEmail!==normalize(issuer.email) ||
     row.invoiceId!==invoiceId)throw invalid();
  if(!row.proof)return {ready:false};
  row.taken=true;
  pending.delete(id);
  return {ready:true,bizportalInvoiceChallenge:row.challenge,bizportalInvoiceProof:row.proof};
}
/** Test/worker shutdown hook only: discards all pending ephemeral approvals. */
export function resetInvoiceOwnerHandoffsForQa(){pending.clear();}
