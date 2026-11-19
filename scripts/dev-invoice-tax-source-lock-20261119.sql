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
