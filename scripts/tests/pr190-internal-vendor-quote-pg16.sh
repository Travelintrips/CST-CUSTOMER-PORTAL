#!/usr/bin/env bash
# Real PostgreSQL 16 transaction test. Container has no network and no host TCP port.
set -euo pipefail
name="pr190-internal-vendor-quote-pg16"
image="${PR190_PG_IMAGE:-postgres:16-alpine}"
if ! docker image inspect "$image" >/dev/null 2>&1; then
  docker pull "$image"
fi
if docker ps -aq --filter "name=^/${name}$" | grep -q .; then
  echo "REFUSE_EXISTING_CONTAINER: $name" >&2
  exit 1
fi
tmp="$(mktemp -d /tmp/pr190-internal-quote.XXXXXX)"
mkdir -p "$tmp/socket"
chmod 0777 "$tmp/socket"
cleanup() {
  docker rm -f "$name" >/dev/null 2>&1 || true
  rm -rf "$tmp"
}
trap cleanup EXIT

docker run --pull never -d --rm --name "$name" --network none \
  --memory 400m --cpus 1 \
  --tmpfs /var/lib/postgresql/data:rw,size=128m,mode=1777 \
  -v "$tmp/socket:/var/run/postgresql" \
  -e POSTGRES_PASSWORD=synthetic-only "$image" >/dev/null
for i in $(seq 1 60); do
  docker exec "$name" pg_isready -U postgres -q >/dev/null 2>&1 && break
  sleep 0.25
done
docker exec "$name" pg_isready -U postgres -q
test -S "$tmp/socket/.s.PGSQL.5432"

PGHOST="$tmp/socket" PGPORT=5432 PGUSER=postgres PGPASSWORD=synthetic-only \
PGDATABASE=postgres TZ=Asia/Jakarta node scripts/tests/pr190-internal-vendor-quote-pg16.mjs

echo "DISPOSABLE_POSTGRES16_INTERNAL_VENDOR_QUOTE_PASS"
