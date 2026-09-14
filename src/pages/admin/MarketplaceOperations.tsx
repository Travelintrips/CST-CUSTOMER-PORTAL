import { useEffect, useMemo, useState } from "react";
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
  updatedAt?: string | null;
  vendorUnitPrice?: string | number | null;
  dealTotal?: number | null;
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
  status: string;
  grandTotal: string | number;
  vendorName?: string | null;
  vendorNameSnapshot?: string | null;
  rfqNumber?: string | null;
  createdAt: string;
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

function StatusBadge({ value }: { value: string | null | undefined }) {
  const tone = value === "completed" || value === "approved" || value === "submitted"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
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
      const result = await api<Shipment[]>(`/api/mkt/admin/purchase-orders/${po.id}/shipments`);
      setShipments(result);
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
                  <div className="rounded-lg border p-3"><p className="text-xs text-slate-500">Approve & invite vendor</p><div className="mt-2 flex gap-2"><Input placeholder="Vendor ID, pisahkan koma" value={vendorIds} onChange={(e) => setVendorIds(e.target.value)} /><button className="rounded-md bg-indigo-600 px-3 text-sm text-white disabled:opacity-50" disabled={working} onClick={approveAndInvite}><Users className="mr-1 inline h-4 w-4" />Proses</button></div></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-slate-500">Status customer</p><div className="mt-2"><StatusBadge value={selectedRfq.rfqStatus} /> <span className="ml-2 text-sm text-slate-600">{selectedRfq.rfqStatus === "customer_review" ? "Menunggu approve/reject customer" : "Tidak ada bypass admin"}</span></div></div>
                </div>
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
        <CardHeader><CardTitle className="text-base">Purchase orders & fulfillment</CardTitle><CardDescription>PO dibuat oleh customer approval canonical. Admin dapat mengelola state fulfillment setelah PO tersedia.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="space-y-2">
            {purchaseOrders.length === 0 ? <p className="text-sm text-slate-500">Belum ada PO.</p> : purchaseOrders.map((po) => <button key={po.id} onClick={() => void selectPo(po)} className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${selectedPo?.id === po.id ? "border-indigo-500 bg-indigo-50" : ""}`}><span><span className="block font-mono text-sm font-semibold">{po.poNumber}</span><span className="text-xs text-slate-500">{po.vendorNameSnapshot || po.vendorName || "Vendor"} · {po.grandTotal}</span></span><StatusBadge value={po.status} /></button>)}
          </div>
          <div className="space-y-4">
            {!selectedPo ? <p className="text-sm text-slate-500">Pilih PO untuk melihat shipment, tracking, POD, dan receipt.</p> : <>
              <div className="flex flex-wrap gap-2">{["issue", "production", "ready-to-ship", "in-transit", "delivered", "complete", "close"].map((action) => <button key={action} onClick={() => transitionPo(action)} disabled={working} className="rounded-md border px-2.5 py-1.5 text-xs disabled:opacity-50">{action}</button>)}</div>
              <div className="rounded-lg border p-3 space-y-3">
                <p className="font-semibold"><Truck className="mr-1 inline h-4 w-4" />Shipment & tracking</p>
                <div className="grid gap-2 md:grid-cols-3"><Input placeholder="Tipe shipment" value={shipmentType} onChange={(e) => setShipmentType(e.target.value)} /><Input placeholder="Carrier" value={carrierName} onChange={(e) => setCarrierName(e.target.value)} /><Input placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} /></div>
                <button onClick={createShipment} disabled={working} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50">Buat shipment</button>
                {shipments.map((shipment) => <div key={shipment.id} className="rounded-md bg-slate-50 p-3 text-sm"><div className="flex items-center justify-between"><span className="font-medium">{shipment.shipmentNumber}</span><StatusBadge value={shipment.shipmentStatus} /></div><p className="text-xs text-slate-500">{shipment.carrierName || "Carrier belum diisi"} · {shipment.trackingNumber || "Tracking belum diisi"}</p><div className="mt-3 flex flex-wrap gap-2"><select className="rounded-md border px-2 py-1 text-xs" value={eventType} onChange={(e) => setEventType(e.target.value)}><option value="packing">packing</option><option value="loaded">loaded</option><option value="departed">departed</option><option value="customs">customs</option><option value="warehouse">warehouse</option><option value="arrived">arrived</option><option value="delivered">delivered</option></select><Input className="max-w-xs" placeholder="Catatan tracking" value={eventNote} onChange={(e) => setEventNote(e.target.value)} /><button onClick={() => appendEvent(shipment)} disabled={working} className="rounded-md border px-2 py-1 text-xs">Tambah event</button></div><div className="mt-3 flex items-center gap-2"><Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setPodFile(e.target.files?.[0] ?? null)} /><button onClick={() => uploadPod(shipment)} disabled={working || !podFile} className="rounded-md border px-2 py-1 text-xs disabled:opacity-50"><Upload className="mr-1 inline h-3.5 w-3.5" />POD</button><button onClick={() => createGoodsReceipt(shipment)} disabled={working || shipmentItems.length === 0} className="rounded-md border px-2 py-1 text-xs disabled:opacity-50"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Goods receipt</button></div></div>)}
                {selectedPoShipment && shipmentItems.length > 0 && <p className="text-xs text-slate-500">{shipmentItems.length} item shipment siap untuk goods receipt melalui flow canonical.</p>}
              </div>
              <div className="rounded-lg border bg-amber-50 p-3 text-sm"><p className="font-semibold">Payment gate</p><p className="mt-1 text-slate-600">Upload proof dan verify/reject payment customer belum memiliki resource `mkt_*` canonical di backend saat audit ini. UI tidak mengaktifkan endpoint lama agar shipment tidak bisa melewati gate pembayaran secara diam-diam.</p></div>
            </>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
