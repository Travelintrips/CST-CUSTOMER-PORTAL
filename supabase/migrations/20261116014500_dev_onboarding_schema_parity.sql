-- CST-DEV reconciliation: restore already-defined portal onboarding indexes.
-- Existing source migrations 20260926193500 and 20260926195500 specify
-- these indexes; missing indices cause 42P10 on ON CONFLICT(customer_id).
-- DEV branch only, no PROD deploy, no data cleanup, no fake approvals.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.portal_customer_profiles
    WHERE customer_id IS NOT NULL GROUP BY customer_id HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate customer profiles: cannot add uniqueness'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.vendor_profiles GROUP BY customer_id HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate vendor profiles: cannot add uniqueness'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.onboarding_approvals
    WHERE status='pending' GROUP BY customer_id HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate pending onboarding approvals'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.portal_company_requests
    WHERE status IN ('pending','submitted','in_review')
    GROUP BY portal_customer_id HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'Duplicate active company requests'; END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS portal_customer_profiles_customer_unique_idx
 ON public.portal_customer_profiles(customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS vendor_profiles_customer_unique_idx
 ON public.vendor_profiles(customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_approvals_one_pending_per_customer_idx
 ON public.onboarding_approvals(customer_id) WHERE status='pending';
CREATE UNIQUE INDEX IF NOT EXISTS portal_company_requests_one_active_per_customer_idx
 ON public.portal_company_requests(portal_customer_id)
 WHERE status IN ('pending','submitted','in_review');

-- The existing Admin UI exposes 'in_review'; the prior DEV DB CHECK allowed
-- only pending/approved/rejected and rejected the legitimate review button.
DO $$
DECLARE
  existing_check text;
BEGIN
  SELECT pg_get_constraintdef(oid)
    INTO existing_check
    FROM pg_constraint
   WHERE conrelid='public.portal_company_requests'::regclass
     AND conname='portal_company_requests_status_check';
  IF existing_check IS NULL THEN
    RAISE EXCEPTION 'Company request status constraint not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.portal_company_requests
    WHERE status NOT IN ('pending','submitted','in_review','approved','rejected')
  ) THEN
    RAISE EXCEPTION 'Unexpected company request status; refuse schema widening';
  END IF;

  IF POSITION('in_review' IN existing_check)=0 OR
     POSITION('submitted' IN existing_check)=0 THEN
    ALTER TABLE public.portal_company_requests
      DROP CONSTRAINT portal_company_requests_status_check;
    ALTER TABLE public.portal_company_requests
      ADD CONSTRAINT portal_company_requests_status_check
        CHECK (status IN ('pending','submitted','in_review','approved','rejected'));
  END IF;
END $$;
