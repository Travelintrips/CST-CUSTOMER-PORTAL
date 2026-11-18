#!/usr/bin/env bash
# DEV-only QA. Synthetic credentials on tmpfs; never starts Portal or PostgreSQL.
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
test "$(stat -f -c %T /run)" = tmpfs
work="$(mktemp -d /run/cst-invoice-systemd-loadcredential-qa.XXXXXXXX)"
trap 'rm -rf -- "$work"' EXIT
python3 - "$work/customer-invoice-writers-dev.json" <<'PY'
import json,sys,os
ref='xssrfshdrtdfupgqwfdw'
host='aws-1-ap-southeast-2.pooler.supabase.com'
ca='/opt/cst-dev-finance-tls/supabase-root-2021.crt'
def synthetic(role):
 return f'postgresql://{role}.{ref}:synthetic-only@{host}:5432/postgres?sslmode=verify-full&sslrootcert={ca}'
data={
 'APP_ENV':'development','SUPABASE_PROJECT_REF':ref,
 'CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV':synthetic('bizportal_customer_invoice_cst_writer_dev'),
 'CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV':synthetic('bizportal_customer_invoice_diva_writer_dev'),
}
with open(sys.argv[1],'w') as f:json.dump(data,f)
os.chmod(sys.argv[1],0o600)
PY
unit="cst-invoice-systemd-credential-qa-$$"
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
import {loadDevCustomerInvoiceSystemdCredentials} from '$ROOT/server/dev-customer-invoice-systemd-credential.mjs';
const v=await loadDevCustomerInvoiceSystemdCredentials();
if(!v.CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV.includes('cst_writer_dev')
  || !v.CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV.includes('diva_writer_dev'))process.exit(9);
console.log('SYSTEMD_NONROOT_EPHEMERAL_CST_DIVA_CREDENTIAL_PASS');
console.log('NO_GOOGLE_SERVICE_ACCOUNT_KEY_OR_DATABASE_CONNECTION');
"
echo 'ORIGINAL_ACTIVE_PORTAL_NOT_RESTARTED'
