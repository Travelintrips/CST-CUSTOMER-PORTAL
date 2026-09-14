# CST-CUSTOMER-PORTAL

Standalone frontend repository for the CST platform.

## Run locally

1. Install dependencies with \pnpm install\.
2. Set \VITE_API_SERVER_URL\ to the shared API Server URL in \.env\.
3. Run \pnpm dev\.

The frontend sends API calls to \/api/*\; Vite proxies them to \VITE_API_SERVER_URL\. The repository contains its own local copies of the browser API client, auth helpers, storage uploader, and domain templates, so it does not depend on the CST monorepo or workspace packages.
