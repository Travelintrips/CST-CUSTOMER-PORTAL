# CST Customer Invoice DEV — keyless encrypted credential handoff, Compose and certified-deploy guard

Date: 19 November 2026 WIB. Status: **synthetic QA PASS, source-only candidate**.
Do not merge/deploy from Draft PR until all operational release conditions are met.

## Existing systems reused, no feature rebuild

- Customer Portal DEV Docker Compose remains `compose.dev-vps.yml` and the
  existing `cst-customer-portal-dev-deploy.timer` checks CI-certified releases
  every ten minutes. Its original `scripts/deploy-certified-vps.sh` can
  `--force-recreate` the container on certified release and rollback.
- Portal Admin review, signed BizPortal Super Admin attestation, original
  CanonicalPostingEngine/GL, output PPN, AR, journal events/outbox and
  notification logic are unchanged.
- Finance CST/Diva read-only logins and unrelated Fleet/WA/Payroll services
  are unchanged. No need to stop or reconfigure the WA Gateway runner.

## Verified credential chain

1. GitHub Actions [run #44382113871](https://github.com/Travelintrips/CST-CUSTOMER-PORTAL/actions/runs/44382113871)
   authenticates through the existing GCP Workload Identity Pool but a
   **dedicated Invoice-only OIDC provider** limited by repository ID,
   test branch and exact workflow path; no Google service-account key is issued.
2. The **public-only** VPS certificate in
   `scripts/dev-invoice-envelope-recipient.pem` has approved DER SHA-256
   `38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334`.
   OpenSSL CMS AES-256-GCM encrypts the synthetic QA payload on GitHub.
3. Root on VPS `srv1792369` keeps the corresponding private key in
   `/etc/cst-invoice-dev/transport/invoice-envelope-private.pem`
   (`root:root 0600`), never added to GitHub. Verified workflow SHA,
   cipher hash and certificate fingerprint before decryption in `/run`
   tmpfs. Tampered ciphertext is rejected.
4. The synthetic bundle contains only CST/Diva placeholder DSNs and no real
   password; the verified script
   `scripts/tests/customer-invoice-keyless-envelope-systemd.qa.sh` passes
   it via `systemd LoadCredential` to a transient non-root unit.
5. The code `server/dev-customer-invoice-systemd-credential.mjs`
   validates dedicated `CREDENTIALS_DIRECTORY`, fixed file name, realpaths,
   no symlinks, read-only permissions, exact two-company payload, and
   `APP_ENV=NODE_ENV=development` plus all three Invoice flags.
   The source-only selector refuses fallback to postgres, legacy DSNs or GCP
   bootstrap if systemd credential loading fails. The GCP library is loaded
   lazily so the systemd route works **without** a Google SDK or SA key.
6. A separate network-disabled, read-only Docker QA uses the **exact** active
   `cst-customer-portal-dev:local` image, Node UID/GID 1000, and a root:node
   0440 synthetic credential mount. The live container is not restarted.

## Compose override + deployment protection

The optional file
`ops/dev-invoice-keyless-credentials.compose.override.yml`
adds only this to `customer-portal-dev`:
- `CREDENTIALS_DIRECTORY=/run/credentials/cst-customer-portal-dev.service`;
- one read-only bind mount from explicitly approved
  `CST_INVOICE_DEV_CREDENTIAL_DIRECTORY` to that container path;
- `bind.create_host_path=false`, preventing automatic creation of an empty
  host directory.

The existing certified release script invokes
`scripts/dev-invoice-compose-guard.sh` **before** any merge/build when a
certified release is found. This guard checks the real DEV runtime flag,
requires an explicit directory under `/run` tmpfs, an existing nonsymlink
credential with directory `root:node 0750` and file `root:node 0440`,
and refuses missing/unsafe paths. If atomic Invoice is ON but no credential
path is provided, deployment is blocked. The same `compose_files` array is
used on forward `docker compose up` and image rollback.

**An opt-in is needed to use this override.** Do not set the
`CST_INVOICE_DEV_CREDENTIAL_DIRECTORY` systemd environment variable or
mount on the running Portal until genuine authorization and secret provisioning
are approved. Existing feature-OFF deployment uses the original Compose
unmodified.

The reproducible
`scripts/tests/customer-invoice-compose-credential-override.qa.sh`
runs *only* `docker compose config` with synthetic /run content. It verifies
exactly one read-only mount and environment key; all original ports, health,
resource limits, restart and security metadata stay byte-identical.
It also proves no silent path default, missing or unsafe credential rejection,
and that the deployment plus rollback use the same override.

## GO/NO-GO checklist

**PASS so far:** keyless GitHub permission check, 10/10 effective GCP IAM
access isolation, AES-256-GCM artifact, root-only VPS decrypt, non-root
systemd credential, exact live Docker image read-only mount, scoped client
regression, original disposable PostgreSQL/PPN/AR/accounting acceptance and
guarded B4 rollback.

**Still NO-GO:** the dedicated Invoice Secret Manager resource has **zero
versions**. No privately generated independent CST/Diva PostgreSQL password
is deployed; hosted CST-DEV company writers remain `NOLOGIN`, Invoice AR
source actors `enabled=false`, independently approved Admin/company
records absent, and current Portal financial flags OFF. A one-off GitHub OIDC
artifact proves a transport, **not unattended credential rotation or reboot
recovery**. Stage and renew the approved encrypted credential after each
reboot before activating a long-running application. Do not embed passwords
in Docker environment variables, GitHub artifacts, CLI arguments, or chat.

Then require independent Portal Admin company review and separate signed
BizPortal Super Admin OTP sessions; test one actual DEV Invoice through
unchanged GL, 11% PPN, AR, audit/outbox, replay and ROLLBACK, with WA/email
dispatch disabled. Only after full CI, real HTTP E2E and rollback PASS may
an isolated DEV release be reviewed. PROD remains outside scope.

This runbook and optional Compose override are source-only. The running
Customer Portal release remains `577aa54` until a distinct certified release
is explicitly approved.
