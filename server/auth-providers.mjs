import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { query } from "./db.mjs";
import { createSession, sessionCookies } from "./session.mjs";

const APP_ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const IS_PRODUCTION =
  APP_ENV === "production" ||
  process.env.NODE_ENV === "production" ||
  process.env.REPLIT_DEPLOYMENT === "1";
const SAFE_DEV_AUTH = !IS_PRODUCTION && process.env.REPLIT_DEPLOYMENT !== "1";
const OTP_TTL_MS = 10 * 60 * 1000;
const WA_OTP_TTL_MS = 5 * 60 * 1000;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const rateBuckets = new Map();

const CUSTOMER_RETURN_PREFIXES = [
  "/login", "/register", "/dashboard", "/vendor-dashboard", "/orders", "/admin",
  "/services", "/marketplace", "/jasa", "/vendor", "/freight-forwarding", "/pabean",
  "/custom-clearance", "/book", "/logistic-order-success", "/track", "/calculator",
  "/kalkulator-biaya-logistik", "/kalkulator-impor", "/order-produk", "/onboarding",
  "/pending-approval", "/account-security", "/portal-dokumen", "/portal-invoice",
  "/company-profile", "/profile", "/air-freight-booking", "/ocean-freight-booking",
  "/ocean-freight", "/service-cart",
];

function errorWithStatus(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function json(response, status, value, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 128 * 1024) throw errorWithStatus(413, "Request body is too large.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw errorWithStatus(400, "Request body must be valid JSON.");
  }
}

function requestIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded ?? request.socket.remoteAddress ?? "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 128);
}

function enforceRateLimit(key, max, windowMs) {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= max) {
    throw errorWithStatus(429, "Terlalu banyak percobaan. Coba lagi nanti.");
  }
  current.count += 1;
}

function hashToken(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function randomCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function normalizedEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function validPhone(phone) {
  return /^62\d{8,13}$/.test(phone);
}

function accountIsUsable(row) {
  return ["active", null, undefined].includes(row?.account_status);
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    role: row.role,
    customerType: row.customer_type ?? null,
  };
}

function loginResponse(row, token) {
  return { token, user: publicUser(row) };
}

async function findUserById(id) {
  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where id = $1
      limit 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function findUserByEmail(email) {
  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where lower(email) = $1
      limit 1`,
    [email],
  );
  return result.rows[0] ?? null;
}

async function findUserByPhone(phone) {
  const result = await query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = $1
      order by id
      limit 2`,
    [phone],
  );
  return result.rows;
}

async function createOrFindEmailUser(email) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  try {
    const created = await query(
      `insert into public.portal_customers (name, email, password_hash, role)
       values ($1, $2, $3, 'customer')
       returning id, name, email, phone, company, role, customer_type, account_status`,
      [email.split("@")[0], email, ""],
    );
    return created.rows[0] ?? null;
  } catch (error) {
    if (error?.code !== "23505") throw error;
    return findUserByEmail(email);
  }
}

async function linkIdentity(customerId, provider, subject) {
  const normalizedSubject = String(subject).trim();
  const byProvider = await query(
    `select id, customer_id, subject
       from public.portal_auth_identities
      where provider = $1 and subject = $2
      limit 1`,
    [provider, normalizedSubject],
  );
  if (byProvider.rows[0] && Number(byProvider.rows[0].customer_id) !== Number(customerId)) {
    throw errorWithStatus(409, "Identitas login sudah terhubung ke akun lain.");
  }

  const byCustomer = await query(
    `select id, customer_id, subject
       from public.portal_auth_identities
      where customer_id = $1 and provider = $2
      limit 1`,
    [customerId, provider],
  );
  if (byCustomer.rows[0] && byCustomer.rows[0].subject !== normalizedSubject) {
    throw errorWithStatus(409, "Akun sudah memiliki identitas provider yang berbeda.");
  }

  const existing = byProvider.rows[0] ?? byCustomer.rows[0];
  if (existing) {
    await query(
      `update public.portal_auth_identities
          set last_used_at = now()
        where id = $1`,
      [existing.id],
    );
    return;
  }
  try {
    await query(
      `insert into public.portal_auth_identities
        (customer_id, provider, subject, verified_at, last_used_at)
       values ($1, $2, $3, now(), now())`,
      [customerId, provider, normalizedSubject],
    );
  } catch (error) {
    if (error?.code === "23505") {
      throw errorWithStatus(409, "Identitas login sedang terhubung ke akun lain. Coba lagi.");
    }
    throw error;
  }
}

