#!/usr/bin/env node
/**
 * Static prerender script — Phase SEO Final.
 *
 * Run AFTER `vite build`. For every public route, creates:
 *   dist/public/<route>/index.html
 * with route-specific metadata baked into <head> BEFORE JavaScript runs.
 *
 * This ensures crawlers (WhatsApp, Facebook, LinkedIn, Telegram, Discord,
 * Google, Bing, AI Search) read correct per-page metadata from static HTML.
 *
 * Architecture:
 *   - Zero new runtime dependencies (pure Node.js built-ins)
 *   - Zero changes to React app, routing, auth, API, or state management
 *   - Uses <!-- SEO:META:START/END --> and <!-- SEO:JSONLD:START/END --> markers
 *     in the built index.html as replacement targets
 *   - Does NOT require Puppeteer or Chromium
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = resolve(__dirname, '../dist/public');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escape a string for safe inclusion in an HTML attribute or text node. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Replace content between <!-- MARKER:START --> ... <!-- MARKER:END --> */
function replaceMarker(html, markerName, replacement) {
  const start = `<!-- ${markerName}:START -->`;
  const end   = `<!-- ${markerName}:END -->`;
  const re = new RegExp(
    `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'g',
  );
  return html.replace(re, `${start}\n${replacement}\n    ${end}`);
}

// ── SEO Config (mirrors src/config/seo.ts exactly) ──────────────────────────

const BASE_URL    = 'https://cstlogistic.co.id';
const DEFAULT_PUBLIC_ASSET_ORIGIN = 'https://xssrfshdrtdfupgqwfdw.supabase.co';
const SUPABASE_ORIGIN = String(
  process.env.VITE_SUPABASE_URL ?? DEFAULT_PUBLIC_ASSET_ORIGIN,
).replace(/\/+$/, '');
const OG_IMAGE    = SUPABASE_ORIGIN
  ? `${SUPABASE_ORIGIN}/storage/v1/object/public/public-assets/portal-assets/static/customer-portal/images/og-cover.webp`
  : '';
const OG_IMG_ALT  = 'CST Logistic — PT Cahaya Sejati Teknologi, layanan logistik dan transportasi Indonesia';
const SITE_NAME   = 'CST Logistic';

const routes = {
  '/': {
    title:         `${SITE_NAME} — Ekspor Impor, Freight Forwarding & Logistik Indonesia`,
    description:   'B2B Marketplace dan platform logistik terpadu Indonesia. Layanan ekspor impor, freight forwarding udara & laut, customs clearance PPJK, dan trucking untuk bisnis Anda.',
    canonical:     `${BASE_URL}/`,
    ogType:        'website',
    isHomepage:    true,
  },
  '/services': {
    title:         'Layanan Logistik & Transportasi | CST Logistic',
    description:   'Katalog layanan telah dipusatkan di halaman Jasa CST Logistic: freight forwarding, kepabeanan, transportasi penumpang, distribusi barang, dan layanan logistik tambahan.',
    canonical:     `${BASE_URL}/jasa`,
    ogTitle:       'Layanan Logistik & Transportasi | CST Logistic',
    ogDescription: 'Freight forwarding, kepabeanan, transportasi penumpang, distribusi barang, dan layanan logistik tambahan CST.',
    noindex:       true,
  },
  '/freight-forwarding': {
    title:         'Freight Forwarding Udara & Laut | CST Logistic',
    description:   'Layanan freight forwarding internasional melalui air freight dan sea freight FCL/LCL untuk kebutuhan ekspor, impor, dan distribusi bisnis.',
    canonical:     `${BASE_URL}/freight-forwarding`,
    ogTitle:       'Freight Forwarding Udara & Laut | CST Logistic',
    ogDescription: 'Air freight dan sea freight FCL/LCL untuk kebutuhan ekspor, impor, dan distribusi bisnis.',
  },
  '/pabean': {
    title:         'Jasa PPJK & Kepabeanan Indonesia | CST Logistic',
    description:   'Layanan kepabeanan dan konsultasi PPJK untuk dokumen ekspor impor, HS Code, bea masuk, pajak impor, dan proses customs clearance.',
    canonical:     `${BASE_URL}/pabean`,
    ogTitle:       'Jasa PPJK & Kepabeanan Indonesia | CST Logistic',
    ogDescription: 'Pengurusan kepabeanan, dokumen ekspor impor, HS Code, bea masuk, pajak impor, dan customs clearance.',
  },
  '/custom-clearance': {
    title:         'Jasa Customs Clearance Indonesia | CST Logistic',
    description:   'Layanan customs clearance ekspor dan impor, pengurusan dokumen Bea Cukai, perizinan, HS Code, dan penyelesaian kepabeanan.',
    canonical:     `${BASE_URL}/custom-clearance`,
    ogTitle:       'Jasa Customs Clearance Indonesia | CST Logistic',
    ogDescription: 'Customs clearance ekspor dan impor: pengurusan dokumen Bea Cukai, perizinan, HS Code, dan penyelesaian kepabeanan.',
  },
  '/trucking': {
    title:         `Transportasi Penumpang & Distribusi Darat — ${SITE_NAME}`,
    description:   'Layanan transportasi penumpang dan distribusi barang domestik dengan pilihan mobil penumpang hingga armada kargo.',
    canonical:     `${BASE_URL}/trucking`,
    ogTitle:       'Transportasi Penumpang & Distribusi Darat',
    ogDescription: 'Pilih mobil penumpang atau armada barang sesuai kebutuhan perjalanan dan distribusi domestik Anda.',
  },
  '/ocean-freight': {
    title:         `Ocean Freight / Sea Freight FCL & LCL — ${SITE_NAME}`,
    description:   'Pengiriman laut internasional dengan pilihan FCL (Full Container Load) dan LCL (Less than Container Load) untuk kebutuhan ekspor dan impor.',
    canonical:     `${BASE_URL}/ocean-freight`,
    ogTitle:       'Ocean Freight FCL & LCL',
    ogDescription: 'Sea freight internasional FCL & LCL untuk kebutuhan ekspor dan impor kargo bisnis.',
  },
  '/jasa': {
    title:         'Jasa Logistik & Transportasi | CST Logistic',
    description:   'Layanan CST Logistic mencakup sea freight, air freight, kepabeanan, transportasi penumpang, distribusi barang, handling, storage, EMKL, dan asuransi kargo.',
    canonical:     `${BASE_URL}/jasa`,
    ogTitle:       'Jasa Logistik & Transportasi | CST Logistic',
    ogDescription: 'Sea freight, air freight, kepabeanan, transportasi penumpang, distribusi barang, handling, storage, EMKL, dan layanan logistik tambahan.',
  },
  '/marketplace': {
    title:         `Marketplace B2B Logistik Indonesia — ${SITE_NAME}`,
    description:   'Marketplace B2B untuk produk dan jasa logistik. Bandingkan penawaran, hubungi vendor, dan kelola pengadaan logistik bisnis Anda dalam satu platform.',
    canonical:     `${BASE_URL}/marketplace`,
    ogTitle:       'Marketplace B2B Logistik Indonesia',
    ogDescription: 'Platform marketplace B2B: temukan, bandingkan, dan pesan jasa logistik dari vendor terverifikasi di seluruh Indonesia.',
  },
  '/catalog': {
    title:         `Katalog Produk & Jasa Logistik — ${SITE_NAME}`,
    description:   'Katalog lengkap produk dan jasa logistik dari vendor terverifikasi. Temukan solusi pengiriman, customs, trucking, dan pergudangan sesuai kebutuhan bisnis.',
    canonical:     `${BASE_URL}/catalog`,
    ogTitle:       'Katalog Produk & Jasa Logistik',
    ogDescription: 'Katalog produk dan jasa logistik terverifikasi: pengiriman, customs, trucking, pergudangan dari vendor terpercaya.',
  },
  '/calculator': {
    title:         `Kalkulator Biaya Pengiriman Freight — ${SITE_NAME}`,
    description:   'Hitung estimasi biaya freight forwarding udara dan laut secara instan. Masukkan berat, dimensi, asal, dan tujuan kargo untuk mendapatkan penawaran.',
    canonical:     `${BASE_URL}/calculator`,
    ogTitle:       'Kalkulator Biaya Pengiriman Freight',
    ogDescription: 'Estimasi biaya freight forwarding udara & laut secara instan. Masukkan detail kargo dan dapatkan penawaran langsung.',
  },
  '/kalkulator-impor': {
    title:         `Kalkulator Tarif Impor, Bea Masuk, PPN & PPh 22 — ${SITE_NAME}`,
    description:   'Hitung estimasi Bea Masuk, PPN Impor, PPh Pasal 22, dan total landed cost berdasarkan HS Code BTKI, kurs, Incoterm, serta skema tarif preferensial.',
    canonical:     `${BASE_URL}/kalkulator-impor`,
    ogTitle:       'Kalkulator Tarif Impor & Bea Masuk Indonesia',
    ogDescription: 'Hitung Bea Masuk, PPN Impor, PPh 22, dan landed cost berdasarkan HS Code BTKI, kurs, Incoterm, dan tarif preferensial.',
  },
  '/translation-hub': {
    title:         `Translation Hub AI untuk Logistik & Bisnis — ${SITE_NAME}`,
    description:   'Terjemahkan teks bisnis dan logistik secara real-time dalam berbagai bahasa untuk komunikasi pelanggan, vendor, dokumen, dan operasional internasional.',
    canonical:     `${BASE_URL}/translation-hub`,
    ogTitle:       'Translation Hub AI untuk Logistik & Bisnis',
    ogDescription: 'Terjemahan AI multi-bahasa untuk komunikasi pelanggan, vendor, dokumen, dan operasional logistik internasional.',
  },
  '/track': {
    title:         `Lacak Pengiriman — ${SITE_NAME}`,
    description:   'Pantau status pengiriman Anda secara real-time. Masukkan nomor order atau resi untuk melihat posisi dan status terkini kargo Anda.',
    canonical:     `${BASE_URL}/track`,
    ogTitle:       'Lacak Pengiriman — B2B Marketplace and Logistic',
    ogDescription: 'Tracking pengiriman real-time: masukkan nomor order atau resi untuk melihat status terkini kargo Anda.',
  },
  '/book': {
    title:         `Booking Pengiriman Logistik — ${SITE_NAME}`,
    description:   'Pesan layanan pengiriman logistik secara online. Freight forwarding udara, laut, atau trucking — semua bisa dipesan langsung melalui platform kami.',
    canonical:     `${BASE_URL}/book`,
    ogTitle:       'Booking Pengiriman Logistik',
    ogDescription: 'Pesan freight forwarding udara, laut, atau trucking secara online. Mudah, cepat, dan transparan.',
    noindex:       true,
  },
  '/ocean-freight-booking': {
    title:         `Booking Ocean Freight / Sea Freight — ${SITE_NAME}`,
    description:   'Pesan layanan ocean freight FCL dan LCL secara online. Isi detail kargo, pilih jadwal keberangkatan, dan konfirmasi pengiriman dalam beberapa langkah.',
    canonical:     `${BASE_URL}/ocean-freight-booking`,
    ogTitle:       'Booking Ocean Freight / Sea Freight',
    ogDescription: 'Pesan ocean freight FCL & LCL online. Detail kargo, jadwal keberangkatan, konfirmasi pengiriman — mudah dan cepat.',
    noindex:       true,
  },
  '/shipment-timeline': {
    title:         `Timeline Pengiriman — ${SITE_NAME}`,
    description:   'Lihat estimasi timeline pengiriman freight forwarding dari asal ke tujuan. Pahami tahapan proses: pickup, customs clearance, transit, dan delivery.',
    canonical:     `${BASE_URL}/shipment-timeline`,
    ogTitle:       'Timeline Pengiriman Freight',
    ogDescription: 'Estimasi timeline pengiriman: pickup, customs clearance, transit, delivery. Pahami proses lengkap pengiriman logistik Anda.',
    noindex:       true,
  },
  '/contact': {
    title:         `Hubungi Kami — ${SITE_NAME}`,
    description:   'Hubungi tim B2B Marketplace and Logistic untuk konsultasi layanan ekspor impor, freight forwarding, customs clearance, dan solusi logistik bisnis Anda.',
    canonical:     `${BASE_URL}/contact`,
    ogTitle:       'Hubungi Kami — B2B Marketplace and Logistic',
    ogDescription: 'Konsultasi gratis layanan ekspor impor, freight forwarding, customs clearance, dan logistik terpadu untuk bisnis Anda.',
  },
  '/privacy-policy': {
    title:         `Kebijakan Privasi — ${SITE_NAME}`,
    description:   'Kebijakan privasi B2B Marketplace and Logistic: bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengguna platform kami.',
    canonical:     `${BASE_URL}/privacy-policy`,
    ogTitle:       'Kebijakan Privasi — B2B Marketplace and Logistic',
    ogDescription: 'Informasi lengkap tentang pengumpulan, penggunaan, dan perlindungan data pribadi pengguna platform B2B Marketplace and Logistic.',
  },
};

// ── HTML Block Builders ──────────────────────────────────────────────────────

function buildMetaBlock(route, cfg) {
  const robots    = cfg.noindex ? 'noindex, nofollow' : 'index, follow';
  const ogTitle   = cfg.ogTitle       ?? cfg.title;
  const ogDesc    = cfg.ogDescription ?? cfg.description;
  const ogType    = cfg.ogType        ?? 'website';
  const canonical = cfg.canonical;

  return `    <title>${esc(cfg.title)}</title>
    <meta name="description" content="${esc(cfg.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="theme-color" content="#0ea5e9" />
    <meta name="msapplication-TileColor" content="#0ea5e9" />
    <meta name="color-scheme" content="light" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="canonical" href="${esc(canonical)}" />

    <!-- Open Graph -->
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(ogDesc)}" />
    <meta property="og:image" content="${esc(OG_IMAGE)}" />
    <meta property="og:image:secure_url" content="${esc(OG_IMAGE)}" />
    <meta property="og:image:type" content="image/webp" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(OG_IMG_ALT)}" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:locale:alternate" content="en_US" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(ogTitle)}" />
    <meta name="twitter:description" content="${esc(ogDesc)}" />
    <meta name="twitter:image" content="${esc(OG_IMAGE)}" />
    <meta name="twitter:image:alt" content="${esc(OG_IMG_ALT)}" />`;
}

function buildJsonLdBlock(route, cfg) {
  const canonical = cfg.canonical;
  // Use hash-based @id so same-page dedup works across schemas
  const pageId = canonical.replace(/\/$/, '') + '#webpage';
  const name   = cfg.title;
  const desc   = cfg.description;

  const aboutClause = cfg.isHomepage
    ? `\n      "about": { "@id": "${BASE_URL}/#organization" },`
    : '';

  return `    <!-- Structured Data: WebPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "${pageId}",
      "url": "${canonical}",
      "name": ${JSON.stringify(name)},
      "isPartOf": { "@id": "${BASE_URL}/#website" },${aboutClause}
      "description": ${JSON.stringify(desc)},
      "inLanguage": "id-ID"
    }
    </script>`;
}

function buildStaticBody(route, cfg) {
  const serviceLinks = route === '/jasa'
    ? `<h2>Layanan Utama</h2>
       <ul>
         <li><a href="/ocean-freight-booking">Sea Freight / Ocean Freight</a></li>
         <li><a href="/air-freight-booking">Air Freight</a></li>
         <li><a href="/trucking">Transportasi Penumpang & Distribusi Barang Domestik</a></li>
         <li><a href="/custom-clearance">Custom Clearance</a></li>
         <li><a href="/pabean">Konsultan Pabean</a></li>
       </ul>
       <h2>Layanan Tambahan</h2>
       <p>Handling, port charges, storage/demurrage, EMKL, dan asuransi kargo tersedia sesuai kebutuhan operasional.</p>`
    : '';

  return `<div class="seo-static">
    <nav aria-label="Navigasi utama">
      <a href="/">Beranda</a>
      <a href="/jasa">Jasa</a>
      <a href="/marketplace">Marketplace</a>
      <a href="/contact">Kontak</a>
    </nav>
    <main>
      <h1>${esc(cfg.title)}</h1>
      <p>${esc(cfg.description)}</p>
      ${serviceLinks}
    </main>
    <footer>
      <p><a href="https://wa.cstlogistic.co.id/">CST WhatsApp Gateway</a> — Infrastruktur WhatsApp bisnis resmi PT Cahaya Sejati Teknologi.</p>
      <p>&copy; 2026 PT Cahaya Sejati Teknologi. Seluruh hak cipta dilindungi.</p>
    </footer>
  </div>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

