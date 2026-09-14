const BASE = "https://images.unsplash.com/photo-";
const W = "?w=800&q=80&auto=format&fit=crop";

// Local HD images bundled with the app (always available, no external dependency)
const LOCAL = (path: string) => `/api/storage/public-objects/portal-assets/static/customer-portal/images/${path.replace(/\.(png|jpe?g)$/i, ".webp")}`;

// ── Product-specific images (exact product name match, case-insensitive) ─────
const PRODUCT_SPECIFIC: Array<{ names: string[]; url: string }> = [
  {
    names: ["samsung galaxy a54", "galaxy a54"],
    url: LOCAL("products/samsung-galaxy-a54.png"),
  },
  {
    names: ["meja kerja standing desk", "standing desk"],
    url: LOCAL("products/meja-kerja-standing-desk.png"),
  },
  {
    names: ["kursi kantor ergonomis", "kursi ergonomis"],
    url: LOCAL("products/kursi-kantor-ergonomis.png"),
  },
  {
    names: ["printer hp laserjet", "hp laserjet"],
    url: LOCAL("products/printer-hp-laserjet.png"),
  },
  {
    names: ["green bean arabica", "arabica green bean", "sumatra grande"],
    url: LOCAL("products/green-bean-arabica.png"),
  },
];

// ── Service images (order: most-specific first) ──────────────────────────────
// HD premium images generated per-service — no external URL dependency.
const SVCIMG = (path: string) => LOCAL(`services/${path}`);

const SERVICE_IMAGES: Array<{ keywords: string[]; url: string }> = [
  // ── Highly specific service names first ─────────────────────────────────
  {
    keywords: ["handling cargo laut", "cargo laut"],
    url: SVCIMG("handling-cargo-laut.png"),
  },
  {
    keywords: ["asuransi kargo", "asuransi cargo", "insurance cargo"],
    url: SVCIMG("asuransi-kargo.png"),
  },
  {
    keywords: ["customs clearance", "customs management", "customs document", "pengurusan dokumen ppjk", "ppjk"],
    url: SVCIMG("customs-clearance.png"),
  },
  {
    keywords: ["emkl", "ekspedisi muatan kapal laut"],
    url: SVCIMG("emkl.png"),
  },
  {
    keywords: ["freight laut fcl", "freight fcl", "laut fcl", "fcl 20ft", "fcl 40ft", "full container load"],
    url: SVCIMG("freight-laut-fcl.png"),
  },
  {
    keywords: ["freight laut lcl", "freight lcl", "laut lcl", "less container load", "lcl"],
    url: SVCIMG("freight-laut-lcl.png"),
  },
  {
    keywords: ["freight udara", "udara lcl", "udara fcl"],
    url: SVCIMG("freight-udara.png"),
  },
  {
    keywords: ["handling cargo udara", "cargo udara handling"],
    url: SVCIMG("handling-cargo-udara.png"),
  },
  {
    keywords: ["ocean freight", "ocean"],
    url: SVCIMG("ocean-freight.png"),
  },
  {
    keywords: ["pengurusan dokumen", "urus dokumen ppjk", "dokumen ppjk"],
    url: SVCIMG("pengurusan-dokumen-ppjk.png"),
  },
  {
    keywords: ["port charges", "port charge", "biaya pelabuhan", "terminal handling charge", "thc"],
    url: SVCIMG("port-charges.png"),
  },
  {
    keywords: ["biaya storage", "storage fee", "biaya penyimpanan"],
    url: SVCIMG("biaya-storage.png"),
  },
  {
    keywords: ["urus dokumen pabean", "dokumen pabean"],
    url: SVCIMG("urus-dokumen-pabean.png"),
  },
  {
    keywords: ["storage demurrage", "demurrage", "storage / demurrage", "detention"],
    url: SVCIMG("storage-demurrage.png"),
  },
  {
    keywords: ["air freight", "airfreight"],
    url: SVCIMG("air-freight.png"),
  },
  // ── Broader category matches ─────────────────────────────────────────────
  {
    keywords: ["trucking", "truck", "container", "angkut darat", "sewa container", "truk"],
    url: SVCIMG("trucking-container.png"),
  },
  {
    keywords: ["sea freight", "freight laut", "laut", "kapal"],
    url: SVCIMG("ocean-freight.png"),
  },
  {
    keywords: ["udara", "pesawat", "airfreight", "cargo udara"],
    url: SVCIMG("freight-udara.png"),
  },
  {
    keywords: ["handling", "bongkar", "muat", "warehouse", "gudang", "storage", "depo", "penyimpanan"],
    url: SVCIMG("biaya-storage.png"),
  },
  {
    keywords: ["pabean", "customs", "kepabeanan", "bea cukai", "clearance", "dokumen", "pengurusan"],
    url: SVCIMG("customs-clearance.png"),
  },
  {
    keywords: ["freight forwarding", "forwarding", "ekspor", "impor", "port", "pelabuhan", "port charges"],
    url: SVCIMG("port-charges.png"),
  },
];

