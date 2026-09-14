import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/lib/logistic-cart";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveImageUrl } from "@/lib/utils";
import {
  ArrowLeft, Building2, Truck, Plane, Ship, Package,
  FileText, MapPin, Clock, Tag, CheckCircle2, ShoppingCart,
  Calculator, ChevronRight, Info,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CatalogDetail {
  id: number;
  vendorId: number;
  vendorName: string | null;
  templateKind: string | null;
  categoryKey: string | null;
  serviceType: string | null;
  name: string;
  description: string | null;
  kategori: string | null;
  subcategory: string | null;
  specValues: unknown;
  templateSnapshot: unknown;
  priceSell: number | null;
  currency: string;
  unit: string | null;
  moq: number | null;
  stockStatus: string | null;
  leadTime: string | null;
  location: string | null;
  origin: string | null;
  documents: unknown;
  publishedAt: string | null;
  resolvedCategory?: string | null;
  resolvedCategoryLabel?: string | null;
  media?: Array<{
    id: number;
    mediaType: string;
    fileUrl: string | null;
    externalUrl: string | null;
    thumbnailUrl: string | null;
    isPrimary: boolean;
    title: string | null;
  }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(v: number, currency = "IDR") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
  }
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

// Mirrors normalizeServiceCategory from catalogFilters.ts
const SERVICE_CATEGORY_ALIASES_DETAIL: Record<string, string> = {
  trucking: "trucking", truck: "trucking", "land freight": "trucking", land_freight: "trucking",
  darat: "trucking", pengiriman_darat: "trucking", "pengiriman darat": "trucking",
  "sea freight": "sea_freight", sea_freight: "sea_freight", sea: "sea_freight",
  ocean: "sea_freight", ocean_freight: "sea_freight", "ocean freight": "sea_freight",
  fcl: "sea_freight", lcl: "sea_freight", laut: "sea_freight",
  pengiriman_laut: "sea_freight", "pengiriman laut": "sea_freight",
  "air freight": "air_freight", air_freight: "air_freight", air: "air_freight",
  udara: "air_freight", cargo_udara: "air_freight", "cargo udara": "air_freight",
  pengiriman_udara: "air_freight", "pengiriman udara": "air_freight",
  ppjk: "ppjk", customs: "ppjk", custom: "ppjk", pabean: "ppjk",
  kepabeanan: "ppjk", pib: "ppjk", peb: "ppjk",
  handling: "handling", warehouse: "handling", warehousing: "handling",
  gudang: "handling", stuffing: "handling", stripping: "handling",
  loading: "handling", unloading: "handling",
  document: "document", documents: "document", dokumen: "document",
  legal_doc: "document", "legal doc": "document", perizinan: "document",
};

function normalizeDetailCategory(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, "_");
  const withSpaces = normalized.replace(/_/g, " ");
  return SERVICE_CATEGORY_ALIASES_DETAIL[withSpaces] ?? SERVICE_CATEGORY_ALIASES_DETAIL[normalized] ?? normalized;
}

function resolveServiceType(item: CatalogDetail): string {
  const snap = item.templateSnapshot && typeof item.templateSnapshot === "object"
    ? item.templateSnapshot as Record<string, unknown>
    : {};
  // Priority: resolvedCategory → serviceType → templateSnapshot.serviceType → templateSnapshot.category → kategori → categoryKey
  const candidates = [
    item.resolvedCategory,
    item.serviceType,
    typeof snap["serviceType"] === "string" ? snap["serviceType"] : null,
    typeof snap["category"] === "string" ? snap["category"] : null,
    item.kategori,
    item.categoryKey,
  ];
  for (const c of candidates) {
    const key = normalizeDetailCategory(c);
    if (key && key !== c?.toLowerCase().trim()) return key; // matched an alias
    if (key && SERVICE_CATEGORY_ALIASES_DETAIL[key]) return SERVICE_CATEGORY_ALIASES_DETAIL[key];
    if (key) return key;
  }
  return "general";
}

const CATEGORY_LABELS: Record<string, string> = {
  trucking: "Trucking",
  sea_freight: "Sea Freight",
  air_freight: "Air Freight",
  ppjk: "PPJK / Customs",
  handling: "Handling",
  document: "Document",
  general: "Layanan",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  trucking:   <Truck className="h-5 w-5 text-white" />,
  sea_freight:<Ship className="h-5 w-5 text-white" />,
  air_freight:<Plane className="h-5 w-5 text-white" />,
  ppjk:       <FileText className="h-5 w-5 text-white" />,
  handling:   <Package className="h-5 w-5 text-white" />,
  document:   <FileText className="h-5 w-5 text-white" />,
  general:    <Truck className="h-5 w-5 text-white" />,
};

// ── SpecGrid ───────────────────────────────────────────────────────────────────

