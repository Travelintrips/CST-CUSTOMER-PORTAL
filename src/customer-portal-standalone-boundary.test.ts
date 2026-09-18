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

  it("keeps unknown API routes fail-closed in every environment", () => {
    expect(serverSource).not.toContain("Development preview traffic may proxy");
    expect(serverSource).toContain('"Customer Portal API route not found."');
  });
});
