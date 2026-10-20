import pg from "pg";
import { runMigrations, runSeeds } from "../../src/db/sql-runner.js";

/*
 * Integration tests run against TEST_DATABASE_URL and are skipped when it is unset.
 * The database name must end in `_test`, because tests wipe the public schema.
 */
export const testDatabaseUrl = process.env.TEST_DATABASE_URL;
export const hasTestDatabase = testDatabaseUrl !== undefined && new URL(testDatabaseUrl).pathname.endsWith("_test");

/** Fresh schema + seed data. */
export async function createSeededTestDatabase(): Promise<pg.Pool> {
  const pool = new pg.Pool({ connectionString: testDatabaseUrl, max: 5 });
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await runMigrations(pool);
  await runSeeds(pool);
  return pool;
}
