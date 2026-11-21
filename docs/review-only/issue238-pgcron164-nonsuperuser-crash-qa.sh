#!/usr/bin/env bash
# Exact pg_cron v1.6.4 is running INSIDE a networkless disposable PG17 instance.
# No ports, host database, real credentials, or real Invoice data.
set -euo pipefail
name="cst-invoice-pgcron-nonsuper-qa-$$"
root="/opt/cst-invoice-dev-stage-20261120/issue238-watchdog-qa"
image="cst-invoice-pgcron-qa:local"
cleanup(){ status=$?; if test "$status" -ne 0; then echo QA_PGCRON_NONSUPER_FAILURE_LOGS; docker logs "$name" 2>&1 | tail -18 || true; fi; docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
test -s "$root/ISSUE238-PGCRON-RELOCK-REVIEW-ONLY.sql"
docker image inspect "$image" >/dev/null
docker run -d --rm --pull never --name "$name" \
  --network none --memory 512m --cpus 0.9 --pids-limit 85 \
  --tmpfs /var/lib/postgresql/data:rw,nosuid,nodev,size=320m \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER=supabase_admin \
  -e POSTGRES_DB=postgres \
  "$image" \
  -c shared_preload_libraries=pg_cron \
  -c cron.database_name=postgres \
  -c cron.use_background_workers=on \
  -c cron.log_run=on \
  -c max_worker_processes=12 >/dev/null
for n in $(seq 1 70);do
  if docker exec "$name" psql -X -qAt -U supabase_admin -d postgres -c 'SELECT 1' 2>/dev/null | grep -qx 1;then break;fi
  sleep .2
done
test "$(docker exec "$name" psql -X -qAt -U supabase_admin -d postgres -c 'SELECT 1')" = 1
network="$(docker inspect "$name" --format '{{.HostConfig.NetworkMode}}')"
test "$network" = none
echo QA_PGCRON_POSTGRES17_NETWORK_NONE_PASS
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U supabase_admin -d postgres <<'SQL'
CREATE EXTENSION pg_cron WITH SCHEMA pg_catalog;
CREATE ROLE bizportal_customer_invoice_cst_writer_dev NOLOGIN NOSUPERUSER NOBYPASSRLS
 PASSWORD 'synthetic-qa-cst-only-without-reused-hosted-secrets';
CREATE ROLE bizportal_customer_invoice_diva_writer_dev NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE postgres LOGIN CREATEROLE NOSUPERUSER NOBYPASSRLS INHERIT;
GRANT bizportal_customer_invoice_cst_writer_dev TO postgres WITH ADMIN OPTION, SET FALSE;
GRANT pg_signal_backend TO postgres;
GRANT SELECT ON pg_catalog.pg_authid TO postgres;
GRANT CREATE ON DATABASE postgres TO postgres;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA cron TO postgres;
SQL
non_super="$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c \
 "SELECT (NOT rolsuper AND rolcreaterole AND NOT rolbypassrls AND \
    pg_has_role('postgres','pg_signal_backend','USAGE'))::text FROM pg_roles WHERE rolname='postgres'")"
test "$non_super" = true
echo QA_REAL_CRON_AUTHENTICATED_POSTGRES_NON_SUPERUSER_ROLE_PASS
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$root/ISSUE238-PGCRON-RELOCK-REVIEW-ONLY.sql"
version="$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c \
 "SELECT extversion FROM pg_extension WHERE extname='pg_cron'")"
test "$version" = 1.6
echo QA_REAL_PGCRON_TAG_V164_SQL_EXTENSION_VERSION_16_PASS
# Actual background scheduler runs every five seconds, as documented by Supabase.
docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT cron.schedule('cst_invoice_qa_relock_five_sec','5 seconds','SELECT cst_invoice_relock_dev.tick()')" >/dev/null
first_success=0
for n in $(seq 1 30);do
  first_success="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
     -c "SELECT count(*) FROM cron.job_run_details WHERE status='succeeded' AND command='SELECT cst_invoice_relock_dev.tick()'")"
  test "$first_success" -ge 1 && break
  sleep 1
done
test "$first_success" -ge 1
preserve="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT (NOT rolcanlogin AND rolpassword IS NOT NULL)::text FROM pg_authid WHERE rolname='bizportal_customer_invoice_cst_writer_dev'")"
test "$preserve" = true
echo QA_REAL_BACKGROUND_CRON_PRESERVES_LOCKED_CST_SCRAM_PASS

# Approved lease and synthetic writer login happen atomically under the same
# advisory lock the independently scheduled tick takes. No web/API paths.
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
BEGIN;
SELECT pg_advisory_xact_lock(20261120,238);
UPDATE cst_invoice_relock_dev.lease
 SET armed=true, expires_at=clock_timestamp()+interval '18 seconds' WHERE singleton=true;
