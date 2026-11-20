-- CST-DEV-only rollback for B6 Invoice tax source row-lock proposal.
-- Run only if explicit B6 policies / grants were approved and applied.
drop policy if exists cst_invoice_b6_settings_rowlock_cst on public.accounting_settings;
drop policy if exists cst_invoice_b6_settings_rowlock_diva on public.accounting_settings;
drop policy if exists cst_invoice_b6_taxes_rowlock_cst on public.accounting_taxes;
drop policy if exists cst_invoice_b6_taxes_rowlock_diva on public.accounting_taxes;
revoke update(updated_at) on public.accounting_settings
 from bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
revoke update(created_at) on public.accounting_taxes
 from bizportal_customer_invoice_cst_writer_dev,bizportal_customer_invoice_diva_writer_dev;
drop policy if exists cst_invoice_b6_settings_readlock_cst on public.accounting_settings;
drop policy if exists cst_invoice_b6_settings_readlock_diva on public.accounting_settings;
drop policy if exists cst_invoice_b6_taxes_readlock_cst on public.accounting_taxes;
drop policy if exists cst_invoice_b6_taxes_readlock_diva on public.accounting_taxes;
