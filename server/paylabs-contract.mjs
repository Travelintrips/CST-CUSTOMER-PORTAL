import crypto from "node:crypto";

export function normalizePaylabsPem(rawValue) {
  let raw = String(rawValue ?? "").trim();
  if (!raw) return "";

  if (!raw.includes("-----BEGIN")) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
      if (decoded.includes("-----BEGIN")) raw = decoded;
    } catch {
      // Keep the original value and let crypto validate it later.
    }
  }

  raw = raw.replace(/\\n/g, "\n");
  if (raw.includes("\n")) return raw;

  const headerMatch = raw.match(/(-----BEGIN [A-Z ]+-----)/);
  const footerMatch = raw.match(/(-----END [A-Z ]+-----)/);
  if (!headerMatch || !footerMatch) return raw;

  const header = headerMatch[1];
  const footer = footerMatch[1];
  const body = raw
    .slice(raw.indexOf(header) + header.length, raw.lastIndexOf(footer))
    .replace(/\s+/g, "");
  const chunks = body.match(/.{1,64}/g) ?? [body];
  return [header, ...chunks, footer].join("\n");
}

export function formatPaylabsTimestamp(now = Date.now()) {
  return new Date(now + 7 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "+07:00");
}

export function buildPaylabsSignaturePayload(method, endpoint, bodyJson, timestamp) {
  const bodyHash = crypto.createHash("sha256").update(bodyJson).digest("hex").toLowerCase();
  return `${method}:${endpoint}:${bodyHash}:${timestamp}`;
}

export function isPaylabsTimestampFresh(timestamp, now = Date.now(), maxSkewMs = 5 * 60 * 1000) {
  const parsed = Date.parse(String(timestamp ?? ""));
  if (!Number.isFinite(parsed)) return false;
  const skew = Math.abs(Number(now) - parsed);
  return skew <= Math.max(0, Number(maxSkewMs) || 0);
}

export function mapPaylabsStatus(value) {
  const status = String(value ?? "").trim().toUpperCase();
  if (["02", "SUCCESS", "PAID", "SUCCESSFUL", "COMPLETED"].includes(status)) return "paid";
  if (["03", "EXPIRED"].includes(status)) return "expired";
  if (["04", "CANCELLED", "CANCELED"].includes(status)) return "cancelled";
  if (["05", "FAILED", "FAIL"].includes(status)) return "failed";
  return "pending";
}

export function resolvePaylabsWebhookStatus(currentStatus, providerStatus) {
  const current = String(currentStatus ?? "pending").toLowerCase();
  const mapped = mapPaylabsStatus(providerStatus);
  if (current === "paid") return "paid";
  if (mapped === "pending" && current !== "pending") return current;
  return mapped;
}

export function isTrustedPaylabsPaymentUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "pay.paylabs.co.id"
      || host === "sit-pay.paylabs.co.id"
      || host.endsWith(".paylabs.co.id");
  } catch {
    return false;
  }
}
