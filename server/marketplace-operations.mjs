import { createHash } from "node:crypto";
import { pool, query } from "./db.mjs";
import {
  bestEffortNotificationWrite,
  marketplaceNotificationDetails,
  notifyAdmins,
  notifyPortalCustomers,
} from "./notification-service.mjs";
import {
  uploadMarketplacePod,
  signedMarketplacePodUrl,
  uploadMarketplacePaymentProof,
  signedMarketplacePaymentProofUrl,
  deleteMarketplacePaymentProof,
} from "./storage.mjs";
import { extractPaymentAmountFromFile } from "./marketplace-payment-ocr.mjs";

const SHIPMENT_EVENT_STATUS = {
  packing: "packing",
  loaded: "loading",
  ready_to_ship: "ready_to_ship",
  ready_for_pickup: "ready_to_ship",
  departed: "in_transit",
  customs: "customs",
  warehouse: "warehouse",
  arrived: "arrived",
  handed_over: "arrived",
  delivered: "delivered",
};

const SHIPMENT_TRANSITIONS = {
  planned: new Set(["packing", "cancelled"]),
  packing: new Set(["loading", "ready_to_ship", "cancelled"]),
  loading: new Set(["ready_to_ship", "in_transit", "cancelled"]),
  ready_to_ship: new Set(["in_transit", "arrived", "cancelled"]),
  in_transit: new Set(["customs", "warehouse", "arrived", "cancelled"]),
  customs: new Set(["warehouse", "arrived", "cancelled"]),
  warehouse: new Set(["arrived", "cancelled"]),
  arrived: new Set(["delivered", "partially_delivered", "rejected_goods", "cancelled"]),
  delivered: new Set(),
  partially_delivered: new Set(["delivered"]),
  rejected_goods: new Set(["delivered"]),
  cancelled: new Set(),
};

const PO_ACTION_STATUS = {
  issue: "issued",
  production: "production",
  "ready-to-ship": "ready_to_ship",
  "in-transit": "in_transit",
  delivered: "delivered",
  complete: "completed",
  close: "closed",
};

const PO_TRANSITIONS = {
  pending: new Set(["issued", "cancelled"]),
  confirmed: new Set(["issued", "production", "cancelled"]),
  issued: new Set(["vendor_accepted", "revision_requested", "cancelled"]),
  vendor_accepted: new Set(["production", "cancelled"]),
  revision_requested: new Set(["issued", "cancelled"]),
  production: new Set(["ready_to_ship", "cancelled"]),
  ready_to_ship: new Set(["in_transit", "cancelled"]),
  in_transit: new Set(["delivered", "cancelled"]),
  delivered: new Set(["completed", "closed"]),
  completed: new Set(["closed"]),
  closed: new Set(),
  cancelled: new Set(),
  vendor_rejected: new Set(["issued", "cancelled"]),
  partially_delivered: new Set(["delivered", "completed", "closed"]),
  rejected_goods: new Set(["delivered", "cancelled"]),
};

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function integer(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) fail(400, `${label} tidak valid.`);
  return parsed;
}

function decimal(value, label, { positive = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive ? parsed <= 0 : parsed < 0)) {
    fail(400, `${label} tidak valid.`);
  }
  return parsed;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function idempotencyKey(request, body) {
  return text(request.headers["idempotency-key"]) ?? text(body?.idempotencyKey);
}

const PAYMENT_TERM_LABELS = {
  prepaid: "Bayar sebelum barang diserahkan/dikirim",
  net_7: "NET 7 hari setelah penerimaan",
  net_14: "NET 14 hari setelah penerimaan",
  net_30: "NET 30 hari setelah penerimaan",
};

function normalizePaymentTerm(value) {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return null;
  if (["prepaid", "prepayment", "cash before delivery"].includes(normalized) || normalized.includes("bayar sebelum")) {
    return "prepaid";
  }
  if (/^net[ _-]?7(?:\s*hari)?$/.test(normalized)) return "net_7";
  if (/^net[ _-]?14(?:\s*hari)?$/.test(normalized)) return "net_14";
  if (/^net[ _-]?30(?:\s*hari)?$/.test(normalized)) return "net_30";
  if (normalized.includes("30 hari")) return "net_30";
  if (normalized.includes("14 hari")) return "net_14";
  if (normalized.includes("7 hari")) return "net_7";
  return null;
}

function paymentTermLabel(code) {
  return PAYMENT_TERM_LABELS[code] ?? null;
}

function paymentTermDays(code) {
  return code === "net_7" ? 7 : code === "net_14" ? 14 : code === "net_30" ? 30 : 0;
}

function paymentRequiresClearance(code) {
  return code === "prepaid";
}

async function paymentView(po) {
  const code = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
  let proofUrl = null;
  if (po.payment_proof_path) {
    proofUrl = await signedMarketplacePaymentProofUrl({ poId: po.id, path: po.payment_proof_path });
  }
  return {
    poId: Number(po.id),
    paymentTermCode: code,
    paymentTerms: paymentTermLabel(code) ?? po.payment_terms_snapshot ?? null,
    paymentStatus: po.payment_status ?? "unpaid",
    paymentDueAt: po.payment_due_at ?? null,
    amount: po.grand_total,
    currency: po.currency_snapshot ?? "IDR",
    proofAvailable: Boolean(po.payment_proof_path),
    proofLocked: Boolean(po.payment_proof_path),
    proofUrl,
    proofFileName: po.payment_proof_file_name ?? null,
    proofMimeType: po.payment_proof_mime_type ?? null,
    proofUploadedAt: po.payment_proof_uploaded_at ?? null,
    ocrAmount: po.payment_ocr_amount == null ? null : Number(po.payment_ocr_amount),
    ocrConfidence: po.payment_ocr_confidence == null ? null : Number(po.payment_ocr_confidence),
    ocrMatches: po.payment_ocr_matches == null ? null : Boolean(po.payment_ocr_matches),
    verifiedAt: po.payment_verified_at ?? null,
    rejectionReason: po.payment_rejection_reason ?? null,
    requiresClearanceBeforeHandover: paymentRequiresClearance(code),
    termsMissing: !code,
  };
}

function actor(user, actorType = "admin") {
  return {
    actorType,
    actorId: user?.id == null ? null : String(user.id),
    actorName: user?.name ?? user?.email ?? actorType,
  };
}

async function accessibleCompanyIds(user, db = query) {
  const result = await db(
    `select company_id
       from public.portal_company_members
      where portal_customer_id = $1 and is_active = true and company_id is not null`,
    [user.id],
  );
  return result.rows.map((row) => Number(row.company_id)).filter(Number.isInteger);
}

function ownerSql(alias = "r", start = 1) {
  return `(
    ${alias}.portal_customer_id = $${start}
    or lower(coalesce(${alias}.buyer_email, '')) = lower($${start + 1})
    or ${alias}.company_id = any($${start + 2}::int[])
  )`;
}

