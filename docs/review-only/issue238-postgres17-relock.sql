-- REVIEW CANDIDATE — NEVER RUN ON HOSTED CST-DEV FROM CHAT.
-- One database-side relock controller for a short CST Invoice writer lease.
-- Owner/DBA must review project scope, privileges, pg_cron, and loss-of-VPS QA.
-- Intended project: xssrfshdrtdfupgqwfdw (PostgreSQL 17), database postgres.
-- This source installs a DB function & metadata ONLY; it DOES NOT schedule
-- a cron job, arm a lease, enable LOGIN, grant financial permissions, or issue Invoice.
-- Must be executed ONLY on an explicitly approved CST-DEV database connection.

DO $scope$
BEGIN
  IF current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'WRONG_DATABASE_FOR_INVOICE_RELOCK';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_namespace
    WHERE nspname='cst_invoice_relock_dev'
  ) THEN
    RAISE EXCEPTION 'RELOCK_SCHEMA_ALREADY_EXISTS_REVIEW_BEFORE_RETRY';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles
    WHERE rolname='bizportal_customer_invoice_cst_writer_dev'
      AND NOT rolsuper AND NOT rolbypassrls
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles
    WHERE rolname='bizportal_customer_invoice_diva_writer_dev'
      AND NOT rolsuper AND NOT rolbypassrls
  ) THEN
    RAISE EXCEPTION 'CST_DEV_WRITER_ROLES_NOT_AS_EXPECTED';
  END IF;
END $scope$;

CREATE SCHEMA cst_invoice_relock_dev;
REVOKE ALL ON SCHEMA cst_invoice_relock_dev FROM PUBLIC;

CREATE TABLE cst_invoice_relock_dev.lease (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  project_ref text NOT NULL CHECK(project_ref='xssrfshdrtdfupgqwfdw'),
  role_name text NOT NULL CHECK(role_name='bizportal_customer_invoice_cst_writer_dev'),
  armed boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  CHECK (NOT armed OR expires_at IS NOT NULL)
);
REVOKE ALL ON cst_invoice_relock_dev.lease FROM PUBLIC;
INSERT INTO cst_invoice_relock_dev.lease
  (singleton,project_ref,role_name,armed,expires_at)
VALUES
  (true,'xssrfshdrtdfupgqwfdw','bizportal_customer_invoice_cst_writer_dev',false,null);

CREATE TABLE cst_invoice_relock_dev.audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reason text NOT NULL,
  terminated integer NOT NULL DEFAULT 0
);
REVOKE ALL ON cst_invoice_relock_dev.audit FROM PUBLIC;

CREATE FUNCTION cst_invoice_relock_dev.tick() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog
AS $relock$
DECLARE
  v_now timestamptz;
  v_lease record;
  v_cst record;
  v_diva record;
  v_sessions integer := 0;
  v_reason text := 'NONE';
  v_valid boolean := false;
  v_invalid_control boolean := false;
  v_pid integer;
  v_killed integer := 0;
  v_termination_timeouts integer := 0;
  v_termination_errors integer := 0;
  v_remaining integer := 0;
