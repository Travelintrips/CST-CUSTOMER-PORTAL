# DEV-only multimodal provider quote readiness
This PR prepares **unmounted** sandbox quote clients, not customer-facing integrations. No booking, payment, shipment, accounting or webhooks are created. Default: OFF.
- Road Deliveree v10 sandbox quote (POST https://api.sandbox.deliveree.com/public_api/v10/deliveries/get_quote; official docs https://developers.deliveree.com/).
- Ocean Cargofive QA FCL/LCL rate search (GET https://coreapp-qa.cargofive.com/api/v1/public/rates; official docs https://developers.cargofive.com/).
- Air CargoAi is **not integrated**; its portal https://www.cargoai.co/developer-portal requires authenticated endpoint contracts and API credentials.
- Server-only DEV flag: CUSTOMER_PORTAL_PROVIDER_QUOTES_ENABLED_DEV=true. Flags OFF by default. Additional credentials DELIVEREE_SANDBOX_API_KEY and CARGOFIVE_SANDBOX_API_KEY must be supplied securely via Secret Manager. Never send credentials to frontend or commit to repository.
- Functions are not mounted to public API routes. Before enabling: review existing freight order writer, company scope, input mapping, status, webhook signatures, idempotency, 429 behavior, quote expiry, approved margins and accounting boundaries. Obtain provider partner agreement and sandbox keys; prove actual sandbox quote and booking lifecycle before any customer order activation.
- Contract tests use stubbed HTTP responses only and are **not external provider E2E**.
