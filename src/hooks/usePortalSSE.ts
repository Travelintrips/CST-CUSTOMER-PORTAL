import { useEffect, useRef, useState, useCallback } from "react";

export type PortalSSEEvent =
  | "logistic_order_status_changed"
  | "vendor_quote_received"
  | "driver_job_status_changed"
  | "progress_event_added"
  | "driver_photo_uploaded"
  | "driver_location_update"
  | "price_sync"
  | "new_logistic_order"
  | "order_status_update"
  | "payment_confirmed"
  | string;

type Handler = (data: unknown) => void;

const SSE_URL = "/api/ecommerce/events";
const RECONNECT_DELAY = 5000;

interface UsePortalSSEOptions {
  enabled?: boolean;
}

export function usePortalSSE(
  handlers: Partial<Record<PortalSSEEvent, Handler>>,
  options: UsePortalSSEOptions = {}
) {
  const { enabled = true } = options;
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;

    function connect() {
      const es = new EventSource(SSE_URL);

      es.onopen = () => {
        if (mounted) setConnected(true);
      };

      es.onerror = () => {
        if (!mounted) return;
        setConnected(false);
        es.close();
        reconnectRef.current = setTimeout(() => {
          if (mounted) connect();
        }, RECONNECT_DELAY);
      };

      const registered = new Set<string>();

      function addListener(event: string) {
        if (registered.has(event)) return;
        registered.add(event);
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            handlersRef.current[event]?.(data);
          } catch { }
        });
      }

      Object.keys(handlersRef.current).forEach(addListener);

      return es;
    }

    const es = connect();

    return () => {
      mounted = false;
      setConnected(false);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      es.close();
    };
  }, [enabled]);

  return { connected };
}

export function usePortalSSEOrderTracker(
  orderNumber: string | null | undefined,
  onInvalidate: () => void
) {
  const stableOnInvalidate = useRef(onInvalidate);
  useEffect(() => { stableOnInvalidate.current = onInvalidate; });

  const makeHandler = useCallback(() => (data: unknown) => {
    const d = data as { orderNumber?: string };
    if (orderNumber && d?.orderNumber === orderNumber) {
      stableOnInvalidate.current();
    }
  }, [orderNumber]);

  const handler = makeHandler();

  return usePortalSSE(
    {
      logistic_order_status_changed: handler,
      vendor_quote_received: handler,
      driver_job_status_changed: handler,
      progress_event_added: handler,
      driver_photo_uploaded: handler,
    },
    { enabled: !!orderNumber }
  );
}