function SpecGrid({ specValues, templateSnapshot }: { specValues: unknown; templateSnapshot: unknown }) {
  const { t } = useLanguage();
  const specs = specValues && typeof specValues === "object" ? specValues as Record<string, unknown> : {};
  const snapshot = templateSnapshot && typeof templateSnapshot === "object" ? templateSnapshot as Record<string, unknown> : {};

  const fields: Array<{ key: string; label: string; type?: string; section?: string }> = [];
  if (Array.isArray(snapshot["customFields"])) {
    fields.push(...(snapshot["customFields"] as typeof fields));
  } else if (Array.isArray(snapshot["fields"])) {
    (snapshot["fields"] as typeof fields)
      .filter((f) => f.section === "quotation" || f.section === "both" || !f.section)
      .forEach((f) => fields.push(f));
  }

  const filled = fields.filter(
    (f) => f.type !== "textarea" && specs[f.key] !== undefined && specs[f.key] !== null && String(specs[f.key]).trim() !== "",
  );
  if (filled.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("jasaVendorDetail.specGrid.title", "Spesifikasi Layanan")}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filled.map((f) => (
          <div key={f.key} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold mb-0.5">{f.label}</div>
            <div className="text-[13px] font-bold text-slate-800">{String(specs[f.key])}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calculators ────────────────────────────────────────────────────────────────

interface CalcResult {
  inputs: Record<string, unknown>;
  chargeableQty: number;
  chargeableUnit: string;
  subtotal: number;
}

// Trucking
function TruckingCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const snap = item.templateSnapshot && typeof item.templateSnapshot === "object" ? item.templateSnapshot as Record<string, unknown> : {};
  const specs = item.specValues && typeof item.specValues === "object" ? item.specValues as Record<string, unknown> : {};
  const truckOptions: string[] = Array.isArray(snap["truckTypes"]) ? snap["truckTypes"] as string[] : [];

  // Pre-fill from spec values: area_pickup / area_delivery (or areaPickup / areaDelivery)
  const specPickup = (specs["area_pickup"] ?? specs["areaPickup"] ?? specs["pickup_city"] ?? "") as string;
  const specDest   = (specs["area_delivery"] ?? specs["areaDelivery"] ?? specs["delivery_city"] ?? "") as string;

  const [pickupCity, setPickupCity] = useState(specPickup);
  const [destCity, setDestCity] = useState(specDest);
  const [truckType, setTruckType] = useState("");
  const [tripQty, setTripQty] = useState(1);
  const [loadingFee, setLoadingFee] = useState<number | "">(0);
  const [unloadingFee, setUnloadingFee] = useState<number | "">(0);

  // Sync if item changes (e.g. navigation between catalog items).
  // Hold latest specs in a ref so the effect can read them without listing
  // the whole `specs` object as a dependency (it's a new object each render).
  const specsRef = useRef(specs);
  specsRef.current = specs;
  useEffect(() => {
    const s = specsRef.current;
    setPickupCity((s["area_pickup"] ?? s["areaPickup"] ?? s["pickup_city"] ?? "") as string);
    setDestCity((s["area_delivery"] ?? s["areaDelivery"] ?? s["delivery_city"] ?? "") as string);
  }, [item.id]);

  function recalc(p: { pickupCity?: string; destCity?: string; truckType?: string; tripQty?: number; loadingFee?: number | ""; unloadingFee?: number | "" }) {
    const q = p.tripQty ?? tripQty;
    const lf = Number(p.loadingFee ?? loadingFee) || 0;
    const uf = Number(p.unloadingFee ?? unloadingFee) || 0;
    if (!item.priceSell) { onChange(null); return; }
    const subtotal = item.priceSell * q + lf + uf;
    onChange({
      inputs: {
        pickupCity: p.pickupCity ?? pickupCity,
        destinationCity: p.destCity ?? destCity,
        truckType: p.truckType ?? truckType,
        tripQty: q,
        loadingFee: lf,
        unloadingFee: uf,
      },
      chargeableQty: q,
      chargeableUnit: item.unit ?? "trip",
      subtotal,
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.originCity", "Kota Asal")} <span className="text-red-400">*</span></Label>
          <Input value={pickupCity} onChange={(e) => { setPickupCity(e.target.value); recalc({ pickupCity: e.target.value }); }}
            placeholder={t("jasaVendorDetail.trucking.originCityPlaceholder", "Jakarta")} className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.destCity", "Kota Tujuan")} <span className="text-red-400">*</span></Label>
          <Input value={destCity} onChange={(e) => { setDestCity(e.target.value); recalc({ destCity: e.target.value }); }}
            placeholder={t("jasaVendorDetail.trucking.destCityPlaceholder", "Surabaya")} className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      </div>
      {truckOptions.length > 0 && (
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.truckType", "Jenis Truk")}</Label>
          <select value={truckType} onChange={(e) => { setTruckType(e.target.value); recalc({ truckType: e.target.value }); }}
            className="w-full h-9 rounded-xl border border-slate-200 text-[13px] px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="">{t("jasaVendorDetail.trucking.truckTypePlaceholder", "Pilih jenis truk…")}</option>
            {truckOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.tripQty", "Jumlah Trip")}</Label>
        <Input type="number" min={1} value={tripQty}
          onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setTripQty(v); recalc({ tripQty: v }); }}
          className="h-9 text-[13px] rounded-xl border-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.loadingFee", "Biaya Muat (opsional)")}</Label>
          <Input type="number" min={0} value={loadingFee === 0 ? "" : loadingFee} placeholder="0"
            onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value) || 0; setLoadingFee(v); recalc({ loadingFee: v }); }}
            className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.trucking.unloadingFee", "Biaya Bongkar (opsional)")}</Label>
          <Input type="number" min={0} value={unloadingFee === 0 ? "" : unloadingFee} placeholder="0"
            onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value) || 0; setUnloadingFee(v); recalc({ unloadingFee: v }); }}
            className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      </div>
    </div>
  );
}

