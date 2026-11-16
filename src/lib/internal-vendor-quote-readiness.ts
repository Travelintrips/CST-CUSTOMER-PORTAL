/** Read-only Admin UI preflight for internal Marketplace quote delivery.
 * It never grants a vendor identity, changes a quote, or sends notifications.
 */
export type VendorQuoteReachability = {
  status: string;
  isInternalVendor?: boolean;
  hasVendorPhone?: boolean;
  hasActiveVendorAccount?: boolean;
};

export function requiresInternalVendorAssignment(q: VendorQuoteReachability): boolean {
  return q.isInternalVendor === true &&
    q.hasVendorPhone !== true &&
    q.hasActiveVendorAccount !== true &&
    ["invited", "opened", "requote_requested"].includes(q.status);
}
