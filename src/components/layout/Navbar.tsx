import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";
import { Button } from "@/components/ui/button";
import {
  Menu, X, LogOut, LayoutDashboard, ShoppingCart, Shield,
  ChevronDown, Ship, Anchor, FileCheck, Truck,
  Search, Calculator, ChevronRight, MapPin, Phone, Info,
  ImagePlus, Loader2, ClipboardList,
  Package, Wind, Globe, FileText, Factory, Coffee, Flame,
  Droplets, Fish, Feather, Plane, BookOpen,
  Plus, Receipt, Building2, FolderOpen, Store,
  Bell, CheckCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isAuthenticated, removeAuthToken, isPortalAdmin, getPortalRole, logout as portalLogout } from "@/lib/auth";
import { useGetPortalCompany } from "@shared/api-client-react";
import { CART_KEY } from "@/lib/logistic-cart";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { staticAsset } from "@/lib/staticAssets";
import { resolveImageUrl } from "@/lib/utils";

interface NavServiceItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  subItems?: string[];
}

interface NavServiceGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  accentBg: string;
  accentText: string;
  headerBg: string;
  items: NavServiceItem[];
}

interface CustomerNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

function CustomerNotificationBell() {
  const isCustomer = isAuthenticated() && getPortalRole() === "customer";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isCustomer) return;
    let disposed = false;
    const load = async () => {
      try {
        const response = await fetch("/api/portal/notifications", { credentials: "include" });
        if (!response.ok || disposed) return;
        const data = await response.json() as {
          items?: CustomerNotification[];
          unreadCount?: number;
        };
        if (!disposed) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setUnreadCount(Number(data.unreadCount ?? 0));
        }
      } catch {
        // A transient notification request must not affect the rest of the portal.
      }
    };
    void load();

    const events = new EventSource("/api/portal/notifications/events");
    events.addEventListener("customer_notification", (event) => {
      try {
        const item = JSON.parse((event as MessageEvent).data) as CustomerNotification;
        setItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 50));
        if (!item.isRead) setUnreadCount((count) => count + 1);
      } catch {
        void load();
      }
    });
    return () => {
      disposed = true;
      events.close();
    };
  }, [isCustomer]);

  if (!isCustomer) return null;

  async function markRead(id: number) {
    const response = await fetch(`/api/portal/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) return;
    setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function markAllRead() {
    const response = await fetch("/api/portal/notifications/read-all", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) return;
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  async function openNotification(item: CustomerNotification) {
    if (!item.isRead) await markRead(item.id);
    const target = typeof item.payload?.url === "string" ? item.payload.url : "";
    if (target) window.location.assign(target);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <Bell className="h-[17px] w-[17px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifikasi</p>
              <p className="text-[11px] text-slate-400">Update order dari tim CST</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={() => void markAllRead()} className="text-[11px] font-medium text-sky-600 hover:text-sky-800">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-[22rem] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Belum ada notifikasi.</div>
            ) : items.map((item) => (
              <button
                key={item.id}
                onClick={() => void openNotification(item)}
                className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${item.isRead ? "bg-white" : "bg-sky-50/60"}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.isRead ? "bg-slate-100 text-slate-400" : "bg-sky-100 text-sky-600"}`}>
                    {item.isRead ? <CheckCheck className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.message}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// SERVICES_GROUPS is now a function so labels/titles/descs go through t() and
// update whenever the active language changes.
function getServicesGroups(t: (key: string) => string): NavServiceGroup[] {
  return [
    {
      id: "forwarding",
      label: t("servicesMenu.groupForwarding"),
      icon: Ship,
      accentBg: "bg-blue-50",
      accentText: "text-blue-600",
      headerBg: "bg-blue-50/60",
      items: [
        { icon: Ship,  title: t("servicesMenu.ocean.title"),      desc: t("servicesMenu.ocean.desc"),      href: "/ocean-freight-booking" },
        { icon: Plane, title: t("servicesMenu.airFreight.title"), desc: t("servicesMenu.airFreight.desc"), href: "/air-freight-booking" },
        { icon: Truck, title: t("servicesMenu.domestic.title"),   desc: t("servicesMenu.domestic.desc"),   href: "/trucking" },
      ],
    },
    {
      id: "ppjk",
      label: t("servicesMenu.groupPpjk"),
      icon: ClipboardList,
      accentBg: "bg-orange-50",
      accentText: "text-orange-600",
      headerBg: "bg-orange-50/60",
      items: [
        {
          icon: FileCheck,
          title: t("servicesMenu.customs.title"),
          desc: t("servicesMenu.customs.desc"),
          href: "/custom-clearance",
        },
        {
          icon: BookOpen,
          title: t("servicesMenu.consultant.title"),
          desc: t("servicesMenu.consultant.desc"),
          href: "/pabean",
          subItems: [
            t("servicesMenu.consultant.sub1"),
            t("servicesMenu.consultant.sub2"),
            t("servicesMenu.consultant.sub3"),
          ],
        },
      ],
    },
  ];
}

type AutocompleteEntry = {
  icon: LucideIcon;
  label: string;
  description: string;
  kind: "Layanan" | "Produk";
  href: string;
  terms: string[];
};

type MarketplaceResult = {
  id: number;
  name: string;
  description: string | null;
  templateKind: string;
  serviceType: string | null;
  categoryKey: string | null;
  isActive?: boolean | null;
  isPublished?: boolean | null;
  href?: string;
  keywords?: string[];
};

function legacyServiceSearchHref(item: { id: unknown; name?: unknown; categories?: unknown }): string {
  const id = Number(item.id);
  const name = String(item.name ?? "").toLowerCase();
  const category = Array.isArray(item.categories)
    ? String(item.categories[0] ?? "").toLowerCase()
    : "";

  // These are the current public service destinations. Keep the generic
  // detail route only for legacy services without a dedicated page.
  if (name.includes("custom") || name.includes("ppjk") || category.includes("pabean")) {
    return "/custom-clearance";
  }
  if (name.includes("freight") || name.includes("emkl") || category.includes("freight")) {
    return "/freight-forwarding";
  }
  if (name.includes("handling")) {
    return "/custom-clearance?service=handling_clearance";
  }
  return `/jasa/${id}`;
}

const AUTOCOMPLETE_MAP: AutocompleteEntry[] = [
  // ── Jasa / Services ───────────────────────────────────────────────────────
  {
    icon: Truck, label: "Trucking Domestik",
    description: "Angkutan darat dalam kota & antar kota",
    kind: "Layanan", terms: ["truck", "truk", "angkut", "darat", "trucking"],
    href: "/trucking",
  },
  {
    icon: Ship, label: "Freight Forwarding",
    description: "Pengiriman udara & laut internasional ke seluruh dunia",
    kind: "Layanan", terms: ["sea", "freight", "fcl", "lcl", "forwarding", "ekspedisi", "ekspor", "impor", "international"],
    href: "/freight-forwarding",
  },
  {
    icon: Anchor, label: "Ocean Freight",
    description: "Pengiriman laut FCL / LCL internasional",
    kind: "Layanan", terms: ["ocean", "laut", "kapal", "fcl", "lcl", "sea freight"],
    href: "/ocean-freight",
  },
  {
    icon: Plane, label: "Air Freight Booking",
    description: "Booking pengiriman udara langsung — kalkulasi & pilih rate",
    kind: "Layanan", terms: ["air", "udara", "pesawat", "fly", "airfreight", "air freight", "booking udara"],
    href: "/air-freight-booking",
  },
  {
    icon: FileCheck, label: "PPJK / Customs Clearance",
    description: "Pengurusan kepabeanan, bea cukai & dokumen",
    kind: "Layanan", terms: ["ppjk", "custom", "kepabeanan", "bea", "cukai", "pabean", "customs", "clearance"],
    href: "/pabean",
  },
  {
    icon: Factory, label: "Cargo Handling",
    description: "Bongkar muat & penanganan kargo di gudang",
    kind: "Layanan", terms: ["handling", "bongkar", "muat", "gudang", "cargo"],
    href: "/marketplace?type=service&category=handling&q=handling",
  },
  {
    icon: FileText, label: "Pengurusan Dokumen",
    description: "Perizinan, surat jalan & dokumen ekspor-impor",
    kind: "Layanan", terms: ["dokumen", "document", "surat", "perizinan", "lisensi"],
    href: "/marketplace?type=service&category=document&q=dokumen",
  },
  {
    icon: Globe, label: "Exim Service",
    description: "Layanan ekspor & impor terintegrasi",
    kind: "Layanan", terms: ["exim", "ekspor", "impor", "export", "import"],
    href: "/marketplace?type=service&category=exim_service&q=exim",
  },
  // ── Produk ────────────────────────────────────────────────────────────────
  {
    icon: Coffee, label: "Kopi / Coffee",
    description: "Arabica, Robusta, biji & olahan",
    kind: "Produk", terms: ["kopi", "coffee", "arabica", "robusta"],
    href: "/marketplace?type=product&category=coffee&q=kopi",
  },
  {
    icon: Flame, label: "Batubara",
    description: "Batubara thermal & coking berbagai kalori",
    kind: "Produk", terms: ["batubara", "coal", "batu bara"],
    href: "/marketplace?type=product&category=coal&q=batubara",
  },
  {
    icon: Package, label: "Minyak Sawit / CPO",
    description: "Crude Palm Oil & turunannya",
    kind: "Produk", terms: ["sawit", "palm", "cpo", "minyak sawit"],
    href: "/marketplace?type=product&category=palm_oil&q=sawit",
  },
  {
    icon: Package, label: "Nikel",
    description: "Ore nikel & produk olahan",
    kind: "Produk", terms: ["nikel", "nickel", "ore"],
    href: "/marketplace?type=product&category=nickel&q=nikel",
  },
  {
    icon: Package, label: "Beras",
    description: "Beras premium & medium berbagai varietas",
    kind: "Produk", terms: ["beras", "rice", "gabah"],
    href: "/marketplace?type=product&category=rice&q=beras",
  },
  {
    icon: Package, label: "Seafood",
    description: "Ikan, udang, cumi & produk laut segar/beku",
    kind: "Produk", terms: ["seafood", "ikan", "udang", "cumi", "fish"],
    href: "/marketplace?type=product&category=seafood&q=seafood",
  },
  {
    icon: Package, label: "Besi & Baja",
    description: "Besi beton, plat baja & profil baja",
    kind: "Produk", terms: ["besi", "baja", "iron", "steel", "beton"],
    href: "/marketplace?type=product&category=iron_steel&q=besi",
  },
  {
    icon: Droplets, label: "Karet Alam",
    description: "SIR, RSS, lateks pekat & crumb rubber",
    kind: "Produk", terms: ["karet", "rubber", "lateks", "latex", "sir20", "rss"],
    href: "/marketplace?type=product&category=rubber&q=karet",
  },
  {
    icon: Fish, label: "Ikan Hidup",
    description: "Ikan hias, kerapu, arwana & biota laut hidup",
    kind: "Produk", terms: ["ikan hidup", "live fish", "arwana", "kerapu", "ikan hias", "biota laut"],
    href: "/marketplace?type=product&category=live_fish&q=ikan+hidup",
  },
  {
    icon: Feather, label: "Sarang Walet",
    description: "Sarang burung walet putih, merah & emas",
    kind: "Produk", terms: ["sarang walet", "bird nest", "walet", "sarang burung", "edible bird nest"],
    href: "/marketplace?type=product&category=bird_nest&q=sarang+walet",
  },
];

// Default popular suggestions shown before user types
const DEFAULT_SUGGESTIONS: AutocompleteEntry[] = [
  AUTOCOMPLETE_MAP.find(e => e.label === "Trucking Domestik"),
  AUTOCOMPLETE_MAP.find(e => e.label === "Ocean Freight"),
  AUTOCOMPLETE_MAP.find(e => e.label === "PPJK / Customs Clearance"),
  AUTOCOMPLETE_MAP.find(e => e.label === "Kopi / Coffee"),
  AUTOCOMPLETE_MAP.find(e => e.label === "Batubara"),
  AUTOCOMPLETE_MAP.find(e => e.label === "Minyak Sawit / CPO"),
].filter((e): e is AutocompleteEntry => e !== undefined);

function getAutocompleteSuggestions(
  q: string,
  liveItems: MarketplaceResult[],
): AutocompleteEntry[] {
  const normalized = (value: string) =>
    value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, " ");

  const rankedItems = liveItems
    .filter((item) =>
      item.isActive !== false &&
      item.isPublished !== false &&
      item.name.trim().length > 0,
    )
    .map((item) => {
      const name = normalized(item.name);
      const description = normalized(item.description ?? "");
      const category = normalized(item.serviceType ?? item.categoryKey ?? "");
      const keywords = (item.keywords ?? []).map(normalized);
      const haystack = [name, description, category, ...keywords];
      let score = 0;
      if (!q || q.length < 2) score = 1;
      else if (name === q) score = 100;
      else if (keywords.some((term) => term === q)) score = 95;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 70;
      else if (keywords.some((term) => term.includes(q))) score = 60;
      else if (haystack.some((value) => value.includes(q))) score = 40;
      return { item, score };
    })
    .filter(({ score }) => q.length < 2 || score > 0)
    .sort((a, b) => b.score - a.score);

  const liveResults: AutocompleteEntry[] = rankedItems
    .slice(0, q.length < 2 ? 6 : 8)
    .map(({ item }) => {
      const isSvc = item.templateKind === "service";
      const cat = isSvc ? item.serviceType : item.categoryKey;
      return {
        icon: isSvc ? Truck : Package,
        label: item.name,
        description: item.description ?? (isSvc ? "Layanan" : "Produk"),
        kind: isSvc ? ("Layanan" as const) : ("Produk" as const),
        href: item.href ?? `/marketplace?type=${isSvc ? "service" : "product"}${cat ? `&category=${cat}` : ""}&q=${encodeURIComponent(item.name)}`,
        terms: item.keywords ?? [],
      };
    });

  // Search suggestions must reflect the currently published/active catalog.
  // Do not append AUTOCOMPLETE_MAP: its entries are examples and can become
  // stale when products or services are removed from the marketplace.
  return liveResults;
}

