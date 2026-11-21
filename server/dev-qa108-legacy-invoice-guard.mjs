/** Exact CST-DEV synthetic QA safeguard for the LEGACY Portal Invoice issuer.
 * This legacy handler is not the same-transaction CanonicalPostingEngine.
 * No feature flag may authorize it to issue QA #108. A future reviewed
 * atomic issuer may replace this guard only after hosted GL/PPN/AR proof.
 */
export function mustDenyQa108LegacyInvoice(row, env = process.env) {
  return env?.APP_ENV?.trim().toLowerCase() === "development"
    && Number(row?.id) === 108
    && Number(row?.company_id) === 1
    && row?.doc_number === "QA-CST-DEV-OWNER-20261120-001";
}
