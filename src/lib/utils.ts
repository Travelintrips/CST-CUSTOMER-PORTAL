import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabasePublicAssetUrl } from "@/lib/supabaseStorage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
export function assetUrl(path: string): string {
  return `${BASE}${path}`;
}

const CANONICAL_PORTAL_ASSET_ROOT = "/api/storage/public-objects/portal-assets/";
const PORTAL_ASSET_PATH_PREFIX =
  "/api/storage/public-objects/portal-assets";
const LEGACY_OBJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_ASSET_URL_PREFIX = "/storage/v1/object/public/public-assets/";
const LEGACY_PORTAL_BUCKET_URL_PREFIX = "/storage/v1/object/public/portal-assets/";

export interface ResolveImageUrlOptions {
  /**
   * Retained for source compatibility with older callers. UUID-only legacy
   * object paths cannot be resolved without a Supabase Storage object key.
   */
  allowLegacyObjectId?: boolean;
}

/**
 * Resolve a stored image URL to a displayable URL.
 *
 * CMS and catalog records have existed in several formats, so this is the
 * single boundary where those values become browser URLs:
 * - canonical CDN URLs are kept unchanged;
 * - legacy image paths are mapped to the canonical Customer Portal root;
 * - a bare legacy object UUID is rejected instead of becoming a guaranteed
 *   400/404 image request.
 *
 * `null` is intentional for an invalid/missing asset. Callers should render
 * their existing fallback rather than reusing the original invalid value.
 */
 export function resolveImageUrl(
   url: string | null | undefined,
   options: ResolveImageUrlOptions = {},
 ): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const isAbsoluteUrl = /^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith("//");
  if (
    !isAbsoluteUrl &&
    (trimmed.includes("\\") || trimmed.split("/").some((part) => part === "." || part === ".."))
  ) {
    return null;
  }
   if (trimmed.startsWith("/objects/")) return null;

  // Reject malformed legacy object paths before they can be rewritten into
  // an invalid public-object URL. Valid portal asset paths must include the
  // slash that separates the collection from the object key.
  if (
    trimmed.startsWith(PORTAL_ASSET_PATH_PREFIX) &&
    !trimmed.startsWith(`${PORTAL_ASSET_PATH_PREFIX}/`)
  ) {
    return null;
  }

  // Reject malformed variants of the canonical portal-assets prefix before
  // they can be treated as arbitrary public object keys.
  const canonicalPortalAssetPrefix = CANONICAL_PORTAL_ASSET_ROOT.slice(0, -1);
  if (
    trimmed.startsWith(canonicalPortalAssetPrefix) &&
    !trimmed.startsWith(CANONICAL_PORTAL_ASSET_ROOT)
  ) {
    return null;
  }

  // A previous CMS upload path was persisted as
  // /api/storage/public-objects/portal-assets/<uuid>. That UUID is a database
  // object identifier, not a public storage object key, and the API correctly
  // returns 404 for it. Reject it before an <img> or CSS background can fetch
  // the broken URL.
  if (trimmed.startsWith(CANONICAL_PORTAL_ASSET_ROOT)) {
    const objectKey = trimmed.slice(CANONICAL_PORTAL_ASSET_ROOT.length);
    if (
      !objectKey ||
      /\s/.test(objectKey) ||
      objectKey.includes("\\") ||
      objectKey.split("/").some((part) => part === "." || part === "..")
    ) {
      return null;
    }
    if (LEGACY_OBJECT_ID.test(objectKey)) return null;
    return supabasePublicAssetUrl(`portal-assets/${objectKey}`) || null;
  }

  // Some records contain the storage REST URL without the public-assets
  // bucket segment. Keep the same canonical bucket for those records instead
  // of requesting a guaranteed 400/404 URL.
  if (isAbsoluteUrl) {
    try {
      const parsed = new URL(trimmed, window.location.origin);
      if (parsed.pathname.startsWith(LEGACY_PORTAL_BUCKET_URL_PREFIX)) {
        const objectKey = parsed.pathname.slice(LEGACY_PORTAL_BUCKET_URL_PREFIX.length);
        if (!objectKey || objectKey.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) {
          return null;
        }
        const canonical = supabasePublicAssetUrl(`portal-assets/${objectKey}`);
        return canonical ? `${canonical}${parsed.search}${parsed.hash}` : null;
      }
      if (parsed.pathname.includes(PUBLIC_ASSET_URL_PREFIX)) return trimmed;
    } catch {
      return null;
    }
  }

  // Legacy CMS values and old hard-coded paths all resolve to the same
  // canonical Customer Portal storage root. Keep path segments intact; do
  // not normalize arbitrary URLs or allow a caller to escape the image root.
  const legacyPrefixes = [
    "/api/storage/public-objects/portal/images/",
    "/api/storage/public-objects/images/",
    "/portal/images/",
    "/images/",
  ];
  for (const prefix of legacyPrefixes) {
    if (trimmed.startsWith(prefix)) {
      const relative = trimmed.slice(prefix.length);
      if (!relative || relative.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) return null;
      const canonicalKey = `portal-assets/static/customer-portal/images/${relative}`;
      return supabasePublicAssetUrl(canonicalKey) || null;
    }
  }

  // Catalog uploads may be stored as an object key rather than a browser
  // URL. Treat only the known public portal-assets namespace as canonical.
  if (trimmed.startsWith("portal-assets/")) {
    const objectKey = trimmed.slice("portal-assets/".length);
    if (!objectKey || objectKey.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) return null;
    return supabasePublicAssetUrl(trimmed) || null;
  }

  return trimmed;
}
