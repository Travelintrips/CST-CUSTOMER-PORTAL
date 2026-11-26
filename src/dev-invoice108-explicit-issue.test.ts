import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/pages/admin/CustomerBillingTab.tsx", "utf8");
const server = readFileSync("server/index.mjs", "utf8");

describe("Invoice #108 explicit Owner-led DEV action", () => {
  it("does not post on mount, refresh or a timer", () => {
    const effects = [...source.matchAll(/useEffect\(\(\) => \{[\s\S]*?\}, \[.*?\]\);/g)].map(m => m[0]);
    expect(effects.join("\n")).not.toContain("auto-issue-ready");
    expect(source).not.toContain("setInterval(");
    expect(source).toContain('async function issueAutomaticPilot(id: number)');
    expect(source).toContain('onClick={() => void issueAutomaticPilot(invoice.id)}');
  });
  it("gates exact pilot ID and only asks for POST after authenticated GET says ready", () => {
    expect(source).toContain('id !== 108 || !automaticInvoiceIds.includes(id)');
    const start = source.indexOf('async function issueAutomaticPilot(');
    const end = source.indexOf('async function startOwnerHandoff(',start);
    const action = source.slice(start,end);
    expect(action.indexOf('"/api/portal/admin/invoices/auto-issue-status"')).toBeGreaterThan(0);
    expect(action.indexOf('status.readOnly !== true')).toBeGreaterThan(0);
    expect(action.indexOf('status.ready !== true')).toBeGreaterThan(0);
    expect(action.indexOf('status.actorReady !== true')).toBeGreaterThan(0);
    expect(action.indexOf('window.confirm(')).toBeGreaterThan(action.indexOf('status.actorReady !== true'));
    expect(action.indexOf('"/api/portal/admin/invoices/auto-issue-ready"')).toBeGreaterThan(action.indexOf('window.confirm('));
    expect(action).toContain('method: "POST"');
    expect(action).toContain('credentials: "include"');
  });
  it("requires exactly one issued invoice receipt and preserves server financial gates", () => {
    expect(source).toContain('outcome.invoiced !== 1 || !issued');
    expect(server).toContain('request.method === "POST" && pathname === "/api/portal/admin/invoices/auto-issue-ready"');
    expect(server).toContain('await loadDevOriginalAccountingOwner()');
  });
});
