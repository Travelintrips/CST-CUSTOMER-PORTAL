import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { query } from "./db.mjs";
import { uploadOrderDocument } from "./storage.mjs";

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positive(value, label) {
  const parsed = number(value);
  if (parsed == null || parsed <= 0) fail(400, `${label} tidak valid.`);
  return parsed;
}

function orderNumber(prefix) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function jsonValue(value, fallback) {
  return value == null ? fallback : JSON.stringify(value);
}

function freightTokenSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for freight action links.");
  return secret;
}

function freightTokenSignature(payload) {
  return createHmac("sha256", freightTokenSecret()).update(`freight-action:${payload}`).digest("base64url");
}

export function createFreightActionToken({ service, orderId, purpose, ttlSeconds = 60 * 60 * 24 * 7 }) {
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    service,
    orderId: Number(orderId),
    purpose,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomUUID(),
  })).toString("base64url");
  return `${payload}.${freightTokenSignature(payload)}`;
}

function verifyFreightActionToken(token, expectedPurpose) {
  const [payload, signature] = String(token ?? "").split(".");
  if (!payload || !signature) fail(404, "Link tidak valid.");
  const expected = freightTokenSignature(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) fail(404, "Link tidak valid.");
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    fail(404, "Link tidak valid.");
  }
  if (
    decoded?.v !== 1
    || !Number.isInteger(Number(decoded.orderId))
    || decoded.orderId <= 0
    || decoded.purpose !== expectedPurpose
    || !decoded.service
    || !decoded.exp
    || decoded.exp <= Math.floor(Date.now() / 1000)
  ) {
    fail(404, "Link tidak valid atau sudah kedaluwarsa.");
  }
  return decoded;
}

async function freightOrderByToken(token, purpose) {
  const decoded = verifyFreightActionToken(token, purpose);
  const table = decoded.service === "air"
    ? "air_freight_orders"
    : decoded.service === "ocean"
      ? "ocean_freight_orders"
      : null;
  if (!table) fail(404, "Link tidak valid.");
  const result = await query(`select * from public.${table} where id = $1 limit 1`, [decoded.orderId]);
  const row = result.rows[0];
  if (!row) fail(404, "Order freight tidak ditemukan.");
  return { decoded, row };
}

function airVolumetricWeight(rows) {
  return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
    const length = number(row?.length, 0);
    const width = number(row?.width, 0);
    const height = number(row?.height, 0);
    const pieces = Math.max(1, Math.floor(number(row?.koli ?? row?.pieces, 1)));
    return total + (length * width * height * pieces * 167) / 1_000_000;
  }, 0);
}

function airRatePerKg(rate, chargeableWeight) {
  const brackets = [
    [1000, rate.rate_1000],
    [500, rate.rate_500],
    [300, rate.rate_300],
    [250, rate.rate_250],
    [100, rate.rate_100],
    [45, rate.rate_45],
  ];
  for (const [minimum, value] of brackets) {
    if (chargeableWeight >= minimum && number(value) != null) return number(value);
  }
  return number(rate.rate_minimum, 0);
}

