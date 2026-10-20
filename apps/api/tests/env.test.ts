import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/config/env.js";

const base = { DATABASE_URL: "postgres://user:secret@localhost:5432/sipinter" };

describe("parseEnv", () => {
  it("applies defaults for local development", () => {
    const env = parseEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: "development",
      PORT: 4000,
      DATABASE_SSL: "disable",
      CORS_ORIGINS: [],
      SESSION_TTL_HOURS: 12,
    });
  });

  it("parses a comma-separated CORS allowlist", () => {
    const env = parseEnv({ ...base, CORS_ORIGINS: "https://sipinter.example.com, http://localhost:3000" });
    expect(env.CORS_ORIGINS).toEqual(["https://sipinter.example.com", "http://localhost:3000"]);
  });

  it("rejects a missing or non-postgres DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/db" })).toThrow(/DATABASE_URL/);
  });

  it("rejects sslmode inside DATABASE_URL", () => {
    expect(() => parseEnv({ DATABASE_URL: `${base.DATABASE_URL}?sslmode=require` })).toThrow(/sslmode/);
  });

  it("requires a CA bundle for verify-full", () => {
    expect(() => parseEnv({ ...base, DATABASE_SSL: "verify-full" })).toThrow(/DATABASE_SSL_CA_PATH/);
  });

  it("refuses to run production without TLS", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "production" })).toThrow(/TLS must be enabled/);
    expect(() =>
      parseEnv({ ...base, NODE_ENV: "production", DATABASE_SSL: "require", APP_ORIGIN: "https://sipinter.example.com" }),
    ).not.toThrow();
  });

  it("requires APP_ORIGIN in production and defaults it in development", () => {
    expect(() => parseEnv({ ...base, NODE_ENV: "production", DATABASE_SSL: "require" })).toThrow(/APP_ORIGIN/);
    expect(parseEnv(base).APP_ORIGIN).toBe("http://localhost:3000");
  });

  it("never includes secret values in the error message", () => {
    expect(() => parseEnv({ DATABASE_URL: "postgres://user:hunter2@localhost/db?sslmode=disable" })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("hunter2") }),
    );
  });
});
