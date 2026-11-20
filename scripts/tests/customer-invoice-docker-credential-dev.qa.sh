#!/usr/bin/env bash
# Backward-compatible QA entrypoint. The old host root:node bind is unsafe
# on VPS because host GitHub runner uses GID 1000. Never reintroduce it.
set -euo pipefail
source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$source_dir/customer-invoice-private-tmpfs-docker.qa.sh"
