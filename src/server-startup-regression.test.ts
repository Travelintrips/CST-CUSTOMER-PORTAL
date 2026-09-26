import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("server startup syntax regression", () => {
  it("keeps async logistic payment state inside logisticOrderResponse only", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");

    expect(server).toContain("function mapPortalOrder(row) {\n  return {");
    expect(server).not.toContain("function mapPortalOrder(row) {\n  const [paylabs, manualPaymentAccount] = await Promise.all");
    expect(server).toContain("async function logisticOrderResponse(row, items = [])");
    expect(server).toContain("const [paylabs, manualPaymentAccount] = await Promise.all");
    expect(server).toContain("paylabs,");
    expect(server).toContain("manualPaymentAccount,");
  });

  it("runs backend syntax validation as part of the production build", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    const checker = readFileSync(join(process.cwd(), "scripts/check-server-syntax.mjs"), "utf8");

    expect(pkg.scripts["verify:server-syntax"]).toBe("node scripts/check-server-syntax.mjs");
    expect(pkg.scripts["build:portal"]).toContain("node scripts/check-server-syntax.mjs");
    expect(checker).toContain('collectRuntime(join(root, "server"))');
    expect(checker).toContain('"prepare-hostinger.mjs"');
    expect(checker).not.toContain('collectRuntime(join(root, "scripts"))');
  });

  it("does not scan unrelated legacy maintenance scripts during production build", () => {
    const checker = readFileSync(join(process.cwd(), "scripts/check-server-syntax.mjs"), "utf8");
    expect(checker).not.toContain("inject-sprint1-keys.mjs");
  });
});
