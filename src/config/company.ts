/**
 * company.ts — Single source of truth for company branding & contact fallbacks.
 *
 * Nilai di sini dipakai sebagai FALLBACK ketika data perusahaan dari API
 * (/api/company → useGetPortalCompany) belum ter-load atau kosong.
 * Nilai produksi yang sebenarnya harus datang dari API, bukan dari file ini.
 *
 * Untuk mengubah nama/kontak perusahaan: update di BizPortal → Profil Perusahaan,
 * lalu nilai API akan otomatis menggantikan fallback di bawah.
 */

export const COMPANY_CONFIG = {
  /** Nama brand pendek yang ditampilkan di UI (navbar, footer, dokumen) */
  brandName: "B2B Marketplace and Logistic",

  /** Nama entitas hukum — digunakan di copyright dan dokumen legal */
  legalName: "PT. Cahaya Sejati Teknologi",

  /** Domain website publik */
  domain: "https://cstlogistic.co.id",

  /** Email kontak default (dipakai jika profil API tidak memiliki email) */
  email: "info@cstlogistic.com",

  /** Nomor telepon default format E.164 (dipakai jika profil API tidak memiliki phone) */
  phone: "+6280000000000",

  /** Nomor telepon format tampilan (human-readable) */
  phoneDisplay: "+62 800 0000 0000",

  /** Kota asal default untuk kalkulasi biaya pengiriman */
  originCity: "Jakarta",

  /** Default IATA airport code untuk air freight */
  originAirport: "CGK",

  /** Default origin seaport / pelabuhan asal */
  originPort: "Tanjung Priok, Jakarta",

  /** Default pickup address untuk order truk */
  pickupAddress: "Jl. Logistik No. 1, Jakarta",

  /** Panjang maksimal nama perusahaan sebelum fallback ke brandName di navbar */
  brandNameMaxLength: 22,

  /** Panjang maksimal nama di footer sebelum fallback ke brandName */
  brandNameMaxLengthFooter: 24,

  /** Informasi kantor fisik */
  office: {
    label: "Kantor Tangerang",
    lines: [
      "GEDUNG SPORT CENTER",
      "Sport Center Soekarno Hatta",
      "Jl. C3 No. 831 RT 001 RW 010",
      "Belakang Masjid Nurul Barkah",
      "Pajang Benda, Tangerang Kota",
      "Banten 15126",
    ],
    mapsUrl:
      "https://www.google.com/maps?q=Sport+Center+Soekarno+Hatta+Jl+C3+No+831+Pajang+Benda+Tangerang+Banten",
  },
} as const;
