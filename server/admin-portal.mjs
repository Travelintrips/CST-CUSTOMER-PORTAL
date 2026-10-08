import { pool, query } from "./db.mjs";
import {
  deleteDocumentObject,
  documentType,
  ocrKtp,
  signedDocumentUrl,
  uploadDocument,
} from "./storage.mjs";
import { createFreightActionToken } from "./freight-operations.mjs";

const TERMINAL_STATUSES = new Set(["completed", "cancelled", "rejected", "expired", "done"]);
const SERVICE_LABELS = {
  marketplace: "Marketplace / RFQ",
  "logistic-order": "Logistics / Customer Order",
  "product-order": "Marketplace / Product Order",
  "service-request": "Pabean / Custom Clearance / Layanan",
  "quote-request": "Request a Quote",
  "air-freight": "Air Freight",
  "ocean-freight": "Ocean / Sea Freight",
};

function numberOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function text(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function jsonValue(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function customerStatus(row) {
  if (row.account_status === "sanctioned") return "sanctioned";
  if (["inactive", "suspended", "blocked", "deleted"].includes(row.account_status)) return "inactive";
  return "active";
}

function customerSource(row) {
  if (row.oauth_provider || row.oauth_id) return "oauth";
  if (String(row.email ?? "").endsWith("@wa.local")) return "wa";
  return "email";
}

function mapCustomer(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    role: row.role,
    source: customerSource(row),
    createdAt: row.created_at,
    accountStatus: customerStatus(row),
    sanctionReason: row.sanction_reason ?? null,
    sanctionUntil: row.sanction_until ?? null,
    avatarUrl: row.avatar_url ?? null,
    profileStatus: row.profile_status ?? "not_started",
    profileAccountType: row.customer_type ?? null,
    profileFullName: row.profile_full_name ?? null,
  };
}

function adminError(ctx, status, message) {
  ctx.sendError(ctx.response, status, message);
}

async function findAdminCustomer(id) {
  const result = await query(
    `select c.id, c.name, c.email, c.phone, c.company, c.role, c.created_at,
            c.oauth_provider, c.oauth_id, c.avatar_url, c.account_status,
            c.sanction_reason, c.sanction_until, c.status_changed_at,
            c.status_changed_by, c.customer_type,
            p.id as profile_id, p.profile_status, p.is_verified,
            p.company_name as profile_company_name, p.pic_name as profile_full_name,
            p.verification_status, p.verification_submitted_at,
            p.verification_notes, p.updated_at as profile_updated_at
       from public.portal_customers c
       left join public.portal_customer_profiles p on p.customer_id = c.id
      where c.id = $1
      limit 1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function handleAdminCustomers(ctx) {
  const { request, response, url } = ctx;
  const idMatch = url.pathname.match(/^\/api\/portal\/admin\/customers\/(\d+)$/);
  if (idMatch && request.method === "GET") {
    const row = await findAdminCustomer(Number(idMatch[1]));
    if (!row) return adminError(ctx, 404, "Customer tidak ditemukan.");
    const [memberships, requests, documents] = await Promise.all([
      query(
        `select m.id, m.company_id, m.buyer_role, m.department, m.cost_center,
                m.approval_level, m.spending_limit, m.is_active,
                coalesce(c.company_name, c.legal_name, c.name) as company_name,
                coalesce(c.company_code, c.code) as company_code
           from public.portal_company_members m
           left join public.companies c on c.id = m.company_id
          where m.portal_customer_id = $1
          order by m.created_at desc`,
        [row.id],
      ),
      query(
        `select r.id, r.requested_company_name, r.requested_registration_number,
                r.status, r.matched_company_id, r.review_note, r.reviewed_at,
                r.created_at, r.updated_at
           from public.portal_company_requests r
          where r.portal_customer_id = $1
          order by r.created_at desc`,
        [row.id],
      ),
      row.profile_id
        ? query(
            `select id, document_type, document_number, file_url, file_name,
                    verification_status, verified_by, verified_at,
                    rejection_reason, expiry_date, uploaded_version, created_at
               from public.customer_verification_documents
              where profile_id = $1
              order by created_at desc`,
            [row.profile_id],
          )
        : Promise.resolve({ rows: [] }),
    ]);
    const item = mapCustomer(row);
    ctx.sendJson(response, 200, {
      ...item,
      oauthProvider: row.oauth_provider ?? null,
      statusChangedAt: row.status_changed_at ?? null,
      statusChangedBy: row.status_changed_by ?? null,
      profile: row.profile_id
        ? {
            id: row.profile_id,
            companyName: row.profile_company_name,
            fullName: row.profile_full_name,
            profileStatus: row.profile_status,
            isVerified: row.is_verified,
            verificationStatus: row.verification_status ?? "DRAFT",
            verificationSubmittedAt: row.verification_submitted_at,
            verificationNotes: row.verification_notes,
            updatedAt: row.profile_updated_at,
          }
        : null,
      companyMemberships: memberships.rows,
      companyRequests: requests.rows,
      verificationDocuments: documents.rows,
    });
    return;
  }

  if (idMatch && request.method === "PATCH") {
    const id = Number(idMatch[1]);
    const body = ctx.body ?? {};
    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const role = text(body.role, "customer");
    const accountStatus = text(body.accountStatus, "active");
    if (!name || !email.includes("@")) return adminError(ctx, 400, "Nama dan email wajib valid.");
    if (!["customer", "vendor", "driver", "employee", "admin"].includes(role)) return adminError(ctx, 400, "Role tidak valid.");
    if (!["active", "inactive", "sanctioned"].includes(accountStatus)) return adminError(ctx, 400, "Status akun tidak valid.");
    if (accountStatus === "sanctioned" && !text(body.sanctionReason)) return adminError(ctx, 400, "Alasan sanksi wajib diisi.");
    const existing = await findAdminCustomer(id);
    if (!existing) return adminError(ctx, 404, "Customer tidak ditemukan.");
    const nextDbStatus = accountStatus;
    const result = await query(
      `update public.portal_customers
          set name = $1, email = $2, phone = $3, company = $4, role = $5,
              account_status = $6, sanction_reason = $7, sanction_until = $8,
              status_changed_at = case when account_status is distinct from $6 then now() else status_changed_at end,
              status_changed_by = case when account_status is distinct from $6 then $9 else status_changed_by end
        where id = $10
        returning id, name, email, phone, company, role, created_at,
                  oauth_provider, oauth_id, avatar_url, account_status,
                  sanction_reason, sanction_until, customer_type`,
      [
        name,
        email,
        text(body.phone) || null,
        text(body.company) || null,
        role,
        nextDbStatus,
        text(body.sanctionReason) || null,
        body.sanctionUntil || null,
        ctx.user.email,
        id,
      ],
    );
    if (!result.rows[0]) return adminError(ctx, 404, "Customer tidak ditemukan.");
    ctx.sendJson(response, 200, mapCustomer({ ...result.rows[0], profile_status: existing.profile_status, profile_full_name: existing.profile_full_name }));
    return;
  }

  if (request.method !== "GET") return adminError(ctx, 405, "Method tidak didukung.");
  const search = text(url.searchParams.get("q"));
  const role = text(url.searchParams.get("role"));
  const accountStatus = text(url.searchParams.get("accountStatus"));
  const result = await query(
    `select c.id, c.name, c.email, c.phone, c.company, c.role, c.created_at,
            c.oauth_provider, c.oauth_id, c.avatar_url, c.account_status,
            c.sanction_reason, c.sanction_until, c.customer_type,
            p.profile_status, p.company_name as profile_company_name,
            p.pic_name as profile_full_name
       from public.portal_customers c
       left join public.portal_customer_profiles p on p.customer_id = c.id
      where ($1 = '' or c.name ilike '%' || $1 || '%' or c.email ilike '%' || $1 || '%'
             or coalesce(c.phone, '') ilike '%' || $1 || '%'
             or coalesce(c.company, '') ilike '%' || $1 || '%')
        and ($2 = '' or c.role = $2)
        and ($3 = '' or coalesce(c.account_status, 'active') = $3)
      order by c.created_at desc
      limit 250`,
    [search, role, accountStatus],
  );
  ctx.sendJson(response, 200, { items: result.rows.map(mapCustomer), total: result.rowCount });
}

async function handleAdminCustomerStats(ctx) {
  const result = await query(
    `select
       count(*)::int as total,
       count(*) filter (where c.role = 'customer')::int as customer,
       count(*) filter (where c.role = 'vendor')::int as vendor,
       count(*) filter (where c.email like '%@wa.local')::int as wa,
       count(*) filter (where coalesce(p.profile_status, 'not_started') in ('incomplete', 'not_started'))::int as profile_incomplete,
       count(*) filter (where p.profile_status = 'pending')::int as profile_pending,
       count(*) filter (where p.profile_status = 'active')::int as profile_active,
       count(*) filter (where coalesce(c.account_status, 'active') = 'active')::int as account_active,
       count(*) filter (where c.account_status = 'inactive')::int as account_inactive,
       count(*) filter (where c.account_status = 'sanctioned')::int as account_sanctioned
       from public.portal_customers c
       left join public.portal_customer_profiles p on p.customer_id = c.id`,
  );
  const row = result.rows[0] ?? {};
  ctx.sendJson(ctx.response, 200, {
    total: Number(row.total ?? 0),
    customer: Number(row.customer ?? 0),
    vendor: Number(row.vendor ?? 0),
    wa: Number(row.wa ?? 0),
    profileIncomplete: Number(row.profile_incomplete ?? 0),
    profilePending: Number(row.profile_pending ?? 0),
    profileActive: Number(row.profile_active ?? 0),
    accountActive: Number(row.account_active ?? 0),
    accountInactive: Number(row.account_inactive ?? 0),
    accountSanctioned: Number(row.account_sanctioned ?? 0),
  });
}

async function handleAdminApprovals(ctx) {
  const { request, response, url } = ctx;
  const idMatch = url.pathname.match(/^\/api\/portal\/admin\/approvals\/(\d+)(?:\/(audit))?$/);
  if (idMatch && request.method === "GET" && idMatch[2] === "audit") {
    const result = await query(
      `select id, customer_id, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at
         from public.onboarding_approvals where id = $1`,
      [Number(idMatch[1])],
    );
    if (!result.rows[0]) return adminError(ctx, 404, "Approval tidak ditemukan.");
    const row = result.rows[0];
    ctx.sendJson(response, 200, {
      data: [{
        action: `onboarding_${row.status}`,
        userEmail: row.reviewed_by,
        createdAt: row.reviewed_at ?? row.updated_at ?? row.created_at,
        newData: { adminNote: row.admin_note, status: row.status },
      }],
    });
    return;
  }
  if (idMatch && request.method === "PATCH") {
    const id = Number(idMatch[1]);
    const body = ctx.body ?? {};
    const status = text(body.status);
    const note = text(body.adminNote) || null;
    if (!["approved", "rejected"].includes(status)) return adminError(ctx, 400, "Status approval tidak valid.");
    if (status === "rejected" && !note) return adminError(ctx, 400, "Alasan penolakan wajib diisi.");

    const client = await pool.connect();
    try {
      await client.query("begin");
      const approval = await client.query(
        `select id, customer_id, account_type, status
           from public.onboarding_approvals
          where id = $1
          for update`,
        [id],
      );
      if (!approval.rows[0]) {
        await client.query("rollback");
        return adminError(ctx, 404, "Approval tidak ditemukan.");
      }

      await client.query(
        `update public.onboarding_approvals
            set status = $1, admin_note = $2, reviewed_by = $3,
                reviewed_at = now(), updated_at = now()
          where id = $4`,
        [status, note, ctx.user.email, id],
      );

      await client.query(
        `update public.portal_customer_profiles
            set profile_status = $1,
                is_verified = $2,
                verification_status = $3,
                verification_notes = $4,
                verified_by = case when $2 then $5 else verified_by end,
                verified_at = case when $2 then coalesce(verified_at, now()) else verified_at end,
                updated_at = now()
          where customer_id = $6`,
        [
          status === "approved" ? "active" : "rejected",
          status === "approved",
          status === "approved" ? "VERIFIED" : "REJECTED",
          note,
          ctx.user.email,
          approval.rows[0].customer_id,
        ],
      );

      if (approval.rows[0].account_type === "vendor") {
        const vendorProfile = await client.query(
          `select vp.id, vp.company_name, vp.service_type, vp.supplier_id,
                  c.email, c.phone, c.name
             from public.vendor_profiles vp
             join public.portal_customers c on c.id = vp.customer_id
            where vp.customer_id = $1
            order by vp.updated_at desc, vp.id desc
            limit 1
            for update of vp`,
          [approval.rows[0].customer_id],
        );
        const vendorRow = vendorProfile.rows[0] ?? null;
        if (!vendorRow) {
          const error = new Error("Profil vendor belum tersedia. Selesaikan onboarding vendor sebelum approval.");
          error.statusCode = 409;
          throw error;
        }

        await client.query(
          `update public.vendor_profiles
              set verification_status = $1,
                  approved_at = case when $1 = 'verified' then coalesce(approved_at, now()) else null end,
                  approval_date = case when $1 = 'verified' then coalesce(approval_date, now()) else null end,
                  updated_at = now()
            where id = $2`,
          [status === "approved" ? "verified" : "rejected", vendorRow.id],
        );

        if (status === "approved") {
          let supplierId = vendorRow.supplier_id == null ? null : Number(vendorRow.supplier_id);
          if (supplierId) {
            const existingSupplier = await client.query(
              "select id from public.suppliers where id = $1 for update",
              [supplierId],
            );
            if (!existingSupplier.rows[0]) supplierId = null;
          }

          if (!supplierId && vendorRow.email) {
            const supplier = await client.query(
              `select id
                 from public.suppliers
                where lower(trim(coalesce(contact_email, ''))) = lower(trim($1))
                order by id
                limit 2
                for update`,
              [vendorRow.email],
            );
            if (supplier.rows.length > 1) {
              const error = new Error("Email vendor terhubung ke lebih dari satu supplier. Perlu audit sebelum approval.");
              error.statusCode = 409;
              throw error;
            }
            supplierId = supplier.rows[0]?.id == null ? null : Number(supplier.rows[0].id);
          }

          if (!supplierId) {
            const createdSupplier = await client.query(
              `insert into public.suppliers
                (name, contact_email, phone, service_type, is_active, status,
                 registration_status, is_verified, verified_at, verified_by,
                 reviewed_by, reviewed_at, onboarding_completed_at, self_submitted,
                 created_at, updated_at)
               values ($1,$2,$3,$4,true,'active','approved',true,now(),$5,$5,now(),now(),true,now(),now())
               returning id`,
              [
                vendorRow.company_name ?? vendorRow.name,
                vendorRow.email ?? null,
                vendorRow.phone ?? null,
                vendorRow.service_type ?? null,
                ctx.user.email,
              ],
            );
            supplierId = Number(createdSupplier.rows[0].id);
          } else {
            await client.query(
              `update public.suppliers
                  set contact_email = coalesce(nullif($1, ''), contact_email),
                      phone = coalesce(nullif($2, ''), phone),
                      service_type = coalesce(nullif($3, ''), service_type),
                      registration_status = 'approved',
                      is_active = true,
                      status = 'active',
                      is_verified = true,
                      verified_at = coalesce(verified_at, now()),
                      verified_by = coalesce(verified_by, $4),
                      reviewed_by = $4,
                      reviewed_at = now(),
                      onboarding_completed_at = coalesce(onboarding_completed_at, now()),
                      self_submitted = true,
                      updated_at = now()
                where id = $5`,
              [
                vendorRow.email ?? "",
                vendorRow.phone ?? "",
                vendorRow.service_type ?? "",
                ctx.user.email,
                supplierId,
              ],
            );
          }

          await client.query(
            `update public.vendor_profiles
                set supplier_id = $1, updated_at = now()
              where id = $2`,
            [supplierId, vendorRow.id],
          );

          const invitation = await client.query(
            `update public.portal_vendor_invitations
                set approved_at = coalesce(approved_at, now())
              where supplier_id = $1
                and status = 'accepted'
              returning id`,
            [supplierId],
          );
          const invitationId = Number(invitation.rows[0]?.id ?? 0);
          const approvalPayload = JSON.stringify({
            audience: "customer",
            resourceType: "vendor_approval",
            resourceId: Number(approval.rows[0].customer_id),
            supplierId,
            invitationId: invitationId || null,
            link: "/vendor-dashboard",
            url: "/vendor-dashboard",
          });
          await client.query(
            `insert into public.portal_customer_notifications
              (portal_customer_id, event_key, type, title, message, payload)
             values ($1,$2,'vendor_approved','Vendor disetujui',
                     'Akun vendor Anda telah disetujui admin dan siap digunakan.', $3::jsonb)
             on conflict (portal_customer_id, event_key) do nothing`,
            [
              approval.rows[0].customer_id,
              invitationId ? `vendor-invitation:${invitationId}:approved` : `vendor-account:${approval.rows[0].customer_id}:approved`,
              approvalPayload,
            ],
          );
          await client.query(
            `insert into public.vendor_notifications
              (vendor_id, type, title, message, payload)
             select $1, 'vendor_approved', 'Vendor disetujui',
                    'Profil vendor Anda telah disetujui admin dan akses Vendor sudah aktif.', $2::jsonb
             where not exists (
               select 1 from public.vendor_notifications
                where vendor_id = $1 and type = 'vendor_approved'
                  and payload->>'resourceId' = $3
             )`,
            [
              approval.rows[0].customer_id,
              approvalPayload,
              String(approval.rows[0].customer_id),
            ],
          );
        }
      }

      await client.query("commit");
      ctx.sendJson(response, 200, { id, status, adminNote: note });
      return;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      if (Number.isInteger(error?.statusCode)) {
        return adminError(ctx, error.statusCode, error.message);
      }
      throw error;
    } finally {
      client.release();
    }
  }
  if (request.method === "GET" && url.pathname === "/api/portal/admin/approvals/stats") {
    const result = await query(
      `select count(*)::int as total,
              count(*) filter (where status = 'pending')::int as pending,
              count(*) filter (where status = 'approved')::int as approved,
              count(*) filter (where status = 'rejected')::int as rejected
         from public.onboarding_approvals`,
    );
    const row = result.rows[0] ?? {};
    ctx.sendJson(response, 200, {
      total: Number(row.total ?? 0), pending: Number(row.pending ?? 0),
      approved: Number(row.approved ?? 0), rejected: Number(row.rejected ?? 0),
    });
    return;
  }
  if (request.method !== "GET") return adminError(ctx, 405, "Method tidak didukung.");
  const status = text(url.searchParams.get("status"));
  const accountType = text(url.searchParams.get("accountType"));
  const result = await query(
    `select a.id, a.customer_id, a.account_type, a.status, a.admin_note,
            a.reviewed_by, a.reviewed_at, a.created_at,
            c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
            p.profile_status, p.pic_name as profile_full_name, p.company_name,
            p.verification_status, p.verification_notes
       from public.onboarding_approvals a
       join public.portal_customers c on c.id = a.customer_id
       left join public.portal_customer_profiles p on p.customer_id = c.id
      where ($1 = '' or a.status = $1)
        and ($2 = '' or a.account_type = $2)
      order by a.created_at desc
      limit 250`,
    [status, accountType],
  );
  ctx.sendJson(response, 200, result.rows.map((row) => ({
    id: Number(row.id),
    customerId: Number(row.customer_id),
    accountType: row.account_type,
    status: row.status,
    adminNote: row.admin_note ?? null,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    userProfile: {
      status: row.profile_status ?? "not_started",
      fullName: row.profile_full_name ?? row.customer_name,
      companyName: row.company_name ?? null,
      verificationStatus: row.verification_status ?? "DRAFT",
    },
    typeProfile: { verificationStatus: row.verification_status ?? "DRAFT", verificationNotes: row.verification_notes ?? null },
  })));
}

async function handleAdminCompanyRequests(ctx) {
  const { request, response, url } = ctx;
  const idMatch = url.pathname.match(/^\/api\/portal\/admin\/company-requests\/(\d+)$/);
  if (request.method === "GET") {
    const where = idMatch ? "and r.id = $1" : "";
    const params = idMatch ? [Number(idMatch[1])] : [];
    const result = await query(
      `select r.id, r.portal_customer_id, r.requested_company_name,
              r.requested_registration_number, r.status, r.matched_company_id,
              r.review_note, r.reviewed_by, r.reviewed_at, r.created_at, r.updated_at,
              c.name as customer_name, c.email as customer_email,
              coalesce(co.company_name, co.legal_name, co.name) as matched_company_name
         from public.portal_company_requests r
         join public.portal_customers c on c.id = r.portal_customer_id
         left join public.companies co on co.id = r.matched_company_id
        where true ${where}
        order by r.created_at desc
        limit 250`,
      params,
    );
    const data = result.rows.map((row) => ({
      id: Number(row.id), customerId: Number(row.portal_customer_id),
      customerName: row.customer_name, customerEmail: row.customer_email,
      requestedCompanyName: row.requested_company_name,
      requestedRegistrationNumber: row.requested_registration_number,
      status: row.status, matchedCompanyId: row.matched_company_id,
      matchedCompanyName: row.matched_company_name, reviewNote: row.review_note,
      reviewedBy: row.reviewed_by, reviewedAt: row.reviewed_at, createdAt: row.created_at,
    }));
    if (idMatch) {
      if (!data[0]) return adminError(ctx, 404, "Company request tidak ditemukan.");
      ctx.sendJson(response, 200, data[0]);
    } else {
      ctx.sendJson(response, 200, { items: data, total: data.length });
    }
    return;
  }
  if (request.method !== "PATCH" || !idMatch) return adminError(ctx, 405, "Method tidak didukung.");
  const id = Number(idMatch[1]);
  const body = ctx.body ?? {};
  const status = text(body.status);
  const matchedCompanyId = body.matchedCompanyId == null ? null : numberOrNull(body.matchedCompanyId);
  if (!["pending", "in_review", "approved", "rejected"].includes(status)) return adminError(ctx, 400, "Status company request tidak valid.");
  if (body.matchedCompanyId != null && matchedCompanyId == null) return adminError(ctx, 400, "Company tidak valid.");
  const requestResult = await query("select * from public.portal_company_requests where id = $1", [id]);
  const current = requestResult.rows[0];
  if (!current) return adminError(ctx, 404, "Company request tidak ditemukan.");
  if (matchedCompanyId != null) {
    const company = await query("select id from public.companies where id = $1 and coalesce(is_active, true) = true", [matchedCompanyId]);
    if (!company.rows[0]) return adminError(ctx, 404, "Company tidak ditemukan.");
  }
  await query(
    `update public.portal_company_requests
        set status = $1, matched_company_id = $2, review_note = $3,
            reviewed_by = $4, reviewed_at = now(), updated_at = now()
      where id = $5`,
    [status, matchedCompanyId, text(body.reviewNote) || null, ctx.user.id, id],
  );
  if (status === "approved" && matchedCompanyId != null) {
    const member = await query(
      "select id from public.portal_company_members where portal_customer_id = $1 and company_id = $2 limit 1",
      [current.portal_customer_id, matchedCompanyId],
    );
    if (member.rows[0]) {
      await query(
        `update public.portal_company_members
            set is_active = true, buyer_role = coalesce($1, buyer_role), updated_at = now()
          where id = $2`,
        [text(body.buyerRole) || null, member.rows[0].id],
      );
    } else {
      await query(
        `insert into public.portal_company_members
          (portal_customer_id, company_id, buyer_role, is_active, invited_by, invited_at, joined_at, created_at, updated_at)
         values ($1, $2, $3, true, $4, now(), now(), now(), now())`,
        [current.portal_customer_id, matchedCompanyId, text(body.buyerRole, "member"), ctx.user.id],
      );
    }
    const canonicalCompany = await query(
      `select coalesce(company_name, legal_name, name) as name
         from public.companies
        where id = $1`,
      [matchedCompanyId],
    );
    await query(
      `update public.portal_customers
          set customer_type = 'company',
              company = coalesce($1, company)
        where id = $2`,
      [canonicalCompany.rows[0]?.name ?? null, current.portal_customer_id],
    );
    await query(
      `update public.portal_customer_profiles
          set profile_status = 'active',
              company_name = coalesce($1, company_name),
              updated_at = now()
        where customer_id = $2`,
      [canonicalCompany.rows[0]?.name ?? null, current.portal_customer_id],
    );
  } else if (status === "rejected") {
    await query(
      `update public.portal_customer_profiles
          set profile_status = 'rejected',
              verification_notes = coalesce($1, verification_notes),
              updated_at = now()
        where customer_id = $2`,
      [text(body.reviewNote) || "Permintaan perusahaan ditolak.", current.portal_customer_id],
    );
  }
  ctx.sendJson(response, 200, { id, status, matchedCompanyId });
}

async function getVerificationState(user) {
  const profileResult = await query(
    `select id, company_name, verification_status, verification_submitted_at,
            verification_expired_at, verification_notes
       from public.portal_customer_profiles
      where customer_id = $1
      order by updated_at desc nulls last, id desc
      limit 1`,
    [user.id],
  );
  const profile = profileResult.rows[0];
  const documents = profile
    ? await query(
        `select id, document_type, document_number, file_url, file_name,
                verification_status, rejection_reason, expiry_date, uploaded_version, created_at
           from public.customer_verification_documents
          where profile_id = $1 order by created_at desc`,
        [profile.id],
      )
    : { rows: [] };
  return {
    profileId: profile?.id ?? null,
    verificationStatus: profile?.verification_status ?? "DRAFT",
    verificationSubmittedAt: profile?.verification_submitted_at ?? null,
    verificationExpiredAt: profile?.verification_expired_at ?? null,
    verificationNotes: profile?.verification_notes ?? null,
    companyName: profile?.company_name ?? user.company ?? null,
    documents: documents.rows.map((row) => ({
      id: Number(row.id), documentType: row.document_type, documentNumber: row.document_number,
      fileUrl: row.file_url, fileName: row.file_name, verificationStatus: row.verification_status,
      rejectionReason: row.rejection_reason, expiryDate: row.expiry_date,
      uploadedVersion: row.uploaded_version ?? 1, createdAt: row.created_at,
    })),
  };
}

async function handleVerification(ctx) {
  const { request, response, url } = ctx;
  if (request.method === "GET" && url.pathname === "/api/customer-verification") {
    ctx.sendJson(response, 200, await getVerificationState(ctx.user));
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/customer-verification/submit") {
    const state = await getVerificationState(ctx.user);
    if (!state.profileId) return adminError(ctx, 409, "Profil customer belum tersedia.");
    if (!state.documents.length) return adminError(ctx, 400, "Minimal satu dokumen wajib diunggah.");
    await query(
      `update public.portal_customer_profiles
          set verification_status = 'PENDING_VERIFICATION',
              verification_submitted_at = now(), profile_status = 'pending',
              verification_notes = null, updated_at = now()
        where id = $1 and customer_id = $2`,
      [state.profileId, ctx.user.id],
    );
    ctx.sendJson(response, 200, await getVerificationState(ctx.user));
    return;
  }
  const docMatch = url.pathname.match(/^\/api\/customer-verification\/signed-url\/(\d+)$/);
  if (request.method === "GET" && docMatch) {
    const result = await query(
      `select d.file_url from public.customer_verification_documents d
         join public.portal_customer_profiles p on p.id = d.profile_id
        where d.id = $1 and p.customer_id = $2`,
      [Number(docMatch[1]), ctx.user.id],
    );
    if (!result.rows[0]) return adminError(ctx, 404, "Dokumen tidak ditemukan.");
    const urlValue = await signedDocumentUrl(result.rows[0].file_url);
    ctx.sendJson(response, 200, { url: urlValue });
    return;
  }
  const documentMatch = url.pathname.match(/^\/api\/customer-verification\/documents(?:\/(\d+))?$/);
  if (documentMatch && ["POST", "PUT", "DELETE"].includes(request.method ?? "")) {
    const documentId = documentMatch[1] ? Number(documentMatch[1]) : null;
    if (request.method === "DELETE") {
      if (!documentId) return adminError(ctx, 400, "ID dokumen tidak valid.");
      const result = await query(
        `select d.id, d.file_url
           from public.customer_verification_documents d
           join public.portal_customer_profiles p on p.id = d.profile_id
          where d.id = $1 and p.customer_id = $2`,
        [documentId, ctx.user.id],
      );
      if (!result.rows[0]) return adminError(ctx, 404, "Dokumen tidak ditemukan.");
      await deleteDocumentObject(result.rows[0].file_url);
      await query("delete from public.customer_verification_documents where id = $1", [documentId]);
      ctx.sendEmpty(response, 204);
      return;
    }
    if (!ctx.form?.file) return adminError(ctx, 400, "File dokumen wajib diunggah.");
    const type = documentType(ctx.form.documentType ?? ctx.form.docType);
    if (request.method === "PUT" && !documentId) return adminError(ctx, 400, "ID dokumen tidak valid.");
    const profileResult = await query(
      `select id from public.portal_customer_profiles
        where customer_id = $1
        order by updated_at desc nulls last, id desc
        limit 1`,
      [ctx.user.id],
    );
    let profileId = profileResult.rows[0]?.id;
    if (!profileId) {
      const created = await query(
        `insert into public.portal_customer_profiles (customer_id, profile_status, updated_at)
         values ($1, 'incomplete', now())
         returning id`,
        [ctx.user.id],
      );
      profileId = created.rows[0]?.id;
    }
    if (!profileId) return adminError(ctx, 409, "Profil customer belum tersedia.");

    let existing = null;
    if (documentId) {
      const result = await query(
        `select d.id, d.file_url, d.document_type, d.uploaded_version
           from public.customer_verification_documents d
           join public.portal_customer_profiles p on p.id = d.profile_id
          where d.id = $1 and p.customer_id = $2`,
        [documentId, ctx.user.id],
      );
      existing = result.rows[0] ?? null;
      if (!existing) return adminError(ctx, 404, "Dokumen tidak ditemukan.");
    } else {
      const result = await query(
        `select id, file_url, document_type
           from public.customer_verification_documents
          where profile_id = $1 and document_type = $2
          order by uploaded_version desc nulls last, id desc
          limit 1`,
        [profileId, type],
      );
      existing = result.rows[0] ?? null;
    }

    const companyResult = await query(
      `select company_id
         from public.portal_company_members
        where portal_customer_id = $1 and is_active = true
        order by created_at desc, id desc
        limit 1`,
      [ctx.user.id],
    );
    const companyId = companyResult.rows[0]?.company_id ?? null;
    const uploaded = await uploadDocument({
      customerId: ctx.user.id,
      companyId,
      documentType: type,
      file: ctx.form.file,
    });

    let savedId;
    let savedVersion;
    try {
      if (existing) {
        const updated = await query(
          `update public.customer_verification_documents
              set document_type = $1, file_url = $2, file_name = $3,
                  verification_status = 'PENDING', rejection_reason = null,
                  uploaded_version = coalesce(uploaded_version, 0) + 1
            where id = $4
            returning id, uploaded_version`,
          [type, uploaded.path, uploaded.fileName, existing.id],
        );
        savedId = updated.rows[0]?.id;
        savedVersion = updated.rows[0]?.uploaded_version;
      } else {
        const inserted = await query(
          `insert into public.customer_verification_documents
             (profile_id, document_type, file_url, file_name,
              verification_status, uploaded_version, created_at)
           values ($1, $2, $3, $4, 'PENDING', 1, now())
           returning id, uploaded_version`,
          [profileId, type, uploaded.path, uploaded.fileName],
        );
        savedId = inserted.rows[0]?.id;
        savedVersion = inserted.rows[0]?.uploaded_version;
      }
      if (!savedId) throw new Error("Dokumen tidak tersimpan.");
    } catch (error) {
      await deleteDocumentObject(uploaded.path).catch(() => {});
      throw error;
    }

    if (existing?.file_url && existing.file_url !== uploaded.path) {
      await deleteDocumentObject(existing.file_url).catch((error) => {
        console.warn("[customer-portal-api] old document cleanup failed", error?.message ?? error);
      });
    }
    const signedUrl = await signedDocumentUrl(uploaded.path);
    ctx.sendJson(response, 200, {
      ok: true,
      id: Number(savedId),
      url: signedUrl,
      storagePath: uploaded.path,
      documentType: type,
      uploadedVersion: Number(savedVersion ?? 1),
    });
    return;
  }
  return adminError(ctx, 404, "Route verification tidak tersedia.");
}

async function handleDocumentUpload(ctx) {
  if (ctx.request.method !== "POST") return adminError(ctx, 405, "Method tidak didukung.");
  if (!ctx.form?.file) return adminError(ctx, 400, "File dokumen wajib diunggah.");
  const type = documentType(ctx.form.docType);
  const profileResult = await query(
    `select id from public.portal_customer_profiles
      where customer_id = $1
      order by updated_at desc nulls last, id desc
      limit 1`,
    [ctx.user.id],
  );
  let profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    const created = await query(
      `insert into public.portal_customer_profiles (customer_id, profile_status, updated_at)
       values ($1, 'incomplete', now())
       returning id`,
      [ctx.user.id],
    );
    profileId = created.rows[0]?.id;
  }
  if (!profileId) return adminError(ctx, 409, "Profil customer belum tersedia.");
  const companyResult = await query(
    `select company_id
       from public.portal_company_members
      where portal_customer_id = $1 and is_active = true
      order by created_at desc, id desc
      limit 1`,
    [ctx.user.id],
  );
  const uploaded = await uploadDocument({
    customerId: ctx.user.id,
    companyId: companyResult.rows[0]?.company_id ?? null,
    documentType: type,
    file: ctx.form.file,
  });
  const existing = await query(
    `select id, file_url, uploaded_version
       from public.customer_verification_documents
      where profile_id = $1 and document_type = $2
      order by uploaded_version desc nulls last, id desc
      limit 1`,
    [profileId, type],
  );
  let documentId;
  let version;
  try {
    if (existing.rows[0]) {
      const updated = await query(
        `update public.customer_verification_documents
            set file_url = $1, file_name = $2, verification_status = 'PENDING',
                rejection_reason = null, uploaded_version = coalesce(uploaded_version, 0) + 1
          where id = $3
          returning id, uploaded_version`,
        [uploaded.path, uploaded.fileName, existing.rows[0].id],
      );
      documentId = updated.rows[0]?.id;
      version = updated.rows[0]?.uploaded_version;
    } else {
      const inserted = await query(
        `insert into public.customer_verification_documents
           (profile_id, document_type, file_url, file_name,
            verification_status, uploaded_version, created_at)
         values ($1, $2, $3, $4, 'PENDING', 1, now())
         returning id, uploaded_version`,
        [profileId, type, uploaded.path, uploaded.fileName],
      );
      documentId = inserted.rows[0]?.id;
      version = inserted.rows[0]?.uploaded_version;
    }
    if (!documentId) throw new Error("Dokumen tidak tersimpan.");
  } catch (error) {
    await deleteDocumentObject(uploaded.path).catch(() => {});
    throw error;
  }
  if (existing.rows[0]?.file_url && existing.rows[0].file_url !== uploaded.path) {
    await deleteDocumentObject(existing.rows[0].file_url).catch((error) => {
      console.warn("[customer-portal-api] old onboarding document cleanup failed", error?.message ?? error);
    });
  }
  ctx.sendJson(ctx.response, 200, {
    ok: true,
    id: Number(documentId),
    url: await signedDocumentUrl(uploaded.path),
    storagePath: uploaded.path,
    documentType: type,
    uploadedVersion: Number(version ?? 1),
  });
}

async function handleKtpOcr(ctx) {
  if (ctx.request.method !== "POST") return adminError(ctx, 405, "Method tidak didukung.");
  const data = await ocrKtp(ctx.form?.file);
  ctx.sendJson(ctx.response, 200, { ok: true, data });
}

async function getOrganizationContext(user, dbQuery = query) {
  const [memberships, requests] = await Promise.all([
    dbQuery(
      `select m.company_id, m.buyer_role, m.department, m.cost_center,
              m.approval_level, m.spending_limit,
              coalesce(c.company_name, c.legal_name, c.name) as company_name,
              coalesce(c.company_code, c.code) as company_code
         from public.portal_company_members m
         join public.companies c on c.id = m.company_id
        where m.portal_customer_id = $1 and m.is_active = true
        order by m.created_at desc`,
      [user.id],
    ),
    dbQuery(
      `select requested_company_name, requested_registration_number, status,
              matched_company_id, created_at
         from public.portal_company_requests
        where portal_customer_id = $1 and status in ('pending', 'submitted', 'in_review')
        order by created_at desc limit 1`,
      [user.id],
    ),
  ]);
  const member = memberships.rows[0];
  const pending = requests.rows[0];
  const customerType = user.customer_type === "company" ? "company" : "individual";
  const company = member ? {
    id: Number(member.company_id),
    name: member.company_name,
    code: member.company_code ?? null,
  } : null;
  return {
    status: member ? "company_mapped" : pending ? "company_pending" : customerType === "individual" ? "individual" : "company_unresolved",
    customerType, companyId: company?.id ?? null, company,
    activeMemberships: memberships.rows.map((row) => ({
      companyId: Number(row.company_id), buyerRole: row.buyer_role,
      department: row.department ?? null, costCenter: row.cost_center ?? null,
      approvalLevel: row.approval_level ?? null, spendingLimit: row.spending_limit ?? null,
    })),
    pendingRequest: pending ? {
      requestedCompanyName: pending.requested_company_name,
      requestedRegistrationNumber: pending.requested_registration_number ?? null,
      status: pending.status, matchedCompanyId: pending.matched_company_id ?? null,
      createdAt: pending.created_at,
    } : null,
  };
}

async function applyOrganizationSelection(user, body, dbQuery = query, options = {}) {
  const customerType = text(body.customerType);
  const companyId = body.companyId == null ? null : numberOrNull(body.companyId);
  const requestedCompanyName = text(body.requestedCompanyName);
  const requestedRegistrationNumber = text(body.requestedRegistrationNumber) || null;

  if (!["individual", "company"].includes(customerType)) {
    const error = new Error("Tipe customer tidak valid.");
    error.statusCode = 400;
    throw error;
  }
  if (customerType === "individual" && (companyId != null || requestedCompanyName)) {
    const error = new Error("Customer perorangan tidak boleh memiliki konteks perusahaan.");
    error.statusCode = 400;
    throw error;
  }
  if (customerType === "company" && companyId == null && !requestedCompanyName) {
    const error = new Error("Pilih perusahaan canonical atau isi nama perusahaan baru.");
    error.statusCode = 400;
    throw error;
  }
  if (body.companyId != null && companyId == null) {
    const error = new Error("Company tidak valid.");
    error.statusCode = 400;
    throw error;
  }
  if (companyId != null && requestedCompanyName) {
    const error = new Error("Pilih perusahaan canonical atau ajukan perusahaan baru, bukan keduanya.");
    error.statusCode = 400;
    throw error;
  }

  let company = null;
  if (companyId != null) {
    const result = await dbQuery(
      `select id, coalesce(company_name, legal_name, name) as name,
              coalesce(company_code, code) as code
         from public.companies
        where id = $1 and coalesce(is_active, true) = true
        limit 1`,
      [companyId],
    );
    company = result.rows[0] ?? null;
    if (!company) {
      const error = new Error("Company tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }
  }

  const profileStatus = customerType === "company" && requestedCompanyName ? "pending" : "active";
  // The selected canonical company is an organization membership/affiliation,
  // not the customer's own company identity. Only a newly requested company
  // may set the customer company name. Existing-company membership must leave
  // the registered customer company untouched.
  const identityCompanyName =
    customerType === "company" && requestedCompanyName
      ? requestedCompanyName
      : null;
  await dbQuery(
    `update public.portal_customers
        set customer_type = $1,
            company = case
              when $1 = 'individual' then null
              when $2 is not null then $2
              else company
            end
      where id = $3`,
    [
      customerType,
      identityCompanyName,
      user.id,
    ],
  );

  if (companyId != null) {
    await dbQuery(
      `insert into public.portal_company_members
        (portal_customer_id, company_id, buyer_role, is_active, invited_by, invited_at, joined_at, created_at, updated_at)
       values ($1, $2, 'requester', true, $1, now(), now(), now(), now())
       on conflict (portal_customer_id, company_id)
       do update set
         is_active = true,
         joined_at = coalesce(portal_company_members.joined_at, now()),
         updated_at = now()`,
      [user.id, companyId],
    );
  } else {
    await dbQuery(
      `update public.portal_company_members
          set is_active = false, updated_at = now()
        where portal_customer_id = $1 and is_active = true`,
      [user.id],
    );
  }

  if (requestedCompanyName) {
    await dbQuery(
      `insert into public.portal_company_requests
        (portal_customer_id, requested_company_name, requested_registration_number, status, created_at, updated_at)
       values ($1, $2, $3, 'pending', now(), now())
       on conflict (portal_customer_id)
         where status in ('pending', 'submitted', 'in_review')
       do update set
         requested_company_name = excluded.requested_company_name,
         requested_registration_number = excluded.requested_registration_number,
         status = 'pending',
         reviewed_by = null,
         reviewed_at = null,
         updated_at = now()`,
      [user.id, requestedCompanyName, requestedRegistrationNumber],
    );
  }

  await dbQuery(
    `insert into public.portal_customer_profiles
      (customer_id, company_name, profile_status, updated_at)
     values ($1, $2, $3, now())
     on conflict (customer_id) where customer_id is not null
     do update set
       company_name = case
         when $4 = 'individual' then null
         else coalesce(excluded.company_name, portal_customer_profiles.company_name)
       end,
       profile_status = excluded.profile_status,
       updated_at = now()`,
    [user.id, identityCompanyName, profileStatus, customerType],
  );
  if (options.resolveContext === false) {
    return {
      status: profileStatus === "pending" ? "company_pending" : customerType === "individual" ? "individual" : "company_mapped",
      customerType,
      companyId: company?.id ?? null,
      company: company ? { id: Number(company.id), name: company.name, code: company.code ?? null } : null,
    };
  }
  return getOrganizationContext({ ...user, customer_type: customerType, company: company?.name ?? requestedCompanyName ?? null }, dbQuery);
}

async function handleOrganizationMutation(ctx) {
  if (!["PUT", "PATCH"].includes(ctx.request.method)) return adminError(ctx, 405, "Method tidak didukung.");
  try {
    const context = await applyOrganizationSelection(ctx.user, ctx.body ?? {});
    ctx.sendJson(ctx.response, 200, { context });
  } catch (error) {
    return adminError(ctx, error.statusCode ?? 500, error.message ?? "Gagal menyimpan konteks organisasi.");
  }
}

async function handleOnboardingComplete(ctx) {
  if (ctx.request.method !== "POST") return adminError(ctx, 405, "Method tidak didukung.");
  const body = ctx.body ?? {};
  const accountType = text(body.accountType);
  const fullName = text(body.fullName);
  const phone = text(body.phone) || null;
  const ktpAddress = text(body.address) || null;
  const companyAddress = text(body.companyAddress) || null;
  if (!["customer", "vendor", "driver", "employee"].includes(accountType)) {
    return adminError(ctx, 400, "Tipe akun tidak valid.");
  }
  if (
    ["customer", "vendor", "driver", "employee"].includes(ctx.user.role)
    && accountType !== ctx.user.role
  ) {
    return adminError(
      ctx,
      403,
      "Tipe akun tidak dapat diubah melalui onboarding. Hubungi admin untuk perubahan role.",
    );
  }
  if (!fullName || fullName.length < 3 || !phone || !ktpAddress || ktpAddress.length < 10) {
    return adminError(ctx, 400, "Nama, nomor telepon, dan alamat sesuai KTP wajib diisi.");
  }

  const customerType = accountType === "customer" ? text(body.customerType) : null;
  if (accountType === "customer" && !["individual", "company"].includes(customerType)) {
    return adminError(ctx, 400, "Tipe customer wajib dipilih.");
  }

  const vendor = body.vendor && typeof body.vendor === "object" ? body.vendor : {};
  const employee = body.employee && typeof body.employee === "object" ? body.employee : {};
  const driver = body.driver && typeof body.driver === "object" ? body.driver : {};

  if (["customer", "vendor"].includes(accountType) && !text(body.ktpUrl)) {
    return adminError(ctx, 400, "KTP wajib diunggah untuk menyelesaikan pendaftaran.");
  }

  if (accountType === "customer" && customerType === "company") {
    if (!text(ctx.user.company)) {
      return adminError(ctx, 400, "Nama perusahaan customer harus berasal dari data registrasi.");
    }
    if (!companyAddress || companyAddress.length < 10) {
      return adminError(ctx, 400, "Alamat perusahaan wajib diisi minimal 10 karakter.");
    }
    const companyId = Number(body.companyId);
    const hasExistingCompany = Number.isInteger(companyId) && companyId > 0;
    const requestedCompanyName = text(body.requestedCompanyName);
    const requestedRegistrationNumber = text(body.requestedRegistrationNumber);
    if (!hasExistingCompany && (!requestedCompanyName || !requestedRegistrationNumber)) {
      return adminError(ctx, 400, "Nama perusahaan dan NIB / NPWP wajib diisi untuk perusahaan baru.");
    }
  }

  if (accountType === "vendor") {
    if (
      !text(vendor.companyName)
      || !text(vendor.nib)
      || !text(vendor.serviceType)
      || !text(vendor.legalityDocUrl)
    ) {
      return adminError(ctx, 400, "Nama perusahaan, NIB, jenis layanan, dan dokumen legalitas vendor wajib diisi.");
    }
    if (!companyAddress || companyAddress.length < 10) {
      return adminError(ctx, 400, "Alamat perusahaan vendor wajib diisi.");
    }
  }
  const profileCompanyName = accountType === "customer"
    ? text(ctx.user.company) || null
    : text(vendor.companyName || employee.companyName) || null;
  const storedCompanyAddress =
    accountType === "customer" && customerType === "company"
      ? companyAddress
      : accountType === "vendor"
        ? companyAddress
        : null;
  const profileStatus = accountType === "customer" && body.requestedCompanyName
    ? "pending"
    : accountType === "customer"
      ? "active"
      : "pending";

  const client = await pool.connect();
  const dbQuery = client.query.bind(client);
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1)", [Number(ctx.user.id)]);

    const lockedUser = await dbQuery(
      `select id, email, role, account_status
         from public.portal_customers
        where id = $1
        for update`,
      [ctx.user.id],
    );
    if (!lockedUser.rows[0]) {
      const error = new Error("Akun portal tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }

    const phoneOwner = await dbQuery(
      `select id
         from public.portal_customers
        where id <> $1
          and (
            case
              when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') like '0%'
                then '62' || substr(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 2)
              when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') like '8%'
                then '62' || regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
              else regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
            end
          ) = (
            case
              when regexp_replace(coalesce($2, ''), '[^0-9]', '', 'g') like '0%'
                then '62' || substr(regexp_replace(coalesce($2, ''), '[^0-9]', '', 'g'), 2)
              when regexp_replace(coalesce($2, ''), '[^0-9]', '', 'g') like '8%'
                then '62' || regexp_replace(coalesce($2, ''), '[^0-9]', '', 'g')
              else regexp_replace(coalesce($2, ''), '[^0-9]', '', 'g')
            end
          )
        limit 1`,
      [ctx.user.id, phone],
    );
    if (phoneOwner.rows[0]) {
      const error = new Error("Nomor HP / WhatsApp ini sudah digunakan oleh akun lain. Gunakan nomor lain atau login ke akun yang sudah terdaftar.");
      error.statusCode = 409;
      throw error;
    }

    await dbQuery(
      `update public.portal_customers
          set name = $1, phone = $2, role = $3,
              customer_type = case when $3 = 'customer' then $4 else null end,
              company = case when $3 = 'customer' then coalesce($5, company) else $5 end
        where id = $6`,
      [fullName, phone, accountType, customerType, profileCompanyName, ctx.user.id],
    );

    const profileValues = [
      profileCompanyName,
      storedCompanyAddress,
      ktpAddress,
      fullName,
      phone,
      text(vendor.legalityDocUrl) || null,
      text(body.ktpUrl) || null,
      JSON.stringify({ accountType, driver, employee, ocrData: body.ocrData ?? null }),
      profileStatus,
    ];
    await dbQuery(
      `insert into public.portal_customer_profiles
        (customer_id, company_name, company_address, ktp_address, pic_name, pic_whatsapp,
         legal_doc_url, ktp_pic_url, additional_notes, profile_status, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
       on conflict (customer_id) where customer_id is not null
       do update set
         company_name = coalesce(excluded.company_name, portal_customer_profiles.company_name),
         company_address = coalesce(excluded.company_address, portal_customer_profiles.company_address),
         ktp_address = coalesce(excluded.ktp_address, portal_customer_profiles.ktp_address),
         pic_name = coalesce(excluded.pic_name, portal_customer_profiles.pic_name),
         pic_whatsapp = coalesce(excluded.pic_whatsapp, portal_customer_profiles.pic_whatsapp),
         legal_doc_url = coalesce(excluded.legal_doc_url, portal_customer_profiles.legal_doc_url),
         ktp_pic_url = coalesce(excluded.ktp_pic_url, portal_customer_profiles.ktp_pic_url),
         additional_notes = coalesce(excluded.additional_notes, portal_customer_profiles.additional_notes),
         profile_status = excluded.profile_status,
         updated_at = now()`,
      [ctx.user.id, ...profileValues],
    );

    if (accountType === "vendor") {
      const vendorValues = [
        text(vendor.companyName) || profileCompanyName,
        text(vendor.nib) || null,
        text(vendor.npwp) || null,
        text(vendor.serviceType) || null,
        text(vendor.legalityDocUrl) || null,
        fullName,
        phone,
        lockedUser.rows[0].email ?? ctx.user.email ?? null,
        companyAddress,
      ];
      const vendorProfileResult = await dbQuery(
        `insert into public.vendor_profiles
          (customer_id, company_name, nib, npwp, service_type, legality_doc_url,
           pic_name, phone, whatsapp, email, full_address, verification_status,
           created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,'pending',now(),now())
         on conflict (customer_id)
         do update set
           company_name = coalesce(excluded.company_name, vendor_profiles.company_name),
           nib = coalesce(excluded.nib, vendor_profiles.nib),
           npwp = coalesce(excluded.npwp, vendor_profiles.npwp),
           service_type = coalesce(excluded.service_type, vendor_profiles.service_type),
           legality_doc_url = coalesce(excluded.legality_doc_url, vendor_profiles.legality_doc_url),
           pic_name = coalesce(excluded.pic_name, vendor_profiles.pic_name),
           phone = coalesce(excluded.phone, vendor_profiles.phone),
           whatsapp = coalesce(excluded.whatsapp, vendor_profiles.whatsapp),
           email = coalesce(excluded.email, vendor_profiles.email),
           full_address = coalesce(excluded.full_address, vendor_profiles.full_address),
           verification_status = 'pending',
           approved_at = null,
           approval_date = null,
           updated_at = now()
         returning id, supplier_id`,
        [ctx.user.id, ...vendorValues],
      );

      // A vendor company and its supplier master represent the same business
      // entity. Create/reuse the supplier in a pending/inactive state at
      // onboarding time so the vendor can prepare draft catalog items before
      // approval without being transaction-ready.
      let pendingSupplierId = vendorProfileResult.rows[0]?.supplier_id == null
        ? null
        : Number(vendorProfileResult.rows[0].supplier_id);
      if (!pendingSupplierId) {
        const vendorEmail = String(lockedUser.rows[0].email ?? ctx.user.email ?? "").trim().toLowerCase();
        const vendorPhone = String(phone ?? "").replace(/[^0-9]/g, "");
        const supplierMatch = await dbQuery(
          `select id
             from public.suppliers
            where ($1 <> '' and lower(trim(coalesce(contact_email, ''))) = $1)
               or ($2 <> '' and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = $2)
            order by id
            limit 2
            for update`,
          [vendorEmail, vendorPhone],
        );
        if (supplierMatch.rows.length > 1) {
          const error = new Error("Data vendor cocok dengan lebih dari satu supplier. Perlu audit sebelum onboarding dilanjutkan.");
          error.statusCode = 409;
          throw error;
        }
        pendingSupplierId = supplierMatch.rows[0]?.id == null ? null : Number(supplierMatch.rows[0].id);
        if (!pendingSupplierId) {
          const createdSupplier = await dbQuery(
            `insert into public.suppliers
              (name, contact_email, phone, portal_phone, contact_person, service_type,
               address, office_address,
               is_active, registration_status, self_submitted, status, is_verified,
               marketplace_status, created_at, updated_at)
             values ($1,$2,$3,$3,$4,$5,$6,$6,false,'pending',true,'pending',false,'draft',now(),now())
             returning id`,
            [
              text(vendor.companyName) || profileCompanyName,
              vendorEmail || null,
              phone || null,
              fullName,
              text(vendor.serviceType) || null,
              companyAddress,
            ],
          );
          pendingSupplierId = Number(createdSupplier.rows[0].id);
        } else {
          await dbQuery(
            `update public.suppliers
                set name = coalesce(nullif($1, ''), name),
                    contact_email = coalesce(nullif($2, ''), contact_email),
                    phone = coalesce(nullif($3, ''), phone),
                    portal_phone = coalesce(nullif($3, ''), portal_phone),
                    contact_person = coalesce(nullif($4, ''), contact_person),
                    service_type = coalesce(nullif($5, ''), service_type),
                    address = coalesce(nullif($6, ''), address),
                    office_address = coalesce(nullif($6, ''), office_address),
                    self_submitted = true,
                    updated_at = now()
              where id = $7`,
            [
              text(vendor.companyName) || profileCompanyName || "",
              vendorEmail,
              phone || "",
              fullName,
              text(vendor.serviceType) || "",
              companyAddress || "",
              pendingSupplierId,
            ],
          );
        }
        await dbQuery(
          `update public.vendor_profiles
              set supplier_id = $1, updated_at = now()
            where id = $2`,
          [pendingSupplierId, vendorProfileResult.rows[0].id],
        );
      }
    }

    let organization = null;
    if (accountType === "customer") {
      if (customerType === "company" && Number.isInteger(Number(body.companyId)) && Number(body.companyId) > 0) {
        const membershipCompanyId = Number(body.companyId);
        const membershipCompany = await dbQuery(
          `select id, coalesce(company_name, legal_name, name) as name,
                  coalesce(company_code, code) as code
             from public.companies
            where id = $1 and coalesce(is_active, true) = true
            limit 1`,
          [membershipCompanyId],
        );
        const selectedMembership = membershipCompany.rows[0] ?? null;
        if (!selectedMembership) {
          const error = new Error("Membership / afiliasi yang dipilih tidak ditemukan.");
          error.statusCode = 404;
          throw error;
        }

        await dbQuery(
          `insert into public.portal_company_members
            (portal_customer_id, company_id, buyer_role, is_active, invited_by, invited_at, joined_at, created_at, updated_at)
           values ($1, $2, 'requester', true, $1, now(), now(), now(), now())
           on conflict (portal_customer_id, company_id)
           do update set
             is_active = true,
             joined_at = coalesce(portal_company_members.joined_at, now()),
             updated_at = now()`,
          [ctx.user.id, membershipCompanyId],
        );
        await dbQuery(
          `update public.portal_company_members
              set is_active = false, updated_at = now()
            where portal_customer_id = $1
              and company_id <> $2
              and is_active = true`,
          [ctx.user.id, membershipCompanyId],
        );

        organization = {
          status: "company_mapped",
          customerType: "company",
          companyId: Number(selectedMembership.id),
          company: {
            id: Number(selectedMembership.id),
            name: selectedMembership.name,
            code: selectedMembership.code ?? null,
          },
        };
      } else {
        organization = await applyOrganizationSelection(
          ctx.user,
          {
            customerType,
            companyId: body.companyId,
            requestedCompanyName: body.requestedCompanyName,
            requestedRegistrationNumber: body.requestedRegistrationNumber,
          },
          dbQuery,
          { resolveContext: false },
        );
      }
    } else {
      await dbQuery(
        `insert into public.onboarding_approvals
          (customer_id, account_type, status, created_at, updated_at)
         values ($1, $2, 'pending', now(), now())
         on conflict (customer_id) where status = 'pending'
         do update set
           account_type = excluded.account_type,
           updated_at = now()`,
        [ctx.user.id, accountType],
      );
    }

    const status = accountType === "customer" && organization?.status === "company_pending"
      ? "company_pending"
      : accountType === "customer"
        ? "active"
        : "pending";

    await client.query("commit");
    ctx.sendJson(ctx.response, 200, { ok: true, status, context: organization });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error("[portal-onboarding] complete failed", {
      customerId: ctx.user?.id ?? null,
      accountType,
      customerType,
      companyId: body.companyId ?? null,
      code: error?.code ?? null,
      constraint: error?.constraint ?? null,
      message: error?.message ?? String(error),
    });
    if (Number.isInteger(error?.statusCode)) {
      return adminError(ctx, error.statusCode, error.message);
    }
    if (error?.code === "23505" && error?.constraint === "portal_customers_phone_normalized_unique_idx") {
      return adminError(
        ctx,
        409,
        "Nomor HP / WhatsApp ini sudah digunakan oleh akun lain. Gunakan nomor lain atau login ke akun yang sudah terdaftar.",
      );
    }
    return adminError(ctx, 500, "Gagal menyimpan profil di server. Silakan coba lagi.");
  } finally {
    client.release();
  }
}

async function handleOnboardingStatus(ctx) {
  const approval = await query(
    `select status, admin_note from public.onboarding_approvals
      where customer_id = $1 order by created_at desc limit 1`,
    [ctx.user.id],
  );
  const profile = await query(
    "select profile_status, verification_status, verification_notes from public.portal_customer_profiles where customer_id = $1 limit 1",
    [ctx.user.id],
  );
  const organization = await getOrganizationContext(ctx.user);
  const approvalRow = approval.rows[0];
  const profileRow = profile.rows[0];
  let status =
    profileRow?.profile_status === "incomplete" || ctx.user.account_status === "inactive"
      ? "incomplete"
      : profileRow?.profile_status === "pending"
        ? "pending"
        : "active";
  if (approvalRow?.status === "pending") status = "pending";
  if (approvalRow?.status === "rejected" || profileRow?.profile_status === "rejected") status = "rejected";
  if (approvalRow?.status === "approved" && profileRow?.profile_status === "active") status = "active";
  if (organization.status === "company_pending") status = "company_pending";
  ctx.sendJson(ctx.response, 200, {
    status, accountType: ctx.user.role, customerType: ctx.user.customer_type ?? null,
    rejectionReason: approvalRow?.status === "rejected" ? approvalRow.admin_note : profileRow?.verification_notes ?? null,
    customerContext: organization,
  });
}

function customerFields(row) {
  const name = row.customer_name ?? row.buyer_name ?? row.name ?? "Guest";
  const email = row.customer_email ?? row.buyer_email ?? row.email ?? null;
  const phone = row.customer_phone ?? row.buyer_phone ?? row.phone ?? null;
  const company = row.customer_company ?? row.buyer_company ?? row.company ?? null;
  return {
    name, email, phone, company,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    customer_company: company,
  };
}

function actionList(row) {
  const status = String(row.status ?? "").toLowerCase();
  const actions = [];
  if (!TERMINAL_STATUSES.has(status)) {
    if (["new order", "new_order", "submitted", "pending", "pending_review", "in_review", "requested", "waiting_rate"].includes(status)) {
      actions.push("approve", "request_revision", "reject");
    }
  }
  if (row.customer_phone || row.buyer_phone || row.phone) actions.push("contact");
  return [...new Set(actions)];
}

async function safeServiceQuery(source, sql, params = []) {
  try {
    return await query(sql, params);
  } catch (error) {
    console.error("[admin-service-operations] source query failed", {
      source,
      code: error?.code ?? null,
      message: error?.message ?? String(error),
    });
    return { rows: [], rowCount: 0 };
  }
}

async function loadServiceRows() {
  const [rfqs, logistic, products, serviceRequests, quickQuotes, airFreight, oceanFreight] = await Promise.all([
    safeServiceQuery("marketplace", 
      `select r.id, r.rfq_number, r.status, r.approval_status,
              coalesce(r.buyer_name, c.name) as buyer_name,
              coalesce(r.buyer_email, c.email) as buyer_email,
              coalesce(r.buyer_phone, c.phone) as buyer_phone,
              coalesce(r.buyer_company, p.company_name, c.company) as buyer_company,
              c.customer_type, c.role as customer_role,
              r.delivery_address, r.required_delivery_date,
              r.company_id, r.portal_customer_id, r.created_at, r.updated_at, r.notes
         from public.mkt_rfqs r
         left join public.portal_customers c on c.id = r.portal_customer_id
         left join lateral (
           select company_name
             from public.portal_customer_profiles p
            where p.customer_id = c.id
            order by p.updated_at desc nulls last, p.id desc
            limit 1
         ) p on true
        order by r.created_at desc
        limit 500`,
    ),
    safeServiceQuery("logistic-order", 
      `select id, order_number, status, operational_status, admin_approval_status,
              customer_name, email, phone, company_name, company_id, portal_customer_id,
              origin, destination, created_at, updated_at, notes,
              final_selling_price, quotation_sent_at, customer_quote_status,
              terms_conditions, quote_notes, payment_status, payment_proof_url, grand_total
         from public.logistic_orders order by created_at desc limit 500`,
    ),
    safeServiceQuery("product-order", 
      `select id, order_number, status, customer_name, email, phone, company_id,
              portal_customer_id, created_at, updated_at, notes, shipping_address,
              vendor_name_selected, vendor_quoted_price
         from public.portal_product_orders order by created_at desc limit 500`,
    ),
    safeServiceQuery("service-request", 
      `select id, request_number, status, customer_name, customer_email, customer_phone,
              customer_company, company_id, portal_customer_id, request_type, trade_type,
              notes, admin_notes, created_at, updated_at
         from public.customer_service_requests order by created_at desc limit 500`,
    ),
    safeServiceQuery("quote-request", 
      `select id, quote_number, status, name, email, phone, company, service_category,
              origin, destination, description, created_at, updated_at, admin_notes
         from public.portal_quick_quotes order by created_at desc limit 500`,
    ),
    safeServiceQuery("air-freight", 
      `select id, order_number, status, tracking_status, customer_name, customer_email,
              customer_phone, customer_company, company_id, portal_customer_id,
              origin_airport, destination_airport, estimated_price_idr, final_price_idr,
              grand_total, pricing_breakdown, notes, created_at, updated_at
         from public.air_freight_orders
        order by created_at desc limit 500`,
    ),
    safeServiceQuery("ocean-freight", 
      `select id, order_number, status, tracking_status, customer_name, customer_email,
              customer_phone, company_id, portal_customer_id,
              origin_port, destination_port, estimated_price_idr, final_price_idr,
              grand_total, pricing_breakdown, notes, created_at, updated_at
         from public.ocean_freight_orders
        order by created_at desc limit 500`,
    ),
  ]);
  const mapped = [
    ...rfqs.rows.map((row) => ({ service_key: "marketplace", service_label: SERVICE_LABELS.marketplace, id: Number(row.id), reference: row.rfq_number ?? `RFQ-${row.id}`, status: row.status ?? row.approval_status ?? "submitted", status_known: Boolean(row.status ?? row.approval_status), company_id: row.company_id, portal_customer_id: row.portal_customer_id, created_at: row.created_at, updated_at: row.updated_at ?? row.created_at, summary: row.delivery_address ?? row.notes ?? "", management_path: `/admin?tab=service-operations`, available_actions: actionList(row), record: row, ...customerFields(row) })),
    ...logistic.rows.map((row) => {
      const baseActions = actionList({ ...row, status: row.operational_status ?? row.admin_approval_status ?? row.status })
        .filter((action) => action !== "approve");
      const quoteActions = !["approved","rejected","cancelled","completed"].includes(String(row.customer_quote_status ?? "").toLowerCase())
        ? ["send_quote"]
        : [];
      const paymentActions = row.payment_status === "proof_submitted"
        ? ["verify_payment", "reject_payment"]
        : [];
      return {
        service_key: "logistic-order",
        service_label: SERVICE_LABELS["logistic-order"],
        id: Number(row.id),
        reference: row.order_number ?? `ORDER-${row.id}`,
        status: row.customer_quote_status === "pending_customer_approval"
          ? "quoted"
          : row.operational_status ?? row.admin_approval_status ?? row.status ?? "submitted",
        status_known: true,
        company_id: row.company_id,
        portal_customer_id: row.portal_customer_id,
        created_at: row.created_at,
        updated_at: row.updated_at ?? row.created_at,
        summary: `${row.origin ?? ""} → ${row.destination ?? ""}`.trim(),
        management_path: `/admin?tab=service-operations`,
        available_actions: [...new Set([...baseActions, ...quoteActions, ...paymentActions])],
        record: row,
        ...customerFields(row),
      };
    }),
    ...products.rows.map((row) => ({ service_key: "product-order", service_label: SERVICE_LABELS["product-order"], id: Number(row.id), reference: row.order_number ?? `PRODUCT-${row.id}`, status: row.status ?? "submitted", status_known: true, company_id: row.company_id, portal_customer_id: row.portal_customer_id, created_at: row.created_at, updated_at: row.updated_at ?? row.created_at, summary: row.shipping_address ?? "", management_path: `/admin?tab=service-operations`, available_actions: actionList(row), record: row, ...customerFields(row) })),
    ...serviceRequests.rows.map((row) => ({ service_key: "service-request", service_label: SERVICE_LABELS["service-request"], id: Number(row.id), reference: row.request_number ?? `CSR-${row.id}`, status: row.status ?? "submitted", status_known: true, company_id: row.company_id, portal_customer_id: row.portal_customer_id, created_at: row.created_at, updated_at: row.updated_at ?? row.created_at, summary: row.notes ?? row.request_type ?? "", management_path: `/admin?tab=service-operations`, available_actions: actionList(row), record: row, ...customerFields(row) })),
    ...quickQuotes.rows.map((row) => ({ service_key: "quote-request", service_label: SERVICE_LABELS["quote-request"], id: Number(row.id), reference: row.quote_number ?? `QUOTE-${row.id}`, status: row.status ?? "submitted", status_known: true, company_id: null, portal_customer_id: null, created_at: row.created_at, updated_at: row.updated_at ?? row.created_at, summary: `${row.service_category ?? ""} ${row.origin ?? ""} → ${row.destination ?? ""}`.trim(), management_path: `/admin?tab=service-operations`, available_actions: actionList(row), record: row, ...customerFields(row) })),
    ...airFreight.rows.map((row) => ({
      service_key: "air-freight",
      service_label: SERVICE_LABELS["air-freight"],
      id: Number(row.id),
      reference: row.order_number ?? `AFR-${row.id}`,
      status: row.status ?? row.tracking_status ?? "draft",
      status_known: true,
      company_id: row.company_id,
      portal_customer_id: row.portal_customer_id,
      created_at: row.created_at,
      updated_at: row.updated_at ?? row.created_at,
      summary: `${row.origin_airport ?? ""} → ${row.destination_airport ?? ""}`.trim(),
      management_path: "/admin?tab=service-operations",
      available_actions: TERMINAL_STATUSES.has(String(row.status ?? "").toLowerCase()) ? ["contact"] : ["send_quote", "contact"],
      record: row,
      customer_name: row.customer_name ?? "",
      customer_email: row.customer_email ?? "",
      customer_phone: row.customer_phone ?? "",
      customer_company: row.customer_company ?? "",
    })),
    ...oceanFreight.rows.map((row) => ({
      service_key: "ocean-freight",
      service_label: SERVICE_LABELS["ocean-freight"],
      id: Number(row.id),
      reference: row.order_number ?? `OCF-${row.id}`,
      status: row.status ?? row.tracking_status ?? "draft",
      status_known: true,
      company_id: row.company_id,
      portal_customer_id: row.portal_customer_id,
      created_at: row.created_at,
      updated_at: row.updated_at ?? row.created_at,
      summary: `${row.origin_port ?? ""} → ${row.destination_port ?? ""}`.trim(),
      management_path: "/admin?tab=service-operations",
      available_actions: TERMINAL_STATUSES.has(String(row.status ?? "").toLowerCase()) ? ["contact"] : ["request_vendor_rate", "send_quote", "contact"],
      record: row,
      customer_name: row.customer_name ?? "",
      customer_email: row.customer_email ?? "",
      customer_phone: row.customer_phone ?? "",
      customer_company: "",
    })),
  ];
  return mapped;
}

function filteredRows(rows, url) {
  const search = text(url.searchParams.get("search")).toLowerCase();
  const service = text(url.searchParams.get("service"), "all");
  const status = text(url.searchParams.get("status"), "all").toLowerCase();
  return rows.filter((row) => {
    if (service !== "all" && row.service_key !== service) return false;
    if (status !== "all" && String(row.status).toLowerCase() !== status) return false;
    if (!search) return true;
    return `${row.reference} ${row.customer_name} ${row.customer_email} ${row.customer_company} ${row.summary}`.toLowerCase().includes(search);
  });
}

function publicServiceRow(row) {
  const { record, ...publicRow } = row;
  return publicRow;
}

async function loadMarketplaceVendorRouting(rfqId) {
  const rfq = await query("select id from public.mkt_rfqs where id = $1 limit 1", [rfqId]);
  if (!rfq.rows[0]) return null;

  const quoteResult = await query(
    `select q.id as quote_id, q.vendor_id, q.status::text as quote_status,
            s.name as vendor_name, s.is_active as vendor_active
       from public.mkt_vendor_quotes q
       left join public.suppliers s on s.id = q.vendor_id
      where q.rfq_id = $1
      order by
        case q.status::text
          when 'selected' then 0
          when 'submitted' then 1
          when 'invited' then 2
          else 3
        end,
        q.updated_at desc,
        q.id desc
      limit 1`,
    [rfqId],
  );

  const quote = quoteResult.rows[0] ?? null;
  let vendorId = quote?.vendor_id == null ? null : Number(quote.vendor_id);
  let vendorName = quote?.vendor_name ?? null;
  let vendorActive = quote?.vendor_active == null ? null : Boolean(quote.vendor_active);
  let catalogItemId = null;
  let catalogItemName = null;
  let source = quote ? "vendor_quote" : null;

  if (vendorId != null) {
    const directCatalog = await query(
      `select vci.id, vci.name, 'quote_line'::text as source
         from public.mkt_vendor_quote_lines ql
         join public.mkt_vendor_quotes q on q.id = ql.quote_id
         join public.vendor_catalog_items vci on vci.id = ql.vendor_catalog_item_id
        where q.rfq_id = $1
          and q.vendor_id = $2
          and ql.vendor_catalog_item_id is not null
        union all
       select vci.id, vci.name, 'rfq_line'::text as source
         from public.mkt_rfq_lines rl
         join public.vendor_catalog_items vci on vci.id = rl.vendor_catalog_item_id
        where rl.rfq_id = $1
          and vci.vendor_id = $2
        limit 1`,
      [rfqId, vendorId],
    );
    const direct = directCatalog.rows[0] ?? null;
    if (direct) {
      catalogItemId = Number(direct.id);
      catalogItemName = direct.name;
      source = direct.source;
    } else {
      const historicalMatch = await query(
        `select distinct vci.id, vci.name
           from public.mkt_rfq_lines rl
           join public.vendor_catalog_items vci
             on vci.vendor_id = $2
            and vci.is_active = true
            and lower(trim(vci.name)) = lower(trim(rl.item_name))
          where rl.rfq_id = $1
          order by vci.id
          limit 2`,
        [rfqId, vendorId],
      );
      if (historicalMatch.rowCount === 1) {
        catalogItemId = Number(historicalMatch.rows[0].id);
        catalogItemName = historicalMatch.rows[0].name;
        source = "historical_name_match";
      }
    }
  } else {
    const catalogVendor = await query(
      `select distinct vci.vendor_id, s.name as vendor_name, s.is_active as vendor_active
         from public.mkt_rfq_lines rl
         join public.vendor_catalog_items vci on vci.id = rl.vendor_catalog_item_id
         left join public.suppliers s on s.id = vci.vendor_id
        where rl.rfq_id = $1
          and vci.vendor_id is not null
        limit 2`,
      [rfqId],
    );
    if (catalogVendor.rowCount === 1) {
      const resolved = catalogVendor.rows[0];
      vendorId = Number(resolved.vendor_id);
      vendorName = resolved.vendor_name ?? null;
      vendorActive = resolved.vendor_active == null ? null : Boolean(resolved.vendor_active);
      source = "rfq_catalog";
      const catalogItem = await query(
        `select vci.id, vci.name
           from public.mkt_rfq_lines rl
           join public.vendor_catalog_items vci on vci.id = rl.vendor_catalog_item_id
          where rl.rfq_id = $1
            and vci.vendor_id = $2
          order by rl.sort_order, rl.id
          limit 1`,
        [rfqId, vendorId],
      );
      if (catalogItem.rows[0]) {
        catalogItemId = Number(catalogItem.rows[0].id);
        catalogItemName = catalogItem.rows[0].name;
      }
    }
  }

  return {
    hasVendor: vendorId != null,
    vendorId,
    vendorName,
    vendorActive,
    quoteId: quote?.quote_id == null ? null : Number(quote.quote_id),
    quoteStatus: quote?.quote_status ?? null,
    catalogItemId,
    catalogItemName,
    source,
  };
}

async function handleServiceOperations(ctx) {
  const { request, response, url } = ctx;
  const vendorRoutingMatch = url.pathname.match(/^\/api\/portal\/admin\/service-operations\/marketplace\/(\d+)\/vendor-routing$/);
  const detailMatch = url.pathname.match(/^\/api\/portal\/admin\/service-operations\/([^/]+)\/(\d+)$/);
  const actionMatch = url.pathname.match(/^\/api\/portal\/admin\/service-operations\/([^/]+)\/(\d+)\/actions$/);
  if (request.method === "GET" && vendorRoutingMatch) {
    const routing = await loadMarketplaceVendorRouting(Number(vendorRoutingMatch[1]));
    if (!routing) return adminError(ctx, 404, "RFQ canonical tidak ditemukan.");
    ctx.sendJson(response, 200, { data: routing });
    return;
  }
  if (request.method === "GET" && detailMatch) {
    const rows = await loadServiceRows();
    const row = rows.find((item) => item.service_key === detailMatch[1] && item.id === Number(detailMatch[2]));
    if (!row) return adminError(ctx, 404, "Transaksi canonical tidak ditemukan.");
    let history = [];
    let projection = { timeline: { source: `public.${detailMatch[1]}`, currentStatus: row.status, events: [] }, operations: { fulfillment: { status: "not_applicable", links: 0, submissions: 0, latestSubmissionAt: null, display: null }, tracking: { status: "not_applicable", source: null, currentStatus: null, events: [], display: null }, pod: { status: "not_applicable", available: false, items: [] }, receipts: { status: "not_applicable", count: 0 }, completion: { status: TERMINAL_STATUSES.has(String(row.status).toLowerCase()) ? "completed" : "in_progress", currentStatus: row.status, source: `public.${detailMatch[1]}` } } };
    if (row.service_key === "service-request") {
      const items = await query(
        `select id, item_type, service_category, title, description, status, estimated_price, quoted_price, required_documents
           from public.customer_service_request_items where request_id = $1 order by sequence_no, id`,
        [row.id],
      );
      projection = { ...projection, items: items.rows };
    }
    if (row.service_key === "marketplace") {
      const [approvals, activity, poResult] = await Promise.all([
        query(
          `select id, approver_level, status, requested_at, responded_at, response_notes
             from public.mkt_rfq_approvals where rfq_id = $1 order by requested_at desc`,
          [row.id],
        ),
        query(
          `select id, actor_type, actor_name, action, description, created_at
             from public.rfq_activity_logs
            where rfq_id = $1
            order by created_at, id`,
          [row.id],
        ),
        query(
          `select po.id, po.po_number, po.status, po.grand_total, po.currency_snapshot,
                  po.confirmed_at, po.payment_terms_snapshot, po.payment_term_code, po.payment_dp_percent,
                  po.payment_status, po.payment_due_at, po.payment_proof_path, po.payment_proof_uploaded_at,
                  po.payment_verified_at, po.payment_rejection_reason, po.created_at, po.updated_at,
                  (
                    coalesce((select sum(pp.ocr_amount) from public.mkt_po_payment_proofs pp
                              where pp.po_id=po.id and pp.review_status='approved'),0)
                    +
                    coalesce((select sum(p.amount) from public.mkt_gateway_payments p
                              where p.ref_kind='purchase'::payment_ref_kind
                                and p.ref_id=po.id
                                and p.provider='paylabs'::payment_provider
                                and p.status='paid'::payment_status),0)
                  ) as payment_paid_amount
             from public.mkt_purchase_orders po
            where po.rfq_id = $1
            order by po.id desc
            limit 1`,
          [row.id],
        ),
      ]);

      history = activity.rows;
      const po = poResult.rows[0] ?? null;
      let shipments = { rows: [] };
      let shipmentEvents = { rows: [] };
      let receipts = { rows: [] };
      if (po) {
        [shipments, shipmentEvents, receipts] = await Promise.all([
          query(
            `select id, shipment_number, shipment_status, shipment_type,
                    carrier_name, tracking_number, created_at, updated_at
               from public.mkt_po_shipments
              where po_id = $1
              order by id`,
            [po.id],
          ),
          query(
            `select e.id, e.shipment_id, e.event_type, e.note, e.location,
                    e.attachment_object_path, e.actor_type, e.created_at
               from public.mkt_po_shipment_events e
               join public.mkt_po_shipments s on s.id = e.shipment_id
              where s.po_id = $1
              order by e.created_at, e.id`,
            [po.id],
          ),
          query(
            `select gr.id, gr.shipment_id, gr.receipt_number, gr.receipt_type,
                    gr.inspection_status, gr.received_at, gr.created_at
               from public.mkt_po_goods_receipts gr
               join public.mkt_po_shipments s on s.id = gr.shipment_id
              where s.po_id = $1
              order by gr.created_at, gr.id`,
            [po.id],
          ),
        ]);
      }

      const latestShipment = shipments.rows.length ? shipments.rows[shipments.rows.length - 1] : null;
      const podItems = shipmentEvents.rows.filter((event) => event.event_type === "pod_submitted");
      const timelineEvents = activity.rows.map((event) => ({
        id: event.id,
        event_type: event.action,
        notes: event.description,
        actor_type: event.actor_type,
        actor_name: event.actor_name,
        created_at: event.created_at,
      }));

      projection = {
        ...projection,
        approvals: approvals.rows,
        purchaseOrder: po ? {
          id: Number(po.id),
          poNumber: po.po_number,
          status: po.status,
          grandTotal: Number(po.grand_total ?? 0),
          currency: po.currency_snapshot || "IDR",
          paymentTerms: po.payment_terms_snapshot ?? null,
          paymentTermCode: po.payment_term_code ?? null,
          paymentDpPercent: po.payment_dp_percent == null ? null : Number(po.payment_dp_percent),
          paymentStatus: po.payment_status ?? "unpaid",
          paymentPaidAmount: Number(po.payment_paid_amount ?? 0),
          paymentRemainingAmount: Math.max(Number(po.grand_total ?? 0) - Number(po.payment_paid_amount ?? 0), 0),
          paymentDueAt: po.payment_due_at ?? null,
          paymentProofAvailable: Boolean(po.payment_proof_path),
          paymentProofUploadedAt: po.payment_proof_uploaded_at ?? null,
          paymentVerifiedAt: po.payment_verified_at ?? null,
          paymentRejectionReason: po.payment_rejection_reason ?? null,
          createdAt: po.created_at,
        } : null,
        timeline: {
          source: "public.rfq_activity_logs",
          currentStatus: row.record.status ?? row.status,
          events: timelineEvents,
        },
        operations: {
          fulfillment: {
            status: "available",
            links: po ? 1 : 0,
            submissions: po ? 1 : 0,
            latestSubmissionAt: po?.created_at ?? null,
            display: po ? `${po.po_number} · ${String(po.status).replaceAll("_", " ")}` : "Belum ada PO",
          },
          tracking: {
            status: "available",
            source: "public.mkt_po_shipments",
            currentStatus: latestShipment?.shipment_status ?? null,
            events: shipmentEvents.rows,
            display: latestShipment
              ? `${latestShipment.shipment_number} · ${String(latestShipment.shipment_status).replaceAll("_", " ")}`
              : "Belum ada shipment",
          },
          pod: {
            status: "available",
            available: podItems.length > 0,
            items: podItems,
          },
          receipts: {
            status: "available",
            count: receipts.rowCount ?? receipts.rows.length,
          },
          payment: {
            status: po ? "available" : "not_applicable",
            terms: po?.payment_terms_snapshot ?? null,
            termCode: po?.payment_term_code ?? null,
            dpPercent: po?.payment_dp_percent == null ? null : Number(po.payment_dp_percent),
            paymentStatus: po?.payment_status ?? null,
            paidAmount: Number(po?.payment_paid_amount ?? 0),
            remainingAmount: po ? Math.max(Number(po.grand_total ?? 0) - Number(po.payment_paid_amount ?? 0), 0) : 0,
            requiredBeforeHandoverAmount: po
              ? po.payment_term_code === "prepaid"
                ? Number(po.grand_total ?? 0)
                : po.payment_term_code === "dp_after_receipt"
                  ? Number(po.grand_total ?? 0) * Number(po.payment_dp_percent ?? 0) / 100
                  : 0
              : 0,
            requiredBeforeHandoverRemaining: po
              ? Math.max(
                  (
                    po.payment_term_code === "prepaid"
                      ? Number(po.grand_total ?? 0)
                      : po.payment_term_code === "dp_after_receipt"
                        ? Number(po.grand_total ?? 0) * Number(po.payment_dp_percent ?? 0) / 100
                        : 0
                  ) - Number(po.payment_paid_amount ?? 0),
                  0,
                )
              : 0,
            dueAt: po?.payment_due_at ?? null,
            proofAvailable: Boolean(po?.payment_proof_path),
            proofUploadedAt: po?.payment_proof_uploaded_at ?? null,
            verifiedAt: po?.payment_verified_at ?? null,
            rejectionReason: po?.payment_rejection_reason ?? null,
            requiresClearanceBeforeHandover: ["prepaid", "dp_after_receipt"].includes(po?.payment_term_code),
          },
          completion: {
            status: po
              ? (["completed", "closed"].includes(String(po.status)) ? "completed"
                : String(po.status) === "cancelled" ? "cancelled" : "in_progress")
              : "in_progress",
            currentStatus: po?.status ?? row.record.status ?? row.status,
            source: po ? "public.mkt_purchase_orders" : "public.mkt_rfqs",
          },
        },
      };
    }
    let detailRecord = row.record;
    if (row.service_key === "logistic-order" && row.record.payment_proof_url) {
      const paymentProofSignedUrl = await signedDocumentUrl(row.record.payment_proof_url).catch(() => null);
      detailRecord = { ...row.record, payment_proof_signed_url: paymentProofSignedUrl };
    }
    ctx.sendJson(response, 200, { service: row.service_key, id: row.id, record: detailRecord, history, projection });
    return;
  }
  if (request.method === "POST" && actionMatch) {
    const rows = await loadServiceRows();
    const row = rows.find((item) => item.service_key === actionMatch[1] && item.id === Number(actionMatch[2]));
    if (!row) return adminError(ctx, 404, "Transaksi canonical tidak ditemukan.");
    const action = text((ctx.body ?? {}).action);
    const reason = text((ctx.body ?? {}).reason) || null;
    if (!["approve", "request_revision", "reject", "contact", "send_quote", "request_vendor_rate", "verify_payment", "reject_payment"].includes(action)) return adminError(ctx, 400, "Action tidak valid.");
    if (action === "contact") {
      const rawPhone = String(row.phone ?? row.customer_phone ?? row.buyer_phone ?? "").trim();
      let phone = rawPhone.replace(/\D/g, "");
      if (phone.startsWith("0")) phone = `62${phone.slice(1)}`;
      else if (phone.startsWith("8")) phone = `62${phone}`;
      if (!phone) return adminError(ctx, 400, "Nomor customer tidak tersedia.");
      ctx.sendJson(response, 200, { contactUrl: `https://wa.me/${phone}` });
      return;
    }
    if (action === "verify_payment" || action === "reject_payment") {
      if (row.service_key !== "logistic-order") return adminError(ctx, 400, "Action pembayaran hanya untuk order logistik.");
      const logistic = row.record;
      if (logistic.payment_status !== "proof_submitted") {
        return adminError(ctx, 409, "Tidak ada bukti pembayaran yang menunggu verifikasi.");
      }
      const rejected = action === "reject_payment";
      if (rejected && !reason) return adminError(ctx, 400, "Alasan penolakan bukti pembayaran wajib diisi.");
      await query(
        `update public.logistic_orders
            set payment_status=$1,
                operational_status=case
                  when $1='paid' and (operational_status is null or operational_status in ('pending','pending_review','quoted','confirmed'))
                    then 'payment_confirmed'
                  else operational_status
                end,
                status=case
                  when $1='paid' and status in ('New Order','Order Received','quoted','confirmed')
                    then 'Payment Confirmed'
                  else status
                end,
                payment_proof_url=case when $1='rejected' then null else payment_proof_url end,
                quote_notes=case
                  when $1='rejected' then concat_ws(E'\\n', quote_notes, 'Payment rejected: ' || $2)
                  else quote_notes
                end,
                updated_at=now()
          where id=$3`,
        [rejected ? "rejected" : "paid", reason, row.id],
      );
      if (row.portal_customer_id) {
        await query(
          `insert into public.portal_customer_notifications
             (portal_customer_id,event_key,type,title,message,payload,is_read,created_at)
           values ($1,$2,$3,$4,$5,$6::jsonb,false,now())
           on conflict (portal_customer_id,event_key) do nothing`,
          [
            Number(row.portal_customer_id),
            `logistic:payment-review:${row.id}:${rejected ? "rejected" : "paid"}`,
            rejected ? "logistic_payment_rejected" : "logistic_payment_paid",
            rejected ? "Bukti pembayaran perlu diperbaiki" : "Pembayaran telah diverifikasi",
            rejected
              ? `${row.reference}: bukti pembayaran ditolak. ${reason}`
              : `${row.reference}: pembayaran telah diverifikasi oleh CST.`,
            JSON.stringify({ orderNumber: row.reference, status: rejected ? "rejected" : "paid", reason }),
          ],
        ).catch(() => {});
      }
      ctx.sendJson(response, 200, { ok: true, action, status: rejected ? "rejected" : "paid", service: row.service_key, id: row.id });
      return;
    }
    if (action === "request_vendor_rate") {
      if (row.service_key !== "ocean-freight") return adminError(ctx, 400, "Permintaan vendor rate hanya didukung untuk Ocean Freight.");
      const token = createFreightActionToken({
        service: "ocean",
        orderId: row.id,
        purpose: "ocean_vendor_rate",
      });
      const vendorFormUrl = `/ocean-freight-vendor-form/${token}`;
      await query(
        `update public.ocean_freight_orders
            set status=case when status in ('draft','submitted') then 'waiting_rate' else status end,
                tracking_status=case when tracking_status in ('draft','submitted') then 'waiting_rate' else tracking_status end,
                updated_at=now()
          where id=$1`,
        [row.id],
      );
      ctx.sendJson(response, 200, { ok: true, action, status: "waiting_rate", vendorFormUrl, service: row.service_key, id: row.id });
      return;
    }

    if (action === "send_quote") {
      if (!["logistic-order", "air-freight", "ocean-freight"].includes(row.service_key)) {
        return adminError(ctx, 400, "Quotation tidak didukung untuk layanan ini.");
      }
      const finalPrice = Number((ctx.body ?? {}).finalPrice);
      const termsConditions = text((ctx.body ?? {}).termsConditions) || null;
      const quoteNotes = text((ctx.body ?? {}).quoteNotes) || null;
      if (!Number.isFinite(finalPrice) || finalPrice <= 0) return adminError(ctx, 400, "Harga final wajib lebih dari 0.");

      if (row.service_key === "logistic-order") {
        await query(
          `update public.logistic_orders
              set final_selling_price=$1,
                  final_price=$1,
                  grand_total=$1,
                  customer_quote_status='pending_customer_approval',
                  quotation_sent_at=now(),
                  terms_conditions=$2,
                  quote_notes=$3,
                  admin_approval_status='quoted',
                  updated_at=now()
            where id=$4 and status not in ('cancelled','rejected')`,
          [finalPrice, termsConditions, quoteNotes, row.id],
        );
        if (row.portal_customer_id) {
          await query(
            `insert into public.portal_customer_notifications
               (portal_customer_id,event_key,type,title,message,payload,is_read,created_at)
             values ($1,$2,'logistic_quote_ready','Quotation CST siap disetujui',$3,$4::jsonb,false,now())
             on conflict (portal_customer_id,event_key) do nothing`,
            [
              Number(row.portal_customer_id),
              `logistic:quote:${row.id}:${finalPrice}`,
              `${row.reference} memiliki quotation Rp${finalPrice.toLocaleString("id-ID")}.`,
              JSON.stringify({ orderNumber: row.reference, finalPrice }),
            ],
          ).catch(() => {});
        }
        ctx.sendJson(response, 200, { ok: true, action, status: "quoted", service: row.service_key, id: row.id, finalPrice });
        return;
      }

      const isAir = row.service_key === "air-freight";
      const table = isAir ? "air_freight_orders" : "ocean_freight_orders";
      const token = createFreightActionToken({
        service: isAir ? "air" : "ocean",
        orderId: row.id,
        purpose: isAir ? "air_customer_approval" : "ocean_customer_approval",
      });
      const approvalUrl = isAir
        ? `/air-freight/approval/${token}`
        : `/ocean-freight/approval/${token}`;
      await query(
        `update public.${table}
            set final_price_idr=$1,
                grand_total=$1,
                pricing_breakdown=coalesce(pricing_breakdown,'{}'::jsonb)
                  || jsonb_build_object('admin_quote_notes',$2,'terms_conditions',$3),
                status='quoted',
                tracking_status='quoted',
                updated_at=now()
          where id=$4 and status not in ('cancelled','rejected','completed')`,
        [finalPrice, quoteNotes, termsConditions, row.id],
      );
      if (row.portal_customer_id) {
        await query(
          `insert into public.portal_customer_notifications
             (portal_customer_id,event_key,type,title,message,payload,is_read,created_at)
           values ($1,$2,$3,$4,$5,$6::jsonb,false,now())
           on conflict (portal_customer_id,event_key) do nothing`,
          [
            Number(row.portal_customer_id),
            `freight:quote:${row.service_key}:${row.id}:${finalPrice}`,
            "freight_quote_ready",
            "Quotation freight siap disetujui",
            `${row.reference} memiliki quotation Rp${finalPrice.toLocaleString("id-ID")}.`,
            JSON.stringify({ orderNumber: row.reference, finalPrice, link: approvalUrl }),
          ],
        ).catch(() => {});
      }
      ctx.sendJson(response, 200, {
        ok: true,
        action,
        status: "quoted",
        service: row.service_key,
        id: row.id,
        finalPrice,
        approvalUrl,
      });
      return;
    }
    if (!row.available_actions.includes(action)) return adminError(ctx, 409, "Action tidak tersedia untuk status canonical saat ini.");
    const targetStatus = action === "approve" ? "approved" : action === "request_revision" ? "revision_requested" : "rejected";
    if (row.service_key === "marketplace") {
      await query(
        `update public.mkt_rfqs
            set approval_status = $1, approval_resolved_at = now(), updated_at = now()
          where id = $2 and coalesce(approval_status, status::text) not in ('approved', 'rejected', 'cancelled')`,
        [targetStatus, row.id],
      );
    } else if (row.service_key === "logistic-order") {
      await query(
        `update public.logistic_orders
            set admin_approval_status = $1, approved_at = case when $1 = 'approved' then now() else approved_at end,
                updated_at = now()
          where id = $2 and coalesce(admin_approval_status, status) not in ('approved', 'rejected', 'cancelled')`,
        [targetStatus, row.id],
      );
    } else if (row.service_key === "product-order") {
      const updated = await query(
        "update public.portal_product_orders set status = $1, updated_at = now() where id = $2 and status not in ('completed', 'cancelled', 'rejected') returning id",
        [targetStatus, row.id],
      );
      if (!updated.rows[0]) return adminError(ctx, 409, "Status product order sudah berubah. Muat ulang sebelum mencoba lagi.");
    } else if (row.service_key === "service-request") {
      await query("update public.customer_service_requests set status = $1, admin_notes = $2, handled_by = $3, updated_at = now() where id = $4 and status not in ('completed', 'cancelled', 'rejected')", [targetStatus, reason, ctx.user.email, row.id]);
    } else if (row.service_key === "quote-request") {
      await query("update public.portal_quick_quotes set status = $1, admin_notes = $2, assigned_to = $3, updated_at = now() where id = $4 and status not in ('completed', 'cancelled', 'rejected')", [targetStatus, reason, ctx.user.email, row.id]);
    }
    ctx.sendJson(response, 200, { ok: true, action, status: targetStatus, service: row.service_key, id: row.id });
    return;
  }
  if (request.method !== "GET") return adminError(ctx, 405, "Method tidak didukung.");
  const rows = filteredRows(await loadServiceRows(), url);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
  const summary = Object.values(rows.reduce((acc, row) => {
    const item = acc[row.service_key] ?? (acc[row.service_key] = { service_key: row.service_key, service_label: row.service_label, total: 0, pending: 0, ambiguous: 0 });
    item.total += 1;
    if (!TERMINAL_STATUSES.has(String(row.status).toLowerCase())) item.pending += 1;
    if (!row.status_known) item.ambiguous += 1;
    return acc;
  }, {}));
  const unreadResult = await query(
    `select count(*)::int as count
       from public.portal_customer_notifications
      where portal_customer_id = $1
        and coalesce(payload->>'audience', '') = 'admin'
        and is_read = false`,
    [ctx.user.id],
  );
  ctx.sendJson(response, 200, {
    data: rows.slice(offset, offset + limit).map(publicServiceRow),
    summary, total: rows.length,
    unreadNotifications: Number(unreadResult.rows[0]?.count ?? 0),
  });
}

async function handleAdminNotifications(ctx) {
  const { request, response, url } = ctx;
  if (request.method === "GET" && url.pathname === "/api/portal/admin/service-operations/notifications") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 8), 1), 50);
    const result = await query(
      `select id, event_key, type, title, message, payload, is_read, created_at, read_at
         from public.portal_customer_notifications
        where portal_customer_id = $2
          and coalesce(payload->>'audience', '') = 'admin'
        order by created_at desc
        limit $1`,
      [limit, ctx.user.id],
    );
    const data = result.rows.map((row) => {
      const payload = jsonValue(row.payload, {}) ?? {};
      const resourceId = payload.resourceId
        ?? payload.poId
        ?? payload.invoiceId
        ?? payload.rfq_id
        ?? null;
      const resourceType = payload.resourceType
        ?? (payload.poId ? "purchase_order" : payload.invoiceId ? "invoice" : payload.rfq_id ? "rfq" : null);
      return {
        id: Number(row.id),
        event_key: row.event_key ?? `${row.type}:${resourceType ?? "notification"}:${resourceId ?? row.id}:${row.id}`,
        type: row.type,
        order_number: payload.order_number ?? payload.reference ?? payload.poNumber ?? payload.rfqNumber ?? "",
        customer_name: payload.customer_name ?? "", company_name: payload.company_name ?? null,
        title: row.title, body: row.message, read_at: row.read_at ?? (row.is_read ? row.created_at : null),
        created_at: row.created_at,
        link: typeof payload.link === "string" ? payload.link : null,
        resource_type: resourceType,
        resource_id: resourceId == null ? null : Number(resourceId),
      };
    });
    ctx.sendJson(response, 200, { data, unread: data.filter((item) => !item.read_at).length });
    return;
  }
  const readMatch = url.pathname.match(/^\/api\/portal\/admin\/service-operations\/notifications\/(\d+)\/read$/);
  if (request.method === "POST" && readMatch) {
    await query(
      `update public.portal_customer_notifications
          set is_read = true, read_at = now()
        where id = $1
          and portal_customer_id = $2
          and coalesce(payload->>'audience', '') = 'admin'`,
      [Number(readMatch[1]), ctx.user.id],
    );
    ctx.sendEmpty(response, 204);
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/portal/admin/service-operations/notifications/mark-all-read") {
    await query(
      `update public.portal_customer_notifications
          set is_read = true, read_at = now()
        where portal_customer_id = $1
          and coalesce(payload->>'audience', '') = 'admin'
          and is_read = false`,
      [ctx.user.id],
    );
    ctx.sendEmpty(response, 204);
    return;
  }
  return adminError(ctx, 404, "Notification route tidak ditemukan.");
}

export {
  handleAdminApprovals,
  handleAdminCompanyRequests,
  handleAdminCustomerStats,
  handleAdminCustomers,
  handleAdminNotifications,
  handleOnboardingComplete,
  handleDocumentUpload,
  handleKtpOcr,
  handleOrganizationMutation,
  handleOnboardingStatus,
  handleServiceOperations,
  handleVerification,
};