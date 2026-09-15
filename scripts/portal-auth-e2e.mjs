#!/usr/bin/env node

/**
 * Development-only authenticated Customer Portal smoke test.
 *
 * This intentionally uses the public Replit API port instead of localhost or
 * the Vite port. It is a regression check for the same origin/port routing
 * that a Preview browser uses.
 */

const API_PORT = "3000";
const PRODUCTION_HOSTS = new Set([
  "cstlogistic.co.id",
  "www.cstlogistic.co.id",
]);

function fail(message) {
  throw new Error(`[portal-e2e] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function previewApiUrl() {
  const configured = process.env.PORTAL_E2E_BASE_URL?.trim();
  const domain = process.env.REPLIT_DEV_DOMAIN?.trim();
  const raw = configured || (domain ? `https://${domain}:${API_PORT}` : "");

  if (!raw) {
    fail("REPLIT_DEV_DOMAIN is required; this check must run through the public Preview API port.");
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("PORTAL_E2E_BASE_URL must be an absolute URL.");
  }

  if (url.protocol !== "https:") {
    fail("the E2E target must use HTTPS.");
  }
  if (url.port !== API_PORT) {
    fail(`the E2E target must use public API port ${API_PORT}.`);
  }
  if (PRODUCTION_HOSTS.has(url.hostname)) {
    fail("production API targets are not allowed.");
  }
  if (
    !url.hostname.endsWith(".replit.dev") &&
    !url.hostname.endsWith(".sisko.replit.dev")
  ) {
    fail("the E2E target must be a Replit development preview host.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";
  return url;
}

function getSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}

class CookieJar {
  #cookies = new Map();

  store(headers) {
    for (const header of getSetCookieHeaders(headers)) {
      const pair = header.split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator < 1) continue;
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      if (name === "portal_session") {
        this.#cookies.set(name, value);
      }
    }
  }

  has(name) {
    return this.#cookies.has(name);
  }

  header() {
    return [...this.#cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

class PortalClient {
  constructor(baseUrl, label) {
    this.baseUrl = baseUrl;
    this.label = label;
    this.cookies = new CookieJar();
  }

  async request(path, options = {}) {
    const {
      expected = [200],
      body,
      headers = {},
      ...fetchOptions
    } = options;
    const requestHeaders = {
      Accept: "application/json",
      ...headers,
    };
    const cookie = this.cookies.header();
    if (cookie) requestHeaders.Cookie = cookie;
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

    let response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        ...fetchOptions,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
      });
    } catch (error) {
      fail(`${this.label} ${fetchOptions.method ?? "GET"} ${path} failed: ${error.message}`);
    }

    this.cookies.store(response.headers);
    assert(
      response.url.startsWith(this.baseUrl.origin),
      `${this.label} ${path} left the development preview origin.`,
    );
    assert(
      response.status >= 200 && response.status < 300
        ? expected.includes(response.status)
        : expected.includes(response.status),
      `${this.label} ${path} returned HTTP ${response.status}; expected ${expected.join(" or ")}.`,
    );

    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      fail(`${this.label} ${path} returned a non-JSON response.`);
    }
  }

  async devLogin(role) {
    const data = await this.request("/api/portal/auth/dev-login", {
      method: "POST",
      body: { role },
    });
    assert(this.cookies.has("portal_session"), `${this.label} dev login did not set portal_session.`);
    assert(data?.profile?.id, `${this.label} dev login returned no profile.`);
    return data.profile;
  }
}

async function main() {
  if (
    process.env.APP_ENV === "production" ||
    process.env.NODE_ENV === "production" ||
    process.env.REPLIT_DEPLOYMENT === "1"
  ) {
    fail("this check is development-only.");
  }

  const baseUrl = previewApiUrl();
  const anonymous = new PortalClient(baseUrl, "anonymous");
  const health = await anonymous.request("/api/healthz");
  assert(health?.status === "ok", "development API health check did not return ok.");
  assert(health?.appEnv === "development", "the target API is not in development mode.");
  assert(
    health?.databaseEnvironment === "development",
    "the target API is not connected to the development database.",
  );

  const customer = new PortalClient(baseUrl, "customer");
  const profile = await customer.devLogin("customer");
  const bootstrap = await customer.request("/api/portal/auth/bootstrap");
  assert(bootstrap?.authenticated === true, "bootstrap did not authenticate the customer.");
  assert(bootstrap?.user?.id === profile.id, "bootstrap user does not match the login profile.");

  const authMe = await customer.request("/api/portal/auth/me");
  assert(authMe?.id === profile.id, "auth/me did not reuse portal_session.");
  assert(authMe?.email === profile.email, "auth/me returned the wrong customer.");

  const organization = await customer.request("/api/portal/organization");
  assert(organization && typeof organization === "object", "organization response was invalid.");

  const orderFeed = await customer.request("/api/portal/order-feed");
  for (const key of ["crmOrders", "logisticOrders", "productOrders", "marketplaceRfqs"]) {
    assert(Array.isArray(orderFeed?.[key]), `order feed is missing ${key}.`);
  }

  const rfqList = await customer.request("/api/mkt/portal/rfqs?limit=20");
  assert(Array.isArray(rfqList?.data), "RFQ list response is invalid.");
  assert(rfqList.data.length > 0, "the development customer has no RFQ to use for detail/isolation checks.");
  const rfq = rfqList.data[0];
  assert(Number.isInteger(Number(rfq.rfqId)), "RFQ list did not return a usable RFQ id.");

  const rfqDetail = await customer.request(`/api/mkt/portal/rfqs/${rfq.rfqId}`);
  assert(Number(rfqDetail?.data?.id) === Number(rfq.rfqId), "RFQ detail did not match the listed RFQ.");

  await customer.request("/api/portal/notifications/read-all", {
    method: "POST",
    expected: [204],
  });

  const otherAccount = new PortalClient(baseUrl, "other-account");
  const otherProfile = await otherAccount.devLogin("admin");
  assert(otherProfile.id !== profile.id, "isolation check did not use a separate portal account.");
  await otherAccount.request(`/api/mkt/portal/rfqs/${rfq.rfqId}`, {
    expected: [404],
  });

  console.log(
    `[portal-e2e] passed: development preview auth, organization, orders, RFQ detail, ` +
    `idempotent notification mutation, and cross-account RFQ isolation.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});