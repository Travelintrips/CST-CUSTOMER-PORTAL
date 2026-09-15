const isDevelopment = import.meta.env.DEV;
const configuredOrigin = (
  isDevelopment
    ? (import.meta.env.VITE_SUPABASE_URL_DEV || import.meta.env.VITE_SUPABASE_URL)
    : import.meta.env.VITE_SUPABASE_URL
) as string | undefined;

export const SUPABASE_STORAGE_ORIGIN = (configuredOrigin ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

export function supabasePublicAssetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  if (!SUPABASE_STORAGE_ORIGIN || !normalized) return "";
  return `https://${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/public-assets/${normalized}`;
}