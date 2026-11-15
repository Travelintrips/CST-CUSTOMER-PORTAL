/**
 * DEV-only eligibility gate at the existing Customer Portal PO issuance boundary.
 *
 * A self-selected active membership is NOT evidence that a company authorized
 * a buyer to create company-scoped financial commitments. Reuse the approved
 * company-request audit and the existing membership/company tables.
 *
 * No write, migration, notification, or production behavior is introduced.
 */
const positiveId = (value) => {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

function deny(reason) {
  const error = new Error(reason);
  error.statusCode = 409;
  return error;
}

export function corporatePoApprovalGateDevEnabled(env = process.env) {
  return env.APP_ENV?.trim().toLowerCase() === "development"
    && env.CST_CORPORATE_PO_APPROVAL_GATE_DEV === "true";
}

export async function assertDevCorporatePoAffiliation(dbQuery, rfq, env = process.env) {
  if (!corporatePoApprovalGateDevEnabled(env)) return { enabled: false };

  const customerId = positiveId(rfq?.portal_customer_id);
  if (!customerId) throw deny("RFQ belum mempunyai identitas customer terverifikasi.");

  const customer = await dbQuery(
    "select customer_type from public.portal_customers where id=$1 limit 1",
    [customerId],
  );
  const customerType = String(customer.rows[0]?.customer_type ?? "").trim().toLowerCase();
  const companyId = positiveId(rfq?.company_id);

  // Preserve the previously-PASS individual purchase-order path.
  if (customerType === "individual" && companyId == null) {
    return { enabled: true, type: "individual", verified: true };
  }
  if (customerType !== "company" || !companyId) {
    throw deny("RFQ perusahaan belum memiliki identitas perusahaan yang sah.");
  }

  // The Admin approval route records reviewed_by / reviewed_at on an approved
  // request. Existing-company self-selection never generates that approval.
  const proof = await dbQuery(
    `select 1
       from public.portal_company_members member
       join public.portal_company_requests request
         on request.portal_customer_id=member.portal_customer_id
        and request.matched_company_id=member.company_id
        and request.status='approved'
        and request.reviewed_by is not null
        and request.reviewed_at is not null
       join public.companies company on company.id=member.company_id
        and coalesce(company.is_active,true)=true
      where member.portal_customer_id=$1
        and member.company_id=$2
        and member.is_active=true
      limit 1`,
    [customerId, companyId],
  );
  if (!proof.rows[0]) {
    throw deny("Afiliasi perusahaan harus disetujui Admin sebelum PO dibuat.");
  }
  return { enabled: true, type: "company", verified: true };
}


/**
 * DEV-only staged affiliation with an EXISTING canonical company.
 * Reuses portal_company_requests + existing Admin review; never grants active
 * membership through customer self-selection.
 */
export async function stageDevExistingCompanyApproval(dbQuery, customerIdRaw, company, env = process.env) {
  if (!corporatePoApprovalGateDevEnabled(env)) return { enabled: false };
  const customerId = positiveId(customerIdRaw);
  const companyId = positiveId(company?.id);
  const companyName = typeof company?.name === "string" ? company.name.trim() : "";
  if (!customerId || !companyId || !companyName) {
    throw deny("Pemetaan perusahaan tidak valid untuk pengajuan afiliasi.");
  }

  const approved = await dbQuery(
    `select 1
       from public.portal_company_members member
       join public.portal_company_requests request
         on request.portal_customer_id=member.portal_customer_id
        and request.matched_company_id=member.company_id
        and request.status='approved'
        and request.reviewed_by is not null
        and request.reviewed_at is not null
      where member.portal_customer_id=$1
        and member.company_id=$2
        and member.is_active=true
      limit 1`,
    [customerId, companyId],
  );
  if (approved.rows[0]) return { enabled: true, status: "company_mapped" };

  // The requested company NAME comes from the trusted companies table,
  // never from arbitrary client input. Admin must supply matchedCompanyId.
  await dbQuery(
    `insert into public.portal_company_requests
       (portal_customer_id,requested_company_name,requested_registration_number,status,
        matched_company_id,reviewed_by,reviewed_at,created_at,updated_at)
     values ($1,$2,null,'pending',null,null,null,now(),now())
     on conflict (portal_customer_id, lower(requested_company_name)) where status = 'pending'
     do update set
       requested_company_name=excluded.requested_company_name,
       requested_registration_number=null,
       matched_company_id=null,
       status='pending',
       reviewed_by=null,
       reviewed_at=null,
       updated_at=now()`,
    [customerId, companyName],
  );
  // In case an unreviewed prior self-selected membership exists, it must not
  // appear active while the corresponding Admin review is pending.
  await dbQuery(
    `update public.portal_company_members
        set is_active=false, updated_at=now()
      where portal_customer_id=$1 and company_id=$2 and is_active=true`,
    [customerId, companyId],
  );
  return { enabled: true, status: "company_pending" };
}
