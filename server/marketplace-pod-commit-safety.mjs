/**
 * A connection error during COMMIT does not prove that PostgreSQL rolled back.
 * Never delete a staged POD file if it might already be referenced by a
 * committed Shipment event. The unique (shipment_id,idempotency_key) index
 * makes a different committed attachment for the same key unambiguous.
 */
export async function persistPodWithCommitReconciliation({
  path, persist, discard, readStoredReference, reportUncertain = () => {},
}) {
  const safeDiscard = async () => {
    try { await discard(); }
    catch { reportUncertain("cleanup_failed"); }
  };
  let commitAttempted = false;
  let result;
  try {
    result = await persist(() => { commitAttempted = true; });
  } catch (error) {
    if (path) {
      if (!commitAttempted) {
        // Failure before sending COMMIT: the transaction cannot persist.
        await safeDiscard();
      } else {
        // COMMIT acknowledgement was lost. Read back the unique key on a
        // separate database connection before considering object removal.
        try {
          const stored = await readStoredReference();
          if (stored?.attachment_object_path
              && stored.attachment_object_path !== path) {
            // A different object won this unique idempotent key; the staged
            // object is not referenced by any committed row for this key.
            await safeDiscard();
          } else {
            // Referenced by committed row, missing, or still in-flight:
            // retain the file rather than break a possibly committed POD.
            reportUncertain("commit_outcome_unconfirmed");
          }
        } catch {
          reportUncertain("commit_readback_unavailable");
        }
      }
    }
    throw error;
  }
  if (result?.alreadyProcessed && path) await safeDiscard();
  return result;
}
