/**
 * Restores the existing product-detail RFQ contract in the standalone
 * Customer Portal, the sole owner of RFQ / PO creation.
 *
 * DEV-only opt-in; no Finance/AP/Accounting writes, no historical backfill.
 * Keeps canonical RFQ + legacy product-order records and their shared
 * idempotency ledger in one transaction with company approval evidence.
 */
import { randomUUID } from "node:crypto";

const str = (x, max = 250) => typeof x === "string" ? x.trim().slice(0, max) : "";
const sql = (...parts) => parts.join(" ");
function deny(statusCode, message) {
  throw Object.assign(new Error(message), { statusCode });
}
export function marketplaceQuoteDevEnabled(env = process.env) {
  return env.APP_ENV === "development" &&
    env.CST_MARKETPLACE_RFQ_QUOTE_DEV === "true";
}

export async function submitMarketplaceCatalogQuote(input, services) {
  const { catalogItemId, user, body = {}, idempotencyKey, env = process.env } = input;
  if (!marketplaceQuoteDevEnabled(env)) deny(404, "Marketplace RFQ belum diaktifkan.");
  if (typeof services?.withTransaction !== "function")
    deny(503, "Transaksi RFQ tidak tersedia.");
  const itemId = Number(catalogItemId), customerId = Number(user?.id);
  if (!Number.isSafeInteger(itemId) || itemId <= 0) deny(404, "Item tidak ditemukan.");
  if (!Number.isSafeInteger(customerId) || customerId <= 0) deny(401, "Login customer diperlukan.");
  const key = str(idempotencyKey, 200);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]{7,199}$/.test(key))
    deny(400, "Idempotency-Key RFQ tidak valid.");
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      str(body._hp) || body.companyId !== undefined ||
      body.company_id !== undefined) deny(422, "Data perusahaan tidak boleh dikirim sebagai otorisasi.");
  const buyerName = str(body.buyer_name ?? body.customerName, 200);
  const buyerPhone = str(body.guest_contact ?? body.phone, 30);
  const destination = str(body.destination ?? body.shippingAddress, 1500);
  const notes = str(body.notes, 3000);
  const quantity = Number(body.qty ?? 1);
  if (!buyerName || !/^(?:\+?62|0)8\d{8,12}$/.test(buyerPhone) ||
      !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000)
    deny(400, "Nama, WhatsApp, atau jumlah RFQ tidak valid.");
  const requiredDate = str(body.required_date, 10);
  if (requiredDate && (!/^\d{4}-\d{2}-\d{2}$/.test(requiredDate) ||
      Number.isNaN(Date.parse(requiredDate))))
    deny(400, "Tanggal RFQ tidak valid.");

  return services.withTransaction(async db => {
    // Serialize logical retries across workers; partial writes all roll back.
    await db("select pg_advisory_xact_lock(hashtextextended($1::text,0))",
      ["customer-portal:marketplace-rfq:" + key]);
    const customer = (await db(
      "select id,email,customer_type,account_status from public.portal_customers where id=$1 for share",
      [customerId],
    )).rows[0];
    if (!customer || !["active", null].includes(customer.account_status) ||
        str(customer.email).toLowerCase() !== str(user.email).toLowerCase())
      deny(401, "Sesi customer tidak sesuai.");

    let companyId = null, companyName = null, buyerRole = null;
    let department = null, costCenter = null, approvalLevel = null;
    if (customer.customer_type === "company") {
      const rows = await db(sql(
        "select m.company_id,c.company_name,m.buyer_role,m.department,m.cost_center,m.approval_level",
        "from public.portal_company_members m",
        "join public.portal_company_requests r on r.portal_customer_id=m.portal_customer_id",
        "and r.matched_company_id=m.company_id and r.status='approved'",
        "and r.reviewed_by is not null and r.reviewed_at is not null",
        "join public.companies c on c.id=m.company_id and c.is_active=true",
        "where m.portal_customer_id=$1 and m.is_active=true",
        "order by m.company_id for share of m,r,c",
      ), [customerId]);
      if (rows.rows.length !== 1) deny(409, "Afiliasi perusahaan harus disetujui Admin.");
      const m = rows.rows[0];
      companyId = Number(m.company_id);
      companyName = m.company_name;
      buyerRole = m.buyer_role;
      department = m.department;
      costCenter = m.cost_center;
      approvalLevel = m.approval_level;
      // This narrow restoration must not bypass multi-level buyer approval.
      if (Number(approvalLevel ?? 0) >= 2)
        deny(409, "RFQ memerlukan persetujuan internal perusahaan.");
    } else if (customer.customer_type !== "individual") {
      deny(409, "Lengkapi jenis akun customer terlebih dahulu.");
    }

    const config = await db(sql(
      "select value from public.app_config",
      "where key='FEATURE_FLAG_MARKETPLACE_NEW_PIPELINE'",
      "and environment in ('development','all')",
      "and is_secret is distinct from true",
      "order by case when environment='development' then 0 else 1 end limit 1",
    ));
    if (!["true", "1"].includes(config.rows[0]?.value))
      deny(503, "Pipeline RFQ kanonis belum tersedia.");

    const item = (await db(sql(
      "select id,vendor_id,name,description,unit,price_sell,currency,",
      "category_key,service_type,kategori,template_id,template_version,",
      "template_snapshot,spec_values from public.vendor_catalog_items",
      "where id=$1 and is_active=true and is_published=true",
      "and (validity_date is null or validity_date >= current_date)",
      "limit 1 for share",
    ), [itemId])).rows[0];
    if (!item || !Number(item.vendor_id)) deny(404, "Item Marketplace tidak tersedia.");
    const price = Number(item.price_sell ?? 0);
    if (!Number.isFinite(price) || price < 0)
      deny(409, "Harga katalog belum tersedia.");

    const existing = (await db(sql(
      "select l.id,l.status,l.catalog_item_id,l.buyer_email,",
      "l.mkt_rfq_id,l.mkt_rfq_number,l.portal_order_id,l.portal_order_number,",
      "r.portal_customer_id,r.company_id",
      "from public.mkt_dual_write_log l",
      "left join public.mkt_rfqs r on r.id=l.mkt_rfq_id",
      "where l.idempotency_key=$1 limit 1 for update of l",
    ), [key])).rows[0];
    if (existing) {
      const matchedCompany = existing.company_id == null
        ? companyId === null : Number(existing.company_id) === companyId;
      if (!matchedCompany || Number(existing.portal_customer_id) !== customerId ||
          Number(existing.catalog_item_id) !== itemId ||
          str(existing.buyer_email).toLowerCase() !== str(customer.email).toLowerCase())
        deny(409, "Idempotency-Key telah digunakan untuk transaksi lain.");
      if (!existing.mkt_rfq_id || !existing.portal_order_id ||
          !["linked", "success"].includes(existing.status))
        deny(409, "RFQ sebelumnya belum selesai; perlu pemeriksaan.");
      return {
        orderNumber: existing.portal_order_number ?? existing.mkt_rfq_number,
        id: Number(existing.portal_order_id), rfqId: Number(existing.mkt_rfq_id),
        rfqNumber: existing.mkt_rfq_number, status: "Quote Request",
        newPipeline: true, alreadyProcessed: true,
      };
    }

    const unit = str(body.unit, 50) || item.unit || "unit";
    const subtotal = Number((quantity * price).toFixed(2));
    const tax = body.includePpn === true ? Number((subtotal * 0.11).toFixed(2)) : 0;
    const total = Number((subtotal + tax).toFixed(2));
    if (!Number.isFinite(total) || total > 999999999999)
      deny(422, "Nilai RFQ di luar batas.");
    const email = str(customer.email).toLowerCase();

    const ledger = await db(sql(
      "insert into public.mkt_dual_write_log",
      "(catalog_item_id,buyer_email,buyer_name,buyer_company,",
      "qty,unit,shipping_address,idempotency_key,payload,status,attempt)",
      "values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,'pending',1) returning id",
    ), [itemId,email,buyerName,companyName,quantity,unit,destination,key,
      JSON.stringify({ source:"customer_portal_standalone_dev",
        customerId,companyId,itemId,quantity })]);
    const ledgerId = Number(ledger.rows[0].id);
    const header = await db(sql(
      "insert into public.mkt_rfqs",
      "(rfq_number,company_id,portal_customer_id,catalog_vendor_id,",
      "buyer_name,buyer_email,buyer_phone,buyer_company,buyer_role,",
      "buyer_department,buyer_cost_center,buyer_approval_level,status,",
      "approval_status,priority,required_delivery_date,delivery_address,",
      "notes,line_count,quote_count)",
      "values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,",
      "'submitted','none','normal',$13,$14,$15,1,0) returning id",
    ), ["MKT-RFQ-TEMP-"+randomUUID(),companyId,customerId,item.vendor_id,
      buyerName,email,buyerPhone,companyName,buyerRole,department,costCenter,
      approvalLevel,requiredDate||null,destination||null,notes||null]);
    const rfqId = Number(header.rows[0].id);
    const numbered = await db(sql(
      "update public.mkt_rfqs",
      "set rfq_number='MKT-RFQ-'||to_char(current_date,'YYYYMM')",
      "||'-'||lpad(id::text,4,'0'),updated_at=now()",
      "where id=$1 returning rfq_number",
    ), [rfqId]);
    const rfqNumber = numbered.rows[0].rfq_number;
    await db(sql(
      "insert into public.mkt_rfq_lines",
      "(rfq_id,vendor_catalog_item_id,item_name,item_description,",
      "item_unit,requested_qty,target_price_per_unit,sort_order)",
      "values($1,$2,$3,$4,$5,$6,$7,0)",
    ), [rfqId,itemId,item.name,item.description,unit,quantity,item.price_sell]);

    const legacy = await db(sql(
      "insert into public.portal_product_orders",
      "(order_number,customer_name,email,phone,shipping_address,notes,",
      "subtotal,grand_total,status,company_id,portal_customer_id,",
      "product_category,template_id,template_version,custom_field_values,",
      "template_snapshot,idempotency_key)",
      "values($1,$2,$3,$4,$5,$6,$7,$8,'Quote Request',$9,$10,$11,$12,",
      "$13,$14::jsonb,$15::jsonb,$16) returning id",
    ), ["MCT-TEMP-"+randomUUID(),buyerName,email,buyerPhone,destination||"",
      notes,subtotal,total,companyId,customerId,
      item.category_key??item.service_type??item.kategori??null,
      item.template_id??null,item.template_version??null,
      JSON.stringify(item.spec_values??{}),JSON.stringify(item.template_snapshot??{}),key]);
    const orderId = Number(legacy.rows[0].id);
    const result = await db(sql(
      "update public.portal_product_orders",
      "set order_number='MCT-'||to_char(current_date,'YYMMDD')",
      "||'-'||lpad(id::text,6,'0'),updated_at=now()",
      "where id=$1 returning order_number",
    ), [orderId]);
    const orderNumber = result.rows[0].order_number;
    await db(sql(
      "insert into public.portal_product_order_items",
      "(order_id,product_name,unit,unit_price,qty,subtotal)",
      "values($1,$2,$3,$4,$5,$6)",
    ), [orderId,item.name,unit,price,quantity,subtotal]);
    await db(sql(
      "update public.mkt_dual_write_log",
      "set status='linked',mkt_rfq_id=$2,mkt_rfq_number=$3,",
      "portal_order_id=$4,portal_order_number=$5,updated_at=now(),",
      "resolved_at=now(),resolution='CANONICAL_LINKED' where id=$1",
    ), [ledgerId,rfqId,rfqNumber,orderId,orderNumber]);

    if (typeof services.writeEvent === "function") {
      await services.writeEvent(db,{
        rfqId,user,actorType:"customer",action:"mkt_rfq_created",
        description:"Marketplace RFQ dibuat melalui Customer Portal",
        newValue:{rfqId,companyId,customerId,ledgerId},
      },"marketplace-rfq:"+key);
    }
    // Existing Marketplace admin/quotation/PO services own subsequent steps.
    return {
      orderNumber,id:orderId,rfqId,rfqNumber,status:"Quote Request",
      newPipeline:true,alreadyProcessed:false,
    };
  });
}
