# Customer Invoice DEV: company-bound database posting authority

**Status: NO-GO for active financial writes. Source-only Draft, 18 Nov 2026.**

## Actual CST-DEV role inventory (read-only)

The existing Customer Portal PostgreSQL connection uses BYPASSRLS. Although
RLS is enabled on Invoice, journal, lines, AR, tax, audit and outbox, it does
NOT run for that session. HTTP and company checks alone cannot be presented
as proof of database-enforced tenant isolation.

The two existing Finance login roles (bizportal_finance_cst_login_dev for
company 1 and bizportal_finance_diva_login_dev for company 3) are LOGIN,
NOBYPASSRLS, NOINHERIT and have matching company-bound policies requiring
CURRENT_USER=SESSION_USER. They currently have primarily SELECT rights on
source Invoice, journal, lines, AR, COA and settings; they do NOT have the
INSERT/UPDATE privileges for a complete original Accounting posting. Neither
can the current Portal connection SET ROLE to these login roles. The
accounting_taxes, gl_tax_lines, audit_accounting_events, financial_events and
users tables have no equivalent company-writer permission path for these roles.

## New mandatory fail-closed DEV-only gate

File server/dev-customer-invoice-tenant-db-session.mjs is now called by the
existing billing-operations.mjs before *any* atomic Invoice issuance or
replay writes. It interrogates the SAME caller-owned PG transaction and
requires the exact CST or Diva LOGIN/SUPERVISOR session identity, equal
CURRENT_USER and SESSION_USER, no superuser/BYPASSRLS, and active RLS on
users, source Invoice, GL, lines, AR, tax, audit and outbox. Wrong company,
missing or impersonated session, disabled RLS, and metadata SQL failure
return controlled HTTP503 and rollback. There is no bypass flag, no extra
pool, no new writer, and no PROD behavior change. Feature-OFF stays legacy.

This preflight is necessary but **not sufficient**: SELECT/INSERT/UPDATE
and trigger behavior under the same independently authenticated company
login must still be certified on actual DEV PostgreSQL.

## Isolated PostgreSQL 17.12 evidence (no real data)

- 34/34 direct-login tenant-RLS checks PASS in a completely isolated
  local PostgreSQL17 container, synthetic tables and data.
- CST could see, lock and change only company1 invoices, and Diva only
  company3; wrong-company locks/updates/journals/taxes were rejected.
- Only sales_invoice draft journals could be inserted; status promotion to
  posted, same-company lines, tax reporting, audit and outbox succeeded.
  Vendor-source journals, posted-line mutation, journal ref changes and
  deletes were denied. SET ROLE impersonation from a different SESSION_USER
  returned zero company-scoped rows.
- 7/7 additional direct-login Super Admin row-lock checks PASS. The
  original SELECT FOR SHARE cannot work with SELECT-only privilege;
  a minimal UPDATE(status) column grant together with a narrow RLS
  UPDATE USING and WITH CHECK(false) allowed the lock while actual
  mutation of the user row remained blocked. **This is an isolated
  security experiment, NOT approval to grant UPDATE on active users.**
- Real application candidate regression tests for this guard and original
  Invoice/AR transaction: 87/87 PASS on a fresh frozen-dependency checkout.
  Existing owner/Accounting/feature-OFF code was not rebuilt or replaced.

## Remaining strict release gates

1. Reviewed exact Super Admin row-lock authorization, including role-revocation
   races, without allowing tenant writers to modify any users.
2. Narrow company/source/status/column-level permissions for original
   draft-to-posted GL + line INSERT, company/tax COA reads, sequences,
   original immutable journal/period triggers and materialized AR.
3. Exact-source policies for PPN reporting, Accounting audit and invoice
   outbox, plus separate consumer worker permissions.
4. Existing Portal activity_logs and customer/admin notifications must retain
   same-transaction integrity without granting cross-company writing.
5. Real Supabase DEV negative CST-to-Diva role tests and rollback/COMMIT
   after reviewed permissions; no general permission or security-definer
   shortcut, no credential borrowed from Customer Portal.
6. Independent signed BizPortal session popup on actual DEV HTTPS runtime.
7. Diva company3 default tax still points to CST company1 and requires
   approved invoice-specific tax treatment before PPN activation.

**No changes to Supabase DEV role/grant, data, migration, credential, signer,
dispatch, active application, Nginx or PROD were performed.**
