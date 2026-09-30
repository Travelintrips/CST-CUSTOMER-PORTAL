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

function cleanKtpNameCandidate(value) {
  return String(value || "")
    .replace(/^[^A-Za-z]+/, "")
    .replace(/\b\d{2}[-/]\d{2}[-/]\d{4}\b.*$/, "")
    .replace(/[^A-Za-z.' -]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function scoreKtpNameCandidate(value, { distance = 99, labelled = false } = {}) {
  const name = cleanKtpNameCandidate(value);
  if (name.length < 3 || name.length > 60) return -100;
  if (/provinsi|kabupaten|kota|nik|tempat|lahir|alamat|agama|status|pekerjaan|kelamin|kecamatan|kelurahan|desa/i.test(name)) return -100;

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length > 6) return -40;

  let score = 0;
  if (labelled) score += 10;
  score += Math.max(0, 8 - distance * 2);

  const alpha = name.replace(/[^A-Za-z]/g, "");
  const upper = alpha.replace(/[^A-Z]/g, "");
  const lower = alpha.replace(/[^a-z]/g, "");
  const upperRatio = alpha.length ? upper.length / alpha.length : 0;
  if (upperRatio >= 0.9) score += 8;
  else if (upperRatio >= 0.7) score += 4;
  else if (lower.length > 0 && upper.length > 0) score -= 6;

  for (const word of words) {
    if (word.length === 1) score -= 5;
    if (word.length === 2) score -= 2;
    if (/(.)\1\1/i.test(word)) score -= 3;
  }

  if (/^[A-Z][A-Z ]+$/.test(name)) score += 3;
  if (/\b(?:EA|AA|MAA|RAR|SAE)\b/i.test(name)) score -= 8;
  return score;
}

function inferNameFromKtp(lines, nik) {
  const candidates = [];
  const nikIndex = lines.findIndex((line) => nik && line.includes(nik));

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) continue;

    if (looksLikeLabel(line, ["nama", "name"])) {
      const labelled = ktpField([line, lines[index + 1]].filter(Boolean), ["nama", "name"]);
      if (labelled) {
        candidates.push({
          value: labelled,
          score: scoreKtpNameCandidate(labelled, {
            labelled: true,
            distance: nikIndex >= 0 ? Math.abs(index - nikIndex) : 2,
          }),
        });
      }
    }

    const cleaned = cleanKtpNameCandidate(line);
    if (!cleaned || isKtpSectionLabel(line)) continue;

    const distance = nikIndex >= 0 ? Math.abs(index - nikIndex) : index;
    if (distance > 6) continue;

    candidates.push({
      value: cleaned,
      score: scoreKtpNameCandidate(cleaned, { distance }),
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return best && best.score >= 4 ? best.value : "";
}

function cleanAddressValue(value) {
  return String(value || "")
    .replace(/^[.:;=\-—\s]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractLabelValueLoose(line, aliases) {
  const clean = String(line || "").trim();
  const compact = normalizedLabel(clean);
  for (const alias of aliases) {
    const target = normalizedLabel(alias);
    if (!target) continue;
    const pos = compact.indexOf(target);
    if (pos < 0 || pos > 3) continue;

    const separator = clean.match(/[:;=—-]\s*(.+)$/);
    if (separator?.[1]?.trim()) return cleanAddressValue(separator[1]);

    const tokens = clean.split(/\s+/);
    const aliasWords = String(alias).trim().split(/\s+/).length;
    const inline = tokens.slice(aliasWords).join(" ").trim();
    if (inline) return cleanAddressValue(inline);
  }
  return "";
}

function stripLikelyKtpLabel(value) {
  const line = cleanAddressValue(value);
  return line
    .replace(/^(?:alamat|alarnat|alamal|rt\/?rw|rtrw|kel\/?desa|kelurahan\/?desa|kelurahan|desa|kecamatan|kec)\s*[:;=—-]?\s*/i, "")
    .replace(/^[A-Za-z .]{1,18}\s*[:;=—-]\s*/, "")
    .trim();
}

function inferAddressByPosition(lines) {
  const candidates = [];

  const stopLine = (line) =>
    looksLikeLabel(line, ["agama", "status perkawinan", "pekerjaan", "kewarganegaraan", "berlaku hingga"]) ||
    /\b(?:ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KAWIN|BELUM KAWIN|WIRASWASTA|KARYAWAN|PELAJAR|MAHASISWA|WNI|WNA)\b/i.test(line);

  const pushWindow = (start, end) => {
    const parts = [];
    for (let i = Math.max(0, start); i <= Math.min(lines.length - 1, end); i += 1) {
      let line = lines[i]?.trim();
      if (!line) continue;
      if (stopLine(line)) break;
      if (/^(LAKI[- ]?LAKI|PEREMPUAN)$/i.test(line)) continue;

      line = stripLikelyKtpLabel(line)
        .replace(/\bGol\.?\s*Darah\b.*$/i, "")
        .trim();

      if (!line || line.length < 2) continue;
      if (/^(?:NIK|NAMA|TEMPAT|TGL|LAHIR|JENIS|KELAMIN)$/i.test(line)) continue;
      parts.push(line);
    }

    const value = [...new Set(parts)].join(", ");
    if (value) candidates.push(value);
  };

  // Strongest anchor: an RT/RW-looking value, even when its label is mangled.
  for (let i = 0; i < lines.length; i += 1) {
    if (/\b\d{3}\s*[\/-]\s*\d{3}\b/.test(lines[i])) {
      pushWindow(i - 1, i + 3);
    }
  }

  // Common KTP layout: address block follows Jenis Kelamin/Gol. Darah.
  const genderIndex = lines.findIndex((line) => /LAKI[- ]?LAKI|PEREMPUAN/i.test(line));
  if (genderIndex >= 0) pushWindow(genderIndex + 1, genderIndex + 5);

  // If Alamat text itself is OCR-corrupted, scan the middle KTP region between
  // birth/gender data and the religion/status section.
  const birthIndex = lines.findIndex((line) => /\d{2}[-/]\d{2}[-/]\d{4}/.test(line));
  const religionIndex = lines.findIndex((line) => stopLine(line));
  if (birthIndex >= 0 && religionIndex > birthIndex + 1) {
    pushWindow(birthIndex + 1, Math.min(religionIndex - 1, birthIndex + 7));
  }

  return candidates
    .map((value) => ({ value, score: scoreKtpAddress(value) }))
    .sort((a, b) => b.score - a.score)[0]?.value || "";
}

function extractCompleteAddress(lines) {
  const addressAliases = ["alamat", "alarnat", "alamal", "alarnal", "alamat ktp"];
  const rtAliases = ["rt/rw", "rt rw", "rtrw"];
  const kelAliases = ["kel/desa", "kel desa", "kelurahan/desa", "kelurahan", "desa"];
  const kecAliases = ["kecamatan", "kecarnatan", "kecarnatan", "kec"];

  const addressIndex = lines.findIndex((line) => looksLikeLabel(line, addressAliases));
  const rtIndex = lines.findIndex((line) => looksLikeLabel(line, rtAliases));
  const kelIndex = lines.findIndex((line) => looksLikeLabel(line, kelAliases));
  const kecIndex = lines.findIndex((line) => looksLikeLabel(line, kecAliases));

  const parts = [];

  // Main street/address line. Prefer an explicit Alamat label, but if OCR misses
  // that label use the line immediately before RT/RW as the KTP address.
  if (addressIndex >= 0) {
    const explicit = extractLabelValueLoose(lines[addressIndex], addressAliases)
      || ktpField(lines.slice(addressIndex, addressIndex + 2), addressAliases);
    if (explicit) parts.push(cleanAddressValue(explicit));
  }

  if (parts.length === 0 && rtIndex > 0) {
    for (let index = rtIndex - 1; index >= Math.max(0, rtIndex - 3); index -= 1) {
      const candidate = cleanAddressValue(lines[index]);
      if (
        candidate &&
        !isKtpSectionLabel(candidate) &&
        !/^(LAKI[- ]?LAKI|PEREMPUAN)$/i.test(candidate) &&
        !/gol\.?\s*darah|agama|status|pekerjaan/i.test(candidate)
      ) {
        const stripped = candidate.replace(/^.*?(?:alamat|alarnat|alamal)\s*[:;=—-]?\s*/i, "");
        if (stripped) {
          parts.push(cleanAddressValue(stripped));
          break;
        }
      }
    }
  }

  if (rtIndex >= 0) {
    const value = extractLabelValueLoose(lines[rtIndex], rtAliases)
      || ktpField([lines[rtIndex]], rtAliases);
    if (value) parts.push(`RT/RW ${cleanAddressValue(value)}`);
  }

  if (kelIndex >= 0) {
    const value = extractLabelValueLoose(lines[kelIndex], kelAliases)
      || ktpField([lines[kelIndex]], kelAliases);
    if (value) parts.push(`Kel/Desa ${cleanAddressValue(value)}`);
  }

  if (kecIndex >= 0) {
    const value = extractLabelValueLoose(lines[kecIndex], kecAliases)
      || ktpField([lines[kecIndex]], kecAliases);
    if (value) parts.push(`Kecamatan ${cleanAddressValue(value)}`);
  }

  // Preserve continuation lines that sit between Alamat and Agama, while
  // avoiding duplicate structural labels already handled above.
  const startIndex = addressIndex >= 0 ? addressIndex + 1 : (rtIndex >= 0 ? rtIndex + 1 : -1);
  if (startIndex >= 0) {
    for (let index = startIndex; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) continue;
      if (looksLikeLabel(line, ["agama", "status perkawinan", "pekerjaan", "kewarganegaraan", "berlaku hingga"])) break;
      if (
        looksLikeLabel(line, rtAliases) ||
        looksLikeLabel(line, kelAliases) ||
        looksLikeLabel(line, kecAliases)
      ) continue;
      if (!isKtpSectionLabel(line) && !/^(LAKI[- ]?LAKI|PEREMPUAN)$/i.test(line)) {
        const value = cleanAddressValue(line);
        if (value && value.length >= 3) parts.push(value);
      }
    }
  }

  const structured = [...new Set(parts.map((part) => part.trim()).filter(Boolean))].join(", ");
  const positional = inferAddressByPosition(lines);

  if (!structured) return positional;
  if (!positional) return structured;
  return scoreKtpAddress(positional) > scoreKtpAddress(structured) ? positional : structured;
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

function scoreKtpAddress(value) {
  const address = cleanAddressValue(value);
  if (!address) return -100;
  let score = Math.min(12, Math.floor(address.length / 8));
  if (/rt\/rw/i.test(address)) score += 6;
  if (/kel\/desa|kelurahan|desa/i.test(address)) score += 5;
  if (/kecamatan/i.test(address)) score += 5;
  if (/\b\d{3}\/\d{3}\b/.test(address)) score += 3;
  if (/agama|pekerjaan|status perkawinan|kewarganegaraan/i.test(address)) score -= 8;
  return score;
}

function mergeKtpAttempts(attempts) {
  const byOverall = attempts.slice().sort((a, b) => scoreKtpData(b) - scoreKtpData(a));
  const base = { ...(byOverall[0] || {}) };

  const bestName = attempts
    .filter((item) => item?.name)
    .map((item) => ({
      value: item.name,
      score: scoreKtpNameCandidate(item.name, { labelled: true, distance: 1 }),
    }))
    .sort((a, b) => b.score - a.score)[0];

  const bestAddress = attempts
    .filter((item) => item?.address)
    .map((item) => ({ value: item.address, score: scoreKtpAddress(item.address) }))
    .sort((a, b) => b.score - a.score)[0];

  const firstValue = (key) => attempts.find((item) => item?.[key])?.[key];

  return {
    ...base,
    nik: firstValue("nik") || base.nik,
    name: bestName?.score >= 4 ? bestName.value : undefined,
    birthPlace: firstValue("birthPlace") || base.birthPlace,
    birthDate: firstValue("birthDate") || base.birthDate,
    address: bestAddress?.score >= 0 ? bestAddress.value : undefined,
    gender: firstValue("gender") || base.gender,
    religion: firstValue("religion") || base.religion,
    maritalStatus: firstValue("maritalStatus") || base.maritalStatus,
    occupation: firstValue("occupation") || base.occupation,
    text: attempts.map((item) => item?.text).filter(Boolean).join("\n\n--- OCR ATTEMPT ---\n\n"),
  };
}

async function ocrKtpWithVision({ imageBuffer, mimeType }) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = (process.env.OPENAI_KTP_OCR_MODEL || "gpt-4o-mini").trim();
  const dataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

  const prompt = [
    "Anda membaca KTP Indonesia dari gambar.",
    "Ekstrak HANYA teks yang benar-benar terlihat. Jangan menebak, jangan melengkapi data yang tidak terbaca.",
    "Jika sebuah field tidak yakin, isi null.",
    "Khusus nama: jangan keluarkan noise OCR, simbol, label, atau potongan huruf.",
    "Khusus alamat: gabungkan alamat utama + RT/RW + Kel/Desa + Kecamatan jika terlihat.",
    "Kembalikan JSON valid dengan key berikut saja:",
    "nik, name, birthPlace, birthDate, gender, address, rtRw, village, district, religion, maritalStatus, occupation, confidence.",
    "confidence adalah angka 0 sampai 1 untuk kualitas ekstraksi keseluruhan.",
  ].join("\n");

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        }],
      }),
    });
  } catch (error) {
    console.warn("[customer-portal-api] KTP vision OCR unavailable", error?.message ?? error);
    return null;
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn("[customer-portal-api] KTP vision OCR provider error", response.status, payload?.error?.message ?? "");
    return null;
  }

  const raw = payload?.choices?.[0]?.message?.content;
  if (!raw) return null;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  const nikDigits = String(data.nik || "").replace(/\D/g, "");
  const nik = nikDigits.length === 16 ? nikDigits : undefined;

  const name = cleanKtpNameCandidate(data.name);
  const safeName = scoreKtpNameCandidate(name, { labelled: true, distance: 1 }) >= 4
    ? name.toUpperCase()
    : undefined;

  const street = cleanAddressValue(data.address);
  const rtRw = cleanAddressValue(data.rtRw);
  const village = cleanAddressValue(data.village);
  const district = cleanAddressValue(data.district);

  const addressParts = [];
  if (street) addressParts.push(street);
  if (rtRw) addressParts.push(/^RT\/RW\b/i.test(rtRw) ? rtRw : `RT/RW ${rtRw}`);
  if (village) addressParts.push(/^(Kel\/Desa|Kelurahan|Desa)\b/i.test(village) ? village : `Kel/Desa ${village}`);
  if (district) addressParts.push(/^Kecamatan\b/i.test(district) ? district : `Kecamatan ${district}`);
  const fullAddress = [...new Set(addressParts)].join(", ");

  const confidence = Number(data.confidence);
  return {
    nik,
    name: safeName,
    birthPlace: cleanAddressValue(data.birthPlace) || undefined,
    birthDate: cleanAddressValue(data.birthDate) || undefined,
    gender: cleanAddressValue(data.gender) || undefined,
    address: fullAddress || undefined,
    religion: cleanAddressValue(data.religion) || undefined,
    maritalStatus: cleanAddressValue(data.maritalStatus) || undefined,
    occupation: cleanAddressValue(data.occupation) || undefined,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : undefined,
    source: "vision",
    text: undefined,
  };
}

