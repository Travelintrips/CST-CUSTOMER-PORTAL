#!/usr/bin/env bash
set -euo pipefail
# Disposable PG16, network disconnected, synthetic IDs; never touches CST-DEV/PROD.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
N="cst-invoice-split-rls-qa-$$"
trap 'docker rm -f "$N" >/dev/null 2>&1 || true' EXIT
docker run -d --rm --network none --name "$N" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine >/dev/null
for i in $(seq 1 24); do
  if docker exec "$N" pg_isready -U postgres -d postgres >/dev/null 2>&1; then sleep 1; break; fi
  sleep 1
done
docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q <<'SQL'
create role bizportal_customer_invoice_cst_writer_dev login nobypassrls;
create role bizportal_customer_invoice_diva_writer_dev login nobypassrls;
create table public.users(id text primary key,email text not null,
 role text not null, system_role text,status text not null,
 is_active boolean not null,company_id int,updated_at timestamptz default now());
insert into public.users values
('staff-cst','staff.cst@example.invalid','admin',null,'active',true,1,now()),
('staff-diva','staff.diva@example.invalid','admin',null,'active',true,3,now()),
('owner-global','owner.global@example.invalid','super_admin','super_admin','active',true,null,now()),
('staff-unassigned','staff.unassigned@example.invalid','admin',null,'active',true,null,now());
alter table public.users enable row level security;
grant usage on schema public to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
grant select(id,email,role,system_role,status,is_active,company_id),
 update(updated_at) on public.users to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
create policy cst_invoice_b2_guard_cst on public.users for all to bizportal_customer_invoice_cst_writer_dev using(
 current_user=session_user and role='super_admin' and system_role='super_admin' and is_active and status='active' and (company_id is null or company_id=1));
create policy cst_invoice_b2_guard_diva on public.users for all to bizportal_customer_invoice_diva_writer_dev using(
 current_user=session_user and role='super_admin' and system_role='super_admin' and is_active and status='active' and (company_id is null or company_id=3));
SQL
docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$ROOT/scripts/dev-invoice-separated-issuer-rls.sql"
cst="$(docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -Atc "select id from public.users where id in ('staff-cst','staff-diva','owner-global','staff-unassigned') for share" | sort | tr '\n' ' ')"
[ "$cst" = 'owner-global staff-cst ' ] || { echo "CST_RLS_FAILED:$cst"; exit 1; }
echo "CST_ISSUER_AND_GLOBAL_OWNER_SCOPE_PASS"
diva="$(docker exec "$N" psql -U bizportal_customer_invoice_diva_writer_dev -d postgres -Atc "select id from public.users where id in ('staff-cst','staff-diva','owner-global','staff-unassigned') for share" | sort | tr '\n' ' ')"
[ "$diva" = 'owner-global staff-diva ' ] || { echo "DIVA_RLS_FAILED:$diva"; exit 1; }
echo "DIVA_ISSUER_AND_GLOBAL_OWNER_SCOPE_PASS"
scope="$(docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -Atc "select current_user=session_user from public.users where id='staff-cst' for share")"
[ "$scope" = "t" ] || { echo "DIRECT_ROLE_REQUIREMENT_FAILED"; exit 1; }
echo "DIRECT_LOGIN_SESSION_ROLE_PASS"
if docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -v ON_ERROR_STOP=1 -q -c "update public.users set updated_at=now() where id='staff-cst';" >/dev/null 2>&1; then
 echo "ISSUER_WRITE_UNEXPECTEDLY_ALLOWED";exit 1
fi
echo "NO_USER_ROLE_MUTATION_ALLOWED_PASS"
docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -v ON_ERROR_STOP=1 -Atc "begin; select id from public.users where id='staff-cst' for share; select pg_sleep(4); commit;" >/dev/null &
hold=$!
sleep 1
if docker exec "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c "set lock_timeout='500ms'; update public.users set is_active=false where id='staff-cst';" >/dev/null 2>&1; then
 echo "ISSUER_REVOCATION_RACE_FAIL"; wait "$hold"||true;exit 1
fi
echo "ISSUER_REVOCATION_BLOCKED_UNTIL_COMMIT_PASS"
wait "$hold"
docker exec "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c "update public.users set is_active=false where id='staff-cst';"
revoked="$(docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -Atc "select id from public.users where id='staff-cst' for share")"
[ -z "$revoked" ] || { echo "REVOKED_ISSUER_VISIBLE_FAIL";exit 1; }
echo "REVOKED_ISSUER_DENIED_PASS"
echo "SYNTHETIC_POSTGRES16_ISSUER_OWNER_RLS_PASS"
