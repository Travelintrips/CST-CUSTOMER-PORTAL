/**
 * CatalogMediaAssetsDialog
 * Admin panel for managing media_assets JSONB on vendor catalog items.
 * Supports photos, videos, and PDFs (with visibility control).
 * API: POST /api/portal/admin/vendor-catalog-items/:id/media-assets/upload
 *      PATCH /api/portal/admin/vendor-catalog-items/:id/media-assets
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/utils";
import {
  Upload, X, Star, StarOff, ChevronUp, ChevronDown,
  Eye, ExternalLink, FileText, Play, Loader2, ImagePlus,
} from "lucide-react";
// C1: auth via cookie

// ── Types ─────────────────────────────────────────────────────────────────────

export type CatalogMediaAsset = {
  id?: string;
  url: string;
  type: "image" | "video" | "pdf" | "document" | "certificate" | "brochure" | string;
  mimeType?: string;
  title?: string;
  name?: string;       // legacy alias for title
  description?: string;
  isPrimary?: boolean;
  isCover?: boolean;   // legacy alias for isPrimary
  visibility?: "public" | "private" | "internal";
  objectPath?: string;
  sizeBytes?: number;
  size?: number;       // legacy alias for sizeBytes
  sortOrder?: number;
  documentKey?: string; // links this asset to a standard document slot (documents[].key)
};

export type CatalogDocumentType = {
  key: string;
  label: string;
  required?: boolean;
  url?: string;
  reference?: string;
  fileUrl?: string;
};

type CatalogItem = {
  id: number;
  name: string;
  media_assets?: unknown[];
  documents?: CatalogDocumentType[] | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOC_TYPES = new Set(["pdf", "document", "certificate", "brochure"]);

function isDoc(a: CatalogMediaAsset) {
  return DOC_TYPES.has(a.type) || a.mimeType === "application/pdf";
}
function isImg(a: CatalogMediaAsset) {
  if (a.type === "image") return true;
  if (a.mimeType?.startsWith("image/")) return true;
  const ext = a.url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return ["jpg","jpeg","png","webp","gif","svg","avif"].includes(ext);
}
function isVid(a: CatalogMediaAsset) {
  if (a.type === "video") return true;
  if (a.mimeType?.startsWith("video/")) return true;
  const ext = a.url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return ["mp4","webm","mov","avi","mkv"].includes(ext);
}

function normalise(raw: unknown[]): CatalogMediaAsset[] {
  return raw
    .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
    .filter((a) => typeof a.url === "string" && a.url)
    .map((a, i) => ({
      id:         (a.id as string | undefined) ?? crypto.randomUUID(),
      url:        a.url as string,
      type:       (a.type as string) ?? "image",
      mimeType:   a.mimeType as string | undefined,
      title:      ((a.title ?? a.name) as string | undefined),
      description: a.description as string | undefined,
      isPrimary:   a.isPrimary != null ? Boolean(a.isPrimary) : (a.isCover != null ? Boolean(a.isCover) : i === 0),
      isCover:     a.isCover != null ? Boolean(a.isCover) : (a.isPrimary != null ? Boolean(a.isPrimary) : i === 0),
      visibility:  (a.visibility as CatalogMediaAsset["visibility"]) ??
                   (DOC_TYPES.has(String(a.type ?? "")) ? "private" : undefined),
      objectPath:  a.objectPath as string | undefined,
      sizeBytes:   a.sizeBytes != null ? Number(a.sizeBytes) : (a.size != null ? Number(a.size) : undefined),
      sortOrder:   a.sortOrder != null ? Number(a.sortOrder) : i,
      documentKey: a.documentKey != null ? String(a.documentKey) : undefined,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CatalogMediaAssetsDialog({
  item,
  open,
  onClose,
  onSaved,
}: {
  item: CatalogItem | null;
  open: boolean;
  onClose: () => void;
  onSaved: (assets: CatalogMediaAsset[]) => void;
}) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<CatalogMediaAsset[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<CatalogMediaAsset | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef   = useRef<HTMLInputElement>(null);
  const stdDocInputRef = useRef<HTMLInputElement>(null);
  const [activeStdDoc, setActiveStdDoc] = useState<{ key: string; label: string } | null>(null);

  // Reset when item changes
  useEffect(() => {
    if (item && open) {
      const raw = Array.isArray(item.media_assets) ? item.media_assets : [];
      setAssets(normalise(raw));
    }
  }, [item?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ──────────────────────────────────────────────────────────────────

  async function handleUpload(
    file: File,
    forceVisibility?: CatalogMediaAsset["visibility"],
    documentKey?: string,
    documentLabel?: string,
  ) {
    if (!item) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(
        `/api/portal/admin/vendor-catalog-items/${item.id}/media-assets/upload`,
        { method: "POST", credentials: "include", body: fd },
      );
      const j = await r.json() as { url?: string; objectPath?: string; mimeType?: string; sizeBytes?: number; message?: string };
      if (!r.ok) throw new Error(j.message ?? "Upload gagal");

      const isPdf   = j.mimeType === "application/pdf";
      const isVidMt = j.mimeType?.startsWith("video/") ?? false;
      const type: CatalogMediaAsset["type"] = isPdf ? "pdf" : isVidMt ? "video" : "image";

      const newAsset: CatalogMediaAsset = {
        id:         crypto.randomUUID(),
        url:        j.url!,
        type,
        mimeType:   j.mimeType,
        sizeBytes:  j.sizeBytes,
        objectPath: j.objectPath,
        title:      documentLabel ?? file.name.replace(/\.[^.]+$/, ""),
        isPrimary:  assets.length === 0,
        isCover:    assets.length === 0,
        sortOrder:  assets.length,
        visibility: forceVisibility ?? (isPdf ? "private" : undefined),
        ...(documentKey ? { documentKey } : {}),
      };
      // Standard-slot uploads REPLACE any existing file for the same documentKey
      // (one active file per document type — upload ulang = replace, bukan duplicate).
      setAssets(prev => documentKey
        ? [...prev.filter(a => a.documentKey !== documentKey), newAsset]
        : [...prev, newAsset]);
      toast({ title: documentKey ? "Dokumen berhasil diunggah" : "File berhasil diunggah" });
    } catch (e: unknown) {
      toast({
        title: "Upload gagal",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  function removeByDocumentKey(documentKey: string) {
    setAssets(prev => prev.filter(a => a.documentKey !== documentKey));
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  const setPrimary = useCallback((idx: number) => {
    setAssets(prev => prev.map((a, i) => ({ ...a, isPrimary: i === idx, isCover: i === idx })));
  }, []);

  const moveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setAssets(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((a, i) => ({ ...a, sortOrder: i }));
    });
  }, []);

  const moveDown = useCallback((idx: number) => {
    setAssets(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((a, i) => ({ ...a, sortOrder: i }));
    });
  }, []);

  const removeAsset = useCallback((idx: number) => {
    setAssets(prev => {
      const next = prev.filter((_, i) => i !== idx).map((a, i) => ({ ...a, sortOrder: i }));
      if (next.length > 0 && !next.some(a => a.isPrimary)) {
        next[0].isPrimary = true;
        next[0].isCover   = true;
      }
      return next;
    });
  }, []);

  const updateTitle = useCallback((idx: number, title: string) => {
    setAssets(prev => prev.map((a, i) => i === idx ? { ...a, title } : a));
  }, []);

  const updateVisibility = useCallback((idx: number, vis: CatalogMediaAsset["visibility"]) => {
    setAssets(prev => prev.map((a, i) => i === idx ? { ...a, visibility: vis } : a));
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      const r = await fetch(
        `/api/portal/admin/vendor-catalog-items/${item.id}/media-assets`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaAssets: assets }),
        },
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { message?: string; error?: string };
        throw new Error(j.message ?? j.error ?? "Gagal menyimpan media assets");
      }
      toast({ title: "✅ Media assets disimpan" });
      onSaved(assets);
      onClose();
    } catch (e: unknown) {
      toast({
        title: "Gagal menyimpan",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const standardDocKeys = new Set((item?.documents ?? []).map(d => d.key));
  const mediaAssets = assets.filter(a => !isDoc(a));
  // "Dokumen Tambahan": doc assets NOT linked to a standard document slot (no
  // documentKey, or a stale documentKey no longer present in item.documents).
  const docAssets   = assets.filter(a => isDoc(a) && !(a.documentKey && standardDocKeys.has(a.documentKey)));

  return (
    <>
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ImagePlus className="w-4 h-4 text-blue-500" />
              Kelola Media Assets — {item?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Upload Buttons */}
          <div className="flex flex-wrap gap-2 py-1 border-b pb-3">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { void handleUpload(f); e.target.value = ""; } }}
            />
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { void handleUpload(f, "private"); e.target.value = ""; } }}
            />
            <input
              ref={stdDocInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f && activeStdDoc) void handleUpload(f, "private", activeStdDoc.key, activeStdDoc.label);
                e.target.value = "";
                setActiveStdDoc(null);
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Upload className="w-3.5 h-3.5" />
              }
              Upload Foto / Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => docInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <FileText className="w-3.5 h-3.5" />
              }
              Upload Dokumen (PDF)
            </Button>
            <span className="text-xs text-muted-foreground self-center ml-1">Maks 50 MB/file</span>
          </div>

          {/* Dokumen Standar — one slot per documents[].key (coo/phyto/invoice/packing_list, dst) */}
          {Array.isArray(item?.documents) && item.documents.length > 0 && (
            <div className="space-y-2 pt-2 pb-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Dokumen Standar ({item.documents.length})
              </p>
              {item.documents.map((doc) => {
                const linked = assets.find(a => a.documentKey === doc.key);
                return (
                  <div
                    key={doc.key}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 ${linked ? "bg-emerald-50/50 border-emerald-200" : "bg-muted/30"}`}
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${linked ? "bg-emerald-100" : "bg-muted"}`}>
                      <FileText className={`w-5 h-5 ${linked ? "text-emerald-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs font-medium truncate">{doc.label}</p>
                      {linked ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={linked.visibility ?? "private"}
                            onValueChange={v => updateVisibility(assets.indexOf(linked), v as CatalogMediaAsset["visibility"])}
                          >
                            <SelectTrigger className="h-6 text-xs w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">🌐 Publik</SelectItem>
                              <SelectItem value="private">🔒 Privat</SelectItem>
                              <SelectItem value="internal">🏢 Internal</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-[11px] text-muted-foreground">
                            {linked.visibility === "public" ? "Tampil di publik" : "Tidak tampil di publik"}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-600 font-medium">Belum diunggah</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {linked && (
                        <>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setPreviewAsset(linked)} title="Preview">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <a href={linked.url} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="ghost" className="w-7 h-7" title="Download">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        disabled={uploading}
                        onClick={() => { setActiveStdDoc({ key: doc.key, label: doc.label }); stdDocInputRef.current?.click(); }}
                      >
                        <Upload className="w-3 h-3" /> {linked ? "Replace" : "Upload"}
                      </Button>
                      {linked && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-red-400 hover:text-red-600"
                          title="Hapus"
                          onClick={() => removeByDocumentKey(doc.key)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Photo / Video list */}
          {mediaAssets.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Foto &amp; Video ({mediaAssets.length})
              </p>
              {mediaAssets.map((a) => {
                const globalIdx = assets.indexOf(a);
                return (
                  <div
                    key={a.id ?? globalIdx}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                      a.isPrimary ? "border-blue-400 bg-blue-50/60" : "bg-card"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-14 h-14 rounded overflow-hidden bg-muted flex-shrink-0 cursor-pointer relative"
                      onClick={() => setPreviewAsset(a)}
                    >
                      {isImg(a) ? (
                        <img src={resolveImageUrl(a.url) ?? a.url} alt="" className="w-full h-full object-cover" />
                      ) : isVid(a) ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                      ) : null}
                      {a.isPrimary && (
                        <div className="absolute top-0.5 right-0.5 bg-blue-500 rounded-full p-0.5">
                          <Star className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        value={a.title ?? a.name ?? ""}
                        onChange={e => updateTitle(globalIdx, e.target.value)}
                        placeholder={`Judul foto ${globalIdx + 1}`}
                        className="h-7 text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {isVid(a) ? "Video" : "Gambar"}
                        {a.isPrimary && <span className="ml-2 text-blue-600 font-semibold">● Cover utama</span>}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setPreviewAsset(a)} title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={a.isPrimary ? "default" : "ghost"}
                        className={`w-7 h-7 ${a.isPrimary ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
                        onClick={() => setPrimary(globalIdx)}
                        title={a.isPrimary ? "Cover aktif" : "Set sebagai cover"}
                      >
                        {a.isPrimary ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => moveUp(globalIdx)} disabled={globalIdx === 0} title="Naikkan">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => moveDown(globalIdx)} disabled={globalIdx === assets.length - 1} title="Turunkan">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-600" onClick={() => removeAsset(globalIdx)} title="Hapus">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Document list */}
          {docAssets.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Dokumen ({docAssets.length})
              </p>
              {docAssets.map((a) => {
                const globalIdx = assets.indexOf(a);
                return (
                  <div key={a.id ?? globalIdx} className="flex items-center gap-3 rounded-lg border bg-amber-50/40 p-2.5">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>

                    {/* Title + visibility */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Input
                        value={a.title ?? a.name ?? ""}
                        onChange={e => updateTitle(globalIdx, e.target.value)}
                        placeholder={`Nama dokumen ${globalIdx + 1}`}
                        className="h-7 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <Select
                          value={a.visibility ?? "private"}
                          onValueChange={v => updateVisibility(globalIdx, v as CatalogMediaAsset["visibility"])}
                        >
                          <SelectTrigger className="h-6 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">🌐 Publik</SelectItem>
                            <SelectItem value="private">🔒 Privat</SelectItem>
                            <SelectItem value="internal">🏢 Internal</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-[11px] text-muted-foreground">
                          {a.visibility === "public" ? "Tampil di halaman publik produk" : "Tidak tampil di publik"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="w-7 h-7" title="Buka dokumen">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-600" onClick={() => removeAsset(globalIdx)} title="Hapus">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {assets.length === 0 && !uploading && (
            <div className="text-center py-10 text-muted-foreground">
              <ImagePlus className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Belum ada media assets</p>
              <p className="text-xs mt-1">Upload foto/video atau dokumen menggunakan tombol di atas</p>
            </div>
          )}

          {uploading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Mengupload file…
            </div>
          )}

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan Media Assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Lightbox */}
      {previewAsset && (
        <Dialog open={!!previewAsset} onOpenChange={v => !v && setPreviewAsset(null)}>
          <DialogContent className="max-w-4xl p-2">
            <div className="flex justify-center items-center min-h-64 bg-black rounded-lg overflow-hidden">
              {isImg(previewAsset) ? (
                <img src={resolveImageUrl(previewAsset.url) ?? previewAsset.url} alt="" className="max-w-full max-h-[70vh] object-contain" />
              ) : isVid(previewAsset) ? (
                <video src={previewAsset.url} controls autoPlay className="max-w-full max-h-[70vh]" />
              ) : (
                <div className="text-center text-white p-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <a href={previewAsset.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                    Buka Dokumen <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end px-4 pb-2">
              <Button size="sm" variant="outline" onClick={() => setPreviewAsset(null)}>Tutup</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
