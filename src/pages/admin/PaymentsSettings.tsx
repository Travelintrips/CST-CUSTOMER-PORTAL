import { useState, useEffect } from "react";
import { isPortalAdmin } from "@/lib/auth";
import { resolveImageUrl } from "@/lib/utils";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Save, Loader2, Shield, CreditCard, CheckCircle2, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle,
} from "lucide-react";
import { apiPost } from "./adminShared";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type PaylabsForm = {
  sandboxMode: boolean;
  storeId: string;
  sandboxPublicKey: string;
  sandboxPrivateKey: string;
  sandboxMerchantId: string;
  prodPublicKey: string;
  prodPrivateKey: string;
  prodMerchantId: string;
};

type PaymentMethod = {
  code: string;
  label: string;
  description: string;
  isActive: boolean;
  iconEnabled: boolean;
  iconUrl: string;
};

// ── PaylabsKeyField ───────────────────────────────────────────────────────────

function PaylabsKeyField({ label, value, onChange, hint, saved }: { label: string; value: string; onChange: (v: string) => void; hint?: string; saved: string }) {
  const [show, setShow] = useState(false);
  const isSaved = value === saved;
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <textarea
          className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          value={isSaved && !show ? "" : value}
          placeholder={isSaved ? "(tersimpan — ketik baru untuk mengganti)" : "-----BEGIN ...-----\n...\n-----END ...-----"}
          onChange={(e) => onChange(e.target.value)}
        />
        {isSaved && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── PayLabsSettingTab ─────────────────────────────────────────────────────────

export function PayLabsSettingTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMethod, setSavingMethod] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [SAVED, setSAVED] = useState("");

  const [form, setForm] = useState<PaylabsForm>({
    sandboxMode: true,
    storeId: "",
    sandboxPublicKey: "",
    sandboxPrivateKey: "",
    sandboxMerchantId: "",
    prodPublicKey: "",
    prodPrivateKey: "",
    prodMerchantId: "",
  });

  function set<K extends keyof PaylabsForm>(key: K, value: PaylabsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMethod(code: string, key: keyof PaymentMethod, value: unknown) {
    setPaymentMethods((prev) => prev.map((m) => m.code === code ? { ...m, [key]: value } : m));
  }

  useEffect(() => {
    void (async () => {
      try {
        const [cfgRes, methodsRes] = await Promise.all([
          fetch("/api/payments/paylabs/config", { credentials: "include" }),
          fetch("/api/payments/paylabs/payment-methods", { credentials: "include" }),
        ]);
        if (cfgRes.ok) {
          const cfg = await cfgRes.json() as PaylabsForm & { _savedMarker?: string };
          setForm({
            sandboxMode: cfg.sandboxMode ?? true,
            storeId: cfg.storeId ?? "",
            sandboxPublicKey: cfg.sandboxPublicKey ?? "",
            sandboxPrivateKey: cfg.sandboxPrivateKey ?? "",
            sandboxMerchantId: cfg.sandboxMerchantId ?? "",
            prodPublicKey: cfg.prodPublicKey ?? "",
            prodPrivateKey: cfg.prodPrivateKey ?? "",
            prodMerchantId: cfg.prodMerchantId ?? "",
          });
          setSAVED(cfg._savedMarker ?? "__SAVED__");
        }
        if (methodsRes.ok) setPaymentMethods(await methodsRes.json() as PaymentMethod[]);
      } catch {
        toast({ title: t("adminPayments.loadError", "Gagal memuat konfigurasi Paylabs"), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const r = await fetch("/api/payments/paylabs/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error(t("adminPayments.saveFailedError", "Gagal menyimpan"));
      toast({ title: t("adminPayments.saved", "Tersimpan"), description: t("adminPayments.savedDesc", "Konfigurasi Paylabs berhasil disimpan.") });
    } catch {
      toast({ title: t("adminPayments.saveError", "Gagal menyimpan"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMethod(code: string, isActive: boolean) {
    const method = paymentMethods.find((m) => m.code === code);
    if (!method) return;
    updateMethod(code, "isActive", isActive);
    await fetch(`/api/payments/paylabs/payment-methods/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
        credentials: "include",
      body: JSON.stringify({ ...method, isActive }),
    }).catch(() => updateMethod(code, "isActive", !isActive));
  }

  async function handleSaveMethod() {
    if (!selectedCode) return;
    const method = paymentMethods.find((m) => m.code === selectedCode);
    if (!method) return;
    setSavingMethod(true);
    try {
      const r = await fetch(`/api/payments/paylabs/payment-methods/${selectedCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(method),
      });
      if (!r.ok) throw new Error();
      toast({ title: t("adminPayments.saved", "Tersimpan"), description: `${method.label} ${t("adminPayments.methodSavedSuffix", "berhasil disimpan.")}` });
      setSelectedCode(null);
    } catch {
      toast({ title: t("adminPayments.saveError", "Gagal menyimpan"), variant: "destructive" });
    } finally {
      setSavingMethod(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("adminPayments.loadingConfig", "Memuat konfigurasi…")}
      </div>
    );
  }

  const activeEnv = form.sandboxMode ? "sandbox" : "produksi";
  const selectedMethod = paymentMethods.find((m) => m.code === selectedCode) ?? null;

  if (selectedMethod) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button
          type="button"
          onClick={() => setSelectedCode(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {selectedMethod.label}
        </button>

        <div>
          <h2 className="text-xl font-semibold">{selectedMethod.label}</h2>
          <p className="text-sm text-muted-foreground">{selectedMethod.description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
            <Switch checked={selectedMethod.isActive} onCheckedChange={(v) => updateMethod(selectedMethod.code, "isActive", v)} />
            <p className="text-sm font-medium">{t("adminPayments.activateDeactivate", "Aktifkan atau Nonaktifkan")} {selectedMethod.label}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("adminPayments.titleLabel", "Judul")}</Label>
            <Input value={selectedMethod.label} onChange={(e) => updateMethod(selectedMethod.code, "label", e.target.value)} />
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
            <Switch checked={selectedMethod.iconEnabled} onCheckedChange={(v) => updateMethod(selectedMethod.code, "iconEnabled", v)} />
            <p className="text-sm font-medium">{t("adminPayments.enableIcon", "Aktifkan Ikon")}</p>
          </div>

          {selectedMethod.iconEnabled && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("adminPayments.iconUrlLabel", "Custom URL Ikon")}</Label>
              <Input value={selectedMethod.iconUrl} onChange={(e) => updateMethod(selectedMethod.code, "iconUrl", e.target.value)} placeholder="https://example.com/icon.png" />
              <p className="text-xs text-muted-foreground">{t("adminPayments.iconUrlHint", "URL harus berekstensi .png")}</p>
              {selectedMethod.iconUrl && (
                <img src={resolveImageUrl(selectedMethod.iconUrl) ?? selectedMethod.iconUrl} alt="preview" className="h-8 w-8 object-contain rounded border mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{t("adminPayments.descriptionLabel", "Deskripsi")}</Label>
            <Textarea value={selectedMethod.description} onChange={(e) => updateMethod(selectedMethod.code, "description", e.target.value)} placeholder={t("adminPayments.descriptionPlaceholder", "Deskripsi yang dilihat pengguna saat checkout.")} rows={3} />
            <p className="text-xs text-muted-foreground">{t("adminPayments.descriptionHint", "Ini mengontrol deskripsi yang dilihat pengguna saat checkout.")}</p>
          </div>
        </div>

        <div className="flex justify-end pb-6">
          <Button onClick={handleSaveMethod} disabled={savingMethod} className="gap-2 bg-teal-500 hover:bg-teal-600 text-white">
            {savingMethod ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingMethod ? t("adminPayments.saving", "Menyimpan…") : t("adminPayments.saveChanges", "Simpan Perubahan")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Paylabs Setting
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("adminPayments.paylabsSubtitle", "Konfigurasi kredensial dan mode lingkungan Paylabs.")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" /> Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
            <Switch checked={form.sandboxMode} onCheckedChange={(v) => set("sandboxMode", v)} className="mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t("adminPayments.sandboxModeLabel", "Sandbox Mode (Testing)")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("adminPayments.sandboxModeHint", "Aktifkan untuk SIT/sandbox. Nonaktifkan untuk produksi.")}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium ${form.sandboxMode ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {form.sandboxMode ? t("adminPayments.sandboxActive", "Mode sandbox aktif — transaksi hanya simulasi.") : t("adminPayments.productionActive", "Mode produksi aktif — transaksi nyata diproses.")}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Store ID <span className="text-muted-foreground font-normal">{t("adminPayments.optional", "(opsional)")}</span></Label>
            <Input value={form.storeId} onChange={(e) => set("storeId", e.target.value)} placeholder="(opsional)" />
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 ${activeEnv === "sandbox" ? "border-amber-300" : "border-border"}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base flex items-center gap-2 ${activeEnv === "sandbox" ? "text-amber-800" : ""}`}>
            <Shield className={`h-4 w-4 ${activeEnv === "sandbox" ? "text-amber-500" : "text-muted-foreground"}`} />
            {t("adminPayments.sandboxCredentials", "Kredensial Sandbox (SIT)")}
            <span className="text-xs font-normal text-muted-foreground ml-1">— env: PAYLABS_MERCHANT_ID_SANDBOX / PAYLABS_PUBLIC_KEY_SANDBOX / PAYLABS_PRIVATE_KEY_SANDBOX</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaylabsKeyField label="Paylabs Public Key (Sandbox)" value={form.sandboxPublicKey} onChange={(v) => set("sandboxPublicKey", v)} hint="Public key dari dashboard Paylabs SIT. Env: PAYLABS_PUBLIC_KEY_SANDBOX" saved={SAVED} />
          <PaylabsKeyField label="Merchant Private Key (Sandbox)" value={form.sandboxPrivateKey} onChange={(v) => set("sandboxPrivateKey", v)} hint="Private key merchant untuk environment SIT. Env: PAYLABS_PRIVATE_KEY_SANDBOX" saved={SAVED} />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Merchant ID</Label>
            <Input value={form.sandboxMerchantId} onChange={(e) => set("sandboxMerchantId", e.target.value)} placeholder="contoh: 010728" />
            <p className="text-xs text-muted-foreground">Merchant ID untuk environment SIT. Env: PAYLABS_MERCHANT_ID_SANDBOX</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 ${activeEnv === "produksi" ? "border-emerald-300" : "border-border"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-base flex items-center gap-2 ${activeEnv === "produksi" ? "text-emerald-800" : ""}`}>
              <CreditCard className={`h-4 w-4 ${activeEnv === "produksi" ? "text-emerald-600" : "text-muted-foreground"}`} />
              {t("adminPayments.productionCredentials", "Kredensial Produksi")}
              <span className="text-xs font-normal text-muted-foreground ml-1">— env: PAYLABS_MERCHANT_ID / PAYLABS_PUBLIC_KEY / PAYLABS_PRIVATE_KEY</span>
            </CardTitle>
            {activeEnv === "produksi" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{t("adminPayments.activeLabel", "Aktif")}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaylabsKeyField label="Paylabs Public Key" value={form.prodPublicKey} onChange={(v) => set("prodPublicKey", v)} hint="Public key dari dashboard Paylabs produksi. Env: PAYLABS_PUBLIC_KEY" saved={SAVED} />
          <PaylabsKeyField label="Merchant Private Key" value={form.prodPrivateKey} onChange={(v) => set("prodPrivateKey", v)} hint="Private key merchant untuk produksi. Jangan bagikan ke siapapun. Env: PAYLABS_PRIVATE_KEY" saved={SAVED} />
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Merchant ID</Label>
            <Input value={form.prodMerchantId} onChange={(e) => set("prodMerchantId", e.target.value)} placeholder="contoh: 010613" />
            <p className="text-xs text-muted-foreground">Merchant ID untuk environment produksi. Env: PAYLABS_MERCHANT_ID</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" /> {t("adminPayments.paymentMethodsTitle", "Metode Pembayaran")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paymentMethods.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t("adminPayments.emptyMethods", "Belum ada metode pembayaran.")}</div>
          ) : (
            <div className="divide-y">
              {paymentMethods.map((method) => (
                <div key={method.code} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded border bg-white flex items-center justify-center overflow-hidden">
                    {method.iconEnabled && method.iconUrl ? (
                      <img src={resolveImageUrl(method.iconUrl) ?? method.iconUrl} alt={method.label} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{method.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{method.description}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${method.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border"}`}>
                    {method.isActive ? t("adminPayments.activeLabel", "Aktif") : t("adminPayments.inactiveLabel", "Nonaktif")}
                  </span>
                  {!method.isActive && (
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 flex-shrink-0 border-teal-400 text-teal-600 hover:bg-teal-50" onClick={() => handleToggleMethod(method.code, true)}>
                      {t("adminPayments.activateBtn", "Aktifkan")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs h-7 px-3 gap-1 flex-shrink-0" onClick={() => setSelectedCode(method.code)}>
                    {t("adminPayments.manageBtn", "Kelola")} <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? t("adminPayments.saving", "Menyimpan…") : t("adminPayments.saveChanges", "Simpan Perubahan")}
        </Button>
      </div>
    </div>
  );
}

// ── ClaimAdminTab ─────────────────────────────────────────────────────────────

export function ClaimAdminTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const alreadyAdmin = isPortalAdmin();

  async function handleClaim() {
    setLoading(true);
    try {
      await apiPost<{ role: string }>("/api/portal/admin/claim", { key });
      toast({ title: t("adminPayments.claimSuccess", "Berhasil! Anda sekarang adalah admin."), description: t("adminPayments.claimSuccessDesc", "Halaman akan dimuat ulang.") });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast({ title: t("adminPayments.claimInvalidKey", "Kunci admin tidak valid"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (alreadyAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">{t("adminPayments.alreadyAdmin", "Anda sudah menjadi Admin")}</p>
        <p className="text-muted-foreground text-sm">{t("adminPayments.alreadyAdminDesc", "Semua fitur admin telah aktif.")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("adminPayments.claimDesc", "Masukkan kunci rahasia admin untuk mengaktifkan akses admin pada akun Anda. Kunci ini diatur oleh administrator sistem.")}
      </p>
      <div className="space-y-1.5">
        <Label>{t("adminPayments.adminKeyLabel", "Kunci Admin")}</Label>
        <Input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t("adminPayments.adminKeyPlaceholder", "Masukkan kunci admin...")}
          onKeyDown={(e) => { if (e.key === "Enter") void handleClaim(); }}
        />
      </div>
      <Button onClick={handleClaim} disabled={loading || !key} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        {loading ? t("adminPayments.verifying", "Memverifikasi...") : t("adminPayments.activateAdmin", "Aktifkan Admin")}
      </Button>
    </div>
  );
}