async function withTransaction(work) {
  const client = await pool.connect();
  const db = (sql, values) => client.query(sql, values);
  try {
    await client.query("begin read write");
    const result = await work(db);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function loadPo(poId, user, { client = query, forUpdate = false, isAdmin = false } = {}) {
  const id = integer(poId, "PO");
  if (isAdmin) {
    const result = await client(
      `select po.*, r.rfq_number, r.portal_customer_id, r.buyer_email, r.buyer_name,
              r.delivery_address
         from public.mkt_purchase_orders po
         join public.mkt_rfqs r on r.id = po.rfq_id
        where po.id = $1
        limit 1${forUpdate ? " for update of po" : ""}`,
      [id],
    );
    if (!result.rows[0]) fail(404, "Purchase Order tidak ditemukan.");
    return result.rows[0];
  }

  const companyIds = await accessibleCompanyIds(user, client === query ? query : client);
  const result = await client(
    `select po.*, r.rfq_number, r.portal_customer_id, r.buyer_email, r.buyer_name,
            r.delivery_address
       from public.mkt_purchase_orders po
       join public.mkt_rfqs r on r.id = po.rfq_id
      where po.id = $4 and ${ownerSql("r")}
      limit 1${forUpdate ? " for update of po" : ""}`,
    [user.id, user.email, companyIds, id],
  );
  if (!result.rows[0]) fail(404, "Purchase Order tidak ditemukan.");
  return result.rows[0];
}

async function loadShipment(shipmentId, user, { client = query, forUpdate = false, isAdmin = false } = {}) {
  const id = integer(shipmentId, "Shipment");
  const lock = forUpdate ? " for update of s" : "";
  if (isAdmin) {
    const result = await client(
      `select s.*, po.po_number, po.status as po_status, po.rfq_id,
              r.portal_customer_id, r.buyer_email, r.buyer_name
         from public.mkt_po_shipments s
         join public.mkt_purchase_orders po on po.id=s.po_id
         join public.mkt_rfqs r on r.id=po.rfq_id
        where s.id=$1
        limit 1${lock}`,
      [id],
    );
    if (!result.rows[0]) fail(404, "Shipment tidak ditemukan.");
    return result.rows[0];
  }

  const companyIds = await accessibleCompanyIds(user, client === query ? query : client);
  const result = await client(
    `select s.*, po.po_number, po.status as po_status, po.rfq_id,
            r.portal_customer_id, r.buyer_email, r.buyer_name
       from public.mkt_po_shipments s
       join public.mkt_purchase_orders po on po.id=s.po_id
       join public.mkt_rfqs r on r.id=po.rfq_id
      where s.id=$4 and ${ownerSql("r")}
      limit 1${lock}`,
    [user.id, user.email, companyIds, id],
  );
  if (!result.rows[0]) fail(404, "Shipment tidak ditemukan.");
  return result.rows[0];
}

function mapShipment(row) {
  return {
    id: Number(row.id),
    poId: Number(row.po_id),
    shipmentNumber: row.shipment_number,
    shipmentStatus: row.shipment_status,
    shipmentType: row.shipment_type,
    carrierName: row.carrier_name,
    trackingNumber: row.tracking_number,
    vehicleType: row.vehicle_type,
    vehicleNumber: row.vehicle_number,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    containerNumber: row.container_number,
    sealNumber: row.seal_number,
    origin: row.origin,
    destination: row.destination,
    plannedDeparture: row.planned_departure,
    actualDeparture: row.actual_departure,
    estimatedArrival: row.estimated_arrival,
    actualArrival: row.actual_arrival,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function shipmentItems(db, shipmentId) {
  const result = await db(
    `select si.id, si.shipment_id, si.po_line_id, si.line_number, si.qty, si.uom,
            si.weight, si.volume, si.package_count, si.remarks,
            pol.item_name, pol.unit, pol.notes as po_line_notes
       from public.mkt_po_shipment_items si
       join public.mkt_purchase_order_lines pol on pol.id=si.po_line_id
      where si.shipment_id=$1
      order by si.line_number, si.id`,
    [shipmentId],
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    shipmentId: Number(row.shipment_id),
    poLineId: Number(row.po_line_id),
    lineNumber: Number(row.line_number),
    qty: row.qty,
    uom: row.uom ?? row.unit ?? null,
    weight: row.weight,
    volume: row.volume,
    packageCount: row.package_count,
    remarks: row.remarks ?? row.po_line_notes ?? null,
    itemName: row.item_name,
  }));
}

async function shipmentDetail(db, shipment) {
  return {
    ...mapShipment(shipment),
    items: await shipmentItems(db, shipment.id),
  };
}

async function writeActivity(db, {
  poId,
  user,
  action,
  oldValue = null,
  newValue = null,
  description = action,
  key = null,
}) {
  await db(
    `insert into public.activity_logs
       (actor_type, actor_id, actor_name, action, old_value, new_value,
        description, mkt_purchase_order_id, deduplication_key)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9)
     on conflict (deduplication_key) where deduplication_key is not null do nothing`,
    [
      user?.actorType ?? "admin",
      user?.actorId ?? (user?.id == null ? null : String(user.id)),
      user?.actorName ?? user?.name ?? user?.email ?? "system",
      action,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      description,
      poId,
      key,
    ],
  );
}

async function queueNotification(db, {
  eventType,
  po,
  payload = {},
  key,
}) {
  await bestEffortNotificationWrite(db, () => db(
    `insert into public.mkt_notification_queue
       (event_type, channel, recipient_type, recipient_id, rfq_id,
        purchase_order_id, payload_json, deduplication_key)
     values ($1,'internal','customer',$2,$3,$4,$5::jsonb,$6)
     on conflict do nothing`,
    [
      eventType,
      po.portal_customer_id ?? null,
      po.rfq_id,
      po.id,
      JSON.stringify({ poId: Number(po.id), poNumber: po.po_number, ...payload }),
      key,
    ],
  ));
}

async function notifyMarketplaceEvent(db, { eventType, po, payload = {}, key }) {
  const details = marketplaceNotificationDetails(eventType, po, payload);
  const customerIds = po.portal_customer_id ? [po.portal_customer_id] : [];
  if (customerIds.length) {
    await notifyPortalCustomers(db, {
      customerIds,
      eventKey: key,
      ...details,
    });
  } else if (po.buyer_email) {
    await bestEffortNotificationWrite(db, async () => {
      const customer = await db(
        `select id from public.portal_customers where lower(email)=lower($1) limit 1`,
        [po.buyer_email],
      );
      if (!customer.rows[0]) return false;
      return notifyPortalCustomers(db, {
        customerIds: [customer.rows[0].id],
        eventKey: key,
        ...details,
      });
    });
  }
  await notifyAdmins(db, {
    eventKey: key,
    ...details,
    link: "/admin?tab=service-operations",
    payload: { rfqId: po.rfq_id, ...details.payload },
  });
}

async function getShipmentList(poId, user, isAdmin) {
  const po = await loadPo(poId, user, { isAdmin });
  const result = await query(
    `select * from public.mkt_po_shipments where po_id=$1 order by created_at asc, id asc`,
    [po.id],
  );
  return result.rows.map(mapShipment);
}

async function listPoLines(poId, user, isAdmin) {
  const po = await loadPo(poId, user, { isAdmin });
  const result = await query(
    `select id, po_id, item_name, qty, unit, unit_price, subtotal, notes, created_at
       from public.mkt_purchase_order_lines
      where po_id=$1
      order by id`,
    [po.id],
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    poId: Number(row.po_id),
    itemName: row.item_name,
    qty: row.qty,
    unit: row.unit,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

function existingShipmentResult(row) {
  return { id: Number(row.id), alreadyProcessed: true, shipment: mapShipment(row) };
}

async function createShipment({ poId, body, request, user, isAdmin }) {
  const key = idempotencyKey(request, body);
  if (!key) fail(400, "Idempotency-Key wajib diisi untuk membuat shipment.");
  const shipmentType = text(body.shipmentType, "trucking");

  return withTransaction(async (db) => {
    const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin });
    const existing = (await db(
      `select * from public.mkt_po_shipments where po_id=$1 and idempotency_key=$2 limit 1`,
      [po.id, key],
    )).rows[0];
    if (existing) return existingShipmentResult(existing);

    if (!isAdmin) {
      const activeShipment = (await db(
        `select * from public.mkt_po_shipments
          where po_id=$1 and shipment_status <> 'cancelled'
          order by created_at asc,id asc
          limit 1`,
        [po.id],
      )).rows[0];
      if (activeShipment) {
        if (activeShipment.shipment_type !== shipmentType) {
          fail(409, "Mode pengiriman sudah dipilih dan tidak dapat diganti dari portal.");
        }
        return existingShipmentResult(activeShipment);
      }
      if (po.status !== "vendor_accepted") {
        fail(409, "Menunggu vendor menerima PO sebelum customer memilih pengiriman.");
      }
    } else if (!["issued", "vendor_accepted", "production", "ready_to_ship"].includes(po.status)) {
      fail(409, "PO belum berada pada status yang mengizinkan assignment shipment.");
    }
    const lines = (await db(
      `select id, qty, unit from public.mkt_purchase_order_lines where po_id=$1 order by id`,
      [po.id],
    )).rows;
    if (!lines.length) fail(409, "PO belum memiliki line item.");
    const requestedItems = Array.isArray(body.items) && body.items.length ? body.items : lines;
    const lineMap = new Map(lines.map((line) => [Number(line.id), line]));
    for (const item of requestedItems) {
      const line = lineMap.get(integer(item.poLineId ?? item.id, "PO line"));
      if (!line) fail(404, "PO line bukan bagian dari PO ini.");
      const qty = decimal(item.qty ?? line.qty, "Qty shipment", { positive: true });
      if (qty > Number(line.qty)) fail(409, "Qty shipment melebihi qty PO.");
    }
    const nextNumber = (await db(
      `select count(*)::int as count from public.mkt_po_shipments where po_id=$1`,
      [po.id],
    )).rows[0].count + 1;
    const inserted = await db(
      `insert into public.mkt_po_shipments
         (po_id, shipment_number, shipment_status, shipment_type,
          carrier_name, tracking_number, vehicle_type, vehicle_number,
          driver_name, driver_phone, container_number, seal_number,
          origin, destination, notes, created_by, idempotency_key)
       values ($1,$2,'planned',$3,
               $4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       returning *`,
      [
        po.id,
        `SHP-${po.id}-${String(nextNumber).padStart(3, "0")}`,
        shipmentType,
        text(body.carrierName),
        text(body.trackingNumber),
        text(body.vehicleType),
        text(body.vehicleNumber),
        text(body.driverName),
        text(body.driverPhone),
        text(body.containerNumber),
        text(body.sealNumber),
        shipmentType === "pickup_self"
          ? text(body.origin ?? po.vendor_address_snapshot)
          : text(body.origin),
        shipmentType === "pickup_self"
          ? text(body.destination ?? po.vendor_address_snapshot)
          : text(body.destination ?? po.delivery_address),
        text(body.notes),
        String(user?.id ?? "system"),
        key,
      ],
    );
    const shipment = inserted.rows[0];
    for (let index = 0; index < requestedItems.length; index += 1) {
      const item = requestedItems[index];
      const poLineId = integer(item.poLineId ?? item.id, "PO line");
      const line = lineMap.get(poLineId);
      await db(
        `insert into public.mkt_po_shipment_items
           (shipment_id, po_line_id, line_number, qty, uom, weight, volume, package_count, remarks)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          shipment.id,
          poLineId,
          Number(item.lineNumber ?? index + 1),
          decimal(item.qty ?? line.qty, "Qty shipment", { positive: true }),
          text(item.uom ?? line.unit),
          item.weight == null ? null : decimal(item.weight, "Weight"),
          item.volume == null ? null : decimal(item.volume, "Volume"),
          item.packageCount == null ? null : integer(item.packageCount, "Package count"),
          text(item.remarks),
        ],
      );
    }
    const eventKey = `shipment-created:${shipment.id}`;
    await writeActivity(db, {
      poId: po.id,
      user: actor(user, isAdmin ? "admin" : "customer"),
      action: "shipment_created",
      newValue: { shipmentId: Number(shipment.id), status: shipment.shipment_status },
      description: "Shipment canonical dibuat dan di-assign ke PO.",
      key: eventKey,
    });
    await queueNotification(db, {
      eventType: "shipment_created",
      po,
      payload: { shipmentId: Number(shipment.id), shipmentNumber: shipment.shipment_number },
      key: eventKey,
    });
    await notifyMarketplaceEvent(db, { eventType: "shipment_created", po, payload: { shipmentId: Number(shipment.id), shipmentNumber: shipment.shipment_number }, key: eventKey });
    if (po.status === "vendor_accepted") {
      const updatedPo = await db(
        `update public.mkt_purchase_orders
            set status='production'::mkt_po_status, updated_at=now()
          where id=$1 and status=$2::mkt_po_status
          returning status`,
        [po.id, po.status],
      );
      if (updatedPo.rowCount) {
        await writeActivity(db, {
          poId: po.id,
          user: actor(user, isAdmin ? "admin" : "customer"),
          action: "po_production",
          oldValue: { status: po.status },
          newValue: { status: "production" },
          description: "PO masuk tahap fulfillment/assignment.",
          key: `po:${po.id}:production`,
        });
      }
    }
    return { id: Number(shipment.id), alreadyProcessed: false, shipment: mapShipment(shipment) };
  });
}

async function syncPoStatusFromShipments(db, poId, user, isAdmin) {
  const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin });
  if (["completed", "closed", "cancelled"].includes(po.status)) return po.status;

  const aggregate = (await db(
    `select
       count(*) filter (where shipment_status <> 'cancelled')::int as total,
       count(*) filter (where shipment_status = 'delivered')::int as delivered,
       count(*) filter (where shipment_status = 'partially_delivered')::int as partial,
       count(*) filter (where shipment_status = 'rejected_goods')::int as rejected,
       count(*) filter (
         where shipment_status in ('in_transit','customs','warehouse','arrived','delivered','partially_delivered','rejected_goods')
       )::int as moving
       from public.mkt_po_shipments
      where po_id=$1`,
    [po.id],
  )).rows[0] ?? {};

  const total = Number(aggregate.total ?? 0);
  const delivered = Number(aggregate.delivered ?? 0);
  const partial = Number(aggregate.partial ?? 0);
  const rejected = Number(aggregate.rejected ?? 0);
  const moving = Number(aggregate.moving ?? 0);
  if (!total) return po.status;

  let target = null;
  if (rejected > 0) target = "rejected_goods";
  else if (delivered === total) target = "delivered";
  else if (delivered > 0 || partial > 0) target = "partially_delivered";
  else if (moving > 0) target = "in_transit";

  if (!target || target === po.status) return po.status;

  const updated = await db(
    `update public.mkt_purchase_orders
        set status=$1::mkt_po_status, updated_at=now()
      where id=$2
        and status not in ('completed','closed','cancelled')
        and status <> $1::mkt_po_status
      returning status`,
    [target, po.id],
  );
  if (!updated.rowCount) return po.status;

  const key = `po-shipment-sync:${po.id}:${target}`;
  await writeActivity(db, {
    poId: po.id,
    user: actor(user, isAdmin ? "admin" : "system"),
    action: `po_${target}`,
    oldValue: { status: po.status },
    newValue: { status: target },
    description: `Status PO disinkronkan dari lifecycle shipment menjadi ${target}.`,
    key,
  });
  await queueNotification(db, {
    eventType: `po_${target}`,
    po,
    payload: { status: target, source: "shipment_lifecycle" },
    key,
  });
  await notifyMarketplaceEvent(db, {
    eventType: `po_${target}`,
    po,
    payload: { status: target, source: "shipment_lifecycle" },
    key,
  });
  return target;
}

async function appendShipmentEvent({ shipmentId, body, request, user, isAdmin }) {
  const key = idempotencyKey(request, body);
  if (!key) fail(400, "Idempotency-Key wajib diisi untuk event shipment.");
  const eventType = text(body.eventType);
  if (!eventType) fail(400, "Event shipment wajib diisi.");
  const targetStatus = SHIPMENT_EVENT_STATUS[eventType];
  if (!targetStatus) fail(400, "Tipe event shipment tidak valid.");

  return withTransaction(async (db) => {
    let shipment = await loadShipment(shipmentId, user, { client: db, forUpdate: true, isAdmin });
    const existing = (await db(
      `select * from public.mkt_po_shipment_events where shipment_id=$1 and idempotency_key=$2 limit 1`,
      [shipment.id, key],
    )).rows[0];
    if (existing) return { id: Number(existing.id), alreadyProcessed: true, event: mapEvent(existing) };
    if (shipment.shipment_status === targetStatus) {
      fail(409, `Shipment sudah berada pada status ${targetStatus}; event concurrent/stale ditolak.`);
    }
    if (!SHIPMENT_TRANSITIONS[shipment.shipment_status]?.has(targetStatus)) {
      fail(409, `Shipment tidak dapat berpindah dari ${shipment.shipment_status} ke ${targetStatus}.`);
    }
    const updated = await db(
      `update public.mkt_po_shipments
          set shipment_status=$1,
              actual_departure=case when $1='in_transit' then coalesce(actual_departure,now()) else actual_departure end,
              actual_arrival=case when $1='arrived' then coalesce(actual_arrival,now()) else actual_arrival end,
              updated_at=now()
        where id=$2 and shipment_status=$3
        returning *`,
      [targetStatus, shipment.id, shipment.shipment_status],
    );
    if (!updated.rowCount) fail(409, "Shipment berubah oleh proses lain. Muat ulang lalu coba lagi.");
    shipment = { ...shipment, ...updated.rows[0] };
    const sequence = Number((await db(
      `select coalesce(max(event_sequence),0)+1 as next
         from public.mkt_po_shipment_events
        where shipment_id=$1`,
      [shipment.id],
    )).rows[0].next);
    const inserted = await db(
      `insert into public.mkt_po_shipment_events
         (shipment_id,event_sequence,event_type,note,location,latitude,longitude,
          actor_type,actor_id,idempotency_key)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning *`,
      [
        shipment.id,
        sequence,
        eventType,
        text(body.note),
        text(body.location),
        body.latitude == null ? null : decimal(body.latitude, "Latitude"),
        body.longitude == null ? null : decimal(body.longitude, "Longitude"),
        isAdmin ? "admin" : "customer",
        String(user?.id ?? "system"),
        key,
      ],
    );
    await writeActivity(db, {
      poId: shipment.po_id,
      user: actor(user, isAdmin ? "admin" : "customer"),
      action: `shipment_${eventType}`,
      oldValue: { status: body.previousStatus ?? null },
      newValue: { status: targetStatus, shipmentId: Number(shipment.id) },
      description: text(body.note, `Shipment event ${eventType}`),
      key: `shipment-event:${shipment.id}:${key}`,
    });
    await queueNotification(db, {
      eventType: `shipment_${eventType}`,
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id), eventType, status: targetStatus },
      key: `shipment-event:${shipment.id}:${key}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: `shipment_${eventType}`,
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id), eventType, status: targetStatus },
      key: `shipment-event:${shipment.id}:${key}`,
    });
    await syncPoStatusFromShipments(db, shipment.po_id, user, isAdmin);
    return { id: Number(inserted.rows[0].id), alreadyProcessed: false, event: mapEvent(inserted.rows[0]) };
  });
}

