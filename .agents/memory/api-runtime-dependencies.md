---
name: API runtime dependencies
description: Dependency installation requirement for the standalone portal API secret-loader startup.
---

The standalone Customer Portal API depends on its declared Secret Manager package at runtime; a workspace can have the package in package.json and the lockfile while an incomplete install leaves node_modules unable to start the API.

**Why:** When the API fails before opening its port, the frontend remains available and can make a populated marketplace look empty.

**How to apply:** Check both the API workflow log and installed runtime dependency before investigating Supabase data; after dependency repair, verify health and marketplace responses through the Preview proxy.