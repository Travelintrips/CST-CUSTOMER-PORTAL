import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const ALLOWED_ENVIRONMENTS = new Set(["development", "production"]);
const DEFAULT_BUNDLE_PREFIX = "customer-portal";
const REQUIRED_SECRETS = [
  ["SESSION_SECRET", 32],
  ["SUPABASE_DATABASE_URL", 10],
];
const DEVELOPMENT_STORAGE_SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY_DEV",
  "SUPABASE_STORAGE_BUCKET_DEV",
  "SUPABASE_URL_DEV",
];
const DEVELOPMENT_ALIAS_SOURCES = [
  ["SUPABASE_SERVICE_ROLE_KEY_DEV", ["SUPABASE_SERVICE_ROLE_KEY"]],
  ["SUPABASE_STORAGE_BUCKET_DEV", ["SUPABASE_STORAGE_BUCKET"]],
  ["SUPABASE_URL_DEV", ["SUPABASE_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_URL_DEV"]],
];

function resolveEnvironment(env) {
  const appEnv = env.APP_ENV;
  if (!ALLOWED_ENVIRONMENTS.has(appEnv)) {
    throw new Error(
      `APP_ENV must be development or production; received ${appEnv ? `"${appEnv}"` : "empty"}.`,
    );
  }
  return appEnv;
}

function validateBootstrapJson(raw) {
  if (!raw) throw new Error("GCP_SECRET_MANAGER_BOOTSTRAP_JSON is required.");
  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error("GCP_SECRET_MANAGER_BOOTSTRAP_JSON is invalid JSON.");
  }
  const missing = ["project_id", "client_email", "private_key"].filter(
    (key) => !credentials?.[key],
  );
  if (missing.length) {
    throw new Error(`GCP bootstrap is missing required fields: ${missing.join(", ")}.`);
  }
  return credentials;
}

function injectBundle(payload, appEnv, target) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Secret Manager bundle must be a flat JSON object.");
  }
  if (payload.APP_ENV && payload.APP_ENV !== appEnv) {
    throw new Error(
      `Secret Manager bundle environment mismatch: ${payload.APP_ENV} != ${appEnv}.`,
    );
  }

  const injected = [];
  const hasDevVariant = new Set(
    Object.keys(payload)
      .filter((key) => key.endsWith("_DEV"))
      .map((key) => key.slice(0, -4)),
  );

  const GOOGLE_OAUTH_KEYS = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_BASE_URL",
  ];
  const hasCompleteHostGoogleBundle = appEnv === "production"
    && GOOGLE_OAUTH_KEYS.every(
      (key) => typeof target[key] === "string" && target[key].trim(),
    );
  const hasCompleteGcpGoogleBundle = GOOGLE_OAUTH_KEYS.every(
    (key) => typeof payload[key] === "string" && payload[key].trim(),
  );

  if (appEnv === "production" && hasCompleteGcpGoogleBundle) {
    target.GOOGLE_GCP_FALLBACK_CLIENT_ID = payload.GOOGLE_CLIENT_ID;
    target.GOOGLE_GCP_FALLBACK_CLIENT_SECRET = payload.GOOGLE_CLIENT_SECRET;
    target.GOOGLE_GCP_FALLBACK_REDIRECT_BASE_URL = payload.GOOGLE_REDIRECT_BASE_URL;
  }

  // Google OAuth must stay atomic: never mix a client id from one source with
  // a secret/redirect from another. Hostinger wins when its whole bundle is
  // present. Otherwise, if GCP has a complete bundle, use that whole bundle.
  if (appEnv === "production" && hasCompleteHostGoogleBundle) {
    for (const key of GOOGLE_OAUTH_KEYS) {
      delete payload[key];
    }
  } else if (appEnv === "production" && hasCompleteGcpGoogleBundle) {
    for (const key of GOOGLE_OAUTH_KEYS) {
      target[key] = payload[key];
      injected.push(key);
      delete payload[key];
    }
  }

  const set = (key, value) => {
    if (key === "APP_ENV" || typeof value !== "string" || !value) return;
    target[key] = value;
    injected.push(key);
  };

  if (appEnv === "development") {
    for (const [key, value] of Object.entries(payload)) {
      if (!key.endsWith("_DEV")) continue;
      set(key, value);
      set(key.slice(0, -4), value);
    }
    for (const [key, value] of Object.entries(payload)) {
      if (key === "APP_ENV" || key.endsWith("_DEV") || hasDevVariant.has(key)) continue;
      set(key, value);
    }
  } else {
    for (const [key, value] of Object.entries(payload)) {
      if (!key.endsWith("_DEV")) set(key, value);
    }
  }

  if (appEnv === "development") {
    for (const [developmentKey, sourceKeys] of DEVELOPMENT_ALIAS_SOURCES) {
      if (payload[developmentKey]) continue;
      const sourceKey = sourceKeys.find(
        (key) => typeof payload[key] === "string" && payload[key],
      );
      if (sourceKey) set(developmentKey, payload[sourceKey]);
    }
  }

  return [...new Set(injected)];
}

function validateLoadedEnvironment(env, appEnv, loadedKeys) {
  const missing = REQUIRED_SECRETS
    .filter(([key, minLength]) => !env[key] || env[key].length < minLength)
    .map(([key]) => key);

  if (appEnv === "development") {
    for (const key of DEVELOPMENT_STORAGE_SECRETS) {
      if (!env[key] || !loadedKeys.includes(key)) missing.push(key);
    }
  }

  if (missing.length) {
    throw new Error(
      `Secret Manager bundle is missing required keys: ${missing.join(", ")}.`,
    );
  }
}

export async function loadSecrets(target = process.env) {
  const appEnv = resolveEnvironment(target);
  const credentials = validateBootstrapJson(target.GCP_SECRET_MANAGER_BOOTSTRAP_JSON);
  const bundlePrefix = target.GCP_SECRET_BUNDLE_PREFIX || DEFAULT_BUNDLE_PREFIX;
  const bundleName = `${bundlePrefix}-${appEnv}`;
  const secretName =
    `projects/${credentials.project_id}/secrets/${bundleName}/versions/latest`;

  const client = new SecretManagerServiceClient({ credentials });
  const [version] = await client.accessSecretVersion({ name: secretName });
  const rawPayload = version.payload?.data?.toString("utf8");
  if (!rawPayload) throw new Error(`Secret Manager bundle ${bundleName} is empty.`);

  let payload;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw new Error(`Secret Manager bundle ${bundleName} is invalid JSON.`);
  }

  const loadedKeys = injectBundle(payload, appEnv, target);
  validateLoadedEnvironment(target, appEnv, loadedKeys);

  if (appEnv === "development") {
    console.log(
      `[load-secrets] storage: SUPABASE_SERVICE_ROLE_KEY_DEV=${target.SUPABASE_SERVICE_ROLE_KEY_DEV ? "AVAILABLE" : "MISSING"} ` +
        `SUPABASE_STORAGE_BUCKET_DEV=${target.SUPABASE_STORAGE_BUCKET_DEV ? "AVAILABLE" : "MISSING"}`,
    );
  }

  console.log(`[load-secrets] loaded ${loadedKeys.length} keys from ${bundleName}.`);
  return { appEnv, bundleName, loadedKeys };
}
