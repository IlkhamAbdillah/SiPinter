import { createApp } from "./app.js";
import { createPool } from "./config/database.js";
import { getEnv } from "./config/env.js";

const env = getEnv();
const pool = createPool(env);
const app = createApp({
  db: pool,
  corsOrigins: env.CORS_ORIGINS,
  appOrigin: env.APP_ORIGIN,
  sessionTtlHours: env.SESSION_TTL_HOURS,
  secureCookies: env.NODE_ENV === "production",
  trustProxy: env.NODE_ENV === "production",
});

const server = app.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

let shuttingDown = false;
function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[api] ${signal} received, shutting down`);
  // Stop accepting connections, let in-flight requests finish, then close the pool.
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
