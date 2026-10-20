import { readFileSync } from "node:fs";
import pg from "pg";
import type { Env } from "./env.js";

export type Database = Pick<pg.Pool, "query" | "connect">;
/** Anything that can run a query: the pool or a client inside a transaction. */
export type Queryable = Pick<pg.ClientBase, "query">;

function sslConfig(env: Env): pg.PoolConfig["ssl"] {
  switch (env.DATABASE_SSL) {
    case "disable":
      return false;
    case "require":
      return { rejectUnauthorized: false };
    case "verify-full":
      // AWS RDS: point DATABASE_SSL_CA_PATH at the RDS CA bundle (see README).
      return { rejectUnauthorized: true, ca: readFileSync(env.DATABASE_SSL_CA_PATH!, "utf8") };
  }
}

export function createPool(env: Env): pg.Pool {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: sslConfig(env),
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // Stop runaway queries instead of letting them hold a connection forever.
    statement_timeout: 15_000,
    application_name: "sipinter-api",
  });

  // An idle client can error (e.g. RDS failover). Log it without crashing the process;
  // the pool discards the broken client and opens a new one on demand.
  pool.on("error", (error) => {
    console.error("[db] idle client error:", error.message);
  });

  return pool;
}

/**
 * Runs `work` inside a transaction on a single pooled client.
 * Commits on success, rolls back on any thrown error, and always releases the client.
 */
export async function withTransaction<T>(db: Database, work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
