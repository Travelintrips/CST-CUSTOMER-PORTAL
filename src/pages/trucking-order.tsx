import { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, CreditCard, MapPin, Truck, Upload, Wallet } from "lucide-react";

type Order = any;

const STATUS_LABEL: Record<string, string> = {
  pending_review: "Menunggu Review CST",
  waiting_customer_approval: "Menunggu Persetujuan Anda",
  waiting_payment: "Menunggu Pembayaran",
  confirmed: "Dikonfirmasi",
  vehicle_assigned: "Armada Ditugaskan",
  driver_to_pickup: "Driver Menuju Pickup",
  picked_up: "Sudah Pickup",
  in_transit: "Dalam Perjalanan",
  delivered: "Seluruh Tujuan Terkirim",
  balance_due: "Menunggu Pelunasan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

function rupiah(value: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(Number(value ?? 0));
}

export default function TruckingOrderPage() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const [data, setData] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const load = async () => {
    setError(null);
    const r = await fetch(`/api/portal/trucking/orders/${encodeURIComponent(bookingNumber)}`, { credentials: "include" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error ?? d.message ?? "Gagal memuat booking.");
    setData(d);
    if (!amount && d?.totals?.remainingAmount > 0) setAmount(String(d.totals.remainingAmount));
    if (!method && d?.paylabs?.activeMethods?.[0]?.code) setMethod(d.paylabs.activeMethods[0].code);
  };

  useEffect(() => { void load().catch((e) => setError(e.message)); }, [bookingNumber]);

  const initialRequired = Number(data?.totals?.initialRequiredAmount ?? 0);
  const paid = Number(data?.totals?.receivedAmount ?? 0);
  const initialRemaining = Math.max(0, initialRequired - paid);
  const progress = useMemo(() => {
    if (!data?.stops?.length) return 0;
    return data.stops.filter((s: any) => s.status === "delivered").length / data.stops.length * 100;
  }, [data]);

  async function approve(approved: boolean) {
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/portal/trucking/orders/${encodeURIComponent(bookingNumber)}/approve`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Gagal memproses persetujuan.");
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function uploadProof() {
    if (!proof) { setError("Pilih bukti pembayaran."); return; }
    const value = Number(amount);
    if (!(value > 0)) { setError("Nominal pembayaran tidak valid."); return; }
    setBusy(true); setError(null);
    try {
      const form = new FormData();
      form.append("amount", String(value));
      form.append("file", proof);
      const r = await fetch(`/api/portal/trucking/orders/${encodeURIComponent(bookingNumber)}/payments/manual`, {
        method: "POST", credentials: "include", body: form,
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Upload bukti gagal.");
      setProof(null);
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function payPaylabs() {
    const value = Number(amount);
    if (!(value > 0) || !method) { setError("Pilih metode dan nominal pembayaran."); return; }
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/portal/trucking/orders/${encodeURIComponent(bookingNumber)}/payments/paylabs`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method, amount: value }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Gagal membuat pembayaran Paylabs.");
      const url = d?.payment?.paymentUrl;
      if (url) window.location.assign(url);
      else await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  if (!data) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm text-slate-500">{error ?? "Memuat booking..."}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Booking Trucking</p>
              <h1 className="text-2xl font-black text-slate-900 mt-1">{data.bookingNumber}</h1>
              <p className="text-sm text-slate-500 mt-1">{data.vehicleName} · {data.tripCount} trip</p>
            </div>
            <Badge className="text-xs">{STATUS_LABEL[data.status] ?? data.status}</Badge>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-blue-600" /> Rute</div>
            <div className="mt-4 space-y-3 text-sm">
              <div><span className="font-semibold">Pickup:</span> {data.pickup.address}</div>
              {data.stops.map((stop: any) => (
                <div key={stop.id} className="flex gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${stop.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{stop.sequenceNo}</div>
                  <div className="flex-1">
                    <p>{stop.address}</p>
                    <p className="text-xs text-slate-400">{stop.status === "delivered" ? "Terkirim" : "Menunggu"}</p>
                    {stop.podUrl && <a className="text-xs text-blue-600 underline" href={stop.podUrl} target="_blank">Lihat POD</a>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 font-bold"><Wallet className="h-4 w-4 text-blue-600" /> Pembayaran</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Harga Final</p><p className="font-bold">{data.finalPrice ? rupiah(data.finalPrice) : "Menunggu review"}</p></div>
              <div><p className="text-xs text-slate-400">Sudah Dibayar</p><p className="font-bold text-emerald-600">{rupiah(data.totals.receivedAmount)}</p></div>
              <div><p className="text-xs text-slate-400">Sisa Tagihan</p><p className="font-bold">{rupiah(data.totals.remainingAmount)}</p></div>
              <div><p className="text-xs text-slate-400">Syarat Awal</p><p className="font-bold">{data.paymentTerms.type === "dp" ? `DP ${data.paymentTerms.dp_percent}%` : "Lunas"}</p></div>
            </div>
            {data.status === "waiting_payment" && initialRemaining > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">Minimal pembayaran awal yang masih diperlukan: {rupiah(initialRemaining)}</p>
            )}
          </div>
        </div>

        {data.status === "waiting_customer_approval" && (
          <div className="rounded-2xl bg-white border border-blue-200 p-5">
            <h2 className="font-black">Persetujuan Harga Final</h2>
            <p className="mt-2 text-sm text-slate-600">CST menetapkan harga final <strong>{rupiah(data.finalPrice)}</strong>. Setelah disetujui, pembayaran dapat dilakukan.</p>
            <div className="mt-4 flex gap-2">
              <Button disabled={busy} onClick={() => approve(true)}>Setujui & Lanjut Pembayaran</Button>
              <Button disabled={busy} variant="outline" onClick={() => approve(false)}>Tolak / Minta Revisi</Button>
            </div>
          </div>
        )}

        {["waiting_payment","balance_due","confirmed","vehicle_assigned","driver_to_pickup","picked_up","in_transit","delivered"].includes(data.status) && data.totals.remainingAmount > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <h2 className="font-black flex items-center gap-2"><CreditCard className="h-4 w-4" /> Bayar Tagihan</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Paylabs</p>
                <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white">
                  <option value="">Pilih metode pembayaran</option>
                  {(data.paylabs?.activeMethods ?? []).map((m: any) => <option key={m.code} value={m.code}>{m.label}</option>)}
                </select>
                <Button className="w-full" disabled={busy || !data.paylabs?.canCreate} onClick={payPaylabs}>Bayar via Paylabs</Button>
              </div>
              <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4">
                <p className="text-sm font-semibold">Transfer Manual</p>
                <Input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
                <Button className="w-full" variant="outline" disabled={busy || !proof} onClick={uploadProof}><Upload className="h-4 w-4 mr-2" /> Upload Bukti</Button>
                <p className="text-xs text-slate-400">Bukti transfer akan diverifikasi admin sebelum pembayaran dihitung.</p>
              </div>
            </div>
          </div>
        )}

        {data.assignment?.driverName && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <h2 className="font-black flex items-center gap-2"><Truck className="h-4 w-4" /> Armada</h2>
            <div className="mt-3 text-sm grid sm:grid-cols-3 gap-3">
              <div><p className="text-xs text-slate-400">Driver</p><p className="font-semibold">{data.assignment.driverName}</p></div>
              <div><p className="text-xs text-slate-400">Nomor Polisi</p><p className="font-semibold">{data.assignment.vehiclePlate}</p></div>
              <div><p className="text-xs text-slate-400">Status</p><p className="font-semibold">{STATUS_LABEL[data.status] ?? data.status}</p></div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-black flex items-center gap-2"><Clock className="h-4 w-4" /> Riwayat Status</h2>
          <div className="mt-4 space-y-3">
            {data.events.map((event: any) => (
              <div key={event.id} className="flex gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <div><p className="font-semibold">{STATUS_LABEL[event.status] ?? event.status}</p><p className="text-xs text-slate-400">{event.notes ?? ""} · {new Date(event.createdAt).toLocaleString("id-ID")}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