// Read the built index.html (Vite replaces /src/main.tsx with hashed bundle)
let template;
try {
  template = readFileSync(join(distDir, 'index.html'), 'utf-8');
} catch (err) {
  console.error('ERROR: dist/public/index.html not found. Run `vite build` first.');
  process.exit(1);
}

// Verify markers exist
if (!template.includes('<!-- SEO:META:START -->')) {
  console.error('ERROR: <!-- SEO:META:START --> marker not found in index.html.');
  console.error('  Make sure the source index.html has the SEO markers.');
  process.exit(1);
}
if (!template.includes('<!-- SEO:JSONLD:START -->')) {
  console.error('ERROR: <!-- SEO:JSONLD:START --> marker not found in index.html.');
  process.exit(1);
}
if (!template.includes('<!-- SEO:STATIC:START -->')) {
  console.error('ERROR: <!-- SEO:STATIC:START --> marker not found in index.html.');
  process.exit(1);
}

let generated = 0;
let skipped   = 0;

for (const [routePath, cfg] of Object.entries(routes)) {
  try {
    // Build the two replacement blocks
    const metaBlock   = buildMetaBlock(routePath, cfg);
    const jsonLdBlock = buildJsonLdBlock(routePath, cfg);

    // Replace both marker sections
    let html = replaceMarker(template, 'SEO:META',   metaBlock);
    html     = replaceMarker(html,     'SEO:JSONLD', jsonLdBlock);
    html     = replaceMarker(html,     'SEO:STATIC', buildStaticBody(routePath, cfg));

    // Determine output path
    // /          → dist/public/index.html  (overwrite — already homepage)
    // /services  → dist/public/services/index.html
    const subdir = routePath === '/' ? '' : routePath.slice(1);
    const outDir = subdir ? join(distDir, subdir) : distDir;
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html, 'utf-8');

    const label = cfg.noindex ? ` [noindex]` : '';
    console.log(`  ✓ ${routePath}${label}`);
    generated++;
  } catch (err) {
    console.error(`  ✗ ${routePath}: ${err.message}`);
    skipped++;
  }
}

console.log(`\nPrerender complete: ${generated} routes generated, ${skipped} skipped.`);
if (skipped > 0) process.exit(1);
