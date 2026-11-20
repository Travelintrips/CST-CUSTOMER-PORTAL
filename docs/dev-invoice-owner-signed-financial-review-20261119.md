# CST-DEV Customer Invoice — ringkasan Owner bertanda tangan (sumber asli)

Status: **SOURCE / CI CANDIDATE ONLY**, child Draft PR #229 paired with
official BizPortal Draft PR #154. No hosted CST-DEV financial activation, no
PROD changes or reimplementation of original Accounting.

## The Owner sees original persisted values

The original public.sales_documents company/ID, document number, customer,
total_amount, tax_amount, grand_total, invoiceable status, and tax_treatment
are paired with company-owned accounting_settings and the active
accounting_taxes row selected by original tax_rate_id or its canonical
company default. Tax company, account and active status must match.
total_amount + tax_amount = grand_total is verified in integer cents; any
null, unexpected decimal precision or inconsistent mapping fails closed.

The immutable review object shows canonical source, NOT a recalculated
estimate: company, document, customer, original subtotal, PPN nominal and
rate, total, tax source ID and output account. A strict JSON serialization
of that canonical object is SHA-256 digested.

The original Customer Portal HMAC challenge (90 seconds) includes **only
this digest**, not customer PII or monetary amounts. The 80-second random
handoff ticket is SHA-256-indexed in temporary one-process memory.
BizPortal uses its authenticated Owner OTP session, fetches the source
summary from the exact configured Portal origin using the short-lived
ticket, checks fetched digest against the HMAC challenge digest and
renders HTML-escaped money, customer and tax fields before offering
explicit **Setujui satu kali**.

When Owner approves, the original Ed25519 proof signs the full challenge
including digest. The original Portal mark_invoiced handler, after
selecting Invoice FOR UPDATE and authenticating company-scoped writer,
re-reads source/tax mapping through the SAME transaction/client.
It compares digest against HMAC challenge before any Invoice status,
journal, AR, audit or outbox mutation. Source changes force a controlled
409 and rollback, not silent approval of modified amounts.

## Flags — only when coherent and explicitly enabled on DEV

Portal:
- APP_ENV=development
- CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true
- CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true
- CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true
- CUSTOMER_PORTAL_INVOICE_CROSS_DEVICE_HANDOFF_DEV=true
- CUSTOMER_PORTAL_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV=true

BizPortal:
- Existing signed OTP DEV, BIZPORTAL_CUSTOMER_INVOICE_ATTEST_DEV=true
- BIZPORTAL_CUSTOMER_INVOICE_HANDOFF_DEV=true
- BIZPORTAL_CUSTOMER_INVOICE_SIGNED_REVIEW_SNAPSHOT_DEV=true
- Exact pinned Portal origin; Login cookie remains on BizPortal

All flags OFF in the active runtime. No secrets or credentials included
in review source, GitHub files, or URL. Owner's authenticated BizPortal
session never crosses to Customer Portal.

## Explicit NO-GO remaining

1. No genuine hosted E2E: no signed Owner OTP session over actual HTTPS
   to original CanonicalPostingEngine with journal/PPN/AR/audit/outbox
   same-transaction COMMIT, replay and rollback.
2. No active staff issuer mapping between Portal and BizPortal for CST/Diva
   in the last read-only audit. Never grant rights silently.
3. No new invoice-ready documents in hosted CST-DEV. Last read-only
   check showed 25 historic invoiced CST, zero to_invoice in CST/Diva.
   Never mutate historic ledger or create unauthorized financial fixtures.
4. One-process handoff loses pending tickets on restart. Only one disposable
   instance until an authoritative scoped store and one-use atomic consumption
   are validated.
5. Tax mapping is rechecked before mutation, but concurrent tax config
   change after check and before COMMIT is not yet row-locked. Reviewed
   lock strategy and race QA remain release gates where concurrent edits exist.
6. No PR merge or deployment, no Invoice writer LOGIN enabled, no AR source
   actor enabled, no financial flags opened, no PROD changes.

This is **code/contract PASS only**, not actual financial publishing PASS.
