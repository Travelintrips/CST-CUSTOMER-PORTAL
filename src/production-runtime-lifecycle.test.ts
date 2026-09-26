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


  it("production verification probes authentication surfaces after deploy", () => {
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/production-verify.yml"), "utf8");

    expect(workflow).toContain("Verify authentication surface is live");
    expect(workflow).toContain("/api/portal/auth/capabilities");
    expect(workflow).toContain("/api/login/google?returnTo=%2Fdashboard");
    expect(workflow).toContain("Google login is not configured/live.");
    expect(workflow).toContain("Email OTP is not configured/live.");
    expect(workflow).toContain("Expected Google login start to redirect with 302");
  });


  it("keeps newly registered accounts in onboarding until completion", () => {
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");

    expect(auth).toContain("ensureInitialOnboardingProfile");
    expect(auth).toContain("profile_status, updated_at");
    expect(auth).toContain("'incomplete', now()");
    expect(server).toContain('profileStatus === "incomplete"');
    expect(server).toContain('allowedDestination = "/pending-approval"');
    expect(server).toContain('allowedDestination = "/onboarding"');
  });

  it("requires vendor approval before operational vendor APIs", () => {
    const vendorPortal = readFileSync(join(process.cwd(), "server/vendor-portal.mjs"), "utf8");
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");

    expect(vendorPortal).toContain("const vendorVerified");
    expect(vendorPortal).toContain("Akun vendor masih menunggu persetujuan admin.");
    expect(adminPortal).toContain("verification_status = 'pending'");
    expect(adminPortal).toContain('status === "approved" ? "verified" : "rejected"');
    expect(adminPortal).toContain("registration_status = 'approved'");
    expect(adminPortal).toContain("supplier_id = $1");
  });


  it("links approved vendors to suppliers by unambiguous email only", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");

    expect(adminPortal).toContain("Email vendor terhubung ke lebih dari satu supplier");
    expect(adminPortal).toContain("lower(trim(coalesce(contact_email, ''))) = lower(trim($1))");
    expect(adminPortal).not.toContain("or lower(name) = lower($2)");
  });


  it("makes onboarding approval atomic and locks the approval row", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");

    expect(adminPortal).toContain('import { pool, query } from "./db.mjs"');
    expect(adminPortal).toContain('await client.query("begin")');
    expect(adminPortal).toContain("for update");
    expect(adminPortal).toContain('await client.query("commit")');
    expect(adminPortal).toContain('await client.query("rollback").catch(() => {})');
    expect(adminPortal).toContain("Profil vendor belum tersedia. Selesaikan onboarding vendor sebelum approval.");
  });


  it("enforces one canonical onboarding record and idempotent upserts", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926193500_harden_portal_onboarding_uniqueness.sql"),
      "utf8",
    );

    expect(adminPortal).toContain("on conflict (customer_id) where customer_id is not null");
    expect(adminPortal).toContain("on conflict (customer_id)");
    expect(adminPortal).toContain("on conflict (customer_id) where status = 'pending'");
    expect(migration).toContain("portal_customer_profiles_customer_unique_idx");
    expect(migration).toContain("vendor_profiles_customer_unique_idx");
    expect(migration).toContain("onboarding_approvals_one_pending_per_customer_idx");
  });


  it("submits onboarding as one serialized transaction", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");

    expect(adminPortal).toContain("const dbQuery = client.query.bind(client)");
    expect(adminPortal).toContain('select pg_advisory_xact_lock($1)');
    expect(adminPortal).toContain("for update");
    expect(adminPortal).toContain("applyOrganizationSelection(");
    expect(adminPortal).toContain("dbQuery,");
    expect(adminPortal).toContain('await client.query("commit")');
    expect(adminPortal).toContain('await client.query("rollback").catch(() => {})');
  });


  it("keeps company onboarding requests and memberships idempotent", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926195500_harden_company_onboarding_request_uniqueness.sql"),
      "utf8",
    );

    expect(adminPortal).toContain("on conflict (portal_customer_id, company_id)");
    expect(adminPortal).toContain("on conflict (portal_customer_id)");
    expect(adminPortal).toContain("where status in ('pending', 'submitted', 'in_review')");
    expect(adminPortal).toContain("on conflict (customer_id) where customer_id is not null");
    expect(migration).toContain("portal_company_requests_one_active_per_customer_idx");
  });


  it("backfills legacy vendors without forcing verified vendors through onboarding again", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926201000_backfill_legacy_vendor_onboarding_profile.sql"),
      "utf8",
    );

    expect(migration).toContain("'incomplete'");
    expect(migration).toContain("not exists");
    expect(migration).toContain("verification_status = 'VERIFIED'");
    expect(migration).toContain("in ('verified', 'approved')");
    expect(migration).toContain("profile_status = 'active'");
  });


  it("aligns suppliers already linked to verified vendors", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926202500_align_verified_vendor_suppliers.sql"),
      "utf8",
    );

    expect(migration).toContain("registration_status = 'approved'");
    expect(migration).toContain("is_verified = true");
    expect(migration).toContain("onboarding_completed_at = coalesce");
    expect(migration).toContain("vp.supplier_id = s.id");
  });


  it("prevents onboarding from changing the registered account role", () => {
    const adminPortal = readFileSync(join(process.cwd(), "server/admin-portal.mjs"), "utf8");
    const onboarding = readFileSync(join(process.cwd(), "src/pages/onboarding.tsx"), "utf8");

    expect(adminPortal).toContain("Tipe akun tidak dapat diubah melalui onboarding");
    expect(adminPortal).toContain("accountType !== ctx.user.role");
    expect(onboarding).toContain("registeredRole");
    expect(onboarding).toContain("disabled={registeredRole !== null && value !== registeredRole}");
    expect(onboarding).toContain("Tipe akun mengikuti pilihan saat pendaftaran");
  });


  it("rate-limits direct signup and constrains supported account roles", () => {
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926204000_harden_portal_customer_roles.sql"),
      "utf8",
    );

    expect(auth).toContain("signup:ip:");
    expect(auth).toContain("signup:email:");
    expect(auth).toContain("signup:phone:");
    expect(migration).toContain("portal_customers_role_check");
    expect(migration).toContain("'customer','vendor','driver','employee','admin'");
  });


  it("bounds in-memory authentication rate limiter state", () => {
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");

    expect(auth).toContain("function pruneExpiredRateBuckets");
    expect(auth).toContain("rateBuckets.size > 10000");
    expect(auth).toContain("rateLimitOperations % 250 === 0");
    expect(auth).toContain("rateBuckets.delete(oldestKey)");
  });


  it("enforces normalized email and phone uniqueness at the database boundary", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926211500_harden_portal_account_identity_uniqueness.sql"),
      "utf8",
    );

    expect(migration).toContain("portal_customers_email_normalized_unique_idx");
    expect(migration).toContain("portal_customers_phone_normalized_unique_idx");
    expect(migration).toContain("lower(trim(email))");
    expect(migration).toContain("regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')");
  });


  it("makes account registration atomic across password, Email OTP, WhatsApp, and Google", () => {
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");

    expect(auth).toContain('import { pool, query } from "./db.mjs"');
    expect(auth).toContain("async function withTransaction(work)");
    expect(auth).toContain('await client.query("begin")');
    expect(auth).toContain('await client.query("commit")');
    expect(auth).toContain('await client.query("rollback").catch(() => {})');
    expect(auth).toContain("const user = await withTransaction(async (dbQuery) =>");
    expect(auth).toContain("const created = await withTransaction(async (dbQuery) =>");
    expect(auth).toContain("const user = await withTransaction(\n      (dbQuery) => googleResolveUser");
    expect(auth).toContain("on conflict do nothing");
    expect(auth).toContain('findUserByPhone(phone, dbQuery)');
    expect(auth).toContain('linkIdentity(createdUser.id, "whatsapp", phone, dbQuery)');
  });


  it("provides rate-limited password login and token-based password recovery", () => {
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926213000_portal_password_reset_tokens.sql"),
      "utf8",
    );

    expect(auth).toContain("handlePasswordLogin");
    expect(auth).toContain("password-login:ip:");
    expect(auth).toContain("handleForgotPassword");
    expect(auth).toContain("handleResetPasswordWithToken");
    expect(auth).toContain("portal_password_reset_tokens");
    expect(auth).toContain("randomBytes(32)");
    expect(auth).toContain("Link berlaku selama 30 menit");
    expect(server).toContain("/api/portal/auth/forgot-password");
    expect(server).toContain("/api/portal/auth/reset-password-with-token");
    expect(migration).toContain("revoke all on table public.portal_password_reset_tokens from anon, authenticated");
  });


  it("revokes previously issued portal sessions after password reset", () => {
    const session = readFileSync(join(process.cwd(), "server/session.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926214500_portal_auth_version.sql"),
      "utf8",
    );

    expect(session).toContain("av: Number(user.auth_version ?? 0)");
    expect(session).toContain("authVersion: Number(data.av ?? 0)");
    expect(server).toContain("auth_version");
    expect(server).toContain("session.authVersion");
    expect(auth).toContain("auth_version = auth_version + 1");
    expect(auth).toContain("delete from public.trusted_devices");
    expect(migration).toContain("auth_version integer not null default 0");
  });


  it("isolates Customer Portal Fonnte credential ownership", () => {
    const auth = readFileSync(join(process.cwd(), "server/auth-providers.mjs"), "utf8");
    const whatsapp = readFileSync(join(process.cwd(), "server/whatsapp-service.mjs"), "utf8");
    const server = readFileSync(join(process.cwd(), "server/index.mjs"), "utf8");
    const fonnteConfig = readFileSync(join(process.cwd(), "server/fonnte-config.mjs"), "utf8");
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260926223000_isolate_customer_portal_fonnte_token.sql"),
      "utf8",
    );

    for (const source of [auth, whatsapp, server, fonnteConfig]) {
      expect(source).not.toContain("process.env.FONNTE_TOKEN");
    }
    expect(fonnteConfig).toContain("CUSTOMER_PORTAL_FONNTE_TOKEN");
    expect(migration).toContain("'CUSTOMER_PORTAL_FONNTE_TOKEN'");
  });

  it("gates Hostinger builds with release contracts and exposes commercial certification", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    const certification = readFileSync(
      join(process.cwd(), "scripts/portal-commercial-certification.mjs"),
      "utf8",
    );

    expect(pkg.scripts["build:portal"]).toContain("verify:release-contracts");
    expect(pkg.scripts["verify:release-contracts"]).toContain("production-runtime-lifecycle.test.ts");
    expect(pkg.scripts["verify:release-contracts"]).toContain("google-auth.test.ts");
    expect(pkg.scripts["verify:release-contracts"]).toContain("customer-portal-standalone-boundary.test.ts");
    expect(pkg.scripts["test:portal:commercial-certification"]).toContain("portal-commercial-certification.mjs");
    expect(certification).toContain('status: "PASS"');
    expect(certification).toContain("/api/portal/auth/forgot-password");
    expect(certification).toContain("/api/portal/auth/reset-password-with-token");
  });

});
