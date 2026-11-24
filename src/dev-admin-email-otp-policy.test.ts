import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  isAdminEmailOtpOnlyEnabled,
  isPortalLoginMethodAllowed,
} from "../server/dev-admin-email-otp-policy.mjs";

const dev = {
  APP_ENV: "development",
  NODE_ENV: "development",
  REPLIT_DEPLOYMENT: "",
  CUSTOMER_PORTAL_ADMIN_EMAIL_OTP_ONLY: "true",
};

describe("DEV Admin Email OTP-only login", () => {
  it("allows only a successfully verified Email OTP method for Admin", () => {
    expect(isPortalLoginMethodAllowed({ role: "admin" }, "email_otp", dev)).toBe(true);
    for (const method of [null, "password", "google", "wa_otp", "wa_trusted", "dev_login"]) {
      expect(isPortalLoginMethodAllowed({ role: "admin" }, method, dev)).toBe(false);
    }
  });

  it("applies the policy at the central authenticated API boundary", () => {
    const source = readFileSync("server/index.mjs", "utf8");
    expect(source).toContain('isPortalLoginMethodAllowed(user, session.authMethod ?? null)');
    expect(source).toContain('sendError(response, 401, "Admin session requires a fresh Email OTP login.")');
    // Reissuing a cookie via /auth/set-cookie must not resurrect a legacy Admin session.
    expect(source).toContain('isPortalLoginMethodAllowed(session, session.authMethod ?? null)');
    expect(source).toContain('sendError(response, 401, "Admin session requires Email OTP login.")');
  });

  it("denies pre-existing Admin sessions without signed Email OTP provenance", () => {
    // Authorization also checks this contract on every authenticated API request.
    const previousAdminSession = { role: "admin", authMethod: null };
    const otpAdminSession = { role: "admin", authMethod: "email_otp" };
    expect(isPortalLoginMethodAllowed(previousAdminSession, previousAdminSession.authMethod, dev)).toBe(false);
    expect(isPortalLoginMethodAllowed(otpAdminSession, otpAdminSession.authMethod, dev)).toBe(true);
  });

  it("does not change customer or vendor login methods", () => {
    for (const role of ["customer", "vendor"]) {
      for (const method of [null, "password", "google", "wa_otp", "email_otp"]) {
        expect(isPortalLoginMethodAllowed({ role }, method, dev)).toBe(true);
      }
    }
  });

  it("is confined to DEV and cannot alter production authentication", () => {
    expect(isAdminEmailOtpOnlyEnabled(dev)).toBe(true);
    expect(isPortalLoginMethodAllowed({ role: "admin" }, "password", {
      ...dev, APP_ENV: "production",
    })).toBe(true);
    expect(isPortalLoginMethodAllowed({ role: "admin" }, "password", {
      ...dev, NODE_ENV: "production",
    })).toBe(true);
    expect(isPortalLoginMethodAllowed({ role: "admin" }, "password", {
      ...dev, REPLIT_DEPLOYMENT: "1",
    })).toBe(true);
    expect(isPortalLoginMethodAllowed({ role: "admin" }, "password", {
      ...dev, CUSTOMER_PORTAL_ADMIN_EMAIL_OTP_ONLY: "false",
    })).toBe(true);
  });
});
