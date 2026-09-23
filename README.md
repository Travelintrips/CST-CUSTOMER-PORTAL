# CST-CUSTOMER-PORTAL

Standalone frontend repository for the CST platform.

## Run locally

1. Install dependencies with `pnpm install`.
2. Run the local API with `pnpm api:dev`; the frontend development proxy
   automatically targets `http://127.0.0.1:18444`.
3. Run `pnpm dev`.

The frontend sends API calls to `/api/*`; Vite proxies them to the standalone
Customer Portal API in development. Production serves the frontend and API from
the same origin. The server owns its auth/session boundary and reads the
existing Supabase database directly.

Production secret bundles use the `customer-portal-development` and
`customer-portal-production` names by default. Set
`GCP_SECRET_BUNDLE_PREFIX` explicitly when the deployment uses a different
portal-owned prefix.
