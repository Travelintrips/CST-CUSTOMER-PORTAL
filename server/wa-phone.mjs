// Shared Indonesian WhatsApp phone normalization, provider independent.
export function normalizeWhatsAppPhone(value) {
  const raw = (typeof value === "string" ? value.trim() : "").replace(/[^0-9]/g, "");
  if (!raw) return null;
  if (raw.startsWith("62")) return raw;
  if (raw.startsWith("0")) return `62${raw.slice(1)}`;
  if (raw.startsWith("8")) return `62${raw}`;
  return raw;
}
