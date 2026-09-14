---
name: Login session boundary
description: Rules for keeping the Customer Portal login page and authenticated shell in sync.
---

The `/login` route must resolve the canonical server session before rendering its form. A global auth bootstrap should not also own `/login`, and an older bootstrap response must not mutate state after a newer login or logout has started.

**Why:** An anonymous bootstrap request could finish after Dev Login and clear the fresh cookie, leaving the navbar authenticated while the login form remained visible and reported a generic failure.

**How to apply:** Keep one session gate for `/login`, redirect valid sessions to the server-provided destination, clear stale UI state only for the current auth request, and preserve the HttpOnly cookie as the authorization source.