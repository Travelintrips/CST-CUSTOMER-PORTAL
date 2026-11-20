#!/usr/bin/env bash
# Public CA only; does not connect to Supabase or use database credentials.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"
sha="700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7"
path="ops/dev-supabase-root-2021.crt"
test -s "$path"
test "$(sha256sum "$path" | cut -d' ' -f1)" = "$sha"
openssl x509 -in "$path" -noout -checkend 86400 >/dev/null
test "$(grep -Fc 'COPY --from=build /app/ops/dev-supabase-root-2021.crt /opt/cst-dev-finance-tls/supabase-root-2021.crt' Dockerfile.dev-vps)" -eq 1
echo PINNED_SUPABASE_PUBLIC_CA_HASH_AND_DOCKERFILE_PASS
image="cst-invoice-dev-public-ca-qa:${GITHUB_SHA:-local}"
docker build --pull=false -f Dockerfile.dev-vps --build-arg DEV_RELEASE_SHA="${GITHUB_SHA:-local}" -t "$image" . >/dev/null
docker run --rm --network none --read-only --cap-drop ALL \
  --pids-limit 32 --memory 256m --cpus 0.5 --security-opt no-new-privileges \
  --entrypoint node "$image" -e '
const fs=require("node:fs"),crypto=require("node:crypto");
const p="/opt/cst-dev-finance-tls/supabase-root-2021.crt";
const c=fs.readFileSync(p);
const h=crypto.createHash("sha256").update(c).digest("hex");
if(h!=="700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7")process.exit(8);
if(process.getuid()!==1000)process.exit(9);
console.log("RUNNING_PORTAL_IMAGE_PINNED_CA_ACCESSIBLE_AS_NODE_PASS");
'
echo NO_SECRET_KEY_OR_POSTGRES_PASSWORD_IN_IMAGE_QA_PASS