function mapAirOption(rate, chargeableWeight, selectedServices = []) {
  const ratePerKg = airRatePerKg(rate, chargeableWeight);
  const freightBase = Math.max(
    ratePerKg * chargeableWeight,
    number(rate.minimum_charge, 0),
  );
  const fuelSurcharge = number(rate.fuel_surcharge_per_kg, 0) * chargeableWeight;
  const securitySurcharge = number(rate.security_surcharge_per_kg, 0) * chargeableWeight;
  let fixedFees =
    number(rate.xray_fee, 0)
    + number(rate.awb_fee, 0)
    + number(rate.handling_fee, 0)
    + number(rate.doc_fee, 0)
    + number(rate.edi_fee, 0)
    + number(rate.customs_clearance_fee, 0);
  if (selectedServices.includes("pickup")) fixedFees += number(rate.pickup_trucking_estimate, 0);
  if (selectedServices.includes("door_delivery")) fixedFees += number(rate.delivery_trucking_estimate, 0);
  const total = freightBase + fuelSurcharge + securitySurcharge + fixedFees;
  const exchangeRate = number(rate.exchange_rate_to_idr, 1) || 1;
  return {
    rate_id: Number(rate.id),
    airline: rate.airline ?? rate.rate_source_name,
    rate_source_name: rate.rate_source_name,
    routing_type: rate.routing_type ?? "direct",
    transit_days: rate.transit_days == null ? null : Number(rate.transit_days),
    flight_number: rate.flight_number ?? null,
    etd: rate.etd ?? null,
    eta: rate.eta ?? null,
    service_mode: rate.service_mode,
    service_level: rate.service_level,
    currency: rate.currency ?? "IDR",
    rate_per_kg: ratePerKg,
    weight_break: `${chargeableWeight} kg`,
    freight_base: freightBase,
    fuel_surcharge: fuelSurcharge,
    security_surcharge: securitySurcharge,
    fixed_fees: fixedFees,
    minimum_charge: number(rate.minimum_charge, 0),
    total_estimate_idr: Math.round(total * exchangeRate),
  };
}

async function airEstimate(body) {
  const origin = text(body.origin_airport)?.toUpperCase();
  const destination = text(body.destination_airport)?.toUpperCase();
  const grossWeight = positive(body.gross_weight, "Berat kotor");
  const rows = Array.isArray(body.dimension_rows) ? body.dimension_rows : [];
  const volumetricWeight = airVolumetricWeight(rows);
  const chargeableWeight = Math.max(grossWeight, volumetricWeight);
  const serviceMode = text(body.service_mode, "airport_to_airport");
  const serviceLevel = text(body.service_level, "standard");
  const tradeType = text(body.trade_type, "export");
  const selectedServices = Array.isArray(body.selected_additional_services)
    ? body.selected_additional_services.map(String)
    : [];
  if (!origin || !destination) fail(400, "Bandara asal dan tujuan wajib diisi.");

  const result = await query(
    `select *
       from public.air_freight_rates
      where is_active = true
        and upper(origin_airport) = $1
        and upper(destination_airport) = $2
        and (trade_type = $3 or trade_type is null)
        and (service_mode = $4 or service_mode is null)
        and (service_level = $5 or service_level is null)
        and (valid_from is null or valid_from <= current_date)
        and (valid_until is null or valid_until >= current_date)
      order by company_id nulls first, id
      limit 50`,
    [origin, destination, tradeType, serviceMode, serviceLevel],
  );
  const options = result.rows
    .filter((rate) => airRatePerKg(rate, chargeableWeight) > 0)
    .map((rate) => mapAirOption(rate, chargeableWeight, selectedServices));
  return {
    gross_weight: grossWeight,
    volumetric_weight: volumetricWeight,
    chargeable_weight: chargeableWeight,
    weight_break: `${chargeableWeight} kg`,
    options,
  };
}

