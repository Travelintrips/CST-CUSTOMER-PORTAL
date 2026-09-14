import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2, Search, Eye, Layers, Link2, Copy, ExternalLink, ToggleLeft, ToggleRight, Trash2,
  AlertCircle, FileText, PackageCheck, Info, ChevronRight, CheckCircle,
} from "lucide-react";
import { inCodeTemplates } from "@shared/product-templates";
import type { ProductTemplate } from "@shared/product-templates";

// ── Constants ─────────────────────────────────────────────────────────────────

const PORTAL_COMMODITY_EMOJIS: Record<string, string> = {
  coal: "⛏️", iron_steel: "🔩", coffee: "☕", electronics: "💻",
  palm_oil: "🌴", nickel: "⚙️", copper: "🔶", rice: "🌾",
  sugar: "🍬", rubber: "🧤", cocoa: "🍫", timber: "🪵",
  fertilizer: "🌱", cement: "🏗️", textile: "🧵", medical_device: "💊",
  general: "📦",
};

const FIELD_TYPE_LABELS_PORTAL: Record<string, string> = {
  text: "Teks", number: "Angka", select: "Pilihan", textarea: "Teks Panjang", date: "Tanggal",
};

// ── Types ─────────────────────────────────────────────────────────────────────

type TemplateMiniFormLink = {
  id: number;
  token: string;
  serviceType: string;
  title: string | null;
  notes: string | null;
  adminNotes: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  vendorName: string | null;
};

type MiniFormSubmission = {
  id: number;
  linkId: number | null;
  serviceType: string;
  vendorName: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  formData: Record<string, unknown>;
  submittedAt: string;
};

// ── PortalTemplateDetailDialog ────────────────────────────────────────────────

