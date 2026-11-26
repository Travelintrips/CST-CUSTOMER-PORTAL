import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileCheck2, Loader2, RefreshCw } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { requestBizPortalInvoiceProof } from "@/lib/bizportal-invoice-proof";
import { selectCustomerInvoiceApprovalMode, type CustomerInvoiceApprovalMode } from "@/lib/customer-invoice-approval-mode";

type Invoice = {
  id: number;
  invoiceNumber: string;
  documentNumber: string;
  customerName: string;
  amount: number;
  amountPaid: number;
  outstanding: number;
  status: string;
  invoiceStatus: string;
  paymentStatus: string;
  documentStatus: string;
  dueDate: string | null;
  createdAt: string;
};

type OwnerHandoff = {
  ticket:string;
  approvalUrl:string;
  expiresInSeconds:number;
};

type Payment = {
  id: number;
  refId: number;
  refDocNumber: string;
  invoiceNumber?: string | null;
  customerName?: string | null;
  amount: number;
  status: string;
  paymentMethod?: string | null;
  createdAt: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const date = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value)) : "—";

const statusLabel: Record<string, string> = {
  to_invoice: "Siap diterbitkan",
  invoiced: "Terbit",
  unpaid: "Belum dibayar",
  partial: "Sebagian dibayar",
  paid: "Lunas",
  pending: "Menunggu konfirmasi",
  waiting_confirmation: "Menunggu konfirmasi",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export function CustomerBillingTab({ initialView = "all" }: { initialView?: "all" | "payments" }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [automaticInvoiceIds, setAutomaticInvoiceIds] = useState<number[]>([]);
  const [handoffs,setHandoffs] = useState<Record<number,OwnerHandoff>>({});
  // Only authenticated server flags can enable this DEV-only handoff.
  const [approvalMode,setApprovalMode] = useState<CustomerInvoiceApprovalMode>("unavailable");
  const handoffEnabled = approvalMode === "handoff";

  const load = useCallback(async () => {
    setLoading(true);
    // A failed refresh must never leave an old Owner/automatic mode visible.
    setApprovalMode("unavailable");
    setAutomaticInvoiceIds([]);
    setError("");
    try {
      const headers = getAuthHeaders();
      const [invoiceResponse, paymentResponse, approvalResponse] = await Promise.all([
        fetch("/api/portal/admin/invoices", { headers, credentials: "include", cache: "no-store" }),
        fetch("/api/portal/admin/payments", { headers, credentials: "include", cache: "no-store" }),
        fetch("/api/portal/admin/accounting/attestation-config", {
          headers, credentials: "include", cache: "no-store",
        }).catch(() => null),
      ]);
      const invoiceBody = await invoiceResponse.json();
      const paymentBody = await paymentResponse.json();
      if (!invoiceResponse.ok) throw new Error(invoiceBody.message ?? "Gagal memuat invoice");
      if (!paymentResponse.ok) throw new Error(paymentBody.message ?? "Gagal memuat payment");
      const approvalConfig = approvalResponse?.ok
        ? await approvalResponse.json().catch(() => null) : null;
      setApprovalMode(selectCustomerInvoiceApprovalMode(approvalConfig));
      setAutomaticInvoiceIds(Array.isArray(invoiceBody.automaticInvoiceIds)
        ? invoiceBody.automaticInvoiceIds.filter((id: unknown): id is number => Number.isSafeInteger(id) && Number(id) > 0)
        : []);
      setInvoices(invoiceBody.items ?? []);
      setPayments(paymentBody.items ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat data finance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function issueInvoice(id: number, verifiedAuth?:{
    bizportalInvoiceChallenge:string;bizportalInvoiceProof:string;
  }) {
    setBusy(id);
    try {
      // The default-OFF UI and existing Invoice action remain unchanged.
      // Only a separately enabled DEV build invokes the BizPortal popup.
      const externalAuth = verifiedAuth ?? (
        import.meta.env.VITE_CUSTOMER_PORTAL_BIZPORTAL_ATTEST_DEV === "true"
          ? await requestBizPortalInvoiceProof(id, getAuthHeaders())
          : {}
      );
      const response = await fetch(`/api/portal/admin/invoices/${id}/action`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "mark_invoiced", ...externalAuth }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal menerbitkan invoice");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menerbitkan invoice");
    } finally {
      setBusy(null);
    }
  }

  // The dashboard's periodic GET is read-only. Issuing QA #108 only occurs
  // after an intentional click, current server readiness check, and confirmation.
  async function issueAutomaticPilot(id: number) {
    if (id !== 108 || !automaticInvoiceIds.includes(id) || busy !== null) return;
    setBusy(id);
    setError("");
    try {
      const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
      const readiness = await fetch("/api/portal/admin/invoices/auto-issue-status", {
        method: "GET", headers, credentials: "include", cache: "no-store",
      });
      const status = await readiness.json();
      if (!readiness.ok) throw new Error(status.message ?? status.error ?? "Kesiapan invoice tidak tersedia.");
      if (status.readOnly !== true || status.companyId !== 1 || status.ready !== true || status.actorReady !== true) {
        const reason = status.results?.find((item: { invoiceId?: number; status?: string; message?: string }) =>
          item.invoiceId === 108 && item.status === "blocked")?.message;
        throw new Error(reason ?? "Pengaman AR/Invoice CST-DEV belum siap. Tidak ada penerbitan.");
      }
      if (!window.confirm("Terbitkan Invoice QA #108 CST-DEV sekarang? Tindakan ini dapat membuat jurnal GL, PPN, AR dan audit. Tidak ada pembayaran atau pengiriman eksternal.")) return;
      const result = await fetch("/api/portal/admin/invoices/auto-issue-ready", {
        method: "POST", headers, credentials: "include", cache: "no-store",
        body: JSON.stringify({}),
      });
      const outcome = await result.json();
      if (!result.ok) throw new Error(outcome.message ?? "Penerbitan Invoice QA gagal.");
      const issued = outcome.results?.find((item: { invoiceId?: number; status?: string; invoiceNumber?: string }) =>
        item.invoiceId === 108 && item.status === "invoiced" && typeof item.invoiceNumber === "string");
      if (outcome.invoiced !== 1 || !issued) {
        const reason = outcome.results?.find((item: { invoiceId?: number; message?: string }) =>
          item.invoiceId === 108)?.message;
        throw new Error(reason ?? "Tidak ada bukti Invoice #108 diterbitkan. Status harus diperiksa.");
      }
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invoice QA #108 tertahan.");
    } finally {
      setBusy(null);
    }
  }

  async function startOwnerHandoff(id:number) {
    if(!handoffEnabled)return;
    setBusy(id);
    setError("");
    try {
      const response=await fetch(`/api/portal/admin/invoices/${id}/owner-handoff`,{
        method:"POST",credentials:"include",
        headers:getAuthHeaders(),
      });
      const body=await response.json();
      if(!response.ok)throw Error(body.message??"Gagal membuat link persetujuan Owner.");
      if(typeof body.ticket!=="string" || typeof body.approvalUrl!=="string")
        throw Error("Link otorisasi Owner tidak valid.");
      setHandoffs(prev=>({...prev,[id]:body as OwnerHandoff}));
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Gagal membuat link Owner.");
    }finally{setBusy(null);}
  }

  async function finishOwnerHandoff(id:number) {
    const handoff=handoffs[id];
    if(!handoff)return;
    setBusy(id);
    setError("");
    try {
      const response=await fetch(
        `/api/portal/admin/invoices/${id}/owner-handoff/${encodeURIComponent(handoff.ticket)}`,{
          credentials:"include",cache:"no-store",headers:getAuthHeaders(),
        });
      const body=await response.json();
      if(!response.ok)throw Error(body.message??"Persetujuan Owner belum tersedia.");
      if(body.ready!==true){
        setError("Persetujuan Owner belum diterima. Pastikan Owner sudah menekan Setujui satu kali.");
        return;
      }
      setHandoffs(prev=>{const next={...prev};delete next[id];return next;});
      await issueInvoice(id,{
        bizportalInvoiceChallenge:body.bizportalInvoiceChallenge,
        bizportalInvoiceProof:body.bizportalInvoiceProof,
      });
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Gagal memverifikasi persetujuan Owner.");
    }finally{setBusy(null);}
  }

  async function markPaymentStatus(id: number, status: "paid") {
    setBusy(id);
    try {
      const response = await fetch(`/api/portal/admin/payments/${id}/status`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal memperbarui payment");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memperbarui payment");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Invoice & Payment Customer</h2>
          <p className="text-sm text-slate-500 mt-1">Menggunakan sales_documents dan payments canonical.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat data finance…</div>
      ) : (
        <>
          {initialView === "all" && <section className="rounded-xl border bg-white overflow-hidden">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold text-slate-900">Invoice</h3>
            </div>
            <div className="divide-y">
              {invoices.length === 0 && <p className="px-5 py-8 text-sm text-slate-500">Belum ada invoice atau order siap ditagih.</p>}
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{invoice.customerName} · {invoice.documentNumber} · {date(invoice.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{money(invoice.amount)}</p>
                    <p className="text-xs text-slate-500">
                      Sisa {money(invoice.outstanding)} · {statusLabel[invoice.invoiceStatus] ?? invoice.invoiceStatus} · {statusLabel[invoice.paymentStatus] ?? invoice.paymentStatus}
                    </p>
                  </div>
                  {invoice.invoiceStatus !== "invoiced" && (
                    automaticInvoiceIds.includes(Number(invoice.id))
                      ? <div className="flex max-w-xs flex-col gap-2">
                          <p className="text-xs text-slate-500">
                            Invoice QA CST-DEV #108: hanya diproses setelah tindakan Admin Email OTP dan validasi server. Tidak ada penerbitan saat halaman dibuka.
                          </p>
                          <button type="button" disabled={busy !== null || invoice.id !== 108}
                            onClick={() => void issueAutomaticPilot(invoice.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">
                            {busy === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                            Periksa & terbitkan QA #108
                          </button>
                        </div>
                      : <div className="flex flex-col gap-2">
                                            {approvalMode === "legacy" && (
                                              <button type="button" disabled={busy === invoice.id} onClick={() => void issueInvoice(invoice.id)}
                                                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">
                                                {busy === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} Terbitkan invoice
                                              </button>
                                            )}
                                            {approvalMode === "unavailable" && (
                                              <p className="max-w-xs text-xs text-amber-700">
                                                Persetujuan Owner belum siap. Penerbitan ditahan sampai verifikasi DEV tersedia.
                                              </p>
                                            )}
                                            {handoffEnabled && (
                                              <button type="button" disabled={busy === invoice.id}
                                                onClick={() => void startOwnerHandoff(invoice.id)}
                                                className="rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                                Persetujuan Owner dari HP lain
                                              </button>
                                            )}
                                            {handoffEnabled && handoffs[invoice.id] && (
                                              <div className="max-w-sm space-y-2 text-xs">
                                                <p>Owner login ke BizPortal di perangkatnya, buka link berikut, lalu tekan Setujui satu kali. Link berlaku 80 detik.</p>
                                                <input aria-label="Link persetujuan Owner" type="text" readOnly
                                                  value={handoffs[invoice.id].approvalUrl}
                                                  onFocus={event=>event.currentTarget.select()}
                                                  className="w-full rounded border p-2 text-slate-700"/>
                                                <div className="flex gap-2">
                                                  <button type="button" className="rounded border px-3 py-2"
                                                    onClick={() => void navigator.clipboard.writeText(handoffs[invoice.id].approvalUrl).catch(
                                                      ()=>setError("Salin link secara manual dari kolom di atas."))}>
                                                    Salin link
                                                  </button>
                                                  <button type="button" disabled={busy===invoice.id}
                                                    className="rounded bg-sky-600 px-3 py-2 text-white disabled:opacity-50"
                                                    onClick={() => void finishOwnerHandoff(invoice.id)}>
                                                    Periksa & terbitkan
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                  )}
                </div>
              ))}
            </div>
          </section>}
          <section className="rounded-xl border bg-white overflow-hidden">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold text-slate-900">Payment masuk</h3>
            </div>
            <div className="divide-y">
              {payments.length === 0 && <p className="px-5 py-8 text-sm text-slate-500">Belum ada payment customer.</p>}
              {payments.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{payment.invoiceNumber ?? payment.refDocNumber}</p>
                    <p className="text-xs text-slate-500">{payment.customerName ?? "Customer"} · {date(payment.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                    <p className="text-xs text-slate-500">
                      {statusLabel[payment.status] ?? payment.status} · {payment.paymentMethod ?? "—"}
                    </p>
                  </div>
                  {payment.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={busy === payment.id} onClick={() => void markPaymentStatus(payment.id, "paid")}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                        {busy === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Tandai paid
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}