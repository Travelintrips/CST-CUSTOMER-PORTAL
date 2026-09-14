import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth";

type ServiceRequest = {
  requestNumber: string;
  tradeType: string;
  status: string;
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items?: Array<{ id: number; title: string; status: string; description?: string | null }>;
  documents?: Array<{ id: number; fileName?: string | null; documentType: string; verificationStatus: string }>;
};

export default function ServiceRequestTrack() {
  const [, setLocation] = useLocation();
  const number = new URLSearchParams(window.location.search).get("number") ?? "";
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!number) {
      setError("Nomor request tidak ditemukan.");
      setLoading(false);
      return;
    }
    fetch(`/api/customer-service-requests/by-number/${encodeURIComponent(number)}`, { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Request tidak ditemukan.");
        setRequest(payload as ServiceRequest);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Gagal memuat request."))
      .finally(() => setLoading(false));
  }, [number, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" /> Kembali ke dashboard</Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-sky-600" /> Status request layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Memuat request...</div>}
            {error && !loading && <p className="text-sm text-rose-600">{error}</p>}
            {request && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><p className="text-xs text-muted-foreground">Referensi</p><p className="font-mono font-semibold">{request.requestNumber}</p></div>
                  <div><p className="text-xs text-muted-foreground">Jenis</p><p className="font-semibold">{request.tradeType}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline">{request.status.replaceAll("_", " ")}</Badge></div>
                </div>
                {(request.notes || request.adminNotes) && (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm">
                    {request.notes && <p><span className="font-medium">Catatan Anda:</span> {request.notes}</p>}
                    {request.adminNotes && <p className="mt-1"><span className="font-medium">Catatan admin:</span> {request.adminNotes}</p>}
                  </div>
                )}
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Item layanan</h3>
                  <div className="divide-y rounded-lg border">
                    {(request.items ?? []).length === 0 && <p className="p-3 text-sm text-muted-foreground">Belum ada item.</p>}
                    {(request.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3 p-3">
                        <div><p className="text-sm font-medium">{item.title}</p>{item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}</div>
                        <Badge variant="outline">{item.status.replaceAll("_", " ")}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Dokumen tersimpan: {request.documents?.length ?? 0}. Status ini berasal dari request canonical Anda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}