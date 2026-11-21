#!/usr/bin/env bash
# DBA REVIEW ONLY: exact-SHA disposable PG17 lock-expiry regression.
# Never execute against hosted CST-DEV, PROD or a user-supplied database.
# No runtime execution is authorized by simply committing this QA fixture.
set -euo pipefail
: "$ISSUE238_DBA_DISPOSABLE_QA_APPROVED"
test "$ISSUE238_DBA_DISPOSABLE_QA_APPROVED" = YES || { echo QA_CUSTODIAN_APPROVAL_REQUIRED; exit 73; }
: "$ISSUE238_APPROVED_SQL_SHA256"
root="$(cd "$(dirname "$0")" && pwd)"
sql="$root/issue238-postgres17-relock.sql"
test -s "$sql"
actual_sha="$(sha256sum "$sql" | awk '{print $1}')"
test "$actual_sha" = "$ISSUE238_APPROVED_SQL_SHA256" || { echo QA_SOURCE_SHA_MISMATCH; exit 74; }
image="cst-invoice-pgcron-qa:local"
docker image inspect "$image" >/dev/null
name="cst-invoice-pg17-lock-qa-$$"
cleanup() {
  result=$?
  if test "$result" -ne 0; then docker logs "$name" 2>&1 | tail -20 || true; fi
  docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker run -d --rm --pull never --name "$name" --network none \
  --memory 512m --cpus 0.9 --pids-limit 85 \
  --tmpfs /var/lib/postgresql/data:rw,nosuid,nodev,size=320m \
  -e POSTGRES_PASSWORD=synthetic-qa-bootstrap-only \
  -e POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256 \
  -e POSTGRES_HOST_AUTH_METHOD=scram-sha-256 "$image" >/dev/null
ready=0
for n in $(seq 1 70); do
  if test "$(docker exec "$name" psql -X -qAt -U postgres -d postgres -c 'SELECT 1' 2>/dev/null || true)" = 1; then
    ready=1; break
  fi
  sleep .2
done
test "$ready" = 1
# PG17 password expiry applies only to password-based authentication. With
# host trust this fixture could yield a false-positive LOGIN/VALID UNTIL test.
# Enforce SCRAM for every TCP host rule while preserving local socket
# administration only inside the networkless temporary container.
host_auth="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT count(*) FROM pg_hba_file_rules WHERE type LIKE 'host%'
      AND auth_method='scram-sha-256' AND error IS NULL")"
non_scram_hosts="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT count(*) FROM pg_hba_file_rules WHERE type LIKE 'host%'
      AND (auth_method IS DISTINCT FROM 'scram-sha-256' OR error IS NOT NULL)")"
test "$host_auth" -ge 1
test "$non_scram_hosts" -eq 0
echo QA_HOST_SCRAM_ONLY_PASS
test "$(docker inspect "$name" --format '{{.HostConfig.NetworkMode}}')" = none
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
CREATE ROLE bizportal_customer_invoice_cst_writer_dev NOLOGIN NOSUPERUSER NOBYPASSRLS
 PASSWORD 'synthetic-networkless-qa-only';
CREATE ROLE bizportal_customer_invoice_diva_writer_dev NOLOGIN NOSUPERUSER NOBYPASSRLS;
SQL
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres < "$sql"

# Arm a synthetic 12-second lease with a temporary synthetic LOGIN.
docker exec -i "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
BEGIN;
SELECT pg_advisory_xact_lock(20261120,238);
UPDATE cst_invoice_relock_dev.lease
 SET armed=true, expires_at=clock_timestamp()+interval '12 seconds'
 WHERE singleton=true;
DO $$
DECLARE expiry timestamptz;
BEGIN
 SELECT expires_at INTO expiry FROM cst_invoice_relock_dev.lease WHERE singleton=true;
 EXECUTE format('ALTER ROLE bizportal_customer_invoice_cst_writer_dev LOGIN VALID UNTIL %L', expiry);
END $$;
COMMIT;
SQL
# Verify password-based LOGIN before starting the long-lived writer.
if docker exec -e PGPASSWORD=synthetic-incorrect-password "$name" psql -X -qAt \
    -h 127.0.0.1 -U bizportal_customer_invoice_cst_writer_dev \
    -d postgres -c 'SELECT 1' >/dev/null 2>&1; then
  echo QA_BAD_PASSWORD_UNEXPECTEDLY_ACCEPTED; exit 82
fi
authenticated="$(docker exec -e PGPASSWORD=synthetic-networkless-qa-only \
  "$name" psql -X -qAt -h 127.0.0.1 \
  -U bizportal_customer_invoice_cst_writer_dev -d postgres -c 'SELECT current_user')"
test "$authenticated" = bizportal_customer_invoice_cst_writer_dev
echo QA_SYNTHETIC_SCRAM_AUTH_PASS
docker exec -d -e PGPASSWORD=synthetic-networkless-qa-only "$name" sh -c \
 "psql -X -qAt -h 127.0.0.1 -U bizportal_customer_invoice_cst_writer_dev -d postgres -c 'SELECT pg_sleep(90)' >/tmp/qa-writer.log 2>&1"
active=0
for n in $(seq 1 30); do
  active="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
   -c "SELECT count(*) FROM pg_stat_activity WHERE usename='bizportal_customer_invoice_cst_writer_dev'")"
  if test "$active" -gt 0; then break; fi
  sleep .2
done
test "$active" -gt 0
echo QA_SYNTHETIC_ACTIVE_WRITER_PASS

