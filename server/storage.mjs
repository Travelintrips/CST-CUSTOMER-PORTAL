import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 5 * 60;
const ALLOWED_DOCUMENT_TYPES = new Set(["ktp", "legalitas", "sim", "stnk"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);

function isProduction() {
  return process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
}

function storageConfig() {
  if (isProduction()) {
    const error = new Error("Development document storage is disabled in production.");
    error.statusCode = 503;
    throw error;
  }
  const url = process.env.VITE_SUPABASE_URL_DEV || process.env.SUPABASE_URL_DEV;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_DEV;
  if (!url || !serviceRoleKey || !bucket) {
    const error = new Error("Development document storage is not configured.");
    error.statusCode = 503;
    throw error;
  }
  if (bucket === "public-assets") {
    const error = new Error("Document storage cannot use the public-assets bucket.");
    error.statusCode = 503;
    throw error;
  }
  const parsedUrl = new URL(url);
  if (!parsedUrl.hostname.endsWith(".supabase.co")) {
    const error = new Error("Development document storage URL is invalid.");
    error.statusCode = 503;
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
  const { error } = await storage.supabase.storage.from(storage.bucket).remove([path]);
  if (error) throw error;
}

export async function uploadDocument({ customerId, companyId, documentType: type, file }) {
  const normalizedType = documentType(type);
  const { mimeType, size } = validateDocumentFile(file);
  const storage = client();
  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${customerObjectPrefix(customerId, companyId)}/${normalizedType}/${crypto.randomUUID()}-${safeFileName(file.name || `document.${extensionForMime(mimeType)}`)}`;
  const { error } = await storage.supabase.storage.from(storage.bucket).upload(path, buffer, {
    contentType: mimeType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    const failure = new Error("Upload dokumen ke development storage gagal.");
    failure.statusCode = 502;
    throw failure;
  }
  return { path, fileName: safeFileName(file.name), mimeType, size };
}

export async function deleteDocumentObject(path) {
  const storage = client();
  await storageRemove(storage, path);
}

export async function signedDocumentUrl(path) {
  const storage = client();
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
  const worker = await tesseract.createWorker("ind");
  try {
    const result = await worker.recognize(Buffer.from(await file.arrayBuffer()));
    const text = result.data?.text?.trim() || "";
    return { text };
  } finally {
    await worker.terminate();
  }
}

export { MAX_FILE_BYTES, ALLOWED_MIME_TYPES };