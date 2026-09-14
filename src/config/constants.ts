/**
 * constants.ts — Konstanta UI dan perilaku aplikasi.
 *
 * Sentralisasi magic numbers agar mudah diubah tanpa hunting ke seluruh kodebase.
 */

/** Timing (dalam milidetik) untuk interaksi UI */
export const UI_TIMING = {
  /** Delay sebelum redirect ke login setelah reset password berhasil */
  RESET_PASSWORD_REDIRECT_MS: 3000,

  /** Delay sebelum auto-dismiss notifikasi di halaman tracking logistik */
  TRACK_NOTIFICATION_DISMISS_MS: 6000,

  /** Delay sebelum auto-refresh tracking setelah aksi manual */
  TRACK_REFRESH_DELAY_MS: 1000,

  /** Durasi feedback "Copied!" sebelum kembali ke state normal */
  COPY_FEEDBACK_RESET_MS: 1800,

  /** Debounce input pencarian lokasi (LocationCombobox) */
  LOCATION_SEARCH_DEBOUNCE_MS: 400,

  /** Delay smooth-scroll setelah navigasi hash */
  SCROLL_AFTER_NAV_MS: 150,
} as const;

/** Konfigurasi fitur Marketplace */
export const MARKETPLACE_CONFIG = {
  /** Jumlah maksimal produk yang bisa dibandingkan sekaligus */
  MAX_COMPARISON_ITEMS: 3,

  /** Jumlah minimal item untuk mengaktifkan tombol Compare */
  MIN_COMPARISON_ITEMS: 2,

  /** Jumlah slot perbandingan yang ditampilkan di tray UI */
  COMPARISON_SLOTS: 4,
} as const;