function mapOceanOption(rate, body) {
  const shipmentType = text(body.shipment_type, "FCL").toUpperCase();
  const qty = Math.max(1, Math.floor(number(body.container_qty, 1)));
  const cbm = number(body.total_cbm, 0);
  const baseOceanFreight = shipmentType === "LCL"
    ? Math.max(
        cbm * number(rate.lcl_rate_per_cbm, number(rate.ocean_freight_amount, 0)),
        number(rate.lcl_minimum_cbm, 0) * number(rate.lcl_rate_per_cbm, 0),
      )
    : number(rate.ocean_freight_amount, 0) * qty;
  const selected = new Set(Array.isArray(body.selected_additional_services)
    ? body.selected_additional_services.map(String)
    : []);
  const originCharges = number(rate.thc_origin, 0);
  const destinationCharges = number(rate.thc_destination, 0);
  const documentCharges = number(rate.doc_fee, 0) + number(rate.bl_fee, 0) + number(rate.do_fee, 0);
  const truckingCharges =
    (selected.has("trucking_pickup") ? number(rate.trucking_pickup_estimate, 0) : 0)
    + (selected.has("trucking_delivery") ? number(rate.trucking_delivery_estimate, 0) : 0);
  const customsCharges = selected.has("customs_clearance")
    ? number(rate.customs_clearance_fee, 0)
    : 0;
  const surchargeBreakdown = {
    handling: number(rate.handling_fee, 0),
    surcharge: number(rate.surcharge_amount, 0),
  };
  const total = baseOceanFreight + originCharges + destinationCharges
    + documentCharges + truckingCharges + customsCharges
    + surchargeBreakdown.handling + surchargeBreakdown.surcharge;
  const exchangeRate = number(rate.exchange_rate_to_idr, 1) || 1;
  return {
    estimate_option: rate.rate_source_type ?? "standard",
    rate_id: Number(rate.id),
    carrier: rate.carrier_name ?? rate.carrier ?? rate.rate_source_name,
    route: `${rate.origin_port} → ${rate.destination_port}`,
    shipment_type: shipmentType,
    container_type: body.container_type ?? rate.container_type ?? null,
    transit_days: rate.transit_days == null ? null : Number(rate.transit_days),
    direct_or_transshipment: rate.direct_or_transshipment,
    base_ocean_freight: baseOceanFreight,
    origin_charges: originCharges,
    destination_charges: destinationCharges,
    document_charges: documentCharges,
    trucking_charges: truckingCharges,
    customs_charges: customsCharges,
    surcharge_breakdown: surchargeBreakdown,
    total_estimate: total,
    currency: rate.currency ?? "IDR",
    total_estimate_idr: Math.round(total * exchangeRate),
    exchange_rate_to_idr: exchangeRate,
    price_status: rate.price_status,
    validity: rate.valid_until,
  };
}

async function oceanEstimate(body) {
  const originPort = text(body.origin_port);
  const destinationPort = text(body.destination_port);
  if (!originPort || !destinationPort) fail(400, "Pelabuhan asal dan tujuan wajib diisi.");
  const result = await query(
    `select *
       from public.ocean_freight_rates
      where is_active = true
        and lower(origin_port) = lower($1)
        and lower(destination_port) = lower($2)
        and (trade_type = $3 or trade_type is null)
        and (service_mode = $4 or service_mode is null)
        and valid_from <= current_date
        and valid_until >= current_date
      order by company_id nulls first, id
      limit 50`,
    [
      originPort,
      destinationPort,
      text(body.trade_type, "export"),
      text(body.service_mode, "port_to_port"),
    ],
  );
  return result.rows.map((rate) => mapOceanOption(rate, body));
}

function mapAirOrder(row) {
  return {
    ...row,
    id: Number(row.id),
    estimated_price_idr: number(row.estimated_price_idr, 0),
    final_price_idr: number(row.final_price_idr, 0),
    grand_total: number(row.grand_total, 0),
    chargeable_weight: number(row.chargeable_weight, 0),
  };
}

