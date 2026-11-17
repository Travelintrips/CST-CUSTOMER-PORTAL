// Customer Portal DEV -> official CST WA Gateway API (NOT Fonnte).
// Never borrow Fleet, Tenant or AI Core credentials or device assignments.
import { normalizeWhatsAppPhone } from "./wa-phone.mjs";

export const CST_GATEWAY_URL = "https://aicst.co.id";
export const DEV_PORTAL_DEVICE_ID = "customer-portal-dev";
const EXPECTED_COMPANY = "1";

const clean = (value) => typeof value === "string" ? value.trim() : "";
const reject = (reason) => ({ matched: false, reason });
const phoneValid = (value) => /^628\d{8,12}$/.test(value ?? "");

export function resolveDevCustomerPortalGatewayToken(env = process.env) {
  // Dedicated, server-only client API token. No general gateway/admin fallback.
  return clean(env.CUSTOMER_PORTAL_WA_GATEWAY_TOKEN_DEV);
}

export function evaluateDevPortalGatewayDevice({ devices, expectedPhone, deviceId = DEV_PORTAL_DEVICE_ID }) {
  const normalized = normalizeWhatsAppPhone(expectedPhone);
  if (!phoneValid(normalized)) return reject("Nomor resmi pengirim WA Gateway DEV belum ditentukan.");
  if (deviceId !== DEV_PORTAL_DEVICE_ID) return reject("Perangkat tidak termasuk Customer Portal DEV.");
  // Gateway returns only assigned devices for scoped clients. An unscoped
  // Fleet/Tenant/Admin token exposing multiple devices MUST fail closed.
  if (!Array.isArray(devices) || devices.length !== 1) {
    return reject("WA Gateway harus memberikan tepat satu perangkat khusus Customer Portal DEV.");
  }
  const device = devices[0];
  if (device?.deviceId !== DEV_PORTAL_DEVICE_ID || device?.companyId !== EXPECTED_COMPANY) {
    return reject("Perangkat atau perusahaan gateway bukan Customer Portal DEV.");
  }
  if (device?.enabled !== true || String(device?.status ?? "").toUpperCase() !== "ONLINE") {
    return reject("Perangkat Customer Portal DEV belum online.");
  }
  if (normalizeWhatsAppPhone(device?.phoneNumber) !== normalized) {
    return reject("Nomor pengirim WA Gateway berbeda dari nomor resmi Customer Portal DEV.");
  }
  return { matched: true, reason: null };
}

export async function verifyDevCustomerPortalGatewaySender({
  gatewayToken,
  expectedPhone,
  deviceId = DEV_PORTAL_DEVICE_ID,
  fetchFn = fetch,
} = {}) {
  const token = clean(gatewayToken);
  if (!token) return reject("Token client WA Gateway Customer Portal DEV belum tersedia.");
  if (deviceId !== DEV_PORTAL_DEVICE_ID) return reject("Perangkat WA Gateway bukan Customer Portal DEV.");
  if (!phoneValid(normalizeWhatsAppPhone(expectedPhone))) {
    return reject("Nomor resmi pengirim WA Gateway DEV belum ditentukan.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchFn(CST_GATEWAY_URL + "/v1/devices", {
      method: "GET",
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return reject("Kredensial WA Gateway DEV ditolak atau status perangkat tidak tersedia.");
    const payload = await response.json().catch(() => ({}));
    return evaluateDevPortalGatewayDevice({
      devices: payload.devices, expectedPhone, deviceId,
    });
  } catch {
    return reject("WA Gateway CST tidak dapat diperiksa.");
  } finally {
    clearTimeout(timeout);
  }
}

export function buildDevGatewayIdempotencyKey({ queueId, rfqId, quoteId }) {
  const ids = [queueId, rfqId, quoteId].map(Number);
  if (ids.some((n) => !Number.isSafeInteger(n) || n <= 0)) {
    throw Error("ID RFQ/Quote/antrean tidak valid.");
  }
  return "cst-customer-portal-dev:queue:" + ids[0] + ":rfq:" + ids[1] + ":quote:" + ids[2];
}

export async function sendDevCustomerPortalGatewayMessage({
  gatewayToken, deviceId = DEV_PORTAL_DEVICE_ID, phone, message,
  idempotencyKey, fetchFn = fetch,
} = {}) {
  const token = clean(gatewayToken);
  const number = normalizeWhatsAppPhone(phone);
  if (!token || deviceId !== DEV_PORTAL_DEVICE_ID) {
    throw Error("Kredensial/perangkat gateway Customer Portal DEV tidak valid.");
  }
  if (!phoneValid(number) || !clean(message)) throw Error("Nomor tujuan atau pesan tidak valid.");
  if (!/^cst-customer-portal-dev:queue:[1-9]\d*:rfq:[1-9]\d*:quote:[1-9]\d*$/.test(clean(idempotencyKey))) {
    throw Error("Idempotency key khusus antrean tidak valid.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetchFn(CST_GATEWAY_URL + "/v1/messages", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        type: "text", text: clean(message), to: number, deviceId,
        clientMessageId: idempotencyKey,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !["queued", "duplicate"].includes(payload?.status)
      || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(payload?.messageId ?? ""))) {
      throw Error("WA Gateway tidak memastikan penerimaan antrean pesan.");
    }
    // Gateway "queued" is NOT proof WhatsApp sent or delivered.
    return { status: payload.status, messageId: String(payload.messageId) };
  } finally {
    clearTimeout(timeout);
  }
}
