import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const login = readFileSync(resolve(process.cwd(), "src/pages/login.tsx"), "utf8");

describe("Admin Email OTP post-login bootstrap", () => {
  it("does not navigate to Admin on bootstrap failure after OTP verification", () => {
    expect(login).toContain('if (role === "admin" && requireVerifiedAdmin) return false;');
    expect(login).toContain('const accepted = await redirectAfterLogin(json.user?.role, true);');
    expect(login).toContain('if (!accepted) {');
  });
  it("navigates using the server-approved destination when bootstrap succeeds", () => {
    expect(login).toContain('window.location.assign(bootstrap.allowedDestination);');
    expect(login).toContain('return true;');
  });
});
