import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("commercial operations hardening", () => {
  it("records runtime health, public probes, and recovery drills", () => {
    const ops = readFileSync(join(process.cwd(), "server/operational-health.mjs"), "utf8");

    expect(ops).toContain('checkName: "runtime_health"');
    expect(ops).toContain('checkName: "public_production_probe"');
    expect(ops).toContain("runRecoveryDrill");
    expect(ops).toContain("portal_recovery_drill_scratch");
    expect(ops).toContain("rollbackVerified");
    expect(ops).toContain("pg_current_wal_lsn()");
  });

  it("keeps monitoring lightweight and restart-safe", () => {
    const ops = readFileSync(join(process.cwd(), "server/operational-health.mjs"), "utf8");

    expect(ops).toContain("5 * 60_000");
    expect(ops).toContain("15 * 60_000");
    expect(ops).toContain("runRecoveryDrillIfDue");
    expect(ops).toContain("7 * 24 * 60 * 60_000");
    expect(ops).toContain("created_at < now() - interval '30 days'");
  });

  it("protects operational controls behind admin authentication", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    expect(server).toContain('/api/portal/admin/operations/health');
    expect(server).toContain("const user = await requireAdmin(request, response)");
    expect(server).toContain('action === "runtime-check"');
    expect(server).toContain('action === "public-probe"');
    expect(server).toContain('action === "recovery-drill"');
    expect(server).toContain("startOperationalMonitoring()");
    expect(server).toContain("stopOperationalMonitoring()");
  });

  it("keeps operational audit tables private from client roles", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926224500_portal_operational_monitoring_and_recovery_drill.sql"),
      "utf8",
    );

    expect(migration).toContain("portal_operational_checks");
    expect(migration).toContain("portal_recovery_drill_runs");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.portal_operational_checks from anon, authenticated");
    expect(migration).toContain("revoke all on table public.portal_recovery_drill_runs from anon, authenticated");
  });
});
