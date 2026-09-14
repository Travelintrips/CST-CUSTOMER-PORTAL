/* B2B Marketplace and Logistic — Service Worker for Web Push Notifications */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Update Order", body: event.data.text() };
  }

  const title = payload.title ?? "B2B Marketplace and Logistic";
  const options = {
    body: payload.body ?? "",
    icon: "/api/storage/public-objects/portal-assets/static/customer-portal/images/logo-baru.png",
    badge: "/api/storage/public-objects/portal-assets/static/customer-portal/images/logo-baru.png",
    tag: payload.tag ?? "cst-order-update",
    renotify: true,
    data: { url: payload.url ?? "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