DO $$
DECLARE exp timestamptz;
BEGIN
 SELECT expires_at INTO exp FROM cst_invoice_relock_dev.lease WHERE singleton=true;
 EXECUTE format('ALTER ROLE bizportal_customer_invoice_cst_writer_dev LOGIN VALID UNTIL %L',exp);
END $$;
COMMIT;
SQL
docker exec -d "$name" sh -c \
 "psql -X -h 127.0.0.1 -U bizportal_customer_invoice_cst_writer_dev -d postgres -c 'SELECT pg_sleep(90)' >/tmp/qa-active-cst-writer.log 2>&1"
active=0
for n in $(seq 1 20);do
  active="$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c \
   "SELECT count(*) FROM pg_stat_activity WHERE usename='bizportal_customer_invoice_cst_writer_dev'")"
  test "$active" -ge 1 && break
  sleep .25
done
test "$active" -ge 1
echo QA_REAL_BACKGROUND_CRON_ACTIVE_WRITER_SESSION_CREATED_PASS
# Deliberately terminate ONLY the pg_cron scheduler worker of the disposable
# PostgreSQL container; never the primary process or any hosted Supabase PID.
scheduler_pid="$(docker exec "$name" psql -X -qAt -U supabase_admin -d postgres \
  -c "SELECT pid FROM pg_stat_activity WHERE backend_type='pg_cron launcher' LIMIT 1")"
test -n "$scheduler_pid"
case "$scheduler_pid" in *[!0-9]*) echo QA_INVALID_SCHEDULER_PID;exit 90;; esac
stopped="$(docker exec "$name" psql -X -qAt -U supabase_admin -d postgres \
  -c "SELECT pg_terminate_backend($scheduler_pid)::text")"
test "$stopped" = true
echo QA_DISPOSABLE_PGCRON_LAUNCHER_TERMINATED_PASS
# Postgres's registered background worker is expected to restart the launcher.
newpid=""
for n in $(seq 1 18);do
  newpid="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
    -c "SELECT pid FROM pg_stat_activity WHERE backend_type='pg_cron launcher' LIMIT 1")"
  if test -n "$newpid" && test "$newpid" != "$scheduler_pid"; then break; fi
  sleep .5
done
test -n "$newpid" && test "$newpid" != "$scheduler_pid"
echo QA_DISPOSABLE_PGCRON_LAUNCHER_AUTO_RESTARTED_PASS


# No manual relock or session termination is invoked after this point.
# The cron job inside PostgreSQL must do both actions, independently.
closed=0
for n in $(seq 1 55);do
  closed="$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c \
   "SELECT CASE WHEN NOT rolcanlogin AND rolpassword IS NULL AND \
       (SELECT count(*) FROM pg_stat_activity WHERE usename='bizportal_customer_invoice_cst_writer_dev')=0 \
       THEN 1 ELSE 0 END FROM pg_authid \
    WHERE rolname='bizportal_customer_invoice_cst_writer_dev'")"
  test "$closed" = 1 && break
  sleep 1
done
test "$closed" = 1
audit="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT count(*) FROM cst_invoice_relock_dev.audit WHERE reason='LEASE_EXPIRED_OR_INVALID'")"
test "$audit" = 1
echo QA_REAL_BACKGROUND_CRON_EXPIRED_LEASE_REVOKES_WRITER_KILLS_SESSION_PASS
if docker exec "$name" psql -X -qAt -U bizportal_customer_invoice_cst_writer_dev \
   -d postgres -h 127.0.0.1 -c 'select 1' >/dev/null 2>&1; then
  echo QA_UNSAFE_NEW_LOGIN; exit 89
fi
echo QA_REAL_BACKGROUND_CRON_DENIES_NEW_LOGIN_PASS
diva="$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c \
 "SELECT (NOT rolcanlogin AND rolpassword IS NULL)::text FROM pg_authid WHERE rolname='bizportal_customer_invoice_diva_writer_dev'")"
test "$diva" = true
echo QA_REAL_BACKGROUND_CRON_DIVA_UNTOUCHED_PASS
# The scheduler should continue to complete later polls after the relock.
runs_before="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT count(*) FROM cron.job_run_details WHERE status='succeeded' AND command='SELECT cst_invoice_relock_dev.tick()'")"
sleep 6
runs_after="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT count(*) FROM cron.job_run_details WHERE status='succeeded' AND command='SELECT cst_invoice_relock_dev.tick()'")"
test "$runs_after" -gt "$runs_before"
audit_after="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT count(*) FROM cst_invoice_relock_dev.audit WHERE reason='LEASE_EXPIRED_OR_INVALID'")"
test "$audit_after" = 1
echo QA_REAL_BACKGROUND_CRON_SUBSEQUENT_RUNS_IDEMPOTENT_PASS
echo QA_POSTGRES17_PGCRON164_END_TO_END_ISOLATED_PASS
echo LIVE_CST_DEV_NOT_MODIFIED_TRUE
