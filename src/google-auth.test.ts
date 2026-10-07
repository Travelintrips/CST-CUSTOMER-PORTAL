import { beforeEach, describe, expect, it, vi } from "vitest";
import { authCapabilities, createOrFindEmailUser, googleRedirectUri, resolveGoogleLogin, resolveGoogleOAuthConfig, resolveSmtpConfig } from "../server/auth-providers.mjs";
import { sessionCookies, verifySession } from "../server/session.mjs";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string;
  customer_type: string | null;
  account_status: string | null;
  oauth_provider?: string | null;
  oauth_id?: string | null;
};

type Identity = {
  id: number;
  customer_id: number;
  provider: string;
  subject: string;
};

function user(overrides: Partial<User> = {}): User {
  return {
    id: 7,
    name: "Portal User",
    email: "user@example.com",
    phone: null,
    company: null,
    role: "customer",
    customer_type: "individual",
    account_status: "active",
    oauth_provider: "password",
    oauth_id: null,
    ...overrides,
  };
}

function googleProfile(overrides: Record<string, unknown> = {}) {
  return {
    subject: "google-subject-1",
    email: "user@example.com",
    name: "Google User",
    avatarUrl: null,
    emailVerified: true,
    ...overrides,
  };
}

function fakeDb(initialUsers: User[] = [user()], initialIdentities: Identity[] = []) {
  const users = initialUsers.map((record) => ({ ...record }));
  const identities = initialIdentities.map((record) => ({ ...record }));
  const profiles: Array<{
    id: number;
    customer_id: number;
    company_name: string | null;
    pic_name: string | null;
    pic_whatsapp: string | null;
    profile_status: string;
  }> = [];
  const vendorProfiles: Array<{
    id: number;
    customer_id: number;
    company_name: string | null;
    pic_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    verification_status: string;
  }> = [];
  let nextIdentityId = Math.max(0, ...identities.map((record) => record.id)) + 1;
  let nextUserId = Math.max(0, ...users.map((record) => record.id)) + 1;
  let nextProfileId = 1;
  let nextVendorProfileId = 1;

  const db = async (sql: string, values: unknown[] = []) => {
    const normalizedSql = sql.replace(/\s+/g, " ").trim().toLowerCase();

    if (normalizedSql.includes("from public.portal_auth_identities")) {
      let rows = identities;
      if (normalizedSql.includes("where lower(trim(provider)) = 'google'")) {
        rows = rows.filter(
          (record) => record.provider.trim().toLowerCase() === "google"
            && record.subject === String(values[0]),
        );
      } else if (
        normalizedSql.includes("where lower(trim(provider)) = $1 and subject = $2")
      ) {
        rows = rows.filter(
          (record) => record.provider.trim().toLowerCase() === String(values[0])
            && record.subject === String(values[1]),
        );
      } else if (
        normalizedSql.includes("where customer_id = $1 and lower(trim(provider)) = $2")
      ) {
        rows = rows.filter(
          (record) => record.customer_id === Number(values[0])
            && record.provider.trim().toLowerCase() === String(values[1]),
        );
      } else if (
        normalizedSql.includes("where customer_id = $1 and lower(trim(provider)) = 'google'")
      ) {
        rows = rows.filter(
          (record) => record.customer_id === Number(values[0])
            && record.provider.trim().toLowerCase() === "google",
        );
      }
      return { rows: normalizedSql.startsWith("update ") ? [] : rows.slice(0, 1) };
    }

    if (normalizedSql.startsWith("update public.portal_auth_identities")) {
      const record = identities.find((item) => item.id === Number(values[0]));
      if (normalizedSql.includes("set subject = $2")) {
        if (record && record.subject === String(values[2])) {
          record.subject = String(values[1]);
          return { rows: [{ id: record.id }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: record ? 1 : 0 };
    }

    if (normalizedSql.startsWith("select id, name, email")) {
      if (normalizedSql.includes("where id = $1")) {
        return { rows: users.filter((record) => record.id === Number(values[0])).slice(0, 1) };
      }
      if (normalizedSql.includes("where lower(email) = $1")) {
        return {
          rows: users.filter((record) => record.email.toLowerCase() === String(values[0])).slice(0, 1),
        };
      }
    }

    if (normalizedSql.includes("from public.portal_customer_profiles")) {
      const rows = profiles
        .filter((record) => record.customer_id === Number(values[0]))
        .sort((a, b) => b.id - a.id);
      return { rows: rows.slice(0, 1) };
    }

    if (normalizedSql.startsWith("insert into public.portal_customer_profiles")) {
      const record = {
        id: nextProfileId++,
        customer_id: Number(values[0]),
        company_name: values[1] == null ? null : String(values[1]),
        pic_name: values[2] == null ? null : String(values[2]),
        pic_whatsapp: values[3] == null ? null : String(values[3]),
        profile_status: "incomplete",
      };
      profiles.push(record);
      return { rows: [{ id: record.id, profile_status: record.profile_status }], rowCount: 1 };
    }

    if (normalizedSql.includes("from public.vendor_profiles")) {
      const rows = vendorProfiles
        .filter((record) => record.customer_id === Number(values[0]))
        .sort((a, b) => b.id - a.id);
      return { rows: rows.slice(0, 1) };
    }

    if (normalizedSql.startsWith("insert into public.vendor_profiles")) {
      const record = {
        id: nextVendorProfileId++,
        customer_id: Number(values[0]),
        company_name: values[1] == null ? null : String(values[1]),
        pic_name: values[2] == null ? null : String(values[2]),
        phone: values[3] == null ? null : String(values[3]),
        whatsapp: values[3] == null ? null : String(values[3]),
        email: values[4] == null ? null : String(values[4]),
        verification_status: "unverified",
      };
      vendorProfiles.push(record);
      return { rows: [{ id: record.id, verification_status: record.verification_status }], rowCount: 1 };
    }

    if (normalizedSql.startsWith("insert into public.portal_customers")) {
      const isGoogleInsert = normalizedSql.includes("oauth_provider");
      const record: User = isGoogleInsert
        ? {
            id: nextUserId++,
            name: String(values[0]),
            email: String(values[1]),
            phone: null,
            company: values[4] == null ? null : String(values[4]),
            role: String(values[2]),
            customer_type: values[3] == null ? null : String(values[3]),
            account_status: "active",
            oauth_provider: "google",
            oauth_id: String(values[5]),
          }
        : {
            id: nextUserId++,
            name: String(values[0]),
            email: String(values[1]),
            phone: null,
            company: values[4] == null ? null : String(values[4]),
            role: String(values[2]),
            customer_type: values[3] == null ? null : String(values[3]),
            account_status: "active",
            oauth_provider: "email",
            oauth_id: null,
          };
      if (users.some((item) => item.email.toLowerCase() === record.email.toLowerCase())) {
        const error = new Error("duplicate user") as Error & { code?: string };
        error.code = "23505";
        throw error;
      }
      users.push(record);
      return { rows: [{ ...record }], rowCount: 1 };
    }

    if (normalizedSql.startsWith("update public.portal_customers")) {
      const record = users.find((item) => item.id === Number(values[0]));
      if (record) {
        if (normalizedSql.includes("oauth_id = $2")) {
          record.oauth_id = String(values[1]);
          return { rows: [], rowCount: 1 };
        }
        record.oauth_provider ??= "google";
        record.oauth_id ??= String(values[2]);
      }
      return { rows: [], rowCount: record ? 1 : 0 };
    }

    if (normalizedSql.startsWith("insert into public.portal_auth_identities")) {
      const customerId = Number(values[0]);
      const provider = String(values[1]);
      const subject = String(values[2]);
      if (identities.some(
        (record) => record.provider.trim().toLowerCase() === provider.toLowerCase()
          && (record.subject === subject || record.customer_id === customerId),
      )) {
        const error = new Error("duplicate identity") as Error & { code?: string };
        error.code = "23505";
        throw error;
      }
      identities.push({ id: nextIdentityId++, customer_id: customerId, provider, subject });
      return { rows: [], rowCount: 1 };
    }

    throw new Error(`Unhandled fake query: ${sql}`);
  };

  return { db, users, identities, profiles, vendorProfiles };
}

describe("canonical Google identity linking", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "google-auth-regression-test-secret";
    process.env.APP_ENV = "production";
    process.env.NODE_ENV = "production";
  });

  it("links an existing password customer and creates a valid portal session", async () => {
    const state = fakeDb([user({ oauth_provider: "password" })]);

    const result = await resolveGoogleLogin(googleProfile(), state.db);
    const session = verifySession(result.token);

    expect(result.user.id).toBe(7);
    expect(state.identities).toEqual([
      expect.objectContaining({ customer_id: 7, provider: "google", subject: "google-subject-1" }),
    ]);
    expect(session).toMatchObject({ id: 7, email: "user@example.com", role: "customer" });
    expect(sessionCookies(result.token)[0]).toContain("portal_session=");
  });

  it("links an Email OTP customer without treating email as an exclusive provider", async () => {
    const state = fakeDb(
      [user({ oauth_provider: "email" })],
      [{ id: 1, customer_id: 7, provider: "email", subject: "user@example.com" }],
    );

    const result = await resolveGoogleLogin(googleProfile(), state.db);

    expect(result.user.id).toBe(7);
    expect(state.identities).toHaveLength(2);
    expect(state.identities.map((identity) => identity.provider)).toEqual(["email", "google"]);
  });

  it("treats repeated Google login as idempotent", async () => {
    const state = fakeDb();

    const first = await resolveGoogleLogin(googleProfile(), state.db);
    const second = await resolveGoogleLogin(googleProfile(), state.db);

    expect(first.user.id).toBe(second.user.id);
    expect(state.identities.filter((identity) => identity.provider === "google")).toHaveLength(1);
    expect(verifySession(second.token)).toMatchObject({ id: 7 });
  });

  it("migrates a stale legacy Google subject for the same verified email", async () => {
    const state = fakeDb(
      [user({ oauth_provider: "google", oauth_id: "different-subject" })],
      [{ id: 1, customer_id: 7, provider: "google", subject: "different-subject" }],
    );

    const result = await resolveGoogleLogin(googleProfile(), state.db);

    expect(result.user.id).toBe(7);
    expect(state.users[0].oauth_id).toBe("google-subject-1");
    expect(state.identities).toEqual([
      expect.objectContaining({ customer_id: 7, provider: "google", subject: "google-subject-1" }),
    ]);
  });

  it("fails closed when a password customer has a conflicting Google identity", async () => {
    const state = fakeDb(
      [user({ oauth_provider: "password" })],
      [{ id: 1, customer_id: 7, provider: "google", subject: "different-subject" }],
    );

    await expect(resolveGoogleLogin(googleProfile(), state.db))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(state.identities).toHaveLength(1);
  });

  it("rejects an unverified Google email before identity linking", async () => {
    const state = fakeDb();

    await expect(resolveGoogleLogin(
      googleProfile({ emailVerified: false }),
      state.db,
    )).rejects.toMatchObject({
      statusCode: 401,
      oauthCode: "google_profile_invalid",
    });
    expect(state.identities).toHaveLength(0);
  });

  it("creates a new Google vendor with the selected registration role", async () => {
    const state = fakeDb([]);
    const result = await resolveGoogleLogin(
      googleProfile({ email: "vendor@example.com", name: "Vendor Baru" }),
      state.db,
      { role: "vendor", company: "PT Vendor Baru" },
    );

    expect(result.user).toMatchObject({
      email: "vendor@example.com",
      role: "vendor",
      company: "PT Vendor Baru",
      customerType: null,
    });
    expect(verifySession(result.token)).toMatchObject({ role: "vendor" });
    expect(state.profiles).toEqual([
      expect.objectContaining({
        customer_id: result.user.id,
        company_name: "PT Vendor Baru",
        profile_status: "incomplete",
      }),
    ]);
    expect(state.vendorProfiles).toEqual([
      expect.objectContaining({
        customer_id: result.user.id,
        company_name: "PT Vendor Baru",
        email: "vendor@example.com",
        verification_status: "unverified",
      }),
    ]);
  });

  it("does not change the role of an existing account from registration intent", async () => {
    const state = fakeDb([user({ role: "customer", company: null })]);

    const result = await resolveGoogleLogin(
      googleProfile(),
      state.db,
      { role: "vendor", company: "PT Should Not Replace" },
    );

    expect(result.user.role).toBe("customer");
    expect(result.user.company).toBeNull();
  });
});