function mapEvent(row) {
  return {
    id: Number(row.id),
    shipmentId: Number(row.shipment_id),
    eventSequence: Number(row.event_sequence),
    eventType: row.event_type,
    note: row.note,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    actorType: row.actor_type,
    actorId: row.actor_id,
    createdAt: row.created_at,
  };
}

async function listTimeline(shipmentId, user, isAdmin) {
  const shipment = await loadShipment(shipmentId, user, { isAdmin });
  const result = await query(
    `select * from public.mkt_po_shipment_events where shipment_id=$1 order by event_sequence,id`,
    [shipment.id],
  );
  return result.rows.map(mapEvent);
}

async function submitPod({ shipmentId, body, request, user, isAdmin }) {
  const key = idempotencyKey(request, body);
  if (!key) fail(400, "Idempotency-Key wajib diisi untuk POD.");
  const file = body?.file;
  let url = text(body.photoUrl ?? body.podUrl ?? body.url);
  return withTransaction(async (db) => {
    const shipment = await loadShipment(shipmentId, user, { client: db, forUpdate: true, isAdmin });
    if (file && typeof file.arrayBuffer === "function") {
      const uploaded = await uploadMarketplacePod({ poId: shipment.po_id, shipmentId: shipment.id, file });
      url = uploaded.path;
    }
    if (!url) {
      fail(400, "POD wajib berupa file JPG/PNG/PDF atau URL/object path yang valid.");
    }
    const existing = (await db(
      `select * from public.mkt_po_shipment_events
        where shipment_id=$1 and event_type='pod_submitted' and idempotency_key=$2
        limit 1`,
      [shipment.id, key],
    )).rows[0];
    if (existing) return { alreadyProcessed: true, pod: mapPod(existing) };
    if (!["arrived", "delivered", "partially_delivered"].includes(shipment.shipment_status)) {
      fail(409, "POD hanya dapat disubmit setelah shipment tiba.");
    }
    const sequence = Number((await db(
      `select coalesce(max(event_sequence),0)+1 as next
         from public.mkt_po_shipment_events where shipment_id=$1`,
      [shipment.id],
    )).rows[0].next);
    const inserted = await db(
      `insert into public.mkt_po_shipment_events
         (shipment_id,event_sequence,event_type,note,attachment_object_path,
          actor_type,actor_id,idempotency_key)
       values ($1,$2,'pod_submitted',$3,$4,$5,$6,$7)
       returning *`,
      [
        shipment.id,
        sequence,
        text(body.note ?? body.remarks),
        url,
        isAdmin ? "admin" : "customer",
        String(user?.id ?? "system"),
        key,
      ],
    );
    await writeActivity(db, {
      poId: shipment.po_id,
      user: actor(user, isAdmin ? "admin" : "customer"),
      action: "shipment_pod_submitted",
      newValue: { shipmentId: Number(shipment.id), url },
      description: "POD shipment disubmit.",
      key: `shipment-pod:${shipment.id}:${key}`,
    });
    await queueNotification(db, {
      eventType: "shipment_pod_submitted",
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id) },
      key: `shipment-pod:${shipment.id}:${key}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: "shipment_pod_submitted",
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id) },
      key: `shipment-pod:${shipment.id}:${key}`,
    });
    await maybeCompletePo(db, shipment.po_id, user, isAdmin);
    return { alreadyProcessed: false, pod: mapPod(inserted.rows[0]) };
  });
}

function mapPod(row) {
  return {
    available: true,
    url: row.attachment_object_path,
    uploadedAt: row.created_at,
    note: row.note,
  };
}

async function getPod(shipmentId, user, isAdmin) {
  const shipment = await loadShipment(shipmentId, user, { isAdmin });
  const result = await query(
    `select * from public.mkt_po_shipment_events
      where shipment_id=$1 and event_type='pod_submitted'
      order by created_at desc,id desc limit 1`,
    [shipment.id],
  );
  if (!result.rows[0]) fail(404, "POD belum tersedia.");
  const row = result.rows[0];
  const pod = mapPod(row);
  if (String(row.attachment_object_path ?? "").startsWith("marketplace-pod/")) {
    pod.url = await signedMarketplacePodUrl({
      poId: shipment.po_id,
      shipmentId: shipment.id,
      path: row.attachment_object_path,
    });
  }
  return pod;
}

async function goodsReceipts(shipmentId, user, isAdmin, client = query) {
  const shipment = await loadShipment(shipmentId, user, { client, isAdmin });
  const receipts = await client(
    `select * from public.mkt_po_goods_receipts
      where shipment_id=$1 order by created_at desc,id desc`,
    [shipment.id],
  );
  const data = [];
  for (const receipt of receipts.rows) {
    const items = await client(
      `select gri.*, si.line_number, si.po_line_id
         from public.mkt_po_goods_receipt_items gri
         join public.mkt_po_shipment_items si on si.id=gri.shipment_item_id
        where gri.goods_receipt_id=$1 order by gri.id`,
      [receipt.id],
    );
    data.push({
      id: Number(receipt.id),
      shipmentId: Number(receipt.shipment_id),
      receiptNumber: receipt.receipt_number,
      receiptType: receipt.receipt_type,
      inspectionStatus: receipt.inspection_status,
      receivedBy: receipt.received_by,
      receivedAt: receipt.received_at,
      notes: receipt.notes,
      createdAt: receipt.created_at,
      items: items.rows.map((item) => ({
        id: Number(item.id),
        shipmentItemId: Number(item.shipment_item_id),
        lineNumber: Number(item.line_number),
        poLineId: Number(item.po_line_id),
        receivedQty: item.received_qty,
        acceptedQty: item.accepted_qty,
        rejectedQty: item.rejected_qty,
        condition: item.condition,
        notes: item.notes,
      })),
    });
  }
  return data;
}

async function createGoodsReceipt({ shipmentId, body, request, user, isAdmin }) {
  const key = idempotencyKey(request, body);
  if (!key) fail(400, "Idempotency-Key wajib diisi untuk goods receipt.");
  const receiptType = text(body.receiptType);
  if (!["full", "partial", "rejected"].includes(receiptType)) fail(400, "Receipt type tidak valid.");
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) fail(400, "Goods receipt harus memiliki item.");

  return withTransaction(async (db) => {
    const shipment = await loadShipment(shipmentId, user, { client: db, forUpdate: true, isAdmin });
    const existing = (await db(
      `select * from public.mkt_po_goods_receipts where shipment_id=$1 and idempotency_key=$2 limit 1`,
      [shipment.id, key],
    )).rows[0];
    if (existing) return { alreadyProcessed: true, receipt: (await goodsReceipts(shipment.id, user, isAdmin, db)).find((row) => row.id === Number(existing.id)) };
    if (!["arrived", "delivered", "partially_delivered"].includes(shipment.shipment_status)) {
      fail(409, "Goods receipt hanya dapat dibuat setelah shipment tiba.");
    }
    if (!isAdmin) {
      const podExists = (await db(
        `select exists(
           select 1
             from public.mkt_po_shipment_events
            where shipment_id=$1
              and event_type='pod_submitted'
         ) as available`,
        [shipment.id],
      )).rows[0]?.available;
      if (!podExists) fail(409, "Konfirmasi penerimaan hanya dapat dilakukan setelah POD tersedia.");
    }

    const validItems = (await db(
      `select si.*, pol.item_name from public.mkt_po_shipment_items si
         join public.mkt_purchase_order_lines pol on pol.id=si.po_line_id
        where si.shipment_id=$1`,
      [shipment.id],
    )).rows;
    const previous = (await db(
      `select gri.shipment_item_id,
              coalesce(sum(gri.received_qty),0) as received_qty,
              coalesce(sum(gri.accepted_qty),0) as accepted_qty,
              coalesce(sum(gri.rejected_qty),0) as rejected_qty
         from public.mkt_po_goods_receipt_items gri
         join public.mkt_po_goods_receipts gr on gr.id=gri.goods_receipt_id
        where gr.shipment_id=$1
        group by gri.shipment_item_id`,
      [shipment.id],
    )).rows;
    const previousMap = new Map(previous.map((item) => [Number(item.shipment_item_id), item]));
    const itemMap = new Map(validItems.map((item) => [Number(item.id), item]));
    const requestedMap = new Map();

    for (const item of items) {
      const shipmentItemId = integer(item.shipmentItemId, "Shipment item");
      const shipmentItem = itemMap.get(shipmentItemId);
      if (!shipmentItem) fail(404, "Shipment item bukan bagian dari shipment ini.");
      const receivedQty = decimal(item.receivedQty, "Received qty");
      const acceptedQty = decimal(item.acceptedQty ?? receivedQty, "Accepted qty");
      const rejectedQty = decimal(item.rejectedQty ?? 0, "Rejected qty");
      const prior = previousMap.get(shipmentItemId) ?? { received_qty: 0, accepted_qty: 0, rejected_qty: 0 };
      const remainingQty = Math.max(0, Number(shipmentItem.qty) - Number(prior.received_qty ?? 0));
      if (acceptedQty + rejectedQty > receivedQty || receivedQty > remainingQty) {
        fail(409, "Qty goods receipt melebihi sisa qty shipment.");
      }
      requestedMap.set(shipmentItemId, { receivedQty, acceptedQty, rejectedQty });
    }

    const projected = validItems.map((shipmentItem) => {
      const shipmentItemId = Number(shipmentItem.id);
      const prior = previousMap.get(shipmentItemId) ?? { received_qty: 0, accepted_qty: 0, rejected_qty: 0 };
      const current = requestedMap.get(shipmentItemId) ?? { receivedQty: 0, acceptedQty: 0, rejectedQty: 0 };
      return {
        qty: Number(shipmentItem.qty),
        received: Number(prior.received_qty ?? 0) + current.receivedQty,
        accepted: Number(prior.accepted_qty ?? 0) + current.acceptedQty,
        rejected: Number(prior.rejected_qty ?? 0) + current.rejectedQty,
      };
    });
    const anyReceived = projected.some((item, index) => {
      const shipmentItem = validItems[index];
      const current = requestedMap.get(Number(shipmentItem.id));
      return Number(current?.receivedQty ?? 0) > 0;
    });
    const allAccepted = projected.every((item) => item.accepted >= item.qty && item.rejected === 0);
    const anyRejected = projected.some((item) => item.rejected > 0);
    if (!anyReceived) fail(400, "Minimal satu qty penerimaan harus diisi.");
    if (receiptType === "full" && !allAccepted) {
      fail(409, "Penerimaan penuh harus menerima seluruh sisa qty shipment tanpa penolakan.");
    }
    if (receiptType === "partial" && allAccepted) {
      fail(409, "Gunakan penerimaan penuh jika seluruh qty shipment diterima.");
    }
    if (receiptType === "rejected" && !anyRejected) {
      fail(409, "Penerimaan ditolak harus memiliki qty yang ditolak.");
    }
    const receiptNumber = `GR-${shipment.id}-${key.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32) || Date.now()}`;
    const inserted = await db(
      `insert into public.mkt_po_goods_receipts
         (shipment_id,receipt_number,receipt_type,inspection_status,received_by,
          received_at,notes,idempotency_key)
       values ($1,$2,$3,$4,$5,coalesce($6::timestamp,now()),$7,$8)
       returning *`,
      [
        shipment.id,
        receiptNumber,
        receiptType,
        text(body.inspectionStatus, receiptType === "rejected" ? "failed" : "passed"),
        text(body.receivedBy, user?.name ?? user?.email ?? "admin"),
        text(body.receivedAt),
        text(body.notes),
        key,
      ],
    );
    if (receiptType === "full") {
      await db(
        `update public.mkt_purchase_orders
            set payment_due_at=case payment_term_code
              when 'net_7' then coalesce(payment_due_at, now() + interval '7 days')
              when 'net_14' then coalesce(payment_due_at, now() + interval '14 days')
              when 'net_30' then coalesce(payment_due_at, now() + interval '30 days')
              else payment_due_at
            end,
            updated_at=now()
          where id=$1`,
        [shipment.po_id],
      );
    }
    for (const item of items) {
      const receivedQty = decimal(item.receivedQty, "Received qty");
      const acceptedQty = decimal(item.acceptedQty ?? receivedQty, "Accepted qty");
      const rejectedQty = decimal(item.rejectedQty ?? 0, "Rejected qty");
      await db(
        `insert into public.mkt_po_goods_receipt_items
           (goods_receipt_id,shipment_item_id,received_qty,accepted_qty,rejected_qty,condition,notes)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          inserted.rows[0].id,
          integer(item.shipmentItemId, "Shipment item"),
          receivedQty,
          acceptedQty,
          rejectedQty,
          text(item.condition, "GOOD"),
          text(item.notes),
        ],
      );
    }
    const nextShipmentStatus = receiptType === "full"
      ? "delivered"
      : receiptType === "partial" ? "partially_delivered" : "rejected_goods";
    if (shipment.shipment_status !== nextShipmentStatus) {
      if (!SHIPMENT_TRANSITIONS[shipment.shipment_status]?.has(nextShipmentStatus)) {
        fail(409, `Shipment tidak dapat berpindah dari ${shipment.shipment_status} ke ${nextShipmentStatus}.`);
      }
      await db(
        `update public.mkt_po_shipments set shipment_status=$1, actual_arrival=coalesce(actual_arrival,now()), updated_at=now()
          where id=$2 and shipment_status=$3`,
        [nextShipmentStatus, shipment.id, shipment.shipment_status],
      );
    }
    await writeActivity(db, {
      poId: shipment.po_id,
      user: actor(user, isAdmin ? "admin" : "customer"),
      action: "goods_receipt_created",
      newValue: { shipmentId: Number(shipment.id), receiptId: Number(inserted.rows[0].id), receiptType },
      description: `Goods receipt ${receiptType} dibuat.`,
      key: `goods-receipt:${shipment.id}:${key}`,
    });
    await queueNotification(db, {
      eventType: "goods_receipt_created",
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id), receiptId: Number(inserted.rows[0].id), receiptType },
      key: `goods-receipt:${shipment.id}:${key}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: "goods_receipt_created",
      po: { ...shipment, id: shipment.po_id },
      payload: { shipmentId: Number(shipment.id), receiptId: Number(inserted.rows[0].id), receiptType },
      key: `goods-receipt:${shipment.id}:${key}`,
    });
    await syncPoStatusFromShipments(db, shipment.po_id, user, isAdmin);
    if (receiptType === "full") await maybeCompletePo(db, shipment.po_id, user, isAdmin);
    const receipt = (await goodsReceipts(shipment.id, user, isAdmin, db)).find((row) => row.id === Number(inserted.rows[0].id));
    return { alreadyProcessed: false, receipt };
  });
}

async function maybeCompletePo(db, poId, user, isAdmin) {
  const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin });
  const completion = (await db(
    `with active_shipments as (
         select id, shipment_status
           from public.mkt_po_shipments
          where po_id=$1 and shipment_status <> 'cancelled'
       ),
       accepted_by_item as (
         select gri.shipment_item_id, coalesce(sum(gri.accepted_qty),0) as accepted_qty
           from public.mkt_po_goods_receipt_items gri
           join public.mkt_po_goods_receipts gr on gr.id=gri.goods_receipt_id
           join active_shipments s on s.id=gr.shipment_id
          group by gri.shipment_item_id
       ),
       shipped_by_line as (
         select si.po_line_id, coalesce(sum(si.qty),0) as shipped_qty
           from public.mkt_po_shipment_items si
           join active_shipments s on s.id=si.shipment_id
          group by si.po_line_id
       )
       select
         exists(select 1 from active_shipments) as has_shipments,
         not exists(
           select 1 from active_shipments where shipment_status <> 'delivered'
         ) as all_shipments_delivered,
         not exists(
           select 1
             from active_shipments s
            where not exists (
              select 1 from public.mkt_po_shipment_events e
               where e.shipment_id=s.id and e.event_type='pod_submitted'
            )
         ) as all_shipments_have_pod,
         not exists(
           select 1
             from public.mkt_po_shipment_items si
             join active_shipments s on s.id=si.shipment_id
             left join accepted_by_item a on a.shipment_item_id=si.id
            where coalesce(a.accepted_qty,0) < si.qty
         ) as all_shipment_items_accepted,
         not exists(
           select 1
             from public.mkt_purchase_order_lines pol
             left join shipped_by_line sh on sh.po_line_id=pol.id
            where pol.po_id=$1
              and coalesce(sh.shipped_qty,0) <> pol.qty
         ) as all_po_qty_allocated`,
    [po.id],
  )).rows[0] ?? {};
  const gate = Boolean(
    completion.has_shipments
    && completion.all_shipments_delivered
    && completion.all_shipments_have_pod
    && completion.all_shipment_items_accepted
    && completion.all_po_qty_allocated
  );
  if (!gate || ["completed", "closed", "cancelled"].includes(po.status)) return false;
  const updated = await db(
    `update public.mkt_purchase_orders
        set status='completed'::mkt_po_status, actual_completion_date=current_date, updated_at=now()
      where id=$1 and status <> 'completed'::mkt_po_status
      returning id`,
    [po.id],
  );
  if (!updated.rowCount) return false;
  await writeActivity(db, {
    poId: po.id,
    user: actor(user, isAdmin ? "admin" : "system"),
    action: "po_completed",
    oldValue: { status: po.status },
    newValue: { status: "completed" },
    description: "PO completed setelah seluruh shipment delivered, seluruh POD tersedia, dan seluruh qty PO diterima penuh.",
    key: `po:${po.id}:completed`,
  });
  await queueNotification(db, {
    eventType: "po_completed",
    po,
    payload: { status: "completed" },
    key: `po:${po.id}:completed`,
  });
  await notifyMarketplaceEvent(db, {
    eventType: "po_completed",
    po,
    payload: { status: "completed" },
    key: `po:${po.id}:completed`,
  });
  return true;
}

async function setPoPaymentTerms({ poId, body, user }) {
  const code = normalizePaymentTerm(body.paymentTermCode ?? body.paymentTerms);
  if (!code) fail(400, "Syarat pembayaran wajib dipilih: prepaid, NET 7, NET 14, atau NET 30.");
  return withTransaction(async (db) => {
    const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin: true });
    if (po.payment_status === "paid") fail(409, "Syarat pembayaran tidak dapat diubah setelah pembayaran lunas.");
    const days = paymentTermDays(code);
    const updated = (await db(
      `update public.mkt_purchase_orders
          set payment_term_code=$1,
              payment_terms_snapshot=$2,
              payment_due_at=case
                when $3::int > 0 and status in ('completed','closed') then coalesce(payment_due_at, now() + ($3::text || ' days')::interval)
                when $3::int = 0 then null
                else payment_due_at
              end,
              updated_at=now()
        where id=$4
        returning *`,
      [code, paymentTermLabel(code), days, po.id],
    )).rows[0];
    await writeActivity(db, {
      poId: po.id,
      user: actor(user, "admin"),
      action: "po_payment_terms_set",
      oldValue: { paymentTermCode: po.payment_term_code, paymentTerms: po.payment_terms_snapshot },
      newValue: { paymentTermCode: code, paymentTerms: paymentTermLabel(code) },
      description: `Syarat pembayaran PO ditetapkan: ${paymentTermLabel(code)}.`,
      key: `po-payment-terms:${po.id}:${code}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: "po_payment_terms_set",
      po,
      payload: { paymentTermCode: code, paymentTerms: paymentTermLabel(code) },
      key: `po-payment-terms:${po.id}:${code}`,
    });
    return paymentView(updated);
  });
}

