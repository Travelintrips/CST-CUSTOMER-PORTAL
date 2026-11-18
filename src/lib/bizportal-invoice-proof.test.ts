// @ts-nocheck — test-only simulated popup surfaces, no real accounts.
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {requestBizPortalInvoiceProof} from "./bizportal-invoice-proof";
const origin="https://bizportal-qa.example.invalid";
const challenge="qa-signed-challenge."+"z".repeat(90);
const proof="qa-ed25519-proof."+"q".repeat(120);
let listeners;
let popup;
let win;
const json=(body,status=200)=>({ok:status>=200&&status<300,status,
  json:async()=>body});
const setup=(config={required:true,bizportalOrigin:origin})=>{
  listeners=new Set();
  popup={
    closed:false,
    close:vi.fn(function(){popup.closed=true;}),
    location:{replace:vi.fn()},
  };
  win={
    open:vi.fn(()=>popup),
    addEventListener:vi.fn((_type,callback)=>listeners.add(callback)),
    removeEventListener:vi.fn((_type,callback)=>listeners.delete(callback)),
    setTimeout:globalThis.setTimeout,
    clearTimeout:globalThis.clearTimeout,
    setInterval:globalThis.setInterval,
    clearInterval:globalThis.clearInterval,
  };
  vi.stubGlobal("window",win);
  vi.stubGlobal("fetch",vi.fn(async path=>{
    if(String(path).includes("attestation-config"))return json(config);
    if(String(path).includes("accounting-challenge"))return json({challenge,expiresInSeconds:90});
    throw Error("unexpected QA request");
  }));
  return popup;
};
beforeEach(()=>setup());
afterEach(()=>{vi.unstubAllGlobals();});
describe("DEV-only original Invoice button BizPortal signed proof popup",()=>{
  it("opens synchronously, verifies exact origin/source/challenge, returns proof and closes",async()=>{
    popup.location.replace.mockImplementation(()=>{
      // Different origin and different source MUST NOT be trusted.
      for(const fn of [...listeners]){
        fn({origin:"https://evil.invalid",source:popup,data:{type:"CST_INVOICE_BIZPORTAL_ATTEST_V1",challenge,proof:"bad"}});
        fn({origin,source:{},data:{type:"CST_INVOICE_BIZPORTAL_ATTEST_V1",challenge,proof:"bad"}});
        fn({origin,source:popup,data:{type:"CST_INVOICE_BIZPORTAL_ATTEST_V1",challenge:"wrong",proof:"bad"}});
        fn({origin,source:popup,data:{type:"CST_INVOICE_BIZPORTAL_ATTEST_V1",challenge,proof}});
      }
    });
    const resultPromise=requestBizPortalInvoiceProof(77,{Authorization:"Bearer QA"});
    expect(win.open).toHaveBeenCalledTimes(1); // synchronous click
    const result=await resultPromise;
    expect(result).toEqual({bizportalInvoiceChallenge:challenge,bizportalInvoiceProof:proof});
    expect(popup.location.replace).toHaveBeenCalledWith(
      origin+"/api/auth/dev/customer-invoice-attestation?challenge="+encodeURIComponent(challenge));
    expect(popup.close).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(0);
  });
  it("blocks popup opening failures before any HTTP request",async()=>{
    win.open.mockReturnValue(null);
    await expect(requestBizPortalInvoiceProof(77,{})).rejects.toThrow("Popup BizPortal diblokir");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("refuses non-HTTPS or non-exact configured BizPortal origins",async()=>{
    for(const unsafe of ["http://evil.invalid","https://evil.invalid/path","javascript:alert(1)"]){
      setup({required:true,bizportalOrigin:unsafe});
      await expect(requestBizPortalInvoiceProof(77,{})).rejects.toThrow("BizPortal DEV");
      expect(popup.close).toHaveBeenCalledTimes(1);
    }
  });
  it("requires server-side authorization mode to be enabled",async()=>{
    setup({required:false});
    await expect(requestBizPortalInvoiceProof(77,{})).rejects.toThrow("belum diaktifkan");
    expect(popup.close).toHaveBeenCalledTimes(1);
  });
  it("rejects an invalid Invoice ID without a popup",async()=>{
    await expect(requestBizPortalInvoiceProof(0,{})).rejects.toThrow("ID Invoice tidak valid");
    expect(win.open).not.toHaveBeenCalled();
  });
  it("rejects a missing challenge and closes popup without leaking proof",async()=>{
    vi.stubGlobal("fetch",vi.fn(async path=>String(path).includes("attestation-config")
      ? json({required:true,bizportalOrigin:origin})
      : json({challenge:""})));
    await expect(requestBizPortalInvoiceProof(77,{})).rejects.toThrow("Challenge Invoice tidak valid");
    expect(popup.close).toHaveBeenCalledTimes(1);
  });
});
