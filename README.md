# CST-CUSTOMER-PORTAL

Standalone frontend repository for the CST platform.

## Run locally

1. Install dependencies with \pnpm install\.
2. Set \VITE_API_SERVER_URL\ to the shared API Server URL in \.env\; use
   \http://127.0.0.1:18444\ when running the standalone API locally.
3. Run \pnpm dev\.

The frontend sends API calls to \/api/*\; Vite proxies them to \VITE_API_SERVER_URL\.
The Customer Portal API in \server/\ owns its auth/session boundary and reads the
existing Supabase database directly. This repository does not import the BizPortal
monorepo or expose BizPortal routes.
