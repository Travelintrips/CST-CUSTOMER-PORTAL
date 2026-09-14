import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Image as ImageIcon, Upload, X, Loader2, Save, GripVertical, CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Vehicle definitions ───────────────────────────────────────────────────────

const VEHICLE_DEFS = [
  { id: "mobil",         name: "Mobil",         color: "#94a3b8" },
  { id: "mobil-xl",      name: "Mobil XL",      color: "#93c5fd" },
  { id: "van",           name: "Van",            color: "#a5b4fc" },
  { id: "pickup-kecil",  name: "Pickup Kecil",  color: "#fbbf24" },
  { id: "box-kecil",     name: "Box Kecil",     color: "#86efac" },
  { id: "engkel",        name: "Engkel",         color: "#fb923c" },
  { id: "double-engkel", name: "Double Engkel", color: "#f87171" },
  { id: "cdd-long",      name: "CDD Long",      color: "#60a5fa" },
  { id: "fuso",          name: "Fuso",           color: "#34d399" },
  { id: "tronton",       name: "Tronton",        color: "#a78bfa" },
  { id: "truk-trailer",  name: "Truk Trailer",  color: "#64748b" },
  { id: "truk-reefer",   name: "Truk Reefer",   color: "#38bdf8" },
] as const;

type VehicleDef = { id: string; name: string; color: string };

// ── VehicleImageCard ──────────────────────────────────────────────────────────

function VehicleImageCard({
  vehicle,
  imageUrl,
  onUpload,
  onRemove,
}: {
  vehicle: VehicleDef;
  imageUrl: string | null;
  onUpload: (vehicleId: string, file: File) => Promise<void>;
  onRemove: (vehicleId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();

  async function handleFile(file: File) {
    setUploading(true);
    try { await onUpload(vehicle.id, file); }
    finally { setUploading(false); }
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="h-36 flex items-center justify-center relative"
        style={{ background: imageUrl ? undefined : `${vehicle.color}22` }}
      >
        {imageUrl ? (
          <>
            <img src={resolveImageUrl(imageUrl) ?? imageUrl} alt={vehicle.name} className="h-full w-full object-contain p-2" />
            <button
              onClick={() => onRemove(vehicle.id)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-[10px] gap-1 bg-white/90">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> {t("adminVehicle.imageMounted", "Terpasang")}
              </Badge>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImageIcon className="w-10 h-10" style={{ color: vehicle.color }} />
            <span className="text-xs">{t("adminVehicle.noImage", "Belum ada gambar")}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: vehicle.color }} />
          <span className="font-semibold text-sm text-slate-800">{vehicle.name}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          variant="outline" size="sm"
          className="w-full text-xs gap-1.5"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("adminVehicle.uploading", "Mengupload…")}</>
            : <><Upload className="w-3.5 h-3.5" /> {imageUrl ? t("adminVehicle.replaceBtn", "Ganti") : t("adminVehicle.uploadBtn", "Upload")}</>
          }
        </Button>
      </CardContent>
    </Card>
  );
}

// ── SortableVehicleItem ───────────────────────────────────────────────────────

function SortableVehicleItem({ vehicle, index, imageUrl }: { vehicle: VehicleDef; index: number; imageUrl?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vehicle.id });
  const { t } = useLanguage();
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : "auto" as const };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <span className="text-slate-400 text-sm font-mono w-6 text-center shrink-0">{index + 1}</span>
      <button className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `${vehicle.color}22` }}>
        {imageUrl
          ? <img src={resolveImageUrl(imageUrl) ?? imageUrl} alt={vehicle.name} className="w-full h-full object-contain p-1" />
          : <div className="w-3 h-3 rounded-full" style={{ background: vehicle.color }} />
        }
      </div>
      <span className="font-medium text-slate-800 flex-1">{vehicle.name}</span>
      {imageUrl
        ? <Badge variant="secondary" className="text-[10px] gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {t("adminVehicle.imageLabel", "Gambar")}</Badge>
        : <Badge variant="outline" className="text-[10px] text-slate-400">SVG</Badge>
      }
    </div>
  );
}

// ── VehicleImagesTab ──────────────────────────────────────────────────────────

