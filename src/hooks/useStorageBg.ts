/**
 * useStorageBg — hook untuk CSS background-image dari Supabase Storage.
 * Uses the Supabase Storage URL directly. Missing assets are surfaced instead
 * of silently falling back to a repository-local image.
 *
 * Usage:
 *   const bg = useStorageBg("/api/storage/public-objects/portal/images/warehouse.png");
 *   <div style={{ backgroundImage: bg }} />
 */
import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";

export function useStorageBg(storageUrl: string): string {
  const [url, setUrl] = useState(resolveImageUrl(storageUrl) ?? "");

  useEffect(() => {
    setUrl(resolveImageUrl(storageUrl) ?? "");
  }, [storageUrl]);

  return url ? `url('${url}')` : "none";
}
