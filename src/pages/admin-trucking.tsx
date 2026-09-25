import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function rupiah(v: number | null | undefined) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v ?? 0));
}

export default function AdminTruckingPage() {
  const { bookingNumber } = useParams<{ bookingNumber?: string }>();
  const [list, setList] = useState<any[]>([]);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [finalPrice, setFinalPrice] = useState("");
  const [dpPercent, setDpPercent] = useState("100");
  const [paymentDueAt, setPaymentDueAt] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [toll, setToll] = useState("0");
  const [parking, setParking] = useState("0");

  const load = async () => {
    setError(null);
    const url = bookingNumber
      ? `/api/portal/admin/trucking/${encodeURIComponent(bookingNumber)}`
      : "/api/portal/admin/trucking";
    const r = await fetch(url, { credentials: "include" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error ?? d.message ?? "Gagal memuat data.");
    if (bookingNumber) {
      setData(d);
      setFinalPrice(String(d.finalPrice ?? d.estimate ?? ""));
      setDpPercent(String(d.paymentTerms?.type === "dp" ? d.paymentTerms.dp_percent : 100));
      setPaymentDueAt(d.paymentDueAt ? String(d.paymentDueAt).slice(0,16) : "");
      setDriverName(d.assignment?.driverName ?? "");
      setDriverPhone(d.assignment?.driverPhone ?? "");
      setVehiclePlate(d.assignment?.vehiclePlate ?? "");
      setToll(String(d.actualCosts?.toll ?? 0));
      setParking(String(d.actualCosts?.parking ?? 0));
    } else {
      setList(d);
    }
  };

  useEffect(() => { void load().catch((e) => setError(e.message)); }, [bookingNumber]);

  async function post(action: string, body: any) {
    if (!bookingNumber) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/portal/admin/trucking/${encodeURIComponent(bookingNumber)}/${action}`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Aksi gagal.");
      await load();
      return d;
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function reviewPayment(paymentId: number, approved: boolean) {
    if (!bookingNumber) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/portal/admin/trucking/${encodeURIComponent(bookingNumber)}/payments/${paymentId}/review`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, reason: approved ? null : "Bukti pembayaran tidak valid." }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? d.message ?? "Review pembayaran gagal.");
      await load();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  if (!bookingNumber) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black">Operasional Trucking</h1>
          <p className="text-sm text-slate-500 mt-1">Review booking, pembayaran, assignment, dan status perjalanan.</p>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}
          <div className="mt-5 rounded-2xl bg-white border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-left text-xs text-slate-500"><th className="p-3">Booking</th><th className="p-3">Customer</th><th className="p-3">Armada</th><th className="p-3">Status</th><th className="p-3">Pembayaran</th><th className="p-3">Harga</th><th className="p-3"></th></tr></thead>
              <tbody>{list.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="p-3 font-semibold">{row.bookingNumber}</td><td className="p-3">{row.customerName ?? row.customerEmail}</td><td className="p-3">{row.vehicleName}</td><td className="p-3"><Badge>{row.status}</Badge></td><td className="p-3">{row.paymentStatus}</td><td className="p-3">{rupiah(row.finalPrice ?? row.estimate)}</td><td className="p-3"><Link href={`/admin/trucking/${row.bookingNumber}`} className="text-blue-600 font-semibold">Buka</Link></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center">{error ?? "Memuat..."}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div><Link href="/admin/trucking" className="text-sm text-blue-600">← Semua booking</Link><h1 className="text-2xl font-black mt-2">{data.bookingNumber}</h1><div className="mt-2 flex gap-2"><Badge>{data.status}</Badge><Badge variant="secondary">{data.paymentStatus}</Badge></div></div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-5">
            <h2 className="font-black">Review & Harga Final</h2>
            <div className="mt-3 space-y-3">
              <Input type="number" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} placeholder="Harga final" />
              <select className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm" value={dpPercent} onChange={(e) => setDpPercent(e.target.value)}>
                <option value="100">Bayar Lunas Sebelum Jalan</option>
                <option value="50">DP 50%</option>
                <option value="30">DP 30%</option>
              </select>
              <Input type="datetime-local" value={paymentDueAt} onChange={(e) => setPaymentDueAt(e.target.value)} />
              <Button disabled={busy} onClick={() => post("review", {
                finalPrice: Number(finalPrice),
                paymentTerms: Number(dpPercent) === 100 ? { type: "full" } : { type: "dp", dpPercent: Number(dpPercent) },
                paymentDueAt: paymentDueAt || null,
              })}>Kirim Harga ke Customer</Button>
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-slate-200 p-5">
            <h2 className="font-black">Assignment Armada</h2>
            <div className="mt-3 space-y-3">
              <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Nama driver" />
              <Input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="No. HP driver" />
              <Input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="Nomor polisi" />
              <Button disabled={busy} onClick={() => post("assign", { driverName, driverPhone, vehiclePlate })}>Assign Armada</Button>
              {data.assignment?.driverToken && <p className="text-xs text-slate-500 break-all">Driver link: <a className="text-blue-600 underline" href={`/trucking/driver/${data.assignment.driverToken}`} target="_blank">{location.origin}/trucking/driver/{data.assignment.driverToken}</a></p>}
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-black">Pembayaran</h2>
          <div className="mt-2 text-sm">Harga dasar {rupiah(data.finalPrice)} · Total tagihan {rupiah(data.totals.totalAmount)} · Dibayar {rupiah(data.totals.receivedAmount)} · Sisa {rupiah(data.totals.remainingAmount)}</div>
          <div className="mt-4 space-y-3">{data.payments.map((p: any) => <div key={p.id} className="rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-3"><div className="flex-1"><p className="font-semibold">{rupiah(p.amount)} · {p.status}</p><p className="text-xs text-slate-400">{p.paymentKind}</p></div>{p.proofUrl && <a href={p.proofUrl} target="_blank" className="text-xs text-blue-600 underline">Lihat bukti</a>}{p.status === "submitted" && <><Button size="sm" disabled={busy} onClick={() => reviewPayment(p.id, true)}>Setujui</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => reviewPayment(p.id, false)}>Tolak</Button></>}</div>)}</div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-black">Biaya Aktual</h2>
          <div className="mt-3 grid sm:grid-cols-3 gap-3"><Input type="number" value={toll} onChange={(e) => setToll(e.target.value)} placeholder="Tol" /><Input type="number" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="Parkir" /><Button disabled={busy} onClick={() => post("actual-costs", { toll: Number(toll), parking: Number(parking), extra: 0 })}>Simpan Biaya Aktual</Button></div>
        </section>

        <section className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-black">Tujuan & POD</h2>
          <div className="mt-3 space-y-3">{data.stops.map((s: any) => <div key={s.id} className="rounded-xl border border-slate-200 p-3"><p className="font-semibold">{s.sequenceNo}. {s.address}</p><p className="text-xs text-slate-400">{s.status}</p>{s.podUrl && <a className="text-xs text-blue-600 underline" href={s.podUrl} target="_blank">Lihat POD</a>}</div>)}</div>
        </section>
      </div>
    </div>
  );
}
