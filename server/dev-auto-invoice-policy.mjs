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

export function isEmailOtpAuthenticatedAdmin(user) {
  return user?.role === "admin" &&
    user?.authMethod === "email_otp" &&
    typeof user?.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim());
}

/**
 * The first automatic pilot is deliberately a single QA document.
 * Manual issuance and Owner review remain available for every other invoice.
 */
export function isAutomaticInvoicePilotInvoice(invoiceId, companyId) {
  return Number(invoiceId) === 108 && Number(companyId) === 1;
}
