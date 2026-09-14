import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";
import { COMPANY_CONFIG } from "@/config/company";

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white">
      <PageSeo path="/privacy-policy" />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("privacy.title", "Kebijakan Privasi")}</h1>
        <p className="text-sm text-slate-500 mb-10">{t("privacy.updated", "Terakhir diperbarui: 1 Januari 2025")}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.collectTitle", "1. Informasi yang Kami Kumpulkan")}</h2>
            <p>
              {t("privacy.collectIntro", 'PT. Cahaya Sejati Teknologi ("B2B Marketplace and Logistic", "kami") mengumpulkan informasi berikut ketika Anda menggunakan layanan kami:')}
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
               <li>{t("privacy.collect1", "Nama lengkap, alamat email, dan nomor telepon yang Anda berikan saat mendaftar.")}</li>
               <li>{t("privacy.collect2", "Informasi perusahaan seperti nama, NPWP, dan alamat usaha.")}</li>
               <li>{t("privacy.collect3", "Data pengiriman: rute, berat, dimensi, dan isi kargo.")}</li>
               <li>{t("privacy.collect4", "Data teknis: alamat IP, jenis browser, dan halaman yang dikunjungi.")}</li>
               <li>{t("privacy.collect5", "Dokumen yang Anda unggah untuk keperluan bea cukai atau pengiriman.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.useTitle", "2. Penggunaan Informasi")}</h2>
            <p>{t("privacy.useIntro", "Informasi yang kami kumpulkan digunakan untuk:")}</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
               <li>{t("privacy.use1", "Memproses pesanan pengiriman dan layanan logistik Anda.")}</li>
               <li>{t("privacy.use2", "Mengirimkan notifikasi status pengiriman melalui email dan WhatsApp.")}</li>
               <li>{t("privacy.use3", "Mengelola akun dan profil pelanggan.")}</li>
               <li>{t("privacy.use4", "Meningkatkan kualitas layanan dan pengalaman pengguna.")}</li>
               <li>{t("privacy.use5", "Memenuhi kewajiban hukum dan regulasi kepabeanan.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.shareTitle", "3. Berbagi Informasi")}</h2>
            <p>
              {t("privacy.shareIntro", "Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi dengan:")}
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
               <li>{t("privacy.share1", "Mitra pengiriman dan maskapai pelayaran untuk memproses kargo Anda.")}</li>
               <li>{t("privacy.share2", "Otoritas bea cukai dan instansi pemerintah yang berwenang.")}</li>
               <li>{t("privacy.share3", "Penyedia layanan teknologi yang membantu operasional kami (tunduk pada perjanjian kerahasiaan).")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.securityTitle", "4. Keamanan Data")}</h2>
            <p>
              {t("privacy.securityText", "Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang wajar untuk melindungi data Anda dari akses tidak sah, perubahan, pengungkapan, atau penghancuran. Data ditransmisikan menggunakan enkripsi SSL/TLS.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.rightsTitle", "5. Hak Anda")}</h2>
            <p>{t("privacy.rightsIntro", "Sebagai pengguna, Anda berhak untuk:")}</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
               <li>{t("privacy.rights1", "Mengakses data pribadi yang kami simpan tentang Anda.")}</li>
               <li>{t("privacy.rights2", "Meminta koreksi data yang tidak akurat.")}</li>
               <li>{t("privacy.rights3", "Meminta penghapusan akun dan data pribadi Anda.")}</li>
               <li>{t("privacy.rights4", "Menarik persetujuan penggunaan data sewaktu-waktu.")}</li>
            </ul>
            <p className="mt-3">
               {t("privacy.rightsContact", "Untuk menggunakan hak-hak ini, hubungi kami di")} <a href="mailto:info@cstlogistic.co.id" className="text-sky-600 hover:underline">info@cstlogistic.co.id</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.cookieTitle", "6. Cookie")}</h2>
            <p>
              {t("privacy.cookieText", "Situs kami menggunakan cookie fungsional untuk menjaga sesi login dan preferensi bahasa Anda. Kami tidak menggunakan cookie pelacakan pihak ketiga untuk tujuan iklan.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.changesTitle", "7. Perubahan Kebijakan")}</h2>
            <p>
              {t("privacy.changesText", "Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan material akan kami beritahukan melalui email atau pemberitahuan di situs kami. Penggunaan layanan setelah perubahan berarti Anda menyetujui kebijakan yang diperbarui.")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">{t("privacy.contactTitle", "8. Kontak")}</h2>
            <p>{t("privacy.contactIntro", "Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, hubungi:")}</p>
            <address className="not-italic mt-3 text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">{COMPANY_CONFIG.legalName}</p>
              <p>{COMPANY_CONFIG.office.lines.join(", ")}</p>
              <p>Email: <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-sky-600 hover:underline">{COMPANY_CONFIG.email}</a></p>
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
