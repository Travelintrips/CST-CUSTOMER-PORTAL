import crypto from "node:crypto";

const COOKIE_NAME = "portal_session";
const HINT_COOKIE_NAME = "portal_session_hint";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

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

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession(user) {
  const payload = encode(
    JSON.stringify({
      sub: String(user.id),
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signaturesMatch =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!signaturesMatch) return null;

  try {
    const data = JSON.parse(decode(payload));
    if (!data.sub || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: Number(data.sub), role: data.role };
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
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function sessionCookies(token) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes(SESSION_TTL_SECONDS)}`,
    `${HINT_COOKIE_NAME}=1; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
  ];
}

export function clearSessionCookies() {
  return [
    `${COOKIE_NAME}=; ${cookieAttributes(0)}`,
    `${HINT_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`,
  ];
}