// Reuse a verified service object instead of a legacy default path that may not
// exist in every environment. This is a display fallback, not CMS data.
const DEFAULT_SERVICE = SVCIMG("ocean-freight.png");

// ── Product images (order: most-specific first) ──────────────────────────────
// All IDs below are verified HTTP 200 as of 2026-05.
const PRODUCT_IMAGES: Array<{ keywords: string[]; url: string }> = [
  // --- Highly specific product names / brands ---
  {
    // MacBook on wooden desk — clean HD photo
    keywords: ["laptop", "notebook", "asus", "acer", "lenovo", "macbook", "vivobook", "thinkpad"],
    url: `${BASE}1496181133206-80ce9b88a853${W}`,
  },
  {
    // Smartphone on neutral bg
    keywords: ["samsung", "galaxy", "oppo", "xiaomi", "iphone", "smartphone", "handphone", "hp ", "android"],
    url: `${BASE}1511707171634-5f897ff02aa9${W}`,
  },
  {
    // POS/cash register
    keywords: ["pos", "kasir", "point of sale", "cash register"],
    url: `${BASE}1556742049-0cfed4f6a45d${W}`,
  },
  // --- Product categories ---
  {
    // Sofa/furniture
    keywords: ["furniture", "meja", "kursi", "sofa", "lemari", "cabinet", "chair", "table", "desk", "kantor"],
    url: `${BASE}1555041469-a586c61ea9bc${W}`,
  },
  {
    // Coffee beans
    keywords: ["kopi", "coffee", "green bean", "biji kopi", "arabika", "robusta", "arabica"],
    url: `${BASE}1447933601403-0c6688de566e${W}`,
  },
  {
    // Shopping bags — covers retail/fashion/clothing/garment
    keywords: ["textile", "tekstil", "kain", "fabric", "garment", "pakaian", "baju", "benang", "jahit", "fashion", "clothing"],
    url: `${BASE}1607082348824-0a96f2a4b9da${W}`,
  },
  {
    // Stationery flat lay
    keywords: ["alat tulis", "stationery", "stasioner", "pensil", "pulpen", "buku", "kertas", "atk"],
    url: `${BASE}1513542789411-b6a5d4f31634${W}`,
  },
  {
    // Leather bag
    keywords: ["tas", "bag", "backpack", "koper", "ransel", "suitcase"],
    url: `${BASE}1553062407-98eeb64c6a62${W}`,
  },
  {
    // Tools / hardware
    keywords: ["alat", "tool", "hardware", "perkakas", "mesin", "bor", "machine", "printer", "mesin cetak", "scanner", "laserjet", "inkjet", "epson", "canon"],
    url: `${BASE}1518709268805-4e9042af9f23${W}`,
  },
  {
    // Rice / beras
    keywords: ["beras", "rice", "ir64", "ir 64", "padi", "gabah"],
    url: LOCAL("products/beras-rice.png"),
  },
  {
    // Food / pantry
    keywords: ["makanan", "food", "minuman", "beverage", "snack", "sembako", "minyak"],
    url: `${BASE}1490818387583-1baba5e638af${W}`,
  },
  {
    // Electronics accessories (headphones + keyboard) — generic catch-all LAST
    keywords: ["elektronik", "electronic", "gadget", "komputer", "computer", "pc"],
    url: `${BASE}1550009158-9ebf69173e03${W}`,
  },
];

// Cardboard boxes / packages — neutral default
const DEFAULT_PRODUCT = `${BASE}1553877522-43269d4ea984${W}`;

function matchKeywords(
  list: Array<{ keywords: string[]; url: string }>,
  haystack: string
): string | null {
  const lower = haystack.toLowerCase();
  for (const entry of list) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.url;
    }
  }
  return null;
}

export function getServiceFallbackImage(
  categories: string[] = [],
  name = ""
): string {
  const haystack = [...categories, name].join(" ");
  return matchKeywords(SERVICE_IMAGES, haystack) ?? DEFAULT_SERVICE;
}

export function getProductFallbackImage(
  categories: string[] = [],
  name = "",
  subcategory: string | null = null
): string {
  // 1. Check exact product name first (highest priority)
  const lowerName = name.toLowerCase();
  for (const entry of PRODUCT_SPECIFIC) {
    if (entry.names.some((n) => lowerName.includes(n))) {
      return entry.url;
    }
  }

  // 2. Fall back to keyword matching by name + subcategory + categories
  const haystack = [name, subcategory ?? "", ...categories].join(" ");
  return matchKeywords(PRODUCT_IMAGES, haystack) ?? DEFAULT_PRODUCT;
}