async function loginUser(row) {
  if (!row || !accountIsUsable(row)) {
    throw errorWithStatus(403, "Akun tidak aktif dan tidak dapat digunakan.");
  }
  return loginResponse(row, createSession(row));
}

function smtpConfig() {
  const pass = (process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD ?? "").trim();
  const from = (process.env.SMTP_FROM ?? "").trim();
  const user = (process.env.SMTP_USER ?? from).trim();
  const host = (process.env.SMTP_HOST ?? process.env["SMTP-HOST"] ?? "smtp.hostinger.com").trim();
  const port = Number(process.env.SMTP_PORT ?? 465);
  return { pass, from, user, host, port, secure: port === 465 };
}

const GOOGLE_CALLBACK_PATH = "/api/callback/google";

function normalizeGoogleRedirectBase(value) {
  let parsed;
  try {
    parsed = new URL(String(value ?? "").trim());
  } catch {
    throw errorWithStatus(503, "Konfigurasi callback Google tidak valid.");
  }

  if (
    !["http:", "https:"].includes(parsed.protocol)
    || parsed.origin === "null"
    || parsed.username
    || parsed.password
    || parsed.search
    || parsed.hash
  ) {
    throw errorWithStatus(503, "Konfigurasi callback Google tidak valid.");
  }
  if (IS_PRODUCTION && parsed.protocol !== "https:") {
    throw errorWithStatus(503, "Konfigurasi callback Google production harus menggunakan HTTPS.");
  }

  const configuredPath = parsed.pathname.replace(/\/+$/, "");
  if (configuredPath && configuredPath !== GOOGLE_CALLBACK_PATH) {
    throw errorWithStatus(503, "Path callback Google harus /api/callback/google.");
  }

  parsed.pathname = GOOGLE_CALLBACK_PATH;
  return parsed.toString();
}

function googleRedirectBaseConfigured() {
  try {
    normalizeGoogleRedirectBase(process.env.GOOGLE_REDIRECT_BASE_URL);
    return true;
  } catch {
    return false;
  }
}

function emailConfigured() {
  const config = smtpConfig();
  return Boolean(config.pass && config.from && config.user);
}

function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim()
      && process.env.GOOGLE_CLIENT_SECRET?.trim()
      && process.env.GOOGLE_REDIRECT_BASE_URL?.trim()
      && googleRedirectBaseConfigured(),
  );
}

function fonnteConfigured() {
  return Boolean(process.env.FONNTE_TOKEN?.trim());
}

async function fonnteStatus() {
  if (!fonnteConfigured()) return { status: "unconfigured" };
  if (SAFE_DEV_AUTH) return { status: "test" };
  try {
    const response = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: { Authorization: process.env.FONNTE_TOKEN.trim() },
      signal: AbortSignal.timeout(8_000),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.status === false || body?.status === "false") {
      return { status: "unavailable" };
    }
    return { status: "pass" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function authCapabilities() {
  const whatsappStatus = await fonnteStatus();
  return {
    google: googleConfigured(),
    emailOtp: SAFE_DEV_AUTH || emailConfigured(),
    whatsapp: SAFE_DEV_AUTH || whatsappStatus.status === "pass",
    password: true,
    providerStatus: {
      google: googleConfigured() ? "configured" : "unconfigured",
      email: SAFE_DEV_AUTH ? "test" : emailConfigured() ? "configured" : "unconfigured",
      whatsapp: whatsappStatus.status,
    },
    devLogin: !IS_PRODUCTION,
  };
}

async function sendEmailOtp(email, code) {
  if (SAFE_DEV_AUTH) return;
  const config = smtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    tls: { rejectUnauthorized: false },
  });
  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Verifikasi Login — CST Portal",
    text: `Kode OTP Anda: ${code}\nKode berlaku selama 10 menit.\nJangan bagikan kode ini kepada siapa pun.`,
    html: `<p>Kode OTP Anda</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>Kode berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>`,
  });
}

async function sendWhatsAppOtp(phone, code) {
  if (SAFE_DEV_AUTH) return;
  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_TOKEN.trim(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      target: phone,
      message: `🔐 Verifikasi Login\n\nKode OTP Anda: *${code}*\n\nKode berlaku selama 5 menit.\nJangan bagikan kode ini kepada siapa pun.`,
    }).toString(),
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.status === false || body?.status === "false") {
    throw new Error("Fonnte menolak pengiriman OTP.");
  }
}

