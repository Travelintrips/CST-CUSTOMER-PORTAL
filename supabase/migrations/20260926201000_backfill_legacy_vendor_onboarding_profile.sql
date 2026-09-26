-- Backfill legacy vendor accounts that predate canonical onboarding profiles.
-- Do not create vendor_profiles or approvals here: the vendor must still
-- complete onboarding and submit business details before admin review.

insert into public.portal_customer_profiles
  (customer_id, company_name, pic_name, pic_whatsapp, profile_status, updated_at)
select
  c.id,
  nullif(trim(c.company), ''),
  nullif(trim(c.name), ''),
  nullif(trim(c.phone), ''),
  'incomplete',
  now()
from public.portal_customers c
where c.role = 'vendor'
  and not exists (
    select 1
    from public.portal_customer_profiles p
    where p.customer_id = c.id
  )
on conflict (customer_id) where customer_id is not null
do nothing;
