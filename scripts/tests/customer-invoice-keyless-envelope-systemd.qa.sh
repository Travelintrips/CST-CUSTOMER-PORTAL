#!/usr/bin/env bash
# Synthetic-only QA: GitHub OIDC -> encrypted artifact -> root-only tmpfs ->
# systemd LoadCredential -> non-root Customer Invoice DEV loader.
# Never reads Secret Manager versions or alters running Portal/DB.
set -euo pipefail
umask 077
repo="Travelintrips/CST-CUSTOMER-PORTAL"
run="${1:?Provide the exact approved GitHub Actions run ID}"
sha="${2:?Provide exact trusted GitHub commit SHA}"
test "$run" = "44382113871" || { echo "UNAPPROVED_QA_RUN"; exit 5; }
test "$sha" = "790c2312ef920db241249b8ef415ede0d768702e" || { echo "UNAPPROVED_QA_HEAD"; exit 6; }
test "$(stat -f -c '%T' /run)" = tmpfs
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
certificate=/etc/cst-invoice-dev/transport/invoice-envelope-cert.pem
private=/etc/cst-invoice-dev/transport/invoice-envelope-private.pem
fingerprint="38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334"
test "$(stat -c '%a' "$private")" = 600
actual="$(openssl x509 -in "$certificate" -outform DER | sha256sum | cut -d' ' -f1)"
test "$fingerprint" = "$actual"
status="$(gh run view "$run" -R "$repo" --json conclusion,event,headSha,headBranch,workflowName --jq 'if .conclusion=="success" and .event=="push" and .headSha=="790c2312ef920db241249b8ef415ede0d768702e" and .headBranch=="test/dev-customer-invoice-gcp-secret-reader-20261119" and .workflowName=="CST Invoice DEV — keyless Secret Manager IAM proof" then "PASS" else "FAIL" end')"
test "$status" = PASS
echo GITHUB_WORKFLOW_AND_SHA_PROVENANCE_PASS
work="$(mktemp -d /run/cst-invoice-keyless-systemd-e2e.XXXXXXXX)"
trap 'rm -rf -- "$work"' EXIT
chmod 700 "$work"
gh run download "$run" -R "$repo" -n cst-invoice-dev-encrypted-envelope-synthetic -D "$work" >/dev/null
test -s "$work/invoice-envelope.cms"
test -s "$work/invoice-envelope-manifest.json"
python3 - "$work/invoice-envelope-manifest.json" "$work/invoice-envelope.cms" "$sha" "$fingerprint" <<'PY'
import hashlib,json,pathlib,sys
m=json.loads(pathlib.Path(sys.argv[1]).read_text())
h=hashlib.sha256(pathlib.Path(sys.argv[2]).read_bytes()).hexdigest()
assert set(m)=={'qa_only','source_sha','certificate_sha256','envelope_sha256','format'}
assert m['qa_only'] is True and m['source_sha']==sys.argv[3]
assert m['certificate_sha256']==sys.argv[4]
assert m['envelope_sha256']==h and m['format']=='CMS-AES-256-GCM'
print('ARTIFACT_CIPHERTEXT_SHA256_VERIFIED_PASS')
PY
openssl cms -decrypt -binary -inform DER -in "$work/invoice-envelope.cms" \
 -recip "$certificate" -inkey "$private" \
 -out "$work/customer-invoice-writers-dev.json"
chmod 0600 "$work/customer-invoice-writers-dev.json"
python3 - "$work/customer-invoice-writers-dev.json" <<'PY'
import json,sys,pathlib
obj=json.loads(pathlib.Path(sys.argv[1]).read_text())
expected={'APP_ENV','SUPABASE_PROJECT_REF',
 'CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV',
 'CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV'}
assert set(obj)==expected and obj['APP_ENV']=='development'
assert obj['SUPABASE_PROJECT_REF']=='xssrfshdrtdfupgqwfdw'
for name in ['CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV',
 'CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV']:
 assert ':synthetic-only-qa@' in obj[name], 'Only QA placeholders permitted'
assert obj['CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV']!=obj['CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV']
print('SYNTHETIC_COMPANY_SCOPED_QA_BUNDLE_ONLY_PASS')
PY
unit="cst-invoice-github-to-systemd-qa-$$"
systemd-run --unit="$unit" --wait --pipe --collect --quiet \
 -p DynamicUser=yes -p NoNewPrivileges=yes \
 -p ProtectSystem=strict -p ProtectHome=yes -p PrivateTmp=yes \
 -p PrivateNetwork=yes \
 -p Environment=APP_ENV=development \
 -p Environment=NODE_ENV=development \
 -p Environment=CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true \
 -p Environment=CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true \
 -p Environment=CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true \
 -p LoadCredential=customer-invoice-writers-dev.json:"$work/customer-invoice-writers-dev.json" \
 /usr/bin/node --input-type=module -e "
import {loadDevCustomerInvoiceSystemdCredentials} from '$root/server/dev-customer-invoice-systemd-credential.mjs';
const d=await loadDevCustomerInvoiceSystemdCredentials();
if(!d.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV.includes(':synthetic-only-qa@')
  || !d.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV.includes(':synthetic-only-qa@'))process.exit(8);
console.log('ROOTLESS_SYSTEMD_CREDENTIAL_READER_E2E_PASS');
console.log('NO_REAL_INVOICE_DSN_OR_GCP_SERVICE_ACCOUNT_KEY');
"
echo GITHUB_KEYLESS_ENVELOPE_TO_NONROOT_SYSTEMD_QA_PASS
echo ACTIVE_CUSTOMER_PORTAL_AND_PROD_UNCHANGED
