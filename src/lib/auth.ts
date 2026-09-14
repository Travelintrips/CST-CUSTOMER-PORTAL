/**
 * auth.ts — Customer Portal authentication utilities.
 *
 * C1-REMEDIATION (dual-mode migration):
 *   - New logins: token is stored as HttpOnly cookie (portal_session) set by the server.
 *     Frontend does NOT write the token to localStorage for new logins.
 *   - Existing localStorage tokens remain available only for explicit migration
 *     calls; they are never treated as proof of an authenticated UI session.
 *   - All API calls include `credentials: 'include'` so the browser sends the session cookie.
 *   - `isAuthenticated()` trusts the server-set session hint or a bootstrap
 *     response that was just verified by the server. A stale or forged
 *     localStorage token cannot unlock authenticated UI routes.
 *   - Legacy Bearer path will be removed after 2026-12-31 or next major release.
 *   - Profile cache (portal_profile) is UI-only; it is NOT the source of authorization.
 *
 * Trusted device (phone OTP remember-me) is still stored in localStorage because it
 * is a separate low-privilege token used only as a login shortcut, not for API auth.
 */
import { supabase } from "./supabase";

export const TOKEN_KEY       = "portal_token";
const PROFILE_KEY            = "portal_profile";
const DEV_TOKEN_KEY          = "portal_dev_token";
export const TRUSTED_DEVICE_KEY = "cst_trusted_device";
export const REMEMBER_DAYS   = 30;
let portalAuthBootstrapCache: PortalAuthBootstrap | null = null;
let portalAuthBootstrapInFlight: Promise<PortalAuthBootstrap | null> | null = null;

interface PortalProfile {
  customerId: number;
  role: string;
  name: string;
  email: string;
}

export type PortalAuthBootstrap = {
  authenticated: true;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    role: string;
    customerType: string | null;
  };
  role: string;
  onboardingComplete: boolean;
  onboardingStatus: string;
  customerType: string | null;
  customerContext: {
    status: string;
    companyId: number | null;
    company: unknown;
    activeMemberships: unknown[];
    pendingRequest: unknown;
  };
  vendorApprovalStatus: string | null;
  allowedDestination: string;
  safeReturnTo: string | null;
  timings?: {
    USER_PROFILE_MS: number;
    ROLE_RESOLUTION_MS: number;
    ONBOARDING_STATUS_MS: number;
    COMPANY_CONTEXT_MS: number;
    VENDOR_APPROVAL_MS: number;
    REDIRECT_DECISION_MS: number;
    TOTAL_RESOLUTION_MS: number;
  };
};

interface TrustedDeviceData {
  phone: string;
  deviceToken: string;
  expiresAt: number;
}

// ── Trusted device helpers ────────────────────────────────────────────────────
// Trusted device token is a low-privilege phone-login shortcut, NOT an API auth token.

export function saveTrustedDevice(phone: string, deviceToken: string): void {
  const data: TrustedDeviceData = {
    phone,
    deviceToken,
    expiresAt: Date.now() + REMEMBER_DAYS * 86400_000,
  };
  localStorage.setItem(TRUSTED_DEVICE_KEY, JSON.stringify(data));
}

