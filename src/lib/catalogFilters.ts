// ── Service category normalisation (mirrors artifacts/api-server/src/routes/portal.ts) ──

const SERVICE_CATEGORY_ALIASES: Record<string, string> = {
  // trucking
  trucking:           "trucking",
  truck:              "trucking",
  "land freight":     "trucking",
  land_freight:       "trucking",
  darat:              "trucking",
  pengiriman_darat:   "trucking",
  "pengiriman darat": "trucking",
  // sea_freight
  "sea freight":      "sea_freight",
  sea_freight:        "sea_freight",
  sea:                "sea_freight",
  ocean:              "sea_freight",
  ocean_freight:      "sea_freight",
  "ocean freight":    "sea_freight",
  fcl:                "sea_freight",
  lcl:                "sea_freight",
  laut:               "sea_freight",
  pengiriman_laut:    "sea_freight",
  "pengiriman laut":  "sea_freight",
  // air_freight
  "air freight":      "air_freight",
  air_freight:        "air_freight",
  air:                "air_freight",
  udara:              "air_freight",
  cargo_udara:        "air_freight",
  "cargo udara":      "air_freight",
  pengiriman_udara:   "air_freight",
  "pengiriman udara": "air_freight",
  // ppjk
  ppjk:               "ppjk",
  customs:            "ppjk",
  custom:             "ppjk",
  pabean:             "ppjk",
  kepabeanan:         "ppjk",
  pib:                "ppjk",
  peb:                "ppjk",
  // handling
  handling:           "handling",
  warehouse:          "handling",
  warehousing:        "handling",
  gudang:             "handling",
  stuffing:           "handling",
  stripping:          "handling",
  loading:            "handling",
  unloading:          "handling",
  // document
  document:           "document",
  documents:          "document",
  dokumen:            "document",
  legal_doc:          "document",
  "legal doc":        "document",
  perizinan:          "document",
};

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  trucking:    "Trucking",
  sea_freight: "Sea Freight",
  air_freight: "Air Freight",
  ppjk:        "PPJK / Customs",
  handling:    "Handling",
  document:    "Document",
};

const SERVICE_CATEGORY_ORDER = ["trucking", "sea_freight", "air_freight", "ppjk", "handling", "document"];

/** Normalize a category value to its canonical key. Returns null for empty input. */
export function normalizeServiceCategory(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim().replace(/[\s-]+/g, "_");
  const withSpaces = normalized.replace(/_/g, " ");
  return (
    SERVICE_CATEGORY_ALIASES[withSpaces] ??
    SERVICE_CATEGORY_ALIASES[normalized] ??
    normalized
  );
}

