import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TruckingDriverPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<Record<number, File | null>>({});

  const load = async () => {
    const r = await fetch(`/api/trucking/driver/${encodeURIComponent(token)}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error ?? d.message ?? "Gagal memuat tugas.");
    setData(d);
  };
  useEffect(() => { void load().catch((e) => setError(e.message)); }, [token]);

  async function action(action: string, stopId?: number) {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/trucking/driver/${encodeURIComponent(token)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, stopId }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Update gagal.");
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function uploadPod(stopId: number) {
    const file = files[stopId];
    if (!file) { setError("Pilih foto POD."); return; }
    setBusy(true); setError(null);
    try {
      const form = new FormData(); form.append("file", file);
      const r = await fetch(`/api/trucking/driver/${encodeURIComponent(token)}/stops/${stopId}/pod`, { method: "POST", body: form });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Upload POD gagal.");
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center p-6">{error ?? "Memuat..."}</div>;
  const isPassenger = data.serviceMode === "passenger";

  return <div className="min-h-screen bg-slate-50 p-4"><div className="max-w-md mx-auto space-y-4">
    <div className="bg-white rounded-2xl border p-4"><p className="text-xs text-slate-400">{isPassenger ? "DRIVER PERJALANAN" : "TRUCKING DRIVER"}</p><h1 className="text-xl font-black mt-1">{data.bookingNumber}</h1><p className="text-sm text-slate-500 mt-1">{data.vehicleName} · {data.assignment.vehiclePlate}</p><p className="text-sm mt-2"><b>Pickup:</b> {data.pickup.address}</p></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {data.allowedActions.includes("driver_to_pickup") && <Button className="w-full" disabled={busy} onClick={() => action("driver_to_pickup")}>Berangkat ke Pickup</Button>}
    {data.allowedActions.includes("picked_up") && <Button className="w-full" disabled={busy} onClick={() => action("picked_up")}>{isPassenger ? "Penumpang Sudah Dijemput" : "Pickup Selesai"}</Button>}
    {data.allowedActions.includes("in_transit") && <Button className="w-full" disabled={busy} onClick={() => action("in_transit")}>Mulai Perjalanan</Button>}
    <div className="space-y-3">{data.stops.map((s: any) => {
      const allowed = data.allowedActions.includes(`deliver_stop:${s.id}`);
      return <div key={s.id} className="bg-white rounded-2xl border p-4"><p className="font-bold">{s.sequenceNo}. {s.address}</p><p className="text-xs text-slate-400 mt-1">{s.status === "delivered" && isPassenger ? "drop-off selesai" : s.status}</p>{s.podUrl && <img src={s.podUrl} className="mt-3 rounded-xl max-h-40 w-full object-cover" />}{allowed && <div className="mt-3 space-y-2">
        {!isPassenger && <>
          <Input type="file" accept="image/*" capture="environment" onChange={(e) => setFiles((x) => ({ ...x, [s.id]: e.target.files?.[0] ?? null }))} />
          <Button variant="outline" className="w-full" disabled={busy || !files[s.id]} onClick={() => uploadPod(s.id)}>Upload POD</Button>
        </>}
        <Button className="w-full" disabled={busy || (!isPassenger && !s.podUrl)} onClick={() => action("deliver_stop", s.id)}>
          {isPassenger ? "Konfirmasi Drop-off Selesai" : "Tandai Tujuan Selesai"}
        </Button>
      </div>}</div>;
    })}</div>
  </div></div>;
}
