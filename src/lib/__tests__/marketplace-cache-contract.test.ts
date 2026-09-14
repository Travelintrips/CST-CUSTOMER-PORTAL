import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const customerPortalRoot = resolve(import.meta.dirname, "../../..");

function read(relativePath: string): string {
  return readFileSync(resolve(customerPortalRoot, relativePath), "utf8");
}

describe("Marketplace publication-state cache contract", () => {
  it("refetches the public list instead of keeping a stale card", () => {
    const marketplacePage = read("src/pages/marketplace.tsx");

    expect(marketplacePage).toContain('fetch(`/api/portal/marketplace?${params.toString()}`)');
    expect(marketplacePage).toContain("staleTime: 0");
    expect(marketplacePage).toContain("refetchOnWindowFocus: true");
  });

  it("invalidates product queries when the catalog realtime update arrives", () => {
    const marketplacePage = read("src/pages/marketplace.tsx");

    expect(marketplacePage).toContain('k[0] === "marketplace" && k[1] === "product"');
    expect(marketplacePage).toContain('qc.invalidateQueries({');
  });
});