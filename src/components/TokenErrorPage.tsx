import { AlertTriangle, Clock, CheckCircle, Ban, XCircle, RefreshCw, Mail, Phone } from "lucide-react";

export type TokenErrorType =
  | "expired"       // 410 — link kadaluarsa
  | "used"          // 409 — link sudah digunakan (one-time action)
  | "revoked"       // 403 — link dicabut admin
  | "not_found"     // 404 — link tidak valid
  | "rate_limited"  // 429 — terlalu banyak percobaan
  | "error";        // 500 — kesalahan server

interface TokenErrorConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeColor: string;
  badgeLabel: string;
  canRetry: boolean;
  canRequestNew: boolean;
}

const CONFIG: Record<TokenErrorType, TokenErrorConfig> = {
  expired: {
    icon: <Clock className="w-16 h-16 text-amber-400" />,
    title: "Link Sudah Kadaluarsa",
    description:
      "Link yang Anda akses sudah melewati batas waktu berlakunya. Silakan minta link baru melalui tim kami.",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    badgeLabel: "Link Expired",
    canRetry: false,
    canRequestNew: true,
  },
  used: {
    icon: <CheckCircle className="w-16 h-16 text-blue-400" />,
    title: "Link Sudah Digunakan",
    description:
      "Aksi pada link ini sudah pernah dilakukan sebelumnya. Setiap link hanya bisa digunakan satu kali untuk menjaga keamanan.",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    badgeLabel: "Link Sudah Digunakan",
    canRetry: false,
    canRequestNew: false,
  },
  revoked: {
    icon: <Ban className="w-16 h-16 text-red-400" />,
    title: "Akses Ditolak",
    description:
      "Link ini telah dicabut oleh administrator. Silakan hubungi tim kami jika Anda merasa ini adalah kesalahan.",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    badgeLabel: "Akses Dicabut",
    canRetry: false,
    canRequestNew: true,
  },
  not_found: {
    icon: <XCircle className="w-16 h-16 text-gray-400" />,
    title: "Link Tidak Valid",
    description:
      "Link yang Anda akses tidak ditemukan atau mungkin sudah dihapus. Pastikan Anda menggunakan link yang benar dari pesan WhatsApp / email kami.",
    badgeColor: "bg-gray-100 text-gray-600 border-gray-200",
    badgeLabel: "Link Tidak Ditemukan",
    canRetry: true,
    canRequestNew: true,
  },
  rate_limited: {
    icon: <Clock className="w-16 h-16 text-yellow-400" />,
    title: "Terlalu Banyak Percobaan",
    description:
      "Anda telah melakukan terlalu banyak percobaan dalam waktu singkat. Silakan tunggu beberapa menit sebelum mencoba kembali.",
    badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    badgeLabel: "Batas Akses Terlampaui",
    canRetry: false,
    canRequestNew: false,
  },
  error: {
    icon: <AlertTriangle className="w-16 h-16 text-orange-400" />,
    title: "Terjadi Kesalahan",
    description:
      "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi dalam beberapa saat.",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
    badgeLabel: "Kesalahan Server",
    canRetry: true,
    canRequestNew: false,
  },
};

/**
 * Menentukan TokenErrorType dari HTTP status code response API.
 */
export function httpStatusToTokenErrorType(status: number): TokenErrorType {
  if (status === 410) return "expired";
  if (status === 409) return "used";
  if (status === 403) return "revoked";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  return "error";
}

interface Props {
  type: TokenErrorType;
  /** Pesan custom dari server (opsional, override deskripsi default) */
  message?: string | null;
  /** Nomor order / referensi untuk ditampilkan (opsional) */
  orderRef?: string | null;
  /** Kontak WhatsApp admin (opsional) */
  adminWhatsApp?: string | null;
  /** Email admin (opsional) */
  adminEmail?: string | null;
  /** Correlation / Reference ID dari server untuk support (opsional) */
  referenceId?: string | null;
  /** Pesan support tambahan dari server (opsional) */
  supportMessage?: string | null;
  /** URL untuk "Request New Link" (opsional) */
  requestNewLinkUrl?: string | null;
}

export default function TokenErrorPage({
  type,
  message,
  orderRef,
  adminWhatsApp,
  adminEmail,
  referenceId,
  supportMessage,
  requestNewLinkUrl,
}: Props) {
  const cfg = CONFIG[type];

  const waLink = adminWhatsApp
    ? `https://wa.me/${adminWhatsApp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Halo, saya ingin menanyakan link${orderRef ? ` untuk order ${orderRef}` : ""}${referenceId ? ` (Ref: ${referenceId})` : ""} yang ${
          type === "expired" ? "sudah kadaluarsa" :
          type === "used" ? "sudah digunakan" :
          type === "revoked" ? "dicabut" :
          "tidak valid"
        }.`
      )}`
    : null;

  const mailLink = adminEmail
    ? `mailto:${adminEmail}?subject=${encodeURIComponent(
        `Bantuan Link${orderRef ? ` Order ${orderRef}` : ""}`
      )}&body=${encodeURIComponent(
        `Halo,\n\nSaya membutuhkan bantuan dengan link yang ${type === "expired" ? "sudah kadaluarsa" : "tidak valid"}.\n${orderRef ? `Nomor order: ${orderRef}\n` : ""}${referenceId ? `Reference ID: ${referenceId}\n` : ""}\nTerima kasih.`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">{cfg.icon}</div>

          {/* Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${cfg.badgeColor}`}
          >
            {cfg.badgeLabel}
          </span>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-3">{cfg.title}</h1>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            {message ?? cfg.description}
          </p>

          {/* Support message from server */}
          {supportMessage && (
            <p className="text-gray-400 text-xs leading-relaxed mb-2 italic">
              {supportMessage}
            </p>
          )}

          {/* Order ref */}
          {orderRef && (
            <p className="text-xs text-gray-400 mb-2">
              Referensi Order:{" "}
              <span className="font-mono font-medium text-gray-600">{orderRef}</span>
            </p>
          )}

          {/* Reference ID for support */}
          {referenceId && (
            <p className="text-xs text-gray-400 mb-4">
              Reference ID:{" "}
              <span className="font-mono font-medium text-gray-500 select-all">{referenceId}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            {/* Request New Link */}
            {cfg.canRequestNew && requestNewLinkUrl && (
              <a
                href={requestNewLinkUrl}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Minta Link Baru
              </a>
            )}

            {/* Retry */}
            {cfg.canRetry && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            )}

            {/* WhatsApp */}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </a>
            )}

            {/* Email */}
            {mailLink && !waLink && (
              <a
                href={mailLink}
                className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                Hubungi Administrator
              </a>
            )}
          </div>

          {/* Contact Administrator text fallback */}
          {!waLink && !mailLink && (
            <p className="text-gray-400 text-xs mt-4 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />
              Hubungi administrator untuk mendapatkan bantuan
            </p>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Jika Anda membutuhkan bantuan, silakan hubungi tim kami.
        </p>
      </div>
    </div>
  );
}
