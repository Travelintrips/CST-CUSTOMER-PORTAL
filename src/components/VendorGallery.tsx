import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ImageOff, Images } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: number;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  itemName: string | null;
  templateKind: string | null;
  isPrimary?: boolean;
}

interface VendorGalleryProps {
  images: GalleryImage[];
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: GalleryImage[];
  startIndex: number;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape")     onClose();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 4));
      else if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const current = images[idx];

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/97 flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/60">
        <div className="text-white">
          <p className="text-[13px] font-semibold">
            {idx + 1} / {images.length}
          </p>
          {(current.title ?? current.itemName) && (
            <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-1">
              {current.title ?? current.itemName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
            disabled={zoom <= 1}
            title={t("gallery.zoomOut", "Perkecil (−)")}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-white text-[12px] font-mono w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
            disabled={zoom >= 4}
            title={t("gallery.zoomIn", "Perbesar (+)")}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="ml-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={t("gallery.close", "Tutup (Esc)")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all shadow-lg"
            title={t("gallery.prev", "Sebelumnya (←)")}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          className="flex items-center justify-center w-full h-full p-4 transition-transform duration-200 overflow-hidden cursor-zoom-in"
          style={{ transform: `scale(${zoom})` }}
          onClick={() => setZoom((z) => z >= 2 ? 1 : Math.min(z + 0.5, 2))}
        >
          {current.fileUrl ? (
            <img
              key={current.id}
              src={resolveImageUrl(current.fileUrl) ?? current.fileUrl}
              alt={current.title ?? current.itemName ?? ""}
              className="max-h-[78vh] max-w-full object-contain shadow-2xl rounded-sm"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <ImageOff className="h-16 w-16" />
              <p className="text-[14px]">{t("gallery.imageUnavailable", "Gambar tidak tersedia")}</p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all shadow-lg"
            title={t("gallery.next", "Berikutnya (→)")}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0 scrollbar-none bg-black/60">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => { setIdx(i); setZoom(1); }}
              className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                i === idx
                  ? "border-sky-400 opacity-100 scale-110"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              {img.thumbnailUrl ?? img.fileUrl ? (
                <img
                  src={resolveImageUrl(img.thumbnailUrl ?? img.fileUrl) ?? (img.thumbnailUrl ?? img.fileUrl)!}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <ImageOff className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Gallery Component ────────────────────────────────────────────────────

export function VendorGallery({ images }: VendorGalleryProps) {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validImages = images.filter((img) => !!img.fileUrl);

  if (validImages.length === 0) return null;

  return (
    <>
      {/* Gallery header */}
      <div className="flex items-center gap-2 mb-3">
        <Images className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {validImages.length} {t("gallery.photoAlt", "foto")}
        </p>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 sm:columns-3 gap-2 space-y-2">
        {validImages.map((img, idx) => (
          <button
            key={img.id}
            className="w-full break-inside-avoid rounded-xl overflow-hidden border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group block relative"
            onClick={() => setLightboxIndex(idx)}
          >
            <img
              src={resolveImageUrl(img.thumbnailUrl ?? img.fileUrl) ?? (img.thumbnailUrl ?? img.fileUrl)!}
              alt={img.title ?? img.itemName ?? t("gallery.photoAlt", "Foto vendor")}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement;
                if (parent) {
                  parent.classList.add("h-24", "bg-slate-100");
                  const placeholder = document.createElement("div");
                  placeholder.className = "w-full h-24 flex items-center justify-center text-slate-300";
                  placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                  parent.appendChild(placeholder);
                }
              }}
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
            </div>
            {/* Caption */}
            {img.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] text-white truncate">{img.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={validImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
