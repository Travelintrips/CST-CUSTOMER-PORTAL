import { uploadAiChatDocument } from "./storage.mjs";
import { randomUUID } from "node:crypto";
import { query } from "./db.mjs";

const SESSION_TOKEN_PATTERN = /^[a-zA-Z0-9-]{20,128}$/;
const DEFAULT_MODEL = "gpt-4o-mini";
const PLACEHOLDER_EMAIL = "not-provided@cstlogistic.co.id";

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function json(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(value));
}

function sse(res, event, value) {
  res.write(`data: ${JSON.stringify({ type: event, ...value })}\n\n`);
}

function orderNumber(prefix, sequence) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `${prefix}-${date}-${String(sequence).padStart(6, "0")}`;
}

async function getOrCreateSession(sessionToken) {
  const candidate = text(sessionToken);
  if (candidate && SESSION_TOKEN_PATTERN.test(candidate)) {
    const existing = await query(
      `select id, session_token, logistic_order_id, created_at
         from public.ai_chat_sessions
        where session_token = $1
        limit 1`,
      [candidate],
    );
    if (existing.rows[0]) return existing.rows[0];
  }

  const token = randomUUID();
  const created = await query(
    `insert into public.ai_chat_sessions (session_token)
     values ($1)
     returning id, session_token, logistic_order_id, created_at`,
    [token],
  );
  return created.rows[0];
}

async function appendMessage(sessionId, role, content) {
  const result = await query(
    `insert into public.ai_chat_messages (session_id, role, content)
     values ($1, $2, $3)
     returning id, session_id, role, content, created_at`,
    [sessionId, role, content],
  );
  return result.rows[0];
}

async function readConversation(sessionId, limit = 24) {
  const result = await query(
    `select role, content, created_at
       from public.ai_chat_messages
      where session_id = $1
      order by created_at desc, id desc
      limit $2`,
    [sessionId, limit],
  );
  return result.rows.reverse();
}

async function providerContext() {
  const [settings, knowledge] = await Promise.all([
    query(
      `select value
         from public.ai_agent_settings
        where key = 'system_prompt'
        limit 1`,
    ),
    query(
      `select title, category, content
         from public.chatbot_knowledge_base
        where is_active = true
        order by sort_order, id
        limit 12`,
    ),
  ]);

  const configuredPrompt = text(settings.rows[0]?.value);
  const knowledgeText = knowledge.rows
    .map((row) => `## ${row.title} (${row.category})\n${String(row.content).slice(0, 4000)}`)
    .join("\n\n")
    .slice(0, 24_000);

  return [
    configuredPrompt || "Anda adalah asisten Customer Portal PT Cahaya Sejati Teknologi.",
    "Jawab dalam Bahasa Indonesia kecuali pengguna meminta bahasa lain.",
    "Jangan mengarang harga, stok, status order, atau kebijakan. Jika data tidak tersedia, katakan dengan jelas.",
    "Anda membantu menjelaskan layanan dan mengarahkan pengguna ke form order; jangan mengaku sudah membuat order kecuali endpoint order berhasil.",
    knowledgeText ? `Basis pengetahuan perusahaan:\n${knowledgeText}` : "",
  ].filter(Boolean).join("\n\n");
}

async function askProvider(messages) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) fail(503, "Provider AI belum dikonfigurasi pada Customer Portal API.");

  const model = text(process.env.OPENAI_MODEL, DEFAULT_MODEL);
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 700,
      }),
    });
  } catch {
    fail(503, "Provider AI tidak dapat dihubungi.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = text(payload?.error?.message);
    const suffix = providerMessage ? `: ${providerMessage.slice(0, 240)}` : "";
    fail(502, `Provider AI mengembalikan HTTP ${response.status}${suffix}`);
  }

  const answer = text(payload?.choices?.[0]?.message?.content);
  if (!answer) fail(502, "Provider AI mengembalikan jawaban kosong.");
  return answer;
}

function formHint(message) {
  const normalized = message.toLowerCase();
  if (
    /(buat|pesan|order|booking)/.test(normalized)
    || /(mau|ingin|butuh).{0,32}(kirim|pesan|buat|order)/.test(normalized)
  ) {
    return {
      service: normalized.includes("truk") || normalized.includes("trucking")
        ? "trucking"
        : "logistics",
    };
  }
  return null;
}