export function loadTrustedDevice(): TrustedDeviceData | null {
  try {
    const raw = localStorage.getItem(TRUSTED_DEVICE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as TrustedDeviceData;
    if (!data.phone || !data.deviceToken || data.expiresAt < Date.now()) {
      localStorage.removeItem(TRUSTED_DEVICE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearTrustedDevice(): void {
  localStorage.removeItem(TRUSTED_DEVICE_KEY);
}

// ── Supabase session — uses async SDK (not raw localStorage scraping) ─────────

async function getSupabaseToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

// ── Cookie hint detection ─────────────────────────────────────────────────────
// `portal_session` is HttpOnly (invisible to JS).
// The server also sets `portal_session_hint=1` (non-httponly) as a JS-readable signal.

function hasCookieSession(): boolean {
  try {
    return document.cookie.split(";").some((c) => c.trim().startsWith("portal_session_hint=1"));
  } catch {
    return false;
  }
}

// ── Legacy localStorage token (kept for backward compat) ─────────────────────

export function getDevToken(): string | null {
  try { return localStorage.getItem(DEV_TOKEN_KEY); } catch { return null; }
}

export function setDevToken(token: string): void {
  localStorage.setItem(DEV_TOKEN_KEY, token);
}

/**
 * Synchronous token read — for legacy Bearer sessions.
 * New cookie-based sessions return null here (use hasCookieSession() instead).
 */
export function getAuthToken(): string | null {
  try {
    const ours = localStorage.getItem(TOKEN_KEY);
    if (ours) return ours;
    const dev = getDevToken();
    if (dev) return dev;
  } catch { /* storage blocked */ }
  return null;
}

/** Async version — resolves Supabase session if no custom token is stored. */
export async function getAuthTokenAsync(): Promise<string | null> {
  const ours = getAuthToken();
  if (ours) return ours;
  return getSupabaseToken();
}

/**
 * setAuthToken — LEGACY ONLY.
 * New logins should NOT call this; the server sets the HttpOnly cookie directly.
 * Kept for dev-login and Supabase OAuth flows that still use Bearer.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  // C1 FIX: Otomatis persist ke HttpOnly cookie di backend (non-blocking, non-fatal).
  // Semua caller (login, register, OTP) langsung mendapat cookie tanpa perubahan tersendiri.
  persistAuthCookie(token);
}

/**
 * C1 FIX: Setelah login, simpan token sebagai HttpOnly cookie di server.
 * Cookie is the only browser-session proof used by protected UI routes.
 */
export async function persistAuthCookie(token: string): Promise<void> {
  try {
    const response = await fetch("/api/portal/auth/set-cookie", {
      method: "POST",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Cookie session setup failed (${response.status})`);
  } catch {
    // Deliberately fail closed: without the server session cookie the UI
    // remains unauthenticated even if a legacy token exists in storage.
  }
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(DEV_TOKEN_KEY);
  clearPortalAuthBootstrap();
  clearTrustedDevice();
  // C1 FIX: hapus HttpOnly cookie via server endpoint (best-effort)
  fetch("/api/portal/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  if (supabase) supabase.auth.signOut().catch(() => {});
}

export function clearPortalAuthBootstrap(): void {
  portalAuthBootstrapCache = null;
  portalAuthBootstrapInFlight = null;
}

export function getCachedPortalAuthBootstrap(): PortalAuthBootstrap | null {
  return portalAuthBootstrapCache;
}

function storePortalAuthBootstrap(data: PortalAuthBootstrap): PortalAuthBootstrap {
  portalAuthBootstrapCache = data;
  setPortalProfile({
    customerId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
  });
  return data;
}

/**
 * Resolve all post-auth routing state with one server-side request.
 * The in-flight/cache layer only prevents duplicate requests during the same
 * browser transition; it is never used by API authorization.
 */
export async function fetchPortalAuthBootstrap(
  requestedReturnTo?: string | null,
  options?: { force?: boolean },
): Promise<PortalAuthBootstrap | null> {
  const force = options?.force === true;
  if (force) {
    // A bootstrap request started while /login was rendering can still be
    // in-flight when the user finishes logging in. Do not let that old 401
    // win over the newly-created session cookie.
    portalAuthBootstrapCache = null;
    portalAuthBootstrapInFlight = null;
  } else {
    if (portalAuthBootstrapCache && !requestedReturnTo) return portalAuthBootstrapCache;
    if (portalAuthBootstrapInFlight) return portalAuthBootstrapInFlight;
  }

  const token = hasCookieSession() ? null : await getSupabaseToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const query = requestedReturnTo
    ? `?returnTo=${encodeURIComponent(requestedReturnTo)}`
    : "";

  portalAuthBootstrapInFlight = fetch(`/api/portal/auth/bootstrap${query}`, {
    headers,
    credentials: "include",
  })
    .then(async (res) => {
      if (res.status === 401 || res.status === 403) {
        removeAuthToken();
        return null;
      }
      if (!res.ok) return null;
      return storePortalAuthBootstrap(await res.json() as PortalAuthBootstrap);
    })
    .catch(() => null)
    .finally(() => {
      portalAuthBootstrapInFlight = null;
    });

  return portalAuthBootstrapInFlight;
}

/**
 * Returns Authorization header for Bearer-based (legacy) sessions.
 * For cookie-based sessions, returns {} — the cookie is sent automatically
 * by the browser when credentials:'include' is used.
 */
export function getAuthHeaders(): { Authorization?: string } {
  const token = getAuthToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

/**
 * isAuthenticated — checks the server-issued cookie hint or a successful
 * canonical bootstrap cached during this browser transition.
 *
 * The hint is not an authorization credential; every protected API still
 * validates the session. The bootstrap cache is only useful after the server
 * has already verified the HttpOnly cookie, including legacy sessions that do
 * not have the readable hint cookie.
 */
export function isAuthenticated(): boolean {
  return hasCookieSession() || portalAuthBootstrapCache !== null;
}

export function getPortalProfile(): PortalProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PortalProfile;
  } catch {
    return null;
  }
}

export function setPortalProfile(profile: PortalProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getPortalRole(): string {
  return getPortalProfile()?.role ?? "guest";
}

export function isPortalAdmin(): boolean {
  return getPortalRole() === "admin";
}

/**
 * fetchAndStoreProfile — always uses credentials:'include' so cookie sessions work.
 * Supabase Bearer sessions are supported during migration, but a stale custom
 * portal token is never sent when the server cookie hint is present.
 */
export async function fetchAndStoreProfile(): Promise<PortalProfile | null> {
  const token = hasCookieSession() ? null : await getSupabaseToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch("/api/portal/auth/me", {
      headers,
      credentials: "include", // always include cookies
    });
    // Token invalid/expired — clear session so user is forced to login again
    if (res.status === 401 || res.status === 403) {
      removeAuthToken();
      // Also clear server cookie via logout endpoint
      fetch("/api/portal/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json() as { id: number; role: string; name: string; email: string };
    const profile: PortalProfile = {
      customerId: data.id,
      role: data.role,
      name: data.name,
      email: data.email,
    };
    setPortalProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

/**
 * logout — clears localStorage AND server cookie session.
 * Call this from all logout handlers (Navbar, MobileBottomNav).
 */
export async function logout(): Promise<void> {
  removeAuthToken();
  clearPortalAuthBootstrap();
  try {
    await fetch("/api/portal/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // Best-effort server-side cookie clear
  }
}
