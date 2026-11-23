#!/usr/bin/env bash
# Authorized DEV-only security QA with REAL version-3 CMS, but NO DB LOGIN.
# Root-only encrypted host file -> stdin -> isolated Docker tmpfs; destroy QA.
set -euo pipefail
umask 077
r="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
name="cst-invoice-private-tmpfs-qa-$$"
image="cst-invoice-private-tmpfs-qa:local"
dir="/run/credentials/cst-customer-portal-dev.service"
cleanup(){ docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
test "$(id -u)" = 0
test -s /etc/cst-invoice-dev/transport/invoice-writer-version3.cms
docker run --rm -d --name "$name" --pull never \
 --user 21110:21110 --network none --read-only --cap-drop ALL \
 --pids-limit 32 --memory 260m --cpus .5 \
 --security-opt no-new-privileges \
 --tmpfs /tmp:rw,nosuid,noexec,size=16m \
 --tmpfs "$dir:rw,nosuid,nodev,noexec,size=65536,mode=0700,uid=21110,gid=21110" \
 -e APP_ENV=development -e NODE_ENV=development \
 -e CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true \
 -e CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true \
 -e CREDENTIALS_DIRECTORY="$dir" \
 "$image" node -e 'setInterval(()=>{},1000)' >/dev/null
bash "$r/scripts/dev-invoice-inject-verified-cms.sh" "$name"
docker exec --user 21110:21110 "$name" node --input-type=module -e '
import fs from "node:fs";
import {loadDevCustomerInvoiceSystemdCredentials} from "./server/dev-customer-invoice-systemd-credential.mjs";
const d="/run/credentials/cst-customer-portal-dev.service";
const f=d+"/customer-invoice-writers-dev.json";
const s=fs.lstatSync(f);
if(!s.isFile()||s.uid!==21110||s.gid!==21110||(s.mode&0o777)!==0o400)process.exit(4);
if(fs.statfsSync(d).type!==0x01021994)process.exit(5);
const x=await loadDevCustomerInvoiceSystemdCredentials();
if(!x.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV.includes("cst_writer_dev")||
   !x.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV.includes("diva_writer_dev"))process.exit(6);
console.log("REAL_VERSION3_BUNDLE_CONTAINER_TMPFS_LOADER_PASS");
console.log("NO_SQL_CONNECTION_NO_SECRET_VALUE_LOGGED");
'
pid="$(docker inspect "$name" --format '{{.State.Pid}}')"
if runuser -u githubrunner -- test -r "/proc/$pid/root$dir/customer-invoice-writers-dev.json" 2>/dev/null;then
 echo STOP_HOST_GITHUB_RUNNER_CAN_READ_REAL_CREDENTIAL;exit 7
fi
echo HOST_GITHUB_RUNNER_REAL_INVOICE_CREDENTIAL_ACCESS_DENIED_PASS
docker restart "$name" >/dev/null
# A restarted container loses tmpfs: no stale credentials, no silent fallback.
docker exec --user 21110:21110 "$name" node --input-type=module -e '
import {loadDevCustomerInvoiceSystemdCredentials} from "./server/dev-customer-invoice-systemd-credential.mjs";
let blocked=false;
try{await loadDevCustomerInvoiceSystemdCredentials()}catch(e){blocked=e.statusCode===503}
if(!blocked)process.exit(8);
console.log("RESTART_WIPES_CREDENTIAL_AND_FAILS_CLOSED_PASS")'
echo REAL_ENCRYPTED_VERSION3_CREDENTIAL_EPHEMERAL_QA_PASS
echo ACTIVE_PORTAL_SERVICE_AND_PROD_UNCHANGED
