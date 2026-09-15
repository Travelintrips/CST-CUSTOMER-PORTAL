#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export NODE_ENV="${NODE_ENV:-development}"
export PORT="${PORT:-5000}"
# Keep the shared CST API as the upstream for routes that are not implemented
# by the standalone portal API. The frontend proxy itself will still target the
# local portal API below.
export CUSTOMER_PORTAL_API_UPSTREAM_URL="${CUSTOMER_PORTAL_API_UPSTREAM_URL:-${VITE_API_SERVER_URL:-${API_SERVER_URL:-}}}"
# The standalone portal uses the development API when one is configured.
# Keep VITE_API_SERVER_URL as the production/shared fallback so published
# builds are not accidentally pointed at a dev API.
export VITE_API_SERVER_URL="${VITE_API_SERVER_URL_DEV:-${VITE_API_SERVER_URL:-${API_SERVER_URL:-http://127.0.0.1:18444}}}"
# Replit exposes the customer portal API on external port 3000. The preview
# page itself is served on external port 80, where /api is not routed through
# Vite by the Replit edge proxy.
if [[ -n "${REPLIT_DEV_DOMAIN:-}" ]]; then
  export VITE_API_PUBLIC_URL="https://${REPLIT_DEV_DOMAIN}:3000"
fi
echo "[portal] Starting standalone portal on :${PORT}"
if [[ -n "${VITE_API_SERVER_URL:-}" ]]; then
  echo "[portal] API proxy target configured"
else
  echo "[portal] API proxy target is not configured; using Vite fallback"
fi
exec pnpm exec vite --config vite.config.ts --host 0.0.0.0 --port "$PORT"