// Sea Freight
function SeaFreightCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [originPort, setOriginPort] = useState("");
  const [destPort, setDestPort] = useState("");
  const [shipmentMode, setShipmentMode] = useState<"FCL" | "LCL">("FCL");
  const [containerType, setContainerType] = useState("20ft");
  const [qtyContainer, setQtyContainer] = useState(1);
  const [cbm, setCbm] = useState<number | "">(0);

  function recalc(p: { originPort?: string; destPort?: string; shipmentMode?: "FCL" | "LCL"; containerType?: string; qtyContainer?: number; cbm?: number | "" }) {
    const mode = p.shipmentMode ?? shipmentMode;
    const ct = p.containerType ?? containerType;
    const q = p.qtyContainer ?? qtyContainer;
    const v = Number(p.cbm ?? cbm) || 0;
    const chargeableQty = mode === "LCL" ? v : q;
    if (!item.priceSell) { onChange(null); return; }
    onChange({
      inputs: {
        originPort: p.originPort ?? originPort,
        destinationPort: p.destPort ?? destPort,
        shipmentMode: mode,
        containerType: mode === "FCL" ? ct : undefined,
        qtyContainer: mode === "FCL" ? q : undefined,
        cbm: mode === "LCL" ? v : undefined,
      },
      chargeableQty,
      chargeableUnit: mode === "LCL" ? "CBM" : ct,
      subtotal: item.priceSell * chargeableQty,
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.originPort", "Pelabuhan Asal")} <span className="text-red-400">*</span></Label>
          <Input value={originPort} onChange={(e) => { setOriginPort(e.target.value); recalc({ originPort: e.target.value }); }}
            placeholder={t("jasaVendorDetail.seaFreight.originPortPlaceholder", "Tanjung Priok")} className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.destPort", "Pelabuhan Tujuan")} <span className="text-red-400">*</span></Label>
          <Input value={destPort} onChange={(e) => { setDestPort(e.target.value); recalc({ destPort: e.target.value }); }}
            placeholder={t("jasaVendorDetail.seaFreight.destPortPlaceholder", "Tanjung Perak")} className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.shipmentMode", "Mode Pengiriman")}</Label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {(["FCL", "LCL"] as const).map((m) => (
            <button key={m} type="button"
              onClick={() => { setShipmentMode(m); recalc({ shipmentMode: m }); }}
              className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${shipmentMode === m ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      {shipmentMode === "FCL" ? (
        <>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.containerType", "Tipe Kontainer")}</Label>
            <select value={containerType} onChange={(e) => { setContainerType(e.target.value); recalc({ containerType: e.target.value }); }}
              className="w-full h-9 rounded-xl border border-slate-200 text-[13px] px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
              {["20ft", "40ft", "40HC", "45ft"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.containerQty", "Jumlah Kontainer")}</Label>
            <Input type="number" min={1} value={qtyContainer}
              onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setQtyContainer(v); recalc({ qtyContainer: v }); }}
              className="h-9 text-[13px] rounded-xl border-slate-200" />
          </div>
        </>
      ) : (
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.seaFreight.volumeCbm", "Volume (CBM)")} <span className="text-red-400">*</span></Label>
          <Input type="number" min={0.1} step={0.1} value={cbm === 0 ? "" : cbm} placeholder="0.0"
            onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value); setCbm(v); recalc({ cbm: v }); }}
            className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      )}
    </div>
  );
}

