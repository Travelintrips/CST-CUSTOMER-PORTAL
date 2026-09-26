create table if not exists public.portal_password_reset_tokens (
  id bigserial primary key,
  customer_id bigint not null references public.portal_customers(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  request_ip text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists portal_password_reset_tokens_customer_created_idx
  on public.portal_password_reset_tokens (customer_id, created_at desc);

create index if not exists portal_password_reset_tokens_email_created_idx
  on public.portal_password_reset_tokens (lower(trim(email)), created_at desc);

revoke all on table public.portal_password_reset_tokens from anon, authenticated;
revoke all on sequence public.portal_password_reset_tokens_id_seq from anon, authenticated;
