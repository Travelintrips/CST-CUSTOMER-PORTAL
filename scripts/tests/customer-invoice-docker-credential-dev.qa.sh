#!/usr/bin/env bash
# DEV-only QA: same Customer Portal Docker image and Unix user; no live change.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
image="cst-customer-portal-dev:local"
docker image inspect "$image" >/dev/null
test "$(docker run --rm --pull never --network none --entrypoint id "$image" -u)" = 1000
test "$(docker run --rm --pull never --network none --entrypoint id "$image" -g)" = 1000
test "$(stat -f -c '%T' /run)" = tmpfs
qa="$(mktemp -d /run/cst-invoice-docker-readonly-qa.XXXXXXXX)"
trap 'rm -rf -- "$qa"' EXIT
install -d -m 0750 -o root -g 1000 "$qa/credentials"
python3 - "$qa/credentials/customer-invoice-writers-dev.json" <<'PY'
import json,sys,os
ref='xssrfshdrtdfupgqwfdw'
pool='aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
tls='?sslmode=verify-full&sslrootcert=/opt/cst-dev-finance-tls/supabase-root-2021.crt'
def qa(role):
 return f'postgresql://{role}.{ref}:synthetic-only-qa@{pool}{tls}'
data={
 'APP_ENV':'development','SUPABASE_PROJECT_REF':ref,
 'CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV':qa('bizportal_customer_invoice_cst_writer_dev'),
 'CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV':qa('bizportal_customer_invoice_diva_writer_dev'),
}
with open(sys.argv[1],'w') as f:json.dump(data,f)
os.chown(sys.argv[1],0,1000);os.chmod(sys.argv[1],0o440)
PY
docker run --rm --pull never --network none --read-only --cap-drop ALL \
 --pids-limit 64 --memory 256m --cpus 0.5 --security-opt no-new-privileges \
 --tmpfs /tmp:rw,nosuid,size=16m \
 --mount "type=bind,src=$qa/credentials,dst=/run/credentials/cst-customer-portal-dev.service,readonly" \
 --mount "type=bind,src=$ROOT/server,dst=/qa/server,readonly" \
 -e APP_ENV=development -e NODE_ENV=development \
 -e CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true \
 -e CREDENTIALS_DIRECTORY=/run/credentials/cst-customer-portal-dev.service \
 --entrypoint node "$image" --input-type=module -e \
 'import {loadDevCustomerInvoiceSystemdCredentials} from "/qa/server/dev-customer-invoice-systemd-credential.mjs";const d=await loadDevCustomerInvoiceSystemdCredentials();if(!d.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV.includes(":synthetic-only-qa@")||!d.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV.includes(":synthetic-only-qa@"))process.exit(7);console.log("ACTUAL_PORTAL_DEV_IMAGE_NODE_READONLY_CREDENTIAL_QA_PASS");'
test "$(docker ps --format '{{.Names}}' | grep -cx cst-customer-portal-dev)" = 1
echo ACTIVE_PORTAL_UNCHANGED_AND_NO_REAL_DB_CONNECT
