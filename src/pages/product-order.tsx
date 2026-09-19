import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getPortalProfile } from "@/lib/auth";
import { COMPANY_CONFIG } from "@/config/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, resolveImageUrl } from "@/lib/utils";
import {
  Package, Search, Plus, Minus, Trash2, ShoppingCart,
  User, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Tag,
  Truck, Ship, Plane, Warehouse, Zap, FileCheck,
  MapPin, Calendar, Clock, Weight, Ruler, Calculator, ArrowRight,
} from "lucide-react";
import { DynamicProductForm } from "@/components/DynamicProductForm";
import type { ProductTemplate, DynamicFormValues } from "@shared/product-templates";
import {
  getInCodeTemplate as getLocalTemplate,
  getAllInCodeTemplates as getAllLocalTemplates,
  validateTemplatePayload,
} from "@shared/product-templates";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ────────────────────────────────────────────────────────────────────

interface PortalProduct {
  id: number; name: string; sku: string; price: number;
  unit: string | null; description: string | null;
  imageUrl: string | null; subcategory: string | null; stock: number;
  weightKg: number | null; lengthCm: number | null; widthCm: number | null;
  heightCm: number | null; goodsType: string | null;
}

interface CartItem { product: PortalProduct; qty: number; }

interface ServiceItem {
  id: string; name: string; icon: React.ReactNode;
  description: string; color: string; isTrucking?: boolean;
}

interface TruckingForm {
  mode: "detail" | "calculator";
  // detail mode
  pickupDate: string; pickupTime: string;
  pickupAddress: string; deliveryAddress: string;
  contactName: string; contactPhone: string;
  notes: string;
  // calculator mode
  origin: string; destination: string;
  weight: string; length: string; width: string; height: string;
  goodsType: string; incoterms: string;
}

interface SelectedService {
  serviceId: string;
  serviceName: string;
  estimatedCost: number | null; // null = "Harga menyusul"
  detail?: TruckingForm;
  summaryLine?: string;
}

type Step = "products" | "service-catalog" | "trucking" | "checkout" | "success";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PPN_RATE = 0.11;

const SERVICES: ServiceItem[] = [
  { id: "trucking",        name: "Trucking",            icon: <Truck  className="w-6 h-6" />, description: "Pengiriman darat, kota ke kota",           color: "bg-orange-50 border-orange-200 text-orange-600",  isTrucking: true },
  { id: "sea_freight",     name: "Kargo Laut",          icon: <Ship   className="w-6 h-6" />, description: "FCL / LCL, impor & ekspor",               color: "bg-blue-50 border-blue-200 text-blue-600" },
  { id: "air_freight",     name: "Kargo Udara",         icon: <Plane  className="w-6 h-6" />, description: "Pengiriman cepat via udara",               color: "bg-sky-50 border-sky-200 text-sky-600" },
  { id: "warehouse",       name: "Pergudangan",         icon: <Warehouse className="w-6 h-6" />, description: "Penyimpanan & manajemen stok",          color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
  { id: "express",         name: "Kargo Ekspres",       icon: <Zap    className="w-6 h-6" />, description: "Pengiriman prioritas, same-day / next-day", color: "bg-purple-50 border-purple-200 text-purple-600" },
  { id: "custom_clearance",name: "Custom Clearance",    icon: <FileCheck className="w-6 h-6" />, description: "Pengurusan bea cukai & dokumen",        color: "bg-slate-50 border-slate-200 text-slate-600" },
];

const INCOTERMS = ["EXW", "FCA", "FOB", "CIF", "DAP", "DDP", "CPT", "CIP"];
const GOODS_TYPES = ["General Cargo", "Kopi / Hasil Bumi", "Elektronik", "Perishable", "Kimia / B3", "Furniture", "Mesin & Spare-part", "Lainnya"];

const VEHICLE_CAPACITIES_PO = [
  { type: "CDE",     label: "CDE — Engkel Kecil",   desc: "s/d 1.500 kg",  maxKg: 1_500    },
  { type: "CDD",     label: "CDD — Engkel Besar",   desc: "s/d 3.000 kg",  maxKg: 3_000    },
  { type: "Fuso",    label: "Fuso — Truk Medium",   desc: "s/d 8.000 kg",  maxKg: 8_000    },
  { type: "Wingbox", label: "Wingbox — Truk Besar", desc: "s/d 20.000 kg", maxKg: 20_000   },
  { type: "Trailer", label: "Trailer",               desc: "> 20.000 kg",   maxKg: Infinity },
];
function suggestVehiclePO(weightKg: number): { type: string; label: string; desc: string } {
  for (const v of VEHICLE_CAPACITIES_PO) { if (weightKg <= v.maxKg) return v; }
  return VEHICLE_CAPACITIES_PO[VEHICLE_CAPACITIES_PO.length - 1];
}

const EMPTY_TRUCKING: TruckingForm = {
  mode: "detail",
  pickupDate: "", pickupTime: "", pickupAddress: "", deliveryAddress: "",
  contactName: "", contactPhone: "", notes: "",
  origin: "", destination: "", weight: "", length: "", width: "", height: "",
  goodsType: "", incoterms: "FOB",
};

const EMPTY_FORM: DynamicFormValues = {
  customFieldValues: {}, uploadedDocuments: [], checklistStatus: {},
  packagingNotes: "", conditionalFlags: {},
};

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchProducts(search?: string): Promise<PortalProduct[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`${BASE}/api/portal/products?${params}`);
  if (!res.ok) throw new Error("Gagal memuat produk");
  return res.json();
}