// Air Freight
function AirFreightCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [originAirport, setOriginAirport] = useState("");
  const [destAirport, setDestAirport] = useState("");
  const [grossWeightKg, setGrossWeightKg] = useState<number | "">(0);
  const [lengthCm, setLengthCm] = useState<number | "">(0);
  const [widthCm, setWidthCm] = useState<number | "">(0);
  const [heightCm, setHeightCm] = useState<number | "">(0);
  const [packageQty, setPackageQty] = useState(1);

  function computeVolumeWeight(l: number | "", w: number | "", h: number | "", qty: number) {
    return (Number(l) || 0) * (Number(w) || 0) * (Number(h) || 0) * qty / 6000;
  }

  function recalc(p: {
    originAirport?: string; destAirport?: string;
    grossWeightKg?: number | ""; lengthCm?: number | ""; widthCm?: number | ""; heightCm?: number | "";
    packageQty?: number;
  }) {
    const gw = Number(p.grossWeightKg ?? grossWeightKg) || 0;
    const qty = p.packageQty ?? packageQty;
    const vw = computeVolumeWeight(p.lengthCm ?? lengthCm, p.widthCm ?? widthCm, p.heightCm ?? heightCm, qty);
    const chargeable = Math.max(gw, vw);
    if (!item.priceSell || chargeable <= 0) { onChange(null); return; }
    onChange({
      inputs: {
        originAirport: p.originAirport ?? originAirport,
        destinationAirport: p.destAirport ?? destAirport,
        grossWeightKg: gw,
        lengthCm: Number(p.lengthCm ?? lengthCm) || 0,
        widthCm: Number(p.widthCm ?? widthCm) || 0,
        heightCm: Number(p.heightCm ?? heightCm) || 0,
        packageQty: qty,
        volumeWeight: Math.round(vw * 100) / 100,
        chargeableWeight: Math.round(chargeable * 100) / 100,
      },
      chargeableQty: Math.round(chargeable * 100) / 100,
      chargeableUnit: "kg",
      subtotal: item.priceSell * chargeable,
    });
  }

  const vw = computeVolumeWeight(lengthCm, widthCm, heightCm, packageQty);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.airFreight.originAirport", "Bandara Asal")} <span className="text-red-400">*</span></Label>
          <Input value={originAirport} onChange={(e) => { setOriginAirport(e.target.value); recalc({ originAirport: e.target.value }); }}
            placeholder="CGK" className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.airFreight.destAirport", "Bandara Tujuan")} <span className="text-red-400">*</span></Label>
          <Input value={destAirport} onChange={(e) => { setDestAirport(e.target.value); recalc({ destAirport: e.target.value }); }}
            placeholder="SUB" className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.airFreight.grossWeight", "Berat Kotor (kg)")} <span className="text-red-400">*</span></Label>
          <Input type="number" min={0.1} step={0.1} value={grossWeightKg === 0 ? "" : grossWeightKg} placeholder="0.0"
            onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value); setGrossWeightKg(v); recalc({ grossWeightKg: v }); }}
            className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.airFreight.packageQty", "Jumlah Koli")}</Label>
          <Input type="number" min={1} value={packageQty}
            onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setPackageQty(v); recalc({ packageQty: v }); }}
            className="h-9 text-[13px] rounded-xl border-slate-200" />
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">{t("jasaVendorDetail.airFreight.dimensionLabel", "Dimensi per Koli (cm, untuk volume weight)")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "P", val: lengthCm, set: setLengthCm, key: "lengthCm" as const },
            { label: "L", val: widthCm, set: setWidthCm, key: "widthCm" as const },
            { label: "T", val: heightCm, set: setHeightCm, key: "heightCm" as const },
          ].map(({ label, val, set, key }) => (
            <div key={key} className="space-y-1">
              <Label className="text-[10px] text-slate-400">{label} (cm)</Label>
              <Input type="number" min={0} step={1} value={val === 0 ? "" : val} placeholder="0"
                onChange={(e) => { const v = e.target.value === "" ? "" : Number(e.target.value); set(v as number | ""); recalc({ [key]: v }); }}
                className="h-8 text-[12px] rounded-xl border-slate-200" />
            </div>
          ))}
        </div>
        {vw > 0 && (
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Info className="h-3 w-3" />
            {t("jasaVendorDetail.airFreight.volumeWeightInfo", "Volume weight:")} {vw.toFixed(2)} kg ({packageQty} {t("jasaVendorDetail.airFreight.koli", "koli")} × P×L×T/6000)
          </p>
        )}
      </div>
    </div>
  );
}

// PPJK / Customs
function PpjkCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [documentType, setDocumentType] = useState("PIB");
  const [documentQty, setDocumentQty] = useState(1);
  const [shipmentType, setShipmentType] = useState("Import");

  function recalc(p: { documentType?: string; documentQty?: number; shipmentType?: string }) {
    const d = p.documentQty ?? documentQty;
    if (!item.priceSell) { onChange(null); return; }
    onChange({
      inputs: {
        documentType: p.documentType ?? documentType,
        documentQty: d,
        shipmentType: p.shipmentType ?? shipmentType,
      },
      chargeableQty: d,
      chargeableUnit: "dokumen",
      subtotal: item.priceSell * d,
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.ppjk.documentType", "Jenis Dokumen")}</Label>
        <select value={documentType} onChange={(e) => { setDocumentType(e.target.value); recalc({ documentType: e.target.value }); }}
          className="w-full h-9 rounded-xl border border-slate-200 text-[13px] px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
          <option value="PIB">PIB (Import)</option>
          <option value="PEB">PEB (Export)</option>
          <option value="BC 2.3">BC 2.3</option>
          <option value="BC 3.0">BC 3.0</option>
          <option value="Lainnya">{t("jasaVendorDetail.ppjk.other", "Lainnya")}</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.ppjk.shipmentType", "Jenis Shipment")}</Label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {["Import", "Export"].map((m) => (
            <button key={m} type="button"
              onClick={() => { setShipmentType(m); recalc({ shipmentType: m }); }}
              className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${shipmentType === m ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.ppjk.documentQty", "Jumlah Dokumen")}</Label>
        <Input type="number" min={1} value={documentQty}
          onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setDocumentQty(v); recalc({ documentQty: v }); }}
          className="h-9 text-[13px] rounded-xl border-slate-200" />
      </div>
    </div>
  );
}

