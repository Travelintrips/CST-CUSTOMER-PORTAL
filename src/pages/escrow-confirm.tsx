import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { COMPANY_CONFIG } from "@/config/company";

const idr = (n: number | string | null | undefined) =>
  n == null ? "—" : `Rp ${Math.round(Number(n)).toLocaleString("id-ID")}`;

const DP_STATUS_LABEL: Record<string, string> = {
  none:                   "Belum Diaktifkan",
  dp_pending:             "Menunggu DP Customer",
  dp_held:                "DP Diterima Platform",
  confirmed_by_customer:  "Barang Dikonfirmasi ✅",
  dp_released:            "Dana Dirilis ke Vendor",
  completed:              "Selesai",
};

interface EscrowInfo {
  id: number;
  doc_number: string;
  customer_name: string;
  grand_total: string;
  dp_percentage: string;
  dp_amount: string;
  dp_status: string;
  dp_held_at: string | null;
  customer_confirmed_at: string | null;
  escrow_notes: string | null;
}

export default function EscrowConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<EscrowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!token) { setError("Token tidak valid"); setLoading(false); return; }
    fetch(`/api/sales/escrow/confirm/${token}`)
      .then(async (r) => {
        const d = await r.json() as EscrowInfo & { error?: string };
        if (!r.ok) throw new Error(d.error ?? "Gagal memuat data");
        setInfo(d);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConfirm = async () => {
    if (!confirm("Konfirmasi bahwa Anda sudah menerima barang/jasa dari vendor?")) return;
    setConfirming(true);
    try {
      const r = await fetch(`/api/sales/escrow/confirm/${token}`, { method: "POST" });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error ?? "Gagal konfirmasi");
      setConfirmed(true);
      setInfo((prev) => prev ? { ...prev, dp_status: "confirmed_by_customer", customer_confirmed_at: new Date().toISOString() } : prev);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  const BRAND_HEADER = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 38, height: 38, background: "#0ea5e9", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>CST</div>
      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 16 }}>{COMPANY_CONFIG.brandName}</span>
    </div>
  );

  const COMMON_STYLE: React.CSSProperties = {
    fontFamily: "system-ui,-apple-system,sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const CARD_STYLE: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    maxWidth: 440,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,.08)",
  };

  if (loading) {
    return (
      <div style={COMMON_STYLE}>
        <div style={CARD_STYLE}>
          {BRAND_HEADER}
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 14 }}>Memuat data escrow…</div>
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div style={COMMON_STYLE}>
        <div style={CARD_STYLE}>
          {BRAND_HEADER}
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Link Tidak Valid</h2>
            <p style={{ fontSize: 13, color: "#64748b" }}>{error ?? "Halaman ini tidak ditemukan."}</p>
          </div>
        </div>
      </div>
    );
  }

  const alreadyConfirmed = info.dp_status === "confirmed_by_customer" || info.dp_status === "dp_released" || info.dp_status === "completed";
  const canConfirm = info.dp_status === "dp_held";

  return (
    <div style={COMMON_STYLE}>
      <div style={CARD_STYLE}>
        {BRAND_HEADER}

        {/* Shield badge */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", margin: 0 }}>Transaksi Dilindungi Escrow</p>
            <p style={{ fontSize: 11, color: "#3b82f6", margin: 0 }}>Dana DP ditahan platform sampai Anda konfirmasi penerimaan</p>
          </div>
        </div>

        {/* Order info */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          {[
            ["Nomor Dokumen", info.doc_number],
            ["Nama Customer", info.customer_name],
            ["Total Transaksi", idr(info.grand_total)],
            ["DP Escrow", `${info.dp_percentage}% — ${idr(info.dp_amount)}`],
            ["Status Escrow", DP_STATUS_LABEL[info.dp_status] ?? info.dp_status],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>{label}</span>
              <span style={{ fontWeight: 500, color: "#0f172a", maxWidth: "55%", textAlign: "right" }}>{value}</span>
            </div>
          ))}
          {info.escrow_notes && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              📝 {info.escrow_notes}
            </div>
          )}
        </div>

        {/* Already confirmed */}
        {(alreadyConfirmed || confirmed) && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: "0 0 4px 0" }}>
              Konfirmasi Berhasil
            </h3>
            <p style={{ fontSize: 13, color: "#16a34a", margin: 0 }}>
              Terima kasih! Admin akan segera merilis dana DP ke vendor.
            </p>
            {info.customer_confirmed_at && (
              <p style={{ fontSize: 11, color: "#86efac", marginTop: 8 }}>
                Dikonfirmasi pada {new Date(info.customer_confirmed_at).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        )}

        {/* Waiting for DP */}
        {!canConfirm && !alreadyConfirmed && !confirmed && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>
              Konfirmasi baru bisa dilakukan setelah DP Anda diterima dan ditahan oleh platform.
            </p>
          </div>
        )}

        {/* Confirm button */}
        {canConfirm && !confirmed && (
          <div>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 14, textAlign: "center" }}>
              Klik tombol di bawah setelah Anda menerima barang atau jasa dari vendor dengan kondisi yang sesuai.
            </p>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              style={{
                width: "100%",
                padding: "12px",
                background: confirming ? "#86efac" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: confirming ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {confirming ? "Memproses…" : "✅ Ya, Saya Sudah Menerima Barang/Jasa"}
            </button>
            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>
              Dengan mengklik tombol ini, Anda mengkonfirmasi bahwa barang/jasa telah diterima dengan baik dan menyetujui pelepasan dana DP ke vendor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
