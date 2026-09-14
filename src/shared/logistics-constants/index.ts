export const LOGISTICS_SUBCATEGORIES = [
  "Udara", "Laut", "Darat", "Pabean", "Handling",
  "Trucking", "Container", "Freight Forwarding", "Lainnya",
] as const;

export type LogisticsSubcategory = typeof LOGISTICS_SUBCATEGORIES[number];

export const LOGISTICS_UNITS = [
  "pcs", "kg", "cbm", "container", "shipment", "dokumen", "trip", "ton", "hari",
] as const;

export type LogisticsUnit = typeof LOGISTICS_UNITS[number];

export const GROUPED_DISPLAY_CATEGORIES = ["Trucking", "Container"] as const;

export type ServiceCategory = "trucking" | "freight" | "product" | "customs";

export function resolveServiceCategory(serviceType: string): ServiceCategory {
  const t = (serviceType ?? "").toLowerCase();
  if (t.includes("truck") || t.includes("trucking") || t.includes("land")) return "trucking";
  if (t.includes("sea") || t.includes("air") || t.includes("freight") || t.includes("udara") || t.includes("laut") || t.includes("fcl") || t.includes("lcl") || t.includes("door")) return "freight";
  if (t.includes("product") || t.includes("barang") || t.includes("produk")) return "product";
  if (t.includes("custom") || t.includes("ppjk") || t.includes("cukai") || t.includes("handling") || t.includes("bea cukai") || t.includes("dokumen")) return "customs";
  return "freight";
}
