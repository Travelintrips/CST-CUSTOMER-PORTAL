import type { ServiceTemplate, ServiceTemplateOverride } from "./types.js";
import { serviceTemplates } from "./templates.js";

export const FALLBACK_SERVICE_TYPE = "document";

/**
 * Map serviceType → label untuk semua in-code templates.
 * Selalu sinkron karena diturunkan langsung dari serviceTemplates.
 */
export const SERVICE_TYPE_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.values(serviceTemplates).map((t) => [t.serviceType, t.label]),
);

/** Kembalikan in-code ServiceTemplate; fallback ke "document" jika tidak ditemukan. */
export function getInCodeServiceTemplate(serviceType: string): ServiceTemplate {
  return serviceTemplates[serviceType] ?? serviceTemplates[FALLBACK_SERVICE_TYPE]!;
}

/** Periksa apakah serviceType punya in-code template. */
export function hasInCodeServiceTemplate(serviceType: string): boolean {
  return Object.prototype.hasOwnProperty.call(serviceTemplates, serviceType);
}

/** Kembalikan semua in-code ServiceTemplate sebagai array. */
export function getAllInCodeServiceTemplates(): ServiceTemplate[] {
  return Object.values(serviceTemplates);
}

/** Kembalikan semua serviceType yang terdaftar. */
export function listInCodeServiceTypes(): string[] {
  return Object.keys(serviceTemplates);
}

/**
 * Hybrid resolver. Mulai dari in-code template (single source of truth
 * untuk shape & defaults) lalu layer DB override di atasnya.
 *
 * Override field dengan null/undefined fallback ke in-code value —
 * admin bisa ubah satu bagian (misal tambah dokumen) tanpa re-type seluruh template.
 *
 * Jika isActive === false pada override, kembalikan pure in-code template
 * (override dianggap non-aktif).
 */
export function resolveServiceTemplate(
  serviceType: string,
  override?: ServiceTemplateOverride | null,
): ServiceTemplate {
  const base = getInCodeServiceTemplate(serviceType);
  if (!override || override.isActive === false) {
    return { ...base, serviceType };
  }
  return {
    serviceType,
    label:             override.label             ?? base.label,
    emoji:             override.emoji             ?? base.emoji,
    version:           override.version           ?? base.version,
    isActive:          override.isActive          ?? base.isActive,
    fields:            override.fields            ?? base.fields,
    requiredDocuments: override.requiredDocuments ?? base.requiredDocuments,
    checklist:         override.checklist         ?? base.checklist,
    conditionalRules:  override.conditionalRules  ?? base.conditionalRules,
    validationRules:   override.validationRules   ?? base.validationRules,
  };
}

/**
 * Resolve semua templates: gabungan in-code + active DB overrides.
 * DB-only types (admin-tambahkan) yang punya isActive=true juga disertakan.
 */
export function resolveAllServiceTemplates(
  overrides: ServiceTemplateOverride[] = [],
): ServiceTemplate[] {
  const overrideMap = new Map<string, ServiceTemplateOverride>();
  for (const ov of overrides) overrideMap.set(ov.serviceType, ov);

  const result: ServiceTemplate[] = [];
  for (const tpl of getAllInCodeServiceTemplates()) {
    result.push(resolveServiceTemplate(tpl.serviceType, overrideMap.get(tpl.serviceType) ?? null));
  }
  for (const ov of overrides) {
    if (hasInCodeServiceTemplate(ov.serviceType)) continue;
    if (ov.isActive === false) continue;
    result.push(resolveServiceTemplate(ov.serviceType, ov));
  }
  return result;
}
