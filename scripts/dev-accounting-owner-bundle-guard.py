#!/usr/bin/env python3
"""Verify the already-reviewed, five-file BizPortal Accounting owner bundle.

This checks only public code files on CST-DEV. It never handles credentials,
activates Finance, runs a journal, or changes the active container.
"""
import hashlib
import os
from pathlib import Path
import re
import stat
import sys

SOURCE = Path("server/dev-original-accounting-owner-loader.mjs")
COMPOSE = Path("compose.dev-vps.yml")
HOST_DIR = Path("/opt/cst-customer-invoice-owner-bundle-dev")
EXPECTED = {
    "portalInvoiceAdapter.mjs": "7f6568dd838b18698078ed87d4a2c64bc8014ff73f278df405d62fa35628d367",
    "pino-file.mjs": "bbc4281497fe72cf43c497927570f930aaed27f73481e652ccfef6a5d1e102f2",
    "pino-pretty.mjs": "db4343e9a60574d43281e8e6731ec71a1317c53737c5cfc11049cd565ceae8ea",
    "pino-worker.mjs": "b1905ab6d4843945437af840160a682b9d86c3bee9ae7cb96f21032a98652297",
    "thread-stream-worker.mjs": "8d292b213919ff58dce983d0a34f68f3224345411fea8af1b64b11ec8cbeb249",
}

def assert_source_and_compose():
    source = SOURCE.read_text()
    compose = COMPOSE.read_text()
    expected_block = (
        "      - type: bind\n"
        "        source: /opt/cst-customer-invoice-owner-bundle-dev\n"
        "        target: /opt/cst-customer-invoice-owner-bundle-dev\n"
        "        read_only: true\n"
        "        bind:\n"
        "          create_host_path: false\n"
    )
    if compose.count(expected_block) != 1 or compose.count(
        "source: /opt/cst-customer-invoice-owner-bundle-dev"
    ) != 1:
        raise ValueError("READONLY_BIND_CONFIG_INVALID")
    for name, digest in EXPECTED.items():
        if name == "portalInvoiceAdapter.mjs":
            marker = 'DEV_ACCOUNTING_OWNER_SHA256 =\n  "' + digest + '"'
            if marker not in source:
                raise ValueError("LOADER_PRIMARY_PIN_MISMATCH")
        else:
            marker = '"' + name + '": "' + digest + '"'
            if marker not in source:
                raise ValueError("LOADER_WORKER_PIN_MISMATCH")
    if '"/opt/cst-customer-invoice-owner-bundle-dev"' not in source:
        raise ValueError("LOADER_PATH_MISMATCH")
    print("DEV_OWNER_READONLY_COMPOSE_AND_LOADER_PINS_PASS")

def assert_host():
    if os.geteuid() != 0:
        raise ValueError("ROOT_REQUIRED_FOR_HOST_PROOF")
    if HOST_DIR.is_symlink() or not HOST_DIR.is_dir():
        raise ValueError("OWNER_BUNDLE_DIRECTORY_UNSAFE")
    d = HOST_DIR.lstat()
    if (d.st_uid, d.st_gid, stat.S_IMODE(d.st_mode)) != (0, 0, 0o755):
        raise ValueError("OWNER_BUNDLE_DIRECTORY_MODE_INVALID")
    actual = {item.name for item in HOST_DIR.iterdir()}
    if actual != set(EXPECTED):
        raise ValueError("OWNER_BUNDLE_UNEXPECTED_ENTRIES")
    for name, expected in EXPECTED.items():
        file = HOST_DIR / name
        meta = file.lstat()
        if (not stat.S_ISREG(meta.st_mode) or file.is_symlink()
            or (meta.st_uid, meta.st_gid, stat.S_IMODE(meta.st_mode)) !=
            (0, 0, 0o644)):
            raise ValueError("OWNER_BUNDLE_FILE_MODE_INVALID")
        if hashlib.sha256(file.read_bytes()).hexdigest() != expected:
            raise ValueError("OWNER_BUNDLE_SHA_MISMATCH")
    print("DEV_ORIGINAL_ACCOUNTING_OWNER_BUNDLE_5_OF_5_SHA_PASS")

def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--static", "--host"):
        raise ValueError("USE_STATIC_OR_HOST")
    assert_source_and_compose()
    if sys.argv[1] == "--host":
        assert_host()

if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("DEV_OWNER_BUNDLE_PREFLIGHT_REFUSED")
        raise SystemExit(2)
