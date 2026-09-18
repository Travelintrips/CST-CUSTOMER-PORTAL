import { query } from "./db.mjs";

function fail(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function numeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rateMap(row) {
  return {
    bmMfn: row.bm_mfn == null ? null : String(row.bm_mfn),
    preferensial: {
      ACFTA: row.bm_acfta == null ? null : String(row.bm_acfta),
      AFTA: row.bm_afta == null ? null : String(row.bm_afta),
      AIFTA: row.bm_aifta == null ? null : String(row.bm_aifta),
      AANZFTA: row.bm_aanzfta == null ? null : String(row.bm_aanzfta),
      AHKFTA: row.bm_ahkfta == null ? null : String(row.bm_ahkfta),
      ASFTA: row.bm_asfta == null ? null : String(row.bm_asfta),
      AKFTA: row.bm_akfta == null ? null : String(row.bm_akfta),
      IAFTA: row.bm_indonesia_australia == null ? null : String(row.bm_indonesia_australia),
    },
    ppn: row.ppn_rate == null ? null : String(row.ppn_rate),
    ppnbm: row.ppnbm_rate == null ? null : String(row.ppnbm_rate),
    pph22Api: row.pph22_rate == null ? null : String(row.pph22_rate),
    pph22NonApi: row.pph22_non_api == null ? null : String(row.pph22_non_api),
  };
}

function tariffResponse(row) {
  return {
    hsCode: row.hs_code,
    descriptionId: row.description_id,
    descriptionEn: row.description_en ?? null,
    unit: row.unit ?? null,
    category: row.category ?? null,
    tariff: rateMap(row),
    lartas: {
      import: Boolean(row.lartas_import),
      description: row.lartas_desc ?? null,
      regulatorImport: row.regulator_import ?? null,
      perizinanImport: row.perizinan_import ?? null,
    },
  };
}

function normalizedKey(value) {
  return String(value ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function canonicalRateValue(rows, serviceType, aliases, selector) {
  const serviceKey = normalizedKey(serviceType);
  const aliasKeys = new Set(aliases.map(normalizedKey));
  const row = rows.find((candidate) =>
    normalizedKey(candidate.service_type) === serviceKey
    && aliasKeys.has(normalizedKey(candidate.rate_key))
    && (!selector || selector(candidate)),
  );
  return row?.value_amount == null ? null : numeric(row.value_amount, NaN);
}

function requireCanonicalRate(value, label) {
  if (!Number.isFinite(value)) {
    fail(503, `Canonical rate calculator belum dikonfigurasi: ${label}.`);
  }
  return value;
}

async function canonicalCalculatorRates() {
  const result = await query(
    `select rc.service_type, rs.rate_key, rs.value_amount,
            rs.container_type, rs.vehicle_type
       from public.logistics_rate_cards rc
       join public.logistics_service_rates rs on rs.rate_card_id = rc.id
      where rc.is_active = true
        and (rc.valid_from is null or rc.valid_from <= now())
        and (rc.valid_to is null or rc.valid_to >= now())
      order by rc.updated_at desc nulls last, rc.id, rs.sort_order, rs.id`,
  );
  const rows = result.rows;
  if (!rows.length) {
    fail(503, "Canonical rate calculator belum dikonfigurasi.");
  }

  const value = (serviceType, aliases, label, selector) =>
    requireCanonicalRate(
      canonicalRateValue(rows, serviceType, aliases, selector),
      label,
    );
  const containerValue = (containerType) => value(
    "seaFreight",
    ["ratePerContainer", "containerRate"],
    `seaFreight.ratePerContainer.${containerType}`,
    (row) => normalizedKey(row.container_type) === normalizedKey(containerType),
  );
  const vehicleValue = (vehicleType) => value(
    "trucking",
    ["vehicleRate", "ratePerVehicle"],
    `trucking.vehicleRates.${vehicleType}`,
    (row) => normalizedKey(row.vehicle_type) === normalizedKey(vehicleType),
  );

  return {
    airFreight: {
      ratePerKg: value("airFreight", ["ratePerKg"], "airFreight.ratePerKg"),
      fuelSurchargePct: value("airFreight", ["fuelSurchargePct"], "airFreight.fuelSurchargePct"),
      securityFeePerKg: value("airFreight", ["securityFeePerKg"], "airFreight.securityFeePerKg"),
      handlingFee: value("airFreight", ["handlingFee"], "airFreight.handlingFee"),
      awbFee: value("airFreight", ["awbFee"], "airFreight.awbFee"),
      documentationFee: value("airFreight", ["documentationFee", "docFee"], "airFreight.documentationFee"),
      insurancePct: value("airFreight", ["insurancePct", "insurancePercent"], "airFreight.insurancePct"),
      ppnPct: value("airFreight", ["ppnPct", "ppnPercent"], "airFreight.ppnPct"),
    },
    seaFreight: {
      ratePerCbmLcl: value("seaFreight", ["ratePerCbmLcl", "lclRatePerCbm"], "seaFreight.ratePerCbmLcl"),
      ratePerContainer: {
        "20GP": containerValue("20GP"),
        "40GP": containerValue("40GP"),
        "40HC": containerValue("40HC"),
        Reefer: containerValue("Reefer"),
        "Open Top": containerValue("Open Top"),
        "Flat Rack": containerValue("Flat Rack"),
      },
      thc: value("seaFreight", ["thc"], "seaFreight.thc"),
      documentationFee: value("seaFreight", ["documentationFee", "docFee"], "seaFreight.documentationFee"),
      customsClearance: value("seaFreight", ["customsClearance"], "seaFreight.customsClearance"),
      truckingFee: value("seaFreight", ["truckingFee"], "seaFreight.truckingFee"),
      insurancePct: value("seaFreight", ["insurancePct", "insurancePercent"], "seaFreight.insurancePct"),
      ppnPct: value("seaFreight", ["ppnPct", "ppnPercent"], "seaFreight.ppnPct"),
    },
    customs: {
      jasaPpjk: value("customs", ["jasaPpjk"], "customs.jasaPpjk"),
      customsHandling: value("customs", ["customsHandling"], "customs.customsHandling"),
      documentProcessing: value("customs", ["documentProcessing"], "customs.documentProcessing"),
      pibSubmission: value("customs", ["pibSubmission"], "customs.pibSubmission"),
      courierFee: value("customs", ["courierFee"], "customs.courierFee"),
      additionalServiceFee: value("customs", ["additionalServiceFee"], "customs.additionalServiceFee"),
    },
    domestic: {
      vehicleRates: {
        pickup: vehicleValue("pickup"),
        blindVan: vehicleValue("blindVan"),
        CDE: vehicleValue("CDE"),
        CDD: vehicleValue("CDD"),
        Fuso: vehicleValue("Fuso"),
        Wingbox: vehicleValue("Wingbox"),
        "Trailer 20FT": vehicleValue("Trailer 20FT"),
        "Trailer 40FT": vehicleValue("Trailer 40FT"),
      },
      distanceRatePerKm: value("trucking", ["distanceRatePerKm"], "trucking.distanceRatePerKm"),
      loadingFee: value("trucking", ["loadingFee"], "trucking.loadingFee"),
      unloadingFee: value("trucking", ["unloadingFee"], "trucking.unloadingFee"),
      overnightFee: value("trucking", ["overnightFee"], "trucking.overnightFee"),
      helperFeePerDay: value("trucking", ["helperFeePerDay"], "trucking.helperFeePerDay"),
    },
    warehousing: {
      palletRatePerDay: value("warehousing", ["palletRatePerDay"], "warehousing.palletRatePerDay"),
      cbmRatePerDay: value("warehousing", ["cbmRatePerDay"], "warehousing.cbmRatePerDay"),
      sqmRatePerDay: value("warehousing", ["sqmRatePerDay"], "warehousing.sqmRatePerDay"),
      inboundFee: value("warehousing", ["inboundFee"], "warehousing.inboundFee"),
      outboundFeePerPallet: value("warehousing", ["outboundFeePerPallet"], "warehousing.outboundFeePerPallet"),
      inventoryFeePerMonth: value("warehousing", ["inventoryFeePerMonth"], "warehousing.inventoryFeePerMonth"),
    },
    source: "logistics_rate_cards",
  };
}

async function currencyRates() {
  const result = await query(
    `select currency_code, rate_to_idr
       from public.currency_rates
      where is_active = true
      order by currency_code`,
  );
  const rates = { IDR: 1 };
  for (const row of result.rows) rates[row.currency_code] = numeric(row.rate_to_idr, 1);
  return {
    rates,
    source: "currency_rates",
    sourceLabel: "Canonical currency rates",
    updatedAt: new Date().toISOString(),
  };
}

async function findTariff(hsCode) {
  const result = await query(
    `select *
       from public.btki_tariff
      where hs_code = $1 or hs_code_6 = $1 or hs_code_4 = $1 or hs_code_2 = $1
      order by length(hs_code) desc
      limit 1`,
    [hsCode],
  );
  return result.rows[0] ?? null;
}

function selectedBm(row, scheme) {
  const schemeColumns = {
    ACFTA: "bm_acfta",
    AFTA: "bm_afta",
    AIFTA: "bm_aifta",
    AANZFTA: "bm_aanzfta",
    AHKFTA: "bm_ahkfta",
    ASFTA: "bm_asfta",
    AKFTA: "bm_akfta",
    IAFTA: "bm_indonesia_australia",
  };
  const preferred = schemeColumns[scheme] ? numeric(row[schemeColumns[scheme]], NaN) : NaN;
  if (Number.isFinite(preferred)) return { rate: preferred, scheme };
  return { rate: numeric(row.bm_mfn, 0), scheme: "MFN" };
}

async function calculateImport(body) {
  const hsCode = String(body.hsCode ?? "").trim();
  const goodsValue = numeric(body.goodsValue, NaN);
  if (!hsCode || !Number.isFinite(goodsValue) || goodsValue <= 0) {
    fail(400, "HS Code dan nilai barang wajib diisi.");
  }
  const tariff = await findTariff(hsCode);
  if (!tariff) fail(404, "HS Code tidak ditemukan di BTKI canonical.");
  const currencies = await currencyRates();
  const currency = String(body.currency ?? "USD").toUpperCase();
  const exchangeRate = currency === "IDR" ? 1 : currencies.rates[currency];
  if (!exchangeRate) fail(400, `Kurs ${currency} tidak tersedia.`);
  const incoterm = String(body.incoterm ?? "CIF").toUpperCase();
  const freightCostIDR = Math.max(0, numeric(body.freightCostIDR));
  const insurancePct = Math.max(0, numeric(body.insurancePct, 0.5));
  const goodsValueIDR = goodsValue * exchangeRate;
  const insurance = ["FOB", "EXW", "CNF"].includes(incoterm)
    ? goodsValueIDR * insurancePct / 100
    : goodsValueIDR * insurancePct / 100;
  const cif = ["CIF", "DAP", "DDP"].includes(incoterm)
    ? goodsValueIDR
    : goodsValueIDR + freightCostIDR + insurance;
  const bm = selectedBm(tariff, body.preferentialScheme);
  const bmAmount = cif * bm.rate / 100;
  const ppnbmRate = numeric(tariff.ppnbm_rate);
  const ppnbmAmount = (cif + bmAmount) * ppnbmRate / 100;
  const ppnRate = numeric(tariff.ppn_rate, 11);
  const ppnAmount = (cif + bmAmount + ppnbmAmount) * ppnRate / 100;
  const pphRate = numeric(body.isApi ? tariff.pph22_rate : tariff.pph22_non_api, numeric(tariff.pph22_rate));
  const pphAmount = (cif + bmAmount) * pphRate / 100;
  const totalDuties = bmAmount + ppnAmount + ppnbmAmount + pphAmount;
  const result = {
    hs: {
      code: tariff.hs_code,
      descriptionId: tariff.description_id,
      descriptionEn: tariff.description_en ?? null,
      unit: tariff.unit ?? null,
      category: tariff.category ?? null,
    },
    input: {
      goodsValue,
      currency,
      exchangeRate,
      goodsValueIDR,
      incoterm,
      freightCostIDR,
      insurancePct,
      isApi: Boolean(body.isApi),
      preferentialScheme: body.preferentialScheme ?? "",
      incotermNote: `Basis ${incoterm}`,
    },
    ndpbm: exchangeRate,
    rates: {
      bm: `${bm.rate}%`,
      bmRate: bm.rate,
      bmScheme: bm.scheme,
      ppn: `${ppnRate}%`,
      ppnRate,
      ppnbm: `${ppnbmRate}%`,
      ppnbmRate,
      pph: `${pphRate}%`,
      pphRate,
    },
    duties: {
      bm: bmAmount,
      ppn: ppnAmount,
      ppnbm: ppnbmAmount,
      pph: pphAmount,
      totalDuties,
      effectiveRate: `${cif ? (totalDuties / cif * 100).toFixed(2) : "0"}%`,
    },
    ddp: cif + totalDuties,
    lartas: {
      hasLartas: Boolean(tariff.lartas_import),
      description: tariff.lartas_desc ?? null,
      regulator: tariff.regulator_import ?? null,
      perizinan: tariff.perizinan_import ?? null,
    },
    preferential: rateMap(tariff).preferensial,
    source: "btki_tariff",
    btkiLink: `https://www.insw.go.id/intr`,
    inswLink: `https://www.insw.go.id/intr`,
  };
  return result;
}

export async function handleToolRoute({ request, response, url, body, sendJson, sendError }) {
  try {
    if (
      url.pathname === "/api/ai-translate"
      || url.pathname === "/api/ai-translate/batch"
    ) {
      sendError(response, 503, "Translation provider is not configured for the standalone portal.");
      return true;
    }
    if (request.method === "GET" && url.pathname === "/api/import-calculator/rates") {
      sendJson(response, 200, await currencyRates());
      return true;
    }
    if (request.method === "GET" && url.pathname === "/api/btki/search") {
      const search = (url.searchParams.get("q") ?? "").trim();
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 15)));
      if (search.length < 2) {
        sendJson(response, 200, { results: [] });
        return true;
      }
      const result = await query(
        `select *
           from public.btki_tariff
          where hs_code ilike $1
             or description_id ilike $1
             or coalesce(description_en, '') ilike $1
          order by case when hs_code = $2 then 0 when hs_code like $3 then 1 else 2 end,
                   hs_code
          limit $4`,
        [`%${search}%`, search, `${search}%`, limit],
      );
      sendJson(response, 200, { results: result.rows.map(tariffResponse) });
      return true;
    }
    if (request.method === "POST" && url.pathname === "/api/import-calculator/calculate") {
      sendJson(response, 200, await calculateImport(body));
      return true;
    }
    if (request.method === "POST" && url.pathname === "/api/import-calculator/multi-calculate") {
      const items = Array.isArray(body.items) ? body.items : [];
      if (!items.length) fail(400, "Minimal satu item diperlukan.");
      const results = await Promise.all(items.map(async (item) => {
        try {
          return { ...(await calculateImport({ ...body, ...item })), label: item.label ?? item.hsCode, ok: true };
        } catch (error) {
          return { label: item.label ?? item.hsCode, ok: false, error: error.message };
        }
      }));
      sendJson(response, 200, { results, rateSource: "btki_tariff" });
      return true;
    }
    if (request.method === "GET" && url.pathname === "/api/portal/calculator-rates-v2") {
      sendJson(response, 200, await canonicalCalculatorRates());
      return true;
    }
    return false;
  } catch (error) {
    if (error.statusCode) sendError(response, error.statusCode, error.message);
    else throw error;
    return true;
  }
}