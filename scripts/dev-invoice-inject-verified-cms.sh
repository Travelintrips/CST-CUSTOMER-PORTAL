#!/usr/bin/env bash
# Root-only, opt-in CST-DEV. Never bind real credentials from host.
# Feed authenticated CMS ciphertext to the unique Invoice UID's private
# Docker tmpfs using stdin. No plaintext env, argv, disk, or logs.
set -euo pipefail
umask 077
container="${1:-cst-customer-portal-dev}"
preflight_only=0
if [[ "$container" == "--preflight" ]]; then preflight_only=1; fi
transport="/etc/cst-invoice-dev/transport"
cms="$transport/invoice-writer-version2.cms"
manifest="$transport/invoice-writer-version2.manifest.json"
cert="$transport/invoice-envelope-cert.pem"
private="$transport/invoice-envelope-private.pem"
digest="38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334"
issuer_sha="d9cc4417d618891302efec3463eacd84f0b7f0e7"
version="projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies/versions/2"

if [[ "$(id -u)" != 0 || ( "$preflight_only" != 1 &&
      "$container" != "cst-customer-portal-dev" &&
      "$container" != cst-invoice-private-tmpfs-qa-* ) ]]; then
  echo "INVOICE_DEV_ROOT_OR_CONTAINER_IDENTITY_MISMATCH" >&2; exit 2
fi
for item in "$cms" "$manifest" "$private"; do
  if [[ ! -f "$item" || -L "$item" || "$(stat -c '%u:%g:%a' "$item")" != "0:0:600" ]]; then
    echo "INVOICE_DEV_ENCRYPTED_ARTIFACT_OWNER_OR_MODE_INVALID" >&2; exit 3
  fi
done
test -f "$cert" && ! test -L "$cert"
actual_cert="$(openssl x509 -in "$cert" -outform DER | sha256sum | cut -d' ' -f1)"
if [[ "$actual_cert" != "$digest" ]];then
  echo "INVOICE_DEV_RECIPIENT_CERT_MISMATCH" >&2; exit 4
fi
python3 - "$manifest" "$cms" "$digest" "$issuer_sha" "$version" <<'PY'
import json,hashlib,pathlib,sys
m=json.loads(pathlib.Path(sys.argv[1]).read_text())
h=hashlib.sha256(pathlib.Path(sys.argv[2]).read_bytes()).hexdigest()
assert set(m)=={'source_sha','certificate_sha256','envelope_sha256',
 'secret_version','credential_count','format'}
assert m['source_sha']==sys.argv[4], 'issuer SHA mismatch'
assert m['certificate_sha256']==sys.argv[3]
assert m['secret_version']==sys.argv[5], 'wrong or rotated secret'
assert m['envelope_sha256']==h
assert m['credential_count']==2 and m['format']=='CMS-AES-256-GCM'
print("INVOICE_DEV_ROOT_ONLY_ENCRYPTED_ARTIFACT_MANIFEST_PASS")
PY
if [[ "$preflight_only" == 1 ]]; then
  echo "INVOICE_DEV_ENCRYPTED_BUNDLE_ROOT_ONLY_PREFLIGHT_PASS"
  exit 0
fi
if [[ "$(docker inspect "$container" --format '{{.State.Running}}' 2>/dev/null)" != true ]]; then
 echo "INVOICE_DEV_CONTAINER_NOT_RUNNING" >&2;exit 5
fi
effective="$(docker exec --user 21110:21110 "$container" id -u)"
if [[ "$effective" != 21110 ]];then
 echo "INVOICE_DEV_UNIQUE_CONTAINER_UID_MISMATCH" >&2;exit 6
fi
# Node injector verifies tmpfs fs type, unique UID, exact schema,
# exact both tenant DSNs, and pinned Supabase root public CA.
# Nothing passes through host plaintext files or docker inspect Env.
openssl cms -decrypt -binary -inform DER -in "$cms" -recip "$cert" \
 -inkey "$private" \
 | docker exec -i --user 21110:21110 "$container" \
    node /app/scripts/dev-invoice-tmpfs-inject.mjs
echo "INVOICE_DEV_VERIFIED_CIPHERTEXT_TO_PRIVATE_DOCKER_TMPFS_PASS"
