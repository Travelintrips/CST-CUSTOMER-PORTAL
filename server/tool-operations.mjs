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

const DEFAULT_CALCULATOR_RATES = {
  airFreight: {
    ratePerKg: 90000,
    fuelSurchargePct: 25,
    securityFeePerKg: 2000,
    handlingFee: 350000,
    awbFee: 250000,
    documentationFee: 200000,
    insurancePct: 0.15,
    ppnPct: 11,
  },
  seaFreight: {
    ratePerCbmLcl: 2500000,
    ratePerContainer: {
      "20GP": 12000000,
      "40GP": 18000000,
      "40HC": 20000000,
      Reefer: 35000000,
      "Open Top": 25000000,
      "Flat Rack": 28000000,
    },
    thc: 1500000,
    documentationFee: 750000,
    customsClearance: 1500000,
    truckingFee: 1200000,
    insurancePct: 0.1,
    ppnPct: 11,
  },
  customs: {
    jasaPpjk: 2500000,
    customsHandling: 750000,
    documentProcessing: 500000,
    pibSubmission: 350000,
    courierFee: 150000,
    additionalServiceFee: 500000,
  },
  domestic: {
    vehicleRates: {
      pickup: 500000,
      blindVan: 600000,
      CDE: 750000,
      CDD: 1000000,
      Fuso: 1500000,
      Wingbox: 2000000,
      "Trailer 20FT": 3500000,
      "Trailer 40FT": 5000000,
    },
    distanceRatePerKm: 8500,
    loadingFee: 350000,
    unloadingFee: 350000,
    overnightFee: 500000,
    helperFeePerDay: 200000,
  },
  warehousing: {
    palletRatePerDay: 15000,
    cbmRatePerDay: 25000,
    sqmRatePerDay: 8000,
    inboundFee: 25000,
    outboundFeePerPallet: 25000,
    inventoryFeePerMonth: 500000,
  },
};

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
      sendJson(response, 200, DEFAULT_CALCULATOR_RATES);
      return true;
    }
    return false;
  } catch (error) {
    if (error.statusCode) sendError(response, error.statusCode, error.message);
    else throw error;
    return true;
  }
}