/**
 * Cross-service row-lock order for Customer Portal shipment/receipt/POD writers.
 *
 * Finance Vendor Invoice acquires PO -> GR -> Shipment. All Portal paths
 * that may later update PO must therefore acquire PO before Shipment.
 * The initial shipment read is UNLOCKED and only discovers the PO id.
 * After acquiring the PO lock, re-read Shipment under its own row lock
 * and fail closed if shipment.po_id changed meanwhile.
 *
 * Caller supplies the existing tenant-authorized loadShipment/loadPo functions:
 * this helper never accepts a client-provided company ID or bypasses RLS.
 */
export async function lockShipmentWithPoFirst({
  shipmentId, readShipment, lockPo, lockShipment,
}) {
  const preflight = await readShipment(shipmentId);
  const poId = Number(preflight?.po_id);
  if (!Number.isSafeInteger(poId) || poId <= 0) {
    const err = new Error("Shipment tidak memiliki PO valid.");
    err.statusCode = 409;
    throw err;
  }
  const po = await lockPo(poId);
  const shipment = await lockShipment(shipmentId);
  if (Number(po?.id) !== poId || Number(shipment?.po_id) !== poId) {
    const err = new Error("Relasi Shipment/PO berubah saat dikunci. Muat ulang lalu coba lagi.");
    err.statusCode = 409;
    throw err;
  }
  return { po, shipment };
}
