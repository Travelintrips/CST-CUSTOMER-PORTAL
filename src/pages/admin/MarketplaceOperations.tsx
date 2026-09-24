import { useEffect, useMemo, useRef, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, ChevronRight, FileText, Loader2, Package, RefreshCw,
  Send, Truck, Upload, Users, Wallet,
} from "lucide-react";

type Rfq = {
  rfqId: number;
  rfqNumber: string;
  rfqStatus: string;
  approvalStatus: string | null;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  deliveryAddress: string | null;
  requiredDeliveryDate: string | null;
  notes: string | null;
  proposedQuoteId: number | null;
  winningQuoteId: number | null;
  quoteCount: number | null;
  lineCount: number | null;
  createdAt: string;
};

type Quote = {
  id: number;
  vendorName?: string | null;
  status: string;
  quoteId?: number;
  vendorId?: number;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
  updatedAt?: string | null;
  vendorUnitPrice?: string | number | null;
  dealTotal?: number | null;
  notes?: string | null;
  negotiatedNotes?: string | null;
};

type QuoteDetail = Quote & {
  rfqId: number;
  rfqStatus: string;
  lines: Array<{
    rfqLineId: number;
    itemName: string;
    offeredQty: string | number;
    vendorUnitPrice: string | number | null;
    dealUnitPrice: string | number | null;
    dealSubtotal: string | number | null;
    unit: string | null;
  }>;
};

type PurchaseOrder = {
  id: number;
  poNumber: string;
  rfqId: number;
  quoteId?: number | null;
  vendorId?: number | null;
  status: string;
  confirmedAt?: string | null;
  paymentTerms?: string | null;
  paymentTermCode?: string | null;
  paymentDpPercent?: number | null;
  paymentStatus?: string | null;
  paymentDueAt?: string | null;
  paymentProofUploadedAt?: string | null;
  paymentVerifiedAt?: string | null;
  totalAmount?: string | number | null;
  taxAmount?: string | number | null;
  grandTotal: string | number;
  currency?: string | null;
  vendorName?: string | null;
  vendorNameSnapshot?: string | null;
  rfqNumber?: string | null;
  createdAt: string;
};

type PaymentView = {
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
};
type Shipment = {
  id: number;
  shipmentNumber: string;
  shipmentStatus: string;
  shipmentType: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
};

type ShipmentItem = { id: number; poLineId: number; qty: string | number; uom: string | null };

type ApiResult<T> = { ok: boolean; data?: T; error?: string; message?: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as ApiResult<T>;
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || payload.error || `Request gagal (${response.status})`);
  }
  return (payload.data ?? payload) as T;
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function fmtMoney(value: string | number | null | undefined, currency = "IDR"): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  const tone = value === "completed" || value === "approved" || value === "submitted" || value === "paid"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : value === "partially_paid" || value === "proof_submitted"
      ? "bg-cyan-100 text-cyan-700 border-cyan-200"
      : value === "rejected" || value === "cancelled" || value === "vendor_rejected"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-amber-100 text-amber-700 border-amber-200";
  return <Badge className={`${tone} border`}>{value ?? "—"}</Badge>;
}

