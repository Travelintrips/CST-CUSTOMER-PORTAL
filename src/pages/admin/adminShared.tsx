/**
 * adminShared.tsx
 * Shared types, constants, API helpers, and UI components used across admin modules.
 */

import { useState, useEffect, useRef } from "react";
// C1: auth via cookie — credentials:include
import { resolveImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronDown,
  Play,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Service = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  mediaItems?: MediaItem[];
};

export type MediaItem = { type: "image" | "video"; url: string };

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  mediaItems: MediaItem[];
  unit: string;
  unitOptions: string[];
  categories?: string[];
  subcategory?: string | null;
};

export type ContentMap = Record<string, string>;

export type DeliveryVendor = {
  id: number;
  name: string;
  logo: string;
  eta: string;
  fee: number;
  note: string | null;
  isActive: boolean;
  sortOrder: number;
  phone: string | null;
  email: string | null;
  serviceType: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const SERVICE_TYPE_OPTIONS = [
  "Import",
  "Export",
  "Domestic",
  "Door to Door",
  "Air Freight",
  "Sea Freight",
  "Trucking",
  "Customs Clearance",
  "Storage",
  "Handling",
];

// Locales editable from the CMS content tab.
export const CMS_EDIT_LOCALES = [
  { code: "id-ID", label: "🇮🇩 Bahasa Indonesia" },
  { code: "en-US", label: "🇺🇸 English (US)" },
  { code: "ms-MY", label: "🇲🇾 Bahasa Melayu" },
  { code: "zh-CN", label: "🇨🇳 中文（简体）" },
];

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// ── API helpers ───────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// ── Utility functions ─────────────────────────────────────────────────────────

export function validateImageFile(file: File, toast: ReturnType<typeof useToast>["toast"]): boolean {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast({ title: "Format file tidak didukung", description: "Hanya JPG, JPEG, PNG, atau WEBP yang diizinkan.", variant: "destructive" });
    return false;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    toast({ title: "Ukuran file terlalu besar", description: `Maksimum 5MB per file. File ini ${(file.size / 1024 / 1024).toFixed(1)}MB.`, variant: "destructive" });
    return false;
  }
  return true;
}

export function fmtDate(v: string) {
  return new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtRupiah(v: number | string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v));
}

// ── Shared components ─────────────────────────────────────────────────────────

export function ServiceTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.join(", "));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full min-h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Semua jenis order</span>
            ) : (
              selected.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
              ))
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="text-xs text-muted-foreground px-2 pb-2">Pilih tipe layanan vendor ini</p>
        <div className="space-y-1">
          {SERVICE_TYPE_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-sm">
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            className="mt-2 w-full text-xs text-muted-foreground hover:text-destructive text-center py-1"
            onClick={() => onChange("")}
          >
            Hapus semua pilihan
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function useVideoThumbnail(src: string | null) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const vid = document.createElement("video");
    vid.preload = "auto";
    vid.muted = true;
    vid.playsInline = true;
    vid.src = src;
    const captureFrame = () => {
      if (cancelled || vid.videoWidth === 0) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = vid.videoWidth;
        canvas.height = vid.videoHeight;
        canvas.getContext("2d")?.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.7);
        if (data.length > 100) setThumb(data);
      } catch { /* tainted — leave null */ }
    };
    vid.addEventListener("loadeddata", () => { if (!cancelled) captureFrame(); }, { once: true });
    vid.addEventListener("seeked", () => { if (!cancelled) captureFrame(); }, { once: true });
    vid.addEventListener("canplay", () => { if (!cancelled) captureFrame(); }, { once: true });
    vid.load();
    return () => { cancelled = true; vid.src = ""; };
  }, [src]);
  return thumb;
}

