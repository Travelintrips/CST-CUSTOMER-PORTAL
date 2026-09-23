#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export NODE_ENV="${NODE_ENV:-development}"
export PORT="${PORT:-5000}"
# Development always talks to this repository's standalone Customer Portal API.
unset CUSTOMER_PORTAL_API_UPSTREAM_URL API_SERVER_URL API_SERVER_URL_DEV
export CUSTOMER_PORTAL_API_URL_DEV="http://127.0.0.1:18444"
# Replit exposes the customer portal API on external port 3000. The preview
# page itself is served on external port 80, where /api is not routed through
# Vite by the Replit edge proxy.
if [[ -n "${REPLIT_DEV_DOMAIN:-}" ]]; then
  export VITE_API_PUBLIC_URL="https://${REPLIT_DEV_DOMAIN}:3000"
fi
echo "[portal] Starting standalone portal on :${PORT}"
if [[ -n "${CUSTOMER_PORTAL_API_URL_DEV:-}" ]]; then
  echo "[portal] standalone API proxy target configured"
else
  echo "[portal] standalone API proxy target is not configured; using Vite fallback"
fi
exec pnpm exec vite --config vite.config.ts --host 0.0.0.0 --port "$PORT"
