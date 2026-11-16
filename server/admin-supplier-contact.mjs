// DEV-only contact editor for an existing supplier. Does not create vendors,
// profiles, financial records, quotations or purchase orders.
function failure(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

export function validateDevSupplierContactPatch(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    failure(400, "Data kontak supplier tidak valid.");
  }
  const keys = Object.keys(input);
  const allowed = new Set(["phone", "email", "contactPerson", "expectedUpdatedAt"]);
  if (keys.some((key) => !allowed.has(key))) {
    failure(400, "Perubahan hanya diizinkan untuk kontak supplier.");
  }
  if (!["phone", "email", "contactPerson"].every((key) => typeof input[key] === "string")) {
    failure(400, "Nomor WhatsApp, email dan PIC harus berupa teks.");
  }

  let phone = input.phone.trim().replace(/[\s()\-\.]/g, "");
  if (phone.startsWith("+62")) phone = phone.slice(1);
  else if (phone.startsWith("08")) phone = "62" + phone.slice(1);
  else if (phone.startsWith("8")) phone = "62" + phone;
  if (phone && !/^628\d{8,12}$/.test(phone)) {
    failure(400, "Nomor WhatsApp vendor harus menggunakan nomor seluler Indonesia yang valid.");
  }

  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || /[\r\n]/.test(email)
      || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    failure(400, "Email kontak supplier tidak valid.");
  }
  const contactPerson = input.contactPerson.trim();
  if (contactPerson.length > 120 || /[\r\n]/.test(contactPerson)) {
    failure(400, "Nama PIC supplier tidak valid.");
  }
  if (!phone && !email) failure(400, "Isi minimal satu kontak resmi (WhatsApp atau email).");

  const ts = input.expectedUpdatedAt;
  if (ts !== null && (typeof ts !== "string" || ts.length > 40
      || !Number.isFinite(Date.parse(ts)))) {
    failure(400, "Versi data supplier tidak valid. Muat ulang daftar vendor.");
  }
  if (!Object.prototype.hasOwnProperty.call(input, "expectedUpdatedAt")) {
    failure(400, "Versi data supplier wajib dikirim untuk mencegah data tertimpa.");
  }
  return {
    phone: phone || null,
    email: email || null,
    contactPerson: contactPerson || null,
    expectedUpdatedAt: ts,
  };
}

export async function updateExistingSupplierContacts({
  supplierId, body, user, db, env = process.env,
}) {
  if (env.APP_ENV !== "development") {
    failure(404, "Editor kontak supplier hanya tersedia pada DEV.");
  }
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    failure(403, "Hanya Admin yang dapat mengubah kontak supplier.");
  }
  if (!Number.isSafeInteger(supplierId) || supplierId <= 0) {
    failure(400, "ID supplier tidak valid.");
  }
  const data = validateDevSupplierContactPatch(body);
  const sql = [
    "update public.suppliers",
    "set phone = $1, contact_email = $2, contact_person = $3, updated_at = now()",
    "where id = $4 and is_active = true",
    "and updated_at is not distinct from $5::timestamptz",
    "returning id, name, company_id, phone, contact_email as email, contact_person, updated_at",
  ].join(" ");
  const result = await db(sql,
    [data.phone, data.email, data.contactPerson, supplierId, data.expectedUpdatedAt]);
  if (!result.rows[0]) {
    const current = await db("select id, is_active from public.suppliers where id=$1", [supplierId]);
    if (!current.rows[0]) failure(404, "Supplier yang dipilih tidak ditemukan.");
    if (!current.rows[0].is_active) failure(409, "Supplier nonaktif tidak boleh diubah lewat editor ini.");
    failure(409, "Data kontak supplier berubah. Muat ulang agar tidak menimpa perubahan orang lain.");
  }
  return result.rows[0];
}
