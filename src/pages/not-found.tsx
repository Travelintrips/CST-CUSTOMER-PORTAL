import { Link } from "wouter";
import {
  Home, Ship, Globe, Calculator, Phone, ArrowRight, SearchX,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const QUICK_LINKS = [
  { href: "/", labelKey: "nav.home", label: "Beranda", icon: Home, descKey: "notFound.homeDesc", desc: "Kembali ke halaman utama" },
  { href: "/services", labelKey: "nav.services", label: "Layanan", icon: Ship, descKey: "services.description", desc: "Ekspor, impor & kepabeanan" },
  { href: "/marketplace", labelKey: "nav.more", label: "Marketplace", icon: Globe, descKey: "notFound.marketplaceDesc", desc: "Produk & jasa vendor" },
  { href: "/calculator", labelKey: "nav.calculator", label: "Kalkulator", icon: Calculator, descKey: "calculator.desc", desc: "Estimasi biaya logistik" },
  { href: "/contact", labelKey: "nav.contact", label: "Kontak", icon: Phone, descKey: "contact.description", desc: "Hubungi tim kami" },
];

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg,#F0F6FF 0%,#F8FAFC 50%,#FFFFFF 100%)" }}>

      {/* Hero */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-center text-center py-20 px-4"
        style={{ background: "linear-gradient(135deg,#0B3D6B 0%,#0D6EBF 55%,#1E9FE8 100%)" }}
      >
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <SearchX className="h-3.5 w-3.5" /> {t("notFound.title", "Halaman Tidak Ditemukan")}
          </div>

          <div
            className="font-black text-white select-none"
            style={{ fontSize: "clamp(80px,18vw,160px)", lineHeight: 1, letterSpacing: "-0.04em", opacity: 0.15 }}
            aria-hidden="true"
          >
            404
          </div>

          <div className="-mt-6 relative z-10">
            <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(22px,3.5vw,36px)", letterSpacing: "-0.02em" }}>
              {t("notFound.title", "Halaman tidak dapat ditemukan")}
            </h1>
            <p className="text-[14px] max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.70)" }}>
              {t("notFound.description", "URL yang Anda kunjungi mungkin sudah dipindahkan, dihapus, atau tidak pernah ada. Gunakan link di bawah untuk navigasi ke halaman yang tepat.")}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13.5px] transition-all"
                style={{ background: "#FFFFFF", color: "#0B3D6B" }}
              >
                 <Home className="h-4 w-4" /> {t("nav.home", "Ke Beranda")}
              </button>
            </Link>
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13.5px] transition-all"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.90)", border: "1.5px solid rgba(255,255,255,0.22)" }}
            >
              ← {t("common.back", "Halaman Sebelumnya")}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <p className="text-center text-[12px] font-semibold uppercase tracking-widest text-slate-400 mb-6">
          {t("notFound.suggestions", "Mungkin Anda mencari")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
           {QUICK_LINKS.map(({ href, labelKey, label, icon: Icon, descKey, desc }) => (
            <Link key={href} href={href}>
              <div className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#0B5CAD,#1A73D4)", boxShadow: "0 4px 10px rgba(11,92,173,0.20)" }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                   <p className="font-semibold text-slate-800 text-[13px] leading-tight">{t(labelKey, label)}</p>
                   <p className="text-slate-400 text-[11.5px] truncate">{t(descKey, desc)}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors ml-auto shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-[12px] text-slate-400 mt-10">
           {t("notFound.needHelp", "Butuh bantuan?")}{" "}
          <Link href="/contact">
             <span className="text-blue-500 hover:underline cursor-pointer font-medium">{t("contact.contactUs", "Hubungi tim kami")}</span>
          </Link>
           {" "}{t("notFound.whatsappHint", "atau WhatsApp di tombol kanan bawah.")}
        </p>
      </div>
    </div>
  );
}
