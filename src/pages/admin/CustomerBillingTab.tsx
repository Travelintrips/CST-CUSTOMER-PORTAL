import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileCheck2, Loader2, RefreshCw } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";

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

export function CustomerBillingTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
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

  async function issueInvoice(id: number) {
    setBusy(id);
    try {
      const response = await fetch(`/api/portal/admin/invoices/${id}/action`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "mark_invoiced" }),
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

  async function markPaid(id: number) {
    setBusy(id);
    try {
      const response = await fetch(`/api/portal/admin/payments/${id}/status`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "paid" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal mengonfirmasi payment");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengonfirmasi payment");
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
          <section className="rounded-xl border bg-white overflow-hidden">
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
                    <p className="text-xs text-slate-500">Sisa {money(invoice.outstanding)} · {invoice.invoiceStatus}</p>
                  </div>
                  {invoice.invoiceStatus !== "invoiced" && (
                    <button type="button" disabled={busy === invoice.id} onClick={() => void issueInvoice(invoice.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">
                      {busy === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} Terbitkan invoice
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
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
                    <p className="text-xs text-slate-500">{payment.status} · {payment.paymentMethod ?? "—"}</p>
                  </div>
                  {payment.status === "pending" && (
                    <button type="button" disabled={busy === payment.id} onClick={() => void markPaid(payment.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                      {busy === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Tandai paid
                    </button>
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