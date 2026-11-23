import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root=process.cwd();
const deploy=fs.readFileSync(path.join(root,"scripts/deploy-certified-vps.sh"),"utf8");
const dockerfile=fs.readFileSync(path.join(root,"Dockerfile.dev-vps"),"utf8");
const store=fs.readFileSync(path.join(root,"scripts/store-hostinger-smtp-app-password.sh"),"utf8");
const inject=fs.readFileSync(path.join(root,"scripts/dev-smtp-inject-encrypted-app-password.sh"),"utf8");
const runtime=fs.readFileSync(path.join(root,"server/auth-providers.mjs"),"utf8");

describe("Hostinger SMTP secret custody",()=>{
  it("requests the App Password with hidden terminal input and encrypts it with systemd-creds",()=>{
    expect(store).toContain("read -r -s");
    expect(store).toContain("systemd-creds");
    expect(store).toContain("--with-key=host");
    expect(store).toContain("SYSTEMD_CREDENTIAL_ROUNDTRIP_PASS");
    expect(store).not.toContain("echo \"$password\"");
  });
  it("pipes decrypted credential to the private tmpfs injector without env or argv exposure",()=>{
    expect(inject).toContain("systemd-creds decrypt");
    expect(inject).toContain("docker exec -i --user 21110:21110");
    expect(inject).toContain("dev-smtp-tmpfs-inject.mjs");
    expect(inject).not.toContain("SMTP_PASS=");
  });
  it("restores the SMTP tmpfs file after a deploy or container restart",()=>{
    expect(deploy).toContain("dev-smtp-inject-encrypted-app-password.sh");
    expect(deploy).toContain("hostinger-smtp-pass");
    expect(deploy).toContain("Reboot destroys both private tmpfs credentials");
    expect(deploy).toContain("Reboot SMTP credential recovery refused");
  });
  it("copies the SMTP tmpfs injector into the final image",()=>{
    expect(dockerfile).toContain("COPY --from=build /app/scripts/dev-smtp-tmpfs-inject.mjs ./scripts/dev-smtp-tmpfs-inject.mjs");
  });
  it("keeps the storage and injection scripts syntactically valid",()=>{
    for (const script of [
      "scripts/store-hostinger-smtp-app-password.sh",
      "scripts/dev-smtp-inject-encrypted-app-password.sh",
    ]) {
      expect(() => execFileSync("bash", ["-n", path.join(root,script)]))
        .not.toThrow();
    }
    expect(() => execFileSync("node", ["--check", path.join(root,"scripts/dev-smtp-tmpfs-inject.mjs")]))
      .not.toThrow();
  });
  it("uses only the private tmpfs reader for the SMTP credential fallback",()=>{
    expect(runtime).toContain("readDevHostingerSmtpPassword()");
  });
});