export function VideoThumbCell({ src }: { src: string }) {
  const thumb = useVideoThumbnail(src);
  return (
    <div className="relative w-full h-full">
      {thumb ? (
        <img src={thumb} alt="video" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <Play className="h-6 w-6 text-white fill-white" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <Play className="h-4 w-4 text-white fill-white drop-shadow" />
      </div>
    </div>
  );
}

export function ImageUploader({
  currentUrl,
  onUpload,
}: {
  currentUrl: string | null;
  onUpload: (url: string) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(resolveImageUrl(currentUrl));

  useEffect(() => {
    setPreview(resolveImageUrl(currentUrl));
  }, [currentUrl]);

  async function handleFile(file: File) {
    if (!validateImageFile(file, toast)) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portal/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json() as { url: string };
      setPreview(url);
      onUpload(url);
      toast({ title: "Gambar berhasil diunggah" });
    } catch (err) {
      toast({ title: "Gagal mengunggah gambar", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {preview && (
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted h-40 flex items-center justify-center">
          <img src={preview} alt="preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <button
            type="button"
            onClick={() => { setPreview(null); onUpload(""); }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {!preview && (
        <div className="rounded-lg border-2 border-dashed border-border h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">Belum ada gambar</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Mengunggah..." : "Unggah Gambar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Maks. 5MB.</p>
    </div>
  );
}

export function ContentSection({
  title,
  icon: Icon,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200/70 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 text-slate-600 p-2.5 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all duration-300">
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-slate-900 tracking-tight">{title}</p>
            {description && <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium leading-snug max-w-2xl">{description}</p>}
          </div>
        </div>
        <div className="bg-slate-200/50 p-1.5 rounded-md group-hover:bg-slate-200 transition-colors ml-4 shrink-0">
          <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-5 space-y-5 border-t border-slate-100 bg-white">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function MediaUploader({
  mediaItems,
  onChange,
  fallbackSrc,
}: {
  mediaItems: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  fallbackSrc?: string | null;
}) {
  const { toast } = useToast();
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function uploadFiles(files: File[], type: "image" | "video") {
    if (type === "image") {
      for (const file of files) {
        if (!validateImageFile(file, toast)) return;
      }
    }
    setUploading(true);
    const newItems: MediaItem[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/portal/admin/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        const { url } = await res.json() as { url: string };
        newItems.push({ type, url });
      }
      onChange([...mediaItems, ...newItems]);
      toast({ title: `${newItems.length} ${type === "image" ? "gambar" : "video"} berhasil diunggah` });
    } catch (err) {
      if (newItems.length > 0) onChange([...mediaItems, ...newItems]);
      toast({ title: "Sebagian gagal diunggah", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function addUrlItem() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch {
      toast({ title: "URL tidak valid", description: "Masukkan URL gambar yang lengkap (diawali https://)", variant: "destructive" });
      return;
    }
    onChange([...mediaItems, { type: "image", url: trimmed }]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function remove(idx: number) {
    onChange(mediaItems.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaItems.map((m, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group">
              {m.type === "video" ? (
                <VideoThumbCell src={resolveImageUrl(m.url) ?? m.url} />
              ) : (
                <img src={resolveImageUrl(m.url) ?? ""} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] px-1 rounded">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}
      {mediaItems.length === 0 && (
        fallbackSrc ? (
          <div className="relative rounded-lg overflow-hidden border border-dashed border-amber-300 bg-amber-50">
            <img src={fallbackSrc} alt="Gambar otomatis" className="w-full h-32 object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20">
              <span className="text-xs font-medium text-white bg-amber-500/90 px-2 py-0.5 rounded-full">
                Gambar otomatis — belum ada foto asli
              </span>
              <span className="text-[10px] text-white/80">Ini yang tampil di halaman produk saat ini</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border h-28 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon className="h-7 w-7" />
            <span className="text-xs">Belum ada media</span>
          </div>
        )
      )}
      <input ref={imgRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void uploadFiles(files, "image");
          e.target.value = "";
        }}
      />
      <input ref={vidRef} type="file" accept="video/*" className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void uploadFiles(files, "video");
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5 flex-1" disabled={uploading}
          onClick={() => imgRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          Tambah Foto
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 flex-1" disabled={uploading}
          onClick={() => vidRef.current?.click()}>
          <X className="h-3.5 w-3.5 hidden" />
          Tambah Video
        </Button>
      </div>
      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrlItem(); } }}
            placeholder="https://example.com/gambar.jpg"
            className="flex-1 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
          <Button type="button" size="sm" onClick={addUrlItem} className="h-8">Tambah</Button>
          <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => { setShowUrlInput(false); setUrlInput(""); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowUrlInput(true)} className="text-xs text-primary hover:underline underline-offset-2">
          atau masukkan URL gambar secara manual
        </button>
      )}
      <p className="text-xs text-muted-foreground">Foto pertama jadi cover. Format: JPG, PNG, WEBP. Maks. 5MB.</p>
    </div>
  );
}
