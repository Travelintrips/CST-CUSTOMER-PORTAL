import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const customerPortalRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

function read(relativePath: string): string {
  return readFileSync(resolve(customerPortalRoot, relativePath), "utf8");
}

describe("Customer Portal OG metadata contract", () => {
  it("uses the WebP image and matching MIME in static metadata", () => {
    const indexHtml = read("index.html");
    const prerenderScript = read("scripts/prerender.mjs");

    for (const source of [indexHtml, prerenderScript]) {
      expect(source).toContain("og-cover.webp");
      expect(source).toContain('og:image:type" content="image/webp"');
      expect(source).not.toContain("og-cover.png");
      expect(source).not.toContain('og:image:type" content="image/png"');
    }
  });

  it("keeps React SEO metadata on the same WebP MIME contract", () => {
    for (const relativePath of [
      "src/components/PageSeo.tsx",
      "src/components/PageSeoDynamic.tsx",
    ]) {
      const source = read(relativePath);
      expect(source).toContain('og:image:type" content="image/webp"');
      expect(source).not.toContain('og:image:type" content="image/png"');
    }
  });
});