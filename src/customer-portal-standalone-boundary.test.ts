import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const serverSource = readFileSync(
  join(process.cwd(), "server/index.mjs"),
  "utf8",
);

describe("standalone Customer Portal API boundary", () => {
  it("does not proxy unknown API routes to CST-SUPER-APP", () => {
    expect(serverSource).not.toContain("CUSTOMER_PORTAL_API_UPSTREAM_URL");
    expect(serverSource).not.toContain("VITE_API_SERVER_URL");
    expect(serverSource).not.toContain("proxyToUpstream");
    expect(serverSource).not.toContain("UPSTREAM_API_URL");
    expect(serverSource).toContain("CUSTOMER_PORTAL_LOCAL_ENDPOINT_NOT_FOUND");
  });

  it("pins the development browser proxy to the standalone Customer Portal API", () => {
    const viteSource = readFileSync(join(process.cwd(), "vite.config.ts"), "utf8");
    const replitSource = readFileSync(join(process.cwd(), ".replit"), "utf8");
    expect(viteSource).toContain("VITE_API_SERVER_URL_DEV");
    expect(viteSource).toContain("CUSTOMER_PORTAL_API_URL_DEV");
    expect(viteSource).not.toContain("process.env.VITE_API_SERVER_URL ??");
    expect(replitSource).not.toContain('VITE_API_SERVER_URL = "https://cstlogistic.co.id"');
    expect(replitSource).toContain('VITE_API_SERVER_URL_DEV = "http://127.0.0.1:18444"');
  });

  it("keeps unknown API routes fail-closed in every environment", () => {
    expect(serverSource).not.toContain("Development preview traffic may proxy");
    expect(serverSource).toContain('"Customer Portal API route not found."');
  });
});
