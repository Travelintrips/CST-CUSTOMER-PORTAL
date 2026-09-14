import { useState, useEffect } from "react";
// C1: auth via cookie
import { useToast } from "@/hooks/use-toast";
import { getProductFallbackImage, getServiceFallbackImage } from "@/lib/categoryImages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Save, Loader2, CheckCircle, X } from "lucide-react";
import {
  apiGet, apiPut, apiPost,
  Service, Product, MediaItem,
  MediaUploader, ImageUploader,
} from "./adminShared";

// ── ItemEditCard ──────────────────────────────────────────────────────────────

function ItemEditCard({
  item,
  onSave,
  type,
  allCategories,
}: {
  item: Service | Product;
  onSave: (id: number, data: Partial<Service & Product & { mediaItems: MediaItem[]; categories: string[] }>) => Promise<void>;
  type: "services" | "products";
  allCategories?: string[];
}) {
  const { toast } = useToast();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.price));
  const existingMedia = (item as Service | Product).mediaItems ?? [];
  const firstMediaImage = existingMedia.find((m) => m.type === "image")?.url ?? null;
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl ?? firstMediaImage);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    if (existingMedia.length > 0) return existingMedia;
    if (item.imageUrl) return [{ type: "image" as const, url: item.imageUrl }];
    return [];
  });
  const [unit, setUnit] = useState(type === "products" ? (item as Product).unit ?? "pcs" : "pcs");
  const [unitOptionsRaw, setUnitOptionsRaw] = useState(
    type === "products" ? ((item as Product).unitOptions ?? []).join(", ") : ""
  );
  const [stock, setStock] = useState(type === "products" ? String((item as Product).stock ?? 0) : "0");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    type === "products" ? ((item as Product).categories ?? []) : []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const coverImage = mediaItems.find((m) => m.type === "image")?.url ?? imageUrl;
      const payload: Partial<Service & Product & { mediaItems: MediaItem[]; categories: string[] }> = {
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        imageUrl: mediaItems.length > 0 ? coverImage : imageUrl,
        mediaItems,
      };
      if (type === "products") {
        payload.unit = unit.trim() || "pcs";
        payload.unitOptions = unitOptionsRaw.split(",").map((s) => s.trim()).filter(Boolean);
        payload.stock = Math.max(0, parseInt(stock, 10) || 0);
        payload.categories = selectedCategories;
      }
      await onSave(item.id, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: `${type === "services" ? "Layanan" : "Produk"} berhasil diperbarui` });
    } catch (err) {
      toast({ title: "Gagal menyimpan", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.name}</CardTitle>
          <Badge variant="outline" className="text-xs">ID #{item.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Deskripsi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Deskripsi singkat..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Harga (0 = Negosiasi)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" min="0" />
            </div>
            {type === "products" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm">Stok</Label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Satuan Utama</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs, kg, dus, karton..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Pilihan Satuan Lain <span className="text-muted-foreground font-normal">(pisahkan dengan koma)</span></Label>
                  <Input value={unitOptionsRaw} onChange={(e) => setUnitOptionsRaw(e.target.value)} placeholder="cth: pcs, dus, karton" />
                </div>
                {allCategories && allCategories.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Kategori</Label>
                    <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2">
                      {allCategories.map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`cat-edit-${item.id}-${cat}`}
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`cat-edit-${item.id}-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                        </div>
                      ))}
                    </div>
                    {selectedCategories.length === 0 && (
                      <p className="text-xs text-amber-600">Pilih minimal 1 kategori agar produk muncul di filter BizPortal</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              {type === "products" ? "Foto & Video Produk" : "Foto Layanan"}
              <span className="ml-1 text-xs font-normal text-muted-foreground">(tampil di website publik)</span>
            </Label>
            <MediaUploader
              mediaItems={mediaItems}
              onChange={(items) => {
                setMediaItems(items);
                const cover = items.find((m) => m.type === "image")?.url ?? null;
                if (cover) setImageUrl(cover);
              }}
              fallbackSrc={type === "products" ? getProductFallbackImage(
                (item as Product).categories ?? [],
                item.name,
                (item as Product).subcategory ?? null
              ) : getServiceFallbackImage([], item.name)}
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── ServicesTab ───────────────────────────────────────────────────────────────

export function ServicesTab() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      const data = await apiGet<Service[]>("/api/portal/services");
      setServices(data);
    } catch {
      toast({ title: "Gagal memuat layanan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchServices(); }, []);

  async function handleSave(id: number, data: Partial<Service & Product & { mediaItems: MediaItem[] }>) {
    await apiPut(`/api/portal/admin/services/${id}`, data);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }

  async function handleAdd() {
    if (!newName.trim()) {
      toast({ title: "Nama layanan harus diisi", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const created = await apiPost<Service>("/api/portal/admin/services", {
        name: newName.trim(),
        description: newDesc.trim() || null,
        price: parseFloat(newPrice) || 0,
      });
      setServices((prev) => [created, ...prev]);
      setShowAdd(false);
      setNewName(""); setNewDesc(""); setNewPrice("");
      toast({ title: "Layanan berhasil ditambahkan" });
    } catch (err) {
      toast({ title: "Gagal menambahkan layanan", description: String(err), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/portal/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Layanan dihapus" });
    } catch {
      toast({ title: "Gagal menghapus layanan", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola {services.length} layanan yang tampil di halaman Layanan.</p>
        <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Tambah Layanan
        </Button>
      </div>

      {showAdd && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Layanan Baru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nama Layanan *</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="cth: Jasa Freight Udara" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsi singkat layanan (opsional)" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Harga (0 = Negosiasi)</Label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleAdd} disabled={adding} className="gap-2">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {adding ? "Menyimpan..." : "Tambah"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setNewName(""); setNewDesc(""); setNewPrice(""); }}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {services.map((s) => (
        <div key={s.id} className="relative">
          <ItemEditCard item={s} onSave={handleSave} type="services" />
          <Button
            size="icon" variant="ghost"
            className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(s)} title="Hapus layanan"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {services.length === 0 && !showAdd && (
        <div className="text-center py-12 text-muted-foreground">Belum ada layanan. Klik "Tambah Layanan" untuk menambahkan.</div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Layanan?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Layanan <strong>{deleteTarget?.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── ProductsTab ───────────────────────────────────────────────────────────────

export function ProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("pcs");
  const [newUnitOptions, setNewUnitOptions] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [data, cats] = await Promise.all([
          apiGet<Product[]>("/api/portal/admin/products"),
          apiGet<{ id: number; name: string }[]>("/api/portal/admin/product-categories"),
        ]);
        setProducts(data);
        setAllCategories(cats.map((c) => c.name));
      } catch {
        toast({ title: "Gagal memuat produk", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(id: number, data: Partial<Service & Product & { mediaItems: MediaItem[]; categories: string[] }>) {
    const result = await apiPut<Product & { categories?: string[] }>(`/api/portal/admin/products/${id}`, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, categories: result.categories ?? data.categories ?? p.categories } : p)));
  }

  function toggleNewCategory(name: string) {
    setNewCategories((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
  }

  async function handleAdd() {
    if (!newName.trim()) {
      toast({ title: "Nama produk harus diisi", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const created = await apiPost<Product>("/api/portal/admin/products", {
        name: newName.trim(),
        description: newDesc.trim() || null,
        price: parseFloat(newPrice) || 0,
        imageUrl: newImageUrl,
        unit: newUnit.trim() || "pcs",
        unitOptions: newUnitOptions.split(",").map((s) => s.trim()).filter(Boolean),
        categories: newCategories,
      });
      setProducts((prev) => [created, ...prev]);
      setShowAdd(false);
      setNewName(""); setNewDesc(""); setNewPrice(""); setNewUnit("pcs"); setNewUnitOptions(""); setNewImageUrl(null); setNewCategories([]);
      toast({ title: "Produk berhasil ditambahkan" });
    } catch (err) {
      toast({ title: "Gagal menambahkan produk", description: String(err), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portal/admin/products/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Produk dihapus" });
    } catch {
      toast({ title: "Gagal menghapus produk", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola {products.length} produk yang tampil di halaman Produk.</p>
        <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {products.map((p) => (
        <div key={p.id} className="relative">
          <ItemEditCard item={p} onSave={handleSave} type="products" allCategories={allCategories} />
          <Button
            size="icon" variant="ghost"
            className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(p)} title="Hapus produk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Belum ada produk. Klik "Tambah Produk" untuk menambahkan produk baru.</div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Produk?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Produk <strong>{deleteTarget?.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Produk <span className="text-destructive">*</span></Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama produk..." />
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} placeholder="Deskripsi singkat produk..." />
            </div>
            <div className="space-y-1.5">
              <Label>Harga (0 = Negosiasi)</Label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Satuan Utama</Label>
                <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="pcs, kg, dus..." />
              </div>
              <div className="space-y-1.5">
                <Label>Pilihan Satuan Lain</Label>
                <Input value={newUnitOptions} onChange={(e) => setNewUnitOptions(e.target.value)} placeholder="pcs, dus, karton" />
              </div>
            </div>
            {allCategories.length > 0 && (
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <div className="border rounded-md p-3 max-h-36 overflow-y-auto space-y-2">
                  {allCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <input type="checkbox" id={`new-cat-${cat}`} checked={newCategories.includes(cat)} onChange={() => toggleNewCategory(cat)} className="h-4 w-4 rounded border-gray-300" />
                      <label htmlFor={`new-cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                    </div>
                  ))}
                </div>
                {newCategories.length === 0 && (
                  <p className="text-xs text-amber-600">Pilih minimal 1 kategori agar produk muncul di filter BizPortal</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Gambar Produk</Label>
              <ImageUploader currentUrl={newImageUrl} onUpload={(url) => setNewImageUrl(url)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={adding}>
              <X className="h-4 w-4 mr-1" /> Batal
            </Button>
            <Button onClick={handleAdd} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {adding ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
