---
name: Standalone portal API
description: Durable boundary rules for the Customer Portal backend and its gradual migration.
---

The Customer Portal backend is a separate allowlisted API that reads the existing Supabase database directly. Its session, development-login, bootstrap, notification, storage, and business routes belong to the portal service; BizPortal routes must not be registered or proxied here.

**Why:** The shared Supabase database is intentionally retained, but sharing a database must not recreate the application coupling that caused the Customer Portal and BizPortal to ship as one system.

**How to apply:** Add new routes under the portal namespace only, query only the portal data needed by that route, and migrate the frontend to the local API by vertical slice. Keep the legacy API target only until each remaining portal slice has a local implementation.