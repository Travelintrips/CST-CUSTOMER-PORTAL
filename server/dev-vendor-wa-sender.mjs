// Customer Portal DEV only: verify sender device identity before any vendor WA send.
// The device token remains server-side and is never returned in API responses.
import { resolveCustomerPortalFonnteToken } from "./fonnte-config.mjs";
import { normalizeWhatsAppPhone } from "./whatsapp-service.mjs";

export function evaluateDevVendorWaSenderProfile({ expectedPhone, profile }) {
  const expected = normalizeWhatsAppPhone(expectedPhone);
  if (!expected || !/^628\d{8,12}$/.test(expected)) {
    return { matched: false, reason: "Nomor resmi pengirim WhatsApp DEV belum ditentukan." };
  }
  if (profile?.status !== true) {
    return { matched: false, reason: "Identitas pengirim Fonnte tidak berhasil diverifikasi." };
  }
  const actual = normalizeWhatsAppPhone(profile?.device);
  if (actual !== expected) {
    return { matched: false, reason: "Nomor pengirim Fonnte tidak cocok dengan akun Customer Portal DEV." };
  }
  if (String(profile?.device_status ?? "").toLowerCase() !== "connect") {
    return { matched: false, reason: "Perangkat WhatsApp pengirim DEV belum terhubung." };
  }
  return { matched: true, reason: null };
}

export async function verifyDevVendorWaSender({
  expectedPhone, resolveToken = resolveCustomerPortalFonnteToken, fetchFn = fetch,
} = {}) {
  const expected = normalizeWhatsAppPhone(expectedPhone);
  if (!expected || !/^628\d{8,12}$/.test(expected)) {
    return { matched: false, reason: "Nomor resmi pengirim WhatsApp DEV belum ditentukan." };
  }
  const token = await resolveToken();
  if (!token) return { matched: false, reason: "Token pengirim WhatsApp DEV belum tersedia." };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchFn("https://api.fonnte.com/device", {
      method: "POST",
      headers: { Authorization: token, Accept: "application/json" },
      signal: controller.signal,
    });
    const profile = await response.json().catch(() => ({}));
    return evaluateDevVendorWaSenderProfile({
      expectedPhone: expected, profile: response.ok ? profile : null,
    });
  } catch {
    return { matched: false, reason: "Identitas pengirim Fonnte tidak dapat diperiksa." };
  } finally {
    clearTimeout(timeout);
  }
}