async function sessionResponse(session, since) {
  const sinceDate = since && !Number.isNaN(Date.parse(since)) ? new Date(since).toISOString() : null;
  const result = await query(
    `select id, role, content, created_at
       from public.ai_chat_messages
      where session_id = $1
        and ($2::timestamptz is null or created_at > $2::timestamptz)
      order by created_at, id`,
    [session.id, sinceDate],
  );
  return {
    sessionToken: session.session_token,
    messages: result.rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    })),
  };
}

export async function handleChat(request, response, body) {
  const message = text(body.message);
  if (!message) fail(400, "Pesan tidak boleh kosong.");
  if (message.length > 4000) fail(400, "Pesan terlalu panjang.");

  const session = await getOrCreateSession(body.sessionToken);
  await appendMessage(session.id, "user", message);
  const conversation = await readConversation(session.id);
  const systemPrompt = await providerContext();

  response.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-store",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  sse(response, "session", { sessionToken: session.session_token });

  try {
    const answer = await askProvider([
      { role: "system", content: systemPrompt },
      ...conversation.map((item) => ({
        role: item.role === "admin" ? "assistant" : item.role,
        content: item.content,
      })),
    ]);
    const stored = await appendMessage(session.id, "assistant", answer);
    sse(response, "token", { text: answer });
    const hint = formHint(message);
    if (hint) sse(response, "form", hint);
    sse(response, "done", {
      messageId: stored.id,
      createdAt: stored.created_at,
    });
  } catch (error) {
    sse(response, "error", {
      message: error.statusCode === 502 || error.statusCode === 503
        ? error.message
        : "Asisten AI gagal memproses pesan.",
    });
  } finally {
    response.end();
  }
}

export async function handleSession(request, response, sessionToken, url) {
  if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
    json(response, 404, { error: "Sesi chat tidak ditemukan." });
    return;
  }
  const result = await query(
    `select id, session_token, logistic_order_id, created_at
       from public.ai_chat_sessions
      where session_token = $1
      limit 1`,
    [sessionToken],
  );
  if (!result.rows[0]) {
    json(response, 404, { error: "Sesi chat tidak ditemukan." });
    return;
  }
  json(response, 200, await sessionResponse(result.rows[0], url.searchParams.get("since")));
}

export async function handleAdminReply(request, response, sessionToken, body, user) {
  if (!user || user.role !== "admin") {
    json(response, 403, { error: "Admin authorization required." });
    return;
  }
  if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
    json(response, 404, { error: "Sesi chat tidak ditemukan." });
    return;
  }
  const sessionResult = await query(
    `select id, session_token from public.ai_chat_sessions where session_token = $1 limit 1`,
    [sessionToken],
  );
  if (!sessionResult.rows[0]) {
    json(response, 404, { error: "Sesi chat tidak ditemukan." });
    return;
  }
  const message = text(body.message);
  if (!message) {
    json(response, 400, { error: "Balasan tidak boleh kosong." });
    return;
  }
  const stored = await appendMessage(sessionResult.rows[0].id, "admin", message);
  json(response, 200, {
    success: true,
    message: {
      id: stored.id,
      role: stored.role,
      content: stored.content,
      createdAt: stored.created_at,
    },
  });
}

export async function handleSessionByOrder(response, orderId, user) {
  if (!user || user.role !== "admin") {
    json(response, 403, { error: "Admin authorization required." });
    return;
  }
  const id = Number(orderId);
  if (!Number.isInteger(id) || id <= 0) {
    json(response, 400, { error: "Order tidak valid." });
    return;
  }
  const result = await query(
    `select s.id, s.session_token, s.logistic_order_id, s.created_at
       from public.ai_chat_sessions s
      where s.logistic_order_id = $1
      order by s.created_at desc
      limit 1`,
    [id],
  );
  if (!result.rows[0]) {
    json(response, 404, { error: "Sesi chat untuk order tidak ditemukan." });
    return;
  }
  json(response, 200, await sessionResponse(result.rows[0], null));
}

async function updateSessionOrder(sessionId, orderId) {
  await query(
    `update public.ai_chat_sessions
        set logistic_order_id = $1
      where id = $2`,
    [orderId, sessionId],
  );
}