async function createAirOrder(body, user) {
  const origin = text(body.origin_airport)?.toUpperCase();
  const destination = text(body.destination_airport)?.toUpperCase();
  const commodity = text(body.commodity);
  if (!origin || !destination || !commodity) fail(400, "Rute dan komoditi wajib diisi.");
  const grossWeight = positive(body.gross_weight, "Berat kotor");
  const dimensionRows = Array.isArray(body.dimension_rows) ? body.dimension_rows : [];
  const volumetricWeight = airVolumetricWeight(dimensionRows);
  const chargeableWeight = Math.max(grossWeight, volumetricWeight);
  const orderNo = orderNumber("AFR");
  const result = await query(
    `insert into public.air_freight_orders
       (order_number, customer_id, customer_name, customer_phone, customer_email,
        origin_city, origin_airport, destination_city, destination_airport,
        trade_type, service_mode, service_level, incoterm, commodity, cargo_type,
        gross_weight, total_volumetric_weight, volumetric_weight, chargeable_weight,
        koli, dimension_rows, pickup_date, preferred_flight_date, target_arrival_date,
        selected_additional_services, selected_estimate_option, estimated_price_idr,
        currency, pricing_breakdown, selected_rate_id, candidate_rate_ids,
        price_status, status, source, portal_customer_id, customer_company, notes,
        tracking_status, created_at, updated_at)
     values
       ($1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $17, $18,
        $19, $20::jsonb, $21, $22, $23,
        $24::jsonb, $25, $26,
        $27, $28::jsonb, $29, $30::jsonb,
        'estimate', 'draft', 'customer_portal', $2, $31, $32,
        'submitted', now(), now())
     returning id, order_number, status, tracking_status`,
    [
      orderNo,
      user.id,
      text(body.customer_name, user.name),
      text(body.customer_phone, user.phone),
      text(body.customer_email, user.email),
      text(body.origin_city),
      origin,
      text(body.destination_city),
      destination,
      text(body.trade_type, "export"),
      text(body.service_mode, "airport_to_airport"),
      text(body.service_level, "standard"),
      text(body.incoterm),
      commodity,
      text(body.cargo_type, "general"),
      grossWeight,
      volumetricWeight,
      chargeableWeight,
      Math.max(1, dimensionRows.reduce((sum, row) => sum + Math.max(1, Math.floor(number(row?.koli ?? row?.pieces, 1))), 0)),
      jsonValue(dimensionRows, []),
      body.pickup_date ?? null,
      body.preferred_flight_date ?? null,
      body.target_arrival_date ?? null,
      jsonValue(body.selected_additional_services, []),
      jsonValue(body.selected_estimate_option, null),
      number(body.estimated_price_idr, 0),
      text(body.currency, "IDR"),
      jsonValue(body.pricing_breakdown, {}),
      body.selected_rate_id == null ? null : Number(body.selected_rate_id),
      jsonValue(body.candidate_rate_ids, []),
      text(body.customer_company ?? body.company_name, user.company),
      text(body.notes),
    ],
  );
  const row = result.rows[0];
  if (dimensionRows.length && row) {
    await query(
      `insert into public.air_freight_dimensions
         (order_id, length, width, height, pieces, gross_weight, volumetric_weight)
       select $1, item.length, item.width, item.height, item.pieces,
              item.gross_weight, (item.length * item.width * item.height * item.pieces * 167) / 1000000
         from jsonb_to_recordset($2::jsonb)
           as item(length numeric, width numeric, height numeric, pieces integer, gross_weight numeric)`,
      [row.id, jsonValue(dimensionRows, [])],
    );
  }
  return { ok: true, id: Number(row.id), order_number: row.order_number };
}

