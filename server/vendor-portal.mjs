import crypto from "node:crypto";
import { pool, query } from "./db.mjs";
import { createSession, sessionCookies } from "./session.mjs";
import { normalizePhone, normalizedEmail } from "./auth-providers.mjs";
import {
  signedVendorInvitationAssetUrl,
  signedVendorFeaturedPaymentProofUrl,
  uploadVendorInvitationAsset,
  uploadVendorFeaturedPaymentProof,
  uploadVendorCatalogImage,
  uploadVendorCatalogAsset,
} from "./storage.mjs";

const REQUIRED_INVITATION_DOCUMENTS = new Set(["npwp", "siup_nib", "ktp_pic"]);
const INVITATION_TTL_DAYS = 7;

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

function invitationToken(value) {
  const token = text(value);
  if (!/^[a-f0-9]{48,128}$/i.test(token)) {
    const error = new Error("Token undangan tidak valid.");
    error.statusCode = 400;
    throw error;
  }
  return token;
}

function canonicalPhoneSql(column, parameter) {
  return `(case
    when regexp_replace(coalesce(${column}, ''), '[^0-9]', '', 'g') like '0%'
      then '62' || substr(regexp_replace(coalesce(${column}, ''), '[^0-9]', '', 'g'), 2)
    when regexp_replace(coalesce(${column}, ''), '[^0-9]', '', 'g') like '8%'
      then '62' || regexp_replace(coalesce(${column}, ''), '[^0-9]', '', 'g')
    else regexp_replace(coalesce(${column}, ''), '[^0-9]', '', 'g')
  end) = ${parameter}`;
}

function mapInvitation(row) {
  return {
    id: Number(row.id),
    vendor_name: row.vendor_name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    service_type: row.service_type ?? null,
    notes: row.notes ?? null,
    token: row.token,
    status: row.status,
    valid_until: row.valid_until,
    sent_via_wa: Boolean(row.sent_via_wa),
    created_at: row.created_at,
    rejection_reason: row.rejection_reason ?? null,
    rejected_at: row.rejected_at ?? null,
    documents: jsonValue(row.documents, []),
    category: row.category ?? null,
    category_label: row.category_label ?? null,
    products: jsonValue(row.products, []),
    vendor_message: row.vendor_message ?? null,
    contact_name: row.contact_name ?? null,
    company_name: row.company_name ?? null,
    accepted_at: row.accepted_at ?? null,
    supplier_id: row.supplier_id == null ? null : Number(row.supplier_id),
    approved_at: row.approved_at ?? null,
  };
}

async function getInvitation(token, client = null, lock = false) {
  const db = client ?? { query };
  const result = await db.query(
    `select id, vendor_name, phone, email, service_type, notes, token, status,
            valid_until, sent_via_wa, created_at, rejection_reason, rejected_at,
            documents, products, vendor_message, accepted_at, category, category_label,
            contact_name, company_name, supplier_id, approved_at
       from public.portal_vendor_invitations
      where token = $1
      ${lock ? "for update" : ""}
      limit 1`,
    [token],
  );
  return result.rows[0] ?? null;
}

function assertOpenInvitation(row) {
  if (!row) {
    const error = new Error("Link undangan tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }
  if (row.status === "accepted") return;
  if (["revoked", "rejected"].includes(row.status)) {
    const error = new Error("Undangan ini sudah tidak aktif.");
    error.statusCode = 410;
    throw error;
  }
  if (new Date(row.valid_until).getTime() <= Date.now()) {
    const error = new Error("Link undangan sudah kadaluarsa.");
    error.statusCode = 410;
    throw error;
  }
}

function normalizedInviteProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      name: text(item.name).slice(0, 200),
      description: text(item.description).slice(0, 4000),
      category: text(item.category).slice(0, 120) || null,
      mediaUrls: Array.isArray(item.mediaUrls)
        ? item.mediaUrls.filter((url) => typeof url === "string" && url.length <= 2000).slice(0, 8)
        : [],
    }))
    .filter((item) => item.name);
}

function normalizedInviteDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  return documents
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      docType: text(item.docType).slice(0, 40),
      url: typeof item.url === "string" ? item.url.slice(0, 2000) : null,
      fileName: text(item.fileName).slice(0, 200),
    }))
    .filter((item) => item.docType && item.url);
}

function notificationPayload(resourceId, supplierId) {
  return {
    audience: "vendor",
    resourceType: "vendor_invitation",
    resourceId,
    supplierId,
    link: "/vendor-dashboard",
    url: "/vendor-dashboard",
  };
}

async function findOrCreateSupplier(db, invitation, body, phone, email) {
  const existing = await db.query(
    `select id, name, contact_email, phone, portal_phone, status, registration_status
       from public.suppliers
      where ($1 <> '' and lower(coalesce(contact_email, '')) = $1)
         or ($2 <> '' and (${canonicalPhoneSql("phone", "$2")} or ${canonicalPhoneSql("portal_phone", "$2")}))
      order by id
      limit 1
      for update`,
    [email, phone],
  );
  if (existing.rows[0]) {
    const row = existing.rows[0];
    await db.query(
      `update public.suppliers
          set name = coalesce(nullif($1, ''), name),
              contact_email = coalesce(nullif($2, ''), contact_email),
              phone = coalesce(nullif($3, ''), phone),
              portal_phone = coalesce(nullif($3, ''), portal_phone),
              contact_person = coalesce(nullif($4, ''), contact_person),
              service_type = coalesce(nullif($5, ''), service_type),
              self_submitted = true,
              updated_at = now()
        where id = $6`,
      [
        text(body.company_name) || invitation.vendor_name,
        email,
        phone,
        text(body.contact_name),
        text(invitation.service_type),
        row.id,
      ],
    );
    return Number(row.id);
  }
  const inserted = await db.query(
    `insert into public.suppliers
      (name, contact_email, phone, portal_phone, contact_person, service_type,
       is_active, registration_status, self_submitted, status, is_verified, marketplace_status)
     values ($1, nullif($2, ''), nullif($3, ''), nullif($3, ''), nullif($4, ''),
             nullif($5, ''), false, 'pending', true, 'pending', false, 'draft')
     returning id`,
    [
      text(body.company_name) || invitation.vendor_name,
      email,
      phone,
      text(body.contact_name),
      text(invitation.service_type),
    ],
  );
  return Number(inserted.rows[0].id);
}

async function findOrCreateVendorAccount(db, invitation, body, phone, email, supplierId) {
  const accountEmail = email || `${phone}@vendor.local`;
  const existing = await db.query(
    `select id, name, email, phone, company, role, customer_type, account_status
       from public.portal_customers
      where lower(email) = $1 or (${canonicalPhoneSql("phone", "$2")})
      order by id
      limit 1
      for update`,
    [accountEmail, phone],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].role !== "vendor") {
      const error = new Error("Email atau nomor HP sudah dipakai akun non-vendor.");
      error.statusCode = 409;
      throw error;
    }
    await db.query(
      `update public.portal_customers
          set name = coalesce(nullif($1, ''), name),
              phone = coalesce(nullif($2, ''), phone),
              company = coalesce(nullif($3, ''), company)
        where id = $4`,
      [text(body.contact_name) || invitation.vendor_name, phone, text(body.company_name) || invitation.vendor_name, existing.rows[0].id],
    );
    return Number(existing.rows[0].id);
  }
  const inserted = await db.query(
    `insert into public.portal_customers
      (name, email, password_hash, phone, company, role, customer_type, account_status)
     values ($1, $2, '', $3, $4, 'vendor', null, 'active')
     returning id`,
    [
      text(body.contact_name) || invitation.vendor_name,
      accountEmail,
      phone,
      text(body.company_name) || invitation.vendor_name,
    ],
  );
  const customerId = Number(inserted.rows[0].id);
  await db.query(
    `insert into public.vendor_profiles
      (customer_id, company_name, service_type, supplier_id, verification_status, pic_name, phone, whatsapp, email)
     values ($1, $2, nullif($3, ''), $4, 'pending', nullif($5, ''), nullif($6, ''), nullif($6, ''), nullif($7, ''))`,
    [
      customerId,
      text(body.company_name) || invitation.vendor_name,
      text(invitation.service_type),
      supplierId,
      text(body.contact_name),
      phone,
      email,
    ],
  );
  return customerId;
}