function mergeVisionAndTesseract(vision, tesseract) {
  if (!vision) return { ...tesseract, source: "tesseract" };

  const result = {
    ...tesseract,
    ...vision,
    nik: vision.nik || tesseract?.nik,
    name: vision.name || tesseract?.name,
    birthPlace: vision.birthPlace || tesseract?.birthPlace,
    birthDate: vision.birthDate || tesseract?.birthDate,
    gender: vision.gender || tesseract?.gender,
    address: vision.address || tesseract?.address,
    religion: vision.religion || tesseract?.religion,
    maritalStatus: vision.maritalStatus || tesseract?.maritalStatus,
    occupation: vision.occupation || tesseract?.occupation,
    source: vision.address || vision.name ? "vision" : "tesseract",
    text: tesseract?.text,
  };

  // Never autofill obviously unreliable identity fields.
  if (result.name && scoreKtpNameCandidate(result.name, { labelled: true, distance: 1 }) < 4) {
    result.name = undefined;
  }
  if (result.nik && !/^\d{16}$/.test(result.nik)) result.nik = undefined;
  if (result.address && scoreKtpAddress(result.address) < 0) result.address = undefined;

  return result;
}

export async function ocrKtp(file) {
  const { mimeType } = validateDocumentFile(file, { ocr: true });
  const imageBuffer = Buffer.from(await file.arrayBuffer());

  const vision = await ocrKtpWithVision({ imageBuffer, mimeType });

  // If vision extracted the two most important fields with reasonable
  // confidence, use it directly and avoid a slower local OCR pass.
  if (
    vision?.name &&
    vision?.address &&
    Number(vision?.confidence ?? 0) >= 0.72
  ) {
    return vision;
  }

  let tesseract;
  try {
    tesseract = await import("tesseract.js");
  } catch {
    if (vision) return vision;
    const error = new Error("Dependency KTP OCR belum tersedia di development.");
    error.statusCode = 501;
    throw error;
  }

  const worker = await tesseract.createWorker("ind");
  try {
    const attempts = [];

    const firstResult = await worker.recognize(imageBuffer);
    attempts.push(parseKtpText(firstResult.data?.text?.trim() || ""));

    for (const pageSegMode of ["6", "4", "11"]) {
      const merged = mergeKtpAttempts(attempts);

      if (
        merged?.name &&
        scoreKtpNameCandidate(merged.name, { labelled: true, distance: 1 }) >= 10 &&
        merged?.nik &&
        merged?.address &&
        scoreKtpAddress(merged.address) >= 8
      ) break;

      await worker.setParameters({
        tessedit_pageseg_mode: pageSegMode,
        preserve_interword_spaces: "1",
      });
      const result = await worker.recognize(imageBuffer);
      attempts.push(parseKtpText(result.data?.text?.trim() || ""));
    }

    return mergeVisionAndTesseract(vision, mergeKtpAttempts(attempts));
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
