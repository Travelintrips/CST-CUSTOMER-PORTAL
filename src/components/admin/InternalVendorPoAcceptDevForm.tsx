import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";

type PoDraft = {
  poId: number;
  poNumber: string;
  vendorName: string;
  amount: number;
  status: string;
  alreadyProcessed: boolean;
};
type ApiResult = { ok?: boolean; data?: PoDraft; error?: string; message?: string };

export function InternalVendorPoAcceptDevForm({
  poId, onAccepted,
}: {
  poId: number;
  onAccepted: () => void;
}) {
  const [draft, setDraft] = useState<PoDraft | null>(null);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    setDraft(null);
    setReason("");
    setConfirmed(false);
    setError("");
    fetch(`/api/mkt/admin/purchase-orders/${poId}/internal-vendor-accept`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
      cache: "no-store",
      signal: abort.signal,
    }).then(async res => {
      const payload = await res.json().catch(() => ({})) as ApiResult;
      // Feature OFF, other company, commercial PO or no permission: hidden.
      if (res.status === 403 || res.status === 404 || res.status === 409) return;
      if (!res.ok || !payload.data) {
        throw new Error(payload.message || payload.error || "PO DEV gagal dimuat.");
      }
      if (payload.data.poId !== poId || payload.data.status !== "issued") return;
      setDraft(payload.data);
    }).catch(cause => {
      if (!abort.signal.aborted) setError((cause as Error).message);
    });
    return () => abort.abort();
  }, [poId]);

  const submit = async () => {
    if (!draft || saving || !confirmed || !reason.trim().startsWith("TEST DEV") ||
        reason.trim().length < 12 || reason.trim().length > 500) {
      setError("Konfirmasi dan alasan audit TEST DEV (12–500 karakter) wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/mkt/admin/purchase-orders/${poId}/internal-vendor-accept`,
        {
          method: "POST",
          credentials: "include",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "accept_internal_vendor_po_dev",
            confirmed: true,
            reason: reason.trim(),
          }),
        },
      );
      const payload = await response.json().catch(() => ({})) as {
        ok?: boolean;
        data?: { poId?: number; status?: string };
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.ok ||
          payload.data?.poId !== poId ||
          payload.data?.status !== "vendor_accepted") {
        throw new Error(payload.message || payload.error || "Konfirmasi PO TEST ditolak.");
      }
      onAccepted();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!draft && !error) return null;
  return (
    <section className="space-y-3 rounded-lg border border-indigo-200 bg-white p-3" aria-label="Konfirmasi PO vendor internal DEV">
      <p className="font-semibold">Konfirmasi PO vendor internal (DEV TEST)</p>
      {draft && (
        <>
          <p className="text-xs text-slate-600">
            {draft.poNumber} · {draft.vendorName} · IDR {draft.amount.toLocaleString("id-ID")}.
            Hanya PO simulasi yang diizinkan; tidak mengirim WA, tidak membuat shipment,
            tidak mengunggah POD, dan tidak membuat pembayaran atau jurnal.
          </p>
          <label className="block text-xs">
            Alasan Admin mewakili vendor internal PO (audit)
            <Textarea
              aria-label="Alasan Admin menerima PO TEST"
              value={reason}
              onChange={event => setReason(event.target.value)}
              placeholder="TEST DEV — jelaskan otorisasi pengujian perusahaan"
            />
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input
              aria-label="Konfirmasi penerimaan PO TEST"
              type="checkbox"
              checked={confirmed}
              onChange={event => setConfirmed(event.target.checked)}
            />
            Saya mengonfirmasi PO ini hanya transaksi simulasi DEV dan mewakili
            vendor internal dengan persetujuan pengujian.
          </label>
          <button
            type="button"
            disabled={saving || !confirmed || !reason.trim().startsWith("TEST DEV") ||
              reason.trim().length < 12}
            onClick={() => void submit()}
            className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Memproses..." : "Terima PO internal TEST"}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </section>
  );
}