async function insertCatalogItems(db, invitation, supplierId, products) {
  const isMarketplace = !invitation.service_type || invitation.service_type === "marketplace";
  for (const product of products) {
    const mediaAssets = product.mediaUrls.map((url, index) => ({
      id: crypto.randomUUID(),
      url,
      type: /\.(mp4|mov|webm)(\?|$)/i.test(url) ? "video" : "image",
      isPrimary: index === 0,
      sortOrder: index,
      visibility: "public",
    }));
    await db.query(
      `insert into public.vendor_catalog_items
        (vendor_id, type, name, description, unit, price_base, currency, kategori,
         category_key, service_type, vendor_name, status, is_published, is_active,
         media_assets, documents, source_submission_id)
       values ($1, $2, $3, nullif($4, ''), 'unit', 0, 'IDR', nullif($5, ''),
               nullif($5, ''), nullif($6, ''), $7, 'draft', false, true, $8::jsonb, '[]'::jsonb, null)`,
      [
        supplierId,
        isMarketplace ? "product" : "service",
        product.name,
        product.description,
        product.category,
        invitation.service_type,
        text(invitation.vendor_name),
        JSON.stringify(mediaAssets),
      ],
    );
  }
}

async function acceptInvitation(token, body) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const invitation = await getInvitation(token, client, true);
    if (!invitation) {
      const error = new Error("Link undangan tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }
    if (invitation.status === "accepted") {
      await client.query("commit");
      return {
        alreadyProcessed: true,
        supplierId: invitation.supplier_id == null ? null : Number(invitation.supplier_id),
        status: invitation.status,
      };
    }
    assertOpenInvitation(invitation);
    const contactName = text(body.contact_name);
    const phone = normalizePhone(body.phone);
    const email = normalizedEmail(body.email);
    if (!contactName) {
      const error = new Error("Nama kontak wajib diisi.");
      error.statusCode = 400;
      throw error;
    }
    if (!phone && !email) {
      const error = new Error("Nomor WhatsApp atau email wajib diisi.");
      error.statusCode = 400;
      throw error;
    }
    if (phone && !/^62\d{8,13}$/.test(phone)) {
      const error = new Error("Nomor HP tidak valid.");
      error.statusCode = 400;
      throw error;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error("Format email tidak valid.");
      error.statusCode = 400;
      throw error;
    }

    const documents = normalizedInviteDocuments(body.documents);
    const products = normalizedInviteProducts(body.products);
    const supplierId = await findOrCreateSupplier(
      client,
      invitation,
      { ...body, contact_name: contactName },
      phone,
      email,
    );
    const customerId = await findOrCreateVendorAccount(
      client,
      invitation,
      { ...body, contact_name: contactName },
      phone,
      email,
      supplierId,
    );
    const profile = await client.query(
      `select id from public.vendor_profiles where customer_id = $1 order by updated_at desc, id desc limit 1`,
      [customerId],
    );
    let vendorProfileId = profile.rows[0]?.id ?? null;
    if (profile.rows[0]) {
      await client.query(
        `update public.vendor_profiles
            set supplier_id = $1, verification_status = 'pending', updated_at = now()
          where id = $2`,
        [supplierId, profile.rows[0].id],
      );
    } else {
      const createdProfile = await client.query(
        `insert into public.vendor_profiles
          (customer_id, company_name, service_type, supplier_id, verification_status,
           pic_name, phone, whatsapp, email)
         values ($1, $2, nullif($3, ''), $4, 'pending', nullif($5, ''),
                 nullif($6, ''), nullif($6, ''), nullif($7, ''))
         returning id`,
        [
          customerId,
          text(body.company_name) || invitation.vendor_name,
          text(invitation.service_type),
          supplierId,
          contactName,
          phone,
          email,
        ],
      );
      vendorProfileId = createdProfile.rows[0]?.id ?? null;
    }
    await insertCatalogItems(client, invitation, supplierId, products);
    const updated = await client.query(
      `update public.portal_vendor_invitations
          set status = 'accepted', accepted_at = now(), contact_name = $1,
              company_name = $2, phone = coalesce(nullif($3, ''), phone),
              email = coalesce(nullif($4, ''), email), documents = $5::jsonb,
              products = $6::jsonb, vendor_message = $7, supplier_id = $8
        where id = $9 and status = 'pending' and valid_until > now()
        returning id`,
      [
        contactName,
        text(body.company_name) || invitation.vendor_name,
        phone,
        email,
        JSON.stringify(documents),
        JSON.stringify(products),
        text(body.message) || null,
        supplierId,
        invitation.id,
      ],
    );
    if (!updated.rows[0]) {
      const error = new Error("Undangan sudah diproses oleh permintaan lain.");
      error.statusCode = 409;
      throw error;
    }
    const payload = notificationPayload(invitation.id, supplierId);
    await client.query(
      `insert into public.vendor_notifications
        (vendor_id, type, title, message, payload)
       values ($1, 'registration_submitted', 'Registrasi vendor diterima',
               'Data vendor Anda sudah diterima dan menunggu approval admin.', $2::jsonb)`,
      [customerId, JSON.stringify({ ...payload, vendorProfileId })],
    );
    await client.query(
      `insert into public.portal_customer_notifications
        (portal_customer_id, event_key, type, title, message, payload)
       select $1, $2, 'vendor_registration_submitted', 'Registrasi vendor diterima',
              'Data vendor Anda sudah diterima dan menunggu approval admin.', $3::jsonb
       where not exists (
         select 1 from public.portal_customer_notifications
          where portal_customer_id = $1 and event_key = $2
       )`,
      [customerId, `vendor-invitation:${invitation.id}:accepted`, JSON.stringify(payload)],
    );
    await client.query("commit");
    return { alreadyProcessed: false, supplierId, customerId, status: "accepted" };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function approveInvitation(id, adminId) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      `select * from public.portal_vendor_invitations where id = $1 for update`,
      [id],
    );
    const invitation = result.rows[0];
    if (!invitation) {
      const error = new Error("Undangan tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }
    if (invitation.status !== "accepted" || !invitation.supplier_id) {
      const error = new Error("Vendor harus menyelesaikan registrasi sebelum approval.");
      error.statusCode = 409;
      throw error;
    }
    const supplier = await client.query(
      `update public.suppliers
          set is_active = true, is_verified = true, verified_at = now(),
              verified_by = $1, registration_status = 'approved', status = 'active',
              status_changed_at = now(), status_changed_by = $1, updated_at = now()
        where id = $2
        returning id, name`,
      [String(adminId), invitation.supplier_id],
    );
    if (!supplier.rows[0]) {
      const error = new Error("Supplier tidak ditemukan.");
      error.statusCode = 404;
      throw error;
    }
    await client.query(
      `update public.vendor_profiles
          set verification_status = 'verified',
              approved_at = coalesce(approved_at, now()),
              approval_date = coalesce(approval_date, now()),
              updated_at = now()
        where supplier_id = $1`,
      [invitation.supplier_id],
    );
    const payload = notificationPayload(invitation.id, invitation.supplier_id);
    const account = await client.query(
      `select c.id
         from public.portal_customers c
        where c.role = 'vendor'
          and (${canonicalPhoneSql("c.phone", "$1")} or lower(c.email) = lower($2))
        order by c.id
        limit 1`,
      [normalizePhone(invitation.phone), normalizedEmail(invitation.email)],
    );
    if (account.rows[0]) {
      await client.query(
        `insert into public.portal_customer_notifications
          (portal_customer_id, event_key, type, title, message, payload)
         select $1, $2, 'vendor_approved', 'Vendor disetujui',
                'Akun vendor Anda telah disetujui admin.', $3::jsonb
         where not exists (
           select 1 from public.portal_customer_notifications
            where portal_customer_id = $1 and event_key = $2
         )`,
        [account.rows[0].id, `vendor-invitation:${invitation.id}:approved`, JSON.stringify(payload)],
      );
    }
    await client.query(
      `insert into public.vendor_notifications
        (vendor_id, type, title, message, payload)
       select $1, 'vendor_approved', 'Vendor disetujui',
              'Profil vendor Anda telah disetujui admin.', $2::jsonb
       where not exists (
         select 1 from public.vendor_notifications
          where vendor_id = $1 and type = 'vendor_approved'
            and payload->>'resourceId' = $3
       )`,
      [account.rows[0]?.id ?? null, JSON.stringify(payload), String(invitation.id)],
    );
    await client.query("commit");
    return { supplierId: Number(invitation.supplier_id), status: "approved" };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function handleVendorInvitationRoute({ request, response, url, body, sendJson, sendEmpty }) {
  const match = url.pathname.match(/^\/api\/portal\/vendor-invite\/([^/]+)(?:\/(upload|asset|accept|reject))?$/);
  if (!match) return false;
  const token = invitationToken(decodeURIComponent(match[1]));
  const action = match[2] ?? "";
  if (request.method === "GET" && !action) {
    const row = await getInvitation(token);
    assertOpenInvitation(row);
    sendJson(response, 200, mapInvitation(row));
    return true;
  }
  if (request.method === "GET" && action === "asset") {
    const path = url.searchParams.get("path");
    const signedUrl = await signedVendorInvitationAssetUrl({ token, path });
    response.writeHead(302, { Location: signedUrl, "Cache-Control": "private, max-age=60" });
    response.end();
    return true;
  }
  if (request.method === "POST" && action === "upload") {
    const row = await getInvitation(token);
    assertOpenInvitation(row);
    if (!body?.file) {
      const error = new Error("File vendor wajib diunggah.");
      error.statusCode = 400;
      throw error;
    }
    const uploaded = await uploadVendorInvitationAsset({ token, file: body.file });
    sendJson(response, 201, {
      ...uploaded,
      url: `/api/portal/vendor-invite/${encodeURIComponent(token)}/asset?path=${encodeURIComponent(uploaded.path)}`,
    });
    return true;
  }
  if (request.method === "POST" && action === "accept") {
    sendJson(response, 200, await acceptInvitation(token, body ?? {}));
    return true;
  }
  if (request.method === "POST" && action === "reject") {
    const row = await getInvitation(token);
    if (!row) {
      sendJson(response, 404, { message: "Link undangan tidak ditemukan." });
      return true;
    }
    if (row.status === "rejected") {
      sendJson(response, 200, { alreadyProcessed: true, status: "rejected" });
      return true;
    }
    if (row.status === "accepted") {
      sendJson(response, 200, { alreadyProcessed: true, status: "accepted" });
      return true;
    }
    assertOpenInvitation(row);
    await query(
      `update public.portal_vendor_invitations
          set status = 'rejected', rejection_reason = $1, rejected_at = now()
        where id = $2 and status = 'pending'`,
      [text(body?.reason) || "Vendor tidak menyetujui undangan.", row.id],
    );
    sendJson(response, 200, { status: "rejected" });
    return true;
  }
  sendJson(response, 404, { message: "Route undangan vendor tidak ditemukan." });
  return true;
}

export async function handleAdminVendorRoutes({ request, response, url, body, user, sendJson, sendError, sendEmpty }) {
  if (url.pathname === "/api/portal/admin/vendor-invitations" && request.method === "GET") {
    const result = await query(
      `select id, vendor_name, phone, email, service_type, notes, token, status,
              valid_until, sent_via_wa, created_at, rejection_reason, rejected_at,
              documents, products, vendor_message, accepted_at, category, category_label,
              contact_name, company_name, supplier_id, approved_at
         from public.portal_vendor_invitations
        order by created_at desc
        limit 200`,
    );
    sendJson(response, 200, result.rows.map(mapInvitation));
    return true;
  }
  if (url.pathname === "/api/portal/admin/vendor-invitations" && request.method === "POST") {
    const vendorName = text(body?.vendor_name);
    if (!vendorName) return sendError(response, 400, "Nama vendor wajib diisi.");
    const token = crypto.randomBytes(32).toString("hex");
    const result = await query(
      `insert into public.portal_vendor_invitations
        (vendor_name, phone, email, service_type, notes, token, valid_until, sent_via_wa)
       values ($1, nullif($2, ''), nullif($3, ''), nullif($4, ''), nullif($5, ''),
               $6, now() + ($7 * interval '1 day'), false)
       returning id, token, sent_via_wa`,
      [
        vendorName,
        normalizePhone(body.phone),
        normalizedEmail(body.email),
        text(body.service_type),
        text(body.notes),
        token,
        INVITATION_TTL_DAYS,
      ],
    );
    sendJson(response, 201, {
      id: Number(result.rows[0].id),
      token: result.rows[0].token,
      sent_via_wa: false,
      delivery: "manual",
    });
    return true;
  }
  const idMatch = url.pathname.match(/^\/api\/portal\/admin\/vendor-invitations\/(\d+)$/);
  if (idMatch && request.method === "DELETE") {
    await query(
      `update public.portal_vendor_invitations
          set status = case when status = 'pending' then 'revoked' else status end
        where id = $1`,
      [Number(idMatch[1])],
    );
    sendEmpty(response, 204);
    return true;
  }
  const approveMatch = url.pathname.match(/^\/api\/portal\/admin\/vendor-invitations\/(\d+)\/approve$/);
  if (approveMatch && request.method === "POST") {
    sendJson(response, 200, await approveInvitation(Number(approveMatch[1]), user.id));
    return true;
  }
  if (url.pathname === "/api/portal/admin/suppliers" && request.method === "GET") {
    const result = await query(
      `select s.id, s.name, s.contact_email as email, s.phone,
              s.status, s.is_active, s.is_verified, coalesce(s.marketplace_status, 'draft') as marketplace_status,
              coalesce(s.is_premium, false) as is_premium, s.created_at,
              count(v.id) filter (where v.status = 'published' and v.is_published) as published_items,
              count(v.id) as total_items,
               coalesce(bool_or(v.is_internal_vendor), false) as is_internal_vendor
         from public.suppliers s
         left join public.vendor_catalog_items v on v.vendor_id = s.id and v.type = 'product'
        group by s.id
        order by s.created_at desc nulls last, s.id desc`,
    );
    sendJson(response, 200, result.rows.map((row) => ({
      ...row,
      id: Number(row.id),
      published_items: Number(row.published_items),
      total_items: Number(row.total_items),
      is_active: Boolean(row.is_active),
      is_verified: Boolean(row.is_verified),
      is_premium: Boolean(row.is_premium),
    })));
    return true;
  }
  const supplierMatch = url.pathname.match(/^\/api\/portal\/admin\/suppliers\/(\d+)\/marketplace$/);
  if (supplierMatch && request.method === "PATCH") {
    const supplierId = Number(supplierMatch[1]);
    const marketplaceStatus = text(body?.marketplaceStatus ?? body?.marketplace_status);
    const hasVerified = body?.isVerified !== undefined || body?.is_verified !== undefined;
    const isVerified = Boolean(body?.isVerified ?? body?.is_verified);
    if (marketplaceStatus && !["draft", "published", "unpublished"].includes(marketplaceStatus)) {
      return sendError(response, 400, "Status marketplace tidak valid.");
    }
    if (marketplaceStatus === "published" && body?.isVerified !== true) {
      return sendError(response, 409, "Vendor harus verified sebelum dipublish.");
    }
    const result = await query(
      `update public.suppliers
          set is_verified = case when $1 then $2 else is_verified end,
              verified_at = case when $1 and $2 then coalesce(verified_at, now()) else verified_at end,
              marketplace_status = coalesce(nullif($3, ''), marketplace_status),
              marketplace_published_at = case when $3 = 'published' then coalesce(marketplace_published_at, now()) else marketplace_published_at end,
              marketplace_published_by = case when $3 = 'published' then $4 else marketplace_published_by end,
              updated_at = now()
        where id = $5
        returning id, is_verified, marketplace_status`,
      [hasVerified, isVerified, marketplaceStatus, String(user.id), supplierId],
    );
    if (!result.rows[0]) return sendError(response, 404, "Supplier tidak ditemukan.");
    sendJson(response, 200, result.rows[0]);
    return true;
  }
  return false;
}

export async function handleVendorPortalRoutes({ request, response, url, user, body = {}, sendJson, sendError, sendEmpty }) {
  if (user.role !== "vendor") return false;
  const profile = await query(
    `select vp.*, s.id as supplier_id, s.name as supplier_name, s.status as supplier_status,
            s.registration_status, s.is_active, s.is_verified, s.marketplace_status
       from public.vendor_profiles vp
       left join public.suppliers s on s.id = vp.supplier_id
      where vp.customer_id = $1
      order by vp.updated_at desc, vp.id desc
      limit 1`,
    [user.id],
  );
  const vendor = profile.rows[0] ?? null;
  if (url.pathname === "/api/portal/vendor/vendor-profile" && request.method === "GET") {
    sendJson(response, 200, {
      vendorProfile: vendor ? {
        id: Number(vendor.id),
        customerId: user.id,
        companyName: vendor.company_name ?? vendor.supplier_name ?? user.company ?? null,
        legalName: null,
        email: vendor.email ?? user.email ?? null,
        phone: vendor.phone ?? user.phone ?? null,
        nib: null,
        npwp: null,
        picName: vendor.pic_name ?? user.name ?? null,
        picPhone: vendor.phone ?? user.phone ?? null,
        picEmail: vendor.email ?? user.email ?? null,
        serviceType: vendor.service_type ?? null,
        address: vendor.full_address ?? null,
        fullAddress: vendor.full_address ?? null,
        city: vendor.city ?? null,
        province: vendor.province ?? null,
        postalCode: vendor.postal_code ?? null,
        bankName: vendor.bank_name ?? null,
        bankAccountNumber: null,
        bankAccountNumberMasked: vendor.bank_account_number ? `••••${String(vendor.bank_account_number).slice(-4)}` : null,
        bankAccountName: vendor.bank_account_name ?? null,
        verificationStatus: vendor.verification_status ?? "pending",
        supplierId: vendor.supplier_id == null ? null : Number(vendor.supplier_id),
        approvedAt: vendor.approved_at ?? null,
        updatedAt: vendor.updated_at ?? null,
      } : null,
      submissionLink: null,
      portalCustomer: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      supplier: vendor ? {
        id: vendor.supplier_id == null ? null : Number(vendor.supplier_id),
        name: vendor.supplier_name,
        status: vendor.supplier_status,
        registrationStatus: vendor.registration_status,
        isActive: Boolean(vendor.is_active),
        isVerified: Boolean(vendor.is_verified),
        marketplaceStatus: vendor.marketplace_status,
      } : null,
      approvalStatus: vendor?.registration_status ?? "pending",
    });
    return true;
  }
  if (url.pathname === "/api/portal/vendor/profile" && request.method === "GET") {
    const legacyRfqs = vendor?.supplier_id ? await query(
      `select r.id, r.rfq_number, r.order_id, r.status, r.created_at,
              o.order_number, o.origin, o.destination, o.shipment_type, o.commodity
         from public.logistic_order_rfqs r
         join public.logistic_orders o on o.id = r.order_id
        where $1 = any(coalesce(r.vendor_ids, '{}'::int[]))
        order by r.created_at desc, r.id desc
        limit 100`,
      [vendor.supplier_id],
    ) : { rows: [] };
    const legacyQuotes = vendor?.supplier_id ? await query(
      `select q.id, q.rfq_id, q.order_id, q.vendor_price, q.selling_price,
              q.estimated_pickup, q.estimated_delivery, q.vendor_notes, q.quote_status,
              q.reply_source, q.created_at, r.rfq_number, o.order_number
         from public.logistic_order_quotes q
         join public.logistic_order_rfqs r on r.id = q.rfq_id
         join public.logistic_orders o on o.id = q.order_id
        where q.vendor_id = $1
        order by q.created_at desc, q.id desc
        limit 100`,
      [vendor.supplier_id],
    ) : { rows: [] };
    const marketplaceRfqs = vendor?.supplier_id ? await query(
      `select q.id as quote_id, q.rfq_id, q.status as quote_status, q.valid_until, q.submitted_at,
              r.rfq_number, r.status as rfq_status, r.buyer_name, r.buyer_company,
              r.required_delivery_date, r.delivery_address, r.notes, r.line_count
         from public.mkt_vendor_quotes q
         join public.mkt_rfqs r on r.id = q.rfq_id
        where q.vendor_id = $1
        order by q.created_at desc, q.id desc
        limit 100`,
      [vendor.supplier_id],
    ) : { rows: [] };
    const marketplaceOrders = vendor?.supplier_id ? await query(
      `select p.id, p.po_number, p.rfq_id, p.quote_id, p.status, p.total_amount, p.tax_amount,
              p.grand_total, p.confirmed_at, p.created_at, r.rfq_number
         from public.mkt_purchase_orders p
         join public.mkt_rfqs r on r.id = p.rfq_id
        where p.vendor_id = $1
        order by p.created_at desc, p.id desc
        limit 100`,
      [vendor.supplier_id],
    ) : { rows: [] };
    sendJson(response, 200, {
      portalCustomer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        company: user.company ?? null,
        role: user.role,
      },
      supplier: vendor ? {
        id: Number(vendor.supplier_id),
        name: vendor.supplier_name,
        phone: vendor.phone ?? user.phone ?? null,
        contactEmail: vendor.email ?? user.email ?? null,
        serviceType: vendor.service_type ?? null,
        isActive: Boolean(vendor.is_active),
      } : null,
      rfqs: legacyRfqs.rows.map((row) => ({
        id: Number(row.id), rfqNumber: row.rfq_number, orderId: Number(row.order_id), status: row.status,
        orderNumber: row.order_number, origin: row.origin, destination: row.destination,
        shipmentType: row.shipment_type, commodity: row.commodity, createdAt: row.created_at,
      })),
      quotes: legacyQuotes.rows.map((row) => ({
        id: Number(row.id), rfqId: Number(row.rfq_id), orderId: Number(row.order_id),
        orderNumber: row.order_number, rfqNumber: row.rfq_number, vendorPrice: Number(row.vendor_price ?? 0),
        sellingPrice: row.selling_price == null ? null : Number(row.selling_price),
        estimatedPickup: row.estimated_pickup, estimatedDelivery: row.estimated_delivery,
        vendorNotes: row.vendor_notes, quoteStatus: row.quote_status, replySource: row.reply_source,
        createdAt: row.created_at,
      })),
      marketplaceRfqs: marketplaceRfqs.rows.map((row) => ({
        id: Number(row.rfq_id), rfqNumber: row.rfq_number, rfqStatus: row.rfq_status,
        quoteId: Number(row.quote_id), quoteStatus: row.quote_status, quoteUrl: "",
        validUntil: row.valid_until, submittedAt: row.submitted_at, buyerName: row.buyer_name,
        buyerCompany: row.buyer_company, requiredDeliveryDate: row.required_delivery_date,
        deliveryAddress: row.delivery_address, notes: row.notes, lineCount: Number(row.line_count ?? 0),
      })),
      marketplaceOrders: marketplaceOrders.rows.map((row) => ({
        id: Number(row.id), poNumber: row.po_number, rfqId: Number(row.rfq_id),
        quoteId: Number(row.quote_id), rfqNumber: row.rfq_number, status: row.status,
        totalAmount: Number(row.total_amount ?? 0), taxAmount: Number(row.tax_amount ?? 0),
        grandTotal: Number(row.grand_total ?? 0), confirmedAt: row.confirmed_at, createdAt: row.created_at,
      })),
      vendorProfile: vendor ? {
        id: Number(vendor.id),
        customerId: user.id,
        companyName: vendor.company_name ?? vendor.supplier_name ?? user.company ?? null,
        legalName: null,
        email: vendor.email ?? user.email ?? null,
        phone: vendor.phone ?? user.phone ?? null,
        nib: null,
        npwp: null,
        picName: vendor.pic_name ?? user.name ?? null,
        picPhone: vendor.phone ?? user.phone ?? null,
        picEmail: vendor.email ?? user.email ?? null,
        serviceType: vendor.service_type ?? null,
        address: vendor.full_address ?? null,
        fullAddress: vendor.full_address ?? null,
        city: vendor.city ?? null,
        province: vendor.province ?? null,
        postalCode: vendor.postal_code ?? null,
        bankName: vendor.bank_name ?? null,
        bankAccountNumber: null,
        bankAccountNumberMasked: vendor.bank_account_number ? `••••${String(vendor.bank_account_number).slice(-4)}` : null,
        bankAccountName: vendor.bank_account_name ?? null,
        verificationStatus: vendor.verification_status ?? "pending",
        supplierId: vendor.supplier_id == null ? null : Number(vendor.supplier_id),
        approvedAt: vendor.approved_at ?? null,
        updatedAt: vendor.updated_at ?? null,
      } : null,
      submissionLink: null,
    });
    return true;
  }
  if (url.pathname === "/api/portal/vendor/profile" && request.method === "PATCH") {
    if (!vendor) return sendError(response, 404, "Profil vendor tidak ditemukan.");
    const expectedUpdatedAt = body?.expectedUpdatedAt ? new Date(body.expectedUpdatedAt) : null;
    if (expectedUpdatedAt && Number.isNaN(expectedUpdatedAt.getTime())) {
      return sendError(response, 400, "Versi profil tidak valid.");
    }
    const clean = (value, max) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const normalized = String(value).trim();
      return normalized ? normalized.slice(0, max) : null;
    };
    const values = {
      picName: clean(body?.picName, 160),
      phone: clean(body?.phone, 50),
      email: clean(body?.email, 254),
      fullAddress: clean(body?.fullAddress, 1000),
      province: clean(body?.province, 160),
      city: clean(body?.city, 160),
      postalCode: clean(body?.postalCode, 20),
      bankName: clean(body?.bankName, 160),
      bankAccountName: clean(body?.bankAccountName, 200),
      bankAccountNumber: clean(body?.bankAccountNumber, 100),
    };
    if (values.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(values.email)) {
      return sendError(response, 400, "Email PIC tidak valid.");
    }
    const result = await query(
      `update public.vendor_profiles
          set pic_name = coalesce($1, pic_name),
              phone = coalesce($2, phone),
              email = coalesce($3, email),
              full_address = coalesce($4, full_address),
              province = coalesce($5, province),
              city = coalesce($6, city),
              postal_code = coalesce($7, postal_code),
              bank_name = coalesce($8, bank_name),
              bank_account_name = coalesce($9, bank_account_name),
              bank_account_number = coalesce($10, bank_account_number),
              updated_at = now()
        where id = $11 and customer_id = $12
          and ($13::timestamptz is null or updated_at = $13::timestamptz)
        returning id, updated_at`,
      [values.picName, values.phone, values.email, values.fullAddress, values.province, values.city,
       values.postalCode, values.bankName, values.bankAccountName, values.bankAccountNumber,
       vendor.id, user.id, expectedUpdatedAt?.toISOString() ?? null],
    );
    if (!result.rows[0]) return sendError(response, 409, "Profil telah berubah. Muat ulang sebelum menyimpan.");
    sendJson(response, 200, { success: true, id: Number(result.rows[0].id), updatedAt: result.rows[0].updated_at });
    return true;
  }
  if (url.pathname === "/api/portal/vendor/quotes" && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const rfqId = Number(body?.rfqId);
    const vendorPrice = Number(body?.vendorPrice);
    const estimatedDays = body?.estimatedDays == null || body?.estimatedDays === "" ? null : Number(body.estimatedDays);
    if (!Number.isInteger(rfqId) || rfqId <= 0 || !Number.isFinite(vendorPrice) || vendorPrice <= 0) {
      return sendError(response, 400, "RFQ dan harga vendor wajib valid.");
    }
    if (estimatedDays != null && (!Number.isInteger(estimatedDays) || estimatedDays < 0 || estimatedDays > 3650)) {
      return sendError(response, 400, "Estimasi hari tidak valid.");
    }
    const clean = (value, max) => value == null ? null : String(value).trim().slice(0, max) || null;
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock($1, $2)", [rfqId, Number(vendor.supplier_id)]);
      const rfqResult = await client.query(
        `select id, order_id, status, vendor_ids
           from public.logistic_order_rfqs
          where id = $1 and $2 = any(coalesce(vendor_ids, '{}'::int[]))
          for update`,
        [rfqId, Number(vendor.supplier_id)],
      );
      const rfq = rfqResult.rows[0];
      if (!rfq) {
        const error = new Error("RFQ tidak ditemukan atau tidak ditujukan kepada vendor ini.");
        error.statusCode = 404;
        throw error;
      }
      if (!["open", "sent", "pending", "quoted"].includes(String(rfq.status ?? "").toLowerCase())) {
        const error = new Error("RFQ sudah tidak menerima quotation.");
        error.statusCode = 409;
        throw error;
      }
      const existing = await client.query(
        `select id, quote_status from public.logistic_order_quotes
          where rfq_id = $1 and vendor_id = $2 for update`,
        [rfqId, Number(vendor.supplier_id)],
      );
      if (existing.rows[0] && ["approved", "accepted", "selected"].includes(String(existing.rows[0].quote_status ?? "").toLowerCase())) {
        const error = new Error("Quotation yang sudah dipilih tidak dapat diubah.");
        error.statusCode = 409;
        throw error;
      }
      const result = await client.query(
        `insert into public.logistic_order_quotes
          (rfq_id, order_id, vendor_id, vendor_price, estimated_pickup, estimated_delivery,
           estimated_days, vendor_notes, quote_status, reply_source, reply_timestamp, currency)
         values ($1,$2,$3,$4,$5,$6,$7,$8,'pending','customer_portal',now(),'IDR')
         on conflict (rfq_id, vendor_id) do update
           set vendor_price = excluded.vendor_price,
               estimated_pickup = excluded.estimated_pickup,
               estimated_delivery = excluded.estimated_delivery,
               estimated_days = excluded.estimated_days,
               vendor_notes = excluded.vendor_notes,
               reply_source = excluded.reply_source,
               reply_timestamp = now()
         returning id, rfq_id, order_id, vendor_price, quote_status`,
        [rfqId, Number(rfq.order_id), Number(vendor.supplier_id), vendorPrice,
         clean(body?.estimatedPickup, 120), clean(body?.estimatedDelivery, 120),
         estimatedDays, clean(body?.vendorNotes, 2000)],
      );
      await client.query("commit");
      return sendJson(response, existing.rows[0] ? 200 : 201, {
        success: true, action: existing.rows[0] ? "updated" : "created",
        quote: { id: Number(result.rows[0].id), rfqId: Number(result.rows[0].rfq_id),
          orderId: Number(result.rows[0].order_id), vendorPrice: Number(result.rows[0].vendor_price),
          quoteStatus: result.rows[0].quote_status },
      });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  const marketplaceDeclineMatch = url.pathname.match(/^\/api\/portal\/vendor\/marketplace-quotes\/(\d+)\/decline$/);
  if (marketplaceDeclineMatch && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const quoteId = Number(marketplaceDeclineMatch[1]);
    const client = await pool.connect();
    try {
      await client.query("begin");
      const quoteResult = await client.query(
        `select q.id, q.rfq_id, q.vendor_id, q.status, r.status as rfq_status, r.rfq_number
           from public.mkt_vendor_quotes q
           join public.mkt_rfqs r on r.id = q.rfq_id
          where q.id = $1 and q.vendor_id = $2
          for update of q`,
        [quoteId, vendor.supplier_id],
      );
      const quote = quoteResult.rows[0];
      if (!quote) {
        const error = new Error("Quotation marketplace tidak ditemukan.");
        error.statusCode = 404;
        throw error;
      }
      if (quote.status === "withdrawn") {
        await client.query("commit");
        return sendJson(response, 200, { id: Number(quote.id), status: "withdrawn", alreadyProcessed: true });
      }
      if (!["invited", "opened", "requote_requested"].includes(quote.status)) {
        const error = new Error("Quotation tidak dapat ditolak pada status saat ini.");
        error.statusCode = 409;
        throw error;
      }
      if (["awarded", "cancelled", "expired"].includes(quote.rfq_status)) {
        const error = new Error("RFQ sudah tidak aktif.");
        error.statusCode = 409;
        throw error;
      }
      const updated = await client.query(
        `update public.mkt_vendor_quotes
            set status = 'withdrawn', updated_at = now()
          where id = $1 and vendor_id = $2 and status in ('invited','opened','requote_requested')
          returning id, rfq_id, status`,
        [quoteId, vendor.supplier_id],
      );
      await client.query(
        `insert into public.activity_logs
          (rfq_id, actor_type, actor_id, actor_name, action, old_value, new_value,
           description, mkt_rfq_id, mkt_vendor_quote_id, deduplication_key)
         values ($1,'vendor',$2,$3,'vendor_declined_quote',$4::jsonb,$5::jsonb,
                 'Vendor menolak undangan quotation',$1,$6,$7)
         on conflict (deduplication_key) where deduplication_key is not null do nothing`,
        [
          Number(updated.rows[0].rfq_id), String(user.id), user.name ?? user.email ?? "vendor",
          JSON.stringify({ status: quote.status }), JSON.stringify({ status: "withdrawn" }),
          quoteId, `rfq:${Number(updated.rows[0].rfq_id)}:vendor-decline:${quoteId}`,
        ],
      );
      await client.query(
        `insert into public.rfq_activity_logs
          (rfq_id, actor_type, actor_id, actor_name, action, description)
         select $1,'vendor',$2,$3,'vendor_declined_quote','Vendor menolak undangan quotation'
          where not exists (
            select 1 from public.rfq_activity_logs
             where rfq_id=$1 and actor_type='vendor' and actor_id=$2
               and action='vendor_declined_quote' and description='Vendor menolak undangan quotation'
          )`,
        [Number(updated.rows[0].rfq_id), String(user.id), user.name ?? user.email ?? "vendor"],
      );
      await client.query("commit");
      return sendJson(response, 200, { id: Number(updated.rows[0].id), status: updated.rows[0].status });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  if (url.pathname === "/api/portal/vendor/catalog-submissions" && request.method === "GET") {
    if (!vendor?.supplier_id) return sendJson(response, 200, { submissions: [] });
    const result = await query(
      `select id, name, category_key, service_type, template_kind, price_base, currency,
              stock_status, stock_qty, status, catalog_item_id, review_notes, submitted_at, updated_at
         from public.vendor_catalog_submissions
        where supplier_id = $1
        order by submitted_at desc, id desc
        limit 100`,
      [vendor.supplier_id],
    );
    sendJson(response, 200, { submissions: result.rows.map((row) => ({
      id: Number(row.id), name: row.name, categoryKey: row.category_key, serviceType: row.service_type,
      templateKind: row.template_kind, priceBase: Number(row.price_base ?? 0), currency: row.currency,
      stockStatus: row.stock_status, stockQty: row.stock_qty == null ? null : Number(row.stock_qty),
      status: row.status, catalogItemId: row.catalog_item_id == null ? null : Number(row.catalog_item_id),
      reviewNotes: row.review_notes, submittedAt: row.submitted_at, updatedAt: row.updated_at,
    })) });
    return true;
  }
  if (url.pathname === "/api/portal/vendor/featured-packages" && request.method === "GET") {
    const result = await query(
      `select id, code, name, description, duration_days, price, currency, placement_type, priority_weight, category_id
         from public.mkt_featured_packages
        where is_active = true and internal_only = false
        order by priority_weight desc, id asc`,
    );
    sendJson(response, 200, result.rows.map((row) => ({
      id: Number(row.id), code: row.code, name: row.name, description: row.description,
      durationDays: Number(row.duration_days), price: Number(row.price), currency: row.currency,
      placementType: row.placement_type, priorityWeight: Number(row.priority_weight),
      categoryId: row.category_id == null ? null : Number(row.category_id),
    })));
    return true;
  }
  if (url.pathname === "/api/portal/vendor/featured-requests" && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const catalogItemId = Number(body.catalogItemId);
    const packageId = Number(body.packageId);
    if (!Number.isInteger(catalogItemId) || !Number.isInteger(packageId)) {
      return sendError(response, 400, "Catalog item dan paket featured wajib valid.");
    }
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock($1)", [catalogItemId]);
      const item = await client.query(
        `select id from public.vendor_catalog_items
          where id = $1 and vendor_id = $2 and is_active = true and is_published = true
          for update`,
        [catalogItemId, vendor.supplier_id],
      );
      if (!item.rows[0]) {
        const error = new Error("Catalog item tidak tersedia atau bukan milik vendor.");
        error.statusCode = 404;
        throw error;
      }
      const pkg = await client.query(
        `select id, duration_days, price, currency from public.mkt_featured_packages
          where id = $1 and is_active = true and internal_only = false
          for share`,
        [packageId],
      );
      if (!pkg.rows[0]) {
        const error = new Error("Paket featured tidak tersedia.");
        error.statusCode = 404;
        throw error;
      }
      const existing = await client.query(
        `select id, status from public.mkt_featured_product_requests
          where catalog_item_id = $1 and status in ('pending','approved','active')
          order by id desc limit 1 for update`,
        [catalogItemId],
      );
      if (existing.rows[0]) {
        await client.query("commit");
        return sendJson(response, 200, { id: Number(existing.rows[0].id), status: existing.rows[0].status, alreadyProcessed: true });
      }
      const requestedStartAt = new Date(body.requestedStartAt ?? Date.now());
      if (Number.isNaN(requestedStartAt.getTime())) {
        const error = new Error("Tanggal mulai featured tidak valid.");
        error.statusCode = 400;
        throw error;
      }
      const requestedEndAt = new Date(requestedStartAt.getTime() + Number(pkg.rows[0].duration_days) * 86400000);
      const inserted = await client.query(
        `insert into public.mkt_featured_product_requests
          (vendor_id, catalog_item_id, package_id, status, requested_start_at, requested_end_at,
           price, currency, payment_status, company_id)
         values ($1,$2,$3,'pending',$4,$5,$6,$7,'unpaid',null)
         returning id, status, requested_start_at, requested_end_at, price, currency, payment_status`,
        [vendor.supplier_id, catalogItemId, packageId, requestedStartAt, requestedEndAt, pkg.rows[0].price, pkg.rows[0].currency],
      );
      await client.query("commit");
      return sendJson(response, 201, {
        id: Number(inserted.rows[0].id), status: inserted.rows[0].status,
        requestedStartAt: inserted.rows[0].requested_start_at, requestedEndAt: inserted.rows[0].requested_end_at,
        price: Number(inserted.rows[0].price), currency: inserted.rows[0].currency,
        paymentStatus: inserted.rows[0].payment_status,
      });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  const featuredCancelMatch = url.pathname.match(/^\/api\/portal\/vendor\/featured-requests\/(\d+)\/cancel$/);
  if (featuredCancelMatch && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const client = await pool.connect();
    try {
      await client.query("begin");
      const locked = await client.query(
        `select id, status from public.mkt_featured_product_requests
          where id = $1 and vendor_id = $2 for update`,
        [Number(featuredCancelMatch[1]), vendor.supplier_id],
      );
      if (!locked.rows[0]) {
        const error = new Error("Pengajuan featured tidak ditemukan.");
        error.statusCode = 404;
        throw error;
      }
      if (locked.rows[0].status === "cancelled") {
        await client.query("commit");
        return sendJson(response, 200, { id: Number(locked.rows[0].id), status: "cancelled", alreadyProcessed: true });
      }
      if (locked.rows[0].status !== "pending") {
        const error = new Error("Hanya pengajuan featured berstatus pending yang dapat dibatalkan.");
        error.statusCode = 409;
        throw error;
      }
      const updated = await client.query(
        `update public.mkt_featured_product_requests
            set status = 'cancelled', cancelled_at = now(), updated_at = now()
          where id = $1 and vendor_id = $2 and status = 'pending'
          returning id, status, cancelled_at`,
        [Number(featuredCancelMatch[1]), vendor.supplier_id],
      );
      await client.query("commit");
      return sendJson(response, 200, { id: Number(updated.rows[0].id), status: updated.rows[0].status, cancelledAt: updated.rows[0].cancelled_at });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  const featuredProofMatch = url.pathname.match(/^\/api\/portal\/vendor\/featured-requests\/(\d+)\/payment-proof$/);
  if (featuredProofMatch && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    if (!body.file || typeof body.file.arrayBuffer !== "function") {
      return sendError(response, 400, "File bukti pembayaran wajib diunggah.");
    }
    const requestId = Number(featuredProofMatch[1]);
    const current = await query(
      `select id, vendor_id, status, payment_status, payment_proof_url
         from public.mkt_featured_product_requests
        where id = $1 and vendor_id = $2
        limit 1`,
      [requestId, vendor.supplier_id],
    );
    const requestRow = current.rows[0];
    if (!requestRow) return sendError(response, 404, "Pengajuan featured tidak ditemukan.");
    if (!["pending", "approved"].includes(requestRow.status)) {
      return sendError(response, 409, "Bukti pembayaran tidak dapat diunggah pada status pengajuan ini.");
    }
    if (requestRow.payment_status === "verified") {
      return sendJson(response, 200, { id: requestId, paymentStatus: "verified", alreadyProcessed: true });
    }
    const uploaded = await uploadVendorFeaturedPaymentProof({
      vendorId: vendor.supplier_id,
      requestId,
      file: body.file,
    });
    const client = await pool.connect();
    try {
      await client.query("begin");
      const locked = await client.query(
        `select id, status, payment_status, payment_proof_url
           from public.mkt_featured_product_requests
          where id = $1 and vendor_id = $2
          for update`,
        [requestId, vendor.supplier_id],
      );
      const row = locked.rows[0];
      if (!row) {
        const error = new Error("Pengajuan featured tidak ditemukan.");
        error.statusCode = 404;
        throw error;
      }
      if (!["pending", "approved"].includes(row.status) || row.payment_status === "verified") {
        const error = new Error("Status pengajuan berubah; bukti pembayaran tidak disimpan.");
        error.statusCode = 409;
        throw error;
      }
      const paymentReference = String(body.paymentReference ?? "").trim().slice(0, 200) || null;
      const updated = await client.query(
        `update public.mkt_featured_product_requests
            set payment_proof_url = $1, payment_reference = $2,
                payment_status = 'pending_verification', updated_at = now()
          where id = $3 and vendor_id = $4
          returning id, payment_status, payment_reference, payment_proof_url`,
        [uploaded.path, paymentReference, requestId, vendor.supplier_id],
      );
      await client.query("commit");
      return sendJson(response, 200, {
        id: Number(updated.rows[0].id), paymentStatus: updated.rows[0].payment_status,
        paymentReference: updated.rows[0].payment_reference, proofUploaded: true,
      });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  if (url.pathname === "/api/portal/vendor/featured-requests" && request.method === "GET") {
    if (!vendor?.supplier_id) return sendJson(response, 200, []);
    const result = await query(
      `select r.*, p.name as package_name, i.name as catalog_item_name
         from public.mkt_featured_product_requests r
         join public.mkt_featured_packages p on p.id = r.package_id
         join public.vendor_catalog_items i on i.id = r.catalog_item_id
        where r.vendor_id = $1
        order by r.created_at desc, r.id desc
        limit 100`,
      [vendor.supplier_id],
    );
    sendJson(response, 200, await Promise.all(result.rows.map(async (row) => ({
      id: Number(row.id), catalogItemId: Number(row.catalog_item_id), catalogItemName: row.catalog_item_name,
      packageId: Number(row.package_id), packageName: row.package_name, status: row.status,
      requestedStartAt: row.requested_start_at, requestedEndAt: row.requested_end_at,
      approvedStartAt: row.approved_start_at, approvedEndAt: row.approved_end_at,
      price: Number(row.price ?? 0), currency: row.currency, paymentStatus: row.payment_status,
      paymentReference: row.payment_reference,
      paymentProofUrl: row.payment_proof_url ? await signedVendorFeaturedPaymentProofUrl({
        vendorId: vendor.supplier_id, requestId: row.id, path: row.payment_proof_url,
      }) : null,
      rejectionReason: row.rejection_reason, createdAt: row.created_at, updatedAt: row.updated_at,
    }))));
    return true;
  }
  if (url.pathname === "/api/portal/vendor/catalog" && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const name = text(body?.name);
    const kind = text(body?.templateKind, "product");
    if (!name) return sendError(response, 400, "Nama produk wajib diisi.");
    if (!["product","service"].includes(kind)) return sendError(response, 400, "Tipe katalog tidak valid.");
    const price = body?.priceSell == null || body.priceSell === "" ? null : Number(body.priceSell);
    if (price != null && (!Number.isFinite(price) || price < 0)) return sendError(response, 400, "Harga tidak valid.");
    const result = await query(
      `insert into public.vendor_catalog_items
       (vendor_id,type,name,description,unit,price_base,price_sell,currency,kategori,category_key,
        template_kind,moq,origin,hs_code,vendor_name,status,is_published,is_active,media_assets,documents)
       values ($1,$2,$3,$4,$5,$6,$6,'IDR',$7,$7,$2,$8,$9,$10,$11,'draft',false,true,'[]'::jsonb,'[]'::jsonb)
       returning id`,
      [vendor.supplier_id,kind,name,text(body?.description),text(body?.unit,"unit"),price,text(body?.kategori),
       body?.moq == null || body.moq === "" ? null : Number(body.moq),text(body?.origin),text(body?.hsCode),vendor.supplier_name ?? vendor.company_name ?? user.company ?? null],
    );
    sendJson(response, 201, { id:Number(result.rows[0].id), status:"draft", isPublished:false });
    return true;
  }

  const catalogItemMatch = url.pathname.match(/^\/api\/portal\/vendor\/catalog\/(\d+)$/);
  if (catalogItemMatch && request.method === "PUT") {
    if (!vendor?.supplier_id) return sendError(response,403,"Supplier vendor belum terhubung.");
    const id=Number(catalogItemMatch[1]), name=text(body?.name), kind=text(body?.templateKind,"product");
    if(!name || !["product","service"].includes(kind)) return sendError(response,400,"Data produk tidak valid.");
    const price=body?.priceSell==null||body.priceSell===""?null:Number(body.priceSell);
    const result=await query(`update public.vendor_catalog_items set name=$1,type=$2,template_kind=$2,description=$3,kategori=$4,category_key=$4,
      price_base=coalesce($5,price_base),price_sell=coalesce($5,price_sell),unit=$6,moq=$7,origin=$8,hs_code=$9,updated_at=now()
      where id=$10 and vendor_id=$11 and is_active=true returning id`,
      [name,kind,text(body?.description),text(body?.kategori),price,text(body?.unit,"unit"),body?.moq==null||body.moq===""?null:Number(body.moq),text(body?.origin),text(body?.hsCode),id,vendor.supplier_id]);
    if(!result.rowCount)return sendError(response,404,"Produk vendor tidak ditemukan."); sendJson(response,200,{ok:true,id}); return true;
  }

  const catalogMediaUploadMatch=url.pathname.match(/^\/api\/portal\/vendor\/catalog\/(\d+)\/media-assets\/upload$/);
  if(catalogMediaUploadMatch && request.method==="POST"){
    if(!vendor?.supplier_id)return sendError(response,403,"Supplier vendor belum terhubung.");
    const id=Number(catalogMediaUploadMatch[1]); const owned=await query("select id from public.vendor_catalog_items where id=$1 and vendor_id=$2 and is_active=true",[id,vendor.supplier_id]);
    if(!owned.rowCount)return sendError(response,404,"Produk vendor tidak ditemukan.");
    const uploaded=await uploadVendorCatalogAsset({vendorId:vendor.supplier_id,catalogItemId:id,file:body?.file});
    sendJson(response,201,uploaded); return true;
  }

  const catalogMediaMatch=url.pathname.match(/^\/api\/portal\/vendor\/catalog\/(\d+)\/media-assets$/);
  if(catalogMediaMatch && request.method==="PATCH"){
    if(!vendor?.supplier_id)return sendError(response,403,"Supplier vendor belum terhubung.");
    const assets=Array.isArray(body?.mediaAssets)?body.mediaAssets.slice(0,50):null;
    if(!assets)return sendError(response,400,"Media assets tidak valid.");
    const result=await query("update public.vendor_catalog_items set media_assets=$1::jsonb,updated_at=now() where id=$2 and vendor_id=$3 and is_active=true returning id",[JSON.stringify(assets),Number(catalogMediaMatch[1]),vendor.supplier_id]);
    if(!result.rowCount)return sendError(response,404,"Produk vendor tidak ditemukan."); sendJson(response,200,{ok:true,mediaAssets:assets}); return true;
  }

  const catalogActionMatch=url.pathname.match(/^\/api\/portal\/vendor\/catalog\/(\d+)\/(publish|unpublish|archive)$/);
  if(catalogActionMatch && request.method==="POST"){
    if(!vendor?.supplier_id)return sendError(response,403,"Supplier vendor belum terhubung.");
    const action=catalogActionMatch[2], published=false, active=action!=="archive", status=action==="archive"?"archived":action==="publish"?"pending_review":"draft";
    const result=await query("update public.vendor_catalog_items set is_published=$1,is_active=$2,status=$3,updated_at=now() where id=$4 and vendor_id=$5 returning id",[published,active,status,Number(catalogActionMatch[1]),vendor.supplier_id]);
    if(!result.rowCount)return sendError(response,404,"Produk vendor tidak ditemukan."); sendJson(response,200,{ok:true,status}); return true;
  }

  const catalogImageMatch = url.pathname.match(/^\/api\/portal\/vendor\/catalog\/(\d+)\/(?:image|images|upload)$/);
  if (catalogImageMatch && request.method === "POST") {
    if (!vendor?.supplier_id) return sendError(response, 403, "Supplier vendor belum terhubung.");
    const itemId = Number(catalogImageMatch[1]);
    const owned = await query("select id, media_assets from public.vendor_catalog_items where id=$1 and vendor_id=$2 limit 1", [itemId, vendor.supplier_id]);
    if (!owned.rows[0]) return sendError(response, 404, "Item katalog vendor tidak ditemukan.");
    if (!body?.file || typeof body.file.arrayBuffer !== "function") return sendError(response, 400, "File gambar wajib diunggah.");
    const uploaded = await uploadVendorCatalogImage({ vendorId: vendor.supplier_id, catalogItemId: itemId, file: body.file });
    const current = jsonValue(owned.rows[0].media_assets, []);
    const mediaAssets = [...(Array.isArray(current) ? current : []), { url: uploaded.url, path: uploaded.path, type: "image", mediaType: "image", isPrimary: !Array.isArray(current) || !current.some((asset) => asset?.isPrimary), originalFilename: uploaded.fileName }];
    await query("update public.vendor_catalog_items set media_assets=$1::jsonb, updated_at=now() where id=$2 and vendor_id=$3", [JSON.stringify(mediaAssets), itemId, vendor.supplier_id]);
    sendJson(response, 201, { success: true, image: mediaAssets[mediaAssets.length - 1], mediaAssets });
    return true;
  }

  if (url.pathname === "/api/portal/vendor/catalog" && request.method === "GET") {
    if (!vendor?.supplier_id) return sendJson(response, 200, { supplierId: null, supplierName: "", items: [] });
    const result = await query(
      `select * from public.vendor_catalog_items where vendor_id = $1 order by created_at desc, id desc`,
      [vendor.supplier_id],
    );
    sendJson(response, 200, {
      supplierId: Number(vendor.supplier_id),
      supplierName: vendor.supplier_name ?? "",
      items: result.rows.map((row) => {
        const mediaAssets = jsonValue(row.media_assets, []);
        return {
          id: Number(row.id),
          name: row.name,
          templateKind: row.template_kind ?? null,
          kategori: row.kategori ?? null,
          categoryKey: row.category_key ?? null,
          isActive: Boolean(row.is_active),
          isPublished: Boolean(row.is_published),
          status: row.status,
          description: row.description ?? null,
          moq: row.moq ?? null,
          origin: row.origin ?? null,
          hsCode: row.hs_code ?? null,
          priceSell: row.price_sell ?? null,
          unit: row.unit ?? null,
          mediaCount: Array.isArray(mediaAssets) ? mediaAssets.length : 0,
          images: [],
          mediaAssets: Array.isArray(mediaAssets) ? mediaAssets : [],
        };
      }),
    });
    return true;
  }
  if (url.pathname === "/api/portal/vendor/notifications" && request.method === "GET") {
    if (!vendor?.supplier_id) {
      return sendJson(response, 200, { notifications: [], unreadCount: 0, items: [], unread: 0 });
    }
    const result = await query(
      `select id, type, title, message, payload, is_read, created_at, read_at
         from public.vendor_notifications
        where vendor_id = $1
        order by created_at desc, id desc
        limit 100`,
      [user.id],
    );
    const notifications = result.rows.map((row) => ({
      ...row,
      id: Number(row.id),
      payload: jsonValue(row.payload, {}),
      isRead: Boolean(row.is_read),
      createdAt: row.created_at,
    }));
    const unreadCount = notifications.filter((row) => !row.isRead).length;
    sendJson(response, 200, { notifications, unreadCount, items: notifications, unread: unreadCount });
    return true;
  }
  const readMatch = url.pathname.match(/^\/api\/portal\/vendor\/notifications\/(\d+)\/read$/);
  if (readMatch && request.method === "POST") {
    if (vendor?.supplier_id) {
      await query(
        `update public.vendor_notifications set is_read = true, read_at = now()
          where id = $1 and vendor_id = $2`,
        [Number(readMatch[1]), user.id],
      );
    }
    sendEmpty(response, 204);
    return true;
  }
  if (url.pathname === "/api/portal/vendor/notifications/read-all" && request.method === "POST") {
    if (vendor?.supplier_id) {
      await query(
        `update public.vendor_notifications set is_read = true, read_at = now()
          where vendor_id = $1 and is_read = false`,
        [user.id],
      );
    }
    sendEmpty(response, 204);
    return true;
  }
  return false;
}