-- 17 Nov 2026: Customer Portal DEV's canonical CST WA Gateway integration
-- records HTTP 202 as queued, not sent. The existing PostgreSQL CHECK omitted
-- 'queued', causing a real gateway success to fail during queue acknowledgment.
--
-- Extend only this CHECK. Preserve historical statuses, sender paths,
-- journals, old queue rows and all existing table permissions/RLS.
--
-- Apply in CST-DEV only after validating the current constraint; do not
-- auto-apply to PROD without an independent release decision.
SET lock_timeout TO '5s';

ALTER TABLE public.mkt_notification_queue
  DROP CONSTRAINT mkt_notification_queue_status_check,
  ADD CONSTRAINT mkt_notification_queue_status_check
    CHECK (status IN (
      'pending', 'sending', 'queued', 'sent', 'failed', 'retrying', 'exhausted'
    ));

COMMENT ON CONSTRAINT mkt_notification_queue_status_check
  ON public.mkt_notification_queue
  IS 'CST WA Gateway accepted/queued is not evidence of WhatsApp sent or delivered; retains existing statuses.';
