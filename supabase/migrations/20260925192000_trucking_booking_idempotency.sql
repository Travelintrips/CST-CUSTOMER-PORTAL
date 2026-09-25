begin;
alter table public.trucking_booking_requests
  add column if not exists idempotency_key text;
create unique index if not exists trucking_booking_requests_idempotency_uq
  on public.trucking_booking_requests(idempotency_key)
  where idempotency_key is not null;
commit;
