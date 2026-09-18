import { pool, query } from "./db.mjs";

function text(value, fallback = null) {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function id(value) {
  const result = Number(value);
  return Number.isInteger(result) && result > 0 ? result : null;
}

function mapPackage(row) {
  return {
    id: Number(row.id),
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    durationDays: Number(row.duration_days),
    price: Number(row.price),
    currency: row.currency,
    placementType: row.placement_type ?? null,
    priorityWeight: Number(row.priority_weight ?? 0),
    categoryId: row.category_id == null ? null : Number(row.category_id),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRequest(row) {
  return {
    id: Number(row.id),
    companyId: row.company_id == null ? null : Number(row.company_id),
    vendorId: Number(row.vendor_id),
    catalogItemId: Number(row.catalog_item_id),
    packageId: Number(row.package_id),
    status: row.status,
    requestedStartAt: row.requested_start_at,
    requestedEndAt: row.requested_end_at,
    approvedStartAt: row.approved_start_at,
    approvedEndAt: row.approved_end_at,
    price: Number(row.price),
    currency: row.currency,
    paymentStatus: row.payment_status,
    adminNotes: row.admin_notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    catalogItemName: row.catalog_item_name ?? null,
    vendorName: row.vendor_name ?? null,
    packageName: row.package_name ?? null,
    packageCode: row.package_code ?? null,
    featuredPriority: row.featured_priority == null ? null : Number(row.featured_priority),
  };
}

const requestSelect = `
  select r.*, i.name as catalog_item_name, s.name as vendor_name,
         p.name as package_name, p.code as package_code,
         p.priority_weight as featured_priority
    from public.mkt_featured_product_requests r
    left join public.vendor_catalog_items i on i.id = r.catalog_item_id
    left join public.suppliers s on s.id = r.vendor_id
    left join public.mkt_featured_packages p on p.id = r.package_id
`;

async function getRequest(requestId) {
  const result = await query(`${requestSelect} where r.id=$1 limit 1`, [requestId]);
  return result.rows[0] ?? null;
}

async function handlePackages({ request, response, url, body, sendJson, sendError, sendEmpty }) {
  if (url.pathname === "/api/portal/admin/featured-packages" && request.method === "GET") {
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const result = await query(
      `select id, code, name, description, duration_days, price, currency,
              placement_type, priority_weight, category_id, is_active, created_at, updated_at
         from public.mkt_featured_packages
        ${includeInactive ? "" : "where is_active = true"}
        order by priority_weight desc, id`,
    );
    sendJson(response, 200, result.rows.map(mapPackage));
    return true;
  }
  if (url.pathname === "/api/portal/admin/featured-packages" && request.method === "POST") {
    const code = text(body?.code);
    const name = text(body?.name);
    if (!code || !name) return sendError(response, 400, "Kode dan nama paket wajib diisi.");
    const result = await query(
      `insert into public.mkt_featured_packages
        (code,name,description,duration_days,price,currency,placement_type,priority_weight,category_id,is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
       returning id, code, name, description, duration_days, price, currency,
                 placement_type, priority_weight, category_id, is_active, created_at, updated_at`,
      [
        code,
        name,
        text(body.description),
        Math.max(1, Math.trunc(number(body.durationDays, 30))),
        Math.max(0, number(body.price)),
        text(body.currency, "IDR"),
        text(body.placementType),
        number(body.priorityWeight),
        id(body.categoryId),
      ],
    );
    sendJson(response, 201, mapPackage(result.rows[0]));
    return true;
  }
  const match = url.pathname.match(/^\/api\/portal\/admin\/featured-packages\/(\d+)$/);
  if (match && request.method === "PATCH") {
    const packageId = id(match[1]);
    const result = await query(
      `update public.mkt_featured_packages
          set code=$1, name=$2, description=$3, duration_days=$4, price=$5,
              currency=$6, placement_type=$7, priority_weight=$8, category_id=$9,
              updated_at=now()
        where id=$10
        returning id, code, name, description, duration_days, price, currency,
                  placement_type, priority_weight, category_id, is_active, created_at, updated_at`,
      [
        text(body?.code),
        text(body?.name),
        text(body?.description),
        Math.max(1, Math.trunc(number(body?.durationDays, 30))),
        Math.max(0, number(body?.price)),
        text(body?.currency, "IDR"),
        text(body?.placementType),
        number(body?.priorityWeight),
        id(body?.categoryId),
        packageId,
      ],
    );
    if (!result.rows[0]) return sendError(response, 404, "Paket tidak ditemukan.");
    sendJson(response, 200, mapPackage(result.rows[0]));
    return true;
  }
  const deactivate = url.pathname.match(/^\/api\/portal\/admin\/featured-packages\/(\d+)\/deactivate$/);
  if (deactivate && request.method === "POST") {
    const result = await query(
      "update public.mkt_featured_packages set is_active=false, updated_at=now() where id=$1 and is_active=true",
      [id(deactivate[1])],
    );
    if (!result.rowCount) return sendError(response, 404, "Paket tidak ditemukan.");
    sendEmpty(response, 204);
    return true;
  }
  return false;
}

async function handleRequests({ request, response, url, body, user, sendJson, sendError }) {
  if (url.pathname === "/api/portal/admin/featured-requests" && request.method === "GET") {
    const values = [];
    const conditions = [];
    const status = text(url.searchParams.get("status"));
    const paymentStatus = text(url.searchParams.get("paymentStatus"));
    if (status) {
      values.push(status);
      conditions.push(`r.status=$${values.length}`);
    }
    if (paymentStatus) {
      values.push(paymentStatus);
      conditions.push(`r.payment_status=$${values.length}`);
    }
    const result = await query(
      `${requestSelect} ${conditions.length ? `where ${conditions.join(" and ")}` : ""}
       order by r.created_at desc, r.id desc`,
      values,
    );
    sendJson(response, 200, result.rows.map(mapRequest));
    return true;
  }

  const action = url.pathname.match(/^\/api\/portal\/admin\/featured-requests\/(\d+)\/(approve|reject|verify-payment|activate)$/);
  if (!action || request.method !== "POST") return false;
  const requestId = id(action[1]);
  const current = await getRequest(requestId);
  if (!current) return sendError(response, 404, "Pengajuan tidak ditemukan.");
  const operation = action[2];

  if (operation === "approve") {
    if (current.status !== "pending") return sendError(response, 409, "Pengajuan bukan status pending.");
    const waivePayment = body?.waivePayment === true;
    const approvedStart = text(body?.approvedStartAt) ?? current.requested_start_at ?? new Date().toISOString();
    const approvedEnd = text(body?.approvedEndAt) ?? current.requested_end_at;
    await query(
      `update public.mkt_featured_product_requests
          set status='approved', approved_start_at=$1, approved_end_at=$2,
              payment_status=case when $3 then 'verified' else payment_status end,
              admin_notes=coalesce($4, admin_notes), approved_by=$5, approved_at=now(), updated_at=now()
        where id=$6`,
      [approvedStart, approvedEnd, waivePayment, text(body?.adminNotes), String(user.id), requestId],
    );
    sendJson(response, 200, { ok: true, status: "approved" });
    return true;
  }
  if (operation === "reject") {
    if (["active", "expired", "cancelled"].includes(current.status)) {
      return sendError(response, 409, "Pengajuan sudah tidak dapat ditolak.");
    }
    await query(
      `update public.mkt_featured_product_requests
          set status='rejected', rejection_reason=$1, rejected_by=$2, rejected_at=now(), updated_at=now()
        where id=$3`,
      [text(body?.reason, "Pengajuan ditolak oleh admin."), String(user.id), requestId],
    );
    sendJson(response, 200, { ok: true, status: "rejected" });
    return true;
  }
  if (operation === "verify-payment") {
    const approved = body?.approve !== false;
    await query(
      `update public.mkt_featured_product_requests
          set payment_status=$1, rejection_reason=case when $2 then rejection_reason else $3 end,
              updated_at=now()
        where id=$4`,
      [approved ? "verified" : "rejected", approved, text(body?.reason), requestId],
    );
    sendJson(response, 200, { ok: true, paymentStatus: approved ? "verified" : "rejected" });
    return true;
  }
  if (current.status !== "approved") return sendError(response, 409, "Pengajuan harus disetujui terlebih dahulu.");
  if (!["verified", "waived"].includes(current.payment_status)) {
    return sendError(response, 409, "Pembayaran belum diverifikasi.");
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    const updated = await client.query(
      `update public.mkt_featured_product_requests
          set status='active', activated_at=now(), updated_at=now()
        where id=$1 and status='approved'
        returning id, approved_start_at, approved_end_at`,
      [requestId],
    );
    if (!updated.rows[0]) throw Object.assign(new Error("Pengajuan sudah diproses."), { statusCode: 409 });
    await client.query(
      `update public.vendor_catalog_items i
          set is_featured=true, featured_start_at=coalesce($1, now()),
              featured_until=$2, featured_priority=$3, updated_at=now()
        from public.mkt_featured_product_requests r
        join public.mkt_featured_packages p on p.id=r.package_id
       where r.id=$4 and i.id=r.catalog_item_id and i.vendor_id=r.vendor_id`,
      [updated.rows[0].approved_start_at, updated.rows[0].approved_end_at, current.featured_priority ?? 0, requestId],
    );
    await client.query("commit");
    sendJson(response, 200, { ok: true, status: "active" });
    return true;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function handleInternal({ request, response, url, body, user, sendJson, sendError }) {
  if (url.pathname === "/api/portal/admin/internal-featured/vendors" && request.method === "GET") {
    const result = await query(
      `select distinct s.id, s.name
         from public.suppliers s
         join public.vendor_catalog_items i on i.vendor_id=s.id
        where i.is_active=true and s.is_active=true
        order by s.name, s.id`,
    );
    sendJson(response, 200, result.rows.map((row) => ({ id: Number(row.id), name: row.name })));
    return true;
  }
  const catalog = url.pathname.match(/^\/api\/portal\/admin\/internal-featured\/vendors\/(\d+)\/catalog$/);
  if (catalog && request.method === "GET") {
    const vendorId = id(catalog[1]);
    const result = await query(
      `select id, name, description, currency, price_sell, is_featured
         from public.vendor_catalog_items
        where vendor_id=$1 and is_active=true and coalesce(is_featured,false)=false
        order by name, id`,
      [vendorId],
    );
    sendJson(response, 200, result.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      description: row.description ?? null,
      currency: row.currency ?? "IDR",
      priceSell: row.price_sell == null ? null : String(row.price_sell),
      isFeatured: Boolean(row.is_featured),
    })));
    return true;
  }
  if (url.pathname === "/api/portal/admin/internal-featured/activate" && request.method === "POST") {
    const vendorId = id(body?.vendorId);
    const catalogItemId = id(body?.catalogItemId);
    const packageId = id(body?.packageId);
    if (!vendorId || !catalogItemId || !packageId || !body?.startAt || !body?.endAt) {
      return sendError(response, 400, "Vendor, produk, paket, dan periode wajib diisi.");
    }
    const packageRow = await query("select * from public.mkt_featured_packages where id=$1 and is_active=true", [packageId]);
    if (!packageRow.rows[0]) return sendError(response, 404, "Paket tidak ditemukan.");
    const client = await pool.connect();
    try {
      await client.query("begin");
      const item = await client.query(
        `select id from public.vendor_catalog_items
          where id=$1 and vendor_id=$2 and is_active=true and coalesce(is_featured,false)=false
          for update`,
        [catalogItemId, vendorId],
      );
      if (!item.rows[0]) throw Object.assign(new Error("Produk tidak tersedia untuk diaktifkan."), { statusCode: 409 });
      await client.query(
        `insert into public.mkt_featured_product_requests
          (company_id,vendor_id,catalog_item_id,package_id,status,requested_start_at,requested_end_at,
           approved_start_at,approved_end_at,price,currency,payment_status,approved_by,approved_at,activated_at)
         values (null,$1,$2,$3,'active',$4,$5,$4,$5,$6,$7,'waived',$8,now(),now())`,
        [vendorId, catalogItemId, packageId, body.startAt, body.endAt, packageRow.rows[0].price, packageRow.rows[0].currency, String(user.id)],
      );
      await client.query(
        `update public.vendor_catalog_items
            set is_featured=true, featured_start_at=$1, featured_until=$2,
                featured_priority=$3, updated_at=now()
          where id=$4`,
        [body.startAt, body.endAt, packageRow.rows[0].priority_weight, catalogItemId],
      );
      await client.query("commit");
      sendJson(response, 201, { ok: true });
      return true;
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  return false;
}

async function handleMaintenance({ request, response, url, body, sendJson, sendError }) {
  if (url.pathname !== "/api/portal/admin/featured-maintenance/scan" || request.method !== "GET") {
    if (url.pathname !== "/api/portal/admin/featured-maintenance/repair" || request.method !== "POST") return false;
  }
  const result = await query(
    `select i.id as catalog_item_id, i.name as item_name, i.vendor_id,
            s.name as vendor_name, i.featured_until,
            r.id as matching_request_id, r.status as matching_request_status
       from public.vendor_catalog_items i
       left join public.suppliers s on s.id=i.vendor_id
       left join lateral (
         select id, status from public.mkt_featured_product_requests
          where catalog_item_id=i.id and status='active'
          order by id desc limit 1
       ) r on true
      where i.is_featured=true
      order by i.id`,
  );
  const items = result.rows.map((row) => {
    const reasons = [];
    if (!row.matching_request_id) reasons.push("missing_active_request");
    if (row.featured_until && new Date(row.featured_until).getTime() < Date.now()) reasons.push("expired_featured_until");
    return {
      catalogItemId: Number(row.catalog_item_id),
      itemName: row.item_name,
      vendorId: Number(row.vendor_id),
      vendorName: row.vendor_name,
      featuredUntil: row.featured_until,
      matchingRequestId: row.matching_request_id == null ? null : Number(row.matching_request_id),
      matchingRequestStatus: row.matching_request_status,
      reasons,
    };
  }).filter((row) => row.reasons.length);
  const report = {
    scannedAt: new Date().toISOString(),
    totalFeaturedItems: result.rows.length,
    corruptCount: items.length,
    items,
  };
  if (url.pathname.endsWith("/scan")) {
    sendJson(response, 200, report);
    return true;
  }
  if (body?.mode !== "execute") {
    sendJson(response, 200, { mode: "dry-run", report, repaired: 0, failed: [] });
    return true;
  }
  let repaired = 0;
  for (const item of items) {
    const fixed = await query(
      `update public.vendor_catalog_items
          set is_featured=false, featured_until=null, featured_start_at=null,
              featured_priority=0, updated_at=now()
        where id=$1 and is_featured=true`,
      [item.catalogItemId],
    );
    repaired += fixed.rowCount;
  }
  sendJson(response, 200, { mode: "execute", report, repaired, failed: [] });
  return true;
}

export async function handleAdminFeatured(ctx) {
  if (await handlePackages(ctx)) return true;
  if (await handleRequests(ctx)) return true;
  if (await handleInternal(ctx)) return true;
  if (await handleMaintenance(ctx)) return true;
  return false;
}