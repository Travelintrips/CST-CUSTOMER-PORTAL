-- Marketplace private-runtime hardening.
-- Applied to PROD and DEV on 2026-09-25.
-- IMPORTANT: public.payments is intentionally NOT changed here because it is
-- a shared legacy table used by other Travelintrips products. Marketplace
-- payment state is isolated in public.mkt_gateway_payments.

alter table if exists public.mkt_notification_queue enable row level security;
alter table if exists public.mkt_po_payment_proofs enable row level security;
alter table if exists public.paylabs_configurations enable row level security;
alter table if exists public.paylabs_payment_methods enable row level security;
alter table if exists public.mkt_gateway_payments enable row level security;

revoke all on table public.mkt_notification_queue from anon, authenticated;
revoke all on table public.mkt_po_payment_proofs from anon, authenticated;
revoke all on table public.paylabs_configurations from anon, authenticated;
revoke all on table public.paylabs_payment_methods from anon, authenticated;
revoke all on table public.mkt_gateway_payments from anon, authenticated;

grant all on table public.mkt_notification_queue to service_role;
grant all on table public.mkt_po_payment_proofs to service_role;
grant all on table public.paylabs_configurations to service_role;
grant all on table public.paylabs_payment_methods to service_role;
grant all on table public.mkt_gateway_payments to service_role;
