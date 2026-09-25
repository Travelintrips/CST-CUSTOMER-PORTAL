import { useState, useRef, useEffect } from "react";
import { useCancelPortalOrder, useCancelPortalLogisticOrder } from "@shared/api-client-react";
import { isAuthenticated } from "@/lib/auth";
import { LOGISTIC_STATUS_COLOR as _LOGISTIC_STATUS_COLOR, LOGISTIC_STATUS_ID as _LOGISTIC_STATUS_ID } from "@/lib/logisticStatus";
import { useLocation, useSearch } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Search, Calendar, FileText, ExternalLink, X, Package, CreditCard, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { staticAsset } from "@/lib/staticAssets";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Status coloring ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  // normalised colours used by the badge
  pending:          "bg-yellow-100 text-yellow-800",
  processing:       "bg-blue-100 text-blue-800",
  shipped:          "bg-purple-100 text-purple-800",
  delivered:        "bg-green-100 text-green-800",
  cancelled:        "bg-red-100 text-red-800",
  completed:        "bg-emerald-100 text-emerald-800",
  invoiced:         "bg-indigo-100 text-indigo-800",
  paid:             "bg-teal-100 text-teal-800",
  "in-progress":    "bg-sky-100 text-sky-800",
};

// Extend shared logistic status maps with product-order-specific statuses
const LOGISTIC_STATUS_COLOR: Record<string, string> = { ..._LOGISTIC_STATUS_COLOR };

const LOGISTIC_STATUS_ID: Record<string, string> = {
  ..._LOGISTIC_STATUS_ID,
};

const PRODUCT_ORDER_STATUS_COLOR: Record<string, string> = {
  "New Order":         "bg-yellow-100 text-yellow-800",
  "In Progress":       "bg-sky-100 text-sky-800",
  "Awaiting Payment":  "bg-orange-100 text-orange-800",
  "Paid":              "bg-teal-100 text-teal-800",
  "Completed":         "bg-emerald-100 text-emerald-800",
  "Cancelled":         "bg-red-100 text-red-800",
};

const MARKETPLACE_STATUS_COLOR: Record<string, string> = {
  draft:           "bg-slate-100 text-slate-700",
  submitted:       "bg-blue-100 text-blue-800",
  quoting:         "bg-amber-100 text-amber-800",
  quoted:          "bg-cyan-100 text-cyan-800",
  customer_review: "bg-orange-100 text-orange-800",
  awarded:         "bg-green-100 text-green-800",
  rejected:        "bg-red-100 text-red-800",
  cancelled:       "bg-red-100 text-red-800",
  expired:         "bg-gray-100 text-gray-600",
};

const MARKETPLACE_STATUS_LABEL: Record<string, string> = {
  draft:           "Draft",
  submitted:       "Menunggu proses",
  quoting:         "Sedang dicari penawaran",
  quoted:          "Penawaran tersedia",
  customer_review: "Menunggu keputusan Anda",
  awarded:         "Pesanan dibuat",
  rejected:        "Ditolak",
  cancelled:       "Dibatalkan",
  expired:         "Kedaluwarsa",
};

interface ProductOrder {
  id: number;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  trackingToken: string | null;
}

interface MarketplaceRfq {
  rfqId: number;
  rfqNumber: string;
  rfqStatus: string;
  approvalStatus: string;
  createdAt: string;
}

interface PortalOrderFeed {
  crmOrders: Array<{
    id: number;
    docNumber: string;
    status: string;
    grandTotal: number;
    createdAt: string;
  }>;
  logisticOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    grandTotal: number;
    createdAt: string;
    shipmentType: string | null;
    origin: string | null;
    destination: string | null;
  }>;
  productOrders: ProductOrder[];
  marketplaceRfqs: MarketplaceRfq[];
  truckingOrders: Array<{
    id: number;
    bookingNumber: string;
    status: string;
    grandTotal: number;
    createdAt: string;
    vehicleName: string;
    pickup: string | null;
    delivery: string | null;
  }>;
}

