import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  X, Trash2, Plus, ShoppingCart, ArrowRight,
  Package, Truck, Ship, Plane, FileCheck, Warehouse, FileText, Zap,
  ChevronLeft, MapPin, Calculator, Calendar, Clock, Shield, Loader2,
} from "lucide-react";

import { useCart, CartItem } from "@/lib/logistic-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const OPEN_CART_EVENT = "open-cart-drawer";

// ── Type meta for cart items ──────────────────────────────────────────────────

const TYPE_META: Record<string, {
  label: string; color: string; iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  product:     { label: "Produk",      color: "bg-emerald-100 text-emerald-700 border-emerald-200", iconBg: "bg-emerald-100", icon: Package },
  trucking:    { label: "Trucking",    color: "bg-amber-100 text-amber-700 border-amber-200",       iconBg: "bg-amber-100",   icon: Truck },
  air_freight: { label: "Air Freight", color: "bg-sky-100 text-sky-700 border-sky-200",             iconBg: "bg-sky-100",     icon: Plane },
  sea_fcl:     { label: "Sea FCL",     color: "bg-blue-100 text-blue-700 border-blue-200",          iconBg: "bg-blue-100",    icon: Ship },
  sea_lcl:     { label: "Sea LCL",     color: "bg-blue-100 text-blue-700 border-blue-200",          iconBg: "bg-blue-100",    icon: Ship },
  customs:     { label: "Pabean",      color: "bg-violet-100 text-violet-700 border-violet-200",    iconBg: "bg-violet-100",  icon: FileCheck },
  storage:     { label: "Storage",     color: "bg-orange-100 text-orange-700 border-orange-200",    iconBg: "bg-orange-100",  icon: Warehouse },
  document:    { label: "Document",    color: "bg-slate-100 text-slate-600 border-slate-200",       iconBg: "bg-slate-100",   icon: FileText },
  additional:  { label: "Additional",  color: "bg-rose-100 text-rose-700 border-rose-200",          iconBg: "bg-rose-100",    icon: Zap },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { label: type, color: "bg-slate-100 text-slate-600 border-slate-200", iconBg: "bg-slate-100", icon: Package };
}

// ── Service catalog cards ─────────────────────────────────────────────────────

const DRAWER_SERVICES = [
  { id: "trucking",   name: "Trucking",          icon: <Truck     className="w-5 h-5" />, desc: "Pengiriman darat, kota ke kota",          color: "bg-orange-50 border-orange-200 text-orange-700",  isTrucking: true  },
  { id: "sea",        name: "Kargo Laut",         icon: <Ship      className="w-5 h-5" />, desc: "FCL / LCL, impor & ekspor",               color: "bg-blue-50 border-blue-200 text-blue-700",        isTrucking: false },
  { id: "air",        name: "Kargo Udara",        icon: <Plane     className="w-5 h-5" />, desc: "Pengiriman cepat via udara",               color: "bg-sky-50 border-sky-200 text-sky-700",           isTrucking: false },
  { id: "storage",    name: "Pergudangan",        icon: <Warehouse className="w-5 h-5" />, desc: "Penyimpanan & manajemen stok",             color: "bg-emerald-50 border-emerald-200 text-emerald-700", isTrucking: false },
  { id: "customs",    name: "Custom Clearance",   icon: <FileCheck className="w-5 h-5" />, desc: "Pengurusan bea cukai & dokumen",           color: "bg-slate-50 border-slate-200 text-slate-700",     isTrucking: false },
  { id: "additional", name: "Asuransi & Lainnya", icon: <Shield    className="w-5 h-5" />, desc: "Asuransi, survei, permit & compliance",    color: "bg-purple-50 border-purple-200 text-purple-700",  isTrucking: false },
];

const GOODS_TYPES = ["General Cargo","Kopi / Hasil Bumi","Elektronik","Perishable","Kimia / B3","Furniture","Mesin & Spare-part","Lainnya"];
const INCOTERMS   = ["EXW","FCA","FOB","CIF","DAP","DDP","CPT","CIP"];

const VEHICLE_CAPACITIES = [
  { type: "CDE",     label: "CDE — Engkel Kecil",  desc: "s/d 1.500 kg",  maxKg: 1_500       },
  { type: "CDD",     label: "CDD — Engkel Besar",  desc: "s/d 3.000 kg",  maxKg: 3_000       },
  { type: "Fuso",    label: "Fuso — Truk Medium",  desc: "s/d 8.000 kg",  maxKg: 8_000       },
  { type: "Wingbox", label: "Wingbox — Truk Besar",desc: "s/d 20.000 kg", maxKg: 20_000      },
  { type: "Trailer", label: "Trailer",              desc: "> 20.000 kg",   maxKg: Infinity    },
];

function suggestVehicleType(weightKg: number): string {
  for (const v of VEHICLE_CAPACITIES) {
    if (weightKg <= v.maxKg) return v.type;
  }
  return "Trailer";
}

// ── Cart item detail lines ────────────────────────────────────────────────────

function getItemDetails(item: CartItem): string[] {
  const d = item.inputData;
  const str = (v: unknown) => (v != null && v !== "" ? String(v) : "");
  const details: string[] = [];

  // ── Vendor catalog item: tampilkan qty + unit dari calculationResult ──
  if (item.itemSource === "vendor_catalog_item") {
    const cr = item.calculationResult as Record<string, unknown>;
    const qty = cr.chargeableQty ?? d.quantity;
    const unit = cr.chargeableUnit ?? d.unit;
    if (qty != null) details.push(`Qty: ${str(qty)}${unit ? ` ${str(unit)}` : ""}`);
    if (item.vendorName) details.push(`Vendor: ${item.vendorName}`);
    return details;
  }

  switch (item.calculatorType) {
    case "product":
      if (d.qty) details.push(`Qty: ${str(d.qty)}${d.unit ? ` ${str(d.unit)}` : ""}`);
      break;
    case "trucking":
      if (d.pickupCity && d.destCity) details.push(`${str(d.pickupCity)} → ${str(d.destCity)}`);
      else if (d.pickupCity) details.push(`Asal: ${str(d.pickupCity)}`);
      if (d.vehicleType) {
        const v = str(d.vehicleType);
        details.push(`Armada: ${d.trailerSize ? `${v} – ${str(d.trailerSize)}` : v}`);
      }
      if (d.gross_weight_kg) details.push(`Berat: ${str(d.gross_weight_kg)} kg`);
      break;
    case "air_freight": {
      if (d.originAirport && d.destinationAirport)
        details.push(`${str(d.originAirport)} → ${str(d.destinationAirport)}`);
      const gw = parseFloat(str(d.grossWeight)) || 0;
      const l  = parseFloat(str(d.length))      || 0;
      const w  = parseFloat(str(d.width))       || 0;
      const h  = parseFloat(str(d.height))      || 0;
      const qty = parseFloat(str(d.quantity))   || 1;
      const vw = (l * w * h * qty) / 6000;
      if (gw > 0) details.push(`Berat Kotor: ${gw} kg`);
      if (gw > 0 || vw > 0) details.push(`Chargeable: ${Math.max(gw, vw).toFixed(2)} kg`);
      if (d.quantity) details.push(`Koli: ${str(d.quantity)} pcs`);
      break;
    }
    case "sea_fcl":
      if (d.originPort && d.destinationPort) details.push(`${str(d.originPort)} → ${str(d.destinationPort)}`);
      if (d.containerType) details.push(`Container: ${str(d.containerType)}`);
      break;
    case "sea_lcl":
      if (d.cbm)    details.push(`CBM: ${str(d.cbm)}`);
      if (d.weight) details.push(`Berat: ${str(d.weight)} kg`);
      break;
    case "storage":
      if (d.days)     details.push(`Durasi: ${str(d.days)} hari`);
      if (d.quantity) details.push(`Qty: ${str(d.quantity)} ${str(d.unit)}`);
      break;
    default:
      if (d.quantity) details.push(`Qty: ${str(d.quantity)}`);
  }
  return details;
}

function groupItems(items: CartItem[]): [string, CartItem[]][] {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const k = item.calculatorType;
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return [...map.entries()];
}

// ── CartItemCard ──────────────────────────────────────────────────────────────

