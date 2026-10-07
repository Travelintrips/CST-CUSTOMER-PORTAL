create or replace function public.assert_portal_profile_complete(p_customer_id integer)
returns void
language plpgsql
as $$
declare
  v_role text;
  v_customer_type text;
  v_profile record;
  v_vendor record;
begin
  select role, customer_type
    into v_role, v_customer_type
    from public.portal_customers
   where id = p_customer_id;

  if not found then
    raise exception 'Portal customer % tidak ditemukan', p_customer_id using errcode = '23514';
  end if;

  select company_name, company_address, ktp_address, pic_name, pic_whatsapp
    into v_profile
    from public.portal_customer_profiles
   where customer_id = p_customer_id
   order by updated_at desc nulls last, id desc
   limit 1;

  if not found then
    raise exception 'Profil customer % belum tersimpan di portal_customer_profiles', p_customer_id using errcode = '23514';
  end if;

  if coalesce(length(trim(v_profile.ktp_address)), 0) < 10 then
    raise exception 'Alamat KTP customer % belum tersimpan/lengkap', p_customer_id using errcode = '23514';
  end if;

  if v_role = 'customer' and v_customer_type = 'company'
     and coalesce(length(trim(v_profile.company_address)), 0) < 10 then
    raise exception 'Alamat perusahaan customer % belum tersimpan/lengkap', p_customer_id using errcode = '23514';
  end if;

  if v_role = 'vendor' then
    if coalesce(length(trim(v_profile.company_address)), 0) < 10 then
      raise exception 'Alamat perusahaan vendor % belum tersimpan/lengkap', p_customer_id using errcode = '23514';
    end if;

    select full_address, company_name, nib, service_type, legality_doc_url
      into v_vendor
      from public.vendor_profiles
     where customer_id = p_customer_id
     order by updated_at desc nulls last, id desc
     limit 1;

    if not found then
      raise exception 'Vendor profile % belum tersimpan', p_customer_id using errcode = '23514';
    end if;

    if coalesce(length(trim(v_vendor.full_address)), 0) < 10
       or coalesce(length(trim(v_vendor.company_name)), 0) < 2
       or coalesce(length(trim(v_vendor.nib)), 0) = 0
       or coalesce(length(trim(v_vendor.service_type)), 0) = 0
       or coalesce(length(trim(v_vendor.legality_doc_url)), 0) = 0 then
      raise exception 'Data wajib vendor % belum lengkap/tersimpan', p_customer_id using errcode = '23514';
    end if;
  end if;
end;
$$;

create or replace function public.guard_portal_profile_activation()
returns trigger
language plpgsql
as $$
begin
  if new.profile_status = 'active'
     and old.profile_status is distinct from new.profile_status then
    perform public.assert_portal_profile_complete(new.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_portal_profile_activation on public.portal_customer_profiles;
create trigger trg_guard_portal_profile_activation
before update of profile_status on public.portal_customer_profiles
for each row
execute function public.guard_portal_profile_activation();

create or replace function public.guard_onboarding_approval_complete()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    perform public.assert_portal_profile_complete(new.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_onboarding_approval_complete on public.onboarding_approvals;
create trigger trg_guard_onboarding_approval_complete
before insert or update of status on public.onboarding_approvals
for each row
execute function public.guard_onboarding_approval_complete();

create or replace function public.guard_vendor_verified_complete()
returns trigger
language plpgsql
as $$
begin
  if lower(coalesce(new.verification_status, '')) in ('verified','approved')
     and (tg_op = 'INSERT' or old.verification_status is distinct from new.verification_status) then
    perform public.assert_portal_profile_complete(new.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_vendor_verified_complete on public.vendor_profiles;
create trigger trg_guard_vendor_verified_complete
before insert or update of verification_status on public.vendor_profiles
for each row
execute function public.guard_vendor_verified_complete();
