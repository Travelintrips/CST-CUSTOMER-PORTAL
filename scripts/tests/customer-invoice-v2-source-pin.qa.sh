#!/usr/bin/env bash
# Source-only QA: no decryption, no secrets, no Docker/DB connection.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
injector="$ROOT/scripts/dev-invoice-inject-verified-cms.sh"
guard="$ROOT/scripts/dev-invoice-compose-guard.sh"
qa="$ROOT/scripts/tests/customer-invoice-real-encrypted-tmpfs-dev.qa.sh"
composeqa="$ROOT/scripts/tests/customer-invoice-compose-credential-override.qa.sh"
bash -n "$injector"
bash -n "$guard"
bash -n "$qa"
bash -n "$composeqa"
grep -Fqx 'cms="$transport/invoice-writer-version3.cms"' "$injector"
grep -Fqx 'manifest="$transport/invoice-writer-version3.manifest.json"' "$injector"
grep -Fqx 'issuer_sha="d1bf3cdaa7c8a5b2cd52fc2b5de7dc2b53664585"' "$injector"
grep -Fqx 'version="projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies/versions/3"' "$injector"
if grep -Fq 'invoice-writer-version1' "$injector"; then
 echo 'LEGACY_V1_INJECTOR_FORBIDDEN';exit 2
fi
grep -Fq 'INVOICE_DEV_ROOT_OR_CONTAINER_IDENTITY_MISMATCH' "$injector"
grep -Fq 'INVOICE_DEV_ENCRYPTED_ARTIFACT_OWNER_OR_MODE_INVALID' "$injector"
grep -Fq 'actualPath' "$guard" 2>/dev/null || true
grep -Fq 'preflight_only' "$injector"
grep -Fq 'docker exec -i --user 21110:21110' "$injector"
grep -Fq 'openssl cms -decrypt -binary -inform DER' "$injector"
grep -Fq 'CST_INVOICE_DEV_PRIVATE_TMPFS:-false' "$guard"
grep -Fq 'CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV' "$guard"
deploy="$ROOT/scripts/deploy-certified-vps.sh"
bash -n "$deploy"
python3 - "$deploy" <<'PY'
from pathlib import Path
import sys
text=Path(sys.argv[1]).read_text()
verify='assert_exact_certified_checkout'
checks=[
 'git merge --ff-only "$certified_sha"',
 'CI=true pnpm install --frozen-lockfile',
 'pnpm typecheck >/dev/null',
 'nice -n 15 ionice -c3 timeout 240 docker build',
 'backup=0',
 'docker tag cst-customer-portal-dev:candidate cst-customer-portal-dev:local',
 'if ! DEV_RELEASE_SHA="$certified_sha" docker compose',
]
positions=[text.index(c) for c in checks]
assert positions==sorted(positions),"deploy source order drift"
assert text.count(verify)==7,"must define and call guard at boot recovery and four release boundaries"
source='assert_certified_invoice_handler'
assert text.count(source)==4,"must define hash verifier and call for live/candidate/local"
fast=text.index('if [[ "$running_sha" == "$certified_sha" ]]; then')
ready=text.index('echo "[dev-deploy] Already healthy at certified release')
assert fast<text.index('assert_certified_invoice_handler live',fast)<ready
postbuild=text.index('nice -n 15 ionice -c3 timeout 240 docker build')
tag=text.index('docker tag cst-customer-portal-dev:candidate cst-customer-portal-dev:local')
assert postbuild<text.index('assert_certified_invoice_handler candidate',postbuild)<tag
assert '"$certified_sha:server/billing-operations.mjs"' in text
assert 'docker exec cst-customer-portal-dev sha256sum' in text
assert 'pnpm exec vitest run --maxWorkers=1 --no-file-parallelism' in text
assert 'pnpm test -- --maxWorkers=1' not in text
print("CST_DEV_VITEST_SINGLE_WORKER_CLI_QA_PASS")
assert '--network none --read-only' in text

