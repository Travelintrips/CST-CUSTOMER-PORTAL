---
name: Standalone portal boundary
description: Architecture rule for keeping Customer Portal separate from CST-SUPER-APP.
---

The standalone Customer Portal must retain browser-safe local copies of shared API/types/template modules instead of importing monorepo workspace packages or backend-relative modules.

**Why:** The source branch is a monorepo containing BizPortal and API-server dependencies; copying those imports into the standalone repository would silently reintroduce the split that the separate repository is meant to preserve.

**How to apply:** When syncing from `CST-SUPER-APP`, compare `artifacts/customer-portal` against the repository root and port only genuinely missing browser features. Keep `@workspace/*`, `../api-server`, and backend-only packages out of the standalone app.