export function MarketplaceOperationsTab() {
  const { toast } = useToast();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<Rfq | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteDetail | null>(null);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [paymentTermDraft, setPaymentTermDraft] = useState("");
  const [paymentDpPercentDraft, setPaymentDpPercentDraft] = useState("30");
  const [paymentRejectReason, setPaymentRejectReason] = useState("");
  const deepLinkHandled = useRef(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [vendorIds, setVendorIds] = useState("");
  const [dealNotes, setDealNotes] = useState("");
  const [shipmentType, setShipmentType] = useState("trucking");
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [eventType, setEventType] = useState("departed");
  const [eventNote, setEventNote] = useState("");
  const [podFile, setPodFile] = useState<File | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [rfqRows, poRows] = await Promise.all([
        api<Rfq[]>("/api/mkt/admin/rfqs"),
        api<PurchaseOrder[]>("/api/mkt/admin/purchase-orders?limit=200"),
      ]);
      setRfqs(rfqRows);
      setPurchaseOrders(poRows);
    } catch (error) {
      toast({ title: "Marketplace gagal dimuat", description: (error as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (action: () => Promise<void>, success: string) => {
    setWorking(true);
    try {
      await action();
      toast({ title: success });
      await refresh();
    } catch (error) {
      toast({ title: "Aksi Marketplace gagal", description: (error as Error).message, variant: "destructive" });
    } finally {
      setWorking(false);
    }
  };

  const selectRfq = async (rfq: Rfq) => {
    setSelectedRfq(rfq);
    setSelectedQuote(null);
    try {
      const result = await api<Quote[]>(`/api/mkt/admin/rfqs/${rfq.rfqId}/vendor-quotes`);
      setQuotes(result);
    } catch (error) {
      toast({ title: "Quote gagal dimuat", description: (error as Error).message, variant: "destructive" });
    }
  };

  const selectQuote = async (quote: Quote) => {
    if (!selectedRfq) return;
    try {
      const result = await api<QuoteDetail>(
        `/api/mkt/admin/rfqs/${selectedRfq.rfqId}/quotes/${quote.id}/deal-price`,
      );
      setSelectedQuote(result);
      setDealNotes(result.negotiatedNotes ?? result.notes ?? "");
    } catch (error) {
      toast({ title: "Harga deal gagal dimuat", description: (error as Error).message, variant: "destructive" });
    }
  };

  const updateDealLine = (lineId: number, value: string) => {
    setSelectedQuote((current) => current ? {
      ...current,
      lines: current.lines.map((line) => line.rfqLineId === lineId
        ? { ...line, dealUnitPrice: value }
        : line),
    } : current);
  };

  const saveDealPrice = async () => {
    if (!selectedRfq || !selectedQuote) return;
    await run(async () => {
      await api(`/api/mkt/admin/rfqs/${selectedRfq.rfqId}/quotes/${selectedQuote.id}/deal-price`, {
        method: "PUT",
        body: JSON.stringify({
          expectedUpdatedAt: selectedQuote.updatedAt ?? null,
          dealNotes: dealNotes || null,
          lines: selectedQuote.lines.map((line) => ({
            rfqLineId: line.rfqLineId,
            dealUnitPrice: Number(line.dealUnitPrice),
          })),
        }),
      });
      await selectRfq(selectedRfq);
    }, "Harga deal disimpan");
  };

  const approveAndInvite = async () => {
    if (!selectedRfq) return;
    const ids = vendorIds.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
    if (ids.length === 0) {
      toast({ title: "Isi minimal satu Vendor ID", variant: "destructive" });
      return;
    }
    await run(async () => {
      await api(`/api/mkt/admin/rfqs/${selectedRfq.rfqId}/approve-and-invite`, {
        method: "POST",
        body: JSON.stringify({ vendorIds: ids }),
      });
      await selectRfq(selectedRfq);
    }, "RFQ disetujui dan undangan vendor diproses");
  };

  const sendToCustomer = async () => {
    if (!selectedRfq || !selectedQuote) return;
    await run(async () => {
      await api(`/api/mkt/admin/rfqs/${selectedRfq.rfqId}/send-to-customer`, {
        method: "POST",
        body: JSON.stringify({ quoteId: selectedQuote.id, notes: dealNotes || undefined }),
      });
      await selectRfq(selectedRfq);
    }, "Quotation dikirim ke customer");
  };

  const selectPo = async (po: PurchaseOrder) => {
    setSelectedPo(po);
    try {
      const [result, paymentResult] = await Promise.all([
        api<Shipment[]>(`/api/mkt/admin/purchase-orders/${po.id}/shipments`),
        api<PaymentView>(`/api/mkt/admin/purchase-orders/${po.id}/payment`),
      ]);
      setShipments(result);
      setPayment(paymentResult);
      setPaymentTermDraft(paymentResult.paymentTermCode ?? "");
      setPaymentDpPercentDraft(String(paymentResult.paymentDpPercent ?? 30));
      if (result[0]) {
        const detail = await api<{ items: ShipmentItem[] }>(`/api/mkt/admin/shipments/${result[0].id}`);
        setShipmentItems(detail.items ?? []);
      } else {
        setShipmentItems([]);
      }
    } catch (error) {
      toast({ title: "Detail PO gagal dimuat", description: (error as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (deepLinkHandled.current || purchaseOrders.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetPoId = Number(params.get("poId"));
    if (!Number.isInteger(targetPoId) || targetPoId <= 0) return;
    const target = purchaseOrders.find((po) => po.id === targetPoId);
    if (!target) return;

    deepLinkHandled.current = true;
    void selectPo(target);
  }, [purchaseOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPo) return;
    const params = new URLSearchParams(window.location.search);
    if (Number(params.get("poId")) !== selectedPo.id || params.get("focus") !== "payment") return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("marketplace-payment-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPo, payment]);

  const savePaymentTerms = () => {
    if (!selectedPo || !paymentTermDraft) return;
    void run(async () => {
      await api<PaymentView>(`/api/mkt/admin/purchase-orders/${selectedPo.id}/payment`, {
        method: "PUT",
        body: JSON.stringify({
          paymentTermCode: paymentTermDraft,
          paymentDpPercent: paymentTermDraft === "dp_after_receipt" ? Number(paymentDpPercentDraft) : null,
        }),
      });
      await selectPo(selectedPo);
    }, "Syarat pembayaran disimpan");
  };

  const verifyPayment = () => {
    if (!selectedPo) return;
    void run(async () => {
      await api<PaymentView>(`/api/mkt/admin/purchase-orders/${selectedPo.id}/payment/verify`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await selectPo(selectedPo);
    }, "Pembayaran diverifikasi");
  };

  const rejectPayment = () => {
    if (!selectedPo || !paymentRejectReason.trim()) {
      toast({ title: "Isi alasan penolakan bukti pembayaran", variant: "destructive" });
      return;
    }
    void run(async () => {
      await api<PaymentView>(`/api/mkt/admin/purchase-orders/${selectedPo.id}/payment/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: paymentRejectReason.trim() }),
      });
      setPaymentRejectReason("");
      await selectPo(selectedPo);
    }, "Bukti pembayaran ditolak");
  };

  const transitionPo = (action: string) => {
    if (!selectedPo) return;
    void run(async () => {
      await api(`/api/mkt/admin/purchase-orders/${selectedPo.id}/${action}`, { method: "POST" });
      await selectPo(selectedPo);
    }, `PO ${action} diproses`);
  };

  const createShipment = () => {
    if (!selectedPo) return;
    void run(async () => {
      const lines = await api<Array<{ id: number; qty: string | number; unit: string | null }>>(
        `/api/mkt/admin/purchase-orders/${selectedPo.id}/lines`,
      );
      await api(`/api/mkt/admin/purchase-orders/${selectedPo.id}/shipments`, {
        method: "POST",
        headers: { "Idempotency-Key": `portal-admin-shipment:${selectedPo.id}` },
        body: JSON.stringify({
          shipmentType,
          carrierName: carrierName || null,
          trackingNumber: trackingNumber || null,
          items: lines.map((line, index) => ({
            poLineId: line.id,
            lineNumber: index + 1,
            qty: Number(line.qty),
            uom: line.unit,
          })),
        }),
      });
      await selectPo(selectedPo);
    }, "Shipment dibuat");
  };

  const appendEvent = (shipment: Shipment) => {
    void run(async () => {
      await api(`/api/mkt/admin/shipments/${shipment.id}/events`, {
        method: "POST",
        headers: { "Idempotency-Key": `portal-admin-event:${shipment.id}:${eventType}:${eventNote}` },
        body: JSON.stringify({ eventType, note: eventNote || null }),
      });
      setEventNote("");
    }, "Tracking event ditambahkan");
  };

  const createGoodsReceipt = (shipment: Shipment) => {
    if (shipmentItems.length === 0) {
      toast({ title: "Item shipment belum tersedia", variant: "destructive" });
      return;
    }
    void run(async () => {
      await api(`/api/mkt/admin/shipments/${shipment.id}/goods-receipts`, {
        method: "POST",
        headers: { "Idempotency-Key": `portal-admin-receipt:${shipment.id}` },
        body: JSON.stringify({
          receiptType: "full",
          inspectionStatus: "passed",
          items: shipmentItems.map((item) => ({
            shipmentItemId: item.id,
            receivedQty: Number(item.qty),
            acceptedQty: Number(item.qty),
            rejectedQty: 0,
            condition: "GOOD",
          })),
        }),
      });
      await selectPo(selectedPo!);
    }, "Goods receipt tersimpan");
  };

  const uploadPod = (shipment: Shipment) => {
    if (!podFile) {
      toast({ title: "Pilih file POD terlebih dahulu", variant: "destructive" });
      return;
    }
    void run(async () => {
      const form = new FormData();
      form.append("file", podFile);
      const response = await fetch(`/api/mkt/admin/shipments/${shipment.id}/pod`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: form,
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({})) as ApiResult<unknown>).error || "Upload POD gagal");
      setPodFile(null);
    }, "POD tersimpan");
  };

  const selectedPoShipment = shipments[0];
  const selectedRfqPo = useMemo(
    () => selectedRfq ? purchaseOrders.find((po) => po.rfqId === selectedRfq.rfqId) ?? null : null,
    [purchaseOrders, selectedRfq],
  );
  const rfqSummary = useMemo(() => ({
    pending: rfqs.filter((rfq) => ["submitted", "approved", "quoted", "customer_review"].includes(rfq.rfqStatus)).length,
    review: rfqs.filter((rfq) => rfq.rfqStatus === "customer_review").length,
    activePo: purchaseOrders.filter((po) => !["completed", "closed", "cancelled"].includes(po.status)).length,
  }), [rfqs, purchaseOrders]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-indigo-600" />Marketplace Operations</CardTitle>
            <CardDescription>Operasikan RFQ, quotation, customer review, PO, shipment, tracking, POD, dan goods receipt dari Customer Portal. Semua aksi memakai lifecycle mkt_* canonical.</CardDescription>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
          </button>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-slate-50 p-3"><p className="text-xs text-slate-500">RFQ aktif</p><p className="text-2xl font-bold">{rfqSummary.pending}</p></div>
          <div className="rounded-lg border bg-amber-50 p-3"><p className="text-xs text-slate-500">Menunggu customer</p><p className="text-2xl font-bold">{rfqSummary.review}</p></div>
          <div className="rounded-lg border bg-indigo-50 p-3"><p className="text-xs text-slate-500">PO berjalan</p><p className="text-2xl font-bold">{rfqSummary.activePo}</p></div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Card>
          <CardHeader><CardTitle className="text-base">RFQ & quotation</CardTitle><CardDescription>Approve/invite vendor, review quote, set deal price, lalu kirim ke customer.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : rfqs.length === 0 ? <p className="text-sm text-slate-500">Belum ada RFQ.</p> : rfqs.map((rfq) => (
              <button key={rfq.rfqId} onClick={() => void selectRfq(rfq)} className={`w-full rounded-lg border p-3 text-left transition ${selectedRfq?.rfqId === rfq.rfqId ? "border-indigo-500 bg-indigo-50" : "hover:border-slate-300"}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-sm font-semibold">{rfq.rfqNumber}</span><StatusBadge value={rfq.rfqStatus} /></div>
                <p className="mt-1 text-sm text-slate-600">{rfq.buyerCompany || rfq.buyerName || "Buyer"} · {rfq.quoteCount ?? 0} quote</p>
                <p className="mt-1 text-xs text-slate-400">{fmtDate(rfq.createdAt)} · approval <StatusBadge value={rfq.approvalStatus} /></p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{selectedRfq ? `Operasi ${selectedRfq.rfqNumber}` : "Pilih RFQ"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!selectedRfq ? <p className="text-sm text-slate-500">Pilih RFQ di sebelah kiri untuk melihat quote dan menjalankan aksi.</p> : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {["customer_review", "awarded"].includes(selectedRfq.rfqStatus) && (selectedQuote || selectedRfqPo) ? (
                    <div className="rounded-lg border bg-indigo-50 p-3">
                      <p className="text-xs text-slate-500">Vendor / quotation terpilih</p>
                      <p className="mt-1 font-semibold">{selectedQuote?.vendorName || selectedRfqPo?.vendorName || "Vendor"}</p>
                      <p className="text-xs text-slate-600">
                        {selectedQuote?.vendorId ? `Vendor #${selectedQuote.vendorId}` : selectedRfqPo?.vendorId ? `Vendor #${selectedRfqPo.vendorId}` : "—"}
                        {selectedQuote?.id ? ` · Quote #${selectedQuote.id}` : selectedRfqPo?.quoteId ? ` · Quote #${selectedRfqPo.quoteId}` : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-slate-500">Approve & invite vendor</p>
                      <div className="mt-2 flex gap-2">
                        <Input placeholder="Vendor ID, pisahkan koma" value={vendorIds} onChange={(e) => setVendorIds(e.target.value)} />
                        <button className="rounded-md bg-indigo-600 px-3 text-sm text-white disabled:opacity-50" disabled={working} onClick={approveAndInvite}><Users className="mr-1 inline h-4 w-4" />Proses</button>
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500">Status customer</p>
                    <div className="mt-2">
                      <StatusBadge value={selectedRfq.rfqStatus} />
                      <span className="ml-2 text-sm text-slate-600">
                        {selectedRfq.rfqStatus === "customer_review"
                          ? "Menunggu approve/reject customer"
                          : selectedRfq.rfqStatus === "awarded"
                            ? "Customer sudah menyetujui · PO telah dibuat"
                            : "Belum masuk tahap keputusan customer"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Informasi customer</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="text-slate-500">Nama:</span> {selectedRfq.buyerName || "—"}</p>
                      <p><span className="text-slate-500">Perusahaan:</span> {selectedRfq.buyerCompany || "—"}</p>
                      <p><span className="text-slate-500">Email:</span> {selectedRfq.buyerEmail || "—"}</p>
                      <p><span className="text-slate-500">Telepon:</span> {selectedRfq.buyerPhone || "—"}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pengiriman</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="text-slate-500">Alamat:</span> {selectedRfq.deliveryAddress || "—"}</p>
                      <p><span className="text-slate-500">Dibutuhkan:</span> {fmtDate(selectedRfq.requiredDeliveryDate)}</p>
                    </div>
                  </div>
                </div>

                {(selectedQuote || selectedRfqPo) && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ringkasan transaksi</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="text-slate-500">Produk:</span> {selectedQuote?.lines?.[0]?.itemName || "—"}</p>
                        <p><span className="text-slate-500">Qty:</span> {selectedQuote?.lines?.[0] ? `${selectedQuote.lines[0].offeredQty} ${selectedQuote.lines[0].unit || ""}` : "—"}</p>
                        <p><span className="text-slate-500">Harga vendor:</span> {selectedQuote?.lines?.[0] ? fmtMoney(selectedQuote.lines[0].vendorUnitPrice) : "—"}</p>
                        <p><span className="text-slate-500">Harga deal:</span> {selectedQuote?.lines?.[0] ? fmtMoney(selectedQuote.lines[0].dealUnitPrice) : "—"}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-blue-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Purchase Order</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="text-slate-500">Nomor:</span> {selectedRfqPo?.poNumber || "Belum dibuat"}</p>
                        <p><span className="text-slate-500">Total:</span> {selectedRfqPo ? fmtMoney(selectedRfqPo.grandTotal, selectedRfqPo.currency || "IDR") : "—"}</p>
                        <p className="flex items-center gap-2"><span className="text-slate-500">Status:</span> <StatusBadge value={selectedRfqPo?.status} /></p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Vendor quotes</p>
                  {quotes.length === 0 ? <p className="text-sm text-slate-500">Belum ada quote vendor.</p> : quotes.map((quote) => (
                    <button key={quote.id} onClick={() => void selectQuote(quote)} className={`flex w-full items-center justify-between rounded-md border p-2 text-left ${selectedQuote?.id === quote.id ? "border-indigo-500 bg-indigo-50" : ""}`}>
                      <span><span className="font-medium">{quote.vendorName || `Quote #${quote.id}`}</span><span className="ml-2 text-xs text-slate-500">#{quote.id}</span></span><StatusBadge value={quote.status} />
                    </button>
                  ))}
                </div>
                {selectedQuote && (
                  <div className="rounded-lg border bg-slate-50 p-3 space-y-3">
                    <div className="flex items-center justify-between"><p className="font-semibold">Deal price · {selectedQuote.vendorName}</p><StatusBadge value={selectedQuote.status} /></div>
                    {selectedQuote.lines.map((line) => <div key={line.rfqLineId} className="grid grid-cols-[1fr_130px] items-center gap-2"><div><p className="text-sm">{line.itemName}</p><p className="text-xs text-slate-500">Qty {line.offeredQty} {line.unit || ""} · vendor {line.vendorUnitPrice ?? "—"}</p></div><Input type="number" min="0.01" value={line.dealUnitPrice ?? ""} onChange={(e) => updateDealLine(line.rfqLineId, e.target.value)} /></div>)}
                    <Textarea placeholder="Catatan deal / quotation" value={dealNotes} onChange={(e) => setDealNotes(e.target.value)} />
                    <div className="flex flex-wrap gap-2"><button className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white disabled:opacity-50" disabled={working} onClick={() => void saveDealPrice()}><Wallet className="mr-1 inline h-4 w-4" />Simpan deal price</button><button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50" disabled={working} onClick={() => void sendToCustomer()}><Send className="mr-1 inline h-4 w-4" />Kirim ke customer</button></div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Purchase orders & fulfillment</CardTitle><CardDescription>Admin memantau alur canonical Customer → Vendor → Customer. Fulfillment normal dijalankan vendor pada shipment yang dipilih customer; admin menangani monitoring dan exception.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="space-y-2">
            {purchaseOrders.length === 0 ? <p className="text-sm text-slate-500">Belum ada PO.</p> : purchaseOrders.map((po) => <button key={po.id} onClick={() => void selectPo(po)} className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${selectedPo?.id === po.id ? "border-indigo-500 bg-indigo-50" : ""}`}><span><span className="block font-mono text-sm font-semibold">{po.poNumber}</span><span className="text-xs text-slate-500">{po.vendorNameSnapshot || po.vendorName || "Vendor"} · {po.grandTotal}</span></span><StatusBadge value={po.status} /></button>)}
          </div>
          <div className="space-y-4">

            {!selectedPo ? (
              <p className="text-sm text-slate-500">Pilih PO untuk melihat siapa yang harus melakukan langkah berikutnya.</p>
            ) : (
              <>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Langkah berikutnya</p>
                  {(() => {
                    const hasShipment = shipments.length > 0;
                    const vendorConfirmed = Boolean(selectedPo.confirmedAt);
                    if (!vendorConfirmed && ["production", "ready_to_ship", "in_transit"].includes(selectedPo.status)) {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Vendor · Konfirmasi Purchase Order</p>
                          <p className="mt-1 text-sm text-indigo-800">PO lama sudah masuk fulfillment tetapi konfirmasi vendor belum tercatat. Vendor harus membuka PO dan menekan Konfirmasi PO sebelum melanjutkan shipment.</p>
                        </div>
                      );
                    }
                    if (selectedPo.status === "issued") {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Vendor · Terima / Tolak / Minta Revisi</p>
                          <p className="mt-1 text-sm text-indigo-800">Customer belum boleh memilih metode pengiriman sebelum vendor menerima PO.</p>
                        </div>
                      );
                    }
                    if (selectedPo.status === "vendor_accepted" && !hasShipment) {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Customer · Pilih metode pengiriman</p>
                          <p className="mt-1 text-sm text-indigo-800">Vendor sudah menerima PO. Customer sekarang memilih Ambil sendiri, Trucking, Kargo udara, Kargo laut, atau Door to door.</p>
                        </div>
                      );
                    }
                    if (hasShipment && selectedPo.status === "ready_to_ship" && payment?.termsMissing) {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Admin · Tetapkan syarat pembayaran</p>
                          <p className="mt-1 text-sm text-indigo-800">Barang sudah siap, tetapi syarat pembayaran belum ada. Vendor tidak boleh menyerahkan/mengirim sampai aturan pembayaran ditetapkan.</p>
                        </div>
                      );
                    }
                    if (hasShipment && selectedPo.status === "ready_to_ship" && payment?.requiresClearanceBeforeHandover && payment.paymentStatus !== "paid") {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">{payment.paymentStatus === "proof_submitted" ? "Admin · Verifikasi pembayaran" : "Customer · Lakukan pembayaran"}</p>
                          <p className="mt-1 text-sm text-indigo-800">Terms mewajibkan lunas sebelum handover. Setelah status pembayaran Lunas, vendor dapat menyerahkan/mengirim barang.</p>
                        </div>
                      );
                    }
                    if (["vendor_accepted", "production", "ready_to_ship", "in_transit"].includes(selectedPo.status) && hasShipment) {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Vendor · Proses fulfillment pada shipment yang sama</p>
                          <p className="mt-1 text-sm text-indigo-800">Vendor menyiapkan barang, memperbarui status pengiriman/pengambilan, lalu mengunggah POD setelah barang tiba atau diserahkan.</p>
                        </div>
                      );
                    }
                    if (["delivered", "partially_delivered", "rejected_goods"].includes(selectedPo.status)) {
                      return (
                        <div className="mt-2">
                          <p className="font-semibold text-indigo-950">Customer · Konfirmasi Goods Receipt</p>
                          <p className="mt-1 text-sm text-indigo-800">Customer memeriksa barang dan memilih diterima lengkap, diterima sebagian, atau ditolak. PO akan selesai otomatis jika seluruh qty diterima dan POD tersedia.</p>
                        </div>
                      );
                    }
                    if (selectedPo.status === "completed") {
                      return (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-indigo-950">Admin · Tutup Purchase Order</p>
                            <p className="mt-1 text-sm text-indigo-800">
                              Fulfillment sudah selesai. PO hanya dapat ditutup setelah pembayaran customer berstatus Lunas.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => transitionPo("close")}
                            disabled={working || payment?.paymentStatus !== "paid"}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Tutup PO
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="mt-2">
                        <p className="font-semibold text-indigo-950">Monitoring</p>
                        <p className="mt-1 text-sm text-indigo-800">Tidak ada aksi manual admin yang diperlukan pada tahap ini.</p>
                      </div>
                    );
                  })()}
                </div>

                <div id="marketplace-payment-panel" className="rounded-lg border-2 border-indigo-200 bg-indigo-50/30 p-4 space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold"><Wallet className="mr-1 inline h-4 w-4" />Pembayaran customer</p>
                      <p className="mt-1 text-xs text-slate-500">Pembayaran customer ke CST dipisahkan dari pembayaran CST ke vendor.</p>
                    </div>
                    <StatusBadge value={payment?.paymentStatus ?? "unpaid"} />
                  </div>

                  <div className="grid gap-2 md:grid-cols-4">
                    <div className={`rounded-lg border p-3 ${!payment?.paymentTermCode ? "border-indigo-400 bg-white" : "bg-white/70"}`}>
                      <p className="text-[11px] font-semibold uppercase text-slate-400">1. Payment terms</p>
                      <p className="mt-1 text-xs font-medium text-slate-800">{payment?.paymentTermCode ? "Sudah ditetapkan" : "Admin pilih terms"}</p>
                    </div>
                    <div className={`rounded-lg border p-3 ${payment?.paymentTermCode && !payment?.proofAvailable && payment?.paymentStatus !== "paid" ? "border-indigo-400 bg-white" : "bg-white/70"}`}>
                      <p className="text-[11px] font-semibold uppercase text-slate-400">2. Customer bayar</p>
                      <p className="mt-1 text-xs font-medium text-slate-800">
                        {payment?.paymentStatus === "paid"
                          ? "Pembayaran selesai"
                          : payment?.paylabs?.hasPendingPayment
                            ? "Paylabs menunggu pembayaran"
                            : payment?.proofAvailable
                              ? "Bukti transfer sudah ada"
                              : "Paylabs / transfer manual"}
                      </p>
                    </div>
                    <div className={`rounded-lg border p-3 ${payment?.paymentStatus === "proof_submitted" ? "border-indigo-400 bg-white" : "bg-white/70"}`}>
                      <p className="text-[11px] font-semibold uppercase text-slate-400">3. Verifikasi</p>
                      <p className="mt-1 text-xs font-medium text-slate-800">
                        {payment?.paymentStatus === "paid"
                          ? "Sudah lunas"
                          : payment?.paylabs?.hasPendingPayment
                            ? "Webhook Paylabs otomatis"
                            : "Admin verifikasi transfer"}
                      </p>
                    </div>
                    <div className={`rounded-lg border p-3 ${payment?.paymentStatus === "paid" ? "border-emerald-400 bg-white" : "bg-white/70"}`}>
                      <p className="text-[11px] font-semibold uppercase text-slate-400">4. Handover</p>
                      <p className="mt-1 text-xs font-medium text-slate-800">
                        {payment?.requiresClearanceBeforeHandover && !payment?.handoverPaymentSatisfied
                          ? "Vendor masih diblokir"
                          : payment?.paymentTermCode === "dp_after_receipt" && payment?.remainingAmount > 0
                            ? "DP terpenuhi · sisa setelah penerimaan"
                            : "Ikuti terms PO"}
                      </p>
                    </div>
                  </div>

                  {payment?.termsMissing ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-semibold text-amber-900">Syarat pembayaran belum ditetapkan</p>
                      <p className="mt-1 text-xs text-amber-800">Pilih syarat pembayaran. Handover/pengiriman akan diblokir sampai aturan pembayaran jelas.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm"><span className="text-slate-500">Terms:</span> {payment?.paymentTerms ?? "—"}</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-md bg-white p-3 text-sm">
                          <p className="text-xs text-slate-500">Total PO</p>
                          <p className="mt-1 font-semibold">{fmtMoney(payment?.amount, payment?.currency ?? selectedPo.currency ?? "IDR")}</p>
                        </div>
                        <div className="rounded-md bg-emerald-50 p-3 text-sm">
                          <p className="text-xs text-emerald-700">Sudah dibayar</p>
                          <p className="mt-1 font-semibold text-emerald-800">{fmtMoney(payment?.paidAmount, payment?.currency ?? selectedPo.currency ?? "IDR")}</p>
                        </div>
                        <div className="rounded-md bg-orange-50 p-3 text-sm">
                          <p className="text-xs text-orange-700">Sisa tagihan</p>
                          <p className="mt-1 font-semibold text-orange-800">{fmtMoney(payment?.remainingAmount, payment?.currency ?? selectedPo.currency ?? "IDR")}</p>
                        </div>
                      </div>
                      {payment?.paymentTermCode === "dp_after_receipt" && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                          DP {payment.paymentDpPercent}% · minimum sebelum handover {fmtMoney(payment.requiredBeforeHandoverAmount, payment.currency)}
                          {payment.handoverPaymentSatisfied
                            ? ` · sudah terpenuhi, sisa ${fmtMoney(payment.remainingAmount, payment.currency)} dilunasi setelah penerimaan`
                            : ` · masih kurang ${fmtMoney(payment.requiredBeforeHandoverRemaining, payment.currency)}`}
                        </div>
                      )}
                      {(payment?.overpaidAmount ?? 0) > 0 && payment && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          Kelebihan pembayaran terdeteksi: {fmtMoney(payment.overpaidAmount, payment.currency)}.
                        </div>
                      )}
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        <p><span className="text-slate-500">Jatuh tempo:</span> {fmtDate(payment?.paymentDueAt)}</p>
                        <p><span className="text-slate-500">Bukti:</span> {payment?.proofAvailable ? "Tersedia" : "Belum ada"}</p>
                      </div>
                    </div>
                  )}

                  {payment?.paylabs && (
                    <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/40 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Paylabs</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Status gateway dan callback pembayaran marketplace.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={payment.paylabs.configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                            {payment.paylabs.configured ? "Configured" : "Belum dikonfigurasi"}
                          </Badge>
                          {payment.paylabs.sandboxMode && (
                            <Badge className="bg-amber-100 text-amber-700">Sandbox</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs text-slate-500">Metode aktif</p>
                          <p className="mt-1 font-semibold">{payment.paylabs.activeMethods.length}</p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs text-slate-500">Transaksi terakhir</p>
                          <p className="mt-1 font-semibold">
                            {payment.paylabs.latestPayment?.status ?? "Belum ada"}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs text-slate-500">Channel</p>
                          <p className="mt-1 font-semibold">
                            {payment.paylabs.latestPayment?.paymentMethod ?? "—"}
                          </p>
                        </div>
                      </div>

                      {payment.paylabs.latestPayment && (
                        <div className="rounded-md bg-white p-3 text-xs text-slate-600">
                          <p>
                            Merchant ref: <span className="font-mono">{payment.paylabs.latestPayment.merchantTradeNo ?? "—"}</span>
                          </p>
                          <p className="mt-1">
                            Provider ref: <span className="font-mono">{payment.paylabs.latestPayment.providerOrderId ?? "—"}</span>
                          </p>
                          {payment.paylabs.latestPayment.paidAt && (
                            <p className="mt-1">Paid: {fmtDate(payment.paylabs.latestPayment.paidAt)}</p>
                          )}
                        </div>
                      )}

                      {!payment.paylabs.configured && (
                        <a
                          href="/admin?tab=paylabs-setting"
                          className="inline-flex rounded-md border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                        >
                          Buka Paylabs Setting
                        </a>
                      )}
                    </div>
                  )}

                  {payment?.proofAvailable && (
                    <div className="space-y-3 rounded-lg border border-indigo-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Pemeriksaan bukti pembayaran</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Bukti ini tersimpan permanen sebagai audit trail. Periksa bukti asli sebelum menyetujui pembayaran.
                          </p>
                        </div>
                        <Badge className={payment.ocrMatches ? "border-green-200 bg-green-100 text-green-700" : "border-red-200 bg-red-100 text-red-700"}>
                          {payment.ocrMatches ? "Nominal OCR Cocok" : "Perlu Pemeriksaan"}
                        </Badge>
                      </div>

                      {payment.proofUrl && payment.proofMimeType?.startsWith("image/") && (
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={payment.proofUrl}
                            alt="Bukti pembayaran customer"
                            className="max-h-[420px] w-full rounded-lg border bg-slate-50 object-contain"
                          />
                        </a>
                      )}
                      {payment.proofUrl && !payment.proofMimeType?.startsWith("image/") && (
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="inline-block text-sm font-medium text-indigo-600 underline">
                          Buka bukti pembayaran
                        </a>
                      )}

                      <div className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Nominal diajukan</p>
                          <p className="mt-1 font-semibold">{fmtMoney(payment.proofExpectedAmount, payment.currency ?? selectedPo.currency ?? "IDR")}</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Nominal hasil OCR</p>
                          <p className="mt-1 font-semibold">
                            {payment.ocrAmount == null ? "Tidak terbaca" : fmtMoney(payment.ocrAmount, payment.currency ?? selectedPo.currency ?? "IDR")}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Dikirim</p>
                          <p className="mt-1 font-semibold">{fmtDate(payment.proofUploadedAt)}</p>
                        </div>
                      </div>

                      <div className={`rounded-md p-3 text-xs ${
                        payment.ocrMatches
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}>
                        {payment.ocrMatches
                          ? "OCR membaca nominal yang sama dengan tagihan. Admin tetap wajib memeriksa bukti secara visual sebelum menyetujui."
                          : "Nominal OCR tidak cocok atau tidak terbaca. Jangan menyetujui sebelum bukti diverifikasi secara manual."}
                      </div>
                    </div>
                  )}
                  {payment?.rejectionReason && (
                    <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">Alasan penolakan terakhir: {payment.rejectionReason}</p>
                  )}

                  {payment?.paidAmount === 0 && payment?.paymentStatus !== "paid" && (
                    <div className="space-y-2 rounded-md border bg-white p-3">
                      <p className="text-xs font-semibold text-slate-700">Atur syarat pembayaran</p>
                      <div className="grid gap-2 md:grid-cols-[240px_140px_auto]">
                        <select
                          value={paymentTermDraft}
                          onChange={(e) => setPaymentTermDraft(e.target.value)}
                          className="h-10 rounded-md border bg-white px-3 text-sm"
                        >
                          <option value="">Pilih syarat pembayaran</option>
                          <option value="prepaid">Bayar penuh sebelum serah/kirim</option>
                          <option value="dp_after_receipt">DP + pelunasan setelah barang diterima</option>
                          <option value="net_7">NET 7 hari</option>
                          <option value="net_14">NET 14 hari</option>
                          <option value="net_30">NET 30 hari</option>
                        </select>
                        {paymentTermDraft === "dp_after_receipt" ? (
                          <div className="relative">
                            <Input
                              type="number"
                              min="1"
                              max="99"
                              step="1"
                              value={paymentDpPercentDraft}
                              onChange={(e) => setPaymentDpPercentDraft(e.target.value)}
                              className="pr-8"
                              placeholder="DP"
                            />
                            <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-500">%</span>
                          </div>
                        ) : <div />}
                        <button
                          type="button"
                          onClick={savePaymentTerms}
                          disabled={
                            working
                            || !paymentTermDraft
                            || (paymentTermDraft === "dp_after_receipt" && !(Number(paymentDpPercentDraft) > 0 && Number(paymentDpPercentDraft) < 100))
                          }
                          className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
                        >
                          Simpan syarat pembayaran
                        </button>
                      </div>
                      {paymentTermDraft === "dp_after_receipt" && (
                        <p className="text-xs text-slate-500">Vendor boleh handover setelah DP minimum terpenuhi. Sisa wajib dilunasi setelah customer menerima barang sebelum PO ditutup.</p>
                      )}
                    </div>
                  )}

                  {payment?.paymentStatus === "proof_submitted" && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">
                        Setujui hanya setelah bukti visual, nominal, dan transaksi benar-benar sesuai. Jika ditolak, bukti tetap tersimpan; customer hanya dapat mengirim bukti baru yang berbeda dan tidak dapat memakai ulang file yang sama.
                      </p>
                      <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={verifyPayment}
                        disabled={working}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Setujui Pembayaran
                      </button>
                      <Input
                        className="max-w-sm"
                        placeholder="Alasan jika bukti ditolak"
                        value={paymentRejectReason}
                        onChange={(e) => setPaymentRejectReason(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={rejectPayment}
                        disabled={working || !paymentRejectReason.trim()}
                        className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                      >
                        Tolak Bukti
                      </button>
                    </div>
                    </div>
                  )}

                  {payment?.paymentStatus === "paid" && (
                    <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                      {payment.verifiedBy === "paylabs:webhook"
                        ? "Pembayaran dikonfirmasi otomatis oleh Paylabs"
                        : "Pembayaran sudah diverifikasi CST"}
                      {payment.verifiedAt ? ` · ${fmtDate(payment.verifiedAt)}` : ""}.
                    </div>
                  )}
                  {payment?.paymentStatus === "partially_paid" && (
                    <div className="rounded-md bg-cyan-50 p-3 text-sm text-cyan-800">
                      Pembayaran sebagian sudah terverifikasi. Sudah dibayar {fmtMoney(payment.paidAmount, payment.currency)} dan sisa {fmtMoney(payment.remainingAmount, payment.currency)}.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold"><Truck className="mr-1 inline h-4 w-4" />Shipment canonical</p>
                    <span className="text-xs text-slate-500">{shipments.length} shipment</span>
                  </div>

                  {shipments.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-slate-600">
                      {selectedPo.status === "vendor_accepted"
                        ? "Belum ada shipment. Menunggu customer memilih metode pengiriman."
                        : "Belum ada shipment canonical untuk PO ini."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shipments.map((shipment) => {
                        const pickup = shipment.shipmentType === "pickup_self";
                        return (
                          <div key={shipment.id} className="rounded-md bg-slate-50 p-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-semibold">{shipment.shipmentNumber}</span>
                                <span className="ml-2 text-xs text-slate-500">
                                  {pickup ? "Ambil sendiri" : (shipment.shipmentType || "Pengiriman")}
                                </span>
                              </div>
                              <StatusBadge value={shipment.shipmentStatus} />
                            </div>
                            <p className="mt-2 text-xs text-slate-600">
                              {pickup
                                ? "Vendor memproses: siapkan barang → siap diambil → serahkan → POD. Customer kemudian melakukan Goods Receipt."
                                : "Vendor memproses packing, pengiriman, tiba, lalu POD. Customer kemudian melakukan Goods Receipt."}
                            </p>
                            {!pickup && (
                              <p className="mt-1 text-xs text-slate-500">
                                {shipment.carrierName || "Carrier belum diisi"} · {shipment.trackingNumber || "Tracking belum diisi"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                    Admin tidak membuat shipment kedua dan tidak membuat Goods Receipt dalam flow normal. Shipment berasal dari pilihan customer, status/POD dikerjakan vendor, dan penerimaan dikonfirmasi customer.
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
