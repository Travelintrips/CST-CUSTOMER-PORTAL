/**
 * Signed Invoice authorisation needs the selected public DEV BizPortal host.
 * The separate VPS payroll staging hostname has HTTP Basic Auth and must not
 * silently become a second login for the Invoice popup.
 *
 * The local-only QA origin remains supported for disposable browser tests.
 * No PROD route, session, password, or financial writer is changed here.
 */
export function resolveTrustedBizPortalInvoiceOrigin(value) {
  if(typeof value!=="string" || value!==value.trim())return null;
  let parsed;
  try{parsed=new URL(value);}
  catch{return null;}
  if(parsed.origin!==value || parsed.username || parsed.password ||
     parsed.search || parsed.hash || parsed.pathname!=="/")return null;
  if(parsed.protocol==="https:" &&
     parsed.hostname==="dev-bizportal.cstlogistic.co.id" &&
     parsed.port==="")return parsed.origin;
  if(parsed.protocol==="http:" &&
     parsed.hostname==="127.0.0.1")return parsed.origin;
  return null;
}
