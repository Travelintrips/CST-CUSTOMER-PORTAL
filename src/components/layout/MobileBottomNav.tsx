import { useLocation, Link } from "wouter";
import {
  Home, Store, Ship, MapPin, User, LayoutDashboard,
  Plus, LogOut, ClipboardList,
} from "lucide-react";
import { isAuthenticated, removeAuthToken, getPortalRole, logout as portalLogout } from "@/lib/auth";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Fixed bottom navigation bar — hanya tampil di mobile (<lg).
 * Memberikan akses cepat ke halaman utama tanpa harus buka hamburger menu.
 */
export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const isAuth = isAuthenticated();
  const { t } = useLanguage();

  function handleLogout() {
    portalLogout().finally(() => { removeAuthToken(); setLocation("/"); });
  }

  const guestItems = [
    { href: "/",            icon: Home,        label: "Beranda",    match: (p: string) => p === "/" },
    { href: "/marketplace", icon: Store,       label: "Marketplace", match: (p: string) => p.startsWith("/marketplace") },
    { href: "/services",    icon: Ship,        label: "Layanan",    match: (p: string) => p.startsWith("/services") || p === "/freight-forwarding" || p === "/pabean" || p === "/trucking" },
    { href: "/track",       icon: MapPin,      label: "Lacak",      match: (p: string) => p === "/track" },
    { href: "/login",       icon: User,        label: "Masuk",      match: (p: string) => p === "/login" || p === "/register" },
  ];

  const portalRole = isAuth ? getPortalRole() : null;
  const dashHref = portalRole === "vendor" ? "/vendor-dashboard" : "/dashboard";

  const authItems = [
    { href: dashHref,       icon: LayoutDashboard, label: "Beranda",    match: (p: string) => p === "/dashboard" || p === "/vendor-dashboard" },
    { href: "/marketplace", icon: Store,            label: "Marketplace", match: (p: string) => p.startsWith("/marketplace") },
    { href: "/jasa",        icon: Plus,             label: "Order",      match: (p: string) => p.startsWith("/jasa") || p === "/book" },
    { href: "/orders",      icon: ClipboardList,    label: "Kiriman",    match: (p: string) => p === "/orders" },
    { href: "/login",       icon: User,             label: "Akun",       match: (p: string) => p === "/dashboard" /* never matches, logout-only */ },
  ];

  const items = isAuth ? authItems : guestItems;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderTop: "1px solid #e2e8f0",
        boxShadow: "0 -4px 24px rgba(15,23,42,0.10)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        /* Extend ke bawah untuk layar dengan home indicator (iPhone) */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {items.map(({ href, icon: Icon, label, match }) => {
        const active = match(location);

        /* Akun (logged-in) → tampilkan sebagai tombol logout */
        if (isAuth && label === "Akun") {
          return (
            <button
              key="logout"
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#fff0f0" }}
              >
                <LogOut className="h-4 w-4" style={{ color: "#ef4444" }} />
              </div>
              <span className="text-[10px] font-semibold" style={{ color: "#ef4444" }}>
                Keluar
              </span>
            </button>
          );
        }

        return (
          <Link key={href} href={href} className="flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-inset">
            <div className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-2 h-full">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: active ? "rgba(14,165,233,0.12)" : "transparent",
                }}
              >
                <Icon
                  className="h-4 w-4 transition-colors"
                  style={{ color: active ? "#0ea5e9" : "#94a3b8" }}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span
                className="text-[10px] font-semibold leading-none transition-colors truncate max-w-full px-1"
                style={{ color: active ? "#0ea5e9" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
