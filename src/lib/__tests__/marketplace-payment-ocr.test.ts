import { describe, expect, it } from "vitest";

// @ts-ignore JavaScript server module is intentionally tested from the frontend Vitest suite.
import { isLikelyYearAmount, parsePaymentAmountText } from "../../../server/marketplace-payment-ocr.mjs";

describe("marketplace payment proof OCR parser", () => {
  it("ignores year-like values and reads Indonesian rupiah amount", () => {
    const result = parsePaymentAmountText(
      "Transfer berhasil\n24 September 2026\nJumlah Transfer Rp 110.000.000\n",
      110_000_000,
    );

    expect(result.amount).toBe(110_000_000);
    expect(result.matchedExpected).toBe(true);
    expect(isLikelyYearAmount(2026)).toBe(true);
  });

  it("prefers the exact expected invoice amount over account/reference numbers", () => {
    const result = parsePaymentAmountText(
      [
        "No Referensi 998877665544",
        "Rekening tujuan 1234567890",
        "Total pembayaran IDR 110,000,000.00",
      ].join("\n"),
      110_000_000,
    );

    expect(result.amount).toBe(110_000_000);
    expect(result.matchedExpected).toBe(true);
  });

  it("reports a mismatch when the receipt nominal differs from the PO", () => {
    const result = parsePaymentAmountText(
      "Jumlah Transfer Rp 109.000.000",
      110_000_000,
    );

    expect(result.amount).toBe(109_000_000);
    expect(result.matchedExpected).toBe(false);
  });
});
