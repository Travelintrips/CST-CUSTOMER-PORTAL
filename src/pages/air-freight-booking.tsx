import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useLocation } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders, getAuthToken } from "@/lib/auth";
import { useGetPortalMe } from "@shared/api-client-react";
import {
  Plane, ArrowLeft, Plus, Trash2, Loader2,
  Weight, Package, CheckCircle2, MapPin, User,
  Calendar, Shield, ChevronRight, Info, Building2,
  FileText, LayoutList, Clock,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface DimRow {
  id: string;
  length: string;
  width: string;
  height: string;
  koli: string;
  gross_weight: string;
}

interface RateOption {
  rate_id: number;
  airline: string;
  rate_source_name: string;
  routing_type: string;
  transit_days: number | null;
  flight_number: string | null;
  etd: string | null;
  eta: string | null;
  service_mode: string;
  service_level: string;
  currency: string;
  rate_per_kg: number;
  weight_break: string;
  freight_base: number;
  fuel_surcharge: number;
  security_surcharge: number;
  fixed_fees: number;
  minimum_charge: number;
  total_estimate_idr: number;
}

interface EstimateResult {
  gross_weight: number;
  volumetric_weight: number;
  chargeable_weight: number;
  weight_break: string;
  options: RateOption[];
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const IDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number, d = 1) => n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: d });

function newRow(): DimRow {
  return { id: crypto.randomUUID(), length: "", width: "", height: "", koli: "1", gross_weight: "" };
}

