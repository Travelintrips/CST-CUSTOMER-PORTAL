import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  validateDevSupplierContactPatch,
  updateExistingSupplierContacts,
} from "../server/admin-supplier-contact.mjs";

const admin = { id: 100, role: "admin" };
const env = { APP_ENV: "development" };
const patch = {
  phone: "0812-3456-7890",
  email: "  Supplier@Example.Com  ",
  contactPerson: "Official PIC",
  expectedUpdatedAt: "2026-11-16T18:00:00.000Z",
};

describe("DEV edit contact for existing supplier", () => {
  it("returns a full-precision supplier revision from GET and PATCH; never rounds microseconds", () => {
    const listHandler = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const patchHandler = readFileSync(join(process.cwd(), "server/admin-supplier-contact.mjs"), "utf8");
    const revisionSql = `to_char(s.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as updated_at`;
    expect(listHandler).toContain(revisionSql);
    expect(patchHandler).toContain(`to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as updated_at`);
    expect(patchHandler).toContain("updated_at is not distinct from $5::timestamptz");
    const exactRevision = "2026-07-13T16:06:44.680098Z";
    expect(Date.parse(exactRevision)).not.toBeNaN();
    expect(exactRevision).not.toBe(new Date(exactRevision).toISOString());
    expect(validateDevSupplierContactPatch({ ...patch, expectedUpdatedAt: exactRevision }).expectedUpdatedAt).toBe(exactRevision);
  });

  it("passes six-digit revisions through untouched on contact save", async () => {
    const exactRevision = "2026-07-13T16:06:44.680098Z";
    const db = vi.fn().mockResolvedValue({ rows: [{
      id: 24, name: "PT Cahaya Sejati Teknologi", company_id: 1,
      phone: "6281234567890", email: "supplier@example.com",
      contact_person: "Official PIC", updated_at: "2026-11-17T00:00:00.123456Z",
    }] });
    const out = await updateExistingSupplierContacts({
      supplierId: 24, body: { ...patch, expectedUpdatedAt: exactRevision }, user: admin, db, env,
    });
    expect(db.mock.calls[0][1][4]).toBe(exactRevision);
    expect(out.updated_at).toBe("2026-11-17T00:00:00.123456Z");
    expect(db).toHaveBeenCalledTimes(1);
  });

  it("normalizes Indonesian WhatsApp and email without accepting financial fields", () => {
    expect(validateDevSupplierContactPatch(patch)).toEqual({
      phone: "6281234567890",
      email: "supplier@example.com",
      contactPerson: "Official PIC",
      expectedUpdatedAt: "2026-11-16T18:00:00.000Z",
    });
    expect(() => validateDevSupplierContactPatch({ ...patch, companyId: 3 }))
      .toThrow(/hanya diizinkan/i);
    expect(() => validateDevSupplierContactPatch({ ...patch, isVerified: true }))
      .toThrow(/hanya diizinkan/i);
  });

  it("updates only a pre-existing active supplier with a version check", async () => {
    const db = vi.fn(async (sql: string, args: unknown[]) => {
      expect(sql).toMatch(/update public\.suppliers/i);
      expect(sql).toContain("updated_at is not distinct from $5");
      expect(sql).not.toMatch(/\b(insert|delete)\b/i);
      expect(sql).not.toMatch(/is_verified|company_id\s*=/i);
      expect(args).toEqual([
        "6281234567890", "supplier@example.com", "Official PIC",
        24, "2026-11-16T18:00:00.000Z",
      ]);
      return { rows: [{
        id: 24, name: "PT Cahaya Sejati Teknologi", company_id: 1,
        phone: "6281234567890", email: "supplier@example.com",
        contact_person: "Official PIC", updated_at: "2026-11-17T00:00:00.000Z",
      }] };
    });
    const result = await updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: admin, db, env,
    });
    expect(result.id).toBe(24);
    expect(result.company_id).toBe(1);
    expect(db).toHaveBeenCalledTimes(1);
  });

  it("forbids PROD and non-Admin, without querying any records", async () => {
    const db = vi.fn();
    await expect(updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: admin, db, env: { APP_ENV: "production" },
    })).rejects.toMatchObject({ statusCode: 404 });
    await expect(updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: { id: 31, role: "customer" }, db, env,
    })).rejects.toMatchObject({ statusCode: 403 });
    expect(db).not.toHaveBeenCalled();
  });

  it("refuses malformed contact input and changed company or finance fields", () => {
    for (const bad of [
      { ...patch, phone: "123" }, { ...patch, email: "x\r\nBcc:bad@evil.test" },
      { ...patch, phone: "", email: "" },
      { ...patch, contactPerson: "A".repeat(121) },
      { ...patch, expectedUpdatedAt: "no" },
      { phone: patch.phone, email: patch.email, contactPerson: "X" },
      { ...patch, role: "super_admin" },
      { ...patch, journalAmount: 200000 },
    ]) {
      expect(() => validateDevSupplierContactPatch(bad)).toThrow();
    }
  });

  it("returns conflict if supplier changed since the screen was loaded", async () => {
    const db = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 24, is_active: true }] });
    await expect(updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: admin, db, env,
    })).rejects.toMatchObject({ statusCode: 409 });
    expect(db).toHaveBeenCalledTimes(2);
  });

  it("does not allow editing nonexistent or inactive supplier records", async () => {
    const absent = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: admin, db: absent, env,
    })).rejects.toMatchObject({ statusCode: 404 });
    const inactive = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 24, is_active: false }] });
    await expect(updateExistingSupplierContacts({
      supplierId: 24, body: patch, user: admin, db: inactive, env,
    })).rejects.toMatchObject({ statusCode: 409 });
  });

  it("wires the existing Admin vendor marketplace, never vendor creation", () => {
    const server = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const adminUi = readFileSync(join(process.cwd(), "src/pages/admin/VendorSystems.tsx"), "utf8");
    const index = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    expect(index).toContain("await requireAdmin(request, response)");
    expect(server).toContain('process.env.APP_ENV === "development"');
    expect(server).toContain("updateExistingSupplierContacts");
    expect(server).toContain('request.method === "PATCH"');
    expect(adminUi).toContain("Edit Kontak");
    expect(adminUi).toContain("expectedUpdatedAt: editingContact.updated_at ?? null");
    expect(adminUi).toContain("Simpan Kontak");
    expect(adminUi).not.toContain("contactEmailPlaceholderFromProd");
  });
});
