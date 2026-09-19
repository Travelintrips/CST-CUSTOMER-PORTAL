import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff, MessageCircle, AlertTriangle } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FonnteStatus = {
  configured: boolean;
  connected: boolean;
  device: string | null;
  name: string | null;
  package: string | null;
  quota: string | number | null;
  messages: number | null;
  expired: string | null;
  reason: string | null;
  checkedAt: string;
};

export function FonnteStatusTab() {
  const [data, setData] = useState<FonnteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/portal/admin/fonnte/status", {
        headers: getAuthHeaders(), credentials: "include", cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Gagal membaca status Fonnte.");
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca status Fonnte.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-emerald-600" />Status Koneksi Fonnte</CardTitle>
            <CardDescription>Pantau koneksi WhatsApp Fonnte dari backend Customer Portal. Token tidak pernah dikirim ke browser.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
        {data && (
          <>
            <div className={`flex items-center gap-3 rounded-xl border p-4 ${data.connected ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              {data.connected ? <Wifi className="h-5 w-5 text-emerald-600" /> : <WifiOff className="h-5 w-5 text-amber-600" />}
              <div>
                <p className="font-semibold">{data.connected ? "Terhubung" : data.configured ? "Terputus" : "Belum dikonfigurasi"}</p>
                {data.reason && <p className="text-sm text-muted-foreground">{data.reason}</p>}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Device", data.device || "—"], ["Nama Device", data.name || "—"], ["Paket", data.package || "—"],
                ["Sisa Kuota", data.quota ?? "—"], ["Total Pesan Diminta", data.messages ?? "—"], ["Aktif s/d", data.expired || "—"],
              ].map(([label, value]) => <div key={String(label)} className="rounded-lg border bg-white p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{String(value)}</p></div>)}
            </div>
            <p className="text-xs text-muted-foreground">Menurut API Fonnte, “Total Pesan Diminta” adalah total message request, bukan jumlah antrean/pending. Status antrean harus dibaca dari Message History/status Fonnte.</p>
            <p className="text-xs text-muted-foreground">Pemeriksaan terakhir: {new Date(data.checkedAt).toLocaleString("id-ID")}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
