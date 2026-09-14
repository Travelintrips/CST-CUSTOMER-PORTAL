import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  ChevronRight,
  PackageOpen,
  RefreshCw,
  Calendar,
  Building2,
  Filter,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BuyerPo {
  id: number;
  poNumber: string;
  rfqId: number;
  rfqNumber: string;
  status: string;
  grandTotal: string | number | null;
  currencySnapshot: string | null;
  createdAt: string;
  confirmedAt: string | null;
  leadTimeDaysSnapshot: number | null;
  quotationDateSnapshot: string | null;
  vendorNameSnapshot: string | null;
  vendorName: string | null;
}

// ── Status color config (labels resolved via t() inside component) ────────────

const PO_STATUS_COLOR: Record<string, string> = {
  pending:              "bg-slate-100 text-slate-600",
  draft:                "bg-slate-100 text-slate-700",
  issued:               "bg-blue-100 text-blue-700",
  vendor_accepted:      "bg-teal-100 text-teal-700",
  vendor_rejected:      "bg-rose-100 text-rose-700",
  revision_requested:   "bg-orange-100 text-orange-700",
  production:           "bg-amber-100 text-amber-700",
  ready_to_ship:        "bg-cyan-100 text-cyan-700",
  in_transit:           "bg-indigo-100 text-indigo-700",
  delivered:            "bg-emerald-100 text-emerald-700",
  partially_delivered:  "bg-lime-100 text-lime-700",
  completed:            "bg-green-100 text-green-700",
  closed:               "bg-gray-100 text-gray-600",
  cancelled:            "bg-red-100 text-red-700",
  rejected_goods:       "bg-red-100 text-red-800",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtAmount(amount: string | number | null, currency: string | null): string {
  if (amount == null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return `${currency ?? "IDR"} ${new Intl.NumberFormat("id-ID").format(num)}`;
}

function calcExpectedCompletion(
  quotationDate: string | null,
  leadTimeDays: number | null,
): string {
  if (!quotationDate || !leadTimeDays) return "—";
  const d = new Date(quotationDate);
  d.setDate(d.getDate() + leadTimeDays);
  return fmtDate(d.toISOString());
}

function getVendorDisplay(po: BuyerPo): string {
  return po.vendorName ?? po.vendorNameSnapshot ?? "—";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MktMyPurchaseOrdersPage() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const { t } = useLanguage();

  const PO_STATUS: Record<string, { label: string; color: string }> = {
    pending:              { label: t("mktPurchaseOrders.statusPending"),           color: PO_STATUS_COLOR.pending },
    draft:                { label: t("mktPurchaseOrders.statusDraft"),             color: PO_STATUS_COLOR.draft },
    issued:               { label: t("mktPurchaseOrders.statusIssued"),            color: PO_STATUS_COLOR.issued },
    vendor_accepted:      { label: t("mktPurchaseOrders.statusVendorAccepted"),    color: PO_STATUS_COLOR.vendor_accepted },
    vendor_rejected:      { label: t("mktPurchaseOrders.statusVendorRejected"),    color: PO_STATUS_COLOR.vendor_rejected },
    revision_requested:   { label: t("mktPurchaseOrders.statusRevisionRequested"), color: PO_STATUS_COLOR.revision_requested },
    production:           { label: t("mktPurchaseOrders.statusProduction"),        color: PO_STATUS_COLOR.production },
    ready_to_ship:        { label: t("mktPurchaseOrders.statusReadyToShip"),       color: PO_STATUS_COLOR.ready_to_ship },
    in_transit:           { label: t("mktPurchaseOrders.statusInTransit"),         color: PO_STATUS_COLOR.in_transit },
    delivered:            { label: t("mktPurchaseOrders.statusDelivered"),         color: PO_STATUS_COLOR.delivered },
    partially_delivered:  { label: t("mktPurchaseOrders.statusPartiallyDelivered"),color: PO_STATUS_COLOR.partially_delivered },
    completed:            { label: t("mktPurchaseOrders.statusCompleted"),         color: PO_STATUS_COLOR.completed },
    closed:               { label: t("mktPurchaseOrders.statusClosed"),            color: PO_STATUS_COLOR.closed },
    cancelled:            { label: t("mktPurchaseOrders.statusCancelled"),         color: PO_STATUS_COLOR.cancelled },
    rejected_goods:       { label: t("mktPurchaseOrders.statusRejectedGoods"),     color: PO_STATUS_COLOR.rejected_goods },
  };

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<string>("all");
  const [vendorFilter, setVendor]   = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data, isLoading, isError, refetch } = useQuery<{
    ok: boolean;
    data: BuyerPo[];
    count: number;
  }>({
    queryKey: ["mkt-my-purchase-orders"],
    queryFn: async () => {
      const res = await fetch("/api/mkt/portal/purchase-orders?limit=100", {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error("Gagal memuat purchase orders");
      return res.json();
    },
    enabled: authed,
  });

  const allPos = data?.data ?? [];

  // Distinct vendors for filter dropdown
  const vendors = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const po of allPos) {
      const v = getVendorDisplay(po);
      if (v !== "—" && !seen.has(v)) { seen.add(v); result.push(v); }
    }
    return result.sort();
  }, [allPos]);

  // Date filter helper
  function passesDateFilter(po: BuyerPo): boolean {
    if (dateFilter === "all") return true;
    const d = new Date(po.createdAt);
    const now = new Date();
    if (dateFilter === "7d") {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
      return d >= cutoff;
    }
    if (dateFilter === "30d") {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    }
    if (dateFilter === "90d") {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 90);
      return d >= cutoff;
    }
    return true;
  }

  // Client-side filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allPos.filter((po) => {
      if (statusFilter !== "all" && po.status !== statusFilter) return false;
      if (vendorFilter !== "all" && getVendorDisplay(po) !== vendorFilter) return false;
      if (!passesDateFilter(po)) return false;
      if (q && !po.poNumber.toLowerCase().includes(q) &&
          !po.rfqNumber?.toLowerCase().includes(q) &&
          !getVendorDisplay(po).toLowerCase().includes(q)) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPos, search, statusFilter, vendorFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              {t("mktPurchaseOrders.pageTitle")}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("mktPurchaseOrders.pageDesc")}
            </p>
          </div>
          <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/marketplace/my-rfqs">
              <PackageOpen className="w-4 h-4 mr-1.5" />
              {t("mktPurchaseOrders.viewRfqs")}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t("mktPurchaseOrders.searchPlaceholder")}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Filter className="w-3.5 h-3.5" />
                <span>{t("mktPurchaseOrders.filterLabel")}</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("mktPurchaseOrders.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("mktPurchaseOrders.allStatus")}</SelectItem>
                  {Object.entries(PO_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={vendorFilter} onValueChange={setVendor}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t("mktPurchaseOrders.allVendors")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("mktPurchaseOrders.allVendors")}</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t("mktPurchaseOrders.allDates")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("mktPurchaseOrders.allDates")}</SelectItem>
                  <SelectItem value="7d">{t("mktPurchaseOrders.last7Days")}</SelectItem>
                  <SelectItem value="30d">{t("mktPurchaseOrders.last30Days")}</SelectItem>
                  <SelectItem value="90d">{t("mktPurchaseOrders.last90Days")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-red-600 font-medium">{t("mktPurchaseOrders.fetchError")}</p>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> {t("mktPurchaseOrders.retry")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-3">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500 font-medium">
                {allPos.length === 0
                  ? t("mktPurchaseOrders.emptyPo")
                  : t("mktPurchaseOrders.noMatchingPo")}
              </p>
              {allPos.length === 0 && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/marketplace/my-rfqs">{t("mktPurchaseOrders.viewRfqs")}</Link>
                </Button>
              )}
              {allPos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch(""); setStatus("all"); setVendor("all"); setDateFilter("all");
                  }}
                >
                  {t("mktPurchaseOrders.resetFilter")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Table header (desktop) */}
        {!isLoading && !isError && filtered.length > 0 && (
          <>
            <div className="hidden md:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>{t("mktPurchaseOrders.colPoNumber")}</span>
              <span>{t("mktPurchaseOrders.colVendor")}</span>
              <span>{t("mktPurchaseOrders.colStatus")}</span>
              <span>{t("mktPurchaseOrders.colEstCompletion")}</span>
              <span>{t("mktPurchaseOrders.colCreatedAt")}</span>
              <span></span>
            </div>

            <div className="space-y-2">
              {filtered.map((po) => {
                const st = PO_STATUS[po.status] ?? { label: po.status, color: "bg-gray-100 text-gray-700" };
                const expectedCompletion = calcExpectedCompletion(
                  po.quotationDateSnapshot,
                  po.leadTimeDaysSnapshot,
                );
                const vendor = getVendorDisplay(po);

                return (
                  <Card
                    key={po.id}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/marketplace/my-purchase-orders/${po.id}`)}
                  >
                    <CardContent className="p-4">
                      {/* Mobile layout */}
                      <div className="md:hidden space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-sm font-semibold text-gray-800">
                              {po.poNumber}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">{t("mktPurchaseOrders.rfqPrefix")}{po.rfqNumber}</p>
                          </div>
                          <Badge className={`text-xs shrink-0 ${st.color}`} variant="secondary">
                            {st.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {vendor}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {fmtDate(po.createdAt)}
                          </span>
                          <span>{fmtAmount(po.grandTotal, po.currencySnapshot)}</span>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden md:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 items-center">
                        <div>
                          <div className="font-mono text-sm font-semibold text-gray-800">
                            {po.poNumber}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{t("mktPurchaseOrders.rfqPrefix")}{po.rfqNumber}</div>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-gray-700 truncate">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{vendor}</span>
                        </div>

                        <Badge className={`text-xs ${st.color}`} variant="secondary">
                          {st.label}
                        </Badge>

                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {expectedCompletion}
                        </span>

                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {fmtDate(po.createdAt)}
                        </span>

                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 text-center">
              {t("mktPurchaseOrders.showingCount")
                .replace("{current}", String(filtered.length))
                .replace("{total}", String(allPos.length))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
