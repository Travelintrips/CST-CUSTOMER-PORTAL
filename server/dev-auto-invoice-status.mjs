import { isAutomaticInvoiceDevEnabled, isEmailOtpAuthenticatedAdmin } from "./dev-auto-invoice-policy.mjs";

// Status endpoint: deliberately no transaction, row locks, actor activation,
// writer connections, mail delivery, or Invoice/Accounting mutation.
// The existing POST /auto-issue-ready is the sole execution path.
export async function readDevAutoInvoiceStatus({ user, dbQuery, env = process.env }) {
  if (!isAutomaticInvoiceDevEnabled(env)) {
    return { httpStatus: 404, error: "Otomatisasi invoice DEV tidak tersedia." };
  }
  if (!isEmailOtpAuthenticatedAdmin(user)) {
    return { httpStatus: 403, error: "Sesi Admin Email OTP diperlukan." };
  }
  const email = user.email.trim().toLowerCase();
  // Read-only equivalent of the canonical issuer eligibility check. This
  // never turns a dashboard poll into an authorization grant for posting.
  const issuer = await dbQuery(
    `select id from public.users
     where lower(trim(email))=$1 and status='active' and is_active is true
       and ((role='admin' and company_id=1) or
         (role='super_admin' and system_role='super_admin' and
          (company_id is null or company_id=1)))
     limit 2`,
    [email],
  );
  if (issuer.rows.length !== 1) {
    return { httpStatus: 403, error: "Penugasan Admin CST tidak aktif atau tidak unik." };
  }
  const actor = await dbQuery(
    `select enabled from public.bizportal_customer_ar_source_actors_dev
       where company_id=1 and role_name='bizportal_customer_invoice_cst_writer_dev'
       limit 2`,
  );
  const actorReady = actor.rows.length === 1 && actor.rows[0].enabled === true;
  const order = await dbQuery(
    `select id,invoice_status,invoice_number from public.sales_documents
       where id=108 and company_id=1
         and doc_number='QA-CST-DEV-OWNER-20261120-001'
       limit 2`,
  );
  const exactOrder = order.rows.length === 1 ? order.rows[0] : null;
  const ready = actorReady && exactOrder?.invoice_status === "to_invoice";
  const blockedMessage = !actorReady
    ? "Sumber AR CST belum diaktifkan melalui jalur DBA yang berwenang."
    : !exactOrder
      ? "Dokumen QA #108 tidak cocok dengan identitas pilot."
      : exactOrder.invoice_status === "invoiced"
        ? "Invoice QA #108 telah tercatat; tidak perlu diterbitkan ulang."
        : "Invoice QA #108 tidak dalam status siap diterbitkan.";
  return {
    httpStatus: 200,
    enabled: true,
    readOnly: true,
    companyId: 1,
    actorReady,
    ready,
    blocked: !ready,
    // This is a status snapshot, not a posting receipt.
    invoiced: 0,
    currentInvoiceStatus: exactOrder?.invoice_status ?? null,
    results: [{invoiceId: 108, status: ready ? "ready" : "blocked",
      ...(!ready ? {message: blockedMessage} : {})}],
  };
}
