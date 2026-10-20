import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "../config/database.js";
import { withTransaction } from "../config/database.js";

/** `database/` at the repository root (same relative location from src/ and dist/). */
export const DATABASE_DIR = fileURLToPath(new URL("../../../../database/", import.meta.url));

const SQL_FILE_PATTERN = /^\d{4}_[a-z0-9_]+\.sql$/;
// Arbitrary constant shared by every migration run, so two deploys cannot migrate at once.
const MIGRATION_LOCK_KEY = 74_021_901;

type SqlFile = { name: string; sql: string; checksum: string };

async function readSqlFiles(dir: string): Promise<SqlFile[]> {
  const entries = await readdir(dir);
  const invalid = entries.filter((name) => name.endsWith(".sql") && !SQL_FILE_PATTERN.test(name));
  if (invalid.length > 0) {
    throw new Error(`SQL files must be named like 0001_description.sql: ${invalid.join(", ")}`);
  }

  const names = entries.filter((name) => SQL_FILE_PATTERN.test(name)).sort();
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(path.join(dir, name), "utf8");
      return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
    }),
  );
}

/**
 * Applies pending migrations in filename order. Each migration runs in its own transaction
 * and is recorded in `schema_migrations` with a checksum, so an applied file that was later
 * edited is reported instead of being silently ignored.
 */
export async function runMigrations(db: Database, dir = path.join(DATABASE_DIR, "migrations")): Promise<string[]> {
  const files = await readSqlFiles(dir);
  const client = await db.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query<{ name: string; checksum: string }>(
      "SELECT name, checksum FROM schema_migrations",
    );
    const applied = new Map(rows.map((row) => [row.name, row.checksum]));

    for (const file of files) {
      const previous = applied.get(file.name);
      if (previous !== undefined && previous !== file.checksum) {
        throw new Error(
          `Migration ${file.name} was modified after it was applied. Revert the edit and add a new migration instead.`,
        );
      }
    }

    const pending = files.filter((file) => !applied.has(file.name));
    for (const file of pending) {
      try {
        await client.query("BEGIN");
        await client.query(file.sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [
          file.name,
          file.checksum,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw new Error(`Migration ${file.name} failed: ${error instanceof Error ? error.message : String(error)}`, {
          cause: error,
        });
      }
    }
    return pending.map((file) => file.name);
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]).catch(() => undefined);
    client.release();
  }
}

/** Runs every seed file in filename order inside a single transaction (all or nothing). */
export async function runSeeds(db: Database, dir = path.join(DATABASE_DIR, "seeds")): Promise<string[]> {
  const files = await readSqlFiles(dir);
  await withTransaction(db, async (client) => {
    for (const file of files) {
      try {
        await client.query(file.sql);
      } catch (error) {
        throw new Error(`Seed ${file.name} failed: ${error instanceof Error ? error.message : String(error)}`, {
          cause: error,
        });
      }
    }
  });
  return files.map((file) => file.name);
}
