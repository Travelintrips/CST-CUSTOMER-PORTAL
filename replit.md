# CST Customer Portal

## Run

- Development workflow: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test`
- Production build and prerender: `pnpm build`

The app is a standalone Vite frontend. It keeps browser-safe local copies under
`src/shared/` and must not be changed to depend on `@workspace/*` packages or
`../api-server` from the CST monorepo.

## Required configuration

- `CUSTOMER_PORTAL_API_URL_DEV` — optional local API URL for development. It
  must point to the standalone Customer Portal API; production uses same-origin
  `/api/*` requests.
- `GCP_SECRET_BUNDLE_PREFIX` — optional Secret Manager bundle prefix; defaults
  to `customer-portal` for `customer-portal-development` and
  `customer-portal-production`.
- `GOOGLE_MAPS_API_KEY` — optional; injected into the browser for the route map
  feature and should be restricted to the required origins/APIs.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and their `_DEV` variants —
  optional browser-side Supabase configuration. The frontend safely disables
  that client when they are absent.

Database URLs, service-account JSON, GCP Secret Manager bootstrap data,
`SESSION_SECRET`, and GitHub tokens are backend/operations credentials and are
not read by this standalone frontend.

## Standalone boundary

Keep browser-safe shared code under `src/shared/`. Do not add monorepo
workspace packages, sibling application paths, or backend-only imports to this
repository.