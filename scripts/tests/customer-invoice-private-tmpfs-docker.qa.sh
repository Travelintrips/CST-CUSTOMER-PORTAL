#!/usr/bin/env bash
# Synthetic only: temporary Docker with unique UID 21110 and private tmpfs.
set -euo pipefail
umask 077
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
name="cst-invoice-private-tmpfs-qa-$$"
image="cst-invoice-private-tmpfs-qa:local"
dir="/run/credentials/cst-customer-portal-dev.service"
cleanup(){ docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
test "$(id -u)" = 0
if [[ -n "$(getent passwd 21110 || true)" || -n "$(getent group 21110 || true)" ]]; then
  echo "STOP_UNIQUE_CONTAINER_UID_CONFLICTS_WITH_HOST";exit 2
fi
test "$(docker run --rm --network none --pull never --entrypoint id "$image" -u)" = 1000
test "$(docker run --rm --network none --pull never --entrypoint id "$image" -u cstinvoice)" = 21110
docker run --rm -d --name "$name" --pull never \
 --user 21110:21110 --network none --read-only --cap-drop ALL \
 --pids-limit 30 --memory 240m --cpus .5 \
 --security-opt no-new-privileges \
 --tmpfs /tmp:rw,nosuid,noexec,size=16m \
 --tmpfs "$dir:rw,nosuid,nodev,noexec,size=65536,mode=0700,uid=21110,gid=21110" \
 -e APP_ENV=development -e NODE_ENV=development \
 -e CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true \
 -e CREDENTIALS_DIRECTORY="$dir" \
 "$image" node -e 'setInterval(()=>{},1000)' >/dev/null
test "$(docker inspect "$name" --format '{{.State.Running}}')" = true
docker exec --user 21110:21110 "$name" node --input-type=module -e '
import {loadDevCustomerInvoiceSystemdCredentials} from "./server/dev-customer-invoice-systemd-credential.mjs";
let denied=false;try{await loadDevCustomerInvoiceSystemdCredentials()}catch(e){denied=e.statusCode===503}
if(!denied)process.exit(3);console.log("MISSING_TMPFS_CREDENTIAL_FAIL_CLOSED_PASS")'
# Invalid JSON must never create any credential file.
if printf '{"not":"valid"}' | docker exec -i --user 21110:21110 "$name" \
 node /app/scripts/dev-invoice-tmpfs-inject.mjs >/dev/null 2>&1; then
 echo INVALID_CREDENTIAL_PAYLOAD_ACCEPTED; exit 4
fi
echo MALFORMED_INJECTION_REJECTED_PASS
python3 -c '
import json,sys
ref="xssrfshdrtdfupgqwfdw"
host="aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
ca="/opt/cst-dev-finance-tls/supabase-root-2021.crt"
def dsn(role):
 return "postgresql://"+role+"."+ref+":synthetic-only-qa@"+host+"?sslmode=verify-full&sslrootcert="+ca
data={"APP_ENV":"development","SUPABASE_PROJECT_REF":ref,
 "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV":dsn("bizportal_customer_invoice_cst_writer_dev"),
 "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV":dsn("bizportal_customer_invoice_diva_writer_dev")}
sys.stdout.write(json.dumps(data))
' | docker exec -i --user 21110:21110 "$name" node /app/scripts/dev-invoice-tmpfs-inject.mjs
docker exec --user 21110:21110 "$name" node --input-type=module -e '
import fs from "node:fs";
import {loadDevCustomerInvoiceSystemdCredentials} from "./server/dev-customer-invoice-systemd-credential.mjs";
const d="/run/credentials/cst-customer-portal-dev.service";
const file=d+"/customer-invoice-writers-dev.json";
const dir=fs.lstatSync(d),stat=fs.lstatSync(file);
if(dir.uid!==21110||dir.gid!==21110||(dir.mode&0o777)!==0o700)process.exit(4);
if(stat.uid!==21110||stat.gid!==21110||(stat.mode&0o777)!==0o400)process.exit(5);
const s=await loadDevCustomerInvoiceSystemdCredentials();
if(!s.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV.includes("cst_writer_dev")||
   !s.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV.includes("diva_writer_dev"))process.exit(6);
console.log("UNIQUE_UID_DOCKER_PRIVATE_TMPFS_CREDENTIAL_LOADER_PASS")'
pid="$(docker inspect "$name" --format '{{.State.Pid}}')"
qa_reader="${CST_INVOICE_QA_HOST_READER:-githubrunner}"
if ! id "$qa_reader" >/dev/null 2>&1;then qa_reader=nobody;fi
if runuser -u "$qa_reader" -- test -r "/proc/$pid/root$dir/customer-invoice-writers-dev.json" 2>/dev/null; then
 echo HOST_GITHUB_RUNNER_CAN_READ_PRIVATE_TMPFS;exit 7
fi
echo HOST_GITHUB_RUNNER_CANNOT_READ_PRIVATE_CREDENTIAL_PASS
echo NO_HOST_PLAINTEXT_BIND_MOUNT_NO_POSTGRES_CONNECTION
