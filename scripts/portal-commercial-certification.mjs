#!/usr/bin/env node
import assert from "node:assert/strict";

const base = new URL(process.env.CUSTOMER_PORTAL_PRODUCTION_URL ?? "https://cstlogistic.co.id");
const expectedRelease = String(process.env.EXPECTED_RELEASE_SHA ?? "").trim();

async function request(path, options = {}) {
  const response = await fetch(new URL(path, base), { redirect: "manual", ...options });
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { response, body, text };
}

function status(result, expected, label) {
  assert.equal(result.response.status, expected, `${label}: expected ${expected}, got ${result.response.status}: ${result.text}`);
}

const health = await request("/api/healthz");
status(health, 200, "health");
assert.equal(health.body?.status, "ok");

const ready = await request("/api/readyz");
status(ready, 200, "readiness");
assert.equal(ready.body?.status, "ready");
assert.equal(ready.body?.database, "connected");

const release = await request("/api/portal/release-info");
status(release, 200, "release info");
if (expectedRelease) assert.equal(release.body?.releaseId, expectedRelease, "production release SHA mismatch");

const caps = await request("/api/portal/auth/capabilities");
status(caps, 200, "auth capabilities");
assert.equal(caps.body?.google, true, "Google login unavailable");
assert.equal(caps.body?.emailOtp, true, "Email OTP unavailable");
assert.equal(caps.body?.password, true, "Password login unavailable");

const google = await request("/api/login/google?returnTo=%2Fdashboard");
status(google, 302, "Google OAuth start");
assert.match(google.response.headers.get("location") ?? "", /^https:\/\/accounts\.google\.com\//);

const badLogin = await request("/api/portal/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base.origin },
  body: JSON.stringify({ email: "__commercial_certification__@example.invalid", password: "definitely-not-a-real-password" }),
});
status(badLogin, 401, "invalid password login");

const forgot = await request("/api/portal/auth/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base.origin },
  body: JSON.stringify({ email: "__commercial_certification__@example.invalid" }),
});
status(forgot, 200, "forgot password enumeration guard");

const badReset = await request("/api/portal/auth/reset-password-with-token", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base.origin },
  body: JSON.stringify({
    email: "__commercial_certification__@example.invalid",
    token: "invalid-token-that-is-long-enough-to-test-boundary-1234567890",
    password: "CertificationOnly123!",
  }),
});
status(badReset, 400, "invalid reset token");

const paylabs = await request("/api/payments/paylabs/config");
status(paylabs, 401, "Paylabs admin fail-closed");

const marketplace = await request("/api/mkt/admin/notification-queue/stats");
status(marketplace, 401, "Marketplace admin fail-closed");

const services = await request("/api/portal/services");
status(services, 200, "services");
const serviceText = JSON.stringify(services.body);
for (const code of ["sea_freight","air_freight","trucking","customs_clearance","ppjk_consulting","handling","port_charges","storage_demurrage","emkl","cargo_insurance"]) {
  assert.match(serviceText, new RegExp(`"${code}"`), `missing canonical service ${code}`);
}

const home = await request("/");
status(home, 200, "front door");
assert.match(home.text, /<!doctype html>/i);

console.log(JSON.stringify({
  status: "PASS",
  baseUrl: base.origin,
  releaseId: release.body?.releaseId ?? null,
  auth: {
    google: caps.body?.google,
    emailOtp: caps.body?.emailOtp,
    whatsapp: caps.body?.whatsapp,
    password: caps.body?.password,
  },
  checkedAt: new Date().toISOString(),
}, null, 2));