async function createOceanOrder(body, user = null) {
  const originPort = text(body.origin_port);
  const destinationPort = text(body.destination_port);
  const commodity = text(body.commodity);
  if (!originPort || !destinationPort || !commodity) fail(400, "Rute dan komoditi wajib diisi.");
  const options = await oceanEstimate(body);
  const selectedRateIds = Array.isArray(body.candidate_rate_ids)
    ? body.candidate_rate_ids.map(Number).filter(Number.isInteger)
    : [];
  const orderNo = orderNumber("OCF");
  const selected = number(body.estimated_price_idr, null);
  const result = await query(
    `insert into public.ocean_freight_orders
       (order_number, company_id, customer_id, customer_name, customer_phone,
        customer_email, origin_city, origin_port, destination_city, destination_port,
        trade_type, service_mode, shipment_type, container_type, container_qty,
        total_cbm, gross_weight, koli, commodity, cargo_condition, incoterm,
        etd_preferred, selected_additional_services, selected_estimate_option,
        estimated_price_idr, currency, pricing_breakdown, candidate_rate_ids,
        price_status, status, source, portal_customer_id, tracking_status,
        created_at, updated_at)
     values
       ($1, null, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20,
        $21, $22::jsonb, $23,
        $24, $25, $26::jsonb, $27::jsonb,
        'estimated', 'draft', 'customer_portal', $2, 'draft',
        now(), now())
     returning id, order_number, status, tracking_status`,
    [
      orderNo,
      user?.id ?? null,
      text(body.customer_name, user?.name),
      text(body.customer_phone, user?.phone),
      text(body.customer_email, user?.email),
      text(body.origin_city),
      originPort,
      text(body.destination_city),
      destinationPort,
      text(body.trade_type, "export"),
      text(body.service_mode, "port_to_port"),
      text(body.shipment_type, "FCL"),
      text(body.container_type),
      Math.max(1, Math.floor(number(body.container_qty, 1))),
      number(body.total_cbm),
      number(body.gross_weight),
      number(body.koli),
      commodity,
      text(body.cargo_condition, "general"),
      text(body.incoterm),
      body.etd_preferred ?? null,
      jsonValue(body.selected_additional_services, []),
      text(body.selected_estimate_option, null),
      selected,
      text(body.currency, "IDR"),
      jsonValue(body.pricing_breakdown ?? options[0] ?? {}, {}),
      jsonValue(selectedRateIds, []),
    ],
  );
  return { ok: true, id: Number(result.rows[0].id), order_number: result.rows[0].order_number };
}

async function publicFreightApproval({ service, token, action, body = {} }) {
  const purpose = service === "air" ? "air_customer_approval" : "ocean_customer_approval";
  const { row } = await freightOrderByToken(token, purpose);

  if (!action) {
    const pricing = row.pricing_breakdown && typeof row.pricing_breakdown === "object"
      ? row.pricing_breakdown
      : {};
    return service === "air"
      ? {
          ...mapAirOrder(row),
          final_breakdown: pricing,
          admin_notes: pricing.admin_quote_notes ?? row.notes ?? null,
        }
      : {
          ...row,
          id: Number(row.id),
          final_price: number(row.final_price_idr, number(row.grand_total, 0)),
          final_breakdown: pricing,
          admin_notes: pricing.admin_quote_notes ?? row.notes ?? null,
        };
  }

  if (!["quoted", "approved", "quote_declined"].includes(String(row.status ?? ""))) {
    fail(409, "Penawaran belum tersedia untuk diproses.");
  }
  if (row.status === "approved") return { ok: true, message: "Penawaran sudah disetujui sebelumnya." };
  if (row.status === "quote_declined") return { ok: true, message: "Penawaran sudah ditolak sebelumnya." };

  if (action === "approve") {
    const table = service === "air" ? "air_freight_orders" : "ocean_freight_orders";
    await query(
      `update public.${table}
          set status='approved', tracking_status='approved', updated_at=now()
        where id=$1 and status='quoted'`,
      [row.id],
    );
    return { ok: true, message: "Penawaran berhasil disetujui." };
  }

  if (action === "decline") {
    const reason = text(body.reason);
    const table = service === "air" ? "air_freight_orders" : "ocean_freight_orders";
    await query(
      `update public.${table}
          set status='quote_declined',
              tracking_status='quote_declined',
              notes=concat_ws(E'\\n', notes, $2),
              updated_at=now()
        where id=$1 and status='quoted'`,
      [row.id, reason ? `Customer decline: ${reason}` : "Customer declined quotation."],
    );
    return { ok: true, message: "Penawaran berhasil ditolak." };
  }
  fail(405, "Action tidak didukung.");
}

