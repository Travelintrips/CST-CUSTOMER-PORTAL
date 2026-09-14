import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGetLogisticOrder, useUpdateLogisticOrderStatus, getGetLogisticOrderQueryKey } from "@shared/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_COLORS, OrderStatus } from "@/lib/services-data";
import { ArrowLeft, Package, Ship, User, FileText, RefreshCw, Send, Users, GitCompare, CheckCircle2, Clock3, XCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchAndStoreProfile } from "@/lib/auth";

type RfqStatus = string;

interface RfqVendor {
  id: number;
  name: string;
  phone: string | null;
  serviceType: string | null;
  hasMatchingCatalog?: boolean;
  matchedCatalogItems?: Array<{ id: number; name: string; unit: string | null; priceBase: number }>;
  alreadyBlasted?: boolean;
}

interface RfqDetailData {
  rfqId: number;
  rfqNumber: string;
  rfqStatus: RfqStatus;
  responseDeadline: string | null;
  order: { id: number; orderNumber: string; customerName: string; status: string; subtotal: number; tax: number; grandTotal: number };
  orderItems: Array<{ id: number; serviceName: string; subtotal: number; inputData: Record<string, unknown>; calculatorType: string }>;
  vendors: RfqVendor[];
  vendorStats: { total: number; waiting: number; answered: number; rejected: number };
}

interface RfqComparisonData {
  rfqId: number;
  rfqNumber: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  serviceType: string;
  origin: string;
  destination: string;
  commodity: string | null;
  rfqStatus: RfqStatus;
  quotedPrice: number | null;
  quotedAt: string | null;
  quoteNotes: string | null;
  customerResponseNotes: string | null;
  customerRespondedAt: string | null;
  finalSellingPrice: number | null;
  stats: { total: number; answered: number; pending: number; rejected: number; counterOffer: number; expired: number; selected: number };
  vendors: Array<{
    linkId: number;
    vendorId: number;
    vendorName: string;
    phone: string | null;
    status: string;
    basicPrice: number | null;
    offeredPrice: number | null;
    eta: string | null;
    notes: string | null;
    leadTimeDays: number | null;
    stockAvailability: string;
    vendorRating: number | null;
    recommendationScore: number | null;
    ontimePercentage: number | null;
    isNewUpdate: boolean;
    submittedAt: string | null;
    expiredAt: string | null;
    formUrl: string;
  }>;
  activities: Array<{ id: number; actorType: string; actorName: string; action: string; description: string; createdAt: string }>;
}

const adminRfqFetch = async (url: string, opts: RequestInit = {}) => {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  return fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
};

async function parseRfqResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const missing = Array.isArray(body.missingFields) ? ` (${body.missingFields.join(", ")})` : "";
    throw new Error(`${body.message || "Permintaan RFQ gagal"}${missing}`);
  }
  return body;
}

