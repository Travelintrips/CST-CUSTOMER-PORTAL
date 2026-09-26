create table if not exists public.portal_operational_checks (
  id bigserial primary key,
  check_name text not null,
  status text not null check (status in ('healthy','degraded','failed')),
  release_id text,
  instance_id text,
  duration_ms integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_operational_checks_created_idx
  on public.portal_operational_checks (created_at desc);

create index if not exists portal_operational_checks_status_created_idx
  on public.portal_operational_checks (status, created_at desc);

alter table public.portal_operational_checks enable row level security;
revoke all on table public.portal_operational_checks from anon, authenticated;
revoke all on sequence public.portal_operational_checks_id_seq from anon, authenticated;

create table if not exists public.portal_recovery_drill_scratch (
  id bigserial primary key,
  run_token text not null unique,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.portal_recovery_drill_scratch enable row level security;
revoke all on table public.portal_recovery_drill_scratch from anon, authenticated;
revoke all on sequence public.portal_recovery_drill_scratch_id_seq from anon, authenticated;

create table if not exists public.portal_recovery_drill_runs (
  id bigserial primary key,
  run_token text not null unique,
  status text not null check (status in ('passed','failed')),
  release_id text,
  duration_ms integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_recovery_drill_runs_created_idx
  on public.portal_recovery_drill_runs (created_at desc);

alter table public.portal_recovery_drill_runs enable row level security;
revoke all on table public.portal_recovery_drill_runs from anon, authenticated;
revoke all on sequence public.portal_recovery_drill_runs_id_seq from anon, authenticated;
