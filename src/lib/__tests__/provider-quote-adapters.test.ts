// @ts-nocheck — sandbox protocol fixtures only
import { describe, it, expect, vi } from "vitest";
import { PARTNERS, delivereeQuote, cargofiveQuote, cargoaiReadiness } from "../../../server/provider-quote-adapters.mjs";

const dev = { APP_ENV: "development", NODE_ENV: "test", CUSTOMER_PORTAL_PROVIDER_QUOTES_ENABLED_DEV: "true" };
const road = { vehicleTypeId: 21, locations: [{ address: "Jakarta" }, { address: "Bogor" }] };
const ocean = { originId: 204, destinationId: 120, type: "FCL", cargoDetails: "1x20DVx15000", departureDate: "2026-12-01" };

describe("provider sandbox quotes: fail closed and never create bookings", () => {
  it("rejects disabled flag and missing credentials without network", async () => {
    const fetcher = vi.fn();
    await expect(delivereeQuote(road, { env: { ...dev, CUSTOMER_PORTAL_PROVIDER_QUOTES_ENABLED_DEV: "false" }, fetcher })).rejects.toThrow("disabled");
    await expect(cargofiveQuote(ocean, { env: dev, fetcher })).rejects.toThrow("credential");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects production even if credentials and flag are supplied", async () => {
    const fetcher = vi.fn();
    await expect(delivereeQuote(road, { env: { ...dev, NODE_ENV: "production", DELIVEREE_SANDBOX_API_KEY: "test" }, fetcher })).rejects.toThrow("disabled");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("calls only Deliveree sandbox quote, not delivery booking", async () => {
    const fetcher = vi.fn(async()=>({ ok: true, json: async()=>({ quote: 20000 }) }));
    const output = await delivereeQuote(road, { env: { ...dev, DELIVEREE_SANDBOX_API_KEY: "test" }, fetcher });
    expect(output.quote).toBe(20000);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.sandbox.deliveree.com/public_api/v10/deliveries/get_quote");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).locations).toHaveLength(2);
  });
  it("calls only Cargofive QA GET rates and returns 429 to caller", async () => {
    const fetcher = vi.fn(async()=>({ ok: false, status: 429 }));
    await expect(cargofiveQuote(ocean, { env: { ...dev, CARGOFIVE_SANDBOX_API_KEY: "test" }, fetcher })).rejects.toMatchObject({statusCode:429});
    const [url, init] = fetcher.mock.calls[0];
    expect(new URL(url).origin).toBe("https://coreapp-qa.cargofive.com");
    expect(new URL(url).pathname).toBe("/api/v1/public/rates");
    expect(init.method).toBe("GET");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("keeps air API intentionally unavailable before contract and credentials", () => {
    expect(PARTNERS.cargoai.booking).toBe(false);
    expect(cargoaiReadiness()).toMatchObject({ready:false,mode:"air",reason:"PARTNER_API_CONTRACT_REQUIRED"});
  });
});
