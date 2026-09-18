import { query } from "./db.mjs";

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function numberOr(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function textOrNull(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function slug(value) {
  return String(value || "service")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "service";
}

function mediaItems(value) {
  const parsed = parseJson(value, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item) => item && (item.type === "image" || item.type === "video") && typeof item.url === "string")
    .map((item) => ({ type: item.type, url: item.url }));
}

function mapService(row) {
  return {
    id: Number(row.id),
    code: row.service_code ?? null,
    name: row.service_name ?? "",
    category: row.category ?? null,
    categories: row.category ? [row.category] : [],
    description: row.description ?? null,
    price: numberOr(row.base_price),
    basePrice: row.base_price == null ? null : numberOr(row.base_price),
    currency: row.currency ?? "IDR",
    estimatedDays: row.estimated_days ?? null,
    slaHours: row.sla_hours == null ? null : numberOr(row.sla_hours),
    isActive: row.is_active !== false,
    imageUrl: null,
    mediaItems: [],
  };
}

function mapProduct(row) {
  const media = mediaItems(row.media_items);
  const imageUrl = row.image_url ?? media.find((item) => item.type === "image")?.url ?? null;
  const unitOptions = parseJson(row.unit_options, []);
  const categories = [row.subcategory, row.item_type]
    .filter((value, index, values) => value && values.indexOf(value) === index);
  return {
    id: Number(row.id),
    name: row.name ?? "",
    description: row.description ?? null,
    price: numberOr(row.price),
    stock: 0,
    imageUrl,
    mediaItems: media,
    unit: row.unit ?? "pcs",
    unitOptions: Array.isArray(unitOptions) ? unitOptions : [],
    categories,
    subcategory: row.subcategory ?? null,
    currencyCode: row.currency_code ?? "IDR",
  };
}

function serviceCode(name) {
  return `service-${slug(name)}-${Date.now().toString(36)}`;
}

async function listServices() {
  const result = await query(
    `select id, service_code, service_name, category, description, base_price,
            currency, estimated_days, sla_hours, is_active
       from public.service_catalog
      where is_active = true
      order by category nulls last, service_name`,
  );
  return result.rows.map(mapService);
}

async function listProducts() {
  const result = await query(
    `select id, name, description, price, unit, unit_options, subcategory,
            image_url, media_items, item_type, currency_code, is_active
       from public.products
      where is_active = true and item_type <> 'jasa'
      order by id`,
  );
  return result.rows.map(mapProduct);
}

async function listCategories() {
  const result = await query(
    `select distinct name
       from (
         select nullif(trim(subcategory), '') as name
           from public.products
          where is_active = true and item_type <> 'jasa'
         union
         select nullif(trim(item_type), '') as name
           from public.products
          where is_active = true and item_type <> 'jasa'
       ) categories
      where name is not null
      order by name`,
  );
  return result.rows.map((row, index) => ({ id: index + 1, name: row.name }));
}

async function getService(id) {
  const result = await query(
    `select id, service_code, service_name, category, description, base_price,
            currency, estimated_days, sla_hours, is_active
       from public.service_catalog
      where id = $1
      limit 1`,
    [id],
  );
  return result.rows[0] ? mapService(result.rows[0]) : null;
}

async function getProduct(id) {
  const result = await query(
    `select id, name, description, price, unit, unit_options, subcategory,
            image_url, media_items, item_type, currency_code, is_active
       from public.products
      where id = $1
      limit 1`,
    [id],
  );
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function handleAdminCatalog({
  request,
  response,
  url,
  body,
  sendJson,
  sendError,
  sendEmpty,
}) {
  const { method } = request;
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/portal/admin/services") {
    sendJson(response, 200, await listServices());
    return true;
  }

  if (method === "POST" && pathname === "/api/portal/admin/services") {
    const name = textOrNull(body.name);
    if (!name) {
      sendError(response, 400, "Nama layanan wajib diisi.");
      return true;
    }
    const result = await query(
      `insert into public.service_catalog
         (service_code, service_name, category, description, base_price, currency, is_active)
       values ($1, $2, $3, $4, $5, $6, true)
       returning id, service_code, service_name, category, description, base_price,
                 currency, estimated_days, sla_hours, is_active`,
      [
        textOrNull(body.code) ?? serviceCode(name),
        name,
        textOrNull(body.category),
        textOrNull(body.description),
        numberOr(body.price),
        textOrNull(body.currency) ?? "IDR",
      ],
    );
    sendJson(response, 201, mapService(result.rows[0]));
    return true;
  }

  const serviceMatch = pathname.match(/^\/api\/portal\/admin\/services\/(\d+)$/);
  if (serviceMatch) {
    const id = validId(serviceMatch[1]);
    if (!id) {
      sendError(response, 400, "ID layanan tidak valid.");
      return true;
    }
    if (method === "PUT") {
      const existing = await getService(id);
      if (!existing) {
        sendError(response, 404, "Layanan tidak ditemukan.");
        return true;
      }
      const result = await query(
        `update public.service_catalog
            set service_name = coalesce($1, service_name),
                description = $2,
                base_price = coalesce($3, base_price),
                category = coalesce($4, category),
                currency = coalesce($5, currency)
          where id = $6
          returning id, service_code, service_name, category, description, base_price,
                    currency, estimated_days, sla_hours, is_active`,
        [
          textOrNull(body.name),
          body.description == null ? existing.description : textOrNull(body.description),
          body.price == null ? null : numberOr(body.price),
          textOrNull(body.category),
          textOrNull(body.currency),
          id,
        ],
      );
      sendJson(response, 200, mapService(result.rows[0]));
      return true;
    }
    if (method === "DELETE") {
      const result = await query(
        `update public.service_catalog
            set is_active = false
          where id = $1 and is_active = true`,
        [id],
      );
      if (!result.rowCount) {
        sendError(response, 404, "Layanan tidak ditemukan.");
        return true;
      }
      sendEmpty(response, 204);
      return true;
    }
  }

  if (method === "GET" && pathname === "/api/portal/admin/products") {
    sendJson(response, 200, await listProducts());
    return true;
  }

  if (method === "GET" && pathname === "/api/portal/admin/product-categories") {
    sendJson(response, 200, await listCategories());
    return true;
  }

  if (method === "POST" && pathname === "/api/portal/admin/products") {
    const name = textOrNull(body.name);
    if (!name) {
      sendError(response, 400, "Nama produk wajib diisi.");
      return true;
    }
    const categories = Array.isArray(body.categories)
      ? body.categories.map(textOrNull).filter(Boolean)
      : [];
    const media = mediaItems(body.mediaItems);
    const imageUrl = textOrNull(body.imageUrl) ?? media.find((item) => item.type === "image")?.url ?? null;
    const result = await query(
      `insert into public.products
         (name, description, price, unit, unit_options, subcategory, image_url,
          media_items, item_type, currency_code, is_active)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, 'barang', 'IDR', true)
       returning id, name, description, price, unit, unit_options, subcategory,
                 image_url, media_items, item_type, currency_code, is_active`,
      [
        name,
        textOrNull(body.description),
        numberOr(body.price),
        textOrNull(body.unit) ?? "pcs",
        JSON.stringify(Array.isArray(body.unitOptions) ? body.unitOptions : []),
        categories[0] ?? null,
        imageUrl,
        JSON.stringify(media),
      ],
    );
    sendJson(response, 201, mapProduct(result.rows[0]));
    return true;
  }

  const productMatch = pathname.match(/^\/api\/portal\/admin\/products\/(\d+)$/);
  if (productMatch) {
    const id = validId(productMatch[1]);
    if (!id) {
      sendError(response, 400, "ID produk tidak valid.");
      return true;
    }
    if (method === "PUT") {
      const existing = await getProduct(id);
      if (!existing) {
        sendError(response, 404, "Produk tidak ditemukan.");
        return true;
      }
      const categories = Array.isArray(body.categories)
        ? body.categories.map(textOrNull).filter(Boolean)
        : existing.categories;
      const media = body.mediaItems == null ? existing.mediaItems : mediaItems(body.mediaItems);
      const imageUrl = body.imageUrl === undefined
        ? existing.imageUrl
        : textOrNull(body.imageUrl) ?? media.find((item) => item.type === "image")?.url ?? null;
      const result = await query(
        `update public.products
            set name = coalesce($1, name),
                description = $2,
                price = coalesce($3, price),
                unit = coalesce($4, unit),
                unit_options = coalesce($5::jsonb, unit_options),
                subcategory = $6,
                image_url = $7,
                media_items = $8::jsonb
          where id = $9 and is_active = true
          returning id, name, description, price, unit, unit_options, subcategory,
                    image_url, media_items, item_type, currency_code, is_active`,
        [
          textOrNull(body.name),
          body.description == null ? existing.description : textOrNull(body.description),
          body.price == null ? null : numberOr(body.price),
          textOrNull(body.unit),
          body.unitOptions == null ? null : JSON.stringify(Array.isArray(body.unitOptions) ? body.unitOptions : []),
          categories[0] ?? null,
          imageUrl,
          JSON.stringify(media),
          id,
        ],
      );
      sendJson(response, 200, mapProduct(result.rows[0]));
      return true;
    }
    if (method === "DELETE") {
      const result = await query(
        `update public.products
            set is_active = false
          where id = $1 and is_active = true`,
        [id],
      );
      if (!result.rowCount) {
        sendError(response, 404, "Produk tidak ditemukan.");
        return true;
      }
      sendEmpty(response, 204);
      return true;
    }
  }

  return false;
}