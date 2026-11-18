import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const verification = readFileSync(new URL("../src/pages/company-verification.tsx", import.meta.url), "utf8");
const profile = readFileSync(new URL("../src/pages/company-profile.tsx", import.meta.url), "utf8");
const server = readFileSync(new URL("../server/index.mjs", import.meta.url), "utf8");
const admin = readFileSync(new URL("../server/admin-portal.mjs", import.meta.url), "utf8");

test("KTP verification accepts canonical cookie-session state rather than legacy storage token", () => {
  assert.match(verification, /import \{ getAuthHeaders, isAuthenticated \} from "@\/lib\/auth"/);
  assert.match(verification, /const authed = isAuthenticated\(\)/);
  assert.match(verification, /if \(!authed\) setLocation\("\/login"\)/);
  assert.doesNotMatch(verification, /getAuthToken\(/);
  assert.match(verification, /credentials: "include"/);
});

test("verified session has distinct address and KTP document flows", () => {
  assert.match(profile, /Alamat sesuai KTP PIC/);
  assert.match(profile, /ktpAddress: form|value=\{form\.ktpAddress\}/);
  assert.match(verification, /KTP_PIC/);
  assert.match(verification, /\/api\/customer-verification\/documents/);
  assert.match(server, /if \(pathname === "\/api\/customer-verification"/);
  assert.match(admin, /profile_result|portal_customer_profiles/);
});
