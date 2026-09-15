---
name: API proxy configuration
description: Runtime constraints for the standalone portal's API target.
---

The standalone portal's API proxy target must be an absolute, reachable HTTP(S) URL. Secret-backed target values should be treated as sensitive configuration and never printed in launcher logs.

**Why:** A placeholder or DNS-unreachable target can leave the frontend shell serving successfully while every API and storage request fails, making a superficial 200 check misleading.

**How to apply:** Validate the target format without printing it, then verify both the frontend shell and a proxied API request. Keep startup logs limited to whether the target is configured.

Development bundles must leave `VITE_API_PUBLIC_URL` empty so browser requests remain relative and pass through the local Vite proxy; only production should rewrite them to a public API origin.

**Why:** A stale public Pike origin bypassed the local API, causing CORS failures and making the catalog appear to be loading even though the local API was healthy.

**How to apply:** Gate the browser-side API-origin injection on production and verify a development Marketplace request through port 5000 after restarting Vite.