import {describe,it,expect,vi} from "vitest";
import {interpretRouteReadiness,probeDevInvoiceRoutes} from "../scripts/dev-customer-invoice-route-readiness.mjs";

describe("DEV Invoice route deploy gate (read-only, no unauthenticated false positive)",()=>{
 it("returns NO-GO when active Portal has no accounting attestation routes",()=>{
   const report=interpretRouteReadiness({portalConfigStatus:404,portalChallengeStatus:404,
     bizIssuerStatus:401,bizNonexistentStatus:401});
   expect(report).toMatchObject({go:false,portalRoutesPresent:false,
     bizIssuerVerified:false,bizIssuerAmbiguousFallback:true,
     reason:"PORTAL_ROUTES_NOT_VERIFIED"});
 });
 it("does not call generic BizPortal 401 proof that the issuer exists",()=>{
   const report=interpretRouteReadiness({portalConfigStatus:401,portalChallengeStatus:401,
     bizIssuerStatus:401,bizNonexistentStatus:401});
   expect(report.go).toBe(false);
   expect(report.bizIssuerVerified).toBe(false);
   expect(report.reason).toBe("BIZPORTAL_AUTH_FALLBACK_INDISTINGUISHABLE");
 });
 it("requires a real authenticated BizPortal attestation even if routes differ",()=>{
   const report=interpretRouteReadiness({portalConfigStatus:401,portalChallengeStatus:401,
     bizIssuerStatus:400,bizNonexistentStatus:404});
   expect(report.go).toBe(false);
   expect(report.reason).toBe("BIZPORTAL_ISSUER_REQUIRES_AUTHENTICATED_ATTESTATION");
 });
 it("checks both origins by GET only, without cookie or redirect following",async()=>{
   const urls=[];
   const statuses=[401,401,401,401];
   const fetchImpl=vi.fn(async(url,options)=>{urls.push(url);
     expect(options).toMatchObject({method:"GET",redirect:"manual",credentials:"omit"});
     return {status:statuses.shift()};
   });
   const result=await probeDevInvoiceRoutes({portalOrigin:"https://portal.dev.example.invalid",
     bizportalOrigin:"https://biz.dev.example.invalid",fetchImpl});
   expect(urls).toHaveLength(4);
   expect(result.go).toBe(false);
 });
 it("refuses untrusted origin URL without sending any request",async()=>{
   const fetchImpl=vi.fn();
   await expect(probeDevInvoiceRoutes({portalOrigin:"http://portal.dev.example.invalid",
     bizportalOrigin:"https://biz.dev.example.invalid",fetchImpl})).rejects.toThrow("INVALID_DEV_ORIGIN");
   expect(fetchImpl).not.toHaveBeenCalled();
 });
});