/**
 * Indonesian VAT (PPN) helpers — single source of truth (frontend).
 *
 * TAX_RATE_DECIMAL : 0.11  (used in calculations)
 * TAX_RATE_PCT     : 11    (used in display labels)
 *
 * Rounding rule: integer rupiah only.
 *   tax   = Math.round(subtotal * TAX_RATE_DECIMAL)
 *   grand = subtotal + tax
 */

export const TAX_RATE_DECIMAL = 0.11 as const;
export const TAX_RATE_PCT = 11 as const;

/** PPN nominal (rounded to nearest rupiah). */
export function calcTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE_DECIMAL);
}

/** subtotal + PPN. */
export function calcGrandTotal(subtotal: number): number {
  return subtotal + calcTax(subtotal);
}
