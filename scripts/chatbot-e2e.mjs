#!/usr/bin/env node

/**
 * Customer Portal chatbot smoke test.
 *
 * This targets the standalone API directly by default. It can also target the
 * public preview API port with CHATBOT_E2E_BASE_URL, but production hosts are
 * rejected intentionally.
 */

const configured = process.env.CHATBOT_E2E_BASE_URL?.trim() || "http://127.0.0.1:18444";
const base = new URL(configured);
const productionHosts = new Set(["cstlogistic.co.id", "www.cstlogistic.co.id"]);

if (productionHosts.has(base.hostname)) {
  throw new Error("chatbot smoke test refuses production hosts");
}

function assert(condition, message) {
  if (!condition) throw new Error(`[chatbot-e2e] ${message}`);
}

function parseSse(body) {
  return body
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));
}

async function request(path, options = {}) {
  const response = await fetch(new URL(path, base), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });
  return response;
}

async function main() {
  const health = await request("/api/healthz");
  assert(health.status === 200, `health returned ${health.status}`);
  const healthBody = await health.json();
  assert(healthBody.databaseEnvironment === "development", "target is not development database");

  const chat = await request("/api/ai-agent/chat", {
    method: "POST",
    body: JSON.stringify({ message: "Apa layanan freight forwarding yang tersedia?" }),
  });
  assert(chat.status === 200, `chat returned ${chat.status}`);
  const events = parseSse(await chat.text());
  const session = events.find((event) => event.type === "session");
  const token = events.find((event) => event.type === "token");
  assert(typeof session?.sessionToken === "string", "chat did not create a session");
  assert(typeof token?.text === "string" && token.text.length > 0, "chat returned no assistant text");
  assert(events.some((event) => event.type === "done"), "chat stream did not finish");

  const history = await request(`/api/ai-agent/session/${session.sessionToken}`);
  assert(history.status === 200, `history returned ${history.status}`);
  const historyBody = await history.json();
  assert(
    historyBody.messages?.some((message) => message.role === "user")
      && historyBody.messages?.some((message) => message.role === "assistant"),
    "history did not persist both sides of the conversation",
  );

  const unknown = await request("/api/ai-agent/not-a-real-route");
  assert(unknown.status === 404, `unknown AI route returned ${unknown.status}`);
  const unknownBody = await unknown.json();
  assert(unknownBody.service === "customer-portal-api", "unknown AI route escaped local namespace");

  console.log(`[chatbot-e2e] passed: provider response, SSE session, persisted history, and local route boundary.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});