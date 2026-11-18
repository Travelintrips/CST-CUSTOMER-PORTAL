// @ts-nocheck — ensure the standalone fail-closed integration contract runs in CI.
import { spawnSync } from "node:child_process";
import { test, expect } from "vitest";

test("PR206 + PR208 reviewed Accounting loader contract is mandatory in CI", () => {
  const result = spawnSync(process.execPath, [
    "--test", "scripts/customer-invoice-combined-owner-integration.test.mjs"
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 20_000,
    env: {
      ...process.env,
      APP_ENV: "development",
      NODE_ENV: "test",
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV: "false",
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV: "false",
      CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV: "false",
    },
  });
  expect(result.status, result.stderr || result.stdout).toBe(0);
  expect(result.stdout).toContain("# pass 3");
  expect(result.stdout).toContain("# fail 0");
});
