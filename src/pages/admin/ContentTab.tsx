import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { COMPANY_CONFIG } from "@/config/company";
import { resolveImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Save, Loader2, Image as ImageIcon, Info, CheckCircle, Users, ArrowUpRight, Mail, Settings, BarChart2, AlertCircle,
} from "lucide-react";
import {
  apiGet, apiPut, ContentMap, CMS_EDIT_LOCALES, ImageUploader, ContentSection,
} from "./adminShared";

export function ContentTab() {
  const { toast } = useToast();
  const [locale, setLocale] = useState("id-ID");
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState<ContentMap>({});

  useEffect(() => {
    setLoading(true);
    setChanged({});
    void (async () => {
      try {
        const data = await apiGet<ContentMap>(`/api/portal/content?locale=${encodeURIComponent(locale)}`);
        setContent(data);
      } catch {
        toast({ title: "Gagal memuat konten", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);

  function set(key: string, value: string) {
    setChanged((prev) => ({ ...prev, [key]: value }));
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function field(key: string) { return content[key] ?? ""; }

  async function handleSave() {
    if (Object.keys(changed).length === 0) return;
    setSaving(true);
    try {
      await apiPut(`/api/portal/admin/content?locale=${encodeURIComponent(locale)}`, changed);
      setChanged({});
      toast({ title: "Konten berhasil disimpan", description: "Perubahan akan segera tampil di website." });
    } catch (err) {
      toast({ title: "Gagal menyimpan", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const changedCount = Object.keys(changed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <Label className="text-sm font-medium shrink-0">Bahasa yang diedit</Label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {CMS_EDIT_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Perubahan hanya berlaku untuk bahasa ini.</p>
      </div>

      {changedCount > 0 && (
        <div className="sticky top-6 z-30 bg-slate-950 text-slate-50 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[0_12px_30px_rgba(0,0,0,0.15)] border border-slate-800/60 ring-1 ring-amber-500/20 animate-in slide-in-from-top-4 fade-in duration-300 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">{changedCount} perubahan belum disimpan</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Pastikan untuk menyimpan sebelum berpindah tab.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto gap-2 h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.5} />}
            {saving ? "Menyimpan..." : "Simpan Sekarang"}
          </Button>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <ContentSection title="Hero / Halaman Utama" icon={ImageIcon} description="Gambar background, teks utama, dan tombol CTA di bagian paling atas" defaultOpen>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gambar Background Hero</Label>
          <p className="text-xs text-muted-foreground">Gambar fullscreen yang tampil di belakang teks hero. Ideal: lebar 1920px, tinggi 1080px.</p>
          <ImageUploader currentUrl={field("hero_bg") || null} onUpload={(url) => set("hero_bg", url)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Badge / Tagline Kecil</Label>
            <Input value={field("hero_tagline")} onChange={(e) => set("hero_tagline", e.target.value)} placeholder="cth: Platform Logistik #1 Indonesia" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Teks Tombol CTA</Label>
            <Input value={field("hero_cta")} onChange={(e) => set("hero_cta", e.target.value)} placeholder="cth: Mulai Sekarang" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Judul Hero (Headline Utama)</Label>
          <Textarea value={field("hero_title")} onChange={(e) => set("hero_title", e.target.value)} rows={2} placeholder="cth: Kelola Pengiriman Global Anda dengan Mudah" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Subjudul / Deskripsi Hero</Label>
          <Textarea value={field("hero_subtitle")} onChange={(e) => set("hero_subtitle", e.target.value)} rows={3} placeholder="cth: Platform B2B terpercaya untuk manajemen logistik dan pengiriman internasional..." />
        </div>
      </ContentSection>

      {/* ── STATISTIK ── */}
      <ContentSection title="Statistik Angka" icon={BarChart2} description="4 angka statistik yang tampil di bawah hero (negara, keandalan, pengiriman, support)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { vKey: "stat_countries_value", lKey: "stat_countries_label", vDefault: "150+", lDefault: "Negara Tujuan" },
            { vKey: "stat_security_value",  lKey: "stat_security_label",  vDefault: "99.9%", lDefault: "On-Time Delivery" },
            { vKey: "stat_shipments_value", lKey: "stat_shipments_label", vDefault: "10.000+", lDefault: "Pengiriman" },
            { vKey: "stat_support_value",   lKey: "stat_support_label",   vDefault: "24/7", lDefault: "Customer Support" },
          ].map(({ vKey, lKey, vDefault, lDefault }) => (
            <div key={vKey} className="border rounded-lg p-3 space-y-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Angka</Label>
                <Input value={field(vKey)} onChange={(e) => set(vKey, e.target.value)} placeholder={vDefault} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input value={field(lKey)} onChange={(e) => set(lKey, e.target.value)} placeholder={lDefault} />
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* ── TENTANG KAMI ── */}
      <ContentSection title="Tentang Kami" icon={Info} description="Seksi tentang perusahaan beserta dua foto pendukung">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Badge Label</Label>
            <Input value={field("about.label")} onChange={(e) => set("about.label", e.target.value)} placeholder="Tentang Kami" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Judul Seksi</Label>
            <Input value={field("about.title")} onChange={(e) => set("about.title", e.target.value)} placeholder="Mitra Logistik Terpercaya Anda" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Deskripsi</Label>
          <Textarea value={field("about.description")} onChange={(e) => set("about.description", e.target.value)} rows={4} placeholder="Deskripsi tentang perusahaan..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Poin Keunggulan (satu per baris)</Label>
          {["about.point1","about.point2","about.point3","about.point4","about.point5"].map((k, i) => (
            <Input key={k} value={field(k)} onChange={(e) => set(k, e.target.value)} placeholder={`Poin ${i+1}...`} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Foto About 1</Label>
            <ImageUploader currentUrl={field("about_img1") || null} onUpload={(url) => set("about_img1", url)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Foto About 2</Label>
            <ImageUploader currentUrl={field("about_img2") || null} onUpload={(url) => set("about_img2", url)} />
          </div>
        </div>
      </ContentSection>

      {/* ── MENGAPA PILIH KAMI ── */}
      <ContentSection title="Mengapa Pilih Kami" icon={CheckCircle} description="6 kartu keunggulan yang tampil di seksi 'Why Choose Us'">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Badge Label</Label>
            <Input value={field("why.label")} onChange={(e) => set("why.label", e.target.value)} placeholder="Mengapa Pilih Kami?" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Judul Seksi</Label>
            <Input value={field("why.title")} onChange={(e) => set("why.title", e.target.value)} placeholder="Solusi Logistik Terlengkap" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Deskripsi</Label>
          <Textarea value={field("why.description")} onChange={(e) => set("why.description", e.target.value)} rows={2} placeholder="Kami hadir dengan layanan..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map((n) => (
            <div key={n} className="border rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Kartu {n}</p>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Judul</Label>
                <Input value={field(`why.card${n}Title`)} onChange={(e) => set(`why.card${n}Title`, e.target.value)} placeholder={`Judul kartu ${n}`} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Deskripsi</Label>
                <Textarea value={field(`why.card${n}Desc`)} onChange={(e) => set(`why.card${n}Desc`, e.target.value)} rows={2} placeholder="Deskripsi singkat..." />
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* ── TESTIMONI ── */}
      <ContentSection title="Testimoni / Ulasan Pelanggan" icon={Users} description="3 ulasan pelanggan lengkap dengan foto, nama, jabatan, dan teks ulasan">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Badge Label</Label>
            <Input value={field("testimonials.label")} onChange={(e) => set("testimonials.label", e.target.value)} placeholder="Apa Kata Mereka" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Judul Seksi</Label>
            <Input value={field("testimonials.title")} onChange={(e) => set("testimonials.title", e.target.value)} placeholder="Dipercaya Ribuan Bisnis" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Deskripsi</Label>
          <Textarea value={field("testimonials.desc")} onChange={(e) => set("testimonials.desc", e.target.value)} rows={2} />
        </div>
        <div className="space-y-4">
          {[
            { n: "t1", label: "Testimoni 1" },
            { n: "t2", label: "Testimoni 2" },
            { n: "t3", label: "Testimoni 3" },
          ].map(({ n, label }) => (
            <div key={n} className="border rounded-xl p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-semibold text-primary">{label}</p>
              <div className="flex gap-4">
                <div className="shrink-0 w-28 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Foto Profil</Label>
                  <div className="relative">
                    <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-border bg-muted">
                      {field(`testimonials.${n}Photo`) ? (
                        <img src={resolveImageUrl(field(`testimonials.${n}Photo`)) ?? field(`testimonials.${n}Photo`)} alt={field(`testimonials.${n}Name`) || label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  </div>
                  <ImageUploader currentUrl={field(`testimonials.${n}Photo`) || null} onUpload={(url) => set(`testimonials.${n}Photo`, url)} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nama</Label>
                      <Input value={field(`testimonials.${n}Name`)} onChange={(e) => set(`testimonials.${n}Name`, e.target.value)} placeholder="Nama pelanggan" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Jabatan / Perusahaan</Label>
                      <Input value={field(`testimonials.${n}Role`)} onChange={(e) => set(`testimonials.${n}Role`, e.target.value)} placeholder="CEO, PT. Maju Jaya" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Teks Ulasan</Label>
                    <Textarea value={field(`testimonials.${n}Text`)} onChange={(e) => set(`testimonials.${n}Text`, e.target.value)} rows={3} placeholder="Ulasan dari pelanggan..." />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* ── CTA SECTION ── */}
      <ContentSection title="CTA / Ajakan Bertindak" icon={ArrowUpRight} description="Seksi ajakan bertindak di bagian bawah halaman">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Judul CTA</Label>
            <Textarea value={field("cta.title")} onChange={(e) => set("cta.title", e.target.value)} rows={2} placeholder="Siap Memulai Perjalanan Logistik Anda?" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Deskripsi CTA</Label>
            <Textarea value={field("cta.description")} onChange={(e) => set("cta.description", e.target.value)} rows={3} placeholder="Bergabunglah dengan ribuan bisnis yang telah mempercayai..." />
          </div>
        </div>
      </ContentSection>

      {/* ── KONTAK & ALAMAT ── */}
      <ContentSection title="Kontak & Alamat" icon={Mail} description="Informasi kontak, nomor telepon, email, dan alamat kantor">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Badge Label</Label>
            <Input value={field("contact.label")} onChange={(e) => set("contact.label", e.target.value)} placeholder="Hubungi Kami" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Judul Seksi</Label>
            <Input value={field("contact.title")} onChange={(e) => set("contact.title", e.target.value)} placeholder="Kami Siap Membantu" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Deskripsi Kontak</Label>
          <Textarea value={field("contact.description")} onChange={(e) => set("contact.description", e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Nomor Telepon / WhatsApp</Label>
            <Input value={field("contact_phone")} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+62 21 1234 5678" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" value={field("contact_email")} onChange={(e) => set("contact_email", e.target.value)} placeholder="info@cstlogistic.co.id" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="border rounded-lg p-3 space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Label Kantor</Label>
              <Input value={field("address_tangerang_label")} onChange={(e) => set("address_tangerang_label", e.target.value)} placeholder="Kantor Tangerang" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Alamat Kantor</Label>
              <Textarea value={field("address_tangerang")} onChange={(e) => set("address_tangerang", e.target.value)} rows={4} placeholder={"GEDUNG SPORT CENTER\nSport Center Soekarno Hatta\nJl. C3 No. 831 RT 001 RW 010..."} />
            </div>
          </div>
        </div>
      </ContentSection>

      {/* ── FOOTER ── */}
      <ContentSection title="Footer" icon={Settings} description="Tagline dan teks yang tampil di bagian paling bawah website">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Tagline Footer</Label>
          <Input value={field("footer_tagline")} onChange={(e) => set("footer_tagline", e.target.value)} placeholder="cth: Menghubungkan Bisnis Anda ke Seluruh Dunia" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Judul Label Mitra</Label>
          <Input value={field("partners_label")} onChange={(e) => set("partners_label", e.target.value)} placeholder="Mitra Terpercaya" />
        </div>
      </ContentSection>

      {/* Save button at bottom */}
      <div className="pt-2 pb-4">
        <Button
          onClick={handleSave}
          disabled={saving || changedCount === 0}
          className="gap-2 w-full sm:w-auto"
          size="lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Menyimpan..." : `Simpan Perubahan${changedCount > 0 ? ` (${changedCount})` : ""}`}
        </Button>
      </div>
    </div>
  );
}
