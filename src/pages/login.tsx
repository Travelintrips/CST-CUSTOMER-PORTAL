import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  setPortalProfile,
  persistAuthCookie,
  saveTrustedDevice, loadTrustedDevice, clearTrustedDevice, REMEMBER_DAYS,
  fetchPortalAuthBootstrap,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Mail, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/i18n/LanguageContext";
import { CUSTOMER_ASSETS } from "@/lib/staticAssets";

const IS_DEV = import.meta.env.DEV;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
type LoginMode = "password" | "otp" | "wa";

interface AuthCapabilities {
  emailOtp: boolean;
  google: boolean;
  whatsapp: boolean;
  password: boolean;
}

const CUSTOMER_RETURN_PREFIXES = [
  "/login", "/register", "/dashboard", "/vendor-dashboard", "/orders", "/admin",
  "/services", "/marketplace", "/jasa", "/vendor", "/freight-forwarding", "/pabean",
  "/custom-clearance", "/book", "/logistic-order-success", "/track", "/calculator",
  "/kalkulator-biaya-logistik", "/kalkulator-impor", "/order-produk", "/onboarding",
  "/pending-approval", "/account-security", "/portal-dokumen", "/portal-invoice",
  "/company-profile", "/profile", "/air-freight-booking", "/ocean-freight-booking",
  "/ocean-freight", "/service-cart",
];

function safeCustomerReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  const pathname = value.split(/[?#]/, 1)[0];
  if (pathname === "/" || CUSTOMER_RETURN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )) {
    return value;
  }
  return "/";
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  const { t } = useLanguage();
  const oauthError = new URLSearchParams(window.location.search).get("oauth_error");

  const [mode, setMode] = useState<LoginMode>("otp");
  const [capabilities, setCapabilities] = useState<AuthCapabilities>({
    emailOtp: true, google: true, whatsapp: true, password: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpMsg, setOtpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [waPhone, setWaPhone] = useState("");
  const [waStep, setWaStep] = useState<"phone" | "code">("phone");
  const [waCode, setWaCode] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waMsg, setWaMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [waRemember, setWaRemember] = useState(true);
  const [waTrustedLoading, setWaTrustedLoading] = useState(false);

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [devLoading, setDevLoading] = useState<string | null>(null);

  useEffect(() => {
    if (oauthError === "google_callback_failed") {
      setErrorMsg(t("login.googleCallbackFailed", "Login Google gagal saat memproses callback. Silakan coba lagi."));
    }
  }, [oauthError, t]);

  useEffect(() => {
    fetch(`${BASE}/api/portal/auth/capabilities`, { credentials: "include" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("capabilities unavailable")))
      .then((data: AuthCapabilities) => setCapabilities(data))
      .catch(() => setCapabilities((current) => ({
        ...current, emailOtp: false, google: false, whatsapp: false,
      })));
  }, []);

  const loginSchema = z.object({
    email: z.string().email({ message: t("login.email") }),
    password: z.string().min(1, { message: t("login.password") }),
  });
  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function redirectAfterLogin() {
    const requestedReturnTo = new URLSearchParams(window.location.search).get("returnTo");
    try {
      const bootstrap = await fetchPortalAuthBootstrap(
        requestedReturnTo ? safeCustomerReturnTo(requestedReturnTo) : null,
        { force: true },
      );
      if (bootstrap) {
        setLocation(bootstrap.allowedDestination);
        return;
      }
    } catch { /* fallback below */ }
    setLocation("/login");
  }

  // Cek trusted device saat tab WA dibuka
  useEffect(() => {
    if (mode !== "wa") return;
    const stored = loadTrustedDevice();
    if (!stored) return;

    setWaTrustedLoading(true);
    setWaPhone(stored.phone);

    fetch(`${BASE}/api/portal/auth/wa-trusted-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: stored.phone, deviceToken: stored.deviceToken }),
    })
      .then(async (res) => {
        const json = await res.json() as { token?: string; user?: { id: number; role: string; name: string; email: string }; expired?: boolean; message?: string };
        if (res.ok && json.token && json.user) {
          setPortalProfile({ customerId: json.user.id, role: json.user.role, name: json.user.name, email: json.user.email });
          redirectAfterLogin();
        } else {
          if (json.expired) clearTrustedDevice();
          setWaTrustedLoading(false);
        }
      })
      .catch(() => setWaTrustedLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function handleDevLogin(role: "customer" | "admin" | "vendor") {
    setDevLoading(role);
    setErrorMsg("");
    try {
      const res = await fetch("/api/portal/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) { setErrorMsg(t("login.devLoginFailed")); return; }
      const data = await res.json() as { token: string; profile: { id: number; name: string; email: string; role: string } };
      // C1: server sets HttpOnly cookie; do not write token to localStorage for new sessions
      setPortalProfile({ customerId: data.profile.id, role: data.profile.role, name: data.profile.name, email: data.profile.email });
      redirectAfterLogin();
    } catch { setErrorMsg(t("login.devLoginFailed")); }
    finally { setDevLoading(null); }
  }

  async function handleOtpRequest() {
    setOtpMsg(null);
    if (!otpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail.trim())) {
      setOtpMsg({ type: "err", text: t("login.invalidEmail") });
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail.trim() }),
      });
      const json = await res.json() as { message?: string; _dev_code?: string };
      if (!res.ok) { setOtpMsg({ type: "err", text: json.message ?? t("login.otpSendFailed") }); }
      else {
        setOtpStep("code");
        setOtpMsg({ type: "ok", text: json.message ?? t("login.otpSent") });
        if (json._dev_code) setOtpCode(json._dev_code);
      }
    } catch { setOtpMsg({ type: "err", text: t("login.serverError") }); }
    setOtpSending(false);
  }

  async function handleOtpVerify() {
    setOtpMsg(null);
    if (!otpCode.trim()) { setOtpMsg({ type: "err", text: t("login.enterOtp") }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: otpEmail.trim(), code: otpCode.trim() }),
      });
      const json = await res.json() as { token?: string; message?: string; user?: { id: number; role: string; name: string; email: string } };
      if (!res.ok || !json.token) { setOtpMsg({ type: "err", text: json.message ?? t("login.otpInvalid") }); }
      else {
        setPortalProfile({ customerId: json.user!.id, role: json.user!.role, name: json.user!.name, email: json.user!.email });
        redirectAfterLogin();
      }
    } catch { setOtpMsg({ type: "err", text: t("login.serverError") }); }
    setIsSubmitting(false);
  }

  async function handleWaSend() {
    setWaMsg(null);
    if (!waPhone.trim()) { setWaMsg({ type: "err", text: t("login.enterPhone") }); return; }
    setWaSending(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/wa-otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waPhone.trim() }),
      });
      const json = await res.json() as { message?: string; phone?: string; _dev_code?: string };
      if (!res.ok) { setWaMsg({ type: "err", text: json.message ?? t("login.otpSendFailed") }); }
      else {
        setWaStep("code");
        setWaMsg({ type: "ok", text: json.message ?? t("login.otpSentWa") });
        if (json._dev_code) setWaCode(json._dev_code);
      }
    } catch { setWaMsg({ type: "err", text: t("login.serverError") }); }
    setWaSending(false);
  }

  async function handleWaVerify() {
    setWaMsg(null);
    if (!waCode.trim()) { setWaMsg({ type: "err", text: t("login.enterOtp") }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/wa-otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waPhone.trim(), code: waCode.trim() }),
      });
      const json = await res.json() as { verifyToken?: string; message?: string };
      if (!res.ok || !json.verifyToken) {
        setWaMsg({ type: "err", text: json.message ?? t("login.otpInvalid") });
        setIsSubmitting(false);
        return;
      }

      const loginRes = await fetch(`${BASE}/api/portal/auth/wa-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifyToken: json.verifyToken,
          rememberDays: waRemember ? REMEMBER_DAYS : null,
        }),
      });
      const loginJson = await loginRes.json() as {
        token?: string;
        deviceToken?: string;
        message?: string;
        notRegistered?: boolean;
        user?: { id: number; role: string; name: string; email: string; phone?: string };
      };

      if (!loginRes.ok || !loginJson.token) {
        if (loginJson.notRegistered) {
          const encodedPhone = encodeURIComponent(waPhone.trim());
          setWaMsg({
            type: "err",
            text: `__NOT_REGISTERED__${encodedPhone}`,
          });
        } else {
          setWaMsg({ type: "err", text: loginJson.message ?? t("login.loginFailed", "Login gagal.") });
        }
      } else {
        setPortalProfile({
          customerId: loginJson.user!.id,
          role: loginJson.user!.role,
          name: loginJson.user!.name,
          email: loginJson.user!.email,
        });

        if (waRemember && loginJson.deviceToken) {
          const normalizedPhone = loginJson.user!.phone ?? waPhone.trim();
          saveTrustedDevice(normalizedPhone, loginJson.deviceToken);
        }

          redirectAfterLogin();
      }
    } catch { setWaMsg({ type: "err", text: t("login.serverError") }); }
    setIsSubmitting(false);
  }

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json() as { token?: string; message?: string; user?: { id: number; role: string; name: string; email: string } };
      if (!res.ok || !json.token) { setErrorMsg(json.message ?? t("login.emailOrPasswordWrong")); }
      else {
        setPortalProfile({ customerId: json.user!.id, role: json.user!.role, name: json.user!.name, email: json.user!.email });
        redirectAfterLogin();
      }
    } catch { setErrorMsg(t("login.serverErrorRetry")); }
    setIsSubmitting(false);
  };

  async function handleForgotPassword() {
    setForgotMsg(null);
    const email = form.getValues("email").trim();
    if (!email) { setForgotMsg({ type: "err", text: t("login.enterEmailFirst") }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setForgotMsg({ type: "err", text: t("login.invalidEmail") }); return; }
    setForgotLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, origin: window.location.origin + BASE }),
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) setForgotMsg({ type: "err", text: json.message ?? t("login.sendEmailFailed") });
      else setForgotMsg({ type: "ok", text: json.message ?? t("login.resetEmailSent") });
    } catch {
      setForgotMsg({ type: "err", text: t("login.serverErrorRetry") });
    }
    setForgotLoading(false);
  }

  function handleGoogleLogin() {
    if (!capabilities.google) {
      setErrorMsg("Login Google belum tersedia karena provider belum dikonfigurasi.");
      return;
    }
    setErrorMsg("");
    // Preserve returnTo so the portal callback can redirect correctly after OAuth.
    const rt = new URLSearchParams(window.location.search).get("returnTo");
    const returnTo = safeCustomerReturnTo(rt);
    if (returnTo !== "/") sessionStorage.setItem("oauth_return_to", returnTo);
    const query = new URLSearchParams({ returnTo, portal: "1" });
    // Use the API's Google OAuth flow for the public portal. Supabase's
    // external-provider exchange is unreliable for this production project.
    window.location.assign(`${BASE}/api/login/google?${query.toString()}`);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] grid md:grid-cols-2 bg-background">
      <div
        className="hidden md:flex flex-col justify-center p-12 lg:p-16 relative overflow-hidden"
      >
        {/* Bg: local fallback behind, Supabase Storage on top — fallback shows when storage not connected */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${CUSTOMER_ASSETS.warehouse}')` }} />
        {/* Gradient + vignette */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(120deg, rgba(15,23,42,0.72) 0%, rgba(14,165,233,0.55) 45%, rgba(14,165,233,0.32) 100%)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 80px 12px rgba(11,29,50,0.50)" }} />
        <div className="relative z-10" style={{ maxWidth: "480px" }}>
          <div className="inline-flex mb-10" style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: "18px", padding: "12px 16px", boxShadow: "0 12px 35px rgba(15,23,42,0.22)" }}>
            <img
              src={CUSTOMER_ASSETS.logo}
              alt="Logo"
              className="h-12 w-auto object-contain"
              style={{ maxWidth: "160px" }}
            />
          </div>
          <h1 className="font-display mb-6" style={{ fontWeight: 800, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.08, letterSpacing: "-0.04em", color: "#ffffff", textShadow: "0 6px 24px rgba(15,23,42,0.55)" }}>
            {t("login.sideTitle")}
          </h1>
          <p className="mb-10" style={{ fontSize: "clamp(17px, 1.6vw, 21px)", lineHeight: 1.6, maxWidth: "420px", color: "rgba(255,255,255,0.94)", textShadow: "0 3px 14px rgba(15,23,42,0.45)" }}>
            {t("login.sideDesc")}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: "#0F172A", border: "2px solid rgba(255,255,255,0.55)", boxShadow: "0 8px 20px rgba(15,23,42,0.25)" }}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", textShadow: "0 2px 10px rgba(15,23,42,0.45)" }}>{t("login.sideTrust")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md border-none shadow-none md:shadow-xl md:border-solid">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-display font-bold">{t("login.welcomeBack")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {returnTo && (
              <Alert className="mb-4 border-accent/40 bg-accent/5">
                <AlertCircle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-sm">{t("login.loginRequired")}</AlertDescription>
              </Alert>
            )}

            <div className="mb-5">
              <button type="button" onClick={handleGoogleLogin} disabled={!capabilities.google} className="flex items-center justify-center gap-3 w-full h-11 rounded-lg border border-border bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                <GoogleIcon />
                {capabilities.google ? `${t("login.signIn")} Google` : "Google (belum tersedia)"}
              </button>
            </div>
            {errorMsg && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="flex rounded-lg bg-muted p-1 mb-5">
              <button type="button" disabled={!capabilities.emailOtp} onClick={() => { setMode("otp"); setErrorMsg(""); setWaStep("phone"); setWaCode(""); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "otp" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-50`}>
                {t("login.tabEmailOtp")}
              </button>
              <button type="button" disabled={!capabilities.whatsapp} onClick={() => { setMode("wa"); setErrorMsg(""); setOtpStep("email"); setOtpCode(""); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "wa" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-50`}>
                {t("login.tabWa", "No HP / WA")}
              </button>
              <button type="button" onClick={() => { setMode("password"); setErrorMsg(""); setOtpStep("email"); setOtpCode(""); setWaStep("phone"); setWaCode(""); }} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "password" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t("login.password", "Password")}
              </button>
            </div>
            {mode === "otp" && (
              <div className="space-y-4">
                {otpMsg && (
                  <Alert variant={otpMsg.type === "err" ? "destructive" : "default"} className={otpMsg.type === "ok" ? "border-green-200 bg-green-50" : ""}>
                    {otpMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription className={otpMsg.type === "ok" ? "text-green-800" : ""}>{otpMsg.text}</AlertDescription>
                  </Alert>
                )}
                {otpStep === "email" ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("login.email")}</label>
                      <Input type="email" placeholder="you@company.com" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleOtpRequest()} />
                    </div>
                    <Button className="w-full h-11" onClick={handleOtpRequest} disabled={otpSending}>
                      <Mail className="h-4 w-4 mr-2" />
                      {otpSending ? t("registerPage.sending") : t("registerPage.sendOtp")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{t("registerPage.otpSentTo")} <strong>{otpEmail}</strong></p>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("registerPage.otpLabel")}</label>
                      <Input type="text" inputMode="numeric" maxLength={6} placeholder={t("registerPage.otpPlaceholder")} className="text-center text-2xl tracking-[0.5em] font-mono" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && handleOtpVerify()} />
                    </div>
                    <Button className="w-full h-11" onClick={handleOtpVerify} disabled={isSubmitting}>
                      {isSubmitting ? t("registerPage.verifying") : t("login.signIn")}
                    </Button>
                    <button type="button" onClick={() => { setOtpStep("email"); setOtpCode(""); setOtpMsg(null); }} className="w-full text-sm text-muted-foreground hover:text-foreground">
                      {t("registerPage.changeNumber")} / {t("registerPage.resendOtp")}
                    </button>
                  </>
                )}
              </div>
            )}

            {mode === "wa" && (
              <div className="space-y-4">
                {/* Auto-login loading state */}
                {waTrustedLoading && (
                  <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
                    <div className="h-7 w-7 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">{t("accountSecurity.loading")}</p>
                    <p className="text-xs text-slate-400">{t("accountSecurity.thisDevice")}</p>
                    <button
                      type="button"
                      onClick={() => { clearTrustedDevice(); setWaTrustedLoading(false); setWaPhone(""); }}
                      className="text-xs text-blue-500 hover:underline mt-1"
                    >
                      {t("login.useOtherPhone")}
                    </button>
                  </div>
                )}

                {!waTrustedLoading && (
                  <>
                    {waMsg && (() => {
                      if (waMsg.text.startsWith("__NOT_REGISTERED__")) {
                        const phone = decodeURIComponent(waMsg.text.slice("__NOT_REGISTERED__".length));
                        return (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {t("login.notRegistered")}{" "}
                              <a
                                href={`${BASE}/register?phone=${encodeURIComponent(phone)}`}
                                className="underline font-medium"
                                onClick={(e) => { e.preventDefault(); setLocation(`/register?phone=${encodeURIComponent(phone)}`); }}
                              >
                                {t("login.registerNow")}
                              </a>
                            </AlertDescription>
                          </Alert>
                        );
                      }
                      return (
                        <Alert variant={waMsg.type === "err" ? "destructive" : "default"} className={waMsg.type === "ok" ? "border-green-200 bg-green-50" : ""}>
                          {waMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                          <AlertDescription className={waMsg.type === "ok" ? "text-green-800" : ""}>{waMsg.text}</AlertDescription>
                        </Alert>
                      );
                    })()}

                    {waStep === "phone" ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("registerPage.phoneLabel")}</label>
                          <div className="flex gap-2 items-center">
                            <span className="flex items-center gap-1 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground shrink-0">
                              🇮🇩 +62
                            </span>
                            <Input
                              type="tel"
                              inputMode="numeric"
                              placeholder="812-3456-7890"
                              value={waPhone}
                              onChange={(e) => setWaPhone(e.target.value.replace(/[^\d\-\s]/g, ""))}
                              onKeyDown={(e) => e.key === "Enter" && handleWaSend()}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{t("login.phoneFormat")}</p>
                        </div>
                        <Button className="w-full h-11" onClick={handleWaSend} disabled={waSending}>
                          <Smartphone className="h-4 w-4 mr-2" />
                          {waSending ? t("registerPage.sending") : t("registerPage.sendOtp")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {t("login.otpSentToWaPrefix")} <strong>{waPhone}</strong>
                        </p>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t("login.otpLabel")}</label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="______"
                            className="text-center text-2xl tracking-[0.5em] font-mono"
                            value={waCode}
                            onChange={(e) => setWaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            onKeyDown={(e) => e.key === "Enter" && handleWaVerify()}
                          />
                        </div>

                        {/* Checkbox ingat perangkat */}
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={waRemember}
                            onChange={(e) => setWaRemember(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">
                            {t("registerPage.rememberDevice").replace("{days}", String(REMEMBER_DAYS))}
                          </span>
                        </label>

                        <Button className="w-full h-11" onClick={handleWaVerify} disabled={isSubmitting}>
                          {isSubmitting ? t("registerPage.verifying") : t("login.signIn")}
                        </Button>
                        <button
                          type="button"
                          onClick={() => { setWaStep("phone"); setWaCode(""); setWaMsg(null); }}
                          className="w-full text-sm text-muted-foreground hover:text-foreground"
                        >
                          {t("registerPage.changeNumber")}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {mode === "password" && (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login.email")}</FormLabel>
                        <FormControl><Input placeholder="you@company.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t("login.password")}</FormLabel>
                          <button type="button" onClick={handleForgotPassword} disabled={forgotLoading} className="text-sm font-medium text-accent hover:underline disabled:opacity-60">
                            {forgotLoading ? t("login.sending") : t("login.forgotPassword")}
                          </button>
                        </div>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {forgotMsg && (
                      <Alert variant={forgotMsg.type === "err" ? "destructive" : "default"} className={forgotMsg.type === "ok" ? "border-green-200 bg-green-50" : ""}>
                        {forgotMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className={forgotMsg.type === "ok" ? "text-green-800" : ""}>{forgotMsg.text}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                      {isSubmitting ? t("login.signingIn") : t("login.signIn")}
                    </Button>
                  </form>
                </Form>
              </>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("login.noAccount")}{" "}
              <Link href={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : "/register"} className="font-medium text-primary hover:underline">
                {t("login.createAccount")}
              </Link>
            </div>

            {IS_DEV && (
              <div className="mt-8 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {t("login.devLoginBanner")}
                </p>
                <div className="flex flex-col gap-2">
                  {(["customer", "admin", "vendor"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={devLoading !== null}
                      onClick={() => handleDevLogin(role)}
                      className="flex items-center justify-between rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                    >
                      <span>{t("login.devLoginAs").replace("{role}", role)}</span>
                      {devLoading === role && <span className="text-xs opacity-70">{t("common.loading", "Loading…")}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