describe("registration role creation", () => {
  it("creates a new Email OTP vendor with company context", async () => {
    const state = fakeDb([]);
    const created = await createOrFindEmailUser(
      "email-vendor@example.com",
      { role: "vendor", company: "PT Email Vendor" },
      state.db,
    );

    expect(created.isNew).toBe(true);
    expect(created.user).toMatchObject({
      email: "email-vendor@example.com",
      role: "vendor",
      company: "PT Email Vendor",
      customer_type: null,
    });
    expect(state.profiles).toEqual([
      expect.objectContaining({
        customer_id: created.user?.id,
        company_name: "PT Email Vendor",
        profile_status: "incomplete",
      }),
    ]);
    expect(state.vendorProfiles).toEqual([
      expect.objectContaining({
        customer_id: created.user?.id,
        company_name: "PT Email Vendor",
        email: "email-vendor@example.com",
        verification_status: "unverified",
      }),
    ]);
  });

  it("creates a company customer with customer_type company", async () => {
    const state = fakeDb([]);
    const created = await createOrFindEmailUser(
      "company@example.com",
      { role: "customer", customerType: "company", company: "PT Customer Company" },
      state.db,
    );

    expect(created.user).toMatchObject({
      role: "customer",
      customer_type: "company",
      company: "PT Customer Company",
    });
    expect(state.profiles).toEqual([
      expect.objectContaining({
        customer_id: created.user?.id,
        company_name: "PT Customer Company",
        profile_status: "incomplete",
      }),
    ]);
  });
});

