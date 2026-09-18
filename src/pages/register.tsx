import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useListPortalServices } from "@shared/api-client-react";
import {
  fetchPortalAuthBootstrap,
  setPortalProfile,
  saveTrustedDevice,
  REMEMBER_DAYS,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Check, LockKeyhole, Mail, MessageCircle, Phone, Shield, Truck, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/i18n/LanguageContext";

type UserRole = "customer" | "vendor";
type CustomerType = "individual" | "company";
type Step = "phone" | "otp" | "profile";
type RegistrationMethod = "email" | "google" | "whatsapp" | "password";

interface AuthCapabilities {
  emailOtp: boolean;
  google: boolean;
  whatsapp: boolean;
  password: boolean;
}

interface SimpleItem {
  id: number;
  name: string;
  itemType: "jasa" | "barang";
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Register() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  const phoneFromUrl = new URLSearchParams(window.location.search).get("phone") ?? "";
  const [step, setStep] = useState<Step>("phone");
  const [method, setMethod] = useState<RegistrationMethod>("email");
  const [capabilities, setCapabilities] = useState<AuthCapabilities>({
    emailOtp: false, google: false, whatsapp: false, password: true,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [phone, setPhone] = useState(phoneFromUrl);
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState<"email" | "code">("email");
  const [emailCode, setEmailCode] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordName, setPasswordName] = useState("");
  const [passwordPhone, setPasswordPhone] = useState("");
  const [passwordEmail, setPasswordEmail] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [role, setRole] = useState<UserRole>("customer");
  const [customerType, setCustomerType] = useState<CustomerType>("individual");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [products, setProducts] = useState<SimpleItem[]>([]);
  const [rememberDevice, setRememberDevice] = useState(true);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const { data: servicesData } = useListPortalServices({ query: { queryKey: ["listPortalServices"] } });
  const services: SimpleItem[] = (Array.isArray(servicesData) ? servicesData : []).map((s) => ({
    id: s.id, name: s.name, itemType: "jasa" as const,
  }));

  async function redirectExistingAccount(role: string) {
    const bootstrap = await fetchPortalAuthBootstrap(returnTo);
    if (bootstrap) {
      setLocation(bootstrap.allowedDestination);
      return;
    }
    setLocation(role === "vendor" ? "/vendor-dashboard" : "/dashboard");
  }

  useEffect(() => {
    fetch(`${BASE}/api/portal/products`)
      .then((r) => { if (!r.ok) throw new Error("failed"); return r.json(); })
      .then((data) => setProducts(Array.isArray(data) ? data.map((p: any) => ({ id: p.id, name: p.name, itemType: "barang" as const })) : []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpInputRef.current?.focus(), 100);
  }, [step]);

  const allItems = [...services, ...products];

  useEffect(() => {
    fetch(`${BASE}/api/portal/auth/capabilities`, { credentials: "include" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("capabilities unavailable")))
      .then((data: AuthCapabilities) => {
        setCapabilities(data);
        if (method === "email" && !data.emailOtp) {
          setMethod(data.whatsapp ? "whatsapp" : "password");
        }
      })
      .catch(() => {
        // Keep only the password path visible if the capability contract fails.
        setCapabilities((current) => ({ ...current, emailOtp: false, google: false, whatsapp: false }));
        setMethod("password");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectMethod = (next: RegistrationMethod) => {
    setMethod(next);
    setErrorMsg("");
    setEmailMsg("");
    setPasswordMsg("");
    if (next !== "whatsapp") {
      setStep("phone");
      setOtp("");
    }
  };

  const startGoogleRegistration = () => {
    if (!capabilities.google) return;
    const query = new URLSearchParams({ returnTo: "/onboarding", portal: "1" });
    window.location.assign(`${BASE}/api/login/google?${query.toString()}`);
  };

  const sendEmailOtp = async () => {
    setEmailMsg("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailMsg("Masukkan alamat email yang valid.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json() as { message?: string; _dev_code?: string };
      if (!res.ok) {
        setEmailMsg(json.message ?? "Gagal mengirim OTP email.");
      } else {
        setEmailStep("code");
        setEmailMsg(json.message ?? "Kode OTP telah dikirim ke email Anda.");
        if (json._dev_code) setEmailCode(json._dev_code);
      }
    } catch {
      setEmailMsg("Gagal menghubungi server.");
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setEmailMsg("");
    if (emailCode.trim().length !== 6) {
      setEmailMsg("Masukkan kode OTP 6 digit.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), code: emailCode.trim() }),
      });
      const json = await res.json() as {
        token?: string;
        isNew?: boolean;
        message?: string;
        user?: { id: number; role: string; name: string; email: string };
      };
      if (!res.ok || !json.token || !json.user) {
        setEmailMsg(json.message ?? "Kode OTP tidak valid.");
        return;
      }
      setPortalProfile({ customerId: json.user.id, role: json.user.role, name: json.user.name, email: json.user.email });
      // New email identities enter the same canonical onboarding as WA/Google.
      // Existing accounts are also sent through the status-aware onboarding
      // route, which redirects completed profiles to their portal.
      if (json.isNew) setLocation("/onboarding");
      else await redirectExistingAccount(json.user.role);
    } catch {
      setEmailMsg("Gagal menghubungi server.");
    } finally {
      setEmailLoading(false);
    }
  };

  const registerWithPassword = async () => {
    setPasswordMsg("");
    if (passwordName.trim().length < 3) {
      setPasswordMsg("Nama minimal 3 karakter.");
      return;
    }
    if (!passwordPhone.trim()) {
      setPasswordMsg("Nomor telepon wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passwordEmail.trim())) {
      setPasswordMsg("Masukkan alamat email yang valid.");
      return;
    }
    if (passwordValue.length < 8) {
      setPasswordMsg("Password minimal 8 karakter.");
      return;
    }
    if (role === "vendor" && !company.trim()) {
      setPasswordMsg("Nama perusahaan atau armada wajib diisi untuk vendor.");
      return;
    }
    if (role === "customer" && customerType === "company" && !company.trim()) {
      setPasswordMsg("Nama perusahaan wajib diisi untuk customer perusahaan.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: passwordName.trim(),
          phone: passwordPhone.trim(),
          email: passwordEmail.trim(),
          password: passwordValue,
          role,
          customerType: role === "customer" ? customerType : undefined,
          company: company.trim() || undefined,
          requestedCompanyName: role === "customer" && customerType === "company" ? company.trim() : undefined,
        }),
      });
      const json = await res.json() as { token?: string; message?: string; user?: { id: number; role: string; name: string; email: string } };
      if (!res.ok || !json.token || !json.user) {
        setPasswordMsg(json.message ?? "Registrasi password gagal.");
        return;
      }
      setPortalProfile({ customerId: json.user.id, role: json.user.role, name: json.user.name, email: json.user.email });
      setLocation("/onboarding");
    } catch {
      setPasswordMsg("Gagal menghubungi server.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const sendOtp = async () => {
    setErrorMsg("");
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      setErrorMsg(t("registerPage.errorInvalidPhone"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/wa-otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.message ?? t("registerPage.errorOtpSendFailed"));
        setIsLoading(false);
        return;
      }
      setNormalizedPhone(json.phone);
      setStep("otp");
      setCooldown(60);
    } catch {
      setErrorMsg(t("registerPage.errorServerError"));
    }
    setIsLoading(false);
  };

  const verifyOtp = async () => {
    setErrorMsg("");
    if (otp.length !== 6) {
      setErrorMsg(t("registerPage.errorOtpLength"));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/wa-otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: normalizedPhone, code: otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.message ?? t("registerPage.errorVerifyFailed"));
        setIsLoading(false);
        return;
      }
      setVerifyToken(json.verifyToken);

      // Auto-login if phone already registered
      const loginRes = await fetch(`${BASE}/api/portal/auth/wa-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ verifyToken: json.verifyToken }),
      });
      const loginJson = await loginRes.json();
      if (loginRes.ok && loginJson.token) {
        setPortalProfile({ customerId: loginJson.user.id, role: loginJson.user.role, name: loginJson.user.name, email: loginJson.user.email });
        await redirectExistingAccount(loginJson.user.role);
        return;
      }
      // Not registered → re-verify needed (token consumed by login attempt actually only on success)
      // If login returned notRegistered, token still valid (we didn't invalidate on failure path).
      setStep("profile");
    } catch {
      setErrorMsg(t("registerPage.errorServerError"));
    }
    setIsLoading(false);
  };

  const completeRegister = async () => {
    setErrorMsg("");
    if (!name.trim()) { setErrorMsg(t("registerPage.errorNameRequired")); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/wa-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifyToken, name, role,
          customerType: role === "customer" ? customerType : undefined,
          company: company || null,
          requestedCompanyName: role === "customer" && customerType === "company" ? company || null : undefined,
          email: email || null,
          // Only pass IDs that actually belong to services (jasa), not products (barang)
          serviceIds: serviceIds.filter(id => services.some(s => s.id === id)),
          rememberDays: rememberDevice ? REMEMBER_DAYS : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.token) {
        setErrorMsg(json.message ?? t("registerPage.errorRegisterFailed"));
        setIsLoading(false);
        return;
      }
      setPortalProfile({ customerId: json.user.id, role: json.user.role, name: json.user.name, email: json.user.email });
      if (rememberDevice && json.deviceToken) {
        saveTrustedDevice(json.user.phone ?? normalizedPhone, json.deviceToken);
      }
      // WA-registered users: force complete profile (KTP/alamat/dll) sebelum lanjut
      setLocation("/onboarding");
    } catch {
      setErrorMsg(t("registerPage.errorServerError"));
    }
    setIsLoading(false);
  };

  const toggleService = (id: number) => {
    setServiceIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);
  };

  const stepNumber = step === "phone" ? 1 : step === "otp" ? 2 : 3;
  const methodTitle = method === "whatsapp"
    ? t("registerPage.title")
    : method === "email"
      ? "Registrasi via Email OTP"
      : method === "google"
        ? "Registrasi via Google"
        : "Registrasi dengan Password";
  const methodDescription = method === "whatsapp"
    ? (step === "phone" ? t("registerPage.stepPhoneDesc") : step === "otp" ? t("registerPage.stepOtpDesc") : t("registerPage.stepProfileDesc"))
    : method === "email"
      ? (emailStep === "email" ? "Gunakan email terverifikasi untuk membuat akun." : "Masukkan kode OTP yang dikirim ke email Anda.")
      : method === "google"
        ? "Gunakan akun Google terverifikasi untuk membuat akun."
        : method === "password"
          ? "Buat akun dengan email dan password."
        : "Registrasi";
  const displayStep = method === "whatsapp" ? stepNumber : method === "email" && emailStep === "code" ? 2 : 1;
  const displayTotal = method === "whatsapp" ? 3 : method === "email" ? 2 : 1;

  const methodOptions: Array<{ id: RegistrationMethod; label: string; available: boolean }> = [
    { id: "email", label: "Email OTP", available: capabilities.emailOtp },
    { id: "google", label: "Google", available: capabilities.google },
    { id: "whatsapp", label: "WhatsApp", available: capabilities.whatsapp },
    { id: "password", label: "Password", available: capabilities.password },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-3 pb-6 border-b">
          <div className="flex items-center justify-between">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                <ArrowLeft className="h-4 w-4" /> {t("registerPage.backToLogin")}
              </Button>
            </Link>
            <div className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              Langkah {displayStep} dari {displayTotal}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white grid place-items-center">
              {method === "email" ? <Mail className="h-5 w-5" /> : method === "password" ? <LockKeyhole className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-xl">{methodTitle}</CardTitle>
              <CardDescription className="text-sm">
                {methodDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {returnTo && step === "phone" && (
            <Alert className="border-emerald-300 bg-emerald-50">
              <Check className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm">{t("registerPage.checkoutReturnMsg")}</AlertDescription>
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {step === "phone" && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">Pilih metode registrasi</p>
                <p className="text-xs text-muted-foreground">Metode login dapat ditambahkan kemudian ke akun yang sama.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {methodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!option.available}
                    onClick={() => selectMethod(option.id)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      method === option.id ? "border-emerald-500 bg-emerald-50" : "border-border"
                    } ${!option.available ? "cursor-not-allowed opacity-50" : "hover:border-emerald-300"}`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {!option.available && <span className="mt-1 block text-[11px] text-muted-foreground">Belum tersedia</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "phone" && method === "email" && (
            <div className="space-y-4">
              {emailMsg && <Alert variant={emailMsg.includes("berhasil") || emailMsg.includes("dikirim") ? "default" : "destructive"}><AlertCircle className="h-4 w-4" /><AlertDescription>{emailMsg}</AlertDescription></Alert>}
              {emailStep === "email" ? (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={(e) => e.key === "Enter" && sendEmailOtp()} />
                    </div>
                  </div>
                  <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={sendEmailOtp} disabled={emailLoading}>
                    <Mail className="h-4 w-4 mr-2" /> {emailLoading ? "Mengirim..." : "Kirim Kode OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Kode OTP dikirim ke <strong>{email}</strong>.</p>
                  <Input type="text" inputMode="numeric" maxLength={6} className="h-14 text-center text-2xl tracking-[0.5em] font-mono" value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && verifyEmailOtp()} />
                  <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={verifyEmailOtp} disabled={emailLoading}>
                    {emailLoading ? "Memverifikasi..." : "Verifikasi & Lanjutkan"}
                  </Button>
                  <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => { setEmailStep("email"); setEmailCode(""); setEmailMsg(""); }}>Ganti email / kirim ulang</button>
                </>
              )}
            </div>
          )}

          {step === "phone" && method === "google" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Gunakan akun Google terverifikasi. Profil baru akan dilanjutkan ke onboarding.</p>
              <Button className="w-full h-12" variant="outline" onClick={startGoogleRegistration}>
                Lanjutkan dengan Google
              </Button>
            </div>
          )}

          {step === "phone" && method === "password" && (
            <div className="space-y-4">
              {passwordMsg && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{passwordMsg}</AlertDescription></Alert>}
              <div className="space-y-2">
                <Label>Daftar sebagai</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`rounded-lg border-2 p-3 text-left transition ${role === "customer" ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-emerald-300"}`}
                  >
                    <User className={`h-4 w-4 mb-1 ${role === "customer" ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">Customer</p>
                    <p className="text-xs text-muted-foreground">Membeli atau meminta layanan</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("vendor")}
                    className={`rounded-lg border-2 p-3 text-left transition ${role === "vendor" ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-emerald-300"}`}
                  >
                    <Truck className={`h-4 w-4 mb-1 ${role === "vendor" ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">Vendor</p>
                    <p className="text-xs text-muted-foreground">Menawarkan jasa atau produk</p>
                  </button>
                </div>
              </div>
              <div className="space-y-2"><Label>Nama lengkap</Label><Input value={passwordName} onChange={(e) => setPasswordName(e.target.value)} placeholder="Budi Santoso" /></div>
              <div className="space-y-2">
                <Label>Nomor telepon (wajib)</Label>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={passwordPhone}
                  onChange={(e) => setPasswordPhone(e.target.value)}
                  placeholder="+62 812-3456-7890 atau +1 202-555-0123"
                />
                <p className="text-xs text-muted-foreground">Gunakan kode negara. Nomor ini hanya disimpan sebagai kontak, bukan untuk SMS OTP.</p>
              </div>
              {role === "customer" && (
                <div className="space-y-2">
                  <Label>Tipe customer</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["individual", "company"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCustomerType(value)}
                        className={`rounded-lg border p-2 text-left text-sm transition ${customerType === value ? "border-emerald-500 bg-emerald-50" : "border-border hover:border-emerald-300"}`}
                      >
                        <p className="font-medium">{value === "individual" ? "Perorangan" : "Perusahaan"}</p>
                        <p className="text-xs text-muted-foreground">{value === "individual" ? "Akun pribadi" : "Akun bisnis"}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(role === "vendor" || customerType === "company") && (
                <div className="space-y-2">
                  <Label>{role === "vendor" ? "Nama perusahaan / armada" : "Nama perusahaan"}</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={role === "vendor" ? "PT Mitra Logistik" : "PT Nama Perusahaan"} />
                </div>
              )}
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={passwordEmail} onChange={(e) => setPasswordEmail(e.target.value)} placeholder="you@company.com" /></div>
              <div className="space-y-2"><Label>Password</Label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" className="pl-10" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} placeholder="Minimal 8 karakter" /></div></div>
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={registerWithPassword} disabled={passwordLoading}>
                {passwordLoading ? "Mendaftarkan..." : "Daftar dengan Password"}
              </Button>
            </div>
          )}

          {step === "phone" && method === "whatsapp" && (
            <>
              <div className="space-y-2">
                <Label>{t("registerPage.phoneLabel")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder={t("registerPage.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12 text-base"
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("registerPage.otpHint")}</p>
              </div>
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={sendOtp} disabled={isLoading}>
                {isLoading ? t("registerPage.sending") : t("registerPage.sendOtp")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("registerPage.alreadyHaveAccount")} <Link href="/login" className="text-emerald-600 font-medium hover:underline">{t("registerPage.backToLogin")}</Link>
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">{t("registerPage.otpSentTo")}</p>
                <p className="font-semibold text-foreground">+{normalizedPhone}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("registerPage.otpLabel")}</Label>
                <Input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="······"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                />
              </div>
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={verifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? t("registerPage.verifying") : t("registerPage.verify")}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button variant="ghost" size="sm" onClick={() => { setStep("phone"); setOtp(""); setErrorMsg(""); }}>
                  <ArrowLeft className="h-3 w-3 mr-1" /> {t("registerPage.changeNumber")}
                </Button>
                <Button variant="ghost" size="sm" onClick={sendOtp} disabled={cooldown > 0 || isLoading}>
                  {cooldown > 0 ? `${t("registerPage.resendOtp")} (${cooldown}s)` : t("registerPage.resendOtp")}
                </Button>
              </div>
            </>
          )}

          {step === "profile" && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-foreground">{t("registerPage.phoneVerified")} <strong>+{normalizedPhone}</strong></span>
              </div>

              <div className="space-y-2">
                <Label>{t("registerPage.roleLabel")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`p-4 rounded-lg border-2 text-left transition ${role === "customer" ? "border-emerald-500 bg-emerald-50" : "border-border"}`}
                  >
                    <User className={`h-5 w-5 mb-2 ${role === "customer" ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">{t("registerPage.roleCustomer")}</p>
                    <p className="text-xs text-muted-foreground">{t("registerPage.roleCustomerDesc")}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("vendor")}
                    className={`p-4 rounded-lg border-2 text-left transition ${role === "vendor" ? "border-emerald-500 bg-emerald-50" : "border-border"}`}
                  >
                    <Truck className={`h-5 w-5 mb-2 ${role === "vendor" ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">{t("registerPage.roleVendor")}</p>
                    <p className="text-xs text-muted-foreground">{t("registerPage.roleVendorDesc")}</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("registerPage.fullNameLabel")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Budi Santoso" />
              </div>

              <div className="space-y-2">
                <Label>{role === "vendor" ? "Nama Perusahaan / Armada" : "Perusahaan (opsional)"}</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={role === "vendor" ? "PT Mitra Logistik" : "Acme Inc."} />
              </div>

              {role === "customer" && (
                <div className="space-y-2">
                  <Label>Tipe customer</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["individual", "company"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCustomerType(value)}
                        className={`rounded-lg border-2 p-3 text-left text-sm transition ${customerType === value ? "border-emerald-500 bg-emerald-50" : "border-border"}`}
                      >
                        <p className="font-semibold">{value === "individual" ? "Perorangan" : "Perusahaan"}</p>
                        <p className="text-xs text-muted-foreground">
                          {value === "individual" ? "Akun pribadi" : "Gunakan akses perusahaan"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("registerPage.emailLabel")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>

              {allItems.length > 0 && (
                <div className="space-y-2">
                  <Label>{role === "vendor" ? "Layanan yang Anda sediakan" : "Layanan yang diminati"}</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {allItems.map((item) => (
                      <label key={`${item.itemType}-${item.id}`} className="flex items-center gap-2 p-2 rounded hover:bg-emerald-50 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={serviceIds.includes(item.id)}
                          onChange={() => toggleService(item.id)}
                          className="rounded border-gray-300"
                        />
                        <span>{item.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{item.itemType}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">
                  Ingat perangkat ini selama <strong>{REMEMBER_DAYS} hari</strong>
                </span>
              </label>

              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={completeRegister} disabled={isLoading}>
                {isLoading ? t("registerPage.registering") : t("registerPage.completeRegistration")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
