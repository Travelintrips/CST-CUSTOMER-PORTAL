import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {
  isDevCompanySelfApprovalEnabled,mintDevCompanySelfApprovalChallenge,
  verifyDevCompanySelfApproval,trustedDevBizPortalOrigin,
} from "../server/dev-company-self-affiliation.mjs";

const reviewer={id:9,role:"admin",email:"owner-cst@example.invalid"};
const context={requestId:17,companyId:1,applicantId:9,portalUser:reviewer};
const keys=generateKeyPairSync("ed25519");
function proof(challenge:string,overrides:Record<string,unknown>={},domain="CST_BIZPORTAL_COMPANY_SELF_APPROVAL_DEV_V1\n") {
  const now=Date.now();
  const c={
    v:1,purpose:"cst-company-affiliation-self-approval",aud:"CST_CUSTOMER_PORTAL_DEV",
    actorId:"cst-owner-id",email:reviewer.email,companyId:1,requestId:17,
    applicantId:9,portalUserId:9,
    challengeDigest:createHash("sha256").update(challenge).digest("hex"),
    nonce:"d".repeat(32),iat:now,exp:now+60_000,...overrides,
  };
  const part=Buffer.from(JSON.stringify(c)).toString("base64url");
  const sig=sign(null,Buffer.from(domain+part),keys.privateKey).toString("base64url");
  return part+"."+sig;
}
beforeEach(()=>{
  vi.stubEnv("APP_ENV","development");
  vi.stubEnv("CUSTOMER_PORTAL_COMPANY_SELF_APPROVAL_DEV","true");
  vi.stubEnv("CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV","true");
  vi.stubEnv("CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV","true");
  vi.stubEnv("CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV","true");
  vi.stubEnv("CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV","https://bizportal-qa.example.invalid");
  vi.stubEnv("SESSION_SECRET","qa-portal-self-approval-test-secret-at-least-32-characters");
  vi.stubEnv("CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV",
    keys.publicKey.export({format:"der",type:"spki"}).toString("base64"));
});
afterEach(()=>{vi.useRealTimers();vi.unstubAllEnvs();});
describe("CST DEV self-affiliation requires independent purpose-separated signed proof",()=>{
  it("verifies a fresh BizPortal Super Admin token only for the exact application",()=>{
    const challenge=mintDevCompanySelfApprovalChallenge(context);
    const signed=proof(challenge);
    expect(verifyDevCompanySelfApproval({challenge,proof:signed,...context}))
      .toMatchObject({actorId:"cst-owner-id",email:reviewer.email,
        proofFingerprint:expect.stringMatching(/^[a-f0-9]{24}$/)});
    expect(trustedDevBizPortalOrigin()).toBe("https://bizportal-qa.example.invalid");
  });
  it("refuses another applicant, mismatched request, company or role",()=>{
    const challenge=mintDevCompanySelfApprovalChallenge(context);
    const signed=proof(challenge);
    for(const changes of [
      {requestId:18},{companyId:3},{applicantId:8},
      {portalUser:{...reviewer,role:"customer"}},
      {portalUser:{...reviewer,email:"another@example.invalid"}},
    ])expect(verifyDevCompanySelfApproval({challenge,proof:signed,...context,...changes})).toBe(false);
    expect(()=>mintDevCompanySelfApprovalChallenge({...context,applicantId:10})).toThrow();
  });
  it("never accepts an Invoice domain token, forged token or stale challenge",()=>{
    const challenge=mintDevCompanySelfApprovalChallenge(context);
    expect(verifyDevCompanySelfApproval({challenge,proof:proof(challenge,{},"CST_BIZPORTAL_CUSTOMER_INVOICE_DEV_V1\n"),...context})).toBe(false);
    expect(verifyDevCompanySelfApproval({challenge,proof:proof(challenge,{purpose:"cst-customer-invoice-owner"}),...context})).toBe(false);
    expect(verifyDevCompanySelfApproval({challenge,proof:proof(challenge,{exp:Date.now()-1}),...context})).toBe(false);
    expect(verifyDevCompanySelfApproval({challenge:challenge.slice(0,-1)+"X",proof:proof(challenge),...context})).toBe(false);
    vi.useFakeTimers();vi.setSystemTime(Date.now()+90_100);
    expect(verifyDevCompanySelfApproval({challenge,proof:proof(challenge),...context})).toBe(false);
  });
  it("defaults OFF and rejects an untrusted or PROD origin",()=>{
    vi.stubEnv("CUSTOMER_PORTAL_COMPANY_SELF_APPROVAL_DEV","false");
    expect(isDevCompanySelfApprovalEnabled()).toBe(false);
    expect(()=>mintDevCompanySelfApprovalChallenge(context)).toThrow();
    vi.stubEnv("CUSTOMER_PORTAL_COMPANY_SELF_APPROVAL_DEV","true");
    vi.stubEnv("CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV","https://evil.invalid/path");
    expect(()=>trustedDevBizPortalOrigin()).toThrow();
    vi.stubEnv("APP_ENV","production");
    expect(isDevCompanySelfApprovalEnabled()).toBe(false);
    expect(()=>mintDevCompanySelfApprovalChallenge(context)).toThrow();
  });
});
