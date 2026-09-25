begin;

insert into public.trucking_booking_stops
  (booking_id,sequence_no,area,address,pic_name,pic_phone,status,created_at,updated_at)
select b.id,1,b.area_delivery,b.alamat_delivery,b.pic_penerima,b.hp_penerima,
       case when b.status in ('completed','delivered') then 'delivered' else 'pending' end,
       coalesce(b.created_at,now()),now()
  from public.trucking_booking_requests b
 where nullif(trim(coalesce(b.alamat_delivery,'')),'') is not null
on conflict (booking_id,sequence_no) do nothing;

insert into public.trucking_booking_stops
  (booking_id,sequence_no,area,address,pic_name,pic_phone,status,created_at,updated_at)
select b.id,
       x.ordinality::int + 1,
       nullif(trim(x.item->>'area'),''),
       trim(x.item->>'address'),
       nullif(trim(x.item->>'pic'),''),
       nullif(trim(x.item->>'phone'),''),
       case when b.status in ('completed','delivered') then 'delivered' else 'pending' end,
       coalesce(b.created_at,now()),now()
  from public.trucking_booking_requests b
 cross join lateral jsonb_array_elements(
   case
     when jsonb_typeof(coalesce(b.addons,'{}'::jsonb)->'deliveryStops')='array'
       then coalesce(b.addons,'{}'::jsonb)->'deliveryStops'
     else '[]'::jsonb
   end
 ) with ordinality as x(item,ordinality)
 where nullif(trim(coalesce(x.item->>'address','')),'') is not null
on conflict (booking_id,sequence_no) do nothing;

insert into public.trucking_status_events
  (booking_id,status,actor_type,actor_name,notes,metadata,created_at)
select b.id,
       coalesce(nullif(b.status,''),'pending_review'),
       'system',
       'Lifecycle Backfill',
       'Status awal dimigrasikan ke lifecycle trucking standalone.',
       '{}'::jsonb,
       coalesce(b.created_at,now())
  from public.trucking_booking_requests b
 where not exists (
   select 1 from public.trucking_status_events e where e.booking_id=b.id
 );

update public.trucking_booking_requests
   set payment_status = case
         when coalesce(paid_amount,0) >= coalesce(final_price,0)
              and coalesce(final_price,0) > 0 then 'paid'
         when coalesce(paid_amount,0) > 0 then 'partially_paid'
         when customer_approval_status='approved' then 'unpaid'
         else payment_status
       end,
       remaining_amount = case
         when final_price is not null then greatest(final_price-coalesce(paid_amount,0),0)
         else remaining_amount
       end,
       updated_at=coalesce(updated_at,now());

commit;
