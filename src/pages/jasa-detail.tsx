import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { WhatsAppButtonStandalone } from "@/components/WhatsAppButton";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Ship, Plane, Download, Upload, MapPin, Home,
  Package, Warehouse, Truck, FileCheck, Shield, FileText,
  Calculator, ArrowLeft, ArrowRight, ShoppingCart, CheckCircle2,
  Plus, Trash2, ChevronRight,
} from "lucide-react";
import {
  CATEGORIES, CATEGORY_COLORS_DETAIL,
  type ServiceCategory, type CalculatorType,
} from "@/lib/services-data";
import { useListPortalServices } from "@shared/api-client-react";
import { useCart } from "@/lib/logistic-cart";
import { formatCurrency } from "@/lib/utils";
import { isAuthenticated } from "@/lib/auth";
import { AirportCombobox } from "@/components/AirportCombobox";
import { LocationCombobox, type GeoLocation } from "@/components/LocationCombobox";
import { staticAsset } from "@/lib/staticAssets";

const stripJasa = (name: string) => name.replace(/^Jasa\s+/i, "");

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ship, Plane, Download, Upload, MapPin, Home,
  Package, Warehouse, Truck, FileCheck, Shield, FileText,
};

const CAT_TO_CALC: Record<string, CalculatorType> = {
  "Udara": "air_freight",
  "Laut": "sea_lcl",
  "Container": "sea_fcl",
  "Trucking": "trucking",
  "Pabean": "customs",
  "Handling": "generic",
  "Storage": "storage",
  "Document": "document",
  "Additional": "additional",
  "Freight Forwarding": "generic",
  "Lainnya": "generic",
};

const CAT_TO_SERVICE_CAT: Record<string, ServiceCategory> = {
  "Udara": "Freight",
  "Laut": "Freight",
  "Container": "Freight",
  "Trucking": "Trucking",
  "Pabean": "Customs",
  "Handling": "Handling",
  "Storage": "Storage",
  "Document": "Document",
  "Additional": "Additional",
  "Freight Forwarding": "Freight",
  "Lainnya": "Additional",
};

type CalcState = Record<string, string>;

type AirRow = {
  id: string;
  grossWeight: string;
  quantity: string;
  length: string;
  width: string;
  height: string;
};

function newAirRow(): AirRow {
  return { id: crypto.randomUUID(), grossWeight: "", quantity: "1", length: "", width: "", height: "" };
}

type DimRow = {
  id: string;
  panjang: string;
  lebar: string;
  tinggi: string;
  koliQty: string;
};

function newDimRow(): DimRow {
  return { id: crypto.randomUUID(), panjang: "", lebar: "", tinggi: "", koliQty: "" };
}

function rowChargeableWeight(row: AirRow): number {
  const gw = parseFloat(row.grossWeight) || 0;
  const qty = parseFloat(row.quantity) || 1;
  const vw = ((parseFloat(row.length) || 0) * (parseFloat(row.width) || 0) * (parseFloat(row.height) || 0) * qty) / 6000;
  return Math.max(gw * qty, vw);
}

function rowVolumeWeight(row: AirRow): number {
  const qty = parseFloat(row.quantity) || 1;
  return ((parseFloat(row.length) || 0) * (parseFloat(row.width) || 0) * (parseFloat(row.height) || 0) * qty) / 6000;
}

function calcSubtotal(calcType: string, state: CalcState, airRows?: AirRow[]): number {
  try {
    switch (calcType) {
      case "air_freight": {
        const rate = parseFloat(state.ratePerKg) || 0;
        const rows = airRows && airRows.length > 0 ? airRows : [];
        const totalCW = rows.reduce((sum, row) => sum + rowChargeableWeight(row), 0);
        return totalCW * rate;
      }
      case "sea_fcl": {
        return (parseFloat(state.freightRate) || 0) + (parseFloat(state.handlingFee) || 0);
      }
      case "sea_lcl": {
        const cbm = parseFloat(state.cbm) || 0;
        const rate = parseFloat(state.ratePerCbm) || 0;
        const min = parseFloat(state.minimumCharge) || 0;
        return Math.max(cbm * rate, min);
      }
      case "customs": {
        return (parseFloat(state.customsFee) || 0) + (parseFloat(state.documentFee) || 0) +
          (parseFloat(state.pibPebFee) || 0) + (parseFloat(state.permitFee) || 0);
      }
      case "trucking": {
        return (parseFloat(state.distance) || 0) * (parseFloat(state.truckingRate) || 0) + (parseFloat(state.loadingFee) || 0);
      }
      case "storage": {
        return (parseFloat(state.days) || 0) * (parseFloat(state.quantity) || 1) * (parseFloat(state.ratePerDay) || 0);
      }
      case "document": {
        return (parseFloat(state.quantity) || 0) * (parseFloat(state.feePerDocument) || 0);
      }
      case "additional": {
        return (parseFloat(state.serviceFee) || 0) + (parseFloat(state.adminFee) || 0);
      }
      default: {
        return (parseFloat(state.quantity) || 1) * (parseFloat(state.unitPrice) || 0);
      }
    }
  } catch {
    return 0;
  }
}

function calcResult(calcType: string, state: CalcState, airRows?: AirRow[]): Record<string, unknown> {
  if (calcType === "air_freight") {
    const rate = parseFloat(state.ratePerKg) || 0;
    const rows = airRows ?? [];
    const totalCW = rows.reduce((sum, row) => sum + rowChargeableWeight(row), 0);
    const totalVW = rows.reduce((sum, row) => sum + rowVolumeWeight(row), 0);
    return {
      totalVolumeWeight: totalVW.toFixed(2),
      totalChargeableWeight: totalCW.toFixed(2),
      ratePerKg: rate,
      total: (totalCW * rate).toFixed(2),
      rows: rows.length,
    };
  }
  return { total: calcSubtotal(calcType, state).toFixed(2) };
}

const VEHICLE_LIST = [
  { key: "CDE",                      label: "CDE",                      rateKey: "CDE"     },
  { key: "CDD",                      label: "CDD",                      rateKey: "CDD"     },
  { key: "Fuso",                     label: "Fuso",                     rateKey: "Fuso"    },
  { key: "Tronton",                  label: "Tronton",                  rateKey: "Wingbox" },
  { key: "Trailer Truck / Kontainer",label: "Trailer Truck / Kontainer",rateKey: "Trailer" },
] as const;

const VEHICLE_SUBTYPES: Record<string, string[]> = {
  "CDE":                       ["CDE Bak", "CDE Box"],
  "CDD":                       ["CDD Bak", "CDD Box"],
  "Fuso":                      ["Fuso Box (8 Tons)", "Fuso Box (10 Tons)", "Fuso Pickup (8 Tons)", "Fuso Pickup (10 Tons)"],
  "Tronton":                   ["Tronton Wing Box (18 Tons)", "Tronton Wing Box (22 Tons)", "Tronton Wing Box (25 Tons)", "Tronton Pickup (18 Tons)", "Tronton Pickup (22 Tons)", "Tronton Pickup (25 Tons)"],
  "Trailer Truck / Kontainer": ["Trailer 20 ft", "Trailer 40 ft", "Trailer Flatbed"],
};

const VEHICLE_CAPACITY: Record<string, string> = {
  "CDE":                       "Maks. kapasitas 2 Ton",
  "CDD":                       "Maks. kapasitas 5 Ton",
  "Fuso":                      "Maks. kapasitas 10 Ton",
  "Tronton":                   "Maks. kapasitas 25 Ton",
  "Trailer Truck / Kontainer": "Maks. kapasitas 40 ft",
};

type SubtypeSpec = {
  dims: string;
  volume: string;
  weight: string;
  note?: string;
  warning?: string;
};

