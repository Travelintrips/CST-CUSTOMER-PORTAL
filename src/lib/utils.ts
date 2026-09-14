import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

const CANONICAL_PORTAL_ASSET_ROOT =
  "/api/storage/public-objects/portal-assets/";
const CANONICAL_CUSTOMER_IMAGE_ROOT =
  `${CANONICAL_PORTAL_ASSET_ROOT}static/customer-portal/images/`;
const SUPABASE_ORIGIN = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const SUPABASE_PUBLIC_ASSET_ROOT = SUPABASE_ORIGIN
  ? `${SUPABASE_ORIGIN}/storage/v1/object/public/public-assets/`
  : null;
const LEGACY_OBJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ResolveImageUrlOptions {
  /**
   * Narrow compatibility escape hatch for a CMS record whose extensionless
   * UUID has been verified to point at a real public image object.
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
  const isAbsoluteUrl = /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith("//");
  if (
    !isAbsoluteUrl &&
    (trimmed.includes("\\") || trimmed.split("/").some((part) => part === "." || part === ".."))
  ) {
    return null;
  }
  if (trimmed.startsWith("/objects/")) return `/api/storage${trimmed}`;

  // A previous CMS upload path was persisted as
  // /api/storage/public-objects/portal-assets/<uuid>. That UUID is a database
  // object identifier, not a public storage object key, and the API correctly
  // returns 404 for it. Reject it before an <img> or CSS background can fetch
  // the broken URL.
  if (trimmed.startsWith(CANONICAL_PORTAL_ASSET_ROOT)) {
    const objectKey = trimmed.slice(CANONICAL_PORTAL_ASSET_ROOT.length);
    if (LEGACY_OBJECT_ID.test(objectKey)) {
      return options.allowLegacyObjectId ? trimmed : null;
    }
    return SUPABASE_PUBLIC_ASSET_ROOT
      ? `${SUPABASE_PUBLIC_ASSET_ROOT}portal-assets/${objectKey}`
      : trimmed;
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
      return SUPABASE_PUBLIC_ASSET_ROOT
        ? `${SUPABASE_PUBLIC_ASSET_ROOT}${canonicalKey}`
        : `${CANONICAL_CUSTOMER_IMAGE_ROOT}${relative}`;
    }
  }
  return trimmed;
}
