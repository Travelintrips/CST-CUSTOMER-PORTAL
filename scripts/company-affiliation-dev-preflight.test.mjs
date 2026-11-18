import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../server/admin-portal.mjs", import.meta.url), "utf8");
const start = source.indexOf("async function handleAdminCompanyRequests(ctx)");
const end = source.indexOf("async function getVerificationState(", start);
assert(start >= 0 && end > start);
const fn = source.slice(start, end);
const generate = new Function("pool", "query", "adminError", "text", "numberOrNull", "corporatePoApprovalGateDevEnabled",
  fn + "\nreturn handleAdminCompanyRequests;");

function harness({ reviewer = 22, matchedCompanyId = 1, addressComplete = false } = {}) {
  const state = { updates: 0, rollbacks: 0, commits: 0, releases: 0, profileChecks: 0 };
  const client = { 
    async query(sql) {
      const q = sql.toLowerCase();
      if (q === "begin") return { rows: [] };
      if (q === "rollback") { state.rollbacks++; return { rows: [] }; }
      if (q === "commit") { state.commits++; return { rows: [] }; }
      if (q.includes("for update") && q.includes("portal_company_requests")) return { rows: [{ id: 5, portal_customer_id: 11, status: "pending" }] };
      if (q.includes("assert_portal_profile_complete")) {
        state.profileChecks++;
        if (!addressComplete) throw Object.assign(new Error("Alamat KTP belum lengkap"), { code: "23514" });
        return { rows: [{}] };
      }
      if (q.includes("update ") || q.includes("insert into ")) { state.updates++; throw Error("Unexpected write during preflight test"); }
      throw Error("Unexpected query: " + sql);
    },
    release() { state.releases++; },
  };
  const handler = generate({ connect: async () => client }, async () => { throw Error("Unexpected pool query"); },
    (ctx,status,message) => { ctx.result = { status, message }; },
    (value,def="") => typeof value === "string" ? value.trim() : def,
    (value) => Number.isInteger(Number(value)) ? Number(value) : null,
    () => true);
  const ctx = { request: { method:"PATCH" }, response:{},
    url: new URL("https://dev.invalid/api/portal/admin/company-requests/5"),
    user: { id: reviewer }, body: { status:"approved", matchedCompanyId },
    sendJson(res,status,payload) { this.result = { status, payload }; },
  };
  return { state, handler, ctx };
}
test("incomplete address: 422, rollback, zero writes", async () => {
  const h=harness(); await h.handler(h.ctx);
  assert.equal(h.ctx.result.status,422);
  assert.equal(h.state.profileChecks,1);
  assert.equal(h.state.updates,0);
  assert.equal(h.state.rollbacks,1);
  assert.equal(h.state.commits,0);
});
test("requester cannot approve own request", async () => {
  const h=harness({reviewer:11,addressComplete:true}); await h.handler(h.ctx);
  assert.equal(h.ctx.result.status,403);
  assert.equal(h.state.updates,0);
  assert.equal(h.state.profileChecks,0);
});
test("canonical company is mandatory for approval", async () => {
  const h=harness({matchedCompanyId:null,addressComplete:true}); await h.handler(h.ctx);
  assert.equal(h.ctx.result.status,400);
  assert.equal(h.state.updates,0);
  assert.equal(h.state.profileChecks,0);
});
