import { createPool } from "../config/database.js";
import { getEnv } from "../config/env.js";
import { runSeeds } from "./sql-runner.js";

const env = getEnv();
// Seeds empty every table before inserting demo data. Never allow that against production.
if (env.NODE_ENV === "production") {
  console.error("Refusing to seed: NODE_ENV=production. Seed data is for development and testing only.");
  process.exit(1);
}
// Guard against a development .env that points at the real RDS instance.
if (new URL(env.DATABASE_URL).hostname.endsWith(".rds.amazonaws.com") && process.env.ALLOW_RDS_SEED !== "true") {
  console.error("Refusing to seed an AWS RDS database. Set ALLOW_RDS_SEED=true if this is a disposable dev/test instance.");
  process.exit(1);
}

const pool = createPool(env);
try {
  const seeded = await runSeeds(pool);
  console.log(`Seeded:\n  ${seeded.join("\n  ")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
