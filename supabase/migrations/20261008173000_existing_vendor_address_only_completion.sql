create or replace function public.assert_portal_profile_complete(p_customer_id integer)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_customer_type text;
  v_profile record;
  v_vendor record;
begin
  select role, customer_type into v_role, v_customer_type
  from public.portal_customers where id=p_customer_id;
  if not found then
    raise exception 'Portal customer % tidak ditemukan',p_customer_id using errcode='23514';
  end if;

  select company_name,company_address,ktp_address,pic_name,pic_whatsapp
    into v_profile
  from public.portal_customer_profiles
  where customer_id=p_customer_id
  order by updated_at desc nulls last,id desc limit 1;
  if not found then
    raise exception 'Profil customer % belum tersimpan di portal_customer_profiles',p_customer_id using errcode='23514';
  end if;
  if coalesce(length(trim(v_profile.ktp_address)),0)<10 then
    raise exception 'Alamat KTP customer % belum tersimpan/lengkap',p_customer_id using errcode='23514';
  end if;
  if v_role='customer' and v_customer_type='company'
     and coalesce(length(trim(v_profile.company_address)),0)<10 then
    raise exception 'Alamat perusahaan customer % belum tersimpan/lengkap',p_customer_id using errcode='23514';
  end if;

  if v_role='vendor' then
    if coalesce(length(trim(v_profile.company_address)),0)<10 then
      raise exception 'Alamat perusahaan vendor % belum tersimpan/lengkap',p_customer_id using errcode='23514';
    end if;

    select vp.full_address,vp.company_name,vp.nib,vp.service_type,vp.legality_doc_url,
           (coalesce(s.is_active,false)
            and coalesce(s.is_verified,false)
            and lower(coalesce(s.registration_status,''))='approved') as existing_vendor
    into v_vendor
    from public.vendor_profiles vp
    left join public.suppliers s on s.id=vp.supplier_id
    where vp.customer_id=p_customer_id
    order by vp.updated_at desc nulls last,vp.id desc limit 1;

    if not found then
      raise exception 'Vendor profile % belum tersimpan',p_customer_id using errcode='23514';
    end if;

    if coalesce(length(trim(v_vendor.full_address)),0)<10
       or coalesce(length(trim(v_vendor.company_name)),0)<2
       or (
         not coalesce(v_vendor.existing_vendor,false)
         and (
           coalesce(length(trim(v_vendor.nib)),0)=0
           or coalesce(length(trim(v_vendor.service_type)),0)=0
           or coalesce(length(trim(v_vendor.legality_doc_url)),0)=0
         )
       ) then
      raise exception 'Data wajib vendor % belum lengkap/tersimpan',p_customer_id using errcode='23514';
    end if;
  end if;
end;
$$;