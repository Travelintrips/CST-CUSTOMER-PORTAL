-- Isolate the standalone Customer Portal WhatsApp credential without exposing it.
insert into public.app_config(key,value,is_secret,environment,updated_at)
select 'CUSTOMER_PORTAL_FONNTE_TOKEN', value, true, coalesce(environment,'production'), now()
from public.app_config
where key='FONNTE_TOKEN'
on conflict (key) do update
  set value=excluded.value,
      is_secret=true,
      environment=excluded.environment,
      updated_at=now();
