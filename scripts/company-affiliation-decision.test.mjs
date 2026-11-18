import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../server/admin-portal.mjs", import.meta.url), "utf8");
const start = source.indexOf("async function handleAdminCompanyRequests(ctx)");
const end = source.indexOf("async function getVerificationState(", start);
assert(start >= 0 && end > start);

function makeHarness({ profileComplete = false, reviewerId = 22, existingStatus = "pending", failMembership = false } = {}) {
  const state = { status: existingStatus, member: false, profile: "incomplete", company: null, commits: 0, rollbacks: 0, calls: [] };
  let staged;
  const client = {
    async query(sql, values = []) {
      state.calls.push(sql);
      if (sql === "BEGIN") { staged = { status: state.status, member: state.member, profile: state.profile, company: state.company }; return { rows: [] }; }
      if (sql === "COMMIT") { Object.assign(state, staged); state.commits++; return { rows: [] }; }
      if (sql === "ROLLBACK") { staged = null; state.rollbacks++; return { rows: [] }; }
      if (sql.includes("from public.portal_company_requests where id = $1 for update")) return { rows: [{ id: 5, portal_customer_id: 11, status: staged.status }] };
      if (sql.includes("assert_portal_profile_complete")) {
        if (!profileComplete) throw Object.assign(new Error("Alamat KTP belum lengkap"), { code: "23514" });
        return { rows: [{}] };
      }
      if (sql.includes("from public.companies where id = $1 and coalesce")) return { rows: [{ id: 1 }] };
      if (sql.includes("select coalesce(company_name")) return { rows: [{ name: "PT Cahaya Sejati Teknologi" }] };
      if (sql.includes("update public.portal_company_requests")) { staged.status = values[0]; return { rows: [] }; }
      if (sql.includes("insert into public.portal_company_members")) {
        if (failMembership) throw Object.assign(new Error("simulated failed insert"), { code: "23503" });
        staged.member = true; return { rows: [] };
      }
      if (sql.includes("set profile_status = 'active'")) { staged.profile = "active"; return { rows: [] }; }
      if (sql.includes("set customer_type = 'company'")) { staged.company = "CST"; return { rows: [] }; }
      throw new Error("Unexpected SQL: " + sql.slice(0, 120));
    },
    release() { state.calls.push("RELEASE"); },
  };
  const makeHandler = new Function("pool", "query", "adminError", "text", "numberOrNull",
    source.slice(start, end) + "\nreturn handleAdminCompanyRequests;");
  const handler = makeHandler({ connect: async () => client }, async () => ({ rows: [] }),
    (ctx, status, message) => { ctx.result = { status, message }; },
    (v, fallback = "") => typeof v === "string" ? v.trim() : fallback,
    (v) => Number.isInteger(Number(v)) ? Number(v) : null);
  const ctx = {
    request: { method: "PATCH" }, response: {},
    url: new URL("https://dev.invalid/api/portal/admin/company-requests/5"),
    user: { id: reviewerId }, body: { status: "approved", matchedCompanyId: 1 },
    sendJson(_res, status, value) { this.result = { status, value }; },
  };
  return { state, handler, ctx };
}
test("incomplete KTP gives 422 without partial membership", async () => {
  const h = makeHarness();
  await h.handler(h.ctx);
  assert.equal(h.ctx.result.status, 422);
  assert.equal(h.state.status, "pending");
  assert.equal(h.state.member, false);
  assert.equal(h.state.commits, 0);
  assert.equal(h.state.rollbacks, 1);
});
test("self-approval is forbidden even when profile complete", async () => {
  const h = makeHarness({ profileComplete: true, reviewerId: 11 });
  await h.handler(h.ctx);
  assert.equal(h.ctx.result.status, 403);
  assert.equal(h.state.status, "pending");
});
test("valid independent reviewer commits request/member/profile together", async () => {
  const h = makeHarness({ profileComplete: true });
  await h.handler(h.ctx);
  assert.equal(h.ctx.result.status, 200);
  assert.equal(h.state.status, "approved");
  assert.equal(h.state.member, true);
  assert.equal(h.state.profile, "active");
  assert.equal(h.state.commits, 1);
});
test("late membership failure rolls back prior approval", async () => {
  const h = makeHarness({ profileComplete: true, failMembership: true });
  await assert.rejects(() => h.handler(h.ctx), /simulated failed insert/);
  assert.equal(h.state.status, "pending");
  assert.equal(h.state.member, false);
  assert.equal(h.state.commits, 0);
  assert.equal(h.state.rollbacks, 1);
});
test("approved request cannot be processed twice", async () => {
  const h = makeHarness({ profileComplete: true, existingStatus: "approved" });
  await h.handler(h.ctx);
  assert.equal(h.ctx.result.status, 409);
  assert.equal(h.state.commits, 0);
});
