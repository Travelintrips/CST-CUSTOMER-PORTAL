import { createHash } from "node:crypto";
import { pool } from "./db.mjs";
import {
  assertDevCorporatePoAffiliation,
  corporatePoApprovalGateDevEnabled,
} from "./corporate-po-affiliation-gate.mjs";

function refuse(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function boundedText(raw, max = 1000) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length > max) refuse(400, "Data permintaan terlalu panjang.");
  return value;
}

function positiveNumber(value, max = 1_000_000) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
}

function rfqIdempotencyNumber(customerId, itemId, key) {
  const digest = createHash("sha256")
    .update(`${customerId}:${itemId}:${key}`)
    .digest("hex").slice(0, 24).toUpperCase();
  return `RFQ-${digest}`;
}

export async function handleDevCustomerMarketplaceQuote({
  request, response, itemId, body, user, sendJson,
  databasePool = pool, corporateGuard = assertDevCorporatePoAffiliation,
  env = process.env,
}) {
  // This endpoint repairs a missing link in DEV, not a new public guest API.
  // Keep the established standalone marketplace writer and PROD unchanged.
  if (!corporatePoApprovalGateDevEnabled(env)) {
    refuse(404, "Pengajuan RFQ DEV tidak tersedia.");
  }
  if (request.method !== "POST") refuse(405, "Metode tidak didukung.");
  const customerId = Number(user?.id);
  if (!Number.isInteger(customerId) || customerId <= 0 || user?.role !== "customer") {
    refuse(403, "Hanya Customer yang sudah login dapat membuat RFQ.");
  }
  const catalogItemId = Number(itemId);
  if (!Number.isInteger(catalogItemId) || catalogItemId <= 0) {
    refuse(404, "Produk tidak ditemukan.");
  }
  const rawKey = request.headers?.["idempotency-key"];
  const key = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{11,127}$/.test(key)) {
    refuse(400, "Kunci idempoten RFQ tidak valid. Muat ulang formulir.");
  }
  const qty = positiveNumber(body?.qty);
  if (qty === null) refuse(400, "Jumlah produk harus lebih dari nol.");
  const contact = boundedText(body?.guest_contact ?? body?.phone, 24);
  if (!/^(?:\+?62|0)8\d{8,12}$/.test(contact.replace(/[\s\-().]/g, ""))) {
    refuse(400, "Nomor WhatsApp buyer tidak valid.");
  }
  const destination = boundedText(body?.destination, 500);
  const notes = boundedText(body?.notes, 4000);
  const rawDate = boundedText(body?.required_date, 10);
  if (rawDate && (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    || Number.isNaN(Date.parse(rawDate + "T00:00:00Z"))
    || new Date(rawDate + "T00:00:00Z").toISOString().slice(0, 10) !== rawDate
    || rawDate < new Date().toISOString().slice(0, 10))) {
    refuse(400, "Tanggal kebutuhan produk tidak valid.");
  }

  const number = rfqIdempotencyNumber(customerId, catalogItemId, key);
  const client = await databasePool.connect();
  let committed = false;
  try {
    await client.query("begin");

    // Every customer/company and item fact comes from the canonical DEV DB,
    // never from the buyer_company, estimated_price or vendor fields in JSON.
    const identity = await client.query(
      `select id, role, account_status, customer_type, name, email, company
         from public.portal_customers
        where id=$1 for share`,
      [customerId],
    );
    const customer = identity.rows[0];
    if (!customer || customer.role !== "customer" || customer.account_status !== "active"
      || !["individual", "company"].includes(customer.customer_type)) {
      refuse(403, "Akun Customer belum memenuhi persyaratan.");
    }
    const catalogResult = await client.query(
      `select item.id,item.vendor_id,item.name,item.description,item.unit,
              item.moq,item.type
         from public.vendor_catalog_items item
         join public.suppliers supplier on supplier.id=item.vendor_id
        where item.id=$1
          and item.is_active=true and item.is_published=true
          and supplier.is_active=true
        for share of item`,
      [catalogItemId],
    );
    const catalog = catalogResult.rows[0];
    if (!catalog) refuse(404, "Produk tidak tersedia atau belum dipublikasikan.");
    if (catalog.moq != null && qty < Number(catalog.moq)) {
      refuse(400, "Jumlah belum memenuhi minimum order produk.");
    }

    const memberships = await client.query(
      `select m.company_id,m.buyer_role,coalesce(c.company_name,c.legal_name,c.name) as company_name
         from public.portal_company_members m
         join public.companies c on c.id=m.company_id and coalesce(c.is_active,true)=true
        where m.portal_customer_id=$1 and m.is_active=true
        order by m.company_id limit 2`,
      [customerId],
    );
    const rows = memberships.rows;
    let companyId = null;
    let companyName = null;
    if (customer.customer_type === "company") {
      if (rows.length !== 1) {
        refuse(409, "Pilih satu perusahaan yang telah disetujui Admin sebelum mengirim RFQ.");
      }
      companyId = Number(rows[0].company_id);
      companyName = rows[0].company_name;
    } else if (rows.length > 0) {
      refuse(409, "Konteks perusahaan Customer tidak sesuai. Muat ulang halaman.");
    }

    await corporateGuard(
      (sql, params = []) => client.query(sql, params),
      { portal_customer_id: customerId, company_id: companyId },
      env,
    );

    async function existingByNumber() {
      const result = await client.query(
        `select r.id,r.portal_customer_id,r.company_id,
                r.buyer_phone,
                coalesce(r.delivery_address,'') as delivery_address,
                coalesce(r.notes,'') as notes,
                coalesce(to_char(r.required_delivery_date,'YYYY-MM-DD'),'') as required_date_iso,
                l.vendor_catalog_item_id,l.requested_qty
           from public.mkt_rfqs r
           join public.mkt_rfq_lines l on l.rfq_id=r.id
          where r.rfq_number=$1
          order by l.id asc limit 1 for update of r`,
        [number],
      );
      return result.rows[0] ?? null;
    }
    async function replay(row) {
      if (Number(row.portal_customer_id) !== customerId
        || Number(row.company_id ?? 0) !== Number(companyId ?? 0)
        || Number(row.vendor_catalog_item_id) !== catalogItemId
        || Number(row.requested_qty) !== qty
        || String(row.buyer_phone ?? "") !== contact
        || String(row.delivery_address ?? "") !== destination
        || String(row.notes ?? "") !== notes
        || String(row.required_date_iso ?? "") !== rawDate) {
        refuse(409, "Kunci RFQ sudah dipakai untuk permintaan berbeda.");
      }
      await client.query("commit");
      committed = true;
      sendJson(response, 200, {
        ok: true, orderNumber: number, rfqId: Number(row.id),
        status: "draft", alreadyProcessed: true,
      });
    }

    const first = await existingByNumber();
    if (first) {
      await replay(first);
      return;
    }
    const inserted = await client.query(
      `insert into public.mkt_rfqs
         (rfq_number,company_id,catalog_vendor_id,buyer_name,buyer_email,
          buyer_phone,buyer_company,status,priority,required_delivery_date,
          delivery_address,notes,email_verified,line_count,portal_customer_id,
          buyer_role,approval_status)
       values ($1,$2,$3,$4,$5,$6,$7,'draft'::mkt_rfq_status,
               'normal'::mkt_rfq_priority,$8,$9,$10,true,1,$11,$12,'none')
       on conflict (rfq_number) do nothing
       returning id`,
      [
        number,companyId,Number(catalog.vendor_id),
        customer.name,customer.email,contact,companyName,
        rawDate || null,destination || null,notes || null,
        customerId,customer.customer_type === "company" ? (rows[0]?.buyer_role || "member") : "individual",
      ],
    );
    const rfqId = Number(inserted.rows[0]?.id ?? 0);
    if (!rfqId) {
      const second = await existingByNumber();
      if (!second) refuse(409, "RFQ sedang diproses, coba kembali.");
      await replay(second);
      return;
    }
    await client.query(
      `insert into public.mkt_rfq_lines
         (rfq_id,vendor_catalog_item_id,item_name,item_description,
          item_unit,requested_qty,notes,sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,0)`,
      [rfqId,catalogItemId,catalog.name,catalog.description,
        catalog.unit ?? "unit",qty,notes || null],
    );
    await client.query("commit");
    committed = true;
    sendJson(response, 201, {
      ok: true, orderNumber: number, rfqId, status: "draft", alreadyProcessed: false,
    });
  } catch (error) {
    if (!committed) await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
