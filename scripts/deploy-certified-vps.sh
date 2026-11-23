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

# Prevent a concurrent local commit or transient source change from being
# shipped under an older CI-certified release ID. Other workers are not
# required to share this deployer's flock; a start-only git check is insufficient.
assert_exact_certified_checkout() {
  if [[ "$(git rev-parse HEAD)" != "$certified_sha" ]] ||
     [[ -n "$(git status --porcelain)" ]]; then
    echo "[dev-deploy] Certified source drift detected; refusing release" >&2
    return 1
  fi
}

# Release labels are not source attestation. Hash the actual Invoice
# handler inside the live/candidate image against the Git-certified blob,
# so an unreviewed concurrent local commit cannot masquerade as certified.
assert_certified_invoice_handler() {
  local target="$1" expected actual
  expected="$(git show "$certified_sha:server/billing-operations.mjs" | sha256sum | cut -d' ' -f1)"
  if [[ "$target" == live ]]; then
    actual="$(docker exec cst-customer-portal-dev sha256sum /app/server/billing-operations.mjs 2>/dev/null | cut -d' ' -f1)"
  elif [[ "$target" == candidate || "$target" == local ]]; then
    actual="$(docker run --rm --pull never --network none --read-only \
      --cap-drop ALL --security-opt no-new-privileges \
      --entrypoint sha256sum "cst-customer-portal-dev:$target" \
      /app/server/billing-operations.mjs 2>/dev/null | cut -d' ' -f1)"
  else
    echo "[dev-deploy] Unknown Invoice handler image target" >&2
    return 1
  fi
  if [[ ! "$expected" =~ ^[0-9a-f]{64}$ ]] ||
     [[ "$actual" != "$expected" ]]; then
    echo "[dev-deploy] Invoice handler bytes do not match certified Git source; refusing" >&2
    return 1
  fi
}

# Use the same reviewed Compose files on certified forward deployment AND
# rollback. Missing credential path when Invoice atomic mode is ON must
# stop this attempt *before* updating the running DEV worktree/image.
source ./scripts/dev-invoice-compose-guard.sh
compose_files=(-f compose.dev-vps.yml)
cst_invoice_compose_guard compose_files
# Audited Accounting code is a read-only bind; reject missing, substituted
# or unsafe host files *before* advancing the certified DEV release.
python3 scripts/dev-accounting-owner-bundle-guard.py --host
# An opt-in must first have a compatible currently-running image for safe
# rollback. A legacy UID1000 image is never upgraded directly with Invoice ON.
if [[ "${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}" == true ]]; then
  if ! docker run --rm --pull never --network none \
       --entrypoint node cst-customer-portal-dev:local -e '
const fs=require("node:fs");
if(!fs.existsSync("/app/scripts/dev-invoice-tmpfs-inject.mjs") ||
   !fs.existsSync("/opt/cst-dev-finance-tls/supabase-root-2021.crt"))
  process.exit(8);' >/dev/null 2>&1; then
    echo "[dev-deploy] previous image cannot restore private Invoice tmpfs" >&2
    exit 1
  fi
fi

