import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlacesAutocomplete } from "@/components/ui/google-places-autocomplete";
import { RouteMapPreview } from "@/components/ui/route-map-preview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateLogisticOrder, useGetPortalMe } from "@shared/api-client-react";
import { isAuthenticated } from "@/lib/auth";
import { useCart, CartItem } from "@/lib/logistic-cart";
import { formatCurrency } from "@/lib/utils";
import {
  CATEGORIES, SERVICE_ITEMS, SHIPMENT_TYPES,
  ServiceCategory, ServiceItem, ShipmentType,
} from "@/lib/services-data";
import {
  Ship, ChevronLeft, ChevronRight, ArrowLeft,
  Plane, Download, Upload, MapPin, Home,
  Package, Warehouse, Truck, FileCheck, Shield, FileText,
  Plus, Trash2, Edit2, Calculator, ShoppingCart, User, CheckCircle2,
  CreditCard, Banknote, Building2, Receipt,
  Sparkles, Loader2, ArrowRight,
} from "lucide-react";
import { CityAutocompleteInput } from "@/components/ui/city-autocomplete";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

const GOODS_TYPES_BOOK = ["General Cargo","Kopi / Hasil Bumi","Elektronik","Perishable","Kimia / B3","Furniture","Mesin & Spare-part","Lainnya"];
const INCOTERMS_BOOK   = ["EXW","FCA","FOB","CIF","DAP","DDP","CPT","CIP"];

