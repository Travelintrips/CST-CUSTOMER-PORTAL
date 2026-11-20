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

## Project IAM isolation — 10/10 effective permission checks PASS

The GCP project previously granted **3 existing service accounts** (Replit
Secret, Sport Center, Tenant) unconditional project-wide
`roles/secretmanager.secretAccessor` and granted the Replit Secret account
project-wide `roles/secretmanager.secretVersionAdder`.

On 19 November 2026, the project IAM policy was updated **atomically with
etag checking** to version 3. The three existing readers retain their same
binding members, but an IAM Condition now excludes only the dedicated
Invoice secret's version resources. Replit's VersionAdder binding is also
conditioned to exclude the Invoice secret itself and any descendant.
The Owner binding was not modified; no existing Finance secret or version
was deleted. Previous policies were snapshotted locally for recovery.

The first VersionAdder condition failed an effective-access test. It was
corrected to match the `secretmanager.googleapis.com` service plus the
exact Invoice resource-name prefix, then re-tested. **All 10 independent
Google Cloud Policy Troubleshooter checks PASS**:
- Three old SAs can READ existing Finance secret: 3/3 `CAN_ACCESS`.
- All three are denied READ to new Invoice secret: 3/3 `CANNOT_ACCESS`.
- Dedicated Invoice SA can READ Invoice and cannot READ Finance: 2/2 PASS.
- Replit can ADD to the old Finance secret but not to Invoice: 2/2 PASS.

These tests evaluate **actual effective IAM policy**, not just the policy
text. The dedicated Invoice secret still has **0 versions**; no secret
payload or PostgreSQL password was accessed or created.

## Keyless GitHub OIDC proof — PASS, separate from VPS runtime

Reused the existing active `fleet-dev-github` Google Workload Identity
Pool **without changing Fleet's original provider**. Added an independent
provider `customer-invoice-dev-oidc` scoped by immutable GitHub repository
ID `1369747600`, the exact PR222 DEV branch, one probe workflow path, and
the `push` event. The dedicated keyless Invoice reader SA has
`roles/iam.workloadIdentityUser` on a repository-ID principal set only.

Created `.github/workflows/dev-invoice-keyless-secret-probe.yml` (no
secret payload reads and no credential file). **[GitHub Actions run
#44377050185](https://github.com/Travelintrips/CST-CUSTOMER-PORTAL/actions/runs/44377050185)**
SUCCESS at exact commit `0ac0dd35dc5e47373a6ae64df3522d49a8ecddb1`.
Real GitHub OIDC exchanged for a **temporary** GCP service-account token.
The actual Secret Manager `testIamPermissions` endpoint confirmed
`secretmanager.versions.access` for Invoice, denied
`secretmanager.versions.add`, and denied Finance secret privileges:
`WIF_KEYLESS_INVOICE_ONLY_PERMISSIONS_PASS`.

**This proves short-lived GitHub Actions authentication only.** It does
NOT give the long-running Hostinger VPS process automatically renewable
Google credentials. The existing source-only helper still requires an
explicit dedicated bootstrap credential input; no private key was
generated or deployed. A reviewed keyless runtime/credential-delivery
path remains required before writing real database passwords.

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

1. **COMPLETE:** GCP IAM inheritance is restricted and 10/10 effective tests PASS; keyless GitHub OIDC CI access proof PASS. Design a **separate renewable runtime credential delivery** for the long-lived VPS without any unmanaged SA private key.
2. Only after runtime custody is approved, securely generate the two independent CST/Diva writer credentials and put them in the Invoice-only secret, without exposing them in logs, repository commits, or chat.
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

Current result: **project IAM isolation and keyless GitHub CI authentication PASS**, but the Invoice secret has 0 versions and **long-running VPS runtime access / real signed HTTP Invoice E2E have not been proven**.
