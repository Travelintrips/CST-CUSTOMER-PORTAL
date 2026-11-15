import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const read=(path:string)=>readFileSync(resolve(process.cwd(),path),"utf8");
const migration=read("supabase/migrations/20261116014500_dev_onboarding_schema_parity.sql");
const org=read("server/admin-portal.mjs");
const ui=read("src/pages/admin/CompanyRequestsTab.tsx");

describe("Customer Portal DEV onboarding schema is compatible with existing writers",()=>{
 it("restores the four existing source-defined unique-index arbiters",()=>{
  for(const index of [
   "portal_customer_profiles_customer_unique_idx",
   "vendor_profiles_customer_unique_idx",
   "onboarding_approvals_one_pending_per_customer_idx",
   "portal_company_requests_one_active_per_customer_idx"
  ])expect(migration).toContain("CREATE UNIQUE INDEX IF NOT EXISTS "+index);
  expect(migration).toContain("Duplicate customer profiles");
  expect(migration).toContain("Duplicate active company requests");
 });
 it("supports the Admin in_review workflow without allowing arbitrary statuses",()=>{
  expect(migration).toContain("portal_company_requests_status_check");
  expect(migration).toContain("'pending','submitted','in_review','approved','rejected'");
  expect(migration).toContain("Unexpected company request status");
  expect(ui).toContain('submitDecision("in_review")');
  expect(org).toContain('"in_review", "approved", "rejected"');
 });
 it("keeps the canonical onboarding upsert and the approved-PO gate intact",()=>{
  expect(org).toContain("on conflict (customer_id) where customer_id is not null");
  expect(org).toContain("handleOrganizationMutation(ctx)");
  expect(org).toContain("handleOnboardingComplete(ctx)");
  expect(org).toContain("stageDevExistingCompanyApproval(");
  expect(org).toContain("client.query.bind(client)");
  expect(org).toContain('await client.query("rollback")');
 });
});