export async function handleQuickOrder(request, response, body, portalUser = null) {
  const required = ["customerName", "phone", "shipmentType", "origin", "destination"];
  if (required.some((key) => !text(body[key]))) {
    json(response, 400, { success: false, error: "Data order logistik belum lengkap." });
    return;
  }
  const session = await getOrCreateSession(body.sessionToken);
  const customerName = text(body.customerName);
  const email = text(body.email, PLACEHOLDER_EMAIL).toLowerCase();
  const companyName = text(body.companyName, customerName);
  const sequenceResult = await query("select nextval('public.logistic_orders_id_seq') as id");
  const sequence = Number(sequenceResult.rows[0].id);
  const created = await query(
    `insert into public.logistic_orders (
       id, order_number, company_name, customer_name, email, phone,
       shipment_type, origin, destination, commodity, notes, source,
       subtotal, tax, grand_total, status, ai_session_token, portal_customer_id
     ) values (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11, 'chatbot',
       0, 0, 0, 'New Order', $12, $13
     )
     returning id, order_number`,
    [
      sequence,
      orderNumber("LOG", sequence),
      companyName,
      customerName,
      email,
      text(body.phone),
      text(body.shipmentType),
      text(body.origin),
      text(body.destination),
      text(body.commodity, null),
      text(body.notes, null),
      session.session_token,
      portalUser?.id ?? null,
    ],
  );
  await updateSessionOrder(session.id, created.rows[0].id);
  return json(response, 200, {
    success: true,
    orderId: Number(created.rows[0].id),
    orderNumber: created.rows[0].order_number,
    sessionToken: session.session_token,
  });
}

export async function handleQuickProductOrder(request, response, body, portalUser = null) {
  const customerName = text(body.customerName);
  const phone = text(body.phone);
  const productId = Number(body.productId);
  const requestedQty = Number(body.qty);
  if (!customerName || !phone || !Number.isInteger(productId) || productId <= 0 || !Number.isInteger(requestedQty) || requestedQty <= 0) {
    json(response, 400, { success: false, error: "Data pesanan produk belum lengkap." });
    return;
  }

  const productResult = await query(
    `select id, name, sku, unit, price
       from public.products
      where id = $1 and is_active = true
      limit 1`,
    [productId],
  );
  const product = productResult.rows[0];
  if (!product) {
    json(response, 404, { success: false, error: "Produk tidak ditemukan atau tidak aktif." });
    return;
  }
  const unitPrice = Number(product.price);
  const subtotal = unitPrice * requestedQty;
  const sequenceResult = await query("select nextval('public.portal_product_orders_id_seq') as id");
  const sequence = Number(sequenceResult.rows[0].id);
  const order = await query(
    `insert into public.portal_product_orders (
       id, order_number, customer_name, email, phone, shipping_address,
       notes, subtotal, grand_total, status, portal_customer_id, order_type
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $8, 'New Order', $9, 'chatbot')
     returning id, order_number`,
    [
      sequence,
      orderNumber("PRD", sequence),
      customerName,
      text(body.email, PLACEHOLDER_EMAIL).toLowerCase(),
      phone,
      "Akan dikonfirmasi oleh tim Customer Portal",
      text(body.notes, null),
      subtotal,
      portalUser?.id ?? null,
    ],
  );
  await query(
    `insert into public.portal_product_order_items
       (order_id, product_id, product_name, product_sku, unit, unit_price, qty, subtotal)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      order.rows[0].id,
      product.id,
      product.name,
      product.sku,
      product.unit,
      unitPrice,
      requestedQty,
      subtotal,
    ],
  );
  return json(response, 200, {
    success: true,
    orderId: Number(order.rows[0].id),
    orderNumber: order.rows[0].order_number,
    sessionToken: text(body.sessionToken, null),
  });
}

export async function handleUpload(response, file, docType) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
    json(response, 400, { success: false, error: "File upload tidak ditemukan." });
    return;
  }
  try {
    const uploaded = await uploadAiChatDocument({ file });
    json(response, 201, {
      success: true,
      document: uploaded,
      docType: text(docType, null),
    });
  } catch (error) {
    json(response, Number(error?.statusCode) || 500, {
      success: false,
      error: error?.message || "Upload dokumen gagal.",
      docType: text(docType, null),
    });
  }
}
