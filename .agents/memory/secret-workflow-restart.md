---
name: Secret workflow restart
description: Startup behavior when database secrets are added or changed for the standalone portal API.
---

The Customer Portal API process must be restarted after database secrets or checkpointed source changes are added; an already-running workflow may retain earlier environment or source and execute stale behavior.

**Why:** The frontend can remain available while the API exits during database initialization, or continue serving stale route logic after a checkpoint, which makes data and endpoint behavior misleading.

**How to apply:** Check the API workflow status after secret or checkpoint changes, restart it once, then verify both the local API and the Preview proxy return a successful marketplace response.