import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const server = read("server/index.mjs");
const admin = read("server/admin-portal.mjs");
const app = read("src/App.tsx");
const adminTrucking = read("src/pages/admin-trucking.tsx");

// Security: cookie-authenticated production mutations require browser provenance.
assert.match(server, /portal_session=/);
assert.match(server, /Mutation request provenance is required\./);
assert.match(server, /hasPortalSessionCookie && !origin && !fetchSite/);

// Product order integrity: server owns price/quantity calculation and new orders remain actionable.
assert.match(server, /select id, name, price, unit, weight_kg/);
assert.match(server, /const unitPrice = Number\(product\.price \?\? 0\)/);
assert.match(admin, /"new order", "new_order", "submitted"/);
assert.match(admin, /Status product order sudah berubah\. Muat ulang sebelum mencoba lagi\./);

// Admin trucking route must remain slash-safe for booking numbers containing "/".
assert.match(app, /<Route path="\/admin\/trucking">/);
assert.doesNotMatch(app, /<Route path="\/admin\/trucking\/:bookingNumber">/);
assert.match(adminTrucking, /new URLSearchParams\(window\.location\.search\)\.get\("booking"\)/);
assert.match(adminTrucking, /encodeURIComponent\(row\.bookingNumber\)/);

console.log("Critical Customer Portal deployment contracts passed.");
