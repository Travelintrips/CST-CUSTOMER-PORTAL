#!/usr/bin/env bash
set -euo pipefail
# Docker PG16 --network none; synthetic only; NEVER hosted CST-DEV/PROD.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
N="cst-invoice-taxlock-qa-$$"
trap 'docker rm -f "$N" >/dev/null 2>&1 || true' EXIT
docker run -d --rm --network none --name "$N" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine >/dev/null
for i in $(seq 1 24); do
  if docker exec "$N" pg_isready -U postgres -d postgres >/dev/null 2>&1; then sleep 1; break; fi
  sleep 1
done
docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q <<'SQL'
create role bizportal_customer_invoice_cst_writer_dev login nobypassrls;
create role bizportal_customer_invoice_diva_writer_dev login nobypassrls;
create schema sandbox;
create table sandbox.accounting_settings(
 company_id int primary key, default_sales_tax_id int,ppn_output_account_id int,
 updated_at timestamptz default now());
create table sandbox.accounting_taxes(
 id int primary key,company_id int,rate numeric(6,3),is_active bool,
 account_id int,created_at timestamptz default now());
insert into sandbox.accounting_settings(company_id,default_sales_tax_id,ppn_output_account_id)
 values(1,1,49109),(3,9,49199);
insert into sandbox.accounting_taxes(id,company_id,rate,is_active,account_id)
 values(1,1,11,true,49109),(9,3,11,true,49199);
alter table sandbox.accounting_settings enable row level security;
alter table sandbox.accounting_taxes enable row level security;
grant usage on schema sandbox to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
grant select on sandbox.accounting_settings,sandbox.accounting_taxes
 to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
-- Match the real CST-DEV B1 RLS: RESTRICTIVE ALL + PERMISSIVE SELECT,
-- deliberately NO PERMISSIVE UPDATE policy at baseline.
create policy cfg_cst_guard on sandbox.accounting_settings as restrictive for all to bizportal_customer_invoice_cst_writer_dev
 using(current_user=session_user and company_id=1)
 with check(current_user=session_user and company_id=1);
create policy cfg_cst_read on sandbox.accounting_settings for select to bizportal_customer_invoice_cst_writer_dev
 using(current_user=session_user and company_id=1);
create policy cfg_diva_guard on sandbox.accounting_settings as restrictive for all to bizportal_customer_invoice_diva_writer_dev
 using(current_user=session_user and company_id=3)
 with check(current_user=session_user and company_id=3);
create policy cfg_diva_read on sandbox.accounting_settings for select to bizportal_customer_invoice_diva_writer_dev
 using(current_user=session_user and company_id=3);
create policy tax_cst_guard on sandbox.accounting_taxes as restrictive for all to bizportal_customer_invoice_cst_writer_dev
 using(current_user=session_user and company_id=1)
 with check(current_user=session_user and company_id=1);
create policy tax_cst_read on sandbox.accounting_taxes for select to bizportal_customer_invoice_cst_writer_dev
 using(current_user=session_user and company_id=1);
create policy tax_diva_guard on sandbox.accounting_taxes as restrictive for all to bizportal_customer_invoice_diva_writer_dev
 using(current_user=session_user and company_id=3)
 with check(current_user=session_user and company_id=3);
create policy tax_diva_read on sandbox.accounting_taxes for select to bizportal_customer_invoice_diva_writer_dev
 using(current_user=session_user and company_id=3);
SQL
# Reproduce the actual discovered failure: RESTRICTIVE-only B6 is not
# enough for FOR SHARE under real B1 RLS (without PERMISSIVE UPDATE).
sed '/^-- The real hosted B1 settings\/taxes RLS has a PERMISSIVE SELECT/,$d' "$ROOT/scripts/dev-invoice-tax-source-lock-20261119.sql" |
 sed 's/public\./sandbox./g' |
 docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q
for c in cst diva; do
 ROLE="bizportal_customer_invoice_$c"_writer_dev
 if [ "$c" = cst ];then COMPANY=1;TAX=1;else COMPANY=3;TAX=9;fi
  cfg="$(docker exec "$N" psql -U "$ROLE" -d postgres -Atc "select company_id from sandbox.accounting_settings where company_id=$COMPANY for share")"
  tax="$(docker exec "$N" psql -U "$ROLE" -d postgres -Atc "select id from sandbox.accounting_taxes where id=$TAX for share")"
  [ -z "$cfg" ] && [ -z "$tax" ] || { echo "RESTRICTIVE_B6_ONLY_DID_NOT_FAIL_CLOSED_$c";exit 1; }
  echo "REAL_B1_RESTRICTIVE_ONLY_B6_FOR_SHARE_DENIED_$c"_PASS
