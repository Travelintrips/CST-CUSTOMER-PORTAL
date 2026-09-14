import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  clearPortalAuthBootstrap,
  fetchPortalAuthBootstrap,
  getCachedPortalAuthBootstrap,
  isAuthenticated,
  removeAuthToken,
  type PortalAuthBootstrap,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/i18n/LanguageContext";
import { CUSTOMER_ASSETS } from "@/lib/staticAssets";
import {
  User, Building2, Car, Briefcase, Upload, CheckCircle2,
  AlertCircle, Loader2, Eye, ArrowLeft, ArrowRight, LogOut,
  FileText, Camera,
} from "lucide-react";

type AccountType = "customer" | "vendor" | "driver" | "employee";
type CustomerType = "individual" | "company";
type Step = "basic" | "account-type" | "type-specific" | "review";
type OrganizationCompletionStatus = "legacy_unresolved" | "company_unresolved";

const STEPS: Step[] = ["basic", "account-type", "type-specific", "review"];

const ACCOUNT_TYPES: { value: AccountType; label: string; desc: string; icon: typeof User }[] = [
  { value: "customer",  label: "Customer",  desc: "Saya ingin memesan layanan logistik & pengiriman",  icon: User },
  { value: "vendor",    label: "Vendor",    desc: "Saya adalah penyedia layanan/mitra bisnis",          icon: Building2 },
  { value: "driver",    label: "Driver",    desc: "Saya adalah pengemudi/kurir mitra pengiriman",       icon: Car },
  { value: "employee",  label: "Karyawan",  desc: "Saya adalah karyawan perusahaan",                   icon: Briefcase },
];

const baseSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone:    z.string().min(9, "Nomor HP minimal 9 digit"),
  address:  z.string().min(10, "Alamat minimal 10 karakter"),
});

type BaseForm = z.infer<typeof baseSchema>;

const vendorSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  nib:         z.string().optional(),
  npwp:        z.string().optional(),
  serviceType: z.string().min(2, "Jenis layanan wajib diisi"),
});

type VendorForm = z.infer<typeof vendorSchema>;

const driverSchema = z.object({
  licenseNumber: z.string().min(5, "Nomor SIM wajib diisi"),
  vehicleType:   z.string().min(2, "Jenis kendaraan wajib diisi"),
  plateNumber:   z.string().min(4, "Nomor plat wajib diisi"),
});

type DriverForm = z.infer<typeof driverSchema>;

const employeeSchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan wajib diisi"),
  branch:      z.string().optional(),
  department:  z.string().optional(),
  division:    z.string().optional(),
  position:    z.string().min(2, "Jabatan wajib diisi"),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

interface OcrData {
  nik?: string;
  name?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  gender?: string;
  religion?: string;
  maritalStatus?: string;
  occupation?: string;
}

