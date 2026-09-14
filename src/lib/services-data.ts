export type ShipmentType = "Import" | "Export" | "Domestic" | "Door to Door";

export type ServiceCategory =
  | "Freight"
  | "Customs"
  | "Handling"
  | "Storage"
  | "Trucking"
  | "Document"
  | "Additional";

export type CalculatorType =
  | "air_freight"
  | "sea_fcl"
  | "sea_lcl"
  | "customs"
  | "trucking"
  | "storage"
  | "document"
  | "additional"
  | "generic";

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  calculatorType: CalculatorType;
}

export interface CategoryInfo {
  name: ServiceCategory;
  description: string;
  icon: string;
}

export interface CategoryColors {
  bg: string;
  text: string;
  badge: string;
}

export const CATEGORY_COLORS_DETAIL: Record<ServiceCategory, CategoryColors> = {
  Freight:    { bg: "bg-blue-50",    text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  Customs:    { bg: "bg-orange-50",  text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  Handling:   { bg: "bg-purple-50",  text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  Storage:    { bg: "bg-teal-50",    text: "text-teal-700",   badge: "bg-teal-100 text-teal-700" },
  Trucking:   { bg: "bg-amber-50",   text: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
  Document:   { bg: "bg-indigo-50",  text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
  Additional: { bg: "bg-pink-50",    text: "text-pink-700",   badge: "bg-pink-100 text-pink-700" },
};

export const CATEGORIES: CategoryInfo[] = [
  { name: "Freight", description: "Air & sea freight forwarding, domestic delivery", icon: "Ship" },
  { name: "Customs", description: "Import/export customs clearance & documentation", icon: "FileCheck" },
  { name: "Handling", description: "Origin, destination & cargo handling services", icon: "Package" },
  { name: "Storage", description: "Warehouse, bonded & cold storage solutions", icon: "Warehouse" },
  { name: "Trucking", description: "Pickup, delivery & container transport", icon: "Truck" },
  { name: "Document", description: "Shipping documents, B/L, AWB, certificates", icon: "FileText" },
  { name: "Additional", description: "Insurance, survey, permits & compliance", icon: "Shield" },
];

export const SERVICE_ITEMS: ServiceItem[] = [
  // Freight
  { id: "air-freight", category: "Freight", name: "Air Freight", description: "Fast air cargo forwarding via international airports", calculatorType: "air_freight" },
  { id: "sea-fcl", category: "Freight", name: "Sea Freight FCL", description: "Full Container Load sea shipping services", calculatorType: "sea_fcl" },
  { id: "sea-lcl", category: "Freight", name: "Sea Freight LCL", description: "Less than Container Load consolidation service", calculatorType: "sea_lcl" },
  { id: "domestic-freight", category: "Freight", name: "Domestic Freight", description: "Domestic cargo distribution across Indonesia", calculatorType: "generic" },
  // Customs
  { id: "import-customs", category: "Customs", name: "Import Customs Clearance", description: "Complete import customs clearance processing", calculatorType: "customs" },
  { id: "export-customs", category: "Customs", name: "Export Customs Clearance", description: "Complete export customs clearance processing", calculatorType: "customs" },
  { id: "pib-peb", category: "Customs", name: "PIB/PEB Handling", description: "Import/export declaration document handling", calculatorType: "customs" },
  { id: "hs-code", category: "Customs", name: "HS Code Consultation", description: "Harmonized System code classification consultation", calculatorType: "generic" },
  // Handling
  { id: "origin-handling", category: "Handling", name: "Origin Handling", description: "Cargo handling at origin point services", calculatorType: "generic" },
  { id: "dest-handling", category: "Handling", name: "Destination Handling", description: "Cargo handling at destination services", calculatorType: "generic" },
  { id: "loading", category: "Handling", name: "Loading / Unloading", description: "Professional cargo loading and unloading", calculatorType: "generic" },
  { id: "dg-cargo", category: "Handling", name: "DG Cargo Handling", description: "Dangerous goods certified handling & transport", calculatorType: "generic" },
  // Storage
  { id: "warehouse", category: "Storage", name: "Warehouse Storage", description: "General warehousing with full management", calculatorType: "storage" },
  { id: "temp-storage", category: "Storage", name: "Temporary Storage", description: "Short-term cargo storage solutions", calculatorType: "storage" },
  { id: "bonded", category: "Storage", name: "Bonded Warehouse", description: "Customs-approved bonded warehouse facility", calculatorType: "storage" },
  { id: "cold-storage", category: "Storage", name: "Cold Storage", description: "Temperature-controlled cold chain storage", calculatorType: "storage" },
  // Trucking
  { id: "pickup-truck", category: "Trucking", name: "Pickup Trucking", description: "Door-to-port cargo pickup service", calculatorType: "trucking" },
  { id: "delivery-truck", category: "Trucking", name: "Delivery Trucking", description: "Port-to-door cargo delivery service", calculatorType: "trucking" },
  { id: "container-truck", category: "Trucking", name: "Container Trucking", description: "Container transport & positioning service", calculatorType: "trucking" },
  { id: "cargo-truck", category: "Trucking", name: "Cargo Trucking", description: "General cargo trucking across destinations", calculatorType: "trucking" },
  // Document
  { id: "shipping-instr", category: "Document", name: "Shipping Instruction", description: "SI preparation and submission to carrier", calculatorType: "document" },
  { id: "bill-of-lading", category: "Document", name: "Bill of Lading", description: "B/L issuance, amendment & telex release", calculatorType: "document" },
  { id: "awb", category: "Document", name: "Air Waybill", description: "AWB preparation and issuance", calculatorType: "document" },
  { id: "coo", category: "Document", name: "Certificate of Origin", description: "COO application and endorsement", calculatorType: "document" },
  { id: "packing-list", category: "Document", name: "Packing List / Invoice Review", description: "Document review, correction and compliance check", calculatorType: "document" },
  // Additional
  { id: "insurance", category: "Additional", name: "Insurance", description: "Cargo insurance covering all risks in transit", calculatorType: "additional" },
  { id: "surveyor", category: "Additional", name: "Surveyor", description: "Independent cargo survey and inspection", calculatorType: "additional" },
  { id: "permit", category: "Additional", name: "Permit Assistance", description: "Import/export permit processing assistance", calculatorType: "additional" },
  { id: "quarantine", category: "Additional", name: "Quarantine / BPOM / SNI Support", description: "Regulatory compliance for BPOM, SNI, SPS inspections", calculatorType: "additional" },
];

export const SHIPMENT_TYPES: { type: ShipmentType; description: string; icon: string }[] = [
  { type: "Import", description: "Goods entering Indonesia from overseas", icon: "Download" },
  { type: "Export", description: "Goods leaving Indonesia to overseas", icon: "Upload" },
  { type: "Domestic", description: "Local cargo movement within Indonesia", icon: "MapPin" },
  { type: "Door to Door", description: "Complete end-to-end logistics service", icon: "Home" },
];

export const STATUS_OPTIONS = [
  "New Order",
  "Under Review",
  "Quotation Sent",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = typeof STATUS_OPTIONS[number];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  "New Order": "bg-blue-100 text-blue-800",
  "Under Review": "bg-yellow-100 text-yellow-800",
  "Quotation Sent": "bg-purple-100 text-purple-800",
  "Confirmed": "bg-emerald-100 text-emerald-800",
  "In Progress": "bg-orange-100 text-orange-800",
  "Completed": "bg-green-100 text-green-800",
  "Cancelled": "bg-red-100 text-red-800",
};
