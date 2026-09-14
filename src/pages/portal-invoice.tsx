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
  status: string;
  dueDate: string | null;
  createdAt: string;
  orderNumber?: string;
}

interface InvoiceDetail extends InvoiceItem {
  documentNumber?: string;
  amountPaid: number;
  outstanding: number;
  canDownload?: boolean;
  paymentProof?: { uploaded: boolean; uploadedAt: string | null; remarks: string | null };
  lines?: Array<{ id: number; name: string; quantity: number; subtotal: number }>;
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const STATUS_COLOR: Record<string, string> = {
  unpaid:  "bg-orange-100 text-orange-700",
  paid:    "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function PortalInvoice() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!authed) setLocation("/login");
  }, [authed, setLocation]);

  const { data: invoices = [], isLoading } = useQuery<InvoiceItem[]>({
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

  const unpaidTotal = invoices.filter(i => i.status === "unpaid" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  const dateLocale = locale.startsWith("ar") ? "ar-SA" : locale.startsWith("zh") ? "zh-CN" : locale.startsWith("fr") ? "fr-FR" : "id-ID";

  async function openDetail(id: number) {
    setDetailLoading(id);
    setDetailError("");
    try {
      const response = await fetch(`/api/portal/me/invoices/${id}`, { credentials: "include", cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Gagal memuat detail invoice");
      setSelected(body as InvoiceDetail);
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Gagal memuat detail invoice");
    } finally {
      setDetailLoading(null);
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
                        {inv.status}
                      </Badge>
                    </div>
                    {(inv.status === "unpaid" || inv.status === "overdue") && (
                      <Link href={`/orders`}>
                        <Button size="sm" className="text-[12px] h-8 px-3 bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shrink-0">
                          <CreditCard className="h-3.5 w-3.5" /> {t("portalInvoice.payBtn")}
                        </Button>
                      </Link>
                    )}
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

      </div>
    </div>
  );
}
