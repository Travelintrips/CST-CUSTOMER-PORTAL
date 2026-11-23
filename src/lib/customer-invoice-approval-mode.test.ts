import { describe,expect,it } from "vitest";
import { selectCustomerInvoiceApprovalMode } from "./customer-invoice-approval-mode";

describe("CST-DEV Customer Invoice UI uses only authenticated server capabilities",()=>{
  it("shows Owner handoff only when both independent gates are true",()=>{
    expect(selectCustomerInvoiceApprovalMode({required:true,ownerHandoff:true})).toBe("handoff");
  });
  it("retains old action only with explicit server-required=false",()=>{
    expect(selectCustomerInvoiceApprovalMode({required:false,ownerHandoff:false})).toBe("legacy");
    expect(selectCustomerInvoiceApprovalMode({required:false,ownerHandoff:true})).toBe("legacy");
  });
  it("fails closed if the Owner handoff is not enabled",()=>{
    expect(selectCustomerInvoiceApprovalMode({required:true,ownerHandoff:false})).toBe("unavailable");
    expect(selectCustomerInvoiceApprovalMode({required:true})).toBe("unavailable");
  });
  it("never accepts missing, failed, malformed, or string-valued config",()=>{
    for(const input of [null,undefined,{},[],true,"true",{required:"true",ownerHandoff:true},
      {required:true,ownerHandoff:"true"},{required:1,ownerHandoff:true}]){
      expect(selectCustomerInvoiceApprovalMode(input)).toBe("unavailable");
    }
  });
});
