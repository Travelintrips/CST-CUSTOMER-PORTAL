import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const server = readFileSync(new URL("../server/index.mjs", import.meta.url), "utf8");
const loader = readFileSync(new URL("../server/dev-original-accounting-owner-loader.mjs", import.meta.url), "utf8");

test("Invoice POST invokes PR208 reviewed owner, not older unpinned loader", () => {
  assert.match(server, /import \{ loadDevOriginalAccountingOwner \} from "\.\/dev-original-accounting-owner-loader\.mjs"/);
  assert.match(server, /postSalesInvoiceWithClient = await loadDevOriginalAccountingOwner\(\)/);
  assert.match(server, /CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV === "true"[\s\S]*typeof postSalesInvoiceWithClient !== "function"/);
  assert.doesNotMatch(server, /loadTrustedDevAccountingOwner\(/);
});

test("PR208 package pins all five artifacts, exact DEV database and fail-closed behavior", () => {
  for (const name of ["portalInvoiceAdapter.mjs","pino-file.mjs","pino-pretty.mjs","pino-worker.mjs","thread-stream-worker.mjs"]) {
    assert(loader.includes(JSON.stringify(name)), name);
  }
  assert.match(loader, /xssrfshdrtdfupgqwfdw/);
  assert.match(loader, /databaseConnectionSource !== "SUPABASE_DATABASE_URL_DEV"/);
  assert.match(loader, /actualPath !== intended/);
  assert.match(loader, /isReviewedOriginalOwnerBundle\(await readFile\(actualPath\), expectedHash\)/);
});

test("runtime loader stays OFF without flags, and fails closed without original owner bundle", () => {
  const source = [
    "import { loadDevOriginalAccountingOwner } from './server/dev-original-accounting-owner-loader.mjs';",
    "if (await loadDevOriginalAccountingOwner() !== null) process.exit(10);",
    "process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV = 'true';",
    "process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV = 'true';",
    "if (await loadDevOriginalAccountingOwner() !== null) process.exit(11);",
    "console.log('PINNED_OWNER_MISSING_FAIL_CLOSED_PASS');"
  ].join("\n");
  const run = spawnSync(process.execPath, ["--input-type=module","--eval",source],{
    cwd:process.cwd(),encoding:"utf8",timeout:12000,
    env:{...process.env,APP_ENV:"development",NODE_ENV:"development",
      SUPABASE_DATABASE_URL_DEV:"postgresql://postgres.xssrfshdrtdfupgqwfdw:dummy@127.0.0.1:6543/cst_dev",
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false",
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false"}
  });
  assert.equal(run.status,0,run.stderr || run.stdout);
  assert.match(run.stdout,/PINNED_OWNER_MISSING_FAIL_CLOSED_PASS/);
});