async function scanPoPaymentProof({ poId, body, user }) {
  const po = await loadPo(poId, user, { isAdmin: false });
  const code = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
  if (!code) fail(409, "Syarat pembayaran belum ditetapkan. Hubungi admin CST.");
  if (po.payment_proof_path) {
    fail(409, "Bukti pembayaran untuk PO ini sudah pernah dikirim dan dikunci. Upload ulang tidak diizinkan.");
  }

  const file = body?.file;
  if (!file || typeof file.arrayBuffer !== "function") {
    fail(400, "Pilih gambar bukti pembayaran JPG/PNG/WEBP.");
  }

  const expectedAmount = Number(po.grand_total ?? 0);
  const timeoutMs = 30_000;
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  const result = await Promise.race([
    extractPaymentAmountFromFile(file, expectedAmount),
    timeout,
  ]);

  if (!result) {
    return {
      extractedAmount: null,
      confidence: 0,
      matchesExpected: false,
      expectedAmount,
      timedOut: true,
    };
  }

  return {
    extractedAmount: result.extractedAmount,
    confidence: result.confidence,
    matchesExpected: Boolean(
      result.extractedAmount != null
      && Number(result.extractedAmount) === expectedAmount
    ),
    expectedAmount,
    timedOut: false,
  };
}