export async function handleCapabilities(response) {
  json(response, 200, await authCapabilities());
}

export async function handleEmailOtpRequest(request, response) {
  const body = await readJson(request);
  const email = normalizedEmail(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw errorWithStatus(400, "Format email tidak valid.");
  }
  const ip = requestIp(request);
  enforceRateLimit(`email-otp-request:ip:${ip}`, 5, 15 * 60 * 1000);
  enforceRateLimit(`email-otp-request:email:${email}`, 3, 10 * 60 * 1000);

  const recent = await query(
    `select count(*)::int as count
       from public.portal_email_otp_codes
      where email = $1
        and created_at >= now() - interval '10 minutes'`,
    [email],
  );
  if (Number(recent.rows[0]?.count ?? 0) >= 3) {
    throw errorWithStatus(429, "Terlalu banyak permintaan OTP. Coba lagi nanti.");
  }

  const code = randomCode();
  const inserted = await query(
    `insert into public.portal_email_otp_codes (email, code_hash, expires_at)
     values ($1, $2, now() + interval '10 minutes')
     returning id`,
    [email, await bcrypt.hash(code, 10)],
  );
  const challengeId = inserted.rows[0]?.id;

  if (!SAFE_DEV_AUTH && !emailConfigured()) {
    await query("delete from public.portal_email_otp_codes where id = $1", [challengeId]);
    throw errorWithStatus(503, "Layanan email belum dikonfigurasi. Hubungi admin.");
  }
  try {
    await sendEmailOtp(email, code);
  } catch {
    await query("delete from public.portal_email_otp_codes where id = $1", [challengeId]);
    throw errorWithStatus(503, "Gagal mengirim email OTP. Coba lagi.");
  }
  json(response, 200, {
    message: SAFE_DEV_AUTH ? "Dev mode: OTP tersedia untuk pengujian aman." : "Kode OTP telah dikirim ke email Anda.",
    ...(SAFE_DEV_AUTH ? { _dev_code: code } : {}),
  });
}

export async function handleEmailOtpVerify(request, response) {
  const body = await readJson(request);
  const email = normalizedEmail(body.email);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!email || !/^\d{6}$/.test(code)) throw errorWithStatus(400, "Email dan kode OTP diperlukan.");
  const ip = requestIp(request);
  enforceRateLimit(`email-otp-verify:ip:${ip}`, 10, 15 * 60 * 1000);
  enforceRateLimit(`email-otp-verify:email:${email}`, 10, 15 * 60 * 1000);

  const latest = await query(
    `select id, code_hash, attempts, expires_at
       from public.portal_email_otp_codes
      where email = $1 and verified = false
      order by created_at desc
      limit 1`,
    [email],
  );
  const challenge = latest.rows[0];
  if (!challenge) throw errorWithStatus(401, "Tidak ada OTP aktif. Minta kode baru.");
  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    throw errorWithStatus(401, "Kode OTP sudah kadaluarsa.");
  }
  if (Number(challenge.attempts) >= 5) throw errorWithStatus(429, "Terlalu banyak percobaan. Minta OTP baru.");
  if (!(await bcrypt.compare(code, challenge.code_hash))) {
    await query(
      `update public.portal_email_otp_codes
          set attempts = attempts + 1
        where id = $1 and verified = false and attempts < 5`,
      [challenge.id],
    );
    throw errorWithStatus(401, "Kode OTP salah.");
  }
  const consumed = await query(
    `update public.portal_email_otp_codes
        set verified = true, expires_at = now()
      where id = $1 and verified = false and expires_at > now() and attempts < 5
      returning id`,
    [challenge.id],
  );
  if (!consumed.rows[0]) throw errorWithStatus(401, "OTP sudah digunakan. Minta kode baru.");

  const user = await createOrFindEmailUser(email);
  if (!user) throw errorWithStatus(500, "Akun portal gagal disiapkan.");
  await linkIdentity(user.id, "email", email);
  const result = await loginUser(user);
  json(response, 200, result, { "Set-Cookie": sessionCookies(result.token) });
}

