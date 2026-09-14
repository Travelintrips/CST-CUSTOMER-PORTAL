import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { getAuthHeaders, getAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, FileText,
  Upload, Trash2, RefreshCw, Eye, ChevronRight, Info,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const DOC_TYPES = [
  { value: "NPWP", label: "NPWP" },
  { value: "NIB", label: "NIB (Nomor Induk Berusaha)" },
  { value: "KTP_PIC", label: "KTP PIC" },
  { value: "AKTA_PERUSAHAAN", label: "Akta Perusahaan" },
  { value: "SURAT_KUASA", label: "Surat Kuasa" },
  { value: "API_U", label: "API-U" },
  { value: "API_P", label: "API-P" },
  { value: "NIK_KEPABEANAN", label: "NIK Kepabeanan" },
  { value: "SIUP_NIB_ACTIVITY", label: "SIUP / NIB Activity" },
  { value: "OTHER", label: "Dokumen Lainnya" },
] as const;

type DocStatus = "UPLOADED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
type VerifStatus = "DRAFT" | "PENDING_VERIFICATION" | "NEED_REVISION" | "VERIFIED" | "REJECTED" | "EXPIRED";

interface VerifDoc {
  id: number;
  documentType: string;
  documentNumber: string | null;
  fileName: string | null;
  fileUrl: string;
  verificationStatus: DocStatus;
  rejectionReason: string | null;
  expiryDate: string | null;
  uploadedVersion: number;
  createdAt: string;
}

interface VerifState {
  profileId: number;
  verificationStatus: VerifStatus;
  verificationSubmittedAt: string | null;
  verificationExpiredAt: string | null;
  verificationNotes: string | null;
  companyName: string | null;
  documents: VerifDoc[];
}

const STATUS_CONFIG: Record<VerifStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  PENDING_VERIFICATION: { label: "Menunggu Verifikasi", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-4 h-4" /> },
  NEED_REVISION: { label: "Perlu Revisi", color: "bg-amber-100 text-amber-700", icon: <AlertTriangle className="w-4 h-4" /> },
  VERIFIED: { label: "Terverifikasi", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-4 h-4" /> },
  REJECTED: { label: "Ditolak", color: "bg-rose-100 text-rose-700", icon: <XCircle className="w-4 h-4" /> },
  EXPIRED: { label: "Kadaluarsa", color: "bg-gray-100 text-gray-700", icon: <Clock className="w-4 h-4" /> },
};

const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; color: string }> = {
  UPLOADED: { label: "Uploaded", color: "bg-gray-100 text-gray-700" },
  PENDING_REVIEW: { label: "Menunggu Review", color: "bg-blue-100 text-blue-700" },
  VERIFIED: { label: "Verified", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Ditolak", color: "bg-rose-100 text-rose-700" },
  EXPIRED: { label: "Kadaluarsa", color: "bg-gray-100 text-gray-700" },
};

export default function CompanyVerificationPage() {
  const [, setLocation] = useLocation();
  const token = getAuthToken();
  const headers = getAuthHeaders() as Record<string, string>;
  const { toast } = useToast();
  const { t } = useLanguage();

  const [data, setData] = useState<VerifState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadNumber, setUploadNumber] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reuploadDocId, setReuploadDocId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) setLocation("/login");
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/customer-verification", { headers, credentials: "include" });
      if (r.ok) setData(await r.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload() {
    if (!uploadFile) { toast({ title: t("companyVerif.selectFileFirst", "Pilih file terlebih dahulu"), variant: "destructive" }); return; }
    if (!uploadType) { toast({ title: t("companyVerif.selectDocType", "Pilih jenis dokumen"), variant: "destructive" }); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("documentType", uploadType);
      if (uploadNumber) fd.append("documentNumber", uploadNumber);

      const url = reuploadDocId
        ? `/api/customer-verification/documents/${reuploadDocId}`
        : "/api/customer-verification/documents";
      const method = reuploadDocId ? "PUT" : "POST";

      const r = await fetch(url, { method, headers, credentials: "include", body: fd });
      const json = await r.json();

      if (r.ok) {
        toast({ title: reuploadDocId ? t("companyVerif.docUpdated", "Dokumen berhasil diperbarui") : t("companyVerif.docUploaded", "Dokumen berhasil diupload") });
        setUploadFile(null);
        setUploadType("");
        setUploadNumber("");
        setReuploadDocId(null);
        load();
      } else {
        toast({ title: json.message ?? t("companyVerif.uploadFailed", "Gagal upload"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("companyVerif.uploadDocFailed", "Gagal upload dokumen"), variant: "destructive" });
    }
    setUploading(false);
  }

  async function handleDelete(docId: number) {
    if (!confirm(t("companyVerif.confirmDeleteDoc", "Hapus dokumen ini?"))) return;
    const r = await fetch(`/api/customer-verification/documents/${docId}`, { method: "DELETE", headers, credentials: "include" });
    if (r.ok) {
      toast({ title: t("companyVerif.docDeleted", "Dokumen dihapus") });
      load();
    } else {
      const json = await r.json();
      toast({ title: json.message ?? t("companyVerif.deleteFailed", "Gagal hapus"), variant: "destructive" });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const r = await fetch("/api/customer-verification/submit", { method: "POST", headers, credentials: "include" });
      const json = await r.json();
      if (r.ok) {
        toast({ title: t("companyVerif.submissionSent", "Pengajuan verifikasi berhasil dikirim") });
        load();
      } else {
        toast({ title: json.message ?? t("companyVerif.submitFailed", "Gagal submit"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("companyVerif.submitVerifFailed", "Gagal submit verifikasi"), variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function handleViewDoc(docId: number) {
    const r = await fetch(`/api/customer-verification/signed-url/${docId}`, { headers, credentials: "include" });
    if (r.ok) {
      const { url } = await r.json();
      window.open(url, "_blank");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const status = data?.verificationStatus ?? "DRAFT";
  const statusCfg = STATUS_CONFIG[status];
  const docs = data?.documents ?? [];
  const canUpload = !["PENDING_VERIFICATION", "VERIFIED"].includes(status);
  const canSubmit = ["DRAFT", "NEED_REVISION"].includes(status) && docs.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">{t("companyVerif.dashboard", "Dashboard")}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900">{t("companyVerif.pageTitle", "Verifikasi Perusahaan")}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("companyVerif.pageTitle", "Verifikasi Perusahaan")}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {t("companyVerif.pageSubtitle", "Upload dokumen legal perusahaan untuk layanan PPJK, Export, Import & Customs Clearance")}
          </p>
        </div>
        <Badge className={`${statusCfg.color} hover:${statusCfg.color} flex items-center gap-1.5 px-3 py-1.5`}>
          {statusCfg.icon}
          {statusCfg.label}
        </Badge>
      </div>

      {/* Admin Notes */}
      {data?.verificationNotes && (
        <Card className={status === "NEED_REVISION" ? "border-amber-300 bg-amber-50" : status === "REJECTED" ? "border-rose-300 bg-rose-50" : "border-blue-200 bg-blue-50"}>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-sm">{t("companyVerif.adminNotes", "Catatan Admin")}</p>
                <p className="text-sm mt-1">{data.verificationNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Info */}
      {status === "VERIFIED" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800">{t("companyVerif.companyVerified", "Perusahaan Anda Telah Terverifikasi")}</p>
                {data?.verificationExpiredAt && (
                  <p className="text-sm text-emerald-700 mt-1">
                    {t("companyVerif.validUntil", "Berlaku hingga:")} {new Date(data.verificationExpiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PPJK Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-800 mb-1">{t("companyVerif.requiredDocs", "Dokumen Wajib untuk PPJK / Export / Import / Customs")}</p>
          <div className="flex gap-4 text-sm text-blue-700">
            {["NPWP", "NIB", "KTP PIC"].map((d) => {
              const found = docs.find((doc) => {
                if (d === "KTP PIC") return doc.documentType === "KTP_PIC";
                return doc.documentType === d;
              });
              return (
                <span key={d} className="flex items-center gap-1">
                  {found?.verificationStatus === "VERIFIED" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400" />
                  )}
                  {d}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("companyVerif.companyDocs", "Dokumen Perusahaan")} ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {docs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              {t("companyVerif.noDocsYet", "Belum ada dokumen. Upload dokumen di bawah.")}
            </p>
          )}
          {docs.map((doc) => {
            const dCfg = DOC_STATUS_CONFIG[doc.verificationStatus as DocStatus] ?? DOC_STATUS_CONFIG.UPLOADED;
            const typeLabel = DOC_TYPES.find((t) => t.value === doc.documentType)?.label ?? doc.documentType;
            return (
              <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{typeLabel}</span>
                    <Badge className={`${dCfg.color} hover:${dCfg.color} text-xs`}>{dCfg.label}</Badge>
                    {(doc.uploadedVersion ?? 1) > 1 && (
                      <Badge variant="outline" className="text-xs">v{doc.uploadedVersion}</Badge>
                    )}
                  </div>
                  {doc.documentNumber && (
                    <p className="text-xs text-gray-500 mt-0.5">{t("companyVerif.docNumber", "No:")} {doc.documentNumber}</p>
                  )}
                  {doc.fileName && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.fileName}</p>
                  )}
                  {doc.verificationStatus === "REJECTED" && doc.rejectionReason && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {doc.rejectionReason}
                    </p>
                  )}
                  {doc.expiryDate && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("companyVerif.exp", "Exp:")} {new Date(doc.expiryDate).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDoc(doc.id)} className="h-7 w-7 p-0" aria-label={t("companyVerif.viewDoc", "Lihat dokumen")}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {canUpload && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label={t("companyVerif.reuploadDoc", "Upload ulang dokumen")}
                        onClick={() => {
                          setReuploadDocId(doc.id);
                          setUploadType(doc.documentType);
                          setUploadNumber(doc.documentNumber ?? "");
                        }}
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700"
                        aria-label={t("companyVerif.deleteDoc", "Hapus dokumen")}
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upload Form */}
      {canUpload && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {reuploadDocId ? t("companyVerif.reuploadTitle", "Upload Ulang Dokumen") : t("companyVerif.uploadNewTitle", "Upload Dokumen Baru")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reuploadDocId && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                {t("companyVerif.reuploadMode", "Mode upload ulang dokumen yang sudah ada.")}
                <button className="ml-auto text-xs underline" onClick={() => { setReuploadDocId(null); setUploadType(""); setUploadNumber(""); }}>
                  {t("common.cancel", "Batal")}
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("companyVerif.docType", "Jenis Dokumen")} *</Label>
                <Select value={uploadType} onValueChange={setUploadType} disabled={!!reuploadDocId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("companyVerif.selectDocTypePlaceholder", "Pilih jenis dokumen")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("companyVerif.docNumberOptional", "Nomor Dokumen (opsional)")}</Label>
                <Input
                  placeholder={t("companyVerif.docNumberPlaceholder", "cth: 01.234.567.8-901.000")}
                  value={uploadNumber}
                  onChange={(e) => setUploadNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("companyVerif.fileDocLabel", "File Dokumen * (PDF, JPG, PNG, WebP — maks 20MB)")}</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
              {uploadFile && (
                <p className="text-xs text-gray-500">{uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</p>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading || !uploadFile || !uploadType}
              className="w-full"
            >
              {uploading ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t("companyVerif.uploading", "Mengupload...")}</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />{reuploadDocId ? t("companyVerif.saveReupload", "Simpan Upload Ulang") : t("companyVerif.uploadDoc", "Upload Dokumen")}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {canSubmit && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t("companyVerif.sending", "Mengirim...")}</>
          ) : (
            <>{t("companyVerif.submitVerification", "Kirim Pengajuan Verifikasi")}<ChevronRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      )}

      {status === "PENDING_VERIFICATION" && (
        <p className="text-center text-sm text-gray-500">
          {t("companyVerif.pendingReviewNote", "Dokumen Anda sedang dalam proses review oleh tim kami. Kami akan menghubungi Anda setelah selesai.")}
        </p>
      )}
    </div>
  );
}
