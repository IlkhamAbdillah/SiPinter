import { createPool } from "../config/database.js";
import { getEnv } from "../config/env.js";
import { runMigrations } from "./sql-runner.js";

const pool = createPool(getEnv());
try {
  const applied = await runMigrations(pool);
  console.log(applied.length > 0 ? `Applied migrations:\n  ${applied.join("\n  ")}` : "Database is up to date.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
