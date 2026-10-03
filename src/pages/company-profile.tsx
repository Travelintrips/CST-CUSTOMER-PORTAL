import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { isAuthenticated, getAuthHeaders } from "@/lib/auth";
import { useGetPortalMe } from "@shared/api-client-react";
import {
  Building2, Mail, Phone, User, MapPin, Shield,
  Edit2, Save, X, Loader2, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CompanyProfile() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const authed = isAuthenticated();
  const headers = getAuthHeaders() as Record<string, string>;
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [membershipCompany, setMembershipCompany] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authed) setLocation("/login");
  }, [authed, setLocation]);

  const { data: profile, isLoading, refetch } = useGetPortalMe({
    query: { queryKey: ["getPortalMe"], enabled: authed },
    request: { headers, credentials: "include" },
  });

  const [form, setForm] = useState({ name: "", company: "", phone: "", address: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        name:    profile.name    ?? "",
        company: profile.company ?? "",
        phone:   profile.phone   ?? "",
        address: (profile as unknown as Record<string, unknown>).address as string ?? "",
      });
      setAvatarPreview((profile as unknown as Record<string, unknown>).avatarUrl as string ?? null);
    }
  }, [profile]);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    void fetch("/api/portal/organization", {
      headers,
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ company?: { name?: string | null } | null }>;
      })
      .then((data) => {
        if (!cancelled) setMembershipCompany(data?.company?.name ?? null);
      })
      .catch(() => {
        if (!cancelled) setMembershipCompany(null);
      });
    return () => { cancelled = true; };
  }, [authed]);

  async function handleSave() {
    setSaving(true);
    try {
      const r = await fetch("/api/portal/me", {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (r.ok) {
        toast({ title: "Profil berhasil disimpan" });
        setEditing(false);
        refetch();
      } else {
        toast({ title: "Gagal menyimpan", variant: "destructive" });
      }
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File terlalu besar (maks 5MB)", variant: "destructive" });
      return;
    }
    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/portal/me/avatar", {
        method: "POST",
        headers,
        credentials: "include",
        body: fd,
      });
      const data = await r.json();
      if (r.ok) {
        toast({ title: "Foto berhasil diperbarui" });
        setAvatarPreview(data.avatarUrl);
        refetch();
      } else {
        toast({ title: data.error ?? "Gagal mengunggah foto", variant: "destructive" });
        setAvatarPreview((profile as unknown as Record<string, unknown>)?.avatarUrl as string ?? null);
      }
    } catch {
      toast({ title: "Gagal mengunggah foto", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!authed) return null;

  const initials = (profile?.name ?? "?")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-8">
      <div className="container px-4 md:px-6 max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profil Perusahaan</h1>
            <p className="text-slate-500 mt-1">Kelola informasi perusahaan dan akun Anda</p>
          </div>
          {!editing ? (
            <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4" /> Edit Profil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="gap-2" onClick={() => {
                // Reset form to original profile values before closing edit mode
                if (profile) {
                  setForm({
                    name:    profile.name    ?? "",
                    company: profile.company ?? "",
                    phone:   profile.phone   ?? "",
                    address: (profile as unknown as Record<string, unknown>).address as string ?? "",
                  });
                  setAvatarPreview((profile as unknown as Record<string, unknown>).avatarUrl as string ?? null);
                }
                setEditing(false);
              }}>
                <X className="h-4 w-4" /> Batal
              </Button>
              <Button className="gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Avatar / Logo Section */}
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  {/* Avatar circle */}
                  <div className="relative flex-shrink-0">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-sky-100 flex items-center justify-center ring-4 ring-white shadow-md">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Logo perusahaan"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-sky-600">{initials}</span>
                      )}
                    </div>
                    {/* Upload button overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-60"
                      title="Ganti foto"
                    >
                      {uploadingAvatar
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Camera className="h-4 w-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Akun perusahaan</p>
                    <p className="font-semibold text-slate-800 text-lg">{profile?.company || profile?.name || "Perusahaan Anda"}</p>
                    <p className="text-sm text-slate-500">{profile?.email}</p>
                    {membershipCompany && (
                      <div className="mt-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                        <p className="text-xs font-medium text-slate-500">Membership / Afiliasi</p>
                        <p className="text-sm font-semibold text-sky-800">{membershipCompany}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Membership tidak mengubah kepemilikan akun atau nama perusahaan Anda.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Klik ikon kamera untuk mengganti logo perusahaan (JPG/PNG/WebP, maks 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-sky-600" /> Informasi Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Nama Kontak
                  </Label>
                  {editing ? (
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  ) : (
                    <p className="font-medium text-slate-800">{profile?.name || "—"}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Nama Perusahaan Pemilik Akun
                  </Label>
                  {editing ? (
                    <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  ) : (
                    <p className="font-medium text-slate-800">{profile?.company || "—"}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Label>
                  <p className="font-medium text-slate-800">{profile?.email}</p>
                  <p className="text-xs text-slate-400">Email tidak dapat diubah</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> No. Telepon / WhatsApp
                  </Label>
                  {editing ? (
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62..." />
                  ) : (
                    <p className="font-medium text-slate-800">{profile?.phone || "—"}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Alamat
                  </Label>
                  {editing ? (
                    <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Alamat perusahaan..." />
                  ) : (
                    <p className="font-medium text-slate-800">{(profile as Record<string, unknown> | undefined)?.address as string || "—"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-600" /> Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  Kelola password, verifikasi dua langkah, dan sesi aktif Anda.
                </p>
                <Link href="/account-security">
                  <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" /> Pengaturan Keamanan
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
