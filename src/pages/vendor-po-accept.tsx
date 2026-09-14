import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...opts });

export default function VendorPoAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);

  const { data: po, isLoading, isError } = useQuery({
    queryKey: ["/api/purchase/vendor-accept", token],
    queryFn: () => apiFetch(`/purchase/vendor-accept/${token}`).then((r) => {
      if (!r.ok) throw new Error("not_found");
      return r.json();
    }),
    enabled: !!token,
    retry: false,
  });

  const acceptMut = useMutation({
    mutationFn: () =>
      apiFetch(`/purchase/vendor-accept/${token}`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message ?? "error");
        return data;
      }),
    onSuccess: () => setAccepted(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Memuat data Purchase Order…</p>
        </div>
      </div>
    );
  }

  if (isError || !po) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600">Link konfirmasi PO ini tidak valid atau sudah kadaluarsa. Hubungi admin untuk mendapatkan link baru.</p>
        </div>
      </div>
    );
  }

  const alreadyAccepted = !!po.vendor_accepted_at;
  const grandTotal = Number(po.grand_total ?? 0);
  const subtotal = Number(po.total_amount ?? 0);
  const taxAmount = Number(po.tax_amount ?? 0);

  if (accepted || alreadyAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">PO Telah Dikonfirmasi!</h1>
          <p className="text-gray-600 mb-4">
            Terima kasih. <strong>{po.supplier_name}</strong> telah mengkonfirmasi penerimaan Purchase Order <strong>{po.doc_number}</strong>.
          </p>
          {(po.vendor_accept_notes || notes) && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-left text-gray-600 mb-4">
              <strong>Catatan:</strong> {po.vendor_accept_notes ?? notes}
            </div>
          )}
          <p className="text-sm text-gray-400">Tim kami akan segera menindaklanjuti. Terima kasih atas kerjasamanya.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl">📋</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Konfirmasi Purchase Order</h1>
              <p className="text-sm text-gray-500">Nomor PO: <span className="font-semibold text-gray-700">{po.doc_number}</span></p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vendor</span>
              <span className="font-semibold text-gray-800">{po.supplier_name}</span>
            </div>
            {po.expected_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimasi Pengiriman</span>
                <span className="font-semibold text-gray-800">{new Date(po.expected_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            )}
            {po.notes && (
              <div className="border-t pt-2 mt-2">
                <span className="text-gray-600 block mb-1">Catatan PO:</span>
                <span className="text-gray-700">{po.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        {po.lines && po.lines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-800 mb-3">Item Purchase Order</h2>
            <div className="space-y-2">
              {po.lines.map((line: Record<string, unknown>, i: number) => (
                <div key={i} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{String(line.name ?? "")}</p>
                    {!!line.description && <p className="text-xs text-gray-500">{String(line.description)}</p>}
                    <p className="text-xs text-gray-500">
                      {Number(line.quantity).toLocaleString("id-ID")} × {idr(Number(line.unit_cost ?? 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-gray-800">{idr(Number(line.subtotal ?? 0))}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Harga Dasar, belum PPN)</span>
                <span className="font-mono">{idr(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>PPN {subtotal > 0 ? `${Math.round(taxAmount / subtotal * 100)}%` : ""}</span>
                  <span className="font-mono">{idr(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2 mt-1">
                <span>Total (termasuk PPN)</span>
                <span className="font-mono text-blue-700">{idr(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Accept Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-2">Konfirmasi Penerimaan PO</h2>
          <p className="text-sm text-gray-600 mb-4">
            Dengan menekan tombol di bawah, <strong>{po.supplier_name}</strong> menyatakan telah menerima dan menyetujui Purchase Order <strong>{po.doc_number}</strong> dan akan mempersiapkan pengiriman/penyerahan layanan sesuai spesifikasi.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={3}
              placeholder="Estimasi pengiriman, konfirmasi ketersediaan stok, dll..."
            />
          </div>

          {acceptMut.isError && (
            <div className="mb-3 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
              {String((acceptMut.error as Error)?.message ?? "Terjadi kesalahan. Silakan coba lagi.")}
            </div>
          )}

          <button
            onClick={() => acceptMut.mutate()}
            disabled={acceptMut.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
          >
            {acceptMut.isPending ? "Mengirim konfirmasi…" : "✅ Saya Setuju & Konfirmasi PO Ini"}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Konfirmasi ini bersifat mengikat dan akan diteruskan ke tim pengadaan kami.
          </p>
        </div>
      </div>
    </div>
  );
}
