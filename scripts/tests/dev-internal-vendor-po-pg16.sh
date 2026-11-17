#!/usr/bin/env bash
# PostgreSQL 16 test on an internal Docker network, synthetic data only.
set -euo pipefail
name=dev-internal-po-accept-pg16
network=dev-internal-po-accept-net
for image in postgres:16-alpine node:22-alpine; do
  if ! docker image inspect "$image" >/dev/null 2>&1; then
    docker pull "$image"
  fi
done
if docker ps -aq --filter "name=^/$name$" | grep -q .; then
  echo REFUSE_EXISTING_CONTAINER >&2; exit 2
fi
if docker network ls --format '{{.Name}}' | grep -qx "$network"; then
  echo REFUSE_EXISTING_NETWORK >&2; exit 2
fi
cleanup() {
  docker rm -f "$name" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker network create --internal "$network" >/dev/null
docker run --pull never -d --rm --name "$name" --network "$network" \
  --memory 350m --cpus 1 \
  --tmpfs /var/lib/postgresql/data:rw,size=128m,mode=1777 \
  -e POSTGRES_PASSWORD=synthetic-only postgres:16-alpine >/dev/null
ready=0
for i in $(seq 1 80); do
  if docker exec "$name" pg_isready -h 127.0.0.1 -U postgres -q >/dev/null 2>&1; then
    ready=1; break
  fi
  sleep 0.25
done
if [ "$ready" -ne 1 ]; then echo PG16_NOT_READY >&2; exit 1; fi
docker run --pull never --rm --network "$network" --memory 450m --cpus 1 \
  -v "$PWD:/app:ro" -v "$(realpath "$PWD/node_modules"):/app/node_modules:ro" \
  -w /app -e PGHOST="$name" -e PGPORT=5432 -e PGUSER=postgres \
  -e PGPASSWORD=synthetic-only -e PGDATABASE=postgres \
  node:22-alpine node scripts/tests/dev-internal-vendor-po-pg16.mjs
