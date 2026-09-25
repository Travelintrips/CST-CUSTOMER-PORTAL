import crypto from "node:crypto";
import { pool, query } from "./db.mjs";
import {
  buildPaylabsSignaturePayload,
  formatPaylabsTimestamp,
  isPaylabsTimestampFresh,
  isTrustedPaylabsPaymentUrl,
  normalizePaylabsPem,
  resolvePaylabsWebhookStatus,
} from "./paylabs-contract.mjs";

const SAVED_MARKER = "__SAVED__";
const SIT_API_URL = "https://sit-pay.paylabs.co.id/payment/v2.1/h5/createLink";
const PROD_API_URL = "https://pay.paylabs.co.id/payment/v2.1/h5/createLink";
const PAYMENT_TTL_MS = 24 * 60 * 60 * 1000;

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function text(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function forwardedValue(request, name) {
  const value = request?.headers?.[name];
  return Array.isArray(value) ? value[0] : value?.split(",")[0]?.trim();
}

function requestOrigin(request) {
  const configured = text(
    process.env.PAYLABS_CALLBACK_BASE_URL
      ?? process.env.PORTAL_PUBLIC_ORIGIN
      ?? process.env.PORTAL_PUBLIC_URL,
  );
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
        return url.origin;
      }
    } catch {
      // Invalid configured URL falls through to the production-safe default.
    }
  }
  if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
    return "https://cstlogistic.co.id";
  }
  const protocol = forwardedValue(request, "x-forwarded-proto") ?? "http";
  const host = forwardedValue(request, "x-forwarded-host")
    ?? request?.headers?.host
    ?? "localhost";
  return `${protocol}://${host}`;
}

function rsaSign(payload, privateKey) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(payload);
  signer.end();
  return signer.sign(privateKey, "base64");
}

function rsaVerify(payload, signature, publicKey) {
  if (!signature || !publicKey) return false;
  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(payload);
    verifier.end();
    return verifier.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
}

async function loadConfiguration(client = query) {
  const result = await client(
    `select *
       from public.paylabs_configurations
      order by updated_at desc nulls last, id desc
      limit 1`,
  );
  return result.rows[0] ?? null;
}

function envCredentialSet(sandbox) {
  if (sandbox) {
    return {
      merchantId: text(process.env.PAYLABS_MERCHANT_ID_SANDBOX),
      publicKey: normalizePaylabsPem(process.env.PAYLABS_PUBLIC_KEY_SANDBOX ?? ""),
      privateKey: normalizePaylabsPem(process.env.PAYLABS_PRIVATE_KEY_SANDBOX ?? ""),
    };
  }
  return {
    merchantId: text(process.env.PAYLABS_MERCHANT_ID),
    publicKey: normalizePaylabsPem(process.env.PAYLABS_PUBLIC_KEY ?? ""),
    privateKey: normalizePaylabsPem(process.env.PAYLABS_PRIVATE_KEY ?? ""),
  };
}

function configuredKey(raw) {
  const value = text(raw);
  return value ? normalizePaylabsPem(value) : "";
}

async function activeCredentials(client = query) {
  const cfg = await loadConfiguration(client);
  const explicitSandbox = text(process.env.PAYLABS_SANDBOX_MODE);
  const productionRuntime = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";
  const sandboxMode = cfg?.sandbox_mode == null
    ? explicitSandbox == null
      ? !productionRuntime
      : explicitSandbox.toLowerCase() === "true"
    : Boolean(cfg.sandbox_mode);
  const fallback = envCredentialSet(sandboxMode);

  const merchantId = sandboxMode
    ? text(cfg?.sandbox_merchant_id) ?? fallback.merchantId
    : text(cfg?.prod_merchant_id) ?? fallback.merchantId;
  const privateKey = sandboxMode
    ? configuredKey(cfg?.sandbox_private_key) || fallback.privateKey
    : configuredKey(cfg?.prod_private_key) || fallback.privateKey;
  const publicKey = sandboxMode
    ? configuredKey(cfg?.sandbox_public_key) || fallback.publicKey
    : configuredKey(cfg?.prod_public_key) || fallback.publicKey;

  return {
    sandboxMode,
    merchantId,
    privateKey,
    publicKey,
    storeId: text(cfg?.store_id),
    apiUrl: sandboxMode ? SIT_API_URL : PROD_API_URL,
    configured: Boolean(merchantId && privateKey && publicKey),
  };
}

async function allVerificationCredentials(client = query) {
  const cfg = await loadConfiguration(client);
  const sets = [];
  for (const sandboxMode of [true, false]) {
    const fallback = envCredentialSet(sandboxMode);
    const merchantId = sandboxMode
      ? text(cfg?.sandbox_merchant_id) ?? fallback.merchantId
      : text(cfg?.prod_merchant_id) ?? fallback.merchantId;
    const publicKey = sandboxMode
      ? configuredKey(cfg?.sandbox_public_key) || fallback.publicKey
      : configuredKey(cfg?.prod_public_key) || fallback.publicKey;
    if (merchantId && publicKey) sets.push({ merchantId, publicKey, sandboxMode });
  }
  return sets;
}

async function activeMethods(client = query) {
  const result = await client(
    `select code, label, description, icon_url, icon_enabled, sort_order
       from public.paylabs_payment_methods
      where is_active=true
      order by sort_order, code`,
  );
  const methods = result.rows.map((row) => ({
    code: row.code,
    label: row.label,
    description: row.description ?? "",
    iconUrl: row.icon_url ?? "",
    iconEnabled: Boolean(row.icon_enabled),
    sortOrder: Number(row.sort_order ?? 0),
  }));
  if (methods.length > 0) return methods;
  return [{
    code: "PAYLABS_GATEWAY",
    label: "Paylabs Payment Gateway",
    description: "Paylabs hosted payment gateway",
    iconUrl: "",
    iconEnabled: false,
    sortOrder: 1,
  }];
}

