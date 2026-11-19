/**
 * DEV-only transient relay for ONE signed Owner/Super Admin Invoice approval.
 * The BizPortal signer delivers the Ed25519 proof to this Portal over HTTPS;
 * the exact Portal Admin that opened the HMAC challenge can read it back.
 *
 * This is NOT a financial authority or journal writer. The original issuer
 * POST still independently verifies proof, locked canonical roles and RLS.
 * In-memory, bounded, ephemeral single-instance QA only. Restart fails
 * CLOSED (no phantom approval). Do not enable on horizontally scaled PROD.
 */
import { createHash } from "node:crypto";
import {
  isDualSuperAdminProofRequired,
  inspectSignedPortalInvoiceChallenge,
  verifyIndependentBizPortalSuperAdminProof,
} from "./dev-bizportal-invoice-attestation.mjs";

const TTL_MS=90_000;
const MAX_RECEIPTS=128;
const receipts=new Map();

function notAllowed(message="DEV remote Invoice approval is unavailable.") {
  const error=new Error(message);
  error.statusCode=403;
  return error;
}

export function isDevRemoteInvoiceOwnerEnabled(env=process.env) {
  return env.APP_ENV?.trim().toLowerCase()==="development" &&
    env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV==="true" &&
    env.CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV==="true" &&
    env.CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV==="true" &&
    isDualSuperAdminProofRequired();
}

function checkMode() {
  if (!isDevRemoteInvoiceOwnerEnabled())throw notAllowed();
}

function digest(challenge) {
  return createHash("sha256").update(challenge,"utf8").digest("hex");
}

function prune(now=Date.now()) {
  for(const [key,entry] of receipts) {
    if(entry.expiry<=now)receipts.delete(key);
  }
}

/** Unauthenticated delivery endpoint: authorization IS the exact signed proof. */
export function receiveDevRemoteOwnerProof({challenge,proof}) {
  checkMode();
  const context=inspectSignedPortalInvoiceChallenge(challenge);
  if(!context || !context.documentNumber || !context.amountCents ||
     typeof proof!=="string")throw notAllowed("Invalid signed Invoice approval.");
  const verified=verifyIndependentBizPortalSuperAdminProof({
    challenge,proof,portalUser:context.portalUser,
    invoiceId:context.invoiceId,companyId:context.companyId,
  });
  if(!verified || typeof verified.actorId!=="string") {
    throw notAllowed("Invalid signed Invoice approval.");
  }
  const now=Date.now();
  prune(now);
  const key=digest(challenge);
  const previous=receipts.get(key);
  // Never switch Owner identity after the first valid signed approval.
  if(previous){
    // Idempotent retry from the SAME independently verified Owner is safe.
    // A second Owner cannot take over the signed approval, even with
    // another valid signature for the same Invoice challenge.
    if(previous.actorId!==verified.actorId || previous.email!==verified.email)
      throw notAllowed("Invoice approval was already received.");
    return {accepted:true};
  }
  if(receipts.size>=MAX_RECEIPTS)throw notAllowed("Invoice approval relay is full.");
  receipts.set(key,{proof,actorId:verified.actorId,email:verified.email,
    expiry:Math.min(now+TTL_MS,context.expiresAt)});
  return {accepted:true};
}

/** Authenticated poll: challenge issuer ID+email+invoice must match exactly. */
export function readDevRemoteOwnerProof({challenge,portalUser,invoiceId}) {
  checkMode();
  const context=inspectSignedPortalInvoiceChallenge(challenge);
  if(!context ||
     context.invoiceId!==Number(invoiceId) ||
     context.portalUser.id!==Number(portalUser?.id) ||
     context.portalUser.email!==portalUser?.email?.trim().toLowerCase() ||
     portalUser?.role!=="admin")throw notAllowed("Invalid Invoice approval session.");
  prune();
  const value=receipts.get(digest(challenge));
  return value ? {approved:true,proof:value.proof} : {approved:false};
}

/** Only tests can clear ephemeral state; no exposed public API. */
export function resetDevRemoteOwnerReceiptsForTest() {receipts.clear();}
