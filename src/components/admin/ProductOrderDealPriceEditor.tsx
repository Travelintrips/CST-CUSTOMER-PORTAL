import { useEffect, useState } from "react";
import { DollarSign, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthHeaders } from "@/lib/auth";

type ProductOrderDealPriceEditorProps = {
  orderId: number;
  status: string;
  initialVendorName?: string | null;
  initialQuotedPrice?: number | string | null;
};

const LOCKED_STATUSES = new Set([
  "Customer Product Approval",
  "Shipment Selection Pending",
  "Ready for Pickup",
  "Shipment RFQ Sent",
  "Vendor Confirmed",
  "In Progress",
  "Delivered",
  "Completed",
  "Cancelled",
]);
const EDITABLE_STATUSES = new Set(["Product RFQ Sent", "Product Quote Received"]);

const idr = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function ProductOrderDealPriceEditor({
  orderId,
  status,
  initialVendorName,
  initialQuotedPrice,
}: ProductOrderDealPriceEditorProps) {
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const locked = LOCKED_STATUSES.has(status);
  const canEdit = EDITABLE_STATUSES.has(status) && !locked;

  useEffect(() => {
    if (!open) return;
    setVendorName(initialVendorName == null ? "" : String(initialVendorName));
    setQuotedPrice(initialQuotedPrice == null ? "" : String(initialQuotedPrice));
    setError("");
    setNotice("");
  }, [open, initialQuotedPrice, initialVendorName]);

  async function save() {
    const price = Number(quotedPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Harga setelah deal harus lebih besar dari nol.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/portal-product/admin/orders/${orderId}/update-product-phase`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendorName: vendorName.trim() || null,
          quotedPrice: price,
          selectVendor: false,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Gagal menyimpan harga setelah deal");
      setNotice("Harga setelah deal berhasil disimpan.");
      window.setTimeout(() => setOpen(false), 500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyimpan harga setelah deal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!canEdit}
        onClick={() => setOpen(true)}
        className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
      >
        <DollarSign className="h-3.5 w-3.5" />
        {canEdit ? "Masukkan Harga" : "Setujui dulu untuk input harga"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Harga Setelah Deal</DialogTitle>
            <p className="text-sm text-slate-500">
              Masukkan harga produk yang sudah disepakati dengan vendor. Nilai ini dipakai untuk proses approval customer.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`product-order-vendor-${orderId}`}>Vendor Produk</Label>
              <Input
                id={`product-order-vendor-${orderId}`}
                value={vendorName}
                onChange={(event) => setVendorName(event.target.value)}
                placeholder="Nama vendor"
                disabled={saving}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`product-order-price-${orderId}`}>Harga Setelah Deal (Rp)</Label>
              <Input
                id={`product-order-price-${orderId}`}
                type="number"
                min="1"
                value={quotedPrice}
                onChange={(event) => setQuotedPrice(event.target.value)}
                placeholder="Contoh: 5000000"
                disabled={saving}
                className="mt-1"
              />
              {Number(quotedPrice) > 0 && (
                <p className="mt-1 text-xs text-slate-500">{idr(Number(quotedPrice))}</p>
              )}
            </div>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button type="button" onClick={() => void save()} disabled={saving || !canEdit}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Harga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}