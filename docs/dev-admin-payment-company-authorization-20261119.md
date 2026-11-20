# DEV Customer Portal — Admin payment status scoped to canonical company authority

**Source-only, Draft. No hosted CST-DEV/PROD payment or financial writes.**

## Critical defect found

`GET /api/portal/admin/payments` previously listed payment records for
every company to anyone with generic Portal Admin access. Likewise,
`POST /api/portal/admin/payments/:id/status` selected a payment by ID
and changed payment + Invoice amount_paid without checking the active
BizPortal/Portal company authorization of the initiating Admin.
The original replay shortcut could even return a 200 for an existing
`paid` payment from another company before checking its Invoice.

The previous PR #235 already confined *notifications* to authorized
recipients. That did not authorize the payment mutation itself.

## Minimal existing-role correction

New internal `authorizedAdminPaymentCompanies` matches signed Portal Admin
`id/email/role` against live `public.portal_customers` and canonical
`public.users` on normalized email, status active and is_active=true.
The original PostgreSQL transaction locks both rows FOR SHARE to guard
against concurrent identity removal. It requires a UNIQUE current user
mapping and allows:

- canonical `super_admin` with matching `system_role='super_admin'`,
  global or exact company1/CST or company3/Diva; or
- active ordinary BizPortal Admin for exact company1 or 3 **and** a
  single active `portal_company_members` row for this Portal Admin,
  also locked FOR SHARE.

Generic Portal Admins, company-less staff, duplicate mappings and users
without active membership are refused with HTTP 403. No extra Owner
approval or OTP is added for ordinary company-authorized Admin payments.

Admin payment listing now runs within the same read transaction,
filters by the canonical set of permitted company IDs, joins the
original Invoice source, and suppresses mismatched payment.company_id.
Changes to payment status now load and lock both payment and Invoice,
validate the authorization **BEFORE the replay branch**, and block
out-of-company or mismatched payments and non-issued invoices BEFORE
any UPDATE or notification. The original Payment transition rules,
amount/partial payment calculations, AR source trigger, notification
service, idempotency and Accounting code remain in use.

## Evidence

- Actual Portal source Vitest `src/portal-admin-payment-company-scope.test.ts`:
  **17/17 PASS**: global Owner CST+Diva, staff-in-Diva only, foreign-company
  denials, no membership, unmapped/duplicate canonical user, invalid
  Owner system role, already-paid cross-company replay denied, authorized
  replay idempotent, mismatched company, unissued invoice and filtered GET.
- Original Portal `handleAdminPayments()` tested against a disposable
  PostgreSQL16 through the actual bundled Portal source + original BizPortal
  `CanonicalPostingEngine`, with 122 original CST-DEV RLS policy definitions,
  real writer column/sequence privileges, corrected B6 tax locks,
  signed Owner synthetic OTP and original AR trigger.
- CST and Diva synthetic paid-payment status changes **PASS**:
  Rp40 paid on an original Rp111 Invoice produces sales_documents partial
  payment and original AR projection paid=40, outstanding=71.
  Payment replay remains exactly-once; Admin from a different company
  cannot update or replay another company's payment. Unassigned
  Portal Admin cannot list or update either company's payments.
- Existing internal company-scoped payment notification routing stays
  correct; no real bank connection or settlement was used in this test.

## Limitations / release gate

These tests run PostgreSQL16 in an ephemeral, localhost-only container;
the test uses synthetic paid Payment records and synthetic OTP Owner
session, not production bank proof or a genuine User OTP email.
Actual hosted CST-DEV remains unchanged, writer roles NOLOGIN, finance
flags OFF and there are zero new to_invoice documents.
The original Customer Portal DEV/PROD payment and bank integration
may have additional accounting requirements not proven by this test;
do not claim live bank reconciliation or cash-journal posting PASS.

Maintain Draft PR and do not merge/deploy or touch PROD before the
Owner-authenticated hosted DEV release gate completes.