export async function handleWaOtpRequest(request, response) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  if (!validPhone(phone)) throw errorWithStatus(400, "Nomor HP tidak valid.");
  const ip = requestIp(request);
  enforceRateLimit(`wa-otp-request:ip:${ip}`, 10, 15 * 60 * 1000);
  enforceRateLimit(`wa-otp-request:phone:${phone}`, 3, 10 * 60 * 1000);

  const recent = await query(
    `select count(*)::int as count
       from public.wa_otp_codes
      where phone = $1 and purpose = 'login'
        and created_at >= now() - interval '10 minutes'`,
    [phone],
  );
  if (Number(recent.rows[0]?.count ?? 0) >= 3) {
    throw errorWithStatus(429, "Terlalu banyak permintaan OTP. Coba lagi nanti.");
  }
  const code = randomCode();
  const inserted = await query(
    `insert into public.wa_otp_codes (phone, code_hash, purpose, expires_at)
     values ($1, $2, 'login', now() + interval '5 minutes')
     returning id`,
    [phone, await bcrypt.hash(code, 10)],
  );
  const challengeId = inserted.rows[0]?.id;
  if (!SAFE_DEV_AUTH && !fonnteConfigured()) {
    await query("delete from public.wa_otp_codes where id = $1", [challengeId]);
    throw errorWithStatus(503, "Layanan WhatsApp belum dikonfigurasi. Hubungi admin.");
  }
  try {
    await sendWhatsAppOtp(phone, code);
  } catch {
    await query("delete from public.wa_otp_codes where id = $1", [challengeId]);
    throw errorWithStatus(503, "Gagal mengirim OTP via WhatsApp. Coba lagi.");
  }
  json(response, 200, {
    phone,
    message: SAFE_DEV_AUTH ? "Dev mode: OTP tersedia untuk pengujian aman." : "OTP telah dikirim ke WhatsApp Anda.",
    ...(SAFE_DEV_AUTH ? { _dev_code: code } : {}),
  });
}

export async function handleWaOtpVerify(request, response) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!validPhone(phone) || !/^\d{6}$/.test(code)) {
    throw errorWithStatus(400, "Nomor HP dan kode OTP diperlukan.");
  }
  enforceRateLimit(`wa-otp-verify:ip:${requestIp(request)}`, 10, 15 * 60 * 1000);
  enforceRateLimit(`wa-otp-verify:phone:${phone}`, 10, 15 * 60 * 60 * 1000);

  const latest = await query(
    `select id, code_hash, attempts, expires_at
       from public.wa_otp_codes
      where phone = $1 and purpose = 'login' and verified = false
      order by created_at desc
      limit 1`,
    [phone],
  );
  const challenge = latest.rows[0];
  if (!challenge) throw errorWithStatus(400, "OTP tidak ditemukan. Minta OTP baru.");
  if (new Date(challenge.expires_at).getTime() <= Date.now()) throw errorWithStatus(400, "OTP kadaluarsa. Minta OTP baru.");
  if (Number(challenge.attempts) >= 5) throw errorWithStatus(429, "Terlalu banyak percobaan. Minta OTP baru.");
  if (!(await bcrypt.compare(code, challenge.code_hash))) {
    await query(
      `update public.wa_otp_codes
          set attempts = attempts + 1
        where id = $1 and verified = false and attempts < 5`,
      [challenge.id],
    );
    throw errorWithStatus(400, "Kode OTP salah.");
  }

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const consumed = await query(
    `update public.wa_otp_codes
        set verified = true,
            verify_token = null,
            verify_token_hash = $2,
            expires_at = now() + interval '10 minutes'
      where id = $1 and verified = false and expires_at > now() and attempts < 5
      returning id`,
    [challenge.id, hashToken(verifyToken)],
  );
  if (!consumed.rows[0]) throw errorWithStatus(400, "OTP sudah digunakan. Minta OTP baru.");
  json(response, 200, { verifyToken, phone });
}

