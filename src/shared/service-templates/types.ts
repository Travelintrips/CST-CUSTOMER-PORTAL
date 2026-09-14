export type ServiceFieldSection = "quotation" | "operational" | "both";

export type ServiceFieldType = "text" | "number" | "select" | "textarea" | "date";

/**
 * ServiceTemplateField = form field dengan tambahan `section` dan `isUpload`.
 * Kompatibel dengan shape SERVICE_SCHEMAS.fields yang sudah berjalan.
 */
export interface ServiceTemplateField {
  key: string;
  label: string;
  type: ServiceFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  unit?: string;
  section: ServiceFieldSection;
  isUpload?: boolean;
}

/**
 * Dokumen wajib yang harus dikumpulkan untuk service type tertentu.
 * Contoh trucking: Surat Jalan, STNK/KIR
 * Contoh sea_freight: Bill of Lading, Packing List
 */
export interface ServiceTemplateDocument {
  key: string;
  label: string;
  required: boolean;
}

/**
 * Item checklist operasional per service type.
 * Digunakan untuk verifikasi sebelum konfirmasi ke customer.
 */
export interface ServiceTemplateChecklist {
  key: string;
  label: string;
}

export interface ServiceConditionalRule {
  fieldKey: string;
  condition: { value: string | number };
  show: string[];
}

export interface ServiceValidationRule {
  fieldKey: string;
  message: string;
}

/**
 * ServiceTemplate — representasi lengkap satu tipe layanan logistik.
 * Menggabungkan form structure (SERVICE_SCHEMAS) dengan
 * template engine fields (requiredDocuments, checklist, versi).
 */
export interface ServiceTemplate {
  serviceType: string;
  label: string;
  emoji: string;
  version: string;
  isActive: boolean;
  fields: ServiceTemplateField[];
  requiredDocuments: ServiceTemplateDocument[];
  checklist: ServiceTemplateChecklist[];
  conditionalRules: ServiceConditionalRule[];
  validationRules: ServiceValidationRule[];
}

/**
 * Subset ServiceTemplate untuk DB override via admin CMS.
 * Field null/undefined fallback ke in-code default — admin
 * tidak perlu re-type seluruh template hanya untuk ubah satu field.
 */
export interface ServiceTemplateOverride {
  serviceType: string;
  label?: string | null;
  emoji?: string | null;
  version?: string | null;
  isActive?: boolean | null;
  fields?: ServiceTemplateField[] | null;
  requiredDocuments?: ServiceTemplateDocument[] | null;
  checklist?: ServiceTemplateChecklist[] | null;
  conditionalRules?: ServiceConditionalRule[] | null;
  validationRules?: ServiceValidationRule[] | null;
}
