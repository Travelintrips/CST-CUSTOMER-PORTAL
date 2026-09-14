import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const SW_PATH = `${import.meta.env.BASE_URL ?? "/"}sw.js`;

type PushState = "unsupported" | "denied" | "idle" | "subscribed" | "loading";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getVapidKey(): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/api/push/vapid-key`);
    if (!r.ok) return null;
    const d = await r.json() as { publicKey?: string };
    return d.publicKey ?? null;
  } catch {
    return null;
  }
}

export function usePushNotification(orderNumber: string | null) {
  const [state, setState] = useState<PushState>("idle");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check support
  const isSupported = typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    if (!isSupported || !orderNumber) return;
    let cancelled = false;

    async function init() {
      try {
        const reg = await navigator.serviceWorker.register(SW_PATH);
        if (cancelled) return;
        setRegistration(reg);

        const existing = await reg.pushManager.getSubscription();
        if (cancelled) return;

        if (existing) {
          setState("subscribed");
        } else if (Notification.permission === "denied") {
          setState("denied");
        } else {
          setState("idle");
        }
      } catch {
        // SW registration failed (e.g. secure context not available)
      }
    }

    init();
    return () => { cancelled = true; };
  }, [isSupported, orderNumber]);

  const subscribe = useCallback(async () => {
    if (!registration || !orderNumber) return;
    setState("loading");

    const vapidKey = await getVapidKey();
    if (!vapidKey) { setState("idle"); return; }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const r = await fetch(`${BASE}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, subscription: sub.toJSON() }),
      });

      if (r.ok) {
        setState("subscribed");
      } else {
        await sub.unsubscribe();
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }, [registration, orderNumber]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    setState("loading");
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await fetch(`${BASE}/api/push/unsubscribe`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("idle");
    } catch {
      setState("idle");
    }
  }, [registration]);

  if (!isSupported) return { state: "unsupported" as PushState, subscribe, unsubscribe };
  return { state, subscribe, unsubscribe };
}