assert 'git rev-parse HEAD' in text and 'git status --porcelain' in text
# At each boundary, reject if local HEAD differs from the exact certified SHA.
assert positions[0]<text.index(verify,positions[0])<positions[1]
assert positions[2]<text.index(verify,positions[2])<positions[3]
assert positions[3]<text.index(verify,positions[3])<positions[4]
assert positions[5]<text.index(verify,positions[5])<positions[6]
print("CST_DEV_CERTIFIED_CHECKOUT_RECHECK_QA_PASS")
boot=text.index('# Reboot-only recovery via the EXISTING certified systemd timer')
end=text.index('running_sha="$(curl -fsS',boot)
recovery=text[boot:end]
assert end<positions[0],"reboot recovery must precede full build"
for token in ('CST_INVOICE_DEV_PRIVATE_TMPFS:-false','CST_INVOICE_DEV_FORCE_CREDENTIAL_REFRESH:-false',
              'git rev-parse HEAD','boot_running_id','boot_local_id','boot_user','boot_state','boot_restart','boot_project','boot_service',
              'PORTAL_RELEASE_ID=$certified_sha','APP_ENV=development','NODE_ENV=development',
              'CREDENTIALS_DIRECTORY=/run/credentials/','CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true',
              'CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true',
              'CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true'):
    assert token in recovery,"missing reboot identity guard: "+token
assert '"$boot_state" =~ ^(running|restarting)$' in recovery
assert '"$boot_restart" == "unless-stopped"' in recovery
assert recovery.index('"$boot_state" =~') < recovery.index('assert_certified_invoice_handler local')
assert recovery.index('assert_exact_certified_checkout') < recovery.index('assert_certified_invoice_handler local') < recovery.index('bash ./scripts/dev-invoice-inject-verified-cms.sh')
assert recovery.index('bash ./scripts/dev-invoice-inject-verified-cms.sh') < recovery.index('PASS: verified reboot-only V3 credential recovery')
assert 'docker compose' not in recovery and 'docker build' not in recovery
assert 'exit 1' in recovery and 'exit 0' in recovery
assert 'if [[ "$target" == candidate || "$target" == local ]]' in text
assert '--pull never --network none --read-only' in text
print("CST_DEV_REBOOT_V3_IDENTITY_SOURCE_ONLY_QA_PASS")

PY
python3 - "$deploy" <<'PY'
# Exercise the real helper from the release script against a throwaway local
# Git repo. Never source the deployment script or touch the active release.
import re,subprocess,tempfile,shlex,sys
from pathlib import Path
source=Path(sys.argv[1]).read_text()
match=re.search(r"(?ms)^assert_exact_certified_checkout\(\) \{\n.*?^\}",source)
assert match,"certified SHA guard missing"
fn=match.group(0)
def git(root,*args):
    return subprocess.run(["git",*args],cwd=root,text=True,capture_output=True,check=True).stdout.strip()
def probe(root,expected):
    script="set -euo pipefail\n"+fn+"\ncertified_sha="+shlex.quote(expected)+"\nassert_exact_certified_checkout"
    return subprocess.run(["bash","-c",script],cwd=root,text=True,capture_output=True).returncode
with tempfile.TemporaryDirectory(prefix="cst-certified-sha-fixture-") as temp:
    root=Path(temp)
    git(root,"init","-q","-b","main")
    git(root,"config","user.name","CST-CI-QA")
    git(root,"config","user.email","qa@example.invalid")
    (root/"fixture.txt").write_text("certified")
    git(root,"add","fixture.txt")
    git(root,"commit","-qm","initial synthetic certified release")
    certified=git(root,"rev-parse","HEAD")
    assert probe(root,certified)==0,"exact clean certified commit refused"
    (root/"fixture.txt").write_text("dirty")
    assert probe(root,certified)!=0,"dirty worktree was not refused"
    git(root,"add","fixture.txt")
    git(root,"commit","-qm","new local commit after certification")
    assert probe(root,certified)!=0,"uncertified local commit was not refused"
    newest=git(root,"rev-parse","HEAD")
    assert probe(root,newest)==0,"new explicitly certified HEAD was not accepted"
print("CST_DEV_CERTIFIED_SHA_TOCTOU_NEGATIVE_TESTS_PASS")
PY
grep -Fq 'invoice-writer-version3.cms' "$qa"
grep -Fq 'invoice-writer-version3.cms' "$composeqa"
if grep -Fq 'invoice-writer-version1' "$qa" || grep -Fq 'invoice-writer-version1' "$composeqa"; then
 echo 'LEGACY_V1_QA_FORBIDDEN';exit 3
fi
echo 'CST_DEV_INVOICE_V3_SOURCE_PIN_CONTRACT_PASS'
echo 'NO_SECRET_DECRYPTION_NO_DB_NO_DEPLOY'
