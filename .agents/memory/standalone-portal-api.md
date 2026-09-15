---
name: Standalone portal API
description: Durable boundary rules for the Customer Portal backend and its gradual migration.
---

The Customer Portal backend is a separate allowlisted API that reads the existing Supabase database directly. Its session, development-login, bootstrap, notification, storage, and business routes belong to the portal service; BizPortal routes must not be registered or proxied here.

**Why:** The shared Supabase database is intentionally retained, but sharing a database must not recreate the application coupling that caused the Customer Portal and BizPortal to ship as one system.

**How to apply:** Add new routes under the portal namespace only, query only the portal data needed by that route, and migrate the frontend to the local API by vertical slice. Keep the legacy API target only until each remaining portal slice has a local implementation.

The local HMAC `portal_session` cookie is not automatically a valid session for the legacy CST API. A proxy can reach legacy routes anonymously after the target is fixed, but authenticated order, RFQ, organization, and mutation routes still require an explicit session/token bridge or local implementation.

**Why:** The split portal can authenticate against its local database while the legacy API's `requirePortalAuth` expects its own Supabase-backed portal session contract.

**How to apply:** Treat a 401 from a proxied route with a valid local session as an authentication integration failure, not as missing business data. Do not declare an end-to-end customer flow complete until login, read, and mutation are verified through the same session contract.

Development must point `VITE_API_SERVER_URL_DEV` at the local API when a route has been migrated. A stale Replit dev-domain value can return the generic Preview 404 page even though Supabase still contains the data.

**Why:** The old development domain was not serving the previous API process; this made products appear deleted while the database and media objects remained intact.

**How to apply:** Verify the API response and image MIME type through the Preview proxy after changing the development target. Preserve the original storage path when the asset fallback target is the application domain.