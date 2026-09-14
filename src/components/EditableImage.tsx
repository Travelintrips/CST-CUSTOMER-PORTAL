import { useRef } from "react";
import { useEditMode } from "@/contexts/EditModeContext";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  /** Only enable this for a specifically verified legacy CMS object. */
  allowLegacyObjectId?: boolean;
  /** Above-the-fold images (e.g. hero background): load eagerly at high
   * priority instead of the browser's default lazy/auto behavior, so the
   * final image appears immediately on first paint instead of after a
   * network round-trip once the CMS content resolves. */
  priority?: boolean;
}

export function EditableImage({
  contentKey,
  defaultSrc,
  alt,
  className = "",
  priority = false,
  allowLegacyObjectId = false,
}: EditableImageProps) {
  const { editMode, content, updateField, uploadImage } = useEditMode();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // If the CMS-provided (or cached) URL fails to load — e.g. a stale
  // localStorage cache pointing at an image that no longer exists — fall
  // back to the bundled default instead of showing a broken image icon.
  // We track *which* URL failed (not a sticky boolean) so that if the CMS
  // content later resolves to a different, valid URL, the component
  // recovers automatically instead of staying pinned to the default.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const candidateSrc = content[contentKey] ?? defaultSrc;
  const src = candidateSrc === failedSrc ? defaultSrc : candidateSrc;
  // Invalid legacy CMS paths must fall through to the existing canonical
  // default, not back to the original URL (which would create a broken
  // browser image request).
  const resolvedCandidate = src.startsWith("/")
    ? resolveImageUrl(src, { allowLegacyObjectId })
    : src;
  const resolved = resolvedCandidate ?? defaultSrc;
  const handleError = () => {
    if (resolved !== defaultSrc) setFailedSrc(candidateSrc);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadImage(file);
      updateField(contentKey, path);
    } catch {
      alert(t("editableImage.uploadFailed", "Gagal upload gambar"));
    } finally {
      setUploading(false);
    }
  };

  if (!editMode) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        onError={handleError}
      />
    );
  }

  return (
    <div className={`relative group ${className.includes("absolute") ? className : `relative ${className}`}`}>
      <img src={resolved} alt={alt} className={`${className.includes("absolute") ? "" : "w-full h-full"} object-cover`} onError={handleError} />
      <button
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-white mb-2" />
            <span className="text-white text-sm font-medium">{t("editableImage.changeImage", "Ganti Gambar")}</span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