export function VehicleImagesTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [images, setImages] = useState<Record<string, string>>({});
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"gambar" | "urutan">("gambar");

  const effectiveOrder = localOrder ?? savedOrder;
  const orderedVehicles: VehicleDef[] = (() => {
    const byId = Object.fromEntries(VEHICLE_DEFS.map(v => [v.id, v]));
    const ids = effectiveOrder.length > 0
      ? [...effectiveOrder, ...VEHICLE_DEFS.map(v => v.id).filter(id => !effectiveOrder.includes(id))]
      : VEHICLE_DEFS.map(v => v.id);
    return ids.map(id => byId[id]).filter(Boolean) as VehicleDef[];
  })();

  useEffect(() => {
    async function load() {
      setLoadingImages(true);
      try {
        const [imgRes, ordRes] = await Promise.all([
          fetch("/api/settings/vehicle-images", { credentials: "include" }),
          fetch("/api/settings/vehicle-order", { credentials: "include" }),
        ]);
        if (imgRes.ok) setImages(await imgRes.json());
        if (ordRes.ok) setSavedOrder(await ordRes.json());
      } catch {
        toast({ title: t("adminVehicle.loadError", "Gagal memuat data kendaraan"), variant: "destructive" });
      } finally {
        setLoadingImages(false);
      }
    }
    void load();
  }, []);

  async function handleUpload(vehicleId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    let url: string;
    try {
      const res = await fetch("/api/settings/vehicle-images/upload", { method: "POST", credentials: "include", body: formData });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error((j as { error?: string }).error ?? `HTTP ${res.status}`); }
      url = (await res.json()).url;
    } catch (err) {
      toast({ title: t("adminVehicle.uploadError", "Gagal upload"), description: String(err), variant: "destructive" });
      return;
    }
    const updated = { ...images, [vehicleId]: url };
    const saveRes = await fetch("/api/settings/vehicle-images", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    if (saveRes.ok) {
      setImages(updated);
      toast({ title: `${t("adminVehicle.imageSavedPrefix", "Gambar")} ${VEHICLE_DEFS.find(v => v.id === vehicleId)?.name} ${t("adminVehicle.imageSavedSuffix", "berhasil disimpan")}` });
    } else {
      toast({ title: t("adminVehicle.imageSaveError", "Gagal menyimpan gambar"), variant: "destructive" });
    }
  }

  async function handleRemove(vehicleId: string) {
    const updated = { ...images };
    delete updated[vehicleId];
    const saveRes = await fetch("/api/settings/vehicle-images", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    if (saveRes.ok) {
      setImages(updated);
      toast({ title: `${t("adminVehicle.imageSavedPrefix", "Gambar")} ${VEHICLE_DEFS.find(v => v.id === vehicleId)?.name} ${t("adminVehicle.imageRemovedSuffix", "dihapus")}` });
    } else {
      toast({ title: t("adminVehicle.imageRemoveError", "Gagal menghapus gambar"), variant: "destructive" });
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIds = orderedVehicles.map(v => v.id);
    setLocalOrder(arrayMove(oldIds, oldIds.indexOf(active.id as string), oldIds.indexOf(over.id as string)));
  }

  async function saveOrder() {
    setSavingOrder(true);
    try {
      const order = orderedVehicles.map(v => v.id);
      const res = await fetch("/api/settings/vehicle-order", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
      if (res.ok) { setSavedOrder(order); setLocalOrder(null); toast({ title: t("adminVehicle.orderSaved", "Urutan kendaraan berhasil disimpan") }); }
      else toast({ title: t("adminVehicle.orderSaveError", "Gagal menyimpan urutan"), variant: "destructive" });
    } finally {
      setSavingOrder(false);
    }
  }

  if (loadingImages) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <Button variant={activeSubTab === "gambar" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setActiveSubTab("gambar")}>
          <ImageIcon className="w-4 h-4" /> {t("adminVehicle.tabImages", "Gambar")}
        </Button>
        <Button variant={activeSubTab === "urutan" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setActiveSubTab("urutan")}>
          <GripVertical className="w-4 h-4" /> {t("adminVehicle.tabOrder", "Urutan Tampil")}
        </Button>
      </div>

      {activeSubTab === "gambar" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>{Object.keys(images).length} {t("adminVehicle.imageCountOf", "dari")} {VEHICLE_DEFS.length} {t("adminVehicle.imageCountSuffix", "kendaraan sudah punya gambar. Yang belum diupload tetap menampilkan ilustrasi SVG bawaan.")}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {orderedVehicles.map(v => (
              <VehicleImageCard key={v.id} vehicle={v} imageUrl={images[v.id] ?? null} onUpload={handleUpload} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "urutan" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("adminVehicle.orderHint", "Drag baris untuk mengubah urutan tampil kendaraan di halaman Trucking.")}</p>
            {localOrder !== null && (
              <Button size="sm" className="gap-1.5" onClick={() => void saveOrder()} disabled={savingOrder}>
                {savingOrder ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("adminVehicle.savingOrder", "Menyimpan…")}</> : <><Save className="w-3.5 h-3.5" /> {t("adminVehicle.saveOrderBtn", "Simpan Urutan")}</>}
              </Button>
            )}
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedVehicles.map(v => v.id)} strategy={rectSortingStrategy}>
              <div className="space-y-2">
                {orderedVehicles.map((v, i) => (
                  <SortableVehicleItem key={v.id} vehicle={v} index={i} imageUrl={images[v.id]} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {localOrder === null && savedOrder.length === 0 && (
            <p className="text-xs text-center text-slate-400 pt-2">{t("adminVehicle.defaultOrderHint", "Urutan default — drag untuk mengubah, lalu klik Simpan.")}</p>
          )}
        </div>
      )}
    </div>
  );
}
