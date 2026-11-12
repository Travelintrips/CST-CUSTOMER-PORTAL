import { Readable } from "node:stream";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
  query: vi.fn(),
  marketplace: vi.fn(),
  verify: vi.fn(() => true),
}));
vi.mock("./db.mjs", () => ({ query: stubs.query }));
vi.mock("./marketplace-service.mjs", () => ({ handleMarketplaceRoute: stubs.marketplace }));
vi.mock("node:crypto", async(importOriginal)=>{
  const actual=await importOriginal<typeof import("node:crypto")>();
  return { ...actual, verify: stubs.verify };
});
import { handleBizPortalActionBridge, verifyBridgeRequest, signatureMessage } from "./bizportal-action-bridge.mjs";

const actorId="5b8a1255-5c22-4973-a1b4-d79aa80c9216";
const requestId="a316fb5e-6f7a-4f12-83fd-12b784d0d6c1";
const target="/api/mkt/admin/rfqs/11/send-to-customer";
const originalEnv={
  app:process.env.APP_ENV,
  node:process.env.NODE_ENV,
  enabled:process.env.PORTAL_BIZPORTAL_BRIDGE_ENABLED,
};
function reqFor(opts={}) {
  const envelope={
    actorUserId: actorId, actorEmail:"admin@dev.test",path:target,body:{quoteId:9},
    ...opts,
  };
  const raw=Buffer.from(JSON.stringify(envelope));
  const request=Readable.from([raw]);
  request.method="POST";
  request.url="/api/internal/bizportal-marketplace/action";
  request.headers={
    "x-cst-bridge-timestamp":String(Date.now()),
    "x-cst-bridge-request-id":requestId,
    "x-cst-bridge-signature":"A".repeat(86),
  };
  return request;
}
async function dispatch(request){
  let outcome;
  await handleBizPortalActionBridge({
    request,
    response:{},
    sendJson:(_response,status,body)=>{outcome={status,body}},
  });
  return outcome;
}
beforeEach(()=>{
  vi.resetAllMocks();
  stubs.verify.mockReturnValue(true);
  process.env.APP_ENV="development";
  process.env.NODE_ENV="development";
  process.env.PORTAL_BIZPORTAL_BRIDGE_ENABLED="true";
  stubs.query.mockImplementation(async(sql)=>{
    const s=String(sql);
    if(s.includes("from public.users"))return {rows:[{id:actorId,email:"admin@dev.test",role:"admin"}],rowCount:1};
    if(s.includes("from public.mkt_rfqs where id"))return {rows:[{id:11}],rowCount:1};
    if(s.includes("from public.portal_customers"))return {rows:[{id:1,email:"dev-admin@dev.local",role:"admin"}],rowCount:1};
    if(s.includes("insert into portal_bridge_private"))return {rows:[{action_id:requestId}],rowCount:1};
    if(s.includes("update portal_bridge_private"))return {rowCount:1,rows:[]};
    throw Error("unexpected SQL: "+s.slice(0,100));
  });
  stubs.marketplace.mockImplementation(async({sendJson,response})=>{
    sendJson(response,200,{ok:true,status:"customer_review"});
    return true;
  });
});
afterEach(()=>{
  for(const [key,val] of [
    ["APP_ENV",originalEnv.app],
    ["NODE_ENV",originalEnv.node],
    ["PORTAL_BIZPORTAL_BRIDGE_ENABLED",originalEnv.enabled],
  ]){if(val===undefined)delete process.env[key];else process.env[key]=val;}
});

