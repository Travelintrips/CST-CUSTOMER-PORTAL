const isDevelopment = import.meta.env.DEV;
const configuredOrigin = (
  isDevelopment
    ? (import.meta.env.VITE_SUPABASE_URL_DEV || import.meta.env.VITE_SUPABASE_URL)
    : import.meta.env.VITE_SUPABASE_URL
) as string | undefined;

// The public-assets bucket is intentionally readable by browsers. Keep a
// browser-safe fallback so preview still renders the catalog and branding
// when the optional VITE_SUPABASE_URL variables have not been added yet.
const DEFAULT_PUBLIC_ORIGIN = "xssrfshdrtdfupgqwfdw.supabase.co";

export const SUPABASE_STORAGE_ORIGIN = (configuredOrigin ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "") || DEFAULT_PUBLIC_ORIGIN;

export function supabasePublicAssetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  if (!SUPABASE_STORAGE_ORIGIN || !normalized) return "";
  return `https://${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/public-assets/${normalized}`;
}