function toTitleCase(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface ServiceCategoryOption {
  key: string;   // normalized canonical key — sent to API as ?category=
  label: string; // display label
}

/**
 * Extract unique normalized categories from actual service items.
 * Reads: serviceType, kategori, categoryKey, templateSnapshot.serviceType, templateSnapshot.category.
 * Filters out empty/null/duplicate values. Sorts by preferred canonical order.
 */
export function buildServiceCategories(items: MarketplaceItem[]): ServiceCategoryOption[] {
  const seen = new Set<string>();
  const result: ServiceCategoryOption[] = [];

  for (const item of items) {
    const snapshot =
      item.templateSnapshot && typeof item.templateSnapshot === "object"
        ? (item.templateSnapshot as Record<string, unknown>)
        : {};

    const candidates: Array<string | null | undefined> = [
      item.serviceType,
      item.kategori,
      item.categoryKey,
      typeof snapshot["serviceType"] === "string" ? snapshot["serviceType"] : null,
      typeof snapshot["category"] === "string" ? snapshot["category"] : null,
    ];

    for (const raw of candidates) {
      const key = normalizeServiceCategory(raw);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({ key, label: SERVICE_CATEGORY_LABELS[key] ?? toTitleCase(key) });
    }
  }

  result.sort((a, b) => {
    const ai = SERVICE_CATEGORY_ORDER.indexOf(a.key);
    const bi = SERVICE_CATEGORY_ORDER.indexOf(b.key);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.label.localeCompare(b.label);
  });

  return result;
}

// ── Province extraction ────────────────────────────────────────────────────────
// Supports formats: "City, Province", "Province", "city - Province", "Province (code)"
export function extractProvince(location: string | null | undefined): string | null {
  if (!location) return null;
  const cleaned = location.trim();
  // "City, Province" — take everything after last comma
  if (cleaned.includes(",")) {
    return cleaned.split(",").pop()!.trim() || null;
  }
  // "City - Province" — take everything after last dash
  if (cleaned.includes(" - ")) {
    return cleaned.split(" - ").pop()!.trim() || null;
  }
  // Single token — treat the whole string as province
  return cleaned || null;
}

export interface ProductMediaItem {
  id: number;
  vendorCatalogItemId: number | null;
  vendorId: number | null;
  mediaType: string;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  externalUrl: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number;
  isPrimary: boolean;
  isActive: boolean;
  visibility?: string | null;
  documentType?: string | null;
  originalFilename?: string | null;
}

export interface MarketplaceItem {
  id: number;
  vendorId: number;
  vendorName: string | null;
  templateKind: string | null;
  categoryKey: string | null;
  serviceType: string | null;
  templateId: string | null;
  templateSnapshot: unknown;
  name: string;
  description: string | null;
  kategori: string | null;
  subcategory: string | null;
  specValues: unknown;
  priceSell: number | null;
  currency: string;
  unit: string | null;
  moq: number | null;
  stockStatus: string | null;
  stockQty: number | null;
  leadTime: string | null;
  location: string | null;
  origin: string | null;
  validityDate: string | null;
  isFeatured?: boolean;
  documents: unknown;
  publishedAt: string | null;
  sortOrder: number;
  media?: ProductMediaItem[];
  primaryImageUrl?: string | null;
  hasVideo?: boolean;
}

export type FilterType = "select" | "number-range" | "text-search";

export interface FilterFieldDef {
  key: string;
  label: string;
  type: FilterType;
  options?: string[];
  min?: number;
  max?: number;
  source: "template" | "standard";
}

export type ActiveFilters = Record<string, string | string[] | [number | null, number | null] | null>;

function getSpecValues(item: MarketplaceItem): Record<string, unknown> {
  if (!item.specValues || typeof item.specValues !== "object") return {};
  return item.specValues as Record<string, unknown>;
}

function getTemplateFields(snapshot: unknown): Array<{ key: string; label: string; type: string; options?: string[]; section?: string }> {
  if (!snapshot || typeof snapshot !== "object") return [];
  const s = snapshot as Record<string, unknown>;

  if (Array.isArray(s["customFields"])) {
    return s["customFields"] as Array<{ key: string; label: string; type: string; options?: string[] }>;
  }
  if (Array.isArray(s["fields"])) {
    return (s["fields"] as Array<{ key: string; label: string; type: string; options?: string[]; section?: string }>)
      .filter((f) => f.section === "quotation" || f.section === "both");
  }
  return [];
}

export function buildCatalogFilters(
  items: MarketplaceItem[],
  t: (key: string, fallback?: string) => string = (_, fb) => fb ?? _
): FilterFieldDef[] {
  const filters: FilterFieldDef[] = [];

  // ── 1. Standard filters ────────────────────────────────────────────────────
  const vendors = [...new Set(items.map((i) => i.vendorName).filter(Boolean) as string[])];
  if (vendors.length > 1) {
    filters.push({ key: "__vendor", label: "Vendor", type: "select", options: vendors, source: "standard" });
  }

  const stockStatuses = [...new Set(items.map((i) => i.stockStatus).filter(Boolean) as string[])];
  if (stockStatuses.length > 0) {
    filters.push({ key: "__stockStatus", label: t("marketplace.filterLabelStockStatus", "Status Stok"), type: "select", options: stockStatuses, source: "standard" });
  }

  // ── Provinsi filter: extracted from location field ("City, Province" pattern) ──
  const provinces = [
    ...new Set(
      items
        .map((i) => extractProvince(i.location))
        .filter(Boolean) as string[]
    ),
  ].sort();
  if (provinces.length > 1) {
    filters.push({ key: "__province", label: t("marketplace.filterLabelProvince", "Provinsi"), type: "select", options: provinces, source: "standard" });
  }

  const origins = [...new Set(items.map((i) => i.origin).filter(Boolean) as string[])].sort();
  if (origins.length > 1) {
    filters.push({ key: "__origin", label: t("marketplace.filterLabelOrigin", "Asal"), type: "select", options: origins, source: "standard" });
  }

  const prices = items.map((i) => i.priceSell).filter((p) => p !== null) as number[];
  if (prices.length > 0) {
    filters.push({
      key: "__priceSell",
      label: t("marketplace.filterLabelPrice", "Harga Jual"),
      type: "number-range",
      min: Math.min(...prices),
      max: Math.max(...prices),
      source: "standard",
    });
  }

  // ── 2. Template-derived filters ────────────────────────────────────────────
  const templateFieldMap = new Map<string, FilterFieldDef & { _values: Set<string>; _numbers: number[] }>();

  for (const item of items) {
    const fields = getTemplateFields(item.templateSnapshot);
    const specVals = getSpecValues(item);

    for (const field of fields) {
      if (field.type === "textarea" || field.type === "date") continue;

      const existing = templateFieldMap.get(field.key);
      const rawVal = specVals[field.key];

      if (field.type === "select") {
        if (!existing) {
          templateFieldMap.set(field.key, {
            key: field.key,
            label: field.label,
            type: "select",
            options: field.options ?? [],
            source: "template",
            _values: new Set<string>(),
            _numbers: [],
          });
        }
        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
          templateFieldMap.get(field.key)!._values.add(String(rawVal));
        }
      } else if (field.type === "number") {
        if (!existing) {
          templateFieldMap.set(field.key, {
            key: field.key,
            label: field.label,
            type: "number-range",
            source: "template",
            _values: new Set<string>(),
            _numbers: [],
          });
        }
        const n = Number(rawVal);
        if (!isNaN(n) && rawVal !== null && rawVal !== undefined) {
          templateFieldMap.get(field.key)!._numbers.push(n);
        }
      } else if (field.type === "text") {
        if (!existing) {
          templateFieldMap.set(field.key, {
            key: field.key,
            label: field.label,
            type: "select",
            source: "template",
            _values: new Set<string>(),
            _numbers: [],
          });
        }
        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
          templateFieldMap.get(field.key)!._values.add(String(rawVal));
        }
      }
    }
  }

  for (const [, def] of templateFieldMap) {
    if (def.type === "select") {
      const uniqueVals = [...def._values];
      if (uniqueVals.length < 2) continue;
      // Try to preserve template option ordering; fall back to actual unique values
      // when none of the template options match the actual data (e.g. vendor uses
      // custom grade terminology like "Grade B" vs template's "Grade 1").
      const optsByTemplate = def.options && def.options.length > 0
        ? def.options.filter((o) => uniqueVals.includes(o))
        : [];
      const opts = optsByTemplate.length >= 2 ? optsByTemplate : uniqueVals;
      if (opts.length < 2) continue;
      filters.push({ key: def.key, label: def.label, type: "select", options: opts, source: "template" });
    } else if (def.type === "number-range") {
      if (def._numbers.length < 2) continue;
      const mn = Math.min(...def._numbers);
      const mx = Math.max(...def._numbers);
      if (mn === mx) continue;
      filters.push({ key: def.key, label: def.label, type: "number-range", min: mn, max: mx, source: "template" });
    }
  }

  return filters;
}

