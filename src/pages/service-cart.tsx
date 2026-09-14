import { useState, useEffect, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
// C1: auth via cookie
import {
  Plane, Ship, Truck, Package, Warehouse, ShieldCheck,
  Search, FileText, Layers, ArrowLeft, Plus, Trash2,
  ChevronRight, Globe, Edit3, CheckCircle2, Loader2,
  Send, RotateCcw, AlertCircle, ClipboardList, ArrowRight,
  BoxSelect, Lock, Unlock, ImageIcon, Calculator,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type TradeType = "EXPORT" | "IMPORT" | "DOMESTIC";
type OrderMode = "ITEM_MANDIRI" | "PAKET_BORONGAN";

type ServiceType =
  | "air_freight" | "ocean_freight" | "ppjk" | "forwarding"
  | "trucking" | "warehousing" | "handling" | "insurance"
  | "survey" | "project_cargo";

interface ServiceItem {
  id?: number;
  tempId: string;
  itemType: ServiceType;
  title: string;
  description?: string;
  formData: Record<string, string | number | boolean>;
  sequenceNo?: number;
  status?: string;
  isRequired?: boolean;
}

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  notes: string;
}

interface ServicePackage {
  id: number;
  packageCode: string;
  packageName: string;
  packageType: string;
  tradeType: string;
  description: string | null;
  pricingMode: string;
  iconEmoji: string | null;
  items: PackageItem[];
}

interface PackageItem {
  id: number;
  itemType: string;
  itemTitle: string;
  isRequired: boolean;
  sequenceNo: number;
  requiredDocuments: string[];
}

type Step = "trade_type" | "company_profile" | "mode_select" | "package_select" | "add_items" | "review" | "success";

interface CompanyProfile {
  companyName: string;
  npwp: string;
  nib: string;
  companyAddress: string;
  picName: string;
  picWhatsapp: string;
  picEmail: string;
  legalDocUrl: string;
  ktpPicUrl: string;
  suratKuasaUrl: string;
  apiNikIzinUrl: string;
  additionalNotes: string;
  profileStatus?: string;
  filledFields?: number;
  totalRequired?: number;
  isVerified?: boolean;
}

// ─── Service catalog metadata ──────────────────────────────────────────────────

const SERVICE_META: Record<ServiceType, {
  title: string; desc: string; icon: React.ElementType;
  color: string; bgColor: string; requiredDocs: string[];
}> = {
  air_freight: {
    title: "Air Freight", desc: "Kargo udara domestik & internasional",
    icon: Plane, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200",
    requiredDocs: ["Invoice", "Packing List", "AWB Draft"],
  },
  ocean_freight: {
    title: "Ocean Freight", desc: "Kargo laut FCL / LCL",
    icon: Ship, color: "text-cyan-600", bgColor: "bg-cyan-50 border-cyan-200",
    requiredDocs: ["Invoice", "Packing List", "B/L Draft"],
  },
  forwarding: {
    title: "Forwarding", desc: "Jasa ekspedisi & kepabeanan lengkap",
    icon: Globe, color: "text-violet-600", bgColor: "bg-violet-50 border-violet-200",
    requiredDocs: ["Invoice", "Packing List", "HS Code", "MSDS (jika B3)"],
  },
  ppjk: {
    title: "PPJK / Customs", desc: "Kepabeanan PIB/PEB & clearance",
    icon: ClipboardList, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200",
    requiredDocs: ["PIB/PEB", "Invoice", "Packing List", "Surat Kuasa"],
  },
  trucking: {
    title: "Trucking", desc: "Pengiriman darat antar kota",
    icon: Truck, color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200",
    requiredDocs: ["Surat Jalan", "DO"],
  },
  warehousing: {
    title: "Warehousing", desc: "Penyimpanan barang gudang",
    icon: Warehouse, color: "text-green-600", bgColor: "bg-green-50 border-green-200",
    requiredDocs: ["Inbound Receipt", "Stock List"],
  },
  handling: {
    title: "Handling", desc: "Bongkar muat, stuffing, stripping",
    icon: Package, color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200",
    requiredDocs: ["DO", "Packing List"],
  },
  insurance: {
    title: "Insurance", desc: "Asuransi kargo all-risk",
    icon: ShieldCheck, color: "text-red-600", bgColor: "bg-red-50 border-red-200",
    requiredDocs: ["Invoice", "Packing List"],
  },
  survey: {
    title: "Survey / Inspection", desc: "Pre-shipment & condition report",
    icon: Search, color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200",
    requiredDocs: ["Surat Penugasan Survey"],
  },
  project_cargo: {
    title: "Project Cargo", desc: "Muatan proyek — oversize, heavy lift",
    icon: Layers, color: "text-pink-600", bgColor: "bg-pink-50 border-pink-200",
    requiredDocs: ["Teknikal Spesifikasi", "Dimensi & Berat"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  const { t } = useLanguage();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue placeholder={t("serviceCart.selectPlaceholder", "Pilih...")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} id={label} />
      <Label htmlFor={label} className="text-xs text-slate-700 cursor-pointer">{label}</Label>
    </div>
  );
}

// ─── STEP 7 — Dynamic forms per service type ──────────────────────────────────

function AirFreightForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  const l = Number(data.dim_length_cm ?? 0);
  const w = Number(data.dim_width_cm ?? 0);
  const h = Number(data.dim_height_cm ?? 0);
  const gross = Number(data.gross_weight_kg ?? 0);
  const volumetric = l * w * h / 6000;
  const chargeable = Math.max(gross, volumetric);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.originAirport", "Bandara Asal")} required>
        <TextInput value={String(data.origin_airport ?? "")} onChange={(v) => onChange("origin_airport", v)} placeholder="e.g. CGK" />
      </Field>
      <Field label={t("serviceCart.destAirport", "Bandara Tujuan")} required>
        <TextInput value={String(data.dest_airport ?? "")} onChange={(v) => onChange("dest_airport", v)} placeholder="e.g. SIN" />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")} required>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder="e.g. Electronics" />
      </Field>
      <Field label="HS Code">
        <TextInput value={String(data.hs_code ?? "")} onChange={(v) => onChange("hs_code", v)} placeholder="e.g. 8471" />
      </Field>
      <Field label={t("serviceCart.serviceMode", "Mode Layanan")}>
        <SelectInput value={String(data.service_mode ?? "")} onChange={(v) => onChange("service_mode", v)} options={[
          { v: "airport_to_airport", l: "Airport to Airport" },
          { v: "door_to_door", l: "Door to Door" },
          { v: "door_to_airport", l: "Door to Airport" },
          { v: "airport_to_door", l: "Airport to Door" },
        ]} />
      </Field>
      <Field label={t("serviceCart.readyDate", "Ready Date")}>
        <TextInput type="date" value={String(data.ready_date ?? "")} onChange={(v) => onChange("ready_date", v)} />
      </Field>
      <Field label={t("serviceCart.grossWeightKg", "Gross Weight (kg)")} required>
        <TextInput type="number" value={String(data.gross_weight_kg ?? "")} onChange={(v) => onChange("gross_weight_kg", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.jumlahKoli", "Jumlah Koli")}>
        <TextInput type="number" value={String(data.koli ?? "")} onChange={(v) => onChange("koli", v)} placeholder="1" />
      </Field>
      <div className="col-span-2">
        <p className="text-xs font-medium text-slate-600 mb-1.5">{t("serviceCart.dimensiPerKoli", "Dimensi per Koli (cm)")}</p>
        <div className="grid grid-cols-3 gap-2">
          <TextInput type="number" value={String(data.dim_length_cm ?? "")} onChange={(v) => onChange("dim_length_cm", v)} placeholder={t("serviceCart.panjang", "Panjang")} />
          <TextInput type="number" value={String(data.dim_width_cm ?? "")} onChange={(v) => onChange("dim_width_cm", v)} placeholder={t("serviceCart.lebar", "Lebar")} />
          <TextInput type="number" value={String(data.dim_height_cm ?? "")} onChange={(v) => onChange("dim_height_cm", v)} placeholder={t("serviceCart.tinggi", "Tinggi")} />
        </div>
      </div>
      {(l > 0 || w > 0 || h > 0 || gross > 0) && (
        <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <Calculator className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="text-xs text-blue-700 flex gap-4">
            <span>{t("serviceCart.volumetric", "Volumetric")}: <strong>{volumetric.toFixed(1)} kg</strong></span>
            <span>{t("serviceCart.gross", "Gross")}: <strong>{gross.toFixed(1)} kg</strong></span>
            <span className="font-bold text-blue-800">{t("serviceCart.chargeable", "Chargeable")}: {chargeable.toFixed(1)} kg</span>
          </div>
        </div>
      )}
      <Field label={t("serviceCart.fotoBarangUrl", "Foto Barang (URL)")}>
        <div className="flex gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
          <TextInput value={String(data.photo_url ?? "")} onChange={(v) => onChange("photo_url", v)} placeholder="https://..." />
        </div>
      </Field>
    </div>
  );
}

function OceanFreightForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.jenisMuatan", "Jenis Muatan")} required>
        <SelectInput value={String(data.load_type ?? "")} onChange={(v) => onChange("load_type", v)} options={[
          { v: "FCL", l: "FCL — Full Container Load" },
          { v: "LCL", l: "LCL — Less than Container Load" },
        ]} />
      </Field>
      <Field label={t("serviceCart.tipeContainer", "Tipe Container")}>
        <SelectInput value={String(data.container_type ?? "")} onChange={(v) => onChange("container_type", v)} options={[
          { v: "20GP", l: "20' GP" }, { v: "40GP", l: "40' GP" },
          { v: "40HC", l: "40' HC" }, { v: "20RF", l: "20' Reefer" },
          { v: "LCL", l: "LCL / Per CBM" },
        ]} />
      </Field>
      <Field label="Port of Loading (POL)" required>
        <TextInput value={String(data.pol ?? "")} onChange={(v) => onChange("pol", v)} placeholder="e.g. IDJKT Tanjung Priok" />
      </Field>
      <Field label="Port of Discharge (POD)" required>
        <TextInput value={String(data.pod ?? "")} onChange={(v) => onChange("pod", v)} placeholder="e.g. SGSIN" />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")} required>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder="e.g. Furniture" />
      </Field>
      <Field label="HS Code">
        <TextInput value={String(data.hs_code ?? "")} onChange={(v) => onChange("hs_code", v)} placeholder="e.g. 9403" />
      </Field>
      <Field label="Volume (CBM)" required>
        <TextInput type="number" value={String(data.volume_cbm ?? "")} onChange={(v) => onChange("volume_cbm", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.grossWeightKg", "Gross Weight (kg)")}>
        <TextInput type="number" value={String(data.gross_weight_kg ?? "")} onChange={(v) => onChange("gross_weight_kg", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.readyDate", "Ready Date")}>
        <TextInput type="date" value={String(data.ready_date ?? "")} onChange={(v) => onChange("ready_date", v)} />
      </Field>
      <Field label={t("serviceCart.fotoBarangUrl", "Foto Barang (URL)")}>
        <div className="flex gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
          <TextInput value={String(data.photo_url ?? "")} onChange={(v) => onChange("photo_url", v)} placeholder="https://..." />
        </div>
      </Field>
    </div>
  );
}

function ForwardingForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.arahPerdagangan", "Arah Perdagangan")} required>
        <SelectInput value={String(data.trade_direction ?? "")} onChange={(v) => onChange("trade_direction", v)} options={[
          { v: "export", l: "Export" }, { v: "import", l: "Import" },
        ]} />
      </Field>
      <Field label={t("serviceCart.negaraAsal", "Negara Asal")} required>
        <TextInput value={String(data.origin_country ?? "")} onChange={(v) => onChange("origin_country", v)} placeholder="e.g. Indonesia" />
      </Field>
      <Field label={t("serviceCart.negaraTujuan", "Negara Tujuan")} required>
        <TextInput value={String(data.dest_country ?? "")} onChange={(v) => onChange("dest_country", v)} placeholder="e.g. China" />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")} required>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder="e.g. Palm Oil" />
      </Field>
      <Field label="HS Code" required>
        <TextInput value={String(data.hs_code ?? "")} onChange={(v) => onChange("hs_code", v)} placeholder="e.g. 1511" />
      </Field>
      <Field label={t("serviceCart.fotoBarangUrl", "Foto Barang (URL)")} required>
        <div className="flex gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
          <TextInput value={String(data.photo_url ?? "")} onChange={(v) => onChange("photo_url", v)} placeholder="https://..." />
        </div>
      </Field>
      <div className="col-span-2 space-y-2">
        <p className="text-xs font-medium text-slate-600">{t("serviceCart.dokumenTersedia", "Dokumen Tersedia:")}</p>
        <div className="grid grid-cols-2 gap-2">
          <CheckRow label="Invoice" checked={!!data.has_invoice} onChange={(v) => onChange("has_invoice", v)} />
          <CheckRow label="Packing List" checked={!!data.has_packing_list} onChange={(v) => onChange("has_packing_list", v)} />
          <CheckRow label="MSDS (Material Safety Data Sheet)" checked={!!data.has_msds} onChange={(v) => onChange("has_msds", v)} />
          <CheckRow label={t("serviceCart.lartasCheck", "Lartas (Larangan / Pembatasan)")} checked={!!data.lartas_check} onChange={(v) => onChange("lartas_check", v)} />
          <CheckRow label={t("serviceCart.dgCheck", "Barang Berbahaya / DG")} checked={!!data.dg_check} onChange={(v) => onChange("dg_check", v)} />
        </div>
      </div>
    </div>
  );
}

function PpjkForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.arah", "Arah")} required>
        <SelectInput value={String(data.trade_direction ?? "")} onChange={(v) => onChange("trade_direction", v)} options={[
          { v: "export", l: "Export" }, { v: "import", l: "Import" },
        ]} />
      </Field>
      <Field label={t("serviceCart.jenisDokumen", "Jenis Dokumen")}>
        <SelectInput value={String(data.doc_type ?? "")} onChange={(v) => onChange("doc_type", v)} options={[
          { v: "PIB", l: "PIB — Pemberitahuan Impor Barang" },
          { v: "PEB", l: "PEB — Pemberitahuan Ekspor Barang" },
          { v: "BC23", l: "BC 2.3 — Kawasan Bebas" },
          { v: "undername", l: "Undername Service" },
        ]} />
      </Field>
      <Field label="HS Code" required>
        <TextInput value={String(data.hs_code ?? "")} onChange={(v) => onChange("hs_code", v)} placeholder="e.g. 8471" />
      </Field>
      <Field label={t("serviceCart.npwpNib", "NPWP / NIB Perusahaan")}>
        <TextInput value={String(data.npwp_nib ?? "")} onChange={(v) => onChange("npwp_nib", v)} placeholder={t("serviceCart.npwpNibPh", "NPWP atau NIB")} />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")}>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder="e.g. Laptop Computer" />
      </Field>
      <Field label={t("serviceCart.nilaiCif", "Nilai CIF (IDR)")}>
        <TextInput type="number" value={String(data.cif_value ?? "")} onChange={(v) => onChange("cif_value", v)} placeholder="0" />
      </Field>
      <div className="col-span-2 space-y-2">
        <p className="text-xs font-medium text-slate-600">{t("serviceCart.dokumen", "Dokumen:")}</p>
        <div className="grid grid-cols-2 gap-2">
          <CheckRow label={t("serviceCart.invoiceTersedia", "Invoice tersedia")} checked={!!data.has_invoice} onChange={(v) => onChange("has_invoice", v)} />
          <CheckRow label={t("serviceCart.packingListTersedia", "Packing List tersedia")} checked={!!data.has_packing_list} onChange={(v) => onChange("has_packing_list", v)} />
          <CheckRow label={t("serviceCart.lartasPermitRequired", "Dokumen Lartas / Izin diperlukan")} checked={!!data.lartas_permit_required} onChange={(v) => onChange("lartas_permit_required", v)} />
        </div>
      </div>
      <div className="col-span-2 space-y-1">
        <Label className="text-xs font-medium text-slate-600">{t("serviceCart.customsNote", "Customs Note / Catatan Kepabeanan")}</Label>
        <Textarea value={String(data.customs_note ?? "")} onChange={(e) => onChange("customs_note", e.target.value)} rows={2} className="text-sm resize-none" placeholder={t("serviceCart.customsNotePh", "Instruksi khusus, preferensi jalur, dll...")} />
      </div>
    </div>
  );
}

function TruckingForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.alamatPickup", "Alamat Pickup")} required>
        <TextInput value={String(data.pickup_address ?? "")} onChange={(v) => onChange("pickup_address", v)} placeholder="Jl. ..., Kota" />
      </Field>
      <Field label={t("serviceCart.alamatTujuan", "Alamat Tujuan")} required>
        <TextInput value={String(data.delivery_address ?? "")} onChange={(v) => onChange("delivery_address", v)} placeholder="Jl. ..., Kota" />
      </Field>
      <Field label={t("serviceCart.picPickup", "PIC Pickup (Nama & HP)")}>
        <TextInput value={String(data.pickup_pic ?? "")} onChange={(v) => onChange("pickup_pic", v)} placeholder="e.g. Budi — 08123..." />
      </Field>
      <Field label={t("serviceCart.picTujuan", "PIC Tujuan (Nama & HP)")}>
        <TextInput value={String(data.delivery_pic ?? "")} onChange={(v) => onChange("delivery_pic", v)} placeholder="e.g. Siti — 08987..." />
      </Field>
      <Field label={t("serviceCart.jenisKendaraan", "Jenis Kendaraan")} required>
        <SelectInput value={String(data.vehicle_type ?? "")} onChange={(v) => onChange("vehicle_type", v)} options={[
          { v: "motor", l: "Motor" }, { v: "mobil", l: "Mobil / Van" },
          { v: "pickup", l: "Pickup" }, { v: "engkel", l: "Engkel" },
          { v: "cdd", l: "CDD" }, { v: "cde", l: "CDE" },
          { v: "fuso", l: "Fuso" }, { v: "tronton", l: "Tronton" },
          { v: "trailer", l: "Trailer" },
        ]} />
      </Field>
      <Field label={t("serviceCart.tanggalPickup", "Tanggal Pickup")}>
        <TextInput type="date" value={String(data.pickup_date ?? "")} onChange={(v) => onChange("pickup_date", v)} />
      </Field>
      <Field label={t("serviceCart.beratKg", "Berat (kg)")}>
        <TextInput type="number" value={String(data.gross_weight_kg ?? "")} onChange={(v) => onChange("gross_weight_kg", v)} placeholder="0" />
      </Field>
      <Field label="Volume (CBM)">
        <TextInput type="number" value={String(data.volume_cbm ?? "")} onChange={(v) => onChange("volume_cbm", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.fotoKargoUrl", "Foto Kargo (URL)")}>
        <div className="flex gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
          <TextInput value={String(data.photo_url ?? "")} onChange={(v) => onChange("photo_url", v)} placeholder="https://..." />
        </div>
      </Field>
    </div>
  );
}

function WarehousingForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.lokasiGudang", "Lokasi Gudang Preferensi")}>
        <TextInput value={String(data.warehouse_location ?? "")} onChange={(v) => onChange("warehouse_location", v)} placeholder="e.g. Cikarang, Cikupa, Surabaya" />
      </Field>
      <Field label={t("serviceCart.estimasiDurasi", "Estimasi Durasi")}>
        <SelectInput value={String(data.storage_duration ?? "")} onChange={(v) => onChange("storage_duration", v)} options={[
          { v: "1_bulan", l: "1 Bulan" }, { v: "3_bulan", l: "3 Bulan" },
          { v: "6_bulan", l: "6 Bulan" }, { v: "1_tahun", l: "1 Tahun" },
          { v: "ongoing", l: "Ongoing / TBD" },
        ]} />
      </Field>
      <Field label={t("serviceCart.skuKodeProduk", "SKU / Kode Produk")}>
        <TextInput value={String(data.sku ?? "")} onChange={(v) => onChange("sku", v)} placeholder="e.g. SKU-001, SKU-002" />
      </Field>
      <Field label={t("serviceCart.jumlahUnit", "Jumlah Unit")}>
        <TextInput type="number" value={String(data.quantity ?? "")} onChange={(v) => onChange("quantity", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.tipePenyimpanan", "Tipe Penyimpanan")}>
        <SelectInput value={String(data.storage_type ?? "")} onChange={(v) => onChange("storage_type", v)} options={[
          { v: "dry", l: "Dry Warehouse" },
          { v: "cold", l: "Cold Storage" },
          { v: "bonded", l: "Bonded Warehouse" },
        ]} />
      </Field>
      <Field label={t("serviceCart.tanggalInbound", "Tanggal Inbound")}>
        <TextInput type="date" value={String(data.inbound_date ?? "")} onChange={(v) => onChange("inbound_date", v)} />
      </Field>
      <div className="col-span-2 space-y-1">
        <Label className="text-xs font-medium text-slate-600">{t("serviceCart.persyaratanPenyimpanan", "Persyaratan Penyimpanan Khusus")}</Label>
        <Textarea value={String(data.storage_requirement ?? "")} onChange={(e) => onChange("storage_requirement", e.target.value)} rows={2} className="text-sm resize-none" placeholder={t("serviceCart.persyaratanPenyimpananPh", "e.g. suhu tertentu, rak khusus, forklift...")} />
      </div>
    </div>
  );
}

function InsuranceForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.nilaiKargo", "Nilai Kargo")} required>
        <TextInput type="number" value={String(data.cargo_value ?? "")} onChange={(v) => onChange("cargo_value", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.mataUang", "Mata Uang")} required>
        <SelectInput value={String(data.currency ?? "IDR")} onChange={(v) => onChange("currency", v)} options={[
          { v: "IDR", l: "IDR — Rupiah" }, { v: "USD", l: "USD — Dollar" },
          { v: "EUR", l: "EUR — Euro" }, { v: "SGD", l: "SGD — Singapore Dollar" },
        ]} />
      </Field>
      <Field label={t("serviceCart.tipeCoverage", "Tipe Coverage")} required>
        <SelectInput value={String(data.coverage_type ?? "")} onChange={(v) => onChange("coverage_type", v)} options={[
          { v: "all_risk", l: "All Risk" },
          { v: "total_loss", l: "Total Loss Only (TLO)" },
          { v: "war_srcc", l: "War & SRCC" },
        ]} />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")}>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder="e.g. Elektronik" />
      </Field>
      <Field label={t("serviceCart.nilaiInvoice", "Nilai Invoice")}>
        <TextInput type="number" value={String(data.invoice_value ?? "")} onChange={(v) => onChange("invoice_value", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.modaTransportasi", "Moda Transportasi")}>
        <SelectInput value={String(data.transport_mode ?? "")} onChange={(v) => onChange("transport_mode", v)} options={[
          { v: "air", l: "Air Freight" }, { v: "sea", l: "Ocean Freight" },
          { v: "truck", l: "Trucking / Darat" }, { v: "multi", l: "Multimodal" },
        ]} />
      </Field>
    </div>
  );
}

function HandlingForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.jenisHandling", "Jenis Handling")} required>
        <SelectInput value={String(data.handling_type ?? "")} onChange={(v) => onChange("handling_type", v)} options={[
          { v: "loading", l: "Loading (Muat)" }, { v: "unloading", l: "Unloading (Bongkar)" },
          { v: "stuffing", l: "Stuffing Container" }, { v: "stripping", l: "Stripping Container" },
          { v: "sorting", l: "Sorting & Labeling" }, { v: "repacking", l: "Repacking" },
        ]} />
      </Field>
      <Field label={t("serviceCart.lokasi", "Lokasi")} required>
        <TextInput value={String(data.location ?? "")} onChange={(v) => onChange("location", v)} placeholder="e.g. Tanjung Priok" />
      </Field>
      <Field label={t("serviceCart.jumlahKoliUnit", "Jumlah Koli / Unit")}>
        <TextInput type="number" value={String(data.quantity ?? "")} onChange={(v) => onChange("quantity", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.totalBeratKg", "Total Berat (kg)")}>
        <TextInput type="number" value={String(data.gross_weight_kg ?? "")} onChange={(v) => onChange("gross_weight_kg", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")}>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder={t("serviceCart.jenisBarang", "Jenis barang")} />
      </Field>
    </div>
  );
}

function SurveyForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.jenisSurvey", "Jenis Survey")} required>
        <SelectInput value={String(data.survey_type ?? "")} onChange={(v) => onChange("survey_type", v)} options={[
          { v: "pre_shipment", l: "Pre-Shipment Inspection" },
          { v: "condition_report", l: "Condition Report" },
          { v: "damage_survey", l: "Damage Survey" },
          { v: "weight_tally", l: "Weight & Tally" },
          { v: "loading_supervision", l: "Loading Supervision" },
        ]} />
      </Field>
      <Field label={t("serviceCart.lokasiSurvey", "Lokasi Survey")} required>
        <TextInput value={String(data.location ?? "")} onChange={(v) => onChange("location", v)} placeholder="e.g. Gudang Jakarta" />
      </Field>
      <Field label={t("serviceCart.tanggalSurvey", "Tanggal Survey")}>
        <TextInput type="date" value={String(data.survey_date ?? "")} onChange={(v) => onChange("survey_date", v)} />
      </Field>
      <Field label={t("serviceCart.commodity", "Komoditi")}>
        <TextInput value={String(data.commodity ?? "")} onChange={(v) => onChange("commodity", v)} placeholder={t("serviceCart.jenisBarang", "Jenis barang")} />
      </Field>
      <Field label={t("serviceCart.jumlahBarang", "Jumlah Barang")}>
        <TextInput type="number" value={String(data.quantity ?? "")} onChange={(v) => onChange("quantity", v)} placeholder="0" />
      </Field>
    </div>
  );
}

function ProjectCargoForm({ data, onChange }: { data: Record<string, string | number | boolean>; onChange: (k: string, v: string | number | boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("serviceCart.lokasiAsal", "Lokasi Asal")} required>
        <TextInput value={String(data.origin ?? "")} onChange={(v) => onChange("origin", v)} placeholder="e.g. Jakarta Port" />
      </Field>
      <Field label={t("serviceCart.lokasiTujuan", "Lokasi Tujuan")} required>
        <TextInput value={String(data.destination ?? "")} onChange={(v) => onChange("destination", v)} placeholder="e.g. Balikpapan" />
      </Field>
      <Field label={t("serviceCart.deskripsiKargo", "Deskripsi Kargo")} required>
        <TextInput value={String(data.cargo_description ?? "")} onChange={(v) => onChange("cargo_description", v)} placeholder="e.g. Transformator 500kV" />
      </Field>
      <Field label={t("serviceCart.totalBeratTon", "Total Berat (ton)")}>
        <TextInput type="number" value={String(data.total_weight_tons ?? "")} onChange={(v) => onChange("total_weight_tons", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.panjangM", "Panjang (m)")}>
        <TextInput type="number" value={String(data.length_m ?? "")} onChange={(v) => onChange("length_m", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.lebarM", "Lebar (m)")}>
        <TextInput type="number" value={String(data.width_m ?? "")} onChange={(v) => onChange("width_m", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.tinggiM", "Tinggi (m)")}>
        <TextInput type="number" value={String(data.height_m ?? "")} onChange={(v) => onChange("height_m", v)} placeholder="0" />
      </Field>
      <Field label={t("serviceCart.kebutuhanKhusus", "Kebutuhan Khusus")}>
        <SelectInput value={String(data.special_requirement ?? "")} onChange={(v) => onChange("special_requirement", v)} options={[
          { v: "heavy_lift", l: "Heavy Lift Crane" },
          { v: "special_trailer", l: "Special Trailer" },
          { v: "escort", l: "Police Escort" },
          { v: "roll_on_off", l: "RoRo" },
          { v: "none", l: t("serviceCart.tidakAda", "Tidak Ada") },
        ]} />
      </Field>
    </div>
  );
}

function ServiceForm({
  type, data, onChange,
}: {
  type: ServiceType;
  data: Record<string, string | number | boolean>;
  onChange: (k: string, v: string | number | boolean) => void;
}) {
  if (type === "air_freight") return <AirFreightForm data={data} onChange={onChange} />;
  if (type === "ocean_freight") return <OceanFreightForm data={data} onChange={onChange} />;
  if (type === "forwarding") return <ForwardingForm data={data} onChange={onChange} />;
  if (type === "ppjk") return <PpjkForm data={data} onChange={onChange} />;
  if (type === "trucking") return <TruckingForm data={data} onChange={onChange} />;
  if (type === "warehousing") return <WarehousingForm data={data} onChange={onChange} />;
  if (type === "handling") return <HandlingForm data={data} onChange={onChange} />;
  if (type === "insurance") return <InsuranceForm data={data} onChange={onChange} />;
  if (type === "survey") return <SurveyForm data={data} onChange={onChange} />;
  if (type === "project_cargo") return <ProjectCargoForm data={data} onChange={onChange} />;
  return null;
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const { t } = useLanguage();
  const STEPS: { id: Step; label: string }[] = [
    { id: "trade_type", label: t("serviceCart.stepDataDiri", "Data Diri") },
    { id: "company_profile", label: t("serviceCart.stepProfilPerusahaan", "Profil Perusahaan") },
    { id: "mode_select", label: t("serviceCart.stepModePemesanan", "Mode Pemesanan") },
    { id: "add_items", label: t("serviceCart.stepDetailLayanan", "Detail Layanan") },
    { id: "review", label: t("serviceCart.stepReviewKirim", "Review & Kirim") },
  ];
  const activeIdx = STEPS.findIndex((s) => s.id === current || (current === "package_select" && s.id === "add_items"));
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            idx < activeIdx ? "bg-green-100 text-green-700" :
            idx === activeIdx ? "bg-blue-600 text-white" :
            "bg-slate-100 text-slate-500"
          }`}>
            {idx < activeIdx ? <CheckCircle2 className="w-3 h-3" /> : <span>{idx + 1}</span>}
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {idx < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ServiceCartPage() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/service-cart/:requestId");
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("trade_type");
  const [tradeType, setTradeType] = useState<TradeType | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode>("ITEM_MANDIRI");
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "", customerEmail: "", customerPhone: "", customerCompany: "", notes: "",
  });
  const [requestId, setRequestId] = useState<number | null>(null);
  const [requestNumber, setRequestNumber] = useState<string | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [applyingPackage, setApplyingPackage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: "", npwp: "", nib: "", companyAddress: "",
    picName: "", picWhatsapp: "", picEmail: "",
    legalDocUrl: "", ktpPicUrl: "", suratKuasaUrl: "", apiNikIzinUrl: "", additionalNotes: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  // Item editor state
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [pendingType, setPendingType] = useState<ServiceType | null>(null);
  const [itemFormData, setItemFormData] = useState<Record<string, string | number | boolean>>({});
  const [itemTitle, setItemTitle] = useState("");
  const [savingItem, setSavingItem] = useState(false);

  // Load existing request
  useEffect(() => {
    if (!params?.requestId) return;
    fetch(`/api/customer-service-requests/${params.requestId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.id) return;
        setRequestId(data.id);
        setRequestNumber(data.requestNumber);
        setTradeType(data.tradeType as TradeType);
        setOrderMode((data.orderMode as OrderMode) ?? "ITEM_MANDIRI");
        setCustomerInfo({
          customerName: data.customerName ?? "",
          customerEmail: data.customerEmail ?? "",
          customerPhone: data.customerPhone ?? "",
          customerCompany: data.customerCompany ?? "",
          notes: data.notes ?? "",
        });
        setItems((data.items ?? []).map((i: ServiceItem & { id: number }) => ({
          ...i, tempId: `loaded-${i.id}`,
        })));
        setStep("add_items");
      }).catch(() => {});
  }, [params?.requestId]);

  // Fetch profile when entering company_profile step
  useEffect(() => {
    if (step !== "company_profile" || profileFetched || !customerInfo.customerEmail) return;
    setProfileLoading(true);
    fetch(`/api/portal/customer-profile/by-email?email=${encodeURIComponent(customerInfo.customerEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.companyName || data.picName || data.npwp)) {
          setCompanyProfile({
            companyName: data.companyName ?? "",
            npwp: data.npwp ?? "",
            nib: data.nib ?? "",
            companyAddress: data.companyAddress ?? "",
            picName: data.picName ?? "",
            picWhatsapp: data.picWhatsapp ?? "",
            picEmail: data.picEmail ?? customerInfo.customerEmail,
            legalDocUrl: data.legalDocUrl ?? "",
            ktpPicUrl: data.ktpPicUrl ?? "",
            suratKuasaUrl: data.suratKuasaUrl ?? "",
            apiNikIzinUrl: data.apiNikIzinUrl ?? "",
            additionalNotes: data.additionalNotes ?? "",
            profileStatus: data.profileStatus,
            filledFields: data.filledFields,
            totalRequired: data.totalRequired,
            isVerified: data.isVerified,
          });
        } else {
          setCompanyProfile((p) => ({ ...p, picEmail: customerInfo.customerEmail }));
        }
        setProfileFetched(true);
      })
      .catch(() => setProfileFetched(true))
      .finally(() => setProfileLoading(false));
  }, [step, customerInfo.customerEmail]);

  // Load packages when trade type changes
  useEffect(() => {
    if (!tradeType) return;
    setLoadingPackages(true);
    fetch(`/api/service-packages?tradeType=${tradeType}`)
      .then((r) => r.json())
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setPackages([]))
      .finally(() => setLoadingPackages(false));
  }, [tradeType]);

  // Create draft request
  const createDraft = useCallback(async (): Promise<number | null> => {
    if (requestId) return requestId;
    if (!customerInfo.customerName || !customerInfo.customerEmail || !tradeType) return null;
    try {
      const res = await fetch("/api/customer-service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customerName: customerInfo.customerName,
          customerEmail: customerInfo.customerEmail,
          customerPhone: customerInfo.customerPhone || undefined,
          customerCompany: customerInfo.customerCompany || undefined,
          tradeType,
          orderMode,
          pricingMode: "PER_ITEM",
          notes: customerInfo.notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setRequestId(data.id);
        setRequestNumber(data.requestNumber);
        return data.id;
      }
    } catch { /* ignore */ }
    return null;
  }, [requestId, customerInfo, tradeType, orderMode]);

  // Apply package
  const applyPackage = async (pkg: ServicePackage) => {
    if (!customerInfo.customerName || !customerInfo.customerEmail) {
      toast({ title: t("serviceCart.toastFillDataFirst", "Isi data diri terlebih dahulu"), variant: "destructive" });
      return;
    }
    setApplyingPackage(true);
    try {
      const reqId = await createDraft();
      if (!reqId) { toast({ title: t("serviceCart.toastCreateRequestFailed", "Gagal membuat request"), variant: "destructive" }); return; }
      const res = await fetch(`/api/service-packages/${pkg.id}/apply/${reqId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPackage(pkg);
        setOrderMode("PAKET_BORONGAN");
        setItems((data.items ?? []).map((i: ServiceItem & { id: number }) => ({
          ...i, tempId: `pkg-${i.id}`,
        })));
        setStep("add_items");
        toast({ title: `${t("serviceCart.toastPaket", "Paket")} "${pkg.packageName}" ${t("serviceCart.toastPaketApplied", "diterapkan")} — ${data.items.length} ${t("serviceCart.toastItemAdded", "item ditambahkan")}` });
      } else {
        toast({ title: data.error ?? t("serviceCart.toastApplyFailed", "Gagal menerapkan paket"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("serviceCart.toastError", "Terjadi kesalahan"), variant: "destructive" });
    } finally {
      setApplyingPackage(false);
    }
  };

  // Save item to backend
  const saveItemToBackend = async (reqId: number, item: ServiceItem, isNew: boolean): Promise<ServiceItem | null> => {
    const meta = SERVICE_META[item.itemType];
    const payload = {
      itemType: item.itemType,
      title: item.title,
      description: item.description,
      formData: item.formData,
      requiredDocuments: meta?.requiredDocs ?? [],
    };
    const url = isNew
      ? `/api/customer-service-requests/${reqId}/items`
      : `/api/customer-service-requests/${reqId}/items/${item.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  };

  const openAddItem = () => {
    setEditingItem(null);
    setPendingType(null);
    setItemFormData({});
    setItemTitle("");
    setShowItemEditor(true);
  };

  const openEditItem = (item: ServiceItem) => {
    setEditingItem(item);
    setPendingType(item.itemType);
    setItemFormData({ ...item.formData });
    setItemTitle(item.title);
    setShowItemEditor(true);
  };

  const handleConfirmItem = async () => {
    if (!pendingType || !itemTitle.trim()) {
      toast({ title: t("serviceCart.toastPickServiceAndTitle", "Pilih jenis layanan dan isi judul"), variant: "destructive" });
      return;
    }
    if (!customerInfo.customerName || !customerInfo.customerEmail) {
      toast({ title: t("serviceCart.toastFillDataStep1", "Isi data diri di langkah pertama"), variant: "destructive" });
      setShowItemEditor(false);
      return;
    }
    setSavingItem(true);
    try {
      const reqId = await createDraft();
      if (!reqId) { toast({ title: t("serviceCart.toastCreateRequestFailed", "Gagal membuat request"), variant: "destructive" }); return; }
      const item: ServiceItem = {
        ...(editingItem ?? {}),
        tempId: editingItem?.tempId ?? crypto.randomUUID(),
        id: editingItem?.id,
        itemType: pendingType,
        title: itemTitle.trim(),
        formData: { ...itemFormData },
      };
      const saved = await saveItemToBackend(reqId, item, !editingItem?.id);
      if (saved) {
        const merged: ServiceItem = { ...item, id: (saved as ServiceItem).id, sequenceNo: (saved as ServiceItem).sequenceNo };
        setItems((prev) =>
          editingItem ? prev.map((it) => it.tempId === editingItem.tempId ? merged : it)
            : [...prev, merged]
        );
        setShowItemEditor(false);
        toast({ title: `"${merged.title}" ${editingItem ? t("serviceCart.toastItemUpdated", "diperbarui") : t("serviceCart.toastItemAdded2", "ditambahkan")}` });
      } else {
        toast({ title: t("serviceCart.toastSaveItemFailed", "Gagal menyimpan item"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("serviceCart.toastError", "Terjadi kesalahan"), variant: "destructive" });
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: ServiceItem) => {
    if (item.isRequired) {
      toast({ title: t("serviceCart.toastRequiredItemCannotDelete", "Item wajib tidak bisa dihapus dari paket"), variant: "destructive" });
      return;
    }
    if (item.id && requestId) {
      await fetch(`/api/customer-service-requests/${requestId}/items/${item.id}`, {
        method: "DELETE", credentials: "include",
      });
    }
    setItems((prev) => prev.filter((it) => it.tempId !== item.tempId));
    toast({ title: `"${item.title}" ${t("serviceCart.toastItemDeleted", "dihapus")}` });
  };

  const handleSubmit = async () => {
    if (!requestId || items.length === 0) {
      toast({ title: t("serviceCart.toastAddMinOne", "Tambahkan minimal 1 item layanan"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/customer-service-requests/${requestId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json();
        toast({ title: data.error ?? t("serviceCart.toastSubmitFailed", "Gagal submit"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("serviceCart.toastSubmitError", "Terjadi kesalahan saat submit"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Step: Trade Type + Customer Info ─────────────────────────────────────────
  if (step === "trade_type") return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => navigate("/jasa")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembali", "Kembali")}
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BoxSelect className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t("serviceCart.buatPermintaanLayanan", "Buat Permintaan Layanan")}</h1>
              <p className="text-sm text-slate-500">{t("serviceCart.logistikCstSubtitle", "Logistik CST — isi data awal untuk melanjutkan")}</p>
            </div>
          </div>
          <StepBar current="trade_type" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">{t("serviceCart.dataDiri", "Data Diri")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">{t("serviceCart.namaLengkap", "Nama Lengkap")} <span className="text-red-500">*</span></Label>
              <Input placeholder={t("serviceCart.namaAnda", "Nama Anda")} value={customerInfo.customerName} onChange={(e) => setCustomerInfo((p) => ({ ...p, customerName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="email@perusahaan.com" value={customerInfo.customerEmail} onChange={(e) => setCustomerInfo((p) => ({ ...p, customerEmail: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{t("serviceCart.nomorHpWa", "Nomor HP / WhatsApp")}</Label>
              <Input placeholder="08xxxxxxxxxx" value={customerInfo.customerPhone} onChange={(e) => setCustomerInfo((p) => ({ ...p, customerPhone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{t("serviceCart.namaPerusahaan", "Nama Perusahaan")}</Label>
              <Input placeholder="PT / CV ..." value={customerInfo.customerCompany} onChange={(e) => setCustomerInfo((p) => ({ ...p, customerCompany: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">{t("serviceCart.jenisPerdagangan", "Jenis Perdagangan")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: "EXPORT" as TradeType, icon: "📤", desc: t("serviceCart.exportDesc", "Barang keluar dari Indonesia") },
              { type: "IMPORT" as TradeType, icon: "📥", desc: t("serviceCart.importDesc", "Barang masuk ke Indonesia") },
              { type: "DOMESTIC" as TradeType, icon: "🇮🇩", desc: t("serviceCart.domesticDesc", "Pengiriman dalam negeri") },
            ].map(({ type, icon, desc }) => (
              <button key={type} onClick={() => setTradeType(type)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${tradeType === type ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 bg-white"}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className={`font-semibold text-sm ${tradeType === type ? "text-blue-700" : "text-slate-800"}`}>{type}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
          disabled={!tradeType || !customerInfo.customerName || !customerInfo.customerEmail}
          onClick={() => { setProfileFetched(false); setStep("company_profile"); }}>
          {t("serviceCart.lanjut", "Lanjut")} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // ── Step: Company Profile ─────────────────────────────────────────────────
  if (step === "company_profile") {
    const profileRequiredDone = companyProfile.companyName && companyProfile.npwp && companyProfile.nib
      && companyProfile.companyAddress && companyProfile.picName && companyProfile.picWhatsapp;

    const saveProfileAndContinue = async () => {
      setProfileSaving(true);
      try {
        await fetch("/api/portal/customer-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...companyProfile, email: customerInfo.customerEmail }),
        });
      } catch { /* ignore — profile save is best-effort */ }
      setProfileSaving(false);
      setStep("mode_select");
    };

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <button onClick={() => setStep("trade_type")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
              <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembali", "Kembali")}
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{t("serviceCart.profilPerusahaan", "Profil Perusahaan")}</h1>
                <p className="text-sm text-slate-500">{t("serviceCart.profilPerusahaanSubtitle", "Data legal & informasi PIC untuk memproses permintaan layanan")}</p>
              </div>
            </div>
            <StepBar current="company_profile" />
          </div>

          {profileLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              {t("serviceCart.memeriksaProfil", "Memeriksa profil perusahaan...")}
            </div>
          ) : companyProfile.isVerified ? (
            <div className="bg-white rounded-2xl border border-green-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">{t("serviceCart.profilTerverifikasi", "Profil Terverifikasi")}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-500">{t("serviceCart.perusahaan", "Perusahaan")}</div><div className="font-medium">{companyProfile.companyName}</div>
                <div className="text-slate-500">NPWP</div><div className="font-mono">{companyProfile.npwp}</div>
                <div className="text-slate-500">NIB</div><div className="font-mono">{companyProfile.nib}</div>
                <div className="text-slate-500">PIC</div><div>{companyProfile.picName}</div>
                <div className="text-slate-500">{t("serviceCart.waPic", "WA PIC")}</div><div>{companyProfile.picWhatsapp}</div>
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setStep("mode_select")}>
                {t("serviceCart.lanjut", "Lanjut")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-semibold text-slate-800">{t("serviceCart.dataLegalPerusahaan", "Data Legal Perusahaan")}</h2>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.namaPerusahaanPtCvUd", "Nama Perusahaan (PT/CV/UD)")} <span className="text-red-500">*</span></Label>
                    <Input placeholder="PT Contoh Jaya" value={companyProfile.companyName} onChange={(e) => setCompanyProfile((p) => ({ ...p, companyName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">NPWP <span className="text-red-500">*</span></Label>
                      <Input placeholder="00.000.000.0-000.000" value={companyProfile.npwp} onChange={(e) => setCompanyProfile((p) => ({ ...p, npwp: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">NIB <span className="text-red-500">*</span></Label>
                      <Input placeholder={t("serviceCart.nomorIndukBerusaha", "Nomor Induk Berusaha")} value={companyProfile.nib} onChange={(e) => setCompanyProfile((p) => ({ ...p, nib: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.alamatPerusahaan", "Alamat Perusahaan")} <span className="text-red-500">*</span></Label>
                    <Textarea placeholder={t("serviceCart.alamatPerusahaanPh", "Alamat lengkap perusahaan")} value={companyProfile.companyAddress} onChange={(e) => setCompanyProfile((p) => ({ ...p, companyAddress: e.target.value }))} rows={2} className="resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-semibold text-slate-800">{t("serviceCart.informasiPic", "Informasi PIC (Person In Charge)")}</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("serviceCart.namaPic", "Nama PIC")} <span className="text-red-500">*</span></Label>
                      <Input placeholder={t("serviceCart.namaPicPh", "Nama lengkap PIC")} value={companyProfile.picName} onChange={(e) => setCompanyProfile((p) => ({ ...p, picName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("serviceCart.whatsappPic", "WhatsApp PIC")} <span className="text-red-500">*</span></Label>
                      <Input placeholder="08xxxxxxxxxx" value={companyProfile.picWhatsapp} onChange={(e) => setCompanyProfile((p) => ({ ...p, picWhatsapp: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.emailPic", "Email PIC")}</Label>
                    <Input type="email" value={companyProfile.picEmail} onChange={(e) => setCompanyProfile((p) => ({ ...p, picEmail: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">{t("serviceCart.dokumenPendukung", "Dokumen Pendukung")}</h2>
                  <span className="text-xs text-slate-400">{t("serviceCart.opsionalNanti", "Opsional — dapat dilengkapi nanti")}</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.urlDokumenLegal", "URL Dokumen Legal (Akta, NIB, dll.)")}</Label>
                    <Input placeholder="https://..." value={companyProfile.legalDocUrl} onChange={(e) => setCompanyProfile((p) => ({ ...p, legalDocUrl: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("serviceCart.urlKtpPic", "URL KTP PIC")}</Label>
                      <Input placeholder="https://..." value={companyProfile.ktpPicUrl} onChange={(e) => setCompanyProfile((p) => ({ ...p, ktpPicUrl: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t("serviceCart.urlSuratKuasa", "URL Surat Kuasa")}</Label>
                      <Input placeholder="https://..." value={companyProfile.suratKuasaUrl} onChange={(e) => setCompanyProfile((p) => ({ ...p, suratKuasaUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.urlApiNikIzin", "URL API / NIK Izin Impor-Ekspor")}</Label>
                    <Input placeholder="https://..." value={companyProfile.apiNikIzinUrl} onChange={(e) => setCompanyProfile((p) => ({ ...p, apiNikIzinUrl: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("serviceCart.catatanTambahan", "Catatan Tambahan")}</Label>
                    <Textarea placeholder={t("serviceCart.catatanTambahanPh", "Informasi tambahan yang perlu diketahui tim CST...")} value={companyProfile.additionalNotes} onChange={(e) => setCompanyProfile((p) => ({ ...p, additionalNotes: e.target.value }))} rows={2} className="resize-none" />
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                disabled={!profileRequiredDone || profileSaving}
                onClick={saveProfileAndContinue}>
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("serviceCart.simpanLanjut", "Simpan & Lanjut")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Mode Select ──────────────────────────────────────────────────────
  if (step === "mode_select") return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep("trade_type")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembali", "Kembali")}
          </button>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{t("serviceCart.pilihModePemesanan", "Pilih Mode Pemesanan")}</h1>
          <p className="text-sm text-slate-500 mb-3">
            <Badge variant="outline" className="mr-2">{tradeType}</Badge>
            {customerInfo.customerName}
          </p>
          <StepBar current="mode_select" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { setOrderMode("ITEM_MANDIRI"); setStep("add_items"); }}
            className="rounded-2xl border-2 border-slate-200 hover:border-blue-400 bg-white p-6 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <BoxSelect className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{t("serviceCart.itemMandiri", "Item Mandiri")}</h3>
            <p className="text-sm text-slate-500 mb-3">{t("serviceCart.itemMandiriDesc", "Pilih & tambahkan layanan satu per satu sesuai kebutuhan spesifik Anda")}</p>
            <div className="flex flex-wrap gap-1.5">
              {["Air Freight", "Ocean", "PPJK", "Trucking", t("serviceCart.plusLainnya", "+6 lainnya")].map((lbl) => (
                <Badge key={lbl} variant="outline" className="text-xs">{lbl}</Badge>
              ))}
            </div>
          </button>

          <button
            onClick={() => { setOrderMode("PAKET_BORONGAN"); setStep("package_select"); }}
            className="rounded-2xl border-2 border-slate-200 hover:border-blue-400 bg-white p-6 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{t("serviceCart.paketBorongan", "Paket Borongan")}</h3>
            <p className="text-sm text-slate-500 mb-3">{t("serviceCart.paketBoronganDesc", "Pilih paket lengkap yang sudah mencakup semua layanan dalam satu bundel")}</p>
            <div className="flex flex-wrap gap-1.5">
              {["Door to Door", "Sea Import", "Customs Only", t("serviceCart.plusPaket", "+2 paket")].map((lbl) => (
                <Badge key={lbl} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">{lbl}</Badge>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step: Package Select ───────────────────────────────────────────────────
  if (step === "package_select") return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep("mode_select")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembali", "Kembali")}
          </button>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{t("serviceCart.pilihPaketBorongan", "Pilih Paket Borongan")}</h1>
          <p className="text-sm text-slate-500 mb-3">{t("serviceCart.paketUntuk", "Paket untuk")} <Badge variant="outline">{tradeType}</Badge></p>
          <StepBar current="package_select" />
        </div>

        {loadingPackages ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>{t("serviceCart.tidakAdaPaket", "Tidak ada paket tersedia untuk")} {tradeType}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setOrderMode("ITEM_MANDIRI"); setStep("add_items"); }}>
              {t("serviceCart.gunakanItemMandiri", "Gunakan Item Mandiri")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{pkg.iconEmoji ?? "📦"}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{pkg.packageName}</h3>
                        <Badge variant="outline" className="text-xs">{pkg.tradeType}</Badge>
                        <Badge className="text-xs bg-slate-100 text-slate-600">{pkg.pricingMode.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                    disabled={applyingPackage}
                    onClick={() => applyPackage(pkg)}
                  >
                    {applyingPackage ? <Loader2 className="w-4 h-4 animate-spin" /> : t("serviceCart.pilihPaket", "Pilih Paket")}
                  </Button>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">{t("serviceCart.itemDalamPaket", "Item dalam paket:")}</p>
                  <div className="flex flex-wrap gap-2">
                    {(pkg.items ?? []).map((item, idx) => {
                      const meta = SERVICE_META[item.itemType as ServiceType];
                      const Icon = meta?.icon ?? Package;
                      return (
                        <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${meta?.bgColor ?? "bg-slate-50 border-slate-200"}`}>
                          <Icon className={`w-3.5 h-3.5 ${meta?.color ?? "text-slate-500"}`} />
                          <span className="font-medium text-slate-700">{item.itemTitle}</span>
                          {item.isRequired ? <Lock className="w-3 h-3 text-slate-400" /> : <Unlock className="w-3 h-3 text-slate-300" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setOrderMode("ITEM_MANDIRI"); setStep("add_items"); }}
          className="w-full text-sm text-slate-500 hover:text-blue-600 py-2"
        >
          {t("serviceCart.atauGunakanItemMandiri", "Atau gunakan Item Mandiri →")}
        </button>
      </div>
    </div>
  );

  // ── Step: Add Items ────────────────────────────────────────────────────────
  if (step === "add_items") {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <button onClick={() => setStep(orderMode === "PAKET_BORONGAN" ? "package_select" : "mode_select")}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
              <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembali", "Kembali")}
            </button>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{t("serviceCart.detailLayanan", "Detail Layanan")}</h1>
                <p className="text-sm text-slate-500">
                  <Badge variant="outline" className="mr-1">{tradeType}</Badge>
                  {orderMode === "PAKET_BORONGAN" && selectedPackage
                    ? <Badge className="bg-purple-100 text-purple-700 mr-1">{selectedPackage.packageName}</Badge>
                    : <Badge className="bg-slate-100 text-slate-600 mr-1">{t("serviceCart.itemMandiri", "Item Mandiri")}</Badge>}
                  {requestNumber ?? t("serviceCart.draft", "Draft")}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 flex-shrink-0 mt-1">{items.length} item</Badge>
            </div>
            <StepBar current="add_items" />
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <Plus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-700 mb-1">{t("serviceCart.belumAdaItemLayanan", "Belum ada item layanan")}</p>
              <p className="text-sm text-slate-500 mb-5">{t("serviceCart.klikTombolTambahLayanan", "Klik tombol di bawah untuk menambahkan layanan")}</p>
              <Button onClick={openAddItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> {t("serviceCart.tambahLayanan", "Tambah Layanan")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const meta = SERVICE_META[item.itemType];
                const Icon = meta?.icon ?? Package;
                return (
                  <div key={item.tempId} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.bgColor ?? "bg-slate-100 border border-slate-200"}`}>
                      <Icon className={`w-5 h-5 ${meta?.color ?? "text-slate-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                        <Badge variant="outline" className="text-xs">{meta?.title ?? item.itemType}</Badge>
                        {item.isRequired && <Lock className="w-3 h-3 text-amber-500" aria-label={t("serviceCart.itemWajibDariPaket", "Item wajib dari paket")} />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(item.formData).slice(0, 4).map(([k, v]) => v ? (
                          <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{String(v)}</span>
                        ) : null)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEditItem(item)}
                        className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!item.isRequired && (
                        <button onClick={() => handleDeleteItem(item)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button onClick={openAddItem}
                className="w-full rounded-xl border-2 border-dashed border-blue-200 p-3 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 text-sm font-medium">
                <Plus className="w-4 h-4" /> {t("serviceCart.tambahItemLagi", "Tambah Item Lagi")}
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={openAddItem}>
                <Plus className="w-4 h-4 mr-2" /> {t("serviceCart.tambahItem", "Tambah Item")}
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setStep("review")}>
                {t("serviceCart.reviewKirim", "Review & Kirim")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Item Editor Dialog */}
        <Dialog open={showItemEditor} onOpenChange={(o) => { if (!o) setShowItemEditor(false); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? t("serviceCart.editItemLayanan", "Edit Item Layanan") : t("serviceCart.tambahItemLayanan", "Tambah Item Layanan")}</DialogTitle>
            </DialogHeader>

            {!pendingType ? (
              <div className="grid grid-cols-3 gap-2 py-2">
                {(Object.keys(SERVICE_META) as ServiceType[]).map((type) => {
                  const { title, desc, icon: Icon, bgColor, color } = SERVICE_META[type];
                  return (
                    <button key={type} onClick={() => { setPendingType(type); setItemTitle(title); setItemFormData({}); }}
                      className={`rounded-xl border p-3 text-left hover:border-blue-400 transition-all ${bgColor}`}>
                      <Icon className={`w-5 h-5 mb-1.5 ${color}`} />
                      <div className="font-semibold text-xs text-slate-800">{title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-tight">{desc}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  {(() => {
                    const meta = SERVICE_META[pendingType];
                    const Icon = meta.icon;
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bgColor}`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <span className="font-semibold text-slate-800">{meta.title}</span>
                      </div>
                    );
                  })()}
                  <button onClick={() => { setPendingType(null); setItemFormData({}); }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> {t("serviceCart.gantiLayanan", "Ganti layanan")}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{t("serviceCart.judulItem", "Judul Item")} <span className="text-red-500">*</span></Label>
                  <Input placeholder={`e.g. ${SERVICE_META[pendingType].title} Jakarta → Singapura`}
                    value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
                </div>

                <Separator />

                <ServiceForm
                  type={pendingType}
                  data={itemFormData}
                  onChange={(k, v) => setItemFormData((p) => ({ ...p, [k]: v }))}
                />

                {SERVICE_META[pendingType].requiredDocs.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-medium text-amber-700 mb-1.5">{t("serviceCart.dokumenPerluDisiapkan", "Dokumen yang perlu disiapkan:")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICE_META[pendingType].requiredDocs.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                          <FileText className="w-3 h-3 mr-1" />{d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowItemEditor(false)}>{t("serviceCart.batal", "Batal")}</Button>
              {pendingType && (
                <Button onClick={handleConfirmItem} disabled={savingItem || !itemTitle.trim()} className="bg-blue-600 hover:bg-blue-700">
                  {savingItem && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingItem ? t("serviceCart.simpanPerubahan", "Simpan Perubahan") : t("serviceCart.tambahItem", "Tambah Item")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Step: Review ───────────────────────────────────────────────────────────
  if (step === "review") return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep("add_items")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("serviceCart.kembaliKeItem", "Kembali ke Item")}
          </button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-slate-900">{t("serviceCart.reviewPermintaan", "Review Permintaan")}</h1>
            <Badge className="bg-amber-100 text-amber-700">{t("serviceCart.draft", "Draft")}</Badge>
          </div>
          <StepBar current="review" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800 text-sm">{t("serviceCart.informasiPemohon", "Informasi Pemohon")}</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-slate-500">{t("serviceCart.nama", "Nama")}</span>
            <span className="font-medium">{customerInfo.customerName}</span>
            <span className="text-slate-500">Email</span>
            <span className="font-medium">{customerInfo.customerEmail}</span>
            {customerInfo.customerPhone && <><span className="text-slate-500">{t("serviceCart.hp", "HP")}</span><span className="font-medium">{customerInfo.customerPhone}</span></>}
            {customerInfo.customerCompany && <><span className="text-slate-500">{t("serviceCart.perusahaan", "Perusahaan")}</span><span className="font-medium">{customerInfo.customerCompany}</span></>}
            <span className="text-slate-500">{t("serviceCart.perdagangan", "Perdagangan")}</span>
            <Badge variant="outline">{tradeType}</Badge>
            <span className="text-slate-500">{t("serviceCart.mode", "Mode")}</span>
            <span className="font-medium">{orderMode === "PAKET_BORONGAN" ? `${t("serviceCart.paket", "Paket")} — ${selectedPackage?.packageName ?? ""}` : t("serviceCart.itemMandiri", "Item Mandiri")}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">{t("serviceCart.itemLayanan", "Item Layanan")}</h2>
            <Badge className="bg-blue-100 text-blue-700">{items.length} item</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const meta = SERVICE_META[item.itemType];
              const Icon = meta?.icon ?? Package;
              return (
                <div key={item.tempId} className="px-5 py-4 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.bgColor ?? "bg-slate-50 border"}`}>
                    <Icon className={`w-4 h-4 ${meta?.color ?? "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-xs">{meta?.title ?? item.itemType}</Badge>
                      {Object.entries(item.formData).slice(0, 3).map(([k, v]) => v ? (
                        <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{String(v)}</span>
                      ) : null)}
                    </div>
                  </div>
                  <button onClick={() => { setStep("add_items"); openEditItem(item); }}
                    className="text-xs text-blue-600 hover:underline flex-shrink-0">{t("serviceCart.edit", "Edit")}</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">{t("serviceCart.catatanTambahanOpsional", "Catatan Tambahan (opsional)")}</Label>
          <Textarea placeholder={t("serviceCart.catatanTambahanReviewPh", "Instruksi khusus, preferensi vendor, timeline, dll...")}
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo((p) => ({ ...p, notes: e.target.value }))}
            rows={3} />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-0.5">{t("serviceCart.setelahDikirim", "Setelah dikirim:")}</p>
            <p>{t("serviceCart.setelahDikirimDesc", "Tim B2B Marketplace and Logistic menghubungi Anda dalam 1×24 jam dengan penawaran harga untuk setiap item layanan.")}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setStep("add_items")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("serviceCart.editItem", "Edit Item")}
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {t("serviceCart.kirimPermintaan", "Kirim Permintaan")}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Step: Success ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("serviceCart.permintaanTerkirim", "Permintaan Terkirim!")}</h1>
          <p className="text-slate-600">{t("serviceCart.nomorReferensiAnda", "Nomor referensi Anda:")}</p>
          <div className="mt-3 bg-white border border-slate-200 rounded-xl px-6 py-3 inline-block">
            <span className="font-mono font-bold text-blue-700 text-lg">{requestNumber}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-3">
          <h2 className="font-semibold text-slate-800">{t("serviceCart.ringkasan", "Ringkasan")}</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-slate-500">{t("serviceCart.nama", "Nama")}</span>
            <span className="font-medium">{customerInfo.customerName}</span>
            <span className="text-slate-500">{t("serviceCart.totalItem", "Total Item")}</span>
            <span className="font-medium">{items.length} {t("serviceCart.layanan", "layanan")}</span>
            <span className="text-slate-500">{t("serviceCart.jenis", "Jenis")}</span>
            <Badge variant="outline">{tradeType}</Badge>
            <span className="text-slate-500">{t("serviceCart.mode", "Mode")}</span>
            <span className="font-medium text-xs">{orderMode === "PAKET_BORONGAN" ? selectedPackage?.packageName : t("serviceCart.itemMandiri", "Item Mandiri")}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          {t("serviceCart.konfirmasiDikirimKe", "Konfirmasi dikirim ke")} <strong>{customerInfo.customerEmail}</strong>. {t("serviceCart.timMenghubungi", "Tim kami menghubungi dalam 1×24 jam.")}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
            {t("serviceCart.dashboardSaya", "Dashboard Saya")}
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/jasa")}>
            {t("serviceCart.tambahRequestLain", "Tambah Request Lain")}
          </Button>
        </div>
      </div>
    </div>
  );
}
