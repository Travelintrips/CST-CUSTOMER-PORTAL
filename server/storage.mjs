import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_VENDOR_ASSET_BYTES = 50 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 5 * 60;
const ALLOWED_DOCUMENT_TYPES = new Set(["ktp", "legalitas", "sim", "stnk"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const ALLOWED_VENDOR_ASSET_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "application/pdf",
]);
const bucketChecks = new Map();

function isValidBucketName(value) {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 100
    && value.trim() === value
    && !value.includes("/")
    && !value.includes("\\")
    && /^[\w!.*'() &$@=;:+,?-]+$/.test(value);
}

function isProduction() {
  return process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
}

function storageConfig() {
  const production = isProduction();
  const url = (
    production
      ? process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      : process.env.SUPABASE_URL_DEV || process.env.VITE_SUPABASE_URL_DEV
  || ""
  ).trim();
  const serviceRoleKey = production
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
  const rawBucket = (
    production
      ? process.env.SUPABASE_STORAGE_BUCKET || "private-uploads"
      : process.env.SUPABASE_STORAGE_BUCKET_DEV
    || ""
  ).trim();
  const unquotedBucket = /^(['"]).*\1$/.test(rawBucket) ? rawBucket.slice(1, -1).trim() : rawBucket;
  const bucket = production && /^https?:\/\//i.test(unquotedBucket)
    ? "private-uploads"
    : unquotedBucket;
  if (!url || !serviceRoleKey || !bucket) {
    const error = new Error(
      production
        ? "Production document storage is not configured."
        : "Development document storage is not configured.",
    );
    error.statusCode = 503;
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }
  if (bucket === "public-assets") {
    const error = new Error("Document storage cannot use the public-assets bucket.");
    error.statusCode = 503;
    error.code = "STORAGE_PUBLIC_BUCKET_FORBIDDEN";
    throw error;
  }
  if (!isValidBucketName(bucket)) {
    const error = new Error(
      production
        ? "Production document storage bucket configuration is invalid."
        : "Development document storage bucket configuration is invalid.",
    );
    error.statusCode = 503;
    error.code = "STORAGE_INVALID_BUCKET";
    throw error;
  }
  const parsedUrl = new URL(url);
  if (!parsedUrl.hostname.endsWith(".supabase.co")) {
    const error = new Error(
      production
        ? "Production document storage URL is invalid."
        : "Development document storage URL is invalid.",
    );
    error.statusCode = 503;
    error.code = "STORAGE_INVALID_URL";
    throw error;
  }
  return { url: parsedUrl.origin, serviceRoleKey, bucket };
}

function client() {
  const config = storageConfig();
  return {
    ...config,
    supabase: createClient(config.url, config.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      realtime: { transport: WebSocket },
    }),
  };
}

async function ensurePrivateBucket(storage) {
  const key = `${storage.url}/${storage.bucket}`;
  if (!bucketChecks.has(key)) {
    bucketChecks.set(key, (async () => {
      const existing = await storage.supabase.storage.getBucket(storage.bucket);
      if (!existing.error && existing.data) {
        if (existing.data.public) {
          const error = new Error("Document storage bucket must be private.");
          error.statusCode = 503;
          throw error;
        }
        return;
      }
      if (existing.error?.statusCode !== 404 && existing.error?.status !== 404) {
        throw existing.error ?? new Error("Document storage bucket lookup failed.");
      }
      if (isProduction()) {
        const error = new Error("Production document storage bucket does not exist.");
        error.statusCode = 503;
        throw error;
      }
      const created = await storage.supabase.storage.createBucket(storage.bucket, {
        public: false,
        fileSizeLimit: String(MAX_FILE_BYTES),
        allowedMimeTypes: [...ALLOWED_MIME_TYPES],
      });
      if (created.error) throw created.error;
    })());
  }
  try {
    await bucketChecks.get(key);
  } catch (error) {
    bucketChecks.delete(key);
    throw error;
  }
}

export async function checkStorageReadiness() {
  const storage = client();
  const existing = await storage.supabase.storage.getBucket(storage.bucket);
  if (existing.error || !existing.data) {
    const error = new Error(
      isProduction()
        ? "Production document storage bucket is unavailable."
        : "Development document storage bucket is unavailable.",
    );
    error.statusCode = 503;
    error.code = existing.error ? "STORAGE_BUCKET_UNAVAILABLE" : "STORAGE_BUCKET_MISSING";
    throw error;
  }
  if (existing.data.public) {
    const error = new Error("Document storage bucket must be private.");
    error.statusCode = 503;
    error.code = "STORAGE_BUCKET_NOT_PRIVATE";
    throw error;
  }
  return { bucket: storage.bucket, private: true };
}

function safeFileName(name) {
  const normalized = String(name || "document").normalize("NFKC");
  const clean = normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean.slice(0, 120) || "document";
}

function extensionForMime(mimeType) {
  return mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "pdf";
}

export function validateDocumentFile(file, { ocr = false } = {}) {
  if (!file || typeof file.arrayBuffer !== "function") {
    const error = new Error("File dokumen wajib diunggah.");
    error.statusCode = 400;
    throw error;
  }
  const mimeType = String(file.type || "").toLowerCase();
  const size = Number(file.size);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    const error = new Error("Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.");
    error.statusCode = 415;
    throw error;
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) {
    const error = new Error("Ukuran file harus lebih dari 0 dan maksimal 5 MB.");
    error.statusCode = 413;
    throw error;
  }
  if (ocr && mimeType === "application/pdf") {
    const error = new Error("KTP OCR hanya mendukung gambar JPG atau PNG.");
    error.statusCode = 415;
    throw error;
  }
  return { mimeType, size };
}

export function documentType(value) {
  const type = String(value || "").trim().toLowerCase();
  if (!ALLOWED_DOCUMENT_TYPES.has(type)) {
    const error = new Error("Jenis dokumen tidak valid.");
    error.statusCode = 400;
    throw error;
  }
  return type;
}

export function customerObjectPrefix(customerId, companyId) {
  const companyScope = companyId == null ? "unassigned" : `company-${Number(companyId)}`;
  return `customers/${Number(customerId)}/${companyScope}/documents`;
}

async function storageRemove(storage, path) {
  if (!path || typeof path !== "string" || !path.startsWith("customers/")) return;
  await ensurePrivateBucket(storage);
  const { error } = await storage.supabase.storage.from(storage.bucket).remove([path]);
  if (error) throw error;
}

export async function uploadDocument({ customerId, companyId, documentType: type, file }) {
  const normalizedType = documentType(type);
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${customerObjectPrefix(customerId, companyId)}/${normalizedType}/${crypto.randomUUID()}-${safeFileName(file.name || `document.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(path, buffer, {
    contentType: mimeType,
    cacheControl: "0",
    upsert: false,
  });
  if (error) {
    console.error(
      "[customer-portal-api] document storage upload failed",
      error?.statusCode ?? error?.status ?? "",
    );
    const failure = new Error("Upload dokumen ke private storage gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function uploadVendorFeaturedPaymentProof({ vendorId, requestId, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `vendor-featured-payment-proofs/vendor-${Number(vendorId)}/request-${Number(requestId)}/${crypto.randomUUID()}-${safeFileName(file.name || `proof.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload bukti pembayaran featured gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedVendorFeaturedPaymentProofUrl({ vendorId, requestId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `vendor-featured-payment-proofs/vendor-${Number(vendorId)}/request-${Number(requestId)}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path bukti pembayaran featured tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL bukti pembayaran featured tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

export async function uploadMarketplacePod({ poId, shipmentId, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `marketplace-pod/po-${Number(poId)}/shipment-${Number(shipmentId)}/${crypto.randomUUID()}-${safeFileName(file.name || `pod.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload POD marketplace gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedMarketplacePodUrl({ poId, shipmentId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `marketplace-pod/po-${Number(poId)}/shipment-${Number(shipmentId)}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path POD marketplace tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL POD marketplace tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}


export async function uploadTruckingPaymentProof({ bookingId, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `trucking-payment-proofs/booking-${Number(bookingId)}/${crypto.randomUUID()}-${safeFileName(file.name || `proof.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload bukti pembayaran trucking gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedTruckingPaymentProofUrl({ bookingId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `trucking-payment-proofs/booking-${Number(bookingId)}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path bukti pembayaran trucking tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL bukti pembayaran trucking tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

export async function uploadTruckingPod({ bookingId, stopId, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `trucking-pod/booking-${Number(bookingId)}/stop-${Number(stopId)}/${crypto.randomUUID()}-${safeFileName(file.name || `pod.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload POD trucking gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedTruckingPodUrl({ bookingId, stopId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `trucking-pod/booking-${Number(bookingId)}/stop-${Number(stopId)}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path POD trucking tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL POD trucking tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

export async function uploadMarketplacePaymentProof({ poId, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `marketplace-payment-proofs/po-${Number(poId)}/${crypto.randomUUID()}-${safeFileName(file.name || `proof.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload bukti pembayaran marketplace gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedMarketplacePaymentProofUrl({ poId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `marketplace-payment-proofs/po-${Number(poId)}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path bukti pembayaran marketplace tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL bukti pembayaran marketplace tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

export async function deleteMarketplacePaymentProof({ poId, path }) {
  const normalizedPath = String(path || "");
  const prefix = `marketplace-payment-proofs/po-${Number(poId)}/`;
  if (!normalizedPath.startsWith(prefix)) return;
  const storage = client();
  await ensurePrivateBucket(storage);
  const { error } = await storage.supabase.storage.from(storage.bucket).remove([normalizedPath]);
  if (error) throw error;
}

export async function uploadPaymentProof({ token, file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const path = `payment-proofs/${tokenHash}/${crypto.randomUUID()}-${safeFileName(file.name || `proof.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload bukti pembayaran ke private storage gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function deleteDocumentObject(path) {
  const storage = client();
  await storageRemove(storage, path);
}

function publicAssetStorage() {
  const url = (
    isProduction()
      ? process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
      : process.env.SUPABASE_URL_DEV
        ?? process.env.VITE_SUPABASE_URL_DEV
        ?? process.env.SUPABASE_URL
        ?? process.env.VITE_SUPABASE_URL
  )?.trim();
  const serviceRoleKey = isProduction()
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
  if (!url || !serviceRoleKey) {
    const error = new Error("Public asset storage is not configured.");
    error.statusCode = 503;
    throw error;
  }
  const parsedUrl = new URL(url);
  if (!parsedUrl.hostname.endsWith(".supabase.co")) {
    const error = new Error("Public asset storage URL is invalid.");
    error.statusCode = 503;
    throw error;
  }
  return {
    url: parsedUrl.origin,
    serviceRoleKey,
    bucket: "public-assets",
    supabase: createClient(parsedUrl.origin, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      realtime: { transport: WebSocket },
    }),
  };
}

export async function uploadPublicAsset({ prefix, file }) {
  if (!file || typeof file.arrayBuffer !== "function") {
    const error = new Error("File aset wajib diunggah.");
    error.statusCode = 400;
    throw error;
  }
  const mimeType = String(file.type || "").toLowerCase();
  const size = Number(file.size);
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    const error = new Error("Aset hanya mendukung JPG, PNG, atau WEBP.");
    error.statusCode = 415;
    throw error;
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) {
    const error = new Error("Ukuran aset harus lebih dari 0 dan maksimal 5 MB.");
    error.statusCode = 413;
    throw error;
  }
  const storage = publicAssetStorage();
  const cleanPrefix = String(prefix || "portal-assets").replace(/^\/+|\/+$/g, "");
  if (!cleanPrefix || cleanPrefix.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) {
    const error = new Error("Prefix aset tidak valid.");
    error.statusCode = 400;
    throw error;
  }
  const path = `${cleanPrefix}/${crypto.randomUUID()}-${safeFileName(file.name || "asset")}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "3600", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload aset publik gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return {
    path,
    fileName: safeFileName(file.name),
    mimeType,
    size,
    url: `${storage.url}/storage/v1/object/public/${storage.bucket}/${path}`,
  };
}

export async function deletePublicAsset(path) {
  const storage = publicAssetStorage();
  const normalized = String(path || "");
  if (!normalized || normalized.split("/").some((part) => part === "." || part === ".." || part.includes("\\"))) return;
  const { error } = await storage.supabase.storage.from(storage.bucket).remove([normalized]);
  if (error) throw error;
}

export async function signedDocumentUrl(path) {
  const storage = client();
  await ensurePrivateBucket(storage);
  if (!path || !path.startsWith("customers/")) {
    const error = new Error("Object path dokumen tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL dokumen tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

export async function signedPaymentProofUrl({ token, path }) {
  const normalizedPath = String(path || "");
  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const prefix = `payment-proofs/${tokenHash}/`;
  if (!normalizedPath.startsWith(prefix)) {
    const error = new Error("Object path bukti pembayaran tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL bukti pembayaran tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

function vendorInvitePrefix(token) {
  return `vendor-invitations/${crypto.createHash("sha256").update(String(token)).digest("hex")}`;
}

export async function uploadVendorInvitationAsset({ token, file }) {
  if (!file || typeof file.arrayBuffer !== "function") {
    const error = new Error("File vendor wajib diunggah.");
    error.statusCode = 400;
    throw error;
  }
  const mimeType = String(file.type || "").toLowerCase();
  const size = Number(file.size);
  if (!ALLOWED_VENDOR_ASSET_TYPES.has(mimeType)) {
    const error = new Error("Tipe file vendor tidak didukung.");
    error.statusCode = 415;
    throw error;
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_VENDOR_ASSET_BYTES) {
    const error = new Error("Ukuran file vendor harus lebih dari 0 dan maksimal 50 MB.");
    error.statusCode = 413;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `${vendorInvitePrefix(token)}/${crypto.randomUUID()}-${safeFileName(file.name || "asset")}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload aset vendor ke private storage gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function signedVendorInvitationAssetUrl({ token, path }) {
  const normalizedPath = String(path || "");
  const prefix = vendorInvitePrefix(token);
  if (!normalizedPath.startsWith(`${prefix}/`)) {
    const error = new Error("Object path vendor tidak valid.");
    error.statusCode = 404;
    throw error;
  }
  const storage = client();
  await ensurePrivateBucket(storage);
  const { data, error } = await storage.supabase.storage
    .from(storage.bucket)
    .createSignedUrl(normalizedPath, 15 * 60);
  if (error || !data?.signedUrl) {
    const failure = new Error("Signed URL aset vendor tidak tersedia.");
    failure.statusCode = 502;
    throw failure;
  }
  return data.signedUrl;
}

function normalizeKtpOcrText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[|]/g, "I")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizedLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function looksLikeLabel(line, aliases) {
  const compact = normalizedLabel(line);
  return aliases.some((alias) => {
    const target = normalizedLabel(alias);
    return compact === target || compact.startsWith(target);
  });
}

function ktpField(lines, aliases) {
  for (let index = 0; index < lines.length; index += 1) {
    const clean = lines[index].replace(/^[^A-Za-z0-9]+/, "").trim();
    const compact = normalizedLabel(clean);
    for (const alias of aliases) {
      const target = normalizedLabel(alias);
      if (!target || !compact.startsWith(target)) continue;

      const explicitSeparator = clean.match(/[:;=\-]\s*(.+)$/);
      if (explicitSeparator?.[1]?.trim()) return explicitSeparator[1].trim();

      const words = clean.split(/\s+/);
      const aliasWords = String(alias).trim().split(/\s+/).length;
      const inline = words.slice(aliasWords).join(" ").trim();
      if (inline && normalizedLabel(inline) !== target) return inline;

      const next = lines[index + 1]?.trim();
      if (next && !isKtpSectionLabel(next)) return next;
    }
  }
  return "";
}

function isKtpSectionLabel(line) {
  return looksLikeLabel(line, [
    "nik",
    "nama",
    "name",
    "tempat/tgl lahir",
    "tempat tgl lahir",
    "jenis kelamin",
    "kelamin",
    "alamat",
    "rt/rw",
    "kel/desa",
    "kelurahan/desa",
    "kecamatan",
    "agama",
    "status perkawinan",
    "pekerjaan",
    "kewarganegaraan",
    "berlaku hingga",
  ]);
}

function inferNameFromKtp(lines, nik) {
  const nameByLabel = ktpField(lines, ["nama", "name"]);
  if (nameByLabel) return nameByLabel;

  const nikIndex = lines.findIndex((line) => nik && line.includes(nik));
  const candidateIndexes = nikIndex >= 0
    ? [nikIndex + 1, nikIndex + 2, nikIndex + 3]
    : [1, 2, 3, 4];

  for (const index of candidateIndexes) {
    const line = lines[index]?.trim();
    if (!line || isKtpSectionLabel(line)) continue;

    const cleaned = line
      .replace(/^[^A-Za-z]+/, "")
      .replace(/\b\d{2}[-/]\d{2}[-/]\d{4}\b.*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (
      cleaned.length >= 4 &&
      cleaned.length <= 80 &&
      /[A-Za-z]{2}/.test(cleaned) &&
      !/provinsi|kabupaten|kota|nik|tempat|lahir|alamat|agama|status|pekerjaan|kelamin/i.test(cleaned)
    ) {
      return cleaned;
    }
  }

  return "";
}

function extractCompleteAddress(lines) {
  let startIndex = lines.findIndex((line) => looksLikeLabel(line, ["alamat"]));
  if (startIndex < 0) return "";

  const first = ktpField(lines, ["alamat"]);
  const parts = [];
  if (first) parts.push(first);

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (looksLikeLabel(line, [
      "agama",
      "status perkawinan",
      "pekerjaan",
      "kewarganegaraan",
      "berlaku hingga",
    ])) break;

    const rtRw = ktpField([line], ["rt/rw"]);
    if (looksLikeLabel(line, ["rt/rw"])) {
      if (rtRw) parts.push(`RT/RW ${rtRw}`);
      continue;
    }

    const kelDesa = ktpField([line], ["kel/desa", "kelurahan/desa", "kelurahan"]);
    if (looksLikeLabel(line, ["kel/desa", "kelurahan/desa", "kelurahan"])) {
      if (kelDesa) parts.push(`Kel/Desa ${kelDesa}`);
      continue;
    }

    const kecamatan = ktpField([line], ["kecamatan"]);
    if (looksLikeLabel(line, ["kecamatan"])) {
      if (kecamatan) parts.push(`Kecamatan ${kecamatan}`);
      continue;
    }

    if (!isKtpSectionLabel(line) && !/^(LAKI[- ]?LAKI|PEREMPUAN)$/i.test(line)) {
      parts.push(line);
    }
  }

  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))].join(", ");
}

function parseKtpText(rawText) {
  const text = normalizeKtpOcrText(rawText);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const nikMatch = text.match(/(?:NIK\s*[:;=\-]?\s*)?\b(\d{16})\b/i);
  const nik = nikMatch?.[1] || "";
  const name = inferNameFromKtp(lines, nik)
    .replace(/^[.:;=\-\s]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const birthRaw = ktpField(lines, [
    "tempat/tgl lahir",
    "tempat / tgl lahir",
    "tempat, tgl lahir",
    "tempat tgl lahir",
  ]);
  const birthDateMatch = birthRaw.match(/(\d{2}[-/]\d{2}[-/]\d{4})/);
  const birthPlace = birthRaw
    .replace(/[, ]*\d{2}[-/]\d{2}[-/]\d{4}.*$/, "")
    .trim();

  const genderRaw = ktpField(lines, ["jenis kelamin", "kelamin"]);
  const gender = /perempuan|wanita/i.test(genderRaw)
    ? "PEREMPUAN"
    : /laki|pria/i.test(genderRaw)
      ? "LAKI-LAKI"
      : genderRaw;

  const address = extractCompleteAddress(lines);
  const religion = ktpField(lines, ["agama"]);
  const maritalStatus = ktpField(lines, ["status perkawinan"]);
  const occupation = ktpField(lines, ["pekerjaan"]);

  return {
    nik: nik || undefined,
    name: name || undefined,
    birthPlace: birthPlace || undefined,
    birthDate: birthDateMatch?.[1] || undefined,
    address: address || undefined,
    gender: gender || undefined,
    religion: religion || undefined,
    maritalStatus: maritalStatus || undefined,
    occupation: occupation || undefined,
    text,
  };
}

function scoreKtpData(data) {
  let score = 0;
  if (data.nik) score += 4;
  if (data.name) score += 4;
  if (data.birthDate) score += 2;
  if (data.gender) score += 1;
  if (data.address) score += Math.min(4, 1 + Math.floor(data.address.length / 25));
  if (data.religion) score += 1;
  if (data.maritalStatus) score += 1;
  if (data.occupation) score += 1;
  return score;
}

export async function ocrKtp(file) {
  validateDocumentFile(file, { ocr: true });
  let tesseract;
  try {
    tesseract = await import("tesseract.js");
  } catch {
    const error = new Error("Dependency KTP OCR belum tersedia di development.");
    error.statusCode = 501;
    throw error;
  }

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const worker = await tesseract.createWorker("ind");
  try {
    const firstResult = await worker.recognize(imageBuffer);
    let best = parseKtpText(firstResult.data?.text?.trim() || "");

    if (!best.name || !best.nik || !best.address || best.address.length < 20) {
      await worker.setParameters({
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1",
      });
      const blockResult = await worker.recognize(imageBuffer);
      const blockData = parseKtpText(blockResult.data?.text?.trim() || "");
      if (scoreKtpData(blockData) > scoreKtpData(best)) best = blockData;
    }

    return best;
  } finally {
    await worker.terminate();
  }
}

export { MAX_FILE_BYTES, ALLOWED_MIME_TYPES, MAX_VENDOR_ASSET_BYTES, ALLOWED_VENDOR_ASSET_TYPES };
export async function uploadAiChatDocument({ file }) {
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  await ensurePrivateBucket(storage);
  const path = `ai-chat-documents/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName(file.name || `document.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(
    path,
    Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, cacheControl: "0", upsert: false },
  );
  if (error) {
    const failure = new Error("Upload dokumen AI chat gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function uploadVendorCatalogImage({ vendorId, catalogItemId, file }) {
  if (!file || typeof file.arrayBuffer !== "function") { const e = new Error("File gambar vendor wajib diunggah."); e.statusCode=400; throw e; }
  const mimeType=String(file.type||"").toLowerCase(), size=Number(file.size);
  if (!["image/jpeg","image/png","image/webp"].includes(mimeType)) { const e=new Error("Gambar vendor harus JPG, PNG, atau WEBP."); e.statusCode=415; throw e; }
  if (!Number.isFinite(size)||size<=0||size>MAX_FILE_BYTES) { const e=new Error("Ukuran gambar vendor maksimal 5 MB."); e.statusCode=413; throw e; }
  const storage=publicAssetStorage();
  const path=`vendor-catalog/vendor-${Number(vendorId)}/item-${Number(catalogItemId)}/${crypto.randomUUID()}-${safeFileName(file.name||"image")}`;
  const result=await storage.supabase.storage.from(storage.bucket).upload(path,Buffer.from(await file.arrayBuffer()),{contentType:mimeType,cacheControl:"3600",upsert:false});
  if(result.error){const e=new Error("Upload gambar vendor gagal.");e.statusCode=502;throw e;}
  const publicData=storage.supabase.storage.from(storage.bucket).getPublicUrl(path);
  return {path,url:publicData.data?.publicUrl??null,fileName:safeFileName(file.name),mimeType,size};
}

export async function uploadVendorCatalogAsset({ vendorId, catalogItemId, file }) {
  if (!file || typeof file.arrayBuffer !== "function") { const e=new Error("File media vendor wajib diunggah."); e.statusCode=400; throw e; }
  const mimeType=String(file.type||"").toLowerCase(), size=Number(file.size);
  if (!ALLOWED_VENDOR_ASSET_TYPES.has(mimeType)) { const e=new Error("Tipe media vendor tidak didukung."); e.statusCode=415; throw e; }
  if (!Number.isFinite(size)||size<=0||size>MAX_VENDOR_ASSET_BYTES) { const e=new Error("Ukuran media vendor maksimal 50 MB."); e.statusCode=413; throw e; }
  const storage=publicAssetStorage();
  const path=`vendor-catalog/vendor-${Number(vendorId)}/item-${Number(catalogItemId)}/${crypto.randomUUID()}-${safeFileName(file.name||"asset")}`;
  const result=await storage.supabase.storage.from(storage.bucket).upload(path,Buffer.from(await file.arrayBuffer()),{contentType:mimeType,cacheControl:"3600",upsert:false});
  if(result.error){const e=new Error("Upload media vendor gagal.");e.statusCode=502;throw e;}
  const publicData=storage.supabase.storage.from(storage.bucket).getPublicUrl(path);
  return {objectPath:path,url:publicData.data?.publicUrl??null,fileName:safeFileName(file.name),mimeType,sizeBytes:size};
}
