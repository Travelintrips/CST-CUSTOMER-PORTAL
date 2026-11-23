/** Fail-closed mode for the already-reviewed DEV Invoice approval flow. */
export type CustomerInvoiceApprovalMode = "legacy" | "handoff" | "unavailable";

export function selectCustomerInvoiceApprovalMode(value:unknown):CustomerInvoiceApprovalMode {
  if (value == null || typeof value !== "object" || Array.isArray(value))
    return "unavailable";
  const config=value as {required?:unknown;ownerHandoff?:unknown};
  if(config.required===true)
    return config.ownerHandoff===true ? "handoff" : "unavailable";
  if(config.required===false)
    return "legacy";
  return "unavailable";
}
