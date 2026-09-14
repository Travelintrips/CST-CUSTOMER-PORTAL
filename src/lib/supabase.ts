import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// In dev mode (Vite dev server), prefer the _DEV credentials so the
// development Supabase project is used instead of production.
const isDev = import.meta.env.DEV;

const rawUrl = (isDev ? (import.meta.env.VITE_SUPABASE_URL_DEV || undefined) : undefined)
  ?? (import.meta.env.VITE_SUPABASE_URL as string | undefined);

const supabaseAnonKey = (isDev ? (import.meta.env.VITE_SUPABASE_ANON_KEY_DEV || undefined) : undefined)
  ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

function normalizeSupabaseUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  return `https://${url}.supabase.co`;
}

const supabaseUrl = normalizeSupabaseUrl(rawUrl);

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
