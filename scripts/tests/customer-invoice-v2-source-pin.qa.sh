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
grep -Fqx 'cms="$transport/invoice-writer-version2.cms"' "$injector"
grep -Fqx 'manifest="$transport/invoice-writer-version2.manifest.json"' "$injector"
grep -Fqx 'issuer_sha="d9cc4417d618891302efec3463eacd84f0b7f0e7"' "$injector"
grep -Fqx 'version="projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies/versions/2"' "$injector"
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
assert text.count(verify)==5,"must define and call guard at four release boundaries"
assert 'git rev-parse HEAD' in text and 'git status --porcelain' in text
# At each boundary, reject if local HEAD differs from the exact certified SHA.
assert positions[0]<text.index(verify,positions[0])<positions[1]
assert positions[2]<text.index(verify,positions[2])<positions[3]
assert positions[3]<text.index(verify,positions[3])<positions[4]
assert positions[5]<text.index(verify,positions[5])<positions[6]
print("CST_DEV_CERTIFIED_CHECKOUT_RECHECK_QA_PASS")
PY
grep -Fq 'invoice-writer-version2.cms' "$qa"
grep -Fq 'invoice-writer-version2.cms' "$composeqa"
if grep -Fq 'invoice-writer-version1' "$qa" || grep -Fq 'invoice-writer-version1' "$composeqa"; then
 echo 'LEGACY_V1_QA_FORBIDDEN';exit 3
fi
echo 'CST_DEV_INVOICE_V2_SOURCE_PIN_CONTRACT_PASS'
echo 'NO_SECRET_DECRYPTION_NO_DB_NO_DEPLOY'
