import { beforeEach, describe, expect, it } from "vitest";
import { resolveGoogleLogin } from "../server/auth-providers.mjs";
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
  let nextIdentityId = Math.max(0, ...identities.map((record) => record.id)) + 1;

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
      }
      return { rows: normalizedSql.startsWith("update ") ? [] : rows.slice(0, 1) };
    }

    if (normalizedSql.startsWith("update public.portal_auth_identities")) {
      const record = identities.find((item) => item.id === Number(values[0]));
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

    if (normalizedSql.startsWith("update public.portal_customers")) {
      const record = users.find((item) => item.id === Number(values[0]));
      if (record) {
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

  return { db, users, identities };
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

  it("fails closed when a different Google subject is already bound", async () => {
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
});