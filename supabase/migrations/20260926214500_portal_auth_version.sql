alter table public.portal_customers
  add column if not exists auth_version integer not null default 0;

comment on column public.portal_customers.auth_version is
  'Increment to invalidate all previously issued portal JWT sessions for this account.';
