import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { UI_TIMING } from "@/config/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Two modes:
  // 1. "token" — custom flow: ?token=XXX&email=YYY  (for portal_customers accounts)
  // 2. "supabase" — Supabase Auth PASSWORD_RECOVERY event (for Supabase-native accounts)
  const [mode, setMode] = useState<"token" | "supabase" | "detecting">("detecting");
  const [tokenFromUrl, setTokenFromUrl] = useState("");
  const [emailFromUrl, setEmailFromUrl] = useState("");
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (token && email) {
      // Custom token flow
      setTokenFromUrl(decodeURIComponent(token));
      setEmailFromUrl(decodeURIComponent(email));
      setMode("token");
      return;
    }

    // Fall back to Supabase Auth flow
    setMode("supabase");
    if (!supabase) return;

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) setSupabaseReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSupabaseReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (password !== confirm) { setError("Konfirmasi password tidak cocok."); return; }

    setLoading(true);

    if (mode === "token") {
      // Custom portal_customers flow
      try {
        const res = await fetch(`${BASE}/api/portal/auth/reset-password-with-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: emailFromUrl, token: tokenFromUrl, password }),
        });
        const json = await res.json() as { ok?: boolean; message?: string };
        if (!res.ok) { setError(json.message ?? "Link tidak valid atau sudah kadaluarsa."); }
        else {
          setSuccess(true);
          setTimeout(() => setLocation("/login"), UI_TIMING.RESET_PASSWORD_REDIRECT_MS);
        }
      } catch {
        setError("Gagal menghubungi server. Coba lagi.");
      }
    } else {
      // Supabase Auth flow
      if (!supabase) { setError("Layanan autentikasi tidak tersedia."); setLoading(false); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); }
      else {
        setSuccess(true);
        await supabase.auth.signOut();
        setTimeout(() => setLocation("/login"), UI_TIMING.RESET_PASSWORD_REDIRECT_MS);
      }
    }
    setLoading(false);
  }

  const isReady = mode === "token"
    ? (!!tokenFromUrl && !!emailFromUrl)
    : (mode === "supabase" && supabaseReady);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Buat Password Baru</CardTitle>
          <CardDescription>
            {mode === "token" && emailFromUrl
              ? `Akun: ${emailFromUrl}`
              : "Masukkan password baru Anda di bawah ini."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password berhasil diubah. Silakan login kembali.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                Anda akan diarahkan ke halaman login...
              </p>
              <Button className="w-full" onClick={() => setLocation("/login")}>
                Ke Halaman Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "detecting" && (
                <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>
              )}

              {mode === "supabase" && !supabaseReady && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Menunggu sesi reset password... Pastikan Anda membuka link dari email.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isReady || loading || mode === "detecting"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-destructive">Minimal 8 karakter</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showCf ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={!isReady || loading || mode === "detecting"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-destructive">Password tidak cocok</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={!isReady || loading || mode === "detecting"}
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ingat password?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="font-medium text-accent hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