async function submitPoPaymentProof({ poId, body, user }) {
  const po = await loadPo(poId, user, { isAdmin: false });
  const code = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
  if (!code) fail(409, "Syarat pembayaran belum ditetapkan. Hubungi admin CST.");
  if (po.payment_status === "paid") fail(409, "Pembayaran PO ini sudah berstatus Lunas.");
  if (po.payment_proof_path) {
    fail(409, "Bukti pembayaran untuk PO ini sudah pernah dikirim dan dikunci. Upload ulang tidak diizinkan.");
  }

  const file = body?.file;
  if (!file || typeof file.arrayBuffer !== "function") {
    fail(400, "File bukti pembayaran JPG/PNG/WEBP wajib diunggah.");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const proofSha256 = createHash("sha256").update(fileBuffer).digest("hex");
  const expectedAmount = Number(po.grand_total ?? 0);
  const timeoutMs = 30_000;
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  const ocr = await Promise.race([
    extractPaymentAmountFromFile(file, expectedAmount),
    timeout,
  ]);

  if (!ocr?.extractedAmount) {
    fail(422, "Nominal pada bukti belum terbaca. Gunakan foto yang lebih jelas sebelum mengirim bukti pembayaran.");
  }
  if (Number(ocr.extractedAmount) !== expectedAmount) {
    fail(
      422,
      `Nominal bukti ${Number(ocr.extractedAmount).toLocaleString("id-ID")} tidak sama dengan tagihan ${expectedAmount.toLocaleString("id-ID")}.`,
    );
  }

  return withTransaction(async (db) => {
    const locked = await loadPo(po.id, user, { client: db, forUpdate: true, isAdmin: false });
    if (locked.payment_status === "paid") fail(409, "Pembayaran PO ini sudah berstatus Lunas.");
    if (locked.payment_proof_path) {
      fail(409, "Bukti pembayaran untuk PO ini sudah pernah dikirim dan dikunci. Upload ulang tidak diizinkan.");
    }

    const duplicate = (await db(
      `select id, po_number
         from public.mkt_purchase_orders
        where payment_proof_sha256=$1
        limit 1`,
      [proofSha256],
    )).rows[0];
    if (duplicate) {
      fail(409, "File bukti pembayaran yang sama sudah pernah digunakan pada transaksi lain.");
    }

    let uploaded = null;
    try {
      uploaded = await uploadMarketplacePaymentProof({ poId: locked.id, file });
      const updated = (await db(
        `update public.mkt_purchase_orders
            set payment_status='proof_submitted',
                payment_proof_path=$1,
                payment_proof_sha256=$2,
                payment_proof_file_name=$3,
                payment_proof_mime_type=$4,
                payment_proof_uploaded_at=now(),
                payment_ocr_amount=$5,
                payment_ocr_confidence=$6,
                payment_ocr_raw_text=$7,
                payment_ocr_matches=true,
                payment_rejection_reason=null,
                updated_at=now()
          where id=$8 and payment_proof_path is null
          returning *`,
        [
          uploaded.path,
          proofSha256,
          uploaded.fileName || String(file.name || "bukti-pembayaran"),
          uploaded.mimeType || String(file.type || ""),
          Number(ocr.extractedAmount),
          Number(ocr.confidence ?? 0),
          null,
          locked.id,
        ],
      )).rows[0];
      if (!updated) {
        fail(409, "Bukti pembayaran sudah tersimpan oleh proses lain. Upload ulang tidak diizinkan.");
      }

      await writeActivity(db, {
        poId: locked.id,
        user: actor(user, "customer"),
        action: "po_payment_proof_submitted",
        newValue: {
          paymentStatus: "proof_submitted",
          ocrAmount: Number(ocr.extractedAmount),
          expectedAmount,
          ocrMatches: true,
        },
        description: "Customer mengunggah bukti pembayaran marketplace; nominal OCR cocok dengan tagihan dan bukti dikunci.",
        key: `po-payment-proof:${locked.id}:${proofSha256}`,
      });
      await notifyAdmins(db, {
        eventKey: `po-payment-proof:${locked.id}:${proofSha256}`,
        type: "po_payment_proof_submitted",
        title: "Bukti pembayaran marketplace",
        message: `Bukti pembayaran ${locked.po_number} menunggu pemeriksaan dan persetujuan admin.`,
        resourceType: "purchase_order",
        resourceId: Number(locked.id),
        link: `/admin?tab=marketplace-operations&poId=${locked.id}&focus=payment`,
        payload: {
          poId: Number(locked.id),
          paymentStatus: "proof_submitted",
          ocrAmount: Number(ocr.extractedAmount),
          expectedAmount,
          ocrMatches: true,
        },
      });
      return { alreadyProcessed: false, payment: await paymentView(updated) };
    } catch (error) {
      if (uploaded?.path) {
        await deleteMarketplacePaymentProof({ poId: locked.id, path: uploaded.path }).catch(() => {});
      }
      throw error;
    }
  });
}

async function reviewPoPayment({ poId, action, body, user }) {
  if (!["verify", "reject"].includes(action)) fail(400, "Aksi pembayaran tidak valid.");
  return withTransaction(async (db) => {
    const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin: true });
    const code = po.payment_term_code ?? normalizePaymentTerm(po.payment_terms_snapshot);
    if (!code) fail(409, "Tetapkan syarat pembayaran terlebih dahulu.");
    if (action === "verify") {
      if (!po.payment_proof_path && po.payment_status !== "paid") {
        fail(409, "Bukti pembayaran belum tersedia.");
      }
      const updated = (await db(
        `update public.mkt_purchase_orders
            set payment_status='paid',
                payment_verified_at=coalesce(payment_verified_at,now()),
                payment_verified_by=$1,
                payment_rejection_reason=null,
                updated_at=now()
          where id=$2
          returning *`,
        [user?.email ?? user?.name ?? "admin", po.id],
      )).rows[0];
      await writeActivity(db, {
        poId: po.id,
        user: actor(user, "admin"),
        action: "po_payment_verified",
        oldValue: { paymentStatus: po.payment_status },
        newValue: { paymentStatus: "paid" },
        description: text(body.notes, "Pembayaran customer diverifikasi lunas."),
        key: `po-payment-verified:${po.id}`,
      });
      await notifyMarketplaceEvent(db, {
        eventType: "po_payment_verified",
        po,
        payload: { paymentStatus: "paid" },
        key: `po-payment-verified:${po.id}`,
      });
      return paymentView(updated);
    }

    if (!po.payment_proof_path) fail(409, "Belum ada bukti pembayaran untuk ditolak.");
    const reason = text(body.reason);
    if (!reason) fail(400, "Alasan penolakan bukti pembayaran wajib diisi.");
    const updated = (await db(
      `update public.mkt_purchase_orders
          set payment_status='rejected',
              payment_rejection_reason=$1,
              payment_verified_at=null,
              payment_verified_by=null,
              updated_at=now()
        where id=$2
        returning *`,
      [reason, po.id],
    )).rows[0];
    await writeActivity(db, {
      poId: po.id,
      user: actor(user, "admin"),
      action: "po_payment_rejected",
      oldValue: { paymentStatus: po.payment_status },
      newValue: { paymentStatus: "rejected" },
      description: reason,
      key: `po-payment-rejected:${po.id}:${Date.now()}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: "po_payment_rejected",
      po,
      payload: { paymentStatus: "rejected", reason },
      key: `po-payment-rejected:${po.id}:${Date.now()}`,
    });
    return paymentView(updated);
  });
}

async function transitionPo({ poId, action, body, request, user, isAdmin }) {
  const target = PO_ACTION_STATUS[action];
  if (!target) return false;
  const key = idempotencyKey(request, body) ?? `po-action:${poId}:${action}`;
  return withTransaction(async (db) => {
    const po = await loadPo(poId, user, { client: db, forUpdate: true, isAdmin });
    if (po.status === target) return { status: target, alreadyProcessed: true };
    if (!PO_TRANSITIONS[po.status]?.has(target)) {
      fail(409, `PO tidak dapat berpindah dari ${po.status} ke ${target}.`);
    }
    if (target === "completed") {
      const completed = await maybeCompletePo(db, po.id, user, isAdmin);
      if (!completed) fail(409, "PO belum memenuhi gate POD dan goods receipt full.");
      return { status: "completed", alreadyProcessed: false };
    }
    if (target === "closed" && po.payment_status !== "paid") {
      fail(409, "PO belum dapat ditutup karena pembayaran customer belum lunas.");
    }
    const updated = await db(
      `update public.mkt_purchase_orders set status=$1::mkt_po_status,
              confirmed_at=case when $1='vendor_accepted' then coalesce(confirmed_at,now()) else confirmed_at end,
              closed_at=case when $1='closed' then now() else closed_at end,
              updated_at=now()
        where id=$2 and status=$3::mkt_po_status
        returning status`,
      [target, po.id, po.status],
    );
    if (!updated.rowCount) fail(409, "PO berubah oleh proses lain. Muat ulang lalu coba lagi.");
    await writeActivity(db, {
      poId: po.id,
      user: actor(user, "admin"),
      action: `po_${target}`,
      oldValue: { status: po.status },
      newValue: { status: target },
      description: text(body.reason, `PO berpindah ke ${target}.`),
      key: `po-transition:${po.id}:${key}`,
    });
    await queueNotification(db, {
      eventType: `po_${target}`,
      po,
      payload: { status: target },
      key: `po-transition:${po.id}:${key}`,
    });
    await notifyMarketplaceEvent(db, {
      eventType: `po_${target}`,
      po,
      payload: { status: target },
      key: `po-transition:${po.id}:${key}`,
    });
    return { status: target, alreadyProcessed: false };
  });
}

async function handlePortalOperations({ request, response, pathname, body, user, sendJson }) {
  const poPaymentScan = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/payment\/scan$/);
  if (request.method === "POST" && poPaymentScan) {
    sendJson(response, 200, { ok: true, data: await scanPoPaymentProof({ poId: poPaymentScan[1], body, user }) });
    return true;
  }
  const poPayment = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/payment$/);
  if (request.method === "GET" && poPayment) {
    const po = await loadPo(poPayment[1], user, { isAdmin: false });
    sendJson(response, 200, { ok: true, data: await paymentView(po) });
    return true;
  }
  if (request.method === "POST" && poPayment) {
    sendJson(response, 200, { ok: true, data: await submitPoPaymentProof({ poId: poPayment[1], body, user }) });
    return true;
  }
  const shipmentList = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/shipments$/);
  if (request.method === "GET" && shipmentList) {
    sendJson(response, 200, { ok: true, data: await getShipmentList(shipmentList[1], user, false) });
    return true;
  }
  const selection = pathname.match(/^\/api\/mkt\/portal\/purchase-orders\/(\d+)\/shipment-selection$/);
  if (request.method === "POST" && selection) {
    sendJson(response, 200, { ok: true, data: await createShipment({ poId: selection[1], body, request, user, isAdmin: false }) });
    return true;
  }
  const shipmentDetailMatch = pathname.match(/^\/api\/mkt\/portal\/shipments\/(\d+)$/);
  if (request.method === "GET" && shipmentDetailMatch) {
    const shipment = await loadShipment(shipmentDetailMatch[1], user, { isAdmin: false });
    sendJson(response, 200, { ok: true, data: await shipmentDetail(query, shipment) });
    return true;
  }
  const goods = pathname.match(/^\/api\/mkt\/portal\/shipments\/(\d+)\/goods-receipts$/);
  if (request.method === "GET" && goods) {
    sendJson(response, 200, { ok: true, data: await goodsReceipts(goods[1], user, false) });
    return true;
  }
  if (request.method === "POST" && goods) {
    sendJson(response, 200, { ok: true, data: await createGoodsReceipt({
      shipmentId: goods[1],
      body,
      request,
      user,
      isAdmin: false,
    }) });
    return true;
  }
  const timeline = pathname.match(/^\/api\/mkt\/portal\/shipments\/(\d+)\/timeline$/);
  if (request.method === "GET" && timeline) {
    sendJson(response, 200, { ok: true, data: await listTimeline(timeline[1], user, false) });
    return true;
  }
  const pod = pathname.match(/^\/api\/mkt\/portal\/shipments\/(\d+)\/pod$/);
  if (request.method === "GET" && pod) {
    sendJson(response, 200, { ok: true, data: await getPod(pod[1], user, false) });
    return true;
  }
  return false;
}

async function handleAdminOperations({ request, response, pathname, body, user, sendJson }) {
  const poPayment = pathname.match(/^\/api\/mkt\/admin\/purchase-orders\/(\d+)\/payment$/);
  if (request.method === "GET" && poPayment) {
    const po = await loadPo(poPayment[1], user, { isAdmin: true });
    sendJson(response, 200, { ok: true, data: await paymentView(po) });
    return true;
  }
  if (request.method === "PUT" && poPayment) {
    sendJson(response, 200, { ok: true, data: await setPoPaymentTerms({ poId: poPayment[1], body, user }) });
    return true;
  }
  const paymentReview = pathname.match(/^\/api\/mkt\/admin\/purchase-orders\/(\d+)\/payment\/(verify|reject)$/);
  if (request.method === "POST" && paymentReview) {
    sendJson(response, 200, { ok: true, data: await reviewPoPayment({ poId: paymentReview[1], action: paymentReview[2], body, user }) });
    return true;
  }
  const poLines = pathname.match(/^\/api\/mkt\/admin\/purchase-orders\/(\d+)\/lines$/);
  if (request.method === "GET" && poLines) {
    sendJson(response, 200, { ok: true, data: await listPoLines(poLines[1], user, true) });
    return true;
  }
  const poShipments = pathname.match(/^\/api\/mkt\/admin\/purchase-orders\/(\d+)\/shipments$/);
  if (request.method === "GET" && poShipments) {
    sendJson(response, 200, { ok: true, data: await getShipmentList(poShipments[1], user, true) });
    return true;
  }
  if (request.method === "POST" && poShipments) {
    sendJson(response, 200, { ok: true, data: await createShipment({ poId: poShipments[1], body, request, user, isAdmin: true }) });
    return true;
  }
  const poAction = pathname.match(/^\/api\/mkt\/admin\/purchase-orders\/(\d+)\/(issue|production|ready-to-ship|in-transit|delivered|complete|close)$/);
  if (poAction && request.method === "POST") {
    sendJson(response, 200, { ok: true, data: await transitionPo({ poId: poAction[1], action: poAction[2], body, request, user, isAdmin: true }) });
    return true;
  }
  const shipmentDetailMatch = pathname.match(/^\/api\/mkt\/admin\/shipments\/(\d+)$/);
  if (request.method === "GET" && shipmentDetailMatch) {
    const shipment = await loadShipment(shipmentDetailMatch[1], user, { isAdmin: true });
    sendJson(response, 200, { ok: true, data: await shipmentDetail(query, shipment) });
    return true;
  }
  const shipmentEvent = pathname.match(/^\/api\/mkt\/admin\/shipments\/(\d+)\/events$/);
  if (request.method === "POST" && shipmentEvent) {
    sendJson(response, 200, { ok: true, data: await appendShipmentEvent({ shipmentId: shipmentEvent[1], body, request, user, isAdmin: true }) });
    return true;
  }
  const shipmentReceipts = pathname.match(/^\/api\/mkt\/admin\/shipments\/(\d+)\/goods-receipts$/);
  if (request.method === "GET" && shipmentReceipts) {
    sendJson(response, 200, { ok: true, data: await goodsReceipts(shipmentReceipts[1], user, true) });
    return true;
  }
  if (request.method === "POST" && shipmentReceipts) {
    sendJson(response, 200, { ok: true, data: await createGoodsReceipt({ shipmentId: shipmentReceipts[1], body, request, user, isAdmin: true }) });
    return true;
  }
  const shipmentPod = pathname.match(/^\/api\/mkt\/admin\/shipments\/(\d+)\/pod$/);
  if (request.method === "POST" && shipmentPod) {
    sendJson(response, 200, { ok: true, data: await submitPod({ shipmentId: shipmentPod[1], body, request, user, isAdmin: true }) });
    return true;
  }
  return false;
}

export { handleAdminOperations, handlePortalOperations };