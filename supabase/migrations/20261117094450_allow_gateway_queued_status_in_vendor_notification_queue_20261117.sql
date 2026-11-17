-- CST-DEV applied migration name: allow_gateway_queued_status_in_vendor_notification_queue_20261117
-- Preserve the database's already-applied state and make source-control parity
-- idempotent. The original WhatsApp status CHECK did not include "queued",
-- even though Customer Portal DEV records accepted Gateway HTTP 202 as queued.
-- This is NOT proof of sent or delivered; sent_at remains NULL until receipt.
-- This migration does not change any sender token, Fonnte, worker or RLS policy.

SET lock_timeout TO '5s';

DO $fix$
DECLARE
  existing_rule text;
BEGIN
  SELECT pg_get_constraintdef(c.oid)
    INTO existing_rule
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
   WHERE n.nspname = 'public'
     AND t.relname = 'mkt_notification_queue'
     AND c.conname = 'mkt_notification_queue_status_check';

  IF existing_rule IS NULL THEN
    RAISE EXCEPTION 'Expected mkt_notification_queue_status_check is missing; refusing to replace unknown schema';
  END IF;

  IF position('''queued''' in existing_rule) = 0 THEN
    IF position('''pending''' in existing_rule) = 0
       OR position('''sending''' in existing_rule) = 0
       OR position('''sent''' in existing_rule) = 0
       OR position('''failed''' in existing_rule) = 0
       OR position('''retrying''' in existing_rule) = 0
       OR position('''exhausted''' in existing_rule) = 0 THEN
      RAISE EXCEPTION 'Unexpected notification status constraint; refusing to replace';
    END IF;
    ALTER TABLE public.mkt_notification_queue
      DROP CONSTRAINT mkt_notification_queue_status_check,
      ADD CONSTRAINT mkt_notification_queue_status_check
        CHECK (status IN (
          'pending', 'sending', 'queued', 'sent', 'failed', 'retrying', 'exhausted'
        ));
  END IF;
END
$fix$;
