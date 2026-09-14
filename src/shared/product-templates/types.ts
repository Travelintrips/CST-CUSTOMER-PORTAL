export type CustomFieldType = "text" | "number" | "select" | "textarea" | "date";

export interface CustomField {
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  unit?: string;
  /** Optional numeric lower bound — validated by validateTemplatePayload */
  min?: number;
  /** Optional numeric upper bound — validated by validateTemplatePayload */
  max?: number;
}

export interface RequiredDocument {
  key: string;
  label: string;
  required: boolean;
}

export interface ChecklistItem {
  key: string;
  label: string;
}

export interface ConditionalRule {
  fieldKey: string;
  condition: { value: string | number };
  show: string[];
}

export interface ValidationRule {
  fieldKey: string;
  message: string;
}

export interface ProductTemplate {
  category: string;
  label: string;
  version: string;
  requiredDocuments: RequiredDocument[];
  checklist: ChecklistItem[];
  packagingInstructions: string;
  customFields: CustomField[];
  conditionalRules: ConditionalRule[];
  validationRules: ValidationRule[];
}

export interface UploadedDocumentRef {
  key: string;
  label: string;
  reference: string;
}

export interface DynamicFormValues {
  customFieldValues: Record<string, string | number | boolean>;
  uploadedDocuments: UploadedDocumentRef[];
  checklistStatus: Record<string, boolean>;
  packagingNotes: string;
  conditionalFlags: Record<string, string | number | boolean>;
}

/** Subset of a DB row used to override an in-code template at runtime. */
export interface ProductTemplateOverride {
  categoryKey: string;
  label?: string | null;
  version?: string | null;
  isActive?: boolean | null;
  requiredDocuments?: RequiredDocument[] | null;
  checklist?: ChecklistItem[] | null;
  customFields?: CustomField[] | null;
  packagingInstructions?: string | null;
  conditionalRules?: ConditionalRule[] | null;
  validationRules?: ValidationRule[] | null;
}