async function submitOrder(body: unknown): Promise<{ orderNumber: string }> {
  const res = await fetch(`${BASE}/api/portal-product/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Gagal mengirim pesanan");
  }
  return res.json();
}

function getStableSubmissionKey(storageKey: string): string {
  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const key = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    window.sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}

// ── Vehicle comparison helpers ─────────────────────────────────────────────────

const VEHICLE_RATES_PO: Record<string, { rate: number; min: number; maxKg: number }> = {
  CDE:     { rate: 3_500, min: 200_000,   maxKg: 1_500      },
  CDD:     { rate: 2_800, min: 350_000,   maxKg: 3_000      },
  Fuso:    { rate: 2_200, min: 800_000,   maxKg: 8_000      },
  Wingbox: { rate: 1_800, min: 2_500_000, maxKg: 20_000     },
  Trailer: { rate: 1_500, min: 5_000_000, maxKg: Infinity   },
};

function offlineEstimatePerVehicle(weightKg: number, vehicleType: string, volW: number): number {
  const chargeable = Math.max(weightKg, volW);
  const r = VEHICLE_RATES_PO[vehicleType] ?? VEHICLE_RATES_PO["CDD"];
  return Math.max(r.min, Math.round(chargeable * r.rate));
}

// ── Simple trucking cost estimator (offline) ──────────────────────────────────

function estimateTruckingCost(form: TruckingForm): number | null {
  if (form.mode === "calculator") {
    const w = parseFloat(form.weight);
    const l = parseFloat(form.length);
    const wi = parseFloat(form.width);
    const h = parseFloat(form.height);
    if (!w || (!form.origin && !form.destination)) return null;
    // volumetric weight (per 4000 cm³/kg)
    const volW = (l && wi && h) ? (l * wi * h) / 4000 : 0;
    const chargeableW = Math.max(w, volW);
    // base rate: Rp 2500/kg, min Rp 150.000
    return Math.max(150_000, Math.round(chargeableW * 2_500));
  }
  // detail mode: can't calculate without more info
  return null;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProductOrderPage() {
  const [step, setStep] = useState<Step>("products");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [allTemplates, setAllTemplates] = useState<ProductTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [products, setProducts] = useState<PortalProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [productCategory, setProductCategory] = useState("general");
  const [dynamicValues, setDynamicValues] = useState<DynamicFormValues>(EMPTY_FORM);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionIdempotencyKey, setSubmissionIdempotencyKey] = useState<string | null>(null);

  // Pre-fill customer info from logged-in profile
  useEffect(() => {
    const profile = getPortalProfile();
    if (!profile) return;
    if (profile.name) setCustomerName((prev) => prev || profile.name);
    if (profile.email) setEmail((prev) => prev || profile.email);
  }, []);
  const [orderNumber, setOrderNumber] = useState("");
  const [productFirstMode, setProductFirstMode] = useState(false);

  // Service state
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null);
  const [truckingForm, setTruckingForm] = useState<TruckingForm>(EMPTY_TRUCKING);
  const [estimating, setEstimating] = useState(false);
  const [truckingEstimate, setTruckingEstimate] = useState<number | null>(null);
  const [vehicleComparison, setVehicleComparison] = useState<Array<{ type: string; label: string; desc: string; estimate: number; suitable: boolean }> | null>(null);
  const [apiRates, setApiRates] = useState<Array<{ type: string; label: string; description: string; max_kg: string | null; rate_per_kg: string; min_price: string }> | null>(null);
  const [deliveryAddressError, setDeliveryAddressError] = useState(false);
  const [checkoutAddressError, setCheckoutAddressError] = useState(false);
  const [companyOrigin, setCompanyOrigin] = useState<{ name: string; address: string; originCity: string; originAirport: string; originPort: string } | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/portal/calculator-rates-v2`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length > 0) setApiRates(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/settings/company-pickup-address`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { companyName: string; companyAddress: string; originCity?: string; originAirport?: string; originPort?: string } | null) => {
        setCompanyOrigin(d?.companyAddress ? {
          name: d.companyName, address: d.companyAddress,
          originCity: d.originCity ?? COMPANY_CONFIG.originCity,
          originAirport: d.originAirport ?? COMPANY_CONFIG.originAirport,
          originPort: d.originPort ?? COMPANY_CONFIG.originPort,
        } : { name: COMPANY_CONFIG.brandName, address: "", originCity: COMPANY_CONFIG.originCity, originAirport: COMPANY_CONFIG.originAirport, originPort: COMPANY_CONFIG.originPort });
      })
      .catch(() => setCompanyOrigin({ name: COMPANY_CONFIG.brandName, address: "", originCity: COMPANY_CONFIG.originCity, originAirport: COMPANY_CONFIG.originAirport, originPort: COMPANY_CONFIG.originPort }));
  }, []);

  useEffect(() => {
    if (!companyOrigin) return;
    setTruckingForm(f => ({
      ...f,
      pickupAddress: f.pickupAddress || companyOrigin.address,
      origin: f.origin || companyOrigin.originCity,
    }));
  }, [companyOrigin]);

  useEffect(() => {
    Promise.resolve({ ok: true, json: async () => [] } as Response)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((t: ProductTemplate[]) => setAllTemplates(t.length > 0 ? t : getAllLocalTemplates()))
      .catch(() => setAllTemplates(getAllLocalTemplates()))
      .finally(() => setTemplatesLoading(false));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    fetchProducts(search)
      .then(setProducts)
      .catch(() => toast({ title: t("productOrder.error.loadProducts", "Gagal memuat produk"), variant: "destructive" }))
      .finally(() => setLoadingProducts(false));
  }, [search]);

  useEffect(() => { setDynamicValues(EMPTY_FORM); }, [productCategory]);

  const cartSubtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount    = cart.reduce((s, i) => s + i.qty, 0);
  const serviceAmt   = selectedService?.estimatedCost ?? 0;
  const subtotal     = cartSubtotal + serviceAmt;
  const ppn          = Math.round(subtotal * PPN_RATE);
  const grandTotal   = subtotal + ppn;

  const template: ProductTemplate =
    allTemplates.find(t => t.category === productCategory) ?? getLocalTemplate(productCategory);

  function addToCart(product: PortalProduct) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }

  function changeQty(productId: number, delta: number) {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  function removeFromCart(productId: number) {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }

  // ── Auto-compute cart shipping specs ────────────────────────────────────────
  const cartHasWeight = cart.some(i => i.product.weightKg != null);
  const cartAutoWeight = cartHasWeight
    ? cart.reduce((sum, item) => sum + (item.product.weightKg ?? 0) * item.qty, 0)
    : cart.reduce((sum, item) => sum + item.qty, 0); // fallback: 1 kg per qty

  // Find item with largest volume for auto-dimensions
  const cartDimItem = cart.reduce<CartItem | null>((best, item) => {
    const vol = (item.product.lengthCm ?? 0) * (item.product.widthCm ?? 0) * (item.product.heightCm ?? 0);
    const bestVol = best ? (best.product.lengthCm ?? 0) * (best.product.widthCm ?? 0) * (best.product.heightCm ?? 0) : 0;
    return vol > bestVol ? item : best;
  }, null);
  const cartHasDims = cartDimItem != null &&
    (cartDimItem.product.lengthCm ?? 0) > 0 &&
    (cartDimItem.product.widthCm ?? 0) > 0 &&
    (cartDimItem.product.heightCm ?? 0) > 0;

  // Auto goods type: prefer product-level goodsType, then derive from subcategory
  const cartAutoGoodsType = (() => {
    const explicit = cart.find(i => i.product.goodsType)?.product.goodsType;
    if (explicit) return explicit;
    const sub = cart[0]?.product.subcategory?.toLowerCase() ?? "";
    if (sub.includes("elektronik")) return "Elektronik";
    if (sub.includes("kopi") || sub.includes("bumi") || sub.includes("tani")) return "Kopi / Hasil Bumi";
    if (sub.includes("mesin") || sub.includes("spare")) return "Mesin & Spare-part";
    if (sub.includes("furniture") || sub.includes("furni")) return "Furniture";
    if (sub.includes("kimia") || sub.includes("b3")) return "Kimia / B3";
    return "General Cargo";
  })();
  const cartTotalQty = cart.reduce((s, i) => s + i.qty, 0);

  function handleSelectService(svc: ServiceItem) {
    if (svc.isTrucking) {
      const autoWeight = Math.round(cartAutoWeight * 1000) / 1000;
      setTruckingForm({
        ...EMPTY_TRUCKING,
        mode: "calculator",
        origin: companyOrigin?.originCity ?? "Jakarta",
        pickupAddress: companyOrigin?.address ?? "",
        weight: String(autoWeight > 0 ? autoWeight : cartTotalQty),
        length: cartHasDims ? String(cartDimItem!.product.lengthCm!) : "",
        width:  cartHasDims ? String(cartDimItem!.product.widthCm!)  : "",
        height: cartHasDims ? String(cartDimItem!.product.heightCm!) : "",
        goodsType: cartAutoGoodsType,
      });
      setTruckingEstimate(null);
      setStep("trucking");
    } else {
      setSelectedService({ serviceId: svc.id, serviceName: svc.name, estimatedCost: null, summaryLine: t("productOrder.service.pricePending", "Harga menyusul — tim akan konfirmasi") });
      setStep("checkout");
    }
  }

  function handleEstimateTrucking() {
    setEstimating(true);
    setVehicleComparison(null);
    setTimeout(() => {
      const w  = parseFloat(truckingForm.weight) || 0;
      const l  = parseFloat(truckingForm.length) || 0;
      const wi = parseFloat(truckingForm.width)  || 0;
      const h  = parseFloat(truckingForm.height) || 0;
      const volW = (l && wi && h) ? (l * wi * h) / 4000 : 0;
      const vehicleList = (apiRates && apiRates.length > 0)
        ? apiRates.map(r => ({
            type:   r.type,
            label:  r.label,
            desc:   r.description,
            maxKg:  r.max_kg != null ? Number(r.max_kg) : Infinity,
            rate:   Number(r.rate_per_kg),
            min:    Number(r.min_price),
          }))
        : Object.entries(VEHICLE_RATES_PO).map(([type, r]) => ({
            type,
            label: VEHICLE_CAPACITIES_PO.find(v => v.type === type)?.label ?? type,
            desc:  VEHICLE_CAPACITIES_PO.find(v => v.type === type)?.desc ?? "",
            maxKg: r.maxKg,
            rate:  r.rate,
            min:   r.min,
          }));
      const results = vehicleList.map(v => {
        const chargeable = Math.max(w, volW);
        return {
          type:     v.type,
          label:    v.label,
          desc:     v.desc,
          estimate: Math.max(v.min, Math.round(chargeable * v.rate)),
          suitable: w <= v.maxKg,
        };
      });
      setVehicleComparison(results);
      // auto-set estimate for the suggested vehicle
      const suggested = w > 0 ? suggestVehiclePO(w).type : null;
      const found = results.find(r => r.type === suggested && r.suitable) ?? results.find(r => r.suitable);
      if (found) setTruckingEstimate(found.estimate);
      setEstimating(false);
    }, 500);
  }

  function handleConfirmTrucking() {
    if (truckingForm.mode === "detail" && !truckingForm.deliveryAddress.trim()) {
      setDeliveryAddressError(true);
      toast({ title: t("productOrder.trucking.deliveryAddressRequired", "Alamat Pengiriman wajib diisi"), variant: "destructive" });
      return;
    }
    const cost = truckingEstimate;
    const summary = truckingForm.mode === "calculator"
      ? `${truckingForm.origin || t("productOrder.trucking.origin", "Asal")} → ${truckingForm.destination || t("productOrder.trucking.destination", "Tujuan")}, ${truckingForm.weight} kg`
      : `${truckingForm.pickupAddress || "Pickup"} → ${truckingForm.deliveryAddress || "Delivery"}`;
    setSelectedService({ serviceId: "trucking", serviceName: "Trucking", estimatedCost: cost, summaryLine: summary, detail: truckingForm });
    setStep("checkout");
  }

  async function handleSubmit() {
    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      toast({ title: t("productOrder.checkout.fillAllFields", "Isi semua kolom data pemesan"), variant: "destructive" }); return;
    }
    if (selectedService && !address.trim()) {
      setCheckoutAddressError(true);
      toast({ title: t("productOrder.checkout.deliveryAddressRequiredWithService", "Alamat Pengiriman wajib diisi jika menggunakan layanan pengiriman"), variant: "destructive" }); return;
    }
    const formErrors = validateTemplatePayload(template, dynamicValues);
    if (formErrors.length > 0) { toast({ title: formErrors[0], variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      const idempotencyKey = submissionIdempotencyKey
        ?? getStableSubmissionKey("customer-portal:product-order:pending");
      if (!submissionIdempotencyKey) setSubmissionIdempotencyKey(idempotencyKey);
      const items = cart.map(i => ({
        productId: i.product.id, productName: i.product.name, productSku: i.product.sku,
        unit: i.product.unit ?? "pcs", unitPrice: i.product.price, qty: i.qty,
        subtotal: i.product.price * i.qty,
        weightKg: i.product.weightKg ?? null,
        lengthCm: i.product.lengthCm ?? null,
        widthCm: i.product.widthCm ?? null,
        heightCm: i.product.heightCm ?? null,
        goodsType: i.product.goodsType ?? null,
      }));
      const isPickup = !selectedService && !address.trim();
      const result = await submitOrder({
        customerName: customerName.trim(), email: email.trim(), phone: phone.trim(),
        shippingAddress: address.trim() || null,
        shippingMethod: productFirstMode ? "pending" : (isPickup ? "pickup" : (selectedService ? selectedService.serviceId : "delivery")),
        notes: notes.trim() || undefined,
        items, productCategory, templateId: template.category, templateVersion: template.version,
        customFieldValues: dynamicValues.customFieldValues, uploadedDocuments: dynamicValues.uploadedDocuments,
        checklistStatus: dynamicValues.checklistStatus, packagingNotes: dynamicValues.packagingNotes || undefined,
        conditionalFlags: dynamicValues.conditionalFlags,
        orderType: productFirstMode ? "product_first" : "standard",
        selectedService: (!productFirstMode && selectedService) ? {
          serviceId: selectedService.serviceId, serviceName: selectedService.serviceName,
          estimatedCost: selectedService.estimatedCost, summaryLine: selectedService.summaryLine,
        } : undefined,
        subtotal, ppn, grandTotal,
        idempotencyKey,
      });
      try { window.sessionStorage.removeItem("customer-portal:product-order:pending"); } catch {}
      setSubmissionIdempotencyKey(null);
      setOrderNumber(result.orderNumber);
      setStep("success");
    } catch (err) {
      toast({ title: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step: Pilih Produk ────────────────────────────────────────────────────

  if (step === "products") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-10 px-4 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">{t("productOrder.products.title", "Pesan Produk")}</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">{t("productOrder.products.subtitle", "Pilih produk dan tambahkan ke keranjang")}</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("productOrder.products.searchPlaceholder", "Cari produk...")} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{t("productOrder.products.noProducts", "Tidak ada produk ditemukan")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {products.map(product => {
                const cartItem = cart.find(i => i.product.id === product.id);
                return (
                  <div key={product.id} className="border rounded-xl bg-card overflow-hidden hover:shadow-md transition-shadow">
                    {product.imageUrl
                      ? <img src={resolveImageUrl(product.imageUrl) ?? product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                      : <div className="w-full h-40 bg-muted flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground/40" /></div>
                    }
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                        {product.subcategory && <Badge variant="secondary" className="text-[10px] shrink-0">{product.subcategory}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{product.sku}</p>
                      {product.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>}
                      <p className="text-primary font-bold mb-3">
                        {formatCurrency(product.price)}
                        {product.unit && <span className="text-xs font-normal text-muted-foreground"> / {product.unit}</span>}
                      </p>
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => changeQty(product.id, -1)}><Minus className="w-3 h-3" /></Button>
                          <span className="flex-1 text-center font-semibold">{cartItem.qty}</span>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => changeQty(product.id, 1)}><Plus className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => removeFromCart(product.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => addToCart(product)}>
                          <Plus className="w-4 h-4 mr-1" /> {t("productOrder.products.addToCart", "Tambah")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cart.length > 0 && (
            <div className="sticky bottom-4 z-10">
              <div className="bg-card border shadow-xl rounded-xl px-5 py-4 space-y-3">
                {/* Mini summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> {cartCount} item</span>
                  <span className="font-bold text-foreground text-base">{formatCurrency(cartSubtotal)}</span>
                </div>
                {selectedService && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <span>+ {selectedService.serviceName}</span>
                    <span>{selectedService.estimatedCost ? formatCurrency(selectedService.estimatedCost) : t("productOrder.service.pricePendingShort", "Harga menyusul")}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {!productFirstMode && (
                    <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setStep("service-catalog")}>
                      <Truck className="w-4 h-4" />
                      {selectedService ? t("productOrder.cart.changeService", "Ganti Layanan") : t("productOrder.cart.selectService", "Pilih Layanan")}
                    </Button>
                  )}
                  <Button className="flex-1 gap-1.5" onClick={() => setStep("checkout")}>
                    {productFirstMode ? t("productOrder.cart.continueCheckout", "Lanjut Checkout") : t("productOrder.cart.continueToCheckout", "Lanjut ke Checkout")} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <button
                  onClick={() => { setProductFirstMode(v => !v); setSelectedService(null); }}
                  className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${
                    productFirstMode
                      ? "bg-amber-50 border-amber-200 text-amber-700 font-medium"
                      : "border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {productFirstMode
                    ? t("productOrder.cart.productFirstModeActive", "✅ Mode: Produk Dulu (pilih pengiriman nanti) — klik untuk batal")
                    : t("productOrder.cart.productFirstModeOff", "⚡ Pesan produk dulu, pilih pengiriman setelah dikonfirmasi")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Katalog Layanan ─────────────────────────────────────────────────

  if (step === "service-catalog") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setStep("products")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{t("productOrder.serviceCatalog.title", "Pilih Layanan Pengiriman")}</h1>
              <p className="text-primary-foreground/70 text-sm">{t("productOrder.serviceCatalog.subtitle", "Tambahkan layanan logistik ke pesanan Anda")}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* Skip option */}
          <button
            onClick={() => { setSelectedService(null); setStep("checkout"); }}
            className="w-full border-2 border-dashed border-border rounded-xl p-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors text-center"
          >
            {t("productOrder.serviceCatalog.skipService", "Lanjut tanpa layanan pengiriman")}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map(svc => (
              <button
                key={svc.id}
                onClick={() => handleSelectService(svc)}
                className={`border-2 rounded-xl p-5 text-left hover:shadow-md transition-all ${svc.color} ${selectedService?.serviceId === svc.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{svc.icon}</div>
                  <div>
                    <p className="font-semibold text-sm">{svc.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{svc.description}</p>
                    {svc.isTrucking && (
                      <span className="inline-block mt-2 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        {t("productOrder.serviceCatalog.costCalculatorAvailable", "Tersedia kalkulator biaya")}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Trucking Detail / Kalkulator ────────────────────────────────────

  if (step === "trucking") {
    const svc = SERVICES.find(s => s.id === "trucking")!;
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-orange-600 text-white py-8 px-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white" onClick={() => setStep("service-catalog")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <div>
                <h1 className="text-xl font-bold">{t("productOrder.trucking.title", "Layanan Trucking")}</h1>
                <p className="text-white/70 text-sm">{t("productOrder.trucking.subtitle", "Isi detail atau hitung estimasi biaya")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {(["detail", "calculator"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setTruckingForm(f => ({ ...f, mode }))}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${truckingForm.mode === mode ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {mode === "detail" ? <><MapPin className="w-4 h-4" /> {t("productOrder.trucking.modeDetail", "Form Pickup & Delivery")}</> : <><Calculator className="w-4 h-4" /> {t("productOrder.trucking.modeCalculator", "Kalkulator Estimasi")}</>}
              </button>
            ))}
          </div>

          {/* Detail Form */}
          {truckingForm.mode === "detail" && (
            <div className="border rounded-xl p-5 bg-card space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {t("productOrder.trucking.detailTitle", "Detail Pickup & Delivery")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-orange-500" /> {t("productOrder.trucking.pickupAddress", "Alamat Pickup")}
                    <span className="ml-auto text-[10px] font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5">{t("productOrder.trucking.auto", "Otomatis")}</span>
                  </Label>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-slate-800">{companyOrigin?.name ?? COMPANY_CONFIG.brandName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{companyOrigin?.address ?? COMPANY_CONFIG.pickupAddress}</p>
                    <p className="text-[10px] text-orange-600 mt-1">{t("productOrder.trucking.pickupNote", "Tim kami yang akan menjemput barang dari lokasi ini.")}</p>
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{t("productOrder.trucking.deliveryAddress", "Alamat Pengiriman")} <span className="text-destructive">*</span></Label>
                  <Textarea rows={2} placeholder="Jl. ..., Kota, Provinsi" value={truckingForm.deliveryAddress}
                    className={deliveryAddressError ? "border-destructive focus-visible:ring-destructive" : ""}
                    onChange={e => { setDeliveryAddressError(false); setTruckingForm(f => ({ ...f, deliveryAddress: e.target.value })); }} />
                  {deliveryAddressError && <p className="text-[11px] text-destructive">{t("productOrder.trucking.deliveryAddressError", "Alamat pengiriman wajib diisi.")}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("productOrder.trucking.contactName", "Nama Kontak")}</Label>
                  <Input placeholder={t("productOrder.trucking.contactNamePlaceholder", "Nama PIC")} value={truckingForm.contactName} onChange={e => setTruckingForm(f => ({ ...f, contactName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("productOrder.trucking.contactPhone", "No. Telepon Kontak")}</Label>
                  <Input type="tel" placeholder="08xxxxxxxxxx" value={truckingForm.contactPhone} onChange={e => setTruckingForm(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{t("productOrder.trucking.notes", "Catatan (opsional)")}</Label>
                  <Textarea rows={2} placeholder={t("productOrder.trucking.notesPlaceholder", "Instruksi khusus, info tambahan untuk tim pengiriman...")} value={truckingForm.notes} onChange={e => setTruckingForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                💡 {t("productOrder.trucking.confirmNote", "Estimasi biaya akan dikonfirmasi oleh tim setelah pesanan masuk.")}
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleConfirmTrucking}
                disabled={!truckingForm.deliveryAddress.trim()}>
                {t("productOrder.trucking.addToOrder", "Tambahkan ke Pesanan")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Calculator Mode — customer hanya isi Kota Tujuan */}
          {truckingForm.mode === "calculator" && (
            <div className="border rounded-xl p-5 bg-card space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-orange-500" /> {t("productOrder.trucking.estimateTitle", "Estimasi Biaya Trucking")}
              </h2>

              {/* Spesifikasi otomatis dari keranjang */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> {t("productOrder.trucking.autoSpec", "Spesifikasi dihitung otomatis dari pesanan Anda")}
                </p>
                {(() => {
                  const wKg = parseFloat(truckingForm.weight) || 0;
                  const sugVehicle = wKg > 0 ? suggestVehiclePO(wKg) : null;
                  return (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("productOrder.trucking.totalWeight", "Total Berat")}</span>
                        <span className="font-semibold text-slate-800">
                          {truckingForm.weight} kg
                          {!cartHasWeight && (
                            <span className="ml-1 text-[10px] text-amber-600 font-normal">({t("productOrder.trucking.estimate", "estimasi")})</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("productOrder.trucking.goodsType", "Jenis Barang")}</span>
                        <span className="font-semibold text-slate-800">{truckingForm.goodsType || "General Cargo"}</span>
                      </div>
                      {cartHasDims && (
                        <div className="flex justify-between col-span-2">
                          <span className="text-slate-500">{t("productOrder.trucking.dimensions", "Dimensi")}</span>
                          <span className="font-semibold text-slate-800">
                            {truckingForm.length} × {truckingForm.width} × {truckingForm.height} cm
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between col-span-2">
                        <span className="text-slate-500">{t("productOrder.trucking.originCity", "Kota Asal")}</span>
                        <span className="font-semibold text-slate-800">{truckingForm.origin || companyOrigin?.originCity || "Jakarta"}</span>
                      </div>
                      {sugVehicle && (
                        <div className="flex justify-between col-span-2 pt-1 border-t border-emerald-100">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-orange-500" /> {t("productOrder.trucking.suggestedVehicle", "Kendaraan Disarankan")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-orange-500 font-bold text-[10px]">★</span>
                            <span className="font-semibold text-orange-700">{sugVehicle.type}</span>
                            <span className="text-slate-400 text-[10px]">({sugVehicle.desc})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Satu-satunya input: Kota Tujuan */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t("productOrder.trucking.destinationLabel", "Kota / Alamat Tujuan")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder={t("productOrder.trucking.destinationPlaceholder", "Contoh: Surabaya, Bandung, Medan...")}
                  value={truckingForm.destination}
                  onChange={e => { setTruckingForm(f => ({ ...f, destination: e.target.value })); setVehicleComparison(null); }}
                  className="border-primary/40 focus:border-primary text-base"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">{t("productOrder.trucking.destinationHint", "Isi kota atau alamat tujuan pengiriman Anda")}</p>
              </div>

              <Button variant="outline" className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
                disabled={!truckingForm.destination.trim() || estimating}
                onClick={handleEstimateTrucking}>
                {estimating
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("productOrder.trucking.calculating", "Menghitung...")}</>
                  : <><Calculator className="w-4 h-4 mr-2" /> {t("productOrder.trucking.compareVehicles", "Bandingkan Semua Kendaraan")}</>}
              </Button>

              {vehicleComparison && (
                <div className="rounded-xl border overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5" /> {t("productOrder.trucking.vehicleComparison", "Perbandingan Kendaraan")}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {truckingForm.origin || companyOrigin?.originCity || t("productOrder.trucking.origin", "Asal")} → {truckingForm.destination} · {truckingForm.weight} kg
                    </p>
                  </div>
                  <div className="divide-y">
                    {vehicleComparison.map(v => {
                      const isSelected = truckingEstimate === v.estimate;
                      const isSuggested = suggestVehiclePO(parseFloat(truckingForm.weight)||0).type === v.type;
                      return (
                        <button
                          key={v.type}
                          type="button"
                          disabled={!v.suitable}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isSelected ? "bg-orange-50" : "hover:bg-slate-50"} ${!v.suitable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                          onClick={() => { if (!v.suitable) return; setTruckingEstimate(v.estimate); }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isSuggested && <span className="text-orange-500 text-xs font-bold">★</span>}
                              <span className={`text-sm font-semibold ${isSelected ? "text-orange-700" : "text-slate-700"}`}>{v.type}</span>
                              <span className="text-xs text-slate-400">{v.desc}</span>
                              {isSuggested && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">{t("productOrder.trucking.suggested", "Disarankan")}</span>}
                              {!v.suitable && <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">{t("productOrder.trucking.overCapacity", "Melebihi kapasitas")}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-bold ${isSelected ? "text-orange-600" : "text-slate-700"}`}>{formatCurrency(v.estimate)}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-slate-50 px-4 py-2 border-t">
                    <p className="text-[10px] text-slate-400">{t("productOrder.trucking.comparisonNote", "Klik kendaraan untuk memilih. Biaya final dikonfirmasi tim logistik.")}</p>
                  </div>
                </div>
              )}

              <Button className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!truckingForm.destination.trim()}
                onClick={handleConfirmTrucking}>
                {truckingEstimate ? t("productOrder.trucking.addToOrder", "Tambahkan ke Pesanan") : t("productOrder.trucking.addPricePending", "Tambahkan (Harga Menyusul)")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Checkout ────────────────────────────────────────────────────────

  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setStep("products")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{t("productOrder.checkout.title", "Detail Pesanan")}</h1>
              <p className="text-primary-foreground/70 text-sm">{t("productOrder.checkout.subtitle", "Isi informasi produk dan data pengiriman")}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

          {/* Order Summary */}
          <div className="border rounded-xl p-5 bg-card space-y-3">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4" /> {t("productOrder.checkout.orderSummary", "Ringkasan Pesanan")}
            </h2>

            {/* Products */}
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-muted-foreground text-xs">{formatCurrency(item.product.price)} × {item.qty} {item.product.unit ?? "pcs"}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.product.price * item.qty)}</p>
                </div>
              ))}
            </div>

            {/* Selected Service — hanya tampil jika bukan productFirstMode */}
            {productFirstMode ? (
              <>
                <Separator />
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <span className="text-amber-600 text-lg">⚡</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700">{t("productOrder.checkout.productFirstMode", "Mode: Produk Dulu")}</p>
                    <p className="text-xs text-amber-600">{t("productOrder.checkout.productFirstModeDesc", "Pilihan pengiriman ditentukan setelah produk dikonfirmasi vendor.")}</p>
                  </div>
                </div>
              </>
            ) : selectedService ? (
              <>
                <Separator />
                <div className="flex items-start justify-between text-sm">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                    <div>
                      <p className="font-medium">{selectedService.serviceName}</p>
                      {selectedService.summaryLine && <p className="text-xs text-muted-foreground">{selectedService.summaryLine}</p>}
                    </div>
                  </div>
                  <p className="font-semibold shrink-0 ml-2">
                    {selectedService.estimatedCost ? formatCurrency(selectedService.estimatedCost) : <span className="text-muted-foreground text-xs">{t("productOrder.service.pricePendingShort", "Harga menyusul")}</span>}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground -mt-1 h-7 px-2" onClick={() => setStep("service-catalog")}>
                  {t("productOrder.checkout.changeService", "Ganti layanan")}
                </Button>
              </>
            ) : (
              <>
                <Separator />
                <Button variant="outline" size="sm" className="w-full gap-2 text-sm border-dashed" onClick={() => setStep("service-catalog")}>
                  <Truck className="w-4 h-4" /> + {t("productOrder.checkout.addShippingService", "Tambah Layanan Pengiriman")}
                </Button>
              </>
            )}

            {/* Totals */}
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("productOrder.checkout.productSubtotal", "Subtotal produk")}</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              {serviceAmt > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("productOrder.checkout.shippingService", "Layanan pengiriman")}</span>
                  <span>{formatCurrency(serviceAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>{t("productOrder.checkout.vat", "PPN 11%")}</span>
                <span>{formatCurrency(ppn)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t("productOrder.checkout.estimatedTotal", "Total Estimasi")}</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div className="border rounded-xl p-5 bg-card space-y-3">
            <h2 className="font-semibold flex items-center gap-2 text-sm"><Tag className="w-4 h-4" /> {t("productOrder.checkout.commodityCategory", "Kategori Komoditas")}</h2>
            <p className="text-xs text-muted-foreground">{t("productOrder.checkout.commodityCategoryHint", "Pilih kategori untuk menampilkan field dokumen yang relevan.")}</p>
            {templatesLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="w-3 h-3 animate-spin" /> {t("productOrder.checkout.loadingCategories", "Memuat kategori...")}
              </div>
            ) : (
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allTemplates.map(t => <SelectItem key={t.category} value={t.category}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {!templatesLoading && (
            <DynamicProductForm template={template} values={dynamicValues} onChange={setDynamicValues} />
          )}

          {/* Customer Data */}
          <div className="border rounded-xl p-5 bg-card space-y-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm"><User className="w-4 h-4" /> {t("productOrder.checkout.ordererData", "Data Pemesan")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("productOrder.checkout.fullName", "Nama Lengkap")} <span className="text-destructive">*</span></Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t("productOrder.checkout.fullNamePlaceholder", "Nama lengkap")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("productOrder.checkout.whatsapp", "No. WhatsApp")} <span className="text-destructive">*</span></Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" type="tel" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">{t("productOrder.checkout.email", "Email")} <span className="text-destructive">*</span></Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">
                  {t("productOrder.checkout.shippingAddress", "Alamat Pengiriman")}{" "}
                  {selectedService
                    ? <span className="text-destructive">*</span>
                    : <span className="text-muted-foreground font-normal">({t("productOrder.checkout.shippingAddressOptional", "opsional — kosongkan jika ambil sendiri")})</span>}
                </Label>
                <Input value={address}
                  className={checkoutAddressError ? "border-destructive focus-visible:ring-destructive" : ""}
                  onChange={e => { setCheckoutAddressError(false); setAddress(e.target.value); }}
                  placeholder={selectedService ? "Jl. ..., Kota, Provinsi" : t("productOrder.checkout.selfPickupPlaceholder", "Kosongkan jika ambil sendiri di gudang kami")} />
                {checkoutAddressError && <p className="text-[11px] text-destructive">{t("productOrder.checkout.shippingAddressRequiredError", "Alamat pengiriman wajib diisi jika menggunakan layanan pengiriman.")}</p>}
                {!selectedService && !address.trim() && (
                  <p className="text-[11px] text-green-600 flex items-center gap-1">
                    <Warehouse className="w-3 h-3" /> {t("productOrder.checkout.selfPickupNote", "Pesanan akan disiapkan untuk diambil di gudang kami")}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">{t("productOrder.checkout.additionalNotes", "Catatan Tambahan (opsional)")}</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("productOrder.checkout.notesPlaceholder", "Catatan tambahan...")} />
              </div>
            </div>
          </div>

          <Button className="w-full h-12 text-base gap-2" onClick={handleSubmit} disabled={submitting || templatesLoading}>
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("productOrder.checkout.sending", "Mengirim...")}</>
              : <><CheckCircle2 className="w-4 h-4" /> {t("productOrder.checkout.submitOrder", "Kirim Pesanan")}</>}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: Sukses ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className={`border rounded-2xl p-8 ${productFirstMode ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${productFirstMode ? "text-amber-500" : "text-green-500"}`} />
          <h1 className={`text-2xl font-bold mb-2 ${productFirstMode ? "text-amber-800" : "text-green-800"}`}>
            {productFirstMode ? t("productOrder.success.productFirstTitle", "Pesanan Produk Diterima!") : t("productOrder.success.title", "Pesanan Berhasil!")}
          </h1>
          <p className={`text-sm mb-4 ${productFirstMode ? "text-amber-700" : "text-green-700"}`}>
            {t("productOrder.success.orderNumber", "No. Pesanan")}: <strong className="font-mono">{orderNumber}</strong>
          </p>
          {productFirstMode ? (
            <div className="space-y-2 text-left">
              <p className="text-amber-700 text-sm font-medium">{t("productOrder.success.nextSteps", "Langkah selanjutnya:")}</p>
              <ol className="text-amber-600 text-xs space-y-1 list-decimal list-inside">
                <li>{t("productOrder.success.step1", "Admin akan mencari vendor produk terbaik")}</li>
                <li>{t("productOrder.success.step2", "Anda akan menerima penawaran produk via WhatsApp")}</li>
                <li>{t("productOrder.success.step3", "Setujui atau tolak penawaran produk")}</li>
                <li>{t("productOrder.success.step4", "Pilih mode pengiriman yang Anda inginkan")}</li>
              </ol>
            </div>
          ) : (
            <>
              {selectedService && (
                <p className="text-green-600 text-xs mb-2">
                  {t("productOrder.success.service", "Layanan")}: <strong>{selectedService.serviceName}</strong>
                  {selectedService.estimatedCost ? ` · ${formatCurrency(selectedService.estimatedCost)}` : ` · ${t("productOrder.service.pricePendingShort", "Harga menyusul")}`}
                </p>
              )}
              <p className="text-green-600 text-sm">
                {t("productOrder.success.contactNote", "Tim kami akan menghubungi Anda via WhatsApp atau email untuk konfirmasi dan pembayaran.")}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => setLocation("/products")}>{t("productOrder.success.viewOtherProducts", "Lihat Produk Lain")}</Button>
          <Button onClick={() => {
            setCart([]); setStep("products"); setCustomerName(""); setEmail(""); setPhone("");
            setAddress(""); setNotes(""); setProductCategory("general"); setDynamicValues(EMPTY_FORM);
            setSelectedService(null); setTruckingForm(EMPTY_TRUCKING); setTruckingEstimate(null);
            setProductFirstMode(false);
          }}>{t("productOrder.success.orderAgain", "Pesan Lagi")}</Button>
        </div>
      </div>
    </div>
  );
}
