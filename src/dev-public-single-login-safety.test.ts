import { describe, it, expect, vi, afterEach } from "vitest";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSession, verifySession, sessionCookies, clearSessionCookies } from "../server/session.mjs";

const backend = readFileSync(resolve(process.cwd(),"server/index.mjs"),"utf8");
const provider = readFileSync(resolve(process.cwd(),"server/auth-providers.mjs"),"utf8");

afterEach(() => { vi.unstubAllEnvs(); });

function configure(flag: boolean) {
 vi.stubEnv("APP_ENV","development");
 vi.stubEnv("NODE_ENV","development");
 vi.stubEnv("SESSION_SECRET","synthetic-dev-session-secret-for-isolated-tests-2026");
 vi.stubEnv("CUSTOMER_PORTAL_DEV_SINGLE_LOGIN",flag?"true":"false");
}

function synthLegacyToken() {
 const payload=Buffer.from(JSON.stringify({
  id:12345,email:"only-a-test@example.invalid",role:"admin",exp:Date.now()+60000
 })).toString("base64url");
 const signature=crypto.createHmac("sha256","cst-dev-portal-fallback-2025").update(payload).digest("hex");
 return "devportal."+payload+"."+signature;
}

describe("DEV public single sign-in protective boundaries",()=>{
 it("disables predictable legacy devportal tokens only when public DEV mode is ON",()=>{
  configure(false);
  const token=synthLegacyToken();
  expect(verifySession(token)).toMatchObject({role:"admin",tokenFamily:"devportal"});
  configure(true);
  expect(verifySession(token)).toBeNull();
 });
 it("preserves normal signed Google/password-backed JWT sessions",()=>{
  configure(true);
  const token=createSession({id:12345,email:"only-a-test@example.invalid",role:"admin"});
  expect(verifySession(token)).toMatchObject({id:12345,role:"admin",tokenFamily:"portal-jwt"});
 });
 it("marks every session cookie Secure on HTTPS public DEV, without affecting traditional internal DEV",()=>{
  configure(true);
  const token=createSession({id:12345,email:"only-a-test@example.invalid",role:"customer"});
  expect(sessionCookies(token)).toHaveLength(2);
  for(const cookie of [...sessionCookies(token),...clearSessionCookies()]) {
   expect(cookie).toContain("Secure");
   expect(cookie).toContain("SameSite=Lax");
  }
  configure(false);
  expect(sessionCookies(token)[0]).not.toContain("Secure");
 });
 it("disables unauthenticated dev-login endpoint and test OTP disclosure in public DEV",()=>{
  expect(backend).toContain("if (IS_PRODUCTION || DEV_PUBLIC_SINGLE_LOGIN)");
  expect(provider).toContain('!IS_PRODUCTION && !DEV_PUBLIC_SINGLE_LOGIN');
  expect(provider).toContain('!IS_PRODUCTION && process.env.REPLIT_DEPLOYMENT !== "1" && !DEV_PUBLIC_SINGLE_LOGIN');
  expect(provider).toContain('...(SAFE_DEV_AUTH ? { _dev_code: code } : {})');
  expect(provider).toContain('...(SAFE_DEV_AUTH ? { _dev_reset_url: resetUrl.toString() } : {})');
  expect(provider).toContain('IS_PRODUCTION || DEV_PUBLIC_SINGLE_LOGIN ? "; Secure" : ""');
 });
 it("enables production-equivalent cross-site mutation checks in public DEV only",()=>{
  expect(backend).toContain('if ((!IS_PRODUCTION && !DEV_PUBLIC_SINGLE_LOGIN) || !MUTATION_METHODS.has(request.method ?? "")) return;');
  expect(backend).toContain('"Cross-site mutation is not allowed."');
  expect(backend).toContain('"Mutation request provenance is required."');
 });
});
