import { afterEach, describe, expect, it } from "vitest";
import { createSession, verifySession } from "../server/session.mjs";

const old = {
  APP_ENV: process.env.APP_ENV,
  NODE_ENV: process.env.NODE_ENV,
  PORTAL_JWT_SECRET: process.env.PORTAL_JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

afterEach(() => {
  for (const [key, value] of Object.entries(old)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("signed Portal Email OTP provenance", () => {
  it("preserves only the verified Email OTP auth method in the signed session", () => {
    process.env.APP_ENV = "development";
    process.env.NODE_ENV = "development";
    process.env.PORTAL_JWT_SECRET = "test-portal-jwt-secret-only-for-unit-tests";
    process.env.SESSION_SECRET = "test-session-secret-only-for-unit-tests";
    const base = {
      id: 501,
      email: "owner@example.invalid",
      role: "admin",
      auth_version: 0,
    };
    const otp = verifySession(createSession({ ...base, authMethod: "email_otp" }));
    expect(otp).toMatchObject({ id: 501, role: "admin", authMethod: "email_otp" });

    for (const authMethod of ["password", "google", "wa_otp", "wa_trusted", null]) {
      const session = verifySession(createSession({ ...base, authMethod }));
      expect(session).toMatchObject({ id: 501, role: "admin", authMethod: null });
    }

    // A session minted before the provenance claim existed is never treated
    // as an Email OTP-authenticated session.
    const legacy = verifySession(createSession(base));
    expect(legacy?.authMethod ?? null).toBe(null);
  });
});
