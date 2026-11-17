#!/usr/bin/env bash
# Repeatable isolated SQL contract test for one existing vendor WA queue claim.
set -euo pipefail
cd "$(dirname "$0")/../.."
docker image inspect postgres:16-alpine >/dev/null
NAME="cst-vendor-wa93-pg16-$$"
SQL_FILE="$(mktemp)"
OUT1="$(mktemp)"
OUT2="$(mktemp)"
cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  rm -f "$SQL_FILE" "$OUT1" "$OUT2"
}
trap cleanup EXIT

docker run --rm -d --name "$NAME" --network none \
  -e POSTGRES_PASSWORD=synthetic-contract-only postgres:16-alpine >/dev/null
READY=0
for i in $(seq 1 100); do
  if docker exec "$NAME" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then READY=1; break; fi
  sleep 0.25
done
if test "$READY" -ne 1; then echo "Isolated PostgreSQL 16 did not become ready"; exit 1; fi

cat > "$SQL_FILE" <<'SQL'
CREATE TABLE public.mkt_rfqs (id integer primary key, rfq_number text, company_id integer);
CREATE TABLE public.suppliers (
  id integer primary key, name text, phone text, contact_person text,
  company_id integer, is_active boolean, is_verified boolean
);
CREATE TABLE public.mkt_vendor_quotes (
  id integer primary key, rfq_id integer, vendor_id integer, status text,
  token text, valid_until timestamptz
);
CREATE TABLE public.mkt_notification_queue (
  id integer primary key, rfq_id integer, vendor_quote_id integer,
  recipient_id integer, recipient_phone text, recipient_type text,
  event_type text, channel text,
  status text CONSTRAINT mkt_notification_queue_status_check
    CHECK (status IN ('pending','sending','sent','failed','retrying','exhausted')),
  attempt_count integer,
  sent_at timestamptz, payload_json jsonb, last_error text,
  next_retry_at timestamptz, updated_at timestamptz default now()
);
INSERT INTO public.mkt_rfqs VALUES (23,'RFQ-SYNTHETIC',1);
INSERT INTO public.suppliers VALUES (24,'Supplier Test','081234567890','PIC Test',1,true,true);
INSERT INTO public.mkt_vendor_quotes
  VALUES (18,23,24,'invited',repeat('x',48),now()+interval '5 days');
INSERT INTO public.mkt_notification_queue
  (id,rfq_id,vendor_quote_id,recipient_id,recipient_phone,recipient_type,event_type,channel,status,attempt_count)
VALUES
  (93,23,18,24,null,'vendor','rfq_vendor_invited','whatsapp','pending',0),
  (94,99,99,24,null,'vendor','rfq_vendor_invited','whatsapp','pending',0);
SQL

APP_ENV=development NODE_ENV=test SUPABASE_DATABASE_URL_DEV=postgresql://ci:ci@127.0.0.1:5432/ci node --input-type=module <<'NODE' >> "$SQL_FILE"
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const { DEV_VENDOR_INVITE_CLAIM_SQL, DEV_VENDOR_INVITE_SELECT_SQL, DEV_VENDOR_GATEWAY_ACK_SQL } = await import(
  pathToFileURL(join(process.cwd(), "server/dev-vendor-wa-invite.mjs")).href
);
console.log("PREPARE invite_read (integer,integer,integer) AS " + DEV_VENDOR_INVITE_SELECT_SQL + ";");
console.log("EXECUTE invite_read(93,23,18);");
console.log("CREATE FUNCTION public.try_claim_queue(integer,integer,integer,integer,text,text,text)");
console.log("RETURNS integer LANGUAGE sql VOLATILE AS $$");
console.log("WITH changed AS (" + DEV_VENDOR_INVITE_CLAIM_SQL + ")");
console.log("SELECT count(*)::integer FROM changed;");
console.log("$$;");
console.log("CREATE FUNCTION public.try_gateway_ack(integer,text,text)");
console.log("RETURNS integer LANGUAGE sql VOLATILE AS $$");
console.log("WITH changed AS (" + DEV_VENDOR_GATEWAY_ACK_SQL + ")");
console.log("SELECT count(*)::integer FROM changed;");
console.log("$$;");
NODE

