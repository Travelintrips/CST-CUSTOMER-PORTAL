# Issue #238 — PostgreSQL-side CST-DEV Invoice relock (review only)

**STATUS: SOURCE / ISOLATED PG17 QA PASS. HOSTED INSTALLATION NO-GO.**
This folder is documentation, **not** an automatic migration. Never execute these statements against PROD or through an unauthorized role/credential channel.

## Why this exists

The previous VPS systemd watchdog is already staged and source-tested, but the actual encrypted DBA credential and installed relock units are absent. CST-DEV's existing Invoice writer is `NOLOGIN` with an old SCRAM verifier retained, and 0 active sessions. Running the original watchdog when disarmed would delete that retained verifier. The `idle_session_timeout`, `idle_in_transaction_session_timeout` and `transaction_timeout` settings are 0, and the original password `VALID UNTIL` does not terminate already-running sessions.

This **alternative** uses one private database lease/SQL function and a future approved Supabase `pg_cron` job inside CST-DEV. It needs no new external KMS or VPS service credentials for its timer, but it **still requires DBA authorization** and does not replace the separate legitimate writer/Owner authorization.

## Reviewed scope

- **CST-DEV project ref**: `xssrfshdrtdfupgqwfdw`, PostgreSQL 17, database `postgres`.
- **Only role subject to relock**: `bizportal_customer_invoice_cst_writer_dev`.
- **Diva**: `bizportal_customer_invoice_diva_writer_dev` is checked and never modified.
- **Private schema only**: `cst_invoice_relock_dev`; no Data API exposure, no anonymous execution grants.
- `docs/review-only/issue238-postgres17-relock.sql` creates a **disarmed** lease, a private audit table and an exact-role, SECURITY DEFINER relock function owned by `postgres`. It does **not** install an extension, schedule a job, grant `LOGIN`, clear the existing SCRAM verifier at install time, send notifications or issue Invoice #108.
- The function preserves the retained SCRAM verifier when CST is already `NOLOGIN`, there are no CST sessions and no lease is armed. An expired, malformed, overlong or missing lease **cannot keep a LOGIN role open**; the function revokes CST access, clears its password, terminates existing CST sessions, and records a private audit entry.
- The function and a future separately approved finite lease/activation transaction use the same transaction advisory lock `(20261120, 238)` to coordinate changes.

## Tests run on 22 Nov 2026 WIB

Executed using a disposable PostgreSQL 17 Alpine Docker instance on the authorized DEV VPS with Docker **network=none**. Only synthetic passwords were used; the exact candidate SQL was executed on the disposable DB, **not on hosted Supabase**.

1. SQL syntax, private-schema initialization and a simulated non-superuser administrative role with CREATEROLE, writer ADMIN OPTION and usable `pg_signal_backend` privileges: PASS.
2. Initially disarmed CST writer `NOLOGIN` retains its already-existing SCRAM verifier: PASS.
3. Correct finite lease permits monitoring without any role mutation: PASS.
4. Expired lease revokes `LOGIN`, clears SCRAM verifier, terminates a preexisting live `pg_sleep` session, rejects subsequent logins and logs the event: PASS.
5. Missing lease when CST is `LOGIN` forces relock: PASS.
6. Lease longer than five minutes forces relock: PASS.
7. A session not authenticated as `postgres` cannot call the signing-independent relock function: PASS.
8. Diva remains unchanged and locked: PASS.

A first QA run found that a non-inheriting mock operator could not terminate sessions despite `pg_signal_backend` membership; it correctly **FAILED**. CST-DEV read-only checks then proved that the real `postgres` has `pg_signal_backend` **USAGE** as well as membership. The disposable QA operator's inheritance was adjusted to match the real privileges and the complete test reran **PASS (exit code 0)**. No elevated privilege was granted in CST-DEV.

Exact QA script remains on the restricted DEV VPS:
`/opt/cst-invoice-dev-stage-20261120/issue238-watchdog-qa/ISSUE238-PGCRON-RELOCK-ISOLATED-PG17-QA.sh`.

## Follow-up review correction (source-only; untested against PG17)

The review identified that PostgreSQL 17 `pg_terminate_backend(pid)` with its default zero timeout only confirms delivery of SIGTERM, not process exit. The draft SQL was revised to use a bounded 2000 ms per-backend acknowledgement, recheck remaining CST writer sessions, and return `CST_RELOCK_INCOMPLETE` when termination is not confirmed. This path records an `RELOCK_INCOMPLETE_...` audit reason instead of declaring `CST_RELOCK_EXECUTED`. It deliberately avoids a new exception on that incomplete-termination branch, which could roll back the role revocation within the same transaction.

