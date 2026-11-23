/**
 * DEV-only policy for privileged portal sessions.
 * An Admin may establish a session only after the real Email OTP verifier
 * succeeds. Customer/vendor authentication methods are unchanged.
 */
export function isAdminEmailOtpOnlyEnabled(env = process.env) {
  return env.APP_ENV === "development" &&
    env.NODE_ENV !== "production" &&
    env.REPLIT_DEPLOYMENT !== "1" &&
    env.CUSTOMER_PORTAL_ADMIN_EMAIL_OTP_ONLY === "true";
}

export function isPortalLoginMethodAllowed(user, authMethod, env = process.env) {
  if (!isAdminEmailOtpOnlyEnabled(env)) return true;
  if (String(user?.role ?? "").trim().toLowerCase() !== "admin") return true;
  return authMethod === "email_otp";
}
