import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Loader2, Save } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DealLine = {
  rfqLineId: number;
  itemName: string;
  unit: string | null;
  offeredQty: string;
  vendorUnitPrice: string;
  vendorSubtotal: string;
  dealUnitPrice: string | null;
  dealSubtotal: string | null;
};

type DealQuote = {
  quote_id: number;
  quote_status: string;
  updated_at: string;
  vendor_name: string;
  dealTotal: number | null;
  lines: DealLine[];
};

const idr = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function MarketplaceDealPriceEditor({ rfqId, rfqStatus }: { rfqId: number; rfqStatus: string }) {
  const [open, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<DealQuote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedQuote = quotes.find((quote) => quote.quote_id === selectedQuoteId) ?? null;
  const dealTotal = useMemo(() => {
    if (!selectedQuote) return 0;
    return selectedQuote.lines.reduce((sum, line) => {
      const unitPrice = Number(prices[line.rfqLineId] ?? line.dealUnitPrice ?? 0);
      return sum + unitPrice * Number(line.offeredQty);
    }, 0);
  }, [prices, selectedQuote]);
  const locked = ["customer_review", "awarded", "cancelled", "expired"].includes(rfqStatus);

  async function loadQuotes() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/marketplace/${rfqId}/deal-price`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat harga deal");
      const nextQuotes = (payload.data?.quotes ?? []) as DealQuote[];
      setQuotes(nextQuotes);
      const initial = nextQuotes[0];
      if (initial) {
        setSelectedQuoteId(initial.quote_id);
        setPrices(Object.fromEntries(initial.lines.map((line) => [line.rfqLineId, line.dealUnitPrice ?? ""])));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat harga deal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedQuote) return;
    setPrices(Object.fromEntries(selectedQuote.lines.map((line) => [line.rfqLineId, line.dealUnitPrice ?? ""])));
  }, [selectedQuoteId]); // eslint-disable-line react-hooks/exhaustive-deps

  function chooseQuote(quote: DealQuote) {
    setSelectedQuoteId(quote.quote_id);
    setNotes("");
    setNotice("");
  }

  async function save() {
    if (!selectedQuote || locked) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/marketplace/${rfqId}/deal-price/${selectedQuote.quote_id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expectedUpdatedAt: selectedQuote.updated_at,
          dealNotes: notes || null,
          lines: selectedQuote.lines.map((line) => ({
            rfqLineId: line.rfqLineId,
            dealUnitPrice: Number(prices[line.rfqLineId]),
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? payload.error ?? "Gagal menyimpan harga deal");
      setNotice("Harga deal berhasil disimpan.");
      await loadQuotes();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan harga deal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={locked}
        onClick={() => { setOpen(true); void loadQuotes(); }}
      >
        <BadgeDollarSign className="h-3.5 w-3.5" />
        Harga Deal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Harga Deal RFQ #{rfqId}</DialogTitle>
            <p className="text-sm text-slate-500">
              Masukkan harga customer setelah negosiasi. Harga vendor hanya terlihat untuk referensi admin.
            </p>
          </DialogHeader>

          {loading && <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat quote vendor...</div>}
          {!loading && quotes.length === 0 && <p className="py-8 text-sm text-slate-500">Belum ada quote vendor yang dapat diatur.</p>}
          {!loading && quotes.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {quotes.map((quote) => (
                  <button
                    type="button"
                    key={quote.quote_id}
                    onClick={() => chooseQuote(quote)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${selectedQuoteId === quote.quote_id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}
                  >
                    <span className="block font-semibold">{quote.vendor_name}</span>
                    <span className="block text-xs text-slate-500">Quote #{quote.quote_id} · {quote.quote_status}</span>
                  </button>
                ))}
              </div>
              {selectedQuote && (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[680px] text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Harga Vendor</th>
                          <th className="px-3 py-2">Harga Deal</th>
                          <th className="px-3 py-2 text-right">Subtotal Deal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedQuote.lines.map((line) => {
                          const unitPrice = Number(prices[line.rfqLineId] ?? 0);
                          return (
                            <tr key={line.rfqLineId}>
                              <td className="px-3 py-3 font-medium">{line.itemName}</td>
                              <td className="px-3 py-3">{line.offeredQty} {line.unit ?? ""}</td>
                              <td className="px-3 py-3 text-slate-500">{idr(Number(line.vendorUnitPrice))}</td>
                              <td className="px-3 py-3">
                                <Label htmlFor={`deal-price-${line.rfqLineId}`} className="sr-only">Harga deal {line.itemName}</Label>
                                <Input
                                  id={`deal-price-${line.rfqLineId}`}
                                  type="number"
                                  min="1"
                                  value={prices[line.rfqLineId] ?? ""}
                                  onChange={(event) => setPrices((current) => ({ ...current, [line.rfqLineId]: event.target.value }))}
                                  disabled={locked || saving}
                                  className="w-36"
                                />
                              </td>
                              <td className="px-3 py-3 text-right font-medium">{unitPrice > 0 ? idr(unitPrice * Number(line.offeredQty)) : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3">
                    <span className="text-sm font-semibold text-indigo-900">Total Harga Deal</span>
                    <span className="text-lg font-bold text-indigo-900">{idr(dealTotal)}</span>
                  </div>
                  <div>
                    <Label htmlFor="deal-price-notes">Catatan negosiasi</Label>
                    <Textarea id="deal-price-notes" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={locked || saving} placeholder="Contoh: harga disepakati setelah negosiasi WhatsApp..." className="mt-1" />
                  </div>
                </>
              )}
            </div>
          )}
          {locked && <p className="text-sm text-amber-700">Harga deal terkunci karena RFQ sudah masuk tahap review customer atau awarded.</p>}
          {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
            <Button type="button" onClick={() => void save()} disabled={locked || saving || loading || !selectedQuote}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Harga Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}