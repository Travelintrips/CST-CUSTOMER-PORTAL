// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { SUPPORTED_LOCALES, RTL_LOCALES, loadLocale, getCachedLocale, type SupportedLocale } from "./translations";

const STORAGE_KEY = "app_language";
const CACHE_PREFIX = "trs_cache_v1_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolve(obj: Record<string, unknown>, keys: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Unflatten { "a.b.c": "val" } → { a: { b: { c: "val" } } } */
function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split(".");
    let cur: Record<string, unknown> = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return root;
}

/** Deep merge: base is overridden by overlay where overlay has values */
function deepMerge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    if (v !== undefined && v !== null) {
      if (typeof v === "object" && typeof base[k] === "object" && base[k] !== null) {
        out[k] = deepMerge(base[k] as Record<string, unknown>, v as Record<string, unknown>);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

/**
 * Some legacy locale bundles still contain untranslated Indonesian values.
 * For non-Indonesian locales, replace an exact Indonesian carry-over with the
 * English canonical value when one exists. This prevents mixed Indonesian UI
 * while preserving genuine translations and locale-specific remote overrides.
 */
function sanitizeNonIndonesianLocale(
  locale: string,
  candidate: Record<string, unknown>,
  idSource: Record<string, unknown>,
  enSource: Record<string, unknown>,
): Record<string, unknown> {
  if (locale === "id-ID") return candidate;
  const walk = (
    current: Record<string, unknown>,
    idNode: Record<string, unknown> | undefined,
    enNode: Record<string, unknown> | undefined,
  ): Record<string, unknown> => {
    const out: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(current)) {
      const idValue = idNode?.[key];
      const enValue = enNode?.[key];
      if (typeof value === "string") {
        if (
          typeof idValue === "string" &&
          typeof enValue === "string" &&
          value.trim() === idValue.trim() &&
          enValue.trim() !== idValue.trim()
        ) {
          out[key] = enValue;
        }
        continue;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        out[key] = walk(
          value as Record<string, unknown>,
          idValue && typeof idValue === "object" && !Array.isArray(idValue)
            ? idValue as Record<string, unknown>
            : undefined,
          enValue && typeof enValue === "object" && !Array.isArray(enValue)
            ? enValue as Record<string, unknown>
            : undefined,
        );
      }
    }
    return out;
  };
  return walk(candidate, idSource, enSource);
}

// ── localStorage cache ────────────────────────────────────────────────────────

function readCache(locale: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${locale}`);
    if (!raw) return null;
    const { data, fetchedAt } = JSON.parse(raw) as { data: Record<string, string>; fetchedAt: number };
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return unflatten(data);
  } catch {
    return null;
  }
}

function writeCache(locale: string, flat: Record<string, string>) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${locale}`,
      JSON.stringify({ data: flat, fetchedAt: Date.now() })
    );
  } catch {}
}

// ── Locale init ───────────────────────────────────────────────────────────────

function getInitialLocale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) return stored;
  } catch {}
  const browser = navigator.language;
  const exact = SUPPORTED_LOCALES.find((l) => l === browser);
  if (exact) return exact;
  const partial = SUPPORTED_LOCALES.find((l) => l.split("-")[0] === browser.split("-")[0]);
  return partial ?? "id-ID";
}

function applyDocumentLocale(locale: string) {
  const isRTL = RTL_LOCALES.includes(locale);
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = locale;
}

/** Build the effective translations object for a locale (sync, uses cache). */
function buildLocaleDict(locale: string, remote?: Record<string, unknown> | null) {
  const bundled = (getCachedLocale(locale) ??
    getCachedLocale("en-US") ??
    getCachedLocale("id-ID") ??
    {}) as Record<string, unknown>;
  const merged = !remote || Object.keys(remote).length === 0
    ? bundled
    : deepMerge(bundled, remote);
  const idSource = (getCachedLocale("id-ID") ?? {}) as Record<string, unknown>;
  const enSource = (getCachedLocale("en-US") ?? {}) as Record<string, unknown>;
  return sanitizeNonIndonesianLocale(locale, merged, idSource, enSource);
}

// ── Fetch from API ────────────────────────────────────────────────────────────

async function fetchRemoteTranslations(locale: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`/api/translations/customer-portal/${encodeURIComponent(locale)}`, {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = await res.json() as Record<string, string>;
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) return null;
    return data;
  } catch {
    return null;
  }
}



function flattenStrings(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[full] = value;
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenStrings(value as Record<string, unknown>, full, out);
    }
  }
  return out;
}

const legacyTextSource = new WeakMap<Text, string>();
const legacyAttrSource = new WeakMap<Element, Map<string, string>>();