**This correction has not passed the original isolated PostgreSQL 17 integration QA or a real scheduler test.** Previous isolated QA results refer to the prior SQL revision and must not be presented as proof for the changed revision. The 2000 ms per-session delay can accumulate across many sessions; review bounded work/cron overlap, transaction rollback on unhandled SQL errors, and controlled partial-termination/crash tests before approval. Confirm a scheduler run that reports `CST_RELOCK_INCOMPLETE` triggers monitoring and follow-up; a successful SQL job exit is not itself proof that the security objective was met.

### Missing / foreign lease fail-closed correction

Review found that the first SQL candidate replaced a missing/foreign lease with a synthetic `armed=false` record and set `v_invalid_control=true`, but the credential-preservation branch did **not** inspect `v_invalid_control`. An already-`NOLOGIN` writer with zero sessions could therefore retain its SCRAM verifier despite a missing or foreign lease, contrary to the documented fail-closed policy. The review-only SQL now requires `NOT v_invalid_control` before preserving credentials.

Acceptance tests for this changed revision must distinguish: (a) genuine explicit disarmed lease + `NOLOGIN` + zero sessions preserves the verifier, (b) missing lease with retained verifier clears it, (c) foreign lease clears it, and (d) expired/overlong lease with active session still relocks and terminates. **These tests have not been executed against PostgreSQL 17 for the revised commit.**

## Real pg_cron scheduler and crash/restart proof — 22 Nov 2026 WIB

A separate networkless Docker QA image was built from the **official pg_cron source tag v1.6.4** on PostgreSQL 17 (the extension's SQL schema reports `extversion=1.6`, which is expected for this upstream source tag). The original build initially failed because the official Postgres image lacks `clang-21`; rebuilding with `make with_llvm=no` succeeded without changing any hosted database.

New reproducible sources in this PR:
- `docs/review-only/Dockerfile.issue238-pgcron164-qa` — QA-only image; compiles the extension in a builder stage and copies only the extension to the disposable PostgreSQL runtime.
- `docs/review-only/issue238-pgcron164-scheduler-crash-qa.sh` — uses a Docker `--network none` temporary PostgreSQL17 with real loaded `pg_cron`, schedules a **5-second job** against the exact review-only SQL function, and destroys the container on exit.

**Real scheduler results:** First job runs were logged in `cron.job_run_details`. With CST already NOLOGIN the cron tick retained its old synthetic SCRAM verifier. Then a short, separately simulated admin lease and an active long-lived synthetic writer session were created. The `pg_cron launcher` process was deliberately terminated and PostgreSQL automatically restarted it with a different PID. Without the QA runner invoking the relock function itself, the database-side cron job expired the lease, made the writer NOLOGIN, cleared its synthetic password, terminated the active connection, denied subsequent logins, left Diva NOLOGIN, and continued subsequent idempotent polls with a single relock audit event. **Full process exit code 0.**

These tests prove **the actual extension** works on a disposable networkless PostgreSQL17 process including deliberate scheduler process termination. They do NOT prove actual Supabase Cron deployment, privilege parity for its cron job owner, a failed database primary, regional downtime, or any hosted financial action.

## Not yet tested / release blockers

The actual hosted Supabase project currently has `pg_cron` **available but NOT installed**. The disposable PostgreSQL image did not contain the cron extension, so the **scheduler's actual interval, ownership, continuous execution, restart recovery and disconnection behavior have NOT been proven**. PostgreSQL timeout defaults are not an absolute watchdog.

Before any role activation, an **authorized DBA** must review the SQL and approve installation using the officially selected project; verify that the function is owned/called by `postgres`, install/enable `pg_cron` if approved, schedule a distinct job (e.g. 10 seconds), inspect `cron.job_run_details` and test a real controlled active-session expiry **independent of VPS availability**. Be aware that a scheduled job of the same name overwrites an existing job. No `cron.schedule` call has been made.

Then authorize a bounded CST-only writer credential, one genuine Super Admin signed Owner approval, and the canonical original PostingEngine's Invoice #108 GL/PPN/AR/audit/outbox E2E; immediately verify relock, replay guards, Diva isolation and no PROD changes. **The SQL candidate is not authorization to activate any role.**

References: https://supabase.com/docs/guides/cron/quickstart , https://www.postgresql.org/docs/17/runtime-config-client.html

Related issue: https://github.com/Travelintrips/CST-CUSTOMER-PORTAL/issues/238
