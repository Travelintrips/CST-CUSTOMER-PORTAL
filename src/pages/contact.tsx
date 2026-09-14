import { Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  const offices = [
    {
      name: "Kantor Operasional — Tangerang",
      address: "GEDUNG SPORT CENTER\nSport Center Soekarno Hatta\nJl. C3 No. 831 RT 001 RW 010\nBelakang Masjid Nurul Barkah\nPajang Benda, Tangerang Kota\nBanten 15126",
      mapsUrl: "https://www.google.com/maps?q=Sport+Center+Soekarno+Hatta+Jl+C3+No+831+Pajang+Benda+Tangerang+Banten",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageSeo path="/contact" />
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-900 text-white py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("contactPage.heroTitle", "Hubungi Kami")}</h1>
        <p className="text-slate-300 max-w-xl mx-auto">
          {t("contactPage.heroSubtitle", "Tim kami siap membantu kebutuhan logistik Anda.")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Kontak */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">{t("contactPage.infoTitle", "Informasi Kontak")}</h2>
              <div className="space-y-5">
                <a
                  href="mailto:info@cstlogistic.co.id"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                    <Mail className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t("contactPage.infoEmail", "Email")}</p>
                    <p className="text-slate-800 font-medium group-hover:text-sky-600 transition-colors">info@cstlogistic.co.id</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/6221624123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t("contactPage.infoWhatsapp", "WhatsApp")}</p>
                    <p className="text-slate-800 font-medium group-hover:text-emerald-600 transition-colors">(021) 6241234</p>
                  </div>
                </a>

                <a
                  href="tel:+62212345678"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                    <Phone className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t("contactPage.infoPhone", "Telepon")}</p>
                    <p className="text-slate-800 font-medium group-hover:text-violet-600 transition-colors">+62 21-2345-678</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t("contactPage.hoursTitle", "Jam Operasional")}</p>
                    <p className="text-slate-800 font-medium">{t("contactPage.hoursWeekday", "Senin – Jumat, 08.00 – 17.00 WIB")}</p>
                    <p className="text-sm text-slate-500">{t("contactPage.hoursSaturday", "Sabtu, 08.00 – 13.00 WIB")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alamat Kantor */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-5">{t("contactPage.locationTitle", "Lokasi Kantor")}</h2>
            <div className="space-y-5">
              {offices.map((office) => (
                <div key={office.name} className="rounded-2xl border border-slate-100 p-5 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800 mb-1.5">{office.name}</p>
                      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{office.address}</p>
                      <a
                        href={office.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2.5 text-xs font-medium text-sky-600 hover:text-sky-700"
                      >
                        {t("contactPage.locationViewMaps", "Lihat di Google Maps")} ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white text-center">
          <h2 className="text-xl font-bold mb-2">{t("contactPage.ctaTitle", "Butuh Penawaran Harga?")}</h2>
          <p className="text-sky-100 mb-5 text-sm">{t("contactPage.ctaSubtitle", "Dapatkan estimasi biaya pengiriman secara instan.")}</p>
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sky-700 font-semibold rounded-xl hover:bg-sky-50 transition-colors"
          >
            {t("contactPage.ctaButton", "Cek Kalkulator Biaya")}
          </a>
        </div>
      </div>
    </div>
  );
}
