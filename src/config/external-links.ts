const DEFAULT_BIZPORTAL_BASE_URL = "https://cstlogistic.co.id/bizportal";

function normalizeExternalBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "VITE_BIZPORTAL_BASE_URL must be an absolute external http(s) URL",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      "VITE_BIZPORTAL_BASE_URL must use the http or https protocol",
    );
  }

  return parsed.toString().replace(/\/+$/, "");
}

export const BIZPORTAL_BASE_URL = normalizeExternalBaseUrl(
  import.meta.env.VITE_BIZPORTAL_BASE_URL ?? DEFAULT_BIZPORTAL_BASE_URL,
);

export function bizPortalUrl(path = ""): string {
  const suffix = path.replace(/^\/+/, "");
  return suffix ? `${BIZPORTAL_BASE_URL}/${suffix}` : `${BIZPORTAL_BASE_URL}/`;
}