# Reboot-only recovery via the EXISTING certified systemd timer and injector.
# Restart wipes the private Docker tmpfs; missing credentials must still fail
# closed unless every official issuer, image, source and mount check succeeds.
if [[ "${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}" == true ]] &&
   [[ "${CST_INVOICE_DEV_FORCE_CREDENTIAL_REFRESH:-false}" != true ]] &&
   [[ "$(git rev-parse HEAD)" == "$certified_sha" ]]; then
  boot_container=cst-customer-portal-dev
  boot_running_id="$(docker inspect -f '{{.Image}}' "$boot_container" 2>/dev/null || true)"
  boot_local_id="$(docker image inspect -f '{{.Id}}' cst-customer-portal-dev:local 2>/dev/null || true)"
  boot_user="$(docker inspect -f '{{.Config.User}}' "$boot_container" 2>/dev/null || true)"
  boot_state="$(docker inspect -f '{{.State.Status}}' "$boot_container" 2>/dev/null || true)"
  boot_restart="$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$boot_container" 2>/dev/null || true)"
  boot_project="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$boot_container" 2>/dev/null || true)"
  boot_service="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$boot_container" 2>/dev/null || true)"
  if [[ -n "$boot_running_id" && "$boot_running_id" == "$boot_local_id" &&
        "$boot_state" =~ ^(running|restarting)$ &&
        "$boot_restart" == "unless-stopped" &&
        "$boot_user" == "21110:21110" &&
        "$boot_project" == "cst-customer-portal-dev" &&
        "$boot_service" == "customer-portal-dev" ]] &&
     docker inspect -f '{{json .HostConfig.Tmpfs}}' "$boot_container" 2>/dev/null |
       grep -Fq '/run/credentials/cst-customer-portal-dev.service'; then
    boot_env="$(docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$boot_container" 2>/dev/null || true)"
    boot_flags_ok=true
    for boot_item in "PORTAL_RELEASE_ID=$certified_sha" "APP_ENV=development" \
      "NODE_ENV=development" \
      "CREDENTIALS_DIRECTORY=/run/credentials/cst-customer-portal-dev.service" \
      "CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV=true" \
      "CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV=true" \
      "CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV=true"; do
      if ! grep -Fxq "$boot_item" <<< "$boot_env"; then
        boot_flags_ok=false
        break
      fi
    done
    unset boot_env
    if [[ "$boot_flags_ok" == true ]] &&
       ! docker exec --user 21110:21110 "$boot_container" sh -c \
         'test -r /run/credentials/cst-customer-portal-dev.service/customer-invoice-writers-dev.json' \
         >/dev/null 2>&1; then
      assert_exact_certified_checkout
      assert_certified_invoice_handler local
      echo "[dev-deploy] Restoring exact certified V3 private tmpfs after reboot"
      boot_injected=false
      for boot_attempt in $(seq 1 12); do
        if [[ "$(docker inspect -f '{{.State.Running}}' "$boot_container" 2>/dev/null || true)" == true ]] &&
           bash ./scripts/dev-invoice-inject-verified-cms.sh "$boot_container"; then
          boot_injected=true
          break
        fi
        sleep 2
      done
      if [[ "$boot_injected" != true ]]; then
        echo "[dev-deploy] Reboot credential recovery refused; retaining fail-closed app" >&2
        exit 1
      fi
      # Reboot destroys both private tmpfs credentials. Restore SMTP before
      # readiness is reported successful so OTP capability is not silently lost.
      smtp_credential="/etc/cst-customer-portal-dev/credentials/hostinger-smtp-pass"
      if [[ -f "$smtp_credential" ]]; then
        boot_smtp_injected=false
        for boot_attempt in $(seq 1 12); do
          if [[ "$(docker inspect -f '{{.State.Running}}' "$boot_container" 2>/dev/null || true)" == true ]] &&
             bash ./scripts/dev-smtp-inject-encrypted-app-password.sh "$boot_container"; then
            boot_smtp_injected=true
            break
          fi
          sleep 2
        done
        if [[ "$boot_smtp_injected" != true ]]; then
          echo "[dev-deploy] Reboot SMTP credential recovery refused; OTP stays unavailable" >&2
          exit 1
        fi
      fi
      for boot_attempt in $(seq 1 20); do
        boot_ready="$(curl -fsS --max-time 3 http://127.0.0.1:18444/api/readyz 2>/dev/null || true)"
        boot_release="$(curl -fsS --max-time 3 http://127.0.0.1:18444/api/portal/release-info 2>/dev/null | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(s).releaseId||"")}catch{}})' || true)"
        boot_home="$(curl -sS --max-time 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:18444/ || true)"
        if [[ "$boot_ready" == *'"status":"ready"'* &&
              "$boot_release" == "$certified_sha" && "$boot_home" == 200 ]]; then
          assert_exact_certified_checkout
          echo "[dev-deploy] PASS: verified reboot-only V3 credential recovery $certified_sha"
          exit 0
        fi
        sleep 2
      done
      echo "[dev-deploy] Reboot credential injected but API not ready; refusing release" >&2
      exit 1
    fi
  fi
fi