export default function Orders() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const authed = isAuthenticated();
  const params = new URLSearchParams(searchStr);
  const search = params.get("q") ?? "";
  const statusFilter = params.get("status") ?? "";
  const [cancellingKey, setCancellingKey] = useState<string | null>(null);
  const { t } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authed) { setLocation("/login"); return; }
  }, [authed, setLocation]);

  // Real-time updates
  useEffect(() => {
    if (!authed) return;
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("logistic_order_status_changed", () => {
      queryClient.invalidateQueries({ queryKey: ["portal-order-feed"] });
    });
    es.addEventListener("price_sync", () => {
      queryClient.invalidateQueries({ queryKey: ["portal-order-feed"] });
    });
    return () => es.close();
  }, [authed, queryClient]);

  function buildOrdersUrl(q: string, status: string): string {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const qs = p.toString();
    return qs ? `/orders?${qs}` : "/orders";
  }

  function setSearch(q: string) {
    setLocation(buildOrdersUrl(q, statusFilter), { replace: true } as Parameters<typeof setLocation>[1]);
  }

  function clearStatusFilter() {
    setLocation(buildOrdersUrl(search, ""));
  }

  const { data: orderFeed, isLoading: isLoadingOrderFeed } = useQuery<PortalOrderFeed>({
    queryKey: ["portal-order-feed"],
    enabled: authed,
    queryFn: async () => {
      const response = await fetch("/api/portal/order-feed", { credentials: "include" });
      if (!response.ok) throw new Error("Gagal memuat pesanan");
      return response.json() as Promise<PortalOrderFeed>;
    },
  });

  const cancelCrmOrder = useCancelPortalOrder({ request: { credentials: "include" } });
  const cancelLogisticOrder = useCancelPortalLogisticOrder({ request: { credentials: "include" } });

  if (!authed) return null;

  // Locale-aware status label: try orderStatusLabels namespace first, fall back to static map
  const localeStatus = (status: string) =>
    t(`orderStatusLabels.${status}`, LOGISTIC_STATUS_ID[status] ?? status);

  const crmOrders = (orderFeed?.crmOrders ?? []).map((o) => ({
    _key: `crm-${o.id}`,
    _id: o.id,
    _type: "crm" as const,
    _cancellable: o.status === "draft",
    displayNumber: o.docNumber,
    subtitle: t("orders.typeCrm"),
    status: o.status,
    displayStatus: localeStatus(o.status),
    statusColor: STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-800",
    grandTotal: o.grandTotal,
    createdAt: o.createdAt,
    trackUrl: null as string | null,
  }));

  const logisticOrders = (orderFeed?.logisticOrders ?? []).map((o) => ({
    _key: `log-${o.id}`,
    _id: o.id,
    _type: "logistic" as const,
    _cancellable: o.status === "Order Received" || o.status === "New Order",
    displayNumber: o.orderNumber,
    subtitle: `${o.shipmentType ?? t("orders.typeLogistic")} • ${o.origin ?? ""} → ${o.destination ?? ""}`,
    status: o.status,
    displayStatus: localeStatus(o.status),
    statusColor: LOGISTIC_STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-800",
    grandTotal: o.grandTotal,
    createdAt: o.createdAt,
    trackUrl: `/track?order=${encodeURIComponent(o.orderNumber)}`,
  }));

  const productOrdersMapped = (orderFeed?.productOrders ?? []).map((o) => ({
    _key: `prod-${o.id}`,
    _id: o.id,
    _type: "product" as const,
    _cancellable: false,
    displayNumber: o.orderNumber,
    subtitle: t("orders.typeProduct"),
    status: o.status,
    displayStatus: localeStatus(o.status),
    statusColor: PRODUCT_ORDER_STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-800",
    grandTotal: o.grandTotal,
    createdAt: o.createdAt,
    trackUrl: o.trackingToken ? `/track-produk/${o.trackingToken}` : null,
  }));

  const truckingOrdersMapped = (orderFeed?.truckingOrders ?? []).map((o) => ({
    _key: `truck-${o.id}`,
    _id: o.id,
    _type: "trucking" as const,
    _cancellable: false,
    displayNumber: o.bookingNumber,
    subtitle: `${o.vehicleName} • ${o.pickup ?? ""} → ${o.delivery ?? ""}`,
    status: o.status,
    displayStatus: localeStatus(o.status),
    statusColor: STATUS_COLOR[o.status] ?? "bg-blue-100 text-blue-800",
    grandTotal: o.grandTotal,
    createdAt: o.createdAt,
    trackUrl: `/trucking/orders/${encodeURIComponent(o.bookingNumber)}`,
  }));

  const marketplaceRfqsMapped = (orderFeed?.marketplaceRfqs ?? []).map((o) => ({
    _key: `mkt-rfq-${o.rfqId}`,
    _id: o.rfqId,
    _type: "marketplace" as const,
    _cancellable: false,
    displayNumber: o.rfqNumber,
    subtitle: "Marketplace / RFQ",
    status: o.approvalStatus === "pending" ? "approval_pending" : o.rfqStatus,
    displayStatus: o.approvalStatus === "pending"
      ? "Menunggu approval"
      : MARKETPLACE_STATUS_LABEL[o.rfqStatus] ?? o.rfqStatus,
    statusColor: o.approvalStatus === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : MARKETPLACE_STATUS_COLOR[o.rfqStatus] ?? "bg-gray-100 text-gray-800",
    grandTotal: 0,
    createdAt: o.createdAt,
    trackUrl: `/marketplace/my-rfqs/${o.rfqId}`,
  }));

  const allOrders = [...truckingOrdersMapped, ...logisticOrders, ...crmOrders, ...productOrdersMapped, ...marketplaceRfqsMapped].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const isLoading = isLoadingOrderFeed;

  const statusFiltered = statusFilter
    ? statusFilter === "active"
      ? allOrders.filter((o) => {
          const s = o.status;
          return s !== "Completed" && s !== "Cancelled" && s !== "cancelled" && s !== "delivered";
        })
      : allOrders.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase())
    : allOrders;

  const filtered = search.trim()
    ? statusFiltered.filter(
        (o) =>
          o.displayNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.subtitle.toLowerCase().includes(search.toLowerCase())
      )
    : statusFiltered;

  const handleCancel = async (order: typeof allOrders[number]) => {
    if (!confirm(`${t("orders.cancelConfirmPrefix")} ${order.displayNumber}?`)) return;
    setCancellingKey(order._key);
    try {
      if (order._type === "crm") {
        await cancelCrmOrder.mutateAsync({ id: order._id });
        queryClient.invalidateQueries({ queryKey: ["portal-order-feed"] });
      } else if (order._type === "logistic") {
        await cancelLogisticOrder.mutateAsync({ id: order._id });
        queryClient.invalidateQueries({ queryKey: ["portal-order-feed"] });
      }
    } catch {
      alert(t("orders.cancelFailed"));
    } finally {
      setCancellingKey(null);
    }
  };

  const TYPE_BADGE: Record<string, string> = {
    logistic: "bg-blue-50 text-blue-600",
    crm: "bg-slate-50 text-slate-600",
    product: "bg-emerald-50 text-emerald-700",
    marketplace: "bg-orange-50 text-orange-700",
  };
  const TYPE_LABEL: Record<string, string> = {
    logistic: t("orders.typeLogistic"),
    crm: t("orders.typeCrm"),
    product: t("orders.typeProduct"),
    marketplace: "Marketplace / RFQ",
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <div className="container px-4 md:px-6">

        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/dashboard")}
          className="inline-flex items-center gap-1.5 mb-4 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("orders.back")}
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              {t("orders.myOrders")}
            </h1>
            <p className="text-muted-foreground">
              {t("orders.myOrdersDesc")}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Cari nomor pesanan..."
              className="pl-9 pr-8 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); searchInputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {(["logistic", "product", "crm", "marketplace"] as const).map((type) => {
            const count = allOrders.filter((o) => o._type === type).length;
            return (
              <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[type]}`}>
                {TYPE_LABEL[type]}: {count}
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Total: {allOrders.length}
          </span>
        </div>

        {statusFilter && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">{t("orders.activeFilterLabel")}</span>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <button onClick={clearStatusFilter} className="hover:text-primary/70 transition-colors ml-0.5" aria-label={t("orders.hapusFilter")}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        )}

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("orders.orderDetails")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.type")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.date")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.status")}</th>
                  <th className="px-6 py-4 font-medium text-right">{t("orders.total")}</th>
                  <th className="px-6 py-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-white">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-28" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24 ml-auto" /></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map((order) => (
                    <tr
                      key={order._key}
                      className={`transition-colors ${order.trackUrl ? "cursor-pointer hover:bg-blue-50/60" : "hover:bg-gray-50/50"}`}
                      onClick={() => order.trackUrl && setLocation(order.trackUrl)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/5 p-2 rounded-lg shrink-0">
                            <img src={staticAsset("images/logo.png")} alt="" className="h-5 w-auto object-contain" />
                          </div>
                          <div>
                            <div className="font-semibold text-primary flex items-center gap-1.5">
                              <Highlight text={order.displayNumber} query={search} />
                              {order.trackUrl && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                              <Highlight text={order.subtitle} query={search} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[order._type]}`}>
                          {TYPE_LABEL[order._type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={`${order.statusColor} font-medium border-0`}>
                          {order.displayStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold text-base">
                          {formatCurrency(order.grandTotal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {order._type === "logistic" &&
                            (order.grandTotal ?? 0) > 0 &&
                            !["Completed", "Payment Received", "Cancelled"].includes(order.status) &&
                            order.trackUrl && (
                              <button
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Bayar via Paylabs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(order.trackUrl!);
                                }}
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                          {order._cancellable && (
                            <button
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title={t("orders.cancelOrder")}
                              disabled={cancellingKey === order._key}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleCancel(order);
                              }}
                              data-testid={`btn-cancel-${order._key}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-lg font-medium text-foreground">
                        {search ? t("orders.noResults") : t("orders.noOrders")}
                      </p>
                      <p>{search ? t("orders.noResultsDesc") : t("orders.emptyStateMsg")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
