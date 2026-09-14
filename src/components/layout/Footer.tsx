import { useLocation } from "wouter";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useGetPortalCompany } from "@shared/api-client-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { resolveImageUrl } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/config/company";
import { staticAsset } from "@/lib/staticAssets";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}

const FOOTER_GRADIENT = "linear-gradient(150deg, var(--brand-dark-900) 0%, var(--brand-dark-800) 50%, var(--brand-navy-footer) 100%)";
const FOOTER_STYLE: React.CSSProperties = { background: FOOTER_GRADIENT };

interface NavItem {
  label: string;
  href: string;
}

function FooterNavLink({ label, href }: NavItem) {
  const [, setLocation] = useLocation();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const hashIdx = href.indexOf("#");
    if (hashIdx >= 0) {
      const path = href.slice(0, hashIdx) || "/";
      const hash = href.slice(hashIdx + 1);
      setLocation(path);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      setLocation(href);
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="group inline-flex items-center gap-1.5 text-sm leading-relaxed outline-none"
      style={{
        color: "rgba(255,255,255,0.68)",
        transition: "color 0.25s ease, transform 0.25s ease",
        display: "inline-block",
        borderRadius: "4px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#ffffff";
        (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.68)";
        (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#ffffff";
        (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(56,189,248,0.70)";
        (e.currentTarget as HTMLElement).style.outlineOffset = "3px";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.68)";
        (e.currentTarget as HTMLElement).style.outline = "none";
      }}
    >
      {label}
    </a>
  );
}

export function Footer() {
  const { data: company } = useGetPortalCompany({
    query: { queryKey: ["getPortalCompany"] },
  });
  const { t } = useLanguage();
  const { content } = useEditMode();

  const rawLogoSrc = content["footer_logo"] ?? content["navbar_logo"];
  const logoSrc = rawLogoSrc
    ? (rawLogoSrc.startsWith("/") ? (resolveImageUrl(rawLogoSrc) ?? staticAsset("images/logo.png")) : rawLogoSrc)
    : staticAsset("images/logo.png");

  const brandName = company?.name
    ? company.name.length > COMPANY_CONFIG.brandNameMaxLengthFooter
      ? COMPANY_CONFIG.brandName
      : company.name
    : COMPANY_CONFIG.brandName;

  const phone = company?.phone ? normalizePhone(company.phone) : null;
  const waPhone = phone ?? normalizePhone(COMPANY_CONFIG.phone);
  const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(t("footer.waMessage"))}`;


  const quickLinks: NavItem[] = [
    { label: t("footer.home"),          href: "/" },
    { label: t("footer.about"),         href: "/#tentang" },
    { label: t("footer.calculator"),    href: "/calculator" },
    { label: t("footer.track"),         href: "/track" },
    { label: t("footer.customerPortal"), href: "/login" },
    { label: "Hubungi Kami",            href: "/contact" },
    { label: "Kebijakan Privasi",       href: "/privacy-policy" },
  ];

  const serviceLinks: NavItem[] = [
    { label: t("footer.seaFreight"),          href: "/freight-forwarding" },
    { label: t("footer.airFreight"),          href: "/air-freight-booking" },
    { label: t("footer.customsBrokerage"),    href: "/pabean" },
    { label: t("footer.domesticDistribution"), href: "/jasa" },
  ];

  return (
    <footer style={FOOTER_STYLE} className="text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-16 pb-10">

        {/* ── 4-column grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="shrink-0 bg-white/95 rounded-xl p-1.5 shadow-md">
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="h-[48px] w-auto object-contain"
                  style={{ maxWidth: "120px" }}
                />
              </div>
              <span className="font-bold text-[16px] leading-tight tracking-tight text-white whitespace-nowrap">
                {brandName}
              </span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed max-w-[260px]">
              {t("footer.description")}
            </p>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/35 border border-[#25D366]/40 text-[#4ADE80] text-sm font-medium transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold text-[15px] tracking-wide">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={href + label}>
                  <FooterNavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold text-[15px] tracking-wide">
              {t("footer.servicesTitle")}
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterNavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold text-[15px] tracking-wide">
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-4">

              {/* Kantor — dari COMPANY_CONFIG.office */}
              <li>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45 mb-1">
                      {COMPANY_CONFIG.office.label}
                    </p>
                    <p className="text-xs leading-relaxed text-white/65">
                      {COMPANY_CONFIG.office.lines.map((line, i) => (
                        <span key={i}>{line}{i < COMPANY_CONFIG.office.lines.length - 1 ? <br /> : null}</span>
                      ))}
                    </p>
                    <a
                      href={COMPANY_CONFIG.office.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-sky-400/80 hover:text-sky-300 transition-colors duration-200"
                    >
                      Lihat di Maps ↗
                    </a>
                  </div>
                </div>
              </li>

              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-200 group"
                >
                  <Phone className="h-5 w-5 text-sky-400 shrink-0 group-hover:text-sky-300 transition-colors" />
                  <span className="text-sm">
                    {company?.phone || COMPANY_CONFIG.phoneDisplay}
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${company?.email ?? COMPANY_CONFIG.email}`}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-200 group"
                >
                  <Mail className="h-5 w-5 text-sky-400 shrink-0 group-hover:text-sky-300 transition-colors" />
                  <span className="text-sm">
                    {company?.email || COMPANY_CONFIG.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Copyright ──────────────────────────────────────────── */}
        <div
          className="mt-12 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
        >
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            &copy; {new Date().getFullYear()} {company?.name || COMPANY_CONFIG.legalName}.{" "}
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