const NAV_BASE: React.CSSProperties = {
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(226,232,240,0.8)",
  boxShadow: "0 1px 24px rgba(15,23,42,0.04)",
};

const NAV_SCROLLED: React.CSSProperties = {
  background: "rgba(255,255,255,0.98)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 4px 32px rgba(15,23,42,0.07)",
};

function navItemCls(active: boolean) {
  return [
    "flex shrink-0 items-center gap-1 px-1.5 xl:px-2 2xl:px-3.5 py-2 text-[13px] 2xl:text-[14px] font-medium rounded-xl",
    "transition-all duration-200 whitespace-nowrap cursor-pointer select-none tracking-[-0.01em]",
    active
      ? "bg-sky-50 text-sky-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  ].join(" ");
}

export function Navbar() {
  const [isOpen, setIsOpen]                         = useState(false);
  const [scrolled, setScrolled]                     = useState(false);
  const [servicesOpen, setServicesOpen]             = useState(false);

  const [moreOpen, setMoreOpen]                     = useState(false);
  const [mktOpen, setMktOpen]                       = useState(false);
  const [calculatorOpen, setCalculatorOpen]         = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen]         = useState(false);
  const [searchOpen, setSearchOpen]                 = useState(false);
  const [searchQuery, setSearchQuery]               = useState("");
  const [searchFocused, setSearchFocused]           = useState(false);
  const [logoUploading, setLogoUploading]           = useState(false);

  const [location, setLocation] = useLocation();
  const isAuth  = isAuthenticated();
  const isAdmin = isPortalAdmin();
  const { t } = useLanguage();
  const servicesGroups = getServicesGroups(t);
  const { editMode, content, uploadImage, updateField } = useEditMode();
  const logoFileRef  = useRef<HTMLInputElement>(null);
  const servicesRef  = useRef<HTMLDivElement>(null);
  const moreRef      = useRef<HTMLDivElement>(null);
  const mktRef       = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLDivElement>(null);
  const searchInput  = useRef<HTMLInputElement>(null);

  const rawLogoSrc = content["navbar_logo"];
  const logoSrc = rawLogoSrc
    ? (rawLogoSrc.startsWith("/") ? (resolveImageUrl(rawLogoSrc) ?? staticAsset("images/logo.png")) : rawLogoSrc)
    : staticAsset("images/logo.png");

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const path = await uploadImage(file);
      updateField("navbar_logo", path);
      updateField("footer_logo", path);
    } catch {
      alert("Gagal upload logo");
    } finally {
      setLogoUploading(false);
    }
  }

  const [logisticCount, setLogisticCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch { return 0; }
  });

  useEffect(() => {
    function sync() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setLogisticCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch { setLogisticCount(0); }
    }
    window.addEventListener("logistic-cart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("logistic-cart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totalCount = logisticCount;

  const { data: company } = useGetPortalCompany({
    query: {
      queryKey: ["getPortalCompany"],
      enabled: isAuth,
      staleTime: 60_000,
      retry: 1,
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);

      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (mktRef.current && !mktRef.current.contains(e.target as Node)) setMktOpen(false);
      if (calculatorRef.current && !calculatorRef.current.contains(e.target as Node)) setCalculatorOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchFocused(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMoreOpen(false);
        setMktOpen(false);
        setCalculatorOpen(false);
        setIsOpen(false);
        setSearchOpen(false);
        setSearchFocused(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInput.current?.focus(), 50);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleLogout = () => { portalLogout().finally(() => { removeAuthToken(); setLocation("/login"); }); };

  function scrollToSection(id: string) {
    setIsOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Use top autocomplete suggestion's href if available, else fall back to marketplace
    const suggestions = getAutocompleteSuggestions(q.toLowerCase(), liveItems);
    const target = suggestions.length > 0
      ? suggestions[0].href
      : `/marketplace?q=${encodeURIComponent(q)}`;

    setLocation(target);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleSuggestionClick(href: string) {
    setSearchOpen(false);
    setSearchQuery("");
    setLocation(href);
  }

  // Search the complete set of active portal offerings. The marketplace
  // endpoints contain only published vendor catalog rows; the legacy portal
  // endpoints contain the active services/products shown on /jasa and /products.
  const { data: liveItems = [] } = useQuery<MarketplaceResult[]>({
    queryKey: ["navbar-portal-offerings-all"],
    queryFn: async () => {
      const [services, products, marketplaceServices, marketplaceProducts] = await Promise.all([
        fetch("/api/portal/services").then((r) => r.ok ? r.json() : []),
        fetch("/api/portal/products").then((r) => r.ok ? r.json() : []),
        fetch("/api/portal/marketplace?kind=service").then((r) => r.ok ? r.json() : []),
        fetch("/api/portal/marketplace?kind=product").then((r) => r.ok ? r.json() : []),
      ]);
      const legacyServices = (Array.isArray(services) ? services : []).map((item) => ({
        id: Number(item.id),
        name: String(item.name ?? ""),
        description: item.description ?? null,
        templateKind: "service",
        serviceType: Array.isArray(item.categories) ? item.categories[0] ?? null : null,
        categoryKey: Array.isArray(item.categories) ? item.categories[0] ?? null : null,
        isActive: true,
        isPublished: true,
        href: legacyServiceSearchHref(item),
        keywords: [
          ...(Array.isArray(item.categories) ? item.categories : []),
          ...(String(item.name ?? "").match(/ppjk|pabean|custom|kepabeanan/i)
            ? ["ppjk", "pabean", "kepabeanan", "customs", "custom clearance"]
            : []),
        ],
      }));
      const legacyProducts = (Array.isArray(products) ? products : []).map((item) => ({
        id: Number(item.id),
        name: String(item.name ?? ""),
        description: item.description ?? null,
        templateKind: "product",
        serviceType: null,
        categoryKey: Array.isArray(item.categories) ? item.categories[0] ?? null : null,
        isActive: true,
        isPublished: true,
        href: `/marketplace?type=product&q=${encodeURIComponent(String(item.name ?? ""))}`,
        keywords: Array.isArray(item.categories) ? item.categories : [],
      }));
      return [
        ...legacyServices,
        ...legacyProducts,
        ...(Array.isArray(marketplaceServices) ? marketplaceServices : []),
        ...(Array.isArray(marketplaceProducts) ? marketplaceProducts : []),
      ] as MarketplaceResult[];
    },
    staleTime: 30_000,
    enabled: searchOpen || searchFocused,
  });

  // Smart autocomplete is sourced from all currently active portal offerings.
  const autocompleteSuggestions = getAutocompleteSuggestions(
    searchQuery.trim().toLowerCase(),
    liveItems,
  );

  const isServicesActive =
    location.startsWith("/jasa") ||
    location.startsWith("/services") ||
    location === "/freight-forwarding" ||
    location === "/pabean" ||
    location === "/trucking" ||
    (location.startsWith("/marketplace") && location.includes("type=service"));

  const desktopDropdownOpen = servicesOpen || moreOpen || mktOpen;

  const brandName = company?.name
    ? company.name.length > COMPANY_CONFIG.brandNameMaxLength ? COMPANY_CONFIG.brandName : company.name
    : COMPANY_CONFIG.brandName;

  return (
    <>
    <nav
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={scrolled ? NAV_SCROLLED : NAV_BASE}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        <div className="flex h-[68px] items-center gap-3 2xl:gap-6">

          {/* ── Logo & Brand ──────────────────────────────── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative group">
              {editMode ? (
                <button
                  className="relative flex items-center"
                  onClick={() => logoFileRef.current?.click()}
                  title="Ganti Logo"
                >
                  <img src={logoSrc} alt="Logo" className="h-9 w-auto object-contain" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    {logoUploading
                      ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                      : <ImagePlus className="h-4 w-4 text-white" />
                    }
                  </span>
                </button>
              ) : (
                <Link href="/">
                  <img src={logoSrc} alt="Logo" className="h-9 w-auto object-contain" />
                </Link>
              )}
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
            <Link href="/">
              {/* Mobile: potong nama brand agar tidak overflow; desktop: tampilkan penuh */}
              <span className="font-bold text-[15px] sm:text-[17px] tracking-[-0.02em] text-slate-900 select-none max-w-[140px] sm:max-w-none truncate block">
                {brandName}
              </span>
            </Link>
          </div>

          {/* ── Desktop Nav — center ─────────────────────── */}
          {/* Desktop navigation remains visible on laptops/PCs. Lower-priority
              items collapse into "Lainnya" at narrower desktop widths so the
              header stays desktop without allowing labels to overlap. */}
          <div
            className={`hidden lg:flex items-center gap-0 xl:gap-0.5 flex-1 min-w-0 ${
              desktopDropdownOpen
                ? "overflow-visible"
                : "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }`}
          >

            {isAuth ? (
              /* ── Portal Nav (logged-in customer) ──────── */
              (() => {
                const portalRole = getPortalRole();
                const dashHref = portalRole === "vendor" ? "/vendor-dashboard" : "/dashboard";
                return (
                <>
                  <Link href={dashHref} className={navItemCls(location === "/dashboard" || location === "/vendor-dashboard")}>
                    Dashboard
                  </Link>
                  {/* Marketplace dropdown (buyer portal) */}
                  <div className="relative shrink-0" ref={mktRef}>
                    <button
                      className={navItemCls(location.startsWith("/marketplace"))}
                      onClick={() => setMktOpen((v) => !v)}
                      onMouseEnter={() => setMktOpen(true)}
                      aria-expanded={mktOpen}
                    >
                      {t("nav.marketplace")}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${mktOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mktOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 w-56"
                        onMouseLeave={() => setMktOpen(false)}
                      >
                        <Link
                          href="/marketplace"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setMktOpen(false)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 text-xs">🛍</span>
                          {t("nav.marketplace")}
                        </Link>
                        <Link
                          href="/marketplace/my-rfqs"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setMktOpen(false)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-xs">📋</span>
                          {t("nav.myRfqs")}
                        </Link>
                        <Link
                          href="/marketplace/my-purchase-orders"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setMktOpen(false)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-xs">🛒</span>
                          {t("nav.myPurchaseOrders")}
                        </Link>
                        <Link
                          href="/marketplace/pending-approvals"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          onClick={() => setMktOpen(false)}
                        >
                          <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 text-xs">⏳</span>
                          {t("nav.pendingApprovals")}
                        </Link>
                      </div>
                    )}
                  </div>
                  {/* Calculators remain available after login */}
                  <div ref={calculatorRef} className="relative shrink-0">
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                        location === "/kalkulator-impor" || location === "/kalkulator-biaya-logistik"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
                      }`}
                      style={{ border: "1px solid rgba(14,165,233,0.3)" }}
                      aria-haspopup="menu"
                      onClick={() => setCalculatorOpen((open) => !open)}
                      aria-expanded={calculatorOpen}
                    >
                      <Calculator className="h-3.5 w-3.5 shrink-0" />
                      {t("nav.hsCode")}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${calculatorOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`absolute top-full left-0 mt-1 z-50 w-56 pt-1 ${calculatorOpen ? "block" : "hidden"}`}>
                      <div className="rounded-2xl overflow-hidden py-1.5 bg-white border border-slate-200 shadow-xl">
                        <div className="px-4 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{t("nav.hsCode")}</span>
                        </div>
                        <Link href="/kalkulator-impor" onClick={() => setCalculatorOpen(false)}>
                          <div className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium transition-colors cursor-pointer ${
                            location === "/kalkulator-impor" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                          }`}>
                            <Calculator className="h-4 w-4 text-amber-400 shrink-0" />
                            {t("nav.importTariffCalc")}
                          </div>
                        </Link>
                        <Link href="/kalkulator-biaya-logistik" onClick={() => setCalculatorOpen(false)}>
                          <div className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium transition-colors cursor-pointer ${
                            location === "/kalkulator-biaya-logistik" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                          }`}>
                            <Calculator className="h-4 w-4 text-amber-400 shrink-0" />
                            {t("nav.logisticCostCalc")}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link href="/jasa" className={navItemCls(
                    location.startsWith("/jasa") || location === "/book" ||
                    location === "/air-freight-booking" || location === "/ocean-freight-booking" ||
                    location === "/trucking" || location === "/freight-forwarding" || location === "/pabean"
                  )}>
                    <span className="hidden xl:inline">{t("nav.createRequest")}</span>
                    <span className="xl:hidden">{t("nav.request")}</span>
                  </Link>
                  <Link href="/orders" className={navItemCls(location === "/orders")}>
                    {t("nav.myShipments")}
                  </Link>
                  <Link href="/portal-dokumen" className={`hidden 2xl:flex ${navItemCls(location === "/portal-dokumen")}`}>
                    {t("nav.documents")}
                  </Link>
                  <Link href="/portal-invoice" className={`hidden 2xl:flex ${navItemCls(location === "/portal-invoice")}`}>
                    <span className="hidden 2xl:inline">{t("nav.invoicePayment")}</span>
                    <span className="2xl:hidden">{t("nav.invoice")}</span>
                  </Link>
                  <div className="relative group 2xl:hidden shrink-0">
                    <button
                      className={navItemCls(location === "/portal-dokumen" || location === "/portal-invoice")}
                      aria-haspopup="menu"
                    >
                      Lainnya
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full right-0 mt-1 z-50 w-52 hidden group-hover:block pt-1">
                      <div className="rounded-2xl overflow-hidden py-1.5 bg-white border border-slate-200 shadow-xl">
                        <Link href="/portal-dokumen">
                          <div className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium ${
                            location === "/portal-dokumen" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
                          }`}>
                            <FolderOpen className="h-4 w-4 text-violet-500 shrink-0" />
                            {t("nav.documents")}
                          </div>
                        </Link>
                        <Link href="/portal-invoice">
                          <div className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium ${
                            location === "/portal-invoice" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
                          }`}>
                            <Receipt className="h-4 w-4 text-emerald-500 shrink-0" />
                            {t("nav.invoicePayment")}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                   <Link href="/company-profile" className={`hidden xl:flex ${navItemCls(
                    location === "/company-profile" || location === "/account-security"
                   )}`}>
                    <span className="hidden 2xl:inline">{t("nav.companyProfile")}</span>
                    <span className="2xl:hidden">{t("nav.profile")}</span>
                  </Link>
                </>
                );
              })()
            ) : (
              /* ── Public Nav (not logged in) ────────────── */
              <>
                <Link href="/" className={navItemCls(location === "/")}>
                  {t("nav.home")}
                </Link>

                <Link href="/marketplace" className={navItemCls(location.startsWith("/marketplace"))}>
                  {t("nav.marketplace")}
                </Link>

                {/* Services dropdown */}
                <div className="relative shrink-0" ref={servicesRef}>
                  <button
                    className={navItemCls(isServicesActive)}
                    onClick={() => setServicesOpen((v) => !v)}
                    onMouseEnter={() => setServicesOpen(true)}
                    aria-expanded={servicesOpen}
                  >
                    {t("nav.services")}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
                  </button>

                  {servicesOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                      style={{ width: "600px" }}
                      onMouseLeave={() => setServicesOpen(false)}
                    >
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.99)",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 20px 60px rgba(15,23,42,0.12)",
                        }}
                      >
                        <div className="px-5 py-3 border-b border-slate-100">
                          <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-widest">
                            {t("servicesMenu.tagline")}
                          </p>
                        </div>

                        {/* Two-column grouped layout */}
                        <div className="grid grid-cols-2 divide-x divide-slate-100 p-0">
                          {servicesGroups.map((group) => {
                            const GroupIcon = group.icon;
                            return (
                              <div key={group.id} className="p-3">
                                {/* Group header */}
                                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${group.headerBg} mb-2`}>
                                  <GroupIcon className={`h-3.5 w-3.5 shrink-0 ${group.accentText}`} />
                                  <span className={`text-[11px] font-bold uppercase tracking-widest ${group.accentText}`}>
                                    {group.label}
                                  </span>
                                </div>
                                {/* Group items */}
                                {group.items.map((item) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <Link key={item.title} href={item.href} onClick={() => setServicesOpen(false)}>
                                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group cursor-pointer">
                                        <div className={`w-7 h-7 rounded-lg ${group.accentBg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                                          <ItemIcon className={`h-3.5 w-3.5 ${group.accentText}`} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[13px] font-semibold text-slate-800 group-hover:text-slate-900 leading-tight">
                                            {item.title}
                                          </p>
                                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                            {item.desc}
                                          </p>
                                          {item.subItems && item.subItems.length > 0 && (
                                            <ul className="mt-1.5 space-y-0.5">
                                              {item.subItems.map((sub) => (
                                                <li key={sub} className={`flex items-center gap-1.5 text-[10.5px] ${group.accentText}`}>
                                                  <ChevronRight className="h-2.5 w-2.5 shrink-0" />
                                                  {sub}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

                        <div className="px-3 pb-3 border-t border-slate-100 pt-2">
                          <Link href="/jasa" onClick={() => setServicesOpen(false)}>
                            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer">
                              <span className="text-[13px] font-semibold">{t("servicesMenu.viewAll")}</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kalkulator — CSS-hover dropdown, no click state */}
                  <div ref={calculatorRef} className="relative shrink-0">
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                      location === "/kalkulator-impor" || location === "/kalkulator-biaya-logistik"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
                    }`}
                    style={{ border: "1px solid rgba(14,165,233,0.3)" }}
                    onClick={() => setCalculatorOpen((open) => !open)}
                    aria-expanded={calculatorOpen}
                  >
                    <Calculator className="h-3.5 w-3.5 shrink-0" />
                    {t("nav.hsCode")}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${calculatorOpen ? "rotate-180" : ""}`} />
                  </button>

                  <div className={`absolute top-full left-0 mt-1 z-50 w-56 pt-1 ${calculatorOpen ? "block" : "hidden"}`}>
                    <div
                      className="rounded-2xl overflow-hidden py-1.5"
                      style={{
                        background: "rgba(255,255,255,0.99)",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
                      }}
                    >
                      <div className="px-4 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{t("nav.hsCode")}</span>
                      </div>
                      <Link href="/kalkulator-impor" onClick={() => setCalculatorOpen(false)}>
                        <div className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium transition-colors cursor-pointer ${
                          location === "/kalkulator-impor" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                        }`}>
                          <Calculator className="h-4 w-4 text-amber-400 shrink-0" />
                          {t("nav.importTariffCalc")}
                        </div>
                      </Link>
                      <Link href="/kalkulator-biaya-logistik" onClick={() => setCalculatorOpen(false)}>
                        <div className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium transition-colors cursor-pointer ${
                          location === "/kalkulator-biaya-logistik" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50 hover:text-sky-700"
                        }`}>
                          <Calculator className="h-4 w-4 text-amber-400 shrink-0" />
                          {t("nav.logisticCostCalc")}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* More dropdown */}
                <div className="relative hidden xl:block shrink-0" ref={moreRef}>
                  <button
                    className={navItemCls(location === "/calculator")}
                    onClick={() => setMoreOpen((v) => !v)}
                    onMouseEnter={() => setMoreOpen(true)}
                    aria-expanded={moreOpen}
                  >
                    {t("nav.more")}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {moreOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 z-50 w-60"
                      onMouseLeave={() => setMoreOpen(false)}
                    >
                      <div
                        className="rounded-2xl overflow-hidden py-1.5"
                        style={{
                          background: "rgba(255,255,255,0.99)",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
                        }}
                      >
                        <button
                          onClick={() => { setMoreOpen(false); scrollToSection("tentang"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-700 transition-colors"
                        >
                          <Info className="h-4 w-4 text-slate-400 shrink-0" />
                          {t("nav.about")}
                        </button>
                        <button
                          onClick={() => { setMoreOpen(false); scrollToSection("kontak"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-700 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                          {t("nav.contact")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Right Actions ──────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0 ml-auto">

            {/* Search — compact icon until focused, then expands */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div
                  className={`flex items-center py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                    searchFocused
                      ? "w-[220px] gap-2 px-3"
                      : "w-9 gap-0 px-2.5 justify-center"
                  }`}
                  style={{
                    background: "rgba(248,250,252,0.9)",
                    borderColor: searchFocused ? "#0ea5e9" : "#E2E8F0",
                    boxShadow: searchFocused ? "0 0 0 3px rgba(14,165,233,0.12)" : "none",
                  }}
                  onClick={() => searchInput.current?.focus()}
                >
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 cursor-pointer" />
                  <input
                    ref={searchInput}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    placeholder="Cari layanan, produk…"
                    className={`bg-transparent text-[13px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 ${
                      searchFocused
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Smart autocomplete dropdown */}
                {searchFocused && (
                  <div
                    className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden z-50"
                    style={{
                      width: "340px",
                      background: "rgba(255,255,255,0.99)",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 16px 48px rgba(15,23,42,0.13)",
                    }}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        {searchQuery.trim().length >= 2 ? t("navbar.searchSuggestions") : t("navbar.searchPopular")}
                      </span>
                      <span className="text-[10px] text-slate-300">{t("navbar.searchEnterHint")}</span>
                    </div>

                    {autocompleteSuggestions.length > 0 ? (
                      <div className="py-1">
                        {autocompleteSuggestions.map((s) => {
                          const Icon = s.icon;
                          const isService = s.kind === "Layanan";
                          return (
                            <button
                              key={s.href}
                              type="button"
                              onMouseDown={() => handleSuggestionClick(s.href)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sky-50 transition-colors text-left group"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isService ? "bg-sky-50 group-hover:bg-sky-100" : "bg-emerald-50 group-hover:bg-emerald-100"
                              }`}>
                                <Icon className={`h-3.5 w-3.5 ${isService ? "text-sky-600" : "text-emerald-600"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-semibold text-slate-800 group-hover:text-sky-700 transition-colors truncate">
                                    {s.label}
                                  </span>
                                  <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    isService ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-emerald-600"
                                  }`}>
                                    {isService ? t("navbar.kindService") : t("navbar.kindProduct")}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                                  {s.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Search className="h-5 w-5 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-[13px] text-slate-400 font-medium">{t("navbar.searchNoSuggestions")}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{t("navbar.searchPressEnter").replace("{query}", searchQuery)}</p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Cart */}
            <CustomerNotificationBell />
            <button
              onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
              aria-label={t("nav.cart")}
            >
              <ShoppingCart className="h-[17px] w-[17px]" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 leading-none">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Language */}
            <LanguageSelector />

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-0.5" />

            {/* Auth */}
            {isAuth ? (
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <Link href="/admin">
                    <button className="flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium rounded-xl text-amber-600 hover:bg-amber-50 transition-all duration-200 whitespace-nowrap" title={t("nav.admin")}>
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden 2xl:inline">{t("nav.admin")}</span>
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 whitespace-nowrap"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden 2xl:inline">{t("nav.logout")}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-[13.5px] font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-200">
                    {t("nav.login")}
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 text-[13.5px] font-semibold rounded-xl text-white transition-all duration-200 whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg,var(--brand-primary),var(--brand-primary-600))", boxShadow: "0 2px 12px rgba(14,165,233,0.35)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(14,165,233,0.45)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(14,165,233,0.35)"}
                  >
                    {t("nav.register")}
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Header Right ─────────────────────── */}
          <div className="lg:hidden flex items-center gap-1 ml-auto">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setTimeout(() => searchInput.current?.focus(), 50);
              }}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
            >
              <Search className="h-[17px] w-[17px]" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
              aria-label={t("nav.cart")}
            >
              <ShoppingCart className="h-[17px] w-[17px]" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 leading-none">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              aria-label="Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search Bar ───────────────────────────── */}
        {searchOpen && (
          <div className="lg:hidden pb-3" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                style={{
                  background: "#f8fafc",
                  borderColor: "#E2E8F0",
                }}
              >
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInput}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari layanan, produk…"
                  className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: "#0ea5e9" }}
              >
                Cari
              </button>
            </form>
            {autocompleteSuggestions.length > 0 && (
              <div className="mt-2 rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-lg">
                <div className="px-3 py-2 border-b border-slate-50">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {searchQuery.trim().length >= 2 ? t("navbar.searchSuggestions") : t("navbar.searchPopular")}
                  </span>
                </div>
                {autocompleteSuggestions.map((s) => {
                  const Icon = s.icon;
                  const isService = s.kind === "Layanan";
                  return (
                    <button
                      key={s.href}
                      type="button"
                      onClick={() => handleSuggestionClick(s.href)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-sky-50 transition-colors text-left border-b border-slate-50 last:border-0 active:bg-sky-100"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isService ? "bg-sky-50" : "bg-emerald-50"}`}>
                        <Icon className={`h-4 w-4 ${isService ? "text-sky-600" : "text-emerald-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-slate-800 truncate">{s.label}</span>
                          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isService ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {isService ? t("navbar.kindService") : t("navbar.kindProduct")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </nav>

    {/* Mobile Slide Drawer via portal — menghindari backdrop-filter containing block di Safari */}
    {createPortal(
      <>
        {/* Backdrop — premium dark blur */}
        <div
          className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ background: "rgba(8,15,34,0.72)", backdropFilter: "blur(6px)" }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Premium slide panel */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full z-[70] flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{
            width: "min(88vw, 360px)",
            background: "#fff",
            boxShadow: "-20px 0 80px rgba(8,15,34,0.28), -4px 0 24px rgba(14,165,233,0.08)",
          }}
        >
          {/* ── Premium Header — dark gradient ── */}
          <div
            className="relative flex items-center justify-between px-5 pt-5 pb-5 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0a1628 0%, #0f2847 50%, #0d1f3c 100%)",
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
            <div className="absolute -bottom-4 left-8 w-20 h-20 rounded-full opacity-8"
              style={{ background: "radial-gradient(circle, #0ea5e9, transparent 70%)" }} />

            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(14,165,233,0.18)", border: "1px solid rgba(14,165,233,0.3)" }}>
                <img src={logoSrc} alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-white tracking-[-0.01em] leading-tight">{brandName}</div>
                <div className="text-[10px] font-medium leading-tight" style={{ color: "rgba(148,202,234,0.85)" }}>
                  Global Logistics Partner
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* ── Quick Action Cards ── */}
          <div className="px-4 pt-4 pb-2">
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/track" onClick={() => setIsOpen(false)}>
                <div
                  className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl cursor-pointer active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    boxShadow: "0 2px 12px rgba(59,130,246,0.08)",
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 leading-tight">{t("nav.track")}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{t("nav.order")}</div>
                  </div>
                </div>
              </Link>
              <Link href="/kalkulator-impor" onClick={() => setIsOpen(false)}>
                <div
                  className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl cursor-pointer active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    boxShadow: "0 2px 12px rgba(251,191,36,0.08)",
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#b45309)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }}>
                    <Calculator className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 leading-tight">{t("nav.hsCode")}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{t("nav.tariffAndCost")}</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* ── Scrollable Nav Content ── */}
          <div className="flex-1 overflow-y-auto px-3 py-2">

            {/* Section label */}
            <div className="px-2 pb-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("nav.navLabel")}</span>
            </div>

            {isAuth ? (
              (() => {
                const portalRole = getPortalRole();
                const dashHref = portalRole === "vendor" ? "/vendor-dashboard" : "/dashboard";
                const mobileNavItems = [
                  { href: dashHref,           icon: LayoutDashboard, label: "Dashboard",           color: "#6366f1" },
                  { href: "/marketplace",                   icon: Store,          label: "Marketplace",          color: "#f59e0b" },
                  { href: "/marketplace/my-purchase-orders", icon: ShoppingCart,   label: t("nav.myPurchaseOrders"),   color: "#f97316" },
                  { href: "/jasa",            icon: Plus,            label: t("nav.createRequest"),   color: "#0ea5e9" },
                  { href: "/orders",          icon: ClipboardList,   label: t("nav.myShipments"),     color: "#f59e0b" },
                  { href: "/portal-dokumen",  icon: FolderOpen,      label: t("nav.documents"),       color: "#8b5cf6" },
                  { href: "/portal-invoice",  icon: Receipt,         label: t("nav.invoicePayment"),  color: "#10b981" },
                  { href: "/company-profile", icon: Building2,       label: t("nav.companyProfile"),  color: "#64748b" },
                ];
                return (
                <>
                  {mobileNavItems.map(({ href, icon: Icon, label, color }) => {
                    const isActive = location === href
                      || (href === dashHref && (location === "/dashboard" || location === "/vendor-dashboard"))
                      || (href === "/jasa" && (location.startsWith("/jasa") || location === "/book"))
                      || (href === "/marketplace" && location.startsWith("/marketplace"));
                    return (
                      <Link key={`${href}-${label}`} href={href} onClick={() => setIsOpen(false)}>
                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                          isActive ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                        }`}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: isActive ? `${color}18` : "#f1f5f9" }}>
                            <Icon className="h-3.5 w-3.5" style={{ color: isActive ? color : "#64748b" }} />
                          </div>
                          <span className={`text-[14px] font-semibold flex-1 ${isActive ? "text-sky-700" : "text-slate-700"}`}>
                            {label}
                          </span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
                          {!isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                        </div>
                      </Link>
                    );
                  })}
                  <Link href="/kalkulator-impor" onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                      location === "/kalkulator-impor" ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                    }`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: location === "/kalkulator-impor" ? "#0ea5e918" : "#f1f5f9" }}>
                        <Calculator className="h-3.5 w-3.5" style={{ color: location === "/kalkulator-impor" ? "#0ea5e9" : "#64748b" }} />
                      </div>
                      <span className={`text-[14px] font-semibold flex-1 ${location === "/kalkulator-impor" ? "text-sky-700" : "text-slate-700"}`}>
                        {t("nav.importTariffCalc")}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    </div>
                  </Link>
                  <Link href="/kalkulator-biaya-logistik" onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                      location === "/kalkulator-biaya-logistik" ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                    }`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: location === "/kalkulator-biaya-logistik" ? "#0ea5e918" : "#f1f5f9" }}>
                        <Calculator className="h-3.5 w-3.5" style={{ color: location === "/kalkulator-biaya-logistik" ? "#0ea5e9" : "#64748b" }} />
                      </div>
                      <span className={`text-[14px] font-semibold flex-1 ${location === "/kalkulator-biaya-logistik" ? "text-sky-700" : "text-slate-700"}`}>
                        {t("nav.logisticCostCalc")}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    </div>
                  </Link>
                </>
                );
              })()
            ) : (
              <>
                {/* Home */}
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                    location === "/" ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                  }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: location === "/" ? "#0ea5e918" : "#f1f5f9" }}>
                      <Globe className="h-3.5 w-3.5" style={{ color: location === "/" ? "#0ea5e9" : "#64748b" }} />
                    </div>
                    <span className={`text-[14px] font-semibold flex-1 ${location === "/" ? "text-sky-700" : "text-slate-700"}`}>
                      {t("nav.home")}
                    </span>
                    {location === "/" ? <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </div>
                </Link>

                {/* Marketplace */}
                <Link href="/marketplace" onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                    location.startsWith("/marketplace") ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                  }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: location.startsWith("/marketplace") ? "#f59e0b18" : "#f1f5f9" }}>
                      <Package className="h-3.5 w-3.5" style={{ color: location.startsWith("/marketplace") ? "#f59e0b" : "#64748b" }} />
                    </div>
                    <span className={`text-[14px] font-semibold flex-1 ${location.startsWith("/marketplace") ? "text-sky-700" : "text-slate-700"}`}>
                      {t("nav.marketplace")}
                    </span>
                    {location.startsWith("/marketplace") ? <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </div>
                </Link>

                {/* Services Accordion */}
                <div className="mb-0.5">
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isServicesActive ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                    }`}
                    onClick={() => setMobileServicesOpen((v) => !v)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: isServicesActive ? "#0ea5e918" : "#f1f5f9" }}>
                      <Ship className="h-3.5 w-3.5" style={{ color: isServicesActive ? "#0ea5e9" : "#64748b" }} />
                    </div>
                    <span className={`text-[14px] font-semibold flex-1 text-left ${isServicesActive ? "text-sky-700" : "text-slate-700"}`}>
                      {t("nav.services")}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="mt-1 mx-2 rounded-2xl overflow-hidden"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      {servicesGroups.map((group, gi) => {
                        const GroupIcon = group.icon;
                        return (
                          <div key={group.id} className={gi > 0 ? "border-t border-slate-100" : ""}>
                            <div className={`flex items-center gap-2 px-4 py-2.5 ${group.headerBg}`}>
                              <GroupIcon className={`h-3 w-3 shrink-0 ${group.accentText}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${group.accentText}`}>
                                {group.label}
                              </span>
                            </div>
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link key={item.title} href={item.href} onClick={() => setIsOpen(false)}>
                                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 transition-colors active:bg-slate-200">
                                    <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${group.accentText}`} />
                                    <span className="text-[13px] font-medium text-slate-700">{item.title}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })}
                      <div className="border-t border-slate-100 px-4 py-2.5">
                        <Link href="/jasa" onClick={() => setIsOpen(false)}>
                          <span className="text-[12px] font-bold text-sky-600 flex items-center gap-1">
                            <ChevronRight className="h-3.5 w-3.5" />{t("servicesMenu.viewAll")}
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kalkulator Tarif Impor — direct link */}
                <Link href="/kalkulator-impor" onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                    location === "/kalkulator-impor" ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                  }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: location === "/kalkulator-impor" ? "#0ea5e918" : "#f1f5f9" }}>
                      <Calculator className="h-3.5 w-3.5" style={{ color: location === "/kalkulator-impor" ? "#0ea5e9" : "#64748b" }} />
                    </div>
                    <span className={`text-[14px] font-semibold flex-1 ${location === "/kalkulator-impor" ? "text-sky-700" : "text-slate-700"}`}>
                      {t("nav.importTariffCalc")}
                    </span>
                    {location === "/kalkulator-impor"
                      ? <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      : <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </div>
                </Link>

                {/* Kalkulator Biaya Logistik — direct link */}
                <Link href="/kalkulator-biaya-logistik" onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                    location === "/kalkulator-biaya-logistik" ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100"
                  }`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: location === "/kalkulator-biaya-logistik" ? "#0ea5e918" : "#f1f5f9" }}>
                      <Calculator className="h-3.5 w-3.5" style={{ color: location === "/kalkulator-biaya-logistik" ? "#0ea5e9" : "#64748b" }} />
                    </div>
                    <span className={`text-[14px] font-semibold flex-1 ${location === "/kalkulator-biaya-logistik" ? "text-sky-700" : "text-slate-700"}`}>
                      {t("nav.logisticCostCalc")}
                    </span>
                    {location === "/kalkulator-biaya-logistik"
                      ? <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                      : <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </div>
                </Link>

                {/* More Accordion */}
                <div className="mb-0.5">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-slate-50 active:bg-slate-100"
                    onClick={() => setMobileMoreOpen((v) => !v)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#f1f5f9" }}>
                      <Info className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <span className="text-[14px] font-semibold flex-1 text-left text-slate-700">{t("nav.more")}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${mobileMoreOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileMoreOpen && (
                    <div className="mt-1 mx-2 rounded-2xl overflow-hidden"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <button onClick={() => { setIsOpen(false); scrollToSection("tentang"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 transition-colors">
                        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[13px] font-medium text-slate-700">{t("nav.about")}</span>
                      </button>
                      <div className="border-t border-slate-100">
                        <button onClick={() => { setIsOpen(false); scrollToSection("kontak"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-[13px] font-medium text-slate-700">{t("nav.contact")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Language selector */}
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <LanguageSelector />
              </div>
            </div>
          </div>

          {/* ── Premium Auth Footer ── */}
          <div className="px-4 pb-5 pt-3" style={{ background: "linear-gradient(to top, #f8fafc 60%, rgba(248,250,252,0))" }}>
            {isAuth ? (
              <div className="space-y-2">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold text-amber-700 transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #f59e0b40" }}>
                      <Shield className="h-4 w-4" /> {t("nav.admin")}
                    </button>
                  </Link>
                )}
                <button
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold text-red-600 transition-all active:scale-95"
                  style={{ background: "#fff5f5", border: "1px solid #fee2e2" }}
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                >
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Daftar — primary CTA */}
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)",
                      boxShadow: "0 4px 20px rgba(14,165,233,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    {t("nav.register")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
                {/* Masuk — secondary */}
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold text-slate-600 transition-all active:scale-95"
                    style={{ background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}
                  >
                    {t("nav.login")}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </>,
      document.body,
    )}
    </>
  );
}
