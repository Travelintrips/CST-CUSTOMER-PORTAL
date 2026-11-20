#!/usr/bin/env python3
"""Offline, synthetic-only QA of V2 custody package. Zero real secret access."""
import base64
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from unittest.mock import patch

script = Path(__file__).with_name("dev-invoice-v2-encrypt.py")
spec = importlib.util.spec_from_file_location("envelope", script)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class FakeResponse:
    def __init__(self, data): self.data = data
    def __enter__(self): return self
    def __exit__(self,*args): return False
    def read(self, length): return self.data[:length]

def expect_denied(func):
    try:
        func()
    except m.Refused:
        return
    raise AssertionError("Expected Refused")

def sample_data():
    return {
        "APP_ENV":"development","SUPABASE_PROJECT_REF":m.REF,
        "CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV":
            f"postgresql://bizportal_customer_invoice_cst_writer_dev.{m.REF}:synthetic-qa-123456@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert={m.CA_FILE}",
        "CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV":
            f"postgresql://bizportal_customer_invoice_diva_writer_dev.{m.REF}:synthetic-qa-654321@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert={m.CA_FILE}",
    }

assert m.crc32c(b"123456789") == 0xe3069283
print("CRC32C_KNOWN_VECTOR_PASS")

good_env = {
    "GITHUB_ACTIONS":"true","GITHUB_EVENT_NAME":"workflow_dispatch",
    "GITHUB_REPOSITORY":m.SOURCE,"GITHUB_REPOSITORY_ID":m.REPOSITORY_ID,
    "GITHUB_REF":"refs/heads/main","GITHUB_WORKFLOW_REF":m.WORKFLOW_REF,
    "CST_DEV_INVOICE_CUSTODY_APPROVAL":"APPROVE-ENCRYPTED-CST-DEV-V2",
    "CST_DEV_INVOICE_CUSTODY_ENABLED":"approved-reviewed",
    "GITHUB_SHA":"abcdef0123456789abcdef0123456789abcdef01",
}
assert m.validate_context(good_env) == good_env["GITHUB_SHA"]
for key,value in (
    ("GITHUB_REF","refs/heads/other"),("CST_DEV_INVOICE_CUSTODY_ENABLED",""),
    ("GITHUB_REPOSITORY_ID","999999"),("GITHUB_WORKFLOW_REF","untrusted"),
    ("GITHUB_EVENT_NAME","push"),("CST_DEV_INVOICE_CUSTODY_APPROVAL","")):
    altered=dict(good_env); altered[key]=value
    expect_denied(lambda: m.validate_context(altered))
print("WORKFLOW_CONTEXT_FENCES_PASS")

raw=json.dumps(sample_data()).encode()
m.validate_payload(raw)
bad_project=sample_data();bad_project["SUPABASE_PROJECT_REF"]="other"
bad_role=sample_data();bad_role["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"]=sample_data()["CUSTOMER_PORTAL_DIVA_INVOICE_WRITER_DSN_DEV"]
bad_tls=sample_data();bad_tls["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"]=bad_tls["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"].replace("verify-full","disable")
bad_direct=sample_data();bad_direct["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"]=bad_direct["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"].replace("bizportal_customer_invoice_cst_writer_dev."+m.REF+":synthetic", "bizportal_customer_invoice_cst_writer_dev:synthetic").replace("aws-1-ap-southeast-2.pooler.supabase.com", "db."+m.REF+".supabase.co")
bad_truncated=sample_data();bad_truncated["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"]=bad_truncated["CUSTOMER_PORTAL_CST_INVOICE_WRITER_DSN_DEV"].replace("bizportal_customer_invoice_cst_writer_dev."+m.REF+":synthetic", "bizportal_customer_invoice_cst_writer_dev:synthetic").replace("aws-1-ap-southeast-2.pooler.supabase.com", "db."+m.REF)
for d in (bad_project,bad_role,bad_tls,bad_direct,bad_truncated):
    expect_denied(lambda: m.validate_payload(json.dumps(d).encode()))
print("PROJECT_ROLE_TLS_AND_POOLER_ONLY_FENCES_PASS")

response={
    "name":m.VERSION,
    "payload":{"data":base64.b64encode(raw).decode(),"dataCrc32c":str(m.crc32c(raw))}
}
with patch.object(m.urllib.request,"urlopen",return_value=FakeResponse(json.dumps(response).encode())) as mocked:
    assert m.read_exact_gcp_version("synthetic-"+("a"*60)) == raw
    assert mocked.call_args.args[0].full_url.endswith("/versions/2:access")
print("PINNED_SECRET_VERSION_CRC32C_PASS")

response["payload"]["dataCrc32c"] = "1"
with patch.object(m.urllib.request,"urlopen",return_value=FakeResponse(json.dumps(response).encode())):
    expect_denied(lambda: m.read_exact_gcp_version("synthetic-"+("a"*60)))
print("CORRUPTED_SECRET_REFUSED_PASS")

response["payload"]["dataCrc32c"]=str(m.crc32c(raw))
response["name"]=m.VERSION.replace("/versions/2","/versions/1")
with patch.object(m.urllib.request,"urlopen",return_value=FakeResponse(json.dumps(response).encode())):
    expect_denied(lambda: m.read_exact_gcp_version("synthetic-"+("a"*60)))
print("WRONG_SECRET_VERSION_REFUSED_PASS")

cert=Path(__file__).with_name("dev-invoice-envelope-recipient.pem")
with tempfile.TemporaryDirectory(prefix="invoice-v2-custody-qa-") as temp:
    out=Path(temp)/"synthetic"
    p=subprocess.run(
        [sys.executable,str(script),"--mode","synthetic",
         "--recipient-cert",str(cert),"--out-dir",str(out)],
        capture_output=True,text=True)
    assert p.returncode==0 and "SYNTHETIC_CIPHERTEXT_ONLY_PASS" in p.stdout
    assert sorted(x.name for x in out.iterdir()) == [
        "invoice-writer-version2.cms","invoice-writer-version2.manifest.json"]
    manifest=json.loads((out/"invoice-writer-version2.manifest.json").read_text())
    assert manifest["qa_only"] is True
    assert not any(x.is_file() and "plaintext" in x.name for x in out.iterdir())
    assert (out/"invoice-writer-version2.cms").stat().st_mode & 0o777 == 0o600
    print("EPHEMERAL_SYNTHETIC_CMS_AND_NONRELEASE_MANIFEST_PASS")
    denied=subprocess.run(
        [sys.executable,str(script),"--mode","real",
         "--recipient-cert",str(cert),"--out-dir",str(Path(temp)/"real")],
        capture_output=True,text=True)
    assert denied.returncode!=0 and "CST_DEV_V2_ENVELOPE_REFUSED" in denied.stderr
    assert not (Path(temp)/"real").exists()
    print("REAL_CREDENTIAL_ACCESS_NOT_ATTEMPTED_DENIAL_PASS")

print("OFFLINE_V2_CUSTODY_QA_PASS")