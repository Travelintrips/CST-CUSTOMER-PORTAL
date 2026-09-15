---
name: Preview API port routing
description: Browser-to-API routing behavior for this project's multi-port Replit preview.
---

In a multi-port Replit preview, the main page domain on external port 80 can return `502` for `/api/*` even while the API is healthy on external port 3000. Browser API requests must use the same preview domain with the API port, with credentials and CORS configured.

**Why:** Testing `127.0.0.1:5000` or relying on the main preview `/api` path can falsely report auth failures that only affect the user's public Preview browser.

**How to apply:** Set the development browser API origin from the current `REPLIT_DEV_DOMAIN` and external API port, keep a same-host API gateway for cookies, and verify auth through the public domain rather than localhost alone.