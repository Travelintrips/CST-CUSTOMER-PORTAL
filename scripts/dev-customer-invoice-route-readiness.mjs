/**
 * Read-only, unauthenticated DEV Invoice route audit.
 *
 * This intentionally DOES NOT infer that an issuer exists from HTTP 401:
 * unrelated /api/auth/* URLs can return the same generic auth fallback.
 * It never authenticates, submits an invoice, mutates an account, or changes flags.
 */
export function interpretRouteReadiness({
  portalConfigStatus, portalChallengeStatus,
  bizIssuerStatus, bizNonexistentStatus,
}) {
  const valid = [portalConfigStatus,portalChallengeStatus,bizIssuerStatus,bizNonexistentStatus]
    .every(n=>Number.isSafeInteger(n) && n>=100 && n<=599);
  if(!valid)throw Error("INVALID_ROUTE_STATUS");
  const portalKnown = portalConfigStatus===401 && portalChallengeStatus===401;
  const bizNonSpecific = bizIssuerStatus===bizNonexistentStatus;
  return {
    portalRoutesPresent:portalKnown,
    bizIssuerVerified:false,
    bizIssuerAmbiguousFallback:bizNonSpecific,
    go:false,
    reason:!portalKnown?"PORTAL_ROUTES_NOT_VERIFIED"
      :bizNonSpecific?"BIZPORTAL_AUTH_FALLBACK_INDISTINGUISHABLE"
      :"BIZPORTAL_ISSUER_REQUIRES_AUTHENTICATED_ATTESTATION",
  };
}
export async function probeDevInvoiceRoutes({portalOrigin,bizportalOrigin,fetchImpl=fetch}) {
  for(const origin of [portalOrigin,bizportalOrigin]){
    const u=new URL(origin);
    if(u.origin!==origin || u.protocol!=="https:" || u.username || u.password)
      throw Error("INVALID_DEV_ORIGIN");
  }
  async function status(url) {
    const res=await fetchImpl(url,{method:"GET",redirect:"manual",credentials:"omit",cache:"no-store"});
    return res.status;
  }
  const [portalConfigStatus,portalChallengeStatus,bizIssuerStatus,bizNonexistentStatus]=await Promise.all([
    status(portalOrigin+"/api/portal/admin/accounting/attestation-config"),
    status(portalOrigin+"/api/portal/admin/invoices/101/accounting-challenge"),
    status(bizportalOrigin+"/api/auth/dev/customer-invoice-attestation?challenge=bad"),
    status(bizportalOrigin+"/api/auth/cst-check-nonexistent-invoice-issuer"),
  ]);
  return interpretRouteReadiness({portalConfigStatus,portalChallengeStatus,bizIssuerStatus,bizNonexistentStatus});
}
