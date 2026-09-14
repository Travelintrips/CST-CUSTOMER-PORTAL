import { useListPortalServices } from "@shared/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShoppingCart, Truck, ChevronRight, X, Container, ArrowLeft, Calculator, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { resolveImageUrl } from "@/lib/utils";
import { getServiceFallbackImage } from "@/lib/categoryImages";
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateServiceName, translateCategory } from "@/i18n/serviceData";
import { GROUPED_DISPLAY_CATEGORIES } from "@shared/logistics-constants";
import PageSeo from "@/components/PageSeo";
import { CUSTOMER_ASSETS, staticAsset } from "@/lib/staticAssets";

const formatIDR = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

const stripJasa = (name: string) => name.replace(/^Jasa\s+/i, "");

function isGrouped(service: { categories?: string[] }) {
  return service.categories?.some((c) => (GROUPED_DISPLAY_CATEGORIES as readonly string[]).includes(c));
}

type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categories?: string[];
};

function ServiceImage({ service, className = "" }: { service: Service; className?: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(service.imageUrl ?? "");
  const fallbackSrc = getServiceFallbackImage(service.categories, service.name);
  const src = (!failed && service.imageUrl && resolved) ? resolved : fallbackSrc;

  return (
    <img
      src={src}
      alt={service.name}
      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${className}`}
      onError={(e) => {
        if (!failed) {
          setFailed(true);
          (e.currentTarget as HTMLImageElement).src = fallbackSrc;
        }
      }}
      loading="lazy"
    />
  );
}

function useServicesRealtime() {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleChange = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["listPortalServices"] });
    qc.invalidateQueries({ queryKey: ["listPortalServicesJasa"] });
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  }, [qc]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("portal-services-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, handleChange)
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    return () => {
      supabase!.removeChannel(channel);
      setConnected(false);
    };
  }, [handleChange]);

  return { connected, justUpdated };
}

export default function Services() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/jasa");
  }, [setLocation]);

  const [searchQuery, setSearchQuery] = useState("");
  const [truckingOpen, setTruckingOpen] = useState(false);
  const { t, locale } = useLanguage();
  const qc = useQueryClient();
  const { connected: realtimeConnected, justUpdated: realtimeUpdated } = useServicesRealtime();

  const { data: servicesData, isLoading } = useListPortalServices({
    query: { queryKey: ["listPortalServices"] }
  });

  useEffect(() => {
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("price_sync", () => {
      qc.invalidateQueries({ queryKey: ["listPortalServices"] });
    });
    return () => es.close();
  }, [qc]);

  const allServices: Service[] = Array.isArray(servicesData)
    ? (servicesData as Service[]).map((s) => ({ ...s, description: s.description ?? undefined }))
    : [];

  const groupedServices = allServices.filter(isGrouped);
  const regularServices = allServices.filter((s) => !isGrouped(s));

  const filteredRegular = regularServices.filter((service) => {
    const q = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(q) ||
      service.description?.toLowerCase().includes(q) ||
      service.categories?.some((cat: string) => cat.toLowerCase().includes(q))
    );
  });

  const filteredGrouped = groupedServices.filter((service) => {
    const q = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(q) ||
      service.description?.toLowerCase().includes(q) ||
      service.categories?.some((cat: string) => cat.toLowerCase().includes(q))
    );
  });

  const showGroupedCard = filteredGrouped.length > 0 || searchQuery === "";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageSeo path="/services" />
      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B4F8A 0%, #0F8FD8 50%, #38BDF8 100%)",
          padding: "clamp(24px, 3.5vw, 36px) 0 clamp(18px, 2.5vw, 26px)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(2,34,64,0.55) 0%, rgba(2,34,64,0.25) 40%, rgba(2,34,64,0.05) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.25,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          className="svc-glow-layer"
          style={{
            position: "absolute",
            right: "-4%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "58%",
            height: "88%",
            background: [
              "radial-gradient(circle at 22% 44%, rgba(255,255,255,0.85) 0 3px, transparent 5px)",
              "radial-gradient(circle at 42% 32%, rgba(255,255,255,0.80) 0 3px, transparent 5px)",
              "radial-gradient(circle at 62% 48%, rgba(255,255,255,0.80) 0 3px, transparent 5px)",
              "radial-gradient(circle at 78% 34%, rgba(255,255,255,0.75) 0 3px, transparent 5px)",
              "radial-gradient(circle at 72% 68%, rgba(255,255,255,0.75) 0 3px, transparent 5px)",
              "radial-gradient(circle at 22% 44%, rgba(255,255,255,0.22) 0 16px, transparent 38px)",
              "radial-gradient(circle at 42% 32%, rgba(255,255,255,0.18) 0 14px, transparent 36px)",
              "radial-gradient(circle at 62% 48%, rgba(255,255,255,0.18) 0 14px, transparent 36px)",
              "radial-gradient(circle at 78% 34%, rgba(255,255,255,0.16) 0 13px, transparent 34px)",
              "linear-gradient(25deg, transparent 17%, rgba(255,255,255,0.16) 18%, transparent 20%)",
              "linear-gradient(145deg, transparent 33%, rgba(255,255,255,0.14) 34%, transparent 36%)",
              "linear-gradient(78deg, transparent 49%, rgba(255,255,255,0.13) 50%, transparent 52%)",
              "radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 38%, transparent 70%)",
            ].join(", "),
            borderRadius: "999px",
            opacity: 0.95,
            filter: "drop-shadow(0 0 34px rgba(255,255,255,0.18))",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Routes layer: local fallback first, Supabase on top (same zIndex, later DOM = in front) */}
        <div
          aria-hidden="true"
          className="svc-routes-layer"
          style={{
            position: "absolute",
            right: "3%",
            top: "22%",
            width: "48%",
            height: "56%",
            backgroundImage: `url(${CUSTOMER_ASSETS.logisticsRoutes})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center right",
            opacity: 0.45,
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.20))",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          aria-hidden="true"
          className="svc-routes-layer"
          style={{
            position: "absolute",
            right: "3%",
            top: "22%",
            width: "48%",
            height: "56%",
            backgroundImage: `url(${CUSTOMER_ASSETS.logisticsRoutes})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center right",
            opacity: 0.45,
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.20))",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <style>{`
          @media (max-width: 768px) {
            .svc-glow-layer { width: 95% !important; height: 75% !important; right: -38% !important; opacity: 0.45 !important; }
            .svc-routes-layer { width: 90% !important; right: -42% !important; opacity: 0.22 !important; filter: none !important; }
          }
        `}</style>

        <div className="container px-4 md:px-6" style={{ maxWidth: "760px", position: "relative", zIndex: 2 }}>
          {/* Back button */}
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/")}
            className="inline-flex items-center gap-1.5 mb-3 text-[12px] font-semibold rounded-lg px-3 py-1.5 select-none"
            style={{
              color: "rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.10)",
              border: "1.5px solid rgba(255,255,255,0.20)",
              transition: "all 0.16s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(255,255,255,0.18)";
              el.style.color = "white";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(255,255,255,0.10)";
              el.style.color = "rgba(255,255,255,0.85)";
              el.style.transform = "translateY(0)";
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("services.back")}
          </button>

          <p
            className="font-semibold uppercase mb-1.5"
            style={{ fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.78)" }}
          >
            {t("services.catalogLabel")}
          </p>
          <h1
            className="font-display mb-2 text-white"
            style={{ fontSize: "clamp(20px, 2.8vw, 34px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em", textShadow: "0 4px 16px rgba(0,0,0,0.22)" }}
          >
            {t("services.title")}
          </h1>
          <p
            className="mb-4"
            style={{ fontSize: "clamp(13px, 1.4vw, 15px)", color: "rgba(255,255,255,0.80)", maxWidth: "480px", lineHeight: 1.55 }}
          >
            {t("services.description")}
          </p>

          <div className="relative" style={{ maxWidth: "420px" }}>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "15px", height: "15px", color: "rgba(255,255,255,0.80)" }}
            />
            <input
              id="services-hero-search"
              type="text"
              placeholder={t("services.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full focus:outline-none"
              style={{
                paddingLeft: "40px", paddingRight: "14px", paddingTop: "10px", paddingBottom: "10px",
                background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.30)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                borderRadius: "12px", fontSize: "13.5px", color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.40), 0 8px 24px rgba(0,0,0,0.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)"; }}
            />
            <style>{`#services-hero-search::placeholder { color: rgba(255,255,255,0.60); }`}</style>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="container px-4 md:px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[13px] text-slate-500 font-medium">
            {allServices.length} {t("services.serviceUnit")}
          </span>
          {realtimeConnected && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1"
              style={{
                background: realtimeUpdated ? "rgba(245,158,11,0.10)" : "rgba(34,197,94,0.10)",
                color: realtimeUpdated ? "#B45309" : "#15803D",
                border: `1px solid ${realtimeUpdated ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.25)"}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: realtimeUpdated ? "#F59E0B" : "#22C55E",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              {realtimeUpdated ? t("services.realtimeUpdated") : t("services.realtimeLive")}
            </span>
          )}
        </div>

        {/* ── Trucking Booking Banner ── */}
        <div
          className="mb-8 rounded-2xl overflow-hidden relative cursor-pointer group"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 55%, #2563eb 100%)" }}
          onClick={() => setLocation("/trucking")}
        >
          {/* dot-grid overlay */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          {/* truck silhouette bg */}
          <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-8 opacity-20 pointer-events-none select-none">
            <Truck className="w-48 h-48 text-white" strokeWidth={0.6} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-0.5">
                <Truck className="w-3 h-3 text-white" />
                <span className="text-[11px] font-semibold text-white uppercase tracking-wider">{t("services.truckingBannerBadge")}</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {t("services.truckingBannerTitle")}
              </h3>
              <p className="text-[13px] text-blue-100 max-w-md leading-relaxed">
                {t("services.truckingBannerDesc")}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Pickup Kecil", "Engkel", "CDD Long", "Fuso", "Tronton", "Truk Trailer"].map((v) => (
                  <span key={v} className="text-[11px] bg-white/15 border border-white/20 text-white rounded-full px-2.5 py-0.5">{v}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLocation("/trucking"); }}
                className="flex items-center gap-2 bg-white text-blue-700 font-bold text-[13px] rounded-xl px-5 py-3 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200"
              >
                <Calculator className="w-4 h-4" />
                {t("services.truckingBannerCta")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse h-[400px]">
                <div className="h-48 bg-gray-200" />
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full mt-4" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (filteredRegular.length > 0 || showGroupedCard) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* ── Trucking & Container folder card ── */}
            {showGroupedCard && (
              <Card
                className="group overflow-hidden flex flex-col h-full border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setTruckingOpen(true)}
              >
                {/* Visual: premium banner image */}
                <div className="aspect-video w-full overflow-hidden relative">
                  <img
                    src={staticAsset("images/banner-trucking-container.png")}
                    alt="Trucking & Container"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                      const parent = el.parentElement as HTMLElement | null;
                      if (parent) {
                        parent.style.background = "linear-gradient(135deg,#0d1b2a,#1a2744)";
                      }
                    }}
                  />
                  {/* Dark gradient overlay for readability */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)" }} />
                  {/* Sub-count badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/20 text-white backdrop-blur-sm border-white/30 text-xs font-semibold">
                      {groupedServices.length} {t("services.serviceUnit")}
                    </Badge>
                  </div>
                  {/* Folder indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                    <span className="text-[11px] text-white font-medium">{t("services.folderViewContents")}</span>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">Trucking</Badge>
                    <Badge variant="secondary" className="text-xs">Container</Badge>
                  </div>
                  <CardTitle className="text-xl">Trucking &amp; Container</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {t("services.folderCardDesc")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto pt-0 space-y-3">
                  {/* Sub-service name chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {groupedServices.slice(0, 4).map((s) => (
                      <span key={s.id} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 border border-slate-200">
                        {translateServiceName(stripJasa(s.name), locale)}
                      </span>
                    ))}
                    {groupedServices.length > 4 && (
                      <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 border border-slate-200">
                        +{groupedServices.length - 4} {t("services.folderMore")}
                      </span>
                    )}
                  </div>
                  <Button className="w-full gap-2 bg-slate-800 hover:bg-slate-700 text-white">
                    <ChevronRight className="h-4 w-4" />
                    {t("services.folderViewAll")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── Individual service cards ── */}
            {filteredRegular.map((service) => (
              <Card key={service.id} className="group overflow-hidden flex flex-col h-full border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <ServiceImage service={service} />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {service.categories?.map((cat: string, i: number) => (
                      <Badge key={i} className="bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                        {translateCategory(cat, locale)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{translateServiceName(stripJasa(service.name), locale)}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t("services.sellingPrice")}</span>
                    {service.price > 0 ? (
                      <span className="font-bold text-lg text-primary">{formatIDR(service.price)}</span>
                    ) : (
                      <span className="font-semibold text-amber-600 text-sm">{t("services.negotiable")}</span>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => setLocation(`/jasa/${service.id}`)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t("services.addToCart")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-border">
            <img src={staticAsset("images/logo.png")} alt="B2B Marketplace and Logistic" className="h-12 w-auto mx-auto mb-4 object-contain opacity-35" />
            <h3 className="text-xl font-medium mb-2">{t("services.noServices")}</h3>
            <p className="text-muted-foreground">
              {searchQuery ? t("services.tryOther") : t("services.noResults")}
            </p>
          </div>
        )}
      </div>

      {/* ── Trucking & Container Modal ── */}
      <Dialog open={truckingOpen} onOpenChange={setTruckingOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-800">Trucking &amp; Container</DialogTitle>
                  <p className="text-sm text-slate-500 mt-0.5">{t("services.dialogSub")}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {groupedServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border hover:border-slate-300 hover:shadow-sm transition-all bg-white"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <ServiceImage service={service} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {service.categories?.map((cat: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {translateCategory(cat, locale)}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base leading-snug">
                    {translateServiceName(stripJasa(service.name), locale)}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-xs text-slate-400 block">{t("services.sellingPrice")}</span>
                      {service.price > 0 ? (
                        <span className="font-bold text-primary">{formatIDR(service.price)}</span>
                      ) : (
                        <span className="font-semibold text-amber-600 text-sm">{t("services.negotiable")}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 shrink-0"
                      onClick={() => { setTruckingOpen(false); setLocation(`/jasa/${service.id}`); }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t("services.addToCart")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
