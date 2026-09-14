/**
 * PromoManagement.tsx
 * FixJasaNamesTool, FeaturedRequestsTable, PaketPromosiSection,
 * FeaturedMaintenanceSection, ProdukUnggulanTab
 */

import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Loader2, RefreshCw, Plus, Package, Wrench, ShieldAlert, AlertCircle,
  CheckCircle, CheckCircle2, XCircle, Eye, Play, Building2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FixJasaResult {
  fixed: number;
  items: { id: number; oldName: string; newName: string }[];
}

type FeaturedPackage = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  durationDays: number;
  price: number;
  currency: string;
  placementType: string | null;
  priorityWeight: number;
  categoryId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FeaturedRequest = {
  id: number;
  companyId: number | null;
  vendorId: number;
  catalogItemId: number;
  packageId: number;
  status: string;
  requestedStartAt: string | null;
  requestedEndAt: string | null;
  approvedStartAt: string | null;
  approvedEndAt: string | null;
  price: number;
  currency: string;
  paymentStatus: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  catalogItemName?: string;
  vendorName?: string;
  packageName?: string;
  packageCode?: string;
  featuredPriority?: number;
};

type FeaturedCorruptItem = {
  catalogItemId: number;
  itemName: string | null;
  vendorId: number;
  vendorName: string | null;
  featuredUntil: string | null;
  matchingRequestId: number | null;
  matchingRequestStatus: string | null;
  reasons: string[];
};
type FeaturedIntegrityReport = {
  scannedAt: string;
  totalFeaturedItems: number;
  corruptCount: number;
  items: FeaturedCorruptItem[];
};
type FeaturedRepairResult = {
  mode: "dry-run" | "execute";
  report: FeaturedIntegrityReport;
  repaired: number;
  failed: { catalogItemId: number; error: string }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtRupiah(n: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function statusBadgeFeatured(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 border-amber-400 text-amber-700",
    approved: "bg-blue-50 border-blue-400 text-blue-700",
    active: "bg-green-50 border-green-400 text-green-700",
    rejected: "bg-red-50 border-red-400 text-red-700",
    expired: "bg-slate-50 border-slate-400 text-slate-600",
    cancelled: "bg-slate-50 border-slate-300 text-slate-500",
  };
  const label: Record<string, string> = {
    pending: "Menunggu", approved: "Disetujui", active: "Aktif",
    rejected: "Ditolak", expired: "Kedaluwarsa", cancelled: "Dibatalkan",
  };
  return <Badge variant="outline" className={map[status] ?? ""}>{label[status] ?? status}</Badge>;
}

function paymentBadge(ps: string) {
  const map: Record<string, string> = {
    unpaid: "bg-slate-50 border-slate-300 text-slate-500",
    pending_verification: "bg-amber-50 border-amber-400 text-amber-700",
    verified: "bg-green-50 border-green-400 text-green-700",
    rejected: "bg-red-50 border-red-400 text-red-700",
  };
  const label: Record<string, string> = {
    unpaid: "Belum Bayar", pending_verification: "Verifikasi", verified: "Terverifikasi", rejected: "Ditolak",
  };
  return <Badge variant="outline" className={map[ps] ?? ""}>{label[ps] ?? ps}</Badge>;
}

const FEATURED_REASON_LABEL: Record<string, string> = {
  no_expiry_date: "Tanpa tanggal kedaluwarsa",
  no_matching_request: "Tidak ada pengajuan terkait",
  request_not_active: "Pengajuan tidak berstatus aktif",
};

function dateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function dateWithDays(start: string, days: number) {
  const parsed = new Date(`${start}T00:00:00`);
  if (!start || Number.isNaN(parsed.getTime()) || !Number.isFinite(days)) return "";
  parsed.setDate(parsed.getDate() + days);
  return dateInputValue(parsed);
}

// ── FixJasaNamesTool ──────────────────────────────────────────────────────────

export function FixJasaNamesTool() {
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState("");
  const [result, setResult] = useState<FixJasaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleRun = async () => {
    if (!adminKey.trim()) { setError("Admin key wajib diisi"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/portal/admin/fix-jasa-names", {
        method: "POST", headers: { "x-admin-key": adminKey },
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? "Gagal menjalankan utilitas");
      }
      const data: FixJasaResult = await r.json();
      setResult(data);
      toast({ title: `${data.fixed} nama produk diperbaiki` });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); setConfirmed(false); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-3 items-start">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Operasi ini akan <strong>mengubah nama produk secara permanen</strong> — menghapus prefix "Jasa " dari semua produk yang diawali kata tersebut. Pastikan Anda yakin sebelum menjalankan.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Admin Key</label>
        <Input type="password" placeholder="Masukkan PORTAL_ADMIN_KEY…" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="font-mono text-sm max-w-md" />
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex gap-3 items-start">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!confirmed ? (
        <Button variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50" disabled={!adminKey.trim()} onClick={() => setConfirmed(true)}>
          <Wrench className="h-4 w-4" /> Lanjutkan & Konfirmasi
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmed(false)} disabled={loading}>Batal</Button>
          <Button size="sm" variant="destructive" className="gap-2" onClick={handleRun} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
            {loading ? "Memproses…" : "Jalankan Sekarang"}
          </Button>
          <span className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</span>
        </div>
      )}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-medium">{result.fixed} produk diperbaiki</span>
          </div>
          {result.items.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">Detail Perubahan</div>
              <div className="divide-y max-h-64 overflow-y-auto">
                {result.items.map((item) => (
                  <div key={item.id} className="px-3 py-2 text-xs flex items-center gap-2">
                    <span className="font-mono text-muted-foreground w-10 shrink-0">#{item.id}</span>
                    <span className="line-through text-red-500 truncate flex-1">{item.oldName}</span>
                    <span className="text-muted-foreground shrink-0">→</span>
                    <span className="text-green-700 truncate flex-1">{item.newName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.fixed === 0 && <p className="text-sm text-muted-foreground italic">Tidak ada produk dengan prefix "Jasa " yang ditemukan.</p>}
        </div>
      )}
    </div>
  );
}

