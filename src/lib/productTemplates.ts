// Re-export shim — actual templates & types live in @shared/product-templates
// (shared between customer-portal frontend and api-server backend so the engine
// has a single source of truth and the backend can re-validate payloads).
export type {
  CustomField,
  CustomFieldType,
  RequiredDocument,
  ChecklistItem,
  ConditionalRule,
  ValidationRule,
  ProductTemplate,
  UploadedDocumentRef,
  DynamicFormValues,
  ProductTemplateOverride,
} from "@shared/product-templates";

export {
  getInCodeTemplate as getTemplate,
  getAllInCodeTemplates as getAllTemplates,
  resolveTemplate,
  resolveAllTemplates,
  listInCodeCategories,
  inCodeTemplates as templates,
  FALLBACK_CATEGORY,
  validateTemplatePayload,
  isFieldVisible,
} from "@shared/product-templates";
