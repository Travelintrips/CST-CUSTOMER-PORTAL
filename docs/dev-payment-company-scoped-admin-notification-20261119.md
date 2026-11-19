# Customer Portal DEV — payment status notifications scoped by company

**Source-only security correction; hosted CST-DEV and PROD remain unchanged.**

## Existing bug

The original `notifyInvoiceAdmins` calls for `sales_payment_submitted`
and `sales_payment_status_changed` fall through to the generic
`notifyAdmins()`, which selects every active Portal Admin, irrespective
of owning company. An earlier PR #234 already fixed *new Invoice issuance*
by explicitly selecting the authorized issuing Admin, but left payment
notifications intentionally unchanged pending a proper scope audit.

Read-only CST-DEV metadata on 19 November 2026 shows:
- Two active Portal Admins in total.
- Exactly one joined canonical active global/company Owner recipient for
  each of CST(company1) and Diva(company3).
- Zero regular Admin recipients with BOTH valid company-scoped BizPortal
  user AND active Portal company-membership for either company.

## Minimal backward-compatible code

The existing `notifyAdmins()` receives an OPTIONAL `scopeCompanyId`.
For payment events, `notifyInvoiceAdmins()` now passes the original
Invoice `company_id`. A query on current `public.portal_customers` joins
`public.users` on the existing normalized email and selects only:

1. Active Portal Admin + active canonical `super_admin`/`system_role`
   with global or exact matching company scope; OR
2. Active Portal Admin + active `public.users.role='admin'` in the
   exact company AND explicit active `portal_company_members` scope.

This is a recipient *read* only. The original
`portal_customer_notifications` writer, original savepoints, event
deduplication, payment recording, and Accounting posting are unchanged.
Invalid/unknown company, empty authorization, unavailable recipients or
over 32 resolved recipients all fail closed with **no global fallback**.
Failures return false via the existing best-effort notification workflow;
they do not alter payment states or post phantom journals. Monitoring of
missing delivery is a separate operational readiness gate.

For new Invoice issuance PR #234's already-verified explicit issuer
recipient continues taking priority; all non-Invoice callers of
`notifyAdmins` without either optional selector retain the old behavior.

## Evidence

- Targeted notification Vitest **13/13 PASS**, including CST/Diva status
  variants, invalid companies, unavailable company scope, failed lookups,
  33-recipient overflow and no generic Admin fallback.
- Full Customer Portal source unit suite **727/727 PASS** over 61 suites,
  API/frontend TypeScript PASS and production build PASS on an isolated
  candidate on VPS, with only an unreachable loopback synthetic DB DSN.
- An independent synthetic real PostgreSQL16 transaction test combines
  exact original Accounting PR142, signed Owner PR155, latest Portal
  code, actual 122 CST-DEV writer RLS policy definitions, actual
  22-table column grants/nine sequences, and B6 corrected tax locks.
- Original 3-line GL, PPN, AR, audit, outbox and Invoice-issued Portal
  notifications are PASS with replay for CST and Diva. With the real
  Portal notification service, the isolated tests **separately simulate**
  `sales_payment_submitted` and `sales_payment_status_changed` events
  inside the same temporary database transaction as a Portal service
  caller. CST payment Admin recipients are [global Owner #501]; Diva's
  are [global Owner #501, authorized company staff #503]. Unassigned
  active Admin #504 receives **none** for either company. Both event
  keys remain idempotent.

**Important scope:** The payment event test checks original notification
recipient selection and persistence; it does NOT execute a real bank
settlement or the full `handleCustomerPayments` / `handleAdminPayments`
status-update HTTP routes. The QA notifiers use a synthetic Portal
service DB connection; real hosted least-privilege and external delivery
remain unproven.

## Operational release

Keep Draft, no deployment or activation to hosted CST-DEV without
approved Owner email OTP HTTPS E2E with legitimate `to_invoice` source.
Both dedicated hosted company writer roles remain NOLOGIN and the
proposed audit/tax RLS settings unapplied; all live financial flags OFF.
PROD, payment/bank statements, historical journals, WA and Gmail are
not modified.
