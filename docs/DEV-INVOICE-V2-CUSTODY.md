# CST-DEV Invoice #108 — encrypted GCP Version 2 handoff (draft, not activated)

## What this changes

A **manual-only**, DEV-scoped GitHub Actions workflow that fetches the immutable GCP Secret Manager **Version 2** on an ephemeral Actions runner after required human/custody authorization and **wraps the payload only in memory** with the reviewed public recipient certificate. It uploads **only** `.cms` ciphertext and a six-field audit manifest (1-day artifact retention). No database operation, production deployment, password/DSN output, daemon, cron or watchdog.

This is **a draft workflow**, not approval to retrieve a secret. The previous IAM-proof workflow `dev-invoice-keyless-secret-probe.yml` and its existing OIDC provider must remain unchanged. They are restricted to a push on a different branch and cannot authorize this new workflow.

## Verified current GitHub and GCP controls (20 November 2026)
- GitHub Environment `cst-dev-invoice-custody` was **created and verified** with required reviewer `Travelintrips`, custom branch policy permitting **only main**, `can_admins_bypass=false`, and an environment variable `CST_DEV_INVOICE_CUSTODY_ENABLED=blocked`. This **does not** authorize a real secret run.
- Repository `main` has **no classic branch protection and no repository ruleset** on the current read-only inspection. The release-custody workflow must **not** be merged, its blocking variable must not be changed to `approved-reviewed`, and Secret Manager IAM must not be broadened until appropriate main branch review/protection is agreed and verified. Enabling protections affects the entire repository and requires an explicit owner decision.
- The required GCP provider `customer-invoice-dev-custody-v2-oidc` is **absent**, while the older push-only IAM-proof provider remains intact. Do not reuse or widen its condition.
- GitHub Actions dependencies in both custody workflows are pinned to **immutable reviewed commit SHA**, not movable `@v3` / `@v4` tags. The CI must be rechecked after this change.
- No Secret Version 2 payload was read, and no GCP IAM/DB role/PROD changes were made by this repository PR.

## Required actions by authorized repository/GCP administrators before merge or any real run

1. Review the source commit / GitHub protected `main` branch and create the GitHub Environment **`cst-dev-invoice-custody`**, with a required Owner/authorized reviewer, deployment branch restricted to protected **main** only, and environment variable `CST_DEV_INVOICE_CUSTODY_ENABLED=approved-reviewed`. Until this configuration is verified, the workflow must not be promoted to main.
2. Through an approved GCP change, create a new separate OIDC provider (no reuse or broadening of the existing `customer-invoice-dev-oidc` provider):
   `projects/653506647312/locations/global/workloadIdentityPools/fleet-dev-github/providers/customer-invoice-dev-custody-v2-oidc`
   Issuer `https://token.actions.githubusercontent.com`. Attribute mapping: `google.subject=assertion.sub`, `attribute.repository_id=assertion.repository_id`, `attribute.ref=assertion.ref`, `attribute.workflow_ref=assertion.workflow_ref`.
   **Required strict CEL attribute condition** (the administrator must verify every claim):
   ```
   assertion.repository_id=='1369747600' &&
   assertion.repository=='Travelintrips/CST-CUSTOMER-PORTAL' &&
   assertion.ref=='refs/heads/main' &&
   assertion.event_name=='workflow_dispatch' &&
   assertion.environment=='cst-dev-invoice-custody' &&
   assertion.workflow_ref=='Travelintrips/CST-CUSTOMER-PORTAL/.github/workflows/dev-invoice-v2-custody-package.yml@refs/heads/main'
   ```
   Verify that only the intended repo identity can impersonate the existing `bizportal-invoice-dev-reader@secret-504012.iam.gserviceaccount.com` and that its effective Secret Manager access is **only** to `bizportal-customer-invoice-writers-dev-companies`. No new static service-account key, no broad project-wide `roles/secretmanager.secretAccessor`, no permission escalation to Finance/PROD.
3. Obtain an independent security review of GitHub environment/reviewer enforcement, WIF provider CEL claims, service-account IAM and certificate SHA-256 **before** permitting a real run.
4. Merge this isolated PR to `main` via the normal reviewed workflow. Only `workflow_dispatch` from `main` will then be available. At run time supply the exact manual confirmation `APPROVE-ENCRYPTED-CST-DEV-V2`. The GitHub Environment reviewer must explicitly approve the run. Unapproved or misrouted context must fail closed.
5. Download the `cst-dev-invoice-v2-ciphertext-only` artifact (only encrypted CMS + manifest) through the approved private handoff to the VPS custodian. Preserve `root:root 0600`, review source SHA/issuer and ciphertext SHA. The existing staged read-only checker and DEV-only v2 injector are under `/opt/cst-invoice-dev-stage-20261120/issue238-version2-handoff`; do not use the V1 injector.
6. Independently verify true PostgreSQL CST auth and RLS isolation, keep Diva NOLOGIN, run one Owner OTP Invoice #108 hosted E2E with balanced GL/PPN/AR/idempotence; keep finance OFF and CST role NOLOGIN until that release gate. The existing role `VALID UNTIL` is limited to 27 Nov 2026, 23:00 WIB; a later run needs new authorized expiry.

## Security and limitations

- The existing V1 secret is disabled; never retry it, use `latest`, or copy/relabel its CMS.
- The RSA recipient certificate file `scripts/dev-invoice-envelope-recipient.pem` is **public**. Its DER fingerprint must equal `38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334`. **Never commit or transmit the matching private key.**
- The workflow never uploads DSN or password values. Ephemeral runner memory still temporarily holds plaintext; do not claim data never exists in memory. Errors are generalized to prevent accidental leakage.
- The Python helper enforces exact GCP numeric-project Version 2, exact Supabase DEV ref, exactly two scoped company writer DSNs, TLS verify-full root CA, CRC32C integrity, recipient cert fingerprint, immutable source SHA.
- Synthetic fixture is explicitly `qa_only` and rejected by the real V2 release checker. Do not treat synthetic QA as an operational pass.
- Existing `bizportal_customer_invoice_cst_writer_dev` database password match to GCP V2 has not been authenticated. A previously blocked privileged credential provisioning channel must never be circumvented by this GitHub workflow.
- **No automatic transfer to VPS** occurs. It requires an approved custodian and separate encrypted-artifact transfer. Do not put credentials in a GitHub issue, chat, screenshot, file attachment, database SQL Editor, or CI logs.

## Existing source candidate

Issue #238: https://github.com/Travelintrips/CST-CUSTOMER-PORTAL/issues/238

Previously proven staging QA: Customer Portal 753/753, BizPortal focused 24/24, synthetic PostgreSQL original PostingEngine E2E. This proposal does not reimplement accounting or retest prior PASS functionality.