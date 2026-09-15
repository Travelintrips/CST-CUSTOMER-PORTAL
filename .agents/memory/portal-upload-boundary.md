---
name: Portal upload boundary
description: Local portal document uploads need configured object storage and must not silently proxy upstream.
---

Document upload endpoints must stay inside the development boundary and fail explicitly when local object storage is not configured; they must not fall through to an upstream production route.

**Why:** The standalone portal has database access but no configured development object-storage backend, and proxy fallback could mutate or expose production data.

**How to apply:** Add the storage integration before enabling multipart document upload; until then return a clear local service-unavailable response and keep read/submit scope checks local.