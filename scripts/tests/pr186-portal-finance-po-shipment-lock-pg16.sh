#!/usr/bin/env bash
# Synthetic, disposable DB only; deliberately no host ports or DB secrets.
set -euo pipefail
name="pr186-po-shipment-lock-ci"
image="postgres:16-alpine"
if ! docker image inspect "$image" >/dev/null 2>&1; then
  echo "OFFLINE_PG16_IMAGE_REQUIRED" >&2;exit 1
fi
if docker ps -aq --filter "name=^/${name}$" | grep -q .; then
  echo "REFUSE_EXISTING_CONTAINER" >&2;exit 1
fi
tmp=$(mktemp -d /tmp/pr186-portal-finance.XXXXXX)
trap 'docker rm -f "$name" >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT
docker run --pull never -d --rm --name "$name" --network none \
  --memory 400m --cpus 1 --tmpfs /var/lib/postgresql/data:rw,size=128m,mode=1777 \
  -e POSTGRES_PASSWORD=synthetic-only "$image" >/dev/null
for i in $(seq 1 40); do
  docker exec "$name" pg_isready -U postgres -q >/dev/null 2>&1 && break
  sleep 0.3
done
docker exec "$name" pg_isready -U postgres -q
docker exec "$name" psql -X -v ON_ERROR_STOP=1 -U postgres -q \
  -c "CREATE TABLE po(id integer PRIMARY KEY);
      CREATE TABLE gr(id integer PRIMARY KEY);
      CREATE TABLE shipment(id integer PRIMARY KEY, po_id integer NOT NULL);
      INSERT INTO po VALUES (11); INSERT INTO gr VALUES (13);
      INSERT INTO shipment VALUES (12,11);"
# Both acquisition orders now start with PO; regardless of which begins first,
# neither transaction can hold Shipment while waiting for PO.
run_pair() {
  local first="$1" second="$2" a b
  if [ "$first" = "portal" ]; then
    local first_sql="BEGIN; SET LOCAL lock_timeout='4s'; SELECT po_id FROM shipment WHERE id=12; SELECT id FROM po WHERE id=11 FOR UPDATE; SELECT pg_sleep(1.2); SELECT id FROM shipment WHERE id=12 FOR UPDATE; SELECT id FROM po WHERE id=11 FOR UPDATE; COMMIT;"
    local second_sql="BEGIN; SET LOCAL lock_timeout='4s'; SELECT id FROM po WHERE id=11 FOR UPDATE; SELECT id FROM gr WHERE id=13 FOR UPDATE; SELECT id FROM shipment WHERE id=12 FOR UPDATE; COMMIT;"
  else
    local first_sql="BEGIN; SET LOCAL lock_timeout='4s'; SELECT id FROM po WHERE id=11 FOR UPDATE; SELECT pg_sleep(1.2); SELECT id FROM gr WHERE id=13 FOR UPDATE; SELECT id FROM shipment WHERE id=12 FOR UPDATE; COMMIT;"
    local second_sql="BEGIN; SET LOCAL lock_timeout='4s'; SELECT po_id FROM shipment WHERE id=12; SELECT id FROM po WHERE id=11 FOR UPDATE; SELECT id FROM shipment WHERE id=12 FOR UPDATE; SELECT id FROM po WHERE id=11 FOR UPDATE; COMMIT;"
  fi
  docker exec "$name" psql -X -v ON_ERROR_STOP=1 -U postgres -q -c "$first_sql" >"$tmp/$first.log" 2>&1 &
  a=$!
  sleep 0.25
  docker exec "$name" psql -X -v ON_ERROR_STOP=1 -U postgres -q -c "$second_sql" >"$tmp/$second.log" 2>&1 &
  b=$!
  wait "$a" || { cat "$tmp/$first.log"; exit 1; }
  wait "$b" || { cat "$tmp/$second.log"; exit 1; }
  if grep -qiE "40P01|deadlock detected|55P03" "$tmp/$first.log" "$tmp/$second.log";then
    echo "LOCK_RETRY_OR_DEADLOCK_DETECTED" >&2;exit 1
  fi
  echo "${first}_FIRST_PO_LOCK_ORDER_PASS"
}
run_pair portal finance
run_pair finance portal
docker exec "$name" psql -X -v ON_ERROR_STOP=1 -U postgres -q -tAc \
  "SELECT (SELECT count(*) FROM po)=1 AND (SELECT count(*) FROM shipment)=1 AND (SELECT count(*) FROM gr)=1" | grep -qx t
echo "DISPOSABLE_PO_SHIPMENT_NO_DEADLOCK_PASS"
