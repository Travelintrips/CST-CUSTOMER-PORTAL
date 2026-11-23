/**
 * DEV-only explicit Super Admin consent for their own CST company affiliation.
 * Reuses the existing Portal JWT and the independently signed BizPortal
 * session. Popup proof is bound to request ID/tenant and never stored.
 */
type Headers=Record<string,string>;
type ProofMessage={
  type:"CST_COMPANY_SELF_APPROVAL_BIZPORTAL_V1";
  challenge:string;proof:string;
};
function trustedOrigin(input:unknown):string {
  if(typeof input!=="string")throw Error("BizPortal DEV belum dikonfigurasi.");
  let u:URL;
  try{u=new URL(input);}catch{throw Error("Alamat BizPortal DEV tidak valid.");}
  if(u.origin!==input || u.username || u.password ||
     !(u.protocol==="https:"||(u.protocol==="http:"&&u.hostname==="127.0.0.1")))
    throw Error("Alamat BizPortal DEV tidak tepercaya.");
  return u.origin;
}
function awaitProof(popup:Window,origin:string,challenge:string):Promise<string> {
  return new Promise((resolve,reject)=>{
    let finished=false;
    const finish=(error:Error|null,proof?:string)=>{
      if(finished)return;
      finished=true;
      window.removeEventListener("message",onMessage);
      window.clearTimeout(timeout);
      window.clearInterval(closed);
      if(error)reject(error);else resolve(proof??"");
    };
    const onMessage=(event:MessageEvent<ProofMessage>)=>{
      if(event.source!==popup||event.origin!==origin)return;
      const m=event.data;
      if(!m||m.type!=="CST_COMPANY_SELF_APPROVAL_BIZPORTAL_V1"||
         m.challenge!==challenge||typeof m.proof!=="string"||
         m.proof.length<60||m.proof.length>1700)return;
      finish(null,m.proof);
    };
    window.addEventListener("message",onMessage);
    const timeout=window.setTimeout(()=>finish(
      Error("Verifikasi Super Admin kedaluwarsa. Silakan ulangi.")),90000);
    const closed=window.setInterval(()=>{
      if(popup.closed)finish(Error("Jendela verifikasi BizPortal ditutup."));
    },500);
  });
}
export async function requestBizPortalCompanySelfApprovalProof(
  requestId:number,companyId:number,headers:Headers,
):Promise<{selfApprovalChallenge:string;selfApprovalProof:string}> {
  if(!Number.isSafeInteger(requestId)||requestId<1||companyId!==1)
    throw Error("Permohonan afiliasi CST tidak valid.");
  // Open synchronously from an explicit user click, before any await.
  const popup=window.open("about:blank","_blank","width=540,height=670");
  if(!popup)throw Error("Izinkan popup BizPortal untuk verifikasi Super Admin.");
  try {
    const res=await fetch(
      "/api/portal/admin/company-requests/"+requestId+
      "/self-approval-challenge?companyId="+companyId,{
        credentials:"include",cache:"no-store",headers,
      });
    const body=await res.json().catch(()=>({}));
    if(!res.ok)throw Error(body.message??"Persetujuan mandiri belum diizinkan.");
    const challenge=body.challenge;
    if(typeof challenge!=="string"||challenge.length<60||challenge.length>1600)
      throw Error("Challenge afiliasi tidak valid.");
    const origin=trustedOrigin(body.bizportalOrigin);
    const proofPromise=awaitProof(popup,origin,challenge);
    popup.location.replace(origin+
      "/api/auth/dev/customer-company-self-approval?challenge="+
      encodeURIComponent(challenge));
    return {
      selfApprovalChallenge:challenge,
      selfApprovalProof:await proofPromise,
    };
  }finally{
    if(!popup.closed)popup.close();
  }
}
