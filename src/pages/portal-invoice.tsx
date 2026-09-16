import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { isAuthenticated } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Receipt, CreditCard, Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";

interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  amount: number;
  amountPaid?: number;
  outstanding?: number;
  status: string;
  paymentStatus?: string;
  invoiceStatus?: string;
  dueDate: string | null;
  createdAt: string;
  orderNumber?: string;
}

interface InvoiceDetail extends InvoiceItem {
  documentNumber?: string;
  canDownload?: boolean;
  paymentProof?: { uploaded: boolean; uploadedAt: string | null; remarks: string | null };
  lines?: Array<{ id: number; name: string; quantity: number; subtotal: number }>;
  payments?: Array<{
    id: number;
    amount: number;
    status: string;
    paymentMethod?: string | null;
    paidAt?: string | null;
    createdAt: string;
  }>;
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const STATUS_COLOR: Record<string, string> = {
  unpaid:  "bg-orange-100 text-orange-700",
  partial: "bg-amber-100 text-amber-700",
  paid:    "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum dibayar",
  partial: "Sebagian dibayar",
  paid: "Lunas",
  overdue: "Jatuh tempo",
  pending: "Menunggu konfirmasi",
  waiting_confirmation: "Menunggu konfirmasi",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export default function PortalInvoice() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [detailError, setDetailError] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    if (!authed) setLocation("/login");
  }, [authed, setLocation]);

  const { data: invoices = [], isLoading, refetch } = useQuery<InvoiceItem[]>({
    queryKey: ["portal-invoices"],
    queryFn: async () => {
      const r = await fetch("/api/portal/me/invoices", { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<InvoiceItem[]>;
    },
    enabled: authed,
    staleTime: 60_000,
  });

  if (!authed) return null;

  const unpaidTotal = invoices
    .filter(i => i.status !== "paid")
    .reduce((s, i) => s + (i.outstanding ?? i.amount), 0);

  const dateLocale = locale.startsWith("ar") ? "ar-SA" : locale.startsWith("zh") ? "zh-CN" : locale.startsWith("fr") ? "fr-FR" : "id-ID";

  async function openDetail(id: number) {
    setDetailLoading(id);
    setDetailError("");
    try {
      const response = await fetch(`/api/portal/me/invoices/${id}`, { credentials: "include", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? body.error ?? "Gagal memuat detail invoice");
      setSelected(body as InvoiceDetail);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Gagal memuat detail invoice");
    } finally {
      setDetailLoading(null);
    }
  }

  async function submitPayment() {
    if (!selected || (selected.outstanding ?? 0) <= 0 || paymentSubmitting) return;
    setPaymentSubmitting(true);
    setPaymentMessage("");
    try {
      const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const response = await fetch(`/api/portal/me/invoices/${selected.id}/payments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `portal-payment-${selected.id}-${randomPart}`,
        },
        body: JSON.stringify({ paymentMethod: "portal_manual" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Gagal membuat payment");
      setPaymentMessage("Payment berhasil dibuat dan menunggu konfirmasi admin.");
      await refetch();
      await openDetail(selected.id);
    } catch (cause) {
      setPaymentMessage(cause instanceof Error ? cause.message : "Gagal membuat payment");
    } finally {
      setPaymentSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <div className="container px-4 md:px-6 max-w-5xl">

        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/dashboard")}
          className="inline-flex items-center gap-1.5 mb-5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
        </button>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("portalInvoice.title")}</h1>
            <p className="text-slate-500 mt-1">{t("portalInvoice.subtitle")}</p>
          </div>
          {unpaidTotal > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs text-orange-500">{t("portalInvoice.totalUnpaid")}</p>
                <p className="text-sm font-bold text-orange-700">{idr(unpaidTotal)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Receipt className="h-5 w-5 text-sky-600" />
            <h2 className="font-semibold text-slate-800">{t("portalInvoice.invoiceList")}</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : invoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      inv.status === "paid" ? "bg-emerald-50" : "bg-orange-50"
                    }`}>
                      {inv.status === "paid"
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        : <CreditCard className="h-5 w-5 text-orange-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{inv.invoiceNumber}</p>
                      {inv.orderNumber && (
                        <p className="text-xs text-slate-400">
                          {t("portalInvoice.orderRef").replace("{number}", inv.orderNumber)}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(inv.createdAt).toLocaleDateString(dateLocale)}
                        {inv.dueDate && ` · ${t("portalInvoice.dueDateLabel")}: ${new Date(inv.dueDate).toLocaleDateString(dateLocale)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">{idr(inv.amount)}</p>
                      <Badge className={`text-[11px] ${STATUS_COLOR[inv.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABEL[inv.status] ?? inv.status}
                      </Badge>
                      {inv.paymentStatus && inv.paymentStatus !== inv.status && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {STATUS_LABEL[inv.paymentStatus] ?? inv.paymentStatus}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void openDetail(inv.id)}
                      disabled={detailLoading === inv.id}
                      className="text-[12px] h-8 px-3 gap-1.5 shrink-0"
                    >
                      {detailLoading === inv.id ? "Memuat…" : "Lihat detail"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{t("portalInvoice.emptyTitle")}</h3>
              <p className="text-slate-400 text-sm max-w-sm">{t("portalInvoice.emptyDesc")}</p>
              <Link href="/orders" className="mt-6">
                <Button variant="outline" className="gap-2">
                  {t("portalInvoice.viewShipments")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {detailError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {detailError}
          </div>
        )}

        {selected && (
          <section className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Detail invoice</p>
                <h2 className="font-semibold text-slate-800">{selected.invoiceNumber}</h2>
              </div>
              <button
                type="button"
                onClick={() => { setSelected(null); setPaymentMessage(""); }}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-400">Total invoice</p>
                  <p className="font-semibold text-slate-800">{idr(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sudah dibayar</p>
                  <p className="font-semibold text-emerald-700">{idr(selected.amountPaid ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sisa pembayaran</p>
                  <p className="font-semibold text-orange-700">{idr(selected.outstanding ?? selected.amount)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={STATUS_COLOR[selected.status] ?? "bg-slate-100 text-slate-600"}>
                  {STATUS_LABEL[selected.status] ?? selected.status}
                </Badge>
                {selected.invoiceStatus && (
                  <span className="text-xs text-slate-500">Invoice: {selected.invoiceStatus}</span>
                )}
              </div>

              {selected.payments && selected.payments.length > 0 && (
                <div className="rounded-xl border border-slate-100 divide-y">
                  <p className="px-4 py-3 text-sm font-semibold text-slate-700">Riwayat payment</p>
                  {selected.payments.map((payment) => (
                    <div key={payment.id} className="px-4 py-3 flex flex-wrap justify-between gap-2 text-sm">
                      <span className="text-slate-500">
                        {new Date(payment.createdAt).toLocaleDateString(dateLocale)} · {payment.paymentMethod ?? "Manual"}
                      </span>
                      <span className="font-medium text-slate-700">
                        {idr(payment.amount)} · {STATUS_LABEL[payment.status] ?? payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {paymentMessage && (
                <div className={`rounded-lg px-4 py-3 text-sm ${
                  paymentMessage.includes("berhasil")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {paymentMessage}
                </div>
              )}

              {selected.status !== "paid" && (selected.outstanding ?? 0) > 0 && selected.invoiceStatus === "invoiced" && (
                <Button
                  onClick={() => void submitPayment()}
                  disabled={paymentSubmitting}
                  className="bg-sky-600 hover:bg-sky-700 text-white gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentSubmitting ? "Membuat payment…" : "Ajukan pembayaran"}
                </Button>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
