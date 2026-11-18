import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const pending = readFileSync(new URL("../src/pages/pending-approval.tsx", import.meta.url), "utf8");

test("pending company profile routes are explicitly allowed after verified bootstrap", () => {
  const bootstrapPosition = app.indexOf("if (!bootstrap) {", app.indexOf("function ProtectedRoute("));
  const recoveryPosition = app.indexOf("const isProfileRecoveryPath", bootstrapPosition);
  const adminPosition = app.indexOf("if (role === \"admin\")", recoveryPosition);
  const pendingPosition = app.indexOf("bootstrap.allowedDestination === \"/pending-approval\"", recoveryPosition);
  assert(bootstrapPosition >= 0 && recoveryPosition > bootstrapPosition);
  assert(adminPosition > recoveryPosition && pendingPosition > recoveryPosition);
  assert.match(app.slice(recoveryPosition, adminPosition), /location === "\/company-profile"/);
  assert.match(app.slice(recoveryPosition, adminPosition), /location === "\/profile\/company-verification"/);
  assert.match(app.slice(recoveryPosition, adminPosition), /if \(isProfileRecoveryPath && !adminOnly\)/);
});

test("pending screen offers direct recovery links and retains status gate", () => {
  assert.match(pending, /isCompanyPending && \(/);
  assert.match(pending, /setLocation\("\/company-profile"\)/);
  assert.match(pending, /setLocation\("\/profile\/company-verification"\)/);
  assert.match(pending, /Menunggu Verifikasi Perusahaan/);
  assert.match(app, /bootstrap.allowedDestination === "\/pending-approval"/);
});
