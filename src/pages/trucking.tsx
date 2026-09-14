import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
// C1: auth via cookie
import {
  ChevronDown, ChevronLeft, ChevronRight, Calculator,
  Truck, Shield, Clock, Fuel, Users, Info, CheckCircle2,
  MinusCircle, PlusCircle, CalendarDays, Package, MapPin,
  Phone, User, AlarmClock, Boxes, Send, Loader2,
  PartyPopper, Star, Navigation, Headphones, BadgeCheck,
  Timer, MessageCircle, Weight, Ruler, Zap, Award,
  ArrowRight, TrendingUp, Globe, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { GooglePlacesAutocomplete } from "@/components/ui/google-places-autocomplete";
import { RouteMapPreview } from "@/components/ui/route-map-preview";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";
import { staticAsset } from "@/lib/staticAssets";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string;
  name: string;
  description: string;
  panjang: number;
  lebar: number;
  tinggi: number;
  kapasitasKg: number;
  volumeM3: number;
  hargaDasar: number;
  icon: React.ReactNode;
}

// ─── SVG ──────────────────────────────────────────────────────────────────────

function TruckSVG({ size = "sm", variant = "default" }: { size?: "sm" | "lg"; variant?: string }) {
  const w = size === "lg" ? 280 : 44;
  const h = size === "lg" ? 160 : 28;

  const configs: Record<string, { body: string; cab: string; wheels: string }> = {
    mobil:           { body: "#cbd5e1", cab: "#94a3b8",  wheels: "#475569" },
    "mobil-xl":      { body: "#bfdbfe", cab: "#93c5fd",  wheels: "#3b82f6" },
    van:             { body: "#c7d2fe", cab: "#a5b4fc",  wheels: "#6366f1" },
    "pickup-kecil":  { body: "#fde68a", cab: "#fbbf24",  wheels: "#d97706" },
    "box-kecil":     { body: "#bbf7d0", cab: "#86efac",  wheels: "#16a34a" },
    engkel:          { body: "#fed7aa", cab: "#fb923c",  wheels: "#ea580c" },
    "double-engkel": { body: "#fca5a5", cab: "#f87171",  wheels: "#dc2626" },
    "cdd-long":      { body: "#93c5fd", cab: "#60a5fa",  wheels: "#2563eb" },
    fuso:            { body: "#6ee7b7", cab: "#34d399",  wheels: "#059669" },
    tronton:         { body: "#c4b5fd", cab: "#a78bfa",  wheels: "#7c3aed" },
    "truk-trailer":  { body: "#94a3b8", cab: "#64748b",  wheels: "#334155" },
    "truk-reefer":   { body: "#bae6fd", cab: "#38bdf8",  wheels: "#0284c7" },
    default:         { body: "#93c5fd", cab: "#60a5fa",  wheels: "#2563eb" },
  };

  const c = configs[variant] ?? configs.default;

  if (size === "sm") {
    return (
      <svg viewBox="0 0 44 28" width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="8" width="28" height="14" rx="2" fill={c.body} />
        <rect x="30" y="12" width="10" height="10" rx="1.5" fill={c.cab} />
        <rect x="31" y="13" width="7" height="5" rx="1" fill="white" opacity="0.6" />
        <circle cx="10" cy="22" r="4" fill={c.wheels} />
        <circle cx="10" cy="22" r="2" fill="white" opacity="0.4" />
        <circle cx="33" cy="22" r="4" fill={c.wheels} />
        <circle cx="33" cy="22" r="2" fill="white" opacity="0.4" />
        <rect x="39" y="16" width="3" height="2" rx="0.5" fill="#fef08a" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 160" width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="140" cy="150" rx="120" ry="8" fill="#cbd5e1" opacity="0.4" />
      <rect x="10" y="45" width="185" height="90" rx="6" fill={c.body} />
      <rect x="10" y="45" width="185" height="20" rx="6" fill="white" opacity="0.2" />
      <line x1="10" y1="80" x2="195" y2="80" stroke="white" strokeWidth="1.5" opacity="0.3" />
      <line x1="10" y1="105" x2="195" y2="105" stroke="white" strokeWidth="1.5" opacity="0.15" />
      <rect x="195" y="55" width="70" height="80" rx="8" fill={c.cab} />
      <rect x="202" y="60" width="54" height="42" rx="5" fill="white" opacity="0.55" />
      <rect x="202" y="107" width="25" height="25" rx="3" fill={c.cab} stroke="white" strokeWidth="0.8" opacity="0.6" />
      <rect x="221" y="120" width="4" height="1.5" rx="0.5" fill="white" opacity="0.7" />
      <rect x="14" y="49" width="2" height="82" fill="white" opacity="0.15" />
      <circle cx="50" cy="138" r="18" fill={c.wheels} />
      <circle cx="50" cy="138" r="10" fill="#1e293b" />
      <circle cx="50" cy="138" r="5" fill={c.wheels} opacity="0.5" />
      <circle cx="155" cy="138" r="18" fill={c.wheels} />
      <circle cx="155" cy="138" r="10" fill="#1e293b" />
      <circle cx="155" cy="138" r="5" fill={c.wheels} opacity="0.5" />
      <circle cx="228" cy="138" r="18" fill={c.wheels} />
      <circle cx="228" cy="138" r="10" fill="#1e293b" />
      <circle cx="228" cy="138" r="5" fill={c.wheels} opacity="0.5" />
      <rect x="260" y="82" width="14" height="8" rx="2" fill="#fef08a" />
      <rect x="200" y="40" width="5" height="18" rx="2" fill="#64748b" />
    </svg>
  );
}

// ─── Static vehicle photos ────────────────────────────────────────────────────
const VEHICLE_PHOTOS: Record<string, string> = {
  "mobil":          staticAsset("images/vehicles/mobil-ai.png"),
  "mobil-xl":       staticAsset("images/vehicles/mobil-xl-ai.png"),
  "van":            staticAsset("images/vehicles/van-ai.png"),
  "pickup-kecil":   staticAsset("images/vehicles/pickup-kecil-ai.png"),
  "box-kecil":      staticAsset("images/vehicles/box-kecil-ai.png"),
  "engkel":         staticAsset("images/vehicles/engkel-ai.png"),
  "double-engkel":  staticAsset("images/vehicles/double-engkel-ai.png"),
  "cdd-long":       staticAsset("images/vehicles/cdd-long-ai.png"),
  "fuso":           staticAsset("images/vehicles/fuso-ai.png"),
  "tronton":        staticAsset("images/vehicles/tronton-ai.png"),
  "truk-trailer":   staticAsset("images/vehicles/truk-trailer-ai.png"),
  "truk-reefer":    staticAsset("images/vehicles/truk-reefer-ai.png"),
};

/**
 * Resolve vehicle image: skip /api/storage/ paths (Supabase Storage) and
 * fall back to local asset so the photo always renders even without storage access.
 */
function resolveVehicleImg(
  apiUrl: string | undefined,
  localFallback: string | undefined,
): string | undefined {
  if (apiUrl && !apiUrl.startsWith("/api/storage/")) return apiUrl;
  return localFallback;
}

// ─── Vehicle best-for / overview data (translated object — no new locale keys) ─
type VehicleMetaEntry = { bestFor: string[]; advantages: string[]; deliveryDays: string };
const VEHICLE_META_I18N: Record<string, Record<string, VehicleMetaEntry>> = {
  "mobil": {
    "id-ID": { bestFor: ["Pengiriman dalam kota", "Dokumen & paket kecil", "Last-mile delivery"], advantages: ["Lincah di jalanan padat", "Biaya paling ekonomis", "Parkir mudah"], deliveryDays: "Hari ini" },
    "en-US": { bestFor: ["City deliveries", "Documents & small packages", "Last-mile delivery"], advantages: ["Agile in congested traffic", "Most economical rate", "Easy parking"], deliveryDays: "Today" },
    "zh-CN": { bestFor: ["城市配送", "文件和小件包裹", "末端配送"], advantages: ["穿行拥堵路段灵活", "最经济实惠", "停车便利"], deliveryDays: "今天" },
    "fr-FR": { bestFor: ["Livraisons en ville", "Documents & petits colis", "Livraison du dernier kilomètre"], advantages: ["Agile dans les embouteillages", "Tarif le plus économique", "Stationnement facile"], deliveryDays: "Aujourd'hui" },
    "ar-SA": { bestFor: ["التوصيل داخل المدينة", "الوثائق والطرود الصغيرة", "توصيل الميل الأخير"], advantages: ["رشاقة في الازدحام", "الأكثر اقتصاداً", "سهولة الوقوف"], deliveryDays: "اليوم" },
  },
  "mobil-xl": {
    "id-ID": { bestFor: ["Pengiriman medium", "Barang rumah tangga", "FMCG"], advantages: ["Kapasitas lebih dari mobil biasa", "Fleksibel untuk berbagai barang", "Harga terjangkau"], deliveryDays: "Hari ini" },
    "en-US": { bestFor: ["Medium deliveries", "Household goods", "FMCG"], advantages: ["More capacity than standard car", "Flexible for various goods", "Affordable rate"], deliveryDays: "Today" },
    "zh-CN": { bestFor: ["中型配送", "家居用品", "快消品"], advantages: ["容量大于普通轿车", "适用于各类货物", "价格实惠"], deliveryDays: "今天" },
    "fr-FR": { bestFor: ["Livraisons moyennes", "Articles ménagers", "FMCG"], advantages: ["Plus de capacité que la voiture standard", "Flexible pour divers articles", "Tarif abordable"], deliveryDays: "Aujourd'hui" },
    "ar-SA": { bestFor: ["التوصيل المتوسط", "السلع المنزلية", "السلع الاستهلاكية"], advantages: ["سعة أكبر من السيارة العادية", "مرن لمختلف البضائع", "سعر معقول"], deliveryDays: "اليوم" },
  },
  "van": {
    "id-ID": { bestFor: ["Barang sensitif & tertutup", "Produk fashion", "Elektronik"], advantages: ["Tertutup & aman dari hujan", "Kapasitas bagasi besar", "Nyaman untuk barang premium"], deliveryDays: "Hari ini" },
    "en-US": { bestFor: ["Sensitive & enclosed goods", "Fashion products", "Electronics"], advantages: ["Fully enclosed from rain", "Large boot capacity", "Great for premium goods"], deliveryDays: "Today" },
    "zh-CN": { bestFor: ["敏感与封闭货物", "时尚产品", "电子产品"], advantages: ["全封闭防雨", "超大储物空间", "适合高端商品"], deliveryDays: "今天" },
    "fr-FR": { bestFor: ["Marchandises sensibles & fermées", "Produits de mode", "Électronique"], advantages: ["Entièrement fermé à la pluie", "Grande capacité de chargement", "Idéal pour produits premium"], deliveryDays: "Aujourd'hui" },
    "ar-SA": { bestFor: ["البضائع الحساسة والمغلقة", "منتجات الأزياء", "الإلكترونيات"], advantages: ["مغلق تماماً من المطر", "سعة تحميل كبيرة", "مناسب للبضائع الفاخرة"], deliveryDays: "اليوم" },
  },
  "pickup-kecil": {
    "id-ID": { bestFor: ["Material bangunan", "Barang berat & kasar", "Distribusi grosir"], advantages: ["Bak terbuka fleksibel", "Cocok untuk barang tak beraturan", "Mudah loading"], deliveryDays: "Hari ini" },
    "en-US": { bestFor: ["Building materials", "Heavy & bulky goods", "Wholesale distribution"], advantages: ["Flexible open bed", "Suitable for irregular items", "Easy loading"], deliveryDays: "Today" },
    "zh-CN": { bestFor: ["建筑材料", "重型散装货物", "批发分销"], advantages: ["开放式货床灵活", "适合不规则货物", "装卸方便"], deliveryDays: "今天" },
    "fr-FR": { bestFor: ["Matériaux de construction", "Marchandises lourdes & encombrantes", "Distribution en gros"], advantages: ["Plateau ouvert flexible", "Adapté aux articles irréguliers", "Chargement facile"], deliveryDays: "Aujourd'hui" },
    "ar-SA": { bestFor: ["مواد البناء", "البضائع الثقيلة والضخمة", "التوزيع بالجملة"], advantages: ["صندوق مفتوح مرن", "مناسب للبضائع غير المنتظمة", "سهولة التحميل"], deliveryDays: "اليوم" },
  },
  "box-kecil": {
    "id-ID": { bestFor: ["Barang sensitif", "Produk farmasi", "Makanan & minuman"], advantages: ["Box tertutup penuh", "Aman dari cuaca", "Kapasitas volume besar"], deliveryDays: "Hari ini – 1 Hari" },
    "en-US": { bestFor: ["Sensitive goods", "Pharmaceuticals", "Food & beverages"], advantages: ["Fully closed box", "Protected from weather", "Large volume capacity"], deliveryDays: "Today – 1 Day" },
    "zh-CN": { bestFor: ["敏感货物", "药品", "食品饮料"], advantages: ["全封闭厢式", "防风雨保护", "大容量"], deliveryDays: "今天 – 1天" },
    "fr-FR": { bestFor: ["Marchandises sensibles", "Pharmaceutique", "Alimentation & boissons"], advantages: ["Boîte entièrement fermée", "Protégé des intempéries", "Grande capacité volumique"], deliveryDays: "Aujourd'hui – 1 Jour" },
    "ar-SA": { bestFor: ["البضائع الحساسة", "المستحضرات الصيدلانية", "الأغذية والمشروبات"], advantages: ["صندوق مغلق تماماً", "محمي من الطقس", "سعة حجمية كبيرة"], deliveryDays: "اليوم – 1 يوم" },
  },
  "engkel": {
    "id-ID": { bestFor: ["Pengiriman antar kota", "Distribusi grosir", "Material ringan"], advantages: ["Kapasitas 3.5 ton", "Bisa masuk kota", "Sopir berpengalaman"], deliveryDays: "1–2 Hari" },
    "en-US": { bestFor: ["Inter-city deliveries", "Wholesale distribution", "Light materials"], advantages: ["3.5-ton capacity", "Can enter city areas", "Experienced driver"], deliveryDays: "1–2 Days" },
    "zh-CN": { bestFor: ["城际配送", "批发分销", "轻型材料"], advantages: ["3.5吨载重", "可进入城区", "经验丰富司机"], deliveryDays: "1–2天" },
    "fr-FR": { bestFor: ["Livraisons intercités", "Distribution en gros", "Matériaux légers"], advantages: ["Capacité 3,5 tonnes", "Accès aux zones urbaines", "Chauffeur expérimenté"], deliveryDays: "1–2 Jours" },
    "ar-SA": { bestFor: ["التوصيل بين المدن", "التوزيع بالجملة", "المواد الخفيفة"], advantages: ["سعة 3.5 طن", "يمكنه دخول المناطق الحضرية", "سائق ذو خبرة"], deliveryDays: "1–2 أيام" },
  },
  "double-engkel": {
    "id-ID": { bestFor: ["Muatan medium-besar", "Antar provinsi", "Barang industri"], advantages: ["Kapasitas 5 ton", "Efisien untuk jarak menengah", "Harga kompetitif"], deliveryDays: "1–3 Hari" },
    "en-US": { bestFor: ["Medium-large loads", "Inter-province", "Industrial goods"], advantages: ["5-ton capacity", "Efficient for mid-range distances", "Competitive rate"], deliveryDays: "1–3 Days" },
    "zh-CN": { bestFor: ["中大型载重", "跨省运输", "工业货物"], advantages: ["5吨载重", "中等距离高效", "价格有竞争力"], deliveryDays: "1–3天" },
    "fr-FR": { bestFor: ["Charges moyennes à grandes", "Interprovincial", "Marchandises industrielles"], advantages: ["Capacité 5 tonnes", "Efficace sur distances moyennes", "Tarif compétitif"], deliveryDays: "1–3 Jours" },
    "ar-SA": { bestFor: ["الأحمال المتوسطة والكبيرة", "بين المحافظات", "البضائع الصناعية"], advantages: ["سعة 5 أطنان", "كفاءة عالية للمسافات المتوسطة", "سعر تنافسي"], deliveryDays: "1–3 أيام" },
  },
  "cdd-long": {
    "id-ID": { bestFor: ["Pengiriman jarak jauh", "Muatan besar", "Antar provinsi & pulau"], advantages: ["Kapasitas 6 ton / 22 m³", "Ideal untuk proyek besar", "Cover Jawa–Sumatra"], deliveryDays: "1–3 Hari" },
    "en-US": { bestFor: ["Long-distance shipping", "Large cargo", "Inter-province & island"], advantages: ["6-ton / 22 m³ capacity", "Ideal for large projects", "Cover Java–Sumatra"], deliveryDays: "1–3 Days" },
    "zh-CN": { bestFor: ["长距离运输", "大型货物", "跨省跨岛"], advantages: ["6吨/22立方米容量", "适合大型项目", "覆盖爪哇-苏门答腊"], deliveryDays: "1–3天" },
    "fr-FR": { bestFor: ["Transport longue distance", "Grande cargaison", "Interprovincial & inter-îles"], advantages: ["Capacité 6 t / 22 m³", "Idéal pour grands projets", "Couvre Java–Sumatra"], deliveryDays: "1–3 Jours" },
    "ar-SA": { bestFor: ["الشحن لمسافات طويلة", "البضائع الكبيرة", "بين المحافظات والجزر"], advantages: ["سعة 6 أطنان / 22 م³", "مثالي للمشاريع الكبيرة", "يغطي جاوة-سومطرة"], deliveryDays: "1–3 أيام" },
  },
  "fuso": {
    "id-ID": { bestFor: ["Industri manufaktur", "Proyek konstruksi", "Ekspor impor lokal"], advantages: ["Kapasitas 8 ton", "Mesin andal untuk jarak jauh", "Volume cargo besar"], deliveryDays: "2–4 Hari" },
    "en-US": { bestFor: ["Manufacturing industry", "Construction projects", "Local export & import"], advantages: ["8-ton capacity", "Reliable engine for long haul", "Large cargo volume"], deliveryDays: "2–4 Days" },
    "zh-CN": { bestFor: ["制造业", "建筑项目", "本地进出口"], advantages: ["8吨载重", "可靠引擎适合长途", "大货物体积"], deliveryDays: "2–4天" },
    "fr-FR": { bestFor: ["Industrie manufacturière", "Projets de construction", "Export & import local"], advantages: ["Capacité 8 tonnes", "Moteur fiable pour longue distance", "Grand volume de cargaison"], deliveryDays: "2–4 Jours" },
    "ar-SA": { bestFor: ["الصناعة التحويلية", "مشاريع البناء", "التصدير والاستيراد المحلي"], advantages: ["سعة 8 أطنان", "محرك موثوق للمسافات الطويلة", "حجم شحن كبير"], deliveryDays: "2–4 أيام" },
  },
  "tronton": {
    "id-ID": { bestFor: ["Industri berat", "Logistik skala besar", "Distribusi nasional"], advantages: ["Kapasitas 15 ton", "Efisien untuk skala besar", "Volume 40 m³"], deliveryDays: "2–5 Hari" },
    "en-US": { bestFor: ["Heavy industry", "Large-scale logistics", "National distribution"], advantages: ["15-ton capacity", "Efficient at scale", "40 m³ volume"], deliveryDays: "2–5 Days" },
    "zh-CN": { bestFor: ["重工业", "大规模物流", "全国配送"], advantages: ["15吨载重", "大规模高效", "40立方米"], deliveryDays: "2–5天" },
    "fr-FR": { bestFor: ["Industrie lourde", "Logistique à grande échelle", "Distribution nationale"], advantages: ["Capacité 15 tonnes", "Efficace à grande échelle", "Volume 40 m³"], deliveryDays: "2–5 Jours" },
    "ar-SA": { bestFor: ["الصناعة الثقيلة", "اللوجستيات الضخمة", "التوزيع الوطني"], advantages: ["سعة 15 طن", "كفاءة على نطاق واسع", "حجم 40 م³"], deliveryDays: "2–5 أيام" },
  },
  "truk-trailer": {
    "id-ID": { bestFor: ["Kargo masif", "Ekspor kontainer", "Lintas pulau"], advantages: ["Kapasitas 30 ton", "Standar ekspor internasional", "Volume 75 m³"], deliveryDays: "3–7 Hari" },
    "en-US": { bestFor: ["Massive cargo", "Container export", "Cross-island"], advantages: ["30-ton capacity", "International export standard", "75 m³ volume"], deliveryDays: "3–7 Days" },
    "zh-CN": { bestFor: ["大型货物", "集装箱出口", "跨岛运输"], advantages: ["30吨载重", "国际出口标准", "75立方米"], deliveryDays: "3–7天" },
    "fr-FR": { bestFor: ["Cargaison massive", "Export de conteneurs", "Trans-île"], advantages: ["Capacité 30 tonnes", "Norme d'export international", "Volume 75 m³"], deliveryDays: "3–7 Jours" },
    "ar-SA": { bestFor: ["البضائع الضخمة", "تصدير الحاويات", "عبر الجزر"], advantages: ["سعة 30 طن", "معيار التصدير الدولي", "حجم 75 م³"], deliveryDays: "3–7 أيام" },
  },
  "truk-reefer": {
    "id-ID": { bestFor: ["Produk segar & beku", "Farmasi", "Makanan premium"], advantages: ["Pendingin aktif", "Menjaga kualitas produk", "Standar food-grade"], deliveryDays: "1–3 Hari" },
    "en-US": { bestFor: ["Fresh & frozen goods", "Pharmaceuticals", "Premium food"], advantages: ["Active refrigeration", "Preserves product quality", "Food-grade standard"], deliveryDays: "1–3 Days" },
    "zh-CN": { bestFor: ["新鲜和冷冻货物", "药品", "优质食品"], advantages: ["主动制冷", "保持产品质量", "食品级标准"], deliveryDays: "1–3天" },
    "fr-FR": { bestFor: ["Produits frais & surgelés", "Pharmaceutique", "Alimentation premium"], advantages: ["Réfrigération active", "Préserve la qualité des produits", "Norme alimentaire"], deliveryDays: "1–3 Jours" },
    "ar-SA": { bestFor: ["البضائع الطازجة والمجمدة", "الأدوية", "الأغذية الفاخرة"], advantages: ["تبريد نشط", "يحافظ على جودة المنتج", "معيار غذائي"], deliveryDays: "1–3 أيام" },
  },
};
/** Pick the best-matching locale entry; falls back to id-ID. */
function getVehicleMeta(id: string, locale: string): VehicleMetaEntry {
  const entry = VEHICLE_META_I18N[id] ?? VEHICLE_META_I18N["cdd-long"];
  return entry[locale] ?? entry["en-US"] ?? entry["id-ID"];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VEHICLES: Vehicle[] = [
  { id: "mobil",          name: "Mobil",         description: "", panjang: 300,  lebar: 130, tinggi: 130, kapasitasKg: 400,   volumeM3: 0.5,  hargaDasar: 250_000,   icon: <TruckSVG size="sm" variant="mobil" /> },
  { id: "mobil-xl",       name: "Mobil XL",      description: "", panjang: 350,  lebar: 150, tinggi: 150, kapasitasKg: 600,   volumeM3: 0.8,  hargaDasar: 350_000,   icon: <TruckSVG size="sm" variant="mobil-xl" /> },
  { id: "van",            name: "Van",            description: "", panjang: 450,  lebar: 170, tinggi: 170, kapasitasKg: 1200,  volumeM3: 1.3,  hargaDasar: 500_000,   icon: <TruckSVG size="sm" variant="van" /> },
  { id: "pickup-kecil",   name: "Pickup Kecil",  description: "", panjang: 350,  lebar: 170, tinggi: 50,  kapasitasKg: 800,   volumeM3: 0.3,  hargaDasar: 400_000,   icon: <TruckSVG size="sm" variant="pickup-kecil" /> },
  { id: "box-kecil",      name: "Box Kecil",     description: "", panjang: 380,  lebar: 170, tinggi: 170, kapasitasKg: 1500,  volumeM3: 1.1,  hargaDasar: 550_000,   icon: <TruckSVG size="sm" variant="box-kecil" /> },
  { id: "engkel",         name: "Engkel",         description: "", panjang: 430,  lebar: 185, tinggi: 200, kapasitasKg: 3500,  volumeM3: 8.0,  hargaDasar: 1_200_000, icon: <TruckSVG size="sm" variant="engkel" /> },
  { id: "double-engkel",  name: "Double Engkel", description: "", panjang: 480,  lebar: 200, tinggi: 210, kapasitasKg: 5000,  volumeM3: 12.0, hargaDasar: 1_800_000, icon: <TruckSVG size="sm" variant="double-engkel" /> },
  { id: "cdd-long",       name: "CDD Long",      description: "", panjang: 530,  lebar: 200, tinggi: 210, kapasitasKg: 6000,  volumeM3: 22.3, hargaDasar: 2_500_000, icon: <TruckSVG size="sm" variant="cdd-long" /> },
  { id: "fuso",           name: "Fuso",           description: "", panjang: 550,  lebar: 230, tinggi: 230, kapasitasKg: 8000,  volumeM3: 29.0, hargaDasar: 3_500_000, icon: <TruckSVG size="sm" variant="fuso" /> },
  { id: "tronton",        name: "Tronton",        description: "", panjang: 700,  lebar: 240, tinggi: 240, kapasitasKg: 15000, volumeM3: 40.0, hargaDasar: 5_000_000, icon: <TruckSVG size="sm" variant="tronton" /> },
  { id: "truk-trailer",   name: "Truk Trailer",  description: "", panjang: 1200, lebar: 240, tinggi: 260, kapasitasKg: 30000, volumeM3: 75.0, hargaDasar: 9_000_000, icon: <TruckSVG size="sm" variant="truk-trailer" /> },
  { id: "truk-reefer",    name: "Truk Reefer",   description: "", panjang: 700,  lebar: 240, tinggi: 240, kapasitasKg: 15000, volumeM3: 40.0, hargaDasar: 6_500_000, icon: <TruckSVG size="sm" variant="truk-reefer" /> },
];

// ─── Vehicle descriptions (translated object) ─────────────────────────────────
const VEHICLE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  "mobil":         { "id-ID": "Cocok untuk pengiriman kecil dalam kota",                           "en-US": "Suitable for small city deliveries",                       "zh-CN": "适合小型城市配送",                              "fr-FR": "Adapté aux petites livraisons en ville",                       "ar-SA": "مناسب للتوصيل الصغير داخل المدينة" },
  "mobil-xl":      { "id-ID": "Kapasitas lebih besar untuk barang medium",                         "en-US": "Larger capacity for medium-sized items",                   "zh-CN": "更大容量适合中型货物",                           "fr-FR": "Plus grande capacité pour articles de taille moyenne",          "ar-SA": "سعة أكبر للبضائع المتوسطة" },
  "van":           { "id-ID": "Ideal untuk barang banyak dan tertutup",                            "en-US": "Ideal for large quantities of enclosed goods",             "zh-CN": "适合大量封闭货物",                               "fr-FR": "Idéal pour grandes quantités de marchandises fermées",          "ar-SA": "مثالي لكميات كبيرة من البضائع المغلقة" },
  "pickup-kecil":  { "id-ID": "Bak terbuka, cocok untuk material",                                "en-US": "Open bed, great for building materials",                   "zh-CN": "开放式货床，适合建筑材料",                        "fr-FR": "Plateau ouvert, idéal pour les matériaux de construction",      "ar-SA": "صندوق مفتوح، مناسب لمواد البناء" },
  "box-kecil":     { "id-ID": "Box tertutup untuk barang sensitif",                               "en-US": "Fully enclosed box for sensitive goods",                   "zh-CN": "全封闭厢式适合敏感货物",                          "fr-FR": "Boîte entièrement fermée pour marchandises sensibles",          "ar-SA": "صندوق مغلق تماماً للبضائع الحساسة" },
  "engkel":        { "id-ID": "Truk ringan untuk pengiriman antar kota",                           "en-US": "Light truck for inter-city deliveries",                    "zh-CN": "轻型卡车适合城际配送",                           "fr-FR": "Camionnette légère pour livraisons intercités",                 "ar-SA": "شاحنة خفيفة للتوصيل بين المدن" },
  "double-engkel": { "id-ID": "Kapasitas lebih besar dari engkel biasa",                          "en-US": "Larger capacity than standard light truck",                "zh-CN": "容量大于标准轻型卡车",                           "fr-FR": "Plus grande capacité que la camionnette légère standard",       "ar-SA": "سعة أكبر من الشاحنة الخفيفة القياسية" },
  "cdd-long":      { "id-ID": "Cocok untuk pengiriman dalam jumlah besar dan jarak jauh",         "en-US": "Suitable for large-volume long-distance shipments",         "zh-CN": "适合大量长途运输",                               "fr-FR": "Adapté aux expéditions longue distance en grands volumes",      "ar-SA": "مناسب للشحنات الضخمة لمسافات طويلة" },
  "fuso":          { "id-ID": "Truk medium untuk muatan berat",                                   "en-US": "Medium truck for heavy loads",                             "zh-CN": "中型卡车适合重型载重",                           "fr-FR": "Camion moyen pour lourdes charges",                             "ar-SA": "شاحنة متوسطة للأحمال الثقيلة" },
  "tronton":       { "id-ID": "Truk besar untuk kapasitas industri",                              "en-US": "Large truck for industrial-scale capacity",                "zh-CN": "大型卡车适合工业规模容量",                        "fr-FR": "Grand camion pour capacité industrielle",                       "ar-SA": "شاحنة كبيرة للسعة الصناعية" },
  "truk-trailer":  { "id-ID": "Untuk pengiriman besar lintas pulau",                              "en-US": "For large cross-island shipments",                         "zh-CN": "适合大型跨岛运输",                               "fr-FR": "Pour grandes expéditions trans-île",                            "ar-SA": "للشحنات الكبيرة عبر الجزر" },
  "truk-reefer":   { "id-ID": "Berpendingin untuk produk segar & farmasi",                        "en-US": "Refrigerated for fresh & pharmaceutical products",         "zh-CN": "冷藏适合新鲜和制药产品",                          "fr-FR": "Réfrigéré pour produits frais et pharmaceutiques",              "ar-SA": "مبرد للمنتجات الطازجة والصيدلانية" },
};
function getVehicleDesc(id: string, locale: string): string {
  const d = VEHICLE_DESCRIPTIONS[id];
  return d?.[locale] ?? d?.["en-US"] ?? d?.["id-ID"] ?? "";
}

const AREAS = [
  { value: "jawa-sumatra",  label: "Jawa, Sumatra" },
  { value: "kalimantan",    label: "Kalimantan" },
  { value: "sulawesi",      label: "Sulawesi" },
  { value: "bali-nusra",   label: "Bali & Nusa Tenggara" },
];

const JENIS_BARANG = [
  "Elektronik", "Furniture", "Pakaian & Tekstil", "Makanan & Minuman",
  "Bahan Bangunan", "Alat Berat", "Kimia & Industri", "Farmasi",
  "Dokumen & Kertas", "Barang Berbahaya", "Lainnya",
];
// ─── Translated display labels for JENIS_BARANG (value stays id-ID for API) ───
const JENIS_BARANG_LABELS: Record<string, string[]> = {
  "id-ID": ["Elektronik", "Furniture", "Pakaian & Tekstil", "Makanan & Minuman", "Bahan Bangunan", "Alat Berat", "Kimia & Industri", "Farmasi", "Dokumen & Kertas", "Barang Berbahaya", "Lainnya"],
  "en-US": ["Electronics", "Furniture", "Clothing & Textiles", "Food & Beverages", "Building Materials", "Heavy Equipment", "Chemical & Industrial", "Pharmaceuticals", "Documents & Paper", "Hazardous Goods", "Other"],
  "zh-CN": ["电子产品", "家具", "服装与纺织品", "食品饮料", "建筑材料", "重型设备", "化工与工业品", "药品", "文件与纸张", "危险品", "其他"],
  "fr-FR": ["Électronique", "Mobilier", "Vêtements & Textiles", "Alimentation & Boissons", "Matériaux de Construction", "Équipement Lourd", "Chimie & Industrie", "Pharmaceutique", "Documents & Papier", "Marchandises Dangereuses", "Autres"],
  "ar-SA": ["إلكترونيات", "أثاث", "ملابس ومنسوجات", "غذاء ومشروبات", "مواد البناء", "معدات ثقيلة", "كيمياء وصناعة", "أدوية", "وثائق وورق", "بضائع خطرة", "أخرى"],
};

// ─── Spec dimension labels (translated object) ────────────────────────────────
const SPEC_LABELS: Record<string, { panjang: string; lebar: string; tinggi: string; kapasitas: string; volume: string }> = {
  "id-ID": { panjang: "Panjang",   lebar: "Lebar",   tinggi: "Tinggi",   kapasitas: "Kapasitas",  volume: "Volume" },
  "en-US": { panjang: "Length",    lebar: "Width",   tinggi: "Height",   kapasitas: "Capacity",   volume: "Volume" },
  "zh-CN": { panjang: "长度",       lebar: "宽度",    tinggi: "高度",      kapasitas: "容量",        volume: "体积" },
  "fr-FR": { panjang: "Longueur",  lebar: "Largeur", tinggi: "Hauteur",  kapasitas: "Capacité",   volume: "Volume" },
  "ar-SA": { panjang: "الطول",     lebar: "العرض",   tinggi: "الارتفاع", kapasitas: "السعة",      volume: "الحجم" },
};

const ADDON_LIST = [
  { key: "bantuanMuat",    label: "Bantuan Muat",    labelKey: "truckingPage.addonBantuanMuatLabel",    price: 150_000, desc: "+Rp 150.000" },
  { key: "bantuanBongkar", label: "Bantuan Bongkar", labelKey: "truckingPage.addonBantuanBongkarLabel", price: 150_000, desc: "+Rp 150.000" },
  { key: "asuransi",       label: "Asuransi",       labelKey: "truckingPage.addonAsuransiLabel",       price: 100_000, desc: "+Rp 100.000" },
  { key: "ferry",          label: "Ferry / Penyeberangan",  labelKey: "truckingPage.addonFerryLabel",          price: 500_000, desc: "+Rp 500.000" },
  { key: "tol",            label: "Tol (actual cost)",      labelKey: "truckingPage.addonTolLabel",            price: 0,       desc: "Actual cost" },
  { key: "multiDrop",      label: "Multi-drop",             labelKey: "truckingPage.addonMultiDropLabel",      price: 50_000,  desc: "+Rp 50.000/titik" },
  { key: "urgentDelivery", label: "Urgent Delivery",        labelKey: "truckingPage.addonUrgentLabel",         price: 200_000, desc: "+Rp 200.000" },
  { key: "overnight",      label: "Overnight / Sewa Seharian", labelKey: "truckingPage.addonOvernightLabel",   price: 0,       desc: "Harga seharian" },
] as const;

type AddonKey = (typeof ADDON_LIST)[number]["key"];

interface EstimasiEstimate {
  vehicle_type: string;
  distance_km: number;
  distance_source: "provided" | "matrix_estimate" | "unknown";
  price_per_km: number;
  minimum_charge: number;
  base_price: number;
  base_after_minimum: number;
  surcharge_breakdown: { out_of_city: number; inter_province: number; inter_island: number; total: number };
  extras_breakdown: { loading_helper: number; unloading_helper: number; toll: number; ferry: number; waiting: number; multidrop: number; overnight: number; urgent: number; insurance: number; total: number };
  total_estimate: number;
}
interface EstimasiCandidate {
  vendor_id: number;
  vendor_name: string;
  pricing_id: number;
  estimate: EstimasiEstimate;
}
interface EstimasiApiResult {
  has_data: boolean;
  cheapest: EstimasiCandidate | null;
  candidates: EstimasiCandidate[];
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VehicleCard({ v, selected, onClick, imageUrl }: { v: Vehicle; selected: boolean; onClick: () => void; imageUrl?: string }) {
  const cap = v.kapasitasKg >= 1000
    ? `${(v.kapasitasKg / 1000).toFixed(0)}t`
    : `${v.kapasitasKg}kg`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 px-3 py-3.5 rounded-2xl border-2 transition-all duration-200 shrink-0 min-w-[100px] group relative",
        selected
          ? "border-blue-600 bg-blue-50/60 shadow-lg shadow-blue-100/80"
          : "border-slate-100 bg-transparent hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-md",
      )}
    >
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
          <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      <div className="w-20 h-14 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={v.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            style={{ filter: "saturate(1.4) brightness(1.08) contrast(1.06) drop-shadow(0 2px 6px rgba(59,130,246,0.35))" }} />
        ) : (
          <div className={cn("transition-all duration-300 scale-125", selected ? "scale-150" : "group-hover:scale-150")}>{v.icon}</div>
        )}
      </div>
      <span className={cn(
        "text-[10px] font-bold leading-tight text-center tracking-wide",
        selected ? "text-blue-700" : "text-slate-600 group-hover:text-blue-600"
      )}>
        {v.name}
      </span>
      <span className={cn(
        "text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide",
        selected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
      )}>
        {cap}
      </span>
    </button>
  );
}