function AutoReadOnly({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();
  return (
    <div>
      <label className="text-xs flex items-center gap-1 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("logisticBook.auto", "Otomatis")}</span>
      </label>
      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
        <span className="text-xs font-semibold text-slate-800">{value || "—"}</span>
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ship, Plane, Download, Upload, MapPin, Home,
  Package, Warehouse, Truck, FileCheck, Shield, FileText,
};

function getServiceDetailRows(
  calculatorType: string,
  inputData: Record<string, unknown>,
  t: (key: string, fallback: string) => string
): { label: string; value: string }[] {
  const str = (v: unknown) => (v != null && v !== "" ? String(v) : "");

  if (calculatorType === "trucking") {
    return [
      { label: t("logisticBook.detail.pickupCity", "Pickup City"), value: str(inputData.pickupCity) || "-" },
      { label: t("logisticBook.detail.destinationCity", "Destination City"), value: str(inputData.destCity) || "-" },
      { label: t("logisticBook.detail.distance", "Distance"), value: inputData.distance ? `${inputData.distance} KM` : "-" },
      { label: t("logisticBook.detail.vehicleType", "Vehicle Type"), value:
          (inputData.vehicleType === "Trailer Truck" || inputData.vehicleType === "Trailer") && inputData.trailerSize
            ? `${str(inputData.vehicleType)} - ${str(inputData.trailerSize)}`
            : str(inputData.vehicleType) || t("logisticBook.detail.notSpecified", "Not specified") },
    ];
  }
  if (calculatorType === "air_freight") {
    return [
      ...(inputData.originAirport ? [{ label: t("logisticBook.detail.originAirport", "Origin Airport"), value: str(inputData.originAirport) }] : []),
      ...(inputData.destinationAirport ? [{ label: t("logisticBook.detail.destinationAirport", "Destination Airport"), value: str(inputData.destinationAirport) }] : []),
      ...(inputData.grossWeight ? [{ label: t("logisticBook.detail.grossWeight", "Gross Weight"), value: `${inputData.grossWeight} kg` }] : []),
      ...(inputData.quantity ? [{ label: t("logisticBook.detail.quantity", "Quantity"), value: `${inputData.quantity} pcs` }] : []),
    ];
  }
  if (calculatorType === "sea_fcl") {
    return [
      ...(inputData.originPort ? [{ label: t("logisticBook.detail.originPort", "Origin Port"), value: str(inputData.originPort) }] : []),
      ...(inputData.destinationPort ? [{ label: t("logisticBook.detail.destinationPort", "Destination Port"), value: str(inputData.destinationPort) }] : []),
      ...(inputData.containerType ? [{ label: t("logisticBook.detail.containerType", "Container Type"), value: str(inputData.containerType) }] : []),
    ];
  }
  if (calculatorType === "sea_lcl") {
    return [
      ...(inputData.cbm ? [{ label: t("logisticBook.detail.cbm", "CBM"), value: String(inputData.cbm) }] : []),
      ...(inputData.weight ? [{ label: t("logisticBook.detail.weight", "Weight"), value: `${inputData.weight} kg` }] : []),
    ];
  }
  if (calculatorType === "customs") {
    return [
      ...(inputData.shipmentType ? [{ label: t("logisticBook.detail.shipmentType", "Shipment Type"), value: str(inputData.shipmentType) }] : []),
    ];
  }
  if (calculatorType === "storage") {
    return [
      ...(inputData.days ? [{ label: t("logisticBook.detail.days", "Days"), value: String(inputData.days) }] : []),
      ...(inputData.quantity ? [{ label: t("logisticBook.detail.quantity", "Quantity"), value: String(inputData.quantity) }] : []),
      ...(inputData.unit ? [{ label: t("logisticBook.detail.unit", "Unit"), value: str(inputData.unit) }] : []),
    ];
  }
  if (calculatorType === "product") {
    return [
      ...(inputData.qty ? [{ label: t("logisticBook.detail.qty", "Qty"), value: String(inputData.qty) }] : []),
      ...(inputData.unit ? [{ label: t("logisticBook.detail.unit", "Unit"), value: str(inputData.unit) }] : []),
    ];
  }
  if (inputData.itemSource === "vendor_catalog_item") {
    const rows: { label: string; value: string }[] = [];
    if (inputData.serviceType) rows.push({ label: t("logisticBook.detail.serviceType", "Tipe Layanan"), value: str(inputData.serviceType) });
    if (inputData.quantity != null) rows.push({ label: t("logisticBook.detail.qtyVolume", "Qty / Volume"), value: `${inputData.quantity}${inputData.unit ? " " + str(inputData.unit) : ""}` });
    if (inputData.pickupCity || inputData.origin) rows.push({ label: t("logisticBook.detail.origin", "Asal"), value: str(inputData.pickupCity ?? inputData.origin) });
    if (inputData.destCity || inputData.destination) rows.push({ label: t("logisticBook.detail.destination", "Tujuan"), value: str(inputData.destCity ?? inputData.destination) });
    if (inputData.containerType) rows.push({ label: t("logisticBook.detail.container", "Kontainer"), value: str(inputData.containerType) });
    if (inputData.grossWeight) rows.push({ label: t("logisticBook.detail.grossWeightKg", "Berat Kotor"), value: `${inputData.grossWeight} kg` });
    if (inputData.chargeableWeight) rows.push({ label: t("logisticBook.detail.chargeableWeight", "Chargeable Weight"), value: `${inputData.chargeableWeight} kg` });
    return rows;
  }
  const skipped = new Set(["unitPrice", "serviceFee", "adminFee", "ratePerKg", "ratePerCbm", "minimumCharge", "freightRate", "handlingFee", "truckingRate", "loadingFee", "customsFee", "documentFee", "pibPebFee", "permitFee", "notes"]);
  return Object.entries(inputData)
    .filter(([k, v]) => v && !skipped.has(k))
    .slice(0, 4)
    .map(([k, v]) => ({
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      value: String(v),
    }));
}

const STEPS_KEYS = [
  { key: "logisticBook.steps.shipmentType", fallback: "Tipe Pengiriman" },
  { key: "logisticBook.steps.selectService", fallback: "Pilih Layanan" },
  { key: "logisticBook.steps.summary", fallback: "Ringkasan" },
  { key: "logisticBook.steps.ordererData", fallback: "Data Pemesan" },
  { key: "logisticBook.steps.payment", fallback: "Pembayaran" },
  { key: "logisticBook.steps.confirmation", fallback: "Konfirmasi" },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface CalcState {
  [key: string]: string;
}

function calcSubtotal(calcType: string, state: CalcState): number {
  try {
    switch (calcType) {
      case "air_freight": {
        const gw = parseFloat(state.grossWeight) || 0;
        const l = parseFloat(state.length) || 0;
        const w = parseFloat(state.width) || 0;
        const h = parseFloat(state.height) || 0;
        const qty = parseFloat(state.quantity) || 1;
        const rate = parseFloat(state.ratePerKg) || 0;
        const vw = (l * w * h * qty) / 6000;
        const cw = Math.max(gw, vw);
        return cw * rate;
      }
      case "sea_fcl": {
        const fr = parseFloat(state.freightRate) || 0;
        const hf = parseFloat(state.handlingFee) || 0;
        return fr + hf;
      }
      case "sea_lcl": {
        const cbm = parseFloat(state.cbm) || 0;
        const rate = parseFloat(state.ratePerCbm) || 0;
        const min = parseFloat(state.minimumCharge) || 0;
        return Math.max(cbm * rate, min);
      }
      case "customs": {
        const cf = parseFloat(state.customsFee) || 0;
        const df = parseFloat(state.documentFee) || 0;
        const pf = parseFloat(state.pibPebFee) || 0;
        const af = parseFloat(state.permitFee) || 0;
        return cf + df + pf + af;
      }
      case "trucking": {
        const tr = parseFloat(state.truckingRate) || 0;
        const lf = parseFloat(state.loadingFee) || 0;
        return tr + lf;
      }
      case "storage": {
        const days = parseFloat(state.days) || 0;
        const qty = parseFloat(state.quantity) || 1;
        const rate = parseFloat(state.ratePerDay) || 0;
        return days * qty * rate;
      }
      case "document": {
        const qty = parseFloat(state.quantity) || 0;
        const fee = parseFloat(state.feePerDocument) || 0;
        return qty * fee;
      }
      case "additional": {
        const sf = parseFloat(state.serviceFee) || 0;
        const af = parseFloat(state.adminFee) || 0;
        return sf + af;
      }
      default: {
        const qty = parseFloat(state.quantity) || 1;
        const up = parseFloat(state.unitPrice) || 0;
        return qty * up;
      }
    }
  } catch {
    return 0;
  }
}

function calcResult(calcType: string, state: CalcState): Record<string, unknown> {
  switch (calcType) {
    case "air_freight": {
      const gw = parseFloat(state.grossWeight) || 0;
      const l = parseFloat(state.length) || 0;
      const w = parseFloat(state.width) || 0;
      const h = parseFloat(state.height) || 0;
      const qty = parseFloat(state.quantity) || 1;
      const rate = parseFloat(state.ratePerKg) || 0;
      const vw = (l * w * h * qty) / 6000;
      const cw = Math.max(gw, vw);
      return { volumeWeight: vw.toFixed(2), chargeableWeight: cw.toFixed(2), ratePerKg: rate, total: (cw * rate).toFixed(2) };
    }
    default:
      return { total: calcSubtotal(calcType, state).toFixed(2) };
  }
}

interface CompanyOrigin { name: string; address: string; originCity: string; originAirport: string; originPort: string; }

function CalculatorForm({ item, onAdd, onBack, transportMode, truckType, origin, destination, companyOrigin, initialState: initialCalcState }: {
  item: ServiceItem;
  onAdd: (data: Omit<CartItem, "cartId">) => void;
  onBack: () => void;
  transportMode?: string;
  truckType?: string;
  origin?: string;
  destination?: string;
  companyOrigin?: CompanyOrigin;
  initialState?: Record<string, string>;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState<CalcState>({});
  const [autoRateFetching, setAutoRateFetching] = useState(false);
  const { toast } = useToast();

  // Auto-fill origin airport/port from company defaults, and product dims if provided
  useEffect(() => {
    if (!companyOrigin && !initialCalcState) return;
    setState(prev => {
      const next = { ...prev };
      if (companyOrigin) {
        if (item.calculatorType === "air_freight") next.originAirport = prev.originAirport || companyOrigin.originAirport;
        else if (item.calculatorType === "sea_fcl") next.originPort = prev.originPort || companyOrigin.originPort;
      }
      if (initialCalcState && item.calculatorType === "air_freight") {
        if (initialCalcState.grossWeight && !next.grossWeight) next.grossWeight = initialCalcState.grossWeight;
        if (initialCalcState.length && !next.length) next.length = initialCalcState.length;
        if (initialCalcState.width && !next.width) next.width = initialCalcState.width;
        if (initialCalcState.height && !next.height) next.height = initialCalcState.height;
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyOrigin, item.calculatorType, initialCalcState]);

  function set(key: string, val: string) {
    setState((prev) => ({ ...prev, [key]: val }));
  }

  // Auto-calculate trucking rate from estimate-price when distance changes
  useEffect(() => {
    if (item.calculatorType !== "trucking") return;
    const dist = parseFloat(state.distance ?? "");
    if (!dist || dist <= 0) return;
    const mode = transportMode || "TRUCKING";
    const params = new URLSearchParams({ transport_mode: mode, distance_km: String(dist) });
    if (truckType || state.vehicleType) params.set("truck_type", (truckType || state.vehicleType)!);
    if (origin) params.set("origin", origin);
    if (destination) params.set("dest", destination);
    setAutoRateFetching(true);
    fetch(`/api/logistic/orders/estimate-price?${params.toString()}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { estimated_price: number | null }) => {
        if (d.estimated_price != null && d.estimated_price > 0) {
          setState((prev) => ({ ...prev, truckingRate: String(Math.round(d.estimated_price!)) }));
        }
      })
      .catch(() => {})
      .finally(() => setAutoRateFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.distance, state.vehicleType, item.calculatorType]);

  const subtotal = calcSubtotal(item.calculatorType, state);

  function handleAdd() {
    if (item.calculatorType === "trucking") {
      if (!state.pickupCity || !state.destCity || !state.vehicleType) {
        toast({ title: t("logisticBook.toast.fillTruckingFields", "Isi kota asal, kota tujuan, dan tipe kendaraan"), variant: "destructive" });
        return;
      }
    } else if (subtotal <= 0) {
      toast({ title: t("logisticBook.toast.fillCalculator", "Isi data kalkulator terlebih dahulu"), variant: "destructive" });
      return;
    }
    onAdd({
      category: item.category,
      serviceName: item.name,
      calculatorType: item.calculatorType,
      inputData: { ...state },
      calculationResult: calcResult(item.calculatorType, state),
      subtotal,
    });
    toast({ title: `${item.name} ${t("logisticBook.toast.addedToOrder", "ditambahkan ke pesanan")}` });
  }

  const ct = item.calculatorType;

  const hasAutoWeight = !!(initialCalcState?.grossWeight);
  const hasAutoDims   = !!(initialCalcState?.length || initialCalcState?.width || initialCalcState?.height);
  const hasAutoGoods  = !!(initialCalcState?.goodsType);
  const hasAnyAuto    = hasAutoWeight || hasAutoDims || hasAutoGoods;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <Badge variant="outline" className="text-xs mb-1">{item.category}</Badge>
          <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calculator className="w-4 h-4 text-accent" /> {t("logisticBook.calculator", "Calculator")}
        </div>

        {hasAnyAuto && (
          <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-700">{t("logisticBook.autoFillTitle", "Diisi otomatis dari produk pesanan")}</p>
              <p className="text-xs text-blue-600 mt-0.5">{t("logisticBook.autoFillDesc", "Berat & dimensi dihitung dari item di keranjang. Lengkapi detail lainnya lalu klik Hitung Estimasi.")}</p>
            </div>
          </div>
        )}

        {ct === "air_freight" && <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                {t("logisticBook.form.originAirport", "Bandara Asal")}
                <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("logisticBook.auto", "Otomatis")}</span>
              </Label>
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">{state.originAirport || companyOrigin?.originAirport || "CGK"}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("logisticBook.form.destinationAirport", "Bandara Tujuan")} <span className="text-destructive">*</span></Label>
              <CityAutocompleteInput type="airport" placeholder={t("logisticBook.form.searchDestAirport", "Cari bandara tujuan...")} value={state.destinationAirport||""} onChange={v => set("destinationAirport", v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {hasAutoWeight
              ? <AutoReadOnly label={t("logisticBook.form.grossWeightKg", "Gross Weight (kg)")} value={state.grossWeight||""} />
              : <div><Label className="text-xs">{t("logisticBook.form.grossWeightKg", "Gross Weight (kg)")}</Label><Input type="number" placeholder="0" value={state.grossWeight||""} onChange={e => set("grossWeight", e.target.value)} /></div>
            }
            <div><Label className="text-xs">{t("logisticBook.form.quantityPcs", "Quantity (pcs)")}</Label><Input type="number" placeholder="1" value={state.quantity||""} onChange={e => set("quantity", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {hasAutoDims ? <>
              <AutoReadOnly label={t("logisticBook.form.lengthCm", "Panjang (cm)")} value={state.length||""} />
              <AutoReadOnly label={t("logisticBook.form.widthCm", "Lebar (cm)")} value={state.width||""} />
              <AutoReadOnly label={t("logisticBook.form.heightCm", "Tinggi (cm)")} value={state.height||""} />
            </> : <>
              <div><Label className="text-xs">{t("logisticBook.form.lengthCmEn", "Length (cm)")}</Label><Input type="number" placeholder="0" value={state.length||""} onChange={e => set("length", e.target.value)} /></div>
              <div><Label className="text-xs">{t("logisticBook.form.widthCmEn", "Width (cm)")}</Label><Input type="number" placeholder="0" value={state.width||""} onChange={e => set("width", e.target.value)} /></div>
              <div><Label className="text-xs">{t("logisticBook.form.heightCmEn", "Height (cm)")}</Label><Input type="number" placeholder="0" value={state.height||""} onChange={e => set("height", e.target.value)} /></div>
            </>}
          </div>
          {hasAutoGoods && <AutoReadOnly label={t("logisticBook.form.goodsType", "Jenis Barang")} value={state.goodsType||""} />}
          <div><Label className="text-xs">{t("logisticBook.form.ratePerKg", "Rate per Kg (IDR)")}</Label><Input type="number" placeholder="0" value={state.ratePerKg||""} onChange={e => set("ratePerKg", e.target.value)} /></div>
          {(parseFloat(state.grossWeight)||0) > 0 && (parseFloat(state.ratePerKg)||0) > 0 && (
            <div className="text-xs text-muted-foreground bg-background rounded p-3 space-y-1">
              <p>{t("logisticBook.form.volumeWeight", "Volume Weight")}: {((parseFloat(state.length)||0)*(parseFloat(state.width)||0)*(parseFloat(state.height)||0)*(parseFloat(state.quantity)||1)/6000).toFixed(2)} kg</p>
              <p>{t("logisticBook.form.chargeableWeight", "Chargeable Weight")}: {Math.max(parseFloat(state.grossWeight)||0, (parseFloat(state.length)||0)*(parseFloat(state.width)||0)*(parseFloat(state.height)||0)*(parseFloat(state.quantity)||1)/6000).toFixed(2)} kg</p>
            </div>
          )}
        </>}

        {ct === "sea_fcl" && <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                {t("logisticBook.form.originPort", "Pelabuhan Asal")}
                <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("logisticBook.auto", "Otomatis")}</span>
              </Label>
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">{state.originPort || companyOrigin?.originPort || "Tanjung Priok, Jakarta"}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("logisticBook.form.destinationPort", "Pelabuhan Tujuan")} <span className="text-destructive">*</span></Label>
              <CityAutocompleteInput type="port" placeholder={t("logisticBook.form.searchDestPort", "Cari pelabuhan tujuan...")} value={state.destinationPort||""} onChange={v => set("destinationPort", v)} />
            </div>
          </div>
          {(hasAutoWeight || hasAutoDims || hasAutoGoods) && (
            <div className="grid grid-cols-2 gap-3">
              {hasAutoWeight && <AutoReadOnly label={t("logisticBook.form.weightKg", "Berat (kg)")} value={state.grossWeight||""} />}
              {hasAutoGoods && <AutoReadOnly label={t("logisticBook.form.goodsType", "Jenis Barang")} value={state.goodsType||""} />}
              {hasAutoDims && <>
                <AutoReadOnly label={t("logisticBook.form.lengthCm", "Panjang (cm)")} value={state.length||""} />
                <AutoReadOnly label={t("logisticBook.form.widthCm", "Lebar (cm)")} value={state.width||""} />
                <AutoReadOnly label={t("logisticBook.form.heightCm", "Tinggi (cm)")} value={state.height||""} />
              </>}
            </div>
          )}
          <div><Label className="text-xs">{t("logisticBook.form.containerType", "Container Type")}</Label>
            <Select value={state.containerType||undefined} onValueChange={v => set("containerType", v)}>
              <SelectTrigger><SelectValue placeholder={t("logisticBook.form.selectContainer", "Select container")} /></SelectTrigger>
              <SelectContent>
                {["20FT", "40FT", "40HC"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.freightRate", "Freight Rate (IDR)")}</Label><Input type="number" placeholder="0" value={state.freightRate||""} onChange={e => set("freightRate", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.handlingFee", "Handling Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.handlingFee||""} onChange={e => set("handlingFee", e.target.value)} /></div>
          </div>
        </>}

        {ct === "sea_lcl" && <>
          <div className="grid grid-cols-2 gap-3">
            {hasAutoDims
              ? <AutoReadOnly label={t("logisticBook.form.cbm", "CBM")} value={state.cbm||""} />
              : <div><Label className="text-xs">{t("logisticBook.form.cbm", "CBM")}</Label><Input type="number" placeholder="0" value={state.cbm||""} onChange={e => set("cbm", e.target.value)} /></div>
            }
            {hasAutoWeight
              ? <AutoReadOnly label={t("logisticBook.form.weightKg", "Berat (kg)")} value={state.weight||state.grossWeight||""} />
              : <div><Label className="text-xs">{t("logisticBook.form.weightKgEn", "Weight (kg)")}</Label><Input type="number" placeholder="0" value={state.weight||""} onChange={e => set("weight", e.target.value)} /></div>
            }
          </div>
          {hasAutoGoods && <AutoReadOnly label={t("logisticBook.form.goodsType", "Jenis Barang")} value={state.goodsType||""} />}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.ratePerCbm", "Rate per CBM (IDR)")}</Label><Input type="number" placeholder="0" value={state.ratePerCbm||""} onChange={e => set("ratePerCbm", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.minimumCharge", "Minimum Charge (IDR)")}</Label><Input type="number" placeholder="0" value={state.minimumCharge||""} onChange={e => set("minimumCharge", e.target.value)} /></div>
          </div>
        </>}

        {ct === "customs" && <>
          <div><Label className="text-xs">{t("logisticBook.form.shipmentType", "Shipment Type")}</Label>
            <Select value={state.shipmentType||undefined} onValueChange={v => set("shipmentType", v)}>
              <SelectTrigger><SelectValue placeholder={t("logisticBook.form.importExport", "Import / Export")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Import">Import</SelectItem>
                <SelectItem value="Export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.customsServiceFee", "Customs Service Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.customsFee||""} onChange={e => set("customsFee", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.documentFee", "Document Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.documentFee||""} onChange={e => set("documentFee", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.pibPebFee", "PIB/PEB Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.pibPebFee||""} onChange={e => set("pibPebFee", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.additionalPermitFee", "Additional Permit Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.permitFee||""} onChange={e => set("permitFee", e.target.value)} /></div>
          </div>
        </>}

        {ct === "trucking" && <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                {t("logisticBook.form.originCity", "Kota Asal")}
                <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("logisticBook.auto", "Otomatis")}</span>
              </Label>
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800">{state.pickupCity || companyOrigin?.originCity || "Jakarta"}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("logisticBook.form.destinationCity", "Kota Tujuan")} <span className="text-destructive">*</span></Label>
              <CityAutocompleteInput type="city" placeholder={t("logisticBook.form.searchDestCity", "Cari kota tujuan...")} value={state.destCity||""} onChange={v => set("destCity", v)} />
            </div>
          </div>
          {(hasAutoWeight || hasAutoGoods) && (
            <div className="grid grid-cols-2 gap-3">
              {hasAutoWeight && <AutoReadOnly label={t("logisticBook.form.weightKg", "Berat (kg)")} value={state.grossWeight||""} />}
              {hasAutoGoods && <AutoReadOnly label={t("logisticBook.form.goodsType", "Jenis Barang")} value={state.goodsType||""} />}
            </div>
          )}
          <div><Label className="text-xs">{t("logisticBook.form.vehicleType", "Vehicle Type")}</Label>
            <Select value={state.vehicleType||undefined} onValueChange={v => set("vehicleType", v)}>
              <SelectTrigger><SelectValue placeholder={t("logisticBook.form.selectVehicle", "Select vehicle")} /></SelectTrigger>
              <SelectContent>
                {["CDE", "CDD", "Fuso", "Wingbox", "Trailer"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.distanceKm", "Distance (km)")}</Label><Input type="number" placeholder="0" value={state.distance||""} onChange={e => set("distance", e.target.value)} /></div>
            <div>
              <Label className="text-xs flex items-center gap-1">
                {t("logisticBook.form.truckingRate", "Trucking Rate (IDR)")}
                {autoRateFetching && <span className="text-[10px] text-muted-foreground animate-pulse">{t("logisticBook.form.calculating", "menghitung…")}</span>}
                {!autoRateFetching && state.truckingRate && state.distance && <span className="text-[10px] text-emerald-600">● auto</span>}
              </Label>
              <Input type="number" placeholder="0" value={state.truckingRate||""} onChange={e => set("truckingRate", e.target.value)} />
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 space-y-0.5">
            <p className="font-semibold">{t("logisticBook.truckingPriceConfirmTitle", "Harga Akan Dikonfirmasi oleh Vendor")}</p>
            <p>{t("logisticBook.truckingPriceConfirmDesc", "Harga trucking akan diberikan setelah vendor menerima dan mengkonfirmasi pesanan Anda.")}</p>
          </div>
        </>}

        {ct === "storage" && <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.numberOfDays", "Number of Days")}</Label><Input type="number" placeholder="0" value={state.days||""} onChange={e => set("days", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.quantity", "Quantity")}</Label><Input type="number" placeholder="1" value={state.quantity||""} onChange={e => set("quantity", e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">{t("logisticBook.form.unit", "Unit")}</Label>
            <Select value={state.unit||undefined} onValueChange={v => set("unit", v)}>
              <SelectTrigger><SelectValue placeholder={t("logisticBook.form.selectUnit", "Select unit")} /></SelectTrigger>
              <SelectContent>
                {["CBM", "Pallet", "KG"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">{t("logisticBook.form.ratePerDay", "Rate per Day (IDR)")}</Label><Input type="number" placeholder="0" value={state.ratePerDay||""} onChange={e => set("ratePerDay", e.target.value)} /></div>
        </>}

        {ct === "document" && <>
          <div><Label className="text-xs">{t("logisticBook.form.documentType", "Document Type")}</Label><Input placeholder="Bill of Lading" value={state.documentType||""} onChange={e => set("documentType", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.quantity", "Quantity")}</Label><Input type="number" placeholder="1" value={state.quantity||""} onChange={e => set("quantity", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.feePerDocument", "Fee per Document (IDR)")}</Label><Input type="number" placeholder="0" value={state.feePerDocument||""} onChange={e => set("feePerDocument", e.target.value)} /></div>
          </div>
        </>}

        {ct === "additional" && <>
          <div><Label className="text-xs">{t("logisticBook.form.serviceType", "Service Type")}</Label><Input placeholder="Insurance" value={state.serviceType||""} onChange={e => set("serviceType", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.serviceFee", "Service Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.serviceFee||""} onChange={e => set("serviceFee", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.adminFee", "Admin Fee (IDR)")}</Label><Input type="number" placeholder="0" value={state.adminFee||""} onChange={e => set("adminFee", e.target.value)} /></div>
          </div>
        </>}

        {ct === "generic" && <>
          <div><Label className="text-xs">{t("logisticBook.form.serviceName", "Service Name")}</Label><Input placeholder={item.name} value={state.serviceName||""} onChange={e => set("serviceName", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("logisticBook.form.quantity", "Quantity")}</Label><Input type="number" placeholder="1" value={state.quantity||""} onChange={e => set("quantity", e.target.value)} /></div>
            <div><Label className="text-xs">{t("logisticBook.form.unitPrice", "Unit Price (IDR)")}</Label><Input type="number" placeholder="0" value={state.unitPrice||""} onChange={e => set("unitPrice", e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">{t("logisticBook.form.notesOptional", "Notes (optional)")}</Label><Input placeholder={t("logisticBook.form.additionalDetails", "Additional details")} value={state.notes||""} onChange={e => set("notes", e.target.value)} /></div>
        </>}

        <Separator />
        {item.calculatorType === "trucking" ? (
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!state.pickupCity || !state.destCity || !state.vehicleType}
          >
            <Plus className="w-4 h-4 mr-2" /> {t("logisticBook.btn.addToOrder", "Add to Order")}
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{t("logisticBook.subtotal", "Subtotal")}</span>
              <span className="text-lg font-bold text-accent">{formatCurrency(subtotal)}</span>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={subtotal <= 0}>
              <Plus className="w-4 h-4 mr-2" /> {t("logisticBook.btn.addToOrder", "Add to Order")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  const { t } = useLanguage();
  const DRAFT_META_KEY = "logistic_draft_meta";

  const STEPS = STEPS_KEYS.map(({ key, fallback }) => t(key, fallback));

  const QUICK_SERVICES = [
    {
      id: "freight",
      name: t("logisticBook.quickServices.freight.name", "Freight"),
      description: t("logisticBook.quickServices.freight.desc", "Air & sea forwarding, domestic delivery"),
      category: "Freight" as const,
      isTrucking: false,
      icon: <Ship className="w-5 h-5 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/60 hover:border-blue-400 text-blue-900",
    },
    {
      id: "customs",
      name: t("logisticBook.quickServices.customs.name", "Customs"),
      description: t("logisticBook.quickServices.customs.desc", "Import/export customs clearance"),
      category: "Customs" as const,
      isTrucking: false,
      icon: <FileCheck className="w-5 h-5 text-orange-600" />,
      color: "border-orange-200 bg-orange-50/60 hover:border-orange-400 text-orange-900",
    },
    {
      id: "trucking",
      name: t("logisticBook.quickServices.trucking.name", "Trucking"),
      description: t("logisticBook.quickServices.trucking.desc", "Pickup, delivery & container transport"),
      category: "Trucking" as const,
      isTrucking: true,
      icon: <Truck className="w-5 h-5 text-amber-600" />,
      color: "border-amber-200 bg-amber-50/60 hover:border-amber-400 text-amber-900",
    },
    {
      id: "storage",
      name: t("logisticBook.quickServices.storage.name", "Storage"),
      description: t("logisticBook.quickServices.storage.desc", "Warehouse & bonded storage"),
      category: "Storage" as const,
      isTrucking: false,
      icon: <Warehouse className="w-5 h-5 text-teal-600" />,
      color: "border-teal-200 bg-teal-50/60 hover:border-teal-400 text-teal-900",
    },
  ];

  const [step, setStep] = useState<Step>(0);
  const [orderType, setOrderType] = useState<"product" | "service" | "shipment" | null>(null);
  const [shipmentType, setShipmentType] = useState<ShipmentType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [editCartId, setEditCartId] = useState<string | null>(null);
  const { items: cartItems, addItem, removeItem, updateItem, clearCart, subtotal, tax, grandTotal } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateLogisticOrder();

  const authed = isAuthenticated();
  const { data: portalUser } = useGetPortalMe({
    query: { queryKey: ["portalMe"], enabled: authed },
    request: { credentials: "include" },
  });

  const [fromProduct, setFromProduct] = useState<{ name: string; qty: number; price: number; unit?: string } | null>(null);
  const [companyOrigin, setCompanyOrigin] = useState<CompanyOrigin | null>(null);
  const [productDims, setProductDims] = useState<Record<string, string>>({});

  const [productShipping, setProductShipping] = useState<{
    method: "darat" | "laut" | "udara";
    estimate: number | null;
    companyName: string;
    companyAddress: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("logistic_product_shipping");
      if (saved) setProductShipping(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Fetch company origin defaults (origin airport, port, city)
  useEffect(() => {
    fetch("/api/settings/company-pickup-address")
      .then(r => r.ok ? r.json() : null)
      .then((d: { companyName: string; companyAddress: string; originCity?: string; originAirport?: string; originPort?: string } | null) => {
        setCompanyOrigin(d?.companyAddress ? {
          name: d.companyName, address: d.companyAddress,
          originCity: d.originCity ?? COMPANY_CONFIG.originCity,
          originAirport: d.originAirport ?? COMPANY_CONFIG.originAirport,
          originPort: d.originPort ?? COMPANY_CONFIG.originPort,
        } : { name: COMPANY_CONFIG.brandName, address: COMPANY_CONFIG.pickupAddress, originCity: COMPANY_CONFIG.originCity, originAirport: COMPANY_CONFIG.originAirport, originPort: COMPANY_CONFIG.originPort });
      })
      .catch(() => setCompanyOrigin({ name: COMPANY_CONFIG.brandName, address: COMPANY_CONFIG.pickupAddress, originCity: COMPANY_CONFIG.originCity, originAirport: COMPANY_CONFIG.originAirport, originPort: COMPANY_CONFIG.originPort }));
  }, []);

  const [customerForm, setCustomerForm] = useState({
    companyName: "", customerName: "", email: "", phone: "",
    senderName: "",
    origin: "", destination: "", shippingAddress: "", commodity: "", cargoDescription: "",
    grossWeight: "", volumeCbm: "", jumlahKoli: "", requiredDate: "", notes: "",
    quantity: "", unit: "",
    namaPenerima: "", nomorPenerima: "",
    // [MULTI-MODE] transport mode fields
    transportMode: "",
    originDistrict: "", destDistrict: "",
    pickupDate: "", pickupTime: "", truckType: "",
    originPort: "", destPort: "", weightKg: "", incoterm: "",
    etd: "", eta: "",
  });
  const [estimation, setEstimation] = useState<{ estimated_price: number | null; disclaimer: string } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [paymentType, setPaymentType] = useState<"transfer" | "gateway" | "cod" | "invoice" | "">("");
  const [transferTerm, setTransferTerm] = useState<"full" | "termin" | "dp" | "">("");
  const [paymentTerm, setPaymentTerm] = useState<"net7" | "net14" | "net30" | "net60" | "">("");
  const [dpNext, setDpNext] = useState<"lunas-delivery" | "lunas-net30" | "lunas-net60" | "cicil" | "">("");
  const [bankInfo, setBankInfo] = useState<{ bankName: string; accountNumber: string; accountName: string; branch?: string; notes?: string } | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofObjectPath, setProofObjectPath] = useState<string>("");
  const [proofUploading, setProofUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [quickTrucking, setQuickTrucking] = useState<"detail" | "calculator" | null>(null);
  const [quickTruckData, setQuickTruckData] = useState<Record<string, string>>({});
  const [quickTruckEstimate, setQuickTruckEstimate] = useState<number | null>(null);
  const [quickEstimating, setQuickEstimating] = useState(false);
  const [quickDeliveryAddressError, setQuickDeliveryAddressError] = useState(false);
  const [confirmEditShipping, setConfirmEditShipping] = useState(false);

  // Fetch bank transfer info ketika user pilih Transfer Bank
  useEffect(() => {
    if (paymentType === "transfer" && !bankInfo) {
      fetch("/api/settings/bank-transfer-info")
        .then(r => r.ok ? r.json() : null)
        .then((d: { bankName: string; accountNumber: string; accountName: string; branch?: string; notes?: string } | null) => {
          if (d) setBankInfo(d);
        })
        .catch(() => {});
    }
  }, [paymentType, bankInfo]);

  async function uploadProof(file: File) {
    setProofUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/portal/payment-proof-upload", { method: "POST", body: form });
      const json = await r.json() as { objectPath?: string; message?: string };
      if (!r.ok) throw new Error(json.message ?? t("logisticBook.toast.uploadFailed", "Upload gagal"));
      setProofObjectPath(json.objectPath ?? "");
      setProofUploaded(true);
      toast({ title: t("logisticBook.toast.proofUploaded", "Bukti pembayaran berhasil diunggah ✓") });
    } catch (err) {
      toast({ title: t("logisticBook.toast.uploadError", "Gagal mengunggah bukti"), description: String(err), variant: "destructive" });
    } finally {
      setProofUploading(false);
    }
  }

  // Persist orderType + shipmentType to localStorage whenever they change
  useEffect(() => {
    try {
      if (orderType) {
        localStorage.setItem(DRAFT_META_KEY, JSON.stringify({ orderType, shipmentType }));
      }
    } catch { /* ignore */ }
  }, [orderType, shipmentType]);

  function clearDraft() {
    clearCart();
    try { localStorage.removeItem(DRAFT_META_KEY); } catch { /* ignore */ }
    setStep(0);
    setShipmentType(null);
    setSelectedCategory(null);
    setSelectedItem(null);
    toast({ title: t("logisticBook.toast.draftDeleted", "Draft dihapus"), description: t("logisticBook.toast.draftDeletedDesc", "Mulai pemesanan baru dari awal.") });
  }

  // Pre-fill form with logged-in user's profile data (only once, when data loads)
  useEffect(() => {
    if (!portalUser) return;
    setCustomerForm((prev) => ({
      ...prev,
      email:        prev.email        || (portalUser.email        ?? ""),
      customerName: prev.customerName || (portalUser.name         ?? ""),
      companyName:  prev.companyName  || (portalUser.company      ?? ""),
      phone:        prev.phone        || (portalUser.phone        ?? ""),
    }));
  }, [portalUser]);

  // Auto-populate origin/destination + transport mode + trucking cargo fields from cart items' inputData
  useEffect(() => {
    if (cartItems.length === 0) return;
    const deriveOrigin = cartItems
      .map((c) => String(c.inputData?.pickupCity || c.inputData?.originAirport || c.inputData?.originPort || ""))
      .find(Boolean) ?? "";
    const deriveDestination = cartItems
      .map((c) => String(c.inputData?.destCity || c.inputData?.destinationAirport || c.inputData?.destinationPort || ""))
      .find(Boolean) ?? "";
    const truckingData = cartItems.find(c => c.calculatorType === "trucking")?.inputData;
    const deriveGrossWeight  = truckingData?.gross_weight_kg  ? String(truckingData.gross_weight_kg)  : "";
    const deriveVolumeCbm    = truckingData?.total_volume_m3  ? String(truckingData.total_volume_m3)  : "";
    const koli_from_trucking = truckingData?.koli_qty ? String(truckingData.koli_qty) : "";
    const koli_from_other    = !koli_from_trucking
      ? (cartItems.find(c => ["air_freight","sea_fcl","sea_lcl"].includes(c.calculatorType))?.inputData?.quantity
          ? String(cartItems.find(c => ["air_freight","sea_fcl","sea_lcl"].includes(c.calculatorType))?.inputData?.quantity)
          : "")
      : "";
    const deriveJumlahKoli   = koli_from_trucking || koli_from_other;
    const hasShipmentItem    = cartItems.some(c => ["trucking","air_freight","sea_fcl","sea_lcl"].includes(c.calculatorType));
    const deriveNamaPenerima  = truckingData?.receiver_name  ? String(truckingData.receiver_name)  : "";
    const deriveNomorPenerima = truckingData?.receiver_phone ? String(truckingData.receiver_phone) : "";
    // Derive transport mode from cart service types
    const hasTrucking  = cartItems.some(c => c.calculatorType === "trucking");
    const hasAir       = cartItems.some(c => c.calculatorType === "air_freight");
    const hasSea       = cartItems.some(c => c.calculatorType === "sea_fcl" || c.calculatorType === "sea_lcl");
    const deriveMode   = hasTrucking ? "TRUCKING" : hasAir ? "AIR_FREIGHT" : hasSea ? "SEA_FREIGHT" : "";
    // Derive port/airport from cart
    const airItem = cartItems.find(c => c.calculatorType === "air_freight")?.inputData;
    const seaItem = cartItems.find(c => c.calculatorType === "sea_fcl" || c.calculatorType === "sea_lcl")?.inputData;
    const deriveOriginPort = airItem?.originAirport ? String(airItem.originAirport) : seaItem?.originPort ? String(seaItem.originPort) : "";
    const deriveDestPort   = airItem?.destinationAirport ? String(airItem.destinationAirport) : seaItem?.destinationPort ? String(seaItem.destinationPort) : "";
    const deriveOriginDistrict = truckingData?.pickupCity ? String(truckingData.pickupCity) : "";
    const deriveDestDistrict   = truckingData?.destCity   ? String(truckingData.destCity)   : "";
    setCustomerForm((prev) => ({
      ...prev,
      origin:          prev.origin         || deriveOrigin,
      destination:     prev.destination    || deriveDestination,
      shippingAddress: prev.shippingAddress || (hasShipmentItem ? deriveDestination : prev.shippingAddress),
      grossWeight:     prev.grossWeight    || deriveGrossWeight,
      volumeCbm:       prev.volumeCbm      || deriveVolumeCbm,
      jumlahKoli:      prev.jumlahKoli     || deriveJumlahKoli,
      namaPenerima:    prev.namaPenerima   || deriveNamaPenerima,
      nomorPenerima:   prev.nomorPenerima  || deriveNomorPenerima,
      transportMode:   prev.transportMode  || deriveMode,
      originPort:      prev.originPort     || deriveOriginPort,
      destPort:        prev.destPort       || deriveDestPort,
      originDistrict:  prev.originDistrict || deriveOriginDistrict,
      destDistrict:    prev.destDistrict   || deriveDestDistrict,
    }));

    // Parse payment_type from trucking cart inputData and populate payment state
    const rawPayment = truckingData?.payment_type ? String(truckingData.payment_type) : "";
    if (rawPayment && !paymentType) {
      if (rawPayment === "payment_gateway") {
        setPaymentType("gateway");
      } else if (rawPayment.startsWith("transfer")) {
        setPaymentType("transfer");
        const parts = rawPayment.split(":");
        // parts: ["transfer"] | ["transfer","full"] | ["transfer","termin","net7"] | ["transfer","dp","lunas-delivery"]
        const term = parts[1] as "full" | "termin" | "dp" | undefined;
        if (term) setTransferTerm(term);
        if (term === "termin" && parts[2]) {
          setPaymentTerm(parts[2] as "net7" | "net14" | "net30" | "net60");
        } else if (term === "dp" && parts[2]) {
          setDpNext(parts[2] as "lunas-delivery" | "lunas-net30" | "lunas-net60" | "cicil");
        }
      }
    }
  }, [cartItems]);

  // [MULTI-MODE] Auto-fetch price estimation when mode + origin + destination are filled
  useEffect(() => {
    const { transportMode, origin, destination } = customerForm;
    if (!transportMode || !origin || !destination) { setEstimation(null); return; }
    setEstimating(true);
    const params = new URLSearchParams({ transport_mode: transportMode, origin, dest: destination });
    if (customerForm.truckType) params.set("truck_type", customerForm.truckType);
    fetch(`/api/logistic/orders/estimate-price?${params.toString()}`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("fetch failed")))
      .then((d: { estimated_price: number | null; disclaimer: string }) => setEstimation(d))
      .catch(() => setEstimation(null))
      .finally(() => setEstimating(false));
  }, [customerForm.transportMode, customerForm.origin, customerForm.destination, customerForm.truckType]);

  const itemsByCategory = useMemo(() =>
    (cat: ServiceCategory) => SERVICE_ITEMS.filter((i) => i.category === cat),
    []
  );

  // Read URL params on mount: ?commodity=&productId=&qty=&productPrice=&unit=&service=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const commodity = params.get("commodity");
    const productId = params.get("productId");
    const qty = parseInt(params.get("qty") ?? "1", 10) || 1;
    const productPrice = parseFloat(params.get("productPrice") ?? "0") || 0;
    const unit = params.get("unit") ?? undefined;

    // Fetch product weight/dims for auto-fill in CalculatorForm
    if (productId) {
      fetch(`/api/ecommerce/products/${productId}`)
        .then(r => r.ok ? r.json() : null)
        .then((p: { weightKg?: number | null; lengthCm?: number | null; widthCm?: number | null; heightCm?: number | null; goodsType?: string | null } | null) => {
          if (!p) return;
          const dims: Record<string, string> = {};
          if (p.weightKg != null) dims.grossWeight = String(p.weightKg);
          if (p.lengthCm != null) dims.length = String(p.lengthCm);
          if (p.widthCm != null) dims.width = String(p.widthCm);
          if (p.heightCm != null) dims.height = String(p.heightCm);
          if (p.goodsType) {
            dims.goodsType = p.goodsType;
            setQuickTruckData(prev => ({ ...prev, goodsType: prev.goodsType || p.goodsType! }));
          }
          if (Object.keys(dims).length > 0) setProductDims(dims);
        })
        .catch(() => {});
    }

    if (commodity) {
      setFromProduct({ name: commodity, qty, price: productPrice, unit });
      setCustomerForm((prev) => ({
        ...prev,
        commodity,
        quantity: String(qty),
        unit: unit ?? prev.unit,
      }));
      // Auto-add product as cart item (always, even without a fixed price)
      const alreadyInCart = cartItems.some(
        (c) => c.calculatorType === "product" && c.serviceName === commodity
      );
      if (!alreadyInCart) {
        addItem({
          category: "Produk",
          serviceName: commodity,
          calculatorType: "product",
          inputData: { qty, price: productPrice, unit: unit ?? "" },
          calculationResult: { total: (productPrice * qty).toFixed(2) },
          subtotal: productPrice * qty,
        });
      }
      setOrderType("product");
    }

    const serviceId = params.get("service");
    if (serviceId) {
      const found = SERVICE_ITEMS.find((i) => i.id === serviceId);
      if (found) {
        setSelectedItem(found);
        setSelectedCategory(found.category);
        setStep(1);
      } else if (commodity) {
        // service not found but product present → go to service selection
        setStep(1);
      }
    } else if (commodity) {
      // From product page without specific service
      if (params.get("step") === "2") {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (params.get("step") === "3" && cartItems.length > 0) {
      // Direct to Data Pemesan from CartDrawer checkout button
      try {
        const meta = localStorage.getItem(DRAFT_META_KEY);
        if (meta) {
          const parsed = JSON.parse(meta) as { orderType?: string; shipmentType?: ShipmentType };
          if (parsed.orderType) setOrderType(parsed.orderType as any);
          if (parsed.shipmentType) setShipmentType(parsed.shipmentType);
        }
      } catch { /* ignore */ }
      // Auto-detect orderType from cart items if not saved
      const allProduct = cartItems.every(c => c.calculatorType === "product");
      if (allProduct) setOrderType("product");
      setStep(3);
    } else if (cartItems.length > 0) {
      // Restore draft: jump to Ringkasan and restore orderType+shipmentType if saved
      try {
        const meta = localStorage.getItem(DRAFT_META_KEY);
        if (meta) {
          const parsed = JSON.parse(meta) as { orderType?: string; shipmentType?: ShipmentType };
          if (parsed.orderType) setOrderType(parsed.orderType as any);
          if (parsed.shipmentType) setShipmentType(parsed.shipmentType);
        }
      } catch { /* ignore */ }
      setStep(2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShipmentSelect(type: ShipmentType) {
    setOrderType("shipment");
    setShipmentType(type);
    setStep(1);
  }

  function handleCategorySelect(cat: ServiceCategory) {
    setSelectedCategory(cat);
    setSelectedItem(null);
  }

  function handleItemSelect(item: ServiceItem) {
    setSelectedItem(item);
  }

  function handleAddToCart(data: Omit<CartItem, "cartId">) {
    addItem(data);
    setSelectedItem(null);
  }

  function handleSubmit() {
    const { companyName, customerName, email, phone, origin, destination, shippingAddress } = customerForm;
    if (!customerName.trim()) {
      toast({ title: t("logisticBook.toast.picRequired", "Nama PIC wajib diisi"), variant: "destructive" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: t("logisticBook.toast.invalidEmail", "Format email tidak valid"), variant: "destructive" });
      return;
    }
    if (!phone.trim()) {
      toast({ title: t("logisticBook.toast.phoneRequired", "Nomor telepon / WhatsApp wajib diisi"), variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: t("logisticBook.toast.addMinOneItem", "Tambahkan minimal 1 item ke pesanan"), variant: "destructive" });
      return;
    }
    const truckingItem = cartItems.find(c => c.calculatorType === "trucking");
    const truckingItemData = (truckingItem?.inputData ?? {}) as Record<string, unknown>;
    if (truckingItem && !String(truckingItemData.destCity ?? "").trim()) {
      toast({ title: t("logisticBook.toast.truckingDestRequired", "Alamat Pengiriman wajib diisi pada item Trucking"), variant: "destructive" });
      return;
    }
    const hasProductOnly = cartItems.every(c => c.calculatorType === "product");
    const truckingInputData = (truckingItem?.inputData ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (v ? String(v) : "");
    const derivedOrderType: "product" | "service" | "shipment" | null = orderType ?? (
      cartItems.every(c => c.calculatorType === "product") ? "product" :
      cartItems.every(c => c.calculatorType !== "trucking" && c.calculatorType !== "air_freight" && c.calculatorType !== "sea_fcl" && c.calculatorType !== "sea_lcl") && cartItems.some(c => c.calculatorType !== "product") ? "service" :
      "shipment"
    );
    // For product-only orders, use company address as origin and shipping address as destination
    const productOnlyOrigin = hasProductOnly ? (productShipping?.companyAddress || companyOrigin?.address || "") : "";
    const effectiveOrigin = hasProductOnly ? productOnlyOrigin : ((derivedOrderType === "service") ? (origin || "") : origin);
    const effectiveDestination = derivedOrderType === "product"
      ? (shippingAddress || destination || "")
      : (derivedOrderType === "service" ? (destination || "") : destination);
    // Derive transport mode from productShipping for product-only orders
    const productTransportMode = hasProductOnly && productShipping
      ? (productShipping.method === "darat" ? "TRUCKING" : productShipping.method === "laut" ? "SEA_FREIGHT" : "AIR_FREIGHT")
      : customerForm.transportMode;
    const productShipmentType = hasProductOnly && productShipping
      ? (productShipping.method === "darat" ? "Trucking" : productShipping.method === "laut" ? "Sea LCL" : "Air Freight")
      : (shipmentType ?? "");
    createOrder.mutate({ data: {
      companyName,
      customerName,
      email,
      phone,
      orderType: derivedOrderType ?? undefined,
      shipmentType: productShipmentType || (shipmentType ?? ""),
      origin: effectiveOrigin,
      destination: effectiveDestination,
      commodity: customerForm.commodity || str(truckingInputData.cargo_category) || null,
      cargoDescription: customerForm.cargoDescription || null,
      grossWeight: parseFloat(customerForm.grossWeight) || null,
      volumeCbm: parseFloat(customerForm.volumeCbm) || null,
      jumlahKoli: parseInt(customerForm.jumlahKoli, 10) || null,
      requiredDate: customerForm.requiredDate || null,
      notes: [
        customerForm.quantity ? `Qty: ${customerForm.quantity}${customerForm.unit ? ` ${customerForm.unit}` : ""}` : "",
        str(truckingInputData.notes),
        customerForm.notes,
      ].filter(Boolean).join(" | ") || null,
      senderName: customerForm.senderName || null,
      namaPenerima: customerForm.namaPenerima || null,
      nomorPenerima: customerForm.nomorPenerima || null,
      jamOrder: str(truckingInputData.pickupTime) || null,
      // [MULTI-MODE] transport mode fields
      ...(({
        ...(productTransportMode ? { transportMode: productTransportMode } : {}),
        originDistrict: customerForm.originDistrict || undefined,
        destDistrict: customerForm.destDistrict || undefined,
        pickupDate: customerForm.pickupDate || str(truckingInputData.pickupDate) || undefined,
        pickupTime: customerForm.pickupTime || str(truckingInputData.pickupTime) || undefined,
        truckType: customerForm.truckType || str(truckingInputData.vehicleType) || undefined,
        originPort: customerForm.originPort || undefined,
        destPort: customerForm.destPort || undefined,
        weightKg: customerForm.weightKg ? parseFloat(customerForm.weightKg) : undefined,
        incoterm: customerForm.incoterm || undefined,
        etd: customerForm.etd || undefined,
        eta: customerForm.eta || undefined,
      }) as Record<string, unknown>),
      paymentMethod: paymentType === "gateway" ? "payment_gateway"
        : paymentType === "transfer" ? "transfer"
        : paymentType === "cod" ? "cod"
        : paymentType === "invoice" ? "invoice"
        : null,
      paymentType: paymentType === "gateway" ? "payment_gateway"
        : paymentType === "cod" ? "cod"
        : paymentType === "invoice" ? (paymentTerm ? `invoice:${paymentTerm}` : "invoice")
        : paymentType === "transfer"
        ? transferTerm === "full"
          ? "transfer:full"
          : transferTerm === "termin" && paymentTerm
          ? `transfer:termin:${paymentTerm}`
          : transferTerm === "dp" && dpNext
          ? `transfer:dp:${dpNext}`
          : "transfer"
        : null,
      subtotal,
      tax,
      grandTotal,
      items: cartItems.map((c) => ({
        category: c.category,
        serviceName: c.serviceName,
        calculatorType: c.calculatorType,
        inputData: c.inputData,
        calculationResult: c.calculationResult,
        subtotal: c.subtotal,
        itemSource: c.itemSource ?? "manual",
        vendorCatalogItemId: c.vendorCatalogItemId ?? null,
        vendorId: c.vendorId ?? null,
        serviceType: c.serviceType ?? null,
        priceSnapshot: c.priceSnapshot ?? null,
        calculationInput: c.calculationInput ?? null,
        templateSnapshot: c.templateSnapshot ?? (c.inputData?.templateSnapshot as Record<string, unknown> | null | undefined) ?? null,
      })),
    }}, {
      onSuccess: (data: unknown) => {
        localStorage.setItem("last_order", JSON.stringify(data));
        localStorage.removeItem("logistic_cart");
        try { localStorage.removeItem(DRAFT_META_KEY); } catch { /* ignore */ }
        if (proofObjectPath) {
          const orderNum = (data as { orderNumber?: string })?.orderNumber;
          if (orderNum) {
            fetch(`/api/logistic/orders/${orderNum}/payment-proof`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ proofUrl: proofObjectPath }),
            }).catch(() => {});
          }
          localStorage.setItem("last_order_proof_uploaded", "1");
        } else {
          localStorage.removeItem("last_order_proof_uploaded");
        }
        setLocation("/logistic-order-success");
      },
      onError: () => {
        toast({ title: t("logisticBook.toast.saveFailed", "Gagal menyimpan pesanan"), variant: "destructive" });
      },
    });
  }

  const stepContent = () => {
    // Step 0: Order Type Selection
    if (step === 0) {
      const ORDER_TYPES = [
        {
          type: "product" as const,
          icon: Package,
          title: t("logisticBook.orderType.product.title", "Produk"),
          desc: t("logisticBook.orderType.product.desc", "Pesan produk dari katalog. Shipment opsional, bisa pickup sendiri."),
          badge: t("logisticBook.orderType.product.badge", "Tanpa logistik"),
          color: "border-emerald-500 bg-emerald-50",
          iconColor: "text-emerald-600",
          badgeColor: "bg-emerald-100 text-emerald-700",
        },
        {
          type: "service" as const,
          icon: FileCheck,
          title: t("logisticBook.orderType.service.title", "Layanan Jasa"),
          desc: t("logisticBook.orderType.service.desc", "Customs, handling, storage, konsultasi, maintenance, dan lainnya."),
          badge: t("logisticBook.orderType.service.badge", "Non-shipment"),
          color: "border-violet-500 bg-violet-50",
          iconColor: "text-violet-600",
          badgeColor: "bg-violet-100 text-violet-700",
        },
        {
          type: "shipment" as const,
          icon: Ship,
          title: t("logisticBook.orderType.shipment.title", "Pengiriman Logistik"),
          desc: t("logisticBook.orderType.shipment.desc", "Trucking, air freight, sea freight, export/import."),
          badge: t("logisticBook.orderType.shipment.badge", "Butuh detail rute"),
          color: "border-blue-500 bg-blue-50",
          iconColor: "text-blue-600",
          badgeColor: "bg-blue-100 text-blue-700",
        },
      ];
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t("logisticBook.step0.title", "Jenis Pesanan")}</h2>
            <p className="text-sm text-muted-foreground">{t("logisticBook.step0.subtitle", "Pilih jenis pesanan untuk melanjutkan")}</p>
          </div>
          <div className="space-y-3">
            {ORDER_TYPES.map(({ type, icon: Icon, title, desc, badge, color, iconColor, badgeColor }) => (
              <button
                key={type}
                onClick={() => {
                  setOrderType(type);
                  if (type === "product") {
                    setShipmentType(null);
                    setStep(cartItems.length > 0 ? 3 : 2);
                  } else if (type === "service") {
                    setShipmentType(null);
                    setStep(1);
                  }
                  // For shipment: stay here, show sub-selector below
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  orderType === type ? color : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${orderType === type ? "bg-white/70" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${orderType === type ? iconColor : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-foreground text-sm">{title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeColor}`}>{badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Sub-selector: Shipment Type — tampil saat orderType = shipment */}
          {orderType === "shipment" && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-foreground">{t("logisticBook.step0.selectShipmentType", "Pilih Tipe Pengiriman:")}</p>
              <div className="grid grid-cols-2 gap-3">
                {SHIPMENT_TYPES.map(({ type, description, icon }) => {
                  const Icon = ICON_MAP[icon] || Package;
                  return (
                    <button
                      key={type}
                      onClick={() => handleShipmentSelect(type)}
                      className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        shipmentType === type
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-7 h-7 text-accent mb-2" />
                      <p className="font-bold text-foreground text-xs mb-0.5">{type}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Step 1: Category & Item selection
    if (step === 1) {
      // ── Quick Trucking Form ───────────────────────────────────────────────
      if (quickTrucking !== null) return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setQuickTrucking(null); setQuickTruckData({}); setQuickTruckEstimate(null); }}
              className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("logisticBook.trucking.title", "Layanan Trucking")}</h2>
                <p className="text-sm text-muted-foreground">{t("logisticBook.trucking.subtitle", "Isi detail atau hitung estimasi biaya")}</p>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {(["detail", "calculator"] as const).map(mode => (
              <button key={mode} onClick={() => setQuickTrucking(mode)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${quickTrucking === mode ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {mode === "detail"
                  ? <><MapPin className="w-4 h-4" /> {t("logisticBook.trucking.tabDetail", "Form Pickup & Delivery")}</>
                  : <><Calculator className="w-4 h-4" /> {t("logisticBook.trucking.tabCalc", "Kalkulator Estimasi")}</>}
              </button>
            ))}
          </div>

          {/* ── Detail Form ── */}
          {quickTrucking === "detail" && (
            <div className="bg-muted/30 rounded-xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs">{t("logisticBook.trucking.pickupAddress", "Alamat Pickup")} <span className="text-destructive">*</span></Label>
                  <GooglePlacesAutocomplete
                    value={quickTruckData.pickupAddress || ""}
                    onChange={v => setQuickTruckData(p => ({ ...p, pickupAddress: v }))}
                    placeholder={t("logisticBook.trucking.pickupAddressPlaceholder", "Jl. ..., Kota, Provinsi")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">{t("logisticBook.trucking.deliveryAddress", "Alamat Pengiriman")} <span className="text-destructive">*</span></Label>
                  <GooglePlacesAutocomplete
                    value={quickTruckData.deliveryAddress || ""}
                    onChange={v => { setQuickDeliveryAddressError(false); setQuickTruckData(p => ({ ...p, deliveryAddress: v })); }}
                    placeholder={t("logisticBook.trucking.deliveryAddressPlaceholder", "Jl. ..., Kota, Provinsi")}
                    className={quickDeliveryAddressError ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {quickDeliveryAddressError && <p className="text-[11px] text-destructive mt-1">{t("logisticBook.trucking.deliveryAddressRequired", "Alamat pengiriman wajib diisi.")}</p>}
                </div>
                {(quickTruckData.pickupAddress || quickTruckData.deliveryAddress) && (
                  <div className="sm:col-span-2">
                    <RouteMapPreview
                      origin={quickTruckData.pickupAddress || ""}
                      destination={quickTruckData.deliveryAddress || ""}
                    />
                  </div>
                )}
                <div>
                  <Label className="text-xs">{t("logisticBook.trucking.contactName", "Nama Kontak")}</Label>
                  <Input placeholder={t("logisticBook.trucking.contactNamePlaceholder", "Nama PIC")} value={quickTruckData.contactName||""} onChange={e => setQuickTruckData(p => ({ ...p, contactName: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{t("logisticBook.trucking.contactPhone", "No. Telepon")}</Label>
                  <Input type="tel" placeholder="08xxxxxxxxxx" value={quickTruckData.contactPhone||""} onChange={e => setQuickTruckData(p => ({ ...p, contactPhone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">{t("logisticBook.trucking.notesOptional", "Catatan (opsional)")}</Label>
                  <Textarea rows={2} placeholder={t("logisticBook.trucking.notesPlaceholder", "Instruksi khusus untuk tim pengiriman...")} value={quickTruckData.notes||""} onChange={e => setQuickTruckData(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                💡 {t("logisticBook.trucking.estimateNote", "Estimasi biaya akan dikonfirmasi oleh tim setelah pesanan masuk.")}
              </div>
              <Separator />
              <Button className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  if (!quickTruckData.deliveryAddress?.trim()) {
                    setQuickDeliveryAddressError(true);
                    toast({ title: t("logisticBook.toast.deliveryAddressRequired", "Alamat Pengiriman wajib diisi"), variant: "destructive" });
                    return;
                  }
                  addItem({ category: "Trucking", serviceName: "Trucking — Pickup & Delivery",
                    calculatorType: "trucking",
                    inputData: { pickupCity: quickTruckData.pickupAddress, destCity: quickTruckData.deliveryAddress,
                      vehicleType: "CDD", pickupDate: quickTruckData.pickupDate, pickupTime: quickTruckData.pickupTime,
                      receiver_name: quickTruckData.contactName, receiver_phone: quickTruckData.contactPhone,
                      notes: quickTruckData.notes },
                    calculationResult: {}, subtotal: 0 });
                  toast({ title: t("logisticBook.toast.truckingAdded", "Trucking ditambahkan ke pesanan") });
                  setQuickTrucking(null); setQuickTruckData({}); setQuickTruckEstimate(null);
                  setQuickDeliveryAddressError(false);
                  setStep(2);
                }}>
                <Plus className="w-4 h-4 mr-2" /> {t("logisticBook.btn.addToOrder2", "Tambahkan ke Pesanan")}
              </Button>
            </div>
          )}

          {/* ── Kalkulator Mode ── */}
          {quickTrucking === "calculator" && (
            <div className="bg-muted/30 rounded-xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {t("logisticBook.form.originCity", "Kota Asal")} <span className="text-destructive">*</span></Label>
                  <CityAutocompleteInput type="city" placeholder={t("logisticBook.form.searchOriginCity", "Cari kota asal...")} value={quickTruckData.pickupCity||""} onChange={v => setQuickTruckData(p => ({ ...p, pickupCity: v }))} />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {t("logisticBook.form.destinationCity", "Kota Tujuan")} <span className="text-destructive">*</span></Label>
                  <CityAutocompleteInput type="city" placeholder={t("logisticBook.form.searchDestCity", "Cari kota tujuan...")} value={quickTruckData.destCity||""} onChange={v => setQuickTruckData(p => ({ ...p, destCity: v }))} />
                </div>
                <div>
                  <Label className="text-xs">{t("logisticBook.form.weightKg", "Berat (kg)")} <span className="text-destructive">*</span></Label>
                  <Input type="number" min={0} placeholder="100" value={quickTruckData.weight||""} onChange={e => setQuickTruckData(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{t("logisticBook.form.goodsType", "Jenis Barang")}</Label>
                  <Select value={quickTruckData.goodsType||undefined} onValueChange={v => setQuickTruckData(p => ({ ...p, goodsType: v }))}>
                    <SelectTrigger><SelectValue placeholder={t("logisticBook.form.selectGoodsType", "Pilih jenis")} /></SelectTrigger>
                    <SelectContent>{GOODS_TYPES_BOOK.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs block mb-1.5">{t("logisticBook.form.dimensionsCm", "Dimensi (cm) — P × L × T")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" min={0} placeholder={t("logisticBook.form.panjang", "Panjang")} value={quickTruckData.length||""} onChange={e => setQuickTruckData(p => ({ ...p, length: e.target.value }))} />
                    <Input type="number" min={0} placeholder={t("logisticBook.form.lebar", "Lebar")} value={quickTruckData.width||""}  onChange={e => setQuickTruckData(p => ({ ...p, width:  e.target.value }))} />
                    <Input type="number" min={0} placeholder={t("logisticBook.form.tinggi", "Tinggi")} value={quickTruckData.height||""} onChange={e => setQuickTruckData(p => ({ ...p, height: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">{t("logisticBook.form.incoterms", "Incoterms")}</Label>
                  <Select value={quickTruckData.incoterms||"FOB"} onValueChange={v => setQuickTruckData(p => ({ ...p, incoterms: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{INCOTERMS_BOOK.map(t2 => <SelectItem key={t2} value={t2}>{t2}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{t("logisticBook.form.vehicleTypeId", "Jenis Kendaraan")}</Label>
                  <Select value={quickTruckData.vehicleType||undefined} onValueChange={v => setQuickTruckData(p => ({ ...p, vehicleType: v }))}>
                    <SelectTrigger><SelectValue placeholder={t("logisticBook.form.selectVehicleId", "Pilih kendaraan")} /></SelectTrigger>
                    <SelectContent>{["CDE","CDD","Fuso","Wingbox","Trailer"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
                disabled={!quickTruckData.pickupCity || !quickTruckData.destCity || !quickTruckData.weight || quickEstimating}
                onClick={() => {
                  setQuickEstimating(true);
                  const params = new URLSearchParams({ transport_mode: "TRUCKING" });
                  if (quickTruckData.vehicleType) params.set("truck_type", quickTruckData.vehicleType);
                  if (quickTruckData.pickupCity)  params.set("origin", quickTruckData.pickupCity);
                  if (quickTruckData.destCity)    params.set("dest", quickTruckData.destCity);
                  fetch(`/api/logistic/orders/estimate-price?${params}`)
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then((d: { estimated_price: number | null }) => {
                      if (d.estimated_price && d.estimated_price > 0) {
                        setQuickTruckEstimate(d.estimated_price);
                      } else {
                        const w = parseFloat(quickTruckData.weight)||0;
                        const l = parseFloat(quickTruckData.length)||0;
                        const wi = parseFloat(quickTruckData.width)||0;
                        const h = parseFloat(quickTruckData.height)||0;
                        const volW = (l && wi && h) ? (l*wi*h)/4000 : 0;
                        setQuickTruckEstimate(Math.max(150_000, Math.round(Math.max(w, volW)*2_500)));
                      }
                    })
                    .catch(() => {
                      const w = parseFloat(quickTruckData.weight)||0;
                      setQuickTruckEstimate(Math.max(150_000, Math.round(w*2_500)));
                    })
                    .finally(() => setQuickEstimating(false));
                }}>
                {quickEstimating
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("logisticBook.trucking.calculating", "Menghitung...")}</>
                  : <><Calculator className="w-4 h-4 mr-2" /> {t("logisticBook.trucking.calculateEstimate", "Hitung Estimasi")}</>}
              </Button>

              {quickTruckEstimate !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-emerald-600 font-medium">{t("logisticBook.trucking.estimateCost", "Estimasi Biaya Trucking")}</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(quickTruckEstimate)}</p>
                  <p className="text-xs text-emerald-500">{quickTruckData.pickupCity} → {quickTruckData.destCity} · {quickTruckData.weight} kg</p>
                  <p className="text-[10px] text-muted-foreground">{t("logisticBook.trucking.estimateDisclaimer", "*Estimasi indikatif. Biaya final dikonfirmasi tim logistik.")}</p>
                </div>
              )}

              <Separator />
              <Button className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!quickTruckData.pickupCity || !quickTruckData.destCity || !quickTruckData.weight}
                onClick={() => {
                  addItem({ category: "Trucking", serviceName: "Trucking — Kargo",
                    calculatorType: "trucking",
                    inputData: { ...quickTruckData },
                    calculationResult: quickTruckEstimate ? { estimated_price: quickTruckEstimate } : {},
                    subtotal: 0 });
                  toast({ title: t("logisticBook.toast.truckingAdded", "Trucking ditambahkan ke pesanan") });
                  setQuickTrucking(null); setQuickTruckData({}); setQuickTruckEstimate(null);
                  setStep(2);
                }}>
                {quickTruckEstimate ? t("logisticBook.btn.addToOrder2", "Tambahkan ke Pesanan") : t("logisticBook.btn.addPriceTBD", "Tambahkan (Harga Menyusul)")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      );

      // ── Normal Category / Item flow ───────────────────────────────────────
      return (
        <div className="space-y-4">
          {!selectedItem ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {!selectedCategory ? t("logisticBook.step1.selectService", "Pilih Layanan") : selectedCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {!selectedCategory ? t("logisticBook.step1.selectServiceDesc", "Pilih layanan logistik untuk Anda") : t("logisticBook.step1.selectItemDesc", "Pilih item layanan untuk kalkulasi estimasi biaya")}
                </p>
              </div>

              {!selectedCategory ? (
                <>
                  {/* ── Quick Service Cards ── */}
                  <div className="grid grid-cols-2 gap-3">
                    {QUICK_SERVICES.map(svc => (
                      <button key={svc.id}
                        onClick={() => {
                          if (svc.isTrucking) {
                            setQuickTrucking("detail");
                            setQuickTruckData({});
                            setQuickTruckEstimate(null);
                          } else {
                            setSelectedCategory(svc.category);
                          }
                        }}
                        className={`border-2 rounded-xl p-4 text-left transition-all hover:shadow-md ${svc.color}`}>
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 shrink-0">{svc.icon}</div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{svc.name}</p>
                            <p className="text-xs opacity-70 mt-0.5 leading-snug">{svc.description}</p>
                            {svc.isTrucking && (
                              <span className="inline-block mt-1.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                                {t("logisticBook.step1.calculatorAvailable", "Kalkulator tersedia")}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("logisticBook.step1.allCategories", "Semua Kategori")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = ICON_MAP[cat.icon] || Package;
                      const count = itemsByCategory(cat.name).length;
                      return (
                        <button key={cat.name} onClick={() => handleCategorySelect(cat.name)}
                          className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                                <Badge variant="secondary" className="text-xs">{count} items</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{cat.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ChevronLeft className="w-4 h-4" /> {t("logisticBook.step1.allServices", "Semua Layanan")}
                  </button>
                  <div className="space-y-2">
                    {itemsByCategory(selectedCategory).map((item) => (
                      <button key={item.id} onClick={() => handleItemSelect(item)}
                        className="w-full text-left p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Calculator className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <CalculatorForm
              item={selectedItem}
              onAdd={(data) => { handleAddToCart(data); setStep(2); }}
              onBack={() => setSelectedItem(null)}
              transportMode={customerForm.transportMode}
              truckType={customerForm.truckType}
              origin={customerForm.origin}
              destination={customerForm.destination}
              companyOrigin={companyOrigin ?? undefined}
              initialState={Object.keys(productDims).length > 0 ? productDims : undefined}
            />
          )}
        </div>
      );
    }

    // Step 2: Cart
    if (step === 2) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t("logisticBook.step2.title", "Ringkasan Pesanan")}</h2>
            <p className="text-sm text-muted-foreground">{cartItems.length} {t("logisticBook.step2.servicesSelected", "layanan dipilih")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3 mr-1" /> {t("logisticBook.btn.deleteDraft", "Hapus Draft")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              <Plus className="w-3 h-3 mr-1" /> {t("logisticBook.btn.addService", "Tambah Layanan")}
            </Button>
          </div>
        </div>


        {cartItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{t("logisticBook.step2.emptyCart", "Keranjang kosong")}</p>
            <p className="text-sm mt-1">{t("logisticBook.step2.emptyCartDesc", "Tambahkan layanan dari step sebelumnya")}</p>
            <Button className="mt-4" onClick={() => setStep(1)}>{t("logisticBook.step1.selectService", "Pilih Layanan")}</Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-primary/20">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wide">{t("logisticBook.step2.oneOrder", "1 Pesanan")}</span>
                <span className="text-xs text-primary/70">— {t("logisticBook.step2.oneOrderDesc", "semua layanan di bawah diproses dalam satu paket")}</span>
              </div>
              <div className="p-3 space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={item.cartId}>
                    {idx > 0 && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ml-2">
                          <span className="text-[10px] font-bold text-muted-foreground">+</span>
                        </div>
                        <div className="flex-1 border-t border-dashed border-border" />
                      </div>
                    )}
                    <div className={`bg-card border rounded-lg p-4 ${item.itemSource === "vendor_catalog_item" ? "border-purple-200 bg-purple-50/30" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1 mb-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            {item.itemSource === "vendor_catalog_item" && (
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5">{t("logisticBook.vendorMarketplace", "Vendor Marketplace")}</span>
                            )}
                          </div>
                          <p className="font-semibold text-foreground text-sm">{item.serviceName}</p>
                          {item.itemSource === "vendor_catalog_item" && item.vendorName && (
                            <p className="text-xs text-purple-600 mt-0.5 font-medium">by {item.vendorName}</p>
                          )}
                          <dl className="mt-2 space-y-1">
                            {getServiceDetailRows(item.calculatorType, item.itemSource === "vendor_catalog_item" ? { ...item.inputData, itemSource: "vendor_catalog_item", serviceType: item.serviceType } : item.inputData, t).map(({ label, value }) => (
                              <div key={label} className="flex gap-2 text-xs leading-relaxed">
                                <dt className="font-medium text-foreground shrink-0 w-28">{label}</dt>
                                <dd className="text-muted-foreground">{value}</dd>
                              </div>
                            ))}
                          </dl>
                          {item.itemSource === "vendor_catalog_item" && item.priceSnapshot && (
                            <div className="mt-2 text-xs text-muted-foreground bg-white/60 border border-purple-100 rounded px-2 py-1 space-y-0.5">
                              <span className="font-medium text-purple-700">{t("logisticBook.unitPrice", "Harga satuan")}: </span>
                              <span>{formatCurrency(item.priceSnapshot.priceSell)} / {item.priceSnapshot.unit}</span>
                              {item.tax != null && item.tax > 0 && (
                                <span className="block">PPN 11%: +{formatCurrency(item.tax)}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {item.itemSource === "vendor_catalog_item"
                            ? item.total != null && item.total > 0
                              ? (
                                <div className="text-right">
                                  <span className="font-bold text-purple-700 text-sm">{formatCurrency(item.total)}</span>
                                  <p className="text-[10px] text-muted-foreground">{t("logisticBook.inclTax", "incl. PPN")}</p>
                                </div>
                              )
                              : <span className="font-bold text-accent text-sm">{formatCurrency(item.subtotal)}</span>
                            : item.calculatorType === "trucking"
                              ? <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">{t("logisticBook.priceTBD", "Harga menyusul")}</span>
                              : item.subtotal > 0
                                ? <span className="font-bold text-accent text-sm">{formatCurrency(item.subtotal)}</span>
                                : <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">{t("logisticBook.priceNego", "Harga nego")}</span>
                          }
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/40 rounded-lg border border-border p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("logisticBook.step2.orderDetails", "Rincian Pesanan")}</p>
              {cartItems.map((item) => (
                <div key={item.cartId} className="flex justify-between text-sm gap-2">
                  <span className="text-foreground font-medium min-w-0 truncate">{item.serviceName}</span>
                  <span className="font-medium shrink-0">
                    {item.calculatorType === "trucking"
                      ? <span className="text-blue-600 text-xs font-semibold">{t("logisticBook.priceTBD", "Harga menyusul")}</span>
                      : item.subtotal > 0 ? formatCurrency(item.subtotal) : <span className="text-amber-600 text-xs">{t("logisticBook.priceNego", "Harga nego")}</span>}
                  </span>
                </div>
              ))}
              {grandTotal > 0 ? (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN 11%</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground">{t("logisticBook.totalEstimate", "Total Estimasi")}</span>
                    <span className="font-bold text-accent text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {t("logisticBook.estimateDisclaimer", "Ini adalah estimasi harga. Penawaran final akan dikonfirmasi oleh tim kami.")}
                  </p>
                </>
              ) : (
                <>
                  <Separator />
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 space-y-0.5">
                    <p className="font-semibold">{t("logisticBook.vendorPriceTitle", "Harga Akan Diberikan oleh Vendor")}</p>
                    <p>{t("logisticBook.vendorPriceDesc", "Setelah pesanan diterima, vendor akan membalas dengan penawaran harga untuk Anda.")}</p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );

    // Step 3: Customer Form
    if (step === 3) {
      const f = customerForm;
      const set = (k: string, v: string) => setCustomerForm((p) => ({ ...p, [k]: v }));
      const isProductOrder = orderType === "product";
      const isServiceOrder = orderType === "service";
      const hasShipmentInCart = cartItems.some(c =>
        ["trucking","air_freight","sea_fcl","sea_lcl"].includes(c.calculatorType)
      );
      const hasProductOnly = cartItems.every(c => c.calculatorType === "product") && cartItems.length > 0;
      const hasLogisticService = !isProductOrder && hasShipmentInCart;
      const hasOriginDest = !isProductOrder && !isServiceOrder && cartItems.some(c =>
        c.inputData?.pickupCity || c.inputData?.originAirport || c.inputData?.originPort ||
        c.inputData?.destCity   || c.inputData?.destinationAirport || c.inputData?.destinationPort
      );

      const SHIPPING_LABEL: Record<string, string> = {
        darat: t("logisticBook.shipping.darat", "Pengiriman Darat (Trucking)"),
        laut: t("logisticBook.shipping.laut", "Pengiriman Laut (Sea Freight)"),
        udara: t("logisticBook.shipping.udara", "Pengiriman Udara (Air Freight)"),
      };
      const SHIPPING_ICON: Record<string, React.ReactElement> = {
        darat: <Truck className="w-5 h-5 text-orange-600" />,
        laut: <Ship className="w-5 h-5 text-blue-600" />,
        udara: <Plane className="w-5 h-5 text-sky-600" />,
      };

      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t("logisticBook.step3.title", "Data Pemesan")}</h2>
            <p className="text-sm text-muted-foreground">{t("logisticBook.step3.subtitle", "Lengkapi data untuk konfirmasi pesanan")}</p>
          </div>

          {/* ── Ringkasan Pengiriman (hanya untuk product-only order) ── */}
          {hasProductOnly && productShipping && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-white">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {SHIPPING_ICON[productShipping.method]}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t("logisticBook.step3.shippingMethod", "Metode Pengiriman")}</p>
                  <p className="text-sm font-semibold text-slate-900">{SHIPPING_LABEL[productShipping.method]}</p>
                </div>
                {productShipping.estimate ? (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">{t("logisticBook.estimate", "Estimasi")}</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(productShipping.estimate)}</p>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">{t("logisticBook.step3.perRoute", "Sesuai rute")}</span>
                )}
              </div>
            </div>
          )}

          {/* ── Group 1: Data Perusahaan ─────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> {t("logisticBook.step3.companyData", "Data Perusahaan")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">{t("logisticBook.step3.companyName", "Nama Perusahaan")}</Label>
                <Input placeholder="PT. ..." value={f.companyName} onChange={e => set("companyName", e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">{t("logisticBook.step3.picName", "Nama PIC")} <span className="text-destructive">*</span></Label>
                <Input placeholder={t("logisticBook.step3.picNamePlaceholder", "Nama lengkap")} value={f.customerName} onChange={e => set("customerName", e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">{t("logisticBook.step3.senderName", "Nama Pengirim")}</Label>
                <Input placeholder={t("logisticBook.step3.senderNamePlaceholder", "Nama pengirim barang (opsional)")} value={f.senderName} onChange={e => set("senderName", e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">{t("logisticBook.step3.email", "Email")} <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="email@perusahaan.com" value={f.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">{t("logisticBook.step3.phone", "Telepon / WhatsApp")} <span className="text-destructive">*</span></Label>
                <Input placeholder="+62..." value={f.phone} onChange={e => set("phone", e.target.value)} />
              </div>

              {/* ── Mode Pengiriman — hanya tampil jika ada layanan logistik ─── */}
              {hasLogisticService && (
                <div className="col-span-2">
                  <Label className="text-xs">{t("logisticBook.step3.transportMode", "Mode Pengiriman")}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={f.transportMode}
                    onChange={e => set("transportMode", e.target.value)}
                  >
                    <option value="">-- {t("logisticBook.step3.selectModeOptional", "Pilih Mode (opsional)")} --</option>
                    <option value="TRUCKING">🚛 Trucking / Darat</option>
                    <option value="AIR_FREIGHT">✈️ Air Freight / Udara</option>
                    <option value="SEA_FREIGHT">🚢 Sea Freight / Laut</option>
                    <option value="FOB">📦 FOB (Free On Board)</option>
                  </select>
                </div>
              )}

              {/* ── Trucking-specific fields ─── */}
              {hasLogisticService && f.transportMode === "TRUCKING" && (<>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.originCityDistrict", "Kota Asal (Kecamatan)")}</Label>
                  <Input placeholder="Cakung, Jakarta Timur" value={f.originDistrict} onChange={e => set("originDistrict", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.destCityDistrict", "Kota Tujuan (Kecamatan)")}</Label>
                  <Input placeholder="Rungkut, Surabaya" value={f.destDistrict} onChange={e => set("destDistrict", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">{t("logisticBook.step3.truckUnit", "Tipe Unit / Armada")}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={f.truckType}
                    onChange={e => set("truckType", e.target.value)}
                  >
                    <option value="">-- {t("logisticBook.step3.selectType", "Pilih Tipe")} --</option>
                    <option value="CDD">CDD</option>
                    <option value="CDD Long">CDD Long</option>
                    <option value="CDE">CDE</option>
                    <option value="Fuso">Fuso</option>
                    <option value="Tronton">Tronton</option>
                    <option value="Trailer 20ft">Trailer 20ft</option>
                    <option value="Trailer 40ft">Trailer 40ft</option>
                    <option value="Pickup Box">Pickup Box</option>
                  </select>
                </div>
              </>)}

              {/* ── Air/Sea-specific fields ─── */}
              {hasLogisticService && (f.transportMode === "AIR_FREIGHT" || f.transportMode === "SEA_FREIGHT") && (<>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs flex items-center gap-1">
                    {f.transportMode === "AIR_FREIGHT" ? t("logisticBook.form.originAirport", "Bandara") : t("logisticBook.form.originPort", "Pelabuhan")} {t("logisticBook.step3.origin", "Asal")}
                    <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("logisticBook.auto", "Otomatis")}</span>
                  </Label>
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="text-sm text-slate-800 font-medium">
                      {f.transportMode === "AIR_FREIGHT"
                        ? (f.originPort || companyOrigin?.originAirport || "CGK")
                        : (f.originPort || companyOrigin?.originPort || "Tanjung Priok, Jakarta")}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{f.transportMode === "AIR_FREIGHT" ? t("logisticBook.form.originAirport", "Bandara") : t("logisticBook.form.originPort", "Pelabuhan")} {t("logisticBook.step3.dest", "Tujuan")}</Label>
                  <Input placeholder={f.transportMode === "AIR_FREIGHT" ? "SUB / Juanda" : "Tanjung Perak"} value={f.destPort} onChange={e => set("destPort", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.cargoWeight", "Berat Kargo (kg)")}</Label>
                  <Input type="number" placeholder="500" value={f.weightKg} onChange={e => set("weightKg", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.incoterm", "Incoterm")}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={f.incoterm}
                    onChange={e => set("incoterm", e.target.value)}
                  >
                    <option value="">-- {t("logisticBook.step3.select", "Pilih")} --</option>
                    <option value="EXW">EXW</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="DAP">DAP</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.etd", "ETD (Keberangkatan)")}</Label>
                  <Input type="date" value={f.etd} onChange={e => set("etd", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.eta", "ETA (Tiba Tujuan)")}</Label>
                  <Input type="date" value={f.eta} onChange={e => set("eta", e.target.value)} />
                </div>
              </>)}

              {/* ── Alamat Tujuan Pengiriman — tampil untuk semua product order ─── */}
              {isProductOrder && (
                <div className="col-span-2">
                  <Label className="text-xs">
                    {t("logisticBook.step3.shippingAddress", "Alamat Tujuan Pengiriman")}
                    <span className="text-muted-foreground font-normal"> ({t("logisticBook.step3.shippingAddressOptional", "opsional — kosongkan jika ambil sendiri")})</span>
                  </Label>
                  <Input
                    placeholder={t("logisticBook.step3.shippingAddressPlaceholder", "Jl. ..., Kota, Provinsi — kosongkan jika ambil sendiri di gudang")}
                    value={f.shippingAddress}
                    onChange={e => set("shippingAddress", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">{t("logisticBook.step3.shippingAddressHint", "Masukkan alamat tujuan pengiriman, atau kosongkan jika barang akan diambil sendiri.")}</p>
                </div>
              )}

              {/* ── Asal & Tujuan Pengiriman — hanya tampil jika ada data dari layanan ─── */}
              {hasOriginDest && (<>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.originShipping", "Asal Pengiriman")}</Label>
                  <Input placeholder="Jakarta" value={f.origin} onChange={e => set("origin", e.target.value)} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.destShipping", "Tujuan Pengiriman")}</Label>
                  <Input placeholder="Surabaya" value={f.destination} onChange={e => set("destination", e.target.value)} />
                </div>
              </>)}

              {/* ── Jumlah Koli — sembunyikan untuk product order tanpa shipment ─── */}
              {(!isProductOrder || hasShipmentInCart) && (
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">{t("logisticBook.step3.jumlahKoli", "Jumlah Koli")} <span className="text-muted-foreground font-normal">(pcs/koli)</span></Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t("logisticBook.step3.jumlahKoliPlaceholder", "Contoh: 10")}
                    value={f.jumlahKoli}
                    onChange={e => set("jumlahKoli", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isProductOrder && hasShipmentInCart
                      ? t("logisticBook.step3.jumlahKoliAutoFill", "Terisi otomatis dari data layanan shipment.")
                      : t("logisticBook.step3.jumlahKoliDesc", "Total jumlah koli / kotak / karton")}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <Label className="text-xs">{t("logisticBook.step3.additionalNotes", "Catatan Tambahan")}</Label>
                <Textarea placeholder={t("logisticBook.step3.additionalNotesPlaceholder", "Informasi tambahan untuk tim kami...")} value={f.notes} onChange={e => set("notes", e.target.value)} rows={3} />
              </div>

              {/* ── Estimasi Harga ─── */}
              {f.transportMode && (
                <div className="col-span-2">
                  {estimating && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t("logisticBook.step3.calculatingEstimate", "Menghitung estimasi harga...")}
                    </div>
                  )}
                  {!estimating && estimation && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{t("logisticBook.step3.priceEstimate", "Estimasi Harga")}</p>
                      {estimation.estimated_price != null ? (
                        <p className="text-lg font-bold text-emerald-800">
                          Rp {Math.round(estimation.estimated_price).toLocaleString("id-ID")}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">{t("logisticBook.step3.estimateNotAvailable", "Estimasi tidak tersedia — harga akan dikonfirmasi admin")}</p>
                      )}
                      <p className="text-[11px] text-slate-400">{estimation.disclaimer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Detail Pemesanan ────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-accent" /> {t("logisticBook.step3.orderDetail", "Detail Pemesanan")}
            </h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.cartId} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-[10px] mb-1">{item.category}</Badge>
                      <p className="font-semibold text-foreground text-sm">{item.serviceName}</p>
                      <dl className="mt-1.5 space-y-0.5">
                        {getServiceDetailRows(item.calculatorType, item.inputData, t).map(({ label, value }) => (
                          <div key={label} className="flex gap-2 text-xs">
                            <dt className="text-muted-foreground shrink-0 w-24">{label}</dt>
                            <dd className="font-medium text-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="text-right shrink-0">
                      {item.subtotal > 0
                        ? <span className="font-bold text-accent text-sm">{formatCurrency(item.subtotal)}</span>
                        : <span className="text-amber-600 text-xs font-medium">{t("logisticBook.priceNego", "Harga nego")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-sm text-foreground">{t("logisticBook.totalEstimate", "Total Estimasi")}</span>
              <span className="font-bold text-accent text-base">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      );
    }

    // ── Step 4: Pembayaran ───────────────────────────────────────────────
    if (step === 4) {
      const hasProductOnly = cartItems.every(c => c.calculatorType === "product") && cartItems.length > 0;
      const shippingEstimate = hasProductOnly && productShipping?.estimate ? productShipping.estimate : 0;
      const totalWithShipping = grandTotal + shippingEstimate;

      const PAYMENT_METHODS = [
        {
          id: "gateway" as const,
          icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
          label: t("logisticBook.payment.gateway.label", "Payment Gateway"),
          desc: t("logisticBook.payment.gateway.desc", "Bayar online sekarang"),
          badge: t("logisticBook.payment.gateway.badge", "Cepat & Aman"),
          badgeColor: "bg-emerald-100 text-emerald-700",
        },
        {
          id: "transfer" as const,
          icon: <Building2 className="w-5 h-5 text-blue-600" />,
          label: t("logisticBook.payment.transfer.label", "Transfer Bank"),
          desc: t("logisticBook.payment.transfer.desc", "Transfer ke rekening kami"),
          badge: null,
          badgeColor: "",
        },
        {
          id: "cod" as const,
          icon: <Banknote className="w-5 h-5 text-orange-600" />,
          label: t("logisticBook.payment.cod.label", "COD / Tunai"),
          desc: t("logisticBook.payment.cod.desc", "Bayar saat pengiriman"),
          badge: null,
          badgeColor: "",
        },
        {
          id: "invoice" as const,
          icon: <Receipt className="w-5 h-5 text-purple-600" />,
          label: t("logisticBook.payment.invoice.label", "Invoice / Net Terms"),
          desc: t("logisticBook.payment.invoice.desc", "Tagihan setelah selesai"),
          badge: null,
          badgeColor: "",
        },
      ];

      const TRANSFER_TERMS = [
        { id: "full" as const, label: t("logisticBook.payment.transferTerms.full.label", "Pembayaran Penuh"), desc: t("logisticBook.payment.transferTerms.full.desc", "Bayar seluruh tagihan di muka") },
        { id: "dp"   as const, label: t("logisticBook.payment.transferTerms.dp.label", "DP + Pelunasan"),  desc: t("logisticBook.payment.transferTerms.dp.desc", "Down payment, sisa dibayar kemudian") },
        { id: "termin" as const, label: t("logisticBook.payment.transferTerms.termin.label", "Termin / Cicilan"), desc: t("logisticBook.payment.transferTerms.termin.desc", "Bayar dalam beberapa tahap") },
      ];
      const NET_TERMS = [
        { id: "net7" as const, label: t("logisticBook.payment.netTerms.net7", "Net 7 hari") },
        { id: "net14" as const, label: t("logisticBook.payment.netTerms.net14", "Net 14 hari") },
        { id: "net30" as const, label: t("logisticBook.payment.netTerms.net30", "Net 30 hari") },
        { id: "net60" as const, label: t("logisticBook.payment.netTerms.net60", "Net 60 hari") },
      ];
      const DP_TERMS = [
        { id: "lunas-delivery" as const, label: t("logisticBook.payment.dpTerms.lunasDelivery", "Lunas saat pengiriman") },
        { id: "lunas-net30"   as const, label: t("logisticBook.payment.dpTerms.lunasNet30", "Lunas Net 30 hari") },
        { id: "lunas-net60"   as const, label: t("logisticBook.payment.dpTerms.lunasNet60", "Lunas Net 60 hari") },
        { id: "cicil"         as const, label: t("logisticBook.payment.dpTerms.cicil", "Cicilan") },
      ];

      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t("logisticBook.step4.title", "Metode Pembayaran")}</h2>
            <p className="text-sm text-muted-foreground">{t("logisticBook.step4.subtitle", "Pilih cara pembayaran yang Anda inginkan")}</p>
          </div>

          {/* Method cards */}
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setPaymentType(m.id);
                  setTransferTerm("");
                  setPaymentTerm("");
                  setDpNext("");
                }}
                className={`rounded-xl border-2 p-4 flex flex-col gap-2.5 text-left transition-all ${
                  paymentType === m.id
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-border hover:border-accent/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    {m.icon}
                  </div>
                  {paymentType === m.id && (
                    <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-foreground leading-tight">{m.label}</p>
                    {m.badge && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Transfer Bank sub-options */}
          {paymentType === "transfer" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-100/60 border-b border-blue-200">
                <p className="text-sm font-semibold text-blue-900">{t("logisticBook.payment.selectTransferScheme", "Pilih Skema Transfer")}</p>
              </div>
              <div className="p-4 space-y-2">
                {TRANSFER_TERMS.map(tt => (
                  <button
                    key={tt.id}
                    onClick={() => { setTransferTerm(tt.id); setPaymentTerm(""); setDpNext(""); }}
                    className={`w-full rounded-lg border px-4 py-3 flex items-center gap-3 text-left transition-all ${
                      transferTerm === tt.id ? "border-blue-400 bg-white shadow-sm" : "border-blue-200 hover:bg-white/80"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      transferTerm === tt.id ? "border-blue-500" : "border-slate-400"
                    }`}>
                      {transferTerm === tt.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tt.label}</p>
                      <p className="text-xs text-muted-foreground">{tt.desc}</p>
                    </div>
                  </button>
                ))}

                {/* Termin sub-options */}
                {transferTerm === "termin" && (
                  <div className="ml-7 pt-1 grid grid-cols-2 gap-2">
                    {NET_TERMS.map(nt => (
                      <button
                        key={nt.id}
                        onClick={() => setPaymentTerm(nt.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                          paymentTerm === nt.id
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-blue-200 hover:bg-blue-100 text-foreground"
                        }`}
                      >{nt.label}</button>
                    ))}
                  </div>
                )}

                {/* DP sub-options */}
                {transferTerm === "dp" && (
                  <div className="ml-7 pt-1 space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("logisticBook.payment.repaymentSchedule", "Jadwal Pelunasan")}:</p>
                    {DP_TERMS.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDpNext(d.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all ${
                          dpNext === d.id
                            ? "border-blue-400 bg-white shadow-sm font-semibold text-blue-900"
                            : "border-blue-200 hover:bg-white/80"
                        }`}
                      >{d.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Transfer Info + Bukti Upload */}
          {paymentType === "transfer" && (
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-100/70 border-b border-blue-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <p className="text-sm font-semibold text-blue-900">{t("logisticBook.payment.bankInfo", "Informasi Rekening Tujuan")}</p>
              </div>
              {bankInfo ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground font-medium">{t("logisticBook.payment.bank", "Bank")}</span>
                    <span className="font-bold text-foreground">{bankInfo.bankName}</span>
                    <span className="text-muted-foreground font-medium">{t("logisticBook.payment.accountNumber", "No. Rekening")}</span>
                    <span className="font-bold text-foreground tracking-widest">{bankInfo.accountNumber}</span>
                    <span className="text-muted-foreground font-medium">{t("logisticBook.payment.accountName", "Atas Nama")}</span>
                    <span className="font-semibold text-foreground">{bankInfo.accountName}</span>
                    {bankInfo.branch && <>
                      <span className="text-muted-foreground font-medium">{t("logisticBook.payment.branch", "Cabang")}</span>
                      <span className="text-foreground">{bankInfo.branch}</span>
                    </>}
                  </div>
                  {bankInfo.notes && (
                    <p className="text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">{bankInfo.notes}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  {t("logisticBook.payment.loadingBank", "Memuat info rekening…")}
                </div>
              )}

              {/* Upload Bukti Pembayaran */}
              <div className="border-t border-blue-200 px-4 py-4 space-y-3">
                <p className="text-sm font-semibold text-blue-900">{t("logisticBook.payment.uploadProof", "Upload Bukti Transfer")} <span className="text-xs font-normal text-muted-foreground">({t("logisticBook.payment.uploadProofOptional", "opsional, bisa dilakukan setelah konfirmasi")})</span></p>
                {proofUploaded ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-semibold text-emerald-800">{t("logisticBook.toast.proofUploaded", "Bukti pembayaran berhasil diunggah ✓")}</p>
                    <button
                      className="ml-auto text-xs text-muted-foreground underline"
                      onClick={() => { setProofUploaded(false); setProofObjectPath(""); setProofFile(null); }}
                    >{t("logisticBook.payment.changeProof", "Ganti")}</button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all px-4 py-5 ${
                    proofFile ? "border-blue-400 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setProofFile(f);
                        await uploadProof(f);
                      }}
                    />
                    {proofUploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-blue-700">{t("logisticBook.payment.uploading", "Mengunggah…")}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-blue-400" />
                        <p className="text-xs text-center text-muted-foreground">
                          {proofFile ? proofFile.name : t("logisticBook.payment.uploadHint", "Klik untuk pilih file (JPG, PNG, PDF, maks. 10 MB)")}
                        </p>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          )}

          {/* COD info */}
          {paymentType === "cod" && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-orange-600 shrink-0" />
                <p className="font-semibold text-sm text-orange-900">{t("logisticBook.payment.codTitle", "Bayar Saat Pengiriman")}</p>
              </div>
              <p className="text-xs text-orange-700">
                {t("logisticBook.payment.codDesc", "Siapkan pembayaran tunai atau transfer instan saat kurir tiba. Nominal final dikonfirmasi tim kami setelah pesanan diproses.")}
              </p>
            </div>
          )}

          {/* Invoice / Net Terms */}
          {paymentType === "invoice" && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 overflow-hidden">
              <div className="px-4 py-2.5 bg-purple-100/60 border-b border-purple-200">
                <p className="text-sm font-semibold text-purple-900">{t("logisticBook.payment.selectInvoiceTerm", "Pilih Jangka Waktu Invoice")}</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {NET_TERMS.map(nt => (
                  <button
                    key={nt.id}
                    onClick={() => setPaymentTerm(nt.id)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${
                      paymentTerm === nt.id
                        ? "border-purple-500 bg-purple-500 text-white"
                        : "border-purple-200 hover:bg-purple-100 text-foreground"
                    }`}
                  >{nt.label}</button>
                ))}
              </div>
              <p className="px-4 pb-3 text-xs text-purple-700">{t("logisticBook.payment.invoiceNote", "Tagihan dikirim ke email setelah pekerjaan selesai. Tersedia untuk pelanggan dengan credit terms yang disetujui.")}</p>
            </div>
          )}

          {/* Total summary */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm text-foreground">{t("logisticBook.totalEstimate", "Total Estimasi")}</span>
            <span className="font-bold text-accent text-base">{formatCurrency(totalWithShipping)}</span>
          </div>
        </div>
      );
    }

    // ── Step 5: Konfirmasi & Review ──────────────────────────────────────
    if (step === 5) {
      const hasProductOnly = cartItems.every(c => c.calculatorType === "product") && cartItems.length > 0;

      const SHIPPING_LABEL: Record<string, string> = {
        darat: t("logisticBook.shipping.daratShort", "Darat (Trucking)"),
        laut: t("logisticBook.shipping.lautShort", "Laut (Sea Freight)"),
        udara: t("logisticBook.shipping.udaraShort", "Udara (Air Freight)"),
      };
      const SHIPPING_ICON: Record<string, React.ReactElement> = {
        darat: <Truck className="w-5 h-5 text-orange-600" />,
        laut: <Ship className="w-5 h-5 text-blue-600" />,
        udara: <Plane className="w-5 h-5 text-sky-600" />,
      };
      const SHIPPING_METHODS = [
        { id: "darat" as const, label: t("logisticBook.shipping.daratLabel", "Darat"), icon: <Truck className="w-5 h-5 text-orange-600" />, desc: "Trucking" },
        { id: "laut"  as const, label: t("logisticBook.shipping.lautLabel", "Laut"),  icon: <Ship  className="w-5 h-5 text-blue-600"   />, desc: "Sea Freight" },
        { id: "udara" as const, label: t("logisticBook.shipping.udaraLabel", "Udara"), icon: <Plane className="w-5 h-5 text-sky-600"    />, desc: "Air Freight" },
      ];

      function handleQtyChange(item: CartItem, delta: number) {
        const curQty = Number(item.inputData?.qty ?? 1);
        const newQty = curQty + delta;
        if (newQty <= 0) { removeItem(item.cartId); return; }
        const price = Number(item.inputData?.price ?? 0);
        updateItem(item.cartId, { inputData: { ...item.inputData, qty: newQty }, subtotal: price * newQty });
      }

      function handleChangeShipping(method: "darat" | "laut" | "udara") {
        const updated = {
          method,
          estimate: method === "darat" ? (productShipping?.estimate ?? null) : null,
          companyName: productShipping?.companyName ?? companyOrigin?.name ?? "",
          companyAddress: productShipping?.companyAddress ?? companyOrigin?.address ?? "",
        };
        setProductShipping(updated);
        try { localStorage.setItem("logistic_product_shipping", JSON.stringify(updated)); } catch { /* ignore */ }
        setConfirmEditShipping(false);
      }

      const shippingEstimate = hasProductOnly && productShipping?.estimate ? productShipping.estimate : 0;
      const totalWithShipping = grandTotal + shippingEstimate;

      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t("logisticBook.step5.title", "Konfirmasi Pesanan")}</h2>
            <p className="text-sm text-muted-foreground">{t("logisticBook.step5.subtitle", "Periksa kembali sebelum submit")}</p>
          </div>

          {/* Section 1 — Produk & Layanan */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t("logisticBook.step5.productsAndServices", "Produk & Layanan")}</span>
              <Badge variant="secondary" className="ml-auto text-xs">{cartItems.length} item</Badge>
            </div>
            <div className="divide-y divide-border">
              {cartItems.map(item => {
                const isProduct = item.calculatorType === "product";
                const qty = Number(item.inputData?.qty ?? 1);
                return (
                  <div key={item.cartId} className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-[10px] mb-1">{item.category}</Badge>
                      <p className="font-semibold text-sm text-foreground">{item.serviceName}</p>
                      {!isProduct && (
                        <dl className="mt-1 space-y-0.5">
                          {getServiceDetailRows(item.calculatorType, item.inputData, t).map(({ label, value }) => (
                            <div key={label} className="flex gap-2 text-xs">
                              <dt className="text-muted-foreground w-24 shrink-0">{label}</dt>
                              <dd className="font-medium text-foreground">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {isProduct && (
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground text-base leading-none"
                            onClick={() => handleQtyChange(item, -1)}
                          >−</button>
                          <span className="w-8 text-center text-sm font-bold">{qty}</span>
                          <button
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground text-base leading-none"
                            onClick={() => handleQtyChange(item, +1)}
                          >+</button>
                        </div>
                      )}
                      <span className="text-sm font-bold text-accent">
                        {item.subtotal > 0
                          ? formatCurrency(item.subtotal)
                          : <span className="text-amber-600 text-xs font-medium">{t("logisticBook.priceNego", "Harga nego")}</span>}
                      </span>
                      <button
                        className="text-destructive/60 hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.cartId)}
                        title={t("logisticBook.step5.removeItem", "Hapus item")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2 — Metode Pengiriman (product-only) */}
          {hasProductOnly && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t("logisticBook.step5.shippingMethod", "Metode Pengiriman")}</span>
                <button
                  className="ml-auto text-xs text-accent font-medium hover:underline"
                  onClick={() => setConfirmEditShipping(p => !p)}
                >
                  {confirmEditShipping ? t("logisticBook.step5.cancel", "Batal") : t("logisticBook.step5.change", "Ubah")}
                </button>
              </div>
              {confirmEditShipping ? (
                <div className="p-4 grid grid-cols-3 gap-2">
                  {SHIPPING_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleChangeShipping(m.id)}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1.5 transition-all ${
                        productShipping?.method === m.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/40 hover:bg-muted/50"
                      }`}
                    >
                      {m.icon}
                      <span className="text-xs font-bold">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                    </button>
                  ))}
                </div>
              ) : productShipping ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {SHIPPING_ICON[productShipping.method]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{SHIPPING_LABEL[productShipping.method]}</p>
                      {productShipping.estimate
                        ? <p className="text-xs text-accent font-medium">{t("logisticBook.estimate", "Estimasi")}: {formatCurrency(productShipping.estimate)}</p>
                        : <p className="text-xs text-muted-foreground italic">{t("logisticBook.step5.pricePerRoute", "Harga sesuai rute")}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">{t("logisticBook.step5.sender", "Pengirim")}</p>
                      <p className="text-xs font-semibold text-slate-800">{productShipping.companyName}</p>
                      <p className="text-xs text-muted-foreground">{productShipping.companyAddress}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("logisticBook.step5.notYetChosen", "Belum dipilih.")}{" "}
                  <button className="text-accent underline" onClick={() => setConfirmEditShipping(true)}>{t("logisticBook.step5.chooseNow", "Pilih sekarang")}</button>
                </div>
              )}
            </div>
          )}

          {/* Section 3 — Data Pemesan */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{t("logisticBook.step5.ordererData", "Data Pemesan")}</span>
              <Button
                variant="ghost" size="sm"
                className="ml-auto h-7 text-xs gap-1 text-accent"
                onClick={() => setStep(3)}
              >
                <Edit2 className="w-3 h-3" /> {t("logisticBook.step5.edit", "Edit")}
              </Button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {([
                [t("logisticBook.step5.picName", "Nama PIC"), customerForm.customerName],
                [t("logisticBook.step5.company", "Perusahaan"), customerForm.companyName],
                [t("logisticBook.step5.senderName", "Nama Pengirim"), customerForm.senderName],
                [t("logisticBook.step5.email", "Email"), customerForm.email],
                [t("logisticBook.step5.phone", "Telepon"), customerForm.phone],
                ...(customerForm.shippingAddress ? [[t("logisticBook.step5.destAddress", "Alamat Tujuan"), customerForm.shippingAddress]] : []),
                ...(customerForm.notes ? [[t("logisticBook.step5.notes", "Catatan"), customerForm.notes]] : []),
              ] as [string, string][]).filter(([, v]) => !!v).map(([label, value]) => (
                <div key={label} className={label === t("logisticBook.step5.destAddress", "Alamat Tujuan") || label === t("logisticBook.step5.notes", "Catatan") ? "col-span-2" : ""}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-foreground break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 — Metode Pembayaran (read-only summary) */}
          {paymentType && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t("logisticBook.step5.paymentMethod", "Metode Pembayaran")}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1 text-accent" onClick={() => setStep(4)}>
                  <Edit2 className="w-3 h-3" /> {t("logisticBook.step5.changePayment", "Ubah")}
                </Button>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {paymentType === "gateway" ? `💳 ${t("logisticBook.payment.gateway.label", "Payment Gateway")}`
                    : paymentType === "transfer" ? `🏦 ${t("logisticBook.payment.transfer.label", "Transfer Bank")}`
                    : paymentType === "cod" ? `💵 ${t("logisticBook.payment.cod.label", "COD / Tunai")}`
                    : paymentType === "invoice" ? `📄 ${t("logisticBook.payment.invoice.label", "Invoice / Net Terms")}`
                    : paymentType}
                </p>
                {paymentType === "transfer" && transferTerm && (
                  <p className="text-xs text-muted-foreground">
                    {transferTerm === "full" ? t("logisticBook.payment.transferTerms.full.label", "Pembayaran Penuh")
                      : transferTerm === "dp" ? `${t("logisticBook.payment.transferTerms.dp.label", "DP + Pelunasan")}${dpNext ? ` (${dpNext.replace(/-/g," ")})` : ""}`
                      : transferTerm === "termin" ? `${t("logisticBook.payment.transferTerms.termin.label", "Termin / Cicilan")}${paymentTerm ? ` ${paymentTerm}` : ""}` : ""}
                  </p>
                )}
                {paymentType === "invoice" && paymentTerm && (
                  <p className="text-xs text-muted-foreground">{t("logisticBook.step5.dueDate", "Jatuh tempo")}: {paymentTerm.replace("net","Net ").replace("7","7 hari").replace("14","14 hari").replace("30","30 hari").replace("60","60 hari")}</p>
                )}
              </div>
            </div>
          )}

          {/* Section 5 — Total */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 space-y-2">
            {grandTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("logisticBook.step5.subtotalProductsServices", "Subtotal Produk & Layanan")}</span>
                <span className="font-medium">{formatCurrency(grandTotal)}</span>
              </div>
            )}
            {hasProductOnly && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("logisticBook.step5.shippingEstimate", "Estimasi Ongkos Kirim")}</span>
                {shippingEstimate > 0
                  ? <span className="font-medium">{formatCurrency(shippingEstimate)}</span>
                  : <span className="text-muted-foreground italic text-xs">{t("logisticBook.step5.confirmedAfterOrder", "Dikonfirmasi setelah order")}</span>}
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base">{t("logisticBook.totalEstimate", "Total Estimasi")}</span>
              <span className="font-bold text-lg text-accent">{formatCurrency(totalWithShipping)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{t("logisticBook.step5.finalPriceNote", "Harga final dikonfirmasi oleh tim kami setelah pesanan diterima.")}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (step === 0) return !!orderType && (orderType !== "shipment" || !!shipmentType);
    if (step === 1) return false;
    if (step === 2) return cartItems.length > 0;
    if (step === 3) return !!(
      customerForm.customerName.trim() &&
      customerForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim()) &&
      customerForm.phone.trim()
    );
    if (step === 4) {
      if (!paymentType) return false;
      if (paymentType === "transfer") return !!transferTerm && (transferTerm !== "termin" || !!paymentTerm) && (transferTerm !== "dp" || !!dpNext);
      return true;
    }
    if (step === 5) return !!(
      customerForm.customerName.trim() &&
      customerForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim()) &&
      customerForm.phone.trim()
    ) && cartItems.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo path="/book" />
      {/* Navbar */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ArrowLeft className="w-4 h-4" />
            {t("logisticBook.nav.booking", "Booking")}
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{cartItems.length}</span>
          </div>
        </div>
      </nav>

      {/* Stepper */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1">
            {STEPS.map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center gap-1.5 ${idx <= step ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                    idx < step ? "bg-accent text-accent-foreground" :
                    idx === step ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {idx < step ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${idx === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-border mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product banner — only show for commodity-only (no price) context */}
      {fromProduct && fromProduct.price <= 0 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">{t("logisticBook.banner.orderedProduct", "Produk yang dipesan")}</p>
              <p className="font-semibold text-amber-900 truncate">{fromProduct.name}</p>
              {fromProduct.unit && (
                <span className="inline-block text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium mt-0.5">{fromProduct.unit}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {stepContent()}

        {/* Navigation buttons — step 0 navigates via card clicks */}
        {step !== 1 && step !== 0 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={(step as number) === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {t("logisticBook.btn.back", "Kembali")}
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
              >
                {t("logisticBook.btn.continue", "Lanjutkan")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : step === 3 ? (
              <Button onClick={() => setStep(4)} disabled={!canProceed()}>
                {t("logisticBook.btn.selectPayment", "Pilih Pembayaran")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : step === 4 ? (
              <Button onClick={() => setStep(5)} disabled={!canProceed()}>
                {t("logisticBook.btn.reviewOrder", "Review Pesanan")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createOrder.isPending || !canProceed()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2"
              >
                {createOrder.isPending ? t("logisticBook.btn.saving", "Menyimpan...") : <><CheckCircle2 className="w-4 h-4" /> {t("logisticBook.btn.confirmSubmit", "Konfirmasi & Submit")}</>}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