docker exec -i "$NAME" psql -U postgres -d postgres -q -v ON_ERROR_STOP=1 \
  < "$SQL_FILE" >/dev/null

# Fail-closed: wrong quote, PIC or phone must not claim queue #93.
for CALL in \
  "93,23,19,24,repeat('x',48),'081234567890','PIC Test'" \
  "93,23,18,24,repeat('x',48),'081234567890','Wrong PIC'" \
  "93,23,18,24,repeat('x',48),'081200000000','PIC Test'"; do
  RESULT="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 \
    -c "select public.try_claim_queue($CALL)")"
  test "$RESULT" = "0" || { echo "FAIL: invalid claim accepted"; exit 1; }
done

# Two separate PostgreSQL sessions concurrently race for the SAME pending row.
CLAIM="select public.try_claim_queue(93,23,18,24,repeat('x',48),'081234567890','PIC Test')"
docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "$CLAIM" > "$OUT1" &
P1=$!
docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "$CLAIM" > "$OUT2" &
P2=$!
wait "$P1"; wait "$P2"
RESULTS="$(cat "$OUT1" "$OUT2" | sort | tr '\n' ' ')"
test "$RESULTS" = "0 1 " || { echo "FAIL: concurrent claim result=$RESULTS"; exit 1; }
STATUS="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c \
  "select (select status from public.mkt_notification_queue where id=93)||'/'||(select attempt_count from public.mkt_notification_queue where id=93)||'/'||(select status from public.mkt_notification_queue where id=94)")"
test "$STATUS" = "sending/1/pending" || { echo "FAIL: status=$STATUS"; exit 1; }

# Reproduce the ACTUAL CST-DEV schema defect first: the historical CHECK
# rejects queued despite the gateway integration requiring it.
if docker exec "$NAME" psql -U postgres -d postgres -q -v ON_ERROR_STOP=1 \
  -c "update public.mkt_notification_queue set status='queued' where id=93" \
  >/dev/null 2>&1; then
  echo "FAIL: historical status CHECK unexpectedly allowed queued"
  exit 1
fi

# Apply the exact migration to the isolated database, not CST-DEV or PROD.
docker exec -i "$NAME" psql -U postgres -d postgres -q -v ON_ERROR_STOP=1 \
  < supabase/migrations/20261117093000_accept_cst_gateway_queued_status.sql \
  >/dev/null

# Gateway acceptance must persist QUEUED and the provider receipt ID, without
# pretending that WhatsApp has already been sent.
GATEWAY_ID="123e4567-e89b-12d3-a456-426614174000"
ACK="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "select public.try_gateway_ack(93,'$GATEWAY_ID','queued')")"
test "$ACK" = "1" || { echo "FAIL: gateway acknowledgement not persisted"; exit 1; }
ACK_REPLAY="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "select public.try_gateway_ack(93,'$GATEWAY_ID','queued')")"
test "$ACK_REPLAY" = "0" || { echo "FAIL: gateway acknowledgement replay modified queue"; exit 1; }
FINAL="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "select
  (select status from public.mkt_notification_queue where id=93)||'/'||
  (select attempt_count from public.mkt_notification_queue where id=93)||'/'||
  (select payload_json->'gateway_delivery'->>'message_id' from public.mkt_notification_queue where id=93)||'/'||
  (select coalesce(sent_at is null,false) from public.mkt_notification_queue where id=93)||'/'||
  (select status from public.mkt_notification_queue where id=94)")"
test "$FINAL" = "queued/1/$GATEWAY_ID/true/pending" || { echo "FAIL: queued semantics=$FINAL"; exit 1; }
echo "PASS: PostgreSQL 16 isolated, 3 invalid claims rejected, 2 concurrent claims -> exactly 1; provider queued receipt persisted, sent_at NULL, unrelated queue untouched"
