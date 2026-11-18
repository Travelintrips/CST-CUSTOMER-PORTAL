/**
 * Optional DEV-only browser handshake for Customer Invoice issuance.
 * Uses original Portal auth headers and original BizPortal signed session:
 *
 * 1. Portal opens a blank popup directly in the click event (popup-safe).
 * 2. Portal mints HMAC Invoice challenge scoped to its signed admin.
 * 3. Popup navigates to BizPortal top-level URL; SameSite=Lax signed cookie
 *    is sent to its own origin (never copied to the Portal).
 * 4. BizPortal authenticates Super Admin and sends short-lived Ed25519 proof
 *    via postMessage only to the configured Portal origin.
 * 5. Caller sends challenge+proof with its original Portal JWT.
 *
 * No tokens, cookies or credentials are put in localStorage or logged.
 * This helper is NEVER called unless the frontend build opts in explicitly.
 */
type PortalAuthHeaders = Record<string,string>;
type ChallengeResult = {
  challenge: string;
  expiresInSeconds: number;
};
type ConfigResult = {
  required: boolean;
  bizportalOrigin?: string;
};
type BizPortalProofMessage = {
  type: "CST_INVOICE_BIZPORTAL_ATTEST_V1";
  challenge: string;
  proof: string;
};

async function getJson(path:string,headers:PortalAuthHeaders) {
  const response = await fetch(path,{credentials:"include",cache:"no-store",headers});
  const body = await response.json().catch(()=>({}));
  if (!response.ok) {
    throw Error(body.message??"Otorisasi Super Admin BizPortal belum tersedia.");
  }
  return body;
}
function approvedOrigin(raw:unknown):string {
  if(typeof raw!=="string")throw Error("Alamat BizPortal DEV belum ditentukan.");
  let origin:URL;
  try{origin=new URL(raw);}
  catch{throw Error("Alamat BizPortal DEV tidak valid.");}
  if(origin.origin!==raw ||
     !(origin.protocol==="https:" ||
       (origin.protocol==="http:"&&origin.hostname==="127.0.0.1"))) {
    throw Error("Alamat BizPortal DEV tidak tepercaya.");
  }
  return origin.origin;
}

function awaitProof(popup:Window,origin:string,challenge:string):Promise<string>{
  return new Promise((resolve,reject)=>{
    let done=false;
    const finish=(error:Error|null,value?:string)=>{
      if(done)return;
      done=true;
      window.removeEventListener("message",handleMessage);
      window.clearTimeout(expiry);
      window.clearInterval(closed);
      if(error)reject(error);
      else resolve(value??"");
    };
    const handleMessage=(event:MessageEvent<BizPortalProofMessage>)=>{
      if(event.source!==popup || event.origin!==origin)return;
      const msg=event.data;
      if(!msg || msg.type!=="CST_INVOICE_BIZPORTAL_ATTEST_V1" ||
         msg.challenge!==challenge ||
         typeof msg.proof!=="string" || msg.proof.length<60 || msg.proof.length>1700)return;
      finish(null,msg.proof);
    };
    window.addEventListener("message",handleMessage);
    const expiry=window.setTimeout(()=>finish(
      Error("Verifikasi BizPortal kedaluwarsa. Silakan ulangi penerbitan Invoice.")),90_000);
    const closed=window.setInterval(()=>{
      if(popup.closed)finish(Error("Jendela verifikasi BizPortal ditutup sebelum selesai."));
    },500);
  });
}

export async function requestBizPortalInvoiceProof(
  invoiceId:number,authHeaders:PortalAuthHeaders,
):Promise<{bizportalInvoiceChallenge:string;bizportalInvoiceProof:string}>{
  if(!Number.isSafeInteger(invoiceId)||invoiceId<=0)throw Error("ID Invoice tidak valid.");
  // This MUST run from the synchronous user click path, not after an await.
  const popup=window.open("about:blank","_blank","width=540,height=670");
  if(!popup)throw Error("Popup BizPortal diblokir. Izinkan popup untuk melakukan verifikasi.");
  try{
    const config=await getJson("/api/portal/admin/accounting/attestation-config",authHeaders)
      as ConfigResult;
    if(config.required!==true)
      throw Error("Verifikasi lintas aplikasi belum diaktifkan secara konsisten di DEV.");
    const origin=approvedOrigin(config.bizportalOrigin);
    const response=await getJson(
      "/api/portal/admin/invoices/"+invoiceId+"/accounting-challenge",authHeaders,
    ) as ChallengeResult;
    const challenge=response.challenge;
    if(typeof challenge!=="string"||challenge.length<60||challenge.length>1600)
      throw Error("Challenge Invoice tidak valid.");
    const proofPromise=awaitProof(popup,origin,challenge);
    popup.location.replace(origin+"/api/auth/dev/customer-invoice-attestation?challenge="+
      encodeURIComponent(challenge));
    const proof=await proofPromise;
    return {bizportalInvoiceChallenge:challenge,bizportalInvoiceProof:proof};
  }finally{
    if(!popup.closed)popup.close();
  }
}
