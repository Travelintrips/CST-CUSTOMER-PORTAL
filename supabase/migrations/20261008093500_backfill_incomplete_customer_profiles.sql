alter table public.portal_customer_profiles
  add column if not exists ktp_address text;

insert into public.portal_customer_profiles
  (customer_id, company_name, pic_name, pic_whatsapp, profile_status, updated_at)
select c.id,
       nullif(trim(c.company), ''),
       nullif(trim(c.name), ''),
       nullif(trim(c.phone), ''),
       'incomplete',
       now()
from public.portal_customers c
where c.role = 'customer'
  and not exists (
    select 1
      from public.portal_customer_profiles p
     where p.customer_id = c.id
  );

update public.portal_customer_profiles p
   set profile_status = 'incomplete',
       updated_at = now()
  from public.portal_customers c
 where c.id = p.customer_id
   and c.role = 'customer'
   and p.profile_status <> 'incomplete'
   and (
     coalesce(length(trim(p.ktp_address)), 0) < 10
     or (
       c.customer_type = 'company'
       and coalesce(length(trim(p.company_address)), 0) < 10
     )
   );
