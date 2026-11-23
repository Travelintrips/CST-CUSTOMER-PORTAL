#!/usr/bin/env bash
# One-time secure entry of the Hostinger mailbox App Password.
# Input is hidden, encrypted at rest by systemd-creds, never logged or echoed.
set -euo pipefail
umask 077
if [[ "$(id -u)" != 0 || ! -t 0 ]]; then
  echo "Run this script as root from an interactive terminal." >&2; exit 2
fi
directory="/etc/cst-customer-portal-dev/credentials"
target="$directory/hostinger-smtp-pass"
if [[ -e "$target" || -L "$target" ]]; then
  echo "An encrypted Hostinger SMTP credential already exists; rotation is not automatic." >&2; exit 3
fi
if [[ -L "$directory" ]]; then
  echo "Credential directory must not be a symlink." >&2; exit 5
fi
install -d -o root -g root -m 0700 "$directory"
if [[ "$(stat -c '%u:%g:%a' "$directory")" != "0:0:700" ]]; then
  echo "Credential directory owner or mode rejected." >&2; exit 6
fi
read -r -s -p "Hostinger App Password for hrd@cstlogistic.co.id (input hidden): " password
printf '\n'
if [[ ${#password} -lt 8 || ${#password} -gt 512 || ! "$password" =~ ^[[:graph:]]+$ ]]; then
  unset password
  echo "App Password format rejected." >&2; exit 4
fi
tempdir="$(mktemp -d "$directory/.smtp-credential.XXXXXX")"
cleanup(){ unset password || true; rm -rf "$tempdir"; }
trap cleanup EXIT
printf '%s' "$password" |
  systemd-creds --name=hostinger-smtp-pass --with-key=host --newline=no encrypt - "$tempdir/hostinger-smtp-pass" >/dev/null
unset password
systemd-creds decrypt "$tempdir/hostinger-smtp-pass" - |
  python3 -c 'import sys; b=sys.stdin.buffer.read(); ok=8 <= len(b) <= 512 and all(33 <= x <= 126 for x in b); print("SYSTEMD_CREDENTIAL_ROUNDTRIP_PASS" if ok else "SYSTEMD_CREDENTIAL_ROUNDTRIP_FAIL"); sys.exit(0 if ok else 1)'
chown root:root "$tempdir/hostinger-smtp-pass"
chmod 0600 "$tempdir/hostinger-smtp-pass"
mv -T "$tempdir/hostinger-smtp-pass" "$target"
echo "HOSTINGER_SMTP_APP_PASSWORD_ENCRYPTED_AT_REST_PASS"
echo "No password was printed or stored in runtime.env."