BEGIN
  -- Original cron job should run as the canonical postgres user, not via
  -- anon/authenticated, an invoice transaction writer, a browser, or an API.
  IF session_user <> 'postgres' OR current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'DB_RELOCK_CALLER_OR_DATABASE_REFUSED';
  END IF;

  -- Use exactly the same advisory lock in the separately authorized finite
  -- lease + role-activation transaction to prevent an activation/relock race.
  PERFORM pg_catalog.pg_advisory_xact_lock(20261120,238);
  -- The lease deadline must be evaluated AFTER any lock contention.
  v_now := pg_catalog.clock_timestamp();

  SELECT armed, expires_at, project_ref, role_name INTO v_lease
  FROM cst_invoice_relock_dev.lease WHERE singleton=true FOR UPDATE;
  IF NOT FOUND OR v_lease.project_ref <> 'xssrfshdrtdfupgqwfdw'
    OR v_lease.role_name <> 'bizportal_customer_invoice_cst_writer_dev' THEN
    -- Missing/foreign lease is NOT permission to keep a LOGIN role open.
    v_invalid_control := true;
    SELECT false AS armed, NULL::timestamptz AS expires_at
      INTO v_lease;
  END IF;

  SELECT rolcanlogin,rolsuper,rolbypassrls,rolvaliduntil,
         (rolpassword IS NULL) AS password_null INTO v_cst
  FROM pg_catalog.pg_authid
  WHERE rolname='bizportal_customer_invoice_cst_writer_dev';
  IF NOT FOUND OR v_cst.rolsuper OR v_cst.rolbypassrls THEN
    RAISE EXCEPTION 'CST_WRITER_ROLE_IDENTITY_UNSAFE';
  END IF;
  SELECT rolcanlogin,rolsuper,rolbypassrls INTO v_diva
  FROM pg_catalog.pg_roles
  WHERE rolname='bizportal_customer_invoice_diva_writer_dev';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DIVA_ROLE_MISSING';
  END IF;

  SELECT count(*)::integer INTO v_sessions FROM pg_catalog.pg_stat_activity
  WHERE usename='bizportal_customer_invoice_cst_writer_dev';

  v_valid := NOT v_invalid_control AND v_lease.armed
    AND v_lease.expires_at > v_now
    AND v_lease.expires_at <= v_now + interval '5 minutes'
    AND v_cst.rolcanlogin
    AND v_cst.rolvaliduntil IS NOT NULL
    AND v_cst.rolvaliduntil <= v_lease.expires_at
    AND NOT v_diva.rolcanlogin
    AND NOT v_diva.rolsuper
    AND NOT v_diva.rolbypassrls;

  IF v_valid THEN
    RETURN 'LEASE_MONITORED_NO_CHANGE';
  END IF;

  -- IMPORTANT: preserve the existing SCRAM verifier when the writer is
  -- ALREADY NOLOGIN and no sessions/lease exist. This is NOT activation.
  IF NOT v_invalid_control
    AND NOT v_lease.armed AND NOT v_cst.rolcanlogin AND v_sessions=0
    AND NOT v_diva.rolcanlogin AND NOT v_diva.rolsuper
    AND NOT v_diva.rolbypassrls THEN
    RETURN 'NOLOGIN_PREEXISTING_PASSWORD_PRESERVED';
  END IF;

  -- Any expired/invalid/previously armed lease OR unexpected live role/session
  -- forces revocation and password clear. Literal role name is non-dynamic.
  v_reason := CASE WHEN v_invalid_control THEN 'MISSING_OR_FOREIGN_LEASE'
                   WHEN v_lease.armed THEN 'LEASE_EXPIRED_OR_INVALID'
                   WHEN v_diva.rolcanlogin OR v_diva.rolsuper OR v_diva.rolbypassrls
                     THEN 'UNSAFE_DIVA_STATE'
                   ELSE 'CST_WRITER_OPEN_WITHOUT_LEASE' END;

  EXECUTE 'ALTER ROLE bizportal_customer_invoice_cst_writer_dev NOLOGIN PASSWORD NULL';

  -- Separate from the role-LOGIN check: NOLOGIN alone does not end sessions.
  FOR v_pid IN SELECT pid FROM pg_catalog.pg_stat_activity
    WHERE usename='bizportal_customer_invoice_cst_writer_dev'
      AND pid<>pg_catalog.pg_backend_pid()
  LOOP
    -- PG17 timeout=0 only means SIGTERM delivered, NOT backend exited.
    -- Bound the wait; do not throw on timeout and roll back NOLOGIN.
    -- The exception block creates a subtransaction around EACH termination,
    -- so a recoverable signal/permission error cannot roll back the already
    -- executed ALTER ROLE ... NOLOGIN outside this block.
    BEGIN
      IF pg_catalog.pg_terminate_backend(v_pid, 2000) THEN
        v_killed := v_killed + 1;
      ELSE
        v_termination_timeouts := v_termination_timeouts + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Treat unexpected termination errors as INCOMPLETE; never claim success.
      -- PostgreSQL does not catch query_canceled/assert_failure with OTHERS;
      -- enclosing transaction failure is still a separate release risk.
      v_termination_errors := v_termination_errors + 1;
    END;
  END LOOP;

  SELECT count(*)::integer INTO v_remaining
  FROM pg_catalog.pg_stat_activity
  WHERE usename='bizportal_customer_invoice_cst_writer_dev';

  UPDATE cst_invoice_relock_dev.lease
    SET armed=false,expires_at=null WHERE singleton=true;
  INSERT INTO cst_invoice_relock_dev.audit(reason,terminated)
    VALUES (
      CASE WHEN v_remaining>0 OR v_termination_timeouts>0 OR v_termination_errors>0
           THEN 'RELOCK_INCOMPLETE_' || v_reason
           ELSE v_reason END,
      v_killed
    );

  -- Retain the NOLOGIN revocation rather than raising a deliberate exception
  -- that would roll back the ALTER ROLE transaction on partial termination.
  IF v_remaining>0 OR v_termination_timeouts>0 OR v_termination_errors>0 THEN
    RETURN 'CST_RELOCK_INCOMPLETE';
  END IF;
  RETURN 'CST_RELOCK_EXECUTED';
END;
$relock$;
REVOKE ALL ON FUNCTION cst_invoice_relock_dev.tick() FROM PUBLIC;
-- Keep all objects under the exact approved cron execution identity.
-- If the DBA executor is supabase_admin, owner must still be 'postgres'.
ALTER SCHEMA cst_invoice_relock_dev OWNER TO postgres;
ALTER TABLE cst_invoice_relock_dev.lease OWNER TO postgres;
ALTER TABLE cst_invoice_relock_dev.audit OWNER TO postgres;
ALTER FUNCTION cst_invoice_relock_dev.tick() OWNER TO postgres;
GRANT USAGE ON SCHEMA cst_invoice_relock_dev TO postgres;
GRANT EXECUTE ON FUNCTION cst_invoice_relock_dev.tick() TO postgres;
-- DBA must verify an approved cron job identity and schedule separately.
-- DO NOT call cron.schedule or enable PostgreSQL LOGIN from this script.