function PortalTemplateDetailDialog({
  template, open, onOpenChange,
}: { template: ProductTemplate | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  const [section, setSection] = useState<"fields" | "docs" | "checklist" | "packaging">("fields");
  if (!template) return null;
  const emoji = PORTAL_COMMODITY_EMOJIS[template.category] ?? "📦";
  const reqDocs = template.requiredDocuments.filter(d => d.required);
  const optDocs = template.requiredDocuments.filter(d => !d.required);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="text-2xl">{emoji}</span>
            <div>
              <span>{template.label}</span>
              <p className="text-xs font-normal text-muted-foreground font-mono mt-0.5">{template.category} · v{template.version}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1.5 flex-wrap">
          {(["fields", "docs", "checklist", "packaging"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                section === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-background text-muted-foreground border-border hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              {s === "fields" ? `📋 ${template.customFields.length} Custom Fields` :
               s === "docs" ? `📎 ${template.requiredDocuments.length} ${t("adminTemplates.dokumen", "Dokumen")}` :
               s === "checklist" ? `✅ ${template.checklist.length} ${t("adminTemplates.checklist", "Checklist")}` :
               `📦 ${t("adminTemplates.pengemasan", "Pengemasan")}`}
            </button>
          ))}
        </div>

        <div className="space-y-3 mt-2">
          {section === "fields" && (
            <>
              {template.customFields.length === 0
                ? <p className="text-sm text-muted-foreground italic">{t("adminTemplates.noCustomField", "Tidak ada custom field")}</p>
                : template.customFields.map(f => (
                  <div key={f.key} className={`border rounded-lg p-3 ${f.required ? "border-indigo-200 bg-indigo-50/30" : "border-border"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm">{f.label}</span>
                          {f.required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">{t("adminTemplates.wajib", "WAJIB")}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">key: {f.key}</p>
                        {f.options && f.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {f.options.map(o => <span key={o} className="text-xs bg-muted px-1.5 py-0.5 rounded">{o}</span>)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {FIELD_TYPE_LABELS_PORTAL[f.type] ?? f.type}
                      </span>
                    </div>
                  </div>
                ))
              }
              {template.conditionalRules.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1"><Info className="h-3.5 w-3.5" /> {t("adminTemplates.aturanKondisional", "Aturan Kondisional")}</p>
                  {template.conditionalRules.map((r, i) => (
                    <p key={i} className="text-xs text-amber-700">
                      Jika <span className="font-mono bg-amber-100 px-1 rounded">{r.fieldKey}</span> = <span className="font-mono bg-amber-100 px-1 rounded">"{r.condition.value}"</span> → tampilkan: {r.show.join(", ")}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {section === "docs" && (
            <>
              {reqDocs.length > 0 && (
                <><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("adminTemplates.dokumenWajib", "Dokumen Wajib")}</p>
                {reqDocs.map(d => (
                  <div key={d.key} className="flex items-center gap-3 border border-red-200 bg-red-50/30 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">key: {d.key}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 shrink-0">{t("adminTemplates.wajib", "WAJIB")}</span>
                  </div>
                ))}</>
              )}
              {optDocs.length > 0 && (
                <><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-1">{t("adminTemplates.opsional", "Opsional")}</p>
                {optDocs.map(d => (
                  <div key={d.key} className="flex items-center gap-3 border border-border rounded-lg p-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{d.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">key: {d.key}</p>
                    </div>
                  </div>
                ))}</>
              )}
              {template.requiredDocuments.length === 0 && <p className="text-sm text-muted-foreground italic">{t("adminTemplates.noDokumen", "Tidak ada dokumen")}</p>}
            </>
          )}

          {section === "checklist" && (
            <>
              {template.checklist.length === 0
                ? <p className="text-sm text-muted-foreground italic">{t("adminTemplates.noChecklist", "Tidak ada checklist")}</p>
                : template.checklist.map(c => (
                  <div key={c.key} className="flex items-center gap-3 border border-border rounded-lg p-3">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 shrink-0" />
                    <div>
                      <p className="text-sm">{c.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">key: {c.key}</p>
                    </div>
                  </div>
                ))
              }
            </>
          )}

          {section === "packaging" && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">{t("adminTemplates.instruksiPengemasan", "Instruksi Pengemasan & Pengiriman")}</p>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{template.packagingInstructions}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── PortalProductTemplateEngine ───────────────────────────────────────────────

export function PortalProductTemplateEngine() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProductTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkTemplate, setLinkTemplate] = useState<ProductTemplate | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkCreating, setLinkCreating] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkNotes, setLinkNotes] = useState("");
  const [linkExpires, setLinkExpires] = useState("7");
  const [linkCopied, setLinkCopied] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [links, setLinks] = useState<TemplateMiniFormLink[]>([]);
  const [submissions, setSubmissions] = useState<MiniFormSubmission[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const allTemplates = Object.values(inCodeTemplates);
  const filtered = allTemplates.filter(tmpl => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return tmpl.label.toLowerCase().includes(q) || tmpl.category.toLowerCase().includes(q);
  });

  const loadLinks = async () => {
    try {
      const [l, s] = await Promise.all([
        fetch("/api/portal/admin/vendor-form/links?formTarget=vendor", { headers: getAuthHeaders(), credentials: "include" }).then(r => r.json()) as Promise<TemplateMiniFormLink[]>,
        fetch("/api/portal/admin/vendor-form/submissions", { headers: getAuthHeaders(), credentials: "include" }).then(r => r.json()) as Promise<MiniFormSubmission[]>,
      ]);
      setLinks(l.filter(lk => typeof lk.adminNotes === "string" && /productCategory:\w+/.test(lk.adminNotes)));
      setSubmissions(s);
    } catch {
      /* silent */
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => { void loadLinks(); }, []);

  function openLinkDialog(e: React.MouseEvent, tmpl: ProductTemplate) {
    e.stopPropagation();
    setLinkTemplate(tmpl);
    setLinkTitle(`Form Template — ${tmpl.label}`);
    setLinkNotes("");
    setLinkExpires("7");
    setCreatedToken(null);
    setLinkCopied(false);
    setLinkDialogOpen(true);
  }

  async function handleCreateLink() {
    if (!linkTemplate) return;
    setLinkCreating(true);
    try {
      const res = await fetch("/api/portal/admin/vendor-form/links", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          serviceType: "vendor_product_template",
          title: linkTitle.trim() || `Form Template — ${linkTemplate.label}`,
          notes: linkNotes.trim() || undefined,
          adminNotes: `productCategory:${linkTemplate.category}`,
          expiresInDays: linkExpires ? Number(linkExpires) : undefined,
          mode: "rate_collection",
          formTarget: "vendor",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { token: string };
      setCreatedToken(data.token);
      toast({ title: t("adminTemplates.linkBerhasilDibuat", "Link berhasil dibuat") });
      void loadLinks();
    } catch {
      toast({ title: t("adminTemplates.gagalBuatLink", "Gagal membuat link"), variant: "destructive" });
    } finally {
      setLinkCreating(false);
    }
  }

  function copyCreatedLink() {
    if (!createdToken) return;
    const url = `${window.location.origin}/vendor-mini-form/${createdToken}`;
    void navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  function copyLink(token: string, id: number) {
    const url = `${window.location.origin}/vendor-mini-form/${token}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function handleToggleLink(link: TemplateMiniFormLink) {
    try {
      const res = await fetch(`/api/portal/admin/vendor-form/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      if (!res.ok) throw new Error();
      void loadLinks();
    } catch {
      toast({ title: t("adminTemplates.gagalUpdateStatus", "Gagal update status"), variant: "destructive" });
    }
  }

  async function handleDeleteLink(id: number) {
    try {
      const res = await fetch(`/api/portal/admin/vendor-form/links/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() }, credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: t("adminTemplates.linkDihapus", "Link dihapus") });
      void loadLinks();
    } catch {
      toast({ title: t("adminTemplates.gagalHapusLink", "Gagal hapus link"), variant: "destructive" });
    }
  }

  function getCategoryFromAdminNotes(adminNotes: string | null): string | null {
    if (!adminNotes) return null;
    const m = /productCategory:(\w+)/.exec(adminNotes);
    return m ? m[1] : null;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">{t("adminTemplates.engineTitle", "Product Template Engine")}</h3>
            <p className="text-xs text-indigo-100 mt-0.5">{t("adminTemplates.engineSubtitle", "Template komoditas untuk form vendor — custom fields, dokumen, checklist, dan instruksi pengemasan per jenis barang.")}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t("adminTemplates.statKomoditas", "Komoditas"), value: allTemplates.length },
            { label: t("adminTemplates.statCustomFields", "Custom Fields"), value: allTemplates.reduce((s, tmpl) => s + tmpl.customFields.length, 0) },
            { label: t("adminTemplates.statDokTerkonfigurasi", "Dok Terkonfigurasi"), value: allTemplates.reduce((s, tmpl) => s + tmpl.requiredDocuments.length, 0) },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-indigo-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder={t("adminTemplates.cariKomoditas", "Cari komoditas...")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(tmpl => {
          const emoji = PORTAL_COMMODITY_EMOJIS[tmpl.category] ?? "📦";
          const reqDocs = tmpl.requiredDocuments.filter(d => d.required).length;
          return (
            <div key={tmpl.category} className="border border-border bg-card rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group">
              <button className="w-full text-left" onClick={() => { setSelected(tmpl); setDialogOpen(true); }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-lg shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground group-hover:text-indigo-700 transition-colors">{tmpl.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tmpl.category}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-indigo-500 shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-muted/50 rounded-lg p-1.5"><p className="text-sm font-bold text-indigo-600">{tmpl.customFields.length}</p><p className="text-[10px] text-muted-foreground">{t("adminTemplates.fields", "Fields")}</p></div>
                  <div className="bg-muted/50 rounded-lg p-1.5"><p className={`text-sm font-bold ${reqDocs > 0 ? "text-red-500" : "text-muted-foreground"}`}>{reqDocs}</p><p className="text-[10px] text-muted-foreground">{t("adminTemplates.dokWajib", "Dok Wajib")}</p></div>
                  <div className="bg-muted/50 rounded-lg p-1.5"><p className="text-sm font-bold text-emerald-600">{tmpl.checklist.length}</p><p className="text-[10px] text-muted-foreground">{t("adminTemplates.checklist", "Checklist")}</p></div>
                </div>
                {tmpl.requiredDocuments.filter(d => d.required).slice(0, 1).map(d => (
                  <div key={d.key} className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3 text-red-400 shrink-0" />
                    <span className="truncate">{d.label}</span>
                  </div>
                ))}
                {reqDocs > 1 && <p className="text-xs text-muted-foreground mt-1">+{reqDocs - 1} {t("adminTemplates.dokumenWajibLainnya", "dokumen wajib lainnya")}</p>}
              </button>

              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => { setSelected(tmpl); setDialogOpen(true); }}>
                  <Eye className="h-3 w-3" /> {t("adminTemplates.detail", "Detail")}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={e => openLinkDialog(e, tmpl)}>
                  <Link2 className="h-3 w-3" /> {t("adminTemplates.buatLink", "Buat Link")}
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-12 text-muted-foreground gap-2">
            <Layers className="h-8 w-8 opacity-20" />
            <p className="text-sm">{t("adminTemplates.noResults", "Tidak ada hasil untuk pencarian ini")}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Link2 className="h-4 w-4 text-indigo-500" />
            {t("adminTemplates.formLinkTitle", "Form Link dari Template")}
            {links.length > 0 && <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{links.length}</span>}
          </h3>
          <span className="text-xs text-muted-foreground">
            {links.filter(l => l.isActive).length} {t("adminTemplates.aktifExpired", "aktif · expired")} ({links.filter(l => l.expiresAt && new Date(l.expiresAt) < new Date()).length} expired)
          </span>
        </div>

        {linksLoading ? (
          <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2 rounded-xl border border-dashed border-border">
            <Link2 className="h-7 w-7 opacity-20" />
            <p className="text-sm">{t("adminTemplates.noFormLink", "Belum ada form link dari template.")}</p>
            <p className="text-xs">{t("adminTemplates.noFormLinkHint", "Klik \"Buat Link\" pada kartu komoditas di atas.")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map(link => {
              const cat = getCategoryFromAdminNotes(link.adminNotes);
              const tmpl = cat ? inCodeTemplates[cat] : null;
              const emoji = cat ? (PORTAL_COMMODITY_EMOJIS[cat] ?? "📦") : "📦";
              const expired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
              const isActive = link.isActive && !expired;
              const subCount = submissions.filter(s => s.linkId === link.id).length;
              return (
                <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
                  <div className="text-xl shrink-0">{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{link.title ?? (tmpl ? `Form Template — ${tmpl.label}` : t("adminTemplates.formVendor", "Form Vendor"))}</span>
                      <Badge variant={isActive ? "default" : "secondary"} className={`text-[10px] shrink-0 ${isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}`}>
                        {isActive ? t("adminTemplates.aktif", "Aktif") : expired ? t("adminTemplates.expired", "Expired") : t("adminTemplates.nonaktif", "Nonaktif")}
                      </Badge>
                      {subCount > 0 && <Badge variant="outline" className="text-[10px] shrink-0 text-indigo-600 border-indigo-300">{subCount} submission</Badge>}
                      {tmpl && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tmpl.label}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{`${window.location.origin}/vendor-mini-form/${link.token}`}</p>
                    {link.expiresAt && (
                      <p className={`text-[10px] mt-0.5 ${expired ? "text-red-500" : "text-muted-foreground"}`}>
                        {expired ? t("adminTemplates.expired", "Expired") : t("adminTemplates.kadaluarsa", "Kadaluarsa")}: {new Date(link.expiresAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={t("adminTemplates.salinLink", "Salin link")} onClick={() => copyLink(link.token, link.id)}>
                      {copiedId === link.id ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <a href={`${window.location.origin}/vendor-mini-form/${link.token}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={t("adminTemplates.bukaForm", "Buka form")}><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={link.isActive ? t("adminTemplates.nonaktifkan", "Nonaktifkan") : t("adminTemplates.aktifkan", "Aktifkan")} onClick={() => void handleToggleLink(link)}>
                      {link.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title={t("adminTemplates.hapus", "Hapus")} onClick={() => void handleDeleteLink(link.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PortalTemplateDetailDialog template={selected} open={dialogOpen} onOpenChange={setDialogOpen} />

      <Dialog open={linkDialogOpen} onOpenChange={v => { setLinkDialogOpen(v); if (!v) setCreatedToken(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{linkTemplate ? (PORTAL_COMMODITY_EMOJIS[linkTemplate.category] ?? "📦") : "📦"}</span>
              {t("adminTemplates.buatFormLinkTitle", "Buat Form Link")} — {linkTemplate?.label}
            </DialogTitle>
          </DialogHeader>

          {createdToken ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700 mb-1">{t("adminTemplates.linkBerhasilDibuatBanner", "Link berhasil dibuat!")}</p>
                <p className="text-xs text-emerald-600">{t("adminTemplates.salinKirimVendor", "Salin dan kirim ke vendor")}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs break-all text-muted-foreground">
                {`${window.location.origin}/vendor-mini-form/${createdToken}`}
              </div>
              <Button className="w-full gap-2" onClick={copyCreatedLink}>
                <Copy className="h-4 w-4" />
                {linkCopied ? t("adminTemplates.tersalin", "Tersalin!") : t("adminTemplates.salinLink", "Salin Link")}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setLinkDialogOpen(false); setCreatedToken(null); }}>{t("common.close", "Tutup")}</Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label>{t("adminTemplates.judulForm", "Judul Form")}</Label>
                  <Input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder={`Form Template — ${linkTemplate?.label ?? ""}`} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("adminTemplates.instruksiVendor", "Instruksi untuk Vendor (opsional)")}</Label>
                  <Textarea value={linkNotes} onChange={e => setLinkNotes(e.target.value)} rows={2} placeholder={t("adminTemplates.instruksiKhusus", "Instruksi khusus...")} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("adminTemplates.kadaluarsaHari", "Kadaluarsa (hari)")}</Label>
                  <Input type="number" value={linkExpires} onChange={e => setLinkExpires(e.target.value)} placeholder={t("adminTemplates.kosongNoLimit", "Kosong = no limit")} />
                </div>
                {linkTemplate && (
                  <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs space-y-1">
                    <p className="font-medium text-indigo-700">{t("adminTemplates.templateDisertakan", "Template akan disertakan:")}</p>
                    <p className="text-indigo-600">{linkTemplate.customFields.length} custom field · {linkTemplate.requiredDocuments.filter(d => d.required).length} {t("adminTemplates.dokWajib", "dok wajib")} · {linkTemplate.checklist.length} checklist</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>{t("common.cancel", "Batal")}</Button>
                <Button onClick={() => void handleCreateLink()} disabled={linkCreating}>
                  {linkCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  {linkCreating ? t("adminTemplates.membuat", "Membuat...") : t("adminTemplates.buatLink", "Buat Link")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