const LEGACY_ADMIN_LITERAL_OVERRIDES: Record<string, Record<string, string>> = {
  "en": {
    "Operations": "Operations",
    "Semua Layanan": "All Services",
    "Operasional Trucking": "Trucking Operations",
    "Invoice & Payment": "Invoice & Payment",
    "Riwayat Pembayaran": "Payment History",
    "Website & Konten": "Website & Content",
    "Konten Website": "Website Content",
    "Kelola Layanan": "Manage Services",
    "Kelola Produk": "Manage Products",
    "Kurir": "Couriers",
    "Kelola Harga": "Manage Pricing",
    "Armada Trucking": "Trucking Fleet",
    "Katalog Vendor": "Vendor Catalogue",
    "Marketplace Operations": "Marketplace Operations",
    "Produk Unggulan": "Featured Products",
    "Vendor & Pengguna": "Vendors & Users",
    "Undang Vendor": "Invite Vendor",
    "Approvals": "Approvals",
    "Pelanggan": "Customers",
    "Status Koneksi Fonnte": "Fonnte Connection Status",
    "Kelola Chatbot": "Manage Chatbot",
    "Sistem": "System",
    "Paylabs Setting": "Paylabs Settings",
    "Utilitas": "Utilities",
    "Aktivasi Admin": "Admin Activation",
    "Semua layanan dalam satu antrean": "All services in one queue",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "A single view for canonical Marketplace, freight, trucking, customs, and service-request transactions. Marketplace details and actions are managed directly from this panel.",
    "Notifikasi": "Notifications",
    "Refresh": "Refresh",
    "Inbox admin": "Admin inbox",
    "Notifikasi memakai tabel dan SSE existing.": "Notifications use the existing table and SSE.",
    "Tandai semua dibaca": "Mark all as read",
    "Belum ada notifikasi.": "No notifications yet.",
    "Total antrean": "Total queue",
    "Cari nomor, customer, perusahaan, rute...": "Search number, customer, company, route...",
    "Semua status": "All statuses",
    "Layanan": "Service",
    "Referensi / Customer": "Reference / Customer",
    "Dibuat": "Created",
    "Memuat workload...": "Loading workload...",
    "Tidak ada transaksi sesuai filter.": "No transactions match the current filters.",
    "Mapping perlu review": "Mapping needs review"
  },
  "zh-CN": {
    "Operations": "运营",
    "Semua Layanan": "所有服务",
    "Operasional Trucking": "卡车运输运营",
    "Invoice & Payment": "发票与付款",
    "Riwayat Pembayaran": "付款记录",
    "Website & Konten": "网站与内容",
    "Konten Website": "网站内容",
    "Kelola Layanan": "管理服务",
    "Kelola Produk": "管理产品",
    "Kurir": "快递服务",
    "Kelola Harga": "管理价格",
    "Armada Trucking": "卡车车队",
    "Katalog Vendor": "供应商目录",
    "Marketplace Operations": "商城运营",
    "Produk Unggulan": "推荐产品",
    "Vendor & Pengguna": "供应商与用户",
    "Undang Vendor": "邀请供应商",
    "Approvals": "审批",
    "Pelanggan": "客户",
    "Status Koneksi Fonnte": "Fonnte 连接状态",
    "Kelola Chatbot": "管理聊天机器人",
    "Sistem": "系统",
    "Paylabs Setting": "Paylabs 设置",
    "Utilitas": "工具",
    "Aktivasi Admin": "管理员激活",
    "Semua layanan dalam satu antrean": "所有服务统一排队",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "在一个视图中管理商城、货运、卡车运输、报关和服务请求的标准交易。商城详情和操作可直接在此面板中管理。",
    "Notifikasi": "通知",
    "Refresh": "刷新",
    "Inbox admin": "管理员收件箱",
    "Notifikasi memakai tabel dan SSE existing.": "通知使用现有数据表和 SSE。",
    "Tandai semua dibaca": "全部标为已读",
    "Belum ada notifikasi.": "暂无通知。",
    "Total antrean": "队列总数",
    "Cari nomor, customer, perusahaan, rute...": "搜索编号、客户、公司、路线...",
    "Semua status": "所有状态",
    "Layanan": "服务",
    "Referensi / Customer": "参考 / 客户",
    "Dibuat": "创建时间",
    "Memuat workload...": "正在加载工作队列...",
    "Tidak ada transaksi sesuai filter.": "没有符合当前筛选条件的交易。",
    "Mapping perlu review": "映射需要审核"
  },
  "zh-TW": {
    "Operations": "營運",
    "Semua Layanan": "所有服務",
    "Operasional Trucking": "卡車運輸營運",
    "Invoice & Payment": "發票與付款",
    "Riwayat Pembayaran": "付款紀錄",
    "Website & Konten": "網站與內容",
    "Konten Website": "網站內容",
    "Kelola Layanan": "管理服務",
    "Kelola Produk": "管理產品",
    "Kurir": "快遞服務",
    "Kelola Harga": "管理價格",
    "Armada Trucking": "卡車車隊",
    "Katalog Vendor": "供應商目錄",
    "Marketplace Operations": "商城營運",
    "Produk Unggulan": "推薦產品",
    "Vendor & Pengguna": "供應商與使用者",
    "Undang Vendor": "邀請供應商",
    "Approvals": "審批",
    "Pelanggan": "客戶",
    "Status Koneksi Fonnte": "Fonnte 連線狀態",
    "Kelola Chatbot": "管理聊天機器人",
    "Sistem": "系統",
    "Paylabs Setting": "Paylabs 設定",
    "Utilitas": "工具",
    "Aktivasi Admin": "管理員啟用",
    "Semua layanan dalam satu antrean": "所有服務統一排隊",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "在單一檢視中管理商城、貨運、卡車運輸、報關及服務請求的標準交易。商城詳細資料與操作可直接在此面板管理。",
    "Notifikasi": "通知",
    "Refresh": "重新整理",
    "Inbox admin": "管理員收件匣",
    "Notifikasi memakai tabel dan SSE existing.": "通知使用現有資料表與 SSE。",
    "Tandai semua dibaca": "全部標為已讀",
    "Belum ada notifikasi.": "目前沒有通知。",
    "Total antrean": "佇列總數",
    "Cari nomor, customer, perusahaan, rute...": "搜尋編號、客戶、公司、路線...",
    "Semua status": "所有狀態",
    "Layanan": "服務",
    "Referensi / Customer": "參考 / 客戶",
    "Dibuat": "建立時間",
    "Memuat workload...": "正在載入工作佇列...",
    "Tidak ada transaksi sesuai filter.": "沒有符合目前篩選條件的交易。",
    "Mapping perlu review": "映射需要審核"
  },
  "ja": {
    "Operations": "オペレーション",
    "Semua Layanan": "すべてのサービス",
    "Operasional Trucking": "トラック輸送オペレーション",
    "Invoice & Payment": "請求書・支払い",
    "Riwayat Pembayaran": "支払い履歴",
    "Website & Konten": "Webサイト・コンテンツ",
    "Konten Website": "Webサイトコンテンツ",
    "Kelola Layanan": "サービス管理",
    "Kelola Produk": "商品管理",
    "Kurir": "配送業者",
    "Kelola Harga": "価格管理",
    "Armada Trucking": "トラック車両",
    "Katalog Vendor": "ベンダーカタログ",
    "Marketplace Operations": "マーケットプレイス運営",
    "Produk Unggulan": "注目商品",
    "Vendor & Pengguna": "ベンダー・ユーザー",
    "Undang Vendor": "ベンダーを招待",
    "Approvals": "承認",
    "Pelanggan": "顧客",
    "Status Koneksi Fonnte": "Fonnte 接続状態",
    "Kelola Chatbot": "チャットボット管理",
    "Sistem": "システム",
    "Paylabs Setting": "Paylabs 設定",
    "Utilitas": "ユーティリティ",
    "Aktivasi Admin": "管理者有効化",
    "Semua layanan dalam satu antrean": "すべてのサービスを1つのキューで管理",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "マーケットプレイス、貨物輸送、トラック輸送、通関、サービス依頼の標準トランザクションを1画面で管理します。マーケットプレイスの詳細と操作もこのパネルから直接管理できます。",
    "Notifikasi": "通知",
    "Refresh": "更新",
    "Inbox admin": "管理者受信箱",
    "Notifikasi memakai tabel dan SSE existing.": "通知は既存のテーブルとSSEを使用します。",
    "Tandai semua dibaca": "すべて既読にする",
    "Belum ada notifikasi.": "通知はまだありません。",
    "Total antrean": "キュー合計",
    "Cari nomor, customer, perusahaan, rute...": "番号、顧客、会社、ルートを検索...",
    "Semua status": "すべてのステータス",
    "Layanan": "サービス",
    "Referensi / Customer": "参照 / 顧客",
    "Dibuat": "作成日時",
    "Memuat workload...": "ワークロードを読み込み中...",
    "Tidak ada transaksi sesuai filter.": "現在のフィルターに一致する取引はありません。",
    "Mapping perlu review": "マッピングの確認が必要"
  },
  "ko": {
    "Operations": "운영",
    "Semua Layanan": "모든 서비스",
    "Operasional Trucking": "트럭 운송 운영",
    "Invoice & Payment": "청구서 및 결제",
    "Riwayat Pembayaran": "결제 내역",
    "Website & Konten": "웹사이트 및 콘텐츠",
    "Konten Website": "웹사이트 콘텐츠",
    "Kelola Layanan": "서비스 관리",
    "Kelola Produk": "제품 관리",
    "Kurir": "배송업체",
    "Kelola Harga": "가격 관리",
    "Armada Trucking": "트럭 차량",
    "Katalog Vendor": "공급업체 카탈로그",
    "Marketplace Operations": "마켓플레이스 운영",
    "Produk Unggulan": "추천 제품",
    "Vendor & Pengguna": "공급업체 및 사용자",
    "Undang Vendor": "공급업체 초대",
    "Approvals": "승인",
    "Pelanggan": "고객",
    "Status Koneksi Fonnte": "Fonnte 연결 상태",
    "Kelola Chatbot": "챗봇 관리",
    "Sistem": "시스템",
    "Paylabs Setting": "Paylabs 설정",
    "Utilitas": "유틸리티",
    "Aktivasi Admin": "관리자 활성화",
    "Semua layanan dalam satu antrean": "모든 서비스를 하나의 대기열에서 관리",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "마켓플레이스, 화물, 트럭 운송, 통관 및 서비스 요청의 표준 거래를 한 화면에서 관리합니다. 마켓플레이스 세부정보와 작업도 이 패널에서 직접 관리할 수 있습니다.",
    "Notifikasi": "알림",
    "Refresh": "새로고침",
    "Inbox admin": "관리자 받은편지함",
    "Notifikasi memakai tabel dan SSE existing.": "알림은 기존 테이블과 SSE를 사용합니다.",
    "Tandai semua dibaca": "모두 읽음으로 표시",
    "Belum ada notifikasi.": "알림이 없습니다.",
    "Total antrean": "총 대기열",
    "Cari nomor, customer, perusahaan, rute...": "번호, 고객, 회사, 경로 검색...",
    "Semua status": "모든 상태",
    "Layanan": "서비스",
    "Referensi / Customer": "참조 / 고객",
    "Dibuat": "생성일",
    "Memuat workload...": "작업 대기열 로드 중...",
    "Tidak ada transaksi sesuai filter.": "현재 필터와 일치하는 거래가 없습니다.",
    "Mapping perlu review": "매핑 검토 필요"
  },
  "ms": {
    "Operations": "Operasi",
    "Semua Layanan": "Semua Perkhidmatan",
    "Operasional Trucking": "Operasi Trak",
    "Invoice & Payment": "Invois & Pembayaran",
    "Riwayat Pembayaran": "Sejarah Pembayaran",
    "Website & Konten": "Laman Web & Kandungan",
    "Konten Website": "Kandungan Laman Web",
    "Kelola Layanan": "Urus Perkhidmatan",
    "Kelola Produk": "Urus Produk",
    "Kurir": "Kurier",
    "Kelola Harga": "Urus Harga",
    "Armada Trucking": "Armada Trak",
    "Katalog Vendor": "Katalog Vendor",
    "Marketplace Operations": "Operasi Marketplace",
    "Produk Unggulan": "Produk Pilihan",
    "Vendor & Pengguna": "Vendor & Pengguna",
    "Undang Vendor": "Jemput Vendor",
    "Approvals": "Kelulusan",
    "Pelanggan": "Pelanggan",
    "Status Koneksi Fonnte": "Status Sambungan Fonnte",
    "Kelola Chatbot": "Urus Chatbot",
    "Sistem": "Sistem",
    "Paylabs Setting": "Tetapan Paylabs",
    "Utilitas": "Utiliti",
    "Aktivasi Admin": "Pengaktifan Admin",
    "Semua layanan dalam satu antrean": "Semua perkhidmatan dalam satu barisan",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Satu paparan untuk transaksi kanonik Marketplace, fret, trak, kastam dan permintaan perkhidmatan. Butiran dan tindakan Marketplace diurus terus dari panel ini.",
    "Notifikasi": "Pemberitahuan",
    "Refresh": "Muat Semula",
    "Inbox admin": "Peti masuk admin",
    "Notifikasi memakai tabel dan SSE existing.": "Pemberitahuan menggunakan jadual dan SSE sedia ada.",
    "Tandai semua dibaca": "Tandakan semua telah dibaca",
    "Belum ada notifikasi.": "Belum ada pemberitahuan.",
    "Total antrean": "Jumlah barisan",
    "Cari nomor, customer, perusahaan, rute...": "Cari nombor, pelanggan, syarikat, laluan...",
    "Semua status": "Semua status",
    "Layanan": "Perkhidmatan",
    "Referensi / Customer": "Rujukan / Pelanggan",
    "Dibuat": "Dicipta",
    "Memuat workload...": "Memuatkan beban kerja...",
    "Tidak ada transaksi sesuai filter.": "Tiada transaksi sepadan dengan penapis semasa.",
    "Mapping perlu review": "Pemetaan perlu semakan"
  },
  "de": {
    "Operations": "Betrieb",
    "Semua Layanan": "Alle Dienste",
    "Operasional Trucking": "Lkw-Betrieb",
    "Invoice & Payment": "Rechnung & Zahlung",
    "Riwayat Pembayaran": "Zahlungsverlauf",
    "Website & Konten": "Website & Inhalte",
    "Konten Website": "Website-Inhalte",
    "Kelola Layanan": "Dienste verwalten",
    "Kelola Produk": "Produkte verwalten",
    "Kurir": "Kuriere",
    "Kelola Harga": "Preise verwalten",
    "Armada Trucking": "Lkw-Flotte",
    "Katalog Vendor": "Anbieterkatalog",
    "Marketplace Operations": "Marketplace-Betrieb",
    "Produk Unggulan": "Empfohlene Produkte",
    "Vendor & Pengguna": "Anbieter & Benutzer",
    "Undang Vendor": "Anbieter einladen",
    "Approvals": "Genehmigungen",
    "Pelanggan": "Kunden",
    "Status Koneksi Fonnte": "Fonnte-Verbindungsstatus",
    "Kelola Chatbot": "Chatbot verwalten",
    "Sistem": "System",
    "Paylabs Setting": "Paylabs-Einstellungen",
    "Utilitas": "Werkzeuge",
    "Aktivasi Admin": "Admin-Aktivierung",
    "Semua layanan dalam satu antrean": "Alle Dienste in einer Warteschlange",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Eine Ansicht für kanonische Marketplace-, Fracht-, Lkw-, Zoll- und Serviceanfragen. Marketplace-Details und Aktionen werden direkt in diesem Panel verwaltet.",
    "Notifikasi": "Benachrichtigungen",
    "Refresh": "Aktualisieren",
    "Inbox admin": "Admin-Posteingang",
    "Notifikasi memakai tabel dan SSE existing.": "Benachrichtigungen verwenden die bestehende Tabelle und SSE.",
    "Tandai semua dibaca": "Alle als gelesen markieren",
    "Belum ada notifikasi.": "Noch keine Benachrichtigungen.",
    "Total antrean": "Gesamt in Warteschlange",
    "Cari nomor, customer, perusahaan, rute...": "Nummer, Kunde, Unternehmen, Route suchen...",
    "Semua status": "Alle Status",
    "Layanan": "Dienst",
    "Referensi / Customer": "Referenz / Kunde",
    "Dibuat": "Erstellt",
    "Memuat workload...": "Arbeitslast wird geladen...",
    "Tidak ada transaksi sesuai filter.": "Keine Transaktionen entsprechen den aktuellen Filtern.",
    "Mapping perlu review": "Zuordnung muss geprüft werden"
  },
  "fr": {
    "Operations": "Opérations",
    "Semua Layanan": "Tous les services",
    "Operasional Trucking": "Opérations de transport routier",
    "Invoice & Payment": "Facture & paiement",
    "Riwayat Pembayaran": "Historique des paiements",
    "Website & Konten": "Site web & contenu",
    "Konten Website": "Contenu du site",
    "Kelola Layanan": "Gérer les services",
    "Kelola Produk": "Gérer les produits",
    "Kurir": "Coursiers",
    "Kelola Harga": "Gérer les tarifs",
    "Armada Trucking": "Flotte de camions",
    "Katalog Vendor": "Catalogue fournisseurs",
    "Marketplace Operations": "Opérations Marketplace",
    "Produk Unggulan": "Produits en vedette",
    "Vendor & Pengguna": "Fournisseurs & utilisateurs",
    "Undang Vendor": "Inviter un fournisseur",
    "Approvals": "Approbations",
    "Pelanggan": "Clients",
    "Status Koneksi Fonnte": "État de connexion Fonnte",
    "Kelola Chatbot": "Gérer le chatbot",
    "Sistem": "Système",
    "Paylabs Setting": "Paramètres Paylabs",
    "Utilitas": "Utilitaires",
    "Aktivasi Admin": "Activation administrateur",
    "Semua layanan dalam satu antrean": "Tous les services dans une seule file",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Une vue unique pour les transactions canoniques Marketplace, fret, transport routier, douane et demandes de service. Les détails et actions Marketplace sont gérés directement depuis ce panneau.",
    "Notifikasi": "Notifications",
    "Refresh": "Actualiser",
    "Inbox admin": "Boîte de réception admin",
    "Notifikasi memakai tabel dan SSE existing.": "Les notifications utilisent la table et le SSE existants.",
    "Tandai semua dibaca": "Tout marquer comme lu",
    "Belum ada notifikasi.": "Aucune notification pour le moment.",
    "Total antrean": "Total de la file",
    "Cari nomor, customer, perusahaan, rute...": "Rechercher numéro, client, entreprise, itinéraire...",
    "Semua status": "Tous les statuts",
    "Layanan": "Service",
    "Referensi / Customer": "Référence / Client",
    "Dibuat": "Créé",
    "Memuat workload...": "Chargement de la file...",
    "Tidak ada transaksi sesuai filter.": "Aucune transaction ne correspond aux filtres actuels.",
    "Mapping perlu review": "Le mapping doit être vérifié"
  },
  "nl": {
    "Operations": "Operaties",
    "Semua Layanan": "Alle diensten",
    "Operasional Trucking": "Trucking-operaties",
    "Invoice & Payment": "Factuur & betaling",
    "Riwayat Pembayaran": "Betalingsgeschiedenis",
    "Website & Konten": "Website & inhoud",
    "Konten Website": "Website-inhoud",
    "Kelola Layanan": "Diensten beheren",
    "Kelola Produk": "Producten beheren",
    "Kurir": "Koeriers",
    "Kelola Harga": "Prijzen beheren",
    "Armada Trucking": "Truckvloot",
    "Katalog Vendor": "Leverancierscatalogus",
    "Marketplace Operations": "Marketplace-operaties",
    "Produk Unggulan": "Uitgelichte producten",
    "Vendor & Pengguna": "Leveranciers & gebruikers",
    "Undang Vendor": "Leverancier uitnodigen",
    "Approvals": "Goedkeuringen",
    "Pelanggan": "Klanten",
    "Status Koneksi Fonnte": "Fonnte-verbindingsstatus",
    "Kelola Chatbot": "Chatbot beheren",
    "Sistem": "Systeem",
    "Paylabs Setting": "Paylabs-instellingen",
    "Utilitas": "Hulpmiddelen",
    "Aktivasi Admin": "Admin activeren",
    "Semua layanan dalam satu antrean": "Alle diensten in één wachtrij",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Eén overzicht voor canonieke Marketplace-, vracht-, trucking-, douane- en serviceaanvraagtransacties. Marketplace-details en acties worden rechtstreeks vanuit dit paneel beheerd.",
    "Notifikasi": "Meldingen",
    "Refresh": "Vernieuwen",
    "Inbox admin": "Admin-inbox",
    "Notifikasi memakai tabel dan SSE existing.": "Meldingen gebruiken de bestaande tabel en SSE.",
    "Tandai semua dibaca": "Alles als gelezen markeren",
    "Belum ada notifikasi.": "Nog geen meldingen.",
    "Total antrean": "Totaal in wachtrij",
    "Cari nomor, customer, perusahaan, rute...": "Zoek nummer, klant, bedrijf, route...",
    "Semua status": "Alle statussen",
    "Layanan": "Dienst",
    "Referensi / Customer": "Referentie / Klant",
    "Dibuat": "Aangemaakt",
    "Memuat workload...": "Werkbelasting laden...",
    "Tidak ada transaksi sesuai filter.": "Geen transacties passen bij de huidige filters.",
    "Mapping perlu review": "Mapping moet worden gecontroleerd"
  },
  "es": {
    "Operations": "Operaciones",
    "Semua Layanan": "Todos los servicios",
    "Operasional Trucking": "Operaciones de transporte terrestre",
    "Invoice & Payment": "Factura y pago",
    "Riwayat Pembayaran": "Historial de pagos",
    "Website & Konten": "Sitio web y contenido",
    "Konten Website": "Contenido del sitio",
    "Kelola Layanan": "Gestionar servicios",
    "Kelola Produk": "Gestionar productos",
    "Kurir": "Mensajería",
    "Kelola Harga": "Gestionar precios",
    "Armada Trucking": "Flota de camiones",
    "Katalog Vendor": "Catálogo de proveedores",
    "Marketplace Operations": "Operaciones del Marketplace",
    "Produk Unggulan": "Productos destacados",
    "Vendor & Pengguna": "Proveedores y usuarios",
    "Undang Vendor": "Invitar proveedor",
    "Approvals": "Aprobaciones",
    "Pelanggan": "Clientes",
    "Status Koneksi Fonnte": "Estado de conexión de Fonnte",
    "Kelola Chatbot": "Gestionar chatbot",
    "Sistem": "Sistema",
    "Paylabs Setting": "Configuración de Paylabs",
    "Utilitas": "Utilidades",
    "Aktivasi Admin": "Activación de administrador",
    "Semua layanan dalam satu antrean": "Todos los servicios en una sola cola",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Una sola vista para transacciones canónicas de Marketplace, carga, transporte terrestre, aduanas y solicitudes de servicio. Los detalles y acciones del Marketplace se gestionan directamente desde este panel.",
    "Notifikasi": "Notificaciones",
    "Refresh": "Actualizar",
    "Inbox admin": "Bandeja del administrador",
    "Notifikasi memakai tabel dan SSE existing.": "Las notificaciones usan la tabla y SSE existentes.",
    "Tandai semua dibaca": "Marcar todo como leído",
    "Belum ada notifikasi.": "Aún no hay notificaciones.",
    "Total antrean": "Total en cola",
    "Cari nomor, customer, perusahaan, rute...": "Buscar número, cliente, empresa, ruta...",
    "Semua status": "Todos los estados",
    "Layanan": "Servicio",
    "Referensi / Customer": "Referencia / Cliente",
    "Dibuat": "Creado",
    "Memuat workload...": "Cargando cola de trabajo...",
    "Tidak ada transaksi sesuai filter.": "No hay transacciones que coincidan con los filtros actuales.",
    "Mapping perlu review": "El mapeo requiere revisión"
  },
  "it": {
    "Operations": "Operazioni",
    "Semua Layanan": "Tutti i servizi",
    "Operasional Trucking": "Operazioni di trasporto su strada",
    "Invoice & Payment": "Fattura e pagamento",
    "Riwayat Pembayaran": "Cronologia pagamenti",
    "Website & Konten": "Sito web e contenuti",
    "Konten Website": "Contenuti del sito",
    "Kelola Layanan": "Gestisci servizi",
    "Kelola Produk": "Gestisci prodotti",
    "Kurir": "Corrieri",
    "Kelola Harga": "Gestisci prezzi",
    "Armada Trucking": "Flotta camion",
    "Katalog Vendor": "Catalogo fornitori",
    "Marketplace Operations": "Operazioni Marketplace",
    "Produk Unggulan": "Prodotti in evidenza",
    "Vendor & Pengguna": "Fornitori e utenti",
    "Undang Vendor": "Invita fornitore",
    "Approvals": "Approvazioni",
    "Pelanggan": "Clienti",
    "Status Koneksi Fonnte": "Stato connessione Fonnte",
    "Kelola Chatbot": "Gestisci chatbot",
    "Sistem": "Sistema",
    "Paylabs Setting": "Impostazioni Paylabs",
    "Utilitas": "Utilità",
    "Aktivasi Admin": "Attivazione amministratore",
    "Semua layanan dalam satu antrean": "Tutti i servizi in un'unica coda",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Un'unica vista per le transazioni canoniche di Marketplace, trasporto merci, autotrasporto, dogana e richieste di servizio. Dettagli e azioni Marketplace sono gestiti direttamente da questo pannello.",
    "Notifikasi": "Notifiche",
    "Refresh": "Aggiorna",
    "Inbox admin": "Posta amministratore",
    "Notifikasi memakai tabel dan SSE existing.": "Le notifiche usano la tabella e SSE esistenti.",
    "Tandai semua dibaca": "Segna tutto come letto",
    "Belum ada notifikasi.": "Nessuna notifica.",
    "Total antrean": "Totale in coda",
    "Cari nomor, customer, perusahaan, rute...": "Cerca numero, cliente, azienda, percorso...",
    "Semua status": "Tutti gli stati",
    "Layanan": "Servizio",
    "Referensi / Customer": "Riferimento / Cliente",
    "Dibuat": "Creato",
    "Memuat workload...": "Caricamento coda di lavoro...",
    "Tidak ada transaksi sesuai filter.": "Nessuna transazione corrisponde ai filtri correnti.",
    "Mapping perlu review": "La mappatura richiede revisione"
  },
  "hi": {
    "Operations": "संचालन",
    "Semua Layanan": "सभी सेवाएँ",
    "Operasional Trucking": "ट्रकिंग संचालन",
    "Invoice & Payment": "इनवॉइस और भुगतान",
    "Riwayat Pembayaran": "भुगतान इतिहास",
    "Website & Konten": "वेबसाइट और सामग्री",
    "Konten Website": "वेबसाइट सामग्री",
    "Kelola Layanan": "सेवाएँ प्रबंधित करें",
    "Kelola Produk": "उत्पाद प्रबंधित करें",
    "Kurir": "कूरियर",
    "Kelola Harga": "मूल्य प्रबंधित करें",
    "Armada Trucking": "ट्रक बेड़ा",
    "Katalog Vendor": "विक्रेता कैटलॉग",
    "Marketplace Operations": "मार्केटप्लेस संचालन",
    "Produk Unggulan": "विशेष उत्पाद",
    "Vendor & Pengguna": "विक्रेता और उपयोगकर्ता",
    "Undang Vendor": "विक्रेता आमंत्रित करें",
    "Approvals": "स्वीकृतियाँ",
    "Pelanggan": "ग्राहक",
    "Status Koneksi Fonnte": "Fonnte कनेक्शन स्थिति",
    "Kelola Chatbot": "चैटबॉट प्रबंधित करें",
    "Sistem": "सिस्टम",
    "Paylabs Setting": "Paylabs सेटिंग्स",
    "Utilitas": "उपयोगिताएँ",
    "Aktivasi Admin": "एडमिन सक्रियण",
    "Semua layanan dalam satu antrean": "सभी सेवाएँ एक ही कतार में",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "Marketplace, माल ढुलाई, ट्रकिंग, सीमा शुल्क और सेवा अनुरोधों के कैनोनिकल लेनदेन के लिए एक ही दृश्य। Marketplace के विवरण और कार्रवाइयाँ सीधे इसी पैनल से प्रबंधित की जाती हैं।",
    "Notifikasi": "सूचनाएँ",
    "Refresh": "रीफ़्रेश",
    "Inbox admin": "एडमिन इनबॉक्स",
    "Notifikasi memakai tabel dan SSE existing.": "सूचनाएँ मौजूदा तालिका और SSE का उपयोग करती हैं।",
    "Tandai semua dibaca": "सभी को पढ़ा हुआ चिह्नित करें",
    "Belum ada notifikasi.": "अभी कोई सूचना नहीं है।",
    "Total antrean": "कुल कतार",
    "Cari nomor, customer, perusahaan, rute...": "नंबर, ग्राहक, कंपनी, मार्ग खोजें...",
    "Semua status": "सभी स्थितियाँ",
    "Layanan": "सेवा",
    "Referensi / Customer": "संदर्भ / ग्राहक",
    "Dibuat": "बनाया गया",
    "Memuat workload...": "कार्य कतार लोड हो रही है...",
    "Tidak ada transaksi sesuai filter.": "मौजूदा फ़िल्टर से कोई लेनदेन मेल नहीं खाता।",
    "Mapping perlu review": "मैपिंग की समीक्षा आवश्यक है"
  },
  "ar": {
    "Operations": "العمليات",
    "Semua Layanan": "جميع الخدمات",
    "Operasional Trucking": "عمليات النقل بالشاحنات",
    "Invoice & Payment": "الفواتير والدفع",
    "Riwayat Pembayaran": "سجل المدفوعات",
    "Website & Konten": "الموقع والمحتوى",
    "Konten Website": "محتوى الموقع",
    "Kelola Layanan": "إدارة الخدمات",
    "Kelola Produk": "إدارة المنتجات",
    "Kurir": "خدمات التوصيل",
    "Kelola Harga": "إدارة الأسعار",
    "Armada Trucking": "أسطول الشاحنات",
    "Katalog Vendor": "كتالوج الموردين",
    "Marketplace Operations": "عمليات السوق",
    "Produk Unggulan": "المنتجات المميزة",
    "Vendor & Pengguna": "الموردون والمستخدمون",
    "Undang Vendor": "دعوة مورد",
    "Approvals": "الموافقات",
    "Pelanggan": "العملاء",
    "Status Koneksi Fonnte": "حالة اتصال Fonnte",
    "Kelola Chatbot": "إدارة روبوت المحادثة",
    "Sistem": "النظام",
    "Paylabs Setting": "إعدادات Paylabs",
    "Utilitas": "الأدوات",
    "Aktivasi Admin": "تفعيل المشرف",
    "Semua layanan dalam satu antrean": "جميع الخدمات في قائمة انتظار واحدة",
    "Satu tampilan untuk transaksi canonical dari Marketplace, freight, trucking, kepabeanan, dan request layanan. Detail serta tindakan Marketplace dikelola langsung dari panel ini.": "عرض موحد للمعاملات القياسية للسوق والشحن والنقل بالشاحنات والجمارك وطلبات الخدمات. تتم إدارة تفاصيل وإجراءات السوق مباشرة من هذه اللوحة.",
    "Notifikasi": "الإشعارات",
    "Refresh": "تحديث",
    "Inbox admin": "صندوق وارد المشرف",
    "Notifikasi memakai tabel dan SSE existing.": "تستخدم الإشعارات الجدول وSSE الحاليين.",
    "Tandai semua dibaca": "تحديد الكل كمقروء",
    "Belum ada notifikasi.": "لا توجد إشعارات بعد.",
    "Total antrean": "إجمالي قائمة الانتظار",
    "Cari nomor, customer, perusahaan, rute...": "ابحث عن رقم أو عميل أو شركة أو مسار...",
    "Semua status": "جميع الحالات",
    "Layanan": "الخدمة",
    "Referensi / Customer": "المرجع / العميل",
    "Dibuat": "تاريخ الإنشاء",
    "Memuat workload...": "جارٍ تحميل قائمة العمل...",
    "Tidak ada transaksi sesuai filter.": "لا توجد معاملات تطابق عوامل التصفية الحالية.",
    "Mapping perlu review": "يحتاج الربط إلى مراجعة"
  }
};

