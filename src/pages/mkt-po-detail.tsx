import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  ArrowLeft,
  Building2,
  User,
  Package,
  Truck,
  ClipboardCheck,
  Clock,
  FileText,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle,
  UploadCloud,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PoDetail {
  id: number;
  poNumber: string;
  rfqId: number;
  quoteId: number | null;
  status: string;
  grandTotal: string | number | null;
  taxAmount: string | number | null;
  totalAmount: string | number | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  updatedAt: string;
  vendorNameSnapshot: string | null;
  vendorAddressSnapshot: string | null;
  paymentTermsSnapshot: string | null;
  paymentTermCode: string | null;
  paymentDpPercent: number | null;
  paymentStatus: string;
  paymentDueAt: string | null;
  paymentProofUploadedAt: string | null;
  paymentVerifiedAt: string | null;
  paymentRejectionReason: string | null;
  incotermSnapshot: string | null;
  quotationNumberSnapshot: string | null;
  quotationDateSnapshot: string | null;
  currencySnapshot: string | null;
  leadTimeDaysSnapshot: number | null;
  rfqNumber: string;
  rfqStatus: string;
  buyerName: string | null;
  buyerEmail: string | null;
  rfqNotes: string | null;
  vendorName: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  isInternalVendor: boolean;
}

interface Shipment {
  id: number;
  poId: number;
  shipmentNumber: string;
  shipmentStatus: string;
  shipmentType: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  origin: string | null;
  destination: string | null;
  plannedDeparture: string | null;
  actualDeparture: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentItem {
  id: number;
  shipmentId: number;
  poLineId: number;
  lineNumber: number;
  qty: string | number;
  uom: string | null;
  itemName: string;
}

interface ShipmentDetail extends Shipment {
  items: ShipmentItem[];
}

interface TimelineEvent {
  id: number;
  shipmentId: number;
  eventSequence: number;
  eventType: string;
  note: string | null;
  location: string | null;
  actorType: string | null;
  actorId: string | null;
  createdAt: string;
}

interface PodView {
  available: boolean;
  url: string;
  uploadedAt: string;
  note: string | null;
}

interface GoodsReceiptItem {
  id: number;
  shipmentItemId: number;
  lineNumber: number;
  poLineId: number;
  receivedQty: string | number;
  acceptedQty: string | number;
  rejectedQty: string | number;
  condition: string | null;
  notes: string | null;
}

interface GoodsReceipt {
  id: number;
  shipmentId: number;
  receiptNumber: string;
  receiptType: string;
  inspectionStatus: string;
  receivedBy: string | null;
  receivedAt: string | null;
  notes: string | null;
  createdAt: string;
  items: GoodsReceiptItem[];
}

interface PaymentView {
  poId: number;
  paymentTermCode: string | null;
  paymentDpPercent: number | null;
  paymentTerms: string | null;
  paymentStatus: "unpaid" | "proof_submitted" | "partially_paid" | "paid" | "rejected";
  paymentDueAt: string | null;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  overpaidAmount: number;
  manualPaidAmount: number;
  paylabsPaidAmount: number;
  pendingManualAmount: number;
  pendingPaylabsAmount: number;
  requiredBeforeHandoverAmount: number;
  requiredBeforeHandoverRemaining: number;
  handoverPaymentSatisfied: boolean;
  currency: string;
  proofAvailable: boolean;
  proofLocked: boolean;
  canUploadNewProof: boolean;
  proofAttemptCount: number;
  proofId: number | null;
  proofExpectedAmount: number | null;
  proofReviewStatus: "submitted" | "approved" | "rejected" | null;
  proofUrl: string | null;
  proofFileName: string | null;
  proofMimeType: string | null;
  proofUploadedAt: string | null;
  ocrAmount: number | null;
  ocrConfidence: number | null;
  ocrMatches: boolean | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
  requiresClearanceBeforeHandover: boolean;
  termsMissing: boolean;
  manualTransferAllowed: boolean;
  paylabs: {
    configured: boolean;
    sandboxMode: boolean;
    activeMethods: Array<{
      code: string;
      label: string;
      description: string;
      iconUrl: string;
      iconEnabled: boolean;
      sortOrder: number;
    }>;
    latestPayment: {
      id: number;
      status: string;
      amount: number;
      paymentMethod: string | null;
      providerOrderId: string | null;
      merchantTradeNo: string | null;
      paymentUrl: string | null;
      expiredAt: string | null;
      paidAt: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    hasPendingPayment: boolean;
    canCreate: boolean;
  };
}
interface ActivityEvent {
  id: number;
  action: string;
  statusFrom: string | null;
  statusTo: string | null;
  message: string | null;
  actorRole: string | null;
  actorName: string | null;
  createdAt: string;
}

type Tab = "overview" | "items" | "shipment" | "payment" | "goods-receipt" | "timeline" | "activity";

// ── Status config ─────────────────────────────────────────────────────────────

const PO_STATUS: Record<string, { label: string; color: string }> = {
  pending:              { label: "Pending",              color: "bg-slate-100 text-slate-600" },
  draft:                { label: "Draft",                color: "bg-slate-100 text-slate-700" },
  issued:               { label: "Diterbitkan",          color: "bg-blue-100 text-blue-700" },
  vendor_accepted:      { label: "Diterima Vendor",      color: "bg-teal-100 text-teal-700" },
  vendor_rejected:      { label: "Ditolak Vendor",       color: "bg-rose-100 text-rose-700" },
  revision_requested:   { label: "Revisi Diminta",       color: "bg-orange-100 text-orange-700" },
  production:           { label: "Produksi",             color: "bg-amber-100 text-amber-700" },
  ready_to_ship:        { label: "Siap Kirim",           color: "bg-cyan-100 text-cyan-700" },
  in_transit:           { label: "Dalam Pengiriman",     color: "bg-indigo-100 text-indigo-700" },
  delivered:            { label: "Terkirim",             color: "bg-emerald-100 text-emerald-700" },
  partially_delivered:  { label: "Terkirim Sebagian",    color: "bg-lime-100 text-lime-700" },
  completed:            { label: "Selesai",              color: "bg-green-100 text-green-700" },
  closed:               { label: "Ditutup",              color: "bg-gray-100 text-gray-600" },
  cancelled:            { label: "Dibatalkan",           color: "bg-red-100 text-red-700" },
  rejected_goods:       { label: "Barang Ditolak",       color: "bg-red-100 text-red-800" },
};

const SHIPMENT_STATUS: Record<string, { label: string; color: string }> = {
  planned:       { label: "Direncanakan",   color: "bg-slate-100 text-slate-700" },
  packing:       { label: "Packing",        color: "bg-amber-100 text-amber-700" },
  loading:       { label: "Loading",        color: "bg-cyan-100 text-cyan-700" },
  ready_to_ship: { label: "Siap Kirim",     color: "bg-blue-100 text-blue-700" },
  in_transit:    { label: "Dalam Perjalanan", color: "bg-indigo-100 text-indigo-700" },
  customs:       { label: "Bea Cukai",      color: "bg-purple-100 text-purple-700" },
  warehouse:     { label: "Di Gudang",      color: "bg-orange-100 text-orange-700" },
  arrived:       { label: "Tiba",           color: "bg-teal-100 text-teal-700" },
  delivered:           { label: "Terkirim",          color: "bg-green-100 text-green-700" },
  partially_delivered: { label: "Diterima Sebagian", color: "bg-amber-100 text-amber-700" },
  rejected_goods:      { label: "Barang Ditolak",    color: "bg-red-100 text-red-800" },
  cancelled:           { label: "Dibatalkan",        color: "bg-red-100 text-red-700" },
};

const SHIPMENT_OPTIONS = [
  { value: "pickup_self", label: "Ambil sendiri", description: "Ambil produk langsung dari lokasi vendor." },
  { value: "trucking", label: "Trucking", description: "Pengiriman darat antarkota." },
  { value: "air_freight", label: "Kargo udara", description: "Pengiriman cepat melalui udara." },
  { value: "sea_freight", label: "Kargo laut", description: "FCL/LCL untuk pengiriman laut." },
  { value: "door_to_door", label: "Door to door", description: "Pengiriman langsung ke alamat tujuan." },
] as const;

const RECEIPT_TYPE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  full:     { label: "Diterima Penuh",    color: "bg-green-100 text-green-700",  icon: <CheckCircle2 className="w-4 h-4" /> },
  partial:  { label: "Diterima Sebagian", color: "bg-amber-100 text-amber-700",  icon: <AlertCircle className="w-4 h-4" /> },
  rejected: { label: "Ditolak",          color: "bg-red-100 text-red-700",      icon: <XCircle className="w-4 h-4" /> },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(s: string | null, locale: string): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(s: string | null, locale: string): string {
  if (!s) return "—";
  return new Date(s).toLocaleString(locale, {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(amount: string | number | null, currency: string | null, locale: string): string {
  if (amount == null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return `${currency ?? "IDR"} ${new Intl.NumberFormat(locale).format(num)}`;
}

function poStatusLabel(t: (key: string, fallback?: string) => string, status: string, fallback: string) {
  const keys: Record<string, string> = {
    draft: "mktPurchaseOrders.statusDraft",
    issued: "mktPurchaseOrders.statusIssued",
    vendor_accepted: "mktPurchaseOrders.statusVendorAccepted",
    vendor_rejected: "mktPurchaseOrders.statusVendorRejected",
    revision_requested: "mktPurchaseOrders.statusRevisionRequested",
    production: "mktPurchaseOrders.statusProduction",
    ready_to_ship: "mktPurchaseOrders.statusReadyToShip",
    in_transit: "mktPurchaseOrders.statusInTransit",
    delivered: "mktPurchaseOrders.statusDelivered",
    completed: "mktPurchaseOrders.statusCompleted",
    cancelled: "mktPurchaseOrders.statusCancelled",
    closed: "mktPurchaseOrders.statusClosed",
    partially_delivered: "mktPurchaseOrders.statusPartiallyDelivered",
    rejected_goods: "mktPurchaseOrders.statusRejectedGoods",
  };
  return keys[status] ? t(keys[status], fallback) : fallback;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-sm text-gray-500 sm:w-44 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",      label: "Overview",      icon: <FileText className="w-4 h-4" /> },
  { id: "items",         label: "Items",         icon: <Package className="w-4 h-4" /> },
  { id: "shipment",      label: "Shipment",      icon: <Truck className="w-4 h-4" /> },
  { id: "payment",       label: "Pembayaran",    icon: <FileText className="w-4 h-4" /> },
  { id: "goods-receipt", label: "Goods Receipt", icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: "timeline",      label: "Timeline",      icon: <Clock className="w-4 h-4" /> },
  { id: "activity",      label: "Activity Log",  icon: <FileText className="w-4 h-4" /> },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function OverviewTab({ po }: { po: PoDetail }) {
  const { locale, t } = useLanguage();
  const st = PO_STATUS[po.status] ?? { label: po.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-5">
      {/* Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("mktVendorPo.status", "PO status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 py-1 ${st.color}`} variant="secondary">
              {poStatusLabel(t, po.status, st.label)}
            </Badge>
            {po.cancelledAt && (
              <span className="text-xs text-red-600">
                {t("mktPurchaseOrders.statusCancelled", "Cancelled")}: {fmtDate(po.cancelledAt, locale)}
              </span>
            )}
          </div>
          {po.cancelReason && (
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
              <span className="font-medium">{t("mktMyRfqs.rejectionReason", "Reason")}: </span>{po.cancelReason}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider identity: external vendor details are never exposed to customers. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" /> {po.isInternalVendor ? t("mktVendorPo.vendor", "Internal vendor") : t("mktVendorPo.vendor", "Provider")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label={po.isInternalVendor ? t("mktVendorPo.vendor", "Vendor") : t("tracking.vendor", "Managed by")} value={po.vendorName ?? po.vendorNameSnapshot} />
          {po.isInternalVendor && po.vendorAddressSnapshot && (
            <InfoRow label={t("mktVendorPo.vendorAddress", "Address")} value={po.vendorAddressSnapshot} />
          )}
          {po.isInternalVendor && po.vendorPhone && <InfoRow label={t("dashboard.phone", "Phone")} value={po.vendorPhone} />}
          {po.isInternalVendor && po.vendorEmail && <InfoRow label="Email" value={po.vendorEmail} />}
          {!po.isInternalVendor && (
            <p className="text-xs text-slate-500 pt-1">
              {t("tracking.contactUs", "All communication, payments, and transaction services are managed through PT Cahaya Sejati Teknologi (CST).")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Buyer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> {t("mktVendorQuote.buyer", "Buyer")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label={t("register.fullName", "Name")} value={po.buyerName} />
          <InfoRow label="Email" value={po.buyerEmail} />
          <InfoRow label="RFQ Number" value={po.rfqNumber} />
        </CardContent>
      </Card>

      {/* PO Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("mktVendorPo.poInfoTitle", "PO information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label={t("mktVendorPo.poNumber", "PO number")} value={<span className="font-mono">{po.poNumber}</span>} />
          {po.quotationNumberSnapshot && <InfoRow label={t("mktVendorPo.quotationNumber", "Quotation no.")} value={po.quotationNumberSnapshot} />}
          {po.quotationDateSnapshot && <InfoRow label={t("mktVendorPo.quotationDate", "Quotation date")} value={fmtDate(po.quotationDateSnapshot, locale)} />}
          <InfoRow label="Incoterm" value={po.incotermSnapshot} />
          <InfoRow label={t("mktVendorPo.paymentTerms", "Payment terms")} value={po.paymentTermsSnapshot} />
          <InfoRow label={t("mktVendorPo.currency", "Currency")} value={po.currencySnapshot} />
          <InfoRow label={t("mktVendorPo.leadTime", "Lead time")} value={po.leadTimeDaysSnapshot ? `${po.leadTimeDaysSnapshot} hari` : "—"} />
          <InfoRow label={t("tracking.total", "Total")} value={fmtAmount(po.totalAmount, po.currencySnapshot, locale)} />
          {po.taxAmount !== null && <InfoRow label={t("mktVendorPo.tax", "Tax")} value={fmtAmount(po.taxAmount, po.currencySnapshot, locale)} />}
          <InfoRow label={t("mktVendorPo.grandTotal", "Grand total")} value={
            <span className="text-orange-600 font-semibold">
              {fmtAmount(po.grandTotal, po.currencySnapshot, locale)}
            </span>
          } />
          <InfoRow label={t("mktPurchaseOrders.colCreatedAt", "Created")} value={fmtDateTime(po.createdAt, locale)} />
          <InfoRow label={t("common.confirm", "Confirmed")} value={fmtDateTime(po.confirmedAt, locale)} />
        </CardContent>
      </Card>

      {/* Revision Notes */}
      {po.rfqNotes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("mktVendorQuote.buyerNotes", "RFQ notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{po.rfqNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PoLine {
  id:          number;
  lineNumber:  number;
  itemName:    string;
  description: string | null;
  qty:         string;
  unit:        string | null;
  unitPrice:   string;
  subtotal:    string;
  notes:       string | null;
  createdAt:   string;
}

function ItemsTab({ po }: { po: PoDetail }) {
  const { locale, t } = useLanguage();
  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; count: number; data: PoLine[] }>({
    queryKey: ["mkt-po-items", po.id],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${po.id}/items`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const lines = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            Item PO (Snapshot Immutable)
            {!isLoading && (
              <span className="ml-auto text-xs font-normal text-gray-400">{lines.length} item</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-5 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {isError && (
            <div className="p-5 text-center space-y-2">
              <p className="text-sm text-red-500">{t("common.error", "Failed to load PO items.")}</p>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> {t("common.retry", "Try again")}
              </Button>
            </div>
          )}
          {!isLoading && !isError && lines.length === 0 && (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t("mktVendorPo.noItems", "No items in this PO.")}</p>
            </div>
          )}
          {!isLoading && !isError && lines.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="px-4 py-2.5 text-left font-medium w-12">#</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t("vendorMiniForm.itemDetail", "Item")}</th>
                    <th className="px-4 py-2.5 text-right font-medium">{t("mktVendorPo.qty", "Qty")}</th>
                    <th className="px-4 py-2.5 text-left font-medium">{t("customerApproval.unitCol", "Unit")}</th>
                    <th className="px-4 py-2.5 text-right font-medium">{t("mktVendorPo.unitPrice", "Unit price")}</th>
                    <th className="px-4 py-2.5 text-right font-medium">{t("mktVendorPo.subtotal", "Subtotal")}</th>
                    <th className="px-4 py-2.5 text-left font-medium hidden lg:table-cell">{t("mktVendorQuote.notes", "Notes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b last:border-b-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">{line.lineNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{line.itemName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{parseFloat(line.qty).toLocaleString(locale)}</td>
                      <td className="px-4 py-3 text-gray-500">{line.unit ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtAmount(line.unitPrice, po.currencySnapshot, locale)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{fmtAmount(line.subtotal, po.currencySnapshot, locale)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{line.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50/60">
                    <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Grand Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-orange-600">
                      {fmtAmount(po.grandTotal, po.currencySnapshot, locale)}
                    </td>
                    <td className="hidden lg:table-cell" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ShipmentTab({
  poId,
  poStatus,
  selectedId,
  onSelect,
}: {
  poId: number;
  poStatus: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const { locale, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("trucking");
  const [shipmentRequestKey] = useState(() => crypto.randomUUID());
  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: Shipment[] }>({
    queryKey: ["mkt-po-shipments", poId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${poId}/shipments`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat shipments");
      return res.json();
    },
  });

  const selectShipment = useMutation({
    mutationFn: async (shipmentType: string) => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${poId}/shipment-selection`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `customer-po-shipment:${poId}:${shipmentRequestKey}`,
        },
        body: JSON.stringify({ shipmentType }),
      });
      const body = await res.json() as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) throw new Error(body.message ?? body.error ?? "Gagal menyimpan pilihan pengiriman");
      return body;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-shipments", poId] });
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-detail", poId] });
    },
  });

  const shipments = data?.data ?? [];

  useEffect(() => {
    if (!selectedId && shipments[0]?.id) onSelect(shipments[0].id);
  }, [onSelect, selectedId, shipments]);

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">{t("common.error", "Failed to load shipment.")}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> {t("common.retry", "Try again")}
        </Button>
      </CardContent>
    </Card>
  );

  if (shipments.length === 0 && poStatus !== "vendor_accepted") return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-5">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">{t("mktPurchaseOrders.statusIssued", "Waiting for vendor to accept the Purchase Order")}</p>
            <p className="mt-1 text-sm text-amber-800">
              {t("mktVendorPo.acceptedNotice", "Shipping options will become available after the vendor accepts the PO.")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (shipments.length === 0) return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-500" />
          {t("productOrder.serviceCatalog.title", "Choose shipping method")}
        </CardTitle>
        <p className="text-sm text-gray-500">
          {t("mktVendorPo.shipmentInfoDesc", "The vendor accepted the PO. Choose one shipping method for this order.")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {SHIPMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedType(option.value)}
              className={[
                "rounded-lg border p-3 text-left transition-colors",
                selectedType === option.value
                  ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold text-gray-800">{option.label}</span>
              <span className="mt-1 block text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
        {selectShipment.isError && (
          <p className="text-sm text-red-600">{(selectShipment.error as Error).message}</p>
        )}
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          disabled={selectShipment.isPending}
          onClick={() => selectShipment.mutate(selectedType)}
        >
          {selectShipment.isPending ? "Menyimpan…" : "Simpan pilihan pengiriman"}
        </Button>
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-3">
      {poStatus === "issued" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-800">
            <p className="font-semibold">{t("mktPurchaseOrders.statusIssued", "Waiting for vendor to accept the Purchase Order")}</p>
            <p className="mt-1 text-xs">
              {t("mktVendorPo.acceptedNotice", "Your shipping selection is saved. The vendor must accept the PO before processing the shipment.")}
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-sm text-blue-800">
          <p className="font-semibold">{t("logisticTrack.status", "Order & shipment status")}</p>
          <p className="mt-1 text-xs">
            Customer cukup memantau di sini. Vendor yang memperbarui persiapan/pengiriman dan mengunggah POD.
            Setelah barang diserahkan/tiba dan POD tersedia, konfirmasi penerimaan dilakukan di tab Goods Receipt.
          </p>
        </CardContent>
      </Card>
      {shipments.map((s) => {
        const active = selectedId === s.id;
        const isPickup = s.shipmentType === "pickup_self";
        const baseStatus = SHIPMENT_STATUS[s.shipmentStatus] ?? { label: s.shipmentStatus, color: "bg-gray-100 text-gray-700" };
        const st = isPickup && s.shipmentStatus === "ready_to_ship"
          ? { ...baseStatus, label: "Siap Diambil" }
          : isPickup && s.shipmentStatus === "arrived"
            ? { ...baseStatus, label: "Sudah Diserahkan" }
            : baseStatus;
        const shipmentTypeLabel = SHIPMENT_OPTIONS.find((option) => option.value === s.shipmentType)?.label ?? s.shipmentType;
        return (
          <Card
            key={s.id}
            className={`cursor-pointer transition-all ${active ? "ring-2 ring-orange-400 shadow-sm" : "hover:shadow-sm"}`}
            onClick={() => onSelect(s.id)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-sm font-semibold text-gray-800">{s.shipmentNumber}</span>
                  {s.carrierName && !isPickup && (
                    <span className="text-xs text-gray-500 ml-2">via {s.carrierName}</span>
                  )}
                  {shipmentTypeLabel && (
                    <span className="text-xs text-gray-400 ml-1">({shipmentTypeLabel})</span>
                  )}
                </div>
                <Badge className={`text-xs ${st.color}`} variant="secondary">{poStatusLabel(t, po.status, st.label)}</Badge>
              </div>

              {s.trackingNumber && !isPickup && (
                <p className="text-xs text-gray-600">
                  {t("airFreightTrack.awbNumber", "Tracking")}: <span className="font-mono">{s.trackingNumber}</span>
                </p>
              )}

              {isPickup ? (
                <div className="text-xs text-gray-500">
                  {s.origin || (s.shipmentStatus !== "planned" ? s.destination : null) ? (
                    <span className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{t("productOrder.trucking.pickupAddress", "Pickup location")}: {s.origin || s.destination}</span>
                    </span>
                  ) : (
                    <span>{t("mktVendorPo.shipmentInfoDesc", "Pickup location will appear when the vendor marks the goods ready.")}</span>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {s.origin && (
                    <span className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Dari: {s.origin}</span>
                    </span>
                  )}
                  {s.destination && (
                    <span className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Ke: {s.destination}</span>
                    </span>
                  )}
                </div>
              )}

              {s.estimatedArrival && <p className="text-xs text-gray-500">Est. tiba: {fmtDate(s.estimatedArrival, locale)}</p>}
              {s.actualArrival && (
                <p className="text-xs text-emerald-700">
                  {isPickup ? "Barang sudah diserahkan. Menunggu POD dan konfirmasi penerimaan." : "Tiba: " + fmtDate(s.actualArrival, locale)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PaymentTab({ po }: { po: PoDetail }) {
  const { locale, t } = useLanguage();
  const queryClient = useQueryClient();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    extractedAmount: number | null;
    confidence: number;
    matchesExpected: boolean;
    expectedAmount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    timedOut: boolean;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedPaylabsMethod, setSelectedPaylabsMethod] = useState<string>("");

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: PaymentView }>({
    queryKey: ["mkt-po-payment", po.id],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${po.id}/payment`, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat status pembayaran");
      return res.json();
    },
  });

  const payment = data?.data;

  useEffect(() => {
    if (!payment || payment.remainingAmount <= 0) return;
    setPaymentAmountInput((current) => {
      if (current && Number(current) > 0 && Number(current) <= payment.remainingAmount) return current;
      const suggested = payment.requiredBeforeHandoverRemaining > 0
        ? payment.requiredBeforeHandoverRemaining
        : payment.remainingAmount;
      return String(Math.round(suggested));
    });
  }, [payment?.remainingAmount, payment?.requiredBeforeHandoverRemaining]);

  const scanProof = useMutation({
    mutationFn: async ({ file, amount }: { file: File; amount: number }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("paymentAmount", String(amount));
      const res = await fetch(`/api/mkt/portal/purchase-orders/${po.id}/payment/scan`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        throw new Error(result.message ?? result.error ?? "OCR bukti pembayaran gagal");
      }
      return result.data as {
        extractedAmount: number | null;
        confidence: number;
        matchesExpected: boolean;
        expectedAmount: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
        timedOut: boolean;
      };
    },
    onSuccess: (result) => {
      setScanResult(result);
      setScanError(null);
    },
    onError: (error) => {
      setScanResult(null);
      setScanError((error as Error).message);
    },
  });

  const createPaylabsPayment = useMutation({
    mutationFn: async ({ paymentMethod, amount }: { paymentMethod: string; amount: number }) => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${po.id}/payment/paylabs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paymentAmount: amount }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        throw new Error(result.message ?? result.error ?? "Gagal membuat pembayaran Paylabs");
      }
      return result.data as {
        reused: boolean;
        sandboxMode: boolean;
        payment: { paymentUrl: string | null; amount?: number };
      };
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-payment", po.id] });
      if (result.payment?.paymentUrl) {
        window.location.assign(result.payment.paymentUrl);
      }
    },
  });

  const uploadProof = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error("Pilih file bukti pembayaran terlebih dahulu.");
      const amount = Number(paymentAmountInput);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Isi nominal pembayaran yang valid.");
      if (!scanResult?.extractedAmount) {
        throw new Error("Nominal belum terbaca. Pilih bukti pembayaran yang lebih jelas.");
      }
      if (!scanResult.matchesExpected || Math.abs(scanResult.expectedAmount - amount) > 0.005) {
        throw new Error("Nominal pada bukti pembayaran tidak sama dengan nominal pembayaran yang dipilih.");
      }
      const form = new FormData();
      form.append("file", proofFile);
      form.append("paymentAmount", String(amount));
      const res = await fetch(`/api/mkt/portal/purchase-orders/${po.id}/payment`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.message ?? result.error ?? "Upload bukti pembayaran gagal");
      return result;
    },
    onSuccess: async () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofFile(null);
      setProofPreview(null);
      setScanResult(null);
      setScanError(null);
      setPaymentAmountInput("");
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-payment", po.id] });
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-detail", po.id] });
    },
  });

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />;
  if (isError || !payment) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-red-600">{t("common.error", "Failed to load payment status.")}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => void refetch()}>{t("common.retry", "Try again")}</Button>
        </CardContent>
      </Card>
    );
  }

  const paylabsMethods = payment.paylabs?.activeMethods ?? [];
  const activePaylabsMethod = selectedPaylabsMethod || paylabsMethods[0]?.code || "";
  const pendingPaylabs = payment.paylabs?.hasPendingPayment ? payment.paylabs.latestPayment : null;
  const selectedAmount = Number(paymentAmountInput);
  const validSelectedAmount = Number.isFinite(selectedAmount)
    && selectedAmount > 0
    && selectedAmount <= payment.remainingAmount + 0.005;

  const statusLabel: Record<string, string> = {
    unpaid: "Belum Dibayar",
    proof_submitted: "Menunggu Verifikasi",
    partially_paid: "Dibayar Sebagian",
    paid: "Lunas",
    rejected: "Bukti Ditolak",
  };
  const statusClass: Record<string, string> = {
    unpaid: "bg-amber-100 text-amber-700",
    proof_submitted: "bg-blue-100 text-blue-700",
    partially_paid: "bg-cyan-100 text-cyan-700",
    paid: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const selectAmount = (amount: number) => {
    const normalized = Math.max(0, Math.min(amount, payment.remainingAmount));
    setPaymentAmountInput(String(Math.round(normalized)));
    if (proofFile) {
      setScanResult(null);
      setScanError(null);
      scanProof.mutate({ file: proofFile, amount: normalized });
    }
  };

  const onSelectProof = (file: File | null) => {
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofFile(file);
    setScanResult(null);
    setScanError(null);
    if (!file) {
      setProofPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProofPreview(null);
      setScanError("Bukti pembayaran untuk OCR harus berupa JPG atau PNG.");
      return;
    }
    setProofPreview(URL.createObjectURL(file));
    if (!validSelectedAmount) {
      setScanError("Isi nominal pembayaran terlebih dahulu sebelum memilih bukti.");
      return;
    }
    scanProof.mutate({ file, amount: selectedAmount });
  };

  const canSubmit = Boolean(
    proofFile
    && validSelectedAmount
    && scanResult?.extractedAmount
    && scanResult.matchesExpected
    && Math.abs(scanResult.expectedAmount - selectedAmount) <= 0.005
    && !scanProof.isPending
    && payment.canUploadNewProof
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("portalInvoice.title", "Customer payment to CST")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payment.termsMissing ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t("mktVendorPo.paymentTerms", "Payment terms have not been set. CST admin must set them before handover or shipment.")}
            </div>
          ) : (
            <>
              <InfoRow label={t("mktVendorPo.paymentTerms", "Payment terms")} value={payment.paymentTerms} />
              <InfoRow
                label={t("mktVendorPo.status", "Status")}
                value={<Badge className={statusClass[payment.paymentStatus] ?? "bg-gray-100 text-gray-700"} variant="secondary">{statusLabel[payment.paymentStatus] ?? payment.paymentStatus}</Badge>}
              />
              {payment.paymentDueAt && <InfoRow label="Jatuh Tempo Pelunasan" value={fmtDateTime(payment.paymentDueAt, locale)} />}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Tagihan</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{fmtAmount(payment.amount, payment.currency, locale)}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Sudah Dibayar</p>
                  <p className="mt-1 text-base font-bold text-emerald-800">{fmtAmount(payment.paidAmount, payment.currency, locale)}</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                  <p className="text-xs text-orange-700">Sisa Tagihan</p>
                  <p className="mt-1 text-base font-bold text-orange-800">{fmtAmount(payment.remainingAmount, payment.currency, locale)}</p>
                </div>
              </div>

              {payment.overpaidAmount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Terdeteksi kelebihan pembayaran {fmtAmount(payment.overpaidAmount, payment.currency, locale)}. Hubungi admin CST untuk pemeriksaan/refund.
                </div>
              )}

              {payment.paymentTermCode === "dp_after_receipt" && (
                <div className={`rounded-lg border p-3 text-sm ${
                  payment.handoverPaymentSatisfied
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-orange-200 bg-orange-50 text-orange-800"
                }`}>
                  <p className="font-semibold">Ketentuan DP {payment.paymentDpPercent}%</p>
                  <p className="mt-1">
                    Minimum sebelum barang diserahkan/dikirim: {fmtAmount(payment.requiredBeforeHandoverAmount, payment.currency, locale)}.
                    {payment.handoverPaymentSatisfied
                      ? ` DP sudah terpenuhi. Sisa ${fmtAmount(payment.remainingAmount, payment.currency, locale)} dapat dilunasi setelah barang diterima.`
                      : ` Masih kurang ${fmtAmount(payment.requiredBeforeHandoverRemaining, payment.currency, locale)} untuk memenuhi DP.`}
                  </p>
                </div>
              )}

              {payment.paymentTermCode === "prepaid" && !payment.handoverPaymentSatisfied && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                  Pembayaran harus lunas sebelum vendor dapat menyerahkan atau mengirim barang. Kekurangan saat ini {fmtAmount(payment.requiredBeforeHandoverRemaining, payment.currency, locale)}.
                </div>
              )}

              {payment.paymentTermCode?.startsWith("net_") && payment.paymentStatus !== "paid" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Barang dapat diproses sesuai fulfillment. Sisa pembayaran {fmtAmount(payment.remainingAmount, payment.currency, locale)} tetap tercatat sebagai piutang sampai lunas.
                </div>
              )}

              {payment.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Bukti pembayaran ditolak: {payment.rejectionReason}. Bukti lama tetap tersimpan; Anda dapat mengirim bukti baru yang berbeda.
                </div>
              )}

              {payment.paymentStatus !== "paid" && payment.remainingAmount > 0 && !pendingPaylabs && !payment.proofLocked && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div>
<p className="text-sm font-semibold text-slate-900">{t("paymentProof.totalBill", "Payment amount")}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("productOrder.payment.transferTerms.termin.desc", "You can make a partial payment or deposit. The remaining balance is calculated automatically.")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="number"
                      min="1"
                      max={payment.remainingAmount}
                      step="1"
                      value={paymentAmountInput}
                      onChange={(e) => {
                        setPaymentAmountInput(e.target.value);
                        setScanResult(null);
                        setScanError(null);
                      }}
                      className="h-10 flex-1 rounded-md border px-3 text-sm"
                      placeholder={t("paymentProof.totalBill", "Enter payment amount")}
                    />
                    <Button variant="outline" size="sm" className="h-10" onClick={() => selectAmount(payment.remainingAmount)}>
                      {t("productOrder.payment.transferTerms.full.label", "Pay full remaining balance")}
                    </Button>
                    {payment.requiredBeforeHandoverRemaining > 0 && payment.requiredBeforeHandoverRemaining < payment.remainingAmount && (
                      <Button variant="outline" size="sm" className="h-10" onClick={() => selectAmount(payment.requiredBeforeHandoverRemaining)}>
                        {t("productOrder.payment.transferTerms.dp.label", "Pay minimum deposit")}
                      </Button>
                    )}
                  </div>
                  {!validSelectedAmount && paymentAmountInput && (
                    <p className="text-xs text-red-600">{t("common.error", "Amount must be greater than zero and cannot exceed the outstanding balance.")}</p>
                  )}
                </div>
              )}

              {payment.paymentStatus !== "paid" && payment.paylabs?.configured && paylabsMethods.length > 0 && (
                <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t("paymentProof.payViaGateway", "Pay via Paylabs")}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {t("paymentProof.securedByPaylabs", "Supports deposits, installments, and full payment. Paylabs verifies payment automatically.")}
                      </p>
                    </div>
                    {payment.paylabs.sandboxMode && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">Sandbox</Badge>
                    )}
                  </div>

                  {pendingPaylabs?.paymentUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-white p-3 text-sm">
                        <p className="font-medium">{t("paymentProof.linkPending", "Paylabs payment is pending completion.")}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Nominal: {fmtAmount(pendingPaylabs.amount, payment.currency, locale)} · Metode: {pendingPaylabs.paymentMethod ?? "Paylabs"}.
                        </p>
                      </div>
                      <Button size="sm" onClick={() => window.location.assign(pendingPaylabs.paymentUrl!)}>
                        {t("paymentProof.payNow", "Continue Paylabs payment")}
                      </Button>
                      <p className="text-xs text-amber-700">
                        {t("paymentProof.linkPendingDesc", "Manual transfer is disabled while this Paylabs transaction is active to prevent duplicate payment.")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600">{t("productOrder.payment.gateway.label", "Paylabs method")}</label>
                        <select
                          value={activePaylabsMethod}
                          onChange={(e) => setSelectedPaylabsMethod(e.target.value)}
                          className="mt-1 h-10 w-full rounded-md border bg-white px-3 text-sm"
                        >
                          {paylabsMethods.map((method) => (
                            <option key={method.code} value={method.code}>{method.label}</option>
                          ))}
                        </select>
                      </div>
                      {createPaylabsPayment.isError && (
                        <p className="text-sm text-red-600">{(createPaylabsPayment.error as Error).message}</p>
                      )}
                      <Button
                        size="sm"
                        onClick={() => createPaylabsPayment.mutate({ paymentMethod: activePaylabsMethod, amount: selectedAmount })}
                        disabled={!payment.paylabs.canCreate || !activePaylabsMethod || !validSelectedAmount || createPaylabsPayment.isPending}
                      >
                        {createPaylabsPayment.isPending
                          ? "Membuat pembayaran…"
                          : `Bayar ${validSelectedAmount ? fmtAmount(selectedAmount, payment.currency, locale) : ""} via Paylabs`}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {payment.proofAvailable && (
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t("productOrder.success.proofReceived", "Payment proof saved as an audit trail")}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Untuk keamanan audit, bukti yang sama tidak dapat digunakan ulang. Bukti lama tetap tersimpan meskipun ditolak.
                      {payment.proofUploadedAt ? ` Dikirim ${fmtDateTime(payment.proofUploadedAt, locale)}.` : ""}
                    </p>
                  </div>
                  {payment.proofUrl && payment.proofMimeType?.startsWith("image/") && (
                    <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="block">
                      <img src={payment.proofUrl} alt="Preview bukti pembayaran" className="max-h-80 w-full rounded-lg border bg-white object-contain" />
                    </a>
                  )}
                  <div className="grid gap-2 rounded-lg bg-white p-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">{t("paymentProof.totalBill", "Submitted amount")}</p>
                      <p className="font-semibold">{payment.proofExpectedAmount == null ? "—" : fmtAmount(payment.proofExpectedAmount, payment.currency, locale)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t("onboarding.ocr.success", "OCR amount")}</p>
                      <p className="font-semibold">{payment.ocrAmount == null ? "Tidak terbaca" : fmtAmount(payment.ocrAmount, payment.currency, locale)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t("productOrder.success.proofReceived", "Proof status")}</p>
                      <p className="font-semibold">{payment.proofReviewStatus === "submitted" ? "Menunggu Admin" : payment.proofReviewStatus === "approved" ? "Disetujui" : payment.proofReviewStatus === "rejected" ? "Ditolak" : "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {payment.manualTransferAllowed && payment.paymentStatus !== "paid" && (
                <div className="space-y-3 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-semibold">{t("productOrder.success.uploadTransfer", "Manual bank transfer")}</p>
                    <p className="mt-1 text-xs font-medium text-slate-700">{t("productOrder.success.uploadTransfer", "Upload transfer proof to CST")}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("productOrder.success.uploadInstruction", "OCR checks the proof against this payment amount, not necessarily the full PO total.")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      id={`payment-proof-${po.id}`}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => onSelectProof(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`payment-proof-${po.id}`}
                      className={`group flex min-h-28 w-full items-center justify-center rounded-xl border-2 border-dashed px-5 py-5 text-center transition ${
                        validSelectedAmount
                          ? "cursor-pointer border-blue-300 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50"
                          : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                      }`}
                      onClick={(event) => {
                        if (!validSelectedAmount) {
                          event.preventDefault();
                          setScanError("Isi nominal pembayaran yang valid terlebih dahulu.");
                        }
                      }}
                    >
                      <div className="space-y-2">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-blue-100">
                          <UploadCloud className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700">
                            {proofFile ? "Klik untuk ganti bukti pembayaran" : "Klik di area ini untuk unggah bukti pembayaran"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">JPG atau PNG · nominal yang dipilih {validSelectedAmount ? fmtAmount(selectedAmount, payment.currency, locale) : "belum valid"}</p>
                        </div>
                      </div>
                    </label>

                    {proofFile && (
                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-700">{proofFile.name}</p>
                          <p className="text-xs text-slate-500">{Math.max(1, Math.round(proofFile.size / 1024))} KB</p>
                        </div>
                        <label htmlFor={`payment-proof-${po.id}`} className="shrink-0 cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                          Ganti file
                        </label>
                      </div>
                    )}
                  </div>

                  {proofPreview && (
                    <img src={proofPreview} alt="Preview bukti yang akan dikirim" className="max-h-80 w-full rounded-lg border bg-slate-50 object-contain" />
                  )}

                  {proofFile && validSelectedAmount && !scanProof.isPending && !scanResult && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => scanProof.mutate({ file: proofFile, amount: selectedAmount })}
                    >
                      {t("onboarding.ocr.reading", "Read proof amount")}
                    </Button>
                  )}

                  {scanProof.isPending && (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {t("common.loading", "Reading payment proof amount...")}
                    </div>
                  )}

                  {!scanProof.isPending && scanResult && (
                    <div className={`rounded-lg border p-3 text-sm ${
                      scanResult.matchesExpected
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-800"
                    }`}>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs opacity-70">{t("onboarding.ocr.success", "OCR amount")}</p>
                          <p className="font-semibold">{scanResult.extractedAmount == null ? "Belum terbaca" : fmtAmount(scanResult.extractedAmount, payment.currency, locale)}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">{t("paymentProof.totalBill", "Payment amount")}</p>
                          <p className="font-semibold">{fmtAmount(scanResult.expectedAmount, payment.currency, locale)}</p>
                        </div>
                      </div>
                      <p className="mt-2 font-medium">
                        {scanResult.matchesExpected
                          ? "Nominal cocok. Bukti dapat dikirim untuk verifikasi admin."
                          : scanResult.timedOut
                            ? "Pembacaan nominal melewati batas waktu. Pilih gambar yang lebih jelas."
                            : scanResult.extractedAmount != null
                              ? `Nominal OCR ${fmtAmount(scanResult.extractedAmount, payment.currency, locale)} berbeda dari nominal pembayaran ${fmtAmount(scanResult.expectedAmount, payment.currency, locale)}.`
                              : "Nominal belum terbaca. Pilih bukti yang lebih jelas."}
                      </p>
                      {!scanResult.matchesExpected
                        && scanResult.extractedAmount != null
                        && scanResult.extractedAmount > 0
                        && scanResult.extractedAmount <= payment.remainingAmount + 0.005 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-white"
                          onClick={() => selectAmount(scanResult.extractedAmount!)}
                        >
                          Gunakan {fmtAmount(scanResult.extractedAmount, payment.currency, locale)} sebagai pembayaran kali ini
                        </Button>
                      )}
                    </div>
                  )}

                  {scanError && <p className="text-sm text-red-600">{scanError}</p>}
                  {uploadProof.isError && <p className="text-sm text-red-600">{(uploadProof.error as Error).message}</p>}

                  <Button size="sm" onClick={() => uploadProof.mutate()} disabled={!canSubmit || uploadProof.isPending}>
                    {uploadProof.isPending ? "Mengunggah…" : `Kirim Bukti ${validSelectedAmount ? fmtAmount(selectedAmount, payment.currency, locale) : ""}`}
                  </Button>
                </div>
              )}

              {payment.paymentStatus === "paid" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {payment.verifiedBy === "paylabs:webhook"
                    ? "Pembayaran berhasil dikonfirmasi otomatis oleh Paylabs"
                    : "Pembayaran sudah diperiksa dan diverifikasi CST"}
                  {payment.verifiedAt ? ` pada ${fmtDateTime(payment.verifiedAt, locale)}` : ""}.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoodsReceiptTab({ shipmentId, poId }: { shipmentId: number | null; poId: number }) {
  const { locale, t } = useLanguage();
  const queryClient = useQueryClient();
  const [receiptMode, setReceiptMode] = useState<"full" | "partial" | "rejected">("full");
  const [partialQty, setPartialQty] = useState<Record<number, string>>({});
  const [receiptNotes, setReceiptNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: GoodsReceipt[] }>({
    queryKey: ["mkt-shipment-goods-receipts", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId!}/goods-receipts`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat goods receipts");
      return res.json();
    },
    enabled: shipmentId != null,
  });

  const { data: shipmentData } = useQuery<{ ok: boolean; data: ShipmentDetail }>({
    queryKey: ["mkt-shipment-detail", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId!}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat detail shipment");
      return res.json();
    },
    enabled: shipmentId != null,
  });

  const { data: podData } = useQuery<{ ok: boolean; data: PodView }>({
    queryKey: ["mkt-shipment-pod", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId!}/pod`, {
        credentials: "include",
      });
      if (res.status === 404) return { ok: false, data: undefined as never };
      if (!res.ok) throw new Error("Gagal memuat POD");
      return res.json();
    },
    enabled: shipmentId != null,
  });

  const receipts = data?.data ?? [];
  const shipment = shipmentData?.data;
  const podAvailable = Boolean(podData?.ok);
  const receivedByItem = new Map<number, number>();
  for (const receipt of receipts) {
    for (const item of receipt.items ?? []) {
      receivedByItem.set(
        item.shipmentItemId,
        (receivedByItem.get(item.shipmentItemId) ?? 0) + Number(item.receivedQty ?? 0),
      );
    }
  }
  const remainingItems = (shipment?.items ?? []).map((item) => ({
    ...item,
    remainingQty: Math.max(0, Number(item.qty) - (receivedByItem.get(item.id) ?? 0)),
  }));
  const remainingTotal = remainingItems.reduce((sum, item) => sum + item.remainingQty, 0);
  const canConfirm = Boolean(
    shipment
    && podAvailable
    && ["arrived", "delivered", "partially_delivered"].includes(shipment.shipmentStatus)
    && remainingTotal > 0,
  );

  const confirmReceipt = useMutation({
    mutationFn: async () => {
      if (!shipmentId || !shipment) throw new Error("Shipment belum dipilih.");
      setSubmitError("");

      const items = remainingItems
        .map((item) => {
          const remaining = item.remainingQty;
          if (remaining <= 0) return null;
          if (receiptMode === "full") {
            return {
              shipmentItemId: item.id,
              receivedQty: remaining,
              acceptedQty: remaining,
              rejectedQty: 0,
              condition: "GOOD",
            };
          }
          if (receiptMode === "rejected") {
            return {
              shipmentItemId: item.id,
              receivedQty: remaining,
              acceptedQty: 0,
              rejectedQty: remaining,
              condition: "REJECTED",
            };
          }
          const accepted = Math.max(0, Math.min(remaining, Number(partialQty[item.id] ?? 0)));
          return accepted > 0 ? {
            shipmentItemId: item.id,
            receivedQty: accepted,
            acceptedQty: accepted,
            rejectedQty: 0,
            condition: "GOOD",
          } : null;
        })
        .filter(Boolean);

      if (!items.length) throw new Error("Masukkan qty yang benar-benar diterima.");
      if (
        receiptMode === "partial"
        && items.reduce((sum, item: any) => sum + Number(item.acceptedQty ?? 0), 0) >= remainingTotal
      ) {
        throw new Error("Jika seluruh sisa qty diterima, pilih Diterima Lengkap.");
      }

      const idempotencyKey = `customer-receipt:${shipmentId}:${receiptMode}:${Date.now()}`;
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId}/goods-receipts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          receiptType: receiptMode,
          notes: receiptNotes.trim() || null,
          items,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message ?? payload.error ?? "Gagal mengonfirmasi penerimaan barang.");
      return payload;
    },
    onSuccess: async () => {
      setReceiptNotes("");
      setPartialQty({});
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mkt-shipment-goods-receipts", shipmentId] }),
        queryClient.invalidateQueries({ queryKey: ["mkt-shipment-detail", shipmentId] }),
        queryClient.invalidateQueries({ queryKey: ["mkt-po-shipments", poId] }),
        queryClient.invalidateQueries({ queryKey: ["mkt-po-detail", poId] }),
        queryClient.invalidateQueries({ queryKey: ["mkt-po-activity", poId] }),
      ]);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Gagal mengonfirmasi penerimaan barang.");
    },
  });

  if (!shipmentId) return (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center text-gray-500 text-sm">
        {t("mktVendorPo.shipmentInfo", "Select a shipment in the Shipment tab first.")}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">{t("common.error", "Failed to load goods receipts.")}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card className={canConfirm ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"}>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <ClipboardCheck className={`w-4 h-4 shrink-0 mt-0.5 ${canConfirm ? "text-emerald-600" : "text-blue-500"}`} />
            <div>
              <p className={`text-sm font-semibold ${canConfirm ? "text-emerald-800" : "text-blue-800"}`}>
                {t("common.confirm", "Confirm goods receipt")}
              </p>
              <p className={`text-xs mt-1 ${canConfirm ? "text-emerald-700" : "text-blue-700"}`}>
                {!shipment
                  ? "Memuat detail shipment…"
                  : !["arrived", "delivered", "partially_delivered"].includes(shipment.shipmentStatus)
                    ? "Konfirmasi tersedia setelah shipment tiba."
                    : !podAvailable
                      ? "Menunggu Proof of Delivery (POD) dari proses pengiriman."
                      : remainingTotal <= 0
                        ? "Seluruh qty shipment sudah dikonfirmasi."
                        : "Periksa barang lalu pilih hasil penerimaan di bawah."}
              </p>
            </div>
          </div>

          {canConfirm && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  ["full", "Diterima Lengkap"],
                  ["partial", "Diterima Sebagian"],
                  ["rejected", "Ada Masalah / Ditolak"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReceiptMode(value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      receiptMode === value
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {remainingItems.filter((item) => item.remainingQty > 0).map((item) => (
                  <div key={item.id} className="rounded-lg border bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800">{item.itemName}</p>
                        <p className="text-xs text-gray-500">
                          Sisa: {item.remainingQty} {item.uom ?? ""}
                        </p>
                      </div>
                      {receiptMode === "partial" && (
                        <input
                          type="number"
                          min="0"
                          max={item.remainingQty}
                          step="any"
                          value={partialQty[item.id] ?? ""}
                          onChange={(event) => setPartialQty((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))}
                          placeholder="Qty diterima"
                          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-right text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                value={receiptNotes}
                onChange={(event) => setReceiptNotes(event.target.value)}
                placeholder={t("vendorDashboard.notesOptional", "Receipt notes (optional)")}
                className="min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <Button
                onClick={() => confirmReceipt.mutate()}
                disabled={confirmReceipt.isPending}
                className="w-full sm:w-auto"
              >
                <ClipboardCheck className="w-4 h-4 mr-1.5" />
                {confirmReceipt.isPending ? "Menyimpan…" : "Konfirmasi Barang Diterima"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {receipts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t("common.loading", "No goods receipt confirmation for this shipment yet.")}</p>
          </CardContent>
        </Card>
      ) : (
        receipts.map((r) => {
          const rt = RECEIPT_TYPE[r.receiptType] ?? { label: r.receiptType, color: "bg-gray-100 text-gray-700", icon: null };
          return (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{rt.icon}</span>
                  <Badge className={`text-sm px-3 py-0.5 ${rt.color}`} variant="secondary">
                    {rt.label}
                  </Badge>
                  <span className="text-xs text-gray-400 ml-auto">
                    {fmtDateTime(r.receivedAt, locale)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {r.receivedBy && <InfoRow label="Diterima oleh" value={r.receivedBy} />}
                  {r.inspectionStatus && <InfoRow label="Status Inspeksi" value={r.inspectionStatus} />}
                </div>
                {r.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                    {r.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function TimelineTab({ shipmentId }: { shipmentId: number | null }) {
  const { locale, t } = useLanguage();
  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: TimelineEvent[] }>({
    queryKey: ["mkt-shipment-timeline", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId!}/timeline`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat timeline");
      return res.json();
    },
    enabled: shipmentId != null,
  });
  const { data: podData } = useQuery<{ ok: boolean; data: PodView }>({
    queryKey: ["mkt-shipment-pod", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/shipments/${shipmentId!}/pod`, {
        credentials: "include",
      });
      if (res.status === 404) return { ok: false, data: undefined as never };
      if (!res.ok) throw new Error("Gagal memuat POD");
      return res.json();
    },
    enabled: shipmentId != null,
    staleTime: 30_000,
  });

  if (!shipmentId) return (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center text-gray-500 text-sm">
        {t("mktVendorPo.shipmentInfo", "Select a shipment in the Shipment tab first.")}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">{t("common.error", "Failed to load timeline.")}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );

  const events = data?.data ?? [];
  const pod = podData?.ok ? podData.data : null;

  if (events.length === 0) return (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{t("logisticTrack.noTracking", "No timeline events for this shipment.")}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 mb-3">
        {events.length} event — append only, tidak dapat diedit.
      </p>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {events.map((ev, i) => (
            <div key={ev.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white
                ${i === 0 ? "bg-orange-400" : "bg-gray-300"}`} />

              <div className="bg-white rounded-lg border p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800 capitalize">
                      {ev.eventType.replace(/_/g, " ")}
                    </span>
                    {ev.actorType && (
                      <span className="text-xs text-gray-400 ml-2">
                        ({ev.actorType}{ev.actorId ? `: ${ev.actorId}` : ""})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {fmtDateTime(ev.createdAt, locale)}
                  </span>
                </div>
                {ev.note && (
                  <p className="text-sm text-gray-600">{ev.note}</p>
                )}
                {ev.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{ev.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {pod && (
        <Card className="border-emerald-200 bg-emerald-50 mt-4">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">{t("tracking.podDocs", "Proof of Delivery available")}</p>
              <p className="text-xs text-emerald-700">
                Diunggah {fmtDateTime(pod.uploadedAt, locale)}{pod.note ? ` — ${pod.note}` : ""}
              </p>
            </div>
            <a
              href={pod.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              {t("tracking.clickToView", "View POD")}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActivityTab({ poId }: { poId: number }) {
  const { locale, t } = useLanguage();
  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: ActivityEvent[] }>({
    queryKey: ["mkt-po-activity", poId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${poId}/activity-log`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal memuat activity log");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-5 text-center space-y-2">
          <p className="text-red-600 text-sm">{t("common.error", "Failed to load activity log.")}</p>
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  const events = data?.data ?? [];
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("common.loading", "No activity log for this PO.")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{events.length} event — riwayat canonical PO.</p>
      {events.map((event) => (
        <Card key={event.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-orange-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800">{event.action.replace(/_/g, " ")}</p>
                  <span className="text-xs text-gray-400">{fmtDateTime(event.createdAt, locale)}</span>
                </div>
                {(event.statusFrom || event.statusTo) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {event.statusFrom ?? "—"} → {event.statusTo ?? "—"}
                  </p>
                )}
                {event.message && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{event.message}</p>}
                {(event.actorRole || event.actorName) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {event.actorName ?? event.actorRole}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MktPoDetailPage({ params }: { params?: { poId?: string } } = {}) {
  const { locale, t } = useLanguage();
  const [location, setLocation] = useLocation();
  const authed = isAuthenticated();
  const routePoId = location.split("/").filter(Boolean).at(-1);
  const poId = Number(params?.poId ?? routePoId);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: PoDetail }>({
    queryKey: ["mkt-po-detail", poId],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/purchase-orders/${poId}`, {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); throw new Error("Unauthorized"); }
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("Gagal memuat purchase order");
      return res.json();
    },
    enabled: authed && Number.isInteger(poId) && poId > 0,
  });

  const po = data?.data;
  const st = po ? (PO_STATUS[po.status] ?? { label: po.status, color: "bg-gray-100 text-gray-700" }) : null;

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );

  if (isError || !po) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Link href="/marketplace/my-purchase-orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> {t("mktPurchaseOrders.pageTitle", "Back to PO list")}
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center space-y-3">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-700 font-medium">{t("mktPurchaseOrders.emptyPo", "Purchase order not found.")}</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <Link
          href="/marketplace/my-purchase-orders"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t("mktPurchaseOrders.pageTitle", "Back to PO list")}
        </Link>

        {/* PO Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{po.poNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">RFQ: {po.rfqNumber}</p>
          </div>
          {st && (
            <Badge className={`text-sm px-3 py-1 ${st.color}`} variant="secondary">
              {poStatusLabel(t, po.status, st.label)}
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-0 -mb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === t.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              ].join(" ")}
            >
              {t.icon}
              {({ overview: t("mktVendorPo.poInfoTitle", "Overview"), items: t("mktVendorPo.itemsTitle", "Items"), shipment: t("mktVendorPo.shipmentInfo", "Shipment"), payment: t("portalInvoice.title", "Payment"), "goods-receipt": t("tracking.podDocs", "Goods Receipt"), timeline: t("logisticOrder.deliveryTimeline", "Timeline"), activity: t("orders.title", "Activity log") } as Record<Tab, string>)[t.id]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-1">
          {activeTab === "overview"      && <OverviewTab po={po} />}
          {activeTab === "items"         && <ItemsTab po={po} />}
          {activeTab === "shipment"      && (
            <ShipmentTab
              poId={po.id}
              poStatus={po.status}
              selectedId={selectedShipmentId}
              onSelect={(id) => {
                setSelectedShipmentId(id);
              }}
            />
          )}
          {activeTab === "payment"       && <PaymentTab po={po} />}
          {activeTab === "goods-receipt" && (
            <div className="space-y-4">
              {!selectedShipmentId && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <Info className="w-4 h-4 shrink-0" />
                  Pilih shipment di tab <button className="underline font-medium" onClick={() => setActiveTab("shipment")}>Shipment</button> terlebih dahulu.
                </div>
              )}
              <GoodsReceiptTab shipmentId={selectedShipmentId} poId={po.id} />
            </div>
          )}
          {activeTab === "timeline"      && (
            <div className="space-y-4">
              {!selectedShipmentId && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <Info className="w-4 h-4 shrink-0" />
                  Pilih shipment di tab <button className="underline font-medium" onClick={() => setActiveTab("shipment")}>Shipment</button> terlebih dahulu.
                </div>
              )}
              <TimelineTab shipmentId={selectedShipmentId} />
            </div>
          )}
          {activeTab === "activity"      && <ActivityTab poId={po.id} />}
        </div>
      </div>
    </div>
  );
}
