import { useState, useEffect } from "react";
// C1: auth via cookie
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Save, Loader2, Plus, Trash2, Settings, GripVertical, ToggleLeft, ToggleRight, ExternalLink, Ship, Truck,
} from "lucide-react";
import { apiGet, apiPut, apiPost, DeliveryVendor, ServiceTypeSelect } from "./adminShared";
import { useLanguage } from "@/i18n/LanguageContext";

// ── DeliveryVendorsTab ────────────────────────────────────────────────────────

export function DeliveryVendorsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<DeliveryVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("📦");
  const [newEta, setNewEta] = useState("2-3 hari");
  const [newFee, setNewFee] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<DeliveryVendor>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await apiGet<DeliveryVendor[]>("/api/portal/admin/delivery-vendors");
      setVendors(data);
    } catch {
      toast({ title: t("adminLogistics.loadError", "Gagal memuat data kurir"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleAdd() {
    if (!newName.trim()) {
      toast({ title: t("adminLogistics.nameRequired", "Nama vendor harus diisi"), variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const created = await apiPost<DeliveryVendor>("/api/portal/admin/delivery-vendors", {
        name: newName.trim(),
        logo: newLogo.trim() || "📦",
        eta: newEta.trim() || "2-3 hari",
        fee: parseFloat(newFee) || 0,
        note: newNote.trim() || null,
        phone: newPhone.trim() || null,
        email: newEmail.trim() || null,
        serviceType: newServiceType.trim() || null,
      });
      setVendors((prev) => [...prev, created]);
      setShowAdd(false);
      setNewName(""); setNewLogo("📦"); setNewEta("2-3 hari"); setNewFee(""); setNewNote("");
      setNewPhone(""); setNewEmail(""); setNewServiceType("");
      toast({ title: t("adminLogistics.addSuccess", "Kurir berhasil ditambahkan") });
    } catch (err) {
      toast({ title: t("adminLogistics.addError", "Gagal menambahkan kurir"), description: String(err), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: number, isActive: boolean) {
    try {
      await apiPut(`/api/portal/admin/delivery-vendors/${id}`, { isActive });
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, isActive } : v));
    } catch {
      toast({ title: t("adminLogistics.toggleError", "Gagal mengubah status"), variant: "destructive" });
    }
  }

  async function handleSaveEdit(id: number) {
    setSaving(true);
    try {
      const updated = await apiPut<DeliveryVendor>(`/api/portal/admin/delivery-vendors/${id}`, editData);
      setVendors((prev) => prev.map((v) => v.id === id ? updated : v));
      setEditId(null);
      setEditData({});
      toast({ title: t("adminLogistics.updateSuccess", "Kurir berhasil diperbarui") });
    } catch {
      toast({ title: t("adminLogistics.saveError", "Gagal menyimpan"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(t("adminLogistics.confirmDelete", `Hapus vendor "${name}"?`).replace("${name}", name))) return;
    try {
      await fetch(`/api/portal/admin/delivery-vendors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setVendors((prev) => prev.filter((v) => v.id !== id));
      toast({ title: t("adminLogistics.deleteSuccess", "Kurir berhasil dihapus") });
    } catch {
      toast({ title: t("adminLogistics.deleteError", "Gagal menghapus"), variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("adminLogistics.manageVendors", `Kelola ${vendors.length} vendor kurir/pengiriman. Aktifkan atau nonaktifkan yang ditampilkan ke pelanggan.`).replace("${count}", String(vendors.length))}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> {t("adminLogistics.addVendor", "Tambah Kurir")}
        </Button>
      </div>

      <div className="space-y-2">
        {vendors.map((v) => (
          <div key={v.id} className={`rounded-xl border p-4 transition-all ${v.isActive ? "bg-white border-border" : "bg-gray-50 border-dashed border-gray-200 opacity-60"}`}>
            {editId === v.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldName", "Nama")}</Label>
                    <Input value={editData.name ?? v.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldLogo", "Logo/Emoji")}</Label>
                    <Input value={editData.logo ?? v.logo} onChange={(e) => setEditData((d) => ({ ...d, logo: e.target.value }))} placeholder="📦" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldEta", "Estimasi (ETA)")}</Label>
                    <Input value={editData.eta ?? v.eta} onChange={(e) => setEditData((d) => ({ ...d, eta: e.target.value }))} placeholder="2-3 hari" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldFee", "Ongkir (0 = Nego)")}</Label>
                    <Input type="number" value={editData.fee ?? v.fee} onChange={(e) => setEditData((d) => ({ ...d, fee: parseFloat(e.target.value) || 0 }))} min="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldPhone", "No. WhatsApp Vendor")}</Label>
                    <Input value={editData.phone ?? v.phone ?? ""} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value || null }))} placeholder="628xxxxxxxxxx" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldEmail", "Email Vendor")}</Label>
                    <Input type="email" value={editData.email ?? v.email ?? ""} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value || null }))} placeholder="vendor@email.com" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldServiceType", "Tipe Layanan (untuk notifikasi order)")}</Label>
                    <ServiceTypeSelect
                      value={editData.serviceType ?? v.serviceType ?? ""}
                      onChange={(val) => setEditData((d) => ({ ...d, serviceType: val || null }))}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">{t("adminLogistics.fieldNote", "Catatan (opsional)")}</Label>
                    <Input value={editData.note ?? v.note ?? ""} onChange={(e) => setEditData((d) => ({ ...d, note: e.target.value || null }))} placeholder={t("adminLogistics.notePlaceholder", "Harga nego, dll.")} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveEdit(v.id)} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {t("common.save", "Simpan")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setEditData({}); }}>{t("common.cancel", "Batal")}</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                <span className="text-2xl shrink-0">{v.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{v.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">⏱ {v.eta}</span>
                    <span className="text-xs font-medium text-primary">
                      {v.fee > 0 ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v.fee) : v.note ?? t("adminLogistics.nego", "Nego")}
                    </span>
                    {v.serviceType && <Badge variant="outline" className="text-[10px] px-1.5">{v.serviceType}</Badge>}
                    {v.phone && <span className="text-xs text-muted-foreground">📱 {v.phone}</span>}
                    {v.email && <span className="text-xs text-muted-foreground">✉ {v.email}</span>}
                    {!v.isActive && <Badge variant="secondary" className="text-[10px] px-1">{t("adminLogistics.inactive", "Nonaktif")}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {v.isActive ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    <Switch checked={v.isActive} onCheckedChange={(checked) => void handleToggle(v.id, checked)} />
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditId(v.id); setEditData({}); }}>
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => void handleDelete(v.id, v.name)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">{t("adminLogistics.emptyState", "Belum ada kurir. Klik \"Tambah Kurir\" untuk menambahkan.")}</div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("adminLogistics.addDialogTitle", "Tambah Vendor Kurir")}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>{t("adminLogistics.fieldNameRequired", "Nama Vendor *")}</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="PT. Vendor Logistics" />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldLogo", "Logo/Emoji")}</Label>
                <Input value={newLogo} onChange={(e) => setNewLogo(e.target.value)} placeholder="📦" />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldEstimasi", "Estimasi Waktu")}</Label>
                <Input value={newEta} onChange={(e) => setNewEta(e.target.value)} placeholder="2-3 hari" />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldOngkir", "Ongkir (Rp, 0 = Nego)")}</Label>
                <Input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldNote", "Catatan")}</Label>
                <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder={t("adminLogistics.notePlaceholder", "Harga nego, dll.")} />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldWhatsapp", "No. WhatsApp")}</Label>
                <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="628xxxxxxxxxx" />
              </div>
              <div className="space-y-1">
                <Label>{t("adminLogistics.fieldEmail", "Email")}</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="vendor@email.com" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>{t("adminLogistics.fieldServiceTypeShort", "Tipe Layanan")}</Label>
                <ServiceTypeSelect value={newServiceType} onChange={setNewServiceType} />
                <p className="text-[11px] text-muted-foreground">{t("adminLogistics.serviceTypeHint", "Kosongkan jika vendor menerima semua jenis order.")}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>{t("common.cancel", "Batal")}</Button>
            <Button onClick={() => void handleAdd()} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("adminLogistics.addBtn", "Tambah")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── PricingTab ────────────────────────────────────────────────────────────────

type TruckingRates = Record<string, { ratePerKm: number; loadingFee: number }>;
type FreightRates = {
  seaLcl:          { ratePerCbm: number; label: string };
  seaFcl20:        { flatRate: number; label: string };
  seaFcl40:        { flatRate: number; label: string };
  air:             { ratePerKg: number; label: string };
  customClearance: { flatRate: number; label: string };
};

export function PricingTab() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [, setTrucking] = useState<TruckingRates>({});
  const [truckingEdit, setTruckingEdit] = useState<TruckingRates>({});
  const [truckingLoading, setTruckingLoading] = useState(true);
  const [truckingSaving, setTruckingSaving] = useState(false);

  const [freight, setFreight] = useState<FreightRates | null>(null);
  const [freightEdit, setFreightEdit] = useState<Partial<FreightRates>>({});
  const [freightLoading, setFreightLoading] = useState(true);
  const [freightSaving, setFreightSaving] = useState(false);

  const [newVehicle, setNewVehicle] = useState("");
  const [newRatePerKm, setNewRatePerKm] = useState("");
  const [newLoadingFee, setNewLoadingFee] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<TruckingRates>("/api/portal/admin/trucking-rates");
        setTrucking(data);
        setTruckingEdit(JSON.parse(JSON.stringify(data)) as TruckingRates);
      } catch {
        toast({ title: t("adminLogistics.loadTruckingError", "Gagal memuat tarif trucking"), variant: "destructive" });
      } finally { setTruckingLoading(false); }
    })();
    void (async () => {
      try {
        const data = await apiGet<FreightRates>("/api/portal/admin/freight-rates");
        setFreight(data);
        setFreightEdit(JSON.parse(JSON.stringify(data)) as FreightRates);
      } catch {
        toast({ title: t("adminLogistics.loadFreightError", "Gagal memuat tarif freight"), variant: "destructive" });
      } finally { setFreightLoading(false); }
    })();
  }, []);

  const parse = (s: string) => parseInt(s.replace(/\D/g, ""), 10) || 0;

  async function saveTrucking() {
    setTruckingSaving(true);
    try {
      await apiPut("/api/portal/admin/trucking-rates", truckingEdit);
      setTrucking(JSON.parse(JSON.stringify(truckingEdit)) as TruckingRates);
      toast({ title: t("adminLogistics.saveTruckingSuccess", "Tarif trucking berhasil disimpan") });
    } catch {
      toast({ title: t("adminLogistics.saveTruckingError", "Gagal menyimpan tarif trucking"), variant: "destructive" });
    } finally { setTruckingSaving(false); }
  }

  async function saveFreight() {
    setFreightSaving(true);
    try {
      await apiPut("/api/portal/admin/freight-rates", freightEdit);
      setFreight(JSON.parse(JSON.stringify(freightEdit)) as FreightRates);
      toast({ title: t("adminLogistics.saveFreightSuccess", "Tarif freight berhasil disimpan") });
    } catch {
      toast({ title: t("adminLogistics.saveFreightError", "Gagal menyimpan tarif freight"), variant: "destructive" });
    } finally { setFreightSaving(false); }
  }

  async function addVehicle() {
    const name = newVehicle.trim();
    if (!name) { toast({ title: t("adminLogistics.vehicleNameRequired", "Nama kendaraan harus diisi"), variant: "destructive" }); return; }
    setAddingVehicle(true);
    const updated = {
      ...truckingEdit,
      [name]: { ratePerKm: parse(newRatePerKm), loadingFee: parse(newLoadingFee) },
    };
    try {
      await apiPut("/api/portal/admin/trucking-rates", updated);
      setTrucking(updated);
      setTruckingEdit(JSON.parse(JSON.stringify(updated)) as TruckingRates);
      setNewVehicle(""); setNewRatePerKm(""); setNewLoadingFee("");
      toast({ title: t("adminLogistics.vehicleAdded", `Kendaraan "${name}" ditambahkan`) });
    } catch {
      toast({ title: t("adminLogistics.addVehicleError", "Gagal menambah kendaraan"), variant: "destructive" });
    } finally { setAddingVehicle(false); }
  }

  async function deleteVehicle(key: string) {
    if (!confirm(t("adminLogistics.confirmDeleteVehicle", `Hapus kendaraan "${key}"?`))) return;
    const updated = { ...truckingEdit };
    delete updated[key];
    try {
      await apiPut("/api/portal/admin/trucking-rates", updated);
      setTrucking(updated);
      setTruckingEdit(JSON.parse(JSON.stringify(updated)) as TruckingRates);
      toast({ title: t("adminLogistics.vehicleDeleted", `Kendaraan "${key}" dihapus`) });
    } catch {
      toast({ title: t("adminLogistics.deleteError", "Gagal menghapus"), variant: "destructive" });
    }
  }

  const FREIGHT_FIELDS: Array<{ key: keyof FreightRates; label: string; icon: string; field: string; unit: string }> = [
    { key: "seaLcl",          label: "Sea Freight LCL",     icon: "🚢", field: "ratePerCbm", unit: "per CBM" },
    { key: "seaFcl20",        label: "Sea Freight FCL 20ft", icon: "📦", field: "flatRate",   unit: "flat" },
    { key: "seaFcl40",        label: "Sea Freight FCL 40ft", icon: "📦", field: "flatRate",   unit: "flat" },
    { key: "air",             label: "Air Freight",           icon: "✈️", field: "ratePerKg",  unit: "per kg" },
    { key: "customClearance", label: "Custom Clearance",      icon: "📋", field: "flatRate",   unit: "flat" },
  ];

  return (
    <div className="space-y-8">
      {/* ---- Trucking Rates ---- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <Truck className="h-5 w-5 text-sky-600" />
          <h3 className="font-semibold text-base">{t("adminLogistics.truckingRatesTitle", "Tarif Trucking")}</h3>
          <span className="text-xs text-muted-foreground ml-1">{t("adminLogistics.truckingRatesSubtitle", "— Rate per km + biaya muat")}</span>
        </div>

        {truckingLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">{t("adminLogistics.colVehicle", "Kendaraan")}</th>
                    <th className="text-right px-4 py-2.5 font-medium">{t("adminLogistics.colRateKm", "Rate/km (Rp)")}</th>
                    <th className="text-right px-4 py-2.5 font-medium">{t("adminLogistics.colLoadingFee", "Biaya Muat (Rp)")}</th>
                    <th className="px-3 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(truckingEdit).map(([key, val]) => (
                    <tr key={key} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{key}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Input type="number" className="text-right h-8 w-32 ml-auto" value={val.ratePerKm} min={0}
                          onChange={(e) => setTruckingEdit((prev) => ({ ...prev, [key]: { ...prev[key], ratePerKm: parseFloat(e.target.value) || 0 } }))} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Input type="number" className="text-right h-8 w-36 ml-auto" value={val.loadingFee} min={0}
                          onChange={(e) => setTruckingEdit((prev) => ({ ...prev, [key]: { ...prev[key], loadingFee: parseFloat(e.target.value) || 0 } }))} />
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => void deleteVehicle(key)} className="text-destructive hover:text-destructive/70 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-end gap-2 pt-1">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">{t("adminLogistics.vehicleNameLabel", "Nama Kendaraan")}</Label>
                <Input value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} placeholder={t("adminLogistics.vehicleNamePlaceholder", "cth: Engkel")} className="h-8" />
              </div>
              <div className="space-y-1 w-32">
                <Label className="text-xs">{t("adminLogistics.rateKmLabel", "Rate/km")}</Label>
                <Input type="number" value={newRatePerKm} onChange={(e) => setNewRatePerKm(e.target.value)} placeholder="5000" className="h-8" />
              </div>
              <div className="space-y-1 w-36">
                <Label className="text-xs">{t("adminLogistics.loadingFeeLabel", "Biaya Muat")}</Label>
                <Input type="number" value={newLoadingFee} onChange={(e) => setNewLoadingFee(e.target.value)} placeholder="500000" className="h-8" />
              </div>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 shrink-0" onClick={() => void addVehicle()} disabled={addingVehicle}>
                {addingVehicle ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                {t("adminLogistics.addBtn", "Tambah")}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 space-y-1">
              <p>{t("adminLogistics.truckingHint1", "💡 Tarif ini digunakan untuk kalkulator harga pada halaman pemesanan logistik.")}</p>
              <p>{t("adminLogistics.truckingHint2", "Estimasi biaya = (jarak km × rate/km) + biaya muat")}</p>
              <a href="/jasa/15" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-1">
                <ExternalLink className="h-3 w-3" /> {t("adminLogistics.viewCalculator", "Lihat Kalkulator Trucking")}
              </a>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">{Object.keys(truckingEdit).length} {t("adminLogistics.vehicleCount", "jenis kendaraan terdaftar")}</p>
              <Button size="sm" onClick={() => void saveTrucking()} disabled={truckingSaving} className="gap-2">
                {truckingSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {t("adminLogistics.saveTruckingBtn", "Simpan Tarif Trucking")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Freight Rates ---- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b">
          <Ship className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-base">{t("adminLogistics.freightRatesTitle", "Tarif Freight (Sea & Air)")}</h3>
          <span className="text-xs text-muted-foreground ml-1">{t("adminLogistics.freightRatesSubtitle", "— Harga pengiriman internasional")}</span>
        </div>

        {freightLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : freight ? (
          <div className="space-y-3">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">{t("adminLogistics.colServiceType", "Jenis Layanan")}</th>
                    <th className="text-left px-4 py-2.5 font-medium">{t("adminLogistics.colUnit", "Satuan")}</th>
                    <th className="text-right px-4 py-2.5 font-medium">{t("adminLogistics.colRate", "Tarif (Rp)")}</th>
                  </tr>
                </thead>
                <tbody>
                  {FREIGHT_FIELDS.map(({ key, label, icon, field, unit }) => {
                    const row = (freightEdit as Record<string, Record<string, number | string>>)[key] ?? {};
                    const currentVal = (row[field] as number) ?? 0;
                    return (
                      <tr key={key} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5"><span className="mr-2">{icon}</span><span className="font-medium">{label}</span></td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{unit}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Input type="number" className="text-right h-8 w-40 ml-auto" value={currentVal} min={0}
                            onChange={(e) => setFreightEdit((prev) => ({
                              ...prev,
                              [key]: { ...(((prev as Record<string, Record<string, number | string>>)[key]) ?? {}), [field]: parseFloat(e.target.value) || 0 },
                            }))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 space-y-1">
              <p>{t("adminLogistics.freightHint1", "💡 Tarif ini ditampilkan di halaman pemesanan logistik dan kalkulator biaya untuk pelanggan.")}</p>
              <p>{t("adminLogistics.freightHint2", "LCL = Less than Container Load (dihitung per CBM). FCL = Full Container Load (harga flat per container).")}</p>
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={() => void saveFreight()} disabled={freightSaving} className="gap-2">
                {freightSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {t("adminLogistics.saveFreightBtn", "Simpan Tarif Freight")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
