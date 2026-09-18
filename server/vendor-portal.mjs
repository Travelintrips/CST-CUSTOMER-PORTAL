import crypto from "node:crypto";
import { pool, query } from "./db.mjs";
import { createSession, sessionCookies } from "./session.mjs";
import { normalizePhone, normalizedEmail } from "./auth-providers.mjs";
import {
  signedVendorInvitationAssetUrl,
  uploadVendorInvitationAsset,
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
              count(v.id) as total_items
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

export async function handleVendorPortalRoutes({ request, response, url, user, sendJson, sendError, sendEmpty }) {
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
      rfqs: [],
      quotes: [],
      marketplaceRfqs: [],
      marketplaceOrders: [],
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
        bankAccountName: null,
        verificationStatus: vendor.verification_status ?? "pending",
        supplierId: vendor.supplier_id == null ? null : Number(vendor.supplier_id),
        approvedAt: vendor.approved_at ?? null,
        updatedAt: vendor.updated_at ?? null,
      } : null,
      submissionLink: null,
    });
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