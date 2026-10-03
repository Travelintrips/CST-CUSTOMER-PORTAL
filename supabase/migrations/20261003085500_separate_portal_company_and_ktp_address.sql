alter table public.portal_customer_profiles
  add column if not exists ktp_address text;

comment on column public.portal_customer_profiles.ktp_address is
  'Residential address matching the customer PIC KTP. Kept separate from company_address.';

update public.portal_customer_profiles
   set ktp_address = company_address
 where ktp_address is null
   and company_address is not null;
