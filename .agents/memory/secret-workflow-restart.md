---
name: Secret workflow restart
description: Startup behavior when database secrets are added or changed for the standalone portal API.
---

The Customer Portal API process must be restarted after database secrets are added or changed; an already-running workflow may retain the earlier environment and fail as if the secrets were missing.

**Why:** The frontend can remain available while the API exits during database initialization, which makes data such as marketplace products appear empty even though the database still contains it.

**How to apply:** Check the API workflow status after secret changes, restart it once, then verify both the local API and the Preview proxy return a successful marketplace response.