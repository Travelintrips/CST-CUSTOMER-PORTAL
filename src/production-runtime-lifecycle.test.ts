import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production runtime availability lifecycle", () => {
  it("opens the HTTP listener before dependency readiness and gates business APIs", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    expect(server).toContain('let runtimeState = "starting"');
    expect(server).toContain("async function establishRuntimeReadiness()");
    expect(server).toContain("server.listen(PORT, \"0.0.0.0\")");
    expect(server).toContain("void establishRuntimeReadiness()");
    expect(server).toContain('pathname.startsWith("/api/")');
    expect(server).toContain('runtimeState !== "ready"');
    expect(server).toContain('"Retry-After": "3"');
    expect(server).toContain("frontend remains available and API stays gated");
  });

  it("uses liveness separately from dependency readiness", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const smoke = readFileSync(join(process.cwd(), "scripts/portal-production-smoke.mjs"), "utf8");

    expect(server).toContain('status: runtimeState === "draining" ? "draining" : "ok"');
    expect(server).toContain('if (runtimeState !== "ready")');
    expect(server).toContain('storageReason: runtimeState === "draining" ? "runtime_draining" : "runtime_starting"');
    expect(smoke).toContain('assert.equal(health.body?.runtimeState, "ready")');
    expect(smoke).toContain('assert.equal(readiness.body?.database, "connected")');
  });

  it("drains before closing database connections", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    expect(server).toContain('runtimeState = "draining"');
    expect(server).toContain("await sleep(DRAIN_DELAY_MS)");
    expect(server).toContain("server.close(() => resolve(\"closed\"))");
    expect(server).toContain("server.closeIdleConnections?.()");
    expect(server).toContain("server.closeAllConnections?.()");
    expect(server.indexOf("await closeDatabase()")).toBeGreaterThan(server.indexOf("server.close(() => resolve"));
  });

  it("verifies three consecutive ready front-door probes after deployment", () => {
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/production-verify.yml"), "utf8");

    expect(workflow).toContain("consecutive=0");
    expect(workflow).toContain("consecutive=$((consecutive + 1))");
    expect(workflow).toContain('if [ "$consecutive" -ge 3 ]');
    expect(workflow).toContain("Release readiness and front door are stable across three consecutive probes.");
  });

  it("keeps core auth APIs available when document storage is degraded", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const storage = readFileSync(join(process.cwd(), "server/storage.mjs"), "utf8");

    expect(server).toContain("document storage degraded; core APIs remain available");
    expect(server).toContain("storageDegraded: true");
    expect(server).toContain('status: "ready"');
    expect(storage).toContain('process.env.SUPABASE_STORAGE_BUCKET || "private-uploads"');
    expect(storage).toContain('? "private-uploads"');
  });

});