export function matchVendorCatalog(item: MarketplaceItem, active: ActiveFilters): boolean {
  const specVals = getSpecValues(item);

  for (const [key, value] of Object.entries(active)) {
    if (value === null || value === undefined) continue;

    // ── Standard filters ───────────────────────────────────────────────────
    if (key === "__vendor") {
      if (item.vendorName !== value) return false;
      continue;
    }
    if (key === "__stockStatus") {
      if (item.stockStatus !== value) return false;
      continue;
    }
    if (key === "__province") {
      const itemProvince = extractProvince(item.location);
      if (!itemProvince || itemProvince.toLowerCase() !== String(value).toLowerCase()) return false;
      continue;
    }
    if (key === "__origin") {
      if (item.origin !== value) return false;
      continue;
    }
    if (key === "__priceSell") {
      const [mn, mx] = value as [number | null, number | null];
      if (mn !== null && (item.priceSell === null || item.priceSell < mn)) return false;
      if (mx !== null && (item.priceSell === null || item.priceSell > mx)) return false;
      continue;
    }
    if (key === "__search") {
      const q = String(value).toLowerCase().trim();
      if (!q) continue;
      const specText = item.specValues && typeof item.specValues === "object"
        ? JSON.stringify(item.specValues)
        : "";
      const haystack = [
        item.name, item.description, item.vendorName, item.kategori,
        item.categoryKey, item.subcategory, item.serviceType,
        item.origin, item.location, specText,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
      continue;
    }

    // ── Template-derived filters ───────────────────────────────────────────
    const rawVal = specVals[key];

    if (Array.isArray(value)) {
      // number-range
      const [mn, mx] = value as [number | null, number | null];
      if (mn === null && mx === null) continue;
      const n = Number(rawVal);
      if (isNaN(n)) return false;
      if (mn !== null && n < mn) return false;
      if (mx !== null && n > mx) return false;
    } else if (typeof value === "string" && value.trim() !== "") {
      if (rawVal === undefined || rawVal === null) return false;
      if (String(rawVal).toLowerCase() !== value.toLowerCase()) return false;
    }
  }

  return true;
}
