import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useListPortalLogisticOrders } from "@shared/api-client-react";
import { isAuthenticated } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, ChevronUp, RefreshCw, Truck, CheckCircle2,
  Clock, FileText, Circle, ArrowRight, Loader2, AlertCircle,
  Package, MapPin, Navigation2, ExternalLink, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type DriverJobStatus =
  | "ASSIGNED" | "ACCEPTED" | "ON_THE_WAY_TO_PICKUP" | "ARRIVED_AT_PICKUP"
  | "PICKED_UP" | "IN_TRANSIT" | "ARRIVED_AT_DESTINATION" | "DELIVERED"
  | "COMPLETED" | "CANCELLED";

interface DriverLog { id: number; status: DriverJobStatus; timestamp: string; }
interface DriverJob {
  id: number; jobNumber: string; status: DriverJobStatus;
  vehicleType: string | null;
  pickupDateTime: string | null; deliveryDateTime: string | null;
  cargoDescription: string | null; weight: string | null;
  distance: string | null; assignedAt: string; completedAt: string | null;
  logs: DriverLog[];
}
interface TrackingData {
  id: number; orderNumber: string;
  shipmentType: string; origin: string; destination: string;
  status: string; createdAt: string;
  items: { id: number; category: string; serviceName: string }[];
  driverJob: DriverJob | null;
  rfqQuote: { rfqStatus: string; quotedPrice: number | null } | null;
}

const ORDER_STEPS = [
  { key: "New Order",   label: "Order Masuk",       icon: FileText },
  { key: "Processing",  label: "Diproses",           icon: Clock },
  { key: "In Progress", label: "Dalam Pengerjaan",   icon: Truck },
  { key: "Completed",   label: "Selesai",            icon: CheckCircle2 },
];
const ORDER_STATUS_RANK: Record<string, number> = {
  "New Order": 0, "Processing": 1, "In Progress": 2, "Completed": 3,
};

const DRIVER_STEPS: { key: DriverJobStatus; label: string; icon: typeof Truck }[] = [
  { key: "ASSIGNED",               label: "Driver Ditugaskan",      icon: Navigation2 },
  { key: "ACCEPTED",               label: "Driver Menerima",        icon: CheckCircle2 },
  { key: "ON_THE_WAY_TO_PICKUP",   label: "Menuju Titik Pickup",    icon: Navigation2 },
  { key: "ARRIVED_AT_PICKUP",      label: "Tiba di Pickup",         icon: MapPin },
  { key: "PICKED_UP",              label: "Barang Diambil",         icon: Package },
  { key: "IN_TRANSIT",             label: "Dalam Perjalanan",       icon: Truck },
  { key: "ARRIVED_AT_DESTINATION", label: "Tiba di Tujuan",        icon: MapPin },
  { key: "DELIVERED",              label: "Terkirim",               icon: CheckCircle2 },
  { key: "COMPLETED",              label: "Selesai",                icon: CheckCircle2 },
];
const DRIVER_STATUS_RANK = Object.fromEntries(DRIVER_STEPS.map((s, i) => [s.key, i]));

const STATUS_COLORS: Record<string, string> = {
  "New Order":   "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Processing":  "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Completed":   "bg-green-100 text-green-800 border-green-200",
  "Cancelled":   "bg-red-100 text-red-800 border-red-200",
};

function formatDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function fetchTracking(orderNumber: string): Promise<TrackingData> {
  const res = await fetch(`${BASE}/api/logistic/orders/track/${encodeURIComponent(orderNumber)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Gagal memuat data tracking");
  return res.json();
}

function OrderStepper({ status }: { status: string }) {
  const { t } = useLanguage();
  const current = ORDER_STATUS_RANK[status] ?? 0;
  return (
    <div className="flex items-start w-full gap-0">
      {ORDER_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                done  ? "bg-green-500 border-green-500 text-white" :
                active ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20" :
                          "bg-muted border-border text-muted-foreground"
              )}>
                {done
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />
                }
              </div>
              <span className={cn(
                "text-[10px] font-medium text-center leading-tight max-w-[64px]",
                active ? "text-primary font-semibold" :
                done   ? "text-green-600" :
                          "text-muted-foreground"
              )}>
                {t(`orderStatusLabels.${step.key}`, step.label)}
              </span>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all",
                i < current ? "bg-green-400" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DriverTimeline({ job }: { job: DriverJob }) {
  const { locale, t } = useLanguage();
  const current = DRIVER_STATUS_RANK[job.status] ?? 0;
  const isCancelled = job.status === "CANCELLED";
  const visibleSteps = DRIVER_STEPS.filter(
    (s) => s.key !== "COMPLETED" || job.status === "COMPLETED"
  );

  return (
    <div className="space-y-0 pl-1">
      {visibleSteps.map((step, i) => {
        const stepRank = DRIVER_STATUS_RANK[step.key];
        const done   = stepRank < current;
        const active = stepRank === current;
        const log    = [...job.logs].reverse().find((l) => l.status === step.key);
        const Icon   = step.icon;

        return (
          <div key={step.key} className="flex gap-3 group">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2 mt-0.5 transition-all",
                isCancelled  ? "bg-red-50 border-red-200 text-red-400" :
                done         ? "bg-green-500 border-green-500 text-white" :
                active       ? "bg-primary border-primary text-primary-foreground ring-2 ring-primary/20" :
                               "bg-muted border-border text-muted-foreground"
              )}>
                {done && !isCancelled
                  ? <CheckCircle2 className="w-3 h-3" />
                  : active && !isCancelled
                    ? <Icon className="w-3 h-3" />
                    : <Circle className="w-2 h-2" />
                }
              </div>
              {i < visibleSteps.length - 1 && (
                <div className={cn(
                  "w-0.5 flex-1 my-0.5 min-h-[16px] rounded-full transition-all",
                  done && !isCancelled ? "bg-green-300" : "bg-border"
                )} />
              )}
            </div>
            <div className={cn("pb-3", i === visibleSteps.length - 1 && "pb-0")}>
              <p className={cn(
                "text-xs font-medium leading-tight",
                active && !isCancelled  ? "text-primary font-semibold" :
                done   && !isCancelled  ? "text-foreground" :
                                          "text-muted-foreground"
              )}>
                {t(`logisticTrack.${step.key.toLowerCase()}`, step.label)}
                {active && !isCancelled && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    {t("logisticTrack.lastUpdate", "Now")}
                  </span>
                )}
              </p>
              {log && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDateTime(log.timestamp, locale)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrackingCard({ orderNumber, shipmentType, origin, destination, status, createdAt }: {
  orderNumber: string;
  shipmentType: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
}) {
  const { locale, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const { data: tracking, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useQuery<TrackingData, Error>({
    queryKey: ["shipment-timeline", orderNumber],
    queryFn:  () => fetchTracking(orderNumber),
    enabled:  expanded,
    refetchInterval: expanded ? 30_000 : false,
    staleTime: 10_000,
  });

  const isCompleted = status === "Completed" || status === "Cancelled";

  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all duration-200",
      expanded ? "border-primary/30 shadow-md" : "border-border shadow-sm hover:shadow-md hover:border-primary/20"
    )}>
      {/* Header — always visible */}
      <button
        className="w-full text-left p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-bold text-sm text-foreground">{orderNumber}</span>
              <Badge className={cn("border text-[10px] px-2 py-0 h-5", STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 border-gray-200")}>
                {status}
              </Badge>
              {!isCompleted && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70 truncate max-w-[100px]">{origin}</span>
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium text-foreground/70 truncate max-w-[100px]">{destination}</span>
              <span className="text-border">·</span>
              <span className="capitalize">{shipmentType}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(createdAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              expanded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </button>

      {/* Expandable timeline body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-5">

          {/* Refresh bar */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <RefreshCw className={cn("w-2.5 h-2.5", isFetching && "animate-spin")} />
              {isFetching ? "Memperbarui..." : dataUpdatedAt
                ? `Diperbarui ${formatDateTime(new Date(dataUpdatedAt).toISOString(), locale)}`
                : ""}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" /> {t("common.retry", "Refresh")}
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {t("common.loading", "Loading timeline...")}
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {t("common.error", "Failed to load tracking details. Refresh and try again.")}
            </div>
          )}

          {tracking && (
            <div className="space-y-5">
              {/* Order Status Stepper */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t("productOrderTrack.status", "Order status")}
                </p>
                <OrderStepper status={tracking.status} />
              </div>

              {/* Driver Timeline */}
              {tracking.driverJob && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("logisticTrack.pageTitle", "Driver tracking")}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                      {tracking.driverJob.jobNumber}
                    </span>
                    {tracking.driverJob.vehicleType && (
                      <span className="text-[10px] text-muted-foreground capitalize">
                        · {tracking.driverJob.vehicleType}
                      </span>
                    )}
                  </div>
                  <DriverTimeline job={tracking.driverJob} />
                </div>
              )}

              {/* Quote status indicator */}
              {tracking.rfqQuote && tracking.rfqQuote.rfqStatus === "customer_quoted" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-800">{t("mktMyRfqs.actionRequired", "Quote awaiting your response")}</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">{t("mktMyRfqs.viewDetail", "Open details to approve or reject the quote")}</p>
                  </div>
                </div>
              )}

              {/* Services */}
              {tracking.items.length > 0 && (
                <div className="bg-muted/40 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("tracking.service", "Service")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tracking.items.map((item) => (
                      <span key={item.id} className="text-[10px] bg-white border border-border rounded-full px-2 py-0.5 text-foreground/70">
                        {item.serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link href={`/track?order=${encodeURIComponent(orderNumber)}`}>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-8">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("mktMyRfqs.viewDetail", "View full details & quote")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShipmentTimelinePage() {
  const { locale, t } = useLanguage();
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();

  useEffect(() => {
    if (!authed) setLocation("/login");
  }, [authed, setLocation]);

  // Real-time: invalidasi saat status order berubah
  const qc = useQueryClient();
  useEffect(() => {
    if (!authed) return;
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("logistic_order_status_changed", () => {
      qc.invalidateQueries({ queryKey: ["listPortalLogisticOrders-timeline"] });
    });
    return () => es.close();
  }, [authed, qc]);

  const { data, isLoading, isError, refetch, isFetching } = useListPortalLogisticOrders({
    query: {
      queryKey: ["listPortalLogisticOrders-timeline"],
      enabled: authed,
      refetchInterval: 60_000,
      staleTime: 30_000,
    },
    request: { credentials: "include" },
  });

  if (!authed) return null;

  const orders = Array.isArray(data) ? data : [];

  const activeOrders   = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const finishedOrders = orders.filter((o) => o.status === "Completed" || o.status === "Cancelled");

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <PageSeo path="/shipment-timeline" />
      <div className="container px-4 md:px-6 max-w-2xl mx-auto">

        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/dashboard")}
          className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back", "Back")}
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">{t("logisticOrder.deliveryTimeline", "Shipment timeline")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("logisticTrack.pageTitle", "Real-time status for all logistics shipments")}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
            {isFetching ? t("common.loading", "Refreshing...") : t("common.retry", "Refresh all")}
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-40" />
                    <div className="h-3 bg-gray-100 rounded w-64" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-medium text-foreground">{t("common.error", "Failed to load shipment data")}</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{t("vendorResponse.loadFailedDesc", "Check your internet connection")}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> {t("common.retry", "Try again")}
            </Button>
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground text-lg">{t("dashboard.noShipments", "No shipments yet")}</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {t("dashboard.noShipmentsDesc", "Your first logistics order will appear here with real-time tracking")}
            </p>
            <Link href="/book">
              <Button size="sm" className="gap-2">
                <Package className="w-4 h-4" /> {t("dashboard.newOrder", "Create new order")}
              </Button>
            </Link>
          </div>
        )}

        {/* Active shipments */}
        {activeOrders.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("dashboard.activeShipments", "Active shipments")} ({activeOrders.length})
              </h2>
            </div>
            {activeOrders.map((order) => (
              <TrackingCard
                key={order.id}
                orderNumber={order.orderNumber}
                shipmentType={order.shipmentType}
                origin={order.origin}
                destination={order.destination}
                status={order.status}
                createdAt={order.createdAt}
              />
            ))}
          </div>
        )}

        {/* Finished shipments */}
        {finishedOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("orders.title", "History")} ({finishedOrders.length})
            </h2>
            {finishedOrders.map((order) => (
              <TrackingCard
                key={order.id}
                orderNumber={order.orderNumber}
                shipmentType={order.shipmentType}
                origin={order.origin}
                destination={order.destination}
                status={order.status}
                createdAt={order.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
