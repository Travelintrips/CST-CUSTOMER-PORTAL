-- Restrict portal account roles to the supported authorization model.

alter table public.portal_customers
  drop constraint if exists portal_customers_role_check;

alter table public.portal_customers
  add constraint portal_customers_role_check
  check (role in ('customer','vendor','driver','employee','admin'));
