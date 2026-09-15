---
name: Local portal route boundary
description: Development routing rules for authenticated portal business endpoints.
---

When development browser traffic targets the local Customer Portal API, authenticated organization, order, and RFQ routes must be served locally or forwarded only to a reachable non-production upstream; never proxy them back to the local API or silently fall back to production.

**Why:** The development session cookie is authoritative locally, while a self-loop or production fallback makes authenticated business requests fail or tests mutate the wrong environment.

**How to apply:** Keep ownership predicates based on the portal customer and active company memberships, verify the local and public preview ports, and run mutations only against the development database.