function Counter({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-2 h-11 border border-slate-200 rounded-xl px-2 bg-white shadow-sm">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="text-slate-400 hover:text-blue-600 transition-colors">
        <MinusCircle className="h-5 w-5" />
      </button>
      <span className="w-8 text-center font-semibold text-slate-800 text-sm">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="text-slate-400 hover:text-blue-600 transition-colors">
        <PlusCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

function BRow({ label, value, note, bold, dim }: {
  label: string;
  value: string | React.ReactNode;
  note?: string;
  bold?: boolean;
  dim?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-2 text-[12.5px]", bold && "pt-3")}>
      <span className={cn("text-slate-500 shrink-0", bold && "font-semibold text-slate-700")}>{label}</span>
      <div className="text-right">
        <span className={cn("font-medium text-slate-800 text-right", dim && "text-slate-300", bold && "text-blue-600 text-[17px] font-bold")}>{value}</span>
        {note && <span className="block text-[10px] text-slate-400 mt-0.5">{note}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm shadow-blue-200">{icon}</span>
      <span className="text-[13px] font-black text-slate-700 uppercase tracking-widest">{children}</span>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11.5px] font-semibold text-slate-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const INPUT_CLS = "h-10 text-[13px] rounded-xl border-slate-200 focus-visible:ring-blue-400 bg-white";

function SelectField({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-slate-200 rounded-xl h-10 pl-3 pr-8 text-[13px] bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TruckingPage() {
  const { t, locale } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(VEHICLES[7]);

  const { data: vehicleImages = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/vehicle-images"],
    queryFn: () => fetch("/api/settings/vehicle-images").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vehicleOrder = [] } = useQuery<string[]>({
    queryKey: ["/api/settings/vehicle-order"],
    queryFn: () => fetch("/api/settings/vehicle-order").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const orderedVehicles = (() => {
    if (!vehicleOrder.length) return VEHICLES;
    const byId = Object.fromEntries(VEHICLES.map(v => [v.id, v]));
    const ordered = vehicleOrder.map(id => byId[id]).filter(Boolean);
    const rest = VEHICLES.filter(v => !vehicleOrder.includes(v.id));
    return [...ordered, ...rest];
  })();

  const [selectedArea, setSelectedArea]     = useState(AREAS[0].value);
  const [showCalc, setShowCalc]             = useState(false);
  const [activeTab, setActiveTab]           = useState<"dasar" | "seharian">("dasar");
  const scrollRef = useRef<HTMLDivElement>(null);
  const calcRef   = useRef<HTMLDivElement>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [areaPickup,   setAreaPickup]   = useState("");
  const [alamatPickup, setAlamatPickup] = useState("");
  const [picPickup,    setPicPickup]    = useState("");
  const [hpPickup,     setHpPickup]     = useState("");

  const [areaDel,      setAreaDel]      = useState("");
  const [alamatDel,    setAlamatDel]    = useState("");
  const [picPenerima,  setPicPenerima]  = useState("");
  const [hpPenerima,   setHpPenerima]   = useState("");

  const [jadwalType, setJadwalType]     = useState<"sekarang" | "nanti">("sekarang");
  const [tanggal,    setTanggal]        = useState("");
  const [jam,        setJam]            = useState("");

  const [jenisBarang, setJenisBarang]   = useState("");
  const [berat,       setBerat]         = useState("");
  const [jumlahKoli,  setJumlahKoli]    = useState("");
  const [volume,      setVolume]        = useState("");
  const [catatan,     setCatatan]       = useState("");

  const [jumlahTrip, setJumlahTrip]     = useState(1);

  const [addons, setAddons] = useState<Record<AddonKey, boolean>>({
    bantuanMuat: false, bantuanBongkar: false, asuransi: false,
    ferry: false, tol: false, multiDrop: false, urgentDelivery: false, overnight: false,
  });

  const [showEstimasi, setShowEstimasi]       = useState(false);
  const [estimasiLoading, setEstimasiLoading] = useState(false);
  const [estimasiData, setEstimasiData]       = useState<EstimasiApiResult | null>(null);
  const [estimasiApiError, setEstimasiApiError] = useState<string | null>(null);
  const [submitting, setSubmitting]           = useState(false);
  const [bookingNumber, setBookingNumber]     = useState<string | null>(null);
  const [submitError, setSubmitError]         = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function scrollVehicles(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  function toggleAddon(key: AddonKey) {
    setAddons((p) => ({ ...p, [key]: !p[key] }));
  }

  async function fetchEstimasi() {
    if (!areaPickup || !areaDel) {
      setEstimasiApiError("Pilih area pickup dan delivery terlebih dahulu.");
      setShowEstimasi(true);
      return;
    }
    setEstimasiLoading(true);
    setEstimasiApiError(null);
    setEstimasiData(null);
    setShowEstimasi(true);
    try {
      const res = await fetch("/api/vendor-trucking-pricing/public-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type:          selectedVehicle.id,
          pickup_area:           areaPickup,
          delivery_area:         areaDel,
          pickup_address:        alamatPickup,
          delivery_address:      alamatDel,
          is_different_province: areaPickup !== areaDel,
          is_different_island:   areaPickup !== areaDel,
          with_loading_helper:   addons.bantuanMuat,
          with_unloading_helper: addons.bantuanBongkar,
          extra_drops:           addons.multiDrop ? 1 : 0,
          overnight_nights:      addons.overnight ? 1 : 0,
          is_urgent:             addons.urgentDelivery,
          cargo_value:           0,
        }),
      });
      const data = await res.json() as EstimasiApiResult | { error: string };
      if (!res.ok) throw new Error((data as { error: string }).error ?? "Gagal menghitung estimasi");
      setEstimasiData(data as EstimasiApiResult);
    } catch (e: unknown) {
      setEstimasiApiError(e instanceof Error ? e.message : "Terjadi kesalahan, coba lagi");
    } finally {
      setEstimasiLoading(false);
      setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }
  }

  function handleCekOngkir() {
    setShowCalc(true);
    setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  async function submitBooking() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cheapest = estimasiData?.cheapest ?? null;
      const res = await fetch("/api/trucking/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vehicleType:          selectedVehicle.id,
          vehicleName:          selectedVehicle.name,
          areaPickup,
          alamatPickup,
          picPickup,
          hpPickup,
          areaDelivery:         areaDel,
          alamatDelivery:       alamatDel,
          picPenerima,
          hpPenerima,
          jadwalType,
          tanggalPickup:        jadwalType === "nanti" ? tanggal : undefined,
          jamPickup:            jadwalType === "nanti" ? jam : undefined,
          jenisBarang:          jenisBarang || undefined,
          beratKg:              berat ? parseFloat(berat) : undefined,
          jumlahKoli:           jumlahKoli ? parseInt(jumlahKoli) : undefined,
          volumeM3:             volume ? parseFloat(volume) : undefined,
          catatan:              catatan || undefined,
          jumlahTrip,
          addons,
          estimasiTotal:        cheapest?.estimate?.total_estimate ?? totalEstimasi,
          estimatedDistanceKm:  cheapest?.estimate?.distance_km,
          estimatedPrice:       cheapest?.estimate?.total_estimate,
          pricingBreakdown:     cheapest?.estimate ?? undefined,
          candidateVendorIds:   estimasiData?.candidates?.map((c) => c.vendor_id),
          selectedVendorId:     cheapest?.vendor_id,
          source:               "customer_portal",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Gagal mengirim order");
      }
      const data = await res.json() as { bookingNumber: string; status: string };
      setBookingNumber(data.bookingNumber);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Terjadi kesalahan, coba lagi");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Calculation ─────────────────────────────────────────────────────────────

  const biayaDasar = addons.overnight
    ? selectedVehicle.hargaDasar * 3
    : selectedVehicle.hargaDasar;

  const biayaPerTrip  = biayaDasar * jumlahTrip;
  const biayaTambahan =
    (addons.bantuanMuat    ? 150_000 : 0) +
    (addons.bantuanBongkar ? 150_000 : 0) +
    (addons.asuransi       ? 100_000 : 0) +
    (addons.ferry          ? 500_000 : 0) +
    (addons.multiDrop      ?  50_000 : 0) +
    (addons.urgentDelivery ? 200_000 : 0);

  const totalEstimasi = biayaPerTrip + biayaTambahan;

  const selectedAreaLabel = AREAS.find((a) => a.value === selectedArea)?.label ?? "";
  const vehiclePhotoSrc   = resolveVehicleImg(vehicleImages[selectedVehicle.id], VEHICLE_PHOTOS[selectedVehicle.id]);
  const vehicleMeta       = getVehicleMeta(selectedVehicle.id, locale);

  // ── Spec items ──────────────────────────────────────────────────────────────
  const sl = SPEC_LABELS[locale] ?? SPEC_LABELS["en-US"];
  const specs = [
    { label: sl.panjang,   value: `${selectedVehicle.panjang} cm`,  icon: <Ruler className="h-4 w-4" />,  color: "bg-blue-50 text-blue-500" },
    { label: sl.lebar,     value: `${selectedVehicle.lebar} cm`,    icon: <Ruler className="h-4 w-4" />,  color: "bg-violet-50 text-violet-500" },
    { label: sl.tinggi,    value: `${selectedVehicle.tinggi} cm`,   icon: <Ruler className="h-4 w-4" />,  color: "bg-indigo-50 text-indigo-500" },
    { label: sl.kapasitas, value: selectedVehicle.kapasitasKg >= 1000
        ? `${(selectedVehicle.kapasitasKg / 1000).toFixed(1)} ton`
        : `${selectedVehicle.kapasitasKg.toLocaleString("id-ID")} kg`,
      icon: <Weight className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-500" },
    { label: sl.volume,    value: `${selectedVehicle.volumeM3} m³`, icon: <Boxes className="h-4 w-4" />, color: "bg-amber-50 text-amber-500" },
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <style>{`
        @keyframes floatTruck {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-15px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-15px,20px) scale(1.05); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .truck-float { animation: floatTruck 4.5s ease-in-out infinite; }
        .glow-pulse  { animation: glowPulse 4.5s ease-in-out infinite; }
        .orb-1 { animation: orb1 7s ease-in-out infinite; }
        .orb-2 { animation: orb2 9s ease-in-out infinite; }
        .fade-slide-up { animation: fadeSlideUp 0.5s ease both; }
        .hero-dot-grid {
          background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <PageSeo path="/trucking" />

      {/* ── Breadcrumb ── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/jasa")}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all shrink-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> {t("truckingPage.kembali")}
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-slate-400 font-medium">{t("truckingPage.jasaLayanan")}</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-800 font-bold">{t("truckingPage.jasaTrucking")}</span>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 tracking-wide">{t("truckingPage.armadaTersedia")}</span>
          </div>
        </div>
      </div>

      {/* ── Sticky Vehicle Selector ── */}
      <div className="bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-30 border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Location row */}
          <div className="flex items-center gap-3 mb-3.5">
            <div className="flex items-center gap-1.5 bg-blue-600 rounded-lg px-3 py-1.5 shrink-0">
              <MapPin className="h-3 w-3 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{t("truckingPage.lokasi")}</span>
            </div>
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="appearance-none bg-white border-2 border-slate-100 hover:border-blue-200 rounded-xl pl-3 pr-8 py-1.5 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm transition-colors"
              >
                {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="ml-auto hidden md:flex items-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /> 4.9/5</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {t("truckingPage.pengirimanStatShort")}</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-500" /> {t("truckingPage.verified")}</span>
            </div>
          </div>

          {/* Scrollable vehicle cards */}
          <div className="relative flex items-center gap-2">
            <button type="button" onClick={() => scrollVehicles("left")}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-white border-2 border-slate-100 shadow-sm hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 z-10 group">
              <ChevronLeft className="h-4 w-4 text-slate-500 group-hover:text-white" />
            </button>
            <div ref={scrollRef}
              className="flex gap-2 overflow-x-auto flex-1 py-1 px-0.5"
              style={{ scrollbarWidth: "none" }}>
              {orderedVehicles.map((v) => (
                <VehicleCard key={v.id} v={v} selected={selectedVehicle.id === v.id}
                  imageUrl={resolveVehicleImg(vehicleImages[v.id], VEHICLE_PHOTOS[v.id])}
                  onClick={() => { setSelectedVehicle(v); setShowCalc(false); setShowEstimasi(false); }} />
              ))}
            </div>
            <button type="button" onClick={() => scrollVehicles("right")}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-white border-2 border-slate-100 shadow-sm hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 z-10 group">
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* ── HERO VEHICLE CARD ── */}
            <div className="relative bg-slate-950 rounded-[28px] overflow-hidden shadow-2xl min-h-[460px] fade-slide-up">
              {/* Dot grid texture */}
              <div className="absolute inset-0 hero-dot-grid opacity-60" />

              {/* Ambient orbs — more vivid */}
              <div className="orb-1 absolute -top-16 -left-16 w-80 h-80 rounded-full bg-blue-500/35 blur-3xl pointer-events-none" />
              <div className="orb-2 absolute -bottom-16 -right-8 w-96 h-96 rounded-full bg-indigo-400/25 blur-3xl pointer-events-none" />
              <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              {/* Blurred bg photo — more saturated & brighter for vivid ambient color */}
              {vehiclePhotoSrc && (
                <img
                  src={vehiclePhotoSrc}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  style={{ filter: "blur(35px) saturate(2.5) brightness(1.2) contrast(1.1)" }}
                />
              )}

              {/* Top row — badges */}
              <div className="relative z-10 flex items-center justify-between p-7 pb-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-300 tracking-widest uppercase">{t("truckingPage.armadaAktif")}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-3 py-1.5">
                    <BadgeCheck className="h-3 w-3 text-blue-300" />
                    <span className="text-[10px] font-black text-blue-300 tracking-wide uppercase">{t("truckingPage.verified")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1.5">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-black text-amber-300">4.9</span>
                </div>
              </div>

              {/* Truck image — full width, no side padding */}
              <div className="relative z-10 w-full" style={{ minHeight: 280 }}>
                {/* Glow behind truck — multi-layer, vivid */}
                <div
                  className="glow-pulse absolute inset-x-0 top-4 bottom-0 pointer-events-none"
                  style={{
                    background: [
                      "radial-gradient(ellipse at 50% 75%, rgba(56,189,248,0.35) 0%, rgba(59,130,246,0.25) 30%, transparent 68%)",
                    ].join(", "),
                    filter: "blur(20px)",
                  }}
                />
                {/* Floor reflection glow */}
                <div
                  className="absolute inset-x-8 bottom-0 h-16 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.25) 0%, transparent 70%)",
                    filter: "blur(12px)",
                  }}
                />
                {vehiclePhotoSrc ? (
                  <div className="truck-float w-full">
                    <img
                      src={vehiclePhotoSrc}
                      alt={selectedVehicle.name}
                      className="w-full object-contain"
                      style={{
                        maxHeight: 320,
                        filter: [
                          "saturate(1.55)",
                          "brightness(1.12)",
                          "contrast(1.08)",
                          "drop-shadow(0 20px 56px rgba(56,189,248,0.55))",
                          "drop-shadow(0 4px 20px rgba(99,179,237,0.45))",
                          "drop-shadow(0 0 12px rgba(147,210,255,0.25))",
                        ].join(" "),
                      }}
                    />
                  </div>
                ) : (
                  <div className="truck-float flex items-center justify-center py-8 scale-150">
                    <TruckSVG size="lg" variant={selectedVehicle.id} />
                  </div>
                )}
              </div>

              {/* Bottom overlay — vehicle info */}
              <div className="relative z-10">
                {/* Glass divider */}
                <div className="h-px mx-6 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="p-7 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1.5">
                        {selectedAreaLabel} · {t("truckingPage.jasaTrucking")}
                      </p>
                      <h1 className="text-[36px] font-black text-white tracking-tight leading-none mb-2">
                        {selectedVehicle.name}
                      </h1>
                      <p className="text-[13px] text-slate-400 font-medium leading-snug max-w-xs">
                        {getVehicleDesc(selectedVehicle.id, locale)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider mb-1">{t("truckingPage.mulaiDari")}</p>
                      <p className="text-[28px] font-black text-white leading-none tracking-tight">
                        {formatRp(selectedVehicle.hargaDasar)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{t("truckingPage.perTripSuffix")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TRUST METRICS BAR ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "1.200+",  label: t("truckingPage.bisniAktif"),    icon: <Users className="h-5 w-5" />,      color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
                { value: "50.000+", label: t("truckingPage.pengirimanStat"), icon: <Truck className="h-5 w-5" />,      color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                { value: "4.9/5",   label: t("truckingPage.ratingRataRata"), icon: <Star className="h-5 w-5" />,       color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100" },
                { value: "99.2%",   label: t("truckingPage.onTimeRate"),     icon: <TrendingUp className="h-5 w-5" />, color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100" },
              ].map(({ value, label, icon, color, bg, border }) => (
                <div key={label}
                  className={`bg-white rounded-2xl border ${border} p-5 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-default group hover:-translate-y-0.5`}>
                  <div className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center ${color} transition-transform duration-200 group-hover:scale-110`}>
                    {icon}
                  </div>
                  <p className={`text-[22px] font-black ${color} leading-none tracking-tight`}>{value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">{label}</p>
                </div>
              ))}
            </div>

            {/* ── SPEC CARDS ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("truckingPage.techSpec")}</p>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedVehicle.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-600">{t("truckingPage.verified")}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {specs.map(({ label, value, icon, color }) => (
                  <div key={label}
                    className="group flex flex-col items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                    <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-[19px] font-black text-slate-800 leading-none">{value}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-5 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[11.5px] text-amber-700 font-medium">
                  {t("truckingPage.dimensiNote")}
                </p>
              </div>
            </div>

            {/* ── SHIPMENT TIMELINE ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("truckingPage.flowSection")}</p>
              <h3 className="text-lg font-black text-slate-900 mb-7">{t("truckingPage.prosesPemesanan")}</h3>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 hidden sm:block" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  {[
                    { step: "01", title: t("truckingPage.step1Title"),  desc: t("truckingPage.step1Desc"), icon: <Truck className="h-5 w-5" />, color: "bg-blue-600", light: "bg-blue-50 text-blue-600 border-blue-200" },
                    { step: "02", title: t("truckingPage.cekOngkir"),    desc: t("truckingPage.step2Desc"),   icon: <Calculator className="h-5 w-5" />, color: "bg-indigo-600", light: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                    { step: "03", title: t("truckingPage.step3Title"),    desc: t("truckingPage.step3Desc"),   icon: <BadgeCheck className="h-5 w-5" />, color: "bg-violet-600", light: "bg-violet-50 text-violet-600 border-violet-200" },
                    { step: "04", title: t("truckingPage.step4Title"), desc: t("truckingPage.step4Desc"),     icon: <Navigation className="h-5 w-5" />, color: "bg-emerald-600", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                  ].map(({ step, title, desc, icon, color, light }) => (
                    <div key={step} className="flex flex-col items-center text-center gap-3 group">
                      <div className={`relative h-10 w-10 ${color} rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                        {icon}
                        <span className={`absolute -top-2 -right-2 h-5 w-5 rounded-full border-2 border-white ${color} flex items-center justify-center`}>
                          <span className="text-[8px] font-black text-white">{step}</span>
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-slate-800">{title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ABOUT FLEET ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("truckingPage.profilArmada")}</p>
              <h3 className="text-lg font-black text-slate-900 mb-6">{t("truckingPage.tentangArmada").replace("{name}", selectedVehicle.name)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </span>
                    {t("truckingPage.bestFor")}
                  </p>
                  <ul className="space-y-3">
                    {vehicleMeta.bestFor.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-slate-700">
                        <div className="h-5 w-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5">
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Award className="h-3.5 w-3.5 text-white" />
                    </span>
                    {t("truckingPage.advantages")}
                  </p>
                  <ul className="space-y-3">
                    {vehicleMeta.advantages.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[13px] text-slate-700">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── SERVICE GUARANTEES ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t("truckingPage.standardService")}</p>
              <h3 className="text-lg font-black text-slate-900 mb-6">{t("truckingPage.jaminanEnterprise")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <BadgeCheck className="h-5 w-5" />,   label: t("truckingPage.guarArmadaLabel"),  desc: t("truckingPage.guarArmadaDesc"), bg: "bg-blue-50",    icon_color: "text-blue-600",    border: "border-blue-100",    hover: "hover:border-blue-200 hover:bg-blue-50" },
                  { icon: <Users className="h-5 w-5" />,         label: t("truckingPage.guarSopirLabel"),     desc: t("truckingPage.guarSopirDesc"),     bg: "bg-violet-50",  icon_color: "text-violet-600",  border: "border-violet-100",  hover: "hover:border-violet-200 hover:bg-violet-50" },
                  { icon: <Navigation className="h-5 w-5" />,    label: t("truckingPage.guarGpsLabel"),         desc: t("truckingPage.guarGpsDesc"),   bg: "bg-emerald-50", icon_color: "text-emerald-600", border: "border-emerald-100", hover: "hover:border-emerald-200 hover:bg-emerald-50" },
                  { icon: <Shield className="h-5 w-5" />,        label: t("truckingPage.guarAsuransiLabel"),        desc: t("truckingPage.guarAsuransiDesc"), bg: "bg-orange-50", icon_color: "text-orange-500",  border: "border-orange-100",  hover: "hover:border-orange-200 hover:bg-orange-50" },
                  { icon: <Headphones className="h-5 w-5" />,    label: t("truckingPage.guarSupportLabel"),          desc: t("truckingPage.guarSupportDesc"),   bg: "bg-indigo-50",  icon_color: "text-indigo-600",  border: "border-indigo-100",  hover: "hover:border-indigo-200 hover:bg-indigo-50" },
                  { icon: <Zap className="h-5 w-5" />,           label: t("truckingPage.guarResponsLabel"),       desc: t("truckingPage.guarResponsDesc"),   bg: "bg-amber-50",   icon_color: "text-amber-500",   border: "border-amber-100",   hover: "hover:border-amber-200 hover:bg-amber-50" },
                ].map(({ icon, label, desc, bg, icon_color, border, hover }) => (
                  <div key={label}
                    className={`flex items-center gap-4 border ${border} rounded-2xl p-4 ${hover} transition-all duration-200 cursor-default group hover:-translate-y-0.5 hover:shadow-md`}>
                    <div className={`h-11 w-11 ${bg} ${icon_color} rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 border ${border}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CALCULATOR FORM ── */}
            {showCalc && (
              <div ref={calcRef} className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-7">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{t("truckingPage.shippingCalc")}</h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">{t("truckingPage.fillToCalculate")}</p>
                  </div>
                </div>

                {/* 1. Pickup */}
                <div>
                  <SectionTitle icon={<MapPin className="h-4 w-4" />}>{t("truckingPage.pickupSection")}</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={t("truckingPage.areaPickup")} required>
                      <SelectField value={areaPickup} onChange={setAreaPickup}
                        placeholder={t("truckingPage.phAreaPickup")} options={AREAS} />
                    </FormField>
                    <FormField label={t("truckingPage.pickupAddress")} required>
                      <GooglePlacesAutocomplete
                        value={alamatPickup}
                        onChange={setAlamatPickup}
                        placeholder={t("truckingPage.phAddrPickup")}
                        className={INPUT_CLS}
                      />
                    </FormField>
                    <FormField label={t("truckingPage.picPickup")} required>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                        <Input value={picPickup} onChange={(e) => setPicPickup(e.target.value)}
                          placeholder={t("truckingPage.phPicPickup")}
                          className={cn(INPUT_CLS, "pl-9")} />
                      </div>
                    </FormField>
                    <FormField label={t("truckingPage.hpPickup")} required>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                        <Input type="tel" value={hpPickup} onChange={(e) => setHpPickup(e.target.value)}
                          placeholder="08xx-xxxx-xxxx"
                          className={cn(INPUT_CLS, "pl-9")} />
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* 2. Delivery */}
                <div>
                  <SectionTitle icon={<MapPin className="h-4 w-4" />}>{t("truckingPage.deliverySection")}</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={t("truckingPage.areaDelivery")} required>
                      <SelectField value={areaDel} onChange={setAreaDel}
                        placeholder={t("truckingPage.phAreaDelivery")} options={AREAS} />
                    </FormField>
                    <FormField label={t("truckingPage.deliveryAddress")} required>
                      <GooglePlacesAutocomplete
                        value={alamatDel}
                        onChange={setAlamatDel}
                        placeholder={t("truckingPage.phAddrDelivery")}
                        className={INPUT_CLS}
                      />
                    </FormField>
                    <FormField label={t("truckingPage.picReceiver")} required>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                        <Input value={picPenerima} onChange={(e) => setPicPenerima(e.target.value)}
                          placeholder={t("truckingPage.phPicReceiver")}
                          className={cn(INPUT_CLS, "pl-9")} />
                      </div>
                    </FormField>
                    <FormField label={t("truckingPage.hpReceiver")} required>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                        <Input type="tel" value={hpPenerima} onChange={(e) => setHpPenerima(e.target.value)}
                          placeholder="08xx-xxxx-xxxx"
                          className={cn(INPUT_CLS, "pl-9")} />
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Mini Map */}
                {(alamatPickup || alamatDel) && (
                  <RouteMapPreview origin={alamatPickup} destination={alamatDel} />
                )}

                {/* 3. Jadwal */}
                <div>
                  <SectionTitle icon={<AlarmClock className="h-4 w-4" />}>{t("truckingPage.pickupSchedule")}</SectionTitle>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(["sekarang", "nanti"] as const).map((type) => (
                        <button key={type} type="button" onClick={() => setJadwalType(type)}
                          className={cn(
                            "flex-1 h-11 rounded-xl border-2 text-[13px] font-bold transition-all duration-200",
                            jadwalType === type
                              ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
                          )}>
                          {type === "sekarang" ? t("truckingPage.pickupNow") : t("truckingPage.pickupLater")}
                        </button>
                      ))}
                    </div>
                    {jadwalType === "nanti" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label={t("truckingPage.pickupDate")} required>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                              className={cn(INPUT_CLS, "pl-9")} />
                          </div>
                        </FormField>
                        <FormField label={t("truckingPage.pickupTime")} required>
                          <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-300 pointer-events-none" />
                            <Input type="time" value={jam} onChange={(e) => setJam(e.target.value)}
                              className={cn(INPUT_CLS, "pl-9")} />
                          </div>
                        </FormField>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Detail Barang */}
                <div>
                  <SectionTitle icon={<Boxes className="h-4 w-4" />}>{t("truckingPage.itemDetail")}</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label={t("truckingPage.itemType")} required>
                      <SelectField value={jenisBarang} onChange={setJenisBarang}
                        placeholder={t("truckingPage.phItemType")}
                        options={JENIS_BARANG.map((j, i) => ({ value: j, label: (JENIS_BARANG_LABELS[locale] ?? JENIS_BARANG_LABELS["en-US"])[i] ?? j }))} />
                    </FormField>
                    <FormField label={t("truckingPage.beratKg")} required>
                      <Input type="number" min="0" value={berat} onChange={(e) => setBerat(e.target.value)}
                        placeholder={t("truckingPage.phBerat")} className={INPUT_CLS} />
                    </FormField>
                    <FormField label={t("truckingPage.jumlahKoli")} required>
                      <Input type="number" min="1" value={jumlahKoli} onChange={(e) => setJumlahKoli(e.target.value)}
                        placeholder={t("truckingPage.phKoli")} className={INPUT_CLS} />
                    </FormField>
                    <FormField label={t("truckingPage.volumeOpsional")}>
                      <Input type="number" min="0" step="0.01" value={volume} onChange={(e) => setVolume(e.target.value)}
                        placeholder={t("truckingPage.phVolume")} className={INPUT_CLS} />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label={t("truckingPage.catatanKhusus")}>
                        <Input value={catatan} onChange={(e) => setCatatan(e.target.value)}
                          placeholder={t("truckingPage.phCatatan")} className={INPUT_CLS} />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* 5. Jumlah Trip */}
                <div>
                  <SectionTitle icon={<Truck className="h-4 w-4" />}>{t("truckingPage.tripQty")}</SectionTitle>
                  <div className="flex items-center gap-4">
                    <Counter value={jumlahTrip} onChange={setJumlahTrip} min={1} />
                    <p className="text-[12px] text-slate-400">{t("truckingPage.minimalTrip").replace("{name}", selectedVehicle.name)}</p>
                  </div>
                </div>

                {/* 6. Tambahan Layanan */}
                <div>
                  <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />}>{t("truckingPage.addons")}</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADDON_LIST.map(({ key, labelKey, desc }) => (
                      <label key={key}
                        className={cn(
                          "flex items-center justify-between gap-3 border-2 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200",
                          addons[key]
                            ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                            : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/40",
                        )}>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={addons[key]}
                            onCheckedChange={() => toggleAddon(key)}
                            className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="text-[13px] font-semibold text-slate-700">{t(labelKey)}</span>
                        </div>
                        <span className={cn(
                          "text-[11px] font-semibold shrink-0",
                          addons[key] ? "text-blue-600" : "text-slate-400"
                        )}>{desc}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    {t("truckingPage.addonsNote")}
                  </div>
                </div>

                {/* 7. Hitung Estimasi */}
                <Button type="button" onClick={fetchEstimasi} disabled={estimasiLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-[15px] gap-2.5 shadow-xl shadow-blue-200/60 transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100">
                  {estimasiLoading
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> {t("truckingPage.menghitungEstimasi")}</>
                    : <><Calculator className="h-5 w-5" /> {t("truckingPage.hitungEstimasi")}</>}
                </Button>

                {/* Estimasi Result */}
                {showEstimasi && !bookingNumber && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl p-5">
                    {estimasiLoading && (
                      <div className="flex flex-col items-center justify-center gap-3 py-10">
                        <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium">{t("truckingPage.menghitungHarga")}</p>
                      </div>
                    )}
                    {!estimasiLoading && estimasiApiError && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12.5px] text-red-700">
                          <Info className="h-4 w-4 shrink-0 mt-0.5" />{estimasiApiError}
                        </div>
                        <Button type="button" onClick={fetchEstimasi}
                          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm gap-2">
                          <Calculator className="h-4 w-4" /> {t("truckingPage.cobaLagi")}
                        </Button>
                      </div>
                    )}
                    {!estimasiLoading && estimasiData && !estimasiData.has_data && (
                      <div className="space-y-4 text-center py-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                          <Truck className="h-7 w-7 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-slate-700">{t("truckingPage.noVendors")}</p>
                          <p className="text-[12px] text-slate-400 mt-1">
                            {t("truckingPage.noVendorContact")}
                          </p>
                        </div>
                        {submitError && (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12.5px] text-red-700 text-left">
                            <Info className="h-4 w-4 shrink-0" />{submitError}
                          </div>
                        )}
                        <Button type="button" onClick={submitBooking} disabled={submitting}
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[14px] gap-2 shadow-lg shadow-blue-200 disabled:opacity-60">
                          {submitting
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("truckingPage.mengirim")}</>
                            : <><Send className="h-4 w-4" /> {t("truckingPage.kirimTanpaEstimasi")}</>}
                        </Button>
                      </div>
                    )}
                    {!estimasiLoading && estimasiData?.has_data && estimasiData.cheapest && (() => {
                      const e = estimasiData.cheapest.estimate;
                      const pickupLabel   = AREAS.find((a) => a.value === areaPickup)?.label  ?? areaPickup;
                      const deliveryLabel = AREAS.find((a) => a.value === areaDel)?.label ?? areaDel;
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{t("truckingPage.estimasiHargaTrucking")}</p>
                            {estimasiData.candidates.length > 1 && (
                              <span className="text-[10.5px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                                {estimasiData.candidates.length} {t("truckingPage.vendorHargaTermurah")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-blue-700 font-bold bg-blue-100/60 px-3.5 py-2.5 rounded-xl border border-blue-200">
                            <Truck className="h-3.5 w-3.5 shrink-0" />
                            <span>{estimasiData.cheapest.vendor_name}</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            <BRow label={t("truckingPage.rowArmada")}        value={e.vehicle_type} />
                            <BRow label={t("truckingPage.rowAreaPickup")}   value={pickupLabel} />
                            <BRow label={t("truckingPage.rowAreaDelivery")} value={deliveryLabel} />
                            <BRow label={t("truckingPage.rowEstKm")}   value={`${e.distance_km.toLocaleString("id-ID")} km`}
                              note={e.distance_source === "matrix_estimate" ? t("truckingPage.noteEstKota")
                                : e.distance_source === "provided" ? t("truckingPage.noteJarakAktual") : t("truckingPage.noteJarakTidak")} />
                            <BRow label={t("truckingPage.rowTarifPerKm")}   value={formatRp(e.price_per_km)} />
                            <BRow label={t("truckingPage.rowMinCharge")} value={formatRp(e.minimum_charge)} />
                            <BRow label={t("truckingPage.rowHargaDasar")}    value={formatRp(e.base_after_minimum)} />
                            {e.surcharge_breakdown.out_of_city > 0 && (
                              <BRow label={t("truckingPage.rowSurchargeKota")} value={formatRp(e.surcharge_breakdown.out_of_city)} />
                            )}
                            {e.surcharge_breakdown.inter_province > 0 && (
                              <BRow label={t("truckingPage.rowSurchargeProvinsi")} value={formatRp(e.surcharge_breakdown.inter_province)} />
                            )}
                            {e.surcharge_breakdown.inter_island > 0 && (
                              <BRow label={t("truckingPage.rowSurchargePulau")} value={formatRp(e.surcharge_breakdown.inter_island)} />
                            )}
                            <BRow label={t("truckingPage.rowBiayaMuat")}    value={formatRp(e.extras_breakdown.loading_helper)}   dim={e.extras_breakdown.loading_helper === 0} />
                            <BRow label={t("truckingPage.rowBiayaBongkar")} value={formatRp(e.extras_breakdown.unloading_helper)} dim={e.extras_breakdown.unloading_helper === 0} />
                            <BRow label={t("truckingPage.rowFerry")}         value={formatRp(e.extras_breakdown.ferry)}            dim={e.extras_breakdown.ferry === 0} />
                            <BRow label={t("truckingPage.rowTol")}           value={e.extras_breakdown.toll > 0 ? formatRp(e.extras_breakdown.toll) : t("truckingPage.tolActualCost")} dim={e.extras_breakdown.toll === 0} />
                            <BRow label={t("truckingPage.rowMultidrop")}    value={formatRp(e.extras_breakdown.multidrop)}  dim={e.extras_breakdown.multidrop === 0} />
                            <BRow label={t("truckingPage.rowOvernight")}     value={formatRp(e.extras_breakdown.overnight)}  dim={e.extras_breakdown.overnight === 0} />
                            <BRow label={t("truckingPage.rowAsuransi")}      value={e.extras_breakdown.insurance > 0 ? formatRp(e.extras_breakdown.insurance) : "—"} dim={e.extras_breakdown.insurance === 0} />
                            <BRow label={t("truckingPage.rowUrgent")}        value={formatRp(e.extras_breakdown.urgent)}     dim={e.extras_breakdown.urgent === 0} />
                          </div>
                          <div className="border-t-2 border-blue-200 pt-4 flex items-end justify-between">
                            <p className="text-[12px] text-slate-500 font-bold">{t("truckingPage.totalEstimasi")}</p>
                            <span className="text-[26px] font-black text-blue-600">{formatRp(e.total_estimate)}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 italic">
                            {t("truckingPage.estimasiPpnNote")}
                          </p>
                          {submitError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12.5px] text-red-700">
                              <Info className="h-4 w-4 shrink-0" />{submitError}
                            </div>
                          )}
                          <Button type="button" onClick={submitBooking} disabled={submitting}
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-[15px] gap-2.5 shadow-xl shadow-blue-200 disabled:opacity-60">
                            {submitting
                              ? <><Loader2 className="h-5 w-5 animate-spin" /> {t("truckingPage.mengirimPermintaan")}</>
                              : <><Send className="h-5 w-5" /> {t("truckingPage.orderTrucking")}</>}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Success State */}
                {bookingNumber && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-7 text-center space-y-5">
                    <div className="flex justify-center">
                      <div className="h-20 w-20 rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200">
                        <PartyPopper className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-blue-900">{t("truckingPage.orderBerhasil")}</h3>
                      <p className="text-[13px] text-blue-700 mt-1.5">{t("truckingPage.orderInfo")}</p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-blue-100 px-5 py-4 shadow-sm">
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{t("truckingPage.nomorOrder")}</p>
                      <p className="text-2xl font-black text-slate-800 tracking-wider mt-1">{bookingNumber}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[13px] font-bold text-amber-800">{t("truckingPage.menungguAdmin")}</span>
                    </div>
                    <div className="text-[12px] text-slate-600 space-y-2.5">
                      {[t("truckingPage.notifOperasional"), t("truckingPage.adminReview"), t("truckingPage.simpanNomor")].map((t) => (
                        <div key={t} className="flex items-start gap-2.5 text-left">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                    <Button type="button" onClick={() => setLocation("/")}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm">
                      {t("truckingPage.kembali")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5 lg:sticky lg:top-[152px] lg:self-start">

            {/* ── ENTERPRISE PRICE PANEL ── */}
            <div className="rounded-[28px] overflow-hidden shadow-2xl shadow-blue-900/20 border border-blue-900/10">

              {/* Dark premium header */}
              <div className="relative bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 px-6 pt-6 pb-7 overflow-hidden">
                {/* Subtle orbs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Tab switcher */}
                <div className="relative flex bg-white/8 border border-white/10 rounded-2xl p-1 mb-6 backdrop-blur-sm">
                  {(["dasar", "seharian"] as const).map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200",
                        activeTab === tab
                          ? "bg-white text-blue-800 shadow-lg"
                          : "text-white/40 hover:text-white/70",
                      )}>
                      {tab === "dasar" ? t("truckingPage.perTrip") : t("truckingPage.sewaHarian")}
                    </button>
                  ))}
                </div>

                {/* Price display */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest">
                      {activeTab === "dasar" ? t("truckingPage.mulaiDari") : t("truckingPage.sewaHarian")}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="text-[36px] font-black text-white leading-none tracking-tight">
                    {formatRp(activeTab === "dasar" ? selectedVehicle.hargaDasar : selectedVehicle.hargaDasar * 3)}
                  </div>
                  <p className="text-[12px] text-blue-300/70 mt-2 font-medium">
                    {activeTab === "dasar" ? `/ trip · ${selectedAreaLabel}` : t("truckingPage.perHariTermasuk")}
                  </p>
                </div>

                {/* Value props */}
                <div className="relative mt-6 space-y-3 pt-5 border-t border-white/10">
                  {[
                    { icon: <Timer className="h-3.5 w-3.5" />,     text: t("truckingPage.estimasiDays").replace("{days}", vehicleMeta.deliveryDays), accent: "text-blue-300" },
                    { icon: <Shield className="h-3.5 w-3.5" />,     text: t("truckingPage.cargoInsurance"),      accent: "text-emerald-300" },
                    { icon: <BadgeCheck className="h-3.5 w-3.5" />, text: t("truckingPage.fleetVerified"),        accent: "text-violet-300" },
                    { icon: <Navigation className="h-3.5 w-3.5" />, text: t("truckingPage.gpsTracking"),          accent: "text-indigo-300" },
                    { icon: <Lock className="h-3.5 w-3.5" />,       text: t("truckingPage.encryptedTx"),                accent: "text-slate-300" },
                  ].map(({ icon, text, accent }) => (
                    <div key={text} className="flex items-center gap-3 text-[12.5px]">
                      <span className={`${accent} shrink-0 opacity-90`}>{icon}</span>
                      <span className="text-white/75 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* White card body */}
              <div className="bg-white px-6 py-6 space-y-4">

                {/* Social proof */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex -space-x-2 shrink-0">
                    {[
                      { bg: "bg-gradient-to-br from-blue-400 to-blue-600",    initials: "PT" },
                      { bg: "bg-gradient-to-br from-indigo-400 to-violet-600", initials: "CV" },
                      { bg: "bg-gradient-to-br from-emerald-400 to-teal-600",  initials: "TB" },
                      { bg: "bg-gradient-to-br from-amber-400 to-orange-500",  initials: "PD" },
                    ].map(({ bg, initials }, i) => (
                      <div key={i} className={`h-7 w-7 rounded-full border-2 border-white ${bg} flex items-center justify-center shadow-sm`}>
                        <span className="text-[7px] text-white font-black">{initials}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-slate-800">
                      <span className="text-blue-600">1.200+</span> {t("truckingPage.perusahaanAktifSub")}
                    </p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-1 font-medium">4.9/5</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <button type="button" onClick={handleCekOngkir}
                  className="group w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 shadow-xl shadow-blue-200/70 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-200/50">
                  <Calculator className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                  {t("truckingPage.cekOngkir")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                {/* Secondary CTA */}
                <a
                  href={`https://wa.me/6285121073537?text=Halo%2C%20saya%20ingin%20tanya%20tentang%20armada%20${encodeURIComponent(selectedVehicle.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[13px] font-bold transition-all duration-200 group"
                >
                  <MessageCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  {t("truckingPage.chatSalesWa")}
                </a>

                {/* Trust line */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                    <Lock className="h-3 w-3 text-slate-300" />
                    <span>{t("truckingPage.encrypted")}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                    <Shield className="h-3 w-3 text-slate-300" />
                    <span>{t("truckingPage.freeConsult")}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                    <Headphones className="h-3 w-3 text-slate-300" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MINI TRUST BADGES ── */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: <Shield className="h-5 w-5 text-emerald-500" />,   label: t("truckingPage.verified"), sub: t("truckingPage.fleet100"), bg: "bg-emerald-50 border-emerald-100 hover:border-emerald-200" },
                { icon: <Clock className="h-5 w-5 text-blue-500" />,       label: t("truckingPage.onTimeBadge"),       sub: t("truckingPage.onTimeRateBadge"),     bg: "bg-blue-50 border-blue-100 hover:border-blue-200" },
                { icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500" />, label: t("truckingPage.ratingBadge"), sub: t("truckingPage.ratingValue"),   bg: "bg-amber-50 border-amber-100 hover:border-amber-200" },
              ].map(({ icon, label, sub, bg }) => (
                <div key={label} className={`${bg} border rounded-2xl px-2 py-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-default hover:-translate-y-0.5`}>
                  {icon}
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-700 leading-tight">{label}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── STANDARD SERVICES ── */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("truckingPage.servicePackage")}</p>
                <h4 className="text-[14px] font-black text-slate-900">{t("truckingPage.sudahTermasuk")}</h4>
              </div>
              <div className="px-6 py-5 space-y-5">
                <ul className="space-y-3">
                  {[
                    { icon: <Truck className="h-3.5 w-3.5" />,   text: t("truckingPage.inclVehicle"),   color: "text-blue-500 bg-blue-50" },
                    { icon: <Package className="h-3.5 w-3.5" />, text: t("truckingPage.inclCargo"),     color: "text-indigo-500 bg-indigo-50" },
                    { icon: <Users className="h-3.5 w-3.5" />,   text: t("truckingPage.inclDriver"),    color: "text-violet-500 bg-violet-50" },
                    { icon: <Fuel className="h-3.5 w-3.5" />,    text: t("truckingPage.inclFuel"),      color: "text-orange-500 bg-orange-50" },
                    { icon: <Clock className="h-3.5 w-3.5" />,   text: t("truckingPage.inclWait"),      color: "text-teal-500 bg-teal-50" },
                    { icon: <Shield className="h-3.5 w-3.5" />,  text: t("truckingPage.inclInsurance"), color: "text-emerald-500 bg-emerald-50" },
                  ].map(({ icon, text, color }) => (
                    <li key={text} className="flex items-center gap-3 text-[12.5px] text-slate-600 group">
                      <span className={`h-6 w-6 rounded-lg ${color} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                        {icon}
                      </span>
                      <span className="font-medium">{text}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto shrink-0" />
                    </li>
                  ))}
                </ul>
                <div className="h-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("truckingPage.tambahanOpsional")}</p>
                  <ul className="space-y-2">
                    {["Bantuan Muat / Bongkar", "Ferry / Penyeberangan", "Tol (actual cost)", "Multi-drop", "Urgent Delivery", "Overnight"].map((text) => (
                      <li key={text} className="flex items-center gap-2.5 text-[12px] text-slate-500">
                        <div className="h-4 w-4 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        </div>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ENTERPRISE BOTTOM CTA ── */}
      <div className="relative bg-slate-950 overflow-hidden mt-8">
        {/* Background elements */}
        <div className="absolute inset-0 hero-dot-grid opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        {/* Top border gradient */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Globe className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">{t("truckingPage.enterpriseSolusi")}</span>
          </div>
          <h2 className="text-[36px] sm:text-[44px] font-black text-white leading-tight tracking-tight mb-4">
            {t("truckingPage.enterpriseTitle")}
          </h2>
          <p className="text-[16px] text-slate-400 font-medium leading-relaxed max-w-xl mx-auto mb-10">
            {t("truckingPage.enterpriseSub")}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mb-10">
            {[
              { value: "1.200+",  label: t("truckingPage.klienAktifStat") },
              { value: "50.000+", label: t("truckingPage.pengirimanStat") },
              { value: "99.2%",   label: t("truckingPage.onTimeRate") },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[24px] font-black text-white">{value}</p>
                <p className="text-[11px] text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleCekOngkir}
              className="group h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[15px] gap-2.5 shadow-2xl shadow-blue-900/50 transition-all duration-200 hover:scale-[1.02]">
              <Calculator className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
              {t("truckingPage.requestPenawaran")}
            </Button>
            <a
              href={`https://wa.me/6285121073537?text=Halo%2C%20saya%20ingin%20konsultasi%20solusi%20logistik%20untuk%20perusahaan%20saya`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/8 text-white text-[15px] font-black transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {t("truckingPage.chatWhatsApp")}
            </a>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="sticky bottom-0 z-20">
        {/* Glass bar */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-2xl shadow-slate-900/10 px-4 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left — trust signals */}
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{t("truckingPage.encrypted")}</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>{t("truckingPage.verified")}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                <span>Rating 4.9/5</span>
              </div>
              {/* Mobile: show vehicle name */}
              <div className="sm:hidden">
                <p className="text-[12px] font-black text-slate-800">{selectedVehicle.name}</p>
                <p className="text-[10px] text-slate-500">{formatRp(selectedVehicle.hargaDasar)} / trip</p>
              </div>
            </div>

            {/* Right — CTA */}
            <button type="button" onClick={handleCekOngkir}
              className="group h-11 px-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-[13px] flex items-center gap-2 shadow-lg shadow-blue-200/60 transition-all duration-200 hover:scale-105">
              <Truck className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              {t("truckingPage.orderVehicle").replace("{name}", selectedVehicle.name)}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
