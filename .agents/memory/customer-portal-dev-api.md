---
name: Customer Portal development API
description: The API environment required by the standalone Customer Portal's development-only login flow.
---

The Customer Portal's Dev Login must proxy to a non-production API Server from CST-SUPER-APP. The production gateway intentionally disables `/api/portal/auth/dev-login`, so pointing a development Vite preview at the production domain makes the button fail with 404.

**Why:** The backend guards Dev Login with its deployment environment to prevent a development bypass from being exposed in production.

**How to apply:** Keep the production API URL for published builds, but provide a development-only API URL for `pnpm dev` and let the dev start script prefer it. Validate with `/api/healthz` showing `appEnv: development` and a `200` response from `/api/portal/auth/dev-login`.

The development API can legitimately take several seconds while its database connection wakes up.

**Why:** Treating a slow but valid response as an immediate login failure creates a false-negative Dev Login experience.

**How to apply:** Keep the proxy upstream timeout generous, retry transient network/5xx failures once, and navigate after a successful login response instead of making a second slow bootstrap request a prerequisite.