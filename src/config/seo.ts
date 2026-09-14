import { COMPANY_CONFIG } from "@/config/company";

const BASE_URL = COMPANY_CONFIG.domain;
const OG_IMAGE = `${BASE_URL}/api/storage/public-objects/portal-assets/static/customer-portal/images/og-cover.webp`;
const OG_IMAGE_ALT =
  `${COMPANY_CONFIG.brandName} — Layanan ekspor impor, freight forwarding, dan logistik terpadu Indonesia`;
const SITE_NAME = COMPANY_CONFIG.brandName;

export interface PageSeoConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  /** noindex=true untuk halaman yang tidak boleh diindeks */
  noindex?: boolean;
}

const routes: Record<string, PageSeoConfig> = {
  "/": {
    title: `${SITE_NAME} — Ekspor Impor, Freight Forwarding & Logistik Indonesia`,
    description:
      "B2B Marketplace dan platform logistik terpadu Indonesia. Layanan ekspor impor, freight forwarding udara & laut, customs clearance PPJK, dan trucking untuk bisnis Anda.",
    canonical: `${BASE_URL}/`,
    ogType: "website",
  },
  "/services": {
    title: `Layanan Logistik Lengkap — ${SITE_NAME}`,
    description:
      "Temukan semua layanan logistik: freight forwarding udara & laut, customs clearance PPJK, trucking, pergudangan, dan solusi ekspor impor terintegrasi.",
    canonical: `${BASE_URL}/services`,
    ogTitle: "Layanan Logistik Lengkap — B2B Marketplace and Logistic",
    ogDescription:
      "Freight forwarding udara & laut, customs clearance PPJK, trucking, pergudangan, dan ekspor impor terintegrasi untuk bisnis Anda.",
  },
  "/freight-forwarding": {
    title: `Freight Forwarding Udara & Laut — ${SITE_NAME}`,
    description:
      "Layanan freight forwarding internasional: air freight 1–5 hari dan sea freight FCL/LCL ke 150+ pelabuhan dunia. Harga transparan, terjadwal, terpercaya.",
    canonical: `${BASE_URL}/freight-forwarding`,
    ogTitle: "Freight Forwarding Udara & Laut Indonesia",
    ogDescription:
      "Air freight 1–5 hari dan sea freight FCL/LCL ke 150+ pelabuhan dunia. Freight forwarding internasional yang terpercaya.",
  },
  "/pabean": {
    title: `Customs Clearance & Kepabeanan PPJK — ${SITE_NAME}`,
    description:
      "Layanan customs clearance resmi PPJK: pengurusan dokumen bea cukai, klasifikasi HS Code, bea masuk & pajak impor, koordinasi Direktorat Bea dan Cukai.",
    canonical: `${BASE_URL}/pabean`,
    ogTitle: "Customs Clearance & Kepabeanan PPJK",
    ogDescription:
      "Pengurusan bea cukai resmi PPJK: dokumen, HS Code, bea masuk, koordinasi Dirjen Bea Cukai. Cepat dan terpercaya.",
  },
  "/custom-clearance": {
    title: `Custom Clearance Indonesia — ${SITE_NAME}`,
    description:
      "Jasa custom clearance profesional untuk impor dan ekspor. Pengurusan dokumen, HS Code, bea masuk, dan koordinasi kepabeanan yang efisien.",
    canonical: `${BASE_URL}/custom-clearance`,
    ogTitle: "Custom Clearance Indonesia — B2B Marketplace and Logistic",
    ogDescription:
      "Jasa custom clearance impor & ekspor: dokumen, HS Code, bea masuk, koordinasi kepabeanan yang efisien.",
  },
  "/trucking": {
    title: `Layanan Trucking & Distribusi Darat Indonesia — ${SITE_NAME}`,
    description:
      "Trucking dan distribusi darat ke seluruh Indonesia. Armada modern dengan tracking real-time. Cocok untuk pengiriman B2B skala besar maupun UMKM.",
    canonical: `${BASE_URL}/trucking`,
    ogTitle: "Trucking & Distribusi Darat Indonesia",
    ogDescription:
      "Trucking ke seluruh Indonesia dengan armada modern dan tracking real-time. Pengiriman tepat waktu untuk bisnis Anda.",
  },
  "/ocean-freight": {
    title: `Ocean Freight / Sea Freight FCL & LCL — ${SITE_NAME}`,
    description:
      "Pengiriman laut internasional FCL (Full Container Load) dan LCL (Less than Container Load) ke 150+ pelabuhan dunia. Jadwal reguler, harga kompetitif.",
    canonical: `${BASE_URL}/ocean-freight`,
    ogTitle: "Ocean Freight FCL & LCL — B2B Marketplace and Logistic",
    ogDescription:
      "Sea freight internasional FCL & LCL ke 150+ pelabuhan. Jadwal reguler, harga kompetitif untuk kargo bisnis Anda.",
  },
  "/jasa": {
    title: `Jasa & Vendor Logistik B2B — ${SITE_NAME}`,
    description:
      "Temukan berbagai vendor dan jasa logistik terverifikasi di platform B2B kami: freight, customs, trucking, pergudangan, dan lebih banyak lagi.",
    canonical: `${BASE_URL}/jasa`,
    ogTitle: "Jasa & Vendor Logistik B2B",
    ogDescription:
      "Vendor dan jasa logistik terverifikasi: freight, customs, trucking, pergudangan, dan layanan bisnis lainnya.",
  },
  "/marketplace": {
    title: `Marketplace B2B Logistik Indonesia — ${SITE_NAME}`,
    description:
      "Marketplace B2B untuk produk dan jasa logistik. Bandingkan penawaran, hubungi vendor, dan kelola pengadaan logistik bisnis Anda dalam satu platform.",
    canonical: `${BASE_URL}/marketplace`,
    ogTitle: "Marketplace B2B Logistik Indonesia",
    ogDescription:
      "Platform marketplace B2B: temukan, bandingkan, dan pesan jasa logistik dari vendor terverifikasi di seluruh Indonesia.",
  },
  "/catalog": {
    title: `Katalog Produk & Jasa Logistik — ${SITE_NAME}`,
    description:
      "Katalog lengkap produk dan jasa logistik dari vendor terverifikasi. Temukan solusi pengiriman, customs, trucking, dan pergudangan sesuai kebutuhan bisnis.",
    canonical: `${BASE_URL}/catalog`,
    ogTitle: "Katalog Produk & Jasa Logistik",
    ogDescription:
      "Katalog produk dan jasa logistik terverifikasi: pengiriman, customs, trucking, pergudangan dari vendor terpercaya.",
  },
  "/calculator": {
    title: `Kalkulator Biaya Pengiriman Freight — ${SITE_NAME}`,
    description:
      "Hitung estimasi biaya freight forwarding udara dan laut secara instan. Masukkan berat, dimensi, asal, dan tujuan kargo untuk mendapatkan penawaran.",
    canonical: `${BASE_URL}/calculator`,
    ogTitle: "Kalkulator Biaya Pengiriman Freight",
    ogDescription:
      "Estimasi biaya freight forwarding udara & laut secara instan. Masukkan detail kargo dan dapatkan penawaran langsung.",
  },
  "/track": {
    title: `Lacak Pengiriman — ${SITE_NAME}`,
    description:
      "Pantau status pengiriman Anda secara real-time. Masukkan nomor order atau resi untuk melihat posisi dan status terkini kargo Anda.",
    canonical: `${BASE_URL}/track`,
    ogTitle: "Lacak Pengiriman — B2B Marketplace and Logistic",
    ogDescription:
      "Tracking pengiriman real-time: masukkan nomor order atau resi untuk melihat status terkini kargo Anda.",
  },
  "/book": {
    title: `Booking Pengiriman Logistik — ${SITE_NAME}`,
    description:
      "Pesan layanan pengiriman logistik secara online. Freight forwarding udara, laut, atau trucking — semua bisa dipesan langsung melalui platform kami.",
    canonical: `${BASE_URL}/book`,
    ogTitle: "Booking Pengiriman Logistik",
    ogDescription:
      "Pesan freight forwarding udara, laut, atau trucking secara online. Mudah, cepat, dan transparan.",
    // Booking form — requires auth; no informational SEO value
    noindex: true,
  },
  "/ocean-freight-booking": {
    title: `Booking Ocean Freight / Sea Freight — ${SITE_NAME}`,
    description:
      "Pesan layanan ocean freight FCL dan LCL secara online. Isi detail kargo, pilih jadwal keberangkatan, dan konfirmasi pengiriman dalam beberapa langkah.",
    canonical: `${BASE_URL}/ocean-freight-booking`,
    ogTitle: "Booking Ocean Freight / Sea Freight",
    ogDescription:
      "Pesan ocean freight FCL & LCL online. Detail kargo, jadwal keberangkatan, konfirmasi pengiriman — mudah dan cepat.",
    // Booking form — requires auth; no informational SEO value
    noindex: true,
  },
  "/shipment-timeline": {
    title: `Timeline Pengiriman — ${SITE_NAME}`,
    description:
      "Lihat estimasi timeline pengiriman freight forwarding dari asal ke tujuan. Pahami tahapan proses: pickup, customs clearance, transit, dan delivery.",
    canonical: `${BASE_URL}/shipment-timeline`,
    ogTitle: "Timeline Pengiriman Freight",
    ogDescription:
      "Estimasi timeline pengiriman: pickup, customs clearance, transit, delivery. Pahami proses lengkap pengiriman logistik Anda.",
    // Requires auth to show real order data; no indexable content
    noindex: true,
  },
  "/contact": {
    title: `Hubungi Kami — ${SITE_NAME}`,
    description:
      "Hubungi tim B2B Marketplace and Logistic untuk konsultasi layanan ekspor impor, freight forwarding, customs clearance, dan solusi logistik bisnis Anda.",
    canonical: `${BASE_URL}/contact`,
    ogTitle: "Hubungi Kami — B2B Marketplace and Logistic",
    ogDescription:
      "Konsultasi gratis layanan ekspor impor, freight forwarding, customs clearance, dan logistik terpadu untuk bisnis Anda.",
  },
  "/privacy-policy": {
    title: `Kebijakan Privasi — ${SITE_NAME}`,
    description:
      "Kebijakan privasi B2B Marketplace and Logistic: bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna platform kami.",
    canonical: `${BASE_URL}/privacy-policy`,
    ogTitle: "Kebijakan Privasi — B2B Marketplace and Logistic",
    ogDescription:
      "Informasi lengkap tentang pengumpulan, penggunaan, dan perlindungan data pribadi pengguna platform B2B Marketplace and Logistic.",
  },
};

/** Halaman private — robots noindex, nofollow */
export const NOINDEX_ROUTES = new Set([
  "/login",
  "/register",
  "/dashboard",
  "/vendor-dashboard",
  "/orders",
  "/admin",
  "/logistic-admin",
  "/reset-password",
  "/onboarding",
  "/pending-approval",
  "/account-security",
  "/order-produk",
  "/logistic-order-success",
  "/vendor-quote",
  "/vendor-confirm",
]);

export function getSeoConfig(path: string): PageSeoConfig {
  const config = routes[path];
  if (config) return config;

  // Fallback ke homepage metadata
  return {
    title: `${SITE_NAME} — Ekspor Impor, Freight Forwarding & Logistik Indonesia`,
    description:
      "B2B Marketplace dan platform logistik terpadu Indonesia. Layanan ekspor impor, freight forwarding, customs clearance, dan trucking.",
    canonical: `${BASE_URL}${path}`,
  };
}

export { OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, BASE_URL };
