-- REVIEW PROPOSAL: CST-DEV ONLY. NEVER RUN against PROD.
-- PG16 SELECT ... FOR SHARE needs at least one UPDATE column privilege.
-- Restrictive UPDATE RLS prevents any actual config mutation.
grant update(updated_at) on public.accounting_settings
 to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
grant update(created_at) on public.accounting_taxes
 to bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
create policy cst_invoice_b6_settings_rowlock_cst on public.accounting_settings
 as restrictive for update to bizportal_customer_invoice_cst_writer_dev
 using (current_user=session_user and company_id=1) with check (false);
create policy cst_invoice_b6_settings_rowlock_diva on public.accounting_settings
 as restrictive for update to bizportal_customer_invoice_diva_writer_dev
 using (current_user=session_user and company_id=3) with check (false);
create policy cst_invoice_b6_taxes_rowlock_cst on public.accounting_taxes
 as restrictive for update to bizportal_customer_invoice_cst_writer_dev
 using (current_user=session_user and company_id=1) with check (false);
create policy cst_invoice_b6_taxes_rowlock_diva on public.accounting_taxes
 as restrictive for update to bizportal_customer_invoice_diva_writer_dev
 using (current_user=session_user and company_id=3) with check (false);

-- The real hosted B1 settings/taxes RLS has a PERMISSIVE SELECT and a
-- RESTRICTIVE ALL policy, but NO PERMISSIVE UPDATE policy. PG16 FOR SHARE
-- checks UPDATE row visibility too. Restrictive-only B6 silently yields
-- no rows; add company-scoped PERMISSIVE UPDATE with WITH CHECK(false).
-- These policies authorize selecting/locking an owned tax row only.
-- They DO NOT permit UPDATE: both policies' WITH CHECK(false) prohibit it.
create policy cst_invoice_b6_settings_readlock_cst on public.accounting_settings
 as permissive for update to bizportal_customer_invoice_cst_writer_dev
 using (current_user=session_user and company_id=1) with check(false);
create policy cst_invoice_b6_settings_readlock_diva on public.accounting_settings
 as permissive for update to bizportal_customer_invoice_diva_writer_dev
 using (current_user=session_user and company_id=3) with check(false);
create policy cst_invoice_b6_taxes_readlock_cst on public.accounting_taxes
 as permissive for update to bizportal_customer_invoice_cst_writer_dev
 using (current_user=session_user and company_id=1) with check(false);
create policy cst_invoice_b6_taxes_readlock_diva on public.accounting_taxes
 as permissive for update to bizportal_customer_invoice_diva_writer_dev
 using (current_user=session_user and company_id=3) with check(false);