function serializePayment(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    status: row.status,
    amount: Number(row.amount),
    paymentMethod: row.payment_method ?? null,
    providerOrderId: row.provider_order_id ?? null,
    merchantTradeNo: row.provider_merchant_trade_no ?? null,
    paymentUrl: isTrustedPaylabsPaymentUrl(row.payment_url) ? row.payment_url : null,
    expiredAt: row.expired_at ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function latestMarketplacePayment(poId, client = query) {
  const result = await client(
    `select *
       from public.mkt_gateway_payments
      where ref_kind='purchase'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
      order by created_at desc, id desc
      limit 1`,
    [poId],
  );
  return result.rows[0] ?? null;
}

async function marketplacePaymentTotals(po, client = query) {
  const run = typeof client === "function"
    ? client
    : (sql, values) => client.query(sql, values);
  const manual = (await run(
    `select coalesce(sum(ocr_amount),0) as paid_amount
       from public.mkt_po_payment_proofs
      where po_id=$1 and review_status='approved'`,
    [po.id],
  )).rows[0] ?? {};
  const gateway = (await run(
    `select coalesce(sum(amount),0) as paid_amount
       from public.mkt_gateway_payments
      where ref_kind='purchase'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
        and status='paid'::payment_status`,
    [po.id],
  )).rows[0] ?? {};
  const totalAmount = Number(po.grand_total ?? 0);
  const receivedAmount = Number(manual.paid_amount ?? 0) + Number(gateway.paid_amount ?? 0);
  return {
    totalAmount,
    receivedAmount,
    remainingAmount: Math.max(totalAmount - receivedAmount, 0),
    overpaidAmount: Math.max(receivedAmount - totalAmount, 0),
  };
}

export async function getMarketplacePaylabsState(po, client = query) {
  const [credentials, methods, latest] = await Promise.all([
    activeCredentials(client),
    activeMethods(client),
    latestMarketplacePayment(po.id, client),
  ]);

  const pending = latest?.status === "pending"
    && latest?.expired_at
    && new Date(latest.expired_at).getTime() > Date.now();

  return {
    configured: credentials.configured,
    sandboxMode: credentials.sandboxMode,
    activeMethods: methods,
    latestPayment: serializePayment(latest),
    hasPendingPayment: Boolean(pending),
    canCreate:
      credentials.configured
      && methods.length > 0
      && po.payment_status !== "paid"
      && po.payment_status !== "proof_submitted"
      && !pending,
  };
}

function shortTradeNo(poId) {
  const suffix = Date.now().toString().slice(-13);
  return `MKT${poId}${suffix}`.slice(0, 30);
}

function requestId() {
  return `${Date.now()}${crypto.randomInt(10000, 99999)}`.slice(0, 30);
}

function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export async function createMarketplacePaylabsLink({ po, request, requestedMethod, requestedAmount }) {
  const credentials = await activeCredentials();
  if (!credentials.configured) {
    fail(503, "Paylabs belum dikonfigurasi lengkap pada Admin > Paylabs Setting.");
  }
  if (po.payment_status === "paid") fail(409, "Pembayaran PO ini sudah Lunas.");
  if (po.payment_status === "proof_submitted") {
    fail(409, "Bukti transfer manual sedang menunggu verifikasi. Paylabs tidak dapat dimulai bersamaan.");
  }

  const methods = await activeMethods();
  const method = methods.find((item) => item.code === requestedMethod);
  if (!method) fail(400, "Metode Paylabs tidak aktif atau tidak valid.");

  const customerPhone = normalizePhone(po.buyer_phone);
  if (!customerPhone) {
    fail(409, "Nomor telepon customer belum tersedia. Lengkapi profil/RFQ sebelum membuat pembayaran Paylabs.");
  }

  const client = await pool.connect();
  let payment = null;
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1,$2)", [481516, Number(po.id)]);

    const lockedPo = (await client.query(
      `select * from public.mkt_purchase_orders where id=$1 for update`,
      [po.id],
    )).rows[0];
    const totals = await marketplacePaymentTotals(lockedPo, client);
    if (totals.remainingAmount <= 0.005) {
      await client.query("rollback");
      fail(409, "Pembayaran PO ini sudah Lunas.");
    }

    const pendingManual = (await client.query(
      `select id from public.mkt_po_payment_proofs
        where po_id=$1 and review_status='submitted'
        limit 1`,
      [po.id],
    )).rows[0];
    if (pendingManual) {
      await client.query("rollback");
      fail(409, "Bukti transfer manual sedang menunggu verifikasi. Paylabs tidak dapat dimulai bersamaan.");
    }

    const parsedRequested = requestedAmount == null || requestedAmount === ""
      ? totals.remainingAmount
      : Number(requestedAmount);
    if (!Number.isFinite(parsedRequested) || parsedRequested <= 0) {
      await client.query("rollback");
      fail(400, "Nominal pembayaran Paylabs tidak valid.");
    }
    if (parsedRequested > totals.remainingAmount + 0.005) {
      await client.query("rollback");
      fail(409, "Nominal pembayaran Paylabs melebihi sisa tagihan.");
    }
    const paymentAmount = Number(parsedRequested.toFixed(2));

    await client.query(
      `update public.mkt_gateway_payments
          set status='expired'::payment_status, updated_at=now()
        where ref_kind='purchase'::payment_ref_kind
          and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status
          and expired_at <= now()`,
      [po.id],
    );

    const existing = (await client.query(
      `select *
         from public.mkt_gateway_payments
        where ref_kind='purchase'::payment_ref_kind
          and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status
          and expired_at > now()
        order by created_at desc,id desc
        limit 1`,
      [po.id],
    )).rows[0];

    if (existing?.payment_url && isTrustedPaylabsPaymentUrl(existing.payment_url)) {
      await client.query("commit");
      return { reused: true, payment: serializePayment(existing), sandboxMode: credentials.sandboxMode };
    }

    if (existing) {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                raw=coalesce(raw,'{}'::jsonb) || '{"reason":"stale_pending_without_url"}'::jsonb,
                updated_at=now()
          where id=$1`,
        [existing.id],
      );
    }

    const merchantTradeNo = shortTradeNo(po.id);
    const inserted = (await client.query(
      `insert into public.mkt_gateway_payments
         (company_id,ref_kind,ref_id,ref_doc_number,amount,status,provider,
          payment_method,provider_merchant_trade_no,expired_at,raw)
       values ($1,'purchase'::payment_ref_kind,$2,$3,$4,'pending'::payment_status,
               'paylabs'::payment_provider,$5,$6,$7,$8::jsonb)
       returning *`,
      [
        po.company_id ?? 1,
        po.id,
        po.po_number,
        paymentAmount,
        method.code,
        merchantTradeNo,
        new Date(Date.now() + PAYMENT_TTL_MS),
        JSON.stringify({
          source: "marketplace",
          sandboxMode: credentials.sandboxMode,
          methodRequested: method.code,
          installmentAmount: paymentAmount,
          remainingBefore: totals.remainingAmount,
        }),
      ],
    )).rows[0];

    const reqId = requestId();
    const timestamp = formatPaylabsTimestamp();
    const baseUrl = requestOrigin(request);
    const notifyUrl = `${baseUrl}/api/payments/paylabs/webhook`;
    const redirectUrl = `${baseUrl}/marketplace/my-purchase-orders/${po.id}`;
    const body = {
      merchantId: credentials.merchantId,
      merchantTradeNo,
      requestId: reqId,
      amount: paymentAmount.toFixed(2),
      productName: `Pembayaran ${po.po_number}`,
      payer: text(po.buyer_name, "Customer"),
      phoneNumber: customerPhone,
      paymentType: method.code,
      notifyUrl,
      redirectUrl,
      ...(credentials.storeId ? { storeId: credentials.storeId } : {}),
    };
    const bodyJson = JSON.stringify(body);
    const endpoint = new URL(credentials.apiUrl).pathname;
    const signaturePayload = buildPaylabsSignaturePayload("POST", endpoint, bodyJson, timestamp);

    let signature;
    try {
      signature = rsaSign(signaturePayload, credentials.privateKey);
    } catch {
      await client.query(
        `update public.mkt_gateway_payments set status='failed'::payment_status,
          raw=raw || '{"reason":"signing_failed"}'::jsonb, updated_at=now() where id=$1`,
        [inserted.id],
      );
      await client.query("commit");
      fail(500, "Konfigurasi private key Paylabs tidak valid.");
    }

    let response;
    let payload;
    try {
      response = await fetch(credentials.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TIMESTAMP": timestamp,
          "X-SIGNATURE": signature,
          "X-PARTNER-ID": credentials.merchantId,
          "X-REQUEST-ID": reqId,
        },
        body: bodyJson,
        signal: AbortSignal.timeout(15_000),
      });
      payload = await response.json().catch(() => ({}));
    } catch (error) {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                raw=raw || $2::jsonb,
                updated_at=now()
          where id=$1`,
        [inserted.id, JSON.stringify({ reason: "provider_request_failed", message: String(error?.message ?? error).slice(0, 300) })],
      );
      await client.query("commit");
      fail(502, "Paylabs tidak dapat dihubungi. Silakan coba lagi.");
    }

    const paymentUrl = payload?.url ?? payload?.h5Url ?? payload?.paymentUrl ?? null;
    if (!response.ok || String(payload?.errCode ?? "0") !== "0" || !isTrustedPaylabsPaymentUrl(paymentUrl)) {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                provider_order_id=$2,
                raw=raw || $3::jsonb,
                updated_at=now()
          where id=$1`,
        [
          inserted.id,
          text(payload?.platformTradeNo),
          JSON.stringify({
            reason: "provider_rejected",
            httpStatus: response.status,
            errCode: payload?.errCode ?? null,
            errMsg: payload?.errMsg ?? null,
          }),
        ],
      );
      await client.query("commit");
      fail(502, text(payload?.errMsg, "Paylabs gagal membuat tautan pembayaran."));
    }

    payment = (await client.query(
      `update public.mkt_gateway_payments
          set provider_order_id=$1,
              payment_url=$2,
              raw=raw || $3::jsonb,
              updated_at=now()
        where id=$4
        returning *`,
      [
        text(payload?.platformTradeNo),
        paymentUrl,
        JSON.stringify({
          requestId: reqId,
          errCode: payload?.errCode ?? null,
          providerOrderId: payload?.platformTradeNo ?? null,
        }),
        inserted.id,
      ],
    )).rows[0];

    await client.query(
      `insert into public.activity_logs
         (actor_type,actor_id,actor_name,action,new_value,description,mkt_purchase_order_id,deduplication_key)
       values ('customer',$1,$2,'po_paylabs_link_created',$3::jsonb,$4,$5,$6)
       on conflict (deduplication_key) where deduplication_key is not null do nothing`,
      [
        po.portal_customer_id == null ? null : String(po.portal_customer_id),
        text(po.buyer_name, "Customer"),
        JSON.stringify({
          paymentId: Number(payment.id),
          paymentMethod: method.code,
          paymentAmount,
          remainingBefore: totals.remainingAmount,
          sandboxMode: credentials.sandboxMode,
        }),
        `Customer membuat tautan pembayaran Paylabs sebesar ${paymentAmount.toLocaleString("id-ID")}.`,
        po.id,
        `po-paylabs-link:${payment.id}`,
      ],
    );

    await client.query("commit");
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }

  return { reused: false, payment: serializePayment(payment), sandboxMode: credentials.sandboxMode };
}


async function latestTruckingPayment(bookingId, client = query) {
  const result = await client(
    `select *
       from public.mkt_gateway_payments
      where ref_kind='trucking'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
      order by created_at desc,id desc
      limit 1`,
    [bookingId],
  );
  return result.rows[0] ?? null;
}

async function truckingPaymentTotals(booking, client = query) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  const manual = (await run(
    `select coalesce(sum(amount),0) as paid_amount
       from public.trucking_payments
      where booking_id=$1 and status='approved'`,
    [booking.id],
  )).rows[0] ?? {};
  const gateway = (await run(
    `select coalesce(sum(amount),0) as paid_amount
       from public.mkt_gateway_payments
      where ref_kind='trucking'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
        and status='paid'::payment_status`,
    [booking.id],
  )).rows[0] ?? {};
  const quotedAmount = Number(booking.final_price ?? booking.estimasi_total ?? 0);
  const actualCosts = Number(booking.actual_toll ?? 0)
    + Number(booking.actual_parking ?? 0)
    + Number(booking.actual_extra_cost ?? 0);
  const totalAmount = quotedAmount + actualCosts;
  const receivedAmount = Number(manual.paid_amount ?? 0) + Number(gateway.paid_amount ?? 0);
  return {
    totalAmount,
    receivedAmount,
    remainingAmount: Math.max(totalAmount - receivedAmount, 0),
  };
}

export async function getTruckingPaylabsState(booking, client = query) {
  const [credentials, methods, latest] = await Promise.all([
    activeCredentials(client),
    activeMethods(client),
    latestTruckingPayment(booking.id, client),
  ]);
  const pending = latest?.status === "pending"
    && latest?.expired_at
    && new Date(latest.expired_at).getTime() > Date.now();
  return {
    configured: credentials.configured,
    sandboxMode: credentials.sandboxMode,
    activeMethods: methods,
    latestPayment: serializePayment(latest),
    hasPendingPayment: Boolean(pending),
    canCreate: credentials.configured
      && methods.length > 0
      && booking.payment_status !== "paid"
      && booking.payment_status !== "proof_submitted"
      && !pending,
  };
}

function shortTruckingTradeNo(bookingId) {
  return `TRK${bookingId}${Date.now().toString().slice(-13)}`.slice(0, 30);
}

export async function createTruckingPaylabsLink({
  booking,
  request,
  requestedMethod,
  requestedAmount,
  customerName,
  customerPhone,
}) {
  const credentials = await activeCredentials();
  if (!credentials.configured) fail(503, "Paylabs belum dikonfigurasi lengkap pada Admin > Paylabs Setting.");
  if (booking.payment_status === "paid") fail(409, "Booking ini sudah lunas.");
  if (booking.payment_status === "proof_submitted") {
    fail(409, "Bukti transfer manual sedang menunggu verifikasi.");
  }

  const methods = await activeMethods();
  const method = methods.find((item) => item.code === requestedMethod);
  if (!method) fail(400, "Metode Paylabs tidak aktif atau tidak valid.");
  const normalizedCustomerPhone = normalizePhone(customerPhone);
  if (!normalizedCustomerPhone) fail(409, "Nomor telepon customer belum tersedia.");

  const client = await pool.connect();
  let payment = null;
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1,$2)", [481517, Number(booking.id)]);
    const lockedBooking = (await client.query(
      `select * from public.trucking_booking_requests where id=$1 for update`,
      [booking.id],
    )).rows[0];
    if (!lockedBooking) fail(404, "Booking trucking tidak ditemukan.");
    const totals = await truckingPaymentTotals(lockedBooking, client);
    if (totals.remainingAmount <= 0.005) fail(409, "Booking ini sudah lunas.");

    const pendingManual = (await client.query(
      `select id from public.trucking_payments
        where booking_id=$1 and status='submitted' limit 1`,
      [booking.id],
    )).rows[0];
    if (pendingManual) fail(409, "Bukti transfer manual sedang menunggu verifikasi.");

    const parsedRequested = requestedAmount == null || requestedAmount === ""
      ? totals.remainingAmount
      : Number(requestedAmount);
    if (!Number.isFinite(parsedRequested) || parsedRequested <= 0) fail(400, "Nominal pembayaran Paylabs tidak valid.");
    if (parsedRequested > totals.remainingAmount + 0.005) fail(409, "Nominal pembayaran melebihi sisa tagihan.");
    const paymentAmount = Number(parsedRequested.toFixed(2));

    await client.query(
      `update public.mkt_gateway_payments
          set status='expired'::payment_status,updated_at=now()
        where ref_kind='trucking'::payment_ref_kind and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status and expired_at<=now()`,
      [booking.id],
    );
    const existing = (await client.query(
      `select * from public.mkt_gateway_payments
        where ref_kind='trucking'::payment_ref_kind and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status and expired_at>now()
        order by created_at desc,id desc limit 1`,
      [booking.id],
    )).rows[0];
    if (existing?.payment_url && isTrustedPaylabsPaymentUrl(existing.payment_url)) {
      await client.query("commit");
      return { reused: true, payment: serializePayment(existing), sandboxMode: credentials.sandboxMode };
    }

    const providerCompanyId = Number(process.env.TRUCKING_PROVIDER_COMPANY_ID ?? 1);
    const merchantTradeNo = shortTruckingTradeNo(booking.id);
    const inserted = (await client.query(
      `insert into public.mkt_gateway_payments
         (company_id,ref_kind,ref_id,ref_doc_number,amount,status,provider,payment_method,
          provider_merchant_trade_no,expired_at,raw)
       values ($1,'trucking'::payment_ref_kind,$2,$3,$4,'pending'::payment_status,
               'paylabs'::payment_provider,$5,$6,$7,$8::jsonb)
       returning *`,
      [
        providerCompanyId,
        booking.id,
        booking.booking_number,
        paymentAmount,
        method.code,
        merchantTradeNo,
        new Date(Date.now() + PAYMENT_TTL_MS),
        JSON.stringify({ source: "trucking", sandboxMode: credentials.sandboxMode, installmentAmount: paymentAmount }),
      ],
    )).rows[0];

    const reqId = requestId();
    const timestamp = formatPaylabsTimestamp();
    const baseUrl = requestOrigin(request);
    const notifyUrl = `${baseUrl}/api/payments/paylabs/webhook`;
    const redirectUrl = `${baseUrl}/trucking/orders/${encodeURIComponent(booking.booking_number)}`;
    const providerBody = {
      merchantId: credentials.merchantId,
      merchantTradeNo,
      requestId: reqId,
      amount: paymentAmount.toFixed(2),
      productName: `Pembayaran ${booking.booking_number}`,
      payer: text(customerName, "Customer"),
      phoneNumber: normalizedCustomerPhone,
      paymentType: method.code,
      notifyUrl,
      redirectUrl,
      ...(credentials.storeId ? { storeId: credentials.storeId } : {}),
    };
    const bodyJson = JSON.stringify(providerBody);
    const endpoint = new URL(credentials.apiUrl).pathname;
    const signaturePayload = buildPaylabsSignaturePayload("POST", endpoint, bodyJson, timestamp);
    let signature;
    try {
      signature = rsaSign(signaturePayload, credentials.privateKey);
    } catch {
      await client.query(
        `update public.mkt_gateway_payments set status='failed'::payment_status,
          raw=raw || '{"reason":"signing_failed"}'::jsonb,updated_at=now() where id=$1`,
        [inserted.id],
      );
      await client.query("commit");
      fail(500, "Konfigurasi private key Paylabs tidak valid.");
    }

    let response;
    let payload;
    try {
      response = await fetch(credentials.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TIMESTAMP": timestamp,
          "X-SIGNATURE": signature,
          "X-PARTNER-ID": credentials.merchantId,
          "X-REQUEST-ID": reqId,
        },
        body: bodyJson,
        signal: AbortSignal.timeout(15_000),
      });
      payload = await response.json().catch(() => ({}));
    } catch (error) {
      await client.query(
        `update public.mkt_gateway_payments
          set status='failed'::payment_status,raw=raw || $2::jsonb,updated_at=now() where id=$1`,
        [inserted.id, JSON.stringify({ reason: "provider_request_failed", message: String(error?.message ?? error).slice(0, 300) })],
      );
      await client.query("commit");
      fail(502, "Paylabs tidak dapat dihubungi. Silakan coba lagi.");
    }

    const paymentUrl = payload?.url ?? payload?.h5Url ?? payload?.paymentUrl ?? null;
    if (!response.ok || String(payload?.errCode ?? "0") !== "0" || !isTrustedPaylabsPaymentUrl(paymentUrl)) {
      await client.query(
        `update public.mkt_gateway_payments
          set status='failed'::payment_status,provider_order_id=$2,raw=raw || $3::jsonb,updated_at=now() where id=$1`,
        [inserted.id, text(payload?.platformTradeNo), JSON.stringify({ reason: "provider_rejected", errCode: payload?.errCode ?? null, errMsg: payload?.errMsg ?? null })],
      );
      await client.query("commit");
      fail(502, text(payload?.errMsg, "Paylabs gagal membuat tautan pembayaran."));
    }

    payment = (await client.query(
      `update public.mkt_gateway_payments
        set provider_order_id=$1,payment_url=$2,raw=raw || $3::jsonb,updated_at=now()
        where id=$4 returning *`,
      [text(payload?.platformTradeNo), paymentUrl, JSON.stringify({ requestId: reqId, providerOrderId: payload?.platformTradeNo ?? null }), inserted.id],
    )).rows[0];
    await client.query("commit");
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
  return { reused: false, payment: serializePayment(payment), sandboxMode: credentials.sandboxMode };
}



async function latestLogisticPayment(orderId, client = query) {
  const run = typeof client === "function" ? client : (sql, values) => client.query(sql, values);
  return (await run(
    `select *
       from public.mkt_gateway_payments
      where ref_kind='logistic'::payment_ref_kind
        and ref_id=$1
        and provider='paylabs'::payment_provider
      order by created_at desc,id desc
      limit 1`,
    [orderId],
  )).rows[0] ?? null;
}

export async function getLogisticPaylabsState(order, client = query) {
  const [credentials, methods, latest] = await Promise.all([
    activeCredentials(client),
    activeMethods(client),
    latestLogisticPayment(order.id, client),
  ]);
  const pending = latest?.status === "pending"
    && latest?.expired_at
    && new Date(latest.expired_at).getTime() > Date.now();
  return {
    configured: credentials.configured,
    sandboxMode: credentials.sandboxMode,
    activeMethods: methods,
    latestPayment: serializePayment(latest),
    hasPendingPayment: Boolean(pending),
    canCreate:
      credentials.configured
      && methods.length > 0
      && order.customer_quote_status === "approved"
      && order.payment_status !== "paid"
      && order.payment_status !== "proof_submitted"
      && !pending,
  };
}

function shortLogisticTradeNo(orderId) {
  return `LOG${orderId}${Date.now().toString().slice(-13)}`.slice(0, 30);
}

export async function createLogisticPaylabsLink({
  order,
  request,
  requestedMethod,
  customerName,
  customerPhone,
}) {
  const credentials = await activeCredentials();
  if (!credentials.configured) fail(503, "Paylabs belum dikonfigurasi lengkap pada Admin > Paylabs Setting.");
  if (order.customer_quote_status !== "approved") {
    fail(409, "Quotation harus disetujui customer sebelum pembayaran Paylabs.");
  }
  if (order.payment_status === "paid") fail(409, "Order ini sudah lunas.");
  if (order.payment_status === "proof_submitted") {
    fail(409, "Bukti transfer manual sedang menunggu verifikasi.");
  }

  const totalAmount = Number(order.final_selling_price ?? order.final_price ?? order.grand_total ?? 0);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    fail(409, "Harga final order belum tersedia.");
  }

  const methods = await activeMethods();
  const method = requestedMethod
    ? methods.find((item) => item.code === requestedMethod)
    : methods[0];
  if (!method) fail(400, "Metode Paylabs tidak aktif atau tidak tersedia.");

  const normalizedCustomerPhone = normalizePhone(customerPhone);
  if (!normalizedCustomerPhone) fail(409, "Nomor telepon customer belum tersedia.");

  const client = await pool.connect();
  let payment = null;
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1,$2)", [481519, Number(order.id)]);

    const lockedOrder = (await client.query(
      `select * from public.logistic_orders where id=$1 for update`,
      [order.id],
    )).rows[0];
    if (!lockedOrder) fail(404, "Order logistik tidak ditemukan.");
    if (lockedOrder.customer_quote_status !== "approved") {
      fail(409, "Quotation belum disetujui customer.");
    }
    if (lockedOrder.payment_status === "paid") fail(409, "Order ini sudah lunas.");
    if (lockedOrder.payment_status === "proof_submitted") {
      fail(409, "Bukti transfer manual sedang menunggu verifikasi.");
    }

    const finalAmount = Number(
      lockedOrder.final_selling_price ?? lockedOrder.final_price ?? lockedOrder.grand_total ?? 0,
    );
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) fail(409, "Harga final order belum tersedia.");

    await client.query(
      `update public.mkt_gateway_payments
          set status='expired'::payment_status,updated_at=now()
        where ref_kind='logistic'::payment_ref_kind and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status and expired_at<=now()`,
      [order.id],
    );

    const existing = (await client.query(
      `select * from public.mkt_gateway_payments
        where ref_kind='logistic'::payment_ref_kind and ref_id=$1
          and provider='paylabs'::payment_provider
          and status='pending'::payment_status and expired_at>now()
        order by created_at desc,id desc limit 1`,
      [order.id],
    )).rows[0];

    if (existing?.payment_url && isTrustedPaylabsPaymentUrl(existing.payment_url)) {
      await client.query("commit");
      return { reused: true, payment: serializePayment(existing), sandboxMode: credentials.sandboxMode };
    }

    const providerCompanyId = Number(process.env.LOGISTIC_PROVIDER_COMPANY_ID ?? 1);
    const merchantTradeNo = shortLogisticTradeNo(order.id);
    const inserted = (await client.query(
      `insert into public.mkt_gateway_payments
         (company_id,ref_kind,ref_id,ref_doc_number,amount,status,provider,payment_method,
          provider_merchant_trade_no,expired_at,raw)
       values ($1,'logistic'::payment_ref_kind,$2,$3,$4,'pending'::payment_status,
               'paylabs'::payment_provider,$5,$6,$7,$8::jsonb)
       returning *`,
      [
        providerCompanyId,
        order.id,
        order.order_number,
        finalAmount,
        method.code,
        merchantTradeNo,
        new Date(Date.now() + PAYMENT_TTL_MS),
        JSON.stringify({ source: "logistic_order", sandboxMode: credentials.sandboxMode }),
      ],
    )).rows[0];

    const reqId = requestId();
    const timestamp = formatPaylabsTimestamp();
    const baseUrl = requestOrigin(request);
    const notifyUrl = `${baseUrl}/api/payments/paylabs/webhook`;
    const redirectUrl = `${baseUrl}/logistic-order-success?order=${encodeURIComponent(order.order_number)}`;
    const providerBody = {
      merchantId: credentials.merchantId,
      merchantTradeNo,
      requestId: reqId,
      amount: finalAmount.toFixed(2),
      productName: `Pembayaran ${order.order_number}`,
      payer: text(customerName, "Customer"),
      phoneNumber: normalizedCustomerPhone,
      paymentType: method.code,
      notifyUrl,
      redirectUrl,
      ...(credentials.storeId ? { storeId: credentials.storeId } : {}),
    };

    const bodyJson = JSON.stringify(providerBody);
    const endpoint = new URL(credentials.apiUrl).pathname;
    const signaturePayload = buildPaylabsSignaturePayload("POST", endpoint, bodyJson, timestamp);
    let signature;
    try {
      signature = rsaSign(signaturePayload, credentials.privateKey);
    } catch {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                raw=raw || '{"reason":"signing_failed"}'::jsonb,updated_at=now()
          where id=$1`,
        [inserted.id],
      );
      await client.query("commit");
      fail(500, "Konfigurasi private key Paylabs tidak valid.");
    }

    let response;
    let payload;
    try {
      response = await fetch(credentials.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TIMESTAMP": timestamp,
          "X-SIGNATURE": signature,
          "X-PARTNER-ID": credentials.merchantId,
          "X-REQUEST-ID": reqId,
        },
        body: bodyJson,
        signal: AbortSignal.timeout(15_000),
      });
      payload = await response.json().catch(() => ({}));
    } catch (error) {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                raw=raw || $2::jsonb,updated_at=now()
          where id=$1`,
        [
          inserted.id,
          JSON.stringify({
            reason: "provider_request_failed",
            message: String(error?.message ?? error).slice(0, 300),
          }),
        ],
      );
      await client.query("commit");
      fail(502, "Paylabs tidak dapat dihubungi. Silakan coba lagi.");
    }

    const paymentUrl = payload?.url ?? payload?.h5Url ?? payload?.paymentUrl ?? null;
    if (!response.ok || String(payload?.errCode ?? "0") !== "0" || !isTrustedPaylabsPaymentUrl(paymentUrl)) {
      await client.query(
        `update public.mkt_gateway_payments
            set status='failed'::payment_status,
                provider_order_id=$2,
                raw=raw || $3::jsonb,
                updated_at=now()
          where id=$1`,
        [
          inserted.id,
          text(payload?.platformTradeNo),
          JSON.stringify({
            reason: "provider_rejected",
            errCode: payload?.errCode ?? null,
            errMsg: payload?.errMsg ?? null,
          }),
        ],
      );
      await client.query("commit");
      fail(502, text(payload?.errMsg, "Paylabs gagal membuat tautan pembayaran."));
    }

    payment = (await client.query(
      `update public.mkt_gateway_payments
          set provider_order_id=$1,payment_url=$2,raw=raw || $3::jsonb,updated_at=now()
        where id=$4 returning *`,
      [
        text(payload?.platformTradeNo),
        paymentUrl,
        JSON.stringify({ requestId: reqId, providerOrderId: payload?.platformTradeNo ?? null }),
        inserted.id,
      ],
    )).rows[0];

    await client.query("commit");
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }

  return {
    reused: false,
    payment: serializePayment(payment),
    sandboxMode: credentials.sandboxMode,
  };
}

async function updatePaymentMethod(code, body) {
  const exists = (await query(
    `select id from public.paylabs_payment_methods where code=$1 limit 1`,
    [code],
  )).rows[0];
  if (!exists) fail(404, "Metode pembayaran Paylabs tidak ditemukan.");

  await query(
    `update public.paylabs_payment_methods
        set label=coalesce($2,label),
            description=coalesce($3,description),
            icon_url=$4,
            icon_enabled=$5,
            is_active=$6,
            sort_order=coalesce($7,sort_order),
            updated_at=now()
      where code=$1`,
    [
      code,
      text(body?.label),
      body?.description == null ? null : String(body.description),
      body?.iconUrl == null ? null : String(body.iconUrl),
      body?.iconEnabled !== false,
      body?.isActive === true,
      Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : null,
    ],
  );
}

async function adminConfigurationView(request) {
  const cfg = await loadConfiguration();
  const sandboxFallback = envCredentialSet(true);
  const prodFallback = envCredentialSet(false);
  const sandboxPublic = configuredKey(cfg?.sandbox_public_key) || sandboxFallback.publicKey;
  const sandboxPrivate = configuredKey(cfg?.sandbox_private_key) || sandboxFallback.privateKey;
  const prodPublic = configuredKey(cfg?.prod_public_key) || prodFallback.publicKey;
  const prodPrivate = configuredKey(cfg?.prod_private_key) || prodFallback.privateKey;

  return {
    sandboxMode: cfg?.sandbox_mode == null
      ? true
      : Boolean(cfg.sandbox_mode),
    storeId: cfg?.store_id ?? "",
    sandboxPublicKey: sandboxPublic ? SAVED_MARKER : "",
    sandboxPrivateKey: sandboxPrivate ? SAVED_MARKER : "",
    sandboxMerchantId: cfg?.sandbox_merchant_id ?? sandboxFallback.merchantId ?? "",
    prodPublicKey: prodPublic ? SAVED_MARKER : "",
    prodPrivateKey: prodPrivate ? SAVED_MARKER : "",
    prodMerchantId: cfg?.prod_merchant_id ?? prodFallback.merchantId ?? "",
    _savedMarker: SAVED_MARKER,
    hasSandboxKeys: Boolean((cfg?.sandbox_merchant_id ?? sandboxFallback.merchantId) && sandboxPublic && sandboxPrivate),
    hasProdKeys: Boolean((cfg?.prod_merchant_id ?? prodFallback.merchantId) && prodPublic && prodPrivate),
    webhookUrl: `${requestOrigin(request)}/api/payments/paylabs/webhook`,
    updatedAt: cfg?.updated_at ?? null,
  };
}

async function saveAdminConfiguration(body) {
  const current = await loadConfiguration();
  const keepOrSet = (incoming, currentValue) => {
    const value = typeof incoming === "string" ? incoming.trim() : "";
    if (!value || value === SAVED_MARKER) return currentValue ?? null;
    return normalizePaylabsPem(value);
  };

  const values = {
    sandboxMode: body?.sandboxMode === true,
    storeId: text(body?.storeId),
    sandboxPublicKey: keepOrSet(body?.sandboxPublicKey, current?.sandbox_public_key),
    sandboxPrivateKey: keepOrSet(body?.sandboxPrivateKey, current?.sandbox_private_key),
    sandboxMerchantId: text(body?.sandboxMerchantId),
    prodPublicKey: keepOrSet(body?.prodPublicKey, current?.prod_public_key),
    prodPrivateKey: keepOrSet(body?.prodPrivateKey, current?.prod_private_key),
    prodMerchantId: text(body?.prodMerchantId),
  };

  if (current) {
    await query(
      `update public.paylabs_configurations
          set sandbox_mode=$1, store_id=$2,
              sandbox_public_key=$3, sandbox_private_key=$4, sandbox_merchant_id=$5,
              prod_public_key=$6, prod_private_key=$7, prod_merchant_id=$8,
              updated_at=now()
        where id=$9`,
      [
        values.sandboxMode,
        values.storeId,
        values.sandboxPublicKey,
        values.sandboxPrivateKey,
        values.sandboxMerchantId,
        values.prodPublicKey,
        values.prodPrivateKey,
        values.prodMerchantId,
        current.id,
      ],
    );
  } else {
    await query(
      `insert into public.paylabs_configurations
         (sandbox_mode,store_id,sandbox_public_key,sandbox_private_key,sandbox_merchant_id,
          prod_public_key,prod_private_key,prod_merchant_id,updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,now())`,
      [
        values.sandboxMode,
        values.storeId,
        values.sandboxPublicKey,
        values.sandboxPrivateKey,
        values.sandboxMerchantId,
        values.prodPublicKey,
        values.prodPrivateKey,
        values.prodMerchantId,
      ],
    );
  }
}

export async function handlePaylabsAdminRoute({ request, response, url, body, sendJson }) {
  const { pathname } = url;

  if (pathname === "/api/payments/paylabs/config") {
    if (request.method === "GET") {
      sendJson(response, 200, await adminConfigurationView(request));
      return true;
    }
    if (request.method === "PUT") {
      await saveAdminConfiguration(body);
      sendJson(response, 200, { ok: true, ...(await adminConfigurationView(request)) });
      return true;
    }
    return false;
  }

  if (pathname === "/api/payments/paylabs/payment-methods" && request.method === "GET") {
    const result = await query(
      `select code,label,description,icon_url,icon_enabled,is_active,sort_order,updated_at
         from public.paylabs_payment_methods
        order by sort_order,code`,
    );
    sendJson(response, 200, result.rows.map((row) => ({
      code: row.code,
      label: row.label,
      description: row.description ?? "",
      iconUrl: row.icon_url ?? "",
      iconEnabled: Boolean(row.icon_enabled),
      isActive: Boolean(row.is_active),
      sortOrder: Number(row.sort_order ?? 0),
      updatedAt: row.updated_at,
    })));
    return true;
  }

  const methodMatch = pathname.match(/^\/api\/payments\/paylabs\/payment-methods\/([^/]+)$/);
  if (methodMatch && request.method === "PUT") {
    await updatePaymentMethod(decodeURIComponent(methodMatch[1]), body);
    sendJson(response, 200, { ok: true });
    return true;
  }

  return false;
}

function webhookStatus(body) {
  return body?.status
    ?? body?.paymentStatus
    ?? body?.transactionStatus
    ?? body?.tradeStatus
    ?? "";
}

function webhookMethod(body) {
  return text(
    body?.paymentMethod
    ?? body?.payment_method
    ?? body?.method
    ?? body?.payMethod
    ?? body?.paymentType
    ?? body?.channel,
  );
}

function webhookAmount(body) {
  const raw = body?.amount ?? body?.totalAmount ?? body?.paidAmount;
  if (raw == null || raw === "") return null;
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : null;
}

export async function handlePaylabsWebhook({ request, response, body, rawBodyText, sendJson }) {
  const signature = text(request.headers["x-signature"], "");
  const timestamp = text(request.headers["x-timestamp"], "");
  const partnerId = text(request.headers["x-partner-id"], "");
  if (!signature || !timestamp) {
    sendJson(response, 401, { errCode: "401", errMsg: "Invalid signature" });
    return true;
  }
  if (!isPaylabsTimestampFresh(timestamp)) {
    sendJson(response, 401, { errCode: "401", errMsg: "Stale signature timestamp" });
    return true;
  }

  const credentials = await allVerificationCredentials();
  const payloadCandidates = [
    rawBodyText,
    JSON.stringify(body ?? {}),
  ];
  const verified = credentials.some((item) => {
    if (partnerId && item.merchantId !== partnerId) return false;
    return payloadCandidates.some((payloadText) => rsaVerify(
      buildPaylabsSignaturePayload(
        "POST",
        "/api/payments/paylabs/webhook",
        payloadText,
        timestamp,
      ),
      signature,
      item.publicKey,
    ));
  });
  if (!verified) {
    sendJson(response, 401, { errCode: "401", errMsg: "Invalid signature" });
    return true;
  }

  const merchantTradeNo = text(body?.merchantTradeNo);
  if (!merchantTradeNo) {
    sendJson(response, 400, { errCode: "400", errMsg: "Missing merchantTradeNo" });
    return true;
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const payment = (await client.query(
      `select *
         from public.mkt_gateway_payments
        where provider_merchant_trade_no=$1
          and provider='paylabs'::payment_provider
        limit 1
        for update`,
      [merchantTradeNo],
    )).rows[0];
    if (!payment) {
      await client.query("rollback");
      sendJson(response, 404, { errCode: "404", errMsg: "Payment not found" });
      return true;
    }

    // Provider callbacks can be retried/out-of-order. Never downgrade a paid
    // transaction, and do not turn an existing terminal status back to pending
    // merely because a later callback carries an unknown/non-terminal status.
    const targetStatus = resolvePaylabsWebhookStatus(payment.status, webhookStatus(body));
    const paidAmount = webhookAmount(body);
    if (targetStatus === "paid" && paidAmount != null && paidAmount !== Number(payment.amount)) {
      await client.query("rollback");
      sendJson(response, 422, { errCode: "422", errMsg: "Payment amount mismatch" });
      return true;
    }

    const paymentMethod = webhookMethod(body) ?? payment.payment_method;
    const wasPaid = payment.status === "paid";
    const paidAt = targetStatus === "paid" ? (payment.paid_at ?? new Date()) : payment.paid_at;
    const updated = (await client.query(
      `update public.mkt_gateway_payments
          set status=$1::payment_status,
              payment_method=coalesce($2,payment_method),
              provider_order_id=coalesce($3,provider_order_id),
              paid_at=$4,
              raw=coalesce(raw,'{}'::jsonb) || $5::jsonb,
              updated_at=now()
        where id=$6
        returning *`,
      [
        targetStatus,
        paymentMethod,
        text(body?.platformTradeNo ?? body?.transactionId),
        paidAt,
        JSON.stringify(body ?? {}),
        payment.id,
      ],
    )).rows[0];

    if (targetStatus === "paid" && !wasPaid && payment.ref_kind === "purchase") {
      const po = (await client.query(
        `select po.*, r.portal_customer_id, r.buyer_name, r.buyer_email
           from public.mkt_purchase_orders po
           join public.mkt_rfqs r on r.id=po.rfq_id
          where po.id=$1
          limit 1
          for update of po`,
        [payment.ref_id],
      )).rows[0];
      if (!po) {
        await client.query("rollback");
        sendJson(response, 404, { errCode: "404", errMsg: "Purchase Order not found" });
        return true;
      }

      if (po.payment_status === "proof_submitted") {
        await client.query(
          `update public.mkt_po_payment_proofs
              set review_status='rejected',
                  rejection_reason='Pembayaran diselesaikan melalui Paylabs; bukti transfer manual tidak diproses.',
                  reviewed_by='paylabs:webhook',
                  reviewed_at=now()
            where po_id=$1 and review_status='submitted'`,
          [po.id],
        );
      }

      const totals = await marketplacePaymentTotals(po, client);
      const fullyPaid = totals.remainingAmount <= 0.005;
      const paymentStatus = fullyPaid ? "paid" : "partially_paid";
      const duplicatePayment = totals.overpaidAmount > 0.005;

      await client.query(
        `update public.mkt_purchase_orders
            set payment_status=$1,
                payment_verified_at=case when $1='paid' then coalesce(payment_verified_at,now()) else null end,
                payment_verified_by=case
                  when $1='paid' then coalesce(payment_verified_by,'paylabs:webhook')
                  else null
                end,
                payment_rejection_reason=null,
                updated_at=now()
          where id=$2`,
        [paymentStatus, po.id],
      );

      await client.query(
        `insert into public.activity_logs
           (actor_type,actor_id,actor_name,action,old_value,new_value,description,
            mkt_purchase_order_id,deduplication_key)
         values ('system',null,'Paylabs',$1,$2::jsonb,$3::jsonb,$4,$5,$6)
         on conflict (deduplication_key) where deduplication_key is not null do nothing`,
        [
          fullyPaid ? "po_payment_verified" : "po_payment_partially_verified",
          JSON.stringify({ paymentStatus: po.payment_status }),
          JSON.stringify({
            paymentStatus,
            paymentId: Number(updated.id),
            provider: "paylabs",
            paymentMethod,
            paymentAmount: Number(payment.amount),
            paidAmount: totals.receivedAmount,
            remainingAmount: totals.remainingAmount,
            overpaidAmount: totals.overpaidAmount,
          }),
          fullyPaid
            ? "Pembayaran customer dikonfirmasi otomatis melalui webhook Paylabs dan PO sudah lunas."
            : `Pembayaran sebagian Paylabs sebesar ${Number(payment.amount).toLocaleString("id-ID")} diterima. Sisa tagihan ${totals.remainingAmount.toLocaleString("id-ID")}.`,
          po.id,
          `po-payment-paylabs:${updated.id}:paid`,
        ],
      );

      if (duplicatePayment) {
        await client.query(
          `insert into public.activity_logs
             (actor_type,actor_id,actor_name,action,old_value,new_value,description,
              mkt_purchase_order_id,deduplication_key)
           values ('system',null,'Paylabs','po_payment_overpaid',$1::jsonb,$2::jsonb,$3,$4,$5)
           on conflict (deduplication_key) where deduplication_key is not null do nothing`,
          [
            JSON.stringify({ grandTotal: Number(po.grand_total) }),
            JSON.stringify({ receivedAmount: totals.receivedAmount, overpaidAmount: totals.overpaidAmount }),
            "Total pembayaran melebihi nilai PO. Admin harus memeriksa kemungkinan pembayaran ganda/refund.",
            po.id,
            `po-payment-overpaid:${updated.id}`,
          ],
        );
      }

      await client.query(
        `insert into public.mkt_notification_queue
           (event_type,channel,recipient_type,recipient_id,rfq_id,purchase_order_id,payload_json,deduplication_key)
         values ($1,'internal','customer',$2,$3,$4,$5::jsonb,$6)
         on conflict do nothing`,
        [
          fullyPaid ? "po_payment_verified" : "po_payment_partially_verified",
          po.portal_customer_id ?? null,
          po.rfq_id,
          po.id,
          JSON.stringify({
            poId: Number(po.id),
            poNumber: po.po_number,
            paymentStatus,
            provider: "paylabs",
            paymentMethod,
            paymentAmount: Number(payment.amount),
            paidAmount: totals.receivedAmount,
            remainingAmount: totals.remainingAmount,
          }),
          `po-payment-paylabs-notify:${updated.id}:paid`,
        ],
      ).catch(() => {});
    }

    if (targetStatus === "paid" && !wasPaid && payment.ref_kind === "logistic") {
      const order = (await client.query(
        `select * from public.logistic_orders where id=$1 limit 1 for update`,
        [payment.ref_id],
      )).rows[0];
      if (!order) {
        await client.query("rollback");
        sendJson(response, 404, { errCode: "404", errMsg: "Logistic order not found" });
        return true;
      }

      if (order.customer_quote_status !== "approved") {
        await client.query("rollback");
        sendJson(response, 409, { errCode: "409", errMsg: "Logistic quotation not approved" });
        return true;
      }

      const finalAmount = Number(order.final_selling_price ?? order.final_price ?? order.grand_total ?? 0);
      if (!Number.isFinite(finalAmount) || Math.abs(finalAmount - Number(payment.amount)) > 0.005) {
        await client.query("rollback");
        sendJson(response, 422, { errCode: "422", errMsg: "Logistic payment amount mismatch" });
        return true;
      }

      await client.query(
        `update public.logistic_orders
            set payment_status='paid',
                operational_status=case
                  when operational_status is null or operational_status in ('pending','pending_review','quoted','confirmed')
                    then 'payment_confirmed'
                  else operational_status
                end,
                status=case
                  when status in ('New Order','Order Received','quoted','confirmed')
                    then 'Payment Confirmed'
                  else status
                end,
                updated_at=now()
          where id=$1`,
        [order.id],
      );

      if (order.portal_customer_id) {
        await client.query(
          `insert into public.portal_customer_notifications
             (portal_customer_id,event_key,type,title,message,payload,is_read,created_at)
           values ($1,$2,'logistic_payment_paid','Pembayaran Paylabs diterima',$3,$4::jsonb,false,now())
           on conflict (portal_customer_id,event_key) do nothing`,
          [
            Number(order.portal_customer_id),
            `logistic:paylabs:${updated.id}:paid`,
            `Pembayaran ${order.order_number} sebesar Rp${Number(payment.amount).toLocaleString("id-ID")} telah dikonfirmasi.`,
            JSON.stringify({
              orderNumber: order.order_number,
              paymentId: Number(updated.id),
              amount: Number(payment.amount),
              paymentMethod,
            }),
          ],
        ).catch(() => {});
      }
    }

    if (targetStatus === "paid" && !wasPaid && payment.ref_kind === "trucking") {
      const booking = (await client.query(
        `select * from public.trucking_booking_requests where id=$1 limit 1 for update`,
        [payment.ref_id],
      )).rows[0];
      if (!booking) {
        await client.query("rollback");
        sendJson(response, 404, { errCode: "404", errMsg: "Trucking booking not found" });
        return true;
      }
      await client.query(
        `update public.trucking_payments
            set status='rejected',
                rejection_reason='Pembayaran diselesaikan melalui Paylabs; bukti transfer trucking manual tidak diproses.',
                reviewed_at=now(),
                updated_at=now()
          where booking_id=$1 and status='submitted'`,
        [booking.id],
      );
      const totals = await truckingPaymentTotals(booking, client);
      const terms = booking.payment_terms && typeof booking.payment_terms === "object"
        ? booking.payment_terms
        : { type: "full", dp_percent: 100 };
      const initialRequired = terms.type === "dp"
        ? Number(booking.final_price ?? booking.estimasi_total ?? 0) * Number(terms.dp_percent ?? 50) / 100
        : Number(booking.final_price ?? booking.estimasi_total ?? 0);
      const paymentStatus = totals.remainingAmount <= 0.005 ? "paid" : "partially_paid";
      let nextStatus = booking.status;
      if (booking.status === "waiting_payment" && totals.receivedAmount + 0.005 >= initialRequired) nextStatus = "confirmed";
      if (["delivered","balance_due","completed"].includes(booking.status) && totals.remainingAmount > 0.005) nextStatus = "balance_due";
      if (
        (booking.delivered_at || ["delivered","balance_due","completed"].includes(booking.status))
        && totals.remainingAmount <= 0.005
      ) nextStatus = "completed";
      await client.query(
        `update public.trucking_booking_requests
          set paid_amount=$2,remaining_amount=$3,payment_status=$4,status=$5,
              confirmed_at=case when $5='confirmed' then coalesce(confirmed_at,now()) else confirmed_at end,
              completed_at=case
                when $5='completed' then coalesce(completed_at,now())
                when $5='balance_due' then null
                else completed_at
              end,
              receipt_number=case
                when $4='paid' then coalesce(receipt_number,'RCT-' || booking_number)
                else null
              end,
              updated_at=now()
          where id=$1`,
        [booking.id, totals.receivedAmount, totals.remainingAmount, paymentStatus, nextStatus],
      );
      await client.query(
        `insert into public.trucking_status_events
          (booking_id,status,actor_type,actor_name,notes,metadata)
         values ($1,$2,'system','Paylabs',$3,$4::jsonb)`,
        [
          booking.id,
          nextStatus === booking.status ? "payment_received" : nextStatus,
          `Pembayaran Paylabs Rp${Number(payment.amount).toLocaleString("id-ID")} diterima.`,
          JSON.stringify({ paymentId: Number(updated.id), receivedAmount: totals.receivedAmount, remainingAmount: totals.remainingAmount }),
        ],
      );
      const customerId = booking.portal_customer_id ?? booking.customer_id;
      if (customerId) {
        const notificationType = nextStatus === "completed"
          ? "trucking_completed"
          : nextStatus === "confirmed"
            ? "trucking_confirmed"
            : "trucking_payment_received";
        const notificationTitle = nextStatus === "completed"
          ? "Booking trucking selesai"
          : nextStatus === "confirmed"
            ? "Pembayaran awal terpenuhi"
            : "Pembayaran Paylabs diterima";
        const notificationMessage = nextStatus === "completed"
          ? `${booking.booking_number} telah selesai dan seluruh tagihan lunas.`
          : nextStatus === "confirmed"
            ? `${booking.booking_number} sudah dikonfirmasi dan siap untuk assignment armada.`
            : `Pembayaran ${booking.booking_number} diterima. Sisa tagihan Rp${totals.remainingAmount.toLocaleString("id-ID")}.`;
        await client.query(
          `insert into public.portal_customer_notifications
             (portal_customer_id,event_key,type,title,message,payload,is_read,created_at)
           values ($1,$2,$3,$4,$5,$6::jsonb,false,now())
           on conflict (portal_customer_id,event_key) do nothing`,
          [
            Number(customerId),
            `trucking:paylabs:${updated.id}:paid`,
            notificationType,
            notificationTitle,
            notificationMessage,
            JSON.stringify({
              bookingNumber: booking.booking_number,
              paymentId: Number(updated.id),
              paymentAmount: Number(payment.amount),
              receivedAmount: totals.receivedAmount,
              remainingAmount: totals.remainingAmount,
              status: nextStatus,
            }),
          ],
        ).catch(() => {});
      }
    }

    await client.query("commit");
    sendJson(response, 200, { errCode: "0", errMsg: "OK" });
    return true;
  } catch (error) {
    try { await client.query("rollback"); } catch {}
    throw error;
  } finally {
    client.release();
  }
}
