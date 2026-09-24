/**
 * mkt-vendor-po.tsx — Phase 2G: Vendor PO Confirmation Portal
 *
 * Standalone token-based page — no login required.
 * Route: /mkt-vendor-po/:token
 *
 * Features:
 *   - View PO detail (snapshot fields, lines, grand total)
 *   - Accept / Reject / Request Revision (only when status = 'issued')
 *   - Status badge with human-readable labels
 *   - Token invalid / expired / already-actioned state handling
 *   - Vendor fulfillment uses the canonical shipment selected by the customer
 *   - Pickup/delivery tracking and POD upload continue on the same PO/shipment
 *
 * Security: never exposes commission, margin, target price, ranking,
 * or vendor_token itself — only what the backend VendorPoView returns.
 */

import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Package,
  AlertTriangle,
  Clock,
  Info,
  Truck,
  Upload,
  MapPin,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorPoLine {
  lineNumber: number;
  itemName: string;
  qty: string;
  unit: string | null;
  unitPrice: string;
  subtotal: string;
  notes: string | null;
}

interface VendorPoView {
  poNumber: string;
  status: string;
  vendorNameSnapshot: string | null;
  vendorAddressSnapshot: string | null;
  paymentTermsSnapshot: string | null;
  incotermSnapshot: string | null;
  quotationNumberSnapshot: string | null;
  quotationDateSnapshot: string | null;
  currencySnapshot: string | null;
  leadTimeDaysSnapshot: number | null;
  totalAmount: string | null;
  taxAmount: string | null;
  grandTotal: string | null;
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  revisionNotes: string | null;
  createdAt: string;
  confirmedAt: string | null;
  vendorTokenExpiresAt: string | null;
  lines: VendorPoLine[];
}

interface VendorShipment {
  id: number;
  shipmentNumber: string;
  shipmentStatus: string;
  carrierName: string | null;
  trackingNumber: string | null;
  origin: string | null;
  destination: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  notes: string | null;
  createdAt: string;
}

interface VendorShipmentDetail extends VendorShipment {
  timeline: Array<{
    id: number;
    eventType: string;
    note: string | null;
    location: string | null;
    createdAt: string;
  }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PO_STATUS: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  pending:              { label: "Menunggu Penerbitan",   color: "bg-gray-100 text-gray-600" },
  issued:               { label: "Menunggu Konfirmasi",   color: "bg-blue-100 text-blue-700" },
  vendor_accepted:      { label: "Diterima Vendor",       color: "bg-green-100 text-green-700" },
  vendor_rejected:      { label: "Ditolak Vendor",        color: "bg-red-100 text-red-700" },
  revision_requested:   { label: "Revisi Diminta",        color: "bg-orange-100 text-orange-700" },
  production:           { label: "Produksi",              color: "bg-purple-100 text-purple-700" },
  ready_to_ship:        { label: "Siap Dikirim",          color: "bg-cyan-100 text-cyan-700" },
  in_transit:           { label: "Dalam Pengiriman",      color: "bg-indigo-100 text-indigo-700" },
  partially_delivered:  { label: "Sebagian Diterima",     color: "bg-yellow-100 text-yellow-700" },
  delivered:            { label: "Diterima",              color: "bg-teal-100 text-teal-700" },
  completed:            { label: "Selesai",               color: "bg-emerald-100 text-emerald-700" },
  closed:               { label: "Ditutup",               color: "bg-slate-100 text-slate-600" },
  rejected_goods:       { label: "Barang Ditolak",        color: "bg-red-100 text-red-700" },
  cancelled:            { label: "Dibatalkan",            color: "bg-gray-100 text-gray-500" },
};

