import type pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createSeededTestDatabase, hasTestDatabase } from "./helpers/test-database.js";

const ORIGIN = "http://localhost:3000";
const DEV_PASSWORD = "sipinter-dev";
const LECTURER = "budi.santoso@example.com";
const ADMIN = "andi.pratama@example.com";

describe.skipIf(!hasTestDatabase)("auth and users API (integration)", () => {
  let pool: pg.Pool;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    pool = await createSeededTestDatabase();
  });

  beforeEach(() => {
    // A fresh app per test also gives each test fresh rate-limit counters.
    app = createApp({ db: pool, corsOrigins: [], appOrigin: ORIGIN });
  });

  afterAll(async () => {
    await pool?.end();
  });

  async function loginAs(email: string, password = DEV_PASSWORD) {
    return request(app).post("/api/auth/login").set("Origin", ORIGIN).send({ email, password });
  }

  function sessionCookie(res: request.Response): string {
    const header = res.headers["set-cookie"] as unknown as string[];
    return header[0]!.split(";")[0]!;
  }

  it("logs in with valid credentials and sets a hardened session cookie", async () => {
    const res = await loginAs("  Budi.Santoso@Example.com ");
    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({
      lecturer_id: 1,
      name: "Budi Santoso",
      email: LECTURER,
      role: "lecturer",
    });
    expect(JSON.stringify(res.body)).not.toContain("scrypt");

    const cookie = (res.headers["set-cookie"] as unknown as string[])[0]!;
    expect(cookie).toMatch(/^sipinter_session=[A-Za-z0-9_-]{43};/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Expires=/);
  });

  it("stores only a hash of the session token", async () => {
    const token = sessionCookie(await loginAs(LECTURER)).split("=")[1]!;
    const { rows } = await pool.query("SELECT token_hash FROM sessions");
    expect(rows.some((row) => row.token_hash === token)).toBe(false);
    expect(rows.every((row) => /^[0-9a-f]{64}$/.test(row.token_hash))).toBe(true);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const wrongPassword = await loginAs(LECTURER, "not-the-password");
    const unknownEmail = await loginAs("nobody@example.com");
    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
      expect(res.headers["set-cookie"]).toBeUndefined();
    }
  });

  it("validates the login body", async () => {
    const res = await request(app).post("/api/auth/login").set("Origin", ORIGIN).send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rate-limits repeated failed logins", async () => {
    for (let i = 0; i < 5; i++) expect((await loginAs(LECTURER, "wrong-password")).status).toBe(401);
    const blocked = await loginAs(LECTURER); // even the right password is refused while blocked
    expect(blocked.status).toBe(429);
    expect(blocked.headers["retry-after"]).toMatch(/^\d+$/);
  });

  it("returns the current user for a valid session, 401 otherwise", async () => {
    const cookie = sessionCookie(await loginAs(LECTURER));
    const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(LECTURER);

    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    const forged = await request(app).get("/api/auth/me").set("Cookie", "sipinter_session=forged-token");
    expect(forged.status).toBe(401);
    expect(forged.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects expired sessions", async () => {
    const cookie = sessionCookie(await loginAs(LECTURER));
    await pool.query("UPDATE sessions SET created_at = now() - interval '2 days', expires_at = now() - interval '1 second'");
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(401);
  });

  it("logout deletes the session server-side and clears the cookie", async () => {
    const cookie = sessionCookie(await loginAs(LECTURER));
    const res = await request(app).post("/api/auth/logout").set("Origin", ORIGIN).set("Cookie", cookie);
    expect(res.status).toBe(204);
    expect((res.headers["set-cookie"] as unknown as string[])[0]).toMatch(/^sipinter_session=;.*Expires=Thu, 01 Jan 1970/);
    // Replaying the old cookie no longer works.
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(401);
  });

  it("rejects a cross-site logout/login attempt (CSRF)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Origin", "https://evil.example.com")
      .send({ email: LECTURER, password: DEV_PASSWORD });
    expect(res.status).toBe(403);
  });

  it("uses __Host- prefixed Secure cookies in production mode", async () => {
    const prodApp = createApp({ db: pool, corsOrigins: [], appOrigin: ORIGIN, secureCookies: true });
    const res = await request(prodApp)
      .post("/api/auth/login")
      .set("Origin", ORIGIN)
      .send({ email: LECTURER, password: DEV_PASSWORD });
    const cookie = (res.headers["set-cookie"] as unknown as string[])[0]!;
    expect(cookie).toMatch(/^__Host-sipinter_session=/);
    expect(cookie).toMatch(/Secure/);
  });

  describe("users (admin only)", () => {
    it("requires authentication", async () => {
      expect((await request(app).get("/api/users")).status).toBe(401);
    });

    it("forbids lecturers", async () => {
      const cookie = sessionCookie(await loginAs(LECTURER));
      const res = await request(app).get("/api/users").set("Cookie", cookie);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("lets admins list users without password hashes", async () => {
      const cookie = sessionCookie(await loginAs(ADMIN));
      const res = await request(app).get("/api/users").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(JSON.stringify(res.body)).not.toMatch(/password|scrypt/);
    });

    it("lets admins create an account that can then log in", async () => {
      const cookie = sessionCookie(await loginAs(ADMIN));
      const created = await request(app)
        .post("/api/users")
        .set("Origin", ORIGIN)
        .set("Cookie", cookie)
        .send({ name: "Dosen Baru", email: "Dosen.Baru@Example.com", role: "lecturer", password: "rahasia-baru-123" });
      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({ email: "dosen.baru@example.com", role: "lecturer" });

      expect((await loginAs("dosen.baru@example.com", "rahasia-baru-123")).status).toBe(200);
    });

    it("rejects duplicate emails, invalid roles and short passwords", async () => {
      const cookie = sessionCookie(await loginAs(ADMIN));
      const post = (body: object) =>
        request(app).post("/api/users").set("Origin", ORIGIN).set("Cookie", cookie).send(body);

      const duplicate = await post({ name: "Budi", email: LECTURER, role: "lecturer", password: "long-enough-pw" });
      expect(duplicate.status).toBe(409);
      expect(duplicate.body.error.code).toBe("EMAIL_TAKEN");

      const badRole = await post({ name: "S", email: "s@example.com", role: "student", password: "long-enough-pw" });
      expect(badRole.status).toBe(400);

      const shortPassword = await post({ name: "S", email: "s@example.com", role: "lecturer", password: "short" });
      expect(shortPassword.status).toBe(400);
    });

    it("forbids lecturers from creating accounts", async () => {
      const cookie = sessionCookie(await loginAs(LECTURER));
      const res = await request(app)
        .post("/api/users")
        .set("Origin", ORIGIN)
        .set("Cookie", cookie)
        .send({ name: "X", email: "x@example.com", role: "admin", password: "long-enough-pw" });
      expect(res.status).toBe(403);
    });
  });
});
