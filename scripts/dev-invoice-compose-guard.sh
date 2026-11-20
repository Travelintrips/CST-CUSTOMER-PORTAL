#!/usr/bin/env bash
# Source-only, root-executed guard for certified CST-DEV Portal deploy.
# NEVER bind plaintext /run content from host (GID1000 is githubrunner).
# A verified CMS envelope is injected into private Docker tmpfs after create.
cst_invoice_compose_guard() {
  local -n args_ref="$1"
  local runtime="${2:-/etc/cst-customer-portal-dev/runtime.env}"
  local optin="${CST_INVOICE_DEV_PRIVATE_TMPFS:-false}"
  local atomic=false
  if [[ ! -f "$runtime" ]];then
    echo "[invoice-compose] DEV runtime config unavailable" >&2;return 1
  fi
  if [[ -n "${CST_INVOICE_DEV_CREDENTIAL_DIRECTORY:-}" ]];then
    echo "[invoice-compose] legacy host plaintext bind forbidden" >&2;return 1
  fi
  if [[ "$optin" != true && "$optin" != false ]];then
    echo "[invoice-compose] invalid private tmpfs opt-in" >&2;return 1
  fi
  if grep -Eq '^[[:space:]]*CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV[[:space:]]*=[[:space:]]*(true|1)[[:space:]]*$' "$runtime"; then
    atomic=true
  fi
  if [[ "$optin" != true ]];then
    if [[ "$atomic" == true ]];then
      echo "[invoice-compose] atomic Invoice ON without private Docker tmpfs" >&2
      return 1
    fi
    return 0
  fi
  if [[ "$atomic" != true ]];then
    echo "[invoice-compose] private Invoice tmpfs opt-in requires atomic DEV gate" >&2
    return 1
  fi
  for key in CUSTOMER_PORTAL_REQUIRE_POSTED_AR_EVIDENCE_DEV CUSTOMER_PORTAL_REQUIRE_BIZPORTAL_ATTEST_DEV;do
    if ! grep -Eq "^[[:space:]]*${key}[[:space:]]*=[[:space:]]*(true|1)[[:space:]]*$" "$runtime";then
      echo "[invoice-compose] missing independent AR/Super Admin gate" >&2
      return 1
    fi
  done
  if [[ "$(id -u)" != 0 || "$(stat -f -c '%T' /run)" != tmpfs ]];then
    echo "[invoice-compose] root and kernel tmpfs required" >&2;return 1
  fi
  if [[ -n "$(getent passwd 21110 || true)" || -n "$(getent group 21110 || true)" ]];then
    echo "[invoice-compose] unique Invoice container UID conflicts with host" >&2
    return 1
  fi
  local override=ops/dev-invoice-keyless-credentials.compose.override.yml
  local helper=scripts/dev-invoice-inject-verified-cms.sh
  if [[ ! -f "$override" || ! -f "$helper" ]];then
    echo "[invoice-compose] reviewed tmpfs override/verified injector missing" >&2
    return 1
  fi
  if grep -Eq '^[[:space:]]*(volumes:|[[:space:]]+type:[[:space:]]+bind)' "$override";then
    echo "[invoice-compose] host bind prohibited in Invoice credential override" >&2
    return 1
  fi
  if ! bash "$helper" --preflight; then
    echo "[invoice-compose] root-encrypted artifact or recipient verification failed" >&2
    return 1
  fi
  args_ref+=(-f "$override")
  echo "[invoice-compose] unique UID 21110 private Docker tmpfs overlay selected"
}
