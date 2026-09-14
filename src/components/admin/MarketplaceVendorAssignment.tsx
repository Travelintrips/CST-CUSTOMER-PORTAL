import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send, Store } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type VendorRouting = {
  hasVendor: boolean;
  vendorId: number | null;
  vendorName: string | null;
  vendorActive: boolean | null;
  quoteId: number | null;
  quoteStatus: string | null;
};

export function MarketplaceVendorAssignment({ rfqId }: { rfqId: number }) {
  const [routing, setRouting] = useState<VendorRouting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadRouting() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat vendor produk");
      setRouting(payload.data as VendorRouting);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat vendor produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRouting();
  }, [rfqId]);

  async function inviteProductVendor() {
    if (!routing?.vendorId || sending) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing/invite`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vendorId: routing.vendorId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal mengirim RFQ ke vendor");
      setNotice(`RFQ berhasil dikirim ke ${routing.vendorName ?? "vendor produk"}.`);
      await loadRouting();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengirim RFQ ke vendor");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat vendor produk...
      </div>
    );
  }

  return (
    <div className="min-w-[260px] rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2.5">
      <div className="flex items-start gap-2">
        <Store className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Vendor produk</p>
          <p className="text-sm font-semibold text-slate-900">{routing?.vendorName ?? "Belum terhubung"}</p>
          {routing?.vendorId && (
            <p className="text-[11px] text-slate-500">
              Supplier #{routing.vendorId}
              {routing.vendorActive === false ? " · Tidak aktif" : ""}
            </p>
          )}
        </div>
      </div>

      {routing?.quoteId ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          RFQ vendor: {routing.quoteStatus ?? "terkirim"} · Quote #{routing.quoteId}
        </div>
      ) : routing?.vendorId ? (
        <Button
          type="button"
          size="sm"
          className="mt-2 h-8 bg-sky-600 text-xs hover:bg-sky-700"
          disabled={sending || routing.vendorActive === false}
          onClick={() => void inviteProductVendor()}
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Kirim RFQ ke Vendor Produk
        </Button>
      ) : (
        <p className="mt-2 text-xs text-amber-700">
          RFQ ini tidak membawa referensi vendor katalog.
        </p>
      )}

      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
      {notice && <p className="mt-2 text-xs text-emerald-700">{notice}</p>}
    </div>
  );
}