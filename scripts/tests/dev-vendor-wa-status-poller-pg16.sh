#!/usr/bin/env bash
# Test only the new DEV status-poller SELECT on PostgreSQL 16 with no network.
set -euo pipefail
cd "$(dirname "$0")/../.."
NAME="cst-wa-status-read-pg16-$$"
SQL="$(mktemp)"
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true;rm -f "$SQL"' EXIT
docker run --rm -d --name "$NAME" --network none -e POSTGRES_PASSWORD=test-only postgres:16-alpine >/dev/null
for i in $(seq 1 100);do
 if docker exec "$NAME" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1;then break;fi
 sleep 0.2
done
cat > "$SQL" <<'SQL'
create table public.mkt_rfqs(id integer primary key,company_id integer);
create table public.suppliers(id integer primary key,company_id integer);
create table public.mkt_vendor_quotes(id integer primary key,rfq_id integer,vendor_id integer);
create table public.mkt_notification_queue(id integer primary key,rfq_id integer,vendor_quote_id integer,
recipient_id integer,recipient_type text,channel text,event_type text,status text,attempt_count integer,
sent_at timestamptz,payload_json jsonb);
insert into public.mkt_rfqs values(23,1),(24,1),(25,1),(26,2);
insert into public.suppliers values(24,1),(38,1),(39,1),(40,2);
insert into public.mkt_vendor_quotes values(18,23,24),(19,24,38),(20,25,39),(21,26,40);
insert into public.mkt_notification_queue values
 (93,23,18,24,'vendor','whatsapp','rfq_vendor_invited','pending',0,null,'{}'),
 (95,24,19,38,'vendor','whatsapp','rfq_vendor_invited','sent',1,now(),'{"gateway_delivery":{"provider":"cst-wa-gateway","message_id":"m95"}}'),
 (96,25,20,39,'vendor','whatsapp','rfq_vendor_invited','queued',1,null,'{"gateway_delivery":{"provider":"cst-wa-gateway","message_id":"m96"}}'),
 (97,26,21,40,'vendor','whatsapp','rfq_vendor_invited','queued',1,null,'{"gateway_delivery":{"provider":"cst-wa-gateway","message_id":"m97"}}'),
 (98,25,20,39,'vendor','whatsapp','rfq_vendor_invited','queued',2,null,'{"gateway_delivery":{"provider":"cst-wa-gateway","message_id":"m98"}}');
SQL
APP_ENV=development NODE_ENV=test SUPABASE_DATABASE_URL_DEV=postgresql://ci:ci@127.0.0.1:5432/ci node --input-type=module <<'NODE' >> "$SQL"
import {DEV_VENDOR_QUEUED_STATUS_SELECT_SQL} from "./server/dev-vendor-wa-status-poller.mjs";
console.log("create function public.candidates(integer,integer) returns table(queue_id integer,rfq_id integer,vendor_quote_id integer) language sql stable as $$ "+ DEV_VENDOR_QUEUED_STATUS_SELECT_SQL +" $$;");
NODE
docker exec -i "$NAME" psql -U postgres -d postgres -q -v ON_ERROR_STOP=1 < "$SQL" >/dev/null
RESULT="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c 'select queue_id from public.candidates(8,0)' | tr '\n' ';')"
test "$RESULT" = '96;' || { echo "FAIL: unrelated queue eligible: $RESULT";exit 1; }
AFTER_LAST="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c 'select count(*) from public.candidates(8,96)')"
test "$AFTER_LAST" = 0 || { echo "FAIL: cursor did not bound selection";exit 1; }
LIMIT_ZERO="$(docker exec "$NAME" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c 'select count(*) from public.candidates(0,0)')"
test "$LIMIT_ZERO" = 0
echo "PASS: isolated status poll SELECT includes only queued company-1 receipt #96, excludes sent #95, pending #93, company-2 and retry/attempt-2; bounded by LIMIT"
