#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export APP_ENV=production
export NODE_ENV=production

if [[ -z "${PORT:-}" ]]; then
  echo "[customer-portal] PORT is required in production" >&2
  exit 1
fi

exec node server/load-secrets.mjs node server/index.mjs