describe("DEV BizPortal canonical signed mutation bridge",()=>{
  it("refuses all requests by default",async()=>{
    delete process.env.PORTAL_BIZPORTAL_BRIDGE_ENABLED;
    expect((await dispatch(reqFor())).status).toBe(404);
    expect(stubs.query).not.toHaveBeenCalled();
  });
  it("refuses requests with missing or bad signature",async()=>{
    const request=reqFor();
    request.headers["x-cst-bridge-signature"]="bad";
    expect((await dispatch(request)).status).toBe(401);
    expect(stubs.query).not.toHaveBeenCalled();
  });
  it("signatures include timestamp request id and exact raw payload hash",()=>{
    const raw=Buffer.from("abc");
    expect(signatureMessage("123",requestId,raw)).toMatch(/^123\n[a-f0-9-]+\n[a-f0-9]{64}$/);
  });
  it("rejects stale timestamps and invalid UUID before crypto verification",()=>{
    const bad={timestamp:String(Date.now()-500_000),requestId,signature:"A".repeat(86),rawBody:Buffer.from("{}")};
    expect(verifyBridgeRequest(bad)).toBe(false);
    expect(stubs.verify).not.toHaveBeenCalled();
  });
  it("rejects unsupported action paths without mutations",async()=>{
    expect((await dispatch(reqFor({path:"/api/mkt/admin/rfqs/11/delete"}))).status).toBe(422);
    expect(stubs.query).not.toHaveBeenCalled();
  });
  it("requires verified BizPortal admin identity from DB",async()=>{
    stubs.query.mockImplementationOnce(async()=>({rows:[],rowCount:0}));
    expect((await dispatch(reqFor())).status).toBe(403);
    expect(stubs.marketplace).not.toHaveBeenCalled();
  });
  it("preflights legacy DEV resource scope before writing receipt",async()=>{
    stubs.query.mockImplementationOnce(async()=>({rows:[{id:actorId}],rowCount:1}))
      .mockImplementationOnce(async()=>({rows:[],rowCount:0}));
    expect((await dispatch(reqFor())).status).toBe(404);
    expect(stubs.marketplace).not.toHaveBeenCalled();
  });
  it("executes only canonical Marketplace handler, then saves audit result",async()=>{
    expect((await dispatch(reqFor())).status).toBe(200);
    expect(stubs.marketplace).toHaveBeenCalledOnce();
    expect(stubs.query.mock.calls.some(c=>String(c[0]).includes("insert into portal_bridge_private"))).toBe(true);
    expect(stubs.query.mock.calls.some(c=>String(c[0]).includes("update portal_bridge_private"))).toBe(true);
  });
  it("deduplicates a completed request ID instead of replaying the action",async()=>{
    stubs.query.mockImplementation(async(sql)=>{
      const s=String(sql);
      if(s.includes("from public.users"))return {rows:[{id:actorId}],rowCount:1};
      if(s.includes("from public.mkt_rfqs where id"))return {rows:[{id:11}],rowCount:1};
      if(s.includes("from public.portal_customers"))return {rows:[{id:1,role:"admin"}],rowCount:1};
      if(s.includes("insert into portal_bridge_private"))return {rows:[],rowCount:0};
      if(s.includes("from portal_bridge_private.marketplace_action_receipts"))return {
        rows:[{action_path:target,payload_sha256:stubs.mockPayloadHash??"unset",status:"completed",result_code:200,result_payload:{ok:true,replayed:true}}],
        rowCount:1,
      };
      throw Error("unexpected SQL");
    });
    // For a true match the test must use the same digest supplied to INSERT.
    stubs.query.mockImplementationOnce(async()=>({rows:[{id:actorId}],rowCount:1}))
      .mockImplementationOnce(async()=>({rows:[{id:11}],rowCount:1}))
      .mockImplementationOnce(async()=>({rows:[{id:1,role:"admin"}],rowCount:1}))
      .mockImplementationOnce(async(sql,values)=>{stubs.mockPayloadHash=values[4];return {rowCount:0,rows:[]};});
    const res=await dispatch(reqFor());
    expect(res.status).toBe(200);
    expect(res.body.replayed).toBe(true);
    expect(stubs.marketplace).not.toHaveBeenCalled();
  });
});
