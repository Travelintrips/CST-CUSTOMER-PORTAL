import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Package, Clock, RotateCcw, Send, Save } from "lucide-react";

interface RfqLine {
  id: number;
  itemName: string;
  itemDescription: string | null;
  itemUnit: string | null;
  requestedQty: string;
  notes: string | null;
  sortOrder: number;
}

interface QuoteLine {
  id: number;
  rfqLineId: number;
  vendorCatalogItemId: number | null;
  offeredUnitPrice: string;
  offeredQty: string;
  subtotal: string;
  currency: string | null;
  minimumOrderQty: string | null;
  validUntil: string | null;
  leadTimeDays: number | null;
  stockStatus: string | null;
  notes: string | null;
  isPartialQuote: boolean;
}

interface VendorQuoteData {
  quote: {
    id: number;
    rfqId: number;
    vendorId: number;
    status: string;
    validUntil: string | null;
    openedAt: string | null;
    submittedAt: string | null;
    quotationNumber: string | null;
    quotationDate: string | null;
    paymentTerms: string | null;
    incoterm: string | null;
    deliveryLocation: string | null;
    notes: string | null;
    requoteNotes?: string | null;
    requoteDeadline?: string | null;
    requoteRound?: number;
  };
  vendor: { id: number; name: string; phone: string | null; email: string | null };
  rfq: {
    id: number;
    rfqNumber: string;
    status: string;
    buyerName: string;
    buyerCompany: string | null;
    notes: string | null;
    deliveryAddress: string | null;
    destinationPlaceId: string | null;
    destinationLat: string | number | null;
    destinationLng: string | number | null;
    requiredDeliveryDate: string | null;
    createdAt: string;
  };
  rfqLines: RfqLine[];
  quoteLines: QuoteLine[];
  meta: { canEdit: boolean; canSubmit: boolean; allowedCurrencies: string[] };
}

type LineEdits = Record<number, { price: string; qty: string; notes: string; leadTime: string }>;

