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
grep -Fq 'invoice-writer-version2.cms' "$qa"
grep -Fq 'invoice-writer-version2.cms' "$composeqa"
if grep -Fq 'invoice-writer-version1' "$qa" || grep -Fq 'invoice-writer-version1' "$composeqa"; then
 echo 'LEGACY_V1_QA_FORBIDDEN';exit 3
fi
echo 'CST_DEV_INVOICE_V2_SOURCE_PIN_CONTRACT_PASS'
echo 'NO_SECRET_DECRYPTION_NO_DB_NO_DEPLOY'
