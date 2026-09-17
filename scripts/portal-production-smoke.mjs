#!/usr/bin/env node

/**
 * Read-only production-mode smoke check for the standalone portal.
 *
 * It may inspect production database/storage readiness, but deliberately does
 * not perform a login, upload, database mutation, or storage upload. An
 * authenticated production upload must be exercised only against an approved
 * isolated test account/object lifecycle.
 */

import assert from "node:assert/strict";
import { sessionCookies } from "../server/session.mjs";

const baseUrl = new URL(
  process.env.PORTAL_PRODUCTION_SMOKE_BASE_URL
    ?? `http://127.0.0.1:${process.env.PORTAL_PRODUCTION_SMOKE_PORT ?? "18445"}`,
);

async function request(path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    redirect: "manual",
    ...options,
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body };
}

function assertStatus(result, expected, label) {
  assert.equal(
    result.response.status,
    expected,
    `${label}: expected ${expected}, received ${result.response.status} (${JSON.stringify(result.body)})`,
  );
}

async function main() {
  assert.equal(process.env.APP_ENV, "production", "smoke must run with APP_ENV=production");
  assert.equal(process.env.NODE_ENV, "production", "smoke must run with NODE_ENV=production");

  const health = await request("/api/healthz");
  assertStatus(health, 200, "health");
  assert.equal(health.body?.appEnv, "production");
  assert.equal(health.body?.database, "connected");

  const readiness = await request("/api/readyz");
  assertStatus(readiness, 200, "readiness");
  assert.equal(readiness.body?.status, "ready");
  assert.equal(readiness.body?.storage, "private");

  const home = await request("/");
  assertStatus(home, 200, "same-origin frontend");
  assert.match(String(home.body), /<!doctype html>/i);

  const unknownApi = await request("/api/route-that-does-not-exist");
  assertStatus(unknownApi, 404, "unknown local API route");
  assert.equal(unknownApi.body?.service, "customer-portal-api");

  const capabilities = await request("/api/portal/auth/capabilities");
  assertStatus(capabilities, 200, "capabilities");
  assert.equal(capabilities.body?.devLogin, false);

  const devLogin = await request("/api/portal/auth/dev-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "customer" }),
  });
  assertStatus(devLogin, 404, "production dev-login guard");

  const evilOptions = await request("/api/portal/auth/login", {
    method: "OPTIONS",
    headers: {
      Origin: "https://evil.example",
      "Access-Control-Request-Method": "POST",
    },
  });
  assertStatus(evilOptions, 403, "untrusted CORS origin");

  const evilMutation = await request("/api/portal/auth/logout", {
    method: "POST",
    headers: { Origin: "https://evil.example" },
  });
  assertStatus(evilMutation, 403, "cross-origin mutation");

  const sameOriginMutation = await request("/api/portal/auth/logout", {
    method: "POST",
    headers: { Origin: baseUrl.origin },
  });
  assertStatus(sameOriginMutation, 204, "same-origin mutation policy");

  const unauthenticatedUpload = await request("/api/portal/onboarding/upload-doc", {
    method: "POST",
    headers: { Origin: baseUrl.origin },
  });
  assertStatus(unauthenticatedUpload, 401, "unauthenticated document upload");

  const cookies = sessionCookies("smoke-token");
  assert.equal(cookies.length, 2);
  assert.match(cookies[0], /HttpOnly/);
  assert.match(cookies[0], /Secure/);
  assert.match(cookies[0], /SameSite=Lax/);

  console.log(
    "[portal-production-smoke] passed: same-origin frontend/API, local 404 boundary, " +
    "health/readiness, production auth guard, cookie flags, CORS, CSRF origin policy, " +
    "and safe unauthenticated upload boundary.",
  );
}

main().catch((error) => {
  console.error(`[portal-production-smoke] ${error.message}`);
  process.exitCode = 1;
});