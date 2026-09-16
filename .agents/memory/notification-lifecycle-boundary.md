---
name: Notification lifecycle boundary
description: Durable rules for customer/admin lifecycle notifications and non-blocking delivery.
---

Admin and customer lifecycle notifications share the existing portal notification table, but every row must be scoped by recipient and identify its audience in payload. Canonical payloads carry audience, resourceType, resourceId, link, and url; writes are idempotent by recipient/event key and isolated with a savepoint so notification/provider failures never roll back the business transaction.

**Why:** The project cannot add a notification schema, and a global admin inbox exposed cross-account data while direct notification inserts could abort RFQ, fulfillment, or billing transactions.

**How to apply:** Keep admin reads and read mutations scoped to the logged-in admin plus `audience=admin`; keep customer reads scoped to the logged-in customer plus customer audience; route all new lifecycle writes through the best-effort notification helper. External WhatsApp/Fonnte delivery must remain absent or fail closed unless an explicitly safe development device and recipient are configured.