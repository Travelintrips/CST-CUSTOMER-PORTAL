import { describe, expect, it } from "vitest";
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
