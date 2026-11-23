#!/usr/bin/env bash
# Root-only transport from the systemd-creds encrypted file to private
# container tmpfs. Plaintext exists only in a pipe and container memory/tmpfs.
set -euo pipefail
umask 077
container="${1:-cst-customer-portal-dev}"
credential="/etc/cst-customer-portal-dev/credentials/hostinger-smtp-pass"
if [[ "$(id -u)" != 0 || "$container" != "cst-customer-portal-dev" ]]; then
  echo "DEV_SMTP_ROOT_OR_CONTAINER_IDENTITY_MISMATCH" >&2; exit 2
fi
if [[ ! -f "$credential" || -L "$credential" ||
      "$(stat -c '%u:%g:%a' "$credential")" != "0:0:600" ]]; then
  echo "DEV_SMTP_ENCRYPTED_CREDENTIAL_OWNER_OR_MODE_INVALID" >&2; exit 3
fi
if [[ "$(docker inspect "$container" --format '{{.State.Running}}' 2>/dev/null)" != true ]]; then
  echo "DEV_SMTP_CONTAINER_NOT_RUNNING" >&2; exit 4
fi
effective="$(docker exec --user 21110:21110 "$container" id -u)"
if [[ "$effective" != 21110 ]]; then
  echo "DEV_SMTP_CONTAINER_UID_MISMATCH" >&2; exit 5
fi
systemd-creds decrypt "$credential" - |
  docker exec -i --user 21110:21110 "$container" node /app/scripts/dev-smtp-tmpfs-inject.mjs
echo "DEV_SMTP_ENCRYPTED_TO_PRIVATE_TMPFS_PASS"
