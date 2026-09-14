const STORAGE_PATH = "/portal-assets/static/customer-portal";
const SUPABASE_ORIGIN = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
// Public branding/content assets live in the public-assets bucket. Use the
// configured Supabase CDN directly so preview does not depend on an old
// cstlogistic.co.id deployment or a development API bucket that may be empty.
const STORAGE_ROOT = SUPABASE_ORIGIN
  ? `${SUPABASE_ORIGIN}/storage/v1/object/public/public-assets${STORAGE_PATH}`
  : `/api/storage/public-objects${STORAGE_PATH}`;
const PNG_ONLY_ASSETS = new Set(["images/logo.png", "images/logo-baru.png"]);

export function staticAsset(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  // The existing production logo objects are PNGs. Keep these two brand
  // assets on their published format; other raster assets use their derived
  // WebP object from the release pipeline.
  if (PNG_ONLY_ASSETS.has(normalized)) {
    return `${STORAGE_ROOT}/${normalized}`;
  }
  return `${STORAGE_ROOT}/${normalized.replace(/\.(png|jpe?g)$/i, ".webp")}`;
}

export const CUSTOMER_ASSETS = {
  logo: staticAsset("images/logo.png"),
  logoBrand: staticAsset("images/logo-baru.png"),
  ogCover: staticAsset("images/og-cover.webp"),
  hero: staticAsset("images/hero-bg.webp"),
  marketplaceHero: staticAsset("images/gambar-baru.webp"),
  warehouse: staticAsset("images/warehouse.webp"),
  portOperations: staticAsset("images/port-operations.webp"),
  customs: staticAsset("images/customs.png"),
  customsDocument: staticAsset("images/customs-document.png"),
  airFreight: staticAsset("images/air-freight.png"),
  seaFreight: staticAsset("images/sea-freight.png"),
  logisticsRoutes: staticAsset("images/logistics-routes.svg"),
} as const;