// ── FeaturedRequestsTable ─────────────────────────────────────────────────────

export function FeaturedRequestsTable({
  rows,
  loading,
  onRefresh,
  showActions,
}: {
  rows: FeaturedRequest[];
  loading: boolean;
  onRefresh: () => void;
  showActions: boolean;
}) {
  const { toast } = useToast();
  const [approveDlg, setApproveDlg] = useState<FeaturedRequest | null>(null);
  const [rejectDlg, setRejectDlg] = useState<FeaturedRequest | null>(null);
  const [verifyDlg, setVerifyDlg] = useState<FeaturedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [approveStartAt, setApproveStartAt] = useState("");
  const [approveEndAt, setApproveEndAt] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [waivePayment, setWaivePayment] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [verifyApprove, setVerifyApprove] = useState(true);
  const [verifyReason, setVerifyReason] = useState("");
  const h = getAuthHeaders();

  const doAction = async (url: string, body: object) => {
    setSubmitting(true);
    try {
      const r = await fetch(url, {
        method: "POST", credentials: "include",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ?? "Gagal");
      }
      return true;
    } catch (e: unknown) {
      toast({ title: "Gagal", description: String(e instanceof Error ? e.message : e), variant: "destructive" });
      return false;
    } finally { setSubmitting(false); }
  };

  const handleApprove = async () => {
    if (!approveDlg) return;
    const ok = await doAction(`/api/portal/admin/featured-requests/${approveDlg.id}/approve`, {
      approvedStartAt: approveStartAt || undefined, approvedEndAt: approveEndAt || undefined,
      adminNotes: approveNotes || undefined, waivePayment,
    });
    if (ok) { toast({ title: "✅ Disetujui" }); setApproveDlg(null); onRefresh(); }
  };

  const handleReject = async () => {
    if (!rejectDlg || !rejectReason.trim()) return;
    const ok = await doAction(`/api/portal/admin/featured-requests/${rejectDlg.id}/reject`, { reason: rejectReason });
    if (ok) { toast({ title: "❌ Ditolak" }); setRejectDlg(null); onRefresh(); }
  };

  const handleVerify = async () => {
    if (!verifyDlg) return;
    const ok = await doAction(`/api/portal/admin/featured-requests/${verifyDlg.id}/verify-payment`, {
      approve: verifyApprove, reason: verifyReason || undefined,
    });
    if (ok) { toast({ title: verifyApprove ? "✅ Pembayaran diverifikasi" : "❌ Pembayaran ditolak" }); setVerifyDlg(null); onRefresh(); }
  };

  const handleActivate = async (row: FeaturedRequest) => {
    const ok = await doAction(`/api/portal/admin/featured-requests/${row.id}/activate`, {});
    if (ok) { toast({ title: "🚀 Produk diaktifkan sebagai unggulan" }); onRefresh(); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
      <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
    </div>
  );

  if (rows.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
      <CheckCircle2 className="h-8 w-8 text-slate-300" />
      <p className="text-sm">Tidak ada data</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{row.vendorName ?? `Vendor #${row.vendorId}`}</span>
              {statusBadgeFeatured(row.status)}
              {paymentBadge(row.paymentStatus)}
            </div>
            <p className="text-xs text-muted-foreground">{row.catalogItemName ?? `Item #${row.catalogItemId}`} — <span className="font-medium">{row.packageName ?? row.packageCode ?? `Paket #${row.packageId}`}</span></p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              <span>Mulai: {fmtDate(row.requestedStartAt)}</span>
              {row.approvedStartAt && <span>Disetujui: {fmtDate(row.approvedStartAt)} – {fmtDate(row.approvedEndAt)}</span>}
              <span>Harga: {fmtRupiah(row.price, row.currency)}</span>
              {row.adminNotes && <span>📝 {row.adminNotes}</span>}
            </div>
          </div>
          {showActions && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {row.status === "pending" && (
                <>
                  <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => { setApproveDlg(row); setApproveStartAt(""); setApproveEndAt(""); setApproveNotes(""); setWaivePayment(false); }}>
                    <CheckCircle className="h-3 w-3" /> Setujui
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => { setRejectDlg(row); setRejectReason(""); }}>
                    <XCircle className="h-3 w-3" /> Tolak
                  </Button>
                </>
              )}
              {row.paymentStatus === "pending_verification" && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-400 text-amber-700 hover:bg-amber-50"
                  onClick={() => { setVerifyDlg(row); setVerifyApprove(true); setVerifyReason(""); }}>
                  <Eye className="h-3 w-3" /> Verifikasi Bayar
                </Button>
              )}
              {row.status === "approved" && row.paymentStatus === "verified" && (
                <Button size="sm" className="h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => void handleActivate(row)}>
                  <Play className="h-3 w-3" /> Aktifkan
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Approve Dialog */}
      <Dialog open={!!approveDlg} onOpenChange={(o) => { if (!o) setApproveDlg(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Setujui Pengajuan</DialogTitle></DialogHeader>
          {approveDlg && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p><span className="font-medium">Vendor:</span> {approveDlg.vendorName}</p>
                <p><span className="font-medium">Produk:</span> {approveDlg.catalogItemName}</p>
                <p><span className="font-medium">Paket:</span> {approveDlg.packageName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal Mulai (opsional)</Label>
                  <Input type="date" className="text-sm h-8" value={approveStartAt} onChange={(e) => setApproveStartAt(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal Selesai (opsional)</Label>
                  <Input type="date" className="text-sm h-8" value={approveEndAt} onChange={(e) => setApproveEndAt(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan Admin (opsional)</Label>
                <Textarea placeholder="Catatan untuk vendor..." value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} rows={2} className="text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={waivePayment} onCheckedChange={setWaivePayment} id="waive-payment" />
                <Label htmlFor="waive-payment" className="text-xs cursor-pointer">Bebaskan pembayaran (waive payment)</Label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setApproveDlg(null)} disabled={submitting}>Batal</Button>
            <Button size="sm" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white" onClick={() => void handleApprove()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Ya, Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDlg} onOpenChange={(o) => { if (!o) setRejectDlg(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> Tolak Pengajuan</DialogTitle></DialogHeader>
          {rejectDlg && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p><span className="font-medium">Vendor:</span> {rejectDlg.vendorName}</p>
                <p><span className="font-medium">Produk:</span> {rejectDlg.catalogItemName}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Alasan Penolakan *</Label>
                <Textarea placeholder="Jelaskan alasan penolakan..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="text-sm" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectDlg(null)} disabled={submitting}>Batal</Button>
            <Button size="sm" disabled={submitting || !rejectReason.trim()} className="bg-red-500 hover:bg-red-600 text-white" onClick={() => void handleReject()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Payment Dialog */}
      <Dialog open={!!verifyDlg} onOpenChange={(o) => { if (!o) setVerifyDlg(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-amber-500" /> Verifikasi Pembayaran</DialogTitle></DialogHeader>
          {verifyDlg && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p><span className="font-medium">Vendor:</span> {verifyDlg.vendorName}</p>
                <p><span className="font-medium">Produk:</span> {verifyDlg.catalogItemName}</p>
                <p><span className="font-medium">Harga:</span> {fmtRupiah(verifyDlg.price, verifyDlg.currency)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setVerifyApprove(true)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${verifyApprove ? "bg-green-600 border-green-600 text-white" : "border-slate-200 text-slate-600 hover:bg-green-50"}`}>
                  ✅ Terima Pembayaran
                </button>
                <button onClick={() => setVerifyApprove(false)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!verifyApprove ? "bg-red-500 border-red-500 text-white" : "border-slate-200 text-slate-600 hover:bg-red-50"}`}>
                  ❌ Tolak Pembayaran
                </button>
              </div>
              {!verifyApprove && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Penolakan (opsional)</Label>
                  <Textarea placeholder="Alasan pembayaran ditolak..." value={verifyReason} onChange={(e) => setVerifyReason(e.target.value)} rows={2} className="text-sm" />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setVerifyDlg(null)} disabled={submitting}>Batal</Button>
            <Button size="sm" disabled={submitting} className={verifyApprove ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"} onClick={() => void handleVerify()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── PaketPromosiSection ───────────────────────────────────────────────────────

export function PaketPromosiSection({ getAuthHeaders: _getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const h = _getAuthHeaders();
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDlg, setCreateDlg] = useState(false);
  const [editDlg, setEditDlg] = useState<FeaturedPackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emptyForm = { code: "", name: "", description: "", durationDays: 30, price: 0, currency: "IDR", placementType: "", priorityWeight: 0 };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/admin/featured-packages?includeInactive=true", { credentials: "include", headers: h });
      if (r.ok) setPackages(await r.json() as FeaturedPackage[]);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setForm(emptyForm); setCreateDlg(true); };
  const openEdit = (pkg: FeaturedPackage) => {
    setForm({ code: pkg.code, name: pkg.name, description: pkg.description ?? "", durationDays: pkg.durationDays, price: pkg.price, currency: pkg.currency, placementType: pkg.placementType ?? "", priorityWeight: pkg.priorityWeight });
    setEditDlg(pkg);
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) { toast({ title: "Kode dan nama wajib diisi", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const r = await fetch("/api/portal/admin/featured-packages", {
        method: "POST", credentials: "include",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, durationDays: Number(form.durationDays), price: Number(form.price), priorityWeight: Number(form.priorityWeight) }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error ?? "Gagal"); }
      toast({ title: "✅ Paket berhasil dibuat" });
      setCreateDlg(false);
      void load();
    } catch (e: unknown) {
      toast({ title: "Gagal", description: String(e instanceof Error ? e.message : e), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editDlg) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/portal/admin/featured-packages/${editDlg.id}`, {
        method: "PATCH", credentials: "include",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, durationDays: Number(form.durationDays), price: Number(form.price), priorityWeight: Number(form.priorityWeight) }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error ?? "Gagal"); }
      toast({ title: "✅ Paket diperbarui" });
      setEditDlg(null);
      void load();
    } catch (e: unknown) {
      toast({ title: "Gagal", description: String(e instanceof Error ? e.message : e), variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (pkg: FeaturedPackage) => {
    if (!confirm(`Nonaktifkan paket "${pkg.name}"?`)) return;
    try {
      const r = await fetch(`/api/portal/admin/featured-packages/${pkg.id}/deactivate`, { method: "POST", credentials: "include", headers: h });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error ?? "Gagal"); }
      toast({ title: "Paket dinonaktifkan" });
      void load();
    } catch (e: unknown) {
      toast({ title: "Gagal", description: String(e instanceof Error ? e.message : e), variant: "destructive" });
    }
  };

  const PackageForm = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Kode *</Label>
        <Input className="text-sm h-8" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. GOLD-30" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Nama *</Label>
        <Input className="text-sm h-8" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Paket Gold 30 Hari" />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs">Deskripsi</Label>
        <Textarea className="text-sm" rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Durasi (hari)</Label>
        <Input type="number" className="text-sm h-8" value={form.durationDays} onChange={(e) => setForm(f => ({ ...f, durationDays: Number(e.target.value) }))} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Harga (IDR)</Label>
        <Input type="number" className="text-sm h-8" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Tipe Penempatan</Label>
        <Input className="text-sm h-8" value={form.placementType} onChange={(e) => setForm(f => ({ ...f, placementType: e.target.value }))} placeholder="banner / carousel / list" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Bobot Prioritas</Label>
        <Input type="number" className="text-sm h-8" value={form.priorityWeight} onChange={(e) => setForm(f => ({ ...f, priorityWeight: Number(e.target.value) }))} />
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{packages.length} paket ditemukan</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Tambah Paket
          </Button>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Package className="h-8 w-8 text-slate-300" />
          <p className="text-sm">Belum ada paket promosi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm">{pkg.name}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">{pkg.code}</Badge>
                  {!pkg.isActive && <Badge variant="outline" className="text-slate-400 border-slate-200">Nonaktif</Badge>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{fmtRupiah(pkg.price, pkg.currency)}</span>
                  <span>{pkg.durationDays} hari</span>
                  {pkg.placementType && <span>📍 {pkg.placementType}</span>}
                  <span>Bobot: {pkg.priorityWeight}</span>
                </div>
                {pkg.description && <p className="text-xs text-slate-500 truncate">{pkg.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(pkg)}>Edit</Button>
                {pkg.isActive && (
                  <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => void handleDeactivate(pkg)}>Nonaktifkan</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createDlg} onOpenChange={(o) => { if (!o) setCreateDlg(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-500" /> Tambah Paket Promosi</DialogTitle></DialogHeader>
          <div className="py-2"><PackageForm /></div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateDlg(false)} disabled={submitting}>Batal</Button>
            <Button size="sm" disabled={submitting} onClick={() => void handleCreate()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDlg} onOpenChange={(o) => { if (!o) setEditDlg(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Paket — {editDlg?.name}</DialogTitle></DialogHeader>
          <div className="py-2"><PackageForm /></div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDlg(null)} disabled={submitting}>Batal</Button>
            <Button size="sm" disabled={submitting} onClick={() => void handleEdit()}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />} Perbarui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── FeaturedMaintenanceSection ────────────────────────────────────────────────

export function FeaturedMaintenanceSection({ getAuthHeaders: _getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const h = _getAuthHeaders();
  const [report, setReport] = useState<FeaturedIntegrityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runScan = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/admin/featured-maintenance/scan", { credentials: "include", headers: h });
      if (r.ok) setReport(await r.json());
      else toast({ title: "Gagal", description: "Tidak bisa memindai integritas data.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { void runScan(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runRepair = async () => {
    setRepairing(true);
    try {
      const r = await fetch("/api/portal/admin/featured-maintenance/repair", {
        method: "POST", credentials: "include",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "execute" }),
      });
      if (r.ok) {
        const res: FeaturedRepairResult = await r.json();
        setConfirmOpen(false);
        toast({ title: "Repair selesai", description: `${res.repaired} item diperbaiki.` });
        await runScan();
      } else {
        const e = await r.json().catch(() => ({}));
        toast({ title: "Gagal", description: e.error ?? "Gagal memperbaiki data.", variant: "destructive" });
      }
    } finally { setRepairing(false); }
  };

  const corruptCount = report?.corruptCount ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Wrench className="h-4 w-4" />Featured Data Integrity</CardTitle>
          <CardDescription>
            Memindai produk berstatus "unggulan" yang tidak konsisten (tanpa tanggal kedaluwarsa atau tidak
            punya pengajuan aktif) — item seperti ini tidak akan pernah expired otomatis oleh worker.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              {report ? (
                <span>
                  Terakhir dipindai: {fmtDate(report.scannedAt)} — {report.totalFeaturedItems} produk unggulan,{" "}
                  <span className={corruptCount > 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{corruptCount} bermasalah</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Belum ada hasil pemindaian.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void runScan()} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Scan Integrity
              </Button>
              <Button size="sm" variant="destructive" className="h-8 gap-1.5 text-xs" disabled={corruptCount === 0} onClick={() => setConfirmOpen(true)}>
                <ShieldAlert className="h-3.5 w-3.5" />Repair ({corruptCount})
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memindai...</div>
          ) : corruptCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <CheckCircle2 className="h-8 w-8 text-slate-300" /><p className="text-sm">Tidak ditemukan data featured yang bermasalah.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(report?.items ?? []).map((item) => (
                <div key={item.catalogItemId} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-white">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{item.itemName ?? `Item #${item.catalogItemId}`}</span>
                      <span className="text-xs text-muted-foreground">{item.vendorName ?? `Vendor #${item.vendorId}`}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>Kedaluwarsa: {item.featuredUntil ? fmtDate(item.featuredUntil) : "—"}</span>
                      <span>Pengajuan: {item.matchingRequestId ? `#${item.matchingRequestId} (${item.matchingRequestStatus})` : "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.reasons.map((r) => (
                        <Badge key={r} className="bg-red-50 border-red-400 text-red-700 text-[10px]">{FEATURED_REASON_LABEL[r] ?? r}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" />Konfirmasi Repair</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ini akan mereset status "unggulan" pada <strong>{corruptCount} produk</strong> yang terdeteksi bermasalah
            (is_featured, tanggal, dan prioritas dikembalikan ke kosong). Produk featured yang valid tidak akan
            tersentuh, dan tidak ada data yang dihapus. Setiap perubahan dicatat di audit log.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={() => void runRepair()} disabled={repairing}>
              {repairing ? "Memperbaiki..." : "Ya, Repair Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tambah Produk Internal ─────────────────────────────────────────────────────

type InternalVendor = {
  id: number;
  name: string;
  companyId: number | null;
};

type InternalCatalogItem = {
  id: number;
  vendorId: number;
  name: string;
  description: string | null;
  currency: string;
  priceSell: string | number | null;
  isFeatured: boolean;
};

/**
 * The Customer Portal admin uses the same server endpoints and business rules
 * as BizPortal. This panel intentionally creates the normal featured request
 * through the internal-vendor shortcut, rather than recreating request logic.
 */
function TambahProdukInternalSection({ getAuthHeaders: _getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const { toast } = useToast();
  const h = _getAuthHeaders();
  const today = dateInputValue(new Date());
  const [vendors, setVendors] = useState<InternalVendor[]>([]);
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [catalog, setCatalog] = useState<InternalCatalogItem[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [catalogItemId, setCatalogItemId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [startAt, setStartAt] = useState(today);
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [vendorResponse, packageResponse] = await Promise.all([
          fetch("/api/portal/admin/internal-featured/vendors", { credentials: "include", headers: h }),
          fetch("/api/portal/admin/featured-packages", { credentials: "include", headers: h }),
        ]);
        if (cancelled) return;
        if (vendorResponse.ok) setVendors(await vendorResponse.json() as InternalVendor[]);
        if (packageResponse.ok) setPackages(await packageResponse.json() as FeaturedPackage[]);
      } catch (error) {
        if (!cancelled) toast({ title: "Gagal memuat data", description: String(error), variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!vendorId) {
      setCatalog([]);
      setCatalogItemId("");
      return;
    }
    let cancelled = false;
    (async () => {
      setCatalogLoading(true);
      setCatalogItemId("");
      try {
        const r = await fetch(`/api/portal/admin/internal-featured/vendors/${vendorId}/catalog`, {
          credentials: "include",
          headers: h,
        });
        if (r.ok && !cancelled) setCatalog(await r.json() as InternalCatalogItem[]);
      } catch (error) {
        if (!cancelled) toast({ title: "Gagal memuat katalog", description: String(error), variant: "destructive" });
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [vendorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPackage = packages.find((pkg) => String(pkg.id) === packageId);
  const selectedItem = catalog.find((item) => String(item.id) === catalogItemId);

  const handlePackageChange = (value: string) => {
    setPackageId(value);
    const pkg = packages.find((candidate) => String(candidate.id) === value);
    if (pkg) setEndAt(dateWithDays(startAt, pkg.durationDays));
  };

  const handleStartChange = (value: string) => {
    setStartAt(value);
    if (selectedPackage) setEndAt(dateWithDays(value, selectedPackage.durationDays));
  };

  const handleActivate = async () => {
    if (!vendorId || !catalogItemId || !packageId || !startAt || !endAt) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/portal/admin/internal-featured/activate", {
        method: "POST",
        credentials: "include",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: Number(vendorId),
          catalogItemId: Number(catalogItemId),
          packageId: Number(packageId),
          startAt: `${startAt}T00:00:00`,
          endAt: `${endAt}T00:00:00`,
        }),
      });
      if (!r.ok) {
        const error = await r.json().catch(() => ({}));
        throw new Error(error.error ?? "Gagal mengaktifkan Produk Unggulan");
      }
      setCatalog((items) => items.filter((item) => String(item.id) !== catalogItemId));
      setCatalogItemId("");
      toast({
        title: "Produk internal diaktifkan",
        description: "Produk menjadi Produk Unggulan dan bebas pembayaran.",
      });
    } catch (error) {
      toast({ title: "Gagal", description: String(error instanceof Error ? error.message : error), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(vendorId && catalogItemId && packageId && startAt && endAt);

  return (
    <div className="space-y-4">
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-indigo-600" />
            Tambah Produk Internal
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">Internal / Bebas Pembayaran</Badge>
          </CardTitle>
          <CardDescription>
            Pilih vendor internal dan produk katalog yang aktif serta published. Tidak perlu login vendor atau upload bukti pembayaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Vendor internal *</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={vendorId}
              onChange={(e) => { setVendorId(e.target.value); setCatalogItemId(""); }}
              disabled={loading}
            >
              <option value="">{loading ? "Memuat vendor..." : "Pilih vendor internal"}</option>
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
            </select>
            {!loading && vendors.length === 0 && <p className="text-xs text-muted-foreground">Belum ada vendor internal aktif.</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Produk katalog *</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={catalogItemId}
              onChange={(e) => setCatalogItemId(e.target.value)}
              disabled={!vendorId || catalogLoading}
            >
              <option value="">
                {!vendorId ? "Pilih vendor terlebih dahulu" : catalogLoading ? "Memuat katalog..." : "Pilih produk aktif"}
              </option>
              {catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {vendorId && !catalogLoading && catalog.length === 0 && (
              <p className="text-xs text-muted-foreground">Tidak ada produk aktif/published yang tersedia.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Paket promosi / durasi *</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={packageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "Memuat paket..." : "Pilih paket"}</option>
              {packages.filter((pkg) => pkg.isActive).map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{pkg.name} · {pkg.durationDays} hari</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Tanggal mulai *</Label>
            <Input type="date" value={startAt} onChange={(e) => handleStartChange(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Tanggal selesai *</Label>
            <Input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            {selectedPackage && <p className="text-xs text-muted-foreground">Otomatis mengikuti durasi paket: {selectedPackage.durationDays} hari.</p>}
          </div>

          <div className="flex items-end justify-between gap-3 rounded-md border bg-white p-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Ringkasan</p>
              <p className="truncate text-sm font-medium">{selectedItem?.name ?? "Belum memilih produk"}</p>
              <p className="text-xs text-muted-foreground">
                {selectedPackage ? `${selectedPackage.name} · prioritas ${selectedPackage.priorityWeight}` : "Belum memilih paket"}
              </p>
            </div>
            <Button onClick={() => void handleActivate()} disabled={!canSubmit || submitting} className="shrink-0">
              {submitting ? "Mengaktifkan..." : "Aktifkan Produk Unggulan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── ProdukUnggulanTab ─────────────────────────────────────────────────────────

export function ProdukUnggulanTab({ getAuthHeaders: _getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const h = _getAuthHeaders();
  const [subTab, setSubTab] = useState("pengajuan");

  const [pengajuanRows, setPengajuanRows] = useState<FeaturedRequest[]>([]);
  const [pengajuanLoading, setPengajuanLoading] = useState(false);

  const [aktifRows, setAktifRows] = useState<FeaturedRequest[]>([]);
  const [aktifLoading, setAktifLoading] = useState(false);

  const [riwayatStatus, setRiwayatStatus] = useState<string>("expired");
  const [riwayatRows, setRiwayatRows] = useState<FeaturedRequest[]>([]);
  const [riwayatLoading, setRiwayatLoading] = useState(false);

  const [pembayaranRows, setPembayaranRows] = useState<FeaturedRequest[]>([]);
  const [pembayaranLoading, setPembayaranLoading] = useState(false);

  const loadPengajuan = async () => {
    setPengajuanLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/portal/admin/featured-requests?status=pending", { credentials: "include", headers: h }),
        fetch("/api/portal/admin/featured-requests?status=approved", { credentials: "include", headers: h }),
      ]);
      const a = r1.ok ? (await r1.json() as FeaturedRequest[]) : [];
      const b = r2.ok ? (await r2.json() as FeaturedRequest[]) : [];
      setPengajuanRows([...a, ...b]);
    } finally { setPengajuanLoading(false); }
  };

  const loadAktif = async () => {
    setAktifLoading(true);
    try {
      const r = await fetch("/api/portal/admin/featured-requests?status=active", { credentials: "include", headers: h });
      if (r.ok) setAktifRows(await r.json() as FeaturedRequest[]);
    } finally { setAktifLoading(false); }
  };

  const loadRiwayat = async (status = riwayatStatus) => {
    setRiwayatLoading(true);
    try {
      const r = await fetch(`/api/portal/admin/featured-requests?status=${status}`, { credentials: "include", headers: h });
      if (r.ok) setRiwayatRows(await r.json() as FeaturedRequest[]);
    } finally { setRiwayatLoading(false); }
  };

  const loadPembayaran = async () => {
    setPembayaranLoading(true);
    try {
      const r = await fetch("/api/portal/admin/featured-requests?paymentStatus=pending_verification", { credentials: "include", headers: h });
      if (r.ok) setPembayaranRows(await r.json() as FeaturedRequest[]);
    } finally { setPembayaranLoading(false); }
  };

  useEffect(() => { void loadPengajuan(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubTabChange = (tab: string) => {
    setSubTab(tab);
    if (tab === "pengajuan") void loadPengajuan();
    if (tab === "aktif") void loadAktif();
    if (tab === "riwayat") void loadRiwayat(riwayatStatus);
    if (tab === "pembayaran") void loadPembayaran();
  };

  const SUB_TABS = [
    { value: "pengajuan", label: "Pengajuan" },
    { value: "internal", label: "Tambah Internal" },
    { value: "aktif", label: "Produk Aktif" },
    { value: "paket", label: "Paket Promosi" },
    { value: "riwayat", label: "Riwayat" },
    { value: "pembayaran", label: "Pembayaran" },
    { value: "maintenance", label: "Featured Maintenance" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
        {SUB_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleSubTabChange(t.value)}
            className={[
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              subTab === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "pengajuan" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pengajuanRows.length} pengajuan (pending + disetujui)</p>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void loadPengajuan()} disabled={pengajuanLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${pengajuanLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
          <FeaturedRequestsTable rows={pengajuanRows} loading={pengajuanLoading} onRefresh={loadPengajuan} showActions={true} />
        </div>
      )}

      {subTab === "internal" && <TambahProdukInternalSection getAuthHeaders={_getAuthHeaders} />}

      {subTab === "aktif" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{aktifRows.length} produk aktif sebagai unggulan</p>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void loadAktif()} disabled={aktifLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${aktifLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
          {aktifLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
          ) : aktifRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <CheckCircle2 className="h-8 w-8 text-slate-300" /><p className="text-sm">Tidak ada produk unggulan aktif</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aktifRows.map((row) => (
                <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{row.vendorName ?? `Vendor #${row.vendorId}`}</span>
                      {statusBadgeFeatured(row.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{row.catalogItemName ?? `Item #${row.catalogItemId}`} — <span className="font-medium">{row.packageName ?? row.packageCode ?? `Paket #${row.packageId}`}</span></p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>Aktif: {fmtDate(row.approvedStartAt)} – {fmtDate(row.approvedEndAt)}</span>
                      <span>Prioritas: {row.featuredPriority ?? "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === "paket" && <PaketPromosiSection getAuthHeaders={_getAuthHeaders} />}

      {subTab === "riwayat" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            {["expired", "rejected", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => { setRiwayatStatus(s); void loadRiwayat(s); }}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  riwayatStatus === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {s === "expired" ? "Kedaluwarsa" : s === "rejected" ? "Ditolak" : "Dibatalkan"}
              </button>
            ))}
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => void loadRiwayat(riwayatStatus)} disabled={riwayatLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${riwayatLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
          <FeaturedRequestsTable rows={riwayatRows} loading={riwayatLoading} onRefresh={() => loadRiwayat(riwayatStatus)} showActions={false} />
        </div>
      )}

      {subTab === "pembayaran" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{pembayaranRows.length} menunggu verifikasi pembayaran</p>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void loadPembayaran()} disabled={pembayaranLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${pembayaranLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
          <FeaturedRequestsTable rows={pembayaranRows} loading={pembayaranLoading} onRefresh={loadPembayaran} showActions={true} />
        </div>
      )}

      {subTab === "maintenance" && <FeaturedMaintenanceSection getAuthHeaders={_getAuthHeaders} />}
    </div>
  );
}
