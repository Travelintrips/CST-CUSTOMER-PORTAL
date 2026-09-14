import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { isAuthenticated, removeAuthToken, loadTrustedDevice, clearTrustedDevice } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Laptop, Shield, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type TrustedDevice = {
  id: number;
  createdAt: string;
  expiresAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400_000));
}

export default function AccountSecurity() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();

  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | "all" | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!authed) { setLocation("/login"); return; }
    fetchDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function fetchDevices() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/trusted-devices`, {
        credentials: "include",
      });
      if (res.status === 401) { removeAuthToken(); setLocation("/login"); return; }
      if (!res.ok) { setMsg({ type: "err", text: t("accountSecurity.errorLoadFailed") }); return; }
      const data = await res.json() as TrustedDevice[];
      setDevices(Array.isArray(data) ? data : []);
    } catch {
      setMsg({ type: "err", text: t("accountSecurity.errorLoadFailed") });
    }
    setLoading(false);
  }

  async function revokeDevice(id: number) {
    setRevoking(id);
    setMsg(null);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/trusted-devices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) { setMsg({ type: "err", text: json.message ?? t("accountSecurity.errorRevokeFailed") }); return; }

      // Jika device ini adalah perangkat lokal, hapus dari localStorage juga
      const local = loadTrustedDevice();
      if (local) {
        // Clear local storage when user deletes their only remaining device
        const remaining = devices.filter((d) => d.id !== id);
        if (remaining.length === 0) clearTrustedDevice();
      }

      setDevices((prev) => prev.filter((d) => d.id !== id));
      setMsg({ type: "ok", text: json.message ?? t("accountSecurity.successRevoked") });
    } catch {
      setMsg({ type: "err", text: t("accountSecurity.errorServerError") });
    }
    setRevoking(null);
  }

  async function revokeAll() {
    setRevoking("all");
    setMsg(null);
    try {
      const res = await fetch(`${BASE}/api/portal/auth/trusted-devices`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json() as { message?: string };
      if (!res.ok) { setMsg({ type: "err", text: json.message ?? t("accountSecurity.errorRevokeAllFailed") }); return; }
      clearTrustedDevice();
      setDevices([]);
      setMsg({ type: "ok", text: json.message ?? t("accountSecurity.successAllRevoked") });
    } catch {
      setMsg({ type: "err", text: t("accountSecurity.errorServerError") });
    }
    setRevoking(null);
  }

  const hasLocalDevice = !!loadTrustedDevice();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <div className="container max-w-2xl px-4 md:px-6">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" /> {t("accountSecurity.backToDashboard")}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{t("accountSecurity.title")}</h1>
              <p className="text-muted-foreground text-sm">{t("accountSecurity.description")}</p>
            </div>
          </div>
        </div>

        {msg && (
          <Alert
            variant={msg.type === "err" ? "destructive" : "default"}
            className={`mb-4 ${msg.type === "ok" ? "border-green-200 bg-green-50" : ""}`}
          >
            {msg.type === "ok"
              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
              : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription className={msg.type === "ok" ? "text-green-800" : ""}>{msg.text}</AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-base">{t("accountSecurity.trustedDevices")}</CardTitle>
              <CardDescription>
                {loading
                  ? t("accountSecurity.loading")
                  : devices.length === 0
                  ? t("accountSecurity.noDevices")
                  : t("accountSecurity.deviceCount").replace("{count}", String(devices.length))}
              </CardDescription>
            </div>
            {devices.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                onClick={revokeAll}
                disabled={revoking !== null}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {revoking === "all" ? t("accountSecurity.revoking") : t("accountSecurity.revokeAll")}
              </Button>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-10">
                <Laptop className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {t("accountSecurity.noDevicesStored")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("accountSecurity.rememberDeviceHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device, idx) => {
                  // Assume server returns devices sorted newest-first (createdAt DESC)
                  // so idx === 0 is the most recently added device (most likely current)
                  const isCurrentDevice = hasLocalDevice && idx === 0;
                  const days = daysLeft(device.expiresAt);
                  const isExpiringSoon = days <= 7;

                  return (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isCurrentDevice
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/50 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${isCurrentDevice ? "bg-primary/10" : "bg-gray-100"}`}>
                          <Laptop className={`h-4 w-4 ${isCurrentDevice ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {t("accountSecurity.deviceLabel").replace("{index}", String(idx + 1))}
                            </p>
                            {isCurrentDevice && (
                              <Badge className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
                                {t("accountSecurity.thisDevice")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("accountSecurity.addedAt").replace("{date}", formatDate(device.createdAt))}
                          </p>
                          <div className={`flex items-center gap-1 text-xs mt-0.5 ${isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
                            <Clock className="h-3 w-3" />
                            {days === 0
                              ? t("accountSecurity.expiresToday")
                              : t("accountSecurity.expiresInDays").replace("{days}", String(days))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                        onClick={() => revokeDevice(device.id)}
                        disabled={revoking !== null}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {revoking === device.id ? t("accountSecurity.revoking") : t("accountSecurity.revoke")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p className="font-medium mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            {t("accountSecurity.securityInfoTitle")}
          </p>
          <p>{t("accountSecurity.securityInfoDesc")}</p>
        </div>

      </div>
    </div>
  );
}