function legacyAdminOverridesFor(locale: string): Record<string, string> {
  const target = LEGACY_ADMIN_LITERAL_OVERRIDES[locale] ?? LEGACY_ADMIN_LITERAL_OVERRIDES[locale.split("-")[0]] ?? {};
  if (locale.startsWith("en") || Object.keys(target).length === 0) return target;

  // The locale sanitizer intentionally replaces stale Indonesian bundle values
  // with English fallbacks. Add English aliases here so the legacy bridge can
  // still render those admin literals in the selected target language.
  const english = LEGACY_ADMIN_LITERAL_OVERRIDES.en ?? {};
  const aliases: Record<string, string> = { ...target };
  for (const [source, englishValue] of Object.entries(english)) {
    const translated = target[source];
    if (translated && englishValue && !aliases[englishValue]) {
      aliases[englishValue] = translated;
    }
  }
  return aliases;
}

const LEGACY_LITERAL_KEY_ALIASES: Record<string, string> = {
  "Daftar sebagai": "registerPage.roleLabel",
  "Membeli atau meminta layanan": "registerPage.roleCustomerDesc",
  "Menawarkan jasa atau produk": "registerPage.roleVendorDesc",
  "Tipe customer": "onboarding.accountType.title",
  "Tipe Customer": "onboarding.accountType.title",
  "Pilih metode registrasi": "registerPage.title",
  "Belum tersedia": "dashboard.notProvided",
  "Kode OTP dikirim ke": "registerPage.otpSentTo",
  "Ganti email / kirim ulang": "registerPage.resendOtp",
  "Minimal 8 karakter": "login.password",
  "Memuat perusahaan…": "common.loading",
  "Perusahaan tidak ditemukan.": "tracking.notFound",
  "Pilih dari daftar": "common.confirm",
  "Nama perusahaan": "onboarding.vendor.companyName",
  "Cari perusahaan canonical": "navbar.searchPlaceholder",
  "Simpan pilihan": "common.save",
  "Memuat konteks customer…": "common.loading",
  "Produk Terkait": "products.title",
  "Menerjemahkan…": "common.loading",
  "Penyedia": "mktVendorQuote.vendorLabel",
  "Tambah Alamat Pengantaran": "productOrder.trucking.deliveryAddress",
  "Urutan Rute Pengantaran": "tracking.route",
  "Optimalkan": "trucking.toastRouteOptimized",
  "Lihat Status & Pembayaran": "portalInvoice.title",
  "Riwayat Lokasi Driver": "logisticTrack.pageTitle",
  "Lihat Gambar": "tracking.clickToView",
  "Buka Original": "tracking.clickToView",
  "Diverifikasi": "customerApproval.approvalApproved",
  "Dokumen Operasional": "portalDokumen.logisticDocsTitle",
  "Buka": "portalDokumen.detailBtn",
  "Tidak ada dokumen operasional yang cocok dengan pencarian.": "portalDokumen.noMatchDocs",
  "Belum ada dokumen operasional": "portalDokumen.emptyTitle",
  "Detail invoice": "portalInvoice.title",
  "Total invoice": "paymentProof.totalBill",
  "Sudah dibayar": "tracking.paymentReceived",
  "Sisa pembayaran": "portalInvoice.totalUnpaid",
  "Riwayat payment": "portalInvoice.subtitle",
  "Perbarui": "common.retry",
  "Memuat timeline...": "common.loading",
  "Status Order": "productOrderTrack.status",
  "Tracking Driver": "logisticTrack.pageTitle",
  "Pilih mode pengiriman": "productOrder.serviceCatalog.title",
  "Sisa Tagihan": "portalInvoice.totalUnpaid",
  "Nominal pembayaran kali ini": "paymentProof.totalBill",
  "Lanjutkan Pembayaran Paylabs": "paymentProof.payNow",
  "Metode Paylabs": "productOrder.payment.gateway.label",
  "Baca Nominal Bukti": "onboarding.ocr.reading",
  "Membaca nominal dari bukti pembayaran…": "common.loading",
  "Konfirmasi penerimaan barang": "common.confirm",
  "Lihat POD": "tracking.clickToView",
  "Coba Lagi": "common.retry",
  "Grand Total": "mktVendorPo.grandTotal",
  "Total Tagihan": "paymentProof.totalBill",
};

