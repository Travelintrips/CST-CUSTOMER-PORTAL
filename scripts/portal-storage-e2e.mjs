#!/usr/bin/env node

/**
 * Development-only storage contract check.
 * The target is always the public Preview API port, never production.
 */

const API_PORT = "3000";
const PRODUCTION_HOSTS = new Set(["cstlogistic.co.id", "www.cstlogistic.co.id"]);
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function fail(message) {
  throw new Error(`[portal-storage-e2e] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function baseUrl() {
  const configured = process.env.PORTAL_E2E_BASE_URL?.trim();
  const domain = process.env.REPLIT_DEV_DOMAIN?.trim();
  const raw = configured || (domain ? `https://${domain}:${API_PORT}` : "");
  if (!raw) fail("REPLIT_DEV_DOMAIN is required.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.port !== API_PORT) {
    fail("target must be HTTPS on the Preview API port 3000.");
  }
  if (PRODUCTION_HOSTS.has(url.hostname)) fail("production target is forbidden.");
  if (!url.hostname.endsWith(".replit.dev") && !url.hostname.endsWith(".sisko.replit.dev")) {
    fail("target must be a Replit development preview host.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function setCookies(headers, jar) {
  const values = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : (headers.get("set-cookie") ? [headers.get("set-cookie")] : []);
  for (const value of values) {
    const pair = value.split(";", 1)[0];
    const index = pair.indexOf("=");
    if (index > 0) jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
}

class Client {
  constructor(base, label) {
    this.base = base;
    this.label = label;
    this.jar = new Map();
  }

  async request(path, options = {}) {
    const { expected = [200], body, headers = {}, ...fetchOptions } = options;
    const requestHeaders = { Accept: "application/json", ...headers };
    const cookie = [...this.jar].map(([key, value]) => `${key}=${value}`).join("; ");
    if (cookie) requestHeaders.Cookie = cookie;
    let requestBody = body;
    if (body && !(body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
    const response = await fetch(new URL(path, this.base), {
      ...fetchOptions,
      headers: requestHeaders,
      body: requestBody,
      redirect: "manual",
    });
    setCookies(response.headers, this.jar);
    const raw = await response.text();
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    assert(
      expected.includes(response.status),
      `${this.label} ${path} returned ${response.status}; expected ${expected.join("/")}. ` +
      `${parsed?.message ?? raw.slice(0, 240)}`,
    );
    if (!raw) return null;
    try {
      return parsed ?? JSON.parse(raw);
    } catch {
      fail(`${this.label} ${path} returned non-JSON.`);
    }
  }

  async login(role) {
    const result = await this.request("/api/portal/auth/dev-login", {
      method: "POST",
      body: { role },
    });
    assert(result?.profile?.id, `${this.label} login returned no profile.`);
    return result.profile;
  }
}

function fileForm(name, type, contents, docType) {
  const form = new FormData();
  form.append("file", new Blob([contents], { type }), name);
  if (docType) form.append("docType", docType);
  return form;
}

async function main() {
  if (process.env.APP_ENV === "production" || process.env.NODE_ENV === "production") {
    fail("this check is development-only.");
  }
  const base = baseUrl();
  const customer = new Client(base, "customer");
  const profile = await customer.login("customer");
  const health = await customer.request("/api/healthz");
  assert(health?.appEnv === "development", "API is not in development mode.");
  assert(health?.databaseEnvironment === "development", "API is not using development database.");

  let documentId = null;
  let onboardingDocumentId = null;
  try {
    const invalidType = await customer.request("/api/customer-verification/documents", {
      method: "POST",
      body: fileForm("bad.txt", "text/plain", "not allowed", "ktp"),
      expected: [415],
    });
    assert(invalidType?.message, "invalid file type did not return a validation message.");

    const oversized = await customer.request("/api/customer-verification/documents", {
      method: "POST",
      body: fileForm("large.png", "image/png", Buffer.alloc(5 * 1024 * 1024 + 1), "ktp"),
      expected: [413],
    });
    assert(oversized?.message, "oversized file did not return a validation message.");

    const first = await customer.request("/api/customer-verification/documents", {
      method: "POST",
      body: fileForm("ktp-first.png", "image/png", PNG_BYTES, "ktp"),
    });
    documentId = Number(first?.id);
    assert(Number.isInteger(documentId) && documentId > 0, "first upload returned no document id.");
    assert(first.storagePath?.startsWith(`customers/${profile.id}/`), "first object path is not customer-scoped.");
    assert(first.storagePath.includes("/documents/ktp/"), "first object path is not document-scoped.");
    assert(typeof first.url === "string" && first.url.includes("/storage/v1/object/sign/"), "signed URL was not returned.");
    const firstSigned = first.url;
    const firstSignedResponse = await fetch(firstSigned);
    assert(firstSignedResponse.ok, "first signed URL could not read the private object.");

    const second = await customer.request("/api/customer-verification/documents", {
      method: "POST",
      body: fileForm("ktp-second.png", "image/png", PNG_BYTES, "ktp"),
    });
    assert(Number(second?.id) === documentId, "re-upload did not reuse the document record.");
    assert(Number(second?.uploadedVersion) >= 2, "re-upload did not increment uploaded_version.");
    assert(second.storagePath !== first.storagePath, "re-upload did not create a new object path.");
    const oldObjectResponse = await fetch(firstSigned);
    assert(!oldObjectResponse.ok, "old re-uploaded object is still readable.");

    const other = new Client(base, "other-customer");
    await other.login("vendor");
    await other.request(`/api/customer-verification/signed-url/${documentId}`, { expected: [404] });
    await other.request(`/api/customer-verification/documents/${documentId}`, {
      method: "DELETE",
      expected: [404],
    });

    const onboarding = await customer.request("/api/portal/onboarding/upload-doc", {
      method: "POST",
      body: fileForm("legalitas.png", "image/png", PNG_BYTES, "legalitas"),
    });
    onboardingDocumentId = Number(onboarding?.id);
    assert(Number.isInteger(onboardingDocumentId) && onboardingDocumentId > 0, "onboarding upload returned no document id.");
    assert(onboarding.storagePath?.startsWith(`customers/${profile.id}/`), "onboarding object path is not customer-scoped.");

    const ocr = await customer.request("/api/portal/onboarding/ktp-ocr", {
      method: "POST",
      body: fileForm("ktp-ocr.png", "image/png", PNG_BYTES),
      expected: [200, 501],
    });
    assert(ocr?.ok === true || ocr?.message?.includes("OCR"), "KTP OCR response was invalid.");

    console.log(
      `[portal-storage-e2e] passed: validation, upload, re-upload, signed URL, ` +
      `onboarding upload, delete authorization, and cross-customer denial; ` +
      `KTP OCR ${ocr?.ok ? "available" : "dependency unavailable"}.`,
    );
  } finally {
    if (onboardingDocumentId) {
      await customer.request(`/api/customer-verification/documents/${onboardingDocumentId}`, {
        method: "DELETE",
        expected: [204, 404],
      });
    }
    if (documentId) {
      await customer.request(`/api/customer-verification/documents/${documentId}`, {
        method: "DELETE",
        expected: [204, 404],
      });
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});