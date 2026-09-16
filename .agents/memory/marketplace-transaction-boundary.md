---
name: Marketplace transaction boundary
description: Durable constraints for canonical RFQ, quotation, customer approval, and PO workflows.
---

Canonical marketplace service transactions must pass a callable query adapter into shared helpers, because the service consistently invokes `db(sql, params)` rather than the raw pg client API.

**Why:** Lifecycle testing exposed that the raw transaction client and the service query contract are different interfaces; later PostgreSQL errors also showed that numeric/date expressions need explicit casts when parameters are otherwise untyped.

**How to apply:** Keep transaction callbacks behind the existing adapter, cast parameterized arithmetic/date expressions explicitly, and treat `mkt_vendor_quotes.vendor_id` (supplier identity) separately from `vendor_notifications.vendor_id` (portal customer identity). Resolve a linked vendor portal account before writing inbox notifications; otherwise use the durable notification queue.