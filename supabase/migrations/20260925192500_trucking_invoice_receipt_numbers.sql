begin;
alter table public.trucking_booking_requests
  add column if not exists invoice_number text,
  add column if not exists receipt_number text;
create unique index if not exists trucking_booking_requests_invoice_uq
  on public.trucking_booking_requests(invoice_number)
  where invoice_number is not null;
create unique index if not exists trucking_booking_requests_receipt_uq
  on public.trucking_booking_requests(receipt_number)
  where receipt_number is not null;
commit;
