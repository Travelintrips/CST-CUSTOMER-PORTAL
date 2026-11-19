# Customer Invoice DEV — do not broadcast newly issued Invoice to unrelated Portal admins

## Source-only security correction

Original generic `notifyAdmins()` chooses every active `portal_customers`
row with `role='admin'`, regardless of Invoice company. It is used by
marketplace and payment workflows and is intentionally left unchanged
when no explicit recipient list is provided.

Hosted CST-DEV read-only aggregate audit on 19 Nov 2026:
- Two active Portal Admin records.
- Neither has an explicit active `portal_company_members` row for CST/Diva.
- Only one matches a canonical global Owner/Super Admin identity.
Thus delivering an Invoice event to every Portal Admin would include a
recipient without established company authority. The existing B4
notification RLS permits active admins, so RLS by itself is not a
sufficient company-recipient filter.

Only the `sales_invoice_issued` call from the original `mark_invoiced`
action now passes `explicitAdminIds: [user.id]`, through the original
notification-service API. The `user` was already company-authorized on
the original direct RLS writer transaction and passed the one signed
Owner approval before Invoice posting. No company lookup, new email
read privileges, actor promotion or second notification writer was added.

Other callers of generic `notifyAdmins` are left byte-compatible,
including Marketplace, customer payment and admin payment events.
Those **payment notifications have not yet been remapped to a canonical
company-authorized recipient list**, so they remain a distinct
operational release review gate. Do not claim they are fixed by this PR.

## Verified

- Unit test preserves original generic broadcast behavior for legacy
  callers and verifies the explicit issuer-only call does not enumerate
  all Portal Admins (5/5 dedicated notification-service tests PASS).
- Actual original notification-service source is now exercised during
  the disposable PostgreSQL16 combined E2E with 122 exact RLS policies
  and current column grants, instead of a notification no-op mock.
- Synthetic Portal Admin 504 is deliberately unassigned to either
  company. Original CST and Diva Owner-issued Invoice → GL/PPN/AR/audit/
  outbox/Portal inbox COMMIT and replay PASS. The previously authorized
  issuer (Admin 501) receives the event, while unassigned Admin 504
  receives **none**. Diva-only Admin 503 does not receive CST Invoice.
- No new database GRANT/RLS/policy, no outbound email/WhatsApp
  delivery, no Invoice on hosted CST-DEV or PROD.

## Release

Keep this and parent PR233 Draft and all active finance flags OFF.
Role writers still NOLOGIN and 2 missing audit-column grants / B6
policy candidate are unapplied to hosted CST-DEV. Real hosted OTP
email/HTTPS and financial end-to-end are not yet tested.