const SUBTYPE_SPECS: Record<string, SubtypeSpec> = {
  "CDE Bak":                      { dims: "320 × 170 × 180 cm", volume: "9,8 m³", weight: "2,6 Ton", note: "Dimensi rata-rata, bisa sedikit berbeda." },
  "CDE Box":                      { dims: "320 × 170 × 170 cm", volume: "9,2 m³", weight: "2,2 Ton", note: "Dimensi rata-rata, bisa sedikit berbeda." },
  "CDD Bak":                      { dims: "440 × 200 × 200 cm", volume: "17,6 m³", weight: "5 Ton",  warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "CDD Box":                      { dims: "440 × 200 × 190 cm", volume: "16,7 m³", weight: "5 Ton",  warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Fuso Box (8 Tons)":            { dims: "620 × 235 × 235 cm", volume: "34,2 m³", weight: "8 Ton",  warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Fuso Box (10 Tons)":           { dims: "620 × 235 × 235 cm", volume: "34,2 m³", weight: "10 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Fuso Pickup (8 Tons)":         { dims: "660 × 235 × 245 cm", volume: "38 m³",   weight: "8 Ton",  warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Fuso Pickup (10 Tons)":        { dims: "660 × 235 × 245 cm", volume: "38 m³",   weight: "10 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Wing Box (18 Tons)":   { dims: "950 × 245 × 250 cm", volume: "58,2 m³", weight: "18 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Wing Box (22 Tons)":   { dims: "950 × 245 × 250 cm", volume: "58,2 m³", weight: "22 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Wing Box (25 Tons)":   { dims: "950 × 245 × 250 cm", volume: "58,2 m³", weight: "25 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Pickup (18 Tons)":     { dims: "950 × 245 × 260 cm", volume: "60,5 m³", weight: "18 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Pickup (22 Tons)":     { dims: "950 × 245 × 260 cm", volume: "60,5 m³", weight: "22 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Tronton Pickup (25 Tons)":     { dims: "950 × 245 × 260 cm", volume: "60,5 m³", weight: "25 Ton", warning: "⚠ Akses jalan terbatas (Jakarta 06:00–22:00)" },
  "Trailer 20 ft":                { dims: "—", volume: "—", weight: "Maks. 25 Ton (termasuk container)", note: "Container tidak termasuk. Harus disiapkan sendiri." },
  "Trailer 40 ft":                { dims: "—", volume: "—", weight: "Maks. 30 Ton (termasuk container)", note: "Container tidak termasuk. Harus disiapkan sendiri." },
  "Trailer Flatbed":              { dims: "1200 × 240 × 240 cm", volume: "69 m³",  weight: "30 Ton", note: "Container tidak termasuk. Harus disiapkan sendiri." },
};

const VEHICLE_CAPS_LIST = [
  { key: "Van / Blind Van", label: "Van / Blind Van", maxWeightKg: 800,   maxVolumeM3: 3,  rateKey: "CDE",     desc: "Kiriman kecil & ringan, ideal untuk last-mile delivery." },
  { key: "Pickup Bak",      label: "Pickup Bak",      maxWeightKg: 1000,  maxVolumeM3: 4,  rateKey: "CDE",     desc: "Bak terbuka, fleksibel untuk berbagai ukuran barang." },
  { key: "Pickup Box",      label: "Pickup Box",      maxWeightKg: 1200,  maxVolumeM3: 5,  rateKey: "CDE",     desc: "Tertutup & aman dari cuaca, ideal untuk barang berharga." },
  { key: "CDE Box",         label: "CDE Box",         maxWeightKg: 2500,  maxVolumeM3: 12, rateKey: "CDE",     desc: "Distribusi dalam kota, kapasitas menengah." },
  { key: "CDD Box",         label: "CDD Box",         maxWeightKg: 5000,  maxVolumeM3: 20, rateKey: "CDD",     desc: "Kapasitas besar, cocok untuk pengiriman antar kota." },
  { key: "Fuso",            label: "Fuso",            maxWeightKg: 8000,  maxVolumeM3: 30, rateKey: "Fuso",    desc: "Truk besar untuk muatan berat & volume tinggi." },
  { key: "Tronton",         label: "Tronton",         maxWeightKg: 15000, maxVolumeM3: 45, rateKey: "Wingbox", desc: "Kapasitas maksimal untuk jarak jauh antar kota." },
] as const;

function calcTotalVolumeM3(dims: DimRow[]): number {
  return dims.reduce((sum, row) => {
    const p = parseFloat(row.panjang) || 0;
    const l = parseFloat(row.lebar) || 0;
    const t = parseFloat(row.tinggi) || 0;
    const k = parseFloat(row.koliQty) || 0;
    return sum + (p * l * t * k) / 1_000_000;
  }, 0);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function JasaDetail() {
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem, items: cartItems } = useCart();
  const [state, setState] = useState<CalcState>({});
  const [airRows, setAirRows] = useState<AirRow[]>([newAirRow()]);
  const [added, setAdded] = useState(false);
  const [pickupGeo, setPickupGeo] = useState<GeoLocation | undefined>();
  const [destGeo, setDestGeo] = useState<GeoLocation | undefined>();
  const [calcDist, setCalcDist] = useState(false);
  const [truckingStep, setTruckingStep] = useState(1);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [truckingStops, setTruckingStops] = useState<Array<{ id: string; city: string; geo?: GeoLocation; receiverName: string; receiverPhone: string }>>([]);
  const [optimizeRoute, setOptimizeRoute] = useState(false);

  // Step 2 cargo state
  const [orderNow, setOrderNow] = useState(false);
  const [cargoCategory, setCargoCategory] = useState("");
  const [truckingNotes, setTruckingNotes] = useState("");
  const [koliQty, setKoliQty] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [dimensions, setDimensions] = useState<DimRow[]>([newDimRow()]);
  const [cargoPhotoFiles, setCargoPhotoFiles] = useState<File[]>([]);
  const [cargoPhotoUrls, setCargoPhotoUrls] = useState<string[]>([]);
  const [pendingOrder, setPendingOrder] = useState<{ serviceId: number; productName: string } | null>(null);
  const qc = useQueryClient();
  const { data: truckingRatesData } = useQuery<Record<string, { ratePerKm: number; loadingFee: number }>>({
    queryKey: ["portal-trucking-rates"],
    queryFn: () => fetch("/api/portal/trucking-rates").then(r => r.ok ? r.json() : {}),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 60_000,
  });
  const truckingRates = truckingRatesData ?? {};
  const [truckingPayment, setTruckingPayment] = useState<"transfer" | "gateway" | "">("");
  const [truckingTransferTerm, setTruckingTransferTerm] = useState<"full" | "termin" | "dp" | "">("");
  const [truckingPayTerm, setTruckingPayTerm] = useState<"net7" | "net14" | "net30" | "net60" | "">("");
  const [truckingDpNext, setTruckingDpNext] = useState<"lunas-delivery" | "lunas-net30" | "lunas-net60" | "cicil" | "">("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    try { window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }); } catch { window.scrollTo(0, 0); }
  }, [params.id]);

  useEffect(() => {
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("price_sync", () => {
      qc.invalidateQueries({ queryKey: ["portal-trucking-rates"] });
      qc.invalidateQueries({ queryKey: ["listPortalServicesDetail"] });
    });
    return () => es.close();
  }, [qc]);

  // Trucking always uses Schedule
  useEffect(() => {
    setState(prev => ({ ...prev, serviceType: "Schedule" }));
  }, [params.id]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingJasaReview");
      if (raw) {
        const parsed = JSON.parse(raw) as { serviceId: number; productId: number; productName: string; qty?: number };
        const idMatch = String(parsed.serviceId) === params.id;
        const slugMatch = slugCategory != null && dbService != null && parsed.serviceId === dbService.id;
        if (idMatch || slugMatch) {
          setPendingOrder({ serviceId: parsed.serviceId, productName: parsed.productName });
          // Prefill quantity into calculator form
          if (parsed.qty && parsed.qty >= 1) {
            const qtyStr = String(parsed.qty);
            // For air freight: set quantity in the first airRow
            setAirRows(prev => prev.map((r, i) => i === 0 ? { ...r, quantity: qtyStr } : r));
            // For other calculators (generic, storage, document): set state.quantity
            setState(prev => ({ ...prev, quantity: qtyStr }));
          }
        }
      }
    } catch { /* ignore */ }
  }, [params.id]);

  function confirmJasaAndCheckout() {
    // Guard: service must be added to cart before proceeding
    const hasService = added || cartItems.some((i) => i.calculatorType !== "product");
    if (!hasService) {
      toast({
        title: t("jasaDetail.toastAddServiceFirst"),
        description: t("jasaDetail.toastAddServiceDesc"),
        variant: "destructive",
      });
      return;
    }
    try {
      const raw = sessionStorage.getItem("pendingJasaReview");
      const parsed = raw ? JSON.parse(raw) as { serviceId?: number; productId?: number; productName?: string; unit?: string; qty?: number; productPrice?: number } : {};
      sessionStorage.removeItem("pendingJasaReview");
      setPendingOrder(null);
      const p = new URLSearchParams();
      if (parsed.productName) p.set("commodity", parsed.productName);
      if (parsed.qty) p.set("qty", String(parsed.qty));
      if (parsed.unit) p.set("unit", parsed.unit);
      if (parsed.productPrice) p.set("productPrice", String(parsed.productPrice));
      p.set("step", "2");
      setLocation(`/book?${p.toString()}`);
    } catch {
      sessionStorage.removeItem("pendingJasaReview");
      setPendingOrder(null);
      setLocation("/book?step=2");
    }
  }

  const { data: servicesRaw, isLoading: servicesLoading } = useListPortalServices({
    query: { queryKey: ["listPortalServicesDetail"] },
  });
  const allServices = Array.isArray(servicesRaw) ? servicesRaw : [];

  const SLUG_TO_CATEGORY: Record<string, string> = {
    "trucking": "Trucking",
    "freight":  "Freight Forwarding",
    "pabean":   "Pabean",
    "udara":    "Udara",
    "laut":     "Laut",
    "container":"Container",
    "handling": "Handling",
    "storage":  "Storage",
  };

  const isSlug = params.id && isNaN(Number(params.id));
  const slugCategory = isSlug ? (SLUG_TO_CATEGORY[params.id.toLowerCase()] ?? null) : null;

  const dbService = allServices.find((s) => {
    if (slugCategory) return (s.categories ?? []).includes(slugCategory);
    return String(s.id) === params.id;
  });
  const primaryCat = (dbService?.categories ?? [])[0] ?? slugCategory ?? "";
  const serviceCategory: ServiceCategory = CAT_TO_SERVICE_CAT[primaryCat] ?? "Freight";
  const calculatorType: CalculatorType = CAT_TO_CALC[primaryCat] ?? "generic";

  const item = dbService
    ? {
        id: String(dbService.id),
        name: stripJasa(dbService.name),
        description: dbService.description ?? `Layanan ${stripJasa(dbService.name)} profesional`,
        category: serviceCategory,
        calculatorType,
      }
    : null;

  function set(key: string, val: string) {
    setState((prev) => ({ ...prev, [key]: val }));
  }

  const fetchDistance = useCallback(async (from: GeoLocation, to: GeoLocation) => {
    setCalcDist(true);
    try {
      const osrmBase = import.meta.env.VITE_OSRM_URL ?? "https://router.project-osrm.org";
      const url = `${osrmBase}/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
      const res = await fetch(url);
      const data = await res.json() as { routes?: Array<{ distance: number }> };
      if (data.routes && data.routes.length > 0) {
        const km = Math.round(data.routes[0].distance / 1000);
        set("distance", String(km));
        toast({ title: t("jasaDetail.toastAutoDistance").replace('{km}', String(km)), description: `${from.label.split(",")[0]} → ${to.label.split(",")[0]}` });
      }
    } catch {
      toast({ title: t("jasaDetail.toastDistanceFail"), description: t("jasaDetail.toastDistanceFailDesc"), variant: "destructive" });
    } finally {
      setCalcDist(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!pickupGeo) return;
    const candidates: GeoLocation[] = [];
    if (destGeo) candidates.push(destGeo);
    truckingStops.forEach(s => { if (s.geo) candidates.push(s.geo!); });
    if (candidates.length === 0) return;
    let target = candidates[0];
    if (candidates.length > 1) {
      let maxD = -1;
      for (const c of candidates) {
        const d = haversine(pickupGeo.lat, pickupGeo.lon, c.lat, c.lon);
        if (d > maxD) { maxD = d; target = c; }
      }
    }
    fetchDistance(pickupGeo, target);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupGeo, destGeo, truckingStops]);

  const cat = CATEGORIES.find((c) => c.name === serviceCategory);
  const IconComp = cat ? (ICON_MAP[cat.icon] ?? Package) : Package;
  const colors = CATEGORY_COLORS_DETAIL[serviceCategory] ?? {
    bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700",
    header: "from-blue-900 to-blue-700",
  };

  if (servicesLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #F0F6FF 0%, #F8FAFC 50%, #FFFFFF 100%)" }}
      >
        <style>{`
          @keyframes cst-logo-breathe {
            0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 0px rgba(11,92,173,0)); }
            50% { opacity: 0.80; transform: scale(0.93); filter: drop-shadow(0 0 16px rgba(11,92,173,0.28)); }
          }
          .cst-logo-loading { animation: cst-logo-breathe 2.4s ease-in-out infinite; }
        `}</style>
        <div className="flex flex-col items-center gap-5">
          <img
            src={staticAsset("images/logo.png")}
            alt="B2B Marketplace and Logistic"
            className="cst-logo-loading"
            style={{ width: "clamp(60px, 9vw, 88px)", height: "auto" }}
          />
          <p
            className="font-semibold text-slate-400 uppercase tracking-widest"
            style={{ fontSize: "10px", letterSpacing: "0.20em" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src={staticAsset("images/logo.png")} alt="B2B Marketplace and Logistic" className="h-16 w-auto object-contain opacity-40" />
        <h2 className="text-2xl font-bold">{t("jasa.serviceNotFound")}</h2>
        <Link href="/jasa">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> {t("jasa.backToCatalog")}</Button>
        </Link>
      </div>
    );
  }

  const subtotal = calcSubtotal(item.calculatorType, state, airRows);
  const ct = item.calculatorType;

  function setAirRow(id: string, field: keyof Omit<AirRow, "id">, val: string) {
    setAirRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: val } : r));
  }
  function addAirRow() { setAirRows((prev) => [...prev, newAirRow()]); }
  function removeAirRow(id: string) { setAirRows((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev); }

  function addTruckingStop() {
    setTruckingStops(prev => [...prev, { id: crypto.randomUUID(), city: "", receiverName: "", receiverPhone: "" }]);
  }
  function removeTruckingStop(id: string) {
    setTruckingStops(prev => prev.filter(s => s.id !== id));
  }
  function updateTruckingStop(id: string, city: string, geo?: GeoLocation) {
    setTruckingStops(prev => prev.map(s => s.id === id ? { ...s, city, geo } : s));
  }
  function updateTruckingStopContact(id: string, field: "receiverName" | "receiverPhone", value: string) {
    setTruckingStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function handlePickupChange(label: string, geo?: GeoLocation) {
    set("pickupCity", label);
    setPickupGeo(geo);
  }

  function handleDestChange(label: string, geo?: GeoLocation) {
    set("destCity", label);
    setDestGeo(geo);
  }

  function handleOptimizeToggle(on: boolean) {
    setOptimizeRoute(on);
    if (!on || !pickupGeo) return;
    type Dest = { id: string; city: string; geo?: GeoLocation; isMain?: true; receiverName: string; receiverPhone: string };
    const allDests: Dest[] = [
      ...truckingStops.map(s => ({ id: s.id, city: s.city, geo: s.geo, receiverName: s.receiverName, receiverPhone: s.receiverPhone })),
      ...(state.destCity ? [{ id: "__dest__", city: state.destCity, geo: destGeo, isMain: true as const, receiverName: "", receiverPhone: "" }] : []),
    ];
    if (allDests.length < 2) return;
    const remaining = [...allDests];
    const ordered: Dest[] = [];
    let cur: GeoLocation = pickupGeo;
    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((d, i) => {
        if (!d.geo) return;
        const dist = haversine(cur.lat, cur.lon, d.geo.lat, d.geo.lon);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      });
      const chosen = remaining.splice(bestIdx, 1)[0];
      ordered.push(chosen);
      if (chosen.geo) cur = chosen.geo;
    }
    const newDestEntry = ordered[ordered.length - 1];
    const newStopEntries = ordered.slice(0, -1);
    if (newDestEntry.isMain) {
      setTruckingStops(newStopEntries.map(s => ({ id: s.id, city: s.city, geo: s.geo, receiverName: s.receiverName, receiverPhone: s.receiverPhone })));
    } else {
      set("destCity", newDestEntry.city);
      setDestGeo(newDestEntry.geo);
      setTruckingStops(newStopEntries.map(s => ({ id: s.id, city: s.city, geo: s.geo, receiverName: s.receiverName, receiverPhone: s.receiverPhone })));
    }
    toast({ title: t("jasaDetail.toastRouteOptimized"), description: t("jasaDetail.toastRouteOptimizedDesc") });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - cargoPhotoFiles.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCargoPhotoUrls(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setCargoPhotoFiles(prev => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function handleNextStep() {
    if (truckingStep === 1) {
      // Jadwal
      if (!orderNow) {
        if (!state.pickupDate) {
          toast({ title: t("jasaDetail.toastNoDate"), variant: "destructive" });
          return;
        }
        const today = new Date().toISOString().split("T")[0];
        if (state.pickupDate < today) {
          toast({ title: t("jasaDetail.toastDatePast"), variant: "destructive" });
          return;
        }
        if (!state.pickupTime) {
          toast({ title: t("jasaDetail.toastNoTime"), variant: "destructive" });
          return;
        }
      }
      // Pengirim
      if (!senderName.trim()) {
        toast({ title: t("jasaDetail.toastNoSenderName"), variant: "destructive" });
        return;
      }
      if (!senderPhone.trim()) {
        toast({ title: t("jasaDetail.toastNoSenderPhone"), variant: "destructive" });
        return;
      }
      // Rute
      if (!state.pickupCity) {
        toast({ title: t("jasaDetail.toastNoOrigin"), variant: "destructive" });
        return;
      }
      if (!state.destCity) {
        toast({ title: t("jasaDetail.toastNoDest"), variant: "destructive" });
        return;
      }
      if (!receiverName.trim()) {
        toast({ title: t("jasaDetail.toastNoReceiverName"), variant: "destructive" });
        return;
      }
      if (!receiverPhone.trim()) {
        toast({ title: t("jasaDetail.toastNoReceiverPhone"), variant: "destructive" });
        return;
      }
      for (let si = 0; si < truckingStops.length; si++) {
        const s = truckingStops[si];
        if (!s.receiverName.trim()) {
          toast({ title: t("jasaDetail.toastNoStopReceiverName").replace('{n}', String(si + 1)), variant: "destructive" });
          return;
        }
        if (!s.receiverPhone.trim()) {
          toast({ title: t("jasaDetail.toastNoStopReceiverPhone").replace('{n}', String(si + 1)), variant: "destructive" });
          return;
        }
      }
      // Barang
      if (!cargoCategory) {
        toast({ title: t("jasaDetail.toastNoCargo"), variant: "destructive" });
        return;
      }
      if (!koliQty || parseFloat(koliQty) <= 0) {
        toast({ title: t("jasaDetail.toastNoKoli"), variant: "destructive" });
        return;
      }
      if (!grossWeight || parseFloat(grossWeight) <= 0) {
        toast({ title: t("jasaDetail.toastNoWeight"), variant: "destructive" });
        return;
      }
      // Foto (wajib)
      if (cargoPhotoUrls.length === 0) {
        toast({ title: t("jasaDetail.toastNoPhoto"), variant: "destructive" });
        return;
      }
      // Payment (wajib)
      if (!truckingPayment) {
        toast({ title: t("jasaDetail.toastNoPayment"), variant: "destructive" });
        return;
      }
      if (truckingPayment === "transfer" && !truckingTransferTerm) {
        toast({ title: t("jasaDetail.toastNoTransferType"), variant: "destructive" });
        return;
      }
      setTruckingStep(2);
    }
  }

  function handleAddToCart() {
    if (!item) return;
    if (subtotal <= 0) {
      toast({ title: t("jasaDetail.toastFillCalc"), variant: "destructive" });
      return;
    }
    if (item.calculatorType === "trucking") {
      if (!state.vehicleType) {
        toast({ title: t("jasaDetail.toastNoVehicle"), variant: "destructive" });
        return;
      }
    }
    addItem({
      category: item.category,
      serviceName: item.name,
      calculatorType: item.calculatorType,
      inputData: {
        ...state,
        ...(item.calculatorType === "air_freight" ? { airRows: JSON.stringify(airRows) } : {}),
        ...(item.calculatorType === "trucking" ? {
          sender_name: senderName,
          sender_phone: senderPhone,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          ...(truckingStops.length > 0 ? {
            stops: truckingStops.map(s => s.city).join(" → "),
            stops_contacts: JSON.stringify(truckingStops.map((s, i) => ({ stop: i + 1, city: s.city, receiverName: s.receiverName, receiverPhone: s.receiverPhone }))),
          } : {}),
          order_now: String(orderNow),
          cargo_category: cargoCategory,
          notes: truckingNotes,
          koli_qty: koliQty,
          gross_weight_kg: grossWeight,
          dimensions: JSON.stringify(dimensions),
          total_volume_m3: calcTotalVolumeM3(dimensions).toFixed(4),
          cargo_photos: String(cargoPhotoUrls.length),
          cargo_photo_urls: cargoPhotoUrls,
          payment_type: truckingPayment === "gateway"
            ? "payment_gateway"
            : truckingPayment === "transfer"
            ? truckingTransferTerm === "full"
              ? "transfer:full"
              : truckingTransferTerm === "termin" && truckingPayTerm
              ? `transfer:termin:${truckingPayTerm}`
              : truckingTransferTerm === "dp" && truckingDpNext
              ? `transfer:dp:${truckingDpNext}`
              : "transfer"
            : "",
        } : {}),
      },
      calculationResult: calcResult(item.calculatorType, state, airRows),
      subtotal,
    });
    setAdded(true);
    toast({ title: t("jasaDetail.toastAddedToCart").replace('{name}', item.name) });
  }

  function requireAuthThenBook() {
    if (!isAuthenticated()) {
      setLocation("/register?returnTo=/book");
    } else {
      setLocation("/book");
    }
  }

  function handleProceed() {
    requireAuthThenBook();
  }

  const otherServices = allServices
    .filter((s) => {
      const sCat = (s.categories ?? [])[0] ?? "";
      return sCat === primaryCat && s.id !== dbService?.id;
    })
    .slice(0, 3)
    .map((s) => ({
      id: String(s.id),
      name: stripJasa(s.name),
      description: s.description ?? "",
      category: (CAT_TO_SERVICE_CAT[(s.categories ?? [])[0] ?? ""] ?? "Freight") as ServiceCategory,
      calculatorType: (CAT_TO_CALC[(s.categories ?? [])[0] ?? ""] ?? "generic") as CalculatorType,
    }));

  const CATEGORY_HERO: Record<string, {
    heroBg: string;
    accentColor: string;
    accentLight: string;
    accentText: string;
    badgeBg: string;
    badgeText: string;
    glowA: string;
    glowB: string;
    image: string;
    iconBg: string;
    features: string[];
    tintOverlay: string;
  }> = {
    Freight:    {
      heroBg:      "linear-gradient(145deg, #EDF5FF 0%, #D0E6FF 28%, #BFDBFE 52%, #93C5FD 72%, #7EB5F5 100%)",
      accentColor: "#1A56DB",
      accentLight: "#EEF4FF",
      accentText:  "#1A56DB",
      badgeBg:     "#DBEAFE",
      badgeText:   "#1e40af",
      glowA:       "#3B82F6",
      glowB:       "#60A5FA",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/freight-udara.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(219,234,254,0.72) 100%)",
      tintOverlay: "rgba(59,130,246,0.07)",
      features:    ["Air Freight", "Sea FCL / LCL", "Door-to-Door", "Multi-Modal"],
    },
    Customs:    {
      heroBg:      "linear-gradient(145deg, #ECFDF7 0%, #C8F5E6 28%, #A7F3D0 52%, #6EE7B7 72%, #4DD9A8 100%)",
      accentColor: "#047857",
      accentLight: "#ECFDF5",
      accentText:  "#047857",
      badgeBg:     "#D1FAE5",
      badgeText:   "#065F46",
      glowA:       "#10B981",
      glowB:       "#34D399",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/customs-clearance.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(167,243,208,0.72) 100%)",
      tintOverlay: "rgba(16,185,129,0.06)",
      features:    ["Import & Export", "PIB / PEB", "HS Code Konsultasi", "PPJK Resmi"],
    },
    Handling:   {
      heroBg:      "linear-gradient(145deg, #F4EFFF 0%, #E8DFFF 28%, #DDD6FE 52%, #C4B5FD 72%, #A78BFA 100%)",
      accentColor: "#6D28D9",
      accentLight: "#F5F0FF",
      accentText:  "#6D28D9",
      badgeBg:     "#EDE9FE",
      badgeText:   "#5B21B6",
      glowA:       "#8B5CF6",
      glowB:       "#A78BFA",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/handling-cargo-laut.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(221,214,254,0.72) 100%)",
      tintOverlay: "rgba(109,40,217,0.06)",
      features:    ["Origin Handling", "Destination Handling", "Kargo Berbahaya", "Tim Profesional"],
    },
    Storage:    {
      heroBg:      "linear-gradient(145deg, #EDFDF9 0%, #C9FAF0 28%, #99F6E4 52%, #5EEAD4 72%, #2DD4C8 100%)",
      accentColor: "#0D9488",
      accentLight: "#F0FDFA",
      accentText:  "#0D9488",
      badgeBg:     "#CCFBF1",
      badgeText:   "#0F766E",
      glowA:       "#14B8A6",
      glowB:       "#2DD4BF",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/biaya-storage.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(153,246,228,0.72) 100%)",
      tintOverlay: "rgba(13,148,136,0.06)",
      features:    ["Gudang Umum", "Bonded Warehouse", "Cold Storage", "Sewa Fleksibel"],
    },
    Trucking:   {
      heroBg:      "linear-gradient(145deg, #FFFAEB 0%, #FEF3C7 28%, #FDE68A 52%, #FCD34D 72%, #FBBF24 100%)",
      accentColor: "#B45309",
      accentLight: "#FFFBEB",
      accentText:  "#92400E",
      badgeBg:     "#FEF3C7",
      badgeText:   "#92400E",
      glowA:       "#F59E0B",
      glowB:       "#FCD34D",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/trucking-container.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(253,230,138,0.72) 100%)",
      tintOverlay: "rgba(245,158,11,0.07)",
      features:    ["5 Jenis Armada", "Kalkulasi Otomatis", "Harga Transparan", "Berlisensi & Profesional"],
    },
    Document:   {
      heroBg:      "linear-gradient(145deg, #F0EEFF 0%, #E0E7FF 28%, #C7D2FE 52%, #A5B4FC 72%, #818CF8 100%)",
      accentColor: "#4338CA",
      accentLight: "#EEF2FF",
      accentText:  "#4338CA",
      badgeBg:     "#E0E7FF",
      badgeText:   "#3730A3",
      glowA:       "#6366F1",
      glowB:       "#818CF8",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/pengurusan-dokumen-ppjk.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(199,210,254,0.72) 100%)",
      tintOverlay: "rgba(99,102,241,0.06)",
      features:    ["Bill of Lading", "Air Waybill", "COO / SKA", "Packing List"],
    },
    Additional: {
      heroBg:      "linear-gradient(145deg, #FFF0F2 0%, #FFE4E6 28%, #FECDD3 52%, #FDA4AF 72%, #FB7185 100%)",
      accentColor: "#BE123C",
      accentLight: "#FFF1F2",
      accentText:  "#BE123C",
      badgeBg:     "#FFE4E6",
      badgeText:   "#9F1239",
      glowA:       "#F43F5E",
      glowB:       "#FB7185",
      image:       "/api/storage/public-objects/portal-assets/static/customer-portal/images/services/asuransi-kargo.webp",
      iconBg:      "linear-gradient(135deg,rgba(255,255,255,0.88) 0%,rgba(253,164,175,0.72) 100%)",
      tintOverlay: "rgba(244,63,94,0.06)",
      features:    ["Asuransi Kargo", "Surveyor", "Perizinan", "BPOM / SNI"],
    },
  };
  const hero = CATEGORY_HERO[item.category] ?? CATEGORY_HERO["Freight"]!;

  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(180deg,#F4F8FD 0%,#FFFFFF 100%)" }}>
      {/* ── ENTERPRISE PREMIUM HERO ── */}
      <style>{`
        @keyframes hero-pill-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .hero-pill {
          transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
          animation: hero-pill-in 0.4s ease both;
        }
        .hero-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--pill-shadow), 0 2px 6px rgba(0,0,0,0.08) !important;
          border-color: var(--pill-accent-border) !important;
        }
        .hero-icon-card {
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .hero-icon-card:hover { transform: translateY(-3px); }
        @media (max-width: 640px) {
          .hero-bg-img { width: 100% !important; right: -30% !important; opacity: 0.12 !important; }
        }
      `}</style>
      <div
        className="relative overflow-hidden"
        style={{ background: hero.heroBg, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* ── Layer 0: Noise texture overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            opacity: 0.6,
          }}
        />

        {/* ── Layer 1: Ambient glow orbs — stronger & richer ── */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: "680px", height: "560px",
              top: "-200px", right: "0%",
              background: `radial-gradient(ellipse, ${hero.glowA}38 0%, ${hero.glowA}14 40%, transparent 70%)`,
              filter: "blur(48px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "460px", height: "400px",
              bottom: "-140px", right: "28%",
              background: `radial-gradient(ellipse, ${hero.glowB}28 0%, transparent 68%)`,
              filter: "blur(56px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "360px", height: "320px",
              top: "50%", left: "30%",
              transform: "translateY(-60%)",
              background: `radial-gradient(ellipse, ${hero.glowA}18 0%, transparent 68%)`,
              filter: "blur(38px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "200px", height: "200px",
              top: "10%", right: "12%",
              background: `radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)`,
              filter: "blur(22px)",
            }}
          />
        </div>

        {/* ── Layer 2: Premium grid mesh ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(${hero.accentColor}14 1px, transparent 1px),
              linear-gradient(to right, ${hero.accentColor}14 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
          }}
        />

        {/* ── Layer 2b: Diagonal accent lines ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -48deg,
              transparent 0px, transparent 38px,
              ${hero.accentColor}07 38px, ${hero.accentColor}07 39px
            )`,
          }}
        />

        {/* ── Layer 3: Cinematic background image (right side) ── */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img
            src={hero.image}
            alt=""
            aria-hidden="true"
            className="hero-bg-img absolute top-0 right-0 h-full object-cover"
            style={{
              width: "58%",
              opacity: 0.22,
              objectPosition: "center 38%",
              filter: "saturate(1.1) contrast(1.02)",
              mixBlendMode: "multiply",
            }}
            loading="eager"
          />
          {/* Sophisticated left-to-right fade with color tint */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg,
                white 0%,
                rgba(255,255,255,0.97) 22%,
                rgba(255,255,255,0.88) 42%,
                rgba(255,255,255,0.62) 62%,
                rgba(255,255,255,0.22) 82%,
                transparent 100%)`,
            }}
          />
          {/* Color tint overlay */}
          <div
            className="absolute inset-0"
            style={{ background: hero.tintOverlay }}
          />
          {/* Bottom vignette */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))` }}
          />
        </div>

        {/* ── Layer 4: Top accent stripe — 3px premium ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${hero.accentColor} 0%, ${hero.glowA}CC 35%, ${hero.glowB}66 65%, transparent 85%)`,
          }}
        />
        {/* Subtle top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0.28), transparent)`,
          }}
        />

        {/* ── Content ── */}
        <div className="container px-4 md:px-6 py-5 md:py-7 relative z-10">

          {/* Back button + Breadcrumb row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Kembali button */}
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/jasa")}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 rounded-lg px-3 py-1.5 select-none"
              style={{
                color: hero.accentText,
                background: hero.accentLight,
                border: `1.5px solid ${hero.accentColor}22`,
                boxShadow: `0 1px 4px ${hero.accentColor}12`,
                transition: "all 0.16s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = hero.badgeBg;
                el.style.boxShadow = `0 4px 12px ${hero.accentColor}22`;
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = hero.accentLight;
                el.style.boxShadow = `0 1px 4px ${hero.accentColor}12`;
                el.style.transform = "translateY(0)";
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("jasa.backBtn")}
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-0" aria-label="breadcrumb">
              <Link
                href="/"
                className="text-[11.5px] font-medium text-slate-400 hover:text-slate-600 transition-colors duration-150"
              >
                B2B Marketplace and Logistic
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300 mx-1 flex-shrink-0" />
              <Link
                href="/jasa"
                className="text-[11.5px] font-medium text-slate-400 hover:text-slate-600 transition-colors duration-150"
              >
                {t("jasa.catalogLabel")}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300 mx-1 flex-shrink-0" />
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: hero.badgeBg, color: hero.badgeText }}
              >
                {item.category}
              </span>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-7">
            {/* Icon card — premium glassmorphism */}
            <div
              className="hero-icon-card flex-shrink-0 rounded-[16px] p-3.5"
              style={{
                background: hero.iconBg,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1.5px solid ${hero.accentColor}2E`,
                boxShadow: [
                  `0 2px 4px rgba(0,0,0,0.04)`,
                  `0 8px 20px ${hero.accentColor}1A`,
                  `0 24px 60px -8px ${hero.accentColor}22`,
                  `inset 0 1px 0 rgba(255,255,255,0.90)`,
                  `inset 0 -1px 0 ${hero.accentColor}0A`,
                ].join(", "),
              }}
            >
              {ct === "trucking" ? (
                <img src={staticAsset("images/logo-baru.png")} alt="CST Logistic" className="h-10 w-auto max-w-[90px] object-contain" />
              ) : (
                <div style={{ color: hero.accentColor, filter: `drop-shadow(0 4px 12px ${hero.accentColor}40)` }}>
                  <IconComp className="h-10 w-10" />
                </div>
              )}
            </div>

            {/* Text block */}
            <div className="flex-1 min-w-0">
              {/* Service name */}
              <h1
                className="font-bold leading-[1.08] mb-2"
                style={{
                  fontSize: "clamp(20px, 3vw, 34px)",
                  color: "#0A1628",
                  letterSpacing: "-0.025em",
                  textShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {item.name}
              </h1>

              {/* Description */}
              <p
                className="leading-[1.65] mb-4"
                style={{
                  fontSize: "clamp(13px, 1.3vw, 14.5px)",
                  color: "#374151",
                  maxWidth: "520px",
                  fontWeight: 400,
                }}
              >
                {item.description}
              </p>

              {/* Feature pills — premium animated */}
              <div className="flex flex-wrap gap-2">
                {hero.features.map((f, i) => (
                  <span
                    key={f}
                    className="hero-pill inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)`,
                      border: `1.5px solid ${hero.accentColor}28`,
                      color: hero.accentText,
                      boxShadow: [
                        `0 1px 3px rgba(0,0,0,0.06)`,
                        `0 4px 16px ${hero.accentColor}12`,
                        `inset 0 1px 0 rgba(255,255,255,0.95)`,
                      ].join(", "),
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      animationDelay: `${i * 60}ms`,
                      "--pill-shadow": `${hero.accentColor}28`,
                      "--pill-accent-border": `${hero.accentColor}55`,
                    } as React.CSSProperties}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${hero.accentColor}, ${hero.glowB})`,
                        boxShadow: `0 0 6px ${hero.accentColor}60`,
                      }}
                    />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${ct === "trucking" ? "max-w-[1200px] mx-auto" : "container"} px-4 md:px-6 mt-8`}>
        <div className={ct === "trucking" ? "flex flex-col lg:flex-row gap-8 items-start" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}>
          {/* Calculator section */}
          <div className={ct === "trucking" ? "flex-1 min-w-0" : "lg:col-span-2"}>
            <div
              className={ct === "trucking" ? "" : "bg-white rounded-2xl overflow-hidden"}
              style={ct !== "trucking" ? {
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.07)",
              } : undefined}
            >
              {ct !== "trucking" && (
                <div
                  className="px-7 pt-6 pb-5"
                  style={{
                    borderBottom: `2px solid ${hero.accentColor}14`,
                    background: `linear-gradient(135deg, ${hero.accentLight}60 0%, #FFFFFF 100%)`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-11 w-11 mt-0.5 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`,
                        boxShadow: `0 4px 14px ${hero.accentColor}35`,
                      }}
                    >
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-slate-900 leading-tight tracking-tight">{t("jasaDetail.calcTitle")}</h2>
                      <p className="text-[13px] text-slate-400 mt-0.5">{t("jasaDetail.calcSubtitle")}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={ct === "trucking" ? "" : "px-7 py-6 space-y-5"}>
                {ct === "air_freight" && <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("jasaDetail.originAirport")}</Label>
                      <AirportCombobox
                        value={state.originAirport || ""}
                        onChange={(v) => set("originAirport", v)}
                        placeholder="CGK — Jakarta"
                      />
                    </div>
                    <div>
                      <Label>{t("jasaDetail.destAirport")}</Label>
                      <AirportCombobox
                        value={state.destinationAirport || ""}
                        onChange={(v) => set("destinationAirport", v)}
                        placeholder="SIN — Singapore"
                      />
                    </div>
                  </div>

                  {/* Multi-row quantity list */}
                  <div className="space-y-3">
                    {airRows.map((row, idx) => {
                      const vw = rowVolumeWeight(row);
                      const cw = rowChargeableWeight(row);
                      const hasData = (parseFloat(row.grossWeight) || 0) > 0;
                      return (
                        <div key={row.id} className="border border-border rounded-xl p-4 space-y-3 bg-gray-50/50 relative">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{t("jasaDetail.quantityLabel")} #{idx + 1}</p>
                            {airRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAirRow(row.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">{t("jasaDetail.grossWeightKg")}</Label>
                              <Input type="number" placeholder="0" className="mt-1 h-9" value={row.grossWeight} onChange={e => setAirRow(row.id, "grossWeight", e.target.value)} />
                            </div>
                            <div>
                              <Label className="text-xs">{t("jasaDetail.quantityPcs")}</Label>
                              <Input type="number" placeholder="1" className="mt-1 h-9" value={row.quantity} onChange={e => setAirRow(row.id, "quantity", e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">{t("jasaDetail.lengthCm")}</Label>
                              <Input type="number" placeholder="0" className="mt-1 h-9" value={row.length} onChange={e => setAirRow(row.id, "length", e.target.value)} />
                            </div>
                            <div>
                              <Label className="text-xs">{t("jasaDetail.widthCm")}</Label>
                              <Input type="number" placeholder="0" className="mt-1 h-9" value={row.width} onChange={e => setAirRow(row.id, "width", e.target.value)} />
                            </div>
                            <div>
                              <Label className="text-xs">{t("jasaDetail.heightCm")}</Label>
                              <Input type="number" placeholder="0" className="mt-1 h-9" value={row.height} onChange={e => setAirRow(row.id, "height", e.target.value)} />
                            </div>
                          </div>
                          {hasData && (
                            <div className="flex gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
                              <span>Vol. Weight: <span className="font-semibold text-foreground">{vw.toFixed(2)} kg</span></span>
                              <span>Chargeable: <span className="font-semibold text-blue-700">{cw.toFixed(2)} kg</span></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full border-dashed"
                    onClick={addAirRow}
                  >
                    <Plus className="h-4 w-4" />
                    {t("jasaDetail.airAddQty")}
                  </Button>

                  <div><Label>{t("jasaDetail.ratePerKg")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.ratePerKg || ""} onChange={e => set("ratePerKg", e.target.value)} /></div>

                  {subtotal > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-1.5">
                      <p className="text-blue-700 font-medium">{t("jasaDetail.airCalcSummary").replace('{count}', String(airRows.length))}</p>
                      <p className="text-muted-foreground">{t("jasaDetail.totalVolWeight")}: <span className="font-semibold text-foreground">{airRows.reduce((s, r) => s + rowVolumeWeight(r), 0).toFixed(2)} kg</span></p>
                      <p className="text-muted-foreground">{t("jasaDetail.totalChargeableWeight")}: <span className="font-semibold text-foreground">{airRows.reduce((s, r) => s + rowChargeableWeight(r), 0).toFixed(2)} kg</span></p>
                    </div>
                  )}
                </>}

                {ct === "sea_fcl" && <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.originPort")}</Label><Input placeholder="IDJKT" className="mt-1" value={state.originPort || ""} onChange={e => set("originPort", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.destPort")}</Label><Input placeholder="SGSIN" className="mt-1" value={state.destinationPort || ""} onChange={e => set("destinationPort", e.target.value)} /></div>
                  </div>
                  <div><Label>{t("jasaDetail.containerType")}</Label>
                    <Select value={state.containerType || undefined} onValueChange={v => set("containerType", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t("jasaDetail.selectContainer")} /></SelectTrigger>
                      <SelectContent>{["20 ft", "40 ft", "40 ft (High Cube)", "20 ft Suspensi", "40 ft Suspensi"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.freightRate")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.freightRate || ""} onChange={e => set("freightRate", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.handlingFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.handlingFee || ""} onChange={e => set("handlingFee", e.target.value)} /></div>
                  </div>
                </>}

                {ct === "sea_lcl" && <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.cbm")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.cbm || ""} onChange={e => set("cbm", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.weightKg")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.weight || ""} onChange={e => set("weight", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.ratePerCbm")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.ratePerCbm || ""} onChange={e => set("ratePerCbm", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.minimumCharge")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.minimumCharge || ""} onChange={e => set("minimumCharge", e.target.value)} /></div>
                  </div>
                </>}

                {ct === "customs" && <>
                  <div><Label>{t("jasaDetail.shipmentType")}</Label>
                    <Select value={state.shipmentType || undefined} onValueChange={v => set("shipmentType", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Import / Export" /></SelectTrigger>
                      <SelectContent><SelectItem value="Import">Import</SelectItem><SelectItem value="Export">Export</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.customsFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.customsFee || ""} onChange={e => set("customsFee", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.documentFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.documentFee || ""} onChange={e => set("documentFee", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.pibPebFee")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.pibPebFee || ""} onChange={e => set("pibPebFee", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.permitFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.permitFee || ""} onChange={e => set("permitFee", e.target.value)} /></div>
                  </div>
                </>}

                {ct === "trucking" && (
                  <div className="w-full">
                    <div className="bg-gradient-to-b from-[#0D6EFD] via-[#0B5CAD] to-[#083B70] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-blue-900/40">
                      {/* ── Stepper (2 langkah) ── */}
                      <div className="flex items-center px-3 pt-4 pb-3">
                        {([
                          {n:1,l:t("jasaDetail.truckStep1Label")},
                          {n:2,l:t("jasaDetail.truckStep2Label")},
                        ]).map((s, i, arr) => (
                          <div key={s.n} className="flex items-center flex-1 min-w-0">
                            <div className={`flex items-center gap-1 ${truckingStep >= s.n ? "text-white" : "text-blue-300/70"}`}>
                              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 ${truckingStep > s.n ? "bg-white text-[#0B5CAD]" : truckingStep === s.n ? "bg-white text-[#0B5CAD]" : "border border-blue-300/50 text-blue-300/70"}`}>
                                {truckingStep > s.n ? "✓" : s.n}
                              </span>
                              <span className="text-[9px] font-semibold whitespace-nowrap hidden sm:block">{s.l}</span>
                            </div>
                            {i < arr.length - 1 && <div className={`flex-1 h-px mx-1 ${truckingStep > s.n ? "bg-white/60" : "bg-blue-300/25"}`} />}
                          </div>
                        ))}
                      </div>

                      {/* ── Step 1: Detail Pengiriman ── */}
                      {truckingStep === 1 && (
                        <div className="px-3 pb-5 space-y-3">

                          {/* ─ Jadwal ─ */}
                          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 pt-3 pb-1">
                              <p className="text-xs font-bold text-[#0B5CAD] uppercase tracking-wide">{t("jasaDetail.scheduleLabel")}</p>
                            </div>
                            <div className="px-4 pb-4 space-y-3">
                              <div className="flex items-center gap-3 py-2">
                                <button type="button" role="switch" aria-checked={orderNow}
                                  onClick={() => { const next = !orderNow; setOrderNow(next); if (next) { const now = new Date(); set("pickupDate", now.toISOString().split("T")[0]); set("pickupTime", now.toTimeString().slice(0, 5)); } else { set("pickupDate", ""); set("pickupTime", ""); } }}
                                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${orderNow ? "bg-[#0B5CAD]" : "bg-gray-200"}`}
                                >
                                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${orderNow ? "translate-x-5" : "translate-x-0"}`}/>
                                </button>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{t("jasaDetail.orderNowLabel")}</p>
                                  <p className="text-[11px] text-gray-400">{t("jasaDetail.orderNowDesc")}</p>
                                </div>
                                {orderNow && <span className="ml-auto text-[11px] font-medium text-[#0B5CAD] bg-blue-50 px-2 py-0.5 rounded-full">{t("jasaDetail.activeLabel")}</span>}
                              </div>
                              {!orderNow ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.dateLabel")} <span className="text-red-500">*</span></label>
                                    <Input type="date" min={new Date().toISOString().split("T")[0]} value={state.pickupDate || ""} onChange={e => set("pickupDate", e.target.value)}/>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.timeLabel")} <span className="text-red-500">*</span></label>
                                    <Input type="time" value={state.pickupTime || ""} onChange={e => set("pickupTime", e.target.value)}/>
                                  </div>
                                </div>
                              ) : (
                                state.pickupDate && (
                                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-[#0B5CAD] font-medium">
                                    {t("jasaDetail.scheduleDisplay").replace('{date}', state.pickupDate || '').replace('{time}', state.pickupTime || '')}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* ─ Pengirim ─ */}
                          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 pt-3 pb-1">
                              <p className="text-xs font-bold text-[#0B5CAD] uppercase tracking-wide">{t("jasaDetail.senderLabel")}</p>
                            </div>
                            <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.senderNameLabel")} <span className="text-red-500">*</span></label>
                                <Input
                                  placeholder={t("jasaDetail.senderNamePlaceholder")}
                                  value={senderName}
                                  onChange={e => setSenderName(e.target.value)}
                                  className="h-9"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.senderPhoneLabel")} <span className="text-red-500">*</span></label>
                                <Input
                                  type="tel"
                                  placeholder="+62..."
                                  value={senderPhone}
                                  onChange={e => setSenderPhone(e.target.value)}
                                  className="h-9"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* ─ Rute ─ */}
                          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 pt-3 pb-1">
                              <p className="text-xs font-bold text-[#0B5CAD] uppercase tracking-wide">{t("jasaDetail.routeLabel")} <span className="text-red-500">*</span></p>
                            </div>
                            <div className="flex items-stretch">
                              <div className="flex flex-col items-center pt-4 pb-4 pl-4 pr-2 flex-shrink-0">
                                <div className="w-3 h-3 rounded-full bg-[#0B5CAD] ring-2 ring-[#0B5CAD]/20 flex-shrink-0"/>
                                <div className="flex-1 w-0.5 bg-gray-200 my-1"/>
                                {truckingStops.map((_s, i) => (
                                  <div key={i} className="flex flex-col items-center w-full">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-blue-100 flex-shrink-0"/>
                                    <div className="flex-1 w-0.5 bg-gray-200 my-1"/>
                                  </div>
                                ))}
                                <div className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-200 flex-shrink-0"/>
                              </div>
                              <div className="flex-1 min-w-0 divide-y divide-gray-100">
                                <div className="py-2 pr-3">
                                  <LocationCombobox value={state.pickupCity || ""} onChange={handlePickupChange} placeholder={t("jasaDetail.originPlaceholder")} countryCode="id"/>
                                </div>
                                {truckingStops.map((stop, i) => (
                                  <div key={stop.id} className="py-2 pr-3 space-y-2">
                                    <div className="flex items-center gap-1">
                                      <div className="flex-1 min-w-0">
                                        <LocationCombobox value={stop.city} onChange={(city, geo) => updateTruckingStop(stop.id, city, geo)} placeholder={t("jasaDetail.stopCityPlaceholder").replace('{n}', String(i + 1))} countryCode="id"/>
                                      </div>
                                      <button type="button" onClick={() => removeTruckingStop(stop.id)} className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400 flex items-center justify-center transition-colors" aria-label={t("jasaDetail.removeStop")}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.stopReceiverNameLabel").replace('{n}', String(i + 1))} <span className="text-red-500">*</span></label>
                                        <Input
                                          placeholder={t("jasaDetail.receiverNamePlaceholder")}
                                          value={stop.receiverName}
                                          onChange={e => updateTruckingStopContact(stop.id, "receiverName", e.target.value)}
                                          className="h-8 text-sm"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.stopReceiverPhoneLabel").replace('{n}', String(i + 1))} <span className="text-red-500">*</span></label>
                                        <Input
                                          type="tel"
                                          placeholder="+62..."
                                          value={stop.receiverPhone}
                                          onChange={e => updateTruckingStopContact(stop.id, "receiverPhone", e.target.value)}
                                          className="h-8 text-sm"
                                          required
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="py-2 pr-3 space-y-2">
                                  <LocationCombobox value={state.destCity || ""} onChange={handleDestChange} placeholder={t("jasaDetail.destPlaceholder")} countryCode="id"/>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    <div>
                                      <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.receiverNameLabel")} <span className="text-red-500">*</span></label>
                                      <Input
                                        placeholder={t("jasaDetail.receiverNamePlaceholder")}
                                        value={receiverName}
                                        onChange={e => setReceiverName(e.target.value)}
                                        className="h-8 text-sm"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.receiverPhoneLabel")} <span className="text-red-500">*</span></label>
                                      <Input
                                        type="tel"
                                        placeholder="+62..."
                                        value={receiverPhone}
                                        onChange={e => setReceiverPhone(e.target.value)}
                                        className="h-8 text-sm"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="border-t border-gray-100 px-4 py-2.5">
                              <button type="button" onClick={addTruckingStop} className="flex items-center gap-1.5 text-[#0B5CAD] text-sm font-semibold hover:text-[#083B70] transition-colors">
                                <Plus className="h-3.5 w-3.5"/> {t("jasaDetail.addStop")}
                              </button>
                            </div>
                            <div className="border-t border-gray-100 px-4 py-3 flex items-start gap-3">
                              <button type="button" role="switch" aria-checked={optimizeRoute} onClick={() => handleOptimizeToggle(!optimizeRoute)}
                                className={`relative flex-shrink-0 mt-0.5 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${optimizeRoute ? "bg-[#0B5CAD]" : "bg-gray-200"}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${optimizeRoute ? "translate-x-5" : "translate-x-0"}`}/>
                              </button>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{t("jasaDetail.optimizeRoute")}</p>
                                <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t("jasaDetail.optimizeRouteDesc")}</p>
                              </div>
                            </div>
                            {(state.distance || calcDist) && (
                              <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">{t("jasaDetail.distanceEstLabel")}</span>
                                {calcDist
                                  ? <span className="text-[#0B5CAD] text-xs flex items-center gap-1"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>{t("jasaDetail.calculatingLabel")}</span>
                                  : <span className="text-[#0B5CAD] font-bold text-sm">{state.distance} km</span>
                                }
                              </div>
                            )}
                          </div>

                          {/* ─ Barang ─ */}
                          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                            <p className="text-xs font-bold text-[#0B5CAD] uppercase tracking-wide">{t("jasaDetail.cargoLabel")}</p>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1.5">{t("jasaDetail.cargoCategoryLabel")} <span className="text-red-500">*</span></p>
                              <div className="grid grid-cols-2 gap-2">
                                {([
                                  { key: "Umum", label: t("jasaDetail.cargoCatGeneral") },
                                  { key: "Mudah Pecah Belah", label: t("jasaDetail.cargoCatFragile") },
                                  { key: "Dangerous Goods (DG)", label: t("jasaDetail.cargoCatDG") },
                                  { key: "Perlu Penanganan Khusus", label: t("jasaDetail.cargoCatSpecial") },
                                ] as { key: string; label: string }[]).map(({ key, label }) => (
                                  <button key={key} type="button" onClick={() => setCargoCategory(key)}
                                    className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all text-left leading-snug ${cargoCategory === key ? "border-[#0B5CAD] bg-blue-50 text-[#0B5CAD]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                                  >{label}</button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.koliQtyLabel")} <span className="text-red-500">*</span></label>
                                <Input type="number" min="1" placeholder="0" value={koliQty} onChange={e => setKoliQty(e.target.value)}/>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">{t("jasaDetail.grossWeightKg")} <span className="text-red-500">*</span></label>
                                <Input type="number" min="0.1" step="0.1" placeholder="0" value={grossWeight} onChange={e => setGrossWeight(e.target.value)}/>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium mb-1.5">{t("jasaDetail.dimensionsLabel")}</p>
                              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.5rem] gap-1.5 text-[10px] text-gray-400 font-medium mb-1.5">
                                <span>P (cm)</span><span>L (cm)</span><span>T (cm)</span><span>Koli</span><span/>
                              </div>
                              <div className="space-y-2">
                                {dimensions.map((row, i) => (
                                  <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1.5rem] gap-1.5 items-center">
                                    <Input type="number" min="0" placeholder="0" className="h-8 text-xs px-2" value={row.panjang} onChange={e => setDimensions(prev => prev.map((r, j) => j === i ? { ...r, panjang: e.target.value } : r))}/>
                                    <Input type="number" min="0" placeholder="0" className="h-8 text-xs px-2" value={row.lebar} onChange={e => setDimensions(prev => prev.map((r, j) => j === i ? { ...r, lebar: e.target.value } : r))}/>
                                    <Input type="number" min="0" placeholder="0" className="h-8 text-xs px-2" value={row.tinggi} onChange={e => setDimensions(prev => prev.map((r, j) => j === i ? { ...r, tinggi: e.target.value } : r))}/>
                                    <Input type="number" min="1" placeholder="1" className="h-8 text-xs px-2" value={row.koliQty} onChange={e => setDimensions(prev => prev.map((r, j) => j === i ? { ...r, koliQty: e.target.value } : r))}/>
                                    <button type="button" onClick={() => setDimensions(prev => prev.length > 1 ? prev.filter((_, j) => j !== i) : prev)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button type="button" onClick={() => setDimensions(prev => [...prev, newDimRow()])} className="mt-2 flex items-center gap-1.5 text-[#0B5CAD] text-xs font-semibold hover:text-[#083B70] transition-colors">
                                <Plus className="h-3.5 w-3.5"/> {t("jasaDetail.addDimension")}
                              </button>
                              {calcTotalVolumeM3(dimensions) > 0 && (
                                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex items-center justify-between">
                                  <span className="text-xs text-gray-600 font-medium">{t("jasaDetail.totalVolumeLabel")}</span>
                                  <span className="text-sm font-bold text-[#0B5CAD]">{calcTotalVolumeM3(dimensions).toFixed(3)} M³</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-medium block mb-1.5">{t("jasaDetail.notesOptional")}</label>
                              <textarea
                                rows={2}
                                placeholder={t("jasaDetail.notesPlaceholder")}
                                value={truckingNotes}
                                onChange={e => setTruckingNotes(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 text-xs px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0B5CAD]/30 focus:border-[#0B5CAD] placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <div className="flex items-baseline justify-between mb-1.5">
                                <p className="text-xs text-gray-600 font-medium">{t("jasaDetail.uploadPhotoLabel")} <span className="text-red-500">*</span></p>
                                <span className="text-[11px] text-gray-400">{t("jasaDetail.photoCount").replace('{n}', String(cargoPhotoUrls.length))}</span>
                              </div>
                              {cargoPhotoUrls.length < 5 && (
                                <label className="flex items-center gap-2.5 border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-[#0B5CAD] hover:bg-blue-50 transition-colors">
                                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                                  <span className="text-xs text-gray-500">{t("jasaDetail.photoPickerHint")}</span>
                                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={handlePhotoUpload}/>
                                </label>
                              )}
                              {cargoPhotoUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {cargoPhotoUrls.map((url, i) => (
                                    <div key={i} className="relative">
                                      <img src={url} alt={`Foto ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200"/>
                                      <button type="button" onClick={() => { setCargoPhotoUrls(prev => prev.filter((_, j) => j !== i)); setCargoPhotoFiles(prev => prev.filter((_, j) => j !== i)); }}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md leading-none">×</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ─ Pembayaran (wajib) ─ */}
                          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                            <p className="text-xs font-bold text-[#0B5CAD] uppercase tracking-wide">{t("jasaDetail.paymentLabel")} <span className="text-red-500">*</span></p>
                            <div className="grid grid-cols-2 gap-2">
                              {(["transfer", "gateway"] as const).map(type => {
                                const lb = { transfer: { title: "Transfer", desc: t("jasaDetail.transferDesc") }, gateway: { title: "Payment Gateway", desc: t("jasaDetail.gatewayDesc") } };
                                const sel = truckingPayment === type;
                                return (
                                  <button key={type} type="button"
                                    onClick={() => { setTruckingPayment(sel ? "" : type); setTruckingTransferTerm(""); setTruckingPayTerm(""); setTruckingDpNext(""); }}
                                    className={`flex flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${sel ? "border-[#0B5CAD] bg-blue-50 text-[#0B5CAD]" : "border-gray-200 bg-white text-gray-700 hover:border-[#0B5CAD]/50"}`}
                                  >
                                    <span className="font-semibold text-xs">{lb[type].title}</span>
                                    <span className="text-[10px] text-gray-400">{lb[type].desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {truckingPayment === "transfer" && (
                              <div className="rounded-xl border border-[#0B5CAD]/20 bg-blue-50 p-3 space-y-2">
                                <p className="text-[11px] font-semibold text-[#0B5CAD]">{t("jasaDetail.selectTransferLabel")}</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {(["full", "termin", "dp"] as const).map(term => {
                                    const tl = { full: { title: "Full Payment", desc: t("jasaDetail.fullPayDesc") }, termin: { title: "Termin", desc: t("jasaDetail.terminDesc") }, dp: { title: "DP / Advance", desc: t("jasaDetail.dpDesc") } };
                                    const sel = truckingTransferTerm === term;
                                    return (
                                      <button key={term} type="button"
                                        onClick={() => { setTruckingTransferTerm(sel ? "" : term); setTruckingPayTerm(""); setTruckingDpNext(""); }}
                                        className={`flex flex-col items-center gap-0.5 rounded-lg border-2 px-1.5 py-2 text-center transition-all ${sel ? "border-[#0B5CAD] bg-[#0B5CAD] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#0B5CAD]/50"}`}
                                      >
                                        <span className="font-semibold text-[11px]">{tl[term].title}</span>
                                        <span className={`text-[10px] ${sel ? "text-white/80" : "text-gray-400"}`}>{tl[term].desc}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {truckingTransferTerm === "termin" && (
                                  <div className="pt-1 space-y-1.5">
                                    <p className="text-[11px] font-medium text-[#0B5CAD]/80">{t("jasaDetail.terminPeriodLabel")}</p>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {(["net7","net14","net30","net60"] as const).map(t => (
                                        <button key={t} type="button" onClick={() => setTruckingPayTerm(truckingPayTerm === t ? "" : t)}
                                          className={`rounded-lg border-2 py-2 text-[11px] font-semibold text-center transition-all ${truckingPayTerm === t ? "border-[#0B5CAD] bg-[#0B5CAD] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#0B5CAD]/50"}`}
                                        >{t==="net7"?"Net 7":t==="net14"?"Net 14":t==="net30"?"Net 30":"Net 60"}</button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {truckingTransferTerm === "dp" && (
                                  <div className="pt-1 space-y-1.5">
                                    <p className="text-[11px] font-medium text-[#0B5CAD]/80">{t("jasaDetail.nextPaymentLabel")}</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {(["lunas-delivery","lunas-net30","lunas-net60","cicil"] as const).map(opt => {
                                        const dl: Record<string,string> = { "lunas-delivery":t("jasaDetail.afterDelivery"),"lunas-net30":t("jasaDetail.net30Days"),"lunas-net60":t("jasaDetail.net60Days"),"cicil":t("jasaDetail.installments") };
                                        return (
                                          <button key={opt} type="button" onClick={() => setTruckingDpNext(truckingDpNext === opt ? "" : opt)}
                                            className={`rounded-lg border-2 px-2 py-2 text-[11px] font-semibold text-center transition-all ${truckingDpNext === opt ? "border-[#0B5CAD] bg-[#0B5CAD] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-[#0B5CAD]/50"}`}
                                          >{dl[opt]}</button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* ── Step 2: Armada & Konfirmasi ── */}
                      {truckingStep === 2 && (() => {
                        const totalVol = calcTotalVolumeM3(dimensions);
                        const totalWgt = parseFloat(grossWeight) || 0;
                        const recommendedKey = VEHICLE_CAPS_LIST.find(v => totalWgt <= v.maxWeightKg && totalVol <= v.maxVolumeM3)?.key;
                        return (
                        <div className="px-3 pb-5 space-y-3">

                          {/* Mini summary */}
                          <div className="bg-white/10 rounded-xl px-4 py-3 space-y-1.5 text-xs text-white/90">
                            <p className="font-bold text-white text-[11px] uppercase tracking-wide mb-2">{t("jasaDetail.orderSummaryLabel")}</p>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">{t("jasaDetail.summarySchedule")}</span>
                              <span className="font-medium">{orderNow ? t("jasaDetail.summaryNow") : `${state.pickupDate || "—"}${state.pickupTime ? ` · ${state.pickupTime}` : ""}`}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70 flex-shrink-0">{t("jasaDetail.summaryRoute")}</span>
                              <span className="font-medium text-right text-[11px] leading-snug">
                                {(state.pickupCity || "").split(",")[0]}
                                {truckingStops.filter(s => s.city).map(s => ` → ${s.city.split(",")[0]}`).join("")}
                                {state.destCity ? ` → ${(state.destCity || "").split(",")[0]}` : ""}
                              </span>
                            </div>
                            {state.distance && (
                              <div className="flex justify-between gap-2">
                                <span className="text-white/70">{t("jasaDetail.summaryDistance")}</span>
                                <span className="font-bold text-white">{state.distance} km</span>
                              </div>
                            )}
                            {cargoCategory && (
                              <div className="flex justify-between gap-2">
                                <span className="text-white/70 flex-shrink-0">{t("jasaDetail.summaryCategory")}</span>
                                <span className="font-medium text-right text-[11px]">{cargoCategory}</span>
                              </div>
                            )}
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">{t("jasaDetail.summaryCargo")}</span>
                              <span className="font-medium">{koliQty} koli · {grossWeight} kg{calcTotalVolumeM3(dimensions) > 0 ? ` · ${calcTotalVolumeM3(dimensions).toFixed(2)} m³` : ""}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">{t("jasaDetail.summaryPhoto")}</span>
                              <span className="font-medium">{t("jasaDetail.photoUploaded").replace('{n}', String(cargoPhotoUrls.length))}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">{t("jasaDetail.summaryPayment")}</span>
                              <span className="font-medium">
                                {truckingPayment === "gateway" ? "Payment Gateway"
                                  : truckingTransferTerm === "full" ? t("jasaDetail.payTransferFull")
                                  : truckingTransferTerm === "termin" ? t("jasaDetail.payTransferTermin").replace('{term}', truckingPayTerm || "")
                                  : truckingTransferTerm === "dp" ? t("jasaDetail.payTransferDp")
                                  : t("jasaDetail.payTransfer")}
                              </span>
                            </div>
                          </div>

                          {/* Muatan info bar */}
                          {(totalWgt > 0 || totalVol > 0) && (
                            <div className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-3 text-xs text-white/90">
                              <svg className="w-4 h-4 flex-shrink-0 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>
                              <span>{t("jasaDetail.summaryCargo")}: <span className="font-semibold text-white">{totalWgt > 0 ? `${totalWgt} kg` : "—"}</span> · <span className="font-semibold text-white">{totalVol > 0 ? `${totalVol.toFixed(2)} m³` : "—"}</span></span>
                            </div>
                          )}

                          {/* Armada */}
                          <div className="space-y-2">
                            {VEHICLE_CAPS_LIST.map(v => {
                              const disabled = totalWgt > v.maxWeightKg || totalVol > v.maxVolumeM3;
                              const isSelected = state.vehicleType === v.key;
                              const isRecommended = v.key === recommendedKey;
                              const r = truckingRates[v.rateKey];
                              return (
                                <button key={v.key} type="button" disabled={disabled}
                                  onClick={() => { setState(prev => ({ ...prev, vehicleType: v.key, vehicleSubtype: "", trailerSize: "", ...(r ? { truckingRate: String(r.ratePerKm), loadingFee: String(r.loadingFee) } : {}) })); }}
                                  className={`w-full bg-white rounded-xl p-3 text-left transition-all ${disabled ? "opacity-40 cursor-not-allowed" : isSelected ? "ring-2 ring-white shadow-lg" : "hover:shadow-md shadow-sm"}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 mt-0.5 rounded-lg p-2 ${isSelected ? "bg-[#0B5CAD]" : "bg-slate-100"}`}>
                                      <svg viewBox="0 0 44 22" className="w-7 h-3.5" fill={isSelected ? "white" : "#9CA3AF"}>
                                        <rect x="0" y="6" width="13" height="11" rx="2"/>
                                        <rect x="13" y="2" width="29" height="15" rx="2" opacity="0.8"/>
                                        <circle cx="8" cy="20" r="2.5"/><circle cx="32" cy="20" r="2.5"/><circle cx="40" cy="20" r="2.5"/>
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-sm font-bold ${isSelected ? "text-[#0B5CAD]" : "text-gray-800"}`}>{v.label}</span>
                                        {isRecommended && !disabled && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">{t("jasaDetail.recommended")}</span>}
                                        {disabled && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 font-semibold border border-red-200">{t("jasaDetail.notSuitable")}</span>}
                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-[#0B5CAD] ml-auto flex-shrink-0"/>}
                                      </div>
                                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{v.desc}</p>
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">≤ {v.maxWeightKg >= 1000 ? `${v.maxWeightKg/1000} Ton` : `${v.maxWeightKg} kg`}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">≤ {v.maxVolumeM3} m³</span>
                                        {r && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0B5CAD] font-medium">{formatCurrency(r.ratePerKm)}/km</span>}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-[10px] text-gray-500 font-medium">{t("jasaDetail.distanceKmLabel")}</label>
                                          {calcDist && <span className="text-[10px] text-[#0B5CAD] flex items-center gap-1"><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>{t("jasaDetail.calculatingLabel")}</span>}
                                          {!calcDist && pickupGeo && destGeo && state.distance && <span className="text-[10px] text-[#0B5CAD]">{t("jasaDetail.autoLabel")}</span>}
                                        </div>
                                        <Input type="number" placeholder="0" className="h-8 text-xs" value={state.distance || ""} onChange={e => set("distance", e.target.value)} disabled={calcDist}/>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="text-[10px] text-gray-500 font-medium">{t("jasaDetail.ratePerKmIDR")}</label>
                                            {truckingRates[VEHICLE_CAPS_LIST.find(vv => vv.key === state.vehicleType)?.rateKey ?? ""] && <span className="text-[10px] text-[#0B5CAD]">{t("jasaDetail.adminVerified")}</span>}
                                          </div>
                                          <Input type="number" placeholder="0" className="h-8 text-xs" value={state.truckingRate || ""} onChange={e => set("truckingRate", e.target.value)}/>
                                        </div>
                                        <div>
                                          <div className="flex items-center justify-between mb-1">
                                            <label className="text-[10px] text-gray-500 font-medium">{t("jasaDetail.loadingFeeIDR")}</label>
                                            {truckingRates[VEHICLE_CAPS_LIST.find(vv => vv.key === state.vehicleType)?.rateKey ?? ""] && <span className="text-[10px] text-[#0B5CAD]">{t("jasaDetail.adminVerified")}</span>}
                                          </div>
                                          <Input type="number" placeholder="0" className="h-8 text-xs" value={state.loadingFee || ""} onChange={e => set("loadingFee", e.target.value)}/>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Estimasi biaya */}
                          {subtotal > 0 ? (
                            <div className="bg-white rounded-xl p-4 shadow-sm space-y-1.5 text-sm">
                              <p className="font-semibold text-gray-900">{t("jasaDetail.costBreakdownLabel")}</p>
                              <div className="flex justify-between text-gray-500">
                                <span>{parseFloat(state.distance)||0} km × {formatCurrency(parseFloat(state.truckingRate)||0)}/km</span>
                                <span>{formatCurrency((parseFloat(state.distance)||0)*(parseFloat(state.truckingRate)||0))}</span>
                              </div>
                              {(parseFloat(state.loadingFee)||0) > 0 && (
                                <div className="flex justify-between text-gray-500">
                                  <span>{t("jasaDetail.loadingFeeLabel")}</span>
                                  <span>{formatCurrency(parseFloat(state.loadingFee)||0)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                                <span>{t("jasaDetail.totalEstLabel")}</span>
                                <span className="text-[#0B5CAD] text-base">{formatCurrency(subtotal)}</span>
                              </div>
                            </div>
                          ) : state.vehicleType ? (
                            <div className="bg-white/15 rounded-xl p-3 text-white text-sm text-center">
                              <p>{t("jasaDetail.fillRateHint")}</p>
                            </div>
                          ) : null}

                          {added && (
                            <div className="bg-white rounded-xl p-3.5 flex items-center gap-2 shadow-sm">
                              <CheckCircle2 className="h-5 w-5 text-[#0B5CAD] flex-shrink-0"/>
                              <p className="text-sm font-medium text-gray-800">{t("jasaDetail.addedToCartMsg").replace('{name}', item.name)}</p>
                            </div>
                          )}
                        </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {ct === "storage" && <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.numDays")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.days || ""} onChange={e => set("days", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.quantityLabel")}</Label><Input type="number" placeholder="1" className="mt-1" value={state.quantity || ""} onChange={e => set("quantity", e.target.value)} /></div>
                  </div>
                  <div><Label>{t("jasaDetail.unitLabel")}</Label>
                    <Select value={state.unit || undefined} onValueChange={v => set("unit", v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={t("jasaDetail.selectUnit")} /></SelectTrigger>
                      <SelectContent>{["CBM", "Pallet", "KG"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t("jasaDetail.ratePerDayIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.ratePerDay || ""} onChange={e => set("ratePerDay", e.target.value)} /></div>
                </>}

                {ct === "document" && <>
                  <div><Label>{t("jasaDetail.documentType")}</Label><Input placeholder="Bill of Lading" className="mt-1" value={state.documentType || ""} onChange={e => set("documentType", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.quantityLabel")}</Label><Input type="number" placeholder="1" className="mt-1" value={state.quantity || ""} onChange={e => set("quantity", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.feePerDocIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.feePerDocument || ""} onChange={e => set("feePerDocument", e.target.value)} /></div>
                  </div>
                </>}

                {ct === "additional" && <>
                  <div><Label>{t("jasaDetail.serviceType")}</Label><Input placeholder="Insurance / Survey..." className="mt-1" value={state.serviceType || ""} onChange={e => set("serviceType", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.serviceFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.serviceFee || ""} onChange={e => set("serviceFee", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.adminFeeIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.adminFee || ""} onChange={e => set("adminFee", e.target.value)} /></div>
                  </div>
                </>}

                {ct === "generic" && <>
                  <div><Label>{t("jasaDetail.serviceName")}</Label><Input placeholder={item.name} className="mt-1" value={state.serviceName || ""} onChange={e => set("serviceName", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("jasaDetail.quantityLabel")}</Label><Input type="number" placeholder="1" className="mt-1" value={state.quantity || ""} onChange={e => set("quantity", e.target.value)} /></div>
                    <div><Label>{t("jasaDetail.unitPriceIDR")}</Label><Input type="number" placeholder="0" className="mt-1" value={state.unitPrice || ""} onChange={e => set("unitPrice", e.target.value)} /></div>
                  </div>
                  <div><Label>{t("jasaDetail.notesOptional")}</Label><Input placeholder="Detail tambahan..." className="mt-1" value={state.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
                </>}

                {ct !== "trucking" && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Premium estimasi subtotal */}
                    <div
                      className="rounded-2xl p-5 transition-all duration-300"
                      style={subtotal > 0 ? {
                        background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}E0 100%)`,
                        boxShadow: `0 8px 28px ${hero.accentColor}30`,
                      } : {
                        background: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: subtotal > 0 ? "rgba(255,255,255,0.6)" : "#94A3B8" }}>
                            {t("jasaDetail.estimatedSubtotal")}
                          </p>
                          <p className="text-[2rem] font-bold tracking-tight leading-none" style={{ color: subtotal > 0 ? "#FFFFFF" : "#CBD5E1" }}>
                            {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                          </p>
                          <p className="text-[11px] mt-2" style={{ color: subtotal > 0 ? "rgba(255,255,255,0.5)" : "#94A3B8" }}>
                            {t("jasaDetail.estimatedSubtotalNote")}
                          </p>
                        </div>
                        {subtotal > 0 && (
                          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                      </div>
                    </div>

                    {!added ? (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={subtotal <= 0}
                        className="w-full h-[52px] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.985] disabled:opacity-35 disabled:cursor-not-allowed text-white"
                        style={{
                          background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`,
                          boxShadow: `0 4px 16px ${hero.accentColor}35`,
                        }}
                        onMouseEnter={e => { if (subtotal > 0) { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${hero.accentColor}50`; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${hero.accentColor}35`; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {t("jasaDetail.addToOrderBtn")}
                      </button>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200/80 rounded-xl px-4 py-3 text-[13px] font-semibold">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          {t("jasaDetail.addedToCartConfirm").replace('{name}', item.name)}
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Button variant="outline" onClick={() => {
                            setAdded(false);
                            setState({});
                            setAirRows([newAirRow()]);
                            setOrderNow(false);
                            setCargoCategory("");
                            setKoliQty("");
                            setGrossWeight("");
                            setDimensions([newDimRow()]);
                            setCargoPhotoFiles([]);
                            setCargoPhotoUrls([]);
                            setTruckingStep(1);
                          }} className="gap-1.5 rounded-xl border-slate-200 text-slate-600 h-11">
                            <Calculator className="h-4 w-4" /> {t("jasaDetail.recalcBtn")}
                          </Button>
                          <button
                            type="button"
                            onClick={handleProceed}
                            className="rounded-xl text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 h-11 transition-all"
                            style={{ background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)` }}
                          >
                            <ArrowRight className="h-4 w-4" /> {t("jasaDetail.proceedBtn")}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={ct === "trucking" ? "w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 space-y-4" : "space-y-4"}>

            {/* ── Premium info card ── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: `0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.10)`,
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              {/* Premium blue header */}
              <div
                className="px-5 py-5"
                style={{
                  background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}DD 100%)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10" style={{ background: "white" }} />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-10" style={{ background: "white" }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{t("jasaDetail.sidebarInfoLabel")}</p>
                    <span className="text-[10px] px-2.5 py-0.5 bg-white/20 text-white/85 rounded-full font-semibold backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-[2rem] font-bold tracking-tight leading-none ${subtotal > 0 ? "text-white" : "text-white/30"}`}>
                    {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                  </p>
                  <p className="text-[11.5px] text-white/55 mt-2 leading-snug">
                    {ct === "trucking" ? t("jasaDetail.sidebarTruckingNote") : t("jasaDetail.quotation")}
                  </p>
                </div>
              </div>

              {/* White body */}
              <div className="bg-white divide-y divide-slate-100/80">
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-[12px] text-slate-400 font-medium">{t("jasaDetail.summaryCategory")}</span>
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: hero.badgeBg, color: hero.badgeText }}
                  >{item.category}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-[12px] text-slate-400 font-medium">{t("jasaDetail.statusLabel")}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-200/80">
                    {t("jasaDetail.availableLabel")}
                  </span>
                </div>
                {ct === "trucking" && state.vehicleType && (
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-[12px] text-slate-400 font-medium">{t("jasaDetail.vehicleLabel")}</span>
                    <span className="text-[11px] font-semibold text-slate-700 text-right max-w-[150px] leading-snug">{state.vehicleType}</span>
                  </div>
                )}
                {ct === "trucking" && state.distance && (
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-[12px] text-slate-400 font-medium">{t("jasaDetail.distanceLabel")}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{state.distance} km</span>
                  </div>
                )}
              </div>

              {/* CTA button */}
              <div className="bg-white px-5 pb-5 pt-3">
                <button
                  type="button"
                  onClick={requireAuthThenBook}
                  className="w-full h-[48px] rounded-xl flex items-center justify-center gap-2.5 text-[13.5px] font-bold transition-all duration-200 active:scale-[0.98] text-white"
                  style={{
                    background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`,
                    boxShadow: `0 4px 16px ${hero.accentColor}3A`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${hero.accentColor}55`; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${hero.accentColor}3A`; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("jasaDetail.viewCartBtn")}
                </button>
              </div>
            </div>

            {/* ── Trust badges ── */}
            <div
              className="bg-white rounded-2xl px-5 py-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">{t("jasaDetail.whyUsLabel")}</p>
              <div className="space-y-2.5">
                {[
                  { icon: "🛡️", text: t("jasaDetail.trustBadge1") },
                  { icon: "⏱️", text: t("jasaDetail.trustBadge2") },
                  { icon: "📦", text: t("jasaDetail.trustBadge3") },
                  { icon: "💬", text: t("jasaDetail.trustBadge4") },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{b.icon}</span>
                    <span className="text-[12.5px] text-slate-600 font-medium">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Related services ── */}
            {otherServices.length > 0 && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="px-5 pt-4 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {t("jasaDetail.relatedServicesLabel").replace('{category}', item.category)}
                  </p>
                </div>
                <div className="divide-y divide-slate-100/80 px-2 pb-2">
                  {otherServices.map((s) => (
                    <Link key={s.id} href={`/jasa/${s.id}`}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900 truncate">{s.name}</p>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{s.description}</p>
                        </div>
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ background: hero.accentLight }}
                        >
                          <ArrowRight className="h-3.5 w-3.5 transition-colors" style={{ color: hero.accentColor }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to catalog */}
            <Link href="/jasa">
              <button
                type="button"
                className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium text-slate-400 hover:text-slate-700 hover:bg-white transition-all duration-200"
                style={{ border: "1px solid transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = "1px solid rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = "1px solid transparent"; }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("jasaDetail.viewAllServices")}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Next / Add-to-Cart button for trucking */}
      {ct === "trucking" && !pendingOrder && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
          }}
        >
          <div className="max-w-[1200px] mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
            {!added ? (
              <>
                {truckingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setTruckingStep(truckingStep - 1)}
                    className="sm:min-w-[130px] py-3.5 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    {t("jasaDetail.backBtn")}
                  </button>
                ) : <div />}
                {truckingStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={truckingPayment === "transfer" && !truckingTransferTerm}
                    className="sm:min-w-[200px] text-white py-3.5 px-8 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`, boxShadow: `0 4px 16px ${hero.accentColor}35` }}
                  >
                    {t("jasaDetail.nextBtn")} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={subtotal <= 0}
                    className="sm:min-w-[220px] text-white py-3.5 px-8 rounded-xl font-bold text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`, boxShadow: `0 4px 16px ${hero.accentColor}35` }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t("jasaDetail.addToOrderBtn")}
                  </button>
                )}
              </>
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => { setAdded(false); setState({}); setTruckingStep(1); setTruckingStops([]); setOrderNow(false); setCargoCategory(""); setKoliQty(""); setGrossWeight(""); setDimensions([newDimRow()]); setCargoPhotoFiles([]); setCargoPhotoUrls([]); setTruckingPayment(""); setTruckingTransferTerm(""); setTruckingPayTerm(""); setTruckingDpNext(""); }}
                  className="flex-1 sm:flex-none sm:min-w-[130px] py-3.5 px-5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Calculator className="h-4 w-4" /> {t("jasaDetail.recalcBtn")}
                </button>
                <button
                  type="button"
                  onClick={handleProceed}
                  className="flex-1 sm:flex-none sm:min-w-[160px] text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 py-3.5 px-5 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${hero.accentColor} 0%, ${hero.accentColor}CC 100%)`, boxShadow: `0 4px 16px ${hero.accentColor}35` }}
                >
                  {t("jasaDetail.proceedBtn")} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending-order confirm banner */}
      {pendingOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary/20 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
          <div className="container max-w-4xl px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t("jasaDetail.pendingOrderTitle")}</p>
              <p className="text-xs text-muted-foreground truncate">
                {t("jasaDetail.pendingOrderLabel")} <span className="font-medium text-foreground">{pendingOrder.productName}</span>
                {" · "}
                {(added || cartItems.some((i) => i.calculatorType !== "product"))
                  ? t("jasaDetail.pendingOrderAdded")
                  : <span className="text-amber-600 font-medium">{t("jasaDetail.pendingOrderHint")}</span>}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem("pendingJasaReview");
                  setPendingOrder(null);
                }}
              >
                {t("jasaDetail.cancelBtn")}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                disabled={!added && !cartItems.some((i) => i.calculatorType !== "product")}
                onClick={confirmJasaAndCheckout}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("jasaDetail.confirmOrderBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <WhatsAppButtonStandalone />
    </div>
  );
}
