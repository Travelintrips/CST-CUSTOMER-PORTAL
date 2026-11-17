// @ts-nocheck — runtime JS contract tested without a real financial writer.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadTrustedDevAccountingOwner } from "../server/dev-accounting-owner-runtime.mjs";

const keys = [
  "APP_ENV",
  "CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV",
  "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV",
  "CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV",
];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const sha = data => createHash("sha256").update(data).digest("hex");
let dir;
let bundlePath;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "portal-owner-contract-"));
  bundlePath = join(dir, "owner.mjs");
  process.env.APP_ENV = "development";
  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = "true";
  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = "true";
  delete process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV;
});
afterEach(async () => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
  await rm(dir, { recursive: true, force: true });
});

async function fixture(text = "export async function postCustomerPortalSalesInvoiceWithExistingOwner() { return {posted:false}; }") {
  await writeFile(bundlePath, text);
  process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV = sha(text);
}

describe("DEV original Accounting owner runtime package integrity", () => {
  it("keeps feature disabled with missing bundle and no hash", async () => {
    delete process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV;
    await expect(loadTrustedDevAccountingOwner({ bundlePath })).resolves.toBeNull();
  });

  it("never loads in production, even with both flags and a valid-looking hash", async () => {
    process.env.APP_ENV = "production";
    process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV = "a".repeat(64);
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_ENV_DENIED");
  });

  it("requires the existing posted-AR evidence flag", async () => {
    delete process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV;
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_ENV_DENIED");
  });

  it("rejects missing or malformed SHA-256 release pin", async () => {
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_HASH_NOT_PINNED");
    process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV = "../not-a-hash";
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_HASH_NOT_PINNED");
  });

  it("rejects missing and empty packages, without a DB connection", async () => {
    process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV = "a".repeat(64);
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_PACKAGE_UNAVAILABLE");
    await writeFile(bundlePath, "");
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_PACKAGE_UNAVAILABLE");
  });

  it("rejects symlinks even if their target hashes match", async () => {
    const target = join(dir, "target.mjs");
    const data = "export function postCustomerPortalSalesInvoiceWithExistingOwner() {}";
    await writeFile(target, data);
    await symlink(target, bundlePath);
    process.env.CUSTOMER_PORTAL_ACCOUNTING_OWNER_SHA256_DEV = sha(data);
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_PACKAGE_UNAVAILABLE");
  });

  it("rejects modified packages even when they would export a callback", async () => {
    await fixture();
    await writeFile(bundlePath, "export const postCustomerPortalSalesInvoiceWithExistingOwner = () => true;");
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_HASH_MISMATCH");
  });

  it("loads only a pinned export, without executing financial postings", async () => {
    await fixture();
    const callback = await loadTrustedDevAccountingOwner({ bundlePath });
    expect(typeof callback).toBe("function");
    await expect(callback()).resolves.toEqual({ posted: false });
    // Even after initial import, a tampered release cannot pass the next hash check.
    await writeFile(bundlePath, "export const different = true;");
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_HASH_MISMATCH");
  });

  it("rejects a pinned module with the wrong export", async () => {
    await fixture("export const unrelated = true;");
    await expect(loadTrustedDevAccountingOwner({ bundlePath }))
      .rejects.toThrow("DEV_ACCOUNTING_OWNER_EXPORT_INVALID");
  });

  it("wires the trusted callback only after the existing admin gate", async () => {
    const source = await readFile(join(process.cwd(), "server/index.mjs"), "utf8");
    const sectionStart = source.indexOf("  const adminInvoiceActionMatch = ");
    const sectionEnd = source.indexOf("  const adminInvoiceMatch =", sectionStart);
    expect(sectionStart).toBeGreaterThan(0);
    const section = source.slice(sectionStart, sectionEnd);
    expect(section.indexOf("await requireAdmin(request, response)"))
      .toBeLessThan(section.indexOf("await loadTrustedDevAccountingOwner()"));
    expect(section).toContain("postSalesInvoiceWithClient,");
    expect(section).not.toContain("request.body.postSalesInvoiceWithClient");
  });
});
