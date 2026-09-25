const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 90;
const buckets = new Map();

function clientKey(request) {
  const forwarded = request.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim();
  return raw || request.socket?.remoteAddress || "unknown";
}

function rateLimited(request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

function mapsApiKey() {
  return (
    process.env.CUSTOMER_PORTAL_GOOGLE_MAPS_API_KEY
    ?? process.env.GOOGLE_MAPS_API_KEY
    ?? ""
  ).trim();
}

async function fetchGoogleJson(url, timeoutMs = 7_000) {
  const upstream = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!upstream.ok) {
    const error = new Error(`Google Maps upstream returned ${upstream.status}`);
    error.statusCode = 502;
    throw error;
  }
  return upstream.json();
}

function ensureConfigured(sendJson, response) {
  const key = mapsApiKey();
  if (!key) {
    sendJson(response, 503, {
      error: "Google Maps API key not configured",
      code: "GOOGLE_MAPS_NOT_CONFIGURED",
    });
    return null;
  }
  return key;
}

export async function handleGoogleMapsRoute({ request, response, url, sendJson }) {
  const { pathname, searchParams } = url;
  if (!pathname.startsWith("/api/places/")) return false;

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  }

  if (rateLimited(request)) {
    sendJson(response, 429, { error: "Terlalu banyak permintaan Maps. Coba lagi sebentar." });
    return true;
  }

  const key = ensureConfigured(sendJson, response);
  if (!key) return true;

  if (pathname === "/api/places/autocomplete") {
    const input = (searchParams.get("input") ?? "").trim();
    const country = (searchParams.get("country") ?? "id").trim().toLowerCase();

    if (input.length < 2) {
      sendJson(response, 400, { predictions: [] });
      return true;
    }
    if (input.length > 256 || !/^[a-z]{2}$/i.test(country)) {
      sendJson(response, 400, { predictions: [] });
      return true;
    }

    const params = new URLSearchParams({
      input,
      key,
      language: "id",
      types: "geocode|establishment",
      components: `country:${country}`,
    });

    try {
      const data = await fetchGoogleJson(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
        6_000,
      );
      if (!["OK", "ZERO_RESULTS"].includes(data?.status)) {
        console.warn("[customer-portal-api] Google Places autocomplete failed", data?.status, data?.error_message ?? "");
        sendJson(response, 502, { predictions: [] });
        return true;
      }
      sendJson(
        response,
        200,
        { predictions: Array.isArray(data.predictions) ? data.predictions : [] },
        { "Cache-Control": "public, max-age=60" },
      );
    } catch (error) {
      console.error("[customer-portal-api] Google Places autocomplete error", error?.message ?? error);
      sendJson(response, 502, { predictions: [] });
    }
    return true;
  }

  if (pathname === "/api/places/detail") {
    const placeId = (searchParams.get("place_id") ?? "").trim();
    if (!placeId || placeId.length > 512) {
      sendJson(response, 400, { error: "place_id required" });
      return true;
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key,
      fields: "place_id,formatted_address,name,geometry",
      language: "id",
    });

    try {
      const data = await fetchGoogleJson(
        `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
        6_000,
      );
      const result = data?.result;
      const lat = result?.geometry?.location?.lat;
      const lng = result?.geometry?.location?.lng;
      const address = result?.formatted_address || result?.name || "";

      if (
        data?.status !== "OK"
        || result?.place_id !== placeId
        || !Number.isFinite(lat)
        || !Number.isFinite(lng)
      ) {
        sendJson(response, 404, { error: "Place tidak ditemukan" });
        return true;
      }

      sendJson(
        response,
        200,
        {
          address,
          name: result?.name ?? address,
          placeId: result.place_id,
          lat,
          lng,
        },
        { "Cache-Control": "public, max-age=300" },
      );
    } catch (error) {
      console.error("[customer-portal-api] Google Place detail error", error?.message ?? error);
      sendJson(response, 502, { error: "Google Place detail unavailable" });
    }
    return true;
  }

  if (pathname === "/api/places/distance") {
    const origin = (searchParams.get("origin") ?? "").trim();
    const destination = (searchParams.get("destination") ?? "").trim();

    if (!origin || !destination || origin.length > 512 || destination.length > 512) {
      sendJson(response, 400, { error: "origin and destination required" });
      return true;
    }

    const params = new URLSearchParams({
      origins: origin,
      destinations: destination,
      key,
      language: "id",
      units: "metric",
      mode: "driving",
    });

    try {
      const data = await fetchGoogleJson(
        `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
        8_000,
      );
      const element = data?.rows?.[0]?.elements?.[0];
      if (data?.status !== "OK" || !element || element.status !== "OK") {
        sendJson(response, 200, { distanceKm: null, durationText: null });
        return true;
      }

      const metres = Number(element.distance?.value);
      sendJson(
        response,
        200,
        {
          distanceKm: Number.isFinite(metres) ? Math.round((metres / 1000) * 10) / 10 : null,
          durationText: element.duration?.text ?? null,
        },
        { "Cache-Control": "public, max-age=3600" },
      );
    } catch (error) {
      console.error("[customer-portal-api] Google Distance Matrix error", error?.message ?? error);
      sendJson(response, 502, { error: "Google Distance Matrix unavailable" });
    }
    return true;
  }

  sendJson(response, 404, { error: "Google Maps route not found." });
  return true;
}
