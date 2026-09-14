import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Search, Ship, Truck, CheckCircle2, Clock,
  MapPin, Package, RefreshCw, AlertCircle, FileText,
  Circle, ArrowRight, Loader2, ThumbsUp, ThumbsDown, RotateCcw, Tag,
  Bell, BellOff, Navigation, ExternalLink, Image as ImageIcon, X,
  CreditCard, ShieldCheck,
} from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";
import { usePortalSSEOrderTracker } from "@/hooks/usePortalSSE";
import { formatDate, resolveImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import PageSeo from "@/components/PageSeo";
import { useLanguage } from "@/i18n/LanguageContext";
import { UI_TIMING } from "@/config/constants";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type DriverJobStatus =
  | "ASSIGNED" | "ACCEPTED" | "ON_THE_WAY_TO_PICKUP" | "ARRIVED_AT_PICKUP"
  | "PICKED_UP" | "IN_TRANSIT" | "ARRIVED_AT_DESTINATION" | "DELIVERED"
  | "COMPLETED" | "CANCELLED";

interface DriverLog { id: number; status: DriverJobStatus; timestamp: string; }
interface DriverPhoto {
  id: number;
  url: string;
  photoType: string;
  takenAt: string;
}

interface DriverJob {
  id: number; jobNumber: string; status: DriverJobStatus;
  vehicleType: string | null;
  pickupDateTime: string | null; deliveryDateTime: string | null;
  cargoDescription: string | null; weight: string | null;
  distance: string | null; assignedAt: string; completedAt: string | null;
  logs: DriverLog[];
  photos?: DriverPhoto[];
  truckPlate?: string | null;
  driverNameOverride?: string | null;
  podReceiverName?: string | null;
  podGeoLat?: string | null;
  podGeoLng?: string | null;
  podMapUrl?: string | null;
  podStreetViewUrl?: string | null;
  podDeviceTimestamp?: string | null;
  podSubmittedAt?: string | null;
}

interface RfqQuote {
  rfqId: number;
  rfqStatus: string;
  quotedPrice: number | null;
  quotedAt: string | null;
  quoteNotes: string | null;
  customerResponseNotes: string | null;
  customerRespondedAt: string | null;
}

interface OrderUpdateItem {
  id: number;
  status: string | null;
  notes: string | null;
  actorType: string;
  actorName: string | null;
  createdAt: string;
}

interface PodSubmission {
  id: number;
  receiverName: string | null;
  photoUrl: string | null;
  note: string | null;
  submittedBy: string | null;
  createdAt: string;
}

interface InvoiceLink {
  token: string;
  invoiceNumber: string | null;
  grandTotal: number | null;
  dueDate: string | null;
  paymentStatus: string;
  status?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
}

interface TrackingData {
  id: number; orderNumber: string;
  customerName: string;
  shipmentType: string; origin: string; destination: string;
  status: string; createdAt: string;
  grandTotal: number | null;
  subtotal: number | null;
  tax: number | null;
  paymentMethod?: string | null;
  items: { id: number; category: string; serviceName: string }[];
  driverJob: DriverJob | null;
  rfqQuote: RfqQuote | null;
  orderUpdates: OrderUpdateItem[];
  progressEvents?: ProgressEvent[];
  podSubmissions?: PodSubmission[];
  invoiceLinks?: InvoiceLink[];
}

interface PaylabsLinkResult {
  paymentUrl: string | null;
  amount: number;
  expiredAt: string | null;
  configured?: boolean;
  reused?: boolean;
  message?: string;
}

function getStatusLabels(t: (k: string) => string): Record<string, string> {
  return {
    "Order Received":    t("logisticTrackStatus.statusOrderReceived"),
    "Admin Review":      t("logisticTrackStatus.statusAdminReview"),
    "RFQ Sent":          t("logisticTrackStatus.statusRfqSent"),
    "Quote Received":    t("logisticTrackStatus.statusQuoteReceived"),
    "Customer Approval": t("logisticTrackStatus.statusCustomerApproval"),
    "Vendor Confirmed":  t("logisticTrackStatus.statusVendorConfirmed"),
    "Vendor Rejected":   t("logisticTrackStatus.statusVendorRejected"),
    "In Progress":       t("logisticTrackStatus.statusInProgress"),
    "Pickup":            t("logisticTrackStatus.statusPickup"),
    "In Transit":        t("logisticTrackStatus.statusInTransit"),
    "Arrived":           t("logisticTrackStatus.statusArrived"),
    "Delivered":         t("logisticTrackStatus.statusDelivered"),
    "POD Uploaded":      t("logisticTrackStatus.statusPodUploaded"),
    "Invoice Issued":    t("logisticTrackStatus.statusInvoiceIssued"),
    "Payment Received":  t("logisticTrackStatus.statusPaymentReceived"),
    "Completed":         t("logisticTrackStatus.statusCompleted"),
    "Done":              t("logisticTrackStatus.statusDone"),
    "Cancelled":         t("logisticTrackStatus.statusCancelled"),
    "New Order":         t("logisticTrackStatus.statusNewOrder"),
    "Under Review":      t("logisticTrackStatus.statusUnderReview"),
    "Quotation Sent":    t("logisticTrackStatus.statusQuotationSent"),
    "Customer Approved": t("logisticTrackStatus.statusCustomerApproved"),
    "Processing":        t("logisticTrackStatus.statusProcessing"),
  };
}

function getOrderSteps(t: (k: string) => string) {
  return [
    { key: "Order Received",    label: t("logisticTrackStatus.stepLabelOrderReceived"),    icon: FileText },
    { key: "Admin Review",      label: t("logisticTrackStatus.stepLabelAdminReview"),      icon: Clock },
    { key: "RFQ Sent",          label: t("logisticTrackStatus.stepLabelRfqSent"),          icon: ArrowRight },
    { key: "Quote Received",    label: t("logisticTrackStatus.stepLabelQuoteReceived"),    icon: Tag },
    { key: "Customer Approval", label: t("logisticTrackStatus.stepLabelCustomerApproval"), icon: ThumbsUp },
    { key: "Vendor Confirmed",  label: t("logisticTrackStatus.stepLabelVendorConfirmed"),  icon: CheckCircle2 },
    { key: "In Progress",       label: t("logisticTrackStatus.stepLabelInProgress"),       icon: RotateCcw },
    { key: "Pickup",            label: t("logisticTrackStatus.stepLabelPickup"),           icon: MapPin },
    { key: "In Transit",        label: t("logisticTrackStatus.stepLabelInTransit"),        icon: Truck },
    { key: "Arrived",           label: t("logisticTrackStatus.stepLabelArrived"),          icon: MapPin },
    { key: "Delivered",         label: t("logisticTrackStatus.stepLabelDelivered"),        icon: Package },
    { key: "POD Uploaded",      label: t("logisticTrackStatus.stepLabelPodUploaded"),      icon: FileText },
    { key: "Invoice Issued",    label: t("logisticTrackStatus.stepLabelInvoiceIssued"),    icon: FileText },
    { key: "Payment Received",  label: t("logisticTrackStatus.stepLabelPaymentReceived"),  icon: CheckCircle2 },
    { key: "Completed",         label: t("logisticTrackStatus.stepLabelCompleted"),        icon: CheckCircle2 },
  ];
}

function getDriverSteps(t: (k: string) => string): { key: DriverJobStatus; label: string }[] {
  return [
    { key: "ASSIGNED",               label: t("logisticTrackStatus.driverAssigned") },
    { key: "ACCEPTED",               label: t("logisticTrackStatus.driverAccepted") },
    { key: "ON_THE_WAY_TO_PICKUP",   label: t("logisticTrackStatus.driverOnWayPickup") },
    { key: "ARRIVED_AT_PICKUP",      label: t("logisticTrackStatus.driverArrivedPickup") },
    { key: "PICKED_UP",              label: t("logisticTrackStatus.driverPickedUp") },
    { key: "IN_TRANSIT",             label: t("logisticTrackStatus.driverInTransit") },
    { key: "ARRIVED_AT_DESTINATION", label: t("logisticTrackStatus.driverArrivedDest") },
    { key: "DELIVERED",              label: t("logisticTrackStatus.driverDelivered") },
    { key: "COMPLETED",              label: t("logisticTrackStatus.driverCompleted") },
  ];
}

function getCustomerVisibleSteps(t: (k: string) => string) {
  return [
    { key: "Order Received",   label: t("logisticTrackStatus.stepOrderReceived") },
    { key: "Admin Review",     label: t("logisticTrackStatus.stepAdminReview") },
    { key: "Vendor Confirmed", label: t("logisticTrackStatus.stepVendorConfirmed") },
    { key: "In Progress",      label: t("logisticTrackStatus.stepInProgress") },
    { key: "In Transit",       label: t("logisticTrackStatus.stepInTransit") },
    { key: "Delivered",        label: t("logisticTrackStatus.stepDelivered") },
    { key: "POD Uploaded",     label: t("logisticTrackStatus.stepPodUploaded") },
    { key: "Invoice Issued",   label: t("logisticTrackStatus.stepInvoiceIssued") },
    { key: "Completed",        label: t("logisticTrackStatus.stepCompleted") },
  ];
}

const ORDER_STATUS_RANK: Record<string, number> = {
  "Order Received":    0,
  "Admin Review":      1,
  "RFQ Sent":          2,
  "Quote Received":    3,
  "Customer Approval": 4,
  "Vendor Confirmed":  5,
  "In Progress":       6,
  "Pickup":            7,
  "In Transit":        8,
  "Arrived":           9,
  "Delivered":         10,
  "POD Uploaded":      11,
  "Invoice Issued":    12,
  "Payment Received":  13,
  "Completed":         14,
  // backward compat aliases
  "New Order":         0,
  "Under Review":      1,
  "Processing":        1,
  "Quotation Sent":    3,
  "Customer Approved": 4,
  "Vendor Rejected":   2,
  "Done":              14,
};

const DRIVER_STATUS_RANK: Record<string, number> = {
  "ASSIGNED":               0,
  "ACCEPTED":               1,
  "ON_THE_WAY_TO_PICKUP":   2,
  "ARRIVED_AT_PICKUP":      3,
  "PICKED_UP":              4,
  "IN_TRANSIT":             5,
  "ARRIVED_AT_DESTINATION": 6,
  "DELIVERED":              7,
  "COMPLETED":              8,
};

const STATUS_COLORS: Record<string, string> = {
  "Order Received":    "bg-slate-100 text-slate-700 border-slate-200",
  "Admin Review":      "bg-amber-100 text-amber-800 border-amber-200",
  "RFQ Sent":          "bg-blue-100 text-blue-700 border-blue-200",
  "Quote Received":    "bg-purple-100 text-purple-800 border-purple-200",
  "Customer Approval": "bg-violet-100 text-violet-800 border-violet-200",
  "Vendor Confirmed":  "bg-green-100 text-green-800 border-green-200",
  "In Progress":       "bg-blue-100 text-blue-800 border-blue-200",
  "Pickup":            "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Transit":        "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Arrived":           "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Delivered":         "bg-teal-100 text-teal-800 border-teal-200",
  "POD Uploaded":      "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Invoice Issued":    "bg-orange-100 text-orange-800 border-orange-200",
  "Payment Received":  "bg-lime-100 text-lime-800 border-lime-200",
  "Completed":         "bg-green-200 text-green-900 border-green-300",
  "Cancelled":         "bg-red-100 text-red-800 border-red-200",
  // backward compat
  "New Order":         "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Processing":        "bg-blue-100 text-blue-800 border-blue-200",
};

function isTerminalStatus(status: string) {
  return status === "Completed" || status === "Done" || status === "Cancelled";
}

const CUSTOMER_STEP_RANK: Record<string, number> = {
  "Order Received":    0,
  "Admin Review":      1,
  "RFQ Sent":          1,
  "Quote Received":    1,
  "Customer Approval": 1,
  "Vendor Confirmed":  2,
  "In Progress":       3,
  "Pickup":            4,
  "In Transit":        4,
  "Arrived":           5,
  "Delivered":         5,
  "POD Uploaded":      6,
  "Invoice Issued":    7,
  "Payment Received":  8,
  "Completed":         8,
  "New Order":         0,
  "Processing":        1,
};

function formatDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function idr(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function PaylabsPaymentSection({ orderNumber }: { orderNumber: string }) {
  const { t, locale } = useLanguage();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [result, setResult] = useState<PaylabsLinkResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false);

  const generate = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const r = await fetch(`${BASE}/api/logistic/orders/${orderNumber}/create-paylabs-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await r.json() as PaylabsLinkResult & { message?: string };
      if (!r.ok) throw new Error(data.message ?? t("logisticTrackStatus.linkFailed"));
      setResult(data);
      setState("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("common.error"));
      setState("error");
    }
  }, [orderNumber, t]);

  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      void generate();
    }
  }, [generate]);

  function fmtIdr(n: number) {
    return "Rp " + Math.round(n).toLocaleString("id-ID");
  }

  return (
    <div className="bg-card border border-emerald-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm font-semibold text-emerald-900">{t("logisticTrackStatus.payViaGateway")}</p>
        <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] border">Paylabs</Badge>
      </div>
      <div className="p-5 space-y-4">
        {state === "loading" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm text-muted-foreground">{t("logisticTrackStatus.preparingLink")}</p>
          </div>
        )}
        {state === "error" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t("logisticTrackStatus.linkFailed")}</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => void generate()}>
              <RefreshCw className="w-4 h-4" /> {t("logisticTrackStatus.retryBtn")}
            </Button>
          </div>
        )}
        {state === "ready" && result && (
          <>
            {result.paymentUrl ? (
              <>
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("logisticTrackStatus.orderNo")}</span>
                    <span className="font-bold tracking-wider text-foreground">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("logisticTrackStatus.totalBill")}</span>
                    <span className="font-bold text-emerald-700">{fmtIdr(result.amount)}</span>
                  </div>
                  {result.expiredAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t("logisticTrackStatus.validUntil")}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(result.expiredAt).toLocaleString(locale, {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {t("logisticTrackStatus.securedByPaylabs")}
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 text-base font-bold shadow-md"
                  onClick={() => window.open(result.paymentUrl!, "_blank")}
                >
                  <CreditCard className="w-5 h-5" />
                  {t("logisticTrackStatus.payNow")}
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                </Button>
                {result.reused && (
                  <p className="text-xs text-center text-muted-foreground">
                    {t("logisticTrackStatus.linkReused")}
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-semibold">{t("logisticTrackStatus.linkPending")}</p>
                <p className="text-xs mt-1">
                  {t("logisticTrackStatus.linkPendingDesc")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ProgressEvent {
  id: number;
  stepKey: string;
  stepLabel: string;
  source: string;
  actorName: string | null;
  notes: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  deviceTimestamp: string | null;
  mapUrl: string | null;
  streetViewUrl: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

class PhoneVerificationRequiredError extends Error {
  requiresPhoneVerification = true;
  constructor(message: string) {
    super(message);
    this.name = "PhoneVerificationRequiredError";
  }
}

async function fetchTracking(orderNumber: string, phoneLast4: string): Promise<TrackingData> {
  const qs = phoneLast4 ? `?phone=${encodeURIComponent(phoneLast4)}` : "";
  const res = await fetch(`${BASE}/api/logistic/orders/track/${encodeURIComponent(orderNumber)}${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? "Order tidak ditemukan";
    if (res.status === 403 && (body as { requiresPhoneVerification?: boolean }).requiresPhoneVerification) {
      throw new PhoneVerificationRequiredError(message);
    }
    throw new Error(message);
  }
  return res.json() as Promise<TrackingData>;
}

function OrderStepper({ status }: { status: string }) {
  const { t } = useLanguage();
  const customerVisibleSteps = getCustomerVisibleSteps(t);
  const isCancelled = status === "Cancelled";
  const current = CUSTOMER_STEP_RANK[status] ?? 0;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 my-1">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-red-700 font-semibold text-sm">{t("logisticTrackStatus.orderCancelled")}</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-start min-w-[480px]">
        {customerVisibleSteps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 text-[10px] font-bold",
                  done   ? "bg-green-500 border-green-500 text-white" :
                  active ? "bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20" :
                            "bg-muted border-border text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                </div>
                <span className={cn(
                  "text-[9px] font-medium text-center leading-tight whitespace-pre-line",
                  active ? "text-primary font-semibold" :
                  done   ? "text-green-600" :
                            "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {i < customerVisibleSteps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-shrink-0 w-3 mt-3.5",
                  i < current ? "bg-green-400" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DriverStepper({ job }: { job: DriverJob }) {
  const { t, locale } = useLanguage();
  const driverSteps = getDriverSteps(t);
  const current = DRIVER_STATUS_RANK[job.status] ?? 0;
  const isCancelled = job.status === "CANCELLED";
  const visibleSteps = driverSteps.filter((s) => s.key !== "COMPLETED" || job.status === "COMPLETED");

  return (
    <div className="space-y-0">
      {visibleSteps.map((step, i) => {
        const stepRank = DRIVER_STATUS_RANK[step.key];
        const done = stepRank < current;
        const active = stepRank === current;
        const log = [...job.logs].reverse().find((l) => l.status === step.key);

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5",
                isCancelled ? "bg-red-100 border-red-300 text-red-400" :
                done   ? "bg-green-500 border-green-500 text-white" :
                active ? "bg-primary border-primary text-primary-foreground" :
                          "bg-muted border-border text-muted-foreground"
              )}>
                {done && !isCancelled
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : active && !isCancelled
                    ? <Circle className="w-3.5 h-3.5 fill-current" />
                    : <Circle className="w-2 h-2" />
                }
              </div>
              {i < visibleSteps.length - 1 && (
                <div className={cn(
                  "w-0.5 flex-1 my-1",
                  done && !isCancelled ? "bg-green-400" : "bg-border"
                )} />
              )}
            </div>
            <div className={cn("pb-4", i === visibleSteps.length - 1 && "pb-0")}>
              <p className={cn(
                "text-sm font-medium",
                active && !isCancelled ? "text-primary" :
                done && !isCancelled ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </p>
              {log && (
                <p className="text-xs text-muted-foreground mt-0.5">
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

function QuoteCard({
  rfqQuote,
  orderNumber,
  onRespond,
}: {
  rfqQuote: RfqQuote;
  orderNumber: string;
  onRespond: () => void;
}) {
  const { t, locale } = useLanguage();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingResponse, setPendingResponse] = useState<"approved" | "revision_requested" | "rejected" | null>(null);
  const qc = useQueryClient();

  const respondMut = useMutation({
    mutationFn: async (payload: { response: "approved" | "revision_requested" | "rejected"; notes?: string }) => {
      const r = await fetch(`${BASE}/api/logistic/rfq/quote-respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, ...payload }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? t("common.error"));
      return d;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracking", orderNumber] });
      setShowNotes(false);
      setPendingResponse(null);
      setNotes("");
      onRespond();
    },
  });

  const { rfqStatus, quotedPrice, quotedAt, quoteNotes, customerResponseNotes, customerRespondedAt } = rfqQuote;

  if (rfqStatus === "customer_approved") {
    return (
      <div className="bg-card border border-green-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
          <ThumbsUp className="w-4 h-4" /> {t("logisticTrackStatus.quoteApproved")}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("logisticTrackStatus.quoteProcessingDesc")} <strong className="text-foreground">{idr(quotedPrice)}</strong>.
          {customerResponseNotes && <p className="mt-1">{t("logisticTrackStatus.quoteYourNotes")} {customerResponseNotes}</p>}
        </div>
        {customerRespondedAt && (
          <p className="text-xs text-muted-foreground">{t("logisticTrackStatus.quoteApprovedAt")} {formatDateTime(customerRespondedAt, locale)}</p>
        )}
      </div>
    );
  }

  if (rfqStatus === "customer_rejected") {
    return (
      <div className="bg-card border border-red-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
          <ThumbsDown className="w-4 h-4" /> {t("logisticTrackStatus.quoteRejected")}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("logisticTrackStatus.quoteRevisionNotes")}
          {customerResponseNotes && <p className="mt-1">{customerResponseNotes}</p>}
        </div>
        {customerRespondedAt && (
          <p className="text-xs text-muted-foreground">{t("logisticTrackStatus.quoteRejectedAt")} {formatDateTime(customerRespondedAt, locale)}</p>
        )}
      </div>
    );
  }

  if (rfqStatus === "customer_revision_requested") {
    return (
      <div className="bg-card border border-yellow-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-yellow-700 font-semibold text-sm">
          <RotateCcw className="w-4 h-4" /> {t("logisticTrackStatus.quoteRevisionRequested")}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("logisticTrackStatus.quoteRevisionNotes")}
          {customerResponseNotes && <p className="mt-1">{customerResponseNotes}</p>}
        </div>
        {customerRespondedAt && (
          <p className="text-xs text-muted-foreground">{t("logisticTrackStatus.quoteRevisionAt")} {formatDateTime(customerRespondedAt, locale)}</p>
        )}
      </div>
    );
  }

  if (rfqStatus === "customer_quoted" && quotedPrice != null) {
    return (
      <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Tag className="w-4 h-4" /> {t("logisticTrackStatus.statusQuoteReceived")}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("logisticTrackStatus.quoteProcessingDesc")}
        </p>

        <div className="bg-muted/40 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("logisticTrackStatus.totalBill")}</span>
            <span className="text-xl font-bold text-foreground">{idr(quotedPrice)}</span>
          </div>
          {quotedAt && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("logisticTrackStatus.quoteApprovedAt")}</span>
              <span>{formatDateTime(quotedAt, locale)}</span>
            </div>
          )}
          {quoteNotes && (
            <div className="text-xs text-muted-foreground bg-background rounded p-2 border border-border">
              📝 {quoteNotes}
            </div>
          )}
        </div>

        {respondMut.isError && (
          <p className="text-xs text-red-500">{(respondMut.error as Error).message}</p>
        )}

        {respondMut.isSuccess && !showNotes && (
          <p className="text-xs text-green-600 font-medium">✓ {t("logisticTrackStatus.quoteApproved")}</p>
        )}

        {showNotes && pendingResponse && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {pendingResponse === "revision_requested"
                ? t("logisticTrackStatus.quoteRevisionNotes")
                : pendingResponse === "rejected"
                  ? t("logisticTrackStatus.quoteRejectedAt")
                  : t("logisticTrackStatus.quoteYourNotes")}
            </p>
            <Textarea
              placeholder={
                pendingResponse === "revision_requested"
                  ? t("logisticTrackStatus.quoteRevisionNotes")
                  : pendingResponse === "rejected"
                    ? t("logisticTrackStatus.quoteRejectedAt")
                    : t("logisticTrackStatus.quoteYourNotes")
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => { setShowNotes(false); setPendingResponse(null); setNotes(""); }}
                disabled={respondMut.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className={cn(
                  "flex-1",
                  pendingResponse === "approved" && "bg-green-600 hover:bg-green-700",
                  pendingResponse === "revision_requested" && "bg-yellow-600 hover:bg-yellow-700",
                  pendingResponse === "rejected" && "bg-red-600 hover:bg-red-700",
                )}
                onClick={() => respondMut.mutate({ response: pendingResponse, notes: notes || undefined })}
                disabled={respondMut.isPending}
              >
                {respondMut.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : pendingResponse === "approved" ? t("logisticTrackStatus.quoteApproved")
                    : pendingResponse === "revision_requested" ? t("logisticTrackStatus.quoteRevisionRequested")
                      : t("logisticTrackStatus.quoteRejected")}
              </Button>
            </div>
          </div>
        )}

        {!showNotes && !respondMut.isSuccess && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">{t("logisticTrackStatus.quoteYourNotes")}</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={() => { setPendingResponse("approved"); setShowNotes(true); }}
                disabled={respondMut.isPending}
              >
                <ThumbsUp className="w-3.5 h-3.5 mr-1" /> {t("logisticTrackStatus.quoteApproved")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 text-xs"
                onClick={() => { setPendingResponse("revision_requested"); setShowNotes(true); }}
                disabled={respondMut.isPending}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t("logisticTrackStatus.quoteRevisionRequested")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                onClick={() => { setPendingResponse("rejected"); setShowNotes(true); }}
                disabled={respondMut.isPending}
              >
                <ThumbsDown className="w-3.5 h-3.5 mr-1" /> {t("logisticTrackStatus.quoteRejected")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Status-change notification banner ────────────────────────────────────────
function StatusChangeBanner({
  prevStatus,
  newStatus,
  onDismiss,
  statusLabels,
}: {
  prevStatus: string;
  newStatus: string;
  onDismiss: () => void;
  statusLabels: Record<string, string>;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, UI_TIMING.TRACK_NOTIFICATION_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="animate-in slide-in-from-top-2 fade-in duration-300 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
      <Bell className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-green-800">Status Pengiriman Diperbarui</p>
        <p className="text-xs text-green-700 mt-0.5">
          <span className="line-through opacity-60">{statusLabels[prevStatus] ?? prevStatus}</span>
          {" → "}
          <strong>{statusLabels[newStatus] ?? newStatus}</strong>
        </p>
      </div>
      <button onClick={onDismiss} className="text-green-500 hover:text-green-700 text-xs font-medium">
        {/* close button */}✕
      </button>
    </div>
  );
}

// ── Countdown + live indicator ────────────────────────────────────────────────
const ACTIVE_INTERVAL   = 15;
const TERMINAL_INTERVAL = 60;

function AutoRefreshBar({
  isTerminal,
  isFetching,
  lastRefreshed,
  onRefresh,
  sseConnected,
}: {
  isTerminal: boolean;
  isFetching: boolean;
  lastRefreshed: Date | null;
  onRefresh: () => void;
  sseConnected: boolean;
}) {
  const { t } = useLanguage();
  const intervalSec = isTerminal ? TERMINAL_INTERVAL : ACTIVE_INTERVAL;
  const [countdown, setCountdown] = useState(intervalSec);

  useEffect(() => {
    setCountdown(intervalSec);
  }, [lastRefreshed, intervalSec]);

  useEffect(() => {
    if (isTerminal) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? intervalSec : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTerminal, intervalSec, lastRefreshed]);

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {isFetching ? (
          <RefreshCw className="w-3 h-3 animate-spin text-primary" />
        ) : isTerminal ? (
          <CheckCircle2 className="w-3 h-3 text-green-500" />
        ) : sseConnected ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400" />
          </span>
        )}
        <span>
          {isFetching
            ? t("common.loading")
            : isTerminal
              ? t("logisticTrackStatus.statusCompleted")
              : sseConnected
                ? `Live · SSE — ${t("logisticTrackStatus.refreshBtn")} ${countdown}s`
                : `${t("logisticTrackStatus.refreshBtn")} ${countdown}s`}
        </span>
      </div>
      {!isTerminal && (
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-3 h-3" />
          {t("logisticTrackStatus.refreshBtn")}
        </button>
      )}
    </div>
  );
}

// ── Push Notification Toggle ──────────────────────────────────────────────────
function PushToggle({ orderNumber }: { orderNumber: string | null }) {
  const { t } = useLanguage();
  const { state, subscribe, unsubscribe } = usePushNotification(orderNumber);

  if (state === "unsupported" || !orderNumber) return null;

  if (state === "denied") {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/60">
        <BellOff className="w-3.5 h-3.5 flex-shrink-0" />
        {t("logisticTrackStatus.pushNotifDisable")}
      </div>
    );
  }

  if (state === "subscribed") {
    return (
      <button
        onClick={unsubscribe}
        className="flex items-center gap-2 text-xs text-primary font-medium px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        <Bell className="w-3.5 h-3.5 fill-primary" />
        {t("logisticTrackStatus.pushNotifDisable")}
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={state === "loading"}
      className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-3 py-2 rounded-lg border border-border hover:bg-muted/60 transition-colors disabled:opacity-50"
    >
      {state === "loading"
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Bell className="w-3.5 h-3.5" />}
      {t("logisticTrackStatus.pushNotifEnable")}
    </button>
  );
}

function GpsMapEmbed({ events, locale }: { events: ProgressEvent[]; locale: string }) {
  const pts = events.filter((e) => e.gpsLatitude != null && e.gpsLongitude != null);
  if (pts.length === 0) return null;

  const markers = pts.map((e, i) => ({
    lat: e.gpsLatitude!,
    lng: e.gpsLongitude!,
    label: e.stepLabel,
    num: i + 1,
    ts: e.deviceTimestamp
      ? new Date(e.deviceTimestamp).toLocaleString(locale, {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " WIB"
      : new Date(e.createdAt).toLocaleString(locale, {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }),
    isLast: i === pts.length - 1,
  }));

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body,#map { width:100%; height:100%; }
  .pin-icon { background:#2563eb; color:#fff; border-radius:50% 50% 50% 0; transform:rotate(-45deg);
    width:28px; height:28px; display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.35); }
  .pin-icon.last { background:#16a34a; }
  .pin-inner { transform:rotate(45deg); }
  .leaflet-popup-content { font-size:12px; line-height:1.5; min-width:140px; }
  .popup-title { font-weight:700; margin-bottom:2px; color:#1e293b; }
  .popup-ts { color:#64748b; font-size:11px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var pts = ${JSON.stringify(markers)};
  var map = L.map('map', { zoomControl:true, attributionControl:false });
  L.tileLayer('${import.meta.env.VITE_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}', { maxZoom:19 }).addTo(map);

  var latlngs = pts.map(function(p){ return [p.lat, p.lng]; });

  if (latlngs.length > 1) {
    L.polyline(latlngs, { color:'#2563eb', weight:3, opacity:0.75, dashArray:'6,4' }).addTo(map);
  }

  pts.forEach(function(p) {
    var div = document.createElement('div');
    div.className = 'pin-icon' + (p.isLast ? ' last' : '');
    var inner = document.createElement('div');
    inner.className = 'pin-inner';
    inner.textContent = p.num;
    div.appendChild(inner);
    var icon = L.divIcon({ html:div.outerHTML, className:'', iconSize:[28,28], iconAnchor:[14,28], popupAnchor:[0,-30] });
    var popup = '<div class="popup-title">' + p.label + '</div><div class="popup-ts">' + p.ts + '</div>';
    L.marker([p.lat, p.lng], { icon:icon }).addTo(map).bindPopup(popup);
  });

  if (latlngs.length === 1) {
    map.setView(latlngs[0], 15);
  } else {
    map.fitBounds(latlngs, { padding:[24,24] });
  }
<\/script>
</body>
</html>`;

  return (
    <div className="rounded-lg overflow-hidden border border-border mb-4" style={{ height: "220px" }}>
      <iframe
        srcDoc={html}
        title="Peta Rute Driver"
        className="w-full h-full border-0"
        sandbox="allow-scripts"
      />
    </div>
  );
}

function DriverGpsTimeline({ events }: { events: ProgressEvent[] }) {
  const { locale } = useLanguage();
  const gpsEvents = events.filter((e) => e.gpsLatitude != null && e.gpsLongitude != null);
  if (gpsEvents.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-primary" />
        Riwayat Lokasi Driver
        <Badge variant="outline" className="text-xs ml-auto">{gpsEvents.length} titik</Badge>
      </h3>
      <GpsMapEmbed events={gpsEvents} locale={locale} />
      <div className="space-y-0">
        {[...gpsEvents].reverse().map((ev, i) => {
          const isFirst = i === 0;
          const isLast = i === gpsEvents.length - 1;
          const ts = ev.deviceTimestamp
            ? new Date(ev.deviceTimestamp).toLocaleString(locale, {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
                timeZone: "Asia/Jakarta",
              })
            : new Date(ev.createdAt).toLocaleString(locale, {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
                timeZone: "Asia/Jakarta",
              });

          return (
            <div key={ev.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5",
                  isFirst
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-green-500 border-green-500 text-white"
                )}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 my-1 bg-border" />
                )}
              </div>
              <div className={cn("pb-4 flex-1 min-w-0", isLast && "pb-0")}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className={cn(
                      "text-sm font-semibold",
                      isFirst ? "text-primary" : "text-foreground"
                    )}>
                      {ev.stepLabel}
                    </p>
                    {ev.actorName && (
                      <p className="text-xs text-muted-foreground">
                        👤 {ev.actorName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      🕐 {ts}
                      {ev.deviceTimestamp && " (waktu perangkat)"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      📍 {ev.gpsLatitude!.toFixed(6)}, {ev.gpsLongitude!.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {ev.mapUrl && (
                    <a
                      href={ev.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md"
                    >
                      <MapPin className="w-3 h-3" />
                      Google Maps
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {ev.streetViewUrl && (
                    <a
                      href={ev.streetViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline bg-sky-50 px-2 py-1 rounded-md"
                    >
                      <Navigation className="w-3 h-3" />
                      Street View
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {ev.photoUrl && (
                    <a
                      href={resolveImageUrl(ev.photoUrl) ?? ev.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline bg-emerald-50 px-2 py-1 rounded-md"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Lihat Gambar
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Delivery Proof Gallery ────────────────────────────────────────────────────

type PhotoGroup = { category: string; events: ProgressEvent[] };

function getPhotoCategory(stepKey: string): string {
  const k = stepKey.toUpperCase();
  if (k.includes("PICKED_UP") || k.includes("ARRIVED_AT_PICKUP") || k.includes("ON_THE_WAY_TO_PICKUP")) return "Bukti Pickup";
  if (k.includes("IN_TRANSIT") || k.includes("TRANSIT")) return "Bukti Perjalanan";
  if (k.includes("ARRIVED_AT_DESTINATION") || (k.includes("ARRIVED") && !k.includes("PICKUP"))) return "Bukti Sampai Lokasi";
  if (k.includes("DELIVERED")) return "Bukti Pengiriman";
  if (k.includes("COMPLETED")) return "Bukti Selesai";
  return "Bukti Perjalanan";
}

const PHOTO_CATEGORY_ORDER = ["Bukti Pickup", "Bukti Perjalanan", "Bukti Sampai Lokasi", "Bukti Pengiriman", "Bukti Selesai"];

function driverPhotoToEvent(p: DriverPhoto, jobNumber: string): ProgressEvent {
  const typeLabel: Record<string, string> = {
    general: "Foto Perjalanan",
    pickup: "Bukti Pickup",
    pod: "Bukti Pengiriman",
    cargo: "Foto Muatan",
    arrival: "Bukti Sampai",
  };
  const typeKey: Record<string, string> = {
    general: "IN_TRANSIT",
    pickup: "PICKED_UP",
    pod: "DELIVERED",
    cargo: "IN_TRANSIT",
    arrival: "ARRIVED_AT_DESTINATION",
  };
  return {
    id: -p.id,
    stepKey: typeKey[p.photoType] ?? "IN_TRANSIT",
    stepLabel: typeLabel[p.photoType] ?? "Foto Driver",
    source: "driver-app",
    actorName: `Driver (${jobNumber})`,
    notes: null,
    gpsLatitude: null,
    gpsLongitude: null,
    deviceTimestamp: null,
    mapUrl: null,
    streetViewUrl: null,
    photoUrl: p.url,
    createdAt: p.takenAt,
  };
}

function DeliveryProofGallery({ events, driverPhotos, jobNumber, orderStatusRank }: {
  events: ProgressEvent[];
  driverPhotos?: DriverPhoto[];
  jobNumber?: string;
  orderStatusRank: number;
}) {
  const { locale } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorUrls, setErrorUrls] = useState<Set<string>>(new Set());

  if (orderStatusRank < 7) return null;

  const driverPhotoEvents = (driverPhotos ?? []).map((p) => driverPhotoToEvent(p, jobNumber ?? ""));
  const allEvents = [...events, ...driverPhotoEvents];

  const validPhotos = allEvents.filter((e) => e.photoUrl && !errorUrls.has(e.photoUrl));

  const groupMap = new Map<string, ProgressEvent[]>();
  validPhotos.forEach((ev) => {
    const cat = getPhotoCategory(ev.stepKey);
    if (!groupMap.has(cat)) groupMap.set(cat, []);
    groupMap.get(cat)!.push(ev);
  });
  const groups: PhotoGroup[] = PHOTO_CATEGORY_ORDER.filter((c) => groupMap.has(c)).map((c) => ({
    category: c,
    events: groupMap.get(c)!,
  }));

  return (
    <div className="bg-card border border-violet-200 rounded-xl p-5">
      <h3 className="font-semibold text-violet-800 text-sm mb-4 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Galeri Bukti Pengiriman
        {validPhotos.length > 0 && (
          <span className="ml-auto text-xs font-normal text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
            {validPhotos.length} foto
          </span>
        )}
      </h3>

      {validPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
          <ImageIcon className="w-10 h-10 opacity-20" />
          <p className="text-sm text-center">Belum ada bukti foto dari driver.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2.5">
                {group.category}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {group.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-lg border border-violet-100 bg-violet-50/30 overflow-hidden cursor-pointer group"
                    onClick={() => setPreviewUrl(ev.photoUrl ? (resolveImageUrl(ev.photoUrl) ?? ev.photoUrl) : null)}
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={resolveImageUrl(ev.photoUrl) ?? ev.photoUrl!}
                        alt={ev.stepLabel}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={() =>
                          setErrorUrls((prev) => new Set([...prev, ev.photoUrl!]))
                        }
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors">
                        <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="px-2 py-1.5 space-y-0.5">
                      <p className="text-xs font-medium text-foreground truncate">{ev.stepLabel}</p>
                      {ev.actorName && (
                        <p className="text-xs text-muted-foreground truncate">👤 {ev.actorName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDateTime(ev.createdAt, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setPreviewUrl(null)}
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={resolveImageUrl(previewUrl) ?? previewUrl}
              alt="Preview"
              className="max-h-[78vh] w-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-size='14'%3EGagal memuat gambar%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="flex justify-center mt-4 gap-3">
              <a
                href={resolveImageUrl(previewUrl) ?? previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                Buka Original
              </a>
              <button
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="w-4 h-4" />
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  const { t, locale } = useLanguage();
  const [, setLocation] = useLocation();
  const { orderNumber: pathOrderNumber } = useParams<{ orderNumber?: string }>();
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneTerm, setPhoneTerm] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const qc = useQueryClient();

  const prevStatusRef = useRef<string | null>(null);
  const prevDriverStatusRef = useRef<string | null>(null);
  const [statusChangeBanner, setStatusChangeBanner] = useState<{ prev: string; next: string } | null>(null);

  const statusLabels = getStatusLabels(t);

  useEffect(() => {
    if (pathOrderNumber) {
      const n = pathOrderNumber.toUpperCase().trim();
      setInput(n);
      setSearchTerm(n);
      return;
    }
    const qp = new URLSearchParams(window.location.search);
    const o = qp.get("order");
    if (o) { setInput(o); setSearchTerm(o.toUpperCase().trim()); }
  }, [pathOrderNumber]);

  // Real-time: SSE dengan auto-reconnect via usePortalSSEOrderTracker
  const { connected: sseConnected } = usePortalSSEOrderTracker(
    searchTerm || null,
    () => qc.invalidateQueries({ queryKey: ["tracking", searchTerm] }),
  );

  const isTerminal = !!(lastRefreshed && prevStatusRef.current && isTerminalStatus(prevStatusRef.current));

  const {
    data: tracking, isLoading, isError, error, refetch, isFetching,
  } = useQuery<TrackingData, Error>({
    queryKey: ["tracking", searchTerm, phoneTerm],
    queryFn: () => fetchTracking(searchTerm, phoneTerm),
    enabled: !!searchTerm && !!phoneTerm,
    refetchInterval: isTerminal
      ? false
      : (ACTIVE_INTERVAL * 1000),
    staleTime: 5_000,
    retry: false,
  });

  const needsPhoneVerification = error instanceof PhoneVerificationRequiredError;

  useEffect(() => {
    if (!tracking) return;
    const prev = prevStatusRef.current;

    // Deteksi perubahan order status
    if (prev !== null && prev !== tracking.status) {
      setStatusChangeBanner({ prev, next: tracking.status });
    }
    prevStatusRef.current = tracking.status;

    // Deteksi perubahan driver status
    if (tracking.driverJob) {
      prevDriverStatusRef.current = tracking.driverJob.status;
    }

    setLastRefreshed(new Date());
  }, [tracking]);

  function handleSearch() {
    const trimmed = input.trim().toUpperCase();
    const phoneDigits = phoneInput.replace(/\D/g, "");
    if (!trimmed || phoneDigits.length !== 4) return;
    prevStatusRef.current = null;
    prevDriverStatusRef.current = null;
    setStatusChangeBanner(null);
    setLastRefreshed(null);
    setSearchTerm(trimmed);
    setPhoneTerm(phoneDigits);
  }

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const isOrderTerminal = tracking ? isTerminalStatus(tracking.status) : false;

  return (
    <div className="min-h-screen bg-background">
      <PageSeo path="/track" />
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-foreground">{t("logisticTrackStatus.progress")}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">{t("logisticTrackStatus.progress")}</h1>
          <p className="text-sm text-muted-foreground">{t("logisticTrackStatus.searchPlaceholder")}</p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={t("logisticTrackStatus.searchPlaceholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono uppercase"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t("logisticTrackStatus.phonePlaceholder")}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              inputMode="numeric"
              maxLength={4}
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={isLoading || !input.trim() || phoneInput.replace(/\D/g, "").length !== 4}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">{isLoading ? t("common.loading") : t("logisticTrackStatus.trackBtn")}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {t("logisticTrackStatus.verifPhoneDesc")}
          </p>
        </div>

        {isError && (
          <div className="text-center py-10 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <p className="font-medium text-foreground">
              {needsPhoneVerification ? t("logisticTrackStatus.verifError") : t("logisticTrackStatus.notFound")}
            </p>
            <p className="text-sm mt-1">
              {needsPhoneVerification
                ? t("logisticTrackStatus.verifPhoneDesc")
                : (error?.message ?? t("logisticTrackStatus.notFoundDesc"))}
            </p>
          </div>
        )}

        {tracking && (
          <div className="space-y-4">

            {/* Status change banner */}
            {statusChangeBanner && (
              <StatusChangeBanner
                prevStatus={statusChangeBanner.prev}
                newStatus={statusChangeBanner.next}
                onDismiss={() => setStatusChangeBanner(null)}
                statusLabels={statusLabels}
              />
            )}

            {/* Auto-refresh bar */}
            <AutoRefreshBar
              isTerminal={isOrderTerminal}
              isFetching={isFetching}
              lastRefreshed={lastRefreshed}
              onRefresh={handleRefresh}
              sseConnected={sseConnected}
            />

            {/* Push notification toggle */}
            <PushToggle orderNumber={searchTerm || null} />

            {/* Penawaran harga */}
            {tracking.rfqQuote && ["customer_quoted", "customer_approved", "customer_rejected", "customer_revision_requested"].includes(tracking.rfqQuote.rfqStatus) && (
              <QuoteCard
                rfqQuote={tracking.rfqQuote}
                orderNumber={tracking.orderNumber}
                onRespond={() => {
                  setTimeout(() => refetch(), UI_TIMING.TRACK_REFRESH_DELAY_MS);
                }}
              />
            )}

            {/* Header — order number & status */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t("logisticTrackStatus.orderNo")}</p>
                  <p className="text-xl font-bold font-mono text-foreground">{tracking.orderNumber}</p>
                </div>
                <Badge className={cn("border font-medium", STATUS_COLORS[tracking.status] ?? "bg-gray-100 text-gray-800")}>
                  {statusLabels[tracking.status] ?? tracking.status}
                </Badge>
              </div>
              <Separator className="mb-4" />

              {/* Route */}
              <div className="flex items-center gap-2 mb-4 bg-muted/40 rounded-lg px-4 py-3">
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">{t("logisticTrackStatus.deliveryRoute")}</p>
                  <p className="font-semibold text-sm text-foreground leading-tight">{tracking.origin}</p>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{tracking.shipmentType}</span>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">{t("logisticTrackStatus.deliveryRoute")}</p>
                  <p className="font-semibold text-sm text-foreground leading-tight">{tracking.destination}</p>
                </div>
              </div>

              {/* Order stepper */}
              <OrderStepper status={tracking.status} />

              <Separator className="mt-5 mb-4" />
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">{t("logisticTrackStatus.customer")}</span>
                <span className="font-medium text-foreground text-right">{tracking.customerName}</span>
                <span className="text-muted-foreground">{t("logisticTrackStatus.orderDate")}</span>
                <span className="font-medium text-foreground text-right">{formatDate(tracking.createdAt)}</span>
                {tracking.subtotal != null && (
                  <>
                    <span className="text-muted-foreground">Subtotal Est.</span>
                    <span className="font-medium text-foreground text-right">{idr(tracking.subtotal)}</span>
                  </>
                )}
                {tracking.tax != null && tracking.tax > 0 && (
                  <>
                    <span className="text-muted-foreground">PPN</span>
                    <span className="font-medium text-foreground text-right">{idr(tracking.tax)}</span>
                  </>
                )}
                {tracking.grandTotal != null && (
                  <>
                    <span className="text-muted-foreground font-semibold">{t("logisticTrackStatus.totalAmount")}</span>
                    <span className="font-bold text-foreground text-right">{idr(tracking.grandTotal)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Driver job tracking */}
            {tracking.driverJob ? (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    {t("logisticTrackStatus.driverStatus")}
                  </h3>
                  <Badge variant="outline" className="text-xs font-mono">
                    {tracking.driverJob.jobNumber}
                  </Badge>
                </div>

                {/* Driver info */}
                <div className="bg-muted/40 rounded-lg px-4 py-3 mb-4 grid grid-cols-2 gap-y-2 text-sm">
                  {tracking.driverJob.vehicleType && (
                    <>
                      <span className="text-muted-foreground">{t("logisticTrackStatus.driverInfo")}</span>
                      <span className="font-medium text-right">{tracking.driverJob.vehicleType}</span>
                    </>
                  )}
                  {tracking.driverJob.pickupDateTime && (
                    <>
                      <span className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />Est. Pickup</span>
                      <span className="font-medium text-right text-xs leading-snug">{formatDateTime(tracking.driverJob.pickupDateTime, locale)}</span>
                    </>
                  )}
                  {tracking.driverJob.deliveryDateTime && (
                    <>
                      <span className="text-muted-foreground">Est. Tiba</span>
                      <span className="font-medium text-right text-xs leading-snug">{formatDateTime(tracking.driverJob.deliveryDateTime, locale)}</span>
                    </>
                  )}
                </div>

                {/* Driver status timeline */}
                <DriverStepper job={tracking.driverJob} />
              </div>
            ) : (
              tracking.status !== "Completed" && (
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <p>{t("logisticTrackStatus.driverAssigned")}</p>
                </div>
              )
            )}

            {/* GPS History Timeline */}
            <DriverGpsTimeline events={tracking.progressEvents ?? []} />

            {/* ── Galeri Bukti Pengiriman ── */}
            <DeliveryProofGallery
              events={tracking.progressEvents ?? []}
              driverPhotos={tracking.driverJob?.photos}
              jobNumber={tracking.driverJob?.jobNumber}
              orderStatusRank={ORDER_STATUS_RANK[tracking.status] ?? 0}
            />

            {/* ── Driver GPS POD — dari driver app ── */}
            {tracking.driverJob?.podSubmittedAt && (
              <div className="bg-card border border-teal-200 rounded-xl p-5">
                <h3 className="font-semibold text-teal-800 text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t("logisticTrackStatus.podTitle")}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {tracking.driverJob.driverNameOverride && (
                      <>
                        <span className="text-muted-foreground">{t("logisticTrackStatus.driverInfo")}</span>
                        <span className="font-semibold text-foreground text-right">{tracking.driverJob.driverNameOverride}</span>
                      </>
                    )}
                    {tracking.driverJob.truckPlate && (
                      <>
                        <span className="text-muted-foreground">Plat Nomor</span>
                        <span className="font-semibold font-mono text-foreground text-right">{tracking.driverJob.truckPlate}</span>
                      </>
                    )}
                    {tracking.driverJob.podReceiverName && (
                      <>
                        <span className="text-muted-foreground">{t("logisticTrackStatus.podReceiver")}</span>
                        <span className="font-semibold text-foreground text-right">{tracking.driverJob.podReceiverName}</span>
                      </>
                    )}
                    {tracking.driverJob.podDeviceTimestamp && (
                      <>
                        <span className="text-muted-foreground">Waktu perangkat</span>
                        <span className="font-medium text-right">
                          {new Date(tracking.driverJob.podDeviceTimestamp).toLocaleString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    )}
                    {tracking.driverJob.podGeoLat && tracking.driverJob.podGeoLng && (
                      <>
                        <span className="text-muted-foreground">Koordinat GPS</span>
                        <span className="font-mono text-xs text-right">
                          {Number(tracking.driverJob.podGeoLat).toFixed(6)}, {Number(tracking.driverJob.podGeoLng).toFixed(6)}
                        </span>
                      </>
                    )}
                    <>
                      <span className="text-muted-foreground">{t("logisticTrackStatus.podSubmittedAt")}</span>
                      <span className="font-medium text-right">
                        {new Date(tracking.driverJob.podSubmittedAt).toLocaleString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </>
                  </div>
                  {(tracking.driverJob.podMapUrl || tracking.driverJob.podStreetViewUrl) && (
                    <div className="flex gap-2 pt-1">
                      {tracking.driverJob.podMapUrl && (
                        <a href={tracking.driverJob.podMapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                            {t("logisticTrackStatus.podMap")}
                          </button>
                        </a>
                      )}
                      {tracking.driverJob.podStreetViewUrl && (
                        <a href={tracking.driverJob.podStreetViewUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                            <Navigation className="w-3.5 h-3.5" />
                            {t("logisticTrackStatus.podStreetView")}
                          </button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Bukti Pengiriman (POD) — tampil jika ada submission ── */}
            {(tracking.podSubmissions ?? []).length > 0 && (
              <div className="bg-card border border-teal-200 rounded-xl p-5">
                <h3 className="font-semibold text-teal-800 text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t("logisticTrackStatus.podTitle")}
                </h3>
                {(tracking.podSubmissions ?? []).map((pod) => (
                  <div key={pod.id} className="space-y-3">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      {pod.receiverName && (
                        <>
                          <span className="text-muted-foreground">{t("logisticTrackStatus.podReceiver")}</span>
                          <span className="font-semibold text-foreground text-right">{pod.receiverName}</span>
                        </>
                      )}
                      {pod.submittedBy && (
                        <>
                          <span className="text-muted-foreground">Diverifikasi</span>
                          <span className="font-medium text-right">{pod.submittedBy}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">{t("logisticTrackStatus.podSubmittedAt")}</span>
                      <span className="font-medium text-right">{formatDateTime(pod.createdAt, locale)}</span>
                    </div>
                    {pod.note && (
                      <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        {pod.note}
                      </p>
                    )}
                    {pod.photoUrl && (
                      <a href={resolveImageUrl(pod.photoUrl) ?? pod.photoUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={resolveImageUrl(pod.photoUrl) ?? pod.photoUrl}
                          alt={t("logisticTrackStatus.podTitle")}
                          className="w-full max-h-64 object-contain rounded-lg border border-teal-100 hover:opacity-90 transition-opacity cursor-zoom-in"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-1">Klik untuk perbesar foto</p>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Paylabs Payment — tampil jika grandTotal > 0 & belum lunas ── */}
            {(tracking.grandTotal ?? 0) > 0 &&
              !["Payment Received", "Completed", "Cancelled"].includes(tracking.status) && (
              <PaylabsPaymentSection orderNumber={tracking.orderNumber} />
            )}

            {/* ── Invoice — tampil jika ada invoice link atau status sudah Invoice Issued+ ── */}
            {(["Invoice Issued", "Payment Received", "Completed"].includes(tracking.status) || (tracking.invoiceLinks ?? []).length > 0) && (
              <div className="bg-card border border-orange-200 rounded-xl p-5">
                <h3 className="font-semibold text-orange-800 text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t("logisticTrackStatus.invoiceLinks")}
                </h3>
                {(tracking.invoiceLinks ?? []).length > 0 ? (
                  <div className="space-y-3">
                    {(tracking.invoiceLinks ?? []).map((inv) => (
                      <div key={inv.token} className="rounded-lg border border-orange-100 bg-orange-50/40 px-3 py-3 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {inv.invoiceNumber && (
                            <span className="text-xs font-mono font-semibold text-orange-800">{inv.invoiceNumber}</span>
                          )}
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            inv.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {inv.paymentStatus === "paid" ? "✅ Lunas" : "⏳ Belum Bayar"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          {inv.grandTotal != null && (
                            <>
                              <span className="text-muted-foreground">{t("logisticTrackStatus.totalAmount")}</span>
                              <span className="font-semibold text-right">{idr(inv.grandTotal)}</span>
                            </>
                          )}
                          {inv.dueDate && (
                            <>
                              <span className="text-muted-foreground">{t("logisticTrackStatus.dueDate")}</span>
                              <span className="font-medium text-right">{formatDateTime(inv.dueDate, locale)}</span>
                            </>
                          )}
                          {inv.confirmedAt && (
                            <>
                              <span className="text-muted-foreground">{t("logisticTrackStatus.paymentStatus")}</span>
                              <span className="font-medium text-right text-green-700">{formatDateTime(inv.confirmedAt, locale)}</span>
                            </>
                          )}
                        </div>
                        <a
                          href={`/customer-invoice/${inv.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {t("logisticTrackStatus.downloadInvoice")}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-orange-50/40 rounded-lg px-3 py-3">
                    <p>{t("logisticTrackStatus.invoiceLinks")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Services */}
            {tracking.items.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Layanan ({tracking.items.length})
                </h3>
                <div className="space-y-2">
                  {tracking.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
                      <div>
                        <Badge variant="outline" className="text-xs mr-1">{item.category}</Badge>
                        <span className="text-sm text-foreground">{item.serviceName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Riwayat Update */}
            {tracking.orderUpdates && tracking.orderUpdates.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t("logisticTrackStatus.updateHistory")}
                </h3>
                <div className="space-y-0">
                  {[...tracking.orderUpdates].reverse().map((update, i) => (
                    <div key={update.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5",
                          i === tracking.orderUpdates.length - 1
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-green-500 border-green-500 text-white"
                        )}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        {i < tracking.orderUpdates.length - 1 && (
                          <div className="w-0.5 flex-1 my-1 bg-border" />
                        )}
                      </div>
                      <div className={cn("pb-4", i === tracking.orderUpdates.length - 1 && "pb-0")}>
                        {update.status && (
                          <p className="text-sm font-medium text-foreground">
                            {statusLabels[update.status] ?? update.status}
                          </p>
                        )}
                        {update.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{update.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(update.createdAt, locale)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => setLocation("/jasa")}>
              <Ship className="w-4 h-4 mr-2" /> {t("logisticTrackStatus.backToHome")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
