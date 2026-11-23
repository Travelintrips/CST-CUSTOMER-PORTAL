#!/usr/bin/env bash
# DEV-only Compose static verification. No docker compose up or secrets read.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
source scripts/dev-invoice-compose-guard.sh
work="$(mktemp -d /run/cst-invoice-compose-tmpfs-qa.XXXXXXXX)"
trap 'rm -rf -- "$work"' EXIT
chmod 700 "$work"
printf '%s\n' 'CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=false' > "$work/off.env"
printf '%s\n' \
 'CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true' \
 'CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true' \
 'CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true' > "$work/on.env"
base=(-f compose.dev-vps.yml)
unset CST_INVOICE_DEV_PRIVATE_TMPFS CST_INVOICE_DEV_CREDENTIAL_DIRECTORY || true
legacy=("${base[@]}")
cst_invoice_compose_guard legacy "$work/off.env"
test "${#legacy[@]}" -eq 2
echo PRIVATE_TMPFS_FEATURE_OFF_ORIGINAL_COMPOSE_UNCHANGED_PASS
if cst_invoice_compose_guard legacy "$work/on.env" >/dev/null 2>&1;then
 echo ATOMIC_ON_WITHOUT_PRIVATE_TMPFS_WAS_ACCEPTED;exit 3
fi
echo ATOMIC_ON_NO_PRIVATE_TMPFS_FAIL_CLOSED_PASS
docker compose "${base[@]}" config --no-env-resolution --format json > "$work/base.json"
docker compose "${base[@]}" -f ops/dev-invoice-keyless-credentials.compose.override.yml config --no-env-resolution --format json > "$work/combined.json"
python3 - "$work/base.json" "$work/combined.json" <<'PY'
import json,sys
base=json.load(open(sys.argv[1]));new=json.load(open(sys.argv[2]))
assert set(base['services'])==set(new['services'])=={'customer-portal-dev'}
assert base['name']==new['name']
before=base['services']['customer-portal-dev']
after=new['services']['customer-portal-dev']
assert after.pop('user')=='21110:21110'
assert 'CREDENTIALS_DIRECTORY' not in before['environment']
assert after['environment'].pop('CREDENTIALS_DIRECTORY')=='/run/credentials/cst-customer-portal-dev.service'
assert before.get('volumes')==after.get('volumes'), 'no host bind mounts allowed'
prior=set(before.get('tmpfs',[]))
extra=set(after['tmpfs'])-prior
assert len(extra)==1, f'expect exactly one private container tmpfs, saw {extra}'
mount=next(iter(extra))
assert mount.startswith('/run/credentials/cst-customer-portal-dev.service:')
opts=set(mount.split(':',1)[1].split(','))
assert {'rw','noexec','nosuid','nodev','size=65536','mode=0700',
        'uid=21110','gid=21110'} <= opts
assert prior<=set(after['tmpfs'])
after['tmpfs']=before.get('tmpfs',[])
assert after==before, 'ports, health, image, restart, limits and security must be unchanged'
print('COMPOSE_PRIVATE_TMPFS_UNIQUE_UID_NO_HOST_BIND_PASS')
print('COMPOSE_LEGACY_IMAGE_PORTS_HEALTH_SECURITY_METADATA_UNCHANGED_PASS')
PY
export CST_INVOICE_DEV_PRIVATE_TMPFS=true
if cst_invoice_compose_guard legacy "$work/off.env" >/dev/null 2>&1;then
 echo ENABLING_TMPFS_WITH_ATOMIC_OFF_ACCEPTED;exit 4
fi
export CST_INVOICE_DEV_CREDENTIAL_DIRECTORY=/run/previous-plaintext-bundle
if cst_invoice_compose_guard legacy "$work/on.env" >/dev/null 2>&1;then
 echo LEGACY_HOST_PLAINTEXT_BIND_WAS_ACCEPTED;exit 5
fi
unset CST_INVOICE_DEV_CREDENTIAL_DIRECTORY
echo LEGACY_HOST_PLAINTEXT_BIND_REJECTED_PASS
# GCP Actions has no real encrypted bundle: static diff and no-secret
# rejection are enough. On owned VPS verify actual root-only CMS preflight.
if [[ -s /etc/cst-invoice-dev/transport/invoice-writer-version3.cms ]];then
 approved=("${base[@]}")
 cst_invoice_compose_guard approved "$work/on.env"
 test "${#approved[@]}" -eq 4
 echo VPS_ROOT_ENCRYPTED_CREDENTIAL_PREFLIGHT_PASS
else
 echo CI_STATIC_ONLY_NO_ENCRYPTED_BUNDLE_AVAILABLE
fi
test "$(grep -Fc 'docker compose "${compose_files[@]}" up -d --no-build --force-recreate --no-deps customer-portal-dev' scripts/deploy-certified-vps.sh)" -eq 2
test "$(grep -Fc 'bash ./scripts/dev-invoice-inject-verified-cms.sh cst-customer-portal-dev' scripts/deploy-certified-vps.sh)" -eq 2
grep -q 'loadDevCustomerInvoiceSystemdCredentials' scripts/start-dev-vps.mjs
echo CERTIFIED_FORWARD_AND_ROLLBACK_PRIVATE_CREDENTIAL_INJECTION_GUARD_PASS
echo CUSTOMER_INVOICE_PRIVATE_TMPFS_DOCKER_COMPOSE_SOURCE_QA_PASS
