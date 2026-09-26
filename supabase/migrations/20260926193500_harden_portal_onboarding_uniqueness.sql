-- Harden canonical portal onboarding records.
-- New portal accounts must have at most one canonical customer profile,
-- one canonical vendor profile, and one pending onboarding approval.

do $$
begin
  if exists (
    select 1
    from public.portal_customer_profiles
    where customer_id is not null
    group by customer_id
    having count(*) > 1
  ) then
    raise exception 'portal_customer_profiles contains duplicate customer_id rows';
  end if;

  if exists (
    select 1
    from public.vendor_profiles
    group by customer_id
    having count(*) > 1
  ) then
    raise exception 'vendor_profiles contains duplicate customer_id rows';
  end if;

  if exists (
    select 1
    from public.onboarding_approvals
    where status = 'pending'
    group by customer_id
    having count(*) > 1
  ) then
    raise exception 'onboarding_approvals contains duplicate pending rows';
  end if;
end
$$;

create unique index if not exists portal_customer_profiles_customer_unique_idx
  on public.portal_customer_profiles (customer_id)
  where customer_id is not null;

create unique index if not exists vendor_profiles_customer_unique_idx
  on public.vendor_profiles (customer_id);

create unique index if not exists onboarding_approvals_one_pending_per_customer_idx
  on public.onboarding_approvals (customer_id)
  where status = 'pending';