function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: (id: string) => void }) {
  const { t }  = useLanguage();
  const meta   = getTypeMeta(item.calculatorType);
  const Icon   = meta.icon;
  const details = getItemDetails(item);
  const isTrucking = item.calculatorType === "trucking";
  const isVendorCatalog = item.itemSource === "vendor_catalog_item";
  const ps = item.priceSnapshot;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${isVendorCatalog ? "bg-sky-50" : meta.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${isVendorCatalog ? "text-sky-600" : "text-slate-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 flex-wrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${meta.color}`}>
                  {meta.label}
                </span>
                {isVendorCatalog && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-sky-50 text-sky-700 border-sky-200">
                    {t("cartDrawer.vendorMarketplace", "Vendor Marketplace")}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug">{item.serviceName}</p>
            </div>
            <button onClick={() => onRemove(item.cartId)} className="text-slate-300 hover:text-red-400 transition-colors mt-0.5 shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {details.map((d, i) => (
              <p key={i} className="text-[11px] text-slate-400 leading-snug">{d}</p>
            ))}
          </div>
          {/* Price display */}
          {isVendorCatalog && ps ? (
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[11px] text-slate-400">
                {formatCurrency(ps.priceSell)} / {ps.unit}
              </p>
              {ps.tax != null && ps.tax > 0 && (
                <p className="text-[11px] text-slate-400">PPN: {formatCurrency(ps.tax)}</p>
              )}
              <p className="text-xs font-bold text-sky-700">{formatCurrency(item.subtotal)}</p>
            </div>
          ) : item.subtotal > 0 ? (
            <p className="text-xs font-bold text-sky-700 mt-1.5">{formatCurrency(item.subtotal)}</p>
          ) : isTrucking ? (
            <span className="inline-block mt-1.5 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">{t("cartDrawer.pricePending", "Harga menyusul")}</span>
          ) : (
            <span className="inline-block mt-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">{t("cartDrawer.priceNego", "Harga nego")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main CartDrawer ───────────────────────────────────────────────────────────

type DrawerView = "cart" | "service-catalog" | "trucking" | "freight";
type FreightSvcId = "sea" | "air" | "storage" | "customs" | "additional";

const FREIGHT_SVC_META: Record<FreightSvcId, { name: string; calcType: string; color: string }> = {
  sea:       { name: "Kargo Laut",         calcType: "sea_lcl",     color: "blue"    },
  air:       { name: "Kargo Udara",        calcType: "air_freight", color: "sky"     },
  storage:   { name: "Pergudangan",        calcType: "storage",     color: "emerald" },
  customs:   { name: "Custom Clearance",   calcType: "customs",     color: "slate"   },
  additional:{ name: "Asuransi & Lainnya", calcType: "additional",  color: "purple"  },
};

import { COMPANY_CONFIG } from "@/config/company";

const DEFAULT_PICKUP = COMPANY_CONFIG.pickupAddress;

export function CartDrawer() {
  const { t }                  = useLanguage();
  const [open, setOpen]        = useState(false);
  const [view, setView]        = useState<DrawerView>("cart");
  const [truckMode, setTruckMode] = useState<"detail" | "calculator">("detail");
  const [truckData, setTruckData] = useState<Record<string, string>>({});
  const [truckEstimate, setTruckEstimate] = useState<number | null>(null);
  const [truckEstimating, setTruckEstimating] = useState(false);
  const [vehicleComparison, setVehicleComparison] = useState<Array<{ type: string; label: string; desc: string; estimate: number; suitable: boolean }> | null>(null);
  const [deliveryAddressError, setDeliveryAddressError] = useState(false);
  const [freightDestError, setFreightDestError] = useState(false);
  const [companyFetchFailed, setCompanyFetchFailed] = useState(false);
  const [companyPickup, setCompanyPickup] = useState<{ name: string; address: string; originCity: string } | null>(null);
  const [cartAutoFilled, setCartAutoFilled] = useState(false);
  const [apiRates, setApiRates] = useState<Array<{ type: string; label: string; description: string; max_kg: string | null; rate_per_kg: string; min_price: string }> | null>(null);
  const [freightSvc, setFreightSvc]         = useState<FreightSvcId>("sea");
  const [freightData, setFreightData]       = useState<Record<string, string>>({});
  const [freightEstimate, setFreightEstimate] = useState<number | null>(null);
  const [freightEstimating, setFreightEstimating] = useState(false);
  const [freightAutoFilled, setFreightAutoFilled] = useState(false);
  const [, setLocation]        = useLocation();
  const { toast }              = useToast();

  const { items, addItem, replaceItemByType, removeItem, clearCart, subtotal, tax, grandTotal, taxRate } = useCart();

  const hasProductOnly = items.length > 0 && items.every(i => i.calculatorType === "product");

  const [selectedShipping, setSelectedShipping] = useState<"pickup" | "darat" | "laut" | "udara" | null>(() => {
    try { return (JSON.parse(localStorage.getItem("logistic_product_shipping") ?? "null") as { method?: string } | null)?.method as "pickup" | "darat" | "laut" | "udara" | null ?? null; }
    catch { return null; }
  });

  const daratEstimate = useMemo(() => {
    const productItems = items.filter(i => i.calculatorType === "product");
    if (productItems.length === 0) return null;
    const itemsWithWeight = productItems.filter(i => Number(i.inputData.weightKg ?? 0) > 0);
    const totalWeight = itemsWithWeight.length > 0
      ? itemsWithWeight.reduce((s, i) => s + Number(i.inputData.weightKg) * Number(i.inputData.qty ?? 1), 0)
      : productItems.reduce((s, i) => s + Number(i.inputData.qty ?? 1), 0);
    if (totalWeight <= 0) return null;
    const vehicleType = suggestVehicleType(totalWeight);
    return offlineEstimateForVehicle(totalWeight, vehicleType, 0);
  }, [items]);

  function computeCartAutoFill(): { hasData: boolean; weight?: string; vehicleType?: string; length?: string; width?: string; height?: string; goodsType?: string } {
    const productItems = items.filter(i => i.calculatorType === "product");
    // Hitung berat: jika ada produk dengan weightKg, pakai itu; fallback: qty per item
    const itemsWithWeight = productItems.filter(i => i.inputData.weightKg != null && Number(i.inputData.weightKg) > 0);
    const hasWeightData = itemsWithWeight.length > 0;
    const totalWeight = hasWeightData
      ? itemsWithWeight.reduce((sum, i) => sum + Number(i.inputData.weightKg) * Number(i.inputData.qty ?? 1), 0)
      : productItems.reduce((sum, i) => sum + Number(i.inputData.qty ?? 1), 0); // fallback 1 kg/unit

    if (productItems.length === 0) return { hasData: false };

    const dimItem = productItems.reduce((best: CartItem | null, item) => {
      const vol = Number(item.inputData.lengthCm ?? 0) * Number(item.inputData.widthCm ?? 0) * Number(item.inputData.heightCm ?? 0) * Number(item.inputData.qty ?? 1);
      const bestVol = best ? Number(best.inputData.lengthCm ?? 0) * Number(best.inputData.widthCm ?? 0) * Number(best.inputData.heightCm ?? 0) * Number(best.inputData.qty ?? 1) : 0;
      return vol > bestVol ? item : best;
    }, null);

    const goodsItem = productItems.find(i => i.inputData.goodsType);
    const roundedWeight = Math.round(totalWeight * 100) / 100;

    return {
      hasData: true,
      weight:     roundedWeight > 0 ? String(roundedWeight) : "",
      vehicleType: roundedWeight > 0 ? suggestVehicleType(roundedWeight) : "",
      length:     dimItem?.inputData.lengthCm ? String(dimItem.inputData.lengthCm) : "",
      width:      dimItem?.inputData.widthCm  ? String(dimItem.inputData.widthCm)  : "",
      height:     dimItem?.inputData.heightCm ? String(dimItem.inputData.heightCm) : "",
      goodsType:  goodsItem?.inputData.goodsType ? String(goodsItem.inputData.goodsType) : "",
    };
  }

  useEffect(() => {
    const handleOpen = () => { setOpen(true); setView("cart"); };
    window.addEventListener(OPEN_CART_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CART_EVENT, handleOpen);
  }, []);

  useEffect(() => {
    fetch("/api/trucking-rates")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length > 0) setApiRates(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view !== "trucking") return;
    try {
      const saved = JSON.parse(localStorage.getItem("truck_pref") ?? "{}") as { destCity?: string; vehicleType?: string };
      setTruckData(p => ({
        ...p,
        ...(saved.destCity   && !p.destCity    ? { destCity:    saved.destCity   } : {}),
        ...(saved.vehicleType && !p.vehicleType ? { vehicleType: saved.vehicleType } : {}),
      }));
    } catch { /**/ }
  }, [view]);

  useEffect(() => {
    if (!open || companyPickup) return;
    fetch("/api/settings/company-pickup-address")
      .then(r => r.ok ? r.json() : null)
      .then((d: { companyName: string; companyAddress: string; originCity?: string } | null) => {
        if (d?.companyAddress) {
          setCompanyPickup({ name: d.companyName, address: d.companyAddress, originCity: d.originCity ?? COMPANY_CONFIG.originCity });
        } else {
          setCompanyPickup({ name: COMPANY_CONFIG.brandName, address: DEFAULT_PICKUP, originCity: COMPANY_CONFIG.originCity });
        }
      })
      .catch(() => {
        setCompanyPickup({ name: COMPANY_CONFIG.brandName, address: DEFAULT_PICKUP, originCity: COMPANY_CONFIG.originCity });
        setCompanyFetchFailed(true);
      });
  }, [open, companyPickup]);

  function close() { setOpen(false); }

  function openServiceCatalog() {
    setView("service-catalog");
    setTruckData({});
    setTruckEstimate(null);
    setTruckMode("detail");
    setFreightData({});
    setFreightEstimate(null);
    setFreightAutoFilled(false);
  }

  function handleCheckout() {
    if (hasProductOnly) {
      try {
        localStorage.setItem("logistic_product_shipping", JSON.stringify({
          method: selectedShipping ?? "pickup",
          estimate: selectedShipping === "darat" ? daratEstimate : null,
          companyName: companyPickup?.name ?? COMPANY_CONFIG.brandName,
          companyAddress: companyPickup?.address ?? DEFAULT_PICKUP,
        }));
      } catch { /**/ }
    }
    close();
    setLocation("/book?step=3");
  }

  function handleAddTruckingItem() {
    if (truckMode === "detail" && !truckData.deliveryAddress?.trim()) {
      setDeliveryAddressError(true);
      toast({ title: t("cartDrawer.toastDeliveryRequired", "Alamat Pengiriman wajib diisi"), variant: "destructive" });
      return;
    }
    const name = truckMode === "detail" ? t("cartDrawer.truckingService", "Trucking — Pickup & Delivery") : t("cartDrawer.truckingCargo", "Trucking — Kargo");
    const pickupAddr = companyPickup?.address ?? DEFAULT_PICKUP;
    replaceItemByType({
      category: "Trucking",
      serviceName: name,
      calculatorType: "trucking",
      inputData: truckMode === "detail"
        ? { pickupCity: pickupAddr, destCity: truckData.deliveryAddress,
            vehicleType: "CDD", pickupDate: truckData.pickupDate, pickupTime: truckData.pickupTime,
            receiver_name: truckData.contactName, receiver_phone: truckData.contactPhone }
        : { ...truckData, pickupCity: companyPickup?.originCity ?? COMPANY_CONFIG.originCity },
      calculationResult: truckEstimate ? { estimated_price: truckEstimate } : {},
      subtotal: 0,
    });
    toast({ title: `${name} ${t("cartDrawer.toastUpdated", "diperbarui di keranjang")}` });
    setTruckData({});
    setTruckEstimate(null);
    setView("cart");
  }

  function handleNonTruckingService(id: string) {
    const svcId = id as FreightSvcId;
    setFreightSvc(svcId);
    setFreightEstimate(null);
    setFreightEstimating(false);
    // Auto-fill berat & dimensi dari produk di keranjang
    const af = computeCartAutoFill();
    if (af.hasData) {
      setFreightData({
        originCountry: "Indonesia",
        weight: af.weight || "",
        length: af.length || "",
        width:  af.width  || "",
        height: af.height || "",
        goodsType: af.goodsType || "",
      });
      setFreightAutoFilled(true);
    } else {
      setFreightData({ originCountry: "Indonesia" });
      setFreightAutoFilled(false);
    }
    setFreightDestError(false);
    setView("freight");
  }

  function computeFreightEstimate() {
    // Validasi destination sebelum hitung estimasi
    if (freightSvc === "sea" && !freightData.destCountry?.trim()) {
      setFreightDestError(true);
      toast({ title: t("cartDrawer.toastDestRequired", "Isi Negara Tujuan terlebih dahulu"), variant: "destructive" });
      return;
    }
    if (freightSvc === "air" && !freightData.destAirport?.trim()) {
      setFreightDestError(true);
      toast({ title: t("cartDrawer.toastAirportRequired", "Isi Bandara Tujuan terlebih dahulu"), variant: "destructive" });
      return;
    }
    setFreightDestError(false);
    setFreightEstimating(true);
    const fd = freightData;
    setTimeout(() => {
      let estimate = 0;
      if (freightSvc === "sea") {
        const w   = parseFloat(fd.weight || "0") || 0;
        const l   = parseFloat(fd.length || "0") || 0;
        const wi  = parseFloat(fd.width  || "0") || 0;
        const h   = parseFloat(fd.height || "0") || 0;
        const cbm = (l * wi * h) / 1_000_000;
        const chargeable = Math.max(w / 1000, cbm);
        estimate = Math.max(500_000, Math.round(chargeable * 150_000));
      } else if (freightSvc === "air") {
        const w  = parseFloat(fd.weight || "0") || 0;
        const l  = parseFloat(fd.length || "0") || 0;
        const wi = parseFloat(fd.width  || "0") || 0;
        const h  = parseFloat(fd.height || "0") || 0;
        const volW = (l * wi * h) / 6_000;
        const chargeable = Math.max(w, volW);
        estimate = Math.max(200_000, Math.round(chargeable * 25_000));
      } else if (freightSvc === "storage") {
        const vol = parseFloat(fd.volume   || "0") || 0;
        const dur = parseFloat(fd.duration || "1") || 1;
        estimate = Math.max(200_000, Math.round(vol * dur * 50_000));
      } else if (freightSvc === "customs") {
        const val = parseFloat(fd.cargoValue || "0") || 0;
        estimate = Math.max(500_000, Math.round(val * 0.025));
      }
      setFreightEstimate(estimate > 0 ? estimate : null);
      setFreightEstimating(false);
    }, 600);
  }

  function handleAddFreightItem() {
    // Validasi destination wajib untuk sea/air
    if (freightSvc === "sea" && !freightData.destCountry?.trim()) {
      setFreightDestError(true);
      toast({ title: t("cartDrawer.toastDestCountryRequired", "Negara Tujuan wajib diisi"), variant: "destructive" });
      return;
    }
    if (freightSvc === "air" && !freightData.destAirport?.trim()) {
      setFreightDestError(true);
      toast({ title: t("cartDrawer.toastDestAirportRequired", "Bandara Tujuan wajib diisi"), variant: "destructive" });
      return;
    }
    const meta = FREIGHT_SVC_META[freightSvc];
    let name = meta.name;
    if (freightSvc === "sea")       name = `Kargo Laut — ${freightData.shipType || "LCL"}`;
    else if (freightSvc === "air")  name = "Kargo Udara";
    else if (freightSvc === "customs") name = `Custom Clearance — ${freightData.customsType || "Import"}`;
    else if (freightSvc === "additional") name = freightData.addlType || "Asuransi & Lainnya";
    replaceItemByType({
      serviceName: name,
      category: meta.name,
      calculatorType: meta.calcType,
      inputData: { ...freightData },
      calculationResult: freightEstimate ? { estimated_price: freightEstimate } : {},
      subtotal: freightEstimate ?? 0,
    });
    toast({ title: `${name} ${t("cartDrawer.toastUpdated", "diperbarui di keranjang")}` });
    setFreightData({});
    setFreightEstimate(null);
    setFreightAutoFilled(false);
    setView("cart");
  }

  async function handleCompareVehicles() {
    setTruckEstimating(true);
    setVehicleComparison(null);
    const w  = parseFloat(truckData.weight  || "0") || 0;
    const l  = parseFloat(truckData.length  || "0") || 0;
    const wi = parseFloat(truckData.width   || "0") || 0;
    const h  = parseFloat(truckData.height  || "0") || 0;
    const volW = (l && wi && h) ? (l * wi * h) / 4000 : 0;
    const origin = companyPickup?.originCity ?? COMPANY_CONFIG.originCity;

    const vehicleList = (apiRates && apiRates.length > 0)
      ? apiRates.map(r => ({
          type:  r.type,
          label: r.label,
          desc:  r.description,
          maxKg: r.max_kg != null ? Number(r.max_kg) : Infinity,
        }))
      : VEHICLE_CAPACITIES;

    const results = await Promise.all(
      vehicleList.map(async (v) => {
        const suitable = w <= v.maxKg;
        const offlineEst = (() => {
          const chargeable = Math.max(w, volW);
          const ar = apiRates?.find(r => r.type === v.type);
          if (ar) return Math.max(Number(ar.min_price), Math.round(chargeable * Number(ar.rate_per_kg)));
          return offlineEstimateForVehicle(w, v.type, volW);
        })();
        try {
          const params = new URLSearchParams({ transport_mode: "TRUCKING", truck_type: v.type, origin });
          if (truckData.destCity) params.set("dest", truckData.destCity);
          const res = await fetch(`/api/logistic/orders/estimate-price?${params}`);
          const d: { estimated_price: number | null } = await res.json();
          const estimate = (d.estimated_price && d.estimated_price > 0) ? d.estimated_price : offlineEst;
          return { type: v.type, label: v.label, desc: v.desc, estimate, suitable };
        } catch {
          return { type: v.type, label: v.label, desc: v.desc, estimate: offlineEst, suitable };
        }
      })
    );

    setVehicleComparison(results);
    const suggested = w > 0 ? suggestVehicleType(w) : null;
    const targetType = truckData.vehicleType || suggested || "";
    const found = results.find(r => r.type === targetType && r.suitable)
      ?? results.find(r => r.suitable);
    if (found) {
      setTruckData(p => ({ ...p, vehicleType: found.type }));
      setTruckEstimate(found.estimate);
    }
    setTruckEstimating(false);
  }

  function fallbackEstimate() {
    const w  = parseFloat(truckData.weight) || 0;
    const l  = parseFloat(truckData.length) || 0;
    const wi = parseFloat(truckData.width)  || 0;
    const h  = parseFloat(truckData.height) || 0;
    const volW = (l && wi && h) ? (l * wi * h) / 4000 : 0;
    setTruckEstimate(Math.max(150_000, Math.round(Math.max(w, volW) * 2_500)));
  }

  function offlineEstimateForVehicle(weightKg: number, vehicleType: string, volW: number): number {
    const chargeable = Math.max(weightKg, volW);
    const rates: Record<string, { rate: number; min: number }> = {
      CDE:     { rate: 3_500, min: 200_000   },
      CDD:     { rate: 2_800, min: 350_000   },
      Fuso:    { rate: 2_200, min: 800_000   },
      Wingbox: { rate: 1_800, min: 2_500_000 },
      Trailer: { rate: 1_500, min: 5_000_000 },
    };
    const r = rates[vehicleType] ?? rates["CDD"];
    return Math.max(r.min, Math.round(chargeable * r.rate));
  }

  const grouped      = groupItems(items);
  const hasNegotiable = grandTotal === 0 && items.length > 0;

  // ── Header title / back button ──────────────────────────────────────────────
  const headerTitle = view === "service-catalog" ? t("cartDrawer.pickService", "Pilih Layanan")
    : view === "trucking" ? t("cartDrawer.truckingTitle", "Layanan Trucking")
    : view === "freight"  ? FREIGHT_SVC_META[freightSvc].name
    : t("cartDrawer.title", "Keranjang Pesanan");
  const headerSub = view === "service-catalog" ? t("cartDrawer.pickServiceSub", "Pilih layanan logistik Anda")
    : view === "trucking" ? t("cartDrawer.truckingSub", "Isi detail atau hitung estimasi")
    : view === "freight"  ? t("cartDrawer.freightSub", "Isi detail & hitung estimasi biaya")
    : items.length === 0 ? t("cartDrawer.noItems", "Belum ada item") : `${items.length} item · 1 pesanan`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[440px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            {view !== "cart" && (
              <button
                onClick={() => (view === "trucking" || view === "freight") ? setView("service-catalog") : setView("cart")}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${view === "trucking" ? "bg-orange-100" : "bg-sky-100"}`}>
              {view === "trucking" ? <Truck className="w-5 h-5 text-orange-600" /> : <ShoppingCart className="w-5 h-5 text-sky-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{headerTitle}</h2>
              <p className="text-xs text-slate-400">{headerSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {view === "cart" && items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-3 h-3" /> {t("cartDrawer.hapusSemua", "Hapus Semua")}
              </button>
            )}
            <button onClick={close} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60">

          {/* ── View: Cart ── */}
          {view === "cart" && (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mt-2">{t("cartDrawer.empty", "Keranjang kosong")}</p>
                <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
                  {t("cartDrawer.emptyDesc", "Tambahkan produk atau pilih layanan logistik — trucking, air freight, atau sea freight.")}
                </p>
                <Button onClick={openServiceCatalog} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> {t("cartDrawer.pilihLayanan", "Pilih Layanan")}
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-5">
                {grouped.map(([type, typeItems]) => {
                  const meta = getTypeMeta(type);
                  const Icon = meta.icon;
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {meta.label} ({typeItems.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {typeItems.map(item => <CartItemCard key={item.cartId} item={item} onRemove={removeItem} />)}
                      </div>
                    </div>
                  );
                })}
                {/* ── Metode Pengiriman (product-only cart) ── */}
                {hasProductOnly ? (
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2.5 px-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {t("cartDrawer.metodePengiriman", "Metode Pengiriman")}
                      </span>
                      <span className="text-[10px] text-slate-500 italic">({t("cartDrawer.opsional", "opsional")})</span>
                    </div>
                    <div className="space-y-2">
                      {([
                        { id: "pickup" as const, name: t("cartDrawer.ambilSendiri", "Ambil Sendiri"),    Icon: Warehouse, desc: t("cartDrawer.ambilSendiriDesc", "Ambil langsung di gudang kami"), activeColor: "border-green-400 bg-green-50",  iconColor: "text-green-600",  iconBg: "bg-green-100",  estimate: null },
                        { id: "darat"  as const, name: t("cartDrawer.pengirimanDarat", "Pengiriman Darat"), Icon: Truck,     desc: t("cartDrawer.pengirimanDaratDesc", "Trucking kota ke kota"),         activeColor: "border-orange-400 bg-orange-50", iconColor: "text-orange-600", iconBg: "bg-orange-100", estimate: daratEstimate },
                        { id: "laut"   as const, name: t("cartDrawer.pengirimanLaut", "Pengiriman Laut"),  Icon: Ship,      desc: t("cartDrawer.pengirimanLautDesc", "Sea freight LCL / FCL"),         activeColor: "border-blue-400 bg-blue-50",    iconColor: "text-blue-600",   iconBg: "bg-blue-100",   estimate: null },
                        { id: "udara"  as const, name: t("cartDrawer.pengirimanUdara", "Pengiriman Udara"), Icon: Plane,     desc: t("cartDrawer.pengirimanUdaraDesc", "Air freight ekspres"),           activeColor: "border-sky-400 bg-sky-50",      iconColor: "text-sky-600",    iconBg: "bg-sky-100",    estimate: null },
                      ]).map(m => (
                        <button key={m.id}
                          onClick={() => setSelectedShipping(selectedShipping === m.id ? null : m.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedShipping === m.id ? m.activeColor + " shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectedShipping === m.id ? m.iconBg : "bg-slate-100"}`}>
                            <m.Icon className={`w-5 h-5 ${selectedShipping === m.id ? m.iconColor : "text-slate-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${selectedShipping === m.id ? "text-slate-900" : "text-slate-700"}`}>{m.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-1">
                            {m.id !== "pickup" && (m.estimate ? (
                              <p className="text-xs font-bold text-slate-800">{formatCurrency(m.estimate)}</p>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic">{t("cartDrawer.sesuaiRute", "Sesuai rute")}</p>
                            ))}
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedShipping === m.id ? "border-primary bg-primary" : "border-slate-300 bg-white"}`}>
                              {selectedShipping === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedShipping === "pickup" && (
                      <div className="mt-2 rounded-lg border border-green-200 bg-green-50/80 px-3 py-2.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">{t("cartDrawer.pickupLocation", "Lokasi Pengambilan")}</p>
                        <p className="text-[11px] font-semibold text-green-800 leading-snug">🏭 {companyPickup?.name ?? COMPANY_CONFIG.brandName}</p>
                        <p className="text-[11px] text-green-700 mt-0.5 leading-snug">{companyPickup?.address ?? DEFAULT_PICKUP}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={openServiceCatalog}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/60 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> {t("cartDrawer.tambahLayananProduk", "Tambah Layanan / Produk")}
                  </button>
                )}
              </div>
            )
          )}

          {/* ── View: Service Catalog ── */}
          {view === "service-catalog" && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => { close(); setLocation("/order-produk"); }}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3.5 text-sm text-slate-400 hover:border-primary/40 hover:text-slate-600 transition-colors text-center"
              >
                + {t("cartDrawer.tambahProdukDariKatalog", "Tambah Produk dari Katalog")}
              </button>

              <Separator />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">{t("cartDrawer.logisticServices", "Layanan Logistik")}</p>

              <div className="grid grid-cols-2 gap-2.5">
                {DRAWER_SERVICES.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => {
                      if (svc.isTrucking) {
                        const af = computeCartAutoFill();
                        setTruckEstimate(null);
                        if (af.hasData) {
                          setTruckData({
                            weight:      af.weight      || "",
                            vehicleType: af.vehicleType || "",
                            length:      af.length      || "",
                            width:       af.width       || "",
                            height:      af.height      || "",
                            goodsType:   af.goodsType   || "",
                          });
                          setTruckMode("calculator");
                          setCartAutoFilled(true);
                        } else {
                          setTruckData({});
                          setTruckMode("calculator");
                          setCartAutoFilled(false);
                        }
                        setView("trucking");
                      } else {
                        handleNonTruckingService(svc.id);
                      }
                    }}
                    className={`border-2 rounded-xl p-3.5 text-left transition-all hover:shadow-md ${svc.color}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{svc.icon}</div>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{svc.name}</p>
                        <p className="text-[11px] opacity-70 mt-0.5 leading-snug">{svc.desc}</p>
                        <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          svc.isTrucking
                            ? "bg-orange-100 text-orange-700"
                            : svc.id === "sea"       ? "bg-blue-100 text-blue-700"
                            : svc.id === "air"       ? "bg-sky-100 text-sky-700"
                            : svc.id === "storage"   ? "bg-emerald-100 text-emerald-700"
                            : svc.id === "customs"   ? "bg-slate-100 text-slate-600"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {t("cartDrawer.kalkulatorTersedia", "Kalkulator tersedia")}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── View: Trucking Form ── */}
          {view === "trucking" && (
            <div className="p-4 space-y-3">
              {/* Mode Tabs */}
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
                {(["detail", "calculator"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setTruckEstimate(null);
                      if (mode === "calculator") {
                        const af = computeCartAutoFill();
                        if (af.hasData) {
                          setTruckData(prev => {
                            const merged: Record<string, string> = {
                              ...prev,
                              weight:      af.weight      || prev.weight      || "",
                              vehicleType: prev.vehicleType || "",
                              length:      af.length      || prev.length      || "",
                              width:       af.width       || prev.width       || "",
                              height:      af.height      || prev.height      || "",
                              goodsType:   af.goodsType   || prev.goodsType   || "",
                            };
                            const effectiveWeight = parseFloat(merged.weight) || 0;
                            if (!merged.vehicleType && effectiveWeight > 0) {
                              merged.vehicleType = suggestVehicleType(effectiveWeight);
                            }
                            return merged;
                          });
                          setCartAutoFilled(true);
                        } else {
                          setCartAutoFilled(false);
                        }
                      } else {
                        setCartAutoFilled(false);
                      }
                      setTruckMode(mode);
                    }}
                    className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${truckMode === mode ? "bg-white shadow text-slate-800" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {mode === "detail" ? <><MapPin className="w-3 h-3" /> {t("cartDrawer.pickupDelivery", "Pickup & Delivery")}</> : <><Calculator className="w-3 h-3" /> {t("cartDrawer.estimateCalc", "Kalkulator Estimasi")}</>}
                  </button>
                ))}
              </div>

              {/* Detail Form */}
              {truckMode === "detail" && (
                <div className="space-y-3">
                  {/* Alamat Pickup — otomatis dari gudang */}
                  <div>
                    <Label className="text-[11px] mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      {t("cartDrawer.alamatPickupLabel", "Alamat Pickup")}
                      <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>
                    </Label>
                    <div className="rounded-lg border border-orange-200 bg-orange-50/70 px-3 py-2.5">
                      <p className="text-[11px] font-semibold text-orange-700 leading-snug">
                        🏭 {companyPickup?.name ?? COMPANY_CONFIG.brandName}
                      </p>
                      <p className="text-[11px] text-orange-600 mt-0.5 leading-snug">
                        {companyPickup?.address ?? DEFAULT_PICKUP}
                      </p>
                      <p className="text-[10px] text-orange-400 mt-1">
                        {t("cartDrawer.teamDecides", "Tim kami yang akan menentukan lokasi pengambilan barang")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] mb-1 block">
                      {t("cartDrawer.deliveryAddress", "Alamat Pengiriman")} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea rows={2} placeholder={t("cartDrawer.deliveryAddressPh", "Jl. ..., Kota, Provinsi — alamat tujuan pengiriman")}
                      className={`text-xs resize-none${deliveryAddressError ? " border-destructive focus-visible:ring-destructive" : ""}`}
                      value={truckData.deliveryAddress||""}
                      onChange={e => { setDeliveryAddressError(false); setTruckData(p => ({ ...p, deliveryAddress: e.target.value })); }} />
                    {deliveryAddressError && <p className="text-[11px] text-destructive mt-1">{t("cartDrawer.deliveryAddressError", "Alamat pengiriman wajib diisi.")}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.contactName", "Nama Kontak")}</Label>
                      <Input className="h-8 text-xs" placeholder={t("cartDrawer.namePicPh", "Nama PIC")} value={truckData.contactName||""} onChange={e => setTruckData(p => ({ ...p, contactName: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.contactPhone", "No. Telepon")}</Label>
                      <Input type="tel" className="h-8 text-xs" placeholder="08xxxxxxxxxx" value={truckData.contactPhone||""} onChange={e => setTruckData(p => ({ ...p, contactPhone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.notesOpt", "Catatan (opsional)")}</Label>
                    <Textarea rows={2} placeholder={t("cartDrawer.notesPh", "Instruksi khusus untuk tim pengiriman...")} className="text-xs resize-none" value={truckData.notes||""} onChange={e => setTruckData(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-[11px] text-orange-700">
                    {t("cartDrawer.estimateNote", "💡 Estimasi biaya dikonfirmasi tim setelah pesanan masuk.")}
                  </div>
                </div>
              )}

              {/* Calculator Form */}
              {truckMode === "calculator" && (
                <div className="space-y-3">
                  {cartAutoFilled && (
                    <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 flex items-start gap-2">
                      <span className="text-sky-500 mt-0.5 shrink-0">✦</span>
                      <div>
                        <p className="text-[11px] font-semibold text-sky-700">{t("cartDrawer.autoFilled", "Diisi otomatis dari produk pesanan")}</p>
                        <p className="text-[10px] text-sky-500 mt-0.5">{t("cartDrawer.autoFilledNote", "Berat & dimensi dihitung dari item di keranjang. Masukkan kota tujuan lalu klik Hitung Estimasi.")}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" /> {t("cartDrawer.originCity", "Kota Asal")}
                        <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>
                      </Label>
                      <div className="h-8 rounded-md border border-orange-200 bg-orange-50 px-3 flex items-center">
                        <span className="text-xs font-medium text-orange-700">{companyPickup?.originCity ?? COMPANY_CONFIG.originCity}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" /> {t("cartDrawer.destCity", "Kota Tujuan")} <span className="text-destructive">*</span></Label>
                      <Input
                        className={`h-8 text-xs ${!truckData.destCity && vehicleComparison !== null ? "border-destructive" : ""}`}
                        placeholder="Surabaya, Medan, Makassar..."
                        value={truckData.destCity||""}
                        onChange={e => {
                          const dc = e.target.value;
                          setTruckData(p => ({ ...p, destCity: dc }));
                          setVehicleComparison(null);
                          try { localStorage.setItem("truck_pref", JSON.stringify({ destCity: dc, vehicleType: truckData.vehicleType ?? "" })); } catch { /**/ }
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1">
                        {t("cartDrawer.beratKgLabel", "Berat (kg)")} *
                        {cartAutoFilled && truckData.weight && <span className="ml-auto text-[10px] font-semibold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>}
                      </Label>
                      {cartAutoFilled && truckData.weight ? (
                        <div className="h-8 flex items-center px-2.5 bg-sky-50 border border-sky-200 rounded-md">
                          <span className="text-xs font-semibold text-slate-800">{truckData.weight} kg</span>
                        </div>
                      ) : (
                        <Input
                          type="number" min={0} className="h-8 text-xs" placeholder="100"
                          value={truckData.weight||""}
                          onChange={e => {
                            const w = e.target.value;
                            setVehicleComparison(null);
                            setTruckData(p => {
                              const kg = parseFloat(w) || 0;
                              const updates: Record<string, string> = { ...p, weight: w };
                              if (kg > 0 && !p.vehicleType) {
                                updates.vehicleType = suggestVehicleType(kg);
                              }
                              return updates;
                            });
                          }}
                        />
                      )}
                    </div>
                    <div>
                      {(() => {
                        const kg = parseFloat(truckData.weight || "0") || 0;
                        const suggested = kg > 0 ? suggestVehicleType(kg) : null;
                        return (
                          <>
                            <Label className="text-[11px] mb-1 flex items-center gap-1">
                              {t("cartDrawer.jenisKendaraan", "Jenis Kendaraan")}
                              {suggested && (
                                <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                                  {t("cartDrawer.saran", "Saran")}: {suggested}
                                </span>
                              )}
                            </Label>
                            <Select value={truckData.vehicleType||undefined} onValueChange={v => setTruckData(p => ({ ...p, vehicleType: v }))}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilihKendaraan", "Pilih kendaraan")} /></SelectTrigger>
                              <SelectContent>
                                {VEHICLE_CAPACITIES.map(v => (
                                  <SelectItem key={v.type} value={v.type} className="text-xs">
                                    <span className="flex items-center gap-1.5">
                                      {v.type === suggested && <span className="text-orange-500 font-bold">★</span>}
                                      <span>{v.label}</span>
                                      <span className="text-slate-400 text-[10px]">{v.desc}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 flex items-center gap-1">
                      {t("cartDrawer.dimensiCm", "Dimensi (cm) — P × L × T")}
                      {cartAutoFilled && (truckData.length || truckData.width || truckData.height) && (
                        <span className="ml-auto text-[10px] font-semibold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>
                      )}
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {cartAutoFilled && (truckData.length || truckData.width || truckData.height) ? (
                        <>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{truckData.length || "—"}</span>
                            <span className="text-[9px] text-sky-400">P</span>
                          </div>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{truckData.width || "—"}</span>
                            <span className="text-[9px] text-sky-400">L</span>
                          </div>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{truckData.height || "—"}</span>
                            <span className="text-[9px] text-sky-400">T</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.panjang", "Panjang")} value={truckData.length||""} onChange={e => setTruckData(p => ({ ...p, length: e.target.value }))} />
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.lebar", "Lebar")}   value={truckData.width||""}  onChange={e => setTruckData(p => ({ ...p, width:  e.target.value }))} />
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.tinggi", "Tinggi")}  value={truckData.height||""} onChange={e => setTruckData(p => ({ ...p, height: e.target.value }))} />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisBarang", "Jenis Barang")}</Label>
                      <Select value={truckData.goodsType||undefined} onValueChange={v => setTruckData(p => ({ ...p, goodsType: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilih", "Pilih")} /></SelectTrigger>
                        <SelectContent>{GOODS_TYPES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">Incoterms</Label>
                      <Select value={truckData.incoterms||"FOB"} onValueChange={v => setTruckData(p => ({ ...p, incoterms: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{INCOTERMS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="outline" size="sm"
                    className="w-full border-orange-400 text-orange-600 hover:bg-orange-50 gap-2"
                    disabled={!truckData.destCity || !truckData.weight || truckEstimating}
                    onClick={handleCompareVehicles}
                  >
                    {truckEstimating
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("cartDrawer.menghitung", "Menghitung...")}</>
                      : <><Calculator className="w-3.5 h-3.5" /> {t("cartDrawer.bandingkanKendaraan", "Bandingkan Semua Kendaraan")}</>}
                  </Button>

                  {vehicleComparison && (
                    <div className="rounded-xl border overflow-hidden">
                      <div className="bg-slate-50 px-3 py-2 border-b flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                          <Calculator className="w-3 h-3" /> {t("cartDrawer.perbandinganKendaraan", "Perbandingan Kendaraan")}
                        </p>
                        <p className="text-[10px] text-slate-400">*{t("cartDrawer.estimasiIndikatif", "Estimasi indikatif")}</p>
                      </div>
                      <div className="divide-y">
                        {vehicleComparison.map(v => {
                          const isSelected = truckData.vehicleType === v.type;
                          const suggested = parseFloat(truckData.weight||"0") > 0
                            ? suggestVehicleType(parseFloat(truckData.weight))
                            : null;
                          const isSuggested = suggested === v.type;
                          return (
                            <button
                              key={v.type}
                              type="button"
                              disabled={!v.suitable}
                              className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors ${isSelected ? "bg-orange-50" : "hover:bg-slate-50"} ${!v.suitable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                              onClick={() => {
                                if (!v.suitable) return;
                                setTruckData(p => ({ ...p, vehicleType: v.type }));
                                setTruckEstimate(v.estimate);
                                try { localStorage.setItem("truck_pref", JSON.stringify({ destCity: truckData.destCity ?? "", vehicleType: v.type })); } catch { /**/ }
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isSuggested && <span className="text-orange-500 text-[10px] font-bold">★</span>}
                                  <span className={`text-xs font-semibold ${isSelected ? "text-orange-700" : "text-slate-700"}`}>{v.type}</span>
                                  <span className="text-[10px] text-slate-400">{v.desc}</span>
                                  {isSuggested && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">{t("cartDrawer.disarankan", "Disarankan")}</span>}
                                  {!v.suitable && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">{t("cartDrawer.melehiKapasitas", "Melebihi kapasitas")}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-bold ${isSelected ? "text-orange-600" : "text-slate-700"}`}>{formatCurrency(v.estimate)}</span>
                                {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 border-t">
                        <p className="text-[10px] text-slate-400">{t("cartDrawer.klikKendaraanUntukMemilih", "Klik kendaraan untuk memilih. Biaya final dikonfirmasi tim logistik.")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── View: Freight Form (Sea / Air / Storage / Customs / Additional) ── */}
          {view === "freight" && (
            <div className="p-4 space-y-3">
              {freightAutoFilled && (
                <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5 shrink-0">✦</span>
                  <div>
                    <p className="text-[11px] font-semibold text-sky-700">{t("cartDrawer.autoFilled", "Diisi otomatis dari produk pesanan")}</p>
                    <p className="text-[10px] text-sky-500 mt-0.5">{t("cartDrawer.freightAutoFilledNote", "Berat & dimensi dihitung dari item di keranjang. Lengkapi detail lainnya lalu klik Hitung Estimasi.")}</p>
                  </div>
                </div>
              )}

              {/* Warning: company fetch failed */}
              {companyFetchFailed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0 text-xs">⚠</span>
                  <p className="text-[10px] text-amber-700 leading-snug">
                    {t("cartDrawer.companyFetchFailed", "Data perusahaan tidak dapat dimuat. Asal menggunakan nilai default. Anda dapat mengedit manual jika diperlukan.")}
                  </p>
                </div>
              )}

              {/* SEA FREIGHT */}
              {freightSvc === "sea" && (
                <div className="space-y-3">
                  {/* Negara Asal — selalu otomatis dari data perusahaan */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" /> {t("cartDrawer.negaraAsal", "Negara Asal")}
                        <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>
                      </Label>
                      <div className="h-8 rounded-md border border-orange-200 bg-orange-50 px-3 flex items-center gap-1.5">
                        <span className="text-xs font-medium text-orange-700">🇮🇩 Indonesia</span>
                        {companyPickup?.originCity && <span className="text-[10px] text-orange-400 ml-auto">{companyPickup.originCity}</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {t("cartDrawer.negaraTujuan", "Negara Tujuan")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className={`h-8 text-xs ${freightDestError && !freightData.destCountry ? "border-destructive focus-visible:ring-destructive" : "border-primary/40 focus:border-primary"}`}
                        placeholder="Singapore, Malaysia, China..."
                        value={freightData.destCountry||""}
                        onChange={e => { setFreightData(p => ({...p, destCountry: e.target.value})); if (e.target.value) setFreightDestError(false); }}
                        autoFocus
                      />
                      {freightDestError && !freightData.destCountry && (
                        <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {t("cartDrawer.negaraTujuanWajib", "Negara tujuan wajib diisi.")}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Berat — read-only jika dari keranjang */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1">
                        {t("cartDrawer.beratKgLabel", "Berat (kg)")}
                        {freightAutoFilled && freightData.weight && <span className="ml-auto text-[10px] font-semibold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>}
                      </Label>
                      {freightAutoFilled && freightData.weight ? (
                        <div className="h-8 flex items-center px-2.5 bg-sky-50 border border-sky-200 rounded-md">
                          <span className="text-xs font-semibold text-slate-800">{freightData.weight} kg</span>
                        </div>
                      ) : (
                        <Input type="number" min={0} className="h-8 text-xs" placeholder="100" value={freightData.weight||""} onChange={e => setFreightData(p => ({...p, weight: e.target.value}))} />
                      )}
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisPengiriman", "Jenis Pengiriman")}</Label>
                      <Select value={freightData.shipType||"LCL"} onValueChange={v => setFreightData(p => ({...p, shipType: v}))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LCL" className="text-xs">LCL — Less Container</SelectItem>
                          <SelectItem value="FCL 20'" className="text-xs">FCL 20' Container</SelectItem>
                          <SelectItem value="FCL 40'" className="text-xs">FCL 40' Container</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Dimensi — read-only jika dari keranjang */}
                  <div>
                    <Label className="text-[11px] mb-1 flex items-center gap-1">
                      {t("cartDrawer.dimensiCm", "Dimensi (cm) — P × L × T")}
                      {freightAutoFilled && (freightData.length || freightData.width || freightData.height) && (
                        <span className="ml-auto text-[10px] font-semibold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>
                      )}
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {freightAutoFilled && (freightData.length || freightData.width || freightData.height) ? (
                        <>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{freightData.length || "—"}</span>
                            <span className="text-[9px] text-sky-400">P</span>
                          </div>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{freightData.width || "—"}</span>
                            <span className="text-[9px] text-sky-400">L</span>
                          </div>
                          <div className="h-8 rounded-md border border-sky-200 bg-sky-50 px-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-sky-700">{freightData.height || "—"}</span>
                            <span className="text-[9px] text-sky-400">T</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.panjang", "Panjang")} value={freightData.length||""} onChange={e => setFreightData(p => ({...p, length: e.target.value}))} />
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.lebar", "Lebar")}   value={freightData.width||""}  onChange={e => setFreightData(p => ({...p, width: e.target.value}))} />
                          <Input type="number" min={0} className="h-8 text-xs" placeholder={t("cartDrawer.tinggi", "Tinggi")}  value={freightData.height||""} onChange={e => setFreightData(p => ({...p, height: e.target.value}))} />
                        </>
                      )}
                    </div>
                  </div>
                  {/* Jenis Barang — read-only jika dari keranjang */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 flex items-center gap-1">
                        {t("cartDrawer.jenisBarang", "Jenis Barang")}
                        {freightAutoFilled && freightData.goodsType && <span className="ml-auto text-[10px] font-semibold bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full">{t("cartDrawer.otomatis", "Otomatis")}</span>}
                      </Label>
                      {freightAutoFilled && freightData.goodsType ? (
                        <div className="h-8 flex items-center px-2.5 bg-sky-50 border border-sky-200 rounded-md">
                          <span className="text-xs font-semibold text-slate-800">{freightData.goodsType}</span>
                        </div>
                      ) : (
                        <Select value={freightData.goodsType||undefined} onValueChange={v => setFreightData(p => ({...p, goodsType: v}))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilih", "Pilih")} /></SelectTrigger>
                          <SelectContent>{GOODS_TYPES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">Incoterms</Label>
                      <Select value={freightData.incoterms||"FOB"} onValueChange={v => setFreightData(p => ({...p, incoterms: v}))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{INCOTERMS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* AIR FREIGHT */}
              {freightSvc === "air" && (
                <div className="space-y-3">
                  {/* Spesifikasi otomatis dari produk */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 space-y-1.5">
                    <p className="text-[11px] font-semibold text-emerald-700">✈️ {t("cartDrawer.airAutoData", "Data dikirim otomatis dari produk pesanan")}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("cartDrawer.bandaraAsal", "Bandara Asal")}</span>
                        <span className="font-semibold text-slate-800">{freightData.originAirport || (companyPickup as any)?.originAirport || "CGK"} — {COMPANY_CONFIG.originCity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("cartDrawer.negaraAsal", "Negara Asal")}</span>
                        <span className="font-semibold text-slate-800">Indonesia 🇮🇩</span>
                      </div>
                      {freightData.weight && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t("cartDrawer.totalBerat", "Total Berat")}</span>
                          <span className="font-semibold text-slate-800">{freightData.weight} kg</span>
                        </div>
                      )}
                      {freightData.goodsType && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t("cartDrawer.jenisBarang", "Jenis Barang")}</span>
                          <span className="font-semibold text-slate-800">{freightData.goodsType}</span>
                        </div>
                      )}
                      {(freightData.length || freightData.width || freightData.height) && (
                        <div className="flex justify-between col-span-2">
                          <span className="text-slate-500">{t("cartDrawer.dimensiPLT", "Dimensi (P×L×T)")}</span>
                          <span className="font-semibold text-slate-800">{freightData.length||"—"} × {freightData.width||"—"} × {freightData.height||"—"} cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Wajib diisi customer: Bandara Tujuan */}
                  <div>
                    <Label className="text-[11px] mb-1 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      {t("cartDrawer.bandaraTujuan", "Bandara Tujuan")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className={`h-8 text-xs ${freightDestError && !freightData.destAirport ? "border-destructive focus-visible:ring-destructive" : "border-primary/40 focus:border-primary"}`}
                      placeholder="Contoh: SIN — Singapore, KUL — Malaysia..."
                      value={freightData.destAirport||""}
                      onChange={e => { setFreightData(p => ({...p, destAirport: e.target.value})); if (e.target.value) setFreightDestError(false); }}
                      autoFocus
                    />
                    {freightDestError && !freightData.destAirport && (
                      <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {t("cartDrawer.bandaraTujuanWajib", "Bandara tujuan wajib diisi.")}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">Incoterms</Label>
                    <Select value={freightData.incoterms||"FOB"} onValueChange={v => setFreightData(p => ({...p, incoterms: v}))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{INCOTERMS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {/* Jenis Barang hanya tampil jika tidak ada dari produk */}
                  {!freightData.goodsType && (
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisBarang", "Jenis Barang")}</Label>
                      <Select value={freightData.goodsType||undefined} onValueChange={v => setFreightData(p => ({...p, goodsType: v}))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilihOpsional", "Pilih (opsional)")} /></SelectTrigger>
                        <SelectContent>{GOODS_TYPES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* STORAGE / PERGUDANGAN */}
              {freightSvc === "storage" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.volumeCbm", "Volume (CBM)")} *</Label>
                      <Input type="number" min={0} className="h-8 text-xs" placeholder="10" value={freightData.volume||""} onChange={e => setFreightData(p => ({...p, volume: e.target.value}))} />
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.durasiBulan", "Durasi (bulan)")} *</Label>
                      <Input type="number" min={1} className="h-8 text-xs" placeholder="1" value={freightData.duration||""} onChange={e => setFreightData(p => ({...p, duration: e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisBarang", "Jenis Barang")}</Label>
                    <Select value={freightData.goodsType||undefined} onValueChange={v => setFreightData(p => ({...p, goodsType: v}))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilih", "Pilih")} /></SelectTrigger>
                      <SelectContent>{GOODS_TYPES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.catatanOpsional", "Catatan (opsional)")}</Label>
                    <Textarea rows={2} placeholder={t("cartDrawer.storageNotesPh", "Kebutuhan khusus penyimpanan...")} className="text-xs resize-none" value={freightData.notes||""} onChange={e => setFreightData(p => ({...p, notes: e.target.value}))} />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-700">
                    {t("cartDrawer.storageNote", "💡 Tarif per CBM/bulan. Biaya final dikonfirmasi tim setelah survei lokasi.")}
                  </div>
                </div>
              )}

              {/* CUSTOMS / KEPABEANAN */}
              {freightSvc === "customs" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisKepabeanan", "Jenis Kepabeanan")} *</Label>
                      <Select value={freightData.customsType||"Import"} onValueChange={v => setFreightData(p => ({...p, customsType: v}))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Import" className="text-xs">{t("cartDrawer.impor", "Impor")}</SelectItem>
                          <SelectItem value="Export" className="text-xs">{t("cartDrawer.ekspor", "Ekspor")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisBarang", "Jenis Barang")}</Label>
                      <Select value={freightData.goodsType||undefined} onValueChange={v => setFreightData(p => ({...p, goodsType: v}))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilih", "Pilih")} /></SelectTrigger>
                        <SelectContent>{GOODS_TYPES.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.nilaiBarangIdr", "Nilai Barang (IDR)")}</Label>
                    <Input type="number" min={0} className="h-8 text-xs" placeholder="50000000" value={freightData.cargoValue||""} onChange={e => setFreightData(p => ({...p, cargoValue: e.target.value}))} />
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.keteranganOpsional", "Keterangan (opsional)")}</Label>
                    <Textarea rows={2} placeholder={t("cartDrawer.customsNotesPh", "Detail dokumen, HS code, pelabuhan, dll...")} className="text-xs resize-none" value={freightData.notes||""} onChange={e => setFreightData(p => ({...p, notes: e.target.value}))} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600">
                    {t("cartDrawer.customsNote", "💡 Estimasi ~2,5% nilai barang. Biaya resmi sesuai regulasi Bea Cukai.")}
                  </div>
                </div>
              )}

              {/* ASURANSI & LAINNYA */}
              {freightSvc === "additional" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.jenisLayanan", "Jenis Layanan")} *</Label>
                    <Select value={freightData.addlType||undefined} onValueChange={v => setFreightData(p => ({...p, addlType: v}))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("cartDrawer.pilihLayananPh", "Pilih layanan")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asuransi Kargo" className="text-xs">{t("cartDrawer.asuransiKargo", "Asuransi Kargo")}</SelectItem>
                        <SelectItem value="Survei & Inspeksi" className="text-xs">{t("cartDrawer.surveiInspeksi", "Survei & Inspeksi")}</SelectItem>
                        <SelectItem value="Pengurusan Permit" className="text-xs">{t("cartDrawer.pengurusanPermit", "Pengurusan Permit")}</SelectItem>
                        <SelectItem value="Packing & Crating" className="text-xs">{t("cartDrawer.packingCrating", "Packing & Crating")}</SelectItem>
                        <SelectItem value="Lainnya" className="text-xs">{t("cartDrawer.lainnya", "Lainnya")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.nilaiBarangIdrOpsional", "Nilai Barang (IDR, opsional)")}</Label>
                    <Input type="number" min={0} className="h-8 text-xs" placeholder="50000000" value={freightData.cargoValue||""} onChange={e => setFreightData(p => ({...p, cargoValue: e.target.value}))} />
                  </div>
                  <div>
                    <Label className="text-[11px] mb-1 block">{t("cartDrawer.keterangan", "Keterangan")}</Label>
                    <Textarea rows={3} placeholder={t("cartDrawer.additionalNotesPh", "Deskripsikan kebutuhan Anda...")} className="text-xs resize-none" value={freightData.notes||""} onChange={e => setFreightData(p => ({...p, notes: e.target.value}))} />
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-[11px] text-purple-700">
                    {t("cartDrawer.additionalNote", "💡 Harga dikonfirmasi tim setelah pesanan diterima.")}
                  </div>
                </div>
              )}

              {/* Tombol hitung estimasi (tidak untuk additional) */}
              {freightSvc !== "additional" && (
                <Button
                  variant="outline" size="sm"
                  className={`w-full gap-2 ${
                    freightSvc === "sea"     ? "border-blue-400 text-blue-600 hover:bg-blue-50" :
                    freightSvc === "air"     ? "border-sky-400 text-sky-600 hover:bg-sky-50" :
                    freightSvc === "storage" ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50" :
                                               "border-slate-400 text-slate-600 hover:bg-slate-50"
                  }`}
                  disabled={freightEstimating || (freightSvc === "storage" ? !freightData.volume : false)}
                  onClick={computeFreightEstimate}
                >
                  {freightEstimating
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("cartDrawer.menghitung", "Menghitung...")}</>
                    : <><Calculator className="w-3.5 h-3.5" /> {t("cartDrawer.hitungEstimasi", "Hitung Estimasi Biaya")}</>}
                </Button>
              )}

              {/* Hasil estimasi */}
              {freightEstimate !== null && freightEstimate > 0 && (
                <div className="rounded-xl border overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 border-b flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                      <Calculator className="w-3 h-3" /> {t("cartDrawer.estimasiBiaya", "Estimasi Biaya")}
                    </p>
                    <p className="text-[10px] text-slate-400">*{t("cartDrawer.estimasiIndikatif", "Estimasi indikatif")}</p>
                  </div>
                  <div className="px-3 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{t("cartDrawer.estimasiTotal", "Estimasi total")}</p>
                      <p className="text-lg font-bold text-sky-700">{formatCurrency(freightEstimate)}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 text-right leading-relaxed">
                      *{t("cartDrawer.indikatif", "Indikatif")}<br/>{t("cartDrawer.hargaFinal", "Harga final")}<br/>{t("cartDrawer.dikonfirmasiTim", "dikonfirmasi tim")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}

        {/* Cart footer */}
        {view === "cart" && items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 space-y-3 bg-white shrink-0">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t("cartDrawer.subtotal", "Subtotal")}</span>
                <span className="font-medium text-slate-700">
                  {subtotal > 0 ? formatCurrency(subtotal) : <span className="text-slate-400 text-xs italic">{t("cartDrawer.ditentukanVendor", "Ditentukan vendor")}</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PPN {taxRate === 0.011 ? "1,1%" : "11%"}</span>
                <span className="font-medium text-slate-700">
                  {tax > 0 ? formatCurrency(tax) : <span className="text-slate-400 text-xs">—</span>}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-0.5">
                <span className="font-bold text-slate-800">{t("cartDrawer.totalEstimasi", "Total Estimasi")}</span>
                <span className="text-lg font-bold text-sky-700">{grandTotal > 0 ? formatCurrency(grandTotal) : "—"}</span>
              </div>
              {hasNegotiable && (
                <p className="text-[11px] text-slate-400 leading-snug">{t("cartDrawer.hargaAkhirDikonfirmasi", "Harga akhir dikonfirmasi vendor setelah pesanan diterima.")}</p>
              )}
            </div>
            {/* Shipping estimate row for product-only carts */}
            {hasProductOnly && selectedShipping && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("cartDrawer.estimasiOngkosKirim", "Estimasi Ongkos Kirim")}</span>
                <span className="font-medium text-slate-700">
                  {selectedShipping === "darat" && daratEstimate
                    ? formatCurrency(daratEstimate)
                    : <span className="text-slate-400 text-xs italic">{t("cartDrawer.sesuaiRute", "Sesuai rute")}</span>}
                </span>
              </div>
            )}
            {hasProductOnly && !selectedShipping && (
              <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                {t("cartDrawer.metodePengirimanBelumDipilih", "Metode pengiriman belum dipilih — bisa dikonfirmasi nanti")}
              </p>
            )}
            <Button className="w-full gap-2 h-11 text-sm font-semibold" onClick={handleCheckout}>
              {t("cartDrawer.lanjutkanCheckout", "Lanjutkan ke Checkout")} <ArrowRight className="w-4 h-4" />
            </Button>
            {hasProductOnly ? (
              <Button variant="outline" className="w-full gap-1.5 text-sm h-10" onClick={() => { close(); setLocation("/products"); }}>
                <Package className="w-3.5 h-3.5" /> {t("cartDrawer.tambahProdukLagi", "Tambah Produk Lagi")}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-1.5 text-sm h-10" onClick={openServiceCatalog}>
                  <Truck className="w-3.5 h-3.5" /> {t("cartDrawer.pilihLayanan", "Pilih Layanan")}
                </Button>
                <Button variant="outline" className="gap-1.5 text-sm h-10" onClick={() => { close(); setLocation("/products"); }}>
                  <Package className="w-3.5 h-3.5" /> {t("cartDrawer.pilihProduk", "Pilih Produk")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Trucking footer */}
        {view === "trucking" && (
          <div className="border-t border-slate-200 px-4 py-3 bg-white shrink-0">
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 gap-2"
              disabled={
                truckMode === "detail"
                  ? !truckData.pickupAddress?.trim() || !truckData.deliveryAddress?.trim()
                  : !truckData.destCity || !truckData.weight
              }
              onClick={handleAddTruckingItem}
            >
              {truckEstimate || truckMode === "detail" ? t("cartDrawer.addToOrder", "Tambahkan ke Pesanan") : t("cartDrawer.addPricePending", "Tambahkan (Harga Menyusul)")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Freight footer */}
        {view === "freight" && (
          <div className="border-t border-slate-200 px-4 py-3 bg-white shrink-0">
            <Button
              className={`w-full gap-2 ${
                freightSvc === "sea"       ? "bg-blue-600 hover:bg-blue-700" :
                freightSvc === "air"       ? "bg-sky-600 hover:bg-sky-700" :
                freightSvc === "storage"   ? "bg-emerald-600 hover:bg-emerald-700" :
                freightSvc === "customs"   ? "bg-slate-700 hover:bg-slate-800" :
                                             "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={
                freightSvc === "storage"   ? !freightData.volume :
                freightSvc === "customs"   ? false :
                freightSvc === "additional" ? !freightData.addlType :
                false
              }
              onClick={handleAddFreightItem}
            >
              {freightEstimate && freightSvc !== "additional" ? t("cartDrawer.addToOrder", "Tambahkan ke Pesanan") : t("cartDrawer.addPricePending", "Tambahkan (Harga Menyusul)")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