async function publicOceanVendorForm({ token, form = null }) {
  const { row } = await freightOrderByToken(token, "ocean_vendor_rate");
  if (!form) {
    return {
      order: {
        id: Number(row.id),
        order_number: row.order_number,
        origin_port: row.origin_port,
        destination_port: row.destination_port,
        shipment_type: row.shipment_type,
        container_type: row.container_type,
        container_qty: row.container_qty,
        total_cbm: row.total_cbm,
        commodity: row.commodity,
        trade_type: row.trade_type,
      },
      status: row.status,
    };
  }

  const amount = positive(form.get("ocean_freight_amount"), "Ocean Freight Amount");
  const currency = text(form.get("currency"), "IDR").toUpperCase();
  const exchangeRate = currency === "IDR" ? 1 : positive(form.get("exchange_rate"), "Exchange Rate");
  const feeNames = [
    "thc_origin", "thc_destination", "doc_fee", "bl_fee", "do_fee",
    "handling_fee", "trucking_pickup", "trucking_delivery",
    "customs_clearance_fee", "surcharge_amount",
  ];
  const fees = Object.fromEntries(feeNames.map((key) => [key, number(form.get(key), 0)]));
  const totalSource = amount + Object.values(fees).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalIdr = Math.round(totalSource * exchangeRate);

  let attachmentPath = null;
  const attachment = form.get("attachment");
  if (attachment && typeof attachment.arrayBuffer === "function" && Number(attachment.size) > 0) {
    const uploaded = await uploadOrderDocument({
      customerId: row.portal_customer_id ?? row.customer_id ?? row.id,
      companyId: row.company_id ?? null,
      file: attachment,
    });
    attachmentPath = uploaded.path;
  }

  const submission = {
    rate_source_name: text(form.get("rate_source_name")),
    carrier: text(form.get("carrier")),
    ocean_freight_amount: amount,
    currency,
    exchange_rate: exchangeRate,
    validity_date: text(form.get("validity_date")),
    vessel_name: text(form.get("vessel_name")),
    voyage: text(form.get("voyage")),
    etd: text(form.get("etd")),
    eta: text(form.get("eta")),
    transit_days: number(form.get("transit_days")),
    direct_or_transshipment: text(form.get("direct_or_transshipment"), "direct"),
    ...fees,
    total_source: totalSource,
    total_idr: totalIdr,
    notes: text(form.get("notes")),
    attachment_path: attachmentPath,
    submitted_at: new Date().toISOString(),
  };

  await query(
    `update public.ocean_freight_orders
        set pricing_breakdown=coalesce(pricing_breakdown,'{}'::jsonb) || jsonb_build_object('vendor_submission',$2::jsonb),
            carrier=coalesce($3,carrier),
            vessel_name=coalesce($4,vessel_name),
            voyage=coalesce($5,voyage),
            etd=coalesce($6::date,etd),
            eta=coalesce($7::date,eta),
            status='rate_received',
            tracking_status='rate_received',
            updated_at=now()
      where id=$1`,
    [
      row.id,
      JSON.stringify(submission),
      submission.carrier,
      submission.vessel_name,
      submission.voyage,
      submission.etd,
      submission.eta,
    ],
  );

  return { ok: true, message: "Rate berhasil disubmit.", total_idr: totalIdr };
}

async function airTracking(orderNumberValue, sendJson, response) {
  const result = await query(
    `select id, order_number, origin_airport, destination_airport,
            commodity, chargeable_weight, airline, flight_number, status,
            tracking_status, etd, eta, booking_number, mawb, hawb, awb_number,
            transit_days
       from public.air_freight_orders
      where order_number = $1
      limit 1`,
    [orderNumberValue],
  );
  const row = result.rows[0];
  if (!row) fail(404, "Order air freight tidak ditemukan.");
  const events = await query(
    `select id, event_type, created_at
       from public.air_freight_tracking_events
      where order_id = $1
      order by created_at desc, id desc`,
    [row.id],
  );
  sendJson(response, 200, { order: mapAirOrder(row), events: events.rows });
}

