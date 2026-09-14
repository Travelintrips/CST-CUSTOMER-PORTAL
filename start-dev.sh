#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export NODE_ENV="${NODE_ENV:-development}"
export PORT="${PORT:-5000}"
export VITE_API_SERVER_URL="${VITE_API_SERVER_URL:-${API_SERVER_URL:-http://127.0.0.1:18444}}"
echo "[portal] Starting standalone portal on :${PORT}"
if [[ -n "${VITE_API_SERVER_URL:-}" ]]; then
  echo "[portal] API proxy target configured"
else
  echo "[portal] API proxy target is not configured; using Vite fallback"
fi
exec pnpm exec vite --config vite.config.ts --host 0.0.0.0 --port "$PORT"
