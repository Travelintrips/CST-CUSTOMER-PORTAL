-- CST-DEV ONLY / SOURCE-ONLY. Never run on PROD.
-- Apply only after BizPortal's signed approver endpoint is updated and the
-- complete one-Owner OTP E2E is ready. No new role, login or password.
--
-- Existing invoice writer roles have narrowly selected public.users columns
-- and UPDATE(updated_at), required by SELECT ... FOR SHARE row locks.
-- SELECT on public.users remains tenant-scoped and fail-closed.
-- An issuer must be a directly assigned, ACTIVE BizPortal admin of the
-- exact company; a Portal login or self-selected company membership alone
-- never authorizes an Invoice.
CREATE POLICY cst_invoice_b5_staff_issuer_select_cst
 ON public.users FOR SELECT
 TO bizportal_customer_invoice_cst_writer_dev
 USING (CURRENT_USER=SESSION_USER
        AND role='admin' AND status='active' AND is_active IS TRUE
        AND company_id=1);

CREATE POLICY cst_invoice_b5_staff_issuer_rowlock_cst
 ON public.users FOR UPDATE
 TO bizportal_customer_invoice_cst_writer_dev
 USING (CURRENT_USER=SESSION_USER
        AND role='admin' AND status='active' AND is_active IS TRUE
        AND company_id=1)
 WITH CHECK (false);

CREATE POLICY cst_invoice_b5_staff_issuer_select_diva
 ON public.users FOR SELECT
 TO bizportal_customer_invoice_diva_writer_dev
 USING (CURRENT_USER=SESSION_USER
        AND role='admin' AND status='active' AND is_active IS TRUE
        AND company_id=3);

CREATE POLICY cst_invoice_b5_staff_issuer_rowlock_diva
 ON public.users FOR UPDATE
 TO bizportal_customer_invoice_diva_writer_dev
 USING (CURRENT_USER=SESSION_USER
        AND role='admin' AND status='active' AND is_active IS TRUE
        AND company_id=3)
 WITH CHECK (false);

-- Verify in a direct-login scoped session after controlled DEV authorization:
-- select current_user,session_user,row_security_active('public.users');
-- select id,role,company_id from public.users
--   where lower(trim(email))=lower(trim($1)) FOR SHARE;
-- The NOLOGIN roles must remain locked until an authorized isolated E2E window.