export async function handleWaLogin(request, response) {
  const body = await readJson(request);
  const verifyToken = typeof body.verifyToken === "string" ? body.verifyToken : "";
  if (!verifyToken) throw errorWithStatus(400, "Token verifikasi diperlukan.");
  const tokenHash = hashToken(verifyToken);
  const challengeResult = await query(
    `select id, phone, expires_at
       from public.wa_otp_codes
      where verify_token_hash = $1 and verified = true
      limit 1`,
    [tokenHash],
  );
  const challenge = challengeResult.rows[0];
  if (!challenge || new Date(challenge.expires_at).getTime() <= Date.now()) {
    throw errorWithStatus(400, "Token verifikasi tidak valid atau kadaluarsa.");
  }
  const users = await findUserByPhone(challenge.phone);
  if (!users.length) {
    json(response, 404, { message: "Nomor HP belum terdaftar.", notRegistered: true });
    return;
  }
  if (users.length > 1) throw errorWithStatus(409, "Akun ambigu untuk nomor ini. Hubungi admin.");
  await linkIdentity(users[0].id, "whatsapp", challenge.phone);
  const consumed = await query(
    `update public.wa_otp_codes
        set verify_token = null, verify_token_hash = null, expires_at = now()
      where id = $1 and verify_token_hash = $2 and verified = true and expires_at > now()
      returning id`,
    [challenge.id, tokenHash],
  );
  if (!consumed.rows[0]) throw errorWithStatus(400, "Token verifikasi sudah digunakan.");
  const result = await loginUser(users[0]);
  let deviceToken;
  const rememberDays = Number(body.rememberDays);
  if (Number.isFinite(rememberDays) && rememberDays > 0 && rememberDays <= 90) {
    deviceToken = crypto.randomBytes(32).toString("hex");
    const deviceHash = hashToken(deviceToken);
    await query(
      `insert into public.trusted_devices (phone, device_token, device_token_hash, expires_at)
       values ($1, $2, $2, now() + ($3 * interval '1 day'))`,
      [challenge.phone, deviceHash, rememberDays],
    );
  }
  json(response, 200, { ...result, deviceToken }, { "Set-Cookie": sessionCookies(result.token) });
}

export async function handleWaTrustedLogin(request, response) {
  const body = await readJson(request);
  const phone = normalizePhone(body.phone);
  const deviceToken = typeof body.deviceToken === "string" ? body.deviceToken : "";
  if (!validPhone(phone) || !deviceToken) throw errorWithStatus(400, "phone dan deviceToken diperlukan.");
  enforceRateLimit(`wa-trusted-login:ip:${requestIp(request)}`, 20, 15 * 60 * 1000);
  const tokenHash = hashToken(deviceToken);
  const device = await query(
    `select id, phone, expires_at
       from public.trusted_devices
      where (device_token_hash = $1 or device_token = $1)
        and regexp_replace(phone, '[^0-9]', '', 'g') = $2
      limit 1`,
    [tokenHash, phone],
  );
  if (!device.rows[0]) throw errorWithStatus(401, "Perangkat tidak dikenali.");
  if (new Date(device.rows[0].expires_at).getTime() <= Date.now()) {
    await query("delete from public.trusted_devices where id = $1", [device.rows[0].id]);
    throw errorWithStatus(401, "Sesi perangkat kadaluarsa.");
  }
  const users = await findUserByPhone(phone);
  if (users.length !== 1) throw errorWithStatus(401, "Akun tidak ditemukan.");
  await query(
    `update public.trusted_devices
        set expires_at = now() + interval '30 days'
      where id = $1`,
    [device.rows[0].id],
  );
  const result = await loginUser(users[0]);
  json(response, 200, result, { "Set-Cookie": sessionCookies(result.token) });
}

function safeReturnTo(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/login";
  const pathname = value.split(/[?#]/, 1)[0];
  return pathname === "/" || CUSTOMER_RETURN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  ) ? value : "/login";
}

function requestOrigin(request) {
  const protocol = request.headers["x-forwarded-proto"] ?? (IS_PRODUCTION ? "https" : "http");
  const host = request.headers["x-forwarded-host"] ?? request.headers.host ?? "localhost";
  return `${String(protocol).split(",")[0].trim()}://${String(host).split(",")[0].trim()}`;
}

export function googleRedirectUri(request) {
  const base = process.env.GOOGLE_REDIRECT_BASE_URL?.trim() || requestOrigin(request);
  return normalizeGoogleRedirectBase(base);
}

function signedOAuthState(state, returnTo, issuedAt) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET)
    .update(`${state}|${returnTo}|${issuedAt}`)
    .digest("base64url");
}

function oauthStateCookie(state, returnTo, issuedAt) {
  const payload = Buffer.from(JSON.stringify({ state, returnTo, issuedAt })).toString("base64url");
  const signature = signedOAuthState(state, returnTo, issuedAt);
  const secure = IS_PRODUCTION ? "; Secure" : "";
  return `portal_oauth_state=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=600`;
}

