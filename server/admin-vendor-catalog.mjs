import { query } from "./db.mjs";
import { deletePublicAsset, uploadPublicAsset, uploadVendorCatalogAsset } from "./storage.mjs";

function text(value, fallback = null) {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function jsonValue(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mediaRows(value) {
  const rows = jsonValue(value, []);
  return Array.isArray(rows)
    ? rows.map((row) => ({
      id: Number(row.id),
      media_type: row.media_type ?? row.mediaType ?? "image",
      file_url: row.file_url ?? row.url ?? null,
      thumbnail_url: row.thumbnail_url ?? row.thumbnailUrl ?? null,
      external_url: row.external_url ?? row.externalUrl ?? null,
      title: row.title ?? null,
      description: row.description ?? null,
      sort_order: Number(row.sort_order ?? row.sortOrder ?? 0),
      is_primary: Boolean(row.is_primary ?? row.isPrimary),
      visibility: row.visibility ?? "public",
      original_filename: row.original_filename ?? row.originalFilename ?? null,
      storage_path: row.storage_path ?? row.storagePath ?? null,
    }))
    : [];
}

function mapItem(row) {
  return {
    id: Number(row.id),
    vendor_id: Number(row.vendor_id),
    vendor_name: row.vendor_name ?? null,
    name: row.name,
    description: row.description ?? null,
    kategori: row.kategori ?? null,
    type: row.type,
    template_kind: row.template_kind ?? null,
    status: row.status,
    is_published: Boolean(row.is_published),
    is_active: Boolean(row.is_active),
    is_internal_vendor: Boolean(row.is_internal_vendor),
    price_base: row.price_base == null ? null : String(row.price_base),
    markup_pct: row.markup_pct == null ? null : String(row.markup_pct),
    price_sell: row.price_sell == null ? null : String(row.price_sell),
    currency: row.currency ?? "IDR",
    created_at: row.created_at,
    supplier_service_type: row.supplier_service_type ?? null,
    contact_email: row.contact_email ?? null,
    phone: row.phone ?? null,
    media: mediaRows(row.media),
    media_assets: Array.isArray(jsonValue(row.media_assets, [])) ? jsonValue(row.media_assets, []) : [],
    documents: Array.isArray(jsonValue(row.documents, [])) ? jsonValue(row.documents, []) : [],
  };
}

const itemSelect = `
  select v.id, v.vendor_id, v.type, v.name, v.description, v.price_base,
         v.markup_pct, v.is_active, v.kategori, v.template_kind, v.status, v.is_internal_vendor,
         v.is_published, v.price_sell, v.currency, v.created_at,
         v.media_assets, v.documents,
         s.name as vendor_name, s.service_type as supplier_service_type,
         s.contact_email, s.phone,
         coalesce((
           select json_agg(json_build_object(
             'id', m.id, 'media_type', m.media_type, 'file_url', m.file_url,
             'thumbnail_url', m.thumbnail_url, 'external_url', m.external_url,
             'title', m.title, 'description', m.description,
             'sort_order', m.sort_order, 'is_primary', m.is_primary,
             'visibility', m.visibility, 'original_filename', m.original_filename,
             'storage_path', m.storage_path
           ) order by m.sort_order, m.id)
           from public.product_media m
          where m.vendor_catalog_item_id = v.id and m.is_active = true
         ), '[]'::json) as media
    from public.vendor_catalog_items v
    left join public.suppliers s on s.id = v.vendor_id
`;

async function getItem(id) {
  const result = await query(`${itemSelect} where v.id = $1 limit 1`, [id]);
  return result.rows[0] ? mapItem(result.rows[0]) : null;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function handleAdminVendorCatalog({
  request,
  response,
  url,
  body,
  sendJson,
  sendError,
  sendEmpty,
}) {
  const pathname = url.pathname;

  if (request.method === "GET" && pathname === "/api/portal/admin/vendor-catalog-items") {
    const result = await query(`${itemSelect} where v.is_active = true order by v.created_at desc, v.id desc`);
    sendJson(response, 200, result.rows.map(mapItem));
    return true;
  }

  if (request.method === "POST" && pathname === "/api/portal/admin/vendor-catalog-items") {
    const vendorId=validId(body?.vendor_id), name=text(body?.name), type=text(body?.type,"product");
    if(!vendorId)return sendError(response,400,"Vendor wajib dipilih.");
    if(!name)return sendError(response,400,"Nama produk wajib diisi.");
    if(!["product","service"].includes(type))return sendError(response,400,"Tipe katalog tidak valid.");
    const supplier=await query("select id,name from public.suppliers where id=$1 and is_active=true limit 1",[vendorId]);
    if(!supplier.rowCount)return sendError(response,404,"Vendor aktif tidak ditemukan.");
    const base=body?.price_base==null?0:number(body.price_base), internal=Boolean(body?.is_internal_vendor), markup=internal?0:number(body?.markup_pct);
    const sell=Math.round(base*(1+markup/100)*100)/100, published=Boolean(body?.is_published);
    const result=await query(`insert into public.vendor_catalog_items
      (vendor_id,type,name,description,unit,price_base,markup_pct,price_sell,currency,kategori,category_key,template_kind,
       moq,lead_time,origin,hs_code,vendor_name,status,is_published,is_active,is_internal_vendor,is_featured,media_assets,documents)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$2,$11,$12,$13,$14,$15,$16,$17,true,$18,$19,'[]'::jsonb,'[]'::jsonb)
      returning id`,
      [vendorId,type,name,text(body?.description),text(body?.unit,"unit"),base,markup,sell,text(body?.currency,"IDR"),text(body?.kategori),
       body?.moq==null?null:number(body.moq),text(body?.lead_time),text(body?.origin),text(body?.hs_code),supplier.rows[0].name,
       published?"published":"draft",published,internal,Boolean(body?.is_featured)]);
    sendJson(response,201,{id:Number(result.rows[0].id),price_sell:sell,effective_markup:markup,is_internal_vendor:internal}); return true;
  }

  const itemMatch = pathname.match(/^\/api\/portal\/admin\/vendor-catalog-items\/(\d+)$/);
  if (itemMatch) {
    const id = validId(itemMatch[1]);
    if (!id) {
      sendError(response, 400, "ID katalog tidak valid.");
      return true;
    }
    if (request.method === "PUT") {
      const current = await getItem(id);
      if (!current) {
        sendError(response, 404, "Item katalog tidak ditemukan.");
        return true;
      }
      const name = text(body?.name);
      if (!name) {
        sendError(response, 400, "Nama produk wajib diisi.");
        return true;
      }
      const base = body?.price_base == null ? null : number(body.price_base);
      const markup = current.is_internal_vendor ? 0 : number(body?.markup_pct);
      const sell = base == null ? null : Math.round(base * (1 + markup / 100) * 100) / 100;
      await query(
        `update public.vendor_catalog_items
            set name=$1, description=$2, price_base=coalesce($3, price_base),
                markup_pct=$4, price_sell=$5, kategori=$6,
                template_kind=$7, type=$7, updated_at=now()
          where id=$8`,
        [
          name,
          text(body?.description),
          base,
          markup,
          sell,
          text(body?.kategori),
          text(body?.template_kind, current.template_kind ?? current.type ?? "product"),
          id,
        ],
      );
      const updated = await getItem(id);
      sendJson(response, 200, {
        ok: true,
        price_sell: updated?.price_sell == null ? null : Number(updated.price_sell),
        effective_markup: updated?.markup_pct == null ? 0 : Number(updated.markup_pct),
      });
      return true;
    }
    if (request.method === "PATCH") {
      if (body?.is_published !== undefined) {
        const published = Boolean(body.is_published);
        const result = await query(
          `update public.vendor_catalog_items
              set is_published=$1,
                  status=case when $1 then 'published' else 'draft' end,
                  published_at=case when $1 then coalesce(published_at, now()) else published_at end,
                  updated_at=now()
            where id=$2 and is_active=true
            returning id`,
          [published, id],
        );
        if (!result.rowCount) {
          sendError(response, 404, "Item katalog tidak ditemukan.");
          return true;
        }
      }
      sendJson(response, 200, { ok: true });
      return true;
    }
    if (request.method === "DELETE") {
      const result = await query(
        `update public.vendor_catalog_items
            set is_active=false, is_published=false, status='inactive', updated_at=now()
          where id=$1 and is_active=true`,
        [id],
      );
      if (!result.rowCount) {
        sendError(response, 404, "Item katalog tidak ditemukan.");
        return true;
      }
      sendEmpty(response, 204);
      return true;
    }
  }

  const mediaMatch = pathname.match(/^\/api\/portal\/admin\/vendor-catalog-items\/(\d+)\/media$/);
  if (mediaMatch && request.method === "POST") {
    const itemId = validId(mediaMatch[1]);
    if (!itemId) {
      sendError(response, 400, "ID katalog tidak valid.");
      return true;
    }
    const item = await getItem(itemId);
    if (!item) {
      sendError(response, 404, "Item katalog tidak ditemukan.");
      return true;
    }
    const uploaded = await uploadPublicAsset({
      prefix: `portal-assets/vendor-catalog/${item.vendor_id}/${itemId}`,
      file: body?.file,
    });
    try {
      const created = await query(
        `insert into public.product_media
          (vendor_catalog_item_id, vendor_id, media_type, file_url,
           original_filename, sort_order, is_primary, is_active,
           uploaded_by, uploaded_by_role, storage_path, visibility,
           created_at, updated_at)
         values ($1,$2,'image',$3,$4,
                 coalesce((select max(sort_order)+1 from public.product_media where vendor_catalog_item_id=$1),0),
                 false,true,$5,'admin',$6,'public',now(),now())
         returning id, media_type, file_url, original_filename, sort_order,
                   is_primary, visibility, storage_path`,
        [itemId, item.vendor_id, uploaded.url, uploaded.fileName, "admin", uploaded.path],
      );
      sendJson(response, 201, { ok: true, media: created.rows[0] });
    } catch (error) {
      await deletePublicAsset(uploaded.path).catch(() => {});
      throw error;
    }
    return true;
  }

  const mediaAssetUploadMatch=pathname.match(/^\/api\/portal\/admin\/vendor-catalog-items\/(\d+)\/media-assets\/upload$/);
  if(mediaAssetUploadMatch && request.method==="POST"){
    const itemId=validId(mediaAssetUploadMatch[1]); const item=itemId?await getItem(itemId):null;
    if(!item)return sendError(response,404,"Item katalog tidak ditemukan.");
    const uploaded=await uploadVendorCatalogAsset({vendorId:item.vendor_id,catalogItemId:itemId,file:body?.file});
    sendJson(response,201,{url:uploaded.url,objectPath:uploaded.objectPath,mimeType:uploaded.mimeType,sizeBytes:uploaded.sizeBytes}); return true;
  }
  const mediaAssetsMatch=pathname.match(/^\/api\/portal\/admin\/vendor-catalog-items\/(\d+)\/media-assets$/);
  if(mediaAssetsMatch && request.method==="PATCH"){
    const itemId=validId(mediaAssetsMatch[1]), assets=Array.isArray(body?.mediaAssets)?body.mediaAssets.slice(0,50):null;
    if(!itemId||!assets)return sendError(response,400,"Media assets tidak valid.");
    const result=await query("update public.vendor_catalog_items set media_assets=$1::jsonb,updated_at=now() where id=$2 and is_active=true returning id",[JSON.stringify(assets),itemId]);
    if(!result.rowCount)return sendError(response,404,"Item katalog tidak ditemukan."); sendJson(response,200,{ok:true,mediaAssets:assets}); return true;
  }

  const mediaDeleteMatch = pathname.match(/^\/api\/portal\/admin\/vendor-catalog-items\/media\/(\d+)$/);
  if (mediaDeleteMatch && request.method === "DELETE") {
    const mediaId = validId(mediaDeleteMatch[1]);
    if (!mediaId) {
      sendError(response, 400, "ID media tidak valid.");
      return true;
    }
    const media = await query(
      `select id, storage_path from public.product_media
        where id=$1 and is_active=true
        limit 1`,
      [mediaId],
    );
    if (!media.rows[0]) {
      sendError(response, 404, "Media tidak ditemukan.");
      return true;
    }
    await query("delete from public.product_media where id=$1", [mediaId]);
    if (media.rows[0].storage_path) {
      await deletePublicAsset(media.rows[0].storage_path).catch(() => {});
    }
    sendEmpty(response, 204);
    return true;
  }

  return false;
}