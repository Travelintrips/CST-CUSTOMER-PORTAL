import { useEffect, useState } from "react";
import { Building2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type OrganizationContext = {
  status?: string;
  pendingRequest?: { requestedCompanyName?: string; status?: string } | null;
};

export function ExistingCustomerCompanyApplication({
  role,
  customerType,
}: {
  role: string | null | undefined;
  customerType: string | null | undefined;
}) {
  const [organization, setOrganization] = useState<OrganizationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState(
    () => new URLSearchParams(window.location.search).get("company")?.trim() ?? "",
  );
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [legalFile, setLegalFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV || role !== "customer") {
      setLoading(false);
      return;
    }
    let active = true;
    fetch("/api/portal/organization", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status perusahaan belum dapat diperiksa.");
        return response.json() as Promise<OrganizationContext>;
      })
      .then((data) => { if (active) setOrganization(data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Gagal memeriksa status perusahaan."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role]);

  // The related authenticated writer is guarded to development on the server.
  // Do not display this DEV-only recovery form in a production frontend.
  if (!import.meta.env.DEV || role !== "customer") return null;

  if (organization?.status === "company_pending") {
    return (
      <Card className="border-amber-200">
        <CardHeader><CardTitle className="text-base">Pengajuan perusahaan menunggu persetujuan</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Perusahaan: {organization.pendingRequest?.requestedCompanyName ?? companyName}</p>
          <p>Permohonan sudah diterima. Admin perlu memeriksa data dan dokumen sebelum perusahaan dapat membuat PO.</p>
        </CardContent>
      </Card>
    );
  }

  // An account that already has an approved corporate identity or another
  // customer type must not use this recovery form.
  if (customerType !== "individual") return null;

  async function submitCompanyApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (companyName.trim().length < 3 || registrationNumber.trim().length < 8
        || companyAddress.trim().length < 10 || !legalFile) {
      setError("Isi nama perusahaan, NIB/NPWP, alamat perusahaan, dan dokumen legalitas yang sah.");
      return;
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(legalFile.type)
        || legalFile.size > 5 * 1024 * 1024) {
      setError("Dokumen legalitas harus berupa JPG, PNG atau PDF maksimal 5 MB.");
      return;
    }
    setSending(true);
    try {
      const form = new FormData();
      form.append("docType", "legalitas");
      form.append("file", legalFile);
      const uploaded = await fetch("/api/portal/onboarding/upload-doc", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const uploadData = await uploaded.json() as { storagePath?: string; error?: string; message?: string };
      if (!uploaded.ok || !uploadData.storagePath) {
        throw new Error(uploadData.error ?? uploadData.message ?? "Dokumen legalitas gagal diunggah.");
      }
      // Do not send or trust a client-supplied storage path. The canonical
      // writer resolves the document from the signed-in customer's profile.
      const response = await fetch("/api/portal/organization", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingCustomerCompanyApplication: true,
          customerType: "company",
          requestedCompanyName: companyName.trim(),
          requestedRegistrationNumber: registrationNumber.trim(),
          companyAddress: companyAddress.trim(),
        }),
      });
      const result = await response.json() as { context?: OrganizationContext; error?: string; message?: string };
      if (!response.ok || result.context?.status !== "company_pending") {
        throw new Error(result.error ?? result.message ?? "Pengajuan perusahaan belum tersimpan.");
      }
      setOrganization(result.context);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pengajuan gagal. Periksa data lalu coba lagi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-sky-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" /> Ajukan Customer Perusahaan dari akun ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Gunakan akun Google dan KTP yang sudah tersimpan. Pengajuan perusahaan ini
          tidak otomatis memberikan hak membuat PO; Admin harus menyetujuinya.
        </p>
        {loading && <p className="text-sm text-slate-500">Memeriksa status akun...</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!loading && (
          <form onSubmit={(event) => void submitCompanyApplication(event)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="company-recovery-name">Nama perusahaan yang sah</Label>
              <Input id="company-recovery-name" value={companyName}
                onChange={(event) => setCompanyName(event.target.value)} required placeholder="Nama resmi perusahaan" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="company-recovery-nib">NIB atau NPWP perusahaan</Label>
              <Input id="company-recovery-nib" value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
                required placeholder="Nomor pendaftaran perusahaan" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="company-recovery-address">Alamat perusahaan</Label>
              <Textarea id="company-recovery-address" value={companyAddress}
                onChange={(event) => setCompanyAddress(event.target.value)}
                rows={3} required placeholder="Alamat resmi perusahaan, terpisah dari alamat KTP" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="company-recovery-legal">Dokumen legalitas perusahaan</Label>
              <Input id="company-recovery-legal" type="file" accept=".jpg,.jpeg,.png,.pdf"
                onChange={(event) => setLegalFile(event.target.files?.[0] ?? null)} required />
              <p className="text-xs text-slate-500">JPG/PNG/PDF maksimal 5 MB. KTP tidak perlu diunggah ulang.</p>
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              {sending ? "Mengirim pengajuan..." : "Ajukan perusahaan untuk persetujuan Admin"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
