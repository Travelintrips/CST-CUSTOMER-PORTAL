import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Calculator, ArrowRight, Ship, Plane, Truck, Package,
  Warehouse, Globe, Info, RefreshCw, MessageCircle,
  CheckCircle2, ChevronRight, Sparkles, ArrowLeft,
  Send, X, MapPin, AlertTriangle, FileText, Box,
  Thermometer, Zap, Shield, Receipt, Plus, Minus, Download,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { CART_KEY, CartItem } from "@/lib/logistic-cart";
import PageSeo from "@/components/PageSeo";
import { useGetPortalCompany } from "@shared/api-client-react";

function normalizePhone(p: string) { return p.replace(/\D/g, ""); }

// ── Types ────────────────────────────────────────────────────────────────────
type ServiceType = "seaFreight" | "airFreight" | "customs" | "domestic" | "warehousing" | "projectCargo" | "";

interface ServiceRates {
  airFreight: { ratePerKg: number; fuelSurchargePct: number; securityFeePerKg: number; handlingFee: number; awbFee: number; documentationFee: number; insurancePct: number; ppnPct: number; };
  seaFreight: { ratePerCbmLcl: number; ratePerContainer: Record<string, number>; thc: number; documentationFee: number; customsClearance: number; truckingFee: number; insurancePct: number; ppnPct: number; };
  customs: { jasaPpjk: number; customsHandling: number; documentProcessing: number; pibSubmission: number; courierFee: number; additionalServiceFee: number; };
  domestic: { vehicleRates: Record<string, number>; distanceRatePerKm: number; loadingFee: number; unloadingFee: number; overnightFee: number; helperFeePerDay: number; };
  warehousing: { palletRatePerDay: number; cbmRatePerDay: number; sqmRatePerDay: number; inboundFee: number; outboundFeePerPallet: number; inventoryFeePerMonth: number; };
}

const EMPTY_RATES: ServiceRates = {
  airFreight: { ratePerKg: 0, fuelSurchargePct: 0, securityFeePerKg: 0, handlingFee: 0, awbFee: 0, documentationFee: 0, insurancePct: 0, ppnPct: 0 },
  seaFreight: { ratePerCbmLcl: 0, ratePerContainer: { "20GP": 0, "40GP": 0, "40HC": 0, "Reefer": 0, "Open Top": 0, "Flat Rack": 0 }, thc: 0, documentationFee: 0, customsClearance: 0, truckingFee: 0, insurancePct: 0, ppnPct: 0 },
  customs: { jasaPpjk: 0, customsHandling: 0, documentProcessing: 0, pibSubmission: 0, courierFee: 0, additionalServiceFee: 0 },
  domestic: { vehicleRates: { pickup: 0, blindVan: 0, CDE: 0, CDD: 0, Fuso: 0, Wingbox: 0, "Trailer 20FT": 0, "Trailer 40FT": 0 }, distanceRatePerKm: 0, loadingFee: 0, unloadingFee: 0, overnightFee: 0, helperFeePerDay: 0 },
  warehousing: { palletRatePerDay: 0, cbmRatePerDay: 0, sqmRatePerDay: 0, inboundFee: 0, outboundFeePerPallet: 0, inventoryFeePerMonth: 0 },
};