// Handling
function HandlingCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [handlingType, setHandlingType] = useState("Stuffing");
  const [quantity, setQuantity] = useState(1);

  function recalc(p: { handlingType?: string; quantity?: number }) {
    const q = p.quantity ?? quantity;
    if (!item.priceSell) { onChange(null); return; }
    onChange({
      inputs: { handlingType: p.handlingType ?? handlingType, quantity: q },
      chargeableQty: q,
      chargeableUnit: item.unit ?? "unit",
      subtotal: item.priceSell * q,
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.handling.handlingType", "Jenis Handling")}</Label>
        <select value={handlingType} onChange={(e) => { setHandlingType(e.target.value); recalc({ handlingType: e.target.value }); }}
          className="w-full h-9 rounded-xl border border-slate-200 text-[13px] px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
          <option value="Stuffing">Stuffing</option>
          <option value="Stripping">Stripping</option>
          <option value="Loading">Loading</option>
          <option value="Unloading">Unloading</option>
          <option value="Warehousing">Warehousing</option>
          <option value="Lainnya">{t("jasaVendorDetail.handling.other", "Lainnya")}</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.handling.quantity", "Kuantitas")} ({item.unit ?? "unit"})</Label>
        <Input type="number" min={1} value={quantity}
          onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setQuantity(v); recalc({ quantity: v }); }}
          className="h-9 text-[13px] rounded-xl border-slate-200" />
      </div>
    </div>
  );
}

// Document
function DocumentCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [documentName, setDocumentName] = useState("");
  const [documentQty, setDocumentQty] = useState(1);

  function recalc(p: { documentName?: string; documentQty?: number }) {
    const q = p.documentQty ?? documentQty;
    if (!item.priceSell) { onChange(null); return; }
    onChange({
      inputs: { documentName: p.documentName ?? documentName, documentQty: q },
      chargeableQty: q,
      chargeableUnit: item.unit ?? "dokumen",
      subtotal: item.priceSell * q,
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.document.documentName", "Nama / Jenis Dokumen")}</Label>
        <Input value={documentName} onChange={(e) => { setDocumentName(e.target.value); recalc({ documentName: e.target.value }); }}
          placeholder={t("jasaVendorDetail.document.documentNamePlaceholder", "Contoh: Surat Jalan, SKA, COO…")} className="h-9 text-[13px] rounded-xl border-slate-200" />
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.document.documentQty", "Jumlah Dokumen")}</Label>
        <Input type="number" min={1} value={documentQty}
          onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setDocumentQty(v); recalc({ documentQty: v }); }}
          className="h-9 text-[13px] rounded-xl border-slate-200" />
      </div>
    </div>
  );
}

// General / Fallback
function GeneralCalc({ item, onChange }: { item: CatalogDetail; onChange: (r: CalcResult | null) => void }) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  function recalc(q: number) {
    if (!item.priceSell) { onChange(null); return; }
    onChange({ inputs: { quantity: q }, chargeableQty: q, chargeableUnit: item.unit ?? "unit", subtotal: item.priceSell * q });
  }

  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-slate-600">{t("jasaVendorDetail.general.quantity", "Kuantitas")} ({item.unit ?? "unit"})</Label>
      <Input type="number" min={1} value={quantity}
        onChange={(e) => { const v = Math.max(1, Number(e.target.value) || 1); setQuantity(v); recalc(v); }}
        className="h-9 text-[13px] rounded-xl border-slate-200" />
    </div>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────────

function SummaryRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${muted ? "text-slate-400" : ""}`}>
      <span className={`text-[12px] ${bold ? "font-bold text-slate-800" : "text-slate-600"}`}>{label}</span>
      <span className={`text-[12px] tabular-nums ${bold ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>{value}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function JasaVendorDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { t } = useLanguage();

  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [withTax, setWithTax] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const qc = useQueryClient();
  const queryKey = ["jasa-vendor-detail", id];
  const itemIdNum = Number(id);

  const [isUnavailable, setIsUnavailable] = useState(false);

  const { data: item, isLoading, isError } = useQuery<CatalogDetail>({
    queryKey,
    queryFn: async () => {
      const r = await fetch(`/api/portal/marketplace/${id}`);
      if (!r.ok) throw new Error("not_found");
      return r.json();
    },
    enabled: !!id && !isNaN(Number(id)),
    retry: false,
  });

  // Realtime: watch UPDATE/DELETE pada vendor_catalog_items untuk item ini
  const handleCatalogChange = useCallback((payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
    const isDelete = payload.eventType === "DELETE";
    const row = (isDelete ? payload.old : payload.new) as Record<string, unknown> ?? {};
    const rowId = Number(row["id"]);

    // Jika ada id dari event, hanya tangani item yang sedang ditampilkan
    if (rowId && rowId !== itemIdNum) return;

    // Tanpa id (replica identity DEFAULT), fallback: cek template_kind
    if (!rowId) {
      const anyRow = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
      const isService = anyRow["template_kind"] === "service"
        || anyRow["templateKind"] === "service"
        || anyRow["kind"] === "service"
        || !!anyRow["service_type"]
        || !!anyRow["serviceType"];
      if (!isService) return;
    }

    if (import.meta.env.DEV) {
      console.log("[Realtime] jasa-vendor-detail catalog change", payload.eventType, rowId || "unknown-id");
    }

    if (isDelete) {
      setIsUnavailable(true);
      return;
    }

    // UPDATE: cek apakah item menjadi tidak aktif / tidak dipublikasikan
    const newRow = payload.new ?? {};
    const published = newRow["is_published"] ?? newRow["isPublished"];
    const active = newRow["is_active"] ?? newRow["isActive"];
    if (published === false || active === false) {
      setIsUnavailable(true);
      return;
    }

    // Masih aktif — refetch detail
    qc.invalidateQueries({ queryKey: ["jasa-vendor-detail", id] });
  }, [qc, itemIdNum, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!supabase || !id) return;
    const channel = supabase
      .channel(`jasa-vendor-detail-catalog-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "vendor_catalog_items" },
        handleCatalogChange,
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "vendor_catalog_items" },
        handleCatalogChange,
      )
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [id, handleCatalogChange]);

  const serviceType = useMemo(() => item ? resolveServiceType(item) : "general", [item]);
  const categoryLabel = CATEGORY_LABELS[serviceType] ?? t("jasaVendorDetail.categoryLabelFallback", "Layanan");
  const categoryIcon = CATEGORY_ICONS[serviceType] ?? <Truck className="h-5 w-5 text-white" />;

  const taxRate = 0.11;
  const tax = calcResult ? Math.round(calcResult.subtotal * taxRate) : 0;
  const total = calcResult ? calcResult.subtotal + (withTax ? tax : 0) : 0;

  function handleAddToCart() {
    if (!item || !calcResult) return;
    const taxAmount = withTax ? tax : 0;
    addItem({
      category: categoryLabel,
      serviceName: item.name,
      calculatorType: serviceType,
      // ── top-level vendor catalog fields ──
      itemSource: "vendor_catalog_item",
      vendorCatalogItemId: item.id,
      vendorId: item.vendorId ?? null,
      vendorName: item.vendorName ?? null,
      templateKind: "service",
      serviceType: item.serviceType ?? null,
      calculationInput: {
        quantity: calcResult.chargeableQty,
        serviceType: item.serviceType ?? serviceType,
        ...calcResult.inputs,
      },
      priceSnapshot: item.priceSell != null ? {
        priceSell: item.priceSell,
        currency: item.currency,
        unit: item.unit ?? "unit",
        vendorName: item.vendorName ?? null,
        subtotal: calcResult.subtotal,
        tax: taxAmount,
        total,
      } : null,
      templateSnapshot: (item.templateSnapshot && typeof item.templateSnapshot === "object")
        ? (item.templateSnapshot as Record<string, unknown>)
        : null,
      tax: taxAmount,
      total,
      // ── inputData (detail lengkap untuk /book) ──
      inputData: {
        itemSource: "vendor_catalog_item",
        vendorCatalogItemId: item.id,
        vendorId: item.vendorId,
        vendorName: item.vendorName ?? undefined,
        templateKind: "service",
        serviceType: item.serviceType ?? serviceType,
        name: item.name,
        description: item.description ?? undefined,
        priceSell: item.priceSell,
        currency: item.currency,
        unit: item.unit,
        quantity: calcResult.chargeableQty,
        templateSnapshot: item.templateSnapshot ?? undefined,
        calculationInput: calcResult.inputs,
      },
      calculationResult: {
        chargeableQty: calcResult.chargeableQty,
        chargeableUnit: calcResult.chargeableUnit,
        subtotal: calcResult.subtotal,
        tax: taxAmount,
        total,
      },
      subtotal: total,
    });
    setAdded(true);
    toast({
      title: t("jasaVendorDetail.toast.addedTitle", "Ditambahkan ke pesanan"),
      description: `${item.name} · ${calcResult.chargeableQty} ${calcResult.chargeableUnit}`,
      action: (
        <ToastAction altText={t("jasaVendorDetail.toast.continueAlt", "Lanjut ke Pesanan")} onClick={() => setLocation("/book")}>
          {t("jasaVendorDetail.toast.continueAction", "Lanjut →")}
        </ToastAction>
      ),
    });
    setTimeout(() => setAdded(false), 3000);
  }

  function handleBack() {
    window.history.length > 1 ? window.history.back() : setLocation("/marketplace?kind=service");
  }

  // ── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-[13px] text-slate-400 font-semibold">{t("jasaVendorDetail.loading", "Memuat detail layanan…")}</p>
        </div>
      </div>
    );
  }

  // Realtime: item di-unpublish atau dihapus saat halaman terbuka
  if (isUnavailable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Truck className="h-8 w-8 text-amber-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-1">{t("jasaVendorDetail.unavailable.title", "Layanan Tidak Tersedia")}</h2>
          <p className="text-[13px] text-slate-500">{t("jasaVendorDetail.unavailable.desc", "Layanan ini telah dihapus atau tidak lagi dipublikasikan oleh vendor.")}</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => setLocation("/marketplace?type=service")}>
          <ArrowLeft className="h-4 w-4 mr-2" />{t("jasaVendorDetail.backToMarketplace", "Kembali ke Marketplace")}
        </Button>
      </div>
    );
  }

  if (isError || !item || item.templateKind !== "service") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Truck className="h-8 w-8 text-slate-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-1">{t("jasaVendorDetail.notFound.title", "Layanan tidak ditemukan")}</h2>
          <p className="text-[13px] text-slate-500">{t("jasaVendorDetail.notFound.desc", "Item ini tidak tersedia atau belum dipublikasikan.")}</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => setLocation("/marketplace?type=service")}>
          <ArrowLeft className="h-4 w-4 mr-2" />{t("jasaVendorDetail.backToMarketplace", "Kembali ke Marketplace")}
        </Button>
      </div>
    );
  }

  const allMedia = item.media ?? [];
  const primaryImage = activeImage
    ? (resolveImageUrl(activeImage) ?? activeImage)
    : (() => {
        const raw = allMedia.find((m) => m.isPrimary && m.mediaType === "image")?.fileUrl
          ?? allMedia.find((m) => m.mediaType === "image")?.fileUrl
          ?? null;
        return raw ? (resolveImageUrl(raw) ?? raw) : null;
      })();
  const thumbs = allMedia.filter((m) => m.mediaType === "image" && m.fileUrl);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0B3D6B 0%, #0D6EBF 55%, #1E9FE8 100%)", paddingTop: "clamp(20px,3vw,32px)", paddingBottom: "clamp(16px,2.5vw,24px)", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <button onClick={handleBack}
            className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold rounded-lg px-3 py-1.5"
            style={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.20)" }}>
            <ArrowLeft className="h-3.5 w-3.5" />{t("jasaVendorDetail.back", "Kembali")}
          </button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)" }}>
              {categoryIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)" }}>
                  {categoryLabel}
                </span>
                {item.stockStatus === "available" && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(34,197,94,0.20)", color: "rgba(255,255,255,0.95)", border: "1px solid rgba(34,197,94,0.35)" }}>
                    {t("jasaVendorDetail.available", "Tersedia")}
                  </span>
                )}
              </div>
              <h1 className="text-white font-extrabold leading-tight" style={{ fontSize: "clamp(18px,2.5vw,28px)", textShadow: "0 2px 12px rgba(0,0,0,0.20)" }}>
                {item.name}
              </h1>
              {item.vendorName && (
                <button
                  onClick={() => setLocation(`/vendor/${item.vendorId}`)}
                  className="flex items-center gap-1.5 mt-1.5 group"
                  title={`${t("jasaVendorDetail.vendorCatalogTitle", "Lihat semua katalog")} ${item.vendorName}`}
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.65)" }} />
                  <span className="text-[13px] font-semibold group-hover:underline" style={{ color: "rgba(255,255,255,0.80)" }}>{item.vendorName}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.65)" }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: detail ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image gallery */}
            {primaryImage && (
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm" style={{ height: 260 }}>
                <img src={primaryImage} alt={item.name} className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
              </div>
            )}
            {thumbs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {thumbs.map((m) => (
                   <button key={m.id} onClick={() => setActiveImage(m.fileUrl)}
                     className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === m.fileUrl || (!activeImage && m.isPrimary) ? "border-sky-500 shadow-md" : "border-transparent"}`}>
                     <img src={resolveImageUrl(m.fileUrl) ?? m.fileUrl!} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Price card */}
            {item.priceSell != null && (
              <div className="rounded-2xl px-5 py-4 border" style={{ background: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)", borderColor: "rgba(59,130,246,0.25)" }}>
                <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider mb-0.5">{t("jasaVendorDetail.sellingPrice", "Harga Jual")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-extrabold text-sky-700 leading-none">
                    {formatCurrency(item.priceSell, item.currency)}
                  </span>
                  {item.unit && <span className="text-[14px] text-sky-500 font-medium">/ {item.unit}</span>}
                </div>
                {item.moq != null && item.moq > 1 && (
                  <p className="text-[12px] text-sky-600 mt-1">{t("jasaVendorDetail.minOrder", "Min. order:")} {item.moq} {item.unit ?? "unit"}</p>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("jasaVendorDetail.description", "Deskripsi")}</p>
                <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {/* Spec grid */}
            {!!(item.specValues || item.templateSnapshot) && (
              <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
                <SpecGrid specValues={item.specValues} templateSnapshot={item.templateSnapshot} />
              </div>
            )}

            {/* Meta info */}
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("jasaVendorDetail.serviceInfo", "Informasi Layanan")}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Tag className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.serviceType", "Tipe Layanan"), val: item.resolvedCategoryLabel ?? categoryLabel },
                  item.serviceType ? { icon: <Tag className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: "Service Type", val: item.serviceType } : null,
                  item.location ? { icon: <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.location", "Lokasi"), val: item.location } : null,
                  item.origin ? { icon: <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.origin", "Asal"), val: item.origin } : null,
                  item.leadTime ? { icon: <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: "Lead Time", val: item.leadTime } : null,
                  item.moq != null ? { icon: <Tag className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.minOrder", "Min. Order"), val: `${item.moq} ${item.unit ?? "unit"}` } : null,
                  item.subcategory ? { icon: <ChevronRight className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.subcategory", "Sub-kategori"), val: item.subcategory } : null,
                  item.currency !== "IDR" ? { icon: <Tag className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />, label: t("jasaVendorDetail.meta.currency", "Mata Uang"), val: item.currency } : null,
                ].filter(Boolean).map((row, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {row!.icon}
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{row!.label}</p>
                      <p className="text-[13px] text-slate-700 font-medium">{row!.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: calculator + cart ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-5 sticky top-4 space-y-4">

              {/* Calculator header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800 leading-tight">{t("jasaVendorDetail.calculator.title", "Kalkulator Estimasi")}</p>
                  <p className="text-[11px] text-slate-400">{t("jasaVendorDetail.calculator.subtitle", "Isi detail pengiriman untuk estimasi biaya")}</p>
                </div>
              </div>

              <Separator />

              {/* Service type badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("jasaVendorDetail.calculator.typeLabel", "Tipe:")} </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-700">
                  {categoryIcon && <span className="[&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-sky-600">{categoryIcon}</span>}
                  {categoryLabel}
                </span>
              </div>

              {/* Calculator form by type */}
              {item.priceSell == null && (
                <div className="text-center py-4">
                  <p className="text-[12px] text-slate-400">{t("jasaVendorDetail.noPriceMessage", "Harga belum tersedia.")}<br />{t("jasaVendorDetail.noPriceHint", "Hubungi vendor untuk penawaran.")}</p>
                </div>
              )}

              {item.priceSell != null && (
                <>
                  {serviceType === "trucking" && <TruckingCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "sea_freight" && <SeaFreightCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "air_freight" && <AirFreightCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "ppjk" && <PpjkCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "handling" && <HandlingCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "document" && <DocumentCalc item={item} onChange={setCalcResult} />}
                  {serviceType === "general" && <GeneralCalc item={item} onChange={setCalcResult} />}
                </>
              )}

              {/* Summary */}
              {calcResult && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("jasaVendorDetail.summary.title", "Ringkasan Estimasi")}</p>
                    <div className="space-y-0.5">
                      <SummaryRow label={t("jasaVendorDetail.summary.unitPrice", "Harga Satuan")} value={formatCurrency(item.priceSell ?? 0, item.currency)} />
                      <SummaryRow label={`× ${calcResult.chargeableQty} ${calcResult.chargeableUnit}`} value={formatCurrency(calcResult.subtotal, item.currency)} />
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Switch checked={withTax} onCheckedChange={setWithTax} />
                          <span className="text-[12px] text-slate-600">{t("jasaVendorDetail.summary.ppn", "PPN 11%")}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-slate-700 tabular-nums">
                          {withTax ? formatCurrency(tax, item.currency) : "—"}
                        </span>
                      </div>
                      <Separator />
                      <SummaryRow label={t("jasaVendorDetail.summary.totalEstimate", "Total Estimasi")} value={formatCurrency(total, item.currency)} bold />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      {t("jasaVendorDetail.summary.disclaimer", "* Estimasi awal. Harga final dikonfirmasi vendor.")}
                    </p>
                  </div>

                  <Button
                    className={`w-full h-11 rounded-xl font-semibold text-[13px] transition-all ${added ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"} text-white`}
                    onClick={handleAddToCart}
                  >
                    {added ? (
                      <><CheckCircle2 className="h-4 w-4 mr-2" />{t("jasaVendorDetail.addedBtn", "Ditambahkan!")}</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4 mr-2" />{t("jasaVendorDetail.addToCartBtn", "Tambahkan ke Pesanan")}</>
                    )}
                  </Button>
                </>
              )}

              {/* WA fallback */}
              {item.priceSell == null && (
                <a href={`https://wa.me/?text=${encodeURIComponent(`Halo, saya tertarik dengan layanan: ${item.name}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t("jasaVendorDetail.whatsappBtn", "Tanya via WhatsApp")}
                </a>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
