import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { isAuthenticated } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, FileText, Search, ArrowLeft, Receipt, Truck, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";

interface DocItem {
  id: number;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  orderNumber?: string;
}

interface OperationalDoc {
  id: string;
  type: "service_request_document" | "payment_proof" | "pod";
  title: string;
  reference: string | null;
  subtitle?: string | null;
  status: string;
  createdAt: string;
  url: string;
}

const STATUS_COLOR: Record<string, string> = {
  unpaid:  "bg-orange-100 text-orange-700",
  paid:    "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function PortalDokumen() {
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const [search, setSearch] = useState("");
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (!authed) setLocation("/login");
  }, [authed, setLocation]);

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<DocItem[]>({
    queryKey: ["portal-documents"],
    queryFn: async () => {
      const r = await fetch("/api/portal/me/invoices", { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<DocItem[]>;
    },
    enabled: authed,
    staleTime: 60_000,
  });

  const { data: operationalDocs = [], isLoading: operationalLoading } = useQuery<OperationalDoc[]>({
    queryKey: ["portal-operational-documents"],
    queryFn: async () => {
      const r = await fetch("/api/portal/me/documents", { credentials: "include", cache: "no-store" });
      if (!r.ok) return [];
      return r.json() as Promise<OperationalDoc[]>;
    },
    enabled: authed,
    staleTime: 30_000,
  });

  if (!authed) return null;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredInvoices = invoices.filter(doc =>
    !normalizedSearch ||
    doc.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
    (doc.orderNumber ?? "").toLowerCase().includes(normalizedSearch)
  );
  const filteredOperationalDocs = operationalDocs.filter(doc =>
    !normalizedSearch ||
    doc.title.toLowerCase().includes(normalizedSearch) ||
    (doc.reference ?? "").toLowerCase().includes(normalizedSearch) ||
    (doc.subtitle ?? "").toLowerCase().includes(normalizedSearch)
  );
  const isLoading = invoicesLoading || operationalLoading;

  const dateLocale = locale.startsWith("ar") ? "ar-SA" : locale.startsWith("zh") ? "zh-CN" : locale.startsWith("fr") ? "fr-FR" : "id-ID";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <div className="container px-4 md:px-6 max-w-5xl">

        <button
          onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/dashboard")}
          className="inline-flex items-center gap-1.5 mb-5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t("portalDokumen.title")}</h1>
          <p className="text-slate-500 mt-1">{t("portalDokumen.subtitle")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("portalDokumen.searchPlaceholder")}
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Link href="/orders">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Truck className="h-4 w-4" /> {t("portalDokumen.viewAllOrders")}
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-sky-600" />
            <h2 className="font-semibold text-slate-800">{t("portalDokumen.transactionDocs")}</h2>
            {(invoices.length + operationalDocs.length) > 0 && (
              <span className="ml-auto text-xs text-slate-400">
                {t("portalDokumen.documentsCount").replace("{n}", String(invoices.length + operationalDocs.length))}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredInvoices.map(doc => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{doc.invoiceNumber}</p>
                        <Badge className={`text-[11px] ${STATUS_COLOR[doc.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {doc.status}
                        </Badge>
                      </div>
                      {doc.orderNumber && (
                        <p className="text-xs text-slate-400">
                          {t("portalDokumen.orderRef").replace("{number}", doc.orderNumber)}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                        {doc.dueDate && ` · ${t("portalDokumen.dueDateLabel")}: ${new Date(doc.dueDate).toLocaleDateString(dateLocale)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-slate-800 text-sm">{idr(doc.amount)}</p>
                      <p className="text-xs text-slate-400">Commercial Invoice</p>
                    </div>
                    <Link href="/portal-invoice">
                      <Button size="sm" variant="ghost" className="gap-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                        <ExternalLink className="h-3.5 w-3.5" /> {t("portalDokumen.detailBtn")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <Search className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">{t("portalDokumen.noMatchDocs")}</p>
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-sky-600 hover:underline">
                {t("portalDokumen.clearSearch")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{t("portalDokumen.emptyTitle")}</h3>
              <p className="text-slate-400 text-sm max-w-sm">{t("portalDokumen.emptyDesc")}</p>
              <Link href="/orders" className="mt-6">
                <Button variant="outline" className="gap-2">
                  {t("portalDokumen.viewMyOrders")} <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Truck className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="font-semibold text-slate-800">Dokumen Operasional</h2>
              <p className="text-xs text-slate-400">Dokumen yang benar-benar tersedia dari request layanan, pembayaran, dan perjalanan.</p>
            </div>
            {operationalDocs.length > 0 && (
              <span className="ml-auto text-xs text-slate-400">{operationalDocs.length} file</span>
            )}
          </div>

          {operationalLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredOperationalDocs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredOperationalDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      {doc.type === "pod"
                        ? <Truck className="h-4 w-4 text-indigo-600" />
                        : doc.type === "payment_proof"
                          ? <Receipt className="h-4 w-4 text-indigo-600" />
                          : <FileText className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">{doc.title}</p>
                        <Badge className="text-[11px] bg-slate-100 text-slate-600">{doc.status}</Badge>
                      </div>
                      {doc.reference && <p className="text-xs text-slate-400">Ref: {doc.reference}</p>}
                      {doc.subtitle && <p className="text-xs text-slate-400 truncate">{doc.subtitle}</p>}
                      <p className="text-xs text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                      <Download className="h-3.5 w-3.5" /> Buka
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : operationalDocs.length > 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">Tidak ada dokumen operasional yang cocok dengan pencarian.</div>
          ) : (
            <div className="py-12 px-6 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">Belum ada dokumen operasional</p>
              <p className="mt-1 text-xs text-slate-400">File akan muncul otomatis setelah dokumen, bukti pembayaran, atau POD tersedia.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
