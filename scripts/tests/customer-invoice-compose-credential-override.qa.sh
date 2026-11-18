#!/usr/bin/env bash
# DEV-only dry run. Compare Compose service metadata; never run docker up.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
source scripts/dev-invoice-compose-guard.sh
work="$(mktemp -d /run/cst-invoice-compose-config-qa.XXXXXXXX)"
trap 'rm -rf -- "$work"' EXIT
chmod 700 "$work"
printf '%s\n' CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=false > "$work/off.env"
printf '%s\n' CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true > "$work/on.env"
base=(-f compose.dev-vps.yml)
unset CST_INVOICE_DEV_CREDENTIAL_DIRECTORY || true
off=("${base[@]}")
cst_invoice_compose_guard off "$work/off.env"
test "${#off[@]}" -eq 2
echo COMPOSE_LEGACY_FEATURE_OFF_UNMODIFIED_PASS
if cst_invoice_compose_guard off "$work/on.env" >/dev/null 2>&1; then
  echo ATOMIC_INVOICE_WITHOUT_CREDENTIAL_MOUNT_WAS_ALLOWED; exit 3
fi
echo COMPOSE_ATOMIC_ON_MISSING_MOUNT_FAIL_CLOSED_PASS

test "$(stat -f -c %T /run)" = tmpfs
mkdir "$work/mounted"
chown root:1000 "$work/mounted"
chmod 0750 "$work/mounted"
python3 - "$work/mounted/customer-invoice-writers-dev.json" <<'PY'
import json,os,sys
ref='xssrfshdrtdfupgqwfdw'
payload={
 'APP_ENV':'development','SUPABASE_PROJECT_REF':ref,
 'CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV':
  'postgresql://bizportal_customer_invoice_cst_writer_dev.'+ref+':synthetic-only-qa@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=/opt/cst-dev-finance-tls/supabase-root-2021.crt',
 'CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV':
  'postgresql://bizportal_customer_invoice_diva_writer_dev.'+ref+':synthetic-only-qa@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=/opt/cst-dev-finance-tls/supabase-root-2021.crt',
}
with open(sys.argv[1],'w') as f:json.dump(payload,f)
os.chown(sys.argv[1],0,1000)
os.chmod(sys.argv[1],0o440)
PY
export CST_INVOICE_DEV_CREDENTIAL_DIRECTORY="$work/mounted"
with_override=("${base[@]}")
cst_invoice_compose_guard with_override "$work/on.env"
test "${#with_override[@]}" -eq 4
docker compose "${base[@]}" config --no-env-resolution --format json > "$work/base.json"
docker compose "${with_override[@]}" config --no-env-resolution --format json > "$work/combined.json"
grep -Eq "^[[:space:]]+create_host_path:[[:space:]]+false[[:space:]]*$" ops/dev-invoice-keyless-credentials.compose.override.yml
python3 - "$work/base.json" "$work/combined.json" "$work/mounted" <<'PY'
import json,sys,copy
base=json.load(open(sys.argv[1]))
merged=json.load(open(sys.argv[2]))
expect=sys.argv[3]
assert set(base['services'])==set(merged['services'])=={'customer-portal-dev'}
b=base['services']['customer-portal-dev']
m=merged['services']['customer-portal-dev']
assert 'CREDENTIALS_DIRECTORY' not in b['environment']
assert m['environment'].pop('CREDENTIALS_DIRECTORY')=='/run/credentials/cst-customer-portal-dev.service'
vol=m.pop('volumes')
assert len(vol)==1
v=vol[0]
assert v['type']=='bind' and v['source']==expect
assert v['target']=='/run/credentials/cst-customer-portal-dev.service'
assert v['read_only'] is True
assert v['bind'].get('create_host_path',False) is False
assert b==m,'the override may not alter image, ports, env, restart, security, health or any other field'
assert base['name']==merged['name']
print('COMPOSE_ONLY_ONE_READONLY_CREDENTIAL_MOUNT_DIFF_PASS')
print('COMPOSE_EXISTING_SERVICE_SECURITY_PORTS_RESTART_HEALTH_UNCHANGED_PASS')
PY
unset CST_INVOICE_DEV_CREDENTIAL_DIRECTORY
if docker compose "${base[@]}" -f ops/dev-invoice-keyless-credentials.compose.override.yml config --no-env-resolution -q >/dev/null 2>&1; then
  echo COMPOSE_DID_NOT_REQUIRE_EXPLICIT_HOST_CREDENTIAL_DIR; exit 6
fi
echo COMPOSE_NO_SILENT_HOST_PATH_DEFAULT_PASS

export CST_INVOICE_DEV_CREDENTIAL_DIRECTORY="$work/nonexistent"
bad=("${base[@]}")
if cst_invoice_compose_guard bad "$work/on.env" >/dev/null 2>&1; then
  echo COMPOSE_ALLOWED_NONEXISTENT_CREDENTIAL_DIR; exit 7
fi
chmod 0644 "$work/mounted/customer-invoice-writers-dev.json"
export CST_INVOICE_DEV_CREDENTIAL_DIRECTORY="$work/mounted"
if cst_invoice_compose_guard bad "$work/on.env" >/dev/null 2>&1; then
  echo COMPOSE_ALLOWED_WORLD_READABLE_CREDENTIAL_FILE; exit 8
fi
echo COMPOSE_NONEXISTENT_OR_UNSAFE_CREDENTIAL_MOUNT_FAIL_CLOSED_PASS
test "$(grep -Fc 'docker compose "${compose_files[@]}" up -d --no-build --force-recreate --no-deps customer-portal-dev' scripts/deploy-certified-vps.sh)" -eq 2
echo CERTIFIED_DEPLOY_AND_ROLLBACK_SHARE_SAME_COMPOSE_OVERRIDE_PASS
echo CUSTOMER_INVOICE_DEV_COMPOSE_CREDENTIAL_ISOLATION_QA_PASS
