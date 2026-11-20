# CST Customer Invoice DEV — container-private tmpfs credential delivery

19 November 2026 WIB. **Source-only Draft; no live deployment or PROD changes.**
This replaces the earlier proposal to bind a root:node plaintext file from the
VPS host into Docker. The original Portal/Accounting/OTP/Finance features are
**not rebuilt**. Their existing behavior remains unchanged while Invoice flags
stay OFF.

## Security flaw confirmed and corrected

On VPS `srv1792369`, host Unix UID/GID 1000 belong to the running
GitHub Actions runner `githubrunner`. The original Customer Portal Docker
image also uses `node` UID/GID 1000. A host plaintext credential file or
directory with `root:1000` group-read permissions could thus be accessed by
the runner. Docker UID/GID matches are numeric unless user namespace remapping
is configured; there is no remapping here. **Do not bind plaintext Invoice DSNs
from the host using GID 1000.**

PR225's optional Compose override instead uses:

- `user: "21110:21110"` for the Invoice-enabled container **only**, after
  a separate `cstinvoice` user/group is created in the image.
- A container-private anonymous tmpfs at
  `/run/credentials/cst-customer-portal-dev.service`: `rw,nosuid,nodev,
  noexec,size=65536,mode=0700,uid=21110,gid=21110`.
- `CREDENTIALS_DIRECTORY` pointing to that tmpfs.
- **No Docker bind mount or host plaintext credential directory.**

Host UID/GID 21110 are not allocated. The base Dockerfile still ends
with `USER node`, so the original feature-OFF service keeps UID 1000.
Only an explicitly enabled Invoice credential override uses 21110.

## Verified encrypted delivery (no passwords in argv/env/logs)

The root-owned VPS file
`/etc/cst-invoice-dev/transport/invoice-writer-version1.cms`
and its manifest are `root:root 0600). They contain only authenticated CMS
AES-256-GCM ciphertext and metadata. The private decrypt key is also 0600,
root-only, and the public recipient certificate is fingerprint-pinned.

`scripts/dev-invoice-inject-verified-cms.sh` verifies exact publisher SHA
`e46593e15dde5317e9eb53d13d2fef14dd3f70d1`, certified recipient
certificate fingerprint, manifest ciphertext hash and expected Secret Manager
version 1 **without decoding plaintext on host disk**. It decrypts directly
through stdin to `docker exec -i --user 21110:21110`, running
`scripts/dev-invoice-tmpfs-inject.mjs` inside the correct container.

The injector checks exact application UID/GID 21110, kernel tmpfs filesystem
type, realpath/no symlinks, owner/mode on the private directory, full
two-company DEV DSN payload, DB role/company, port 5432, TLS `verify-full`,
and the SHA-256-pinned public Supabase root CA from the image. It writes an
atomic mode 0400 file **inside tmpfs only**. No private key or database DSN
is written to Docker environment variables, GitHub files or host directories.

The original `dev-customer-invoice-systemd-credential.mjs` reader and
direct DB company selector are reused unchanged.

## Release, restart and rollback safety

`scripts/dev-invoice-compose-guard.sh` requires explicit
`CST_INVOICE_DEV_PRIVATE_TMPFS=true` **and** the original Invoice
atomic/posted-AR/independent Super Admin flags ON before it accepts the
optional Compose file. It rejects the old
`CST_INVOICE_DEV_CREDENTIAL_DIRECTORY` host bind setting. Before deployment
the encrypted manifest/private key/certificate must pass root-only checks;
the unique UID must not exist on the host.

The certified deployment script uses one identical Compose file array on
forward and rollback. After Compose creates the container, the root-only
injector delivers the verified credential **before readiness**. If injecting
fails, the deployment is marked failed and proceeds to rollback, with
re-injection attempted for the compatible prior image. A previous certified
image lacking tmpfs/injector/CA compatibility blocks opt-in before merge.

The existing startup wrapper refuses to open HTTP when atomic Invoice is ON
until the private credential becomes valid (bounded grace; then hard-stop).
After Docker restart or host reboot, anonymous tmpfs is wiped; the server
fails closed until re-injection. The deployment timer is an existing
10-minute recovery attempt, **not immediate reboot recovery**. Do not
enable operational Invoice until this recovery procedure is tested and
approved as part of the active-DEV release gate.

## Evidence and limits

- Synthetic ephemeral container QA PASS with UID21110, both scoped DSNs,
  missing/malformed credential denial, exact tmpfs and mode 0400.
- The **host GitHub runner**, tested via `/proc/<containerPid>/root/...`,
  cannot read the container-private credential.
- Real version1 encrypted Invoice bundle was injected and validated in a
  **separate isolated network-disabled Docker QA container**; no PostgreSQL
  connection was made. After that QA container was restarted, the credential
  disappeared and the reader rejected access: PASS.
- Compose base-vs-override diff and fail-closed guard PASS on VPS.
- CanonicalPostingEngine/B1-B4, genuine scoped CST/Diva TLS login canary and
  automatic NOLOGIN/password-null relock remain previously PASS.
- The running Portal release remains `577aa54`; all five Invoice/PPN/AR
  flags OFF; CST/Diva writer roles NOLOGIN and both AR actors disabled.

**Remaining NO-GO:** independent Admin-approved company requests are still
absent. Genuine signed Portal Admin + BizPortal Super Admin OTP on DEV HTTPS
and actual Invoice→original GL/PPN/AR/audit/outbox COMMIT/replay/rollback
have not PASSed. Keep this Draft and PROD untouched.
