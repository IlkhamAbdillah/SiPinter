import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Database } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { originCheck } from "./middlewares/origin-check.js";
import { answerSheetsRoutes } from "./modules/answer-sheets/answer-sheets.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { examsRoutes } from "./modules/exams/exams.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { studentsRoutes } from "./modules/students/students.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";

export type AppOptions = {
  db: Database;
  corsOrigins: string[];
  /** Public origin of the web app, e.g. https://sipinter.example.com. */
  appOrigin?: string;
  sessionTtlHours?: number;
  /** Production: cookies are HTTPS-only and use the `__Host-` prefix. */
  secureCookies?: boolean;
  /** Set when running behind Nginx/a load balancer so req.ip and req.secure are correct. */
  trustProxy?: boolean;
};

export function createApp({
  db,
  corsOrigins,
  appOrigin = "http://localhost:3000",
  sessionTtlHours = 12,
  secureCookies = false,
  trustProxy = false,
}: AppOptions) {
  const app = express();
  // `__Host-` cookies must be Secure, Path=/ and have no Domain, so they cannot be set by subdomains.
  const sessionCookie = secureCookies ? "__Host-sipinter_session" : "sipinter_session";

  app.disable("x-powered-by");
  if (trustProxy) app.set("trust proxy", 1);

  app.use(helmet());
  // CORS is only needed when a browser on another origin calls the API directly.
  // With no configured origins, no CORS headers are sent and cross-origin browser calls are blocked.
  if (corsOrigins.length > 0) {
    app.use(cors({ origin: corsOrigins, credentials: true }));
  }
  app.use(originCheck([appOrigin, ...corsOrigins]));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/health", healthRoutes(db));
  app.use(
    "/api/auth",
    authRoutes({ db, sessionCookie, sessionTtlMs: sessionTtlHours * 60 * 60 * 1000, secureCookies }),
  );
  app.use("/api/users", usersRoutes(db, sessionCookie));
  app.use("/api/students", studentsRoutes(db, sessionCookie));
  app.use("/api/exams", examsRoutes(db, sessionCookie));
  app.use("/api/answer-sheets", answerSheetsRoutes(db, sessionCookie));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
