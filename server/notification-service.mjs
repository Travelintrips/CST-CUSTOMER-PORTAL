const ADMIN_AUDIENCE = "admin";
const CUSTOMER_AUDIENCE = "customer";

export function resourcePayload({
  audience,
  resourceType,
  resourceId,
  link,
  payload = {},
}) {
  return {
    ...payload,
    audience,
    resourceType,
    resourceId: resourceId == null ? null : Number(resourceId),
    link,
    url: link,
  };
}

export async function bestEffortNotificationWrite(db, work) {
  try {
    await db("savepoint portal_notification_write");
    const result = await work();
    await db("release savepoint portal_notification_write");
    return result;
  } catch {
    await db("rollback to savepoint portal_notification_write").catch(() => {});
    await db("release savepoint portal_notification_write").catch(() => {});
    return false;
  }
}

async function insertNotifications(db, {
  recipientIds,
  eventKey,
  type,
  title,
  message,
  audience,
  resourceType,
  resourceId,
  link,
  payload,
}) {
  const itemPayload = JSON.stringify(resourcePayload({
    audience,
    resourceType,
    resourceId,
    link,
    payload,
  }));
  for (const recipientId of [...new Set(recipientIds.map(Number).filter(Number.isInteger))]) {
    await db(
      `insert into public.portal_customer_notifications
         (portal_customer_id, event_key, type, title, message, payload)
       values ($1,$2,$3,$4,$5,$6::jsonb)
       on conflict (portal_customer_id, event_key) do nothing`,
      [recipientId, eventKey, type, title, message, itemPayload],
    );
  }
  return true;
}

export async function notifyPortalCustomers(db, {
  customerIds,
  eventKey,
  type,
  title,
  message,
  resourceType,
  resourceId,
  link,
  payload = {},
}) {
  if (!Array.isArray(customerIds) || customerIds.length === 0) return false;
  return bestEffortNotificationWrite(db, () => insertNotifications(db, {
    recipientIds: customerIds,
    eventKey,
    type,
    title,
    message,
    audience: CUSTOMER_AUDIENCE,
    resourceType,
    resourceId,
    link,
    payload,
  }));
}

export async function notifyRfqCustomer(db, rfq, details) {
  return bestEffortNotificationWrite(db, async () => {
    let customerId = rfq.portal_customer_id;
    if (!customerId && rfq.buyer_email) {
      const customer = await db(
        `select id
           from public.portal_customers
          where lower(email)=lower($1)
          limit 1`,
        [rfq.buyer_email],
      );
      customerId = customer.rows[0]?.id ?? null;
    }
    if (!customerId) return false;
    return insertNotifications(db, {
      recipientIds: [customerId],
      ...details,
      audience: CUSTOMER_AUDIENCE,
      payload: {
        rfq_id: Number(rfq.id),
        rfq_number: rfq.rfq_number,
        ...details.payload,
      },
    });
  });
}

export async function notifyAdmins(db, {
  eventKey,
  type,
  title,
  message,
  resourceType,
  resourceId,
  link = "/admin?tab=service-operations",
  payload = {},
  explicitAdminIds = undefined,
  scopeCompanyId = undefined,
}) {
  return bestEffortNotificationWrite(db, async () => {
    // Three intentional routes: trusted already-verified Invoice issuer;
    // exact-company payment recipient resolution; original generic callers.
    // A company-scoped request must NEVER fall back to all Portal Admins.
    let recipientIds;
    if (Array.isArray(explicitAdminIds)) {
      recipientIds = explicitAdminIds;
    } else if (scopeCompanyId !== undefined) {
      const companyId = Number(scopeCompanyId);
      if (![1, 3].includes(companyId)) return false;
      const recipients = await db(
        `select distinct pc.id
           from public.portal_customers pc
           join public.users u
             on lower(btrim(u.email)) = lower(btrim(pc.email))
          where pc.role = 'admin'
            and coalesce(pc.account_status, 'active') = 'active'
            and u.is_active = true and u.status = 'active'
            and (
              (u.role = 'super_admin'
                 and u.system_role = 'super_admin'
                 and (u.company_id is null or u.company_id = $1))
              or (u.role = 'admin' and u.company_id = $1
                  and exists (
                    select 1 from public.portal_company_members pcm
                     where pcm.portal_customer_id = pc.id
                       and pcm.company_id = $1
                       and pcm.is_active = true))
            )
          order by pc.id
          limit 33`,
        [companyId],
      );
      if (recipients.rows.length === 0 || recipients.rows.length > 32) return false;
      recipientIds = recipients.rows.map((row) => row.id);
    } else {
      // Preserve the existing Marketplace / other legacy Admin inbox behavior.
      const admins = await db(
        `select id
           from public.portal_customers
          where role = 'admin'
            and coalesce(account_status, 'active') = 'active'`,
      );
      recipientIds = admins.rows.map((row) => row.id);
    }
    return insertNotifications(db, {
      recipientIds,
      eventKey,
      type,
      title,
      message,
      audience: ADMIN_AUDIENCE,
      resourceType,
      resourceId,
      link,
      payload,
    });
  });
}

export function marketplaceNotificationDetails(eventType, po, payload = {}) {
  const shipmentEvent = eventType.startsWith("shipment_") || eventType === "goods_receipt_created";
  const resourceType = shipmentEvent ? "shipment" : "purchase_order";
  const resourceId = shipmentEvent ? payload.shipmentId : po.id;
  const link = `/marketplace/my-purchase-orders/${Number(po.id)}`;
  const label = shipmentEvent ? "Shipment" : "Purchase Order";
  return {
    resourceType,
    resourceId,
    link,
    type: eventType,
    title: shipmentEvent ? "Update shipment" : "Update Purchase Order",
    message: `${label} ${po.po_number ?? po.id} diperbarui: ${eventType.replaceAll("_", " ")}.`,
    payload: {
      poId: Number(po.id),
      poNumber: po.po_number,
      shipmentId: payload.shipmentId ?? null,
      eventType,
      status: payload.status ?? null,
      ...payload,
    },
  };
}