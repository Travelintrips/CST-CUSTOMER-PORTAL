---
name: Canonical billing enum validation
description: Existing billing tables may expose a narrower enum contract than generated or guessed API values.
---

Validate the live `public` enum labels before selecting payment defaults or reservable statuses; use only values accepted by the canonical database.

**Why:** The standalone portal initially assumed generic provider and payment statuses that the existing development billing enums did not accept, causing runtime 500s during the first real payment insert.

**How to apply:** Query the specific `public` enum type (not every schema/type with the same name) before wiring a new billing path. Keep the API allowlist and UI actions aligned with those labels.