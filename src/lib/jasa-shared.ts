import { supabasePublicAssetUrl } from "@/lib/supabaseStorage";

export interface ServiceHubItem {
  source: "vendor_catalog_item" | "product";
  id: number;
  title: string;
  category: string;
  serviceType: string | null;
  price: number | null;
  unit: string | null;
  targetUrl: string;
  description?: string | null;
  imageUrl?: string | null;
  vendorName?: string | null;
  location?: string | null;
  leadTime?: string | null;
  currency?: string;
  categories?: string[];
  primaryImageUrl?: string | null;
  categoryKey?: string | null;
}

export interface CanonicalPortalService {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  categories: string[];
  price: number;
  basePrice: number | null;
  currency: string;
  estimatedDays: string | null;
  slaHours: number | null;
  isActive: boolean;
}

export const CANONICAL_SERVICE_ROUTES: Record<string, string> = {
  sea_freight: "/ocean-freight-booking",
  air_freight: "/air-freight-booking",
  trucking: "/trucking",
  customs_clearance: "/custom-clearance",
  ppjk_consulting: "/pabean",
};

export function normalizeCanonicalService(raw: unknown): CanonicalPortalService | null {
  const row = raw as Record<string, unknown>;
  const id = Number(row["id"]);
  const code = String(row["code"] ?? "").trim().toLowerCase();
  const name = String(row["name"] ?? "").trim();
  if (!Number.isInteger(id) || id <= 0 || !code || !name) return null;
  const categories = Array.isArray(row["categories"])
    ? (row["categories"] as unknown[]).map((value) => String(value)).filter(Boolean)
    : [];
  const category = row["category"] == null
    ? (categories[0] ?? null)
    : String(row["category"]);
  return {
    id,
    code,
    name,
    description: row["description"] == null ? null : String(row["description"]),
    category,
    categories: category && categories.length === 0 ? [category] : categories,
    price: Number(row["price"] ?? 0),
    basePrice: row["basePrice"] == null ? null : Number(row["basePrice"]),
    currency: String(row["currency"] ?? "IDR"),
    estimatedDays: row["estimatedDays"] == null ? null : String(row["estimatedDays"]),
    slaHours: row["slaHours"] == null ? null : Number(row["slaHours"]),
    isActive: row["isActive"] !== false,
  };
}

export function canonicalServiceTarget(service: CanonicalPortalService): string {
  return CANONICAL_SERVICE_ROUTES[service.code] ?? `/jasa/${service.id}`;
}

export const CATEGORY_PLACEHOLDER: Record<string, { emoji: string; from: string; to: string }> = {
  trucking:    { emoji: "🚛", from: "#1a3a6c", to: "#2a5aaa" },
  sea_freight: { emoji: "🚢", from: "#0c3057", to: "#1a5080" },
  air_freight: { emoji: "✈️", from: "#1a4060", to: "#2a6090" },
  ppjk:        { emoji: "📋", from: "#3a3060", to: "#5a4a90" },
  handling:    { emoji: "🏭", from: "#2a4a2a", to: "#4a7a4a" },
  document:    { emoji: "📄", from: "#3a4a5a", to: "#5a6a7a" },
  exim_service:{ emoji: "🌍", from: "#1a4a4a", to: "#2a7070" },
};

const image = (path: string) =>
  supabasePublicAssetUrl(
    `portal-assets/static/customer-portal/images/${path.replace(/\.(png|jpe?g)$/i, ".webp")}`,
  );

export const SERVICE_PHOTOS: Record<string, string> = {
  sea_freight:        image("sea-freight.png"),
  air_freight:        image("air-freight.png"),
  trucking:           image("banner-trucking-container.png"),
  customs_clearance:  image("customs.png"),
  ppjk_consulting:    image("customs-document.png"),
  emkl:               image("sea-freight.png"),

  // Backward-compatible title aliases for older callers.
  "Sea Freight":             image("sea-freight.png"),
  "Air Freight":             image("air-freight.png"),
  "Domestik":                image("banner-trucking-container.png"),
  "Transportasi & Distribusi Domestik": image("banner-trucking-container.png"),
  "Custom Clearance Proses": image("customs.png"),
  "Konsultan Pabean":        image("customs-document.png"),
  "EMKL":                     image("sea-freight.png"),
};

export const CAT_PHOTOS: Record<string, string> = {
  forwarding: image("port-operations.png"),
  ppjk:       image("customs.png"),
  additional: image("port-operations.png"),
};

export const formatIDR = (v: number): string =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
