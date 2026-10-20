import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Load the repository-level .env (if present) so integration tests can find TEST_DATABASE_URL.
const rootEnv = new URL("../../.env", import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Database integration tests share one test database, so run files one at a time.
    fileParallelism: false,
  },
});