function buildLegacyLiteralMap(dict: Record<string, unknown>, locale: string) {
  const current = flattenStrings(dict);
  const sources = [
    getCachedLocale("id-ID") as Record<string, unknown> | undefined,
    getCachedLocale("en-US") as Record<string, unknown> | undefined,
  ].filter(Boolean) as Record<string, unknown>[];

  const map = new Map<string, string>();
  for (const source of sources) {
    const flat = flattenStrings(source);
    for (const [key, sourceValue] of Object.entries(flat)) {
      const target = current[key];
      if (!target || !sourceValue) continue;
      const normalized = sourceValue.trim();
      if (normalized.length < 2) continue;
      if (!map.has(normalized)) map.set(normalized, target);
    }
  }

  for (const [literal, translated] of Object.entries(legacyAdminOverridesFor(locale))) {
    map.set(literal, translated);
  }

  for (const [literal, key] of Object.entries(LEGACY_LITERAL_KEY_ALIASES)) {
    const target = resolve(dict, key.split("."));
    if (target) map.set(literal, target);
  }
  return map;
}

function translateLegacyNode(root: Node, literalMap: Map<string, string>) {
  const skip = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"]);

  const translateText = (node: Text) => {
    const parent = node.parentElement;
    if (!parent || skip.has(parent.tagName)) return;
    const original = legacyTextSource.get(node) ?? node.nodeValue ?? "";
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = literalMap.get(trimmed);
    if (!translated) {
      if (legacyTextSource.has(node) && node.nodeValue !== original) node.nodeValue = original;
      return;
    }
    if (!legacyTextSource.has(node)) legacyTextSource.set(node, original);
    const next = original.replace(trimmed, translated);
    if (node.nodeValue !== next) node.nodeValue = next;
  };

  const translateElement = (el: Element) => {
    if (skip.has(el.tagName)) return;
    const attrs = ["placeholder", "title", "aria-label"];
    let stored = legacyAttrSource.get(el);
    for (const attr of attrs) {
      if (!el.hasAttribute(attr)) continue;
      const currentValue = el.getAttribute(attr) ?? "";
      const original = stored?.get(attr) ?? currentValue;
      const translated = literalMap.get(original.trim());
      if (!translated) {
        if (stored?.has(attr) && currentValue !== original) el.setAttribute(attr, original);
        continue;
      }
      if (!stored) {
        stored = new Map<string, string>();
        legacyAttrSource.set(el, stored);
      }
      if (!stored.has(attr)) stored.set(attr, original);
      if (currentValue !== translated) el.setAttribute(attr, translated);
    }
  };

  if (root.nodeType === Node.TEXT_NODE) translateText(root as Text);
  if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateText(node as Text);
    else translateElement(node as Element);
    node = walker.nextNode();
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  locale: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(getInitialLocale);
  const [dict, setDict] = useState<Record<string, unknown>>(
    () => buildLocaleDict(getInitialLocale(), readCache(getInitialLocale()))
  );

  // Load locale bundle + remote translations whenever locale changes
  useEffect(() => {
    applyDocumentLocale(locale);
    let cancelled = false;

    const lsCache = readCache(locale);

    // If locale is already in JS bundle cache, apply immediately
    if (getCachedLocale(locale)) {
      setDict(buildLocaleDict(locale, lsCache && Object.keys(lsCache).length > 0 ? lsCache : null));
      if (lsCache && Object.keys(lsCache).length > 0) return; // ls cache fresh, skip API
    }

    // Load bundle + remote in parallel
    Promise.all([
      loadLocale(locale),
      lsCache && Object.keys(lsCache).length > 0
        ? Promise.resolve(null)
        : fetchRemoteTranslations(locale),
    ]).then(([, flat]) => {
      if (cancelled) return;
      if (flat) {
        writeCache(locale, flat);
        setDict(buildLocaleDict(locale, unflatten(flat)));
      } else {
        setDict(buildLocaleDict(locale, lsCache));
      }
    });

    return () => { cancelled = true; };
  }, [locale]);

  const setLanguage = useCallback((code: string) => {
    const next = SUPPORTED_LOCALES.includes(code as SupportedLocale) ? code : "id-ID";
    setLocaleState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    applyDocumentLocale(next);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");

      // 1. Current locale dict (merged remote + bundled)
      const fromDict = resolve(dict, keys);
      if (fromDict !== undefined) return fromDict;

      // 2. en-US bundled fallback (use _cache locale file, not inline TRANSLATIONS)
      const enDict = getCachedLocale("en-US") as Record<string, unknown> | undefined;
      if (enDict) {
        const fromEn = resolve(enDict, keys);
        if (fromEn !== undefined) return fromEn;
      }

      // 3. id-ID bundled fallback (use _cache locale file, not inline TRANSLATIONS)
      const idDict = getCachedLocale("id-ID") as Record<string, unknown> | undefined;
      if (idDict) {
        const fromId = resolve(idDict, keys);
        if (fromId !== undefined) return fromId;
      }

      return fallback ?? key;
    },
    [dict]
  );


  // Transitional bridge for legacy UI literals. It translates only exact strings
  // that already exist in the canonical locale dictionaries, so dynamic business
  // data (names, order numbers, addresses, amounts) is left untouched.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const literalMap = buildLegacyLiteralMap(dict, locale);
    translateLegacyNode(document.body, literalMap);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateLegacyNode(mutation.target, literalMap);
          continue;
        }
        if (mutation.type === "attributes") {
          translateLegacyNode(mutation.target, literalMap);
          continue;
        }
        mutation.addedNodes.forEach((node) => translateLegacyNode(node, literalMap));
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });
    return () => observer.disconnect();
  }, [dict, locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const DEFAULT_CTX: LanguageContextValue = {
  locale: "id-ID",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback ?? key,
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useLanguage] called outside <LanguageProvider> — using defaults");
    }
    return DEFAULT_CTX;
  }
  return ctx;
}
