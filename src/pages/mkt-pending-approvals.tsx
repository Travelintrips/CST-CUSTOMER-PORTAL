import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isAuthenticated, removeAuthToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ClipboardList, Building2, User, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface MktRfq {
  rfqId: number;
  rfqNumber: string;
  rfqStatus: string;
  approvalStatus: string;
  approvalRequestedAt: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerCompany: string | null;
  buyerRole: string | null;
  buyerDepartment: string | null;
  buyerApprovalLevel: number | null;
  notes: string | null;
  requiredDeliveryDate: string | null;
  createdAt: string;
  pendingApproval: {
    id: number;
    approverLevel: number;
    status: string;
    requestedAt: string;
  } | null;
}

function fmtDate(s: string | null, locale: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function fmtRelative(s: string | null, t: (key: string) => string): string {
  if (!s) return "";
  const d = new Date(s);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return t("pendingApprovals.justNow");
  if (hours < 24) return t("pendingApprovals.hoursAgo").replace("{{n}}", String(hours));
  const days = Math.floor(hours / 24);
  return t("pendingApprovals.daysAgo").replace("{{n}}", String(days));
}

export default function MktPendingApprovalsPage() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const authed = isAuthenticated();
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const [rejectTarget, setRejectTarget] = useState<MktRfq | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveTarget, setApproveTarget] = useState<MktRfq | null>(null);

  const { data, isLoading, isError } = useQuery<{ ok: boolean; data: MktRfq[]; count: number }>({
    queryKey: ["mkt-pending-approvals"],
    queryFn: async () => {
      const res = await fetch("/api/mkt/portal/rfqs/pending-approvals", {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error(t("pendingApprovals.errorFetch"));
      return res.json();
    },
    enabled: authed,
    refetchInterval: 60_000,
  });

  const approveMutation = useMutation({
    mutationFn: async (rfqId: number) => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? t("pendingApprovals.errorApprove"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("pendingApprovals.toastApproved") });
      setApproveTarget(null);
      void qc.invalidateQueries({ queryKey: ["mkt-pending-approvals"] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ rfqId, notes }: { rfqId: number; notes: string }) => {
      const res = await fetch(`/api/mkt/portal/rfqs/${rfqId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? t("pendingApprovals.errorReject"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("pendingApprovals.toastRejected") });
      setRejectTarget(null);
      setRejectNotes("");
      void qc.invalidateQueries({ queryKey: ["mkt-pending-approvals"] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const rfqs = data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            {t("pendingApprovals.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("pendingApprovals.subtitle")}
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center text-red-600">
              {t("pendingApprovals.errorLoad")}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && rfqs.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto" />
              <p className="text-gray-500 font-medium">{t("pendingApprovals.emptyTitle")}</p>
              <p className="text-sm text-gray-400">{t("pendingApprovals.emptySubtitle")}</p>
            </CardContent>
          </Card>
        )}

        {rfqs.length > 0 && (
          <div className="space-y-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{rfqs.length}</span>{" "}
            {t("pendingApprovals.pendingCount").replace("{{count}} ", "")}
          </div>
        )}

        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.rfqId} className="border-l-4 border-l-yellow-400">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-gray-800">{rfq.rfqNumber}</span>
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        {t("pendingApprovals.statusBadge")}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t("pendingApprovals.requestedAgo").replace(
                        "{{time}}",
                        fmtRelative(rfq.pendingApproval?.requestedAt ?? null, t)
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">L{rfq.pendingApproval?.approverLevel ?? 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{rfq.buyerName}</p>
                      <p className="text-xs text-gray-400">{rfq.buyerRole ?? "—"} · {rfq.buyerDepartment ?? "—"}</p>
                    </div>
                  </div>
                  {rfq.buyerCompany && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-gray-700">{rfq.buyerCompany}</p>
                    </div>
                  )}
                  {rfq.requiredDeliveryDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t("pendingApprovals.requiredBefore")}</p>
                        <p className="text-gray-700">{fmtDate(rfq.requiredDeliveryDate, locale)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {rfq.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <span className="font-medium text-gray-700">{t("pendingApprovals.notesLabel")}: </span>{rfq.notes}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => setApproveTarget(rfq)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {t("pendingApprovals.approveBtn")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                    onClick={() => { setRejectTarget(rfq); setRejectNotes(""); }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {t("pendingApprovals.rejectBtn")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!approveTarget} onOpenChange={(v) => { if (!v) setApproveTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              {t("pendingApprovals.confirmApprovalTitle")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t("pendingApprovals.confirmApprovalBody")
              .replace("{{rfqNumber}}", approveTarget?.rfqNumber ?? "")
              .replace("{{buyerName}}", approveTarget?.buyerName ?? "")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              {t("pendingApprovals.cancelBtn")}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
              onClick={() => approveTarget && approveMutation.mutate(approveTarget.rfqId)}
            >
              {approveMutation.isPending
                ? t("pendingApprovals.approvingBtn")
                : t("pendingApprovals.confirmApproveBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={(v) => { if (!v) { setRejectTarget(null); setRejectNotes(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              {t("pendingApprovals.rejectDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("pendingApprovals.rejectBody")
                .replace("{{rfqNumber}}", rejectTarget?.rfqNumber ?? "")
                .replace("{{buyerName}}", rejectTarget?.buyerName ?? "")}
            </p>
            <div className="space-y-1.5">
              <Label>
                {t("pendingApprovals.rejectReasonLabel")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder={t("pendingApprovals.rejectReasonPlaceholder")}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectNotes(""); }}>
              {t("pendingApprovals.cancelBtn")}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={rejectMutation.isPending || !rejectNotes.trim()}
              onClick={() => rejectTarget && rejectMutation.mutate({ rfqId: rejectTarget.rfqId, notes: rejectNotes })}
            >
              {rejectMutation.isPending
                ? t("pendingApprovals.rejectingBtn")
                : t("pendingApprovals.rejectDialogTitle")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
