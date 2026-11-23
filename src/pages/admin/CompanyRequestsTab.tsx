import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { requestBizPortalCompanySelfApprovalProof } from "@/lib/bizportal-company-self-approval-proof";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react";

type CompanyRequest = {
  id: number;
  customerId: number;
  customerName: string | null;
  customerEmail: string | null;
  requestedCompanyName: string;
  canSelfApproveAsSuperAdmin?: boolean;
  requestedRegistrationNumber: string | null;
  status: string;
  matchedCompanyId: number | null;
  matchedCompanyName: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};
type CompanyOption = { id: number; name: string; code: string | null };
type Decision = "approved" | "rejected" | "in_review";
const isReviewable = (status: string) => status === "pending" || status === "in_review";
const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function CompanyRequestsTab() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState<CompanyRequest | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [verifiedAuthority, setVerifiedAuthority] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadRequests() {
    setLoading(true);
    setListError("");
    try {
      const response = await fetch("/api/portal/admin/company-requests", {
        headers: getAuthHeaders(), credentials: "include", cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403
        ? "Sesi Admin tidak berwenang membaca persetujuan perusahaan."
        : "Gagal memuat permohonan afiliasi perusahaan.");
      const data = await response.json() as { items?: CompanyRequest[] };
      setRequests(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setRequests([]);
      setListError(error instanceof Error ? error.message : "Gagal memuat permohonan.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies(search: string) {
    setCompaniesLoading(true);
    setCompanyError("");
    // Never retain a previous company selection when the lookup changes.
    setCompanyId("");
    setVerifiedAuthority(false);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch("/api/portal/organization/companies?" + params.toString(), {
        headers: getAuthHeaders(), credentials: "include", cache: "no-store",
      });
      if (!response.ok) throw new Error("Daftar perusahaan kanonis tidak tersedia.");
      const data = await response.json() as CompanyOption[];
      setCompanies(Array.isArray(data) ? data.filter(company =>
        Number.isSafeInteger(company.id) && company.id > 0 && Boolean(company.name?.trim()),
      ) : []);
    } catch (error) {
      setCompanies([]);
      setCompanyError(error instanceof Error ? error.message : "Gagal memuat perusahaan.");
    } finally {
      setCompaniesLoading(false);
    }
  }

  useEffect(() => { void loadRequests(); }, []);

  function openReview(request: CompanyRequest) {
    if (!isReviewable(request.status)) return;
    setSelected(request);
    setCompanySearch(request.requestedCompanyName ?? "");
    setCompanies([]);
    setCompanyId("");
    setVerifiedAuthority(false);
    setReviewNote("");
    setActionError("");
    setNotice("");
    void loadCompanies(request.requestedCompanyName ?? "");
  }

  async function submitDecision(decision: Decision) {
    if (!selected || !isReviewable(selected.status) || saving) return;
    const canonicalCompany = companies.find(company => String(company.id) === companyId);
    if (decision === "approved" && (!canonicalCompany || !verifiedAuthority)) {
      setActionError("Pilih perusahaan kanonis dan konfirmasi kewenangan customer sebelum menyetujui.");
      return;
    }
    if (decision === "rejected" && !reviewNote.trim()) {
      setActionError("Alasan penolakan harus diisi.");
      return;
    }
    setActionError("");
    setSaving(true);
    try {
      // Explicit click opens BizPortal's fresh signed Super Admin consent popup.
      // A regular Admin never receives or uses this exceptional proof path.
      const signedSelf = decision === "approved" && selected.canSelfApproveAsSuperAdmin
        ? await requestBizPortalCompanySelfApprovalProof(
            selected.id, canonicalCompany!.id, getAuthHeaders(),
          )
        : {};
      const payload = {
        status: decision,
        matchedCompanyId: decision === "approved" ? canonicalCompany!.id : null,
        reviewNote: reviewNote.trim() || null,
        ...signedSelf,
      };
      const response = await fetch("/api/portal/admin/company-requests/" + selected.id, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
        throw new Error(data.error || data.message || "Keputusan afiliasi tidak berhasil disimpan.");
      }
      setSelected(null);
      setNotice(decision === "approved" ? "Afiliasi perusahaan disetujui melalui Admin."
        : decision === "rejected" ? "Permohonan perusahaan telah ditolak."
          : "Permohonan ditandai untuk diperiksa.");
      await loadRequests();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Gagal menyimpan keputusan.");
    } finally {
      setSaving(false);
    }
  }

  const visible = requests.filter(request => filter === "all"
    || (filter === "open" ? isReviewable(request.status) : request.status === filter));
  const pending = requests.filter(request => isReviewable(request.status)).length;

  return (
    <div className="space-y-4" data-testid="company-requests-tab">
      <p className="text-sm text-muted-foreground">
        Tinjau afiliasi customer ke perusahaan yang sudah terdaftar. Pembuatan PO perusahaan
        memerlukan persetujuan Admin yang tercatat; memilih nama perusahaan saja tidak cukup.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{pending} menunggu pemeriksaan</Badge>
        <label className="text-sm" htmlFor="company-request-filter">Status</label>
        <select id="company-request-filter" className="h-9 rounded-md border bg-background px-2 text-sm"
          value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="open">Menunggu / Dalam pemeriksaan</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="all">Semua</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => void loadRequests()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Segarkan
        </Button>
      </div>
      {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
      {listError && <p role="alert" className="text-sm text-red-700">{listError}</p>}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat permohonan...
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Tidak ada permohonan perusahaan untuk filter ini.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map(request => (
            <div key={request.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <strong className="text-sm">{request.requestedCompanyName}</strong>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {request.customerName ?? "Customer"} — {request.customerEmail ?? "email belum tersedia"}
                </p>
                {request.requestedRegistrationNumber &&
                  <p className="text-xs text-muted-foreground">Nomor registrasi: {request.requestedRegistrationNumber}</p>}
                <p className="text-xs text-muted-foreground">
                  Diajukan: {formatDate(request.createdAt)}
                  {request.matchedCompanyName ? " · Perusahaan: " + request.matchedCompanyName : ""}
                  {request.reviewedAt ? " · Ditinjau: " + formatDate(request.reviewedAt) : ""}
                </p>
              </div>
              {isReviewable(request.status) &&
                <Button size="sm" onClick={() => openReview(request)}>Tinjau afiliasi</Button>}
            </div>
          ))}
        </div>
      )}
      <Dialog open={selected !== null} onOpenChange={open => { if (!open && !saving) setSelected(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Persetujuan afiliasi perusahaan</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p>Customer: <strong>{selected.customerName ?? selected.customerEmail ?? "—"}</strong></p>
                <p>Permintaan: <strong>{selected.requestedCompanyName}</strong></p>
                {selected.requestedRegistrationNumber && <p>Registrasi: {selected.requestedRegistrationNumber}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="canonical-company-search" className="text-sm font-medium">
                  Cari perusahaan kanonis
                </label>
                <div className="flex gap-2">
                  <Input id="canonical-company-search" value={companySearch}
                    onChange={event => { setCompanySearch(event.target.value); setCompanyId(""); setVerifiedAuthority(false); }} placeholder="Nama perusahaan terdaftar" />
                  <Button variant="outline" onClick={() => void loadCompanies(companySearch)} disabled={companiesLoading}>
                    <Search className="mr-1 h-4 w-4" /> Cari
                  </Button>
                </div>
                {companyError && <p role="alert" className="text-sm text-red-700">{companyError}</p>}
                <label htmlFor="canonical-company-option" className="text-sm font-medium">
                  Pilih perusahaan terverifikasi
                </label>
                <select id="canonical-company-option" className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                  value={companyId} onChange={event => { setCompanyId(event.target.value); setVerifiedAuthority(false); }}>
                  <option value="">— Pilih perusahaan kanonis —</option>
                  {companies.map(company => <option key={company.id} value={String(company.id)}>
                    {company.name}{company.code ? " (" + company.code + ")" : ""}
                  </option>)}
                </select>
                {companiesLoading && <p className="text-xs text-muted-foreground">Memuat perusahaan...</p>}
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={verifiedAuthority}
                    onChange={event => setVerifiedAuthority(event.target.checked)}
                    disabled={!companyId || companiesLoading} />
                  Saya sudah memeriksa kewenangan customer untuk mewakili perusahaan yang dipilih.
                </label>
              </div>
              <div className="space-y-2">
                <label htmlFor="company-review-note" className="text-sm font-medium">
                  Catatan Admin (wajib untuk penolakan)
                </label>
                <Textarea id="company-review-note" value={reviewNote}
                  onChange={event => setReviewNote(event.target.value)} rows={3}
                  placeholder="Dasar persetujuan atau alasan penolakan" />
              </div>
              {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
              <DialogFooter className="flex flex-wrap gap-2 sm:justify-start">
                <Button onClick={() => void submitDecision("approved")}
                  disabled={saving || companiesLoading || !companyId || !verifiedAuthority}>
                  <ShieldCheck className="mr-1 h-4 w-4" />
                  {selected.canSelfApproveAsSuperAdmin
                    ? "Verifikasi Super Admin & setujui"
                    : "Setujui afiliasi"}
                </Button>
                {selected.canSelfApproveAsSuperAdmin && (
                  <p className="text-xs text-amber-700">
                    Untuk pengajuan sendiri, gunakan sesi BizPortal Super Admin
                    yang baru (maksimal 5 menit) dan setujui satu kali di popup.
                  </p>
                )}
                <Button variant="outline" onClick={() => void submitDecision("in_review")} disabled={saving}>
                  Dalam pemeriksaan
                </Button>
                <Button variant="destructive" onClick={() => void submitDecision("rejected")}
                  disabled={saving || !reviewNote.trim()}>Tolak</Button>
                <Button variant="ghost" onClick={() => setSelected(null)} disabled={saving}>Batal</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
