import { retryWhatsAppLog } from "./whatsapp-service.mjs";
import crypto from "node:crypto";
import { query } from "./db.mjs";
import { uploadPublicAsset } from "./storage.mjs";

const DELIVERY_VENDOR_KEY = "admin_delivery_vendors";
const TRUCKING_RATES_KEY = "admin_trucking_rates";
const FREIGHT_RATES_KEY = "admin_freight_rates";
const MASTER_PRICE_APPROVAL_KEY = "master_price_require_approval";
const VEHICLE_IMAGES_KEY = "admin_vehicle_images";
const VEHICLE_ORDER_KEY = "admin_vehicle_order";
const VEHICLE_IDS = [
  "mobil", "mobil-xl", "van", "pickup-kecil", "box-kecil", "engkel",
  "double-engkel", "cdd-long", "fuso", "tronton", "truk-trailer", "truk-reefer",
];
const DEFAULT_DELIVERY_VENDORS = [
  { name: "JNE", logo: "📦", eta: "2-3 hari", fee: 0, note: "Hubungi untuk penawaran ongkir." },
  { name: "J&T Express", logo: "🚚", eta: "2-4 hari", fee: 0, note: "Hubungi untuk penawaran ongkir." },
  { name: "SiCepat", logo: "⚡", eta: "2-4 hari", fee: 0, note: "Hubungi untuk penawaran ongkir." },
  { name: "AnterAja", logo: "📮", eta: "2-4 hari", fee: 0, note: "Hubungi untuk penawaran ongkir." },
  { name: "Ninja Xpress", logo: "🥷", eta: "2-5 hari", fee: 0, note: "Hubungi untuk penawaran ongkir." },
];

