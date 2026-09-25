import crypto from "node:crypto";
import { pool, query } from "./db.mjs";
import {
  signedTruckingPaymentProofUrl,
  signedTruckingPodUrl,
  uploadTruckingPaymentProof,
  uploadTruckingPod,
} from "./storage.mjs";
import { createTruckingPaylabsLink, getTruckingPaylabsState } from "./paylabs-service.mjs";

const CUSTOMER_APPROVAL_STATES = new Set(["not_requested", "pending", "approved", "rejected"]);
const BOOKING_TERMINAL = new Set(["completed", "cancelled"]);

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizedPaymentTerms(value) {
  const type = value?.type === "dp" ? "dp" : "full";
  const dpPercent = type === "dp"
    ? Math.max(1, Math.min(99, Math.round(Number(value?.dpPercent ?? value?.dp_percent ?? 50))))
    : 100;
  return { type, dp_percent: dpPercent };
}

function initialRequiredAmount(booking) {
  const total = money(booking.final_price ?? booking.estimasi_total);
  const terms = normalizedPaymentTerms(booking.payment_terms);
  return terms.type === "dp" ? Math.round(total * terms.dp_percent) / 100 : total;
}

async function approvedManualTotal(bookingId, client = query) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  const row = (await run(
    `select coalesce(sum(amount),0) as amount
       from public.trucking_payments
      where booking_id=$1 and status='approved'`,
    [bookingId],
  )).rows[0];
  return money(row?.amount);
}

async function paidGatewayTotal(bookingId, client = query) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  try {
    const row = (await run(
      `select coalesce(sum(amount),0) as amount
         from public.mkt_gateway_payments
        where ref_kind='trucking'::payment_ref_kind
          and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='paid'::payment_status`,
      [bookingId],
    )).rows[0];
    return money(row?.amount);
  } catch {
    return 0;
  }
}

export async function truckingPaymentTotals(booking, client = query) {
  const [manual, gateway] = await Promise.all([
    approvedManualTotal(booking.id, client),
    paidGatewayTotal(booking.id, client),
  ]);
  const quotedAmount = money(booking.final_price ?? booking.estimasi_total);
  const actualCosts = money(booking.actual_toll) + money(booking.actual_parking) + money(booking.actual_extra_cost);
  const totalAmount = money(quotedAmount + actualCosts);
  const receivedAmount = money(manual + gateway);
  return {
    totalAmount,
    receivedAmount,
    remainingAmount: Math.max(0, money(totalAmount - receivedAmount)),
    initialRequiredAmount: initialRequiredAmount(booking),
  };
}