function readCookie(request, name) {
  for (const part of String(request.headers.cookie ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function clearOAuthStateCookie() {
  return `portal_oauth_state=; Path=/; HttpOnly; SameSite=Lax${IS_PRODUCTION ? "; Secure" : ""}; Max-Age=0`;
}

function redirect(response, location, cookies = []) {
  response.writeHead(302, { Location: location, "Cache-Control": "no-store", "Set-Cookie": cookies });
  response.end();
}

function googleFailureTarget(returnTo = "/login") {
  const target = safeReturnTo(returnTo);
  return `${target}${target.includes("?") ? "&" : "?"}oauth_error=google_callback_failed`;
}

export function handleGoogleStart(request, response, url) {
  if (!googleConfigured()) {
    json(response, 503, { message: "Login Google belum dikonfigurasi." });
    return;
  }
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const state = crypto.randomBytes(32).toString("hex");
  const issuedAt = Date.now();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID.trim(),
    redirect_uri: googleRedirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  redirect(
    response,
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    [oauthStateCookie(state, returnTo, issuedAt)],
  );
}

async function googleUser(request, code) {
  const redirectUri = googleRedirectUri(request);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
    signal: AbortSignal.timeout(10_000),
  });
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenBody.access_token) throw errorWithStatus(502, "Google token exchange gagal.");
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    signal: AbortSignal.timeout(10_000),
  });
  const profile = await profileResponse.json().catch(() => ({}));
  if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified !== true) {
    throw errorWithStatus(401, "Profil Google tidak tervalidasi.");
  }
  return {
    subject: String(profile.sub),
    email: normalizedEmail(profile.email),
    name: String(profile.name || profile.email.split("@")[0]).trim().slice(0, 200),
    avatarUrl: typeof profile.picture === "string" ? profile.picture.slice(0, 1000) : null,
  };
}

async function googleResolveUser(profile) {
  const identity = await query(
    `select customer_id
       from public.portal_auth_identities
      where provider = 'google' and subject = $1
      limit 1`,
    [profile.subject],
  );
  let user = identity.rows[0] ? await findUserById(identity.rows[0].customer_id) : await findUserByEmail(profile.email);
  if (!user) {
    const inserted = await query(
      `insert into public.portal_customers
        (name, email, password_hash, role, oauth_provider, oauth_id, avatar_url)
       values ($1, $2, '', 'customer', 'google', $3, $4)
       returning id, name, email, phone, company, role, customer_type, account_status`,
      [profile.name, profile.email, profile.subject, profile.avatarUrl],
    );
    user = inserted.rows[0];
  } else {
    await query(
      `update public.portal_customers
          set avatar_url = coalesce($2, avatar_url),
              oauth_provider = case when oauth_provider is null then 'google' else oauth_provider end,
              oauth_id = case when oauth_id is null then $3 else oauth_id end
        where id = $1`,
      [user.id, profile.avatarUrl, profile.subject],
    );
  }
  if (!user) throw errorWithStatus(500, "Akun portal gagal disiapkan.");
  await linkIdentity(user.id, "google", profile.subject);
  return findUserById(user.id);
}

export async function handleGoogleCallback(request, response, url) {
  const cookie = readCookie(request, "portal_oauth_state");
  let context = null;
  try {
    const [payload, signature] = cookie.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const expected = signedOAuthState(decoded.state, decoded.returnTo, decoded.issuedAt);
    if (
      !decoded.state || !decoded.returnTo ||
      !timingSafeEqualText(signature, expected) ||
      Date.now() - Number(decoded.issuedAt) > OAUTH_STATE_TTL_MS ||
      !timingSafeEqualText(String(url.searchParams.get("state") ?? ""), String(decoded.state))
    ) {
      throw new Error("invalid oauth state");
    }
    context = { returnTo: safeReturnTo(decoded.returnTo) };
  } catch {
    redirect(response, googleFailureTarget("/login"), [clearOAuthStateCookie()]);
    return;
  }
  if (url.searchParams.get("error") || !url.searchParams.get("code")) {
    redirect(response, googleFailureTarget(context.returnTo), [clearOAuthStateCookie()]);
    return;
  }
  try {
    const profile = await googleUser(request, url.searchParams.get("code"));
    const user = await googleResolveUser(profile);
    const result = await loginUser(user);
    redirect(response, context.returnTo, [
      ...sessionCookies(result.token),
      clearOAuthStateCookie(),
    ]);
  } catch (error) {
    console.error("[customer-portal-api] Google OAuth callback failed", error?.message ?? error);
    redirect(response, googleFailureTarget(context.returnTo), [clearOAuthStateCookie()]);
  }
}