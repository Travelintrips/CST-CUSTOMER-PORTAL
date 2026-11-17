# Customer Portal DEV — Internal Vendor PO TEST acceptance

This is a DEV-only, per-PO, audited extension of the existing vendor acceptance writer. It is not a way to impersonate an external vendor.

## Scope

- The existing vendor PO capability link `/mkt-vendor-po/:token` and accept/reject/revise + shipment flows remain canonical; no token is retrieved or exposed.
- The signed Admin endpoint uses the **same `acceptVendorPurchaseOrder` writer** as the normal vendor capability endpoint.
- The server checks signed Admin and fresh active status, company affiliation, approved buyer membership, internal supplier and an explicitly `TEST DEV ONLY` quotation.
- An exact PO allowlist is required (no wildcard); the feature defaults OFF and cannot run in PROD.
- Admin TEST acceptance writes audit action `admin_internal_vendor_po_accepted` attributed to the actual Admin. It never queues WhatsApp, but writes the usual in-app buyer notification.
- No shipment, POD, payment, Vendor Invoice, AP, GL or PROD action is performed by this acceptance.

## DEV-only runtime keys

Enable only for one verified TEST PO after the signed Admin read-only preflight and QA gates:

    CST_INTERNAL_VENDOR_PO_ACCEPT_DEV=true
    CST_INTERNAL_VENDOR_PO_IDS_DEV=14
    CST_INTERNAL_VENDOR_QUOTE_COMPANY_IDS_DEV=1

Both `APP_ENV=development` and `NODE_ENV != production` are required. For rollback use `CST_INTERNAL_VENDOR_PO_ACCEPT_DEV=false` and the existing release/rollback controls.

## API

- GET `/api/mkt/admin/purchase-orders/14/internal-vendor-accept` is Admin-only and returns safe PO ID, vendor name, amount, status; no vendor token/contact.
- POST on the same URL requires signed active Admin plus `intent=accept_internal_vendor_po_dev`, `confirmed=true`, `reason` starting `TEST DEV` (12–500 chars).
- Replays are read-only. New acceptance holds the canonical PO row lock and uses a unique audit event.

## Verification

- Unit: `src/internal-vendor-po-accept-dev.test.ts` covers access controls, company relation, no token, no WhatsApp, canonical vendor compatibility, and idempotence.
- PostgreSQL16: `scripts/tests/dev-internal-vendor-po-pg16.sh` tests genuine transactions, concurrent requests, replay and no outbound messages on an **internal-only disposable Docker network**.
- TypeScript, syntax, CI and certified DEV deployment are mandatory before activation.

Never use this path for a commercial PO, other supplier, PROD, payments, or financial postings.