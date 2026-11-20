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

test("runtime owner stays OFF by default; a present bundle must be SHA-pinned", () => {
  // CI has no host-installed bundle; on the DEV VPS the exact reviewed bundle
  // is already staged. Both conditions must pass without disabling any guard.
  const source = [
    "(async () => {",
    "  const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');",
    "  const mod=await import('./server/dev-original-accounting-owner-loader.mjs');",
    "  if(await mod.loadDevOriginalAccountingOwner()!==null)process.exit(10);",
    "  process.env.CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV='true';",
    "  process.env.CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV='true';",
    "  let present=true;",
    "  for(const [name,sha] of Object.entries(mod.DEV_ACCOUNTING_OWNER_HASHES)){",
    "    const file=path.join(mod.DEV_ACCOUNTING_OWNER_DIR,name);",
    "    let bytes;",
    "    try{",
    "      if(fs.realpathSync(file)!==file)throw Error('unsafe bundle path');",
    "      bytes=fs.readFileSync(file);",
    "    }catch{present=false;break;}",
    "    if(crypto.createHash('sha256').update(bytes).digest('hex')!==sha){present=false;break;}",
    "  }",
    "  const owner=await mod.loadDevOriginalAccountingOwner();",
    "  if(present && typeof owner!=='function')process.exit(11);",
    "  if(!present && owner!==null)process.exit(12);",
    "  process.env.SUPABASE_DATABASE_URL_DEV='postgresql://ci:ci@127.0.0.1:5432/ci';",
    "  if(await mod.loadDevOriginalAccountingOwner()!==null)process.exit(13);",
    "  console.log('OWNER_BUNDLE_ABSENT_OR_PINNED_FAIL_CLOSED_PASS');",
    "  process.exit(0);",
    "})().catch(()=>process.exit(14));"
  ].join("\n");
  const run=spawnSync(process.execPath,["--eval",source],{
    cwd:process.cwd(),encoding:"utf8",timeout:20_000,
    env:{...process.env,APP_ENV:"development",NODE_ENV:"development",
      SUPABASE_DATABASE_URL_DEV:"postgresql://postgres.xssrfshdrtdfupgqwfdw:dummy@127.0.0.1:6543/cst_dev",
      CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV:"false",
      CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV:"false",
      CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV:"false"},
  });
  assert.equal(run.status,0,run.stderr||run.stdout);
  assert.match(run.stdout,/OWNER_BUNDLE_ABSENT_OR_PINNED_FAIL_CLOSED_PASS/);
});
