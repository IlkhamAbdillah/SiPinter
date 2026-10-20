import type { CookieOptions } from "express";
import { Router } from "express";
import type { Database } from "../../config/database.js";
import { readCookie } from "../../lib/cookies.js";
import { HttpError } from "../../lib/http-error.js";
import { RateLimiter } from "../../lib/rate-limiter.js";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { type LoginInput, loginSchema } from "./auth.schema.js";
import { login, logout } from "./auth.service.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export type AuthRoutesOptions = {
  db: Database;
  sessionCookie: string;
  sessionTtlMs: number;
  secureCookies: boolean;
};

export function authRoutes({ db, sessionCookie, sessionTtlMs, secureCookies }: AuthRoutesOptions): Router {
  const router = Router();
  // Brute-force protection: failed attempts per (IP, email), plus all attempts per IP.
  const failedLogins = new RateLimiter(5, FIFTEEN_MINUTES);
  const loginAttempts = new RateLimiter(50, FIFTEEN_MINUTES);

  const cookieOptions: CookieOptions = {
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal the session
    secure: secureCookies, // HTTPS only in production
    sameSite: "lax", // not sent on cross-site POST/PUT/DELETE (CSRF defence, with the Origin check)
    path: "/",
  };

  router.post("/login", validate({ body: loginSchema }), async (req, res) => {
    const { email, password } = res.locals.validated!.body as LoginInput;
    const ipKey = req.ip ?? "unknown";
    const failKey = `${ipKey}|${email}`;

    const retryAfter = Math.max(loginAttempts.retryAfter(ipKey), failedLogins.retryAfter(failKey));
    if (retryAfter > 0) {
      res.setHeader("Retry-After", String(retryAfter));
      throw new HttpError(429, "TOO_MANY_REQUESTS", "Too many login attempts. Try again later.");
    }
    loginAttempts.record(ipKey);

    const result = await login(db, email, password, sessionTtlMs);
    if (!result) {
      failedLogins.record(failKey);
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    failedLogins.reset(failKey);

    res.cookie(sessionCookie, result.token, { ...cookieOptions, expires: result.expiresAt });
    res.json({ data: { user: result.user, expires_at: result.expiresAt.toISOString() } });
  });

  router.post("/logout", async (req, res) => {
    const token = readCookie(req.headers.cookie, sessionCookie);
    if (token) await logout(db, token);
    res.clearCookie(sessionCookie, cookieOptions);
    res.status(204).end();
  });

  router.get("/me", requireAuth(db, sessionCookie), (_req, res) => {
    res.json({ data: res.locals.user });
  });

  return router;
}