/** Statuses considered terminal (fully read-only) */
const TERMINAL_STATUSES = new Set([
  "completed", "closed", "cancelled", "vendor_rejected",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMoney(v: string | number | null | undefined, currency = "IDR"): string {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    // Fallback if currency code is unrecognised
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  }
}

/** Convenience alias for when currency is already in scope */
const idr = (v: string | number | null | undefined) => formatMoney(v, "IDR");

function fmtDate(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ── API helpers ───────────────────────────────────────────────────────────────

const API_BASE = "/api/mkt/vendor-po";

async function fetchVendorPo(token: string): Promise<VendorPoView> {
  const res = await fetch(`${API_BASE}/${token}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message ?? "Gagal memuat PO") as Error & {
      status: number;
      code?: string;
    };
    err.status = res.status;
    err.code = body.code;
    throw err;
  }
  return res.json();
}

async function postVendorAction(
  token: string,
  action: "accept" | "reject" | "request-revision",
  body: Record<string, unknown> = {},
): Promise<{ ok: boolean; status: string; poNumber: string }> {
  const res = await fetch(`${API_BASE}/${token}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Aksi gagal");
  }
  return res.json();
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function PoSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

// ── Error / expired states ────────────────────────────────────────────────────

function TokenErrorState({ code, message }: { code?: string; message: string }) {
  const { t } = useLanguage();
  const isExpired = code === "EXPIRED";
  const isMalformed = code === "MALFORMED";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isExpired ? "bg-orange-100" : "bg-red-100"}`}>
          {isExpired ? (
            <Clock className="w-8 h-8 text-orange-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-500" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isExpired
              ? t("mktVendorPo.errorLinkExpired", "Link Kadaluarsa")
              : isMalformed
              ? t("mktVendorPo.errorLinkInvalid", "Link Tidak Valid")
              : t("mktVendorPo.errorPoNotFound", "PO Tidak Ditemukan")}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isExpired
              ? t("mktVendorPo.errorExpiredDesc", "Link konfirmasi PO ini telah habis masa berlakunya. Hubungi tim pengadaan untuk mendapatkan link baru.")
              : isMalformed
              ? t("mktVendorPo.errorMalformedDesc", "Format link tidak valid. Pastikan Anda menggunakan link yang dikirimkan melalui WhatsApp.")
              : message}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <Info className="w-4 h-4 inline mr-1" />
          {t("mktVendorPo.contactProcurement", "Hubungi tim pengadaan Anda untuk bantuan lebih lanjut.")}
        </div>
      </div>
    </div>
  );
}


function VendorFulfillment({ token, po }: { token: string; po: VendorPoView }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [eventNote, setEventNote] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [podFile, setPodFile] = useState<File | null>(null);
  const [eventRequestKey, setEventRequestKey] = useState(() => crypto.randomUUID());
  const [podRequestKey, setPodRequestKey] = useState(() => crypto.randomUUID());

  const { data: shipmentData, isLoading } = useQuery<{ ok: boolean; data: VendorShipment[] }>({
    queryKey: ["vendor-po-shipments", token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${token}/shipments`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Gagal memuat shipment");
      return body;
    },
    enabled: !!token,
    staleTime: 10_000,
  });
  const shipments = shipmentData?.data ?? [];
  const selectedShipmentId = selectedId ?? shipments[0]?.id ?? null;

  const { data: detailData } = useQuery<{ ok: boolean; shipment: VendorShipmentDetail }>({
    queryKey: ["vendor-po-shipment", token, selectedShipmentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${token}/shipments/${selectedShipmentId}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Gagal memuat detail shipment");
      return body;
    },
    enabled: selectedShipmentId != null,
    staleTime: 5_000,
  });
  const detail = detailData?.shipment;

  const { data: podData } = useQuery<{ ok: boolean; data?: { available: boolean; url: string; uploadedAt: string; note?: string | null } }>({
    queryKey: ["vendor-po-pod", token, selectedShipmentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${token}/shipments/${selectedShipmentId}/pod`);
      if (res.status === 404) return { ok: false };
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message ?? "Gagal memuat POD");
      return body;
    },
    enabled: selectedShipmentId != null,
    staleTime: 5_000,
  });
  const podAvailable = Boolean(podData?.ok && podData.data?.available);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["vendor-po-shipments", token] });
    void queryClient.invalidateQueries({ queryKey: ["vendor-po-shipment", token, selectedShipmentId] });
    void queryClient.invalidateQueries({ queryKey: ["vendor-po-pod", token, selectedShipmentId] });
    void queryClient.invalidateQueries({ queryKey: ["vendor-po", token] });
  };

  const isPickup = detail?.shipmentType === "pickup_self";
  const action = (() => {
    if (!detail || !po.confirmedAt) return null;
    if (isPickup) {
      if (detail.shipmentStatus === "planned") return { eventType: "packing", label: "Mulai siapkan barang" };
      if (detail.shipmentStatus === "packing") return { eventType: "ready_for_pickup", label: "Barang siap diambil" };
      if (detail.shipmentStatus === "ready_to_ship") return { eventType: "handed_over", label: "Barang sudah diserahkan" };
      return null;
    }
    if (detail.shipmentStatus === "planned") return { eventType: "packing", label: "Mulai packing" };
    if (detail.shipmentStatus === "packing") return { eventType: "loaded", label: "Barang selesai dimuat" };
    if (detail.shipmentStatus === "loading") return { eventType: "ready_to_ship", label: "Siap dikirim" };
    if (detail.shipmentStatus === "ready_to_ship") return { eventType: "departed", label: "Mulai pengiriman" };
    if (detail.shipmentStatus === "in_transit") return { eventType: "arrived", label: "Barang tiba di tujuan" };
    return null;
  })();

  const appendEvent = useMutation({
    mutationFn: async () => {
      if (!selectedShipmentId || !action) throw new Error("Tidak ada aksi shipment yang tersedia.");
      if (action.eventType === "ready_for_pickup" && !pickupLocation.trim()) {
        throw new Error("Lokasi pengambilan wajib diisi.");
      }
      const res = await fetch(`${API_BASE}/${token}/shipments/${selectedShipmentId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": eventRequestKey },
        body: JSON.stringify({
          eventType: action.eventType,
          note: eventNote || undefined,
          location: action.eventType === "ready_for_pickup" ? pickupLocation.trim() : undefined,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.message ?? result.code ?? "Status shipment gagal diperbarui");
      return result;
    },
    onSuccess: () => {
      toast({ title: "Status shipment diperbarui" });
      setEventRequestKey(crypto.randomUUID());
      setEventNote("");
      refresh();
    },
    onError: (err: Error) => toast({ title: "Update shipment gagal", description: err.message, variant: "destructive" }),
  });

  const uploadPod = useMutation({
    mutationFn: async () => {
      if (!selectedShipmentId || !podFile) throw new Error("Pilih file POD terlebih dahulu.");
      const form = new FormData();
      form.append("file", podFile);
      if (eventNote.trim()) form.append("remarks", eventNote.trim());
      const res = await fetch(`${API_BASE}/${token}/shipments/${selectedShipmentId}/pod`, {
        method: "POST",
        headers: { "Idempotency-Key": podRequestKey },
        body: form,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.message ?? result.code ?? "Upload POD gagal");
      return result;
    },
    onSuccess: () => {
      toast({ title: "POD tersimpan", description: "Customer sekarang dapat mengonfirmasi penerimaan barang." });
      setPodRequestKey(crypto.randomUUID());
      setPodFile(null);
      setEventNote("");
      refresh();
    },
    onError: (err: Error) => toast({ title: "Upload POD gagal", description: err.message, variant: "destructive" }),
  });

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          Fulfillment & Serah Terima
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!po.confirmedAt && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Konfirmasi penerimaan PO terlebih dahulu. Setelah PO diterima, shipment yang dipilih customer dapat diproses di sini.
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : shipments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-gray-600">
            <p className="font-medium">Menunggu customer memilih metode pengiriman.</p>
            <p className="mt-1 text-xs text-gray-500">
              Vendor tidak perlu membuat shipment baru. Shipment canonical akan muncul otomatis setelah customer memilih pengiriman.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {shipments.map((shipment) => (
              <button
                key={shipment.id}
                type="button"
                onClick={() => setSelectedId(shipment.id)}
                className={`w-full text-left rounded-lg border p-3 ${selectedShipmentId === shipment.id ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-semibold">{shipment.shipmentNumber}</span>
                    <p className="mt-1 text-xs text-gray-500">
                      {shipment.shipmentType === "pickup_self" ? "Ambil sendiri" : (shipment.shipmentType ?? "Pengiriman")}
                    </p>
                  </div>
                  <Badge variant="secondary">{shipment.shipmentStatus}</Badge>
                </div>
                {shipment.shipmentType === "pickup_self" ? (
                  <p className="text-xs text-gray-500 mt-2">
                    {shipment.origin || shipment.destination
                      ? `Lokasi pickup: ${shipment.origin || shipment.destination}`
                      : "Lokasi pickup akan ditetapkan saat barang siap diambil."}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    {shipment.carrierName ?? "Carrier belum diisi"}{shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {detail && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alur shipment</p>
              <p className="mt-1 text-sm text-gray-700">
                {isPickup
                  ? "Siapkan barang → tandai siap diambil → serahkan ke customer → upload POD → customer konfirmasi penerimaan."
                  : "Packing → loading → siap dikirim → perjalanan → tiba → upload POD → customer konfirmasi penerimaan."}
              </p>
            </div>

            {detail.timeline.length > 0 && (
              <div className="space-y-2">
                {detail.timeline.map((event) => (
                  <div key={event.id} className="flex gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{event.eventType.replaceAll("_", " ")}</span>
                      {event.location ? <p className="text-gray-600"><MapPin className="mr-1 inline h-3 w-3" />{event.location}</p> : null}
                      {event.note ? <p className="text-gray-500">{event.note}</p> : null}
                      <p className="text-gray-400">{fmtDateTime(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {action && (
              <div className="rounded-lg border bg-slate-50 p-3 space-y-3">
                {action.eventType === "ready_for_pickup" && (
                  <div>
                    <Label className="text-xs">Lokasi pengambilan</Label>
                    <Input
                      className="mt-1"
                      placeholder="Alamat/lokasi barang dapat diambil customer"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                    />
                  </div>
                )}
                <Input
                  placeholder="Catatan status (opsional)"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => appendEvent.mutate()}
                  disabled={appendEvent.isPending || !po.confirmedAt}
                >
                  {appendEvent.isPending ? "Menyimpan…" : action.label}
                </Button>
              </div>
            )}

            {detail.shipmentStatus === "arrived" && !podAvailable && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {isPickup ? "Barang sudah diserahkan" : "Barang sudah tiba"}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Upload POD/bukti serah terima agar customer dapat membuka konfirmasi penerimaan.
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setPodFile(e.target.files?.[0] ?? null)}
                />
                <Button size="sm" onClick={() => uploadPod.mutate()} disabled={!podFile || uploadPod.isPending}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {uploadPod.isPending ? "Mengunggah…" : "Upload POD"}
                </Button>
              </div>
            )}

            {podAvailable && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="mr-1 inline h-4 w-4" />
                POD sudah tersedia. Menunggu customer melakukan Goods Receipt.
                {podData?.data?.url ? (
                  <a className="ml-2 underline font-medium" href={podData.data.url} target="_blank" rel="noreferrer">
                    Lihat POD
                  </a>
                ) : null}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MktVendorPoPage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Dialog states
  const [showAccept, setShowAccept]     = useState(false);
  const [showReject, setShowReject]     = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [rejectReason, setRejectReason]   = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");

  // Fetch PO
  const { data: po, isLoading, error } = useQuery<VendorPoView, Error & { status?: number; code?: string }>({
    queryKey: ["vendor-po", token],
    queryFn: () => fetchVendorPo(token!),
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
  });

  // Mutations
  const actionMutation = useMutation({
    mutationFn: ({ action, body }: { action: "accept" | "reject" | "request-revision"; body?: Record<string, unknown> }) =>
      postVendorAction(token!, action, body ?? {}),
    onSuccess: (data) => {
      toast({ title: t("mktVendorPo.success", "Berhasil"), description: `${t("mktVendorPo.statusUpdated", "Status PO diperbarui")}: ${PO_STATUS[data.status]?.label ?? data.status}` });
      queryClient.invalidateQueries({ queryKey: ["vendor-po", token] });
      setShowAccept(false);
      setShowReject(false);
      setShowRevision(false);
      setRejectReason("");
      setRevisionNotes("");
    },
    onError: (err: Error) => {
      toast({ title: t("mktVendorPo.failed", "Gagal"), description: err.message, variant: "destructive" });
    },
  });

  // ── Render error states ───────────────────────────────────────────────────

  if (isLoading) return <PoSkeleton />;

  if (error) {
    const status = (error as any).status;
    const code   = (error as any).code;
    if (status === 400 || status === 404 || status === 410) {
      return <TokenErrorState code={code} message={error.message} />;
    }
    return <TokenErrorState message={t("mktVendorPo.genericError", "Terjadi kesalahan. Silakan coba lagi.")} />;
  }

  if (!po) return null;

  const statusInfo = PO_STATUS[po.status] ?? { label: po.status, color: "bg-gray-100 text-gray-600" };
  const canInitialRespond = po.status === "issued";
  const needsLegacyAcceptance = !po.confirmedAt && ["production", "ready_to_ship", "in_transit"].includes(po.status);
  const canAccept = canInitialRespond || needsLegacyAcceptance;
  const isTerminal = TERMINAL_STATUSES.has(po.status);
  const currency = po.currencySnapshot ?? "IDR";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Purchase Order</p>
            <p className="text-sm font-bold text-gray-800 truncate">{po.poNumber}</p>
          </div>
          <Badge className={`text-xs font-medium border-0 ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">

        {/* Expired token warning */}
        {po.vendorTokenExpiresAt && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t("mktVendorPo.linkValidUntil", "Link berlaku hingga")}: <strong>{fmtDateTime(po.vendorTokenExpiresAt)}</strong></span>
          </div>
        )}

        {/* Revision notes from admin */}
        {po.revisionNotes && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">{t("mktVendorPo.revisionNoteFromBuyer", "Catatan Revisi dari Buyer")}</p>
              <p className="text-orange-700 mt-1">{po.revisionNotes}</p>
            </div>
          </div>
        )}

        {/* PO Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">{t("mktVendorPo.poInfoTitle", "Informasi Purchase Order")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.poNumber", "Nomor PO")}</p>
                <p className="font-semibold">{po.poNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.status", "Status")}</p>
                <Badge className={`text-xs font-medium border-0 mt-0.5 ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.vendor", "Vendor")}</p>
                <p className="font-medium">{po.vendorNameSnapshot ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.quotationNumber", "No. Quotation")}</p>
                <p>{po.quotationNumberSnapshot ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.quotationDate", "Tanggal Quotation")}</p>
                <p>{fmtDate(po.quotationDateSnapshot)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.currency", "Mata Uang")}</p>
                <p className="font-medium">{currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.incoterm", "Incoterm")}</p>
                <p>{po.incotermSnapshot ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.paymentTerms", "Syarat Pembayaran")}</p>
                <p>{po.paymentTermsSnapshot ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.leadTime", "Lead Time")}</p>
                <p>{po.leadTimeDaysSnapshot != null ? `${po.leadTimeDaysSnapshot} ${t("mktVendorPo.days", "hari")}` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.targetCompletion", "Target Selesai")}</p>
                <p>{fmtDate(po.expectedCompletionDate)}</p>
              </div>
              {po.actualCompletionDate && (
                <div>
                  <p className="text-xs text-gray-500">{t("mktVendorPo.actualCompletionDate", "Tanggal Selesai Aktual")}</p>
                  <p>{fmtDate(po.actualCompletionDate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.issuedDate", "Diterbitkan")}</p>
                <p>{fmtDate(po.createdAt)}</p>
              </div>
            </div>

            {po.vendorAddressSnapshot && (
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorPo.vendorAddress", "Alamat Vendor")}</p>
                <p className="text-xs mt-0.5 leading-relaxed">{po.vendorAddressSnapshot}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PO Lines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              {t("mktVendorPo.itemsTitle", "Item Purchase Order")} ({po.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {po.lines.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">{t("mktVendorPo.noItems", "Tidak ada item")}</p>
            ) : (
              <div className="divide-y">
                {po.lines.map((line, idx) => (
                  <div key={idx} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{line.itemName}</p>
                        {line.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{line.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{t("mktVendorPo.qty", "Qty")}</p>
                        <p className="text-sm font-semibold">
                          {line.qty} {line.unit ?? ""}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t("mktVendorPo.unitPrice", "Harga Satuan")}</p>
                        <p className="font-semibold">{formatMoney(line.unitPrice, currency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t("mktVendorPo.qty", "Qty")}</p>
                        <p>{line.qty} {line.unit ?? ""}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t("mktVendorPo.subtotal", "Subtotal")}</p>
                        <p className="font-semibold text-green-700">{formatMoney(line.subtotal, currency)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t("mktVendorPo.subtotalLabel", "Subtotal")}</span>
              <span>{formatMoney(po.totalAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("mktVendorPo.tax", "Pajak (PPN)")}</span>
              <span>{formatMoney(po.taxAmount, currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base text-gray-800">
              <span>{t("mktVendorPo.grandTotal", "Grand Total")}</span>
              <span className="text-green-700">{formatMoney(po.grandTotal, currency)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Canonical vendor shipment and tracking surface */}
        {["vendor_accepted", "production", "ready_to_ship", "in_transit", "partially_delivered", "delivered", "completed", "closed"].includes(po.status) && (
          <VendorFulfillment token={token!} po={po} />
        )}

        {/* Terminal status notice */}
        {isTerminal && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            <Info className="w-4 h-4 shrink-0" />
            <span>{t("mktVendorPo.terminalNotice", "PO ini sudah dalam status final dan tidak dapat diubah.")}</span>
          </div>
        )}

        {/* Post-accepted read-only notice */}
        {/* Show post-acceptance notice only for statuses that follow vendor_accepted */}
        {["vendor_accepted", "production", "ready_to_ship", "in_transit",
          "partially_delivered", "delivered"].includes(po.status) && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t("mktVendorPo.acceptedNotice", "Konfirmasi Anda telah diterima. Tim pengadaan sedang memproses PO ini.")}</span>
          </div>
        )}
      </div>

      
{/* Action bar */}
      {canAccept && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg px-4 py-3 z-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2 text-center">
              {needsLegacyAcceptance
                ? "PO ini sudah memiliki aktivitas fulfillment lama tetapi belum tercatat dikonfirmasi vendor. Konfirmasi sekarang untuk melanjutkan."
                : t("mktVendorPo.reviewBeforeAction", "Harap tinjau PO di atas sebelum mengambil tindakan")}
            </p>
            <div className={canInitialRespond ? "grid grid-cols-3 gap-2" : "grid grid-cols-1"}>
              {canInitialRespond && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={() => setShowRevision(true)}
                    disabled={actionMutation.isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    {t("mktVendorPo.revisionBtn", "Revisi")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setShowReject(true)}
                    disabled={actionMutation.isPending}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    {t("mktVendorPo.rejectBtn", "Tolak")}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowAccept(true)}
                disabled={actionMutation.isPending}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {needsLegacyAcceptance ? "Konfirmasi PO" : t("mktVendorPo.acceptBtn", "Terima")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Dialog */}
      <Dialog open={showAccept} onOpenChange={setShowAccept}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {t("mktVendorPo.acceptDialogTitle", "Terima Purchase Order")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              {t("mktVendorPo.acceptDialogDesc", "Dengan menerima PO ini, Anda menyetujui seluruh syarat dan kondisi yang tercantum dalam")}{" "}
              <strong className="text-gray-800">{po.poNumber}</strong>.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("mktVendorPo.grandTotal", "Grand Total")}</span>
                <span className="font-bold text-green-700">{formatMoney(po.grandTotal, currency)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccept(false)} disabled={actionMutation.isPending}>
              {t("mktVendorPo.cancel", "Batal")}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => actionMutation.mutate({ action: "accept" })}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? t("mktVendorPo.processing", "Memproses…") : t("mktVendorPo.acceptConfirm", "Ya, Terima PO")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              {t("mktVendorPo.rejectDialogTitle", "Tolak Purchase Order")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("mktVendorPo.rejectDialogDesc", "Masukkan alasan penolakan untuk")} <strong>{po.poNumber}</strong> {t("mktVendorPo.optional", "(opsional)")}.
            </p>
            <div>
              <Label className="text-xs text-gray-600">{t("mktVendorPo.rejectReason", "Alasan Penolakan")}</Label>
              <Textarea
                placeholder={t("mktVendorPo.rejectReasonPlaceholder", "Contoh: Harga tidak sesuai, kapasitas tidak tersedia…")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-1 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{rejectReason.length}/2000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)} disabled={actionMutation.isPending}>
              {t("mktVendorPo.cancel", "Batal")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionMutation.mutate({ action: "reject", body: { reason: rejectReason || null } })}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? t("mktVendorPo.processing", "Memproses…") : t("mktVendorPo.rejectConfirm", "Ya, Tolak PO")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Dialog */}
      <Dialog open={showRevision} onOpenChange={setShowRevision}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              {t("mktVendorPo.revisionDialogTitle", "Minta Revisi PO")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("mktVendorPo.revisionDialogDesc", "Jelaskan perubahan yang Anda butuhkan untuk")} <strong>{po.poNumber}</strong>.
            </p>
            <div>
              <Label className="text-xs text-gray-600">
                {t("mktVendorPo.revisionNotes", "Catatan Revisi")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder={t("mktVendorPo.revisionNotesPlaceholder", "Contoh: Mohon ubah harga satuan item A menjadi Rp 50.000, lead time perlu diperpanjang…")}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={4}
                maxLength={4000}
                className="mt-1 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{revisionNotes.length}/4000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevision(false)} disabled={actionMutation.isPending}>
              {t("mktVendorPo.cancel", "Batal")}
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                if (!revisionNotes.trim()) {
                  toast({ title: t("mktVendorPo.revisionRequired", "Catatan wajib diisi"), description: t("mktVendorPo.revisionRequiredDesc", "Mohon jelaskan perubahan yang dibutuhkan."), variant: "destructive" });
                  return;
                }
                actionMutation.mutate({ action: "request-revision", body: { notes: revisionNotes.trim() } });
              }}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? t("mktVendorPo.processing", "Memproses…") : t("mktVendorPo.revisionSubmit", "Kirim Permintaan Revisi")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
