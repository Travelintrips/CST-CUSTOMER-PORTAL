begin;

alter table if exists public.trucking_booking_requests
  add column if not exists customer_approval_status text not null default 'not_requested',
  add column if not exists customer_approved_at timestamptz,
  add column if not exists customer_approval_notes text,
  add column if not exists final_price numeric(18,2),
  add column if not exists payment_terms jsonb not null default '{"type":"full","dp_percent":100}'::jsonb,
  add column if not exists payment_status text not null default 'not_due',
  add column if not exists paid_amount numeric(18,2) not null default 0,
  add column if not exists remaining_amount numeric(18,2) not null default 0,
  add column if not exists payment_due_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists driver_name text,
  add column if not exists driver_phone text,
  add column if not exists vehicle_plate text,
  add column if not exists driver_token text,
  add column if not exists admin_notes text,
  add column if not exists actual_toll numeric(18,2) not null default 0,
  add column if not exists actual_parking numeric(18,2) not null default 0,
  add column if not exists actual_extra_cost numeric(18,2) not null default 0,
  add column if not exists actual_extra_cost_notes text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists trucking_booking_requests_driver_token_uq
  on public.trucking_booking_requests(driver_token)
  where driver_token is not null;

create index if not exists trucking_booking_requests_customer_status_idx
  on public.trucking_booking_requests(portal_customer_id, status, created_at desc);

create table if not exists public.trucking_booking_stops (
  id bigserial primary key,
  booking_id bigint not null references public.trucking_booking_requests(id) on delete cascade,
  sequence_no integer not null,
  area text,
  address text not null,
  pic_name text,
  pic_phone text,
  status text not null default 'pending',
  arrived_at timestamptz,
  delivered_at timestamptz,
  receiver_name text,
  pod_path text,
  pod_notes text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id, sequence_no)
);

create table if not exists public.trucking_payments (
  id bigserial primary key,
  booking_id bigint not null references public.trucking_booking_requests(id) on delete cascade,
  payment_kind text not null default 'manual_transfer',
  amount numeric(18,2) not null check (amount > 0),
  status text not null default 'submitted',
  proof_path text,
  reference text,
  notes text,
  submitted_by bigint references public.portal_customers(id) on delete set null,
  reviewed_by bigint references public.portal_customers(id) on delete set null,
  rejection_reason text,
  paid_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trucking_payments_booking_idx
  on public.trucking_payments(booking_id, created_at desc);

create table if not exists public.trucking_status_events (
  id bigserial primary key,
  booking_id bigint not null references public.trucking_booking_requests(id) on delete cascade,
  status text not null,
  actor_type text not null default 'system',
  actor_id text,
  actor_name text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trucking_status_events_booking_idx
  on public.trucking_status_events(booking_id, created_at, id);

do $$
begin
  if exists (select 1 from pg_type where typname = 'payment_ref_kind') then
    alter type payment_ref_kind add value if not exists 'trucking';
  end if;
end $$;

commit;
