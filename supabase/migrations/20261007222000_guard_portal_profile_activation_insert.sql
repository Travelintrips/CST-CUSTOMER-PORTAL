drop trigger if exists trg_guard_portal_profile_activation on public.portal_customer_profiles;

create or replace function public.guard_portal_profile_activation()
returns trigger
language plpgsql
as $$
begin
  if new.profile_status = 'active'
     and (tg_op = 'INSERT' or old.profile_status is distinct from new.profile_status) then
    perform public.assert_portal_profile_complete(new.customer_id);
  end if;
  return new;
end;
$$;

create trigger trg_guard_portal_profile_activation
after insert or update of profile_status on public.portal_customer_profiles
for each row
execute function public.guard_portal_profile_activation();
