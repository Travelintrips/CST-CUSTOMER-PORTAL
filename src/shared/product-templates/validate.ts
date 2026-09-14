import type { ProductTemplate, DynamicFormValues, CustomField } from "./types";

/** Conditional rule semantics: a field listed in `show` is only visible
 * when the trigger field's value equals `condition.value`. */
export function isFieldVisible(
  fieldKey: string,
  template: ProductTemplate,
  values: Pick<DynamicFormValues, "customFieldValues">,
): boolean {
  for (const rule of template.conditionalRules) {
    if (!rule.show.includes(fieldKey)) continue;
    const triggerVal = values.customFieldValues[rule.fieldKey];
    // string-coerced comparison so "10" === 10 etc.
    if (String(triggerVal ?? "") !== String(rule.condition.value)) {
      return false;
    }
  }
  return true;
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  return false;
}

/**
 * Parse raw value as a finite number.
 * Returns NaN if the value is not a clean numeric literal.
 * Rejects strings containing letters, %, or other non-numeric characters
 * (e.g. "0.8% max", "50 ppm", "~10").
 */
function parseStrictNumber(raw: unknown): number {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : NaN;
  }
  const str = String(raw ?? "").trim();
  if (str === "") return NaN;
  // Only accept: optional minus, digits, optional single dot, digits
  if (!/^-?\d*\.?\d+$/.test(str)) return NaN;
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Run type-specific validation for a single field value.
 * Assumes the value is non-empty (required check is handled separately).
 */
function validateFieldType(field: CustomField, rawValue: unknown): string[] {
  const errors: string[] = [];

  switch (field.type) {
    case "number": {
      const n = parseStrictNumber(rawValue);
      if (isNaN(n)) {
        errors.push(
          `${field.label}: nilai harus berupa angka valid (misal: 0.5), bukan '${rawValue}'`,
        );
      } else {
        if (field.min !== undefined && n < field.min) {
          errors.push(`${field.label}: nilai minimum adalah ${field.min} (diterima: ${n})`);
        }
        if (field.max !== undefined && n > field.max) {
          errors.push(`${field.label}: nilai maksimum adalah ${field.max} (diterima: ${n})`);
        }
      }
      break;
    }

    case "select": {
      if (field.options && field.options.length > 0) {
        const strVal = String(rawValue);
        if (!field.options.includes(strVal)) {
          errors.push(
            `${field.label}: '${strVal}' bukan pilihan valid. Pilihan yang tersedia: ${field.options.join(", ")}`,
          );
        }
      }
      break;
    }

    case "date": {
      const strVal = String(rawValue);
      if (isNaN(new Date(strVal).getTime())) {
        errors.push(
          `${field.label}: format tanggal tidak valid (diterima: '${strVal}')`,
        );
      }
      break;
    }

    // "text" and "textarea": no additional type constraints
    default:
      break;
  }

  return errors;
}

/**
 * Return field keys present in customFieldValues that are NOT defined in the
 * template. These are reported for audit purposes but do NOT cause validation
 * failure (backward-compatibility: old payloads may carry extra keys).
 */
export function getUnknownFields(
  template: ProductTemplate,
  values: Pick<DynamicFormValues, "customFieldValues">,
): string[] {
  const knownKeys = new Set(template.customFields.map((f) => f.key));
  return Object.keys(values.customFieldValues).filter((k) => !knownKeys.has(k));
}

/**
 * Re-validate a payload against a template. Returns array of error messages.
 * Empty array = valid. Used by both the frontend (pre-submit) and the
 * backend (defense-in-depth, never trust the client).
 *
 * Validations performed:
 *  1. Required fields (via validationRules + per-field required flag)
 *  2. Number: must be a finite number literal — rejects "0.8% max", NaN, Infinity
 *  3. Select/enum: value must be one of the template's defined options
 *  4. Date: must be a parseable date string
 *  5. Min/max bounds (if defined on the field)
 *  6. Required documents must have a non-empty reference
 *  7. Conditional visibility is respected (hidden fields are skipped)
 *
 * Unknown fields are NOT rejected here — call getUnknownFields() separately
 * and log them for audit purposes.
 */
/**
 * Convert raw spec_values (from DB / req.body) and documents array to
 * DynamicFormValues so they can be passed to validateTemplatePayload.
 */
export function specValuesToFormValues(
  specValues: Record<string, unknown>,
  documents?: unknown,
): DynamicFormValues {
  const customFieldValues: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(specValues)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      customFieldValues[k] = v;
    } else if (v !== null && v !== undefined) {
      customFieldValues[k] = String(v);
    }
  }
  const uploadedDocuments = Array.isArray(documents)
    ? (documents as Record<string, unknown>[]).map((d) => ({
        key: String(d["key"] ?? ""),
        label: String(d["label"] ?? ""),
        reference: String(d["reference"] ?? ""),
      }))
    : [];
  return {
    customFieldValues,
    uploadedDocuments,
    checklistStatus: {},
    packagingNotes: "",
    conditionalFlags: {},
  };
}

export function validateTemplatePayload(
  template: ProductTemplate,
  values: DynamicFormValues,
): string[] {
  const errors: string[] = [];

  // ── 1. Custom field validation ─────────────────────────────────────────────
  const visited = new Set<string>();

  // validationRules carry custom error messages and take priority
  for (const rule of template.validationRules) {
    visited.add(rule.fieldKey);
    if (!isFieldVisible(rule.fieldKey, template, values)) continue;
    const rawValue = values.customFieldValues[rule.fieldKey];
    if (isEmpty(rawValue)) {
      errors.push(rule.message);
      continue; // no type check for missing required value
    }
    // Also type-check fields covered by validationRules
    const field = template.customFields.find((f) => f.key === rule.fieldKey);
    if (field) errors.push(...validateFieldType(field, rawValue));
  }

  for (const field of template.customFields) {
    if (!isFieldVisible(field.key, template, values)) continue;
    const rawValue = values.customFieldValues[field.key];

    // Required check (fields not already handled by validationRules)
    if (field.required && !visited.has(field.key)) {
      if (isEmpty(rawValue)) {
        errors.push(`${field.label} wajib diisi`);
        continue; // no type check for missing required value
      }
    }

    // Type-specific validation for all visible fields that have a value
    if (!isEmpty(rawValue) && rawValue !== undefined) {
      errors.push(...validateFieldType(field, rawValue));
    }
  }

  // ── 2. Required documents ──────────────────────────────────────────────────
  for (const doc of template.requiredDocuments) {
    if (!doc.required) continue;
    const ref = values.uploadedDocuments.find((d) => d.key === doc.key)?.reference ?? "";
    if (!ref.trim()) {
      errors.push(`${doc.label} wajib diunggah/diisi`);
    }
  }

  return errors;
}
