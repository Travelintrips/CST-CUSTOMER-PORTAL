import crypto from "node:crypto";

const COOKIE_NAME = "portal_session";
const HINT_COOKIE_NAME = "portal_session_hint";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEV_TOKEN_FALLBACK_SECRET = "cst-dev-portal-fallback-2025";

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function decode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is required by the Customer Portal API.");
  return value;
}

function isProduction() {
  return (
    process.env.REPLIT_DEPLOYMENT === "1" ||
    process.env.APP_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function devSecret() {
  return process.env.DEV_PORTAL_SECRET ?? (isProduction() ? "" : DEV_TOKEN_FALLBACK_SECRET);
}

function hmacHex(value, key) {
  return crypto.createHmac("sha256", key).update(value).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function signJwtPart(value) {
  return crypto.createHmac("sha256", process.env.PORTAL_JWT_SECRET ?? secret())
    .update(value)
    .digest("base64url");
}

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeJson(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function createDevPortalToken(user) {
  const payload = encodeJson({
    id: Number(user.id),
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  return `devportal.${payload}.${hmacHex(payload, devSecret())}`;
}

function createPortalJwt(user) {
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    sub: String(user.id),
    email: user.email,
    customerId: Number(user.id),
    role: user.role,
    iss: "cst-portal",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  return `${header}.${payload}.${signJwtPart(`${header}.${payload}`)}`;
}

export function createSession(user) {
  return isProduction() ? createPortalJwt(user) : createPortalJwt(user);
}

export function verifySession(token) {
  if (!token) return null;
  if (token.startsWith("devportal.")) {
    if (isProduction() || !devSecret()) return null;
    const [, payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqual(signature, hmacHex(payload, devSecret()))) return null;
    try {
      const data = decodeJson(payload);
      if (!Number.isInteger(Number(data.id)) || !data.email || !data.role) return null;
      if (data.exp && data.exp < Date.now()) return null;
      return { id: Number(data.id), email: data.email, role: data.role, tokenFamily: "devportal" };
    } catch {
      return null;
    }
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  if (!safeEqual(signature, signJwtPart(`${header}.${payload}`))) return null;
  try {
    const headerData = decodeJson(header);
    const data = decodeJson(payload);
    if (headerData.alg !== "HS256" || data.iss !== "cst-portal") return null;
    if (!Number.isInteger(Number(data.customerId)) || !data.email || !data.role) return null;
    if (!data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return {
      id: Number(data.customerId),
      email: data.email,
      role: data.role,
      tokenFamily: "portal-jwt",
    };
  } catch {
    return null;
  }
}

export function parseCookies(request) {
  const cookies = {};
  for (const part of request.headers.cookie?.split(";") ?? []) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    cookies[key] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
}

export function getSessionToken(request) {
  const cookies = parseCookies(request);
  if (cookies[COOKIE_NAME]) return cookies[COOKIE_NAME];

  const authorization = request.headers.authorization ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
}

export function getSession(request) {
  return verifySession(getSessionToken(request));
}

function cookieAttributes(maxAge) {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    ...(isProduction() ? ["Secure"] : []),
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function sessionCookies(token) {
  const hintAttributes = [
    "Path=/",
    "SameSite=Lax",
    ...(isProduction() ? ["Secure"] : []),
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join("; ");
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes(SESSION_TTL_SECONDS)}`,
    `${HINT_COOKIE_NAME}=1; ${hintAttributes}`,
  ];
}

export function clearSessionCookies() {
  const hintAttributes = [
    "Path=/",
    "SameSite=Lax",
    ...(isProduction() ? ["Secure"] : []),
    "Max-Age=0",
  ].join("; ");
  return [
    `${COOKIE_NAME}=; ${cookieAttributes(0)}`,
    `${HINT_COOKIE_NAME}=; ${hintAttributes}`,
  ];
}