import type { ProductTemplate, ProductTemplateOverride } from "./types";
import { templates } from "./templates";

export const FALLBACK_CATEGORY = "general";

/**
 * Derived from in-code templates — always in sync with all categories.
 * Key: categoryKey, Value: display label (Indonesian).
 */
export const CATEGORY_LABELS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.values(templates).map((t) => [t.category, t.label]),
);

export function getInCodeTemplate(category: string): ProductTemplate {
  return templates[category] ?? templates[FALLBACK_CATEGORY]!;
}

export function hasInCodeTemplate(category: string): boolean {
  return Object.prototype.hasOwnProperty.call(templates, category);
}

export function getAllInCodeTemplates(): ProductTemplate[] {
  return Object.values(templates);
}

export function listInCodeCategories(): string[] {
  return Object.keys(templates);
}

/**
 * Hybrid resolver. Starts from the in-code template (single source of truth
 * for shape & defaults) then layers a DB override on top. Override fields
 * with null/undefined fall through to the in-code value, so admins can edit
 * just one piece (e.g. add a doc) without re-typing the whole template.
 *
 * If `isActive === false` on the override, returns the pure in-code template
 * (override is treated as disabled).
 *
 * NOTE: Falls back to "general" for unknown keys — use resolveTemplateStrict
 * when an unknown key must be rejected rather than silently promoted.
 */
export function resolveTemplate(
  category: string,
  override?: ProductTemplateOverride | null,
): ProductTemplate {
  const base = getInCodeTemplate(category);
  if (!override || override.isActive === false) {
    return { ...base, category };
  }
  return {
    category,
    label: override.label ?? base.label,
    version: override.version ?? base.version,
    requiredDocuments: override.requiredDocuments ?? base.requiredDocuments,
    checklist: override.checklist ?? base.checklist,
    customFields: override.customFields ?? base.customFields,
    packagingInstructions: override.packagingInstructions ?? base.packagingInstructions,
    conditionalRules: override.conditionalRules ?? base.conditionalRules,
    validationRules: override.validationRules ?? base.validationRules,
  };
}

/**
 * Strict resolver — returns null if the category is not in the in-code registry.
 * Use this when an unknown categoryKey must be REJECTED (fail-closed), not
 * silently promoted to the "general" fallback.
 * Rule: no fallback to general unless categoryKey is explicitly "general".
 */
export function resolveTemplateStrict(
  category: string,
  override?: ProductTemplateOverride | null,
): ProductTemplate | null {
  if (!hasInCodeTemplate(category)) return null;
  return resolveTemplate(category, override);
}

/**
 * Resolve every template the system knows about: union of in-code categories
 * and active DB-only categories (admin-added).
 */
export function resolveAllTemplates(
  overrides: ProductTemplateOverride[] = [],
): ProductTemplate[] {
  const overrideMap = new Map<string, ProductTemplateOverride>();
  for (const ov of overrides) overrideMap.set(ov.categoryKey, ov);

  const result: ProductTemplate[] = [];
  for (const tpl of getAllInCodeTemplates()) {
    result.push(resolveTemplate(tpl.category, overrideMap.get(tpl.category) ?? null));
  }
  // DB-only (admin-added) categories
  for (const ov of overrides) {
    if (hasInCodeTemplate(ov.categoryKey)) continue;
    if (ov.isActive === false) continue;
    result.push(resolveTemplate(ov.categoryKey, ov));
  }
  return result;
}