async function oceanTracking(orderNumberValue, sendJson, response) {
  const result = await query(
    `select id, order_number, origin_port, destination_port,
            shipment_type, container_type, container_qty, total_cbm, status,
            tracking_status, carrier, vessel_name, voyage,
            etd, eta, booking_number, bl_number
       from public.ocean_freight_orders
      where order_number = $1
      limit 1`,
    [orderNumberValue],
  );
  const row = result.rows[0];
  if (!row) fail(404, "Order ocean freight tidak ditemukan.");
  sendJson(response, 200, {
    ...row,
    id: Number(row.id),
    total_cbm: number(row.total_cbm, 0),
    container_qty: Number(row.container_qty ?? 0),
  });
}

export async function handleFreightRoute({
  request,
  response,
  url,
  user,
  body,
  form,
  sendJson,
  sendError,
}) {
  const { pathname } = url;
  try {
    const airApproval = pathname.match(/^\/api\/air-freight\/approval\/([^/]+)(?:\/(approve|decline))?$/);
    if (airApproval) {
      const action = airApproval[2] ?? null;
      if ((!action && request.method !== "GET") || (action && request.method !== "POST")) {
        sendError(response, 405, "Method tidak didukung.");
        return true;
      }
      sendJson(response, 200, await publicFreightApproval({
        service: "air",
        token: decodeURIComponent(airApproval[1]),
        action,
        body,
      }));
      return true;
    }

    const oceanQuote = pathname.match(/^\/api\/ocean-freight\/quote\/([^/]+)(?:\/(approve|decline))?$/);
    if (oceanQuote) {
      const action = oceanQuote[2] ?? null;
      if ((!action && request.method !== "GET") || (action && request.method !== "POST")) {
        sendError(response, 405, "Method tidak didukung.");
        return true;
      }
      sendJson(response, 200, await publicFreightApproval({
        service: "ocean",
        token: decodeURIComponent(oceanQuote[1]),
        action,
        body,
      }));
      return true;
    }

    const oceanVendorForm = pathname.match(/^\/api\/ocean-freight-form\/([^/]+)$/);
    if (oceanVendorForm) {
      if (!["GET", "POST"].includes(request.method ?? "")) {
        sendError(response, 405, "Method tidak didukung.");
        return true;
      }
      sendJson(response, request.method === "POST" ? 201 : 200, await publicOceanVendorForm({
        token: decodeURIComponent(oceanVendorForm[1]),
        form,
      }));
      return true;
    }

    if (pathname === "/api/air-freight/public/estimate" && request.method === "POST") {
      sendJson(response, 200, await airEstimate(body));
      return true;
    }
    if (pathname === "/api/air-freight/public/orders" && request.method === "POST") {
      if (!user) {
        sendError(response, 401, "Authentication required.");
        return true;
      }
      sendJson(response, 201, await createAirOrder(body, user));
      return true;
    }
    const airTrack = pathname.match(/^\/api\/air-freight\/public\/track\/([^/]+)$/);
    if (airTrack && request.method === "GET") {
      await airTracking(decodeURIComponent(airTrack[1]), sendJson, response);
      return true;
    }
    if (
      (pathname === "/api/ocean-freight/calculate"
        || pathname === "/api/ocean-freight-public/estimate")
      && request.method === "POST"
    ) {
      const options = await oceanEstimate(body);
      sendJson(response, 200, { options });
      return true;
    }
    if (
      (pathname === "/api/ocean-freight/inquiry"
        || pathname === "/api/ocean-freight-public/inquiry")
      && request.method === "POST"
    ) {
      sendJson(response, 201, await createOceanOrder(body, user));
      return true;
    }
    const oceanTrack = pathname.match(/^\/api\/ocean-freight\/track\/([^/]+)$/);
    if (oceanTrack && request.method === "GET") {
      await oceanTracking(decodeURIComponent(oceanTrack[1]), sendJson, response);
      return true;
    }
    return false;
  } catch (error) {
    if (error.statusCode) sendError(response, error.statusCode, error.message);
    else throw error;
    return true;
  }
}