done
# Now apply ONLY the four new PERMISSIVE UPDATE(USING owner) policies,
# all WITH CHECK(false), while preserving original four RESTRICTIVE B6.
sed -n '/^create policy cst_invoice_b6_settings_readlock_cst/,$p' "$ROOT/scripts/dev-invoice-tax-source-lock-20261119.sql" |
 sed 's/public\./sandbox./g' |
 docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q
for c in cst diva; do
  ROLE="bizportal_customer_invoice_$c"_writer_dev
  if [ "$c" = cst ]; then COMPANY=1; TAX=1; OTHER=3; else COMPANY=3; TAX=9; OTHER=1; fi
  settings="$(docker exec "$N" psql -U "$ROLE" -d postgres -Atc "select company_id from sandbox.accounting_settings where company_id=$COMPANY for share")"
  tax="$(docker exec "$N" psql -U "$ROLE" -d postgres -Atc "select id from sandbox.accounting_taxes where id=$TAX and company_id=$COMPANY for share")"
  [ "$settings" = "$COMPANY" ] && [ "$tax" = "$TAX" ] || { echo "ROW_LOCK_FAILED_$c";exit 1; }
  echo "ROW_LOCK_$c"_PASS
  other="$(docker exec "$N" psql -U "$ROLE" -d postgres -Atc "select count(*) from sandbox.accounting_settings where company_id=$OTHER")"
  [ "$other" = 0 ] || { echo "TENANT_LEAK_$c";exit 1; }
  echo "CROSS_COMPANY_$c"_DENIED_PASS
  # A returning row would mean the restrictive policy is ineffective.
  if docker exec "$N" psql -U "$ROLE" -d postgres -Atc "update sandbox.accounting_settings set updated_at=now()+interval '1 day' where company_id=$COMPANY returning company_id" 2>/dev/null | grep -qx "$COMPANY"; then echo "SETTINGS_WRITABLE_$c";exit 1; fi
  if docker exec "$N" psql -U "$ROLE" -d postgres -Atc "update sandbox.accounting_taxes set created_at=now()+interval '1 day' where id=$TAX returning id" 2>/dev/null | grep -qx "$TAX"; then echo "TAX_WRITABLE_$c";exit 1; fi
  echo "COLUMN_UPDATE_MUTATIONS_$c"_DENIED_PASS
done
# Row lock must block UPDATE of NON-key tax rate until Invoice COMMIT.
docker exec "$N" psql -U bizportal_customer_invoice_cst_writer_dev -d postgres -v ON_ERROR_STOP=1 -Atc "begin; select id from sandbox.accounting_taxes where id=1 for share;select pg_sleep(4);commit;" >/dev/null &
holder=$!
sleep 1
if docker exec "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c "set lock_timeout='500ms';update sandbox.accounting_taxes set rate=12 where id=1" >/dev/null 2>&1; then
  echo TAX_EDITOR_RACE_FAIL;wait "$holder"||true;exit 1
fi
echo TAX_RATE_EDITOR_BLOCKED_UNTIL_INVOICE_COMMIT_PASS
wait "$holder"
docker exec "$N" psql -U bizportal_customer_invoice_diva_writer_dev -d postgres -v ON_ERROR_STOP=1 -Atc "begin; select company_id from sandbox.accounting_settings where company_id=3 for share;select pg_sleep(4);commit;" >/dev/null &
holder=$!
sleep 1
if docker exec "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c "set lock_timeout='500ms';update sandbox.accounting_settings set default_sales_tax_id=1 where company_id=3" >/dev/null 2>&1; then
  echo SETTINGS_EDITOR_RACE_FAIL;wait "$holder"||true;exit 1
fi
echo SETTINGS_EDITOR_BLOCKED_UNTIL_INVOICE_COMMIT_PASS
wait "$holder"
# Roll back both PERMISSIVE and RESTRICTIVE B6 policies and the exact
# narrow column grants; original B1 SELECT RLS must stay untouched.
sed 's/public\./sandbox./g' "$ROOT/scripts/dev-invoice-tax-source-lock-rollback-20261119.sql" |
 docker exec -i "$N" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q
for c in cst diva; do
 ROLE="bizportal_customer_invoice_$c"_writer_dev
 result="$(docker exec "$N" psql -U postgres -d postgres -Atc "select has_column_privilege('$ROLE','sandbox.accounting_settings','updated_at','UPDATE')::text||':'||has_column_privilege('$ROLE','sandbox.accounting_taxes','created_at','UPDATE')::text")"
 [ "$result" = false:false ] || { echo "B6_ROLLBACK_PRIVILEGE_LEAK_$c";exit 1; }
 echo "REAL_B1_ALL_B6_ROLLBACK_$c"_PASS
done
echo ISOLATED_PG16_INVOICE_TAX_ROW_LOCK_PASS