running_sha="$(curl -fsS --max-time 5 http://127.0.0.1:18444/api/portal/release-info 2>/dev/null | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(s).releaseId||"")}catch{}})' || true)"
if [[ "$running_sha" == "$certified_sha" ]]; then
  assert_certified_invoice_handler live
  # Keep regular releases idempotent; never refresh Invoice credentials without
  # the original root preflight, verified CMS, and private Docker tmpfs opt-in.
  if [[ "${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}" != true ]]; then
    echo "[dev-deploy] Already healthy at certified release $certified_sha"
    exit 0
  fi
  # Do not restart if the certified private mount already contains credentials.
  # Force refresh is permitted only via explicit DEV deployment opt-in.
  if [[ "${CST_INVOICE_DEV_FORCE_CREDENTIAL_REFRESH:-false}" != true ]] &&
     [[ "$(docker inspect -f '{{.Config.User}}' cst-customer-portal-dev 2>/dev/null || true)" == "21110:21110" ]] &&
     docker exec --user 21110:21110 cst-customer-portal-dev sh -c \
       'test -r /run/credentials/cst-customer-portal-dev.service/customer-invoice-writers-dev.json' 2>/dev/null; then
    # If the Hostinger App Password has been provisioned, restore it into
    # the container's private tmpfs after any container restart. The encrypted
    # host artifact is never mounted or exposed in env/argv.
    smtp_credential="/etc/cst-customer-portal-dev/credentials/hostinger-smtp-pass"
    if [[ -f "$smtp_credential" ]]; then
      if ! docker exec --user 21110:21110 cst-customer-portal-dev sh -c \
        'test -r /run/credentials/cst-customer-portal-dev.service/hostinger-smtp-pass' 2>/dev/null; then
        bash ./scripts/dev-smtp-inject-encrypted-app-password.sh cst-customer-portal-dev
      fi
    fi
    echo "[dev-deploy] Certified Invoice credentials already installed"
    exit 0
  fi
  echo "[dev-deploy] Credential-only certified DEV rollout required"
fi

git merge --ff-only "$certified_sha"
assert_exact_certified_checkout
echo "[dev-deploy] Verifying certified commit $certified_sha"
CI=true pnpm install --frozen-lockfile --network-concurrency=2 >/dev/null
pnpm typecheck >/dev/null
CI=true APP_ENV=development NODE_ENV=test SESSION_SECRET=customer-portal-vps-ci-check-secret-32 SUPABASE_DATABASE_URL_DEV=postgresql://ci:ci@127.0.0.1:5432/ci pnpm exec vitest run --maxWorkers=1 --no-file-parallelism >/dev/null
assert_exact_certified_checkout
nice -n 15 ionice -c3 timeout 240 docker build --pull=false -f Dockerfile.dev-vps --build-arg DEV_RELEASE_SHA="$certified_sha" -t cst-customer-portal-dev:candidate . >/dev/null
assert_exact_certified_checkout
assert_certified_invoice_handler candidate

backup=0
if docker image inspect cst-customer-portal-dev:local >/dev/null 2>&1; then
  docker tag cst-customer-portal-dev:local cst-customer-portal-dev:rollback
  backup=1
fi
docker tag cst-customer-portal-dev:candidate cst-customer-portal-dev:local
assert_exact_certified_checkout
if ! DEV_RELEASE_SHA="$certified_sha" docker compose "${compose_files[@]}" up -d --no-build --force-recreate --no-deps customer-portal-dev; then
  echo "[dev-deploy] Compose failed" >&2
  failed=1
else
  failed=1
  injected=true
  if [[ "${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}" == true ]]; then
    if ! bash ./scripts/dev-invoice-inject-verified-cms.sh cst-customer-portal-dev; then
      echo "[dev-deploy] Private Invoice tmpfs injection failed closed" >&2
      injected=false
    fi
  fi
  smtp_credential="/etc/cst-customer-portal-dev/credentials/hostinger-smtp-pass"
  if [[ "$injected" == true && -f "$smtp_credential" ]]; then
    if ! bash ./scripts/dev-smtp-inject-encrypted-app-password.sh cst-customer-portal-dev; then
      echo "[dev-deploy] SMTP private tmpfs injection failed closed" >&2
      injected=false
    fi
  fi
  if [[ "$injected" == true ]]; then
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
fi
if [[ "$failed" == 0 ]]; then
  echo "[dev-deploy] PASS: DEV release $certified_sha; API ready, home 200"
  exit 0
fi
echo "[dev-deploy] FAILED: restoring previous DEV image" >&2
if [[ "$backup" == 1 ]]; then
  docker tag cst-customer-portal-dev:rollback cst-customer-portal-dev:local
  if DEV_RELEASE_SHA="$running_sha" docker compose "${compose_files[@]}" up -d --no-build --force-recreate --no-deps customer-portal-dev; then
    if [[ "${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}" == true ]]; then
      if ! bash ./scripts/dev-invoice-inject-verified-cms.sh cst-customer-portal-dev; then
        echo "[dev-deploy] ROLLBACK private Invoice credential injection failed closed" >&2
      fi
    fi
    smtp_credential="/etc/cst-customer-portal-dev/credentials/hostinger-smtp-pass"
    if [[ -f "$smtp_credential" ]]; then
      if ! bash ./scripts/dev-smtp-inject-encrypted-app-password.sh cst-customer-portal-dev; then
        echo "[dev-deploy] ROLLBACK SMTP private tmpfs injection failed closed" >&2
      fi
    fi
  else
    echo "[dev-deploy] rollback Compose failed" >&2
  fi
fi
exit 1
