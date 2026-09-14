# CST-CUSTOMER-PORTAL

Standalone frontend repository for the CST platform.

## Run locally

1. Install dependencies with \pnpm install\.
2. Set \VITE_API_SERVER_URL\ to the shared API Server URL in \.env\.
3. Set \VITE_BIZPORTAL_BASE_URL\ to the external BizPortal base URL when it differs from the default.
4. Run \pnpm dev\.

The frontend sends API calls to \/api/*\; Vite proxies them to \VITE_API_SERVER_URL\. The repository contains its own local copies of the browser API client, auth helpers, storage uploader, and domain templates, so it does not depend on the CST monorepo or workspace packages.
