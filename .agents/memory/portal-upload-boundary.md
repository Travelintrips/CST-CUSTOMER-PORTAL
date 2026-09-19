---
name: Portal upload boundary
description: Local portal document uploads must use configured Supabase Storage and must not silently proxy upstream.
---

Document upload endpoints must stay inside the development boundary and fail explicitly when Supabase Storage is not configured or the configured development bucket is invalid/missing; they must not fall through to an upstream production route or select another bucket.

**Why:** The standalone portal has database access but no configured development Supabase Storage backend, and proxy fallback could mutate or expose production data. A bundle can also contain a present but malformed or non-existent bucket value.

**How to apply:** Load the canonical development bundle before API initialization, validate bucket semantics and project membership, and return a clear local service-unavailable response until the exact private development bucket is configured.