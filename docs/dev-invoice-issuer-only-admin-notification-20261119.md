# CST-DEV Customer Invoice — scoped Admin notification after signed Owner issuance

**State:** source-only child of Customer Portal Draft PR #231. No active DEV/PROD
release, no SQL migration, no new role/login, no original Accounting engine change.

## Security finding based on read-only hosted CST-DEV audit

There are two active Portal Admin identities, neither has an active
`portal_company_members` assignment for CST (1) or Diva (3), and only one
Portal Admin matches an active globally authorized canonical BizPortal Owner.
Original generic `notifyAdmins` looked up **every** active Portal Admin.
On a disposable PG16 database with 24 exact hosted CST-DEV Portal/notification
RLS policies and two synthetic company Admin accounts, original signed
Invoice issuance notified both Admins for each company. This made unrelated
Admin recipients possible even though original signed Owner posting requires
canonical company-scoped issuer rights.

## Minimal fix for signed-Owner issuance only

- Add optional server-side `recipientIds` to existing `notifyAdmins`.
  When supplied, it validates positive integer IDs and queries only active
  Admins whose IDs are in that explicit list. Empty or invalid lists fail
  closed and MUST NOT fall back to all Admins.
- Original Admin notification calls across Marketplace, RFQ, Vendor Portal
  and non-financial flows do not supply this option: their existing code
  and behavior remain unchanged.
- Under the currently OFF financial Invoice atomic DEV + signed BizPortal
  Owner flags only, `billing-operations.mark_invoiced` passes the original
  authenticated and canonically company-authorized **Portal issuer ID**
  as the recipient. The actual Owner-signed Ed25519 proof and original
  company writer transaction must still pass before this point.
- Recipient must also remain an active Portal Admin under the existing
  company-scoped writer's RLS. No email joins, cross-company membership
  privilege, broad grant, new notification service or extra approval.
- Original `notification-service.mjs` implementation is executed in QA;
  outward WhatsApp/email is never sent. Notifications are inserted into
  original `portal_customer_notifications` inside the same transaction.

## Tests and scope

- Four isolated route/service tests cover explicit verified recipient,
  malformed recipient fail-closed, duplicate recipient de-duplication,
  and preservation of legacy generic all-admin behavior.
- Exact original Portal + BizPortal signed Owner synthetic HTTP + original
  `CanonicalPostingEngine` on disposable PG16, using a read-only snapshot
  of actual CST-DEV 22-table column grants plus reviewed B6 tax lock
  and two audit-column rights. All 24 actual Portal/notification RLS
  policies were cloned from read-only `pg_policies` into the disposable DB.
- Original GL/PPN/AR/audit/outbox COMMIT, replay/rollback, and exactly
  one persisted recipient notification (the original authorized issuer)
  PASS separately for CST and Diva, with no foreign Admin notification.
- Original account/RLS and signed-OTP code is still a **synthetic QA**
  environment; real email OTP/HTTPS and hosted credential custody are
  NOT included.

## Deliberately remaining release issue

Payment-submission/payment-status notification helpers still use the
legacy all-admin fan-out; this PR changes **only financially posted Invoice
issuance with a verified Portal issuer**, preserving other PASS workflows.
Do NOT claim all Customer Portal financial notifications are company
isolated until payment routes have a distinct authorized recipient policy
and independent end-to-end tests.

No hosted CST-DEV or PROD financial flags were enabled. Writer roles stay
NOLOGIN and the default B6/audit permissions remain unapplied. No
existing Invoice or journal was modified. Keep candidate Draft / NO-GO.
