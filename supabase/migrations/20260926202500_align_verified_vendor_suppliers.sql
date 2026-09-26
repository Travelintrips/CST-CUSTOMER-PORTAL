-- Align supplier registration state for suppliers already linked to verified vendors.
-- This repairs legacy rows that were verified before onboarding approval started
-- maintaining supplier registration_status.

update public.suppliers s
set registration_status = 'approved',
    is_active = true,
    status = 'active',
    is_verified = true,
    verified_at = coalesce(s.verified_at, now()),
    onboarding_completed_at = coalesce(s.onboarding_completed_at, now()),
    updated_at = now()
from public.vendor_profiles vp
where vp.supplier_id = s.id
  and lower(coalesce(vp.verification_status, '')) in ('verified', 'approved')
  and (
    s.registration_status is distinct from 'approved'
    or s.is_active is distinct from true
    or s.status is distinct from 'active'
    or s.is_verified is distinct from true
  );
