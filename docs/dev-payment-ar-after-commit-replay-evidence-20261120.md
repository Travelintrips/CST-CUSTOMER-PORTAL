# Customer Invoice DEV — verified payment→AR integrity on fresh status and paid replay

**Source-only candidate; not deployed to hosted CST-DEV or PROD.**

## Why

Original `handleAdminPayments` safely checked current canonical company
authorization, Sales Invoice company, amount bounds and payment transition
before mutation, but an already-`paid` replay could still return HTTP200
even when a prior payment and original AR/journal source had diverged.
Similarly, a new `pending→paid` transition did not require proof of the
final deferred original AR projection before acknowledging COMMIT.

## Minimal DEV-only, default-OFF extension

Reuse existing flags, with NO additional Owner OTP, table, GRANT or writer:

- `APP_ENV=development`
- `CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true`
- `CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true`

Only when all are satisfied, `requirePostedPaymentArConsistency()`
operates on the SAME original Admin Payment PostgreSQL transaction:

1. Flush the existing, named and reviewed deferred Customer AR constraint
   triggers (`customer_ar_journal_source_dev`,
   `customer_ar_journal_lines_dev`, `customer_ar_sales_source_dev`).
2. Read original posted source evidence from
   `public.bizportal_customer_ar_source_evidence_dev`, never a synthetic
   caller-supplied invoice receipt.
3. Read the original AR subledger joined to the posted, not reversed,
   not voided `accounting_entries` source for the exact company/invoice,
   and validate its canonical `bizportal:customer-ar-source:v1` provenance.
4. Compare money in integer cents: exact gross, paid sum across original
   `public.payments` status `paid`, original `sales_documents.amount_paid`,
   `payment_status`, AR paid/outstanding and original posted journal.
5. Any mismatch blocks a *new* status update before COMMIT and returns
   a controlled 422 with the entire Payment/Invoice/notification change
   rolled back. An already-`paid` replay with stale/missing evidence
   is also denied instead of being falsely reported as successful.

The flag-OFF handler and all active PROD behavior are unchanged.
Credit/bank cash GL remains owned by existing BizPortal Finance, and
this source neither creates nor asserts a bank settlement posting.

## Tests run on VPS source

- `src/portal-admin-payment-company-scope.test.ts`: **26/26 PASS**
  (9 additional fail-closed/replay cases), including missing original
  source, no AR, wrong paid sum, bad AR outstanding, missing posted journal,
  no production activation, signed replay with no double-mutation.
- Full Customer Portal regression suite, TypeScript, critical deployment
  contracts and frontend build: PASS (exact head further CI required).
- Disposable PG16 test uses actual original `CanonicalPostingEngine`,
  Portal Admin `handleAdminPayments`, signed Owner source, 122 real
  CST-DEV Invoice RLS policies, real company writer column grants,
  reviewed B6 tax source locks and original deferred AR projection.
- CST+Diva: successfully updates a synthetic Rp40 payment on a posted
  Rp111 Invoice to `partial`, with original AR paid Rp40/outstanding
  Rp71. Repeated `paid` remains exactly-once.
- Deliberately **disable original AR source trigger** inside a throwaway
  PG16 transaction and attempt to mark a Payment as paid. Original
  handler's financial DEV mode rejects the mismatch with 422 and
  rolls back payment status, Invoice amount and notifications. Restore
  trigger in the disposable database; ordinary path then PASS.
- Deliberately corrupt original `sales_documents.amount_paid` on PG16
  after a settled Payment, leaving original `payments.status='paid'`.
  The original AR projection follows the erroneous document, but
  replay verifies paid-sum mismatch and refuses a false 200. Restoring
  source and AR makes legitimate replay PASS with no double update.
- The original 11% / 12% PPN and cross-company/wrong-OTP cases continue
  to pass. All disposable PostgreSQL containers and temporary bundles
  are removed automatically after QA.

## Still NO-GO operationally

These tests are PG16 + **simulated Owner email-OTP session**, not real
HTTPS/email, bank settlement, live approved Invoice creation or full
hosted CST-DEV financial cutover. On CST-DEV both company writer roles
remain NOLOGIN, finance flags OFF, original bundle is only in QA,
source AR actors disabled and no new `to_invoice` business documents.
Do not merge/deploy or modify financial PROD while those release gates
remain blocked.
