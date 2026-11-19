import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileCheck2, Loader2, RefreshCw } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";
import { requestBizPortalInvoiceProof, requestRemoteBizPortalInvoiceProof } from "@/lib/bizportal-invoice-proof";

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
  const [remoteApproval, setRemoteApproval] = useState<{invoiceId:number,url:string}|null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders();
      const [invoiceResponse, paymentResponse] = await Promise.all([
        fetch("/api/portal/admin/invoices", { headers, credentials: "include", cache: "no-store" }),
        fetch("/api/portal/admin/payments", { headers, credentials: "include", cache: "no-store" }),
      ]);
      const invoiceBody = await invoiceResponse.json();
      const paymentBody = await paymentResponse.json();
      if (!invoiceResponse.ok) throw new Error(invoiceBody.message ?? "Gagal memuat invoice");
      if (!paymentResponse.ok) throw new Error(paymentBody.message ?? "Gagal memuat payment");
      setInvoices(invoiceBody.items ?? []);
      setPayments(paymentBody.items ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat data finance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function issueInvoice(id: number, remoteOwner = false) {
    setBusy(id);
    try {
      // The default-OFF UI and existing Invoice action remain unchanged.
      // Only a separately enabled DEV build invokes the BizPortal popup.
      const externalAuth = import.meta.env.VITE_CUSTOMER_PORTAL_BIZPORTAL_ATTEST_DEV === "true"
        ? remoteOwner
          ? await requestRemoteBizPortalInvoiceProof(id,getAuthHeaders(),url=>
              setRemoteApproval(url?{invoiceId:id,url}:null))
          : await requestBizPortalInvoiceProof(id, getAuthHeaders())
        : {};
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
      setRemoteApproval(null);
      setBusy(null);
    }
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
                  {remoteApproval?.invoiceId===invoice.id && (
                    <div className="w-full rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm">
                      <p className="font-medium text-slate-900">Menunggu satu persetujuan Owner/Super Admin</p>
                      <p className="mt-1 text-slate-600">Salin tautan ini lalu kirim kepada Owner. Owner membuka tautan pada HP atau komputer sendiri dan menyetujui melalui sesi OTP BizPortal.</p>
                      <input aria-label="Tautan persetujuan Owner" readOnly value={remoteApproval.url}
                        className="mt-2 w-full rounded border bg-white p-2 text-xs text-slate-800" onFocus={e=>e.currentTarget.select()}/>
                      <button type="button" className="mt-2 rounded border border-sky-500 px-3 py-2 text-sky-700"
                        onClick={()=>void navigator.clipboard?.writeText(remoteApproval.url)}>
                        Salin tautan
                      </button>
                      <p className="mt-1 text-xs text-slate-600">Tautan berlaku 90 detik. Invoice belum diterbitkan sampai persetujuan terverifikasi.</p>
                    </div>
                  )}
                  {invoice.invoiceStatus !== "invoiced" &&
                   import.meta.env.VITE_CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV === "true" &&
                   import.meta.env.VITE_CUSTOMER_PORTAL_BIZPORTAL_ATTEST_DEV === "true" && (
                    <button type="button" disabled={busy!==null}
                      onClick={() => void issueInvoice(invoice.id,true)}
                      className="rounded-lg border border-sky-500 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50">
                      Minta persetujuan Owner (perangkat lain)
                    </button>
                  )}
                  {invoice.invoiceStatus !== "invoiced" && (
                    <button type="button" disabled={busy === invoice.id} onClick={() => void issueInvoice(invoice.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">
                      {busy === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} Terbitkan invoice
                    </button>
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