describe("Email OTP production capability", () => {
  beforeEach(() => {
    process.env.APP_ENV = "production";
    process.env.NODE_ENV = "production";
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_HOST;
    delete process.env["SMTP-HOST"];
    delete process.env.SMTP_PORT;
  });

  it("restores SMTP credentials from app_config when runtime env is missing", async () => {
    const config = await resolveSmtpConfig(async () => ({
      rows: [
        { key: "SMTP_FROM", value: " info@cstlogistic.co.id " },
        { key: "SMTP_PASS", value: "db-mail-secret" },
      ],
    }) as any);

    expect(config).toMatchObject({
      from: "info@cstlogistic.co.id",
      user: "info@cstlogistic.co.id",
      pass: "db-mail-secret",
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
    });
  });
});

describe("Google OAuth production capability", () => {
  beforeEach(() => {
    process.env.APP_ENV = "production";
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";
    delete process.env.GOOGLE_REDIRECT_BASE_URL;

    // Keep authCapabilities fully isolated from a real database/network during unit tests.
    // Google capability assertions are not tests of SMTP or Fonnte connectivity.
    process.env.SMTP_FROM = "test@example.com";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "test-smtp-secret";
    process.env.CUSTOMER_PORTAL_FONNTE_TOKEN = "test-fonnte-token";
  });

  it("restores Google OAuth credentials from app_config when runtime env is missing", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REDIRECT_BASE_URL;

    const config = await resolveGoogleOAuthConfig(async () => ({
      rows: [
        { key: "GOOGLE_CLIENT_ID", value: "db-client.apps.googleusercontent.com" },
        { key: "GOOGLE_CLIENT_SECRET", value: "db-secret" },
        { key: "GOOGLE_REDIRECT_BASE_URL", value: "https://cstlogistic.co.id/api/callback/google" },
      ],
    }) as any);

    expect(config).toEqual({
      clientId: "db-client.apps.googleusercontent.com",
      clientSecret: "db-secret",
      redirectBaseUrl: "https://cstlogistic.co.id/api/callback/google",
    });
  });

  it("prefers one complete Hostinger Google credential set in production", async () => {
    process.env.GOOGLE_CLIENT_ID = "env-client.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "env-secret";
    process.env.GOOGLE_REDIRECT_BASE_URL = "https://cstlogistic.co.id/api/callback/google";

    const config = await resolveGoogleOAuthConfig(async () => ({
      rows: [
        { key: "GOOGLE_CLIENT_ID", value: "db-client.apps.googleusercontent.com" },
        { key: "GOOGLE_CLIENT_SECRET", value: "db-secret" },
        { key: "GOOGLE_REDIRECT_BASE_URL", value: "https://cstlogistic.co.id/api/callback/google" },
      ],
    }) as any);

    expect(config).toEqual({
      clientId: "env-client.apps.googleusercontent.com",
      clientSecret: "env-secret",
      redirectBaseUrl: "https://cstlogistic.co.id/api/callback/google",
    });
  });

  it("keeps Google login enabled when Google accepts the credential pair", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ error: "invalid_grant" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ status: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    try {
      const capabilities = await authCapabilities();
      expect(capabilities.google).toBe(true);
      expect(capabilities.providerStatus.google).toBe("gis_configured");
      expect(capabilities.providerStatus.googlePrimary).toBe("google_identity_services");
      expect(capabilities.providerStatus.legacyGoogleOauth).toBe("configured");
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("keeps GIS enabled when legacy OAuth client-secret exchange is invalid", async () => {
    process.env.GOOGLE_CLIENT_ID = "653506647312-eajc61u3gmc4ssig7cf4phhpkohk7lhe.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "GOCSPX-test-invalid-but-well-formed-secret";
    process.env.GOOGLE_REDIRECT_BASE_URL = "https://cstlogistic.co.id/api/callback/google";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("oauth2.googleapis.com/token")) {
        return new Response(JSON.stringify({ error: "invalid_client" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    try {
      const capabilities = await authCapabilities();
      expect(capabilities.google).toBe(true);
      expect(capabilities.googleClientId).toBe(process.env.GOOGLE_CLIENT_ID);
      expect(capabilities.providerStatus.google).toBe("gis_configured");
      expect(capabilities.providerStatus.googlePrimary).toBe("google_identity_services");
      expect(capabilities.providerStatus.legacyGoogleOauth).toBe("invalid_client");
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("derives the HTTPS Google callback from forwarded production origin", () => {
    const request = {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "cstlogistic.co.id",
      },
    } as any;

    expect(googleRedirectUri(request)).toBe(
      "https://cstlogistic.co.id/api/callback/google",
    );
  });

  it("fails closed when an explicit redirect override is invalid", () => {
    process.env.GOOGLE_REDIRECT_BASE_URL = "http://cstlogistic.co.id";
    const request = {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "cstlogistic.co.id",
      },
    } as any;

    expect(() => googleRedirectUri(request)).toThrow(
      "Konfigurasi callback Google production harus menggunakan HTTPS.",
    );
  });
});
