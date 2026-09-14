import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2, Plus, Copy, ExternalLink, ToggleLeft, ToggleRight, Trash2, Link2, X,
} from "lucide-react";
import { apiPost } from "./adminShared";
import { SERVICE_SCHEMAS } from "@/lib/vendorMiniFormSchemas";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type SchemaField = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date" | "boolean" | "file";
  required?: boolean;
  options?: string[];
  section?: "quotation" | "operational" | "both";
};

type MiniFormLink = {
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
  maxSubmissions: number | null;
  submissionCount?: number;
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

// ── MINI_FORM_SERVICE_META ─────────────────────────────────────────────────────

export const MINI_FORM_SERVICE_META: Record<string, { label: string; emoji: string }> = {
  trucking:                 { label: "Trucking",                  emoji: "🚛" },
  ocean_freight_lcl:        { label: "Ocean Freight LCL",         emoji: "🚢" },
  ocean_freight_fcl:        { label: "Ocean Freight FCL",         emoji: "📦" },
  air_freight:              { label: "Air Freight",               emoji: "✈️" },
  custom_clearance:         { label: "Custom Clearance",          emoji: "📋" },
  freight_forwarding:       { label: "Freight Forwarding",        emoji: "🌐" },
  warehousing:              { label: "Warehousing",               emoji: "🏭" },
  domestic_cargo:           { label: "Domestic Cargo",            emoji: "🚌" },
  vendor_product_template:  { label: "Product Template",          emoji: "📝" },
  customer_order_form:      { label: "Customer Order Form",       emoji: "🛒" },
  customer_inquiry:         { label: "Customer Inquiry",          emoji: "💬" },
  admin_internal:           { label: "Admin Internal Form",       emoji: "⚙️" },
};

// ── MiniFormTab ────────────────────────────────────────────────────────────────

export function MiniFormTab({ formTarget }: { formTarget: "vendor" | "customer" | "admin" }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [links, setLinks] = useState<MiniFormLink[]>([]);
  const [submissions, setSubmissions] = useState<MiniFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedLink, setSelectedLink] = useState<MiniFormLink | null>(null);

  // Create form state
  const [newServiceType, setNewServiceType] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newExpires, setNewExpires] = useState("");
  const [newMode, setNewMode] = useState<"rate_collection" | "operational_update">("rate_collection");
  const [newVendorName, setNewVendorName] = useState("");
  const [newMaxSubs, setNewMaxSubs] = useState("");

  const schemas: Record<string, { fields: SchemaField[] }> = (SERVICE_SCHEMAS ?? {}) as Record<string, { fields: SchemaField[] }>;

  const load = async () => {
    try {
      const [l, s] = await Promise.all([
        fetch(`/api/portal/admin/vendor-form/links?formTarget=${formTarget}`, { headers: getAuthHeaders() }).then(r => r.json()) as Promise<MiniFormLink[]>,
        fetch("/api/portal/admin/vendor-form/submissions", { headers: getAuthHeaders() }).then(r => r.json()) as Promise<MiniFormSubmission[]>,
      ]);
      setLinks(Array.isArray(l) ? l : []);
      setSubmissions(Array.isArray(s) ? s : []);
    } catch {
      toast({ title: t("adminMiniForm.loadError", "Gagal memuat data"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const previewFields = (() => {
    const sc = schemas[newServiceType];
    if (!sc) return [] as SchemaField[];
    return sc.fields.filter(f => {
      const sec = f.section ?? "quotation";
      if (newMode === "rate_collection") return sec === "quotation" || sec === "both";
      return sec === "operational" || sec === "both";
    });
  })();

  const handleCreate = async () => {
    if (!newServiceType) { toast({ title: t("adminMiniForm.selectServiceTypeFirst", "Pilih service type dulu"), variant: "destructive" }); return; }
    setCreating(true);
    try {
      await apiPost("/api/portal/admin/vendor-form/links", {
        serviceType: newServiceType,
        title: newTitle.trim() || undefined,
        notes: newNotes.trim() || undefined,
        expiresInDays: newExpires ? Number(newExpires) : undefined,
        mode: newMode,
        vendorName: newVendorName.trim() || undefined,
        maxSubmissions: newMaxSubs ? Number(newMaxSubs) : undefined,
        formTarget,
      });
      toast({ title: t("adminMiniForm.createSuccess", "Link berhasil dibuat") });
      setShowCreate(false);
      setNewServiceType(""); setNewTitle(""); setNewNotes(""); setNewExpires("");
      setNewMode("rate_collection"); setNewVendorName(""); setNewMaxSubs("");
      void load();
    } catch {
      toast({ title: t("adminMiniForm.createError", "Gagal membuat link"), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (link: MiniFormLink) => {
    try {
      const res = await fetch(`/api/portal/admin/vendor-form/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      if (!res.ok) throw new Error();
      void load();
    } catch {
      toast({ title: t("adminMiniForm.toggleError", "Gagal update status"), variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/portal/admin/vendor-form/links/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error();
      toast({ title: t("adminMiniForm.deleteSuccess", "Link dihapus") });
      if (selectedLink?.id === id) setSelectedLink(null);
      void load();
    } catch {
      toast({ title: t("adminMiniForm.deleteError", "Gagal hapus link"), variant: "destructive" });
    }
  };

  const formPath = formTarget === "customer" ? "customer-mini-form" : formTarget === "admin" ? "admin-mini-form" : "vendor-mini-form";

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/${formPath}/${token}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast({ title: t("adminMiniForm.linkCopied", "Link disalin ke clipboard") });
    });
  };

  const buildUrl = (token: string) => `${window.location.origin}/${formPath}/${token}`;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );
  }

  const linkSubs = selectedLink ? submissions.filter(s => s.linkId === selectedLink.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{links.length}</strong> {t("adminMiniForm.totalLink", "total link")}</span>
          <span><strong className="text-green-600">{links.filter(l => l.isActive).length}</strong> {t("adminMiniForm.active", "aktif")}</span>
          <span><strong className="text-indigo-500">{submissions.length}</strong> {t("adminMiniForm.submission", "submission")}</span>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          {t("adminMiniForm.createLinkBtn", "Buat Link Form")}
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Link2 className="h-12 w-12 opacity-20" />
          <p className="text-sm">{t("adminMiniForm.emptyState", "Belum ada link mini form.")}</p>
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("adminMiniForm.createFirstLink", "Buat Link Pertama")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map(link => {
            const meta = MINI_FORM_SERVICE_META[link.serviceType];
            const expired = link.expiresAt && new Date(link.expiresAt) < new Date();
            const isActive = link.isActive && !expired;
            const linkSubCount = submissions.filter(s => s.linkId === link.id).length;
            return (
              <div
                key={link.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
              >
                <div className="text-xl shrink-0">{meta?.emoji ?? "📄"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {link.title ?? `Form ${meta?.label ?? link.serviceType}`}
                    </span>
                    <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {isActive ? t("adminMiniForm.statusActive", "Aktif") : expired ? t("adminMiniForm.statusExpired", "Kadaluarsa") : t("adminMiniForm.statusInactive", "Nonaktif")}
                    </Badge>
                    {linkSubCount > 0 && (
                      <Badge variant="outline" className="text-[10px] shrink-0 text-indigo-600 border-indigo-300">
                        {linkSubCount} {t("adminMiniForm.submission", "submission")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                    {buildUrl(link.token)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={t("adminMiniForm.copyLink", "Salin link")}
                    onClick={() => copyLink(link.token)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <a href={buildUrl(link.token)} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={t("adminMiniForm.openForm", "Buka form")}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={link.isActive ? t("adminMiniForm.deactivate", "Nonaktifkan") : t("adminMiniForm.activate", "Aktifkan")}
                    onClick={() => void handleToggle(link)}
                  >
                    {link.isActive
                      ? <ToggleRight className="h-4 w-4 text-green-500" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title={t("adminMiniForm.delete", "Hapus")}
                    onClick={() => void handleDelete(link.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {submissions.filter(s => s.linkId === link.id).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setSelectedLink(selectedLink?.id === link.id ? null : link)}
                    >
                      {t("adminMiniForm.viewSubmissions", "Lihat Submission")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLink && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("adminMiniForm.submissionTitle", "Submission")} — {selectedLink.title ?? selectedLink.serviceType} ({linkSubs.length})
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLink(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {linkSubs.map(sub => (
              <div key={sub.id} className="border border-border rounded-lg p-3 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sub.vendorName ?? "—"}</span>
                    {sub.contactPerson && <span className="text-muted-foreground">· {sub.contactPerson}</span>}
                    {sub.contactPhone && <span className="text-muted-foreground">· {sub.contactPhone}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sub.submittedAt).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(sub.formData ?? {})
                    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs border-b border-border/50 py-1">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="font-medium text-right">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("adminMiniForm.createDialogTitle", "Buat Link Form Baru")}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4 py-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("adminMiniForm.serviceTypeLabel", "Service Type")} <span className="text-red-500">*</span></Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newServiceType}
                  onChange={e => setNewServiceType(e.target.value)}
                >
                  <option value="">{t("adminMiniForm.selectServiceType", "Pilih tipe layanan...")}</option>
                  {Object.entries(MINI_FORM_SERVICE_META)
                    .filter(([k]) => {
                      if (formTarget === "customer") return k.startsWith("customer_");
                      if (formTarget === "admin") return k.startsWith("admin_");
                      return !k.startsWith("customer_") && !k.startsWith("admin_");
                    })
                    .map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("adminMiniForm.formModeLabel", "Mode Form")} <span className="text-red-500">*</span></Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newMode}
                  onChange={e => setNewMode(e.target.value as "rate_collection" | "operational_update")}
                >
                  <option value="rate_collection">{t("adminMiniForm.modeRateCollection", "Rate Collection (penawaran harga)")}</option>
                  <option value="operational_update">{t("adminMiniForm.modeOperationalUpdate", "Operational Update (update data lapangan)")}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {newMode === "rate_collection"
                    ? t("adminMiniForm.modeRateCollectionDesc", "Vendor mengisi data penawaran/quotation.")
                    : t("adminMiniForm.modeOperationalUpdateDesc", "Vendor mengisi data operasional setelah order jalan.")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>{t("adminMiniForm.titleLabel", "Judul Form (opsional)")}</Label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t("adminMiniForm.titlePlaceholder", "Contoh: Penawaran Rate Trucking Q3 2025")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("adminMiniForm.vendorNameLabel", "Nama Vendor (opsional)")}</Label>
                <Input value={newVendorName} onChange={e => setNewVendorName(e.target.value)} placeholder={t("adminMiniForm.vendorNamePlaceholder", "Pre-fill nama vendor di form")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("adminMiniForm.instructionLabel", "Instruksi untuk Vendor")}</Label>
                <Textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={3} placeholder={t("adminMiniForm.instructionPlaceholder", "Instruksi khusus untuk vendor...")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("adminMiniForm.expiresLabel", "Kadaluarsa (hari)")}</Label>
                  <Input type="number" value={newExpires} onChange={e => setNewExpires(e.target.value)} placeholder={t("adminMiniForm.expiresPlaceholder", "Kosong = no limit")} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("adminMiniForm.maxSubLabel", "Max Submission")}</Label>
                  <Input type="number" value={newMaxSubs} onChange={e => setNewMaxSubs(e.target.value)} placeholder={t("adminMiniForm.maxSubPlaceholder", "Kosong = unlimited")} />
                </div>
              </div>
            </div>
            <div className="space-y-2 md:border-l md:pl-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("adminMiniForm.previewFieldsLabel", "Preview Field yang Akan Diisi")}
              </Label>
              {!newServiceType ? (
                <div className="text-sm text-muted-foreground italic py-8 text-center">
                  {t("adminMiniForm.previewEmpty", "Pilih service type untuk lihat field")}
                </div>
              ) : previewFields.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-8 text-center">
                  {t("adminMiniForm.previewNoFields", "Schema belum ter-load atau service type tidak punya field untuk mode ini")}
                </div>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                  {previewFields.map(f => (
                    <div key={f.key} className="flex items-start justify-between text-xs border-b border-border/40 py-1.5 gap-2">
                      <div className="flex-1">
                        <div className="font-medium">
                          {f.label}
                          {f.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {f.options && f.options.length > 0 && (
                          <div className="text-muted-foreground text-[10px] mt-0.5">
                            {f.options.slice(0, 4).join(" · ")}{f.options.length > 4 ? " · …" : ""}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {f.type}
                      </span>
                    </div>
                  ))}
                  <div className="text-[11px] text-muted-foreground pt-2">
                    {t("adminMiniForm.totalFields", "Total")}: {previewFields.length} {t("adminMiniForm.fieldUnit", "field")}
                    {previewFields.filter(f => f.required).length > 0 && (
                      <> · {previewFields.filter(f => f.required).length} {t("adminMiniForm.required", "wajib")}</>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel", "Batal")}</Button>
            <Button onClick={() => void handleCreate()} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {creating ? t("adminMiniForm.creating", "Membuat...") : t("adminMiniForm.createBtn", "Buat Link")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