function jsonValue(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function text(value) {
  return value == null ? null : String(value).trim() || null;
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function integer(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function sendCsv(response, csv, fileName) {
  response.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(csv);
}

async function getSetting(key, fallback) {
  const result = await query("select value from public.sc_settings where key = $1 limit 1", [key]);
  return result.rows[0] ? jsonValue(result.rows[0].value, fallback) : fallback;
}

async function setSetting(key, value) {
  await query(
    `insert into public.sc_settings (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update
       set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

async function handleVehicleSettings({ request, response, url, body, sendJson, sendError }) {
  if (url.pathname === "/api/settings/vehicle-images" && request.method === "GET") {
    const value = await getSetting(VEHICLE_IMAGES_KEY, {});
    sendJson(response, 200, value && typeof value === "object" && !Array.isArray(value) ? value : {});
    return true;
  }
  if (url.pathname === "/api/settings/vehicle-images" && request.method === "PUT") {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendError(response, 400, "Data gambar kendaraan tidak valid.");
      return true;
    }
    const images = {};
    for (const vehicleId of VEHICLE_IDS) {
      if (typeof body[vehicleId] === "string" && body[vehicleId].trim()) {
        images[vehicleId] = body[vehicleId].trim().slice(0, 2000);
      }
    }
    await setSetting(VEHICLE_IMAGES_KEY, images);
    sendJson(response, 200, images);
    return true;
  }
  if (url.pathname === "/api/settings/vehicle-images/upload" && request.method === "POST") {
    const uploaded = await uploadPublicAsset({ prefix: "portal-assets/vehicle-images", file: body?.file });
    sendJson(response, 201, uploaded);
    return true;
  }
  if (url.pathname === "/api/settings/vehicle-order" && request.method === "GET") {
    const value = await getSetting(VEHICLE_ORDER_KEY, []);
    const order = Array.isArray(value) ? value.filter((item) => VEHICLE_IDS.includes(item)) : [];
    sendJson(response, 200, order);
    return true;
  }
  if (url.pathname === "/api/settings/vehicle-order" && request.method === "PUT") {
    if (!Array.isArray(body)) {
      sendError(response, 400, "Urutan kendaraan tidak valid.");
      return true;
    }
    const order = [...new Set(body.filter((item) => typeof item === "string" && VEHICLE_IDS.includes(item)))];
    await setSetting(VEHICLE_ORDER_KEY, order);
    sendJson(response, 200, order);
    return true;
  }
  return false;
}

function mapDeliveryVendor(item, index) {
  return {
    id: integer(item?.id) ?? index + 1,
    name: text(item?.name) ?? "Vendor",
    logo: text(item?.logo) ?? "📦",
    eta: text(item?.eta) ?? "2-3 hari",
    fee: number(item?.fee),
    note: text(item?.note),
    isActive: item?.isActive !== false,
    sortOrder: number(item?.sortOrder, index),
    phone: text(item?.phone),
    email: text(item?.email),
    serviceType: text(item?.serviceType),
  };
}

async function handleContent({ request, response, url, body, user, sendJson, sendError }) {
  if (request.method === "GET" && url.pathname === "/api/portal/content") {
    const locale = text(url.searchParams.get("locale")) ?? "id-ID";
    const result = await query(
      `select key, value
         from public.portal_content
        where locale = $1
        order by key`,
      [locale],
    );
    sendJson(response, 200, Object.fromEntries(result.rows.map((row) => [row.key, row.value ?? ""])));
    return true;
  }

  if (request.method === "PUT" && url.pathname === "/api/portal/admin/content") {
    const locale = text(url.searchParams.get("locale")) ?? "id-ID";
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendError(response, 400, "Konten harus berupa object.");
      return true;
    }
    for (const [key, value] of Object.entries(body)) {
      if (!key || typeof value !== "string") continue;
      await query(
        `insert into public.portal_content (key, value, locale, updated_at)
         values ($1, $2, $3, now())
         on conflict (key, locale) do update
           set value = excluded.value, updated_at = now()`,
        [key, value, locale],
      );
    }
    sendJson(response, 200, { ok: true, locale });
    return true;
  }

  return false;
}

async function handleAdminUpload({ request, response, url, body, sendJson }) {
  if (request.method !== "POST" || url.pathname !== "/api/portal/admin/upload") return false;
  const uploaded = await uploadPublicAsset({
    prefix: "portal-assets/admin",
    file: body?.file,
  });
  sendJson(response, 201, uploaded);
  return true;
}

async function handleLogistics({ request, response, url, body, sendJson, sendError, sendEmpty }) {
  if (url.pathname === "/api/portal/admin/delivery-vendors") {
    const current = await getSetting(DELIVERY_VENDOR_KEY, null);
    const hasConfiguredVendors = Array.isArray(current);
    const vendors = hasConfiguredVendors
      ? current.map(mapDeliveryVendor)
      : DEFAULT_DELIVERY_VENDORS.map(mapDeliveryVendor);
    if (!hasConfiguredVendors) await setSetting(DELIVERY_VENDOR_KEY, vendors);
    if (request.method === "GET") {
      sendJson(response, 200, vendors);
      return true;
    }
    if (request.method === "POST") {
      const name = text(body.name);
      if (!name) {
        sendError(response, 400, "Nama vendor wajib diisi.");
        return true;
      }
      const next = mapDeliveryVendor({
        ...body,
        id: Math.max(0, ...vendors.map((vendor) => vendor.id)) + 1,
        name,
      }, vendors.length);
      await setSetting(DELIVERY_VENDOR_KEY, [...vendors, next]);
      sendJson(response, 201, next);
      return true;
    }
  }

  const vendorMatch = url.pathname.match(/^\/api\/portal\/admin\/delivery-vendors\/(\d+)$/);
  if (vendorMatch) {
    const id = Number(vendorMatch[1]);
    const current = await getSetting(DELIVERY_VENDOR_KEY, null);
    const vendors = Array.isArray(current) ? current.map(mapDeliveryVendor) : [];
    const index = vendors.findIndex((vendor) => vendor.id === id);
    if (index < 0) {
      sendError(response, 404, "Vendor kurir tidak ditemukan.");
      return true;
    }
    if (request.method === "PUT") {
      const updated = mapDeliveryVendor({ ...vendors[index], ...body, id }, index);
      vendors[index] = updated;
      await setSetting(DELIVERY_VENDOR_KEY, vendors);
      sendJson(response, 200, updated);
      return true;
    }
    if (request.method === "DELETE") {
      vendors.splice(index, 1);
      await setSetting(DELIVERY_VENDOR_KEY, vendors);
      sendEmpty(response, 204);
      return true;
    }
  }

  if (request.method === "GET" && url.pathname === "/api/portal/admin/trucking-rates") {
    sendJson(response, 200, await getSetting(TRUCKING_RATES_KEY, {}));
    return true;
  }
  if (request.method === "PUT" && url.pathname === "/api/portal/admin/trucking-rates") {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendError(response, 400, "Tarif trucking harus berupa object.");
      return true;
    }
    await setSetting(TRUCKING_RATES_KEY, body);
    sendJson(response, 200, body);
    return true;
  }
  if (request.method === "GET" && url.pathname === "/api/portal/admin/freight-rates") {
    sendJson(response, 200, await getSetting(FREIGHT_RATES_KEY, {
      seaLcl: { ratePerCbm: 0, label: "Sea Freight LCL" },
      seaFcl20: { flatRate: 0, label: "Sea Freight FCL 20ft" },
      seaFcl40: { flatRate: 0, label: "Sea Freight FCL 40ft" },
      air: { ratePerKg: 0, label: "Air Freight" },
      customClearance: { flatRate: 0, label: "Custom Clearance" },
    }));
    return true;
  }
  if (request.method === "PUT" && url.pathname === "/api/portal/admin/freight-rates") {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendError(response, 400, "Tarif freight harus berupa object.");
      return true;
    }
    await setSetting(FREIGHT_RATES_KEY, body);
    sendJson(response, 200, body);
    return true;
  }

  return false;
}

function mapMiniFormLink(row) {
  return {
    id: Number(row.id),
    token: row.token,
    serviceType: row.service_type,
    title: row.title ?? null,
    notes: row.notes ?? null,
    adminNotes: row.admin_notes ?? null,
    isActive: Boolean(row.is_active),
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    vendorName: row.vendor_name ?? null,
    maxSubmissions: row.max_submissions == null ? null : Number(row.max_submissions),
    submissionCount: Number(row.submission_count ?? 0),
    mode: row.mode,
    formTarget: row.form_target ?? "vendor",
  };
}

function mapMiniFormSubmission(row) {
  return {
    id: Number(row.id),
    linkId: row.link_id == null ? null : Number(row.link_id),
    serviceType: row.service_type,
    vendorName: row.vendor_name ?? null,
    contactPerson: row.contact_person ?? null,
    contactPhone: row.contact_phone ?? null,
    formData: jsonValue(row.form_data, {}),
    submittedAt: row.submitted_at,
  };
}

async function handleMiniForms({ request, response, url, body, user, sendJson, sendError, sendEmpty }) {
  if (url.pathname === "/api/portal/admin/vendor-form/links" && request.method === "GET") {
    const formTarget = text(url.searchParams.get("formTarget")) ?? "vendor";
    const result = await query(
      `select l.*, count(s.id)::int as submission_count
         from public.vendor_mini_form_links l
         left join public.vendor_mini_form_submissions s on s.link_id = l.id
        where coalesce(l.form_target, 'vendor') = $1
        group by l.id
        order by l.created_at desc`,
      [formTarget],
    );
    sendJson(response, 200, result.rows.map(mapMiniFormLink));
    return true;
  }

  if (url.pathname === "/api/portal/admin/vendor-form/submissions" && request.method === "GET") {
    const result = await query(
      `select id, link_id, service_type, vendor_name, contact_person, contact_phone,
              form_data, submitted_at
         from public.vendor_mini_form_submissions
        order by submitted_at desc
        limit 500`,
    );
    sendJson(response, 200, result.rows.map(mapMiniFormSubmission));
    return true;
  }

  if (url.pathname === "/api/portal/admin/vendor-form/links" && request.method === "POST") {
    const serviceType = text(body.serviceType);
    if (!serviceType) {
      sendError(response, 400, "Service type wajib diisi.");
      return true;
    }
    const token = crypto.randomBytes(24).toString("base64url");
    const expiresInDays = body.expiresInDays == null ? null : number(body.expiresInDays, 0);
    const expiresAt = expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 86_400_000) : null;
    const result = await query(
      `insert into public.vendor_mini_form_links
         (token, token_hash, service_type, title, notes, expires_at, is_active,
          created_by, mode, vendor_name, max_submissions, form_target)
       values ($1, encode(sha256(convert_to($1, 'UTF8')), 'hex'), $2, $3, $4, $5,
               true, $6, $7, $8, $9, $10)
       returning *`,
      [
        token,
        serviceType,
        text(body.title),
        text(body.notes),
        expiresAt,
        user?.email ?? null,
        text(body.mode) ?? "rate_collection",
        text(body.vendorName),
        body.maxSubmissions == null ? null : number(body.maxSubmissions),
        text(body.formTarget) ?? "vendor",
      ],
    );
    sendJson(response, 201, mapMiniFormLink({ ...result.rows[0], submission_count: 0 }));
    return true;
  }

  const linkMatch = url.pathname.match(/^\/api\/portal\/admin\/vendor-form\/links\/(\d+)$/);
  if (linkMatch) {
    const id = Number(linkMatch[1]);
    if (request.method === "PATCH") {
      const result = await query(
        `update public.vendor_mini_form_links
            set is_active = coalesce($1, is_active),
                title = coalesce($2, title),
                notes = coalesce($3, notes)
          where id = $4
          returning *`,
        [body.isActive == null ? null : Boolean(body.isActive), text(body.title), text(body.notes), id],
      );
      if (!result.rows[0]) {
        sendError(response, 404, "Link form tidak ditemukan.");
        return true;
      }
      sendJson(response, 200, mapMiniFormLink({ ...result.rows[0], submission_count: 0 }));
      return true;
    }
    if (request.method === "DELETE") {
      const result = await query(
        `update public.vendor_mini_form_links
            set is_active = false
          where id = $1 and is_active = true`,
        [id],
      );
      if (!result.rowCount) {
        sendError(response, 404, "Link form tidak ditemukan.");
        return true;
      }
      sendEmpty(response, 204);
      return true;
    }
  }

  return false;
}

function mapPriceItem(row) {
  const internal = row.vendor_id == null || Number(row.vendor_id) === 0 || row.vendor_type === "internal";
  return {
    id: Number(row.id),
    name: row.name,
    supplierName: row.vendor_name ?? (internal ? "Internal" : "—"),
    supplierId: row.vendor_id == null ? 0 : Number(row.vendor_id),
    category: row.category_key ?? row.kategori ?? null,
    isInternal: internal,
    status: row.status,
    isPublished: Boolean(row.is_published),
    priceBase: row.price_base == null ? null : Number(row.price_base),
    markupPct: number(row.markup_pct),
    priceSell: row.price_sell == null ? null : Number(row.price_sell),
    currency: row.currency ?? "IDR",
    updatedAt: row.updated_at ?? null,
  };
}

function mapHistory(row) {
  return {
    id: Number(row.id),
    catalogItemId: Number(row.catalog_item_id),
    itemName: row.item_name ?? null,
    vendorName: row.vendor_name ?? null,
    vendorType: row.vendor_type,
    priceBaseOld: row.price_base_old == null ? null : Number(row.price_base_old),
    priceBaseNew: row.price_base_new == null ? null : Number(row.price_base_new),
    markupOld: row.markup_old == null ? null : Number(row.markup_old),
    markupNew: row.markup_new == null ? null : Number(row.markup_new),
    priceSellOld: row.price_sell_old == null ? null : Number(row.price_sell_old),
    priceSellNew: row.price_sell_new == null ? null : Number(row.price_sell_new),
    currency: row.currency ?? "IDR",
    reason: row.reason ?? null,
    changedBy: row.changed_by ?? "admin",
    changedAt: row.changed_at,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by ?? null,
    approvedAt: row.approved_at ?? null,
    effectiveAt: row.effective_at ?? null,
  };
}

async function priceWhere(url) {
  const values = [];
  const conditions = ["is_active = true"];
  const add = (value, expression) => {
    values.push(value);
    conditions.push(expression.replace("?", `$${values.length}`));
  };
  const vendorType = url.searchParams.get("vendorType");
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const search = text(url.searchParams.get("search"));
  if (vendorType === "internal") conditions.push("(vendor_id is null or vendor_id = 0)");
  if (vendorType === "external") conditions.push("vendor_id is not null and vendor_id <> 0");
  if (status && status !== "all") add(status, "status = ?");
  if (category && category !== "all") {
    values.push(category);
    const first = `$${values.length}`;
    values.push(category);
    const second = `$${values.length}`;
    conditions.push(`(category_key = ${first} or kategori = ${second})`);
  }
  if (search) {
    values.push(`%${search}%`);
    const p = `$${values.length}`;
    conditions.push(`(name ilike ${p} or coalesce(vendor_name, '') ilike ${p})`);
  }
  return { where: conditions.join(" and "), values };
}

async function handleMasterPrice({ request, response, url, body, user, sendJson, sendError }) {
  const base = "/api/portal/admin/master-price";
  if (!(url.pathname === base || url.pathname.startsWith(`${base}/`))) return false;

  if (request.method === "GET" && url.pathname === `${base}/stats`) {
    const result = await query(
      `select
         count(*) filter (where vendor_id is null or vendor_id = 0)::int as total_internal,
         count(*) filter (where vendor_id is not null and vendor_id <> 0)::int as total_external,
         count(*) filter (where price_base is null)::int as without_price,
         count(*) filter (where updated_at >= current_date)::int as updated_today
       from public.vendor_catalog_items
      where is_active = true`,
    );
    const row = result.rows[0] ?? {};
    const pending = await query(
      "select count(*)::int as count from public.marketplace_price_history where approval_status = 'pending'",
    );
    sendJson(response, 200, {
      totalInternal: Number(row.total_internal ?? 0),
      totalExternal: Number(row.total_external ?? 0),
      withoutPrice: Number(row.without_price ?? 0),
      pendingApproval: Number(pending.rows[0]?.count ?? 0),
      updatedToday: Number(row.updated_today ?? 0),
      lastImport: null,
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === base) {
    const page = Math.max(1, number(url.searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, number(url.searchParams.get("limit"), 50)));
    const offset = (page - 1) * limit;
    const { where, values } = await priceWhere(url);
    const count = await query(`select count(*)::int as total from public.vendor_catalog_items where ${where}`, values);
    const rows = await query(
      `select id, name, vendor_id, vendor_name, category_key, kategori, status,
              is_published, price_base, markup_pct, price_sell, currency, updated_at
         from public.vendor_catalog_items
        where ${where}
        order by updated_at desc nulls last, id desc
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, limit, offset],
    );
    const total = Number(count.rows[0]?.total ?? 0);
    sendJson(response, 200, {
      data: rows.rows.map(mapPriceItem),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
    return true;
  }

  if (request.method === "GET" && url.pathname === `${base}/history`) {
    const page = Math.max(1, number(url.searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, number(url.searchParams.get("limit"), 50)));
    const offset = (page - 1) * limit;
    const count = await query("select count(*)::int as total from public.marketplace_price_history");
    const rows = await query(
      `select *
         from public.marketplace_price_history
        order by changed_at desc, id desc
        limit $1 offset $2`,
      [limit, offset],
    );
    const total = Number(count.rows[0]?.total ?? 0);
    sendJson(response, 200, { data: rows.rows.map(mapHistory), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    return true;
  }

  if (request.method === "GET" && url.pathname === `${base}/pending-approvals`) {
    const rows = await query(
      "select * from public.marketplace_price_history where approval_status = 'pending' order by changed_at desc, id desc",
    );
    sendJson(response, 200, { data: rows.rows.map(mapHistory) });
    return true;
  }

  if (request.method === "GET" && url.pathname === `${base}/config`) {
    const result = await query(
      "select value from public.marketplace_price_config where key = $1 limit 1",
      [MASTER_PRICE_APPROVAL_KEY],
    );
    sendJson(response, 200, { require_approval: result.rows[0]?.value ?? "false" });
    return true;
  }

  if (request.method === "PUT" && url.pathname === `${base}/config`) {
    const value = body.require_approval === true || body.require_approval === "true" ? "true" : "false";
    await query(
      `insert into public.marketplace_price_config (key, value, updated_at, updated_by)
       values ($1, $2, now(), $3)
       on conflict (key) do update
         set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`,
      [MASTER_PRICE_APPROVAL_KEY, value, user?.email ?? null],
    );
    sendJson(response, 200, { require_approval: value });
    return true;
  }

  if (request.method === "GET" && url.pathname === `${base}/export`) {
    const { where, values } = await priceWhere(url);
    const rows = await query(
      `select id, name, vendor_name, price_base, markup_pct, price_sell, currency, status
         from public.vendor_catalog_items
        where ${where}
        order by id`,
      values,
    );
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["id", "name", "vendor", "price_base", "markup_pct", "price_sell", "currency", "status"].join(","),
      ...rows.rows.map((row) => [
        row.id, row.name, row.vendor_name, row.price_base, row.markup_pct, row.price_sell, row.currency, row.status,
      ].map(escape).join(",")),
    ].join("\n");
    sendCsv(response, csv, "master-price.csv");
    return true;
  }

  const approvalMatch = url.pathname.match(new RegExp(`^${base}/approvals/(\\d+)/(approve|reject)$`));
  if (request.method === "POST" && approvalMatch) {
    const id = Number(approvalMatch[1]);
    const approved = approvalMatch[2] === "approve";
    const result = await query(
      `update public.marketplace_price_history
          set approval_status = $1, approved_by = $2, approved_at = now()
        where id = $3 and approval_status = 'pending'
        returning *`,
      [approved ? "approved" : "rejected", user?.email ?? "admin", id],
    );
    if (!result.rows[0]) {
      sendError(response, 404, "Perubahan harga pending tidak ditemukan.");
      return true;
    }
    if (approved) {
      await query(
        `update public.vendor_catalog_items i
            set price_base = h.price_base_new,
                markup_pct = coalesce(h.markup_new, i.markup_pct),
                price_sell = h.price_sell_new,
                updated_at = now()
           from public.marketplace_price_history h
          where h.id = $1 and i.id = h.catalog_item_id`,
        [id],
      );
    }
    sendJson(response, 200, { ok: true });
    return true;
  }

  const itemMatch = url.pathname.match(new RegExp(`^${base}/(\\d+)$`));
  if (request.method === "PATCH" && itemMatch) {
    const id = Number(itemMatch[1]);
    const current = await query(
      "select * from public.vendor_catalog_items where id = $1 and is_active = true limit 1",
      [id],
    );
    const row = current.rows[0];
    if (!row) {
      sendError(response, 404, "Item katalog tidak ditemukan.");
      return true;
    }
    const priceBase = number(body.priceBase, number(row.price_base));
    const markup = row.vendor_id == null || Number(row.vendor_id) === 0 ? 0 : number(body.markup, number(row.markup_pct));
    const priceSell = row.vendor_id == null || Number(row.vendor_id) === 0
      ? priceBase
      : Math.ceil(priceBase * (1 + markup / 100));
    const config = await query("select value from public.marketplace_price_config where key = $1 limit 1", [MASTER_PRICE_APPROVAL_KEY]);
    const pendingApproval = config.rows[0]?.value === "true" && row.vendor_id != null && Number(row.vendor_id) !== 0;
    const history = await query(
      `insert into public.marketplace_price_history
         (catalog_item_id, item_name, vendor_id, vendor_name, vendor_type,
          price_base_old, price_base_new, markup_old, markup_new,
          price_sell_old, price_sell_new, currency, reason, changed_by,
          approval_status, effective_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       returning id`,
      [
        id, row.name, row.vendor_id, row.vendor_name,
        row.vendor_id == null || Number(row.vendor_id) === 0 ? "internal" : "external",
        row.price_base, priceBase, row.markup_pct, markup, row.price_sell, priceSell,
        row.currency ?? "IDR", text(body.reason), user?.email ?? "admin",
        pendingApproval ? "pending" : "auto_approved", body.effectiveAt ?? null,
      ],
    );
    if (!pendingApproval) {
      await query(
        `update public.vendor_catalog_items
            set price_base = $1, markup_pct = $2, price_sell = $3, updated_at = now()
          where id = $4`,
        [priceBase, markup, priceSell, id],
      );
    }
    sendJson(response, 200, {
      ok: true,
      pendingApproval,
      historyId: Number(history.rows[0]?.id),
      scheduledAt: body.effectiveAt ?? null,
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === `${base}/bulk-update`) {
    const ids = Array.isArray(body.ids) ? body.ids.map(integer).filter(Boolean) : [];
    const results = [];
    for (const id of ids) {
      try {
        const current = await query("select * from public.vendor_catalog_items where id = $1 and is_active = true limit 1", [id]);
        if (!current.rows[0]) throw new Error("Item tidak ditemukan");
        const row = current.rows[0];
        const priceBase = body.priceBase == null ? number(row.price_base) : number(body.priceBase);
        const markup = row.vendor_id == null || Number(row.vendor_id) === 0 ? 0 : body.markup == null ? number(row.markup_pct) : number(body.markup);
        const priceSell = row.vendor_id == null || Number(row.vendor_id) === 0 ? priceBase : Math.ceil(priceBase * (1 + markup / 100));
        await query(
          `update public.vendor_catalog_items
              set price_base=$1, markup_pct=$2, price_sell=$3, updated_at=now()
            where id=$4`,
          [priceBase, markup, priceSell, id],
        );
        results.push({ id, ok: true });
      } catch (error) {
        results.push({ id, ok: false, message: error.message });
      }
    }
    sendJson(response, 200, { ok: true, results });
    return true;
  }

  if (request.method === "POST" && url.pathname === `${base}/import`) {
    sendError(response, 501, "Import master price belum tersedia pada API standalone.");
    return true;
  }

  return false;
}

function mapWaLog(row) {
  return {
    id: Number(row.id),
    recipient: row.phone,
    status: row.status,
    context: row.message_type ?? null,
    refType: null,
    refId: row.invoice_id == null ? null : String(row.invoice_id),
    errorMsg: row.error_message ?? null,
    retryCount: null,
    nextRetryAt: null,
    waMessageId: null,
    waDeliveryStatus: null,
    deliveredAt: null,
    readAt: null,
    createdAt: row.created_at,
  };
}

async function handleWaLogs({ request, response, url, sendJson, sendError }) {
  const statsPath = url.pathname === "/api/portal/admin/wa-logs/stats";
  const listPath = url.pathname === "/api/portal/admin/wa-logs";
  if (statsPath && request.method === "GET") {
    const result = await query(
      `select
         count(*) filter (where status = 'sent')::int as sent,
         count(*) filter (where status = 'failed')::int as failed,
         count(*) filter (where status = 'deduped')::int as deduped,
         count(*) filter (where status = 'sent' and created_at >= current_date)::int as today_sent,
         count(*) filter (where status = 'failed' and created_at >= current_date)::int as today_failed,
         count(*) filter (where status = 'deduped' and created_at >= current_date)::int as today_deduped
       from public.wa_send_logs`,
    );
    const row = result.rows[0] ?? {};
    sendJson(response, 200, {
      allTime: { sent: Number(row.sent ?? 0), failed: Number(row.failed ?? 0), deduped: Number(row.deduped ?? 0) },
      today: { sent: Number(row.today_sent ?? 0), failed: Number(row.today_failed ?? 0), deduped: Number(row.today_deduped ?? 0) },
    });
    return true;
  }
  if (listPath && request.method === "GET") {
    const limit = Math.min(500, Math.max(1, number(url.searchParams.get("limit"), 100)));
    const status = text(url.searchParams.get("status"));
    const values = [];
    const where = [];
    if (status && status !== "all") {
      values.push(status);
      where.push(`status = $${values.length}`);
    }
    const condition = where.length ? `where ${where.join(" and ")}` : "";
    const count = await query(`select count(*)::int as total from public.wa_send_logs ${condition}`, values);
    const rows = await query(
      `select id, phone, message_type, status, error_message, invoice_id, created_at
         from public.wa_send_logs
        ${condition}
        order by created_at desc
        limit $${values.length + 1}`,
      [...values, limit],
    );
    sendJson(response, 200, { rows: rows.rows.map(mapWaLog), total: Number(count.rows[0]?.total ?? 0) });
    return true;
  }
  const retry = url.pathname.match(/^\/api\/portal\/admin\/wa-logs\/(\d+)\/retry$/);
  if (retry && request.method === "POST") {
    const result = await retryWhatsAppLog(Number(retry[1]));
    if (!result.found) {
      sendError(response, 404, "Log WhatsApp tidak ditemukan.");
    } else if (!result.retryable) {
      sendError(response, 409, "Hanya log WhatsApp berstatus gagal yang dapat dikirim ulang.");
    } else if (!result.sent) {
      sendError(response, 502, result.error || "Fonnte gagal mengirim ulang pesan.");
    } else {
      sendJson(response, 200, { ok: true, status: "sent" });
    }
    return true;
  }
  return false;
}

export async function handlePortalContent(ctx) {
  return handleContent(ctx);
}

export async function handleAdminLegacy(ctx) {
  if (await handleAdminUpload(ctx)) return true;
  if (await handleVehicleSettings(ctx)) return true;
  if (await handleContent(ctx)) return true;
  if (await handleLogistics(ctx)) return true;
  if (await handleMiniForms(ctx)) return true;
  if (await handleMasterPrice(ctx)) return true;
  if (await handleWaLogs(ctx)) return true;
  return false;
}