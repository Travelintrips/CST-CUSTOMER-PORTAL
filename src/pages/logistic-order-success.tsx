import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, Search, LayoutDashboard, Boxes, Upload,
  FileCheck, AlertCircle, Loader2, CreditCard, ExternalLink,
  RefreshCw, Clock, ShieldCheck, Copy, Check, Truck, Ship,
  Wind, Package, MapPin, ArrowRight, Bell,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { LogisticOrderDetail } from "@shared/api-client-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface PaylabsLinkResult {
  paymentUrl: string | null;
  amount: number;
  expiredAt: string | null;
  configured?: boolean;
  reused?: boolean;
  message?: string;
}

function fmtIdr(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// ── ETA estimation per shipment type ─────────────────────────────────────────
function getEta(shipmentType: string | null | undefined, t: (key: string, fallback: string) => string): { label: string; icon: React.ReactNode; color: string } {
  const s = (shipmentType ?? "").toLowerCase();
  if (s.includes("truck") || s.includes("truk") || s.includes("darat")) {
    return { label: t("logisticOrderSuccess.eta.truck", "1 – 3 hari kerja"), icon: <Truck className="w-4 h-4" />, color: "text-sky-600 bg-sky-50 border-sky-200" };
  }
  if (s.includes("air") || s.includes("udara") || s.includes("pesawat")) {
    return { label: t("logisticOrderSuccess.eta.air", "1 – 5 hari kerja"), icon: <Wind className="w-4 h-4" />, color: "text-violet-600 bg-violet-50 border-violet-200" };
  }
  if (s.includes("sea") || s.includes("laut") || s.includes("ocean") || s.includes("fcl") || s.includes("lcl")) {
    return { label: t("logisticOrderSuccess.eta.sea", "7 – 21 hari (tergantung rute)"), icon: <Ship className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-200" };
  }
  if (s.includes("ppjk") || s.includes("custom") || s.includes("pabean")) {
    return { label: t("logisticOrderSuccess.eta.customs", "2 – 7 hari kerja"), icon: <FileCheck className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 border-amber-200" };
  }
  return { label: t("logisticOrderSuccess.eta.default", "3 – 7 hari kerja"), icon: <Package className="w-4 h-4" />, color: "text-slate-600 bg-slate-50 border-slate-200" };
}

// ── Order progress timeline ───────────────────────────────────────────────────
function OrderTimeline() {
  const { t } = useLanguage();

  const ORDER_STEPS = [
    { key: "received",  label: t("logisticOrderSuccess.steps.received", "Pesanan Diterima"),   desc: t("logisticOrderSuccess.steps.receivedDesc", "Sistem telah mencatat pesanan Anda") },
    { key: "review",    label: t("logisticOrderSuccess.steps.review", "Review Admin"),        desc: t("logisticOrderSuccess.steps.reviewDesc", "Tim kami sedang memverifikasi detail") },
    { key: "vendor",    label: t("logisticOrderSuccess.steps.vendor", "Penawaran Vendor"),    desc: t("logisticOrderSuccess.steps.vendorDesc", "Vendor menyiapkan penawaran harga") },
    { key: "shipping",  label: t("logisticOrderSuccess.steps.shipping", "Dalam Pengiriman"),    desc: t("logisticOrderSuccess.steps.shippingDesc", "Barang dalam perjalanan") },
    { key: "done",      label: t("logisticOrderSuccess.steps.done", "Selesai"),             desc: t("logisticOrderSuccess.steps.doneDesc", "Pesanan terselesaikan") },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" /> {t("logisticOrderSuccess.timeline.title", "Alur Pemrosesan Pesanan")}
      </h3>
      <div className="relative">
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx === 0;
          const isCurrent = idx === 1;
          return (
            <div key={step.key} className="flex gap-3 pb-4 last:pb-0">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isCurrent
                    ? "bg-primary border-primary text-primary-foreground animate-pulse"
                    : "bg-muted border-border text-muted-foreground"
                }`}>
                  {isDone
                    ? <Check className="w-3.5 h-3.5" />
                    : <span className="text-[10px] font-bold">{idx + 1}</span>
                  }
                </div>
                {idx < ORDER_STEPS.length - 1 && (
                  <div className={`w-px flex-1 mt-1 mb-0 ${isDone ? "bg-emerald-300" : "bg-border"}`} />
                )}
              </div>
              {/* Content */}
              <div className="pb-1 min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-tight ${
                  isDone ? "text-emerald-700" : isCurrent ? "text-primary" : "text-muted-foreground"
                }`}>
                  {step.label}
                  {isCurrent && (
                    <Badge className="ml-2 text-[9px] bg-primary/10 text-primary border-primary/20 py-0">{t("logisticOrderSuccess.timeline.now", "Sekarang")}</Badge>
                  )}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${
                  isDone || isCurrent ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Copy-to-clipboard hook ────────────────────────────────────────────────────
function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  }, [timeout]);
  return { copied, copy };
}

// ── Paylabs payment section ───────────────────────────────────────────────────
function PaylabsPaymentSection({ order }: { order: LogisticOrderDetail }) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [result, setResult] = useState<PaylabsLinkResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false);

  const generate = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const r = await fetch(`/api/logistic/orders/${order.orderNumber}/create-paylabs-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await r.json() as PaylabsLinkResult & { message?: string };
      if (!r.ok) throw new Error(data.message ?? t("logisticOrderSuccess.payment.createLinkError", "Gagal membuat link pembayaran"));
      setResult(data);
      setState("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("logisticOrderSuccess.errorGeneric", "Terjadi kesalahan"));
      setState("error");
    }
  }, [order.orderNumber, t]);

  useEffect(() => {
    if (!calledRef.current) { calledRef.current = true; void generate(); }
  }, [generate]);

  return (
    <div className="bg-card border border-emerald-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-sm font-semibold text-emerald-900">{t("logisticOrderSuccess.payment.gatewayTitle", "Bayar via Payment Gateway")}</p>
        <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">Paylabs</Badge>
      </div>
      <div className="p-5 space-y-4">
        {state === "loading" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm text-muted-foreground">{t("logisticOrderSuccess.payment.preparingLink", "Menyiapkan link pembayaran…")}</p>
          </div>
        )}
        {state === "error" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t("logisticOrderSuccess.payment.createLinkFailed", "Gagal Membuat Link Pembayaran")}</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => void generate()}>
              <RefreshCw className="w-4 h-4" /> {t("logisticOrderSuccess.retry", "Coba Lagi")}
            </Button>
          </div>
        )}
        {state === "ready" && result && (
          <>
            {result.paymentUrl ? (
              <>
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("logisticOrderSuccess.payment.orderNumber", "Nomor Pesanan")}</span>
                    <span className="font-bold tracking-wider text-foreground">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("logisticOrderSuccess.payment.totalBill", "Total Tagihan")}</span>
                    <span className="font-bold text-emerald-700">{fmtIdr(result.amount)}</span>
                  </div>
                  {result.expiredAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t("logisticOrderSuccess.payment.validUntil", "Berlaku sampai")}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(result.expiredAt).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {t("logisticOrderSuccess.payment.securedBy", "Pembayaran diamankan oleh Paylabs — mendukung transfer bank, QRIS, e-wallet, dan kartu.")}
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-12 text-base font-bold shadow-md"
                  onClick={() => window.open(result.paymentUrl!, "_blank")}
                >
                  <CreditCard className="w-5 h-5" />
                  {t("logisticOrderSuccess.payment.payNow", "Bayar Sekarang")}
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                </Button>
                {result.reused && (
                  <p className="text-xs text-center text-muted-foreground">
                    {t("logisticOrderSuccess.payment.linkReused", "Link pembayaran sebelumnya masih aktif dan digunakan kembali.")}
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-semibold">{t("logisticOrderSuccess.payment.linkPending", "Link Pembayaran Sedang Disiapkan")}</p>
                <p className="text-xs mt-1">
                  {t("logisticOrderSuccess.payment.linkPendingDesc", "Tim kami akan mengirimkan link pembayaran via WhatsApp/Email setelah order dikonfirmasi.")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderSuccessPage() {
  const { t } = useLanguage();
  const [order, setOrder] = useState<LogisticOrderDetail | null>(null);
  const [, setLocation] = useLocation();
  const search = useSearch();
  const requestedOrderNumber = new URLSearchParams(search).get("order");
  const [proofUploading, setProofUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofError, setProofError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copied: copiedOrder, copy: copyOrder } = useCopy();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (requestedOrderNumber) {
        try {
          const response = await fetch(`/api/logistic/orders/${encodeURIComponent(requestedOrderNumber)}`, {
            credentials: "include",
          });
          if (response.ok) {
            const fresh = await response.json() as LogisticOrderDetail;
            if (!cancelled) {
              setOrder(fresh);
              localStorage.setItem("last_order", JSON.stringify(fresh));
              return;
            }
          }
        } catch { /* fallback to local copy */ }
      }

      try {
        const stored = localStorage.getItem("last_order");
        if (stored && !cancelled) setOrder(JSON.parse(stored));
      } catch { /* ignore */ }
    };

    void load();
    if (localStorage.getItem("last_order_proof_uploaded") === "1") setProofUploaded(true);
    return () => { cancelled = true; };
  }, [requestedOrderNumber]);

  async function handleProofUpload(file: File) {
    setProofError("");
    setProofUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/portal/payment-proof-upload", { method: "POST", body: form });
      const json = await r.json() as { objectPath?: string; message?: string };
      if (!r.ok) throw new Error(json.message ?? t("logisticOrderSuccess.uploadFailed", "Upload gagal"));
      const objectPath = json.objectPath ?? "";
      const orderNum = order?.orderNumber;
      if (orderNum && objectPath) {
        await fetch(`/api/logistic/orders/${orderNum}/payment-proof`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proofUrl: objectPath }),
        });
      }
      setProofUploaded(true);
      localStorage.setItem("last_order_proof_uploaded", "1");
    } catch (err) {
      setProofError(String(err));
    } finally {
      setProofUploading(false);
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground mb-4">{t("logisticOrderSuccess.noOrderData", "Data pesanan tidak ditemukan.")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation("/jasa")}>
              <Boxes className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.viewServices", "Lihat Jasa")}
            </Button>
            <Button onClick={() => setLocation("/dashboard")}>
              <LayoutDashboard className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.toDashboard", "Ke Dashboard")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isGateway =
    order.paymentMethod === "payment_gateway" ||
    (order.paymentType ?? "").startsWith("payment_gateway");

  const eta = getEta(order.shipmentType, t);

  const trackingUrl = `/track?order=${encodeURIComponent(order.orderNumber)}`;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{t("logisticOrderSuccess.hero.title", "Pesanan Berhasil Dibuat!")}</h1>
          <p className="text-primary-foreground/75 text-sm max-w-sm mx-auto">
            {isGateway
              ? t("logisticOrderSuccess.hero.subtitleGateway", "Selesaikan pembayaran di bawah untuk mengkonfirmasi pesanan Anda.")
              : t("logisticOrderSuccess.hero.subtitleTransfer", "Tim kami akan menghubungi Anda segera untuk konfirmasi dan penawaran final.")}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-10 space-y-5">

        {/* ── Order Number + Copy ── */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-widest text-center">
            {t("logisticOrderSuccess.orderNumber", "Nomor Pesanan")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl font-bold text-foreground tracking-widest font-mono">
              {order.orderNumber}
            </p>
            <button
              onClick={() => copyOrder(order.orderNumber)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              title={t("logisticOrderSuccess.copyOrderNumber", "Salin nomor pesanan")}
            >
              {copiedOrder
                ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> {t("logisticOrderSuccess.copied", "Disalin")}</>
                : <><Copy className="w-3.5 h-3.5" /> {t("logisticOrderSuccess.copy", "Salin")}</>
              }
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t("logisticOrderSuccess.saveOrderNumber", "Simpan nomor ini untuk melacak status pesanan Anda")}
          </p>
        </div>

        {/* ── ETA Card ── */}
        <div className={`rounded-2xl border p-4 flex items-start gap-4 ${eta.color}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${eta.color} shrink-0`}>
            {eta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">
              {t("logisticOrderSuccess.estimatedDelivery", "Estimasi Waktu Pengiriman")}
            </p>
            <p className="text-base font-bold leading-tight">{eta.label}</p>
            <p className="text-xs opacity-70 mt-0.5">
              {order.shipmentType
                ? `${t("logisticOrderSuccess.basedOnService", "Berdasarkan tipe layanan")}: ${order.shipmentType}`
                : t("logisticOrderSuccess.etaConfirmedAfterReview", "Estimasi aktual dikonfirmasi oleh tim setelah review")}
            </p>
          </div>
          {order.requiredDate && (
            <div className="text-right shrink-0">
              <p className="text-[10px] opacity-60 uppercase tracking-wide">{t("logisticOrderSuccess.requiredDate", "Tgl. Dibutuhkan")}</p>
              <p className="text-sm font-bold">
                {new Date(order.requiredDate).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* ── Tracking CTA ── */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t("logisticOrderSuccess.trackRealtime", "Lacak Pesanan Real-time")}</p>
              <p className="text-xs text-muted-foreground truncate">
                {t("logisticOrderSuccess.trackDesc", "Status diperbarui secara otomatis — gunakan nomor")} <span className="font-mono font-bold">{order.orderNumber}</span>
              </p>
            </div>
          </div>
          <Button
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold"
            onClick={() => setLocation(trackingUrl)}
          >
            <Search className="w-4 h-4" /> {t("logisticOrderSuccess.trackNow", "Lacak Sekarang")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Notification banner ── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">{t("logisticOrderSuccess.autoNotif", "Notifikasi otomatis")} </span>
            {t("logisticOrderSuccess.notifSentTo", "akan dikirim ke")} <span className="font-semibold">{order.email}</span>
            {order.phone ? ` ${t("logisticOrderSuccess.andWhatsApp", "dan WhatsApp")} ${order.phone}` : ""} {t("logisticOrderSuccess.whenStatusChanges", "saat status pesanan berubah.")}
          </p>
        </div>

        {/* ── Payment Gateway ── */}
        {isGateway && <PaylabsPaymentSection order={order} />}

        {/* ── Route summary ── */}
        {(order.origin || order.destination) && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("logisticOrderSuccess.shipmentDetail", "Detail Pengiriman")}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("logisticOrderSuccess.origin", "Asal")}</p>
                <p className="text-sm font-bold text-foreground">{order.origin ?? "—"}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">{t("logisticOrderSuccess.destination", "Tujuan")}</p>
                <p className="text-sm font-bold text-foreground">{order.destination ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground">{t("logisticOrderSuccess.company", "Perusahaan")}</span>
              <span className="font-medium text-foreground text-right">{order.companyName}</span>
              <span className="text-muted-foreground">{t("logisticOrderSuccess.pic", "PIC")}</span>
              <span className="font-medium text-foreground text-right">{order.customerName}</span>
              <span className="text-muted-foreground">{t("logisticOrderSuccess.serviceType", "Tipe Layanan")}</span>
              <span className="font-medium text-foreground text-right">{order.shipmentType}</span>
              {order.jumlahKoli != null && order.jumlahKoli > 0 && (
                <>
                  <span className="text-muted-foreground">{t("logisticOrderSuccess.jumlahKoli", "Jumlah Koli")}</span>
                  <span className="font-semibold text-foreground text-right">
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                      📦 {order.jumlahKoli} {t("logisticOrderSuccess.koli", "koli")}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Order progress timeline ── */}
        <OrderTimeline />

        {/* ── Order Items ── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">{t("logisticOrderSuccess.serviceDetails", "Rincian Layanan")}</h3>

          {(order.commodity || order.cargoDescription) && (
            <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 space-y-0.5">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">{t("logisticOrderSuccess.commodity", "Barang / Komoditi")}</p>
              {order.commodity && <p className="text-sm font-semibold text-foreground">{order.commodity}</p>}
              {order.cargoDescription && <p className="text-xs text-muted-foreground">{order.cargoDescription}</p>}
            </div>
          )}

          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                <div>
                  <Badge variant="outline" className="text-xs mr-2">{item.category}</Badge>
                  <span className="text-sm font-medium text-foreground">{item.serviceName}</span>
                </div>
                {item.subtotal > 0
                  ? <span className="text-sm font-bold text-accent flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                  : item.calculatorType === "trucking"
                  ? <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 flex-shrink-0">{t("logisticOrderSuccess.pricePending", "Harga menyusul")}</span>
                  : <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 flex-shrink-0">{t("logisticOrderSuccess.priceNego", "Harga nego")}</span>
                }
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          {order.grandTotal > 0 ? (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {order.items.length === 1 ? order.items[0].serviceName : t("logisticOrderSuccess.subtotal", "Subtotal")}
                  </span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    PPN {order.subtotal > 0 && Math.round(order.tax / order.subtotal * 1000) === 11 ? "1,1%" : "11%"}
                  </span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t("logisticOrderSuccess.totalEstimate", "Total Estimasi")}</span>
                  <span className="text-accent">{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic mt-3">
                {t("logisticOrderSuccess.estimateDisclaimer", "Ini adalah estimasi harga. Penawaran final akan dikonfirmasi oleh tim kami.")}
              </p>
            </>
          ) : (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 space-y-0.5">
              <p className="font-semibold">{t("logisticOrderSuccess.priceByVendor", "Harga Akan Diberikan oleh Vendor")}</p>
              <p>{t("logisticOrderSuccess.priceByVendorDesc", "Vendor akan membalas pesanan Anda dengan penawaran harga. Tim kami akan segera menghubungi Anda.")}</p>
            </div>
          )}
        </div>

        {/* ── Upload Bukti Transfer ── */}
        {(order.paymentMethod === "transfer" || (order.paymentType ?? "").startsWith("transfer")) && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-sm font-semibold text-blue-900">{t("logisticOrderSuccess.uploadProof.title", "Upload Bukti Transfer")}</p>
            </div>
            <div className="p-5 space-y-3">
              {proofUploaded ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">{t("logisticOrderSuccess.uploadProof.received", "Bukti pembayaran diterima ✓")}</p>
                    <p className="text-xs text-emerald-700">{t("logisticOrderSuccess.uploadProof.receivedDesc", "Tim kami akan memverifikasi pembayaran Anda segera.")}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t("logisticOrderSuccess.uploadProof.desc", "Unggah screenshot atau foto struk transfer untuk mempercepat verifikasi pembayaran.")}
                  </p>
                  {proofError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {proofError}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleProofUpload(f);
                    }}
                  />
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={proofUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {proofUploading
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("logisticOrderSuccess.uploading", "Mengunggah…")}</>
                      : <><Upload className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.uploadProof.selectFile", "Pilih File (JPG/PNG/PDF, maks. 10 MB)")}</>
                    }
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setLocation(trackingUrl)}
          >
            <Search className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.trackOrder", "Lacak Pesanan")}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setLocation("/jasa")}
          >
            <Boxes className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.viewOtherServices", "Lihat Jasa Lainnya")}
          </Button>
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setLocation("/dashboard")}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> {t("logisticOrderSuccess.toDashboard", "Ke Dashboard")}
          </Button>
        </div>

      </div>
    </div>
  );
}
