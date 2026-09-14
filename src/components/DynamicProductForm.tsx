import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ClipboardList, Package, Wrench, StickyNote, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { ProductTemplate, DynamicFormValues } from "@shared/product-templates";
import { isFieldVisible } from "@shared/product-templates";
import { useLanguage } from "@/i18n/LanguageContext";

export type { DynamicFormValues };

interface Props {
  template: ProductTemplate;
  values: DynamicFormValues;
  onChange: (next: DynamicFormValues) => void;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
    </div>
  );
}

export function DynamicProductForm({ template, values, onChange }: Props) {
  const { t } = useLanguage();
  const [packagingOpen, setPackagingOpen] = useState(false);

  function setCustomField(key: string, val: string | number | boolean) {
    const next = { ...values, customFieldValues: { ...values.customFieldValues, [key]: val } };
    if (val !== "" && val !== null && val !== undefined) {
      next.conditionalFlags = { ...next.conditionalFlags, [key]: val };
    }
    onChange(next);
  }

  function setDocRef(key: string, label: string, reference: string) {
    const docs = values.uploadedDocuments.filter((d) => d.key !== key);
    if (reference.trim()) docs.push({ key, label, reference: reference.trim() });
    onChange({ ...values, uploadedDocuments: docs });
  }

  function toggleChecklist(key: string, checked: boolean) {
    onChange({ ...values, checklistStatus: { ...values.checklistStatus, [key]: checked } });
  }

  function setPackagingNotes(v: string) {
    onChange({ ...values, packagingNotes: v });
  }

  const getDocRef = (key: string) =>
    values.uploadedDocuments.find((d) => d.key === key)?.reference ?? "";

  return (
    <div className="space-y-5">

      {/* ── Custom Fields ── */}
      <div className="border rounded-xl p-4 bg-card">
        <SectionHeader icon={<Package className="w-3.5 h-3.5" />} title={t("tmpl.customFields", "Field Khusus Komoditas")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {template.customFields.map((field) => {
            if (!isFieldVisible(field.key, template, values)) return null;
            const strVal = String(values.customFieldValues[field.key] ?? "");
            return (
              <div key={field.key} className={`space-y-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                <Label className="text-xs">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                  {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
                </Label>
                {field.type === "select" ? (
                  <Select value={strVal} onValueChange={(v) => setCustomField(field.key, v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={t("tmpl.selectPlaceholder", "Pilih...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-sm">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    value={strVal}
                    onChange={(e) => setCustomField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="text-sm resize-none"
                    rows={3}
                  />
                ) : field.type === "date" ? (
                  <Input
                    type="date"
                    value={strVal}
                    onChange={(e) => setCustomField(field.key, e.target.value)}
                    className="h-9 text-sm"
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={strVal}
                    onChange={(e) =>
                      setCustomField(
                        field.key,
                        field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    className="h-9 text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Required Documents ── */}
      {template.requiredDocuments.length > 0 && (
        <div className="border rounded-xl p-4 bg-card">
          <SectionHeader icon={<FileText className="w-3.5 h-3.5" />} title={t("tmpl.requiredDocs", "Dokumen Wajib")} />
          <p className="text-xs text-muted-foreground mb-3">
            {t("tmpl.requiredDocsHint", "Masukkan nomor/referensi dokumen. Dokumen asli diserahkan saat pengiriman.")}
          </p>
          <div className="space-y-3">
            {template.requiredDocuments.map((doc) => (
              <div key={doc.key} className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  {doc.label}
                  {doc.required && <Badge variant="destructive" className="text-[9px] py-0 h-4">{t("tmpl.required", "Wajib")}</Badge>}
                </Label>
                <Input
                  value={getDocRef(doc.key)}
                  onChange={(e) => setDocRef(doc.key, doc.label, e.target.value)}
                  placeholder={t("tmpl.docRefPlaceholder", "No. / Referensi dokumen...")}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Checklist ── */}
      {template.checklist.length > 0 && (
        <div className="border rounded-xl p-4 bg-card">
          <SectionHeader icon={<ClipboardList className="w-3.5 h-3.5" />} title={t("tmpl.checklist", "Checklist Persiapan")} />
          <div className="space-y-2.5">
            {template.checklist.map((item) => (
              <div key={item.key} className="flex items-center gap-2.5">
                <Checkbox
                  id={`chk-${item.key}`}
                  checked={values.checklistStatus[item.key] ?? false}
                  onCheckedChange={(v) => toggleChecklist(item.key, Boolean(v))}
                />
                <label htmlFor={`chk-${item.key}`} className="text-sm cursor-pointer select-none">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Handling / Packaging ── */}
      <div className="border rounded-xl p-4 bg-card">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left"
          onClick={() => setPackagingOpen((p) => !p)}
        >
          <SectionHeader icon={<Wrench className="w-3.5 h-3.5" />} title={t("tmpl.handling", "Handling & Packaging")} />
          {packagingOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
        </button>
        {packagingOpen && (
          <div className="mt-3 space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
              {template.packagingInstructions}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <StickyNote className="w-3 h-3" /> Catatan Packaging (opsional)
              </Label>
              <Textarea
                value={values.packagingNotes}
                onChange={(e) => setPackagingNotes(e.target.value)}
                placeholder="Instruksi khusus packaging..."
                className="text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export shared validator so existing imports `validateDynamicForm` keep working.
export { validateTemplatePayload as validateDynamicForm } from "@shared/product-templates";
