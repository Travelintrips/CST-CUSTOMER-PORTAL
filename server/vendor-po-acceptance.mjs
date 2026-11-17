/**
 * Canonical vendor PO acceptance writer for both the vendor's real capability
 * and the restricted, audited DEV internal-vendor Admin representative.
 * No raw token, lookup or authority decision is made in this module.
 */
const fail = (statusCode, message) => {
  throw Object.assign(new Error(message), { statusCode });
};

export async function acceptVendorPurchaseOrder({
  db, po, adminActor = null, writeEvent, queueEvent, customerNotification,
}) {
  if (typeof db !== "function" || !po || typeof writeEvent !== "function" ||
      typeof queueEvent !== "function" || typeof customerNotification !== "function") {
    fail(503, "Penyimpanan konfirmasi PO tidak tersedia.");
  }
  if (po.confirmed_at) {
    return { status: po.status, poNumber: po.po_number, alreadyProcessed: true };
  }
  if (po.status === "issued") {
    const updated = await db(
      `update public.mkt_purchase_orders
          set status='vendor_accepted'::mkt_po_status,
              confirmed_at=now(), updated_at=now()
        where id=$1 and status='issued' and confirmed_at is null
        returning id`,
      [po.id],
    );
    if (!updated.rowCount) fail(409, "PO berubah sebelum konfirmasi vendor.");
    await writeEvent(db, {
      rfqId: po.rfq_id,
      poId: po.id,
      actorType: adminActor ? "admin" : "vendor",
      actorId: adminActor ? String(adminActor.id) : String(po.vendor_id),
      actorName: adminActor?.name ?? po.vendor_name,
      action: adminActor ? "admin_internal_vendor_po_accepted" : "po_vendor_accepted",
      oldValue: { status: "issued" },
      newValue: { status: "vendor_accepted" },
      description: adminActor?.reason ?? "Vendor menerima Purchase Order.",
    }, `po:${po.id}:vendor_accepted`);
    if (!adminActor) {
      // The real vendor path retains exactly its historic outbound queue.
      // The synthetic DEV Admin path must never enqueue an external WA.
      await queueEvent(db, {
        eventType: "po_vendor_accepted",
        recipientType: "admin",
        rfqId: po.rfq_id,
        poId: po.id,
        payload: { poId: po.id, status: "vendor_accepted" },
        key: `po:${po.id}:vendor_accepted`,
      });
    }
    await customerNotification(
      db,
      {
        id: po.rfq_id,
        rfq_number: po.rfq_number,
        portal_customer_id: po.portal_customer_id,
        buyer_email: po.buyer_email,
      },
      `po:${po.id}:vendor_accepted:customer`,
      "po_vendor_accepted",
      "PO diterima vendor",
      adminActor
        ? `PO TEST DEV ${po.po_number} dikonfirmasi Admin internal untuk pengujian. Silakan pilih metode pengiriman TEST DEV.`
        : `Vendor telah menerima ${po.po_number}. Silakan pilih metode pengiriman.`,
      { poId: Number(po.id), status: "vendor_accepted", ...(adminActor ? { testDev: true } : {}) },
    );
    return { status: "vendor_accepted", poNumber: po.po_number, alreadyProcessed: false };
  }

  // No internal DEV Admin action may take over a legacy PO or bypass the
  // customer -> vendor -> customer handoff ordering.
  if (adminActor) fail(409, "PO internal tidak berada pada tahap konfirmasi DEV.");

  if (["production", "ready_to_ship", "in_transit"].includes(po.status)) {
    const updated = await db(
      `update public.mkt_purchase_orders
          set confirmed_at=now(), updated_at=now()
        where id=$1 and confirmed_at is null
        returning id`,
      [po.id],
    );
    if (!updated.rowCount) fail(409, "PO berubah sebelum konfirmasi vendor.");
    await writeEvent(db, {
      rfqId: po.rfq_id,
      poId: po.id,
      actorType: "vendor",
      actorId: String(po.vendor_id),
      actorName: po.vendor_name,
      action: "po_vendor_accepted_legacy",
      oldValue: { status: po.status, confirmedAt: null },
      newValue: { status: po.status, confirmedAt: "now" },
      description: "Vendor mengonfirmasi PO yang sudah terlanjur masuk fulfillment.",
    }, `po:${po.id}:vendor_accepted_legacy`);
    return { status: po.status, poNumber: po.po_number, alreadyProcessed: false };
  }
  fail(409, "PO tidak berada pada tahap yang dapat dikonfirmasi vendor.");
}