function rfqStatusClass(status: string) {
  if (["customer_approved", "closed"].includes(status)) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (["customer_rejected", "cancelled"].includes(status)) return "bg-red-100 text-red-800 border-red-200";
  if (["customer_quoted", "vendor_selected"].includes(status)) return "bg-purple-100 text-purple-800 border-purple-200";
  if (["vendor_blasted", "customer_revision_requested"].includes(status)) return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function readableRfqStatus(status: string) {
  return status.replaceAll("_", " ");
}

function RfqWorkflowPanel({ orderId, orderGrandTotal, onOrderRefresh }: { orderId: number; orderGrandTotal: number; onOrderRefresh: () => void }) {
  const { toast } = useToast();
  const [rfqId, setRfqId] = useState<number | null>(null);
  const [detail, setDetail] = useState<RfqDetailData | null>(null);
  const [comparison, setComparison] = useState<RfqComparisonData | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [sellingPrice, setSellingPrice] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [rfqNotes, setRfqNotes] = useState("");
  const [deadlineHours, setDeadlineHours] = useState("48");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  const loadRfq = async (requestedId?: number | null) => {
    setLoading(true);
    try {
      let currentId = requestedId ?? rfqId;
      if (!currentId) {
        const listResponse = await adminRfqFetch(`/api/logistic/rfq/by-order/${orderId}`);
        const list = await parseRfqResponse(listResponse) as Array<{ rfqId: number; status: string }>;
        currentId = list[0]?.rfqId ?? null;
        if (currentId) setRfqId(currentId);
      }
      if (!currentId) {
        setDetail(null);
        setComparison(null);
        return;
      }

      const [detailResponse, comparisonResponse] = await Promise.all([
        adminRfqFetch(`/api/logistic/rfq/${currentId}/detail`),
        adminRfqFetch(`/api/logistic/rfq/${currentId}/comparison`),
      ]);
      const nextDetail = await parseRfqResponse(detailResponse) as RfqDetailData;
      const nextComparison = await parseRfqResponse(comparisonResponse) as RfqComparisonData;
      setDetail(nextDetail);
      setComparison(nextComparison);
      setSellingPrice((nextComparison.quotedPrice ?? nextComparison.finalSellingPrice ?? orderGrandTotal)?.toString() ?? "");
      setQuoteNotes(nextComparison.quoteNotes ?? "");
      setSelectedVendorIds((previous) => previous.length
        ? previous
        : nextDetail.vendors.filter((v) => Boolean(v.phone) && !v.alreadyBlasted && v.hasMatchingCatalog).map((v) => v.id));
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Gagal memuat workflow RFQ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRfq(); }, [orderId]);

  // Vendor responses and customer approval are delivered through the existing portal SSE stream.
  useEffect(() => {
    if (!rfqId) return;
    const es = new EventSource("/api/ecommerce/events");
    const refresh = () => { void loadRfq(rfqId); onOrderRefresh(); };
    ["vendor_quote_received", "vendor_response", "order_status_update", "logistic_order_status_changed"].forEach((eventName) => {
      es.addEventListener(eventName, refresh);
    });
    return () => es.close();
  }, [rfqId, onOrderRefresh]);

  const availableVendors = useMemo(
    () => detail?.vendors.filter((vendor) => Boolean(vendor.phone) && !vendor.alreadyBlasted) ?? [],
    [detail],
  );

  const runAction = async (label: string, url: string, options: RequestInit, after?: (body: any) => void) => {
    setBusy(label);
    try {
      const body = await parseRfqResponse(await adminRfqFetch(url, options));
      after?.(body);
      toast({ title: `${label} berhasil` });
      await loadRfq(body.rfqId ?? rfqId);
      onOrderRefresh();
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : `${label} gagal`, variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const createRfq = () => runAction(
    "RFQ dibuat",
    `/api/logistic/rfq/create-from-order/${orderId}`,
    { method: "POST", body: JSON.stringify({ notes: rfqNotes.trim() || undefined, responseDeadlineHours: Number(deadlineHours) || 48 }) },
    (body) => setRfqId(body.rfqId),
  );

  const sendRfq = () => {
    if (!rfqId || selectedVendorIds.length === 0) {
      toast({ title: "Pilih minimal satu vendor yang memiliki nomor WhatsApp", variant: "destructive" });
      return;
    }
    return runAction("RFQ dikirim", `/api/logistic/rfq/${rfqId}/blast`, {
      method: "POST",
      body: JSON.stringify({ vendorIds: selectedVendorIds, deadlineHours: Number(deadlineHours) || 48 }),
    });
  };

  const reblast = () => rfqId && runAction("RFQ dikirim ulang", `/api/logistic/rfq/${rfqId}/reblast-all`, {
    method: "POST",
    body: JSON.stringify({ deadlineHours: Number(deadlineHours) || 48 }),
  });

  const selectVendor = (linkId: number) => {
    if (!rfqId) return;
    return runAction("Vendor dipilih", `/api/logistic/rfq/${rfqId}/select-vendor`, {
      method: "POST",
      body: JSON.stringify({ linkId, sellingPrice: sellingPrice ? Number(sellingPrice) : undefined }),
    });
  };

  const sendCustomerQuote = () => {
    if (!rfqId || !sellingPrice || Number(sellingPrice) <= 0) {
      toast({ title: "Isi harga penawaran customer terlebih dahulu", variant: "destructive" });
      return;
    }
    return runAction("Penawaran customer dikirim", `/api/logistic/rfq/${rfqId}/send-customer-quote`, {
      method: "POST",
      body: JSON.stringify({ sellingPrice: Number(sellingPrice), quoteNotes: quoteNotes.trim() || undefined, sendWhatsApp: true }),
    });
  };

  const closeRfq = () => rfqId && runAction("RFQ ditutup", `/api/logistic/rfq/${rfqId}/close`, {
    method: "POST",
    body: JSON.stringify({ updateOrderStatus: true }),
  });

  if (loading) {
    return <div className="bg-card border border-border rounded-xl p-5 text-sm text-muted-foreground">Memuat workflow RFQ...</div>;
  }

  if (!detail || !comparison) {
    return (
      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2"><GitCompare className="w-4 h-4 text-accent" /> RFQ Vendor</h3>
            <p className="text-xs text-muted-foreground mt-1">Buat RFQ dari order ini, pilih vendor, lalu kirim permintaan penawaran.</p>
          </div>
          <Badge variant="outline">Belum ada RFQ</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Catatan RFQ (opsional)</label>
            <Textarea value={rfqNotes} onChange={(e) => setRfqNotes(e.target.value)} placeholder="Instruksi untuk vendor..." className="mt-1 min-h-[60px]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Deadline (jam)</label>
            <Input type="number" min="1" value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={createRfq} disabled={!!busy}><Package className="w-4 h-4 mr-2" />{busy || "Buat RFQ"}</Button>
        </div>
      </section>
    );
  }

  const selectedLink = comparison.vendors.find((vendor) => vendor.status === "selected");
  const canSelect = ["vendor_blasted", "customer_revision_requested"].includes(comparison.rfqStatus);
  const canQuote = ["vendor_selected", "customer_revision_requested"].includes(comparison.rfqStatus) && Boolean(selectedLink);

  return (
    <section className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><GitCompare className="w-4 h-4 text-accent" /> RFQ Workflow</h3>
            <Badge variant="outline" className="font-mono">{detail.rfqNumber}</Badge>
            <Badge className={`border ${rfqStatusClass(comparison.rfqStatus)}`}>{readableRfqStatus(comparison.rfqStatus)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Order {comparison.orderNumber} · {comparison.origin} → {comparison.destination}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadRfq(rfqId)} disabled={!!busy}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${busy ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Pass 5: RFQ status + vendor response summary */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {[
          ["Total", comparison.stats.total, "text-foreground"],
          ["Menunggu", comparison.stats.pending, "text-amber-700"],
          ["Terjawab", comparison.stats.answered, "text-blue-700"],
          ["Counter", comparison.stats.counterOffer, "text-purple-700"],
          ["Dipilih", comparison.stats.selected, "text-emerald-700"],
          ["Expired", comparison.stats.expired, "text-red-700"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Pass 2–4: vendor selection, RFQ creation already completed, and send/reblast */}
      {canSelect && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-blue-700" /> Pilih Vendor untuk Blast</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Vendor dengan katalog yang cocok diprioritaskan. Vendor tanpa nomor WhatsApp tidak dapat dikirim.</p>
            </div>
            <span className="text-xs font-medium text-blue-700">{selectedVendorIds.length} dipilih</span>
          </div>
          {availableVendors.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-background rounded-md p-3">Semua vendor aktif sudah pernah dikirim atau belum memiliki nomor WhatsApp.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableVendors.map((vendor) => {
                const checked = selectedVendorIds.includes(vendor.id);
                return (
                  <label key={vendor.id} className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer bg-background ${checked ? "border-blue-400 ring-1 ring-blue-300" : "border-border"}`}>
                    <Checkbox checked={checked} onCheckedChange={(value) => setSelectedVendorIds((ids) => value ? [...new Set([...ids, vendor.id])] : ids.filter((id) => id !== vendor.id))} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{vendor.name}</span>
                      <span className="block text-xs text-muted-foreground">{vendor.serviceType || "Vendor logistik"} · {vendor.phone}</span>
                      {vendor.hasMatchingCatalog && <span className="block text-[11px] text-emerald-700 mt-1">Katalog cocok{vendor.matchedCatalogItems?.[0] ? ` · ${vendor.matchedCatalogItems[0].name}` : ""}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="w-full sm:w-36">
              <label className="text-xs font-medium text-muted-foreground">Deadline (jam)</label>
              <Input type="number" min="1" value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)} className="mt-1 bg-background" />
            </div>
            <Button onClick={sendRfq} disabled={!!busy || selectedVendorIds.length === 0}><Send className="w-4 h-4 mr-2" />{busy || "Kirim RFQ ke Vendor"}</Button>
            {comparison.vendors.length > 0 && <Button variant="outline" onClick={reblast} disabled={!!busy}><RefreshCw className="w-4 h-4 mr-2" />Kirim Ulang ke Semua</Button>}
          </div>
        </div>
      )}

      {/* Pass 6–7: vendor quote list and comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2"><GitCompare className="w-4 h-4 text-accent" /> Daftar Quote & Perbandingan Vendor</h4>
          <span className="text-xs text-muted-foreground">{comparison.vendors.length} vendor</span>
        </div>
        {comparison.vendors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada vendor yang menerima RFQ.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Vendor", "Status", "Harga Vendor", "ETA", "Lead time", "Rating", "Aksi"].map((heading) => <th key={heading} className="text-left text-xs font-semibold text-muted-foreground px-3 py-2.5">{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparison.vendors.map((vendor) => (
                  <tr key={vendor.linkId} className={`border-b border-border last:border-0 ${vendor.status === "selected" ? "bg-emerald-50/60" : ""}`}>
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-foreground">{vendor.vendorName}</p>
                      <p className="text-[11px] text-muted-foreground">{vendor.phone || "—"}{vendor.isNewUpdate && <span className="ml-1 text-blue-700 font-medium">· update baru</span>}</p>
                    </td>
                    <td className="px-3 py-3"><Badge variant="outline" className={`text-[11px] capitalize ${vendor.status === "selected" ? "border-emerald-300 text-emerald-700" : ""}`}>{readableRfqStatus(vendor.status)}</Badge></td>
                    <td className="px-3 py-3 text-sm font-semibold text-accent">{vendor.offeredPrice != null ? formatCurrency(vendor.offeredPrice) : vendor.basicPrice != null ? <span className="text-muted-foreground">{formatCurrency(vendor.basicPrice)} <span className="text-[10px] font-normal">(referensi)</span></span> : "—"}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{vendor.eta || "—"}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{vendor.leadTimeDays != null ? `${vendor.leadTimeDays} hari` : "—"}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{vendor.vendorRating != null ? `${vendor.vendorRating}/5` : "—"}</td>
                    <td className="px-3 py-3">
                      {canSelect && !["not_selected", "expired", "rejected"].includes(vendor.status) && (
                        <Button size="sm" variant={vendor.status === "selected" ? "secondary" : "outline"} onClick={() => void selectVendor(vendor.linkId)} disabled={!!busy || vendor.status === "selected"}>
                          {vendor.status === "selected" ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : null}{vendor.status === "selected" ? "Terpilih" : "Pilih"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pass 8: customer quote and approval state */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2"><Send className="w-4 h-4 text-purple-700" /> Penawaran & Approval Customer</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Kirim harga jual ke customer melalui workflow canonical dan WhatsApp.</p>
          </div>
          <Badge className={`border ${rfqStatusClass(comparison.rfqStatus)}`}>{readableRfqStatus(comparison.rfqStatus)}</Badge>
        </div>
        {canQuote && (
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Harga jual customer</label>
              <Input type="number" min="1" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Catatan penawaran</label>
              <Input value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)} placeholder="Catatan untuk customer (opsional)" className="mt-1 bg-background" />
            </div>
            <Button onClick={sendCustomerQuote} disabled={!!busy}><Send className="w-4 h-4 mr-2" />Kirim ke Customer</Button>
          </div>
        )}
        {comparison.quotedPrice != null && (
          <div className="rounded-md bg-background border border-purple-200 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div><p className="text-xs text-muted-foreground">Harga penawaran</p><p className="font-bold text-accent">{formatCurrency(comparison.quotedPrice)}</p></div>
            <div><p className="text-xs text-muted-foreground">Dikirim</p><p className="font-medium">{comparison.quotedAt ? new Date(comparison.quotedAt).toLocaleString("id-ID") : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Respons customer</p><p className="font-medium capitalize">{comparison.customerRespondedAt ? readableRfqStatus(comparison.rfqStatus) : "Menunggu approval"}</p></div>
          </div>
        )}
        {comparison.customerResponseNotes && <p className="text-sm bg-background border border-purple-200 rounded-md p-3"><span className="text-xs text-muted-foreground block mb-1">Catatan customer</span>{comparison.customerResponseNotes}</p>}
        {comparison.rfqStatus === "customer_approved" && (
          <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="w-4 h-4" /> Customer menyetujui penawaran. RFQ siap ditutup dan order dapat diproses.</div>
        )}
        {comparison.rfqStatus === "customer_rejected" && (
          <div className="flex items-center gap-2 text-sm text-red-700"><XCircle className="w-4 h-4" /> Customer menolak penawaran.</div>
        )}
      </div>

      {/* Pass 9: RFQ detail/activity timeline */}
      <div className="border-t border-border pt-3">
        <button className="w-full flex items-center justify-between text-sm font-semibold text-foreground" onClick={() => setShowDetail((value) => !value)}>
          <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Detail RFQ & Activity Log</span>
          {showDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showDetail && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-muted-foreground">Customer</span><p className="font-medium">{comparison.customerName}</p></div>
              <div><span className="text-muted-foreground">Tipe layanan</span><p className="font-medium">{comparison.serviceType || "—"}</p></div>
              <div><span className="text-muted-foreground">Komoditi</span><p className="font-medium">{comparison.commodity || "—"}</p></div>
              <div><span className="text-muted-foreground">Deadline</span><p className="font-medium">{detail.responseDeadline ? new Date(detail.responseDeadline).toLocaleString("id-ID") : "—"}</p></div>
            </div>
            {comparison.activities.length > 0 ? (
              <div className="space-y-2">
                {comparison.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-2 text-xs border-l-2 border-border pl-3">
                    <Clock3 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-foreground">{activity.description}</p><p className="text-muted-foreground">{activity.actorName} · {new Date(activity.createdAt).toLocaleString("id-ID")}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">Belum ada activity.</p>}
          </div>
        )}
      </div>

      {["customer_approved", "customer_rejected", "customer_revision_requested"].includes(comparison.rfqStatus) && comparison.rfqStatus !== "closed" && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={closeRfq} disabled={!!busy}><CheckCircle2 className="w-4 h-4 mr-2" />Tutup RFQ</Button>
        </div>
      )}
    </section>
  );
}

export default function AdminOrderDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const id = parseInt(params.id || "0");

  useEffect(() => {
    if (!supabase) { setLocation("/login"); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLocation("/login"); return; }
      const profile = await fetchAndStoreProfile();
      if (!profile || profile.role !== "admin") { setLocation("/dashboard"); return; }
    });
  }, [setLocation]);

  // Real-time: invalidasi order ini saat status berubah
  useEffect(() => {
    if (!id) return;
    const es = new EventSource("/api/ecommerce/events");
    es.addEventListener("logistic_order_status_changed", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.orderId === id) {
          qc.invalidateQueries({ queryKey: getGetLogisticOrderQueryKey(id) });
        }
      } catch { }
    });
    return () => es.close();
  }, [id, qc]);

  const { data: order, isLoading, refetch } = useGetLogisticOrder(id, {
    query: { enabled: !!id, queryKey: getGetLogisticOrderQueryKey(id) },
  });

  const updateStatus = useUpdateLogisticOrderStatus();

  function handleStatusChange(status: string) {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Status diperbarui: ${status}` });
          refetch();
        },
        onError: () => toast({ title: "Gagal memperbarui status", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Memuat data pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Pesanan tidak ditemukan.</p>
          <Button onClick={() => setLocation("/logistic-admin")}>Kembali ke Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => setLocation("/logistic-admin")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-foreground flex-1">Detail Pesanan</span>
          <span className="font-mono text-sm text-muted-foreground">{order.orderNumber}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Nomor Pesanan</p>
              <p className="text-2xl font-bold font-mono text-foreground">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">Dibuat: {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <Badge className={`self-start sm:self-auto ${STATUS_COLORS[order.status as OrderStatus] || "bg-gray-100 text-gray-800"} text-sm px-3 py-1`}>
                {order.status}
              </Badge>
              <div className="flex items-center gap-2">
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-48 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateStatus.isPending && (
                  <span className="text-xs text-muted-foreground">Menyimpan...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customer Info */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> Data Pemesan
            </h3>
            <div className="space-y-2">
              {[
                { label: "Perusahaan", value: order.companyName },
                { label: "PIC", value: order.customerName },
                { label: "Email", value: order.email },
                { label: "Telepon", value: order.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
                  <span className="text-sm text-foreground text-right break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Info */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Ship className="w-4 h-4 text-accent" /> Data Pengiriman
            </h3>
            <div className="space-y-2">
              {[
                { label: "Tipe", value: order.shipmentType },
                { label: "Origin", value: order.origin },
                { label: "Destination", value: order.destination },
                { label: "Komoditi", value: order.commodity || "-" },
                { label: "Required Date", value: order.requiredDate ? new Date(order.requiredDate).toLocaleDateString("id-ID") : "-" },
                { label: "Gross Weight", value: order.grossWeight ? `${order.grossWeight} kg` : "-" },
                { label: "Volume", value: order.volumeCbm ? `${order.volumeCbm} CBM` : "-" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
                  <span className="text-sm text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
            {order.cargoDescription && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deskripsi Kargo</p>
                <p className="text-sm text-foreground bg-muted/40 rounded p-2">{order.cargoDescription}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-accent" /> Catatan
            </h3>
            <p className="text-sm text-foreground bg-muted/30 rounded p-3">{order.notes}</p>
          </div>
        )}

        <RfqWorkflowPanel orderId={id} orderGrandTotal={Number(order.grandTotal) || 0} onOrderRefresh={refetch} />

        {/* Order Items */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-accent" /> Rincian Pesanan
          </h3>

          {/* Commodity */}
          {(order.commodity || order.cargoDescription) && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-0.5">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Barang / Komoditi</p>
              {order.commodity && <p className="text-sm font-semibold text-foreground">{order.commodity}</p>}
              {order.cargoDescription && <p className="text-xs text-muted-foreground">{order.cargoDescription}</p>}
            </div>
          )}

          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      {item.itemSource === "vendor_catalog_item" && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Vendor Marketplace</Badge>
                      )}
                      {item.serviceType && (
                        <Badge variant="secondary" className="text-xs">{item.serviceType}</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{item.serviceName}</p>
                    <p className="text-xs text-muted-foreground">Tipe: {item.calculatorType}</p>
                  </div>
                  <span className="font-bold text-accent text-sm flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
                {item.itemSource === "vendor_catalog_item" && !!item.priceSnapshot && typeof item.priceSnapshot === "object" && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs bg-blue-50 rounded px-2 py-1.5">
                    {!!(item.priceSnapshot as Record<string, unknown>).vendorName && (
                      <span><span className="text-muted-foreground">Vendor: </span><span className="font-medium">{String((item.priceSnapshot as Record<string, unknown>).vendorName)}</span></span>
                    )}
                    {!!(item.priceSnapshot as Record<string, unknown>).itemName && (
                      <span><span className="text-muted-foreground">Item: </span><span className="font-medium">{String((item.priceSnapshot as Record<string, unknown>).itemName)}</span></span>
                    )}
                    {(item.priceSnapshot as Record<string, unknown>).priceBase != null && (
                      <span><span className="text-muted-foreground">Harga Dasar: </span><span className="font-medium">{formatCurrency(Number((item.priceSnapshot as Record<string, unknown>).priceBase))}</span></span>
                    )}
                    {(item.priceSnapshot as Record<string, unknown>).markupPct != null && (
                      <span><span className="text-muted-foreground">Markup: </span><span className="font-medium">{String((item.priceSnapshot as Record<string, unknown>).markupPct)}%</span></span>
                    )}
                  </div>
                )}
                {typeof item.inputData === "object" && item.inputData !== null && Object.keys(item.inputData as Record<string, unknown>).length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {Object.entries(item.inputData as Record<string, unknown>)
                      .filter(([, v]) => v !== undefined && v !== null && v !== "")
                      .map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="text-muted-foreground">{k}: </span>
                          <span className="text-foreground font-medium">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          <div className="space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PPN {order.subtotal > 0 && Math.round(order.tax / order.subtotal * 1000) === 11 ? "1,1%" : "11%"}</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span className="text-foreground">Total Estimasi</span>
              <span className="text-accent text-lg">{formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic mt-3">
            Ini adalah estimasi harga. Penawaran final dikonfirmasi melalui quotation resmi.
          </p>
        </div>
      </div>
    </div>
  );
}
