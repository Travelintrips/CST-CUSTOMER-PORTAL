import { useEffect, useState, type ChangeEvent } from "react";
import { AlertCircle, Building2, CheckCircle2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthHeaders } from "@/lib/auth";

export type RfqCustomerContextStatus =
  | "individual"
  | "company_mapped"
  | "company_pending"
  | "company_unresolved"
  | "legacy_unresolved";

export interface RfqCustomerContext {
  status: RfqCustomerContextStatus;
  customerType: "individual" | "company" | null;
  companyId: number | null;
  company: { id: number; name: string; code: string | null } | null;
  pendingRequest: {
    requestedCompanyName?: string | null;
    status?: string | null;
  } | null;
}

interface RfqCustomerContextCompletionProps {
  context: RfqCustomerContext;
  onCompleted: (context: RfqCustomerContext) => void;
  onViewStatus: () => void;
}

type CustomerType = "individual" | "company";
type CompanyOption = { id: number; name: string; code: string | null };

export function RfqCustomerContextCompletion({
  context,
  onCompleted,
  onViewStatus,
}: RfqCustomerContextCompletionProps) {
  const [customerType, setCustomerType] = useState<CustomerType | null>(
    context.status === "company_unresolved" ? "company" : null,
  );
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyRequestMode, setCompanyRequestMode] = useState(false);
  const [requestedCompanyName, setRequestedCompanyName] = useState("");
  const [requestedRegistrationNumber, setRequestedRegistrationNumber] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerType !== "company") {
      setCompanyOptions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingCompanies(true);
      try {
        const params = new URLSearchParams();
        if (companySearch.trim()) params.set("search", companySearch.trim());
        const response = await fetch(`/api/portal/organization/companies?${params}`, {
          credentials: "include",
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Gagal memuat daftar perusahaan.");
        const data = await response.json() as CompanyOption[];
        if (!controller.signal.aborted) setCompanyOptions(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setCompanyOptions([]);
          setError(requestError instanceof Error ? requestError.message : "Gagal memuat daftar perusahaan.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingCompanies(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [companySearch, customerType]);

  function chooseType(value: CustomerType) {
    setCustomerType(value);
    setError(null);
    if (value === "individual") {
      setSelectedCompanyId(null);
      setCompanyRequestMode(false);
    }
  }

  async function save() {
    setError(null);
    if (!customerType) {
      setError("Pilih Perorangan atau Perusahaan terlebih dahulu.");
      return;
    }
    if (
      customerType === "company"
      && !selectedCompanyId
      && (!companyRequestMode || !requestedCompanyName.trim())
    ) {
      setError("Pilih perusahaan yang sudah terdaftar atau ajukan perusahaan baru.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/portal/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          customerType,
          companyId: customerType === "company" && selectedCompanyId ? selectedCompanyId : undefined,
          requestedCompanyName: customerType === "company" && companyRequestMode
            ? requestedCompanyName.trim()
            : undefined,
          requestedRegistrationNumber: customerType === "company" && companyRequestMode
            ? requestedRegistrationNumber.trim() || undefined
            : undefined,
        }),
      });
      const data = await response.json() as {
        error?: string;
        context?: RfqCustomerContext;
      };
      if (!response.ok || !data.context?.status) {
        setError(data.error ?? "Gagal menyimpan pilihan customer.");
        return;
      }
      onCompleted(data.context);
    } catch {
      setError("Gagal menghubungi server. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (context.status === "company_pending") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2" role="status">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-amber-900">Perusahaan menunggu verifikasi</p>
            <p className="text-[12px] leading-relaxed text-amber-800">
              Perusahaan Anda sedang menunggu verifikasi Admin. Permintaan penawaran dapat dibuat setelah verifikasi selesai.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" className="h-8 rounded-lg text-xs" onClick={onViewStatus}>
          Lihat Status Perusahaan
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 space-y-3" role="region" aria-label="Lengkapi jenis akun">
      <div>
        <p className="text-[13px] font-bold text-slate-800">Lengkapi Jenis Akun</p>
        <p className="text-[12px] text-slate-600 mt-0.5">Anda menggunakan Customer Portal sebagai:</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {([
          { value: "individual" as const, label: "Perorangan", description: "Tanpa membership perusahaan", Icon: User },
          { value: "company" as const, label: "Perusahaan", description: "Gunakan perusahaan canonical", Icon: Building2 },
        ]).map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseType(value)}
            className={`rounded-lg border-2 p-2.5 text-left transition-colors ${
              customerType === value
                ? "border-sky-500 bg-white shadow-sm"
                : "border-white bg-white/70 hover:border-sky-200"
            }`}
            aria-pressed={customerType === value}
          >
            <Icon className={`h-4 w-4 mb-1 ${customerType === value ? "text-sky-600" : "text-slate-400"}`} />
            <span className="block text-xs font-bold text-slate-800">{label}</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">{description}</span>
          </button>
        ))}
      </div>

      {customerType === "company" && (
        <div className="rounded-lg border border-sky-100 bg-white p-2.5 space-y-2">
          {!companyRequestMode ? (
            <>
              <label htmlFor="rfq-company-search" className="block text-[11px] font-semibold text-slate-600">
                Pilih perusahaan yang sudah terdaftar
              </label>
              <Input
                id="rfq-company-search"
                value={companySearch}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setCompanySearch(event.target.value);
                  setSelectedCompanyId(null);
                  setError(null);
                }}
                placeholder="Ketik nama atau kode perusahaan"
                className="h-8 text-xs"
              />
              <div className="rounded-md border divide-y max-h-32 overflow-y-auto">
                {loadingCompanies ? (
                  <div className="p-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat perusahaan…
                  </div>
                ) : companyOptions.length > 0 ? (
                  companyOptions.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompanyId(company.id);
                        setError(null);
                      }}
                      className={`w-full flex items-center justify-between gap-2 p-2 text-left hover:bg-sky-50 ${
                        selectedCompanyId === company.id ? "bg-sky-50" : ""
                      }`}
                    >
                      <span>
                        <span className="block text-xs font-medium text-slate-800">{company.name}</span>
                        <span className="block text-[10px] text-slate-500">{company.code ?? "Tanpa kode"}</span>
                      </span>
                      {selectedCompanyId === company.id && <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <p className="p-2 text-[11px] text-slate-500">Perusahaan tidak ditemukan.</p>
                )}
              </div>
              {selectedCompanyId && (
                <p className="text-[11px] text-emerald-700">Membership akan dibuat untuk perusahaan yang dipilih.</p>
              )}
              <button
                type="button"
                className="text-[11px] font-semibold text-sky-700 hover:underline"
                onClick={() => {
                  setCompanyRequestMode(true);
                  setSelectedCompanyId(null);
                  setError(null);
                }}
              >
                Perusahaan saya belum terdaftar
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Ajukan perusahaan baru</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Admin akan memverifikasi dan memetakan perusahaan Anda.</p>
                </div>
                <button
                  type="button"
                  className="text-[10px] text-sky-700 underline shrink-0"
                  onClick={() => setCompanyRequestMode(false)}
                >
                  Pilih dari daftar
                </button>
              </div>
              <Input
                aria-label="Nama perusahaan"
                value={requestedCompanyName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setRequestedCompanyName(event.target.value)}
                placeholder="PT Nama Perusahaan"
                className="h-8 text-xs"
              />
              <Input
                aria-label="Nomor registrasi"
                value={requestedRegistrationNumber}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setRequestedRegistrationNumber(event.target.value)}
                placeholder="NIB / NPWP (opsional)"
                className="h-8 text-xs"
              />
            </>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-start gap-1.5 text-[11px] text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <Button type="button" className="w-full h-9 rounded-lg text-xs" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
        Simpan pilihan & lanjutkan
      </Button>
    </div>
  );
}