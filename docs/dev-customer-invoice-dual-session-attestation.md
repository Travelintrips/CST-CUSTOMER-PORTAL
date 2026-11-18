# Customer Invoice DEV — independent dual-session authorization

Status: Draft/source-only, all feature flags OFF, no active deployment or PROD changes.

## Original logins reused (no new login or password)

Customer Portal's existing signed admin JWT is necessary but not sufficient
for financial posting. The canonical BizPortal user also must have a currently
active global super_admin role AND system_role. Merely matching the same email
is not independent proof of a BizPortal login.

During a separately enabled DEV frontend build, the original Customer Billing
button opens a popup from the user's click. The Portal then requests a signed
90-second Invoice challenge scoped to that Portal admin ID/email, Invoice ID,
company 1 or 3, and random nonce. The popup navigates to the original
BizPortal origin. BizPortal's existing SameSite=Lax signed session cookie is
sent only to BizPortal, which validates its original signed session and DB role.

BizPortal signs an Ed25519 assertion scoped to the exact challenge digest,
canonical actor ID/email, Invoice ID/company, nonce, fixed audience and <=60s
validity. The popup sends this proof only via postMessage to a configured,
exact Portal origin, never in a URL or cross-app cookie. Portal verifies the
exact popup message origin/source/challenge, its own HMAC challenge, BizPortal's
Ed25519 public key, two actor identities, time window and company. The original
mark_invoiced handler rejects absent/invalid proof before calling the original
Accounting owner, including on replay. It never accepts a client-supplied
financial writer.

BizPortal's proof key derives from the existing session secret using
domain-separated HKDF. Portal receives ONLY the public SPKI DER verifier key.
Neither app receives the other's password or session cookie.

## Required explicit DEV flags (all currently OFF)

Existing Portal API:
- CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV
- CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV

New Portal API:
- CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV
- CUSTOMER_PORTAL_BIZPORTAL_ATTEST_SPKI_DEV (reviewed public key only)
- CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV (exact BizPortal HTTPS origin)

New frontend DEV build:
- VITE_CUSTOMER_PORTAL_BIZPORTAL_ATTEST_DEV

BizPortal API:
- BIZPORTAL_SIGNED_PASSWORD_ENABLED_DEV and existing pinned Super Admin
- BIZPORTAL_CUSTOMER_INVOICE_ATTEST_DEV
- BIZPORTAL_CUSTOMER_PORTAL_ORIGIN_DEV (exact Portal HTTPS origin)

Existing strict outbox scheduling stays separately controlled by
CUSTOMER_PORTAL_OUTBOX_SAFE_CONSUME_DEV. APP_ENV must be development.
A localhost HTTP origin is allowed only for isolated QA.

## Evidence, 18 Nov 2026 WIB

Real isolated PostgreSQL 17 with the original BizPortal password auth HTTP
route, original signed Super Admin cookie, new BizPortal attestation endpoint
and actual Portal HMAC+Ed25519 verifier: 8/8 HTTP/crypto checkpoints PASS,
exit code 0. Tested a correct independent proof, wrong cookie, wrong invoice,
wrong company, different Portal user, changed signature and role downgrade.
No real customer data was copied; no email or WhatsApp sent; QA user was
deleted. CI includes dedicated negative proofs, time/expiry/public key checks,
browser popup origin/source tests, and default-OFF regression.

Prior separate PG17 QA established durable, balanced Invoice -> original GL ->
AR -> audit/outbox COMMIT and restart/replay for company1 and company3,
but WITHOUT new dual-session proof. These are complementary tests, not proof
that the final combined browser/financial lifecycle is already deployable.

## Mandatory release gates

- Combined independent proof -> original Invoice HTTP -> original GL/AR ->
  audit/outbox COMMIT -> restart/replay -> strict worker on the latest candidate.
- Verify browser popup behavior with actual DEV hostnames and cookie/CSP/COOP.
- Fix and test positive-PPN atomic posting. Diva currently has a default
  sales-tax mapping that does not belong to company3. Do not guess 11%/12%.
- Maintain original feature-OFF behavior and strict tenant isolation.
- Do NOT merge, activate on active DEV, or release to PROD until these pass.
