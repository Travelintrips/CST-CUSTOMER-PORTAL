# DEV Marketplace single-writer action bridge (staged, OFF by default)

The existing Customer Portal is the **canonical writer** for Marketplace RFQ/vendor/PO business transitions. BizPortal remains a separate application and only initiates signed, whitelisted commands after verifying its own Supabase OTP admin session. BizPortal must never implement a second copy of Marketplace mutation SQL.

## Scope (DEV ONLY)

Accepted canonical actions are limited to:

- POST `/api/mkt/admin/rfqs/:id/approve-and-invite`
- POST `/api/mkt/admin/rfqs/:id/send-to-customer`
- POST `/api/mkt/admin/purchase-orders/:id/{issue,production,ready-to-ship,in-transit,delivered,complete,close}`

Other paths fail closed. The `invite-vendor` UI route is **not silently remapped** to approve-and-invite because they may have different business semantics. Quotation comparison, payment approvals, invoice generation and financial posting are outside this bridge.

## Security properties

1. Public Ed25519 verification key is pinned in `server/bizportal-action-bridge.mjs`; private key is never committed or returned to a browser. The keypair was created securely on the authorized VPS; the private key remains root-only at `/etc/cst-customer-portal-dev/bizportal-bridge/signing-private.pem`.
2. Signed request covers timestamp (±120s), UUID request ID and SHA-256 of the *exact raw body*. Only signed admin actor identities are accepted, and the Customer Portal rechecks that actor against `public.users`, including admin role and active status.
3. Canonical resource must belong to legacy CST-DEV scope (`company_id IS NULL`). Never infer that these historical fixtures belong to PT CST or a selected business tenant.
4. Customer Portal invokes its pre-existing Marketplace handler with a fixed, active DEV service admin. Every request records its originating BizPortal identity, path and fingerprint in `portal_bridge_private.marketplace_action_receipts` (RLS enabled, no grants to public, anon, authenticated, AI Core or Marketplace reader).
5. A unique request ID is inserted before invoking the canonical handler. Replays return the recorded result; a still-processing receipt returns HTTP 409. Crashed processing receipts require human investigation, never blind replay.
6. Never forward BizPortal user cookies, OAuth tokens, Supabase service-role keys, or raw database credentials.
7. Bridge is explicitly disabled unless **both** applications are in approved DEV mode and have their individual feature flags enabled. Production route is not enabled.

## Staging and activation

Current state: **both bridge flags OFF**, and no Hostinger signing secret installed.

- Customer Portal runtime: `PORTAL_BIZPORTAL_BRIDGE_ENABLED=true` only after deployment, Nginx routing and both services' tests pass.
- Existing DEV Nginx host: `https://portaldev.72.61.210.205.sslip.io`. For the one exact location `/api/internal/bizportal-marketplace/action`, permit HTTPS requests without the site's general Basic Auth only after verifying that the application rejects unsigned requests. Restrict POST, set a tight body limit and preserve rate limits. All other URL paths stay Basic-Auth-protected.
- Hostinger DEV Node.js app must receive three **secret-managed** variables: `BIZPORTAL_MARKETPLACE_BRIDGE_ENABLED_DEV=true`, `BIZPORTAL_MARKETPLACE_BRIDGE_URL_DEV=https://portaldev.72.61.210.205.sslip.io/api/internal/bizportal-marketplace/action` and `BIZPORTAL_MARKETPLACE_BRIDGE_PRIVATE_KEY_B64_DEV` (base64 PEM private Ed25519 key from approved secret transfer). Do not put the private key in GitHub, app build logs, screenshots or chat.
- Separate Marketplace read isolation is independent: `BIZPORTAL_MARKETPLACE_DATABASE_URL_DEV` and `BIZPORTAL_MARKETPLACE_DEDICATED_READER_ENABLED=true`, staged in earlier PR #149. Never change BizPortal's global `SUPABASE_DATABASE_URL_DEV`, Payroll/Accounting database connections or AI Core credentials.

## Go/no-go tests

1. Full CI PASS for both repos and release gates.
2. Customer Portal DEV authenticated user actions unchanged; unsigned/stale/forged bridge request rejected and no DB writes; signed request with inactive user rejected.
3. Signed BizPortal DEV admin request reaches canonical Customer Portal exactly once; duplicate request ID returns the same response, one RFQ/PO transition and one notification event. Clear only specifically created synthetic DEV fixtures after completion.
4. Verify source-and-destination database project IDs are `xssrfshdrtdfupgqwfdw`; do not touch PROD (`nzdweipzckfszczzqtuw`).
5. Verify Invoice/AP/GL lifecycle independently: PO approval must not auto-create or post invoices unless an approved invoice and accounting handoff contract is separately proved. **Invoice is not PASS based on this bridge.**
6. Verify Payroll/Accounting CI, PROD health and Customer Portal readiness are unchanged.

## Rollback

Turn **OFF** `BIZPORTAL_MARKETPLACE_BRIDGE_ENABLED_DEV` first and restart only Hostinger DEV; then turn OFF `PORTAL_BIZPORTAL_BRIDGE_ENABLED` on Customer Portal DEV if needed. Existing Customer Portal admin flow and BizPortal read-only RFQ/PO routes remain functional. Never revert historical posted journals automatically.

This is a staged integration with secure activation prerequisites, not a permission to enable PROD writes.
