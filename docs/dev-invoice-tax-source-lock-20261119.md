# Customer Invoice CST-DEV: lock original tax source through COMMIT

**Source-only candidate**, child of Customer Portal Draft PR #230.
**NO-GO** for active financial posting. No PROD or hosted CST-DEV mutations.

## Problem and PostgreSQL permission requirement

The existing signed Owner review binds customer, subtotal, PPN,
tax rate, account mapping and gross total. The original Invoice
handler locks the source document FOR UPDATE and rereads financial
source inside the SAME dedicated company RLS transaction. Another
tax editor could still change public.accounting_settings or
public.accounting_taxes between that read and Invoice COMMIT.

A network-disconnected PostgreSQL16 experiment confirmed that a role
holding only SELECT privileges cannot use SELECT FOR SHARE, SELECT
FOR KEY SHARE or LOCK TABLE SHARE MODE. The writer cannot obtain
strong row locks without additional narrow, controlled privilege.

## Proposed minimal CST-DEV policy (NOT applied)

Source DDL: scripts/dev-invoice-tax-source-lock-20261119.sql

- GRANT UPDATE(updated_at) on accounting_settings to both invoice roles.
- GRANT UPDATE(created_at) on accounting_taxes to both invoice roles.
- Four company-restricted RESTRICTIVE UPDATE RLS policies with a
  session-user equality and company=1 or company=3, WITH CHECK(false).

The original company-specific SELECT/ALL RLS policies stay in place.
These two column-level UPDATE grants satisfy row-lock eligibility.
The RESTRICTIVE WITH CHECK(false) policies prevent actual mutations,
even of the granted timestamp columns. No LOGIN, BYPASSRLS, secret,
password, UPDATE on tax rate/account, or general service role.

Original Invoice writes still use the existing CanonicalPostingEngine.
The feature adds no second pool, tax calculation or customer dispatch.

## DEV code guard

server/dev-invoice-tax-source-rowlock.mjs requires the original DEV
financial/signed-review flags PLUS one new default-OFF flag:
CUSTOMER_PORTAL_INVOICE_TAX_SOURCE_ROWLOCK_DEV=true.

The existing handler first locks the canonical Invoice row FOR UPDATE,
then on the SAME client locks the original company accounting_settings
and accounting_taxes rows FOR SHARE in a fixed order. It re-reads and
compares the exact owner-approved source digest BEFORE any Invoice,
GL, PPN, AR, audit or outbox mutation. Locks live until COMMIT.
Unconfigured policy fails with 503; source mismatch fails with 409.

## Actual isolated PASS evidence

Disposable postgres:16-alpine container with Docker --network none:

- CST and Diva company-specific settings/tax SELECT FOR SHARE: PASS.
- Cross-company RLS: denied in both directions.
- Attempted writes to newly granted timestamp columns: denied.
- Concurrent tax-rate editor UPDATE blocks while Invoice FOR SHARE
  is held, then can proceed only after Invoice COMMIT.
- Concurrent Diva default-tax-setting editor UPDATE blocks similarly.
- Test script: scripts/tests/dev-invoice-tax-source-lock.qa.sh
- Test container self-removes after the run; no live DB access.

Unit/handler tests cover feature-OFF, source-lock query order on
the original client, and failure before any financial journal write.
Full exact-head CI / build / TypeScript must still complete.

## Explicit release and rollback boundary

No source SQL should run on hosted CST-DEV or PROD during these tests.
Future deployment needs a reviewed PG17 isolated rehearsal of this
SQL with the current RLS layout, credential custody and rollback plan.
The rollback SQL is separately supplied at
scripts/dev-invoice-tax-source-lock-rollback-20261119.sql.

During any controlled rollback: turn the affected Invoice flags OFF,
ensure relevant Invoice transactions are drained, revert only B6
policies/grants, and verify original RLS and privilege state.

Remaining hard blockers: no authorized separate staff issuer mapping
for CST/Diva, no invoice-ready document in hosted CST-DEV, handoff
ticket state is only single-process, and no genuine hosted financial
OTP-to-original-GL/PPN/AR/audit/outbox COMMIT/replay/rollback E2E.
No automatic privileges, financial fixtures or PROD changes.
