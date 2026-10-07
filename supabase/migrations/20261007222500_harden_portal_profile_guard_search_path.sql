alter function public.assert_portal_profile_complete(integer)
  set search_path = public, pg_temp;
alter function public.guard_portal_profile_activation()
  set search_path = public, pg_temp;
alter function public.guard_onboarding_approval_complete()
  set search_path = public, pg_temp;
alter function public.guard_vendor_verified_complete()
  set search_path = public, pg_temp;