function StepIndicator({ current }: { current: Step }) {
  const { t } = useLanguage();
  const stepConfig = [
    { id: "basic",        label: t("onboarding.step.basicInfo", "Info Dasar") },
    { id: "account-type", label: t("onboarding.step.accountType", "Tipe Akun") },
    { id: "type-specific",label: t("onboarding.step.detail", "Detail") },
    { id: "review",       label: t("onboarding.step.confirm", "Konfirmasi") },
  ];
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {stepConfig.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx ? "bg-primary text-white" :
              i === idx ? "bg-primary text-white ring-4 ring-primary/20" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < idx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${i === idx ? "text-primary" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </div>
          {i < stepConfig.length - 1 && (
            <div className={`w-12 h-0.5 mx-1 mb-5 ${i < idx ? "bg-primary" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const authed = isAuthenticated();

  const [organizationCompletion, setOrganizationCompletion] = useState<OrganizationCompletionStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [step, setStep]             = useState<Step>("basic");
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState<Array<{ id: number; name: string; code: string | null }>>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyRequestMode, setCompanyRequestMode] = useState(false);
  const [requestedCompanyName, setRequestedCompanyName] = useState("");
  const [requestedRegistrationNumber, setRequestedRegistrationNumber] = useState("");
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [baseData, setBaseData]     = useState<BaseForm | null>(null);
  const [vendorData, setVendorData] = useState<VendorForm | null>(null);
  const [driverData, setDriverData] = useState<DriverForm | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeForm | null>(null);

  const [ktpFile, setKtpFile]       = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [ktpUrl, setKtpUrl]         = useState<string | null>(null);
  const [ocrData, setOcrData]       = useState<OcrData | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError]     = useState<string | null>(null);

  const [legalityFile, setLegalityFile] = useState<File | null>(null);
  const [legalityUrl, setLegalityUrl]   = useState<string | null>(null);
  const [simFile, setSimFile]     = useState<File | null>(null);
  const [simUrl, setSimUrl]       = useState<string | null>(null);
  const [stnkFile, setStnkFile]   = useState<File | null>(null);
  const [stnkUrl, setStnkUrl]     = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const ktpInputRef     = useRef<HTMLInputElement>(null);
  const legalityInputRef = useRef<HTMLInputElement>(null);
  const simInputRef     = useRef<HTMLInputElement>(null);
  const stnkInputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authed) { setLocation("/login"); return; }

    const applyBootstrap = (bootstrap: PortalAuthBootstrap | null) => {
      if (!bootstrap) {
        setStatusLoading(false);
        return;
      }

      const role = bootstrap.role;
      const contextStatus = bootstrap.customerContext.status;
      const resolvedCustomerType: CustomerType | null =
        bootstrap.customerType === "individual" || bootstrap.customerType === "company"
          ? bootstrap.customerType
          : null;
      const isExistingCustomerWithUnresolvedOrganization =
        role === "customer"
        && bootstrap.onboardingStatus === "active"
        && (contextStatus === "legacy_unresolved" || contextStatus === "company_unresolved");

      if (isExistingCustomerWithUnresolvedOrganization) {
        setOrganizationCompletion(contextStatus as OrganizationCompletionStatus);
        setCustomerType(
          resolvedCustomerType
          ?? (contextStatus === "company_unresolved" ? "company" : null),
        );
      } else if (["customer", "vendor", "driver", "employee"].includes(role)) {
        setAccountType(role as AccountType);
        if (role === "customer") setCustomerType(resolvedCustomerType);
      }

      if (isExistingCustomerWithUnresolvedOrganization) {
        setStatusLoading(false);
        return;
      }

      if (bootstrap.allowedDestination !== "/onboarding") {
        setLocation(bootstrap.allowedDestination);
      } else if (
        bootstrap.onboardingStatus === "pending"
        || bootstrap.onboardingStatus === "rejected"
        || contextStatus === "company_pending"
      ) {
        setLocation("/pending-approval");
      }
      setStatusLoading(false);
    };

    const cached = getCachedPortalAuthBootstrap();
    if (cached) {
      applyBootstrap(cached);
      return;
    }

    void fetchPortalAuthBootstrap().then(applyBootstrap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, setLocation]);

  useEffect(() => {
    if (accountType !== "customer" || customerType !== "company") {
      setCompanyOptions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setCompaniesLoading(true);
      try {
        const params = new URLSearchParams();
        if (companySearch.trim()) params.set("search", companySearch.trim());
        const response = await fetch(`/api/portal/organization/companies?${params}`, { credentials: "include" });
        if (!response.ok) throw new Error("Gagal memuat perusahaan");
        const data = await response.json() as Array<{ id: number; name: string; code: string | null }>;
        setCompanyOptions(Array.isArray(data) ? data : []);
      } catch {
        setCompanyOptions([]);
      } finally {
        setCompaniesLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [accountType, customerType, companySearch]);

  // ── Base form ───────────────────────────────────────────────────────────────
  const baseForm = useForm<BaseForm>({
    resolver: zodResolver(baseSchema),
    defaultValues: { fullName: "", phone: "", address: "" },
  });

  // ── Vendor form ─────────────────────────────────────────────────────────────
  const vendorForm = useForm<VendorForm>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { companyName: "", nib: "", npwp: "", serviceType: "" },
  });

  // ── Driver form ─────────────────────────────────────────────────────────────
  const driverForm = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
    defaultValues: { licenseNumber: "", vehicleType: "", plateNumber: "" },
  });

  // ── Employee form ───────────────────────────────────────────────────────────
  const employeeForm = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { companyName: "", branch: "", department: "", division: "", position: "" },
  });

  // ── KTP upload + OCR ────────────────────────────────────────────────────────
  async function handleKtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setKtpFile(file);
    setKtpUrl(null);
    setOcrData(null);
    setOcrError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setKtpPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    await runOcr(file);
  }

  async function runOcr(file: File) {
    setOcrLoading(true);
    setOcrError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/portal/onboarding/ktp-ocr", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json() as { ok?: boolean; data?: OcrData; error?: string };
      if (!res.ok || !json.ok) {
        setOcrError(json.error ?? t("onboarding.ocr.failed", "OCR gagal. Coba upload ulang."));
      } else {
        setOcrData(json.data ?? null);
        // Auto-fill form fields if empty
        if (json.data?.name && !baseForm.getValues("fullName")) {
          baseForm.setValue("fullName", json.data.name);
        }
        if (json.data?.address && !baseForm.getValues("address")) {
          baseForm.setValue("address", json.data.address);
        }
      }
    } catch {
      setOcrError(t("onboarding.ocr.serverError", "Gagal menghubungi server OCR."));
    } finally {
      setOcrLoading(false);
    }
  }

  async function uploadFile(file: File, docType: string): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("docType", docType);
    try {
      const res = await fetch("/api/portal/onboarding/upload-doc", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json() as { url?: string; error?: string };
      return json.url ?? null;
    } catch { return null; }
  }

  // ── Step navigation ──────────────────────────────────────────────────────────
  async function handleBaseNext(data: BaseForm) {
    setBaseData(data);
    setStep("account-type");
  }

  function handleAccountTypeNext() {
    if (accountType === "customer") {
      if (!customerType) {
        setCompanyError("Pilih tipe customer: Perorangan atau Perusahaan.");
        return;
      }
      setCompanyError(null);
      setStep(customerType === "company" ? "type-specific" : "review");
    } else {
      setStep("type-specific");
    }
  }

  async function handleTypeSpecificNext() {
    if (accountType === "customer") {
      if (customerType !== "company") {
        setStep("review");
        return;
      }
      if (!selectedCompanyId && (!companyRequestMode || !requestedCompanyName.trim())) {
        setCompanyError("Pilih perusahaan canonical atau ajukan perusahaan yang belum terdaftar.");
        return;
      }
      setCompanyError(null);
    } else if (accountType === "vendor") {
      const valid = await vendorForm.trigger();
      if (!valid) return;
      setVendorData(vendorForm.getValues());
    } else if (accountType === "driver") {
      const valid = await driverForm.trigger();
      if (!valid) return;
      setDriverData(driverForm.getValues());
    } else if (accountType === "employee") {
      const valid = await employeeForm.trigger();
      if (!valid) return;
      setEmployeeData(employeeForm.getValues());
    }
    setStep("review");
  }

  function goBack() {
    if (step === "account-type") setStep("basic");
    else if (step === "type-specific") setStep("account-type");
    else if (step === "review") {
      setStep(accountType === "customer" ? "account-type" : "type-specific");
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Upload KTP if selected
      let finalKtpUrl = ktpUrl;
      if (ktpFile && !ktpUrl) {
        finalKtpUrl = await uploadFile(ktpFile, "ktp");
        if (finalKtpUrl) setKtpUrl(finalKtpUrl);
      }

      // Upload type-specific docs
      let finalLegalityUrl = legalityUrl;
      let finalSimUrl = simUrl;
      let finalStnkUrl = stnkUrl;
      if (legalityFile && !legalityUrl) {
        finalLegalityUrl = await uploadFile(legalityFile, "legalitas");
        if (finalLegalityUrl) setLegalityUrl(finalLegalityUrl);
      }
      if (simFile && !simUrl) {
        finalSimUrl = await uploadFile(simFile, "sim");
        if (finalSimUrl) setSimUrl(finalSimUrl);
      }
      if (stnkFile && !stnkUrl) {
        finalStnkUrl = await uploadFile(stnkFile, "stnk");
        if (finalStnkUrl) setStnkUrl(finalStnkUrl);
      }

      const payload = {
        ...baseData,
        accountType,
         customerType: accountType === "customer" ? customerType ?? undefined : undefined,
         companyId: accountType === "customer" && selectedCompanyId ? selectedCompanyId : undefined,
         requestedCompanyName: accountType === "customer" && companyRequestMode ? requestedCompanyName.trim() || undefined : undefined,
         requestedRegistrationNumber: accountType === "customer" && companyRequestMode ? requestedRegistrationNumber.trim() || undefined : undefined,
        ktpUrl: finalKtpUrl,
        ocrData,
        vendor:   accountType === "vendor"   ? { ...vendorData, legalityDocUrl: finalLegalityUrl } : undefined,
        driver:   accountType === "driver"   ? { ...driverData, simUrl: finalSimUrl, stnkUrl: finalStnkUrl } : undefined,
        employee: accountType === "employee" ? employeeData : undefined,
      };

      const res = await fetch("/api/portal/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
       const json = await res.json() as { ok?: boolean; status?: string; error?: string };
      if (!res.ok || !json.ok) {
        setSubmitError(json.error ?? t("onboarding.submit.saveFailed", "Gagal menyimpan profil."));
        return;
      }
       clearPortalAuthBootstrap();
       if (json.status === "pending" || json.status === "company_pending") {
        setLocation("/pending-approval");
       } else if (accountType === "vendor") {
         setLocation("/vendor-dashboard");
      } else {
        setLocation("/dashboard");
      }
    } catch {
      setSubmitError(t("onboarding.submit.serverError", "Gagal menghubungi server."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authed) return null;
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (organizationCompletion) {
    return (
      <LegacyOrganizationCompletion
        initialCustomerType={customerType}
        onLogout={() => { removeAuthToken(); setLocation("/login"); }}
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex mb-4" style={{ background: "rgba(255,255,255,0.95)", borderRadius: "14px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(15,23,42,0.10)" }}>
            <img src={CUSTOMER_ASSETS.logo} alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("onboarding.header.title", "Lengkapi Profil Anda")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("onboarding.header.subtitle", "Isi data berikut untuk mengaktifkan akun Anda")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <StepIndicator current={step} />

          {/* ── STEP 1: Basic Info ── */}
          {step === "basic" && (
            <form onSubmit={baseForm.handleSubmit(handleBaseNext)} className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">{t("onboarding.basicInfo.title", "Informasi Dasar")}</h2>

              <div className="space-y-2">
                <Label>{t("onboarding.basicInfo.fullName", "Nama Lengkap")} <span className="text-red-500">*</span></Label>
                <Input
                  placeholder={t("onboarding.basicInfo.fullNamePlaceholder", "Sesuai KTP")}
                  {...baseForm.register("fullName")}
                />
                {baseForm.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{baseForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.basicInfo.phone", "Nomor HP / WhatsApp")} <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  {...baseForm.register("phone")}
                />
                {baseForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{baseForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.basicInfo.address", "Alamat Lengkap")} <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder={t("onboarding.basicInfo.addressPlaceholder", "Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota/Kabupaten")}
                  rows={3}
                  {...baseForm.register("address")}
                />
                {baseForm.formState.errors.address && (
                  <p className="text-sm text-red-500">{baseForm.formState.errors.address.message}</p>
                )}
              </div>

              {/* KTP Upload + OCR */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {t("onboarding.ktp.uploadLabel", "Upload KTP (Opsional, untuk OCR otomatis)")}
                </Label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => ktpInputRef.current?.click()}
                >
                  {ktpPreview ? (
                    <img src={ktpPreview} alt="KTP" className="max-h-32 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">{t("onboarding.ktp.clickToUpload", "Klik untuk upload foto KTP")}</p>
                      <p className="text-xs text-muted-foreground">{t("onboarding.ktp.fileHint", "JPG, PNG, maks. 10MB")}</p>
                    </div>
                  )}
                </div>
                <input
                  ref={ktpInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleKtpChange}
                />

                {ocrLoading && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <AlertDescription className="text-blue-800">
                      {t("onboarding.ocr.reading", "Sedang membaca data KTP...")}
                    </AlertDescription>
                  </Alert>
                )}

                {ocrError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{ocrError}</AlertDescription>
                  </Alert>
                )}

                {ocrData && !ocrLoading && (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("onboarding.ocr.success", "Data KTP berhasil dibaca — silakan periksa dan edit jika perlu")}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      {ocrData.nik     && <><span className="text-muted-foreground">NIK</span><span className="font-mono font-medium">{ocrData.nik}</span></>}
                      {ocrData.name    && <><span className="text-muted-foreground">{t("onboarding.ocr.name", "Nama")}</span><span>{ocrData.name}</span></>}
                      {ocrData.birthDate && <><span className="text-muted-foreground">{t("onboarding.ocr.birthDate", "Tgl Lahir")}</span><span>{ocrData.birthDate}</span></>}
                      {ocrData.gender  && <><span className="text-muted-foreground">{t("onboarding.ocr.gender", "JK")}</span><span>{ocrData.gender}</span></>}
                      {ocrData.address && <><span className="text-muted-foreground col-span-2">{t("onboarding.ocr.ktpAddress", "Alamat KTP")}</span><span className="col-span-2 text-xs">{ocrData.address}</span></>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t("onboarding.ocr.autoFillNote", "Data di atas otomatis mengisi form. Anda bisa edit secara manual.")}</p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full gap-2">
                {t("onboarding.next", "Lanjut")} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* ── STEP 2: Account Type ── */}
          {step === "account-type" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">{t("onboarding.accountType.title", "Pilih Tipe Akun")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCOUNT_TYPES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAccountType(value)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      accountType === value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg ${accountType === value ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      {value !== "customer" && (
                        <Badge variant="secondary" className="mt-1 text-xs">{t("onboarding.accountType.needsAdminApproval", "Perlu persetujuan admin")}</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>

               {accountType === "customer" && (
                 <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                   <div>
                     <p className="font-semibold text-sm">Tipe Customer</p>
                     <p className="text-xs text-muted-foreground mt-1">
                       Pilihan ini menentukan apakah akun Anda memakai konteks perusahaan.
                     </p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {([
                       { value: "individual" as const, label: "Perorangan", desc: "Tidak memerlukan membership perusahaan.", icon: User },
                       { value: "company" as const, label: "Perusahaan", desc: "Terhubung ke perusahaan canonical atau ajukan perusahaan baru.", icon: Building2 },
                     ]).map(({ value, label, desc, icon: Icon }) => (
                       <button
                         key={value}
                         type="button"
                         onClick={() => {
                           setCustomerType(value);
                           setCompanyError(null);
                           if (value === "individual") {
                             setSelectedCompanyId(null);
                             setCompanyRequestMode(false);
                           }
                         }}
                         className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                           customerType === value
                             ? "border-emerald-500 bg-white shadow-sm"
                             : "border-white bg-white hover:border-emerald-200"
                         }`}
                       >
                         <Icon className={`mt-0.5 h-5 w-5 ${customerType === value ? "text-emerald-600" : "text-gray-400"}`} />
                         <span>
                           <span className="block font-semibold text-sm">{label}</span>
                           <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
                         </span>
                       </button>
                     ))}
                   </div>
                   {companyError && <p className="text-sm text-red-600">{companyError}</p>}
                 </div>
               )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" /> {t("onboarding.back", "Kembali")}
                </Button>
                <Button className="flex-1 gap-2" onClick={handleAccountTypeNext}>
                  {t("onboarding.next", "Lanjut")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Type-Specific ── */}
          {step === "type-specific" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">
                 {accountType === "customer" && "Pilih Perusahaan"}
                {accountType === "vendor"   && t("onboarding.vendorDetail.title", "Detail Vendor")}
                {accountType === "driver"   && t("onboarding.driverDetail.title", "Detail Driver")}
                {accountType === "employee" && t("onboarding.employeeDetail.title", "Detail Karyawan")}
              </h2>

               {/* CUSTOMER COMPANY */}
               {accountType === "customer" && customerType === "company" && (
                 <div className="space-y-4">
                   <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                     Pilih perusahaan yang sudah terdaftar agar membership Anda dibuat otomatis. Jika belum ada, ajukan untuk diverifikasi admin.
                   </div>
                   {!companyRequestMode && (
                     <>
                       <div className="space-y-2">
                         <Label htmlFor="customer-company-search">Cari perusahaan canonical</Label>
                         <Input
                           id="customer-company-search"
                           value={companySearch}
                           onChange={(event) => {
                             setCompanySearch(event.target.value);
                             setSelectedCompanyId(null);
                           }}
                           placeholder="Ketik nama atau kode perusahaan"
                         />
                       </div>
                       <div className="rounded-lg border bg-white divide-y max-h-56 overflow-y-auto">
                         {companiesLoading ? (
                           <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin" /> Memuat perusahaan…
                           </div>
                         ) : companyOptions.length > 0 ? (
                           companyOptions.map((company) => (
                             <button
                               key={company.id}
                               type="button"
                               onClick={() => {
                                 setSelectedCompanyId(company.id);
                                 setCompanyError(null);
                               }}
                               className={`w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-emerald-50 ${
                                 selectedCompanyId === company.id ? "bg-emerald-50 ring-1 ring-inset ring-emerald-400" : ""
                               }`}
                             >
                               <span>
                                 <span className="block font-medium text-sm">{company.name}</span>
                                 <span className="block text-xs text-muted-foreground">{company.code ?? "Tanpa kode"}</span>
                               </span>
                               {selectedCompanyId === company.id && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                             </button>
                           ))
                         ) : (
                           <p className="p-4 text-sm text-muted-foreground">Perusahaan tidak ditemukan.</p>
                         )}
                       </div>
                       <button
                         type="button"
                         className="text-sm font-medium text-emerald-700 hover:underline"
                         onClick={() => {
                           setCompanyRequestMode(true);
                           setSelectedCompanyId(null);
                           setCompanyError(null);
                         }}
                       >
                         Perusahaan saya belum terdaftar
                       </button>
                       {selectedCompanyId && (
                         <p className="text-sm text-emerald-700 flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4" /> Perusahaan canonical dipilih. Membership akan dibuat otomatis.
                         </p>
                       )}
                     </>
                   )}
                   {companyRequestMode && (
                     <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                       <div className="flex items-start justify-between gap-3">
                         <div>
                           <p className="font-semibold text-sm text-amber-900">Perusahaan saya belum terdaftar</p>
                           <p className="text-xs text-amber-800 mt-1">Admin akan memeriksa dan memetakan perusahaan Anda ke data canonical.</p>
                         </div>
                         <button
                           type="button"
                           className="text-xs text-amber-800 underline"
                           onClick={() => {
                             setCompanyRequestMode(false);
                             setCompanyError(null);
                           }}
                         >
                           Pilih dari daftar
                         </button>
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="requested-company-name">Nama perusahaan</Label>
                         <Input
                           id="requested-company-name"
                           value={requestedCompanyName}
                           onChange={(event) => setRequestedCompanyName(event.target.value)}
                           placeholder="PT Nama Perusahaan"
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="requested-company-registration">Nomor registrasi (opsional)</Label>
                         <Input
                           id="requested-company-registration"
                           value={requestedRegistrationNumber}
                           onChange={(event) => setRequestedRegistrationNumber(event.target.value)}
                           placeholder="NIB / NPWP"
                         />
                       </div>
                     </div>
                   )}
                   {companyError && <p className="text-sm text-red-600">{companyError}</p>}
                 </div>
               )}

              {/* VENDOR */}
              {accountType === "vendor" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("onboarding.vendor.companyName", "Nama Perusahaan")} <span className="text-red-500">*</span></Label>
                    <Input placeholder={t("onboarding.vendor.companyNamePlaceholder", "PT / CV / UD ...")} {...vendorForm.register("companyName")} />
                    {vendorForm.formState.errors.companyName && <p className="text-sm text-red-500">{vendorForm.formState.errors.companyName.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("onboarding.vendor.nib", "NIB (Opsional)")}</Label>
                      <Input placeholder={t("onboarding.vendor.nibPlaceholder", "Nomor Induk Berusaha")} {...vendorForm.register("nib")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("onboarding.vendor.npwp", "NPWP (Opsional)")}</Label>
                      <Input placeholder="XX.XXX.XXX.X-XXX.XXX" {...vendorForm.register("npwp")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("onboarding.vendor.serviceType", "Jenis Layanan Vendor")} <span className="text-red-500">*</span></Label>
                    <Input placeholder={t("onboarding.vendor.serviceTypePlaceholder", "contoh: Trucking, Forwarding, Warehouse, dll.")} {...vendorForm.register("serviceType")} />
                    {vendorForm.formState.errors.serviceType && <p className="text-sm text-red-500">{vendorForm.formState.errors.serviceType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" />{t("onboarding.vendor.legalityDoc", "Upload Dokumen Legalitas (Opsional)")}</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      onClick={() => legalityInputRef.current?.click()}>
                      {legalityFile ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {legalityFile.name}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">{t("onboarding.vendor.legalityDocHint", "NIB, Akta Perusahaan, dll.")}</p>
                        </div>
                      )}
                    </div>
                    <input ref={legalityInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setLegalityFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>
              )}

              {/* DRIVER */}
              {accountType === "driver" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("onboarding.driver.licenseNumber", "Nomor SIM")} <span className="text-red-500">*</span></Label>
                    <Input placeholder={t("onboarding.driver.licenseNumberPlaceholder", "Nomor SIM sesuai kartu")} {...driverForm.register("licenseNumber")} />
                    {driverForm.formState.errors.licenseNumber && <p className="text-sm text-red-500">{driverForm.formState.errors.licenseNumber.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("onboarding.driver.vehicleType", "Jenis Kendaraan")} <span className="text-red-500">*</span></Label>
                      <Input placeholder={t("onboarding.driver.vehicleTypePlaceholder", "Motor / Mobil / Truk / dll.")} {...driverForm.register("vehicleType")} />
                      {driverForm.formState.errors.vehicleType && <p className="text-sm text-red-500">{driverForm.formState.errors.vehicleType.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("onboarding.driver.plateNumber", "Nomor Plat")} <span className="text-red-500">*</span></Label>
                      <Input placeholder="B 1234 ABC" {...driverForm.register("plateNumber")} />
                      {driverForm.formState.errors.plateNumber && <p className="text-sm text-red-500">{driverForm.formState.errors.plateNumber.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{t("onboarding.driver.uploadSim", "Upload SIM")}</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => simInputRef.current?.click()}>
                        {simFile ? <p className="text-xs text-green-700 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{simFile.name.slice(0, 16)}</p>
                          : <><Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t("onboarding.driver.uploadSimHint", "Upload SIM")}</p></>}
                      </div>
                      <input ref={simInputRef} type="file" accept="image/*" className="hidden" onChange={e => setSimFile(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{t("onboarding.driver.uploadStnk", "Upload STNK")}</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => stnkInputRef.current?.click()}>
                        {stnkFile ? <p className="text-xs text-green-700 flex items-center justify-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{stnkFile.name.slice(0, 16)}</p>
                          : <><Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t("onboarding.driver.uploadStnkHint", "Upload STNK")}</p></>}
                      </div>
                      <input ref={stnkInputRef} type="file" accept="image/*" className="hidden" onChange={e => setStnkFile(e.target.files?.[0] ?? null)} />
                    </div>
                  </div>
                </div>
              )}

              {/* EMPLOYEE */}
              {accountType === "employee" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("onboarding.employee.companyName", "Nama Perusahaan")} <span className="text-red-500">*</span></Label>
                    <Input placeholder={t("onboarding.employee.companyNamePlaceholder", "Nama perusahaan tempat bekerja")} {...employeeForm.register("companyName")} />
                    {employeeForm.formState.errors.companyName && <p className="text-sm text-red-500">{employeeForm.formState.errors.companyName.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("onboarding.employee.branch", "Cabang (Opsional)")}</Label>
                      <Input placeholder={t("onboarding.employee.branchPlaceholder", "Nama cabang")} {...employeeForm.register("branch")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("onboarding.employee.department", "Departemen (Opsional)")}</Label>
                      <Input placeholder={t("onboarding.employee.departmentPlaceholder", "Nama departemen")} {...employeeForm.register("department")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("onboarding.employee.division", "Divisi (Opsional)")}</Label>
                      <Input placeholder={t("onboarding.employee.divisionPlaceholder", "Nama divisi")} {...employeeForm.register("division")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("onboarding.employee.position", "Jabatan")} <span className="text-red-500">*</span></Label>
                      <Input placeholder={t("onboarding.employee.positionPlaceholder", "Jabatan / Posisi")} {...employeeForm.register("position")} />
                      {employeeForm.formState.errors.position && <p className="text-sm text-red-500">{employeeForm.formState.errors.position.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" /> {t("onboarding.back", "Kembali")}
                </Button>
                <Button className="flex-1 gap-2" onClick={handleTypeSpecificNext}>
                  {t("onboarding.next", "Lanjut")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === "review" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">{t("onboarding.review.title", "Konfirmasi Data")}</h2>

              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 text-sm">
                <div className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground tracking-wide">{t("onboarding.review.basicInfo", "Informasi Dasar")}</div>
                <Row label={t("onboarding.review.fullName", "Nama Lengkap")} value={baseData?.fullName} />
                <Row label={t("onboarding.review.phone", "Nomor HP")} value={baseData?.phone} />
                <Row label={t("onboarding.review.address", "Alamat")} value={baseData?.address} />
                <Row label={t("onboarding.review.ktp", "KTP")} value={ktpFile ? `✅ ${ktpFile.name}` : t("onboarding.review.notUploaded", "Tidak diupload")} />
                {ocrData?.nik && <Row label={t("onboarding.review.nikOcr", "NIK (OCR)")} value={ocrData.nik} />}

                <div className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground tracking-wide">{t("onboarding.review.accountType", "Tipe Akun")}</div>
                <Row label={t("onboarding.review.type", "Tipe")} value={ACCOUNT_TYPES.find(a => a.value === accountType)?.label ?? accountType} />
                 {accountType === "customer" && customerType && (
                   <>
                     <Row label="Tipe Customer" value={customerType === "individual" ? "Perorangan" : "Perusahaan"} />
                     {customerType === "individual" ? (
                       <div className="px-4 py-3 text-sm text-emerald-700 bg-emerald-50">
                         Customer perorangan — membership perusahaan tidak diperlukan.
                       </div>
                     ) : selectedCompanyId ? (
                       <div className="px-4 py-3 text-sm text-emerald-700 bg-emerald-50">
                         Perusahaan canonical dipilih — membership akan dibuat otomatis.
                       </div>
                     ) : (
                       <div className="px-4 py-3 text-sm text-amber-800 bg-amber-50">
                         Perusahaan belum terdaftar — permintaan akan dikirim untuk verifikasi admin.
                       </div>
                     )}
                   </>
                 )}

                {accountType === "vendor" && vendorData && <>
                  <div className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground tracking-wide">{t("onboarding.review.vendorData", "Data Vendor")}</div>
                  <Row label={t("onboarding.review.company", "Perusahaan")} value={vendorData.companyName} />
                  <Row label="NIB" value={vendorData.nib || "-"} />
                  <Row label="NPWP" value={vendorData.npwp || "-"} />
                  <Row label={t("onboarding.review.serviceType", "Jenis Layanan")} value={vendorData.serviceType} />
                  <Row label={t("onboarding.review.legalityDoc", "Dok. Legalitas")} value={legalityFile ? `✅ ${legalityFile.name}` : t("onboarding.review.notUploaded", "Tidak diupload")} />
                </>}

                {accountType === "driver" && driverData && <>
                  <div className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground tracking-wide">{t("onboarding.review.driverData", "Data Driver")}</div>
                  <Row label={t("onboarding.review.licenseNumber", "No. SIM")} value={driverData.licenseNumber} />
                  <Row label={t("onboarding.review.vehicle", "Kendaraan")} value={driverData.vehicleType} />
                  <Row label={t("onboarding.review.plate", "Plat")} value={driverData.plateNumber} />
                  <Row label="SIM" value={simFile ? `✅ ${simFile.name}` : t("onboarding.review.notUploaded", "Tidak diupload")} />
                  <Row label="STNK" value={stnkFile ? `✅ ${stnkFile.name}` : t("onboarding.review.notUploaded", "Tidak diupload")} />
                </>}

                {accountType === "employee" && employeeData && <>
                  <div className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground tracking-wide">{t("onboarding.review.employeeData", "Data Karyawan")}</div>
                  <Row label={t("onboarding.review.company", "Perusahaan")} value={employeeData.companyName} />
                  <Row label={t("onboarding.review.position", "Jabatan")} value={employeeData.position} />
                  {employeeData.branch     && <Row label={t("onboarding.review.branch", "Cabang")} value={employeeData.branch} />}
                  {employeeData.department && <Row label={t("onboarding.review.department", "Departemen")} value={employeeData.department} />}
                  {employeeData.division   && <Row label={t("onboarding.review.division", "Divisi")} value={employeeData.division} />}
                </>}
              </div>

               {accountType === "customer" && customerType === "company" && !selectedCompanyId && companyRequestMode && (
                 <Alert className="border-amber-200 bg-amber-50">
                   <Eye className="h-4 w-4 text-amber-500" />
                   <AlertDescription className="text-amber-800">
                     Status setelah disimpan: <strong>Menunggu verifikasi perusahaan</strong>. Anda tidak dapat membuat RFQ perusahaan sampai admin memetakan perusahaan canonical.
                   </AlertDescription>
                 </Alert>
               )}

               {accountType !== "customer" && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Eye className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-800">
                    {t("onboarding.review.pendingNotice.prefix", "Akun")} <strong>{ACCOUNT_TYPES.find(a => a.value === accountType)?.label}</strong> {t("onboarding.review.pendingNotice.suffix", "akan masuk status")} <strong>{t("onboarding.review.pendingReview", "Pending Review")}</strong> {t("onboarding.review.pendingNotice.detail", "dan perlu persetujuan admin sebelum bisa digunakan.")}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={goBack} disabled={submitting}>
                  <ArrowLeft className="h-4 w-4" /> {t("onboarding.back", "Kembali")}
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />{t("onboarding.review.saving", "Menyimpan...")}</> : <><CheckCircle2 className="h-4 w-4" />{t("onboarding.review.saveAndContinue", "Simpan & Lanjut")}</>}
                </Button>
              </div>

              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mt-2"
                onClick={() => { removeAuthToken(); setLocation("/login"); }}
              >
                <LogOut className="h-3 w-3" /> {t("onboarding.review.logout", "Keluar dari akun ini")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="px-4 py-2.5 flex justify-between gap-4">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="font-medium text-right">{value || "-"}</span>
    </div>
  );
}

function LegacyOrganizationCompletion({
  initialCustomerType,
  onLogout,
}: {
  initialCustomerType: CustomerType | null;
  onLogout: () => void;
}) {
  const [, setLocation] = useLocation();
  const [customerType, setCustomerType] = useState<CustomerType | null>(initialCustomerType);
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState<Array<{ id: number; name: string; code: string | null }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyRequestMode, setCompanyRequestMode] = useState(false);
  const [requestedCompanyName, setRequestedCompanyName] = useState("");
  const [requestedRegistrationNumber, setRequestedRegistrationNumber] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerType !== "company") {
      setCompanyOptions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoadingCompanies(true);
      try {
        const params = new URLSearchParams();
        if (companySearch.trim()) params.set("search", companySearch.trim());
        const response = await fetch(`/api/portal/organization/companies?${params}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Gagal memuat daftar perusahaan.");
        const data = await response.json() as Array<{ id: number; name: string; code: string | null }>;
        setCompanyOptions(Array.isArray(data) ? data : []);
      } catch {
        setCompanyOptions([]);
      } finally {
        setLoadingCompanies(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [customerType, companySearch]);

  async function submit() {
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

    setSubmitting(true);
    try {
      const response = await fetch("/api/portal/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        context?: { status?: string };
      };
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan pilihan organisasi.");
        return;
      }
      clearPortalAuthBootstrap();
      if (data.context?.status === "company_pending") {
        setLocation("/pending-approval");
      } else {
        setLocation("/dashboard");
      }
    } catch {
      setError("Gagal menghubungi server. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-7 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lengkapi jenis akun Customer Portal</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gunakan Customer Portal sebagai
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              {
                value: "individual" as const,
                label: "Perorangan",
                description: "Tidak memerlukan membership perusahaan dan dapat membuat RFQ langsung.",
                icon: User,
              },
              {
                value: "company" as const,
                label: "Perusahaan",
                description: "Pilih perusahaan canonical atau ajukan perusahaan baru untuk diverifikasi admin.",
                icon: Building2,
              },
            ]).map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCustomerType(value);
                  setError(null);
                  if (value === "individual") {
                    setSelectedCompanyId(null);
                    setCompanyRequestMode(false);
                  }
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  customerType === value
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-gray-100 hover:border-emerald-200"
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${customerType === value ? "text-emerald-600" : "text-gray-400"}`} />
                <span className="block font-semibold text-sm">{label}</span>
                <span className="block text-xs text-muted-foreground mt-1">{description}</span>
              </button>
            ))}
          </div>

          {customerType === "company" && (
            <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              {!companyRequestMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="legacy-company-search">Cari perusahaan yang sudah terdaftar</Label>
                    <Input
                      id="legacy-company-search"
                      value={companySearch}
                      onChange={(event) => {
                        setCompanySearch(event.target.value);
                        setSelectedCompanyId(null);
                      }}
                      placeholder="Ketik nama atau kode perusahaan"
                    />
                  </div>
                  <div className="rounded-lg border bg-white divide-y max-h-52 overflow-y-auto">
                    {loadingCompanies ? (
                      <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat perusahaan…
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
                          className={`w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-emerald-50 ${
                            selectedCompanyId === company.id ? "bg-emerald-50 ring-1 ring-inset ring-emerald-400" : ""
                          }`}
                        >
                          <span>
                            <span className="block font-medium text-sm">{company.name}</span>
                            <span className="block text-xs text-muted-foreground">{company.code ?? "Tanpa kode"}</span>
                          </span>
                          {selectedCompanyId === company.id && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground">Perusahaan tidak ditemukan.</p>
                    )}
                  </div>
                  {selectedCompanyId && (
                    <p className="text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Membership akan dibuat atau diaktifkan untuk perusahaan ini.
                    </p>
                  )}
                  <button
                    type="button"
                    className="text-sm font-medium text-emerald-700 hover:underline"
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
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Ajukan perusahaan baru</p>
                      <p className="text-xs text-gray-600 mt-1">Admin akan memeriksa dan memetakan perusahaan Anda ke data canonical.</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-emerald-700 underline"
                      onClick={() => setCompanyRequestMode(false)}
                    >
                      Pilih dari daftar
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legacy-requested-company-name">Nama perusahaan</Label>
                    <Input
                      id="legacy-requested-company-name"
                      value={requestedCompanyName}
                      onChange={(event) => setRequestedCompanyName(event.target.value)}
                      placeholder="PT Nama Perusahaan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legacy-requested-registration">Nomor registrasi (opsional)</Label>
                    <Input
                      id="legacy-requested-registration"
                      value={requestedRegistrationNumber}
                      onChange={(event) => setRequestedRegistrationNumber(event.target.value)}
                      placeholder="NIB / NPWP"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {customerType === "company" && (selectedCompanyId || (companyRequestMode && requestedCompanyName.trim())) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {selectedCompanyId
                ? "Setelah disimpan, Anda dapat membuat RFQ dengan konteks perusahaan yang dipilih."
                : "Perusahaan akan berstatus menunggu verifikasi admin. RFQ perusahaan baru tersedia setelah pemetaan selesai."}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 gap-2" onClick={onLogout} disabled={submitting}>
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
            <Button className="flex-1 gap-2" onClick={submit} disabled={submitting}>
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…</>
                : <><CheckCircle2 className="h-4 w-4" /> Simpan pilihan</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
