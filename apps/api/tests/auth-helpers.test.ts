import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { readCookie } from "../src/lib/cookies.js";
import { RateLimiter } from "../src/lib/rate-limiter.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { originCheck } from "../src/middlewares/origin-check.js";
import { hashPassword, verifyPassword } from "../src/modules/auth/password.js";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^scrypt\$32768\$8\$3\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    expect(hash).not.toContain("correct horse battery");
    await expect(verifyPassword("correct horse battery", hash)).resolves.toBe(true);
    await expect(verifyPassword("correct horse batterY", hash)).resolves.toBe(false);
  });

  it("uses a random salt per hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed or legacy stored values instead of throwing", async () => {
    await expect(verifyPassword("dummy_hash_001", "dummy_hash_001")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$0$8$3$abc$def")).resolves.toBe(false);
  });
});

describe("RateLimiter", () => {
  it("blocks after max hits until the window resets", () => {
    let now = 0;
    const limiter = new RateLimiter(2, 60_000, () => now);
    limiter.record("k");
    expect(limiter.retryAfter("k")).toBe(0);
    limiter.record("k");
    expect(limiter.retryAfter("k")).toBe(60);
    now = 30_000;
    expect(limiter.retryAfter("k")).toBe(30);
    now = 60_000;
    expect(limiter.retryAfter("k")).toBe(0);
  });

  it("can be reset for a key", () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.record("k");
    limiter.reset("k");
    expect(limiter.retryAfter("k")).toBe(0);
  });
});

describe("readCookie", () => {
  it("finds a cookie by exact name", () => {
    expect(readCookie("a=1; sipinter_session=abc%2Fdef; b=2", "sipinter_session")).toBe("abc/def");
    expect(readCookie("xsipinter_session=nope", "sipinter_session")).toBeUndefined();
    expect(readCookie(undefined, "sipinter_session")).toBeUndefined();
  });
});

describe("originCheck", () => {
  const app = express();
  app.use(originCheck(["http://localhost:3000"]));
  app.all("/x", (_req, res) => {
    res.json({ data: "ok" });
  });
  app.use(errorHandler);

  it("allows same-origin and Origin-less state-changing requests", async () => {
    expect((await request(app).post("/x").set("Origin", "http://localhost:3000")).status).toBe(200);
    expect((await request(app).post("/x")).status).toBe(200);
  });

  it("allows safe methods from any origin", async () => {
    expect((await request(app).get("/x").set("Origin", "https://evil.example.com")).status).toBe(200);
  });

  it("rejects state-changing requests from foreign origins", async () => {
    for (const method of ["post", "put", "patch", "delete"] as const) {
      const res = await request(app)[method]("/x").set("Origin", "https://evil.example.com");
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("INVALID_ORIGIN");
    }
    expect((await request(app).post("/x").set("Origin", "null")).status).toBe(403);
  });
});
