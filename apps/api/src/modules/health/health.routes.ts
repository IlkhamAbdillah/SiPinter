import { Router } from "express";
import type { Database } from "../../config/database.js";

const DB_CHECK_TIMEOUT_MS = 3_000;

export function healthRoutes(db: Database): Router {
  const router = Router();

  // Liveness: the API process is up. Does not touch the database,
  // so a database outage does not make orchestrators restart the API.
  router.get("/", (_req, res) => {
    res.json({ data: { status: "ok" } });
  });

  // Readiness: can the API reach PostgreSQL right now?
  router.get("/db", async (_req, res) => {
    try {
      await withTimeout(db.query("SELECT 1"), DB_CHECK_TIMEOUT_MS);
      res.json({ data: { status: "ok", database: "up" } });
    } catch (error) {
      console.error("[health] database check failed:", error instanceof Error ? error.message : error);
      res.status(503).json({ error: { code: "DATABASE_UNAVAILABLE", message: "Database is unreachable" } });
    }
  });

  return router;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
