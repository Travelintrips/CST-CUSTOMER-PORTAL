import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const port = Number(process.env.PORT ?? "3000");

const basePath = process.env.BASE_PATH ?? "/";
const HERO_ASSET_PATH = "/api/storage/public-objects/portal-assets/static/customer-portal/images/hero-bg.webp";
const BRAND_LOGO_ASSET_PATH = "/api/storage/public-objects/portal-assets/static/customer-portal/images/logo.png";
const HERO_ASSET_DEV_FALLBACK_ORIGIN = process.env.CUSTOMER_PORTAL_HERO_ASSET_ORIGIN ?? "https://cstlogistic.co.id";
const BRAND_LOGO_ASSET_DEV_FALLBACK_ORIGIN = process.env.CUSTOMER_PORTAL_BRAND_ASSET_ORIGIN ?? "https://cstlogistic.co.id";
const PORTAL_ASSET_DEV_FALLBACK_ORIGIN = process.env.CUSTOMER_PORTAL_ASSET_ORIGIN ?? "https://cstlogistic.co.id";
const apiServerUrl = process.env.VITE_API_SERVER_URL ?? process.env.API_SERVER_URL ?? "http://127.0.0.1:18444";
const PUBLIC_ASSET_CDN_ORIGIN = (
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  ""
).replace(/\/+$/, "");

export default defineConfig({
  base: basePath,
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      ""
    ),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      ""
    ),
    "import.meta.env.VITE_SUPABASE_URL_DEV": JSON.stringify(process.env.VITE_SUPABASE_URL_DEV ?? process.env.SUPABASE_URL_DEV ?? ""),
    "import.meta.env.VITE_SUPABASE_ANON_KEY_DEV": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY_DEV ?? process.env.SUPABASE_ANON_KEY_DEV ?? ""),
    "import.meta.env.VITE_REPLIT_DEV_DOMAIN": JSON.stringify(process.env.REPLIT_DEV_DOMAIN ?? ""),
    "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(process.env.GOOGLE_MAPS_API_KEY ?? ""),
    // External map/routing service URLs — override via env var in production
    "import.meta.env.VITE_OSRM_URL": JSON.stringify(
      process.env.VITE_OSRM_URL ?? "https://router.project-osrm.org"
    ),
    "import.meta.env.VITE_MAP_TILE_URL": JSON.stringify(
      process.env.VITE_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ),
    // OSM iframe embed base URL — used by order-track LiveMapSection
    "import.meta.env.VITE_OSM_EMBED_BASE_URL": JSON.stringify(
      process.env.VITE_OSM_EMBED_BASE_URL ?? "https://www.openstreetmap.org/export/embed.html"
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared/api-client-react": path.resolve(import.meta.dirname, "src/shared/api-client-react/index.ts"),
      "@shared/product-templates": path.resolve(import.meta.dirname, "src/shared/product-templates/index.ts"),
      "@shared/service-templates": path.resolve(import.meta.dirname, "src/shared/service-templates/index.ts"),
      "@shared/logistics-constants": path.resolve(import.meta.dirname, "src/shared/logistics-constants/index.ts"),


    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "SOURCEMAP_ERROR") return;
        warn(warning);
      },
      output: {
        // Do NOT use manualChunks for node_modules. Custom chunk splitting of CJS
        // packages (react, radix, supabase, etc.) causes Rollup's cross-chunk CJS
        // interop to fail at runtime: packages like use-sync-external-store call
        // require('react') across chunk boundaries, and Rollup's ESM wrapper does not
        // properly expose named exports (useLayoutEffect, Children, etc.), resulting in
        // "Cannot read properties of undefined" errors on first load.
        //
        // Rollup's automatic chunking (driven by dynamic import() boundaries) handles
        // CJS interop correctly by keeping shared dependencies in the same evaluation
        // scope. Route-level code splitting is preserved via React.lazy() + dynamic
        // imports that already exist in the app.
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "microphone=(), geolocation=()",
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https: wss: ws: http://localhost:*",
        "media-src 'self' https: blob:",
        "worker-src 'self' blob:",
        "frame-ancestors 'self' https://replit.com https://*.replit.dev https://*.sisko.replit.dev",
        "object-src 'none'",
        "base-uri 'self'",
      ].join("; "),
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        path.resolve(import.meta.dirname, "../logistic-order/**"),
        path.resolve(import.meta.dirname, "../mockup-sandbox/**"),
      ],
    },
    hmr: false,
    proxy: {
      // Keep relative storage URLs working in preview while reading the
      // canonical public-assets bucket. This also covers DB-backed images
      // resolved to /api/storage/public-objects/... URLs.
      ...(process.env.NODE_ENV !== "production" && (PUBLIC_ASSET_CDN_ORIGIN || PORTAL_ASSET_DEV_FALLBACK_ORIGIN)
        ? {
            "/api/storage/public-objects": {
              target: PUBLIC_ASSET_CDN_ORIGIN || PORTAL_ASSET_DEV_FALLBACK_ORIGIN,
              changeOrigin: true,
              secure: true,
              rewrite: (path) =>
                path.replace(
                  /^\/api\/storage\/public-objects/,
                  "/storage/v1/object/public/public-assets",
                ),
            },
          }
        : {}),
      // Development storage can lag the promoted production static-asset
      // bucket. Keep the canonical application URL while allowing the
      // above-the-fold hero to render in preview until that bucket is synced.
      ...(process.env.NODE_ENV !== "production"
        ? {
            [HERO_ASSET_PATH]: {
              target: HERO_ASSET_DEV_FALLBACK_ORIGIN,
              changeOrigin: true,
              secure: true,
            },
            [BRAND_LOGO_ASSET_PATH]: {
              target: BRAND_LOGO_ASSET_DEV_FALLBACK_ORIGIN,
              changeOrigin: true,
              secure: true,
            },
          }
        : {}),
      "/api": {
        target: apiServerUrl,
        changeOrigin: true,
        timeout: 60_000,
        proxyTimeout: 60_000,
      },
      // Legacy public image URLs must never reach Vite's SPA fallback. The
      // API applies the same canonicalization and 404 semantics in dev.
      "/images": {
        target: apiServerUrl,
        changeOrigin: true,
        rewrite: (path) => `/api/storage/public-objects${path}`,
      },
      "/portal/images": {
        target: apiServerUrl,
        changeOrigin: true,
        rewrite: (path) => `/api/storage/public-objects${path}`,
      },
      // /sitemap.xml intentionally NOT proxied — served as a static file from public/
      "/q": {
        target: apiServerUrl,
        changeOrigin: true,
      },
      // Logistic Order is owned by this Customer Portal. Its compatibility
      // aliases are handled by the SPA routes above; do not proxy them to the
      // deprecated standalone redirect shim.
      "/wa-gateway": {
        target: `http://localhost:${process.env.WA_GATEWAY_PORT ?? 8000}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