interface CostItem { label: string; value: number; note?: string; isNegative?: boolean; }
interface CalcResult {
  service: ServiceType;
  items: CostItem[];
  subtotal: number;
  insurance: number;
  surcharges: number;
  ppn: number;
  grandTotal: number;
  // Metrics
  chargeableWeight?: number;
  volumetricWeight?: number;
  cbm?: number;
  // Project cargo
  isProjectCargo?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  // Extra data for submission
  extraData?: Record<string, string | number | boolean | null>;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function formatIDR(n: number, loc = "id-ID") {
  return new Intl.NumberFormat(loc, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

interface CsvExportLabels {
  columnItem: string; columnValue: string; subtotal: string; insurance: string;
  ppn: string; grandTotal: string; filenamePrefix: string;
}

const DEFAULT_CSV_EXPORT_LABELS: CsvExportLabels = {
  columnItem: "Item",
  columnValue: "Value",
  subtotal: "Subtotal",
  insurance: "Insurance",
  ppn: "PPN",
  grandTotal: "Grand Total",
  filenamePrefix: "logistics-estimate",
};

function exportCalcCSV(
  result: CalcResult,
  serviceName: string,
  labels: CsvExportLabels = DEFAULT_CSV_EXPORT_LABELS,
) {
  const rows: string[] = [
    `"${labels.columnItem}","${labels.columnValue}"`,
    ...result.items.map(i => `"${i.label}","${i.value}"`),
    `"${labels.subtotal}","${result.subtotal}"`,
    ...(result.insurance > 0 ? [`"${labels.insurance}","${result.insurance}"`] : []),
    ...(result.ppn > 0 ? [`"${labels.ppn}","${result.ppn}"`] : []),
    `"${labels.grandTotal}","${result.grandTotal}"`,
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${labels.filenamePrefix}-${serviceName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface JsonExportLabels { noteValue: string; filenamePrefix: string; }

const DEFAULT_JSON_EXPORT_LABELS: JsonExportLabels = {
  noteValue: "Generated from logistics calculator",
  filenamePrefix: "logistics-estimate",
};

function exportCalcJSON(
  result: CalcResult,
  serviceName: string,
  labels: JsonExportLabels = DEFAULT_JSON_EXPORT_LABELS,
) {
  const data = {
    service: serviceName,
    date: new Date().toISOString(),
    items: result.items,
    subtotal: result.subtotal,
    insurance: result.insurance,
    ppn: result.ppn,
    grandTotal: result.grandTotal,
    ...(result.chargeableWeight !== undefined && { chargeableWeight: result.chargeableWeight }),
    ...(result.cbm !== undefined && { cbm: result.cbm }),
    note: labels.noteValue,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${labels.filenamePrefix}-${serviceName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Service Config ─────────────────────────────────────────────────────────────
const SERVICE_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string; emoji: string; }> = {
  seaFreight:   { icon: <Ship className="h-5 w-5" />,      color: "#1D4ED8", gradient: "linear-gradient(135deg,#1D4ED8,#3B82F6)", emoji: "🚢" },
  airFreight:   { icon: <Plane className="h-5 w-5" />,     color: "#0284C7", gradient: "linear-gradient(135deg,#0284C7,#38BDF8)", emoji: "✈️" },
  customs:      { icon: <Package className="h-5 w-5" />,   color: "#EA580C", gradient: "linear-gradient(135deg,#EA580C,#FB923C)", emoji: "📦" },
  domestic:     { icon: <Truck className="h-5 w-5" />,     color: "#D97706", gradient: "linear-gradient(135deg,#D97706,#FCD34D)", emoji: "🚚" },
  warehousing:  { icon: <Warehouse className="h-5 w-5" />, color: "#0D9488", gradient: "linear-gradient(135deg,#0D9488,#2DD4BF)", emoji: "🏭" },
  projectCargo: { icon: <Globe className="h-5 w-5" />,     color: "#7C3AED", gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)", emoji: "🏗️" },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const { t, locale } = useLanguage();
  /** Locale-aware IDR formatter — recreated only when locale changes. */
  const fmtIDR = (n: number) => formatIDR(n, locale);
  const qc = useQueryClient();

  // Translated service labels (must be inside component so t() works)
  const svcLabel = (s: string) => t(`calculator.services.${s}` as Parameters<typeof t>[0], s);
  const svcLabelFull = (s: string) => t(`calculator.services.${s}Full` as Parameters<typeof t>[0], s);

  // Pre-select service from URL ?service=X
  const initialService = useMemo<ServiceType>(() => {
    if (typeof window === "undefined") return "";
    const param = new URLSearchParams(window.location.search).get("service");
    const valid: ServiceType[] = ["seaFreight","airFreight","customs","domestic","warehousing","projectCargo"];
    return (valid.includes(param as ServiceType) ? param : "") as ServiceType;
  }, []);

  const { data: ratesData } = useQuery<ServiceRates>({
    queryKey: ["portal-calc-rates-v2"],
    queryFn: () => fetch("/api/portal/calculator-rates-v2").then(r => r.ok ? r.json() : null),
    staleTime: 5 * 60 * 1000,
  });
  const rates = ratesData ?? EMPTY_RATES;
  const ratesUnavailable = !ratesData;

  useEffect(() => {
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("price_sync", () => qc.invalidateQueries({ queryKey: ["portal-calc-rates-v2"] }));
    return () => es.close();
  }, [qc]);

  // Company phone for WA links
  const { data: portalCompany } = useGetPortalCompany({});
  const csPhone = portalCompany?.phone ? normalizePhone(portalCompany.phone) : null;
  const buildWaHref = (text: string) =>
    csPhone ? `https://wa.me/${csPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;

  // ── Common State ────────────────────────────────────────────────────────────
  const [service, setService] = useState<ServiceType>(initialService);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");
  const [calculated, setCalculated] = useState(false);

  // Common fields
  const [customerName, setCustomerName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoDesc, setCargoDesc] = useState("");
  const [cargoValue, setCargoValue] = useState("");
  const [incoterms, setIncoterms] = useState("");
  const [insured, setInsured] = useState(false);
  const [notes, setNotes] = useState("");

  // Auto-fill origin
  const [companyOrigin, setCompanyOrigin] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/settings/company-pickup-address")
      .then(r => r.ok ? r.json() : null)
      .then((d: { originCity?: string } | null) => {
        const city = d?.originCity ?? "Jakarta, Indonesia";
        setCompanyOrigin(city);
        setOrigin(prev => prev || city);
      })
      .catch(() => { setCompanyOrigin("Jakarta, Indonesia"); setOrigin(prev => prev || "Jakarta, Indonesia"); });

    try {
      const stored = localStorage.getItem(CART_KEY);
      const cartItems: CartItem[] = stored ? JSON.parse(stored) : [];
      const productItems = cartItems.filter(i => i.calculatorType === "product");
      if (productItems.length > 0) {
        const w = productItems.reduce((s, i) => s + Number(i.inputData.weightKg ?? 0) * Number(i.inputData.qty ?? 1), 0);
        if (w > 0) { setAirWeight(String(Math.round(w * 100) / 100)); setSeaGrossWeight(String(Math.round(w * 100) / 100)); }
      }
    } catch { /**/ }
  }, []);

  // ── Sea Freight State ───────────────────────────────────────────────────────
  const [seaShipmentType, setSeaShipmentType] = useState<"FCL"|"LCL">("LCL");
  const [seaPol, setSeaPol] = useState("");
  const [seaPod, setSeaPod] = useState("");
  const [seaContainerType, setSeaContainerType] = useState("20GP");
  const [seaCbm, setSeaCbm] = useState("");
  const [seaGrossWeight, setSeaGrossWeight] = useState("");
  const [seaCommodity, setSeaCommodity] = useState("");
  const [seaDg, setSeaDg] = useState(false);
  const [seaTrucking, setSeaTrucking] = useState(false);
  const [seaCustoms, setSeaCustoms] = useState(true);

  // ── Air Freight State ───────────────────────────────────────────────────────
  const [airOriginAirport, setAirOriginAirport] = useState("");
  const [airDestAirport, setAirDestAirport] = useState("");
  const [airWeight, setAirWeight] = useState("");
  const [airPieces, setAirPieces] = useState("1");
  const [airLength, setAirLength] = useState("");
  const [airWidth, setAirWidth] = useState("");
  const [airHeight, setAirHeight] = useState("");
  const [airCommodity, setAirCommodity] = useState("");
  const [airDg, setAirDg] = useState(false);
  const [airTempControlled, setAirTempControlled] = useState(false);
  const [airAirline, setAirAirline] = useState("");

  // Auto-calculated air metrics
  const airVolumetric = useMemo(() => {
    const l = parseFloat(airLength), w = parseFloat(airWidth), h = parseFloat(airHeight);
    return (l > 0 && w > 0 && h > 0) ? (l * w * h) / 6000 : null;
  }, [airLength, airWidth, airHeight]);
  const airChargeable = useMemo(() => {
    const gw = parseFloat(airWeight);
    if (!gw) return null;
    return Math.max(gw, airVolumetric ?? 0);
  }, [airWeight, airVolumetric]);

  // ── PPJK / Customs State ────────────────────────────────────────────────────
  const [customsTradeType, setCustomsTradeType] = useState<"import"|"export">("import");
  const [customsDocType, setCustomsDocType] = useState<"PIB"|"PEB">("PIB");
  const [customsHsCode, setCustomsHsCode] = useState("");
  const [customsCommodity, setCustomsCommodity] = useState("");
  const [customsNilaiPabean, setCustomsNilaiPabean] = useState("");
  const [customsNomorAju, setCustomsNomorAju] = useState("");
  const [customsNpwp, setCustomsNpwp] = useState("");
  const [customsAddlService, setCustomsAddlService] = useState(false);

  // ── Trucking State ──────────────────────────────────────────────────────────
  const [truckPickup, setTruckPickup] = useState("");
  const [truckDelivery, setTruckDelivery] = useState("");
  const [truckVehicle, setTruckVehicle] = useState("CDE");
  const [truckDistance, setTruckDistance] = useState("");
  const [truckTonase, setTruckTonase] = useState("");
  const [truckKoli, setTruckKoli] = useState("");
  const [truckLoading, setTruckLoading] = useState(false);
  const [truckUnloading, setTruckUnloading] = useState(false);
  const [truckOvernight, setTruckOvernight] = useState(false);
  const [truckHelperDays, setTruckHelperDays] = useState("0");

  // ── Warehousing State ────────────────────────────────────────────────────────
  const [whLocation, setWhLocation] = useState("");
  const [whStorageType, setWhStorageType] = useState<"Pallet"|"CBM"|"SQM">("Pallet");
  const [whQty, setWhQty] = useState("");
  const [whDuration, setWhDuration] = useState("");
  const [whInbound, setWhInbound] = useState(false);
  const [whOutbound, setWhOutbound] = useState(false);
  const [whInventory, setWhInventory] = useState(false);

  // ── Project Cargo State ──────────────────────────────────────────────────────
  const [pcLength, setPcLength] = useState("");
  const [pcWidth, setPcWidth] = useState("");
  const [pcHeight, setPcHeight] = useState("");
  const [pcWeight, setPcWeight] = useState("");
  const [pcHeavyLift, setPcHeavyLift] = useState(false);
  const [pcOversize, setPcOversize] = useState(false);
  const [pcCrane, setPcCrane] = useState(false);
  const [pcRouteSurvey, setPcRouteSurvey] = useState(false);
  const [pcEscort, setPcEscort] = useState(false);

  // ── Quote Modal State ────────────────────────────────────────────────────────
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteWa, setQuoteWa] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleServiceChange(s: ServiceType) {
    setService(s);
    setResult(null);
    setCalculated(false);
    setError("");
  }

  function handleReset() {
    setResult(null); setCalculated(false); setError("");
    setCustomerName(""); setDestination(""); setCargoDesc(""); setCargoValue("");
    setIncoterms(""); setInsured(false); setNotes("");
    setSeaShipmentType("LCL"); setSeaPol(""); setSeaPod(""); setSeaContainerType("20GP");
    setSeaCbm(""); setSeaGrossWeight(""); setSeaCommodity(""); setSeaDg(false); setSeaTrucking(false); setSeaCustoms(true);
    setAirOriginAirport(""); setAirDestAirport(""); setAirWeight(""); setAirPieces("1");
    setAirLength(""); setAirWidth(""); setAirHeight(""); setAirCommodity(""); setAirDg(false); setAirTempControlled(false); setAirAirline("");
    setCustomsTradeType("import"); setCustomsDocType("PIB"); setCustomsHsCode(""); setCustomsCommodity("");
    setCustomsNilaiPabean(""); setCustomsNomorAju(""); setCustomsNpwp(""); setCustomsAddlService(false);
    setTruckPickup(""); setTruckDelivery(""); setTruckVehicle("CDE"); setTruckDistance("");
    setTruckTonase(""); setTruckKoli(""); setTruckLoading(false); setTruckUnloading(false); setTruckOvernight(false); setTruckHelperDays("0");
    setWhLocation(""); setWhStorageType("Pallet"); setWhQty(""); setWhDuration(""); setWhInbound(false); setWhOutbound(false); setWhInventory(false);
    setPcLength(""); setPcWidth(""); setPcHeight(""); setPcWeight("");
    setPcHeavyLift(false); setPcOversize(false); setPcCrane(false); setPcRouteSurvey(false); setPcEscort(false);
    setShowQuoteForm(false); setQuoteSuccess(false); setQuoteError("");
  }

  // ── Formula Engine ────────────────────────────────────────────────────────
  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setResult(null);
    if (ratesUnavailable) {
      setError("Canonical rate calculator belum tersedia. Silakan coba lagi setelah rate card aktif.");
      return;
    }
    if (!service) { setError(t("calculator.validationNoService")); return; }
    if (!destination.trim()) { setError(t("calculator.validationNoDest")); return; }

    const cargoVal = parseFloat(cargoValue.replace(/[^0-9.]/g, "")) || 0;

    let calc: CalcResult = { service, items: [], subtotal: 0, insurance: 0, surcharges: 0, ppn: 0, grandTotal: 0 };

    if (service === "airFreight") {
      const gw = parseFloat(airWeight) || 0;
      if (gw <= 0) { setError(t("calculator.validationNoWeight")); return; }
      const r = rates.airFreight;
      const vol = airVolumetric ?? 0;
      const cw = Math.max(gw, vol);
      const pieces = parseInt(airPieces) || 1;
      calc.volumetricWeight = Math.round(vol * 100) / 100;
      calc.chargeableWeight = Math.round(cw * 100) / 100;

      const freightCost = Math.ceil(cw) * r.ratePerKg;
      const fuelSurcharge = Math.round(freightCost * r.fuelSurchargePct / 100);
      const securityFee = Math.ceil(cw) * r.securityFeePerKg;

      calc.items = [
        { label: t("calculator.itemAirFreightCharge", "Air Freight Charge"), value: freightCost, note: `${Math.ceil(cw)} kg × ${fmtIDR(r.ratePerKg)}/kg` },
        { label: t("calculator.itemFuelSurcharge", "Fuel Surcharge"), value: fuelSurcharge, note: `${r.fuelSurchargePct}% dari freight charge` },
        { label: t("calculator.itemSecuritySurcharge", "Security Surcharge"), value: securityFee, note: `${Math.ceil(cw)} kg × ${fmtIDR(r.securityFeePerKg)}/kg` },
        { label: t("calculator.itemHandlingFee", "Handling Fee"), value: r.handlingFee * pieces },
        { label: t("calculator.itemAwbFee", "AWB Fee"), value: r.awbFee },
        { label: t("calculator.itemDocumentation", "Documentation"), value: r.documentationFee },
        ...(airTempControlled ? [{ label: t("calculator.itemColdChain", "Cold Chain Handling"), value: 1500000 }] : []),
        ...(airDg ? [{ label: t("calculator.itemDgSurcharge", "DG Surcharge"), value: 2000000 }] : []),
      ];
      calc.surcharges = fuelSurcharge + securityFee;
      calc.extraData = { grossWeight: gw, volumetricWeight: vol, chargeableWeight: cw, pieces, commodity: airCommodity, airline: airAirline, dg: airDg, tempControlled: airTempControlled };

    } else if (service === "seaFreight") {
      const r = rates.seaFreight;
      if (seaShipmentType === "LCL") {
        const cbm = parseFloat(seaCbm) || 0;
        if (cbm <= 0) { setError(t("calculator.validationNoCbm")); return; }
        const effectiveCbm = Math.max(cbm, 0.1);
        const freightCost = Math.ceil(effectiveCbm * 10) / 10 * r.ratePerCbmLcl;
        calc.cbm = Math.round(cbm * 1000) / 1000;
        calc.items = [
          { label: t("calculator.itemOceanFreightLcl", "Ocean Freight (LCL)"), value: freightCost, note: `${effectiveCbm.toFixed(2)} CBM × ${fmtIDR(r.ratePerCbmLcl)}/CBM` },
          { label: t("calculator.itemThc", "THC (Terminal Handling)"), value: r.thc },
          { label: t("calculator.itemDocumentation", "Documentation"), value: r.documentationFee },
          ...(seaCustoms ? [{ label: t("calculator.itemCustomsClearance", "Customs Clearance"), value: r.customsClearance }] : []),
          ...(seaTrucking ? [{ label: t("calculator.itemInlandTrucking", "Inland Trucking"), value: r.truckingFee }] : []),
          ...(seaDg ? [{ label: t("calculator.itemDgSurcharge", "DG Surcharge"), value: 3500000 }] : []),
        ];
      } else {
        const containerRate = r.ratePerContainer[seaContainerType] ?? r.ratePerContainer["20GP"];
        calc.items = [
          { label: `${t("calculator.itemOceanFreightFcl", "Ocean Freight (FCL)")} - ${seaContainerType}`, value: containerRate },
          { label: t("calculator.itemThc", "THC (Terminal Handling)"), value: r.thc },
          { label: t("calculator.itemDocumentation", "Documentation"), value: r.documentationFee },
          ...(seaCustoms ? [{ label: t("calculator.itemCustomsClearance", "Customs Clearance"), value: r.customsClearance }] : []),
          ...(seaTrucking ? [{ label: t("calculator.itemInlandTrucking", "Inland Trucking"), value: r.truckingFee }] : []),
          ...(seaDg ? [{ label: t("calculator.itemDgSurcharge", "DG Surcharge"), value: 5000000 }] : []),
        ];
      }
      calc.extraData = { shipmentType: seaShipmentType, pol: seaPol, pod: seaPod, containerType: seaContainerType, cbm: seaCbm, grossWeight: seaGrossWeight, commodity: seaCommodity, dg: seaDg, trucking: seaTrucking, customs: seaCustoms };

    } else if (service === "customs") {
      const r = rates.customs;
      const nilaiPabean = parseFloat(customsNilaiPabean.replace(/[^0-9.]/g, "")) || 0;
      calc.items = [
        { label: t("calculator.itemJasaPpjk", "Jasa PPJK"), value: r.jasaPpjk },
        { label: t("calculator.itemCustomsHandling", "Customs Handling"), value: r.customsHandling },
        { label: t("calculator.itemDocumentProcessing", "Document Processing"), value: r.documentProcessing },
        { label: `${customsDocType} Submission`, value: r.pibSubmission },
        { label: t("calculator.itemCourier", "Courier"), value: r.courierFee },
        ...(customsAddlService ? [{ label: t("calculator.itemAdditionalServices", "Additional Services"), value: r.additionalServiceFee }] : []),
        ...(nilaiPabean > 0 ? [{ label: "Est. Bea Masuk (3%)", value: Math.round(nilaiPabean * 0.03), note: "Estimasi — tergantung HS Code & kebijakan" }] : []),
        ...(nilaiPabean > 0 ? [{ label: "Est. PPN Impor (11%)", value: Math.round((nilaiPabean + Math.round(nilaiPabean * 0.03)) * 0.11), note: "11% × (Nilai Pabean + Bea Masuk)" }] : []),
        ...(nilaiPabean > 0 && customsTradeType === "import" ? [{ label: "Est. PPh Pasal 22 (2.5%)", value: Math.round(nilaiPabean * 0.025), note: "Estimasi dengan API — 7.5% tanpa API" }] : []),
      ];
      calc.extraData = { tradeType: customsTradeType, docType: customsDocType, hsCode: customsHsCode, commodity: customsCommodity, nilaiPabean, nomorAju: customsNomorAju, npwp: customsNpwp };

    } else if (service === "domestic") {
      if (!truckDistance) { setError(t("calculator.validationNoDist")); return; }
      const r = rates.domestic;
      const baseRate = r.vehicleRates[truckVehicle] ?? r.vehicleRates["CDE"];
      const distKm = parseFloat(truckDistance) || 0;
      const distCost = Math.round(distKm * r.distanceRatePerKm);
      const helperDays = parseInt(truckHelperDays) || 0;

      calc.items = [
        { label: `${t("calculator.itemBaseRate", "Base Rate")} (${truckVehicle})`, value: baseRate },
        { label: t("calculator.itemDistanceFee", "Biaya Jarak"), value: distCost, note: `${distKm} km × ${fmtIDR(r.distanceRatePerKm)}/km` },
        ...(truckLoading ? [{ label: t("calculator.itemLoadingService", "Loading Service"), value: r.loadingFee }] : []),
        ...(truckUnloading ? [{ label: t("calculator.itemUnloadingService", "Unloading Service"), value: r.unloadingFee }] : []),
        ...(truckOvernight ? [{ label: t("calculator.itemOvernight", "Overnight Stay"), value: r.overnightFee }] : []),
        ...(helperDays > 0 ? [{ label: `${t("calculator.itemHelper", "Helper")} (${helperDays} hari)`, value: helperDays * r.helperFeePerDay }] : []),
      ];
      calc.extraData = { pickupAddress: truckPickup, deliveryAddress: truckDelivery, vehicle: truckVehicle, distanceKm: distKm, tonase: truckTonase, koli: truckKoli, loading: truckLoading, unloading: truckUnloading, overnight: truckOvernight, helperDays };

    } else if (service === "warehousing") {
      if (!whQty || !whDuration) { setError(t("calculator.validationNoWhQty")); return; }
      const r = rates.warehousing;
      const qty = parseFloat(whQty) || 1;
      const days = parseInt(whDuration) || 1;
      const storageRates: Record<string, number> = { Pallet: r.palletRatePerDay, CBM: r.cbmRatePerDay, SQM: r.sqmRatePerDay };
      const storageRate = storageRates[whStorageType];
      const storageCost = Math.round(qty * days * storageRate);
      const unitLabel = whStorageType === "Pallet" ? "pallet" : whStorageType === "CBM" ? "CBM" : "m²";

      calc.items = [
        { label: `${t("calculator.itemStorage", "Storage")} (${whStorageType})`, value: storageCost, note: `${qty} ${unitLabel} × ${days} ${t("calculator.days", "hari")} × ${fmtIDR(storageRate)}/${t("calculator.day", "hari")}` },
        ...(whInbound ? [{ label: t("calculator.itemInboundHandling", "Inbound Handling"), value: Math.round(qty * r.inboundFee) }] : []),
        ...(whOutbound ? [{ label: t("calculator.itemOutboundHandling", "Outbound Handling"), value: Math.round(qty * r.outboundFeePerPallet) }] : []),
        ...(whInventory ? [{ label: t("calculator.itemInventoryMgmt", "Inventory Management"), value: r.inventoryFeePerMonth, note: t("calculator.perMonth", "per bulan") }] : []),
      ];
      calc.extraData = { location: whLocation, storageType: whStorageType, qty, durationDays: days, inbound: whInbound, outbound: whOutbound, inventory: whInventory };

    } else if (service === "projectCargo") {
      const l = parseFloat(pcLength) || 0;
      const w = parseFloat(pcWidth) || 0;
      const h = parseFloat(pcHeight) || 0;
      const wt = parseFloat(pcWeight) || 0;
      const cbm = l > 0 && w > 0 && h > 0 ? l * w * h : 0;

      let budgetMin = 50000000;
      let budgetMax = 150000000;
      if (wt > 10000 || pcHeavyLift) { budgetMin += 50000000; budgetMax += 100000000; }
      if (pcCrane) { budgetMin += 30000000; budgetMax += 80000000; }
      if (pcRouteSurvey) { budgetMin += 15000000; budgetMax += 30000000; }
      if (pcEscort) { budgetMin += 20000000; budgetMax += 50000000; }
      if (pcOversize || cbm > 100) { budgetMin += 25000000; budgetMax += 75000000; }

      calc.isProjectCargo = true;
      calc.budgetMin = budgetMin;
      calc.budgetMax = budgetMax;
      calc.cbm = cbm > 0 ? Math.round(cbm * 1000) / 1000 : undefined;
      calc.extraData = { length: l, width: w, height: h, weight: wt, heavyLift: pcHeavyLift, oversize: pcOversize, crane: pcCrane, routeSurvey: pcRouteSurvey, escort: pcEscort };
      setResult(calc);
      setCalculated(true);
      return;
    }

    // ── Common: subtotal, insurance, PPN ──────────────────────────────────────
    calc.subtotal = calc.items.reduce((s, i) => s + i.value, 0);
    if (insured && cargoVal > 0) {
      const pct = service === "airFreight" ? rates.airFreight.insurancePct : rates.seaFreight.insurancePct;
      calc.insurance = Math.round(cargoVal * pct / 100);
    }
    const ppnBase = calc.subtotal + calc.insurance;
    const ppnPct = (service === "airFreight" ? rates.airFreight.ppnPct : service === "seaFreight" ? rates.seaFreight.ppnPct : 0);
    calc.ppn = ppnPct > 0 ? Math.round(ppnBase * ppnPct / 100) : 0;
    calc.grandTotal = ppnBase + calc.ppn;

    setResult(calc);
    setCalculated(true);
  }

  // ── Quote Submission ────────────────────────────────────────────────────────
  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuoteError("");
    if (!quoteName.trim()) { setQuoteError(t("calculator.validationName")); return; }
    if (!quoteWa.trim()) { setQuoteError(t("calculator.validationWa")); return; }
    setQuoteSubmitting(true);
    try {
      if (!quoteEmail.trim()) {
        setQuoteError("Email wajib diisi untuk membuat service request.");
        return;
      }
      const res = await fetch("/api/customer-service-requests/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: quoteName.trim(),
          customerEmail: quoteEmail.trim(),
          customerPhone: quoteWa.trim(),
          service,
          origin,
          destination,
          cargoDesc: cargoDesc || undefined,
          cargoValue: cargoValue || undefined,
          incoterms: incoterms || undefined,
          insurance: insured,
          notes: notes || undefined,
          result: result ? {
            grandTotal: result.grandTotal,
            subtotal: result.subtotal,
            ppn: result.ppn,
            items: result.items,
            chargeableWeight: result.chargeableWeight,
            cbm: result.cbm,
            isProjectCargo: result.isProjectCargo,
            budgetMin: result.budgetMin,
            budgetMax: result.budgetMax,
          } : undefined,
          extraData: result?.extraData,
          createRfq: true,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) { setQuoteError(data.error ?? t("calculator.errorSendFail")); }
      else { setQuoteSuccess(true); setShowQuoteForm(false); }
    } catch { setQuoteError(t("calculator.errorServerConnect")); }
    finally { setQuoteSubmitting(false); }
  }

  const svc = service ? SERVICE_CONFIG[service] : null;

  // ── Field Components (inline helpers) ────────────────────────────────────
  const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
    <label className="calc-label">{children}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
  );
  const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="calc-input" />
  );
  const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="calc-select">{children}</select>
  );
  const Check = ({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
    <label className={`option-toggle${checked ? " option-toggle-active" : ""}`} style={{ flex: "0 0 auto" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-blue-600" />
      <div>
        <p className="text-[12.5px] font-semibold text-slate-700 leading-tight">{label}</p>
        {sub && <p className="text-[10.5px] text-slate-400">{sub}</p>}
      </div>
    </label>
  );
  const SectionTitle = ({ n, children }: { n: number; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#0B5CAD,#1A73D4)" }}>{n}</span>
      <label className="text-[12.5px] font-bold text-slate-700 uppercase tracking-wide">{children}</label>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F0F6FF 0%, #F8FAFC 50%, #FFFFFF 100%)" }}>
      <PageSeo path="/calculator" />
      <style>{`
        .calc-input { width:100%; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFFFFF; padding:10px 14px; font-size:13.5px; color:#1E293B; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
        .calc-input:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .calc-input::placeholder { color:#94A3B8; }
        .calc-input:read-only { background:#F8FAFC; color:#64748B; cursor:not-allowed; }
        .calc-select { width:100%; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFFFFF; padding:10px 14px; font-size:13.5px; color:#1E293B; outline:none; transition:border-color 0.15s; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; }
        .calc-select:focus { border-color:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .calc-label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px; letter-spacing:0.01em; text-transform:uppercase; }
        .calc-card { background:#FFFFFF; border-radius:18px; border:1px solid rgba(226,232,240,0.80); box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05); }
        .result-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F1F5F9; font-size:13px; }
        .result-row:last-child { border-bottom:none; }
        @keyframes slide-up-fade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .result-appear { animation:slide-up-fade 0.35s ease both; }
        .svc-btn { display:flex; flex-direction:column; align-items:center; gap:5px; padding:11px 6px; border-radius:12px; border:1.5px solid #E2E8F0; background:#FFFFFF; font-size:11px; font-weight:600; color:#64748B; cursor:pointer; transition:all 0.18s ease; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
        .svc-btn:hover:not(.svc-btn-active) { border-color:#93C5FD; background:#EFF6FF; color:#1D4ED8; transform:translateY(-1px); }
        .svc-btn-active { color:white; border-color:transparent!important; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.18),0 2px 6px rgba(0,0,0,0.10)!important; }
        .option-toggle { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; border:1.5px solid #E2E8F0; background:#FFFFFF; cursor:pointer; transition:all 0.16s; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
        .option-toggle:hover { border-color:#93C5FD; }
        .option-toggle-active { border-color:#3B82F6!important; background:#EFF6FF; }
        .shipment-type-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:10px; border:1.5px solid #E2E8F0; font-size:13px; font-weight:600; color:#64748B; cursor:pointer; transition:all 0.15s; background:#FFFFFF; }
        .shipment-type-btn.active { border-color:#3B82F6; background:#EFF6FF; color:#1D4ED8; }
        .cost-row { display:flex; justify-content:space-between; align-items:baseline; padding:7px 0; border-bottom:1px dashed #F1F5F9; font-size:13px; }
        .cost-row:last-of-type { border-bottom:none; }
      `}</style>

      {/* ── Header ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B3D6B 0%, #0D6EBF 55%, #1E9FE8 100%)", padding: "clamp(24px,3.5vw,36px) 0 clamp(18px,2.5vw,26px)" }}>
        <div aria-hidden="true" style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.10) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none" }} />
        <div className="max-w-6xl mx-auto px-4 md:px-8" style={{ position:"relative",zIndex:2 }}>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : undefined}
            className="inline-flex items-center gap-1.5 mb-3 text-[12px] font-semibold rounded-lg px-3 py-1.5 select-none"
            style={{ color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(255,255,255,0.20)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("calculator.back")}
          </button>
          <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase tracking-widest" style={{ background:"rgba(255,255,255,0.14)", color:"rgba(255,255,255,0.80)", border:"1px solid rgba(255,255,255,0.18)" }}>
                <Calculator className="h-3 w-3" /> Dynamic Service Calculator
              </div>
              <h1 className="font-bold text-white" style={{ fontSize:"clamp(20px,2.8vw,30px)", lineHeight:1.1, letterSpacing:"-0.02em" }}>
                {t("calculator.pageTitleFull")}
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color:"rgba(255,255,255,0.68)", maxWidth:"420px" }}>
                {t("calculator.pageSubtitle")}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {([t("calculator.badgeTransparent"), t("calculator.badgeFormula"), t("calculator.badgeLiveRates")] as string[]).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.85)", border:"1px solid rgba(255,255,255,0.18)" }}>
                  <CheckCircle2 className="h-3 w-3" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-7">
        {ratesUnavailable && (
          <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[13px]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <span>Canonical rate calculator belum tersedia. Kalkulasi tidak dijalankan dengan angka fallback.</span>
          </div>
        )}
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            <div className="calc-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"linear-gradient(135deg,#0B5CAD,#1A73D4)", boxShadow:"0 4px 12px rgba(11,92,173,0.30)" }}>
                    <Calculator className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[14px] leading-tight">
                      {svc ? `${svc.emoji} ${svcLabelFull(service!)}` : t("calculator.formTitle")}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {svc ? t("calculator.formSubtitleSelected") : t("calculator.formSubtitleEmpty")}
                    </p>
                  </div>
                </div>
                {calculated && (
                  <button onClick={handleReset} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
                    <RefreshCw className="h-3.5 w-3.5" /> {t("calculator.reset")}
                  </button>
                )}
              </div>

              <form onSubmit={handleCalculate} className="space-y-6">

                {/* ── STEP 1: Service Selector ── */}
                <div>
                  <SectionTitle n={1}>{t("calculator.stepSelectService")}</SectionTitle>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(["seaFreight","airFreight","customs","domestic","warehousing","projectCargo"] as ServiceType[]).map(s => {
                      const cfg = SERVICE_CONFIG[s as string];
                      const isActive = service === s;
                      return (
                        <button key={s} type="button" onClick={() => handleServiceChange(s)}
                          className={`svc-btn${isActive ? " svc-btn-active" : ""}`}
                          style={isActive ? { background: cfg.gradient } : {}}>
                          <span style={isActive ? { color:"white" } : { color: cfg.color }}>{cfg.icon}</span>
                          <span style={{ fontSize:"10px", lineHeight:1.2, textAlign:"center" }}>{svcLabel(s)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {svc && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: svc.color }}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t("calculator.serviceSelectedHint").replace("{service}", svcLabelFull(service!))}
                    </div>
                  )}
                </div>

                {!service && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <Calculator className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-[13px]">{t("calculator.emptyHint")}</p>
                  </div>
                )}

                {/* ── STEP 2: Common Fields ── */}
                {service && (
                  <div>
                    <SectionTitle n={2}>{t("calculator.stepGeneralInfo")}</SectionTitle>
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>{t("calculator.customerName")}</Label>
                          <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t("calculator.customerNamePlaceholder")} />
                        </div>
                        <div>
                          <Label>{t("calculator.incoterms")}</Label>
                          <Select value={incoterms} onChange={e => setIncoterms(e.target.value)}>
                            <option value="">{t("calculator.selectIncotermsPlaceholder")}</option>
                            {["EXW","FOB","CIF","CFR","DAP","DDP","FCA","CPT","CIP","FAS"].map(i => <option key={i}>{i}</option>)}
                          </Select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>
                            {service === "domestic" ? t("calculator.originCity") : service === "seaFreight" ? t("calculator.pol") : t("calculator.origin")}
                          </Label>
                          {companyOrigin ? (
                            <div className="calc-input flex items-center gap-2 bg-orange-50 border-orange-200 cursor-not-allowed select-none" style={{ color:"#C2410C" }}>
                              <span className="text-sm">🇮🇩</span><span className="font-medium text-[13px]">{origin}</span>
                              <span className="ml-auto text-[10px] text-orange-400">{t("calculator.autoFilled")}</span>
                            </div>
                          ) : (
                            <Input value={origin} onChange={e => setOrigin(e.target.value)} placeholder={t("calculator.originPlaceholder")} />
                          )}
                        </div>
                        <div>
                          <Label req>
                            {service === "domestic" ? t("calculator.destinationCity") : service === "seaFreight" ? t("calculator.pod") : t("calculator.destination")}
                          </Label>
                          <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder={t("calculator.destinationPlaceholder")} style={{ borderColor: !destination && error ? "#FCA5A5" : "" }} />
                        </div>
                      </div>
                      <div>
                        <Label>{t("calculator.cargoDescLabel")}</Label>
                        <Input value={cargoDesc} onChange={e => setCargoDesc(e.target.value)} placeholder={t("calculator.cargoDescPlaceholder")} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>{t("calculator.cargoValue")}</Label>
                          <Input value={cargoValue} onChange={e => setCargoValue(e.target.value)} placeholder={t("calculator.valuePlaceholder")} type="text" />
                        </div>
                        <div className="flex flex-col justify-end">
                          <Check checked={insured} onChange={setInsured}
                            label={t("calculator.addInsurance")}
                            sub={t("calculator.addInsuranceSub").replace("{pct}", String(service === "airFreight" ? rates.airFreight.insurancePct : rates.seaFreight.insurancePct))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Service-Specific Fields ── */}

                {/* SEA FREIGHT */}
                {service === "seaFreight" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailSeaFreight")}</SectionTitle>
                    <div className="space-y-3">
                      <div>
                        <Label req>{t("calculator.shipmentType")}</Label>
                        <div className="flex gap-2">
                          {(["LCL","FCL"] as const).map(st => (
                            <button key={st} type="button" onClick={() => setSeaShipmentType(st)}
                              className={`shipment-type-btn${seaShipmentType === st ? " active" : ""}`}>
                              <Box className="h-4 w-4" /> {st}
                              <span className="text-[11px] text-slate-400">{st === "LCL" ? `— ${t("calculator.perCbm")}` : `— ${t("calculator.fullContainer")}`}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {seaShipmentType === "FCL" && (
                        <div>
                          <Label req>{t("calculator.containerType")}</Label>
                          <Select value={seaContainerType} onChange={e => setSeaContainerType(e.target.value)}>
                            {["20GP","40GP","40HC","Reefer","Open Top","Flat Rack"].map(ct => (
                              <option key={ct} value={ct}>{ct} — {fmtIDR(rates.seaFreight.ratePerContainer[ct] ?? 0)}</option>
                            ))}
                          </Select>
                        </div>
                      )}
                      {seaShipmentType === "LCL" && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label req>{t("calculator.volume")}</Label>
                            <Input type="number" min="0" step="0.001" value={seaCbm} onChange={e => setSeaCbm(e.target.value)} placeholder="0.000 CBM" />
                            <p className="text-[10.5px] text-slate-400 mt-1">{t("calculator.rateLabel", "Tarif")}: {fmtIDR(rates.seaFreight.ratePerCbmLcl)}/CBM</p>
                          </div>
                          <div>
                            <Label>{t("calculator.grossWeightKg")}</Label>
                            <Input type="number" min="0" value={seaGrossWeight} onChange={e => setSeaGrossWeight(e.target.value)} placeholder={t("calculator.grossWeightPlaceholder")} />
                          </div>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>{t("calculator.commodity")}</Label>
                          <Input value={seaCommodity} onChange={e => setSeaCommodity(e.target.value)} placeholder={t("calculator.commodityPlaceholder")} />
                        </div>
                        <div>
                          <Label>{t("calculator.readyDate")}</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Check checked={seaDg} onChange={setSeaDg} label={t("calculator.dangerousGoods")} sub={t("calculator.dgSurcharge")} />
                        <Check checked={seaTrucking} onChange={setSeaTrucking} label={t("calculator.inlandTrucking")} sub={`+${fmtIDR(rates.seaFreight.truckingFee)}`} />
                        <Check checked={seaCustoms} onChange={setSeaCustoms} label={t("calculator.customsFee")} sub={`+${fmtIDR(rates.seaFreight.customsClearance)}`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* AIR FREIGHT */}
                {service === "airFreight" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailAirFreight")}</SectionTitle>
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>{t("calculator.originAirport")}</Label>
                          <Input value={airOriginAirport} onChange={e => setAirOriginAirport(e.target.value)} placeholder="CGK — Soekarno-Hatta" />
                        </div>
                        <div>
                          <Label req>{t("calculator.destAirport")}</Label>
                          <Input value={airDestAirport} onChange={e => setAirDestAirport(e.target.value)} placeholder="SIN — Changi Singapore" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <Label req>{t("calculator.grossWeightKg")}</Label>
                          <Input type="number" min="0" step="0.1" value={airWeight} onChange={e => setAirWeight(e.target.value)} placeholder="0.0 kg" />
                        </div>
                        <div>
                          <Label>{t("calculator.piecesCount")}</Label>
                          <Input type="number" min="1" value={airPieces} onChange={e => setAirPieces(e.target.value)} placeholder="1" />
                        </div>
                        <div>
                          <Label>{t("calculator.airline")}</Label>
                          <Input value={airAirline} onChange={e => setAirAirline(e.target.value)} placeholder={t("calculator.airlinePlaceholder")} />
                        </div>
                      </div>
                      <div>
                        <label className="calc-label flex items-center gap-2">
                          {t("calculator.dimensionsPerPiece")}
                          {airVolumetric !== null && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background:"#EFF6FF", color:"#1D4ED8", border:"1px solid #BFDBFE" }}>
                              <Sparkles className="h-2.5 w-2.5" /> Vol. Weight: {airVolumetric.toFixed(2)} kg
                            </span>
                          )}
                          {airChargeable !== null && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background:"#F0FDF4", color:"#15803D", border:"1px solid #BBF7D0" }}>
                              <Zap className="h-2.5 w-2.5" /> Chargeable: {airChargeable.toFixed(2)} kg
                            </span>
                          )}
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          <Input type="number" min="0" step="0.1" value={airLength} onChange={e => setAirLength(e.target.value)} placeholder="P (cm)" />
                          <Input type="number" min="0" step="0.1" value={airWidth} onChange={e => setAirWidth(e.target.value)} placeholder="L (cm)" />
                          <Input type="number" min="0" step="0.1" value={airHeight} onChange={e => setAirHeight(e.target.value)} placeholder="T (cm)" />
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-1.5">{t("calculator.volWeightNote")}</p>
                      </div>
                      <div>
                        <Label>{t("calculator.commodity")}</Label>
                        <Input value={airCommodity} onChange={e => setAirCommodity(e.target.value)} placeholder={t("calculator.commodityPlaceholder")} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Check checked={airDg} onChange={setAirDg} label={`${t("calculator.dangerousGoods")} (DG)`} sub="+IDR 2.000.000" />
                        <Check checked={airTempControlled} onChange={setAirTempControlled} label={t("calculator.temperatureControlled")} sub="+IDR 1.500.000" />
                      </div>
                    </div>
                  </div>
                )}

                {/* PPJK / CUSTOMS */}
                {service === "customs" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailCustoms")}</SectionTitle>
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>{t("calculator.tradeType")}</Label>
                          <div className="flex gap-2">
                            {(["import","export"] as const).map(tt => (
                              <button key={tt} type="button" onClick={() => { setCustomsTradeType(tt); setCustomsDocType(tt === "import" ? "PIB" : "PEB"); }}
                                className={`shipment-type-btn${customsTradeType === tt ? " active" : ""}`}>
                                {tt === "import" ? "📥" : "📤"} {tt.charAt(0).toUpperCase() + tt.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>{t("calculator.document")}</Label>
                          <Select value={customsDocType} onChange={e => setCustomsDocType(e.target.value as "PIB"|"PEB")}>
                            <option value="PIB">{t("calculator.pibOption", "PIB — Pemberitahuan Impor Barang")}</option>
                            <option value="PEB">{t("calculator.pebOption", "PEB — Pemberitahuan Ekspor Barang")}</option>
                          </Select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>{t("calculator.hsCode")}</Label>
                          <Input value={customsHsCode} onChange={e => setCustomsHsCode(e.target.value)} placeholder="8471.30.00.00" />
                        </div>
                        <div>
                          <Label>{t("calculator.commodity")}</Label>
                          <Input value={customsCommodity} onChange={e => setCustomsCommodity(e.target.value)} placeholder={t("calculator.commodityPlaceholder")} />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>{t("calculator.customsValue")}</Label>
                          <Input value={customsNilaiPabean} onChange={e => setCustomsNilaiPabean(e.target.value)} placeholder="Rp 500.000.000" />
                          <p className="text-[10.5px] text-slate-400 mt-1">{t("calculator.customsValueNote")}</p>
                        </div>
                        <div>
                          <Label>{t("calculator.npwp")}</Label>
                          <Input value={customsNpwp} onChange={e => setCustomsNpwp(e.target.value)} placeholder="XX.XXX.XXX.X-XXX.XXX" />
                        </div>
                      </div>
                      <div>
                        <Label>{t("calculator.applicationNumber")}</Label>
                        <Input value={customsNomorAju} onChange={e => setCustomsNomorAju(e.target.value)} placeholder="Diisi jika sudah ada" />
                      </div>
                      <Check checked={customsAddlService} onChange={setCustomsAddlService} label={t("calculator.additionalServices")} sub={`+${formatIDR(rates.customs.additionalServiceFee)}`} />
                    </div>
                  </div>
                )}

                {/* TRUCKING */}
                {service === "domestic" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailTrucking")}</SectionTitle>
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>{t("calculator.pickupAddress")}</Label>
                          <Input value={truckPickup} onChange={e => setTruckPickup(e.target.value)} placeholder="Jl. Raya No. 1, Tangerang" />
                        </div>
                        <div>
                          <Label req>{t("calculator.deliveryAddress")}</Label>
                          <Input value={truckDelivery} onChange={e => setTruckDelivery(e.target.value)} placeholder="Jl. Industri No. 5, Surabaya" />
                        </div>
                      </div>
                      <div>
                        <Label req>{t("calculator.vehicleType")}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(rates.domestic.vehicleRates).map(([v, r]) => (
                            <button key={v} type="button" onClick={() => setTruckVehicle(v)}
                              className={`shipment-type-btn flex-col gap-0.5 py-3${truckVehicle === v ? " active" : ""}`}
                              style={{ minHeight: "auto" }}>
                              <span className="text-[12.5px] font-bold">{v}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{formatIDR(r)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <Label req>{t("calculator.distanceKm")}</Label>
                          <Input type="number" min="0" value={truckDistance} onChange={e => setTruckDistance(e.target.value)} placeholder="0 km" />
                          <p className="text-[10.5px] text-slate-400 mt-1">+{formatIDR(rates.domestic.distanceRatePerKm)}/km</p>
                        </div>
                        <div>
                          <Label>{t("calculator.tonnage")}</Label>
                          <Input type="number" min="0" step="0.1" value={truckTonase} onChange={e => setTruckTonase(e.target.value)} placeholder="0.0 ton" />
                        </div>
                        <div>
                          <Label>{t("calculator.koli")}</Label>
                          <Input type="number" min="0" value={truckKoli} onChange={e => setTruckKoli(e.target.value)} placeholder="0 koli" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Check checked={truckLoading} onChange={setTruckLoading} label="Loading" sub={formatIDR(rates.domestic.loadingFee)} />
                        <Check checked={truckUnloading} onChange={setTruckUnloading} label="Unloading" sub={formatIDR(rates.domestic.unloadingFee)} />
                        <Check checked={truckOvernight} onChange={setTruckOvernight} label="Overnight" sub={formatIDR(rates.domestic.overnightFee)} />
                        <div className="flex items-center gap-2 option-toggle" style={{ flex:"0 0 auto" }}>
                          <span className="text-[12.5px] font-semibold text-slate-700">{t("calculator.helperDays")}</span>
                          <button type="button" onClick={() => setTruckHelperDays(d => String(Math.max(0, parseInt(d)-1)))} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><Minus className="h-3 w-3" /></button>
                          <span className="font-bold w-6 text-center text-[13px]">{truckHelperDays}</span>
                          <button type="button" onClick={() => setTruckHelperDays(d => String(parseInt(d)+1))} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WAREHOUSING */}
                {service === "warehousing" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailWarehousing")}</SectionTitle>
                    <div className="space-y-3">
                      <div>
                        <Label>{t("calculator.warehouseLocation")}</Label>
                        <Input value={whLocation} onChange={e => setWhLocation(e.target.value)} placeholder={t("calculator.warehouseLocationPlaceholder")} />
                      </div>
                      <div>
                        <Label req>{t("calculator.storageType")}</Label>
                        <div className="flex gap-2">
                          {(["Pallet","CBM","SQM"] as const).map(st => (
                            <button key={st} type="button" onClick={() => setWhStorageType(st)}
                              className={`shipment-type-btn flex-col gap-0.5 py-3${whStorageType === st ? " active" : ""}`}>
                              <span className="text-[12.5px] font-bold">{st}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {st === "Pallet" ? formatIDR(rates.warehousing.palletRatePerDay) : st === "CBM" ? formatIDR(rates.warehousing.cbmRatePerDay) : formatIDR(rates.warehousing.sqmRatePerDay)}{t("calculator.perDay")}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label req>{t("calculator.quantity")} ({whStorageType === "Pallet" ? "pallet" : whStorageType === "CBM" ? "CBM" : "m²"})</Label>
                          <Input type="number" min="0" step={whStorageType === "CBM" ? "0.01" : "1"} value={whQty} onChange={e => setWhQty(e.target.value)} placeholder="0" />
                        </div>
                        <div>
                          <Label req>{t("calculator.duration")}</Label>
                          <Input type="number" min="1" value={whDuration} onChange={e => setWhDuration(e.target.value)} placeholder={t("calculator.durationPlaceholder")} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Check checked={whInbound} onChange={setWhInbound} label={t("calculator.inboundHandling")} sub={`${formatIDR(rates.warehousing.inboundFee)}/unit`} />
                        <Check checked={whOutbound} onChange={setWhOutbound} label={t("calculator.outboundHandling")} sub={`${formatIDR(rates.warehousing.outboundFeePerPallet)}/unit`} />
                        <Check checked={whInventory} onChange={setWhInventory} label={t("calculator.inventoryManagement")} sub={`${formatIDR(rates.warehousing.inventoryFeePerMonth)}/bulan`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* PROJECT CARGO */}
                {service === "projectCargo" && (
                  <div>
                    <SectionTitle n={3}>{t("calculator.detailProjectCargo")}</SectionTitle>
                    <div className="space-y-3">
                      <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        <p className="text-[12px] text-violet-700">{t("calculator.projectCargoWarning")}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="calc-label">{t("calculator.cargoDimensions")}</label>
                          <div className="grid grid-cols-3 gap-2">
                            <Input type="number" min="0" step="0.01" value={pcLength} onChange={e => setPcLength(e.target.value)} placeholder="P (m)" />
                            <Input type="number" min="0" step="0.01" value={pcWidth} onChange={e => setPcWidth(e.target.value)} placeholder="L (m)" />
                            <Input type="number" min="0" step="0.01" value={pcHeight} onChange={e => setPcHeight(e.target.value)} placeholder="T (m)" />
                          </div>
                        </div>
                        <div>
                          <Label>{t("calculator.weightPerPiece")}</Label>
                          <Input type="number" min="0" step="0.1" value={pcWeight} onChange={e => setPcWeight(e.target.value)} placeholder="0.0 ton" />
                        </div>
                      </div>
                      <div>
                        <label className="calc-label">{t("calculator.specialRequirements")}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <Check checked={pcHeavyLift} onChange={setPcHeavyLift} label={t("calculator.heavyLift")} sub={t("calculator.heavyLiftSub")} />
                          <Check checked={pcOversize} onChange={setPcOversize} label={t("calculator.oversize")} sub={t("calculator.oversizeSub")} />
                          <Check checked={pcCrane} onChange={setPcCrane} label={t("calculator.craneRequired")} sub={t("calculator.craneSub")} />
                          <Check checked={pcRouteSurvey} onChange={setPcRouteSurvey} label={t("calculator.routeSurvey")} sub={t("calculator.routeSurveySub")} />
                          <Check checked={pcEscort} onChange={setPcEscort} label={t("calculator.escortRequired")} sub={t("calculator.escortSub")} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Notes ── */}
                {service && (
                  <div>
                    <SectionTitle n={4}>{t("calculator.additionalNotes")}</SectionTitle>
                    <textarea
                      value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder={t("calculator.notesPlaceholder")}
                      className="calc-input" rows={2} style={{ resize:"vertical" }}
                    />
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 rounded-xl px-4 py-3 text-[13px] font-medium" style={{ background:"#FEF2F2", border:"1.5px solid #FECACA" }}>
                    <Info className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                {/* CTA */}
                {service && (
                  <button type="submit" className="w-full flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-200 select-none"
                    style={{ height:"48px", fontSize:"14.5px", background:"linear-gradient(135deg,#0B5CAD 0%,#1A73D4 50%,#2B8FE8 100%)", color:"white", boxShadow:"0 4px 20px rgba(11,92,173,0.35),inset 0 1px 0 rgba(255,255,255,0.18)", border:"none" }}
                    onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 8px 28px rgba(11,92,173,0.40),inset 0 1px 0 rgba(255,255,255,0.18)"; }}
                    onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 4px 20px rgba(11,92,173,0.35),inset 0 1px 0 rgba(255,255,255,0.18)"; }}>
                    <Calculator className="h-5 w-5" /> {t("calculator.calculateButton")} <ChevronRight className="h-4 w-4 opacity-70" />
                  </button>
                )}

              </form>
            </div>
          </div>

          {/* ── Right Panel: Results ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Empty State */}
            {!calculated && (
              <div className="calc-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}>
                  <Calculator className="h-7 w-7" style={{ color:"#3B82F6" }} />
                </div>
                <h3 className="font-bold text-slate-700 text-[15px] mb-1.5">{t("calculator.result")}</h3>
                <p className="text-slate-400 text-[12.5px] leading-relaxed max-w-[220px] mx-auto">
                  {t("calculator.resultEmpty")}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="space-y-2.5">
                    {(["seaFreight","airFreight","customs","domestic","warehousing","projectCargo"] as const).map(s => {
                      const cfg = SERVICE_CONFIG[s];
                      return (
                        <button key={s} type="button" onClick={() => handleServiceChange(s)}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <span className="text-base">{cfg.emoji}</span>
                          <span className="text-[12.5px] font-semibold text-slate-700">{svcLabelFull(s)}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Project Cargo Budget Range */}
            {calculated && result?.isProjectCargo && (
              <div className="calc-card p-6 result-appear" style={{ border:"1.5px solid #DDD6FE" }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#7C3AED,#A78BFA)" }}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[14px] text-slate-800">{t("calculator.projectCargoResultTitle")}</p>
                    <p className="text-[11px] text-slate-400">{t("calculator.estimatedBudgetRange")}</p>
                  </div>
                </div>
                {result.cbm && (
                  <div className="bg-violet-50 rounded-xl p-3 mb-4 text-center">
                    <p className="text-[10.5px] text-violet-600 font-semibold uppercase mb-1">{t("calculator.cargoVolume")}</p>
                    <p className="text-[24px] font-bold text-violet-800">{result.cbm} <span className="text-[14px]">m³</span></p>
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  {[pcHeavyLift && "Heavy Lift", pcOversize && "Oversize", pcCrane && "Crane", pcRouteSurvey && "Route Survey", pcEscort && "Escort"].filter(Boolean).map(f => (
                    <div key={f as string} className="flex items-center gap-2 text-[12.5px] text-violet-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {f}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4 text-center mb-4" style={{ background:"linear-gradient(135deg,#F5F3FF,#EDE9FE)" }}>
                  <p className="text-[11px] font-bold text-violet-600 uppercase mb-1">{t("calculator.estimatedBudgetRange", "Estimated Budget Range")}</p>
                  <p className="text-[13px] text-violet-700 font-semibold">{formatIDR(result.budgetMin ?? 0)}</p>
                  <p className="text-[11px] text-violet-400 font-medium">{t("calculator.to", "s/d")}</p>
                  <p className="text-[22px] font-bold text-violet-800">{formatIDR(result.budgetMax ?? 0)}</p>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{t("calculator.projectCargoNote", "Estimasi ini bersifat indikatif. Penawaran resmi memerlukan survei & kalkulasi khusus.")}</p>
                <div className="space-y-2">
                  <button onClick={() => setShowQuoteForm(true)} className="w-full h-10 flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] text-white transition-all"
                    style={{ background:"linear-gradient(135deg,#7C3AED,#A78BFA)", boxShadow:"0 4px 14px rgba(124,58,237,0.35)" }}>
                    <FileText className="h-4 w-4" /> {t("calculator.requestOfficialQuotation", "Request Official Quotation")}
                  </button>
                  <a href={buildWaHref(`Halo, saya ingin berdiskusi mengenai estimasi biaya logistik yang saya hitung.`)} target="_blank" rel="noreferrer" className="w-full h-10 flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] border border-green-300 text-green-700 hover:bg-green-50 transition-colors">
                    <MessageCircle className="h-4 w-4" /> {t("calculator.discussWhatsApp", "Diskusi via WhatsApp")}
                  </a>
                </div>
              </div>
            )}

            {/* Result Breakdown */}
            {calculated && result && !result.isProjectCargo && (
              <div className="space-y-4 result-appear">

                {/* Cargo Metrics */}
                {(result.chargeableWeight !== undefined || result.cbm !== undefined) && (
                  <div className="calc-card p-4" style={{ border:`1.5px solid ${svc?.color}40` }}>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: svc?.color }}>{t("calculator.cargoMetrics")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {result.volumetricWeight !== undefined && (
                        <div className="rounded-xl p-3 text-center bg-slate-50">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Volumetric</p>
                          <p className="text-[18px] font-bold text-slate-800">{result.volumetricWeight}</p>
                          <p className="text-[10px] text-slate-400">kg</p>
                        </div>
                      )}
                      {result.chargeableWeight !== undefined && (
                        <div className="rounded-xl p-3 text-center" style={{ background: `${svc?.color}10` }}>
                          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: svc?.color }}>Chargeable</p>
                          <p className="text-[18px] font-bold" style={{ color: svc?.color }}>{result.chargeableWeight}</p>
                          <p className="text-[10px]" style={{ color: `${svc?.color}99` }}>kg</p>
                        </div>
                      )}
                      {result.cbm !== undefined && (
                        <div className="rounded-xl p-3 text-center col-span-2" style={{ background: `${svc?.color}10` }}>
                          <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: svc?.color }}>Volume CBM</p>
                          <p className="text-[18px] font-bold" style={{ color: svc?.color }}>{result.cbm}</p>
                          <p className="text-[10px]" style={{ color: `${svc?.color}99` }}>CBM</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="calc-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="h-4 w-4" style={{ color: svc?.color }} />
                    <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: svc?.color }}>{t("calculator.costBreakdown")}</p>
                  </div>

                  <div className="space-y-0">
                    {result.items.map((item, i) => (
                      <div key={i} className="cost-row">
                        <div>
                          <p className="text-[13px] text-slate-700">{item.label}</p>
                          {item.note && <p className="text-[10.5px] text-slate-400">{item.note}</p>}
                        </div>
                        <span className="font-semibold text-slate-800 text-[13px] ml-2 shrink-0">{formatIDR(item.value)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-600">{t("calculator.subtotal")}</span>
                      <span className="font-semibold">{formatIDR(result.subtotal)}</span>
                    </div>
                    {result.insurance > 0 && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-600 flex items-center gap-1"><Shield className="h-3 w-3 text-green-500" /> {t("calculator.insuranceLabel")}</span>
                        <span className="font-semibold">{formatIDR(result.insurance)}</span>
                      </div>
                    )}
                    {result.ppn > 0 && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-600">PPN {service === "airFreight" ? rates.airFreight.ppnPct : rates.seaFreight.ppnPct}%</span>
                        <span className="font-semibold">{formatIDR(result.ppn)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl p-4 text-center" style={{ background:`linear-gradient(135deg,${svc?.color}12,${svc?.color}06)`, border:`1.5px solid ${svc?.color}30` }}>
                    <p className="text-[10.5px] font-bold uppercase tracking-widest mb-1" style={{ color: svc?.color }}>{t("calculator.estimateGrandTotal")}</p>
                    <p className="text-[28px] font-black" style={{ color: svc?.color }}>{formatIDR(result.grandTotal)}</p>
                    <p className="text-[10.5px] mt-1" style={{ color: `${svc?.color}80` }}>{t("calculator.grandTotalNote")}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button onClick={() => setShowQuoteForm(true)} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-[13.5px] text-white transition-all"
                      style={{ background:`linear-gradient(135deg,#0B5CAD,#1A73D4)`, boxShadow:"0 4px 14px rgba(11,92,173,0.35)" }}>
                      <FileText className="h-4 w-4" /> {t("calculator.requestQuoteFull")}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={buildWaHref(`Estimasi ${svcLabelFull(service!)}: ${formatIDR(result.grandTotal)}\nRute: ${origin} → ${destination}`)}
                        target="_blank" rel="noreferrer"
                        className="h-9 flex items-center justify-center gap-1.5 rounded-xl font-semibold text-[12px] border border-green-300 text-green-700 hover:bg-green-50 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                      <button onClick={() => window.print()}
                        className="h-9 flex items-center justify-center gap-1.5 rounded-xl font-semibold text-[12px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <Receipt className="h-3.5 w-3.5" /> {t("calculator.savePdf")}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => exportCalcCSV(result, svcLabelFull(service!))}
                        className="h-9 flex items-center justify-center gap-1.5 rounded-xl font-semibold text-[12px] border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
                        <Download className="h-3.5 w-3.5" /> {t("calculator.exportCsv")}
                      </button>
                      <button onClick={() => exportCalcJSON(result, svcLabelFull(service!))}
                        className="h-9 flex items-center justify-center gap-1.5 rounded-xl font-semibold text-[12px] border border-violet-200 text-violet-700 hover:bg-violet-50 transition-colors">
                        <Download className="h-3.5 w-3.5" /> {t("calculator.exportJson")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Success */}
            {quoteSuccess && (
              <div className="calc-card p-6 text-center result-appear" style={{ border:"1.5px solid #BBF7D0" }}>
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-[15px] text-slate-800 mb-2">{t("calculator.quoteSentTitle")}</h3>
                <p className="text-slate-500 text-[12.5px] leading-relaxed">{t("calculator.quoteSentDesc")}</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Quote Request Modal ── */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}>
          <div className="calc-card w-full max-w-md p-6 result-appear">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-800 text-[16px]">{t("calculator.quoteModalTitle")}</h2>
                <p className="text-[11.5px] text-slate-400 mt-0.5">{t("calculator.quoteModalSubtitle")}</p>
              </div>
              <button onClick={() => setShowQuoteForm(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Summary */}
            {result && (
              <div className="rounded-xl p-3 mb-5" style={{ background:`linear-gradient(135deg,${svc?.color}10,${svc?.color}06)`, border:`1px solid ${svc?.color}20` }}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-slate-700">{svc?.emoji} {service ? svcLabelFull(service) : ""}</span>
                  <span className="font-bold" style={{ color: svc?.color }}>
                    {result.isProjectCargo ? `${formatIDR(result.budgetMin ?? 0)} – ${formatIDR(result.budgetMax ?? 0)}` : formatIDR(result.grandTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{origin} → {destination}</p>
              </div>
            )}

            <form onSubmit={handleQuoteSubmit} className="space-y-3">
              <div>
                <Label req>{t("calculator.fullName")}</Label>
                <Input value={quoteName} onChange={e => setQuoteName(e.target.value)} placeholder={t("calculator.fullNamePlaceholder")} />
              </div>
              <div>
                <Label>{t("calculator.email")}</Label>
                <Input type="email" value={quoteEmail} onChange={e => setQuoteEmail(e.target.value)} placeholder="budi@perusahaan.com" />
              </div>
              <div>
                <Label req>{t("calculator.whatsapp")}</Label>
                <Input type="tel" value={quoteWa} onChange={e => setQuoteWa(e.target.value)} placeholder="081234567890" />
              </div>
              {quoteError && (
                <div className="text-red-600 text-[12.5px] bg-red-50 border border-red-200 rounded-lg px-3 py-2">{quoteError}</div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => setShowQuoteForm(false)} className="h-11 rounded-xl font-semibold text-[13px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  {t("calculator.cancel")}
                </button>
                <button type="submit" disabled={quoteSubmitting} className="h-11 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background:"linear-gradient(135deg,#0B5CAD,#1A73D4)", boxShadow:"0 4px 14px rgba(11,92,173,0.30)", opacity: quoteSubmitting ? 0.7 : 1 }}>
                  {quoteSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {quoteSubmitting ? t("calculator.sending") : t("calculator.sendRequest")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
