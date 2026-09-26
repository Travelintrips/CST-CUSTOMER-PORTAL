# Commercial Operations Runbook

## Scope
This runbook covers production operation of CST Customer Portal at `https://cstlogistic.co.id`.

## Runtime monitoring
The application records a lightweight runtime health check every 5 minutes and a public production probe every 15 minutes in `public.portal_operational_checks`.

The runtime health check verifies:
- database connectivity;
- presence of critical portal tables;
- Google, Email OTP, and password authentication capability;
- WhatsApp queue backlog/stuck rows;
- PostgreSQL pool pressure.

The public production probe verifies:
- `/api/healthz`;
- `/api/readyz`;
- `/api/portal/auth/capabilities`.

Operational history is retained for 30 days.

## Admin diagnostics
Authenticated admins can call:

- `GET /api/portal/admin/operations/health`
- `POST /api/portal/admin/operations/health` with `{"action":"runtime-check"}`
- `POST /api/portal/admin/operations/health` with `{"action":"public-probe"}`
- `POST /api/portal/admin/operations/health` with `{"action":"recovery-drill"}`

The endpoint never returns credential values.

## Recovery rehearsal
A recovery drill is due every 7 days. Each running production instance checks every 6 hours whether a drill is due.

The drill:
1. begins a database transaction;
2. writes a synthetic recovery row;
3. reads and updates it;
4. rolls the transaction back;
5. verifies that no synthetic row remains;
6. records the result in `public.portal_recovery_drill_runs`.

This is a transactional recovery rehearsal. It validates application/database rollback behavior, but it is not a substitute for a full managed-backup/PITR restore exercise.

## Backup / restore operations
A full managed backup restore must be exercised separately using the Supabase backup/PITR facilities available to the production project. The restore exercise should be performed into an isolated recovery target, never directly over production.

Minimum evidence for a full restore exercise:
- backup timestamp / restore point;
- isolated target identifier;
- schema migration level;
- critical row-count checks;
- authentication and onboarding smoke tests;
- payment and marketplace read-only checks;
- measured RPO and RTO;
- cleanup/retirement of the isolated target.

## Release verification
Hostinger build intentionally remains on the deterministic build path:
- server syntax;
- translation validation;
- SEO contract;
- Vite build;
- prerender;
- Hostinger bundle preparation.

Broader release tests remain separate from the deployment-critical build path:
- `pnpm test:release-full`
- `pnpm test:portal:commercial-certification`

GitHub workflow `Commercial Operations Monitor` performs hourly public checks whenever GitHub-hosted Actions are available.

## Incident thresholds
Treat these as operational incidents:
- `/api/readyz` non-200 for more than 5 minutes;
- database pool `waiting > 0` repeatedly;
- WhatsApp queue `stuckOver10m > 0`;
- any required auth capability unavailable;
- recovery drill status `failed`;
- repeated HTTP 5xx after a release.

## Release checklist
Before marking a release commercially ready:
1. Hostinger build/deploy completed.
2. Production release marker matches intended commit.
3. `/api/healthz` = 200.
4. `/api/readyz` = 200 and database connected.
5. Google, Email OTP, and password capabilities are true.
6. No persistent database pool waiters.
7. WhatsApp queue has no stuck actionable rows.
8. Latest recovery rehearsal passed.
9. No unresolved P0/P1 production issue.
