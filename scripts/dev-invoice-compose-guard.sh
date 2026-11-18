#!/usr/bin/env bash
# Source-only guard for the existing certified Customer Portal DEV deployment.
# This does not activate the Invoice feature or modify any live resources.
# Caller: source this file; cst_invoice_compose_guard compose_args
cst_invoice_compose_guard() {
  local -n args_ref="$1"
  local runtime="${2:-/etc/cst-customer-portal-dev/runtime.env}"
  local source_dir="${CST_INVOICE_DEV_CREDENTIAL_DIRECTORY:-}"
  local override="ops/dev-invoice-keyless-credentials.compose.override.yml"
  local required_name="customer-invoice-writers-dev.json"
  local flag="CUSTOMER_PORTAL_ATOMIC_ACCOUNTING_POST_DEV"
  if [[ ! -f "$runtime" ]]; then
    echo "[invoice-compose] DEV runtime environment missing; refusing deployment" >&2
    return 1
  fi
  # The atomic Invoice feature cannot be enabled without its scoped
  # credential volume; no silent postgres or shared Finance fallback.
  if [[ -z "$source_dir" ]]; then
    if grep -Eq "^[[:space:]]*${flag}[[:space:]]*=[[:space:]]*(true|1)[[:space:]]*$" "$runtime"; then
      echo "[invoice-compose] Invoice active but credential directory absent" >&2
      return 1
    fi
    return 0
  fi
  if [[ "$source_dir" != /run/* || "$source_dir" == *".."* ||
        "$source_dir" == */ || ! -d "$source_dir" ||
        -L "$source_dir" || "$(realpath -e "$source_dir")" != "$source_dir" ||
        "$(stat -f -c '%T' /run)" != tmpfs ]]; then
    echo "[invoice-compose] Invoice credential directory is not a safe /run path" >&2
    return 1
  fi
  local payload="$source_dir/$required_name"
  if [[ ! -f "$payload" || -L "$payload" ||
        "$(realpath -e "$payload")" != "$payload" ||
        ! -s "$payload" || ! -r "$payload" ]]; then
    echo "[invoice-compose] Invoice credential file absent/unsafe" >&2
    return 1
  fi
  # Host is root; actual Customer Portal image runs as node UID/GID 1000.
  # Only root and node group can read; no other user can inspect the bundle.
  if [[ "$(stat -c '%u:%g:%a' "$source_dir")" != "0:1000:750" ||
        "$(stat -c '%u:%g:%a' "$payload")" != "0:1000:440" ]]; then
    echo "[invoice-compose] Invoice credential permissions mismatch" >&2
    return 1
  fi
  if [[ ! -f "$override" ]]; then
    echo "[invoice-compose] Reviewed credential override is missing" >&2
    return 1
  fi
  export CST_INVOICE_DEV_CREDENTIAL_DIRECTORY="$source_dir"
  args_ref+=(-f "$override")
  echo "[invoice-compose] Scoped read-only Invoice credential override selected"
}
