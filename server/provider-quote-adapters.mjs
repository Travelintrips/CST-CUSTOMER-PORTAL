// DEV-only quote adapters. Not mounted into routes: no bookings or financial writes.
const DELIVEREE_SANDBOX = "https://api.sandbox.deliveree.com/public_api/v10/deliveries/get_quote";
const CARGOFIVE_QA = "https://coreapp-qa.cargofive.com/api/v1/public/rates";

export const PARTNERS = Object.freeze({
  deliveree: { mode: "road", quote: "sandbox-adapter", booking: false },
  cargofive: { mode: "ocean", quote: "sandbox-adapter", booking: false },
  cargoai: { mode: "air", quote: "pending-api-contract", booking: false },
});

function guard(env, key) {
  if (env.APP_ENV !== "development" || env.NODE_ENV === "production" ||
    env.CUSTOMER_PORTAL_PROVIDER_QUOTES_ENABLED_DEV !== "true") {
    throw new Error("Partner quote adapter disabled");
  }
  const credential = String(env[key] ?? "").trim();
  if (!credential) throw new Error("Partner sandbox credential missing");
  return credential;
}

async function requestJson(url, init, fetcher) {
  const response = await fetcher(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const err = new Error("Partner quote sandbox request failed");
    err.statusCode = response.status === 429 ? 429 : 502;
    throw err;
  }
  const data = await response.json();
  if (data === null || typeof data !== "object") throw new Error("Partner response invalid");
  return data;
}

export async function delivereeQuote({ locations, vehicleTypeId }, { env = process.env, fetcher = fetch } = {}) {
  const key = guard(env, "DELIVEREE_SANDBOX_API_KEY");
  if (!Array.isArray(locations) || locations.length < 2 || locations.length > 23 ||
      locations.some(x => typeof x?.address !== "string" || !x.address.trim())) {
    throw new Error("Invalid pickup/dropoff locations");
  }
  if (!Number.isSafeInteger(vehicleTypeId) || vehicleTypeId <= 0)
    throw new Error("Invalid vehicle type");
  return requestJson(DELIVEREE_SANDBOX, {
    method: "POST",
    headers: { Authorization: key, "Content-Type": "application/json", "Accept-Language": "id" },
    body: JSON.stringify({ time_type: "now", vehicle_type_id: vehicleTypeId,
      locations: locations.map(x => ({ address: x.address.trim() })) }),
  }, fetcher);
}

export async function cargofiveQuote({ originId, destinationId, type, cargoDetails, departureDate },
  { env = process.env, fetcher = fetch } = {}) {
  const key = guard(env, "CARGOFIVE_SANDBOX_API_KEY");
  if (![originId, destinationId].every(x => Number.isSafeInteger(x) && x > 0) ||
      !["FCL","LCL"].includes(type) ||
      !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(departureDate) ||
      !/^[a-zA-Z0-9.,_-]{1,128}$/.test(cargoDetails)) {
    throw new Error("Invalid ocean quote parameters");
  }
  const url = new URL(CARGOFIVE_QA);
  for (const [k,v] of Object.entries({ origins: originId, destinations: destinationId,
    type, cargo_details: cargoDetails, departure_date: departureDate, api_providers: "-1" }))
    url.searchParams.set(k, String(v));
  return requestJson(url.href, { method: "GET",
    headers: { "x-api-key": key, Accept: "application/json" } }, fetcher);
}

export function cargoaiReadiness() {
  return { ready: false, mode: "air", reason: "PARTNER_API_CONTRACT_REQUIRED" };
}
