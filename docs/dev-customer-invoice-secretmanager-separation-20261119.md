# Customer Invoice DEV — dedicated Secret Manager custody gate

Status: **source-only candidate; no credential version, writer LOGIN or active Invoice release**.
Checked 19 November 2026 WIB. This is a child of
[Customer Portal PR221](https://github.com/Travelintrips/CST-CUSTOMER-PORTAL/pull/221)
and [BizPortal Issue149](https://github.com/bizportal/bizportal-app/issues/149).

## Existing GCP project and resources, independently verified

- Approved DEV GCP project: `secret-504012` (resource number `653506647312`).
- Existing Finance-only secret `bizportal-marketplace-finance-dev-companies`
  has two enabled versions; untouched. Existing CST/Diva Finance reader credentials
  **must never be reused or promoted to Invoice writer**.
- New dedicated Invoice-only secret:
  `bizportal-customer-invoice-writers-dev-companies`,
  under `projects/653506647312`, replication automatic, labels
  `environment=development`, `service=customer-invoice`, `stage=dormant`.
  **0 versions**, no password or DSN payload uploaded.
- New service account:
  `bizportal-invoice-dev-reader@secret-504012.iam.gserviceaccount.com`.
  Has `roles/secretmanager.secretAccessor` on **the Invoice secret resource
  only**, not through a new project-level binding. Its user-managed key count is
  **0**.

## Unresolved IAM isolation issue — STOP for credential creation

A read-only project IAM inspection found **3 existing service account
principals** with `roles/secretmanager.secretAccessor` at the
`secret-504012` **project level**. Those permissions are inherited by
new secrets regardless of the per-secret binding shown in the secret IAM policy.
One project-level `roles/secretmanager.secretVersionAdder` is also present
from older Finance setup; it was not changed by this task.

**Therefore per-secret IAM alone is not proof of isolation.** Do not upload a
Customer Invoice writer password/DSN, add a new user-managed service-account
key, enable either PostgreSQL writer role, or activate Customer Portal financial
flags until the inherited access has been reviewed and restricted using a
change that does **not** interrupt existing Finance, Payroll or other secrets.

Do not revoke project-wide bindings without auditing their existing consumers;
that would risk unrelated DEV/PROD operations. Do not move this credential
into the shared Finance secret as a workaround.

## Existing code and optional DEV-only integration

Existing B4 company writers on Supabase **CST-DEV**
`xssrfshdrtdfupgqwfdw` remain `NOLOGIN/NOINHERIT/NOBYPASSRLS`;
AR actor rows are `enabled=false`; all five financial flags OFF.
The original CanonicalPostingEngine, tax/AR/audit/outbox and
independently approved company request/review workflow are unchanged.

The source-only helper `server/dev-customer-invoice-writer-secret.mjs`
uses the already installed `@google-cloud/secret-manager` dependency.
It accepts a **dedicated** bootstrap identity only from
`CUSTOMER_PORTAL_INVOICE_GCP_BOOTSTRAP_JSON_DEV`, and only with
`APP_ENV=NODE_ENV=development` and all three atomic/AR/Super Admin flags true.
It checks the exact numeric GCP secret resource path, IAM reader email,
GCP project ID and payload shape. Secrets are returned in memory only, never
logged to stdout, committed to git, or substituted with broad Finance DSNs.

Expected future payload shape, with placeholders only:
```json
{
  "APP_ENV": "development",
  "SUPABASE_PROJECT_REF": "xssrfshdrtdfupgqwfdw",
  "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV": "<dedicated company 1 pooler 5432 TLS verify-full DSN>",
  "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV": "<dedicated company 3 pooler 5432 TLS verify-full DSN>"
}
```
The real values must be generated/installed through an approved credential
custody channel, not in chat, PR comments, logs, or shell command-line args.
The original scoped-client parser rejects wrong project, role, company,
TLS mode, database or port and never falls back on a Secret Manager failure.

## Required separate release gates

1. Audit/remediate inherited project-level Secret Manager permissions without
   breaking existing Finance readers, and verify one authorized Invoice secret
   consumer with a suitable runtime identity — no new unmanaged private key.
2. Store two truly independent CST/Diva writer secrets through that approved
   channel and test the versions with **no user-visible password disclosure**.
3. Only then permit direct Supabase role LOGIN and enable matching AR actor
   rules on CST-DEV, with reversible rollback and `CURRENT_USER=SESSION_USER`
   / `NOBYPASSRLS` / per-company cross-denial evidence.
4. Obtain genuine independent Portal Admin company approval through the
   **existing** reviewed request workflow, not manual SQL self-approval.
5. Test signed Portal Admin + BizPortal OTP Super Admin over real DEV HTTPS,
   one atomic original Invoice → GL → 11% PPN → AR → audit/outbox COMMIT,
   replay, deliberate error ROLLBACK, and external send disabled.
6. Run exact-head GitHub CI and an isolated DEV release gate before any PROD
   change. The finance writer/PROD cutover requires separate acceptance.

Current result is **Secret Manager metadata + non-credential source
integration prepared**, not a live Invoice E2E PASS.
