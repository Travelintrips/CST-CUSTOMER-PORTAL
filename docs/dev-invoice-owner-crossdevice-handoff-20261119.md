# Customer Invoice CST-DEV: one Owner OTP handoff from a separate device

**Status:** source-only Draft child of PR #227; NO live DEV or PROD deploy.
No new login, no shared credential, no second Portal Admin reviewer.

## Design and controlled workflow

- Original Portal Admin issuer signs in with their own Portal session. Before
  generating a handoff, Portal confirms a unique active canonical BizPortal
  issuer assignment on the same company as the database-owned Invoice.
- A separate opt-in button requests an existing 90-second HMAC Invoice
  challenge. The Portal creates one 32-byte random ticket (the server stores
  only SHA-256 digest) with an **80-second** lifetime, original issuer ID/email,
  original Invoice/company and challenge.
- The issuer copies one BizPortal origin link to the Owner's own device; the
  original OTP session cookie stays on BizPortal. The Owner explicitly clicks
  **Setujui satu kali**. This returns a signed Ed25519 proof via a restricted
  cross-origin HTML POST form to the original Portal (not a CORS/JSON fetch).
- The Portal verifies signature and original HMAC source/tenant/issuer binding
  before retaining the proof. Only the original signed Portal Admin session
  may retrieve it once. No approval automatically posts an Invoice.
- That same Admin invokes the **existing** Invoice issuance endpoint with
  the proof. Original same-client company RLS, issuer/approver FOR SHARE locks,
  Accounting engine, GL/PPN/AR and audit/outbox remain mandatory.
- Restart or expired ticket discards proof (fail closed). Cross-origin POST is
  accepted solely from exact configured BizPortal origin, without Portal
  cookies and with form content type; all other cross-origin mutations retain
  existing policy. No URL carries the Ed25519 proof or owner session token.

## Opt-in flags (all OFF in active DEV)

Portal runtime:
- CUSTOMER_PORTAL_INVOICE_CROSS_DEVICE_HANDOFF_DEV=true
- CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true
- CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true
- CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true
- CUSTOMER_PORTAL_BIZPORTAL_AUTH_ORIGIN_DEV exact BizPortal origin

Portal optional frontend build:
- VITE_CUSTOMER_PORTAL_BIZPORTAL_ATTEST_DEV=true
- VITE_CUSTOMER_PORTAL_INVOICE_HANDOFF_DEV=true

BizPortal runtime (in addition to existing signed OTP opt-in):
- BIZPORTAL_CUSTOMER_INVOICE_HANDOFF_DEV=true
- BIZPORTAL_CUSTOMER_INVOICE_ATTEST_DEV=true
- BIZPORTAL_CUSTOMER_PORTAL_ORIGIN_DEV exact Portal HTTPS origin

## Evidence / limitations / NO-GO

- Networkless crypto/route contract tests reject forged signer, wrong
  company, wrong issuer, absent approval, tampered/expired/replayed tickets,
  cross-site unknown Origin/cookies, and production mode.
- The in-memory queue is **single-process only**. Restart discards handoffs.
  It is not yet suitable for multi-replica deployments unless a previously
  existing authoritative scoped store with transactional one-time consumption
  is integrated and tested.
- The Owner page currently shows canonical Invoice ID and company, but not
  a trusted immutable amount/customer/tax snapshot. A true finance release
  requires a server-signed invoice summary bound to the exact approval and
  rechecked against the locked financial source before posting. **DO NOT
  ENABLE FOR FINANCIAL USE BEFORE THAT CHECK PASSES.**
- No genuine hosted CST-DEV Owner OTP over separate phones/computers, nor
  original GL/PPN/AR/audit/outbox COMMIT/replay/rollback E2E has passed.
- No new Portal Admin staff issuer alignment exists in hosted CST-DEV for
  company 1 or 3; do not silently promote accounts.
- The narrow new DEV RLS draft in PR #227 is NOT applied to hosted database;
  writer roles remain NOLOGIN and both AR actors disabled.
- PROD is untouched. Keep all PRs Draft; no merge/deploy until the gates above
  PASS on isolated DEV and Owner is ready to perform PROD acceptance.
