---
name: Portal profile schema
description: Canonical customer profile writes must account for duplicate customer_id rows.
---

The canonical customer profile table does not enforce uniqueness on `customer_id`, so profile persistence must select a deterministic current row and then update it, inserting only when none exists.

**Why:** An `ON CONFLICT (customer_id)` write is invalid on the development schema and would fail at runtime.

**How to apply:** Use `updated_at desc nulls last, id desc limit 1` for the selected row and preserve unrelated profile fields during updates.