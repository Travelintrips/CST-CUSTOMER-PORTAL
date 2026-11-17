-- DEV Customer Portal: CST WA Gateway accepts an outbound message as
-- "queued" before the provider can prove "sent" or "delivered".
-- Preserve all existing statuses and historical rows; widen only this check.
-- Live application already writes queued status in DEV_VENDOR_GATEWAY_ACK_SQL.
DO $migration$
DECLARE previous_def text;
BEGIN
  SELECT pg_get_constraintdef(oid) INTO previous_def
    FROM pg_constraint
   WHERE conrelid = 'public.mkt_notification_queue'::regclass
     AND conname = 'mkt_notification_queue_status_check';
  IF previous_def IS NULL OR previous_def NOT LIKE '%pending%'
     OR previous_def NOT LIKE '%sending%'
     OR previous_def NOT LIKE '%exhausted%' THEN
    RAISE EXCEPTION 'Unexpected notification queue status constraint; refusing to alter';
  END IF;
  ALTER TABLE public.mkt_notification_queue
    DROP CONSTRAINT mkt_notification_queue_status_check;
  ALTER TABLE public.mkt_notification_queue
    ADD CONSTRAINT mkt_notification_queue_status_check
    CHECK (status IN (
      'pending', 'sending', 'queued', 'sent', 'failed', 'retrying', 'exhausted'
    ));
END
$migration$;
