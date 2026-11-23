/**
 * DEV-only automatic invoice release policy.
 * OTP authenticates the admin session once; every invoice is then checked
 * by the canonical company writer, the original PostingEngine, and AR/GL
 * constraints. The pilot is deliberately restricted to CST (company_id=1).
 */
export function isAutomaticInvoiceDevEnabled(env = process.env) {
  return env.APP_ENV?.trim().toLowerCase() === "development" &&
    env.NODE_ENV?.trim().toLowerCase() === "development" &&
    env.CUSTOMER_PORTAL_AUTO_INVOICE_DEV === "true" &&
    env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true" &&
    env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV === "true" &&
    env.CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV === "true";
}

export function isAutomaticInvoiceCompanyAllowed(companyId) {
  return Number(companyId) === 1;
}
