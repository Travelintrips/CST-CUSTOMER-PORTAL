import type { ServiceTemplate, ServiceTemplateField } from "./types.js";

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  return false;
}

/**
 * Periksa apakah field tertentu visible berdasarkan conditionalRules.
 * Field dalam rule.show hanya visible jika trigger field bernilai condition.value.
 */
export function isServiceFieldVisible(
  fieldKey: string,
  template: ServiceTemplate,
  values: Record<string, unknown>,
): boolean {
  for (const rule of template.conditionalRules) {
    if (!rule.show.includes(fieldKey)) continue;
    const triggerVal = values[rule.fieldKey];
    if (String(triggerVal ?? "") !== String(rule.condition.value)) {
      return false;
    }
  }
  return true;
}

/**
 * Validasi payload form terhadap template service.
 * Digunakan di backend (server-side defense) maupun frontend (pre-submit).
 *
 * @param template ServiceTemplate yang aktif (resolved)
 * @param formData  Key-value form data dari submission
 * @param phase    Phase aktif: "quotation" | "operational"
 * @returns Array pesan error. Kosong = valid.
 */
export function validateServicePayload(
  template: ServiceTemplate,
  formData: Record<string, unknown>,
  phase: "quotation" | "operational" = "quotation",
): string[] {
  const errors: string[] = [];

  const activeFields = template.fields.filter((f: ServiceTemplateField) => {
    if (!f.section) return true;
    if (phase === "operational") return f.section === "operational" || f.section === "both";
    return f.section === "quotation" || f.section === "both";
  });

  const visitedByRule = new Set<string>();
  for (const rule of template.validationRules) {
    visitedByRule.add(rule.fieldKey);
    const field = activeFields.find((f) => f.key === rule.fieldKey);
    if (!field) continue;
    if (!isServiceFieldVisible(rule.fieldKey, template, formData)) continue;
    if (isEmpty(formData[rule.fieldKey])) {
      errors.push(rule.message);
    }
  }

  for (const field of activeFields) {
    if (!field.required || visitedByRule.has(field.key)) continue;
    if (!isServiceFieldVisible(field.key, template, formData)) continue;
    if (isEmpty(formData[field.key])) {
      errors.push(`${field.label} wajib diisi`);
    }
  }

  return errors;
}

/**
 * Kembalikan daftar field yang aktif untuk phase tertentu.
 */
export function getActiveFields(
  template: ServiceTemplate,
  phase: "quotation" | "operational",
): ServiceTemplateField[] {
  return template.fields.filter((f) => {
    if (!f.section) return true;
    if (phase === "operational") return f.section === "operational" || f.section === "both";
    return f.section === "quotation" || f.section === "both";
  });
}
