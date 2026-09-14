/**
 * Targeted fix: adds missing keys to 16 non-id/en locale files via text manipulation.
 * Only touches mktPurchaseOrders, mktMyRfqs, vendorDashboard namespaces.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

// Keys to ensure exist in all locales (from en-US baseline)
// Format: namespace -> { subkey: enValue }
const REQUIRED_KEYS = {
  mktPurchaseOrders: {
    showingCount: 'Showing {current} of {total} purchase orders',
    statusRevisionRequested: 'Revision Requested',
    statusClosed: 'Closed',
    statusPartiallyDelivered: 'Partially Delivered',
    statusRejectedGoods: 'Goods Rejected',
  },
  mktMyRfqs: {
    fetchError: 'Failed to load RFQ list. Please try again.',
    browseMarketplace: 'Browse Marketplace',
    createdLabel: 'Created:',
    requiredLabel: 'Required by:',
    actionRequired: 'Action required — review vendor offers',
    poCreated: 'Purchase Order has been created',
    rejectionReason: 'Rejection reason:',
    submitBtn: 'Submit',
    cancelBtn: 'Cancel',
    cancelDialogTitle: 'Cancel RFQ?',
    cancelDialogBodyPost: 'will be cancelled. This action cannot be undone.',
    cancelDialogNo: 'No, Go Back',
    cancelDialogYes: 'Yes, Cancel',
    rfqStatusDraft: 'Draft',
    rfqStatusSubmitted: 'Submitted',
    rfqStatusQuoting: 'Seeking Quotes',
    rfqStatusQuoted: 'Quotes Received',
    rfqStatusCustomerReview: 'Awaiting Your Approval',
    rfqStatusAwarded: 'PO Created',
    rfqStatusCancelled: 'Cancelled',
    rfqStatusExpired: 'Expired',
    approvalPending: 'Pending Approval',
    approvalApproved: 'Approved',
    approvalRejected: 'Rejected',
  },
  vendorDashboard: {
    etalaseSectionTitle: 'Storefront & Product Photos',
    uploadingShort: 'Uploading…',
    addPhotoBtn: 'Add',
    uploadFirstPhoto: 'Upload first photo',
    uploadingPhoto: 'Uploading photo…',
    primaryPhotoHint: '⭐ = primary photo (shown in marketplace). Manage all media in Catalog tab.',
    allItemsArchived: 'All items are archived',
    fieldNameLabel: 'Product / Service Name',
    fieldTypeLabel: 'Type',
    fieldCategoryLabel: 'Category',
    fieldDescLabel: 'Description',
    fieldPriceLabel: 'Price (IDR)',
    fieldUnitLabel: 'Unit',
    fieldMoqLabel: 'MOQ (Minimum Order)',
    fieldOriginLabel: 'Origin',
    fieldHsCodeLabel: 'HS Code',
    savingText: 'Saving…',
    saveChangesBtn: 'Save Changes',
    newProductLabel: 'New Product',
    manageCatalogTitle: 'Manage Product Catalog',
    noProductCTA: 'No products yet. Click "Add Product" to get started.',
    archiveConfirm: 'Archive "{name}"? The item will not appear in the marketplace.',
    featuredTitle: 'Featured Products',
    featuredSubtitle: 'Promote your products/services to stand out in the Marketplace',
    applyFeaturedTitle: 'Apply for Featured Product',
    noCatalogPublished: 'No published catalog items',
    allItemsInProgress: 'All active products are already submitted or in featured process',
    stepPickProduct: '1. Select Product / Service',
    stepPickPackage: '2. Select Promotion Package',
    noPackageAvailable: 'No packages available at this time',
    confirmSubmitTitle: 'Confirm Submission',
    confirmSubmitWith: 'with package',
    confirmSubmitStart: '— starting today',
    submitOkText: 'Submission sent successfully!',
    sendingText: 'Sending...',
    applyFeaturedBtn: 'Apply for Featured Product',
    featuredStatusTitle: 'Featured Product Submission Status',
    reloadBtn: 'Reload',
    noFeaturedSubmissions: 'No featured product submissions yet',
    packageLabel: 'Package:',
    submittedDateLabel: 'Submitted:',
    priceHeaderLabel: 'Price',
    periodSubmitted: 'Submitted Period',
    periodApproved: 'Approved Period',
    adminNoteLabel: 'Admin note:',
    uploadProofTitle: 'Upload Payment Proof',
    paymentRefPlaceholder: 'Payment reference (optional, e.g. transfer no.)',
    uploadingProgress: 'Uploading...',
    chooseFileUpload: 'Choose File & Upload',
    cancelFeaturedBtn: 'Cancel Submission',
    cancellingText: 'Cancelling...',
    welcomeMsg: 'Welcome, {name}',
    dashboardSubtitle: 'Monitor and send RFQ quotes directly here',
    pendingRfqAlert: '{count} RFQs pending reply',
    statRfqReceived: 'RFQs Received',
    statRfqTenderInvite: 'Total tender invitations',
    statQuotesSent: 'Quotes Sent',
    statQuotesSentDesc: 'Quotes already submitted',
    statFulfillPending: 'Fulfillment Pending',
    statFulfillPendingDesc: 'Order approved, not yet completed',
    statOrdersDone: 'Orders Completed',
    statOrdersDoneDesc: 'Successfully completed',
    supplierLinkedTitle: 'Account linked to vendor data',
    supplierLinkedDesc: 'Connected as: {name}',
    supplierNotLinkedTitle: 'Account not linked to vendor data',
    supplierNotLinkedDesc: 'Contact admin to link your account with email {email}.',
    supplierActiveLabel: 'Active',
    supplierInactiveLabel: 'Inactive',
    miniStatRfqOpen: 'Open RFQs',
    miniStatQuotesSent: 'Quotes Sent',
    miniStatQuotesChosen: 'Quotes Chosen',
    rfqIncomingTitle: 'Incoming RFQs',
    rfqIncomingDesc: 'Click "Send Quote" to submit your price directly',
    noRfqReceived: 'No RFQs received yet',
    repliedBadge: 'Replied',
    notRepliedBadge: 'Not replied',
    commodityLabel: 'Commodity:',
    cancelFormBtn: 'Cancel',
    reviseQuoteBtn: 'Revise',
    sendQuoteBtn: 'Send Quote',
    detailBtn: 'Detail',
    yourQuoteSection: 'Your Quote',
    quoteReviseTitle: 'Revise Quote',
    quoteSendTitle: 'Send Quote',
    quotePriceLabel: 'Quote Price (IDR)',
    etaPickupOptional: 'ETA Pickup (optional)',
    etaDeliveryOptional: 'ETA Delivery (optional)',
    notesOptional: 'Notes (optional)',
    sendingQuote: 'Sending...',
    updateQuoteBtn: 'Update Quote',
    quotesSentTitle: 'Quotes Sent',
    noQuoteYet: 'No quotes yet',
    sendQuoteCTA: 'Click "Send Quote" on an RFQ on the left',
    profileAccountTitle: 'Account Profile',
    howToTitle: 'How to send a quote:',
    howToStep1: '1. Click "Send Quote" on the RFQ you want to reply to',
    howToStep2: '2. Fill in price and details, then submit',
    howToStep3: '3. You can revise while the RFQ is still Open',
    logoutBtn: 'Logout',
    vendorPortalLabel: 'Vendor Portal',
    loadingDashboard: 'Loading vendor dashboard...',
    tabDashboard: 'Dashboard',
    tabProfile: 'Profile',
    tabCatalog: 'Catalog',
    tabNotifications: 'Notifications',
    tabFeatured: 'Featured Products',
    verificationTitle: 'Verification Status:',
    statusVerified: 'Verified',
    statusPendingReview: 'Pending Review',
    approvedOn: 'Approved on {date}',
    catalogLinkTitle: 'Catalog Upload Link',
    validUntilLabel: 'Valid until: {date}',
    profileNotAvailable: 'Vendor profile data not yet available',
    reloadBtnLabel: 'Reload',
    companyInfoSection: 'Company Information',
    picContactSection: 'PIC Contact',
    addressSection: 'Address',
    bankInfoSection: 'Bank Information',
    fieldCompanyName: 'Company Name',
    fieldLegalName: 'Legal Name',
    fieldNpwp: 'Tax ID (NPWP)',
    fieldServiceType: 'Service Type',
    fieldCompanyEmail: 'Company Email',
    fieldPhoneNumber: 'Phone Number',
    fieldPicName: 'PIC Name',
    fieldPicPhone: 'PIC Phone',
    fieldPicEmail: 'PIC Email',
    fieldAddress: 'Address',
    fieldCity: 'City',
    fieldProvince: 'Province',
    fieldPostalCode: 'Postal Code',
    fieldBank: 'Bank',
    fieldBankAccount: 'Account Number',
    fieldBankName: 'Account Name',
    catalogSubmissionTitle: 'Catalog Submission Status',
    noSubmissions: 'No catalog submissions yet',
    openSubmissionFormBtn: 'Open Submission Form',
    submittedDateLabel2: 'Submitted:',
    reviewDateLabel: 'Reviewed:',
    submissionRejectionNote: 'Reason:',
    markAllReadBtn: 'Mark All as Read',
    noNotifications: 'No notifications yet',
  },
};

function insertKeysIntoNamespace(src, ns, keysToAdd) {
  const nsStartRe = new RegExp(`(  ${ns}:\\s*\\{)`);
  const nsMatch = nsStartRe.exec(src);
  if (!nsMatch) {
    // Namespace doesn't exist — insert before closing `};` of the locale export
    const exportIdx = src.lastIndexOf("export default");
    let closingPos = src.lastIndexOf("\n};", exportIdx);
    if (closingPos === -1) closingPos = src.lastIndexOf("};", exportIdx);
    const newNsLines = keysToAdd
      .map(({ subkey, value }) => {
        const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return `    ${subkey}: '${escaped}',`;
      })
      .join("\n");
    const newBlock = `\n  ${ns}: {\n${newNsLines}\n  },\n`;
    return src.slice(0, closingPos) + newBlock + src.slice(closingPos);
  }

  // Find the closing brace of this namespace
  let braceDepth = 0;
  let insertPos = -1;
  for (let i = nsMatch.index; i < src.length; i++) {
    if (src[i] === "{") braceDepth++;
    else if (src[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) { insertPos = i; break; }
    }
  }
  if (insertPos === -1) return src;

  const insertion = keysToAdd
    .map(({ subkey, value }) => {
      const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      return `    ${subkey}: '${escaped}',`;
    })
    .join("\n");
  return src.slice(0, insertPos) + insertion + "\n  " + src.slice(insertPos);
}

function hasKey(src, ns, subkey) {
  // Simple heuristic: look for the subkey pattern inside the namespace block
  const nsStartRe = new RegExp(`  ${ns}:\\s*\\{`);
  const nsMatch = nsStartRe.exec(src);
  if (!nsMatch) return false;
  // Find namespace block end
  let braceDepth = 0;
  let endPos = -1;
  for (let i = nsMatch.index; i < src.length; i++) {
    if (src[i] === "{") braceDepth++;
    else if (src[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) { endPos = i; break; }
    }
  }
  if (endPos === -1) return false;
  const block = src.slice(nsMatch.index, endPos);
  // Look for `subkey:` pattern
  const keyRe = new RegExp(`\\b${subkey.replace(/\./g, "\\.")}\\s*:`);
  return keyRe.test(block);
}

const otherLocales = [
  "ar-AE.ts","ar-SA.ts","de-DE.ts","en-AU.ts","en-GB.ts","en-SG.ts",
  "es-ES.ts","fr-FR.ts","hi-IN.ts","it-IT.ts","ja-JP.ts","ko-KR.ts",
  "ms-MY.ts","nl-NL.ts","zh-CN.ts","zh-TW.ts"
];

for (const fname of otherLocales) {
  let src = readFileSync(path.join(localesDir, fname), "utf8");
  let changed = false;

  for (const [ns, keys] of Object.entries(REQUIRED_KEYS)) {
    const missing = [];
    for (const [subkey, value] of Object.entries(keys)) {
      if (!hasKey(src, ns, subkey)) {
        missing.push({ subkey, value });
      }
    }
    if (missing.length > 0) {
      console.log(`${fname} [${ns}]: adding ${missing.length} keys`);
      src = insertKeysIntoNamespace(src, ns, missing);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(path.join(localesDir, fname), src, "utf8");
    console.log(`  ${fname}: written ✓`);
  } else {
    console.log(`${fname}: OK (no missing keys)`);
  }
}

console.log("\nSync complete.");
