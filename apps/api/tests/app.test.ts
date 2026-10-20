import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createApp } from "../src/app.js";
import type { Database } from "../src/config/database.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { validate } from "../src/middlewares/validate.js";

function fakeDb(query: () => Promise<unknown>): Database {
  return { query, connect: () => Promise.reject(new Error("not used")) } as unknown as Database;
}

const healthyDb = fakeDb(() => Promise.resolve({ rows: [{ "?column?": 1 }] }));

describe("health endpoints", () => {
  it("GET /api/health reports the API is up without touching the database", async () => {
    const app = createApp({ db: fakeDb(() => Promise.reject(new Error("should not be called"))), corsOrigins: [] });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  it("GET /api/health/db reports database connectivity", async () => {
    const res = await request(createApp({ db: healthyDb, corsOrigins: [] })).get("/api/health/db");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok", database: "up" } });
  });

  it("GET /api/health/db returns 503 without leaking connection details", async () => {
    const db = fakeDb(() => Promise.reject(new Error("password authentication failed for user sipinter at 10.0.0.5")));
    const res = await request(createApp({ db, corsOrigins: [] })).get("/api/health/db");
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: { code: "DATABASE_UNAVAILABLE", message: "Database is unreachable" } });
    expect(JSON.stringify(res.body)).not.toMatch(/password|10\.0\.0\.5/);
  });
});

describe("error handling", () => {
  const app = createApp({ db: healthyDb, corsOrigins: [] });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 for malformed JSON bodies", async () => {
    const res = await request(app).post("/api/health").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "BAD_REQUEST", message: "Malformed request body" } });
  });

  it("hides unexpected errors behind a generic 500", async () => {
    const broken = express();
    broken.get("/boom", () => {
      throw new Error('relation "users" does not exist');
    });
    broken.use(errorHandler);
    const original = console.error;
    console.error = () => undefined;
    try {
      const res = await request(broken).get("/boom");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
    } finally {
      console.error = original;
    }
  });

  it("does not advertise Express", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("CORS", () => {
  it("sends no CORS headers when no origins are configured", async () => {
    const res = await request(createApp({ db: healthyDb, corsOrigins: [] }))
      .get("/api/health")
      .set("Origin", "https://evil.example.com");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows only configured origins", async () => {
    const app = createApp({ db: healthyDb, corsOrigins: ["https://sipinter.example.com"] });
    const allowed = await request(app).get("/api/health").set("Origin", "https://sipinter.example.com");
    expect(allowed.headers["access-control-allow-origin"]).toBe("https://sipinter.example.com");
    const denied = await request(app).get("/api/health").set("Origin", "https://evil.example.com");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("validate middleware", () => {
  const app = express();
  app.use(express.json());
  app.post(
    "/exams/:examId",
    validate({
      params: z.object({ examId: z.coerce.number().int().positive() }),
      body: z.object({ exam_name: z.string().trim().min(1) }),
    }),
    (_req, res) => {
      res.json({ data: res.locals.validated });
    },
  );
  app.use(errorHandler);

  it("passes parsed and coerced input to the handler", async () => {
    const res = await request(app).post("/exams/7").send({ exam_name: "  Basis Data  " });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ params: { examId: 7 }, body: { exam_name: "Basis Data" } });
  });

  it("rejects invalid input with field-level details", async () => {
    const res = await request(app).post("/exams/abc").send({ exam_name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: "params", path: "examId" }),
        expect.objectContaining({ location: "body", path: "exam_name" }),
      ]),
    );
  });
});
