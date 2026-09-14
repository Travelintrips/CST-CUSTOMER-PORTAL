import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

type Tab = "overview" | "items" | "shipment" | "goods-receipt" | "timeline" | "activity";

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
  delivered:     { label: "Terkirim",       color: "bg-green-100 text-green-700" },
  cancelled:     { label: "Dibatalkan",     color: "bg-red-100 text-red-700" },
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

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(amount: string | number | null, currency: string | null): string {
  if (amount == null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return `${currency ?? "IDR"} ${new Intl.NumberFormat("id-ID").format(num)}`;
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
  { id: "goods-receipt", label: "Goods Receipt", icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: "timeline",      label: "Timeline",      icon: <Clock className="w-4 h-4" /> },
  { id: "activity",      label: "Activity Log",  icon: <FileText className="w-4 h-4" /> },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function OverviewTab({ po }: { po: PoDetail }) {
  const st = PO_STATUS[po.status] ?? { label: po.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-5">
      {/* Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status PO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 py-1 ${st.color}`} variant="secondary">
              {st.label}
            </Badge>
            {po.cancelledAt && (
              <span className="text-xs text-red-600">
                Dibatalkan: {fmtDate(po.cancelledAt)}
              </span>
            )}
          </div>
          {po.cancelReason && (
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
              <span className="font-medium">Alasan: </span>{po.cancelReason}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" /> Vendor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="Nama Vendor" value={po.vendorName ?? po.vendorNameSnapshot} />
          {po.vendorAddressSnapshot && (
            <InfoRow label="Alamat" value={po.vendorAddressSnapshot} />
          )}
          {po.vendorPhone && <InfoRow label="Telepon" value={po.vendorPhone} />}
          {po.vendorEmail && <InfoRow label="Email" value={po.vendorEmail} />}
        </CardContent>
      </Card>

      {/* Buyer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Buyer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="Nama" value={po.buyerName} />
          <InfoRow label="Email" value={po.buyerEmail} />
          <InfoRow label="RFQ Number" value={po.rfqNumber} />
        </CardContent>
      </Card>

      {/* PO Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Informasi PO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <InfoRow label="PO Number" value={<span className="font-mono">{po.poNumber}</span>} />
          <InfoRow label="No. Quotasi" value={po.quotationNumberSnapshot} />
          <InfoRow label="Tanggal Quotasi" value={fmtDate(po.quotationDateSnapshot)} />
          <InfoRow label="Incoterm" value={po.incotermSnapshot} />
          <InfoRow label="Payment Terms" value={po.paymentTermsSnapshot} />
          <InfoRow label="Mata Uang" value={po.currencySnapshot} />
          <InfoRow label="Lead Time" value={po.leadTimeDaysSnapshot ? `${po.leadTimeDaysSnapshot} hari` : "—"} />
          <InfoRow label="Total" value={fmtAmount(po.totalAmount, po.currencySnapshot)} />
          {po.taxAmount !== null && <InfoRow label="Pajak" value={fmtAmount(po.taxAmount, po.currencySnapshot)} />}
          <InfoRow label="Grand Total" value={
            <span className="text-orange-600 font-semibold">
              {fmtAmount(po.grandTotal, po.currencySnapshot)}
            </span>
          } />
          <InfoRow label="Dibuat" value={fmtDateTime(po.createdAt)} />
          <InfoRow label="Dikonfirmasi" value={fmtDateTime(po.confirmedAt)} />
        </CardContent>
      </Card>

      {/* Revision Notes */}
      {po.rfqNotes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Catatan RFQ</CardTitle>
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
              <p className="text-sm text-red-500">Gagal memuat item PO.</p>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Coba Lagi
              </Button>
            </div>
          )}
          {!isLoading && !isError && lines.length === 0 && (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Tidak ada item pada PO ini.</p>
            </div>
          )}
          {!isLoading && !isError && lines.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="px-4 py-2.5 text-left font-medium w-12">#</th>
                    <th className="px-4 py-2.5 text-left font-medium">Item</th>
                    <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                    <th className="px-4 py-2.5 text-left font-medium">Unit</th>
                    <th className="px-4 py-2.5 text-right font-medium">Harga Satuan</th>
                    <th className="px-4 py-2.5 text-right font-medium">Subtotal</th>
                    <th className="px-4 py-2.5 text-left font-medium hidden lg:table-cell">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b last:border-b-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">{line.lineNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{line.itemName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{parseFloat(line.qty).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-gray-500">{line.unit ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtAmount(line.unitPrice, po.currencySnapshot)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{fmtAmount(line.subtotal, po.currencySnapshot)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{line.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50/60">
                    <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Grand Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-orange-600">
                      {fmtAmount(po.grandTotal, po.currencySnapshot)}
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
  selectedId,
  onSelect,
}: {
  poId: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("trucking");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentType }),
      });
      const body = await res.json() as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) throw new Error(body.message ?? body.error ?? "Gagal menyimpan pilihan pengiriman");
      return body;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mkt-po-shipments", poId] });
    },
  });

  const shipments = data?.data ?? [];

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">Gagal memuat shipment.</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );

  if (shipments.length === 0) return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-500" />
          Pilih mode pengiriman
        </CardTitle>
        <p className="text-sm text-gray-500">
          Pilihan ini membuat shipment canonical untuk PO ini. Setelah disimpan, mode tidak dapat diganti dari portal.
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
      {shipments.map((s) => {
        const st = SHIPMENT_STATUS[s.shipmentStatus] ?? { label: s.shipmentStatus, color: "bg-gray-100 text-gray-700" };
        const active = selectedId === s.id;
        return (
          <Card
            key={s.id}
            className={`cursor-pointer transition-all ${active ? "ring-2 ring-orange-400 shadow-sm" : "hover:shadow-sm"}`}
            onClick={() => onSelect(s.id)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-sm font-semibold text-gray-800">
                    {s.shipmentNumber}
                  </span>
                  {s.carrierName && (
                    <span className="text-xs text-gray-500 ml-2">via {s.carrierName}</span>
                  )}
                  {s.shipmentType && (
                    <span className="text-xs text-gray-400 ml-1">({s.shipmentType})</span>
                  )}
                </div>
                <Badge className={`text-xs ${st.color}`} variant="secondary">{st.label}</Badge>
              </div>

              {s.trackingNumber && (
                <p className="text-xs text-gray-600">
                  Tracking: <span className="font-mono">{s.trackingNumber}</span>
                </p>
              )}

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
                {s.estimatedArrival && (
                  <span>Est. Tiba: {fmtDate(s.estimatedArrival)}</span>
                )}
                {s.actualArrival && (
                  <span className="text-green-600">Tiba: {fmtDate(s.actualArrival)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function GoodsReceiptTab({ shipmentId }: { shipmentId: number | null }) {
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

  if (!shipmentId) return (
    <Card className="border-dashed">
      <CardContent className="p-10 text-center text-gray-500 text-sm">
        Pilih shipment di tab Shipment terlebih dahulu.
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">Gagal memuat goods receipts.</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );

  const receipts = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* GAP notice for creation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>Backend GAP:</strong> Buyer goods receipt creation (Receive Full / Partial / Reject)
            belum tersedia sebagai endpoint portal. Goods receipt saat ini dibuat oleh admin.
          </p>
        </CardContent>
      </Card>

      {receipts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Belum ada goods receipt untuk shipment ini.</p>
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
                    {fmtDateTime(r.receivedAt)}
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
        Pilih shipment di tab Shipment terlebih dahulu.
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  if (isError) return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-5 text-center space-y-2">
        <p className="text-red-600 text-sm">Gagal memuat timeline.</p>
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
        <p className="text-gray-500 text-sm">Belum ada event timeline untuk shipment ini.</p>
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
                    {fmtDateTime(ev.createdAt)}
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
              <p className="text-sm font-semibold text-emerald-800">Proof of Delivery tersedia</p>
              <p className="text-xs text-emerald-700">
                Diunggah {fmtDateTime(pod.uploadedAt)}{pod.note ? ` — ${pod.note}` : ""}
              </p>
            </div>
            <a
              href={pod.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Lihat POD
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActivityTab({ poId }: { poId: number }) {
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
          <p className="text-red-600 text-sm">Gagal memuat activity log.</p>
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
          <p className="text-gray-500 text-sm">Belum ada activity log untuk PO ini.</p>
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
                  <span className="text-xs text-gray-400">{fmtDateTime(event.createdAt)}</span>
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

export default function MktPoDetailPage({ params }: { params: { poId: string } }) {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const poId = Number(params.poId);
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
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar PO
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center space-y-3">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-700 font-medium">Purchase order tidak ditemukan.</p>
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
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar PO
        </Link>

        {/* PO Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{po.poNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">RFQ: {po.rfqNumber}</p>
          </div>
          {st && (
            <Badge className={`text-sm px-3 py-1 ${st.color}`} variant="secondary">
              {st.label}
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
              {t.label}
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
              selectedId={selectedShipmentId}
              onSelect={(id) => {
                setSelectedShipmentId(id);
                // Auto-navigate user to goods-receipt/timeline hint
              }}
            />
          )}
          {activeTab === "goods-receipt" && (
            <div className="space-y-4">
              {!selectedShipmentId && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <Info className="w-4 h-4 shrink-0" />
                  Pilih shipment di tab <button className="underline font-medium" onClick={() => setActiveTab("shipment")}>Shipment</button> terlebih dahulu.
                </div>
              )}
              <GoodsReceiptTab shipmentId={selectedShipmentId} />
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
