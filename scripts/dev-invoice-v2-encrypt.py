#!/usr/bin/env python3
"""CST Invoice DEV V2 ciphertext packaging on an approved ephemeral GitHub runner.

No plaintext on disk, no secret in argv, workflow logs, or Actions artifacts.
Production and PostgreSQL role administration are out of scope.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.parse
import urllib.request

VERSION = "projects/653506647312/secrets/bizportal-customer-invoice-writers-dev-companies/versions/2"
SOURCE = "Travelintrips/CST-CUSTOMER-PORTAL"
REPOSITORY_ID = "1369747600"
WORKFLOW_REF = SOURCE + "/.github/workflows/dev-invoice-v2-custody-package.yml@refs/heads/main"
CERT_SHA = "38a9abcbbcca3535601265ae2c9a8a4b574f90767b5fe83291d38bf4513cb334"
REF = "xssrfshdrtdfupgqwfdw"
CA_FILE = "/opt/cst-dev-finance-tls/supabase-root-2021.crt"
EXPECTED_KEYS = {
    "APP_ENV", "SUPABASE_PROJECT_REF",
    "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV",
    "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV",
}
ROLE_NAMES = {
    "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV": "bizportal_customer_invoice_cst_writer_dev",
    "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV": "bizportal_customer_invoice_diva_writer_dev",
}

class Refused(Exception):
    pass

def crc32c(message: bytes) -> int:
    crc = 0xffffffff
    for byte in message:
        crc ^= byte
        for _ in range(8):
            crc = (crc >> 1) ^ (0x82f63b78 if crc & 1 else 0)
    return crc ^ 0xffffffff

def validate_context(env: dict) -> str:
    required = {
        "GITHUB_ACTIONS": "true",
        "GITHUB_EVENT_NAME": "workflow_dispatch",
        "GITHUB_REPOSITORY": SOURCE,
        "GITHUB_REPOSITORY_ID": REPOSITORY_ID,
        "GITHUB_REF": "refs/heads/main",
        "GITHUB_WORKFLOW_REF": WORKFLOW_REF,
        "CST_DEV_INVOICE_CUSTODY_APPROVAL": "APPROVE-ENCRYPTED-CST-DEV-V2",
        "CST_DEV_INVOICE_CUSTODY_ENABLED": "approved-reviewed",
    }
    if any(env.get(k) != v for k, v in required.items()):
        raise Refused("UNAUTHORIZED_WORKFLOW_CONTEXT")
    sha = env.get("GITHUB_SHA", "")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise Refused("INVALID_SOURCE_COMMIT")
    return sha

def validate_dsn(raw: str, role: str) -> None:
    if not isinstance(raw, str) or not 20 <= len(raw) <= 4096:
        raise Refused("INVALID_COMPANY_SCOPED_DSN")
    try:
        u = urllib.parse.urlsplit(raw)
        host, port, uname = u.hostname, u.port, u.username
        password = u.password
        query = urllib.parse.parse_qs(u.query, keep_blank_values=True)
    except ValueError:
        raise Refused("INVALID_COMPANY_SCOPED_DSN") from None
    pooler = bool(re.fullmatch(r"aws-[0-9]+-ap-southeast-[12][.]pooler[.]supabase[.]com", host or ""))
    # The existing CST-DEV application writer supports verified session-pooler DSNs.
    # Direct endpoints must not pass until application hostname support is reviewed.
    expected_user = role + "." + REF
    if (u.scheme != "postgresql" or u.fragment or port != 5432
        or u.path != "/postgres" or not pooler
        or uname != expected_user or not password or len(password) < 8
        or set(query) != {"sslmode", "sslrootcert"}
        or query["sslmode"] != ["verify-full"]
        or query["sslrootcert"] != [CA_FILE]):
        raise Refused("INVALID_COMPANY_SCOPED_DSN")

def validate_payload(raw: bytes) -> None:
    if not (80 <= len(raw) <= 16384):
        raise Refused("INVALID_SECRET_FORMAT")
    try:
        doc = json.loads(raw)
        if (not isinstance(doc, dict) or set(doc) != EXPECTED_KEYS
            or doc["APP_ENV"] != "development"
            or doc["SUPABASE_PROJECT_REF"] != REF):
            raise Refused("INVALID_SECRET_FORMAT")
        for field, role in ROLE_NAMES.items():
            validate_dsn(doc[field], role)
        if doc[next(iter(ROLE_NAMES))] == doc[list(ROLE_NAMES)[1]]:
            raise Refused("DUPLICATE_COMPANY_DSN")
    except (ValueError, TypeError, UnicodeDecodeError):
        raise Refused("INVALID_SECRET_FORMAT") from None

def read_exact_gcp_version(access_token: str) -> bytes:
    if not access_token or len(access_token) < 30:
        raise Refused("MISSING_KEYLESS_ACCESS_TOKEN")
    api_url = "https://secretmanager.googleapis.com/v1/" + VERSION + ":access"
    request = urllib.request.Request(
        api_url, headers={"Authorization": "Bearer " + access_token,
                          "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            raw_response = response.read(40001)
        if len(raw_response) > 40000:
            raise Refused("SECRET_RESPONSE_TOO_LARGE")
        result = json.loads(raw_response)
        if result.get("name") != VERSION:
            raise Refused("SECRET_VERSION_MISMATCH")
        wire = result.get("payload", {})
        plaintext = bytearray(base64.b64decode(wire["data"], validate=True))
        if wire.get("dataCrc32c") is None or crc32c(plaintext) != int(wire["dataCrc32c"]):
            plaintext[:] = bytes(len(plaintext))
            raise Refused("SECRET_INTEGRITY_INVALID")
        try:
            validate_payload(plaintext)
        except Exception:
            plaintext[:] = bytes(len(plaintext))
            raise
        return plaintext
    except Refused:
        raise
    except Exception:
        raise Refused("APPROVED_SECRET_ACCESS_FAILED") from None

def validate_recipient_certificate(cert_file: Path) -> None:
    try:
        completed = subprocess.run(
            ["openssl", "x509", "-in", str(cert_file), "-outform", "DER"],
            capture_output=True, check=True)
        if hashlib.sha256(completed.stdout).hexdigest() != CERT_SHA:
            raise Refused("RECIPIENT_CERTIFICATE_MISMATCH")
    except (OSError, subprocess.CalledProcessError):
        raise Refused("RECIPIENT_CERTIFICATE_INVALID") from None

def encrypt_only(plaintext: bytes, certificate: Path, destination: Path) -> None:
    output = destination / "invoice-writer-version2.cms"
    try:
        with output.open("xb") as f:
            os.chmod(output, 0o600)
            completed = subprocess.run(
                ["openssl", "cms", "-encrypt", "-binary", "-aes-256-gcm",
                 "-outform", "DER", str(certificate)],
                input=plaintext, stdout=f, stderr=subprocess.DEVNULL, check=True)
        if not output.stat().st_size:
            raise Refused("ENVELOPE_EMPTY")
    except (OSError, subprocess.CalledProcessError):
        output.unlink(missing_ok=True)
        raise Refused("ENVELOPE_ENCRYPTION_FAILED") from None

def run(*, mode: str, out_dir: Path, cert_file: Path, env: dict) -> None:
    sha = validate_context(env) if mode == "real" else "0" * 40
    validate_recipient_certificate(cert_file)
    if mode == "real":
        payload = read_exact_gcp_version(env.get("GCP_ACCESS_TOKEN", ""))
    else:
        payload = bytearray(json.dumps({
            "APP_ENV": "development", "SUPABASE_PROJECT_REF": REF,
            "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV":
              f"postgresql://bizportal_customer_invoice_cst_writer_dev.{REF}:synthetic-pass-12345@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert={CA_FILE}",
            "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV":
              f"postgresql://bizportal_customer_invoice_diva_writer_dev.{REF}:synthetic-pass-45678@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert={CA_FILE}",
        }).encode())
        validate_payload(payload)
    try:
        out_dir.mkdir(mode=0o700, parents=False, exist_ok=False)
        encrypt_only(payload, cert_file, out_dir)
        sha256 = hashlib.sha256((out_dir / "invoice-writer-version2.cms").read_bytes()).hexdigest()
        manifest = {
            "source_sha": sha, "certificate_sha256": CERT_SHA,
            "envelope_sha256": sha256, "secret_version": VERSION,
            "credential_count": 2, "format": "CMS-AES-256-GCM"
        }
        if mode == "synthetic":
            # Deliberately incompatible with the real V2 manifest validator.
            manifest["qa_only"] = True
        outfile = out_dir / "invoice-writer-version2.manifest.json"
        with outfile.open("x", encoding="utf-8") as f:
            os.chmod(outfile, 0o600)
            json.dump(manifest, f, separators=(",", ":"))
    finally:
        # Overwrite the mutable buffer; Python and subprocess may retain copies
        # transiently, so ephemeral runner cleanup is still required.
        payload[:] = bytes(len(payload))
    print("SYNTHETIC_CIPHERTEXT_ONLY_PASS" if mode == "synthetic"
          else "CST_DEV_V2_CIPHERTEXT_PACKAGE_READY")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("real", "synthetic"), required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--recipient-cert", type=Path, required=True)
    args = parser.parse_args()
    try:
        run(mode=args.mode, out_dir=args.out_dir, cert_file=args.recipient_cert,
            env=os.environ)
    except Exception as exc:
        # Never print raw exceptions: HTTP/JSON/openssl errors may contain sensitive data.
        print("CST_DEV_V2_ENVELOPE_REFUSED", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()