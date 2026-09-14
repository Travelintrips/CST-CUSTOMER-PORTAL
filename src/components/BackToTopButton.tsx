import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label={t("footer.backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      style={{
        position: "fixed",
        bottom: 158,
        right: 20,
        zIndex: 9997,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(15,23,42,0.35), 0 2px 8px rgba(0,0,0,0.12)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-3px) scale(1.05)";
        el.style.boxShadow = "0 8px 28px rgba(15,23,42,0.45), 0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.85)";
        el.style.boxShadow = "0 4px 20px rgba(15,23,42,0.35), 0 2px 8px rgba(0,0,0,0.12)";
      }}
    >
      <ArrowUp style={{ width: 20, height: 20 }} />
    </button>
  );
}
