# Customer Invoice — one Owner OTP from another device (CST-DEV source candidate)

**Scope:** a narrow child of Draft Customer Portal PR #227 and paired BizPortal
Draft PR #152. Source-only, all new remote flags OFF, no active deployment,
no Supabase DDL, no login/credential changes, no WA Gateway dispatch, no PROD.

## Business UX

1. Authorized staff Portal Admin selects **Minta persetujuan Owner (perangkat lain)**.
2. Portal issues a 90-second HMAC challenge based ONLY on the live
   `sales_documents` Invoice row: issuer ID/email, Invoice ID, company 1 CST
   or company 3 Diva, doc number and amount in fixed integer cents.
3. Admin copies the one-time link to the Owner (sharing is **manual**, not a
   WhatsApp or email dispatch). The Owner opens it on their own phone/PC.
4. BizPortal checks its **existing signed OTP Super Admin session** and shows
   company, document number, amount and issuer; Owner explicitly presses
   **Setujui satu kali**. GET alone NEVER signs a remote approval.
5. The BizPortal server signs Ed25519 proof using the existing key and POSTs
   to the explicitly pinned Customer Portal DEV origin over HTTPS. No JWT,
   cookie, password, OTP code or private key crosses services.
6. The Portal verifies HMAC + Ed25519 and retains only a bounded 90-second
   receipt in memory. Only the original signed Portal Admin session can poll
   its matching challenge. Another issuer, company or Invoice receives 403.
7. The original `mark_invoiced` transaction still independently verifies
   the proof, canonical active issuer and approver, exact document and amount,
   company RLS, original GL/PPN/AR/audit/outbox, and then COMMIT/replay or
   ROLLBACK. No automatic financial posting occurs in the receipt endpoint.

## Security and release limitations

- The remote relay is **single-instance and volatile**, 128 receipts maximum,
  and disappears on restart (fail closed). Do not deploy behind multiple
  Portal instances without a separately reviewed durable store or sticky
  routing; no new approval database/schema is introduced in this candidate.
- Old popup and feature-OFF paths are unchanged. Feature flags are explicit:
  `CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV` (API),
  `VITE_CUSTOMER_PORTAL_REMOTE_OWNER_OTP_DEV` (frontend) and
  `BIZPORTAL_CUSTOMER_INVOICE_REMOTE_OWNER_DEV` (BizPortal API).
  Existing DEV-only atomic/posted AR/OTP flags are still required.
- BizPortal POST requires exact `BIZPORTAL_API_ORIGIN_DEV` and sends proof
  only to `BIZPORTAL_CUSTOMER_PORTAL_ORIGIN_DEV`, with no redirects; only
  HTTPS, except loopback-only synthetic QA.
- A request does not authorize a new staff Admin: canonical company assignments
  for both staff issuer and Owner remain mandatory. Last CST-DEV audit found
  **zero matched staff issuers** for CST and Diva. No hidden grants or dummy
  memberships were created.
- Testing uses network-isolated or local loopback synthetic data. **Not** a
  genuine real Owner OTP login, live Invoice/PPN/AR COMMIT, or live WhatsApp.
  Do not claim E2E operational PASS or merge/deploy/enable flags until those
  release gates pass. PROD unchanged.
