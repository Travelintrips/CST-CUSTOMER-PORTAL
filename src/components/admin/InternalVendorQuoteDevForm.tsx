import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DraftLine = {
  rfqLineId: number;
  itemName: string;
  unit: string | null;
  requestedQty: number;
};
type Draft = {
  rfqId: number;
  quoteId: number;
  supplierName: string;
  expiresAt: string | null;
  lines: DraftLine[];
};
type LineInput = {
  rfqLineId: number;
  offeredUnitPrice: string;
  offeredQty: string;
  stockStatus: string;
};
type ApiPayload = { ok?: boolean; data?: Draft; error?: string; message?: string };

export function InternalVendorQuoteDevForm({
  rfqId, quoteId, onSubmitted,
}: {
  rfqId: number;
  quoteId: number;
  onSubmitted: () => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lines, setLines] = useState<LineInput[]>([]);
  const [terms, setTerms] = useState("");
  const [dpPercent, setDpPercent] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setDraft(null);
    setError("");
    fetch(`/api/mkt/admin/rfqs/${rfqId}/vendor-quotes/${quoteId}/internal-draft`, {
      headers: getAuthHeaders(),
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    }).then(async response => {
      const payload = await response.json().catch(() => ({})) as ApiPayload;
      if (!response.ok || !payload.data) {
        // DEV flag OFF and unauthorized vendor are intentionally indistinguishable.
        if (response.status === 404 || response.status === 403) return;
        throw new Error(payload.message || payload.error || "Persiapan quotation gagal.");
      }
      if (payload.data.rfqId !== rfqId || payload.data.quoteId !== quoteId) {
        throw new Error("Identitas quotation berubah.");
      }
      setDraft(payload.data);
      setLines(payload.data.lines.map(line => ({
        rfqLineId: line.rfqLineId,
        offeredQty: String(line.requestedQty),
        offeredUnitPrice: "",
        stockStatus: "available",
      })));
    }).catch(cause => {
      if (!controller.signal.aborted) setError((cause as Error).message);
    });
    return () => controller.abort();
  }, [rfqId, quoteId]);

  if (!draft && !error) return null;

  const changeLine = (id: number, field: keyof LineInput, value: string) => {
    setLines(previous => previous.map(line =>
      line.rfqLineId === id ? { ...line, [field]: value } : line));
  };
  const submit = async () => {
    if (!draft || saving) return;
    if (!terms || !quotationDate || reason.trim().length < 8 || !confirmed ||
        (terms === "dp_after_receipt" && !(Number(dpPercent) > 0 && Number(dpPercent) < 100)) ||
        lines.some(line => !Number.isFinite(Number(line.offeredUnitPrice)) ||
          !(Number(line.offeredUnitPrice) > 0) ||
          !(Number(line.offeredQty) > 0))) {
      setError("Isi harga dan jumlah positif, tanggal, payment terms, alasan audit (minimal 8 karakter), dan konfirmasi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/mkt/admin/rfqs/${rfqId}/vendor-quotes/${quoteId}/submit-internal`,
        {
          method: "POST",
          credentials: "include",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "submit_internal_vendor_quote",
            confirmed: true,
            reason: reason.trim(),
            quotationDate,
            paymentTerms: terms,
            paymentDpPercent: terms === "dp_after_receipt" ? Number(dpPercent) : null,
            notes: notes.trim() || null,
            lines: lines.map(line => ({
              rfqLineId: line.rfqLineId,
              offeredUnitPrice: Number(line.offeredUnitPrice),
              offeredQty: Number(line.offeredQty),
              stockStatus: line.stockStatus,
              currency: "IDR",
            })),
          }),
        },
      );
      const payload = await response.json().catch(() => ({})) as {
        ok?: boolean; error?: string; message?: string;
      };
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.message || payload.error || `Pengajuan ditolak (${response.status}).`);
      }
      onSubmitted();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-3 rounded-lg border border-indigo-200 bg-white p-3" aria-label="Quotation vendor internal DEV">
      <p className="font-semibold">Quotation vendor internal (DEV)</p>
      <p className="text-xs text-slate-600">
        Vendor: {draft?.supplierName || "—"} · Quote #{quoteId}.
        Hanya Admin yang sah; tidak mengirim WA, tidak membuat PO atau jurnal secara otomatis.
      </p>
      {draft && (
        <>
          {lines.map(line => {
            const rfqLine = draft.lines.find(row => row.rfqLineId === line.rfqLineId);
            return (
              <div key={line.rfqLineId} className="grid gap-2 rounded border p-2 md:grid-cols-3">
                <div className="text-sm">
                  <p className="font-medium">{rfqLine?.itemName}</p>
                  <p className="text-xs text-slate-500">Permintaan: {rfqLine?.requestedQty} {rfqLine?.unit || ""}</p>
                </div>
                <label className="text-xs">Qty ditawarkan
                  <Input aria-label={`Qty RFQ line ${line.rfqLineId}`} type="number" min="0.0001" step="any"
                    value={line.offeredQty}
                    onChange={event => changeLine(line.rfqLineId, "offeredQty", event.target.value)} />
                </label>
                <label className="text-xs">Harga satuan (IDR)
                  <Input aria-label={`Harga RFQ line ${line.rfqLineId}`} type="number" min="0.01" step="any"
                    placeholder="Wajib isi harga yang sah" value={line.offeredUnitPrice}
                    onChange={event => changeLine(line.rfqLineId, "offeredUnitPrice", event.target.value)} />
                </label>
                <label className="text-xs">Status stok
                  <select className="w-full rounded border p-2" value={line.stockStatus}
                    onChange={event => changeLine(line.rfqLineId, "stockStatus", event.target.value)}>
                    <option value="available">Tersedia</option>
                    <option value="limited">Terbatas</option>
                    <option value="backorder">Backorder</option>
                    <option value="unavailable">Tidak tersedia</option>
                  </select>
                </label>
              </div>
            );
          })}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs">Tanggal quotation
              <Input type="date" value={quotationDate} onChange={e => setQuotationDate(e.target.value)} />
            </label>
            <label className="text-xs">Payment terms
              <select className="w-full rounded border p-2" value={terms} onChange={e => setTerms(e.target.value)}>
                <option value="">Pilih syarat pembayaran</option>
                <option value="prepaid">Lunas sebelum serah/kirim</option>
                <option value="net_7">NET 7 hari</option>
                <option value="net_14">NET 14 hari</option>
                <option value="net_30">NET 30 hari</option>
                <option value="dp_after_receipt">DP sebelum kirim, pelunasan setelah terima</option>
              </select>
            </label>
          </div>
          {terms === "dp_after_receipt" && (
            <label className="block text-xs">Persentase DP
              <Input type="number" min="0.01" max="99.99" step="any"
                value={dpPercent} onChange={e => setDpPercent(e.target.value)} />
            </label>
          )}
          <label className="block text-xs">Catatan penawaran
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </label>
          <label className="block text-xs">Alasan Admin mewakili vendor internal (audit)
            <Textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Jelaskan mandat dan sumber harga penawaran" />
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
            Saya mengonfirmasi harga dan syarat pembayaran berasal dari otorisasi yang sah.
          </label>
          <button type="button" disabled={saving || !confirmed}
            onClick={() => void submit()}
            className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Mengajukan..." : "Ajukan quotation internal"}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </section>
  );
}
