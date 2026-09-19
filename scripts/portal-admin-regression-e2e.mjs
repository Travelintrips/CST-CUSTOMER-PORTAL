#!/usr/bin/env node

/**
 * Development-only regression coverage for the three recent Admin Portal fixes:
 * admin asset upload, first-time courier configuration, and internal featured
 * product activation using the canonical verified payment status.
 *
 * Every write is disposable. The courier setting and featured catalog state
 * are restored in finally blocks, and the uploaded public object is deleted.
 * No email or WhatsApp path is invoked.
 */

import { closeDatabase, databaseEnvironment, pool, query } from "../server/db.mjs";
import { deletePublicAsset } from "../server/storage.mjs";

const API_PORT = "3000";
const PRODUCTION_HOSTS = new Set(["cstlogistic.co.id", "www.cstlogistic.co.id"]);
const DELIVERY_VENDOR_KEY = "admin_delivery_vendors";
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function fail(message) {
  throw new Error(`[portal-admin-regression-e2e] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function previewApiUrl() {
  const configured = process.env.PORTAL_E2E_BASE_URL?.trim();
  const domain = process.env.REPLIT_DEV_DOMAIN?.trim();
  const raw = configured || (domain ? `https://${domain}:${API_PORT}` : "");
  if (!raw) fail("REPLIT_DEV_DOMAIN is required.");

  let url;
  try {
    url = new URL(raw);
  } catch {
    fail("PORTAL_E2E_BASE_URL must be an absolute URL.");
  }
  if (url.protocol !== "https:") fail("target must use HTTPS.");
  if (url.port !== API_PORT) fail("target must use Preview API port 3000.");
  if (PRODUCTION_HOSTS.has(url.hostname)) fail("production target is forbidden.");
  if (!url.hostname.endsWith(".replit.dev") && !url.hostname.endsWith(".sisko.replit.dev")) {
    fail("target must be a Replit development preview host.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function storeCookies(headers, jar) {
  const values = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : (headers.get("set-cookie") ? [headers.get("set-cookie")] : []);
  for (const value of values) {
    const pair = value.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

function formWithPng() {
  const form = new FormData();
  form.append("file", new Blob([PNG_BYTES], { type: "image/png" }), "admin-regression.png");
  return form;
}

class AdminClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
  }

  async request(path, options = {}) {
    const { expected = [200], body, headers = {}, ...fetchOptions } = options;
    const requestHeaders = { Accept: "application/json", ...headers };
    const cookie = [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; ");
    if (cookie) requestHeaders.Cookie = cookie;
    let requestBody = body;
    if (body !== undefined && !(body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(new URL(path, this.baseUrl), {
      ...fetchOptions,
      headers: requestHeaders,
      body: requestBody,
      redirect: "manual",
    });
    storeCookies(response.headers, this.cookies);
    const raw = await response.text();
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    assert(
      expected.includes(response.status),
      `${path} returned ${response.status}; expected ${expected.join("/")}. ` +
      `${parsed?.message ?? raw.slice(0, 240)}`,
    );
    if (!raw) return null;
    return parsed ?? fail(`${path} returned non-JSON.`);
  }
}

async function withDatabaseCleanup(work) {
  try {
    return await work();
  } finally {
    await closeDatabase();
  }
}

async function restoreCourierSetting(snapshot) {
  if (snapshot.exists) {
    await query(
      `insert into public.sc_settings (key, value, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (key) do update set value=excluded.value, updated_at=now()`,
      [DELIVERY_VENDOR_KEY, JSON.stringify(snapshot.value)],
    );
  } else {
    await query("delete from public.sc_settings where key=$1", [DELIVERY_VENDOR_KEY]);
  }
}

async function cleanupFeaturedActivation({
  requestId,
  vendorId,
  catalogItemId,
  originalItem,
}) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    if (requestId) {
      await client.query("delete from public.mkt_featured_product_requests where id=$1", [requestId]);
    }
    await client.query(
      `update public.vendor_catalog_items
          set is_featured=$1, featured_start_at=$2, featured_until=$3,
              featured_priority=$4, updated_at=now()
        where id=$5 and vendor_id=$6`,
      [
        originalItem.is_featured,
        originalItem.featured_start_at,
        originalItem.featured_until,
        originalItem.featured_priority,
        catalogItemId,
        vendorId,
      ],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function testAdminUpload(admin) {
  let uploadedPath = null;
  try {
    const uploaded = await admin.request("/api/portal/admin/upload", {
      method: "POST",
      body: formWithPng(),
      expected: [201],
    });
    uploadedPath = uploaded?.path ?? null;
    assert(uploadedPath?.startsWith("portal-assets/admin/"), "upload path is not admin-scoped.");
    assert(uploaded?.mimeType === "image/png", "upload did not preserve the PNG MIME type.");
    assert(Number(uploaded?.size) === PNG_BYTES.length, "upload size does not match the fixture.");
    assert(
      typeof uploaded?.url === "string" &&
      uploaded.url.includes("/storage/v1/object/public/public-assets/portal-assets/admin/"),
      "upload did not return a public asset URL.",
    );
  } finally {
    if (uploadedPath) await deletePublicAsset(uploadedPath);
  }
}

async function testInitialCourierConfiguration(admin) {
  const previous = await query(
    "select value from public.sc_settings where key=$1 limit 1",
    [DELIVERY_VENDOR_KEY],
  );
  const snapshot = {
    exists: previous.rows.length > 0,
    value: previous.rows[0]?.value ?? null,
  };
  await query("delete from public.sc_settings where key=$1", [DELIVERY_VENDOR_KEY]);
  try {
    const vendors = await admin.request("/api/portal/admin/delivery-vendors");
    assert(Array.isArray(vendors) && vendors.length >= 1, "missing initial courier configuration returned no vendors.");
    const names = new Set(vendors.map((vendor) => vendor.name));
    for (const expectedName of ["JNE", "J&T Express", "SiCepat"]) {
      assert(names.has(expectedName), `initial courier configuration is missing ${expectedName}.`);
    }
  } finally {
    await restoreCourierSetting(snapshot);
  }
}

async function testInternalFeaturedActivation(admin) {
  const vendors = await admin.request("/api/portal/admin/internal-featured/vendors");
  const packages = await admin.request("/api/portal/admin/featured-packages");
  const vendor = vendors.find((item) => Number(item.id) > 0);
  const featuredPackage = packages.find((item) => item.isActive && item.internalOnly);
  assert(vendor, "no internal vendor is available for the disposable activation.");
  assert(featuredPackage, "no active internal featured package is available.");

  const catalog = await admin.request(
    `/api/portal/admin/internal-featured/vendors/${vendor.id}/catalog`,
  );
  const item = catalog.find((candidate) => !candidate.isFeatured);
  assert(item, "no non-featured published catalog item is available.");

  const originalResult = await query(
    `select is_featured, featured_start_at, featured_until, featured_priority
       from public.vendor_catalog_items
      where id=$1 and vendor_id=$2`,
    [item.id, vendor.id],
  );
  assert(originalResult.rows[0], "disposable catalog item could not be snapshotted.");
  const originalItem = originalResult.rows[0];
  const before = await query(
    `select coalesce(max(id), 0)::int as max_id
       from public.mkt_featured_product_requests
      where vendor_id=$1 and catalog_item_id=$2`,
    [vendor.id, item.id],
  );
  const previousMaxRequestId = Number(before.rows[0]?.max_id ?? 0);
  let requestId = null;
  try {
    await admin.request("/api/portal/admin/internal-featured/activate", {
      method: "POST",
      body: {
        vendorId: Number(vendor.id),
        catalogItemId: Number(item.id),
        packageId: Number(featuredPackage.id),
        startAt: "2099-01-02T00:00:00",
        endAt: "2099-02-01T00:00:00",
      },
      expected: [201],
    });
    const created = await query(
      `select id, status, payment_status
         from public.mkt_featured_product_requests
        where id>$1 and vendor_id=$2 and catalog_item_id=$3 and package_id=$4
        order by id desc limit 1`,
      [previousMaxRequestId, vendor.id, item.id, featuredPackage.id],
    );
    assert(created.rows[0], "activation did not create a disposable featured request.");
    requestId = Number(created.rows[0].id);
    assert(created.rows[0].status === "active", "internal activation did not create active status.");
    assert(
      created.rows[0].payment_status === "verified",
      `internal activation used non-canonical payment status: ${created.rows[0].payment_status}`,
    );
    const updatedItem = await query(
      "select is_featured, featured_until from public.vendor_catalog_items where id=$1",
      [item.id],
    );
    assert(updatedItem.rows[0]?.is_featured === true, "catalog item was not marked featured.");
    assert(updatedItem.rows[0]?.featured_until, "catalog item has no featured end date.");
  } finally {
    await cleanupFeaturedActivation({
      requestId,
      vendorId: vendor.id,
      catalogItemId: item.id,
      originalItem,
    });
  }
}

async function main() {
  if (process.env.APP_ENV === "production" || process.env.NODE_ENV === "production") {
    fail("this regression test is development-only.");
  }
  assert(databaseEnvironment === "development", "database is not the development database.");
  const base = previewApiUrl();
  const admin = new AdminClient(base);
  await admin.request("/api/portal/auth/dev-login", {
    method: "POST",
    body: { role: "admin" },
  });

  await withDatabaseCleanup(async () => {
    await testAdminUpload(admin);
    await testInitialCourierConfiguration(admin);
    await testInternalFeaturedActivation(admin);
    console.log("[portal-admin-regression-e2e] PASS: upload, initial couriers, internal featured activation.");
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});