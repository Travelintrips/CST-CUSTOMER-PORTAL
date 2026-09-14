import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw, ChevronRight, PlusCircle, FileSearch, AlertCircle } from "lucide-react";

interface PendingApproval {
  id: number;
  approverLevel: number;
  status: string;
  requestedAt: string;
  responseNotes: string | null;
}

interface MktRfq {
  rfqId: number;
  rfqNumber: string;
  rfqStatus: string;
  approvalStatus: string;
  approvalRequestedAt: string | null;
  approvalResolvedAt: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string | null;
  buyerApprovalLevel: number | null;
  notes: string | null;
  requiredDeliveryDate: string | null;
  createdAt: string;
  pendingApproval: PendingApproval | null;
}

const RFQ_STATUS_COLOR: Record<string, { color: string; icon: React.ReactNode }> = {
  draft:           { color: "bg-slate-100 text-slate-700",   icon: <FileSearch className="w-3 h-3" /> },
  submitted:       { color: "bg-blue-100 text-blue-700",     icon: <Clock className="w-3 h-3" /> },
  quoting:         { color: "bg-amber-100 text-amber-700",   icon: <RefreshCw className="w-3 h-3" /> },
  quoted:          { color: "bg-cyan-100 text-cyan-700",     icon: <CheckCircle2 className="w-3 h-3" /> },
  customer_review: { color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="w-3 h-3" /> },
  awarded:         { color: "bg-green-100 text-green-700",   icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:       { color: "bg-red-100 text-red-700",       icon: <XCircle className="w-3 h-3" /> },
  expired:         { color: "bg-gray-100 text-gray-500",     icon: <XCircle className="w-3 h-3" /> },
};

const APPROVAL_STATUS_COLOR: Record<string, string> = {
  none:     "",
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function MktMyRfqsPage() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const authed = isAuthenticated();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [cancelTarget, setCancelTarget] = useState<MktRfq | null>(null);

  function getRfqStatusConfig(status: string): { label: string; color: string; icon: React.ReactNode } {
    const rfqStatusLabelMap: Record<string, string> = {
      draft:           t("mktMyRfqs.rfqStatusDraft"),
      submitted:       t("mktMyRfqs.rfqStatusSubmitted"),
      quoting:         t("mktMyRfqs.rfqStatusQuoting"),
      quoted:          t("mktMyRfqs.rfqStatusQuoted"),
      customer_review: t("mktMyRfqs.rfqStatusCustomerReview"),
      awarded:         t("mktMyRfqs.rfqStatusAwarded"),
      cancelled:       t("mktMyRfqs.rfqStatusCancelled"),
      expired:         t("mktMyRfqs.rfqStatusExpired"),
    };
    const base = RFQ_STATUS_COLOR[status] ?? { color: "bg-gray-100 text-gray-700", icon: null };
    return { label: rfqStatusLabelMap[status] ?? status, ...base };
  }

  function getApprovalConfig(approvalStatus: string): { label: string; color: string } {
    const approvalLabelMap: Record<string, string> = {
      none:     "",
      pending:  t("mktMyRfqs.approvalPending"),
      approved: t("mktMyRfqs.approvalApproved"),
      rejected: t("mktMyRfqs.approvalRejected"),
    };
    return {
      label: approvalLabelMap[approvalStatus] ?? approvalStatus,
      color: APPROVAL_STATUS_COLOR[approvalStatus] ?? "bg-gray-100 text-gray-700",
    };
  }

  const { data, isLoading, isError } = useQuery<{ ok: boolean; data: MktRfq[]; count: number }>({
    queryKey: ["mkt-my-rfqs"],
    queryFn: async () => {
      const res = await fetch("/api/mkt/portal/rfqs", {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error("Gagal memuat RFQ");
      return res.json();
    },
    enabled: authed,
  });

  const submitMutation = useMutation({
    mutationFn: async (rfqId: number) => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqId}/submit`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? t("mktMyRfqs.submitErrorFallback"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("mktMyRfqs.submitSuccess") });
      void qc.invalidateQueries({ queryKey: ["mkt-my-rfqs"] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (rfqId: number) => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? t("mktMyRfqs.cancelErrorFallback"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("mktMyRfqs.cancelSuccess") });
      setCancelTarget(null);
      void qc.invalidateQueries({ queryKey: ["mkt-my-rfqs"] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const rfqs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              {t("mktMyRfqs.pageTitle")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t("mktMyRfqs.pageDesc")}</p>
          </div>
          <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/marketplace">
              <PlusCircle className="w-4 h-4 mr-1" />
              {t("mktMyRfqs.createRfq")}
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center text-red-600">
              {t("mktMyRfqs.fetchError")}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && rfqs.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-500">{t("mktMyRfqs.emptyRfq")}</p>
              <Button asChild variant="outline">
                <Link href="/marketplace">{t("mktMyRfqs.browseMarketplace")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {rfqs.map((rfq) => {
            const st = getRfqStatusConfig(rfq.rfqStatus);
            const ap = getApprovalConfig(rfq.approvalStatus);
            const canSubmit = rfq.rfqStatus === "draft" && rfq.approvalStatus !== "pending";
            const canCancel = rfq.rfqStatus === "draft" || rfq.rfqStatus === "submitted";
            const isCustomerReview = rfq.rfqStatus === "customer_review";
            const isAwarded = rfq.rfqStatus === "awarded";

            return (
              <Card
                key={rfq.rfqId}
                className={`hover:shadow-md transition-shadow cursor-pointer select-none ${isCustomerReview ? "border-orange-300 ring-1 ring-orange-200" : ""}`}
                onClick={() => setLocation(`/marketplace/my-rfqs/${rfq.rfqId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-800">{rfq.rfqNumber}</span>
                        <Badge className={`text-xs ${st.color}`} variant="secondary">
                          <span className="flex items-center gap-1">{st.icon}{st.label}</span>
                        </Badge>
                        {ap.label && (
                          <Badge className={`text-xs ${ap.color}`} variant="secondary">{ap.label}</Badge>
                        )}
                      </div>

                      {rfq.buyerCompany && (
                        <p className="text-xs text-gray-500">{rfq.buyerCompany}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>{t("mktMyRfqs.createdLabel")} {fmtDate(rfq.createdAt)}</span>
                        {rfq.requiredDeliveryDate && (
                          <span>{t("mktMyRfqs.requiredLabel")} {fmtDate(rfq.requiredDeliveryDate)}</span>
                        )}
                      </div>

                      {isCustomerReview && (
                        <p className="text-xs text-orange-700 font-medium mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {t("mktMyRfqs.actionRequired")}
                        </p>
                      )}

                      {isAwarded && (
                        <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {t("mktMyRfqs.poCreated")}
                        </p>
                      )}

                      {rfq.approvalStatus === "rejected" && rfq.pendingApproval?.responseNotes && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                          <span className="font-medium">{t("mktMyRfqs.rejectionReason")}</span> {rfq.pendingApproval.responseNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 items-end shrink-0">
                      {canSubmit && (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); submitMutation.mutate(rfq.rfqId); }}
                          disabled={submitMutation.isPending}
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          {t("mktMyRfqs.submitBtn")}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); setCancelTarget(rfq); }}
                          className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {t("mktMyRfqs.cancelBtn")}
                        </Button>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => { if (!v) setCancelTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("mktMyRfqs.cancelDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              RFQ <strong>{cancelTarget?.rfqNumber}</strong> {t("mktMyRfqs.cancelDialogBodyPost")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("mktMyRfqs.cancelDialogNo")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.rfqId)}
            >
              {t("mktMyRfqs.cancelDialogYes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
