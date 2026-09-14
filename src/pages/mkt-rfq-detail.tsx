import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, CheckCircle2, Clock, Package, FileText, AlertCircle,
  ThumbsUp, ThumbsDown, ExternalLink, Building2, ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RfqDetail {
  id: number;
  rfq_number: string;
  status: string;
  approval_status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_company: string | null;
  notes: string | null;
  required_delivery_date: string | null;
  delivery_address: string | null;
  destination_place_id: string | null;
  destination_lat: string | number | null;
  destination_lng: string | number | null;
  created_at: string;
  winner_selected_at: string | null;
  proposed_quote_id: number | null;
  pendingApproval: {
    id: number;
    status: string;
    requestedAt: string;
    responseNotes: string | null;
  } | null;
}

interface Quotation {
  id: number;
  quotationNumber: string | null;
  paymentTerms: string | null;
  incoterm: string | null;
  deliveryLocation: string | null;
  notes: string | null;
  submittedAt: string | null;
  vendorName: string | null;
  vendorPhone: string | null;
  grandTotal: number;
  lines: Array<{
    rfqLineId: number;
    itemName: string | null;
    requestedQty: string | null;
   dealUnitPrice: string;
    offeredQty: string;
   dealSubtotal: string;
    currency: string | null;
    leadTimeDays: number | null;
    stockStatus: string | null;
    notes: string | null;
  }>;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "draft",           label: "Draft",              icon: FileText },
  { key: "submitted",       label: "Diajukan",           icon: ClipboardList },
  { key: "quoting",         label: "Proses",             icon: Clock },
  { key: "quoted",          label: "Penawaran Masuk",    icon: Package },
  { key: "customer_review", label: "Menunggu Anda",      icon: ThumbsUp },
  { key: "awarded",         label: "PO Dibuat",          icon: CheckCircle2 },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:           { label: "Draft",                     color: "bg-slate-100 text-slate-700" },
  submitted:       { label: "Diajukan",                  color: "bg-blue-100 text-blue-700" },
  quoting:         { label: "Proses Penawaran",          color: "bg-amber-100 text-amber-700" },
  quoted:          { label: "Penawaran Masuk",           color: "bg-cyan-100 text-cyan-700" },
  customer_review: { label: "Menunggu Persetujuan Anda", color: "bg-orange-100 text-orange-700" },
  awarded:         { label: "PO Telah Dibuat",           color: "bg-green-100 text-green-700" },
  cancelled:       { label: "Dibatalkan",                color: "bg-red-100 text-red-700" },
  expired:         { label: "Kedaluwarsa",               color: "bg-gray-100 text-gray-500" },
};

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function mapsLink(placeId: string | null, lat: string | number | null, lng: string | number | null): string | null {
  if (placeId && lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}&query_place_id=${encodeURIComponent(placeId)}`;
  }
  return null;
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MktRfqDetailPage() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const rfqIdNum = Number(rfqId);
  const authed = isAuthenticated();

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: rfqData, isLoading: rfqLoading, isError: rfqError } = useQuery<{ ok: boolean; data: RfqDetail }>({
    queryKey: ["mkt-rfq-detail", rfqIdNum],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqIdNum}`, {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error("Gagal memuat RFQ");
      return res.json();
    },
    enabled: authed && !!rfqIdNum,
  });

  const rfq = rfqData?.data;
  const isCustomerReview = rfq?.status === "customer_review";
  const isAwarded = rfq?.status === "awarded";
  const isCancelled = rfq?.status === "cancelled" || rfq?.status === "expired";

  const { data: quotationData, isLoading: quotationLoading } = useQuery<{ ok: boolean; data: Quotation }>({
    queryKey: ["mkt-rfq-quotation", rfqIdNum],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqIdNum}/quotation`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Quotation tidak tersedia");
      return res.json();
    },
    enabled: !!rfqIdNum && (isCustomerReview || isAwarded),
    retry: false,
  });

  const { data: poData } = useQuery<{ ok: boolean; data: PurchaseOrder }>({
    queryKey: ["mkt-rfq-po", rfqIdNum],
    queryFn: async () => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqIdNum}/purchase-order`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("PO belum tersedia");
      return res.json();
    },
    enabled: !!rfqIdNum && isAwarded,
    retry: false,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqIdNum}/customer-approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Gagal menyetujui quotation");
      }
      return res.json() as Promise<{ ok: boolean; data: { poId: number; poNumber: string; vendorName: string } }>;
    },
    onSuccess: (result) => {
      toast.success(`PO ${result.data.poNumber} berhasil dibuat!`);
      void qc.invalidateQueries({ queryKey: ["mkt-rfq-detail", rfqIdNum] });
      void qc.invalidateQueries({ queryKey: ["mkt-rfq-po", rfqIdNum] });
      void qc.invalidateQueries({ queryKey: ["mkt-my-rfqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqIdNum}/customer-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: rejectReason.trim() || "Ditolak oleh buyer" }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Gagal menolak quotation");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.info("Quotation ditolak. Admin akan mengevaluasi kembali.");
      setShowRejectForm(false);
      setRejectReason("");
      void qc.invalidateQueries({ queryKey: ["mkt-rfq-detail", rfqIdNum] });
      void qc.invalidateQueries({ queryKey: ["mkt-my-rfqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Timeline ───────────────────────────────────────────────────────────────

  const statusOrder = ["draft", "submitted", "quoting", "quoted", "customer_review", "awarded"];
  const currentIdx = statusOrder.indexOf(rfq?.status ?? "");

  // Only show customer_review step if it's relevant to this RFQ's journey
  const visibleSteps = STATUS_STEPS.filter((s) => {
    if (s.key === "customer_review") return ["customer_review", "awarded"].includes(rfq?.status ?? "");
    return true;
  });

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (rfqLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (rfqError || !rfq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-700 font-medium">RFQ tidak ditemukan</p>
          <Link href="/marketplace/my-rfqs">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar RFQ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_LABELS[rfq.status] ?? { label: rfq.status, color: "bg-gray-100 text-gray-700" };
  const quotation = quotationData?.data;
  const po = poData?.data;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/marketplace/my-rfqs">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">Detail RFQ</h1>
            <p className="text-xs font-mono text-muted-foreground">{rfq.rfq_number}</p>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* PO Created Banner */}
        {isAwarded && po && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Purchase Order Telah Dibuat</p>
                  <p className="text-sm text-green-700 font-mono">{po.poNumber}</p>
                </div>
              </div>
              <Link href={`/marketplace/my-purchase-orders/${po.id}`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 shrink-0">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Lihat PO
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Customer Review Action Banner */}
        {isCustomerReview && (
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Penawaran Menunggu Persetujuan Anda</p>
                  <p className="text-sm text-orange-700 mt-0.5">
                    Admin telah memilih vendor terbaik. Tinjau detail penawaran di bawah lalu berikan keputusan Anda.
                  </p>
                </div>
              </div>

              {!showRejectForm ? (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1.5" />
                    {approveMutation.isPending ? "Memproses…" : "Setujui & Buat PO"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => setShowRejectForm(true)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1.5" />
                    Tolak
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">Alasan penolakan (opsional):</label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan agar admin dapat mengevaluasi ulang..."
                    rows={3}
                    className="resize-none bg-white border-orange-200"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                      disabled={rejectMutation.isPending}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? "Memproses…" : "Konfirmasi Tolak"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Progress RFQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                {visibleSteps.map((step, idx) => {
                  const stepIdx = statusOrder.indexOf(step.key);
                  const done    = currentIdx >= stepIdx;
                  const active  = currentIdx === stepIdx;
                  const isLast  = idx === visibleSteps.length - 1;
                  const Icon    = step.icon;
                  const activeCr = active && isCustomerReview;

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        <div className={`flex-1 h-0.5 ${idx === 0 ? "invisible" : done && !active ? "bg-green-400" : "bg-gray-200"}`} />
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors
                          ${done ? (activeCr ? "bg-orange-500" : "bg-green-500") : "bg-gray-200"}`}>
                          <Icon className={`w-3.5 h-3.5 ${done ? "text-white" : "text-gray-400"}`} />
                        </div>
                        <div className={`flex-1 h-0.5 ${isLast ? "invisible" : currentIdx > stepIdx ? "bg-green-400" : "bg-gray-200"}`} />
                      </div>
                      <p className={`text-center text-[9px] mt-1 leading-tight px-0.5 max-w-[56px]
                        ${active ? (activeCr ? "text-orange-700 font-semibold" : "text-green-700 font-semibold") : done ? "text-gray-600" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">
                RFQ ini {rfq.status === "cancelled" ? "telah dibatalkan" : "telah kedaluwarsa"}.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quotation Detail */}
        {(isCustomerReview || isAwarded) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                 Detail Harga Penawaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quotationLoading && <Skeleton className="h-40 w-full" />}

              {!quotationLoading && quotation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Vendor</p>
                      <p className="font-semibold">{quotation.vendorName ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Penawaran</p>
                      <p className="font-bold text-green-700 text-lg">{idr(quotation.grandTotal)}</p>
                    </div>
                    {quotation.paymentTerms && (
                      <div>
                        <p className="text-xs text-muted-foreground">Syarat Pembayaran</p>
                        <p className="font-medium">{quotation.paymentTerms}</p>
                      </div>
                    )}
                    {quotation.incoterm && (
                      <div>
                        <p className="text-xs text-muted-foreground">Incoterm</p>
                        <p className="font-medium">{quotation.incoterm}</p>
                      </div>
                    )}
                    {quotation.deliveryLocation && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Lokasi Pengiriman</p>
                        <p className="font-medium">{quotation.deliveryLocation}</p>
                      </div>
                    )}
                    {quotation.quotationNumber && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">No. Quotation Vendor</p>
                        <p className="font-mono text-xs">{quotation.quotationNumber}</p>
                      </div>
                    )}
                  </div>

                  {quotation.lines.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rincian Item</p>
                      {quotation.lines.map((line, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{line.itemName ?? `Item #${line.rfqLineId}`}</p>
                            <p className="text-xs text-muted-foreground">
                              {line.offeredQty} × {idr(Number(line.dealUnitPrice))}
                              {line.leadTimeDays != null ? ` · ${line.leadTimeDays} hari` : ""}
                            </p>
                          </div>
                           <p className="font-semibold text-sm shrink-0">{idr(Number(line.dealSubtotal))}</p>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-sm pt-1 border-t">
                        <span>Total</span>
                        <span className="text-green-700">{idr(quotation.grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  {quotation.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-xs font-semibold text-blue-600 mb-1">Catatan Vendor:</p>
                      <p className="text-blue-800">{quotation.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {!quotationLoading && !quotation && (
                <p className="text-muted-foreground text-sm">Detail quotation tidak tersedia.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* RFQ Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Info RFQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            {rfq.buyer_company && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perusahaan</span>
                <span className="font-medium">{rfq.buyer_company}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Pembeli</span>
              <span className="font-medium">{rfq.buyer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Dibuat</span>
              <span>{fmtDate(rfq.created_at)}</span>
            </div>
            {rfq.required_delivery_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperlukan Tgl</span>
                <span className="font-medium text-orange-700">{fmtDate(rfq.required_delivery_date)}</span>
              </div>
            )}
            {rfq.delivery_address && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Alamat Pengiriman</span>
                <span className="text-right">
                  {rfq.delivery_address}
                  {mapsLink(rfq.destination_place_id, rfq.destination_lat, rfq.destination_lng) && (
                    <a
                      className="block text-xs text-blue-600 hover:underline mt-1"
                      href={mapsLink(rfq.destination_place_id, rfq.destination_lat, rfq.destination_lng)!}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka di Google Maps
                    </a>
                  )}
                </span>
              </div>
            )}
            {rfq.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-xs mb-1">Catatan:</p>
                <p className="text-gray-700">{rfq.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