function mapsLink(placeId: string | null, lat: string | number | null, lng: string | number | null): string | null {
  if (placeId && lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}&query_place_id=${encodeURIComponent(placeId)}`;
  }
  return null;
}

const QUOTE_STATUS: Record<string, { label: string; color: string }> = {
  invited:           { label: "Undangan Terkirim",      color: "bg-blue-100 text-blue-700" },
  opened:            { label: "Link Dibuka",            color: "bg-indigo-100 text-indigo-700" },
  submitted:         { label: "Penawaran Terkirim",     color: "bg-green-100 text-green-700" },
  selected:          { label: "Dipilih",                color: "bg-emerald-100 text-emerald-700" },
  rejected:          { label: "Tidak Dipilih",          color: "bg-slate-100 text-slate-600" },
  expired:           { label: "Kadaluarsa",             color: "bg-red-100 text-red-600" },
  withdrawn:         { label: "Ditarik",                color: "bg-slate-100 text-slate-600" },
  requote_requested: { label: "Revisi Diminta",         color: "bg-orange-100 text-orange-700" },
};

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateTime(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function dateOnly(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function buildLines(
  rfqLines: RfqLine[],
  quoteLines: QuoteLine[],
  edits: LineEdits,
  defaultValidUntil: string,
) {
  return rfqLines.map((rl) => {
    const e = edits[rl.id];
    const ql = quoteLines.find((l) => l.rfqLineId === rl.id);
    const price = e ? Number(e.price) : Number(ql?.offeredUnitPrice ?? 0);
    const qty   = e ? Number(e.qty)   : Number(ql?.offeredQty ?? rl.requestedQty);
    return {
      rfqLineId:        rl.id,
      offeredUnitPrice: price,
      offeredQty:       qty,
      currency:         ql?.currency || "IDR",
      minimumOrderQty:  ql?.minimumOrderQty ? Number(ql.minimumOrderQty) : undefined,
      validUntil:       ql?.validUntil ? dateOnly(ql.validUntil) : defaultValidUntil,
      notes:            e?.notes || ql?.notes || null,
      leadTimeDays:     e?.leadTime ? Number(e.leadTime) : (ql?.leadTimeDays ?? null),
      stockStatus:      ql?.stockStatus ?? undefined,
      vendorCatalogItemId: ql?.vendorCatalogItemId ?? null,
    };
  });
}

export default function MktVendorQuotePage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [lineEdits, setLineEdits] = useState<LineEdits>({});
  const [headerNotes, setHeaderNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [editMode, setEditMode] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<{ ok: boolean; data: VendorQuoteData }>({
    queryKey: ["mkt-vendor-quote", token],
    queryFn: async () => {
      const res = await fetch(`/api/vendor-quote/${token}`);
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? t("mktVendorQuote.loadError", "Gagal memuat penawaran"));
      }
      return res.json() as Promise<{ ok: boolean; data: VendorQuoteData }>;
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!data?.data) return;
    const q = data.data.quote;
    setHeaderNotes(q.notes ?? "");
    setPaymentTerms(q.paymentTerms ?? "");
    const edits: LineEdits = {};
    data.data.quoteLines.forEach((ql) => {
      edits[ql.rfqLineId] = {
        price:    ql.offeredUnitPrice,
        qty:      ql.offeredQty,
        notes:    ql.notes ?? "",
        leadTime: String(ql.leadTimeDays ?? ""),
      };
    });
    if (Object.keys(edits).length) setLineEdits(edits);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const vqd = data!.data;
      const defaultValidUntil = dateOnly(vqd.quote.validUntil) || dateOnly(new Date().toISOString());
      const lines = buildLines(vqd.rfqLines, vqd.quoteLines, lineEdits, defaultValidUntil);
      const body = {
        quotationDate: vqd.quote.quotationDate,
        notes: headerNotes || null,
        paymentTerms: paymentTerms || null,
        lines,
      };
      const res = await fetch(`/api/vendor-quote/${token}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string; message?: string };
        throw new Error(d.message ?? d.error ?? t("mktVendorQuote.saveError", "Gagal menyimpan"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("mktVendorQuote.draftSaved", "Draft tersimpan") });
      void refetch();
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const vqd = data!.data;
      const defaultValidUntil = dateOnly(vqd.quote.validUntil) || dateOnly(new Date().toISOString());
      const lines = buildLines(vqd.rfqLines, vqd.quoteLines, lineEdits, defaultValidUntil);
      const body = {
        quotationDate: vqd.quote.quotationDate,
        notes: headerNotes || null,
        paymentTerms: paymentTerms || null,
        lines,
      };
      const res = await fetch(`/api/vendor-quote/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string; message?: string };
        throw new Error(d.message ?? d.error ?? t("mktVendorQuote.submitError", "Gagal submit penawaran"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("mktVendorQuote.submitSuccess", "Penawaran berhasil dikirim!") });
      setShowSubmitConfirm(false);
      setEditMode(false);
      void refetch();
    },
    onError: (e: Error) => {
      toast({ title: e.message, variant: "destructive" });
      setShowSubmitConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-2xl p-6 space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-800">{t("mktVendorQuote.invalidLink", "Link Tidak Valid")}</h2>
            <p className="text-sm text-gray-500">
              {t("mktVendorQuote.invalidLinkDesc", "Link penawaran tidak ditemukan atau sudah kadaluarsa. Hubungi tim pengadaan untuk mendapatkan link baru.")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vqd = data.data;
  const q = vqd.quote;
  const rfq = vqd.rfq;
  const stConf = QUOTE_STATUS[q.status] ?? { label: q.status, color: "bg-gray-100 text-gray-700" };
  const isRequote = q.status === "requote_requested";
  const isSubmitted = q.status === "submitted" || q.status === "selected";
  const canEdit = vqd.meta.canEdit;
  const canSubmit = vqd.meta.canSubmit;

  const totalValue = vqd.rfqLines.reduce((sum, rl) => {
    const e = lineEdits[rl.id];
    const ql = vqd.quoteLines.find((l) => l.rfqLineId === rl.id);
    if (e) return sum + ((Number(e.price) || 0) * (Number(e.qty) || 0));
    if (ql) return sum + Number(ql.subtotal);
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t("mktVendorQuote.formTitle", "Form Penawaran Harga")}</h1>
          <p className="text-sm text-gray-500">
            {t("mktVendorQuote.invitationFrom", "Undangan dari")} {rfq.buyerCompany ?? rfq.buyerName}
          </p>
        </div>

        {isRequote && (
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-orange-800">
                <RotateCcw className="w-4 h-4" />
                {t("mktVendorQuote.requoteRequested", "Revisi Penawaran Diminta")}
                {(q.requoteRound ?? 0) > 1 && (
                  <Badge className="bg-orange-200 text-orange-800 ml-auto">Round {q.requoteRound}</Badge>
                )}
              </div>
              {q.requoteNotes && (
                <p className="text-sm text-orange-700">{q.requoteNotes}</p>
              )}
              {q.requoteDeadline && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t("mktVendorQuote.deadline", "Deadline")}: {fmtDateTime(q.requoteDeadline)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isSubmitted && (
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">{t("mktVendorQuote.quoteAlreadySent", "Penawaran Sudah Dikirim")}</p>
                <p className="text-xs text-green-600">{t("mktVendorQuote.sentAt", "Terkirim")}: {fmtDateTime(q.submittedAt)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("mktVendorQuote.rfqDetail", "Detail RFQ")}</CardTitle>
              <Badge className={`text-xs ${stConf.color}`}>{stConf.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorQuote.rfqNumber", "Nomor RFQ")}</p>
                <p className="font-mono font-semibold">{rfq.rfqNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("mktVendorQuote.buyer", "Buyer")}</p>
                <p>{rfq.buyerName}</p>
              </div>
              {rfq.requiredDeliveryDate && (
                <div>
                  <p className="text-xs text-gray-500">{t("mktVendorQuote.neededBefore", "Butuh Sebelum")}</p>
                  <p>{fmtDate(rfq.requiredDeliveryDate)}</p>
                </div>
              )}
              {rfq.deliveryAddress && (
                <div>
                  <p className="text-xs text-gray-500">{t("mktVendorQuote.deliveryAddress", "Alamat Pengiriman")}</p>
                  <p className="text-gray-700">{rfq.deliveryAddress}</p>
                  {mapsLink(rfq.destinationPlaceId, rfq.destinationLat, rfq.destinationLng) && (
                    <a
                      className="inline-block text-xs text-blue-600 hover:underline mt-1"
                      href={mapsLink(rfq.destinationPlaceId, rfq.destinationLat, rfq.destinationLng)!}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka di Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>
            {rfq.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">{t("mktVendorQuote.buyerNotes", "Catatan Buyer")}</p>
                <p className="text-gray-700">{rfq.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("mktVendorQuote.itemList", "Daftar Item")}</CardTitle>
              {(canEdit || isRequote) && !editMode && (
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                  {isRequote ? t("mktVendorQuote.reviseQuote", "Revisi Penawaran") : t("mktVendorQuote.fillQuote", "Isi Penawaran")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vqd.rfqLines.map((rl, idx) => {
                const ql = vqd.quoteLines.find((l) => l.rfqLineId === rl.id);
                const e = lineEdits[rl.id] ?? {
                  price:    ql?.offeredUnitPrice ?? "0",
                  qty:      ql?.offeredQty ?? rl.requestedQty,
                  notes:    ql?.notes ?? "",
                  leadTime: String(ql?.leadTimeDays ?? ""),
                };

                return (
                  <div key={rl.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          <span className="text-gray-400 mr-1">{idx + 1}.</span>
                          {rl.itemName}
                        </p>
                        {rl.itemDescription && (
                          <p className="text-xs text-gray-500 mt-0.5">{rl.itemDescription}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{t("mktVendorQuote.requestedQty", "Qty Diminta")}</p>
                        <p className="text-sm font-semibold">{rl.requestedQty} {rl.itemUnit ?? ""}</p>
                      </div>
                    </div>

                    {editMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("mktVendorQuote.unitPriceIdr", "Harga Satuan (IDR) *")}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={e.price}
                            onChange={(ev) => setLineEdits((prev) => ({
                              ...prev,
                              [rl.id]: { ...e, price: ev.target.value },
                            }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("mktVendorQuote.offeredQty", "Qty Penawaran")}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={e.qty}
                            onChange={(ev) => setLineEdits((prev) => ({
                              ...prev,
                              [rl.id]: { ...e, qty: ev.target.value },
                            }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("mktVendorQuote.leadTimeDays", "Lead Time (hari)")}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={e.leadTime}
                            onChange={(ev) => setLineEdits((prev) => ({
                              ...prev,
                              [rl.id]: { ...e, leadTime: ev.target.value },
                            }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("mktVendorQuote.subtotal", "Subtotal")}</Label>
                          <div className="h-8 flex items-center text-sm font-semibold text-green-700">
                            {idr((Number(e.price) || 0) * (Number(e.qty) || 0))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">{t("mktVendorQuote.itemNotes", "Catatan Item")}</Label>
                          <Input
                            value={e.notes}
                            onChange={(ev) => setLineEdits((prev) => ({
                              ...prev,
                              [rl.id]: { ...e, notes: ev.target.value },
                            }))}
                            className="h-8 text-sm"
                            placeholder={t("mktVendorQuote.optionalNotes", "Catatan opsional")}
                          />
                        </div>
                      </div>
                    ) : (
                      ql ? (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">{t("mktVendorQuote.unitPrice", "Harga Satuan")}</p>
                            <p className="font-semibold">{idr(Number(ql.offeredUnitPrice))}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t("mktVendorQuote.qty", "Qty")}</p>
                            <p>{ql.offeredQty}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t("mktVendorQuote.subtotal", "Subtotal")}</p>
                            <p className="font-semibold text-green-700">{idr(Number(ql.subtotal))}</p>
                          </div>
                          {ql.leadTimeDays && (
                            <div>
                              <p className="text-gray-500">{t("mktVendorQuote.leadTime", "Lead Time")}</p>
                              <p>{ql.leadTimeDays} {t("mktVendorQuote.days", "hari")}</p>
                            </div>
                          )}
                          {ql.notes && (
                            <div className="col-span-3">
                              <p className="text-gray-500">{t("mktVendorQuote.notes", "Catatan")}</p>
                              <p className="text-gray-700">{ql.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">{t("mktVendorQuote.notYetFilled", "Belum diisi")}</p>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {editMode && (
              <div className="mt-4 space-y-3 pt-4 border-t">
                <div>
                  <Label>{t("mktVendorQuote.paymentTerms", "Syarat Pembayaran")}</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder={t("mktVendorQuote.paymentTermsPlaceholder", "Contoh: 30 hari net")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("mktVendorQuote.quoteNotes", "Catatan Penawaran")}</Label>
                  <Textarea
                    value={headerNotes}
                    onChange={(e) => setHeaderNotes(e.target.value)}
                    placeholder={t("mktVendorQuote.quoteNotesPlaceholder", "Catatan umum untuk penawaran ini (opsional)")}
                    rows={3}
                    className="resize-none mt-1"
                  />
                </div>
              </div>
            )}

            {totalValue > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">{t("mktVendorQuote.totalEstimate", "Total Estimasi")}</p>
                <p className="text-lg font-bold text-green-700">{idr(totalValue)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {editMode && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? t("mktVendorQuote.saving", "Menyimpan…") : t("mktVendorQuote.saveDraft", "Simpan Draft")}
            </Button>
            {canSubmit && (
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowSubmitConfirm(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                {isRequote ? t("mktVendorQuote.sendRevision", "Kirim Revisi") : t("mktVendorQuote.sendQuote", "Kirim Penawaran")}
              </Button>
            )}
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pb-6">
          <p>{t("mktVendorQuote.vendorLabel", "Vendor")}: <strong className="text-gray-600">{vqd.vendor.name}</strong></p>
          {q.validUntil && <p>{t("mktVendorQuote.linkValidUntil", "Link berlaku hingga")}: {fmtDate(q.validUntil)}</p>}
        </div>
      </div>

      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-500" />
              {t("mktVendorQuote.confirmSendTitle", "Konfirmasi Kirim Penawaran")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {isRequote
              ? t("mktVendorQuote.confirmSendRevisionDesc", "Kirim revisi penawaran untuk RFQ ini? Anda tidak bisa mengubah setelah terkirim.")
              : t("mktVendorQuote.confirmSendDesc", "Kirim penawaran untuk RFQ ini? Anda tidak bisa mengubah setelah terkirim.")
            }
          </p>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-500">{t("mktVendorQuote.totalQuote", "Total Penawaran")}</p>
            <p className="text-xl font-bold text-green-700">{idr(totalValue)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} disabled={submitMutation.isPending}>
              {t("mktVendorQuote.cancel", "Batal")}
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? t("mktVendorQuote.sending", "Mengirim…") : t("mktVendorQuote.confirmSendBtn", "Ya, Kirim")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
