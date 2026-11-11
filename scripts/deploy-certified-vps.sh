#!/usr/bin/env bash
set -euo pipefail
cd /opt/cst-customer-portal-dev
exec 9>/run/lock/cst-customer-portal-dev-deploy.lock
flock -n 9 || { echo "[dev-deploy] Already running"; exit 0; }

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[dev-deploy] Refusing dirty worktree" >&2
  exit 1
fi
remote_sha="$(GIT_TERMINAL_PROMPT=0 timeout 30 git ls-remote origin refs/heads/dev-vps-certified | cut -f1)"
if [[ -z "$remote_sha" ]]; then
  echo "[dev-deploy] No CI-certified DEV release yet; retaining running image"
  exit 0
fi
GIT_TERMINAL_PROMPT=0 timeout 60 git fetch --no-tags origin refs/heads/dev-vps-certified
certified_sha="$(git rev-parse FETCH_HEAD)"
if [[ "$certified_sha" != "$remote_sha" ]]; then
  echo "[dev-deploy] Certified ref moved; retry on next cycle" >&2
  exit 1
fi
if ! git merge-base --is-ancestor HEAD "$certified_sha"; then
  echo "[dev-deploy] Refusing non-fast-forward or unrecognized certified history" >&2
  exit 1
fi

running_sha="$(curl -fsS --max-time 5 http://127.0.0.1:18444/api/portal/release-info 2>/dev/null | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(s).releaseId||"")}catch{}})' || true)"
if [[ "$running_sha" == "$certified_sha" ]]; then
  echo "[dev-deploy] Already healthy at certified release $certified_sha"
  exit 0
fi

git merge --ff-only "$certified_sha"
echo "[dev-deploy] Verifying certified commit $certified_sha"
CI=true pnpm install --frozen-lockfile --network-concurrency=2 >/dev/null
pnpm typecheck >/dev/null
CI=true APP_ENV=development NODE_ENV=test SESSION_SECRET=customer-portal-vps-ci-check-secret-32 SUPABASE_DATABASE_URL_DEV=postgresql://ci:ci@127.0.0.1:5432/ci pnpm test -- --maxWorkers=1 >/dev/null
nice -n 15 ionice -c3 timeout 240 docker build --pull=false -f Dockerfile.dev-vps --build-arg DEV_RELEASE_SHA="$certified_sha" -t cst-customer-portal-dev:candidate . >/dev/null

backup=0
if docker image inspect cst-customer-portal-dev:local >/dev/null 2>&1; then
  docker tag cst-customer-portal-dev:local cst-customer-portal-dev:rollback
  backup=1
fi
docker tag cst-customer-portal-dev:candidate cst-customer-portal-dev:local
if ! DEV_RELEASE_SHA="$certified_sha" docker compose -f compose.dev-vps.yml up -d --no-build --force-recreate --no-deps customer-portal-dev; then
  echo "[dev-deploy] Compose failed" >&2
  failed=1
else
  failed=1
  for _ in $(seq 1 24); do
    ready="$(curl -fsS --max-time 5 http://127.0.0.1:18444/api/readyz 2>/dev/null || true)"
    home="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:18444/ || true)"
    release="$(curl -fsS --max-time 5 http://127.0.0.1:18444/api/portal/release-info 2>/dev/null | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(s).releaseId||"")}catch{}})' || true)"
    if [[ "$ready" == *'"status":"ready"'* && "$home" == 200 && "$release" == "$certified_sha" ]]; then
      failed=0
      break
    fi
    sleep 5
  done
fi
if [[ "$failed" == 0 ]]; then
  echo "[dev-deploy] PASS: DEV release $certified_sha; API ready, home 200"
  exit 0
fi
echo "[dev-deploy] FAILED: restoring previous DEV image" >&2
if [[ "$backup" == 1 ]]; then
  docker tag cst-customer-portal-dev:rollback cst-customer-portal-dev:local
  DEV_RELEASE_SHA="$running_sha" docker compose -f compose.dev-vps.yml up -d --no-build --force-recreate --no-deps customer-portal-dev || true
fi
exit 1