# Hold the shared advisory lock through expiry; start tick while lease is
# valid, so only an AFTER-LOCK clock read can correctly recognize expiry.
docker exec -d "$name" sh -c \
 "psql -X -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c 'BEGIN; SELECT pg_advisory_xact_lock(20261120,238); SELECT pg_sleep(20); COMMIT;' >/tmp/qa-hold.log 2>&1"
held=0
for n in $(seq 1 25); do
  held="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
   -c "SELECT count(*) FROM pg_locks WHERE locktype='advisory' AND granted
     AND classid::text='20261120' AND objid::text='238' AND objsubid=2")"
  if test "$held" -gt 0; then break; fi
  sleep .2
done
test "$held" -gt 0
initially_valid="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT (clock_timestamp()<expires_at)::text FROM cst_invoice_relock_dev.lease WHERE singleton=true")"
test "$initially_valid" = true
docker exec -d "$name" sh -c \
 "psql -X -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c 'SELECT cst_invoice_relock_dev.tick()' >/tmp/qa-tick.log 2>&1"
blocked=0
for n in $(seq 1 25); do
  blocked="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
   -c "SELECT count(*) FROM pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE 'SELECT cst_invoice_relock_dev.tick()%'")"
  if test "$blocked" -gt 0; then break; fi
  sleep .2
done
test "$blocked" -gt 0
echo QA_LOCK_WAIT_CONFIRMED_BEFORE_EXPIRY_PASS
# While the lock is held, let VALID UNTIL expire. LOGIN has not yet been
# revoked by tick, so rejection must come from SCRAM password expiration.
expired=false
for n in $(seq 1 30); do
  expired="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
    -c "SELECT (clock_timestamp()>expires_at)::text
        FROM cst_invoice_relock_dev.lease WHERE singleton=true")"
  if test "$expired" = true; then break; fi
  sleep .5
done
test "$expired" = true
still_open="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
  -c "SELECT rolcanlogin::text FROM pg_roles
      WHERE rolname='bizportal_customer_invoice_cst_writer_dev'")"
test "$still_open" = true
if docker exec -e PGPASSWORD=synthetic-networkless-qa-only "$name" \
    psql -X -qAt -h 127.0.0.1 \
    -U bizportal_customer_invoice_cst_writer_dev -d postgres \
    -c 'SELECT 1' >/dev/null 2>&1; then
  echo QA_EXPIRED_PASSWORD_UNEXPECTEDLY_ACCEPTED; exit 83
fi
echo QA_SCRAM_EXPIRED_PASSWORD_DENIED_WHILE_LOGIN_STILL_OPEN_PASS
finished=0
for n in $(seq 1 40); do
  if docker exec "$name" test -s /tmp/qa-tick.log 2>/dev/null; then
    finished=1; break
  fi
  sleep 1
done
test "$finished" = 1
outcome="$(docker exec "$name" cat /tmp/qa-tick.log)"
test "$outcome" = CST_RELOCK_EXECUTED || { echo "QA_BAD_RELOCK_RESULT=$outcome"; exit 80; }
safe="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT (NOT rolcanlogin AND rolpassword IS NULL AND
  (SELECT count(*) FROM pg_stat_activity WHERE usename='bizportal_customer_invoice_cst_writer_dev')=0)::text
  FROM pg_authid WHERE rolname='bizportal_customer_invoice_cst_writer_dev'")"
test "$safe" = true
# Confirm that the role remains unusable AFTER the tick transaction finishes,
# rather than relying only on a transaction-local session count.
if docker exec -e PGPASSWORD=synthetic-networkless-qa-only "$name" \
    psql -X -qAt -h 127.0.0.1 \
    -U bizportal_customer_invoice_cst_writer_dev -d postgres \
    -c 'SELECT 1' >/dev/null 2>&1; then
  echo QA_UNSAFE_POST_COMMIT_LOGIN; exit 81
fi
echo QA_POST_COMMIT_NEW_WRITER_LOGIN_DENIED_PASS
diva="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT (NOT rolcanlogin AND rolpassword IS NULL)::text FROM pg_authid
  WHERE rolname='bizportal_customer_invoice_diva_writer_dev'")"
test "$diva" = true
audit="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT count(*) FROM cst_invoice_relock_dev.audit WHERE reason='LEASE_EXPIRED_OR_INVALID'")"
test "$audit" = 1
echo QA_LEASE_CLOCK_AFTER_LOCK_AND_SESSION_RELOCK_PASS
echo QA_DIVA_UNCHANGED_PASS

# Even after successful session cleanup, deleting the *control* lease row
# must never produce a false CST_RELOCK_EXECUTED. This negative test remains
# inside the networkless disposable synthetic database.
docker exec "$name" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres \
 -c "DELETE FROM cst_invoice_relock_dev.lease WHERE singleton=true" >/dev/null
missing_outcome="$(docker exec "$name" psql -X -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
 -c 'SELECT cst_invoice_relock_dev.tick()')"
test "$missing_outcome" = CST_RELOCK_INCOMPLETE || {
  echo "QA_MISSING_LEASE_FALSE_SUCCESS=$missing_outcome"; exit 84
}
missing_audit="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT count(*) FROM cst_invoice_relock_dev.audit
      WHERE reason='RELOCK_INCOMPLETE_MISSING_OR_FOREIGN_LEASE'")"
test "$missing_audit" -eq 1
still_locked="$(docker exec "$name" psql -X -qAt -U postgres -d postgres \
 -c "SELECT (NOT rolcanlogin AND rolpassword IS NULL)::text FROM pg_authid
      WHERE rolname='bizportal_customer_invoice_cst_writer_dev'")"
test "$still_locked" = true
echo QA_MISSING_CONTROL_LEASE_REPORTS_INCOMPLETE_PASS
echo HOSTED_CST_DEV_AND_PROD_NOT_MODIFIED
