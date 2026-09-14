/**
 * StorageImage — drop-in <img> untuk aset Supabase Storage
 * jika Supabase Storage belum terkoneksi (404 / network error).
 *
 * Pattern:
 *   /api/storage/public-objects/portal-assets/static/customer-portal/X
 *
 * Storage tetap di Supabase; fallback hanya tampil saat storage tidak tersedia.
 */
import React from "react";

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export function StorageImage({ src, onError, ...props }: StorageImageProps) {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    onError?.(e);
  };

  return <img src={src} onError={handleError} {...props} />;
}