const TRADE_TYPE_OPTS   = [{ v: "export", l: "Export" }, { v: "import", l: "Import" }, { v: "domestic", l: "Domestic" }];
const SERVICE_MODE_OPTS = [
  { v: "airport_to_airport", l: "Airport to Airport" },
  { v: "door_to_door",       l: "Door to Door" },
  { v: "door_to_airport",    l: "Door to Airport" },
  { v: "airport_to_door",    l: "Airport to Door" },
];
const SERVICE_LEVEL_OPTS = [{ v: "standard", l: "Standard" }, { v: "express", l: "Express" }, { v: "economy", l: "Economy" }];
const CARGO_TYPE_OPTS    = [
  { v: "general",    l: "General Cargo" },
  { v: "dg",         l: "Dangerous Goods (DG)" },
  { v: "perishable", l: "Perishable" },
  { v: "live_animal",l: "Live Animal" },
  { v: "valuable",   l: "Valuable" },
  { v: "oversize",   l: "Oversize" },
];
const INCOTERM_OPTS = [
  { v: "EXW", l: "EXW — Ex Works" },
  { v: "FCA", l: "FCA — Free Carrier" },
  { v: "FOB", l: "FOB — Free On Board" },
  { v: "CPT", l: "CPT — Carriage Paid To" },
  { v: "CIP", l: "CIP — Carriage & Insurance Paid" },
  { v: "CIF", l: "CIF — Cost Insurance Freight" },
  { v: "DAP", l: "DAP — Delivered at Place" },
  { v: "DPU", l: "DPU — Delivered at Place Unloaded" },
  { v: "DDP", l: "DDP — Delivered Duty Paid" },
];
const ADDITIONAL_SERVICES = [
  { id: "pickup",            labelKey: "airFreight.addonPickupLabel",    descKey: "airFreight.addonPickupDesc" },
  { id: "door_delivery",     labelKey: "airFreight.addonDoorLabel",      descKey: "airFreight.addonDoorDesc" },
  { id: "export_customs",    labelKey: "airFreight.addonExportLabel",    descKey: "airFreight.addonExportDesc" },
  { id: "import_customs",    labelKey: "airFreight.addonImportLabel",    descKey: "airFreight.addonImportDesc" },
  { id: "cargo_insurance",   labelKey: "airFreight.addonInsuranceLabel", descKey: "airFreight.addonInsuranceDesc" },
  { id: "dg_handling",       labelKey: "airFreight.addonDgLabel",        descKey: "airFreight.addonDgDesc" },
  { id: "temp_controlled",   labelKey: "airFreight.addonTempLabel",      descKey: "airFreight.addonTempDesc" },
];

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHead({ icon, title, step }: { icon: React.ReactNode; title: string; step?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {step != null && (
        <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
      )}
      <span className="text-sky-500 shrink-0">{icon}</span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function AirFreightBookingPage() {
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const { t }           = useLanguage();

  /* Route */
  const [originCity,    setOriginCity]    = useState("Jakarta");
  const [originAirport, setOriginAirport] = useState("CGK");
  const [destCity,      setDestCity]      = useState("");
  const [destAirport,   setDestAirport]   = useState("");
  const [tradeType,     setTradeType]     = useState("export");
  const [serviceMode,   setServiceMode]   = useState("airport_to_airport");
  const [serviceLevel,  setServiceLevel]  = useState("standard");
  const [cargoType,     setCargoType]     = useState("general");
  const [incoterm,      setIncoterm]      = useState("EXW");

  /* Cargo */
  const [rows,      setRows]      = useState<DimRow[]>([newRow()]);
  const [commodity, setCommodity] = useState("");

  /* Estimate */
  const [estimate,     setEstimate]     = useState<EstimateResult | null>(null);
  const [estimating,   setEstimating]   = useState(false);
  const [selectedRate, setSelectedRate] = useState<RateOption | null>(null);

  /* Schedule */
  const [pickupDate,         setPickupDate]         = useState("");
  const [preferredFlightDate,setPreferredFlightDate] = useState("");
  const [targetArrivalDate,  setTargetArrivalDate]  = useState("");

  /* Additional services */
  const [addSvc, setAddSvc] = useState<string[]>([]);
  const toggleSvc = (id: string) =>
    setAddSvc(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  /* Contact */
  const [custName,    setCustName]    = useState("");
  const [custCompany, setCustCompany] = useState("");
  const [custPhone,   setCustPhone]   = useState("");
  const [custEmail,   setCustEmail]   = useState("");
  const [notes,       setNotes]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState<{ orderNumber: string } | null>(null);

  /* Pre-fill from auth */
  const token = getAuthToken();
  const { data: me } = useGetPortalMe({
    query: { queryKey: ["portalMe", token], enabled: !!token },
    request: { headers: getAuthHeaders(), credentials: "include" },
  });
  if (me && !custName)  setCustName(me.name  ?? "");
  if (me && !custEmail) setCustEmail(me.email ?? "");
  if (me && !custPhone) setCustPhone((me as any).phone ?? "");

  /* Weight calc */
  const totalGross = rows.reduce((s, r) => s + (parseFloat(r.gross_weight) || 0), 0);
  const totalVol   = rows.reduce((s, r) => {
    const l = parseFloat(r.length) || 0, w = parseFloat(r.width) || 0;
    const h = parseFloat(r.height) || 0, k = parseInt(r.koli)   || 1;
    return s + (l * w * h * k) / 1_000_000 * 167;
  }, 0);
  const chargeableWeight = Math.max(totalGross, totalVol);
  const totalKoli        = rows.reduce((s, r) => s + (parseInt(r.koli) || 0), 0);

  const upd = (id: string, f: keyof DimRow, v: string) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));

  /* Estimate */
  async function handleEstimate(): Promise<void> {
    if (!originAirport.trim() || !destAirport.trim()) {
      toast({ title: t("airFreight.validationAirport"), variant: "destructive" }); return;
    }
    if (chargeableWeight <= 0) {
      toast({ title: t("airFreight.validationWeight"), variant: "destructive" }); return;
    }
    setEstimating(true); setEstimate(null); setSelectedRate(null);
    try {
      const res = await fetch("/api/air-freight/public/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_airport:      originAirport.trim().toUpperCase(),
          destination_airport: destAirport.trim().toUpperCase(),
          gross_weight:        totalGross,
          dimension_rows: rows.map(r => ({
            length: parseFloat(r.length) || 0, width: parseFloat(r.width) || 0,
            height: parseFloat(r.height) || 0, koli:  parseInt(r.koli) || 1,
            gross_weight: parseFloat(r.gross_weight) || 0,
          })),
          trade_type: tradeType, service_mode: serviceMode,
          service_level: serviceLevel, cargo_type: cargoType,
        }),
      });
      const data = await res.json() as EstimateResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal mengambil estimasi");
      setEstimate(data);
      if (data.options.length === 0)
        toast({ title: t("airFreight.validationNoRate"), variant: "default" });
    } catch (err) {
      toast({ title: t("airFreight.validationEstimateFail"), description: String(err), variant: "destructive" });
    } finally { setEstimating(false); }
  }

  /* Submit */
  async function handleSubmit(): Promise<void> {
    if (!custName.trim())  { toast({ title: t("airFreight.validationName"),   variant: "destructive" }); return; }
    if (!custPhone.trim()) { toast({ title: t("airFreight.validationPhone"),  variant: "destructive" }); return; }
    if (!commodity.trim()) { toast({ title: t("airFreight.validationCommodity"), variant: "destructive" }); return; }
    if (!originAirport.trim() || !destAirport.trim()) {
      toast({ title: t("airFreightBooking.validationAirport", "Kode bandara asal & tujuan wajib diisi"), variant: "destructive" }); return;
    }
    if (chargeableWeight <= 0) {
      toast({ title: t("airFreight.validationWeightFill"), variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const dimRows = rows
        .filter(r => r.length || r.width || r.height || r.gross_weight)
        .map(r => ({
          length: parseFloat(r.length) || 0, width: parseFloat(r.width) || 0,
          height: parseFloat(r.height) || 0, koli: parseInt(r.koli) || 1,
          gross_weight: parseFloat(r.gross_weight) || 0,
        }));

      const payload: Record<string, unknown> = {
        customer_name:           custName.trim(),
        customer_phone:          custPhone.trim(),
        customer_email:          custEmail.trim() || null,
        company_name:            custCompany.trim() || null,
        origin_city:             originCity.trim(),
        origin_airport:          originAirport.trim().toUpperCase(),
        destination_city:        destCity.trim(),
        destination_airport:     destAirport.trim().toUpperCase(),
        trade_type:              tradeType,
        service_mode:            serviceMode,
        service_level:           serviceLevel,
        incoterm,
        cargo_type:              cargoType,
        commodity:               commodity.trim(),
        gross_weight:            parseFloat(totalGross.toFixed(3)),
        total_volumetric_weight: parseFloat(totalVol.toFixed(3)),
        chargeable_weight:       parseFloat(chargeableWeight.toFixed(3)),
        koli:                    totalKoli,
        dimension_rows:          dimRows,
        pickup_date:             pickupDate || null,
        preferred_flight_date:   preferredFlightDate || null,
        target_arrival_date:     targetArrivalDate || null,
        selected_additional_services: addSvc,
        notes:                   notes.trim() || null,
      };

      if (selectedRate) {
        payload.selected_rate_id    = selectedRate.rate_id;
        payload.estimated_price_idr = Math.round(selectedRate.total_estimate_idr);
        payload.currency            = selectedRate.currency;
        payload.pricing_breakdown   = {
          airline:            selectedRate.airline,
          rate_per_kg:        selectedRate.rate_per_kg,
          weight_break:       selectedRate.weight_break,
          freight_base:       selectedRate.freight_base,
          fuel_surcharge:     selectedRate.fuel_surcharge,
          security_surcharge: selectedRate.security_surcharge,
          fixed_fees:         selectedRate.fixed_fees,
          minimum_charge:     selectedRate.minimum_charge,
        };
      }

      const res  = await fetch("/api/air-freight/public/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify(payload),
      });
      const data = await res.json() as { ok: boolean; order_number: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat order");
      setDone({ orderNumber: data.order_number });
      toast({ title: t("airFreight.validationSuccess") });
    } catch (err) {
      toast({ title: t("airFreight.validationSubmitFail"), description: String(err), variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  /* ── Success ─────────────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-slate-100">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-11 h-11 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("airFreight.successTitle")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("airFreight.successDesc")}
            </p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-left space-y-1">
            <p className="text-xs text-sky-500 font-medium uppercase tracking-wide">{t("airFreight.orderNoLabel")}</p>
            <p className="text-lg font-mono font-bold text-sky-700">{done.orderNumber}</p>
          </div>
          <Button className="w-full bg-sky-600 hover:bg-sky-700"
            onClick={() => setLocation(`/air-freight/track/${done.orderNumber}`)}>
            <Plane className="w-4 h-4 mr-2" /> {t("airFreight.trackOrder")}
          </Button>
          <button className="text-xs text-gray-400 hover:text-gray-600 underline"
            onClick={() => setLocation("/")}>
            {t("airFreight.backToHome")}
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => setLocation("/jasa")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("airFreight.back")}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center shadow-sm">
              <Plane className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{t("airFreight.navTitle")}</p>
              <p className="text-[10px] text-gray-400 leading-none">{t("airFreight.navBrand")}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero strip */}
      <div className="bg-sky-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Plane className="w-5 h-5 opacity-80" />
          <div>
            <p className="text-sm font-semibold">{t("airFreight.heroTitle")}</p>
            <p className="text-xs opacity-75">{t("airFreight.heroHint")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── 1. Rute ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <SectionHead icon={<MapPin className="w-4 h-4" />} title={t("airFreight.sectionRoute")} step={1} />

          {/* Origin / Destination */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.originCity")}</Label>
              <Input value={originCity} onChange={e => setOriginCity(e.target.value)}
                placeholder="Jakarta" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">
                {t("airFreight.originAirport")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input value={originAirport}
                  onChange={e => setOriginAirport(e.target.value.toUpperCase())}
                  placeholder="CGK" className="h-9 text-sm font-mono uppercase pr-10" maxLength={4} />
                <span className="absolute right-2.5 top-2 text-[10px] text-gray-400 font-mono">IATA</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.destCity")}</Label>
              <Input value={destCity} onChange={e => setDestCity(e.target.value)}
                placeholder="Singapore" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">
                {t("airFreight.destAirport")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input value={destAirport}
                  onChange={e => setDestAirport(e.target.value.toUpperCase())}
                  placeholder="SIN" className="h-9 text-sm font-mono uppercase pr-10" maxLength={4} />
                <span className="absolute right-2.5 top-2 text-[10px] text-gray-400 font-mono">IATA</span>
              </div>
            </div>
          </div>

          {/* Route arrow indicator */}
          {originAirport && destAirport && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 mb-3 text-sm">
              <span className="font-mono font-bold text-sky-700">{originAirport}</span>
              <Plane className="w-4 h-4 text-sky-400 mx-1" />
              <span className="font-mono font-bold text-sky-700">{destAirport}</span>
              <span className="ml-auto text-xs text-sky-500">
                {TRADE_TYPE_OPTS.find(o => o.v === tradeType)?.l}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreightBooking.tradeType", "Trade Type")}</Label>
              <Select value={tradeType} onValueChange={setTradeType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TRADE_TYPE_OPTS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreightBooking.serviceMode", "Service Mode")}</Label>
              <Select value={serviceMode} onValueChange={setServiceMode}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_MODE_OPTS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreightBooking.serviceLevel", "Service Level")}</Label>
              <Select value={serviceLevel} onValueChange={setServiceLevel}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICE_LEVEL_OPTS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.cargoTypeLabel")}</Label>
              <Select value={cargoType} onValueChange={setCargoType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{CARGO_TYPE_OPTS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreightBooking.incoterm", "Incoterm")}</Label>
              <Select value={incoterm} onValueChange={setIncoterm}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{INCOTERM_OPTS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ── 2. Detail Kargo ──────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <SectionHead icon={<Package className="w-4 h-4" />} title={t("airFreight.sectionCargo")} step={2} />

          <div className="mb-3">
            <Label className="text-xs text-gray-500 mb-1 block">
              {t("airFreight.commodityLabel")} <span className="text-red-500">*</span>
            </Label>
            <Input value={commodity} onChange={e => setCommodity(e.target.value)}
              placeholder={t("airFreight.commodityPlaceholder")} className="h-9 text-sm" />
          </div>

          {/* Dimension rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-500">{t("airFreight.dimensionLabel")}</Label>
              <button type="button" onClick={() => setRows(p => [...p, newRow()])}
                className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium">
                <Plus className="w-3 h-3" /> {t("airFreight.addKoli")}
              </button>
            </div>
            <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-400 font-medium px-1 mb-1">
              <span className="col-span-2">P (cm)</span>
              <span className="col-span-2">L (cm)</span>
              <span className="col-span-2">T (cm)</span>
              <span className="col-span-2">Koli</span>
              <span className="col-span-3">GW (kg)</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-1.5">
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-12 gap-1 items-center">
                  <Input value={r.length}       onChange={e => upd(r.id,"length",      e.target.value)} className="col-span-2 h-8 text-xs" placeholder="100" type="number" min="0" />
                  <Input value={r.width}        onChange={e => upd(r.id,"width",       e.target.value)} className="col-span-2 h-8 text-xs" placeholder="80"  type="number" min="0" />
                  <Input value={r.height}       onChange={e => upd(r.id,"height",      e.target.value)} className="col-span-2 h-8 text-xs" placeholder="60"  type="number" min="0" />
                  <Input value={r.koli}         onChange={e => upd(r.id,"koli",        e.target.value)} className="col-span-2 h-8 text-xs" placeholder="1"   type="number" min="1" />
                  <Input value={r.gross_weight} onChange={e => upd(r.id,"gross_weight",e.target.value)} className="col-span-3 h-8 text-xs" placeholder="0"   type="number" min="0" step="0.1" />
                  <button type="button" disabled={rows.length === 1}
                    onClick={() => setRows(p => p.filter(x => x.id !== r.id))}
                    className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weight summary */}
          {(totalGross > 0 || totalVol > 0) && (
            <div className="mt-4 rounded-xl bg-sky-50 border border-sky-100 p-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-sky-600 font-semibold uppercase tracking-wide">{t("airFreightBooking.grossWeight", "Gross Weight")}</p>
                <p className="text-sm font-bold text-gray-900">{fmtNum(totalGross)} kg</p>
              </div>
              <div>
                <p className="text-[10px] text-sky-600 font-semibold uppercase tracking-wide">{t("airFreightBooking.volumetric", "Volumetrik (1:167)")}</p>
                <p className="text-sm font-bold text-gray-900">{fmtNum(totalVol)} kg</p>
              </div>
              <div className="bg-sky-600 rounded-xl p-1.5">
                <p className="text-[10px] text-sky-100 font-semibold uppercase tracking-wide">{t("airFreightBooking.chargeable", "Chargeable")}</p>
                <p className="text-sm font-bold text-white">{fmtNum(chargeableWeight)} kg</p>
              </div>
            </div>
          )}

          <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700 gap-2"
            onClick={() => void handleEstimate()} disabled={estimating}>
            {estimating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Weight className="w-4 h-4" />}
            {t("airFreight.calcEstimate")}
          </Button>
        </section>

        {/* ── 3. Rate Options ──────────────────────────────────────────── */}
        {estimate && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <SectionHead icon={<LayoutList className="w-4 h-4" />} title={t("airFreight.sectionRate")} step={3} />

            {/* Weight badge row */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div><p className="text-gray-400 mb-0.5">Gross</p><p className="font-semibold">{fmtNum(estimate.gross_weight)} kg</p></div>
              <div><p className="text-gray-400 mb-0.5">Volumetrik</p><p className="font-semibold">{fmtNum(estimate.volumetric_weight)} kg</p></div>
              <div><p className="text-gray-400 mb-0.5">Chargeable</p><p className="font-bold text-sky-700">{fmtNum(estimate.chargeable_weight)} kg</p></div>
              <div><p className="text-gray-400 mb-0.5">Break</p><Badge className="text-[9px] h-5 bg-sky-100 text-sky-700 border-sky-200 px-1.5">{estimate.weight_break}</Badge></div>
            </div>

            {estimate.options.length === 0 ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-sm text-amber-700 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t("airFreight.noRateMsg")}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {estimate.options.map(opt => {
                  const sel = selectedRate?.rate_id === opt.rate_id;
                  return (
                    <div key={opt.rate_id} onClick={() => setSelectedRate(sel ? null : opt)}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${sel ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-200 bg-white"}`}>
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{opt.airline || opt.rate_source_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {opt.routing_type === "direct" ? t("airFreight.routeDirect") : t("airFreight.routeTransit")}
                            {opt.transit_days != null && ` · ${opt.transit_days} ${t("airFreight.dayUnit")}`}
                            {opt.flight_number && ` · ${opt.flight_number}`}
                          </p>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{opt.service_mode.replace(/_/g," ")}</Badge>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 capitalize">{opt.service_level}</Badge>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{opt.weight_break}</Badge>
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-xl font-bold text-sky-700">{IDR(opt.total_estimate_idr)}</p>
                          <p className="text-[10px] text-gray-400">{t("airFreight.estimateTotal")}</p>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <Separator className="my-2.5" />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Freight ({IDR(opt.rate_per_kg)}/kg × {fmtNum(estimate.chargeable_weight)} kg)</span>
                          <span className="font-medium text-gray-700">{IDR(opt.freight_base)}</span>
                        </div>
                        {opt.fuel_surcharge > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Fuel Surcharge</span>
                            <span className="font-medium text-gray-700">{IDR(opt.fuel_surcharge)}</span>
                          </div>
                        )}
                        {opt.security_surcharge > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Security Surcharge</span>
                            <span className="font-medium text-gray-700">{IDR(opt.security_surcharge)}</span>
                          </div>
                        )}
                        {opt.fixed_fees > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Fixed Fees (X-Ray, AWB, dll)</span>
                            <span className="font-medium text-gray-700">{IDR(opt.fixed_fees)}</span>
                          </div>
                        )}
                        {opt.etd && (
                          <div className="flex justify-between text-gray-500">
                            <span>ETD</span><span className="font-medium text-gray-700">{opt.etd}</span>
                          </div>
                        )}
                        {opt.eta && (
                          <div className="flex justify-between text-gray-500">
                            <span>ETA</span><span className="font-medium text-gray-700">{opt.eta}</span>
                          </div>
                        )}
                      </div>

                      {sel && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-sky-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("airFreight.rateSelected")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── 4. Jadwal ────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <SectionHead icon={<Calendar className="w-4 h-4" />} title={t("airFreight.sectionSchedule")} step={4} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.pickupDate")}</Label>
              <Input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.flightDate")}</Label>
              <Input type="date" value={preferredFlightDate} onChange={e => setPreferredFlightDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.arrivalDate")}</Label>
              <Input type="date" value={targetArrivalDate} onChange={e => setTargetArrivalDate(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
        </section>

        {/* ── 5. Layanan Tambahan ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <SectionHead icon={<Shield className="w-4 h-4" />} title={t("airFreight.sectionAddons")} step={5} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ADDITIONAL_SERVICES.map(svc => (
              <label key={svc.id}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${addSvc.includes(svc.id) ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-slate-300"}`}>
                <Checkbox
                  checked={addSvc.includes(svc.id)}
                  onCheckedChange={() => toggleSvc(svc.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{t(svc.labelKey as any)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t(svc.descKey as any)}</p>
                </div>
              </label>
            ))}
          </div>
          {addSvc.length > 0 && (
            <p className="text-xs text-sky-600 mt-3 font-medium">
              {t("airFreight.addonsSelected").replace("{count}", String(addSvc.length))}
            </p>
          )}
        </section>

        {/* ── 6. Data Pemesan ──────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <SectionHead icon={<User className="w-4 h-4" />} title={t("airFreight.sectionContact")} step={6} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">
                {t("airFreight.fullName")} <span className="text-red-500">*</span>
              </Label>
              <Input value={custName} onChange={e => setCustName(e.target.value)}
                placeholder="John Doe" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">{t("airFreight.companyName")}</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                <Input value={custCompany} onChange={e => setCustCompany(e.target.value)}
                  placeholder="PT. Contoh Eksportir" className="h-9 text-sm pl-8" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">
                {t("airFreight.whatsapp")} <span className="text-red-500">*</span>
              </Label>
              <Input value={custPhone} onChange={e => setCustPhone(e.target.value)}
                placeholder="08xx-xxxx-xxxx" className="h-9 text-sm" type="tel" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Email</Label>
              <Input value={custEmail} onChange={e => setCustEmail(e.target.value)}
                placeholder="email@company.com" className="h-9 text-sm" type="email" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-gray-500 mb-1 block">
                <FileText className="w-3 h-3 inline mr-1" />{t("airFreight.notes")}
              </Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t("airFreight.notesPh")}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        </section>

        {/* ── Summary + Submit ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" /> {t("airFreight.summaryTitle")}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="text-gray-400">{t("airFreight.summaryRoute")}</div>
            <div className="font-medium text-gray-700">
              {originAirport || "—"} <Plane className="w-3 h-3 inline mx-0.5 text-sky-500" /> {destAirport || "—"}
            </div>
            <div className="text-gray-400">{t("airFreight.summaryService")}</div>
            <div className="font-medium text-gray-700">
              {SERVICE_MODE_OPTS.find(o=>o.v===serviceMode)?.l} · {SERVICE_LEVEL_OPTS.find(o=>o.v===serviceLevel)?.l}
            </div>
            <div className="text-gray-400">{t("airFreight.summaryIncoterm")}</div>
            <div className="font-medium text-gray-700">{incoterm}</div>
            <div className="text-gray-400">{t("airFreight.summaryChargeable")}</div>
            <div className="font-medium text-gray-700">{chargeableWeight > 0 ? `${fmtNum(chargeableWeight)} kg` : "—"}</div>
            {selectedRate && (
              <>
                <div className="text-gray-400">{t("airFreight.summaryRate")}</div>
                <div className="font-medium text-sky-700">{selectedRate.airline || selectedRate.rate_source_name}</div>
                <div className="text-gray-400">{t("airFreight.summaryEstimate")}</div>
                <div className="font-bold text-sky-700">{IDR(selectedRate.total_estimate_idr)}</div>
              </>
            )}
            {addSvc.length > 0 && (
              <>
                <div className="text-gray-400">{t("airFreight.summaryAddons")}</div>
                <div className="font-medium text-gray-700">{addSvc.length} {t("airFreight.serviceUnit")}</div>
              </>
            )}
          </div>

          {!selectedRate && estimate?.options && estimate.options.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{t("airFreight.selectRateHint")}</span>
            </div>
          )}

          <Button
            className="w-full h-12 text-base bg-sky-600 hover:bg-sky-700 gap-2 shadow-md"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <ChevronRight className="w-5 h-5" />}
            {t("airFreight.requestQuote")}
          </Button>
          <p className="text-xs text-center text-gray-400">
            {t("airFreight.requestHint")}
          </p>
        </div>

      </div>
    </div>
  );
}
