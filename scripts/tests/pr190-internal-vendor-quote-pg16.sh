#!/usr/bin/env bash
# Real PostgreSQL 16 transaction test. Containers share an internal-only Docker
# network: no public route, host TCP port, production DB or external service.
set -euo pipefail
name="pr190-internal-vendor-quote-pg16"
network="pr190-internal-vendor-quote-net"
image="${PR190_PG_IMAGE:-postgres:16-alpine}"
node_image="${PR190_NODE_IMAGE:-node:22-alpine}"
for required in "$image" "$node_image"; do
  if ! docker image inspect "$required" >/dev/null 2>&1; then docker pull "$required"; fi
done
if docker ps -aq --filter "name=^/${name}$" | grep -q .; then
  echo "REFUSE_EXISTING_CONTAINER: $name" >&2
  exit 1
fi
if docker network ls --format '{{.Name}}' | grep -qx "$network"; then
  echo "REFUSE_EXISTING_NETWORK: $network" >&2
  exit 1
fi
cleanup() {
  docker rm -f "$name" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker network create --internal "$network" >/dev/null
docker run --pull never -d --rm --name "$name" --network "$network" \
  --memory 400m --cpus 1 \
  --tmpfs /var/lib/postgresql/data:rw,size=128m,mode=1777 \
  -e POSTGRES_PASSWORD=synthetic-only "$image" >/dev/null
for i in $(seq 1 60); do
  docker exec "$name" pg_isready -U postgres -q >/dev/null 2>&1 && break
  sleep 0.25
done
docker exec "$name" pg_isready -U postgres -q

docker run --pull never --rm --network "$network" \
  --memory 400m --cpus 1 \
  -v "$PWD:/app:ro" \
  -v "$(git -C "$PWD" rev-parse --show-toplevel)/node_modules:/app/node_modules:ro" \
  -w /app \
  -e PGHOST="$name" -e PGPORT=5432 -e PGUSER=postgres \
  -e PGPASSWORD=synthetic-only -e PGDATABASE=postgres -e TZ=Asia/Jakarta \
  "$node_image" node scripts/tests/pr190-internal-vendor-quote-pg16.mjs

echo "DISPOSABLE_POSTGRES16_INTERNAL_VENDOR_QUOTE_PASS"
