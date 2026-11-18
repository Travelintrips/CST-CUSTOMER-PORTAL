import {describe,it,expect} from "vitest";
import {resolveTrustedBizPortalInvoiceOrigin as trusted} from "../server/dev-bizportal-invoice-origin.mjs";

describe("DEV Invoice independent BizPortal origin — no extra VPS Basic Auth login",()=>{
 it("accepts the actual selected Hostinger BizPortal DEV origin",()=>{
   expect(trusted("https://dev-bizportal.cstlogistic.co.id")).toBe("https://dev-bizportal.cstlogistic.co.id");
 });
 it("refuses the separate VPS Payroll DEV basic-auth host and production origin",()=>{
   expect(trusted("https://bizportal-dev.cstlogistic.co.id")).toBeNull();
   expect(trusted("https://bizportal.cstlogistic.co.id")).toBeNull();
 });
 it("refuses protocol downgrade, suffix injection, paths, query and credentials",()=>{
   for(const value of [
     "http://dev-bizportal.cstlogistic.co.id",
     "https://dev-bizportal.cstlogistic.co.id.evil.invalid",
     "https://dev-bizportal.cstlogistic.co.id/attestation",
     "https://dev-bizportal.cstlogistic.co.id?override=1",
     "https://user:pass@dev-bizportal.cstlogistic.co.id",
     "https://dev-bizportal.cstlogistic.co.id:444",
     " https://dev-bizportal.cstlogistic.co.id",
     "https://dev-bizportal.cstlogistic.co.id ",
   ])expect(trusted(value)).toBeNull();
 });
 it("keeps only loopback 127.0.0.1 QA HTTP origin, not other HTTP hosts",()=>{
   expect(trusted("http://127.0.0.1:18774")).toBe("http://127.0.0.1:18774");
   expect(trusted("http://localhost:18774")).toBeNull();
   expect(trusted("http://185.124.137.7")).toBeNull();
 });
});
