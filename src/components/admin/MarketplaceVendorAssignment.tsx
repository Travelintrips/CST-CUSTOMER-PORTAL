import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, Send, Store } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type VendorRouting = {
  hasVendor: boolean;
  vendorId: number | null;
  vendorName: string | null;
  vendorActive: boolean | null;
  quoteId: number | null;
  quoteStatus: string | null;
  catalogItemId: number | null;
  catalogItemName: string | null;
  source: string | null;
  vendorShareSupported?: boolean;
};

type WaReadiness = {
  queueId: number;
  quoteId: number;
  recipientLast4: string;
  queueStatus: string;
  senderConfigured: boolean;
  enabled: boolean;
  ready: boolean;
  reason: string | null;
};

export function MarketplaceVendorAssignment({ rfqId }: { rfqId: number }) {
  const [routing, setRouting] = useState<VendorRouting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);
  const [shareText, setShareText] = useState("");
  const [recipientLast4, setRecipientLast4] = useState("");
  const [waReadiness, setWaReadiness] = useState<WaReadiness | null>(null);
  const [waConfirmed, setWaConfirmed] = useState(false);
  const [waSending, setWaSending] = useState(false);

  async function loadRouting() {
    setLoading(true);
    setShareText("");
    setRecipientLast4("");
    setWaReadiness(null);
    setWaConfirmed(false);
    setError("");
    try {
      const response = await fetch(`/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal memuat vendor produk");
      const routed = payload.data as VendorRouting;
      setRouting(routed);
      if (routed.vendorShareSupported && routed.quoteId
        && ["invited", "opened", "requote_requested"].includes(routed.quoteStatus ?? "")) {
        try {
          const waResponse = await fetch(
            `/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing/whatsapp-readiness?quoteId=${routed.quoteId}`,
            { headers: getAuthHeaders(), credentials: "include", cache: "no-store" },
          );
          const waPayload = await waResponse.json();
          if (waResponse.ok) setWaReadiness(waPayload.data as WaReadiness);
        } catch {
          // WhatsApp readiness is advisory; never break the existing Admin RFQ card.
        }
      }
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
      const response = await fetch(`/api/mkt/admin/rfqs/${rfqId}/approve-and-invite`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vendorIds: [routing.vendorId] }),
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

  async function prepareManualVendorInvitation() {
    if (!routing?.quoteId || copying) return;
    setCopying(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing/invite-link?quoteId=${routing.quoteId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
          cache: "no-store",
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal mengambil tautan quotation vendor.");
      const share = payload.data as {
        rfqNumber?: string;
        quoteId: number;
        quotePath: string;
        recipientPhoneLast4: string;
      };
      if (Number(share.quoteId) !== Number(routing.quoteId)
        || typeof share.quotePath !== "string"
        || !share.quotePath.startsWith("/mkt-vendor-quote/")
        || share.quotePath.length < 45) {
        throw new Error("Tautan undangan vendor tidak valid.");
      }
      const message = [
        "CST Customer Portal — Undangan Quotation",
        `RFQ: ${share.rfqNumber ?? rfqId}`,
        `Quote #${share.quoteId}`,
        "Mohon isi penawaran melalui tautan khusus berikut:",
        window.location.origin + share.quotePath,
      ].join("\n");
      setShareText(message);
      setRecipientLast4(share.recipientPhoneLast4 ?? "");
      try {
        await navigator.clipboard.writeText(message);
        setNotice("Undangan sudah disalin. Tempel hanya ke WhatsApp PIC vendor yang benar; belum terkirim otomatis.");
      } catch {
        setNotice("Salin teks undangan di bawah secara manual. Pastikan nomor WhatsApp PIC sebelum mengirim.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mempersiapkan undangan vendor.");
    } finally {
      setCopying(false);
    }
  }

  async function sendVendorWhatsapp() {
    if (!routing?.quoteId || !waReadiness?.ready || !waConfirmed || waSending) return;
    setWaSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/portal/admin/service-operations/marketplace/${rfqId}/vendor-routing/send-whatsapp`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            queueId: waReadiness.queueId, quoteId: routing.quoteId,
            recipientLast4: waReadiness.recipientLast4, confirmedRecipient: true,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? payload.message ?? "Gagal mengirim WA.");
      setNotice("WA Gateway menerima antrean undangan. Pesan belum tentu terkirim; jangan kirim ulang.");
      await loadRouting();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengirim WA.");
    } finally {
      setWaSending(false);
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
          {routing?.catalogItemName && (
            <p className="text-[11px] text-slate-500">
              Produk: {routing.catalogItemName}
              {routing.catalogItemId ? ` · #${routing.catalogItemId}` : ""}
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
      ) : !error ? (
        <p className="mt-2 text-xs text-amber-700">
          RFQ ini belum memiliki vendor produk yang dapat ditentukan dengan aman.
        </p>
      ) : null}

      {routing?.vendorShareSupported && routing?.quoteId && ["invited", "opened", "requote_requested"].includes(routing.quoteStatus ?? "") && (
        <div className="mt-2 space-y-1.5">
          <p className="text-[11px] text-sky-800">
            WA Gateway CST: {waReadiness?.ready ? "Perangkat DEV terverifikasi untuk satu antrean (belum menjamin pesan diterima)."
              : waReadiness?.reason ?? "Belum tersedia untuk undangan ini."}
          </p>
          {waReadiness?.ready && (
            <div className="rounded border border-sky-200 bg-white p-2 space-y-2">
              <label className="flex items-start gap-2 text-xs">
                <input
                  aria-label="Konfirmasi nomor PIC vendor"
                  type="checkbox"
                  checked={waConfirmed}
                  onChange={(event) => setWaConfirmed(event.target.checked)}
                />
                Saya telah memastikan nomor berakhiran {waReadiness.recipientLast4} milik PIC vendor yang berwenang.
              </label>
              <Button
                type="button"
                size="sm"
                disabled={!waConfirmed || waSending}
                onClick={() => void sendVendorWhatsapp()}
              >
                {waSending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
                Kirim WhatsApp dari Sistem (1 Antrean)
              </Button>
            </div>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={copying || routing.vendorActive === false || ["queued","sending","sent","exhausted","failed","retrying"].includes(waReadiness?.queueStatus ?? "")}
            onClick={() => void prepareManualVendorInvitation()}
          >
            {copying ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
            Salin Undangan Vendor
          </Button>
          <p className="text-[11px] text-amber-800">
            Undangan berisi tautan khusus. Admin harus memastikan kontak penerima
            sebelum mengirim melalui WhatsApp sendiri. Tombol ini tidak mengirim pesan otomatis.
          </p>
          {shareText && (
            <div className="space-y-1">
              {recipientLast4 && <p className="text-[11px]">Pastikan nomor PIC berakhiran {recipientLast4}.</p>}
              <textarea
                aria-label="Undangan vendor untuk disalin"
                readOnly
                value={shareText}
                className="min-h-24 w-full rounded border bg-white p-2 text-xs"
                onFocus={(event) => event.target.select()}
              />
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
      {notice && <p className="mt-2 text-xs text-emerald-700">{notice}</p>}
    </div>
  );
}