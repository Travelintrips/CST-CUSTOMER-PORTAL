-- Enforce the same normalized account identity semantics used by portal auth.

do $$
begin
  if exists (
    select 1
    from public.portal_customers a
    join public.portal_customers b
      on a.id < b.id
     and lower(trim(a.email)) = lower(trim(b.email))
  ) then
    raise exception 'portal_customers contains duplicate normalized emails';
  end if;

  if exists (
    select 1
    from public.portal_customers a
    join public.portal_customers b
      on a.id < b.id
     and nullif(regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g'), '') is not null
     and nullif(regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g'), '') is not null
     and (
       case
         when regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g') like '0%'
           then '62' || substr(regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g'), 2)
         when regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g') like '8%'
           then '62' || regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g')
         else regexp_replace(coalesce(a.phone, ''), '[^0-9]', '', 'g')
       end
     ) = (
       case
         when regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g') like '0%'
           then '62' || substr(regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g'), 2)
         when regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g') like '8%'
           then '62' || regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g')
         else regexp_replace(coalesce(b.phone, ''), '[^0-9]', '', 'g')
       end
     )
  ) then
    raise exception 'portal_customers contains duplicate normalized phone numbers';
  end if;
end
$$;

create unique index if not exists portal_customers_email_normalized_unique_idx
  on public.portal_customers (lower(trim(email)));

create unique index if not exists portal_customers_phone_normalized_unique_idx
  on public.portal_customers ((
    case
      when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') like '0%'
        then '62' || substr(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 2)
      when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') like '8%'
        then '62' || regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
      else regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
    end
  ))
  where nullif(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), '') is not null;
