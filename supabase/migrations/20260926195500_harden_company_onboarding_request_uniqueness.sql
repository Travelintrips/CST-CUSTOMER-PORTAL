-- Ensure each portal customer has at most one active company onboarding request.

do $$
begin
  if exists (
    select 1
    from public.portal_company_requests
    where status in ('pending', 'submitted', 'in_review')
    group by portal_customer_id
    having count(*) > 1
  ) then
    raise exception 'portal_company_requests contains duplicate active requests';
  end if;
end
$$;

create unique index if not exists portal_company_requests_one_active_per_customer_idx
  on public.portal_company_requests (portal_customer_id)
  where status in ('pending', 'submitted', 'in_review');
