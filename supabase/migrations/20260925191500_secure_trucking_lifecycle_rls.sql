begin;
alter table public.trucking_booking_requests enable row level security;
alter table public.trucking_booking_stops enable row level security;
alter table public.trucking_payments enable row level security;
alter table public.trucking_status_events enable row level security;
commit;