async function appendEvent(client, bookingId, status, actor, notes = null, metadata = {}) {
  await client.query(
    `insert into public.trucking_status_events
       (booking_id,status,actor_type,actor_id,actor_name,notes,metadata)
     values ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [
      bookingId,
      status,
      actor?.type ?? "system",
      actor?.id == null ? null : String(actor.id),
      actor?.name ?? null,
      notes,
      JSON.stringify(metadata ?? {}),
    ],
  );
}

async function bookingByNumber(bookingNumber, { forUpdate = false, client = query } = {}) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  const result = await run(
    `select * from public.trucking_booking_requests
      where booking_number=$1
      limit 1${forUpdate ? " for update" : ""}`,
    [bookingNumber],
  );
  return result.rows[0] ?? null;
}

async function bookingById(id, { forUpdate = false, client = query } = {}) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  const result = await run(
    `select * from public.trucking_booking_requests
      where id=$1
      limit 1${forUpdate ? " for update" : ""}`,
    [id],
  );
  return result.rows[0] ?? null;
}

function assertOwner(booking, user, companyIds = []) {
  const owns = Number(booking.portal_customer_id) === Number(user.id)
    || Number(booking.customer_id) === Number(user.id)
    || (booking.company_id != null && companyIds.includes(Number(booking.company_id)));
  if (!owns) fail(404, "Booking trucking tidak ditemukan.");
}

async function serializeBooking(booking, { includePrivate = false } = {}) {
  const [stopsResult, paymentsResult, eventsResult, paylabsState, totals] = await Promise.all([
    query(
      `select * from public.trucking_booking_stops
        where booking_id=$1 order by sequence_no,id`,
      [booking.id],
    ),
    query(
      `select * from public.trucking_payments
        where booking_id=$1 order by created_at desc,id desc`,
      [booking.id],
    ),
    query(
      `select * from public.trucking_status_events
        where booking_id=$1 order by created_at,id`,
      [booking.id],
    ),
    getTruckingPaylabsState(booking).catch(() => ({
      configured: false, activeMethods: [], latestPayment: null, canCreate: false,
    })),
    truckingPaymentTotals(booking),
  ]);

  const stops = await Promise.all(stopsResult.rows.map(async (stop) => ({
    id: Number(stop.id),
    sequenceNo: Number(stop.sequence_no),
    area: stop.area,
    address: stop.address,
    picName: stop.pic_name,
    picPhone: includePrivate ? stop.pic_phone : null,
    status: stop.status,
    arrivedAt: stop.arrived_at,
    deliveredAt: stop.delivered_at,
    receiverName: stop.receiver_name,
    podNotes: stop.pod_notes,
    podUrl: stop.pod_path
      ? await signedTruckingPodUrl({ bookingId: booking.id, stopId: stop.id, path: stop.pod_path }).catch(() => null)
      : null,
  })));

  const payments = await Promise.all(paymentsResult.rows.map(async (payment) => ({
    id: Number(payment.id),
    paymentKind: payment.payment_kind,
    amount: money(payment.amount),
    status: payment.status,
    reference: payment.reference,
    notes: payment.notes,
    rejectionReason: payment.rejection_reason,
    paidAt: payment.paid_at,
    createdAt: payment.created_at,
    proofUrl: payment.proof_path
      ? await signedTruckingPaymentProofUrl({ bookingId: booking.id, path: payment.proof_path }).catch(() => null)
      : null,
  })));

  return {
    id: Number(booking.id),
    bookingNumber: booking.booking_number,
    status: booking.status,
    vehicleType: booking.vehicle_type,
    vehicleName: booking.vehicle_name,
    serviceMode: booking.addons?.serviceMode ?? booking.addons?.service_mode ?? null,
    pickup: {
      area: booking.area_pickup,
      address: booking.alamat_pickup,
      picName: booking.pic_pickup,
      picPhone: includePrivate ? booking.hp_pickup : null,
    },
    schedule: {
      type: booking.jadwal_type,
      date: booking.tanggal_pickup,
      time: booking.jam_pickup,
    },
    cargo: {
      type: booking.jenis_barang,
      weightKg: booking.berat_kg == null ? null : Number(booking.berat_kg),
      koli: booking.jumlah_koli == null ? null : Number(booking.jumlah_koli),
      volumeM3: booking.volume_m3 == null ? null : Number(booking.volume_m3),
      notes: booking.catatan,
    },
    tripCount: Number(booking.jumlah_trip ?? 1),
    addons: booking.addons ?? {},
    estimate: money(booking.estimasi_total),
    finalPrice: booking.final_price == null ? null : money(booking.final_price),
    paymentTerms: normalizedPaymentTerms(booking.payment_terms),
    paymentStatus: booking.payment_status,
    paymentDueAt: booking.payment_due_at,
    totals,
    customerApprovalStatus: booking.customer_approval_status,
    customerApprovedAt: booking.customer_approved_at,
    adminNotes: includePrivate ? booking.admin_notes : null,
    assignment: {
      driverName: booking.driver_name,
      driverPhone: includePrivate ? booking.driver_phone : null,
      vehiclePlate: booking.vehicle_plate,
      driverToken: includePrivate ? booking.driver_token : null,
      assignedAt: booking.assigned_at,
    },
    actualCosts: {
      toll: money(booking.actual_toll),
      parking: money(booking.actual_parking),
      extra: money(booking.actual_extra_cost),
      notes: booking.actual_extra_cost_notes,
    },
    stops,
    payments,
    events: eventsResult.rows.map((event) => ({
      id: Number(event.id),
      status: event.status,
      actorType: event.actor_type,
      actorName: event.actor_name,
      notes: event.notes,
      metadata: event.metadata ?? {},
      createdAt: event.created_at,
    })),
    paylabs: paylabsState,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
    completedAt: booking.completed_at,
  };
}

export async function syncTruckingStops(client, booking) {
  const addons = booking.addons && typeof booking.addons === "object" ? booking.addons : {};
  const extra = Array.isArray(addons.deliveryStops) ? addons.deliveryStops : [];
  const stops = [
    {
      area: booking.area_delivery,
      address: booking.alamat_delivery,
      pic: booking.pic_penerima,
      phone: booking.hp_penerima,
    },
    ...extra,
  ];
  for (let index = 0; index < stops.length; index += 1) {
    const stop = stops[index];
    if (!String(stop?.address ?? "").trim()) continue;
    await client.query(
      `insert into public.trucking_booking_stops
         (booking_id,sequence_no,area,address,pic_name,pic_phone)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (booking_id,sequence_no) do update
         set area=excluded.area,address=excluded.address,pic_name=excluded.pic_name,
             pic_phone=excluded.pic_phone,updated_at=now()`,
      [
        booking.id,
        index + 1,
        text(stop.area),
        String(stop.address).trim(),
        text(stop.pic),
        text(stop.phone),
      ],
    );
  }
}

export async function initializeTruckingLifecycle(client, booking, actor) {
  await syncTruckingStops(client, booking);
  const exists = (await client.query(
    `select id from public.trucking_status_events where booking_id=$1 limit 1`,
    [booking.id],
  )).rows[0];
  if (!exists) await appendEvent(client, booking.id, "pending_review", actor, "Booking dibuat dan menunggu review CST.");
}


export async function initializeTruckingLifecycleByBookingNumber(bookingNumber, actor) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    await initializeTruckingLifecycle(client, booking, actor);
    await client.query("commit");
    return { ok: true };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function customerTruckingOrder({ bookingNumber, user, companyIds }) {
  const booking = await bookingByNumber(bookingNumber);
  if (!booking) fail(404, "Booking trucking tidak ditemukan.");
  assertOwner(booking, user, companyIds);
  return serializeBooking(booking);
}

export async function customerApproveTrucking({ bookingNumber, user, companyIds, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    assertOwner(booking, user, companyIds);
    if (booking.status !== "waiting_customer_approval" || booking.customer_approval_status !== "pending") {
      fail(409, "Booking ini tidak sedang menunggu persetujuan customer.");
    }
    const approved = body?.approved !== false;
    if (!approved) {
      await client.query(
        `update public.trucking_booking_requests
          set customer_approval_status='rejected',status='pending_review',
              customer_approval_notes=$2,updated_at=now()
          where id=$1`,
        [booking.id, text(body?.notes)],
      );
      await appendEvent(client, booking.id, "customer_rejected_quote",
        { type: "customer", id: user.id, name: user.name }, text(body?.notes));
      await client.query("commit");
      return { ok: true, status: "pending_review" };
    }

    const total = money(booking.final_price);
    if (!(total > 0)) fail(409, "Harga final belum ditetapkan admin.");
    const totals = await truckingPaymentTotals(booking, client);
    await client.query(
      `update public.trucking_booking_requests
        set customer_approval_status='approved',customer_approved_at=now(),
            customer_approval_notes=$2,status='waiting_payment',
            payment_status=case when $3 > 0 then 'partially_paid' else 'unpaid' end,
            paid_amount=$3,remaining_amount=$4,updated_at=now()
        where id=$1`,
      [booking.id, text(body?.notes), totals.receivedAmount, totals.remainingAmount],
    );
    await appendEvent(client, booking.id, "waiting_payment",
      { type: "customer", id: user.id, name: user.name }, "Customer menyetujui harga final.");
    await client.query("commit");
    return { ok: true, status: "waiting_payment" };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function customerManualTruckingPayment({ bookingNumber, user, companyIds, form }) {
  const booking = await bookingByNumber(bookingNumber);
  if (!booking) fail(404, "Booking trucking tidak ditemukan.");
  assertOwner(booking, user, companyIds);
  if (!["waiting_payment", "balance_due", "confirmed", "vehicle_assigned", "driver_to_pickup", "picked_up", "in_transit", "delivered"].includes(booking.status)) {
    fail(409, "Pembayaran belum dapat dilakukan pada status booking ini.");
  }
  const amount = money(form?.get?.("amount") ?? form?.amount);
  if (!(amount > 0)) fail(400, "Nominal pembayaran wajib diisi.");
  const totals = await truckingPaymentTotals(booking);
  if (amount > totals.remainingAmount + 0.005) fail(409, "Nominal melebihi sisa tagihan.");
  const pending = (await query(
    `select id from public.trucking_payments
      where booking_id=$1 and status='submitted' limit 1`,
    [booking.id],
  )).rows[0];
  if (pending) fail(409, "Masih ada bukti pembayaran yang menunggu verifikasi.");

  const file = form?.get?.("file");
  if (!file) fail(400, "Bukti pembayaran wajib diunggah.");
  const uploaded = await uploadTruckingPaymentProof({ bookingId: booking.id, file });
  const inserted = (await query(
    `insert into public.trucking_payments
       (booking_id,payment_kind,amount,status,proof_path,reference,notes,submitted_by)
     values ($1,'manual_transfer',$2,'submitted',$3,$4,$5,$6)
     returning id`,
    [booking.id, amount, uploaded.path, text(form?.get?.("reference")), text(form?.get?.("notes")), user.id],
  )).rows[0];
  await query(
    `update public.trucking_booking_requests
      set payment_status='proof_submitted',updated_at=now() where id=$1`,
    [booking.id],
  );
  return { ok: true, paymentId: Number(inserted.id), status: "proof_submitted" };
}

export async function customerCreateTruckingPaylabs({ bookingNumber, user, companyIds, request, body }) {
  const booking = await bookingByNumber(bookingNumber);
  if (!booking) fail(404, "Booking trucking tidak ditemukan.");
  assertOwner(booking, user, companyIds);
  if (!["waiting_payment", "balance_due", "confirmed", "vehicle_assigned", "driver_to_pickup", "picked_up", "in_transit", "delivered"].includes(booking.status)) {
    fail(409, "Pembayaran Paylabs belum dapat dilakukan pada status ini.");
  }
  return createTruckingPaylabsLink({
    booking,
    request,
    requestedMethod: body?.paymentMethod,
    requestedAmount: body?.amount,
    customerName: user.name,
    customerPhone: user.phone,
  });
}

export async function adminListTrucking({ status = null, limit = 100 }) {
  const values = [];
  let where = "";
  if (status) {
    values.push(status);
    where = `where b.status=$${values.length}`;
  }
  values.push(Math.max(1, Math.min(300, Number(limit) || 100)));
  const result = await query(
    `select b.id,b.booking_number,b.status,b.vehicle_name,b.area_pickup,b.alamat_pickup,
            b.area_delivery,b.alamat_delivery,b.estimasi_total,b.final_price,b.payment_status,
            b.customer_approval_status,b.driver_name,b.vehicle_plate,b.created_at,b.updated_at,
            c.name as customer_name,c.email as customer_email,c.phone as customer_phone
       from public.trucking_booking_requests b
       left join public.portal_customers c on c.id=b.portal_customer_id
       ${where}
      order by b.created_at desc
      limit $${values.length}`,
    values,
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    bookingNumber: row.booking_number,
    status: row.status,
    vehicleName: row.vehicle_name,
    pickup: row.alamat_pickup,
    delivery: row.alamat_delivery,
    estimate: money(row.estimasi_total),
    finalPrice: row.final_price == null ? null : money(row.final_price),
    paymentStatus: row.payment_status,
    customerApprovalStatus: row.customer_approval_status,
    driverName: row.driver_name,
    vehiclePlate: row.vehicle_plate,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function adminTruckingDetail({ bookingNumber }) {
  const booking = await bookingByNumber(bookingNumber);
  if (!booking) fail(404, "Booking trucking tidak ditemukan.");
  return serializeBooking(booking, { includePrivate: true });
}

export async function adminReviewTrucking({ bookingNumber, admin, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    if (BOOKING_TERMINAL.has(booking.status)) fail(409, "Booking sudah terminal.");

    const finalPrice = money(body?.finalPrice);
    if (!(finalPrice > 0)) fail(400, "Harga final wajib lebih dari 0.");
    const terms = normalizedPaymentTerms(body?.paymentTerms);
    const dueAt = body?.paymentDueAt ? new Date(body.paymentDueAt) : null;
    if (dueAt && Number.isNaN(dueAt.getTime())) fail(400, "Batas pembayaran tidak valid.");

    await client.query(
      `update public.trucking_booking_requests
        set final_price=$2,payment_terms=$3::jsonb,payment_due_at=$4,
            customer_approval_status='pending',status='waiting_customer_approval',
            admin_notes=$5,remaining_amount=$2,updated_at=now()
        where id=$1`,
      [booking.id, finalPrice, JSON.stringify(terms), dueAt, text(body?.adminNotes)],
    );
    await appendEvent(client, booking.id, "waiting_customer_approval",
      { type: "admin", id: admin.id, name: admin.name },
      "Harga final ditetapkan dan menunggu persetujuan customer.",
      { finalPrice, paymentTerms: terms });
    await client.query("commit");
    return { ok: true, status: "waiting_customer_approval" };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

async function refreshPaymentState(client, booking, actor) {
  const totals = await truckingPaymentTotals(booking, client);
  const initialRequired = totals.initialRequiredAmount;
  let paymentStatus = totals.receivedAmount <= 0
    ? "unpaid"
    : totals.remainingAmount <= 0.005
      ? "paid"
      : "partially_paid";
  let nextStatus = booking.status;
  if (booking.status === "waiting_payment" && totals.receivedAmount + 0.005 >= initialRequired) {
    nextStatus = "confirmed";
  }
  if (["delivered", "balance_due", "completed"].includes(booking.status) && totals.remainingAmount > 0.005) {
    nextStatus = "balance_due";
  }
  if (
    (booking.delivered_at || ["delivered", "balance_due", "completed"].includes(booking.status))
    && totals.remainingAmount <= 0.005
  ) {
    nextStatus = "completed";
  }
  await client.query(
    `update public.trucking_booking_requests
      set paid_amount=$2,remaining_amount=$3,payment_status=$4,status=$5,
          confirmed_at=case when $5='confirmed' then coalesce(confirmed_at,now()) else confirmed_at end,
          completed_at=case when $5='completed' then coalesce(completed_at,now()) else completed_at end,
          updated_at=now()
      where id=$1`,
    [booking.id, totals.receivedAmount, totals.remainingAmount, paymentStatus, nextStatus],
  );
  if (nextStatus !== booking.status) {
    await appendEvent(client, booking.id, nextStatus, actor,
      nextStatus === "confirmed"
        ? "Syarat pembayaran awal terpenuhi. Booking dikonfirmasi."
        : nextStatus === "completed"
          ? "Seluruh tujuan dan pembayaran telah selesai."
          : "Status pembayaran diperbarui.");
  }
  return { ...totals, paymentStatus, nextStatus };
}

export async function adminReviewTruckingPayment({ bookingNumber, paymentId, admin, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    const payment = (await client.query(
      `select * from public.trucking_payments where id=$1 and booking_id=$2 for update`,
      [paymentId, booking.id],
    )).rows[0];
    if (!payment) fail(404, "Pembayaran tidak ditemukan.");
    if (payment.status !== "submitted") fail(409, "Pembayaran sudah direview.");
    const approved = body?.approved === true;
    await client.query(
      `update public.trucking_payments
        set status=$2,reviewed_by=$3,reviewed_at=now(),paid_at=case when $2='approved' then now() else paid_at end,
            rejection_reason=$4,updated_at=now()
        where id=$1`,
      [payment.id, approved ? "approved" : "rejected", admin.id, approved ? null : text(body?.reason, "Bukti pembayaran ditolak.")],
    );
    await appendEvent(client, booking.id, approved ? "payment_approved" : "payment_rejected",
      { type: "admin", id: admin.id, name: admin.name },
      approved ? `Pembayaran Rp${money(payment.amount).toLocaleString("id-ID")} disetujui.` : text(body?.reason));
    const refreshed = await refreshPaymentState(client, booking, { type: "system", name: "Payment Engine" });
    await client.query("commit");
    return { ok: true, ...refreshed };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function adminAssignTrucking({ bookingNumber, admin, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    if (!["confirmed", "vehicle_assigned"].includes(booking.status)) {
      fail(409, "Armada hanya dapat ditugaskan setelah booking dikonfirmasi.");
    }
    const driverName = text(body?.driverName);
    const driverPhone = text(body?.driverPhone);
    const vehiclePlate = text(body?.vehiclePlate);
    if (!driverName || !driverPhone || !vehiclePlate) fail(400, "Driver, nomor HP, dan nomor polisi wajib diisi.");
    const token = booking.driver_token || crypto.randomBytes(18).toString("base64url");
    await client.query(
      `update public.trucking_booking_requests
        set driver_name=$2,driver_phone=$3,vehicle_plate=$4,driver_token=$5,
            status='vehicle_assigned',assigned_at=coalesce(assigned_at,now()),updated_at=now()
        where id=$1`,
      [booking.id, driverName, driverPhone, vehiclePlate, token],
    );
    await appendEvent(client, booking.id, "vehicle_assigned",
      { type: "admin", id: admin.id, name: admin.name },
      `Armada ${vehiclePlate} ditugaskan kepada ${driverName}.`);
    await client.query("commit");
    return { ok: true, status: "vehicle_assigned", driverToken: token };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function adminActualCosts({ bookingNumber, admin, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = await bookingByNumber(bookingNumber, { forUpdate: true, client });
    if (!booking) fail(404, "Booking trucking tidak ditemukan.");
    const toll = money(body?.toll);
    const parking = money(body?.parking);
    const extra = money(body?.extra);
    const updated = (await client.query(
      `update public.trucking_booking_requests
        set actual_toll=$2,actual_parking=$3,actual_extra_cost=$4,actual_extra_cost_notes=$5,updated_at=now()
        where id=$1 returning *`,
      [booking.id, toll, parking, extra, text(body?.notes)],
    )).rows[0];
    await appendEvent(
      client,
      booking.id,
      "actual_costs_updated",
      { type: "admin", id: admin.id, name: admin.name },
      "Biaya aktual perjalanan diperbarui.",
      { toll, parking, extra },
    );
    const refreshed = await refreshPaymentState(client, updated, { type: "system", name: "Payment Engine" });
    if (refreshed.nextStatus === "balance_due") {
      await client.query(
        `update public.trucking_booking_requests set completed_at=null where id=$1`,
        [booking.id],
      );
    }
    await client.query("commit");
    return { ok: true, ...refreshed };
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function driverTruckingDetail({ token }) {
  const result = await query(
    `select * from public.trucking_booking_requests where driver_token=$1 limit 1`,
    [token],
  );
  const booking = result.rows[0];
  if (!booking) fail(404, "Link driver tidak valid.");
  const data = await serializeBooking(booking, { includePrivate: true });
  return {
    bookingNumber: data.bookingNumber,
    status: data.status,
    vehicleName: data.vehicleName,
    serviceMode: data.serviceMode,
    pickup: data.pickup,
    assignment: data.assignment,
    stops: data.stops,
    allowedActions: driverAllowedActions(booking.status, data.stops),
  };
}

function driverAllowedActions(status, stops) {
  if (status === "vehicle_assigned") return ["driver_to_pickup"];
  if (status === "driver_to_pickup") return ["picked_up"];
  if (status === "picked_up") return ["in_transit"];
  if (status === "in_transit") {
    const next = stops.find((stop) => stop.status !== "delivered");
    return next ? [`deliver_stop:${next.id}`] : ["delivered"];
  }
  return [];
}

export async function driverUploadTruckingPod({ token, stopId, form }) {
  const booking = (await query(
    `select * from public.trucking_booking_requests where driver_token=$1 limit 1`,
    [token],
  )).rows[0];
  if (!booking) fail(404, "Link driver tidak valid.");
  const stop = (await query(
    `select * from public.trucking_booking_stops where id=$1 and booking_id=$2 limit 1`,
    [stopId, booking.id],
  )).rows[0];
  if (!stop) fail(404, "Tujuan tidak ditemukan.");
  const file = form?.get?.("file");
  if (!file) fail(400, "Foto POD wajib diunggah.");
  const uploaded = await uploadTruckingPod({ bookingId: booking.id, stopId: stop.id, file });
  await query(
    `update public.trucking_booking_stops
      set pod_path=$2,pod_notes=$3,receiver_name=$4,updated_at=now()
      where id=$1`,
    [stop.id, uploaded.path, text(form?.get?.("notes")), text(form?.get?.("receiverName"))],
  );
  return { ok: true };
}

export async function driverUpdateTrucking({ token, body }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const booking = (await client.query(
      `select * from public.trucking_booking_requests where driver_token=$1 limit 1 for update`,
      [token],
    )).rows[0];
    if (!booking) fail(404, "Link driver tidak valid.");
    const action = text(body?.action);
    if (!action) fail(400, "Action wajib diisi.");

    const transitions = {
      driver_to_pickup: ["vehicle_assigned", "driver_to_pickup"],
      picked_up: ["driver_to_pickup", "picked_up"],
      in_transit: ["picked_up", "in_transit"],
    };
    if (transitions[action]) {
      if (booking.status === transitions[action][1]) {
        await client.query("commit");
        return { ok: true, status: booking.status, idempotent: true };
      }
      if (booking.status !== transitions[action][0]) fail(409, "Urutan status driver tidak valid.");
      await client.query(
        `update public.trucking_booking_requests
          set status=$2,started_at=case when $2='picked_up' then coalesce(started_at,now()) else started_at end,
              updated_at=now() where id=$1`,
        [booking.id, action],
      );
      await appendEvent(client, booking.id, action, { type: "driver", name: booking.driver_name }, text(body?.notes));
      await client.query("commit");
      return { ok: true, status: action };
    }

    if (action === "deliver_stop") {
      if (booking.status !== "in_transit") fail(409, "Booking belum dalam perjalanan.");
      const stopId = Number(body?.stopId);
      const stop = (await client.query(
        `select * from public.trucking_booking_stops
          where id=$1 and booking_id=$2 for update`,
        [stopId, booking.id],
      )).rows[0];
      if (!stop) fail(404, "Tujuan tidak ditemukan.");
      const next = (await client.query(
        `select id from public.trucking_booking_stops
          where booking_id=$1 and status<>'delivered'
          order by sequence_no,id limit 1`,
        [booking.id],
      )).rows[0];
      if (!next || Number(next.id) !== Number(stop.id)) fail(409, "Tujuan harus diselesaikan sesuai urutan rute.");
      const serviceMode = booking.addons?.serviceMode ?? booking.addons?.service_mode ?? "cargo";
      if (serviceMode !== "passenger" && !stop.pod_path) {
        fail(409, "Upload POD sebelum menandai tujuan selesai.");
      }
      await client.query(
        `update public.trucking_booking_stops
          set status='delivered',delivered_at=now(),updated_at=now()
          where id=$1`,
        [stop.id],
      );
      await appendEvent(client, booking.id, "stop_delivered", { type: "driver", name: booking.driver_name },
        `Pengantaran ${stop.sequence_no} selesai.`, { stopId: Number(stop.id), sequenceNo: Number(stop.sequence_no) });

      const remaining = Number((await client.query(
        `select count(*)::int as count from public.trucking_booking_stops
          where booking_id=$1 and status<>'delivered'`,
        [booking.id],
      )).rows[0]?.count ?? 0);
      if (remaining === 0) {
        const totals = await truckingPaymentTotals(booking, client);
        const nextStatus = totals.remainingAmount <= 0.005 ? "completed" : "balance_due";
        await client.query(
          `update public.trucking_booking_requests
            set status=$2,delivered_at=coalesce(delivered_at,now()),
                completed_at=case when $2='completed' then now() else completed_at end,
                paid_amount=$3,remaining_amount=$4,
                payment_status=case when $4<=0.005 then 'paid' else 'partially_paid' end,
                updated_at=now()
            where id=$1`,
          [booking.id, nextStatus, totals.receivedAmount, totals.remainingAmount],
        );
        await appendEvent(client, booking.id, nextStatus, { type: "system", name: "Trucking Lifecycle" },
          nextStatus === "completed"
            ? "Seluruh tujuan dan pembayaran selesai."
            : "Seluruh tujuan selesai. Menunggu pelunasan.");
      }
      await client.query("commit");
      return { ok: true, status: remaining === 0 ? "delivered" : "in_transit" };
    }

    fail(400, "Action driver tidak didukung.");
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}
