import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const backend = readFileSync(resolve(process.cwd(), "server/admin-portal.mjs"), "utf8");
const onboarding = readFileSync(resolve(process.cwd(), "src/pages/onboarding.tsx"), "utf8");
const indonesia = readFileSync(resolve(process.cwd(), "src/i18n/locales/id-ID.ts"), "utf8");
const rfqCompletion = readFileSync(resolve(process.cwd(), "src/components/RfqCustomerContextCompletion.tsx"), "utf8");

const mutationStart = backend.indexOf("async function handleOrganizationMutation(ctx)");
const mutationEnd = backend.indexOf("\nasync function handleOnboardingComplete(ctx)", mutationStart);
const mutation = backend.slice(mutationStart, mutationEnd);

describe("DEV organization company-affiliation guarded writer", () => {
  it("types nullable organization-name PostgreSQL bind parameters", () => {
    expect(backend).toContain("when $2::text is not null then $2::text");
    expect(backend).not.toContain("when $2 is not null then $2");
  });

  it("uses one connection and per-customer locking for organization mutation", () => {
    expect(mutationStart).toBeGreaterThan(0);
    expect(mutationEnd).toBeGreaterThan(mutationStart);
    expect(mutation).toContain("await pool.connect()");
    expect(mutation).toContain('await client.query("begin")');
    expect(mutation).toContain("pg_advisory_xact_lock($1)");
    expect(mutation).toContain("for update");
    expect(mutation).toContain("client.query.bind(client)");
    expect(mutation).toContain('await client.query("commit")');
    expect(mutation).toContain('await client.query("rollback")');
    expect(mutation).toContain("client.release()");
  });

  it("does not promise automatic corporate membership in the DEV onboarding UX", () => {
    for (const oldText of [
      "Membership akan dibuat atau diaktifkan untuk perusahaan ini.",
      "Setelah disimpan, Anda dapat membuat RFQ dengan konteks perusahaan yang dipilih.",
      "Perusahaan terdaftar dipilih. Membership akan dibuat otomatis.",
      "Perusahaan terdaftar dipilih — membership akan dibuat otomatis.",
    ]) {
      expect(onboarding).not.toContain(oldText);
      expect(indonesia).not.toContain(oldText);
    }
    expect(onboarding).toContain("afiliasi menunggu persetujuan Admin");
    expect(indonesia).toContain("menunggu persetujuan Admin");
    expect(rfqCompletion).toContain("RFQ/PO perusahaan menunggu persetujuan");
  });
});
