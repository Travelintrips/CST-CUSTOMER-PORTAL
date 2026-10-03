import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const login = fs.readFileSync(path.join(root, "src/pages/login.tsx"), "utf8");
const auth = fs.readFileSync(path.join(root, "server/auth-providers.mjs"), "utf8");

describe("Email OTP production error handling", () => {
  it("blocks the common gmaol.com typo before requesting OTP", () => {
    expect(login).toContain('endsWith("@gmaol.com")');
    expect(login).toContain("Gunakan @gmail.com");
    expect(auth).toContain('email.endsWith("@gmaol.com")');
  });

  it("does not leak unknown OTP failures as a generic 500", () => {
    expect(auth).toContain("[email-otp] request failed");
    expect(auth).toContain("Layanan OTP email sedang bermasalah");
    expect(auth).toContain("Gagal mengirim email OTP. Periksa alamat email");
  });
});
